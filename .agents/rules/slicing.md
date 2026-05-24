# Rule: Vertical Slicing (Tracer Bullet Development)

This rule applies to **all feature implementations, system migrations, and multi-component tasks**. It mandates decomposing complex requirements into end-to-end "vertical slices" rather than horizontal layers to maintain extremely tight feedback loops.

---

## 🎯 What is Vertical Slicing?

Instead of building a system "horizontally" (e.g., spending 3 days implementing all database tables, then 2 days writing the APIs, then 2 days building the frontend), you build **end-to-end vertical slices** (tracer bullets).
*   A **vertical slice** implements a single, narrow user journey cutting through all layers (Schema -> Repository -> Service -> Route -> UI).
*   Each slice must be fully functional, verifiable, and testable on its own (even if other slices are stubbed or mocked).

---

## 🛠️ The Slicing Protocol

When designing task checklists (`task.md`) and implementing features:

1.  **Decompose Vertically**: Group tasks by user story or thin functional flows rather than technical layers.
    *   *Bad (Horizontal)*: "1. Create database schema; 2. Implement API; 3. Create UI."
    *   *Good (Vertical Slice)*: "Slice A: Save a new item (Schema, Repo, API, and barebones UI); Slice B: Render list of items (Repo read, list API, and UI list component)."
2.  **Implement Incrementally**: Focus 100% of your current execution on one specific slice. Do not write helper code or schema structures for future slices until you are working on them.
3.  **Validate End-to-End**: Test each slice in isolation. Once the slice passes TDD and manual checks, commit it (if git safety rules are met) or mark it complete before moving to the next.
4.  **Continuous Feedback**: Keep pull requests and changesets small. Each vertical slice should feel like a mini-release.
