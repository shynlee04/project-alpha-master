# Via-Gent Architecture Document - CORRECTED

**Version:** 1.1.0 (Corrected based on 2026-01-11 Audit)  
**Date:** 2026-01-11  
**Phase:** Architecture Recovery  
**Confidence Level:** MEDIUM (reflects audit findings)

---

## CRITICAL UPDATE: Architecture Recovery Required

This document has been updated to reflect findings from the comprehensive codebase audit conducted on 2026-01-11. **Previous confidence levels were inflated** - the actual architecture health is significantly worse than previously documented.

**Audit Summary:**
- **48 issues identified** (21 HIGH severity)
- **Architecture violations:** 12 issues
- **State management issues:** 15 issues  
- **Type definition issues:** 8 issues
- **Performance issues:** 7 issues
- **Overall Health Score:** 6/10 (previously claimed 75% compliance)

---

## Section 1: Executive Summary

Via-Gent is a browser-based, mobile-first AI development workspace. The platform operates at approximately **65% feature completeness** (corrected from 70%) with local-first architecture using WebContainers and IndexedDB.

### ⚠️ Key Corrections from Previous Version

| Metric | Previously Claimed | Actual (Audit) | Gap |
|--------|-------------------|----------------|-----|
| Clean Architecture Compliance | 75% | ~50% | 25% |
| God Components | 17 | 8+ | Underreported |
| God Stores | 9 | 8 | Accurate |
| AI Patterns | 3 | 3 | Accurate |
| Error Boundary Coverage | 22.2% | 22.2% | Accurate |

### Critical Findings from Audit

1. **Circular Dependencies** (HIGH): AgentOrchestrationService ↔ WorkspaceTransitionService
2. **Layer Violations** (HIGH): Infrastructure importing from domain services
3. **Duplicate Types** (MEDIUM-HIGH): ValidationResult defined 4+ times
4. **N+1 Queries** (HIGH): Database operations inside loops
5. **Sync Race Conditions** (HIGH): Boolean check instead of mutex

---

## Section 2: System Overview

### 2.1 Architecture Layers (Actual State)

**Layer 1: Core (src/core/)** - UNDERPOPULATED
- Only 4 entities (Agent, Conversation, Provider, Tool)
- Needs: Workspace, Project, Note, value objects
- Compliance: ~25%

**Layer 2: Domain (src/domain/services/)** - PARTIAL
- 7 services but 2 have circular dependencies
- Infrastructure imports found in domain layer
- Compliance: ~50%

**Layer 3: Infrastructure (src/infrastructure/)** - OVERGROWN + VIOLATING
- 250+ files but contains presentation logic
- Layer violations detected: 130+ imports going wrong direction
- Compliance: ~60%

**Layer 4: Lib (src/lib/)** - CONFUSION ZONE
- 220+ files with unclear layer ownership
- Contains business logic that should be in domain
- Compliance: Not measured

**Layer 5: Presentation (src/presentation/)** - DOMINANT
- 474 components with 8 god components
- Error boundary coverage: 22.2%
- Compliance: ~70%

### 2.2 Cross-Layer Violations (Audit Findings)

**CRITICAL - Must Fix:**

```
❌ Infrastructure → Domain (wrong direction):
   src/infrastructure/persistence/stores/index.ts:190-195
   exports domain services from infrastructure

❌ Domain → Infrastructure (leaky abstraction):
   src/domain/services/universal-adapter-factory.ts:313
   imports credential-vault directly

❌ Circular Dependencies:
   src/domain/services/agent-orchestration-service.ts:11
   src/domain/services/workspace-transition-service.ts:11
   import from each other
```

---

## Section 3: State Management Issues

### 3.1 God Stores (Audit Confirmed)

| Store File | Lines | Issue | Status |
|------------|-------|-------|--------|
| useWorkspaceFileSystem.ts | 571 | File system + sync + metadata | Needs decomposition |
| migration-backup.ts | 549 | Migration logic in store | Violation |
| conversation-migration.ts | 549 | Migration logic in store | Violation |
| useConversationStore.ts | 497 | Multiple responsibilities | Needs decomposition |
| unified-chat-store.ts | 448 | Chat state | Needs decomposition |
| provider-store.ts | 387 | Provider management | Needs decomposition |
| workspace-store.ts | 347 | Workspace state | Needs decomposition |
| useRAGStore.ts | 327 | RAG functionality | Needs decomposition |

### 3.2 Store Duplication Issues

**Multiple Conversation Stores:**
- useConversationStore.ts
- conversation-store.ts  
- unified-chat-store.ts
*→ Unclear boundaries, duplication risk*

**Multiple Workspace Stores:**
- workspace-store.ts
- useWorkspaceFileSystem.ts
- unified-workspace-context.tsx
*→ Scattered functionality*

---

## Section 4: Type Definition Issues

### 4.1 Duplicate Types (CRITICAL)

| Type | Locations | Impact |
|------|-----------|--------|
| ValidationResult | 4+ locations | Type drift, maintenance burden |
| ProviderResponse | 2+ locations | Inconsistency risk |
| Provider Types | 4+ locations | Confusion about canonical source |

### 4.2 Type Contract Violations

| Location | Issue | Severity |
|----------|-------|----------|
| agent-validation-slice.ts:70 | Throws instead of returning ValidationResult | HIGH |
| universal-provider-registry.ts:298 | Returns undefined when entry not found | MEDIUM |
| agent-validation-slice.ts:59 | Type assertions using `as any` | MEDIUM |

---

## Section 5: Performance Issues

### 5.1 N+1 Query Patterns (HIGH)

**Location:** knowledge-source-crud-slice.ts:56-62

```typescript
// ❌ BAD: Database queries inside loop
for (const collection of get().collections) {
  await db.collections.where('id').equals(collection.id).modify(...)
}
```

**Should be:** Bulk operation (bulkPut, bulkDelete, bulkModify)

### 5.2 Sync Race Conditions (HIGH)

**Location:** sync-engine-core.ts:78-80

```typescript
// ❌ BROKEN: Boolean check isn't thread-safe
if (this.state.isSyncing) {
  throw new Error('Sync already in progress');
}
```

**Fix required:** AsyncLock with timeout support

---

## Section 6: ADR Status Audit

### 6.1 Current ADR Assessment

| ADR | Title | Status | Assessment |
|-----|-------|--------|------------|
| ADR-026 | AI Service Unification | PROPOSED | **NEEDS EVIDENCE** - Hardcoded providers still in code |
| ADR-027 | State Management Consolidation | PROPOSED | **VALID** - Audit confirms 8 god stores |
| ADR-028 | Error Boundary Coverage | PROPOSED | **VALID** - 22.2% coverage confirmed |
| ADR-029 | Clean Architecture Layer Compliance | PROPOSED | **OVERLY OPTIMISTIC** - Claims 75%, actual ~50% |

### 6.2 ADR Issues Identified

**ADR-029 Problems:**
- Claims 75% compliance → Audit shows ~50%
- Lists 19 god components → Audit shows 8 (was overreported)
- Lists 9 god stores → Audit confirms 8 (accurate)
- Ignores 130+ layer violations

**ADR-026 Problems:**
- Documents 3 AI patterns → Still exist in code
- Proposes AgentExecutionService → Not implemented
- Hardcoded 'gemini' in VoiceRecordButton.tsx → Still present

---

## Section 7: Epics and Stories Reality Check

### 7.1 Current Epic Status (Corrected)

| Epic | Name | Claimed | Actual | Discrepancy |
|------|------|---------|--------|-------------|
| EPIC-FS | File System Foundation | 28.6% | Unknown | Needs verification |
| EPIC-39 | 8-bit Design Compliance | 67% | Unknown | Needs verification |
| EPIC-40 | Multimodal Chat Unification | 100% | **SUSPICIOUS** | AI still has 3 patterns |
| EPIC-38 | Architecture Remediation | BLOCKED | BLOCKED | Waiting on EPIC-FS |

### 7.2 Story Completion Verification Required

**⚠️ Stories marked complete require verification:**
- EPIC-40: All 12 stories claim completion but audit shows AI service issues
- EPIC-39: 4/6 stories done, 2 remaining
- EPIC-FS: 4/14 stories done

**Verification needed:**
1. Does completed code exist?
2. Does code pass TypeScript check?
3. Does code pass tests?
4. Is code reviewed?

---

## Section 8: Remediation Roadmap

### Phase 1: Critical Fixes (Week 1)
**Priority: P0**

1. Break circular dependencies (agent-orchestration ↔ workspace-transition)
2. Fix infrastructure → domain imports
3. Fix domain → infrastructure imports
4. Consolidate ValidationResult types (4 → 1)
5. Fix N+1 queries
6. Fix sync race conditions

**Effort:** 2-3 days

### Phase 2: God Store Breakdown (Weeks 2-3)
**Priority: P1**

1. Split useWorkspaceFileSystem.ts (571 lines → slices)
2. Split useConversationStore.ts (497 lines → slices)
3. Consolidate duplicate stores
4. Address orphaned stores

**Effort:** 1 week

### Phase 3: Type Consolidation (Week 4)
**Priority: P2**

1. Merge ValidationResult definitions
2. Merge ProviderResponse definitions
3. Consolidate provider types
4. Fix type contract violations

**Effort:** 3-5 days

### Phase 4: Architecture Recovery (Weeks 5-7)
**Priority: P1**

1. Expand core layer (Workspace, Project, Note entities)
2. Complete domain layer services
3. Move presentation logic from infrastructure
4. Add lint rules for layer compliance

**Effort:** 2-3 weeks

---

## Section 9: New Numbering Scheme

### 9.1 Proposed Logical Numbering

**Problem with current scheme:**
- "Greater number epics are executed before" = BULLSHIT
- Mixed formats: EPIC-40, EPIC-FS, Phase-1.5
- No logical progression

**New scheme (Monotonic Sequential):**

```
EPIC-01: File System Foundation (was EPIC-FS)
EPIC-02: Architecture Remediation (was EPIC-38)
EPIC-03: 8-bit Design Compliance (was EPIC-39)
EPIC-04: Multimodal Chat Unification (was EPIC-40)
...
```

**Rule:** Epic N requires Epic N-1 to be 80%+ complete before starting

### 9.2 Story Numbering

```
Format: XX-YY (Epic-Story)
Example: 01-03 = Epic 1, Story 3

EPIC-01:
├── 01-01 (done)
├── 01-02 (done)
├── 01-03 (in progress)
└── 01-04 (pending)

EPIC-02 (blocked - requires 01-08+ complete)
```

---

## Appendix A: Audit Evidence References

| Finding | Location |
|---------|----------|
| Circular dependencies | comprehensive-codebase-audit-2026-01-11.md:31-86 |
| God stores | comprehensive-codebase-audit-2026-01-11.md:135-188 |
| Duplicate types | comprehensive-codebase-audit-2026-01-11.md:220-262 |
| N+1 queries | comprehensive-codebase-audit-2026-01-11.md:306-330 |
| Sync race conditions | comprehensive-codebase-audit-2026-01-11.md:332-348 |

---

## Appendix B: Remediation Tracker

| Issue | Status | Owner | Due |
|-------|--------|-------|-----|
| Break circular deps | TODO | - | - |
| Fix layer violations | TODO | - | - |
| Consolidate types | TODO | - | - |
| Fix N+1 queries | TODO | - | - |
| Fix sync race | TODO | - | - |
| Decompose god stores | TODO | - | - |
| Update ADRs | TODO | - | - |
| Verify story completions | TODO | - | - |

---

**Document Version:** 1.1.0  
**Last Updated:** 2026-01-11  
**Status:** CORRECTED (reflects audit findings)

**Next Actions:**
1. Review this document with stakeholders
2. Begin Phase 1 critical fixes
3. Verify story completions before claiming done
4. Update ADR status based on actual implementation

---

*Generated from comprehensive audit findings*  
*Supersedes: architecture.md v1.0.0 (2026-01-07)*
