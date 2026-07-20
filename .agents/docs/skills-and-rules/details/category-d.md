# Category D: Business & Security Failures

#### D1. Invented Business Rules

**Symptom:** The AI encounters an ambiguous edge case (e.g., "what discount applies when the order crosses a price threshold at exactly midnight?") and picks an answer instead of asking.

**What happens:** The wrong business rule ships to production. In a financial system, this means money is calculated incorrectly. The error might not be detected for weeks.

**Defending rule:** Code Quality Baseline (Ambiguity policy: stop and ask) + Prohibited Patterns (Guessing through ambiguity)

#### D2. Optimistic Data Mutation

**Symptom:** The AI implements an "optimistic update" pattern — updating the UI immediately and hoping the backend succeeds — for financial data.

**What happens:** The UI shows a purchase order as "submitted" while the backend rejected it. The user makes decisions based on stale data.

**Defending rule:** Project-specific rule in AGENTS.md: "Financial-critical system: do not show speculative or mis-synced business data in the UI."

#### D3. Secret Exposure

**Symptom:** The AI hardcodes an API key, database password, or access token in source code for "convenience during development."

**What happens:** The secret is committed to git. Even if removed later, it's in the git history. A security scan may catch it, but if not, it's a breach waiting to happen.

**Defending rule:** Git Safety rules (from agent instructions) + .gitignore patterns + automated secret scanning (trufflehog, git-secrets)
