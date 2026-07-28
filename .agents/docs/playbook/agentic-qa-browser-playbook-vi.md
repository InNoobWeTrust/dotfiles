# Agentic QA Browser Playbook

Hướng dẫn vận hành thực tế cho các đội QA đã có quy trình manual vững, queue quá tải, và một agent có khả năng điều khiển trình duyệt qua Chrome DevTools Protocol.

Playbook này cố ý thực dụng:

- bắt đầu bằng các browser audit có giới hạn, không phải full automation
- giữ lại QA manual cho phán đoán rủi ro và chấm điểm cuối cùng
- mọi lần chạy đều có thể audit được nhờ input file rõ ràng và output dạng machine-readable
- báo cáo stakeholder được suy ra từ evidence, không phải ngược lại

---

## 1. Playbook này giải quyết vấn đề gì

Dùng khi:

- developer ship thay đổi nhanh hơn tốc độ QA có thể test thủ công
- QA đã có sẵn template báo cáo, nhưng việc thu thập evidence còn chậm
- team có thể dùng agent điều khiển trình duyệt, nhưng chưa dùng Selenium hay Playwright trực tiếp
- cần thứ gì đó chạy được ngay, trước khi xây dựng hẳn một đội automation engineering

Mục tiêu thứ nhất là **triage tốt hơn và thu thập evidence nhanh hơn**.
Mục tiêu thứ hai là **promote có chọn lọc các check ổn định**.

---

## 2. Mô hình vận hành

Phân chia công việc rõ ràng:

| Vai trò            | Chịu trách nhiệm                                                                  |
| ------------------- | ------------------------------------------------------------------------------------ |
| **Developer** | PR handoff, tự check local, ghi chú seed/flag, verify happy-path cơ bản          |
| **Agent**     | thao tác trình duyệt, chạy scenario lặp lại, capture evidence, draft báo cáo |
| **QA**        | chọn scenario, exploratory judgment, chấm severity/rủi ro, khuyến nghị release  |

Dùng agent cho:

1. mở rộng scenario
2. thực thi browser có giới hạn
3. capture artifact
4. điền draft báo cáo

**Không** dùng agent làm người phê duyệt release duy nhất.

---

## 3. Cấu trúc repo gợi ý trong project đích

```text
qa/
  audit-requests/
    checkout-smoke.yaml
  report-templates/
    qa-summary-template.md
    stakeholder-template.xlsx
  artifacts/
    browser-audits/
      2026-07-28/
        checkout-smoke/
          audit-request.yaml
          findings.yaml
          summary.md
          artifacts-manifest.yaml
          screenshots/
          traces/
          reports/
```

Quy tắc thực tế tối thiểu:

- `audit-requests/` = những gì cần chạy
- `artifacts/browser-audits/` = những gì đã thực sự xảy ra
- `report-templates/` = cách trình bày kết quả

---

## 4. Thiết lập MCP để điều khiển trình duyệt

Agent của bạn cần một MCP server điều khiển trình duyệt cùng với một instance Chrome cho phép remote debugging.

### Bước 1 — Khởi chạy Chrome cho QA

Dùng profile tách biệt, không dùng profile trình duyệt cá nhân.

```text
google-chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/qa-chrome-profile
```

Lý do:

- cô lập cookie và session test
- khiến việc điều khiển trình duyệt từ xa có thể dự đoán được
- giảm rủi ro rò rỉ session cá nhân vào artifact

### Bước 2 — Đăng ký MCP server trong `kilo.json`

Lệnh chính xác tùy thuộc vào MCP server tương thích CDP mà team bạn cài đặt. Hình dạng trong Kilo như sau:

```jsonc
{
  "$schema": "https://app.kilo.ai/config.json",
  "mcp": {
    "browser": {
      "type": "local",
      "command": ["<your-mcp-launcher>", "<your-browser-mcp-server>"],
      "environment": {
        "CHROME_REMOTE_DEBUGGING_URL": "http://127.0.0.1:9222",
        "CHROME_PATH": "/usr/bin/google-chrome"
      },
      "enabled": true,
      "timeout": 20000
    }
  },
  "permission": {
    "browser_*": "ask"
  }
}
```

Lưu ý:

- giữ browser tools ở chế độ `ask` lúc đầu; chỉ nới lỏng khi workflow đã ổn định
- nếu MCP server của bạn yêu cầu port thay vì URL, điều chỉnh biến môi trường tương ứng
- nếu server tự khởi chạy Chrome cho bạn, vẫn nên dùng profile QA riêng

### Bước 3 — Xác minh trong Kilo

Sau khi lưu config:

1. restart hoặc reload Kilo nếu cần
2. dùng `/mcps` để xác nhận server đã được bật
3. yêu cầu agent làm một xác minh nhỏ:

```text
Open the browser on https://example.com, capture one screenshot, and report the page title.
```

Nếu thất bại, sửa kết nối MCP trước khi chạy QA scenario.

### Bước 4 — Quy tắc vận hành cho browser work

Luôn dặn QA operator:

- không bao giờ browse production nếu chưa được phê duyệt rõ ràng
- không bao giờ capture secret trong screenshot hay trace
- dừng lại khi gặp CAPTCHA hoặc anti-bot wall
- chỉ dùng tài khoản test chuyên dụng
- dùng observe → act → verify ở mỗi bước

---

## 5. Cách QA làm việc với agent

Dùng prompt có giới hạn, không phải yêu cầu mơ hồ.

### Yêu cầu tệ

```text
Test the app and tell me if it is okay.
```

### Yêu cầu tốt

```text
You are assisting QA on a bounded browser audit.
Use the audit request file at `qa/audit-requests/checkout-smoke.yaml`.
Run only the declared scenarios.
For each scenario, return:
- expected result
- observed result
- grade: pass | fail | unverified | blocked
- artifact references
- short repro steps for failures
Stop if auth, environment, or fixture assumptions are broken.
Do not invent missing requirements.
```

Điều này giữ cho lần chạy:

- có thể audit được
- có thể tái lập được
- có thể được người khác review sau này

---

## 6. Bắt đầu với một input file có thể audit

Với các team quá tải, con đường áp dụng nhanh nhất là **một file audit request duy nhất** cho mỗi lần chạy.

### File gợi ý: `qa/audit-requests/checkout-smoke.yaml`

```yaml
schema_version: 1
run_id: checkout-smoke-2026-07-28
purpose: "Smoke-check checkout changes from PR-184"
audience: eng-only
app:
  name: acme-shop
  environment: preview
  base_url: https://preview.acme-shop.test
  sanctioned: true
access:
  auth_mode: seeded-user
  account_role: shopper
  secrets_ref: env:QA_SHOPPER_ACCOUNT
fixtures:
  - cart-with-one-item
  - payment-sandbox
execution:
  browser: chromium
  viewports: [desktop-1440, iphone-12]
  collect:
    screenshots_on: [fail]
    trace_on_fail: true
    a11y_snapshot: true
stop_conditions:
  - auth failure
  - environment unreachable
  - captcha encountered
  - missing seed data
scenarios:
  - id: checkout-happy-path
    priority: critical
    intent: "Complete checkout with valid data"
    steps:
      - "Open /checkout"
      - "Confirm cart has one item"
      - "Fill valid shipping and payment details"
      - "Submit order"
    rubric:
      pass_when:
        - "Order confirmation is visible"
        - "URL includes /confirmation"
        - "Order id is shown"
      fail_when:
        - "Submission errors appear"
        - "Spinner hangs without completion"
      unverified_when:
        - "Page becomes unstable or run cannot complete"
  - id: checkout-invalid-card
    priority: critical
    intent: "Rejected card should not create an order"
    steps:
      - "Open /checkout"
      - "Use decline test card"
      - "Submit payment"
    rubric:
      pass_when:
        - "Inline payment error is visible"
        - "URL does not move to /confirmation"
      fail_when:
        - "Order confirmation appears"
        - "No validation or error appears"
      unverified_when:
        - "Sandbox payment service is unavailable"
report:
  template: qa/report-templates/qa-summary-template.md
  require_fields:
    - scenario_id
    - expected_result
    - actual_result
    - grade
    - artifacts
```

### Tại sao cấu trúc này hiệu quả

File này khóa chặt:

- mục tiêu và môi trường
- giả định về auth và fixture
- điều kiện dừng
- scenario
- rubric để chấm điểm
- contract báo cáo

Như vậy là đủ để agent chạy một audit có giới hạn mà không phải đoán quá nhiều.

---

## 7. Cách QA soạn audit request qua các lượt Q&A

Nhiều đội QA sẽ không viết toàn bộ YAML từ đầu lúc mới bắt đầu.
Điều đó bình thường.

Một workflow thực tế là:

1. QA mang context PR / ticket / bug
2. QA yêu cầu agent phỏng vấn họ
3. agent hỏi các câu hỏi có cấu trúc
4. QA trả lời bằng ngôn ngữ ngắn gọn, đơn giản
5. agent draft file `audit-request.yaml`
6. QA review và sửa draft trước khi thực thi

Mục tiêu không phải là biến QA thành chuyên gia YAML.
Mục tiêu là làm cho input **rõ ràng, có thể review và audit được**.

### Prompt mở đầu gợi ý từ QA

```text
Help me compose an audit request file for this change.
Ask me one question at a time until you have enough information to draft `qa/audit-requests/checkout-smoke.yaml`.
Do not run the browser yet.
At the end, return:
1. missing assumptions
2. proposed scenarios
3. the draft YAML
```

Điều này giữ agent ở **chế độ orchestration**, không phải chế độ execution.

### Những gì agent nên hỏi

Cuộc phỏng vấn nên thu thập các trường này theo thứ tự:

1. **Bối cảnh thay đổi**
   - tính năng / PR / bug nào đang được test?
2. **Môi trường đích**
   - local, preview, staging?
   - base URL là gì?
3. **Mô hình truy cập**
   - anonymous hay cần xác thực?
   - cần role/account gì?
4. **Fixtures / dữ liệu**
   - cần seed data, feature flag, hoặc setup gì?
5. **Phạm vi**
   - 1–5 scenario nào quan trọng nhất cho lần chạy này?
6. **Rubric**
   - điều gì chứng minh pass, fail, unverified, blocked?
7. **Thiết lập thực thi**
   - browser, viewport, kỳ vọng screenshot/trace?
8. **Đích báo cáo**
   - eng-only hay dành cho stakeholder?
   - nên điền vào template báo cáo nào?

### Mẫu Q&A tốt

Agent nên hỏi các câu ngắn gọn, thu hẹp dần như:

- "Thay đổi cụ thể nào chúng ta đang test?"
- "Môi trường nào được phê duyệt cho lần chạy này?"
- "Có cần login không? Nếu có, role gì?"
- "Dữ liệu gì phải tồn tại trước khi scenario bắt đầu?"
- "Top 3 user journey rủi ro nhất là gì?"
- "Với scenario 1, điều gì chứng minh thành công?"
- "Cái gì được tính là fail so với chỉ là unverified?"
- "Lần chạy này chỉ dành cho eng, hay sẽ đưa vào báo cáo stakeholder?"

### Mẫu Q&A tệ

Tránh các câu hỏi của agent như:

- "Kể cho tôi mọi thứ về tính năng này."
- "Tôi nên test gì?"
- "Bạn có thể cung cấp tất cả requirements chi tiết không?"

Những câu đó tạo ra hội thoại mơ hồ, tốn nhiều công sức và lãng phí thời gian của QA.

### Ví dụ hội thoại

```text
QA: Help me compose an audit request file for PR-184. Ask one question at a time.

Agent: What exact change is PR-184 introducing?

QA: Checkout UI update plus new payment validation behavior on mobile.

Agent: Which environment is sanctioned for this audit?

QA: Preview. Base URL is https://preview.acme-shop.test.

Agent: Does the flow require authentication? If yes, which role/account?

QA: Yes. Seeded shopper account.

Agent: What setup or seed data must exist first?

QA: Cart with one item, sandbox payment gateway, default shipping address.

Agent: What are the top risky scenarios for this run? Keep it to 3 if possible.

QA: Happy path checkout, declined card flow, and form validation on mobile.

Agent: For the happy path, what proves pass?

QA: Confirmation page appears, URL includes /confirmation, and order id is shown.

Agent: What should count as unverified rather than fail?

QA: If preview is unstable or the payment sandbox is unavailable.
```

Đến đó, agent nên tóm tắt các giả định và draft YAML.

### Output trung gian gợi ý từ agent

Trước khi viết YAML, yêu cầu agent hiển thị bản tóm tắt này:

```text
Proposed audit scope
- Target: ...
- Auth: ...
- Fixtures: ...
- Scenarios: ...
- Known stop conditions: ...
- Open questions: ...
```

Tại sao điều này quan trọng:

- QA có thể phát hiện hiểu nhầm sớm
- phạm vi lần chạy được giữ nhỏ
- các precondition còn thiếu trở nên rõ ràng trước khi thực thi

### Prompt gợi ý cho bước draft

```text
Based on our Q&A so far, draft the audit request YAML.
Use only information we explicitly agreed on.
If something is missing, mark it under `open_questions` or `assumptions` instead of inventing details.
Do not start the browser run.
```

### Checklist QA review trước khi phê duyệt draft

Trước khi audit request được dùng, QA nên kiểm tra:

- Môi trường có đúng và được phê duyệt không?
- Role/account yêu cầu có đúng không?
- Fixtures hoặc flag đã được liệt kê rõ ràng chưa?
- Có quá nhiều scenario cho một lần chạy không?
- Mỗi scenario có logic pass/fail thực sự không?
- Đã có điều kiện dừng chưa?
- `unverified` có được dùng trung thực không?
- Đích báo cáo có đúng không?

### Quy tắc thực tế cho giai đoạn đầu áp dụng

Trong vài tuần đầu, giữ mỗi audit request được soạn qua hội thoại ở mức:

- **1 tính năng hoặc PR**
- **1 môi trường**
- **1 role/loại account**
- **tối đa 3–5 scenario**

Audit request nhỏ thì dễ review hơn, dễ chạy hơn, và dễ tin tưởng hơn.

---

## 8. Cách viết scenario tốt

Mỗi scenario nên trả lời 5 câu hỏi:

1. **Business path nào đang được kiểm tra?**
2. **Precondition nào phải thỏa mãn trước?**
3. **Những hành động cụ thể nào cần được thực hiện?**
4. **Điều gì chứng minh pass?**
5. **Cái gì được tính là fail, unverified, hoặc blocked?**

### Cách viết scenario tốt

```text
Intent: Rejected card should not create an order.
Pass when: inline error is shown and URL stays off confirmation.
Fail when: order confirmation appears.
Unverified when: payment sandbox is down.
```

### Cách viết scenario yếu

```text
Test payment errors.
```

Ngắn thì được.
Mơ hồ thì không.

---

## 9. Cách viết rubric trung thực

Rubric nên được viết **trước** khi chạy.

Dùng các mức grade này một cách nhất quán:

| Grade                | Ý nghĩa                                                                |
| -------------------- | ------------------------------------------------------------------------ |
| **pass**       | Tất cả kỳ vọng bắt buộc đều được đáp ứng                   |
| **fail**       | Một hoặc nhiều kỳ vọng bị vi phạm                                 |
| **unverified** | Lần chạy không tạo ra đủ evidence đáng tin cậy để đánh giá |
| **blocked**    | Một prerequisite thất bại trước khi scenario có thể được test  |

Quy tắc cứng:

- không bao giờ map `unverified` thành pass
- không bao giờ map `blocked` thành pass
- không để agent viết lại rubric sau khi đã thấy kết quả
- dùng hành vi người dùng nhìn thấy được làm oracle, không phải chi tiết implementation

---

## 10. Workflow browser audit hàng ngày

Với mỗi PR hoặc ticket có rủi ro:

1. dev cung cấp một block QA handoff nhỏ
2. QA viết hoặc cập nhật một file audit request
3. agent chạy browser audit từ file đó
4. agent lưu artifact và machine output vào `qa/artifacts/browser-audits/...`
5. QA review findings và sửa các chấm điểm sai
6. agent ánh xạ machine output vào template báo cáo đích
7. QA quyết định xem scenario nào nên được promote thành automation bền vững sau này

### Block dev handoff tối thiểu

```text
Feature/change:
Risk areas:
How to access:
Test account / role:
Seed data / feature flag:
Happy path to verify:
Negative path to verify:
Known non-goals:
```

Đây là một trong những cách rẻ nhất để giảm tắc nghẽn QA.

---

## 11. Machine output kỳ vọng từ lần chạy

Một browser audit tốt nên tạo ra ít nhất:

```text
qa/artifacts/browser-audits/<date>/<run-id>/
  audit-request.yaml
  summary.md
  findings.yaml
  artifacts-manifest.yaml
  screenshots/
  traces/
```

### Ví dụ `findings.yaml`

```yaml
run_id: checkout-smoke-2026-07-28
results:
  - scenario_id: checkout-happy-path
    grade: pass
    expected_result: "Order confirmation visible and URL includes /confirmation"
    actual_result: "Confirmation page visible with order id ORD-1042"
    evidence_grade: browser-audited
    artifacts:
      - screenshots/checkout-happy-path--desktop-1440.png
  - scenario_id: checkout-invalid-card
    grade: fail
    expected_result: "Inline payment error appears and no order is created"
    actual_result: "Submit spinner hangs and no validation appears"
    evidence_grade: browser-audited
    artifacts:
      - screenshots/checkout-invalid-card--iphone-12--fail.png
      - traces/checkout-invalid-card--iphone-12.trace.zip
    repro_steps:
      - open checkout with seeded cart
      - enter decline card
      - submit payment
      - observe endless spinner
```

### `artifacts-manifest.yaml` nên ghi lại

- đường dẫn file
- scenario id
- loại artifact
- có chứa dữ liệu nhạy cảm không
- có an toàn cho báo cáo stakeholder không

Điều này ngăn screenshot và trace trở thành rác không quản lý được.

---

## 12. Cách biến browser run thành báo cáo đích

Hãy coi việc tạo báo cáo là **projection**, không phải nguồn sự thật.

### Quy trình

1. `audit-request.yaml` định nghĩa những gì cần được kiểm tra
2. browser run tạo ra `summary.md`, `findings.yaml`, và các file artifact
3. agent ánh xạ các machine output đó vào template báo cáo hiện có của bạn
4. QA review báo cáo cuối cùng trước khi chia sẻ

### Ví dụ ánh xạ

| Trường máy       | Trường báo cáo đích              |
| ------------------- | -------------------------------------- |
| `scenario_id`     | Scenario / test case                   |
| `expected_result` | Expected                               |
| `actual_result`   | Actual                                 |
| `grade`           | Status / cột chấm điểm             |
| `artifacts`       | Evidence link / tham chiếu screenshot |
| `repro_steps`     | Repro / ghi chú                       |

### Prompt an toàn để tạo báo cáo

```text
Using `qa/artifacts/browser-audits/2026-07-28/checkout-smoke/findings.yaml`
and the template `qa/report-templates/qa-summary-template.md`,
produce the target report.
Preserve machine grades exactly.
Do not convert unverified or blocked into pass.
Exclude any artifact marked sensitive or not stakeholder-safe.
If required template fields are missing, mark the row incomplete instead of inventing content.
```

---

## 13. Chế độ báo cáo

### Chỉ dành cho engineering

Dùng:

- Markdown summary
- machine findings YAML
- artifact link

Phù hợp nhất khi:

- dev cần repro và evidence nhanh
- chưa có audience phi kỹ thuật nào cần kết quả

### Stakeholder / business

Chỉ dùng sau khi machine evidence đã tồn tại.

Các output khả dĩ:

- ma trận Excel
- PDF summary
- báo cáo HTML tĩnh

Quy tắc:

- sanitize text và artifact nhạy cảm trước
- số liệu đếm phải khớp với machine record
- `unverified` phải giữ nguyên là `unverified`
- `blocked` phải giữ nguyên là `blocked`

---

## 14. Những gì nên automate sau, không phải bây giờ

**Không** bắt đầu bằng cách yêu cầu QA xây cả một bộ end-to-end khổng lồ.

Chỉ promote những scenario:

- được lặp lại thường xuyên
- ổn định qua các lần chạy
- tốn kém để test lại thủ công
- quan trọng cho release confidence

Ứng viên tốt để promote đầu tiên:

- login smoke
- checkout happy path
- core navigation smoke
- repro bug tái diễn

Ứng viên tệ để promote đầu tiên:

- UX check mang tính exploratory cao
- flow phụ thuộc fixture không ổn định
- đường dẫn brittle đa hệ thống với test isolation kém

---

## 15. Anti-pattern cần tránh

- Yêu cầu "Test the whole app"
- để cùng một dev vừa tạo vừa tự chấm điểm kết quả cuối cùng
- giấu `unverified` bên trong một bản tóm tắt màu xanh
- lưu screenshot chứa secret hoặc dữ liệu cá nhân
- bỏ qua điều kiện dừng khi env/auth bị hỏng
- biến mọi one-off run hữu ích thành automation vĩnh viễn
- coi Excel hoặc PDF là thật hơn machine evidence

---

## 16. Kế hoạch triển khai 2 tuần đầu

### Tuần 1

- bật browser MCP hoạt động ổn định
- thống nhất một định dạng file audit-request
- chuẩn hóa ý nghĩa các grade
- pilot trên 3–5 PR rủi ro nhất

### Tuần 2

- đo nguyên nhân blocked vs fail vs unverified
- cải thiện chất lượng dev handoff
- xác định 1–2 scenario lặp lại đáng để promote
- tinh chỉnh prompt/template projection báo cáo

Thành công không phải là "dùng AI nhiều hơn."
Thành công là:

- QA ít phải click thủ công hơn
- turnaround nhanh hơn trên các thay đổi rủi ro
- evidence repro rõ ràng hơn cho dev
- ít silent miss do quá tải hơn

---

## Tài liệu liên quan

- [agentic-qa / Mental model](../agentic-qa/mental-model.md)
- [agentic-qa / Trust and evidence](../agentic-qa/trust-and-evidence.md)
- [agentic-qa / Local materialization](../agentic-qa/local-materialization.md)
- [slides / Agentic QA deck](../slides/03_ai-agentic-qa-en.md)
