import { constants } from "node:fs"
import { access, realpath, stat } from "node:fs/promises"
import { delimiter, dirname, join, resolve } from "node:path"
import type { Recipe } from "./contracts.ts"
import { recipes } from "./recipes.ts"

export interface Discovered extends Recipe {
  executable: string
  source: string
}

async function executable(path: string): Promise<string | undefined> {
  try {
    await access(path, constants.X_OK)
    if (!(await stat(path)).isFile()) return
    return await realpath(path)
  } catch {
    return
  }
}

export async function discover(cwd: string, path = process.env.PATH ?? ""): Promise<Discovered[]> {
  const directories: { path: string; source: string }[] = []
  let current = resolve(cwd)
  for (let depth = 0; depth < 12; depth++) {
    for (const bin of ["node_modules/.bin", ".venv/bin", "venv/bin", ".pixi/envs/default/bin"]) {
      directories.push({ path: join(current, bin), source: `project:${current}` })
    }
    const atRoot = await stat(join(current, ".git")).then(
      () => true,
      () => false,
    )
    if (atRoot || dirname(current) === current) break
    current = dirname(current)
  }
  for (const entry of path.split(delimiter).filter(Boolean)) {
    directories.push({ path: resolve(cwd, entry), source: "PATH" })
  }
  const found: Discovered[] = []
  for (const recipe of recipes) {
    search: for (const directory of directories) {
      for (const name of recipe.executables) {
        const candidate = await executable(join(directory.path, name))
        if (!candidate) continue
        // Preserve launcher symlinks (Node shims can depend on their invoked path).
        found.push({ ...recipe, executable: join(directory.path, name), source: directory.source })
        break search
      }
    }
  }
  return found
}
