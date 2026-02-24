# Entity Diagram: Project Alpha Canonical Domain Model

**Created:** 2026-01-31
**Status:** CANONICAL - All other representations are DEPRECATED
**Source:** .planning/research/DOMAIN-MODEL-2026-01-31.md

---

## The Canonical Model

This is the ONLY valid representation of Project Alpha's domain model. All code, tests, and documentation MUST align with this diagram.

---

## Entity Hierarchy

```
                    ┌─────────────────────────────────────────────────────────────────┐
                    │                           PROJECT                                │
                    │                    (ROOT ENTITY - OWNS ALL)                      │
                    │                                                                  │
                    │  id: UUID                                                        │
                    │  name: string                                                    │
                    │  storageType: 'fsa' | 'indexeddb'                               │
                    │  settings: ProjectSettings                                       │
                    │  createdAt: Date                                                 │
                    │  updatedAt: Date                                                 │
                    └──────────────────────────────┬──────────────────────────────────┘
                                                   │
                                                   │ OWNS (1:N)
                                                   │
           ┌───────────────────────────────────────┼───────────────────────────────────────┐
           │                                       │                                       │
           ▼                                       ▼                                       ▼
┌─────────────────────────┐          ┌─────────────────────────┐          ┌─────────────────────────┐
│      FILE METADATA      │          │         THREAD          │          │          NOTE           │
│   (owned by project)    │          │   (owned by project)    │          │   (owned by project)    │
│                         │          │                         │          │                         │
│  id: UUID               │          │  id: UUID               │          │  id: UUID               │
│  projectId: UUID ◄──────┼──────────┼──────► projectId: UUID  │          │  projectId: UUID        │
│  relativePath: string   │          │  title: string          │          │  title: string          │
│  name: string           │          │  model: string          │          │  filePath?: string      │
│  isDirectory: boolean   │          │  provider: AIProvider   │          │  content: Block[]       │
│  size?: number          │          │  messages: Message[]    │          │  tags?: string[]        │
│  mimeType?: string      │          │  metadata: ThreadMeta   │          │  linkedFiles?: string[] │
│  syncStatus: SyncStatus │          │  createdAt: Date        │          │  createdAt: Date        │
│  createdAt: Date        │          │  updatedAt: Date        │          │  updatedAt: Date        │
│  modifiedAt: Date       │          │                         │          │                         │
└─────────────────────────┘          └────────────┬────────────┘          └─────────────────────────┘
                                                  │
                                                  │ EMBEDS (1:N)
                                                  ▼
                                     ┌─────────────────────────┐
                                     │    THREAD MESSAGE       │
                                     │     (embedded in        │
                                     │      Thread)            │
                                     │                         │
                                     │  id: UUID               │
                                     │  role: MessageRole      │
                                     │  content: string        │
                                     │  toolCalls?: ToolCall[] │
                                     │  toolResults?: Result[] │
                                     │  createdAt: Date        │
                                     └─────────────────────────┘
```

---

## What DOES NOT Exist as an Entity

| ❌ NOT an Entity | Why | Replacement |
|------------------|-----|-------------|
| **Workspace** | Display mode, not data | Platform detection |
| **WorkspaceBindings** | Conflated data with UI | `PluginType[]` in ProjectSettings |
| **WorkspaceId** | Files don't belong to workspaces | `projectId` only |
| **PluginInstance** | Plugins are runtime, not persisted | `PluginDefinition` type |

---

## The Plugin System (NOT Entities)

Plugins are **runtime capabilities**, not persisted entities. They DO NOT have IDs. They DO NOT own data.

```
                    ┌─────────────────────────────────────────────────────────────────┐
                    │                      PLUGIN REGISTRY                             │
                    │                  (Static definitions, not DB)                    │
                    └──────────────────────────────┬──────────────────────────────────┘
                                                   │
       ┌───────────────────────────┬───────────────┴───────────────┬───────────────────────────┐
       │                           │                               │                           │
       ▼                           ▼                               ▼                           ▼
┌─────────────────┐      ┌─────────────────┐            ┌─────────────────┐      ┌─────────────────┐
│  CORE PLUGINS   │      │  EDITOR PLUGINS │            │  EDITOR PLUGINS │      │ VIEWER PLUGINS  │
│  (always loaded)│      │  (optional)     │            │  (optional)     │      │ (read-only)     │
├─────────────────┤      ├─────────────────┤            ├─────────────────┤      ├─────────────────┤
│ ● file-tree     │      │ ● monaco        │            │ ● terminal      │      │ ● preview       │
│   └─ can WRITE  │      │   └─ can WRITE  │            │   └─ can WRITE  │      │   └─ READ-ONLY  │
│     files       │      │     files       │            │     files       │      │                 │
│                 │      │                 │            │                 │      │                 │
│ ● chat          │      │ ● notes         │            │                 │      │                 │
│   └─ can WRITE  │      │   └─ can WRITE  │            │                 │      │                 │
│     threads,    │      │     notes,      │            │                 │      │                 │
│     files       │      │     files       │            │                 │      │                 │
└─────────────────┘      └─────────────────┘            └─────────────────┘      └─────────────────┘
       │                           │                               │                           │
       └───────────────────────────┴───────────────────────────────┴───────────────────────────┘
                                                   │
                                           ALL WRITE VIA
                                                   │
                                                   ▼
                    ┌─────────────────────────────────────────────────────────────────┐
                    │                        SERVICES                                  │
                    │              (Gatekeepers - enforce single writer)               │
                    └─────────────────────────────────────────────────────────────────┘
                                                   │
               ┌───────────────────────────────────┼───────────────────────────────────┐
               │                                   │                                   │
               ▼                                   ▼                                   ▼
      ┌─────────────────┐               ┌─────────────────┐               ┌─────────────────┐
      │   FileService   │               │  ThreadService  │               │   NoteService   │
      │                 │               │                 │               │                 │
      │ Writers:        │               │ Writers:        │               │ Writers:        │
      │ - FileTree      │               │ - Chat only     │               │ - Notes only    │
      │ - Chat (tools)  │               │                 │               │                 │
      │ - Monaco        │               │                 │               │                 │
      │ - Notes (.md)   │               │                 │               │                 │
      │ - Terminal      │               │                 │               │                 │
      └─────────────────┘               └─────────────────┘               └─────────────────┘
```

---

## State Layer Assignment

Each piece of data lives in ONE layer:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              STATE LAYER HIERARCHY                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  LAYER 4: UI STATE (Zustand - NO persist, NO hydration)                                │
│  ├── activeDocument: { filePath, content, isDirty, cursorPosition }                    │
│  ├── openTabs: Map<string, TabState>                                                   │
│  ├── panelSizes: { sidebar: number, editor: number, terminal: number }                 │
│  └── modals: { isOpen: boolean, type: string }                                         │
│                                                                                          │
│  ─────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                          │
│  LAYER 3: SESSION STATE (Zustand + hydration from Layer 2)                             │
│  ├── currentProjectId: string | null                                                   │
│  ├── loadedPlugins: PluginType[]                                                       │
│  ├── recentFiles: string[]                                                             │
│  └── undoStack: UndoEntry[]                                                            │
│                                                                                          │
│  ─────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                          │
│  LAYER 2: PERSISTED STATE (Dexie - IndexedDB)                                          │
│  ├── projects: Project[]                  ◄── Source of truth for project metadata     │
│  ├── files: FileMetadata[]                ◄── Source of truth for file metadata        │
│  ├── threads: Thread[]                    ◄── Source of truth for chat history         │
│  ├── notes: Note[]                        ◄── Source of truth for rich text notes      │
│  └── settings: UserSettings               ◄── Source of truth for user preferences     │
│                                                                                          │
│  ─────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                          │
│  LAYER 1: FILE CONTENT (FSA or OPFS)                                                   │
│  ├── Desktop: File System Access API (real file system)                               │
│  ├── Mobile: Origin Private File System (sandboxed)                                    │
│  └── Content: Actual file bytes, not metadata                                          │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Ownership Rules (Machine-Readable)

```typescript
// CANONICAL OWNERSHIP RULES - DO NOT MODIFY
const OWNERSHIP_RULES = {
  // Entity ownership
  FileMetadata: { ownedBy: 'Project', via: 'projectId' },
  Thread: { ownedBy: 'Project', via: 'projectId' },
  Note: { ownedBy: 'Project', via: 'projectId' },
  ThreadMessage: { ownedBy: 'Thread', via: 'embedded' },
  
  // What DOES NOT exist
  banned: [
    'workspaceBindings',
    'WorkspaceBindings',
    'workspaceId',
    'WorkspaceId',
  ],
  
  // Single source of truth
  schemaSource: '@/domain/schemas/',
  
  // Who can write what
  writers: {
    file: ['file-tree', 'chat', 'monaco', 'notes', 'terminal'],
    thread: ['chat'],
    note: ['notes'],
  },
  
  // Core plugins (cannot disable)
  corePlugins: ['file-tree', 'chat'],
} as const;
```

---

## What This Diagram Replaces

| Old Concept | Status | Replacement |
|-------------|--------|-------------|
| Workspace as entity | ❌ ELIMINATED | Platform detection |
| workspaceBindings field | ❌ ELIMINATED | enabledPlugins in ProjectSettings |
| workspaceId on files | ❌ ELIMINATED | projectId only |
| Multiple FileMetadata types | ❌ CONSOLIDATED | Single type in @/domain/schemas/ |
| Plugins as entities | ❌ NEVER EXISTED | PluginDefinition type |
| Persist on entity stores | ❌ FORBIDDEN | Dexie for persistence |

---

## Enforcement

This diagram is enforced via:

1. **TypeScript** - Types in `@/domain/schemas/` are source of truth
2. **ESLint** - Rules block banned terms
3. **Pre-commit** - Hook rejects workspace terms
4. **CI** - Pipeline fails on violations
5. **Code Review** - Human verification

---

## Related Documents

| Document | Purpose |
|----------|---------|
| DOMAIN-MODEL-2026-01-31.md | Detailed entity definitions |
| SCHEMA-ARCHITECTURE-2026-01-31.md | Zod schema hierarchy |
| PLUGIN-CONTRACTS-2026-01-31.md | Plugin coordination patterns |
| PLUGIN-GOVERNANCE-2026-01-31.md | Plugin loading rules |
| NO-WORKSPACE-MANDATE.md | Banned terms and enforcement |

---

**This diagram is the CANONICAL representation. All code MUST conform.**

*Created: 2026-01-31*
*Phase: 01 - Conceptual Clarity*
