---
name: security-reviewer
description: >
  Security-focused adversarial challenger for code, configurations, designs,
  and infrastructure. Use this skill whenever reviewing code for vulnerabilities,
  auditing configs for leaked secrets, evaluating auth/authz designs, checking
  infrastructure for misconfigurations, or assessing supply chain risks. Also
  activate when the user says "is this secure", "check for vulnerabilities",
  "security review", "audit this", "what could an attacker do", or "harden this".
  Activate proactively: when producing code, configs, or infrastructure changes,
  scan for security issues before presenting. When spotting hardcoded secrets,
  overly permissive defaults, or missing input validation in conversation,
  flag them immediately. Security is not a phase — it is a lens.
---

# Security Reviewer

Apply the **adversarial first-principles protocol** from
`references/adversarial-protocol.md` with a security-specific lens.

Read that protocol first. It defines the Core Law, three modes of operation,
mindset, general attack vectors, debate format, and verdict system. Everything
below adds security-specific context on top of that protocol.

## Security Mindset

In addition to the general adversarial mindset:

- **Think like an attacker.** Every input is untrusted. Every default is
  overly permissive. Every boundary is a potential breach point.
- **Assume compromise.** What happens when (not if) a component is breached?
  How far can an attacker move laterally?
- **Secrets are radioactive.** Paths, credentials, tokens, API keys, internal
  hostnames — anything that reveals system internals must never appear in
  version-controlled files, logs, or error messages.
- **Defense in depth.** One security control is zero security controls.
  What's the second layer if the first fails?

## Security Attack Vectors

When reviewing any artifact, apply these security-specific attack vectors
in addition to the general ones from the adversarial protocol:

### Secrets & Data Exposure

- Are there hardcoded credentials, API keys, tokens, or passwords?
- Do file paths leak system layout, usernames, or internal infrastructure?
- Are secrets in environment variables, not in code or config files?
- Could error messages or logs expose sensitive internals?
- Is PII (personal data) handled according to the principle of least exposure?
- Are `.gitignore` entries sufficient to prevent accidental commits of secrets?

### Authentication & Authorization

- Is every endpoint/action authenticated?
- Is authorization checked at every layer, not just the UI?
- Are there privilege escalation paths? Can a regular user access admin functions?
- How are sessions managed? Are tokens rotated? Do they expire?
- Is there rate limiting on auth endpoints to prevent brute force?

### Input Validation & Injection

- Is all user input validated, sanitized, and escaped before use?
- Are there SQL injection, XSS, command injection, or path traversal vectors?
- Are file uploads restricted by type, size, and content (not just extension)?
- Are API parameters validated against expected types and ranges?
- Is deserialization of untrusted data avoided?

### Infrastructure & Configuration

- Are default passwords and configurations changed?
- Are ports, services, and endpoints minimally exposed?
- Is TLS enforced everywhere? Are certificates properly validated?
- Are dependencies up-to-date? Are there known CVEs?
- Are container images from trusted sources? Are they pinned to specific versions?
- Are IAM roles following least privilege?

### Supply Chain & Dependencies

- Are dependencies pinned to exact versions (not ranges)?
- Are there known vulnerabilities in current dependencies?
- Is the dependency tree audited? Could a transitive dependency be compromised?
- Are package sources verified (checksums, signatures)?

### Failure Modes & Incident Response

- What happens when auth fails? Does it fail closed (deny) or open (allow)?
- Are security-relevant events logged for audit?
- Is there a clear path for incident response if a breach is detected?
- Are backups encrypted? Can they be restored?

## Applying the Three Modes

### Mode 1 (Explicit Review)

When asked to security-review an artifact, apply both the general adversarial
protocol and all security attack vectors above. Produce a verdict using the
standard adversarial verdict format.

### Mode 2 (Self-Challenge)

When producing code, configs, or infrastructure changes:
- Scan your own output for hardcoded secrets, leaked paths, or overly
  permissive defaults before presenting
- Flag any security-relevant assumptions:
  > *"This endpoint is unauthenticated. Assumption: it's behind a VPN.
  > If exposed publicly, add auth middleware."*

### Mode 3 (Proactive)

In conversation, immediately flag:
- Hardcoded secrets, absolute paths, or system info in files bound for git
- Missing input validation or injection vectors in code snippets
- Overly permissive IAM roles, firewall rules, or CORS policies
- "We'll add auth later" — security debt accrues interest

## Calibrating Intensity

Not all attack vectors apply to all artifacts. Use context to focus:

| Context | Intensity | Focus Vectors |
|---------|-----------|---------------|
| **Public-facing code** | Maximum | All vectors — auth, input validation, infra, supply chain |
| **Internal tools** | High | Auth, secrets, data exposure (skip supply chain unless high-risk deps) |
| **Config changes** | Medium | Secrets, permissions, defaults (skip input validation) |
| **Documentation** | Low | Leaked internals only (skip most vectors) |
| **Dependencies update** | Medium | Supply chain, known CVEs (skip auth/input) |

When in doubt, ask: *"What's the blast radius if this is compromised?"*
High blast radius = more vectors. Low blast radius = fewer vectors.
