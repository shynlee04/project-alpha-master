# SOURCE OF TRUTH: Project Alpha Architecture

**Version:** 1.1.0
**Created:** 2026-01-31
**Updated:** 2026-02-01
**Status:** CANONICAL - This is the ONLY authoritative architecture document
**Authority:** All other `.planning/` documents are archived. Read ONLY this document.

---

## Document Purpose

This document consolidates the TRUE architectural requirements for Project Alpha, extracted from:
1. **User's actual messages** (not from any previous AI-generated document)
2. **Expert-validated patterns** from production systems (LobeChat, ElizaOS, Orama)
3. **Codebase reality** (grep counts, actual file structure)

**All previous `.planning/` documents are archived to `.planning-archived-2026-01-31/`** because they contained shallow synthesis, terminology confusion, and unconsolidated schema relationships.

---

## Part 1: Core Vision (From User's Words)

### 1.1 Client-Side Privacy Model

> "Client-side as for privacy: unless it is from AI-related services → no client data should be sent to my server"

**Requirements:**
- 100% client-side execution (browser-based)
- AI calls go to providers via BYOK (user's own API keys stored in vault)
- No user data sent to Project Alpha servers
- All CRUD operations stay within client's environment with clear permissions

### 1.2 Storage Architecture

> "PC = file system (with dexiedb as layer to persist snapshot) + browserDB for other non-PC (as also using Dexiedb)"

| Platform | Primary Storage | Persistence Layer | Capability |
|----------|-----------------|-------------------|------------|
| **PC (Desktop)** | File System Access API (FSA) | Dexie.js snapshot of metadata | Full file system access |
| **Non-PC (Mobile/Tablet)** | IndexedDB via Dexie.js | Dexie.js | Sandboxed storage |

**Storage Type Determination:**
- At project creation, detect if `'showDirectoryPicker' in window`
- If yes → offer FSA storage option
- If no → IndexedDB only

### 1.3 Framework Stack

> "The project framework is Tanstack Start"
> "I am using Tanstack AI SDK as for client-side toolings support → though Vercel AI SDK is alluring for agentic features → but consider extensibility and sustainability"

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | TanStack Start | SSR-capable, router-first |
| **State** | Zustand v5 | Slices pattern, useShallow required |
| **Persistence** | Dexie.js | IndexedDB wrapper with live queries |
| **AI SDK** | TanStack AI SDK | Client-side tool calling, multi-provider |
| **Vector Search** | Orama | Client-side embeddings, browser-native |

---

## Part 2: Platform Architecture (NOT "Plugins")

### 2.1 The Critical Distinction

> "not all plugins are lenses... notes, terminal of webcontainer, and even the filetree that I bundle it to the interface that user will then hot load between projects, CRUD project creations and operations"
> "these `two` plugins are loaded always"

**Previous documents got this wrong.** They called everything "plugins" with `alwaysLoaded: true`. This is misleading.

The correct model:

| Category | Components | Nature | Loading |
|----------|------------|--------|---------|
| **PLATFORM OPERATORS** | FileTree, Chat-Cascade | Infrastructure that the app IS | Always running, cannot disable |
| **FEATURE MODULES** | Monaco, Notes, Terminal, Preview | Capabilities that plug into platform | Optional, platform-dependent |

### 2.2 Platform Operators (Always Running)

These are NOT plugins. They ARE the platform.

#### FileTree Operator

> "filetree that I bundle it to the interface that user will then hot load between projects, CRUD project creations and operations and as for how filetree can also CRUD operate files that synchronized and saved to client's file system"

**Bundles:**
- Project CRUD (create, read, update, delete projects)
- File CRUD (create, read, update, delete files within project)
- File sync to client's file system (FSA on PC)
- Hot-loading between projects (switch active project)
- Directory tree rendering

**Why Always Running:**
- Users MUST be able to browse/create/delete files at all times
- Entry point to all other functionality
- Storage layer depends on it

#### Chat-Cascade Operator

> "the chat-cascade ones though it is as said 'Agentic features + RAG → these features (Agentic toolings and tools execution CRUD permissions) most take place around the chat cascade and chat thread management → though look like so but not truly as for `threads` are the indexed and relationships to per project; whatever show on chat cascade are more rendering >>> true CRUD are to the project's storage asset.' >>> still make new files or move files in project"

**Bundles:**
- Thread management (CRUD on chat conversations per project)
- AI tool execution (tools can create/modify/delete files)
- RAG query execution (retrieve embeddings from Orama)
- Tool permission management (what tools AI can use)
- Thread rendering (display chat history)

**Why Always Running:**
- AI assistance must be available at all times
- Tool calls can create/modify files (cross-entity effects)
- RAG queries need to work regardless of other modules
- Thread history is per-project, tightly coupled to project lifecycle

### 2.3 Feature Modules (Optional)

These plug INTO the platform. They can be enabled/disabled per project and are platform-dependent.

| Module | What It Does | Writes To | Platform | Dependencies |
|--------|--------------|-----------|----------|--------------|
| **Monaco** | Code editor for files | Files (via FileService) | PC only | FileTree |
| **Notes** | BlockNote rich text editor | Notes + optional .md files | All | FileTree |
| **Terminal** | WebContainer command executor | Files (via commands) | PC + WebContainer | FileTree |
| **Preview** | iframe renderer for dev server | Nothing (read-only) | PC | Terminal |

### 2.4 Platform Detection and Module Loading

```typescript
interface PlatformCapabilities {
  platform: 'desktop' | 'tablet' | 'mobile';
  hasFileSystemAccess: boolean;   // FSA API available
  hasWebContainer: boolean;       // StackBlitz WebContainer
}

// Platform determines what CAN load
const MODULE_AVAILABILITY: Record<string, PlatformCapabilities['platform'][]> = {
  'monaco': ['desktop'],
  'notes': ['desktop', 'tablet', 'mobile'],
  'terminal': ['desktop'],  // Also requires hasWebContainer
  'preview': ['desktop'],
};

// Project settings determine what DOES load (within platform limits)
interface ProjectSettings {
  enabledModules: ModuleType[];  // User's choice
  defaultModule: ModuleType;
}
```

---

## Part 3: Entity Model and Schema Relationships

### 3.1 The Ownership Principle

> "project-centric... id of the project → still finding confusing contracts and logics"

**Core Rule:** Everything belongs to a Project. There is no "workspace" entity.

```
PROJECT (root)
   ├── FILES (1:N) - via projectId
   ├── THREADS (1:N) - via projectId  
   ├── NOTES (1:N) - via projectId
   └── RAG_INDEX_METADATA (1:1) - via projectId
```

### 3.2 Dexie Database Schema

Based on production patterns (LobeChat, ElizaOS) and user requirements:

```typescript
// @/infrastructure/persistence/dexie-schema.ts

export const DB_SCHEMA = {
  // ═══════════════════════════════════════════════════════════════
  // CORE ENTITIES - Project owns all
  // ═══════════════════════════════════════════════════════════════
  
  projects: '&id, name, storageType, createdAt, updatedAt',
  
  files: '&id, projectId, relativePath, name, isDirectory, syncStatus, modifiedAt',
  
  threads: '&id, projectId, title, model, provider, ragEnabled, createdAt, updatedAt',
  
  notes: '&id, projectId, title, filePath, createdAt, updatedAt',
  
  // ═══════════════════════════════════════════════════════════════
  // RAG METADATA - Tracks what's indexed (vectors live in Orama)
  // ═══════════════════════════════════════════════════════════════
  
  ragIndexMetadata: '&projectId, documentCount, lastIndexedAt, status',
  
  // ═══════════════════════════════════════════════════════════════
  // USER DATA
  // ═══════════════════════════════════════════════════════════════
  
  settings: '&id',  // User preferences, BYOK keys (encrypted)
};
```

### 3.3 Entity Type Definitions

```typescript
// @/domain/schemas/project.schema.ts

interface Project {
  id: string;                              // UUID
  name: string;
  description?: string;
  storageType: 'fsa' | 'indexeddb';
  directoryHandle?: FileSystemDirectoryHandle;  // FSA only, not serialized
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectSettings {
  enabledModules: ModuleType[];
  defaultModule: ModuleType;
  theme?: 'light' | 'dark';
}

// NO workspaceBindings field - this is BANNED
```

```typescript
// @/domain/schemas/file.schema.ts

interface FileMetadata {
  id: string;                              // UUID or path-based
  projectId: string;                       // Owner - REQUIRED
  relativePath: string;                    // Path within project
  name: string;
  isDirectory: boolean;
  size?: number;
  mimeType?: string;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  createdAt: Date;
  modifiedAt: Date;
}

// NO workspaceId field - this is BANNED
```

```typescript
// @/domain/schemas/thread.schema.ts

interface Thread {
  id: string;                              // UUID
  projectId: string;                       // Owner - REQUIRED
  title: string;
  model: string;                           // e.g., 'gpt-4o', 'claude-3.5-sonnet'
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  messages: ThreadMessage[];               // EMBEDDED, not separate table
  metadata: ThreadMetadata;
  toolPermissions: ThreadToolPermissions;
  createdAt: Date;
  updatedAt: Date;
}

interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  parts: MessagePart[];                      // Parts-based content (NOT string)
  createdAt: Date;
}

// Message content is structured into typed parts
type MessagePart =
  | { type: 'text'; content: string }
  | { type: 'code'; language: string; content: string; filename?: string }
  | { type: 'artifact'; id: string; title: string; content: string; language?: string }
  | { type: 'thinking'; content: string; isCollapsed?: boolean }
  | { type: 'diagram'; diagramType: 'mermaid' | 'svg'; content: string }
  | { type: 'tool_call'; toolCall: ToolCall }
  | { type: 'tool_result'; toolResult: ToolResult }
  | { type: 'error'; message: string; code?: string }
  | { type: 'image'; url: string; alt?: string };

interface ThreadMetadata {
  tokenCount: number;
  contextFiles?: string[];                 // File paths used as context
  ragEnabled: boolean;
}

interface ThreadToolPermissions {
  grantedPermissions: ToolPermissionLevel[];
  toolOverrides?: Record<string, { enabled: boolean; autoApprove: boolean }>;
}
```

### 3.4 AI Tools Schema

> "the tools as for giving agentic features and CRUD for AI agents they are another set of schema too? are they have any sort of relationships here"

**Answer:** Tools are CODE-DEFINED (static registry), not persisted. But TOOL CALLS and TOOL RESULTS are embedded in ThreadMessage.

```typescript
// @/domain/schemas/tool.schema.ts

// STATIC - NOT persisted to database
type ToolPermissionLevel = 'read' | 'write' | 'execute';

interface ToolDefinition {
  name: string;
  description: string;
  category: 'file' | 'rag' | 'terminal' | 'system';
  requiredPermissions: ToolPermissionLevel[];
  inputSchema: ZodSchema;
  outputSchema: ZodSchema;
  needsApproval: boolean;
  hasSideEffects: boolean;  // Creates/modifies files?
}

// STATIC REGISTRY - code-defined, not database
const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  'read_file': {
    name: 'read_file',
    category: 'file',
    requiredPermissions: ['read'],
    needsApproval: false,
    hasSideEffects: false,
    // ...
  },
  'write_file': {
    name: 'write_file',
    category: 'file',
    requiredPermissions: ['write'],
    needsApproval: true,
    hasSideEffects: true,  // Creates/modifies FileMetadata
    // ...
  },
  'search_rag': {
    name: 'search_rag',
    category: 'rag',
    requiredPermissions: ['read'],
    needsApproval: false,
    hasSideEffects: false,
    // ...
  },
  'run_command': {
    name: 'run_command',
    category: 'terminal',
    requiredPermissions: ['execute'],
    needsApproval: true,
    hasSideEffects: true,  // May create/modify files
    // ...
  },
};
```

```typescript
// PERSISTED - embedded in ThreadMessage

interface ToolCall {
  id: string;                              // UUID
  toolName: string;                        // References TOOL_REGISTRY
  args: unknown;                           // Parsed arguments
  status: 'pending' | 'approved' | 'rejected' | 'running' | 'completed' | 'failed';
  requestedAt: Date;
  approvedAt?: Date;
  approvedBy?: 'user' | 'auto';
}

interface ToolResult {
  callId: string;                          // References ToolCall.id
  output: unknown;
  error?: string;
  executedAt: Date;
  durationMs: number;
  sideEffects?: {
    createdFiles?: string[];               // Paths of files created
    modifiedFiles?: string[];              // Paths of files modified
    deletedFiles?: string[];               // Paths of files deleted
  };
}
```

### 3.5 RAG Schema

> "the RAG area → as for when allowing user embedding and index their asset in project → and as the AI agents are given agentic permissions CRUD and RAG retrieve these → the chat cascade plugin will 'show' this → but then how about the database"
> "thread is indexed and is having relationship per project → as for given RAG AI agent can retrieve past chat session of the project → again another database schema"

**Answer:** RAG embeddings live in ORAMA (in-memory vector store), NOT in Dexie. We track metadata in Dexie for relationship integrity.

```typescript
// ORAMA SCHEMA - in-memory vector store, persisted via plugin
const ORAMA_RAG_SCHEMA = {
  id: 'string',
  projectId: 'string',                     // For filtering
  sourceType: 'string',                    // 'file' | 'thread' | 'note'
  sourceId: 'string',                      // References File/Thread/Note id
  sourcePath: 'string',                    // For files: relative path
  content: 'string',                       // Searchable text
  embedding: 'vector[512]',                // TensorFlow.js 512-dim
  'metadata.title': 'string',
  'metadata.indexedAt': 'string',
};

// DEXIE SCHEMA - tracks what's indexed
interface RAGIndexMetadata {
  projectId: string;                       // PK, 1:1 with Project
  documentCount: number;
  lastIndexedAt: Date;
  indexSizeBytes: number;
  indexedFiles: string[];                  // File IDs
  indexedThreads: string[];                // Thread IDs
  indexedNotes: string[];                  // Note IDs
  status: 'empty' | 'indexing' | 'ready' | 'error';
  errorMessage?: string;
}
```

**Thread Indexing Flow:**

```
Thread → Messages → Concatenate Content → Generate Embedding → Store in Orama
                                                                      │
                                         RAGDocument.sourceType = 'thread'
                                         RAGDocument.sourceId = thread.id
```

---

## Part 4: Entity Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    PROJECT                                           │
│                           (Root Entity - OWNS everything)                            │
│   id, name, storageType, settings, createdAt, updatedAt                             │
└───────────────────────────────────────┬─────────────────────────────────────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┬──────────────┐
         │                              │                              │              │
         │ OWNS (1:N)                   │ OWNS (1:N)                   │ OWNS (1:N)   │ OWNS (1:1)
         ▼                              ▼                              ▼              ▼
┌─────────────────────┐        ┌─────────────────────┐        ┌─────────────┐  ┌────────────────┐
│    FILE_METADATA    │        │       THREAD        │        │    NOTE     │  │ RAG_INDEX_META │
│   (Dexie table)     │        │    (Dexie table)    │        │(Dexie table)│  │ (Dexie table)  │
├─────────────────────┤        ├─────────────────────┤        ├─────────────┤  ├────────────────┤
│ id                  │        │ id                  │        │ id          │  │ projectId (PK) │
│ projectId ◄─────────┼────────┤ projectId           │        │ projectId   │  │ documentCount  │
│ relativePath        │        │ title, model        │        │ title       │  │ status         │
│ syncStatus          │        │ toolPermissions     │        │ content     │  │ indexedFiles[] │
│ createdAt           │        │ messages[] ─────────┼───┐    │ filePath?   │  │ indexedThreads│
└─────────────────────┘        └─────────────────────┘   │    └─────────────┘  └────────────────┘
         ▲                                               │                              │
         │                                               │                              │
         │ CREATED/MODIFIED BY                           │ EMBEDS (1:N)                │ TRACKS
         │ (via ToolResult.sideEffects)                  ▼                              │
         │                              ┌─────────────────────┐                         │
         │                              │   THREAD_MESSAGE    │                         │
         │                              ├─────────────────────┤                         │
         │                              │ id, role, content   │                         │
         │                              │ toolCalls[] ────────┼───┐                     │
         │                              │ toolResults[] ──────┼─┐ │                     │
         │                              └─────────────────────┘ │ │                     │
         │                                                      │ │                     │
         │                              ┌───────────────────────┘ │                     │
         │                              │                         │                     │
         │                              ▼                         ▼                     │
         │                      ┌─────────────┐           ┌─────────────┐               │
         │                      │  TOOL_CALL  │           │ TOOL_RESULT │               │
         │                      │ (embedded)  │           │ (embedded)  │               │
         │                      ├─────────────┤           ├─────────────┤               │
         │                      │ id          │           │ callId      │               │
         │                      │ toolName    │◄──────────┤ output      │               │
         │                      │ args        │           │ sideEffects │───────────────┤
         │                      │ status      │           │  .created   │───────────────┘
         └──────────────────────┤             │           │  .modified  │
                                └─────────────┘           │  .deleted   │
                                                          └─────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              ORAMA RAG INDEX (SEPARATE)                              │
│                         (In-memory, persisted via plugin)                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│   Per-project Orama instance with RAG_DOCUMENTs:                                    │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │ RAG_DOCUMENT                                                                 │   │
│   │ - id, projectId, sourceType ('file'|'thread'|'note'), sourceId              │   │
│   │ - content (text), embedding (vector[512])                                    │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        TOOL_REGISTRY (STATIC, NOT PERSISTED)                         │
│                           (Code-defined in @/domain/tools/)                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│   TOOL_REGISTRY = {                                                                  │
│     'read_file':   { permissions: ['read'], hasSideEffects: false },                │
│     'write_file':  { permissions: ['write'], hasSideEffects: true },                │
│     'delete_file': { permissions: ['write'], hasSideEffects: true },                │
│     'search_rag':  { permissions: ['read'], hasSideEffects: false },                │
│     'run_command': { permissions: ['execute'], hasSideEffects: true },              │
│   }                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 5: State Layer Architecture

### 5.1 Four-Layer State Model

| Layer | Technology | Persistence | What Lives Here |
|-------|------------|-------------|-----------------|
| **L1: UI State** | Zustand (NO persist) | Session only | Panel sizes, modals, hover states |
| **L2: Session State** | Zustand + hydration | Survives refresh | Active project, open tabs, undo stack |
| **L3: Persisted State** | Dexie (IndexedDB) | Long-term | Projects, files, threads, notes, settings |
| **L4: File Content** | FSA or OPFS | Long-term | Actual file bytes |

### 5.2 What Goes Where

| Data | Layer | Technology | Read Pattern | Write Pattern |
|------|-------|------------|--------------|---------------|
| Panel open/closed | L1 | Zustand | `useLayoutStore` | `togglePanel()` |
| Active project ID | L2 | Zustand + hydrate | `useProjectStore` | `setActiveProject()` |
| Project metadata | L3 | Dexie | `useLiveQuery` | `db.projects.put()` |
| File metadata | L3 | Dexie | `useLiveQuery` | `FileService.create()` |
| Thread + messages | L3 | Dexie | `useLiveQuery` | `ThreadService.create()` |
| File content | L4 | FSA/OPFS | `StorageGateway.read()` | `StorageGateway.write()` |

### 5.3 Zustand Rules

- **useShallow REQUIRED** for all store selectors
- **NO persist middleware** on entity data (use Dexie)
- **Slices pattern** for stores >120 lines
- **Max 300 lines** per store file

---

## Part 6: What is BANNED

### 6.1 Terminology Bans

| Term | Status | Replacement |
|------|--------|-------------|
| `workspaceBindings` | **BANNED** | `enabledModules` in ProjectSettings |
| `WorkspaceBindings` | **BANNED** | `ModuleType[]` |
| `workspaceId` | **BANNED** | `projectId` only |
| `WorkspaceId` | **BANNED** | Does not exist |
| `workspace-*` files | **BANNED** | Rename to `module-*`, `platform-*`, or domain name |

### 6.2 Current Violation Counts (From Codebase)

These must be eliminated in the refactor:

| Pattern | Count | Action |
|---------|-------|--------|
| `workspaceBindings` references | ~368 | ELIMINATE |
| `workspaceId` references | ~642 | ELIMINATE |
| `workspace-*` named files | ~44 | RENAME or DELETE |

### 6.3 Architectural Bans

- **NO** Zustand persist on entity data
- **NO** duplicate type definitions (single source in `@/domain/schemas/`)
- **NO** direct storage access from modules (use Services)
- **NO** `@/lib/` imports (use `@/domain/` or `@/infrastructure/`)
- **NO** files >300 lines in stores, >400 lines in components

---

## Part 7: Service Architecture

### 7.1 Service Responsibility

Modules (Monaco, Notes, Terminal) do NOT write directly to storage. They request writes via Services.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              PLATFORM OPERATORS                                      │
│                    (FileTree, Chat-Cascade - always running)                         │
└───────────────────────────────────────┬─────────────────────────────────────────────┘
                                        │
                                        │ CALL
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  SERVICES                                            │
│                           (Gatekeepers for writes)                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│   FileService      │   ThreadService   │   NoteService   │   RAGService            │
│   - create         │   - create        │   - create      │   - index               │
│   - read           │   - addMessage    │   - update      │   - search              │
│   - update         │   - addToolCall   │   - delete      │   - reindex             │
│   - delete         │   - addToolResult │   - syncToFile  │                         │
│   - sync           │                   │                 │                         │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ PERSIST TO
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│   Dexie (L3)       │   FSA/OPFS (L4)   │   Orama (RAG)                              │
│   - projects       │   - file content   │   - embeddings                            │
│   - files          │                    │   - vector search                         │
│   - threads        │                    │                                           │
│   - notes          │                    │                                           │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Who Can Write What

| Entity | Authorized Writers | Via Service |
|--------|-------------------|-------------|
| Project | FileTree operator | ProjectService |
| FileMetadata | FileTree, Chat (tools), Terminal | FileService |
| Thread | Chat-Cascade operator | ThreadService |
| Note | Notes module | NoteService |
| RAG Document | Any (on user trigger) | RAGService |

---

## Part 8: Event Bus Architecture

### 8.1 Domain Event System

Cross-operator and cross-module communication uses a unified domain event bus.

```typescript
// @/infrastructure/events/domain-event-bus.ts

type DomainEventType =
  | 'file:created' | 'file:updated' | 'file:deleted' | 'file:synced'
  | 'project:created' | 'project:deleted' | 'project:switched'
  | 'thread:created' | 'thread:updated' | 'thread:deleted'
  | 'note:created' | 'note:updated' | 'note:deleted'
  | 'tool:executed' | 'tool:approved' | 'tool:rejected'
  | 'rag:indexed' | 'rag:search_completed';

interface DomainEvent<T = unknown> {
  type: DomainEventType;
  payload: T;
  timestamp: Date;
  source: 'file-tree' | 'chat-cascade' | 'monaco' | 'notes' | 'terminal' | 'rag';
  projectId: string;
}

// Singleton event bus
class DomainEventBus {
  private listeners = new Map<DomainEventType, Set<(event: DomainEvent) => void>>();
  
  emit<T>(event: DomainEvent<T>): void;
  on(type: DomainEventType, handler: (event: DomainEvent) => void): () => void;
  off(type: DomainEventType, handler: (event: DomainEvent) => void): void;
}

export const domainEventBus = new DomainEventBus();
```

### 8.2 Event Flow Examples

| Action | Event Emitted | Subscribers |
|--------|---------------|-------------|
| User creates file via FileTree | `file:created` | RAG (re-index), Monaco (refresh tree) |
| AI tool writes file | `file:created` + `tool:executed` | FileTree (refresh), RAG (index) |
| User switches project | `project:switched` | All modules (reload state) |
| Thread message added | `thread:updated` | RAG (if thread indexing enabled) |

### 8.3 Event Bus Rules

- **Operators emit, modules subscribe** - FileTree and Chat-Cascade are primary emitters
- **No direct coupling** - Modules don't import each other, they subscribe to events
- **Async by default** - Event handlers run asynchronously
- **Error isolation** - One handler failure doesn't break others

---

## Part 9: State Synchronization

### 9.1 Zustand ↔ Dexie Sync Pattern

```typescript
// Pattern: Dexie as source of truth, Zustand for reactive UI

// 1. HYDRATION: On app load, hydrate Zustand from Dexie
async function hydrateStore() {
  const projects = await db.projects.toArray();
  const activeProjectId = localStorage.getItem('activeProjectId');
  
  useProjectStore.setState({
    projects,
    activeProjectId,
    isHydrated: true,
  });
}

// 2. WRITE: Always write to Dexie first, then update Zustand
async function createProject(data: ProjectInput) {
  // Write to Dexie (source of truth)
  const project = await db.projects.add(data);
  
  // Update Zustand (reactive UI)
  useProjectStore.getState().addProject(project);
  
  // Emit event
  domainEventBus.emit({ type: 'project:created', payload: project });
  
  return project;
}

// 3. LIVE QUERIES: Use Dexie liveQuery for collections
function useProjects() {
  return useLiveQuery(() => db.projects.toArray());
}
```

### 9.2 What Goes Where

| Data Type | Zustand | Dexie | Why |
|-----------|---------|-------|-----|
| UI state (panels, modals) | ✅ | ❌ | Ephemeral, no persistence needed |
| Active selections (projectId, fileId) | ✅ | ❌ | Session state, localStorage backup |
| Entity data (projects, files, threads) | ❌ | ✅ | Needs migrations, relationships |
| User settings | ❌ | ✅ | Persist across sessions |

### 9.3 Conflict Resolution

If Zustand and Dexie disagree (stale UI):
1. **Dexie wins** - It's the source of truth
2. **Re-hydrate Zustand** - Force refresh from Dexie
3. **Log discrepancy** - For debugging

---

## Part 10: Service Contracts

### 10.1 FileService

```typescript
// @/domain/services/file.service.ts

interface FileService {
  // CRUD Operations
  create(projectId: string, path: string, content?: string): Promise<Result<FileMetadata, FileError>>;
  read(fileId: string): Promise<Result<FileMetadata, FileError>>;
  readByPath(projectId: string, path: string): Promise<Result<FileMetadata, FileError>>;
  update(fileId: string, updates: Partial<FileMetadata>): Promise<Result<FileMetadata, FileError>>;
  delete(fileId: string): Promise<Result<void, FileError>>;
  
  // Content Operations (L4 storage)
  readContent(fileId: string): Promise<Result<string, FileError>>;
  writeContent(fileId: string, content: string): Promise<Result<void, FileError>>;
  
  // Sync Operations
  sync(projectId: string): Promise<Result<SyncResult, FileError>>;
  getSyncStatus(fileId: string): Promise<SyncStatus>;
  
  // Query Operations
  listByProject(projectId: string): Promise<FileMetadata[]>;
  listByDirectory(projectId: string, dirPath: string): Promise<FileMetadata[]>;
}

// Error Types
type FileError =
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'ALREADY_EXISTS'; message: string; existingId: string }
  | { code: 'PERMISSION_DENIED'; message: string }
  | { code: 'STORAGE_QUOTA'; message: string; available: number }
  | { code: 'SYNC_CONFLICT'; message: string; local: FileMetadata; remote: FileMetadata }
  | { code: 'INVALID_PATH'; message: string };

// Events Emitted
// - file:created (after create)
// - file:updated (after update, writeContent)
// - file:deleted (after delete)
// - file:synced (after sync)
```

### 10.2 ThreadService

```typescript
// @/domain/services/thread.service.ts

interface ThreadService {
  // CRUD Operations
  create(projectId: string, title: string, model: string, provider: string): Promise<Result<Thread, ThreadError>>;
  get(threadId: string): Promise<Result<Thread, ThreadError>>;
  update(threadId: string, updates: Partial<Thread>): Promise<Result<Thread, ThreadError>>;
  delete(threadId: string): Promise<Result<void, ThreadError>>;
  
  // Message Operations
  addMessage(threadId: string, message: Omit<ThreadMessage, 'id' | 'createdAt'>): Promise<Result<ThreadMessage, ThreadError>>;
  updateMessage(threadId: string, messageId: string, updates: Partial<ThreadMessage>): Promise<Result<ThreadMessage, ThreadError>>;
  
  // Query Operations
  listByProject(projectId: string): Promise<Thread[]>;
  getMessages(threadId: string, limit?: number, before?: string): Promise<ThreadMessage[]>;
  
  // Compaction
  compact(threadId: string): Promise<Result<Thread, ThreadError>>;
}

// Error Types
type ThreadError =
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'PROJECT_NOT_FOUND'; message: string }
  | { code: 'INVALID_MODEL'; message: string }
  | { code: 'COMPACTION_FAILED'; message: string };

// Events Emitted
// - thread:created, thread:updated, thread:deleted
```

### 10.3 Result Type Pattern

All services use Result type (not exceptions):

```typescript
type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

// Usage
const result = await FileService.create(projectId, path);
if (result.ok) {
  console.log('Created:', result.value);
} else {
  console.error('Failed:', result.error.code, result.error.message);
}
```

---

## Part 11: Fail-Safe Mechanisms

### 11.1 Five-Layer Fail-Safe

| Layer | When | What | Catches |
|-------|------|------|---------|
| **Compile-Time** | `pnpm typecheck` | TypeScript strict mode | Type mismatches, missing fields |
| **Lint-Time** | `pnpm lint` | ESLint rules | Import violations, banned terms |
| **Test-Time** | `pnpm test` | Vitest | Schema relationship breaks |
| **Runtime** | App execution | Zod validation at boundaries | Invalid external data |
| **Observability** | Dev mode | Integrity dashboard | Orphaned entities, broken refs |

### 11.2 ESLint Rules Required

```javascript
{
  'no-restricted-imports': ['error', {
    patterns: [
      { group: ['**/entities/*'], message: 'Import from @/domain/schemas' },
      { group: ['@/lib/*'], message: 'Use @/domain/* or @/infrastructure/*' },
    ]
  }],
  'no-restricted-syntax': ['error', 
    { selector: 'Identifier[name=/[Ww]orkspace[Bb]indings/]', message: 'BANNED' },
    { selector: 'Identifier[name=/workspaceId/]', message: 'BANNED - use projectId' },
  ]
}
```

---

## Part 12: Expert Validation Sources

This architecture is validated against production patterns from:

| Source | What We Learned |
|--------|-----------------|
| **LobeChat** | Dexie schema with sessions, messages, files, plugins tables |
| **ElizaOS** | Plugin system with schema registration, SQL tables for agents |
| **Orama Docs** | Vector search in browser, `vector[512]` with TensorFlow.js |
| **Supabase RAG Patterns** | Messages with `tool_call JSONB`, documents with embeddings |
| **Dexie.js Docs** | Version migrations, live queries, relationship patterns |

---

## Part 13: What This Document Replaces

All documents in `.planning-archived-2026-01-31/` are superseded by this document:

| Archived File | Why Archived |
|---------------|--------------|
| `DOMAIN-MODEL-2026-01-31.md` | Called FileTree/Chat "plugins" instead of platform operators |
| `PLUGIN-CONTRACTS-2026-01-31.md` | Shallow "Core/Editor/Viewer" categories miss the entanglement |
| `SCHEMA-ARCHITECTURE-2026-01-31.md` | Good patterns but not validated against codebase |
| `RAG-TOOLS-FAILSAFE-2026-01-31.md` | Theory without validation |
| `ROADMAP-REVISED-2026-01-31.md` | Based on flawed research synthesis |
| `NO-WORKSPACE-MANDATE.md` | Correct kill targets but wrong architecture model |
| All others | Forward-only generation without backward validation |

---

## Document Versioning

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-31 | Initial creation from user requirements + expert validation |
| 1.1.0 | 2026-02-01 | ThreadMessage parts-based, added Event Bus, State Sync, Service Contracts |

---

**This is the ONLY authoritative architecture document for Project Alpha.**

*Created: 2026-01-31*
*Method: Extracted from user's actual messages + expert pattern validation*
*Previous documents archived to: `.planning-archived-2026-01-31/`*
