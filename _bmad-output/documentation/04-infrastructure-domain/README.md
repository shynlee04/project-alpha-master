# Infrastructure Domain Documentation

## Overview

The `src/infrastructure` directory contains the core infrastructure layer of the Via-Gent application, providing persistence, event handling, and file synchronization capabilities.

## Directory Structure

```
src/infrastructure/
├── events/           # Event system for cross-store communication
├── persistence/      # IndexedDB persistence layer
└── sync/             # File synchronization system
```

---

## Persistence Layer (`persistence/`)

### Database

The persistence layer uses **Dexie.js** (IndexedDB wrapper) for offline-first data storage.

**Key Files:**
- `dexie-db.ts` - Main database export and helper functions
- `dexie-db-class.ts` - ViaGentDatabase class definition
- `dexie-db-migrations.ts` - Schema migrations (v1-v15)
- `dexie-storage.ts` - Zustand storage adapter

**Database Schema (v15):**
- **Core Tables**: projects, ideState, conversations, threads
- **AI Tables**: taskContexts, toolExecutions, credentials, providerConfigs, agentConfigs, conversationState
- **Sync Tables**: syncStatus, fileMetadata, toolExecutionLogs, fsaHandles, sessionSnapshots, fileSyncStatus
- **Knowledge Tables**: sources, collections, oramaIndexes, embedding_models, notes

### Store Slices

Zustand store slices with Dexie persistence:

- `stores/agents/` - Agent configuration store
- `stores/providers/` - LLM provider configuration
- `stores/ide/` - IDE state management
- `stores/project/` - Project management
- `stores/rag/` - RAG pipeline state
- `stores/workspace/` - Workspace context and switching
- `stores/permissions/` - Tool permission management
- `stores/filesystem/` - File snapshot management

### Helper Functions

Database helper functions in `dexie-db-helpers/`:

- Project operations (getRecentProjects, getIDEState)
- Sync status operations (getSyncStatus, setSyncStatus)
- File metadata operations (upsertFileMetadata, bulkUpsertFileMetadata)
- Conversation thread operations (getThreadsForProject)
- Source and collection operations (getSourcesForProject, createCollection)

---

## Event System (`events/`)

### Event Bus

The event system implements a publish-subscribe pattern for cross-store communication.

**Key Files:**
- `event-bus.ts` - Main EventBus implementation
- `cross-workspace-event-bus.ts` - Cross-workspace event propagation

### Event Types

**Workspace Events:**
- WORKSPACE_TRANSITION_STARTED/COMPLETED
- WORKSPACE_CHANGED

**Agent Events:**
- AGENT_SELECTED, AGENT_CONFIG_UPDATED
- AGENT_CREATED, AGENT_DELETED

**Conversation Events:**
- CONVERSATION_CREATED, CONVERSATION_MESSAGE_ADDED

**Sync Events:**
- SYNC_STARTED, SYNC_COMPLETED, SYNC_PROGRESS

**RAG Events:**
- RAG_EMBEDDING_PROGRESS, RAG_CHUNKING_STATUS
- RAG_DATABASE_INDEXING, RAG_SOURCE_PROCESSING

**IDE ↔ Knowledge Bridge Events:**
- IDE_DEBUG_SESSION_CAPTURED
- IDE_REFACTOR_JOURNAL_CREATED
- KNOWLEDGE_SYNTHESIS_EXPORT_REQUESTED

---

## Sync System (`sync/`)

### Architecture

The sync system provides bidirectional file synchronization between:
- **FSA (File System Access API)** - Local file system
- **IndexedDB** - Browser persistence
- **WebContainer** - In-browser Node.js environment

**Key Components:**

**Adapters:**
- `adapters/fsa-adapter.ts` - File System Access API adapter
- `adapters/idb-adapter.ts` - IndexedDB adapter
- `adapters/base-adapter.ts` - Base adapter interface

**Core:**
- `core/sync-engine.ts` - Sync orchestration engine
- `core/sync-engine-core.ts` - SyncEngine implementation
- `core/file-watcher.ts` - File change monitoring

**Strategies:**
- `strategies/bidirectional-sync.ts` - Two-way synchronization
- `strategies/conflict-resolution.ts` - Conflict detection and resolution

**Workspace Services:**
- `workspace-services/ide-file-sync-service.ts`
- `workspace-services/knowledge-file-sync-service.ts`
- `workspace-services/notes-file-sync-service.ts`
- `workspace-services/study-file-sync-service.ts`

---

## Performance Considerations

### Database Operations

- **Bulk Operations**: Use `bulkPut()`, `bulkAdd()` for multiple records
- **Indexed Queries**: Leverage compound indexes for efficient queries
- **Lazy Initialization**: Database opens on first access
- **Cleanup**: Regular cleanup of old sync status and logs

### Sync Performance

- **Incremental Sync**: Only sync changed files using fileMetadata cache
- **Debounced Operations**: Batch file operations with configurable debounce
- **Concurrent Operations**: Support parallel sync with maxConcurrent limit
- **Quota Management**: Monitor and manage storage quotas

---

## Security Features

### Credential Encryption

- **AES-256-GCM** encryption for API keys
- **PBKDF2** key derivation (100,000 iterations)
- Secure storage in IndexedDB

### Permission Management

- **FSA Permission** handling and persistence
- Permission status tracking (granted, prompt, denied)
- Permission request and verification

### Data Isolation

- **Project-level** data isolation
- **Workspace-specific** access controls
- **localStorage** migration flags for security audit

---

## Migration System

### Schema Versions

| Version | Description |
|---------|-------------|
| v1 | Initial schema (projects, ideState, conversations) |
| v3 | AI Foundation tables |
| v4 | Credentials table |
| v5 | Conversation threads |
| v6-7 | Provider/Agent configs |
| v8 | Sync status with localStorage migration |
| v9 | Epic 24: File metadata, tool logs, FSA handles, snapshots |
| v11-12 | Knowledge sources and collections |
| v13-14 | RAG search and embedding models |
| v15 | Notes (BlockNote editor) |

### Migration Features

- **Idempotent**: Safe to run multiple times
- **Logged**: All migrations logged for audit
- **Trackable**: localStorage flags prevent re-execution
- **Reversible**: Can reset for development

---

## Usage Examples

### Database Access

```typescript
import { getDb, getRecentProjects } from '@/infrastructure/persistence/dexie-db';

const db = getDb();
const projects = await getRecentProjects(10);
```

### Event Handling

```typescript
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

eventBus.on(DomainEventType.WORKSPACE_CHANGED, (event) => {
  console.log('Workspace changed:', event.payload);
});
```

### Sync Engine

```typescript
import { createSyncEngine } from '@/infrastructure/sync/core/sync-engine';

const engine = createSyncEngine({
  adapters: { fsa: fsaAdapter, idb: idbAdapter },
  defaults: { direction: 'bidirectional' },
});

await engine.sync();
```

---

## Known Issues & Limitations

### SSR Compatibility

- Database operations only available in browser
- Always check `typeof window !== 'undefined'`

### Storage Quotas

- IndexedDB has browser-dependent quotas
- Use quota manager for monitoring

### Permission Handling

- FSA permissions can be revoked by user
- Handle permission denials gracefully

---

## Related Documentation

- **Architecture**: `_bmad-output/architecture/platform-architecture-definitive-2026-01-04.md`
- **State Management**: `_bmad-output/project-planning-artifacts/adr-state-consolidation-2026-01-04.md`
- **Deep Scan**: `_bmad/modules/deep-scan/`

---

## File Inventory

| Category | Files | Description |
|----------|-------|-------------|
| Persistence | 120 | Database, helpers, store slices |
| Events | 8 | Event bus implementations |
| Sync | 120 | Sync engine, adapters, strategies |
| **Total** | **248** | TypeScript files |
