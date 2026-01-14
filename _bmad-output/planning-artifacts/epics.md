# Via-Gent Epics and Stories

**Version:** 2.0.0 (Corrected)  
**Date:** 2026-01-11  
**Status:** AUTHORITARY - Governs all feature development  
**Related Documents:**
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- Research: `_bmad-output/planning-artifacts/RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md`
- Audit: `_bmad-output/audit/comprehensive-codebase-audit-2026-01-11.md`
- ADR Audit: `_bmad-output/planning-artifacts/architecture/adr-audit-report-2026-01-11.md`

---

## ⚡ Quick Reference

| Epic | Name | Progress | Priority | Status |
|------|------|----------|----------|--------|
| **EPIC-01** | File System Foundation | 28.6% | P0 | IN_PROGRESS |
| **EPIC-02** | Architecture Remediation | BLOCKED | P0 | WAITING |
| **EPIC-03** | 8-bit Design Compliance | 67% | P1 | IN_PROGRESS |
| **EPIC-04** | Multimodal Chat Unification | 100% ⚠️ | P1 | VERIFY |

**Numbering Scheme:** Monotonic Sequential  
- EPIC-N requires EPIC-(N-1) to be 80%+ complete before starting  
- Number indicates order of identification, NOT priority  
- Priority (P0/P1/P2) is independent of number

---

## EPIC-01: File System Foundation

**Priority:** P0 (Foundation)  
**Status:** IN_PROGRESS  
**Progress:** 28.6% (4/14 stories)  
**New ID:** 01 (was EPIC-FS)

### Context
Core foundation for file operations, sync, and workspace management. Required before architecture remediation can proceed.

**Reference:** Architecture.md Section 2.1 (Layer violations)

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| 01-01 | File system foundation | 2h | P0 | DONE |
| 01-02 | File operations | 4h | P0 | DONE |
| 01-03 | Sync logic | 4h | P0 | DONE |
| 01-04 | Permission handling | 2h | P0 | DONE |
| 01-05 | Research task | 4h | P0 | DONE |
| 01-06 | N+1 Query Fix (RAG) | 2h | P0 | **TODO** |
| 01-07 | Error Boundary (/knowledge) | 1h | P0 | **TODO** |
| 01-08 | God Store Decomposition | 1 day | P1 | **TODO** |
| 01-09 | Store Consolidation | 4h | P1 | **TODO** |
| 01-10 | Type Consolidation | 4h | P2 | **TODO** |
| 01-11 | Cross-layer Import Fixes | 2h | P0 | **TODO** |
| 01-12 | Circular Dependency Fix | 1 day | P0 | **TODO** |
| 01-13 | Metadata Filtering (RAG) | 4h | P1 | **TODO** |
| 01-14 | RAG Type Consolidation | 4h | P2 | **TODO** |

### Current Issues (from Audit)

| Issue | Location | Severity | Story |
|-------|----------|----------|-------|
| N+1 Query | knowledge-source-crud-slice.ts:56-62 | HIGH | 01-06 |
| God Store | useRAGStore.ts (327 lines) | HIGH | 01-08 |
| Layer Violation | infrastructure/persistence/stores/index.ts:190-195 | HIGH | 01-11 |
| Circular Dep | agent-orchestration-service.ts | HIGH | 01-12 |

**Total Effort:** ~2 weeks  
**Blocker:** None (foundation work)

---

## EPIC-02: Architecture Remediation

**Priority:** P0 (Critical)  
**Status:** BLOCKED  
**Progress:** 0%  
**New ID:** 02 (was EPIC-38)  
**Unblock Condition:** EPIC-01 must reach 80%+ complete

### Context
Fixes 130+ layer violations and achieves Clean Architecture compliance. Cannot proceed while file system foundation is changing.

**Reference:** 
- Architecture.md Section 2.1 (Layer Violations)
- Audit: `_bmad-output/audit/comprehensive-codebase-audit-2026-01-11.md`

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| 02-01 | Break Circular Dependencies | 1 day | P0 | BLOCKED |
| 02-02 | Fix Infrastructure→Domain Imports | 4h | P0 | BLOCKED |
| 02-03 | Fix Domain→Infrastructure Imports | 4h | P0 | BLOCKED |
| 02-04 | Consolidate ValidationResult Types | 2h | P1 | BLOCKED |
| 02-05 | Consolidate ProviderResponse Types | 2h | P1 | BLOCKED |
| 02-06 | Core Layer Expansion | 4h | P2 | BLOCKED |
| 02-07 | Domain Layer Completion | 4h | P2 | BLOCKED |
| 02-08 | Add Layer Compliance Lint Rules | 2h | P2 | BLOCKED |

### ADR Compliance

| ADR | Related Work | Status |
|-----|--------------|--------|
| ADR-029 | Layer compliance fixes | ❌ Overly optimistic |
| ADR-027 | Store decomposition | ✅ Valid |

**Total Effort:** ~1 week (after unblock)  
**Blocker:** EPIC-01 completion

---

## EPIC-03: 8-bit Design Compliance

**Priority:** P1 (High)  
**Status:** IN_PROGRESS  
**Progress:** 67% (4/6 stories)  
**New ID:** 03 (was EPIC-39)

### Context
Implement 8-bit design system across all UI components.

**Reference:** Design tokens and component audit

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| 03-01 | Design Tokens | 4h | P0 | DONE |
| 03-02 | Component Updates | 8h | P0 | DONE |
| 03-03 | Styling Patterns | 4h | P0 | DONE |
| 03-04 | Validation | 4h | P0 | DONE |
| 03-05 | Remaining Components | 8h | P1 | **TODO** |
| 03-06 | Testing/Polish | 4h | P1 | **TODO** |

**Total Effort:** ~1 week  
**Blocker:** None (can run parallel to EPIC-01)

---

## EPIC-04: Multimodal Chat Unification

**Priority:** P1 (High)  
**Status:** VERIFY REQUIRED  
**Progress:** 100% (claimed)  
**New ID:** 04 (was EPIC-40)  
**Verdict:** SUSPICIOUS - Requires verification

### Context
Unified AI service with consistent tool access and permission enforcement.

**Reference:** 
- Architecture.md Section 1 (AI Patterns)
- ADR-026: `_bmad-output/planning-artifacts/architecture/adr-026-ai-service-unification.md`

### ⚠️ Verification Required

**Claim:** 100% complete (12/12 stories)  
**Reality:** Three AI patterns still exist:

| Pattern | Location | Status |
|---------|----------|--------|
| Full Agent System | ChatPanel → /api/chat | ✅ Exists |
| Notes AI Service | note-ai-service.ts | ⚠️ Static selection |
| Hardcoded Provider | VoiceRecordButton.tsx | ❌ 'gemini' hardcoded |

### Required Verification Steps

| Check | Action | Status |
|-------|--------|--------|
| AgentExecutionService exists? | Verify file | ❌ NOT DONE |
| Unified tool access? | Verify implementation | ❌ NOT DONE |
| Hardcoded provider removed? | Check VoiceRecordButton | ❌ NOT DONE |
| Permission enforcement? | Verify integration | ❌ NOT DONE |

### Stories (Require Verification)

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| 04-01 | AgentExecutionService core | **VERIFY** | File may not exist |
| 04-02 | IDE workspace AI migration | **VERIFY** | Check implementation |
| 04-03 | Notes AI migration | **VERIFY** | Check static selection |
| 04-04 | Knowledge workspace AI | **VERIFY** | Check implementation |
| 04-05 | BYOK vault integration | **VERIFY** | Check if complete |
| 04-06 | Agent flags (deepThink, memory) | **VERIFY** | Check implementation |
| 04-07 | Remove duplicate AI code | **VERIFY** | Check cleanup |
| 04-08 | AI monitoring | **VERIFY** | Check implementation |

**Total Effort:** ~1-2 weeks (if incomplete)  
**Verdict:** Mark SUSPICIOUS until verification passes

---

## EPIC-05: Agent Auto-Switching

**Priority:** P1 (High)  
**Status:** PROPOSED  
**Progress:** 0%  
**New ID:** 05

### Context
Enable automatic agent mode switching based on context and user intent.

**Reference:** `_bmad-output/planning-artifacts/RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md`

### Key Finding: Infrastructure EXISTS

| Component | Location | Status |
|-----------|----------|--------|
| ModeClassifier | mode-classifier.ts | ✅ Implemented |
| Scoring System | lines 393-448 | ✅ Working |
| Confidence Thresholds | Configurable | ✅ Ready |

### Required Changes

| Change | Effort | Priority |
|--------|--------|----------|
| Enable auto-switching (remove manual override) | 2h | P0 |
| Add mode field to ChatMessage | 4h | P0 |
| Persist mode in conversation store | 4h | P0 |
| Add UI confidence indicator | 2h | P1 |
| Implement context transfer | 1 day | P1 |
| Build agent registry | 2h | P1 |

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| 05-01 | Enable Auto-Switching | 2h | P0 | **TODO** |
| 05-02 | Mode Persistence | 4h | P0 | **TODO** |
| 05-03 | UI Confidence Indicator | 2h | P1 | **TODO** |
| 05-04 | Context Transfer | 1 day | P1 | **TODO** |
| 05-05 | Agent Registry | 2h | P1 | **TODO** |
| 05-06 | Handoff Pattern | 1 week | P2 | **TODO** |

**Total Effort:** ~2 weeks  
**Dependencies:** EPIC-01 completion recommended

---

## EPIC-06: RAG Enhancement

**Priority:** P1 (High)  
**Status:** PROPOSED  
**Progress:** 0%  
**New ID:** 06

### Context
Enhance RAG implementation with best practices from 2025 research.

**Reference:** `_bmad-output/planning-artifacts/RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md`

### Current Implementation

| Component | Status | Notes |
|-----------|--------|-------|
| OramaDB Vector Search | ✅ Implemented | Browser-based |
| Embeddings (384-dim) | ✅ Implemented | all-MiniLM-L6-v2 |
| Hybrid Search | ✅ Implemented | Vector 0.7 + BM25 0.3 |
| N+1 Queries | ❌ Issue | knowledge-source-crud-slice.ts |

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| 06-01 | Fix N+1 Queries | 2h | P0 | In EPIC-01 |
| 06-02 | Add Query Cache | 4h | P0 | **TODO** |
| 06-03 | Metadata Filtering | 4h | P0 | **TODO** |
| 06-04 | Implement Reranker | 1 day | P1 | **TODO** |
| 06-05 | Decompose useRAGStore | 1 day | P0 | In EPIC-01 |
| 06-06 | HyDE Query Augmentation | 2 days | P2 | **TODO** |
| 06-07 | RAG Type Consolidation | 4h | P1 | In EPIC-01 |

**Total Effort:** ~2 weeks  
**Dependencies:** None

---

## Dependency Graph

```
EPIC-01 (FS Foundation)
├── EPIC-02 (Architecture) [BLOCKED until 01-80%]
└── EPIC-05 (Agent Auto-Switching) [Recommended after 01]

EPIC-03 (8-bit Design) [PARALLEL - Independent]

EPIC-04 (Multimodal) [SUSPICIOUS - Verify first]

EPIC-06 (RAG Enhancement) [PARALLEL - Independent]
```

---

## Sprint Planning Recommendation

### Week 1-2: Foundation (EPIC-01 Focus)

**Goal:** Fix critical issues, enable agent auto-switching

| Day | Focus | Stories |
|-----|-------|---------|
| 1-2 | N+1 Queries + Error Boundary | 01-06, 01-07 |
| 3-4 | God Store Decomposition | 01-08 |
| 5 | Mode Persistence | 05-02 |
| 6-7 | Enable Auto-Switching | 05-01 |

**Expected Output:** 
- RAG performance fixed
- Error boundaries on all routes
- Agent auto-switching enabled

### Week 3-4: Architecture (EPIC-02 Focus)

**Goal:** Fix layer violations, unblock architecture work

| Week | Focus | Stories |
|-----|-------|---------|
| 3 | Circular Dependencies + Layer Fixes | 02-01, 02-02, 02-03 |
| 4 | Type Consolidation + Lint Rules | 02-04, 02-05, 02-08 |

**Expected Output:**
- Zero circular dependencies
- Layer compliance verified
- 130+ violations fixed

### Week 5-6: Feature Completion

**Goal:** Complete EPIC-03, 04 verification, EPIC-05

| Week | Focus | Stories |
|-----|-------|---------|
| 5 | 8-bit Design completion | 03-05, 03-06 |
| 5 | EPIC-04 Verification | 04-01 through 04-08 |
| 6 | Agent Auto-Switching Polish | 05-03, 05-04, 05-05 |

**Expected Output:**
- 8-bit design complete
- EPIC-04 verified (complete or rework)
- Agent auto-switching with UI

---

## Quality Gates

### Before Starting Any Epic

- [ ] Dependencies from previous epics are met
- [ ] Architecture.md reviewed for context
- [ ] Related research document reviewed
- [ ] Audit findings addressed (if applicable)

### Before Completing Any Epic

- [ ] All acceptance criteria met
- [ ] TypeScript errors: zero (production code)
- [ ] Build passes: no warnings
- [ ] Tests pass: new + existing
- [ ] God files verified: none >300 lines
- [ ] Architecture compliance verified
- [ ] Documentation updated

---

## Risk Assessment

| Epic | Risk Level | Risk Description | Mitigation |
|------|-----------|-----------------|------------|
| EPIC-01 | LOW | Well-scoped foundation work | Follow audit findings |
| EPIC-02 | HIGH | 130+ layer violations | Incremental fixes |
| EPIC-03 | LOW | Design work, no logic changes | Component audit |
| EPIC-04 | HIGH | May not be 100% complete | Verification required |
| EPIC-05 | MEDIUM | Infrastructure exists, not enabled | Enable carefully |
| EPIC-06 | LOW | Performance optimization | Research-backed |

---

## Handoff to Implementation

### Output Files

| File | description |
|------|---------|
| `architecture.md` | Authority for architecture decisions |
| `epics.md` | This file - epic and story definitions |
| `RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md` | Research backing |
| `adr-audit-report-2026-01-11.md` | ADR validity |

### Next Actions

1. Review this document
2. Approve or adjust priorities
3. Add stories to sprint plan
4. Begin Week 1 implementation

### Success Metrics

- All epics complete within timeline
- Zero P0 bugs in completed work
- Clean Architecture compliance improves
- Agent auto-switching working
- RAG performance optimized

---

**Document Version:** 2.0.0 (Corrected)  
**Last Updated:** 2026-01-11  
**Author:** Architecture Recovery Process  
**Status:** AUTHORITARY

**Next Review:** 2026-02-11 (quarterly)

---

*This document governs all feature development for Via-Gent*  
*Supersedes: epics.md v1.0.0 (2026-01-08)*
