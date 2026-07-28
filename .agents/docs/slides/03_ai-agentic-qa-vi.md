---
marp: true
theme: uncover
class:
  - lead
size: 16:9
paginate: true
header: "Phát Triển với AI"
footer: "Agentic QA / QC — Mental Model"
style: |
  section { font-size: 24px; }
  h1 { font-size: 40px; }
  h2 { font-size: 30px; }
  h3 { font-size: 26px; }
  table { font-size: 20px; }
  code { font-size: 18px; }
  pre { font-size: 16px; }
  section.lead h1 { font-size: 54px; }
  section.lead h2 { font-size: 34px; }
  blockquote { font-size: 20px; }
  img {
    background: transparent;
    max-width: min(900px, 92%);
    max-height: 500px;
    width: auto;
    height: auto;
    object-fit: contain;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
  section.illustration h1 { font-size: 32px; margin-bottom: 0.2em; }
  section.illustration img {
    max-width: min(960px, 94%);
    max-height: 520px;
  }
---

# Agentic QA / QC
## Phần 3 — Nền tảng trước, skill sau

**Tiếp nối Phần 1 & 2**

---

# Buổi này sửa vấn đề gì?

Nhiều slide về agentic QA thường đi từ:

- “AI giờ test được rồi”
- nhảy thẳng sang demo tool
- rồi chốt kết luận rất nhanh

**Bản này thêm đoạn cầu nối còn thiếu:**
- giới thiệu ngắn các khái niệm QA cổ điển
- hình minh họa cho mental model
- link tham khảo để người nghe đọc tiếp

---

# Nhắc lại

| Phần | Đã chốt |
|---|---|
| **1** | AI là junior; rules & skills; quality gate |
| **2** | *Layer* chất lượng; tool fit; Sonar là governance |

**Phần này trả lời:**

> Nếu agent cũng có thể test, audit, và report — làm sao giữ QA trung thực?

---

# Mục tiêu

- Neo agentic QA vào **thực hành automation từ thời pre-agentic**
- Giải thích khái niệm ngoài ngành theo kiểu **plain language trước**
- Chỉ ra điều gì **thực sự mới** trong thời đại agent
- Cài vào đầu một **mental model**: vai trò, evidence, promotion
- Xem skill pack là **bản nháp triển khai**, không phải chân lý

---

# Vì sao agent làm QA quan trọng hơn?

Agent:

- sinh thay đổi nhanh hơn
- nói rất tự tin kể cả khi sai
- lái được browser và tạo screenshot đẹp

Thiếu model, team rất dễ rơi vào **agent theater**:
- demo đẹp
- contract yếu
- confidence bị thổi phồng

---

# Trước khi có “agentic QA”

QA automation đã có hàng chục năm bài học.

Nó tồn tại để:
- rút ngắn vòng phản hồi
- giữ lại trí nhớ regression
- làm refactor bớt nguy hiểm
- đẩy việc phát hiện lỗi lên sớm hơn

**Agent không xóa lịch sử đó.**
Agent chỉ kế thừa nó.

---

# Test pyramid là gì?

Đây là một ý tưởng phân bổ danh mục test:

- **nhiều** test tầng thấp
- **một phần** test service/integration
- **ít** test UI/E2E

Vì sao?
Vì test tầng thấp thường:
- nhanh hơn
- rẻ hơn
- ít flake hơn
- dễ chẩn đoán hơn

---

<!-- _class: illustration -->
# Test pyramid — minh họa

![w:880 h:495](./assets/agentic-qa/test-pyramid.png)

---

# Test pyramid: đọc nhanh gì trước?

**Ý nghĩa chính:**
Khi test tầng cao fail, nó thường chỉ ra rằng team còn thiếu một test tầng thấp hơn.

**Link nên đọc:**
- Fowler: https://martinfowler.com/bliki/TestPyramid.html
- Ham Vocke: https://martinfowler.com/articles/practical-test-pyramid.html

**Điểm chốt:**
Dùng UI/E2E cho confidence rộng, không dùng nó làm phần lớn suite.

---

# Ice-cream cone là gì?

Đây là **phản mẫu** của test pyramid:

- quá nhiều GUI / E2E
- quá ít unit / API

Nó thường xuất hiện khi team:
- lạm dụng record-playback
- để automation tách rời dev
- chỉ kiểm tra hành vi qua browser

---

<!-- _class: illustration -->
# Ice-cream cone — minh họa

![w:880 h:495](./assets/agentic-qa/ice-cream-cone.png)

---

# Vì sao ice-cream cone gây đau?

Nếu phần lớn confidence phụ thuộc vào GUI automation thì suite sẽ:

- chậm
- giòn
- khó debug
- đắt để nuôi

**Nguy cơ với agent:**
Agent có thể sinh ra phản mẫu này cực nhanh bằng cách tạo hàng loạt E2E script.

---

# Testing trophy là gì?

Đây là lời nhắc theo góc nhìn frontend của Kent C. Dodds:

- static analysis rất có giá trị
- integration test sát cách dùng thật thường có ROI cao
- không phải mọi thứ đều cần bị bẻ nhỏ thành test quá cô lập

Nó **không có nghĩa** là “bỏ unit test.”
Nó nói về **confidence trên thời gian bỏ ra**.

---

<!-- _class: illustration -->
# Testing trophy — minh họa

![w:880 h:495](./assets/agentic-qa/testing-trophy.png)

---

# Testing trophy: đọc nhanh gì trước?

**Link hữu ích:**
- Testing Trophy: https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- “Resemble the way your software is used”: https://kentcdodds.com/blog/write-tests

**Chân lý chung của pyramid / trophy / honeycomb:**
> Tối ưu confidence đáng tin, không chạy theo coverage theater.

---

# Shift-left là gì?

**Shift-left** nghĩa là phát hiện vấn đề sớm hơn:

- ngay từ lúc thiết kế
- trong lúc code
- ở PR check
- trước khi tới UAT hay release test muộn

Phát hiện càng sớm thì thường càng rẻ và càng rõ.
Agent chỉ thật sự giúp nếu nó tham gia vòng lặp sớm này.

---

<!-- _class: illustration -->
# Shift-left — minh họa

![w:880 h:495](./assets/agentic-qa/shift-left.png)

---

# Shift-left: đọc nhanh gì trước?

**Link hữu ích:**
- Continuous Delivery: https://continuousdelivery.com/
- Continuous Integration — Fowler: https://martinfowler.com/articles/continuousIntegration.html

**Dịch sang ngữ cảnh local:**
Nếu agent code 40 phút rồi mới “test” ở cuối, đó không phải shift-left. Đó là shift-right được marketing tốt hơn.

---

# Checking và exploratory testing

Một phân biệt rất quan trọng:

- **checking** = xác minh kỳ vọng đã biết
- **exploring** = điều tra rủi ro chưa biết

Automation mạnh ở checking.
Exploratory testing vẫn cần vì hệ thống thật luôn có bất ngờ.

---

<!-- _class: illustration -->
# Checking vs exploratory — minh họa

![w:880 h:495](./assets/agentic-qa/checking-vs-exploring.png)

---

# Vì sao exploratory testing vẫn cần?

Ngay cả team trưởng thành cũng vẫn giữ các phiên khám phá có charter và timebox, vì script không thể tự phát minh ra mọi đường đi lạ.

**Đây là nơi agent có thể giúp thật sự:**
- mở rộng test charter
- biến thiên data và luồng đi
- bắt trace nhanh hơn
- tóm tắt quan sát

Nhưng mission và rubric vẫn phải do người giữ.

---

# Các luật pre-agentic vẫn ràng buộc agent

| Quy tắc | Vẫn đúng? |
|---|---|
| Test hành vi, không bám implementation detail | Có |
| Ưu tiên query ổn định, hướng người dùng | Có |
| Bắt buộc env + fixture xác định | Có |
| Cách ly test flake | Có |
| Tách checking khỏi exploring | Có |
| Truy vết test về business risk | Có |

**Agentic QA thêm sức mạnh, không cho quyền miễn trừ.**

---

# Vậy điều gì thực sự thay đổi?

| Pre-agentic | Agentic mở rộng thêm |
|---|---|
| Con người viết hầu hết test | Agent có thể nháp |
| CI chạy các suite cố định | Agent có thể chạy audit có giới hạn |
| Exploratory chủ yếu làm tay | Agent có thể mở rộng charter |
| Feedback đến sau khi code xong | Sensor có thể nằm ngay trong vòng coding |

Nền tảng giữ nguyên. Vòng lặp trở nên linh hoạt hơn.

---

# Feedforward + feedback

Một khung nhìn hiện đại, dễ dùng:

- **feedforward** = định hình việc sinh ra output từ đầu
- **feedback** = đánh giá output liên tục

Với QA, điều này nghĩa là:
- charter, rule, rubric, constraint
- cộng với lint, test, trace, review, evidence grade

---

<!-- _class: illustration -->
# Feedforward + feedback — minh họa

![w:880 h:495](./assets/agentic-qa/feedforward-feedback.png)

---

# Vì sao vòng lặp này quan trọng?

Agentic QA tệ thường bị lệch một bên:

- **chỉ feedforward** → prompt đẹp nhưng bằng chứng yếu
- **chỉ feedback** → retry ồn ào mà không rõ ý đồ

Hệ thống tốt cần cả hai.

**Nguồn đọc gợi ý:**
- Thoughtworks Technology Radar: https://www.thoughtworks.com/radar

---

# Mental model: ba vai trò

Khi nói “AI có thể test”, mọi người hay trộn 3 việc khác nhau.

1. **Evaluative review** — Rủi ro là gì? Có cần live evidence không?
2. **QA orchestration** — Scenario, contract, môi trường nào khiến kết quả có thể biện hộ được?
3. **Browser mechanics** — Click, wait, trace, screenshot.

---

<!-- _class: illustration -->
# Ba vai trò — minh họa

![w:880 h:495](./assets/agentic-qa/three-roles.png)

---

# Vì sao phải tách 3 vai trò?

Vì click giỏi không đồng nghĩa với phán đoán giỏi.

Browser driver có thể:
- đi qua các trang
- chụp screenshot
- retry thao tác

Nhưng nó **không tự quyết được**:
- rủi ro nào là quan trọng nhất
- điều gì mới đủ để gọi là pass
- thứ gì nên được materialize thành automation bền vững

---

# Mental model: phân hạng evidence

Nếu agentic QA chỉ giữ được một luật cứng, đó là:

- **pass** = đạt kỳ vọng
- **fail** = mâu thuẫn với kỳ vọng
- **unverified** = chưa thể kết luận
- **blocked** = điều kiện tiên quyết hỏng trước

---

<!-- _class: illustration -->
# Evidence grade — minh họa

![w:880 h:495](./assets/agentic-qa/evidence-grades.png)

---

# Vì sao evidence grade quan trọng?

Thiếu kỷ luật grade, team sẽ bắt đầu “laundering” kết quả:

- “unverified” thành “chắc là ổn”
- “blocked” thành “không đáng lo”
- stakeholder summary lệch khỏi machine truth

**Cấm map unverified hay blocked thành pass.**
Không trong chat. Không trong Excel. Không trong PDF.

---

# Mental model: thang promotion

Không phải audit nào hữu ích cũng nên biến thành automation vĩnh viễn.

Chỉ promote khi đường đi đó:
- đủ quan trọng
- đủ ổn định
- đủ lặp lại được
- đáng công bảo trì

---

<!-- _class: illustration -->
# Thang promotion — minh họa

![w:880 h:495](./assets/agentic-qa/promotion-ladder.png)

---

# Đọc thang này cho đúng

Thang này là:

1. heuristic review
2. spot check + evidence
3. browser audit có cấu trúc
4. scenario pack
5. automation bền vững
6. CI / gói release

**Luật:** không escalate theo mặc định.
Rigor cao hơn cũng kéo theo upkeep cao hơn.

---

# Agent làm tốt việc gì?

- Mở rộng biến thể scenario từ charter rõ ràng
- Chạy path lặp lại và thu trace
- Nháp test đầu tiên từ AC không mơ hồ
- Tóm fail kèm bước tái hiện
- Chạy gate local trong vòng RED → GREEN
- Viết narrative theo audience **sau** projection gate

---

# Agent làm kém việc gì?

- Chịu trách nhiệm risk appetite cho release
- Tự bịa business rule khi còn mơ hồ
- Đảm bảo automation không flake khi env thiếu kỷ luật
- Tự chấm bài mình viết mà không bias
- Thay unit/API layer bằng việc nhồi thêm E2E
- Giữ an toàn khi quyền quá rộng

---

# Đừng tin skill một cách mù quáng

Skill pack là:
- một giả thuyết workflow
- một cách materialize ý tưởng
- một thí nghiệm vận hành

Nó **không phải** bằng chứng của độ chín.

Hãy nhìn thực tế:
- chất lượng scenario
- chất lượng evidence
- kỷ luật flake
- ranh giới an toàn
- độ dễ vận hành không cần “anh hùng”

---

# Skill trong repo này

Chỉ là mapping minh họa:

| Khái niệm | Mảnh ví dụ |
|---|---|
| Evaluative review | `reviewer` + black-box lens |
| QA orchestration | `web-qa-audit` |
| Browser mechanics | skill browser automation |
| Stakeholder projection | nhánh report trong `web-qa-audit` |

**Hữu ích để thử nghiệm, chưa phải chuẩn ngành đã battle-test.**

---

# Lộ trình trưởng thành ngắn

| Phase | Trọng tâm |
|---|---|
| **0** | CI + env được sanction + hiểu pyramid |
| **1** | Feedback sensor trong vòng coding |
| **2** | Kỷ luật evaluative review độc lập |
| **3** | Audit có evidence, phạm vi giới hạn |
| **4** | Materialization có chọn lọc |
| **5** | Stakeholder projection (tùy chọn) |
| **6** | Metric danh mục: flake, unverified, tăng trưởng E2E |

Nếu Phase 0 yếu thì sửa Phase 0 trước khi mua “AI QA”.

---

# Phản mẫu cần gọi tên rõ

- Agent ice-cream cone
- Laundering unverified
- Author tự QA một mình
- Materialize mọi thứ
- Deck stakeholder là nguồn sự thật
- Lang thang production
- Cargo-cult copy skill repo

Gọi đúng tên failure mode giúp team chống lại hype.

---

# Quan hệ với Phần 2

| Phần 2 | Phần 3 |
|---|---|
| Tool format → SAST → governance | Evidence hành vi & release |
| Vòng tool inner vs governance | Vai trò review / orchestrate / mechanics |
| Sonar là control tower | Machine record là nguồn sự thật cho claim QA |

Agentic QA mở rộng câu chuyện chất lượng.
Nó không thay linter, SAST hay policy dependency.

---

# Nguồn đọc nhanh cho deck này

**Khái niệm nền tảng**
- Test Pyramid — Fowler: https://martinfowler.com/bliki/TestPyramid.html
- Practical Test Pyramid — Vocke: https://martinfowler.com/articles/practical-test-pyramid.html
- Testing Trophy — Dodds: https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- Write tests that resemble use — Dodds: https://kentcdodds.com/blog/write-tests
- Continuous Delivery: https://continuousdelivery.com/
- Continuous Integration — Fowler: https://martinfowler.com/articles/continuousIntegration.html
- Thoughtworks Radar: https://www.thoughtworks.com/radar

---

# Điểm chốt

1. **Nền tảng trước** — pyramid, shift-left, flake, tách exploratory
2. **Agent đổi ai là người nháp/chạy, không xóa đường cong chi phí**
3. **Tách judgment, orchestration, mechanics**
4. **Evidence grade là bất khả thương lượng**
5. **Materialize có chọn lọc**
6. **Skill là draft của model, không phải model**

---

<!-- _class: lead -->

# Hỏi đáp?

**Docs để đọc sâu hơn:**
- `.agents/docs/agentic-qa/INDEX.md`
- `.agents/docs/agentic-qa/pre-agentic-foundation.md`
- `.agents/docs/agentic-qa/agentic-practices.md`
- `.agents/docs/agentic-qa/trust-and-evidence.md`

**Bước gợi ý tiếp theo:**
Kiểm tra mức sẵn sàng Phase 0–2 trước khi cài bất kỳ skill pack “AI QA” nào.
