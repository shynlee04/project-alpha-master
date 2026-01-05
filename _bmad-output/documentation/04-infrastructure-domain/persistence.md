# Infrastructure Persistence Layer

## Overview

The persistence layer provides a type-safe, offline-first data storage solution using **Dexie.js** (IndexedDB wrapper). It handles all application state persistence including projects, IDE settings, conversations, AI configurations, knowledge sources, and sync metadata.

### Key Characteristics

- **Offline-First**: All data persisted locally in IndexedDB
- **Type-Safe**: Full TypeScript support with generated table types
- **Versioned Schema**: 15 schema versions with automatic migrations
- **Composable Stores**: Zustand store slices with Dexie persistence
- **Performance Optimized**: Indexed queries, bulk operations, lazy initialization

---

## Architecture

### Core Components

```
src/infrastructure/persistence/
├── dexie-db.ts              # Main database export & helpers
├── dexie-db-class.ts        # ViaGentDatabase class definition
├── dexie-db-*.ts            # Type definitions for tables
├── dexie-db-migrations.ts   # Schema migration functions
├── dexie-db-helpers/        # CRUD helper functions
└── stores/                  # Zustand store slices
```

### Database Class

```typescript
import { getDb, ViaGentDatabase } from '@/infrastructure/persistence/dexie-db';

const db = getDb();
if (db) {
  await db.projects.add({ id: '1', name: 'My Project' });
  const project = await db.projects.get('1');
}
```

---

## Database Schema (Version 15)

### Core Tables

| Table | Indexes | Purpose |
|-------|---------|---------|
| `projects` | `id, lastOpened, name` | Project metadata |
| `ideState` | `projectId, updatedAt` | IDE layout/state persistence |
| `conversations` | `id, projectId, updatedAt` | Chat conversation history |
| `threads` | `id, projectId, updatedAt, [projectId+updatedAt]` | Conversation threads |

### AI Foundation Tables

| Table | Indexes | Purpose |
|-------|---------|---------|
| `taskContexts` | `id, projectId, agentId, status, [projectId+status]` | AI task tracking |
| `toolExecutions` | `id, taskId, toolName, status, [taskId+status]` | Tool execution audit |
| `credentials` | `providerId, createdAt` | Encrypted API credentials |
| `providerConfigs` | `id, updatedAt` | Provider configuration |
| `agentConfigs` | `id, updatedAt` | Agent configuration |
| `conversationState` | `id, updatedAt` | Conversation state |

### Sync & Session Tables

| Table | Indexes | Purpose |
|-------|---------|---------|
| `syncStatus` | `id, path, syncStatus, lastSyncedAt, [path+syncStatus]` | File sync status |
| `fileMetadata` | `[projectId+path], projectId, lastModified, syncedAt` | Incremental sync cache |
| `toolExecutionLogs` | `id, conversationId, [conversationId+timestamp]` | Tool context persistence |
| `fsaHandles` | `projectId, lastAccessedAt` | FSA handle persistence |
| `sessionSnapshots` | `id, projectId, createdAt, expiresAt, [projectId+createdAt]` | Session restoration |
| `fileSyncStatus` | `id, updatedAt` | Zustand store persistence |

### Knowledge & RAG Tables

| Table | Indexes | Purpose |
|-------|---------|---------|
| `sources` | `id, projectId, type, createdAt, deleted, [projectId+type], [projectId+createdAt]` | PDF/URL/text sources |
| `collections` | `id, projectId, name, [projectId+name]` | Source organization |
| `oramaIndexes` | `projectId, lastUpdated, schemaVersion` | RAG search index |
| `embedding_models` | `modelId, name, version, quantization` | Local embeddings |
| `notes` | `id, projectId, parentId, [projectId+parentId], [projectId+createdAt]` | BlockNote editor |

---

## Helper Functions

### Project Operations

```typescript
import { getDb, getRecentProjects, getIDEState, saveIDEState } from '@/infrastructure/persistence/dexie-db';

// Get recent projects
const recentProjects = await getRecentProjects(10);

// Get IDE state for project
const ideState = await getIDEState('project-123');
if (!ideState) {
  // Create default state
  await saveIDEState({ projectId: 'project-123', panels: {} });
}
```

### Sync Status Operations

```typescript
import { getSyncStatus, setSyncStatus, getPendingSyncStatus, getSyncStatusStats } from '@/infrastructure/persistence/dexie-db';

// Get sync status for file
const status = await getSyncStatus('/src/App.tsx');

// Set sync status
await setSyncStatus({
  path: '/src/App.tsx',
  syncStatus: 'synced',
  lastSyncedAt: Date.now(),
  projectId: 'project-123',
});

// Get statistics
const stats = await getSyncStatusStats();
// { total: 10, pending: 2, syncing: 1, synced: 5, error: 1, conflict: 1 }
```

### File Metadata Operations

```typescript
import { getFileMetadata, upsertFileMetadata, bulkUpsertFileMetadata, getFilesNeedingSync } from '@/infrastructure/persistence/dexie-db';

// Upsert single file metadata
await upsertFileMetadata({
  projectId: 'project-123',
  path: '/src/index.ts',
  lastModified: Date.now(),
  contentHash: 'abc123',
  syncedAt: Date.now(),
});

// Bulk upsert for efficiency
await bulkUpsertFileMetadata([
  { projectId: 'project-123', path: '/src/a.ts', lastModified: Date.now() },
  { projectId: 'project-123', path: '/src/b.ts', lastModified: Date.now() },
]);

// Get files needing sync
const dirtyFiles = await getFilesNeedingSync('project-123');
```

### Conversation Thread Operations

```typescript
import { getConversationThread, saveConversationThread, getThreadsForProject, getMostRecentThread } from '@/infrastructure/persistence/dexie-db';

// Get thread by ID
const thread = await getConversationThread('thread-123');

// Get all threads for project
const threads = await getThreadsForProject('project-123');

// Get most recent thread
const recent = await getMostRecentThread('project-123');

// Save thread
await saveConversationThread({
  id: 'thread-123',
  projectId: 'project-123',
  title: 'Refactoring Discussion',
  messages: [],
  updatedAt: Date.now(),
});
```

### Source & Collection Operations

```typescript
import { getSource, saveSource, getSourcesForProject, getSourcesByType, createCollection, addSourceToCollection, getSourcesForCollection } from '@/infrastructure/persistence/dexie-db';

// Save source
await saveSource({
  id: 'source-123',
  projectId: 'project-123',
  type: 'pdf',
  title: 'Architecture Document',
  content: '...',
  createdAt: Date.now(),
});

// Get sources by type
const pdfSources = await getSourcesByType('project-123', 'pdf');

// Create collection
const collectionId = await createCollection('project-123', 'Research Papers');

// Add source to collection
await addSourceToCollection(collectionId, 'source-123');

// Get sources in collection
const collectionSources = await getSourcesForCollection(collectionId);
```

---

## Migration System

### Migration Logging

```typescript
import { logDexieMigration, isMigrationApplied, markMigrationApplied } from '@/infrastructure/persistence/dexie-db-migrations';

// Check if migration was applied
if (isMigrationApplied(9)) {
  console.log('Migration v9 already applied');
}

// Log migration event
logDexieMigration(9, 'epic-24-schema', 'started');
logDexieMigration(9, 'epic-24-schema', 'completed', { tableName: 'fileMetadata' });
```

### Migration Registration

Migrations are registered in `registerMigrations()` function:

```typescript
// Schema version 9: Epic 24 - Performance & UX Optimization
db.version(9).stores({
  fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
  toolExecutionLogs: 'id, conversationId, [conversationId+timestamp]',
  fsaHandles: 'projectId, lastAccessedAt',
  sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
}).upgrade(async (tx) => {
  logDexieMigration(9, 'epic-24-schema', 'started');
  
  if (isMigrationApplied(9)) {
    logDexieMigration(9, 'epic-24-schema', 'completed', 'Already applied');
    return;
  }
  
  // Migration logic...
  markMigrationApplied(9);
});
```

### Migration History (v1-v15)

| Version | Epic/Story | Description |
|---------|------------|-------------|
| v1 | - | Initial schema (projects, ideState, conversations) |
| v3 | 27-1c | AI Foundation tables (taskContexts, toolExecutions) |
| v4 | 25-0 | Credentials table for API keys |
| v5 | MVP-2 | Conversation threads |
| v6 | 25 | Provider configs |
| v7 | 2.1 | Agent configs, conversation state |
| v8 | RC-005 | Sync status (localStorage migration) |
| v9 | Epic 24 | File metadata, tool logs, FSA handles, snapshots |
| v10 | CC-2025-12-29 | File sync status |
| v11 | Epic 6 | Sources table |
| v12 | Epic 6 | Collections, soft delete |
| v13 | Epic 7 | Orama indexes |
| v14 | 7-3 | Embedding models |
| v15 | Epic 26 | Notes table |

---

## Zustand Store Integration

### Store Slices

```typescript
// Example: IDE store with persistence
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { dexieStorage } from '@/infrastructure/persistence/dexie-storage';

interface IDEState {
  openFiles: string[];
  activeFile: string | null;
  setActiveFile: (file: string) => void;
}

export const useIDEStore = create<IDEState>()(
  persist(
    (set) => ({
      openFiles: [],
      activeFile: null,
      setActiveFile: (file) => set({ activeFile: file }),
    }),
    {
      name: 'ide-state',
      storage: createJSONStorage(() => dexieStorage),
      partialize: (state) => ({
        openFiles: state.openFiles,
        activeFile: state.activeFile,
      }),
    }
  )
);
```

### Dexie Storage Adapter

```typescript
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';

const storage = createDexieStorage('storeName');
// Returns storage object with getItem, setItem, removeItem
```

---

## Performance Considerations

### Bulk Operations

Always use bulk operations for multiple records:

```typescript
// ❌ Slow - individual operations
for (const record of records) {
  await db.fileMetadata.put(record);
}

// ✅ Fast - bulk operation
await db.fileMetadata.bulkPut(records);
```

### Indexed Queries

Use compound indexes for efficient queries:

```typescript
// Compound index: [projectId+path]
await db.fileMetadata
  .where('[projectId+path]')
  .equals(['project-123', '/src/index.ts'])
  .first();
```

### Lazy Initialization

Database is lazily initialized to avoid SSR issues:

```typescript
function getDb(): ViaGentDatabase | null {
  if (typeof window === 'undefined') return null; // SSR guard
  if (!dbInstance) {
    dbInstance = new ViaGentDatabase();
    dbInstance.open().catch(err => console.error(err));
  }
  return dbInstance;
}
```

### Cleanup Operations

```typescript
import { clearOldSyncStatus, clearOldToolExecutionLogs, clearExpiredSessionSnapshots } from '@/infrastructure/persistence/dexie-db';

// Clear old sync status (older than 7 days)
const cleared = await clearOldSyncStatus();

// Clear old tool execution logs (older than 30 days)
await clearOldToolExecutionLogs();

// Clear expired session snapshots
await clearExpiredSessionSnapshots();
```

---

## Known Issues & Limitations

### SSR Compatibility

- Database operations only available in browser
- Always check `typeof window !== 'undefined'` before accessing
- Use lazy initialization pattern

### Storage Quotas

- IndexedDB has browser-dependent quotas
- Use `idb-quota-manager.ts` for quota monitoring
- Consider eviction strategies for large datasets

### Migration Idempotency

- All migrations should be idempotent
- Check `isMigrationApplied()` before running data migrations
- Log migration status for debugging

---

## Developer Notes

### Adding New Tables

1. Define type in appropriate `dexie-db-*.ts` file
2. Add table to `ViaGentDatabase` class
3. Create schema in `registerMigrations()`
4. Export helper functions in `dexie-db.ts`
5. Write tests for CRUD operations

### Debugging

```typescript
// Enable debug logging
const db = getDb();
db.on('populate', () => console.log('Database populated'));
db.on('versionchange', () => console.log('Version change'));

// Query logging
db.on('query', (query) => console.log('Query:', query));
```

### Testing

```typescript
import { resetDatabaseForTesting } from '@/infrastructure/persistence/dexie-db';

beforeEach(async () => {
  await resetDatabaseForTesting();
});
```
