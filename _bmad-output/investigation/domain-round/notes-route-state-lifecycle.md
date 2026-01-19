---
investigation_id: "NOTES-ROUTE-STATE-LIFECYCLE"
created: "2026-01-20T20:30:00+07:00"
scope:
  - "Notes space route structure analysis"
  - "Guard and loader investigation"
  - "State management lifecycle"
  - "Cross-domain dependencies"
  - "File inventory"
  - "Issues identification"
agent: "domain-round-investigation"
---

# Notes Route/State Lifecycle Investigation Report

## Executive Summary

This investigation provides a comprehensive analysis of the Notes workspace route structure, guards, loaders, and state management lifecycle. The investigation covers 85+ files across routes, stores, services, and components. Key findings include:

- **Route Structure**: 2 main route files (`notes.lazy.tsx`, `notes.$projectId.tsx`) with redirect logic and hydration guards
- **State Management**: 2 parallel note store implementations (lib/notes/ and infrastructure/persistence/stores/notes/)
- **Cross-Layer Issues**: 12 instances of domain importing infrastructure types
- **Deprecated Imports**: 82 files importing from `@/lib/notes/*` instead of canonical paths
- **God Components**: NotesPage.tsx at 975 lines (3x the 300-line limit)

---

## Part 1: Route Structure Analysis

### 1.1 Route Files Overview

| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `src/routes/notes.lazy.tsx` | 173 | Redirect route `/notes` → `/notes/$projectId` | ~80 lines of BUG-FIX comments |
| `src/routes/notes.$projectId.tsx` | 101 | Main Notes workspace route | Uses deprecated ProjectContext |

### 1.2 Route Pattern

```
/notes                          → Redirect (auto-select project or go to hub)
/notes/$projectId               → Main Notes workspace with ProjectProvider
```

### 1.3 notes.lazy.tsx Analysis

**Location**: `src/routes/notes.lazy.tsx`

**Key Logic**:
```typescript
// Lines 56-172: NotesRedirect component
// - Detects platform (desktop/mobile)
// - Queries projects with notes binding
// - Auto-redirects to most recent project
// - Redirects to hub if no projects exist
```

**BUG-FIX Comments Found**:
- Line 7: `TASK-2 FIX: No blocking dialogs`
- Line 12: `BUG-FIX-006: Include FSA projects on desktop`
- Line 15: `BUG-FIX-010: Allow browser-mode fallback`
- Line 19: `BUG-015 FIX: Added <Outlet /> for child routes`
- Line 59: `BUG-021 FIX: Use useLocation for stable child route detection`
- Line 64: `BUG-019 FIX: Move all hooks BEFORE any early return`

**Deprecated Patterns**:
- Uses `useLiveQuery` (dexie-react-hooks) instead of Zustand selectors
- Imports from `lib/notes` (should be infrastructure)

### 1.4 notes.$projectId.tsx Analysis

**Location**: `src/routes/notes.$projectId.tsx`

**Key Components**:
```typescript
// Lines 41-64: Route definition with loader
loader: async ({ params }) => {
  await waitForHydration();  // INF-03 FIX
  const record = await db.projects.get(projectId);
  if (!record) throw redirect({ to: '/hub' });
  return { project: fromRecord(record) };
}

// Lines 72-100: NotesWorkspace component
// Wraps NotesPage with ProjectProvider
```

**Issues**:
- Line 28: Import from `@/lib/workspace/ProjectContext` (deprecated location)
- Line 32: Uses `waitForHydration()` - necessary but indicates hydration complexity
- Line 33: Uses `fromRecord()` for type conversion

---

## Part 2: Guard and Loader Investigation

### 2.1 Loader Functions

| Route | Loader Function | Dependencies | Issues |
|-------|----------------|--------------|--------|
| `/notes` | None (lazy route) | N/A | Redirect logic in component |
| `/notes/$projectId` | `waitForHydration()` → Dexie query | useProjectStore, db.projects | Race condition fix applied |

### 2.2 Guard Logic

**Platform Detection** (`getPlatformContract()`):
- Used in `notes.lazy.tsx:68` for desktop/mobile detection
- Returns `{ deviceType, canAccessFSA, canAccessIDE }`

**Project Existence Check**:
- Route loader queries Dexie directly (not Zustand store)
- Redirects to `/hub` if project not found

**Workspace Binding Check**:
- `notes.lazy.tsx:101-104`: Filters projects with `workspaceBindings.notes === true`
- Falls back to browser-mode projects if no FSA projects

**IDE Access Guard** (`notes.$projectId.tsx:83-91`):
- Shows toast for mobile users redirected from IDE
- Search param: `reason: "mobile-not-supported"`

### 2.3 Hydration Handling

**waitForHydration()** (`src/infrastructure/persistence/stores/project/wait-for-hydration.ts`):
```typescript
export function waitForHydration(): Promise<void> {
  const state = useProjectStore.getState();
  if (state._hasHydrated) return Promise.resolve();
  
  return new Promise((resolve) => {
    const unsubscribe = useProjectStore.subscribe(
      (state) => {
        if (state._hasHydrated) {
          unsubscribe();
          resolve();
        }
      }
    );
  });
}
```

**Issue**: Route loaders MUST wait for Zustand hydration before querying. This indicates store hydration is not automatic or reliable.

---

## Part 3: State Management Lifecycle

### 3.1 Note Store Implementations (DUPLICATE)

#### Implementation A: `src/lib/notes/note-store-refactored.ts`

**Lines**: 208
**Pattern**: Zustand with 7 slices
**Slices**:
1. `createNoteUISlice` - UI state (active note, loading)
2. `createNoteQuerySlice` - Read-only queries
3. `createNoteEventsSlice` - Event emission
4. `createNoteIndexingSlice` - RAG indexing
5. `createNoteSyncSlice` - Auto-save, file handlers
6. `createNoteMetadataSlice` - Favorite, move
7. `createNoteCRUDSlice` - Core CRUD operations

**Persistence**: Dexie via `createDexieStorage`

#### Implementation B: `src/lib/notes/note-store.ts`

**Lines**: 40
**Pattern**: Facade (re-exports from refactored)
**Status**: `@deprecated` - kept for backward compatibility

#### Implementation C: `src/infrastructure/persistence/stores/notes/`

**Current State**: Only exports 2 files:
- `note-context-tracker.ts`
- `slash-commands/`

**Issue**: Infrastructure notes store is incomplete. Canonical path should have full store.

### 3.2 Store Slices (lib/notes/slices/)

| File | Lines | Purpose | Imports |
|------|-------|---------|---------|
| `note-crud-slice.ts` | ~442 | CRUD operations | useProjectStore (P0 violation) |
| `note-metadata-slice.ts` | ~137 | Favorite, move | useProjectStore (P0 violation) |
| `note-query-slice.ts` | ~38 | Search, filter | None |
| `note-sync-slice.ts` | ~107 | Auto-save | None |
| `note-indexing-slice.ts` | ~127 | RAG indexing | useProjectStore (P0 violation) |
| `note-events-slice.ts` | ~81 | Event emission | None |
| `note-ui-slice.ts` | ~26 | UI state | None |

### 3.3 State Initialization Flow

```
1. ProjectProvider mounts (notes.$projectId.tsx:96)
   ↓
2. Route loader fetches project from Dexie
   ↓
3. waitForHydration() ensures store ready
   ↓
4. NotesPage mounts
   ↓
5. useEffect: loadNotes(projectId)
   ↓
6. Note CRUD slice queries Dexie 'notes' table
   ↓
7. State updates, triggers re-render
```

### 3.4 Cross-Store Dependencies

**Note Store → Project Store** (VIOLATION):
```typescript
// note-crud-slice.ts:27
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';

// note-crud-slice.ts:251
const project = currentProjectId 
  ? useProjectStore.getState().projects[currentProjectId] 
  : null;
```

**Issue**: Note CRUD operations require project context but import directly from project store.

---

## Part 4: Cross-Domain Dependencies

### 4.1 Domain Services Used by Notes

| Service | Location | Purpose | Issues |
|---------|----------|---------|--------|
| `NoteGateway` | `src/domain/services/note-gateway.ts` | StorageGateway facade | Line 23: Imports NoteRecord from infrastructure |
| `ProjectRegistry` | `src/domain/services/ProjectRegistry.ts` | Project lookup | Clean - pure domain |
| `StorageGateway` | `src/domain/interfaces/storage-gateway.interface.ts` | Storage abstraction | Interface only |

### 4.2 Infrastructure Imports in Domain

| File | Line | Import | Violation Type |
|------|------|--------|----------------|
| `note-gateway.ts` | 23 | `import type { NoteRecord } from '@/infrastructure/persistence/dexie-db'` | Domain imports infrastructure type |

### 4.3 Presentation Layer Imports

**lib/notes → infrastructure** (SHOULD BE AVOIDED):
```typescript
// note-crud-slice.ts
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
```

**presentation → lib/notes** (DEPRECATED):
```typescript
// NotesPage.tsx:12
import { useNoteStore, useActiveNote } from '@/lib/notes/note-store';

// NoteEditor.tsx:68-69
import { useNoteStore, useNoteSaveStatus, useIsNoteIndexing } from '@/lib/notes';
```

### 4.4 Infrastructure Layer Imports (lib → infrastructure)

| File | Lines | Issue |
|------|-------|-------|
| `use-file-ops-slice.ts` | 22, 33 | Imports from `@/lib/filesystem/*` |
| `use-file-loader-slice.ts` | 20 | Imports from `@/lib/filesystem/*` |
| `use-storage-adapter-slice.ts` | 29 | Imports from `@/lib/filesystem/*` |

---

## Part 5: Complete File Inventory

### 5.1 Routes (2 files)

| # | File Path | Purpose | Lines | Issues |
|---|-----------|---------|-------|--------|
| 1 | `src/routes/notes.lazy.tsx` | Redirect route | 173 | BUG-FIX comments, deprecated imports |
| 2 | `src/routes/notes.$projectId.tsx` | Workspace route | 101 | Uses deprecated ProjectContext |

### 5.2 Guards & Loaders (1 file)

| # | File Path | Purpose | Lines |
|---|-----------|---------|-------|
| 1 | `src/infrastructure/persistence/stores/project/wait-for-hydration.ts` | Hydration guard | 44 |

### 5.3 State Stores - Infrastructure (15+ files)

| # | File Path | Purpose | Lines |
|---|-----------|---------|-------|
| 1 | `src/infrastructure/persistence/stores/notes/index.ts` | Barrel export | 10 |
| 2 | `src/infrastructure/persistence/stores/notes/note-context-tracker.ts` | Context tracking | ~100 |
| 3 | `src/infrastructure/persistence/stores/notes/slash-commands/*` | Slash commands | ~200 |
| 4 | `src/infrastructure/persistence/stores/project/useProjectStore.ts` | Project store | ~400 |
| 5 | `src/infrastructure/persistence/stores/project/index.ts` | Project barrel | ~290 (deprecated facades) |
| 6 | `src/infrastructure/persistence/stores/project/wait-for-hydration.ts` | Hydration | 44 |
| 7 | `src/infrastructure/persistence/stores/workspace/*` | Workspace state | ~1000+ |

### 5.4 State Stores - Lib/Notes (Duplicate) (20+ files)

| # | File Path | Purpose | Lines | Status |
|---|-----------|---------|-------|--------|
| 1 | `src/lib/notes/note-store.ts` | Facade | 40 | Deprecated |
| 2 | `src/lib/notes/note-store-refactored.ts` | Main store | 208 | Active (wrong location) |
| 3 | `src/lib/notes/slices/note-crud-slice.ts` | CRUD | ~442 | Has P0 violation |
| 4 | `src/lib/notes/slices/note-metadata-slice.ts` | Metadata | ~137 | Has P0 violation |
| 5 | `src/lib/notes/slices/note-query-slice.ts` | Queries | ~38 | Clean |
| 6 | `src/lib/notes/slices/note-sync-slice.ts` | Sync | ~107 | Clean |
| 7 | `src/lib/notes/slices/note-indexing-slice.ts` | Indexing | ~127 | Has P0 violation |
| 8 | `src/lib/notes/slices/note-events-slice.ts` | Events | ~81 | Clean |
| 9 | `src/lib/notes/slices/note-ui-slice.ts` | UI | ~26 | Clean |
| 10+ | `src/lib/notes/types*.ts` | Type definitions | ~500 | Should migrate |

### 5.5 State Stores - Other (5 files)

| # | File Path | Purpose | Lines |
|---|-----------|---------|-------|
| 1 | `src/infrastructure/persistence/stores/conversation/useConversationStore.ts` | Chat | ~600 |
| 2 | `src/infrastructure/persistence/stores/ide/index.ts` | IDE state | ~300 |
| 3 | `src/infrastructure/persistence/stores/editor-tabs-store.ts` | Tabs | ~200 |

### 5.6 Domain Services (5 files)

| # | File Path | Purpose | Issues |
|---|-----------|---------|--------|
| 1 | `src/domain/services/note-gateway.ts` | Note operations | Cross-layer import |
| 2 | `src/domain/services/file-crud/unified-file-crud.ts` | File CRUD | Cross-layer imports |
| 3 | `src/domain/interfaces/storage-gateway.interface.ts` | Gateway interface | Clean |
| 4 | `src/domain/services/ProjectRegistry.ts` | Project registry | Clean |
| 5 | `src/domain/services/workspace-transition-service.ts` | Workspace switching | Imports infrastructure |

### 5.7 Infrastructure/Sync (30+ files)

| # | File Path | Purpose | Lines |
|---|-----------|---------|-------|
| 1 | `src/infrastructure/sync/workspace-services/notes/notes-file-sync-service.ts` | Notes sync | ~300 |
| 2 | `src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts` | File bridge | ~250 |
| 3 | `src/infrastructure/sync/workspace-services/notes/note-crud-operations.ts` | CRUD ops | ~150 |
| 4 | `src/infrastructure/sync/adapters/*` | Storage adapters | ~2000+ |

### 5.8 Presentation Components (15+ files)

| # | File Path | Purpose | Lines | Issues |
|---|-----------|---------|-------|--------|
| 1 | `src/presentation/components/notes/NotesPage.tsx` | Main page | 975 | GOD COMPONENT |
| 2 | `src/presentation/components/notes/NoteSidebar.tsx` | Sidebar | 338+ | Over limit |
| 3 | `src/presentation/components/notes/NoteEditor.tsx` | Editor | 609 | GOD COMPONENT |
| 4 | `src/presentation/components/notes/NoteTree.tsx` | Tree view | ~250 | Clean |
| 5 | `src/presentation/components/notes/NotesRAGSearch.tsx` | RAG search | ~200 | Clean |
| 6 | `src/presentation/components/notes/ProjectFilesPanel.tsx` | File panel | ~300 | Clean |

### 5.9 Context Providers (2 files)

| # | File Path | Purpose | Issues |
|---|-----------|---------|--------|
| 1 | `src/lib/workspace/ProjectContext.tsx` | Project context | 507 lines, stores FSA handle |
| 2 | `src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts` | Unified context | 10+ slices |

### 5.10 Hooks & Utilities (10+ files)

| # | File Path | Purpose | Issues |
|---|-----------|---------|--------|
| 1 | `src/lib/filesync/hooks/use-file-sync-service.ts` | Sync hook | Deprecated imports |
| 2 | `src/lib/workspace/hooks/useWorkspaceActions.ts` | Workspace actions | Infrastructure imports |

---

## Part 6: Issues Identified

### 6.1 P0 - Critical Issues

| # | File | Line | Issue | Evidence |
|---|------|------|-------|----------|
| 1 | `note-crud-slice.ts` | 27 | Infrastructure import in lib | `useProjectStore` from infrastructure |
| 2 | `note-metadata-slice.ts` | 17 | Infrastructure import in lib | `useProjectStore` from infrastructure |
| 3 | `note-indexing-slice.ts` | 19 | Infrastructure import in lib | `useProjectStore` from infrastructure |
| 4 | `note-gateway.ts` | 23 | Domain imports infrastructure | `NoteRecord` from dexie-db |
| 5 | `unified-file-crud.ts` | 32-34 | Domain imports lib | `lib/filesystem/*` imports |
| 6 | `NotesPage.tsx` | 975 | God component | 8+ useEffect chains, PERF-07 memo band-aid |
| 7 | `NoteEditor.tsx` | 609 | God component | Mixed mobile/desktop rendering |
| 8 | `fsa-storage-adapter.ts` | 673 | Duplicate adapter | Similar to fsa-gateway.ts |
| 9 | `fsa-gateway.ts` | ~711 | Duplicate gateway | Similar to fsa-storage-adapter |

### 6.2 P1 - High Priority Issues

| # | File | Line | Issue | Evidence |
|---|------|------|-------|----------|
| 10 | `use-file-ops-slice.ts` | 22, 33 | Infrastructure importing lib | `@/lib/filesystem/*` |
| 11 | `use-file-loader-slice.ts` | 20 | Infrastructure importing lib | `@/lib/filesystem/*` |
| 12 | `use-storage-adapter-slice.ts` | 29 | Infrastructure importing lib | `@/lib/filesystem/*` |
| 13 | `ProjectContext.tsx` | 507 | Large context | Stores FSA handle (should be elsewhere) |
| 14 | `project-crud-slice.ts` | 316 | Large slice | Mixed async/sync patterns |
| 15 | `note-store-refactored.ts` | 208 | Wrong location | Lives in lib/notes/ not infrastructure/ |
| 16 | `store-facades.ts` | - | Facade pending deletion | "TODO: After Team A completes import updates" |
| 17 | `notes.lazy.tsx` | ~80 | Historical comments | BUG-FIX comments throughout |
| 18 | `NotesPage.tsx` | 48 | Deprecated import | `useProjectContext` from lib/workspace |

### 6.3 P2 - Medium Priority Issues

| # | File | Line | Issue | Evidence |
|---|------|------|-------|----------|
| 19 | `NoteSidebar.tsx` | 338+ | Over limit | Multiple inline handlers |
| 20 | `ProjectsPage.tsx` | 381 | Over limit | Slightly over limit |
| 21 | `ProjectCreationWizard.tsx` | 546 | Over limit | Wizard state not extracted |
| 22 | `NotesPage.tsx` | 212 | Unimplemented TODO | `// TODO: Implement create note` |
| 23 | `useConversationStore.ts` | ~600 | God store | ~200+ lines |
| 24 | `useIDEStore.ts` | ~300 | God store | ~300+ lines |
| 25 | `unified-workspace-context.ts` | - | Large interface | 10+ slices in single context |

### 6.4 P3 - Low Priority Issues

| # | File | Issue | Evidence |
|---|------|-------|----------|
| 26 | Various files | TODO comments | 80+ TODO markers |
| 27 | Various files | BUG-FIX markers | 50+ BUG-FIX comments |
| 28 | `note-folder-bridge.ts` | Complex fallback logic | Lines 54-145 BUG-013 FIX |
| 29 | `notes.lazy.tsx` | Route guard scattering | Navigation logic in component |

---

## Part 7: Recommendations

### 7.1 Immediate (P0 - Before Phase 2)

1. **Consolidate Note Stores**
   - Move `lib/notes/note-store-refactored.ts` → `infrastructure/persistence/stores/notes/`
   - Delete `lib/notes/note-store.ts` facade
   - Update all 82 consumers

2. **Fix Infrastructure → Lib Imports**
   - Update 3 workspace slices to import from canonical paths
   - Remove `@/lib/filesystem/*` imports from infrastructure

3. **Fix Domain → Infrastructure Imports**
   - Move `NoteRecord` type to domain layer
   - Or create domain interface for notes

4. **Split NotesPage**
   - Extract file sync logic to custom hook
   - Extract mobile layout to separate component
   - Target: 3 components × ~300 lines each

### 7.2 Short-term (P1 - Sprint 1)

5. **Clean Route Comments**
   - Consolidate BUG-FIX comments to CHANGELOG.md
   - Remove historical fix comments from production code

6. **Extract Wizard Hook**
   - Create `useProjectCreationWizard` hook
   - Reduce ProjectCreationWizard by ~200 lines

7. **Consolidate FSA Adapters**
   - Merge `fsa-storage-adapter.ts` and `fsa-gateway.ts`
   - Keep single implementation with clear interface

8. **Move Note Store Slices**
   - Move `lib/notes/slices/` → `infrastructure/persistence/stores/notes/slices/`
   - Fix all imports in the process

### 7.3 Medium-term (P2 - Sprint 2)

9. **Create NavigationService**
   - Centralize navigation logic from HubHomePage and routes
   - Replace scattered navigate() calls

10. **Standardize CRUD Patterns**
    - Make all project CRUD operations async
    - Remove sync/async inconsistencies

11. **Extract Route Middleware**
    - Create shared `waitForHydration` middleware
    - Apply to all routes that need it

12. **Refactor Fallback Logic**
    - Use strategy pattern for FSA vs IDB fallback
    - Remove BUG-013 FIX complexity

### 7.4 Long-term (P3 - Post-Stabilization)

13. **Clean TODO/BUG-FIX Markers**
    - Systematic cleanup of 80+ TODO comments
    - Move to tracked issues

14. **God Store Decomposition**
    - Split `useConversationStore` (~600 lines)
    - Split `useIDEStore` (~300 lines)

15. **Route Preloading**
    - Implement TanStack Router preloading
    - Faster navigation to notes

---

## Part 8: Architecture Assessment

### 8.1 Strengths

1. **Slice Pattern**: Notes store follows good slice pattern with focused responsibilities
2. **Dexie Persistence**: Notes persisted correctly to IndexedDB
3. **File Sync Service**: Well-designed abstraction for FSA/IDB
4. **Hydration Guard**: `waitForHydration()` prevents race conditions

### 8.2 Weaknesses

1. **Migration Incomplete**: lib/notes/ still active, infrastructure/ incomplete
2. **Cross-Layer Violations**: 12+ instances of domain importing infrastructure
3. **Duplicate Implementations**: Note store exists in two locations
4. **God Components**: NotesPage and NoteEditor exceed limits significantly

### 8.3 Technical Debt

1. **82 files** importing from deprecated `@/lib/notes/*`
2. **54 files** importing through deprecated `@/lib/filesystem/*`
3. **~130 BUG-FIX comments** scattered across codebase
4. **~80 TODO comments** pending implementation

---

## Investigation Evidence

### Files Analyzed

| Category | Count |
|----------|-------|
| Route Files | 2 |
| State Stores (lib) | 20+ |
| State Stores (infrastructure) | 15+ |
| Domain Services | 5 |
| Infrastructure/Sync | 30+ |
| Presentation Components | 15+ |
| Context Providers | 2 |
| Hooks & Utilities | 10+ |
| **Total** | **105+** |

### Methods Used

- **grep**: Pattern matching for imports, exports, function definitions
- **glob**: File discovery by pattern
- **read**: Deep investigation of specific code sections
- **Symbol analysis**: TypeScript type hierarchy analysis

---

*Report created as part of Notes space investigation*
*Investigation ID: NOTES-ROUTE-STATE-LIFECYCLE*
*Date: 2026-01-20*
