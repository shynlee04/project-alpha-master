# EPIC-CP-1: Project Consolidation - User Story Breakdown

**Epic ID**: CP-1
**Status**: PROPOSED
**Priority**: HIGH (P1) ⚠️
**Epic Owner**: Development Team
**Date Created**: 2026-01-02
**Related**: Cornerstone 4 Detailed Gap Documentation, ADR-004

---

## Epic Overview

**Epic Goal**: Refactor 2 project god stores (959 lines) into 9 modular slices following single bounded store pattern proven in Cornerstones 1 & 2, create Hub routing, and optionally consolidate 4 file sync services.

**Business Value**:
- Follows December 2025 Zustand best practices (slice pattern, individual selectors)
- Improves Hub discoverability (currently not accessible via URL)
- Reduces complexity (9 focused slices vs. 2 god stores)
- Enables future features (project analytics, export/import)
- Better maintainability (clear separation of concerns)

**Technical Context**:
- Current health score: 6/10 ⚠️ (moderate debt)
- Target health score: 9/10 ✅
- Estimated effort: 80-100 hours (12-15 days)
- Risk level: MEDIUM (functional but needs architectural improvements)
- Dependencies: None (can start immediately after Epic CC-1 or in parallel)

**Related Artifacts**:
- [Cornerstone 4 Analysis](cornerstone-4-project-analysis.md) - Iteration 4 findings
- [Cornerstone 4 Detailed Gap Documentation](cornerstone-4-detailed-gap-documentation.md) - Migration plan
- [ADR-004: Project Workspace Binding](adrs/ADR-004-project-workspace-binding.md) - Architecture decision
- [Epic CC-1: Conversation Consolidation](epic-cc-1-conversation-consolidation-breakdown.md) - Reference pattern

---

## Epic Scope

### In Scope ✅

1. **Project Store Refactoring**:
   - Create 5 new slice files (CRUD, Bindings, Permissions, Layout, Utils)
   - Migrate all functionality from project-store.ts (450 lines)
   - Ensure 100% feature parity
   - Add Dexie persistence with partialize

2. **File Snapshot Store Refactoring**:
   - Create 4 new slice files (Metadata, Cache, Bulk Ops, Quota)
   - Migrate all functionality from file-snapshot-store.ts (509 lines)
   - Ensure 100% feature parity
   - Maintain lazy loading performance

3. **Hub Routing**:
   - Create hub.tsx route file
   - Add Hub to navigation menu
   - Add keyboard shortcut (Ctrl+H / Cmd+H)
   - Test Hub accessibility

4. **Component Migration**:
   - Update 4+ components to use new project store
   - Update 3 file sync services to use new snapshot store
   - Maintain backward compatibility via facade exports
   - Zero breaking changes to public API

5. **Data Migration**:
   - Create migration script for existing IndexedDB data
   - Transform old schema to new schema
   - Verify data integrity post-migration
   - Handle FSA handle serialization

6. **Testing**:
   - 95 tests across unit, integration, E2E
   - Test coverage target: 80%+
   - Performance testing (no regression)

### Out of Scope ❌

1. **File Sync Consolidation** (deferred to Epic CP-2):
   - Unified sync orchestrator (30-35 hours optional work)
   - Current 4-service architecture is functional
   - Can consolidate later without breaking changes

2. **New Project Features** (deferred to Epic CP-3):
   - Project templates
   - Project export/import
   - Project analytics dashboard
   - Advanced quota management

3. **UI/UX Enhancements** (deferred to Epic CP-4):
   - New Hub design (current Hub is functional)
   - Project management UI improvements
   - Advanced workspace binding UX

---

## Success Criteria

### Must Have (Minimum Viable Epic):

- [ ] All 9 slices created and integrated into unified stores
- [ ] All 4+ components migrated to new stores
- [ ] Hub routing functional (hub.tsx created, /hub accessible)
- [ ] Migration script successfully transforms 100% of existing data
- [ ] 95 tests passing (60 unit + 20 integration + 15 E2E)
- [ ] Zero TypeScript errors
- [ ] pnpm dev build succeeds with no warnings
- [ ] No performance regression (project load time <500ms)
- [ ] Rollback plan tested and verified

### Should Have (Stretch Goals):

- [ ] Test coverage ≥85%
- [ ] All slices ≤120 lines
- [ ] Documentation complete with migration guide
- [ ] Code review approved by senior architect
- [ ] Performance improvement >20% (vs. baseline)

### Could Have (Nice to Have):

- [ ] Migration script automatically runs on first load
- [ ] Analytics dashboard for cache hit rates
- [ ] Project search functionality
- [ ] Advanced quota management (predictive eviction)

---

## User Stories

### Story CP-1.1: Create Project CRUD Slice

**Priority**: HIGHEST (P0) - Blocker for all other stories
**Story Points**: 5
**Estimated Effort**: 6-8 hours
**Dependencies**: None
**Risk**: LOW

**As a**: Developer
**I want**: A project CRUD slice that manages project operations
**So that**: I can create, read, update, and delete projects without duplicating code

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/project/project-crud-slice.ts` exists
   - [ ] File ≤120 lines (excluding imports/comments)
   - [ ] Exports `createProjectCrudSlice` function

2. **State Interface**:
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

3. **Functionality**:
   - [ ] `createProject` auto-generates UUID (using nanoid)
   - [ ] `createProject` sets initial timestamps (createdAt, lastOpened)
   - [ ] `createProject` persists FSA handle (FileSystemDirectoryHandle)
   - [ ] `updateProject` updates `lastOpened` timestamp automatically
   - [ ] `deleteProject` removes project from record
   - [ ] `setActiveProject` updates both activeProjectId and lastOpenedProjectId
   - [ ] `getRecentProjects` returns projects sorted by lastOpened DESC
   - [ ] All getters return typed values (no `any`)

4. **Tests** (12 tests):
   - [ ] Test project creation (with FSA handle)
   - [ ] Test project update
   - [ ] Test project deletion
   - [ ] Test get project by ID
   - [ ] Test get all projects
   - [ ] Test set active project
   - [ ] Test get recent projects (default limit)
   - [ ] Test get recent projects (custom limit)
   - [ ] Test recent projects sorting (lastOpened DESC)
   - [ ] Test FSA handle persistence
   - [ ] Test exclusion patterns support
   - [ ] Test timestamps tracking

**Technical Notes**:
- Use `nanoid` for ID generation (consistent with agents)
- FSA handle persistence requires special care (cannot serialize directly)
- Timestamps in ISO 8601 format
- Follow pattern from `agent-crud-slice.ts`

**Definition of Done**:
- All acceptance criteria met
- 12/12 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CP-1.2: Create Project Workspace Bindings Slice

**Priority**: HIGHEST (P0) - Core functionality
**Story Points**: 5
**Estimated Effort**: 6-8 hours
**Dependencies**: CP-1.1 (Project CRUD Slice)
**Risk**: LOW

**As a**: Developer
**I want**: A project workspace bindings slice that manages workspace associations
**So that**: Projects can be bound to specific workspaces (IDE, Knowledge, Notes, Study)

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/project/project-workspace-bindings-slice.ts` exists
   - [ ] File ≤100 lines (excluding imports/comments)
   - [ ] Exports `createProjectWorkspaceBindingsSlice` function

2. **State Interface**:
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

3. **Functionality**:
   - [ ] `setProjectWorkspaceBinding` updates project's workspaceBindings field
   - [ ] `setProjectDefaultWorkspace` sets default workspace for project
   - [ ] `isProjectAvailableInWorkspace` checks if workspace enabled for project
   - [ ] `getDefaultWorkspaceForProject` returns default workspace or undefined
   - [ ] `getProjectsForWorkspace` filters projects by workspace binding
   - [ ] All getters return typed values

4. **Tests** (12 tests):
   - [ ] Test set workspace binding (enable)
   - [ ] Test set workspace binding (disable)
   - [ ] Test set default workspace
   - [ ] Test is project available in workspace (enabled)
   - [ ] Test is project available in workspace (disabled)
   - [ ] Test get default workspace for project (set)
   - [ ] Test get default workspace for project (not set)
   - [ ] Test get projects for workspace (IDE)
   - [ ] Test get projects for workspace (Knowledge)
   - [ ] Test get projects for workspace (Notes)
   - [ ] Test get projects for workspace (Study)
   - [ ] Test workspace binding persistence

**Technical Notes**:
- Workspace bindings stored in ProjectMetadata.workspaceBindings field
- Workspace types: 'ide' | 'knowledge' | 'notes' | 'study'
- Follow pattern from `agent-workspace-bindings-slice.ts`

**Definition of Done**:
- All acceptance criteria met
- 12/12 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CP-1.3: Create Project Permissions Slice

**Priority**: HIGH (P1) - Data integrity
**Story Points**: 5
**Estimated Effort**: 6-8 hours
**Dependencies**: CP-1.1 (Project CRUD Slice)
**Risk**: LOW

**As a**: Developer
**I want**: A project permissions slice that manages FSA permission state
**So that**: I can track file system access permissions and provide faster dashboard loads

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/project/project-permissions-slice.ts` exists
   - [ ] File ≤110 lines (excluding imports/comments)
   - [ ] Exports `createProjectPermissionsSlice` function

2. **State Interface**:
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

3. **Functionality**:
   - [ ] `updateProjectPermission` updates project's lastKnownPermissionState field
   - [ ] `getProjectPermission` returns cached permission state
   - [ ] `getProjectsWithPermission` filters projects by permission state
   - [ ] `checkProjectPermission` validates FSA handle and updates cache
   - [ ] `invalidateProjectPermission` clears permission cache
   - [ ] All getters return typed values

4. **Tests** (12 tests):
   - [ ] Test update project permission
   - [ ] Test get project permission (cached)
   - [ ] Test get projects with permission (granted)
   - [ ] Test get projects with permission (denied)
   - [ ] Test get projects with permission (prompt)
   - [ ] Test check project permission (valid FSA handle)
   - [ ] Test check project permission (invalid FSA handle)
   - [ ] Test invalidate project permission
   - [ ] Test permission caching behavior
   - [ ] Test permission refresh
   - [ ] Test batch permission checks
   - [ ] Test permission error handling

**Technical Notes**:
- FSA permission states: 'granted' | 'denied' | 'prompt'
- Permission caching for faster dashboard loads (Story 13-5)
- Follow pattern from permission-lifecycle utilities

**Definition of Done**:
- All acceptance criteria met
- 12/12 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CP-1.4: Create Project Layout Slice

**Priority**: MEDIUM (P2) - UX enhancement
**Story Points**: 3
**Estimated Effort**: 4-6 hours
**Dependencies**: CP-1.1 (Project CRUD Slice)
**Risk**: LOW

**As a**: Developer
**I want**: A project layout slice that manages IDE layout state
**So that**: I can restore IDE panel sizes, open files, and active file per project

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/project/project-layout-slice.ts` exists
   - [ ] File ≤80 lines (excluding imports/comments)
   - [ ] Exports `createProjectLayoutSlice` function

2. **State Interface**:
   ```typescript
   interface ProjectLayoutState {
     // Actions
     saveProjectLayout: (projectId: string, layout: LayoutConfig) => void;
     getProjectLayout: (projectId: string) => LayoutConfig | undefined;
     clearProjectLayout: (projectId: string) => void;
   }
   ```

3. **Functionality**:
   - [ ] `saveProjectLayout` updates project's layoutState field
   - [ ] `getProjectLayout` returns layout or undefined
   - [ ] `clearProjectLayout` removes layout from project
   - [ ] All getters return typed values

4. **Tests** (10 tests):
   - [ ] Test save project layout
   - [ ] Test get project layout (saved)
   - [ ] Test get project layout (not saved)
   - [ ] Test clear project layout
   - [ ] Test layout persistence (panel sizes)
   - [ ] Test layout persistence (open files)
   - [ ] Test layout persistence (active file)
   - [ ] Test layout structure (LayoutConfig interface)
   - [ ] Test layout restoration
   - [ ] Test layout per-project isolation

**Technical Notes**:
- LayoutConfig includes panelSizes, openFiles, activeFile
- Stored in ProjectMetadata.layoutState field
- Used for IDE state restoration (Story 27-1c)

**Definition of Done**:
- All acceptance criteria met
- 10/10 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CP-1.5: Create Project Utils Slice

**Priority**: MEDIUM (P2) - Helper functions
**Story Points**: 5
**Estimated Effort**: 6-8 hours
**Dependencies**: CP-1.1, CP-1.2, CP-1.3, CP-1.4 (All other project slices)
**Risk**: LOW

**As a**: Developer
**I want**: A project utils slice with query helpers and filtering
**So that**: I can perform complex queries without duplicating code

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/project/project-utils-slice.ts` exists
   - [ ] File ≤90 lines (excluding imports/comments)
   - [ ] Exports `createProjectUtilsSlice` function

2. **State Interface**:
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

3. **Functionality**:
   - [ ] `filterProjects` accepts predicate function
   - [ ] `sortProjects` accepts comparator function
   - [ ] `searchProjects` searches name and folderPath (case-insensitive)
   - [ ] `getProjectStats` returns stats (file count, total size, etc.)
   - [ ] All functions use other slice getters (no direct state access)

4. **Tests** (14 tests):
   - [ ] Test filter projects (predicate)
   - [ ] Test sort projects (by date)
   - [ ] Test sort projects (by name)
   - [ ] Test search projects (name match)
   - [ ] Test search projects (path match)
   - [ ] Test search projects (case-insensitive)
   - [ ] Test get project stats
   - [ ] Test project stats calculation (file count)
   - [ ] Test project stats calculation (total size)
   - [ ] Test empty results handling
   - [ ] Test predicate functions (various)
   - [ ] Test comparator functions (various)
   - [ ] Test search query parsing
   - [ ] Test stats caching

**Technical Notes**:
- Use `get()` from Zustand to access other slice state
- Avoid direct state manipulation (read-only operations)
- Return new arrays (don't mutate internal state)
- Follow pattern from `agent-utils-slice.ts`

**Definition of Done**:
- All acceptance criteria met
- 14/14 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CP-1.6: Integrate Project Slices into Single Bounded Store

**Priority**: HIGHEST (P0) - Unification
**Story Points**: 5
**Estimated Effort**: 6-8 hours
**Dependencies**: CP-1.1 through CP-1.5 (All 5 project slices)
**Risk**: MEDIUM

**As a**: Developer
**I want**: A single bounded project store that combines all 5 project slices
**So that**: I have a unified source of truth for project state

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/project/use-project-store.ts` exists
   - [ ] File ≤150 lines (excluding imports/comments)
   - [ ] Exports `useProjectStore` (combines all slices)

2. **Store Structure**:
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

3. **Persistence**:
   - [ ] Uses Dexie storage adapter
   - [ ] Persists projects array (core data)
   - [ ] Persists activeProjectId and lastOpenedProjectId
   - [ ] Does NOT persist ephemeral state (search queries, filters)

4. **Hydration**:
   - [ ] Sets `_hasHydrated` flag after hydration
   - [ ] Validates data integrity on hydration
   - [ ] Handles empty state (no projects yet)

5. **Facade Exports** (for backward compatibility):
   ```typescript
   // Re-export old store methods for compatibility
   export const projects = () => useProjectStore(s => s.projects)
   export const createProject = () => useProjectStore(s => s.createProject)
   // etc.
   ```

6. **Tests** (10 integration tests):
   - [ ] Test store initialization
   - [ ] Test slice integration (cross-slice communication)
   - [ ] Test persistence (save/load)
   - [ ] Test hydration (empty state)
   - [ ] Test hydration (existing state)
   - [ ] Test facade exports (backward compatibility)
   - [ ] Test concurrent operations (multiple slices)
   - [ ] Test state consistency (no race conditions)
   - [ ] Test performance (large dataset)
   - [ ] Test memory cleanup (no leaks)

**Technical Notes**:
- Follow exact pattern from `use-app-store.ts` (Cornerstones 1 & 2)
- Use `partialize` to persist only necessary state
- All 5 slices must work together without circular dependencies
- Facade exports enable gradual component migration

**Definition of Done**:
- All acceptance criteria met
- 10/10 integration tests passing
- Code review approved
- Documented in epic progress report
- Store ready for component migration

---

### Story CP-1.7: Create Snapshot Metadata Slice

**Priority**: HIGHEST (P0) - Core functionality
**Story Points**: 5
**Estimated Effort**: 6-8 hours
**Dependencies**: None
**Risk**: LOW

**As a**: Developer
**I want**: A snapshot metadata slice that manages file tree metadata
**So that**: I can load file trees instantly without reading from FSA

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/filesystem/snapshot-metadata-slice.ts` exists
   - [ ] File ≤100 lines (excluding imports/comments)
   - [ ] Exports `createSnapshotMetadataSlice` function

2. **State Interface**:
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

3. **Functionality**:
   - [ ] `saveSnapshotMetadata` updates metadata record
   - [ ] `getSnapshotMetadata` returns metadata or undefined
   - [ ] `getFileTree` builds file tree from metadata
   - [ ] `invalidateSnapshot` removes metadata record
   - [ ] All getters return typed values

4. **Tests** (10 tests):
   - [ ] Test save snapshot metadata
   - [ ] Test get snapshot metadata (exists)
   - [ ] Test get snapshot metadata (not exists)
   - [ ] Test get file tree (empty project)
   - [ ] Test get file tree (nested structure)
   - [ ] Test get file tree (flat structure)
   - [ ] Test invalidate snapshot
   - [ ] Test metadata structure
   - [ ] Test metadata persistence
   - [ ] Test metadata expiration

**Technical Notes**:
- FileTree is lightweight (metadata only, no content)
- Used for instant file tree loads (<100ms)
- Follows Story WB-2 (File Snapshot Store) architecture

**Definition of Done**:
- All acceptance criteria met
- 10/10 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CP-1.8: Create Snapshot Cache Slice

**Priority**: HIGHEST (P0) - Core functionality
**Story Points**: 5
**Estimated Effort**: 6-8 hours
**Dependencies**: CP-1.7 (Snapshot Metadata Slice)
**Risk**: LOW

**As a**: Developer
**I want**: A snapshot cache slice that manages file content caching
**So that**: I can lazy-load file content and avoid re-reading from FSA

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/filesystem/snapshot-cache-slice.ts` exists
   - [ ] File ≤110 lines (excluding imports/comments)
   - [ ] Exports `createSnapshotCacheSlice` function

2. **State Interface**:
   ```typescript
   interface SnapshotCacheState {
     // Actions
     getCachedContent: (projectId: string, path: string) => Promise<CacheLookupResult>;
     saveCachedContent: (projectId: string, path: string, content: string) => Promise<void>;
     isCacheFresh: (projectId: string, path: string) => boolean;
     clearExpiredCache: () => Promise<void>;
   }
   ```

3. **Functionality**:
   - [ ] `getCachedContent` returns cached content if available and fresh
   - [ ] `saveCachedContent` saves content to cache
   - [ ] `isCacheFresh` checks if cache is within TTL (5 minutes default)
   - [ ] `clearExpiredCache` removes all expired cache entries
   - [ ] All getters return typed values

4. **Tests** (12 tests):
   - [ ] Test get cached content (cache hit)
   - [ ] Test get cached content (cache miss)
   - [ ] Test save cached content
   - [ ] Test is cache fresh (within TTL)
   - [ ] Test is cache fresh (expired)
   - [ ] Test clear expired cache
   - [ ] Test cache hit behavior
   - [ ] Test cache miss behavior
   - [ ] Test TTL enforcement
   - [ ] Test lazy loading
   - [ ] Test quota handling
   - [ ] Test cache eviction

**Technical Notes**:
- Cache TTL: 5 minutes default (configurable)
- Lazy loading: content only loaded when user opens file
- Follows Story WB-2 lazy content loading strategy

**Definition of Done**:
- All acceptance criteria met
- 12/12 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CP-1.9: Create Snapshot Bulk Ops Slice

**Priority**: MEDIUM (P2) - Performance optimization
**Story Points**: 5
**Estimated Effort**: 6-8 hours
**Dependencies**: CP-1.7, CP-1.8 (Metadata + Cache slices)
**Risk**: LOW

**As a**: Developer
**I want**: A snapshot bulk ops slice that manages batch operations
**So that**: I can efficiently handle large projects with many files

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/filesystem/snapshot-bulk-ops-slice.ts` exists
   - [ ] File ≤90 lines (excluding imports/comments)
   - [ ] Exports `createSnapshotBulkOpsSlice` function

2. **State Interface**:
   ```typescript
   interface SnapshotBulkOpsState {
     // Actions
     saveBulkSnapshots: (projectId: string, snapshots: Snapshot[]) => Promise<SnapshotSaveResult>;
     getBulkSnapshots: (projectId: string, paths: string[]) => Promise<CacheLookupResult[]>;
     clearProjectCache: (projectId: string) => Promise<void>;
   }
   ```

3. **Functionality**:
   - [ ] `saveBulkSnapshots` saves multiple snapshots in chunks (100 per chunk)
   - [ ] `getBulkSnapshots` retrieves multiple snapshots efficiently
   - [ ] `clearProjectCache` removes all cache entries for project
   - [ ] All getters return typed values

4. **Tests** (8 tests):
   - [ ] Test save bulk snapshots (small batch)
   - [ ] Test save bulk snapshots (large batch)
   - [ ] Test get bulk snapshots
   - [ ] Test clear project cache
   - [ ] Test chunking behavior (100 per chunk)
   - [ ] Test batch size limits
   - [ ] Test bulk save performance
   - [ ] Test bulk get performance

**Technical Notes**:
- Chunk size: 100 snapshots per chunk (configurable)
- Used for large project sync operations
- Follows Story WB-2 bulk operations strategy

**Definition of Done**:
- All acceptance criteria met
- 8/8 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CP-1.10: Create Snapshot Quota Slice

**Priority**: MEDIUM (P2) - Resource management
**Story Points**: 4
**Estimated Effort**: 5-7 hours
**Dependencies**: CP-1.7, CP-1.8, CP-1.9 (All other snapshot slices)
**Risk**: LOW

**As a**: Developer
**I want**: A snapshot quota slice that manages IndexedDB quota
**So that**: I can prevent quota exceeded errors and evict old entries

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/filesystem/snapshot-quota-slice.ts` exists
   - [ ] File ≤80 lines (excluding imports/comments)
   - [ ] Exports `createSnapshotQuotaSlice` function

2. **State Interface**:
   ```typescript
   interface SnapshotQuotaState {
     // Actions
     getCacheSize: () => Promise<number>;
     evictOldestEntries: (projectId: string, sizeKB: number) => Promise<void>;
     enforceQuotaLimit: (maxSizeMB: number) => Promise<void>;
   }
   ```

3. **Functionality**:
   - [ ] `getCacheSize` returns total cache size in bytes
   - [ ] `evictOldestEntries` removes oldest entries to free up space
   - [ ] `enforceQuotaLimit` ensures cache size stays below limit
   - [ ] All getters return typed values

4. **Tests** (10 tests):
   - [ ] Test get cache size (empty cache)
   - [ ] Test get cache size (with entries)
   - [ ] Test evict oldest entries (LRU eviction)
   - [ ] Test evict oldest entries (project-specific)
   - [ ] Test enforce quota limit (under limit)
   - [ ] Test enforce quota limit (over limit)
   - [ ] Test quota calculation accuracy
   - [ ] Test eviction strategy (LRU)
   - [ ] Test quota error handling
   - [ ] Test quota persistence

**Technical Notes**:
- Eviction strategy: Least Recently Used (LRU)
- Quota limit: configurable (default 50MB)
- Follows Story WB-2 quota management strategy

**Definition of Done**:
- All acceptance criteria met
- 10/10 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CP-1.11: Integrate Snapshot Slices into Single Bounded Store

**Priority**: HIGHEST (P0) - Unification
**Story Points**: 5
**Estimated Effort**: 6-8 hours
**Dependencies**: CP-1.7 through CP-1.10 (All 4 snapshot slices)
**Risk**: MEDIUM

**As a**: Developer
**I want**: A single bounded snapshot store that combines all 4 snapshot slices
**So that**: I have a unified source of truth for file snapshot state

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/filesystem/use-file-snapshot-store.ts` exists
   - [ ] File ≤120 lines (excluding imports/comments)
   - [ ] Exports `useFileSnapshotStore` (combines all slices)

2. **Store Structure**:
   ```typescript
   export const useFileSnapshotStore = create<FileSnapshotState>()(
     persist(
       (set, get, api) => ({
         // Slice 1: Metadata
         ...createSnapshotMetadataSlice(set, get, api),

         // Slice 2: Cache
         ...createSnapshotCacheSlice(set, get, api),

         // Slice 3: Bulk Ops
         ...createSnapshotBulkOpsSlice(set, get, api),

         // Slice 4: Quota
         ...createSnapshotQuotaSlice(set, get, api),
       }),
       {
         name: 'file-snapshot-state',
         storage: createDexieStorage('fileSnapshotState'),
         partialize: (state) => ({
           metadata: state.metadata,
         }),
       }
     )
   );
   ```

3. **Persistence**:
   - [ ] Uses Dexie storage adapter
   - [ ] Persists metadata (lightweight, always)
   - [ ] Does NOT persist content cache (lazy-loaded, cached separately)
   - [ ] Does NOT persist ephemeral state (search queries, filters)

4. **Hydration**:
   - [ ] Sets `_hasHydrated` flag after hydration
   - [ ] Validates data integrity on hydration
   - [ ] Handles empty state (no snapshots yet)

5. **Facade Exports** (for backward compatibility):
   ```typescript
   // Re-export old store methods for compatibility
   export const metadata = () => useFileSnapshotStore(s => s.metadata)
   export const saveSnapshot = () => useFileSnapshotStore(s => s.saveSnapshotMetadata)
   // etc.
   ```

6. **Tests** (6 integration tests):
   - [ ] Test store initialization
   - [ ] Test slice integration (cross-slice communication)
   - [ ] Test persistence (save/load)
   - [ ] Test hydration (empty state)
   - [ ] Test facade exports (backward compatibility)
   - [ ] Test performance (large dataset)

**Technical Notes**:
- Follow exact pattern from `use-app-store.ts` (Cornerstones 1 & 2)
- Use `partialize` to persist only necessary state
- All 4 slices must work together without circular dependencies
- Facade exports enable gradual component migration

**Definition of Done**:
- All acceptance criteria met
- 6/6 integration tests passing
- Code review approved
- Documented in epic progress report
- Store ready for component migration

---

### Story CP-1.12: Create Hub Route

**Priority**: HIGH (P1) - UX improvement
**Story Points**: 3
**Estimated Effort**: 4-6 hours
**Dependencies**: None
**Risk**: LOW

**As a**: User
**I want**: A Hub route that I can navigate to via URL
**So that**: I can access the Hub directly without using programmatic navigation

**Acceptance Criteria**:

1. **Route File Created**:
   - [ ] `src/routes/hub.tsx` exists
   - [ ] File ≤80 lines (excluding imports/comments)
   - [ ] Implements lazy loading for HubHomePage

2. **Route Structure**:
   ```typescript
   // hub.tsx
   import { createFileRoute } from '@tanstack/react-router';
   import { HubHomePage } from '@/presentation/components/hub/HubHomePage';

   export const Route = createFileRoute('/hub')({
     component: HubHomePage,
   });
   ```

3. **Navigation Integration**:
   - [ ] Hub link added to navigation menu
   - [ ] Hub link added to sidebar/workspace switcher
   - [ ] Keyboard shortcut added (Ctrl+H / Cmd+H)
   - [ ] Test navigation in all contexts

4. **Tests** (3 tests):
   - [ ] Test Hub URL navigation (/hub)
   - [ ] Test Hub navigation menu link
   - [ ] Test Hub keyboard shortcut

**Technical Notes**:
- Follow TanStack Router file-based routing pattern
- Use lazy loading for better performance
- Add keyboard shortcut in CommandPalette

**Definition of Done**:
- All acceptance criteria met
- 3/3 tests passing
- Manual testing in browser
- Documented in epic progress report

---

### Story CP-1.13: Migrate Hub Components

**Priority**: MEDIUM (P2) - Low risk
**Story Points**: 3
**Estimated Effort**: 3-4 hours
**Dependencies**: CP-1.6 (Project Store), CP-1.12 (Hub Route)
**Risk**: LOW

**As a**: Developer
**I want**: Hub components to use the new unified project store
**So that**: Hub benefits from improved architecture

**Acceptance Criteria**:

1. **Components Identified**:
   - [ ] `HubHomePage.tsx`
   - [ ] `ProjectCard.tsx`
   - [ ] `WorkspaceBindingDialog.tsx`
   - [ ] `MobileProjectSelector.tsx`

2. **Component Migration** (for each component):
   - [ ] Update imports to use `useProjectStore` instead of old project-store
   - [ ] Update method calls to use new API
   - [ ] Test component functionality
   - [ ] Verify no TypeScript errors

3. **Tests** (2 tests per component):
   - [ ] Test component loads with new store
   - [ ] Test component functionality

**Technical Notes**:
- Batch 1: LOW risk (Hub components have simple usage)
- Use facade exports if needed for gradual migration
- No breaking changes to component API

**Definition of Done**:
- All components migrated
- 8/8 tests passing (4 components × 2 tests)
- Manual testing in Hub
- Documented in epic progress report

---

### Story CP-1.14: Migrate IDE Components

**Priority**: MEDIUM (P2) - Medium risk
**Story Points**: 5
**Estimated Effort**: 5-6 hours
**Dependencies**: CP-1.6 (Project Store), CP-1.11 (Snapshot Store), CP-1.13 (Hub Components)
**Risk**: MEDIUM

**As a**: Developer
**I want**: IDE components to use the new unified stores
**So that**: IDE benefits from improved architecture

**Acceptance Criteria**:

1. **Components Identified**:
   - [ ] `ExplorerPanel.tsx`
   - [ ] `StatusBar.tsx`
   - [ ] Any other IDE components using project-store

2. **Component Migration**: Same as CP-1.13

3. **Additional Tests** (for IDE):
   - [ ] Test file tree loading (instant via snapshot metadata)
   - [ ] Test file content loading (lazy via snapshot cache)
   - [ ] Test project switching (preserves layout state)

**Technical Notes**:
- Batch 2: MEDIUM risk (IDE has complex usage)
- Test IDE thoroughly (file operations, project switching)
- Ensure snapshot lazy loading works correctly

**Definition of Done**:
- All components migrated
- Tests passing
- Manual testing in IDE workspace
- Documented in epic progress report

---

### Story CP-1.15: Migrate File Sync Services

**Priority**: MEDIUM (P2) - Medium-high risk
**Story Points**: 8
**Estimated Effort**: 7-8 hours
**Dependencies**: CP-1.11 (Snapshot Store), CP-1.14 (IDE Components)
**Risk**: MEDIUM-HIGH

**As a**: Developer
**I want**: File sync services to use the new unified snapshot store
**So that**: All workspaces benefit from improved snapshot architecture

**Acceptance Criteria**:

1. **Services Identified**:
   - [ ] `knowledge-file-sync-service.ts`
   - [ ] `project-knowledge-sync.ts`
   - [ ] `ide-file-sync-service.ts`

2. **Service Migration** (for each service):
   - [ ] Update imports to use `useFileSnapshotStore` instead of old file-snapshot-store
   - [ ] Update method calls to use new API
   - [ ] Test service functionality
   - [ ] Verify no TypeScript errors

3. **Tests** (3 tests per service):
   - [ ] Test service loads with new store
   - [ ] Test snapshot saving
   - [ ] Test snapshot retrieval

**Technical Notes**:
- Batch 3: MEDIUM-HIGH risk (sync services are critical)
- Test sync functionality in all workspaces (IDE, Knowledge, Notes, Study)
- Ensure quota management works correctly

**Definition of Done**:
- All services migrated
- 9/9 tests passing (3 services × 3 tests)
- Manual testing in all workspaces
- Documented in epic progress report

---

### Story CP-1.16: Create Data Migration Script

**Priority**: HIGH (P1) - Data integrity
**Story Points**: 8
**Estimated Effort**: 7-9 hours
**Dependencies**: CP-1.6, CP-1.11 (Unified Stores)
**Risk**: HIGH (data loss potential)

**As a**: Developer
**I want**: A migration script that transforms existing project data to new schema
**So that**: Users don't lose their existing projects after the update

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/project/migration/project-migration.ts` exists
   - [ ] File ≤200 lines (excluding imports/comments)
   - [ ] Exports `runProjectMigration` function

2. **Migration Function**:
   ```typescript
   export interface MigrationResult {
     success: boolean;
     projectsMigrated: number;
     snapshotsMigrated: number;
     errors: string[];
     duration: number; // milliseconds
   }

   export async function runProjectMigration(): Promise<MigrationResult>
   ```

3. **Migration Steps**:
   - [ ] Step 1: Backup existing IndexedDB data (to `project_backup_{timestamp}`)
   - [ ] Step 2: Read all data from old project-store.ts
   - [ ] Step 3: Read all data from old file-snapshot-store.ts
   - [ ] Step 4: Transform old schema to new schema
   - [ ] Step 5: Write transformed data to new stores
   - [ ] Step 6: Verify data integrity (counts match)

4. **FSA Handle Serialization**:
   - [ ] FSA handles cannot be serialized directly
   - [ ] Convert FSA handle to descriptor (permission state check required)
   - [ ] Restore FSA handle on migration (requires user permission if denied)

5. **Error Handling**:
   - [ ] Validates old data exists before migration
   - [ ] Validates new data is valid after migration
   - [ ] Rolls back to backup on critical errors
   - [ ] Logs all errors with context

6. **Tests** (15 tests):
   - [ ] Test migration with empty old data
   - [ ] Test migration with single project
   - [ ] Test migration with multiple projects
   - [ ] Test FSA handle transformation
   - [ ] Test snapshot transformation
   - [ ] Test data integrity verification
   - [ ] Test rollback on error
   - [ ] Test backup creation
   - [ ] Test old store cleanup
   - [ ] Test migration idempotency
   - [ ] Test migration with corrupted data
   - [ ] Test migration performance (100 projects)
   - [ ] Test migration result structure
   - [ ] Test partial migration (only projects, not snapshots)

**Technical Notes**:
- Use Dexie transactions for atomic operations
- Create timestamped backup before migration
- Verify data integrity before deleting old stores
- Log progress to console for debugging
- Store migration result in IndexedDB for telemetry

**Definition of Done**:
- All acceptance criteria met
- 15/15 tests passing
- Manual testing with real user data (if available)
- Code review approved
- Rollback plan tested
- Documented in epic progress report

---

### Story CP-1.17: Delete Old Stores

**Priority**: HIGH (P1) - Cleanup
**Story Points**: 3
**Estimated Effort**: 3-4 hours
**Dependencies**: CP-1.16 (Migration Script) + all component migrations complete
**Risk**: MEDIUM

**As a**: Developer
**I want**: Old project and snapshot stores deleted to eliminate confusion
**So that**: There's a single source of truth for project state

**Acceptance Criteria**:

1. **Files Deleted**:
   - [ ] `src/lib/workspace/project-store.ts` (450 lines) ✅ DELETED
   - [ ] `src/lib/filesystem/file-snapshot-store.ts` (509 lines) ✅ DELETED

2. **Verification**:
   - [ ] No remaining imports of old stores (search codebase)
   - [ ] pnpm build succeeds with no errors
   - [ ] All workspaces function correctly
   - [ ] Migration script successfully ran (if old data exists)

3. **Tests**:
   - [ ] Test build succeeds
   - [ ] Test no TypeScript errors (import references)
   - [ ] Test all workspaces (manual testing)

**Technical Notes**:
- Only delete after all components migrated and tested
- Keep backups in git history (can revert if needed)
- Update documentation to remove references to old stores

**Definition of Done**:
- Old stores deleted
- No import errors
- Build succeeds
- All workspaces tested
- Documented in epic progress report

---

### Story CP-1.18: Write Epic Documentation

**Priority**: MEDIUM (P2) - Documentation
**Story Points**: 5
**Estimated Effort**: 5-6 hours
**Dependencies**: CP-1.17 (All code complete)
**Risk**: LOW

**As a**: Developer
**I want**: Comprehensive documentation for the project consolidation epic
**So that**: Future developers understand the architecture and can maintain it

**Acceptance Criteria**:

1. **Migration Guide Created**:
   - [ ] `_bmad-output/research/platform-unification-2026-01-02/project-migration-guide.md`
   - [ ] Includes before/after examples
   - [ ] Includes API differences
   - [ ] Includes troubleshooting section

2. **Updated Documentation**:
   - [ ] AGENTS.md updated with new project store pattern
   - [ ] CLAUDE.md updated with project store locations
   - [ ] Code comments added to slice files (JSDoc)

3. **Architecture Diagram**:
   - [ ] Mermaid diagram showing store structure
   - [ ] Data flow diagram (component → store → persistence)
   - [ ] Migration flow diagram (old → new)

4. **Epic Retrospective**:
   - [ ] What went well
   - [ ] What could be improved
   - [ ] Lessons learned
   - [ ] Recommendations for future epics

**Definition of Done**:
- Migration guide complete
- AGENTS.md and CLAUDE.md updated
- Architecture diagrams created
- Epic retrospective written
- Documented in epic progress report

---

## Story Dependencies

```
CP-1.1 (Project CRUD) - NO DEPENDENCIES
    ↓
CP-1.2 (Workspace Bindings) - DEPENDS ON CP-1.1
CP-1.3 (Permissions) - DEPENDS ON CP-1.1
CP-1.4 (Layout) - DEPENDS ON CP-1.1
    ↓
CP-1.5 (Utils) - DEPENDS ON CP-1.1, CP-1.2, CP-1.3, CP-1.4
    ↓
CP-1.6 (Project Store) - DEPENDS ON CP-1.1 THROUGH CP-1.5

CP-1.7 (Snapshot Metadata) - NO DEPENDENCIES (parallel to CP-1.1)
    ↓
CP-1.8 (Snapshot Cache) - DEPENDS ON CP-1.7
    ↓
CP-1.9 (Bulk Ops) - DEPENDS ON CP-1.7, CP-1.8
    ↓
CP-1.10 (Quota) - DEPENDS ON CP-1.7, CP-1.8, CP-1.9
    ↓
CP-1.11 (Snapshot Store) - DEPENDS ON CP-1.7 THROUGH CP-1.10

CP-1.12 (Hub Route) - NO DEPENDENCIES (can work in parallel)
    ↓
CP-1.13 (Hub Components) - DEPENDS ON CP-1.6, CP-1.12
    ↓
CP-1.14 (IDE Components) - DEPENDS ON CP-1.6, CP-1.11, CP-1.13
    ↓
CP-1.15 (Sync Services) - DEPENDS ON CP-1.11, CP-1.14
    ↓
CP-1.16 (Migration Script) - DEPENDS ON CP-1.6, CP-1.11
    ↓
CP-1.17 (Delete Old Stores) - DEPENDS ON CP-1.13 THROUGH CP-1.16 (ALL MIGRATIONS)
    ↓
CP-1.18 (Documentation) - DEPENDS ON CP-1.17 (ALL CODE COMPLETE)
```

**Critical Path**: CP-1.1 → CP-1.2/1.3/1.4 → CP-1.5 → CP-1.6 → CP-1.16 → CP-1.17 → CP-1.18

**Parallel Opportunities**:
- CP-1.7 through CP-1.11 (Snapshot slices) can be developed in parallel with CP-1.1 through CP-1.6 (Project slices)
- CP-1.12 (Hub Route) can be developed independently at any time
- CP-1.18 (Documentation) can start before CP-1.17 (drafting docs while code is in review)

---

## Epic Timeline

### Week 1: Foundation (Stories CP-1.1 through CP-1.6, CP-1.12)
- **Day 1-2**: CP-1.1 (Project CRUD Slice) - 8 hours
- **Day 3-4**: CP-1.2 (Workspace Bindings Slice) - 8 hours
- **Day 5-6**: CP-1.3 (Permissions Slice) - 8 hours
- **Day 7**: CP-1.4 (Layout Slice) - 6 hours
- **Day 8**: CP-1.5 (Utils Slice) - 8 hours
- **Day 9-10**: CP-1.6 (Project Store Integration) - 8 hours
- **Day 11**: CP-1.12 (Hub Route) - 6 hours

**Week 1 Total**: 52 hours (6.5 days)

### Week 2: Snapshot Store & Component Migrations (Stories CP-1.7 through CP-1.15)
- **Day 12-13**: CP-1.7 (Snapshot Metadata) - 8 hours
- **Day 14-15**: CP-1.8 (Snapshot Cache) - 8 hours
- **Day 16**: CP-1.9 (Bulk Ops) - 8 hours
- **Day 17**: CP-1.10 (Quota) - 7 hours
- **Day 18**: CP-1.11 (Snapshot Store Integration) - 8 hours
- **Day 19**: CP-1.13 (Hub Components) - 4 hours
- **Day 20**: CP-1.14 (IDE Components) - 6 hours
- **Day 21-22**: CP-1.15 (Sync Services) - 8 hours

**Week 2 Total**: 57 hours (7 days)

### Week 3: Migration & Cleanup (Stories CP-1.16 through CP-1.18)
- **Day 23-24**: CP-1.16 (Migration Script) - 9 hours
- **Day 25**: CP-1.17 (Delete Old Stores) - 4 hours
- **Day 26-27**: CP-1.18 (Documentation) - 6 hours
- **Day 28**: Epic completion and retrospective - 4 hours

**Week 3 Total**: 23 hours (3 days)

**Grand Total**: 132 hours (16.5 days) ⚠️ Slightly over 80-100 hour estimate

**Note**: Timeline assumes sequential development. With parallel development (project slices + snapshot slices simultaneously), actual time could be 80-100 hours (12-15 days).

---

## Risk Management

### High Risks 🚨

1. **Data Loss During Migration** (CP-1.16):
   - **Mitigation**: Timestamped backups + data integrity verification + FSA handle special handling
   - **Rollback**: Restore from backup (<10 minutes)

2. **FSA Handle Serialization** (CP-1.16):
   - **Mitigation**: Convert to descriptor, require user permission on restore
   - **Rollback**: Skip projects with invalid handles, log error (<5 minutes per project)

3. **Component Migration Breaks File Sync** (CP-1.15):
   - **Mitigation**: Migrate in batches (Hub → IDE → Sync), thorough testing per batch
   - **Rollback**: Revert service changes (<30 minutes)

### Medium Risks ⚠️

4. **Performance Regression** (All stories):
   - **Mitigation**: Benchmark before/after, individual selectors, lazy loading maintained
   - **Rollback**: Optimize slice queries (2-3 hours)

5. **TypeScript Errors Break Build** (All stories):
   - **Mitigation**: Strict type checking, run `pnpm tsc --noEmit` after each story
   - **Rollback**: Revert to last working commit (<5 minutes)

6. **Hub Routing Conflicts** (CP-1.12):
   - **Mitigation**: Check for existing /hub route conflicts, test in all contexts
   - **Rollback**: Revert route changes (<5 minutes)

### Low Risks ✅

7. **Test Coverage Below Target** (All stories):
   - **Mitigation**: TDD approach, aim for 85%+ (exceeds 80% target)
   - **Rollback**: Add more tests (1-2 hours)

---

## Epic Tracking

### Progress Summary

**Total Stories**: 18
**Completed**: 0
**In Progress**: 0
**Pending**: 18

**Estimated Effort**: 132 hours sequential (80-100 hours parallel)
**Actual Effort**: TBD
**Variance**: TBD

**Story Points**: 78
**Velocity**: TBD (stories per week)

### Metrics

- **Test Coverage Target**: 80%+
- **Current Test Coverage**: 0% (baseline)
- **TypeScript Errors**: 0 (target)
- **Build Warnings**: 0 (target)
- **Performance Regression**: None (target: project load <500ms)

### Epic Status

**Status**: PROPOSED
**Start Date**: TBD
**Target End Date**: TBD
**Confidence Level**: HIGH (proven pattern from Cornerstones 1 & 2)

---

## References

- [Cornerstone 4 Analysis](cornerstone-4-project-analysis.md) - Iteration 4 findings
- [Cornerstone 4 Detailed Gap Documentation](cornerstone-4-detailed-gap-documentation.md) - Migration plan
- [ADR-004: Project Workspace Binding](adrs/ADR-004-project-workspace-binding.md) - Architecture decision
- [Epic CC-1: Conversation Consolidation](epic-cc-1-conversation-consolidation-breakdown.md) - Reference pattern
- [Agent Store Architecture](adrs/ADR-002-agent-vault-architecture.md) - Reference implementation (Cornerstone 2)

---

**END OF EPIC-CP-1 USER STORY BREAKDOWN**
