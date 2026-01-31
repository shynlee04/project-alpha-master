# State & Persistence Lifecycle Investigation Report

**Investigation ID:** STATE-PERSISTENCE-01  
**Date:** 2026-01-20  
**Scope:** Project creation → persistence → notes loading lifecycle

---

## Executive Summary

This investigation analyzes the state management and persistence layer for the project creation → notes space lifecycle. The codebase follows a Clean Architecture pattern with clear separation between domain entities, infrastructure persistence, and presentation layers. Key findings reveal a well-structured system with Dexie IndexedDB as the primary persistence layer, Zustand for state management with slice pattern, and File System Access API for desktop storage. Cross-store dependencies are minimal but bridged via React Context (`ProjectProvider`). Several architectural issues were identified including duplicate store exports, cross-slice coupling patterns, and incomplete Dexie storage adapter implementation.

---

## 1. State Stores Analysis

### 1.1 Project Store Architecture

**Files:**
- `src/infrastructure/persistence/stores/project/project-crud-slice.ts` (316 lines)
- `src/infrastructure/persistence/stores/project/useProjectStore.ts` (148 lines)
- `src/infrastructure/persistence/stores/project/index.ts` (290 lines)

**Pattern:** Zustand slice pattern with 5 focused slices:
1. `project-crud-slice.ts` - Project lifecycle operations (create, update, delete)
2. `project-bindings-slice.ts` - Workspace bindings
3. `project-permissions-slice.ts` - FSA permission state
4. `project-layout-slice.ts` - IDE layout state
5. `project-utils-slice.ts` - Utility functions

**Key State Fields:**
```typescript
interface ProjectState {
  projects: Record<string, Project>;  // In-memory cache
  activeProjectId: string | null;
  _hasHydrated?: boolean;
}
```

**Persistence Strategy:**
- Dexie IndexedDB is the SINGLE SOURCE OF TRUTH for projects
- Zustand store is a transient in-memory cache (NOT persisted via localStorage)
- Hydration occurs on store initialization via `hydrateProjects()`

**Issues Identified:**

| Issue | File | Evidence |
|-------|------|----------|
| Duplicate facade exports | `src/infrastructure/persistence/stores/project/index.ts` | Lines 65-290 contain deprecated async facade functions that wrap Zustand store methods |
| Complex state composition | `useProjectStore.ts` | Combined state type requires maintaining 6 interface alignments |
| Mixed async/sync patterns | `project-crud-slice.ts` | `createProject` is async (DB write) but `updateProject`/`deleteProject` are sync |

### 1.2 Notes Store Architecture

**Files:**
- `src/lib/notes/note-store-refactored.ts` (208 lines)
- `src/lib/notes/types-slice.ts`
- `src/lib/notes/slices/note-crud-slice.ts`

**Pattern:** Zustand slice pattern with 7 focused slices:
1. `note-ui-slice.ts` - UI state (active note, loading)
2. `note-query-slice.ts` - Read-only queries
3. `note-events-slice.ts` - Cross-workspace communication
4. `note-indexing-slice.ts` - RAG background indexing
5. `note-sync-slice.ts` - Auto-save & file sync
6. `note-metadata-slice.ts` - Favorite, move operations
7. `note-crud-slice.ts` - Core lifecycle operations

**Key State Fields:**
```typescript
interface NoteStoreState {
  notes: Map<string, NoteRecord>;
  notesArray: NoteRecord[];
  activeNoteId: string | null;
  currentProjectId: string | null;  // Bridges to project context
  indexingNoteIds: Set<string>;
  saveStatus: "error" | "idle" | "saving" | "saved";
  dirtyNoteIds: Set<string>;
}
```

**Persistence Strategy:**
- Zustand persist middleware with `partialize` for essential state only
- Active note ID and project ID persist to Dexie `conversationState` table
- Full note records persist directly to Dexie `notes` table (not via Zustand persist)

**Issues Identified:**

| Issue | File | Evidence |
|-------|------|----------|
| Notes store location mismatch | `src/lib/notes/note-store-refactored.ts` | Store lives in `src/lib/notes/` instead of canonical `infrastructure/persistence/stores/notes/` |
| Incomplete barrel exports | `src/infrastructure/persistence/stores/notes/index.ts` | Only exports `note-context-tracker` and `slash-commands` (3 files total) |
| Dual export paths | `src/lib/notes/index.ts` | Exports from both `note-store.ts` and `note-store-refactored.ts` causing confusion |

---

## 2. Persistence Layer Analysis

### 2.1 Dexie Database Schema

**File:** `src/infrastructure/persistence/dexie-db.ts` (1165 lines)

**Core Tables:**
```typescript
class ViaGentDatabase extends Dexie {
  projects: Table<ProjectRecord, string>;
  ideState: Table<IDEStateRecord, string>;
  notes: Table<NoteRecord, string>;
  fsaHandles: Table<FSAHandleRecord, string>;
  syncStatus: Table<SyncStatusRecord, string>;
  fileMetadata: Table<FileMetadataRecord, string>;
  // ... 30+ additional tables for AI, knowledge, study, etc.
}
```

**Project Record Schema:**
```typescript
interface ProjectRecord {
  id: string;
  name: string;
  path: string;
  workspaceId: "ide" | "knowledge" | "study" | "notes";
  folderPath: string;
  storageType: "fsa" | "indexeddb";
  lastOpened: Date;
  createdAt: Date;
  workspaceBindings: WorkspaceBindings;
  fileSnapshotEnabled: boolean;
}
```

**Notes Record Schema:**
```typescript
interface NoteRecord {
  id: string;
  projectId: string;  // Foreign key to project
  title: string;
  emoji?: string;
  blocks: unknown[];
  parentId?: string;
  order: number;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### 2.2 Handle Persistence Mechanism

**File:** `src/infrastructure/filesystem/handle-persistence.ts` (599 lines)

**Storage Strategy (Per ADR-033):**
- **Desktop (FSA):** FileSystemDirectoryHandle stored via `structuredClone` (Chrome 129+) or metadata only (older browsers)
- **Mobile (IndexedDB):** No FSA handle needed, uses IndexedDB storage

**Key Classes:**
```typescript
class HandlePersistenceService {
  async persistHandle(projectId, handle, workspaceId): Promise<void>
  async restoreHandle(projectId): Promise<HandleRestoreResult>
  async deleteHandle(projectId): Promise<void>
}

interface HandleRestoreResult {
  success: boolean;
  handle: FileSystemDirectoryHandle | null;
  error?: string;
  requiresUserInteraction: boolean;
}
```

**Chrome Version Detection:**
- Chrome 129+: Can store actual `FileSystemDirectoryHandle` via `structuredClone`
- Chrome 122-128: Store metadata only, attempt silent restore via persistent permissions
- Pre-Chrome 122: User prompt required on every restore

**Issues Identified:**

| Issue | File | Evidence |
|-------|------|----------|
| Dexie storage adapter missing | `src/infrastructure/filesystem/dexie-storage-adapter.ts` | File does not exist - only FSA adapter implemented |
| Handle persistence coupling | `handle-persistence.ts` | Directly imports from `dexie-db-helpers/fsa-handle-helpers` creating tight coupling |
| Permission state duplication | `project-permissions-slice.ts` | Permission state exists in both Zustand slice AND FSAHandleRecord (dual source of truth) |

### 2.3 Storage Gateway Interface

**File:** `src/domain/interfaces/storage-gateway.interface.ts` (246 lines)

**Abstract Interface:**
```typescript
interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): WatchHandle;
  rename(oldPath: string, newPath: string): Promise<void>;
  createDirectory(path: string): Promise<void>;
}

interface StorageGatewayFactory {
  create(storageType: "fsa" | "indexeddb"): StorageGateway;
}
```

**Issues Identified:**

| Issue | File | Evidence |
|-------|------|----------|
| Factory implementation missing | `StorageAdapterFactory.ts` | No concrete factory implementation found for creating gateway based on storage type |
| Incomplete FSA adapter | `fsa-storage-adapter.ts` | Implements `StorageAdapter` interface, not `StorageGateway` interface - naming inconsistency |

---

## 3. Data Flow Analysis

### 3.1 Project Creation Flow

```
1. User initiates project creation (Hub or direct)
   ↓
2. createProject() called with CreateProjectInput
   - name, folderPath, storageType, workspaceBindings
   ↓
3. generateProjectId() creates: proj_{timestamp}_{random}
   ↓
4. Project stored in Zustand (in-memory cache)
   ↓
5. Project persisted to Dexie 'projects' table (async, blocking)
   ↓
6. Handle persisted separately via handlePersistenceService.persistHandle()
   - For FSA: structuredClone handle (Chrome 129+) or metadata
   - For IndexedDB: No handle needed
```

**Critical Path:**
```typescript
// project-crud-slice.ts:124-183
createProject: async (input: CreateProjectInput) => {
  const projectId = generateProjectId(workspaceType);
  const project = { id: projectId, name: input.name, ... };
  
  // Update Zustand store (in-memory)
  set((state) => ({ projects: { ...state.projects, [projectId]: project } }));
  
  // Persist to Dexie (async, blocking - BUG-005 FIX)
  await db.projects.put(toRecord(project, workspaceType));
  
  // Handle persistence done SEPARATELY by fsa-persistence.ts
  return projectId;
}
```

### 3.2 Notes Loading Flow

```
1. Route /notes/$projectId matches
   ↓
2. Route loader executed (TanStack Router)
   - waitForHydration() to ensure store hydrated
   - Query Dexie 'projects' table for project
   - Convert ProjectRecord to Project via fromRecord()
   ↓
3. ProjectProvider wraps NotesPage with context
   - Sets project context value
   - Restores FSA handle (desktop only)
   ↓
4. NotesPage component renders
   ↓
5. useEffect triggers loadNotes(projectId)
   - Query Dexie 'notes' table for notes with projectId
   - Populate Zustand store 'notes' Map
   ↓
6. User sees notes in sidebar, can open/edit notes
```

**Critical Code:**
```typescript
// notes.$projectId.tsx:44-64
loader: async ({ params }) => {
  await waitForHydration();
  const record = await db.projects.get(projectId);
  if (!record) throw redirect({ to: '/hub' });
  const project = fromRecord(record);
  return { project };
}

// note-crud-slice.ts: loadNotes()
loadNotes: async (projectId: string) => {
  const notes = await db.notes.where('projectId').equals(projectId).toArray();
  const notesMap = new Map(notes.map(n => [n.id, n]));
  set({ notes: notesMap, notesArray: notes });
}
```

### 3.3 Cross-Store Dependencies

**Project Store → Notes Store:**
- Notes store has `currentProjectId` field that bridges to project context
- Notes are filtered by `projectId` when loading
- No direct imports between stores (good separation)

**React Context Bridge:**
```typescript
// ProjectContext.tsx
interface ProjectContextValue {
  project: Project | null;
  currentWorkspace: WorkspaceId;
  enabledWorkspaces: WorkspaceId[];
  fsaHandle: FsaHandle;  // For StorageAdapterFactory access
  setFsaHandle: (handle) => void;
  switchWorkspace: (workspace) => void;
}

// NotesPage uses context
const { project } = useProjectContext();
const loadNotes = useNoteStore(s => s.loadNotes);
useEffect(() => { loadNotes(project.id); }, [project?.id]);
```

**Issues Identified:**

| Issue | File | Evidence |
|-------|------|----------|
| Project context in notes store | `note-context-tracker.ts:123` | `const projectId = noteState.currentProjectId;` - Duplicated projectId source |
| Indirect coupling | Multiple files | Notes store needs project context but accesses via `useNoteStore.getState().currentProjectId` |
| Potential race condition | `ProjectContext.tsx:280-308` | FSA handle restore is async and may not complete before NotesPage renders |

---

## 4. Issues Summary

### 4.1 State Management Issues

| Severity | Category | Issue | Recommendation |
|----------|----------|-------|----------------|
| Medium | Duplication | Dual async/sync patterns in project store | Standardize all CRUD to async |
| Medium | Architecture | Notes store in `src/lib/notes/` instead of `infrastructure/persistence/stores/` | Move to canonical location |
| Low | Deprecated | Facade functions in `project/index.ts` (lines 65-290) | Remove deprecated exports |

### 4.2 Persistence Issues

| Severity | Category | Issue | Recommendation |
|----------|----------|-------|----------------|
| **High** | Missing | Dexie storage adapter not implemented | Implement `DexieStorageAdapter` |
| High | Architecture | No `StorageGatewayFactory` implementation found | Create factory for gateway selection |
| Medium | Coupling | Handle persistence directly imports from Dexie helpers | Use abstraction layer |

### 4.3 Data Flow Issues

| Severity | Category | Issue | Recommendation |
|----------|----------|-------|----------------|
| Medium | Race | FSA handle restore may not complete before render | Add loading state or await |
| Low | Duplication | ProjectId sourced in both `currentProjectId` and `ProjectContext` | Consolidate to single source |

---

## 5. Uncleaned Files

### 5.1 Storage Adapter Files

| Path | Issue | Evidence | Recommendation |
|------|-------|----------|----------------|
| `src/infrastructure/filesystem/dexie-storage-adapter.ts` | File does not exist | Only FSA adapter exists | Implement Dexie adapter |
| `src/infrastructure/filesystem/StorageAdapterFactory.ts` | May not exist | Factory interface defined but no concrete implementation | Verify and implement |

### 5.2 Notes Store Files

| Path | Issue | Evidence | Recommendation |
|------|-------|----------|----------------|
| `src/lib/notes/note-store.ts` | Duplicate of `note-store-refactored.ts` | Both export `useNoteStore` | Consolidate to one |
| `src/lib/notes/note-store-refactored.ts` | Not in canonical location | Lives in `lib/notes/` | Move to `infrastructure/persistence/stores/notes/` |

### 5.3 Project Store Files

| Path | Issue | Evidence | Recommendation |
|------|-------|----------|----------------|
| `src/infrastructure/persistence/stores/project/index.ts` | Deprecated facade functions | Lines 65-290 contain deprecated async wrappers | Remove or deprecate clearly |

---

## 6. Synthesis

### State & Persistence Lifecycle Summary

The project creation → notes loading lifecycle follows a multi-layered architecture that separates concerns across domain, infrastructure, and presentation layers. Project creation generates a unique ID (`proj_{timestamp}_{random}`), stores project metadata in both Zustand (transient cache) and Dexie IndexedDB (persistent), and separately persists the FSA handle via `HandlePersistenceService`. The notes loading flow leverages TanStack Router's loader pattern with hydration waiting, queries Dexie for project context, and bridges to the notes store via React Context (`ProjectProvider`). Cross-store dependencies are minimal, with the `currentProjectId` field in the notes store serving as the primary bridge to project context.

### Key Architectural Strengths

1. **Slice Pattern Implementation:** Both project and notes stores follow the focused slice pattern with single-responsibility modules (<120 lines per slice)
2. **Clean Persistence Separation:** Dexie is single source of truth, Zustand is transient cache
3. **Handle Persistence Strategy:** Chrome version-aware handle storage with graceful degradation
4. **React Context Bridging:** `ProjectProvider` cleanly shares project state across workspaces

### Key Architectural Weaknesses

1. **Incomplete Storage Gateway:** Only FSA adapter exists, Dexie adapter missing
2. **Store Location Inconsistency:** Notes store lives in `lib/notes/` instead of `infrastructure/persistence/stores/notes/`
3. **Dual Export Patterns:** Multiple barrel exports create confusion about canonical location
4. **Cross-Slice Coupling:** Some operations are async while others are sync, creating inconsistent behavior

### Recommendations Priority

1. **Immediate:** Implement missing `DexieStorageAdapter` and `StorageGatewayFactory`
2. **Short-term:** Move notes store to canonical location and consolidate duplicate exports
3. **Medium-term:** Standardize CRUD patterns (all async) and remove deprecated facade functions
4. **Long-term:** Consider consolidating store locations to match canonical directory structure defined in AGENTS.md

---

## Appendix: File Reference Matrix

| Category | File Path | Lines | Purpose |
|----------|-----------|-------|---------|
| Domain Entity | `src/domain/entities/project.ts` | 124 | Project entity definition |
| Domain Interface | `src/domain/interfaces/storage-gateway.interface.ts` | 246 | Storage abstraction |
| Persistence | `src/infrastructure/persistence/dexie-db.ts` | 1165 | Dexie database with 30+ tables |
| Persistence | `src/infrastructure/filesystem/handle-persistence.ts` | 599 | FSA handle storage/restore |
| Project Store | `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | 316 | Project CRUD operations |
| Project Store | `src/infrastructure/persistence/stores/project/useProjectStore.ts` | 148 | Unified project store |
| Notes Store | `src/lib/notes/note-store-refactored.ts` | 208 | Unified notes store |
| Notes Store | `src/lib/notes/note-context-tracker.ts` | 311 | Note context for AI agents |
| Context | `src/lib/workspace/ProjectContext.tsx` | 507 | Cross-workspace project sharing |
| Route | `src/routes/notes.$projectId.tsx` | 101 | Notes route with loader |
| Storage | `src/infrastructure/filesystem/fsa-storage-adapter.ts` | 673 | FSA storage implementation |
