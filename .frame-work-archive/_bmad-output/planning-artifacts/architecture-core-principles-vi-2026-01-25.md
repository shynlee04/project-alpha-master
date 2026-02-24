---
title: "Sự Thật Cốt Lõi Mới - Nguyên Tắc Kiến Trúc Dự Án"
version: "2.0.0-vi"
status: "ACTIVE"
created: "2026-01-25"
last_updated: "2026-01-25"
author: "Architect Agent - Vietnamese Translation & Commentary"
translator: "Architect Agent"

related_adrs:
  - "ADR-034: Kiến trúc Hướng Dự Án với Plugin Tính Năng"
  - "ADR-034-AMENDMENT-001: Platform-First Plugin Selection"
  - "ADR-034-CRISIS: Notes Routing & Persistence Crisis"

phase_status:
  epics:
    - id: "EPIC-ARCH-01"
      name: "Nền Tảng"
      status: "COMPLETE"
      completed: "2026-01-20"
    - id: "EPIC-ARCH-02"
      name: "Plugin Tính Năng"
      status: "COMPLETE"
      completed: "2026-01-21"
    - id: "EPIC-ARCH-03"
      name: "Hệ Thống Layout & UX"
      status: "IN_PROGRESS"
    - id: "EPIC-ARCH-04"
      name: "Dọn Dẹp & Di Chuyển"
      status: "PENDING"

toc_level: 3
reading_time: "15-20 phút"
difficulty: "Trung cấp"
target_audience: "Developers, Product Managers, UX Designers"
---

# 🏛️ Sự Thật Cốt Lõi Mới: Nguyên Tắc Kiến Trúc Hướng Dự Án

> **Tài liệu này là gì?** Đây là bản hướng dẫn chi tiết về kiến trúc cốt lõi của dự án, được viết lại bằng tiếng Việt dễ hiểu kèm theo phân tích từ các tài liệu ADR quan trọng. Phù hợp cho mục đích giáo dục và chia sẻ trên mạng xã hội.

---

## 📋 Mục Lục

1. [🌟 Tại Sao Tài Liệu Này Quan Trọng?](#1-tại-sao-tài-liệu-này-quan-trọng)
2. [🏗️ Kiến Trúc Hướng Dự Án là gì?](#2-kiến-trúc-hướng-dự-án-là-gì)
3. [📱 Phân Biệt Thiết Bị: Desktop vs Mobile](#3-phân-biệt-thiết-bị-desktop-vs-mobile)
4. [🔌 Hệ Thống Plugin Tính Năng](#4-hệ-thống-plugin-tính-năng)
5. [🔐 Vault BYOK - Quản Lý API Keys](#5-vault-byok---quản-lý-api-keys)
6. [🤖 Kiến Trúc Agent và Tool](#6-kiến-trúc-agent-và-tool)
7. [💬 Chat Cascade và Quản Lý Thread](#7-chat-cascade-và-quản-lý-thread)
8. [🎯 Checklist Triển Khai](#8-checklist-triển-khai)
9. [📚 Tài Liệu Tham Khảo](#9-tài-liệu-tham-khảo)

---

## 1. 🌟 Tại Sao Tài Liệu Này Quan Trọng?

### Câu Chuyện Nền Tảng

Trước khi đi vào chi tiết kỹ thuật, hãy hiểu **tại sao kiến trúc này được tạo ra**.

> 📖 **Bối cảnh lịch sử (từ ADR-034 Crisis Investigation):**
> 
> Vào ngày 2026-01-19, một cuộc điều tra toàn diện đã phát hiện rằng **5 lần "sửa lỗi" trước đó đều thất bại** vì chúng chỉ chữa triệu chứng, không chữa tận gốc rễ. Ứng dụng Notes hoàn toàn không hoạt động cho người dùng Desktop với các vấn đề:
> - Hiển thị vòng xoay vô tận (infinite spinner)
> - Lỗi "unable to read properties..." khi mount thư mục FSA
> - Tự động chuyển hướng sang IDE thay vì Notes
> - Không thể truy cập workspace Notes

### Những Nguyên Nhân Gốc Rễ Được Phát Hiện

| Vấn Đề | Tác Động |
|--------|----------|
| **9 điểm vào ứng dụng** | Mỗi route có logic độc lập → hành vi không nhất quán |
| **7 đường dẫn tạo dự án** | Wizard, Hub cards, IDE folder picker → trùng lặp dự án |
| **2 con trỏ dự án** | Bảng `projects` + bảng `fsaHandles` → mất đồng bộ |
| **Mô hình Workspace-Centric** | State/thành phần trùng lặp cho mỗi workspace |
| **Nhầm lẫn Device Model** | FSA + IndexedDB không có ranh giới rõ ràng |
| **15+ UI elements đã bỏ** | Knowledge/Study routes tồn tại nhưng chỉ redirect |

### 💡 Bài Học Quan Trọng

```
❌ KHÔNG THỂ: Tiếp tục " vá" từng lỗi một
✅ CẦN THIẾT: Thay đổi kiến trúc từ gốc rễ

"5 lần sửa lỗi đều thất bại - architectural debt quá sâu"
                                 — ADR-034 Investigation Report
```

---

## 2. 🏗️ Kiến Trúc Hướng Dự Án là gì?

### 2.1 So Sánh: TRƯỚC vs SAU

| Khía Cạnh | TRƯỚC (Workspace-Centric) | SAU (Project-Centric) |
|-----------|---------------------------|------------------------|
| **Cấu trúc Route** | `/ide/$projectId` → `/notes/$projectId` | Chỉ một route `/$projectId` |
| **Quản Lý State** | Trùng lặp cho mỗi workspace | Một nguồn sự thật duy nhất |
| **Rendering Feature** | Workspace quyết định features | Platform quyết định plugins có sẵn |
| **UX** | User chọn "workspace mode" | Platform hiển thị tools có sẵn |

### 2.2 Mental Model Đơn Giản Hóa

```
🔄 MÔ HÌNH CŨ (Workspace-Centric) - PHỨC TẠP
┌─────────────────────────────────────────────────────┐
│  User → Chọn Workspace (IDE/Notes/Knowledge/Study)  │
│         ↓                                           │
│  Workspace quyết định features có sẵn               │
│         ↓                                           │
│  Mỗi Workspace có logic riêng → DƯ THỪA            │
└─────────────────────────────────────────────────────┘

✅ MÔ HÌNH MỚI (Project-Centric) - ĐƠN GIẢN
┌─────────────────────────────────────────────────────┐
│  User → Chọn Project                                 │
│         ↓                                           │
│  Platform (Desktop/Mobile) quyết định plugins        │
│         ↓                                           │
│  Single source of truth → KHÔNG TRÙNG LẶP           │
└─────────────────────────────────────────────────────┘
```

### 2.3 Route Structure Mới

Ứng dụng bây giờ chỉ có **đúng 2 routes**:

```
┌─────────────────────────────────────────────────────────────┐
│  /hub                      # Quản lý dự án, chưa load       │
│                                                             │
│  /$projectId               # Dự án đã load + feature plugins│
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Project ID - Không Phải Workspace ID!

**Project ID KHÔNG PHẢI:**
- Prefix/suffix theo workspace cụ thể
- Gắn với một plugin hay feature nào đó
- Thay đổi dựa trên loại thiết bị

**Project ID LÀ:**
- Định danh duy nhất cho toàn bộ dự án
- Nhất quán qua tất cả plugins trong dự án
- Anchor cho threads, RAG indices, và settings cấp dự án

---

## 3. 📱 Phân Biệt Thiết Bị: Desktop vs Mobile

### 3.1 Desktop (FSA - File System Access API)

**Đặc điểm:**
- ✅ File thật trên đĩa qua native file system
- ✅ Sync 2 chiều với external editors
- ✅ Đầy đủ IDE capabilities (Monaco, Terminal)
- ✅ Handle persistence trong IndexedDB (không phải file system)

**Yêu cầu:**
- Chrome 122+ cho persistent permissions
- FileSystemObserver (Chrome 129+) cho file watching với polling fallback

### 3.2 Mobile/Tablet (IndexedDB via Dexie.js)

**Đặc điểm:**
- 📱 Virtual files trong browser database
- 📱 Không cần external editor sync
- 📱 IDE features bị chặn (Monaco, Terminal không có sẵn)
- 📱 Single source of truth (không sync conflicts)

### 3.3 So Sánh Chi Tiết

| Khía Cạnh | Desktop (FSA) | Mobile (IndexedDB) |
|-----------|---------------|-------------------|
| **Tạo Dự Án** | Folder picker → FSA handle | Browser project → Dexie |
| **Lưu Trữ** | File thật trên đĩa | Virtual files trong IndexedDB |
| **IDE Access** | Đầy đủ Monaco + Terminal | Chặn - Notes only |
| **Persistence** | Handle trong IndexedDB | Files trong IndexedDB |
| **Sync** | 2 chiều (external editors) | Single source |

### 3.4 Chính Sách Truy Cập IDE

| Platform | IDE Access | Behavior |
|----------|-----------|----------|
| **Desktop (FSA)** | ✅ Full | Monaco + Terminal + FileTree |
| **Desktop (IndexedDB)** | ⚠️ Limited | FileTree + Notes only |
| **Tablet** | ❌ Blocked | Notes + Chat only |
| **Mobile** | ❌ Blocked | Notes + Chat only |

---

## 4. 🔌 Hệ Thống Plugin Tính Năng

### 4.1 FeaturePlugin Interface

Mỗi feature trở thành một plugin tự trị:

```typescript
interface FeaturePlugin {
  // Định danh
  id: 'filetree' | 'monaco' | 'notes' | 'terminal' | 'chat' | 'agents';
  name: string;
  icon: React.ReactNode;
  
  // Rendering
  component: React.FC<FeaturePluginProps>;
  sidebarComponent?: React.FC<SidebarPluginProps>;
  
  // Yêu Cầu Platform
  requiresFSA: boolean;           // Cần desktop FSA
  requiresProject: boolean;       // Cần dự án được load
  minWidth: number;               // Minimum layout width (pixels)
  maxInstances: 1 | 2 | 'unlimited';
  
  // State Management
  usePluginStore: () => PluginState;
}
```

### 4.2 Các Loại Plugin

| Loại | Mô Tả | Ví Dụ |
|------|-------|-------|
| **Always-Loaded** | Bắt buộc trong mọi session | Project Management, Chat Cascade |
| **Optional** | User chọn, tối đa 5 plugins | Monaco, Notes, Terminal |
| **Platform-Restricted** | Chỉ có trên platform nhất định | Terminal (desktop-only) |

### 4.3 Hai Plugins Bắt Buộc

#### Plugin 1: Project Management

**Trách nhiệm:**
- File tree navigation và display
- Project switcher
- Tạo/xóa dự án
- File/folder CRUD operations
- Database và RAG management

#### Plugin 2: Chat Cascade + Thread Management

**Trách nhiệm:**
- Agent orchestration và coordination
- Thread management (project-scoped)
- RAG context indexing
- Multi-format block rendering
- Streaming conversation display

### 4.4 Platform-Aware Default Plugins

Thay thế concept "IDE mode" vs "Notes mode" bằng **Platform-First Defaults**:

| Platform | Storage | Default Plugins | Ghi Chú |
|----------|---------|-----------------|---------|
| **Desktop (FSA)** | File System Access | `filetree`, `monaco`, `chat` | Full development experience |
| **Desktop (IndexedDB)** | Browser Database | `filetree`, `notes`, `chat` | Notes-focused, no real files |
| **Tablet** | Browser Database | `filetree`, `notes`, `chat` | Max 2 panels |
| **Mobile** | Browser Database | `notes` | Single panel, chat via sidebar |

### 4.5 Default Layout Modes by Platform

| Platform | Default Layout | Max Columns |
|----------|---------------|-------------|
| Mobile | 1-column | 1 |
| Tablet | 2-column | 2 |
| Desktop | 2-column | 3 |

---

## 5. 🔐 Vault BYOK - Quản Lý API Keys

### 5.1 Vault Architecture

BYOK Vault là hệ thống cấu hình **project-scoped** cho API keys. Tất cả LLM integrations phải đi qua TanStack AI SDK.

**Integration Points:**
- Route: `/$projectId` (không có route riêng `/setting`)
- Configuration lưu per project
- Keys được bảo mật và phân phối có điều kiện

### 5.2 Supported LLM Providers

#### Hỗ Trợ Cấp 1 (Đầy Đủ Features)

| Provider | Models Mới Nhất | Ghi Chú |
|----------|-----------------|---------|
| **Google Gemini** | 3.0 Pro / 3.0 Flash (Jan 2026) | First-tier, image preview variants |
| **OpenRouter** | 400+ models | OpenAI-compatible endpoints |
| **OpenAI** | GPT-5.1-Codex-Max (Nov 2025) | Standard OpenAI API |
| **Anthropic** | Claude Sonnet 4.5, Claude Opus 4.5 | Standard Claude API |

#### Hỗ Trợ Cấp 2 (Basic Integration)

| Provider | Ghi Chú |
|----------|---------|
| **Grok** | Basic completion only |
| **Ollama (Local)** | Local model serving |

### 5.3 Integration Guidelines

1. **TanStack AI SDK First**: Tất cả LLM calls phải dùng TanStack AI SDK
2. **No Direct Provider Calls**: Cấm gọi trực tiếp provider packages
3. **Fallback Chain**: Implement provider → model fallback với graceful degradation
4. **Secure Key Distribution**: Keys truyền reactively chỉ cho endpoints cần thiết

---

## 6. 🤖 Kiến Trúc Agent và Tool

### 6.1 Agent Orchestrator Pattern

Hệ thống agent tuân theo **hierarchical orchestrator pattern**:

```
User Input
    ↓
Orchestrator/Coordinator (chỉ tools read-only)
    ├─→ Mode Switching (sang domain-specific agent)
    └─→ Task Delegation (cho sub-agents với isolated context)
```

### 6.2 Các Loại Tool

| Loại | Thực Thi | Ví Dụ |
|------|----------|-------|
| **Client Tools** | Browser-only | File read, glob, grep |
| **Server Tools** | Server/Edge | LLM calls, database ops |
| **Agent Tools** | Delegated | Complex multi-step tasks |

### 6.3 Tool Permission Matrix

| Agent Type | write | edit | bash | task | Ghi Chú |
|------------|-------|------|------|------|---------|
| **real-world-validator** | true | false | browser | true | Testing only |
| **dev-ext** | true | true | limited | true | Implementation |
| **architect-ext** | false | design | false | true | Architecture docs |
| **analyst-ext** | false | false | false | true | Research only |
| **ux-designer-ext** | false | false | false | true | Design only |

### 6.4 Agentic Cycle

Tham khảo: [TanStack AI Agentic Cycle](https://tanstack.com/ai/latest/docs/guides/agentic-cycle)

**Các Patterns Chính:**
- Sequential tool execution với state
- Conditional branching dựa trên tool results
- Error handling với retry strategies
- Context management và compaction

---

## 7. 💬 Chat Cascade và Quản Lý Thread

### 7.1 Thread Architecture

Threads là conversation contexts **project-scoped**:

```
Project
    └─→ Threads (indexed by project ID)
        ├─→ Main Thread (user conversation)
        ├─→ Sub-threads (agent delegations)
        └─→ Compaction Threads (auto-generated at 90% context limit)
```

### 7.2 Context Management

**Context Window:**
- Default limit: 150K tokens
- Auto-compaction at 90% threshold (135K tokens)

**Compaction Process:**
1. Trigger khi context đạt 90%
2. Chạy sub-agent để condense conversation turns
3. Filter irrelevant/contextual information
4. Generate new thread với recapped context
5. Preserve file path references cho linking

### 7.3 Multi-Format Block Rendering

Chat interface render diverse content types:

| Content Type | Rendering | Notes |
|--------------|-----------|-------|
| Code blocks | Syntax highlighted, copyable | Monaco integration |
| Rich text | Tables, diagrams, markdown | Block-based rendering |
| HTML artifacts | Embedded components | Interactive content |
| Streaming tokens | Real-time display | Thinking/reasoning |
| Tool outputs | Collapsible, status-coded | Success/failure indicators |
| File references | Clickable paths | `@` mentions with context |

### 7.4 Bi-Directional References

**File-to-Chat References:**
- `@filename` - Include entire file
- `@folder/` - Include all child files
- Selected text in Monaco - Include as context

**Chat-to-File Operations:**
- Insert AI output as new file
- Insert at cursor position
- Copy to clipboard

---

## 8. 🎯 Checklist Triển Khai

### 8.1 Architecture Alignment

- [ ] Single route `/$projectId` implemented
- [ ] No workspace-specific routes or query params
- [ ] Platform detection working correctly
- [ ] Platform-aware default plugins configured
- [ ] FeaturePlugin interface defined and implemented

### 8.2 Plugin System

- [ ] Two always-loaded plugins functioning
- [ ] Plugin registry implemented
- [ ] Plugin layout system operational
- [ ] Maximum 5 plugins per project (2 always-loaded + 3 optional)
- [ ] Plugin CRUD permissions configured

### 8.3 BYOK Vault

- [ ] TanStack AI SDK integration complete
- [ ] Provider support: Gemini, OpenRouter, OpenAI, Anthropic
- [ ] Secure key storage implemented
- [ ] Fallback chain working
- [ ] No direct provider package calls

### 8.4 Agent System

- [ ] Orchestrator pattern implemented
- [ ] Domain-specific agents defined
- [ ] Tool permission matrix configured
- [ ] Agentic cycle following TanStack patterns
- [ ] Sub-agent delegation working

### 8.5 Thread Management

- [ ] Project-scoped threads implemented
- [ ] Context window limit (150K tokens)
- [ ] Auto-compaction at 90% threshold
- [ ] Multi-format block rendering
- [ ] Bi-directional file references

### 8.6 State and Persistence

- [ ] Zustand/Dexie boundaries clear
- [ ] Desktop FSA handling complete
- [ ] Mobile IndexedDB handling complete
- [ ] Event-driven sync working
- [ ] No state duplication

---

## 9. 📚 Tài Liệu Tham Khảo

### 9.1 TanStack AI Documentation

| Chủ Đề | URL |
|-------|-----|
| Tools Guide | https://tanstack.com/ai/latest/docs/guides/tools |
| Tool Architecture | https://tanstack.com/ai/latest/docs/guides/tool-architecture |
| Server Tools | https://tanstack.com/ai/latest/docs/guides/server-tools |
| Client Tools | https://tanstack.com/ai/latest/docs/guides/client-tools |
| Tool Approval | https://tanstack.com/ai/latest/docs/guides/tool-approval |
| Agentic Cycle | https://tanstack.com/ai/latest/docs/guides/agentic-cycle |
| Dev Tools | https://tanstack.com/ai/latest/docs/getting-started/devtools |
| Structured Outputs | https://tanstack.com/ai/latest/docs/guides/structured-outputs |
| Streaming | https://tanstack.com/ai/latest/docs/guides/streaming |
| Multimodal Content | https://tanstack.com/ai/latest/docs/guides/multimodal-content |
| Observability | https://tanstack.com/ai/latest/docs/guides/observability |

### 9.2 Related ADR Documents

| Document | Status | Mô Tả |
|----------|--------|-------|
| **ADR-034** | APPROVED | Kiến trúc Hướng Dự Án với Plugin Tính Năng |
| **ADR-034-AMENDMENT-001** | APPROVED | Platform-First Plugin Selection - loại bỏ "workspace mode" |
| **ADR-034-CRISIS** | RESOLVED | Notes Routing & Persistence Crisis Investigation |

---

## 📖 Phụ Lục: Thuật Ngữ

| Thuật Ngữ | Định Nghĩa |
|-----------|------------|
| **FSA** | File System Access API (Desktop) |
| **Platform** | Loại thiết bị (desktop, tablet, mobile) |
| **Plugin** | Module tính năng tự trị |
| **Project** | Single source of truth cho files/settings |
| **Thread** | Conversation context gắn với project |
| **RAG** | Retrieval-Augmented Generation |
| **BYOK** | Bring Your Own Key (API vault) |
| **Orchestrator** | Agent coordinator với read-only tools |

---

## 🎓 Bài Tập Ôn Tập

### Câu Hỏi 1
**Hỏi:** Sự khác biệt chính giữa Workspace-Centric và Project-Centric architecture là gì?

**Đáp:**
- Workspace-Centric: User chọn workspace (IDE/Notes) → Workspace quyết định features
- Project-Centric: User chọn project → Platform quyết định plugins có sẵn

### Câu Hỏi 2
**Hỏi:** Tại sao Mobile không thể truy cập Monaco Editor?

**Đáp:** Vì Monaco Editor yêu cầu FSA (File System Access API) mà Mobile không hỗ trợ. Thay vào đó, Mobile sử dụng Notes plugin.

### Câu Hỏi 3
**Hỏi:** Khi nào thread compaction được trigger?

**Đáp:** Khi context window đạt 90% (135K tokens trong giới hạn 150K tokens).

---

## 🙏 Lời Kết

Tài liệu này đã trình bày các nguyên tắc kiến trúc cốt lõi một cách dễ hiểu, kèm theo bối cảnh lịch sử và các tài liệu ADR liên quan. Việc hiểu rõ những nguyên tắc này sẽ giúp bạn:

1. ✅ Đưa ra quyết định kiến trúc đúng đắn
2. ✅ Tránh lặp lại những sai lầm của quá khứ
3. ✅ Xây dựng ứng dụng scalable và maintainable

> 🔗 **Tài liệu gốc tiếng Anh:** `_bmad-output/planning-artifacts/architecture.md`
> 
> 📅 **Cập nhật lần cuối:** 2026-01-25
> 
> 🏷️ **Phiên bản:** 2.0.0-vi

---

*Document generated for educational purposes. Related to ADR-034, ADR-034-AMENDMENT-001, and ongoing architecture remediation efforts.*
