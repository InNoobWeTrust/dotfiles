## Phase 1: Context & Candidate Profiling

Define the ideal target profile before looking at individual applications.

1. **Analyze the Job Description (JD)**: Extract must-have hard requirements (skills, years of experience, certifications) and soft signals (culture fit, mindset, communication style).
2. **Profile the Hiring Organization**: Do not rely solely on self-reported hiring context. Independently research:
   - Financials, funding status, recent news (layoffs, pivots).
   - Glassdoor / Blind reviews to identify recurring cultural themes or high-attrition indicators.
   - LinkedIn turnover signals (how long do employees stay in similar roles?).
   - Legal filings, labor disputes, or regulatory issues.
   - Leadership stability and team growth context (expanding vs. backfilling attrition).
3. **Produce Candidate Profile**: Save a markdown profile containing must-have traits, strong-signal traits, bonus traits, candidate red flags, and 2-3 persona sketches of ideal candidates.

---

## Phase 2: Resume Screening & Claim Extraction

Audit resumes methodically against the Candidate Profile created in Phase 1.

1. **Claim Extraction**: Parse employment history, education, skills, key achievements, certifications, and project descriptions.
2. **Trait Matching**: Rate the candidate on each must-have and strong-signal trait (Strong Match, Partial Match, Missing, or Unverifiable).
3. **Inconsistency Flagging**: Spot gaps in timelines, vague employment claims, inflated titles, or skills listed without corresponding hands-on experience.

---

## Phase 3: OSINT Verification

Validate professional credentials and trace digital footprint to confirm claims and surface insights not visible on the resume.

| Source | What to Look For |
| :--- | :--- |
| **LinkedIn** | Title/date alignment with resume, network growth, endorsements, public activity. |
| **GitHub / GitLab** | Actual contribution history, code cleanliness, project complexity, commit patterns. |
| **Technical Forums** | (e.g., Stack Overflow) Technical depth, communication tone, community helpfulness. |
| **Personal Site / Blog** | Written communication, side projects, technical leadership, values. |
| **Registries / Press** | Company directorships (for senior roles), press mentions, public accomplishments, or disputes. |

### Verification Principles
- **No speculation**: Absence of online evidence is not proof of misrepresentation. Note what was unverifiable; do not guess.
- **Traceability**: Every claim made in the evaluation must link directly to a source or cite a specific quote.
- **Privacy Boundaries**: Confine checks strictly to professional and public footprints. Avoid personal or private spaces unless directly relevant to professional risk.

---

## Phase 4: Tri-Directional Risk Assessment

Assess potential liabilities for all parties involved:

### 1. Risks About the Candidate
- **Misrepresentation**: Inflated accomplishments, degree mills, ghost-written portfolios.
- **Flight Risk**: History of extremely short tenures, mismatched salary expectations.
- **Conflict of Interest**: Active parallel ventures, undisclosed advisory positions.
- **Reputational Exposure**: Public controversies or discriminatory public speech.

### 2. Risks About the Hiring Company
- **Financial Instability**: Downsizing signals, funding limits, legal exposures.
- **Employer Brand Issues**: Negative worker reviews, systemic burnout patterns.
- **bait-and-switch**: The actual role differs substantially from the advertised JD.

### 3. Risks for the Recruiter / Intermediary
*(Skip if hiring directly)*
- **Asymmetric Information**: Critical timeline details hidden by either party.
- **Scope Creep**: Described requirements don't map to what the team actually needs.

---

## Phase 5: Evaluation Report Format

Produce a standalone evaluation report for each candidate:

```markdown
# Candidate Evaluation: [Name]

## Summary Verdict
[STRONG FIT / POTENTIAL FIT / WEAK FIT / NO FIT]
*One-paragraph summary justification outlining core alignment and major concerns.*

## 1. Trait Match
| Trait | Rating | Evidence / Notes |
| :--- | :--- | :--- |
| [Trait name] | Strong / Partial / Missing / Unverifiable | [Citations or notes] |

## 2. Resume Verification
| Claim | Status | Verification Source / Note |
| :--- | :--- | :--- |
| [e.g., Senior Developer at X] | Verified / Unverifiable / Inconsistent | [Citations or notes] |

## 3. OSINT Findings & Digital Footprint
- **LinkedIn**: [Summary with links]
- **GitHub / Projects**: [Summary of codebase quality with links]
- **Thought Leadership / Public**: [Summary with links]

## 4. Risk Assessment
- **Risks to Hiring Party**: [e.g., flight risk, non-compete constraints]
- **Risks to Candidate**: [e.g., company's recent team restructuring]

## 5. Recommendation & Interview Probes
*Explicit recommendation (Proceed / Pass / Request Info) and 3-4 highly specific interview questions designed to probe identified discrepancies or key areas of interest.*
```

---

## Data Retention & Deletion
- Delete candidate evaluation reports once the hiring decision is finalized.
- Do not retain OSINT files beyond the active screening window.
- Apply strict need-to-know access controls to folders containing candidate evaluations.
