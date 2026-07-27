# Stakeholder Report Pack

Audience-adapted QA reporting. Internal machine formats stay YAML/Markdown; final communication adapts to who must act on the result.

**Load this reference only when** a non-dev / business / release-owner audience will consume results, or the user explicitly asks for Excel / PDF / static HTML. Engineering-only runs must not load this path.

This skill defines **generic contracts and practices** in English. Locale, translation, legal wording, and org-specific templates (sheet names, approval columns, cover-letter format) belong in the **target repository**, not in this skill.

---

## Goal

After a QA run (spot check, browser audit, release smoke, or automated suite), produce the right **communication artifacts** for:

- engineers who need repro steps and evidence links
- product/tech leads who need a decision-ready summary
- business stakeholders who prefer Excel matrices, short PDF summaries, or a hosted static HTML report

YAML scenarios and finding records remain the **source of truth**. Excel / PDF / HTML are **derived projections**, never the canonical record.

---

## Core Principle

| Layer | Format | Audience | Role |
|---|---|---|---|
| Machine evidence | YAML (`run-card`, findings, artifacts-manifest) | Agents, CI, automation | Canonical, machine-readable |
| Engineering summary | Markdown | Devs, QA, tech leads | Repro, severity, artifact links |
| Stakeholder pack | Excel + PDF (+ optional static HTML) | Business / non-technical stakeholders | Decision, risk, next actions |

**Never** hand stakeholders raw scenario YAML or finding YAML as the primary deliverable.

**Never** invent stakeholder numbers that are not backed by the machine evidence layer.

**Never** soft-pass `unverified` / `blocked` into pass/OK in any stakeholder surface.

---

## Audience Gate (before loading this path)

Ask once if unknown:

1. Who needs to act on this result? (`eng-only` | `mixed` | `business` | `release-owner`)
2. Preferred surfaces? (`md-only` | `excel` | `pdf` | `html` | combination)

| Audience | Load this path? | Default surfaces |
|---|---|---|
| `eng-only` | **No** | `summary.md` + YAML only |
| `mixed` / tech lead | Yes if non-dev will read it | PDF or HTML + eng MD annex |
| `business` | **Yes** | Excel + PDF |
| `release-owner` go-no-go | **Yes** | Full pack (Excel + PDF; HTML optional) |

Do not block machine/engineering records while waiting for format preference.

---

## When To Produce What

| Run type | Default outputs | Stakeholder pack |
|---|---|---|
| Spot check (eng-only) | Engineering MD + evidence links | **Skip** (do not emit Stakeholder Pack section) |
| Spot check (business will decide) | Machine + eng MD | At least PDF **or** Excel KPI + Findings |
| Structured browser audit (eng-only) | Machine YAML + engineering MD | **Skip** |
| Structured browser audit (non-dev consumers) | Machine + eng MD | Derive requested surfaces |
| Release / go-no-go (business/release owners) | Full machine + eng MD | **Required** — at least one of Excel, PDF, HTML |
| Materialization-only work | Engineering plan / manifest | Not a stakeholder QA result pack |
| Automated suite re-run | Runner report + eng summary | HTML preferred when available; Excel/PDF for exec rollup |

---

## Audience Matrix

| Audience | Prefer | Acceptable | Avoid as primary |
|---|---|---|---|
| Developers / QA | Markdown summary, YAML findings, artifact paths | Static HTML with deep links | Long business prose with no repro |
| Tech lead / PM | Markdown + short risk table; HTML dashboard | 1-page PDF | Raw YAML dumps |
| Business / non-technical stakeholders | Excel workbook + 1–2 page PDF | Hosted static HTML summary | YAML, Markdown-only, jargon-heavy repro logs |
| Mixed business + eng | Excel + PDF exec + MD engineering annex | HTML dashboard | Machine YAML as the only artifact |
| Decision-only exec | Executive subset (see below) | 1-page PDF | Full evidence matrix + raw trace links |

### Status vocabulary (machine → stakeholder display)

Use stable English labels in this skill. Target repos may map these to local language **without changing machine status values**.

| Machine status | Stakeholder display (EN default) | Display rule |
|---|---|---|
| pass | Pass / OK | May show as OK |
| fail | Fail / NG | Must remain fail/NG |
| unverified | Unverified | **Must remain Unverified** — never map to OK |
| blocked | Blocked | Must remain Blocked |

### Severity → business phrasing

Anchor only; always cite `finding_id`. Target repos may rephrase for domain vocabulary.

| Machine severity | Business phrasing |
|---|---|
| critical | Blocks release / money or trust risk |
| high | Likely user-facing breakage; fix before broad release |
| medium | Degraded experience; schedule fix |
| low | Polish / edge case; track |

### Localization (out of scope here)

If stakeholders need non-English copy, org-specific approval columns, or local report chrome:

1. Keep machine YAML status enums in English (`pass` | `fail` | `unverified` | `blocked`).
2. Apply display translation and templates in the **target repository** (e.g. `qa/report-templates/`).
3. Do not fork this skill’s contracts per locale.

---

## Canonical Machine Record (always first)

Produce or refresh these before any stakeholder export:

```text
qa/artifacts/browser-audits/<date>/<run-id>/
  run-card.yaml
  findings.yaml
  artifacts-manifest.yaml
  summary.md
  screenshots/
  traces/
  a11y/
  reports/                 # derived only; git-ignore + access-control
    stakeholder-summary.pdf
    stakeholder-results.xlsx
    html/
```

Minimum machine fields every finding must keep:

- `finding_id`, `scenario_id`, `severity`
- `evidence_grade`: `browser-audited` | `heuristic` | `unverified` | `blocked`
- browser + viewport
- expected vs observed
- artifact references
- `regression_candidate`
- optional `stakeholder_safe`: true | false (default false until projection gate passes)

Stakeholder exports **project** these fields; they do not replace them.

---

## Projection Gate (mandatory before Excel/PDF/HTML)

Run these checks **before** writing any stakeholder file. Fail closed: if a gate fails, do not emit the pack (emit eng MD only + blocker note).

### 1. Source sanitization

Scan projected text fields (`expected`, `observed`, business impact, notes) for:

- token-like patterns (`Bearer `, `session=`, `token=`, long base64 blobs)
- emails / phone-like PII when not required for the decision
- absolute internal hostnames/paths that are recon-sensitive (prefer redacted labels)

Redact or rewrite before projection. Never copy raw secrets into Excel/PDF/HTML cells.

### 2. Artifact sensitivity

From `artifacts-manifest.yaml`:

- If `sensitive: true` (or unknown and artifact is a **trace** / auth-bearing capture): **exclude** from stakeholder Evidence Index and HTML assets.
- Screenshots: only link after a content check for URL-bar tokens, on-page PII, or authenticated-only data that business recipients must not see.
- Prefer stakeholder-safe screenshots only; keep full traces eng-only.

### 3. Provenance / evidence grade

Every journey row and finding row in stakeholder surfaces must carry:

| Field | Values |
|---|---|
| Evidence grade | `browser-audited` / `heuristic` / `unverified` / `blocked` |
| Machine status | pass / fail / unverified / blocked |

**Attestation rule:** polished formatting must not amplify weak evidence. `unverified` and `blocked` require explicit visual treatment (never green OK).

### 4. Count consistency

Excel KPI counts, PDF verdict inputs, and HTML totals **must** match `findings.yaml` + journey results in the machine record. If they disagree, fix the projection — do not ship.

### 5. Transmission / storage

- `reports/` must be git-ignored and access-controlled (same policy as other QA artifacts).
- For packs containing findings or evidence links: transmit via access-gated share or encrypted channel; do not attach unrestricted packs to open email threads by default.
- Hosted HTML: see hosting rules below.
- **HTML assets:** only relative/local paths — reject packs that load third-party CDNs, remote fonts, scripts, or analytics.

---

## Generation Realism

"Produce Excel/PDF" means one of:

1. **Structurally valid** `.xlsx` / `.pdf` / HTML directory matching the contracts below, **or**
2. An **explicit interim** deliverable clearly labeled as such, e.g.:
   - `stakeholder-results.csv` (+ convert notes with sheet mapping), or
   - Markdown exec summary named `stakeholder-summary.md` with note `PDF conversion pending`

**Forbidden:** renaming Markdown/CSV to `.xlsx`/`.pdf` and claiming the workbook/PDF contract is satisfied.

If tooling cannot emit a real workbook/PDF in this environment, say so, ship the interim format, and list the conversion step as a follow-up — do not fake binary formats.

---

## Engineering Summary (Markdown)

Default handoff to developers (always):

```markdown
## Browser Audit Summary
## Passed Journeys
## Findings
## Evidence
## Regression Candidates
## Blockers / Unverified Claims
```

**Audience-branched addition** — include **only** when audience is not `eng-only`:

```markdown
## Stakeholder Pack
- Audience: [business | mixed | release-owner]
- Excel: [path | interim CSV path | skipped: reason]
- PDF: [path | interim MD path | skipped: reason]
- HTML: [URL/path | skipped: reason]
- Projection gates: [pass | fail: reason]
```

Do **not** emit an empty `## Stakeholder Pack` section for eng-only runs.

---

## Excel Workbook Contract

Primary format for tabular business review and sign-off tracking.

### Workbook name

`QA-Report-<project>-<run-id>.xlsx`

### Required sheets (full pack)

English sheet keys below are the **generic contract**. Target repos may rename tabs for local presentation as long as the same logical sheets exist.

| Sheet key | Purpose |
|---|---|
| Cover | Identity, scope, overall result, recommendation |
| KPI Summary | Chart-friendly counts |
| Journey Results | Per-journey pass/fail matrix |
| Findings | Business-impact findings with provenance |
| Evidence Index | Stakeholder-safe artifact links |
| Decisions | Options, recommendation, next actions |
| Approval | Human sign-off rows |

#### 1. Cover

| Field | Example |
|---|---|
| Project | acme-shop |
| Environment | preview |
| Run ID | bbqa-checkout-smoke-2026-07-27 |
| Date | 2026-07-27 |
| Scope | checkout happy path + invalid card |
| Overall result | 1 OK / 1 NG / 0 Unverified |
| Release recommendation | No-Go / Go with conditions / Go |
| Prepared by | QA agent / human owner |
| Reviewed by | (blank) |
| Approved by | (blank) |

#### 2. KPI Summary

| Metric | Value |
|---|---|
| Journeys total | N |
| OK | N |
| NG | N |
| Unverified | N |
| Blocked | N |
| Critical findings | N |
| High findings | N |
| Blockers | N |
| Browsers / viewports | chromium · desktop-1440 · iphone-12 |

One metric per row; numeric values where possible.

#### 3. Journey Results

| Journey ID | Business name | Priority | Result | Evidence grade | Browser | Viewport | Notes |
|---|---|---|---|---|---|---|---|
| checkout-happy-path | Happy-path checkout | critical | OK | browser-audited | chromium | desktop-1440 | — |
| checkout-invalid-card | Invalid card rejected | high | NG | browser-audited | chromium | iphone-12 | spinner hangs |

Business name should be human-readable; Journey ID stays for engineering traceability.

#### 4. Findings

| Finding ID | Severity | Evidence grade | Business impact | Source | Expected | Observed | Journey | Owner | Status | Evidence link |
|---|---|---|---|---|---|---|---|---|---|---|
| bbqa-004 | high | browser-audited | Users get stuck when payment fails | finding bbqa-004 · severity high | Inline error; no order | Spinner hangs | checkout-invalid-card | (blank) | open | screenshots/... |

Rules:

- **Business impact** is mandatory; rewrite in plain language **and** keep `Source` citing `finding_id` + machine severity (no free-floating exec fiction).
- Expected/Observed may be shortened; full technical detail stays in Markdown/YAML.
- Owner/Status support human workflow after delivery.
- Do not link `sensitive: true` artifacts.

#### 5. Evidence Index

| Artifact | Type | Journey | Finding ID | Stakeholder-safe | Path or URL |
|---|---|---|---|---|---|
| hang screenshot | screenshot | checkout-invalid-card | bbqa-004 | yes | screenshots/... |

Omit rows that fail the sensitivity gate; note eng-only traces in engineering MD only.

#### 6. Decisions / Next Actions

Structured decision block (concept; org templates may extend):

| Field | Content |
|---|---|
| Why decide now | Short business context |
| Options | e.g. Ship / Ship with conditions / Fix-first / Re-test |
| Recommendation | One option + one-line rationale tied to counts/verdict |
| Risk if ignored | Plain language grounded in finding ids |

Plus action table:

| Action | Priority | Owner | Due | Depends on |
|---|---|---|---|---|
| Fix invalid-card error UX | high | eng | — | bbqa-004 |
| Re-run release audit | high | QA | after fix | — |

#### 7. Approval

| Role | Name | Date | Sign-off |
|---|---|---|---|
| Prepared | | | |
| Reviewed | | | |
| Approved | | | |

Target repos may add extra approval roles required by local process; keep at least these three concepts.

### Executive subset (decision-only)

When audience is decision-only and must not receive the full matrix:

**Required sheets only:** Cover + KPI + Findings (top N by severity, max 10) + Decisions + Approval.

**Omit:** full Evidence Index with deep links (point to eng owner for screenshots); full Journey matrix may collapse to a one-liner on Cover.

### Excel anti-patterns

- Using Excel as the only stored record (no YAML/MD backing)
- Dumping full stack traces into cells
- Merging cells so filters break
- Omitting Journey ID / Finding ID so engineers cannot map back
- Mapping Unverified → OK
- Linking sensitive traces into Evidence Index
- Claiming `.xlsx` when only CSV/MD was produced

---

## PDF Executive Summary Contract

### File name

`QA-Executive-Summary-<project>-<run-id>.pdf`

### Length

- Default: **1 page**
- Hard max: **2 pages**

### Required sections

1. **Title block** — project, env, date, run id, overall verdict
2. **Verdict** — Go / Go with conditions / No-Go / Blocked
3. **What we checked** — 3–7 journey names in business language
4. **What works** — short bullets
5. **What fails / blocks / unverified** — short bullets with business impact + finding ids
6. **Risk if we ship anyway** — only when grounded in failed/blocked critical journeys; cite finding ids
7. **Decision needed** — options + recommendation
8. **Approval** — Prepared / Reviewed / Approved blank lines for human sign-off
9. **Evidence pointer** — Excel / HTML pack or eng owner

### PDF tone rules

- Prefer business outcomes over component names
- Prefer “Users cannot complete payment on mobile (bbqa-004)” over “assertion `a3` failed on `#submit`”
- No YAML fences; no raw selector lists
- Screenshots: at most 1–2 **stakeholder-safe** thumbnails
- Never present `unverified` items as working

### Minimal text skeleton (English contract)

```text
QA Executive Summary — <project> / <env>
Date: <date>   Run: <run-id>
Verdict: <Go | Go with conditions | No-Go | Blocked>

Checked:
- <business journey 1>
- <business journey 2>

Working:
- ...

Not working / blocked / unverified:
- ... (business impact · finding_id)

Ship risk (if any; cite finding ids only):
- ...

Decision needed:
- Options: ...
- Recommendation: ...

Approval: Prepared ____  Reviewed ____  Approved ____

Details: Excel matrix + evidence index in the stakeholder pack.
```

Target repos may supply translated skeletons; keep the same section semantics.

---

## Static HTML Report Contract

### When preferred

- CI already publishes a report URL
- Stakeholders want clickable screenshots without opening Excel
- Nightly/release runs benefit from a stable hosted location

### Minimum HTML pack

```text
reports/html/
  index.html
  assets/             # stakeholder-safe screenshots only
```

`index.html` must show:

- overall counts (OK / NG / Unverified / Blocked)
- verdict
- evidence-grade visible on findings
- journey table
- findings table with links only to stakeholder-safe assets
- link/note to Excel/PDF if produced

### Hosting rules

- Sanctioned internal hosting only
- **Access control:** authentication **or** non-guessable URL (high entropy path)
- **TTL / retention:** set expiry or auto-delete policy for release-audit reports (document owner + retention)
- Do not publish auth cookies, tokens, or PII in HTML
- **Require relative asset paths only** — no third-party CDN fonts, scripts, analytics, or remote images (avoids referrer leakage and keeps the pack portable as a zip)
- Vendor runner HTML (Playwright/Allure) is not a business executive summary unless it includes verdict + business impact sections — wrap or link, do not relabel

---

## Derivation Pipeline

```text
run-card.yaml + findings + artifacts-manifest
        │
        ▼
 projection gates (sanitize · sensitive · provenance · counts)
        │
        ▼
   summary.md  (engineering)
        │
        ├──► stakeholder-results.xlsx  (or labeled interim CSV)
        ├──► stakeholder-summary.pdf   (or labeled interim MD)
        └──► reports/html/             (optional)
```

Always derive outward; never reverse-sync stakeholder edits into YAML automatically.

Optional **target-repo** step after projection: apply local templates/translation without mutating machine YAML.

### Field mapping

| Stakeholder field | Source |
|---|---|
| Overall result counts | Journey results in machine record |
| Journey business name | Scenario title / feature prose; fall back to `scenario_id` |
| Business impact | Plain rewrite of severity + expected/observed **with** `finding_id` source cite |
| Evidence grade | Machine `evidence_grade` / status — never upgraded |
| Evidence link | Only `stakeholder_safe` / non-sensitive artifacts |
| Verdict | Explicit QA judgment from verdict guidance — not raw fail count alone |

### Verdict guidance

| Pattern | Typical verdict |
|---|---|
| All critical journeys OK, no high/critical findings | Go |
| Non-critical failures only, workaround exists | Go with conditions |
| Any critical journey NG or release blocker | No-Go |
| Missing auth/fixtures/environment proof | Blocked / No-Go (do not soft-pass) |
| Material Unverified on critical path | Blocked or No-Go — not Go |

---

## Consistency Validator (done-signal)

Before claiming stakeholder reporting complete, verify (manually or via script):

```text
validate-stakeholder-pack checks:
  [ ] audience was non-eng (or user explicitly requested pack)
  [ ] machine YAML + summary.md exist
  [ ] projection gates passed
  [ ] KPI counts match machine journey results
  [ ] every fail/unverified/blocked row retains correct status label
  [ ] every finding row has finding_id + evidence_grade
  [ ] no sensitive artifacts in Evidence Index / HTML assets
  [ ] Excel/PDF/HTML are real formats or explicitly labeled interim
  [ ] PDF/Excel verdict agrees with machine summary verdict
  [ ] HTML (if any) uses relative assets only — no third-party loads
```

If a check fails: do not deliver the pack; fix or fall back to eng MD + blocker list.

---

## Delivery Checklist

- [ ] Audience gate selected; eng-only did not produce a pack
- [ ] Machine evidence layer exists and matches report numbers
- [ ] Engineering Markdown exists for developer follow-up
- [ ] Projection gates passed (sanitize, sensitive, provenance, counts)
- [ ] Full pack sheets complete **or** executive subset intentionally chosen
- [ ] Approval + decision options/recommendation present for formal go-no-go
- [ ] PDF verdict consistent with Excel counts
- [ ] No secrets, session tokens, or real PII in any surface
- [ ] Every NG row has business impact **and** finding_id source
- [ ] Unverified items labeled Unverified (never OK)
- [ ] Paths/URLs reachable under access-controlled delivery
- [ ] Formats are real or explicitly interim (no fake extensions)
- [ ] Any locale/template adaptation applied in target repo, not by inventing skill forks

---

## Spot-Check Shortcut

| Recipients | Action |
|---|---|
| Eng only | `summary.md` only; **do not** load this reference; **do not** emit Stakeholder Pack section |
| Business owner for release | Machine + eng MD + at least PDF **or** Excel KPI+Findings; prefer both if formal |

---

## Anti-Patterns

| Temptation | Why wrong | Correct path |
|---|---|---|
| Send scenario YAML to business stakeholders | They will not read it | Derive Excel/PDF |
| Make Excel the source of truth | Diverges from automation | YAML/MD canonical |
| Paste stack traces into PDF | Unreadable for business | Business impact + finding_id |
| Translate “unverified” into “pass” | Hides risk | Keep Unverified |
| Pretty HTML with no machine record | Cannot re-run | Always keep run-card + findings |
| One giant PDF full of tables | Serves neither audience | PDF short; Excel matrix; MD eng |
| Always emit Stakeholder Pack section | Ceremony tax on eng-only | Audience-branch dispatch |
| Fake `.xlsx`/`.pdf` via rename | False confidence | Real format or labeled interim |
| Link Playwright traces into business Excel | Session/PII leakage | sensitive exclude; eng-only traces |
| Free-form ship risk with no finding_id | Hallucinated exec fiction | Cite machine findings only |
| Bake locale-specific copy into this skill | Breaks reuse across repos | English contracts here; templates in target repo |
| HTML pack loads CDN fonts/scripts | Referrer leak; non-portable zip | Relative assets only |

---

## Collaboration Notes

- Narrative polish for high-stakes exec wording may use a data-storytelling / editorial pass **after** projection gates pass.
- Browser mechanics and raw captures stay in the browser-control / audit execution path.
- This reference owns **report shape, audience adaptation, and projection trust gates**, not screenshot capture or per-org localization.

---

## Done Signal

A reporting task is complete only when:

1. Canonical machine evidence is present
2. Audience gate was applied (eng-only correctly skipped this path)
3. Requested audience surfaces exist (or explicit interim/skip with reason)
4. Projection gates and consistency validator pass
5. Counts and verdicts match across MD / Excel / PDF / HTML
6. Recipients can answer: **What failed, how bad is it for the business, what is the evidence grade, and what decision is needed?**
