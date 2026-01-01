# Cornerstone 4: Project & File System Integration - Detailed Gap Documentation

**Date**: 2026-01-02
**Iteration**: 13 (Phase 1: Analysis & Gap Documentation)
**Status**: IN PROGRESS
**Related**: Cornerstone 4 Analysis (Iteration 4), ADR-004 (Project Workspace Binding)

---

## Executive Summary

**Current Health Score**: 6/10 ⚠️ (Moderate issues)
**Target Health Score**: 9/10 ✅
**Refactoring Effort**: 80-100 hours (estimated)
**Risk Level**: MEDIUM (functional but needs architectural improvements)

### Key Findings

**Strengths**:
- ✅ Project metadata persistence via IndexedDB (Dexie)
- ✅ File System Access API integration (local FS as source of truth)
- ✅ File snapshot caching for performance (lazy loading)
- ✅ Workspace binding support (Story WB-1)
- ✅ Hub UI components exist (with 8-bit boot animation)

**Weaknesses**:
- ❌ Two god stores (959 total lines)
  - `project-store.ts` (450 lines) - 1.5x over 300-line limit
  - `file-snapshot-store.ts` (509 lines) - 1.7x over 300-line limit
- ❌ Fragmented file sync services (4 separate services, 1,421 lines)
- ❌ Hub not properly routed (no hub.tsx route file)
- ❌ No slice pattern (unlike Cornerstones 1 & 2)

**Recommendation**: Moderate refactoring required - functional but not following December 2025 Zustand best practices

---

## Part 1: Current State Mapping

### Store #1: Project Store (GOD STORE - 450 lines)

**Location**: `src/lib/workspace/project-store.ts`

**Line Count**: 450 lines (1.5x over 300-line limit)

**Responsibilities**:
1. Project CRUD operations (create, read, update, delete)
2. Workspace binding management (Story WB-1)
3. File permission state tracking
4. Layout state persistence
5. Legacy migration (from old 'via-gent-projects' DB)

**State Interface**:
```typescript
interface ProjectStoreState {
  // Core CRUD
  projects: Record<string, ProjectMetadata>;
  activeProjectId: string | null;
  lastOpenedProjectId: string | null;

  // Methods (20+ methods in single file)
  createProject: (metadata: Omit<ProjectMetadata, 'id' | 'lastOpened'>) => Promise<string>;
  getProject: (id: string) => ProjectMetadata | undefined;
  updateProject: (id: string, updates: Partial<ProjectMetadata>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getAllProjects: () => ProjectMetadata[];
  setActiveProject: (id: string) => void;
  // ... 15+ more methods
}
```

**Issues**:
- Too many responsibilities in single file
- No slice pattern (should be split into 4-5 focused slices)
- Not using Zustand best practices (December 2025 patterns)
- Mixed concerns (persistence + validation + permissions + layout)

---

### Store #2: File Snapshot Store (GOD STORE - 509 lines)

**Location**: `src/lib/filesystem/file-snapshot-store.ts`

**Line Count**: 509 lines (1.7x over 300-line limit)

**Responsibilities**:
1. Snapshot metadata management (lightweight file tree)
2. Content caching (lazy-loaded file content)
3. Cache invalidation (time-based + hash-based)
4. Bulk operations (chunked for large projects)
5. IndexedDB quota management

**Class Structure**:
```typescript
class FileSnapshotStore {
  // Snapshot operations
  saveSnapshot(projectId, path, content, hash, size): Promise<void>
  getSnapshot(projectId, path): Promise<CacheLookupResult>
  getFileTree(projectId): Promise<FileTree>

  // Cache management
  invalidateSnapshot(projectId, path): Promise<void>
  clearProjectCache(projectId): Promise<void>
  evictOldestEntries(projectId, sizeKB): Promise<void>

  // Bulk operations
  saveBulkSnapshots(projectId, snapshots): Promise<SnapshotSaveResult>
  getBulkSnapshots(projectId, paths): Promise<CacheLookupResult[]>

  // Quota management
  getCacheSize(): Promise<number>
  clearExpiredCache(): Promise<void>

  // ... 10+ more methods
}
```

**Issues**:
- Too many responsibilities in single class
- No slice pattern (should be split into 3-4 focused slices)
- Not integrated with Zustand (still using plain class + Dexie)
- Mixed concerns (metadata + content + quota + bulk ops)

---

### Fragmented File Sync Services (1,421 lines across 4 files)

**Service #1**: `knowledge-file-sync-service.ts` (298 lines)
- Syncs files for Knowledge workspace
- Handles PDF/URL ingestion
- RAG indexing integration

**Service #2**: `project-knowledge-sync.ts` (248 lines)
- Syncs project files to knowledge graph
- Bi-directional sync (project ↔ knowledge)
- Linkage tracking

**Service #3**: `ide-file-sync-service.ts` (223 lines)
- Syncs files for IDE workspace
- WebContainer mirror management
- File watcher integration

**Service #4**: `file-sync-service.ts` (161 lines)
- Base sync service (shared utilities)
- Common sync operations
- Event emission

**Issues**:
- Code duplication across services (common patterns repeated)
- Complex coordination (4 services must communicate)
- No unified sync orchestrator
- Potential race conditions (multiple services accessing same files)

---

### Hub Routing Issue

**Components Exist**:
- `HubHomePage.tsx` (with 8-bit boot animation) ✅
- `ProjectCard.tsx` (workspace binding display) ✅
- `WorkspaceBindingDialog.tsx` ✅
- `MobileProjectSelector.tsx` ✅

**Route Missing**:
```bash
# Find hub route
find src/routes -name "hub.tsx"
# Result: NOT FOUND ❌
```

**Impact**: Hub exists but not discoverable via URL routing - must be accessed programmatically

---

## Part 2: Target Architecture

### Goal: Single Bounded Store with Slice Pattern

Following the proven pattern from Cornerstones 1 & 2 (December 2025 Zustand best practices)

**Target Structure**:
```
src/infrastructure/persistence/stores/project/
├── use-project-store.ts (150 lines) - Single bounded store
└── project/
    ├── project-crud-slice.ts (120 lines) - Project CRUD operations
    ├── project-workspace-bindings-slice.ts (100 lines) - Workspace binding management
    ├── project-permissions-slice.ts (110 lines) - Permission state tracking
    ├── project-layout-slice.ts (80 lines) - Layout state persistence
    └── project-utils-slice.ts (90 lines) - Query helpers and filtering
```

**Total Lines**: ~500 lines across 5 slices (vs. 959 lines in 2 god stores) - **48% reduction**

---

### Slice #1: Project CRUD Slice (120 lines)

**Responsibility**: Pure CRUD operations for projects

**State Interface**:
```typescript
interface ProjectCrudState {
  projects: Record<string, ProjectMetadata>;
  activeProjectId: string | null;
  lastOpenedProjectId: string | null;

  // Actions
  createProject: (metadata: Omit<ProjectMetadata, 'id' | 'lastOpened'>) => Promise<string>;
  getProject: (id: string) => ProjectMetadata | undefined;
  updateProject: (id: string, updates: Partial<ProjectMetadata>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getAllProjects: () => ProjectMetadata[];
  setActiveProject: (id: string) => void;
  getRecentProjects: (limit?: number) => ProjectMetadata[];
}
```

**Key Features**:
- Auto-generates UUID
- Timestamps tracking (createdAt, lastOpened)
- FSA handle persistence (FileSystemDirectoryHandle)
- Exclusion patterns support (glob syntax)
- Recent projects query

---

### Slice #2: Project Workspace Bindings Slice (100 lines)

**Responsibility**: Workspace binding management (Story WB-1)

**State Interface**:
```typescript
interface ProjectWorkspaceBindingsState {
  // Actions
  setProjectWorkspaceBinding: (projectId: string, workspaceType: WorkspaceType, enabled: boolean) => void;
  setProjectDefaultWorkspace: (projectId: string, workspaceType: WorkspaceType) => void;
  isProjectAvailableInWorkspace: (projectId: string, workspaceType: WorkspaceType) => boolean;
  getDefaultWorkspaceForProject: (projectId: string) => WorkspaceType | undefined;
  getProjectsForWorkspace: (workspaceType: WorkspaceType) => ProjectMetadata[];
}
```

**Key Features**:
- Per-workspace enable/disable
- Per-workspace default selection
- Efficient filtering queries
- Workspace type safety

---

### Slice #3: Project Permissions Slice (110 lines)

**Responsibility**: Permission state tracking (FSA lifecycle)

**State Interface**:
```typescript
interface ProjectPermissionsState {
  // Actions
  updateProjectPermission: (projectId: string, permissionState: FsaPermissionState) => void;
  getProjectPermission: (projectId: string) => FsaPermissionState | undefined;
  getProjectsWithPermission: (permissionState: FsaPermissionState) => ProjectMetadata[];
  checkProjectPermission: (projectId: string) => Promise<FsaPermissionState>;
  invalidateProjectPermission: (projectId: string) => void;
}
```

**Key Features**:
- Permission state caching (faster dashboard load)
- Permission validation before FSA operations
- Batch permission checks
- Permission state refresh

---

### Slice #4: Project Layout Slice (80 lines)

**Responsibility**: Layout state persistence (IDE restoration)

**State Interface**:
```typescript
interface ProjectLayoutState {
  // Actions
  saveProjectLayout: (projectId: string, layout: LayoutConfig) => void;
  getProjectLayout: (projectId: string) => LayoutConfig | undefined;
  clearProjectLayout: (projectId: string) => void;
}
```

**Key Features**:
- Panel sizes persistence
- Open files restoration
- Active file restoration
- Per-project layout storage

---

### Slice #5: Project Utils Slice (90 lines)

**Responsibility**: Query helpers and filtering

**State Interface**:
```typescript
interface ProjectUtilsState {
  // Query helpers
  filterProjects: (predicate: (proj: ProjectMetadata) => boolean) => ProjectMetadata[];
  sortProjects: (comparator: (a: ProjectMetadata, b: ProjectMetadata) => number) => ProjectMetadata[];

  // Search helpers
  searchProjects: (query: string) => ProjectMetadata[];

  // Analytics helpers
  getProjectStats: (projectId: string) => ProjectStats;
}
```

**Key Features**:
- Flexible filtering (predicate functions)
- Custom sorting (comparator functions)
- Full-text search (name + path)
- Project statistics (file count, size, etc.)

---

### Unified Store Integration

**File**: `use-project-store.ts` (150 lines)

```typescript
export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get, api) => ({
      // Slice 1: CRUD
      ...createProjectCrudSlice(set, get, api),

      // Slice 2: Workspace Bindings
      ...createProjectWorkspaceBindingsSlice(set, get, api),

      // Slice 3: Permissions
      ...createProjectPermissionsSlice(set, get, api),

      // Slice 4: Layout
      ...createProjectLayoutSlice(set, get, api),

      // Slice 5: Utils
      ...createProjectUtilsSlice(set, get, api),
    }),
    {
      name: 'project-state',
      storage: createDexieStorage('projectState'),
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        lastOpenedProjectId: state.lastOpenedProjectId,
      }),
    }
  )
);
```

**Key Features**:
- Single bounded store (combines all 5 slices)
- Dexie persistence with partialize
- Cross-slice communication via `get()`
- Zero circular dependencies

---

### File Snapshot Store Refactoring

**Target Structure**:
```
src/infrastructure/persistence/stores/filesystem/
├── use-file-snapshot-store.ts (120 lines) - Single bounded store
└── snapshots/
    ├── snapshot-metadata-slice.ts (100 lines) - Snapshot CRUD operations
    ├── snapshot-cache-slice.ts (110 lines) - Cache management
    ├── snapshot-bulk-ops-slice.ts (90 lines) - Bulk operations
    └── snapshot-quota-slice.ts (80 lines) - Quota management
```

**Total Lines**: ~380 lines across 4 slices (vs. 509 lines in single class) - **25% reduction**

---

### Slice #1: Snapshot Metadata Slice (100 lines)

**State Interface**:
```typescript
interface SnapshotMetadataState {
  metadata: Record<string, FileSnapshotRecord>;

  // Actions
  saveSnapshotMetadata: (projectId: string, path: string, metadata: SnapshotMetadata) => void;
  getSnapshotMetadata: (projectId: string, path: string) => FileSnapshotRecord | undefined;
  getFileTree: (projectId: string) => FileTree;
  invalidateSnapshot: (projectId: string, path: string) => void;
}
```

---

### Slice #2: Snapshot Cache Slice (110 lines)

**State Interface**:
```typescript
interface SnapshotCacheState {
  // Actions
  getCachedContent: (projectId: string, path: string) => Promise<CacheLookupResult>;
  saveCachedContent: (projectId: string, path: string, content: string) => Promise<void>;
  isCacheFresh: (projectId: string, path: string) => boolean;
  clearExpiredCache: () => Promise<void>;
}
```

---

### Slice #3: Snapshot Bulk Ops Slice (90 lines)

**State Interface**:
```typescript
interface SnapshotBulkOpsState {
  // Actions
  saveBulkSnapshots: (projectId: string, snapshots: Snapshot[]) => Promise<SnapshotSaveResult>;
  getBulkSnapshots: (projectId: string, paths: string[]) => Promise<CacheLookupResult[]>;
  clearProjectCache: (projectId: string) => Promise<void>;
}
```

---

### Slice #4: Snapshot Quota Slice (80 lines)

**State Interface**:
```typescript
interface SnapshotQuotaState {
  // Actions
  getCacheSize: () => Promise<number>;
  evictOldestEntries: (projectId: string, sizeKB: number) => Promise<void>;
  enforceQuotaLimit: (maxSizeMB: number) => Promise<void>;
}
```

---

## Part 3: Migration Plan

### Phase 1: Create New Stores (20-25 hours) - Non-breaking

**Step 1: Create Project Store Slices** (8 hours)
- Create 5 slice files (CRUD, Bindings, Permissions, Layout, Utils)
- Each slice ≤120 lines
- Follow pattern from Cornerstone 1 & 2 agent slices
- Use domain services for cross-cutting concerns

**Step 2: Integrate Project Slices** (4 hours)
- Create `use-project-store.ts` (single bounded store)
- Combine all 5 slices using spread operator
- Add Dexie persistence with partialize
- Test slice integration (cross-slice communication)

**Step 3: Create File Snapshot Slices** (8 hours)
- Create 4 slice files (Metadata, Cache, Bulk Ops, Quota)
- Each slice ≤120 lines
- Follow same pattern as project slices

**Step 4: Integrate Snapshot Slices** (4 hours)
- Create `use-file-snapshot-store.ts` (single bounded store)
- Combine all 4 slices
- Add Dexie persistence with partialize
- Test slice integration

**Step 5: Create Facade Exports** (2 hours)
- Re-export old methods for backward compatibility
- Enable gradual component migration
- Zero breaking changes to public API

**Step 6: Integration Testing** (3 hours)
- Test project store operations (CRUD, bindings, permissions)
- Test snapshot store operations (metadata, cache, bulk ops)
- Test cross-slice communication
- Test persistence (save/load from Dexie)

**Step 7: Performance Testing** (2 hours)
- Benchmark project load time (<500ms for 100 projects)
- Benchmark snapshot load time (<100ms for file tree)
- Benchmark cache hit rate (>90% expected)
- Identify bottlenecks and optimize

**Step 8: Documentation** (2 hours)
- Update AGENTS.md with new store locations
- Update CLAUDE.md with project store pattern
- Add JSDoc comments to slice files
- Create migration guide

**Deliverables**:
- 9 new slice files (5 project + 4 snapshot)
- 2 unified store files
- 1 facade export file
- Integration tests passing
- Documentation complete

---

### Phase 2: Component Migration (15-20 hours) - Batches

**Batch 1: Hub Components** (3 hours) - LOWEST RISK
- `HubHomePage.tsx` - Update to use new project store
- `ProjectCard.tsx` - Update to use new project store
- `WorkspaceBindingDialog.tsx` - Update to use new bindings slice
- `MobileProjectSelector.tsx` - Update to use new project store
- Test Hub functionality

**Batch 2: IDE Components** (6 hours) - MEDIUM RISK
- `ExplorerPanel.tsx` - Update file tree loading
- `StatusBar.tsx` - Update project status display
- Any IDE components using project-store.ts
- Test IDE functionality thoroughly

**Batch 3: File Sync Services** (8 hours) - MEDIUM-HIGH RISK
- `knowledge-file-sync-service.ts` - Update to use new snapshot store
- `project-knowledge-sync.ts` - Update to use new project + snapshot stores
- `ide-file-sync-service.ts` - Update to use new snapshot store
- Test sync functionality in all workspaces

**Batch 4: Remaining Components** (3 hours) - LOW RISK
- Any remaining components using old stores
- Full workspace testing (IDE, Knowledge, Notes, Study)

**Deliverables**:
- All components migrated to new stores
- No remaining imports of old stores
- All workspaces functional
- Test coverage ≥80%

---

### Phase 3: Create Hub Route (4-6 hours)

**Step 1: Create hub.tsx Route File** (1 hour)
- Create `src/routes/hub.tsx`
- Implement lazy loading for HubHomePage
- Add route guards (check authentication if needed)

**Step 2: Update Navigation** (2 hours)
- Add Hub link to navigation menu
- Update sidebar/workspace switcher
- Add keyboard shortcut (Ctrl+H / Cmd+H)

**Step 3: Test Hub Routing** (1 hour)
- Test direct URL navigation to /hub
- Test navigation menu link
- Test keyboard shortcut
- Test mobile navigation

**Step 4: Document Hub Usage** (1 hour)
- Add Hub documentation to AGENTS.md
- Create user guide for Hub usage
- Add screenshots to docs

**Deliverables**:
- hub.tsx route file created
- Hub accessible via URL, menu, and keyboard shortcut
- Documentation complete

---

### Phase 4: File Sync Consolidation (30-35 hours) - OPTIONAL

**Note**: This phase is OPTIONAL and can be deferred to a later epic. Current 4-service architecture is functional, albeit fragmented.

**Step 1: Design Unified Sync Orchestrator** (6 hours)
- Define sync orchestrator interface
- Identify common sync patterns
- Design sync workflow state machine
- Document sync orchestration strategy

**Step 2: Implement Sync Orchestrator** (12 hours)
- Create `sync-orchestrator.ts` (single unified service)
- Implement sync workflow (enqueue → process → complete)
- Add sync queue management (prioritization, batching)
- Implement sync conflict resolution

**Step 3: Migrate Service Logic** (10 hours)
- Extract sync logic from 4 existing services
- Consolidate into orchestrator
- Replace service calls with orchestrator calls
- Test sync functionality in all workspaces

**Step 4: Delete Old Services** (4 hours)
- Delete 4 old sync service files
- Update all imports
- Test build succeeds
- Test all sync functionality

**Step 5: Documentation** (3 hours)
- Document sync orchestrator architecture
- Create migration guide
- Update AGENTS.md and CLAUDE.md

**Deliverables** (if Phase 4 completed):
- 1 unified sync orchestrator (replaces 4 services)
- 4 old service files deleted
- Sync functionality preserved
- Documentation complete

---

### Phase 5: Data Migration (8-10 hours)

**Step 1: Create Migration Script** (4 hours)
- Create `project-migration.ts` script
- Transform old project-store.ts data to new schema
- Transform old file-snapshot-store.ts data to new schema
- Handle FSA handle serialization (special care needed)

**Step 2: Backup Existing Data** (1 hour)
- Create timestamped backup of IndexedDB
- Verify backup integrity
- Store backup location for rollback

**Step 3: Run Migration** (2 hours)
- Execute migration script
- Verify data integrity (counts match)
- Test migrated data (load projects, load snapshots)
- Handle any migration errors gracefully

**Step 4: Cleanup** (2 hours)
- Delete old IndexedDB tables (after verification)
- Run full test suite
- Performance testing (no regression)
- Rollback plan tested

**Deliverables**:
- Migration script created and tested
- All existing data migrated successfully
- Zero data loss
- Rollback plan verified

---

### Phase 6: Testing & Validation (12-15 hours)

**Step 1: Unit Tests** (6 hours)
- 60 unit tests (12 tests per slice × 9 slices)
- Test all slice operations (CRUD, queries, etc.)
- Test cross-slice communication
- Test persistence (save/load from Dexie)
- Test edge cases (empty state, large datasets, etc.)

**Step 2: Integration Tests** (4 hours)
- 20 integration tests
- Test project + snapshot store integration
- Test sync service integration (if Phase 4 completed)
- Test component + store integration
- Test data migration

**Step 3: E2E Tests** (3 hours)
- 15 E2E tests
- Test project creation flow
- Test Hub navigation flow
- Test workspace switching flow
- Test file sync flow (all workspaces)
- Test permission restoration flow

**Step 4: Performance Testing** (2 hours)
- Benchmark project CRUD operations
- Benchmark snapshot cache operations
- Identify bottlenecks
- Optimize critical paths

**Deliverables**:
- 95 tests passing (60 unit + 20 integration + 15 E2E)
- Test coverage ≥80%
- Performance benchmarks passing
- Zero performance regression

---

## Part 4: Breaking Changes

### Minimal Breaking Changes (Facade Pattern)

**Using Facade Exports**:
```typescript
// Old store (deprecated but functional)
export const useProjectStore = create<ProjectStoreState>() { /* ... */ }

// New unified store
export const useProjectStoreNew = create<ProjectState>() { /* ... */ }

// Facade exports for backward compatibility
export const projects = () => useProjectStoreNew(s => s.projects)
export const createProject = () => useProjectStoreNew(s => s.createProject)
// ... re-export all old methods
```

**Impact**: Components can continue using old API while being gradually migrated

---

### Required Changes for Components

**Before**:
```typescript
import { useProjectStore } from '@/lib/workspace/project-store';

const MyComponent = () => {
  const projects = useProjectStore(s => s.projects);
  const createProject = useProjectStore(s => s.createProject);
  // ...
};
```

**After**:
```typescript
import { useProjectStore } from '@/infrastructure/persistence/stores/project/use-project-store';

const MyComponent = () => {
  const projects = useProjectStore(s => s.projects);
  const createProject = useProjectStore(s => s.createProject);
  // ...
};
```

**Breaking Changes**:
- Import path changes
- Some method signatures may be consolidated (e.g., `updateProjectPermissions` instead of separate permission methods)
- Some types may be renamed for clarity

**Mitigation**:
- Facade exports maintain backward compatibility during migration
- Gradual component migration (batches, lowest risk first)
- Comprehensive testing after each batch

---

## Part 5: Test Requirements

### Unit Tests (60 tests total)

**Project CRUD Slice** (12 tests):
- Test project creation
- Test project update
- Test project deletion
- Test get project by ID
- Test get all projects
- Test set active project
- Test get recent projects (default limit)
- Test get recent projects (custom limit)
- Test project metadata structure
- Test FSA handle persistence
- Test exclusion patterns
- Test timestamps tracking

**Project Workspace Bindings Slice** (12 tests):
- Test set workspace binding
- Test set default workspace
- Test is project available in workspace
- Test get default workspace for project
- Test get projects for workspace
- Test workspace binding structure
- Test multiple workspace bindings
- Test workspace unbinding
- Test workspace filtering
- Test default workspace behavior
- Test workspace type safety
- Test binding state persistence

**Project Permissions Slice** (12 tests):
- Test update project permission
- Test get project permission
- Test get projects with permission
- Test check project permission
- Test invalidate project permission
- Test permission state structure
- Test permission caching
- Test permission refresh
- Test batch permission checks
- Test permission validation
- Test FSA handle integration
- Test permission error handling

**Project Layout Slice** (10 tests):
- Test save project layout
- Test get project layout
- Test clear project layout
- Test layout persistence
- Test layout structure (panel sizes, open files, active file)
- Test layout restoration
- Test layout state integrity
- Test layout update behavior
- Test layout deletion
- Test layout per-project isolation

**Project Utils Slice** (14 tests):
- Test filter projects
- Test sort projects
- Test search projects
- Test get project stats
- Test filter predicate functions
- Test sort comparator functions
- Test search case-insensitive
- Test search by name
- Test search by path
- Test project stats calculation
- Test file count accuracy
- Test project size calculation
- Test stats caching
- Test empty results handling

**Snapshot Metadata Slice** (10 tests):
- Test save snapshot metadata
- Test get snapshot metadata
- Test get file tree
- Test invalidate snapshot
- Test metadata structure
- Test metadata persistence
- Test file tree generation
- Test tree hierarchy accuracy
- Test cache invalidation
- Test metadata expiration

**Snapshot Cache Slice** (12 tests):
- Test get cached content
- Test save cached content
- Test is cache fresh
- Test clear expired cache
- Test cache hit behavior
- Test cache miss behavior
- Test cache freshness check
- Test content loading
- Test cache eviction
- Test TTL enforcement
- Test lazy loading
- Test quota handling

**Snapshot Bulk Ops Slice** (8 tests):
- Test save bulk snapshots
- Test get bulk snapshots
- Test clear project cache
- Test bulk operation chunking
- Test batch size limits
- Test bulk save performance
- Test bulk get performance
- Test project isolation

**Snapshot Quota Slice** (10 tests):
- Test get cache size
- Test evict oldest entries
- Test enforce quota limit
- Test quota calculation
- Test eviction strategy (LRU)
- Test quota error handling
- Test quota enforcement
- Test cache cleanup
- Test size accuracy
- Test quota persistence

---

### Integration Tests (20 tests total)

**Project Store Integration** (10 tests):
- Test project CRUD with persistence
- Test workspace bindings with projects
- Test permission checks with FSA operations
- Test layout persistence with project switching
- Test query helpers across slices
- Test cross-slice communication
- Test store hydration (empty state)
- Test store hydration (existing state)
- Test concurrent operations (multiple slices)
- Test state consistency (no race conditions)

**Snapshot Store Integration** (6 tests):
- Test snapshot metadata with content cache
- Test bulk operations with quota management
- Test cache invalidation with freshness checks
- Test cross-slice communication
- Test persistence (save/load from Dexie)
- Test lazy loading behavior

**Component Integration** (4 tests):
- Test Hub components with project store
- Test IDE components with snapshot store
- Test file sync services with stores
- Test workspace switching with stores

---

### E2E Tests (15 tests total)

**Project Management Flows** (5 tests):
- Test project creation flow (Hub → select folder → create)
- Test project deletion flow (Hub → delete → confirm)
- Test project switching flow (Hub → select project → IDE loads)
- Test workspace binding flow (Hub → bindings dialog → select workspaces)
- Test permission restoration flow (reload page → permissions restored)

**Hub Navigation Flows** (3 tests):
- Test Hub URL navigation (navigate to /hub)
- Test Hub menu navigation (click menu link)
- Test Hub keyboard shortcut (Ctrl+H / Cmd+H)

**File Sync Flows** (4 tests):
- Test IDE file sync (create file → sync to WebContainer)
- Test Knowledge file sync (upload PDF → sync to knowledge graph)
- Test Notes file sync (create note → sync to notes workspace)
- Test Study file sync (create flashcard → sync to study workspace)

**Error Handling Flows** (3 tests):
- Test permission denied flow (deny FSA permission → error message)
- Test quota exceeded flow (cache full → evict old entries)
- Test migration error flow (migration fails → rollback)

---

## Part 6: Implementation Checklist

### Pre-Migration Checklist (7 items)

- [ ] Read and understand Cornerstone 4 analysis (Iteration 4)
- [ ] Read and understand ADR-004 (Project Workspace Binding)
- [ ] Review Cornerstone 1 & 2 slice patterns (reference implementations)
- [ ] Set up branch for Cornerstone 4 refactoring (`feature/cornerstone-4-refactoring`)
- [ ] Create baseline performance benchmarks
- [ ] Create backup of current IndexedDB data
- [ ] Communicate migration plan to team (if applicable)

---

### Phase 1 Checklist: Create New Stores (8 items)

- [ ] Create 5 project slice files (all ≤120 lines)
- [ ] Create use-project-store.ts unified store
- [ ] Create 4 file snapshot slice files (all ≤120 lines)
- [ ] Create use-file-snapshot-store.ts unified store
- [ ] Add Dexie persistence with partialize (both stores)
- [ ] Create facade exports for backward compatibility
- [ ] Write integration tests for both stores
- [ ] Document new store architecture

---

### Phase 2 Checklist: Component Migration (4 batches)

**Batch 1: Hub Components** (5 items)
- [ ] Migrate HubHomePage.tsx
- [ ] Migrate ProjectCard.tsx
- [ ] Migrate WorkspaceBindingDialog.tsx
- [ ] Migrate MobileProjectSelector.tsx
- [ ] Test Hub functionality

**Batch 2: IDE Components** (3 items)
- [ ] Migrate ExplorerPanel.tsx
- [ ] Migrate StatusBar.tsx
- [ ] Test IDE functionality

**Batch 3: File Sync Services** (3 items)
- [ ] Migrate knowledge-file-sync-service.ts
- [ ] Migrate project-knowledge-sync.ts
- [ ] Migrate ide-file-sync-service.ts

**Batch 4: Remaining Components** (2 items)
- [ ] Migrate remaining components using old stores
- [ ] Test all workspaces (IDE, Knowledge, Notes, Study)

---

### Phase 3 Checklist: Create Hub Route (4 items)

- [ ] Create src/routes/hub.tsx route file
- [ ] Add Hub link to navigation menu
- [ ] Add Hub keyboard shortcut (Ctrl+H / Cmd+H)
- [ ] Test Hub routing (URL, menu, keyboard)

---

### Phase 4 Checklist: File Sync Consolidation (OPTIONAL) (5 items)

- [ ] Design unified sync orchestrator interface
- [ ] Implement sync-orchestrator.ts
- [ ] Migrate service logic from 4 old services
- [ ] Delete 4 old sync service files
- [ ] Document sync orchestrator architecture

---

### Phase 5 Checklist: Data Migration (4 items)

- [ ] Create project migration script
- [ ] Create timestamped backup of IndexedDB
- [ ] Run migration and verify data integrity
- [ ] Cleanup old IndexedDB tables (after verification)

---

### Phase 6 Checklist: Testing & Validation (4 items)

- [ ] Write and run 60 unit tests (all passing)
- [ ] Write and run 20 integration tests (all passing)
- [ ] Write and run 15 E2E tests (all passing)
- [ ] Run performance benchmarks (no regression)

---

### Post-Migration Checklist (7 items)

- [ ] Run full test suite (all tests passing)
- [ ] Run pnpm build (zero errors, zero warnings)
- [ ] Test all workspaces (IDE, Knowledge, Notes, Study)
- [ ] Test Hub routing (URL, menu, keyboard)
- [ ] Test file sync (all workspaces)
- [ ] Update AGENTS.md with new store locations
- [ ] Update CLAUDE.md with new architecture

---

## Part 7: Rollback Plan

### Trigger Criteria

**Rollback should be triggered if**:
1. Data loss detected during migration
2. Critical functionality broken (project creation, file sync)
3. Performance regression >2x baseline
4. Test coverage falls below 70%
5. IndexedDB corruption detected
6. Migration script fails repeatedly

---

### Rollback Process (6 steps, <2 hours)

**Step 1: Stop Development** (5 minutes)
- Commit current work (even if broken)
- Create rollback branch (`rollback/cornerstone-4-migration`)
- Communicate rollback to team (if applicable)

**Step 2: Restore Data Backup** (10 minutes)
- Locate timestamped IndexedDB backup
- Restore backup to IndexedDB
- Verify data integrity (counts match pre-migration)
- Test data accessibility (can load projects, snapshots)

**Step 3: Revert Code Changes** (15 minutes)
- `git revert` all migration commits
- OR `git reset` to pre-migration commit
- Verify old store files restored
- Verify old component imports restored

**Step 4: Verify Build** (5 minutes)
- Run `pnpm build` (should succeed)
- Run `pnpm test` (all tests passing)
- Check for TypeScript errors (should be zero)

**Step 5: Test Critical Functionality** (30 minutes)
- Test project creation (Hub → create project)
- Test file sync (IDE → create file → sync)
- Test workspace switching (switch between workspaces)
- Test permission restoration (reload page → permissions work)
- Test Hub routing (navigate to /hub)

**Step 6: Document Rollback** (10 minutes)
- Document rollback reason
- Document issues encountered
- Document lessons learned
- Update epic status (FAILED → NEEDS RETRY)

**Total Rollback Time**: <2 hours

---

### Rollback Verification

**Success Criteria**:
- All projects restored (no data loss)
- All snapshots restored (no data loss)
- All functionality working (pre-migration state)
- Build succeeds (zero errors)
- All tests passing

**If Rollback Fails**:
- Escalate to senior architect
- Consider data recovery from secondary backup
- Document critical failure
- Postpone migration until root cause identified

---

## Part 8: Success Criteria

### Must Have (Minimum Viable Migration)

- [ ] All 9 slices created and integrated into unified stores
- [ ] All components migrated to new stores (zero old imports)
- [ ] Migration script successfully transforms 100% of existing data
- [ ] 95 tests passing (60 unit + 20 integration + 15 E2E)
- [ ] Zero TypeScript errors
- [ ] pnpm build succeeds with no warnings
- [ ] Hub routing functional (/hub accessible via URL)
- [ ] No performance regression (project load time <500ms)
- [ ] Rollback plan tested and verified
- [ ] Documentation complete (AGENTS.md, CLAUDE.md, migration guide)

---

### Should Have (Stretch Goals)

- [ ] Test coverage ≥85%
- [ ] All components ≤120 lines
- [ ] File sync consolidation completed (Phase 4)
- [ ] Performance improvement >20% (vs. baseline)
- [ ] Migration script automatically runs on first load
- [ ] Analytics dashboard for cache hit rates

---

### Could Have (Nice to Have)

- [ ] Advanced quota management (predictive eviction)
- [ ] Sync conflict resolution UI
- [ ] Project analytics dashboard
- [ ] Export/import projects
- [ ] Project templates

---

## Part 9: Target Health Score

**Current Health Score**: 6/10 ⚠️

**Issues**:
- 2 god stores (959 lines)
- Fragmented file sync services (1,421 lines)
- Hub not properly routed
- No slice pattern

**Target Health Score**: 9/10 ✅

**Improvements**:
- ✅ 9 modular slices (all ≤120 lines)
- ✅ Single bounded stores (project + snapshot)
- ✅ Hub properly routed (/hub accessible)
- ✅ Slice pattern (follows December 2025 Zustand best practices)
- ✅ Facade exports (backward compatibility)
- ✅ Zero circular dependencies
- ✅ Test coverage ≥80%
- ✅ Performance maintained (no regression)

**Estimated Time to Target**: 80-100 hours (12-15 days)

---

## References

- [Cornerstone 4 Analysis](cornerstone-4-project-analysis.md) - Iteration 4 analysis
- [Iteration 4 Completion Summary](iteration-4-completion-summary.md) - Iteration 4 findings
- [ADR-004: Project Workspace Binding](adrs/ADR-004-project-workspace-binding.md) - Architecture decision
- [Cornerstone 3 Detailed Gap Documentation](cornerstone-3-detailed-gap-documentation.md) - Reference for same pattern
- [Agent Store Architecture](adrs/ADR-002-agent-vault-architecture.md) - Reference implementation (Cornerstone 2)

---

**END OF CORNERSTONE 4 DETAILED GAP DOCUMENTATION**
