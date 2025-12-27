# Via-gent Data and Contracts Documentation

**Document ID:** `docs/2025-12-23/data-and-contracts.md`  
**Version:** 1.0  
**Date:** 2025-12-23  
**Classification:** Internal  
**Target Audience:** Technical Leadership, Architects, Developers

---

## Table of Contents

1. [Introduction](#introduction)
2. [Data Models](#data-models)
3. [IndexedDB Schema](#indexeddb-schema)
4. [Type Definitions](#type-definitions)
5. [API Contracts](#api-contracts)
6. [Event Contracts](#event-contracts)
7. [Validation Rules](#validation-rules)
8. [Data Flow Diagrams](#data-flow-diagrams)

---

## Introduction

This document provides a canonical view of all data models, schemas, type definitions, API contracts, and event contracts in the Via-gent system. It serves as the single source of truth for data structures and their relationships.

### Document Scope

| Category | Scope |
|----------|-------|
| **Data Models** | TypeScript interfaces for domain entities |
| **IndexedDB Schema** | Database schema (version 3) |
| **Type Definitions** | Shared types and utilities |
| **API Contracts** | File System Access API, WebContainer API |
| **Event Contracts** | Typed event payloads |
| **Validation Rules** | Zod schemas for validation |

---

## Data Models

### Project Metadata

```typescript
interface ProjectMetadata {
  id: string;
  name: string;
  path: string;
  lastOpened: Date;
  createdAt: Date;
}
```

**Purpose:** Stores project information for persistence and display.

**Constraints:**
- `id`: UUID v4 format
- `name`: Non-empty string, max 255 characters
- `path`: Display path only (not actual file system path)
- `lastOpened`, `createdAt`: ISO 8601 date strings

---

### Workspace State

```typescript
interface WorkspaceState {
  projectMetadata: ProjectMetadata | null;
  directoryHandle: FileSystemDirectoryHandle | null;
  permissionState: FsaPermissionState;
  syncStatus: SyncStatus;
  syncProgress: SyncProgress | null;
  lastSyncTime: Date | null;
  syncError: string | null;
  autoSync: boolean;
  isOpeningFolder: boolean;
  exclusionPatterns: string[];
  isWebContainerBooted: boolean;
  initialSyncCompleted: boolean;
}
```

**Purpose:** Central workspace state managed by [`WorkspaceContext`](../src/lib/workspace/WorkspaceContext.tsx:1).

**Constraints:**
- `projectMetadata`: Null when no project is open
- `permissionState`: One of `'granted' | 'denied' | 'prompt' | 'unknown'`
- `syncStatus`: One of `'idle' | 'syncing' | 'paused' | 'error'`

---

### Layout Configuration

```typescript
interface LayoutConfig {
  openFiles: string[];
  activeFile: string | null;
  expandedPaths: string[];
  panelLayouts: Record<string, number[]>;
  terminalTab: 'terminal' | 'output' | 'problems';
  chatVisible: boolean;
}
```

**Purpose:** Stores IDE layout and UI state.

**Constraints:**
- `openFiles`: Array of file paths relative to project root
- `activeFile`: Must be in `openFiles` if not null
- `panelLayouts`: Key-value pairs for resizable panel sizes

---

### Sync Progress

```typescript
interface SyncProgress {
  current: number;
  total: number;
  currentFile: string;
  direction: 'toWebContainer' | 'fromWebContainer';
}
```

**Purpose:** Tracks file sync progress for UI display.

**Constraints:**
- `current`: 0 ≤ current ≤ total
- `direction`: Indicates sync direction

---

## IndexedDB Schema

### Database Definition

```typescript
class ViaGentDatabase extends Dexie {
  constructor() {
    super('ViaGentDB');
    this.version(3).stores({
      projects: 'id, name, lastOpened, createdAt',
      ideState: 'projectId, updatedAt',
      conversations: 'id, projectId, createdAt, updatedAt',
      taskContexts: 'id, projectId, agentId, status, createdAt, updatedAt',
      toolExecutions: 'id, taskId, status, createdAt',
    });
  }
}
```

**Database Name:** `ViaGentDB`  
**Current Version:** 3

---

### Table: projects

| Field | Type | Index | Constraints |
|-------|------|-------|-------------|
| `id` | `string` | Primary | UUID v4 |
| `name` | `string` | Indexed | Max 255 chars |
| `path` | `string` | - | Display path |
| `lastOpened` | `Date` | Indexed | ISO 8601 |
| `createdAt` | `Date` | Indexed | ISO 8601 |

**Purpose:** Stores project metadata for persistence.

**Indexes:**
- Primary: `id`
- Secondary: `name`, `lastOpened`, `createdAt`

**Queries:**
```typescript
// Get all projects sorted by last opened
db.projects.orderBy('lastOpened').reverse().toArray();

// Get project by ID
db.projects.get(projectId);

// Search projects by name
db.projects.where('name').equals(name).first();
```

---

### Table: ideState

| Field | Type | Index | Constraints |
|-------|------|-------|-------------|
| `projectId` | `string` | Primary | Foreign key to projects.id |
| `openFiles` | `string[]` | - | Array of file paths |
| `activeFile` | `string \| null` | - | Currently active file |
| `expandedPaths` | `string[]` | - | Expanded directories |
| `panelLayouts` | `Record<string, number[]>` | - | Panel configurations |
| `terminalTab` | `string` | - | `'terminal' \| 'output' \| 'problems'` |
| `chatVisible` | `boolean` | - | Chat panel visibility |
| `updatedAt` | `Date` | Indexed | ISO 8601 |

**Purpose:** Stores IDE layout state per project.

**Indexes:**
- Primary: `projectId`
- Secondary: `updatedAt`

**Queries:**
```typescript
// Get IDE state for project
db.ideState.get(projectId);

// Update IDE state
db.ideState.put({ projectId, ...state });
```

---

### Table: conversations

| Field | Type | Index | Constraints |
|-------|------|-------|-------------|
| `id` | `string` | Primary | UUID v4 |
| `projectId` | `string` | Indexed | Foreign key to projects.id |
| `messages` | `unknown[]` | - | Chat messages |
| `toolResults` | `unknown[]` | - | Tool execution results |
| `createdAt` | `Date` | Indexed | ISO 8601 |
| `updatedAt` | `Date` | Indexed | ISO 8601 |

**Purpose:** Stores AI chat conversation history.

**Indexes:**
- Primary: `id`
- Secondary: `projectId`, `createdAt`, `updatedAt`

**Queries:**
```typescript
// Get conversations for project
db.conversations.where('projectId').equals(projectId).toArray();

// Get conversation by ID
db.conversations.get(conversationId);
```

---

### Table: taskContexts (Epic 25)

| Field | Type | Index | Constraints |
|-------|------|-------|-------------|
| `id` | `string` | Primary | UUID v4 |
| `projectId` | `string` | Indexed | Foreign key to projects.id |
| `agentId` | `string` | Indexed | Executing agent ID |
| `status` | `TaskStatus` | Indexed | Task status |
| `description` | `string` | - | Task description |
| `targetFiles` | `string[]` | - | Files being worked on |
| `checkpoint` | `unknown` | - | LangGraph checkpoint |
| `createdAt` | `Date` | Indexed | ISO 8601 |
| `updatedAt` | `Date` | Indexed | ISO 8601 |

**Purpose:** Stores AI agent task context for LangGraph orchestration.

**Indexes:**
- Primary: `id`
- Secondary: `projectId`, `agentId`, `status`, `createdAt`, `updatedAt`

**TaskStatus Enum:**
```typescript
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
```

---

### Table: toolExecutions (Epic 25)

| Field | Type | Index | Constraints |
|-------|------|-------|-------------|
| `id` | `string` | Primary | UUID v4 |
| `taskId` | `string` | Indexed | Foreign key to taskContexts.id |
| `toolName` | `string` | - | Tool name |
| `input` | `unknown` | - | Tool input parameters |
| `output` | `unknown` | - | Tool output |
| `status` | `ExecutionStatus` | Indexed | Execution status |
| `duration` | `number` | - | Execution time (ms) |
| `createdAt` | `Date` | Indexed | ISO 8601 |

**Purpose:** Records tool execution history for debugging and auditing.

**Indexes:**
- Primary: `id`
- Secondary: `taskId`, `status`, `createdAt`

**ExecutionStatus Enum:**
```typescript
type ExecutionStatus = 'pending' | 'success' | 'error';
```

---

## Type Definitions

### Permission Types

```typescript
type FsaPermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

interface PermissionRequest {
  handle: FileSystemDirectoryHandle;
  projectId: string;
}

interface PermissionGranted {
  handle: FileSystemDirectoryHandle;
  projectId: string;
  timestamp: Date;
}

interface PermissionDenied {
  handle: FileSystemDirectoryHandle;
  reason: string;
  timestamp: Date;
}
```

---

### Sync Types

```typescript
type SyncStatus = 'idle' | 'syncing' | 'paused' | 'error';

type SyncDirection = 'toWebContainer' | 'fromWebContainer';

interface SyncProgress {
  current: number;
  total: number;
  currentFile: string;
  direction: SyncDirection;
}

interface SyncResult {
  success: boolean;
  filesProcessed: number;
  errors: string[];
  timestamp: Date;
}
```

---

### File System Types

```typescript
interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
}

interface FileContent {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'binary';
}

interface FileOperationResult {
  success: boolean;
  path: string;
  error?: string;
}
```

---

### WebContainer Types

```typescript
interface WebContainerInstance {
  fs: FileSystem;
  spawn: (command: string, args: string[]) => Promise<Process>;
  mount: (files: Record<string, string>) => Promise<void>;
  teardown: () => Promise<void>;
}

interface Process {
  pid: number;
  output: ReadableStream<Uint8Array>;
  exit: Promise<number>;
  kill: () => void;
}

interface FileSystem {
  readFile: (path: string) => Promise<Uint8Array>;
  writeFile: (path: string, content: Uint8Array) => Promise<void>;
  readdir: (path: string) => Promise<string[]>;
  rm: (path: string, options?: { recursive?: boolean }) => Promise<void>;
}
```

---

## API Contracts

### File System Access API

#### Request Directory Access

```typescript
async function requestDirectoryAccess(): Promise<FileSystemDirectoryHandle> {
  const handle = await window.showDirectoryPicker({
    mode: 'readwrite',
    startIn: 'documents',
  });
  return handle;
}
```

**Parameters:**
- `mode`: `'read' | 'readwrite'` - Access mode
- `startIn`: `'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos'` - Starting directory

**Returns:** `Promise<FileSystemDirectoryHandle>`

**Errors:**
- `AbortError`: User cancelled operation
- `NotFoundError`: Starting directory not found
- `SecurityError`: Permission denied

---

#### Read File

```typescript
async function readFile(
  handle: FileSystemFileHandle
): Promise<string> {
  const file = await handle.getFile();
  const text = await file.text();
  return text;
}
```

**Parameters:**
- `handle`: `FileSystemFileHandle` - File handle

**Returns:** `Promise<string>` - File content as text

**Errors:**
- `NotFoundError`: File not found
- `NotReadableError`: File not readable

---

#### Write File

```typescript
async function writeFile(
  handle: FileSystemFileHandle,
  content: string
): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}
```

**Parameters:**
- `handle`: `FileSystemFileHandle` - File handle
- `content`: `string` - Content to write

**Returns:** `Promise<void>`

**Errors:**
- `NotFoundError`: File not found
- `NoModificationAllowedError`: File is read-only

---

#### Check Permissions

```typescript
async function checkPermission(
  handle: FileSystemHandle
): Promise<PermissionState> {
  const permission = await handle.queryPermission({ mode: 'readwrite' });
  return permission;
}

async function requestPermission(
  handle: FileSystemHandle
): Promise<PermissionState> {
  const permission = await handle.requestPermission({ mode: 'readwrite' });
  return permission;
}
```

**Parameters:**
- `handle`: `FileSystemHandle` - File or directory handle
- `mode`: `'read' | 'readwrite'` - Permission mode

**Returns:** `Promise<PermissionState>` - `'granted' | 'denied' | 'prompt'`

---

### WebContainer API

#### Boot WebContainer

```typescript
async function bootWebContainer(
  template?: string
): Promise<WebContainerInstance> {
  const webcontainer = await WebContainer.boot({
    template: template || 'node',
  });
  return webcontainer;
}
```

**Parameters:**
- `template`: `string` (optional) - Container template (e.g., `'node'`, `'python'`)

**Returns:** `Promise<WebContainerInstance>`

**Errors:**
- `Error`: WebContainer initialization failed

---

#### Mount File System

```typescript
async function mountFileSystem(
  webcontainer: WebContainerInstance,
  files: Record<string, string>
): Promise<void> {
  await webcontainer.mount(files);
}
```

**Parameters:**
- `webcontainer`: `WebContainerInstance` - WebContainer instance
- `files`: `Record<string, string>` - Files to mount (path → content)

**Returns:** `Promise<void>`

**Errors:**
- `Error`: Mount operation failed

---

#### Spawn Process

```typescript
async function spawnProcess(
  webcontainer: WebContainerInstance,
  command: string,
  args: string[],
  options?: {
    cwd?: string;
    env?: Record<string, string>;
  }
): Promise<Process> {
  const process = await webcontainer.spawn(command, args, options);
  return process;
}
```

**Parameters:**
- `webcontainer`: `WebContainerInstance` - WebContainer instance
- `command`: `string` - Command to execute
- `args`: `string[]` - Command arguments
- `options.cwd`: `string` (optional) - Working directory
- `options.env`: `Record<string, string>` (optional) - Environment variables

**Returns:** `Promise<Process>`

**Errors:**
- `Error`: Process spawn failed

---

## Event Contracts

### Event Emitter Interface

```typescript
interface WorkspaceEventEmitter {
  on(event: WorkspaceEvent, listener: (...args: any[]) => void): void;
  off(event: WorkspaceEvent, listener: (...args: any[]) => void): void;
  emit(event: WorkspaceEvent, ...args: any[]): void;
}
```

---

### File System Events

#### file:created

```typescript
interface FileCreatedEvent {
  path: string;
  source: 'user' | 'agent' | 'sync';
  lockAcquired?: boolean;
  lockReleased?: boolean;
}
```

**Emitted by:** [`LocalFSAdapter`](../src/lib/filesystem/local-fs-adapter.ts:1), [`SyncManager`](../src/lib/filesystem/sync-manager.ts:71)

**Listeners:** File tree, SyncManager, Event logger

---

#### file:modified

```typescript
interface FileModifiedEvent {
  path: string;
  source: 'user' | 'agent' | 'sync';
  content?: string;
  lockAcquired?: boolean;
  lockReleased?: boolean;
}
```

**Emitted by:** [`LocalFSAdapter`](../src/lib/filesystem/local-fs-adapter.ts:1), [`SyncManager`](../src/lib/filesystem/sync-manager.ts:71)

**Listeners:** File tree, SyncManager, Event logger

---

#### file:deleted

```typescript
interface FileDeletedEvent {
  path: string;
  source: 'user' | 'agent' | 'sync';
  lockAcquired?: boolean;
  lockReleased?: boolean;
}
```

**Emitted by:** [`LocalFSAdapter`](../src/lib/filesystem/local-fs-adapter.ts:1), [`SyncManager`](../src/lib/filesystem/sync-manager.ts:71)

**Listeners:** File tree, SyncManager, Event logger

---

#### directory:created

```typescript
interface DirectoryCreatedEvent {
  path: string;
}
```

**Emitted by:** [`LocalFSAdapter`](../src/lib/filesystem/local-fs-adapter.ts:1)

**Listeners:** File tree, SyncManager

---

#### directory:deleted

```typescript
interface DirectoryDeletedEvent {
  path: string;
}
```

**Emitted by:** [`LocalFSAdapter`](../src/lib/filesystem/local-fs-adapter.ts:1)

**Listeners:** File tree, SyncManager

---

### Sync Events

#### sync:started

```typescript
interface SyncStartedEvent {
  fileCount: number;
  direction: 'toWebContainer' | 'fromWebContainer';
}
```

**Emitted by:** [`SyncManager`](../src/lib/filesystem/sync-manager.ts:71)

**Listeners:** UI sync indicator, Event logger

---

#### sync:progress

```typescript
interface SyncProgressEvent {
  current: number;
  total: number;
  currentFile: string;
}
```

**Emitted by:** [`SyncManager`](../src/lib/filesystem/sync-manager.ts:71)

**Listeners:** UI sync indicator

---

#### sync:completed

```typescript
interface SyncCompletedEvent {
  success: boolean;
  timestamp: Date;
  filesProcessed: number;
}
```

**Emitted by:** [`SyncManager`](../src/lib/filesystem/sync-manager.ts:71)

**Listeners:** UI sync indicator, Event logger

---

#### sync:error

```typescript
interface SyncErrorEvent {
  error: string;
  file?: string;
}
```

**Emitted by:** [`SyncManager`](../src/lib/filesystem/sync-manager.ts:71)

**Listeners:** UI error display, Event logger

---

#### sync:paused

```typescript
interface SyncPausedEvent {
  reason: string;
}
```

**Emitted by:** [`SyncManager`](../src/lib/filesystem/sync-manager.ts:71)

**Listeners:** UI sync indicator, Event logger

---

#### sync:resumed

```typescript
interface SyncResumedEvent {}
```

**Emitted by:** [`SyncManager`](../src/lib/filesystem/sync-manager.ts:71)

**Listeners:** UI sync indicator, Event logger

---

### WebContainer Events

#### container:booted

```typescript
interface ContainerBootedEvent {
  bootTime: number; // milliseconds
}
```

**Emitted by:** [`WebContainerManager`](../src/lib/webcontainer/manager.ts:1)

**Listeners:** UI status indicator, Event logger

---

#### container:mounted

```typescript
interface ContainerMountedEvent {
  fileCount: number;
}
```

**Emitted by:** [`WebContainerManager`](../src/lib/webcontainer/manager.ts:1)

**Listeners:** UI status indicator, Event logger

---

#### container:error

```typescript
interface ContainerErrorEvent {
  error: string;
}
```

**Emitted by:** [`WebContainerManager`](../src/lib/webcontainer/manager.ts:1)

**Listeners:** UI error display, Event logger

---

### Terminal/Process Events

#### process:started

```typescript
interface ProcessStartedEvent {
  pid: number;
  command: string;
  args: string[];
}
```

**Emitted by:** [`WebContainerManager`](../src/lib/webcontainer/manager.ts:1)

**Listeners:** Terminal component, Event logger

---

#### process:output

```typescript
interface ProcessOutputEvent {
  pid: number;
  data: string;
  type: 'stdout' | 'stderr';
}
```

**Emitted by:** [`WebContainerManager`](../src/lib/webcontainer/manager.ts:1)

**Listeners:** Terminal component

---

#### process:exited

```typescript
interface ProcessExitedEvent {
  pid: number;
  exitCode: number;
}
```

**Emitted by:** [`WebContainerManager`](../src/lib/webcontainer/manager.ts:1)

**Listeners:** Terminal component, Event logger

---

#### terminal:input

```typescript
interface TerminalInputEvent {
  data: string;
}
```

**Emitted by:** [`XTerminal`](../src/components/ide/) component

**Listeners:** [`WebContainerManager`](../src/lib/webcontainer/manager.ts:1)

---

### Permission Events

#### permission:requested

```typescript
interface PermissionRequestedEvent {
  handle: FileSystemDirectoryHandle;
}
```

**Emitted by:** [`WorkspaceContext`](../src/lib/workspace/WorkspaceContext.tsx:1)

**Listeners:** Permission manager, Event logger

---

#### permission:granted

```typescript
interface PermissionGrantedEvent {
  handle: FileSystemDirectoryHandle;
  projectId: string;
}
```

**Emitted by:** [`WorkspaceContext`](../src/lib/workspace/WorkspaceContext.tsx:1)

**Listeners:** Permission manager, Event logger

---

#### permission:denied

```typescript
interface PermissionDeniedEvent {
  handle: FileSystemDirectoryHandle;
  reason: string;
}
```

**Emitted by:** [`WorkspaceContext`](../src/lib/workspace/WorkspaceContext.tsx:1)

**Listeners:** Permission manager, Event logger

---

#### permission:expired

```typescript
interface PermissionExpiredEvent {
  projectId: string;
}
```

**Emitted by:** Permission manager

**Listeners:** UI permission display, Event logger

---

### Project Events

#### project:opened

```typescript
interface ProjectOpenedEvent {
  projectId: string;
  name: string;
}
```

**Emitted by:** [`WorkspaceContext`](../src/lib/workspace/WorkspaceContext.tsx:1)

**Listeners:** UI navigation, Event logger

---

#### project:closed

```typescript
interface ProjectClosedEvent {
  projectId: string;
}
```

**Emitted by:** [`WorkspaceContext`](../src/lib/workspace/WorkspaceContext.tsx:1)

**Listeners:** UI navigation, Event logger

---

#### project:switched

```typescript
interface ProjectSwitchedEvent {
  fromId: string | null;
  toId: string;
}
```

**Emitted by:** [`WorkspaceContext`](../src/lib/workspace/WorkspaceContext.tsx:1)

**Listeners:** UI navigation, Event logger

---

## Validation Rules

### Zod Schemas

#### Project Metadata Schema

```typescript
import { z } from 'zod';

const ProjectMetadataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  path: z.string(),
  lastOpened: z.coerce.date(),
  createdAt: z.coerce.date(),
});
```

---

#### Workspace State Schema

```typescript
const WorkspaceStateSchema = z.object({
  projectMetadata: ProjectMetadataSchema.nullable(),
  directoryHandle: z.any().nullable(), // FileSystemDirectoryHandle
  permissionState: z.enum(['granted', 'denied', 'prompt', 'unknown']),
  syncStatus: z.enum(['idle', 'syncing', 'paused', 'error']),
  syncProgress: z.object({
    current: z.number().min(0),
    total: z.number().min(0),
    currentFile: z.string(),
    direction: z.enum(['toWebContainer', 'fromWebContainer']),
  }).nullable(),
  lastSyncTime: z.coerce.date().nullable(),
  syncError: z.string().nullable(),
  autoSync: z.boolean(),
  isOpeningFolder: z.boolean(),
  exclusionPatterns: z.array(z.string()),
  isWebContainerBooted: z.boolean(),
  initialSyncCompleted: z.boolean(),
});
```

---

#### Layout Configuration Schema

```typescript
const LayoutConfigSchema = z.object({
  openFiles: z.array(z.string()),
  activeFile: z.string().nullable(),
  expandedPaths: z.array(z.string()),
  panelLayouts: z.record(z.array(z.number())),
  terminalTab: z.enum(['terminal', 'output', 'problems']),
  chatVisible: z.boolean(),
});
```

---

#### Sync Progress Schema

```typescript
const SyncProgressSchema = z.object({
  current: z.number().min(0),
  total: z.number().min(0),
  currentFile: z.string(),
  direction: z.enum(['toWebContainer', 'fromWebContainer']),
}).refine(
  (data) => data.current <= data.total,
  { message: 'current must be less than or equal to total' }
);
```

---

## Data Flow Diagrams

### File Write Flow

```
┌─────────────┐
│  User saves │
│  file in    │
│  Monaco     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  WorkspaceContext.useWorkspaceActions.writeFile()           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  1. Validate file path                                   ││
│  │  2. Acquire file lock (FileLockManager)                ││
│  │  3. Write to local FS via LocalFSAdapter               ││
│  │  4. Emit file:modified event                           ││
│  │  5. Release file lock                                  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  LocalFSAdapter.writeFile()                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  1. Get file handle                                     ││
│  │  2. Create writable stream                             ││
│  │  3. Write content                                      ││
│  │  4. Close stream                                       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  SyncManager (auto-sync enabled)                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  1. Debounce (500ms)                                    ││
│  │  2. Read file from local FS                            ││
│  │  3. Write to WebContainer FS                           ││
│  │  4. Emit sync:progress event                           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  WebContainer.writeFile()                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  1. Write to container file system                     ││
│  │  2. Return success                                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

### Project Open Flow

```
┌─────────────┐
│  User clicks│
│  "Open      │
│  Folder"    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  WorkspaceContext.useWorkspaceActions.openFolder()         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  1. Call window.showDirectoryPicker()                  ││
│  │  2. Request readwrite permission                       ││
│  │  3. Create ProjectMetadata                            ││
│  │  4. Save to IndexedDB (ProjectStore)                   ││
│  │  5. Update workspace state                            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  ProjectStore.saveProject()                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  1. Open IndexedDB transaction                        ││
│  │  2. Check for existing project                        ││
│  │  3. Update or insert project record                   ││
│  │  4. Commit transaction                                ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  SyncManager.syncToWebContainer()                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  1. Scan local FS for files                           ││
│  │  2. Apply exclusion patterns                          ││
│  │  3. Emit sync:started event                           ││
│  │  4. Batch write files to WebContainer                 ││
│  │  5. Emit sync:completed event                         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  WebContainer.mount()                                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  1. Mount files to container FS                       ││
│  │  2. Emit container:mounted event                      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

### Event Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Domain Operation (e.g., file write)                       │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  Event Emission                                             │
│  eventEmitter.emit('file:modified', { path, source })      │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  WorkspaceEventEmitter                                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  - Type checking                                        ││
│  │  - Event routing                                        ││
│  │  - Error handling                                       ││
│  └─────────────────────────────────────────────────────────┘│
└──────┬──────────────────────────────────────────────────────┘
       │
   ┌───┴───┬──────────────┬──────────────┐
   │       │              │              │
   ▼       ▼              ▼              ▼
┌─────┐ ┌─────┐      ┌─────┐      ┌─────┐
│ UI  │ │ Sync │      │ WC  │      │ Log │
│ Upd ││ List │      │ List│      │ ger │
└─────┘ └─────┘      └─────┘      └─────┘
```

---

## Conclusion

This document provides a canonical view of all data models, schemas, type definitions, API contracts, and event contracts in the Via-gent system. It serves as the single source of truth for data structures and their relationships.

All data models are defined in TypeScript with strict typing, and all events are typed with clear payload contracts. The IndexedDB schema is versioned (currently version 3) with clear migration paths.

For implementation details, refer to the source code files referenced throughout this document.

---

## Document References

| Document | Location |
|----------|----------|
| **Project Overview** | [`project-overview.md`](./project-overview.md) |
| **Architecture** | [`architecture.md`](./architecture.md) |
| **Tech Context** | [`tech-context.md`](./tech-context.md) |
| **Tech Debt** | [`tech-debt.md`](./tech-debt.md) |
| **Improvement Opportunities** | [`improvement-opportunities.md`](./improvement-opportunities.md) |
| **Roadmap** | [`roadmap-and-planning.md`](./roadmap-and-planning.md) |

---

**Document Owners:** Architecture Team  
**Review Cycle:** Quarterly  
**Next Review:** 2025-03-23