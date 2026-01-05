# Deep Architecture Scan Report
## Project Alpha - Workspace & File Sync System

**Date:** 2026-01-06T05:45:00+07:00  
**Agent:** Team A - Antigravity  
**Scope:** Complete user journey analysis: Hub → Workspaces → State → Persistence

---

## Executive Summary

The workspace/project management system has **fundamental architectural inconsistencies** that have been compounded by multiple partial fixes. This scan identifies the root causes and provides a complete remediation plan.

---

## Critical Findings

### 🔴 CRITICAL: Schema Mismatch - Dexie Storage Adapter

**Location:** `src/infrastructure/persistence/dexie-storage.ts` lines 157-161

**Problem:**
```typescript
// Generic adapter writes:
await table.put({
    id: name,        // ← Uses "id" field
    state: state,
    updatedAt: new Date()
});
```

**But some tables use different key paths:**

| Table | Key Path | Adapter Compatible? |
|-------|----------|---------------------|
| `ideState` | `projectId` | ❌ NO - key path mismatch |
| `projects` | `id` | ✅ YES |
| `conversationState` | `id` | ✅ YES |
| `agentConfigs` | `id` | ✅ YES |
| `providerConfigs` | `id` | ✅ YES |
| `notes` | `id` | ✅ YES (writes direct to Dexie, not via adapter) |

**FIX ALREADY IMPLEMENTED:** `ide-state-storage.ts` creates custom adapter for `ideState` table.

**BUT** - the custom adapter needs `projectId` in the state to persist, and if `projectId` is null on first load, nothing persists!

---

### 🔴 CRITICAL: Route Architecture Inconsistency

**Two patterns in use:**

1. **With projectId parameter:** `/ide/$projectId`, `/notes/$projectId`, etc.
   - Route loads project by ID from IndexedDB
   - Always has project context

2. **Without projectId parameter:** `/ide`, `/notes`, `/study`, etc.
   - Attempts to load "most recent" project
   - Falls back to `project={null}` if none found
   - **BREAKS** components that require project context

**Evidence in routes:**

```typescript
// notes.lazy.tsx line 32 - PROBLEMATIC
<ProjectProvider project={null} workspace="notes">

// ide.tsx line 57-70 - SHOWS "No Open Project" but still breaks
if (!project) { return "No Open Project" message }
```

---

### 🔴 CRITICAL: Two Note Systems (User's Key Complaint)

**System 1: Browser-Persisted Notes (Dexie)**
- Table: `notes` in Dexie.js
- Key: `id, projectId, parentId, ...`
- Notes persist in IndexedDB per project
- Used by: `note-store.ts`, `NoteEditor`, `NoteSidebar`

**System 2: File-Synced Notes (FSA)**
- Uses File System Access API
- Syncs .md files from mounted folder
- Used by: `NotesFilePicker`, `MarkdownImportDialog`, `MarkdownExportDialog`
- **PROBLEM:** These are SEPARATE from Dexie notes!

**User expectation:** ONE unified system where:
- Mount folder → files become notes
- Edit note → file updates
- Add file → note appears

**Reality:** TWO disconnected systems. The "synced" notes are IMPORT/EXPORT operations, not live sync.

---

### 🟡 HIGH: Hub → Workspace Navigation Issues

**Flow:**
1. Hub homepage (`/hub`)
2. User clicks workspace card (Notes/Study/Knowledge)
3. Navigation goes to `/notes` (no projectId)
4. If no projects exist → broken state

**Problem in `HubHomePage.tsx`:**
```typescript
// User added navigateToWorkspace but...
const navigateToWorkspace = async (workspace: 'notes' | 'knowledge' | 'study' | 'agents') => {
    if (!projects || projects.length === 0) {
        toast.info('No projects yet');  // ← Toast shown but...
        return;  // ← ...user left on Hub with no action
    }
    // ...
};
```

**But also added `ProjectPickerDialog`** - which doesn't exist yet! (Line 27)
```typescript
import { ProjectPickerDialog } from './ProjectPickerDialog';  // ← FILE DOES NOT EXIST
```

---

### 🟡 HIGH: IDE Without Project = Broken State

**Route:** `/ide` (no projectId)
**File:** `src/routes/ide.tsx` lines 57-70

```typescript
if (!project) {
    return (
        <div>
            <h2>No Open Project</h2>
            <a href="/">Go to Dashboard</a>  // ← Good fallback
        </div>
    );
}
```

**ISSUE:** Route `/workspace/$projectId` navigates here but the project might not be loaded from IndexedDB yet (async timing issue).

**ISSUE:** User said "back button not returning to homepage" - likely browser back goes to previous route but project context is lost.

---

### 🟡 HIGH: Project Hierarchy Not Implemented

**User expectation:**
- Mount folder → becomes "root project"
- Subfolders can be "child projects"
- Granular sync at any level

**Reality:**
- One folder = one project (flat)
- No parent/child project relationship
- No child-level mounting

---

## Data Flow Analysis

### Current Flow (Broken)

```
Hub (/) or (/hub)
    ↓ Click "Open Folder"
    ↓ showDirectoryPicker()
    ↓ Create ProjectRecord in Dexie
    ↓ Navigate to /workspace/$projectId
    ↓
/workspace/$projectId OR /ide/$projectId
    ↓ useEffect: getProject(projectId)
    ↓ If found: setProject(project)
    ↓ Render <ProjectProvider project={project}>
    ↓
<IDELayout> OR <NotesPage>
    ↓ useProjectContext() → may be null!
    ↓ useIDEStore() → persists to ideState table
    ↓ BUT ideState needs projectId which was null on first hydration
    ↓
Page Refresh
    ↓ Zustand hydrates from ideState table
    ↓ ide-state-storage.ts tries to find most recent record
    ↓ But projectId wasn't in persisted state (it was null)
    ↓ Returns null → back to "No Folder Selected" state
```

### Expected Flow (Fixed)

```
Hub (/) or (/hub)
    ↓ Click "Open Folder"
    ↓ showDirectoryPicker()
    ↓ Create ProjectRecord in Dexie
    ↓ Navigate to /ide/$projectId (ALWAYS with projectId)
    ↓
/ide/$projectId
    ↓ useEffect: getProject(projectId)
    ↓ setProject(project) including FSA handle
    ↓ <ProjectProvider project={project}>
    ↓
<IDELayout>
    ↓ useProjectContext() → ALWAYS has project
    ↓ useIDEStore().setProjectId(projectId) ← CRITICAL
    ↓ Sync starts, files load
    ↓
Page Refresh
    ↓ Zustand hydrates from ideState table
    ↓ projectId in state → load that project's state
    ↓ Restore file tree, open files, etc.
```

---

## Files to Fix (Priority Order)

### P0: Blocking Issues

| Priority | File | Issue | Fix |
|----------|------|-------|-----|
| P0-1 | `HubHomePage.tsx` | Duplicate import, missing `ProjectPickerDialog` | Remove duplicate, create component |
| P0-2 | `ide-state-storage.ts` | Hydration doesn't set projectId | After hydration, setProjectId from route param |
| P0-3 | Notes routes | `project={null}` breaks context | Require projectId in route or show picker |

### P1: High Priority

| Priority | File | Issue | Fix |
|----------|------|-------|-----|
| P1-1 | `note-store.ts` | Uses wrong table for persistence | Create note-state-storage.ts or use correct table |
| P1-2 | Hub → Workspace flow | No project picker when multiple projects | Create `ProjectPickerDialog` |
| P1-3 | Note systems | Two separate systems (Dexie + FSA) | Unify to single source of truth |

### P2: Medium Priority

| Priority | File | Issue | Fix |
|----------|------|-------|-----|
| P2-1 | Sync status | SyncStatusPanel shows mock data | Wire to real events (already started) |
| P2-2 | Cross-workspace reactivity | Changes don't reflect | Wire event bus properly |
| P2-3 | Mobile FSA | Crashes on mobile | Add graceful degradation (done) |

---

## Recommended Fix Order

### Phase 1: Unblock (2 hours)
1. Fix duplicate import in HubHomePage.tsx
2. Create minimal `ProjectPickerDialog.tsx`
3. TypeScript compiles

### Phase 2: State Persistence (4 hours)
1. Fix IDE state hydration - ensure `projectId` set from route
2. Fix Notes route - require project selection
3. Verify persistence across refresh

### Phase 3: Note System Consolidation (8 hours)
1. Design unified note system (Dexie as source, FSA as sync)
2. Implement bidirectional sync
3. Remove dual-system confusion

### Phase 4: Project Hierarchy (8 hours)
1. Add parent/child project support
2. Implement granular mounting
3. Update Hub UI

---

## Sprint Validation Checklist

Before claiming any story "done", verify:

- [ ] TypeScript compiles: `pnpm typecheck`
- [ ] Dev server starts: `pnpm dev`
- [ ] Test the ACTUAL USER FLOW in browser:
  1. Clear IndexedDB
  2. Go to Hub
  3. Mount a folder
  4. Navigate to each workspace
  5. Refresh page
  6. State should persist
- [ ] Console has no uncaught errors
- [ ] Mobile: verify FSA graceful degradation

---

## Artifacts Reference

| Artifact | Location | Status |
|----------|----------|--------|
| This scan | `_bmad-output/artifacts/2026-01-06/architecture-deep-scan.md` | NEW |
| Sprint YAML | `_bmad-output/sprint-artifacts/comprehensive-remediation-sprint-2026-01-05.yaml` | NEEDS UPDATE |
| UJ-001 Story | `_bmad-output/sprint-artifacts/UJ-001-wire-sync-status-panel.md` | IN PROGRESS |
| UJ-002 Story | `_bmad-output/sprint-artifacts/UJ-002-mobile-fsa-degradation.md` | DONE |

---

**End of Deep Scan Report**
