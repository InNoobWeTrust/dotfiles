# Rule 5: Vertical Slicing

**File:** `rules/slicing.md`

**What it prevents:** AI building the entire database schema, then all the APIs, then all the UI — resulting in a feature that isn't testable until everything is done.

**Core components:**

```
1. Decompose by user story, not by technical layer
2. Each slice: Schema → Repository → Service → Route → UI for one user action
3. Implement one slice at a time
4. Validate end-to-end before moving to next slice
5. Keep changesets small — each slice is a mini-release
```

**Without this rule:** The AI will build horizontally. You'll get 10 database migrations, 5 new API endpoints, and a new Vue page — none of which work together because the integration was never tested. You'll spend 2 days debugging the integration instead of 2 hours building slice by slice.

**Bad (horizontal) vs Good (vertical slicing):**

```
BAD:    1. Create all database schemas
        2. Implement all APIs
        3. Build UI for all features
        → Nothing works until everything works

GOOD:   Slice A: "Save a new item" (Schema, Repo, API, barebones UI)
        Slice B: "Display list of items" (Read repo, list API, list component)
        Slice C: "Edit item details" (Update repo, PATCH API, edit form)
        → Each slice is independently testable and mergeable
```
