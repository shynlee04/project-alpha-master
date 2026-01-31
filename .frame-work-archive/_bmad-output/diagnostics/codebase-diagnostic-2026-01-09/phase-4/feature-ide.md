# IDE Feature Diagnostic Report
**Generated**: 2026-01-09
**Scope**: `/Users/apple/Documents/coding-projects/project-alpha-master`

---

## 1. Entry Points Table

| Route | File | Entry Type | Notes |
|-------|------|------------|-------|
| `/ide` | `src/routes/ide.tsx` | Landing Page | Shows project selector, temp project creation, folder picker |
| `/ide/$projectId` | `src/routes/ide.$projectId.tsx` | Main Workspace | Wraps IDELayout with ProjectProvider and ToastProvider |

### Entry Flow

```
/ide (landing)
  ├─ "Quick IDE" button → getOrCreateTempProject() → /ide/$projectId
  ├─ "Select Project Folder" → FolderPickerDialog → /ide/$projectId  
  └─ "Browse Projects" → /hub

/ide/$projectId (main IDE)
  ├─ Route.loader: getProject(params.projectId)
  ├─ ProjectProvider wraps IDELayout
  └─ IDELayoutMain lazy-loaded via Suspense
```

### Key Code Points

**src/routes/ide.tsx:85-100** - Route detection and IDELayout rendering:
```typescript
const isOnChildRoute = window.location.pathname !== '/ide';
if (isOnChildRoute) {
  return (
    <MainLayout>
      <Suspense fallback={<IDESkeleton />}>
        <IDELayout />
      </Suspense>
    </MainLayout>
  );
}
```

**src/routes/ide.$projectId.tsx:36-45** - Route loader:
```typescript
loader: async ({ params }) => {
  const project = await getProject(params.projectId);
  return { project };
},
```

---

## 2. Component Tree ASCII Diagram

```
IDELayoutMain.tsx (presentation/components/layout/)
│
├── MainLayout wrapper
│
├── PermissionOverlay (if permissionState === 'prompt')
│
├── IDEHeaderBar
│   ├─ Project name display
│   ├─ Sync toggle
│   ├─ Chat toggle
│   └─ Workspace switcher
│
├── SidebarProvider
│   ├── ActivityBar (icon sidebar)
│   │   └─ IconSidebar.tsx
│   └── SidebarContent
│       └─ IDESidebarPanels
│           ├─ ExplorerPanel (FileTree)
│           │   └─ FileTree/FileTree.tsx
│           │       ├─ FileTreeItem
│           │       ├─ ContextMenu
│           │       └─ SyncStatusIndicator
│           ├─ SearchPanel
│           ├─ SettingsPanel
│           └─ AgentsPanel
│
├── IDEResizableLayout (react-resizable-panels)
│   │
│   ├── IDEEditorPreviewGroup
│   │   ├─ EditorTabBar
│   │   ├─ MonacoEditor
│   │   │   └─ Editor (lazy-loaded @monaco-editor/react)
│   │   └─ PreviewPanel (iframe)
│   │
│   ├── IDETerminalPanel
│   │   └─ XTerminal (@xterm/xterm + FitAddon)
│   │
│   └── IDEChatPanel (conditional, chatVisible)
│       └─ AgentChatPanel
│           ├─ AgentChatHeader
│           ├─ AgentChatConversationManager
│           ├─ AgentChatToolFacades
│           └─ StreamingMessage
│
├── IDEDiscoveryMechanisms (conditional)
│   ├─ CommandPalette (Ctrl/Cmd+P)
│   └─ FeatureSearch
│
├── StatusBar (footer)
│   ├─ WebContainerStatus
│   ├─ AgentStatusSegment
│   ├─ SyncStatusSegment
│   ├─ ProviderStatus
│   ├─ CursorPosition
│   └─ FileTypeIndicator
│
└── SyncDevTools (development mode only)

Mobile variants:
└── MobileIDELayout (viewports < 768px)
    ├─ MobileTabBar
    └─ MobileView components
```

---

## 3. State Sources Table

| Store | Location | Persistence | description |
|-------|----------|-------------|---------|
| **useIDEStore** | `infrastructure/persistence/stores/ide/useIDEStore.ts` | Dexie (ideState table) | Editor state, panels, terminal tabs, file tree |
| **useProjectStore** | `infrastructure/persistence/stores/project/useProjectStore.ts` | Dexie (projects table) | Project CRUD, workspace bindings, permissions |
| **ProjectContext** | `lib/workspace/ProjectContext.tsx` | React Context + localStorage | Cross-workspace project state, workspace switching |
| **useWorkspaceSync** | `infrastructure/persistence/stores/workspace/index.ts` | React Context + Dexie | FSA handle, sync status, sync manager |
| **useFileSyncStatusStore** | `lib/workspace/file-sync-status-store.ts` | In-memory Zustand | File sync counts, status per file |

### IDE Store Slice Composition (useIDEStore)

```
CombinedIDEState (6 slices, each <120 lines)
├─ createIDEEditorSlice
│   ├─ openFiles, activeFile, activeFileScrollTop
│   └─ setOpenFiles, setActiveFile, addOpenFile, removeOpenFile
│
├─ createIDEExplorerSlice
│   ├─ expandedPaths (Set<string>)
│   └─ setExpandedPaths
│
├─ createIDELayoutSlice
│   ├─ panelLayouts, panelCollapsed, chatVisible
│   └─ setPanelLayouts, setPanelCollapsed, setChatVisible
│
├─ createIDETerminalSlice
│   ├─ terminalTab
│   └─ setTerminalTab
│
├─ createIDEProjectSlice
│   ├─ projectId
│   └─ setProjectId
│
└─ createIDESelectorsSlice
    ├─ selectForAIContext, selectFileContext
    └─ _hasHydrated
```

### Persistence Configuration (useIDEStore)

```typescript
persist(
  (set, get, api) => ({
    ...createIDEEditorSlice(...),
    ...createIDEExplorerSlice(...),
    ...createIDELayoutSlice(...),
    ...createIDETerminalSlice(...),
    ...createIDEProjectSlice(...),
    ...createIDESelectorsSlice(...),
  }),
  {
    name: 'ide-state',
    storage: createJSONStorage(createIDEStateStorage),
    partialize: (state) => ({
      projectId: state.projectId,
      openFiles: state.openFiles,
      activeFile: state.activeFile,
      expandedPaths: Array.from(state.expandedPaths),
      panelLayouts: state.panelLayouts,
      chatVisible: state.chatVisible,
      terminalTab: state.terminalTab,
    }),
    merge: (persisted, current) => ({
      ...current,
      ...persistedState,
      expandedPaths: new Set(expandedPathsArray),
    }),
  }
)
```

---

## 4. WebContainer Operations Table

| Operation | Function | Location | Notes |
|-----------|----------|----------|-------|
| **Boot** | `boot(options?)` | `lib/webcontainer/manager.ts:65-118` | Singleton pattern, emits `container:booted` event |
| **Mount** | `mount(files, mountPoint?)` | `lib/webcontainer/manager.ts:139-170` | FileSystemTree API, emits `container:mounted` |
| **Spawn** | `spawn(command, args, options?)` | `lib/webcontainer/manager.ts:218-240` | Returns WebContainerProcess |
| **Get Instance** | `getInstance()` | `lib/webcontainer/manager.ts:248-250` | Returns singleton or null |
| **Is Booted** | `isBooted()` | `lib/webcontainer/manager.ts:257-259` | Boolean check |
| **Server Ready** | `onServerReady(callback)` | `lib/webcontainer/manager.ts:280-292` | Subscribe to dev server events |
| **Set EventBus** | `setEventBus(bus)` | `lib/webcontainer/manager.ts:47-49` | Configure lifecycle event emission |

### WebContainer Lifecycle

```
1. boot() called
   └─ If instance exists → return existing
   └─ If bootPromise exists → return same promise
   └─ Otherwise → WebContainer.boot() → emit 'container:booted'

2. mount(files) called
   └─ Requires booted instance
   └─ instance.mount(files) → emit 'container:mounted'

3. spawn(command, args) called
   └─ Requires booted instance
   └─ Returns process with .output, .exit streams

4. onServerReady(callback)
   └─ Subscribes to 'server-ready' event
   └─ Returns unsubscribe function
```

### WebContainer Singleton Pattern

```typescript
// lib/webcontainer/manager.ts:35-38
let instance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;
let eventBus: WorkspaceEventEmitter | null = null;

export async function boot(options?: WebContainerManagerOptions): Promise<WebContainer> {
  if (instance) return instance;  // Return existing
  if (bootPromise) return bootPromise;  // Avoid double boot
  // ... boot logic
}
```

### Terminal Integration (XTerminal)

```
XTerminal.tsx
├─ useEffect (init terminal UI)
│   ├─ new Terminal() from @xterm/xterm
│   ├─ FitAddon for auto-sizing
│   └─ createTerminalAdapter()
│
├─ useEffect (theme change)
│   └─ Update terminal options.theme
│
└─ useEffect (start shell)
    ├─ If initialSyncCompleted → boot() → adapter.startShell()
    ├─ If syncError → boot() with warning → adapter.startShell()
    └─ After syncTimeout → boot() with warning → adapter.startShell()
```

---

## 5. Database Operations Table

### Dexie Database Schema (ViaGentDatabase)

| Table | KeyPath | Indexes | description |
|-------|---------|---------|---------|
| **projects** | `id` | `lastOpened`, `name` | Project metadata |
| **ideState** | `projectId` | - | IDE layout state persistence |
| **syncStatus** | `id` | `path`, `syncStatus` | File sync status tracking |
| **fileMetadata** | `id` | `[projectId+path]`, `projectId`, `lastModified` | File metadata cache |
| **toolExecutionLogs** | `id` | `conversationId`, `timestamp` | AI tool execution history |
| **fsaHandles** | `projectId` | `permissionStatus` | FSA handle persistence |
| **sessionSnapshots** | `id` | `[projectId+createdAt]`, `projectId` | Session restore snapshots |
| **threads** | `id` | `projectId`, `updatedAt` | Conversation threads |

### Key Database Helper Functions

| Function | Location | description |
|----------|----------|---------|
| `getDb()` | `dexie-db.ts:249-264` | Get singleton database instance |
| `getIDEState(projectId)` | `dexie-db.ts:295-297` | Get persisted IDE state |
| `saveIDEState(state)` | `dexie-db.ts:302-307` | Persist IDE state |
| `getFileMetadata(projectId, path)` | `dexie-db.ts:450-458` | Get single file metadata |
| `upsertFileMetadata(record)` | `dexie-db.ts:472-483` | Insert/update file metadata |
| `bulkUpsertFileMetadata(records)` | `dexie-db.ts:488-499` | Batch update file metadata |
| `getFilesNeedingSync(projectId)` | `dexie-db.ts:524-527` | Find files needing sync |
| `storeFSAHandle(record)` | `dexie-db.ts:627-638` | Persist FSA handle |
| `getFSAHandle(projectId)` | `dexie-db.ts:643-647` | Retrieve FSA handle |
| `saveSessionSnapshot(record)` | `dexie-db.ts:707-718` | Save session for restore |
| `getLatestSessionSnapshot(projectId)` | `dexie-db.ts:723-740` | Get most recent session |

### Dexie Recovery (CRITICAL-FIX-2026-01-07)

```typescript
// dexie-db.ts:254-261
if (!dbOpenPromise) {
  dbOpenPromise = initializeDatabaseWithRecovery(async () => {
    await dbInstance!.open();
    return dbInstance!;
  });
}

// Handles schema migration failures (primary key changes)
```

---

## 6. Internal Issues Found Table

| ID | Severity | Location | Issue | Status |
|----|----------|----------|-------|--------|
| **ISSUE-001** | HIGH | `src/routes/ide.tsx:69-74` | PHASE 1 DETACHMENT: useWorkspaceAccess bypassed - causes infinite loops | Workaround in place, Phase 2 fix planned |
| **ISSUE-002** | MEDIUM | `src/routes/ide.$projectId.tsx:59-64` | IDE store setProjectId uses getState() pattern to avoid infinite loop | Documented pattern |
| **ISSUE-003** | MEDIUM | `src/presentation/components/layout/IDELayoutMain.tsx:156-158` | Cross-workspace events TEMPORARILY DISABLED - causes infinite loop | Disabled 2026-01-08 |
| **ISSUE-004** | MEDIUM | `src/presentation/components/layout/IDELayoutMain.tsx:255-258` | SyncStatusPanel TEMPORARILY DISABLED | Disabled 2026-01-08 |
| **ISSUE-005** | LOW | `src/presentation/components/ide/XTerminal.tsx:255` | Shell timeout defaults to 30s - may be too short for large projects | Configurable |
| **ISSUE-006** | INFO | `src/infrastructure/persistence/stores/ide/useIDEStore.ts:23-26` | Custom IDE state storage adapter required (generic createDexieStorage incompatible) | Fixed 2026-01-06 |
| **ISSUE-007** | INFO | `src/lib/workspace/ProjectContext.tsx:227-232` | Handles both 'bindings' and 'workspaceBindings' property names for backward compatibility | Duplicated handling |
| **ISSUE-008** | INFO | `src/infrastructure/persistence/stores/project/useProjectStore.ts:49-52` | FIX-2026-01-06: Removed localStorage persist - Dexie is single source of truth | Fixed |

### Known Infinite Loop Patterns

1. **useWorkspaceAccess** - Causes infinite loops when checking workspace access status
   - Workaround: Direct project handling in route, bypass useWorkspaceAccess
   - Phase 2: Re-attach with proper gating (GATE-R3)

2. **Cross-workspace events** - useAllCrossWorkspaceEvents causes infinite loop via useAgentsStore.getState()
   - Workaround: Disabled until fix
   - Impact: IDE doesn't react to Notes/Knowledge/Study changes

3. **SyncStatusPanel** - Causes infinite loop
   - Workaround: Disabled
   - Impact: No sync status panel overlay

---

## 7. Dependencies on Other Features Table

| Dependency | Type | Location | description | Status |
|------------|------|----------|---------|--------|
| **WebContainer API** | External | `@webcontainer/api` | Browser-based Node.js runtime | ✅ Required |
| **Monaco Editor** | External | `@monaco-editor/react` | Code editor | ✅ Required |
| **xterm.js** | External | `@xterm/xterm` | Terminal emulator | ✅ Required |
| **Dexie.js** | External | `dexie` | IndexedDB wrapper | ✅ Required |
| **TanStack Router** | External | `@tanstack/router` | File-based routing | ✅ Required |
| **Zustand** | External | `zustand` | State management | ✅ Required |
| **react-resizable-panels** | External | `react-resizable-panels` | Panel layout | ✅ Required |
| **File System Access API** | Browser API | Native | Local file system access | ✅ Required |
| **IndexedDB** | Browser API | Native | Persistent storage | ✅ Required |
| **SharedArrayBuffer** | Browser API | Native | WebContainer requirement | ⚠️ Requires COOP/COEP headers |
| **Agent Config Store** | Internal | `infrastructure/persistence/stores/agents/` | Agent configuration | ✅ Indirect (chat uses) |
| **Provider Store** | Internal | `infrastructure/persistence/stores/providers/` | LLM providers | ✅ Indirect (chat uses) |
| **Project Store** | Internal | `infrastructure/persistence/stores/project/` | Project metadata | ✅ Direct |
| **Workspace Context** | Internal | `infrastructure/persistence/stores/workspace/` | FSA adapter, sync manager | ✅ Direct |
| **File Sync Manager** | Internal | `lib/filesystem/sync-manager.ts` | Local ↔ WebContainer sync | ✅ Direct |
| **Event Bus** | Internal | `lib/events/` | Cross-component communication | ✅ Required |

### Critical Dependencies

**WebContainer Requirements**:
```typescript
// vite.config.ts must have crossOriginIsolationPlugin FIRST
res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
```

**File System Access API**:
```typescript
// Permission states: 'granted' | 'prompt' | 'denied'
// Stored in fsaHandles table for persistence
```

### Import Dependencies in Key Files

**src/presentation/components/layout/IDELayoutMain.tsx imports**:
- `@/presentation/components/layout/*` - Layout components
- `@/presentation/components/ide/*` - IDE components
- `@/presentation/components/ui/*` - UI primitives
- `@/infrastructure/persistence/stores/ide` - IDE store
- `@/lib/webcontainer` - WebContainer API
- `@/lib/events` - Event bus
- `@/hooks/useResponsive` - Responsive detection

---

## 8. User Flows

### Flow 1: Open Project

```
1. User navigates to /ide
   └─ IDEWorkspace component renders
   
2. User clicks "Select Project Folder"
   └─ FolderPickerDialog opens
   
3. User selects directory via FSA API
   └─ DirectoryHandle obtained
   
4. Project created in Dexie (projects table)
   └─ ProjectProvider wraps IDELayout
   
5. IDELayout mounts
   └─ useIDEStore.setProjectId(projectId)
   
6. WebContainer boot triggered (useWebContainerBoot hook)
   └─ boot() → emit 'container:booted'
   
7. File sync initiated (useIDEFileHandlers hook)
   └─ localAdapter.readDirectory() → mount() to WebContainer
```

### Flow 2: Create/Edit File

```
1. User clicks file in FileTree
   └─ FileTree calls onFileSelect(path, handle)
   
2. MonacoEditor receives openFiles update
   └─ New tab added with file content
   
3. User edits code in Monaco editor
   └─ handleEditorChange() triggers onContentChange()
   
4. Debounced auto-save (2000ms)
   └─ onSave(path, content) → localAdapter.writeFile()
   
5. Sync status updated (useFileSyncStatusStore)
   └─ setFileSyncPending() → setFileSyncSynced()
   
6. IDE state persisted (useIDEStore)
   └─ Debounced 250ms → saveIDEState() to Dexie
```

### Flow 3: Run Terminal Commands

```
1. User opens terminal panel
   └─ IDETerminalPanel renders XTerminal
   
2. XTerminal initializes (useEffect)
   └─ new Terminal() + FitAddon
   
3. Shell starts (useEffect)
   └─ boot() → adapter.startShell()
   
4. User types command
   └─ Terminal input → adapter.write()
   
5. Command spawns in WebContainer
   └─ spawn(command, args) → WebContainerProcess
   
6. Output streams to terminal
   └─ process.output.pipeTo() → terminal.write()
```

### Flow 4: Use AI Chat

```
1. User opens chat panel
   └─ IDEChatPanel renders AgentChatPanel
   
2. User sends message
   └─ useAgentChatWithTools() creates conversation
   
3. Agent reasoning (optional)
   └─ Deep think hook triggers
   
4. Agent requests tool execution
   └─ Tool permission check → Approval UI
   
5. Tool executes
   └─ FileTools.readFile() / FileTools.writeFile()
   
6. Tool output returned to agent
   └─ Stream continues
   
7. Agent response displayed
   └─ StreamingMessage renders with markdown
```

---

## Summary

### Architecture Strengths
- ✅ Clean slice pattern for Zustand stores (each <120 lines)
- ✅ WebContainer singleton pattern prevents duplicate boots
- ✅ Dexie IndexedDB for persistence with recovery handling
- ✅ React Context for cross-workspace state (ProjectProvider)
- ✅ Lazy-loaded heavy components (Monaco, IDELayout)
- ✅ Event-driven architecture for component communication

### Architecture Weaknesses
- ⚠️ Cross-workspace event system disabled (infinite loop risk)
- ⚠️ useWorkspaceAccess bypassed (needs Phase 2 fix)
- ⚠️ Duplicate property handling for bindings/workspaceBindings
- ⚠️ Custom storage adapter required for IDE state (generic incompatible)

### Key Files Reference
| Category | Key Files |
|----------|-----------|
| Routes | `src/routes/ide.tsx`, `src/routes/ide.$projectId.tsx` |
| Layout | `src/presentation/components/layout/IDELayoutMain.tsx` |
| Editor | `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` |
| Terminal | `src/presentation/components/ide/XTerminal.tsx` |
| File Tree | `src/presentation/components/ide/FileTree/FileTree.tsx` |
| Stores | `infrastructure/persistence/stores/ide/useIDEStore.ts` |
| WebContainer | `lib/webcontainer/manager.ts` |
| Database | `infrastructure/persistence/dexie-db.ts` |
| Context | `lib/workspace/ProjectContext.tsx` |
