# User Journey & Architecture Reality Analysis

**Date**: 2026-01-20
**Purpose**: Trace fundamental user journeys to identify architecture flaws and ADR violations
**Scope**: IDE + Notes complete cycles, per-device entry points, ID confusion analysis

---

## 🎯 FUNDAMENTAL TRUTH: What Users Actually Need

### Complete User Journey: Desktop IDE

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ USER JOURNEY: Desktop → IDE → Complete Workflow                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ENTRY POINT                                                                  │
│  ┌─────────────┐                                                             │
│  │ Desktop     │ ─── Chrome/Edge ─── getPlatformContract() ─┐               │
│  │ Browser     │                                              │               │
│  └─────────────┘                                              ▼               │
│                                                    ┌──────────────────┐      │
│  SHOULD: deviceType='desktop'                      │ Platform Check   │      │
│          storageType='fsa' (auto)                  │ canAccessIDE=T   │      │
│          canAccessFSA=true                         │ canAccessFSA=T   │      │
│                                                    └────────┬─────────┘      │
│                                                              │                │
│  STEP 1: PROJECT SELECTION                                   ▼                │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │ /ide route → Show folder picker (NO temp project on desktop)│             │
│  │                                                              │             │
│  │ OPTIONS:                                                     │             │
│  │  • "Select Project Folder" → showDirectoryPicker()          │             │
│  │  • "Browse Projects" → /hub                                 │             │
│  │                                                              │             │
│  │ ❌ BUG: "Quick IDE (Temp Project)" still visible            │             │
│  │         (should be hidden per PLAT-001)                     │             │
│  └───────────────────────────────┬─────────────────────────────┘             │
│                                  │                                            │
│  STEP 2: PROJECT CREATION                                                     │
│  ┌───────────────────────────────▼─────────────────────────────┐             │
│  │ User selects folder via FSA API                             │             │
│  │                                                              │             │
│  │ SHOULD:                                                      │             │
│  │  1. Get FileSystemDirectoryHandle from picker               │             │
│  │  2. Generate projectId: `proj_${uuid}`                      │             │
│  │  3. Store ACTUAL handle in IndexedDB (fsaHandles table)    │             │
│  │  4. Store project metadata in projects table                │             │
│  │  5. Navigate to /ide/$projectId                             │             │
│  │                                                              │             │
│  │ ❌ BUG: Handle stored as mock object {kind:'directory'}     │             │
│  │ ❌ BUG: Chrome version check only matches 129 exactly       │             │
│  └───────────────────────────────┬─────────────────────────────┘             │
│                                  │                                            │
│  STEP 3: IDE LOADS                                                            │
│  ┌───────────────────────────────▼─────────────────────────────┐             │
│  │ Route: /ide/$projectId                                       │             │
│  │                                                              │             │
│  │ SHOULD:                                                      │             │
│  │  1. Extract projectId from URL (match[2])                   │             │
│  │  2. Restore FSA handle from IndexedDB (silent, no prompt)  │             │
│  │  3. Hydrate IDE state for THIS projectId                    │             │
│  │  4. Scan file tree via FSA                                  │             │
│  │  5. Show Monaco editor with files                           │             │
│  │                                                              │             │
│  │ ❌ BUG: Regex returns match[1]='ide' not match[2]=projectId │             │
│  │ ❌ BUG: Handle can't restore (was never stored properly)    │             │
│  │ ❌ BUG: IDE state hydrates for 'ide' not actual projectId   │             │
│  └───────────────────────────────┬─────────────────────────────┘             │
│                                  │                                            │
│  STEP 4: USER WORKS                                                           │
│  ┌───────────────────────────────▼─────────────────────────────┐             │
│  │ - Opens files in Monaco                                      │             │
│  │ - Uses terminal (WebContainer)                               │             │
│  │ - Chats with AI agent                                        │             │
│  │ - State persists per [projectId+workspaceId]                │             │
│  │                                                              │             │
│  │ ✅ WORKING: Files load once handle is restored              │             │
│  │ ✅ WORKING: Terminal boots (WebContainer)                   │             │
│  │ ❌ BUG: State saves to wrong key (projectId='ide')          │             │
│  └───────────────────────────────┬─────────────────────────────┘             │
│                                  │                                            │
│  STEP 5: USER REFRESHES / RETURNS                                             │
│  ┌───────────────────────────────▼─────────────────────────────┐             │
│  │ SHOULD:                                                      │             │
│  │  1. Navigate to /ide/$projectId                             │             │
│  │  2. Silently restore FSA handle (no picker prompt)         │             │
│  │  3. Files load instantly (cached snapshot + background diff)│             │
│  │  4. IDE state restored (open tabs, scroll position)        │             │
│  │                                                              │             │
│  │ ❌ REALITY: User sees folder picker AGAIN (handle not stored)│             │
│  │ ❌ REALITY: IDE state is blank (hydrated for wrong projectId)│             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Complete User Journey: Desktop Notes

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ USER JOURNEY: Desktop → Notes → Complete Workflow                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ENTRY POINT: /notes (no projectId)                                          │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │ Desktop browser navigates to /notes                         │             │
│  │                                                              │             │
│  │ SHOULD (per ADR-033 D3):                                    │             │
│  │  • Desktop → Show project picker (can select FSA folder)   │             │
│  │  • OR use existing FSA project                              │             │
│  │  • Notes save as .md files in /project/notes/              │             │
│  │                                                              │             │
│  │ ❌ REALITY:                                                  │             │
│  │  • Desktop → Gets browser-mode (IndexedDB only)            │             │
│  │  • No FSA project option shown                              │             │
│  │  • Notes save to IndexedDB, not .md files                  │             │
│  └───────────────────────────────┬─────────────────────────────┘             │
│                                  │                                            │
│  CURRENT FLOW (Browser Mode):                                                 │
│  ┌───────────────────────────────▼─────────────────────────────┐             │
│  │ 1. getOrCreateBrowserModeProject() called                   │             │
│  │ 2. Creates/gets project with ID: 'notes:browser-mode'      │             │
│  │ 3. storageType = 'indexeddb' (forced)                       │             │
│  │ 4. Notes saved to Dexie db.notes table                      │             │
│  │ 5. NO .md files on disk                                     │             │
│  │                                                              │             │
│  │ PROBLEM: This violates ADR-033 D3 which says:              │             │
│  │ "Desktop FSA: Notes save as .md files in FSA folder"       │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
│  EXPECTED FLOW (ADR-033 Compliant):                                           │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │ 1. Desktop /notes → Check for existing FSA projects        │             │
│  │ 2. If FSA project exists → Use it (notes in /project/notes)│             │
│  │ 3. If no project → Show picker (FSA for desktop)           │             │
│  │ 4. Notes sync bidirectionally: BlockNote ↔ .md files      │             │
│  │ 5. MarkdownSyncService handles sync (exists but unused!)   │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Complete User Journey: Mobile Notes

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ USER JOURNEY: Mobile/Tablet → Notes → Complete Workflow                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ENTRY POINT                                                                  │
│  ┌─────────────┐                                                             │
│  │ Mobile      │ ─── Safari/Chrome ─── getPlatformContract() ─┐             │
│  │ Browser     │                                                │             │
│  └─────────────┘                                                ▼             │
│                                                    ┌──────────────────┐      │
│  SHOULD: deviceType='mobile' or 'tablet'           │ Platform Check   │      │
│          storageType='indexeddb' (auto)            │ canAccessIDE=F   │      │
│          canAccessFSA=false                        │ canAccessFSA=F   │      │
│                                                    └────────┬─────────┘      │
│                                                              │                │
│  IF USER TRIES /ide:                                         ▼                │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │ Route guard redirects to /hub with reason='mobile-not-supported'         │
│  │ ✅ WORKING: Mobile cannot access IDE                       │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
│  IF USER GOES TO /notes:                                                      │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │ 1. getOrCreateBrowserModeProject() creates 'notes:browser-mode'          │
│  │ 2. storageType = 'indexeddb' (correct for mobile)          │             │
│  │ 3. Notes stored in Dexie db.notes table                     │             │
│  │                                                              │             │
│  │ ✅ CORRECT: Mobile uses IndexedDB project automatically    │             │
│  │ ✅ CORRECT: Same project for all mobile sessions           │             │
│  │ ⚠️ CONCERN: No cloud sync, notes lost on browser clear     │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔴 ARCHITECTURE CONFUSION ANALYSIS

### Problem 1: Dexie Used for 5 Different Purposes (No Boundaries)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ DEXIE (IndexedDB) - MULTIPLE CONFLICTING USES                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  PURPOSE 1: PRIMARY DATABASE (for mobile/browser-mode)                       │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │ Tables: db.notes, db.projects, db.conversations            │             │
│  │ Content: Note content, project metadata, chat history      │             │
│  │ React: useLiveQuery() for reactive queries                 │             │
│  │                                                              │             │
│  │ ✅ This is correct use of Dexie as primary storage         │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
│  PURPOSE 2: FSA HANDLE PERSISTENCE                                           │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │ Table: db.fsaHandles                                        │             │
│  │ Content: FileSystemDirectoryHandle (Chrome 129+ only)      │             │
│  │ React: N/A (no reactivity needed)                          │             │
│  │                                                              │             │
│  │ ❌ BUG: Stores mock object instead of actual handle        │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
│  PURPOSE 3: ZUSTAND PERSIST STORAGE                                          │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │ Table: db.providerConfigs, db.terminalState, etc.          │             │
│  │ Content: Zustand store snapshots (serialized JSON)         │             │
│  │ React: Zustand reactivity (not Dexie's useLiveQuery)       │             │
│  │                                                              │             │
│  │ Pattern: persist({ storage: createDexieStorage('table') }) │             │
│  │                                                              │             │
│  │ ⚠️ CONFUSING: Some stores use localStorage, some use Dexie │             │
│  │ ⚠️ CONFUSING: Some stores don't persist at all             │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
│  PURPOSE 4: FILE TREE CACHE                                                   │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │ Tables: db.fileSnapshots, db.fileContentCache              │             │
│  │ Content: File metadata, content cache for fast loads       │             │
│  │ React: N/A (loaded on demand)                              │             │
│  │                                                              │             │
│  │ ✅ Correct use for performance optimization                │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
│  PURPOSE 5: IDE STATE (with projectId+workspaceId keys)                      │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │ Table: db.ideState                                          │             │
│  │ Content: Open files, panel layouts, scroll positions       │             │
│  │ Key: [projectId, workspaceId] compound                     │             │
│  │                                                              │             │
│  │ ❌ BUG: Hydration uses wrong projectId ('ide' not actual)  │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
│  ══════════════════════════════════════════════════════════════════════════ │
│  CONFUSION: Which is source of truth for what?                               │
│  ══════════════════════════════════════════════════════════════════════════ │
│                                                                               │
│  Projects:     Dexie db.projects (✅ clear)                                  │
│  Notes:        Dexie db.notes OR .md files on FSA (❓ unclear)              │
│  IDE State:    Dexie db.ideState (❌ buggy hydration)                       │
│  FSA Handles:  Dexie db.fsaHandles (❌ stores mock data)                    │
│  Zustand:      Some Dexie, some localStorage, some memory (❓ inconsistent) │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Problem 2: WorkspaceId vs ProjectId Confusion

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ID CONFUSION: WorkspaceId vs ProjectId                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  CORRECT MENTAL MODEL:                                                        │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │                                                              │             │
│  │  PROJECT is the ENTITY with an ID                           │             │
│  │  ├── id: "proj_abc123" (unique identifier)                  │             │
│  │  ├── name: "My App"                                         │             │
│  │  ├── storageType: "fsa" | "indexeddb"                       │             │
│  │  └── workspaceBindings: { ide: true, notes: true, ... }    │             │
│  │                                                              │             │
│  │  WORKSPACE is just a VIEW/MODE name:                        │             │
│  │  • "ide" - Code editor view                                 │             │
│  │  • "notes" - Note editor view                               │             │
│  │  • "study" - Flashcard view                                 │             │
│  │  • "knowledge" - Knowledge base view                        │             │
│  │                                                              │             │
│  │  WORKSPACE IS NOT AN ENTITY - just a string constant!       │             │
│  │                                                              │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
│  CURRENT CONFUSION IN CODE:                                                   │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │                                                              │             │
│  │  WorkspaceId defined in 5 DIFFERENT FILES:                  │             │
│  │  • src/infrastructure/persistence/dexie-db-core-types.ts   │             │
│  │  • src/lib/events/cross-workspace-event-bus.ts             │             │
│  │  • src/presentation/components/hub/WorkspaceBindingDialog.types.ts      │
│  │  • src/presentation/components/hub/WorkspaceBindingToggle.tsx           │
│  │  • src/presentation/components/hub/useWorkspaceBindingState.ts          │
│  │                                                              │             │
│  │  ProjectRecord has BOTH:                                    │             │
│  │  • id: string (the actual project ID)                       │             │
│  │  • workspaceId: 'ide' | 'notes' | ...                      │             │
│  │                                                              │             │
│  │  WHY? This was for "workspace-specific data" but creates   │             │
│  │  confusion because workspaceId looks like an entity ID!    │             │
│  │                                                              │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
│  ❌ BUG: hydration-manager.ts:58 returns workspaceId not projectId!          │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │  const match = pathname.match(/\/(ide|study)\/([a-f0-9-]+)/i);           │
│  │  return match ? match[1] : null;  // Returns 'ide' not projectId!       │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Problem 3: Default ProjectId for Mobile (notes:browser-mode)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ SPECIAL ID: 'notes:browser-mode' - Mobile Default Project                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  INTENT:                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │ Mobile users don't pick folders - auto-create a project    │             │
│  │ ID format: 'notes:browser-mode' (not UUID)                 │             │
│  │ Storage: IndexedDB only (no FSA on mobile)                 │             │
│  │ Scope: All notes across all "projects" visible             │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
│  PROBLEMS:                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │                                                              │             │
│  │  1. ID FORMAT INCONSISTENCY                                 │             │
│  │     • Regular projects: "proj_uuid-v4-here"                │             │
│  │     • Browser mode: "notes:browser-mode"                   │             │
│  │     • Temp IDE: "ide:temp_xxx" (different format again!)   │             │
│  │                                                              │             │
│  │  2. ROUTING CONFUSION                                       │             │
│  │     • Route: /notes/notes:browser-mode                     │             │
│  │     • Contains colon (:) which could break URL parsing     │             │
│  │     • Regex [a-f0-9-]+ won't match it (not hex!)           │             │
│  │                                                              │             │
│  │  3. DESKTOP CAN GET BROWSER-MODE TOO                        │             │
│  │     • /notes route on desktop → gets browser-mode          │             │
│  │     • Desktop SHOULD use FSA project per ADR-033           │             │
│  │     • Violation of platform-based storage selection        │             │
│  │                                                              │             │
│  │  4. CROSS-PROJECT DATA LEAK                                 │             │
│  │     • Browser-mode shows "all notes from all projects"     │             │
│  │     • What if user has multiple FSA projects?              │             │
│  │     • Notes from different projects mixed together         │             │
│  │                                                              │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
│  RECOMMENDED FIX:                                                             │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │                                                              │             │
│  │  1. Use consistent ID format: "proj_browser-mode-default"  │             │
│  │  2. Desktop /notes should:                                  │             │
│  │     • Check for existing FSA projects first                │             │
│  │     • If none, show project picker (not auto browser-mode) │             │
│  │  3. Mobile /notes can auto-create browser-mode project     │             │
│  │  4. Separate data by projectId, not "show all"             │             │
│  │                                                              │             │
│  └─────────────────────────────────────────────────────────────┘             │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 BLOCKING POINTS ANALYSIS

| Journey Step | Should Happen | Actually Happens | Blocking Bug |
|--------------|---------------|------------------|--------------|
| Desktop → IDE → Select Folder | FSA handle stored | Mock object stored | Chrome 129 check + mock data |
| Desktop → IDE → Refresh | Silent restore | Folder picker again | Handle not stored |
| Desktop → IDE → Hydration | Hydrate for projectId | Hydrate for 'ide' | Regex match[1] bug |
| Desktop → Notes | FSA project picker | browser-mode | No platform check in /notes |
| Desktop → Notes → Save | .md file in folder | IndexedDB only | MarkdownSyncService not connected |
| Mobile → IDE | Block + redirect | ✅ Works | - |
| Mobile → Notes | browser-mode project | ✅ Works | - |

---

## 🎯 ADR UPDATES REQUIRED

### ADR-033 Amendments

| Section | Current | Should Be | Priority |
|---------|---------|-----------|----------|
| D2 Chrome Version | Not specified | "Chrome >= 129 for structuredClone" | P0 |
| D3 Desktop Notes | "FSA folder" | "Desktop /notes MUST show project picker for FSA" | P0 |
| D5 Browser Mode | "Single default" | "Mobile ONLY - desktop must use FSA or picker" | P0 |

### New Decision Required: Unified ID Format

```
PROPOSED D14: Project ID Format Standardization

| Type | Format | Example |
|------|--------|---------|
| FSA Project | proj_{uuid} | proj_a1b2c3d4-e5f6-... |
| IndexedDB Project | proj_{uuid} | proj_x1y2z3w4-... |
| Browser Default | proj_browser-default | proj_browser-default |
| Temp IDE | proj_temp_{uuid} | proj_temp_a1b2... |

Rationale:
- Consistent format for routing regex
- No colons (:) which can break URL parsing
- All IDs start with 'proj_' for easy identification
```

### New Decision Required: Storage Layer Separation

```
PROPOSED D15: Dexie Usage Boundaries

| Purpose | Table(s) | Owner | Reactive |
|---------|----------|-------|----------|
| App Data | db.notes, db.projects, db.conversations | Domain | Yes (useLiveQuery) |
| FSA Handles | db.fsaHandles | Infrastructure | No |
| Zustand Persist | db.providerConfigs, db.terminalState | State | Via Zustand |
| File Cache | db.fileSnapshots, db.fileContentCache | Infrastructure | No |
| IDE State | db.ideState | State | Via Zustand persist |

Rule: One purpose per table, clear ownership, no mixing.
```

---

## 📋 PRIORITY FIX ORDER

| # | Bug | Impact | Fix Time | Files |
|---|-----|--------|----------|-------|
| 1 | Chrome version check | 95% of users can't persist handles | 5 min | handle-persistence.ts:56 |
| 2 | Handle storage mock data | All FSA projects fail persistence | 2 hours | project-crud-slice.ts, ProjectCreationWizard |
| 3 | Hydration regex | All IDE state loads for wrong project | 10 min | hydration-manager.ts:58 |
| 4 | Desktop Notes browser-mode | Violates ADR-033 D3 | 4 hours | notes.lazy.tsx |
| 5 | MarkdownSyncService integration | Notes don't sync to .md | 4 hours | NotesPage, MarkdownSyncService |
| 6 | Unified ID format | Prevents future routing bugs | 2 hours | Multiple files |

---

**Document Owner**: BMAD Master Orchestrator
**Created**: 2026-01-20T14:00:00+07:00
**Status**: ANALYSIS COMPLETE - READY FOR ADR AMENDMENT
