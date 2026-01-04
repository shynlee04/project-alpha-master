# Via-Gent Platform Architecture - Definitive Reference

**Version**: 2.0.0  
**Date**: 2026-01-04T07:06+07:00  
**Status**: ✅ AUTHORITATIVE - Single Source of Truth  
**Maintainer**: BMad Master v2.0

---

## Executive Overview

Via-Gent is a **browser-based IDE** evolving toward a **Knowledge Synthesis Station** with:
- 4 workspace types (IDE, Notes, Knowledge, Study)
- AI agent capabilities with tool permissions
- Local-first persistence (IndexedDB via Dexie.js)
- File System Access API integration
- RAG (Retrieval Augmented Generation) pipeline

This document defines the **canonical architecture** to end all confusion about file locations, data flow, and cross-dependencies.

---

## 🏗️ 5-LAYER ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 5: PRESENTATION (React Components)                               │
│  src/presentation/components/                                           │
│  src/routes/                                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ IDE         │ │ Notes       │ │ Knowledge   │ │ Study       │       │
│  │ Components  │ │ Components  │ │ Components  │ │ Components  │       │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘       │
│         │               │               │               │              │
│         └───────────────┴───────┬───────┴───────────────┘              │
│                                 │                                       │
├─────────────────────────────────┼───────────────────────────────────────┤
│  LAYER 4: APPLICATION SERVICES                                         │
│  src/application/services/                                             │
│  src/hooks/                                                            │
│                                 │                                       │
│  ┌──────────────────────────────┼──────────────────────────────────┐   │
│  │ AgentService  │ ProviderService │ Cross-Workspace Event Bus    │   │
│  └──────────────────────────────┼──────────────────────────────────┘   │
│                                 │                                       │
├─────────────────────────────────┼───────────────────────────────────────┤
│  LAYER 3: DOMAIN (Business Logic)                                      │
│  src/domain/                                                           │
│  src/lib/agent/ (tools, facades)                                       │
│  src/lib/knowledge/                                                    │
│  src/lib/rag/                                                          │
│                                 │                                       │
│  ┌──────────────────────────────┼──────────────────────────────────┐   │
│  │ Agent Entity │ Workspace Binding │ Tool Permission │ RAG Pipeline│   │
│  └──────────────────────────────┼──────────────────────────────────┘   │
│                                 │                                       │
├─────────────────────────────────┼───────────────────────────────────────┤
│  LAYER 2: INFRASTRUCTURE (Zustand Stores)                              │
│  src/infrastructure/persistence/stores/                                │
│                                 │                                       │
│  ┌──────────────────────────────┼──────────────────────────────────┐   │
│  │ agents/   │ conversation/ │ ide/ │ knowledge/ │ project/ │ rag/│   │
│  │ (5 slices)│ (13 slices)   │(7)   │ (7 slices) │ (7 slices)│ (8)│   │
│  └──────────────────────────────┼──────────────────────────────────┘   │
│                                 │                                       │
├─────────────────────────────────┼───────────────────────────────────────┤
│  LAYER 1: PERSISTENCE (Dexie.js + File System)                         │
│  src/infrastructure/persistence/dexie-*.ts                             │
│  src/lib/state/dexie-db-helpers/                                       │
│  src/lib/filesystem/                                                   │
│                                 │                                       │
│  ┌──────────────────────────────┼──────────────────────────────────┐   │
│  │    IndexedDB (Dexie)    │    File System Access API            │   │
│  │    15 tables            │    Local file read/write             │   │
│  └──────────────────────────────┴──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 CANONICAL FILE LOCATIONS

### ✅ AUTHORITATIVE LOCATIONS (Use These)

| Layer | Category | Canonical Location | Notes |
|-------|----------|-------------------|-------|
| **Persistence** | Dexie Types | `src/infrastructure/persistence/dexie-db-*.ts` | Schema, migrations |
| **Persistence** | Dexie Helpers | `src/lib/state/dexie-db-helpers/` | 15 CRUD helper files |
| **Persistence** | Dexie Storage | `src/lib/state/dexie-storage.ts` | With quota handling |
| **Persistence** | File System | `src/lib/filesystem/` | FSA API wrappers |
| **Stores** | All Zustand | `src/infrastructure/persistence/stores/` | Sliced by domain |
| **Domain** | Entities | `src/domain/entities/` + `src/core/entities/` | Agent, Provider, Tool |
| **Domain** | Value Objects | `src/domain/value-objects/` | WorkspaceType, Permission |
| **Domain** | Services | `src/domain/services/` | Orchestration, Validation |
| **Domain** | Agent Tools | `src/lib/agent/tools/` | Tool implementations |
| **Domain** | RAG | `src/lib/rag/` | Chunking, embedding, search |
| **Domain** | Knowledge | `src/lib/knowledge/` | Synthesis, graph, import |
| **Application** | Services | `src/application/services/` | AgentService, ProviderService |
| **Application** | Hooks | `src/hooks/` | Cross-cutting concerns |
| **Presentation** | Components | `src/presentation/components/` | UI organized by workspace |
| **Presentation** | Routes | `src/routes/` | TanStack Router pages |

### ⚠️ FACADE LOCATIONS (Backwards Compatibility Only)

| Facade | Actual Location | Import Path |
|--------|-----------------|-------------|
| `src/lib/state/dexie-db-types.ts` | `@/infrastructure/persistence/dexie-db-*` | `@/lib/state/dexie-db-types` |
| `src/lib/state/dexie-db.ts` | `@/lib/state/dexie-db-helpers/*` | `@/lib/state/dexie-db` |

### ❌ DEPRECATED LOCATIONS (Do Not Use)

| Location | Reason | Replacement |
|----------|--------|-------------|
| `src/lib/state/dexie-db-*.ts` (type files) | Duplicates | Use `@/infrastructure/persistence/` |
| `src/lib/state/knowledge-store.ts` | Deleted | Use `@/lib/state/knowledge/knowledge-store` |

---

## 🗄️ DATA LAYER ARCHITECTURE

### Dexie.js Database Schema (15 Tables)

```typescript
// CANONICAL: src/infrastructure/persistence/dexie-db-class.ts

class ViaGentDatabase extends Dexie {
  // Core IDE Tables
  ideState: Table<IDEStateRecord>;           // IDE layout, active files
  projects: Table<ProjectRecord>;            // Project metadata
  fileMetadata: Table<FileMetadataRecord>;   // File sync status
  fsaHandles: Table<FSAHandleRecord>;        // File System Access handles
  
  // Conversation Tables
  threads: Table<ThreadRecord>;              // Conversation threads
  messages: Table<MessageRecord>;            // Chat messages
  
  // Agent Tables
  agentConfigs: Table<AgentConfigRecord>;    // Agent configurations
  toolExecutionLog: Table<ToolLogRecord>;    // Tool execution history
  
  // Knowledge Tables
  sources: Table<SourceRecord>;              // Imported sources (PDF, URL)
  collections: Table<CollectionRecord>;      // Source collections
  synthesisResults: Table<SynthesisRecord>;  // AI synthesis outputs
  chunks: Table<ChunkRecord>;                // RAG text chunks
  embeddings: Table<EmbeddingRecord>;        // Vector embeddings
  
  // Study Tables
  flashcards: Table<FlashcardRecord>;        // Study flashcards
  quizResults: Table<QuizResultRecord>;      // Quiz history
}
```

### Dexie Helper Organization (15 Files)

```
src/lib/state/dexie-db-helpers/
├── ide-state-helpers.ts           # getIDEState, saveIDEState
├── sync-status-helpers-basic.ts   # getSyncStatus, updateSyncStatus
├── sync-status-helpers-query.ts   # getSyncStatusSummary
├── file-metadata-helpers.ts       # getFileMetadata, saveFileMetadata
├── additional-file-metadata-helpers.ts
├── fsa-handle-helpers.ts          # storeFSAHandle, getFSAHandle
├── session-snapshot-helpers.ts    # saveSessionSnapshot
├── conversation-thread-helpers.ts # getThread, saveThread
├── tool-execution-log-helpers.ts  # addToolLog, getToolLogs
├── source-helpers-basic.ts        # getSource, saveSource
├── source-helpers-search.ts       # searchSources
├── collection-helpers-basic.ts    # getCollection, saveCollection
├── collection-helpers-sources.ts  # getCollectionSources
├── synthesis-result-helpers-create.ts
└── synthesis-result-helpers-crud.ts
```

---

## 🏪 ZUSTAND STORE ARCHITECTURE

### Store Organization by Domain

```
src/infrastructure/persistence/stores/
├── agents/                    # Agent configuration management
│   ├── slices/
│   │   ├── agent-crud-slice.ts       # Create, read, update, delete
│   │   ├── agent-events-slice.ts     # Event emission
│   │   ├── agent-utils-slice.ts      # Helpers
│   │   ├── agent-validation-slice.ts # Validation logic
│   │   └── agent-workspace-bindings-slice.ts
│   ├── agent-selection-store.ts      # Active agent selection
│   ├── types.ts
│   └── index.ts (barrel)
│
├── conversation/              # Chat/conversation management
│   ├── slices/
│   │   ├── create-message-slice.ts
│   │   ├── create-thread-crud-slice.ts
│   │   └── ... (7 slices)
│   ├── conversation-store.ts (unified)
│   └── useConversationStore.ts
│
├── ide/                       # IDE workspace state
│   ├── ide-editor-slice.ts
│   ├── ide-explorer-slice.ts
│   ├── ide-layout-slice.ts
│   ├── ide-project-slice.ts
│   ├── ide-terminal-slice.ts
│   ├── useIDEStore.ts
│   └── index.ts
│
├── knowledge/                 # Knowledge workspace
│   ├── knowledge-sources-slice.ts
│   ├── knowledge-collections-slice.ts
│   ├── knowledge-synthesis-slice.ts
│   ├── useKnowledgeStore.ts
│   └── index.ts
│
├── project/                   # Project management (Zustand reactive)
│   ├── project-crud-slice.ts
│   ├── project-permissions-slice.ts
│   ├── project-bindings-slice.ts
│   ├── useProjectStore.ts
│   └── index.ts
│
├── rag/                       # RAG pipeline state
│   ├── rag-index-slice.ts
│   ├── rag-search-slice.ts
│   ├── rag-chunking-slice.ts
│   ├── rag-chat-slice.ts
│   ├── rag-store.ts
│   └── index.ts
│
├── filesystem/                # File snapshot management
│   ├── snapshot-metadata-slice.ts
│   ├── snapshot-cache-slice.ts
│   ├── useFileSnapshotStore.ts
│   └── index.ts
│
├── providers/                 # LLM provider configuration
│   ├── provider-crud-slice.ts
│   ├── provider-models-slice.ts
│   └── index.ts
│
└── workspace/                 # Cross-workspace context
    ├── workspace-context.ts
    ├── workspace-provider.tsx
    └── index.ts
```

### Store Slice Pattern (≤120 Lines Each)

```typescript
// Pattern: Each slice exports a creator function
// File: agent-crud-slice.ts (≤120 lines)

import { StateCreator } from 'zustand';
import { AgentState } from './types';

export interface AgentCrudSlice {
  agents: Map<string, AgentConfig>;
  createAgent: (config: AgentConfig) => Promise<string>;
  updateAgent: (id: string, updates: Partial<AgentConfig>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  getAgent: (id: string) => AgentConfig | undefined;
}

export const createAgentCrudSlice: StateCreator<
  AgentState,
  [],
  [],
  AgentCrudSlice
> = (set, get) => ({
  agents: new Map(),
  
  createAgent: async (config) => {
    const id = crypto.randomUUID();
    await db.agentConfigs.add({ ...config, id });
    set((state) => ({
      agents: new Map(state.agents).set(id, config)
    }));
    return id;
  },
  
  updateAgent: async (id, updates) => {
    await db.agentConfigs.update(id, updates);
    set((state) => {
      const agents = new Map(state.agents);
      const current = agents.get(id);
      if (current) agents.set(id, { ...current, ...updates });
      return { agents };
    });
  },
  
  deleteAgent: async (id) => {
    await db.agentConfigs.delete(id);
    set((state) => {
      const agents = new Map(state.agents);
      agents.delete(id);
      return { agents };
    });
  },
  
  getAgent: (id) => get().agents.get(id),
});
```

---

## 🔄 DATA FLOW CONTRACTS

### Contract 1: UI → Store → Database

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW: UI → PERSISTENCE                     │
└─────────────────────────────────────────────────────────────────────────┘

   React Component                Zustand Store              Dexie Database
   (Presentation Layer)           (Infrastructure)           (Persistence)
         │                              │                          │
         │  const { createAgent }       │                          │
         │  = useAgentStore()           │                          │
         │                              │                          │
         ├──────onClick──────────────►  │                          │
         │                              │                          │
         │                              ├──await db.agentConfigs.add()──►
         │                              │                          │
         │                              │  ◄──────Promise.resolve()──────┤
         │                              │                          │
         │                              ├──set({ agents: [...] })  │
         │                              │                          │
         │  ◄─────re-render─────────────┤                          │
         │  (zustand subscription)      │                          │
         │                              │                          │
```

### Contract 2: Store Hydration on Mount

```typescript
// Pattern: Hydration Manager
// File: src/infrastructure/persistence/stores/hydration-manager.ts

export async function hydrateStores(): Promise<void> {
  // 1. Check if Dexie is available (SSR safety)
  if (typeof window === 'undefined') return;
  
  // 2. Hydrate each store from IndexedDB
  await Promise.all([
    hydrateAgentStore(),
    hydrateProjectStore(),
    hydrateConversationStore(),
    hydrateKnowledgeStore(),
  ]);
}

// Called from: _app.tsx or root layout
useEffect(() => {
  hydrateStores().catch(console.error);
}, []);
```

### Contract 3: Cross-Workspace Events

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CROSS-WORKSPACE EVENT FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

   IDE Workspace          Event Bus              Notes Workspace
         │                    │                        │
         │  emit('source:imported', {                  │
         │    sourceId, projectId                      │
         │  })                │                        │
         ├───────────────────►│                        │
         │                    │                        │
         │                    ├─────────────────────►  │
         │                    │  on('source:imported') │
         │                    │                        │
         │                    │  ◄──trigger RAG────────┤
         │                    │     indexing           │
         │                    │                        │
```

```typescript
// File: src/infrastructure/events/cross-workspace-event-bus.ts

export type WorkspaceEventType =
  | 'source:imported'
  | 'source:deleted'
  | 'agent:selected'
  | 'agent:configured'
  | 'project:switched'
  | 'file:synced'
  | 'rag:indexed'
  | 'synthesis:completed';

export interface CrossWorkspaceEvent<T = unknown> {
  type: WorkspaceEventType;
  payload: T;
  timestamp: number;
  sourceWorkspace: 'ide' | 'notes' | 'knowledge' | 'study';
}

class CrossWorkspaceEventBus extends EventEmitter {
  emit<T>(type: WorkspaceEventType, payload: T): void {
    super.emit(type, { type, payload, timestamp: Date.now() });
  }
  
  on<T>(type: WorkspaceEventType, handler: (event: CrossWorkspaceEvent<T>) => void): void {
    super.on(type, handler);
  }
}

export const eventBus = new CrossWorkspaceEventBus();
```

---

## 🤖 AGENT TOOL PERMISSION SYSTEM

### Permission Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       TOOL PERMISSION ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────┘

   Agent Config                                   Tool Execution
        │                                              │
        ▼                                              │
   ┌────────────────────┐                              │
   │ Workspace Binding  │◄──────────────────────────────┤
   │ {workspace, agentId}                              │
   └─────────┬──────────┘                              │
             │                                         │
             ▼                                         │
   ┌────────────────────┐                              │
   │ Tool Permissions   │◄──────validate───────────────┤
   │ per (workspace,    │                              │
   │      tool)         │                              │
   └─────────┬──────────┘                              │
             │                                         │
             ▼                                         │
   ┌────────────────────┐                              │
   │ Permission Check   │                              │
   │ - read_file        │──────allow/deny─────────────►│
   │ - write_file       │                              │
   │ - execute_command  │                              │
   │ - search_notes     │                              │
   │ - synthesize       │                              │
   └────────────────────┘                              │
```

### Tool Permission Store

```typescript
// File: src/lib/state/tool-permission-store.ts

export interface ToolPermission {
  toolId: string;
  workspaceType: 'ide' | 'notes' | 'knowledge' | 'study';
  permission: 'allowed' | 'denied' | 'ask';
  autoApprove: boolean;
}

export interface ToolPermissionState {
  permissions: Map<string, ToolPermission>; // key: `${toolId}:${workspace}`
  
  // Actions
  checkPermission: (toolId: string, workspace: WorkspaceType) => PermissionResult;
  setPermission: (toolId: string, workspace: WorkspaceType, permission: ToolPermission) => void;
  getAutoApproveTools: (workspace: WorkspaceType) => string[];
}
```

### Available Agent Tools

| Tool | Workspaces | Permission Level | Description |
|------|------------|-----------------|-------------|
| `read_file` | IDE, Notes | per-file | Read file contents |
| `write_file` | IDE, Notes | per-file | Write/create files |
| `list_files` | IDE, Notes, Knowledge | directory | List directory contents |
| `execute_command` | IDE | dangerous | Run terminal commands |
| `search_notes` | Notes | allowed | Search note content |
| `process_url` | Knowledge | allowed | Import URL content |
| `process_pdf` | Knowledge | allowed | Import PDF content |
| `synthesize` | Knowledge | allowed | AI synthesis |

---

## 📂 FILE SYSTEM ARCHITECTURE

### Dual-Layer File Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FILE SYSTEM DUAL-LAYER ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────┐
   │  LAYER A: IndexedDB (Dexie) - Async Utilities                       │
   │  Location: src/lib/workspace/project-store.ts                       │
   │                                                                      │
   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
   │  │ saveProject  │ │ loadProject  │ │ deleteProject│                 │
   │  │ (async)      │ │ (async)      │ │ (async)      │                 │
   │  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘                 │
   │         │                │                │                         │
   │         └────────────────┴────────────────┘                         │
   │                          │                                          │
   │                          ▼                                          │
   │              ┌───────────────────────┐                              │
   │              │   Dexie.js Database   │                              │
   │              │   (projects table)    │                              │
   │              └───────────────────────┘                              │
   └─────────────────────────────────────────────────────────────────────┘
                              │
                              │ hydrates ↓
                              │
   ┌─────────────────────────────────────────────────────────────────────┐
   │  LAYER B: Zustand Store - Reactive State                            │
   │  Location: src/infrastructure/persistence/stores/project/           │
   │                                                                      │
   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
   │  │ currentProject│ │ openEditors  │ │ activeFile   │                 │
   │  │ (reactive)   │ │ (reactive)   │ │ (reactive)   │                 │
   │  └──────────────┘ └──────────────┘ └──────────────┘                 │
   │                                                                      │
   │  UI subscribes to Zustand for reactivity                            │
   │  Zustand calls Dexie helpers for persistence                        │
   └─────────────────────────────────────────────────────────────────────┘
```

### File Sync Service Per Workspace

```typescript
// Each workspace has its own sync service

// IDE: Full bidirectional sync with FSA + WebContainer
src/lib/filesync/ide-file-sync-service.ts

// Notes: Markdown files from local filesystem
src/lib/filesync/notes-file-sync-service.ts

// Knowledge: Import-only (PDFs, URLs → IndexedDB)
src/lib/filesync/knowledge-file-sync-service.ts

// Study: Flashcard data from Knowledge sources
src/lib/filesync/study-file-sync-service.ts
```

---

## 🔀 ROUTING ARCHITECTURE

### TanStack Router Structure

```
src/routes/
├── __root.tsx                  # Root layout with providers
├── index.tsx                   # Home/Hub redirect
├── hub.tsx                     # Hub dashboard
│
├── ide.tsx                     # IDE workspace layout
├── ide.$projectId.tsx          # IDE with project
│
├── notes.lazy.tsx              # Notes workspace
├── notes.$projectId.lazy.tsx   # Notes with project
│
├── knowledge.lazy.tsx          # Knowledge workspace
├── knowledge.$projectId.lazy.tsx
│
├── study.lazy.tsx              # Study workspace
├── study.$projectId.lazy.tsx
│
├── agents.tsx                  # Agent configuration
├── settings.tsx                # App settings
├── about.lazy.tsx              # About/portfolio
└── about.tsx
```

### Workspace Context Provider

```typescript
// File: src/infrastructure/persistence/stores/workspace/workspace-provider.tsx

export function WorkspaceProvider({ 
  workspace, 
  children 
}: { 
  workspace: 'ide' | 'notes' | 'knowledge' | 'study';
  children: React.ReactNode;
}) {
  // Provides workspace-scoped context
  // - Current workspace type
  // - Bound agent for this workspace
  // - Workspace-specific permissions
  // - Event bus subscriptions
  
  return (
    <WorkspaceContext.Provider value={{ workspace, ... }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
```

---

## 📊 RAG PIPELINE ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           RAG PIPELINE FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

   Source Import                    Processing                    Retrieval
        │                               │                             │
        ▼                               │                             │
   ┌──────────────┐                     │                             │
   │ PDF/URL/Text │──────────►          │                             │
   └──────────────┘                     │                             │
                                        ▼                             │
                              ┌──────────────────┐                    │
                              │ Document Chunker │                    │
                              │ (src/lib/rag/)   │                    │
                              └────────┬─────────┘                    │
                                       │                              │
                                       ▼                              │
                              ┌──────────────────┐                    │
                              │ Embedding Service│                    │
                              │ (local or cloud) │                    │
                              └────────┬─────────┘                    │
                                       │                              │
                                       ▼                              │
                              ┌──────────────────┐                    │
                              │ Orama Index      │                    │
                              │ (vector + text)  │                    │
                              └────────┬─────────┘                    │
                                       │                              │
                                       │◄─────────────────────────────┤
                                       │                    User Query│
                                       ▼                              │
                              ┌──────────────────┐                    │
                              │ Hybrid Retriever │──────────────────► │
                              │ (RRF fusion)     │    Top-K Results   │
                              └──────────────────┘                    │
```

### RAG Store Slices

```typescript
// File: src/infrastructure/persistence/stores/rag/

// rag-index-slice.ts - Index management
interface RagIndexSlice {
  indexedDocuments: Map<string, IndexedDocument>;
  addToIndex: (doc: Document) => Promise<void>;
  removeFromIndex: (docId: string) => Promise<void>;
  getIndexStats: () => IndexStats;
}

// rag-search-slice.ts - Search/retrieval
interface RagSearchSlice {
  searchResults: SearchResult[];
  search: (query: string, options?: SearchOptions) => Promise<SearchResult[]>;
  clearResults: () => void;
}

// rag-chunking-slice.ts - Document processing
interface RagChunkingSlice {
  chunkingStrategy: 'fixed' | 'semantic' | 'recursive';
  chunkDocument: (doc: Document) => Promise<Chunk[]>;
}

// rag-chat-slice.ts - RAG-augmented chat
interface RagChatSlice {
  contextWindow: string[];
  addContext: (context: string) => void;
  clearContext: () => void;
}
```

---

## 🔐 SECURITY CONTRACTS

### API Key Storage (Credential Vault)

```typescript
// File: src/lib/agent/providers/credential-vault.ts

export interface CredentialVault {
  // Store encrypted API keys in IndexedDB
  storeApiKey: (providerId: string, key: string) => Promise<void>;
  
  // Retrieve and decrypt for use
  getApiKey: (providerId: string) => Promise<string | null>;
  
  // Secure deletion
  deleteApiKey: (providerId: string) => Promise<void>;
  
  // Rotation support
  rotateApiKey: (providerId: string, newKey: string) => Promise<void>;
}

// Encryption: Uses Web Crypto API with user-derived key
// Storage: IndexedDB (never localStorage)
// Transmission: Never sent to our backend, only to provider APIs
```

### File Permission Lifecycle

```typescript
// File: src/lib/filesystem/permission-lifecycle.ts

export async function requestFilePermission(
  handle: FileSystemHandle
): Promise<PermissionState> {
  // 1. Check current permission state
  const state = await handle.queryPermission({ mode: 'readwrite' });
  
  if (state === 'granted') return 'granted';
  
  // 2. Request permission from user
  const result = await handle.requestPermission({ mode: 'readwrite' });
  
  // 3. Store handle for session persistence
  if (result === 'granted') {
    await storeFSAHandle(handle);
  }
  
  return result;
}
```

---

## 🧪 TESTING CONTRACTS

### Test File Organization

```
src/
├── **/__tests__/           # Co-located unit tests
│   ├── *.test.ts
│   └── *.test.tsx
│
├── __tests__/              # Root integration tests
│   └── chat.test.ts
│
└── [component]/
    └── __tests__/
        └── [component].test.tsx
```

### Test Utilities

```typescript
// File: src/lib/state/__tests__/test-helper.ts

export function createTestStore<T extends State>(
  initialState: Partial<T>
): UseBoundStore<StoreApi<T>> {
  // Creates isolated store for testing
  // Uses fake-indexeddb for Dexie operations
}

export function mockEventBus(): MockEventBus {
  // Returns spied event bus for testing cross-workspace events
}
```

---

## 📋 MIGRATION CHECKLIST

### When Adding New Feature

- [ ] Determine which layer (Persistence, Domain, Application, Presentation)
- [ ] Check canonical location from this document
- [ ] Create slice if adding to store (≤120 lines)
- [ ] Add types to appropriate types.ts file
- [ ] Update barrel export (index.ts)
- [ ] Add to cross-workspace event bus if needed
- [ ] Write tests in co-located __tests__ folder
- [ ] Update AGENTS.md if new file locations

### When Refactoring

- [ ] Create facade in old location for backwards compatibility
- [ ] Update all imports to new location
- [ ] Keep facade for 2 weeks minimum
- [ ] Run TypeScript validation: `pnpm tsc --noEmit`
- [ ] Run tests: `pnpm test`
- [ ] Update this architecture document

---

## 📊 CURRENT STATE SUMMARY

### ✅ Consolidated (Post ARC-DUP)

| Area | Status | Files |
|------|--------|-------|
| Dexie Storage | ✅ Single location | `src/lib/state/dexie-storage.ts` |
| Dexie Types | ✅ Canonical + Facade | `src/infrastructure/persistence/` |
| Knowledge Store | ✅ Direct imports | `src/lib/state/knowledge/` |

### ⚠️ Needs Work (ARC-GOD Epic)

| Store | Lines | Action |
|-------|-------|--------|
| canvas-store.ts | 623 | Split to slices |
| flashcard-store.ts | 531 | Split to slices |
| use-app-store.ts | 363 | Split to slices |
| study-store.ts | 458 | Split to slices |

### 📏 Size Limits

| File Type | Max Lines | Location |
|-----------|-----------|----------|
| Slice file | 120 | `stores/{domain}/slices/` |
| Store facade | 300 | `stores/{domain}/use*Store.ts` |
| Component | 300 | `presentation/components/` |
| Hook | 150 | `hooks/` |
| Helper | 120 | `*-helpers.ts` |

---

## 🔗 REFERENCES

### Canonical Imports

```typescript
// Dexie Database
import { db, getDb } from '@/lib/state/dexie-db';
import type { ProjectRecord } from '@/lib/state/dexie-db-types';

// Dexie Helpers
import { getIDEState, saveIDEState } from '@/lib/state/dexie-db-helpers/ide-state-helpers';

// Zustand Stores
import { useAgentStore } from '@/infrastructure/persistence/stores/agents';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';

// Event Bus
import { eventBus } from '@/infrastructure/events';

// Domain Services
import { AgentService } from '@/application/services/AgentService';

// Types
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
```

---

**This document is the single source of truth for Via-Gent architecture.**  
**Any deviation must be documented and approved through the correct-course workflow.**

---

**Document Version**: 2.0.0  
**Last Updated**: 2026-01-04T07:06+07:00  
**Next Review**: After ARC-GOD epic completion
