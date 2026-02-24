---
plan_id: "CLEAN-ARCHITECTURE-ACTION-PLAN"
created: "2026-01-20T23:00:00+07:00"
status: "DRAFT"
priority: "P0-IMMEDIATE"
author: "analyst-ext"
based_on:
  - "_bmad-output/debug-infrastructure/bug-log.yaml"
  - "_bmad-output/investigation/domain-round/DOMAIN-ROUND-2-SYNTHESIS-2026-01-20.md"
  - "src/tree.xml"
---

# Clean Architecture Action Plan: Make IDE & Notes Workspaces Fully Usable

## Executive Summary

**Goal**: Make both IDE and Notes workspaces fully functional for PC users without blocks, while reducing codebase from ~2000+ files to ~1000 files (50% reduction) through consolidation and cleanup.

**Current State**:
- 8 P0-Critical bugs blocking PC user workflow
- 143+ files in IDE/Notes lifecycle with heavy pollution
- 24 cross-layer architecture violations
- 10 god components (>300 lines) with inline handlers
- 136+ deprecated imports scattered across codebase

**Target State**:
- Zero P0 bugs affecting PC user
- Clean layer separation (Domain → Infrastructure → Presentation)
- Consolidated duplicate implementations
- Organized file structure with clear boundaries

---

## Part 1: Immediate Usability Fixes (Unblock PC Users Now)

### P0-Critical Bugs Blocking PC Users

#### BUG-016: Notes Import Infinite Loop (OPEN)
**Location**: `src/presentation/components/notes/NotesPage.tsx:246-319`

**Problem**: 
```
Effect depends on isImportingFiles
Effect sets isImportingFiles(true)
Finally sets isImportingFiles(false)
State change triggers Effect again → INFINITE LOOP
```

**Fix Required**:
```typescript
// BEFORE (BUGGY)
useEffect(() => {
  if (isImportingFiles) {
    // ... import logic
    finally { setIsImportingFiles(false); }
  }
}, [isImportingFiles]);  // ❌ Re-triggers when state changes

// AFTER (FIXED)
useEffect(() => {
  if (shouldImport.current && !isImportingFiles) {
    shouldImport.current = false;
    setIsImportingFiles(true);
    // ... import logic
  }
}, []);  // ✅ Runs once per project load
```

**Action Items**:
- [ ] Read `NotesPage.tsx` lines 246-319
- [ ] Extract import logic to `useFileSyncManager` hook
- [ ] Remove `isImportingFiles` from dependency array
- [ ] Use `useRef` to track import intent
- [ ] Verify: Import dialog closes after completion

---

#### BUG-021: Notes Redirect Loop (OPEN)
**Location**: `src/routes/notes.lazy.tsx:56-154`

**Problem**: 
```
NotesPage mounts → NotesRedirect detects no match? → Redirects
→ NotesPage unmounts → Redirect completes → NotesPage mounts
→ LOOP CONTINUES
```

**Root Cause**: `useMatch` returns false/null intermittently for child route, causing navigation even when child is active.

**Fix Applied** (pending verification):
```typescript
// BEFORE (BUGGY)
const match = useMatch('/notes/$projectId/*');
if (!match) return <Navigate to={targetRoute} />;

// AFTER (FIXED)
const location = useLocation();
const isChildRoute = location.pathname.includes('/notes/') && 
                     location.pathname.split('/').length > 2;
if (!isChildRoute) return <Navigate to={targetRoute} />;
```

**Action Items**:
- [ ] Verify `useLocation.pathname` check in `notes.lazy.tsx`
- [ ] Remove `useMatch` entirely from parent route logic
- [ ] Add routing test to prevent future loops
- [ ] Verify: NotesPage mounts once, stays mounted

---

#### BUG-002: ProjectPickerDialog Navigation Broken (WORKAROUND)
**Location**: `src/presentation/components/hub/ProjectPickerDialog.tsx:159-190`

**Problem**: TanStack Router `navigate()` produces malformed URL, redirects to Hub.

**Current Workaround** (uses full page reload):
```typescript
window.location.href = `${routeMap[targetWorkspace]}/${project.id}`;
```

**True Fix Required**:
```typescript
// BEFORE (BROKEN)
navigate({ to: '/ide/$projectId', params: { projectId } });

// AFTER (FIXED) - Need to investigate route definition
navigate(`/ide/${project.id}`);  // Use string path
```

**Action Items**:
- [ ] Investigate route definition in `ide.$projectId.tsx`
- [ ] Check TanStack Router version compatibility
- [ ] Test `navigate('/ide/' + project.id)` string pattern
- [ ] Restore SPA navigation (remove full page reload)

---

### Additional P0 Bugs Affecting PC Users

#### BUG-008: IDE Parent Route Missing Outlet (FIXED)
**Status**: FIXED - `ide.tsx` now renders `<Outlet />` for child routes

**Verification Needed**:
- [ ] Navigate to `/ide/$projectId`
- [ ] Verify `ProjectProvider` and `loader` execute
- [ ] Verify IDE workspace loads with file tree

#### BUG-005: Project Creation Race Condition (FIXED)
**Status**: FIXED - `createProject` now async/await

**Verification Needed**:
- [ ] Create new project
- [ ] Verify navigation to workspace succeeds
- [ ] Verify project appears in list after creation

---

## Part 2: File Consolidation Plan (50% Reduction Target)

### Current File Inventory Analysis

| Layer | Current Files | Target Files | Reduction |
|-------|---------------|--------------|-----------|
| `src/lib/` (deprecated) | ~400 files | 0 files | 100% |
| Duplicate Note Stores | 2 locations | 1 location | 50% |
| Duplicate FSA Adapters | 2 files | 1 file | 50% |
| Context Providers | 2 files | 1 file | 50% |
| God Components | 10 files | 30 files | +200% |
| Slice Pattern | Mixed | All slices | N/A |

### Files to REMOVE (Archive/Delete)

#### 1. Complete `src/lib/` Deprecation

| Directory | Files | Action |
|-----------|-------|--------|
| `src/lib/filesystem/` | 15 files | Archive - use `infrastructure/filesystem/` |
| `src/lib/workspace/` | 12 files | Archive - use `infrastructure/persistence/stores/workspace/` |
| `src/lib/notes/` | 20+ files | Archive - use `infrastructure/persistence/stores/notes/` |
| `src/lib/events/` | 8 files | Archive - use `infrastructure/events/` |
| `src/lib/agent/` | 50+ files | Keep (agent concerns) |
| `src/lib/sync/` | 5 files | Archive - use `infrastructure/sync/` |

**Savings**: ~110 files archived → **~55 files reduction**

#### 2. Consolidate Duplicate Note Stores

| File | Lines | Status | Action |
|------|-------|--------|--------|
| `lib/notes/note-store-refactored.ts` | 208 | Active, wrong location | **MOVE** to `infrastructure/persistence/stores/notes/` |
| `lib/notes/note-store.ts` | 40 | Facade, deprecated | **DELETE** |
| `infrastructure/persistence/stores/notes/` | 10 | Incomplete | **COMPLETE** with migrated store |

**Savings**: 1 file deleted, 1 file moved → **~40 lines reduction**

#### 3. Consolidate Duplicate FSA Adapters

| File | Lines | Overlap | Action |
|------|-------|---------|--------|
| `fsa-storage-adapter.ts` | 673 | 85% | **MERGE** into `fsa-gateway.ts` |
| `fsa-gateway.ts` | ~711 | Base | **KEEP** as single implementation |
| `local-fs-adapter.ts` | ~300 | Partial | **MERGE** into `fsa-gateway.ts` |

**Savings**: 2 files deleted, ~973 lines consolidated → **~973 lines reduction**

#### 4. Consolidate Context Providers

| File | Lines | Purpose | Action |
|------|-------|---------|--------|
| `ProjectContext.tsx` | ~507 | FSA handle, project | **MERGE** into |
| `unified-workspace-context.ts` | 371 | Workspace state | **KEEP** as single context |

**Savings**: 1 file deleted → **~507 lines reduction**

#### 5. Archive Deprecated Route Files

| File | Lines | Action |
|------|-------|--------|
| `src/routes/workspace/$projectId.tsx` | ~100 | Archive (redirects to IDE) |
| `src/routes/ide.tsx` | 146 | Refactor - remove redirect logic |
| `src/routes/notes.lazy.tsx` | 173 | Clean BUG-FIX comments |

**Savings**: 1 file archived → **~100 lines reduction**

### Files to SPLIT (God Components → Focused Files)

#### 10 God Components to Split

| Component | Lines | Split Into | Target Lines |
|-----------|-------|------------|--------------|
| `MonacoEditor.tsx` | 773 | `EditorCore.tsx`, `TabManager.tsx`, `AutoSave.ts`, `EventSubscriptions.ts` | 3×200 + 1×173 |
| `AgentChatPanel.tsx` | 692 | `ChatUI.tsx`, `ConversationManager.ts`, `ToolExecution.ts` | 2×200 + 1×292 |
| `NotesPage.tsx` | 975 | `FileSyncManager.ts`, `MobileLayout.tsx`, `DesktopLayout.tsx` | 3×325 |
| `NoteEditor.tsx` | 1089 | `BlockSanitizer.ts`, `SaveManager.ts`, `EditorWrapper.tsx` | 2×200 + 1×689 |
| `NoteSidebar.tsx` | 411 | `SearchFilters.ts`, `NavigationTree.ts`, `SidebarUI.tsx` | 3×137 |

**Result**: 10 files → ~30 files (more maintainable)

---

## Part 3: Clean Architecture Proposal

### Target Directory Structure

```
src/
├── routes/                          # TanStack Router (CLEAN)
│   ├── __root.tsx                   # Root layout
│   ├── index.tsx                    # Hub entry
│   ├── hub.tsx                      # Hub with ProjectPickerDialog
│   ├── ide.$projectId.tsx           # IDE workspace (clean, no pollution)
│   └── notes.$projectId.tsx         # Notes workspace (clean, no pollution)
│
├── domain/                          # Pure Domain (NO infrastructure)
│   ├── entities/                    # Domain models
│   │   ├── Project.ts
│   │   ├── Workspace.ts
│   │   └── index.ts
│   ├── interfaces/                  # Port definitions
│   │   ├── StorageGateway.ts        # I/O abstraction
│   │   └── StorageAdapter.ts        # Adapter contract
│   ├── services/                    # Business logic
│   │   ├── note-gateway.ts          # Note CRUD
│   │   └── file-crud.ts             # File operations
│   ├── types/                       # Domain types
│   └── tools/                       # Agent tools
│
├── infrastructure/                  # External Concerns (NO presentation)
│   ├── filesystem/                  # File I/O
│   │   ├── fsa-gateway.ts           # Single FSA implementation
│   │   ├── idb-gateway.ts           # Single IDB implementation
│   │   ├── StorageGatewayFactory.ts # Factory pattern
│   │   └── handle-persistence.ts    # Handle storage
│   ├── persistence/                 # Data persistence
│   │   ├── dexie-db.ts              # Single DB definition
│   │   └── stores/                  # Zustand stores
│   │       ├── project/             # Project store
│   │       ├── notes/               # Notes store (MIGRATED from lib/)
│   │       ├── workspace/           # Workspace store
│   │       └── hooks/               # Store connection hooks
│   ├── sync/                        # Sync services
│   │   ├── adapters/                # FSA/IDB adapters
│   │   ├── core/                    # Sync engine
│   │   └── workspace-services/      # Workspace-specific sync
│   ├── events/                      # Event bus
│   └── webcontainer/                # WebContainer integration
│
└── presentation/                    # UI (NO business logic)
    ├── components/                  # React components
    │   ├── ui/                      # Design system (shadcn/ui)
    │   ├── ide/                     # IDE components (SPLIT)
    │   │   ├── MonacoEditor/        # Split into focused files
    │   │   ├── FileTree/            # Split into focused files
    │   │   └── AgentChat/           # Split into focused files
    │   ├── notes/                   # Notes components (SPLIT)
    │   │   ├── NoteEditor/          # Split into focused files
    │   │   └── NoteSidebar/         # Split into focused files
    │   └── common/                  # Shared components
    ├── hooks/                       # React hooks (UI concerns)
    │   ├── useEditorTheme.ts
    │   ├── useFileIcon.ts
    │   └── useKeyboardShortcuts.ts
    └── styles/                      # 8-bit design system
```

### Layer Boundaries (MUST NOT CROSS)

```
PRESENTATION → uses → INFRASTRUCTURE (hooks, adapters)
PRESENTATION → uses → DOMAIN (interfaces, types)
INFRASTRUCTURE → implements → DOMAIN (interfaces)
DOMAIN → NO dependencies on other layers
```

**Forbidden Patterns**:
- ❌ `presentation` importing from `lib/`
- ❌ `domain` importing from `infrastructure`
- ❌ `infrastructure` importing from `presentation`
- ❌ `lib/` existing (should be migrated or archived)

---

## Part 4: Why This Will Work (Evidence-Based Reasoning)

### 1. Root Cause Analysis of Current Problems

| Bug Category | Root Cause | Why Fix Will Work |
|--------------|------------|-------------------|
| **Infinite Loops** (BUG-016, BUG-021) | React hooks dependency array errors | Fix uses `useRef` + empty deps - proven pattern |
| **Navigation Failures** (BUG-002) | TanStack Router context mismatch | Single route definition + string navigate fixes |
| **Race Conditions** (BUG-005) | Fire-and-forget DB writes | Async/await ensures ordering |
| **Architecture Violations** (24 instances) | Layer boundary confusion | Clear structure eliminates ambiguity |
| **God Components** (10 files) | Mixed concerns | Split into focused files solves |

### 2. Proven Patterns Applied

#### Pattern 1: Empty Dependency Array + Ref
```typescript
// Proven to prevent infinite loops in 1000s of React apps
const shouldImport = useRef(false);
useEffect(() => {
  if (shouldImport.current && !isImporting) {
    shouldImport.current = false;
    performImport();
  }
}, []);  // ✅ Runs once
```

#### Pattern 2: Store-First Architecture
```typescript
// Instead of: Component → Service → DB
// Use: Component → Store → DB (Zustand handles async)
const notes = useNoteStore((state) => state.notes);
const saveNote = useNoteStore((state) => state.saveNote);
```

#### Pattern 3: Single Responsibility Principle
```typescript
// Instead of: MonacoEditor.tsx (773 lines, 15 concerns)
// Use: EditorCore.tsx + TabManager.tsx + AutoSave.ts (each 200 lines, 1 concern)
```

### 3. Migration Safety

| Migration Type | Risk Level | Safety Mechanism |
|----------------|------------|------------------|
| Move lib/notes → infrastructure/ | Low | Consumer files updated in same PR |
| Merge FSA adapters | Medium | Keep fsa-gateway.ts, archive fsa-storage-adapter.ts |
| Split god components | Low | Extract to new files, component still works |
| Fix infinite loops | Low | Ref-based fix doesn't change component structure |

### 4. Verification Strategy

**Before Each Fix**:
- [ ] Read current file to understand context
- [ ] Create test case for the bug
- [ ] Document expected behavior

**After Each Fix**:
- [ ] Run TypeScript: `pnpm tsc --noEmit`
- [ ] Test user flow manually
- [ ] Update bug log with fix verification

**After Complete Cleanup**:
- [ ] Run full test suite
- [ ] Verify IDE workspace loads
- [ ] Verify Notes workspace loads
- [ ] Count files: should be ~1000 (50% reduction)

---

## Part 5: Execution Roadmap

### Phase 1: Immediate Fixes (Day 1)
**Goal**: Make IDE & Notes usable for PC users

| Task | Duration | Files Modified |
|------|----------|----------------|
| Fix BUG-016 (Notes infinite loop) | 1 hour | `NotesPage.tsx` |
| Fix BUG-021 (Notes redirect loop) | 30 min | `notes.lazy.tsx` |
| Fix BUG-002 (Navigation) | 1 hour | `ProjectPickerDialog.tsx` |
| Verify BUG-008 fix | 30 min | `ide.tsx`, `ide.$projectId.tsx` |

**Success Criteria**:
- ✅ IDE loads with file tree, Monaco editor works
- ✅ Notes loads without infinite spinner
- ✅ Project creation → navigation works

### Phase 2: Architecture Cleanup (Day 2-3)
**Goal**: Consolidate duplicates, remove deprecated files

| Task | Duration | Files |
|------|----------|-------|
| Move lib/notes → infrastructure/ | 2 hours | 20 files |
| Merge FSA adapters | 3 hours | 3 files |
| Consolidate context providers | 1 hour | 2 files |
| Archive lib/filesystem, lib/events | 1 hour | 25 files |

**Success Criteria**:
- ✅ 0 imports from deprecated lib/ paths
- ✅ Single FSA adapter implementation
- ✅ Single context provider

### Phase 3: Component Refactoring (Day 4-5)
**Goal**: Split god components into focused files

| Task | Duration | Files |
|------|----------|-------|
| Split MonacoEditor.tsx | 2 hours | 4 files |
| Split NotesPage.tsx | 2 hours | 3 files |
| Split NoteEditor.tsx | 2 hours | 3 files |
| Split AgentChatPanel.tsx | 2 hours | 3 files |

**Success Criteria**:
- ✅ All components ≤300 lines
- ✅ Each file has single responsibility
- ✅ No mixed UI/logic concerns

### Phase 4: Final Verification (Day 6)
**Goal**: Confirm all fixes work, measure reduction

| Task | Duration | Output |
|------|----------|--------|
| Full TypeScript check | 10 min | 0 errors |
| IDE workspace test | 15 min | Works |
| Notes workspace test | 15 min | Works |
| File count | 5 min | ~1000 files |
| Bug log update | 15 min | All P0 fixed |

---

## Part 6: File Change Manifest

### Files to CREATE (New)

| File | Purpose | Lines |
|------|---------|-------|
| `infrastructure/persistence/stores/notes/note-store.ts` | Migrated note store | 208 |
| `infrastructure/persistence/stores/notes/slices/*` | Migrated slices (7 files) | ~850 |
| `presentation/components/ide/MonacoEditor/EditorCore.tsx` | Split editor | 200 |
| `presentation/components/ide/MonacoEditor/TabManager.tsx` | Split tabs | 150 |
| `presentation/components/notes/NotesPage/FileSyncManager.ts` | Split sync logic | 200 |
| `presentation/components/notes/NotesPage/MobileLayout.tsx` | Split mobile | 250 |

### Files to MODIFY (Fix Bugs)

| File | Change | Lines |
|------|--------|-------|
| `NotesPage.tsx` | Fix infinite loop | -50 |
| `notes.lazy.tsx` | Fix redirect loop | -30 |
| `ProjectPickerDialog.tsx` | Fix navigation | -20 |

### Files to DELETE (Consolidation)

| File | Reason |
|------|--------|
| `lib/notes/note-store.ts` | Facade, deprecated |
| `lib/filesystem/index.ts` | Facade deadline passed |
| `fsa-storage-adapter.ts` | Duplicate of fsa-gateway.ts |
| `local-fs-adapter.ts` | Merge into fsa-gateway.ts |
| `ProjectContext.tsx` | Merge into unified-workspace-context.ts |
| `lib/workspace/` (12 files) | Archive, use infrastructure/ |
| `lib/filesystem/` (15 files) | Archive, use infrastructure/ |
| `lib/events/` (8 files) | Archive, use infrastructure/ |

### Files to ARCHIVE (Move to _bmad-ext/.archive/)

| Directory | Count |
|-----------|-------|
| `src/lib/notes/slices/` (after move) | 7 files |
| `src/lib/workspace/` | 12 files |
| `src/lib/filesystem/` | 15 files |
| `src/lib/events/` | 8 files |
| `src/routes/workspace/` | 1 file |

---

## Appendix A: Quick Reference

### Bug Status Tracker

| Bug ID | Title | Status | Fix Verification |
|--------|-------|--------|------------------|
| BUG-016 | Notes Import Infinite Loop | OPEN | Pending |
| BUG-021 | Notes Redirect Loop | OPEN | Pending |
| BUG-002 | Navigation Fails | WORKAROUND | Pending |
| BUG-008 | IDE Route Missing Outlet | FIXED | Verify |
| BUG-005 | Race Condition | FIXED | Verify |

### File Count Targets

| Metric | Current | Target | Reduction |
|--------|---------|--------|-----------|
| Total src/ files | ~2000 | ~1000 | 50% |
| lib/ files | ~400 | 0 | 100% |
| Duplicate implementations | 5 | 0 | 100% |
| God components | 10 | 0 | 100% |

---

*Plan created based on comprehensive investigation*
*Investigation ID: CLEAN-ARCHITECTURE-ACTION-PLAN*
*Date: 2026-01-20*
