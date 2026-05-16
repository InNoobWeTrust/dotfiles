---
description: >
  Use this prompt to screen CVs for potential candidates based on
  traits/personas crafted from the JD and management's vision.
---

> **⚠️ Jurisdiction Notice**: referenced sources and practices
> vary by country (company registries, labor law, privacy regulations).
> Adapt the OSINT sources and risk categories to your local legal context.
> When in doubt, consult local employment law before investigating.

## Inputs

Provide the following before starting:

- **Job description** — the role being hired for
- **Hiring context** (optional) — team vision, management preferences,
  cultural priorities, growth plans
- **Jurisdiction** (recommended) — country/region for legal context.
  If not specified, **ask before proceeding** — OSINT sources and risk
  categories vary significantly by region.
- **CVs** — one of:
  - A directory path containing CV files
  - Individual file paths referenced directly
  - CV content pasted inline (for small batches)

---

## Phase 1: Build Context and Candidate Profile

Construct traits and personas of the ideal candidate — but first,
independently verify the hiring side. They may not tell you everything.

### Steps

1. **Analyze the JD**: Extract hard requirements (skills, experience, certs)
   and soft signals (culture fit, mindset, growth potential)
2. **Incorporate hiring context**: If provided, use management's vision to
   weight traits. Note: hiring managers often describe what they *think*
   they want — treat their input as preference signals, not gospel
3. **Research the hiring company independently**: Do not rely solely on
   what the hiring side tells you. Investigate:
   - Company financials, funding status, recent news (layoffs? pivots?)
   - Glassdoor / Blind reviews — look for patterns, not outliers
   - LinkedIn turnover signals — how long do people stay in similar roles?
   - Legal filings, labor disputes, regulatory actions
   - Leadership stability — recent C-suite departures?
   - The team that's hiring — is it growing or backfilling attrition?

   Save findings as a **hiring company profile**. If you find red flags,
   they feed directly into Phase 4 (Tri-Directional Risk Assessment).
   This research also calibrates what kind of candidates would genuinely
   thrive vs. be set up to fail.
4. **Research the role market**: What does this role look like at comparable
   companies? What skills are emerging vs declining in this space? What
   compensation ranges are realistic?
5. **Produce a candidate profile document**: Save as markdown. Include:
   - Must-have traits (dealbreakers if missing)
   - Strong-signal traits (significantly increase fit)
   - Bonus traits (nice to have, not decisive)
   - Red flags to watch for
   - Persona sketches (2-3 archetypes of strong candidates)
   - Hiring company context notes (what candidates should know)

---

## Phase 2: Screen Each CV

For each CV in the directory, evaluate against the candidate profile.

### Steps

1. **Parse the CV**: Extract claims — employment history, education,
   skills, achievements, certifications, projects
2. **Evaluate trait match**: Score each candidate against the profile
   from Phase 1. Be specific about which traits are present, absent,
   or uncertain
3. **Flag inconsistencies**: Look for gaps, vague claims, inflated titles,
   mismatched timelines, or skills listed without supporting experience

---

## Phase 3: OSINT Verification

Trace each candidate's digital footprint to verify claims and surface
information not in the CV. This is a *verification and discovery* step,
not a surveillance operation.

### Sources to Check

| Source | What to Look For |
|--------|-----------------|
| **LinkedIn** | Title/date consistency with CV, endorsements, recommendations, activity level, network quality |
| **GitHub / GitLab** | Contribution history, code quality, project involvement, commit frequency, collaboration patterns |
| **Stack Overflow / forums** | Technical depth, communication style, helpfulness, domain expertise |
| **Personal site / blog** | Writing quality, thought leadership, side projects, values |
| **Conference talks / publications** | Public speaking, research, community involvement |
| **News / press mentions** | Company mentions, controversies, achievements |
| **Company registries** | For senior candidates — directorships, company affiliations, conflicts of interest |

### Verification Principles

- **Every claim you make must be traceable** — link or quote the source.
  If you cannot verify a CV claim, state explicitly: "Unverifiable: [claim].
  No supporting evidence found online."
- **Do not fabricate or assume** — absence of evidence is not evidence of
  absence. Note what you could not find, don't fill gaps with speculation.
- **Respect privacy boundaries** — verify professional claims and public
  information. Do not dig into personal life unless it directly relates
  to professional risk (e.g., undisclosed conflicts of interest).

---

## Phase 4: Tri-Directional Risk Assessment

Assess risks in **all directions**. Do not assume any party is trustworthy —
verify everyone, report for everyone.

### Risks About the Candidates

| Risk Category | What to Look For |
|---------------|-----------------|
| **Misrepresentation** | Inflated titles, fabricated experience, degree mill certs, ghost-written portfolios |
| **Flight risk** | Pattern of short tenures, active job searching signals, misaligned compensation expectations |
| **Cultural mismatch** | Communication style conflicts, values misalignment, work style incompatibility |
| **Conflict of interest** | Active competing ventures, undisclosed advisory roles, non-compete constraints |
| **Reputation risk** | Public controversies, discriminatory speech, legal disputes |

### Risks About the Hiring Company

The company posting the role may not be what it claims. Verify independently:

| Risk Category | What to Look For |
|---------------|-----------------|
| **Financial instability** | Funding status, revenue trends, recent layoffs, pending lawsuits, credit issues |
| **Employer reputation** | Glassdoor/Blind reviews, turnover patterns, exit interview themes, public complaints |
| **Role misrepresentation** | JD doesn't match actual work, inflated title to justify low pay, bait-and-switch history |
| **Legal/compliance risk** | Labor law violations, unpaid wages history, contractor misclassification |
| **Growth viability** | Shrinking market, product-market fit concerns, leadership instability |

### Risks for You (Hiring Partner)

> **Skip this section if you are the direct hiring party.** This applies only
> to recruiters, consultants, or intermediaries.

If you are consulting or intermediating, these risks apply to your position:

| Risk Category | What to Look For |
|---------------|-----------------|
| **Reputational exposure** | Placing a bad candidate reflects on you. Placing into a bad company reflects on you. Both sides must check out. |
| **Information asymmetry** | One side knows something the other doesn't — undisclosed constraints, secret timelines, competing offers |
| **Scope mismatch** | The role described to you differs from what the company actually needs. Candidates will blame you. |
| **Payment/contract risk** | Company's history of paying recruiters/consultants — are there disputes? |

---

## Phase 5: Produce Evaluation Report

For each candidate, produce a markdown report.

- If CVs were provided as files → save reports in the same CV directory
- If CVs were pasted inline → save reports to agent artifacts

### Report Structure

```markdown
# Candidate Evaluation: [Name]

## Summary Verdict
[STRONG FIT / POTENTIAL FIT / WEAK FIT / NO FIT]
One-paragraph justification.

## Trait Match
| Trait | Rating | Evidence |
|-------|--------|----------|
| [trait from profile] | Strong / Partial / Missing / Unverifiable | [specific evidence] |

## CV Verification
| Claim | Status | Source |
|-------|--------|--------|
| [employment/education/skill] | Verified / Unverifiable / Inconsistent | [link or note] |

## OSINT Findings
- [finding with source link]
- [finding with source link]

## Risk Assessment

### Risks to Hiring Party
- [risk — severity — evidence]

### Risks to Candidate
- [risk — what to surface in the interview]

## Recommendation
[Proceed to interview / Request additional info / Pass]
Specific interview questions to probe unresolved concerns.
```

### Quality Standards

- All claims from candidate or from you must be backed by traceable evidence
- A human reviewer will fact-check your work — do not fabricate or embellish
- When uncertain, say so explicitly rather than hedging with vague language
- Include links or quote sources for every OSINT finding

## Data Retention

- Delete candidate evaluation reports after the hiring decision is finalized
- Do not retain OSINT findings beyond the active screening period
- Check local privacy regulations (e.g., GDPR, CCPA) for mandatory retention
  limits and deletion requirements
- If storing reports in shared systems, apply need-to-know access controls

---

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Use the block above as raw additional user input. Preserve whitespace, blank lines, and quoting exactly. If the block is empty, rely on the conversation context instead.

Follow the instructions above to work on the user's screening request right below.

---
