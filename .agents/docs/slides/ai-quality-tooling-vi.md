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
## Phần 2 — Từ Rules sang Governance

**Tiếp nối từ `ai-agents-intro-vi.md`**

---

<!-- _class: default -->

# Mục Tiêu Phần Này

- Chọn đúng công cụ cho **dev/agent feedback loop**
- Chọn đúng công cụ cho **CI/management governance**
- Hiểu **Sonar đứng ở đâu** trong toàn hệ thống
- Có một **baseline stack thực dụng** để mang về dùng ngay

---

# Nhắc Lại Deck Trước

Deck trước đã chốt 3 ý:

1. **AI là junior engineer** → rất nhanh nhưng cần rào chắn
2. **Rules và skills** định nghĩa cách làm đúng
3. **Quality gates** là không thể thương lượng

**Phần này trả lời câu hỏi tiếp theo:**
> dùng tool nào để biến các gate đó thành feedback loop thật?

---

# Tại Sao Tooling Quan Trọng Hơn Khi Có AI?

AI agent có 2 đặc tính:

- **Rất nhanh** → tạo ra nhiều code rất sớm
- **Không đáng tin tuyệt đối** → cần bị chặn bởi tín hiệu máy móc

**Hệ quả:**

> Rules nói cho AI biết nên làm gì.  
> Tools kiểm tra xem AI có thực sự làm đúng không.

---

# Hai Vòng Lặp Chất Lượng

## 1. Inner Loop — dev / agent
- format
- lint
- type-check
- feedback trong vài giây

## 2. Governance Loop — CI / management
- tests
- dependency audit
- SAST / secret scan
- quality gates / dashboard

**Đừng dùng một tool cho cả hai vòng.**

---

# Bản Đồ Tooling

| Lớp | Mục tiêu | Ví dụ |
|---|---|---|
| Format | Loại bỏ nhiễu | Prettier, Biome, Ruff format |
| Lint | Chặn anti-pattern | ESLint, Ruff, golangci-lint |
| Type | Chặn lỗi tương thích | `tsc`, pyright, mypy, `ty` |
| Secrets | Chặn lộ token/key | gitleaks |
| Dependency | Chặn package lỗi | npm audit, pip-audit, Trivy |
| SAST | Chặn lỗi bảo mật logic | Semgrep, Sonar |
| Metrics | Complexity/hotspots | scc |
| Governance | Gate + dashboard | SonarQube / SonarCloud |

---

# Tool Cho Inner Loop

| Nhu cầu | Tool gợi ý | Lý do |
|---|---|---|
| Format JS/TS | Prettier / Biome | nhanh, auto-fix |
| Lint JS/TS | ESLint / Biome | ecosystem lớn |
| Python fast loop | Ruff | rất nhanh |
| Python type | pyright / `ty` | feedback sớm cho AI |
| Go | golangci-lint | gom nhiều rule |
| Shell | ShellCheck, shfmt | shell rất dễ lỗi |

**Nguyên tắc:** chậm là bị bỏ qua.

---

# Tool Cho Security & CI Gates

| Risk | Tool baseline |
|---|---|
| Secret leak | gitleaks |
| Vulnerable dependencies | npm audit / pip-audit / govulncheck |
| Multi-surface scan | Trivy |
| SAST đa ngôn ngữ | Semgrep |
| Coverage reporting | native coverage + Codecov/Sonar |

**Merge blocker hợp lý:**
- secret mới
- critical/high vuln
- test/type-check fail
- blocker issue trên code mới

---

# Sonar Là Gì Trong Hệ Này?

Sonar **không chỉ là một linter**.

Sonar là **quality governance platform**:

- quality gate cho PR / branch / main
- dashboard cho lead & management
- coverage + duplication + maintainability + security
- pull request decoration
- policy tập trung trên **new code**

**Câu hỏi Sonar trả lời:**
> “Change này có đủ chuẩn để merge/release chưa?”

---

# Tại Sao Sonar Hợp Với AI Era?

Theo mô hình hiện đại của Sonar:

- gate cho **new code** thay vì đòi fix toàn bộ legacy
- có **AI Code** quality gate riêng
- có thể fail PR hoặc fail CI khi gate fail

Điều này rất hợp với nguyên tắc:

> Không cần sửa hết nợ cũ hôm nay.  
> Nhưng không cho AI tạo thêm nợ mới.

---

# Sonar Không Thay Thế Những Gì?

Không nên bỏ các tool local nhanh như:

- Prettier / Biome
- ESLint / Ruff / golangci-lint
- `tsc` / pyright / mypy / `ty`
- gitleaks pre-commit

**Mô hình đúng:**

- local tools = **inner loop**
- Sonar = **control tower / governance layer**

---

# Vì Sao `scc` Đáng Đưa Vào Workshop?

`scc` không chỉ đếm LOC.

Nó còn hữu ích cho:

- complexity estimation
- hotspots
- change coupling
- HTML report
- COCOMO / **LOCOMO**

**Điểm hay:**
- rất nhanh
- dễ đưa vào CI
- tạo metric mà management hiểu được
- mở ra thảo luận về **AI cost vs delivery value**

---

# Baseline Stack Khuyến Nghị

## Phase 1 — Foundation
- formatter
- linter
- type-check
- gitleaks
- dependency audit
- Semgrep hoặc SAST cơ bản

## Phase 2 — Intelligence
- SonarQube / SonarCloud
- coverage dashboard
- Dependabot / Renovate
- scc hotspot reports

## Phase 3 — Optimization
- custom rules theo failure patterns
- AI cost tracking
- threshold theo loại project

---

# Mapping vào Makefile

```bash
make fix       # format + safe autofix
make lint      # fast lint + type-check
make quality   # lint đầy đủ + audit + SAST + IaC scan
make test      # tests + coverage
make metrics   # scc report + hotspot snapshot
```

**Một interface cho:**
- dev
- AI agent
- CI pipeline

---

# Management Cần Thấy Gì?

| Metric | Câu hỏi nó trả lời |
|---|---|
| Quality gate pass rate | Code mới có đang đủ chuẩn không? |
| Dependency vulns | Có đang ship risk đã biết không? |
| Coverage on new code | Thay đổi mới có được bảo vệ không? |
| Complexity / duplication trend | Nợ kỹ thuật có tăng không? |
| Secret incidents | Hygiene có ổn không? |
| AI cost / sprint | AI có tạo ROI không? |

**Đừng báo cáo raw lint noise. Báo cáo xu hướng và risk.**

---

# Thứ Tự Triển Khai Thực Dụng

1. Ổn định `make fix`, `make lint`, `make test`
2. Thêm `gitleaks` và dependency audit
3. Thêm Semgrep / Trivy
4. Khi team lớn hơn → thêm Sonar làm governance hub
5. Thêm `scc` để nhìn hotspots / complexity / AI cost signals

**Đừng mua dashboard trước khi có discipline.**

---

# Demo Gợi Ý Trong Workshop

- Chạy formatter/linter/type-check trên một thay đổi nhỏ
- Cho `gitleaks` chặn một secret giả
- Cho Semgrep hoặc Sonar bắt một issue trên PR
- Chạy `scc` để xem complexity/hotspots/report

**Mục tiêu demo:** mọi người thấy mỗi tool nằm ở đâu trong loop.

---

# Điểm Chốt

1. **AI làm tăng nhu cầu feedback nhanh**
2. **Tooling phải chia thành inner loop và governance loop**
3. **Sonar là platform hợp nhất, không thay tool local**
4. **scc là tool nhỏ nhưng cực giá trị cho metrics**
5. **Chọn tool theo vị trí trong workflow, không theo độ nổi tiếng**

---

<!-- _class: lead -->

# Hỏi Đáp?

**Tài liệu tham khảo:**
- `.agents/docs/quality-tooling-for-ai-projects.md`
- `.agents/docs/ai-augmented-project-setup-and-evolution.md`
- `.agents/docs/slides/ai-agents-intro-vi.md`

**Gợi ý bước tiếp theo:**
- thêm `gitleaks` + dependency audit trước
- sau đó mới quyết định có cần Sonar ngay không
