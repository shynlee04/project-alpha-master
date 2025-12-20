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

| Issue | Location | Status |
|-------|----------|--------|
| Auto-sync not triggering on load | `useInitialSync.ts` | Open |
| File tree state resets | `FileTree.tsx` | Open |
| Permission re-auth frequency | `permission-lifecycle.ts` | Open |

---

*Generated by BMAD Document Project Workflow v1.2.0*
