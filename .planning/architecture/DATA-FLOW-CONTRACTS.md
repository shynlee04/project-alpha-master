# Data Flow Contracts

**Created:** 2026-01-31
**Phase:** 01 - State Architecture Contracts
**Plan:** 02 - Data Flow Contracts

---

## Purpose

This document defines the **read/write ownership** for all data flows in Project Alpha. Every piece of data has ONE canonical owner and ONE flow path.

**Goals:**
- Prevent multiple systems from writing the same data
- Establish clear event propagation chains
- Enable predictable state management

---

## Core Data Flows

### Flow 1: Project Load Flow

**Trigger:** User navigates to `/$projectId`

| Step | Action | Layer |
|------|--------|-------|
| 1 | Route loader calls `waitForHydration()` | Routes |
| 2 | Query Dexie for `ProjectRecord` | Persisted |
| 3 | `fromRecord()` converts to `Project` entity | Domain |
| 4 | `ProjectContextProvider` initializes | Infrastructure |
| 5 | Storage gateway created based on `storageType` | Infrastructure |
| 6 | Platform detection determines default plugins | Session |
| 7 | `ResponsiveLayout` renders with grid system | UI |

**Read From:** Dexie (`projects` table)
**Write To:** Zustand (session state only - `activeProjectId`)
**Events Emitted:** `project:loaded`, `plugins:initialized`
**Subscribers:** 
- `PluginPanelContainer` (renders active plugins)
- `FileTree` (loads file structure)
- `Chat` (loads project threads)

---

### Flow 2: File Open Flow

**Trigger:** User clicks file in FileTree OR agent requests file read

| Step | Action | Layer |
|------|--------|-------|
| 1 | FileTree dispatches `file:open` event | UI |
| 2 | `PluginCoordinationContext` receives event | Session |
| 3 | Route to appropriate plugin (Monaco/Notes) | Session |
| 4 | Plugin calls `projectContext.readFile(path)` | Session |
| 5 | `StorageGateway` delegates to adapter | Infrastructure |
| 6 | Adapter reads from FSA or IndexedDB | File |
| 7 | Content returned to requesting plugin | UI |

**Read From:** 
- Desktop: FSA (real file system)
- Mobile: IndexedDB via Dexie

**Write To:** 
- Monaco buffer (temporary, in-memory)
- Notes editor state (temporary, in-memory)

**Events Emitted:** `file:opened`, `editor:focus`
**Subscribers:**
- Monaco plugin (syntax highlighting, LSP)
- Notes plugin (markdown rendering)
- TabBar (update open tabs)

---

### Flow 3: File Save Flow

**Trigger:** User saves file (Cmd+S) OR auto-save timer OR agent writes file

| Step | Action | Layer |
|------|--------|-------|
| 1 | Editor calls `projectContext.saveFile(path, content)` | UI |
| 2 | `ProjectContext` routes to `StorageGateway` | Session |
| 3 | Gateway validates and delegates to adapter | Infrastructure |
| 4 | Adapter writes to FSA or IndexedDB | File |
| 5 | `file:changed` event emitted via event bus | Infrastructure |
| 6 | FileTree refreshes on event | UI |
| 7 | Other plugins notified of change | UI |

**Read From:** Editor buffer (Monaco/Notes)
**Write To:**
- Desktop: Real file via FSA
- Mobile: IndexedDB via Dexie (`fileContents` table)

**Events Emitted:** `file:saved`, `file:changed`
**Subscribers:**
- FileTree (refresh display)
- Other editor instances (sync content)
- Chat (notify agent if relevant)
- RAG indexer (re-index if enabled)

---

### Flow 4: Project Settings Change Flow

**Trigger:** User modifies project settings in Settings UI

| Step | Action | Layer |
|------|--------|-------|
| 1 | Settings form submits | UI |
| 2 | Validation in domain service | Domain |
| 3 | Update Dexie `projects` table | Persisted |
| 4 | `useLiveQuery` reactivity triggers | Infrastructure |
| 5 | All components using query re-render | UI |

**Read From:** Settings form values
**Write To:** Dexie (`projects` table, `settings` field)
**Events Emitted:** `project:settings:updated`
**Subscribers:**
- All components using `useLiveQuery()`
- Plugin system (for capability changes)
- Theme provider (for theme changes)

**Key Principle:** NO Zustand persist here. Dexie is source of truth. `useLiveQuery()` provides reactivity.

---

### Flow 5: Thread Message Flow

**Trigger:** User sends message in Chat OR agent generates response

| Step | Action | Layer |
|------|--------|-------|
| 1 | Chat input submits message | UI |
| 2 | Create `MessageRecord` in Dexie | Persisted |
| 3 | Call LLM via TanStack AI SDK | Infrastructure |
| 4 | Stream response tokens | Infrastructure |
| 5 | Update `MessageRecord` with response | Persisted |
| 6 | `useLiveQuery` updates message list | UI |

**Read From:** 
- User input (new message)
- Dexie (`threads`, `messages` tables)
- RAG context (if enabled)

**Write To:** Dexie (`messages` table)
**Events Emitted:** `message:created`, `message:updated`, `thread:updated`
**Subscribers:**
- MessageList component
- Thread sidebar (update preview)
- Token counter (context tracking)

---

### Flow 6: Plugin State Sync Flow

**Trigger:** Plugin state changes (panel resize, focus, selection)

| Step | Action | Layer |
|------|--------|-------|
| 1 | Plugin updates local state | UI |
| 2 | `PluginCoordinationContext` notified | Session |
| 3 | Broadcast to other plugins if needed | Session |
| 4 | Layout changes persisted to Dexie | Persisted |
| 5 | Zustand UI state updated (transient) | UI |

**Read From:** Plugin components
**Write To:**
- Zustand (transient UI state - panel sizes, focus)
- Dexie (persistent layout preferences - via coordination store)

**Events Emitted:** `plugin:state:changed`, `layout:changed`
**Subscribers:**
- Other plugin instances
- Layout components
- Coordination store

---

## Ownership Matrix

| Data Type | Owner (Write) | Readers | Sync Mechanism |
|-----------|---------------|---------|----------------|
| **Project metadata** | Dexie | All via `useLiveQuery()` | Reactive query |
| **Active project ID** | Zustand | ProjectContext | Hydration on mount |
| **Open tabs** | Zustand (session) | TabBar, Plugins | Event bus |
| **File content** | FSA/IDB via gateway | Monaco, Notes | Event bus + cache |
| **Thread messages** | Dexie | Chat via `useLiveQuery()` | Reactive query |
| **Plugin layout** | Dexie | Layout components | Hydration + events |
| **UI transient state** | Zustand (NO persist) | Components | Direct subscription |
| **User preferences** | Dexie | Settings, Theme | Reactive query |
| **API credentials** | Dexie (encrypted) | Agent services | Secure access |
| **RAG embeddings** | Dexie / SQLite+OPFS | Search service | Index on change |

---

## Layer Ownership Rules

### UI Layer (Zustand - NO persist)
**Owns:**
- Panel open/closed states
- Selection state
- Hover/focus states
- Transient form values
- Active editor cursor position

**Does NOT own:**
- Project data (use `useLiveQuery()`)
- User preferences (use `useLiveQuery()`)
- File content (use gateway)

---

### Session Layer (Zustand + Dexie Hydration)
**Owns:**
- Active project reference
- Open editor tabs (session-scoped)
- Plugin coordination state

**Does NOT own:**
- Persisted preferences (hydrate from Dexie)
- File content (delegate to gateway)

---

### Persisted Layer (Dexie.js)
**Owns:**
- Projects metadata
- Conversation threads
- User preferences
- Layout configurations
- API credentials

**Access Pattern:**
```typescript
// ✅ CORRECT: Use useLiveQuery for reactive reads
const projects = useLiveQuery(() => db.projects.toArray());

// ✅ CORRECT: Direct Dexie for writes
await db.projects.update(projectId, { lastAccessed: Date.now() });

// ❌ WRONG: Storing Dexie data in Zustand persist
```

---

### File Layer (FSA/SQLite+OPFS)
**Owns:**
- Actual file content (source code, notes)
- File system structure

**Access Pattern:**
```typescript
// ✅ CORRECT: Always go through gateway
const content = await projectContext.readFile(path);
await projectContext.saveFile(path, content);

// ❌ WRONG: Direct FSA/IDB access
const handle = await showOpenFilePicker(); // NO!
```

---

## Event Bus Contracts

### File Events (`file-event-bus.ts`)

| Event | Payload | Emitter | Subscribers |
|-------|---------|---------|-------------|
| `file:opened` | `{ path, content, source }` | StorageGateway | Editors, TabBar |
| `file:saved` | `{ path, success }` | StorageGateway | FileTree, RAG |
| `file:changed` | `{ path, changeType }` | StorageGateway | All editors |
| `file:deleted` | `{ path }` | StorageGateway | FileTree, Editors |
| `file:renamed` | `{ oldPath, newPath }` | StorageGateway | All consumers |

### Cross-Workspace Events (`cross-workspace-event-bus.ts`)

| Event | Payload | Emitter | Subscribers |
|-------|---------|---------|-------------|
| `project:loaded` | `{ projectId, storageType }` | Route loader | All plugins |
| `project:unloaded` | `{ projectId }` | Route change | Cleanup handlers |
| `plugin:activated` | `{ pluginId, panelId }` | Coordination | Layout, Other plugins |
| `plugin:deactivated` | `{ pluginId }` | Coordination | Cleanup handlers |

---

## Conflict Prevention

### Rule 1: Single Writer Principle
Each data type has exactly ONE writer:
- Project metadata → Dexie only
- File content → Gateway only
- UI state → Zustand only

### Rule 2: Event-Driven Updates
Changes propagate via events, not polling:
- File changes → `file:changed` event
- Settings changes → `useLiveQuery()` reactivity
- UI changes → Zustand subscriptions

### Rule 3: Optimistic Updates with Rollback
For user-perceived responsiveness:
```typescript
// Update UI optimistically
setOptimisticState(newValue);

try {
  await persistChange(newValue);
} catch (error) {
  // Rollback on failure
  setOptimisticState(previousValue);
  showError(error);
}
```

---

## Anti-Patterns (FORBIDDEN)

```typescript
// ❌ FORBIDDEN: Zustand persist for Dexie data
const useProjectStore = create(
  persist((set) => ({
    projects: [], // Should be in Dexie!
  }), { name: 'projects' })
);

// ❌ FORBIDDEN: Direct file access
const handle = await window.showOpenFilePicker();
const file = await handle.getFile();

// ❌ FORBIDDEN: Multiple writers for same data
// In component A:
await db.projects.update(id, { name: 'A' });
// In component B (same time):
await db.projects.update(id, { name: 'B' });
// Result: Race condition!

// ✅ CORRECT: Centralized update via service
await projectService.rename(id, 'New Name');
```

---

*Data Flow Contracts: 2026-01-31*
*Phase: 01-state-architecture-contracts*
*Plan: 02*
