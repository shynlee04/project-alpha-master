# Infrastructure Storage Schemas

## Overview

This document describes the IndexedDB schema definitions for the ViaGentDatabase. The database uses **Dexie.js** and has been through 15 schema versions.

---

## Schema Version 15 (Current)

### Core Tables

#### projects
```typescript
interface ProjectRecord {
  id: string;
  name: string;
  rootDirectoryHandle?: FileSystemDirectoryHandle;
  lastOpened: number;
  createdAt: number;
  workspaceBindings: WorkspaceBindings;
}

stores: 'id, lastOpened, name'
```

#### ideState
```typescript
interface IDEStateRecord {
  projectId: string;
  openFiles: string[];
  activeFile: string | null;
  panels: Record<string, unknown>;
  layout: IDELayoutState;
  updatedAt: number;
}

stores: 'projectId, updatedAt'
```

#### conversations
```typescript
interface ConversationRecord {
  id: string;
  projectId: string;
  title: string;
  messages: Message[];
  agentId: string | null;
  createdAt: number;
  updatedAt: number;
}

stores: 'id, projectId, updatedAt'
```

---

### AI Foundation Tables

#### taskContexts
```typescript
interface TaskContextRecord {
  id: string;
  projectId: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  task: string;
  result?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

stores: 'id, projectId, agentId, status, [projectId+status]'
```

#### toolExecutions
```typescript
interface ToolExecutionRecord {
  id: string;
  taskId: string;
  toolName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: unknown;
  output?: unknown;
  error?: string;
  duration?: number;
  createdAt: number;
  updatedAt: number;
}

stores: 'id, taskId, toolName, status, [taskId+status]'
```

#### credentials
```typescript
interface CredentialRecord {
  providerId: string;
  encryptedKey: string;
  iv: string;
  authTag: string;
  createdAt: number;
  updatedAt: number;
}

stores: 'providerId, createdAt'
```

#### providerConfigs
```typescript
interface PersistedStateRecord {
  id: string;
  state: Record<string, unknown>;
  updatedAt: number;
}

stores: 'id, updatedAt'
```

#### agentConfigs
```typescript
interface PersistedStateRecord {
  id: string;
  state: Record<string, unknown>;
  updatedAt: number;
}

stores: 'id, updatedAt'
```

#### conversationState
```typescript
interface PersistedStateRecord {
  id: string;
  state: Record<string, unknown>;
  updatedAt: number;
}

stores: 'id, updatedAt'
```

---

### Sync & Session Tables

#### syncStatus
```typescript
interface SyncStatusRecord {
  id: string;
  path: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error' | 'conflict';
  lastSyncedAt?: number;
  errorMessage?: string;
  retryCount: number;
  createdAt: number;
  updatedAt: number;
  projectId: string;
}

stores: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]'
```

#### fileMetadata
```typescript
interface FileMetadataRecord {
  id: string;
  projectId: string;
  path: string;
  lastModified: number;
  contentHash: string;
  size: number;
  syncedAt: number;
  createdAt: number;
  updatedAt: number;
}

stores: '[projectId+path], projectId, lastModified, syncedAt'
```

#### toolExecutionLogs
```typescript
interface ToolExecutionLogRecord {
  id: string;
  conversationId: string;
  messageId: string;
  toolName: string;
  toolCallId: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
  approved: boolean;
  timestamp: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  createdAt: number;
}

stores: 'id, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]'
```

#### fsaHandles
```typescript
interface FSAHandleRecord {
  projectId: string;
  handle: FileSystemDirectoryHandle;
  permissionStatus: 'unknown' | 'granted' | 'prompt' | 'denied';
  lastAccessedAt: number;
  createdAt: number;
  updatedAt: number;
}

stores: 'projectId, lastAccessedAt'
```

#### sessionSnapshots
```typescript
interface SessionSnapshotRecord {
  id: string;
  projectId: string;
  openFiles: string[];
  activeFile: string | null;
  conversationId: string | null;
  workspaceType: string;
  timestamp: number;
  expiresAt: number;
  createdAt: number;
}

stores: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]'
```

#### fileSyncStatus
```typescript
interface PersistedStateRecord {
  id: string;
  state: Record<string, unknown>;
  updatedAt: number;
}

stores: 'id, updatedAt'
```

---

### Knowledge & RAG Tables

#### sources
```typescript
interface SourceRecord {
  id: string;
  projectId: string;
  type: 'pdf' | 'url' | 'text';
  title: string;
  content: string;
  metadata: SourceMetadata;
  chunks: string[];
  chunkCount: number;
  embeddingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  embeddingProgress: number;
  deleted: boolean;
  createdAt: number;
  updatedAt: number;
}

interface SourceMetadata {
  url?: string;
  pdfPageCount?: number;
  fileSize?: number;
  mimeType?: string;
  authors?: string[];
  tags?: string[];
}

stores: 'id, projectId, type, createdAt, deleted, [projectId+type], [projectId+createdAt], [projectId+deleted]'
```

#### collections
```typescript
interface CollectionRecord {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  sourceIds: string[];
  color?: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;
}

stores: 'id, projectId, name, createdAt, [projectId+name]'
```

#### oramaIndexes
```typescript
interface OramaIndexRecord {
  id: string;
  projectId: string;
  schemaVersion: number;
  indexData: unknown;
  documentCount: number;
  lastUpdated: number;
  createdAt: number;
}

stores: 'projectId, lastUpdated, schemaVersion'
```

#### embedding_models
```typescript
interface EmbeddingModelRecord {
  modelId: string;
  name: string;
  version: string;
  quantization: 'f32' | 'i8' | 'ubinary';
  dimensions: number;
  downloadedAt: number;
  localPath: string;
  size: number;
  status: 'downloading' | 'downloaded' | 'error';
}

stores: 'modelId, name, version, quantization, downloadedAt'
```

#### notes
```typescript
interface NoteRecord {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  content: BlockNoteContent;
  isFavorite: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

interface BlockNoteContent {
  version: number;
  blocks: Block[];
}

stores: 'id, projectId, parentId, isFavorite, order, createdAt, updatedAt, [projectId+parentId], [projectId+isFavorite], [projectId+createdAt]'
```

---

## Table Relationships

```
projects (1) ──────── (1) ideState
     │
     ├── (1) ──────── (N) conversations
     │                     │
     │                     └── (N) threads
     │
     ├── (1) ──────── (N) taskContexts
     │                     │
     │                     └── (N) toolExecutions
     │
     ├── (1) ──────── (N) fileMetadata
     │
     ├── (1) ──────── (N) sources
     │                     │
     │                     └── (N) collections (M:N via sourceIds)
     │
     └── (1) ──────── (N) notes

credentials (independent, keyed by providerId)
providerConfigs (independent, keyed by id)
agentConfigs (independent, keyed by id)
```

---

## Index Usage Patterns

### Compound Index Queries

```typescript
// [projectId+path] - Get file metadata for specific project and path
await db.fileMetadata
  .where('[projectId+path]')
  .equals(['project-123', '/src/index.ts'])
  .first();

// [projectId+status] - Get pending tasks for project
await db.taskContexts
  .where('[projectId+status]')
  .equals(['project-123', 'pending'])
  .toArray();

// [conversationId+timestamp] - Get tool logs ordered by time
await db.toolExecutionLogs
  .where('[conversationId+timestamp]')
  .between(['conv-123', 0], ['conv-123', Date.now()])
  .toArray();
```

### Single Index Queries

```typescript
// By status - Get all error sync status
await db.syncStatus.where('syncStatus').equals('error').toArray();

// By createdAt - Get recent projects
await db.projects.orderBy('createdAt').reverse().limit(10).toArray();
```

---

## Schema Evolution

### Version 1 → 15 Summary

| Version | Tables Added | Key Changes |
|---------|--------------|-------------|
| v1 | projects, ideState, conversations | Initial schema |
| v3 | taskContexts, toolExecutions | AI Foundation |
| v4 | credentials | Encrypted API keys |
| v5 | threads | Conversation threads |
| v6 | providerConfigs | Zustand persistence |
| v7 | agentConfigs, conversationState | Agent config persistence |
| v8 | syncStatus | Sync status tracking |
| v9 | fileMetadata, toolExecutionLogs, fsaHandles, sessionSnapshots | Performance optimization |
| v10 | fileSyncStatus | File sync persistence |
| v11 | sources | Knowledge sources |
| v12 | collections, soft delete | Source organization |
| v13 | oramaIndexes | RAG search index |
| v14 | embedding_models | Local embeddings |
| v15 | notes | BlockNote editor |

---

## Migration Considerations

### Adding New Tables

1. Define TypeScript interface
2. Add to `ViaGentDatabase` class
3. Create Dexie schema in `registerMigrations()`
4. Export helper functions in `dexie-db.ts`
5. Write migration with idempotency check

### Modifying Existing Tables

1. Create new migration version
2. Add new indexes in schema definition
3. Write data migration if needed
4. Test backward compatibility

### Removing Tables

1. Create migration to migrate data or archive
2. Remove indexes from schema
3. Update TypeScript types
4. Consider data export option
