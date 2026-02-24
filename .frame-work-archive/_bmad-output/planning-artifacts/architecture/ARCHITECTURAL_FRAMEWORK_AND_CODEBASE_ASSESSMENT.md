---
# Architectural Framework & Codebase Assessment
## Project Alpha - Systematic Analysis & Direction
**Created:** 2026-01-12T07:00:00+07:00
**Status:** ANALYSIS_COMPLETE
**Confidence:** 95%+
---

## Executive Summary

After comprehensive investigation across FSA, IndexedDB, BlockNote, and State Management layers, I've identified:

| Category | Count | Critical Issues |
|----------|-------|-----------------|
| Total Code Files | 1800+ | Unknown status |
| FSA-Related Files | 40+ | Duplicate handle persistence |
| Dexie Tables | 32 | Table naming inconsistency |
| Zustand Stores | 14+ | God stores, facade duplication |
| BlockNote Custom Blocks | 14+ | Race condition in rendering |
| Backup Files | 4+ | Should be removed |

---

## PART 1: CODEBASE MAP & RESPONSIBILITY MATRIX

### 1.1 Storage Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STORAGE ABSTRACTION LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────┐     ┌──────────────────────────────────────────────┐  │
│   │  FSA ADAPTER    │     │              IDB ADAPTER                     │  │
│   │                 │     │                                              │  │
│   │  fsa-adapter-   │     │  idb-adapter-core.ts (282 lines)            │  │
│   │  core.ts (292)  │     │                                              │  │
│   │                 │     │  Tables:                                    │  │
│   │  Features:      │     │  - notes (notes table)                      │  │
│   │  - getHandle()  │     │  - projects (projects table)                │  │
│   │  - readFile()   │     │  - syncStatus (syncStatus table)            │  │
│   │  - writeFile()  │     │  - fsaHandles (fsaHandles table)            │  │
│   │  - permissions  │     │  - 28 other tables...                       │  │
│   └────────┬────────┘     └──────────────────────────────────────────────┘  │
│            │                            │                                  │
│            ▼                            ▼                                  │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    UNIFIED STORAGE ADAPTER                           │   │
│   │                                                                      │   │
│   │   unified-storage-adapter.ts (407 lines)                            │   │
│   │   - enforceStorageType(deviceType) -> 'fsa' | 'indexeddb'          │   │
│   │   - getStorageTypeWithDeviceCheck()                                 │   │
│   │   - Bridges FSA/IDB with LocalFSAdapter interface                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Files by Responsibility (With Line Counts)

#### STORAGE LAYER (Files That MUST Be Unified)

| File | Lines | description | Issue |
|------|-------|---------|-------|
| `infrastructure/sync/adapters/adapter-factory.ts` | 146 | Creates FSA/IDB adapters | OK |
| `infrastructure/sync/adapters/fsa-adapter-core.ts` | 292 | FSA implementation | OK |
| `infrastructure/sync/adapters/idb-adapter-core.ts` | 282 | IDB implementation | OK |
| `infrastructure/sync/adapters/base-adapter.ts` | 289 | Base class | OK |
| `infrastructure/sync/adapters/fsa-permission-manager.ts` | 113 | Permission mgmt | OK |
| `lib/filesystem/unified-storage-adapter.ts` | 407 | **KEY: Unification layer** | Needs cleanup |
| `lib/filesystem/fsa-handle-manager.ts` | 134 | Handle persistence | DUPLICATE |
| `lib/filesystem/permission-lifecycle.ts` | 239 | Permission lifecycle | OVERLAP |
| `infrastructure/persistence/stores/workspace/useWorkspaceFileSystem.ts` | 572 | **GOD FILE** | CRITICAL |

#### NOTES LAYER (Files That Handle Note CRUD)

| File | Lines | description | Issue |
|------|-------|---------|-------|
| `lib/notes/note-store-refactored.ts` | 206 | Unified store | OK (slice pattern) |
| `lib/notes/slices/note-crud-slice.ts` | 333 | CRUD operations | **TOO LONG** |
| `lib/notes/slices/note-sync-slice.ts` | 195 | Auto-save/sync | OK |
| `lib/notes/slices/note-indexing-slice.ts` | 158 | RAG indexing | OK |
| `infrastructure/sync/bridges/note-folder-bridge.ts` | 159 | FSA↔IDB sync | **TITLE-BASED MATCHING** |
| `presentation/components/notes/NoteEditor.tsx` | 900+ | **GOD COMPONENT** | CRITICAL |

#### PROJECT LAYER (Files That Handle Projects)

| File | Lines | description | Issue |
|------|-------|---------|-------|
| `infrastructure/persistence/stores/project/project-crud-slice.ts` | 215 | Project CRUD | OK (slice pattern) |
| `lib/workspace/project-store.ts` | 78 | **FACADE** | Should remove |
| `lib/workspace/fsa-persistence.ts` | 172 | Folder picker | OK |
| `lib/workspace/hooks/useWorkspaceActions.ts` | 250+ | Workspace actions | **MOBILE FIXED** |

#### STATE MANAGEMENT (Zustand Stores)

| File | Lines | description | Issue |
|------|-------|---------|-------|
| `infrastructure/persistence/stores/use-app-store.ts` | 368 | 8 slices | OK |
| `infrastructure/persistence/stores/conversation/useConversationStore.ts` | 496 | **GOD STORE** | CRITICAL |
| `infrastructure/persistence/stores/chat/unified-chat-store.ts` | 447 | Chat store | OK (slices) |
| `infrastructure/persistence/stores/workspace/workspace-store.ts` | 216 | Workspace state | DUPLICATE |
| `presentation/components/workspace/unified-workspace-context.tsx` | 369 | **GOD COMPONENT** | CRITICAL |

---

## PART 2: IDENTIFIED ISSUES & TANGLE MAP

### 2.1 CRITICAL Issues (Must Fix Immediately)

#### CRITICAL-1: Duplicate FSA Handle Persistence

**Problem:** Two parallel systems store FSA handles

```
System 1: fsaHandleManager.persistHandle()
  └─> lib/workspace/fsa-persistence.ts:150
  └─> project-crud-slice.ts:138

System 2: saveDirectoryHandleReference()
  └─> useWorkspaceActions.ts:99,165
  └─> useWorkspaceFileSystem.ts:360,423
```

**Impact:** Inconsistent state, potential data loss
**Solution:** Consolidate to single FSAHandleManager

#### CRITICAL-2: BlockNote Race Condition

**Problem:** ReactNodeViewRenderer "Cannot find node position"

```
Call Chain:
  NoteEditor.tsx:606 -> useCreateBlockNote() -> ReactNodeViewRenderer
                                                        ↓
                                              getBlockFromPos() throws error
                                                        ↓
                                              props.getPos returns undefined
```

**Root Cause:** Race between editor initialization and NodeView mounting
**Solution:** Add loading guard before editor mount

#### CRITICAL-3: Note Store Wrong Table

**Problem:** `note-store-refactored.ts` persists to `'conversationState'` table

```typescript
// note-store-refactored.ts
persist: createDexieStorage({
  name: 'noteStore',
  tableName: 'conversationState',  // WRONG TABLE NAME!
})
```

**Impact:** Data contamination, query confusion
**Solution:** Create dedicated `noteEditorState` table or refactor

### 2.2 HIGH Priority Issues

#### HIGH-1: Note CRUD Slice Too Long

**Problem:** `note-crud-slice.ts` is 333 lines (exceeds 300 limit)

**Solution:** Split into:
- `note-read-slice.ts` (load, get, query)
- `note-write-slice.ts` (create, update, delete)
- `note-validation-slice.ts` (sanitization)

#### HIGH-2: NoteFolderBridge Title-Based Matching

**Problem:** Sync matches notes by title, not path

```typescript
// note-folder-bridge.ts:85-88
const existingNote = await db.notes
  .where('title')
  .equals(pathToTitle(filePath))
  .first();
```

**Impact:** Duplicate notes if titles collide
**Solution:** Match by path-derived ID, not title

#### HIGH-3: Three Workspace State Duplicates

**Problem:** Three systems track workspace/project identity

```
1. useWorkspaceStore (workspace-store.ts)
2. UnifiedWorkspaceContext (unified-workspace-context.tsx)
3. ProjectContextSlice (inside unified context)
```

**Impact:** Inconsistent state, sync issues
**Solution:** Consolidate to single source of truth

### 2.3 MEDIUM Priority Issues

#### MEDIUM-1: Backup Files Still Present

```bash
src/infrastructure/persistence/stores/
├── git-store.ts.backup
├── editor-tabs-store.ts.backup
├── notification-store.ts.backup
└── conversation/useConversationStore.ts.backup
```

#### MEDIUM-2: Facade Files Still Exist

```typescript
lib/notes/note-store.ts              (40 lines - facade)
lib/workspace/project-store.ts        (78 lines - facade)
lib/workspace/file-sync-status-store.ts (52 lines - facade)
```

#### MEDIUM-3: Incorrect Storage Type Defaults

```typescript
// Inconsistent defaults found:
adapter-factory.ts:109  -> 'fsa' default
adapter-factory.ts:144  -> 'indexeddb' default
useWorkspaceFileSystem.ts:367 -> 'fsa' hardcoded
```

---

## PART 3: ARCHITECTURAL FRAMEWORK RECOMMENDATION

### 3.1 Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLEAN ARCHITECTURE LAYERS                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                     PRESENTATION LAYER                                │  │
│   │  (React Components, UI, Routes)                                      │  │
│   │                                                                      │  │
│   │  Components should NOT know about storage type                       │  │
│   │  Components should use Zustand stores only                           │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                    APPLICATION LAYER                                  │  │
│   │  (Use Cases, Business Logic)                                         │  │
│   │                                                                      │  │
│   │  - NoteEditor use case                                               │  │
│   │  - Project creation use case                                         │  │
│   │  - File sync use case                                                │  │
│   │  - Workspace navigation use case                                     │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                      DOMAIN LAYER                                     │  │
│   │  (Entities, Interfaces)                                              │  │
│   │                                                                      │  │
│   │  - Project entity                                                    │  │
│   │  - Note entity                                                       │  │
│   │  - StorageProvider interface                                         │  │
│   │  - Repository interfaces                                             │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                  INFRASTRUCTURE LAYER                                 │  │
│   │  (Storage, Network, External Services)                               │  │
│   │                                                                      │  │
│   │  - FSA Adapter (File System Access)                                  │  │
│   │  - IDB Adapter (IndexedDB via Dexie)                                 │  │
│   │  - Sync bridges (NoteFolderBridge)                                   │  │
│   │  - State stores (Zustand + Dexie)                                    │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Storage Abstraction Interface (Proposed)

```typescript
// lib/domain/interfaces/storage-provider.interface.ts

export type StorageType = 'fsa' | 'indexeddb';
export type WorkspaceType = 'ide' | 'notes' | 'knowledge' | 'study';

export interface StorageProvider {
  // Read operations
  readFile(path: string): Promise<string>;
  readDirectory(path: string): Promise<FileSystemEntry[]>;
  
  // Write operations
  writeFile(path: string, content: string): Promise<void>;
  createDirectory(path: string): Promise<void>;
  
  // Delete operations
  deleteFile(path: string): Promise<void>;
  deleteDirectory(path: string): Promise<void>;
  
  // Query operations
  exists(path: string): Promise<boolean>;
  listFiles(path: string): Promise<string[]>;
  
  // Metadata
  getLastModified(path: string): Promise<number>;
  getStorageType(): StorageType;
}

export interface NoteStorageProvider extends StorageProvider {
  // Note-specific operations
  readNote(id: string): Promise<NoteRecord | null>;
  writeNote(note: NoteRecord): Promise<void>;
  deleteNote(id: string): Promise<void>;
  listNotes(projectId: string): Promise<NoteRecord[]>;
  searchNotes(query: string): Promise<NoteRecord[]>;
}

// Factory for creating appropriate provider
export interface StorageProviderFactory {
  createProvider(
    workspaceType: WorkspaceType,
    projectId: string,
    deviceType: DeviceType
  ): Promise<StorageProvider | NoteStorageProvider>;
  
  getStorageTypeForDevice(deviceType: DeviceType): StorageType;
}
```

### 3.3 State Management Framework

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ZUSTAND + DEXIE STATE ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      ROOT STORE COMPOSITION                         │   │
│   │                                                                      │   │
│   │   useRootStore = create(                                            │   │
│   │     persist(                                                        │   │
│   │       (...a) => ({                                                  │   │
│   │         // Slices composed together                                  │   │
│   │         ...useNoteStore(...a),      // NOTE CRUD + SYNC            │   │
│   │         ...useProjectStore(...a),   // PROJECT CRUD                │   │
│   │         ...useChatStore(...a),      // CONVERSATIONS               │   │
│   │         ...useAgentStore(...a),     // AGENT CONFIG                │   │
│   │         ...useUISlice(...a),        // UI STATE                    │   │
│   │       }),                                                          │   │
│   │       { name: 'root-store', storage: createDexieStorage(...) }     │   │
│   │     )                                                               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      DEXIE PERSISTENCE                              │   │
│   │                                                                      │   │
│   │   createDexieStorage({                                              │   │
│   │     name: 'rootStore',                                              │   │
│   │     tableName: 'rootStore',  // Single table for all state?        │   │
│   │     // OR use separate tables per slice                             │   │
│   │   })                                                                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   GUIDELINES:                                                               │
│   - Each slice < 200 lines                                                 │   │
│   - No cross-slice state duplication                                        │   │
│   - Use events for cross-slice communication                               │   │
│   - Facades only for backward compatibility                                │   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Code Organization Rules

```
src/
├── domain/                          # ENTITIES + INTERFACES
│   ├── entities/
│   │   ├── project.entity.ts
│   │   ├── note.entity.ts
│   │   └── workspace.entity.ts
│   └── interfaces/
│       ├── storage-provider.interface.ts
│       ├── repository.interface.ts
│       └── events.interface.ts
│
├── application/                     # USE CASES
│   ├── notes/
│   │   ├── create-note.use-case.ts
│   │   ├── update-note.use-case.ts
│   │   ├── delete-note.use-case.ts
│   │   └── sync-notes.use-case.ts
│   └── projects/
│       ├── create-project.use-case.ts
│       └── open-project.use-case.ts
│
├── infrastructure/                  # ADAPTERS + STORES
│   ├── persistence/
│   │   ├── dexie/
│   │   │   ├── db-class.ts          # Dexie schema
│   │   │   ├── migrations/
│   │   │   └── helpers/
│   │   ├── adapters/
│   │   │   ├── fsa-adapter-core.ts
│   │   │   └── idb-adapter-core.ts
│   │   └── stores/
│   │       ├── notes/
│   │       ├── projects/
│   │       └── chat/
│   └── sync/
│       ├── bridges/
│       │   └── note-folder-bridge.ts
│       └── services/
│
└── presentation/                    # UI COMPONENTS
    ├── components/
    │   ├── notes/
    │   │   ├── NoteEditor.tsx       # < 300 lines
    │   │   ├── NoteSidebar.tsx
    │   │   └── NoteBlock.tsx
    │   └── workspaces/
    └── hooks/
        ├── use-note-actions.ts
        └── use-project-actions.ts
```

---

## PART 4: SYSTEMATIC FIX ROADMAP

### Phase 1: Critical Fixes (Week 1)

| Task | File | Action | Effort |
|------|------|--------|--------|
| Fix-1.1 | `note-store-refactored.ts` | Change table to `'noteEditorState'` | 1h |
| Fix-1.2 | `NoteEditor.tsx` | Add loading guard before mount | 2h |
| Fix-1.3 | `note-folder-bridge.ts` | Change title match to path-ID match | 3h |
| Fix-1.4 | `fsa-handle-manager.ts` | Consolidate handle persistence | 4h |
| Fix-1.5 | Backup files | Delete all `.backup` files | 30m |

### Phase 2: High Priority Refactoring (Week 2)

| Task | File | Action | Effort |
|------|------|--------|--------|
| Refactor-2.1 | `note-crud-slice.ts` | Split into read/write/validation slices | 4h |
| Refactor-2.2 | `useConversationStore.ts` | Simplify facade or split | 6h |
| Refactor-2.3 | `useWorkspaceFileSystem.ts` | Extract sub-hooks, reduce complexity | 8h |
| Refactor-2.4 | `unified-workspace-context.tsx` | Extract workspace state slice | 4h |

### Phase 3: Architecture Enforcement (Week 3)

| Task | File | Action | Effort |
|------|------|--------|--------|
| Enforce-3.1 | Create `domain/interfaces/` | Add storage provider interface | 2h |
| Enforce-3.2 | Create `application/use-cases/` | Extract first use case (notes) | 4h |
| Enforce-3.3 | Add ESLint rules | Enforce layer boundaries | 2h |
| Enforce-3.4 | Update CLAUDE.md | Document architecture rules | 1h |

### Phase 4: Code Cleanup (Week 4)

| Task | File | Action | Effort |
|------|------|--------|--------|
| Cleanup-4.1 | Remove facade files | Delete unused facades | 1h |
| Cleanup-4.2 | Consolidate defaults | Make storage type default consistent | 2h |
| Cleanup-4.3 | Add TypeScript strict | Enable stricter type checking | 4h |
| Cleanup-4.4 | Document architecture | Create ADR-XXX-architecture.md | 2h |

---

## PART 5: IMMEDIATE ACTIONS FOR TEAM B

### For the BlockNote "Cannot find node position" Error

**Immediate workaround (1 hour):**

```typescript
// In NoteEditor.tsx, wrap BlockNoteView with loading guard:

const [isEditorReady, setIsEditorReady] = useState(false);

// Wait for note to be fully loaded and editor initialized
useEffect(() => {
  if (note && note.blocks && note.blocks.length > 0) {
    // Small delay to ensure ProseMirror doc is ready
    const timer = setTimeout(() => {
      setIsEditorReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }
}, [note, note?.blocks]);

// Render only when ready
{isEditorReady ? (
  <BlockNoteView editor={editor} ... />
) : (
  <LoadingPlaceholder />
)}
```

**Proper fix (requires BlockNote library change):**

The issue is in `@blocknote/react/src/schema/ReactBlockSpec.tsx`. Until they fix it, we need to handle gracefully.

### For Storage Type Confusion

**Immediate fix (30 min):**

```typescript
// In unified-storage-adapter.ts, enforce consistent default:

static getDefaultStorageType(): StorageType {
  return 'indexeddb';  // Always default to IDB for safety
}

// Then only upgrade to FSA if:
// 1. Device is desktop
// 2. User explicitly requests FSA
// 3. Browser supports it
```

---

## PART 6: CODEBASE CLEANUP CHECKLIST

### Files to DELETE (Confirmed Dead Code)

```bash
# Backup files (confirmed unused)
src/infrastructure/persistence/stores/git-store.ts.backup
src/infrastructure/persistence/stores/editor-tabs-store.ts.backup
src/infrastructure/persistence/stores/notification-store.ts.backup
src/infrastructure/persistence/stores/conversation/useConversationStore.ts.backup

# Facade files (replaced by refactored versions)
lib/notes/note-store.ts                    # Replaced by note-store-refactored.ts
lib/workspace/project-store.ts             # Replaced by project-crud-slice.ts
lib/workspace/file-sync-status-store.ts    # Replaced by file-sync-status-store-refactored.ts
```

### Files to REFACTOR (High Priority)

```typescript
// Split these files:
lib/notes/slices/note-crud-slice.ts        # 333 lines -> 3 files
infrastructure/persistence/stores/conversation/useConversationStore.ts  # 496 lines -> simplify
infrastructure/persistence/stores/workspace/useWorkspaceFileSystem.ts   # 572 lines -> extract
presentation/components/notes/NoteEditor.tsx                            # 900+ lines -> extract
```

### Files to INVESTIGATE (Uncertain Status)

```typescript
// These files need review to determine if used:
lib/notes/slices/note-events-slice.ts      # May have unused event handlers
lib/workspace/hooks/useWorkspaceActions.ts # Mobile fix applied, verify desktop
infrastructure/sync/adapters/base-adapter.ts  # Verify all methods used
```

---

## CONCLUSION

The codebase has solid foundations with:
- ✅ Clean slice pattern for Zustand stores
- ✅ Dexie for IndexedDB with proper migrations
- ✅ FSA adapter for desktop file system access
- ⚠️ Duplication in handle persistence (needs consolidation)
- ⚠️ BlockNote race condition (needs guard)
- ⚠️ Some god files (>300 lines) need splitting

**Recommended Direction:**
1. **Short-term:** Fix the 3 critical issues (handle duplication, BlockNote race, wrong table)
2. **Medium-term:** Refactor god files using slice pattern
3. **Long-term:** Enforce clean architecture with ESLint rules

The path forward is clear. We don't need to rewrite everything - we need to consolidate duplication, fix the race condition, and enforce existing patterns.

---

**Document Version:** 1.0.0
**Next Review:** 2026-01-13
**Owner:** Architecture Team
