import checkbox from "@inquirer/checkbox@4.2.4";
import select from "@inquirer/select@4.3.4";
import type { WizardIO } from "./wizard";

/** Create inline selectors. Prompt cancellation never starts a GitHub write. */
export function createPromptIO(cancel: AbortController): WizardIO {
  async function prompt<T>(
    run: (signal: AbortSignal) => Promise<T>,
  ): Promise<T | "back" | null> {
    if (cancel.signal.aborted) return null;
    const back = new AbortController();
    const keypress = (
      _text: string,
      key: { name?: string; ctrl?: boolean },
    ) => {
      if (key.name === "escape") back.abort();
      if (key.ctrl && key.name === "d") cancel.abort();
    };
    process.stdin.on("keypress", keypress);
    try {
      return await run(AbortSignal.any([cancel.signal, back.signal]));
    } catch (error) {
      if (cancel.signal.aborted) return null;
      if (back.signal.aborted) return "back";
      if (error instanceof Error && error.name === "ExitPromptError") {
        cancel.abort();
        return null;
      }
      throw error;
    } finally {
      process.stdin.removeListener("keypress", keypress);
    }
  }

  return {
    choose: (message, choices) =>
      prompt((signal) =>
        select(
          {
            message,
            choices,
            loop: false,
            theme: { helpMode: "always" },
          },
          { signal },
        ),
      ),
    pick: (message, rows, selected, allowAll, required) =>
      prompt((signal) =>
        checkbox(
          {
            message,
            choices: rows.map((value) => ({
              value,
              name: value.replace(/[\x00-\x1f\x7f-\x9f]/g, " "),
              checked: selected.has(value),
            })),
            required,
            loop: false,
            pageSize: 7,
            shortcuts: { all: allowAll ? "a" : null, invert: null },
            instructions: `↑/↓ move · Space toggle · Enter continue · Esc back · Ctrl-C cancel${allowAll ? " · A toggle all" : ""}`,
            theme: { helpMode: "always" },
          },
          { signal },
        ),
      ),
    log: (message) => console.log(message),
    stopped: () => cancel.signal.aborted,
  };
}
