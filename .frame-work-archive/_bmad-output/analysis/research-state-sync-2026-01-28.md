# Research: State Boundaries & Sync Strategy
**Date**: 2026-01-28 12:19
**Researcher**: analyst-ext
**Governance**: Q4 + Q6 from new-fundamental-truths.md

---

## Q4: Large Project Sync (1000+ files)

### The Problem Statement

> "files synchronization for large project (it will be a nightmare if every time 1000+ files need resynchronizing from beginning → so think of the solutions)"

**Risk Assessment**: Without delta sync, a 1000+ file project would require:
- ~10-30 seconds for full file tree traversal
- Network-like latency for FSA permission checks
- Potential browser tab freeze on large projects
- Memory pressure from loading all file metadata

---

### Research Findings: How Others Solve This

#### 1. VSCode / File System Watcher Approach
- Uses native `fs.watch` / `fsevents` with debouncing
- Maintains file tree cache with mtime tracking
- Only re-reads files when mtime changes
- Git integration for detecting changes via `.git/index`

#### 2. Obsidian Sync
- Content-addressable storage (hash-based deduplication)
- Delta chunks for large files (similar to rsync algorithm)
- Timestamp-based change detection
- Metadata sync separate from content sync

#### 3. Git / rsync Algorithm
- Rolling checksum (Adler-32) for delta detection
- File divided into blocks, only changed blocks sync
- Metadata (mtime, size) as fast first-pass filter

#### 4. Browser-Native: FileSystemObserver API (NEW 2024-2025)
- WHATWG proposal now in Chrome 129+
- Native file watching in browsers
- Replaces polling with event-driven notifications
- **Highly relevant for Project Alpha**

```javascript
// FileSystemObserver API (Chrome 129+)
const observer = new FileSystemObserver((records, observer) => {
  for (const record of records) {
    console.log("Change detected:", record.changedHandle.name, record.type);
  }
});
await observer.observe(directoryHandle);
```

---

### Delta Sync Patterns

#### Pattern 1: Metadata Cache + mtime Comparison

**Description**: Store file metadata (mtime, size, hash) in IndexedDB. On sync, compare only metadata first, then sync only changed files.

**Implementation** (Already exists in Project Alpha):
```typescript
// src/lib/sync/file-metadata-cache.ts
export class FileMetadataCache {
  async hasChanged(path: string, currentMetadata: FileMetadataRecord): Promise<boolean> {
    const cached = await this.get(path);
    if (!cached) return true; // New file
    return cached.lastModified !== currentMetadata.lastModified || 
           cached.size !== currentMetadata.size;
  }
  
  async getChangedFiles(sinceTimestamp: number): Promise<FileMetadataRecord[]> {
    return getChangedFilesSince(sinceTimestamp);
  }
}
```

**Pros**:
- Already implemented in Project Alpha
- Fast O(1) lookups via IndexedDB indexes
- Works offline

**Cons**:
- Requires initial full scan to populate cache
- mtime can be unreliable (copy operations don't update mtime)

**When to use**: Default strategy for all sync operations

---

#### Pattern 2: Content Hash + Chunked Sync

**Description**: Calculate content hash (xxHash/SHA-256) and only sync if hash differs. For large files (>1MB), chunk and sync only changed chunks.

**Implementation**:
```typescript
interface FileWithHash extends FileMetadataRecord {
  contentHash: string; // xxHash64 for speed
  chunks?: { offset: number; hash: string }[];
}

async function calculateQuickHash(content: ArrayBuffer): Promise<string> {
  // xxHash is 10-100x faster than SHA-256
  return xxhash64(new Uint8Array(content)).toString(16);
}
```

**Pros**:
- Detects content changes even when mtime unchanged
- Chunked sync reduces bandwidth for large files
- Works well with binary files (images, PDFs)

**Cons**:
- CPU overhead for hashing
- Complexity for chunk management

**When to use**: Binary files, large text files (>1MB), files frequently modified in-place

---

#### Pattern 3: Event-Driven Watch + Debounced Batch

**Description**: Use FileSystemObserver (Chrome 129+) or polling fallback. Debounce rapid changes, batch into transactions.

**Implementation**:
```typescript
// Infrastructure already exists
// src/infrastructure/sync/core/file-watcher.ts

interface WatcherConfig {
  debounceMs: number;      // 300ms default
  batchMaxSize: number;    // 100 files max per batch
  batchMaxWaitMs: number;  // 2000ms max wait
}

class IncrementalFileWatcher {
  private pendingChanges = new Map<string, FileChange>();
  
  onFileChange(event: FileSystemChangeRecord) {
    this.pendingChanges.set(event.path, event);
    this.scheduleFlush();
  }
  
  private async flush() {
    const batch = Array.from(this.pendingChanges.values());
    this.pendingChanges.clear();
    await this.syncBatch(batch);
  }
}
```

**Pros**:
- Minimal CPU usage (event-driven)
- Handles rapid saves (debouncing)
- Scales to large projects

**Cons**:
- FileSystemObserver not in Safari/Firefox yet
- Requires fallback polling for older browsers

**When to use**: Real-time sync, active editing sessions

---

#### Pattern 4: Snapshot + Diff (Baseline Sync)

**Description**: Store periodic snapshots of file tree state. On reconnect or startup, diff against snapshot to find changes.

**Implementation**:
```typescript
interface ProjectSnapshot {
  projectId: string;
  timestamp: number;
  files: Map<string, { mtime: number; size: number; hash?: string }>;
}

async function diffAgainstSnapshot(
  current: FileEntry[],
  snapshot: ProjectSnapshot
): Promise<{
  added: string[];
  modified: string[];
  deleted: string[];
}> {
  // Compare current tree against stored snapshot
}
```

**Pros**:
- Fast reconnection sync
- Reliable for detecting deletions
- Works across sessions

**Cons**:
- Snapshot storage overhead
- Stale snapshots can miss intermediate changes

**When to use**: Session recovery, offline-to-online transitions

---

### Recommended Strategy for Project Alpha

**Layered Delta Sync Architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Event-Driven Watch (FileSystemObserver/polling)      │
│ - Real-time change detection during active session             │
│ - Debounced batching (300ms debounce, 100-file batches)        │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: Metadata Cache (mtime + size) - ALREADY EXISTS       │
│ - FileMetadataCache in Dexie IndexedDB                         │
│ - Fast change detection without content read                   │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: Content Hash (for uncertain cases)                    │
│ - xxHash64 for speed                                           │
│ - Only when mtime unchanged but suspicion of change            │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 4: Session Snapshot (recovery)                           │
│ - Save snapshot every 5 minutes                                │
│ - Use for session recovery and offline detection               │
└─────────────────────────────────────────────────────────────────┘
```

**Key Metrics Target**:
| Metric | Target | Current |
|--------|--------|---------|
| Initial sync (1000 files) | <3 seconds | ~10-15s |
| Incremental sync | <200ms | ~500ms |
| Memory usage | <50MB | Unknown |
| Change detection latency | <500ms | ~1s (polling) |

---

### Implementation Notes

1. **FileMetadataCache is already implemented** - Leverage it more aggressively
2. **Add FileSystemObserver polyfill** - Feature detect and fallback to polling
3. **Batch FSA operations** - Current code does single-file operations
4. **Separate metadata sync from content sync** - Metadata can sync frequently, content less often

---

## Q6: State Management Boundaries

### The Problem Statement

> "Handling of States vs. Store vs. Persistence vs. Hooks and all of the conflicts calls (and later indexed, query and RAG??? - those that belongs to Zustand, ReAct, Dexiedb, indexdb, fsa, eventemitter etc) → if these are not regulated and mapped out from the beginning - a collapsing chains of runtime errors"

**Risk Assessment**: Without clear boundaries:
- Race conditions between Zustand updates and Dexie writes
- Stale data when Zustand and Dexie diverge
- Memory leaks from orphaned subscriptions
- Circular dependency nightmares
- Event emitter hell (who updates what, when?)

---

### State Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: UI State (Zustand ONLY)                               │
│ ─────────────────────────────────────────────────────────────── │
│ Scope: Component-local, ephemeral                              │
│ Lifetime: Current render                                        │
│ Examples:                                                       │
│   - Panel open/closed states                                    │
│   - Selection state (selected file, selected text)             │
│   - UI mode (editing, viewing, searching)                       │
│   - Hover/focus states                                          │
│   - Transient form values                                       │
│ Technology: Zustand stores (NO persist middleware)             │
│ Pattern: useShallow() for selector stability                    │
├─────────────────────────────────────────────────────────────────┤
│ Layer 2: Session State (Zustand + Hydration from Dexie)        │
│ ─────────────────────────────────────────────────────────────── │
│ Scope: Tab/window session                                       │
│ Lifetime: Survives navigation, dies on tab close               │
│ Examples:                                                       │
│   - Active project ID                                           │
│   - Current workspace                                           │
│   - Open editor tabs                                            │
│   - Panel layout preferences                                    │
│   - Recent searches (session-only)                              │
│ Technology: Zustand with hydrateProjects() from Dexie          │
│ Pattern: Hydrate on mount, persist to Dexie on meaningful change│
├─────────────────────────────────────────────────────────────────┤
│ Layer 3: Persisted State (Dexie.js as Source of Truth)         │
│ ─────────────────────────────────────────────────────────────── │
│ Scope: Cross-session, cross-tab                                 │
│ Lifetime: Forever (until explicitly deleted)                    │
│ Examples:                                                       │
│   - Projects (metadata, settings)                               │
│   - Conversation threads                                        │
│   - User preferences                                            │
│   - Sync status                                                 │
│   - Tool execution logs                                         │
│ Technology: Dexie.js (IndexedDB wrapper)                        │
│ Pattern: useLiveQuery() for reactive reads, direct writes       │
├─────────────────────────────────────────────────────────────────┤
│ Layer 4: File State (FSA/IDB Adapters)                         │
│ ─────────────────────────────────────────────────────────────── │
│ Scope: Actual file content                                      │
│ Lifetime: Persistent on disk/IndexedDB                          │
│ Examples:                                                       │
│   - Source code files                                           │
│   - Markdown notes                                              │
│   - Configuration files                                         │
│   - Uploaded documents                                          │
│ Technology: FSA (native FS), IDB adapter (fallback)            │
│ Pattern: Sync engine orchestrates, adapters execute             │
└─────────────────────────────────────────────────────────────────┘
```

---

### Best Practices Found (2024-2026 Research)

#### 1. **Single Source of Truth Per Domain**
```typescript
// ✅ CORRECT: Dexie is source of truth for projects
const projects = useLiveQuery(() => db.projects.toArray());

// ❌ WRONG: Zustand persist + Dexie = dual sources
const useStore = create(persist(...)); // DON'T for persisted data
```

#### 2. **Zustand for UI State, Dexie for Data**
```typescript
// ✅ CORRECT: UI state in Zustand (ephemeral)
const usePanelStore = create((set) => ({
  leftPanelOpen: true,
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
}));

// ✅ CORRECT: Data in Dexie (persistent)
const projects = useLiveQuery(() => db.projects.toArray());
```

#### 3. **Hydration Pattern for Session State**
```typescript
// Already implemented in Project Alpha!
// src/infrastructure/persistence/stores/project/useProjectStore.ts

export const useProjectStore = create<CombinedProjectState>()((set, get) => ({
  projects: {},
  activeProjectId: null,
  _hasHydrated: false,
  
  // Hydrate from Dexie on first load
  hydrateProjects: async () => {
    const projects = await db.projects.toArray();
    set({ projects: Object.fromEntries(projects.map(p => [p.id, p])), _hasHydrated: true });
  },
}));
```

#### 4. **useLiveQuery for Reactive Data**
```typescript
// ✅ CORRECT: Dexie's useLiveQuery handles reactivity
function ProjectList() {
  const projects = useLiveQuery(() => db.projects.toArray());
  
  if (!projects) return <Loading />;
  return <List items={projects} />;
}
```

#### 5. **useShallow for Zustand Selectors**
```typescript
// ✅ CORRECT: Prevents infinite re-render loops
const { items, addItem } = useStore(
  useShallow((state) => ({
    items: state.items,
    addItem: state.addItem,
  }))
);

// ❌ WRONG: Creates new object reference every render
const items = useStore((s) => s.items);
const addItem = useStore((s) => s.addItem);
```

---

### Recommended Boundaries for Project Alpha

| State Type | Technology | Scope | Examples | Reactivity Source |
|------------|------------|-------|----------|-------------------|
| **UI** | Zustand (no persist) | Component | Panel open/closed, selection, focus | Zustand subscription |
| **Session** | Zustand + Dexie hydration | Tab/Window | Active project, workspace, tabs | Zustand + hydration |
| **Persisted** | Dexie.js (useLiveQuery) | Forever | Projects, threads, settings | Dexie liveQuery |
| **Files** | FSA/IDB Adapters | Disk/IDB | Source files, documents | Sync engine events |
| **Sync Status** | Dexie + EventEmitter | Session | Sync progress, errors | Event bus |

---

### Event Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Action                                 │
│            (click, type, navigate, etc.)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ React Component                                                 │
│ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│ │ UI State        │  │ Data Query      │  │ Mutation        │  │
│ │ (Zustand hook)  │  │ (useLiveQuery)  │  │ (Dexie write)   │  │
│ └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
└──────────┼────────────────────┼────────────────────┼────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Zustand Store    │  │ Dexie.js        │  │ Dexie.js        │
│ (in-memory)      │  │ (liveQuery)     │  │ (transaction)   │
└──────────────────┘  └─────────┬────────┘  └────────┬────────┘
                                │                    │
                                │    ┌───────────────┘
                                ▼    ▼
                     ┌──────────────────────┐
                     │ IndexedDB            │
                     │ (persistent storage) │
                     └──────────────────────┘
                                │
                                ▼
                     ┌──────────────────────┐
                     │ liveQuery triggers   │
                     │ re-render of any     │
                     │ observing component  │
                     └──────────────────────┘
```

---

### Conflict Prevention Rules

1. **Never use Zustand persist middleware for data that belongs in Dexie**
   - Already fixed in useProjectStore (line 50-53)
   - Dexie is single source of truth for projects

2. **Always use useShallow() for Zustand selectors that return objects/arrays**
   - Already implemented (useAllProjects, useRecentProjects)
   - Prevents infinite re-render loops

3. **Hydrate session state from Dexie, don't duplicate**
   ```typescript
   // Session start: hydrate from Dexie
   await useProjectStore.getState().hydrateProjects();
   
   // During session: Zustand is working copy
   // On meaningful change: persist back to Dexie
   ```

4. **Use EventEmitter for cross-cutting concerns (sync, errors)**
   ```typescript
   // Already exists: src/infrastructure/sync/core/sync-events.ts
   emitSyncStarted(totalFiles, direction);
   emitSyncCompleted(totalFiles, synced, skipped, duration);
   ```

5. **File state flows through sync engine, never directly**
   ```typescript
   // ✅ CORRECT
   await syncEngine.sync({ direction: 'upload' });
   
   // ❌ WRONG
   await fsaAdapter.writeFile(path, content); // Bypasses metadata cache
   ```

6. **useLiveQuery for any data that might change from external sources**
   - Other tabs can modify IndexedDB
   - useLiveQuery auto-updates when data changes
   - No manual subscription management needed

---

### Anti-Patterns to Avoid

| Anti-Pattern | Problem | Correct Pattern |
|--------------|---------|-----------------|
| `create(persist(...))` for entities | Dual source of truth | Dexie + hydration |
| Direct IndexedDB access | No reactivity | useLiveQuery |
| Multiple stores for same data | Sync nightmares | Single store per domain |
| Event listeners without cleanup | Memory leaks | useEffect cleanup |
| Polling Dexie for changes | CPU waste | useLiveQuery reactive |
| Circular store dependencies | Infinite loops | One-way data flow |

---

## Summary of Answers

| Question | Answer | ADR Needed? | Effort |
|----------|--------|-------------|--------|
| Q4: Large Project Sync | Layered delta sync: FileSystemObserver → mtime cache → content hash → snapshot. Leverage existing FileMetadataCache. Add batch FSA operations. | Yes - ADR-040 | 2-3 epics |
| Q6: State Boundaries | 4-layer architecture already partially in place. Key fixes: (1) Never Zustand persist for entities, (2) Always useLiveQuery for Dexie data, (3) useShallow for all Zustand selectors, (4) File ops through sync engine only. | Yes - ADR-041 | 1 epic |

---

## Action Items

### Q4: Delta Sync
1. [ ] Audit current FileMetadataCache usage - is it used everywhere?
2. [ ] Add FileSystemObserver feature detection + polyfill
3. [ ] Implement batch FSA operations (readdir, stat batching)
4. [ ] Add session snapshot system for recovery
5. [ ] Create ADR-040: Delta Sync Strategy

### Q6: State Boundaries
1. [x] Remove Zustand persist from useProjectStore (DONE - line 50-53)
2. [x] Add useShallow to all selector hooks (DONE - useAllProjects, etc.)
3. [ ] Audit all Zustand stores for persist middleware misuse
4. [ ] Document state layer ownership in architecture.md
5. [ ] Create ADR-041: State Management Boundaries

---

## References

- [FileSystemObserver Proposal](https://raw.githubusercontent.com/whatwg/fs/main/proposals/FileSystemObserver.md)
- [Dexie.js useLiveQuery](https://dexie.org/docs/dexie-react-hooks/useLiveQuery())
- [Zustand Persist Middleware](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)
- [file-entry-cache npm](https://github.com/royriojas/file-entry-cache)
- [Automerge Local Sync](https://automerge.org/docs/tutorial/local-sync)

---

**Document Generated**: 2026-01-28 12:19
**Governance**: analyst-ext research task
**TTL**: 90 days (Tier 3 - Archival)
