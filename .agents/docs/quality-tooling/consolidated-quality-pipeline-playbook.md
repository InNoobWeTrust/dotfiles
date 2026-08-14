# Consolidated Quality Pipeline & Garden Orchestration Playbook

> **Validated 2026-08-14.** Production patterns and operational learnings for building clean, multi-engine quality pipelines with MegaLinter, Garden 0.14, and OpenObserve telemetry.

---

## 1. Architectural Philosophy: The Consolidated Model

Traditional CI pipelines often suffer from **script sprawl** and **bootstrap explosion**:
- 10–15 independent shell scripts running individual linters (`eslint.sh`, `prettier.sh`, `gitleaks.sh`, `lizard.sh`, `audit.sh`).
- Repeated container startup and `npm ci` / `pip install` overhead in each step.
- Brittle failure handling where a single linter error aborts downstream telemetry collection.

The **Consolidated Architecture** simplifies the DAG into 4 focused stages:

```
[1. env-setup]          Prepares .env.quality & release-parity environment files
       │
       ├─────────────────────────────────────────┐
       ▼                                         ▼
[2. megalinter]                           [3. runtime-tests]
All static analysis, linting,             Single container (1x bootstrap):
formatting, secret detection,             • Unit test execution (JUnit XML)
SAST (Semgrep) & SCA (Trivy CVEs)         • Test coverage analysis (Cobertura XML)
       │                                         │
       └─────────────────────────────────────────┘
       │
       ▼
[4. quality]            Collects producer envelopes, normalizes telemetry,
                        publishes to OpenObserve (non-blocking), and enforces quality gate.
```

### Key Separation of Concerns
1. **MegaLinter** owns all static checks, syntax linters, formatters, secret scanning, code SAST, and lockfile dependency CVE scanning.
2. **Runtime Container** (e.g. Node 18 / Python 3.12 / Go) owns **dynamic execution only**: unit tests and code coverage.
3. **Container Build (`kind: Build`)** is decoupled from the quality DAG and executed independently (`garden build frontend`).
4. **Tail Quality Gate (`quality.py`)** owns failure enforcement, ensuring all forensic reports are generated and published to telemetry before the pipeline exits nonzero.

---

## 2. Producer Envelope & Single-CLI Pattern

### The `producer.env` Contract
Every producer stage writes a standardized metadata envelope beside its raw artifacts:

```ini
producer=jest
status=passed
exit_code=0
run_id=ci-1234-5678
report_path=jest/junit.xml
upload_status=pending
```

### Single Python CLI with `uv`
Instead of fragmented scripts (`aggregate.py`, `check_enforced.py`, `publish.py`, `env_setup.py`), use a single, typed Python script (`quality.py`) executed via `uv run garden/scripts/quality.py <subcommand>`:

- `setup-env`: Enforces release-parity environment variables.
- `aggregate`: Reads all `producer.env` envelopes and compiles `quality_runs.json` and `quality_findings.json`.
- `publish`: Ships telemetry payloads to OpenObserve.
- `enforce`: Evaluates quality thresholds and exits with code 1 if enforcement is enabled and any producer failed.
- `pipeline`: Orchestrates `aggregate` → `publish` → `enforce` in one atomic step.

---

## 3. Operational Learnings & Hard Gotchas

### A. Multi-Core Concurrency in MegaLinter (`PARALLEL_PROCESS_NUMBER`)
* **Gotcha**: In MegaLinter v10, setting `PARALLEL_PROCESS_NUMBER: 0` passes `0` directly into Python's `multiprocessing.Pool(0)`, causing an immediate fatal crash: `ValueError: Number of processes must be at least 1`.
* **Correct Pattern**: Leave `PARALLEL_PROCESS_NUMBER` **unset** (or pass an integer `>= 1`). When unset, MegaLinter's internal logic executes `process_number = mp.cpu_count()`, natively utilizing 100% of host and CI runner CPU cores.

### B. macOS Apple Silicon (arm64) Platform Emulation
* **Gotcha**: Pulling amd64-only images (or running x86_64 container tools) emits platform mismatch warnings on Apple Silicon Macs (`linux/arm64/v8`).
* **Correct Pattern**: Enforce x86 emulation on the developer's local Mac without modifying shared repository configs or affecting x86 CI runners:
  ```bash
  export DOCKER_DEFAULT_PLATFORM=linux/amd64
  ```
  *(Enable Rosetta emulation in Docker Desktop settings for near-native performance).*

### C. Docker-out-of-Docker (DooD) Execution
* **Pattern**: Running Garden inside a Docker container without installing the local CLI binary:
  ```bash
  docker run --rm -it \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$(pwd)":"$(pwd)" \
    -w "$(pwd)" \
    -e DOCKER_DEFAULT_PLATFORM=linux/amd64 \
    gardendev/garden:0.14.20 run quality
  ```
  *Mirroring the working directory path is essential so worker container bind-mounts resolve cleanly on the host daemon.*

### D. Framework Templates vs Pure HTML Linters
* **Gotcha**: Running standard HTML linters (`HTML_HTMLHINT`) on component-based frontend frameworks (Angular, Vue, React) produces tens of thousands of false positive errors on template syntax (`*ngIf`, `[(ngModel)]`, `(click)`, JSX attributes).
* **Correct Pattern**: Disable `HTML_HTMLHINT` for frontend component frameworks. Validate templates using framework-aware AST linters (e.g. `@angular-eslint/template` via `TYPESCRIPT_ESLINT`) and format with `HTML_PRETTIER`.

### E. Dependency Security: Trivy vs `npm audit`
* **Pattern**: Rather than running `npm audit` inside the dynamic test runtime container, enable **`REPOSITORY_TRIVY`** (or `REPOSITORY_OSV_SCANNER`) in MegaLinter. Trivy analyzes `package-lock.json` directly against global CVE databases, consolidating all security auditing into the MegaLinter stage and keeping the runtime container strictly for unit tests.

### F. Non-Blocking Execution Contract (`DISABLE_ERRORS: true`)
* **Pattern**: MegaLinter must be configured with `DISABLE_ERRORS: true`. This ensures MegaLinter exits with code 0 even when lint/style warnings exist, allowing the DAG to reach the aggregation step. The real failure state is recorded in `quality-reports/megalinter/report.json` and enforced at the tail quality gate.

---

## 4. Garden 0.14 Configuration Reference (`garden.yml`)

```yaml
---
apiVersion: garden.io/v2
kind: Project
name: project-name
defaultEnvironment: local
dotIgnoreFile: .gitignore
variables:
  gardenVersion: 0.14.20
  uvImage: ghcr.io/astral-sh/uv:python3.12-alpine
  nodeImage: node:18-alpine
  megalinterImage: ghcr.io/oxsecurity/megalinter:v10
environments:
  - name: local
    variables:
      projectRoot: ${local.projectPath}
  - name: ci
    variables:
      projectRoot: ${local.projectPath}
---
apiVersion: garden.io/v0
kind: Run
type: exec
name: env-setup
description: Setup environment and release-parity files
spec:
  command:
    - docker
    - run
    - --rm
    - --mount
    - type=bind,source=${var.projectRoot},target=/work,readonly=false
    - -w
    - /work
    - ${var.uvImage}
    - uv
    - run
    - garden/scripts/quality.py
    - setup-env
---
apiVersion: garden.io/v0
kind: Run
type: exec
name: megalinter
description: Static analysis, linters, formatters, Gitleaks, Semgrep, Trivy
dependencies:
  - run.env-setup
spec:
  command:
    - docker
    - run
    - --rm
    - --mount
    - type=bind,source=${var.projectRoot},target=/tmp/lint,readonly=false
    - -w
    - /tmp/lint
    - -e
    - REPORT_OUTPUT_FOLDER=quality-reports/megalinter
    - -e
    - JSON_REPORTER=true
    - -e
    - JSON_REPORTER_FILE_NAME=report.json
    - -e
    - MARKDOWN_SUMMARY_REPORTER=true
    - -e
    - CLEAR_REPORT_FOLDER=false
    - -e
    - DISABLE_ERRORS=true
    - -e
    - GARDEN_RUN_ID
    - ${var.megalinterImage}
---
apiVersion: garden.io/v0
kind: Run
type: exec
name: node-quality
description: Unit tests and coverage in single runtime container
dependencies:
  - run.env-setup
spec:
  command:
    - docker
    - run
    - --rm
    - --mount
    - type=bind,source=${var.projectRoot},target=/work,readonly=false
    - -w
    - /work
    - -e
    - GARDEN_RUN_ID
    - ${var.nodeImage}
    - sh
    - garden/scripts/node-quality.sh
---
apiVersion: garden.io/v0
kind: Run
type: exec
name: quality
description: Aggregate telemetry, publish to OpenObserve, and enforce quality gate
dependencies:
  - run.megalinter
  - run.node-quality
spec:
  command:
    - docker
    - run
    - --rm
    - --mount
    - type=bind,source=${var.projectRoot},target=/work,readonly=false
    - -w
    - /work
    - -e
    - OPENOBSERVE_RUNS_URL
    - -e
    - OPENOBSERVE_FINDINGS_URL
    - -e
    - OPENOBSERVE_INGEST_USER
    - -e
    - OPENOBSERVE_INGEST_TOKEN
    - -e
    - QUALITY_ENFORCEMENT_ENABLED
    - ${var.uvImage}
    - uv
    - run
    - garden/scripts/quality.py
    - pipeline
---
apiVersion: garden.io/v0
kind: Build
type: container
name: frontend
description: Production container image build (Dockerfile)
dependencies:
  - run.env-setup
spec:
  dockerfile: Dockerfile
```
