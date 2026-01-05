# Tài liệu Miền Infrastructure (Hạ tầng)

## Tổng quan

Thư mục `src/infrastructure` chứa lớp hạ tầng cốt lõi của ứng dụng Via-Gent, cung cấp khả năng lưu trữ dữ liệu, xử lý sự kiện và đồng bộ hóa tệp.

## Cấu trúc Thư mục

```
src/infrastructure/
├── events/           # Hệ thống sự kiện cho giao tiếp giữa các store
├── persistence/      # Lớp lưu trữ IndexedDB
└── sync/             # Hệ thống đồng bộ hóa tệp
```

---

## Lớp Persistence (`persistence/`)

### Cơ sở dữ liệu

Lớp persistence sử dụng **Dexie.js** (wrapper IndexedDB) để lưu trữ dữ liệu offline-first.

**Tệp chính:**
- `dexie-db.ts` - Export database và hàm helper chính
- `dexie-db-class.ts` - Định nghĩa class ViaGentDatabase
- `dexie-db-migrations.ts` - Di chuyển schema (v1-v15)
- `dexie-storage.ts` - Adapter lưu trữ cho Zustand

**Schema Database (v15):**
- **Bảng Core**: projects, ideState, conversations, threads
- **Bảng AI**: taskContexts, toolExecutions, credentials, providerConfigs, agentConfigs, conversationState
- **Bảng Sync**: syncStatus, fileMetadata, toolExecutionLogs, fsaHandles, sessionSnapshots, fileSyncStatus
- **Bảng Knowledge**: sources, collections, oramaIndexes, embedding_models, notes

### Store Slices

Các slice store Zustand với persistence Dexie:

- `stores/agents/` - Cấu hình agent
- `stores/providers/` - Cấu hình LLM provider
- `stores/ide/` - Quản lý trạng thái IDE
- `stores/project/` - Quản lý project
- `stores/rag/` - Trạng thái pipeline RAG
- `stores/workspace/` - Context và chuyển đổi workspace
- `stores/permissions/` - Quản lý quyền tool
- `stores/filesystem/` - Quản lý file snapshot

### Hàm Helper

Các hàm helper database trong `dexie-db-helpers/`:

- Thao tác project (getRecentProjects, getIDEState)
- Thao tác sync status (getSyncStatus, setSyncStatus)
- Thao tác file metadata (upsertFileMetadata, bulkUpsertFileMetadata)
- Thao tác conversation thread (getThreadsForProject)
- Thao tác source và collection (getSourcesForProject, createCollection)

---

## Hệ thống Sự kiện (`events/`)

### Event Bus

Hệ thống sự kiện triển khai mẫu publish-subscribe cho giao tiếp giữa các store.

**Tệp chính:**
- `event-bus.ts` - Triển khai EventBus chính
- `cross-workspace-event-bus.ts` - Lan truyền sự kiện cross-workspace

### Loại Sự kiện

**Sự kiện Workspace:**
- WORKSPACE_TRANSITION_STARTED/COMPLETED
- WORKSPACE_CHANGED

**Sự kiện Agent:**
- AGENT_SELECTED, AGENT_CONFIG_UPDATED
- AGENT_CREATED, AGENT_DELETED

**Sự kiện Conversation:**
- CONVERSATION_CREATED, CONVERSATION_MESSAGE_ADDED

**Sự kiện Sync:**
- SYNC_STARTED, SYNC_COMPLETED, SYNC_PROGRESS

**Sự kiện RAG:**
- RAG_EMBEDDING_PROGRESS, RAG_CHUNKING_STATUS
- RAG_DATABASE_INDEXING, RAG_SOURCE_PROCESSING

**Sự kiện IDE ↔ Knowledge Bridge:**
- IDE_DEBUG_SESSION_CAPTURED
- IDE_REFACTOR_JOURNAL_CREATED
- KNOWLEDGE_SYNTHESIS_EXPORT_REQUESTED

---

## Hệ thống Sync (`sync/`)

### Kiến trúc

Hệ thống sync cung cấp đồng bộ hóa hai chiều giữa:
- **FSA (File System Access API)** - Hệ thống tệp cục bộ
- **IndexedDB** - Lưu trữ trình duyệt
- **WebContainer** - Môi trường Node.js trong trình duyệt

**Thành phần chính:**

**Adapters:**
- `adapters/fsa-adapter.ts` - Adapter File System Access API
- `adapters/idb-adapter.ts` - Adapter IndexedDB
- `adapters/base-adapter.ts` - Interface adapter cơ bản

**Core:**
- `core/sync-engine.ts` - Engine điều phối sync
- `core/sync-engine-core.ts` - Triển khai SyncEngine
- `core/file-watcher.ts` - Giám sát thay đổi tệp

**Strategies:**
- `strategies/bidirectional-sync.ts` - Đồng bộ hai chiều
- `strategies/conflict-resolution.ts` - Phát hiện và giải quyết xung đột

**Workspace Services:**
- `workspace-services/ide-file-sync-service.ts`
- `workspace-services/knowledge-file-sync-service.ts`
- `workspace-services/notes-file-sync-service.ts`
- `workspace-services/study-file-sync-service.ts`

---

## Cân nhắc Hiệu suất

### Thao tác Database

- **Bulk Operations**: Sử dụng `bulkPut()`, `bulkAdd()` cho nhiều bản ghi
- **Indexed Queries**: Tận dụng compound indexes cho truy vấn hiệu quả
- **Lazy Initialization**: Database mở khi truy cập lần đầu
- **Cleanup**: Dọn dẹp định kỳ sync status và logs cũ

### Hiệu suất Sync

- **Incremental Sync**: Chỉ sync các tệp thay đổi sử dụng bộ nhớ cache fileMetadata
- **Debounced Operations**: Batch các thao tác tệp với debounce có thể cấu hình
- **Concurrent Operations**: Hỗ trợ sync song song với giới hạn maxConcurrent
- **Quota Management**: Giám sát và quản lý hạn ngạch lưu trữ

---

## Tính năng Bảo mật

### Mã hóa Credential

- **AES-256-GCM** mã hóa cho API keys
- **PBKDF2** derivation key (100,000 iterations)
- Lưu trữ an toàn trong IndexedDB

### Quản lý Quyền

- Xử lý và lưu trữ quyền **FSA Permission**
- Theo dõi trạng thái quyền (granted, prompt, denied)
- Yêu cầu và xác minh quyền

### Cách ly Dữ liệu

- **Cấp Project**: Cách ly dữ liệu theo project
- **Workspace-specific**: Kiểm soát truy cập theo workspace
- **localStorage**: Cờ migration cho audit bảo mật

---

## Hệ thống Migration

### Phiên bản Schema

| Phiên bản | Mô tả |
|-----------|-------|
| v1 | Schema ban đầu (projects, ideState, conversations) |
| v3 | Bảng AI Foundation |
| v4 | Bảng Credentials |
| v5 | Conversation threads |
| v6-7 | Provider/Agent configs |
| v8 | Sync status với migration localStorage |
| v9 | Epic 24: File metadata, tool logs, FSA handles, snapshots |
| v11-12 | Knowledge sources và collections |
| v13-14 | RAG search và embedding models |
| v15 | Notes (BlockNote editor) |

### Tính năng Migration

- **Idempotent**: An toàn khi chạy nhiều lần
- **Logged**: Tất cả migrations được log cho audit
- **Trackable**: Cờ localStorage ngăn chặn chạy lại
- **Reversible**: Có thể reset cho development

---

## Ví dụ Sử dụng

### Truy cập Database

```typescript
import { getDb, getRecentProjects } from '@/infrastructure/persistence/dexie-db';

const db = getDb();
const projects = await getRecentProjects(10);
```

### Xử lý Sự kiện

```typescript
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

eventBus.on(DomainEventType.WORKSPACE_CHANGED, (event) => {
  console.log('Workspace đã thay đổi:', event.payload);
});
```

### Sync Engine

```typescript
import { createSyncEngine } from '@/infrastructure/sync/core/sync-engine';

const engine = createSyncEngine({
  adapters: { fsa: fsaAdapter, idb: idbAdapter },
  defaults: { direction: 'bidirectional' },
});

await engine.sync();
```

---

## Vấn đề và Hạn chế Đã biết

### Tương thích SSR

- Thao tác database chỉ khả dụng trong trình duyệt
- Luôn kiểm tra `typeof window !== 'undefined'`

### Hạn ngạch Lưu trữ

- IndexedDB có hạn ngạch phụ thuộc trình duyệt
- Sử dụng quota manager để giám sát

### Xử lý Quyền

- Quyền FSA có thể bị thu hồi bởi người dùng
- Xử lý từ chối quyền một cách graceful

---

## Tài liệu Liên quan

- **Kiến trúc**: `_bmad-output/architecture/platform-architecture-definitive-2026-01-04.md`
- **Quản lý State**: `_bmad-output/project-planning-artifacts/adr-state-consolidation-2026-01-04.md`
- **Deep Scan**: `_bmad/modules/deep-scan/`

---

## Danh sách Tệp

| Danh mục | Số tệp | Mô tả |
|----------|--------|-------|
| Persistence | 120 | Database, helpers, store slices |
| Events | 8 | Triển khai event bus |
| Sync | 120 | Engine sync, adapters, strategies |
| **Tổng** | **248** | Tệp TypeScript |
