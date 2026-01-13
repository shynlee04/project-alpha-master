# Architectural Remediation Strategic Plan
**Date**: 2026-01-16
**Status**: PLANNING - Awaiting Approval
**Priority**: CRITICAL (Blocks IDE and Notes functionality)

---


# YOUR PROPOSAL
---
# Find store/state/persistence directories
$ find ./src -type d -name "*store*" -o -name "*state*" -o -name "*persist*" 2>/dev/null | head -50
./src/lib/snippets/snippet-store
./src/lib/workspace/fsa-persistence.ts.bak3
./src/lib/workspace/fsa-persistence.ts.bak2
./src/lib/workspace/project-store
./src/lib/workspace/fsa-persistence.ts
./src/lib/workspace/file-sync-status-store
./src/lib/filesystem/file-snapshot-store
./src/lib/knowledge/graph/graph-persistence.ts
./src/lib/workflow/builder/slices/workflow-persistence-slice.ts
./src/lib/persistence
…
Click to expand
Now I have a complete picture. Let me synthesize all findings into a comprehensive diagnosis and strategic plan.
---
🔴 COMPREHENSIVE DIAGNOSIS & STRATEGIC REMEDIATION PLAN
Executive Summary
Your codebase has critical architectural debt at the foundation level. The 4 diagnostic scans revealed:
| Category | Severity | Finding |
|----------|----------|---------|
| State/Stores | 🔴 CRITICAL | 59 store-related files, 20+ active Zustand stores, fragmented across src/lib/ and src/infrastructure/ |
| DexieDB | 🔴 CRITICAL | 11 separate IndexedDB databases, consolidation incomplete, race conditions between sync/async |
| Routing | 🔴 CRITICAL | useWorkspaceAccess is BROKEN (returns hardcoded empty), inconsistent project validation |
| Entity Naming | 🟡 HIGH | project vs workspace terminology collision, ID generation inconsistent |
| Duplications | 🟡 HIGH | Same files in both lib/ and infrastructure/ (local-fs-adapter, file-sync-status-store, project-store) |
---
🏗️ THE PLAN: 5-Phase Foundation Remediation
PHASE 0: Stabilization (Before anything else)
Goal: Make Notes and IDE minimally usable while we remediate
Duration: 1-2 stories (immediate)
| Step | Action | Why |
|------|--------|-----|
| 0.1 | Fix useWorkspaceAccess hook | Currently returns hardcoded empty - this breaks ALL workspace entry |
| 0.2 | Disable broken auto-save temporarily | Stop the bleeding - crashes and loops |
| 0.3 | Add emergency fallback for DexieDB failures | Graceful degradation, not crashes |
---
PHASE 1: The Single Source of Truth Protocol (SSOT)
Goal: Establish ONE authoritative location for each concern
Duration: 3-4 stories
BEFORE (Current Chaos):
├── src/lib/workspace/project-store.ts         ← FACADE
├── src/lib/workspace/project-store/           ← SLICES
├── src/infrastructure/persistence/stores/project/  ← ALSO SLICES
└── Multiple Dexie table access patterns
AFTER (Single Source):
└── src/infrastructure/persistence/stores/project/  ← ONLY LOCATION
    ├── useProjectStore.ts                      ← Single export
    ├── project-crud-slice.ts
    ├── project-bindings-slice.ts
    └── types.ts
| Step | Action | Files Affected |
|------|--------|----------------|
| 1.1 | Consolidate Project Store | Merge src/lib/workspace/project-store/ → src/infrastructure/persistence/stores/project/ |
| 1.2 | Consolidate File Sync Store | Same pattern for file-sync-status-store |
| 1.3 | Consolidate File Snapshot Store | Same pattern |
| 1.4 | Remove src/lib/filesystem duplicates | Delete src/lib/filesystem/local-fs-adapter.ts (keep infrastructure one) |
| 1.5 | Create facade re-exports | Old import paths → new canonical paths |
---
PHASE 2: Database Consolidation & State Contracts
Goal: Single Dexie database, clear sync/async contracts
Duration: 4-5 stories
2A: Database Consolidation
BEFORE:
├── ViaGentDatabase (41 tables)
├── FlashcardDatabase        ← SEPARATE
├── StudyDatabase            ← SEPARATE
├── QuizDatabase             ← SEPARATE
├── KnowledgeCanvasDB        ← SEPARATE
├── AudioDatabase            ← SEPARATE
├── ... 5 more ...
AFTER:
└── ViaGentDatabase (consolidated, all tables)
    └── Migration from legacy DBs complete
| Step | Action |
|------|--------|
| 2.1 | Complete db-consolidation-service.ts implementation |
| 2.2 | Migrate FlashcardDB → ViaGentDatabase.flashcards |
| 2.3 | Migrate StudyDB → ViaGentDatabase.studySessions |
| 2.4 | Add explicit sync/async contracts for Zustand ↔ Dexie |
2B: State Contract Pattern
// NEW PATTERN: Explicit sync/async contract
const useProjectStore = create<ProjectState>((set, get) => ({
  // SYNC state (UI reads this)
  projects: {},
  
  // ASYNC action with explicit persistence
  async createProject(input) {
    const project = generateProject(input);
    
    // Step 1: Persist FIRST (fail-fast)
    await db.projects.put(project);
    
    // Step 2: Update Zustand AFTER persistence succeeds
    set((state) => ({ projects: { ...state.projects, [project.id]: project } }));
    
    return project;
  }
}));
---
PHASE 3: Routing & Entry Point Regulation
Goal: Clear device-based routing contracts, consistent error handling
Duration: 3-4 stories
3A: Device Detection Contract
// Platform contract
interface PlatformContract {
  canAccessFSA: boolean;      // File System Access API
  canAccessIDE: boolean;      // IDE workspace
  defaultWorkspace: WorkspaceType;  // Where to redirect
  storageType: 'fsa' | 'indexeddb';
}
// Platform routing
function getPlatformContract(): PlatformContract {
  if (isDesktop && supportsFSA) {
    return { canAccessFSA: true, canAccessIDE: true, defaultWorkspace: 'ide', storageType: 'fsa' };
  }
  return { canAccessFSA: false, canAccessIDE: false, defaultWorkspace: 'notes', storageType: 'indexeddb' };
}
3B: Route Guard Standardization
// EVERY workspace route follows this pattern
export const Route = createFileRoute('/$workspace/$projectId')({
  beforeLoad: async ({ params, context }) => {
    const { workspace, projectId } = params;
    const platform = getPlatformContract();
    
    // 1. Platform check
    if (workspace === 'ide' && !platform.canAccessIDE) {
      throw redirect({ to: '/notes/$projectId', params: { projectId } });
    }
    
    // 2. Project validation (with retry)
    const project = await validateProject(projectId, { retries: 3 });
    if (!project) {
      throw redirect({ to: '/hub', search: { error: 'project-not-found' } });
    }
    
    // 3. Pass validated context
    return { project, platform };
  }
});
---
PHASE 4: Entity & ID Standardization
Goal: Clear Project vs Workspace distinction, consistent ID generation
Duration: 2-3 stories
4A: Terminology Enforcement
// ENFORCED TERMINOLOGY
type WorkspaceType = 'ide' | 'notes' | 'knowledge' | 'study';  // ENUM, not entity
type ProjectId = `${WorkspaceType}:proj_${string}`;            // Namespaced ID
type TempProjectId = `alpha-temp-${string}`;                    // Temp prefix
// NEVER mix these
interface Flashcard {
  projectId: ProjectId;      // Which project owns this
  // workspaceId: string;    // ❌ NEVER - workspace is not an ID
}
4B: Fix ID Confusion Bugs
| File | Line | Bug | Fix |
|------|------|-----|-----|
| flashcard-persistence-slice.ts | 75 | `workspaceId || fc.projectId` | Remove fallback, use only projectId |
| flashcard-operations-slice.ts | 65 | Same | Same |
---
PHASE 5: Feature Cascade Integration
Goal: BYOK, Agents, RAG, Multimodality all depend on stable foundation
Duration: After Phases 1-4 complete
5A: Feature Dependency Map
FOUNDATION (Phase 1-4)
    │
    ├── BYOK Vault ──────────────────────────┐
    │   └── Credentials persist in DexieDB   │
    │                                        │
    ├── Project Space ───────────────────────┤
    │   └── Clear FSA vs IndexedDB paths    │
    │                                        │
    ├── Agent System ────────────────────────┤
    │   └── Workspace-aware permissions     │
    │                                        │
    ├── RAG Pipeline ────────────────────────┤
    │   └── Stable DexieDB for embeddings   │
    │                                        │
    └── Chat/Threads ────────────────────────┘
        └── Unified chat store (already canonical)
---
📋 PRIORITIZED EXECUTION ORDER
| Priority | Phase | Story | Impact | Risk |
|----------|-------|-------|--------|------|
| P0 | 0.1 | Fix useWorkspaceAccess | Unblocks ALL workspace entry | LOW |
| P0 | 0.2 | Emergency auto-save disable | Stops crashes | LOW |
| P1 | 1.1 | Consolidate Project Store | Reduces confusion | MEDIUM |
| P1 | 2.4 | Sync/async contracts | Prevents race conditions | MEDIUM |
| P1 | 3.1 | Platform routing contract | Clear device paths | MEDIUM |
| P2 | 1.2-1.5 | Remaining consolidations | Cleanup | LOW |
| P2 | 2.1-2.3 | DB consolidation | Technical debt | HIGH |
| P3 | 4.A-B | Entity standardization | Terminology | LOW |
| P3 | 5.* | Feature integration | After foundation | MEDIUM |
---
🎯 DECISION POINTS FOR YOU
Before I proceed, I need your decisions on:
Decision 1: Storage Architecture
Question: Should non-desktop users get per-workspace IndexedDB projects, or ONE project across all workspaces?
| Option A: Per-Workspace | Option B: Cross-Workspace |
|-------------------------|---------------------------|
| Each workspace has separate project namespace | One project ID works in all workspaces |
| Cleaner isolation | Simpler user mental model |
| No cross-contamination | Requires bindings management |
| Desktop parity: Desktop can also use this | Different from desktop FSA model |
My recommendation: Option B (Cross-Workspace) with bindings field determining which workspaces can access it. This matches the current WorkspaceBindings design.
Decision 2: Desktop-Only IDE Enforcement
Question: Should we completely block IDE on mobile, or allow read-only preview?
| Option A: Hard Block | Option B: Read-Only Preview |
|----------------------|----------------------------|
| Redirect to /notes always | Allow viewing, disable editing |
| Simpler implementation | Better UX for cross-device users |
| Current implementation | More complex |
My recommendation: Option A (Hard Block) for now, with clear toast message. Phase 2 can add read-only preview.
Decision 3: Phase 0 vs Full Remediation
Question: Do you want me to start with Phase 0 (stabilization) immediately, or do you want to review the full plan first?
---
⏳ ESTIMATED TIMELINE
| Phase | Duration | Dependency |
|-------|----------|------------|
| Phase 0 | 2-4 hours | None |
| Phase 1 | 8-12 hours | Phase 0 |
| Phase 2 | 12-16 hours | Phase 1 |
| Phase 3 | 8-12 hours | Phase 1 |
| Phase 4 | 4-6 hours | Phase 1 |
| Phase 5 | Ongoing | Phases 1-4 |
Total Foundation Remediation: ~40-50 hours of focused work
---
What is your decision on the above questions? Once confirmed, I will create the formal BMAD story artifacts and begin execution.
---
---
---
# TEAM 2 AGENT PROPOSAL

---
🔴 COMPREHENSIVE DIAGNOSIS & STRATEGIC REMEDIATION PLAN
Executive Summary
Your codebase has critical architectural debt at the foundation level. The 4 diagnostic scans revealed:
| Category | Severity | Finding |
|----------|----------|---------|
| State/Stores | 🔴 CRITICAL | 59 store-related files, 20+ active Zustand stores, fragmented across src/lib/ and src/infrastructure/ |
| DexieDB | 🔴 CRITICAL | 11 separate IndexedDB databases, consolidation incomplete, race conditions between sync/async |
| Routing | 🔴 CRITICAL | useWorkspaceAccess is BROKEN (returns hardcoded empty), inconsistent project validation |
| Entity Naming | 🟡 HIGH | project vs workspace terminology collision, ID generation inconsistent |
| Duplications | 🟡 HIGH | Same files in both lib/ and infrastructure/ (local-fs-adapter, file-sync-status-store, project-store) |
---
🏗️ THE PLAN: 5-Phase Foundation Remediation
PHASE 0: Stabilization (Before anything else)
Goal: Make Notes and IDE minimally usable while we remediate
Duration: 1-2 stories (immediate)
| Step | Action | Why |
|------|--------|-----|
| 0.1 | Fix useWorkspaceAccess hook | Currently returns hardcoded empty - this breaks ALL workspace entry |
| 0.2 | Disable broken auto-save temporarily | Stop the bleeding - crashes and loops |
| 0.3 | Add emergency fallback for DexieDB failures | Graceful degradation, not crashes |
---
PHASE 1: The Single Source of Truth Protocol (SSOT)
Goal: Establish ONE authoritative location for each concern
Duration: 3-4 stories
BEFORE (Current Chaos):
├── src/lib/workspace/project-store.ts         ← FACADE
├── src/lib/workspace/project-store/           ← SLICES
├── src/infrastructure/persistence/stores/project/  ← ALSO SLICES
└── Multiple Dexie table access patterns
AFTER (Single Source):
└── src/infrastructure/persistence/stores/project/  ← ONLY LOCATION
    ├── useProjectStore.ts                      ← Single export
    ├── project-crud-slice.ts
    ├── project-bindings-slice.ts
    └── types.ts
| Step | Action | Files Affected |
|------|--------|----------------|
| 1.1 | Consolidate Project Store | Merge src/lib/workspace/project-store/ → src/infrastructure/persistence/stores/project/ |
| 1.2 | Consolidate File Sync Store | Same pattern for file-sync-status-store |
| 1.3 | Consolidate File Snapshot Store | Same pattern |
| 1.4 | Remove src/lib/filesystem duplicates | Delete src/lib/filesystem/local-fs-adapter.ts (keep infrastructure one) |
| 1.5 | Create facade re-exports | Old import paths → new canonical paths |
---
PHASE 2: Database Consolidation & State Contracts
Goal: Single Dexie database, clear sync/async contracts
Duration: 4-5 stories
2A: Database Consolidation
BEFORE:
├── ViaGentDatabase (41 tables)
├── FlashcardDatabase        ← SEPARATE
├── StudyDatabase            ← SEPARATE
├── QuizDatabase             ← SEPARATE
├── KnowledgeCanvasDB        ← SEPARATE
├── AudioDatabase            ← SEPARATE
├── ... 5 more ...
AFTER:
└── ViaGentDatabase (consolidated, all tables)
    └── Migration from legacy DBs complete
| Step | Action |
|------|--------|
| 2.1 | Complete db-consolidation-service.ts implementation |
| 2.2 | Migrate FlashcardDB → ViaGentDatabase.flashcards |
| 2.3 | Migrate StudyDB → ViaGentDatabase.studySessions |
| 2.4 | Add explicit sync/async contracts for Zustand ↔ Dexie |
2B: State Contract Pattern
// NEW PATTERN: Explicit sync/async contract
const useProjectStore = create<ProjectState>((set, get) => ({
  // SYNC state (UI reads this)
  projects: {},
  
  // ASYNC action with explicit persistence
  async createProject(input) {
    const project = generateProject(input);
    
    // Step 1: Persist FIRST (fail-fast)
    await db.projects.put(project);
    
    // Step 2: Update Zustand AFTER persistence succeeds
    set((state) => ({ projects: { ...state.projects, [project.id]: project } }));
    
    return project;
  }
}));
---
PHASE 3: Routing & Entry Point Regulation
Goal: Clear device-based routing contracts, consistent error handling
Duration: 3-4 stories
3A: Device Detection Contract
// Platform contract
interface PlatformContract {
  canAccessFSA: boolean;      // File System Access API
  canAccessIDE: boolean;      // IDE workspace
  defaultWorkspace: WorkspaceType;  // Where to redirect
  storageType: 'fsa' | 'indexeddb';
}
// Platform routing
function getPlatformContract(): PlatformContract {
  if (isDesktop && supportsFSA) {
    return { canAccessFSA: true, canAccessIDE: true, defaultWorkspace: 'ide', storageType: 'fsa' };
  }
  return { canAccessFSA: false, canAccessIDE: false, defaultWorkspace: 'notes', storageType: 'indexeddb' };
}
3B: Route Guard Standardization
// EVERY workspace route follows this pattern
export const Route = createFileRoute('/$workspace/$projectId')({
  beforeLoad: async ({ params, context }) => {
    const { workspace, projectId } = params;
    const platform = getPlatformContract();
    
    // 1. Platform check
    if (workspace === 'ide' && !platform.canAccessIDE) {
      throw redirect({ to: '/notes/$projectId', params: { projectId } });
    }
    
    // 2. Project validation (with retry)
    const project = await validateProject(projectId, { retries: 3 });
    if (!project) {
      throw redirect({ to: '/hub', search: { error: 'project-not-found' } });
    }
    
    // 3. Pass validated context
    return { project, platform };
  }
});
---
PHASE 4: Entity & ID Standardization
Goal: Clear Project vs Workspace distinction, consistent ID generation
Duration: 2-3 stories
4A: Terminology Enforcement
// ENFORCED TERMINOLOGY
type WorkspaceType = 'ide' | 'notes' | 'knowledge' | 'study';  // ENUM, not entity
type ProjectId = `${WorkspaceType}:proj_${string}`;            // Namespaced ID
type TempProjectId = `alpha-temp-${string}`;                    // Temp prefix
// NEVER mix these
interface Flashcard {
  projectId: ProjectId;      // Which project owns this
  // workspaceId: string;    // ❌ NEVER - workspace is not an ID
}
4B: Fix ID Confusion Bugs
| File | Line | Bug | Fix |
|------|------|-----|-----|
| flashcard-persistence-slice.ts | 75 | `workspaceId || fc.projectId` | Remove fallback, use only projectId |
| flashcard-operations-slice.ts | 65 | Same | Same |
---
PHASE 5: Feature Cascade Integration
Goal: BYOK, Agents, RAG, Multimodality all depend on stable foundation
Duration: After Phases 1-4 complete
5A: Feature Dependency Map
FOUNDATION (Phase 1-4)
    │
    ├── BYOK Vault ──────────────────────────┐
    │   └── Credentials persist in DexieDB   │
    │                                        │
    ├── Project Space ───────────────────────┤
    │   └── Clear FSA vs IndexedDB paths    │
    │                                        │
    ├── Agent System ────────────────────────┤
    │   └── Workspace-aware permissions     │
    │                                        │
    ├── RAG Pipeline ────────────────────────┤
    │   └── Stable DexieDB for embeddings   │
    │                                        │
    └── Chat/Threads ────────────────────────┘
        └── Unified chat store (already canonical)
---
📋 PRIORITIZED EXECUTION ORDER
| Priority | Phase | Story | Impact | Risk |
|----------|-------|-------|--------|------|
| P0 | 0.1 | Fix useWorkspaceAccess | Unblocks ALL workspace entry | LOW |
| P0 | 0.2 | Emergency auto-save disable | Stops crashes | LOW |
| P1 | 1.1 | Consolidate Project Store | Reduces confusion | MEDIUM |
| P1 | 2.4 | Sync/async contracts | Prevents race conditions | MEDIUM |
| P1 | 3.1 | Platform routing contract | Clear device paths | MEDIUM |
| P2 | 1.2-1.5 | Remaining consolidations | Cleanup | LOW |
| P2 | 2.1-2.3 | DB consolidation | Technical debt | HIGH |
| P3 | 4.A-B | Entity standardization | Terminology | LOW |
| P3 | 5.* | Feature integration | After foundation | MEDIUM |
---
🎯 DECISION POINTS FOR YOU
Before I proceed, I need your decisions on:
Decision 1: Storage Architecture
Question: Should non-desktop users get per-workspace IndexedDB projects, or ONE project across all workspaces?
| Option A: Per-Workspace | Option B: Cross-Workspace |
|-------------------------|---------------------------|
| Each workspace has separate project namespace | One project ID works in all workspaces |
| Cleaner isolation | Simpler user mental model |
| No cross-contamination | Requires bindings management |
| Desktop parity: Desktop can also use this | Different from desktop FSA model |
My recommendation: Option B (Cross-Workspace) with bindings field determining which workspaces can access it. This matches the current WorkspaceBindings design.
Decision 2: Desktop-Only IDE Enforcement
Question: Should we completely block IDE on mobile, or allow read-only preview?
| Option A: Hard Block | Option B: Read-Only Preview |
|----------------------|----------------------------|
| Redirect to /notes always | Allow viewing, disable editing |
| Simpler implementation | Better UX for cross-device users |
| Current implementation | More complex |
My recommendation: Option A (Hard Block) for now, with clear toast message. Phase 2 can add read-only preview.
Decision 3: Phase 0 vs Full Remediation
Question: Do you want me to start with Phase 0 (stabilization) immediately, or do you want to review the full plan first?
---
⏳ ESTIMATED TIMELINE
| Phase | Duration | Dependency |
|-------|----------|------------|
| Phase 0 | 2-4 hours | None |
| Phase 1 | 8-12 hours | Phase 0 |
| Phase 2 | 12-16 hours | Phase 1 |
| Phase 3 | 8-12 hours | Phase 1 |
| Phase 4 | 4-6 hours | Phase 1 |
| Phase 5 | Ongoing | Phases 1-4 |
Total Foundation Remediation: ~40-50 hours of focused work

## Executive Summary

This plan addresses the collapse of state management, routing logic, and data persistence caused by unregulated boundaries between File System (Desktop) and Browser Database (IndexedDB). The remediation follows a **phased approach** that stabilizes core infrastructure before adding features.

**Estimated Total Duration**: 4-6 weeks (8-12 sprints of 3-5 days each)
**Risk Level**: HIGH - touches core data persistence and state management
**Team Coordination**: Requires Team A (State/Routing/AI) and Team B (Storage/Persistence)

---

## Problem Analysis

### Root Causes Identified

| Category | Root Cause | Impact |
|----------|-----------|--------|
| **Storage** | Device-based routing creates fallback complexity | Race conditions, permission state bugs |
| **State** | Slice proliferation with circular dependencies | Store updates fail silently |
| **Naming** | Project/Workspace used interchangeably | Context confusion, ID collisions |
| **Routing** | Provider nesting without memoization | Performance degradation |
| **AI** | Provider-specific logic scattered | Inconsistent error handling |
| **Types** | Same entity defined 3+ times across layers | Type narrowing failures |

### Current State Symptoms

1. **IDE Features Non-Functional**: No autosave, unable to select projects
2. **Notes Features Broken**: IndexedDB failures, no project switching
3. **Runtime Instability**: Loop crashes, hot-reload errors
4. **Debugging Difficulty**: Routes not traceable, errors swallowed

---

## Phase 1: FOUNDATION STABILIZATION (Week 1-2)

### 1.1 Storage Abstraction Layer
**Goal**: Single source of truth for storage operations regardless of backend

**Current Problem**: Storage type determined at call site, fallback logic scattered

**Solution**: Create `StorageGateway` that encapsulates backend selection

```typescript
// src/domain/services/storage-gateway.service.ts
interface StorageGateway {
  // Operations are storage-agnostic
  read(path: string): Promise<string>
  write(path: string, content: string): Promise<void>
  delete(path: string): Promise<void>
  exists(path: string): Promise<boolean>
  list(path: string): Promise<FileMetadata[]>

  // Backend is selected once, not per-operation
  readonly backendType: 'fsa' | 'indexeddb'
  readonly capabilities: StorageCapabilities
}
```

**Implementation Steps**:
1. Create `StorageGateway` service in domain layer
2. Implement `FSAGateway` and `IDBGateway` adapters
3. Add backend selection on first access (cached)
4. Deprecate direct adapter usage (add @deprecated JSDoc)
5. Add unit tests for gateway abstraction

**Files to Create**:
- `src/domain/services/storage-gateway.service.ts`
- `src/infrastructure/storage/fsa-gateway.ts`
- `src/infrastructure/storage/indexdb-gateway.ts`
- `src/infrastructure/storage/gateway-factory.ts`

**Files to Modify**:
- Mark `LocalFSAdapter` methods as @deprecated
- Update `AdapterFactory` to use Gateway internally
- Update type definitions to use `StorageGateway`

**Estimated Effort**: 2-3 days

---

### 1.2 Naming Convention Standardization
**Goal**: Eliminate Project/Workspace ambiguity

**Current Problem**:
- `Project` defined in `domain/entities/`, `infrastructure/stores/`, and `lib/workspace/`
- `Workspace` means both "workspace type" AND "workspace state"
- Properties: `bindings` vs `workspaceBindings`

**Solution**: Create single source of truth for each entity

**New Type Hierarchy**:
```
src/domain/entities/
  ├── project.entity.ts        # Pure domain entity (business rules)
  ├── workspace.entity.ts      # Workspace configuration
  └── workspace-binding.entity.ts  # Project-Workspace relationship

src/infrastructure/persistence/
  └── project-record.ts        # persistence concerns only

src/lib/types/
  └── view-models.ts           # UI-specific types (ViewModel suffix)
```

**Naming Rules**:
1. **Domain Entities**: Pure business logic, `.entity.ts` suffix
2. **Persistence Records**: Storage metadata only, `.record.ts` suffix
3. **ViewModels**: UI-specific, `ViewModel` suffix
4. **IDs**: Always `uuid` format, stored as string, validated with Zod

**Property Names**:
- `workspaceBindings` (not `bindings`)
- `workspaceType` (not `type`)
- `projectId` (UUID, never user-provided name)
- `projectName` (user-provided, mutable)

**Files to Create**:
- `src/domain/entities/project.entity.ts` (consolidated)
- `src/domain/entities/workspace-binding.entity.ts`
- `src/lib/types/view-models.ts`
- `src/lib/validation/id-schemas.ts`

**Files to Modify**:
- Consolidate all `Project` definitions
- Rename `bindings` → `workspaceBindings`
- Add ID validation at boundaries

**Estimated Effort**: 2-3 days

---

### 1.3 Store Consolidation
**Goal**: Reduce slice proliferation, eliminate circular dependencies

**Current Problem**: 5 slices for project store with interdependencies

**Solution**: Flatten to 3 slices with clear boundaries

**New Store Structure**:
```
src/infrastructure/persistence/stores/project/
  ├── project-store.ts              # Main store (flattened)
  ├── slices/
  │   ├── core-slice.ts             # CRUD + ID generation
  │   ├── bindings-slice.ts         # Workspace bindings
  │   └── layout-slice.ts           # Layout persistence
  └── types.ts                      # Consolidated types
```

**Removed Slices** (merged into core):
- `project-permissions-slice.ts` → merge into core
- `project-utils-slice.ts` → move to utilities/

**New Pattern**:
```typescript
// Single import for selectors
import { useProjectStore } from '@/infrastructure/persistence/stores/project/project-store'

// Typed selectors with useShallow
const { activeProject, workspaceBindings } = useProjectStore(
  useShallow(state => ({
    activeProject: state.activeProject,
    workspaceBindings: state.workspaceBindings
  }))
)
```

**Estimated Effort**: 2 days

---

## Phase 2: STATE MANAGEMENT STABILIZATION (Week 2-3)

### 2.1 Reactive Runtime Fixes
**Goal**: Eliminate race conditions and loop crashes

**Current Problems**:
- Multiple stores updating simultaneously without coordination
- Hot-reload causing state desynchronization
- Effect dependencies not properly declared

**Solution**: Implement state coordination layer

**Files to Create**:
- `src/infrastructure/persistence/state-coordinator.ts`
- `src/infrastructure/persistence/hot-reload-handler.ts`

**State Coordinator Pattern**:
```typescript
class StateCoordinator {
  // Serialize state updates across stores
  async transaction<T>(
    stores: StoreName[],
    operation: () => Promise<T>
  ): Promise<T>

  // Handle hot-reload gracefully
  handleHotReload(): void

  // Validate state consistency
  validate(): StateValidationResult
}
```

**Estimated Effort**: 3 days

---

### 2.2 Routing Simplification
**Goal**: Make routes traceable, reduce provider nesting

**Current Problems**:
- Similar route definitions duplicated
- Provider nesting causes performance issues
- Error boundaries inconsistent

**Solution**: Create route factory pattern

**Files to Create**:
- `src/routes/factories/workspace-route-factory.ts`
- `src/routes/components/WorkspaceRouteWrapper.tsx`

**Route Factory Pattern**:
```typescript
function createWorkspaceRoute(config: {
  workspaceType: WorkspaceType
  component: React.ComponentType
  loaders?: RouteLoaders
}) {
  return {
    path: `/${config.workspaceType}/$projectId`,
    component: WorkspaceRouteWrapper,
    loaders: config.loaders,
    // Provider wrapper optimized with memo
    wrapper: memo(({ children }) => (
      <ProjectProvider>
        <WorkspaceProvider type={config.workspaceType}>
          {children}
        </WorkspaceProvider>
      </ProjectProvider>
    ))
  }
}
```

**Estimated Effort**: 2 days

---

### 2.3 Error Handling Standardization
**Goal**: All errors traceable, consistent user feedback

**Current Problems**:
- Errors thrown without context
- Toast notifications inconsistent
- No error aggregation

**Solution**: Create error handling service

**Files to Create**:
- `src/infrastructure/errors/error-handler.service.ts`
- `src/infrastructure/errors/error-boundary.tsx`
- `src/lib/errors/error-types.ts`

**Error Handler Pattern**:
```typescript
class AppErrorHandler {
  // All errors go through here
  handle(error: AppError, context: ErrorContext): void

  // User-facing notification
  notify(error: AppError): void

  // Developer-facing logging
  log(error: AppError, context: ErrorContext): void
}

type AppError =
  | { type: 'storage_permission_denied'; path: string }
  | { type: 'project_not_found'; projectId: string }
  | { type: 'workspace_binding_missing'; workspaceType: string }
  // ...discriminated union for type safety
```

**Estimated Effort**: 2 days

---

## Phase 3: CORE FEATURE RESTORATION (Week 3-4)

### 3.1 IDE Autosave
**Goal**: Restore autosave functionality

**Current Problem**: State updates not triggering storage writes

**Solution**: Implement autosave coordinator

**Files to Create**:
- `src/domain/services/autosave-coordinator.service.ts`
- `src/infrastructure/ide/autosave-handler.ts`

**Autosave Pattern**:
```typescript
class AutosaveCoordinator {
  private debounceTimer: Map<string, NodeJS.Timeout>

  // Debounced save per resource
  queueSave(resourceId: string, content: string): void

  // Force save (e.g., on navigation)
  async saveNow(resourceId: string): Promise<void>

  // Get unsaved changes
  hasUnsavedChanges(resourceId: string): boolean
}
```

**Estimated Effort**: 2 days

---

### 3.2 Project Selection Restoration
**Goal**: Fix project selection across all workspaces

**Current Problem**: Project state not persisting across workspace switches

**Solution**: Create project selection service

**Files to Create**:
- `src/domain/services/project-selection.service.ts`
- `src/lib/workspace/project-selection-store.ts`

**Selection Pattern**:
```typescript
interface ProjectSelectionService {
  // Active project persists until explicitly changed
  getActiveProject(): Project | null

  // Change active project (validates access)
  setActiveProject(projectId: string): Promise<void>

  // Check if project is accessible in current workspace
  isAccessible(projectId: string, workspaceType: WorkspaceType): boolean
}
```

**Estimated Effort**: 2 days

---

### 3.3 IndexedDB Reliability
**Goal**: Fix IndexedDB operations failing silently

**Current Problem**: Errors not surfaced, operations timing out

**Solution**: Add IndexedDB operation wrapper

**Files to Create**:
- `src/infrastructure/persistence/indexeddb/operation-wrapper.ts`
- `src/infrastructure/persistence/indexeddb/error-retry.ts`

**Operation Pattern**:
```typescript
async function idbOperation<T>(
  operation: () => Promise<T>,
  context: { operation: string; table: string }
): Promise<T> {
  try {
    return await withTimeout(operation, 5000)
  } catch (error) {
    if (isRetryable(error)) {
      return await retry(operation, { maxAttempts: 3 })
    }
    throw new IDBError(error, context)
  }
}
```

**Estimated Effort**: 1-2 days

---

## Phase 4: AI/LLM INTEGRATION (Week 4-5)

### 4.1 Two-Layer Prompt Architecture
**Goal**: Implement orchestrator + workspace-specific layers

**Current Problem**: All prompts handled the same way

**Solution**: Create prompt layer system

**Files to Create**:
- `src/lib/ai/prompts/orchestrator-layer.ts`
- `src/lib/ai/prompts/workspace-layers/`
- `src/lib/ai/prompts/composer.ts`

**Prompt Architecture**:
```
┌─────────────────────────────────────────────────────────────┐
│                    Orchestrator Layer                        │
│  - Conversational interface                                  │
│  - Intent detection (chat vs. command vs. agent)            │
│  - Mode switching (creative, analytical, coding, etc.)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Workspace-Specific Layer                    │
│  - IDE: Code analysis, refactoring suggestions              │
│  - Notes: Content generation, summarization                 │
│  - Knowledge: RAG queries, citation management              │
│  - Study: Learning assistance, quiz generation              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Tool Execution Layer                    │
│  - CRUD permissions checked before execution                │
│  - Multi-step planning with confirmation                    │
│  - Error handling with user-friendly messages               │
└─────────────────────────────────────────────────────────────┘
```

**Estimated Effort**: 3 days

---

### 4.2 Chat Flow Cascade
**Goal**: Thread-managed chat as gateway to agents and RAG

**Current Problem**: Chat state scattered, no thread management

**Solution**: Create chat flow service

**Files to Create**:
- `src/lib/chat/chat-flow.service.ts`
- `src/lib/chat/thread-manager.ts`
- `src/lib/chat/message-cascade.ts`

**Chat Flow Pattern**:
```typescript
interface ChatFlowService {
  // Start new chat thread
  startThread(context: ThreadContext): ChatThread

  // Add message to thread
  addMessage(threadId: string, message: UserMessage): Promise<void>

  // Execute AI response (may trigger tools)
  executeResponse(threadId: string): Promise<AIResponse>

  // Cascade to RAG if needed
  searchRag(threadId: string, query: string): Promise<RAGResult[]>
}
```

**Estimated Effort**: 3 days

---

### 4.3 RAG Infrastructure Planning
**Goal**: Plan for Browser Vector DB vs. local embeddings

**Decision Matrix**:

| Factor | Browser Vector DB | Local Embeddings |
|--------|-------------------|------------------|
| **Storage** | IndexedDB (built-in) | IndexedDB with chunks |
| **Computation** | Client-side embedding | Requires Wasm |
| **Privacy** | Data stays local | Data stays local |
| **Performance** | Good for small sets | Better for large sets |
| **Complexity** | Lower | Higher |
| **Recommendation** | **Phase 1** | Phase 2 |

**Phase 1 Implementation** (Browser Vector DB):
- Use TanStack Vector or simple cosine similarity
- Embed documents on-demand with small model
- Store embeddings in IndexedDB
- Retrieve top-k similar chunks

**Phase 2 Implementation** (Local Embeddings):
- Evaluate Gemini Gemma or similar Wasm model
- Cache embeddings for frequently accessed docs
- Implement incremental embedding updates

**Estimated Effort**: 3-4 days (Phase 1)

---

## Phase 5: VALIDATION & TESTING (Week 5-6)

### 5.1 End-to-End Testing
**Goal**: Validate all restored functionality

**Test Scenarios**:
1. Create project, select in IDE, verify autosave
2. Switch workspaces, verify project state persists
3. Open notes, create content, verify IndexedDB write
4. Trigger AI chat, verify response streaming
5. Test error scenarios (permission denied, network failure)

**Estimated Effort**: 3 days

---

### 5.2 Performance Validation
**Goal**: Ensure no regressions

**Metrics**:
- Route transition time < 500ms
- Store update latency < 50ms
- Storage operation < 100ms (IndexedDB)
- AI first token < 2s

**Estimated Effort**: 2 days

---

## Implementation Order (Critical Path)

```
Week 1: Foundation Stabilization
├── Day 1-2: Storage Abstraction (StorageGateway)
├── Day 3-4: Naming Standardization
└── Day 5: Store Consolidation (Phase 1)

Week 2: State Management
├── Day 1-2: Reactive Runtime Fixes
├── Day 3: Routing Simplification
└── Day 4-5: Error Handling

Week 3: Core Feature Restoration
├── Day 1-2: IDE Autosave
├── Day 3-4: Project Selection
└── Day 5: IndexedDB Reliability

Week 4: AI/LLM Integration
├── Day 1-2: Two-Layer Prompts
├── Day 3-4: Chat Flow Cascade
└── Day 5: RAG Planning (documentation only)

Week 5-6: Validation
├── Day 1-3: E2E Testing
├── Day 4-5: Performance Validation
└── Day 6: Documentation & Handoff
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **Breaking existing features** | Feature flags for each phase |
| **State migration failures** | Backup/migration scripts |
| **Performance regression** | Benchmarks before/after |
| **Team coordination overhead** | Daily standups, clear ownership |
| **Scope creep** | Strict adherence to plan phases |

---

## Success Criteria

Phase completion requires:
1. **All TypeScript errors resolved** (`tsc --noEmit`)
2. **Tests passing** (`vitest run`)
3. **Manual validation** of restored features
4. **Documentation updated** (CLAUDE.md, AGENTS.md)
5. **No regressions** in completed epics

---

## Next Steps

**AWAITING USER APPROVAL** to proceed with:

1. **Phase 1.1**: Storage Abstraction Layer
2. **Phase 1.2**: Naming Convention Standardization
3. **Phase 1.3**: Store Consolidation

Once Phase 1 is complete and validated, proceed to Phase 2.

---

**Document Status**: PLANNING - NOT FOR IMPLEMENTATION
**Last Updated**: 2026-01-16
**Author**: EXCALIBUR (BMAD Extension Master Orchestrator)
