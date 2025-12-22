# Data & Contracts Slice Analysis

**Via-gent** - Browser-based IDE with WebContainers  
**Date:** 2025-12-22  
**Phase:** 2 - Architectural Slices Analysis  
**Author:** @bmad-bmm-architect  

---

## 1. Overview

This document captures the **Data Models, Schemas, Contracts, and Integration Points** within the Via-gent architecture. It focuses on:

- **Data Models**: Core entities, relationships, and persistence schemas
- **Contracts**: Event schemas, HTTP routes, RPC procedures, and message payloads
- **Validation**: Zod schemas, TypeScript interfaces, and data validation patterns
- **Serialization**: Data transformation between layers (UI ↔ Application ↔ Domain ↔ Infrastructure)

---

## 2. Core Data Models

### 2.1 Project Metadata (`ProjectMetadata`)

**Location:** `src/lib/workspace/workspace-types.ts`

```typescript
interface ProjectMetadata {
  id: string;                    // UUID v4 generated via `generateProjectId()`
  name: string;                  // Folder name from FileSystemDirectoryHandle
  folderPath: string;            // Display path (handle.name)
  fsaHandle: FileSystemDirectoryHandle; // Browser File System Access API handle
  lastOpened: Date;              // Last accessed timestamp
  autoSync: boolean;             // Whether to sync automatically on file changes
  layoutState?: LayoutConfig;    // Saved IDE panel layout (JSON serializable)
  exclusionPatterns?: string[];  // Patterns to exclude from sync (e.g., [".git", "node_modules"])
  lastKnownPermissionState?: 'granted' | 'prompt' | 'denied'; // FSA permission state
}
```

**Relations:**
- `ProjectMetadata` ↔ `FileSystemDirectoryHandle` (1:1 via `fsaHandle`)
- `ProjectMetadata` ↔ `WorkspaceState` (1:1 via `projectId`)
- `ProjectMetadata` ↔ `SyncConfig` (1:1 via `exclusionPatterns`)

### 2.2 Workspace State (`WorkspaceState`)

**Location:** `src/lib/workspace/workspace-types.ts`

```typescript
interface WorkspaceState {
  // Project
  projectMetadata: ProjectMetadata | null;
  directoryHandle: FileSystemDirectoryHandle | null;
  permissionState: 'granted' | 'prompt' | 'denied' | 'unknown';
  
  // Sync
  syncStatus: 'idle' | 'syncing' | 'error';
  syncProgress: SyncProgress | null;
  autoSync: boolean;
  
  // UI State
  isOpeningFolder: boolean;
  exclusionPatterns: string[];
  layoutState: LayoutConfig;
  
  // WebContainer
  webContainerStatus: 'idle' | 'booting' | 'ready' | 'error';
  terminalReady: boolean;
  editorReady: boolean;
}
```

**Relations:**
- `WorkspaceState` → `ProjectMetadata` (composition)
- `WorkspaceState` → `SyncProgress` (aggregation)
- `WorkspaceState` → `LayoutConfig` (composition)

### 2.3 Layout Configuration (`LayoutConfig`)

**Location:** `src/lib/workspace/workspace-types.ts`

```typescript
interface LayoutConfig {
  // Panel sizes (0-100 percentages)
  explorerWidth: number;
  editorHeight: number;
  terminalHeight: number;
  
  // Visibility toggles
  showExplorer: boolean;
  showTerminal: boolean;
  showPreview: boolean;
  
  // Active tabs
  activeEditorTab: string | null;  // File path
  activeTerminalTab: 'shell' | 'npm' | 'git' | 'logs';
  
  // Split panel positions
  verticalSplitPosition: number;  // 0-100
  horizontalSplitPosition: number; // 0-100
}
```

### 2.4 Sync Types & Error Handling

**Location:** `src/lib/filesystem/sync-types.ts`

```typescript
// Sync Status
type SyncStatus = 'idle' | 'syncing' | 'error';

// Error Codes
type SyncErrorCode =
  | 'PERMISSION_DENIED'
  | 'FILE_NOT_FOUND'
  | 'FILE_READ_FAILED'
  | 'FILE_WRITE_FAILED'
  | 'DISK_FULL'
  | 'WEBCONTAINER_ERROR'
  | 'WEBCONTAINER_NOT_BOOTED'
  | 'ENCODING_ERROR'
  | 'SYNC_FAILED'
  | 'UNKNOWN';

// Sync Configuration
interface SyncConfig {
  excludePatterns: string[];           // Patterns to exclude from sync
  onProgress?: (progress: SyncProgress) => void;
  onError?: (error: SyncError) => void;
  onComplete?: (result: SyncResult) => void;
  preScanFileCount?: boolean;
}

// Sync Progress
interface SyncProgress {
  totalFiles: number;
  syncedFiles: number;
  currentFile: string;
  percentage: number;
}

// Sync Result
interface SyncResult {
  success: boolean;
  totalFiles: number;
  syncedFiles: number;
  failedFiles: string[];
  duration: number;
}
```

### 2.5 Permission Lifecycle Data

**Location:** `src/lib/filesystem/permission-lifecycle.ts`

```typescript
interface HandleRecord {
  id: string;
  handle?: FileSystemDirectoryHandle;
}

// Permission states aligned with File System Access API
type PermissionState = 'granted' | 'prompt' | 'denied';
```

---

## 3. Persistence Schema (IndexedDB)

### 3.1 ProjectStore Schema (Dexie.js)

**Location:** `src/lib/workspace/project-store.ts`

```typescript
// Dexie database schema (v2)
interface ProjectStoreSchema {
  projects: {
    key: string;                    // Project ID (UUID)
    value: ProjectMetadata & {
      fsaHandle: FileSystemDirectoryHandle; // Serialized via structured clone
      createdAt: Date;
      updatedAt: Date;
    };
    indexes: {
      'lastOpened': Date;           // For sorting by recency
      'name': string;               // For searching
    };
  };
  
  // Legacy migration table (v1 → v2)
  legacyProjects?: {
    key: string;
    value: any;
  };
}

// Database version history:
// v1: Initial schema with basic project metadata
// v2: Added layoutState, exclusionPatterns, lastKnownPermissionState
//     Added indexes for faster queries
```

### 3.2 Migration Logic

```typescript
// Migration from v1 to v2
db.version(2).stores({
  projects: 'id, lastOpened, name', // Added indexes
}).upgrade((tx) => {
  // Migration logic for existing data
  return tx.table('projects').toCollection().modify((project) => {
    // Add new fields with defaults
    project.layoutState = project.layoutState || DEFAULT_LAYOUT_CONFIG;
    project.exclusionPatterns = project.exclusionPatterns || DEFAULT_EXCLUSIONS;
    project.lastKnownPermissionState = 'unknown';
  });
});
```

---

## 4. Event Contracts

### 4.1 Workspace Event System (`WorkspaceEvents`)

**Location:** `src/lib/events/workspace-events.ts`

| Event Name | Payload | Description |
|------------|---------|-------------|
| **File System Events** | | |
| `file:created` | `{ path: string; source: 'local' \| 'editor' \| 'agent' }` | File created in any source |
| `file:modified` | `{ path: string; source: 'local' \| 'editor' \| 'agent'; content?: string }` | File modified with optional content |
| `file:deleted` | `{ path: string; source: 'local' \| 'editor' \| 'agent' }` | File deleted |
| `directory:created` | `{ path: string }` | Directory created |
| `directory:deleted` | `{ path: string }` | Directory deleted |
| **Sync Events** | | |
| `sync:started` | `{ fileCount: number; direction: 'to-wc' \| 'to-local' \| 'bidirectional' }` | Sync operation started |
| `sync:progress` | `{ current: number; total: number; currentFile: string }` | Progress update during sync |
| `sync:completed` | `{ success: boolean; timestamp: Date; filesProcessed: number }` | Sync completed |
| `sync:error` | `{ error: Error; file?: string }` | Sync error occurred |
| `sync:paused` | `{ reason: 'user' \| 'error' \| 'permission' }` | Sync paused |
| `sync:resumed` | `{}` | Sync resumed |
| **WebContainer Events** | | |
| `container:booted` | `{ bootTime: number }` | WebContainer booted |
| `container:mounted` | `{ fileCount: number }` | File system mounted |
| `container:error` | `{ error: Error }` | WebContainer error |
| **Terminal/Process Events** | | |
| `process:started` | `{ pid: string; command: string; args: string[] }` | Process started |
| `process:output` | `{ pid: string; data: string; type: 'stdout' \| 'stderr' }` | Process output |
| `process:exited` | `{ pid: string; exitCode: number }` | Process exited |
| `terminal:input` | `{ data: string }` | Terminal input received |
| **Permission Events** | | |
| `permission:requested` | `{ handle: FileSystemDirectoryHandle }` | Permission requested |
| `permission:granted` | `{ handle: FileSystemDirectoryHandle; projectId: string }` | Permission granted |
| `permission:denied` | `{ handle: FileSystemDirectoryHandle; reason: string }` | Permission denied |
| `permission:expired` | `{ projectId: string }` | Permission expired |
| **Project Events** | | |
| `project:opened` | `{ projectId: string; name: string }` | Project opened |
| `project:closed` | `{ projectId: string }` | Project closed |
| `project:switched` | `{ fromId: string \| null; toId: string }` | Project switched |

### 4.2 Event Emitter Implementation

```typescript
import EventEmitter from 'eventemitter3';

export type WorkspaceEventEmitter = EventEmitter<WorkspaceEvents>;

export function createWorkspaceEventBus(): WorkspaceEventEmitter {
  return new EventEmitter<WorkspaceEvents>();
}
```

**Usage Pattern:**
```typescript
// Publishing events
eventBus.emit('file:created', { path: '/src/index.ts', source: 'editor' });

// Subscribing to events
eventBus.on('sync:progress', (progress) => {
  updateProgressBar(progress.percentage);
});
```

---

## 5. HTTP Route Contracts (TanStack Router)

### 5.1 Route Tree Structure

**Generated File:** `src/routeTree.gen.ts`

| Route Path | Component | Description | Parameters |
|------------|-----------|-------------|------------|
| `/` | `Dashboard` | Project dashboard/landing page | None |
| `/workspace/$projectId` | `Workspace` | Main IDE workspace | `projectId: string` |
| `/webcontainer/$` | `WebContainerNotSupported` | Catch-all for WebContainer preview URLs | Splat route |
| `/test-fs-adapter` | `TestFsAdapter` | File system adapter test page | None |
| `/demo/start/server-funcs` | `DemoServerFuncs` | Demo: Server functions | None |
| `/demo/start/api-request` | `DemoApiRequest` | Demo: API requests | None |
| `/demo/api/names` | `DemoApiNames` | Demo: API names | None |
| `/demo/start/ssr/index` | `DemoSsrIndex` | Demo: SSR index | None |
| `/demo/start/ssr/spa-mode` | `DemoSsrSpaMode` | Demo: SSR SPA mode | None |
| `/demo/start/ssr/full-ssr` | `DemoSsrFullSsr` | Demo: Full SSR | None |
| `/demo/start/ssr/data-only` | `DemoSsrDataOnly` | Demo: Data-only SSR | None |

### 5.2 Route Parameter Contracts

```typescript
// Route parameters are validated via TanStack Router's type system
// No explicit Zod validation at route level

// Workspace route expects projectId parameter
const workspaceRoute = createFileRoute('/workspace/$projectId')({
  component: Workspace,
  validateSearch: (search) => {
    // Optional search params validation could be added here
    return search as { tab?: string };
  }
});
```

### 5.3 Route Data Flow

```
Browser → TanStack Router → Route Component → Workspace Context → File System/WebContainer
```

**Key Constraints:**
- SSR disabled for WebContainer compatibility
- All routes are client-side only
- Route parameters are passed via URL and accessible via `useParams()`
- Search parameters for optional filtering (e.g., `?tab=editor`)

---

## 6. Component Props & Data Flow Contracts

### 6.1 Workspace Context Provider

**Location:** `src/lib/workspace/WorkspaceContext.tsx`

```typescript
interface WorkspaceContextType {
  // State
  state: WorkspaceState;
  
  // Setters
  setters: {
    setProjectMetadata: (metadata: ProjectMetadata | null) => void;
    setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
    setPermissionState: (state: PermissionState) => void;
    setAutoSyncState: (enabled: boolean) => void;
    setIsOpeningFolder: (isOpening: boolean) => void;
    setExclusionPatterns: (patterns: string[]) => void;
  };
  
  // Actions
  actions: {
    openFolder: () => Promise<void>;
    switchFolder: () => Promise<void>;
    setAutoSync: (enabled: boolean) => Promise<void>;
    setExclusionPatterns: (patterns: string[]) => Promise<void>;
    closeProject: () => void;
    restoreAccess: () => Promise<void>;
  };
  
  // Sync Operations
  syncOperations: {
    performSync: (handle: FileSystemDirectoryHandle, options?: SyncOptions) => Promise<void>;
    pauseSync: () => void;
    resumeSync: () => void;
  };
}
```

### 6.2 Sync Manager API

**Location:** `src/lib/filesystem/sync-manager.ts`

```typescript
class SyncManager {
  // Constructor
  constructor(
    localAdapter: LocalFSAdapter,
    config: Partial<SyncConfig> = {},
    eventBus?: WorkspaceEventEmitter
  );
  
  // Public API
  syncToWebContainer(): Promise<SyncResult>;
  writeFile(path: string, content: string | ArrayBuffer): Promise<void>;
  readFile(path: string): Promise<string | ArrayBuffer>;
  deleteFile(path: string): Promise<void>;
  listDirectory(path: string): Promise<string[]>;
  
  // Configuration
  setExcludePatterns(patterns: string[]): void;
  get status(): SyncStatus;
  get config(): SyncConfig;
}
```

### 6.3 File System Adapter Contract

**Location:** `src/lib/filesystem/local-fs-adapter.ts`

```typescript
interface LocalFSAdapter {
  // Static
  static isSupported(): boolean;
  
  // Instance methods
  requestDirectoryAccess(): Promise<FileSystemDirectoryHandle | null>;
  getDirectoryHandle(): FileSystemDirectoryHandle | null;
  readFile(path: string): Promise<string | ArrayBuffer>;
  writeFile(path: string, content: string | ArrayBuffer): Promise<void>;
  deleteFile(path: string): Promise<void>;
  listDirectory(path: string): Promise<string[]>;
  createDirectory(path: string): Promise<void>;
  deleteDirectory(path: string): Promise<void>;
  watchDirectory(path: string, callback: WatchCallback): Promise<() => void>;
}
```

---

## 7. Validation & Serialization

### 7.1 TypeScript Interfaces (No Runtime Validation)

The project uses **TypeScript interfaces exclusively** for type safety, with **no runtime validation libraries** (Zod, Yup, etc.) currently integrated. This is a design choice for minimal bundle size.

**Key Interfaces:**
- `ProjectMetadata` - Project persistence
- `WorkspaceState` - Application state
- `SyncConfig`, `SyncProgress`, `SyncResult` - Sync operations
- `LayoutConfig` - UI layout persistence
- `WorkspaceEvents` - Event payloads

### 7.2 Serialization Patterns

**File System Access API Handles:**
- `FileSystemDirectoryHandle` objects are serialized via IndexedDB's structured clone algorithm
- Handles maintain permission state across browser sessions
- Legacy migration handles conversion from v1 to v2 schema

**Date Serialization:**
- `Date` objects stored as ISO strings in IndexedDB
- Converted back to Date objects on retrieval via `new Date(isoString)`

**Binary Data:**
- Text files: UTF-8 strings
- Binary files: `ArrayBuffer` with type detection via `BINARY_EXTENSIONS` list
- Base64 encoding not used; raw binary transfer to WebContainer

### 7.3 Error Serialization

```typescript
// Custom error classes with serializable properties
class SyncError extends Error {
  constructor(
    message: string,
    public readonly code: SyncErrorCode,
    public readonly filePath?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'SyncError';
  }
  
  // JSON serialization for logging
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      filePath: this.filePath,
      cause: this.cause
    };
  }
}
```

---

## 8. Integration Contracts

### 8.1 WebContainer API Contract

**Location:** `src/lib/webcontainer/manager.ts`

```typescript
interface WebContainerManager {
  // Singleton access
  static getInstance(): WebContainerManager;
  
  // Lifecycle
  boot(): Promise<void>;
  isBooted(): boolean;
  getContainer(): WebContainerInstance | null;
  
  // File System
  mount(files: FileSystemTree): Promise<void>;
  getFileSystem(): FileSystemAPI;
  
  // Process Management
  spawn(command: string, args: string[], options: SpawnOptions): Process;
  kill(pid: string): void;
  
  // Events
  on(event: 'boot', listener: () => void): void;
  on(event: 'mount', listener: (fileCount: number) => void): void;
  on(event: 'error', listener: (error: Error) => void): void;
}
```

### 8.2 Monaco Editor Integration

**Location:** `src/lib/editor/monaco-integration.ts`

```typescript
interface MonacoEditorConfig {
  theme: 'vs-dark' | 'vs-light' | 'hc-black';
  language: string;  // Auto-detected from file extension
  value: string;
  onChange: (value: string) => void;
  onSave: (value: string) => Promise<void>;
  path: string;      // File path for language detection
}

interface EditorManager {
  createEditor(container: HTMLElement, config: MonacoEditorConfig): Monaco.editor.IStandaloneCodeEditor;
  disposeEditor(editor: Monaco.editor.IStandaloneCodeEditor): void;
  updateModel(path: string, content: string): void;
  setTheme(theme: string): void;
}
```

### 8.3 Terminal Integration (xterm.js)

**Location:** `src/lib/terminal/xterm-integration.ts`

```typescript
interface TerminalConfig {
  projectPath: string;  // Working directory in WebContainer
  onData: (data: string) => void;
  onResize: (cols: number, rows: number) => void;
  fitAddon: boolean;
}

interface TerminalManager {
  createTerminal(container: HTMLElement, config: TerminalConfig): Terminal;
  write(terminal: Terminal, data: string): void;
  resize(terminal: Terminal, cols: number, rows: number): void;
  dispose(terminal: Terminal): void;
  connectToWebContainer(terminal: Terminal, projectPath: string): Promise<void>;
}
```

---

## 9. Data Flow Diagrams

### 9.1 Project Creation Flow

```
┌─────────────────┐    ┌─────────────────────┐    ┌──────────────────┐
│   User Clicks   │───▶│  requestDirectory   │───▶│  File System     │
│   "Open Folder" │    │     Access()        │    │  Access API      │
└─────────────────┘    └─────────────────────┘    └──────────────────┘
                            │                           │
                            ▼                           ▼
                    ┌─────────────────┐    ┌─────────────────────┐
                    │ Generate Project│    │  Permission Grant   │
                    │      ID         │◀───│     Dialog          │
                    └─────────────────┘    └─────────────────────┘
                            │                           │
                            ▼                           ▼
                    ┌─────────────────┐    ┌─────────────────────┐
                    │ Save to         │    │  Create SyncManager │
                    │ IndexedDB       │◀───│  & Initial Sync     │
                    └─────────────────┘    └─────────────────────┘
                            │                           │
                            ▼                           ▼
                    ┌─────────────────┐    ┌─────────────────────┐
                    │ Navigate to     │───▶│  Workspace Route    │
                    │ /workspace/:id  │    │  with Project ID    │
                    └─────────────────┘    └─────────────────────┘
```

### 9.2 File Sync Data Flow

```
┌─────────────────┐    ┌─────────────────────┐    ┌──────────────────┐
│   Local FS      │───▶│  LocalFSAdapter     │───▶│  Change Detection│
│   (User edits)  │    │   (FSA Wrapper)     │    │   (debounced)    │
└─────────────────┘    └─────────────────────┘    └──────────────────┘
                            │                           │
                            ▼                           ▼
                    ┌─────────────────┐    ┌─────────────────────┐
                    │  SyncManager    │◀───│  Event:             │
                    │   (Planner)     │    │  file:modified      │
                    └─────────────────┘    └─────────────────────┘
                            │
                            ▼
                    ┌─────────────────┐    ┌─────────────────────┐
                    │  Build          │───▶│  WebContainer       │
                    │  FileSystemTree │    │   mount()           │
                    └─────────────────┘    └─────────────────────┘
                            │                           │
                            ▼                           ▼
                    ┌─────────────────┐    ┌─────────────────────┐
                    │  Emit Sync      │───▶│  Update UI          │
                    │  Events         │    │  Progress           │
                    └─────────────────┘    └─────────────────────┘
```

---

## 10. Contract Evolution & Versioning

### 10.1 Breaking Changes

| Contract Type | Versioning Strategy | Breaking Change Handling |
|---------------|---------------------|--------------------------|
| **ProjectStore Schema** | Dexie.js version upgrades with migration scripts | Automatic migration in `project-store.ts` |
| **Event Payloads** | Additive changes only; never remove fields | New fields optional, old consumers ignore them |
| **HTTP Routes** | TanStack Router file-based routing | Route changes require component updates |
| **Component Props** | TypeScript interfaces with optional fields | Backward compatibility via default values |
| **Sync Config** | `DEFAULT_SYNC_CONFIG` with override merging | Old configs merged with new defaults |

### 10.2 Deprecation Strategy

1. **Event Fields**: Mark as `@deprecated` in JSDoc, keep in payload for one major version
2. **API Methods**: Keep old signature, add new method, log warning in console
3. **Route Changes**: Maintain redirects from old routes to new ones
4. **Schema Migrations**: Automatic migration with data preservation warnings

### 10.3 Known Gaps & Future Considerations

1. **No Runtime Validation**: TypeScript-only validation may miss runtime errors
2. **No API Versioning**: Single-page app doesn't need API versioning currently
3. **Event Schema Evolution**: No formal versioning for event payloads
4. **Binary File Handling**: Limited to predefined `BINARY_EXTENSIONS` list
5. **Cross-Browser Compatibility**: File System Access API availability varies

---

## 11. Recommendations

### 11.1 Immediate Improvements

1. **Add Zod Schemas** for critical data validation at API boundaries
2. **Version Event Payloads** with `version` field for future compatibility
3. **Formalize Error Contracts** with standardized error codes and messages
4. **Add OpenAPI-like Documentation** for internal API contracts

### 11.2 Future Enhancements

1. **GraphQL-like Query Layer** for efficient data fetching from IndexedDB
2. **WebSocket Contracts** for real-time collaboration features
3. **Plugin System Contracts** for extensibility
4. **Offline Sync Contracts** for conflict resolution when reconnecting

### 11.3 Risk Areas

1. **File System Access API Changes**: Browser API evolution may break contracts
2. **WebContainer API Stability**: Beta API subject to change
3. **IndexedDB Schema Migrations**: Complex migrations risk data loss
4. **Event Payload Bloat**: Additive changes can lead to large payloads over time

---

**Next Steps:**  
Proceed to **Control & Workflow Slice Analysis** to map orchestrators, state machines, and multi-step processes.

---
*Document generated as part of Phase 2 - Architectural Slices Analysis*  
*Maintainer: @bmad-bmm-architect*  
*Timestamp: 2025-12-22T11:05:00Z*