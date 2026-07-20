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

# Alternatives Quan Trọng Cần Biết

| Need | Tool family |
|---|---|
| Polyglot SAST | Semgrep |
| GitHub-native deep security | CodeQL |
| SBOM / supply-chain governance | Dependency-Track |
| Repo metrics / hotspots | `scc` |
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

| Metric | Câu hỏi mà nó trả lời |
|---|---|
| New code gate pass rate | Code mới có đủ chuẩn không? |
| Critical / high vulns | Có đang ship known risk không? |
| Coverage on new code | Thay đổi mới có evidence không? |
| Complexity / duplication trend | Tech debt có đang tăng không? |
| Secret incidents | Hygiene có ổn không? |

**Đừng báo cáo raw lint noise cho leadership.**

---

# Điểm Chốt

1. **Mental model trước, tool sau**
2. **Dùng quality layer để lập luận về tool fit**
3. **Mỗi stack có baseline khác nhau**
4. **Sonar là governance layer, không phải tất cả**
5. **Open-source-first thường là điểm khởi đầu hợp lý**
6. **Workshop thành công khi người nghe tự đánh giá được tool fit sau buổi này**

---

<!-- _class: lead -->

# Hỏi & Đáp?

**Tài liệu tham khảo:**
- `.agents/docs/quality-tooling/INDEX.md`
- `.agents/docs/quality-tooling/stack-baselines.md`
- `.agents/docs/quality-tooling/comparison-matrix.md`
- `.agents/docs/slides/ai-agents-intro-vi.md`

**Gợi ý bước tiếp theo:**
- chuẩn hóa quality layer trong team trước
- rồi mới chốt tool cụ thể cho từng repo
