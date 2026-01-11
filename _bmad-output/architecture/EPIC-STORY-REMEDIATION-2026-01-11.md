# Epic and Story Remediation Plan
**Date:** 2026-01-11
**Purpose:** Remediate epics and stories based on true architecture
**Status:** ACTIVE - Iterative Phases

---

## Executive Summary

This document provides a phased remediation plan for all epics and stories based on:
1. True use cases (from actual implementation)
2. Consolidated BMAD architecture (SSOT)
3. Removal of poisoning context

**Approach:** Iterative phases, not complete implementation upfront
**Governance:** BMAD strict adherence

---

## Current State Analysis

### Active Epics (as of 2026-01-11)

| Epic ID | Name | Progress | Status | Priority |
|---------|------|----------|--------|----------|
| EPIC-FS | File System Foundation | 28.6% (4/14) | ACTIVE | P0 |
| EPIC-39 | 8-bit Design Compliance | 67% (4/6) | ACTIVE | P1 |
| EPIC-40 | Multimodal Chat Unification | 100% | COMPLETED | P1 |

### Blocked Epics

| Epic ID | Name | Blocking Reason |
|---------|------|-----------------|
| EPIC-38 | Architecture Remediation | Waits for EPIC-FS 100% |

---

## Remediation Principles

### Based on True Architecture

1. **Workspace-First:** All features organized around workspaces
2. **Agent Modes:** Manual switching (not automatic as some docs suggest)
3. **RAG via Gemini:** No vector DB (correct documentation)
4. **File Sync:** Bidirectional with conflict resolution
5. **Permissions:** Multi-layer (tool, workspace, mode, trust)

### Based on BMAD Governance

1. **Max 4 active epics**
2. **Max 8 stories per epic**
3. **EPIC-N needs EPIC-(N-1) at 80%**
4. **Story format:** `{EPIC}-{NN}`
5. **Sprint status:** Single source of truth

---

## Phase 1: Critical Fixes (Immediate)

### Goal: Unblock EPIC-FS and fix critical architecture issues

#### Story FS-05: FileLockService (In Progress)
**Current Status:** IN_PROGRESS
**Remediation Actions:**
- [ ] Verify workspace-scoped lock implementation
- [ ] Ensure compatibility with FSA and IDB adapters
- [ ] Add conflict resolution for concurrent access

**Acceptance Criteria:**
- FileLockService prevents concurrent write conflicts
- Works across both FSA and IDB adapters
- Workspace-scoped locks (not global)

---

#### Story FS-06: Unified CRUD (Next)
**Remediation Actions:**
- [ ] Implement unified CRUD interface
- [ ] Support both FSA and IDB transparently
- [ ] Add workspace-aware file operations
- [ ] Include conflict resolution hooks

**Acceptance Criteria:**
- Single CRUD interface for all file operations
- Workspace-aware path resolution
- Bidirectional sync compatible

---

#### Story FS-07: Mobile File Picker
**Remediation Actions:**
- [ ] Implement mobile-friendly file picker
- [ ] Fallback to IDB when FSA unavailable
- [ ] Maintain workspace context

**Acceptance Criteria:**
- Mobile users can select files per workspace
- Graceful degradation when FSA unsupported
- Cross-client file references work

---

## Phase 2: RAG Documentation Corrections

### Goal: Fix RAG documentation across epics/stories

#### New Story: DOC-RAG-01
**Title:** Correct RAG Documentation

**Actions:**
- [ ] Update all architecture docs to reflect Gemini-based RAG
- [ ] Remove vector DB references
- [ ] Document Gemini multimodal capabilities
- [ ] Update agent tool descriptions

**Acceptance Criteria:**
- No vector DB references in documentation
- Gemini API approach clearly documented
- RAG capabilities accurately described

---

## Phase 3: Agent Mode Enhancements

### Goal: Address manual mode switching limitation

#### New Story: AGENT-MODE-01
**Title:** Implement Automatic Agent Mode Switching

**Actions:**
- [ ] Design mode detection based on user intent
- [ ] Implement automatic mode transitions
- [ ] Add user override capability
- [ ] Update documentation

**Acceptance Criteria:**
- Agent mode switches automatically based on context
- User can manually override when needed
- Mode transitions are smooth and state-preserving

---

#### New Story: AGENT-MODE-02
**Title:** Update Agent Mode Documentation

**Actions:**
- [ ] Document current manual mode switching
- [ ] Add roadmap for automatic switching
- [ ] Update tool permission descriptions
- [ ] Clarify mode restrictions per tool

**Acceptance Criteria:**
- Documentation matches implementation
- Roadmap for enhancements defined
- User expectations properly set

---

## Phase 4: Sync Race Condition Fix

### Goal: Fix sync engine race condition (identified in audit)

#### New Story: SYNC-RACE-01
**Title:** Implement Proper Sync Locking

**Priority:** P0 (Data corruption risk)

**Actions:**
- [ ] Create AsyncLock utility
- [ ] Replace boolean `isSyncing` with mutex
- [ ] Add timeout support
- [ ] Implement sync queue

**Acceptance Criteria:**
- No race conditions possible
- Sync operations properly serialized
- Stuck syncs timeout after 30s
- Multiple sync requests queued

---

## Phase 5: Epic Consolidation

### Goal: Ensure epic alignment with true architecture

#### EPIC-FS Remains (P0)
**Status:** Continue
**Changes:**
- Add sync race condition story (SYNC-RACE-01)
- Ensure workspace-scoped operations
- Verify mobile client support

---

#### EPIC-39 Remains (P1)
**Status:** Continue
**Changes:**
- Ensure responsive design for workspaces
- Verify 8-bit compliance across all workspaces
- Mobile-first considerations

---

#### New EPIC: EPIC-ARCH (Architecture Cleanup)
**Priority:** P1 (After EPIC-FS)

**Stories:**
1. ARCH-01: Remove deprecated governance modules
2. ARCH-02: Consolidate sprint status files
3. ARCH-03: Initialize LOOP_STATE properly
4. ARCH-04: Update command paths to _bmad-ext
5. ARCH-05: Consolidate archive locations
6. ARCH-06: Update RAG documentation
7. ARCH-07: Migrate core/ exports to domain
8. ARCH-08: Verify all paths reference correct locations

---

## Epic Dependency Updates

### New Dependency Chain

```
EPIC-FS (P0) - Must complete first
    ↓ (at 80%)
EPIC-ARCH (P1) - Architecture cleanup
    ↓ (at 80%)
EPIC-39 (P1) - 8-bit Design (can continue in parallel)
    ↓ (at 80%)
New epics can be added
```

---

## Story Status Updates

### Stories Requiring Remediation

| Story ID | Issue | Required Action |
|----------|-------|-----------------|
| FS-05 | Verify workspace-scoped | Add workspace context tests |
| FS-06 | Include conflict resolution | Add conflict hooks |
| FS-07 | Mobile considerations | Verify FSA fallback |
| 39-01 | Workspace-aware audit | Check all workspaces |
| 39-02 | Mobile-friendly design | Ensure responsive |
| MM-11 | Final multimodal story | Verify Gemini-based RAG |

---

## Sprint Planning Updates

### Current Sprint: Phase 2 (Agentic Capabilities)

**Stories to Complete:**
1. FS-05: FileLockService (in progress)
2. FS-06: Unified CRUD (next)
3. SYNC-RACE-01: Sync locking (new - P0)
4. DOC-RAG-01: RAG documentation (new)

**Sprint Goal:** Complete File System Foundation with proper locking

---

## Governance Updates

### Quality Gates

**Before Story Start:**
- [ ] Story aligned with true architecture
- [ ] No poisoning context in dependencies
- [ ] Acceptance criteria include workspace context

**Before Story Complete:**
- [ ] Code review passed
- [ ] Tests pass (including workspace scenarios)
- [ ] Documentation updated
- [ ] No new poisoning context introduced

---

## Verification Checklist

### After Each Phase

- [ ] `tsc --noEmit` passes
- [ ] All tests pass
- [ ] No circular dependencies
- [ ] LOOP_STATE properly initialized
- [ ] Single source of truth maintained
- [ ] No poisoning context in new code

---

## Success Metrics

### Architecture Health
- [ ] Zero circular dependencies
- [ ] Zero layer violations
- [ ] Single source of truth for ADRs
- [ ] LOOP_STATE initialized
- [ ] All paths reference correct locations

### Epic Health
- [ ] Max 4 active epics
- [ ] Max 8 stories per epic
- [ ] Epic dependencies enforced
- [ ] Story format consistent

### Documentation Health
- [ ] RAG documentation accurate
- [ ] Agent mode documentation accurate
- [ ] Workspace architecture clear
- [ ] Sync strategy documented

---

## Related Documents

- [BMAD Architecture SSOT](_bmad-output/architecture/BMAD-ARCHITECTURE-SSOT-2026-01-11.md)
- [True Use Cases Mapping](_bmad-output/architecture/TRUE-USE-CASES-2026-01-11.md)
- [Poisoning Context Report](_bmad-output/architecture/POISONING-CONTEXT-2026-01-11.md)
- [Sprint Status](_bmad-output/sprint-artifacts/sprint-status.yaml)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-11 | Initial remediation plan | BMAD Analysis |

---

*Epic/Story Remediation: 2026-01-11*
*Status: Ready for Execution*
*Phases: Iterative, BMAD-Governed*
