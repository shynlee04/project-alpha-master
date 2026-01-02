---
date: 2026-01-02
time: 21:25:00
phase: Phase 0 - Gap Analysis
story: 51-0-comprehensive-codebase-audit
team: Team A
agent_mode: bmad-core-bmad-master
iteration: 1060
---

# Store Consolidation Plan

## Executive Summary

This plan defines the systematic migration strategy for consolidating 47 fragmented stores into a unified state management architecture.

---

## Target Architecture

### After Consolidation

```
src/infrastructure/persistence/stores/
├── index.ts                          # Master barrel export
├── types.ts                          # Shared types
├── hydration-manager.ts              # Hydration utilities
├── schema-migrations.ts              # Migration logic
│
├── providers/                        # ✅ Already consolidated
│   ├── index.ts                      # useProviderStore export
│   └── ... (slices)
│
├── agents/                           # ✅ Already consolidated
│   ├── index.ts                      # useAgentsStore export
│   └── ... (slices)
│
├── conversation/                     # 🔴 Needs TypeScript fixes
│   ├── index.ts                      # useConversationStore export
│   └── ... (slices)
│
├── workspace/                        # 🆕 Create unified workspace
│   ├── index.ts                      # useWorkspaceStore export
│   ├── workspace-context.ts          # React context provider
│   ├── workspace-types.ts            # Workspace types
│   └── workspace-bindings-slice.ts   # Cross-workspace bindings
│
├── rag/                              # ✅ Already consolidated
│   ├── index.ts                      # useRAGStore export
│   └── ... (slices)
│
├── study/                            # Merge quiz + flashcard
│   ├── index.ts                      # useStudyStore export
│   ├── study-store.ts                # Merged store
│   ├── flashcard-slice.ts
│   └── quiz-slice.ts
│
├── notes/                            # 🆕 Move from lib/notes
│   ├── index.ts                      # useNotesStore export
│   ├── note-store.ts
│   ├── note-navigation-slice.ts
│   └── ai-prompt-slice.ts
│
├── canvas-store.ts                   # Keep as-is
├── hub-store.ts                      # Keep as-is
├── layout-store.ts                   # Keep as-is
├── navigation-store.ts               # Keep as-is
└── statusbar-store.ts                # Keep as-is
```

### Deprecated Locations (After Migration)

```
src/lib/workspace/                    # DEPRECATE most stores
├── conversation-store.ts             # → DELETE (use infrastructure/)
├── threads-store.ts                  # → DELETE (merged)
├── ide-state-store.ts                # → DELETE (merged)
├── project-store.ts                  # → KEEP or merge
├── file-sync-status-store.ts         # → KEEP
└── ... (keep non-store files)

src/lib/state/                        # DEPRECATE most stores
├── ide-store.ts                      # → DELETE (merged)
├── quiz-store.ts                     # → DELETE (merged)
├── knowledge-store.ts                # → KEEP (domain-specific)
├── workspace-store.ts                # → DELETE (merged)
└── tool-permission-store.ts          # → KEEP

src/lib/notes/                        # MOVE stores
├── note-store.ts                     # → MOVE to infrastructure/
├── note-navigation-store.ts          # → MOVE to infrastructure/
└── ai-prompt-store.ts                # → MOVE to infrastructure/
```

---

## Migration Strategy

### Phase 1: Fix TypeScript Errors First (Critical Path)

**Priority**: CRITICAL - Blocks all other work

#### Step 1.1: Fix Conversation Store Errors

| Error ID | File | Fix Strategy |
|----------|------|--------------|
| CONV-01 | `useConversationStore.ts` | Add `_hasHydrated` to `CombinedConversationState` |
| CONV-02 | `useConversationStore.ts` | Fix `PersistStorage` type with proper Zustand types |
| CONV-03 | `useConversationStore.ts` | Add `pendingToolApprovals` to state |
| CONV-04 | `conversation-helpers.ts` | Add `scrollPosition` to `ConversationState` |
| CONV-05 | `conversation-migration.ts` | Fix `lastActiveAt` type (remove or add to type) |
| CONV-06 | `conversation-migration.ts` | Fix timestamp types (string → number conversion) |

#### Step 1.2: Fix Provider Store Errors

| Error ID | File | Fix Strategy |
|----------|------|--------------|
| PROV-01 | `migrate-api-keys-to-vault.test.ts` | Fix import or mock `ProviderConfig` |
| PROV-02 | Test files | Remove unused variables |

#### Step 1.3: Fix Event Store Errors

| Error ID | File | Fix Strategy |
|----------|------|--------------|
| EVT-01 | `event-status-store.ts` | Remove unused `StoreApi` import |
| EVT-02 | `event-status-store.ts` | Use or remove `get` parameter |
| EVT-03 | `event-status-store.ts` | Use or remove `event` parameter |

---

### Phase 2: Deprecate Duplicate Stores

**Strategy**: Migration with backwards compatibility

#### Step 2.1: Conversation Store Migration

```typescript
// src/lib/workspace/conversation-store.ts
// BEFORE: Independent store
export const useConversationStore = create<ConversationState>(...);

// AFTER: Re-export from infrastructure
/**
 * @deprecated Use import from '@/infrastructure/persistence/stores/conversation' instead
 */
export { useConversationStore } from '@/infrastructure/persistence/stores/conversation';
```

#### Step 2.2: IDE State Migration

```typescript
// src/lib/workspace/ide-state-store.ts
// BEFORE: Independent store

// AFTER: Re-export from unified workspace
/**
 * @deprecated Use import from '@/infrastructure/persistence/stores/workspace' instead
 */
export { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace';
```

---

### Phase 3: Create Unified Workspace Context

**New Files to Create**:

```typescript
// src/infrastructure/persistence/stores/workspace/workspace-context.ts

import { createContext, useContext, ReactNode } from 'react';
import { useProviderStore } from '../providers';
import { useAgentsStore } from '../agents';
import { useConversationStore } from '../conversation';
import { useRAGStore } from '../rag';

interface WorkspaceContextValue {
  // Active workspace
  activeWorkspace: 'ide' | 'knowledge' | 'notes' | 'study' | 'hub';
  setActiveWorkspace: (workspace: string) => void;
  
  // Project context
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  
  // Provider access
  providers: ReturnType<typeof useProviderStore>;
  
  // Agent access
  agents: ReturnType<typeof useAgentsStore>;
  
  // Conversation access
  conversations: ReturnType<typeof useConversationStore>;
  
  // RAG access
  rag: ReturnType<typeof useRAGStore>;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  // Implementation...
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within WorkspaceProvider');
  }
  return context;
}
```

---

### Phase 4: Wire Workspaces

#### Step 4.1: IDE Workspace

```typescript
// src/routes/ide.tsx or src/presentation/workspaces/ide/
import { useWorkspaceContext } from '@/infrastructure/persistence/stores/workspace';

export function IDEWorkspace() {
  const { providers, agents, conversations, activeProjectId } = useWorkspaceContext();
  // Use unified state
}
```

#### Step 4.2: Knowledge Workspace

```typescript
// src/routes/knowledge.tsx
import { useWorkspaceContext } from '@/infrastructure/persistence/stores/workspace';

export function KnowledgeWorkspace() {
  const { rag, activeProjectId } = useWorkspaceContext();
  // Use unified state
}
```

#### Step 4.3: Notes Workspace

```typescript
// src/routes/notes.tsx
import { useWorkspaceContext } from '@/infrastructure/persistence/stores/workspace';
import { useNotesStore } from '@/infrastructure/persistence/stores/notes';

export function NotesWorkspace() {
  const { activeProjectId, agents } = useWorkspaceContext();
  const notes = useNotesStore();
  // Use unified state
}
```

#### Step 4.4: Study Workspace

```typescript
// src/routes/study.tsx
import { useWorkspaceContext } from '@/infrastructure/persistence/stores/workspace';
import { useStudyStore } from '@/infrastructure/persistence/stores/study';

export function StudyWorkspace() {
  const { activeProjectId, rag } = useWorkspaceContext();
  const study = useStudyStore();
  // Use unified state
}
```

---

## Validation Checkpoints

### After Each Phase

1. **TypeScript Check**: `pnpm tsc --noEmit` must pass
2. **Dev Server Check**: `pnpm dev` must start
3. **Build Check**: `pnpm build` must succeed
4. **Test Check**: Relevant tests must pass

### After All Phases

1. **All 4 workspaces accessible**
2. **Provider → Agent → Chat flow works**
3. **Project context shared across workspaces**
4. **No duplicate store imports**
5. **12-level validation passed**

---

## Rollback Strategy

If migration breaks:

1. **Git checkpoint**: Before each phase, create commit
2. **Feature flag**: Wrap new stores in feature flags
3. **Parallel mode**: Keep old stores working alongside new
4. **Gradual adoption**: Migrate one workspace at a time

---

## Implementation Tracking

| Phase | Story | Status | Started | Completed |
|-------|-------|--------|---------|-----------|
| 0 | 51-0 Codebase Audit | ✅ | 2026-01-02 | 2026-01-02 |
| 1 | 51-1 Provider Fix | 🔲 | - | - |
| 1 | 51-2 Agent Fix | 🔲 | - | - |
| 1 | 51-3 Conversation Fix | 🔲 | - | - |
| 1 | 51-4 Workspace Binding | 🔲 | - | - |
| 2 | 51-5 IDE Wiring | 🔲 | - | - |
| 2 | 51-6 Knowledge Wiring | 🔲 | - | - |
| 2 | 51-7 Notes Wiring | 🔲 | - | - |
| 2 | 51-8 Study Wiring | 🔲 | - | - |
| 3 | 51-9 Use Cases | 🔲 | - | - |
| 3 | 51-10 UX Fixes | 🔲 | - | - |
| 3 | 51-11 Cleanup | 🔲 | - | - |

---

*Document generated by BMAD Master - Ralph Loop Iteration 1060*
*Story: 51-0-comprehensive-codebase-audit*
