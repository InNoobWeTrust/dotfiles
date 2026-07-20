# Quality Tooling cho AI-Augmented Software Projects

**Status**: canonical  
**Owner**: Engineering / AI Enablement  
**Audience**: Engineering leads, AI-agent operators, senior developers, DevOps/Platform, management

> Tài liệu này là phần tiếp theo thực dụng của bộ slide `slides/ai-agents-intro-vi.md`. Nếu slide đầu tiên giải thích **rules, skills, quality gates**, thì tài liệu này đi vào câu hỏi tiếp theo: **dùng công cụ nào để biến các quality gates đó thành feedback loop nhanh cho dev/agent và dashboard có ý nghĩa cho CI/management?**

---

## Prerequisites Tối Thiểu

Để áp dụng các gợi ý trong tài liệu này một cách thực dụng, team nên có sẵn:

- một entry point như `Makefile` hoặc script task runner tương đương
- CI có khả năng fail theo exit code
- stack-specific test runner và type checker cơ bản
- khả năng cài thêm CLI tools như `gitleaks`, `semgrep`, `trivy`, `scc`
- nếu dùng Sonar: SonarQube hoặc SonarCloud đã được nối vào repo và pipeline

---

## Mục Lục

1. [Tại Sao Quality Tooling Quan Trọng Hơn Khi Có AI](#1-tại-sao-quality-tooling-quan-trọng-hơn-khi-có-ai)
2. [Mô Hình Hai Tốc Độ: Inner Loop và Governance Loop](#2-mô-hình-hai-tốc-độ-inner-loop-và-governance-loop)
3. [Nguyên Tắc Chọn Tool](#3-nguyên-tắc-chọn-tool)
4. [Taxonomy: Các Nhóm Công Cụ Cần Có](#4-taxonomy-các-nhóm-công-cụ-cần-có)
5. [Sonar Đứng Ở Đâu Trong Bức Tranh](#5-sonar-đứng-ở-đâu-trong-bức-tranh)
6. [Stack Khuyến Nghị Theo Mức Trưởng Thành](#6-stack-khuyến-nghị-theo-mức-trưởng-thành)
7. [Cách Đóng Gói Thành Makefile và CI](#7-cách-đóng-gói-thành-makefile-và-ci)
8. [Metrics Nào Nên Báo Cáo Cho Management](#8-metrics-nào-nên-báo-cáo-cho-management)
9. [Workshop Flow Gợi Ý](#9-workshop-flow-gợi-ý)
10. [Kết Luận](#10-kết-luận)

---

## 1. Tại Sao Quality Tooling Quan Trọng Hơn Khi Có AI

Trong mô hình AI-augmented development, AI agent có hai đặc tính trái ngược nhau:

- **Tốc độ cực cao**: có thể tạo ra hàng trăm dòng code trong vài phút
- **Phán đoán không đáng tin cậy**: rất dễ hợp lý hóa output sai, hoặc bỏ qua edge case nếu không bị chặn

Điều đó làm thay đổi vai trò của tooling.

Trong team truyền thống, tool thường chỉ là “bộ lọc cuối” trước khi merge. Với AI, tool phải đóng thêm vai trò:

1. **Huấn luyện bằng feedback tức thì** cho agent và developer trong inner loop
2. **Ngăn merge các lỗi có thể xác minh máy móc** trong CI
3. **Biến chất lượng thành tín hiệu quản trị** để lead và management theo dõi được xu hướng

Nói ngắn gọn:

> Rules và skills định nghĩa hành vi mong muốn.  
> Quality tools biến hành vi đó thành tín hiệu đo được, lặp lại được, và chặn được.

---

## 2. Mô Hình Hai Tốc Độ: Inner Loop và Governance Loop

Tài liệu setup hiện tại của dự án đã chia khá rõ:

- `make fix` / `make lint` → **fast inner loop**
- `make quality` / `make test` / CI → **quality gate & governance loop**

Đây là mô hình nên giữ.

### 2.1 Inner Loop — dành cho dev và AI agent

Mục tiêu:

- feedback trong vài trăm ms đến vài giây
- sửa lỗi trước khi context bị trôi
- giúp agent tự-correct nhiều lần trước khi lên CI

Ví dụ tool phù hợp:

- formatter: Prettier, Biome, Ruff format, shfmt
- linter: ESLint, Biome, Ruff, golangci-lint, ShellCheck
- type checker: `tsc`, `pyright`, `mypy`, `ty`
- local rules nhanh: hadolint, actionlint, yamllint

### 2.2 Governance Loop — dành cho CI, lead, management

Mục tiêu:

- xác minh thay đổi có đủ chuẩn để merge/deploy không
- tổng hợp chất lượng ở cấp project thay vì từng file
- theo dõi xu hướng: coverage, vulnerabilities, complexity, duplication, debt

Ví dụ tool phù hợp:

- SAST / code analysis: Semgrep, SonarQube/SonarCloud, CodeQL
- dependency / supply chain: npm audit, pip-audit, govulncheck, Trivy, Dependabot/Renovate
- secrets: gitleaks, TruffleHog
- dashboard / governance: SonarQube, Codecov, scc HTML report

---

## 3. Nguyên Tắc Chọn Tool

Không nên chọn tool theo kiểu “càng nhiều càng tốt”. Chọn theo các nguyên tắc sau.

### 3.1 Ưu tiên tool có thể chạy deterministically qua CLI

AI agent làm việc tốt nhất với các lệnh như:

```bash
make lint
make test
make quality
```

Tool tốt cho AI là tool:

- có exit code rõ ràng
- có output máy đọc được nếu cần (JSON, SARIF)
- chạy lặp lại cho kết quả ổn định

### 3.2 Inner loop nên càng nhanh càng tốt

Nếu lint/type-check mất 40 giây, dev và agent sẽ học cách bỏ qua nó.

Vì vậy:

- inner loop: ưu tiên feedback nhanh, lý tưởng là trong vài giây hoặc nhanh hơn khi khả thi
- CI loop: mới chạy bộ check nặng hơn

### 3.3 Dùng tool theo lớp, không bắt một tool làm mọi thứ

Không có “silver bullet”.

Ví dụ:

- ESLint không thay được dependency scanning
- gitleaks không thay được SAST
- Sonar mạnh về dashboard/gate nhưng không phải formatter local tốt nhất
- scc rất tốt để đo quy mô/complexity/hotspots, nhưng không phát hiện auth bug

### 3.4 Ưu tiên output dùng được cho cả 3 audience

Theo triết lý của repo này, một setup tốt phục vụ:

- **developer**
- **AI agent**
- **management**

Nghĩa là cùng một hệ thống nên tạo ra:

- feedback ngắn gọn tại local
- gate rõ ràng trong CI
- dashboard/tín hiệu xu hướng cho leadership

---

## 4. Taxonomy: Các Nhóm Công Cụ Cần Có

## 4.1 Formatting & Style

Đây là lớp cơ bản nhất. Mục tiêu không phải “chất lượng nghiệp vụ”, mà là loại bỏ tranh cãi và giảm nhiễu.

| Nhóm | Tool tiêu biểu | Dùng ở đâu | Vai trò |
|---|---|---|---|
| JS/TS format | Prettier, Biome | local + CI | Chuẩn hóa formatting |
| Python format | Ruff format | local + CI | Formatting nhanh |
| Shell format | shfmt | local + CI | Tránh shell style drift |
| Editor baseline | EditorConfig | editor | Đồng bộ indent, newline |

**Khuyến nghị:** formatter phải auto-fix được và nằm trong `make fix`.

---

## 4.2 Linting & Static Rules

Đây là lớp chặn những lỗi cấu trúc và anti-pattern phổ biến.

| Nhóm | Tool tiêu biểu | Dùng ở đâu | Vai trò |
|---|---|---|---|
| JS/TS lint | ESLint, Biome | local + CI | rules theo framework, import, anti-pattern |
| Python lint | Ruff | local + CI | thay được nhiều plugin Flake8/isort |
| Go lint | golangci-lint | local + CI | gom nhiều linter thành một entry point |
| Shell lint | ShellCheck | local + CI | lỗi quoting, word splitting, unsafe shell |
| Dockerfile lint | hadolint | local + CI | best practices cho image/Dockerfile |
| YAML/CI lint | yamllint, actionlint | local + CI | tránh hỏng pipeline do YAML |

**Điểm quan trọng cho AI:** lint rule là cách rẻ nhất để encode failure patterns lặp lại của agent.

Nếu AI hay:

- swallow error
- import sai layer
- dùng API deprecated
- đặt logic sai chỗ

thì linter/custom rule là cách tốt hơn prompt reminder.

---

## 4.3 Type Checking

Đây là lớp cực quan trọng cho AI-generated code vì nó bắt lỗi logic “hợp lệ cú pháp nhưng sai tương thích”.

| Stack | Tool | Ghi chú |
|---|---|---|
| TypeScript | `tsc` | baseline bắt buộc |
| Python | `pyright`, `mypy`, `ty` | `ty` rất nhanh, hứa hẹn tốt cho inner loop; vẫn nên đánh dấu là công cụ mới |
| Go | compiler + `go vet` + golangci-lint | nhiều lỗi đã được bắt qua toolchain |

**Khuyến nghị thực tế:**

- dùng checker nhanh ở local nếu có
- dùng checker chặt hơn ở CI nếu project cần độ an toàn cao

Ví dụ với Python:

- local: `ty check` hoặc `pyright`
- CI: `pyright --warnings` hoặc `mypy --strict` ở module quan trọng

---

## 4.4 Secret Scanning

AI agent rất dễ copy/paste token, ví dụ config, sample `.env`, hoặc output từ docs. Vì vậy secret scanning là lớp chặn bắt buộc.

| Tool | Dùng ở đâu | Điểm mạnh |
|---|---|---|
| gitleaks | pre-commit + CI | phổ biến, dễ cài, output rõ, có SARIF |
| TruffleHog | CI / audit sâu | bề mặt scan rộng hơn |
| Semgrep Secrets | CI / platform | tích hợp nếu đã dùng Semgrep |

**Khuyến nghị:**

- pre-commit: `gitleaks`
- CI: `gitleaks` hoặc Semgrep Secrets / Trivy secret scan tùy stack

**Lý do:** đây là class lỗi mà ta muốn chặn **trước khi commit**, không phải chờ pipeline fail.

---

## 4.5 Dependency & Supply-Chain Auditing

AI tăng xác suất kéo thêm dependency mới. Vì vậy dependency audit là merge blocker hợp lý.

| Ecosystem | Tool baseline |
|---|---|
| Node.js | `npm audit`, `yarn audit`, `pnpm audit`, `bun audit` |
| Python | `pip-audit` |
| Go | `govulncheck` |
| Multi-stack / container / OS pkg | Trivy |
| Update automation | Dependabot hoặc Renovate |

**Best practice:**

- dependency audit failures mức critical/high = blocker
- cập nhật dependency định kỳ qua PR bot, không để dồn nợ lâu

---

## 4.6 SAST — Static Application Security Testing

Đây là lớp kiểm tra security-oriented logic patterns trong code.

| Tool | Điểm mạnh | Khi nào dùng |
|---|---|---|
| Semgrep | multi-language, rule dễ viết, OSS-friendly | baseline tốt cho CI đa ngôn ngữ |
| CodeQL | phân tích semantic sâu, mạnh trong GitHub ecosystem | team dùng GitHub mạnh và cần security sâu |
| SonarQube / SonarCloud | thống nhất quality + security + dashboard | khi cần governance và reporting đa audience |

### Semgrep phù hợp khi:

- cần bắt đầu nhanh
- muốn custom rule từ failure patterns của team
- muốn scan nhiều ngôn ngữ với cùng một công cụ

### Sonar phù hợp khi:

- muốn có quality gate thống nhất
- muốn dashboard cho management
- muốn nối local, PR decoration, CI, portfolio view vào một hệ thống

---

## 4.7 Infrastructure / Container / IaC Scanning

Nếu project có Docker, Helm, Terraform, Kubernetes thì đây là lớp bắt buộc.

| Tool | Scope |
|---|---|
| Trivy | image, filesystem, dependencies, secrets, IaC, SBOM |
| Checkov | Terraform / CloudFormation / K8s policy |
| tfsec | Terraform-focused nhẹ |
| kube-linter | Kubernetes manifests |
| hadolint | Dockerfile-focused |

**Khuyến nghị thực dụng:** Trivy là điểm khởi đầu tốt nhất vì “one tool, many surfaces”.

---

## 4.8 Coverage & Test Reporting

Coverage không thay thế test quality, nhưng là tín hiệu governance hữu ích.

| Tool | Vai trò |
|---|---|
| pytest-cov / coverage.py | Python coverage |
| vitest/jest coverage | JS/TS coverage |
| `go test -cover` | Go coverage |
| Codecov / Coveralls | dashboard và PR diff coverage |
| Sonar | ingest coverage vào quality gate |

**Nguyên tắc:** dùng coverage để kiểm soát **new code** tốt hơn là ám ảnh coverage tổng toàn repo.

---

## 4.9 Code Metrics, Complexity, Hotspots

Đây là khu vực các team hay bỏ sót, nhưng lại rất hợp với mục tiêu management visibility của repo này.

### scc nổi bật ở đâu

`boyter/scc` không chỉ đếm LOC.

Nó còn có thể hỗ trợ:

- complexity estimation
- duplicate/ULOC/DRYness signals
- git hotspots
- change coupling
- HTML report
- COCOMO và cả **LOCOMO** cho bối cảnh phát triển với LLM

| Tool | Vai trò |
|---|---|
| scc | quy mô codebase, complexity, hotspots, LOCOMO, report HTML |
| cloc / tokei | code counting baseline đơn giản |

**Tại sao scc thú vị cho workshop này:**

- nhanh
- chạy local hoặc CI dễ dàng
- cho ra tín hiệu mà management hiểu được
- đặc biệt phù hợp với team đang muốn đo ảnh hưởng của AI lên chi phí/phức tạp

### Lưu ý quan trọng

Không dùng LOC hay complexity như KPI cá nhân. Dùng chúng để:

- phát hiện hotspot
- so sánh xu hướng trước/sau refactor
- hỗ trợ ước lượng rủi ro bảo trì

---

## 5. Sonar Đứng Ở Đâu Trong Bức Tranh

Sonar không phải là “một linter nữa”.

Nó là lớp **governance platform** nằm phía trên nhiều tín hiệu kỹ thuật.

## 5.1 Vì sao Sonar đáng chú ý

Theo tài liệu hiện hành của SonarQube:

- quality gate trả lời câu hỏi: **project có sẵn sàng release không?**
- quality gate áp lên branch, PR, main branch
- có thể fail PR hoặc fail CI khi gate fail
- có built-in gate cho **new code**
- có gate dành riêng cho **AI code**

Sonar way tập trung vào chất lượng code mới, ví dụ:

- không thêm issue mới
- security hotspots mới phải được review
- coverage trên code mới đạt ngưỡng
- duplication trên code mới dưới ngưỡng

Đây là triết lý rất hợp với setup trong repo này: **không cố sửa toàn bộ legacy debt một lần, nhưng không cho nợ mới tăng thêm**.

## 5.2 Sonar mạnh ở chỗ nào

| Nhu cầu | Sonar mạnh không? | Ghi chú |
|---|---|---|
| feedback local cực nhanh | Trung bình | cần kết hợp IDE plugin / local lint khác |
| standard linting | Trung bình | không thay hẳn formatter/linter native |
| PR quality gate | Rất mạnh | decoration và gate rõ ràng |
| management dashboard | Rất mạnh | trend, portfolio, debt, duplication |
| thống nhất multi-language | Rất mạnh | một platform cho nhiều stack |
| theo dõi “new code quality” | Rất mạnh | đúng tinh thần chống tăng nợ mới |

## 5.3 Sonar không thay thế cái gì

Sonar không nên là lý do để bỏ:

- Prettier/Biome/Ruff formatter local
- ESLint/Ruff/golangci-lint inner loop
- gitleaks pre-commit
- stack-specific type checker

Cách nghĩ đúng là:

> Sonar là lớp điều phối và governance.  
> Các tool native nhanh vẫn là lớp inner loop.

## 5.4 Khi nào nên dùng Sonar

### Rất nên dùng khi:

- team đa ngôn ngữ
- cần dashboard cho leadership
- muốn quality gate thống nhất toàn tổ chức
- muốn định nghĩa “new code policy” rõ ràng
- có nhu cầu theo dõi debt/duplication/coverage/security trong một nơi

### Chưa cần vội khi:

- project rất nhỏ
- team còn chưa ổn định `make lint` / `make test`
- chưa có ngưỡng chất lượng nội bộ rõ ràng

Nếu chưa có discipline cơ bản, Sonar sẽ chỉ trở thành dashboard đẹp của một quy trình rối.

---

## 6. Stack Khuyến Nghị Theo Mức Trưởng Thành

## 6.1 Phase 1 — Foundation

Mục tiêu: feedback nhanh + chặn rủi ro lớn nhất.

### Baseline tối thiểu

**Local / agent loop**
- formatter: Prettier hoặc Biome / Ruff format
- linter: ESLint hoặc Biome / Ruff / golangci-lint / ShellCheck
- type-check: `tsc`, `pyright`/`mypy`/`ty`, `go vet`

**Pre-commit**
- gitleaks
- lint subset nhanh

**CI gate**
- full lint
- full type-check
- tests + coverage
- dependency audit
- SAST cơ bản

### Gợi ý stack theo category

| Category | Tool gợi ý |
|---|---|
| Format | Prettier / Biome / Ruff format / shfmt |
| Lint | ESLint / Biome / Ruff / golangci-lint / ShellCheck |
| Type | `tsc`, pyright/mypy/ty, `go vet` |
| Secrets | gitleaks |
| Dependency | npm audit / pip-audit / govulncheck |
| SAST | Semgrep |
| IaC / container | Trivy |

## 6.2 Phase 2 — Intelligence

Mục tiêu: thêm khả năng quan sát, trend, dashboard.

- SonarQube hoặc SonarCloud
- Codecov/Coveralls hoặc ingest coverage vào Sonar
- Dependabot/Renovate
- CI sinh report `scc` theo lịch (ví dụ weekly) cho hotspots / complexity / LOCOMO
- custom Semgrep rules theo failure patterns của team

## 6.3 Phase 3 — Optimization

Mục tiêu: quality system bắt đầu phản ánh hành vi của team và AI ở cấp tổ chức.

- quality gates riêng cho loại project khác nhau
- PR policies dựa trên new code thresholds
- rule tuning giảm false positive
- nối kết metrics AI cost / velocity / defect escape rate
- hotspot-driven refactoring roadmap

---

## 7. Cách Đóng Gói Thành Makefile và CI

## 7.1 Make targets gợi ý

```make
fix:
	# format + safe autofix

lint:
	# fast lint + fast type-check

quality:
	# full lint + strict type-check + dependency audit + sast + iac scan

test:
	# all tests + coverage

metrics:
	# scc report + complexity snapshot
```

Nếu repo có `Makefile`, nên liên kết rõ từ workshop về file thật để mọi người thấy entry point duy nhất của team.

## 7.2 Mapping thực dụng

| Target | Nên chứa gì |
|---|---|
| `make fix` | formatter + safe autofix |
| `make lint` | lint nhanh + type-check nhanh |
| `make quality` | lint đầy đủ + type-check chặt + dependency audit + SAST + IaC scan |
| `make test` | toàn bộ tests + coverage |
| `make metrics` | scc report, complexity snapshot, hotspot report |

## 7.3 Ví dụ policy pipeline

### Pre-commit

- format/lint subset nhanh
- gitleaks

### Pull Request

- `make lint`
- `make test`
- `make quality`
- Sonar PR analysis hoặc Semgrep/Trivy reports

### Main branch / nightly

- full scan sâu hơn
- scc hotspot report
- trend reporting
- dependency refresh / Renovate processing

---

## 8. Metrics Nào Nên Báo Cáo Cho Management

Management không cần biết rule `no-shadowed-variable` vừa fail. Họ cần tín hiệu bền vững.

## 8.1 Những metric nên có

| Metric | Ý nghĩa | Tool nguồn khả dĩ |
|---|---|---|
| New code quality gate pass rate | Chất lượng thay đổi mới có đang ổn không | Sonar |
| Critical/high dependency vulns | Có đang ship risk đã biết không | Trivy, audit tools, Sonar |
| Coverage trên code mới | Độ bảo vệ cho thay đổi mới | Sonar, Codecov, native coverage |
| Duplication / complexity trend | Nợ kỹ thuật có tăng không | Sonar, scc |
| Secret scan incidents | Hygiene và risk level | gitleaks |
| Mean time to green CI | Friction của delivery pipeline | CI platform |
| AI cost / sprint | Chi phí AI có tương xứng với velocity không | provider metrics + scc LOCOMO hỗ trợ ước lượng |

## 8.2 Những metric không nên dùng sai

Không nên dùng các số sau như KPI cá nhân:

- lines of code
- số issue thô chưa chuẩn hóa
- complexity score thô theo người viết
- số lần CI fail mà không có context

Những chỉ số này hữu ích ở cấp hệ thống, không phải để phán xét cá nhân.

---

## 9. Workshop Flow Gợi Ý

Dưới đây là flow hợp lý để trình bày tiếp nối sau `ai-agents-intro-vi.md`.

## 9.1 Mở đầu: từ rules sang tools

Thông điệp:

- slide 1 nói về discipline
- phần này nói về cách **đo** và **enforce** discipline đó
- nhắc lại deck trước: [`slides/ai-agents-intro-vi.md`](./slides/ai-agents-intro-vi.md) đã định nghĩa rules, skills và quality gates; deck này đi tiếp vào tooling layer

## 9.2 Khung tư duy chính

Vẽ 2 vòng lặp:

1. **Inner loop** — dev/agent
   - format
   - lint
   - type-check
2. **Governance loop** — CI/management
   - SAST
   - dependency audit
   - quality gate
   - dashboards

## 9.3 Dùng Sonar như “control tower”

Nhấn mạnh:

- không thay thế hết tool local
- là nơi hợp nhất tín hiệu
- mạnh nhất khi team đã có local discipline

## 9.4 Dùng scc như ví dụ rất thực dụng

Lý do đáng demo:

- rất nhanh
- dễ chạy
- tạo metric mà lead hiểu được
- cho thấy một tool nhỏ cũng có giá trị lớn nếu đặt đúng vị trí

## 9.5 Kết thúc bằng roadmap trưởng thành

- nhỏ: formatter + lint + type + gitleaks
- vừa: thêm Semgrep, Trivy, coverage gating
- lớn: thêm Sonar dashboard/gates, hotspot metrics, AI cost tracking

---

## 10. Kết Luận

Nếu phải tóm lại workshop này trong 5 ý:

1. **AI làm tăng tốc độ tạo lỗi có hệ thống** — nên feedback loop phải nhanh hơn trước
2. **Tooling cần chia làm hai tốc độ** — local fast loop và CI/governance loop
3. **Tool native nhanh vẫn là nền tảng** — formatter, lint, type-check, secret scan
4. **Sonar là platform governance, không phải formatter thay thế mọi thứ**
5. **scc là ví dụ rất hay của tool nhỏ nhưng tạo giá trị lớn cho metrics/hotspots/AI cost discussion**

Thông điệp chốt nên là:

> Đừng hỏi “tool nào tốt nhất”.  
> Hãy hỏi “tool nào đặt đúng chỗ trong feedback loop của dev, agent, CI và management?”

---

## Appendix A — Baseline Stack Rất Thực Dụng

### JavaScript / TypeScript

- Format: Prettier hoặc Biome
- Lint: ESLint hoặc Biome
- Type-check: `tsc`
- Secrets: gitleaks
- Dependency audit: `npm audit` / `pnpm audit`
- SAST: Semgrep
- Governance: SonarCloud/SonarQube (khi cần)

### Python

- Format + lint: Ruff
- Type-check: pyright / mypy / ty
- Secrets: gitleaks
- Dependency audit: pip-audit
- SAST: Semgrep, Bandit nếu muốn thêm Python-specific lens
- Governance: SonarCloud/SonarQube (khi cần)

### Go

- Format: `gofmt`
- Lint: golangci-lint
- Security / deps: govulncheck + Trivy nếu có container
- Secrets: gitleaks
- SAST / governance: Semgrep + Sonar nếu cần dashboard

---

## Appendix B — Một Policy Chặn Merge Đủ Dùng

Một policy hợp lý cho phần lớn team:

- fail nếu có secret mới
- fail nếu dependency có critical/high vulnerability
- fail nếu test hoặc type-check fail
- fail nếu Sonar/SAST báo issue blocker trên code mới
- cảnh báo nhưng không block với debt cũ chưa đụng tới

Đây là cách giữ tốc độ mà không hy sinh kỷ luật.
