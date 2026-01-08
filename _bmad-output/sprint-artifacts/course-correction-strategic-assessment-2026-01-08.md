---
title: "STRATEGIC COURSE CORRECTION: Diagnostic-Informed Priority Reset"
type: course_correction
priority: P0-BLOCKING
status: AWAITING_SPRINT_RESET
created: 2026-01-08T19:32:00+07:00
triggered_by: "Incomplete diagnostic phases + sprint planning misalignment"
phase: bmad_master_strategic_assessment
team: Team A
agents:
  - bmad-core-bmad-master (orchestrator)
  - bmad-bmm-pm (strategic prioritization)
  - bmad-bmm-sm (sprint restructuring)
  - bmad-bmm-architect (technical validation)
---

# STRATEGIC COURSE CORRECTION

## Context Assessment

### What the Diagnostics DID Find (Phases 0-3 ✅)

| Phase | Status | Key Finding |
|-------|--------|-------------|
| Phase 0: Structure | ✅ Complete | 1,564 files, 25 god files, 3 critical files >1000 lines |
| Phase 1: Journeys | ✅ Complete | Hub→Notes BYPASSES useWorkspaceAccess, Cross-workspace events DISABLED |
| Phase 2: Data Flow | ✅ Complete | useLiveQuery REMOVED, 144 Zustand stores, Event bus architecture documented |
| Phase 3: Performance | ✅ Complete | 8 lazy routes, 9.1/10 score, bundle optimized |

---

## The Fundamental Truth Gap

### What Users Actually Want

| User Goal | Fundamental Action | Current State |
|-----------|-------------------|---------------|
| Write notes with AI | Open Notes → Type → /summarize → Works | Can't open Notes (loop) |
| Study with flashcards | Open Study → See cards → Quiz | Can't open Study (broken route) |
| Manage knowledge | Open Knowledge → Add source → Search | Can't open Knowledge (broken route) |
| Code in IDE | Open IDE → Edit files → Run | Partially works |

### What Architecture Provides

| Pattern | Purpose | User Impact |
|---------|---------|-------------|
| Event-driven sync | Cross-workspace state coherence | DISABLED (infinite loop) |
| Unified AI service | Consistent AI across workspaces | NOT WIRED to vault |
| BYOK vault encryption | Secure API key storage | STORED but not READ by services |
| Project binding system | Multi-workspace project access | CREATES projects but Notes ignores |
| Clean Architecture layers | Maintainability | FRAGMENTED (half-migrated) |

### The Gap

**Architecture optimizes for "advanced" without ensuring "fundamental":**

```
ADVANCED (Built):
  - Event bus with 40+ event types
  - Correlation ID tracking
  - Cross-workspace transition manager
  - Agent workspace switching feedback
  - RAG embedding progress events

FUNDAMENTAL (Broken):
  - Click Notes → See my notes
  - Type /summarize → Get summary
  - Create project → Use in Notes
  - Save API key → AI works
```

**The UX/UI expects users to experience features, but architecture blocks access.**

### Resolution Principle

**Build UPWARD from fundamentals, not DOWNWARD from architecture:**

```
✅ CORRECT ORDER:
  1. User can open Notes
  2. User can type and save
  3. User can use AI (/summarize works)
  4. User can switch workspaces
  5. Then: optimize, unify, refactor

❌ CURRENT ORDER:
  1. Build event bus
  2. Build transition manager
  3. Build vault system
  4. Build slice patterns
  5. User still can't open Notes
```

---

### What the Diagnostics DID NOT Find (Phases 4-6 ❌)

| Phase | Status | MISSING |
|-------|--------|---------|
| Phase 4: Features | ⚠️ Partial | 4/6 workspaces documented, Hub + Agents MISSING |
| Phase 5: Integration | ❌ Empty | Cross-feature dependencies NOT mapped |
| Phase 6: Synthesis | ⚠️ Incomplete | Issue correlation basic, remediation plan superficial |

---

## CRITICAL GAP: Multi-Level Upstream Chains NOT Traced

The diagnostics traced **individual journeys** but NOT **cross-system chains** like:

### Example Chain 1: API Key → AI Features
```
User saves API key in Settings
    ↓
    WHERE does it go? → Vault? credential-vault.ts? provider-store.ts?
    ↓
User creates project
    ↓
    Does project creation TRIGGER any key validation?
    ↓
User opens Notes workspace
    ↓
    Does Notes route LOAD agent config?
    ↓
User tries AI slash command
    ↓
    WHERE does /summarize GET the API key from?
    ↓
    note-ai-service.ts → ??? → provider API call
    ↓
    FAILURE: "API Key missing" - WHY?
```

**This chain was NOT traced.** The diagnostics found that:
- Vault exists (Phase 2: dexie-analysis.md)
- AI Slash Commands exist (Phase 4: notes-workspace-features.md)
- Agent config exists (Phase 2: zustand-inventory.md)

But NOBODY traced: **Does the AI service actually READ the vault?**

### Example Chain 2: Project Creation → Workspace Access
```
User creates project in wizard
    ↓
    ProjectCreationWizard.tsx saves to Dexie (Phase 1 documented)
    ↓
User navigates to /notes
    ↓
    notes.lazy.tsx → StableNotesWorkspace (documented)
    ↓
    StableNotesWorkspace uses useNoteStore
    ↓
    useNoteStore.loadNotes(projectId)
    ↓
    BUT: projectId is HARDCODED to 'default-notes' (Phase 1: line 77)
    ↓
    PROBLEM: New project's notes WON'T load because projectId is wrong!
```

**This was PARTIALLY traced** in Phase 1 but NOT flagged as a BLOCKER:
> "StableNotesWorkspace uses direct `useNoteStore` access + hardcoded projectId"

### Example Chain 3: Cross-Workspace Agent Sync
```
User configures agent in Settings
    ↓
    AgentConfigStore updated
    ↓
    crossWorkspaceEventBus.emitAgentConfigChange()
    ↓
    BUT: Listeners are DISABLED (Phase 1: journey-cross-workspace.md)
    ↓
    Notes workspace NEVER receives the update
    ↓
    User's agent selection in Notes is STALE
```

**This WAS traced** but marked as P0 without actionable fix:
> "🔴 P0 - Cross-Workspace Events DISABLED"

---

## The Sprint Planning Failure

### Current Sprint Status Claims (FALSE)

| Epic | Claimed Status | Reality |
|------|----------------|---------|
| EPIC-30 (P0 Critical Fixes) | "100% DONE" | **FALSE**: Routes still broken |
| EPIC-38 (Clean Architecture) | "IN_PROGRESS" | **WRONG PRIORITY**: Should be PAUSED |
| EPIC-31 (AI Service Unification) | "IN_PROGRESS" | **BLOCKED**: Can't test without working routes |

### Why These Are Wrong

1. **EPIC-30 validated CODE EXISTENCE, not RUNTIME BEHAVIOR**
   - Story 30-01: "ErrorBoundaries 100%" ← But routes still crash
   - Story 30-03: "Redirect loop prevention" ← But workspace-access-helper is broken
   - Story 30-04: "BYOK vault integration" ← But AI features can't read keys

2. **EPIC-38 creates MORE fragmentation**
   - Splitting stores when the slices aren't wired
   - Cleaning types when the data flow is broken
   - Architecture improvements on a foundation that doesn't work

3. **Missing the CRITICAL path**
   - No epic for: "Make Notes workspace load and save notes"
   - No epic for: "Make AI features work end-to-end"
   - No epic for: "Make project creation → workspace navigation work"

---

## STRATEGIC REMEDIATION PLAN

### Philosophy Change: User-Access-First

```
OLD APPROACH (Wrong):
  Clean Architecture → Split Stores → Type Safety → Features

NEW APPROACH (Correct):
  Feature Access → Data Flow → Stability → Then Architecture
```

### NEW BLOCKING EPIC: EPIC-STAB (Stability)

**Objective:** Make ONE complete user journey work end-to-end before ANY architecture work.

**Target Journey:**
```
Open App → Hub → Create Project → Open Notes → Write Note → Use AI → Save → Refresh → Note Still There
```

#### Story STAB-01: Fix Notes Route Loading
**Acceptance Criteria (BROWSER VERIFIED):**
- [ ] Navigate to `/notes` → Page renders without console errors
- [ ] Navigate to `/notes` → No "Maximum update depth exceeded" 
- [ ] Navigate to `/notes` → Editor loads within 2 seconds

**Technical Fix:**
- Restore `workspace-access-helper.tsx` with proper `useLiveQuery` handling
- OR keep bypass but with correct `projectId` from URL/store

#### Story STAB-02: Fix Project → Workspace Data Flow
**Acceptance Criteria (BROWSER VERIFIED):**
- [ ] Create project in wizard → Navigate to Notes → Notes list shows project's notes
- [ ] Project selector in Notes → Change project → Notes list updates

**Technical Fix:**
- Remove hardcoded `projectId = 'default-notes'`
- Wire `projectId` from route params or ProjectContext

#### Story STAB-03: Fix API Key → AI Service Chain
**Acceptance Criteria (BROWSER VERIFIED):**
- [ ] Save API key in Settings → Navigate to Notes → AI slash command works
- [ ] No "API Key missing" error when using /summarize

**Technical Fix:**
- Trace: Settings save → vault.store() → AgentConfigStore → note-ai-service.ts
- Find and fix the break in this chain

#### Story STAB-04: Re-enable Cross-Workspace Sync
**Acceptance Criteria (BROWSER VERIFIED):**
- [ ] Change agent in Settings → Navigate to Notes → Agent selector shows new selection
- [ ] No infinite loop when enabling `useAllCrossWorkspaceEvents()`

**Technical Fix:**
- Use individual Zustand selectors instead of `getState()`
- Re-enable event listeners

#### Story STAB-05: End-to-End Verification
**Acceptance Criteria (BROWSER VERIFIED):**
- [ ] Complete journey: Hub → Create → Notes → AI → Save → Refresh → Data persists
- [ ] No console errors throughout journey
- [ ] All actions complete in <2 seconds

---

## Sprint Priority Reset

### PAUSED (Do NOT work on)
- EPIC-38: Clean Architecture (blocked by broken foundation)
- EPIC-31: AI Service Unification (blocked by STAB-03)
- Any store splitting
- Any component decomposition
- Any type cleanup

### ACTIVE (Work on NOW)
- **EPIC-STAB: Stability** (NEW - P0-BLOCKING)
  - STAB-01: Fix Notes Route Loading
  - STAB-02: Fix Project Data Flow
  - STAB-03: Fix API Key Chain
  - STAB-04: Re-enable Sync
  - STAB-05: E2E Verification

### NEXT (After EPIC-STAB complete)
- EPIC-30: Re-verify all stories with BROWSER tests (not code grep)
- Complete Phase 4-6 diagnostics with cross-system chain tracing

---

## Verification Protocol

**Every story in EPIC-STAB requires:**

1. **Browser Test** - Actually use the feature
2. **Console Check** - Zero errors, zero warnings
3. **HMR Test** - Hot Module Reload doesn't break it
4. **Refresh Test** - Data persists after page refresh
5. **Navigation Test** - Leave workspace and return

**NOT acceptable:**
- "The code exists"
- "TypeScript compiles"
- "Tests pass" (if tests don't cover runtime)
- "Matches pattern in grep"

---

## Diagnostic Gap Remediation

### Complete Phase 4 (Feature Analysis)
- [ ] Hub/Landing features
- [ ] Agent configuration features
- [ ] Create phase-4-summary.md

### Complete Phase 5 (Integration Analysis)
- [ ] Cross-feature dependencies
- [ ] Shared infrastructure analysis
- [ ] Create phase-5-summary.md

### Complete Phase 6 (Synthesis)
- [ ] Issue correlation with CROSS-SYSTEM chains
- [ ] Remediation plan with RUNTIME verification
- [ ] Create FINAL-REPORT.md (replace current incomplete version)

---

## Architect's Honest Assessment

### What's Actually Broken

| System | Status | Evidence |
|--------|--------|----------|
| Notes Route | ⚠️ Works with bypass | hardcoded projectId, useWorkspaceAccess disabled |
| IDE Route | ❌ Broken | workspace-access-helper returns 'no_projects' |
| Knowledge Route | ❌ Broken | Same as IDE |
| Study Route | ❌ Broken | Same as IDE |
| API Key → AI | ❓ Unknown | Chain not traced |
| Cross-Workspace Sync | ❌ Disabled | Event listeners commented out |
| Project Creation → Navigation | ⚠️ Partial | Works but projectId not propagated to Notes |

### What's Actually Working

| System | Status | Evidence |
|--------|--------|----------|
| Hub page | ✅ Works | Project cards render |
| Project Wizard | ✅ Works | Creates project in Dexie |
| BlockNote Editor | ✅ Works | When reached, editor loads |
| AI Slash Commands | ✅ Code exists | Not verified runtime |
| Vault | ✅ Code exists | Not verified runtime integration |

### The Half-Refactored Slices Problem

From Phase 2 diagnostic:
```
God stores still present:
- rag-store.ts (legacy) - 1,595 lines - "Already split" ← IS IT MIGRATED?
- conversation-store.ts - 626 lines - "Epic CC-1" ← STARTED? WIRED?
- conversation-threads-store.ts - 726 lines - "Epic CC-1" ← STARTED? WIRED?
- project-store.ts - 450 lines - "Epic CP-1" ← STARTED? WIRED?
```

**These "already split" claims need verification:**
- Are the slices USED anywhere?
- Is the old god store DEPRECATED?
- Are there DUPLICATE implementations?

---

## Next Actions

1. **ACKNOWLEDGE** this course correction
2. **PAUSE** all architecture work (EPIC-38, EPIC-31)
3. **CREATE** EPIC-STAB in epics.md
4. **START** Story STAB-01 immediately
5. **UPDATE** sprint-status.yaml to reflect new priorities
6. **COMPLETE** Phase 4-6 diagnostics with cross-system chain tracing

---

*Course Correction by BMAD Master + PM + Architect*
*2026-01-08T19:32:00+07:00*
