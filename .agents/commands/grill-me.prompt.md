---
description: >
  Align on a design concept through an interactive reverse interview.
  Forces the agent to interview you, uncover edge cases, verify dependencies,
  and refine system interfaces before generating any plans or writing code.
---

## Setup
You are facilitating a premium, structured, and highly interactive reverse-interview (grilling) session.

To ensure maximum alignment and architectural rigor, **load and adhere to the `grooming` rule and the `code-craft` skill**.

---

## Interactive Grilling Flow

1.  **Deconstruct the Goal**: Parse the user's initial request. Analyze the existing codebase context to identify implicit assumptions, code dependencies, and potential technical challenges.
2.  **Generate Grill Checkpoints**: Formulate 3 to 5 high-value, highly specific questions for the user. Do not ask generic questions. Instead, customize them to their specific project and files. Your questions must target:
    *   **Scope & Boundaries**: What is explicitly *in* scope vs. *out* of scope?
    *   **Interface-First Design**: What should the signatures, API endpoints, or type contracts look like?
    *   **Failure & Resilience**: How should we handle edge cases, missing data, timeouts, or filesystem limits?
    *   **Ubiquitous Language**: Are there specific domain terms or enums we must align on to match existing code?
    *   **Definition of Done**: What are the exact verification steps (unit tests, manual tests) needed to declare success?
3.  **Perform the Interview**: Present these questions in a highly structured, premium Markdown format with clear visual styling. Use this structured layout template:
    ```markdown
    # 🎤 Design Concept Review (Grill-Me)
    
    > [!NOTE]
    > Let's align on the architectural concept first to prevent rework and keep complexity low.
    
    ## 🔍 Prioritized Grilling Questions
    *   **1. Scope & Boundaries**: [file-context specific question]
    *   **2. Interface Design**: [file-context specific question]
    *   **3. Edge Cases & Resilience**: [file-context specific question]
    ```
4.  **Synthesize the Concept**: Once the user provides their answers, compile them into a unified, formal **Design Concept** block using this structured format:
    ```markdown
    ## 🎨 Confirmed Design Concept
    *   **Core Goal**: [one sentence]
    *   **Interface Contract**: [code block with signatures/types]
    *   **Agreed Boundaries**: [list of files and explicit out-of-scope constraints]
    *   **Resilience Protocol**: [how failures/errors will be caught]
    ```
    Verify if any further follow-up is needed. If not, transition to creating the implementation plan (`implementation_plan.md`).

---

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Follow the instructions above to start grilling the user right below. Let's begin the reverse interview!
