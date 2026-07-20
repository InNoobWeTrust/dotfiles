# Project Onboarding: First 30 Minutes

### What a New Team Member Needs Immediately

Every new team member — human or AI — needs these things in the first 30 minutes:

1. **Understanding of the product** — What does it do? Who uses it? Why?
2. **A working dev environment** — Can they build and run the project?
3. **The rules of engagement** — What must they never do? How do they verify work?
4. **A map of the codebase** — Where does each kind of code live?
5. **The quality bar** — What commands prove their work is correct?

### First Commands a Newcomer Runs

```
# 1. Verify required tools are installed
python --version     # Or whatever language runtime the project uses
node --version       # If applicable
docker --version     # If the project uses containers
git --version

# 2. Start the dev environment (commands will vary by project)
make dev-up          # Start infrastructure services (databases, message queues)
make dev             # Start the application

# 3. Verify everything works
curl http://127.0.0.1:{backend-port}/healthz    # Backend health check
curl http://127.0.0.1:{frontend-port}            # Frontend
curl http://127.0.0.1:{backend-port}/docs        # API documentation (if auto-generated)

# 4. Load test/seed data (if applicable)

# 5. Run the quality gates to see current project state
make fix       # Auto-fix formatting and safe corrections
make quality   # Full quality gate
```

### What AGENTS.md Must Contain

Your project's `AGENTS.md` should have these sections, adapted to your stack and domain:

| Section | Purpose | What to Include |
|---|---|---|
| **Source of Truth Order** | Resolve conflicts between docs and code | Ranked list of canonical documents |
| **Project Rules** | Hard constraints that must never be violated | Business logic location, data integrity rules, system-critical constraints |
| **Tooling Rules** | How to run things, what tools NOT to use | Package managers, build systems, environment isolation |
| **Database Rules** | Schema management protocol | Migration workflow, raw SQL vs ORM boundaries, seed data setup |
| **Agent Operating Rules** | How the AI agent should behave | Default skill, when to load/not load skills, verification protocol |
| **Code Quality Rules** | Minimum engineering bar | Naming conventions, nesting limits, function length, prohibited patterns |
| **Routing & Memory Rules** | Context management | When to save/restore short-term entries, when to consolidate, file locations |
| **Server Management Rules** | What the AI can/cannot do to infrastructure | Explicit prohibitions against starting/stopping servers |
| **Source Code Organization** | File/folder map | Where each type of code lives (routers, services, components, DTOs) |
| **Debugging Protocol** | Structured investigation approach | Steps to follow when diagnosing a bug |
| **Verification Commands** | Test/build/lint commands | Every `make` target the AI should run before declaring work done |

### The GLOSSARY.md

Every project with non-trivial domain logic needs a `GLOSSARY.md`. This prevents term drift — when one concept gets called by three different names across the codebase as different people (and AI sessions) work on it.

**Structure:**

```
| Term | Domain Definition | Backend Code Reference | Frontend Code Reference | Prohibited Aliases |
|---|---|---|---|---|
| PurchaseOrder | An internal procurement order sent to a supplier | PurchaseOrder (orm/models.py) | OrderCreateDialog.vue | "Order", "ReplenishmentOrder" |
| Supplier | A vendor supplying product stock | supplier_id (purchase_order table) | SupplierList.vue | "Vendor", "Client", "Provider" |
```

**Rules for the glossary:**

1. Every domain concept gets exactly one canonical name
2. If a concept has multiple names in the existing code, pick one and list the rest as "Prohibited Aliases"
3. Before any new feature is implemented, check if its domain terms exist in GLOSSARY.md. If not, define them first
4. If the project lacks a GLOSSARY.md, the AI should offer to generate one by scanning entity files, class declarations, and database schemas

**Bootstrap protocol for new projects:**
1. Scan main entity files, class declarations, and database schemas
2. Extract the top 10-15 recurrent nouns and domain concepts
3. Verify synonyms: check if identical logical concepts appear under different names
4. Draft the glossary table with canonical names, definitions, code locations, and prohibited aliases

---
