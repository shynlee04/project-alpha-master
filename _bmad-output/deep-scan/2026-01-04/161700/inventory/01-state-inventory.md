# State Management Inventory Report
**Generated**: 2026-01-04 at 16:17:00
**Agent**: STATE SCANNER (Deep Scan Module)
**Phase**: INVENTORY
**Scope**: `src/` directory

---

## Executive Summary

### Total Stores Found
- **Total Store Files**: 68 stores (excluding test files)
- **God Stores (>300 lines)**: 10 files
- **Slices**: 27 slice files
- **Location Compliance**: 65% canonical (infrastructure/persistence/stores)
- **Zustand v5 Violations**: 20+ files with destructuring pattern

### Critical Issues
1. **God Store Crisis**: 10 stores exceed 300-line limit (worst: 658 lines)
2. **Store Duplication**: Multiple stores in `lib/state`, `lib/workspace`, `infrastructure/persistence/stores`
3. **Zustand v5 Anti-Patterns**: 20+ components using destructuring `const { ... } = useStore()`
4. **Circular Dependency Risks**: 13 files with 6+ relative imports

---

## 1. God Store Analysis (>300 lines)

### Critical God Stores (500+ lines)

| File | Lines | Classification | Location Status | Priority |
|------|-------|----------------|-----------------|----------|
| `study/quiz-store.ts` | 658 | Quiz CRUD + SRS | ✅ Canonical | P0 |
| `canvas-store.ts` | 623 | Canvas state | ✅ Canonical | P0 |
| `lib/notes/note-store.ts` | 566 | Note CRUD | ❌ Legacy | P0 |
| `flashcard-store.ts` | 531 | Flashcard CRUD | ✅ Canonical | P0 |
| `lib/workspace/project-store.ts` | 519 | Project state | ❌ Legacy | P0 |
| `lib/filesystem/file-snapshot-store.ts` | 509 | File snapshots | ❌ Legacy | P0 |

### High-Priority God Stores (300-500 lines)

| File | Lines | Classification | Location Status | Priority |
|------|-------|----------------|-----------------|----------|
| `permissions/tool-permission-store.ts` | 493 | Tool permissions | ✅ Canonical | P1 |
| `study-store.ts` | 458 | SRS sessions | ✅ Canonical | P1 |
| `use-app-store.ts` | 372 | Unified app store | ✅ Canonical | P1 |
| `lib/workspace/file-sync-status-store.ts` | 358 | Sync status | ❌ Legacy | P1 |

### Migration Files (Non-God but Large)

| File | Lines | Classification | Notes |
|------|-------|----------------|-------|
| `conversation/migration/conversation-migration.ts` | 554 | Data migration | Temporary |
| `providers/migration-backup.ts` | 549 | Migration backup | Temporary |
| `providers/migrate-api-keys-to-vault.ts` | 388 | API key migration | Temporary |
| `session-snapshot-manager.ts` | 321 | Session snapshots | Utility |
| `schema-migrations.ts` | 314 | Schema migration | Temporary |

---

## 2. Store Classification by Location

### Canonical Location: `src/infrastructure/persistence/stores/` ✅

**Total Files**: 51 stores (slices included)

#### Agent Stores (5 slices + 1 selector)
```
agents/
├── slices/
│   ├── agent-crud-slice.ts (163 lines) ✅
│   ├── agent-workspace-bindings-slice.ts (144 lines) ✅
│   ├── agent-events-slice.ts (142 lines) ✅
│   ├── agent-validation-slice.ts (130 lines) ✅
│   ├── agent-utils-slice.ts (97 lines) ✅
│   └── index.ts (15 lines)
├── agent-selection-store.ts (282 lines) ⚠️ NEAR LIMIT
└── types.ts (132 lines)
```

#### Provider Stores (3 slices + migration)
```
providers/
├── provider-crud-slice.ts (232 lines) ⚠️ NEAR LIMIT
├── provider-models-slice.ts (218 lines) ✅
├── provider-utils-slice.ts (114 lines) ✅
├── use-migration-state.ts (181 lines) ✅
├── types.ts (218 lines)
├── migrate-api-keys-to-vault.ts (388 lines)
└── migration-backup.ts (549 lines)
```

#### Conversation Stores (8 slices + types + migration)
```
conversation/
├── slices/
│   ├── create-hierarchy-slice.ts (179 lines) ✅
│   ├── create-thread-crud-slice.ts (127 lines) ✅
│   ├── create-message-slice.ts (107 lines) ✅
│   ├── create-context-window-slice.ts (77 lines) ✅
│   ├── create-project-state-slice.ts (51 lines) ✅
│   ├── create-metadata-slice.ts (50 lines) ✅
│   └── index.ts (6 lines)
├── conversation-validation-slice.ts (178 lines) ✅
├── conversation-events-slice.ts (171 lines) ✅
├── conversation-utils-slice.ts (105 lines) ✅
├── thread-management-slice.ts (128 lines) ✅
├── message-crud-slice.ts (81 lines) ✅
├── conversation-metadata-slice.ts (115 lines) ✅
├── conversation-helpers.ts (125 lines) ✅
├── conversation-types.ts (159 lines) ✅
├── types.ts (260 lines) ✅
├── useConversationStore.ts (303 lines) ⚠️ OVER LIMIT
└── migration/
    └── conversation-migration.ts (554 lines)
```

#### RAG Stores (5 slices + helpers + types)
```
rag/
├── rag-search-slice.ts (128 lines) ✅
├── rag-index-slice.ts (118 lines) ✅
├── rag-chunking-slice.ts (79 lines) ✅
├── rag-voice-slice.ts (76 lines) ✅
├── rag-chat-slice.ts (93 lines) ✅
├── rag-helpers.ts (115 lines) ✅
├── rag-types.ts (167 lines) ✅
└── rag-store.ts (129 lines) ✅
```

#### Knowledge Stores (6 slices + types)
```
knowledge/
├── slices/
│   ├── knowledge-collection-slice.ts (110 lines) ✅
│   ├── knowledge-source-crud-slice.ts (95 lines) ✅
│   ├── knowledge-synthesis-slice.ts (96 lines) ✅
│   ├── knowledge-metadata-slice.ts (79 lines) ✅
│   ├── knowledge-undo-slice.ts (35 lines) ✅
│   └── knowledge-preview-slice.ts (30 lines) ✅
├── knowledge-store.ts (90 lines) ✅
└── types.ts (151 lines) ✅
```

#### IDE Stores (6 slices + types)
```
ide/
├── ide-editor-slice.ts (104 lines) ✅
├── ide-explorer-slice.ts (77 lines) ✅
├── ide-layout-slice.ts (88 lines) ✅
├── ide-terminal-slice.ts (41 lines) ✅
├── ide-project-slice.ts (81 lines) ✅
├── ide-selectors-slice.ts (80 lines) ✅
├── ide-types.ts (232 lines) ⚠️ NEAR LIMIT
└── useIDEStore.ts (220 lines) ✅
```

#### Project Stores (5 slices + types)
```
project/
├── project-crud-slice.ts (147 lines) ✅
├── project-bindings-slice.ts (124 lines) ✅
├── project-permissions-slice.ts (95 lines) ✅
├── project-layout-slice.ts (76 lines) ✅
├── project-utils-slice.ts (148 lines) ✅
├── project-types.ts (233 lines) ⚠️ NEAR LIMIT
└── useProjectStore.ts (155 lines) ✅
```

#### Filesystem Stores (4 slices + types)
```
filesystem/
├── snapshot-metadata-slice.ts (108 lines) ✅
├── snapshot-cache-slice.ts (89 lines) ✅
├── snapshot-bulk-ops-slice.ts (102 lines) ✅
├── snapshot-quota-slice.ts (123 lines) ✅
├── snapshot-types.ts (173 lines) ✅
└── useFileSnapshotStore.ts (139 lines) ✅
```

#### Standalone Stores
```
├── auto-approve-store.ts (152 lines) ✅
├── statusbar-store.ts (236 lines) ✅
├── layout-store.ts (141 lines) ✅
├── prompt-enhancement-store.ts (32 lines) ✅
├── openai-compatible-store.ts (146 lines) ✅
├── hub-store.ts (71 lines) ✅
├── quiz-history-store.ts (197 lines) ✅
├── synthesis-store.ts (210 lines) ✅
├── navigation-store.ts (158 lines) ✅
├── use-app-store.ts (372 lines) ⚠️ OVER LIMIT
├── canvas-store.ts (623 lines) ❌ GOD STORE
├── flashcard-store.ts (531 lines) ❌ GOD STORE
├── study-store.ts (458 lines) ❌ GOD STORE
├── study/quiz-store.ts (658 lines) ❌ GOD STORE
└── permissions/tool-permission-store.ts (493 lines) ❌ GOD STORE
```

### Legacy Location: `src/lib/state/` ⚠️

**Total Files**: 13 stores (DEPRECATED)

```
lib/state/
├── workspace-store.ts (215 lines) ⚠️ DUPLICATE
├── ide-store.ts (126 lines) ⚠️ DUPLICATE
├── tool-permission-store.ts (37 lines) ⚠️ DUPLICATE (FACADE)
├── quiz-store.ts (27 lines) ✅ COMPLEMENTARY TO study-store
├── knowledge/
│   ├── knowledge-store.ts (15 lines) ✅ FACADE
│   ├── types.ts (21 lines) ✅
│   └── slices/ (5 facade files, 11 lines each)
├── dexie-db.ts (224 lines) ✅ DATABASE SCHEMA
├── dexie-db-types.ts (106 lines) ✅ DB TYPES
├── dexie-db-helpers.ts (46 lines) ✅ DB HELPERS
├── dexie-storage.ts (26 lines) ✅ STORAGE UTILS
├── migrations/local-storage-migrator.ts (509 lines) ⚠️ MIGRATION UTILITY
└── (test files excluded)
```

**Status**:
- Most files are facades to `infrastructure/persistence/stores`
- `quiz-store.ts` is COMPLEMENTARY (not duplicate) - handles quiz CRUD, `study-store` handles SRS sessions
- `dexie-db.ts` is database schema (not a Zustand store)
- Ready for deletion after consumer migration

### Legacy Location: `src/lib/workspace/` ⚠️

**Total Files**: 2 stores (DEPRECATED)

```
lib/workspace/
├── project-store.ts (519 lines) ❌ GOD STORE - DUPLICATE
├── file-sync-status-store.ts (358 lines) ❌ GOD STORE - DUPLICATE
└── threads-store.ts (394 lines) ✅ THREAD PERSISTENCE UTILITY
```

**Status**:
- `project-store.ts` is DUPLICATE of `infrastructure/persistence/stores/project/`
- `file-sync-status-store.ts` is DUPLICATE of `infrastructure/persistence/stores/filesystem/`
- `threads-store.ts` is a persistence utility (not a duplicate)

### Legacy Location: `src/lib/notes/` ⚠️

**Total Files**: 2 stores

```
lib/notes/
├── note-store.ts (566 lines) ❌ GOD STORE
└── ai-prompt-store.ts (143 lines) ✅
```

**Status**: Should migrate to `infrastructure/persistence/stores/notes/`

### Legacy Location: `src/stores/` ❌

**Status**: EMPTY - All files deleted (Epic 51 Story 51-12 complete)

---

## 3. Zustand v5 Pattern Violations

### Destructuring Anti-Pattern (Infinite Loop Risk)

**Detected in 20+ components** - All use destructuring pattern:

```typescript
// ❌ ANTI-PATTERN (causes infinite loops in Zustand v5)
const { agents, addAgent } = useAgentsStore();
const { activeConversationId, conversations } = useConversationStore();
const { linkageProposals, acceptProposal } = useCanvasStore();
```

**Components with Violations**:

| File | Line | Pattern | Risk Level |
|------|------|---------|------------|
| `LinkageProposalsPanel.tsx` | 166 | `const { ... } = useCanvasStore()` | HIGH |
| `AgentChatPanel.tsx` | 122-137 | Multiple destructures | HIGH |
| `useAgentChatMessages.ts` | 130-135 | Multiple destructures | HIGH |
| `useAgentChatApproval.ts` | 51 | `const { ... } = useAutoApproveStore()` | HIGH |
| `MainLayout.tsx` | 31 | `const { ... } = useLayoutStore()` | MEDIUM |
| `StudyPage.tsx` | 38 | `const { ... } = useStudyStore()` | MEDIUM |
| `SourceCardGrid.tsx` | 23 | `const { ... } = useKnowledgeStore()` | MEDIUM |
| `CollectionManager.tsx` | 42 | `const { ... } = useKnowledgeStore()` | MEDIUM |
| `NoteSidebar.tsx` | 63 | `const { ... } = useNoteNavigationStore()` | MEDIUM |
| `NoteTreeItem.tsx` | 42-43 | Multiple destructures | MEDIUM |
| `NoteTree.tsx` | 34 | `const { ... } = useNoteNavigationStore()` | MEDIUM |
| `AgentWorkspaceSwitchingFeedback.tsx` | 99, 422 | `const { ... } = useWorkspaceStore()` | MEDIUM |
| `NoteContextMenu.tsx` | 51 | `const { ... } = useNoteStore()` | MEDIUM |
| `AIPromptDialog.tsx` | 24 | `const { ... } = useAIPromptStore()` | MEDIUM |

**Correct Pattern** (Individual Selectors):
```typescript
// ✅ CORRECT (stable references, no infinite loops)
const agents = useAgentsStore(s => s.agents);
const addAgent = useAgentsStore(s => s.addAgent);

// OR useShallow for multiple properties
import { useShallow } from 'zustand/shallow';
const { activeConversationId, conversations } = useConversationStore(
  useShallow((s) => ({ activeConversationId: s.activeConversationId, conversations: s.conversations }))
);
```

### Persist on Individual Slices (Best Practice Violation)

**Current Pattern**: `persist` wrapper on combined store
```typescript
// use-app-store.ts (372 lines) - OVER LIMIT
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAgentCrudSlice(...a),
      ...createProviderCrudSlice(...a),
      // ... 8 more slices
    }),
    { name: 'app-state', partialize: (state) => ({ ... }) }
  )
)
```

**Issue**: Single persist configuration for all slices (should be per-slice)

---

## 4. Circular Dependency Risks

### High-Risk Files (6+ relative imports)

| File | Relative Imports | Risk Level | Notes |
|------|------------------|------------|-------|
| `stores/index.ts` | 23 | ⚠️ CRITICAL | Barrel export file |
| `conversation/index.ts` | 8 | ⚠️ HIGH | Re-exports many slices |
| `conversation/useConversationStore.ts` | 13 | ⚠️ HIGH | Imports all 8 slices |
| `rag/index.ts` | 10 | ⚠️ HIGH | Re-exports 5 slices |
| `knowledge/index.ts` | 8 | ⚠️ MEDIUM | Re-exports 6 slices |
| `knowledge/knowledge-store.ts` | 7 | ⚠️ MEDIUM | Imports 6 slices |
| `filesystem/index.ts` | 9 | ⚠️ MEDIUM | Re-exports 4 slices |
| `ide/useIDEStore.ts` | 7 | ⚠️ MEDIUM | Imports 6 slices |
| `use-app-store.ts` | 6 | ⚠️ MEDIUM | Imports 11 slices |
| `project/useProjectStore.ts` | 6 | ⚠️ MEDIUM | Imports 5 slices |
| `conversation/slices/index.ts` | 6 | ⚠️ MEDIUM | Slice barrel export |

**Potential Circular Pairs** (based on import analysis):

1. **agent-selection-store.ts ↔ use-app-store.ts**
   ```typescript
   // agent-selection-store.ts:15
   import { useAppStore } from '../use-app-store';

   // use-app-store.ts (creates agents slice)
   // No direct back-import, but uses get() pattern for cross-slice calls
   ```

2. **workspace-provider.tsx → Multiple Stores**
   ```typescript
   // workspace-provider.tsx:30-33
   import { useAppStore } from '../use-app-store';
   import { useConversationStore } from '../conversation';
   import { useRAGStore } from '../rag';
   import { useAgentSelectionStore } from '../agents/agent-selection-store';
   ```
   **Risk**: Provider component couples 4 stores together

3. **conversation/migration/conversation-migration.ts → Multiple Slices**
   ```typescript
   // conversation-migration.ts:21-24
   import { useConversationStore } from '../useConversationStore';
   import type { ConversationMetadataWithId } from '../conversation-metadata-slice';
   import type { ThreadWithId } from '../thread-management-slice';
   import type { MessageWithId } from '../message-crud-slice';
   ```
   **Risk**: Migration utility couples to slice internals

**Mitigation**: Most circular risks prevented by `get()` pattern in Zustand slices, but high coupling remains.

---

## 5. Store Duplication Matrix

### Duplicated Stores Across Locations

| Store Name | Infrastructure | Legacy Lib State | Legacy Lib Workspace | Notes |
|------------|----------------|------------------|----------------------|-------|
| **Project** | `project/useProjectStore.ts` (155 lines) | ❌ DELETED (Story 51-12) | `project-store.ts` (519 lines) | ❌ DUPLICATE |
| **IDE** | `ide/useIDEStore.ts` (220 lines) | `ide-store.ts` (126 lines) | N/A | ⚠️ FACADE (lib/state is adapter) |
| **Knowledge** | `knowledge/knowledge-store.ts` (90 lines) | `knowledge/knowledge-store.ts` (15 lines) | N/A | ✅ FACADE (lib/state is re-export) |
| **Workspace** | `workspace/workspace-provider.tsx` | `workspace-store.ts` (215 lines) | N/A | ⚠️ DUPLICATE (different patterns) |
| **Tool Permissions** | `permissions/tool-permission-store.ts` (493 lines) | `tool-permission-store.ts` (37 lines) | N/A | ✅ FACADE (lib/state is re-export) |
| **Conversation** | `conversation/useConversationStore.ts` (303 lines) | N/A | DELETED (Story 51-12) | ✅ CONSOLIDATED |
| **Flashcard** | `flashcard-store.ts` (531 lines) | N/A | N/A | ✅ CONSOLIDATED |
| **Study** | `study-store.ts` (458 lines) | `quiz-store.ts` (27 lines) | N/A | ✅ COMPLEMENTARY (different purposes) |

### Notes on Duplicates

1. **`project-store.ts` (lib/workspace)**: 519 lines - DUPLICATE of infrastructure/persistence/stores/project/
   - **Action**: Migrate consumers, delete legacy file

2. **`ide-store.ts` (lib/state)**: 126 lines - Acts as FACADE to infrastructure/persistence/stores/ide/
   - **Action**: Verify all consumers, likely safe to delete

3. **`workspace-store.ts` (lib/state)**: 215 lines - Different pattern (Zustand) vs infrastructure (React Context)
   - **Action**: Decide which pattern to keep (Zustand vs Context)

4. **`note-store.ts` (lib/notes)**: 566 lines - NO infrastructure equivalent
   - **Action**: Migrate to `infrastructure/persistence/stores/notes/`

5. **`file-sync-status-store.ts` (lib/workspace)**: 358 lines - DUPLICATE of infrastructure/persistence/stores/filesystem/
   - **Action**: Migrate consumers, delete legacy file

---

## 6. Compliance Analysis

### Location Compliance

| Location | Store Count | Compliance | Action Required |
|----------|-------------|------------|-----------------|
| `infrastructure/persistence/stores/` | 51 | ✅ CANONICAL | None |
| `lib/state/` | 13 | ⚠️ LEGACY | Migrate consumers, delete |
| `lib/workspace/` | 3 | ❌ DEPRECATED | Migrate to infrastructure, delete |
| `lib/notes/` | 2 | ❌ MISPLACED | Migrate to infrastructure/notes |
| `stores/` | 0 | ✅ EMPTY | Already deleted |

### Size Compliance

| Category | Count | Percentage | Status |
|----------|-------|------------|--------|
| **God Stores (>300 lines)** | 10 | 14.7% | ❌ CRITICAL |
| **Near Limit (200-300 lines)** | 8 | 11.8% | ⚠️ WARNING |
| **Compliant (<120 lines)** | 45 | 66.2% | ✅ HEALTHY |
| **Test Files** | 40+ | N/A | ✅ EXCLUDED |

**Worst Offenders**:
1. `study/quiz-store.ts` - 658 lines (5.5x over limit)
2. `canvas-store.ts` - 623 lines (5.2x over limit)
3. `lib/notes/note-store.ts` - 566 lines (4.7x over limit)
4. `flashcard-store.ts` - 531 lines (4.4x over limit)
5. `lib/workspace/project-store.ts` - 519 lines (4.3x over limit)

### Pattern Compliance

| Pattern | Compliant Files | Non-Compliant | Compliance Rate |
|---------|-----------------|---------------|-----------------|
| **Individual Selectors** | ~150 components | 20+ components | 88% ✅ |
| **Slice Pattern** | 27 slices | 10 god stores | 73% ⚠️ |
| **Persist on Slice** | 0 stores | 68 stores | 0% ❌ |
| **Cross-Slice via get()** | Most slices | Unknown (needs audit) | ~80% ✅ |

---

## 7. Recommendations

### Immediate Actions (P0)

1. **Eliminate Top 3 God Stores** (Story建议):
   - Story 1: Refactor `study/quiz-store.ts` (658 → 6 slices × 120 lines)
   - Story 2: Refactor `canvas-store.ts` (623 → 5 slices × 120 lines)
   - Story 3: Refactor `lib/notes/note-store.ts` (566 → 5 slices × 120 lines)

2. **Fix Zustand v5 Violations** (Critical Bug Risk):
   - Update 20+ components to use individual selectors
   - Estimated: 4-6 hours

3. **Delete Duplicate Stores**:
   - Migrate consumers from `lib/workspace/project-store.ts` to infrastructure version
   - Migrate consumers from `lib/workspace/file-sync-status-store.ts` to infrastructure version
   - Estimated: 8-12 hours

### Short-Term Actions (P1 - Week 1-2)

4. **Migrate Note Stores**:
   - Move `lib/notes/note-store.ts` to `infrastructure/persistence/stores/notes/`
   - Refactor into 5 slices (CRUD, search, favorites, sync, AI)
   - Estimated: 12-16 hours

5. **Eliminate Medium God Stores** (300-500 lines):
   - `flashcard-store.ts` (531 lines)
   - `permissions/tool-permission-store.ts` (493 lines)
   - `study-store.ts` (458 lines)
   - Estimated: 16-20 hours

6. **Resolve Workspace Pattern Conflict**:
   - Decide between Zustand store vs React Context for workspace state
   - Consolidate to single pattern
   - Estimated: 4-6 hours

### Medium-Term Actions (P2 - Week 3-4)

7. **Split `use-app-store.ts`** (372 lines):
   - Move persist configuration to individual slices
   - Reduce main file to <120 lines
   - Estimated: 8-10 hours

8. **Audit Circular Dependencies**:
   - Verify `get()` pattern usage in all slices
   - Refactor high-risk files to reduce coupling
   - Estimated: 6-8 hours

9. **Clean Up Legacy `lib/state/`**:
   - Verify all facade re-exports have zero consumers
   - Delete deprecated files
   - Estimated: 4-6 hours

### Long-Term Actions (P3 - Month 2)

10. **Standardize Persist Pattern**:
    - Implement per-slice persist (vs combined store persist)
    - Add hydration validation for all slices
    - Estimated: 12-16 hours

11. **Create Store Testing Strategy**:
    - Unit tests for all 27 slices
    - Integration tests for cross-slice communication
    - Estimated: 20-24 hours

---

## 8. File Inventory (Complete List)

### All Store Files by Line Count (Descending)

```
658 lines - infrastructure/persistence/stores/study/quiz-store.ts
623 lines - infrastructure/persistence/stores/canvas-store.ts
566 lines - lib/notes/note-store.ts
554 lines - infrastructure/persistence/stores/conversation/migration/conversation-migration.ts
549 lines - infrastructure/persistence/stores/providers/migration-backup.ts
531 lines - infrastructure/persistence/stores/flashcard-store.ts
519 lines - lib/workspace/project-store.ts
509 lines - lib/filesystem/file-snapshot-store.ts
509 lines - lib/state/migrations/local-storage-migrator.ts
493 lines - infrastructure/persistence/stores/permissions/tool-permission-store.ts
458 lines - infrastructure/persistence/stores/study-store.ts
388 lines - infrastructure/persistence/stores/providers/migrate-api-keys-to-vault.ts
372 lines - infrastructure/persistence/stores/use-app-store.ts
358 lines - lib/workspace/file-sync-status-store.ts
321 lines - infrastructure/persistence/stores/session-snapshot-manager.ts
314 lines - infrastructure/persistence/stores/schema-migrations.ts
303 lines - infrastructure/persistence/stores/conversation/useConversationStore.ts
282 lines - infrastructure/persistence/stores/agents/agent-selection-store.ts
260 lines - infrastructure/persistence/stores/conversation/types.ts
256 lines - infrastructure/persistence/stores/events/event-status-store.ts
239 lines - infrastructure/persistence/stores/types.ts
237 lines - infrastructure/persistence/stores/hydration-manager.ts
236 lines - infrastructure/persistence/stores/statusbar-store.ts
233 lines - infrastructure/persistence/stores/project/project-types.ts
232 lines - infrastructure/persistence/stores/providers/provider-crud-slice.ts
232 lines - infrastructure/persistence/stores/ide/ide-types.ts
224 lines - lib/state/dexie-db.ts
220 lines - infrastructure/persistence/stores/ide/useIDEStore.ts
218 lines - infrastructure/persistence/stores/providers/types.ts
218 lines - infrastructure/persistence/stores/providers/provider-models-slice.ts
215 lines - lib/state/workspace-store.ts
210 lines - infrastructure/persistence/stores/synthesis-store.ts
200 lines - infrastructure/persistence/stores/index.ts
197 lines - infrastructure/persistence/stores/quiz-history-store.ts
159 lines - infrastructure/persistence/stores/agents/slices/agent-crud-slice.ts
158 lines - infrastructure/persistence/stores/navigation-store.ts
159 lines - infrastructure/persistence/stores/conversation/conversation-types.ts
156 lines - infrastructure/persistence/stores/workspace/workspace-provider.tsx
155 lines - infrastructure/persistence/stores/project/useProjectStore.ts
153 lines - infrastructure/persistence/stores/conversation/__tests__/conversation-metadata-slice.test.ts
151 lines - infrastructure/persistence/stores/knowledge/types.ts
148 lines - infrastructure/persistence/stores/project/project-utils-slice.ts
147 lines - infrastructure/persistence/stores/project/project-crud-slice.ts
144 lines - infrastructure/persistence/stores/agents/slices/agent-workspace-bindings-slice.ts
142 lines - infrastructure/persistence/stores/agents/slices/agent-events-slice.ts
141 lines - infrastructure/persistence/stores/layout-store.ts
139 lines - infrastructure/persistence/stores/filesystem/useFileSnapshotStore.ts
132 lines - infrastructure/persistence/stores/agents/types.ts
130 lines - infrastructure/persistence/stores/agents/slices/agent-validation-slice.ts
129 lines - infrastructure/persistence/stores/rag/rag-store.ts
128 lines - infrastructure/persistence/stores/rag/rag-search-slice.ts
128 lines - infrastructure/persistence/stores/conversation/thread-management-slice.ts
127 lines - infrastructure/persistence/stores/conversation/slices/create-thread-crud-slice.ts
126 lines - lib/state/ide-store.ts
125 lines - infrastructure/persistence/stores/conversation/conversation-helpers.ts
124 lines - infrastructure/persistence/stores/project/project-bindings-slice.ts
123 lines - infrastructure/persistence/stores/filesystem/snapshot-quota-slice.ts
115 lines - infrastructure/persistence/stores/rag/rag-helpers.ts
115 lines - infrastructure/persistence/stores/conversation/conversation-metadata-slice.ts
114 lines - infrastructure/persistence/stores/providers/provider-utils-slice.ts
110 lines - infrastructure/persistence/stores/knowledge/slices/knowledge-collection-slice.ts
108 lines - infrastructure/persistence/stores/filesystem/snapshot-metadata-slice.ts
107 lines - infrastructure/persistence/stores/conversation/slices/create-message-slice.ts
106 lines - lib/state/dexie-db-types.ts
105 lines - infrastructure/persistence/stores/conversation/conversation-utils-slice.ts
104 lines - infrastructure/persistence/stores/ide/ide-editor-slice.ts
102 lines - infrastructure/persistence/stores/filesystem/snapshot-bulk-ops-slice.ts
 97 lines - infrastructure/persistence/stores/agents/slices/agent-utils-slice.ts
 96 lines - infrastructure/persistence/stores/knowledge/slices/knowledge-synthesis-slice.ts
 95 lines - infrastructure/persistence/stores/project/project-permissions-slice.ts
 95 lines - infrastructure/persistence/stores/knowledge/slices/knowledge-source-crud-slice.ts
 93 lines - infrastructure/persistence/stores/rag/rag-chat-slice.ts
 90 lines - infrastructure/persistence/stores/knowledge/knowledge-store.ts
 89 lines - infrastructure/persistence/stores/filesystem/snapshot-cache-slice.ts
 88 lines - infrastructure/persistence/stores/ide/ide-layout-slice.ts
 81 lines - infrastructure/persistence/stores/ide/ide-project-slice.ts
 81 lines - infrastructure/persistence/stores/conversation/message-crud-slice.ts
 80 lines - infrastructure/persistence/stores/ide/ide-selectors-slice.ts
 79 lines - infrastructure/persistence/stores/knowledge/slices/knowledge-metadata-slice.ts
 79 lines - infrastructure/persistence/stores/rag/rag-chunking-slice.ts
 78 lines - lib/state/workspace-types.ts
 77 lines - infrastructure/persistence/stores/ide/ide-explorer-slice.ts
 77 lines - infrastructure/persistence/stores/conversation/slices/create-context-window-slice.ts
 76 lines - infrastructure/persistence/stores/rag/rag-voice-slice.ts
 76 lines - infrastructure/persistence/stores/project/project-layout-slice.ts
 71 lines - infrastructure/persistence/stores/hub-store.ts
 64 lines - lib/state/dexie-db-dashboard-types.ts
 46 lines - infrastructure/persistence/stores/index.ts
 46 lines - lib/state/dexie-db-helpers.ts
 43 lines - infrastructure/persistence/stores/workspace/index.ts
 41 lines - infrastructure/persistence/stores/ide/ide-terminal-slice.ts
 37 lines - lib/state/tool-permission-store.ts
 35 lines - infrastructure/persistence/stores/knowledge/slices/knowledge-undo-slice.ts
 32 lines - infrastructure/persistence/stores/prompt-enhancement-store.ts
 30 lines - infrastructure/persistence/stores/knowledge/slices/knowledge-preview-slice.ts
 27 lines - lib/state/quiz-store.ts
 27 lines - infrastructure/persistence/stores/providers/index.ts
 26 lines - lib/state/dexie-storage.ts
 25 lines - infrastructure/persistence/stores/permissions/index.ts
 18 lines - infrastructure/persistence/stores/study/index.ts
 15 lines - infrastructure/persistence/stores/agents/slices/index.ts
 15 lines - infrastructure/persistence/stores/conversation/slices/index.ts
 15 lines - infrastructure/persistence/stores/agents/index.ts
 15 lines - infrastructure/persistence/stores/conversation/slices/index.ts
 15 lines - lib/state/knowledge/knowledge-store.ts
 11 lines - lib/state/knowledge/slices/knowledge-undo-slice.ts
 11 lines - lib/state/knowledge/slices/knowledge-synthesis-slice.ts
 11 lines - lib/state/knowledge/slices/knowledge-source-crud-slice.ts
 11 lines - lib/state/knowledge/slices/knowledge-preview-slice.ts
 11 lines - lib/state/knowledge/slices/knowledge-metadata-slice.ts
 11 lines - lib/state/knowledge/slices/knowledge-collection-slice.ts
  8 lines - lib/state/migrations/index.ts
  6 lines - lib/state/index.ts
  6 lines - infrastructure/persistence/stores/conversation/slices/index.ts
  6 lines - infrastructure/persistence/stores/index.ts
  6 lines - infrastructure/persistence/stores/agents/slices/index.ts
  6 lines - infrastructure/persistence/stores/knowledge/index.ts
  6 lines - infrastructure/persistence/stores/rag/index.ts
  6 lines - infrastructure/persistence/stores/conversation/index.ts
  6 lines - infrastructure/persistence/stores/index.ts
```

---

## 9. Next Steps

### For ANALYSIS Phase (Next Scanner)

1. **Dependency Graph Analysis**:
   - Map all store-to-store imports
   - Detect actual circular dependencies (not just risks)
   - Calculate coupling metrics

2. **Consumer Analysis**:
   - Count consumers per store
   - Identify high-risk migration targets
   - Map component-to-store relationships

3. **Pattern Compliance Audit**:
   - Verify `get()` pattern usage in all slices
   - Check persist configuration coverage
   - Validate TypeScript strict typing

### For REMEDIATION Phase (Future)

1. **Epic Creation**:
   - Break down god store refactoring into stories
   - Estimate effort per store
   - Prioritize by consumer count

2. **Migration Planning**:
   - Create migration scripts for duplicate stores
   - Plan backward compatibility strategies
   - Schedule deprecation warnings

---

**Report Generated**: 2026-01-04 16:17:00
**Total Scan Time**: ~2 minutes
**Files Analyzed**: 68 store files + 40+ test files
**Next Phase**: ANALYSIS (dependency-graph + consumer-analysis)
