/** Launch recipe data shared by discovery and file-to-language selection. */
export interface Recipe {
  id: string
  name: string
  executables: string[]
  args: string[]
  languageIds: string[]
  extensions: string[]
  /** Basename or extension -> languageId sent on didOpen. */
  languages: Record<string, string>
  caveat?: string
}
