/**
 * Mermaid syntax validator — runs under Bun with happy-dom preload.
 *
 * Usage:
 *   bun --preload ./path/to/happy-dom-preload.ts \
 *       ./path/to/validate-mermaid.ts [file.mmd ...]
 *
 *   echo '<mermaid code>' | bun --preload ./path/to/happy-dom-preload.ts \
 *       ./path/to/validate-mermaid.ts
 *
 * Exit codes:
 *   0 — all inputs valid
 *   1 — one or more inputs invalid
 *   2 — usage error (no input)
 */
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false });

interface ValidationResult {
  source: string;
  valid: boolean;
  error: string | null;
}

async function validateMermaid(
  code: string,
  source: string,
): Promise<ValidationResult> {
  try {
    await mermaid.parse(code);
    return { source, valid: true, error: null };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);
    return { source, valid: false, error: message };
  }
}

// --- Collect inputs ---

const files = process.argv.slice(2);
const inputs: { source: string; code: string }[] = [];

if (files.length > 0) {
  for (const file of files) {
    inputs.push({ source: file, code: await Bun.file(file).text() });
  }
} else {
  const stdin = await new Response(Bun.stdin.stream()).text();
  const code = stdin.trim();
  if (!code) {
    console.error(
      "Usage: bun --preload <path/to/happy-dom-preload.ts> " +
        "<path/to/validate-mermaid.ts> [file.mmd ...]",
    );
    console.error(
      "       echo '<mermaid>' | bun --preload <path/to/happy-dom-preload.ts> " +
        "<path/to/validate-mermaid.ts>",
    );
    process.exit(2);
  }
  inputs.push({ source: "<stdin>", code });
}

// --- Validate ---

let hasErrors = false;

for (const { source, code } of inputs) {
  const result = await validateMermaid(code, source);
  if (result.valid) {
    console.log(`✅ ${source}: valid`);
  } else {
    console.error(`❌ ${source}: invalid`);
    console.error(result.error);
    hasErrors = true;
  }
}

process.exit(hasErrors ? 1 : 0);
