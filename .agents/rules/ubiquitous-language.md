# Rule: Ubiquitous Language (Domain Glossary Sync)

This rule applies to **all implementation, design, and codebase-modifying tasks**. It mandates the creation and maintenance of a shared domain vocabulary (Ubiquitous Language) to ensure consistent names for variables, methods, classes, and logic components across the codebase.

---

## 📖 What is Ubiquitous Language?

A shared, unambiguous language defined by both the engineering domain and business requirements. 
*   **Prevent term drift**: Avoid having one concept represented by multiple terms (e.g., calling the same entity `Account`, `Profile`, and `User` in different parts of the code).
*   **Enforce semantic consistency**: Both the human engineer and the AI Agent must speak the same technical language in code, plans, and discussions.

---

## 🛠️ The Glossary Protocol

Before writing or editing code, perform the following naming checks:

1.  **Locate the Dictionary**: Look for a glossary file in the root of the project: `GLOSSARY.md`, `ubiquitous-language.md`, or a relevant `.md` file inside documentation folders.
2.  **Inspect Vocabulary**: Read and extract existing domain definitions.
3.  **Strict Alignment**:
    *   Align new class names, variables, files, schemas, and public exports exactly with the glossary definitions.
    *   If the glossary defines "Subscriber", do not name your class `ClientManager` or `MembershipUser`—name it `SubscriberManager`.
4.  **Extend Safely**:
    *   When implementing a new domain concept not yet in the glossary, **propose** the terminology in your plan or scratch space first.
    *   Upon user approval, implement the code and append the new terms, definitions, and code mappings to `GLOSSARY.md`.

---

## ⚡ Bootstrap Rule

*   If the project lacks a `GLOSSARY.md` but is a non-trivial codebase, the agent should proactively offer to analyze the existing codebase and generate a baseline `GLOSSARY.md` under `code-craft` Phase 5 (Tech Debt / Cleanup). The analysis MUST follow this 3-step protocol:
    1.  **Extract Core Abstractions**: Scan main entity files, class declarations, and database schemas. Extract the top 10 recurrent nouns and domain concepts.
    2.  **Verify Synonyms**: Check if identical logical concepts are referred to by different names (e.g. `Client` vs `User`). Highlight these synonym overlaps.
    3.  **Draft Glossary**: Write a compact markdown list mapping each term to its definition, primary file source, and recommended alias rules to keep naming strict.
