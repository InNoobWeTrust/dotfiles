import { extname } from "node:path"
import type { Recipe } from "./contracts.ts"

// Fixed, documentation-grounded launch recipes, not an installer or runtime scan.
// Array order is the preference order used when several installed recipes accept a file.
export const recipes: Recipe[] = [
  {
    id: "typescript",
    name: "typescript-language-server",
    executables: ["typescript-language-server"],
    args: ["--stdio"],
    languageIds: ["javascript", "typescript", "javascriptreact", "typescriptreact"],
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    languages: {
      ".js": "javascript",
      ".jsx": "javascriptreact",
      ".ts": "typescript",
      ".tsx": "typescriptreact",
    },
    caveat:
      "Requires TypeScript/tsserver. Vue scripts need an explicitly configured @vue/typescript-plugin.",
  },
  // Python preference order is preserved by discovery; starting remains explicit.
  {
    id: "ty",
    name: "ty",
    executables: ["ty"],
    args: ["server"],
    languageIds: ["python"],
    extensions: [".py", ".pyi"],
    languages: { ".py": "python", ".pyi": "python" },
  },
  {
    id: "pyrefly",
    name: "pyrefly",
    executables: ["pyrefly"],
    args: ["lsp"],
    languageIds: ["python"],
    extensions: [".py", ".pyi"],
    languages: { ".py": "python", ".pyi": "python" },
  },
  {
    id: "pyright",
    name: "pyright",
    executables: ["pyright-langserver"],
    args: ["--stdio"],
    languageIds: ["python"],
    extensions: [".py", ".pyi"],
    languages: { ".py": "python", ".pyi": "python" },
    caveat: "Interpreter/environment resolution may require settings.",
  },
  {
    id: "basedpyright",
    name: "basedpyright",
    executables: ["basedpyright-langserver"],
    args: ["--stdio"],
    languageIds: ["python"],
    extensions: [".py", ".pyi"],
    languages: { ".py": "python", ".pyi": "python" },
  },
  {
    id: "rust",
    name: "rust-analyzer",
    executables: ["rust-analyzer"],
    args: [],
    languageIds: ["rust"],
    extensions: [".rs"],
    languages: { ".rs": "rust" },
    caveat: "Non-Cargo projects need rust-project.json or linkedProjects.",
  },
  {
    id: "go",
    name: "gopls",
    executables: ["gopls"],
    args: [],
    languageIds: ["go", "gomod", "gowork"],
    extensions: [".go", "go.mod", "go.work"],
    languages: { ".go": "go", "go.mod": "gomod", "go.work": "gowork" },
  },
  {
    id: "bash",
    name: "bash-language-server",
    executables: ["bash-language-server"],
    args: ["start"],
    languageIds: ["shellscript", "bash", "sh"],
    extensions: [".sh", ".bash"],
    languages: { ".sh": "shellscript", ".bash": "bash" },
    caveat: "Not zsh. shellcheck/shfmt are optional external tools.",
  },
  {
    id: "dockerfile",
    name: "dockerfile-language-server",
    executables: ["docker-langserver"],
    args: ["--stdio"],
    languageIds: ["dockerfile"],
    extensions: ["Dockerfile", ".dockerfile"],
    languages: { Dockerfile: "dockerfile", ".dockerfile": "dockerfile" },
  },
  {
    id: "markdown",
    name: "marksman",
    executables: ["marksman"],
    args: ["server"],
    languageIds: ["markdown"],
    extensions: [".md"],
    languages: { ".md": "markdown" },
    caveat: "Cross-file features need git workspace or .marksman.toml.",
  },
  {
    id: "typst",
    name: "tinymist",
    executables: ["tinymist"],
    args: [],
    languageIds: ["typst"],
    extensions: [".typ"],
    languages: { ".typ": "typst" },
  },
  {
    id: "makefile",
    name: "autotools-language-server",
    executables: ["autotools-language-server"],
    args: [],
    languageIds: ["make", "automake"],
    extensions: ["Makefile", ".mk"],
    languages: { Makefile: "make", ".mk": "make" },
    caveat: "Bare stdio launch documented by nvim-lspconfig; not locally runtime-verified.",
  },
  {
    id: "yaml",
    name: "yaml-language-server",
    executables: ["yaml-language-server"],
    args: ["--stdio"],
    languageIds: ["yaml"],
    extensions: [".yaml", ".yml"],
    languages: { ".yaml": "yaml", ".yml": "yaml" },
    caveat: "Kubernetes schemas require configuration; schema stores can fetch network resources.",
  },
  {
    id: "json",
    name: "json-lsp",
    executables: ["vscode-json-language-server"],
    args: ["--stdio"],
    languageIds: ["json", "jsonc"],
    extensions: [".json", ".jsonc"],
    languages: { ".json": "json", ".jsonc": "jsonc" },
  },
  {
    id: "html",
    name: "html-lsp",
    executables: ["vscode-html-language-server"],
    args: ["--stdio"],
    languageIds: ["html"],
    extensions: [".html"],
    languages: { ".html": "html" },
  },
  {
    id: "css",
    name: "css-lsp",
    executables: ["vscode-css-language-server"],
    args: ["--stdio"],
    languageIds: ["css", "scss", "less"],
    extensions: [".css", ".scss", ".less"],
    languages: { ".css": "css", ".scss": "scss", ".less": "less" },
  },
  {
    id: "vue",
    name: "vue-language-server",
    executables: ["vue-language-server"],
    args: ["--stdio"],
    languageIds: ["vue"],
    extensions: [".vue"],
    languages: { ".vue": "vue" },
    caveat:
      "Modern Vue hybrid TS features need companion TS server/plugin; no automatic cross-server routing.",
  },
  {
    id: "tailwind",
    name: "tailwindcss-language-server",
    executables: ["tailwindcss-language-server"],
    args: ["--stdio"],
    languageIds: ["html", "css", "javascriptreact", "typescriptreact", "vue"],
    extensions: [".html", ".css", ".jsx", ".tsx", ".vue"],
    languages: {
      ".html": "html",
      ".css": "css",
      ".jsx": "javascriptreact",
      ".tsx": "typescriptreact",
      ".vue": "vue",
    },
    caveat:
      "Requires recognizable Tailwind workspace/configuration; v4 differs from v3. Shadowed by earlier recipes for its extensions.",
  },
]

/**
 * Candidate recipes for a basename in preference order, with the languageId to send on didOpen.
 * Basename entries (Dockerfile, Makefile, go.mod, go.work) win over the extension lookup.
 */
export function recipeLanguages(basename: string): { recipe: Recipe; languageId: string }[] {
  const extension = extname(basename)
  const matches: { recipe: Recipe; languageId: string }[] = []
  for (const recipe of recipes) {
    const languageId =
      recipe.languages[basename] ?? (extension ? recipe.languages[extension] : undefined)
    if (languageId) matches.push({ recipe, languageId })
  }
  return matches
}
