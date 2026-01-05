# MASTER ARCHITECTURE ANALYSIS
## Project Alpha - Deep Scan Report
**Date**: 2026-01-06T06:00:00+07:00  
**Agent**: Team A - Antigravity (BMAD Master)  
**Workflow**: `@bmad/modules/quality/workflows/full-scan`  
**Status**: CRITICAL FINDINGS - ARCHITECTURE REDESIGN REQUIRED

---

# EXECUTIVE SUMMARY

**The system is fundamentally broken at the architectural level.** Multiple agents have applied patches that treat symptoms rather than root causes. The core issue is a **disintegrated data flow** where:

1. **Routing** doesn't guarantee project context
2. **State management** doesn't sync with routing
3. **Persistence** doesn't align with state structure
4. **Reactivity** doesn't propagate across workspaces
5. **File sync** exists as a separate parallel system

This document is the **SINGLE SOURCE OF TRUTH** for the architectural redesign.

---

# SECTION 1: CURRENT ARCHITECTURE INVENTORY

## 1.1 Entry Points Analysis

### Routes (22 files analyzed)

| Route | Has projectId param? | ProjectProvider | Issue |
|-------|---------------------|-----------------|-------|
| `/` (index.tsx) | ❌ | N/A | Redirects to hub |
| `/hub` | ❌ | ❌ | Hub homepage, no project needed |
| `/ide` | ❌ | ✅ project={null OR lastProject} | **BROKEN**: No guaranteed project |
| `/ide/$projectId` | ✅ | ✅ project={loaded} | Works only if project loads |
| `/notes` | ❌ | ✅ project={null} | **BROKEN**: Always null |
| `/notes/$projectId` | ✅ | ✅ project={loaded} | Works |
| `/knowledge` | ❌ | ✅ project={null} | **BROKEN**: Always null |
| `/knowledge/$projectId` | ✅ | ✅ project={loaded} | Works |
| `/study` | ❌ | ✅ project={null} | **BROKEN**: Always null |
| `/study/$projectId` | ✅ | ✅ project={loaded} | Works |
| `/agents` | ❌ | ❌ | Separate page |
| `/settings` | ❌ | ❌ | Separate page |

**Critical Issue**: Routes without `$projectId` have no guaranteed project context!

### User Flow Analysis

```
CURRENT BROKEN FLOW:
1. User on Hub clicks "Notes"
2. Navigate to /notes (no projectId)
3. notes.lazy.tsx renders ProjectProvider with project={null}
4. NotesPage calls useProjectContext() → gets null
5. NotesPage uses projectId = 'default' as fallback
6. Dexie tries to load notes for 'default' project (wrong!)
7. No notes found, empty state shown

EXPECTED CORRECT FLOW:
1. User on Hub clicks "Notes"  
2. If no projects → Show "Create Project" dialog
3. If 1 project → Navigate to /notes/$projectId
4. If N projects → Show ProjectPickerDialog → Navigate to /notes/$projectId
5. notes.$projectId.lazy.tsx loads project from Dexie
6. ProjectProvider has real project
7. Notes load correctly for that project
```

## 1.2 State Management Inventory

### Zustand Stores (11 analyzed)

| Store | Location | Persist | Table | Key Path | Issue |
|-------|----------|---------|-------|----------|-------|
| useIDEStore | infrastructure/persistence/stores/ide | ✅ | ideState | projectId | Fixed with custom adapter |
| useNoteStore | lib/notes/note-store.ts | ✅ | conversationState | id | **WRONG TABLE** |
| useConversationStore | infrastructure/persistence/stores/conversation | ✅ | conversationState | id | OK |
| useAgentSelectionStore | infrastructure/persistence/stores/agents | ✅ | agentConfigs | id | OK |
| useProjectStore | infrastructure/persistence/stores/project | ❌ | N/A | N/A | Not persisted |
| useRAGStore | infrastructure/persistence/stores/rag | ✅ | ragState | N/A | Table doesn't exist! |
| useWorkspaceStore | infrastructure/persistence/stores/workspace | ✅ | - | - | Not found |

### State Flow Diagram

```
IDEAL STATE FLOW:
┌──────────────┐      ┌────────────────┐      ┌─────────────────┐
│   URL Route  │ ───→ │ Route Loader   │ ───→ │ ProjectProvider │
│ /ide/$projId │      │ getProject(id) │      │ context={proj}  │
└──────────────┘      └────────────────┘      └─────────────────┘
                                                       │
                                                       ▼
┌──────────────┐      ┌────────────────┐      ┌─────────────────┐
│  useIDEStore │ ◄─── │ setProjectId() │ ◄─── │ useEffect in    │
│ projectId:id │      │ called         │      │ IDELayout       │
└──────────────┘      └────────────────┘      └─────────────────┘
       │
       ▼
┌──────────────┐      ┌────────────────┐      ┌─────────────────┐
│ ide-storage  │ ───→ │ db.ideState    │ ───→ │ IndexedDB       │
│ .setItem()   │      │ .put({projId}) │      │ persisted       │
└──────────────┘      └────────────────┘      └─────────────────┘

ACTUAL BROKEN FLOW:
┌──────────────┐      ┌────────────────┐      ┌─────────────────┐
│   URL Route  │ ───→ │ Route Loader   │ ───→ │ ProjectProvider │
│ /ide (no id) │      │ tries lastProj │      │ project=null    │
└──────────────┘      └────────────────┘      └─────────────────┘
                              │ async!                 │
                              ▼                        ▼
┌──────────────┐      ┌────────────────┐      ┌─────────────────┐
│  useIDEStore │ ◄─X─ │ never called   │ ◄─X─ │ setProjectId    │
│ projectId:   │      │ because proj   │      │ NEVER CALLED    │
│    null      │      │ null at render │      │ FOR NULL PROJ   │
└──────────────┘      └────────────────┘      └─────────────────┘
       │
       ▼
┌──────────────┐      ┌────────────────┐      ┌─────────────────┐
│ ide-storage  │ ───→ │ db.ideState    │ ───→ │ Nothing written │
│ sees null id │      │ .get(null)     │      │ hydration empty │
└──────────────┘      └────────────────┘      └─────────────────┘
```

## 1.3 Persistence Layer Inventory

### Dexie Tables (16 tables in schema v16)

| Table | Key Path | Usage | Health |
|-------|----------|-------|--------|
| projects | id | Project metadata | ✅ OK |
| ideState | projectId | IDE workspace state | ⚠️ Fixed but still breaks |
| conversations | id | Chat conversations | ✅ OK |
| notes | id, projectId | Notes content | ✅ OK (direct writes) |
| conversationState | id | Zustand persistence | ✅ OK |
| agentConfigs | id | Zustand persistence | ✅ OK |
| providerConfigs | id | Zustand persistence | ✅ OK |
| threads | id | Chat threads | ✅ OK |
| sources | id | Knowledge sources | ✅ OK |
| collections | id | Knowledge collections | ✅ OK |
| syncStatus | id | Sync queue | ✅ OK |
| fileMetadata | [projectId+path] | File cache | ✅ OK |
| fsaHandles | projectId | FSA handle persistence | ❌ NOT WORKING |
| sessionSnapshots | id | Session restore | ✅ OK |
| oramaIndexes | projectId | RAG indexes | ✅ OK |
| workflows | id | Workflow builder | ✅ OK |

### Generic Storage Adapter Problem

```typescript
// GENERIC ADAPTER (dexie-storage.ts line 157):
await table.put({
    id: name,          // ← Uses "id" field
    state: state,
    updatedAt: new Date()
});

// BUT ideState TABLE:
// Schema: 'projectId, updatedAt'  ← Expects "projectId" as key!

// ERROR RESULT:
// "Failed to execute 'put' on 'IDBObjectStore': 
//  Evaluating the object store's key path did not yield a value"
```

## 1.4 File Synchronization Inventory

### Two Separate Systems

**System 1: IndexedDB Notes (Dexie)**
- Location: `db.notes` table
- CRUD: `useNoteStore.createNote()`, `updateNote()`, etc.
- Content: BlockNote JSON blocks
- Sync: None (browser-local only)

**System 2: File System Access API**
- Location: User's local file system
- CRUD: `showDirectoryPicker()`, `FileSystemWritableFileStream`
- Content: Markdown files
- Sync: Import/Export operations (NOT live sync)

**User Expectation**: ONE system where:
1. Mount folder → files become notes
2. Edit note → file updates automatically
3. Add file to folder → note appears
4. Delete note → file deleted

**Reality**: TWO disconnected systems!

---

# SECTION 2: ROOT CAUSE ANALYSIS

## 2.1 The Core Problem: Timing Mismatch

```
PROBLEM: Project loading is ASYNC but UI rendering is SYNC

Timeline:
T0: Route matches /ide
T1: Route loader calls getProject() - ASYNC, returns Promise
T2: Component renders (loader not awaited properly)
T3: ProjectProvider renders with project={null}
T4: useIDEStore hydrates with projectId=null
T5: Persister tries to save with null projectId → skipped
T6: Promise from T1 resolves with project
T7: Too late - component already rendered with null

SOLUTION: Ensure route BLOCKS until project loaded OR redirect
```

## 2.2 Why "Selecting New Folder" Doesn't Work

Traced flow when user selects a NEW folder:

```
1. showDirectoryPicker() opens native file picker
2. User selects folder
3. saveProject({ name, handle }) called
4. New projectId generated
5. db.projects.add({ id, name, handle, ... })
6. Navigate to /ide/$projectId
7. Route loader: getProject(projectId)
8. Returns project (handle may be undefined in some cases)
9. ProjectProvider wraps with project
10. IDELayout renders

PROBLEM AT STEP 10:
- useProjectContext() returns project
- BUT useIDEStore.getState().projectId is STILL null
- Because no one called useIDEStore.setState({ projectId })
- Hydration happens BEFORE route navigation completes
- So hydrated state has projectId: null from previous session
```

## 2.3 The Missing Link

**Nobody is calling `useIDEStore.getState().setProjectId(projectId)`!**

The custom `ide-state-storage.ts` was created but it:
1. READS projectId from store state (getIDEStoreState())
2. But on first load after selecting folder, store has projectId=null
3. Because no one SET it after navigation

The fix should be in `IDELayout` or route component:
```typescript
// In IDELayout or IDE route component:
const { project } = useProjectContext();
const setProjectId = useIDEStore((s) => s.setProjectId);

useEffect(() => {
  if (project?.id) {
    setProjectId(project.id);  // ← THIS IS MISSING!
  }
}, [project?.id, setProjectId]);
```

---

# SECTION 3: ARCHITECTURE REDESIGN SPECIFICATION

## 3.1 Design Principles

1. **URL is the source of truth for project context**
   - All workspace routes REQUIRE `$projectId` parameter
   - Routes without projectId redirect to project picker

2. **Single source of truth for notes**
   - Dexie `notes` table = canonical storage
   - FSA = optional bidirectional sync layer
   - No duplicate systems

3. **State flows DOWN from route**
   - Route → Provider → Store → Persistence
   - Never: Store → Route (anti-pattern)

4. **Absolute fallbacks, no errors**
   - Mobile without FSA → show polite message
   - No project selected → show picker
   - Database error → show retry option

5. **Cross-workspace consistency**
   - Same project context across all workspaces
   - Switching workspace preserves project
   - Global event bus for real-time sync

## 3.2 Target Architecture

### Route Structure

```
/ (index.tsx)
  → Redirect to /hub

/hub (hub.tsx)
  → Homepage with project list
  → No ProjectProvider needed

/ide (ide.tsx)
  → Redirect to last project OR /hub?action=pick-project&workspace=ide

/ide/$projectId (ide.$projectId.tsx)
  → ProjectProvider with loaded project
  → IDELayout
  → Sets useIDEStore.projectId on mount

/notes (notes.lazy.tsx)
  → Redirect to last project OR /hub?action=pick-project&workspace=notes

/notes/$projectId (notes.$projectId.lazy.tsx)
  → ProjectProvider with loaded project
  → NotesPage

... same pattern for /knowledge, /study
```

### State Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────┘

URL: /ide/abc123
       │
       ▼
┌──────────────────┐
│  Route Loader    │  getProject('abc123') - ASYNC BUT AWAITED
│  (TanStack)      │
└────────┬─────────┘
         │ project = { id: 'abc123', name: 'My Project', ... }
         ▼
┌──────────────────┐
│ ProjectProvider  │  createContext({ project, workspace: 'ide' })
│ (React Context)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   IDELayout      │  useEffect → useIDEStore.setProjectId('abc123')
│   Component      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   useIDEStore    │  state.projectId = 'abc123'
│   (Zustand)      │  persist middleware triggers...
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ ide-state-storage│  getIDEStoreState().projectId = 'abc123'
│ (Custom Adapter) │  db.ideState.put({ projectId: 'abc123', ... })
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    IndexedDB     │  ideState table row for 'abc123'
│    (Dexie)       │
└──────────────────┘
```

## 3.3 Implementation Phases

### Phase 1: Fix Core Flow (4 hours)
1. Add `setProjectId` call in IDELayout when project loads
2. Add same in NotesPage, KnowledgePage, StudyPage
3. Fix routes without projectId to redirect
4. Create ProjectPickerDialog if missing

### Phase 2: Unify Note System (8 hours)
1. Design note sync strategy (Dexie ↔ FSA)
2. Implement NoteFileSyncService
3. Remove separate import/export as primary
4. Add real-time sync status indicators

### Phase 3: Cross-Workspace Reactivity (6 hours)
1. Wire event bus in all workspaces
2. Add reactive subscriptions
3. Test hot-switching between workspaces
4. Fix mobile layouts

### Phase 4: Error Handling & Polish (4 hours)
1. Add graceful degradation everywhere
2. i18n for all messages
3. Responsive testing
4. Performance optimization

---

# SECTION 4: IMMEDIATE ACTION ITEMS

## 4.1 P0 - Blocking Issues

### P0-1: Add setProjectId call in IDELayout
**File**: `src/presentation/components/ide/IDELayout.tsx`
**Issue**: `projectId` never set in store after navigation
**Fix**: 
```typescript
const { project } = useProjectContext();
const setProjectId = useIDEStore((s) => s.setProjectId);

useEffect(() => {
  if (project?.id) {
    setProjectId(project.id);
  }
  return () => {
    // Don't clear on unmount - preserve for hydration
  };
}, [project?.id]);
```

### P0-2: Same fix in NotesPage
**File**: `src/presentation/components/notes/NotesPage.tsx`
**Issue**: Notes uses `projectId = project?.id || 'default'` fallback
**Fix**: Use proper context, add setProjectId call

### P0-3: Redirect routes without projectId
**File**: `src/routes/ide.tsx`
**Issue**: Shows "No Open Project" but should redirect
**Fix**: 
```typescript
// In ide.tsx if no project found:
return <Navigate to="/hub?action=pick-project&workspace=ide" />;
```

## 4.2 P1 - High Priority

### P1-1: Fix NoteStore persistence
**Issue**: Uses `conversationState` table instead of dedicated table
**Fix**: Either create `noteState` table or use direct Dexie writes only

### P1-2: Create unified sync service
**Issue**: Two note systems (Dexie + FSA) are disconnected
**Fix**: Create `NoteFileSyncService` that bridges both

---

# SECTION 5: VERIFICATION CHECKLIST

Before marking any fix complete:

- [ ] `pnpm typecheck` passes
- [ ] `pnpm dev` starts without errors
- [ ] Console shows no uncaught errors
- [ ] Test flow: Hub → Select folder → IDE → Refresh → State persists
- [ ] Test flow: IDE → Navigate to Notes → Back to IDE → State preserved
- [ ] Test on mobile: FSA graceful degradation works
- [ ] Test empty state: No projects → shows picker, not error

---

# APPENDIX A: Repomix Output References

| Domain | OutputId | Files | Tokens |
|--------|----------|-------|--------|
| lib/workspace | 14b127a8e4e71574 | 21 | 16,514 |
| lib/filesync | 25a10882f9c07264 | 15 | 3,137 |
| lib/events | ca31537d237a8e51 | 11 | 10,397 |
| infrastructure/persistence/stores/ide | e3ad2d028c672732 | 11 | 6,755 |
| routes | 320572b33deb7ec9 | 22 | 7,089 |

---

**END OF MASTER ARCHITECTURE ANALYSIS**

**Next Action**: Proceed to Phase 1 implementation after user approval.

---

# CRITICAL ADDENDUM: ACTUAL ROOT CAUSE DISCOVERED

**Time**: 2026-01-06T06:15:00+07:00

## THE SMOKING GUN

After tracing the actual navigation flow, I found TWO critical bugs:

### Bug 1: Hub navigates to WRONG route

**File**: `HubHomePage.tsx` line 165-168
```typescript
await navigate({
    to: '/workspace/$projectId',   // ❌ WRONG! Should be /ide/$projectId
    params: { projectId: newProjectId }
});
```

### Bug 2: /workspace/$projectId uses useState, not loader

**File**: `/routes/workspace/$projectId.tsx` lines 30-36
```typescript
function ProjectWorkspace() {
    const [project, setProject] = useState<Project | null>(null)  // ❌ Starts null!

    useEffect(() => {
        getProject(projectId).then(...)  // ❌ ASYNC after render!
    }, [projectId])

    return (
        <ProjectProvider project={project} ...>  // ❌ Renders with null first!
```

**Compare to correct pattern in `/ide/$projectId.tsx`:**
```typescript
export const Route = createFileRoute('/ide/$projectId')({
    loader: async ({ params }) => {
        const project = await getProject(params.projectId);  // ✅ BLOCKS navigation
        return { project };
    },
    component: IDEWorkspace,
});
```

### Bug 3: /workspace/$projectId NEVER calls setProjectId

The store's `setProjectId` is never called, so even if project loads, the store has null.

## IMMEDIATE FIX (3 options)

### Option A: Fix navigation target (Quick, 5 min)
Change Hub to navigate to `/ide/$projectId` instead of `/workspace/$projectId`

### Option B: Fix /workspace route (Better, 30 min)
Add loader pattern and setProjectId call to match `/ide/$projectId.tsx`

### Option C: Delete /workspace route (Best, 1 hour)
Remove legacy route, update all references to use `/ide/$projectId`

## RECOMMENDED: Option A + B

1. Fix Hub navigation immediately
2. Fix /workspace route for legacy URLs
3. Plan Option C for later cleanup
