---
description: "Applies to feature implementations, system migrations, and multi-component tasks. Mandates decomposing requirements into vertical tracer-bullet slices sharded into separate phase files."
globs: "*"
alwaysApply: false
trigger: model_decision
---

# Rule: Vertical Slicing (Tracer Bullet Development)

This rule applies to **all feature implementations, system migrations, and multi-component tasks**. It mandates decomposing complex requirements into end-to-end "vertical slices" rather than horizontal layers to maintain extremely tight feedback loops.

---

## 🎯 What is Vertical Slicing?

Instead of building a system "horizontally" (e.g., spending 3 days implementing all database tables, then 2 days writing the APIs, then 2 days building the frontend), you build **end-to-end vertical slices** (tracer bullets).
*   A **vertical slice** implements a single, narrow user journey cutting through all layers (Schema -> Repository -> Service -> Route -> UI).
*   Each slice must be fully functional, verifiable, and testable on its own (even if other slices are stubbed or mocked).

---

## 🛠️ The Slicing Protocol

When designing task checklists (`task.md`), implementation plans (`plan.md`), and implementing features:

1.  **Decompose Vertically & Shard into Phase Files**: Group tasks by user story or thin functional flows rather than technical layers. Rank slices by user value and risk reduction, not implementation convenience.
    *   *Shard into Separate Phase Files*: Write each vertical slice into its own separate phase file (e.g., `phases/01-save-item.md`, `phases/02-list-items.md`) referenced in the main plan file. Do not pack multiple complex slices into a single monolithic plan.
    *   *Lock Cross-Layer Seams as Code*: Before coding a slice, specify the concrete DTO types and port/service interface signatures connecting the layers in code blocks within the slice spec. Never leave contracts in prose; locking contract code upfront prevents invented interfaces or drift.
    *   *Lock Scoped File Tree Delta & Cleanup*: For each slice, explicitly declare the exact in-scope files created, modified, or deleted within the defined boundary. No invented files or out-of-scope modifications are permitted, and all temporary scratch/test files must be cleaned up before marking the slice complete.
    *   *Bad (Horizontal)*: "1. Create database schema; 2. Implement API; 3. Create UI."
    *   *Good (Vertical Slice in Phase File)*: "Phase 01 (`phases/01-save-item.md`): Save a new item (Schema, Repo, API, and barebones UI with locked SaveItemDTO & IItemRepository, scoped file tree delta, and cleanup checklist); Phase 02 (`phases/02-list-items.md`): Render list of items (Repo read, list API, and UI list component with locked ItemSummaryDTO)."
2.  **Implement Incrementally**: Make every slice an intentional stopping point: useful, releasable or learnable on its own, with an explicit next decision. Focus 100% of current execution on the active phase file. Do not add helper code, schema structures, scaffolding, or abstractions for future slices until that slice needs them.
3.  **Validate End-to-End**: Test each slice in isolation against its phase-specific verification criteria. Confirm zero unapproved files and zero invented interfaces exist. Once the slice passes TDD and verification checks, commit it (if git safety rules are met) or mark it complete before moving to the next phase file.
4.  **Feedback & Reprioritization**: After every completed slice or material phase, use `.agents/rules/phased-delivery.md` to select exactly one canonical trajectory decision: **KEEP**, **ADJUST**, **ADVANCE**, **STOP**, or **REDIRECT**. Keep pull requests and changesets small; each slice should feel like a mini-release.
