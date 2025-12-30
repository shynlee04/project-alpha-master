# Data Models

Dexie.js IndexedDB schema documentation for the Via-gent project.

## Database Overview

**Database Name**: `via-gent-persistence`
**Schema Version**: 15
**Technology**: Dexie.js 4.2.1

## Schema Version History

| Version | Epic/Story | Description |
|---------|------------|-------------|
| 1 | Initial | Basic schema (projects, ideState, conversations) |
| 3 | Epic 25 | AI Foundation tables (taskContexts, toolExecutions) |
| 4 | Story 25-0 | Credentials table for encrypted API keys |
| 5 | MVP-2 | Conversation threads table |
| 6-7 | Epic 25 | State persistence tables (providerConfigs, agentConfigs, conversationState) |
| 8 | RC-005 | Sync status table |
| 9 | Epic 24 | Performance tables (fileMetadata, toolExecutionLogs, fsaHandles, sessionSnapshots) |
| 10 | CC-2025-12-29 | fileSyncStatus table |
| 11-12 | Epic 6 | Source ingestion tables (sources, collections) |
| 13-14 | Epic 7 | RAG infrastructure (oramaIndexes, embedding_models) |
| 15 | Epic 26 | Notes table for BlockNote editor |

## Tables

### Core Tables

#### `projects`
Project metadata storage.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | Project ID |
| name | string | | Project display name |
| path | string | | Project directory path |
| lastOpened | Date | idx | Last opened timestamp |
| createdAt | Date | | Creation timestamp |

#### `ideState`
IDE state per project (panel layouts, open files, etc.).

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| projectId | string | PK | Project ID |
| openFiles | string[] | | Array of open file paths |
| activeFile | string \| null | | Currently active file |
| expandedPaths | string[] | | Expanded tree paths |
| panelLayouts | Record<string, number[]> | | Panel size configurations |
| terminalTab | 'terminal' \| 'output' \| 'problems' | | Active terminal tab |
| chatVisible | boolean | | Chat panel visibility |
| updatedAt | Date | | Last update timestamp |

### AI Foundation Tables (Epic 25)

#### `taskContexts`
AI agent task context for orchestration.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | Task ID |
| projectId | string | idx | Project reference |
| agentId | string | idx | Agent executing the task |
| status | string | idx | Task status (pending/running/completed/failed/cancelled) |
| description | string | | Human-readable description |
| targetFiles | string[] | | Files being worked on |
| checkpoint | unknown | | LangGraph checkpoint |
| createdAt | Date | | Creation timestamp |
| updatedAt | Date | | Last update timestamp |

**Composite Index**: `[projectId+status]`

#### `toolExecutions`
Tool execution audit trail.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | Execution ID |
| taskId | string | idx | Task context reference |
| toolName | string | idx | Tool that was executed |
| input | unknown | | Tool input parameters |
| output | unknown | | Tool output |
| status | string | idx | Execution status |
| duration | number | | Execution time in ms |
| createdAt | Date | | Creation timestamp |

**Composite Index**: `[taskId+status]`

#### `credentials`
Encrypted API key storage.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| providerId | string | PK | Provider identifier |
| encrypted | string | | Base64-encoded encrypted API key |
| iv | string | | Initialization vector |
| createdAt | Date | | Creation timestamp |

### Conversation Tables (MVP-2)

#### `threads`
Conversation thread storage with full-text indexing.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | Thread ID |
| projectId | string | idx | Project reference |
| title | string | | Thread title |
| preview | string | | First 100 chars of last message |
| messages | ThreadMessageRecord[] | | Array of messages |
| agentsUsed | string[] | | Agent IDs used in thread |
| messageCount | number | | Message count |
| scrollPosition | number | | Chat scroll position |
| createdAt | number | | Creation timestamp (ms) |
| updatedAt | number | idx | Last update timestamp (ms) |

**Composite Index**: `[projectId+updatedAt]`

#### `toolExecutionLogs`
Tool execution context persistence.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | Log ID |
| conversationId | string | idx | Conversation reference |
| messageId | string | idx | Message containing tool call |
| toolName | string | idx | Tool name |
| args | unknown | | Tool arguments |
| result | object | | Execution result |
| approved | boolean | | User approval status |
| status | string | idx | Execution status |
| timestamp | number | idx | Execution timestamp |
| createdAt | number | | Creation timestamp |

**Composite Index**: `[conversationId+timestamp]`

### Sync Tables (Epic 24, RC-005)

#### `syncStatus`
File sync status tracking.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | Generated ID |
| path | string | idx | File path |
| syncStatus | string | idx | Status (pending/syncing/synced/error/conflict) |
| localVersion | number | | Local version number |
| remoteVersion | number | | Remote version number |
| lastSyncedAt | number | idx | Last sync timestamp |
| errorMessage | string | | Error details |
| retryCount | number | | Retry attempts |
| createdAt | number | | Creation timestamp |
| updatedAt | number | | Last update timestamp |

**Composite Index**: `[path+syncStatus]`

#### `fileMetadata`
File metadata cache for incremental sync.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| path | string | PK | File path (relative) |
| projectId | string | idx | Project reference |
| lastModified | number | idx | Last modification timestamp |
| size | number | | File size in bytes |
| hash | string | | SHA-256 content hash |
| syncedAt | number | idx | Last sync timestamp |
| createdAt | number | | Creation timestamp |
| updatedAt | number | | Last update timestamp |

**Composite Index**: `[projectId+path]`, `projectId`, `syncedAt`

#### `fsaHandles`
File System Access handle persistence.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| projectId | string | PK | Project ID |
| handleData | unknown | | Serialized handle |
| directoryPath | string | | Original path |
| grantedAt | number | | Permission grant time |
| lastAccessedAt | number | idx | Last access check |
| permissionStatus | string | | Permission state |
| createdAt | number | | Creation timestamp |
| updatedAt | number | | Last update timestamp |

#### `sessionSnapshots`
Complete session state for restoration.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | Snapshot ID |
| projectId | string | idx | Project reference |
| snapshot | object | | Full session state |
| createdAt | number | idx | Creation timestamp |
| expiresAt | number | idx | Expiration timestamp |

**Composite Index**: `[projectId+createdAt]`

### Knowledge Base Tables (Epic 6, 7, 26)

#### `sources`
Source content for knowledge base.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | Source ID |
| projectId | string | idx | Project reference |
| type | string | idx | Source type (pdf/url/text) |
| title | string | | Source title |
| content | string | | Extracted text |
| url | string | | URL for URL sources |
| pageCount | number | | PDF page count |
| wordCount | number | | Word count |
| deleted | boolean | idx | Soft delete flag |
| summary | string | | AI-generated summary |
| keyConcepts | string[] | | Key concept tags |
| createdAt | number | idx | Creation timestamp |
| updatedAt | number | | Last update timestamp |

**Composite Index**: `[projectId+type]`, `[projectId+createdAt]`, `[projectId+deleted]`

#### `collections`
Source organization collections.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | Collection ID |
| projectId | string | idx | Project reference |
| name | string | | Collection name |
| sourceIds | string[] | | Source IDs in collection |
| createdAt | number | | Creation timestamp |
| updatedAt | number | | Last update timestamp |

**Composite Index**: `[projectId+name]`

#### `oramaIndexes`
Orama search index persistence.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| projectId | string | PK | Project ID |
| data | string | | Serialized index data |
| schemaVersion | number | idx | Schema version |
| documentCount | number | | Document count |
| size | number | | Data size in bytes |
| lastUpdated | number | idx | Last update timestamp |

#### `embedding_models`
Local embedding model cache.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | Model ID |
| modelId | string | idx | Model identifier |
| name | string | | Display name |
| version | string | | Model version |
| quantization | string | | Quantization type |
| modelData | Blob | | Model binary data |
| size | number | | Model size in bytes |
| downloadedAt | Date | idx | Download timestamp |

#### `notes`
BlockNote editor notes.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | Note ID |
| projectId | string | idx | Project reference |
| title | string | | Note title |
| emoji | string | | Emoji icon |
| blocks | unknown[] | | BlockNote block data |
| parentId | string | idx | Parent note ID |
| isFavorite | boolean | idx | Favorite flag |
| order | number | | Sort order |
| isIndexed | boolean | | RAG indexing flag |
| indexedAt | number | | Index timestamp |
| createdAt | number | idx | Creation timestamp |
| updatedAt | number | | Last update timestamp |

**Composite Index**: `[projectId+parentId]`, `[projectId+isFavorite]`, `[projectId+createdAt]`

### State Persistence Tables (Epic 25)

#### `providerConfigs`, `agentConfigs`, `conversationState`, `fileSyncStatus`
Generic Zustand store persistence.

| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | Storage key |
| state | any | | Serialized state |
| updatedAt | Date | idx | Last update timestamp |

---

*Generated: 2025-12-31*
