# Persistence Strategy Documentation

**Document ID**: P2-PERSIST-2025-12-26  
**Created**: 2025-12-26T18:58:00Z  
**Status**: Completed

## Overview

This document defines the persistence strategy for Via-gent codebase, clarifying when to use IndexedDB, localStorage, or ephemeral (in-memory) state.

## Persistence Mechanisms

### 1. IndexedDB (Large Data Persistence)

**Use Case**: Project data, conversations, and other large datasets  
**Implementation**: Dexie ORM  
**Storage Location**: Browser's IndexedDB  
**Persistence Duration**: Persistent across browser sessions

**When to Use IndexedDB**:
- **Project Metadata**: Project configurations, file lists, sync state
- **Conversations**: AI chat history and message threads
- **Large Datasets**: Any data exceeding 5KB or requiring complex queries
- **Structured Data**: Data requiring indexed queries or relationships

**IndexedDB Usage in Via-gent**:

| Data Type | Store | Purpose | Key Schema |
|------------|-------|---------|-------------|
| Projects | `ProjectStore` (Dexie) | Project metadata, file lists, sync state | `id`, `name`, `path`, `lastSyncedAt` |
| Conversations | `ConversationStore` (Dexie) | AI chat history, message threads | `id`, `agentId`, `messages[]`, `createdAt` |
| IDE State | `IDEStore` (Zustand with Dexie persistence) | Open files, active file, panels, terminal tab, chat visibility | `openFiles[]`, `activeFile`, `panels`, `terminalTab`, `chatVisible` |

**IndexedDB Schema Example**:
```typescript
// src/lib/persistence/db.ts
const db = new Dexie('via-gent-db', {
  projects: '++id, name, path, lastSyncedAt',
  conversations: '++id, agentId, messages, createdAt',
  ideState: '++id, openFiles, activeFile, panels, terminalTab, chatVisible'
});
```

**Advantages**:
- Large storage capacity (hundreds of MB to GB)
- Asynchronous operations (non-blocking)
- Indexed queries for fast lookups
- Transaction support for data consistency
- Persists across browser sessions and restarts

**Disadvantages**:
- More complex API than localStorage
- Requires async/await patterns
- IndexedDB not supported in some private browsing modes

### 2. localStorage (Small Data Persistence)

**Use Case**: User preferences, agent configurations, small configuration data  
**Implementation**: Browser's localStorage API  
**Storage Location**: Browser's localStorage  
**Persistence Duration**: Persistent across browser sessions

**When to Use localStorage**:
- **User Preferences**: Theme, language, UI settings
- **Agent Configurations**: Selected agent, provider settings, API keys (if not sensitive)
- **Session Settings**: Last used features, recent selections
- **Small Configuration**: Data under 5KB or simple key-value pairs

**localStorage Usage in Via-gent**:

| Data Type | Key Pattern | Purpose | Example |
|------------|--------------|---------|----------|
| Agent Config | `agent:*` | Agent selection and settings | `agent:activeAgentId`, `agent:preferredProvider` |
| User Preferences | `pref:*` | User UI preferences | `pref:theme`, `pref:language`, `pref:panelLayout` |
| Session State | `session:*` | Session-specific settings | `session:lastProjectId`, `session:recentFiles` |

**localStorage Schema Example**:
```typescript
// Agent configuration
localStorage.setItem('agent:activeAgentId', 'agent-123');
localStorage.setItem('agent:preferredProvider', 'openrouter');

// User preferences
localStorage.setItem('pref:theme', 'dark');
localStorage.setItem('pref:language', 'en');

// Session state
localStorage.setItem('session:lastProjectId', 'project-456');
```

**Advantages**:
- Simple synchronous API
- Easy to use for key-value pairs
- Persists across browser sessions
- Widely supported

**Disadvantages**:
- Limited storage (typically 5-10MB)
- No indexing or complex queries
- String-only storage (requires JSON serialization)
- Blocking operations (can freeze UI)

### 3. Ephemeral State (In-Memory)

**Use Case**: Session-specific state, temporary data, UI state that resets on refresh  
**Implementation**: React state (useState, useReducer) or Zustand stores  
**Storage Location**: JavaScript memory  
**Persistence Duration**: Lost on page refresh or browser restart

**When to Use Ephemeral State**:
- **UI State**: Panel visibility, modal states, hover states
- **Temporary Data**: Form inputs, search queries, filter states
- **Session State**: Data that should reset between sessions
- **Computed Values**: Derived state from other data

**Ephemeral State Usage in Via-gent**:

| State Type | Store | Purpose | Example |
|------------|-------|---------|----------|
| Status Bar | `useStatusBarStore` (Zustand) | WC status, sync status, cursor position, file type | `wcStatus: 'booted'`, `syncStatus: 'syncing'` |
| File Sync Status | `useFileSyncStatusStore` (Zustand) | Sync progress, file operation status | `progress: 50`, `operation: 'uploading'` |
| Agent Selection | `useAgentSelectionStore` (Zustand) | Currently selected agent | `selectedAgentId: 'agent-123'` |
| UI State | React Context/useState | Panel visibility, modal states, form inputs | `isChatPanelOpen: true`, `modalVisible: false` |

**Ephemeral State Example**:
```typescript
// Zustand store (ephemeral)
const useStatusBarStore = create<StatusBarState>((set) => ({
  wcStatus: 'idle',
  syncStatus: 'idle',
  setWCStatus: (status) => set({ wcStatus: status }),
  setSyncStatus: (status) => set({ syncStatus: status }),
}));

// React state (ephemeral)
const [isModalOpen, setIsModalOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
```

**Advantages**:
- Fast access (no I/O operations)
- Simple API (useState, useReducer)
- No storage limits
- Automatic cleanup on page refresh

**Disadvantages**:
- Lost on page refresh or browser restart
- Not persisted across sessions
- Can cause data loss if user accidentally refreshes

## Decision Matrix

| Data Characteristic | IndexedDB | localStorage | Ephemeral |
|-------------------|-----------|--------------|-------------|
| Size | Large (MB-GB) | Small (<10MB) | Unlimited |
| Persistence | Cross-session | Cross-session | Session-only |
| Access Speed | Async (fast) | Sync (fast) | Instant |
| Query Support | Indexed queries | Key-value only | N/A |
| Complexity | High | Low | Low |
| Use Case | Projects, conversations | Preferences, settings | UI state, temporary data |

## Persistence Guidelines

### 1. Choose the Right Mechanism

**IndexedDB** when:
- Storing large datasets (>5KB)
- Needing indexed queries or relationships
- Requiring transaction support
- Persisting across sessions

**localStorage** when:
- Storing user preferences and settings
- Storing small configuration data (<5KB)
- Needing simple key-value access
- Persisting across sessions

**Ephemeral** when:
- Storing UI state that resets on refresh
- Storing temporary form data or search queries
- Storing computed values
- Data that should not persist across sessions

### 2. Data Size Limits

**localStorage Quota**: Typically 5-10MB total  
**IndexedDB Quota**: Typically 50-60% of available disk space  
**Recommendation**: Compress large data before storing in localStorage

### 3. Data Serialization

**IndexedDB**: Automatically handles complex objects via Dexie  
**localStorage**: Requires JSON.stringify/parse for objects

**Example**:
```typescript
// localStorage (manual serialization)
const data = { id: 1, name: 'Test' };
localStorage.setItem('myData', JSON.stringify(data));
const parsed = JSON.parse(localStorage.getItem('myData') || '{}');

// IndexedDB (automatic via Dexie)
await db.projects.add({ id: 1, name: 'Test' });
const project = await db.projects.get(1);
```

### 4. Error Handling

**IndexedDB Errors**:
- QuotaExceededError: Storage full
- DataError: Invalid data format
- TransactionError: Transaction failed

**localStorage Errors**:
- SecurityError: Access denied (private browsing)
- QuotaExceededError: Storage full

**Best Practices**:
- Wrap all storage operations in try-catch
- Handle quota exceeded gracefully
- Provide user feedback for storage errors
- Implement data cleanup strategies

### 5. Data Migration

**Schema Versioning**: Use versioned schemas for IndexedDB  
**Migration Strategy**: Upgrade transactions to preserve existing data

**Example**:
```typescript
const db = new Dexie('via-gent-db', {
  projects: '++id, name, path', // Version 1
  projects_v2: '++id, name, path, createdAt' // Version 2
});

db.version(2).stores({
  projects_v2: '++id, name, path, createdAt'
}).upgrade(async (tx) => {
  // Migrate data from v1 to v2
  const oldProjects = await tx.table('projects').toArray();
  for (const project of oldProjects) {
    await tx.table('projects_v2').add({
      ...project,
      createdAt: new Date()
    });
  }
});
```

## Security Considerations

### 1. Sensitive Data

**Never Store in localStorage**:
- API keys (use IndexedDB or memory-only)
- Authentication tokens
- Passwords or credentials
- Personal user data

**Recommended for Sensitive Data**:
- Use IndexedDB with encryption
- Use session storage (ephemeral)
- Never persist to disk without encryption

### 2. Data Validation

**Validate Before Storage**:
- Check data types and formats
- Validate required fields
- Sanitize user inputs
- Use Zod schemas for validation

**Example**:
```typescript
import { z } from 'zod';

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  path: z.string(),
});

// Validate before storing
const validated = ProjectSchema.parse(projectData);
await db.projects.add(validated);
```

### 3. Cleanup Strategies

**IndexedDB Cleanup**:
- Implement data retention policies
- Remove old conversations (>30 days)
- Clean up orphaned records
- Compact database periodically

**localStorage Cleanup**:
- Remove expired cache entries
- Clean up unused keys
- Implement quota management

**Example**:
```typescript
// Clean up old conversations
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
await db.conversations
  .where('createdAt')
  .below(thirtyDaysAgo)
  .delete();
```

## Implementation Examples

### IndexedDB with Dexie

```typescript
// src/lib/persistence/db.ts
import Dexie, { Table } from 'dexie';

export const db = new Dexie('via-gent-db', {
  projects: '++id, name, path, lastSyncedAt',
  conversations: '++id, agentId, messages, createdAt',
  ideState: '++id, openFiles, activeFile, panels, terminalTab, chatVisible'
});

export type ProjectsTable = typeof db.projects;
export type ConversationsTable = typeof db.conversations;
export type IDEStateTable = typeof db.ideState;

// Usage
async function saveProject(project: Project) {
  await db.projects.put(project);
}

async function getProject(id: string) {
  return await db.projects.get(id);
}
```

### localStorage with Type Safety

```typescript
// src/lib/persistence/local-storage.ts
const STORAGE_KEYS = {
  ACTIVE_AGENT: 'agent:activeAgentId',
  THEME: 'pref:theme',
  LANGUAGE: 'pref:language',
} as const;

export function getActiveAgentId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_AGENT);
}

export function setActiveAgentId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_AGENT, id);
}

export function clearActiveAgentId(): void {
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_AGENT);
}
```

### Zustand with Persistence

```typescript
// src/lib/state/ide-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface IDEState {
  openFiles: string[];
  activeFile: string | null;
  panels: PanelState;
  terminalTab: TerminalTab;
  chatVisible: boolean;
}

export const useIDEStore = create<IDEState>()(
  persist(
    (set) => ({
      openFiles: [],
      activeFile: null,
      panels: { left: true, right: false },
      terminalTab: 'terminal',
      chatVisible: false,
      set: set,
    }),
    {
      name: 'ide-storage',
      storage: createJSONStorage(() => localStorage), // or use IndexedDB
    }
  )
);
```

## Testing Considerations

### 1. Mock Storage in Tests

**IndexedDB Mocking**:
- Use fake-indexeddb for Dexie tests
- Mock database operations with in-memory storage

**localStorage Mocking**:
- Use localStorage mock or clear before each test
- Restore original state after tests

**Example**:
```typescript
import { fakeIndexedDb } from 'fake-indexeddb';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});
```

### 2. Test Persistence Behavior

**Test Scenarios**:
- Data persists across page refreshes
- Data survives browser restarts
- Ephemeral state clears on refresh
- Quota exceeded errors handled gracefully
- Migration preserves existing data

## Related Documents

- [P2 Fixes Implementation](./p2-fixes-implementation-2025-12-26.md) - Complete P2 implementation plan
- [State Management Audit](../state-management-audit-2025-12-24.md) - State architecture details
- [Naming Convention Guidelines](./naming-convention-guidelines-2025-12-26.md) - Code naming standards

## Approval

- **Status**: Approved for implementation
- **Next Steps**: Enforce through code reviews and linting
- **Owner**: Dev Team

---

**Document End**
