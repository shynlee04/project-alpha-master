# Tài liệu Domain Core

## Tổng quan

Thư mục `src/core` chứa **Domain Layer** của ứng dụng, tuân theo nguyên tắc Clean Architecture. Nó định nghĩa các entity nghiệp vụ thuần túy không có bất kỳ phụ thuộc framework nào.

## Tham khảo Nhanh

| Mục | Giá trị |
|-----|---------|
| **Files** | 5 |
| **Dòng Code** | 396 |
| **Entities** | 4 |
| **Interfaces** | 22 |
| **Types** | 10 |
| **Domain Services** | 0 (CẦN LÀM) |
| **Value Objects** | 0 (CẦN LÀM) |

## Cấu trúc Thư mục

```
src/core/
├── index.ts              # Export barrel (16 dòng)
├── entities/             # Domain entities (380 dòng)
│   ├── Agent.ts          # Cấu hình Agent
│   ├── Provider.ts       # Cấu hình LLM Provider
│   ├── Conversation.ts   # Entity cuộc trò chuyện
│   └── Tool.ts           # Entity công cụ
├── rules/                # Domain services (TRỐNG)
└── value-objects/        # Value objects (TRỐNG)
```

## Entities

### Agent (`src/core/entities/Agent.ts`)

Entity nghiệp vụ chính đại diện cho AI agents.

**Thuộc tính chính:**
- `id`, `name`, `description` - Danh tính cốt lõi
- `providerId`, `modelId` - Liên kết Provider (QUAN TRỌNG)
- `systemPrompt`, `temperature`, `maxTokens` - Tham số LLM
- `tools` - Bindings công cụ với quyền theo workspace
- `workspaceBindings` - Nơi agent khả dụng
- `status` - Trạng thái agent (online/offline/busy/error)
- `metrics` - tasksCompleted, successRate, tokensUsed

**Quy tắc nghiệp vụ:**
- Phải có `providerId` và `modelId` hợp lệ
- Chuyển trạng thái: offline → online → busy → error
- Công cụ yêu cầu quyền workspace

### LLMProvider (`src/core/entities/Provider.ts`)

Cấu hình AI service provider (nguồn sự thật duy nhất).

**Thuộc tính chính:**
- `id`, `name`, `providerType` - Danh tính
- `baseUrl` - API endpoint
- `isHardcoded` - Cờ provider built-in
- `hasApiKey` - Chỉ báo credential vault
- `models` - Models khả dụng
- `capabilities` - streaming, functionCalling, vision, embeddings

**Quy tắc nghiệp vụ:**
- API key được lưu trong credential-vault.ts mã hóa
- Providers built-in có URLs chỉ đọc

### Conversation (`src/core/entities/Conversation.ts`)

Phiên trò chuyện với sự tham gia của agent.

**Thuộc tính chính:**
- `id`, `workspaceType`, `threadId` - Danh tính cốt lõi
- `agentId` - Agent tham gia
- `messages` - Lịch sử tin nhắn
- `context` - Ngân sách token, tóm tắt, tài nguyên đính kèm
- `metadata` - title, tags, pinned, scrollPosition

**Loại Tin nhắn:**
- `text` - Nội dung văn bản thuần túy
- `code` - Code với chỉ định ngôn ngữ
- `image` - Ảnh với MIME type
- `file` - File đính kèm

### Tool (`src/core/entities/Tool.ts`)

Định nghĩa khả năng của agent.

**Thuộc tính chính:**
- `id`, `name`, `description`, `category` - Danh tính
- `requiresAuth` - Yêu cầu xác thực
- `supportedWorkspaces` - Tính khả dụng theo workspace
- `configSchema` - Tùy chọn cấu hình
- `isEnabled` - Cờ tính khả dụng

**Loại Công cụ:**
- `file-operations`, `terminal`, `web-search`
- `knowledge`, `rag`, `code-generation`, `testing`

## Loại Chung

### WorkspaceType

Được sử dụng bởi Agent, Conversation, và Tool entities.

```typescript
type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';
```

### Modality

Được sử dụng bởi ProviderModel cho hỗ trợ đa phương thức.

```typescript
type Modality = 'text' | 'image' | 'audio' | 'video' | 'code';
```

## Sử dụng

### Import Entities

```typescript
// Import từ barrel
import { Agent, LLMProvider, Conversation, Tool } from '@/core';

// Import entity cụ thể
import { Agent, AgentToolBinding, WorkspaceBinding } from '@/core/entities/Agent';

// Import types
import { WorkspaceType, ToolCategory } from '@/core/entities/Tool';
```

### Tạo Entities

```typescript
const agent: Agent = {
    id: 'agent-001',
    name: 'Trợ lý Lập trình',
    description: 'Hỗ trợ các tác vụ lập trình',
    providerId: 'anthropic',
    modelId: 'claude-sonnet-4-20250514',
    systemPrompt: 'Bạn là một trợ lý lập trình hữu ích.',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    tools: [],
    workspaceBindings: [{
        workspaceType: 'ide',
        isAvailable: true,
        uiVariant: 'full',
        isDefault: true
    }],
    status: 'online',
    tasksCompleted: 0,
    successRate: 0,
    tokensUsed: 0,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString()
};
```

## Kiến trúc

### Vị trí Layer

Thư mục `src/core` nằm ở layer trong cùng của Clean Architecture:

```
┌─────────────────────────────────────┐
│     Presentation Layer (UI)         │
├─────────────────────────────────────┤
│    Application Layer (Services)     │
├─────────────────────────────────────┤
│       Domain Layer (src/core)       │  ← Chúng ta ở đây
├─────────────────────────────────────┤
│  Infrastructure Layer (Persistence) │
└─────────────────────────────────────┘
```

### Nguyên tắc Chính

1. **TypeScript Thuần túy** - Không phụ thuộc framework
2. **Không Import Bên ngoài** - Zero external dependencies
3. **Interface Contracts** - Chỉ TypeScript interfaces
4. **Single Source of Truth** - Domain entities define the API

## Vấn đề Được Biết

| Vấn đề | Mức độ | Mô tả |
|--------|--------|-------|
| Thư mục rules trống | Trung bình | Chưa có domain services |
| Value-objects trống | Trung bình | Chưa có validation ở domain |
| Trùng lặp WorkspaceType | Thấp | Định nghĩa trong Agent.ts và Tool.ts |
| Tool chưa export | Thấp | Thiếu barrel export |

## Khuyến nghị

### Ngay lập tức

1. Thêm Tool export vào barrel (`src/core/index.ts`)
2. Tạo file types chung cho WorkspaceType

### Ngắn hạn

1. Implement domain services trong `src/core/rules/`
2. Thêm value objects trong `src/core/value-objects/`
3. Thêm factory functions cho việc tạo entities

### Dài hạn

1. Implement domain events cho state changes
2. Thêm validation ở domain level
3. Cân nhắc entities dạng class với methods

## Tài liệu Liên quan

- [Tài liệu Entities](entities.md) - Chi tiết về entities
- [Domain Services](domain-services.md) - Khuyến nghị services
- [Kiến trúc](architecture.md) - Patterns kiến trúc

## Ghi chú Nhà phát triển

- Domain layer ổn định và hiếm khi thay đổi
- Thay đổi cần cân nhắc kỹ
- Domain entities là API contract
- Luôn validate ở domain level
- Sử dụng domain services cho business logic
