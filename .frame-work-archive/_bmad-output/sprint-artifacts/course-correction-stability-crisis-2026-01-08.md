---
title: "COURSE CORRECTION: Codebase Stability Crisis"
type: course_correction
priority: P0-BLOCKING
status: INITIATED
created: 2026-01-08T19:24:00+07:00
triggered_by: "Feature inaccessibility despite 'completed' sprints"
phase: bmad_master_assessment
team: Team A
agent: bmad-core-bmad-master
---

# ⚠️ CRITICAL COURSE CORRECTION

## Executive Assessment (BMAD Master)

**The project is in a CRISIS state.** Sprint status shows "EPIC-30 Complete" with all stories marked DONE, but the actual application is **unusable**:

| Claimed Status | Actual Reality |
|----------------|----------------|
| "ErrorBoundaries 100% coverage" | Routes crash with Maximum update depth exceeded |
| "Redirect loop prevention verified" | Infinite loops still occurring |
| "BYOK vault integration complete" | API Key not loading to AI features |
| "Race conditions fixed" | useLiveQuery still causing re-render cascades |
| "Cross-workspace sync working" | Disabled/commented out to prevent crashes |

### Root Cause: **Document-Reality Disconnect**

The sub-agents validated code **existence** but not **runtime behavior**. Stories were marked DONE based on:
- Code grep patterns matching expected patterns
- File existence checks
- TypeScript compilation success

But NOT validated against:
- Actual user journey completion
- Runtime error-free execution
- Feature accessibility in browser
- End-to-end data flow

---

## Current State Analysis

### P0 BLOCKERS (Users Cannot Access Features)

| Blocker | Location | Symptom | Root Cause |
|---------|----------|---------|------------|
| **Notes won't load** | `/notes` | Infinite spinner | `useLiveQuery` + `useWorkspaceAccess` loop |
| **IDE won't load** | `/ide` | Infinite spinner | Same as Notes |
| **BlockNote editor** | Notes workspace | Editor never initializes | Route never reaches stable state |
| **AI features** | All workspaces | "API Key missing" | Agent config not loading from vault |
| **Project creation** | Hub → any workspace | Redirect loops | Multiple conflicting auto-create paths |

### Why "Completed" Stories are FALSE

**Story 30-03 (Redirect Loop Prevention):**
- Code EXISTS at `workspace-access-helper.tsx:235,272,296`
- But `isRedirecting` flag is bypassed by `useLiveQuery` subscription
- Query updates → status changes → useEffect fires → navigation → query updates (LOOP)

**Story 30-04 (BYOK Vault Integration):**
- Vault code EXISTS at `provider-credentials-slice.ts`
- But vault is never READ during AI feature initialization
- Agent config uses hardcoded/stale data, not vault

**Story 30-05 (Race Conditions):**
- Event bus code EXISTS
- But `useAllCrossWorkspaceEvents` is COMMENTED OUT in multiple files
- Because enabling it causes infinite loops (the "fix" was disabling)

---

## Strategic Assessment (PM + Architect Perspective)

### The Fundamental Problem

**We have been building HORIZONTAL BREADTH instead of VERTICAL DEPTH.**

| Horizontal (Wrong) | Vertical (Right) |
|-------------------|------------------|
| Add ErrorBoundaries to all routes | Make ONE route work 100% |
| Create 9 epics with 86 stories | Complete 1 epic with 6 stories VERIFIED |
| Document all architecture | Implement ONE data flow correctly |
| Plan all features | Ship ONE feature users can actually use |

### Architecture Debt Cascade

```
useLiveQuery instability
    ↓
Caused: workspace-access-helper to be "patched" with guards
    ↓
Caused: Guards not sufficient → disabled features
    ↓
Caused: Cross-workspace events disabled
    ↓
Caused: Agent config not syncing
    ↓
Caused: AI features not working
    ↓
Result: NOTHING WORKS despite "completed" code
```

---

## Course Correction Strategy

### NEW APPROACH: **Single Feature Depth-First**

**Goal:** ONE complete user journey works 100% from login to feature use.

**Target Journey:** `Hub → Notes → Create Note → AI Assist → Save`

This requires:
1. ✅ Hub loads without errors
2. ✅ Notes route loads without infinite loops
3. ✅ BlockNote editor initializes
4. ✅ Note can be created and saved
5. ✅ AI features work (agent config loads from vault)
6. ✅ Note persists on refresh

### Implementation Order (Strict Sequence)

| Phase | Focus | Blocker Resolved | Verification |
|-------|-------|------------------|--------------|
| 1 | Fix `useLiveQuery` in `workspace-access-helper` | No more undefined → status flapping | Route loads to stable state |
| 2 | Simplify Notes route | Bypass all problematic hooks | Notes UI renders, no loops |
| 3 | Wire BlockNote correctly | Editor initializes | Can type in editor |
| 4 | Wire note persistence | `useNoteStore` works | Note saves to Dexie |
| 5 | Wire agent config loading | Vault → AgentConfigStore | AI features see API key |
| 6 | Wire AI features | Agent config → Chat panel | AI responds to prompts |
| 7 | Wire cross-workspace sync | Events work without loops | State persists across nav |

### Verification Gates

**Gate 1: Route Stabilization (Phase 1-2)**
- [ ] `/notes` loads without console errors
- [ ] No "Maximum update depth exceeded"
- [ ] Page renders within 2 seconds
- [ ] HMR doesn't break the page

**Gate 2: Editor Functional (Phase 3-4)**
- [ ] BlockNote editor visible
- [ ] Can type text
- [ ] Can save note
- [ ] Note appears in sidebar
- [ ] Refresh maintains note

**Gate 3: AI Working (Phase 5-6)**
- [ ] API key visible in settings
- [ ] Agent config loads correctly
- [ ] Chat panel shows agent
- [ ] AI responds to message

**Gate 4: System Stable (Phase 7)**
- [ ] Nav to IDE and back works
- [ ] Cross-workspace events don't loop
- [ ] All features still work

---

## Remediation Epic

### EPIC-99: STABILITY REMEDIATION (P0-BLOCKING)

**Objective:** Make the Notes workspace fully functional end-to-end.

**NOT included:** Other workspaces (IDE, Knowledge, Study) - they will be addressed AFTER Notes works.

#### Stories

**Story 99-01: Fix useLiveQuery Reactivity**
- File: `src/lib/workspace/workspace-access-helper.tsx`
- Task: Replace `useLiveQuery` with stable Zustand selector pattern
- Verification: Route loads without status flapping

**Story 99-02: Stabilize Notes Route**
- File: `src/routes/notes.lazy.tsx`
- Task: Use StableNotesWorkspace bypassing useWorkspaceAccess
- Verification: Notes UI renders, no loops

**Story 99-03: Wire BlockNote Editor**
- File: `src/presentation/components/notes/NoteEditor.tsx`
- Task: Ensure editor lazy-loads and initializes correctly
- Verification: Can type in editor

**Story 99-04: Wire Note Persistence**
- File: `src/lib/notes/note-store.ts`
- Task: Ensure CRUD operations work with Dexie
- Verification: Notes save and load on refresh

**Story 99-05: Wire Agent Config from Vault**
- File: `src/infrastructure/persistence/stores/agents/`
- Task: Ensure AgentConfigStore reads from vault on init
- Verification: API key visible in agent config

**Story 99-06: Wire AI Chat Panel**
- File: `src/presentation/components/chat/UnifiedChatPanel.tsx`
- Task: Ensure chat uses correct agent config
- Verification: AI responds to messages

**Story 99-07: Enable Cross-Workspace Events (Safely)**
- File: `src/lib/events/use-cross-workspace-events.ts`
- Task: Re-enable with proper selector patterns
- Verification: Events work without infinite loops

---

## Updated Sprint Status

### Current Sprint: PAUSED

All other work STOPS until EPIC-99 is complete.

### Priority Re-ordering

| Old Priority | New Priority | Reason |
|--------------|--------------|--------|
| EPIC-38 (Clean Architecture) | DEPRIORITIZED | Useless if app doesn't work |
| EPIC-31 (AI Service) | DEPRIORITIZED | Can't test if features broken |
| EPIC-30 (P0 Fixes) | FALSELY MARKED COMPLETE | Actual work in EPIC-99 |
| **EPIC-99 (Stability)** | **P0-BLOCKING** | Everything depends on this |

---

## Orchestration Plan

### Agent Assignments

| Phase | Agent | Task |
|-------|-------|------|
| 99-01 | @bmad-bmm-architect | Design stable data fetching pattern |
| 99-01 | @bmad-bmm-dev | Implement pattern in workspace-access-helper |
| 99-02 | @bmad-bmm-dev | Update notes.lazy.tsx |
| 99-03 | @bmad-bmm-dev | Verify BlockNote integration |
| 99-04 | @bmad-bmm-dev | Verify note-store operations |
| 99-05 | @bmad-bmm-architect | Trace agent config flow |
| 99-05 | @bmad-bmm-dev | Fix vault → store wiring |
| 99-06 | @bmad-bmm-dev | Wire chat panel |
| 99-07 | @bmad-bmm-architect | Design safe event pattern |
| 99-07 | @bmad-bmm-dev | Implement and verify |
| ALL | @code-reviewer | **RUNTIME VERIFICATION** not just code grep |

### Verification Protocol

**Every story requires:**
1. Code change implemented
2. **Browser test** - navigate to feature, USE it
3. **Console check** - no errors, no warnings
4. **3-minute soak** - HMR doesn't break it
5. **Refresh test** - state persists correctly
6. **Navigation test** - leave and return works

**NOT acceptable:**
- "Code exists, looks correct"
- "TypeScript compiles"
- "Grep pattern matches"
- "File was created"

---

## Immediate Next Actions

1. **STOP** all other work
2. **ACKNOWLEDGE** the current state is broken
3. **BEGIN** Story 99-01 immediately
4. **UPDATE** sprint-status.yaml with this course correction
5. **TRACK** with browser-verified completion

---

## Appendix: Files Requiring Changes

### P0 (Must Fix for Notes to Work)

| File | Issue | Action |
|------|-------|--------|
| `src/lib/workspace/workspace-access-helper.tsx` | useLiveQuery instability | Replace with Zustand selector |
| `src/routes/notes.lazy.tsx` | Uses broken useWorkspaceAccess | Use StableNotesWorkspace |
| `src/routes/__root.tsx` | OfflineIndicator may cause re-renders | Temporarily disable |
| `src/lib/events/use-cross-workspace-events.ts` | Commented out / breaks on enable | Fix event handler pattern |

### P1 (Required for AI Features)

| File | Issue | Action |
|------|-------|--------|
| `src/infrastructure/persistence/stores/agents/` | Vault not read on init | Add vault read on store init |
| `src/presentation/components/chat/UnifiedChatPanel.tsx` | Agent config not wiring | Trace and fix data flow |

---

*Course Correction initiated by BMAD Master*
*2026-01-08T19:24:00+07:00*
