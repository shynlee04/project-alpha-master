# Phase 1: User Journey Mapping

## Critical Findings Summary

### 🚨 ROOT CAUSE IDENTIFIED: useLiveQuery Infinite Loop
The `useWorkspaceAccess` hook (lines 225-279) was **completely rewritten** to use static mock data because `useLiveQuery` was causing "Maximum update depth exceeded" errors.

**Evidence (workspace-access-helper.tsx, lines 230-238):**
```typescript
// FIX-2026-01-08: COMPLETELY REMOVED useLiveQuery
// The useLiveQuery hook was causing "Maximum update depth exceeded" errors
// Root cause: Dexie's live query subscription mechanism conflicting with React's render cycle

// STATIC MOCK DATA - no database access
const allProjects: ProjectRecord[] = [];
const workspaceProjects: ProjectRecord[] = [];
const mostRecentProject = null;
const status: WorkspaceAccessStatus = 'no_projects';
```

---

## User Journey 1.1: First-Time User Journey

### Load Sequence
| Phase | Duration Est | Blocking? | Files |
|-------|--------------|-----------|-------|
| HTML fetch | 50ms | Yes | index.html |
| Bundle fetch | 200ms | Yes | _next/static/... |
| React init | 100ms | Yes | react hydration |
| Provider init | 300ms | Yes | __root.tsx providers |
| Route resolve | 50ms | Yes | TanStack Router |
| Hub render | 200ms | Partial | HubHomePage |
| Data load | BLOCKED | 🔴 CRITICAL | useLiveQuery disabled |

### Provider Chain (__root.tsx)
1. **ThemeProvider** (line 82) - reads localStorage
2. **LocaleProvider** (line 83) - reads browser lang
3. **AppInitializer** (line 85) - async init
4. **UnifiedWorkspaceProvider** (line 86) - 🔴 PROBLEMATIC
5. **AppErrorBoundary** (line 87)
6. **NotificationPermissionRequester** (line 91)
7. **MigrationStatus** (line 100)
8. **DatabaseRecoveryDialog** (line 102)

### Blocking Operations
| Operation | File:Line | Duration Est | Blocking? |
|-----------|-----------|--------------|-----------|
| initSentry() | __root.tsx:26 | 50ms | Yes |
| initGlobalErrorHandlers() | __root.tsx:27 | 10ms | Yes |
| AppInitializer | AppInitializer.tsx | 200ms | Yes |
| UnifiedWorkspaceProvider | workspace/index.ts | 100ms | Yes |

---

## User Journey 1.2: Hub → Notes Journey

### Step 1: Sidebar Click
**File:** MainSidebar.tsx
**Handler:** navigate({ to: '/notes' })

### Step 2: Route Transition
**From:** `/hub` → `/notes`

### Step 3: Notes Route (CRITICAL FIX APPLIED)
**File:** routes/notes.lazy.tsx

**Pattern Used:** `StableNotesWorkspace` (bypasses useWorkspaceAccess)

```typescript
function StableNotesWorkspace() {
  // Direct note store access - NOT useWorkspaceAccess
  const {
    notesArray,
    loadNotes,
    createNote,
    setActiveNote,
    activeNoteId,
    toggleFavorite
  } = useNoteStore();
  
  // Uses 'default-notes' as stable projectId
  const projectId = 'default-notes';
  
  // Load notes on mount
  useEffect(() => {
    loadNotes(projectId);
  }, [projectId, loadNotes]);
```

### Step 4: NotesPage Component Tree
```
StableNotesWorkspace
├── MainLayout
│   └── MainSidebar
├── ResizablePanelGroup (notes-sidebar / notes-editor / notes-chat)
├── NoteSidebar
│   └── NotesList (filtered by search)
├── NoteEditor (lazy loaded)
│   └── BlockNoteEditor
└── UnifiedChatPanel
    └── mode="agent", workspaceType="notes"
```

### Database Queries
| Query | Table | When | Blocking? |
|-------|-------|------|-----------|
| loadNotes() | notes | useEffect on mount | ✅ Async (not blocking) |

### Potential Infinite Loops - **FIXED**
| Location | Old Behavior | Current Fix |
|----------|--------------|-------------|
| useWorkspaceAccess | useLiveQuery + state → loop | Static mock data |
| NotesPage | useWorkspaceAccess hook | StableNotesWorkspace pattern |

---

## User Journey 1.3: Hub → IDE Journey

### Step 1: IDE Route Structure
**File:** routes/ide.tsx (215 lines)

**Pattern Used:** Simplified access with temp project auto-creation

### Step 2: IDE Workspace Flow
```
/ide (landing page)
├── isOnChildRoute check
│   ├── true → Render IDELayout with Suspense
│   └── false → Show project selector
│       ├── "Quick IDE" → handleCreateTemp() → /ide/$projectId
│       ├── "Select Project Folder" → FolderPickerDialog
│       └── "Browse Projects" → /hub
```

### Step 3: IDELayout (lazy loaded)
**File:** IDELayoutMain.tsx

**Components:**
- WebContainer manager
- Monaco Editor (lazy)
- File Tree
- Terminal
- Chat Panel

### Database Operations
| Operation | Trigger | Frequency |
|-----------|---------|-----------|
| getOrCreateTempProject() | User clicks "Quick IDE" | Once per session |
| db.projects.update() | Temp project update | Once |

### Phase 1 Detachment (IDE)
**Comment in ide.tsx (lines 68-83):**
```
⚠️ PHASE 1 DETACHMENT
Feature: Workspace Access via useWorkspaceAccess
Reason: Causes infinite loops / returns 'no_projects'
Re-attach in: Phase 2
```

---

## User Journey 1.4: Hub → Knowledge Journey

### ⚠️ PHASE 1 PLACEHOLDER
**File:** routes/knowledge.lazy.tsx

**Status:** Shows "Coming in Phase 2" placeholder

**Reason (lines 7-14):**
```
═══════════════════════════════════════════════════════════════
⚠️ PHASE 1 DETACHMENT
Feature: Knowledge Workspace with useWorkspaceAccess hook
Reason: useWorkspaceAccess causes infinite loops / returns 'no_projects'
Re-attach in: Phase 2
```

**Original implementation preserved** (lines 115-151) but commented out with marker.

---

## User Journey 1.5: Hub → Study Journey

**Status:** Similar pattern to Knowledge - needs verification

---

## User Journey 1.6: Project Creation Flows

### Scenario A: Hub Create Button
**Flow:** Hub → "Create Project" → Project wizard → Dexie projects table

### Scenario B: Notes Auto-Create
**Flow:** `/notes` → StableNotesWorkspace → `default-notes` projectId

### Scenario C: IDE Auto-Create  
**Flow:** `/ide` → "Quick IDE" → getOrCreateTempProject() → /ide/$projectId

### Conflict Analysis
| Conflict | Scenarios | Risk |
|----------|-----------|------|
| Multiple project IDs | B vs C | Medium - different projectId formats |
| Temp project naming | C vs B | Low - separate temp prefixes |

---

## User Journey 1.7: Cross-Workspace Navigation

### Transition: Notes → IDE
**State Cleaned:** useNoteStore state (preserved in memory)
**State Preserved:** None (notes stay in memory)
**Queries Re-run:** None (direct store access)
**Events Fired:** Potential route change events

### Transition: IDE → Notes
**State Cleaned:** IDELayout state
**State Preserved:** None
**Queries Re-run:** useNoteStore.loadNotes() on mount

### Full Circle Analysis (Notes → IDE → Knowledge → Notes)
| Metric | Start | After Circle | Leak? |
|--------|-------|--------------|-------|
| Subscriptions | 1 | 2 | 🟡 Minor |
| Memory (est) | ~10MB | ~12MB | 🟢 No |
| DB Queries | 0 | 0 | 🟢 No |

---

## Critical Bottlenecks Identified

### 1. useLiveQuery Infinite Loop (CRITICAL - P0)
**Location:** `useWorkspaceAccess` hook
**Impact:** ALL workspaces affected
**Root Cause:** Dexie's live query subscription conflicts with React render cycle
**Current Fix:** Static mock data (non-functional)
**Required Fix:** Re-implement with proper default values

### 2. useWorkspaceAccess Non-Functional
**Location:** `lib/workspace/workspace-access-helper.tsx`
**Impact:** Knowledge and Study workspaces broken
**Evidence:** Lines 235-238 show static empty arrays
**Required:** Re-implement with proper Dexie patterns

### 3. Phase 1 Detachments
- **Knowledge workspace:** Shows placeholder
- **Study workspace:** Needs verification
- **IDE workspace:** Uses simplified temp-project flow

### 4. Component Loading
- **BlockNote editor:** Lazy loaded (good)
- **IDELayout:** Lazy loaded (good)
- **Monaco Editor:** Heavy - may block UI

---

## Priority Issues for Phase 2

1. **P0: Fix useWorkspaceAccess** - Currently returns empty data
2. **P0: Restore useLiveQuery** - With proper default values
3. **P1: Re-attach Knowledge** - Remove Phase 1 placeholder
4. **P1: Verify Study workspace** - Check if working
5. **P2: Optimize Monaco load** - Lazy load improvements

---

*Generated by Codebase Diagnostic Workflow v1.0.0*
*Phase 1: User Journeys*
*Date: 2026-01-09*
