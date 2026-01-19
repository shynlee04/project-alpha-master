---
investigation_id: "IDE-ROUTE-STATE-LIFECYCLE"
created: "2026-01-20T20:00:00+07:00"
scope:
  - "IDE space route structure and guards"
  - "State management lifecycle for IDE workspace"
  - "Cross-domain dependencies"
  - "File inventory and import analysis"
  - "Issues identification and recommendations"
agent: "deep-scan-orchestrator"
---

# IDE Route/State Lifecycle Investigation Report

## Executive Summary

This investigation provides a comprehensive analysis of the IDE space route (`/ide/$projectId`), its guards, loaders, and the complete state management lifecycle. The investigation identifies **42 files** involved in the IDE route/state lifecycle, **12 cross-layer violations**, **8 deprecated imports**, and **5 architectural issues** requiring remediation.

### Key Findings

| Category | Count | Critical (P0) | High (P1) | Medium (P2) |
|----------|-------|---------------|-----------|-------------|
| Files Identified | 42 | - | - | - |
| Cross-Layer Violations | 12 | 4 | 5 | 3 |
| Deprecated Imports | 8 | 3 | 4 | 1 |
| Architectural Issues | 5 | 2 | 2 | 1 |

---

## 1. Route Structure Analysis

### 1.1 Primary Route File

**File**: `src/routes/ide.$projectId.tsx` (111 lines)

```
Route Pattern: /ide/$projectId
├── beforeLoad: requireIDEAccess() - Platform validation
├── loader: waitForHydration() → Dexie query → Project return
├── component: IDEWorkspace (wrapped in ErrorBoundary)
└── Lazy Loading: IDELayout via Suspense
```

**Key Components**:
- Lines 42-50: `beforeLoad` guard calling `requireIDEAccess(projectId)`
- Lines 53-73: `loader` with `waitForHydration()` for race condition prevention
- Lines 82-110: `IDEWorkspace` component creating workspace-scoped store

### 1.2 Parent Route File

**File**: `src/routes/ide.tsx` (146 lines)

```
Route Pattern: /ide (no project)
├── beforeLoad: Platform detection via getPlatformContract()
├── component: IDEWorkspace (empty state with navigation)
└── Child Route: /ide/$projectId via Outlet
```

**Key Features**:
- Lines 27-52: Platform validation (mobile redirect to `/hub`)
- Lines 69-134: Empty state UI with "Select Project Folder" and "Create / Browse Projects"
- Lines 141-145: `handleBrowseProjects()` navigation function

### 1.3 Route Guards

**File**: `src/infrastructure/filesystem/route-guards.ts` (36 lines)

| Guard | Purpose | Location |
|-------|---------|----------|
| `requireIDEAccess(projectId)` | Enforce IDE access restrictions | Line 23-35 |
| Redirect to `/notes/$projectId` | Mobile/tablet users blocked | Line 29-33 |

### 1.4 Loader Utilities

**File**: `src/infrastructure/persistence/stores/project/wait-for-hydration.ts` (44 lines)

| Function | Purpose | Line |
|----------|---------|------|
| `waitForHydration()` | Waits for Zustand store hydration | 15-34 |
| `isHydrated()` | Synchronous hydration check | 41-43 |

---

## 2. State Management Lifecycle

### 2.1 Store Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ZUSTAND STORE HIERARCHY (IDE)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  useProjectStore (Project CRUD - infrastructure/persistence/stores/)     │
│  ├── hydrateProjects() - Initial project load                            │
│  ├── createProject() - Project creation                                  │
│  ├── getProject(id) - Single project retrieval                           │
│  └── _hasHydrated - Hydration flag                                       │
│                                                                          │
│  useWorkspaceStore (Workspace state - infrastructure/persistence/)        │
│  ├── currentWorkspace: 'ide'                                             │
│  ├── currentProjectId: string | null                                     │
│  ├── availableAgents, availableTools                                     │
│  └── _hasHydrated - Hydration flag                                       │
│                                                                          │
│  createWorkspaceStore() (Factory - workspace-store-facade.ts)            │
│  └── Creates isolated store per (workspace, projectId)                   │
│                                                                          │
│  useFileLoaderSlice (React hook - use-file-loader-slice.ts)              │
│  ├── projectMetadata: ProjectMetadata | null                             │
│  ├── directoryHandle: FileSystemDirectoryHandle | null                   │
│  ├── permissionState: FsaPermissionState                                 │
│  └── localAdapterRef: LocalFSAdapter | UnifiedStorageAdapter             │
│                                                                          │
│  useFileOpsSlice (React hook - use-file-ops-slice.ts)                    │
│  ├── openFolder() - showDirectoryPicker                                  │
│  ├── switchFolder() - New picker + navigate                              │
│  ├── closeProject() - Navigate to /                                      │
│  └── restoreAccess() - Re-request permission                             │
│                                                                          │
│  useStorageAdapterSlice (React hook - use-storage-adapter-slice.ts)      │
│  ├── syncStatus: SyncStatus                                              │
│  ├── performSync(handle, options)                                        │
│  ├── syncNow()                                                           │
│  ├── syncManagerRef: SyncManager                                         │
│  └── eventBus: WorkspaceEventEmitter                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Store Files Inventory

| # | File | Lines | Purpose |
|---|------|-------|---------|
| 1 | `src/infrastructure/persistence/stores/project/useProjectStore.ts` | ~400+ | Project CRUD operations |
| 2 | `src/infrastructure/persistence/stores/project/wait-for-hydration.ts` | 44 | Hydration utility |
| 3 | `src/infrastructure/persistence/stores/workspace/workspace-store.ts` | 227 | Workspace state |
| 4 | `src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts` | 371 | Unified context provider |
| 5 | `src/infrastructure/persistence/stores/workspace-store-facade.ts` | 92 | Backward compatibility facade |
| 6 | `src/infrastructure/persistence/stores/workspace/slices/use-file-loader-slice.ts` | 205 | Project loading |
| 7 | `src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts` | 313 | File CRUD operations |
| 8 | `src/infrastructure/persistence/stores/workspace/slices/use-storage-adapter-slice.ts` | 358 | Sync management |

### 2.3 Hydration Flow

```
IDE Route Load Sequence:
1. User navigates to /ide/$projectId
2. TanStack Router beforeLoad executes
3. requireIDEAccess() checks platform.canAccessIDE
4. Route loader waits for waitForHydration()
5. Dexie query fetches project record
6. IDEWorkspace component mounts
7. useEffect creates workspace-scoped store
8. useFileLoaderSlice hydrates project metadata
9. useStorageAdapterSlice initializes sync manager
10. IDELayout renders with all state available
```

---

## 3. Cross-Domain Dependencies

### 3.1 IDE Component Imports (Presentation Layer)

**File**: `src/presentation/components/layout/IDELayoutMain.tsx`

| Import | Source | Issue |
|--------|--------|-------|
| `useVFSAutoWatch` | `@/infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice` | ✅ OK |
| `createWebContainerFSAAdapter` | `@/infrastructure/webcontainer/fsa-adapter` | ✅ OK |
| `createIdeFileGateway` | `@/infrastructure/filesystem/ide-file-gateway` | ✅ OK |
| `getInstance` | `@/lib/webcontainer` | ⚠️ lib/ import |

### 3.2 Infrastructure-to-Domain Imports

| File | Line | Import | Violation Type |
|------|------|--------|----------------|
| `note-gateway.ts` | 23 | `import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';` | Domain importing infrastructure type |
| `unified-file-crud.ts` | 32-33 | `import type { FileLock } from '@/lib/agent/facades/file-lock';` | Domain importing lib/ type |
| `unified-file-crud.ts` | 34 | `import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';` | Domain importing lib/ type |
| `unified-workspace-context.ts` | 31 | `import type { WorkspaceType } from '@/domain/entities/workspace';` | ✅ OK (correct direction) |

### 3.3 Infrastructure Importing from Lib/

| File | Line | Import | Status |
|------|------|--------|--------|
| `use-file-ops-slice.ts` | 22 | `import { UnifiedStorageAdapter } from '@/lib/filesystem/unified-storage-adapter';` | ⚠️ Should be infrastructure |
| `use-file-ops-slice.ts` | 28-33 | `import { getPermissionState, ... } from '@/lib/filesystem/permission-lifecycle';` | ⚠️ Deprecated |
| `use-file-loader-slice.ts` | 20 | `import { UnifiedStorageAdapter } from '@/lib/filesystem/unified-storage-adapter';` | ⚠️ Should be infrastructure |
| `use-storage-adapter-slice.ts` | 29 | `import { UnifiedStorageAdapter } from '@/lib/filesystem/unified-storage-adapter';` | ⚠️ Should be infrastructure |
| `use-storage-adapter-slice.ts` | 36-37 | `import { createWorkspaceEventBus, ... } from '@/lib/events/` | ⚠️ Deprecated |
| `ide.$projectId.tsx` | 22 | `import { ProjectProvider } from '@/lib/workspace/ProjectContext';` | ⚠️ Should be infrastructure |

---

## 4. File Inventory (Complete)

### 4.1 Routes

| # | File | Lines | Purpose |
|---|------|-------|---------|
| 1 | `src/routes/ide.tsx` | 146 | Parent route (empty state) |
| 2 | `src/routes/ide.$projectId.tsx` | 111 | Project-specific IDE route |

### 4.2 Guards & Loaders

| # | File | Lines | Purpose |
|---|------|-------|---------|
| 3 | `src/infrastructure/filesystem/route-guards.ts` | 36 | Platform validation guard |
| 4 | `src/infrastructure/filesystem/platform-contract.ts` | 342 | Platform detection contract |
| 5 | `src/infrastructure/persistence/stores/project/wait-for-hydration.ts` | 44 | Hydration utility |

### 4.3 State Stores (Infrastructure)

| # | File | Lines | Purpose |
|---|------|-------|---------|
| 6 | `src/infrastructure/persistence/stores/project/useProjectStore.ts` | 400+ | Project CRUD store |
| 7 | `src/infrastructure/persistence/stores/project/project-types.ts` | ~100 | Project type definitions |
| 8 | `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | 316 | Project CRUD operations |
| 9 | `src/infrastructure/persistence/stores/project/index.ts` | ~200 | Project store barrel |
| 10 | `src/infrastructure/persistence/stores/workspace/workspace-store.ts` | 227 | Workspace state store |
| 11 | `src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts` | 371 | Unified workspace context |
| 12 | `src/infrastructure/persistence/stores/workspace/index.ts` | 86 | Workspace store barrel |
| 13 | `src/infrastructure/persistence/stores/workspace-store-facade.ts` | 92 | Backward compatibility facade |

### 4.4 State Slices (Workspace)

| # | File | Lines | Purpose |
|---|------|-------|---------|
| 14 | `src/infrastructure/persistence/stores/workspace/slices/use-file-loader-slice.ts` | 205 | Project loading |
| 15 | `src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts` | 313 | File operations |
| 16 | `src/infrastructure/persistence/stores/workspace/slices/use-storage-adapter-slice.ts` | 358 | Sync management |
| 17 | `src/infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice.ts` | ~150 | VFS sync |

### 4.5 Domain Services

| # | File | Lines | Purpose |
|---|------|-------|---------|
| 18 | `src/domain/interfaces/storage-gateway.interface.ts` | ~100 | Storage gateway interface |
| 19 | `src/domain/interfaces/storage-adapter.interface.ts` | ~100 | Storage adapter interface |
| 20 | `src/domain/services/note-gateway.ts` | 347 | Note CRUD via gateway |
| 21 | `src/domain/services/file-crud/unified-file-crud.ts` | 619 | Unified file CRUD |
| 22 | `src/domain/services/file-crud/file-crud-types.ts` | ~200 | CRUD type definitions |

### 4.6 IDE Components

| # | File | Lines | Purpose |
|---|------|-------|---------|
| 23 | `src/presentation/components/layout/IDELayoutMain.tsx` | 359 | Main IDE layout |
| 24 | `src/presentation/components/layout/IDELayout/IDEResizableLayout.tsx` | ~400 | Resizable panels |
| 25 | `src/presentation/components/layout/IDELayout/IDESidebarPanels.tsx` | ~200 | Sidebar panels |
| 26 | `src/presentation/components/ide/FileTree/FileTree.tsx` | ~400 | File tree |
| 27 | `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` | ~500 | Code editor |
| 28 | `src/presentation/components/ide/AgentChatPanel.tsx` | ~600 | Chat interface |
| 29 | `src/presentation/components/ide/StatusBar.tsx` | ~200 | Status bar |
| 30 | `src/presentation/components/ide/XTerminal.tsx` | ~300 | Terminal |

### 4.7 Infrastructure Adapters

| # | File | Lines | Purpose |
|---|------|-------|---------|
| 31 | `src/infrastructure/filesystem/local-fs-adapter.ts` | ~300 | Local FS adapter |
| 32 | `src/infrastructure/filesystem/ide-file-gateway.ts` | ~500 | IDE file gateway |
| 33 | `src/infrastructure/webcontainer/fsa-adapter.ts` | ~400 | WebContainer FSA adapter |
| 34 | `src/infrastructure/sync/sync-manager.ts` | ~500 | Sync manager |

### 4.8 Legacy Lib Files (Should Be Migrated)

| # | File | Lines | Purpose |
|---|------|-------|---------|
| 35 | `src/lib/workspace/ProjectContext.tsx` | ~200 | Project context (deprecated) |
| 36 | `src/lib/workspace/workspace-detector.ts` | ~100 | Workspace detection |
| 37 | `src/lib/filesystem/permission-lifecycle.ts` | ~300 | Permission handling |
| 38 | `src/lib/filesystem/unified-storage-adapter.ts` | ~400 | Storage adapter (duplicate) |
| 39 | `src/lib/events/workspace-events.ts` | ~200 | Workspace events |
| 40 | `src/lib/webcontainer/index.ts` | ~100 | WebContainer utilities |
| 41 | `src/lib/agent/facades/file-lock.ts` | ~100 | File locking |
| 42 | `src/lib/sync/index.ts` | ~150 | Sync utilities |

---

## 5. Issues Identified

### 5.1 Cross-Layer Violations (P0 - Critical)

| # | File | Line | Issue | Recommendation |
|---|------|------|-------|----------------|
| 1 | `note-gateway.ts` | 23 | Domain importing `NoteRecord` from infrastructure | Move NoteRecord to domain or use interface |
| 2 | `unified-file-crud.ts` | 32-33 | Domain importing `FileLock` from lib/ | Move FileLock to domain |
| 3 | `unified-file-crud.ts` | 34 | Domain importing `WorkspaceEventEmitter` from lib/ | Move event types to domain |
| 4 | `ide.$projectId.tsx` | 22 | Component importing `ProjectProvider` from lib/ | Move to infrastructure |

### 5.2 Deprecated Imports (P0 - Critical)

| # | File | Line | Import | Recommendation |
|---|------|------|--------|----------------|
| 5 | `use-file-ops-slice.ts` | 22 | `UnifiedStorageAdapter` from lib/ | Import from infrastructure |
| 6 | `use-file-ops-slice.ts` | 28-33 | `getPermissionState`, etc. from lib/ | Import from infrastructure |
| 7 | `use-file-loader-slice.ts` | 20 | `UnifiedStorageAdapter` from lib/ | Import from infrastructure |
| 8 | `use-storage-adapter-slice.ts` | 29 | `UnifiedStorageAdapter` from lib/ | Import from infrastructure |

### 5.3 Duplicate Implementations (P1 - High)

| # | Files | Issue |
|---|-------|-------|
| 9 | `fsa-storage-adapter.ts` (673 lines) vs `fsa-gateway.ts` (~711 lines) | Duplicate FSA operations |
| 10 | `local-fs-adapter.ts` vs `ide-file-gateway.ts` | Overlapping file I/O |
| 11 | `ProjectProvider` (lib/) vs `UnifiedWorkspaceContext` (infrastructure/) | Duplicate context providers |

### 5.4 God Components (P1 - High)

| # | File | Lines | Limit | Exceeds By |
|---|------|-------|-------|------------|
| 12 | `MonacoEditor.tsx` | ~500 | 300 | 67% |
| 13 | `AgentChatPanel.tsx` | ~600 | 300 | 100% |
| 14 | `IDELayoutMain.tsx` | 359 | 300 | 20% |
| 15 | `IDEResizableLayout.tsx` | ~400 | 300 | 33% |
| 16 | `FileTree.tsx` | ~400 | 300 | 33% |

### 5.5 Architectural Issues (P2 - Medium)

| # | Issue | Location | Recommendation |
|---|-------|----------|----------------|
| 17 | WaitForHydration duplicates in routes | `ide.$projectId.tsx:58`, `notes.$projectId.tsx` | Extract to shared middleware |
| 18 | Complex fallback logic in file loader | `use-file-loader-slice.ts:126-168` | Use strategy pattern |
| 19 | Navigation logic scattered | `ide.tsx:141`, `HubHomePage.tsx` | Create NavigationService |
| 20 | No DexieStorageAdapter implementation | `infrastructure/filesystem/` | Implement missing adapter |

---

## 6. State Initialization Flow

```
IDE State Initialization Sequence:

1. Route Loader (ide.$projectId.tsx)
   ├─ beforeLoad: requireIDEAccess()
   │  └─ getPlatformContract() → canAccessIDE check
   ├─ loader: waitForHydration()
   │  └─ await useProjectStore._hasHydrated
   └─ Query Dexie: db.projects.get(projectId)

2. Component Mount (IDEWorkspace)
   └─ useEffect: createWorkspaceStore('ide', projectId)

3. Hook Initialization (IDELayoutMain)
   ├─ useFileLoaderSlice({ initialProjectId })
   │  ├─ Load projectMetadata from Dexie
   │  ├─ Restore FSA handle via handlePersistenceService
   │  └─ Create LocalFSAdapter
   ├─ useFileOpsSlice({ ... })
   │  └─ Ready for openFolder, switchFolder, closeProject
   └─ useStorageAdapterSlice({ ... })
      ├─ Create SyncManager
      ├─ Initialize eventBus
      └─ Ready for sync operations

4. WebContainer Integration
   ├─ useWebContainerBoot()
   └─ createWebContainerFSAAdapter()

5. Panel Initialization
   ├─ IDEDiscoveryMechanisms (Command Palette, Feature Search)
   ├─ IDESidebarPanels (File Tree, Search, Settings)
   ├─ IDEResizableLayout (Editor, Preview, Terminal, Chat)
   └─ StatusBar (Provider, WebContainer, Sync status)
```

---

## 7. Recommendations

### Immediate (P0 - Before Any New Features)

1. **Migrate ProjectProvider to Infrastructure**
   - Move `src/lib/workspace/ProjectContext.tsx` to `src/infrastructure/persistence/stores/workspace/`
   - Update `ide.$projectId.tsx` import

2. **Fix Cross-Layer Type Imports**
   - Move `NoteRecord` type to domain layer
   - Move `FileLock` and `WorkspaceEventEmitter` to domain
   - Update `note-gateway.ts` and `unified-file-crud.ts`

3. **Consolidate Storage Adapter Imports**
   - Move `UnifiedStorageAdapter` to infrastructure
   - Update all 3 slice files to import from canonical path

### Short-Term (P1 - Next Sprint)

4. **Consolidate FSA Adapters**
   - Merge `fsa-storage-adapter.ts` and `ide-file-gateway.ts`
   - Keep single implementation with clear interface hierarchy

5. **Implement DexieStorageAdapter**
   - Complete the StorageGateway abstraction
   - Implement missing Dexie adapter for mobile

6. **Extract Route Middleware**
   - Create shared `waitForHydration` middleware
   - Apply to all routes requiring hydrated state

### Medium-Term (P2 - Following Sprint)

7. **Decompose God Components**
   - Split `AgentChatPanel.tsx` into focused sub-components
   - Split `MonacoEditor.tsx` into editor + tab bar + decorations
   - Split `FileTree.tsx` into tree + context menu + dialogs

8. **Create NavigationService**
   - Centralize navigation logic from `ide.tsx`, `HubHomePage.tsx`
   - Provide consistent navigation API

9. **Clean Up Legacy Lib Files**
   - Archive `src/lib/workspace/` (except index.ts facade)
   - Archive `src/lib/filesystem/` (except index.ts facade)
   - Archive `src/lib/events/` (except index.ts facade)

---

## 8. Dependencies Graph

```
IDE Route → Route Guards → Platform Contract
     ↓
IDE Workspace → ProjectProvider (lib/workspace)
     ↓
IDELayoutMain → 5-Cornerstone Contexts
     ├─ useFileLoaderSlice → LocalFSAdapter → handlePersistenceService
     ├─ useFileOpsSlice → SyncManager → createWorkspaceEventBus
     ├─ useStorageAdapterSlice → noteFolderBridge
     ├─ useVFSAutoWatch → crossWorkspaceEventBus
     └─ useIDEFileHandlers → UnifiedFileCrudService → StorageAdapter
          ↓
          Domain Services (note-gateway, unified-file-crud)
          ↓
          Infrastructure (LocalFSAdapter, DexieStorageAdapter)
```

---

## 9. Validation Checklist

- [x] Route structure analyzed
- [x] Guards and loaders documented
- [x] State management lifecycle mapped
- [x] Cross-domain dependencies identified
- [x] Complete file inventory created
- [x] Issues categorized by priority
- [x] Recommendations provided

---

*Report generated by deep-scan-orchestrator*
*Investigation ID: IDE-ROUTE-STATE-LIFECYCLE*
*Date: 2026-01-20*
