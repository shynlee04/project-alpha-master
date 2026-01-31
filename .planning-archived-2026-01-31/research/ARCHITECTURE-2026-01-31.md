# Architecture Patterns

**Domain:** Browser-based IDE with AI capabilities
**Researched:** 2026-01-31
**Confidence:** HIGH

---

## Recommended Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                              │
│  React 19 Components + TanStack Router + 8-bit Design System                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │FileTree │ │ Monaco  │ │  Notes  │ │Terminal │ │ Preview │ │  Chat   │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │
│       │           │           │           │           │           │         │
│       └───────────┴───────────┴─────┬─────┴───────────┴───────────┘         │
│                                     │                                        │
│                          ┌──────────┴──────────┐                            │
│                          │ Coordination Layer  │ (Zustand, Event Bus)       │
│                          └──────────┬──────────┘                            │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┼───────────────────────────────────────┐
│                              DOMAIN LAYER                                    │
│  Business Logic + Entities + Services                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ProjectSvc   │  │FileSvc      │  │ThreadSvc    │  │NoteSvc      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                     │                                        │
│                          ┌──────────┴──────────┐                            │
│                          │ Domain Interfaces   │                            │
│                          └──────────┬──────────┘                            │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┼───────────────────────────────────────┐
│                          INFRASTRUCTURE LAYER                                │
│  External Systems + Persistence + Sync                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ FSA Gateway │  │ Dexie DB    │  │ AI Adapters │  │ Sync Engine │         │
│  │ (Desktop)   │  │ (IndexedDB) │  │ (TanStack)  │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                                              │
│  Storage:  FSA (Desktop) ──────────┬────────── IndexedDB (All Platforms)    │
│                                    │                                         │
│                              ┌─────┴─────┐                                  │
│                              │   OPFS    │ (Origin Private File System)     │
│                              └───────────┘                                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

### Layer Responsibilities

| Layer | Responsibility | Technology | Max File Size |
|-------|---------------|------------|---------------|
| **Presentation** | UI rendering, user interaction | React 19, TanStack Router | 400 LOC |
| **Coordination** | Cross-plugin state, events | Zustand (no persist), EventEmitter3 | 120 LOC per slice |
| **Domain** | Business logic, validation | Pure TypeScript, Zod | 300 LOC |
| **Infrastructure** | External systems, persistence | Dexie, FSA, TanStack AI | 300 LOC |

### Import Direction Rules

```typescript
// ✅ ALLOWED
presentation → domain → infrastructure  // Reading
presentation → coordination             // State
coordination → domain                   // Validation

// ❌ FORBIDDEN
infrastructure → domain                 // Inverted dependency
domain → presentation                   // Circular
coordination → infrastructure           // Bypassing domain
```

---

## State Architecture: 4-Layer Model

### Layer 1: UI State (Transient)

**Technology:** Zustand (NO persist middleware)
**Lifetime:** Component mount → unmount
**Examples:** Panel open/closed, hover state, focus, modal visibility

```typescript
// ✅ CORRECT: No persist
const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activePanel: 'file-tree',
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
}));

// ❌ WRONG: Persist on UI state
const useUIStore = create(
  persist((set) => ({ ... }), { name: 'ui-state' })  // NO!
);
```

### Layer 2: Session State (Tab/Window Lifetime)

**Technology:** Zustand + Dexie hydration
**Lifetime:** Tab open → tab close (survives refresh via Dexie hydration)
**Examples:** Active project ID, open tabs, layout configuration

```typescript
// Session state hydrated from Dexie on mount
const useSessionStore = create<SessionState>((set, get) => ({
  activeProjectId: null,
  openDocuments: [],
  
  // Hydrate from Dexie on app start
  hydrate: async () => {
    const session = await db.sessions.get('current');
    if (session) set(session);
  },
  
  // Persist to Dexie on change (debounced)
  setActiveProject: (id) => {
    set({ activeProjectId: id });
    debouncedPersist(get());  // Write to Dexie
  },
}));
```

### Layer 3: Persisted State (Long-term)

**Technology:** Dexie.js (IndexedDB)
**Lifetime:** Permanent (until user deletes)
**Examples:** Projects, threads, notes, user settings

```typescript
// Dexie is SOURCE OF TRUTH for persisted data
// Use useLiveQuery for reactive reads
function ProjectList() {
  const projects = useLiveQuery(
    () => db.projects.toArray(),
    []  // Dependencies
  );
  
  if (!projects) return <Loading />;
  return <ul>{projects.map(p => <ProjectItem key={p.id} project={p} />)}</ul>;
}
```

### Layer 4: File State (File System)

**Technology:** FSA (desktop) or OPFS (fallback)
**Lifetime:** Permanent (user's file system)
**Examples:** Source code, markdown files, assets

```typescript
// File operations go through domain service
class FileService {
  private adapter: StorageAdapter;  // FSA or OPFS
  
  async readFile(projectId: string, path: string): Promise<string> {
    return this.adapter.readFile(projectId, path);
  }
  
  async writeFile(projectId: string, path: string, content: string): Promise<void> {
    await this.adapter.writeFile(projectId, path, content);
    // Update Dexie metadata
    await db.files.update(`${projectId}:${path}`, {
      modifiedAt: new Date(),
      syncStatus: 'synced',
    });
    // Emit event for plugins
    eventBus.emit('file:saved', { projectId, filePath: path });
  }
}
```

---

## Storage Strategy

### Decision Flow

```
User creates project
        │
        ▼
┌───────────────────┐
│ FSA API available?│
│ (Desktop browser) │
└────────┬──────────┘
         │
    YES  │  NO
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│  FSA  │ │IndexDB│
│ + Dexie│ │ only  │
│metadata│ │       │
└───────┘ └───────┘
```

### Storage Adapter Interface

```typescript
interface StorageAdapter {
  // Capability check
  isAvailable(): boolean;
  
  // File operations
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  
  // Directory operations
  listDirectory(path: string): Promise<FileEntry[]>;
  createDirectory(path: string): Promise<void>;
  deleteDirectory(path: string): Promise<void>;
  
  // Metadata
  getMetadata(path: string): Promise<FileMetadata>;
}

// Implementation selection
function createStorageAdapter(project: Project): StorageAdapter {
  if (project.storageType === 'fsa' && project.directoryHandle) {
    return new FSAStorageAdapter(project.directoryHandle);
  }
  return new IndexedDBStorageAdapter(project.id);
}
```

### Dexie Schema (Source of Truth for Metadata)

```typescript
class ProjectAlphaDB extends Dexie {
  projects!: Table<Project, string>;
  files!: Table<FileMetadata, string>;  // Metadata only, not content
  threads!: Table<Thread, string>;
  notes!: Table<Note, string>;
  sessions!: Table<Session, string>;
  
  constructor() {
    super('ProjectAlphaDB');
    
    this.version(1).stores({
      projects: 'id, name, createdAt',
      files: 'id, projectId, relativePath, syncStatus',
      threads: 'id, projectId, updatedAt',
      notes: 'id, projectId, title',
      sessions: 'id',
    });
  }
}

export const db = new ProjectAlphaDB();
```

---

## AI Integration Architecture

### TanStack AI SDK Pattern

```typescript
// Tool definition (shared between client and server)
const readFileDef = toolDefinition({
  name: 'read_file',
  description: 'Read a file from the project',
  inputSchema: z.object({
    filePath: z.string().describe('Path to the file'),
  }),
  outputSchema: z.object({
    content: z.string(),
    mimeType: z.string(),
  }),
});

// Server implementation
const readFile = readFileDef.server(async ({ filePath }, context) => {
  // Permission check
  if (!context.permissions.canRead(filePath)) {
    throw new Error('Permission denied');
  }
  
  const content = await fileService.readFile(context.projectId, filePath);
  return { content, mimeType: getMimeType(filePath) };
});

// Chat endpoint with tools
export async function POST(request: Request) {
  const { messages, projectId } = await request.json();
  
  const stream = chat({
    adapter: anthropicText('claude-3.5-sonnet'),
    messages,
    tools: [readFile, writeFile, searchFiles],  // Available tools
    systemPrompts: [`You are an AI assistant for project ${projectId}.`],
    agentLoopStrategy: maxIterations(10),
  });
  
  return toServerSentEventsResponse(stream);
}
```

### RAG Architecture (Client-Side)

```typescript
// Embedding on client (browser)
import { pipeline } from '@xenova/transformers';

const embeddingPipeline = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2'  // 384 dimensions, runs in browser
);

async function embedText(text: string): Promise<number[]> {
  const result = await embeddingPipeline(text, { pooling: 'mean' });
  return Array.from(result.data);
}

// Store embeddings in Dexie
interface FileEmbedding {
  id: string;          // `${projectId}:${filePath}`
  projectId: string;
  filePath: string;
  chunks: {
    text: string;
    embedding: number[];
    startLine: number;
    endLine: number;
  }[];
  embeddedAt: Date;
}

// Similarity search
async function findSimilar(query: string, projectId: string, k: number = 5) {
  const queryEmbedding = await embedText(query);
  
  const allEmbeddings = await db.fileEmbeddings
    .where('projectId').equals(projectId)
    .toArray();
  
  // Calculate cosine similarity
  const scored = allEmbeddings.flatMap(fe =>
    fe.chunks.map(chunk => ({
      filePath: fe.filePath,
      text: chunk.text,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
  );
  
  // Return top-k
  return scored.sort((a, b) => b.score - a.score).slice(0, k);
}
```

---

## Anti-Patterns to Avoid

### 1. God Stores

**Bad:**
```typescript
// 700+ line store with 20+ actions
const useEverythingStore = create((set) => ({
  // UI state mixed with data
  sidebarOpen: true,
  projects: [],
  threads: [],
  // ... 50 more fields
}));
```

**Good:**
```typescript
// Slice pattern - max 120 LOC per slice
const useUISlice = create<UISlice>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
}));

// Dexie for data, not Zustand
const projects = useLiveQuery(() => db.projects.toArray());
```

### 2. Direct Infrastructure Calls from Presentation

**Bad:**
```typescript
function ProjectCard({ project }) {
  const handleDelete = async () => {
    await db.projects.delete(project.id);  // ❌ Direct Dexie call
    await fs.removeDirectory(project.path); // ❌ Direct FSA call
  };
}
```

**Good:**
```typescript
function ProjectCard({ project }) {
  const { deleteProject } = useProjectService();  // Hook wraps domain service
  
  const handleDelete = async () => {
    await deleteProject(project.id);  // ✅ Domain service handles coordination
  };
}
```

### 3. Multiple Sources of Truth

**Bad:**
```typescript
// Project in Zustand persist
const projectStore = create(persist((set) => ({
  project: null,
})));

// Also in Dexie
await db.projects.add(project);

// Now which is correct?
```

**Good:**
```typescript
// Single source of truth: Dexie
const project = useLiveQuery(() => db.projects.get(id));

// Zustand only for derived/session state
const { activeProjectId } = useSessionStore();
```

---

## Scalability Considerations

| Concern | At 10 Projects | At 100 Projects | At 1000 Files |
|---------|----------------|-----------------|---------------|
| **Project list** | Array in Dexie | Indexed query | Pagination |
| **File tree** | Full load | Lazy load | Virtual scroll |
| **Search** | Full text | Indexed | Embedding search |
| **Threads** | All in memory | Paginated | Archive old |

---

## Sources

- Context7: TanStack Start routing patterns
- Context7: Zustand v5 slices pattern
- Context7: Dexie.js schema and migrations
- Context7: TanStack AI SDK tool calling
- WebSearch: File System Access API patterns
- WebSearch: Offline-first browser architecture 2026
- WebSearch: Client-side RAG embeddings

**Confidence:** HIGH - All patterns verified with authoritative documentation.
