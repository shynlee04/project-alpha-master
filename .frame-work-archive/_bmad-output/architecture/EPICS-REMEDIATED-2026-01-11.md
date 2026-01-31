# Project Epics - REMEDIATED (Single Source of Truth)
**Version:** 2.0.0
**Date:** 2026-01-11
**Status:** SINGLE SOURCE OF TRUTH - Verified against codebase reality
**Total Epics:** 8 (1 completed, 2 active, 2 near-complete, 3 pending)
**Total Active Stories:** ~40 (authorized only, verified)

---

## Executive Summary

This document consolidates all project epics based on:
1. **True Architecture** (BMAD Architecture SSOT)
2. **Codebase Reality** (verified implementation, not theoretical)
3. **Sensible Numbering** (logical chronological order)
4. **Authorized Stories Only** (removed theoretical/unverified)

**Key Changes from Previous Version:**
- Removed theoretical stories from EPIC-31 through EPIC-37 (not verified)
- Consolidated to verified epics based on actual codebase state
- Fixed epic numbering (EPIC-001, EPIC-002, etc.)
- Logical dependency chain (lower numbers complete first)

---

## Epic Status Overview

| Epic ID | Name | Progress | Status | Priority |
|---------|------|----------|--------|----------|
| EPIC-001 | Architecture Foundation | 100% | COMPLETED | P0 |
| EPIC-002 | P0 Critical Fixes | 100% | COMPLETED | P0 |
| EPIC-FS | File System Foundation | 28.6% (4/14) | ACTIVE | P0 |
| EPIC-003 | Clean Architecture Compliance | 0% | BLOCKED | P1 |
| EPIC-004 | Multimodal Chat Unification | 42% (5/12) | ACTIVE | P1 |
| EPIC-005 | Mobile UX Integration | 83% (5/6) | NEAR COMPLETE | P1 |
| EPIC-006 | UX Remediation | 60% | ACTIVE | P1 |
| EPIC-007 | 8-bit Design Compliance | 67% (4/6) | ACTIVE | P1 |
| EPIC-008 | Provider System | READY | PENDING | P2 |

---

## Dependency Chain

```
EPIC-001 (Foundation) ✓ COMPLETE
    ↓
EPIC-002 (P0 Fixes) ✓ COMPLETE
    ↓
EPIC-FS (File System) ⚠ ACTIVE 28.6%
    ↓ (at 80%)
EPIC-003 (Clean Architecture) ⏸ BLOCKED
    ↓
EPIC-004 (Multimodal Chat) ⚠ ACTIVE 42%
    ↓
EPIC-005 → EPIC-006 → EPIC-007 (Can run in parallel)
    ↓
EPIC-008 (Provider System) - PENDING
```

---

## Completed Epics

### EPIC-001: Architecture Foundation ✅

**Priority:** P0
**Status:** COMPLETED (2026-01-07)
**Stories:** N/A (Foundational work)

**Deliverables:**
- [x] Architecture.md generated
- [x] ADRs formalized
- [x] UX specification completed
- [x] Codebase scan completed

**Related:** `_bmad-output/planning-artifacts/architecture.md`

---

### EPIC-002: P0 Critical Fixes ✅

**Priority:** P0
**Status:** COMPLETED (2026-01-08)
**Stories:** 6 (100% complete)

**Business Value:**
- Fixed 9 P0 bugs causing crashes
- Error boundary coverage: 22.2% → 80%
- Missing exports resolved
- Workspace access race conditions fixed

**Completed Stories:**

| Story ID | Title | Status |
|----------|-------|--------|
| 002-01 | Add ErrorBoundaries to all workspace routes | ✅ Done |
| 002-02 | Fix missing useProjectStats export | ✅ Done |
| 002-03 | Fix redirect loop prevention | ✅ Done |
| 002-04 | Integrate BYOK vault with providers | ✅ Done |
| 002-05 | Fix workspace access race conditions | ✅ Done |
| 002-06 | Add error boundary coverage monitoring | ✅ Done |

---

## Active Epics

### EPIC-FS: File System Foundation (ACTIVE)

**Priority:** P0 - Critical Blocker
**Status:** ACTIVE - 28.6% (4/14 stories)
**Effort:** ~30 hours remaining

**Business Value:**
- File System Access API integration incomplete
- IndexedDB fallback needed for mobile
- File sync race conditions (P0 data corruption risk)
- Cross-workspace file references

**Success Criteria:**
1. FSA adapters functional (desktop)
2. IndexedDB fallback working (mobile)
3. FileLockService preventing concurrent writes
4. Bidirectional sync with conflict resolution

**Stories:**

| Story ID | Title | Effort | Status |
|----------|-------|--------|--------|
| FS-01 | Create LocalFSAdapter base interface | 2h | ✅ Done |
| FS-02 | Implement FSA adapter for desktop | 3h | ✅ Done |
| FS-03 | Implement IndexedDB adapter for mobile | 3h | ✅ Done |
| FS-04 | Create adapter facade and factory | 2h | ✅ Done |
| FS-05 | Implement FileLockService | 4h | ⚠️ IN PROGRESS |
| FS-06 | Unified file CRUD interface | 3h | ⏸ Pending |
| FS-07 | Mobile file picker implementation | 2h | ⏸ Pending |
| FS-08 | Cross-workspace file references | 2h | ⏸ Pending |
| FS-09 | File metadata synchronization | 2h | ⏸ Pending |
| FS-10 | Conflict resolution for concurrent edits | 3h | ⏸ Pending |
| FS-11 | File change detection (watching) | 2h | ⏸ Pending |
| FS-12 | Batch file operations | 2h | ⏸ Pending |
| FS-13 | File operation queue management | 2h | ⏸ Pending |
| FS-14 | File sync monitoring and logging | 1h | ⏸ Pending |

**Dependencies:**
- Blocks EPIC-003 (Clean Architecture)
- Stories FS-05 through FS-10 are P0 (critical path)

**Next Story:** FS-05 (FileLockService) - Currently in progress

---

### EPIC-003: Clean Architecture Compliance (BLOCKED)

**Priority:** P1
**Status:** BLOCKED - Waits for EPIC-FS 80%
**Stories:** 18 (planned)
**Effort:** ~41 hours

**Blocking Reason:**
- EPIC-FS must reach 80% before starting
- File system architecture must be stable first

**Business Value:**
- Current Clean Architecture compliance: 65%
- 130 import direction violations
- God components/stores requiring decomposition

**Success Criteria:**
1. 100% Clean Architecture layer compliance
2. Zero import direction violations
3. All god components <300 lines
4. Domain entities extracted

**Planned Stories:**

| Story ID | Title | Effort | Priority |
|----------|-------|--------|----------|
| 003-01 | Move sync-types.ts to infrastructure/sync/types | 1h | P0 |
| 003-02 | Move file system adapters to infrastructure/filesystem | 2h | P0 |
| 003-03 | Create facade exports in lib/filesystem | 1h | P0 |
| 003-04 | Update 130 infrastructure→domain imports | 4h | P0 |
| 003-05 | Create domain/entities/Project.ts | 2h | P0 |
| 003-06 | Create domain/entities/Workspace.ts | 1.5h | P0 |
| 003-07 | Update infrastructure to import from domain entities | 2h | P0 |
| 003-08 | Define WorkspaceRepository interface | 1.5h | P1 |
| 003-09 | Define AgentRepository and ProjectRepository interfaces | 1.5h | P1 |
| 003-10 | Implement ZustandWorkspaceRepository | 2h | P1 |
| 003-11 | Create DI ServiceContainer | 1.5h | P1 |
| 003-12 | Migrate application layer to repositories | 3h | P1 |
| 003-13 | Extract workspace-context.ts from unified context | 2h | P1 |
| 003-14 | Create UnifiedWorkspaceProvider (composition) | 2h | P1 |
| 003-15 | Split god stores into slices | 6h | P1 |
| 003-16 | Decompose god components | 4h | P1 |
| 003-17 | Install ESLint import plugin and configure rules | 1.5h | P2 |
| 003-18 | Add Clean Architecture compliance tests | 2h | P2 |

---

### EPIC-004: Multimodal Chat Unification (ACTIVE)

**Priority:** P1
**Status:** ACTIVE - 42% (5/12 stories)
**Effort:** ~18 hours remaining

**Business Value:**
- Chat interfaces scattered across workspaces
- Inconsistent multimodal input (text, voice, image)
- Agent integration inconsistent

**Success Criteria:**
1. Unified chat interface across all workspaces
2. Multimodal input (text, voice, image) working
3. Consistent agent integration

**Stories:**

| Story ID | Title | Effort | Status |
|----------|-------|--------|--------|
| 004-01 | Unified chat component base | 3h | ✅ Done |
| 004-02 | Agent selection interface | 2h | ✅ Done |
| 004-03 | Tool permission display | 2h | ✅ Done |
| 004-04 | Message threading | 2h | ✅ Done |
| 004-05 | Streaming response handling | 2h | ✅ Done |
| 004-06 | Voice input tool | 3h | ⏸ Pending |
| 004-07 | Image input support | 2h | ⏸ Pending |
| 004-08 | File attachment handling | 2h | ⏸ Pending |
| 004-09 | Cross-workspace chat context | 2h | ⏸ Pending |
| 004-10 | Chat history persistence | 2h | ⏸ Pending |
| 004-11 | Mobile-responsive chat UI | 2h | ⏸ Pending |
| 004-12 | Chat analytics and monitoring | 1h | ⏸ Pending |

**Dependencies:**
- Partially blocked by code review issue CA-001
- EPIC-002 (P0 Fixes) complete

**Next Story:** 004-06 (Voice input tool)

---

## Near-Complete Epics

### EPIC-005: Mobile UX Integration

**Priority:** P1
**Status:** 83% (5/6 stories)
**Effort:** ~3 hours remaining

**Business Value:**
- Mobile-first design not fully implemented
- Touch targets <44px on mobile
- Layout breaks on small screens

**Stories:**

| Story ID | Title | Effort | Status |
|----------|-------|--------|--------|
| 005-01 | Mobile-responsive IDE layout | 2h | ✅ Done |
| 005-02 | Mobile-responsive Notes layout | 1.5h | ✅ Done |
| 005-03 | Mobile-responsive Knowledge layout | 1.5h | ✅ Done |
| 005-04 | Mobile-responsive Study layout | 1h | ✅ Done |
| 005-05 | Fix touch targets (<44px) | 2h | ✅ Done |
| 005-06 | Test on real devices | 3h | ⏸ Pending |

**Next Story:** 005-06 (Device testing)

---

### EPIC-006: UX Remediation

**Priority:** P1
**Status:** 60% complete
**Stories:** 8 (5 done, 3 remaining)
**Effort:** ~8 hours remaining

**Stories:**

| Story ID | Title | Effort | Status |
|----------|-------|--------|--------|
| 006-01 | Command palette implementation | 3h | ✅ Done |
| 006-02 | Keyboard shortcuts | 2h | ✅ Done |
| 006-03 | Context menus | 2h | ✅ Done |
| 006-04 | Loading states | 1h | ✅ Done |
| 006-05 | Error messaging | 2h | ✅ Done |
| 006-06 | Empty states | 2h | ⏸ Pending |
| 006-07 | Success feedback | 2h | ⏸ Pending |
| 006-08 | Undo/redo functionality | 2h | ⏸ Pending |

---

### EPIC-007: 8-bit Design Compliance

**Priority:** P1
**Status:** 67% (4/6 stories)
**Effort:** ~6 hours remaining

**Business Value:**
- 8-bit design system partially implemented
- Inconsistent pixel-perfect styling
- Color palette not fully applied

**Stories:**

| Story ID | Title | Effort | Status |
|----------|-------|--------|--------|
| 007-01 | Implement pixel-perfect borders | 2h | ✅ Done |
| 007-02 | Apply 8-bit color palette | 2h | ✅ Done |
| 007-03 | Pixel shadows | 2h | ✅ Done |
| 007-04 | 8-bit typography | 2h | ✅ Done |
| 007-05 | 8-bit animations | 2h | ⏸ Pending |
| 007-06 | 8-bit icon set | 2h | ⏸ Pending |

---

## Pending Epics

### EPIC-008: Provider System

**Priority:** P2
**Status:** READY (not started)
**Stories:** 8 (planned)
**Effort:** ~16 hours

**Business Value:**
- Provider credential vault exists but unused
- Hardcoded providers bypass security
- No unified provider management

**Success Criteria:**
1. BYOK vault integrated with all providers
2. Zero hardcoded API keys
3. Unified provider configuration UI

**Planned Stories:**

| Story ID | Title | Effort | Priority |
|----------|-------|--------|----------|
| 008-01 | Integrate credential vault with providers | 3h | P0 |
| 008-02 | Remove hardcoded provider references | 2h | P0 |
| 008-03 | Unified provider configuration UI | 3h | P1 |
| 008-04 | Provider health monitoring | 2h | P1 |
| 008-05 | Provider failover mechanism | 2h | P1 |
| 008-06 | Provider usage analytics | 1h | P2 |
| 008-07 | Provider testing utilities | 2h | P2 |
| 008-08 | Provider documentation | 1h | P2 |

**Dependencies:**
- EPIC-004 (Multimodal Chat) should be complete

---

## Removed Epics (Unauthorized)

The following epics were removed as they contain theoretical stories not verified against codebase reality:

### EPIC-31 through EPIC-37 (REMOVED)

**Reason:** Stories were planned but not verified against actual codebase implementation

**Removed Epics:**
- EPIC-31: AI Service Unification (Stories not verified)
- EPIC-32: Notes Workspace Full Features (Theoretical)
- EPIC-33: IDE Workspace Full Features (Theoretical)
- EPIC-34: State Management Consolidation (Merged into EPIC-003)
- EPIC-35: Cross-Workspace CRUD (Theoretical)
- EPIC-36: Responsive UX (Merged into EPIC-005)
- EPIC-37: i18n (Theoretical - not started)

**Action:** These epics will be re-created only after:
1. Codebase reality is verified
2. Implementation exists or is actively being worked
3. Stories have clear acceptance criteria

---

## Sprint Planning (Remediated)

### Current Sprint: SPRINT-005 (File System Foundation Phase 2)

**Status:** IN PROGRESS
**Focus:** Complete EPIC-FS stories

**Stories to Complete:**
1. FS-05: FileLockService (in progress)
2. FS-06: Unified CRUD interface
3. SYNC-RACE-01: Sync race condition fix

**Sprint Goal:** Complete File System Foundation with proper locking

---

## Quality Gates

### Before Story Start
- [ ] Story aligned with true architecture
- [ ] No poisoning context in dependencies
- [ ] Acceptance criteria include workspace context

### Before Story Complete
- [ ] Code review passed
- [ ] Tests pass (including workspace scenarios)
- [ ] Documentation updated
- [ ] No new poisoning context introduced

---

## Verification Checklist

### After Each Epic
- [ ] `tsc --noEmit` passes
- [ ] All tests pass
- [ ] No circular dependencies
- [ ] Single source of truth maintained
- [ ] No poisoning context in new code

---

## Related Documents

- [BMAD Architecture SSOT](BMAD-ARCHITECTURE-SSOT-2026-01-11.md)
- [True Use Cases Mapping](TRUE-USE-CASES-2026-01-11.md)
- [Poisoning Context Report](POISONING-CONTEXT-2026-01-11.md)
- [Epic/Story Remediation Plan](EPIC-STORY-REMEDIATION-2026-01-11.md)
- [Sprint Status](../sprint-artifacts/sprint-status.yaml)

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-01-08 | 1.0.0 | Initial epics document | BMAD Planning |
| 2026-01-11 | 2.0.0 | Remediated - Verified stories, logical numbering, removed unauthorized | BMAD Remediation |

---

*Epics Document Remediated: 2026-01-11*
*Single Source of Truth Established*
*Stories Verified Against Codebase Reality*
*Ready for Execution*
