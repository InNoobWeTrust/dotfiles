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
## Phần 2 — Mental Model trước, Tool sau

**Tiếp nối từ `ai-agents-intro-vi.md`**

---

<!-- _class: default -->

# Nhắc Lại Deck Trước

Deck trước đã chốt 3 ý:

1. **AI là junior engineer**
2. **Rules & skills** hướng dẫn hành vi
3. **Quality gates** là không thương lượng

**Phần này trả lời tiếp:**
> dùng tooling nào để biến các gate đó thành feedback loop thật?

---

# Mục Tiêu Phần Này

- Dạy một **mental model** để chọn tool đúng chỗ
- Đưa ra **baseline thực dụng** cho các stack phổ biến
- Đặt **Sonar trong bức tranh lớn hơn**
- Giúp team tự reason về tooling fit sau workshop

---

# Sai Lầm Phổ Biến

Workshop về tooling rất dễ thành:

- danh sách tool rời rạc
- vendor tour
- "tool tôi đang dùng là tốt nhất"

**Mục tiêu tốt hơn:**

> Không dạy mọi người chép đúng danh sách tool.  
> Dạy họ cách đánh giá tool cho codebase của họ.

---

# Tại Sao AI Làm Tooling Quan Trọng Hơn?

AI agent có 2 đặc tính:

- **rất nhanh** → sinh ra nhiều code hơn
- **không đáng tin tuyệt đối** → hợp lý hóa output sai rất giỏi

Hệ quả:

- local loop phải nhanh hơn
- CI gates phải rõ hơn
- management cần nhìn quality/risk rõ hơn

---

# Mental Model: Quality Layers

1. Formatting / style
2. Maintainability / static rules
3. Type / compile correctness
4. Tests / coverage evidence
5. Dependency / supply chain
6. Secrets hygiene
7. SAST / security analysis
8. Governance / quality gates
9. Metrics / hotspots / debt trends

**Bắt đầu từ layer, không bắt đầu từ brand.**

---

# Layer 1–3: Inner Loop

## 1. Formatting / style
Loại bỏ nhiễu review

## 2. Maintainability rules
Chặn code smells, conventions sai

## 3. Type / compile correctness
Chặn code "trông đúng nhưng sẽ gãy"

**Đây là lớp dev/agent loop phải chạy nhanh.**

---

# Layer 4–7: Evidence & Risk

## 4. Tests / coverage
Có bằng chứng thay đổi đúng

## 5. Dependency / supply chain
Có CVE / package risk không?

## 6. Secrets
Có token/key lộ ra không?

## 7. SAST
Có security anti-pattern không?

---

# Layer 8–9: Governance

## 8. Governance / quality gates
Repo này có đủ chuẩn để merge/release chưa?

## 9. Metrics / hotspots
Chỗ nào phức tạp nhất, thay đổi nhiều nhất, đáng refactor nhất?

**Đây là nơi management và lead bắt đầu nhìn thấy giá trị hệ thống.**

---

# Hai Vòng Lặp Chất Lượng

## Inner loop — dev / agent
- format
- lint
- type/build checks

## Governance loop — CI / leadership
- tests
- SAST
- dependency scan
- quality gates
- dashboards

**Một tool hiếm khi phục vụ tốt cả hai vòng.**

---

# Sonar Đứng Ở Đâu?

Sonar **không phải chỉ là một linter**.

Sonar là lớp **governance platform**:

- PR / branch / main quality gates
- coverage + duplication + maintainability + security
- dashboard cho lead & management
- new-code policy

**Nó nằm ở upper layer, không nằm ở fast local loop.**

---

# Sonar Không Thay Thế Gì?

Không nên bỏ:

- Prettier / Biome / Ruff formatter
- ESLint / Ruff / Checkstyle / RuboCop
- `tsc` / pyright / mypy / ty / PHPStan
- gitleaks pre-commit

**Mô hình đúng:**
- native tools = fast loop
- Sonar = control tower

---

# Alternatives Quan Trọng Cần Biết

| Need | Tool family |
|---|---|
| Polyglot SAST | Semgrep |
| GitHub-native deep security | CodeQL |
| SBOM / supply-chain governance | Dependency-Track |
| Repo metrics / hotspots | `scc` |
| All-in-one infra/security scan | Trivy |
| Enterprise SCA/AppSec suite | Snyk, Mend |

---

# Baseline Gợi Ý: Java

- Format: Spotless / IDE formatter
- Style: Checkstyle
- Maintainability: PMD
- Bug-finding: SpotBugs / Error Prone
- SCA: OWASP Dependency-Check
- Governance: Sonar / Dependency-Track

**Thông điệp:** Java enterprise đã có hệ sinh thái rất trưởng thành; đừng bỏ qua tool cũ chỉ vì nó không mới.

---

# Baseline Gợi Ý: C# / .NET

- Format: `dotnet format`
- Baseline analyzers: built-in .NET analyzers
- Optional analyzers: StyleCop / Meziantou / Roslynator
- Governance: Sonar hoặc NDepend
- Security: CodeQL nếu GitHub-centric

**Thông điệp:** .NET có native analyzer story rất mạnh; đừng nhảy thẳng vào platform trước khi tận dụng baseline này.

---

# Baseline Gợi Ý: Legacy JS / Vanilla Web

- Format: Prettier hoặc Biome
- Lint: ESLint hoặc Biome
- CSS: Stylelint
- Dependency/security: npm audit, OSV, Trivy
- Vendored JS libs: Retire.js

**Thông điệp:** app jQuery/Bootstrap cũ vẫn có thể có quality baseline mạnh mà không cần rewrite framework.

---

# Baseline Gợi Ý: Python

- Format + lint: Ruff
- Type: pyright / mypy / ty
- Tests: pytest
- Dependency scan: pip-audit
- SAST: Semgrep hoặc Bandit

**Thông điệp:** Python hưởng lợi cực lớn từ fast loop vì AI rất dễ sinh code dynamic-looking nhưng type-unsafe.

---

# Open-Source-First Maturity Path

## Phase 1 — Baseline
- formatter + lint
- type/build checks
- tests
- secrets + dependency scan

## Phase 2 — Standardized CI
- required checks
- severity thresholds
- update automation

## Phase 3 — Governance
- Sonar / Dependency-Track
- NDepend / CodeQL khi cần

---

# Legacy Rollout: Làm Sao Để Không Bị Reject?

- **Đừng bật strict-all ngay ngày đầu**
- gate **new code** trước
- baseline old issues khi cần
- ưu tiên pain point rõ nhất trước:
  - style noise
  - CVEs
  - secret leaks
  - broken PR quality

**Mục tiêu: adoption trước, purity sau.**

---

# Management Nên Nhìn Gì?

| Metric | Câu hỏi nó trả lời |
|---|---|
| New code gate pass rate | Code mới có đủ chuẩn không? |
| Critical/high vulns | Có đang ship known risk không? |
| Coverage on new code | Thay đổi mới có evidence không? |
| Complexity / duplication trend | Nợ kỹ thuật có tăng không? |
| Secret incidents | Hygiene có ổn không? |

**Đừng báo cáo raw lint noise cho leadership.**

---

# Điểm Chốt

1. **Mental model trước, tool sau**
2. **Dùng quality layers để reason về fit**
3. **Mỗi stack có baseline khác nhau**
4. **Sonar là governance layer, không phải mọi thứ**
5. **Open-source-first thường là điểm bắt đầu hợp lý**
6. **Workshop thành công khi người nghe tự đánh giá được tool fit sau buổi này**

---

<!-- _class: lead -->

# Hỏi Đáp?

**Tài liệu tham khảo:**
- `.agents/docs/quality-tooling/INDEX.md`
- `.agents/docs/quality-tooling/stack-baselines.md`
- `.agents/docs/quality-tooling/comparison-matrix.md`
- `.agents/docs/slides/ai-agents-intro-vi.md`

**Gợi ý bước tiếp theo:**
- chuẩn hóa quality layers trong team trước
- rồi mới chốt tool cụ thể cho từng repo
