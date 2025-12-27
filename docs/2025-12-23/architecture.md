# Via-gent Architecture Documentation

**Document ID:** `docs/2025-12-23/architecture.md`  
**Version:** 1.0  
**Date:** 2025-12-23  
**Classification:** Internal  
**Target Audience:** Technical Leadership, Architects, Senior Engineers

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Architectural Principles](#architectural-principles)
4. [Component Architecture](#component-architecture)
5. [Data Flow Architecture](#data-flow-architecture)
6. [State Management Architecture](#state-management-architecture)
7. [Persistence Architecture](#persistence-architecture)
8. [Event-Driven Architecture](#event-driven-architecture)
9. [Security Architecture](#security-architecture)
10. [Performance Architecture](#performance-architecture)
11. [Deployment Architecture](#deployment-architecture)
12. [Key Architectural Decisions](#key-architectural-decisions)

---

## Introduction

Via-gent is a browser-based Integrated Development Environment (IDE) that enables developers to write, run, and debug code entirely within the browser using WebContainers technology. This document provides a comprehensive overview of the system architecture, including design principles, component interactions, data flows, and key architectural decisions.

### Architecture Goals

| Goal | Description |
|------|-------------|
| **Local-First** | User's code resides on their local machine |
| **Privacy** | All code execution happens locally in browser sandbox |
| **Performance** | Sub-second response times for common operations |
| **Extensibility** | Plugin architecture for future enhancements |
| **Reliability** | Graceful degradation and error recovery |

### Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Availability** | 99.9% (client-side) |
| **Performance** | < 2s page load, < 3s WebContainer boot |
| **Scalability** | Stateless client-side architecture |
| **Security** | No code leaves user's browser |
| **Compatibility** | Chrome/Edge with File System Access API |

---

## System Overview

### High-Level Architecture

Via-gent follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                             │
│  (React Components, Routing, UI State)                               │
├─────────────────────────────────────────────────────────────────────┤
│                        Application Layer                              │
│  (Business Logic, State Management, Event Coordination)               │
├─────────────────────────────────────────────────────────────────────┤
│                        Domain Layer                                   │
│  (File System Operations, WebContainer Management, Sync Logic)        │
├─────────────────────────────────────────────────────────────────────┤
│                        Infrastructure Layer                            │
│  (Browser APIs, IndexedDB, WebContainer API, File System Access API)  │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack Summary

| Layer | Technology |
|-------|------------|
| **Presentation** | React 19, TanStack Router, Monaco Editor, xterm.js |
| **Application** | TanStack Store, React Context, EventEmitter3 |
| **Domain** | LocalFSAdapter, SyncManager, WebContainer Manager |
| **Infrastructure** | File System Access API, IndexedDB (Dexie.js), WebContainer API |

---

## Architectural Principles

### 1. Local-First Design

**Principle:** User's code is the source of truth and resides on their local machine.

**Implementation:**
- All file operations go through [`LocalFSAdapter`](../src/lib/filesystem/local-fs-adapter.ts:1) to File System Access API
- WebContainer mirrors local files but does not modify them
- Project metadata persisted in browser's IndexedDB

**Benefits:**
- User owns their data
- Works offline (with limitations)
- No server-side storage costs

**Trade-offs:**
- Browser compatibility constraints (File System Access API)
- IndexedDB quota limitations
- No automatic cloud backup

### 2. Event-Driven Communication

**Principle:** Components communicate through events rather than direct coupling.

**Implementation:**
- [`WorkspaceEventEmitter`](../src/lib/events/workspace-events.ts:47) for all workspace events
- Typed event contracts in [`workspace-events.ts`](../src/lib/events/workspace-events.ts:1)
- Event emission at domain boundaries

**Benefits:**
- Loose coupling between components
- Easy to add new event consumers
- Clear audit trail for operations

**Trade-offs:**
- Debugging complexity with event flow
- Potential for event storm in large applications

### 3. Single Source of Truth

**Principle:** Each piece of data has a single authoritative source.

**Implementation:**
- Local file system is source of truth for file content
- IndexedDB is source of truth for project metadata
- WebContainer is derived state (mirror of local files)

**Benefits:**
- No data inconsistency
- Clear data ownership
- Simpler state management

**Trade-offs:**
- No reverse sync from WebContainer to local FS
- Manual sync required for WebContainer changes

### 4. Layer Violation Prevention

**Principle:** Components only interact with adjacent layers.

**Implementation:**
- UI components only use [`useWorkspace()`](../src/lib/workspace/WorkspaceContext.tsx:38) hook
- Application layer coordinates domain operations
- Domain layer only uses infrastructure APIs

**Benefits:**
- Clear separation of concerns
- Easier testing
- Better maintainability

**Trade-offs:**
- Additional abstraction layers
- More boilerplate code

---

## Component Architecture

### Presentation Layer

#### IDE Components

| Component | Purpose | Location |
|-----------|---------|----------|
| [`MonacoEditor`](../src/components/ide/) | Code editing with syntax highlighting | `src/components/ide/` |
| [`XTerminal`](../src/components/ide/) | Terminal emulation | `src/components/ide/` |
| [`FileTree`](../src/components/ide/) | File browser | `src/components/ide/` |
| [`PreviewPanel`](../src/components/ide/) | Web preview | `src/components/ide/` |
| [`AgentChatPanel`](../src/components/ide/) | AI chat interface | `src/components/ide/` |

#### Layout Components

| Component | Purpose | Location |
|-----------|---------|----------|
| [`IDELayout`](../src/components/layout/) | Main IDE layout with resizable panels | `src/components/layout/` |
| [`IDEHeaderBar`](../src/components/layout/) | Top navigation bar | `src/components/layout/` |

#### UI Components

| Component | Purpose | Location |
|-----------|---------|----------|
| [`Toast`](../src/components/ui/) | Toast notifications | `src/components/ui/` |

### Application Layer

#### State Management

| Component | Purpose | Location |
|-----------|---------|----------|
| [`WorkspaceContext`](../src/lib/workspace/WorkspaceContext.tsx:1) | Centralized workspace state | `src/lib/workspace/` |
| [`useWorkspaceState`](../src/lib/workspace/hooks/useWorkspaceState.ts:1) | Workspace state hook | `src/lib/workspace/hooks/` |
| [`useWorkspaceActions`](../src/lib/workspace/hooks/useWorkspaceActions.ts:1) | Workspace actions hook | `src/lib/workspace/hooks/` |
| [`useSyncOperations`](../src/lib/workspace/hooks/useSyncOperations.ts:1) | Sync operations hook | `src/lib/workspace/hooks/` |

#### Event Coordination

| Component | Purpose | Location |
|-----------|---------|----------|
| [`WorkspaceEventEmitter`](../src/lib/events/workspace-events.ts:47) | Event bus | `src/lib/events/` |
| [`useEventBusEffects`](../src/lib/workspace/hooks/useEventBusEffects.ts:1) | Event side effects | `src/lib/workspace/hooks/` |

### Domain Layer

#### File System

| Component | Purpose | Location |
|-----------|---------|----------|
| [`LocalFSAdapter`](../src/lib/filesystem/local-fs-adapter.ts:1) | File System Access API wrapper | `src/lib/filesystem/` |
| [`SyncManager`](../src/lib/filesystem/sync-manager.ts:71) | File sync coordination | `src/lib/filesystem/` |
| [`FileToolsFacade`](../src/lib/agent/facades/file-tools-impl.ts:34) | Agent file operations API | `src/lib/agent/facades/` |

#### WebContainer

| Component | Purpose | Location |
|-----------|---------|----------|
| [`WebContainer Manager`](../src/lib/webcontainer/manager.ts:1) | WebContainer lifecycle | `src/lib/webcontainer/` |
| [`boot()`](../src/lib/webcontainer/manager.ts:65) | Initialize WebContainer | `src/lib/webcontainer/manager.ts` |
| [`mount()`](../src/lib/webcontainer/manager.ts:139) | Mount file system | `src/lib/webcontainer/manager.ts` |
| [`spawn()`](../src/lib/webcontainer/manager.ts:218) | Spawn processes | `src/lib/webcontainer/manager.ts` |

### Infrastructure Layer

#### Persistence

| Component | Purpose | Location |
|-----------|---------|----------|
| [`Dexie Database`](../src/lib/state/dexie-db.ts:133) | IndexedDB wrapper | `src/lib/state/` |
| [`ProjectStore`](../src/lib/workspace/project-store.ts:1) | Project metadata operations | `src/lib/workspace/` |

#### Browser APIs

| API | Purpose |
|-----|---------|
| **File System Access API** | Local file system access |
| **IndexedDB** | Client-side persistence |
| **WebContainer API** | Code execution sandbox |

---

## Data Flow Architecture

### File Sync Flow

```
User Action (e.g., Save File)
        │
        ▼
┌─────────────────┐
│  Monaco Editor  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WorkspaceContext│
│  (useWorkspace) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SyncManager    │
│  .writeFile()   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌─────────────┐
│ Local  │ │ WebContainer│
│   FS   │ │     FS      │
└────────┘ └─────────────┘
    │         │
    └────┬────┘
         │
         ▼
┌─────────────────┐
│  EventEmitter  │
│  file:modified  │
└─────────────────┘
```

### Project Open Flow

```
User Clicks "Open Folder"
        │
        ▼
┌─────────────────┐
│  WorkspaceContext│
│  .openFolder()   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  window.show    │
│  DirectoryPicker│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  LocalFSAdapter │
│  .requestAccess │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ProjectStore   │
│  .saveProject() │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SyncManager    │
│  .syncToWC()    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WebContainer   │
│  .mount()       │
└─────────────────┘
```

### Event Flow

```
Domain Event (e.g., file:modified)
        │
        ▼
┌─────────────────┐
│  EventEmitter   │
│  .emit()        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌─────────────┐
│ UI     │ │ SyncManager │
│ Update │ │  Listener   │
└────────┘ └─────────────┘
```

---

## State Management Architecture

### Current State Management

Via-gent currently uses a hybrid approach combining React Context and TanStack Store:

```
┌─────────────────────────────────────────────────────────────────┐
│                    WorkspaceContext Provider                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    useWorkspaceState()                        ││
│  │  - 13 state variables (useState)                            ││
│  │  - 4 refs (useRef)                                          ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   useWorkspaceActions()                       ││
│  │  - 7 action functions (useCallback)                        ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    useSyncOperations()                       ││
│  │  - Sync logic                                               ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   useEventBusEffects()                       ││
│  │  - Event listeners                                          ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    useInitialSync()                          ││
│  │  - Initial sync logic                                       ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
         │
         │ Context Value (13 state + 7 actions + 3 refs + eventBus)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Consumers (useWorkspace())                    │
│  - IDELayout                                                   │
│  - MonacoEditor                                                │
│  - XTerminal                                                   │
│  - FileTree                                                    │
│  - etc.                                                        │
└─────────────────────────────────────────────────────────────────┘
```

### State Variables

| State | Type | Purpose |
|-------|------|---------|
| `projectMetadata` | `ProjectMetadata \| null` | Current project information |
| `directoryHandle` | `FileSystemDirectoryHandle \| null` | FSA handle for directory access |
| `permissionState` | `FsaPermissionState` | Current permission state |
| `syncStatus` | `SyncStatus` | Current sync status |
| `syncProgress` | `SyncProgress \| null` | Sync progress information |
| `lastSyncTime` | `Date \| null` | Last successful sync timestamp |
| `syncError` | `string \| null` | Last sync error message |
| `autoSync` | `boolean` | Auto-sync enabled flag |
| `isOpeningFolder` | `boolean` | Folder open in progress |
| `exclusionPatterns` | `string[]` | File sync exclusion patterns |
| `isWebContainerBooted` | `boolean` | WebContainer boot status |
| `initialSyncCompleted` | `boolean` | Initial sync completion flag |

### Planned Migration (Epic 27)

Via-gent plans to migrate to Zustand with sliced stores:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Zustand Stores                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  useWorkspaceStore│  │  useSyncStore     │  │  usePermission │ │
│  │  - project       │  │  - status         │  │    Store       │ │
│  │  - handle        │  │  - progress       │  │  - state        │ │
│  │  - patterns      │  │  - lastSync       │  │  - history      │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Persistence Middleware                          │
│  - Sync to IndexedDB on state change                            │
│  - Load from IndexedDB on initialization                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Persistence Architecture

### IndexedDB Schema

Via-gent uses Dexie.js for type-safe IndexedDB operations:

```typescript
// Schema Version 3
class ViaGentDatabase extends Dexie {
    projects!: Table<ProjectRecord, string>;
    ideState!: Table<IDEStateRecord, string>;
    conversations!: Table<ConversationRecord, string>;
    taskContexts!: Table<TaskContextRecord, string>;      // Epic 25 prep
    toolExecutions!: Table<ToolExecutionRecord, string>;  // Epic 25 prep
}
```

### Data Models

#### ProjectRecord

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique project identifier |
| `name` | `string` | Project display name |
| `path` | `string` | Display path (not actual path) |
| `lastOpened` | `Date` | Last opened timestamp |
| `createdAt` | `Date` | Creation timestamp |

#### IDEStateRecord

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | `string` | Associated project ID |
| `openFiles` | `string[]` | List of open files |
| `activeFile` | `string \| null` | Currently active file |
| `expandedPaths` | `string[]` | Expanded directory paths |
| `panelLayouts` | `Record<string, number[]>` | Panel size configurations |
| `terminalTab` | `'terminal' \| 'output' \| 'problems'` | Active terminal tab |
| `chatVisible` | `boolean` | Chat panel visibility |
| `updatedAt` | `Date` | Last update timestamp |

#### ConversationRecord

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique conversation ID |
| `projectId` | `string` | Associated project ID |
| `messages` | `unknown[]` | Chat messages |
| `toolResults` | `unknown[]` | Tool execution results |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last update timestamp |

#### TaskContextRecord (Epic 25)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique task ID |
| `projectId` | `string` | Associated project ID |
| `agentId` | `string` | Executing agent ID |
| `status` | `TaskStatus` | Task status |
| `description` | `string` | Task description |
| `targetFiles` | `string[]` | Files being worked on |
| `checkpoint` | `unknown` | LangGraph checkpoint data |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last update timestamp |

#### ToolExecutionRecord (Epic 25)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique execution ID |
| `taskId` | `string` | Associated task ID |
| `toolName` | `string` | Tool name |
| `input` | `unknown` | Tool input parameters |
| `output` | `unknown` | Tool output |
| `status` | `'pending' \| 'success' \| 'error'` | Execution status |
| `duration` | `number` | Execution time (ms) |
| `createdAt` | `Date` | Creation timestamp |

### Migration Strategy

Via-gent is migrating from legacy idb-based persistence to Dexie.js:

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Create Dexie schema | ✅ Complete |
| **Phase 2** | Migrate ProjectStore operations | 🚧 In Progress |
| **Phase 3** | Remove legacy idb implementation | ⏳ Pending |
| **Phase 4** | Data migration from legacy DB | ⏳ Pending |

---

## Event-Driven Architecture

### Event Types

Via-gent defines typed events in [`workspace-events.ts`](../src/lib/events/workspace-events.ts:1):

#### File System Events

| Event | Payload | Description |
|-------|---------|-------------|
| `file:created` | `{ path, source, lockAcquired?, lockReleased? }` | File created |
| `file:modified` | `{ path, source, content?, lockAcquired?, lockReleased? }` | File modified |
| `file:deleted` | `{ path, source, lockAcquired?, lockReleased? }` | File deleted |
| `directory:created` | `{ path }` | Directory created |
| `directory:deleted` | `{ path }` | Directory deleted |

#### Sync Events

| Event | Payload | Description |
|-------|---------|-------------|
| `sync:started` | `{ fileCount, direction }` | Sync started |
| `sync:progress` | `{ current, total, currentFile }` | Sync progress |
| `sync:completed` | `{ success, timestamp, filesProcessed }` | Sync completed |
| `sync:error` | `{ error, file? }` | Sync error |
| `sync:paused` | `{ reason }` | Sync paused |
| `sync:resumed` | - | Sync resumed |

#### WebContainer Events

| Event | Payload | Description |
|-------|---------|-------------|
| `container:booted` | `{ bootTime }` | WebContainer booted |
| `container:mounted` | `{ fileCount }` | Files mounted |
| `container:error` | `{ error }` | WebContainer error |

#### Terminal/Process Events

| Event | Payload | Description |
|-------|---------|-------------|
| `process:started` | `{ pid, command, args }` | Process started |
| `process:output` | `{ pid, data, type }` | Process output |
| `process:exited` | `{ pid, exitCode }` | Process exited |
| `terminal:input` | `{ data }` | Terminal input |

#### Permission Events

| Event | Payload | Description |
|-------|---------|-------------|
| `permission:requested` | `{ handle }` | Permission requested |
| `permission:granted` | `{ handle, projectId }` | Permission granted |
| `permission:denied` | `{ handle, reason }` | Permission denied |
| `permission:expired` | `{ projectId }` | Permission expired |

#### Project Events

| Event | Payload | Description |
|-------|---------|-------------|
| `project:opened` | `{ projectId, name }` | Project opened |
| `project:closed` | `{ projectId }` | Project closed |
| `project:switched` | `{ fromId, toId }` | Project switched |

### Event Flow

```
┌─────────────┐
│  Domain     │
│  Operation  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Event      │
│  Emission   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│         WorkspaceEventEmitter               │
│  (Typed event contracts)                   │
└──────┬──────────────────────────────────────┘
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

## Security Architecture

### Security Principles

| Principle | Implementation |
|-----------|----------------|
| **Local-First** | Code never leaves user's browser |
| **Sandboxed Execution** | WebContainer provides isolated environment |
| **Permission-Based Access** | File System Access API requires user consent |
| **Cross-Origin Isolation** | COOP/COEP headers for SharedArrayBuffer |

### Browser Security

#### Cross-Origin Isolation Headers

```typescript
// vite.config.ts
res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
```

**Purpose:** Enable SharedArrayBuffer for WebContainer performance.

#### File System Access API

```typescript
// Permission states
type FsaPermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

// Permission request
const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
```

**Purpose:** User grants explicit permission to access local files.

### WebContainer Security

WebContainer provides a sandboxed environment for code execution:

| Security Feature | Description |
|------------------|-------------|
| **Isolated File System** | Cannot access host file system |
| **Network Restrictions** | Limited network access |
| **Resource Limits** | CPU/memory constraints |
| **No Persistent State** | Clean slate on reload |

### Data Privacy

| Data Type | Storage | Privacy |
|-----------|---------|---------|
| **Source Code** | Local FS | User-controlled |
| **Project Metadata** | IndexedDB | Browser-local |
| **Chat History** | IndexedDB | Browser-local |
| **Execution Logs** | In-memory | Not persisted |

---

## Performance Architecture

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Initial Page Load** | < 2s | Lighthouse |
| **Time to Interactive** | < 5s | Lighthouse |
| **WebContainer Boot** | < 3s | Custom logging |
| **File Sync (100 files)** | < 3s | Custom logging |
| **File Write** | < 500ms | Custom logging |

### Performance Optimizations

#### 1. Code Splitting

```typescript
// TanStack Router file-based routing
// src/routes/workspace/$projectId.tsx
// src/routes/dashboard.tsx
// Each route is automatically code-split
```

#### 2. Lazy Loading

```typescript
// Monaco Editor loads languages on-demand
import { loader } from '@monaco-editor/react';
loader.config().then(/* ... */);
```

#### 3. Debounced Sync

```typescript
// File sync uses debounced batch operations
const debouncedSync = debounce(() => {
    syncManager.syncToWebContainer();
}, 500);
```

#### 4. Exclusion Patterns

```typescript
// Large directories excluded from sync
const EXTENDED_DEFAULT_PATTERNS = [
    '.git',
    'node_modules',
    '.DS_Store',
    'Thumbs.db',
    'dist',
    'build',
];
```

### Performance Monitoring

| Metric | Collection Method |
|--------|------------------|
| **WebContainer Boot Time** | `container:booted` event |
| **Sync Duration** | `sync:completed` event |
| **File Write Duration** | Custom logging in `SyncManager` |
| **Page Load Time** | Lighthouse CI |

---

## Deployment Architecture

### Static Hosting

Via-gent is deployed as a static site:

```
┌─────────────┐
│   GitHub    │
│  Repository │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  GitHub     │
│  Actions    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Vite      │
│   Build     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Netlify   │
│   Deploy    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Global    │
│   CDN       │
└─────────────┘
```

### Deployment Pipeline

1. **Push to GitHub** → Triggers GitHub Actions
2. **Run Tests** → `pnpm test`
3. **Build** → `pnpm build`
4. **Deploy** → Netlify CLI
5. **Cache Invalidation** → Netlify CDN

### Edge Functions

Netlify edge functions provide security headers:

```typescript
// netlify/edge-functions/add-headers.ts
export default async (request: Request) => {
  const response = await fetch(request);
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  newResponse.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  return newResponse;
};
```

---

## Key Architectural Decisions

### Decision 1: Client-Side Only Architecture

**Context:** Via-gent runs entirely in the browser with no backend server.

**Rationale:**
- Zero infrastructure costs
- User privacy (code never leaves browser)
- Simplified deployment (static hosting)
- No server maintenance

**Trade-offs:**
- Limited to browser capabilities
- No server-side processing
- IndexedDB quota limitations
- No automatic cloud backup

**Alternatives Considered:**
- Server-side rendering (rejected - incompatible with WebContainers)
- Hybrid architecture (rejected - adds complexity)

### Decision 2: Local FS as Source of Truth

**Context:** User's local file system is the authoritative source for code.

**Rationale:**
- User owns their data
- Works offline (with limitations)
- Familiar mental model for developers
- No vendor lock-in

**Trade-offs:**
- No reverse sync from WebContainer
- Manual sync required for WebContainer changes
- Browser compatibility constraints

**Alternatives Considered:**
- Cloud storage (rejected - privacy concerns)
- WebContainer as source of truth (rejected - no persistence)

### Decision 3: WebContainer for Code Execution

**Context:** WebContainer API provides Node.js execution in browser.

**Rationale:**
- No server required
- Isolated execution environment
- Fast startup (compared to VMs)
- Native Node.js compatibility

**Trade-offs:**
- Browser compatibility (Chrome/Edge only)
- Requires cross-origin isolation headers
- Limited to Node.js ecosystem

**Alternatives Considered:**
- Server-side execution (rejected - requires backend)
- WebAssembly (rejected - limited Node.js support)

### Decision 4: React Context for State Management

**Context:** Using React Context + TanStack Store for state management.

**Rationale:**
- Familiar to React developers
- Built-in React integration
- Simple for small to medium apps
- Good TypeScript support

**Trade-offs:**
- Performance issues with large contexts
- Prop drilling for nested components
- Re-renders on context value changes

**Alternatives Considered:**
- Redux (rejected - overkill for this use case)
- Zustand (selected for future migration - Epic 27)

### Decision 5: IndexedDB for Persistence

**Context:** Using IndexedDB for project metadata persistence.

**Rationale:**
- Browser-native storage
- Large storage capacity (hundreds of MB)
- Asynchronous API
- Works offline

**Trade-offs:**
- Quota limitations
- Not portable across devices
- No automatic cloud backup

**Alternatives Considered:**
- LocalStorage (rejected - too small, synchronous)
- Cloud storage (rejected - privacy concerns)

---

## Conclusion

Via-gent's architecture prioritizes local-first design, user privacy, and browser-native capabilities. The layered architecture provides clear separation of concerns, while the event-driven communication pattern enables loose coupling between components.

The system is currently in active development with several migration efforts underway (state management to Zustand, persistence to Dexie.js). These migrations aim to improve performance, type safety, and maintainability.

The architecture is designed to be extensible, with clear integration points for future features such as AI agent orchestration (Epic 25) and advanced collaboration capabilities.

---

## Document References

| Document | Location |
|----------|----------|
| **Project Overview** | [`project-overview.md`](./project-overview.md) |
| **Data & Contracts** | [`data-and-contracts.md`](./data-and-contracts.md) |
| **Tech Context** | [`tech-context.md`](./tech-context.md) |
| **Tech Debt** | [`tech-debt.md`](./tech-debt.md) |
| **Improvement Opportunities** | [`improvement-opportunities.md`](./improvement-opportunities.md) |
| **Roadmap** | [`roadmap-and-planning.md`](./roadmap-and-planning.md) |

---

**Document Owners:** Architecture Team  
**Review Cycle:** Quarterly  
**Next Review:** 2025-03-23