import { constants } from "node:fs"
import { access, realpath, stat } from "node:fs/promises"

export async function isExecutable(path: string): Promise<string | undefined> {
  try {
    await access(path, constants.X_OK)
    if (!(await stat(path)).isFile()) return
    return await realpath(path)
  } catch {
    return
  }
}
