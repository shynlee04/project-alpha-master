# Project Alpha - State Management Architecture

> **Generated:** 2025-12-20 | **Scan Level:** Exhaustive

## Overview

Project Alpha uses a hybrid state management approach:
- **TanStack Store** for reactive state containers
- **React Context** for dependency injection and state propagation
- **IndexedDB** for persistent storage (via `idb` library)
- **Event Bus** for cross-component communication

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Component Tree                         │
├─────────────────────────────────────────────────────────────────┤
│                    WorkspaceProvider                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 WorkspaceContext                         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐    │   │
│  │  │ projectId   │ │ syncStatus  │ │ permissionState │    │   │
│  │  │ project     │ │ isSyncing   │ │ actions         │    │   │
│  │  │ fsaHandle   │ │ lastSync    │ │                 │    │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    TanStack Stores                              │
│  ┌────────────────┐ ┌────────────────┐ ┌──────────────────┐    │
│  │  ProjectStore  │ │  IDEStateStore │ │ConversationStore │    │
│  │  (IndexedDB)   │ │   (memory)     │ │   (IndexedDB)    │    │
│  └────────────────┘ └────────────────┘ └──────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                    Event Bus                                    │
│  sync:* │ file:* │ editor:* │ terminal:* │ workspace:*         │
└─────────────────────────────────────────────────────────────────┘
```

---

## WorkspaceContext

The central context provider for IDE state.

### Location
`src/lib/workspace/WorkspaceContext.tsx`

### State Shape

```typescript
interface WorkspaceState {
  // Project identification
  projectId: string | null;
  project: ProjectMetadata | null;
  
  // FSA handle
  handle: FileSystemDirectoryHandle | null;
  
  // Sync state
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime: Date | null;
  
  // Permission state
  permissionState: 'granted' | 'prompt' | 'denied' | 'checking';
}
```

### Actions

```typescript
interface WorkspaceActions {
  openFolder(): Promise<void>;      // Request FSA picker
  switchFolder(): Promise<void>;    // Change to different project
  syncNow(): Promise<void>;         // Trigger manual sync
  closeProject(): void;             // Close current project
}
```

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useWorkspaceState()` | Access workspace state |
| `useSyncOperations()` | Sync action handlers |
| `useEventBusEffects()` | Subscribe to event bus |
| `useInitialSync()` | Trigger sync on project load |
| `useWorkspaceActions()` | Get workspace actions |
| `useLocalePreference()` | (Planned) Read/write UI locale with localStorage fallback and route param |

---

## TanStack Stores

### ProjectStore

**Purpose:** Persistent project metadata storage.

**Location:** `src/lib/workspace/project-store.ts`

**Schema:**
```typescript
interface ProjectMetadata {
  id: string;                           // UUID
  folderPath: string;                   // Display path
  name: string;                         // Project name
  fsaHandle: FileSystemDirectoryHandle; // FSA handle for restoration
  lastOpened: Date;
  createdAt: Date;
}
```

**Operations:**
- `saveProject(metadata)` - Create/update project
- `getProject(id)` - Get project by ID
- `getAllProjects()` - List all projects (for dashboard)
- `deleteProject(id)` - Remove project
- `getRecentProjects(limit)` - Get recent projects

### IDEStateStore

**Purpose:** UI state that persists across sessions.

**Location:** `src/lib/workspace/ide-state-store.ts`

**Schema:**
```typescript
interface IDEState {
  openTabs: string[];           // Open file paths
  activeTab: string | null;     // Currently focused file
  sidebarWidth: number;         // Panel sizes
  terminalHeight: number;
  theme: 'dark' | 'light';
}
```

### ConversationStore

**Purpose:** AI conversation history.

**Location:** `src/lib/workspace/conversation-store.ts`

**Schema:**
```typescript
interface Conversation {
  id: string;
  projectId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
}
```

### FileSyncStatusStore

**Purpose:** Per-file sync status tracking.

**Location:** `src/lib/workspace/file-sync-status-store.ts`

**Schema:**
```typescript
type FileSyncStatus = Map<string, {
  status: 'synced' | 'pending' | 'error';
  lastSynced: Date | null;
  error?: string;
}>;
```

---

## Event Bus

**Location:** `src/lib/events/`

### Event Types

```typescript
// Sync events
interface SyncEvents {
  'sync:started': { projectId: string };
  'sync:completed': { projectId: string; filesChanged: number };
  'sync:error': { projectId: string; error: Error };
  'sync:progress': { currentFile: string; percent: number };
}

// File events
interface FileEvents {
  'file:created': { path: string };
  'file:modified': { path: string };
  'file:deleted': { path: string };
}

// Editor events
interface EditorEvents {
  'editor:open': { path: string };
  'editor:close': { path: string };
  'editor:save': { path: string; content: string };
}
```

### Usage Pattern

```typescript
import { createWorkspaceEventBus } from '@/lib/events';

const eventBus = createWorkspaceEventBus();

// Emit
eventBus.emit('sync:started', { projectId: '123' });

// Listen
eventBus.on('sync:completed', ({ filesChanged }) => {
  console.log(`Synced ${filesChanged} files`);
});
```

---

## Data Flow

### Opening a Project

```
1. User clicks "Open Folder"
   └─→ WorkspaceActions.openFolder()
       └─→ showDirectoryPicker() (FSA API)
           └─→ ProjectStore.saveProject(handle)
               └─→ IndexedDB write
               └─→ WorkspaceContext.setState({ projectId, handle })
                   └─→ useInitialSync() triggered
                       └─→ SyncManager.syncToWebContainer()
                           └─→ EventBus.emit('sync:completed')
```

### Editing a File

```
1. User types in Monaco
   └─→ MonacoEditor.onChange(content)
       └─→ SyncManager.writeFile(path, content)
           └─→ LocalFSAdapter.writeFile() (local FS)
           └─→ WebContainer.fs.writeFile() (container)
           └─→ EventBus.emit('file:modified')
               └─→ FileSyncStatusStore.update(path, 'synced')
```

---

## Known Issues

| Issue | Location | Status | Priority |
|-------|----------|--------|----------|
| Auto-sync not triggering on load | `useInitialSync.ts` | Open | - |
| File tree state resets | `FileTree.tsx` | Open | - |
| Permission re-auth frequency | `permission-lifecycle.ts` | Open | - |
| IDELayout state duplication | `IDELayout.tsx` | P0 Issue | Deferred |
| Terminal working directory | `XTerminal` | Fixed | - |

---

## State Management Audit (2025-12-26)

### P0 Issue Identified

**Location:** `src/components/layout/IDELayout.tsx`

**Problem:** The component duplicates IDE state using local `useState` instead of using `useIDEStore` from the Zustand store.

**Impact:**
- State desynchronization between components
- Lost state on component remount
- Inconsistent UI behavior

**Recommended Fix:**
```typescript
// BEFORE (problematic)
const [openFiles, setOpenFiles] = useState<string[]>([]);
const [activeFile, setActiveFile] = useState<string | null>(null);

// AFTER (recommended)
const { openFiles, activeFile } = useIDEStore();
```

**Status:** Refactoring deferred to avoid MVP-3 interference. See `_bmad-output/state-management-audit-p1.10-2025-12-26.md` for full audit details.

### State Architecture Summary

| State Type | Storage | Examples | Purpose |
|------------|---------|----------|---------|
| **Persisted** | IndexedDB | `useIDEStore` - open files, active file, panels, terminal tab, chat visibility | User preferences and work session |
| **Ephemeral** | In-memory | `useStatusBarStore`, `useFileSyncStatusStore`, `useNavigationStore` | UI state that resets on refresh |
| **Agent** | localStorage | `useAgentsStore`, `useAgentSelectionStore` | Agent configuration and credentials |
| **UI State** | React Context | Workspace context, theme context | Dependency injection and providers |

### New Stores Added

| Store | Location | Purpose |
|-------|----------|---------|
| `useNavigationStore` | `src/lib/state/navigation-store.ts` | Command palette, feature search, quick actions state |
| `useFileSyncStatusStore` | `src/lib/state/file-sync-status-store.ts` | Per-file sync status tracking |

### Best Practices Documented

1. **Use Zustand for shared state** - Avoid local `useState` for state shared across components
2. **Persist user preferences** - Use IndexedDB for state that should survive browser sessions
3. **Separate concerns** - Keep ephemeral UI state separate from persisted data
4. **Use Context for injection** - React Context for dependency injection, not as state store
5. **Event bus for cross-component** - Use event bus for loose coupling between distant components

---

## Testing Procedures

### State Store Testing

```typescript
// Example test for IDE store
import { renderHook, act } from '@testing-library/react';
import { useIDEStore } from '@/lib/state/ide-store';

describe('useIDEStore', () => {
  it('should persist open files across sessions', () => {
    const { result } = renderHook(() => useIDEStore());

    act(() => {
      result.current.openTab('/src/index.ts');
    });

    expect(result.current.openTabs).toContain('/src/index.ts');
  });
});
```

### Event Bus Testing

```typescript
import { createWorkspaceEventBus } from '@/lib/events';

describe('EventBus', () => {
  it('should emit and receive events', () => {
    const eventBus = createWorkspaceEventBus();
    const handler = vi.fn();

    eventBus.on('sync:completed', handler);
    eventBus.emit('sync:completed', { filesChanged: 5 });

    expect(handler).toHaveBeenCalledWith({ filesChanged: 5 });
  });
});
```

---

*Generated by BMAD Document Project Workflow v1.2.0*
*Last Updated: 2025-12-26*
