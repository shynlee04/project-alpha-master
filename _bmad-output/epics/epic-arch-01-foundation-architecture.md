# Epic ARCH-01: Foundation Architecture Refactoring

---
epic_id: ARCH-01
title: Foundation Architecture Refactoring
priority: P0
status: APPROVED
created_date: 2026-01-04
target_completion: 2026-02-14
estimated_hours: 320
owner: bmad-core-bmad-master
phase: Implementation
supersedes:
  - STAB-25 (Store Consolidation)
  - Epic-53 (State Management)
blocks:
  - STAB-26 (God File Splitting)
  - STAB-27 (Performance Polish)
parallel:
  - STAB-24.1 (localStorage Encryption)
  - STAB-24.2 (IndexedDB Quota)
  - STAB-24.3 (Design Tokens)
---

## Epic Overview

**Objective**: Establish a rock-solid foundation by consolidating fragmented systems, enforcing Clean Architecture, and enabling the "Marketing Executive" use case where a non-technical user can create a full-stack landing page through agentic AI with bidirectional file synchronization.

**Success Metrics**:
| Metric | Current | Target |
|--------|---------|--------|
| Health Score | 68.5/100 | 85+/100 |
| Duplicate Stores | 17 | 0 |
| Sync Reliability | ~60% | 99%+ |
| TypeScript Errors | 0 | 0 |
| SSR Bundle Size | 2.0MB | <2.5MB |

---

## Story Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARCH-01: Foundation Architecture                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Week 1-2                                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ ARCH-01.1       │  │ ARCH-01.2       │  │ STAB-24.1-3     │              │
│  │ Unified Sync    │  │ State           │  │ (Parallel)      │              │
│  │ Manager         │  │ Consolidation   │  │ P0 Security     │              │
│  │ [48-64h]        │  │ [32-40h]        │  │ [44h]           │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                              │
│  Week 3-4                                                                    │
│  ┌─────────────────┐  ┌─────────────────┐                                   │
│  │ ARCH-01.3       │  │ ARCH-01.4       │                                   │
│  │ Workspace       │  │ Tool Permission │                                   │
│  │ Unification     │  │ Matrix          │                                   │
│  │ [40-48h]        │  │ [32-40h]        │                                   │
│  └─────────────────┘  └─────────────────┘                                   │
│                                                                              │
│  Week 5-6                                                                    │
│  ┌─────────────────┐  ┌─────────────────┐                                   │
│  │ ARCH-01.5       │  │ ARCH-01.6       │                                   │
│  │ RAG Auto-Index  │  │ Cross-Workspace │                                   │
│  │ on Sync         │  │ Context         │                                   │
│  │ [48-56h]        │  │ [40-48h]        │                                   │
│  └─────────────────┘  └─────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Story Definitions

### ARCH-01.1: Unified Sync Manager

**ID**: ARCH-01.1
**Priority**: P0
**Estimated Hours**: 48-64
**Dependencies**: None
**Blocks**: ARCH-01.2, ARCH-01.5, ARCH-01.6

#### Description

Consolidate 7+ fragmented sync implementations into a single, robust SyncEngine that handles bidirectional synchronization between local files (FSA), IndexedDB, and optionally WebContainer.

#### Acceptance Criteria

- [ ] **AC1**: Single `SyncEngine` class in `src/infrastructure/sync/core/` handles all sync operations
- [ ] **AC2**: FSA adapter correctly reads/writes local files using File System Access API
- [ ] **AC3**: IDB adapter correctly reads/writes to IndexedDB via Dexie
- [ ] **AC4**: Bidirectional sync strategy detects local vs platform changes
- [ ] **AC5**: Conflict resolution strategy handles simultaneous edits
- [ ] **AC6**: All 7 duplicate sync files deleted after migration
- [ ] **AC7**: All existing sync consumers migrated to new paths
- [ ] **AC8**: Integration tests cover happy path and conflict scenarios
- [ ] **AC9**: Sync status emits events for UI consumption

#### Technical Tasks

```yaml
tasks:
  - id: ARCH-01.1.1
    title: Create sync infrastructure folder structure
    description: Create src/infrastructure/sync/ with core/, adapters/, strategies/, workspace-bindings/
    effort: 2h
    
  - id: ARCH-01.1.2
    title: Define SyncEngine interface and types
    description: Create sync-types.ts with SyncOperation, SyncStatus, SyncConflict types
    effort: 4h
    
  - id: ARCH-01.1.3
    title: Implement FSA adapter
    description: Create fsa-adapter.ts that wraps FileSystemAccessAPI operations
    effort: 8h
    
  - id: ARCH-01.1.4
    title: Implement IDB adapter
    description: Create idb-adapter.ts that wraps Dexie operations for file storage
    effort: 6h
    
  - id: ARCH-01.1.5
    title: Implement bidirectional sync strategy
    description: Create bidirectional-sync.ts with change detection and sync direction logic
    effort: 12h
    
  - id: ARCH-01.1.6
    title: Implement conflict resolution
    description: Create conflict-resolution.ts with last-write-wins and manual merge options
    effort: 8h
    
  - id: ARCH-01.1.7
    title: Create SyncEngine class
    description: Implement main SyncEngine that composes adapters and strategies
    effort: 8h
    
  - id: ARCH-01.1.8
    title: Create workspace bindings
    description: Create workspace-specific sync behaviors (IDE, Notes, Knowledge)
    effort: 6h
    
  - id: ARCH-01.1.9
    title: Migrate existing consumers
    description: Update all imports to use new infrastructure path
    effort: 8h
    
  - id: ARCH-01.1.10
    title: Delete deprecated files
    description: Remove 7 duplicate sync files after migration verified
    effort: 2h
    
  - id: ARCH-01.1.11
    title: Write integration tests
    description: Create test suite for sync engine scenarios
    effort: 8h
```

#### Files to Delete

```
src/lib/filesystem/sync-manager.ts              ← DUPLICATE
src/lib/filesync/file-sync-service.ts           ← REPLACED
src/lib/filesync/ide-file-sync-service.ts       ← REPLACED
src/lib/filesync/notes-file-sync-service.ts     ← REPLACED
src/lib/filesync/knowledge-file-sync-service.ts ← REPLACED
src/lib/filesync/study-file-sync-service.ts     ← REPLACED
src/lib/filesync/project-knowledge-sync.ts      ← REPLACED
```

#### Files to Create

```
src/infrastructure/sync/
├── index.ts
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

---

### ARCH-01.2: Complete State Consolidation

**ID**: ARCH-01.2
**Priority**: P0
**Estimated Hours**: 32-40
**Dependencies**: None (can run parallel with ARCH-01.1)
**Blocks**: ARCH-01.3

#### Description

Complete the state management consolidation started in Epic 53 by migrating all remaining consumers to infrastructure paths and removing all facades/duplicates in `src/lib/state/`.

#### Acceptance Criteria

- [ ] **AC1**: All components import from `@/infrastructure/persistence/stores`
- [ ] **AC2**: `src/lib/state/` contains only `index.ts` re-exporting from infrastructure
- [ ] **AC3**: Knowledge store duplicates (`src/lib/state/knowledge/`) deleted
- [ ] **AC4**: Dead files (`.backup`) removed
- [ ] **AC5**: TypeScript builds with 0 errors
- [ ] **AC6**: All unit tests pass
- [ ] **AC7**: No runtime hydration errors

#### Technical Tasks

```yaml
tasks:
  - id: ARCH-01.2.1
    title: Audit all lib/state imports
    description: "Run: grep -rE \"from '@/lib/state\" src/ --include='*.ts*' | wc -l"
    effort: 2h
    
  - id: ARCH-01.2.2
    title: Create migration script
    description: Script to auto-replace import paths
    effort: 4h
    
  - id: ARCH-01.2.3
    title: Migrate IDE store consumers
    description: Update all imports of ide-store.ts
    effort: 6h
    
  - id: ARCH-01.2.4
    title: Migrate knowledge store consumers
    description: Update all imports of knowledge-store
    effort: 6h
    
  - id: ARCH-01.2.5
    title: Migrate dexie-db consumers
    description: Update all imports of dexie-db.ts
    effort: 6h
    
  - id: ARCH-01.2.6
    title: Delete deprecated files
    description: Remove src/lib/state/knowledge/, *.backup files
    effort: 2h
    
  - id: ARCH-01.2.7
    title: Update barrel exports
    description: Ensure infrastructure/persistence/stores/index.ts exports all
    effort: 2h
    
  - id: ARCH-01.2.8
    title: Validate build and tests
    description: Run pnpm typecheck && pnpm test
    effort: 4h
```

#### Files to Delete

```
src/lib/state/knowledge/                    ← Entire directory
src/lib/state/knowledge-store.ts.backup     ← Dead file
src/lib/state/dexie-db.ts                   ← After migration
src/lib/state/dexie-db-types.ts             ← After migration
src/lib/state/dexie-db-helpers.ts           ← After migration
src/lib/state/dexie-storage.ts              ← After migration
src/lib/state/dexie-db-helpers/             ← After migration
```

---

### ARCH-01.3: Workspace Context Unification

**ID**: ARCH-01.3
**Priority**: P0
**Estimated Hours**: 40-48
**Dependencies**: ARCH-01.2
**Blocks**: ARCH-01.6

#### Description

Consolidate two competing WorkspaceContext implementations into a single, unified context provider with consistent hooks.

#### Acceptance Criteria

- [ ] **AC1**: Single `WorkspaceProvider` at application root
- [ ] **AC2**: `useWorkspace()` hook provides consistent API
- [ ] **AC3**: `useWorkspaceSync()` exposes sync status
- [ ] **AC4**: `useWorkspaceAgent()` manages workspace-scoped agent selection
- [ ] **AC5**: Duplicate `WorkspaceContext.tsx` in `src/lib/workspace/` deleted
- [ ] **AC6**: All routes use unified context
- [ ] **AC7**: Transition between workspaces preserves context

#### Technical Tasks

```yaml
tasks:
  - id: ARCH-01.3.1
    title: Audit WorkspaceContext usage
    description: Find all imports of both context implementations
    effort: 2h
    
  - id: ARCH-01.3.2
    title: Design unified context API
    description: Define WorkspaceContextValue interface
    effort: 4h
    
  - id: ARCH-01.3.3
    title: Enhance infrastructure workspace-provider
    description: Add missing features from lib/workspace version
    effort: 8h
    
  - id: ARCH-01.3.4
    title: Create workspace hooks bundle
    description: Create useWorkspace, useWorkspaceSync, useWorkspaceAgent
    effort: 8h
    
  - id: ARCH-01.3.5
    title: Migrate route files
    description: Update all route files to use unified context
    effort: 8h
    
  - id: ARCH-01.3.6
    title: Migrate component consumers
    description: Update all components using old context
    effort: 8h
    
  - id: ARCH-01.3.7
    title: Delete deprecated files
    description: Remove src/lib/workspace/WorkspaceContext.tsx
    effort: 2h
    
  - id: ARCH-01.3.8
    title: Integration testing
    description: Test workspace transitions across all routes
    effort: 6h
```

---

### ARCH-01.4: Agent Tool Permission Matrix

**ID**: ARCH-01.4
**Priority**: P1
**Estimated Hours**: 32-40
**Dependencies**: ARCH-01.2
**Blocks**: None

#### Description

Enhance the agent tool permission system with YOLO mode, category-based approvals, and real-time tool execution UI.

#### Acceptance Criteria

- [ ] **AC1**: YOLO mode toggle in Settings enables auto-approval of all tools
- [ ] **AC2**: Category toggles (files, terminal, knowledge, vision) work
- [ ] **AC3**: Real-time tool execution status shows in chat UI
- [ ] **AC4**: Permission checks enforced in all tool facades
- [ ] **AC5**: Workspace-specific permissions respected
- [ ] **AC6**: Permission changes persist across sessions

#### Technical Tasks

```yaml
tasks:
  - id: ARCH-01.4.1
    title: Design enhanced permission types
    description: Create ToolPermission, YOLOMode, CategoryApproval types
    effort: 4h
    
  - id: ARCH-01.4.2
    title: Create YOLO mode slice
    description: Implement yolo-mode-slice.ts with toggle logic
    effort: 6h
    
  - id: ARCH-01.4.3
    title: Create category approval slice
    description: Implement category-approval-slice.ts
    effort: 6h
    
  - id: ARCH-01.4.4
    title: Add Settings UI components
    description: Create YOLO toggle, category switches in Settings
    effort: 8h
    
  - id: ARCH-01.4.5
    title: Create ToolExecutionIndicator component
    description: Real-time tool status in chat UI
    effort: 6h
    
  - id: ARCH-01.4.6
    title: Wire permission checks
    description: Add checks to all tool facades
    effort: 6h
    
  - id: ARCH-01.4.7
    title: Testing
    description: Test permission flows end-to-end
    effort: 4h
```

---

### ARCH-01.5: RAG Auto-Indexing on Sync

**ID**: ARCH-01.5
**Priority**: P1
**Estimated Hours**: 48-56
**Dependencies**: ARCH-01.1 (SyncEngine with events)
**Blocks**: None

#### Description

Wire the RAG pipeline to automatically re-index documents when files are synchronized, including incremental chunking and background embedding.

#### Acceptance Criteria

- [ ] **AC1**: File sync events trigger RAG indexing
- [ ] **AC2**: Only changed chunks are re-embedded (incremental)
- [ ] **AC3**: Progress indicator shows during background indexing
- [ ] **AC4**: File deletions remove entries from index
- [ ] **AC5**: No duplicate embeddings in index
- [ ] **AC6**: Knowledge workspace reflects changes in real-time

#### Technical Tasks

```yaml
tasks:
  - id: ARCH-01.5.1
    title: Define sync-to-rag event contract
    description: Create events for file:created, file:updated, file:deleted
    effort: 4h
    
  - id: ARCH-01.5.2
    title: Create RAG subscription service
    description: Service that listens to sync events
    effort: 8h
    
  - id: ARCH-01.5.3
    title: Implement incremental chunking
    description: Detect changed sections, only re-chunk those
    effort: 12h
    
  - id: ARCH-01.5.4
    title: Implement incremental embedding
    description: Only embed new/changed chunks
    effort: 8h
    
  - id: ARCH-01.5.5
    title: Handle file deletions
    description: Remove chunks and embeddings on file delete
    effort: 6h
    
  - id: ARCH-01.5.6
    title: Create background progress UI
    description: Show indexing progress in status bar
    effort: 6h
    
  - id: ARCH-01.5.7
    title: Integration testing
    description: Test sync → chunk → embed → search flow
    effort: 8h
```

---

### ARCH-01.6: Cross-Workspace Context Sharing

**ID**: ARCH-01.6
**Priority**: P1
**Estimated Hours**: 40-48
**Dependencies**: ARCH-01.1, ARCH-01.3
**Blocks**: None

#### Description

Enable seamless context sharing when transitioning between workspaces, including file state, agent selection, and conversation context.

#### Acceptance Criteria

- [ ] **AC1**: "Open in IDE" from Notes opens file at same position
- [ ] **AC2**: "Open in Notes" from IDE opens file in editor
- [ ] **AC3**: Active file preserved on workspace transition
- [ ] **AC4**: Agent selection preserved on transition
- [ ] **AC5**: Conversation context available in destination workspace
- [ ] **AC6**: Deep links with context work (URL with file + workspace)

#### Technical Tasks

```yaml
tasks:
  - id: ARCH-01.6.1
    title: Define WorkspaceTransition types
    description: Create interface for transition context
    effort: 4h
    
  - id: ARCH-01.6.2
    title: Create transition context store
    description: Persist transition context in session storage
    effort: 6h
    
  - id: ARCH-01.6.3
    title: Add "Open in X" actions
    description: Create menu actions for cross-workspace opening
    effort: 8h
    
  - id: ARCH-01.6.4
    title: Wire context preservation
    description: Save/restore file position, agent, conversation
    effort: 12h
    
  - id: ARCH-01.6.5
    title: Implement deep linking
    description: URL schema for workspace + file + context
    effort: 8h
    
  - id: ARCH-01.6.6
    title: Integration testing
    description: Test all transition scenarios
    effort: 8h
```

---

## Validation Checklist

### Before Story Start
- [ ] Story requirements understood
- [ ] Dependencies completed or in parallel safe zone
- [ ] Technical approach documented
- [ ] Estimate validated

### During Implementation
- [ ] Following Clean Architecture principles
- [ ] TypeScript strict mode enabled
- [ ] Tests written for new code
- [ ] No new console errors

### After Story Completion
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Sprint status updated

---

## Agent Handoffs

### Story Assignment

| Story | Primary Agent | Reviewer |
|-------|--------------|----------|
| ARCH-01.1 | @bmad-bmm-dev | @bmad-bmm-architect |
| ARCH-01.2 | @bmad-bmm-dev | @code-reviewer |
| ARCH-01.3 | @bmad-bmm-dev | @bmad-bmm-architect |
| ARCH-01.4 | @bmad-bmm-ux-designer + @bmad-bmm-dev | @code-reviewer |
| ARCH-01.5 | @bmad-bmm-dev | @bmad-bmm-tea |
| ARCH-01.6 | @bmad-bmm-dev | @bmad-bmm-architect |

### Handoff Template

```markdown
## Handoff to {Agent Mode}
**Task**: {Story ID} - {Story Title}
**Context Files**: 
- {List relevant files}
**Acceptance Criteria**: 
- {Copy from story}
**Output Location**: src/infrastructure/{...}
**Return via**: Report to @bmad-core-bmad-master with completion summary
```

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing functionality | High | High | Comprehensive test coverage, staged rollout |
| Scope creep | Medium | High | Strict story boundaries, daily standups |
| Consumer migration incomplete | Medium | Medium | Automated grep checks, facade monitoring |
| Performance regression | Low | High | Benchmark before/after, profiling |

---

*Epic created by @bmad-core-bmad-master*
*Timestamp: 2026-01-04T21:00:00+07:00*
