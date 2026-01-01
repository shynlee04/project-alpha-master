# ADR-004: Project Workspace Binding

**Status**: PROPOSED
**Date**: 2026-01-02
**Context**: Cornerstone 4 Analysis (Iteration 4)
**Related**: Story WB-1 (Workspace Binding)

---

## Context

The current Project & File System integration has **PARTIAL IMPLEMENTATION** with architectural issues:

### Problems Identified

1. **Two God Stores**:
   ```typescript
   src/lib/workspace/project-store.ts (450 lines) - GOD STORE (1.5x over limit)
   src/lib/filesystem/file-snapshot-store.ts (509 lines) - GOD STORE (1.7x over limit)
   ```

2. **Fragmented File Sync Services**:
   ```typescript
   knowledge-file-sync-service.ts (298 lines)
   project-knowledge-sync.ts (248 lines)
   ide-file-sync-service.ts (223 lines)
   file-sync-service.ts (161 lines)
   // Total: 1,421 lines across 4 services
   ```

3. **Hub Not Properly Routed**:
   - HubHomePage.tsx exists (with 8-bit boot animation)
   - No `hub.tsx` route file
   - Hub not discoverable via URL routing

4. **Workspace Binding Logic**:
   - Story WB-1 implemented in backend
   - Frontend UI exists but not documented
   - No clear user journey for binding workspaces

**Health Score**: 6/10 ⚠️ (Moderate refactoring needed)

---

## Decision

Implement **Unified Project Store with Slice Pattern** and fix Hub routing.

### Target Architecture

```
src/infrastructure/persistence/stores/projects/
├── project-store.ts (150 lines) - Single bounded store
└── slices/
    ├── project-crud-slice.ts (~140 lines)
    ├── workspace-binding-slice.ts (~130 lines)
    ├── file-sync-slice.ts (~120 lines)
    ├── snapshot-cache-slice.ts (~110 lines)
    └── project-utils-slice.ts (~80 lines)
```

**Total Lines**: ~580 lines across 6 focused slices (vs. 959 lines in 2 god stores)

**Reduction**: 959 → 580 lines (40% reduction)

---

## Proposed Schema

### Core Entities

```typescript
/**
 * Project Metadata: Top-level project container
 */
interface ProjectMetadata {
  // Identity
  id: string;
  name: string;
  folderPath: string;
  fsaHandle: FileSystemDirectoryHandle; // File System Access API handle

  // Timestamps
  createdAt: string;
  lastOpened: string;

  // Sync Configuration
  autoSync: boolean;
  exclusionPatterns: string[];
  syncInterval?: number; // In seconds

  // Workspace Bindings (Story WB-1)
  workspaceBindings: WorkspaceBindings;

  // File Snapshot Configuration (Story WB-2)
  fileSnapshotEnabled: boolean;
  snapshotStrategy: 'eager' | 'lazy' | 'on-demand';

  // Layout State
  layoutState?: LayoutConfig;

  // Permissions State
  lastKnownPermissionState?: FsaPermissionState;
}

/**
 * Workspace Bindings: Which workspaces can access this project
 */
interface WorkspaceBindings {
  ide: {
    enabled: boolean;
    readOnly: boolean;
    tools: string[]; // File read, write, execute, etc.
  };
  knowledge: {
    enabled: boolean;
    asSources: boolean; // Include in RAG/embedding
    autoIndex: boolean; // Automatically index new files
  };
  notes: {
    enabled: boolean;
    notesPath?: string; // Subfolder for notes
    autoCreate: boolean; // Auto-create project notes
  };
  study: {
    enabled: boolean;
    materialsPath?: string; // Subfolder for study materials
    autoGenerate: boolean; // Auto-generate flashcards/quizzes
  };
}

/**
 * File Snapshot: Cached file content
 */
interface FileSnapshot {
  projectId: string;
  filePath: string;
  fileHash: string; // SHA-256 for change detection
  content: string | null; // Null if lazy-loaded
  metadata: {
    size: number;
    mimeType: string;
    lastModified: string;
    encoding?: string;
  };
  createdAt: string;
  expiresAt: string; // TTL-based expiration
}
```

---

## Slice Breakdown

### 1. Project CRUD Slice (~140 lines)

**Responsibility**: Project lifecycle management

```typescript
interface ProjectCrudState {
  projects: Record<string, ProjectMetadata>;

  // CRUD operations
  createProject: (name: string, folderHandle: FileSystemDirectoryHandle) => Promise<ProjectMetadata>;
  deleteProject: (id: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<ProjectMetadata>) => void;

  // Queries
  getProject: (id: string) => ProjectMetadata | undefined;
  getAllProjects: () => ProjectMetadata[];
  getRecentProjects: (limit?: number) => ProjectMetadata[];

  // Project lifecycle
  openProject: (id: string) => Promise<void>; // Request FSA permissions
  closeProject: (id: string) => void;
  setActiveProject: (id: string) => void;

  // FSA permissions
  checkPermissions: (id: string) => Promise<FsaPermissionState>;
  requestPermissions: (id: string) => Promise<boolean>;
}
```

**Key Features**:
- File System Access API integration
- Permission lifecycle management
- Recent projects tracking
- Active project management

---

### 2. Workspace Binding Slice (~130 lines)

**Responsibility**: Manage which workspaces can access projects

```typescript
interface WorkspaceBindingState {
  // Binding operations
  bindWorkspace: (projectId: string, workspaceType: WorkspaceType, config: WorkspaceBindingConfig) => void;
  unbindWorkspace: (projectId: string, workspaceType: WorkspaceType) => void;
  updateWorkspaceBinding: (projectId: string, workspaceType: WorkspaceType, updates: Partial<WorkspaceBindingConfig>) => void;

  // Queries
  isWorkspaceBound: (projectId: string, workspaceType: WorkspaceType) => boolean;
  getWorkspaceBinding: (projectId: string, workspaceType: WorkspaceType) => WorkspaceBindingConfig | undefined;
  getProjectsForWorkspace: (workspaceType: WorkspaceType) => ProjectMetadata[];

  // Route guards (use in workspace routes)
  requireProjectBinding: (workspaceType: WorkspaceType) => boolean;

  // Default bindings
  setDefaultBindings: (projectId: string, bindings: Partial<WorkspaceBindings>) => void;
  autoBindAllWorkspaces: (projectId: string) => void;
}
```

**Key Features**:
- Per-workspace enable/disable
- Tool availability configuration
- Route guard integration
- Default binding templates

---

### 3. File Sync Slice (~120 lines)

**Responsibility**: Orchestrate file synchronization between Local FS and WebContainer

```typescript
interface FileSyncState {
  // Sync operations
  syncProject: (projectId: string) => Promise<SyncResult>;
  syncFile: (projectId: string, filePath: string) => Promise<void>;
  syncMultiple: (projectId: string, filePaths: string[]) => Promise<SyncResult>;

  // Sync status
  getSyncStatus: (projectId: string) => SyncStatus;
  isSyncing: (projectId: string) => boolean;

  // Sync queue
  syncQueue: Map<string, SyncOperation>; // projectId → operation
  addToSyncQueue: (projectId: string, operation: SyncOperation) => void;
  processSyncQueue: () => Promise<void>;

  // Event handlers
  onFileChanged: (projectId: string, filePath: string) => void;
  onFileCreated: (projectId: string, filePath: string) => void;
  onFileDeleted: (projectId: string, filePath: string) => void;

  // Exclusions
  isExcluded: (projectId: string, filePath: string) => boolean;
  addExclusionPattern: (projectId: string, pattern: string) => void;
  removeExclusionPattern: (projectId: string, pattern: string) => void;
}
```

**Key Features**:
- Unified sync orchestrator (consolidates 4 services)
- Event-driven sync (file watchers)
- Sync queue management
- Exclusion pattern support

---

### 4. Snapshot Cache Slice (~110 lines)

**Responsibility**: Manage file content cache (lazy loading)

```typescript
interface SnapshotCacheState {
  // Snapshot CRUD
  saveSnapshot: (snapshot: FileSnapshot) => Promise<void>;
  getSnapshot: (projectId: string, filePath: string) => Promise<FileSnapshot | undefined>;
  deleteSnapshot: (projectId: string, filePath: string) => Promise<void>;
  clearSnapshots: (projectId: string) => Promise<void>;

  // Lazy loading
  loadFileContent: (projectId: string, filePath: string) => Promise<string>;
  prefetchContent: (projectId: string, filePaths: string[]) => Promise<void>;

  // Cache management
  invalidateSnapshot: (projectId: string, filePath: string) => void;
  invalidateAllSnapshots: (projectId: string) => void;
  cleanupExpiredSnapshots: (projectId: string) => Promise<void>;

  // Change detection
  hasFileChanged: (projectId: string, filePath: string, currentHash: string) => boolean;
  getFileHash: (content: string) => Promise<string>; // SHA-256

  // Bulk operations
  getFileTree: (projectId: string) => Promise<FileTree>;
  batchSnapshots: (projectId: string, snapshots: FileSnapshot[]) => Promise<void>;
}
```

**Key Features**:
- Two-table schema (metadata + content)
- Lazy content loading (load on demand)
- TTL-based expiration (5 minutes default)
- Hash-based change detection
- Bulk operations (chunked by 100)

---

### 5. Project Utils Slice (~80 lines)

**Responsibility**: Helper functions and queries

```typescript
interface ProjectUtilsState {
  // Search and filter
  searchProjects: (query: string) => ProjectMetadata[];
  filterByBinding: (workspaceType: WorkspaceType) => ProjectMetadata[];

  // Statistics
  getProjectStats: (projectId: string) => ProjectStats;
  getTotalStorageUsed: (projectId: string) => Promise<number>;

  // Export/import
  exportProjectMetadata: (projectId: string) => string;
  importProjectMetadata: (data: string) => ProjectMetadata;

  // Cleanup
  deleteOldSnapshots: (projectId: string, olderThan: Date) => Promise<void>;
  compactDatabase: () => Promise<void>;
}
```

---

## Hub Routing Fix

### Current State

```bash
# Hub components exist but no route
src/presentation/components/hub/
├── HubHomePage.tsx ✅ (with 8-bit boot animation)
├── ProjectCard.tsx ✅
├── WorkspaceBindingDialog.tsx ✅
└── MobileProjectSelector.tsx ✅

# Missing: hub.tsx route
src/routes/hub.tsx ❌ DOES NOT EXIST
```

### Fix

**Create** `src/routes/hub.tsx`:

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { HubHomePage } from '@/presentation/components/hub/HubHomePage';

export const Route = createFileRoute('/hub')({
  component: HubHomePage,
});
```

**Add** hub link to navigation:
```typescript
// src/routes/__root.tsx
const navigation = [
  { path: '/hub', label: 'Hub', icon: HubIcon },
  // ... other routes
];
```

---

## Persistence Strategy

### Dexie Schema

```typescript
// dexie-db-projects.ts
export class ProjectsDB extends Dexie {
  projects!: Table<ProjectMetadata, string>;
  fileSnapshots!: Table<FileSnapshot, string>;

  constructor() {
    super('via-gent-projects');

    this.version(1).stores({
      projects: 'id, name, lastOpened, createdAt',
      fileSnapshots: 'projectId, filePath, expiresAt',
    });
  }
}
```

### Zustand Persistence

```typescript
persist(
  (set, get) => ({ ...slices }),
  {
    name: 'project-state',
    storage: createDexieStorage('projectState'),
    partialize: (state) => ({
      projects: state.projects,
      activeProjectId: state.activeProjectId,
      workspaceBindings: state.workspaceBindings,
      // Don't persist: syncQueue, syncStatus
    }),
    onRehydrateStorage: () => (state) => {
      console.log('[ProjectStore] Rehydrated from IndexedDB');
      state?.loadRecentProjects();
    },
  }
)
```

---

## Migration Path

### Phase 1: Create New Store (Non-Breaking)

1. Create new unified store at `src/infrastructure/persistence/stores/projects/`
2. Implement all 5 slices
3. Add comprehensive tests
4. **Do not delete old stores yet**

### Phase 2: Component Migration

1. **Update imports**:
   ```typescript
   // Before
   import { projectStore } from '@/lib/workspace/project-store';

   // After
   import { useProjectStore } from '@/infrastructure/persistence/stores/projects/project-store';
   ```

2. **Migrate components**:
   - HubHomePage.tsx
   - ProjectCard.tsx
   - WorkspaceBindingDialog.tsx
   - MobileProjectSelector.tsx
   - [All project-consuming components]

### Phase 3: File Sync Consolidation

1. **Create unified sync orchestrator**:
   ```typescript
   // src/lib/filesync/unified-sync-orchestrator.ts
   export class UnifiedSyncOrchestrator {
     // Consolidates 4 separate services into one
     // Manages sync queue and event handlers
   }
   ```

2. **Deprecate old services**:
   - Mark as `@deprecated` in JSDoc
   - Add migration notice comments
   - Update call sites to use orchestrator

### Phase 4: Hub Routing Fix

1. Create `src/routes/hub.tsx`
2. Add hub link to navigation
3. Test routing with `pnpm dev`
4. Verify hub accessible via `/hub` URL

### Phase 5: Data Migration & Cleanup

1. Create migration script:
   ```typescript
   // scripts/migrate-projects.ts
   export async function migrateProjects() {
     // Read from old stores
     const oldProjects = await dbOld.projects.toArray();
     const oldSnapshots = await dbOld.fileSnapshots.toArray();

     // Transform to new schema
     const newProjects = transformProjects(oldProjects);

     // Write to new store
     await dbNew.projects.bulkAdd(newProjects);
   }
   ```

2. Run migration on app startup
3. Verify data integrity
4. **Then** delete old stores

---

## Component Updates

### Example: HubHomePage Migration

**Before**:
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/workspace/project-store';

const HubHomePage = () => {
  const projects = useLiveQuery(() => db.projects.orderBy('lastOpened').reverse().toArray());

  // Direct DB access (bypasses store)
};
```

**After**:
```typescript
import { useProjectStore } from '@/infrastructure/persistence/stores/projects/project-store';

const HubHomePage = () => {
  const projects = useProjectStore(s => s.getRecentProjects());
  const bindWorkspace = useProjectStore(s => s.bindWorkspace);

  // Store manages all DB interactions
};
```

---

## File Sync Consolidation

### Before: 4 Separate Services (1,421 lines)

```typescript
knowledge-file-sync-service.ts (298 lines)
project-knowledge-sync.ts (248 lines)
ide-file-sync-service.ts (223 lines)
file-sync-service.ts (161 lines)

// Each service independently:
- Syncs files for its workspace
- Manages sync state
- Handles file watchers
```

### After: Unified Orchestrator (~350 lines)

```typescript
// src/lib/filesync/unified-sync-orchestrator.ts
export class UnifiedSyncOrchestrator {
  // Single sync queue for all workspaces
  private syncQueue: Map<string, SyncOperation>;

  // Event-driven sync (file changes trigger sync)
  onFileChanged(projectId: string, filePath: string) {
    this.addToSyncQueue(projectId, {
      type: 'modify',
      path: filePath,
      priority: this.calculatePriority(projectId, filePath),
    });
  }

  // Process queue with batching
  async processSyncQueue() {
    const batch = this.getNextBatch(10); // Process 10 at a time
    await Promise.all(batch.map(op => this.executeSync(op)));
  }

  // Per-workspace sync configuration
  getWorkspaceSyncConfig(projectId: string, workspaceType: WorkspaceType) {
    return this.workspaceSyncConfigs.get(`${projectId}:${workspaceType}`);
  }
}
```

**Benefits**:
- Single source of truth for sync state
- Coordinated sync (no conflicts between workspaces)
- Batch processing (better performance)
- Unified event handling

---

## Benefits

### 1. Architectural Clarity ✅

**Before**: 2 god stores + 4 fragmented services
**After**: 6 focused slices + unified orchestrator

### 2. Code Reduction ✅

**Before**: 959 + 1,421 = 2,380 lines
**After**: 580 + 350 = 930 lines
**Reduction**: 61% fewer lines

### 3. Hub Discoverability ✅

**Before**: Hub not accessible via URL
**After**: Hub routed at `/hub`, discoverable

### 4. Maintainability ✅

**Before**: File sync logic scattered across 4 services
**After**: Centralized in unified orchestrator

---

## Estimated Effort

| Phase | Effort | Description |
|-------|--------|-------------|
| Phase 1: Create Store | 12-16 hours | Implement 5 slices + tests |
| Phase 2: Component Migration | 8-10 hours | Update 10+ components |
| Phase 3: Sync Consolidation | 10-12 hours | Unified orchestrator |
| Phase 4: Hub Routing Fix | 4-6 hours | Create hub.tsx route |
| Phase 5: Data Migration | 6-8 hours | Migration script + cleanup |
| **Total** | **30-40 hours** | **Full refactoring** |

---

## Compliance with December 2025 Best Practices

| Practice | Target Status |
|----------|---------------|
| Single Bounded Store | ✅ Unified project store |
| Slice Pattern | ✅ 5 focused slices (all <140 lines) |
| Individual Selectors | ✅ Components use `s => s.property` |
| Dexie Persistence | ✅ IndexedDB with two-table schema |
| Domain Services | ✅ Sync orchestrator separated |
| Zero Circular Deps | ✅ Clean unidirectional flow |

---

## Status

**PROPOSED** - Pending Implementation

**Priority**: MEDIUM (Health Score 6/10 - Moderate refactoring needed)

**Next**: Execute phased migration (30-40 hours)

---

**END OF ADR-004**
