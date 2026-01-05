# Tài liệu src/lib

## Tổng quan

Thư mục `src/lib/` chứa lớp thư viện cốt lõi của IDE Via-gent, cung cấp hạ tầng cho tác nhân AI (agent), hệ thống tệp, pipeline RAG và quản lý trạng thái. Tài liệu này cung cấp tham chiếu toàn diện cho các nhà phát triển làm việc với các module này.

## Cấu trúc thư mục

```
src/lib/
├── agent/          # Hạ tầng AI Agent (81 file)
├── audio/          # Xử lý âm thanh
├── canvas/         # Hiển thị canvas
├── chat/           # Tiện ích chat
├── editor/         # Tiện ích editor
├── events/         # Hệ thống sự kiện (10 file)
├── filesync/       # Dịch vụ đồng bộ tệp (15 file)
├── filesystem/     # Hệ thống tệp & đồng bộ (45 file)
├── hooks/          # React hooks dùng chung
├── ide/            # Tiện ích IDE
├── init/           # Khởi tạo
├── knowledge/      # Tổng hợp kiến thức (48 file)
├── mocks/          # Tiện ích mock
├── monitoring/     # Giám sát
├── notes/          # Quản lý ghi chú (18 file)
├── pdf/            # Xử lý PDF
├── persistence/    # Lớp persistence
├── rag/            # Pipeline RAG (32 file)
├── state/          # Quản lý trạng thái (34 file)
├── study/          # Spaced repetition
├── sync/           # Tiện ích đồng bộ (8 file)
├── utils/          # Tiện ích (9 file)
├── validation/     # Validation
├── webcontainer/   # WebContainer (9 file)
└── workspace/      # Quản lý workspace (16 file)
```

## Các subsystem chính

### Hệ thống Agent (`agent/`)

Hạ tầng AI Agent cung cấp tích hợp LLM, thực thi công cụ và quản lý vòng đời agent.

**Tính năng chính:**
- Định nghĩa công cụ TanStack AI
- Nhiều nhà cung cấp LLM (Anthropic, OpenRouter)
- Lưu trữ thông tin xác thực an toàn (AES-256-GCM)
- Quyền công cụ theo workspace
- Bộ nhớ hội thoại và suy nghĩ sâu

**File chính:**
- `factory.ts` - Factory công cụ
- `providers/credential-vault.ts` - Lưu trữ API key mã hóa
- `facades/` - Lớp trừu tượng công cụ
- `tools/` - Công cụ TanStack AI

### Hệ thống tệp (`filesystem/`)

Wrapper File System Access API và đồng bộ hai chiều với WebContainers.

**Tính năng chính:**
- Adapter FS cục bộ cho trình duyệt
- Bảo vệ path traversal
- Quản lý vòng đời quyền
- Sync manager cho đồng bộ WebContainer
- Hỗ trợ transaction cho thao tác atomic

**File chính:**
- `local-fs-adapter.ts` - Wrapper FSA API
- `sync-manager/` - Điều phối đồng bộ
- `path-guard.ts` - Xác thực bảo mật
- `permission-lifecycle.ts` - Quản lý quyền

### WebContainer (`webcontainer/`)

Quản lý vòng đời WebContainer đơn để chạy Node.js trong trình duyệt.

**Tính năng chính:**
- Pattern boot singleton
- Mount tệp
- Spawn process
- Terminal adapter
- Khôi phục crash

**File chánh:**
- `manager.ts` - Singleton manager
- `terminal-adapter.ts` - Thao tác shell
- `process-manager.ts` - Theo dõi process

### Pipeline RAG (`rag/`)

Retrieval-Augmented Generation với tìm kiếm vector Orama.

**Tính năng chính:**
- Quản lý index Orama
- Phân đoạn tài liệu
- Tạo embedding
- Tìm kiếm lai (vector + keyword)
- Tối ưu hóa và caching query

**File chính:**
- `orama-index.ts` - Tìm kiếm vector
- `hybrid-retriever.ts` - Tìm kiếm
- `document-chunker.ts` - Phân đoạn
- `embedding-service.ts` - Embeddings

### Module Kiến thức (`knowledge/`)

Tổng hợp và quản lý kiến thức (Module KSI).

**Tính năng chính:**
- Import nguồn (PDF, URL, text)
- Tổng hợp kiến thức
- Đồ thị kiến thức
- Phân loại chủ đề

**File chánh:**
- `synthesis-service.ts` - Tổng hợp AI
- `knowledge-graph.ts` - Quản lý đồ thị
- `source-import.ts` - Pipeline import
- `organization-engine.ts` - Tổ chức

### Hệ thống sự kiện (`events/`)

Hệ thống sự kiện cho giao tiếp cross-workspace.

**Tính năng chính:**
- Cross-workspace event bus
- Sự kiện store
- Sự kiện workspace
- React hooks cho đăng ký sự kiện

**File chính:**
- `cross-workspace-event-bus.ts` - Event bus toàn cục
- `workspace-events.ts` - Sự kiện workspace
- `use-cross-workspace-events.ts` - React hook

### Quản lý trạng thái (`state/`)

Zustand stores với persistence Dexie.

**Tính năng chính:**
- Quản lý trạng thái reactive
- Persistence IndexedDB
- Knowledge store với slices
- Tool permission store

**File chính:**
- `ide-store.ts` - Trạng thái IDE
- `tool-permission-store.ts` - Quyền
- `knowledge/` - Knowledge store
- `dexie-db.ts` - Database facade

## Mẫu kiến trúc

1. **Facade Pattern** - Giao diện sạch cho các subsystem phức tạp
2. **Singleton Pattern** - Instance đơn (WebContainer, credential vault)
3. **Store Pattern (Zustand)** - Quản lý trạng thái reactive
4. **Event Emitter Pattern** - Pub/sub cho coupling lỏng
5. **Factory Pattern** - Tạo object với cấu hình
6. **Repository Pattern** - Trừu tượng hóa truy cập dữ liệu

## Bảo mật

### Lưu trữ thông tin xác thực
- Mã hóa AES-256-GCM
- PBKDF2 key derivation (100,000 iterations)
- Obfuscated localStorage keys

### Hệ thống tệp
- Bảo vệ path traversal
- Vòng đời quyền
- Exclusion patterns (.git, node_modules)

### Thực thi công cụ
- Command sanitization
- Kiểm tra quyền workspace
- Trust levels (auto/prompt/block)

## Persistence

| Storage | Sử dụng | Vị trí |
|---------|---------|--------|
| IndexedDB | Structured data | state/dexie-db.ts |
| LocalStorage | Settings, handles | agent/providers/ |
| File System Access | User files | filesystem/local-fs-adapter.ts |

## Trạng thái di chuyển

### Modules Deprecated

| Đường dẫn cũ | Đường dẫn mới | Hành động |
|--------------|---------------|-----------|
| `lib/state/dexie-db.ts` | `infrastructure/persistence/dexie-db` | Sử dụng facade |
| `lib/filesync.ts` | `infrastructure/sync/workspace-services` | Sử dụng facade |

## File tài liệu

Thư mục này chứa:
- `scan-inventory.json` - Dữ liệu scan có cấu trúc
- `file-structure.txt` - Cây thư mục hoàn chỉnh
- `agent-system.md` - Tài liệu hệ thống agent
- `filesystem.md` - Tài liệu hệ thống tệp
- `webcontainer.md` - Tài liệu WebContainer
- `architecture.md` - Mẫu kiến trúc
- `dependencies.md` - Bản đồ dependencies
- `README.md` - File này (tiếng Anh)
- `README-VI.md` - Bản dịch tiếng Việt

## Bắt đầu nhanh

### Sử dụng File System

```typescript
import { LocalFSAdapter, localFS } from '@/lib/filesystem';

const adapter = new LocalFSAdapter();
await adapter.requestDirectoryAccess();
const content = await adapter.readFile('src/App.tsx');
```

### Sử dụng WebContainer

```typescript
import { boot, mount, spawn } from '@/lib/webcontainer';

await boot();
await mount({ 'index.js': { file: { contents: 'console.log("hi")' } } });
const process = await spawn('node', ['index.js']);
```

### Sử dụng Agent Tools

```typescript
import { createAgentClientTools } from '@/lib/agent/factory';

const tools = createAgentClientTools({
    getFileTools: () => fileToolsFacade,
    getTerminalTools: () => terminalToolsFacade,
});
```

### Sử dụng Events

```typescript
import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';

crossWorkspaceEventBus.onFileChange((event) => {
    console.log('File changed:', event.filePath);
});
```

## Hướng dẫn nhà phát triển

### Giới hạn file
| Loại | Tối đa dòng |
|------|-------------|
| Slice file | 120 |
| Store file | 300 |
| Component | 300 |
| Hook | 150 |
| Helper | 120 |

### Thứ tự import
1. React imports
2. Third-party libraries
3. Internal modules (@/)
4. Relative imports

### Test Coverage
- Mục tiêu: 80%
- Hiện tại: 40-60%

## Vấn đề đã biết

1. **Lỗi TypeScript trong file test**: Một số file test có lỗi type (đã loại trừ khỏi production checks)
2. **God Stores**: Một số store vượt quá 300 dòng (đang refactoring)
3. **Duplicate State**: `IDELayout.tsx` duplicate IDE state

## Tài liệu liên quan

- Kiến trúc nền tảng: `_bmad-output/architecture/platform-architecture-definitive-2026-01-04.md`
- ADR-024 State Management: `_bmad-output/project-planning-artifacts/adr-state-consolidation-2026-01-04.md`
- CLAUDE.md: Hướng dẫn toàn dự án
