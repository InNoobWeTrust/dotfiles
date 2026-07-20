# 1. Java / JVM Baseline

Fits:
- Spring Boot
- legacy Java EE / servlet apps
- Maven / Gradle monoliths
- long-lived enterprise services

### 1.1 Local / agent loop

- **Formatting/style**: IDE formatter / Spotless / google-java-format
- **Style & maintainability**: Checkstyle, PMD
- **Bug-finding**: Error Prone, SpotBugs
- **Build correctness**: `mvn test`, `mvn -q -DskipTests compile`, or the Gradle equivalent

### 1.2 CI baseline

- Checkstyle
- PMD
- SpotBugs
- unit/integration tests
- coverage report
- OWASP Dependency-Check or an OSV/Trivy supply-chain scan
- gitleaks

### 1.3 Governance / reporting

- SonarQube / SonarCloud
- Dependency-Track for SBOM/SCA portfolio visibility
- CodeQL if GitHub-centric and security-heavy

### 1.4 When to reach for what

| Need | Good tool fit |
|---|---|
| enforce code conventions | Checkstyle |
| maintainability/code smells | PMD |
| bug patterns in bytecode/compiled logic | SpotBugs |
| compiler-augmented bug checks | Error Prone |
| dependency CVEs in the Maven/Gradle world | OWASP Dependency-Check |
| centralized governance | SonarQube / SonarCloud |

### 1.5 Upgrade path

- **Phase 1**: Checkstyle + tests + Dependency-Check
- **Phase 2**: add PMD + SpotBugs + gitleaks
- **Phase 3**: add Sonar + Dependency-Track
- **Phase 4**: add CodeQL or Semgrep custom rules if AppSec pressure grows

---
