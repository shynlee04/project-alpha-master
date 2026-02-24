# Architecture Patterns

**Domain:** AI-Powered Development IDE
**Researched:** 2026-01-31

---

## Recommended Architecture

### Overall Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TanStack Router                              │
│                    (Route definitions, loaders)                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       PLATFORM OPERATORS                              │
│                    (Always running, ARE the app)                      │
├──────────────────────────────┬──────────────────────────────────────┤
│       FileTree Operator      │       Chat-Cascade Operator           │
│   - Project CRUD             │   - Thread management                 │
│   - File CRUD                │   - AI calls                          │
│   - Storage sync             │   - Tool execution                    │
│   - Directory tree           │   - RAG queries                       │
└──────────────────────────────┴──────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │  Monaco  │  │  Notes   │  │ Terminal │
              │  Module  │  │  Module  │  │  Module  │
              └──────────┘  └──────────┘  └──────────┘
                                              │
                                              ▼
                                        ┌──────────┐
                                        │ Preview  │
                                        │  Module  │
                                        └──────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **FileTree Operator** | Project/file lifecycle, storage | All modules (provides files) |
| **Chat-Cascade Operator** | AI conversations, tools | FileTree (via tools), RAG |
| **Monaco Module** | Code editing UI | FileTree (read/write files) |
| **Notes Module** | Rich text editing | FileTree (optional .md sync) |
| **Terminal Module** | Command execution | FileTree (file effects) |
| **Preview Module** | Dev server iframe | Terminal (gets server URL) |

### Data Flow

```
User Action
    │
    ▼
┌─────────────────────┐
│   Platform Operator │ ──────────┐
│   (FileTree/Chat)   │           │
└─────────────────────┘           │
    │                             │
    │ CALL                        │
    ▼                             ▼
┌─────────────────────┐   ┌─────────────────────┐
│     Domain Service  │   │    Feature Module   │
│  (File/Thread/Note) │   │  (Monaco/Notes/etc) │
└─────────────────────┘   └─────────────────────┘
    │                             │
    │ PERSIST                     │ REQUEST via Service
    ▼                             │
┌─────────────────────┐           │
│   Storage Layer     │◄──────────┘
│  Dexie + FSA/OPFS   │
└─────────────────────┘
```

---

## Patterns to Follow

### Pattern 1: Operator-Module Separation

**What:** Platform Operators ARE infrastructure. Modules plug INTO operators.

**When:** Any time building core vs optional features.

**Example:**
```typescript
// FileTree Operator - always running
export const FileTreeOperator = {
  // Cannot disable - this IS the app
  init: () => initializeFileSystem(),
  render: () => <FileTreePanel />,
};

// Monaco Module - optional, platform-dependent
export const MonacoModule: FeatureModule = {
  id: 'monaco',
  platforms: ['desktop'],
  dependencies: ['file-tree'],
  render: () => <CodeEditor />,
};
```

### Pattern 2: Parts-Based Message Content

**What:** ThreadMessage uses typed content blocks instead of plain string.

**When:** Any AI response with mixed content (text, code, artifacts, diagrams).

**Example:**
```typescript
interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  parts: MessagePart[];  // Array of typed parts
  createdAt: Date;
}

type MessagePart =
  | { type: 'text'; content: string }
  | { type: 'code'; language: string; content: string }
  | { type: 'artifact'; id: string; title: string; content: string; language?: string }
  | { type: 'thinking'; content: string; isCollapsed: boolean }
  | { type: 'diagram'; diagramType: 'mermaid' | 'svg'; content: string }
  | { type: 'tool_call'; toolCall: ToolCall }
  | { type: 'tool_result'; toolResult: ToolResult };
```

### Pattern 3: Service-Gated Storage

**What:** Modules NEVER write directly to storage. Always via Services.

**When:** Any storage operation.

**Example:**
```typescript
// BAD - direct storage access
const file = await db.files.get(id);
await db.files.put({ ...file, content: newContent });

// GOOD - service-gated
const file = await FileService.read(id);
await FileService.update(id, { content: newContent });
// Service handles validation, sync, events
```

### Pattern 4: Static Tool Registry

**What:** Tools are code-defined, not database-stored. Tool calls/results ARE stored.

**When:** AI tool system.

**Example:**
```typescript
// STATIC - in code, not database
const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  read_file: {
    name: 'read_file',
    category: 'file',
    requiredPermissions: ['read'],
    needsApproval: false,
    hasSideEffects: false,
    execute: async (args) => await FileService.read(args.path),
  },
  write_file: {
    name: 'write_file',
    category: 'file',
    requiredPermissions: ['write'],
    needsApproval: true,
    hasSideEffects: true,
    execute: async (args) => await FileService.write(args.path, args.content),
  },
};

// PERSISTED - tool calls embedded in messages
interface ToolCall {
  id: string;
  toolName: string;  // References TOOL_REGISTRY key
  args: unknown;
  status: 'pending' | 'approved' | 'rejected' | 'running' | 'completed' | 'failed';
}
```

### Pattern 5: Dual Storage for RAG

**What:** Vectors in Orama, metadata in Dexie.

**When:** Any RAG operation.

**Example:**
```typescript
// Orama - in-memory vector store (per project)
const oramaIndex = await create({
  schema: {
    id: 'string',
    projectId: 'string',
    content: 'string',
    embedding: 'vector[512]',
  },
});

// Dexie - relationship tracking
interface RAGIndexMetadata {
  projectId: string;  // PK, 1:1 with Project
  documentCount: number;
  indexedFiles: string[];
  status: 'empty' | 'indexing' | 'ready' | 'error';
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Workspace Terminology

**What:** Using workspaceId, workspaceBindings, workspace-* files.

**Why bad:** Creates entity confusion. Files belong to projects, not workspaces.

**Instead:** Use projectId, enabledModules, domain-specific names.

### Anti-Pattern 2: Dual Type Systems

**What:** Types in both @/domain/entities/ AND @/domain/schemas/.

**Why bad:** 9 different FileMetadata definitions = bugs, confusion.

**Instead:** Single source of truth in @/domain/schemas/.

### Anti-Pattern 3: Zustand Persist for Entity Data

**What:** Using Zustand persist middleware for projects, files, threads.

**Why bad:** Conflicts with Dexie, stale state, no migrations.

**Instead:** Dexie for entity persistence. Zustand for UI state only.

### Anti-Pattern 4: Direct Storage in Modules

**What:** Modules writing directly to Dexie or FSA.

**Why bad:** No validation, no sync, no events, no audit trail.

**Instead:** All storage via Services (FileService, ThreadService, etc.).

### Anti-Pattern 5: String-Only Message Content

**What:** ThreadMessage.content as plain string for multi-modal responses.

**Why bad:** Can't render code blocks, artifacts, diagrams properly.

**Instead:** Parts-based content blocks with typed parts array.

---

## Scalability Considerations

| Concern | At 100 files | At 10K files | At 100K files |
|---------|--------------|--------------|---------------|
| File tree | Render all | Virtual scroll | Lazy load + search |
| RAG index | In-memory | In-memory | Persist Orama + pagination |
| Thread history | All in memory | Paginated | Compaction + archive |
| Dexie queries | Direct | Indexed | Cursor-based |

---

## Thread Compaction Pattern

When threads get too long (>100 messages, >50K tokens):

1. **Summarize** older messages using AI
2. **Create** new thread with summary as system message
3. **Archive** old thread (keep in Dexie, remove from active)
4. **Index** old thread in RAG for retrieval

```typescript
interface ThreadMetadata {
  tokenCount: number;
  messageCount: number;
  compactedAt?: Date;
  parentThreadId?: string;  // Links to archived thread
}
```

---

## Sources

| Source | What Validated |
|--------|----------------|
| VS Code Architecture | Operator-module separation |
| LobeChat | Dexie schema, plugin boundaries |
| ElizaOS | Tool registry patterns |
| OpenCode | Tool categories, execution pipeline |
| Claude Artifacts | Parts-based content blocks |
| VS Code Copilot | Thread compaction pattern |
