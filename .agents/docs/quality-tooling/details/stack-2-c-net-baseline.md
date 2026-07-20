# 2. C# / .NET Baseline

Fits:
- ASP.NET / ASP.NET Core
- legacy .NET Framework apps
- modern SDK-style .NET repos
- enterprise solutions in Visual Studio ecosystems

### 2.1 Local / agent loop

- **Formatting/style**: `dotnet format`
- **Built-in analysis**: .NET analyzers / Roslyn analyzers
- **Additional analyzers**: StyleCop.Analyzers, Meziantou.Analyzer, Roslynator (depending on desired strictness)
- **Build correctness**: `dotnet build`, nullable reference types, warnings-as-errors selectively

### 2.2 CI baseline

- `dotnet build`
- an analyzer-warnings policy
- tests + coverage
- dependency scan (NuGet-focused + Trivy / OSV / portfolio SCA)
- gitleaks

### 2.3 Governance / reporting

- SonarQube / SonarCloud
- NDepend if the team needs deep architecture/debt/dependency insight for .NET
- CodeQL if GitHub code scanning is the organizational standard
- Dependency-Track if SBOM governance is a priority

### 2.4 When to reach for what

| Need | Good tool fit |
|---|---|
| native SDK analyzer baseline | built-in .NET analyzers |
| style conventions | StyleCop.Analyzers |
| broader analyzer pack | Meziantou / Roslynator |
| architecture/dependency/debt dashboards | NDepend |
| repo-to-portfolio governance | Sonar |
| GitHub-native security scanning | CodeQL |

### 2.5 Legacy .NET note

For non-SDK-style projects or older .NET Framework:
- enable analyzers gradually
- avoid "turn all warnings into errors" on day one
- baseline by changed projects first

### 2.6 Upgrade path

- **Phase 1**: `dotnet format` + built-in analyzers + tests
- **Phase 2**: add StyleCop/Meziantou + gitleaks + dependency scan
- **Phase 3**: add Sonar or NDepend
- **Phase 4**: add CodeQL / an enterprise AppSec suite if security governance needs to be stronger

---
