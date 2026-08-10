---
marp: true
theme: uncover
class:
  - lead
size: 16:9
paginate: true
header: "Phát Triển với AI"
footer: "Quality Tooling & Governance"
style: |
  section { font-size: 26px; }
  h1 { font-size: 42px; }
  h2 { font-size: 32px; }
  h3 { font-size: 28px; }
  table { font-size: 22px; }
  code { font-size: 20px; }
  pre { font-size: 18px; }
  section.lead h1 { font-size: 56px; }
  section.lead h2 { font-size: 36px; }
  blockquote { font-size: 22px; }
---

# Quality Tooling cho Dự Án AI
## Phần 2 — Mental model trước, tool sau

**Tiếp nối từ `ai-agents-intro-vi.md`**

---

<!-- _class: default -->

# Nhắc Lại Deck Trước

Deck trước đã chốt 3 ý:

1. **AI là junior engineer**
2. **Rules & skills** định hướng hành vi
3. **Quality gate** là không thể thương lượng

**Phần này trả lời tiếp:**
> dùng tool nào để biến các gate đó thành một feedback loop thật?

---

# Mục Tiêu Phần Này

- Dạy một **mental model** để chọn đúng tool, đúng chỗ
- Đưa ra **baseline** thực dụng cho các stack phổ biến
- Đặt **Sonar** trong bức tranh lớn hơn
- Giúp team tự lập luận về tool fit sau workshop

---

# Sai Lầm Phổ Biến

Workshop về tooling rất dễ trở thành:

- một danh sách tool rời rạc
- một vendor tour
- "tool tôi đang dùng là tốt nhất"

**Mục tiêu tốt hơn:**

> Không dạy mọi người chép đúng một danh sách tool.  
> Dạy họ cách tự đánh giá tool cho codebase của họ.

---

# Tại Sao AI Làm Tooling Quan Trọng Hơn?

AI agent có hai đặc tính then chốt:

- **rất nhanh** → sinh ra nhiều code hơn
- **không đáng tin cậy tuyệt đối** → biện minh cho output sai rất khéo

Hệ quả:

- inner loop phải nhanh hơn
- CI gate phải rõ ràng hơn
- leadership cần nhìn rõ quality và risk hơn

---

# Mental Model: Quality Layers

1. Formatting / style
2. Maintainability / static rules
3. Type / compile correctness
4. Tests / coverage evidence
5. Dependency / supply chain
6. Secrets hygiene
7. SAST / security analysis
8. Governance / quality gate
9. Metrics / hotspots / debt trends

**Bắt đầu từ layer, không bắt đầu từ brand.**

---

# Layer 1–3: Inner Loop

## 1. Formatting / style
Loại bỏ nhiễu trong review

## 2. Maintainability rules
Chặn code smell, sai convention

## 3. Type / compile correctness
Chặn code "trông có vẻ đúng nhưng sẽ gãy khi chạy"

**Đây là tầng mà loop của dev và agent phải chạy nhanh.**

---

# Layer 4–7: Evidence & Risk

## 4. Tests / coverage
Có evidence rằng thay đổi là đúng

## 5. Dependency / supply chain
Có CVE hay package risk nào không?

## 6. Secrets
Có token hay key bị lộ không?

## 7. SAST
Có security anti-pattern nào không?

---

# Layer 8–9: Governance

## 8. Governance / quality gate
Repo này đã đủ chuẩn để merge hay release chưa?

## 9. Metrics / hotspots
Chỗ nào phức tạp nhất, thay đổi nhiều nhất, đáng refactor nhất?

**Đây là nơi leadership và lead bắt đầu thấy giá trị của cả hệ thống.**

---

# Hai Vòng Lặp Chất Lượng

## Inner loop — dev / agent
- format
- lint
- type / build check

## Governance loop — CI / leadership
- tests
- SAST
- dependency scan
- quality gate
- dashboard

**Một tool hiếm khi phục vụ tốt cả hai loop.**

---

# Coding Agent Cần Feedback Sensor

Quality gate ở CI là policy.
Quality gate mà **agent tự chạy và đọc** là sensor.

## Feedforward → lần làm đầu đúng hơn
- rules + skills
- spec / acceptance criteria

## Feedback → tự sửa
- formatter, lint, type/build, focused tests
- exit code rõ ràng trước commit

**Đừng biến reviewer thành linter của agent.**

---

# Coverage Không Phải Là Bằng Chứng

AI có thể sinh test chạy qua code nhưng assertion rất ít.

## Thêm mutation testing cho core logic
- chủ động cấy lỗi nhỏ
- test pass phải **kill** được mutant
- mutant sống = evidence bị thiếu

| Ecosystem | Ví dụ |
|---|---|
| JS / .NET | Stryker |
| JVM | PIT / Pitest |
| Rust | cargo-mutants |

**Rollout theo module; full suite thường chạy async trên CI.**

---

# Accessibility Là Quality Gate

UI do AI sinh có thể trông đúng nhưng loại trừ người dùng.

- **axe-core**: check tự động theo hướng WCAG
- Chạy cùng component/browser flow Playwright/Cypress
- Gate UI thay đổi ở CI; vẫn cần kiểm tra thủ công/chuyên môn a11y

**Accessibility là quality attribute — không phải trang trí.**

---

# Sonar Nằm Ở Đâu?

Sonar **không chỉ là một linter**.

Sonar là lớp **governance platform**:

- quality gate cho PR / branch / main
- coverage + duplication + maintainability + security
- dashboard cho lead và leadership
- new-code policy

**Nó nằm ở upper layer, không nằm ở fast local loop.**

---

# Sonar Không Thay Thế Được Gì?

Không nên bỏ:

- Prettier / Biome / Ruff (formatter)
- ESLint / Ruff / Checkstyle / RuboCop (lint)
- `tsc` / pyright / mypy / ty / PHPStan (type check)
- gitleaks pre-commit (secret scan)

**Mô hình phù hợp:**

- native tools = fast loop
- Sonar = control tower

---

# Self-Hosted Quality Telemetry

## Một composition — không phải SonarQube drop-in

| Component | Trách nhiệm |
|---|---|
| **MegaLinter** | Chạy các linter khác nhau cho language, format và repository trong CI |
| **OpenObserve** | Lưu, query và làm dashboard cho telemetry run + finding đã normalize |

- Cả hai OSS component đều **AGPL-3.0** và self-host được.
- Có thể dùng OSS mà không phải trả **commercial license fee**.
- Vẫn còn nghĩa vụ AGPL, compute/storage/network, backup, upgrade, CI time và vận hành.
- Giữ raw MegaLinter report ở artifact; adapter có version tạo các normalized stream.

**Hãy nghĩ: self-hosted quality telemetry — không phải “Sonar miễn phí”.**

---

# Các Semantic Gap Quan Trọng

## Composition này tự nó không cung cấp

- centralized quality gate giữa nhiều repository
- new-code / diff semantics nhất quán
- governance cho coverage
- issue lifecycle và rule profile đã normalize
- duplication governance
- PR decoration
- security analysis và remediation governance đã normalize

**CI vẫn giữ pass/fail policy.** Dashboard OpenObserve làm evidence dễ query; nó không tự tạo policy.

> GitLab Code Quality widget cần một transform riêng ra JSON array đúng chuẩn. MegaLinter không document native GitLab Code Quality output.

**Dùng nó cho polyglot CI visibility và data ownership; vẫn giữ Sonar hoặc governance layer khác khi các semantics này quan trọng với release.**

---

# Coverage & Complexity: Cần Job Riêng

| Job | Producer | Sở hữu |
|---|---|---|
| **lint** | MegaLinter | lint/policy findings khác nhau theo stack |
| **test/coverage** | native runner + JaCoCo, Coverlet, Istanbul/Jest hoặc pytest-cov | test, coverage report, threshold |
| **complexity** | producer riêng như Lizard | mean/max complexity, NLOC, threshold |

- **MegaLinter không thay thế test coverage hay trendable complexity metrics.**
- Rule complexity của PMD/ESLint/Ruff là finding theo language, không phải một score xuyên language.
- Lizard là job riêng; không ngụ ý Lizard được bundle trong MegaLinter.

---

# Gate ở CI, Trend ở OpenObserve

- Job test/coverage và complexity sở hữu threshold failure và exit status gốc.
- GitLab coverage/unit-test artifact phục vụ MR/CI UI; OpenObserve chỉ nhận dữ liệu sau khi normalizer/uploader đọc artifact hoặc summary một cách tường minh.
- Giữ các event field phẳng như `commit_sha`, `pipeline_id`, `mr_iid`; metric label phải low-cardinality.
- Dùng `after_script` hoặc lưu exit status để upload telemetry khi failure mà không che mất kết quả job.
- So sánh trend trong cùng tool/language/module; OpenObserve quan sát và alert drift, không phải merge gate duy nhất.

**Tài liệu chính:** [thiết kế coverage, complexity và telemetry](../quality-tooling/openobserve-megalinter.md)

---

# Nguồn Chính: Platform

- **OpenObserve OSS/AGPL:** [editions](https://openobserve.ai/downloads/) · [license](https://raw.githubusercontent.com/openobserve/openobserve/main/LICENSE)
- **Ingestion và schema:** [`_json` array](https://openobserve.ai/docs/reference/api/ingestion/logs/json/) · [schema settings](https://openobserve.ai/docs/user-guide/data-processing/streams/schema-settings/) · [data/index types](https://openobserve.ai/docs/user-guide/data-processing/streams/data-type-and-index-type-in-streams/)
- **Explore:** [SQL](https://openobserve.ai/docs/reference/sql-reference/) · [dashboards](https://openobserve.ai/docs/user-guide/analytics/dashboards/dashboards-in-openobserve/)
- **Tài liệu:** [canonical guide](../quality-tooling/openobserve-megalinter.md) · [full evidence leaf](../quality-tooling/details/openobserve-megalinter-sources.md)

---

# Nguồn Chính: CI & Comparison

- **MegaLinter OSS/AGPL:** [license](https://raw.githubusercontent.com/oxsecurity/megalinter/main/LICENSE) · [current version](https://megalinter.io/latest/install-version/) · [GitLab install](https://megalinter.io/latest/install-gitlab/)
- **Reports/config:** [activation](https://megalinter.io/latest/config-activation/) · [reporters](https://megalinter.io/latest/reporters/)
- **GitLab:** [Code Quality format](https://docs.gitlab.com/ci/testing/code_quality/)
- **SonarSource:** [quality standards](https://docs.sonarsource.com/sonarqube-community-build/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates.md)
- **Tài liệu:** [canonical guide](../quality-tooling/openobserve-megalinter.md) · [full evidence leaf](../quality-tooling/details/openobserve-megalinter-sources.md)

---

# Alternatives Quan Trọng Cần Biết

| Need | Tool family |
|---|---|
| Polyglot SAST | Semgrep |
| GitHub-native deep security | CodeQL |
| SBOM / supply-chain governance | Dependency-Track |
| Accessibility automation | axe-core (+ Playwright/Cypress) |
| Mutation test depth | Stryker, PIT, cargo-mutants |
| API edge-path testing | WuppieFuzz, Schemathesis, fuzzers |
| Repo metrics / hotspots | `scc`, CodeScene |
| All-in-one infra/security scan | Trivy |
| Enterprise SCA / AppSec suite | Snyk, Mend |

---

# Baseline Gợi Ý: Java

- Format: Spotless / IDE formatter
- Style: Checkstyle
- Maintainability: PMD
- Bug-finding: SpotBugs / Error Prone
- SCA: OWASP Dependency-Check
- Governance: Sonar / Dependency-Track

**Thông điệp:** Hệ sinh thái Java enterprise đã rất trưởng thành; đừng bỏ qua tool cũ chỉ vì nó không mới.

---

# Baseline Gợi Ý: C# / .NET

- Format: `dotnet format`
- Baseline analyzers: built-in .NET analyzers
- Optional analyzers: StyleCop / Meziantou / Roslynator
- Governance: Sonar hoặc NDepend
- Security: CodeQL nếu GitHub-centric

**Thông điệp:** .NET có native analyzer story rất mạnh; đừng nhảy thẳng sang platform trước khi tận dụng baseline này.

---

# Baseline Gợi Ý: Legacy JS / Vanilla Web

- Format: Prettier hoặc Biome
- Lint: ESLint hoặc Biome
- CSS: Stylelint
- Dependency / security: npm audit, OSV, Trivy
- Vendored JS libs: Retire.js

**Thông điệp:** App jQuery / Bootstrap cũ vẫn có thể có quality baseline mạnh mà không cần rewrite framework.

---

# Baseline Gợi Ý: Python

- Format + lint: Ruff
- Type: pyright / mypy / ty
- Tests: pytest
- Dependency scan: pip-audit
- SAST: Semgrep hoặc Bandit

**Thông điệp:** Python được lợi rất nhiều từ fast loop, vì AI rất dễ sinh code trông dynamic nhưng type-unsafe.

---

# Hotspot: Agent Nên Refactor Ở Đâu?

Static analysis trả lợi: “cái gì sai?”

Behavioral hotspot trả lợi:
> **Chỗ nào complexity cao và thay đổi nhiều?**

- `scc` / Sonar / NDepend: phương án OSS/governance
- CodeScene: complexity × lịch sử git; CodeHealth cho vùng AI-safe
- Dùng hotspot để ưu tiên design + test của người

**Đừng để agent refactor mù vào hotspot coupled cao.**

---

# Open-Source-First Maturity Path

| Phase | Mục tiêu | Hành động chính |
|---|---|---|
| **1 — Baseline** | Mỗi repo đạt hygiene | formatter + lint, type/build, tests, secret & dep scan |
| **2 — Standardized CI** | Tool có policy | required check, severity threshold, update automation |
| **3 — Governance** | Tầm nhìn portfolio | Sonar / Dependency-Track, NDepend / CodeQL khi cần |

---

# Legacy Rollout: Làm Sao Để Không Bị Reject?

- **Đừng bật strict-all ngay ngày đầu**
- gate **new code** trước
- baseline old issues khi cần
- Ưu tiên pain point rõ ràng nhất trước:
  - style noise
  - CVE
  - secret leak
  - broken PR quality

**Mục tiêu: adoption trước, purity sau.**

---

# Leadership Nên Nhìn Vào Đâu?

| Metric | Câu hỏi mà nó trả lợi |
|---|---|
| New code gate pass rate | Code mới có đủ chuẩn không? |
| Critical / high vulns | Có đang ship known risk không? |
| Coverage + mutation trên code mới quan trọng | Evidence có thật ý nghĩa không? |
| Accessibility gate trên UI | UI có inclusive mặc định không? |
| Complexity / hotspot trend | Debt có tăng nơi thay đổi nhiều không? |
| DORA + rework rate | Code nhanh hơn có làm delivery ổn định hơn? |
| First-pass acceptance / review burden | Hợp tác người–agent có tốt hơn không? |

**Không bao giờ dùng AI LOC hay số PR làm KPI năng suất.**

---

# Điểm Chốt

1. **Mental model trước, tool sau**
2. **Dùng quality layer để lập luận về tool fit**
3. **Đưa check nhanh thành feedback sensor agent chạy trước commit**
4. **Coverage không phải bằng chứng — thêm mutation cho core logic**
5. **Accessibility là quality attribute**
6. **Sonar là governance layer; telemetry không phải drop-in replacement**
7. **Đo delivery và chất lượng hợp tác — không đo khối lượng output AI**

---

<!-- _class: lead -->

# Hỏi & Đáp?

**Tài liệu tham khảo:**
- `.agents/docs/quality-tooling/INDEX.md`
- `.agents/docs/quality-tooling/agent-feedback-sensors.md`
- `.agents/docs/quality-tooling/extended-evidence-tools.md`
- `.agents/docs/quality-tooling/stack-baselines.md`
- `.agents/docs/quality-tooling/comparison-matrix.md`
- `.agents/docs/quality-tooling/openobserve-megalinter.md`
- `.agents/docs/slides/01_ai-agents-intro-vi.md`

**Gợi ý bước tiếp theo:**
- chuẩn hóa quality layer trong team trước
- rồi mới chốt tool cụ thể cho từng repo

**Tiếp series:**
- Phần 3 — Mental model Agentic QA/QC: `03_ai-agentic-qa-vi.md`
