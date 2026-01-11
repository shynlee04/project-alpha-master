# Store Consolidation Analysis
**Date:** 2026-01-11
**Category:** State Management - Store Architecture, God Stores, Duplication
**Status:** Complete

---

## Executive Summary

This document analyzes the Zustand store architecture, identifying god stores, duplicate/overlapping stores, and consolidation opportunities.

**Key Metrics:**
- **Total Store Files:** 89+
- **God Stores (>300 lines):** 8 files
- **Duplicate/Overlapping:** 5 store groups
- **Orphaned/Unclear:** 3 stores
- **Store Locations:** 3 different directories

---

## 1. God Stores Analysis

### Definition
A "god store" is any store file exceeding 300 lines, indicating excessive responsibility and violating single responsibility principle.

### God Stores Inventory

| # | Store File | Lines | Primary Responsibilities | Severity |
|---|------------|-------|-------------------------|----------|
| 1 | `workspace/useWorkspaceFileSystem.ts` | 571 | File system ops, sync, project metadata | HIGH |
| 2 | `providers/migration-backup.ts` | 549 | Migration backup & rollback | HIGH |
| 3 | `conversation/migration/conversation-migration.ts` | 549 | Conversation migration | HIGH |
| 4 | `conversation/useConversationStore.ts` | 497 | Conversation state, messages, UI | HIGH |
| 5 | `chat/unified-chat-store.ts` | 448 | Chat state management | MEDIUM |
| 6 | `providers/provider-store.ts` | 387 | Provider CRUD, config, state | MEDIUM |
| 7 | `workspace/workspace-store.ts` | 347 | Workspace state, projects | MEDIUM |
| 8 | `rag/useRAGStore.ts` | 327 | RAG, embeddings, vector search | MEDIUM |

---

### 1.1 useWorkspaceFileSystem.ts (571 lines) - BREAKDOWN PLAN

**Current Responsibilities:**
1. File System Access API integration
2. WebContainer synchronization
3. Project metadata management
4. File watching
5. Sync orchestration
6. Error handling

**Suggested Slices:**
```
useWorkspaceFileSystem.ts (<200 lines - orchestration)
├── slices/fs-operations.ts - File CRUD operations
├── slices/webcontainer-sync.ts - WebContainer integration
├── slices/project-metadata.ts - Project state
└── slices/file-watcher.ts - File watching logic
```

**Benefits:**
- Each slice has single responsibility
- Easier to test
- Clearer dependencies

---

### 1.2 migration-backup.ts (549 lines) - BREAKDOWN PLAN

**Current Responsibilities:**
1. IndexedDB backup operations
2. localStorage backup operations
3. Checksum calculation and validation
4. Rollback orchestration
5. Migration state tracking

**Issue:** Migration logic should be in infrastructure layer, not store layer.

**Suggested Structure:**
```
Move to infrastructure layer:
infrastructure/migration/
├── backup-manager.ts - Orchestration
├── indexeddb-backup.ts - IndexedDB operations
├── local-storage-backup.ts - localStorage operations
└── checksum-validator.ts - Validation logic
```

---

### 1.3 conversation-migration.ts (549 lines) - BREAKDOWN PLAN

**Current Responsibilities:**
1. Conversation data migration
2. Schema transformation
3. Batch processing
4. Error recovery

**Issue:** Migration logic in store layer violates separation of concerns.

**Suggested Structure:**
```
Move to infrastructure layer:
infrastructure/migration/conversation/
├── migrator.ts - Main orchestration
├── transformers/ - Schema transformations
└── batch-processor.ts - Batch operations
```

---

### 1.4 useConversationStore.ts (497 lines) - BREAKDOWN PLAN

**Current Responsibilities:**
1. Conversation state
2. Message management
3. Thread operations
4. UI state (scrolling, selection)
5. Sync state

**Suggested Slices:**
```
useConversationStore.ts (<200 lines - orchestration)
├── slices/conversation-state.ts - Core conversation data
├── slices/message-operations.ts - Message CRUD
├── slices/thread-management.ts - Thread operations
└── slices/conversation-ui.ts - UI-specific state
```

---

## 2. Store Duplication Analysis

### 2.1 Conversation Stores Group

**Files:**
1. `src/infrastructure/persistence/stores/conversation/useConversationStore.ts` (497 lines)
2. `src/infrastructure/persistence/stores/conversation/conversation-store.ts`
3. `src/infrastructure/persistence/stores/chat/unified-chat-store.ts` (448 lines)

**Overlap Analysis:**

| Feature | useConversationStore | conversation-store | unified-chat-store |
|---------|---------------------|-------------------|-------------------|
| Message state | ✅ | ✅ | ✅ |
| Thread management | ✅ | ✅ | ❌ |
| Chat UI state | ✅ | ❌ | ✅ |
| Sync state | ✅ | ❌ | ❌ |
| Streaming responses | ✅ | ❌ | ✅ |

**Conflicts:**
- Three different stores managing conversational state
- Unclear which store to use for new features
- Potential for state inconsistency

**Consolidation Plan:**
```
Phase 1: Audit each store's consumers
Phase 2: Design unified slice structure
Phase 3: Migrate consumers gradually
Phase 4: Deprecate redundant stores
```

---

### 2.2 Workspace Stores Group

**Files:**
1. `src/infrastructure/persistence/stores/workspace/workspace-store.ts` (347 lines)
2. `src/infrastructure/persistence/stores/workspace/useWorkspaceFileSystem.ts` (571 lines)
3. `src/lib/workspace/unified-workspace-context.tsx`

**Overlap Analysis:**

| Feature | workspace-store | useWorkspaceFileSystem | unified-workspace-context |
|---------|----------------|----------------------|---------------------------|
| Workspace list | ✅ | ❌ | ✅ |
| Active workspace | ✅ | ✅ | ✅ |
| File system | ❌ | ✅ | ❌ |
| Project metadata | ✅ | ✅ | ❌ |
| UI preferences | ❌ | ❌ | ✅ |

**Conflicts:**
- Workspace state scattered across three locations
- Active workspace tracked in multiple places
- Inconsistent access patterns

**Consolidation Plan:**
```
Proposed Structure:
stores/workspace/
├── workspace-store.ts - Core workspace state (<200 lines)
├── slices/workspace-list.ts - Workspace CRUD
├── slices/active-workspace.ts - Current workspace state
├── slices/workspace-fs.ts - File system operations
└── slices/workspace-ui.ts - UI-specific state
```

---

### 2.3 Scattered Store Architecture

**Store Locations:**
1. `src/infrastructure/persistence/stores/` (Primary - Zustand slice pattern)
2. `src/lib/snippets/snippet-store` (Custom Zustand)
3. `src/lib/workspace/project-store` (Custom Zustand)
4. `src/lib/filesystem/file-snapshot-store` (Custom Zustand)

**Issue:** Inconsistent patterns make codebase difficult to navigate and maintain.

**Consolidation Plan:**
```
Target: All stores in infrastructure/persistence/stores/

Migration:
src/lib/snippets/snippet-store.ts → stores/snippets/
src/lib/workspace/project-store.ts → stores/workspace/
src/lib/filesystem/file-snapshot-store.ts → stores/filesystem/
```

---

## 3. Orphaned/Unclear Stores

### 3.1 conversation-auto-restore.ts

**Location:** `src/infrastructure/persistence/stores/conversation-auto-restore.ts`

**Usage:** Test-only (found in test files only)

**Status:** Orphaned from production code

**Recommendation:**
- If used only in tests: Move to test fixtures
- If intended for production: Implement and document purpose

---

### 3.2 file-watcher-store.ts

**Location:** `src/infrastructure/persistence/stores/file-watcher-store.ts`

**Usage:** Minimal (1-2 consumers)

**Status:** Unclear purpose, possible redundancy

**Recommendation:**
- Audit actual usage
- Merge into appropriate store if redundant
- Document if needed

---

### 3.3 synthesis-store.ts

**Location:** `src/infrastructure/persistence/stores/synthesis-store.ts`

**Usage:** No active consumers found

**Status:** Orphaned

**Recommendation:**
- Confirm if feature is still planned
- Remove if not needed
- Document if planned for future use

---

## 4. Cross-Store Dependencies

### 4.1 Dependency Map

**File:** `src/infrastructure/persistence/stores/workspace/useCornerstoneStores.ts`

```typescript
Dependencies:
├── useWorkspaceStore
├── useAppStore
├── useConversationStore
├── useRAGStore
└── useAgentSelectionStore
```

**Issue:** Centralized import creates tight coupling

**Impact:**
- Stores cannot be tested in isolation
- Changes ripple across multiple stores
- Difficult to reason about state flow

---

## 5. Store Size Distribution

```
Size Distribution:
├── >500 lines: 3 stores (CRITICAL)
├── 300-500 lines: 5 stores (HIGH)
├── 200-300 lines: 12 stores (MEDIUM)
├── 100-200 lines: 31 stores (OK)
└── <100 lines: 38+ stores (GOOD)
```

**Target:** No store file should exceed 300 lines

---

## 6. Consolidation Roadmap

### Phase 1: Immediate (Critical God Stores)
1. Break down `useWorkspaceFileSystem.ts` (571 → <200 lines)
2. Move `migration-backup.ts` to infrastructure layer
3. Move `conversation-migration.ts` to infrastructure layer

### Phase 2: High Priority (Remaining God Stores)
4. Break down `useConversationStore.ts` (497 → <200 lines)
5. Break down `unified-chat-store.ts` (448 → <200 lines)
6. Break down `provider-store.ts` (387 → <200 lines)

### Phase 3: Medium Priority (Store Duplication)
7. Consolidate conversation stores
8. Consolidate workspace stores
9. Migrate lib stores to infrastructure

### Phase 4: Low Priority (Cleanup)
10. Evaluate and clean up orphaned stores
11. Reduce cross-store dependencies
12. Document store architecture

---

## 7. Recommended Store Architecture

### Target Structure

```
src/infrastructure/persistence/stores/
├── use-app-store.ts (main entry point)
│
├── conversation/
│   ├── useConversationStore.ts (<200 lines)
│   ├── slices/conversation-state.ts
│   ├── slices/message-operations.ts
│   ├── slices/thread-management.ts
│   └── slices/conversation-ui.ts
│
├── workspace/
│   ├── workspace-store.ts (<200 lines)
│   ├── slices/workspace-list.ts
│   ├── slices/active-workspace.ts
│   ├── slices/workspace-fs.ts
│   └── slices/workspace-ui.ts
│
├── agents/
│   ├── agent-selection-store.ts
│   ├── slices/agent-validation.ts
│   └── slices/agent-workspace-binding.ts
│
├── providers/
│   ├── provider-store.ts (<200 lines)
│   ├── slices/provider-crud.ts
│   ├── slices/provider-config.ts
│   └── slices/provider-validation.ts
│
├── rag/
│   ├── useRAGStore.ts (<200 lines)
│   └── slices/...
│
└── ... (other domains)
```

---

## 8. Success Metrics

**Before:**
- God stores: 8 files >300 lines
- Duplicate stores: 5 groups
- Store locations: 3 directories

**After Target:**
- God stores: 0 files >300 lines
- Duplicate stores: 0
- Store locations: 1 directory

---

## Related Artifacts

- [Comprehensive Codebase Audit](./comprehensive-codebase-audit-2026-01-11.md)
- [Architecture Conflicts Analysis](./architecture-conflicts-2026-01-11.md)
- [God Store Breakdown Guide](./god-store-breakdown-guide-2026-01-11.md)

---

*Analysis conducted by: BMAD State Management Analysis Agent*
*Report Version: 1.0*
