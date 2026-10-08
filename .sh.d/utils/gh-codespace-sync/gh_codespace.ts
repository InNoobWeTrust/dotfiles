#!/usr/bin/env -S bun --no-env-file
import { createGitHubApi } from "./github";
import { createPromptIO } from "./prompts";
import { runWizard } from "./wizard";

const usage =
  "Usage: gh codespace-sync\nInline Codespaces wizard: arrows move, Space toggles, Enter continues, Esc goes back.\nRequires Bun, gh and codespace:secrets permission.";
if (process.argv.slice(2).some((arg) => arg === "--help" || arg === "-h")) {
  console.log(usage);
} else if (process.argv.length > 2) {
  console.error(usage);
  process.exitCode = 2;
} else if (!Bun.which("gh")) {
  console.error("GitHub CLI (gh) is required.");
  process.exitCode = 1;
} else if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error(
    "An interactive terminal is required. Run gh codespace-sync in your terminal.",
  );
  process.exitCode = 1;
} else {
  const cancel = new AbortController();
  const stop = () => {
    cancel.abort();
    console.log("\nStopping after any current request…");
  };
  process.on("SIGINT", stop);
  try {
    process.exitCode = await runWizard(
      createGitHubApi(),
      createPromptIO(cancel),
    );
  } catch {
    console.error(
      "The wizard could not finish. No further requests will be made.",
    );
    process.exitCode = 1;
  } finally {
    process.removeListener("SIGINT", stop);
  }
}
