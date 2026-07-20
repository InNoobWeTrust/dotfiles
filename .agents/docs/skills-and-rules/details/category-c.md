# Category C: Naming & Context Failures

#### C1. Term Drift

**Symptom:** The same concept appears as `productId` in the database, `sku_id` in the API, and `itemCode` in the frontend — all introduced by different AI-assisted tasks.

**What happens:** A new developer or AI agent reading the codebase must constantly translate between naming conventions. Search-and-replace becomes dangerous because you can't tell if `itemCode` and `productId` are the same thing.

**Defending rule:** Ubiquitous Language (GLOSSARY.md)

#### C2. Fabricated APIs and Functions

**Symptom:** The AI calls `warehouse.getStockLevel(productId)` — a function that doesn't exist. It hallucinated an API that seemed reasonable.

**What happens:** The code doesn't compile or runtime-crashes. The AI's hallucination is confident enough that a junior developer might spend time trying to find the "missing" import.

**Defending rule:** Codebase exploration before implementation. The WIRING.md composition pathway (exploration → code-craft) enforces this.
