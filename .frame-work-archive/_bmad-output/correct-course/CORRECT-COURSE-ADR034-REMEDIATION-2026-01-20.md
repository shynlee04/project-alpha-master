# CORRECT-COURSE: ADR-034 Architectural Remediation

**Document ID:** `CC-ADR034-REM-2026-01-20`
**Created:** 2026-01-20
**Status:** APPROVED FOR EXECUTION
**Authority:** Architect Agent
**Target:** Sprint-Manager → Dev Teams (A & B)
**Governance:** BMAD Framework v2.0

---

## PART 1: SITUATION ANALYSIS

### 1.1 What Happened

An independent architecture review conducted on 2026-01-20 revealed critical gaps between:
- **ADR-034 design intent** (Project-Centric Architecture)
- **EPIC-ARCH-01 claimed completion** (Foundation Cleanup)
- **Actual codebase state** (Parallel architectures coexisting)

### 1.2 Independent Review Verdict

| Metric | ADR-033 (Old) | ADR-034 (Designed) | Current Reality |
|--------|--------------|-------------------|-----------------|
| Architecture Model | Workspace-Centric | Project-Centric | **Both coexist** |
| Entry Points | 9 routes | 2 routes | **9 routes (unchanged)** |
| Plugins Implemented | N/A | 5+ planned | **0 implemented** |
| Route Consolidation | No | Yes | **No (unchanged)** |
| window.location.href | 11+ instances | 0 planned | **NEW violation in new code** |

### 1.3 Root Cause

> **"EPIC-ARCH-01 created NEW infrastructure alongside OLD architecture without removing or migrating to it. This is parallel development, not architectural remediation."**

The dev team built:
- ✅ ProjectContext provider (342 lines) - **UNUSED**
- ✅ Plugin registry (203 lines) - **UNUSED**
- ✅ ProjectHandleService (319 lines) - **NOT INTEGRATED**
- ✅ FeaturePlugin interface (259 lines) - **NO IMPLEMENTATIONS**

But all 9 routes still import OLD `ProjectProvider` from `@/lib/workspace/ProjectContext`.

---

## PART 2: EPIC-ARCH-01 STATUS CORRECTION

### 2.1 Relabeling Required

| Original Label | Corrected Label |
|---------------|-----------------|
| "EPIC-ARCH-01: Foundation Cleanup - **COMPLETE**" | "EPIC-ARCH-01: Foundation Infrastructure - **READY FOR INTEGRATION**" |

### 2.2 Story-by-Story Reassessment

| Story | Claimed | Actual | Corrected Status |
|-------|---------|--------|------------------|
| ARCH-01-01 | ✅ Remove window.location.href | 8 navigation uses fixed, 3 legitimate uses remain | ✅ PASS |
| ARCH-01-02 | ✅ Consolidate creation paths | Deprecation warnings added, paths still functional | ⚠️ PARTIAL - Deprecation only |
| ARCH-01-03 | ✅ Archive Knowledge/Study UI | Redirects exist, UI elements still visible in code | ⚠️ PARTIAL - Redirects only |
| ARCH-01-04 | ✅ Simplify wizard | AgentSelectionStep still exists (per user confirmation OK) | ✅ PASS (accepted) |
| ARCH-01-05 | ✅ Sync project pointers | ProjectHandleService created but NOT integrated | ⚠️ PARTIAL - Service exists |
| ARCH-01-06 | ✅ Fix TypeScript errors | IDEStateRecord exported, fsaHandle removed | ✅ PASS |

**Overall:** 3 PASS, 3 PARTIAL = **INFRASTRUCTURE READY, NOT ARCHITECTURE COMPLETE**

### 2.3 Critical Violations Found

#### Violation 1: window.location.href in NEW Code

**File:** `src/infrastructure/context/project-context.tsx`
**Line:** 313
**Code:**
```typescript
// VIOLATION: New code introduced window.location.href
onClick={() => window.location.href = '/'}
```
**Required Fix:**
```typescript
// Use TanStack Router navigate()
onClick={() => navigate({ to: '/' })}
```

#### Violation 2: File Extension Errors

**Files:** 
- `src/infrastructure/context/project-context.tsx` (should be `.ts`)
- `src/infrastructure/context/use-project-context.ts` (imports reference wrong paths)

**Required Fix:**
```bash
# Rename files OR fix import paths
# Option A: Rename to .ts (if no JSX)
# Option B: Keep .tsx and fix imports to include extension
```

---

## PART 3: ADR-034 PATCH

### 3.1 Phase Sequencing Correction

**Original ADR-034 Phases:**
```
Phase 1 (Week 1-2): Foundation Infrastructure
Phase 2 (Week 3-4): Feature Plugins
Phase 3 (Week 5-6): Layout System
Phase 4 (Week 7-8): Cleanup & Route Migration
```

**Problem:** Route migration deferred to Week 7-8 means 6 weeks of parallel development with no proof that new architecture works.

**Corrected ADR-034 Phases:**
```
Phase 1 (Week 1-2): Foundation Infrastructure ✅ COMPLETE
Phase 2 (Week 3-4): Feature Plugins + PROOF-OF-CONCEPT ROUTE MIGRATION
Phase 3 (Week 5-6): Remaining Route Migrations + Layout System
Phase 4 (Week 7-8): Cleanup, Testing, Documentation
```

### 3.2 ADR-034 Amendment

Add to ADR-034 Section "Implementation Phases":

```markdown
### Phase 2: Feature Plugins (Week 3-4) - EPIC-ARCH-02 [AMENDED]

**Critical Addition:** Each plugin story MUST include route integration proof:

- [ ] Define FeaturePlugin interface ✅ DONE
- [ ] Create Plugin Registry ✅ DONE
- [ ] Create ProjectContext Provider ✅ DONE (needs file fix)
- [ ] Convert FileTree to Plugin + **MIGRATE notes.$projectId route**
- [ ] Convert Monaco to Plugin + **MIGRATE ide.$projectId route**
- [ ] Convert Notes/BlockNote to Plugin
- [ ] Convert Terminal to Plugin
- [ ] Convert Chat to Plugin

**Gate:** At least 2 routes must use new ProjectContextProvider before Phase 3.
```

### 3.3 ADR-034 File Update Required

**File:** `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md`

**Add after line 166:**
```markdown
### Phase 2 Amendment (2026-01-20)

Based on independent architecture review, Phase 2 now includes mandatory route migration:

**ARCH-02-04:** FileTree Plugin + notes.$projectId route migration
**ARCH-02-05:** Monaco Plugin + ide.$projectId route migration

This ensures new architecture is proven before building additional plugins.
```

---

## PART 4: EPIC-ARCH-02 REMEDIATION STORIES

### 4.1 Immediate Fixes (Before Continuing)

#### Story: ARCH-02-FIX-01 (P0, IMMEDIATE)
**Title:** Fix window.location.href Violation in ProjectContext
**Team:** Any (first available)
**Effort:** 15 minutes
**Timebox:** 30 minutes max

**Context:**
- File: `src/infrastructure/context/project-context.tsx`
- Line: ~313 (in error boundary fallback)
- Issue: Uses `window.location.href = '/'` instead of `navigate()`

**Acceptance Criteria:**
- [ ] Replace `window.location.href = '/'` with router navigation
- [ ] Import `useNavigate` from `@tanstack/react-router`
- [ ] TypeScript compiles (0 new errors)
- [ ] No other `window.location.href` in this file

**Implementation:**
```typescript
// At top of file, add:
import { useNavigate } from '@tanstack/react-router';

// In component, add:
const navigate = useNavigate();

// Replace line ~313:
// BEFORE:
onClick={() => window.location.href = '/'}
// AFTER:
onClick={() => navigate({ to: '/' })}
```

---

#### Story: ARCH-02-FIX-02 (P0, IMMEDIATE)
**Title:** Fix File Extension/Import Issues in ProjectContext
**Team:** Any (first available)
**Effort:** 15 minutes
**Timebox:** 30 minutes max

**Context:**
- Files have .tsx extension but may not need JSX
- Imports reference paths without extensions

**Acceptance Criteria:**
- [ ] All imports in `use-project-context.ts` resolve correctly
- [ ] TypeScript compiles (0 errors from these files)
- [ ] Files can be imported by other modules

**Verification Command:**
```bash
pnpm tsc --noEmit 2>&1 | grep -E "(project-context|use-project-context)"
# Expected: No errors
```

---

### 4.2 Modified ARCH-02-04 (Critical Path)

#### Story: ARCH-02-04 (P0, CRITICAL PATH)
**Title:** Convert FileTree to Plugin + Migrate notes.$projectId Route
**Team:** Team A
**Effort:** 6 hours (increased from 4h)
**Timebox:** 8 hours max
**Depends On:** ARCH-02-FIX-01, ARCH-02-FIX-02, ARCH-02-03

**Context:**
This story is the **PROOF OF CONCEPT** for ADR-034. It must demonstrate:
1. FileTree works as a FeaturePlugin
2. notes.$projectId route uses NEW ProjectContextProvider
3. OLD ProjectProvider is NOT imported in this route

**Files to Create:**
```
src/plugins/filetree/index.ts
src/plugins/filetree/FileTreePlugin.tsx
src/plugins/filetree/useFileTreePlugin.ts
src/plugins/filetree/types.ts
```

**Files to Modify:**
```
src/routes/notes.$projectId.tsx  (CRITICAL: Must use new context)
```

**Acceptance Criteria:**
- [ ] FileTreePlugin implements FeaturePlugin interface
- [ ] FileTreePlugin registered in plugin-registry on app startup
- [ ] `notes.$projectId.tsx` imports `ProjectContextProvider` from `@/infrastructure/context`
- [ ] `notes.$projectId.tsx` does NOT import `ProjectProvider` from `@/lib/workspace`
- [ ] FileTreePlugin renders and functions within new context
- [ ] File tree loads project files correctly
- [ ] File selection works
- [ ] TypeScript: 0 errors
- [ ] Route functions end-to-end (manual test)

**Migration Pattern:**
```typescript
// notes.$projectId.tsx - BEFORE (OLD)
import { ProjectProvider } from '@/lib/workspace/ProjectContext';

export function NotesProjectRoute() {
  return (
    <ProjectProvider projectId={projectId}>
      <NotesPage />
    </ProjectProvider>
  );
}

// notes.$projectId.tsx - AFTER (NEW)
import { ProjectContextProvider } from '@/infrastructure/context/project-context';
import { FileTreePlugin } from '@/plugins/filetree';

export function NotesProjectRoute() {
  return (
    <ProjectContextProvider projectId={projectId}>
      <NotesLayout>
        <FileTreePlugin.MainComponent />
        <NotesEditor />
      </NotesLayout>
    </ProjectContextProvider>
  );
}
```

**Verification:**
```bash
# 1. TypeScript check
pnpm tsc --noEmit

# 2. Grep for old import (should return 0 matches in this file)
grep -n "from '@/lib/workspace/ProjectContext'" src/routes/notes.\$projectId.tsx
# Expected: No matches

# 3. Grep for new import (should return 1 match)
grep -n "from '@/infrastructure/context" src/routes/notes.\$projectId.tsx
# Expected: 1 match
```

---

### 4.3 Modified ARCH-02-05 (Critical Path)

#### Story: ARCH-02-05 (P0, CRITICAL PATH)
**Title:** Convert Monaco to Plugin + Migrate ide.$projectId Route
**Team:** Team B
**Effort:** 6 hours (increased from 4h)
**Timebox:** 8 hours max
**Depends On:** ARCH-02-04 (must complete first to validate pattern)

**Context:**
Second route migration proving the pattern works for IDE (FSA) projects.

**Files to Create:**
```
src/plugins/monaco/index.ts
src/plugins/monaco/MonacoPlugin.tsx
src/plugins/monaco/useMonacoPlugin.ts
```

**Files to Modify:**
```
src/routes/ide.$projectId.tsx  (CRITICAL: Must use new context)
```

**Acceptance Criteria:**
- [ ] MonacoPlugin implements FeaturePlugin interface
- [ ] MonacoPlugin registered in plugin-registry
- [ ] `ide.$projectId.tsx` imports `ProjectContextProvider` from `@/infrastructure/context`
- [ ] `ide.$projectId.tsx` does NOT import `ProjectProvider` from `@/lib/workspace`
- [ ] MonacoPlugin opens files from FileTree selection
- [ ] File saving works via ProjectContext.saveFile()
- [ ] TypeScript: 0 errors
- [ ] FSA project loads and edits files (manual test)

---

### 4.4 Remaining ARCH-02 Stories (Unchanged)

| Story | Title | Team | Effort | Depends On |
|-------|-------|------|--------|------------|
| ARCH-02-06 | Convert Notes/BlockNote to Plugin | A | 4h | ARCH-02-04 |
| ARCH-02-07 | Convert Terminal to Plugin | B | 3h | ARCH-02-05 |
| ARCH-02-08 | Convert Chat to Plugin | A | 4h | ARCH-02-04 |
| ARCH-02-09 | Create PluginLayout Container | B | 4h | ARCH-02-06,07,08 |
| ARCH-02-10 | Create Project Route (/$projectId) | A | 3h | ARCH-02-09 |

---

## PART 5: EXECUTION PLAN

### 5.1 Immediate Actions (Today)

| Priority | Story | Team | Effort | Gate |
|----------|-------|------|--------|------|
| 🔴 P0 | ARCH-02-FIX-01 (window.location.href) | Any | 15m | TypeScript compiles |
| 🔴 P0 | ARCH-02-FIX-02 (file extensions) | Any | 15m | TypeScript compiles |

### 5.2 Critical Path (This Sprint)

| Order | Story | Team | Effort | Gate |
|-------|-------|------|--------|------|
| 1 | ARCH-02-04 (FileTree + notes route) | A | 6h | Route uses new context |
| 2 | ARCH-02-05 (Monaco + ide route) | B | 6h | Route uses new context |

**Phase 2 Gate:** At least 2 routes using new ProjectContextProvider before proceeding.

### 5.3 Parallel Execution (After Gate)

| Story | Team | Depends On |
|-------|------|------------|
| ARCH-02-06 (Notes Plugin) | A | ARCH-02-04 |
| ARCH-02-07 (Terminal Plugin) | B | ARCH-02-05 |
| ARCH-02-08 (Chat Plugin) | A | ARCH-02-04 |

### 5.4 Final Stories

| Story | Team | Depends On |
|-------|------|------------|
| ARCH-02-09 (PluginLayout) | B | ARCH-02-06,07,08 |
| ARCH-02-10 (/$projectId route) | A | ARCH-02-09 |

---

## PART 6: SUCCESS CRITERIA

### 6.1 EPIC-ARCH-02 Completion Criteria

| Criterion | Verification | Required |
|-----------|--------------|----------|
| 0 window.location.href in new code | `grep -r "window.location.href" src/infrastructure/` returns 0 | ✅ |
| 2+ routes use new ProjectContextProvider | Grep for new import in route files | ✅ |
| 5 plugins implemented | `ls src/plugins/*/index.ts` returns 5 | ✅ |
| TypeScript compiles | `pnpm tsc --noEmit` returns 0 errors | ✅ |
| Manual test: notes route works | Navigate to /notes/$projectId, load files | ✅ |
| Manual test: ide route works | Navigate to /ide/$projectId, edit file | ✅ |

### 6.2 Architecture Proof Points

| Proof Point | Evidence Required |
|-------------|-------------------|
| Single ProjectContext | Both routes import same provider |
| FileTree as plugin | FileTreePlugin registered, renders in both routes |
| No workspace duplication | FileTree code exists in ONE location only |
| Gateway abstraction | Same gateway interface for FSA and IndexedDB |

---

## PART 7: GOVERNANCE UPDATES

### 7.1 Workflow Status Update

**File:** `bmm-workflow-status.yaml`

Add/Update:
```yaml
current_workflow:
  id: "epic-arch-02-remediation-2026-01-20"
  status: "IN_PROGRESS"
  epic: "EPIC-ARCH-02"
  story: "ARCH-02-FIX-01"
  started_at: "2026-01-20T14:00:00+07:00"
  team: "Both"
  
  remediation_context:
    trigger: "Independent Architecture Review"
    document: "_bmad-output/correct-course/CORRECT-COURSE-ADR034-REMEDIATION-2026-01-20.md"
    critical_fixes:
      - "ARCH-02-FIX-01: window.location.href violation"
      - "ARCH-02-FIX-02: file extension errors"
    modified_stories:
      - "ARCH-02-04: Added route migration requirement"
      - "ARCH-02-05: Added route migration requirement"
```

### 7.2 Sprint Status Update

**File:** `_bmad-output/sprint-artifacts/sprint-status.yaml`

Add:
```yaml
sprints:
  - id: "SPRINT-ARCH-02-REMEDIATION"
    epic: "EPIC-ARCH-02"
    status: "active"
    started_at: "2026-01-20"
    
    stories:
      - id: "ARCH-02-FIX-01"
        title: "Fix window.location.href Violation"
        status: "pending"
        priority: "P0"
        effort: "15m"
        team: "any"
        
      - id: "ARCH-02-FIX-02"
        title: "Fix File Extension Issues"
        status: "pending"
        priority: "P0"
        effort: "15m"
        team: "any"
        
      - id: "ARCH-02-04"
        title: "FileTree Plugin + notes Route Migration"
        status: "pending"
        priority: "P0"
        effort: "6h"
        team: "Team A"
        modified: true
        modification_reason: "Added route migration per independent review"
        
      - id: "ARCH-02-05"
        title: "Monaco Plugin + ide Route Migration"
        status: "pending"
        priority: "P0"
        effort: "6h"
        team: "Team B"
        modified: true
        modification_reason: "Added route migration per independent review"
```

### 7.3 LOOP_STATE Update

**File:** `_bmad-ext/state/LOOP_STATE.yaml`

Update:
```yaml
current:
  agent: "sprint-manager"
  epic_id: "EPIC-ARCH-02"
  story_id: "ARCH-02-FIX-01"
  story_status: "pending"
  workflow: "correct-course-remediation"
  
anchor:
  human_intent: "Execute EPIC-ARCH-02 with remediation fixes per independent review"
  human_intent_timestamp: "2026-01-20T14:00:00+07:00"
  mode: "EXECUTION"
  
remediation:
  trigger: "Independent Architecture Review 2026-01-20"
  document: "CC-ADR034-REM-2026-01-20"
  status: "approved"
  approved_by: "Architect Agent"
```

---

## PART 8: HANDOFF TO SPRINT-MANAGER

### 8.1 Execution Order

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE: IMMEDIATE FIXES (Today)                             │
├─────────────────────────────────────────────────────────────┤
│  1. ARCH-02-FIX-01 → Any team (15m)                        │
│  2. ARCH-02-FIX-02 → Any team (15m)                        │
│                                                             │
│  GATE: TypeScript compiles with 0 errors                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE: CRITICAL PATH (Sequential)                          │
├─────────────────────────────────────────────────────────────┤
│  3. ARCH-02-04 → Team A (6h) - FileTree + notes route      │
│                                                             │
│  GATE: notes.$projectId uses new ProjectContextProvider     │
│                                                             │
│  4. ARCH-02-05 → Team B (6h) - Monaco + ide route          │
│                                                             │
│  GATE: ide.$projectId uses new ProjectContextProvider       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE: PARALLEL PLUGINS                                     │
├─────────────────────────────────────────────────────────────┤
│  Team A: ARCH-02-06 (Notes) → ARCH-02-08 (Chat)            │
│  Team B: ARCH-02-07 (Terminal)                              │
│                                                             │
│  GATE: All 5 plugins registered and functional             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE: LAYOUT & CONSOLIDATION                              │
├─────────────────────────────────────────────────────────────┤
│  5. ARCH-02-09 → Team B (PluginLayout)                     │
│  6. ARCH-02-10 → Team A (/$projectId route)                │
│                                                             │
│  GATE: /$projectId route replaces workspace routes          │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Sprint-Manager Instructions

1. **Load this document** as the authoritative source for EPIC-ARCH-02 remediation
2. **Execute stories in order** per Part 8.1
3. **Verify gates** before proceeding to next phase
4. **Update sprint-status.yaml** after each story completion
5. **Update LOOP_STATE.yaml** with current story
6. **Report blockers** immediately to Architect Agent

### 8.3 Dev Team Tool Constraints

| Agent | write | edit | bash | task |
|-------|-------|------|------|------|
| dev-ext (Team A) | true | true | true (limited) | true |
| dev-ext (Team B) | true | true | true (limited) | true |

**Forbidden Actions:**
- No modifications to ADR files without Architect approval
- No new routes without ARCH-02-10 story
- No window.location.href usage
- No imports from `@/lib/workspace/ProjectContext` in new code

### 8.4 Escalation Path

```
Story blocked → Sprint-Manager
Gate failed → Architect Agent
Architecture question → Architect Agent
Scope change → Product Owner (User)
```

---

## PART 9: APPENDIX

### A. Files to Create (Summary)

| Story | Files |
|-------|-------|
| ARCH-02-FIX-01 | Modify: `src/infrastructure/context/project-context.tsx` |
| ARCH-02-FIX-02 | Rename/Fix: `src/infrastructure/context/*.ts` |
| ARCH-02-04 | Create: `src/plugins/filetree/*`, Modify: `src/routes/notes.$projectId.tsx` |
| ARCH-02-05 | Create: `src/plugins/monaco/*`, Modify: `src/routes/ide.$projectId.tsx` |
| ARCH-02-06 | Create: `src/plugins/notes/*` |
| ARCH-02-07 | Create: `src/plugins/terminal/*` |
| ARCH-02-08 | Create: `src/plugins/chat/*` |
| ARCH-02-09 | Create: `src/presentation/layouts/PluginLayout.tsx` |
| ARCH-02-10 | Create: `src/routes/$projectId.tsx` |

### B. Verification Commands

```bash
# Check for window.location.href violations
grep -rn "window.location.href" src/infrastructure/
# Expected: 0 matches

# Check for old ProjectProvider imports in routes
grep -rn "from '@/lib/workspace/ProjectContext'" src/routes/
# Expected: Decreasing as routes migrate

# Check for new ProjectContextProvider imports
grep -rn "from '@/infrastructure/context" src/routes/
# Expected: Increasing as routes migrate

# TypeScript compilation
pnpm tsc --noEmit
# Expected: 0 errors

# Plugin registration check
grep -rn "registerPlugin" src/plugins/
# Expected: 5 matches (one per plugin)
```

### C. Related Documents

| Document | Location | Purpose |
|----------|----------|---------|
| ADR-034 | `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md` | Architecture decision |
| EPIC-ARCH-01 | `_bmad-output/planning-artifacts/epics/EPIC-ARCH-01-foundation-cleanup-2026-01-20.md` | Foundation stories |
| EPIC-ARCH-02 | `_bmad-output/planning-artifacts/epics/EPIC-ARCH-02-feature-plugins-2026-01-20.md` | Plugin stories |
| Independent Review | (In conversation) | Triggered this remediation |

---

## APPROVAL

| Role | Name | Status | Date |
|------|------|--------|------|
| Architect Agent | architect-ext | ✅ APPROVED | 2026-01-20 |
| Product Owner | User | ⏳ PENDING | - |
| Sprint-Manager | bmad-sprint-manager | ⏳ PENDING | - |

---

**Document Status:** READY FOR SPRINT-MANAGER EXECUTION

**Next Action:** Sprint-Manager to begin ARCH-02-FIX-01
