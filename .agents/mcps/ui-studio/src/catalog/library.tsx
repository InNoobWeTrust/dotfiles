import { createLibrary } from "@openuidev/react-lang"
import { CATALOG_ID } from "./identity.ts"
import { layoutComponents } from "./layout.tsx"
import { inputComponents } from "./inputs.tsx"
import { dataComponents } from "./data.tsx"
import { chartComponents } from "./charts.tsx"

// This exact library supplies both the prompt and the renderer registrations.
export const library = createLibrary({
  id: CATALOG_ID,
  root: "Page",
  components: [...layoutComponents, ...inputComponents, ...dataComponents, ...chartComponents],
})
