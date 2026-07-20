# Category A: Code Quality Failures

#### A1. Silent Error Swallowing

**Symptom:** `catch (e) {}` or `except: pass` with no logging, no re-raise, no fallback contract.

**What happens:** Production errors disappear. A database outage shows as "no data found" instead of "service unavailable." Debugging takes hours because the error was consumed.

**Defending rule:** Code Quality Baseline (Prohibited Patterns: Silent error swallowing)

**Escalation:** If the AI keeps swallowing errors after the rule, the error handling is probably too cumbersome. Simplify: add a utility function like `logAndRethrow()` that makes correct handling as easy as swallowing.

#### A2. Business Logic in Views/Controllers

**Symptom:** A Vue component computing `discountPrice = basePrice * (1 - marginThreshold / 100)` — business logic embedded in presentation code.

**What happens:** The same business rule gets implemented differently in 3 different places. When the business rule changes, you must find and update all 3. If you miss one, the UI shows wrong data.

**Defending rule:** Code Quality Baseline (Prohibited Patterns: Mixing layers)

**Escalation:** If the AI keeps putting logic in views, the backend probably doesn't expose a convenient endpoint for the data the frontend needs. The fix is an API change, not a rule change.

#### A3. Magic Literals

**Symptom:** `if (status === "pending_review")`, `timeout = 5000`, `maxItems = 100` sprinkled throughout the code.

**What happens:** When the status value changes or the timeout needs adjusting, you hunt through the entire codebase. The AI has no standard way to update these.

**Defending rule:** Code Quality Baseline (Prohibited Patterns: Magic literals)

**Escalation:** If the AI keeps using magic literals, create a constants file with clear naming conventions and reference it in the rule.

#### A4. Extend-by-Parameter Growth

**Symptom:** A function grows from 2 parameters to 6 over several AI-assisted tasks, with booleans controlling behavior branches.

**What happens:** The function becomes a "god function" that does 4 different things depending on flag combinations. Testing explodes combinatorially. Callers don't know which flags to set.

**Defending rule:** Code Quality Baseline (Prohibited Patterns: Extend-by-parameter)

**Escalation:** When you see a function reaching 4+ parameters, it's time for a composition refactor — extract the variants into separate functions or use a strategy pattern.

#### A5. Shallow Helper Over-Extraction

**Symptom:** The AI extracts a 2-line calculation into its own function, creating indirection without hiding complexity.

**What happens:** The codebase fills with tiny helper files. A reader must jump through 5 files to follow a 10-line flow. The files have names like `calculateDiscount`, `applyDiscount`, `validateDiscount` — each containing 3 lines.

**Defending rule:** Code Quality Baseline (Required Structure Patterns: Deep Modules over Shallow Modules)

**Escalation:** Inline the shallow helpers. The rule is: only extract when `interface complexity << implementation complexity`.
