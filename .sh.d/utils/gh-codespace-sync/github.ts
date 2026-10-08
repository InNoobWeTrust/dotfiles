import { homedir } from "node:os";
import { join } from "node:path";
import { parse } from "dotenv@17.2.3";
import sodium from "libsodium-wrappers@0.7.15";

// Casual-search obfuscation only; this is not a security boundary.
const entryResource = Buffer.from("c2VjcmV0", "base64").toString();
const endpoint = `user/codespaces/${entryResource}s`;
const timeoutMs = 60_000;

/** Upload local values or add repository access without changing values. */
export type Action = "upload" | "access";
/** A validated GitHub repository; ownership is relative to the authenticated user. */
export interface Repository {
  id: number;
  name: string;
  owned: boolean;
}
/** Names and available repository scopes; never contains entry values. */
export interface Catalog {
  names: string[];
  repositories: Repository[];
}
/** One independently applied write, with no rollback of earlier operations. */
export type Operation =
  | { kind: "upload"; name: string }
  | { kind: "grant"; name: string; repositories: Repository[] };
/** Cancellation between a batch read and write leaves that batch unapplied. */
export class OperationCancelled extends Error {
  constructor() {
    super("Operation cancelled before its write.");
  }
}
/** Discovery is read-only; execute applies one upload or merged access batch. */
export interface CodespacesApi {
  discover(action: Action): Promise<Catalog>;
  execute(operation: Operation, stopped?: () => boolean): Promise<void>;
}

type Command = (args: string[], body?: string) => Promise<string>;

/**
 * Run authenticated gh without prompts or inherited terminal input.
 * @param args CLI arguments; never include plaintext values.
 * @param body Optional encrypted JSON supplied through stdin.
 * @returns Captured stdout on success; stderr is never forwarded.
 * @throws On spawn failure, nonzero exit, or a 60-second timeout.
 */
export async function runGh(args: string[], body?: string): Promise<string> {
  const child = Bun.spawn(["gh", ...args], {
    stdin: body === undefined ? "ignore" : new TextEncoder().encode(body),
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, GH_PROMPT_DISABLED: "1" },
  });
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    child.kill();
  }, timeoutMs);
  try {
    const [output, , code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    if (timedOut)
      throw new Error(
        "GitHub request timed out; its outcome may be uncertain.",
      );
    // Never echo process output: it can include private data or request details.
    if (code !== 0)
      throw new Error(
        `GitHub CLI failed (exit ${code}). Check authentication and Codespaces permissions.`,
      );
    return output;
  } finally {
    clearTimeout(timer);
  }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Unexpected GitHub response.");
  }
  return value as Record<string, unknown>;
}

function entryName(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[A-Za-z_][A-Za-z0-9_]*$/.test(value) ||
    /^GITHUB_/i.test(value)
  ) {
    throw new Error("An entry has a name unsupported by GitHub.");
  }
  return value;
}

function repositoryId(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0)
    throw new Error("Unexpected GitHub repository ID.");
  return value;
}

/**
 * Create an adapter that keeps parsed dotenv values only in this process.
 * @param file Literal dotenv source, read only when upload discovery is chosen.
 * @param command Authenticated CLI boundary, replaceable for offline verification.
 * @returns Read-only discovery and sequential, encrypted/merged write methods.
 * @throws Returned methods reject unreadable input, invalid responses or failed requests.
 */
export function createGitHubApi(
  file = join(homedir(), ".vars.user"),
  command: Command = runGh,
): CodespacesApi {
  let localValues: Record<string, string> = {};
  let publicKey: { id: string; bytes: Uint8Array } | undefined;

  async function api(
    path: string,
    options: string[] = [],
    body?: object,
  ): Promise<unknown> {
    const args = ["api", path, ...options];
    if (body !== undefined) args.push("--input", "-");
    const output = await command(
      args,
      body === undefined ? undefined : JSON.stringify(body),
    );
    if (!output.trim()) return null;
    try {
      return JSON.parse(output);
    } catch {
      throw new Error("Unexpected GitHub response.");
    }
  }

  async function names(action: Action): Promise<string[]> {
    if (action === "upload") {
      try {
        localValues = parse(await Bun.file(file).text());
      } catch {
        throw new Error("Cannot read the local dotenv file (~/.vars.user).");
      }
      const keys = Object.keys(localValues).map(entryName);
      if (new Set(keys.map((key) => key.toUpperCase())).size !== keys.length) {
        throw new Error(
          "Local names collide when converted to GitHub's uppercase names.",
        );
      }
      return keys.sort();
    }
    localValues = {};
    const pages = await api(`${endpoint}?per_page=100`, [
      "--paginate",
      "--slurp",
    ]);
    if (!Array.isArray(pages)) throw new Error("Unexpected GitHub response.");
    return pages
      .flatMap((page) => {
        const entries = record(page)[`${entryResource}s`];
        if (!Array.isArray(entries))
          throw new Error("Unexpected GitHub response.");
        return entries.map((entry) => entryName(record(entry).name));
      })
      .sort();
  }

  async function repositories(): Promise<Repository[]> {
    const user = record(await api("user"));
    if (typeof user.login !== "string")
      throw new Error("Unexpected GitHub response.");
    const pages = await api(
      "user/repos?affiliation=owner,collaborator,organization_member&per_page=100",
      ["--paginate", "--slurp"],
    );
    if (!Array.isArray(pages)) throw new Error("Unexpected GitHub response.");
    const found = new Map<number, Repository>();
    for (const page of pages) {
      if (!Array.isArray(page)) throw new Error("Unexpected GitHub response.");
      for (const item of page) {
        const repo = record(item);
        const owner = record(repo.owner);
        if (
          !Number.isSafeInteger(repo.id) ||
          (repo.id as number) <= 0 ||
          typeof repo.full_name !== "string" ||
          !/^[\w.-]+\/[\w.-]+$/.test(repo.full_name) ||
          typeof owner.login !== "string"
        )
          throw new Error("Unexpected GitHub repository response.");
        found.set(repo.id as number, {
          id: repo.id as number,
          name: repo.full_name,
          owned: owner.login.toLowerCase() === user.login.toLowerCase(),
        });
      }
    }
    return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  async function mergedAccess(
    name: string,
    selected: Repository[],
  ): Promise<number[]> {
    if (selected.length === 0) throw new Error("No repositories selected.");
    const pages = await api(`${endpoint}/${name}/repositories?per_page=100`, [
      "--paginate",
      "--slurp",
    ]);
    if (!Array.isArray(pages) || pages.length === 0)
      throw new Error(
        "Incomplete GitHub access response; no access was replaced.",
      );
    const ids = new Set<number>();
    const total = record(pages[0]).total_count;
    if (!Number.isSafeInteger(total) || (total as number) < 0)
      throw new Error("Unexpected GitHub access response.");
    for (const page of pages) {
      const data = record(page);
      if (data.total_count !== total || !Array.isArray(data.repositories))
        throw new Error(
          "Inconsistent GitHub access response; retry without concurrent edits.",
        );
      for (const repository of data.repositories)
        ids.add(repositoryId(record(repository).id));
    }
    if (ids.size !== total)
      throw new Error(
        "Incomplete GitHub access response; no access was replaced.",
      );
    for (const repository of selected) ids.add(repositoryId(repository.id));
    return [...ids].sort((a, b) => a - b);
  }

  return {
    async discover(action) {
      publicKey = undefined;
      const entryNames = await names(action);
      return { names: entryNames, repositories: await repositories() };
    },
    async execute(operation, stopped = () => false) {
      if (stopped()) throw new OperationCancelled();
      const name = entryName(operation.name).toUpperCase();
      if (operation.kind === "grant") {
        const ids = await mergedAccess(name, operation.repositories);
        if (stopped()) throw new OperationCancelled();
        await api(
          `${endpoint}/${name}/repositories`,
          ["--method", "PUT", "--silent"],
          { selected_repository_ids: ids },
        );
        return;
      }
      const value = localValues[operation.name];
      if (value === undefined)
        throw new Error(
          "Selected entry is no longer loaded. Restart the wizard.",
        );
      await sodium.ready;
      if (!publicKey) {
        const key = record(await api(`${endpoint}/public-key`));
        if (typeof key.key_id !== "string" || typeof key.key !== "string")
          throw new Error("Unexpected GitHub key response.");
        try {
          publicKey = {
            id: key.key_id,
            bytes: sodium.from_base64(key.key, sodium.base64_variants.ORIGINAL),
          };
        } catch {
          throw new Error("Invalid GitHub encryption key.");
        }
        if (publicKey.bytes.length !== sodium.crypto_box_PUBLICKEYBYTES)
          throw new Error("Invalid GitHub encryption key.");
      }
      const plaintext = new TextEncoder().encode(value);
      try {
        if (stopped()) throw new OperationCancelled();
        const encrypted = sodium.crypto_box_seal(plaintext, publicKey.bytes);
        await api(`${endpoint}/${name}`, ["--method", "PUT", "--silent"], {
          key_id: publicKey.id,
          encrypted_value: sodium.to_base64(
            encrypted,
            sodium.base64_variants.ORIGINAL,
          ),
          // Omit repository IDs: updating a value must not replace existing access.
        });
      } finally {
        sodium.memzero(plaintext);
      }
    },
  };
}
