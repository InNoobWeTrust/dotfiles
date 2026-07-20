# 7. C / C++ Baseline

Fits:
- embedded / firmware-adjacent
- desktop/native apps
- platform libraries
- older enterprise C/C++ systems

### 7.1 Local / agent loop

- **Formatting**: clang-format
- **Static checks**: clang-tidy, cppcheck
- **Compile warnings**: take compiler warnings seriously; standardize flags

### 7.2 CI baseline

- build with strong warnings
- clang-tidy (whole-file or diff-based, where practical)
- cppcheck
- tests and sanitizers where available
- a dependency/supply-chain check if the packaging model allows it
- gitleaks

### 7.3 Governance / reporting

- CodeQL for GitHub-heavy organizations
- Sonar for broader governance
- Trivy/Dependency-Track once artifacts/SBOM become important

### 7.4 When to reach for what

| Need | Good tool fit |
|---|---|
| formatting | clang-format |
| compiler-aware linting | clang-tidy |
| low-noise static bug detection | cppcheck |
| deep security/codeflow on supported repos | CodeQL |
| management/reporting | Sonar |

### 7.5 C/C++ note

Don't promote the idea that one tool will be enough for C/C++. This stack typically needs:
- compiler warnings
- clang-tidy
- cppcheck
- runtime sanitizers/tests

---
