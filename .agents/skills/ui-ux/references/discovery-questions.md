# Discovery Question Bank

This question bank is loaded during Phase 1 (Discovery) of the `ui-ux` skill. Select 3–5 questions most relevant to the current task. Write answers directly to `UX-SPEC.md` § Discovery.

---

## Usage Guidance

- **Greenfield features:** Prioritize Categories 1, 2, and 5.
- **Redesigns:** Prioritize Categories 2, 4, and 5.
- **Component work:** Prioritize Categories 3 and 5.
- **Design system work:** Prioritize Categories 3, 4, and 6.
- **Mandatory rule:** Always include at least one question from Category 5 (Edge Cases).

---

## Question Categories

### Category 1: Business Objectives & Impact
1. What is the single core business metric this feature is intended to move? *(e.g., conversion +5%, support tickets -15%)*
2. If we could only get **ONE** thing right in this release, what would it be?
3. What does failure look like for this initiative, and how will we measure it?
4. How does this design align with our product strategy over the next 12–18 months?

### Category 2: Target Users & Mental Models
5. Who is the primary user persona, and what is their context of use? *(e.g., rushed mobile user in low-light vs. power user with desktop multi-monitors)*
6. What mental model or legacy system are users bringing with them? *(What do they expect based on prior experience?)*
7. What is the user's primary trigger to initiate this workflow? *(How do they arrive here?)*
8. What are the top 3 friction points or complaints users currently express about this process?

### Category 3: Technical Feasibility & System Boundaries
9. What existing backend APIs, data schemas, or third-party services constrain this design?
10. What are the latency, rate limit, or performance expectations for data calls?
11. What existing design system components must we reuse vs. what requires new creation?
12. Are there regulatory, security, or compliance constraints? *(HIPAA, GDPR, PCI-DSS, WCAG AAA)*

### Category 4: Brand Identity & Visual Positioning
13. Where on the visual spectrum should this UI sit? *(Utility-focused vs. brand-expressive)*
14. What emotional reaction should a user feel when completing this flow? *(Reassured, empowered, delighted)*
15. Are there brand guidelines or aesthetic anti-patterns we must explicitly avoid?
16. What competitor or reference UIs set the quality bar? *("We want it to feel like X")*

### Category 5: Edge Cases & Boundary Conditions
17. What happens when data is missing, null, or the API returns an error?
18. What is the maximum realistic length for dynamic text strings? *(i18n, long names, descriptions)*
19. How should the interface react under zero-connectivity or offline conditions?
20. What are the user permission boundaries? What does a read-only or restricted view look like?
21. What is the expected data volume range? *(Empty state → maximum realistic load)*

### Category 6: Governance & Operational
22. Who owns ongoing maintenance of this UI once shipped?
23. What is the testing matrix? *(Supported browsers, viewports, accessibility tools)*
24. What is the hard deadline, and what scope trade-offs are pre-approved if we hit obstacles?
25. How will content updates or localization work without requiring code deploys?

---

## Mapping to UX-SPEC.md Sections

| Category | Feeds UX-SPEC.md Section |
| --- | --- |
| **Category 1: Business Objectives** | § Discovery — Success metrics, constraints |
| **Category 2: Target Users** | § Discovery — Target user, primary goal |
| **Category 3: Technical Feasibility** | § Discovery — Constraints; § Layout — Component reuse |
| **Category 4: Brand Identity** | § Visual Design — Taste sliders, token choices |
| **Category 5: Edge Cases** | § State Matrix — Error, empty, loading, permission states |
| **Category 6: Governance** | § Discovery — Out of scope; Phase 7 verification scope |

---

## Self-Grill Mode (AFK / Non-Interactive)

When the user is not available for interview, the agent must:

1. **Analyze existing context:** Inspect codebase, current UI, PRDs, or requirements documentation.
2. **Infer critical answers:** Formulate high-confidence answers for key questions in Categories 2, 3, and 5.
3. **Document assumptions:** Record all inferred answers in `UX-SPEC.md` using the explicit `⚠️ Assumed:` prefix.
4. **Proceed with implementation:** Continue design and execution, explicitly flagging assumption tags for later review by stakeholders.
