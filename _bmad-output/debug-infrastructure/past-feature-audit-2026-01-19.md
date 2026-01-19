# Past Feature Audit: Project Alpha IDE (15-25 days ago)

**Document ID:** `past-feature-audit-2026-01-19`
**Created:** 2026-01-19
**Source:** `_bmad-ext/.archive-past-src/`
**Purpose:** Document features and patterns from the working IDE implementation

---

## 1. Feature Inventory Table

| Feature | Implementation | Location | Dependencies |
|---------|---------------|----------|--------------|
| **Workspace Context Pattern** | React Context + hooks composition | `lib/workspace/WorkspaceContext.tsx` | TanStack Router, useWorkspaceState, useSyncOperations, useWorkspaceActions |
| **State Management** | TanStack Store (Derived) + useState/useRef | `lib/workspace/file-sync-status-store.ts` | @tanstack/store |
| **File Operations** | LocalFSAdapter class with delegation pattern | `lib/filesystem/local-fs-adapter.ts` | File System Access API |
| **File Sync** | SyncManager class with dual-write strategy | `lib/filesystem/sync-manager.ts` | WebContainer mount API |
| **Project Persistence** | IndexedDB via idb library | `lib/persistence/db.ts`, `lib/workspace/project-store.ts` | idb, @tanstack/store |
| **IDE State Persistence** | Custom hook with debounced save | `hooks/useIdeStatePersistence.ts` | IndexedDB |
| **Permission Management** | Permission lifecycle helper | `lib/filesystem/permission-lifecycle.ts` | File System Access API |
| **Event Bus** | EventEmitter3 for decoupled communication | `lib/events/workspace-events.ts` | eventemitter3 |
| **File Tree** | React components with recursive rendering | `components/ide/FileTree/` | React, File System Access API |
| **Monaco Editor** | Monaco Editor wrapper with tab management | `lib/ide/MonacoEditor.tsx` | @monaco-editor/react |
| **Layout Management** | react-resizable-panels with state restoration | `components/layout/IDELayout.tsx` | react-resizable-panels |
| **WebContainer** | WebContainer boot and mount | `lib/webcontainer/manager.ts` | @webcontainer/api |
| **Terminal** | xterm.js with process management | `components/layout/TerminalPanel.tsx` | @xterm/xterm, @xterm/addon-fit |
| **Auto-Sync Logic** | State-based trigger with isWebContainerBooted flag | `lib/workspace/hooks/useInitialSync.ts` | useEffect, sync operations |

---

## 2. Pattern Analysis

### 2.1 WorkspaceContext Pattern Breakdown

The `WorkspaceContext.tsx` implements a sophisticated composition pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    WorkspaceProvider                         │
├─────────────────────────────────────────────────────────────┤
│  1. useWorkspaceState() → state, setters, refs              │
│     - projectMetadata, directoryHandle, permissionState      │
│     - syncStatus, syncProgress, lastSyncTime                 │
│     - isWebContainerBooted, initialSyncCompleted             │
│     - localAdapterRef, syncManagerRef, eventBusRef           │
├─────────────────────────────────────────────────────────────┤
│  2. useSyncOperations() → performSync, syncNow               │
│     - Creates/updates LocalFSAdapter and SyncManager         │
│     - Handles sync errors and progress                       │
├─────────────────────────────────────────────────────────────┤
│  3. useWorkspaceActions() → openFolder, switchFolder, etc.   │
│     - Calls LocalFSAdapter.requestDirectoryAccess()          │
│     - Saves to ProjectStore (IndexedDB)                      │
│     - Triggers performSync()                                 │
├─────────────────────────────────────────────────────────────┤
│  4. useEventBusEffects() → Sync status tracking              │
│     - Listens to eventBus events                             │
│     - Updates file-sync-status-store                         │
├─────────────────────────────────────────────────────────────┤
│  5. useInitialSync() → Auto-sync trigger                     │
│     - Triggers only when isWebContainerBooted=true           │
│     - Checks permissionState before syncing                  │
├─────────────────────────────────────────────────────────────┤
│  6. Context Value Construction                               │
│     - Spreads state and actions                              │
│     - Exposes refs for direct adapter access                 │
└─────────────────────────────────────────────────────────────┘
```

**Key Pattern: Ref-Based Adapter Caching**

```typescript
// The SyncManager and LocalFSAdapter are cached in refs
// to avoid recreation on every render
const localAdapterRef = useRef<LocalFSAdapter | null>(null);
const syncManagerRef = useRef<SyncManager | null>(null);

// Created once on first use, reused thereafter
if (!adapter || !syncManager) {
    adapter = new LocalFSAdapter();
    adapter.setDirectoryHandle(handle);
    syncManager = new SyncManager(adapter, config, eventBus);
    localAdapterRef.current = adapter;
    syncManagerRef.current = syncManager;
}
```

### 2.2 TanStack Store Usage

The past implementation used two patterns:

**Pattern 1: Direct Store for File Sync Status**

```typescript
// lib/workspace/file-sync-status-store.ts
export const fileSyncStatusStore = new Store<FileSyncStatusMap>(new Map());

export const fileSyncCountsStore = new Derived<FileSyncCounts>({
    deps: [fileSyncStatusStore],
    fn: ({ currDepVals }) => {
        const map = currDepVals[0] as FileSyncStatusMap;
        // Count states...
        return { synced, pending, error, total };
    },
});
```

**Pattern 2: useState/useRef for Workspace State**

```typescript
// lib/workspace/hooks/useWorkspaceState.ts
export function useWorkspaceState(initialProject) {
    // React state for UI updates
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [permissionState, setPermissionState] = useState<FsaPermissionState>('unknown');
    
    // Refs for mutable values that don't need re-renders
    const localAdapterRef = useRef<LocalFSAdapter | null>(null);
    const eventBusRef = useRef<WorkspaceEventEmitter>(createWorkspaceEventBus());
    
    return { state, setters, refs };
}
```

### 2.3 File Sync Mechanism

**Dual-Write Strategy:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      SyncManager.writeFile(path, content)        │
├─────────────────────────────────────────────────────────────────┤
│  1. Emit 'sync:started' event                                   │
│  2. Write to LocalFS first (source of truth)                    │
│     await localAdapter.writeFile(path, content)                 │
│  3. If WebContainer booted, write to WC                         │
│     await fs.writeFile(path, content)                           │
│  4. Emit 'sync:completed' event                                 │
└─────────────────────────────────────────────────────────────────┘
```

**File Tree Sync Pattern:**

```typescript
// lib/filesystem/sync-manager.ts
async syncToWebContainer() {
    // Pre-scan for progress tracking
    const totalFileCount = await countFilesToSync(adapter, '', excludePatterns);
    
    // Build file tree recursively
    const tree = await buildFileSystemTree(adapter, '', result, processedRef);
    
    // Mount to WebContainer
    await mount(tree);
}
```

---

## 3. State Management Map

### 3.1 Where State Lives

| State | Location | Persistence | Hot Reload Trigger |
|-------|----------|-------------|-------------------|
| **Project Metadata** | `project-store.ts` → IndexedDB | Permanent | None |
| **Directory Handle** | `permission-lifecycle.ts` → IndexedDB | Permanent | None |
| **IDE Layout** | `useIdeStatePersistence.ts` → IndexedDB | Permanent | Project change |
| **Open Files** | `useIdeStatePersistence.ts` → IndexedDB | Permanent | Project change |
| **Sync Status** | `useWorkspaceState.ts` → React State | None | EventBus |
| **File Tree** | `FileTree.tsx` → Local Component | None | Manual refresh key |
| **Permission State** | `useWorkspaceState.ts` → React State | None | Permission dialog |
| **Sync Progress** | `useWorkspaceState.ts` → React State | None | EventBus |

### 3.2 How Persistence Worked

**IndexedDB Schema (Unified DB):**

```typescript
// lib/persistence/db.ts
export interface ViaGentPersistenceDB extends DBSchema {
    projects: {
        key: string;
        value: ProjectMetadata;
        indexes: { 'by-last-opened': Date };
    };
    conversations: {
        key: string;
        value: ConversationRecord;
        indexes: { 'by-project-id': string; 'by-updated-at': Date };
    };
    ideState: {
        key: string;
        value: IdeStateRecord;
        indexes: { 'by-project-id': string; 'by-updated-at': Date };
    };
}
```

**IDE State Persistence Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  useIdeStatePersistence Hook                     │
├────────────────────────────────────────────────────────────┬────┤
│  Load State (on projectId change):                          │    │
│  - getIdeState(projectId) → load from IndexedDB            │    │
│  - Set restoredIdeState                                     │    │
├────────────────────────────────────────────────────────────┼────┤
│  Save State (debounced 250-400ms):                         │    │
│  - scheduleIdeStatePersistence(delayMs)                    │    │
│  - setTimeout(saveIdeState(...), delayMs)                  │    │
│  - saveIdeState() → write to IndexedDB                     │    │
└────────────────────────────────────────────────────────────┴────┘
```

### 3.3 Hot Reload Triggers

**File Tree Refresh:**

```typescript
// When file is saved, emit event that triggers file tree refresh
eventBus.emit('file:modified', { path, source: 'editor' });

// IDELayout listens and increments refresh key
const handleSave = useCallback(async (path, content) => {
    await syncManagerRef.current.writeFile(path, content);
    setFileTreeRefreshKey((prev) => prev + 1);
}, []);
```

**Automatic Sync on File Change:**

```typescript
// useEventBusEffects listens to file modifications
const handleFileModified = (payload) => {
    setFileSyncPending(payload.path);
};

// This updates the UI to show sync status
```

---

## 4. Integration Points

### 4.1 Component Connections

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Route: /workspace/$projectId                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  WorkspaceProvider                                            │   │
│  │  ├─ useWorkspaceState (state + refs)                         │   │
│  │  ├─ useSyncOperations (performSync, syncNow)                 │   │
│  │  ├─ useWorkspaceActions (openFolder, switchFolder, etc.)     │   │
│  │  ├─ useEventBusEffects (sync status tracking)                │   │
│  │  └─ useInitialSync (auto-sync trigger)                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  IDELayout                                                   │   │
│  │  ├─ IDEHeaderBar (project name, sync status)                 │   │
│  │  ├─ FileTree (file explorer)                                 │   │
│  │  │   └─ Uses localAdapterRef.current for file operations     │   │
│  │  ├─ MonacoEditor (code editor with tabs)                     │   │
│  │  │   └─ Uses syncManagerRef.current for saves                │   │
│  │  ├─ TerminalPanel (xterm.js terminal)                        │   │
│  │  ├─ PreviewPanel (dev server preview)                        │   │
│  │  └─ ChatPanelWrapper (AI chat)                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 Data Flow Diagrams

**File Save Flow:**

```
User clicks Save in Monaco Editor
           │
           ▼
IDELayout.handleSave(path, content)
           │
           ▼
syncManagerRef.current.writeFile(path, content)
           │
           ├─────────────────────────────────────────────┐
           │                                             │
           ▼                                             ▼
localAdapter.writeFile(path, content)           eventBus.emit('file:modified', {path})
           │                                             │
           ▼                                             ▼
IndexedDB? (optional)                       useEventBusEffects
           │                                 setFileSyncPending(path)
           ▼                                 
File Tree refresh key increments
```

**Initial Load Flow:**

```
Route loads: /workspace/$projectId
           │
           ▼
WorkspaceProvider initializes
           │
           ├─ useWorkspaceState (load from IndexedDB)
           ├─ useEventBusEffects (register listeners)
           └─ useInitialSync (check conditions)
           │
           ▼
IDELayout mounts
           │
           ├─ useIdeStatePersistence (load IDE state)
           ├─ WebContainer.boot() → setIsWebContainerBooted(true)
           │                                             │
           │     ┌─────────────────────────────────────┐ │
           │     │  useInitialSync detects:            │ │
           │     │  - directoryHandle exists           │ │
           │     │  - isWebContainerBooted = true      │ │
           │     │  - initialSyncCompleted = false     │ │
           │     │  - autoSync = true                  │ │
           │     └─────────────────────────────────────┘ │
           │                     │                       │
           └─────────────────────┼───────────────────────┘
                                 ▼
                      performSync(directoryHandle)
                                 │
                                 ▼
                      syncManager.syncToWebContainer()
                                 │
                                 ▼
                      mount(fileSystemTree)
                                 │
                                 ▼
                      Initial sync complete!
```

### 4.3 Event/Callback Patterns

**Event Bus Pattern:**

```typescript
// lib/events/workspace-events.ts
export type WorkspaceEvents = {
    'file:modified': [{ path: string; source: 'local' | 'editor' | 'agent' }],
    'file:deleted': [{ path: string; source: 'local' | 'editor' | 'agent' }],
    'sync:started': [{ fileCount: number; direction: 'to-wc' | 'to-local' }],
    'sync:progress': [{ current: number; total: number; currentFile: string }],
    'sync:completed': [{ success: boolean; timestamp: Date; filesProcessed: number }],
    'sync:error': [{ error: Error; file?: string }],
    // ... more events
};

export function createWorkspaceEventBus(): WorkspaceEventEmitter {
    return new EventEmitter<WorkspaceEvents>();
}
```

**Hook Composition Pattern:**

```typescript
// lib/workspace/hooks/useWorkspaceActions.ts
export function useWorkspaceActions(
    navigate: NavigateFn,
    state: WorkspaceStateReturn['state'],
    setters: WorkspaceStateReturn['setters'],
    refs: WorkspaceStateReturn['refs'],
    syncOperations: SyncOperationsReturn,
    projectId: string
) {
    const openFolder = useCallback(async () => {
        // Implementation
    }, [dependencies]);
    
    return { openFolder, switchFolder, setAutoSync, closeProject };
}
```

---

## 5. Lessons Learned

### 5.1 What Worked Well

| Pattern | Why It Worked | Should Replicate |
|---------|--------------|------------------|
| **Context + Hook Composition** | Clean separation of concerns, easy to test | ✅ Yes |
| **LocalFSAdapter Class** | Clean API, delegation to file-ops.ts, dir-ops.ts | ✅ Yes |
| **Dual-Write Sync** | Local FS as source of truth, WebContainer mirrors | ✅ Yes |
| **Ref-Based Adapter Caching** | Avoids recreation, stable references | ✅ Yes |
| **IndexedDB for Handles** | Enables permission restoration on reload | ✅ Yes |
| **Event Bus Decoupling** | Components can react without tight coupling | ✅ Yes |
| **Debounced State Persistence** | Prevents IndexedDB spam, smooth UX | ✅ Yes |
| **State-Based Auto-Sync Trigger** | `isWebContainerBooted` flag fixes race condition | ✅ Yes |
| **TanStack Store for File Status** | Efficient computed counts | ✅ Yes (if needed) |

### 5.2 What Was Simple

1. **Permission Lifecycle**: Single helper module with clear functions
   - `getPermissionState()`, `ensureReadWritePermission()`, `restorePermission()`

2. **Project Store**: CRUD operations on IndexedDB
   - `saveProject()`, `getProject()`, `listProjects()`, `deleteProject()`

3. **File Operations**: Delegation pattern
   - `fileOps.readFile()`, `fileOps.writeFile()`, `fileOps.deleteFile()`

4. **Event Bus**: EventEmitter3 simple API
   - `eventBus.emit()`, `eventBus.on()`, `eventBus.off()`

### 5.3 What Was Complex/Problematic

| Issue | Root Cause | Fix Applied |
|-------|-----------|-------------|
| **Auto-sync not triggering** | Used ref-based check (`!syncManagerRef.current`) which only triggered once | Added `isWebContainerBooted` state flag for reliable triggering |
| **File deletion for nested paths** | Original code called `removeEntry(path)` on root (may not support paths) | Implemented proper parent-walking logic in file-ops.ts |
| **Permission state not persisting** | Stored in legacy IndexedDB separately from ProjectStore | Unified storage in ProjectStore with lastKnownPermissionState |
| **IDE state restoration timing** | Panels restoring before WebContainer ready | Added check: `permissionState !== 'granted'` before restoring files |

### 5.4 Recommendations for Current Implementation

#### Priority 1: Must Replicate

1. **WorkspaceProvider with Hook Composition**
   - `useWorkspaceState()` for all state/refs
   - `useSyncOperations()` for adapter/sync-manager lifecycle
   - `useWorkspaceActions()` for all actions
   - `useEventBusEffects()` for sync status tracking
   - `useInitialSync()` with state-based triggers

2. **LocalFSAdapter Pattern**
   - Singleton class wrapper around FSA API
   - Delegation to `fileOps` and `dirOps` modules
   - Proper error handling with FileSystemError

3. **IndexedDB for Handle Persistence**
   - Store FileSystemDirectoryHandle directly
   - Enable permission restoration on reload
   - Include `lastKnownPermissionState` in ProjectMetadata

4. **State-Based Auto-Sync Trigger**
   - Use `isWebContainerBooted` state
   - Only sync when WebContainer is ready
   - Check `permissionState === 'granted'` before syncing

#### Priority 2: Should Consider

1. **Event Bus for Decoupled Communication**
   - Use EventEmitter3 for file/sync events
   - Enables UI updates without prop drilling

2. **TanStack Store for Computed State**
   - Use Derived for file sync counts
   - Efficient for reactive UI updates

3. **Debounced IDE State Persistence**
   - 250-400ms debounce for layout changes
   - Prevents IndexedDB spam

#### Priority 3: Optional Enhancements

1. **Permission Restore Overlay**
   - Show overlay when `permissionState === 'prompt'`
   - "Restore Access" button to trigger permission dialog

2. **File Tree Refresh Key Pattern**
   - Increment key on file save
   - Forces re-render of file tree

3. **Error Boundary with Recovery**
   - Sync errors stored in file-sync-status-store
   - UI shows failed files with retry options

---

## 6. Key Code Snippets

### 6.1 LocalFSAdapter.getAdapter() Pattern

```typescript
// Past implementation used singleton
export const localFS = new LocalFSAdapter();

// But inside WorkspaceContext, refs were used for per-project adapters
const localAdapterRef = useRef<LocalFSAdapter | null>(null);

// Created on first sync
let adapter = localAdapterRef.current;
if (!adapter) {
    adapter = new LocalFSAdapter();
    adapter.setDirectoryHandle(handle);
    localAdapterRef.current = adapter;
}
```

### 6.2 Sync Manager Lifecycle

```typescript
// Created once, cached in ref
let syncManager = syncManagerRef.current;
if (!syncManager) {
    syncManager = new SyncManager(adapter, {
        onProgress: (progress) => setSyncProgress(progress),
        onError: (error) => setSyncError(error.message),
        onComplete: (result) => { /* handle completion */ },
    }, eventBusRef.current);
    syncManagerRef.current = syncManager;
}
```

### 6.3 Project Registration

```typescript
// When opening folder
const project: ProjectMetadata = {
    id: projectId,
    name: handle.name,
    folderPath: handle.name,  // Display name only (FSA security)
    fsaHandle: handle,        // Stored for permission restoration
    lastOpened: new Date(),
    autoSync: true,
    exclusionPatterns: [...EXTENDED_DEFAULT_PATTERNS],
};
await saveProject(project);
```

---

## 7. File Structure Reference

```
_bmad-ext/.archive-past-src/
├── lib/
│   ├── workspace/
│   │   ├── WorkspaceContext.tsx         ← Core context provider
│   │   ├── WorkspaceProvider.tsx        ← Combines hooks
│   │   ├── workspace-types.ts           ← Type definitions
│   │   ├── project-store.ts             ← IndexedDB CRUD
│   │   ├── file-sync-status-store.ts    ← TanStack Store
│   │   ├── ide-state-store.ts           ← IDE layout state
│   │   ├── hooks/
│   │   │   ├── useWorkspaceState.ts     ← State + Refs
│   │   │   ├── useWorkspaceActions.ts   ← Actions
│   │   │   ├── useSyncOperations.ts     ← Sync logic
│   │   │   ├── useInitialSync.ts        ← Auto-sync trigger
│   │   │   └── useEventBusEffects.ts    ← Event listeners
│   │   └── index.ts                     ← Public exports
│   │
│   ├── filesystem/
│   │   ├── local-fs-adapter.ts          ← FSA wrapper
│   │   ├── file-ops.ts                  ← File CRUD
│   │   ├── dir-ops.ts                   ← Dir CRUD
│   │   ├── sync-manager.ts              ← Dual-write sync
│   │   ├── sync-operations.ts           ← Tree building
│   │   ├── directory-walker.ts          ← Recursive traversal
│   │   ├── permission-lifecycle.ts      ← Permission handling
│   │   ├── path-utils.ts                ← Path validation
│   │   ├── handle-utils.ts              ← Handle resolution
│   │   └── fs-types.ts                  ← Type definitions
│   │
│   ├── persistence/
│   │   ├── db.ts                        ← IndexedDB schema
│   │   └── index.ts                     ← Public API
│   │
│   ├── events/
│   │   ├── workspace-events.ts          ← Event types
│   │   └── use-workspace-event.ts       ← Hook
│   │
│   └── webcontainer/
│       ├── manager.ts                   ← Boot/mount
│       ├── process-manager.ts           ← Process handling
│       └── terminal-adapter.ts          ← Terminal integration
│
├── hooks/
│   └── useIdeStatePersistence.ts        ← IDE state + debounce
│
├── components/
│   ├── layout/
│   │   ├── IDELayout.tsx                ← Main layout
│   │   ├── IDEHeaderBar.tsx             ← Header
│   │   └── TerminalPanel.tsx            ← Terminal
│   │
│   └── ide/
│       ├── FileTree/                    ← File explorer
│       ├── MonacoEditor/                ← Code editor
│       └── SyncStatusIndicator.tsx      ← Sync status UI
│
└── routes/
    └── workspace/
        └── $projectId.tsx               ← Route component
```

---

## 8. Summary

The past working implementation (15-25 days ago) was built on several key patterns:

1. **Context + Hook Composition**: Clean separation where hooks own logic and context distributes state
2. **Ref-Based Caching**: Adapters and managers cached in refs to avoid recreation
3. **Dual-Write Sync**: Local FS as source of truth, WebContainer as mirror
4. **IndexedDB for Persistence**: Handles, projects, and IDE state all persisted
5. **Event Bus Decoupling**: Components communicate through events, not props
6. **State-Based Triggers**: Auto-sync triggered by state flags, not ref checks

The most critical lesson for the current implementation is the **state-based auto-sync trigger** pattern using `isWebContainerBooted`. The original ref-based check was unreliable because it only triggered once. Adding proper state flags made the sync reliable.

**Key files to reference for current implementation:**
- `WorkspaceContext.tsx` - Context pattern
- `useInitialSync.ts` - Auto-sync logic (Story 13-2 fix)
- `local-fs-adapter.ts` - FSA wrapper
- `sync-manager.ts` - Dual-write strategy
- `project-store.ts` - Handle persistence
- `permission-lifecycle.ts` - Permission handling
