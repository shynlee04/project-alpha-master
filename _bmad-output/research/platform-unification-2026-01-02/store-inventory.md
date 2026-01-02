---
date: 2026-01-02
time: 21:20:00
phase: Phase 0 - Gap Analysis
story: 51-0-comprehensive-codebase-audit
team: Team A
agent_mode: bmad-core-bmad-master
iteration: 1060
---

# Store Inventory & Analysis

## Executive Summary

This document catalogs all 47 store files identified in the codebase, analyzes their dependencies, identifies duplications, and proposes a consolidation strategy.

### Key Findings

| Metric | Count |
|--------|-------|
| **Total Store Files** | 47 |
| **Zustand Imports** | 58 files |
| **Dexie Imports** | 22 files |
| **Store Directories** | 2 main (`src/stores`, `src/infrastructure/persistence/stores`) + scattered |
| **Provider-related Files** | 26 |
| **Conversation-related Files** | 28+ |
| **Agent-related Files** | 30+ |
| **Workspace-related Files** | 30+ |

---

## Store File Inventory

### 1. Infrastructure Persistence Stores (`src/infrastructure/persistence/stores/`)

**Primary Location - 20+ stores**

#### Root Level Stores
| File | Purpose | Zustand | Dexie | Status |
|------|---------|---------|-------|--------|
| `use-app-store.ts` | Main app state container | ✅ | ❌ | Core |
| `auto-approve-store.ts` | Tool auto-approval state | ✅ | ❌ | Active |
| `canvas-store.ts` | Knowledge canvas state | ✅ | ✅ | Active |
| `conversation-auto-restore.ts` | Session restore | ✅ | ❌ | Active |
| `flashcard-store.ts` | Flashcard state | ✅ | ✅ | Active |
| `hub-store.ts` | Hub/Dashboard state | ✅ | ❌ | Active |
| `layout-store.ts` | Panel layout state | ✅ | ❌ | Active |
| `navigation-store.ts` | Navigation state | ✅ | ❌ | Active |
| `openai-compatible-store.ts` | OpenAI compat state | ✅ | ❌ | Active |
| `prompt-enhancement-store.ts` | Prompt enhancement | ✅ | ❌ | Active |
| `quiz-history-store.ts` | Quiz history | ✅ | ✅ | Active |
| `statusbar-store.ts` | Status bar state | ✅ | ❌ | Active |
| `study-store.ts` | Study session state | ✅ | ✅ | Active |
| `synthesis-store.ts` | Synthesis state | ✅ | ❌ | Active |

#### Providers (`src/infrastructure/persistence/stores/providers/`)
| File | Purpose | TypeScript Errors |
|------|---------|-------------------|
| `index.ts` | Barrel export | None |
| `types.ts` | Type definitions | None |
| `provider-crud-slice.ts` | CRUD operations | Possible |
| `provider-models-slice.ts` | Model loading | Possible |
| `provider-utils-slice.ts` | Utility functions | Possible |
| `migrate-api-keys-to-vault.ts` | Migration logic | Errors |
| `migration-backup.ts` | Backup logic | None |
| `use-migration-state.ts` | Migration state | None |

#### Agents (`src/infrastructure/persistence/stores/agents/`)
| File | Purpose | TypeScript Errors |
|------|---------|-------------------|
| `index.ts` | Barrel export | None |
| `types.ts` | Type definitions | None |
| `agent-selection-store.ts` | Agent selection | Possible |
| `slices/agent-crud-slice.ts` | CRUD operations | None |
| `slices/agent-workspace-bindings-slice.ts` | Workspace bindings | None |
| `slices/agent-validation-slice.ts` | Validation | None |
| `slices/agent-events-slice.ts` | Event emissions | None |
| `slices/agent-utils-slice.ts` | Utilities | None |

#### Conversation (`src/infrastructure/persistence/stores/conversation/`)
| File | Purpose | TypeScript Errors |
|------|---------|-------------------|
| `index.ts` | Barrel export | None |
| `types.ts` | Type definitions | Yes - schema |
| `conversation-types.ts` | Additional types | Yes |
| `conversation-store.ts` | Core store | Yes |
| `useConversationStore.ts` | Hook wrapper | Yes - 8+ errors |
| `conversation-helpers.ts` | Helper functions | Yes - scrollPosition |
| `conversation-events-slice.ts` | Event emissions | None |
| `conversation-metadata-slice.ts` | Metadata handling | None |
| `conversation-validation-slice.ts` | Validation | None |
| `conversation-utils-slice.ts` | Utilities | None |
| `message-crud-slice.ts` | Message CRUD | None |
| `thread-management-slice.ts` | Thread handling | None |
| `migration/conversation-migration.ts` | Migration | Yes - type errors |
| `slices/` | 6 additional slice files | None |

#### RAG (`src/infrastructure/persistence/stores/rag/`)
| File | Purpose | TypeScript Errors |
|------|---------|-------------------|
| `rag-store.ts` | Main RAG store | None |
| `rag-voice-slice.ts` | Voice features | None |
| `rag-index-slice.ts` | Index management | None |
| `rag-chunking-slice.ts` | Chunking logic | None |
| `rag-search-slice.ts` | Search operations | None |

#### Events (`src/infrastructure/persistence/stores/events/`)
| File | Purpose | TypeScript Errors |
|------|---------|-------------------|
| `event-status-store.ts` | Event status | Yes - unused vars |

### 2. Library State Stores (`src/lib/state/`)

**Secondary Location - 5 stores**

| File | Purpose | Zustand | Dexie | Duplicate? |
|------|---------|---------|-------|-----------|
| `ide-store.ts` | IDE state | ✅ | ❌ | Partial with workspace |
| `knowledge-store.ts` | Knowledge state | ✅ | ❌ | Active |
| `quiz-store.ts` | Quiz state | ✅ | ✅ | Overlaps quiz-history |
| `workspace-store.ts` | Workspace state | ✅ | ❌ | Active |
| `tool-permission-store.ts` | Tool permissions | ✅ | ❌ | Active |

### 3. Library Workspace Stores (`src/lib/workspace/`)

**Tertiary Location - 6 stores**

| File | Purpose | Zustand | Dexie | Duplicate? |
|------|---------|---------|-------|-----------|
| `conversation-store.ts` | Conversation | ⚠️ | ❌ | **DUPLICATE** |
| `file-sync-status-store.ts` | Sync status | ✅ | ❌ | Active |
| `threads-store.ts` | Threads | ⚠️ | ❌ | Overlaps conversation |
| `ide-state-store.ts` | IDE state | ✅ | ❌ | **DUPLICATE** |
| `project-store.ts` | Project state | ✅ | ❌ | Active |

### 4. Library Notes Stores (`src/lib/notes/`)

**Notes-specific - 3 stores**

| File | Purpose | Zustand | Dexie | Status |
|------|---------|---------|-------|--------|
| `note-store.ts` | Note content | ✅ | ❌ | Active |
| `note-navigation-store.ts` | Note navigation | ✅ | ❌ | Active |
| `ai-prompt-store.ts` | AI prompts | ✅ | ❌ | Active |

---

## Critical Duplications

### High Priority Duplications

| Domain | Files | Issue |
|--------|-------|-------|
| **Conversation** | `lib/workspace/conversation-store.ts` + `infrastructure/.../conversation/` | Two separate conversation systems |
| **IDE State** | `lib/state/ide-store.ts` + `lib/workspace/ide-state-store.ts` | Parallel IDE state management |
| **Threads** | `lib/workspace/threads-store.ts` + conversation thread management | Thread handling split |
| **Quiz** | `lib/state/quiz-store.ts` + `infrastructure/.../quiz-history-store.ts` | Quiz state fragmented |

---

## TypeScript Error Analysis

Based on `pnpm tsc --noEmit` output:

### Conversation Domain Errors (18+)

| File | Error | Line | Issue |
|------|-------|------|-------|
| `useConversationStore.ts` | TS2339 | 110 | `_hasHydrated` not in type |
| `useConversationStore.ts` | TS2339 | 175 | `_hasHydrated` not in type |
| `useConversationStore.ts` | TS2339 | 189 | `pendingToolApprovals` missing |
| `useConversationStore.ts` | TS2345 | 85 | Storage type mismatch |
| `useConversationStore.ts` | TS2353 | 208 | Unknown property |
| `conversation-helpers.ts` | TS2339 | 82 | `scrollPosition` missing |
| `conversation-migration.ts` | TS2353 | 335 | `lastActiveAt` not exists |
| `conversation-migration.ts` | TS2322 | 354-372 | String/number mismatch |

### Provider Domain Errors (3)

| File | Error | Line | Issue |
|------|-------|------|-------|
| `migrate-api-keys-to-vault.test.ts` | TS2459 | 17 | Export not found |
| `migrate-api-keys-to-vault.test.ts` | TS6133 | 23, 33 | Unused vars |

### Events Domain Errors (3)

| File | Error | Line | Issue |
|------|-------|------|-------|
| `event-status-store.ts` | TS6133 | 14, 149, 238 | Unused imports/vars |

---

## Dependency Graph

### Provider Dependencies
```
useAppStore
  └── useProviderStore (composed from slices)
        ├── provider-crud-slice
        ├── provider-models-slice
        └── provider-utils-slice
              └── credential-vault
                    └── Dexie (encrypted keys)
```

### Agent Dependencies
```
useAppStore
  └── useAgentsStore (composed from slices)
        ├── agent-crud-slice
        ├── agent-workspace-bindings-slice
        ├── agent-validation-slice
        └── agent-events-slice
              └── EventEmitter3
```

### Conversation Dependencies
```
useConversationStore (PRIMARY - infrastructure/)
  ├── slices/create-metadata-slice
  ├── slices/create-message-slice
  ├── slices/create-thread-crud-slice
  ├── slices/create-hierarchy-slice
  ├── slices/create-context-window-slice
  └── slices/create-project-state-slice
        └── Dexie (persistence)

conversation-store (LEGACY - lib/workspace/)
  └── Simple Zustand store (NO PERSISTENCE)
      └── Should be DEPRECATED
```

### Workspace Dependencies
```
WorkspaceContext (React Context)
  └── useIDEStore (lib/state/)
        ├── useProjectStore (lib/workspace/)
        ├── useSyncStatusStore (lib/workspace/)
        └── useWorkspaceStore (lib/state/)
```

---

## Consolidation Plan

### Phase 1: Provider Consolidation

**Target**: Single `useProviderStore` in `infrastructure/persistence/stores/providers/`

**Actions**:
1. ✅ Already consolidated as slices (crud, models, utils)
2. Fix TypeScript errors in migration files
3. Ensure reactivity across all workspaces
4. Remove any legacy provider references

### Phase 2: Agent Consolidation

**Target**: Single `useAgentsStore` in `infrastructure/persistence/stores/agents/`

**Actions**:
1. ✅ Already consolidated as slices
2. Verify workspace bindings work properly
3. Ensure selection store is properly typed

### Phase 3: Conversation Consolidation

**Target**: Single `useConversationStore` in `infrastructure/persistence/stores/conversation/`

**Actions**:
1. Fix all 18+ TypeScript errors
2. Add `_hasHydrated` to CombinedConversationState
3. Add `scrollPosition` to ConversationState
4. Add `pendingToolApprovals` to state
5. Fix timestamp type mismatches
6. **DEPRECATE** `lib/workspace/conversation-store.ts`
7. **DEPRECATE** `lib/workspace/threads-store.ts`

### Phase 4: Workspace State Consolidation

**Target**: Unified WorkspaceContext consuming all stores

**Actions**:
1. Fix IDE state duplication (`lib/state/` vs `lib/workspace/`)
2. Create unified workspace context provider
3. Wire all workspaces (IDE, Knowledge, Notes, Study) to same context

### Phase 5: Quiz/Study Consolidation

**Target**: Single study domain in `infrastructure/persistence/stores/study-store.ts`

**Actions**:
1. Merge quiz-store and quiz-history-store
2. Consolidate flashcard state

---

## Migration Priority Order

Based on dependency analysis:

1. **Provider Store** - Foundation for agents
2. **Agent Store** - Depends on providers
3. **Conversation Store** - Most TypeScript errors, critical path
4. **Workspace State** - Integrates all above
5. **IDE Workspace** - First workspace to wire
6. **Knowledge Workspace** - RAG pipeline
7. **Notes Workspace** - BlockNote integration
8. **Study Workspace** - Flashcard/Quiz

---

## Files to Deprecate

After consolidation, these files should be removed:

| File | Reason |
|------|--------|
| `src/lib/workspace/conversation-store.ts` | Replaced by infrastructure version |
| `src/lib/workspace/threads-store.ts` | Merged into conversation |
| `src/lib/workspace/ide-state-store.ts` | Merged into workspace context |
| `src/lib/state/quiz-store.ts` | Merged into study-store |

---

## Next Steps

1. **Story 51-1**: Fix Provider Store TypeScript errors
2. **Story 51-2**: Validate Agent Store slices
3. **Story 51-3**: Fix Conversation Store 18+ errors (CRITICAL)
4. **Story 51-4**: Create unified WorkspaceContext

---

*Document generated by BMAD Master - Ralph Loop Iteration 1060*
*Story: 51-0-comprehensive-codebase-audit*
