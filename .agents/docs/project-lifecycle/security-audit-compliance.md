# Security, Audit & Compliance

### Secret Management

Absolute rules:
- **Never commit secrets.** `.env`, `*.pem`, `*.key`, `auth.json`, `credentials.json` must be in `.gitignore`.
- **Use a secret manager for deployed environments.** Kubernetes secrets, HashiCorp Vault, AWS Secrets Manager, or your cloud provider's secret service.
- **Run automated secret scanning on every commit.** Tools like trufflehog, git-secrets, or gitleaks integrated into CI.
- **Provide `.env.example`** with every variable listed but no values. This tells newcomers what's needed without exposing secrets.

### Dependency Auditing

Both backend and frontend should run automated vulnerability scans:
- **Python:** pip-audit, safety
- **JavaScript/TypeScript:** npm audit, bun audit, yarn audit
- **Go:** govulncheck
- **CI gates:** Dependency audit failures with known exploits should be merge blockers

For vulnerabilities that don't apply to your usage pattern (e.g., a server-side vulnerability in a library you only use at build time), document the override explicitly in your configuration file.

### Infrastructure-as-Code Security

If you use Helm, Docker, Terraform, or any IaC tool:
- Run an IaC scanner (Checkov, tfsec, Trivy) against all templates
- Never hardcode credentials in IaC templates — reference secrets, don't embed them
- Declare resource limits (CPU, memory) on every container to prevent resource exhaustion

### Code-Level Security

- Run a SAST scanner (Bandit for Python, ESLint security rules for JS/TS, Semgrep for multi-language)
- For database queries on externally-managed tables/schemas, use parameterized raw SQL — not ORM — because ORM assumes you control the schema, which may not be true for data pipeline-managed tables
- Avoid database-level enums — keep enum validation in the application layer. This preserves database flexibility and prevents migration churn for enum additions.

### Audit Trail Requirements

For any system handling financial data, customer data, or business-critical operations:

1. **Single write path.** All business data changes go through one authoritative path (typically the backend API). Multiple write paths create audit gaps.
2. **Server-authoritative state.** The frontend displays what the backend says is true. Never allow the UI to show uncommitted or speculative business data.
3. **Logged operations.** Every background job, sync operation, or data pipeline run should produce an audit log entry with: timestamp, status (success/failed/in-progress), diagnostics on failure, and the user or system that triggered it.
4. **Write-through persistence.** Business data changes must persist to durable storage before the UI refreshes. Optimistic mutation (updating the UI, then saving) is forbidden for critical data.

### Compliance Framework

Document these for your organization's compliance needs:

| Concern | What to Document |
|---|---|
| Data residency | Where does data live? Which geographic regions? |
| Access control | Who can deploy? Who can access production data? How is access revoked? |
| Change management | What requires approval? How are emergency changes handled? |
| Business continuity | Backup strategy, recovery time objective, disaster recovery plan |
| Vendor risk | Which third-party services does the application depend on? What happens if they're unavailable? |
| AI provider risk | If using AI coding tools, what code leaves your environment? What model providers are used? Is there lock-in risk? |

---
