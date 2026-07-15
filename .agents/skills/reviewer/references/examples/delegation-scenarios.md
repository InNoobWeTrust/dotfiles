# Review Delegation Scenarios

Worked examples showing when to delegate vs when to handle directly, with complete delegation prompts and synthesis patterns.

---

## Scenario 1: Audit Review (MUST Delegate)

### User Request
> "Audit this authentication system before we go to production. It handles PII and payment data."

### Analysis
- **Audit review** = requires independent judgment
- **High-stakes** = PII + payment data
- **Confirmation bias risk** = main agent may defend existing implementation
- **Decision**: MUST delegate to the strongest available independent reviewer

### Environment Check
Query available delegated reviewers/workers:
```
List available delegated reviewers/workers with intelligence/capability indicators
```

**Found**: `general` agent with "powered by claude-sonnet-4.5, advanced reasoning" → Suitable for audit

### Delegation Prompt

```markdown
Perform an independent security audit of this authentication system.

You are a senior security auditor with no prior context. Your role is to:
1. Verify security posture is production-ready
2. Identify vulnerabilities with exploitability ratings
3. Challenge assumptions without defending them
4. Provide independent judgment on whether this is safe to ship

Context: This system handles PII and payment data.

Do NOT assume the author's decisions are correct.
Do NOT accept "best practices" without evidence.

Apply full security review protocol from references/sub-reviewers/security.md:
- Secrets & data exposure
- Authentication & authorization
- Input validation & injection
- Cryptography & key management
- Request forgery (SSRF/CSRF)
- Trust boundaries

Artifact to review:
[Include: auth.service.ts, auth.middleware.ts, user.model.ts, payment.controller.ts]

Return findings with:
- Severity: CRITICAL / HIGH / MEDIUM / LOW / INFO
- Attack vectors: Specific exploitable weaknesses with file:line refs
- Exploitability: TRIVIAL / MODERATE / DIFFICULT
- Blast radius: What's compromised if this is exploited
- Mitigations: Concrete remediation steps

Verdict: APPROVED FOR PRODUCTION / NEEDS WORK / DO NOT SHIP
```

### Synthesis (After the Delegated Reviewer Returns)

**Delegated-review findings**:
- CRITICAL: Hardcoded JWT secret in auth.service.ts:15
- HIGH: No rate limiting on /login endpoint → brute force possible
- HIGH: SQL injection in payment.controller.ts:67 (user input in raw query)
- MEDIUM: Session tokens don't expire
- LOW: Weak password requirements (no special chars)

**Main agent output**:
```markdown
## Audit Result: DO NOT SHIP

### Critical Findings (Address Immediately)
1. **Hardcoded JWT secret** (auth.service.ts:15)
   - Severity: CRITICAL | Exploitability: TRIVIAL
   - Blast radius: All user sessions compromised, attacker can forge tokens
   - Mitigation: Move JWT_SECRET to environment variable, rotate immediately

2. **SQL injection** (payment.controller.ts:67)
   - Severity: CRITICAL | Exploitability: MODERATE
   - Blast radius: Full database compromise, payment data exposed
   - Mitigation: Use parameterized queries or ORM for all database operations

### High Priority (Address Before Production)
3. **No rate limiting on auth endpoints**
   - Severity: HIGH | Exploitability: TRIVIAL
   - Blast radius: Brute force attacks, credential stuffing
   - Mitigation: Add rate limiting (5 attempts per 15 min per IP)

4. **Sessions don't expire**
   - Severity: HIGH | Exploitability: MODERATE
   - Blast radius: Stolen tokens valid indefinitely
   - Mitigation: Set expiration (1 hour access token, 7 days refresh token)

### Production Readiness: NOT READY
2 CRITICAL vulnerabilities must be resolved. System is not safe to ship.

Recommend re-audit after fixes.
```

---

## Scenario 2: Multi-Stakeholder Panel (Delegate Separately)

### User Request
> "Review this new checkout flow feature before we merge to main."

### Analysis
- **Multi-perspective needed**: Product Owner (feature completeness), SRE (operational readiness), Security (payment flow safety)
- **Persona isolation required**: Each perspective needs independent context
- **Decision**: Delegate 3 independent reviewers with different personas

### Delegation Strategy

**Delegate 3 independent reviewers in parallel**:

**Reviewer 1: Product Owner Perspective**
```markdown
Review this checkout flow from a Product Owner perspective.

You are the Product Owner for this e-commerce platform.

Your responsibilities:
- Feature acceptance based on user stories
- User value delivery
- Acceptance criteria verification
- Usability for end customers

Review lens: Does this meet acceptance criteria and deliver user value?

User Story:
"As a customer, I want to complete checkout in under 60 seconds with minimal form fields, so I don't abandon my cart."

Acceptance Criteria:
- Guest checkout supported (no forced registration)
- Auto-fill address from postal code
- Support PayPal, credit card, Apple Pay
- Order confirmation with tracking link
- Save payment methods for returning users

Artifact to review:
[Include: CheckoutFlow.tsx, payment-methods.tsx, order-confirmation.tsx]

Evaluate:
1. Does it meet all acceptance criteria?
2. Will users find it fast and easy?
3. What scenarios are not covered?
4. Is scope appropriate or is there creep?

Output format:
- Verdict: ACCEPT / CONDITIONAL / REJECT
- Gaps: Missing acceptance criteria or user scenarios
- User experience concerns
- Recommendations
```

**Reviewer 2: SRE Perspective**
```markdown
Review this checkout flow from an SRE/Operations perspective.

You are the SRE who will be paged at 3 AM when this breaks.

Your responsibilities:
- System reliability and observability
- Failure mode analysis
- Operational burden (deploy, scale, debug)
- Production incident response

Review lens: What breaks in production, and can we fix it fast?

Artifact to review:
[Include: CheckoutFlow.tsx, payment-service.ts, order-service.ts]

Evaluate:
1. Observability: Can we debug at 3 AM? Are there logs/metrics/traces?
2. Failure modes: What breaks under load, payment gateway timeout, database failure?
3. Blast radius: If checkout breaks, does it take down the whole site?
4. Operational burden: How hard to deploy, rollback, scale?
5. Monitoring: Are there alerts for failures?

Output format:
- Operational risks: CRITICAL / HIGH / MEDIUM / LOW with scenarios
- Observability gaps
- Failure scenarios
- Recommendations
```

**Reviewer 3: Security Perspective**
```markdown
Review this checkout flow from a Security Analyst perspective.

You are the security analyst responsible for payment security.

Your responsibilities:
- Payment data security (PCI DSS compliance)
- Authentication & authorization
- Input validation
- CSRF/XSS prevention

Review lens: How would an attacker exploit this?

Artifact to review:
[Include: CheckoutFlow.tsx, payment-service.ts, order-service.ts]

Evaluate:
1. Payment data handling: Is sensitive data logged, stored, or transmitted insecurely?
2. Authorization: Can users access other customers' orders?
3. Input validation: Are prices, quantities, discounts validated server-side?
4. CSRF protection: Are state-changing operations protected?
5. XSS vectors: Is user input sanitized?

Output format:
- Threat severity: CRITICAL / HIGH / MEDIUM / LOW
- Attack vectors with file:line refs
- Exploitability rating
- Mitigations
```

### Synthesis (After 3 Subagents Return)

**Findings summary**:

**Product Owner**:
- ACCEPT with minor conditions
- Meets 4/5 acceptance criteria (missing: Apple Pay)
- UX concern: Error messages not user-friendly

**SRE**:
- HIGH: No timeout on payment gateway call → can hang indefinitely
- MEDIUM: No monitoring on checkout completion rate
- MEDIUM: Single payment service instance → bottleneck under load

**Security**:
- CRITICAL: Price validation only on client-side → user can modify price
- HIGH: Order confirmation email contains full credit card number (last 4 only)
- MEDIUM: No CSRF token on checkout form submission

**Main agent synthesized output**:
```markdown
## Checkout Flow Review: CONDITIONAL APPROVAL

### Critical Blocker (DO NOT MERGE)
**Price manipulation vulnerability** (payment-service.ts:45)
- Source: Security
- Issue: Client-side only price validation → attacker can modify total
- Exploit: Change $100 order to $1 via browser devtools
- Fix: Server-side validation of cart total before payment authorization
- Effort: 1 hour

### High Priority (Address Before Merge)

1. **Payment gateway timeout** (payment-service.ts:78)
   - Source: SRE
   - Issue: No timeout → checkout can hang forever, users stuck
   - Fix: Set 10s timeout with retry logic
   - Effort: 30 min

2. **Credit card exposure in email** (order-confirmation.ts:34)
   - Source: Security
   - Issue: Full card number in plaintext email (PCI DSS violation)
   - Fix: Display last 4 digits only
   - Effort: 15 min

3. **Missing CSRF protection** (CheckoutFlow.tsx:12)
   - Source: Security
   - Issue: Form submission not protected
   - Fix: Add CSRF token to form
   - Effort: 20 min

### Medium Priority (Address in Follow-up)

4. **Monitoring gap** (checkout completion rate)
   - Source: SRE
   - Fix: Add metric + alert for <95% completion

5. **User-facing error messages** (too technical)
   - Source: Product Owner
   - Fix: "Payment failed, please try again" instead of "HTTP 500 Internal Server Error"

6. **Missing Apple Pay** (acceptance criteria)
   - Source: Product Owner
   - Fix: Add Apple Pay integration (separate PR)

### Perspective Conflicts: None
All reviewers agree on blocker. No trade-offs to resolve.

### Verdict: DO NOT MERGE until Critical + High issues resolved (~2 hours effort)

After fixes, meets acceptance criteria and operational/security standards.
```

---

## Scenario 3: Specialized Domain Review (Performance + Accessibility)

### User Request
> "Review this dashboard component before we ship to customers."

### Analysis
- **Specialized domain needs**: Performance (renders 1000+ rows), Accessibility (WCAG compliance)
- **Check environment**: Does it provide specialized delegated reviewers/workers?
  - Performance agent: Not available
  - Accessibility agent: Not available
  - General agent: Available (use with domain expert personas) → Use with domain expert personas

- **Decision**: Delegate 2 general-purpose reviewers with specialized personas

### Delegation Prompts

**Reviewer 1: Performance Engineer Persona**
```markdown
Review this dashboard component for performance.

You are a Performance Engineer.

Your responsibilities:
- Identify performance bottlenecks
- Analyze rendering complexity
- Assess scalability (100 → 1000 → 10000 rows)
- Recommend optimizations by impact

Review lens: What slows down at scale?

Artifact to review:
[Include: Dashboard.tsx, DataTable.tsx, useDataFetch.ts]

Context: This dashboard renders 1000+ rows of real-time data, updated every 5 seconds.

Evaluate:
1. Rendering complexity: Is re-rendering optimized?
2. Data fetching: Are requests efficient? Is there caching?
3. Memory: Does memory grow unbounded over time?
4. Scalability: What breaks at 10,000 rows?

Output format:
- Performance risks: CRITICAL / HIGH / MEDIUM / LOW
- Bottlenecks: file:line with complexity analysis
- Scale limits: At what point does it break
- Optimization recommendations: Ranked by impact
```

**Reviewer 2: Accessibility Specialist Persona**
```markdown
Review this dashboard component for accessibility.

You are an Accessibility Specialist.

Your responsibilities:
- WCAG 2.1 Level AA compliance
- Screen reader compatibility
- Keyboard navigation
- Color contrast and focus indicators

Review lens: Can users with disabilities access this?

Artifact to review:
[Include: Dashboard.tsx, DataTable.tsx, ChartWidget.tsx]

Context: Dashboard used by corporate customers, must meet WCAG AA for procurement.

Evaluate:
1. Screen reader support: Are tables, charts, and controls labeled?
2. Keyboard navigation: Can all features be used without a mouse?
3. Color contrast: Do text and UI elements meet 4.5:1 ratio?
4. Focus indicators: Are focus states visible?
5. Alternative text: Do charts have text descriptions?

Output format:
- WCAG violations: Criterion number with severity
- Impact: Who is affected
- File locations: Where violations occur
- Remediation: Specific fixes ranked by effort
```

### Synthesis

**Performance findings**:
- CRITICAL: No virtualization → renders all 1000 rows at once (Dashboard.tsx:45)
- HIGH: No memoization on data transformation → recalculates on every render
- MEDIUM: Fetches full dataset every 5s → should use incremental updates

**Accessibility findings**:
- HIGH: Data table has no ARIA labels → screen reader can't navigate (DataTable.tsx:12)
- HIGH: Chart has no text alternative → blind users can't access data (ChartWidget.tsx:34)
- MEDIUM: Focus indicator invisible on dark theme (Dashboard.tsx:78)

**Main agent output**:
```markdown
## Dashboard Review: Performance + Accessibility Issues

### Critical Performance Issue
**No virtualization on large dataset** (Dashboard.tsx:45)
- Issue: Renders all 1000 rows at once → DOM has 1000+ nodes
- Impact: Page freezes for 3-5 seconds on load, unusable on mobile
- Scale limit: Breaks completely at >2000 rows
- Fix: Implement virtual scrolling (react-window or react-virtualized)
- Effort: 2-3 hours
- Expected improvement: Render time <100ms regardless of row count

### High Priority

**Performance**:
1. **No memoization on data transform** (Dashboard.tsx:67)
   - Fix: Wrap `processData` in `useMemo` with proper dependencies
   - Impact: Reduces re-renders by ~80%
   - Effort: 15 min

2. **Full dataset refetch** (useDataFetch.ts:23)
   - Fix: Use WebSocket for incremental updates or pagination
   - Impact: Reduces network traffic by 90%
   - Effort: 1-2 hours

**Accessibility (WCAG Violations)**:
3. **Missing table ARIA labels** (DataTable.tsx:12) - **WCAG 1.3.1, 4.1.2**
   - Impact: Screen reader users can't navigate table structure
   - Fix: Add `role="table"`, `aria-label`, `role="row"`, `role="cell"`
   - Effort: 30 min

4. **Chart has no text alternative** (ChartWidget.tsx:34) - **WCAG 1.1.1**
   - Impact: Blind users cannot access chart data
   - Fix: Add `aria-label` with data summary or `<table>` alternative
   - Effort: 45 min

### Medium Priority

5. **Invisible focus indicators** (dark theme) - **WCAG 2.4.7**
   - Fix: Ensure focus outline has 3:1 contrast with background
   - Effort: 10 min

### Trade-offs
**Performance vs Accessibility**: Virtual scrolling requires careful ARIA management for screen readers. Use `react-window` with proper ARIA announcements.

### Verdict
- Performance: NOT production-ready (freezes on load)
- Accessibility: Non-compliant with WCAG AA (procurement blocker)

**Total effort to ship**: ~4-5 hours
```

---

## Scenario 4: Pure Technical Review (No Delegation Needed)

### User Request
> "Quick code review before I commit this refactor."

### Analysis
- **Artifact**: Single file refactor (UserService.ts, 150 lines)
- **Need**: Technical code quality check
- **Complexity**: Moderate (CRUD service)
- **Stakeholder perspectives needed**: None (internal refactor)
- **Decision**: Handle directly using sub-reviewer references

### Direct Review

**Load sub-reviewers**:
1. `references/sub-reviewers/code-quality.md` (architecture, SOLID, smells)

2. `references/sub-reviewers/design-rigor.md` (was this designed properly?)

3. `references/sub-reviewers/edge-case-hunter.md` (null checks, error handling)

**Findings**:

```markdown
## UserService.ts Refactor Review

### Architecture (code-quality.md)
Good: Extracted database logic to repository pattern
Good: Single responsibility (user business logic only)
Code smell: `updateUser` method has 4 parameters → consider parameter object

Recommendation:
```typescript
// Before
updateUser(id: string, name: string, email: string, role: string)

// After
updateUser(id: string, updates: UserUpdateDTO)
```

### Design Rigor (design-rigor.md)
Good: Clear commit history shows incremental refactor
Missing: No test coverage for new repository integration

Recommendation: Add integration test for repository layer before committing

### Edge Cases (edge-case-hunter.md)
Unhandled: `getUserById` doesn't handle case where user is deleted (soft delete)
Unhandled: `updateUser` doesn't validate email format server-side

Recommendations:
- Add `user.deletedAt` check in `getUserById` (line 45)
- Add email validation in `updateUser` (line 78)

### Verdict: CONDITIONAL APPROVAL
- Address 2 edge cases (15 min effort)
- Add repository integration test (30 min effort)
- Consider parameter object refactor (optional, 10 min)

No stakeholder review needed (internal refactor).
```

**No delegation needed** — single technical perspective applied directly.

---

## Scenario 5: Mixed Approach (Technical Direct + Stakeholder Delegated)

### User Request
> "Review this API design before we publish to external partners."

### Analysis
- **Artifact**: OpenAPI spec for partner integration API
- **Technical aspects**: API design, error handling, versioning
- **Stakeholder aspects**: Partner usability, business contract alignment
- **Decision**: Hybrid approach
  - Technical review: Handle directly (code-quality, adversarial, editorial)
  - Stakeholder review: Delegate (Product Manager, Integration Partner persona)

### Step 1: Technical Review (Direct)

Load sub-reviewers: `code-quality.md`, `adversarial.md`, `editorial.md`

**Technical findings**:
- Good: RESTful conventions followed
- Missing: No rate limiting documented
- Missing: Error response format not standardized (some return `{error}`, others `{message}`)
- Adversarial challenge: Why `/v1/orders` but `/products` (no version)? Inconsistent.

### Step 2: Stakeholder Review (Delegate)

**Delegate reviewer 1: Product Manager perspective**
```markdown
Review this API specification from a Product Manager perspective.

You are the PM responsible for external partner integrations.

Your concerns:
- Partner adoption: Will partners find this easy to integrate?
- Business requirements: Does it support agreed use cases?
- Timeline: Are there scope creep concerns?
- Support burden: Will this create support headaches?

Review lens: Will partners successfully integrate with this?

Artifact:
[OpenAPI spec]

Evaluate:
1. Is it clear what each endpoint does?
2. Are there gaps in documented use cases?
3. Is error handling clear enough for partners to debug?
4. Are there hidden operational costs (support, onboarding)?

Output format:
- Partner usability: GOOD / ACCEPTABLE / PROBLEMATIC
- Gaps in use case coverage
- Support burden risks
- Recommendations
```

**Delegate reviewer 2: Integration Partner persona (simulate external developer)**
```markdown
Review this API specification as an external integration partner.

You are a senior developer at a partner company tasked with integrating our API.

Your perspective:
- You have no inside knowledge of our systems
- You need clear documentation to integrate quickly
- You will judge us by our API design quality
- You care about: clear errors, consistent patterns, good examples

Review lens: Can I integrate this in 1 week without asking questions?

Artifact:
[OpenAPI spec]

Evaluate:
1. Are endpoint purposes clear from descriptions?
2. Are request/response examples provided?
3. Can I understand errors and how to fix them?
4. Are authentication and rate limits clear?
5. Is there a sandbox environment?

Output format:
- Integration difficulty: EASY / MODERATE / DIFFICULT
- Confusion points: What's unclear or missing
- Recommendations for better partner experience
```

### Step 3: Synthesize

**Technical** (from main agent):
- Error format inconsistency
- Versioning inconsistency
- Missing rate limit docs

**PM** (from delegated reviewer):
- Gap: Webhook delivery status not documented
- Support risk: No partner onboarding checklist

**Partner** (from delegated reviewer):
- Confusion: No examples for pagination
- Confusion: Auth token refresh not explained
- Missing: Sandbox environment not mentioned

**Synthesized output**:
```markdown
## API Specification Review: Needs Revision Before Publishing

### Critical Issues (Block Publishing)
1. **Inconsistent error response format** (Technical)
   - Some endpoints return `{error}`, others `{message}`
   - Fix: Standardize to `{error: {code, message, details}}`

2. **Missing authentication flow** (Partner feedback)
   - Token refresh not explained
   - Fix: Add auth section with token lifecycle, refresh example

### High Priority (Address Before Launch)
3. **No pagination examples** (Partner feedback)
   - Partners won't know how to request next page
   - Fix: Add pagination example in `/v1/orders` documentation

4. **Versioning inconsistency** (Technical)
   - `/v1/orders` but `/products` (no version)
   - Fix: Version all endpoints: `/v1/products`

5. **Rate limiting undocumented** (Technical + Partner)
   - Partners need to know limits to avoid bans
   - Fix: Document rate limits in overview + response headers

6. **Webhook delivery status missing** (PM)
   - Partners need to monitor webhook health
   - Fix: Add `/v1/webhooks/:id/deliveries` endpoint

### Medium Priority
7. **No sandbox environment mentioned** (Partner)
   - Fix: Add sandbox URL and test credentials section

8. **Partner onboarding checklist missing** (PM)
   - Fix: Create step-by-step integration guide

### Verdict: NEEDS REVISION
- 6 issues must be resolved before publishing
- Estimated effort: 1-2 days
- Re-review after fixes

Recommend: Pilot with 1-2 partners before full launch.
```

---

## Scenario 6: Fallback (No Independent Reviewers Available)

### User Request
> "I need a multi-perspective review (technical + PO + SRE) but I'm using a minimal environment with no delegated-review support."

### Analysis
- **Ideal**: Delegate to 3 independent reviewers with isolated personas
- **Reality**: No independent reviewers available
- **Decision**: Fallback to single-context review with bias warnings

### Approach

**Warn the user**:
```markdown
Note: This review ideally requires independent delegated reviewers for PO and SRE perspectives, but none are available in this environment. Proceeding with single-context review; findings may have confirmation bias.

For production-critical work, consider:
- Human review from actual PO and SRE
- An external review environment with delegated-review support
- Staged rollout with monitoring
```

**Proceed with direct review** using sub-reviewer references:
- Load `code-quality.md`, `security.md`, `edge-case-hunter.md`

**Simulate perspectives** (with explicit bias warnings):
```markdown
## Technical Review
[Standard technical review using sub-reviewers]

## Simulated Product Owner Perspective (bias warning)
**Bias warning**: This perspective is simulated within the same context that knows the technical implementation. For production, get actual PO sign-off.

[Best-effort PO-style evaluation]

## Simulated SRE Perspective (bias warning)
**Bias warning**: This perspective is simulated. For production, have actual SRE review operational readiness.

[Best-effort SRE-style evaluation]

## Recommendation
This review provides technical rigor but lacks independent stakeholder judgment. Before production:
- [ ] Get actual Product Owner acceptance
- [ ] Get actual SRE operational readiness sign-off
- [ ] Consider external security audit if handling sensitive data
```

---

## Summary Decision Table

| Scenario | Approach | Rationale |
|----------|----------|-----------|
| **Audit** | MUST delegate (highest intelligence) | Independent judgment required |
| **Multi-stakeholder** | MUST delegate (separate personas) | Avoid bias contamination |
| **Specialized domain** | Should delegate (if available) | Domain expertise + focus |
| **Pure technical** | Can handle directly | Single technical perspective |
| **Mixed** | Hybrid (direct + delegate) | Separate technical from stakeholder |
| **No independent reviewers** | Fallback with warnings | Warn user of bias risk |

Use `references/delegation/framework.md` decision tree to classify your scenario.
