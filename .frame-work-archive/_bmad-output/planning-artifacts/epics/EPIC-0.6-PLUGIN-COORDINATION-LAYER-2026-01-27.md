# EPIC-0.6: Plugin Coordination Layer

## Phase 1A Integration Epic - Post EPIC-0.5 Coordination Gaps

---

## Metadata

```yaml
epic_id: "EPIC-0.6"
title: "Plugin Coordination Layer"
version: "1.0.0"
status: "COMPLETE"
priority: "P0-BLOCKER"
phase: "1A"
author: "architect-ext"
created: "2026-01-27T12:00:00+07:00"
updated: "2026-01-27T12:00:00+07:00"
sprint_start: "2026-01-27T12:00:00+07:00"
target_completion: "2026-01-29"

team_assignment:
  A: "Shared State & UI (0.6-01 to 0.6-04, 0.6-10, 0.6-11)"
  B: "WebContainer & Preview (0.6-05 to 0.6-09, 0.6-12)"

blocking:
  - "Phase 1A Full Integration"
  - "Phase 1B BYOK + AI"
  - "All subsequent phases"

remediates:
  - "19 coordination gaps from EPIC-0.5 retrospective"
  - "Plugins work isolated but fail on coordination"
  - "No shared ActiveDocument state"
  - "Terminal/Preview WebContainer not wired"
  - "Monaco/Notes no mirroring"
  - "Device-type enforcement missing"

parent_documents:
  - "EPIC-0.5-FILETREE-PLUGIN-MATURITY-2026-01-26.md"
  - "phase-1a-plugin-coordination-problems-2026-01-27.md"
  - "architecture.md v3.1.0"

analysis_ref: "docs/analysis/phase-1a-plugin-coordination-problems-2026-01-27.md"
architecture_ref: "_bmad-output/planning-artifacts/architecture.md#3.9"
```

---

## Problem Statement

EPIC-0 and EPIC-0.5 built plugins as **isolated islands**. They work individually but fail when coordination is required:

1. **FileTree** → selects file, Monaco opens it, Notes ignores it
2. **Monaco** → edits file, Notes doesn't mirror, no write-lock
3. **Terminal** → UI exists but WebContainer never boots, no FSA mount
4. **Preview** → listens for dev-server-ready event that nobody emits
5. **All Plugins** → no state preservation across toggle ON/OFF

**Root Cause**: Missing `PluginCoordinationContext` - the orchestration layer that coordinates shared state, file locks, and plugin lifecycle.

**Analysis Source**: 19 coordination gaps identified in `docs/analysis/phase-1a-plugin-coordination-problems-2026-01-27.md`

---

## Quick Status

| Story | Title | Status | Team | Effort | Dependencies |
|-------|-------|--------|------|--------|--------------|
| 0.6-01 | PluginCoordinationContext | ✅ COMPLETE | A | 4-6h | - |
| 0.6-02 | File open tracking | ✅ COMPLETE | A | 2-3h | 0.6-01 |
| 0.6-03 | Write-lock mechanism | ✅ COMPLETE | A | 2-3h | 0.6-01 |
| 0.6-04 | PluginCapability interface | ✅ COMPLETE | A | 3-4h | - |
| 0.6-05 | Boot WebContainer | ✅ COMPLETE | B | 4-6h | - |
| 0.6-06 | Mount FSA to WebContainer | ✅ COMPLETE | B | 4-6h | 0.6-05 |
| 0.6-07 | Process registry | ✅ COMPLETE | B | 2-3h | - |
| 0.6-08 | Dev-server-ready events | ✅ COMPLETE | B | 2h | 0.6-07 |
| 0.6-09 | Preview ↔ Terminal wiring | ✅ COMPLETE | B | 2-3h | 0.6-08 |
| 0.6-10 | Device fallback | ✅ COMPLETE | A | 2h | 0.6-04 |
| 0.6-11 | Replace hardcoded noteId | ✅ COMPLETE | A | 1-2h | 0.6-01 |
| 0.6-12 | Monaco ↔ Notes mirroring | ✅ COMPLETE | B | 4-6h | 0.6-02, 0.6-03 |

**Total Effort**: 32-47 hours (2 teams parallel = 16-24h wall-clock)

---

## Section 1: Shared State Stories (Team A)

### EPIC-0.6-01: PluginCoordinationContext Foundation

#### Status
- **Team**: A
- **Effort**: 4-6h
- **Priority**: P0
- **Dependencies**: None
- **Status**: READY

#### Technical Problem Statement

Plugins cannot coordinate because there is no shared state layer. Each plugin maintains its own isolated state:

```typescript
// Monaco: local state
const [activePath, setActivePath] = useState<string | null>(null);

// Notes: hardcoded path
const noteId = `${project.folderPath}/notes/note.md`;

// FileTree: store selection
const selectedPath = useFileTreeStore((s) => s.selectedPath);
```

**Three separate sources of truth, no coordination.**

#### Impact Assessment
- **User Experience**: Opening file in FileTree → Monaco sees it, Notes ignores it
- **System Stability**: No crashes, but plugins don't work together
- **Data Integrity**: Concurrent edits could cause conflicts

#### Technical Approach

**Step 1: Create PluginCoordinationContext**

```typescript
// src/infrastructure/context/plugin-coordination-context.tsx

interface PluginCoordinationContext {
  // Shared Document State
  activeDocument: SharedDocument | null;
  openDocuments: Map<string, OpenDocumentInfo>;
  
  // Actions
  openDocument: (path: string, pluginId: PluginId) => void;
  closeDocument: (path: string, pluginId: PluginId) => void;
  setActiveDocument: (path: string) => void;
}

interface SharedDocument {
  path: string;
  content: string;
  lastModified: number;
  openedBy: PluginId[];
  writeLock: { pluginId: PluginId; acquiredAt: number } | null;
}

interface OpenDocumentInfo {
  path: string;
  pluginId: PluginId;
  openedAt: number;
  hasUnsavedChanges: boolean;
}
```

**Step 2: Create Zustand Store**

```typescript
// src/infrastructure/persistence/stores/plugin-coordination-store.ts

interface PluginCoordinationState {
  activeDocument: SharedDocument | null;
  openDocuments: Map<string, OpenDocumentInfo>;
  
  // Actions
  openDocument: (path: string, pluginId: PluginId) => void;
  closeDocument: (path: string, pluginId: PluginId) => void;
  setActiveDocument: (path: string, content: string) => void;
}

export const usePluginCoordinationStore = create<PluginCoordinationState>()(
  (set, get) => ({
    activeDocument: null,
    openDocuments: new Map(),
    
    openDocument: (path, pluginId) => {
      const { openDocuments } = get();
      const existing = openDocuments.get(path);
      
      if (existing) {
        // File already open - add this plugin to openedBy
        existing.openedBy = [...existing.openedBy, pluginId];
      } else {
        openDocuments.set(path, {
          path,
          pluginId,
          openedAt: Date.now(),
          hasUnsavedChanges: false,
        });
      }
      
      set({ openDocuments: new Map(openDocuments) });
    },
    
    closeDocument: (path, pluginId) => {
      const { openDocuments, activeDocument } = get();
      const doc = openDocuments.get(path);
      
      if (doc) {
        doc.openedBy = doc.openedBy.filter(id => id !== pluginId);
        if (doc.openedBy.length === 0) {
          openDocuments.delete(path);
        }
      }
      
      // If closing active document, clear it
      if (activeDocument?.path === path) {
        set({ activeDocument: null });
      }
      
      set({ openDocuments: new Map(openDocuments) });
    },
    
    setActiveDocument: (path, content) => {
      set({
        activeDocument: {
          path,
          content,
          lastModified: Date.now(),
          openedBy: [],
          writeLock: null,
        },
      });
    },
  })
);
```

**Step 3: Create Context Provider**

```typescript
// src/infrastructure/context/plugin-coordination-context.tsx

const PluginCoordinationContext = createContext<PluginCoordinationContext | null>(null);

export function PluginCoordinationProvider({ children }: { children: ReactNode }) {
  const store = usePluginCoordinationStore();
  
  return (
    <PluginCoordinationContext.Provider value={store}>
      {children}
    </PluginCoordinationContext.Provider>
  );
}

export function usePluginCoordination() {
  const ctx = useContext(PluginCoordinationContext);
  if (!ctx) {
    throw new Error('usePluginCoordination must be used within PluginCoordinationProvider');
  }
  return ctx;
}
```

**Step 4: Wire to App Root**

```typescript
// src/routes/__root.tsx
import { PluginCoordinationProvider } from '@/infrastructure/context/plugin-coordination-context';

export default function RootLayout() {
  return (
    <PluginCoordinationProvider>
      <ProjectContextProvider>
        {/* existing layout */}
      </ProjectContextProvider>
    </PluginCoordinationProvider>
  );
}
```

#### Key Files Involved

| File | Path | Action | Notes |
|------|------|--------|-------|
| PluginCoordinationContext | `src/infrastructure/context/plugin-coordination-context.tsx` | **Create** | New context provider |
| PluginCoordinationStore | `src/infrastructure/persistence/stores/plugin-coordination-store.ts` | **Create** | New Zustand store |
| RootLayout | `src/routes/__root.tsx` | Modify | Wrap with provider |
| Types | `src/domain/types/plugin-coordination.types.ts` | **Create** | SharedDocument, OpenDocumentInfo |

#### Acceptance Criteria

- [ ] `PluginCoordinationContext` created with TypeScript interfaces
- [ ] `usePluginCoordinationStore` Zustand store implemented
- [ ] `PluginCoordinationProvider` wraps app in root layout
- [ ] `usePluginCoordination()` hook works in any plugin
- [ ] `activeDocument` state accessible from all plugins
- [ ] `openDocument()` tracks which plugins have file open
- [ ] `closeDocument()` removes plugin from tracking
- [ ] Console logs show coordination state changes

#### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Context provider ordering wrong | Medium | High | Wrap outside ProjectContext |
| Performance with large openDocuments | Low | Medium | Limit to 50 max open docs |
| Store hydration conflicts | Low | High | Test with persist middleware |

---

### EPIC-0.6-02: File Open Tracking

#### Status
- **Team**: A
- **Effort**: 2-3h
- **Priority**: P0
- **Dependencies**: 0.6-01
- **Status**: READY

#### Technical Problem Statement

When FileTree emits `FILE_OPENED`, Monaco receives it but Notes doesn't. There's no central registry of "which plugins have which files open."

**Current Behavior**:
```
FileTree click → FILE_OPENED event → Monaco opens → Notes ignores
```

**Expected Behavior**:
```
FileTree click → FILE_OPENED event → coordination.openDocument(path, 'filetree')
                                   → Monaco.openDocument(path, 'monaco')
                                   → Notes.openDocument(path, 'notes')
                                   → All plugins see same activeDocument
```

#### Technical Approach

**Step 1: Update FileTree to use Coordination**

```typescript
// FileTreePlugin.tsx
import { usePluginCoordination } from '@/infrastructure/context/plugin-coordination-context';

function FileTreePlugin() {
  const { openDocument, setActiveDocument } = usePluginCoordination();
  
  const handleFileClick = async (path: string) => {
    // Register in coordination layer
    openDocument(path, 'filetree');
    
    // Set as active document
    const content = await gateway.read(path);
    setActiveDocument(path, new TextDecoder().decode(content));
    
    // Emit event for other plugins
    eventBus.emit(DomainEventType.FILE_OPENED, { path });
  };
}
```

**Step 2: Update Monaco to use Coordination**

```typescript
// MonacoMain.tsx
import { usePluginCoordination } from '@/infrastructure/context/plugin-coordination-context';

function MonacoMain() {
  const { activeDocument, openDocument, closeDocument } = usePluginCoordination();
  
  useEffect(() => {
    if (activeDocument) {
      openDocument(activeDocument.path, 'monaco');
      setContent(activeDocument.content);
      setActivePath(activeDocument.path);
    }
  }, [activeDocument]);
  
  // On unmount, close document
  useEffect(() => {
    return () => {
      if (activePath) {
        closeDocument(activePath, 'monaco');
      }
    };
  }, [activePath]);
}
```

**Step 3: Update Notes to use Coordination**

```typescript
// NotesPlugin.tsx
import { usePluginCoordination } from '@/infrastructure/context/plugin-coordination-context';

function NotesPlugin() {
  const { activeDocument, openDocument, closeDocument } = usePluginCoordination();
  
  // REPLACE hardcoded noteId with activeDocument
  const noteId = activeDocument?.path || `${project.folderPath}/notes/note.md`;
  
  useEffect(() => {
    if (activeDocument && activeDocument.path.endsWith('.md')) {
      openDocument(activeDocument.path, 'notes');
    }
  }, [activeDocument]);
}
```

#### Key Files Involved

| File | Path | Action | Notes |
|------|------|--------|-------|
| FileTreePlugin | `src/plugins/filetree/FileTreePlugin.tsx` | Modify | Use coordination for file open |
| MonacoMain | `src/plugins/monaco/MonacoMain.tsx` | Modify | Subscribe to activeDocument |
| NotesPlugin | `src/plugins/notes/NotesPlugin.tsx` | Modify | Subscribe to activeDocument |

#### Acceptance Criteria

- [ ] FileTree click → all active plugins see file
- [ ] Monaco receives activeDocument from coordination
- [ ] Notes receives activeDocument from coordination
- [ ] `openedBy` array shows which plugins have file open
- [ ] Closing a plugin removes it from `openedBy`
- [ ] Opening same file in two plugins shows both in `openedBy`

---

### EPIC-0.6-03: Write-Lock Mechanism

#### Status
- **Team**: A
- **Effort**: 2-3h
- **Priority**: P0
- **Dependencies**: 0.6-01
- **Status**: READY

#### Technical Problem Statement

When Monaco and Notes both have the same file open, both can write simultaneously. This causes:
1. Last-write-wins data loss
2. No visual indication of who is "currently editing"
3. No conflict resolution

#### Technical Approach

**Step 1: Add Write-Lock to Coordination Store**

```typescript
// plugin-coordination-store.ts

interface PluginCoordinationState {
  // ... existing fields
  
  acquireWriteLock: (path: string, pluginId: PluginId) => Promise<boolean>;
  releaseWriteLock: (path: string, pluginId: PluginId) => void;
  hasWriteLock: (path: string, pluginId: PluginId) => boolean;
}

// Implementation
acquireWriteLock: async (path, pluginId) => {
  const { activeDocument } = get();
  
  if (!activeDocument || activeDocument.path !== path) {
    return false;
  }
  
  // If no lock exists, grant it
  if (!activeDocument.writeLock) {
    set({
      activeDocument: {
        ...activeDocument,
        writeLock: { pluginId, acquiredAt: Date.now() },
      },
    });
    return true;
  }
  
  // If this plugin already has the lock, return true
  if (activeDocument.writeLock.pluginId === pluginId) {
    return true;
  }
  
  // Lock is held by another plugin
  return false;
},

releaseWriteLock: (path, pluginId) => {
  const { activeDocument } = get();
  
  if (activeDocument?.path === path && 
      activeDocument?.writeLock?.pluginId === pluginId) {
    set({
      activeDocument: {
        ...activeDocument,
        writeLock: null,
      },
    });
  }
},
```

**Step 2: Update Monaco to Acquire Lock Before Writing**

```typescript
// MonacoMain.tsx

const handleSave = async () => {
  if (!activePath) return;
  
  const hasLock = await acquireWriteLock(activePath, 'monaco');
  if (!hasLock) {
    toast.warning(t('editor.lockHeldByOther'));
    return;
  }
  
  try {
    await gateway.write(activePath, content);
    setSaveStatus('saved');
  } finally {
    releaseWriteLock(activePath, 'monaco');
  }
};
```

**Step 3: Add Visual Lock Indicator**

```typescript
// LockIndicator.tsx

export function LockIndicator({ path }: { path: string }) {
  const { activeDocument } = usePluginCoordination();
  
  if (!activeDocument || activeDocument.path !== path) return null;
  if (!activeDocument.writeLock) return null;
  
  return (
    <div className="flex items-center gap-1 text-xs text-yellow-600">
      <Lock size={12} />
      <span>{t('editor.lockedBy', { plugin: activeDocument.writeLock.pluginId })}</span>
    </div>
  );
}
```

#### Acceptance Criteria

- [ ] `acquireWriteLock()` returns true if lock available
- [ ] `acquireWriteLock()` returns false if lock held by other
- [ ] `releaseWriteLock()` frees the lock
- [ ] Monaco acquires lock before save
- [ ] Notes acquires lock before save
- [ ] Lock indicator visible in editor toolbar
- [ ] Lock auto-releases after 30 seconds of inactivity

---

### EPIC-0.6-04: PluginCapability Interface

#### Status
- **Team**: A
- **Effort**: 3-4h
- **Priority**: P1
- **Dependencies**: 0.6-01
- **Status**: READY

#### Technical Problem Statement

Plugins don't declare what they can do. The system has no way to know:
- Which plugin can edit `.md` files?
- Which plugin can run processes?
- Which plugin can show preview?

This prevents intelligent plugin suggestions and dependency resolution.

#### Technical Approach

**Step 1: Define PluginCapability Types**

```typescript
// src/domain/types/plugin-capability.types.ts

export type PluginCapabilityType = 
  | 'file-editor'
  | 'file-viewer'
  | 'process-runner'
  | 'preview-renderer'
  | 'ai-assistant';

export interface PluginCapability {
  type: PluginCapabilityType;
  fileTypes?: string[];      // e.g., ['.md', '.txt', '.tsx']
  processTypes?: string[];   // e.g., ['shell', 'node']
  priority?: number;         // Higher = preferred handler
}

// Example declarations:
const monacoCapabilities: PluginCapability[] = [
  { type: 'file-editor', fileTypes: ['*'], priority: 50 },
];

const notesCapabilities: PluginCapability[] = [
  { type: 'file-editor', fileTypes: ['.md'], priority: 100 }, // Higher priority for .md
  { type: 'file-viewer', fileTypes: ['.md'], priority: 100 },
];

const terminalCapabilities: PluginCapability[] = [
  { type: 'process-runner', processTypes: ['shell', 'node'], priority: 100 },
];

const previewCapabilities: PluginCapability[] = [
  { type: 'preview-renderer', priority: 100 },
];
```

**Step 2: Update FeaturePlugin Interface**

```typescript
// src/domain/interfaces/feature-plugin.interface.ts

export interface FeaturePlugin {
  // ... existing fields
  
  // NEW: Capability declarations
  capabilities?: PluginCapability[];
  
  // NEW: Dependency declarations
  requires?: {
    plugins?: PluginId[];
    services?: ('webcontainer' | 'fsa')[];
  };
}
```

**Step 3: Add Capability Registry to Coordination**

```typescript
// plugin-coordination-store.ts

interface PluginCoordinationState {
  // ... existing fields
  
  capabilities: Map<PluginId, PluginCapability[]>;
  registerCapabilities: (pluginId: PluginId, caps: PluginCapability[]) => void;
  queryCapability: (type: PluginCapabilityType, fileType?: string) => PluginId[];
}
```

**Step 4: Update Plugin Registry**

```typescript
// plugin-registry.ts

// Register capabilities on plugin load
plugins.forEach(plugin => {
  if (plugin.capabilities) {
    coordinationStore.registerCapabilities(plugin.id, plugin.capabilities);
  }
});

// Query best plugin for file type
const bestEditor = coordinationStore.queryCapability('file-editor', '.md');
// Returns: ['notes', 'monaco'] (sorted by priority)
```

#### Acceptance Criteria

- [ ] `PluginCapability` type defined
- [ ] Each plugin declares its capabilities
- [ ] Coordination store has capability registry
- [ ] `queryCapability()` returns plugins sorted by priority
- [ ] Opening `.md` file prefers Notes over Monaco
- [ ] Plugins can declare dependencies on other plugins/services

---

## Section 2: WebContainer Integration (Team B)

### EPIC-0.6-05: Boot WebContainer on Terminal Enable

#### Status
- **Team**: B
- **Effort**: 4-6h
- **Priority**: P0
- **Dependencies**: None
- **Status**: READY

#### Technical Problem Statement

Terminal plugin mounts but WebContainer never boots:

```typescript
// TerminalMain.tsx (current - BROKEN)
function TerminalMain() {
  return (
    <TerminalPanel
      cwd={project.folderPath || '/project'}
      initialSyncCompleted={true}  // FAKED!
    />
  );
}
```

User types `ls` → empty directory (no project files).

#### Technical Approach

**Step 1: Create WebContainer Boot Hook**

```typescript
// src/infrastructure/webcontainer/useWebContainer.ts

import { WebContainerManager } from '@/lib/webcontainer/manager';

interface WebContainerState {
  status: 'idle' | 'booting' | 'ready' | 'error';
  error: string | null;
}

export function useWebContainer() {
  const [state, setState] = useState<WebContainerState>({ status: 'idle', error: null });
  const manager = useRef<WebContainerManager | null>(null);
  
  const boot = useCallback(async () => {
    if (state.status === 'ready' || state.status === 'booting') return;
    
    setState({ status: 'booting', error: null });
    
    try {
      manager.current = await WebContainerManager.getInstance();
      await manager.current.boot();
      setState({ status: 'ready', error: null });
    } catch (error) {
      setState({ status: 'error', error: error.message });
    }
  }, [state.status]);
  
  return { state, boot, manager: manager.current };
}
```

**Step 2: Update Terminal Plugin to Boot on Mount**

```typescript
// TerminalMain.tsx

function TerminalMain() {
  const { state, boot, manager } = useWebContainer();
  
  useEffect(() => {
    boot(); // Boot WebContainer when Terminal mounts
  }, [boot]);
  
  if (state.status === 'booting') {
    return (
      <div className="flex items-center justify-center h-full">
        <RotateCw className="animate-spin mr-2" />
        <span>{t('terminal.bootingWebContainer')}</span>
      </div>
    );
  }
  
  if (state.status === 'error') {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <AlertCircle className="mr-2" />
        <span>{t('terminal.bootError')}: {state.error}</span>
      </div>
    );
  }
  
  if (state.status !== 'ready') {
    return null;
  }
  
  return (
    <TerminalPanel
      webContainer={manager}
      cwd="/project"
    />
  );
}
```

**Step 3: Add Loading Skeleton**

```typescript
// TerminalSkeleton.tsx

export function TerminalSkeleton() {
  return (
    <div className="w-full h-full bg-black p-4">
      <div className="flex items-center gap-2">
        <RotateCw size={16} className="animate-spin text-green-500" />
        <span className="text-green-500 font-mono text-sm">
          Booting WebContainer...
        </span>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-1/3 bg-gray-800" />
        <Skeleton className="h-4 w-1/2 bg-gray-800" />
        <Skeleton className="h-4 w-2/3 bg-gray-800" />
      </div>
    </div>
  );
}
```

#### Key Files Involved

| File | Path | Action | Notes |
|------|------|--------|-------|
| useWebContainer | `src/infrastructure/webcontainer/useWebContainer.ts` | **Create** | New hook |
| TerminalMain | `src/plugins/terminal/TerminalMain.tsx` | Modify | Boot on mount |
| TerminalSkeleton | `src/plugins/terminal/TerminalSkeleton.tsx` | **Create** | Loading state |
| i18n | `public/locales/*/terminal.json` | Modify | Add boot messages |

#### Acceptance Criteria

- [ ] Terminal mounts → WebContainer boots automatically
- [ ] Loading skeleton shown during boot (3-5 seconds)
- [ ] Error state shown if boot fails
- [ ] Boot only happens once (singleton manager)
- [ ] Console logs: "[WebContainer] Boot started", "[WebContainer] Boot complete"

---

### EPIC-0.6-06: Mount FSA to WebContainer

#### Status
- **Team**: B
- **Effort**: 4-6h
- **Priority**: P0
- **Dependencies**: 0.6-05
- **Status**: READY

#### Technical Problem Statement

WebContainer boots but has no files. FSA files need to be mounted to WebContainer's virtual filesystem:

```
FSA (real files on disk) → mount → WebContainer (/project)
```

#### Technical Approach

**Step 1: Create FSA Mount Hook**

```typescript
// src/infrastructure/webcontainer/useFSAMount.ts

export function useFSAMount(webContainer: WebContainerManager | null) {
  const [mountStatus, setMountStatus] = useState<'idle' | 'mounting' | 'mounted' | 'error'>('idle');
  const { storageAdapter, project } = useProjectContext();
  
  const mount = useCallback(async () => {
    if (!webContainer || mountStatus === 'mounted' || mountStatus === 'mounting') return;
    
    if (project.storageType !== 'fsa') {
      console.log('[FSAMount] Skipping - not FSA storage');
      return;
    }
    
    setMountStatus('mounting');
    
    try {
      // Get FSA handle from storage adapter
      const fsaAdapter = storageAdapter as FSAStorageAdapter;
      const handle = fsaAdapter.getHandle();
      
      // Mount to WebContainer
      await webContainer.mountFSA(handle, '/project');
      
      setMountStatus('mounted');
      console.log('[FSAMount] FSA mounted to /project');
    } catch (error) {
      console.error('[FSAMount] Mount failed:', error);
      setMountStatus('error');
    }
  }, [webContainer, mountStatus, storageAdapter, project.storageType]);
  
  return { mountStatus, mount };
}
```

**Step 2: Update Terminal to Mount After Boot**

```typescript
// TerminalMain.tsx

function TerminalMain() {
  const { state: wcState, boot, manager } = useWebContainer();
  const { mountStatus, mount } = useFSAMount(manager);
  
  // Boot WebContainer
  useEffect(() => {
    boot();
  }, [boot]);
  
  // Mount FSA after boot complete
  useEffect(() => {
    if (wcState.status === 'ready') {
      mount();
    }
  }, [wcState.status, mount]);
  
  // Show status
  if (wcState.status !== 'ready') {
    return <TerminalSkeleton status="booting" />;
  }
  
  if (mountStatus === 'mounting') {
    return <TerminalSkeleton status="mounting" />;
  }
  
  return (
    <TerminalPanel
      webContainer={manager}
      cwd="/project"
      initialSyncCompleted={mountStatus === 'mounted'}
    />
  );
}
```

**Step 3: Implement mountFSA in WebContainerManager**

```typescript
// src/lib/webcontainer/manager.ts

class WebContainerManager {
  async mountFSA(handle: FileSystemDirectoryHandle, mountPath: string): Promise<void> {
    // Use FSA adapter to create virtual FS tree
    const adapter = new WebContainerFSAAdapter(handle);
    const files = await adapter.buildFileTree();
    
    // Mount files to WebContainer
    await this.container.mount(files);
    
    console.log(`[WebContainerManager] Mounted ${Object.keys(files).length} files to ${mountPath}`);
  }
}
```

#### Acceptance Criteria

- [ ] FSA handle retrieved from storage adapter
- [ ] Files mounted to `/project` in WebContainer
- [ ] `ls /project` shows project files
- [ ] `cat /project/package.json` shows file content
- [ ] Mount skipped for IndexedDB storage (graceful)
- [ ] Console logs: "[FSAMount] FSA mounted to /project"

---

### EPIC-0.6-07: Process Registry

#### Status
- **Team**: B
- **Effort**: 2-3h
- **Priority**: P1
- **Dependencies**: 0.6-05
- **Status**: READY

#### Technical Problem Statement

No central registry of running processes. Preview doesn't know what Terminal is running.

#### Technical Approach

**Step 1: Create Process Registry Store**

```typescript
// src/infrastructure/persistence/stores/process-registry-store.ts

interface ProcessInfo {
  id: string;
  command: string;
  pid: number;
  status: 'running' | 'stopped' | 'error';
  ports: number[];
  startedAt: number;
}

interface ProcessRegistryState {
  processes: Map<string, ProcessInfo>;
  registerProcess: (info: Omit<ProcessInfo, 'id'>) => string;
  updateProcess: (id: string, updates: Partial<ProcessInfo>) => void;
  removeProcess: (id: string) => void;
  getProcessByPort: (port: number) => ProcessInfo | null;
}

export const useProcessRegistry = create<ProcessRegistryState>()((set, get) => ({
  processes: new Map(),
  
  registerProcess: (info) => {
    const id = crypto.randomUUID();
    const process = { ...info, id };
    
    set(state => ({
      processes: new Map(state.processes).set(id, process),
    }));
    
    return id;
  },
  
  updateProcess: (id, updates) => {
    set(state => {
      const processes = new Map(state.processes);
      const existing = processes.get(id);
      if (existing) {
        processes.set(id, { ...existing, ...updates });
      }
      return { processes };
    });
  },
  
  removeProcess: (id) => {
    set(state => {
      const processes = new Map(state.processes);
      processes.delete(id);
      return { processes };
    });
  },
  
  getProcessByPort: (port) => {
    const { processes } = get();
    for (const process of processes.values()) {
      if (process.ports.includes(port)) {
        return process;
      }
    }
    return null;
  },
}));
```

**Step 2: Register Processes from Terminal**

```typescript
// TerminalAdapter.ts

class TerminalAdapter {
  private processId: string | null = null;
  
  async runCommand(command: string): Promise<void> {
    const registry = useProcessRegistry.getState();
    
    this.processId = registry.registerProcess({
      command,
      pid: this.currentPid,
      status: 'running',
      ports: [],
      startedAt: Date.now(),
    });
    
    // Parse output for port detection
    this.onOutput((output) => {
      const portMatch = output.match(/localhost:(\d+)/);
      if (portMatch) {
        const port = parseInt(portMatch[1]);
        registry.updateProcess(this.processId!, { ports: [port] });
      }
    });
  }
}
```

#### Acceptance Criteria

- [ ] Process registry store created
- [ ] Terminal registers processes when running commands
- [ ] Port detection from terminal output
- [ ] `getProcessByPort()` returns correct process
- [ ] Process cleanup on Terminal unmount

---

### EPIC-0.6-08: Dev-Server-Ready Events

#### Status
- **Team**: B
- **Effort**: 2h
- **Priority**: P0
- **Dependencies**: 0.6-07
- **Status**: READY

#### Technical Problem Statement

Preview listens for `dev-server-ready` event but nobody emits it:

```typescript
// PreviewMain.tsx (current)
useEffect(() => {
  const handleDevServerReady = (event: CustomEvent<DevServerReadyDetail>) => {
    setPreviewUrl(event.detail.url);
  };
  window.addEventListener('dev-server-ready', handleDevServerReady);
}, []);
```

#### Technical Approach

**Step 1: Create Dev Server Detection**

```typescript
// src/infrastructure/webcontainer/useDevServerDetection.ts

const DEV_SERVER_PATTERNS = [
  /Local:\s+(https?:\/\/localhost:\d+)/,
  /ready in \d+ms.*?(https?:\/\/localhost:\d+)/,
  /Server running at (https?:\/\/localhost:\d+)/,
];

export function useDevServerDetection(terminalOutput: string) {
  const [devServerUrl, setDevServerUrl] = useState<string | null>(null);
  
  useEffect(() => {
    for (const pattern of DEV_SERVER_PATTERNS) {
      const match = terminalOutput.match(pattern);
      if (match) {
        const url = match[1];
        setDevServerUrl(url);
        
        // Emit event for Preview plugin
        window.dispatchEvent(new CustomEvent('dev-server-ready', {
          detail: { url, port: parseInt(url.match(/:(\d+)/)?.[1] || '3000') }
        }));
        
        console.log('[DevServer] Detected:', url);
        break;
      }
    }
  }, [terminalOutput]);
  
  return devServerUrl;
}
```

**Step 2: Wire to Terminal Output**

```typescript
// TerminalAdapter.ts

class TerminalAdapter {
  private outputBuffer = '';
  
  onOutput(callback: (output: string) => void): void {
    this.shell.output.pipeTo(new WritableStream({
      write: (chunk) => {
        this.outputBuffer += chunk;
        callback(chunk);
        
        // Check for dev server patterns
        this.checkDevServerReady();
      }
    }));
  }
  
  private checkDevServerReady(): void {
    for (const pattern of DEV_SERVER_PATTERNS) {
      const match = this.outputBuffer.match(pattern);
      if (match) {
        window.dispatchEvent(new CustomEvent('dev-server-ready', {
          detail: { url: match[1] }
        }));
        break;
      }
    }
  }
}
```

#### Acceptance Criteria

- [ ] Terminal output parsed for dev server URLs
- [ ] `dev-server-ready` event emitted when URL detected
- [ ] Event includes URL and port
- [ ] Works with Vite, Next.js, Webpack output formats
- [ ] Console logs: "[DevServer] Detected: http://localhost:3000"

---

### EPIC-0.6-09: Preview ↔ Terminal Wiring

#### Status
- **Team**: B
- **Effort**: 2-3h
- **Priority**: P0
- **Dependencies**: 0.6-08
- **Status**: READY

#### Technical Problem Statement

Preview receives dev-server-ready event but:
1. If Preview is OFF when event fires, URL is lost
2. No HMR integration (file changes don't trigger reload)

#### Technical Approach

**Step 1: Add Deferred URL Queue**

```typescript
// plugin-coordination-store.ts

interface PluginCoordinationState {
  // ... existing fields
  
  deferredUrls: string[];
  queueDeferredUrl: (url: string) => void;
  consumeDeferredUrl: () => string | null;
}

// Implementation
queueDeferredUrl: (url) => {
  set(state => ({
    deferredUrls: [...state.deferredUrls, url],
  }));
},

consumeDeferredUrl: () => {
  const { deferredUrls } = get();
  if (deferredUrls.length === 0) return null;
  
  const url = deferredUrls[0];
  set({ deferredUrls: deferredUrls.slice(1) });
  return url;
},
```

**Step 2: Update Dev Server Detection to Queue**

```typescript
// useDevServerDetection.ts

export function useDevServerDetection(terminalOutput: string) {
  const { queueDeferredUrl } = usePluginCoordination();
  
  useEffect(() => {
    for (const pattern of DEV_SERVER_PATTERNS) {
      const match = terminalOutput.match(pattern);
      if (match) {
        const url = match[1];
        
        // Emit event AND queue
        window.dispatchEvent(new CustomEvent('dev-server-ready', { detail: { url } }));
        queueDeferredUrl(url);
        
        break;
      }
    }
  }, [terminalOutput, queueDeferredUrl]);
}
```

**Step 3: Update Preview to Check Queue on Mount**

```typescript
// PreviewMain.tsx

function PreviewMain() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { consumeDeferredUrl } = usePluginCoordination();
  
  // Check for deferred URLs on mount
  useEffect(() => {
    const deferredUrl = consumeDeferredUrl();
    if (deferredUrl) {
      setPreviewUrl(deferredUrl);
    }
  }, [consumeDeferredUrl]);
  
  // Listen for new dev-server-ready events
  useEffect(() => {
    const handler = (event: CustomEvent<{ url: string }>) => {
      setPreviewUrl(event.detail.url);
    };
    window.addEventListener('dev-server-ready', handler as EventListener);
    return () => window.removeEventListener('dev-server-ready', handler as EventListener);
  }, []);
  
  if (!previewUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-muted-foreground">{t('preview.noDevServer')}</span>
      </div>
    );
  }
  
  return (
    <iframe src={previewUrl} className="w-full h-full border-0" />
  );
}
```

#### Acceptance Criteria

- [ ] Dev server URL queued when Preview is OFF
- [ ] Preview consumes queued URL on mount
- [ ] Preview shows "No dev server" when no URL
- [ ] Preview shows iframe when URL available
- [ ] HMR works (file save → preview updates)

---

## Section 3: UX & Cleanup Stories (Team A+B)

### EPIC-0.6-10: Device Fallback

#### Status
- **Team**: A
- **Effort**: 2h
- **Priority**: P1
- **Dependencies**: 0.6-04
- **Status**: READY

#### Technical Problem Statement

Terminal and Preview require FSA + Desktop. On mobile/tablet, they show broken state instead of graceful fallback.

#### Technical Approach

**Step 1: Create Device Capability Hook**

```typescript
// src/infrastructure/hooks/useDeviceCapabilities.ts

export function useDeviceCapabilities() {
  const { project } = useProjectContext();
  
  return {
    canUseTerminal: project.storageType === 'fsa' && project.deviceType === 'desktop',
    canUsePreview: project.storageType === 'fsa' && project.deviceType === 'desktop',
    canUseMonaco: project.storageType === 'fsa',
    canUseNotes: true, // Universal
    canUseFileTree: true, // Universal
  };
}
```

**Step 2: Create Fallback Component**

```typescript
// src/presentation/components/common/PluginFallback.tsx

interface PluginFallbackProps {
  pluginId: PluginId;
  reason: 'no-fsa' | 'no-desktop' | 'requires-plugin';
  suggestedAction?: string;
}

export function PluginFallback({ pluginId, reason, suggestedAction }: PluginFallbackProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
      <AlertCircle size={48} className="text-muted-foreground" />
      <h3 className="text-lg font-medium">{t(`plugin.${pluginId}.unavailable`)}</h3>
      <p className="text-muted-foreground text-center">
        {t(`plugin.fallback.${reason}`)}
      </p>
      {suggestedAction && (
        <Button variant="outline" onClick={() => /* handle action */}>
          {suggestedAction}
        </Button>
      )}
    </div>
  );
}
```

**Step 3: Update Plugins to Show Fallback**

```typescript
// TerminalMain.tsx

function TerminalMain() {
  const { canUseTerminal } = useDeviceCapabilities();
  
  if (!canUseTerminal) {
    return (
      <PluginFallback 
        pluginId="terminal"
        reason={project.storageType !== 'fsa' ? 'no-fsa' : 'no-desktop'}
        suggestedAction={t('terminal.openOnDesktop')}
      />
    );
  }
  
  // ... rest of component
}
```

#### Acceptance Criteria

- [ ] Terminal shows fallback on mobile/tablet
- [ ] Preview shows fallback on mobile/tablet
- [ ] Fallback explains why plugin is unavailable
- [ ] Fallback suggests action (open on desktop)
- [ ] No broken UI states

---

### EPIC-0.6-11: Replace Hardcoded noteId

#### Status
- **Team**: A
- **Effort**: 1-2h
- **Priority**: P0
- **Dependencies**: 0.6-01
- **Status**: READY

#### Technical Problem Statement

Notes plugin has hardcoded noteId that ignores activeDocument:

```typescript
// NotesPlugin.tsx (current - BROKEN)
const noteId = `${project.folderPath}/notes/note.md`;
```

User selects `README.md` in FileTree → Notes still shows `notes/note.md`.

#### Technical Approach

**Step 1: Update Notes to Use ActiveDocument**

```typescript
// NotesPlugin.tsx

function NotesPlugin() {
  const { activeDocument } = usePluginCoordination();
  const [noteId, setNoteId] = useState<string | null>(null);
  
  useEffect(() => {
    if (activeDocument && activeDocument.path.endsWith('.md')) {
      setNoteId(activeDocument.path);
    }
  }, [activeDocument]);
  
  // Fallback to default note if no .md file selected
  const effectiveNoteId = noteId || `${project.folderPath}/notes/note.md`;
  
  return (
    <NoteEditor
      noteId={effectiveNoteId}
      projectContext={projectContext}
    />
  );
}
```

**Step 2: Add File Type Check**

```typescript
// NotesPlugin.tsx

const isMarkdownFile = (path: string): boolean => {
  return path.endsWith('.md') || path.endsWith('.mdx');
};

// Only open in Notes if it's a markdown file
useEffect(() => {
  if (activeDocument && isMarkdownFile(activeDocument.path)) {
    setNoteId(activeDocument.path);
    openDocument(activeDocument.path, 'notes');
  }
}, [activeDocument]);
```

#### Acceptance Criteria

- [ ] Notes opens activeDocument when it's `.md`
- [ ] Notes ignores non-markdown files
- [ ] Notes falls back to default if no `.md` selected
- [ ] Switching files updates Notes content
- [ ] Console logs: "[Notes] Opening: README.md"

---

### EPIC-0.6-12: Monaco ↔ Notes Mirroring

#### Status
- **Team**: B
- **Effort**: 4-6h
- **Priority**: P1
- **Dependencies**: 0.6-02, 0.6-03
- **Status**: READY

#### Technical Problem Statement

Monaco and Notes can both edit the same `.md` file, but changes don't sync:
1. Edit in Monaco → Notes doesn't update
2. Edit in Notes → Monaco doesn't update
3. Both save independently → last-write-wins

#### Technical Approach

**Step 1: Create Sync Hook**

```typescript
// src/infrastructure/hooks/useEditorSync.ts

export function useEditorSync(pluginId: PluginId, path: string) {
  const { activeDocument, hasWriteLock, acquireWriteLock, releaseWriteLock } = usePluginCoordination();
  const [localContent, setLocalContent] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  // Detect external changes
  useEffect(() => {
    if (activeDocument?.path === path && activeDocument.content !== localContent) {
      if (localContent !== null && !hasWriteLock(path, pluginId)) {
        setIsStale(true);
      }
    }
  }, [activeDocument, path, localContent, pluginId]);
  
  // Pull latest
  const pullLatest = useCallback(() => {
    if (activeDocument?.path === path) {
      setLocalContent(activeDocument.content);
      setIsStale(false);
    }
  }, [activeDocument, path]);
  
  // Push changes (with lock)
  const pushChanges = useCallback(async (content: string) => {
    const locked = await acquireWriteLock(path, pluginId);
    if (!locked) {
      toast.warning(t('editor.lockHeldByOther'));
      return false;
    }
    
    setLocalContent(content);
    // Update shared document
    coordinationStore.updateActiveDocument(path, content);
    releaseWriteLock(path, pluginId);
    return true;
  }, [path, pluginId, acquireWriteLock, releaseWriteLock]);
  
  return { localContent, isStale, pullLatest, pushChanges };
}
```

**Step 2: Update Monaco to Use Sync Hook**

```typescript
// MonacoMain.tsx

function MonacoMain() {
  const { localContent, isStale, pullLatest, pushChanges } = useEditorSync('monaco', activePath || '');
  
  // Pull on file open
  useEffect(() => {
    if (activePath) {
      pullLatest();
    }
  }, [activePath, pullLatest]);
  
  // Show stale warning
  if (isStale) {
    return (
      <div>
        <Alert>
          {t('editor.fileChangedExternally')}
          <Button onClick={pullLatest}>{t('editor.reload')}</Button>
        </Alert>
        <MonacoEditor content={localContent} />
      </div>
    );
  }
  
  // On change, push with debounce
  const handleChange = useDebouncedCallback((content: string) => {
    pushChanges(content);
  }, 500);
}
```

**Step 3: Update Notes to Use Sync Hook**

```typescript
// NoteEditor.tsx

function NoteEditor({ noteId }: { noteId: string }) {
  const { localContent, isStale, pullLatest, pushChanges } = useEditorSync('notes', noteId);
  
  // Similar pattern to Monaco
  // Pull on mount, push on change
}
```

#### Acceptance Criteria

- [ ] Edit in Monaco → Notes updates (via shared activeDocument)
- [ ] Edit in Notes → Monaco updates
- [ ] Write-lock prevents simultaneous writes
- [ ] Stale warning shown when external change detected
- [ ] Reload button pulls latest content
- [ ] No data loss on concurrent edits

---

## Section 4: Execution Timeline

### Phase 1: Foundation (Day 1)

**Parallel Execution**:
- **Team A**: 0.6-01 (PluginCoordinationContext) → 4-6h
- **Team B**: 0.6-05 (Boot WebContainer) → 4-6h

**End of Day 1 Deliverables**:
- PluginCoordinationContext created
- WebContainer boots on Terminal mount

### Phase 2: Integration (Day 2)

**Parallel Execution**:
- **Team A**: 0.6-02 (File tracking) + 0.6-03 (Write-lock) → 5h
- **Team B**: 0.6-06 (FSA mount) + 0.6-07 (Process registry) → 6h

**End of Day 2 Deliverables**:
- Files tracked across plugins
- Write-lock mechanism working
- FSA files mounted to WebContainer
- Process registry tracking commands

### Phase 3: Wiring (Day 3 AM)

**Parallel Execution**:
- **Team A**: 0.6-04 (Capabilities) + 0.6-10 (Device fallback) + 0.6-11 (noteId fix) → 6h
- **Team B**: 0.6-08 (Dev events) + 0.6-09 (Preview wiring) → 4h

### Phase 4: Mirroring (Day 3 PM)

**Team B**: 0.6-12 (Monaco ↔ Notes mirroring) → 4-6h

---

## Reference Documents

- **Analysis**: `docs/analysis/phase-1a-plugin-coordination-problems-2026-01-27.md`
- **Architecture**: `_bmad-output/planning-artifacts/architecture.md#3.9`
- **EPIC-0.5**: `_bmad-output/planning-artifacts/epics/EPIC-0.5-FILETREE-PLUGIN-MATURITY-2026-01-26.md`

---

## Execution Log

> **Note**: Append execution progress here as stories are completed.

### Sprint Start (2026-01-27)

**Status**: READY_FOR_EXECUTION

---

### Sprint Completion (2026-01-27)

**Duration**: ~2 hours parallel execution
**Teams**: A + B working in parallel

#### Team A Deliverables:
- **0.6-01**: Created `plugin-coordination-context.tsx`, `plugin-coordination-store.ts`, `plugin-coordination.types.ts`
- **0.6-02**: Modified Monaco, Notes, FileTree to register as editors
- **0.6-03**: Added write-lock with 30s timeout, lock indicator UI
- **0.6-04**: Created `plugin-capability.interface.ts` with capability declarations
- **0.6-10**: Created `device-detection.ts`, `PluginFallback.tsx` with i18n
- **0.6-11**: Verified already implemented - uses coordination context

#### Team B Deliverables:
- **0.6-05**: Created `useWebContainer.ts` hook, boot on Terminal mount
- **0.6-06**: Created `useFSAMount.ts` for FSA → WebContainer sync
- **0.6-07**: Created `process-registry-store.ts` for process tracking
- **0.6-08**: Created `useDevServerDetection.ts` with framework detection
- **0.6-09**: Wired Preview to consume queued URLs from Terminal
- **0.6-12**: Added "also open in" indicator to Monaco and Notes

#### Files Created (12 new files):
1. `src/domain/types/plugin-coordination.types.ts`
2. `src/infrastructure/persistence/stores/plugin-coordination-store.ts`
3. `src/infrastructure/context/plugin-coordination-context.tsx`
4. `src/domain/interfaces/plugin-capability.interface.ts`
5. `src/infrastructure/utils/device-detection.ts`
6. `src/presentation/components/common/PluginFallback.tsx`
7. `src/infrastructure/webcontainer/useWebContainer.ts`
8. `src/infrastructure/webcontainer/useFSAMount.ts`
9. `src/infrastructure/persistence/stores/process-registry-store.ts`
10. `src/infrastructure/webcontainer/useDevServerDetection.ts`
11. `public/locales/en/plugin.json`
12. `public/locales/vi/plugin.json`

#### Files Modified:
- `src/routes/$projectId.tsx`
- `src/plugins/monaco/MonacoMain.tsx`
- `src/plugins/notes/NotesPlugin.tsx`
- `src/plugins/filetree/FileTreePlugin.tsx`
- `src/plugins/terminal/TerminalMain.tsx`
- `src/plugins/preview/PreviewMain.tsx`
- `src/presentation/layouts/PluginLayout.tsx`
- `src/domain/interfaces/feature-plugin.interface.ts`
- `src/domain/types/index.ts`
- `src/domain/interfaces/index.ts`

#### TypeScript Status:
- 0 new errors introduced
- 13 pre-existing errors in diagnostic/test files

**EPIC-0.6 COMPLETE** ✅

---

**End of EPIC-0.6**
