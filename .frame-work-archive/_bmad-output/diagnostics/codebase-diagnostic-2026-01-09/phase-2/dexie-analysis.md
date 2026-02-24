# Phase 2: Dexie Database Analysis

**Analysis Date:** 2026-01-09

---

## Database Overview

| Metric | Value |
|--------|-------|
| **Total Tables** | 26+ |
| **Core Tables** | 4 |
| **AI Tables** | 4 |
| **Session Tables** | 6 |
| **Knowledge Tables** | 6 |
| **Feature Tables** | 6+ |

---

## Core Tables (src/infrastructure/persistence/dexie-db-core-types.ts)

| Table | Schema | Indexes | description |
|-------|--------|---------|---------|
| **projects** | `{id, name, path, workspaceId, storageType, lastOpened, createdAt, bindings, isTemp, autoCreated, folderPath, fileSnapshotEnabled}` | `id, name, workspaceId` | Project metadata |
| **ideState** | `{id, projectId, panels, tabs, layout}` | `id, projectId` | IDE persistence |
| **conversations** | `{id, projectId, title, createdAt, updatedAt}` | `id, projectId` | Chat history |
| **fileSnapshots** | `{++id, projectId, filePath, content, lastModified}` | `id, projectId, filePath` | File snapshots |

---

## AI Foundation Tables (dexie-db-ai-types.ts)

| Table | Schema | Indexes | description |
|-------|--------|---------|---------|
| **taskContexts** | `{id, projectId, type, data, createdAt}` | `id, projectId` | Task memory |
| **toolExecutions** | `{id, conversationId, toolName, args, result, timestamp}` | `id, conversationId` | Tool history |
| **credentials** | `{id, provider, encryptedKey, createdAt}` | `id, provider` | API keys (encrypted) |
| **conversationThreads** | `{id, projectId, title, messages, createdAt, updatedAt}` | `id, projectId` | Thread hierarchy |

---

## Session Tables (dexie-db-session-types.ts)

| Table | Schema | Indexes | description |
|-------|--------|---------|---------|
| **syncStatus** | `{id, path, status, lastSync, error}` | `id, path, status` | Sync state |
| **fileMetadata** | `{id, projectId, path, lastModified, size, hash}` | `id, projectId, path` | Incremental sync |
| **toolExecutionLogs** | `{id, conversationId, toolName, approved, timestamp}` | `id, conversationId` | Tool permissions |
| **fsaHandles** | `{id, projectId, directoryHandle, status, permissions}` | `id, projectId` | FSA persistence |
| **sessionSnapshots** | `{id, projectId, state, expiresAt}` | `id, projectId` | Session restore |
| **providerConfigs** | `{id, key, value}` | `id, key` | LLM configs |

---

## Knowledge Tables (dexie-db-knowledge-types.ts)

| Table | Schema | Indexes | description |
|-------|--------|---------|---------|
| **sources** | `{id, projectId, type, title, content, metadata, createdAt}` | `id, projectId, type` | RAG sources |
| **collections** | `{id, projectId, name, description, createdAt}` | `id, projectId` | Source groups |
| **synthesisResults** | `{id, projectId, query, result, createdAt}` | `id, projectId` | AI synthesis |
| **oramaIndexes** | `{id, projectId, name, schema, lastUpdated}` | `id, projectId` | Vector index |
| **embeddingModels** | `{id, name, dimensions, provider}` | `id, name` | Embedding config |
| **notes** | `{id, projectId, title, blocks, createdAt, updatedAt}` | `id, projectId` | BlockNote notes |

---

## Feature Tables

| Table | Schema | description |
|-------|--------|---------|
| **workflows** | `{id, name, nodes, edges, tags}` | Workflow builder |
| **codeSnippets** | `{id, projectId, name, code, language}` | Code snippets |
| **plugins** | `{id, source, state, installedAt}` | Plugin system |
| **pluginSettings** | `{key, value}` | Plugin config |
| **agentConfigs** | `{id, name, provider, model, tools, bindings}` | Agent configs |

---

## Cross-Table Relationships

```
projects
├── ← conversations (projectId)
├── ← ideState (projectId)
├── ← conversationThreads (projectId)
├── ← taskContexts (projectId)
├── ← syncStatus (projectId)
├── ← fileMetadata (projectId)
├── ← fsaHandles (projectId)
├── ← sessionSnapshots (projectId)
├── ← sources (projectId)
├── ← collections (projectId)
├── ← synthesisResults (projectId)
├── ← oramaIndexes (projectId)
├── ← notes (projectId)
├── ← codeSnippets (projectId)
└── ← plugins (projectId)

conversationThreads
├── ← threadMessages (via threadId)
└── ← toolExecutions (via conversationId)

sources
├── ← collections (many-to-many via addSourceToCollection)
└── ← synthesisResults (via sourceId)
```

---

## Performance Issues

### 1. Missing Indexes
| Table | Query Field | Has Index? | Impact |
|-------|-------------|------------|--------|
| syncStatus | `status` | ✅ Yes | Good |
| fileMetadata | `lastModified` | ✅ Yes | Good |
| conversations | `updatedAt` | ❌ No | SLOW排序 |
| sources | `createdAt` | ✅ Yes | Good |

### 2. Large Table Scans
| Query | Table | Risk | Mitigation |
|-------|-------|------|------------|
| `db.conversations.toArray()` | conversations | 🔴 HIGH | Add `updatedAt` index, paginate |
| `db.notes.toArray()` | notes | 🟡 MEDIUM | Add `projectId` index |
| `db.toolExecutions.where('conversationId')` | toolExecutions | 🟢 LOW | Already indexed |

### 3. Recovery Overhead
**File:** `database-recovery.ts`
- CRITICAL-FIX-2026-01-07: Handles schema v20 migration failures
- Adds overhead on database open
- Necessary but impacts startup time

---

## Recommendations

### Immediate (P0)
1. **Add missing indexes:**
   - `conversations.updatedAt`
   - `notes.projectId`
   - `toolExecutions.timestamp`

### Short-term (P1)
1. **Optimize large queries:**
   - Add pagination to conversation list
   - Implement cursor-based pagination for notes
   - Batch file metadata operations

### Long-term (P2)
1. **Database sharding strategy**
2. **Archive old records**
3. **Implement query caching**

---

*Generated by Codebase Diagnostic Workflow v1.0.0*
*Phase 2: Data Flow*
*Date: 2026-01-09*
