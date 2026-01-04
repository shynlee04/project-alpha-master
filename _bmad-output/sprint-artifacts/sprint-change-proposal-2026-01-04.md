# Sprint Change Proposal: Foundation Architecture Refactoring

**Document ID**: SCP-2026-01-04
**Date**: 2026-01-04T21:00:00+07:00
**Author**: BMAD Master Agent
**Status**: PENDING_APPROVAL

---

## 1. Issue Summary

### Problem Statement

The ViaGent platform architecture is currently **fragmented and superficial**. Core workspaces (IDE, Notes, Knowledge) have:
- Broken bidirectional file synchronization
- 17+ duplicate/redundant stores
- 7 "god files" exceeding 5,000 lines
- Incomplete agent tool permission models
- Siloed workspaces with no shared context
- RAG pipeline that doesn't auto-index on file changes

### Discovery Context

This issue was identified during stabilization sprint planning (STAB-24) when analyzing the codetree:
- `src/codetree-for-analysis.md` revealed 978 files across 166 directories
- Critical duplications found in `sync-manager.ts` (2 copies)
- `WorkspaceContext.tsx` exists in 2 locations
- `src/lib/state/` contains legacy facades AND duplicates

### Evidence

| Metric | Current | Target |
|--------|---------|--------|
| Duplicate stores | 17 | 0 |
| God files (>5K lines) | 7 | 0 |
| Sync reliability | ~60% | 99%+ |
| Health score | 68.5/100 | 90/100 |

---

## 2. Impact Analysis

### Epic Impact

| Epic | Impact Level | Description |
|------|--------------|-------------|
| STAB-24 | HIGH | P0 risks still relevant, but must wait for architecture |
| STAB-25 | BLOCKED | Store consolidation depends on new architecture |
| Epic 53 | SUPERSEDED | State consolidation absorbed into ARCH-01 |

### Story Impact

| Story | Current State | Required Action |
|-------|--------------|-----------------|
| STAB-24.1 (localStorage) | READY | Can proceed in parallel |
| STAB-24.2 (IndexedDB quota) | READY | Can proceed in parallel |
| STAB-24.3 (Design tokens) | READY | Can proceed in parallel |
| All STAB-25.x stories | BLOCKED | Wait for ARCH-01 |

### Artifact Conflicts

| Artifact | Current Path | Action |
|----------|--------------|--------|
| sync-manager.ts | `src/lib/filesystem/sync-manager.ts` | DELETE |
| sync-manager.ts | `src/lib/filesystem/sync-manager/sync-manager.ts` | KEEP/REFACTOR |
| WorkspaceContext.tsx | `src/lib/workspace/WorkspaceContext.tsx` | DELETE |
| knowledge-store.ts.backup | `src/lib/state/knowledge-store.ts.backup` | DELETE |
| dexie-db.ts (facade) | `src/lib/state/dexie-db.ts` | DELETE after migration |

### Technical Impact

- **Build size**: Currently 10MB SSR bundle (fixed to 2MB with chunking)
- **Performance**: App lag due to bundle size and re-renders
- **Deployment**: Cloudflare Worker limit (3MB) was exceeding
- **Developer experience**: Unclear which import path to use

---

## 3. Recommended Approach

### Primary Path: **Foundation First Architecture**

This is NOT a rollback or scope reduction. This is a **strategic resequencing** to establish solid foundations before continuing feature work.

#### Phased Execution

```
Phase 1: ARCH-01 Foundation Architecture (4-6 weeks)
├── ARCH-01.1: Unified Sync Manager
├── ARCH-01.2: Complete State Consolidation
├── ARCH-01.3: Workspace Context Unification
├── ARCH-01.4: Agent Tool Permission Matrix
├── ARCH-01.5: RAG Auto-Indexing on Sync
└── ARCH-01.6: Cross-Workspace Context Sharing

Phase 2: P0 Stabilization (2 weeks, parallel with Phase 1)
├── STAB-24.1: Encrypt localStorage Keys
├── STAB-24.2: IndexedDB Quota Handling
└── STAB-24.3: Replace Hardcoded Pixels

Phase 3: Polish & Documentation (1-2 weeks)
├── Update AGENTS.md and CLAUDE.md
├── Generate project-context.md
└── Create developer onboarding guide
```

#### Effort Estimate

| Phase | Stories | Effort (hours) | Duration |
|-------|---------|---------------|----------|
| ARCH-01 | 6 | 240-320 | 4-6 weeks |
| STAB-24 (parallel) | 3 | 44 | 1-2 weeks |
| Documentation | 3 | 24 | 1 week |
| **Total** | 12 | 308-388 | 5-8 weeks |

#### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scope creep | Medium | High | Strict epic boundaries, daily status |
| Breaking changes | High | Medium | Facade pattern for migration |
| Team coordination | Medium | Medium | Clear ownership per story |
| Deadline slip | Medium | Medium | Parallel execution of P0 stories |

---

## 4. Detailed Change Proposals

### Story: ARCH-01.1 - Unified Sync Manager

**Location**: Create `src/infrastructure/sync/`

**Files to DELETE**:
- `src/lib/filesystem/sync-manager.ts`
- `src/lib/filesync/file-sync-service.ts`
- `src/lib/filesync/ide-file-sync-service.ts`
- `src/lib/filesync/notes-file-sync-service.ts`
- `src/lib/filesync/knowledge-file-sync-service.ts`
- `src/lib/filesync/study-file-sync-service.ts`

**Files to CREATE**:
```
src/infrastructure/sync/
├── core/
│   ├── sync-engine.ts
│   ├── sync-types.ts
│   └── sync-events.ts
├── adapters/
│   ├── fsa-adapter.ts
│   ├── idb-adapter.ts
│   └── webcontainer-adapter.ts
├── strategies/
│   ├── bidirectional-sync.ts
│   └── conflict-resolution.ts
└── workspace-bindings/
    ├── ide-binding.ts
    ├── notes-binding.ts
    └── knowledge-binding.ts
```

**Acceptance Criteria**:
- [ ] Single SyncEngine class handles all sync operations
- [ ] FSA adapter correctly reads/writes local files
- [ ] IDB adapter correctly reads/writes IndexedDB
- [ ] Bidirectional sync detects and resolves conflicts
- [ ] All existing sync consumers migrated
- [ ] 0 duplicate sync files remain
- [ ] Integration tests pass

---

### Story: ARCH-01.2 - Complete State Consolidation

**Location**: `src/infrastructure/persistence/stores/`

**Files to DELETE**:
- `src/lib/state/knowledge/` (entire directory)
- `src/lib/state/knowledge-store.ts.backup`
- `src/lib/state/dexie-db.ts` (after migration)
- `src/lib/state/dexie-db-types.ts`
- `src/lib/state/dexie-db-helpers.ts`
- `src/lib/state/dexie-storage.ts`

**Consumer Migration Required**:
```typescript
// OLD (find all occurrences)
import { db } from '@/lib/state/dexie-db'
import { useKnowledgeStore } from '@/lib/state/knowledge'

// NEW
import { db } from '@/infrastructure/persistence'
import { useKnowledgeStore } from '@/infrastructure/persistence/stores'
```

**Acceptance Criteria**:
- [ ] All consumers import from `@/infrastructure/persistence/`
- [ ] `src/lib/state/` contains only `index.ts` (re-export)
- [ ] TypeScript builds with 0 errors
- [ ] All tests pass
- [ ] No runtime errors on page load

---

### Story: ARCH-01.3 - Workspace Context Unification

**Location**: `src/infrastructure/persistence/stores/workspace/`

**Files to DELETE**:
- `src/lib/workspace/WorkspaceContext.tsx`
- `src/lib/workspace/WorkspaceContext.test.tsx`

**Files to CREATE/MODIFY**:
```
src/infrastructure/persistence/stores/workspace/
├── workspace-context.ts      ← Enhanced
├── workspace-provider.tsx    ← Enhanced
├── workspace-types.ts        ← New
└── hooks/
    ├── index.ts              ← New barrel
    ├── useWorkspace.ts       ← Main hook
    ├── useWorkspaceSync.ts   ← Sync status
    └── useWorkspaceAgent.ts  ← Agent selection
```

**Acceptance Criteria**:
- [ ] Single WorkspaceProvider at root
- [ ] All workspace hooks use unified context
- [ ] Transitions between workspaces preserve context
- [ ] No duplicate context files exist

---

### Story: ARCH-01.4 - Agent Tool Permission Matrix

**Location**: `src/infrastructure/persistence/stores/permissions/`

**Files to CREATE/MODIFY**:
```
src/infrastructure/persistence/stores/permissions/
├── index.ts
├── tool-permission-store.ts        ← Enhanced
├── permission-types.ts             ← New
├── yolo-mode-slice.ts              ← New
└── category-approval-slice.ts      ← New
```

**Acceptance Criteria**:
- [ ] YOLO mode toggle in Settings works
- [ ] Category-based approval (files, terminal, knowledge)
- [ ] Real-time tool execution status UI
- [ ] Permission checks in all tool facades
- [ ] Workspace-specific permissions enforced

---

### Story: ARCH-01.5 - RAG Auto-Indexing on Sync

**Location**: `src/infrastructure/rag/` + `src/lib/rag/`

**Integration Points**:
```
SyncEngine (ARCH-01.1)
  emit('file:changed', { path, content })
    → RAGSubscriber
      → DocumentChunker
        → EmbeddingService
          → OramaIndex
```

**Acceptance Criteria**:
- [ ] File sync events trigger RAG indexing
- [ ] Only changed chunks are re-embedded
- [ ] Progress indicator during indexing
- [ ] Deletions remove from index
- [ ] No duplicate embeddings

---

### Story: ARCH-01.6 - Cross-Workspace Context Sharing

**Location**: `src/infrastructure/events/`

**Files to CREATE**:
```
src/infrastructure/events/
├── cross-workspace-event-bus.ts    ← Enhanced
├── workspace-transition-types.ts   ← New
└── hooks/
    └── useWorkspaceTransition.ts   ← New
```

**Acceptance Criteria**:
- [ ] "Open in IDE" action from Notes works
- [ ] "Open in Notes" action from IDE works
- [ ] Active file preserved on transition
- [ ] Agent selection preserved on transition
- [ ] Conversation context preserved on transition

---

## 5. Implementation Handoff

### Scope Classification: **MAJOR**

This proposal requires fundamental architectural changes affecting:
- Core infrastructure (`sync`, `persistence`, `events`)
- All workspaces (IDE, Notes, Knowledge, Study)
- All stores (agents, conversation, rag, etc.)

### Handoff Recipients

| Role | Responsibility |
|------|----------------|
| **BMAD Master** | Orchestration, status tracking |
| **@bmad-bmm-architect** | Architecture decisions, ADRs |
| **@bmad-bmm-dev** | Implementation |
| **@bmad-bmm-tea** | Test coverage |
| **@code-reviewer** | Code review gates |

### Success Criteria

| Metric | Threshold | Measurement |
|--------|-----------|-------------|
| Health Score | ≥85/100 | Architecture analyzer |
| TypeScript Errors | 0 | `pnpm typecheck` |
| Build Size (SSR) | <3MB | Vite build output |
| Test Coverage | ≥70% | Vitest coverage |
| Duplicate Stores | 0 | Static analysis |

### Next Actions

1. **USER AUTHORIZATION REQUIRED**: Approve this Sprint Change Proposal
2. Create `epic-arch-01-foundation-architecture.md` with detailed stories
3. Update `sprint-status.yaml` with new epic
4. Begin parallel execution:
   - Team A: ARCH-01.1 (Sync Manager)
   - Team B: STAB-24.1/24.2 (P0 security)
5. Daily sync on progress

---

## Approval Section

**Reviewed by**: _______________
**Date**: _______________
**Decision**: [ ] APPROVED  [ ] APPROVED WITH CHANGES  [ ] REJECTED
**Comments**: 

---

*Generated by BMAD Master Agent - correct-course workflow*
*Timestamp: 2026-01-04T21:00:00+07:00*
