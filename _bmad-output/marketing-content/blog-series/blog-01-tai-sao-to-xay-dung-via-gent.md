---
title: "Tại sao tôi xây dựng Via-gent? - Hành trình tạo Browser-Based IDE với AI Agent Capabilities"
date: 2025-12-24
tags: ["AI IDE", "WebContainers", "React", "TypeScript", "Vietnam Developer", "Startup Story"]
author: "Via-gent Team"
series: "Hành Trình Xây Dựng Via-gent"
series_number: 1
---

# Tại sao tôi xây dựng Via-gent?

**English Abstract**: This article introduces Via-gent, a browser-based IDE with AI agent capabilities built in Vietnam. It explores the problems with current AI-assisted development tools, the vision behind Via-gent, and why Vietnam needs such a solution. The article discusses privacy concerns, cost issues, and the goal of creating a privacy-first, cost-effective development environment for Vietnamese developers.

---

## Vấn đề hiện tại với AI-Assisted Development

Trong kỷ nguyên AI, việc phát triển phần mềm đã thay đổi đáng kể. Các công cụ AI như GitHub Copilot, Cursor, và Replit đã trở thành một phần không thể thiếu của workflow của nhiều developers. Tuy nhiên, tôi nhận thấy một số vấn đề lớn khi sử dụng các công cụ này:

### 1. Chi phí cao và Subscription Lock-in

Hầu hết các AI IDEs hiện nay đều hoạt động theo mô hình subscription:

- **Cursor**: $20/tháng cho Pro plan
- **GitHub Copilot**: $10/tháng
- **Replit Core**: $20/tháng

Với một freelancer hoặc startup nhỏ, việc trả hàng trăm USD mỗi năm cho các công cụ development là một gánh nặng lớn. Hơn nữa, bạn bị "lock-in" vào một provider duy nhất - không thể tự chọn AI model phù hợp nhất với nhu cầu của mình.

### 2. Privacy và Security Concerns

Khi sử dụng cloud-based IDEs, code của bạn được upload lên servers của bên thứ ba:

```
Your Code → Cloud Server → AI Processing → Response
```

Đối với các doanh nghiệp làm việc với sensitive data, đây là một rủi ro lớn. Code có thể chứa:
- API keys và secrets
- Business logic proprietary
- Customer data
- Intellectual property

Mặc dù nhiều công cụ cam kết không sử dụng code để train AI models, nhưng việc upload code lên server vẫn tạo ra một điểm yếu về security.

### 3. Khó setup và maintain Development Environment

Mỗi khi bạn chuyển sang một máy mới hoặc làm việc với một team mới, bạn phải:

1. Install Node.js, Python, hoặc các runtime khác
2. Configure IDE settings
3. Install extensions và plugins
4. Setup environment variables
5. Clone repositories và install dependencies

Quá trình này có thể mất hàng giờ, thậm chí cả ngày. Với remote work trend ngày càng phổ biến, việc có một consistent development environment trở nên quan trọng hơn bao giờ hết.

### 4. Hạn chế về Multi-Provider AI Support

Hầu hết các AI IDEs hiện nay chỉ hỗ trợ một hoặc ít AI providers:

- GitHub Copilot chỉ dùng OpenAI models
- Cursor chủ yếu dùng Claude và GPT-4
- Replit dùng proprietary models

Điều này hạn chế khả năng của developers trong việc:
- So sánh hiệu quả giữa các AI models
- Chọn model phù hợp nhất cho từng task
- Tối ưu chi phí bằng cách sử dụng các models rẻ hơn cho tasks đơn giản

---

## Vision của Via-gent

Via-gent được xây dựng với mục tiêu giải quyết tất cả các vấn đề trên:

### 1. Privacy-First Architecture

```
Local File System ←→ Browser ←→ WebContainer ←→ AI Provider
                    ↑
                Code never leaves your browser
```

Via-gent hoạt động 100% client-side:
- Code của bạn không bao giờ покид browser
- File system sync với local files qua File System Access API
- AI requests được gửi trực tiếp từ browser đến AI provider
- Không có server trung gian lưu trữ code của bạn

### 2. Bring Your Own AI Credentials

Via-gent hỗ trợ multi-provider AI:
- OpenRouter (access to 100+ AI models)
- Anthropic (Claude)
- OpenAI (GPT-4, GPT-3.5)
- Google (Gemini)
- Và nhiều providers khác

Bạn có thể:
- Tự chọn AI provider phù hợp nhất
- Sử dụng API keys của chính mình
- Tối ưu chi phí bằng cách chọn models rẻ hơn cho tasks đơn giản
- Chuyển đổi giữa providers một cách dễ dàng

### 3. Browser-Based với WebContainers

Via-gent sử dụng WebContainers API để chạy Node.js trực tiếp trong browser:

```typescript
import { WebContainer } from '@webcontainer/api';

const webcontainer = await WebContainer.boot();
await webcontainer.mount(files);
const installProcess = await webcontainer.spawn('npm', ['install']);
```

Điều này mang lại:
- **No installation required**: Chỉ cần mở browser và bắt đầu code
- **Consistent environment**: Mọi người dùng có cùng environment
- **Fast setup**: 3-5 seconds để boot WebContainer
- **Isolated sandbox**: Code chạy trong sandbox an toàn

### 4. Vietnamese-Native Experience

Via-gent được xây dựng bởi developers Việt Nam, cho developers Việt Nam:

- Full Vietnamese language support
- AI conversations có thể diễn ra bằng tiếng Việt
- Documentation và tutorials bằng tiếng Việt
- Community support trong tiếng Việt

---

## Tại sao Việt Nam cần Via-gent?

### 1. Growing Developer Community

Việt Nam có khoảng 500,000 developers và con số này đang tăng nhanh. Với sự phát triển của startup ecosystem và remote work trend, nhu cầu về công cụ development chất lượng cao ngày càng lớn.

### 2. Cost Sensitivity

Nhiều developers và startups ở Việt Nam có ngân sách hạn hẹp. Một IDE miễn phí với "bring your own AI" model có thể giúp tiết kiệm hàng trăm USD mỗi năm.

### 3. Privacy Concerns

Các doanh nghiệp Việt Nam ngày càng quan tâm đến security và data privacy. Một privacy-first IDE có thể giúp họ yên tâm hơn khi làm việc với sensitive code.

### 4. Education Needs

Với khoảng 150,000 sinh viên CNTT mỗi năm, nhu cầu về công cụ teaching và learning là rất lớn. Via-gent có thể giúp:
- Giảng viên setup môi trường learning consistency
- Sinh viên tập trung vào coding thay vì setup environment
- AI assistance giúp học nhanh hơn

---

## Target Audience của Via-gent

### 1. Individual Developers

**Pain Points**:
- Chi phí AI tools cao
- Khó setup environment trên nhiều machines
- Lo ngại về privacy

**Solutions**:
- Free IDE với bring your own AI
- Browser-based, no installation
- Privacy-first architecture

### 2. Startups và SMEs

**Pain Points**:
- Chi phí licensing cho team lớn
- Security concerns với cloud-based IDEs
- Need for onboarding tools

**Solutions**:
- Cost-effective với bring your own AI
- Privacy-first với client-side only
- AI assistance giúp onboarding nhanh hơn

### 3. Educators

**Pain Points**:
- Khó setup môi trường cho sinh viên
- Sinh viên có skill levels khác nhau
- Budget hạn hẹp

**Solutions**:
- No setup required
- AI assistance giúp học nhanh hơn
- Free và open source

### 4. Enterprises

**Pain Points**:
- Security và compliance
- Chi phí licensing cao
- Need for consistent environment

**Solutions**:
- Privacy-first architecture
- Bring your own AI credentials
- Consistent browser-based environment

---

## Technical Stack của Via-gent

Via-gent được xây dựng với stack hiện đại:

```typescript
// Core Framework
React 19 + TypeScript + Vite + TanStack Router

// Editor
Monaco Editor (VS Code's editor)

// Terminal
xterm.js + WebContainers

// AI Integration
TanStack AI + Multi-provider support

// State Management
TanStack Store + IndexedDB

// Internationalization
i18next (English + Vietnamese)

// Styling
TailwindCSS + Radix UI
```

---

## Roadmap Ahead

### Phase 1: MVP (Current)
- ✅ WebContainers integration
- ✅ File System Access API sync
- ✅ Monaco Editor with tabs
- ✅ Terminal integration
- ✅ Multi-provider AI support
- ✅ Vietnamese language support

### Phase 2: Enhanced Features
- Git integration
- Collaboration features
- Advanced AI agent orchestration
- Performance optimization
- Mobile support

### Phase 3: Enterprise Features
- Team management
- SSO integration
- Advanced security features
- Custom AI model training
- Analytics và reporting

---

## Call to Action

Via-gent đang trong giai đoạn development và chúng tôi cần feedback từ community:

1. **Try the Demo**: Truy cập [via-gent.dev](https://via-gent.dev) để trải nghiệm
2. **Join the Community**: Tham gia Discord hoặc GitHub Discussions để chia sẻ feedback
3. **Contribute**: Via-gent là open source, chúng tôi welcome contributions
4. **Spread the Word**: Chia sẻ với friends và colleagues

---

## Key Takeaways

1. **AI-assisted development là tương lai**, nhưng current solutions có limitations về cost, privacy, và flexibility
2. **Via-gent giải quyết các vấn đề này** với privacy-first architecture, bring your own AI, và browser-based approach
3. **Việt Nam cần một IDE như thế này** để support growing developer community, reduce costs, và improve security
4. **Via-gent là open source và community-driven** - chúng tôi cần feedback và contributions từ bạn

---

## What's Next?

Trong bài tiếp theo, tôi sẽ đi sâu vào **architecture của Via-gent**, cụ thể là:
- WebContainers API và cách nó hoạt động
- File System Access API integration
- Bidirectional sync architecture
- Code examples và diagrams

Hãy theo dõi series này để hiểu rõ hơn về cách Via-gent được xây dựng!

---

## Suggested Social Media Posts

### LinkedIn
```
Tại sao tôi xây dựng Via-gent? 🚀

AI-assisted development đang thay đổi cách chúng ta code, nhưng current solutions có limitations:
❌ Chi phí cao ($10-20/tháng)
❌ Privacy concerns (code upload lên cloud)
❌ Subscription lock-in
❌ Khó setup environment

Via-gent giải quyết các vấn đề này với:
✅ Privacy-first (code không покид browser)
✅ Bring your own AI credentials
✅ Browser-based với WebContainers
✅ Vietnamese-native support

Đọc full article tại: [link]

#ViaGent #AICode #WebContainers #React #TypeScript #VietnamDeveloper
```

### Facebook
```
Bạn có bao giờ cảm thấy mệt mỏi với chi phí AI tools? 😫

GitHub Copilot: $10/tháng
Cursor: $20/tháng
Replit: $20/tháng

Tổng cộng: $240-480/năm chỉ cho AI tools! 💸

Via-gent là browser-based IDE với:
- Free và open source
- Bring your own AI credentials
- Privacy-first architecture
- Vietnamese language support

Đọc bài đầu tiên trong series "Hành trình xây dựng Via-gent" tại: [link]

#ViaGent #AICode #DeveloperTools #VietnamTech
```

### Twitter/X
```
Tại sao tôi xây dựng Via-gent? 🤔

Current AI IDEs:
❌ Expensive subscriptions
❌ Privacy concerns
❌ Provider lock-in
❌ Complex setup

Via-gent:
✅ Free & open source
✅ Privacy-first
✅ Multi-provider AI
✅ Browser-based

Read the full story: [link]

#ViaGent #AICode #WebContainers #VietnamDev
```

---

## Resources

- **GitHub**: [github.com/yourusername/via-gent](https://github.com/yourusername/via-gent)
- **Live Demo**: [via-gent.dev](https://via-gent.dev)
- **Documentation**: [docs.via-gent.dev](https://docs.via-gent.dev)
- **Discord**: [discord.gg/viagent](https://discord.gg/viagent)

---

*Đây là bài đầu tiên trong series "Hành Trình Xây Dựng Via-gent". Hãy theo dõi để không bỏ lỡ các bài tiếp theo!*