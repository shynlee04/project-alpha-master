# EPIC CONSOLIDATION MAP - Architecture Review

**Document ID:** EPIC-CONSOLIDATION-MAP-2026-01-26
**Author:** architect-ext
**Purpose:** Eliminate duplicate work, show what EXISTS vs what's MISSING
**Created:** 2026-01-26

---

## 🚨 CRITICAL FINDING: DUPLICATE EPICS DETECTED

The newly created **EPIC-FOUNDATION-RESET** overlaps significantly with existing epics. This document provides the canonical map.

---

## Epic Inventory (14 Epics Found)

| Epic | Created | Status | Overlap |
|------|---------|--------|---------|
| EPIC-ARCH-01 | 2026-01-20 | PARTIAL (20%) | Foundation work |
| EPIC-ARCH-02 | 2026-01-20 | PARTIAL (30%) | Plugin system |
| EPIC-ARCH-03 | 2026-01-21 | PARTIAL (45%) | Layout/UX |
| EPIC-ARCH-04-CC | 2026-01-25 | 95% | FSA handle lifecycle |
| EPIC-ARCH-04-complete | 2026-01-25 | SUPERSEDED | By EPIC-ARCH-04-CC |
| **EPIC-CC-AR02AR03** | 2026-01-26 | READY | **REMEDIATES ARCH-02/03** |
| **EPIC-PH1A-COMPLETION** | 2026-01-26 | READY | **WRAPPER for Phase 1A** |
| EPIC-TS-DEBT | 2026-01-25 | COMPLETE | TypeScript errors |
| EPIC-CTX-CLEAN | 2026-01-25 | COMPLETE | Context cleanup |
| EPIC-E2E-TOOLS | 2026-01-25 | READY | Browser automation |
| EPIC-UJ-01 | 2026-01-16 | UNKNOWN | User journey |
| epic-40-multimodal-chat | OLD | UNKNOWN | Chat unification |
| EPIC-UX-GLOBAL-UI | 2026-01-26 | UNKNOWN | Global UI |
| **EPIC-FOUNDATION-RESET** | 2026-01-26 | **DUPLICATE** | **ARCHIVE THIS** |

---

## Overlap Analysis

### EPIC-FOUNDATION-RESET vs EPIC-CC-AR02AR03

| Story from FOUNDATION-RESET | Already in EPIC-CC-AR02AR03? | Action |
|-----------------------------|------------------------------|--------|
| FR-01: Archive Legacy Routes | ⚠️ **MISSING** from CC-AR | **ADD to CC-AR** |
| FR-02: Hub Route Cleanup | ⚠️ **MISSING** from CC-AR | **ADD to CC-AR** |
| FR-03: Project Route | ✅ **Covered** by CC-AR-02, CC-AR-03 | DUPLICATE |
| FR-04: Remove Workspace Terminology | ⚠️ **MISSING** from CC-AR | **ADD to CC-AR** |
| FR-05: Split PluginLayout | ✅ **CC-AR-08** | DUPLICATE |
| FR-06: Replace Monaco POC | ✅ **CC-AR-05** | DUPLICATE |
| FR-07: Add i18n Keys | ✅ **CC-AR-01** | DUPLICATE |
| FR-08: Fix Sidebar | ⚠️ **MISSING** from CC-AR | **ADD to CC-AR** |
| FR-09: E2E Validation | ✅ **EPIC-E2E-TOOLS** | DUPLICATE |

### Decision: ARCHIVE EPIC-FOUNDATION-RESET

The epic is **80% duplicate**. The **20% unique content** should be merged into existing epics:

1. **FR-01 (Archive Routes)** → Add as **CC-AR-09** to EPIC-CC-AR02AR03
2. **FR-02 (Hub Cleanup)** → Add as **CC-AR-10** to EPIC-CC-AR02AR03
3. **FR-04 (Workspace Terminology)** → Add as **CC-AR-11** to EPIC-CC-AR02AR03
4. **FR-08 (Sidebar Fix)** → Add as **CC-AR-12** to EPIC-CC-AR02AR03

---

## Canonical Epic Execution Order

Based on dependency analysis:

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1A COMPLETION PATH                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. EPIC-ARCH-04-CC (FSA Handle Lifecycle)                       │
│    └── CC-01 ✅ → CC-02 → CC-03 → CC-04                         │
│    Status: 95% (CC-04 E2E Pending)                              │
│                                                                 │
│ 2. EPIC-CC-AR02AR03 (Plugin System Remediation)                 │
│    └── CC-AR-01 (i18n) → CC-AR-02 (platform) → ...              │
│    └── + CC-AR-09 (routes) + CC-AR-10 (hub) + ...               │
│    Status: 0% (Ready to Execute)                                │
│                                                                 │
│ 3. EPIC-E2E-TOOLS (Browser Automation)                          │
│    └── Playwright setup for real testing                        │
│    Status: Ready                                                │
│                                                                 │
│ 4. EPIC-PH1A-COMPLETION (Validation Wrapper)                    │
│    └── Validates all Phase 1A requirements                      │
│    Status: Blocked by 1, 2, 3                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files to Archive

### EPIC-FOUNDATION-RESET (Duplicate - Archive)

```
ARCHIVE:
_bmad-output/planning-artifacts/epics/EPIC-FOUNDATION-RESET-2026-01-26.md
_bmad-output/planning-artifacts/adr/ADR-034-AMENDMENT-002-foundation-reset-2026-01-26.md
_bmad-output/handoffs/2026-01-26/FOUNDATION-RESET-SPRINT-HANDOFF-2026-01-26.md
_bmad-output/architecture/FOUNDATION-RESET/

REASON: Duplicate of EPIC-CC-AR02AR03 + missing stories should be merged
```

---

## Stories to ADD to EPIC-CC-AR02AR03

### CC-AR-09: Archive All Legacy Routes

**Priority:** P0 | **Effort:** 1 hour | **Team:** Team A
**Dependencies:** None (Can run parallel to CC-AR-01)

Archive legacy routes that violate the 2-route architecture:

```
src/routes/ide.$projectId.tsx      → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/notes.$projectId.tsx    → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/workspace/$projectId.tsx → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/workspace/index.tsx     → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/notes.lazy.tsx          → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/ide.tsx                 → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/agents.tsx              → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/settings.tsx            → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/projects.tsx            → _bmad-ext/.archive/legacy-routes-2026-01-26/
```

**Acceptance Criteria:**
- [ ] Only 6 routes remain: __root.tsx, index.tsx, hub.tsx, $projectId.tsx, about.tsx, about.lazy.tsx
- [ ] All archived files exist in archive location
- [ ] TypeScript compiles with 0 errors

### CC-AR-10: Clean Hub Page

**Priority:** P1 | **Effort:** 2 hours | **Team:** Team A
**Dependencies:** CC-AR-09

Remove workspace terminology from Hub page:

- Remove `WorkspacePieChart` or rename to `ProjectDistribution`
- Remove "workspace" text from UI strings
- Remove workspace tabs (WORKSPACE, AGENTS, KNOWLEDGE)

**Acceptance Criteria:**
- [ ] No "workspace" visible in Hub page UI
- [ ] Project-centric terminology used throughout

### CC-AR-11: Remove Workspace Terminology

**Priority:** P1 | **Effort:** 4 hours | **Team:** Team B
**Dependencies:** CC-AR-10

Replace "workspace" with "project" terminology across codebase:

**Files to Modify (Priority):**
1. `src/presentation/components/hub/HubHomePage.tsx` (75+ references)
2. `src/presentation/components/hub/WorkspacePieChart.tsx` → Archive
3. `src/presentation/components/hub/WorkspaceFilter.tsx` → Rename
4. All other files with "workspace" references

**Acceptance Criteria:**
- [ ] grep "workspace" returns 0 UI-visible matches
- [ ] Component names use "Project" prefix

### CC-AR-12: Fix Single Sidebar Architecture

**Priority:** P1 | **Effort:** 2 hours | **Team:** Team A
**Dependencies:** CC-AR-08

Fix double sidebar by implementing single ProjectSidebar:

- Single sidebar in `__root.tsx`
- Sidebar contains project switcher, quick actions, settings access
- Mobile: Bottom navigation instead

**Acceptance Criteria:**
- [ ] ONE sidebar visible (not two)
- [ ] Sidebar has useful content

---

## Updated EPIC-CC-AR02AR03 Story List

| Story | Title | Team | Effort | Status |
|-------|-------|------|--------|--------|
| CC-AR-01 | Add Missing i18n Keys | A | 2h | READY |
| CC-AR-02 | Wire platform-defaults.ts | A | 2-3h | READY |
| CC-AR-03 | Fix Store Hydration Race | B | 2-3h | READY |
| CC-AR-04 | Toggle-Based Layout | A | 4-6h | READY |
| CC-AR-05 | Replace Monaco POC | B | 4-6h | READY |
| CC-AR-06 | Preview Plugin | B | 4-6h | READY |
| CC-AR-07 | Archive Legacy Files | A | 1h | READY |
| CC-AR-08 | Split PluginLayout.tsx | B | 2-3h | READY |
| **CC-AR-09** | **Archive Legacy Routes** | A | 1h | **NEW** |
| **CC-AR-10** | **Clean Hub Page** | A | 2h | **NEW** |
| **CC-AR-11** | **Remove Workspace Terminology** | B | 4h | **NEW** |
| **CC-AR-12** | **Fix Single Sidebar** | A | 2h | **NEW** |

**New Total Effort:** 30-42 hours (was 17-26 hours)

---

## Action Items for Orchestrator

1. **ARCHIVE** EPIC-FOUNDATION-RESET files:
   - Move to `_bmad-ext/.archive/duplicate-epics-2026-01-26/`

2. **UPDATE** EPIC-CC-AR02AR03:
   - Add stories CC-AR-09, CC-AR-10, CC-AR-11, CC-AR-12
   - Update estimated effort

3. **UPDATE** LOOP_STATE.yaml:
   - Set current epic to EPIC-CC-AR02AR03
   - Clear EPIC-FOUNDATION-RESET references

4. **UPDATE** AGENTS.md:
   - Reference EPIC-CC-AR02AR03 as the canonical epic

---

## Summary

| Action | Details |
|--------|---------|
| **ARCHIVE** | EPIC-FOUNDATION-RESET (duplicate) |
| **MERGE** | 4 unique stories into EPIC-CC-AR02AR03 |
| **EXECUTE** | EPIC-ARCH-04-CC → EPIC-CC-AR02AR03 → EPIC-E2E-TOOLS |
| **VALIDATE** | EPIC-PH1A-COMPLETION after above complete |
