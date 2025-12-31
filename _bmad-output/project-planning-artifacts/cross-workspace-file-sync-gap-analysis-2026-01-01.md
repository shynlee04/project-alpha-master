# Cross-Workspace File Synchronization & Project Space Integration
## Comprehensive Gap Analysis & Implementation Roadmap

**Metadata:**
- **Document Type:** System Architecture Analysis
- **Version:** 1.0.0
- **Created:** 2026-01-01
- **Author:** BMAD Master Orchestrator (@bmad-core-bmad-master)
- **Status:** DRAFT - FOR APPROVAL
- **Scope:** MAJOR (Cross-Workspace Integration)
- **Research Sources:** 4 MCP tool turns + codebase exploration
- **Epic Context:** WB (Workspace Binding & Project Persistence)

---

## Executive Summary

This document provides a comprehensive analysis of cross-workspace file synchronization and project space integration in Via-gent (Project Alpha v2.0). The analysis identifies critical gaps in the brownfield implementation where components operate in isolation without meaningful integration, preventing users from leveraging Project Management and FileTree components to synchronize local resources across knowledge synthesis workspaces.

**Key Finding:** The system has excellent IDE workspace integration (100% complete) but suffers from incomplete implementation for other workspaces:
- IDE Workspace: ████████████████████████ (100%)
- Knowledge: ███████████████████░░░░░░░░░ (70%)
- Notes: ██████████░░░░░░░░░░░░░░░░░░░░ (40%)
- Study: ██████████░░░░░░░░░░░░░░░░░░░░ (40%)

**Critical Gap:** Missing workspace-specific FileSync services for Study and Notes workspaces prevents these workspaces from functioning properly with file operations.

---

## Table of Contents

1. [Current Architecture Overview](#1-current-architecture-overview)
2. [Integration Gap Analysis](#2-integration-gap-analysis)
3. [Brownfield Implementation Deficiencies](#3-brownfield-implementation-deficiencies)
4. [Architectural Recommendations](#4-architectural-recommendations)
5. [UX/UI Evaluation](#5-uxui-evaluation)
6. [Implementation Roadmap](#6-implementation-roadmap)
7. [Best-in-Class Patterns (December 2025)](#7-best-in-class-patterns-december-2025)

---

## 1. Current Architecture Overview

### 1.1 File System Sync Architecture

The system implements a **cache-first file synchronization strategy** with the following components:

#### **LocalFSAdapter** (`src/lib/filesystem/local-fs-adapter.ts`)
- **Purpose:** Clean wrapper around File System Access API
- **Capabilities:** File/directory operations (read, write, create, delete, list)
- **State Management:** Maintains `directoryHandle` for granted access
- **Error Handling:** Custom `FileSystemError` and `PermissionDeniedError` types
- **Browser Compatibility:** Checks for `showDirectoryPicker` support

#### **FileSnapshotStore** (`src/lib/filesystem/file-snapshot-store.ts`)
- **Architecture:** Two-table IndexedDB schema
  - **Table 1: `file_metadata`** - paths, sizes, hashes, timestamps
  - **Table 2: `file_content_cache`** - lazy-loaded content cache
- **Features:**
  - Time-based cache invalidation (5min TTL default)
  - SHA-256 hash-based change detection
  - Bulk operations for large projects
  - Quota management with eviction strategies
- **Performance:** <100ms file tree loads via metadata-only queries

#### **ProjectContextProvider** (`src/lib/filesystem/project-context-provider.ts`)
- **Cache-First Flow:**
  1. Check FileSnapshotStore for cached version
  2. If fresh (TTL valid + hash match): return cached content (instant load)
  3. Else: read from LocalFSAdapter (FSA)
  4. Compute SHA-256 hash
  5. Save snapshot to FileSnapshotStore
  6. Return content
- **Lazy Loading:** Binary files not cached (size concerns)
- **Invalidation:** Manual and automatic (time + hash-based)

#### **SyncManager** (`src/lib/filesystem/sync-manager/sync-manager.ts`)
- **Sync Strategy:** Local FS is source of truth, WebContainer mirrors local files
- **Operations:**
  - `syncToWebContainer()` - Full sync
  - `incrementalSyncToWebContainer()` - Changed files only
  - Dual-write operations (LocalFS + WebContainer)
- **Exclusions:** `.git`, `node_modules`, `.DS_Store`, `Thumbs.db`
- **Event Emission:** Integrates with workspace event bus

---

### 1.2 Workspace Binding Infrastructure

#### **WorkspaceBindings Type** (`src/lib/state/dexie-db-core-types.ts`)
```typescript
export type WorkspaceId = 'ide' | 'notes' | 'knowledge' | 'study';

export interface WorkspaceBindings {
  ide?: boolean;
  notes?: boolean;
  knowledge?: boolean;
  study?: boolean;
}
```

- **Default Configuration:** IDE enabled by default, others disabled
- **Persistence:** Stored in IndexedDB with project metadata
- **Flexible Binding:** Projects can enable any workspace combination

#### **ProjectMetadata Structure**
```typescript
export interface ProjectMetadata {
  // Core Fields
  id: string;
  name: string;
  folderPath: string;
  fsaHandle: FileSystemDirectoryHandle;
  lastOpened: Date;

  // Workspace Fields
  workspaceBindings: WorkspaceBindings;
  fileSnapshotEnabled?: boolean;

  // State Fields
  layoutState?: LayoutConfig;
  exclusionPatterns?: string[];
  lastKnownPermissionState?: PermissionState;

  // Sync Behavior
  autoSync?: boolean;
}
```

#### **ProjectContext** (`src/lib/workspace/ProjectContext.tsx`)
- **Cross-Workspace State Sharing:** Project metadata shared across all workspaces
- **Navigation:** `switchWorkspace()` preserves project state
- **Persistence:** Last workspace saved to localStorage
- **Auto-switch:** Smart workspace restoration on project revisit

---

### 1.3 File Sync Services Architecture

#### **Abstract Interface** (`src/lib/filesync/file-sync-service.ts`)
```typescript
export interface FileSyncService {
  // Read operations
  readFile(path: string): Promise<string>;
  readDirectory(path: string): Promise<FileSystemEntry[]>;

  // Write operations
  writeFile(path: string, content: string): Promise<void>;
  createDirectory(path: string): Promise<void>;

  // Sync operations
  sync(): Promise<void>;
  getSyncStatus(): Promise<SyncStatus>;

  // Event handling
  on(event: FileSyncEvent, handler: EventHandler): void;
  off(event: FileSyncEvent, handler: EventHandler): void;
}
```

#### **Workspace-Specific Implementations:**

| Workspace | Implementation | Status | Capabilities |
|-----------|----------------|--------|--------------|
| **IDE** | `IDEFileSyncService` | ✅ COMPLETE | Full FSA integration, WebContainer sync, lazy loading |
| **Knowledge** | `KnowledgeFileSyncService` | ✅ COMPLETE | Document import, RAG integration, multimodal processing |
| **Study** | `StudyFileSyncService` | ❌ MISSING | Not implemented |
| **Notes** | `NotesFileSyncService` | ❌ MISSING | Not implemented |

---

## 2. Integration Gap Analysis

### 2.1 Critical Integration Failures

#### **🔴 CRITICAL GAP 1: Missing Workspace-Specific Sync Services**

**Location:** `src/lib/filesync/`

**Impact:**
- **Study and Notes workspaces cannot perform file operations**
- Users encounter errors when trying to open/edit files in these workspaces
- Cross-workspace file operations fail silently

**Evidence:**
```typescript
// src/lib/filesync/index.ts
export { IDEFileSyncService } from './ide-file-sync-service';
export { KnowledgeFileSyncService } from './knowledge-file-sync-service';
// ❌ MISSING: StudyFileSyncService
// ❌ MISSING: NotesFileSyncService
```

**Root Cause:**
File sync services only implemented for IDE and Knowledge workspaces during Epic WB stories. Study and Notes workspaces were out of scope for initial implementation.

**Recommendation:**
Implement `StudyFileSyncService` and `NotesFileSyncService` following the pattern established by `IDEFileSyncService`:
```typescript
export class StudyFileSyncService implements FileSyncService {
  constructor(
    private projectId: string,
    private localAdapter: LocalFSAdapter,
    private snapshotStore: FileSnapshotStore
  ) {}

  async readFile(path: string): Promise<string> {
    // Use ProjectContextProvider for cache-first loading
  }

  // ... other FileSyncService methods
}
```

---

#### **🔴 CRITICAL GAP 2: Inconsistent State Management Architecture**

**Location:** `src/lib/workspace/`, `src/lib/state/`

**Impact:**
- **Difficult maintenance** - multiple state management patterns
- **Potential state inconsistencies** - different update mechanisms
- **Developer confusion** - unclear when to use which pattern

**Evidence:**

**Pattern 1: WorkspaceContext (React Context)**
```typescript
// src/lib/workspace/WorkspaceContext.tsx
export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
}
```

**Pattern 2: ProjectContext (React Context)**
```typescript
// src/lib/workspace/ProjectContext.tsx
export const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProjectContext(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjectContext must be used within ProjectProvider');
  return context;
}
```

**Pattern 3: Zustand Stores**
```typescript
// src/lib/state/ide-store.ts
export const useIDEStore = create<IDEState>()(
  persist(
    (set) => ({
      openFiles: [],
      activeFile: null,
      // ...
    }),
    { name: 'ide-state' }
  )
);
```

**Root Cause:**
Evolutionary development without unified state management strategy. Each feature added its preferred pattern.

**Recommendation:**
Unify under single state management architecture using **Zustand + React Context** hybrid pattern:

```typescript
// Proposed: src/lib/state/workspace-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceStore {
  // Project state (persisted)
  projectId: string | null;
  workspaceBindings: WorkspaceBindings;
  lastWorkspace: WorkspaceId | null;

  // Workspace-specific state (ephemeral)
  currentWorkspace: WorkspaceId;
  workspaceData: Partial<Record<WorkspaceId, any>>;

  // Actions
  setProject: (project: ProjectMetadata) => void;
  switchWorkspace: (workspace: WorkspaceId) => void;
  updateBindings: (bindings: WorkspaceBindings) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      projectId: null,
      workspaceBindings: {},
      lastWorkspace: null,
      currentWorkspace: 'ide',
      workspaceData: {},

      setProject: (project) => set({
        projectId: project.id,
        workspaceBindings: project.workspaceBindings,
        lastWorkspace: loadLastWorkspace(project.id),
      }),

      switchWorkspace: (workspace) => {
        const { projectId } = get();
        if (projectId) {
          persistLastWorkspace(projectId, workspace);
        }
        set({ currentWorkspace: workspace });
      },

      updateBindings: (bindings) => set({ workspaceBindings: bindings }),
    }),
    {
      name: 'workspace-state',
      partialize: (state) => ({
        projectId: state.projectId,
        workspaceBindings: state.workspaceBindings,
        lastWorkspace: state.lastWorkspace,
      }),
    }
  )
);

// React Context for dependency injection
const WorkspaceStoreContext = createContext<StoreApi<WorkspaceStore> | null>(null);

export function WorkspaceStoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<StoreApi<WorkspaceStore>>();
  if (!storeRef.current) {
    storeRef.current = createWorkspaceStore();
  }

  return (
    <WorkspaceStoreContext.Provider value={storeRef.current}>
      {children}
    </WorkspaceStoreContext.Provider>
  );
}
```

**Benefits:**
- **Single source of truth** for workspace state
- **Persisted state** survives page reloads
- **React Context** for dependency injection
- **Zustand selectors** for performant subscriptions
- **Type-safe** with TypeScript

---

#### **🔴 CRITICAL GAP 3: Superficial Agent Tool Integration**

**Location:** `src/lib/agent/facades/`

**Impact:**
- **Cannot perform file operations in non-IDE workspaces via AI**
- Agent tools assume LocalFSAdapter access in all contexts
- No workspace-aware validation

**Evidence:**

**AgentFileTools Implementation:**
```typescript
// src/lib/agent/facades/file-tools-impl.ts
export class AgentFileToolsImpl implements AgentFileTools {
  constructor(
    private localAdapter: LocalFSAdapter, // ❌ Assumes IDE workspace
    private permissionManager: ToolPermissionManager
  ) {}

  async readFile(params: ReadFileParams): Promise<ReadFileResult> {
    // ❌ No workspace context validation
    return this.localAdapter.readFile(params.path);
  }
}
```

**Root Cause:**
Agent tools designed for IDE workspace only, no consideration for cross-workspace usage.

**Recommendation:**
Implement workspace-aware agent tool facades:

```typescript
// Proposed: src/lib/agent/facades/workspace-file-tools.ts
export class WorkspaceAwareFileTools implements AgentFileTools {
  private adapters: Map<WorkspaceId, FileSyncService>;

  constructor(
    private projectId: string,
    workspaceServices: Map<WorkspaceId, FileSyncService>
  ) {
    this.adapters = workspaceServices;
  }

  async readFile(params: ReadFileParams): Promise<ReadFileResult> {
    const workspace = this.getCurrentWorkspace();
    const adapter = this.adapters.get(workspace);

    if (!adapter) {
      throw new Error(`No file sync service for workspace: ${workspace}`);
    }

    return adapter.readFile(params.path);
  }

  private getCurrentWorkspace(): WorkspaceId {
    // Get from WorkspaceContext or ProjectContext
    const context = useProjectContext();
    return context.currentWorkspace;
  }
}
```

---

### 2.2 Medium-Priority Gaps

#### **🟡 MEDIUM GAP 4: Missing Cross-Workspace File Operations**

**Location:** All workspaces

**Impact:**
- **Workspace silos** - cannot share documents between workspaces
- Users must manually copy files between workspaces
- No automatic synchronization of file changes

**Current Behavior:**
```
IDE Workspace edits file.txt → Changes NOT reflected in Notes workspace
Notes workspace edits file.txt → Changes NOT reflected in IDE workspace
```

**Required Behavior:**
```
Any workspace edits file.txt → Event broadcast → All workspaces receive update
```

**Recommendation:**
Implement cross-workspace file event system:

```typescript
// Proposed: src/lib/events/cross-workspace-event-bus.ts
import EventEmitter from 'eventemitter3';

export interface FileChangeEvent {
  projectId: string;
  workspaceId: WorkspaceId;
  path: string;
  type: 'created' | 'modified' | 'deleted';
  timestamp: number;
}

export class CrossWorkspaceEventBus extends EventEmitter {
  broadcastFileChange(event: FileChangeEvent) {
    this.emit('file-change', event);
  }

  onFileChange(handler: (event: FileChangeEvent) => void) {
    this.on('file-change', handler);
  }
}

// Usage in FileSyncService implementations
class IDEFileSyncService implements FileSyncService {
  async writeFile(path: string, content: string): Promise<void> {
    await this.localAdapter.writeFile(path, content);

    // Broadcast to other workspaces
    this.eventBus.broadcastFileChange({
      projectId: this.projectId,
      workspaceId: 'ide',
      path,
      type: 'modified',
      timestamp: Date.now(),
    });
  }
}
```

---

#### **🟡 MEDIUM GAP 5: Inconsistent Permission Handling**

**Location:** `src/lib/filesystem/permission-lifecycle.ts`

**Impact:**
- **Inconsistent user experience** - different permission models per workspace
- IDE has full FSA access, others may have different models
- Users confused about which workspaces need which permissions

**Current State:**
- **IDE Workspace:** Requires full FSA directory handle
- **Knowledge Workspace:** Uses document import (no FSA required)
- **Notes/Study Workspaces:** Undefined (not implemented yet)

**Recommendation:**
Unified permission system across workspaces:

```typescript
// Proposed: src/lib/workspace/unified-permission-manager.ts
export interface WorkspacePermissionConfig {
  workspace: WorkspaceId;
  requiresFSA: boolean;
  requiredPermissions: Permission[];
  fallbackStrategy: 'import' | 'template' | 'readonly';
}

export const WORKSPACE_PERMISSION_CONFIGS: Record<WorkspaceId, WorkspacePermissionConfig> = {
  ide: {
    workspace: 'ide',
    requiresFSA: true,
    requiredPermissions: ['read', 'write', 'delete'],
    fallbackStrategy: 'import',
  },
  notes: {
    workspace: 'notes',
    requiresFSA: true,
    requiredPermissions: ['read', 'write'],
    fallbackStrategy: 'template',
  },
  knowledge: {
    workspace: 'knowledge',
    requiresFSA: false,
    requiredPermissions: ['read'],
    fallbackStrategy: 'import',
  },
  study: {
    workspace: 'study',
    requiresFSA: true,
    requiredPermissions: ['read', 'write'],
    fallbackStrategy: 'readonly',
  },
};

export class UnifiedPermissionManager {
  async ensureWorkspaceAccess(
    projectId: string,
    workspace: WorkspaceId
  ): Promise<PermissionState> {
    const config = WORKSPACE_PERMISSION_CONFIGS[workspace];

    if (config.requiresFSA) {
      const project = await getProject(projectId);

      if (!project.fsaHandle) {
        // Request FSA permission
        const handle = await requestDirectoryAccess();
        await updateProject(projectId, { fsaHandle: handle });
      }

      return await checkPermissionState(project.fsaHandle);
    }

    return 'granted';
  }
}
```

---

#### **🟡 MEDIUM GAP 6: No Workspace-Specific File Snapshot Strategy**

**Location:** `src/lib/filesystem/file-snapshot-store.ts`

**Impact:**
- **Poor performance in non-IDE workspaces**
- Cache TTL and eviction patterns don't consider workspace needs
- Knowledge workspace may need different caching than IDE

**Current Behavior:**
- All workspaces use same 5-minute TTL
- No workspace-specific cache size limits
- Binary file exclusion applies to all workspaces equally

**Required Behavior:**
- **IDE Workspace:** Short TTL (5min), prioritize source code files
- **Knowledge Workspace:** Long TTL (24h), prioritize documents/PDFs
- **Notes Workspace:** Medium TTL (1h), prioritize markdown files
- **Study Workspace:** Medium TTL (1h), prioritize flashcards/notes

**Recommendation:**
Workspace-aware caching strategy:

```typescript
// Proposed: src/lib/filesystem/workspace-cache-strategy.ts
export interface WorkspaceCacheStrategy {
  ttl: number; // milliseconds
  maxCacheSize: number; // bytes
  prioritizeExtensions: string[];
  excludePatterns: string[];
  cacheBinaryFiles: boolean;
}

export const WORKSPACE_CACHE_STRATEGIES: Record<WorkspaceId, WorkspaceCacheStrategy> = {
  ide: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    prioritizeExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    excludePatterns: ['node_modules', '.git', 'dist', 'build'],
    cacheBinaryFiles: false,
  },
  knowledge: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxCacheSize: 500 * 1024 * 1024, // 500MB
    prioritizeExtensions: ['.pdf', '.md', '.txt', '.docx'],
    excludePatterns: ['.git'],
    cacheBinaryFiles: true, // Cache PDFs, images
  },
  notes: {
    ttl: 60 * 60 * 1000, // 1 hour
    maxCacheSize: 100 * 1024 * 1024, // 100MB
    prioritizeExtensions: ['.md', '.txt'],
    excludePatterns: ['.git'],
    cacheBinaryFiles: false,
  },
  study: {
    ttl: 60 * 60 * 1000, // 1 hour
    maxCacheSize: 100 * 1024 * 1024, // 100MB
    prioritizeExtensions: ['.md', '.json', '.txt'],
    excludePatterns: ['.git'],
    cacheBinaryFiles: false,
  },
};

// Modify FileSnapshotStore to use workspace-specific strategy
class FileSnapshotStore {
  async saveSnapshot(
    projectId: string,
    workspace: WorkspaceId,
    fileTree: FileTree
  ): Promise<void> {
    const strategy = WORKSPACE_CACHE_STRATEGIES[workspace];

    // Apply workspace-specific filtering
    const prioritizedFiles = this.prioritizeFiles(fileTree, strategy);
    const filteredFiles = this.filterExcludedFiles(prioritizedFiles, strategy);

    // Save with workspace-specific TTL
    await this.db.file_metadata.bulkPut(
      filteredFiles.map(f => ({
        ...f,
        projectId,
        workspace,
        expiresAt: Date.now() + strategy.ttl,
      }))
    );
  }
}
```

---

### 2.3 Minor Gaps

#### **🟢 MINOR GAP 7: Missing Workspace Analytics**

**Location:** Not implemented

**Impact:**
- **Cannot optimize workspace performance**
- No metrics collection per workspace
- Cannot identify usage patterns

**Recommendation:**
Implement workspace analytics collection:
```typescript
// Proposed: src/lib/analytics/workspace-analytics.ts
export interface WorkspaceMetrics {
  workspace: WorkspaceId;
  projectId: string;
  timestamp: number;

  // Usage metrics
  filesOpened: number;
  filesModified: number;
  timeSpent: number; // milliseconds

  // Performance metrics
  averageLoadTime: number;
  cacheHitRate: number;
  syncCount: number;
}

export class WorkspaceAnalytics {
  async recordFileOpen(projectId: string, workspace: WorkspaceId, path: string) {
    await this.metrics.put({
      workspace,
      projectId,
      timestamp: Date.now(),
      event: 'file-open',
      path,
    });
  }

  async getWorkspaceStats(projectId: string, workspace: WorkspaceId): Promise<WorkspaceMetrics> {
    // Aggregate metrics from IndexedDB
  }
}
```

---

#### **🟢 MINOR GAP 8: Incomplete Workspace Binding Validation**

**Location:** `src/presentation/components/hub/WorkspaceBindingDialog.tsx`

**Impact:**
- **Users can create invalid workspace combinations**
- No dependency validation
- May lead to confusion

**Current Behavior:**
- User can bind project to any workspace combination
- No validation of workspace-specific requirements
- No warnings about missing dependencies

**Recommendation:**
Add dependency validation:
```typescript
// Proposed: src/lib/workspace/workspace-binding-validator.ts
export interface WorkspaceDependency {
  workspace: WorkspaceId;
  requires: WorkspaceId[];
  conflicts: WorkspaceId[];
  warning?: string;
}

export const WORKSPACE_DEPENDENCIES: WorkspaceDependency[] = [
  {
    workspace: 'knowledge',
    requires: ['ide'],
    conflicts: [],
    warning: 'Knowledge workspace requires IDE workspace for RAG integration',
  },
  {
    workspace: 'study',
    requires: [],
    conflicts: [],
    warning: undefined,
  },
];

export function validateWorkspaceBindings(
  bindings: WorkspaceBindings
): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  const enabledWorkspaces = Object.entries(bindings)
    .filter(([_, enabled]) => enabled)
    .map(([workspace]) => workspace as WorkspaceId);

  for (const workspace of enabledWorkspaces) {
    const dependency = WORKSPACE_DEPENDENCIES.find(d => d.workspace === workspace);

    if (dependency) {
      // Check requirements
      for (const required of dependency.requires) {
        if (!bindings[required]) {
          errors.push(
            `${workspace.toUpperCase()} workspace requires ${required.toUpperCase()} workspace`
          );
        }
      }

      // Check warnings
      if (dependency.warning) {
        warnings.push(dependency.warning);
      }
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}
```

---

## 3. Brownfield Implementation Deficiencies

### 3.1 Superficial Component Integration

The following components exist but lack intelligent integration:

#### **FileTree Component** (`src/presentation/components/ide/FileTree/`)
**Status:** ✅ Implemented (IDE only)
**Deficiency:** Not reusable across workspaces
**Issue:** Hardcoded to use IDE-specific state management

**Evidence:**
```typescript
// src/presentation/components/ide/FileTree/FileTree.tsx
export function FileTree() {
  const { workspace } = useWorkspace(); // ❌ IDE-specific hook
  const { openFiles } = useIDEStore();  // ❌ IDE-specific store

  // ...
}
```

**Required Refactoring:**
```typescript
// Proposed: Workspace-agnostic FileTree
export function FileTree({ workspace }: { workspace: WorkspaceId }) {
  const { project } = useProjectContext(); // ✅ Cross-workspace
  const fileSyncService = useFileSyncService(workspace); // ✅ Workspace-aware

  // ...
}
```

---

#### **Project Management Components** (`src/presentation/components/hub/`)
**Status:** ✅ Implemented (Hub only)
**Deficiency:** No integration with workspace-specific file operations
**Issue:** ProjectCard shows workspace badges but doesn't validate sync status

**Evidence:**
```typescript
// src/presentation/components/hub/ProjectCard.tsx
{boundWorkspaces.map((workspace) => (
  <WorkspaceBadge
    key={workspace}
    workspace={workspace}
    variant="badge"
    onClick={handleWorkspaceClick(workspace)}
  />
))}
// ❌ No sync status indicator
// ❌ No validation that workspace is accessible
```

**Required Enhancement:**
```typescript
// Proposed: Add sync status validation
const { syncStatus, error } = useWorkspaceSyncStatus(project.id, workspace);

<WorkspaceBadge
  key={workspace}
  workspace={workspace}
  variant="badge"
  status={syncStatus}  // ✅ Show sync status
  error={error}        // ✅ Show sync errors
  onClick={handleWorkspaceClick(workspace)}
/>
```

---

#### **Monaco Editor Integration** (`src/presentation/components/ide/MonacoEditor/`)
**Status:** ✅ Implemented (IDE only)
**Deficiency:** Not available in other workspaces
**Issue:** Notes workspace should be able to open code files in Monaco

**Required Implementation:**
```typescript
// Proposed: MonacoEditor as shared component
export function MonacoEditor({ file, project, workspace }: MonacoEditorProps) {
  const fileSyncService = useFileSyncService(workspace);

  const content = useLazyFileContent(file.path, fileSyncService);

  return <MonacoEditorComponent value={content} onChange={handleChange} />;
}

// Usage in Notes workspace
<MonacoEditor
  file={selectedFile}
  project={project}
  workspace="notes"
/>
```

---

#### **WebContainer Integration** (`src/lib/webcontainer/`)
**Status:** ✅ Implemented (IDE only)
**Deficiency:** No awareness of cross-workspace file operations
**Issue:** WebContainer syncs from IDE but not from other workspaces

**Required Enhancement:**
```typescript
// Proposed: Cross-workspace WebContainer sync
class WebContainerManager {
  async syncFromWorkspace(workspace: WorkspaceId, project: ProjectMetadata) {
    const fileSyncService = getFileSyncService(workspace);

    // Get files from workspace-specific file service
    const files = await fileSyncService.listFiles();

    // Sync to WebContainer
    for (const file of files) {
      const content = await fileSyncService.readFile(file.path);
      await this.webcontainer.fs.writeFile(file.path, content);
    }
  }
}
```

---

#### **Terminal Integration** (`src/presentation/components/ide/XTerminal/`)
**Status:** ✅ Implemented (IDE only)
**Deficiency:** No awareness of workspace context
**Issue:** Terminal should use project's working directory regardless of workspace

**Required Enhancement:**
```typescript
// Proposed: Workspace-aware terminal
export function XTerminal({ project, workspace }: XTerminalProps) {
  const fileSyncService = useFileSyncService(workspace);

  useEffect(() => {
    // Use project's folder path from project metadata
    adapter.startShell(project.folderPath);
  }, [project.folderPath]);

  return <XTerminalComponent />;
}
```

---

### 3.2 Isolated Component Architecture

**Problem:** Components operate in isolation without meaningful integration.

**Current Architecture:**
```
Hub Component
    ↓
Project Card → Workspace Badges (static display)
    ↓
Navigation to workspace (isolated route)
    ↓
Workspace Component (no context of other workspaces)
```

**Required Architecture:**
```
Hub Component
    ↓
Project Card → Workspace Badges (with sync status)
    ↓
Workspace Binding → ProjectContext (shared state)
    ↓
Workspace Component (aware of project + other workspaces)
    ↓
FileSyncService (workspace-specific, cross-workspace events)
    ↓
Unified State Management (Zustand + Context)
```

---

## 4. Architectural Recommendations

### 4.1 Unified State Management Architecture

**Recommendation:** Adopt **Zustand + React Context** hybrid pattern for all workspace state.

**Benefits:**
- **Single source of truth** for workspace state
- **Type-safe** with TypeScript
- **Performant** with selector-based subscriptions
- **Persisted** state survives reloads
- **Dependency injection** via React Context

**Implementation:**

```typescript
// src/lib/state/workspace-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// IndexedDB storage for Zustand persist
const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface WorkspaceStore {
  // Project state (persisted)
  projectId: string | null;
  projectName: string | null;
  folderPath: string | null;
  workspaceBindings: WorkspaceBindings;
  lastWorkspace: WorkspaceId | null;

  // Workspace state (ephemeral + persisted)
  currentWorkspace: WorkspaceId;
  workspaceData: Partial<Record<WorkspaceId, {
    lastOpened: number;
    openFiles: string[];
    activeFile: string | null;
  }>>;

  // Sync state (ephemeral)
  syncStatus: Partial<Record<WorkspaceId, SyncStatus>>;
  syncErrors: Partial<Record<WorkspaceId, string>>;

  // Actions
  setProject: (project: ProjectMetadata) => void;
  clearProject: () => void;
  switchWorkspace: (workspace: WorkspaceId) => void;
  updateBindings: (bindings: WorkspaceBindings) => void;
  setSyncStatus: (workspace: WorkspaceId, status: SyncStatus) => void;
  setSyncError: (workspace: WorkspaceId, error: string) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      // Initial state
      projectId: null,
      projectName: null,
      folderPath: null,
      workspaceBindings: {},
      lastWorkspace: null,
      currentWorkspace: 'ide',
      workspaceData: {},
      syncStatus: {},
      syncErrors: {},

      // Actions
      setProject: (project) => set({
        projectId: project.id,
        projectName: project.name,
        folderPath: project.folderPath,
        workspaceBindings: project.workspaceBindings,
        lastWorkspace: loadLastWorkspace(project.id) || 'ide',
        currentWorkspace: loadLastWorkspace(project.id) || 'ide',
      }),

      clearProject: () => set({
        projectId: null,
        projectName: null,
        folderPath: null,
        workspaceBindings: {},
        lastWorkspace: null,
        currentWorkspace: 'ide',
        workspaceData: {},
        syncStatus: {},
        syncErrors: {},
      }),

      switchWorkspace: (workspace) => {
        const { projectId, currentWorkspace, workspaceData } = get();

        // Save current workspace data
        set({
          workspaceData: {
            ...workspaceData,
            [currentWorkspace]: {
              lastOpened: Date.now(),
            },
          },
          currentWorkspace: workspace,
        });

        // Persist last workspace preference
        if (projectId) {
          persistLastWorkspace(projectId, workspace);
          set({ lastWorkspace: workspace });
        }
      },

      updateBindings: (bindings) => set({ workspaceBindings: bindings }),

      setSyncStatus: (workspace, status) => set((state) => ({
        syncStatus: { ...state.syncStatus, [workspace]: status },
      })),

      setSyncError: (workspace, error) => set((state) => ({
        syncErrors: { ...state.syncErrors, [workspace]: error },
      })),
    }),
    {
      name: 'workspace-state',
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        projectId: state.projectId,
        projectName: state.projectName,
        folderPath: state.folderPath,
        workspaceBindings: state.workspaceBindings,
        lastWorkspace: state.lastWorkspace,
        currentWorkspace: state.currentWorkspace,
        workspaceData: state.workspaceData,
      }),
    }
  )
);

// React Context for dependency injection (multiple instances support)
const WorkspaceStoreContext = createContext<StoreApi<WorkspaceStore> | null>(null);

export function WorkspaceStoreProvider({
  projectId,
  children
}: {
  projectId: string | null;
  children: React.ReactNode;
}) {
  const storeRef = useRef<StoreApi<WorkspaceStore>>();

  if (!storeRef.current) {
    // Create store instance for this project
    storeRef.current = createWorkspaceStore(projectId);
  }

  return (
    <WorkspaceStoreContext.Provider value={storeRef.current}>
      {children}
    </WorkspaceStoreContext.Provider>
);
}

export function useWorkspaceStore<T = WorkspaceStore>(
  selector?: (state: WorkspaceStore) => T
): T {
  const store = useContext(WorkspaceStoreContext);
  if (!store) throw new Error('useWorkspaceStore must be used within WorkspaceStoreProvider');
  return useStore(store, selector!);
}
```

---

### 4.2 Workspace-Aware File Sync Services

**Recommendation:** Implement FileSyncService for all workspaces with cross-workspace event broadcasting.

**Implementation Pattern:**

```typescript
// src/lib/filesync/base-file-sync-service.ts
export abstract class BaseFileSyncService implements FileSyncService {
  protected eventBus: CrossWorkspaceEventBus;

  constructor(
    protected projectId: string,
    protected workspace: WorkspaceId,
    protected snapshotStore: FileSnapshotStore,
    protected cacheStrategy: WorkspaceCacheStrategy
  ) {
    this.eventBus = new CrossWorkspaceEventBus();
  }

  // Read operations (cache-first)
  async readFile(path: string): Promise<string> {
    // Check snapshot store first
    const snapshot = await this.snapshotStore.getContent(this.projectId, this.workspace, path);

    if (snapshot && this.isSnapshotFresh(snapshot)) {
      return snapshot.content;
    }

    // Fallback to FSA
    const content = await this.readFromFS(path);

    // Update snapshot
    await this.snapshotStore.saveContent(this.projectId, this.workspace, path, content);

    return content;
  }

  // Write operations (with event broadcasting)
  async writeFile(path: string, content: string): Promise<void> {
    await this.writeToFS(path, content);
    await this.snapshotStore.saveContent(this.projectId, this.workspace, path, content);

    // Broadcast to other workspaces
    this.eventBus.broadcastFileChange({
      projectId: this.projectId,
      workspaceId: this.workspace,
      path,
      type: 'modified',
      timestamp: Date.now(),
    });
  }

  // Abstract methods for workspace-specific implementations
  protected abstract readFromFS(path: string): Promise<string>;
  protected abstract writeToFS(path: string, content: string): Promise<void>;

  protected abstract isSnapshotFresh(snapshot: FileSnapshot): boolean;
}

// Workspace-specific implementations
export class IDEFileSyncService extends BaseFileSyncService {
  constructor(
    projectId: string,
    private localAdapter: LocalFSAdapter,
    snapshotStore: FileSnapshotStore
  ) {
    super(projectId, 'ide', snapshotStore, WORKSPACE_CACHE_STRATEGIES.ide);
  }

  protected async readFromFS(path: string): Promise<string> {
    return this.localAdapter.readFile(path);
  }

  protected async writeToFS(path: string, content: string): Promise<void> {
    await this.localAdapter.writeFile(path, content);
  }

  protected isSnapshotFresh(snapshot: FileSnapshot): boolean {
    return Date.now() - snapshot.timestamp < WORKSPACE_CACHE_STRATEGIES.ide.ttl;
  }
}

export class NotesFileSyncService extends BaseFileSyncService {
  constructor(
    projectId: string,
    private notesAdapter: NotesAdapter,
    snapshotStore: FileSnapshotStore
  ) {
    super(projectId, 'notes', snapshotStore, WORKSPACE_CACHE_STRATEGIES.notes);
  }

  protected async readFromFS(path: string): Promise<string> {
    return this.notesAdapter.readNote(path);
  }

  protected async writeToFS(path: string, content: string): Promise<void> {
    await this.notesAdapter.writeNote(path, content);
  }

  protected isSnapshotFresh(snapshot: FileSnapshot): boolean {
    return Date.now() - snapshot.timestamp < WORKSPACE_CACHE_STRATEGIES.notes.ttl;
  }
}
```

---

### 4.3 Cross-Workspace Event System

**Recommendation:** Implement event bus for real-time cross-workspace synchronization.

**Implementation:**

```typescript
// src/lib/events/cross-workspace-event-bus.ts
import EventEmitter from 'eventemitter3';

export interface FileChangeEvent {
  projectId: string;
  workspaceId: WorkspaceId;
  path: string;
  type: 'created' | 'modified' | 'deleted';
  timestamp: number;
}

export interface SyncStatusEvent {
  projectId: string;
  workspaceId: WorkspaceId;
  status: SyncStatus;
  timestamp: number;
}

export class CrossWorkspaceEventBus extends EventEmitter {
  private static instance: CrossWorkspaceEventBus;

  static getInstance(): CrossWorkspaceEventBus {
    if (!CrossWorkspaceEventBus.instance) {
      CrossWorkspaceEventBus.instance = new CrossWorkspaceEventBus();
    }
    return CrossWorkspaceEventBus.instance;
  }

  // File change events
  broadcastFileChange(event: FileChangeEvent) {
    this.emit('file-change', event);
  }

  onFileChange(handler: (event: FileChangeEvent) => void) {
    this.on('file-change', handler);
  }

  offFileChange(handler: (event: FileChangeEvent) => void) {
    this.off('file-change', handler);
  }

  // Sync status events
  broadcastSyncStatus(event: SyncStatusEvent) {
    this.emit('sync-status', event);
  }

  onSyncStatus(handler: (event: SyncStatusEvent) => void) {
    this.on('sync-status', handler);
  }

  offSyncStatus(handler: (event: SyncStatusEvent) => void) {
    this.off('sync-status', handler);
  }
}

// Usage in FileSyncService
class IDEFileSyncService {
  private eventBus: CrossWorkspaceEventBus;

  async writeFile(path: string, content: string): Promise<void> {
    await this.localAdapter.writeFile(path, content);

    // Broadcast to other workspaces
    this.eventBus.broadcastFileChange({
      projectId: this.projectId,
      workspaceId: 'ide',
      path,
      type: 'modified',
      timestamp: Date.now(),
    });
  }
}

// Usage in workspace components
function NotesWorkspace() {
  const eventBus = CrossWorkspaceEventBus.getInstance();

  useEffect(() => {
    const handleFileChange = (event: FileChangeEvent) => {
      if (event.workspaceId !== 'notes' && event.projectId === projectId) {
        // File modified in another workspace - update UI
        refreshFileTree();
      }
    };

    eventBus.onFileChange(handleFileChange);

    return () => {
      eventBus.offFileChange(handleFileChange);
    };
  }, [projectId]);
}
```

---

### 4.4 Unified Permission Management

**Recommendation:** Single permission manager for all workspaces.

**Implementation:**

```typescript
// src/lib/workspace/unified-permission-manager.ts
export interface WorkspacePermissionConfig {
  workspace: WorkspaceId;
  requiresFSA: boolean;
  requiredPermissions: Permission[];
  fallbackStrategy: 'import' | 'template' | 'readonly';
}

export class UnifiedPermissionManager {
  private permissionCache: Map<string, PermissionState> = new Map();

  async ensureWorkspaceAccess(
    projectId: string,
    workspace: WorkspaceId
  ): Promise<PermissionState> {
    const cacheKey = `${projectId}:${workspace}`;

    // Check cache first
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    const config = WORKSPACE_PERMISSION_CONFIGS[workspace];
    const project = await getProject(projectId);

    if (config.requiresFSA) {
      // Check if FSA handle exists
      if (!project.fsaHandle) {
        // Request FSA permission
        try {
          const handle = await requestDirectoryAccess({
            mode: 'readwrite',
            startIn: 'documents',
          });

          await updateProject(projectId, { fsaHandle: handle });
          project.fsaHandle = handle;
        } catch (error) {
          // Fallback strategy
          return await this.handleFallback(projectId, workspace, config.fallbackStrategy);
        }
      }

      // Check permission state
      const state = await checkPermissionState(project.fsaHandle);

      if (state === 'granted') {
        this.permissionCache.set(cacheKey, state);
        return state;
      }

      // Request permission if prompt
      if (state === 'prompt') {
        const newState = await requestPermission(project.fsaHandle);
        this.permissionCache.set(cacheKey, newState);
        return newState;
      }
    }

    return 'granted';
  }

  private async handleFallback(
    projectId: string,
    workspace: WorkspaceId,
    strategy: 'import' | 'template' | 'readonly'
  ): Promise<PermissionState> {
    switch (strategy) {
      case 'import':
        // Show import dialog
        return await this.showImportDialog(projectId, workspace);

      case 'template':
        // Create from template
        return await this.createFromTemplate(projectId, workspace);

      case 'readonly':
        // Allow read-only access
        return 'granted-readonly';

      default:
        throw new Error(`Unsupported fallback strategy: ${strategy}`);
    }
  }
}

// Use in workspace components
function NotesWorkspace() {
  const permissionManager = new UnifiedPermissionManager();

  useEffect(() => {
    permissionManager.ensureWorkspaceAccess(projectId, 'notes')
      .then((state) => {
        if (state === 'denied') {
          showError('File system access denied for Notes workspace');
        }
      });
  }, [projectId]);
}
```

---

## 5. UX/UI Evaluation

### 5.1 Current Interface Assessment

#### **Hub Interface** (`src/routes/hub.tsx`)
**Status:** ✅ Functional
**Deficiency:** No indication of workspace sync status
**Recommendation:** Add sync status indicators to ProjectCard

**Current:**
```typescript
<div className="flex items-center gap-1.5">
  {boundWorkspaces.map((workspace) => (
    <WorkspaceBadge key={workspace} workspace={workspace} variant="badge" />
  ))}
</div>
```

**Proposed:**
```typescript
<div className="flex items-center gap-1.5">
  {boundWorkspaces.map((workspace) => (
    <WorkspaceBadge
      key={workspace}
      workspace={workspace}
      variant="badge"
      syncStatus={syncStatuses[workspace]}  // ✅ Show sync status
      lastSynced={lastSyncTimes[workspace]}  // ✅ Show last sync time
      onClick={handleWorkspaceClick(workspace)}
    />
  ))}
</div>
```

---

#### **Workspace Switcher** (`src/presentation/components/common/WorkspaceSwitcher.tsx`)
**Status:** ✅ Implemented (WB-6)
**Deficiency:** No sync status indicators
**Recommendation:** Add sync status to dropdown items

**Current:**
```typescript
<DropdownMenu.Item onClick={() => switchWorkspace(workspace)}>
  <WorkspaceIcon /> <WorkspaceLabel />
  {isActive && '✓'}
</DropdownMenu.Item>
```

**Proposed:**
```typescript
<DropdownMenu.Item onClick={() => switchWorkspace(workspace)}>
  <WorkspaceIcon /> <WorkspaceLabel />
  {isActive && '✓'}

  {/* ✅ Sync status indicator */}
  {syncStatuses[workspace] === 'synced' && <CheckCircle className="text-green-500" />}
  {syncStatuses[workspace] === 'syncing' && <Loader className="text-yellow-500" />}
  {syncStatuses[workspace] === 'error' && <AlertCircle className="text-red-500" />}
</DropdownMenu.Item>
```

---

#### **FileTree Component** (`src/presentation/components/ide/FileTree/`)
**Status:** ✅ Implemented (IDE only)
**Deficiency:** No cache hit/miss indicators (WB-7 added this to hook but not to FileTree)
**Recommendation:** Integrate CacheIndicator component

**Current:**
```typescript
<FileTreeNode>
  <FileIcon />
  <FileName />
</FileTreeNode>
```

**Proposed:**
```typescript
<FileTreeNode>
  <FileIcon />
  <FileName />

  {/* ✅ Cache indicator from WB-7 */}
  <CacheIndicator
    fromCache={loadResult.fromCache}
    cacheHit={loadResult.cacheHit}
    fileSize={file.size}
  />
</FileTreeNode>
```

---

### 5.2 Missing UI Components

#### **1. Workspace Sync Status Panel**
**Purpose:** Show sync status across all workspaces
**Location:** Each workspace's sidebar or header
**Components:**
```typescript
// src/presentation/components/common/WorkspaceSyncStatus.tsx
export function WorkspaceSyncStatus({ project }: { project: ProjectMetadata }) {
  const syncStatuses = useWorkspaceSyncStatus(project.id);

  return (
    <div className="flex items-center gap-2 p-2 border border-border rounded-none">
      {project.workspaceBindings.ide && (
        <SyncBadge workspace="ide" status={syncStatuses.ide} />
      )}
      {project.workspaceBindings.notes && (
        <SyncBadge workspace="notes" status={syncStatuses.notes} />
      )}
      {project.workspaceBindings.knowledge && (
        <SyncBadge workspace="knowledge" status={syncStatuses.knowledge} />
      )}
      {project.workspaceBindings.study && (
        <SyncBadge workspace="study" status={syncStatuses.study} />
      )}
    </div>
  );
}

function SyncBadge({ workspace, status }: { workspace: WorkspaceId; status: SyncStatus }) {
  let colorClass = 'bg-muted-foreground';
  let label = 'UNKNOWN';

  if (status === 'synced') {
    colorClass = 'bg-green-500';
    label = 'SYNCED';
  } else if (status === 'syncing') {
    colorClass = 'bg-yellow-500';
    label = 'SYNCING';
  } else if (status === 'error') {
    colorClass = 'bg-red-500';
    label = 'ERROR';
  }

  return (
    <div className="flex items-center gap-1">
      <div className={cn('w-2 h-2 rounded-full', colorClass)} />
      <span className="text-xs">{label}</span>
    </div>
  );
}
```

---

#### **2. File Conflict Resolution Dialog**
**Purpose:** Resolve conflicts when file modified in multiple workspaces
**Location:** Modal dialog triggered on file change event
**Components:**
```typescript
// src/presentation/components/common/FileConflictDialog.tsx
export function FileConflictDialog({
  file,
  workspaces,
  onResolve
}: FileConflictDialogProps) {
  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>File Conflict: {file.path}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p>
            This file has been modified in multiple workspaces.
            Which version do you want to keep?
          </p>

          {workspaces.map((workspace) => (
            <div key={workspace} className="flex items-center gap-2 p-2 border">
              <input
                type="radio"
                name="selectedWorkspace"
                value={workspace}
                id={workspace}
              />
              <label htmlFor={workspace}>
                <WorkspaceIcon workspace={workspace} />
                {workspace.toUpperCase()}
                <span className="text-xs text-muted-foreground">
                  Last modified: {formatDate(file.lastModified)}
                </span>
              </label>
            </div>
          ))}

          <DialogFooter>
            <Button onClick={onResolve}>Resolve</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

#### **3. Workspace-Specific Settings Panel**
**Purpose:** Configure workspace-specific file sync behavior
**Location:** Settings menu
**Components:**
```typescript
// src/presentation/components/settings/WorkspaceFileSyncSettings.tsx
export function WorkspaceFileSyncSettings({ project }: { project: ProjectMetadata }) {
  const { workspaceBindings } = project;
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceId>('ide');

  return (
    <div className="space-y-6">
      <h2>File Sync Settings</h2>

      {/* Workspace selector */}
      <Tabs value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
        <TabsList>
          {Object.keys(workspaceBindings).map((workspace) => (
            <TabsTrigger key={workspace} value={workspace}>
              {workspace.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedWorkspace}>
          <WorkspaceSyncConfigForm
            project={project}
            workspace={selectedWorkspace}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WorkspaceSyncConfigForm({
  project,
  workspace
}: {
  project: ProjectMetadata;
  workspace: WorkspaceId;
}) {
  const strategy = WORKSPACE_CACHE_STRATEGIES[workspace];
  const [config, setConfig] = useState(strategy);

  return (
    <form className="space-y-4">
      <div>
        <label>Cache TTL (minutes)</label>
        <input
          type="number"
          value={config.ttl / 60000}
          onChange={(e) => setConfig({
            ...config,
            ttl: parseInt(e.target.value) * 60000
          })}
        />
      </div>

      <div>
        <label>Max Cache Size (MB)</label>
        <input
          type="number"
          value={config.maxCacheSize / 1024 / 1024}
          onChange={(e) => setConfig({
            ...config,
            maxCacheSize: parseInt(e.target.value) * 1024 * 1024
          })}
        />
      </div>

      <div>
        <label>Prioritized Extensions</label>
        <input
          type="text"
          value={config.prioritizeExtensions.join(', ')}
          onChange={(e) => setConfig({
            ...config,
            prioritizeExtensions: e.target.value.split(', ')
          })}
        />
      </div>

      <Button type="submit">Save Settings</Button>
    </form>
  );
}
```

---

## 6. Implementation Roadmap

### 6.1 Phase 1: Critical Foundation (Week 1-2, P0)

**Goal:** Complete missing FileSync services for all workspaces.

#### **Story WB-8.1: Study FileSync Service** (8 hours)
```yaml
id: WB-8.1
name: Study FileSync Service Implementation
priority: P0
effort: 8 hours
acceptance_criteria:
  - StudyFileSyncService implements FileSyncService interface
  - Cache-first loading with workspace-specific strategy
  - Cross-workspace event broadcasting
  - Error handling and permission management
```

**Implementation Tasks:**
1. Create `src/lib/filesync/study-file-sync-service.ts`
2. Implement cache-first loading with Study cache strategy (1h TTL, 100MB limit)
3. Add cross-workspace event broadcasting for file changes
4. Integrate with UnifiedPermissionManager for FSA access
5. Write unit tests for FileSyncService interface compliance
6. Integrate with Study workspace route
7. Manual testing: file operations in Study workspace

**Deliverables:**
- `StudyFileSyncService` class (200 lines)
- Unit tests (100 lines)
- Integration with Study workspace route

---

#### **Story WB-8.2: Notes FileSync Service** (8 hours)
```yaml
id: WB-8.2
name: Notes FileSync Service Implementation
priority: P0
effort: 8 hours
acceptance_criteria:
  - NotesFileSyncService implements FileSyncService interface
  - Cache-first loading with workspace-specific strategy
  - Cross-workspace event broadcasting
  - Error handling and permission management
```

**Implementation Tasks:**
1. Create `src/lib/filesync/notes-file-sync-service.ts`
2. Implement cache-first loading with Notes cache strategy (1h TTL, 100MB limit)
3. Add cross-workspace event broadcasting for file changes
4. Integrate with UnifiedPermissionManager for FSA access
5. Write unit tests for FileSyncService interface compliance
6. Integrate with Notes workspace route
7. Manual testing: file operations in Notes workspace

**Deliverables:**
- `NotesFileSyncService` class (200 lines)
- Unit tests (100 lines)
- Integration with Notes workspace route

---

#### **Story WB-8.3: Cross-Workspace Event System** (6 hours)
```yaml
id: WB-8.3
name: Cross-Workspace Event Bus Implementation
priority: P0
effort: 6 hours
acceptance_criteria:
  - CrossWorkspaceEventBus with file change events
  - Sync status events
  - Event broadcasting from all FileSync services
  - Event subscriptions in workspace components
```

**Implementation Tasks:**
1. Create `src/lib/events/cross-workspace-event-bus.ts`
2. Implement EventEmitter with file change events
3. Add sync status events
4. Integrate event broadcasting in all FileSync services
5. Subscribe to events in workspace components
6. Update UI when files change in other workspaces

**Deliverables:**
- `CrossWorkspaceEventBus` class (150 lines)
- Integration in all FileSync services
- Event subscriptions in workspace components

---

### 6.2 Phase 2: Enhanced Integration (Week 3-4, P1)

**Goal:** Unify state management and add workspace-aware agent tools.

#### **Story WB-9.1: Unified State Management** (12 hours)
```yaml
id: WB-9.1
name: Unified Workspace State Management
priority: P1
effort: 12 hours
acceptance_criteria:
  - WorkspaceStore with Zustand + React Context
  - Persisted state to IndexedDB
  - Migration from WorkspaceContext + ProjectContext
  - All workspaces use unified store
```

**Implementation Tasks:**
1. Create `src/lib/state/workspace-store.ts`
2. Implement Zustand store with persist middleware
3. Add React Context for dependency injection
4. Migrate WorkspaceContext to use WorkspaceStore
5. Migrate ProjectContext to use WorkspaceStore
6. Update all workspace components to use unified store
7. Write migration tests for backward compatibility

**Deliverables:**
- `WorkspaceStore` (300 lines)
- `WorkspaceStoreProvider` component (100 lines)
- Migration guide for developers

---

#### **Story WB-9.2: Workspace-Aware Agent Tools** (8 hours)
```yaml
id: WB-9.2
name: Workspace-Aware Agent Tool Facades
priority: P1
effort: 8 hours
acceptance_criteria:
  - WorkspaceAwareFileTools with workspace detection
  - Permission checks before tool execution
  - Error messages for unsupported workspaces
  - Unit tests for all workspace scenarios
```

**Implementation Tasks:**
1. Create `src/lib/agent/facades/workspace-file-tools.ts`
2. Implement workspace detection from context
3. Add permission checks for each workspace
4. Return helpful errors for unsupported operations
5. Write unit tests for all workspace combinations
6. Update agent tool registry to use workspace-aware facades

**Deliverables:**
- `WorkspaceAwareFileTools` class (250 lines)
- Unit tests (150 lines)
- Integration with agent tool registry

---

#### **Story WB-9.3: Unified Permission Manager** (8 hours)
```yaml
id: WB-9.3
name: Unified Permission Manager Implementation
priority: P1
effort: 8 hours
acceptance_criteria:
  - UnifiedPermissionManager for all workspaces
  - Workspace-specific permission configs
  - Fallback strategies for denied permissions
  - Permission state caching
```

**Implementation Tasks:**
1. Create `src/lib/workspace/unified-permission-manager.ts`
2. Define workspace permission configs
3. Implement fallback strategies (import, template, readonly)
4. Add permission state caching
5. Integrate with all FileSync services
6. Write unit tests for all permission scenarios

**Deliverables:**
- `UnifiedPermissionManager` class (200 lines)
- Workspace permission configs
- Unit tests (100 lines)

---

### 6.3 Phase 3: Advanced Features (Week 5-6, P2)

**Goal:** Add analytics, smart defaults, and performance optimization.

#### **Story WB-10.1: Workspace Analytics** (8 hours)
```yaml
id: WB-10.1
name: Workspace Usage Analytics
priority: P2
effort: 8 hours
acceptance_criteria:
  - Workspace metrics collection (files opened, modified, time spent)
  - Performance metrics (load time, cache hit rate, sync count)
  - Analytics dashboard in settings
  - Data export to JSON
```

**Implementation Tasks:**
1. Create `src/lib/analytics/workspace-analytics.ts`
2. Define metrics data structures
3. Implement IndexedDB storage for metrics
4. Add metric collection to FileSync services
5. Create analytics dashboard UI
6. Add data export functionality

**Deliverables:**
- `WorkspaceAnalytics` class (200 lines)
- Analytics dashboard UI (300 lines)
- IndexedDB schema for metrics

---

#### **Story WB-10.2: Smart Workspace Defaults** (6 hours)
```yaml
id: WB-10.2
name: Smart Workspace Default Configuration
priority: P2
effort: 6 hours
acceptance_criteria:
  - Workspace dependency validation
  - Recommended workspace combinations
  - Auto-enable dependent workspaces
  - Warning messages for invalid combinations
```

**Implementation Tasks:**
1. Create `src/lib/workspace/workspace-binding-validator.ts`
2. Define workspace dependencies
3. Implement validation logic
4. Add warnings for invalid combinations
5. Update WorkspaceBindingDialog with validation
6. Add auto-enable for dependencies

**Deliverables:**
- `validateWorkspaceBindings` function (100 lines)
- Workspace dependency configs
- Updated WorkspaceBindingDialog

---

#### **Story WB-10.3: Workspace-Specific Caching Strategies** (6 hours)
```yaml
id: WB-10.3
name: Workspace-Aware Caching Strategies
priority: P2
effort: 6 hours
acceptance_criteria:
  - Workspace-specific cache TTLs
  - Workspace-specific file prioritization
  - Workspace-specific cache size limits
  - Configurable via settings UI
```

**Implementation Tasks:**
1. Create `src/lib/filesystem/workspace-cache-strategy.ts`
2. Define workspace cache strategies
3. Implement workspace-specific filtering in FileSnapshotStore
4. Create settings UI for cache configuration
5. Add cache statistics display

**Deliverables:**
- Workspace cache strategies (150 lines)
- Modified FileSnapshotStore (50 lines changed)
- Settings UI (200 lines)

---

### 6.4 Implementation Sequence Summary

**Week 1-2 (P0):**
- WB-8.1: Study FileSync Service (8h)
- WB-8.2: Notes FileSync Service (8h)
- WB-8.3: Cross-Workspace Event System (6h)
- **Total: 22 hours (3 days)**

**Week 3-4 (P1):**
- WB-9.1: Unified State Management (12h)
- WB-9.2: Workspace-Aware Agent Tools (8h)
- WB-9.3: Unified Permission Manager (8h)
- **Total: 28 hours (3.5 days)**

**Week 5-6 (P2):**
- WB-10.1: Workspace Analytics (8h)
- WB-10.2: Smart Workspace Defaults (6h)
- WB-10.3: Workspace-Specific Caching (6h)
- **Total: 20 hours (2.5 days)**

**Overall Effort: 70 hours (9 working days)**

---

## 7. Best-in-Class Patterns (December 2025)

### 7.1 Zustand Persistence with IndexedDB

**Pattern:** Use Zustand's persist middleware with custom IndexedDB storage.

**Benefits:**
- **Type-safe** with TypeScript
- **Automatic rehydration** on app load
- **Selective persistence** with partialize
- **Version migrations** for schema changes
- **Cross-tab sync** with sync tabs middleware

**Implementation:**
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

const indexedDBStorage = {
  getItem: async (name: string) => (await get(name)) || null,
  setItem: async (name: string, value: string) => await set(name, value),
  removeItem: async (name: string) => await del(name),
};

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      // ... state
    }),
    {
      name: 'workspace-state',
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        projectId: state.projectId,
        workspaceBindings: state.workspaceBindings,
      }),
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          return migrateToV1(persistedState);
        }
        return persistedState;
      },
    }
  )
);
```

---

### 7.2 Dexie.js Live Queries

**Pattern:** Use Dexie's `useLiveQuery` hook for reactive UI updates.

**Benefits:**
- **Automatic re-render** when data changes
- **Type-safe** with TypeScript
- **Performance** with efficient query tracking
- **Simple API** - just return a promise

**Implementation:**
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';

function FileTreeComponent() {
  const files = useLiveQuery(() => db.file_metadata.toArray());

  if (!files) return <div>Loading...</div>;

  return (
    <ul>
      {files.map((file) => (
        <li key={file.path}>{file.name}</li>
      ))}
    </ul>
  );
}
```

---

### 7.3 TanStack Router Deferred Loading

**Pattern:** Use `defer()` for slow data while rendering critical data immediately.

**Benefits:**
- **Improved perceived performance**
- **Progressive rendering** with Suspense
- **Better UX** - critical content shows first
- **Type-safe** with TypeScript

**Implementation:**
```typescript
import { createFileRoute, defer, Await } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute('/knowledge/$projectId')({
  loader: async ({ params }) => {
    // Critical data - await
    const project = await getProject(params.projectId);

    // Slow data - defer
    const fileTreePromise = defer(loadFileTree(params.projectId));

    return {
      project,
      fileTree: fileTreePromise,
    };
  },

  component: () => {
    const { project, fileTree } = Route.useLoaderData();

    return (
      <div>
        <h1>{project.name}</h1>

        <Suspense fallback={<div>Loading files...</div>}>
          <Await promise={fileTree}>
            {(files) => <FileTree files={files} />}
          </Await>
        </Suspense>
      </div>
    );
  },
});
```

---

### 7.4 React Context + Zustand Hybrid

**Pattern:** Use React Context for dependency injection, Zustand for state management.

**Benefits:**
- **Multiple store instances** (one per project)
- **Prop-free** access to store
- **Type-safe** with TypeScript
- **Best of both worlds** - Context + Zustand

**Implementation:**
```typescript
import { createContext, useContext } from 'react';
import { createStore, useStore } from 'zustand';
import type { StoreApi } from 'zustand';

const createWorkspaceStore = (projectId: string) =>
  createStore<WorkspaceState>((set) => ({
    projectId,
    // ... state
  }));

const WorkspaceStoreContext = createContext<StoreApi<WorkspaceState> | null>(null);

export function WorkspaceStoreProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const storeRef = useRef<StoreApi<WorkspaceState>>();

  if (!storeRef.current) {
    storeRef.current = createWorkspaceStore(projectId);
  }

  return (
    <WorkspaceStoreContext.Provider value={storeRef.current}>
      {children}
    </WorkspaceStoreContext.Provider>
  );
}

export function useWorkspaceStore<T = WorkspaceState>(
  selector?: (state: WorkspaceState) => T
): T {
  const store = useContext(WorkspaceStoreContext);
  if (!store) throw new Error('...');
  return useStore(store, selector!);
}
```

---

## 8. Validation Checklist

### 8.1 Completeness Validation

Reference: `_bmad-output/validation/sweeping-validation.md`

**State Management:**
- [x] All state persisted to IndexedDB
- [x] No React Context for state (only dependency injection)
- [x] Zustand stores for all state
- [ ] Workspace state unified (PENDING - WB-9.1)
- [ ] Cross-workspace state consistency (PENDING - WB-9.1)

**File Synchronization:**
- [x] IDE FileSync service implemented
- [x] Knowledge FileSync service implemented
- [ ] Study FileSync service implemented (PENDING - WB-8.1)
- [ ] Notes FileSync service implemented (PENDING - WB-8.2)
- [ ] Cross-workspace event broadcasting (PENDING - WB-8.3)

**Workspace Integration:**
- [x] Workspace bindings defined in ProjectMetadata
- [x] ProjectContext for cross-workspace state sharing
- [ ] Workspace-aware agent tools (PENDING - WB-9.2)
- [ ] Unified permission management (PENDING - WB-9.3)
- [ ] Workspace-specific caching strategies (PENDING - WB-10.3)

**Type Safety:**
- [x] WorkspaceId type centralized
- [x] WorkspaceBindings interface defined
- [x] FileSyncService interface defined
- [ ] All FileSync implementations validated (PENDING - WB-8.1, WB-8.2)

**Performance:**
- [x] Lazy file content loading (WB-7)
- [x] Cache-first loading strategy (WB-3)
- [ ] Workspace-specific cache TTLs (PENDING - WB-10.3)
- [ ] Workspace analytics (PENDING - WB-10.1)

---

### 8.2 Integration Validation

**Component Integration:**
- [x] FileTree integrated in IDE workspace
- [ ] FileTree reusable across workspaces (PENDING)
- [x] Monaco editor integrated in IDE workspace
- [ ] Monaco editor available in Notes workspace (PENDING)
- [x] Terminal integrated in IDE workspace
- [ ] Terminal workspace-aware (PENDING)

**Cross-Workspace Features:**
- [x] Workspace switcher in header (WB-6)
- [ ] Sync status indicators (PENDING)
- [ ] File conflict resolution (PENDING)
- [ ] Cross-workspace file events (PENDING - WB-8.3)

---

## 9. Conclusion

### 9.1 Summary of Findings

**Critical Gaps (P0):**
1. **Missing FileSync Services** - Study and Notes workspaces cannot perform file operations
2. **Inconsistent State Management** - Multiple patterns (Context + Zustand) causing maintenance issues
3. **Superficial Agent Integration** - Tools assume IDE workspace, no workspace awareness

**Medium Gaps (P1):**
4. **No Cross-Workspace File Operations** - Workspace silos, no file sharing
5. **Inconsistent Permission Handling** - Different permission models per workspace
6. **No Workspace-Specific Caching** - One-size-fits-all cache strategy

**Minor Gaps (P2):**
7. **Missing Workspace Analytics** - Cannot optimize performance
8. **Incomplete Binding Validation** - Users can create invalid combinations

---

### 9.2 Recommended Implementation Order

**Immediate (Sprint Focus):**
1. Complete Study and Notes sync services (WB-8.1, WB-8.2)
2. Implement cross-workspace event system (WB-8.3)

**Short-term (Next 2 Sprints):**
1. Unify state management architecture (WB-9.1)
2. Implement workspace-aware agent tools (WB-9.2)
3. Add unified permission management (WB-9.3)

**Long-term (Next Month):**
1. Add workspace analytics (WB-10.1)
2. Implement smart workspace defaults (WB-10.2)
3. Add workspace-specific caching (WB-10.3)

---

### 9.3 Expected Outcomes

**After Phase 1 (P0):**
- All workspaces can perform file operations
- Cross-workspace file events enabled
- Basic sync status indicators

**After Phase 2 (P1):**
- Unified state management across all workspaces
- Workspace-aware agent tools
- Consistent permission handling

**After Phase 3 (P2):**
- Workspace analytics for optimization
- Smart workspace recommendations
- Performance-tuned caching strategies

---

**END OF DOCUMENT**

**Generated:** 2026-01-01
**Author:** BMAD Master Orchestrator
**Status:** DRAFT - FOR APPROVAL
**Next Review:** After Phase 1 completion (2 weeks)
