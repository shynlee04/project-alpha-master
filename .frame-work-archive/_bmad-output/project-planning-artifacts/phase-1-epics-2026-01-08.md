---
title: "Phase 1 Epics: Foundation (Simplified Routing + Full Workspace Capability)"
version: "1.0.0"
created: "2026-01-08T20:13:00+07:00"
phase: "PHASE 1: Foundation"
status: "READY_FOR_IMPLEMENTATION"
priority: "P0 - CRITICAL"
duration: "3-4 days"
total_stories: 12
total_effort: "~34 hours"
gate_criteria: "Both workspaces fully functional for CRUD operations"

# Input Documents:
input_documents:
  - "_bmad-output/project-planning-artifacts/sprint-change-proposal-2026-01-08.md"
  - "_bmad-output/diagnostics/phase-1-investigation-ide-2026-01-08.md"
  - "src/lib/agent/providers/credential-vault.ts"
  - "src/infrastructure/persistence/stores/providers/migrate-api-keys-to-vault.ts"

# Extracted Requirements Summary:
requirements_summary:
  core_principle: "Start simple, add complexity only when gates pass"
  user_flow:
    mobile: "Auto-create temp project with virtual file system"
    desktop: "Must select folder via FSA, fallback to mobile flow"
  workspaces:
    - "IDE: Full user + agent CRUD"
    - "Notes: Full user + AI CRUD"
  routes:
    keep: ["/ide", "/ide/$projectId", "/notes", "/notes/$projectId"]
    detach: ["Knowledge", "Study", "nested routes"]
  potential_blockers:
    - "credential-vault.ts: Complex async init, SSR guards"
    - "migrate-api-keys-to-vault.ts: Migration may not have run"
    - "useWorkspaceAccess: Returns 'no_projects' or loops"
---

# Phase 1 Epics: Foundation

## Executive Summary

Phase 1 focuses on making **IDE and Notes workspaces fully functional** with:
- Clear mobile (temp project) vs desktop (FSA folder) user flows
- Full CRUD for both users and agents
- Simplified routing (2 patterns only per workspace)
- Detached complexity with documented markers

**Philosophy**: Start simple, add complexity ONLY when gates pass.

---

## Requirements Extracted

### Functional Requirements (Phase 1)

```
FR-P1-01: Mobile users auto-receive a temp project with virtual file system
FR-P1-02: Desktop users must select a folder via FSA picker
FR-P1-03: Unknown routes/projects fallback to temp project flow
FR-P1-04: IDE supports full user CRUD (create, read, update, delete files)
FR-P1-05: IDE supports full agent CRUD (agentic coding)
FR-P1-06: Notes supports full user CRUD (create, read, update, delete notes)
FR-P1-07: Notes supports AI features (slash commands, summarize, etc.)
FR-P1-08: Only 2 route patterns per workspace (/workspace, /workspace/$projectId)
FR-P1-09: Complex forms detached with documentation markers
FR-P1-10: Credential vault chain traced and documented
FR-P1-11: Agent permissions and key propagation working
```

### Non-Functional Requirements (Phase 1)

```
NFR-P1-01: Zero "Maximum update depth exceeded" errors
NFR-P1-02: Zero console errors on route load
NFR-P1-03: HMR doesn't break pages
NFR-P1-04: Temp project persists across refresh
NFR-P1-05: FSA folder handle persists across sessions (where browser supports)
NFR-P1-06: All detached code has standardized comment markers
```

### Potential Blockers Identified

```
BLOCKER-01: credential-vault.ts
  - Complex async initialization
  - SSR guards may interfere
  - Keys stored in localStorage + IndexedDB hybrid
  - If vault doesn't initialize, AI features fail

BLOCKER-02: migrate-api-keys-to-vault.ts
  - Migration may not have run
  - If providers still have apiKey field, vault is bypassed
  - Verification step may fail silently

BLOCKER-03: useWorkspaceAccess hook
  - Returns 'no_projects' or loops infinitely
  - Already bypassed in notes.lazy.tsx
  - Needs bypass in ide.tsx too
```

---

## EPIC-P1: Phase 1 Foundation

**Priority**: P0 - CRITICAL
**Status**: READY_FOR_IMPLEMENTATION
**Objective**: IDE and Notes work FULLY with clear mobile/desktop paths
**Duration**: 3-4 days
**Total Stories**: 12
**Total Effort**: ~34 hours

### Dependencies

- No external dependencies (foundation epic)
- Internal dependencies noted per story

---

## Stories

### P1-01: Simplify Notes Route to 2 Patterns

**Priority**: P0
**Effort**: 2 hours
**Dependencies**: None

**Description**:
Ensure `/notes` and `/notes/$projectId` are the only active routes. Detach all nested routes with documentation markers.

**Acceptance Criteria**:
- [ ] `/notes` route loads without errors
- [ ] `/notes/$projectId` route loads specific project's notes
- [ ] Nested routes (e.g., `/notes/$projectId/$noteId`) are commented out with markers
- [ ] Comment markers follow Phase 1 detachment pattern
- [ ] Zero "Maximum update depth exceeded" errors

**Technical Notes**:
- Current notes.lazy.tsx already bypasses useWorkspaceAccess
- Verify projectId handling (`'default-notes'` hardcoded - needs fix)

**Files to Modify**:
- `src/routes/notes.lazy.tsx`
- `src/routes/notes.$projectId.lazy.tsx`

---

### P1-02: Simplify IDE Route to 2 Patterns

**Priority**: P0
**Effort**: 2 hours
**Dependencies**: None

**Description**:
Bypass `useWorkspaceAccess` in `/ide` route similar to notes. Ensure only `/ide` and `/ide/$projectId` patterns are active.

**Acceptance Criteria**:
- [ ] `/ide` route loads without errors
- [ ] `/ide/$projectId` route loads specific project
- [ ] `useWorkspaceAccess` hook bypassed with Phase 1 marker
- [ ] Nested routes commented out with markers
- [ ] Zero infinite loops

**Technical Notes**:
- IDE investigation found useWorkspaceAccess is the blocker
- Child route `/ide/$projectId` already works with loader pattern
- Follow same bypass pattern as notes

**Files to Modify**:
- `src/routes/ide.tsx`
- `src/routes/ide.$projectId.tsx` (if needed)

---

### P1-03: Create Temp Project Auto-Flow (Mobile)

**Priority**: P0
**Effort**: 3 hours
**Dependencies**: P1-01, P1-02

**Description**:
Implement automatic temp project creation for mobile/tablet users or as fallback when no project is selected.

**Acceptance Criteria**:
- [ ] Mobile detection works (viewport or user agent)
- [ ] Temp project created with `alpha-temp-{timestamp}` ID
- [ ] Project persists in localStorage/IndexedDB
- [ ] ONE temp project only (not multiple on each visit)
- [ ] Virtual file system initialized for temp project
- [ ] Temp project banner shown in UI

**Technical Notes**:
- Use `storageType: 'virtual'` for in-memory/IndexedDB
- Project ID stored in localStorage for persistence
- Consider: `localStorage.getItem('alpha-temp-project')`

**Files to Create/Modify**:
- `src/lib/workspace/temp-project.ts` (new)
- `src/presentation/components/workspace/TempProjectBanner.tsx` (new)

---

### P1-04: Create Folder Picker Flow (Desktop)

**Priority**: P0
**Effort**: 3 hours
**Dependencies**: P1-01, P1-02

**Description**:
Implement FSA folder picker for desktop users with fallback to temp project.

**Acceptance Criteria**:
- [ ] Desktop users see folder picker dialog
- [ ] FSA `showDirectoryPicker()` called correctly
- [ ] Folder handle stored for persistence
- [ ] If permission denied → fallback to temp project with toast
- [ ] If accidentally hit route without project → fallback to temp
- [ ] Toast message: "No project selected, using temp project"

**Technical Notes**:
- FSA handle can be stored in IndexedDB for persistence
- Check `navigator.storage.getDirectory()` support
- Fallback chain: FSA → stored handle → temp project

**Files to Create/Modify**:
- `src/presentation/components/workspace/FolderPickerDialog.tsx` (new or modify)
- `src/lib/workspace/fsa-persistence.ts` (new)

---

### P1-05: Detach Complex Forms with Markers

**Priority**: P1
**Effort**: 2 hours
**Dependencies**: P1-03, P1-04

**Description**:
Comment out complex forms (wizard, binding dialogs) with standardized Phase 1 markers.

**Acceptance Criteria**:
- [ ] ProjectCreationWizard detached with marker
- [ ] WorkspaceBindingDialog detached with marker
- [ ] AgentSelectionStep detached with marker
- [ ] All markers follow standard format:
  ```typescript
  // ═══════════════════════════════════════════════════════════════
  // ⚠️ PHASE 1 DETACHMENT
  // Feature: [Feature Name]
  // Reason: [Why detached]
  // Re-attach in: Phase [2/3/4]
  // Gate: [What must pass]
  // Documentation: _bmad-output/project-planning-artifacts/sprint-change-proposal-2026-01-08.md
  // ═══════════════════════════════════════════════════════════════
  ```
- [ ] No compile errors from detached code

**Files to Modify**:
- `src/presentation/components/wizard/ProjectCreationWizard.tsx`
- Related wizard step components

---

### P1-06: Investigate and Document IDE Full CRUD

**Priority**: P1
**Effort**: 4 hours
**Dependencies**: P1-02
**Status**: IN_PROGRESS (investigation started)

**Description**:
Deep investigation of IDE capabilities: user CRUD, agent CRUD, edge cases, sync.

**Acceptance Criteria**:
- [ ] User CRUD verified in browser:
  - [ ] Create file works
  - [ ] Read file works
  - [ ] Update file works
  - [ ] Delete file works
- [ ] Agent CRUD chain traced:
  - [ ] Tool handlers identified
  - [ ] Permission system documented
  - [ ] File event propagation verified
- [ ] Edge cases documented:
  - [ ] Large file handling
  - [ ] Binary files
  - [ ] Sync conflicts
- [ ] Investigation report complete

**Current Findings**:
- `file-ops.ts` has mature CRUD implementation
- Routing is the blocker, not file operations
- Agent CRUD path needs tracing

**Files to Review**:
- `src/lib/filesystem/file-ops.ts` ✅
- `src/lib/filesystem/dir-ops.ts`
- `src/presentation/components/ide/FileTree.tsx`
- Agent tool handlers (location TBD)

---

### P1-07: Investigate and Document Notes Full CRUD

**Priority**: P1
**Effort**: 4 hours
**Dependencies**: P1-01

**Description**:
Deep investigation of Notes capabilities: user CRUD, AI features, persistence.

**Acceptance Criteria**:
- [ ] User CRUD verified in browser:
  - [ ] Create note works
  - [ ] Read note works
  - [ ] Update note works
  - [ ] Delete note works
- [ ] AI features chain traced:
  - [ ] Slash command triggers
  - [ ] API key retrieval path
  - [ ] Model selection path
- [ ] Note persistence verified:
  - [ ] Save persists to store
  - [ ] Refresh retains data
- [ ] Investigation report complete

**Files to Review**:
- `src/lib/notes/note-store.ts`
- `src/lib/notes/note-ai-service.ts`
- `src/presentation/components/notes/NoteEditor.tsx`
- AI slash command components

---

### P1-08: Trace Vault → AI Chain (BLOCKER INVESTIGATION)

**Priority**: P0-CRITICAL
**Effort**: 4 hours
**Dependencies**: None

**Description**:
Trace the complete chain from API key save to AI feature working. This is critical to understand why AI features fail.

**Acceptance Criteria**:
- [ ] Chain documented step-by-step:
  1. Settings page saves key → WHERE?
  2. Vault stores encrypted → HOW?
  3. Provider store notified → HOW?
  4. Agent config loads key → FROM WHERE?
  5. AI service reads config → HOW?
  6. API call made → WITH WHAT?
- [ ] Blockers identified at each step
- [ ] Simplification proposal for Phase 1 (if needed)

**Key Files to Trace**:
```
src/lib/agent/providers/credential-vault.ts (535 lines)
├── storeCredentials() - Encrypts and stores in IndexedDB
├── getCredentials() - Decrypts and returns
├── SSR guards - May block on server
└── Dependencies: credential-storage.ts, credential-encryption.ts

src/infrastructure/persistence/stores/providers/migrate-api-keys-to-vault.ts (389 lines)
├── isMigrationNeeded() - Checks if old apiKey fields exist
├── migrateApiKeysToVault() - Moves to vault
└── May not have run → keys still in old location

src/lib/notes/note-ai-service.ts
├── How does it get API key?
├── How does it get model?
└── Where is "API Key missing" thrown?
```

**Potential Blockers Found**:
1. `credentialVault.initialize()` has SSR guard - may skip on server
2. Migration may not have run - keys still in provider state
3. `getCredentials()` may return null if vault not ready

---

### P1-09: Simplify Agent/Key Flow for Phase 1

**Priority**: P1
**Effort**: 3 hours
**Dependencies**: P1-08

**Description**:
Based on P1-08 findings, simplify the agent/key flow to make AI features work in Phase 1.

**Acceptance Criteria**:
- [ ] API key can be saved in Settings
- [ ] AI slash command works in Notes
- [ ] No "API Key missing" error
- [ ] Simplified flow documented
- [ ] Complex vault logic preserved with markers (for Phase 3)

**Potential Solutions**:
1. Direct localStorage key storage (bypass vault for Phase 1)
2. Ensure vault migration runs on first load
3. Add explicit vault.initialize() before AI calls

---

### P1-10: Detach Knowledge/Study Workspaces

**Priority**: P2
**Effort**: 1 hour
**Dependencies**: None

**Description**:
Comment out Knowledge and Study workspace routes to focus on IDE + Notes in Phase 1.

**Acceptance Criteria**:
- [ ] `/knowledge` route returns "Coming in Phase 2" message
- [ ] `/study` route returns "Coming in Phase 2" message
- [ ] Original components preserved with markers
- [ ] No compile errors

**Files to Modify**:
- `src/routes/knowledge.lazy.tsx`
- `src/routes/study.lazy.tsx`

---

### P1-11: Verify Phase 1 Gate (Browser Testing)

**Priority**: P0
**Effort**: 3 hours
**Dependencies**: All other P1 stories

**Description**:
Final verification that all Phase 1 gate criteria pass via actual browser testing.

**Acceptance Criteria**:
**Routing Gate**:
- [ ] `/notes` renders (mobile: temp project, desktop: picker)
- [ ] `/notes/$projectId` renders with specific project
- [ ] `/ide` renders (mobile: temp project, desktop: picker)
- [ ] `/ide/$projectId` renders with specific project
- [ ] Unknown route falls back to temp project with toast

**IDE Gate**:
- [ ] User can CRUD files
- [ ] File tree shows files correctly
- [ ] Monaco editor loads file content
- [ ] Save writes to file system (FSA) or virtual

**Notes Gate**:
- [ ] User can CRUD notes
- [ ] Note sidebar shows notes
- [ ] BlockNote editor loads note content
- [ ] Auto-save persists changes
- [ ] AI slash command works (if P1-09 complete)

**No Errors Gate**:
- [ ] Zero "Maximum update depth exceeded"
- [ ] Zero console errors
- [ ] HMR doesn't break pages

---

### P1-12: Update Documentation and Workflow Status

**Priority**: P2
**Effort**: 2 hours
**Dependencies**: P1-11

**Description**:
Update all governance documents to reflect Phase 1 completion.

**Acceptance Criteria**:
- [ ] `bmm-workflow-status.yaml` updated with Phase 1 PASSED
- [ ] Investigation reports complete
- [ ] Detachment markers audited
- [ ] Sprint status updated
- [ ] Phase 2 ready to start

**Files to Update**:
- `bmm-workflow-status.yaml`
- `_bmad-output/sprint-artifacts/sprint-status.yaml`
- `AGENTS.md` (if needed)

---

## Story Dependency Graph

```
           ┌─────────┐     ┌─────────┐
           │ P1-01   │     │ P1-02   │
           │ Notes   │     │ IDE     │
           │ Routes  │     │ Routes  │
           └────┬────┘     └────┬────┘
                │               │
        ┌───────┴───────┬───────┴───────┐
        │               │               │
   ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
   │ P1-03   │    │ P1-04   │    │ P1-08   │
   │ Mobile  │    │ Desktop │    │ Vault   │
   │ Temp    │    │ FSA     │    │ Chain   │
   └────┬────┘    └────┬────┘    └────┬────┘
        │               │               │
        └───────┬───────┘               │
                │                       │
           ┌────▼────┐            ┌────▼────┐
           │ P1-05   │            │ P1-09   │
           │ Detach  │            │ Simplify│
           │ Forms   │            │ AI Flow │
           └────┬────┘            └────┬────┘
                │                       │
        ┌───────┴───────┐               │
        │               │               │
   ┌────▼────┐    ┌────▼────┐          │
   │ P1-06   │    │ P1-07   │          │
   │ IDE     │    │ Notes   │          │
   │ Invest  │    │ Invest  │          │
   └────┬────┘    └────┬────┘          │
        │               │               │
        └───────┬───────┴───────────────┘
                │
           ┌────▼────┐
           │ P1-10   │
           │ Detach  │
           │ Other   │
           └────┬────┘
                │
           ┌────▼────┐
           │ P1-11   │
           │ VERIFY  │
           │ GATE    │
           └────┬────┘
                │
           ┌────▼────┐
           │ P1-12   │
           │ DOCS    │
           └─────────┘
```

---

## Effort Summary

| Story | Title | Effort | Priority |
|-------|-------|--------|----------|
| P1-01 | Simplify Notes Routes | 2h | P0 |
| P1-02 | Simplify IDE Routes | 2h | P0 |
| P1-03 | Temp Project Mobile | 3h | P0 |
| P1-04 | FSA Picker Desktop | 3h | P0 |
| P1-05 | Detach Complex Forms | 2h | P1 |
| P1-06 | Investigate IDE CRUD | 4h | P1 |
| P1-07 | Investigate Notes CRUD | 4h | P1 |
| P1-08 | Trace Vault→AI Chain | 4h | P0-CRITICAL |
| P1-09 | Simplify AI Flow | 3h | P1 |
| P1-10 | Detach Knowledge/Study | 1h | P2 |
| P1-11 | Verify Gate (Browser) | 3h | P0 |
| P1-12 | Update Documentation | 2h | P2 |
| **TOTAL** | | **33h** | |

---

## Phase 1 Gate Criteria

**PHASE 1 PASSES WHEN:**

### Routing ✓
- [ ] `/notes` renders (using temp project on mobile, picker on desktop)
- [ ] `/notes/$projectId` renders with specific project
- [ ] `/ide` renders (using temp project on mobile, picker on desktop)
- [ ] `/ide/$projectId` renders with specific project
- [ ] Unknown route falls back to temp project with toast

### IDE ✓
- [ ] User can CRUD files (create, read, update, delete)
- [ ] File tree shows files correctly
- [ ] Monaco editor loads file content
- [ ] Save writes to file system (FSA) or virtual
- [ ] Agent CRUD documented and working OR blockers identified

### Notes ✓
- [ ] User can CRUD notes (create, read, update, delete)
- [ ] Note sidebar shows notes
- [ ] BlockNote editor loads note content
- [ ] Auto-save persists changes
- [ ] AI features documented and blockers identified

### No Errors ✓
- [ ] Zero "Maximum update depth exceeded"
- [ ] Zero console errors
- [ ] HMR doesn't break pages

### Documentation ✓
- [ ] IDE investigation report complete
- [ ] Notes investigation report complete
- [ ] Vault → AI chain documented
- [ ] All detached features have markers

---

*Epic created by BMAD Workflow*
*2026-01-08T20:13:00+07:00*
