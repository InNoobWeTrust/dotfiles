import React from "react"
import { createRoot } from "react-dom/client"
import { Renderer } from "@openuidev/react-lang"
import { library } from "../catalog/library.tsx"
import { CATALOG_ID } from "../catalog/identity.ts"

const runtime = { React, createRoot, Renderer, library, catalogVersion: CATALOG_ID }
declare global { interface Window { __UIStudio: typeof runtime } }
window.__UIStudio = runtime
