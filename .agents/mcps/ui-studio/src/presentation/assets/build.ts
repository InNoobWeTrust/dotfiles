import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { DIRECT_VERSIONS } from "../catalog/identity.ts"

/** Compile trusted browser sources once in memory for the first acquisition, under the shared cache lock.
 * Uses Bun's native versioned cache, never a local dependency tree or package scripts.
 * Resolution/compilation failures reject acquisition rather than serving a partial catalog.
 */
export async function buildAssets(): Promise<{ bundle: string; bundleCSS: string }> {
  const roots: Record<string, string> = {}
  for (const name of ["react", "react-dom", "@carbon/react", "@carbon/styles", "zod"] as const) {
    const specifier = `${name}@${DIRECT_VERSIONS[name]}/package.json`
    await import(specifier, { with: { type: "json" } })
    roots[name] = dirname(Bun.resolveSync(specifier, import.meta.dir))
  }
  const aliases: Record<string, string> = {
    react: join(roots.react, "index.js"),
    "react/jsx-runtime": join(roots.react, "jsx-runtime.js"),
    "react/jsx-dev-runtime": join(roots.react, "jsx-dev-runtime.js"),
    "react-dom": join(roots["react-dom"], "index.js"),
    "react-dom/client": join(roots["react-dom"], "client.js"),
  }
  for (const name of ["@openuidev/react-lang", "@openuidev/lang-core", "@carbon/charts-react"] as const) {
    const resolved = Bun.resolveSync(`${name}@${DIRECT_VERSIONS[name]}`, import.meta.dir)
    aliases[name] = join(dirname(resolved), "index.mjs")
  }
  const result = await Bun.build({
    entrypoints: [join(import.meta.dir, "../browser/runtime.tsx")],
    target: "browser", format: "iife", minify: true,
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [{
      name: "pinned-native-cache",
      setup(build) {
        build.onResolve({ filter: /.*/ }, (args) => {
          if (aliases[args.path]) return { path: aliases[args.path] }
          if (args.path === "zod" || args.path.startsWith("zod/"))
            return { path: Bun.resolveSync(args.path.replace(/^zod/, `zod@${DIRECT_VERSIONS.zod}`), import.meta.dir) }
          if (args.path.startsWith("@carbon/react/es/"))
            return { path: join(roots["@carbon/react"], args.path.slice("@carbon/react/".length)) }
          if (args.path.startsWith(".") || args.path.startsWith("/") || args.path.startsWith("node:")) return undefined
          return { path: Bun.resolveSync(args.path, dirname(args.importer)) }
        })
      },
    }],
  })
  if (!result.success) throw new AggregateError(result.logs, "UI Studio browser compilation failed")
  if (result.outputs.length !== 1) throw new Error("UI Studio requires one self-contained browser artifact")
  const bundle = await result.outputs[0].text()

  const sass = await import(`sass@${DIRECT_VERSIONS.sass}`)
  const styleRoots = new Map<string, string>([["@carbon/styles", roots["@carbon/styles"]]])
  const importer = {
    findFileUrl(value: string, options: { containingUrl: URL | null }) {
      if (value.startsWith(".") || value.startsWith("/") || value.includes("://")) return null
      const parts = value.split("/"), count = value.startsWith("@") ? 2 : 1
      const name = parts.slice(0, count).join("/"), sub = parts.slice(count).join("/")
      let root = styleRoots.get(name)
      if (!root) {
        const from = options.containingUrl ? dirname(fileURLToPath(options.containingUrl)) : roots["@carbon/styles"]
        root = dirname(Bun.resolveSync(name + "/package.json", from))
        styleRoots.set(name, root)
      }
      const metadata: { sass?: string; style?: string } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
      const base = sub.replace(/\.scss$/, ""), segments = base.split("/"), last = segments.pop()
      const candidates = sub
        ? [base + ".scss", base + "/index.scss", base + "/_index.scss", [...segments, "_" + last + ".scss"].join("/")]
        : [metadata.sass, metadata.style, "index.scss", "_index.scss", "scss/index.scss", "scss/_index.scss"].filter((path): path is string => !!path)
      const target = candidates.map((candidate) => join(root, candidate)).find(existsSync)
      return target ? pathToFileURL(target) : null
    },
  }
  const styleFile = join(import.meta.dir, "../browser/carbon.scss")
  const { css: carbonCSS } = sass.compileString(readFileSync(styleFile, "utf8"), {
    url: pathToFileURL(styleFile), importers: [importer], style: "compressed",
  })
  const chartStyles = Bun.resolveSync(`@carbon/charts@${DIRECT_VERSIONS["@carbon/charts"]}/styles.css`, import.meta.dir)
  const bundleCSS = carbonCSS + "\n" + readFileSync(chartStyles, "utf8")
  if (/@font-face|url\(/i.test(bundleCSS)) throw new Error("UI Studio CSS must not depend on fonts or asset URLs")
  return { bundle, bundleCSS }
}
