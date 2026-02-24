# Domain Model: Project Alpha Entity Architecture

**Researched:** 2026-01-31
**Updated:** 2026-01-31 (corrected plugin model)
**Confidence:** HIGH (Context7 + official docs verified)

---

## Executive Summary

This document defines the TRUE entity model for Project Alpha. Previous attempts failed because they treated "workspace" as an entity when it's actually a **display mode**. This model establishes clear ownership, relationships, and lifecycles.

---

## Core Principle: Project-Centric Ownership

```
Everything belongs to a Project.
Plugins REQUEST write operations via Services (gatekeepers).
Services enforce single-writer principle per entity type.
Platform determines available plugins, not data structure.
```

### Critical Distinction: Plugin Categories

NOT all plugins are passive "lenses." There are THREE categories:

| Category | Examples | Behavior | Always Loaded |
|----------|----------|----------|---------------|
| **CORE OPERATORS** | FileTree, Chat | WRITE to project storage | ✅ Yes |
| **ACTIVE EDITORS** | Notes, Monaco, Terminal | WRITE via core services | ❌ Optional |
| **PASSIVE VIEWERS** | Preview | READ-ONLY lenses | ❌ Optional |

**Key insight:** FileTree and Chat are ALWAYS loaded because they provide essential CRUD operations that other plugins depend on.

---

## Entity Definitions

### 1. Project (Root Entity)

**What it IS:** A user's work container. The only entity users "create" and "manage."

**What it OWNS:**
- Files (via file system or IndexedDB)
- Threads (chat conversations)
- Notes (BlockNote documents)
- Settings (project-specific configuration)

**Schema:**
```typescript
interface Project {
  id: string;                    // UUID - primary key
  name: string;
  description?: string;
  storageType: 'fsa' | 'indexeddb';  // Determined at creation
  directoryHandle?: FileSystemDirectoryHandle;  // FSA only
  createdAt: Date;
  updatedAt: Date;
  settings: ProjectSettings;
}

interface ProjectSettings {
  defaultPlugin: PluginType;     // What opens by default
  enabledPlugins: PluginType[];  // What plugins are available
  theme?: 'light' | 'dark';
  // Plugin-specific settings nested here
  monaco?: MonacoSettings;
  notes?: NotesSettings;
  chat?: ChatSettings;
}
```

**Lifecycle:**
1. User creates project → selects storage type (FSA if available, else IndexedDB)
2. Project persisted to Dexie (metadata) + storage (files)
3. User opens project → route `/$projectId`
4. Plugins load based on `enabledPlugins` + platform capabilities

**NOT a Project:**
- Workspace (this is a display mode, not an entity)
- WorkspaceBindings (eliminated - platform determines plugins)

---

### 2. File (Owned by Project)

**What it IS:** A file or directory within a project's storage.

**What it OWNS:** Nothing (leaf entity)

**Schema:**
```typescript
interface FileMetadata {
  id: string;                    // Path-based: `${projectId}:${relativePath}`
  projectId: string;             // Owner
  relativePath: string;          // Path within project
  name: string;
  isDirectory: boolean;
  size?: number;
  mimeType?: string;
  createdAt: Date;
  modifiedAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
}

// Content stored separately (not in Dexie for large files)
interface FileContent {
  id: string;                    // Same as FileMetadata.id
  content: string | Uint8Array;  // Text or binary
}
```

**Why ONE FileMetadata type:**
Previous codebase had 6 different FileMetadata definitions. This is the SINGLE source of truth. All other references must import from `@/domain/schemas/file.schema.ts`.

---

### 3. Thread (Owned by Project)

**What it IS:** A chat conversation with AI, including history and context.

**What it OWNS:** Messages (embedded, not separate table)

**Schema:**
```typescript
interface Thread {
  id: string;                    // UUID
  projectId: string;             // Owner
  title: string;
  model: string;                 // e.g., 'gpt-4o', 'claude-3.5-sonnet'
  provider: AIProvider;
  createdAt: Date;
  updatedAt: Date;
  messages: ThreadMessage[];     // Embedded for query efficiency
  metadata: ThreadMetadata;
}

interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  createdAt: Date;
}

interface ThreadMetadata {
  tokenCount: number;
  contextFiles?: string[];       // File paths used as context
  ragEnabled: boolean;
}
```

**Design Decision:** Messages embedded in Thread (not separate table)
- **Why:** Threads are always loaded with their messages. Separate tables create N+1 queries.
- **Trade-off:** Large threads (>1000 messages) may need pagination. Handle at query level, not schema level.

---

### 4. Note (Owned by Project)

**What it IS:** A BlockNote document (rich text with blocks).

**What it OWNS:** Nothing (content is the document itself)

**Schema:**
```typescript
interface Note {
  id: string;                    // UUID
  projectId: string;             // Owner
  title: string;
  filePath?: string;             // If synced to file system
  content: BlockNoteContent;     // BlockNote's native format
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  linkedFiles?: string[];        // Files referenced in note
}

type BlockNoteContent = Block[];  // BlockNote's block array
```

**Relationship to Files:**
- Notes CAN be persisted as `.md` files (via `filePath`)
- Notes CAN also exist only in Dexie (no file)
- The `linkedFiles` array enables RAG context

---

### 5. Plugin (NOT an entity - it's a capability)

**What it IS:** A feature module that provides UI and functionality.

**What it OWNS:** Nothing. Plugins REQUEST write operations via Services.

**Definition:**
```typescript
type PluginType = 
  | 'file-tree'    // CORE - Always loaded, CRUD on files
  | 'chat'         // CORE - Always loaded, CRUD on threads, AI tools write files
  | 'monaco'       // EDITOR - Code editor (PC only)
  | 'notes'        // EDITOR - BlockNote editor (all platforms)
  | 'terminal'     // EDITOR - xterm.js (PC + WebContainer only)
  | 'preview';     // VIEWER - iframe preview (PC only)

type PluginPermission = 'core' | 'write' | 'read-only';
type EntityType = 'file' | 'thread' | 'note';

interface PluginDefinition {
  type: PluginType;
  displayName: string;
  icon: string;
  permission: PluginPermission;      // What level of access
  alwaysLoaded: boolean;             // Core plugins cannot be disabled
  canWriteEntities: EntityType[];    // What this plugin can create/modify
  platforms: Platform[];             // Where it can run
  capabilities: PluginCapability[];
  dependencies?: PluginType[];       // Other plugins required
}

type Platform = 'desktop' | 'tablet' | 'mobile';
```

**Plugin Permission Levels:**

| Permission | Meaning | Examples |
|------------|---------|----------|
| `core` | Essential for app function, always loaded | FileTree, Chat |
| `write` | Can modify entities via Services | Monaco, Notes, Terminal |
| `read-only` | Can only view/render data | Preview |

**What Each Plugin Can Write:**

| Plugin | canWriteEntities | How |
|--------|------------------|-----|
| FileTree | `['file']` | Direct CRUD via FileService |
| Chat | `['thread', 'file']` | Threads via ThreadService, files via AI tool calls |
| Notes | `['note', 'file']` | Notes via NotesService, optional .md sync via FileService |
| Terminal | `['file']` | Commands create/modify files via FileService |
| Monaco | `['file']` | Edits file content via FileService |
| Preview | `[]` | Read-only - true lens |

**Why Plugins are NOT entities:**
- They don't have IDs
- They don't persist independently
- They are instantiated per-session based on project settings + platform
- They REQUEST operations via Services - they don't own data

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                         PROJECT                              │
│              (owns all data, authoritative)                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
    ┌───────────┐     ┌───────────┐     ┌───────────┐
    │FileService│     │ThreadSvc  │     │NotesService│
    │(gatekeeper)│    │(gatekeeper)│    │(gatekeeper)│
    └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
          │                 │                 │
    ┌─────┴─────┐     ┌─────┴─────┐     ┌─────┴─────┐
    │ Writers:  │     │ Writers:  │     │ Writers:  │
    │ - FileTree│     │ - Chat    │     │ - Notes   │
    │ - Chat    │     │           │     │           │
    │ - Terminal│     │           │     │           │
    │ - Monaco  │     │           │     │           │
    │ - Notes   │     │           │     │           │
    └───────────┘     └───────────┘     └───────────┘
          │                 │                 │
          ▼                 ▼                 ▼
    ┌─────────┐       ┌─────────┐       ┌─────────┐
    │  FILES  │       │ THREADS │       │  NOTES  │
    │ (many)  │       │ (many)  │       │ (many)  │
    └─────────┘       └────┬────┘       └─────────┘
                           │
                     EMBEDS │
                           ▼
                     ┌─────────┐
                     │MESSAGES │
                     │ (many)  │
                     └─────────┘
```

**Key:** Plugins don't write DIRECTLY to storage. They call Service methods.
Services are gatekeepers that enforce single-writer principle.

---

## Data Flow Contracts

### Who Writes What

| Entity | Writer | Readers |
|--------|--------|---------|
| Project | ProjectService | All plugins |
| File | FileSync service | Monaco, Notes, FileTree |
| Thread | ChatService | Chat plugin, RAG |
| Note | NotesPlugin | Notes, RAG |

### Single Writer Principle

Each entity type has ONE service responsible for writes:

```typescript
// CORRECT: Single writer
class FileService {
  async writeFile(projectId: string, path: string, content: string) {
    // Validate → Write to FSA/IndexedDB → Update Dexie metadata → Emit event
  }
}

// WRONG: Multiple writers
// Monaco calling FSA directly
// Notes calling Dexie directly
// Both trying to update the same file
```

---

## What This Model Eliminates

| Eliminated Concept | Why | Replacement |
|--------------------|-----|-------------|
| `workspaceBindings` | Workspace was a display mode, not an entity | `enabledPlugins` in ProjectSettings |
| `workspaceId` on File | Files belong to project, not workspace | `projectId` only |
| `workspaceId` on Thread | Threads belong to project | `projectId` only |
| Multiple FileMetadata types | Created confusion, dual sources of truth | Single FileMetadata in `@/domain/schemas` |
| Plugin as entity | Plugins don't persist independently | PluginDefinition as type, not entity |

---

## Migration Path

To adopt this model:

1. **Update `@/domain/entities/project.ts`** to re-export from `@/domain/schemas/project.schema.ts`
2. **Delete duplicate FileMetadata** definitions (6 exist currently)
3. **Update infrastructure imports** (9+ files import old entities)
4. **Remove WorkspaceBindings** usage across 361 references

This is a schema consolidation, not a data migration. The data already exists; we're consolidating types.

---

## Sources

- Context7: Dexie.js patterns for IndexedDB
- Context7: Zustand v5 state management
- Context7: TanStack Start routing patterns
- WebSearch: Plugin architecture patterns React 2026

**Confidence:** HIGH - All claims verified with authoritative documentation.
