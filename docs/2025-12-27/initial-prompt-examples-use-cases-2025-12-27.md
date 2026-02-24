---

### Phase 1: The "Vague Client" (Người dùng phổ thông/Business Owner)

*Mục tiêu test:* Khả năng thu thập yêu cầu (Requirements Gathering) và đề xuất (Consultancy). Agent không nên code ngay mà cần hỏi để làm rõ context hoặc tự đưa ra giả định hợp lý (Assumptions).

| **STT** | **Prompt (Tiếng Việt)** | **Ý định test (Agentic Behavior)** | **Kỳ vọng phản hồi của Agent** |
| --- | --- | --- | --- |
| **1** | "Tôi muốn làm một trang landing page để bán cà phê thủ công. Nhìn nó phải chill và hiện đại." | **Ambiguity Handling** (Xử lý sự mơ hồ). "Chill" là cảm tính. | **Clarification/Planning:** Agent nên hỏi về tông màu (nâu/xanh?), bố cục (có menu không?), hoặc đề xuất dùng React + Tailwind với các component mẫu. |
| **2** | "Làm cho tôi một cái tool để tính toán khoản vay mua nhà, chỉ cần nhập số là ra kết quả ngay." | **Routing Decision** (Chọn Stack). Yêu cầu tính toán đơn giản, không cần UI phức tạp. | **Routing:** Agent nên cân nhắc. Nếu thiên về logic: Python (Streamlit/Gradio). Nếu thiên về giao diện web đẹp: React + state đơn giản. Nó cần đưa ra lựa chọn hoặc tự quyết định dựa trên "default best practice". |
| **3** | "Tạo một trang web giới thiệu bản thân (Portfolio) thật ấn tượng để tôi đi xin việc." | **Creativity & Structuring**. Yêu cầu quá rộng. | **Planning:** Agent nên đề xuất các section (About, Skills, Projects, Contact) trước khi viết code. |

---

### Phase 2: The "Vibe Coder" (Developer hiện đại, thích Tech Stack cụ thể)

*Mục tiêu test:* Khả năng tuân thủ Constraints (ràng buộc kỹ thuật) và sử dụng Modern Frameworks (TanStack, Shadcn/UI, Vite).

| **STT** | **Prompt (Tiếng Việt)** | **Ý định test (Agentic Behavior)** | **Kỳ vọng phản hồi của Agent** |
| --- | --- | --- | --- |
| **4** | "Setup giúp tôi một dự án React dùng Vite. Tôi muốn dùng TanStack Router thay vì React Router, và style bằng Tailwind CSS. Cấu trúc folder theo kiểu Feature-based." | **Constraint Compliance** (Tuân thủ ràng buộc). Test kiến thức về *TanStack Router* (khác React Router). | **Execution:** Agent phải scaffold đúng cấu trúc thư mục (features/...), cài đúng package `@tanstack/react-router` và config `vite.config.ts` chuẩn xác. |
| **5** | "Dựng nhanh một dashboard admin đơn giản. Dùng Shadcn UI cho các components như Sidebar, Table và Card. Theme dark mode mặc định." | **Library Integration**. Test khả năng tích hợp UI Library phức tạp. | **Execution:** Agent cần biết cách setup `cn` utility, cấu hình `tailwind.config.js` cho Shadcn và tạo các component cơ bản mà không bị lỗi import. |
| **6** | "Viết một app Todo list đơn giản nhưng state phải quản lý bằng Zustand, và có persist vào LocalStorage." | **State Management Pattern**. | **Code Quality:** Agent phải tạo store Zustand đúng syntax mới, middleware persist hoạt động đúng. |

---

### Phase 3: The "Data Scientist" (Python Focus, UI đơn giản)

*Mục tiêu test:* Khả năng nhận diện context cần Python (Data/ML) và Route sang các framework như Streamlit/Gradio thay vì React.

| **STT** | **Prompt (Tiếng Việt)** | **Ý định test (Agentic Behavior)** | **Kỳ vọng phản hồi của Agent** |
| --- | --- | --- | --- |
| **7** | "Tôi có một file CSV dữ liệu bán hàng. Tôi muốn một giao diện web để upload file này lên và nó tự vẽ biểu đồ cột doanh thu theo tháng." | **Stack Routing (Critical).** Xử lý CSV và vẽ biểu đồ. | **Decision:** Agent *nên* ưu tiên đề xuất Python (Streamlit/Gradio) vì code ngắn gọn (pandas + matplotlib/plotly) hơn là React (cần thư viện parsing CSV, chart js phức tạp). |
| **8** | "Làm một demo chatbot đơn giản, giao diện chat khung bên trái là lịch sử, bên phải là settings. Backend giả lập thôi." | **Prototyping Speed.** | **Decision:** Có thể là React (nếu cần đẹp) hoặc Gradio (nếu cần nhanh cho AI demo). Agent cần giải thích lý do chọn. |

---

### Phase 4: The "Stress Test" (Yêu cầu mâu thuẫn hoặc thiếu logic)

*Mục tiêu test:* Khả năng sửa lỗi tư duy (Self-Correction) và từ chối/điều chỉnh yêu cầu vô lý.

| **STT** | **Prompt (Tiếng Việt)** | **Ý định test (Agentic Behavior)** | **Kỳ vọng phản hồi của Agent** |
| --- | --- | --- | --- |
| **9** | "Tạo một trang landing page dùng Python nhưng chạy hoàn toàn trên trình duyệt client-side, không cần server, hiệu năng phải nhanh như React." | **Conflict Resolution.** Python thường cần Server (trừ PyScript/WASM nhưng nặng). | **Correction/Education:** Agent phải cảnh báo về giới hạn của Python trên browser (PyScript load lâu) và đề xuất giải pháp thay thế (React) hoặc chấp nhận dùng Streamlit nhưng cần server. |
| **10** | "Code cho tôi trang web giống hệt Facebook nhưng chỉ trong 1 file HTML duy nhất, không dùng CSS hay JS bên ngoài." | **Complexity Management.** Yêu cầu "1 file" cho một app phức tạp. | **Negotiation:** Agent nên giải thích là không thể làm "giống hệt Facebook" trong 1 file, nhưng có thể làm một *bản clone UI tĩnh đơn giản* trong 1 file. |

---

### Hướng dẫn cách đánh giá phản hồi của `via-gent`

Khi chạy các prompts này, bạn hãy quan sát **"Thought Process"** (nếu agent của bạn có hiển thị logs suy nghĩ):

1. **Phân tích Intent:** Nó có nhận ra đây là yêu cầu về UI hay Data không?
2. **Tool Selection:** Nó có chọn đúng công cụ (v.d: `create-vite`, `streamlit run`) không?
3. **File Structure Strategy:** Trước khi code, nó có list ra cấu trúc cây thư mục (File Tree) không? (Đây là dấu hiệu của Senior Agent).
4. **Error Handling (Mental):** Với các prompt mâu thuẫn (số 9, 10), nó có "nhắm mắt làm bừa" hay dừng lại tư vấn?

---

### Phase 5: The "Micromanager" (Yêu cầu nội dung & UI cực kỳ chi tiết)

*Mục tiêu test:* **Attention to Detail**. Kiểm tra xem Agent có bị "hallucinate" (bịa đặt) thông tin hay bỏ sót các yêu cầu nhỏ (mã màu, copy text chính xác) hay không. Đây là trường hợp người dùng đã có design/copywriter và chỉ cần thợ code.

| **STT** | **Prompt (Tiếng Việt)** | **Ý định test (Agentic Behavior)** | **Kỳ vọng phản hồi của Agent** |
| --- | --- | --- | --- |
| **11** | "Tôi cần một trang Landing Page cho sự kiện 'Tech Summit 2025'.
1. **Header**: Logo bên trái text là 'Via-Gent', menu bên phải gồm: 'Trang chủ', 'Diễn giả', 'Vé'.
2. **Hero Section**: Nền màu `#0F172A`. Headline H1 to: 'Tương lai của AI'. Subtext dưới H1: 'Khám phá kỷ nguyên Agentic'. Nút bấm CTA màu `#F59E0B` ghi chữ 'Đăng ký ngay'.
3. **Footer**: Phải có dòng '© 2025 Powered by Shynlee04'.
Tuyệt đối không dùng Lorem Ipsum, hãy điền đúng text tôi yêu cầu." | **Strict Instruction Following.** Test khả năng map yêu cầu text/color vào code chính xác từng ký tự. | **Execution:** Agent không cần sáng tạo (Creative) mà cần chính xác (Precise).
- Code sinh ra phải chứa đúng Hex code màu.
- Text trong thẻ `<h1>`, `<p>`, `<button>` phải khớp 100%.
- Không được tự ý thêm section không được yêu cầu. |
| **12** | "Tạo một form đăng ký gồm đúng 4 trường theo thứ tự sau: 'Họ tên' (input text), 'Email' (input email), 'Gói tham gia' (Select box: Cơ bản, VIP, VVIP), và 'Ghi chú' (Textarea). Nút submit phải disable nếu chưa điền đủ thông tin." | **Logic & Validation Constraints.** Test logic frontend cơ bản kết hợp UI. | **Code Generation:** Agent cần setup form validation (dùng React Hook Form hoặc state cơ bản) đúng logic "disable button". Thứ tự field phải đúng y hệt prompt. |

---

### Phase 6: The "Storyteller" (Dài dòng, lang man, lẫn lộn cảm xúc)

*Mục tiêu test:* **Context Extraction & Noise Filtering**. Người dùng kể lể hoàn cảnh, pha trộn các thông tin không liên quan. Agent cần bóc tách được "User Story" thực sự khỏi đống chữ đó.

| **STT** | **Prompt (Tiếng Việt)** | **Ý định test (Agentic Behavior)** | **Kỳ vọng phản hồi của Agent** |
| --- | --- | --- | --- |
| **13** | "Chuyện là thế này, dạo này tôi thấy mình làm việc mất tập trung quá, cứ ngồi vào máy là lại lướt Facebook. Vợ tôi cứ cằn nhằn mãi. Tôi có thử dùng mấy cái app Pomodoro trên mạng nhưng nó nhiều quảng cáo quá tôi ghét. Tôi muốn ông làm cho tôi cái web app bấm giờ đơn giản thôi.
Kiểu set 25 phút làm, 5 phút nghỉ ấy. Mà tôi thích màu xanh lá cây cho nó dịu mắt, kiểu thiên nhiên ấy, chứ đừng làm màu đỏ như bọn khác nhìn áp lực lắm.
À mà hôm nọ thằng bạn tôi bảo nên thêm cái tính năng list ra mấy đầu việc cần làm trong ngày nữa. Thế thôi, làm nhanh gọn nhẹ để tôi chạy trên máy tính cá nhân nhé." | **Signal-to-Noise Ratio.**
Agent phải bỏ qua: "vợ cằn nhằn", "ghét quảng cáo", "lướt facebook".
Agent phải nhặt ra: App Pomodoro, Timer 25/5, Màu xanh lá (Theme Green), Có To-do list kèm theo. | **Summary & Planning:**
Agent nên bắt đầu bằng: *"Chào bạn, tôi hiểu bạn cần một ứng dụng Pomodoro tập trung vào sự tối giản và thư giãn. Dựa trên chia sẻ, tôi sẽ xây dựng app với các tính năng sau: Timer 25/5 phút, Giao diện màu xanh lá (Green theme), và Tích hợp To-do list đơn giản..."*
Sau đó mới tiến hành code (React + Tailwind là phù hợp nhất). |
| **14** | "Tôi đang học tiếng Anh, muốn làm cái flashcard để học từ vựng. Cơ mà tôi mù công nghệ lắm, không biết database là gì đâu. Tôi muốn nhập từ mới vào, xong nó lưu lại, lần sau mở ra vẫn còn. Đừng làm gì phức tạp quá nhé, kiểu tôi gõ từ 'Apple' mặt trước, mặt sau hiện 'Quả táo'. Có nút bấm 'Tiếp theo' để chuyển từ. À nếu làm được cái hiệu ứng lật lật thẻ bài thì tốt, không thì thôi hiển thị text cũng được. Nhớ là tôi không có server gì đâu đấy." | **Technical Translation.**
Người dùng nói: "Không biết database", "không có server", "lần sau mở ra vẫn còn".
Agent phải dịch thành: **LocalStorage** hoặc **IndexedDB**. | **Planning & Tech Choice:**
Agent cần quyết định ngay stack là Client-side Only (React).
Nó phải giải thích cho user: *"Để không cần server mà vẫn lưu được dữ liệu, tôi sẽ dùng bộ nhớ trình duyệt của bạn (LocalStorage)."*
Sau đó code chức năng Flashcard với hiệu ứng CSS flip card (ưu tiên cái này vì user nói "nếu làm được thì tốt" - Agent giỏi sẽ cố gắng làm cái tốt nhất). |

---

### Cách "Chấm điểm" Agent của bạn trong 2 trường hợp này:

**Với "The Micromanager" (Phase 5):**

- **Fail:** Nếu agent tự ý đổi màu `#F59E0B` sang `orange` hoặc `yellow` cho tiện. Hoặc tự ý đổi text "Tương lai của AI" thành "Welcome to Tech Summit".
- **Pass:** Code hiển thị chính xác pixel-perfect (về mặt nội dung/màu sắc) so với yêu cầu.

**Với "The Storyteller" (Phase 6):**

- **Fail:** Nếu agent trả lời theo kiểu cũng lang man theo: *"Chào bạn, tôi rất tiếc khi nghe chuyện vợ bạn cằn nhằn..."* (Quá tập trung vào chi tiết thừa). Hoặc Agent bỏ sót yêu cầu "Màu xanh lá" (vẫn làm màu đỏ mặc định của Pomodoro).
- **Pass:** Agent tóm tắt lại yêu cầu gãy gọn (Bulleted list requirements) xác nhận lại với người dùng trước khi code, và chọn đúng giải pháp kỹ thuật (như LocalStorage cho prompt 14).

[history](https://www.notion.so/history-2d5926f31a4d8047bc96e326d980b21e?pvs=21)