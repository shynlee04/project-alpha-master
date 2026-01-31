# Phase 1: Platform Operators - Research

**Researched:** 2026-02-01
**Domain:** FileTree CRUD, Chat-Cascade AI, FSA Sync, Layout Panels
**Confidence:** MEDIUM

## Summary

Phase 1 implements the two **Platform Operators** that form the infrastructure backbone of Project Alpha. Unlike Feature Modules (Monaco, Notes, Terminal), these operators are always running and cannot be disabled.

**FileTree Operator** bundles: Project CRUD, File CRUD, FSA sync on desktop, hot-loading between projects, and directory tree rendering. Significant codebase already exists:
- `src/infrastructure/filesystem/fsa-storage-adapter.ts` (673 lines) - FSA implementation with polling-based watching
- `src/infrastructure/persistence/stores/file-tree-store.ts` (537 lines) - Zustand store for tree state
- `src/plugins/filetree/FileTreePlugin.tsx` - UI component already integrated

**Chat-Cascade Operator** bundles: Thread management, AI tool execution, RAG queries, tool permissions, thread rendering. Current state is a placeholder:
- `src/infrastructure/services/chat-service.ts` (68 lines) - NULL_CHAT_SERVICE placeholder only
- Thread schema exists (`src/domain/schemas/thread.schema.ts`)
- ThreadManager component exists but disabled ("Phase 2 stub")

**Primary recommendation:** Prioritize FileTree completion (PLAT-01 through PLAT-05) before Chat-Cascade (PLAT-06 through PLAT-08), as Chat tools depend on FileTree for file CRUD operations. Layout fixes (PLAT-09, PLAT-10) can be parallelized.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TanStack AI SDK | Latest | Chat streaming, tool calling | User decision - client-side tools, multi-provider |
| Dexie.js | 4.x | IndexedDB wrapper | Already in use, live queries via `useLiveQuery` |
| Zustand | 5.x | Client state | Already in use, `useShallow` mandatory per AGENTS.md |
| File System Access API | Browser native | Desktop file sync | User decision for PC storage |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 3.x | Schema validation | Already in domain/schemas for all entities |
| nanoid | 4.x | ID generation | Already used in domain services |
| TypeScript | 5.6+ | Type safety | Strict mode enabled, tsgo for fast checking |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack AI SDK | Vercel AI SDK | Vercel has more agentic features but TanStack better for extensibility/sustainability per user decision |
| Polling FSA watcher | Native file watching | Native not available in FSA API; polling is required |
| IndexedDB direct | Dexie.js | Dexie adds schema migrations, live queries; already committed |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── domain/
│   ├── schemas/          # Zod schemas (Project, File, Thread, Note)
│   ├── services/         # FileService, ThreadService interfaces
│   └── interfaces/       # StorageAdapter, EventBus contracts
├── infrastructure/
│   ├── filesystem/       # FSAStorageAdapter, IDBStorageAdapter
│   ├── persistence/
│   │   ├── dexie-db.ts   # Database instance
│   │   └── stores/       # Zustand stores (file-tree-store, layout-store)
│   └── events/           # DomainEventBus implementation
├── plugins/
│   ├── filetree/         # FileTreePlugin.tsx (Platform Operator)
│   └── chat/             # ChatPlugin.tsx (Platform Operator)
└── presentation/
    └── layouts/          # PluginLayoutStore (panel management)
```

### Pattern 1: Four-Layer State Model (SOURCE-OF-TRUTH.md)
**What:** Separation of concerns for state persistence
**When to use:** All state management decisions

| Layer | Technology | Persistence | What Lives Here |
|-------|------------|-------------|-----------------|
| L1 UI State | Zustand (NO persist) | Session only | Panel sizes, modals, hover states |
| L2 Session State | Zustand + hydration | Survives refresh | Active project, open tabs |
| L3 Persisted State | Dexie (IndexedDB) | Long-term | Projects, files, threads, notes |
| L4 File Content | FSA or OPFS | Long-term | Actual file bytes |

### Pattern 2: Service-Gated Writes
**What:** Modules (Monaco, Notes, Terminal) do NOT write directly to storage. They request writes via Services.
**When to use:** All file/thread/note CRUD operations

```typescript
// FileService interface (already defined in domain/services/file-crud/)
interface IFileCrudService {
  create(path: string, content: string, options: CreateOptions): Promise<CrudResult<FileMetadata>>;
  read(path: string, options: ReadOptions): Promise<CrudResult<string>>;
  update(path: string, content: string, options: UpdateOptions): Promise<CrudResult<FileMetadata>>;
  delete(path: string, options: DeleteOptions): Promise<CrudResult<void>>;
}
```

### Pattern 3: Domain Event Bus
**What:** Cross-operator communication via typed events
**When to use:** File changes need to notify RAG, FileTree, Monaco etc.

```typescript
type DomainEventType =
  | 'file:created' | 'file:updated' | 'file:deleted' | 'file:synced'
  | 'project:created' | 'project:deleted' | 'project:switched'
  | 'thread:created' | 'thread:updated' | 'thread:deleted'
  | 'tool:executed' | 'tool:approved' | 'tool:rejected';
```

### Pattern 4: TanStack AI useChat Hook
**What:** Client-side chat streaming with tool calling
**When to use:** Chat-Cascade operator implementation

```typescript
// Based on TanStack AI SDK patterns (verified via web search)
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react';

function ChatPanel() {
  const {
    messages,
    sendMessage,
    isLoading,
    pendingTools,
    approveToolCall,
    denyToolCall,
  } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
    clientTools: [readFile, writeFile, searchRag], // Client-side tools
  });
  // ...
}
```

### Anti-Patterns to Avoid
- **Direct storage access from UI:** Always go through Services/Stores
- **Zustand persist on entity data:** Use Dexie for L3 entities, not Zustand persist
- **Mutable store updates:** Always use immutable patterns in Zustand
- **Polling without debounce:** FSA polling must debounce file change events

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB access | Raw IndexedDB API | Dexie.js | Migrations, live queries, typed tables |
| File tree state | Manual tree operations | useFileTreeStore | Already built with expand/collapse, selection |
| AI streaming | Fetch + SSE parsing | TanStack AI useChat | Handles reconnection, tool calling, parts |
| Panel resizing | DIY drag handlers | PluginLayoutStore + CSS Grid | Already implemented with presets |
| Thread persistence | localStorage | Dexie threads table | Relationships, migrations, live queries |

**Key insight:** 80% of the infrastructure already exists. The challenge is integration and completing the remaining 20%, not rebuilding from scratch.

## Common Pitfalls

### Pitfall 1: SSR Hydration Mismatch
**What goes wrong:** Zustand stores accessed during SSR return undefined, causing hydration mismatch
**Why it happens:** TanStack Start is SSR-capable; stores only exist on client
**How to avoid:** All store access must check `typeof window === 'undefined'`; use `_hasHydrated` flag
**Warning signs:** React hydration warnings about content mismatch

### Pitfall 2: FSA Permission Loss on Reload
**What goes wrong:** File system handle becomes invalid after page reload
**Why it happens:** FSA handles are not automatically persisted
**How to avoid:** Store handle in IndexedDB (`fsaHandles` table exists); re-request permission on restore
**Warning signs:** "NotAllowedError" on file read after reload

### Pitfall 3: Zustand Re-render Storm
**What goes wrong:** Component re-renders on every store update
**Why it happens:** Missing `useShallow` wrapper on selectors
**How to avoid:** ALWAYS use `useShallow` per AGENTS.md mandate
**Warning signs:** React DevTools showing excessive re-renders

### Pitfall 4: Thread Message Duplication
**What goes wrong:** Messages appear twice in thread
**Why it happens:** Both hook and store add messages; optimistic + server confirmation
**How to avoid:** Single source of truth for messages; idempotent message IDs
**Warning signs:** Duplicate message IDs in thread

### Pitfall 5: Layout Panel Overlap (PLAT-09)
**What goes wrong:** Drag-drop causes panels to overlap or disappear
**Why it happens:** Panel sizes don't sum to 100%; CSS Grid not respecting constraints
**How to avoid:** Use fixed-ratio presets (already in `workflow-presets.ts`); validate panel totals
**Warning signs:** Panels with `display: none` or `overflow: hidden` clipping content

## Code Examples

Verified patterns from existing codebase:

### File Tree Store Usage
```typescript
// From: src/plugins/filetree/FileTreePlugin.tsx:94-108
const rootPaths = useFileTreeStore((state) => state.rootPaths);
const nodesMap = useFileTreeStore((state) => state.nodes);
const selectedPath = useFileTreeStore((state) => state.selectedPath);
const toggleExpand = useFileTreeStore((state) => state.toggleExpand);
const selectFile = useFileTreeStore((state) => state.selectFile);

// Build tree nodes from map
const rootNodes = useMemo(() => {
  return rootPaths
    .map((path) => nodesMap.get(path))
    .filter((node): node is FileTreeNode => node !== undefined);
}, [rootPaths, nodesMap]);
```

### FSA Storage Adapter Pattern
```typescript
// From: src/infrastructure/filesystem/fsa-storage-adapter.ts:69-86
export class FSAStorageAdapter implements StorageAdapter {
  readonly name = 'fsa';
  private directoryHandle: FileSystemDirectoryHandle | null = null;

  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }

  async requestAccess(): Promise<FileSystemDirectoryHandle> {
    const handle = await window.showDirectoryPicker();
    this.directoryHandle = handle;
    return handle;
  }
}
```

### Dexie Thread Operations
```typescript
// From: src/infrastructure/persistence/dexie-db.ts:814-829
export async function getConversationThread(
  threadId: string
): Promise<ConversationThreadRecord | undefined> {
  return db.threads.get(threadId);
}

export async function saveConversationThread(
  thread: ConversationThreadRecord
): Promise<void> {
  await db.threads.put(thread);
}
```

### Result Type Pattern
```typescript
// From: src/domain/services/file-crud/file-crud-types.ts
type CrudResult<T> = 
  | { success: true; data: T }
  | { success: false; error: CrudError };

// Usage
const result = await FileService.create(projectId, path);
if (result.success) {
  console.log('Created:', result.value);
} else {
  console.error('Failed:', result.error.code, result.error.message);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| localStorage for state | Dexie for L3, Zustand for L1-L2 | EPIC-27-1c | Migrations, relationships, live queries |
| Vercel AI SDK | TanStack AI SDK | User decision | Client-side tools, no vendor lock-in |
| workspaceBindings | plugins field in Project | NO-WORKSPACE-MANDATE | Cleaner model, no artificial silos |
| Multiple layout stores | PluginLayoutStore consolidated | LC-02 | Single source of truth for layout |

**Deprecated/outdated:**
- `@/lib/*` imports: BANNED, use `@/domain/*` or `@/infrastructure/*`
- `workspaceId` field: BANNED, use `projectId` only
- Zustand persist on entity data: Use Dexie instead

## Open Questions

Things that couldn't be fully resolved:

1. **TanStack AI SDK Tool Approval UI**
   - What we know: SDK provides `pendingTools`, `approveToolCall`, `denyToolCall`
   - What's unclear: Exact component pattern for rendering tool approval cards
   - Recommendation: Research TanStack AI examples; may need custom implementation

2. **FSA Handle Restoration Flow**
   - What we know: Handles stored in `fsaHandles` Dexie table
   - What's unclear: Best UX for prompting user to re-grant permission
   - Recommendation: Implement graceful degradation with clear permission request button

3. **MessagePart Rendering Complexity**
   - What we know: ThreadMessage uses parts-based content (text, code, artifact, thinking, etc.)
   - What's unclear: Full component library needed for all part types
   - Recommendation: Start with text/code/tool_call parts; add others incrementally

4. **Panel Drag-Drop Fix (PLAT-09)**
   - What we know: Current implementation has overlap/disappear bugs
   - What's unclear: Root cause - CSS Grid vs JavaScript sizing vs state management
   - Recommendation: Investigate PluginLayoutStore `setPanelSize` and CSS Grid template

## Sources

### Primary (HIGH confidence)
- `src/infrastructure/filesystem/fsa-storage-adapter.ts` - FSA implementation patterns
- `src/infrastructure/persistence/dexie-db.ts` - Database schema and helpers
- `src/domain/schemas/thread.schema.ts` - Thread/Message type definitions
- `.planning/SOURCE-OF-TRUTH.md` - Canonical architecture document

### Secondary (MEDIUM confidence)
- TanStack AI SDK docs (via web search) - Chat hooks, tool calling patterns
- Chrome File System Access API docs - showDirectoryPicker, permission flow
- AGENTS.md - Governance rules, Zustand requirements

### Tertiary (LOW confidence)
- Web search results for TanStack AI 2025 - Need Context7 verification when available

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Already committed in codebase and user decisions
- Architecture: HIGH - SOURCE-OF-TRUTH.md is canonical
- FileTree patterns: HIGH - Implementation already exists
- Chat-Cascade patterns: MEDIUM - Placeholder exists, SDK patterns from web search
- Layout fixes: LOW - Root cause of PLAT-09 not yet diagnosed

**Research date:** 2026-02-01
**Valid until:** 2026-02-15 (stable patterns, may need SDK version checks)

---

## Appendix: Requirement Mapping to Existing Code

### PLAT-01: Project CRUD via FileTree
**Status:** Partially implemented
- `ProjectRegistry.ts` handles registration/conflict detection
- Dexie `projects` table exists with full schema
- UI: Project creation flow exists but needs integration

### PLAT-02: File CRUD within project
**Status:** Largely implemented
- `IFileCrudService` interface defined in `domain/services/file-crud/`
- `FSAStorageAdapter` implements read/write/delete
- FileTreeStore manages tree state

### PLAT-03: FSA sync on desktop
**Status:** Largely implemented
- `FSAStorageAdapter` with polling-based watcher (2s interval)
- `fsaHandles` Dexie table for handle persistence
- Permission restoration flow needs completion

### PLAT-04: IndexedDB persistence on mobile
**Status:** Needs implementation
- `IDBFilesTable` defined in `dexie-db-idb-file-types.ts`
- Storage adapter for IndexedDB files not yet implemented
- Should mirror FSAStorageAdapter interface

### PLAT-05: Hot-loading between projects
**Status:** Partially implemented
- `project:switched` event type defined
- FileTreeStore has `reset()` method
- Full project switch flow needs integration

### PLAT-06: Thread CRUD scoped to project
**Status:** Schema only
- `ThreadSchema` in `domain/schemas/thread.schema.ts`
- `threads` Dexie table exists
- ThreadService needs implementation

### PLAT-07: AI message send/receive
**Status:** Placeholder only
- `chat-service.ts` has `NULL_CHAT_SERVICE` placeholder
- TanStack AI SDK not yet integrated
- API route `/api/chat` exists

### PLAT-08: Message parts rendering
**Status:** Schema defined, UI minimal
- `MessagePart` union type in `thread.schema.ts`
- No component library for part rendering yet

### PLAT-09: Layout panels fix
**Status:** Bug exists
- PluginLayoutStore exists with panel management
- Drag-drop causes overlap/disappear issues
- Root cause investigation needed

### PLAT-10: Module toggle in activity bar
**Status:** Partially implemented
- `togglePlugin` action in PluginLayoutStore
- Activity bar component exists
- Integration needs verification
