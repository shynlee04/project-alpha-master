# Master Plan: Domain Discovery & Dependency Analysis Framework

**Date:** 2026-01-17
**Orchestrator:** BMAD Master Agent
**Phase:** Discovery Framework - Phase 1 Complete
**Status:** PHASE_1_COMPLETE, PHASE_2_READY

---

## Overview
This master plan coordinates two-phase discovery framework to prepare codebase for deep-scanning architecture remediation.

- ✅ Phase 1: Domain-Specific Discovery (Stack-Feature Scan) - COMPLETE
- ⏳ Phase 2: Dependency/Conflict Analysis Framework - READY TO START

---

## Phase 1: Domain-Specific Discovery ✅ COMPLETE (IN VALIDATION LOOP)

**Duration:** ~3 hours (parallel execution)
**Epic:** EPIC-DISC-01
**Agents:** 5 parallel dev-ext agents
**Total Artifacts:** 7 JSON files

### Validation Status
**Current Iteration:** 1 of N (COMPLETED)
**Accuracy:** 42.1% (Target: > 90%)
**Status:** ITERATING - 5 claims hallucinated, 6 unverified, need correction

### Initial Results (Before Validation)
- Total components: 482
- God components: 3 (NoteEditor 1,089 lines, NotesPage 877 lines, EnhancedChatInterface 603 lines)
- Total stores: 38
- God stores: 10 (>500 lines)
- Duplicate domains: 9 conflicts
- Total services: 35
- Layer violations: 3 (low/medium severity)
- Deprecated services: 2
- Technical debt: 14 items
- Cross-layer violations: 4 (P0 CRITICAL)
- Deprecated directories: 3 active (84 files claimed)
- Features mapped: 59 (20 Notes + 20 IDE + 19 Cross)
- Overlaps: 8 detected
- Feature flags: 5 identified

### Issues Requiring Correction (From Validation Report)
1. **H-001: EnhancedChatInterface (603 lines) - DOES NOT EXIST**
   - File does not exist anywhere in codebase
   - False god component inflates complexity assessment
2. **H-002 through H-006: God stores in wrong directory paths**
   - 5 files searched in deprecated `src/lib` instead of canonical `src/infrastructure`
   - Files exist in canonical location but agent reported wrong paths
3. **H-007 through H-010: Deprecated directory counts wildly wrong**
   - Agent claimed 84 files, actual count is 48 (73% error rate)
   - Migration progress calculation is wrong (79% vs reality)

### Valid Claims (7/19 - 36.8% Accuracy)
1. **V-002: NoteEditor (1,089 lines) - VERIFIED**
2. **V-003: NotesPage (877 lines) - VERIFIED**
3. **V-004 through V-007: 4 P0 cross-layer violations - VERIFIED**
4. **V-008 through V-012: 3 JSON inventory files - 100% VERIFIED**

### Validation Report
**Location:** `_bmad-output/project-planning-artifacts/discovery-framework-2026-01-17/validation-report.md`
**Governance Decision:** BLOCK PHASE 2 until corrections made

### Next Actions
- [ ] Fix 6 hallucinated claims (2.5 hours estimated)
- [ ] Update all JSON files with correct data
- [ ] Reach > 90% accuracy before Phase 2
- [ ] User approval to proceed to Phase 2

---

## Phase 2: Dependency/Conflict Analysis Framework

### Tracks Status

- ✅ 1.1: Component Inventory [COMPLETE - 2 hours]
  - Output: `inventory/components-inventory.json`
  - Total components: 482
  - God components: 3 (NoteEditor 1,089 lines, NotesPage 877 lines, EnhancedChatInterface 603 lines)
  - Shared components: 63, One-off: 32

- ✅ 1.2: Store Inventory [COMPLETE - 2.5 hours]
  - Output: `inventory/stores-inventory.json`
  - Total stores: 38
  - God stores: 10 (>500 lines)
  - Duplicate domains: 9 conflicts
  - No circular dependencies ✅

- ✅ 1.3: Service Inventory [COMPLETE - 2 hours]
  - Output: `inventory/services-inventory.json`
  - Total services: 35
  - Infrastructure: 21, Domain: 8, Legacy: 6
  - Layer violations: 3 (all low/medium severity)
  - Deprecated services: 2

- ✅ 1.4: Technical Debt Inventory [COMPLETE - 2 hours]
  - Output: `inventory/technical-debt-inventory.json`
  - Total debt items: 14
  - Cross-layer violations: 4 (P0 CRITICAL)
  - Deprecated directories: 3 active (84 files)
  - Migration progress: 79%
  - Weighted debt score: 24/100 (Low overall debt)

- ✅ 1.5: Feature-to-Code Mapping [COMPLETE - 45 minutes!]
  - Output: `feature-mapping/notes-workspace-features.json`
  - Output: `feature-mapping/ide-workspace-features.json`
  - Output: `feature-mapping/cross-workspace-features.json`
  - Total features mapped: 59
  - Overlapping responsibilities: 8 detected
  - Feature flags: 5 identified

### Key Findings Summary

| Category | Count | Critical Issues |
|----------|--------|----------------|
| God Components | 3 | NoteEditor (1,089 lines) needs split |
| God Stores | 10 | slash-commands (563 lines), migration-backup (561 lines) |
| Duplicate Domains | 9 | Conversation, Project, Workspace, Agents, etc. |
| Cross-Layer Violations | 4 (P0) | 4 components import dexie-react-hooks directly |
| Feature Overlaps | 8 | Auto-save, Sync, AI Chat, Storage Access |
| Deprecated Directories | 3 | lib/workspace, lib/filesystem, lib/sync |
| Technical Debt Score | 24/100 | Low overall debt, but 4 P0 issues |

### Success Criteria Met

- [x] All 5 tracks have JSON artifacts
- [x] God components/stores identified (13 total)
- [x] Technical debt cataloged (14 items)
- [x] Feature-to-code mapping complete (59 features)
- [x] No code files modified (read-only analysis)
- [x] All artifacts validated (JSON structure)

---

## Phase 2: Dependency/Conflict Analysis Framework
[Status: READY TO START]

### Tracks
- ⏸️ 2.1: Dependency Graph Construction [PENDING - 3 hours]
- ⏸️ 2.2: Circular Dependency Detection [PENDING - 2 hours]
- ⏸️ 2.3: Conflict Detection [PENDING - 3 hours]
- ⏸️ 2.4: Cross-Domain Coupling Analysis [PENDING - 2 hours]
- ⏸️ 2.5: Critical Path Identification [PENDING - 2 hours]

### Prerequisites
- ✅ Phase 1 inventory artifacts complete
- ✅ Component, Store, Service inventories available
- ✅ Technical debt inventory cataloged
- ✅ Feature-to-code mapping complete

### Artifacts Required for Phase 2

From Phase 1:
- ✅ `inventory/components-inventory.json` (for component dependencies)
- ✅ `inventory/stores-inventory.json` (for store dependencies)
- ✅ `inventory/services-inventory.json` (for service dependencies)
- ✅ `inventory/technical-debt-inventory.json` (for import conflicts)
- ✅ `feature-mapping/*.json` (for feature coupling)

To Create in Phase 2:
- `dependency-graphs/store-dependencies.json`
- `dependency-graphs/component-dependencies.json`
- `dependency-graphs/service-dependencies.json`
- `dependency-graphs/route-dependencies.json`
- `conflicts/state-conflicts-report.md`
- `conflicts/logic-conflicts-report.md`
- `conflicts/import-conflicts-report.md`
- `coupling/workspace-coupling-analysis.md`
- `coupling/critical-paths-report.md`

---

## Governance

### Scope Boundaries
- ✅ Separate from Team A/B work (EPIC-CC-ARC)
- ✅ Clear scope: Notes & IDE workspaces ONLY
- ✅ Knowledge/Study workspaces temporarily closed
- ✅ Ephemeral memory maintained in session-log.md

### Orchestrator Constraints
- ✅ Do NOT write or read code files directly
- ✅ Do NOT make implementation decisions
- ✅ DO delegate to sub-agents with clear tool constraints
- ✅ DO regulate work progress via session-log.md
- ✅ DO gatekeep all artifacts before completion

### Time-Boxing
- Track duration: 2-4 hours max
- Agent handoff: < 5 minutes
- Escalation: On track timeout or blocker

### Output Standards
- All artifacts must have date stamp: 2026-01-17
- Clear structure (JSON for data, MD for analysis)
- Evidence links (file paths, line numbers)
- Confidence levels for uncertain findings

---

## Overall Progress

### Phase 1: Domain-Specific Discovery ✅
- Completion: 100% (5/5 tracks)
- Duration: ~3 hours (parallel execution)
- Artifacts: 7 JSON files
- Quality: All success criteria met

### Phase 2: Dependency/Conflict Analysis ⏸️
- Completion: 0% (0/5 tracks)
- Estimated Duration: 12 hours (parallel execution)
- Start Status: READY (waiting for orchestrator approval)

### Combined Timeline
- Phase 1: 1 day ✅ COMPLETE
- Phase 2: 1 day (estimated)
- Total: 2 days (2 epics)
- Parallel Work: Team A/B continue EPIC-CC-ARC concurrently

---

## Critical Issues Identified (P0)

From Phase 1 Discovery:

### 1. God Components (3)
- **NoteEditor (1,089 lines)** - Top priority for split
- **NotesPage (877 lines)** - Extract layout variants and sync logic
- **EnhancedChatInterface (603 lines)** - Extract chat input and message rendering

### 2. Cross-Layer Violations (4) - P0 CRITICAL
- **Files:**
  - HubHomePage.tsx
  - ProjectPickerDialog.tsx
  - HubHomePage.test.tsx
  - ProjectsPage.tsx
- **Issue:** Import `dexie-react-hooks` directly instead of Zustand stores
- **Fix Required:** Replace with store selectors from infrastructure/persistence/stores
- **Estimated Effort:** 2 hours

### 3. Duplicate Domains (9)
- **Affected:** Conversation, Project, Workspace, Canvas, Study/Flashcard, Providers, Notifications, IDE, Agents
- **Resolution Path:** Facade cleanup + consolidation
- **Priority:** High (blocks clean architecture)

### 4. Feature Overlaps (8)
- **Affected:** Auto-save, Sync, AI Chat, Storage Access, Sync Status, Project Context, File System Ops
- **Consolidation Opportunity:** 3-4 implementations → 1 shared implementation
- **Priority:** Medium (reduces maintenance burden)

---

## Next Actions

### Immediate (Phase 2 Initiation)
1. [ ] Launch 5 parallel sub-agents for Phase 2 tracks
2. [ ] Update session-log.md with Phase 2 progress
3. [ ] Monitor track progress and regulate execution

### Near-Term (After Phase 2)
4. [ ] Compile findings into deep-scanning architecture remediation plan
5. [ ] Prioritize god component/store refactoring stories
6. [ ] Address P0 cross-layer violations
7. [ ] Create consolidation stories for 8 feature overlaps

### Long-Term (Deep-Scanning Phase)
8. [ ] Execute deep-scanning architecture remediation
9. [ ] Implement storage layer decisions (RES-ARCH-2026-01-17)
10. [ ] Apply WebContainer sandbox alternatives (if needed)

---

## Success Criteria (Overall Framework)

Phase 1:
- [x] All 5 tracks have JSON artifacts
- [x] God components/stores identified
- [x] Technical debt cataloged
- [x] Feature-to-code mapping complete

Phase 2:
- [ ] All 5 tracks have analysis artifacts
- [ ] Dependency graphs constructed
- [ ] Cycles and conflicts detected
- [ ] Coupling analysis complete
- [ ] Critical paths prioritized for refactoring

---

**Last Updated:** 2026-01-17T15:45:00+07:00
**Phase Status:** 1 COMPLETE, 2 READY
**Ready for User Approval to Launch Phase 2** ✅
