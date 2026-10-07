# Category C: Naming & Context Failures

#### C1. Term Drift

**Symptom:** The same concept appears as `productId` in the database, `sku_id` in the API, and `itemCode` in the frontend — all introduced by different AI-assisted tasks.

**What happens:** A new developer or AI agent reading the codebase must constantly translate between naming conventions. Search-and-replace becomes dangerous because you can't tell if `itemCode` and `productId` are the same thing.

**Defending rule:** Ubiquitous Language (GLOSSARY.md)

#### C2. Fabricated APIs and Functions

**Symptom:** The AI calls `warehouse.getStockLevel(productId)` — a function that doesn't exist. It hallucinated an API that seemed reasonable.

**What happens:** The code doesn't compile or runtime-crashes. The AI's hallucination is confident enough that a junior developer might spend time trying to find the "missing" import.

**Defending rule:** Codebase exploration before implementation. The WIRING.md composition pathway (exploration → code-craft) enforces this.

#### C3. Audience and Context Boundary Failure

**Symptom:** A generated artifact includes unrelated conversation or deployment details, or assumes the reader already knows explanations and decisions from the chat. Even the requester may struggle to understand the first draft.

**What happens:** Temporary observations become misleading general guidance, while necessary definitions or rationale are missing. Moving the text into a reference file does not correct its audience or scope.

**Defense:** Define the intended reader, purpose, assumed knowledge, and accessible references proportionately before writing. Check the draft without chat history: include the context needed to use the artifact, exclude irrelevant context, and keep conditional claims conditional.

**Escalation:** Correct the reader/context mismatch before adding more prose or more automated checks. See [Lessons from agent-guidance failures](../agent-guidance-lessons.md) for observed examples, related failure modes, and untested hypotheses.
