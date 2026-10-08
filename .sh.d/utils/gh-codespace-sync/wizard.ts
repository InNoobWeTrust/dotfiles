import {
  OperationCancelled,
  type Action,
  type Catalog,
  type CodespacesApi,
  type Operation,
} from "./github";

/** Inline prompt boundary; null means cancellation or interruption. */
export interface WizardIO {
  choose(
    message: string,
    choices: { name: string; value: string }[],
  ): Promise<string | null>;
  pick(
    message: string,
    rows: string[],
    selected: Set<string>,
    allowAll: boolean,
    required: boolean,
  ): Promise<string[] | "back" | null>;
  log(message: string): void;
  stopped(): boolean;
}

// API names are validated too, but never allow terminal controls in diagnostics.
function safe(message: string): string {
  return message.replace(/[\x00-\x1f\x7f-\x9f]/g, " ");
}

type Choice = "next" | "back" | "quit";

async function pick(
  io: WizardIO,
  title: string,
  rows: string[],
  selected: Set<string>,
  allowAll: boolean,
  required = false,
): Promise<Choice> {
  while (!io.stopped()) {
    if (rows.length === 0) {
      const answer = await io.choose(`${title} — No entries available.`, [
        ...(!required
          ? [{ name: "Continue without repositories", value: "next" }]
          : []),
        { name: "Back", value: "back" },
        { name: "Cancel", value: "quit" },
      ]);
      return answer === "next" ? "next" : answer === "back" ? "back" : "quit";
    }
    const answer = await io.pick(title, rows, selected, allowAll, required);
    if (answer === null) return "quit";
    if (answer === "back") return "back";
    if (answer.some((name) => !rows.includes(name)))
      throw new Error("Selection is outside the current scope.");
    if (required && answer.length === 0) continue;
    selected.clear();
    answer.forEach((name) => selected.add(name));
    return "next";
  }
  return "quit";
}

function plan(
  action: Action,
  catalog: Catalog,
  names: Set<string>,
  owned: Set<string>,
  external: Set<string>,
): Operation[] {
  const repositories = catalog.repositories.filter(
    (repo) => owned.has(repo.name) || external.has(repo.name),
  );
  const operations: Operation[] = [];
  if (action === "upload")
    for (const name of names) operations.push({ kind: "upload", name });
  if (repositories.length > 0)
    for (const name of names)
      operations.push({ kind: "grant", name, repositories });
  return operations;
}

function label(operation: Operation): string {
  return operation.kind === "upload"
    ? `Upload ${operation.name}`
    : `Grant ${operation.name} to ${operation.repositories.length} selected repositories (preserve existing access)`;
}

async function execute(
  api: CodespacesApi,
  io: WizardIO,
  operations: Operation[],
): Promise<number> {
  let completed = 0;
  for (const operation of operations) {
    if (io.stopped()) break;
    io.log(`[${completed}/${operations.length}] ${safe(label(operation))}`);
    try {
      await api.execute(operation, () => io.stopped());
      completed++;
      io.log(`[${completed}/${operations.length}] Applied.`);
    } catch (error) {
      if (error instanceof OperationCancelled) break;
      io.log(
        `Stopped: ${error instanceof Error ? safe(error.message) : "GitHub operation failed."}`,
      );
      io.log(
        `${completed}/${operations.length} writes completed. Earlier writes remain applied; the last request may have an uncertain outcome.`,
      );
      return 1;
    }
  }
  if (completed < operations.length) {
    io.log(
      `Cancelled: ${completed}/${operations.length} writes completed. Earlier writes remain applied.`,
    );
    return 130;
  }
  io.log(`Done: ${completed}/${operations.length} writes completed.`);
  return 0;
}

async function discover(
  api: CodespacesApi,
  io: WizardIO,
  action: Action,
): Promise<Catalog | Choice> {
  while (!io.stopped()) {
    io.log("Loading entry names and repository scopes…");
    try {
      return await api.discover(action);
    } catch (error) {
      io.log(
        error instanceof Error ? safe(error.message) : "Discovery failed.",
      );
      while (!io.stopped()) {
        const answer = await io.choose("Discovery failed. What next?", [
          { name: "Retry", value: "retry" },
          { name: "Back to action", value: "back" },
          { name: "Cancel", value: "quit" },
        ]);
        if (answer === "back") return "back";
        if (answer === "quit" || answer === null) return "quit";
        if (answer === "retry") break;
        io.log("Choose retry, back or quit.");
      }
    }
  }
  return "quit";
}

function review(
  io: WizardIO,
  action: Action,
  names: Set<string>,
  owned: Set<string>,
  external: Set<string>,
  count: number,
): void {
  io.log(
    `\nStep 5/5 — Review: ${action === "upload" ? "upload local values" : "grant existing entries"}`,
  );
  for (const [title, selected] of [
    ["Entries", names],
    ["Owned repositories", owned],
    ["External repositories", external],
  ] as const) {
    io.log(`${title}:`);
    if (selected.size === 0) io.log("  (none)");
    for (const name of selected) io.log(`  ${safe(name)}`);
  }
  io.log(
    `${count} writes. Existing grants will be read and merged, not intentionally removed.`,
  );
  io.log(
    "Do not edit access elsewhere during this run: batch read/merge/write can overwrite concurrent changes.",
  );
}

async function chooseAction(
  api: CodespacesApi,
  io: WizardIO,
  previous: Action | undefined,
  catalog: Catalog,
): Promise<{ action: Action; catalog: Catalog; reloaded: boolean } | null> {
  while (!io.stopped()) {
    const input = await io.choose("Step 1/5 — Action", [
      { name: "Upload selected local entries", value: "upload" },
      { name: "Grant access to existing GitHub entries", value: "access" },
      { name: "Cancel", value: "quit" },
    ]);
    if (input === null || input === "quit" || input === "back") return null;
    if (input !== "upload" && input !== "access") continue;
    const action = input;
    if (action === previous) return { action, catalog, reloaded: false };
    // A failed mode change can invalidate the adapter's loaded values too.
    previous = undefined;
    const found = await discover(api, io, action);
    if (typeof found !== "string")
      return { action, catalog: found, reloaded: true };
    if (found === "quit") return null;
  }
  return null;
}

/** Run independent inline steps; mutations start only after explicit Apply confirmation. */
export async function runWizard(
  api: CodespacesApi,
  io: WizardIO,
): Promise<number> {
  let action: Action | undefined;
  let catalog: Catalog = { names: [], repositories: [] };
  const names = new Set<string>();
  const owned = new Set<string>();
  const external = new Set<string>();
  let step = 0;
  while (!io.stopped()) {
    if (step === 0) {
      const chosen = await chooseAction(api, io, action, catalog);
      if (!chosen) break;
      if (chosen.reloaded) {
        names.clear();
        owned.clear();
        external.clear();
      }
      action = chosen.action;
      catalog = chosen.catalog;
      step = 1;
      continue;
    }
    if (step < 4) {
      const choice = await chooseScope(
        io,
        step,
        catalog,
        names,
        owned,
        external,
      );
      if (choice === "quit") break;
      step += choice === "back" ? -1 : 1;
      continue;
    }
    if (!action) throw new Error("No action selected.");
    if (action === "access" && owned.size + external.size === 0) {
      io.log(
        "Access-only requires at least one repository. Returning to owned repositories.",
      );
      step = 2;
      continue;
    }
    const operations = plan(action, catalog, names, owned, external);
    review(io, action, names, owned, external, operations.length);
    const answer = await io.choose("Apply these changes?", [
      { name: "Cancel — do not make changes", value: "quit" },
      { name: "Back — edit selections", value: "back" },
      { name: "Apply reviewed changes", value: "apply" },
    ]);
    if (answer === "back") {
      step = 3;
      continue;
    }
    if (answer === "apply") return execute(api, io, operations);
    break;
  }
  io.log("Cancelled. No writes started.");
  return 130;
}

function chooseScope(
  io: WizardIO,
  step: number,
  catalog: Catalog,
  names: Set<string>,
  owned: Set<string>,
  external: Set<string>,
): Promise<Choice> {
  if (step === 1)
    return pick(
      io,
      "Step 2/5 — Entries (names only)",
      catalog.names,
      names,
      true,
      true,
    );
  const isOwned = step === 2;
  const rows = catalog.repositories
    .filter((repo) => repo.owned === isOwned)
    .map((repo) => repo.name);
  return pick(
    io,
    isOwned
      ? "Step 3/5 — Owned repositories"
      : "Step 4/5 — External repositories (explicit selections only)",
    rows,
    isOwned ? owned : external,
    isOwned,
  );
}
