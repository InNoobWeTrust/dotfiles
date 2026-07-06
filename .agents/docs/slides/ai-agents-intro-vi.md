---
marp: true
theme: uncover
class:
  - lead
size: 16:9
paginate: true
header: "Phát Triển với AI"
footer: "Giới Thiệu & Hướng Dẫn"
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

# Phát Triển Phần Mềm với AI
## Hướng Dẫn Thực Hành

**Từ con số 0 đến làm việc hiệu quả với AI**

---

<!-- _class: default -->

# Nội Dung

- Phát triển với AI là gì?
- Mô hình tư duy: AI như một lập trình viên junior
- Kiến trúc thư mục `.agents/`
- Rules: Ngăn chặn đầu ra kém chất lượng
- Skills: Định hướng đầu ra chất lượng
- Quality Gates & Kỷ luật kỹ thuật
- Onboarding dự án & Quy trình làm việc hàng ngày
- Báo cáo cho quản lý
- Bắt đầu từ đâu

---

# Phát Triển với AI Là Gì?

Một mô hình phát triển trong đó **AI coding agent** (Kilo, Claude Code, Copilot) làm việc cùng con người — không phải như máy đánh chữ, không phải như nhà tiên tri, mà như một **lập trình viên junior**.

**Con người**: định nghĩa LÀM GÌ và TẠI SAO
**AI agent**: thực thi LÀM THẾ NÀO với các rào chắn bảo vệ

---

# Tại Sao Cần Rào Chắn?

Không có rules, AI agent sẽ mắc phải những lỗi có thể dự đoán trước:

- Viết code chưa từng được chạy thử
- Tự bịa ra business rules khi yêu cầu mơ hồ
- Âm thầm nuốt lỗi để code "chạy được"
- Bỏ qua quality checks để "tiết kiệm thời gian"
- Thêm method vào class có sẵn thay vì thiết kế module mới

**Rules và skills ngăn chặn những lỗi này ở cấp độ hệ thống.**

---

<!-- _class: default -->

# Mô Hình Tư Duy

AI agent = một lập trình viên junior:

| Đặc điểm | Hệ quả |
|---|---|
| Cực nhanh, không biết mệt | 500 dòng trong vài giây = 500 dòng nợ kỹ thuật nếu không được hướng dẫn |
| Đã đọc toàn bộ codebase | Nhưng không hiểu ngữ cảnh nghiệp vụ |
| Tuân thủ rules máy móc | Nhưng sẽ tự bịa câu trả lời cho câu hỏi mơ hồ |
| Cần hướng dẫn rõ ràng | Như bất kỳ junior nào: task giới hạn, tiêu chí chấp nhận rõ ràng, code review |

---

<!-- _class: default -->

# Hai Lớp Cấu Hình

## Bộ công cụ cá nhân (`~/.agents/`)
- Tùy chọn cá nhân & credentials
- Skills thử nghiệm
- Lịch sử phiên làm việc

## Hợp đồng dự án (`.agents/`)
- Rules chia sẻ trong team
- Skills đặc thù cho dự án
- Handoffs & session checkpoints

**Tách biệt để khi clone repo, bạn có ngay toàn bộ hợp đồng team — không có gì từ cấu hình cá nhân của lead bị rò rỉ vào.**

---

# Sơ Đồ Thư Mục `.agents/`

```
<dự-án>/.agents/
├── rules/              ← Bắt buộc, luôn hoạt động
│   ├── code-quality.md
│   ├── tdd.md
│   ├── grooming.md
│   ├── ubiquitous-language.md
│   ├── slicing.md
│   └── skill-compliance.md
├── skills/             ← Tải theo task, khi cần
│   ├── INDEX.md        ← Bảng định tuyến
│   ├── WIRING.md       ← Lộ trình kết hợp
│   ├── code-craft/
│   ├── reviewer/
│   └── ...
└── handoffs/           ← File checkpoint phiên làm việc
```

---

# Rules vs Skills

| | Rules | Skills |
|---|---|---|
| **Mục đích** | Ngăn chặn hành vi xấu | Định hướng hành vi tốt |
| **Kích hoạt** | Luôn hoạt động | Tải khi cần |
| **Ẩn dụ** | Coding standards + checklist review | Quy trình chuẩn cho từng loại công việc |
| **Ví dụ** | "Không bao giờ nuốt lỗi âm thầm" | "Quy trình 5 pha viết feature mới" |

---

# 6 Rules Thiết Yếu

Mọi dự án AI-augmented đều cần:

1. **Code Quality Baseline** — Quy tắc đặt tên, giới hạn nesting, patterns bị cấm
2. **TDD Enforcement** — Red → Green → Refactor cho logic components
3. **Grooming (Phỏng vấn ngược)** — AI hỏi BẠN 3-5 câu trước khi code
4. **Ubiquitous Language** — Đồng bộ với GLOSSARY.md để tránh lệch thuật ngữ
5. **Vertical Slicing** — Xây dựng theo feature, không theo tầng kỹ thuật
6. **Skill Compliance** — Tải một skill = cam kết ràng buộc toàn bộ workflow

---

# Rule 1: Code Quality Baseline

Ngăn AI tạo ra code "chạy được cho test case này" nhưng sụp đổ khi dùng thực tế.

- Tối đa 3 cấp nesting — trích xuất khối bên trong
- Tối đa 50 dòng mỗi hàm — tách hoặc ghi chú lý do trì hoãn
- Guard clauses ở đầu — happy path không bao giờ nằm trong `else`
- Không magic literals — mọi giá trị inline là named constant
- Không nuốt lỗi âm thầm — `catch(e) {}` bị cấm
- Không business logic trong views/controllers — trích xuất ra services

---

# Rule 2: TDD Enforcement

Ngăn AI giao code chưa được test.

```
RED   → Viết test. Chạy. Xác nhận test FAILS.
GREEN → Viết code tối thiểu để pass. Chạy. Xác nhận PASS.
REFACTOR → Dọn dẹp. Chạy lại. Xác nhận vẫn PASS.
```

**Bắt buộc**: parser, validator, thuật toán, data processor, state manager

**Có thể bỏ qua**: thay đổi CSS, config, markdown, sửa lỗi chính tả

AI phải **đưa ra kết quả test** làm bằng chứng tuân thủ.

---

# Rule 3: Grooming (Phỏng Vấn Ngược)

Ngăn lỗi #1 của AI: xây dựng sai thứ cần xây.

Trước khi code bất cứ thứ gì phức tạp, AI phải hỏi BẠN 3-5 câu:

- Cái gì CHẮC CHẮN nằm ngoài phạm vi? "Xong" nghĩa là gì?
- Điều gì xảy ra khi thiếu dữ liệu? Khi mạng lỗi?
- Kết nối với những module/API nào đang có?
- Từ góc nhìn người dùng, họ thấy/làm gì?

Nếu AI bỏ qua câu hỏi → vi phạm rule. Dừng lại và yêu cầu đặt câu hỏi.

---

# Rule 4: Ubiquitous Language

Ngăn lệch thuật ngữ khiến codebase không thể đọc hiểu.

Mỗi khái niệm nghiệp vụ có **một tên chuẩn duy nhất** trong `GLOSSARY.md`:

| Thuật ngữ | Định nghĩa | Tham chiếu code | Tên cấm |
|---|---|---|---|
| PurchaseOrder | Đơn mua hàng nội bộ | `PurchaseOrder` model | "Order", "Replenish.." |
| Supplier | Nhà cung cấp hàng | `supplier_id` column | "Vendor", "Client" |

Nếu thiếu GLOSSARY.md → AI đề xuất tạo từ entity files và cấu trúc cơ sở dữ liệu.

---

# Rule 5: Vertical Slicing

Ngăn tình trạng "mọi thứ đã code xong nhưng không thứ gì hoạt động cùng nhau."

**Tệ (Horizontal):** Tạo TẤT CẢ schema → TẤT CẢ API → TẤT CẢ UI — không gì test được cho đến khi mọi thứ xong

**Tốt (Vertical):**
- Slice A: "Lưu item mới" (Schema → Repo → API → UI)
- Slice B: "Hiển thị danh sách" (Đọc → API → Component)
- Slice C: "Sửa chi tiết" (Cập nhật → PATCH → Form sửa)

Mỗi slice test được và merge được độc lập.

---

# Rule 6: Skill Compliance

Ngăn AI tải skill xong rồi chọn lọc bỏ qua các bước.

- Tải SKILL.md là một **cam kết ràng buộc**
- Độ phức tạp KHÔNG phải lý do hợp lệ để bỏ qua bước
- Mọi bước bắt buộc phải thực thi theo đúng thứ tự
- Mọi artifact skill yêu cầu phải được tạo ra

**Hard-stop gates:**
- Design checkpoint: không trả lời được câu hỏi → thiết kế lại
- TDD: test chưa viết trước → dừng và viết test
- Ambiguity: không có contract cho edge case → hỏi user

---

# Cách Rules Tiến Hóa

Rules không được thiết kế từ trước. Chúng xuất hiện từ lỗi thực tế:

```
QUAN SÁT → Chẩn đoán → Mã hóa → Kiểm tra → Tinh chỉnh → Tổng quát
```

**Nguyên tắc vàng**: chỉ thêm rules để phản ứng với lỗi thực tế. Không bao giờ từ lo ngại giả định.

---

# Các Pattern Lỗi AI Phổ Biến Nhất

| Danh mục | Ví dụ | Rule phòng vệ |
|---|---|---|
| Chất lượng code | Nuốt lỗi âm thầm `catch(e) {}` | Code quality baseline |
| Quy trình | Giao code chưa test | TDD enforcement |
| Quy trình | Xây sai do tự suy diễn yêu cầu | Grooming |
| Đặt tên | Cùng khái niệm có 5 tên khác nhau | Ubiquitous language |
| Kiến trúc | God object phình to theo thời gian | Code quality baseline |
| Bảo mật | Hardcode API key vào source | Git safety rules |
| Nghiệp vụ | Tự bịa business rules cho case mơ hồ | Ambiguity policy |

---

# Hệ Thống Skill

Skills là **sổ tay huấn luyện** của AI — workflow hoàn chỉnh cho từng loại task.

**Cách định tuyến skill:**
1. AI kiểm tra `INDEX.md` để tìm skill phù hợp
2. Tải `SKILL.md` của skill đó và làm theo từng bước
3. Với task phức tạp, tham khảo `WIRING.md` để biết lộ trình kết hợp

---

# Khi Nào Dùng Skill Nào

| Loại Task | Dùng Skill Này |
|---|---|
| Viết hoặc refactor code | `code-craft` |
| Debug lỗi | `systematic-investigation` |
| Thiết kế feature mới | `requirements-driven-dev` |
| Review code hoặc specs | `reviewer` |
| Khám phá codebase lạ | `codebase-exploration` |
| Thiết kế UI | `ui-ux` |
| Brainstorm ý tưởng | `brainstorming` |

**Bỏ qua skill khi**: sửa lỗi chính tả, format, đổi config, rename không đổi logic.

---

# Giải Phẫu Một Skill

```
skills/<tên-skill>/
├── SKILL.md           ← Workflow chính (entry point)
├── references/        ← Nội dung chuyên sâu (tải khi cần)
└── assets/            ← File dữ liệu, CSV, ảnh (tùy chọn)
```

**SKILL.md có 6 phần:**
1. YAML frontmatter (harness matching)
2. Workflow phases (có thứ tự, bắt buộc)
3. Stop conditions (hard-stop gates)
4. Deliverable checklist (tiêu chí hoàn thành)
5. Anti-pattern table (đường tắt AI sẽ cố đi)
6. References (tài liệu chuyên sâu tải khi cần)

---

# Skill Composition: WIRING.md

Task phức tạp kết hợp nhiều skill theo chuỗi:

**Debug Một Lỗi**
1. `codebase-exploration` → khám phá ranh giới code lạ
2. `systematic-investigation` → phân tích nguyên nhân gốc
3. `code-craft` → triển khai sửa lỗi có kỷ luật
4. `reviewer` → xác minh sửa lỗi đã giải quyết nguyên nhân gốc

**Triển Khai Một Feature**
1. `requirements-driven-dev` → spec (nếu feature lớn/mơ hồ)
2. `codebase-exploration` → vẽ bản đồ khu vực mục tiêu
3. `code-craft` → triển khai có kỷ luật
4. `reviewer` → review sau triển khai

---

# Vòng Đời Skill

**Giai đoạn 1 — Prototype** (1-2 lần dùng)
Viết như checklist. Theo dõi: AI bỏ qua bước nào? Bước nào lâu? Vô ích?

**Giai đoạn 2 — Hardening** (3-5 lần dùng)
Thêm stop conditions. Thêm anti-pattern. Xóa bước vô ích.

**Giai đoạn 3 — Team Adoption** (5+ lần dùng)
Thêm description trau chuốt, mục INDEX/WIRING, ví dụ đầu ra.

**Giai đoạn 4 — Maintenance** (hàng quý)
Xem xét mức độ sử dụng, tính phù hợp, độ dài. Loại bỏ skill lỗi thời.

---

# Onboarding Dự Án: 30 Phút Đầu

Mỗi người mới (người hoặc AI) cần:

1. **Hiểu sản phẩm** — Làm gì? Cho ai?
2. **Môi trường dev hoạt động** — Build và chạy được không?
3. **Quy tắc tham gia** — Không bao giờ được làm gì?
4. **Bản đồ codebase** — Mỗi loại code nằm ở đâu?
5. **Quality bar** — Lệnh nào chứng minh code đúng?

```bash
make dev-up && make dev && make quality
```

---

# 6 Quality Gates

Mỗi thay đổi code đi qua các cổng sau:

```
1. Design Checkpoint (7 câu hỏi)
   ↓
2. TDD Cycle (test → triển khai → refactor)
   ↓
3. Code Quality Rules (đặt tên, nesting, cấu trúc)
   ↓
4. Quality Tooling (format → lint → type-check → audit)
   ↓
5. Readability & Robustness Audit
   ↓
6. Tech Debt Inventory
```

---

# Gate 1: Design Checkpoint

Trước khi viết BẤT KỲ hàm nào, trả lời 7 câu:

1. Đơn vị này làm MỘT việc gì?
2. Interface nhỏ nhất caller cần là gì?
3. Đơn vị này phụ thuộc vào cái gì?
4. Người đọc có theo được logic chỉ từ tên gọi không?
5. Độ phức tạp interface << độ phức tạp triển khai?
6. Type signatures đã định nghĩa đầy đủ trước khi code chưa?
7. Với edge case mơ hồ: contract nào chọn cách xử lý đúng?

**Nếu bất kỳ câu nào không rõ → DỪNG và thiết kế lại.**

---

# Gate 5: Readability Audit

Đọc code như một kỹ sư mới không có context:

1. Entry point có rõ ràng không?
2. Có theo được luồng điều khiển chỉ từ tên hàm không?
3. State mutations có rõ ràng ở call site không?
4. Error path có dễ đọc như happy path không?
5. Điều gì xảy ra khi phụ thuộc bên ngoài lỗi?

Với mỗi câu trả lời yếu → refactor hoặc thêm `// CLARITY:`.

---

# Gate 6: Tech Debt Inventory

AI phải khai báo nợ kỹ thuật đang chấp nhận:

```
TECH DEBT INVENTORY
- TODO(debt): src/pricing.py:142 — hardcode margin 15%
  hoãn đến khi hệ thống nghiệp vụ có trường margin
  trigger dọn dẹp: khi API hệ thống nghiệp vụ có trường margin
```

**REFACTOR-SIGNAL markers** tạo kho tìm kiếm được:
```
// REFACTOR-SIGNAL: god-object — PaymentController sở hữu 4 domain
// REFACTOR-SIGNAL: implicit-coupling — state chia sẻ giữa A và B
```

---

# Cách Viết Prompt Tốt

**Tệ:**
> "Thêm user preferences vào dashboard"

**Tốt (phần 1):**
> "Thêm tùy chọn ẩn/hiện cột cho data grid. Mỗi user, mỗi workspace. Dùng pattern preferences API có sẵn."

---

# Prompt Tốt (tiếp)

**Tốt (phần 2):**
> "Frontend: composable workspace-scoped, KHÔNG global store hay localStorage. Tiêu chí chấp nhận: toggle ẩn/hiện cột, persist qua reload, tôn trọng scope workspace."

Một prompt tốt có: **phạm vi rõ ràng, tham chiếu pattern, quyền sở hữu dữ liệu, tiêu chí chấp nhận, ràng buộc kiến trúc.**

---

# Tự Động Hóa & Quality Tooling

Mọi lệnh qua một entry point duy nhất: **Makefile**

```
make fix          # Tự động format và sửa an toàn
make lint         # Format + lint + type check nhanh
make quality      # Kiểm tra cấu trúc + dependency audit
make test         # Tất cả tests
make dev          # Chạy dev servers
make build        # Production build
```

Một interface cho người, AI, và pipeline build tự động.

---

# Bảo Mật Cơ Bản

- **Không bao giờ commit secrets** — `.env`, `*.pem`, `*.key` trong `.gitignore`
- **Quét secret tự động** mỗi commit
- **Dependency auditing** trong CI — lỗ hổng đã biết = chặn merge
- **Single write path** cho dữ liệu nghiệp vụ — một API duy nhất
- **Server-authoritative state** — không hiển thị dữ liệu chưa commit/suy đoán
- **Audit trails** cho mọi background job, sync, hoặc pipeline run

---

# Báo Cáo Cho Quản Lý

Những gì leadership cần thấy:

| Chỉ số | Mục tiêu |
|---|---|
| Điểm complexity | Dưới ngưỡng |
| Độ dài hàm | Tối đa 50 dòng |
| Lỗ hổng phụ thuộc | 0 critical/high |
| Test coverage | 80%+ |
| Vận tốc với AI | So sánh velocity sprint trước/sau AI |

Theo dõi: **chi phí AI mỗi sprint, chất lượng đầu ra AI, vận tốc giao hàng.**

---

# Mô Hình Trưởng Thành

**Giai đoạn 1: Foundation** (bắt buộc có)
AGENTS.md, GLOSSARY.md, quality gates, pipeline build tự động, skill catalog, architecture doc, security scanning

**Giai đoạn 2: Intelligence** (khi dự án phát triển)
Coverage reporting, warnings chuyển thành hard-fail, cảnh báo phụ thuộc tự động, dashboard AI usage, performance budgets

---

# Mô Hình Trưởng Thành (tiếp)

**Giai đoạn 3: Optimization** (tầm nhìn dài hạn)
Gợi ý cải thiện cấu trúc tự động, chia sẻ kiến thức xuyên dự án, metrics hiệu quả skill, pipeline tự phục hồi

---

# Bắt Đầu: Checklist

1. Tạo `AGENTS.md` với source-of-truth hierarchy
2. Tạo `GLOSSARY.md` với thuật ngữ domain
3. Thiết lập `.agents/rules/` với 6 rules thiết yếu
4. Thiết lập `.agents/skills/INDEX.md` và `WIRING.md`
5. Định nghĩa quality gates với ngưỡng
6. Thiết lập pipeline build & deploy tự động với phân tách môi trường
7. Tạo `Makefile` làm entry point duy nhất
8. Cấu hình security scanning (secrets, dependencies, quét code tự động)
9. Viết `docs/architecture.md` với phân chia trách nhiệm
10. Đào tạo team về mô hình tương tác

---

# Điểm Cốt Lõi

1. **AI là junior engineer** — nhanh, không mệt, cần hướng dẫn rõ ràng
2. **Rules ngăn chặn, skills định hướng** — công cụ khác nhau cho mục đích khác nhau
3. **Rules đến từ lỗi thực tế** — không bao giờ từ lo ngại giả định
4. **Vertical slicing tốt hơn horizontal building** — test được ở mỗi bước
5. **Grooming interview rất quan trọng** — AI hỏi BẠN trước khi code
6. **Skill compliance là ràng buộc** — không được bỏ qua bước
7. **Quality gates là không thể thương lượng** — mọi thay đổi qua đủ 6 cổng
8. **Bắt đầu đơn giản, tiến hóa liên tục** — rules và skills trưởng thành theo thời gian

---

<!-- _class: lead -->

# Hỏi Đáp?

**Tài liệu tham khảo:**
- `.agents/docs/ai-agent-skills-and-rules-engineering.md`
- `.agents/docs/ai-augmented-project-setup-and-evolution.md`
- `.agents/docs/README.md`

**Bước tiếp theo:** Chọn một rule để triển khai hôm nay. Sau đó prototype một skill.
