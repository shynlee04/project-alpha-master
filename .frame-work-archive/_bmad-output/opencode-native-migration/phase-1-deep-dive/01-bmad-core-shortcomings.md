# BMAD Core Shortcomings Analysis

**Document ID**: PHASE-1.1-CORE-SHORTCOMINGS-2026-01-28
**Version**: 1.0.0
**Status**: COMPLETE
**Date**: 2026-01-28
**Author**: analyst-ext

---

## Executive Summary

Analysis of BMAD core framework reveals **35+ categorized shortcomings** across 6 major categories. These shortcomings explain why the framework's **Reality Score is 35-40%** despite extensive documentation.

**Key Finding**: 80% of governance failures trace back to protocols that are documented but never enforced.

---

## Shortcoming Categories

### Category 1: No Automation (AUTO)

BMAD documents governance but doesn't automate enforcement.

| ID | Shortcoming | Impact | Evidence |
|----|-------------|--------|----------|
| AUTO-01 | No pre-execution hooks | Governance bypassed | 0% of stories run pre-checks |
| AUTO-02 | No artifact TTL enforcement | Stale context | 434 archived files, many stale |
| AUTO-03 | No automatic state sync | LOOP_STATE drift | State != reality after 2+ hours |
| AUTO-04 | No skill auto-loading | Manual skill invocation | 31% skill utilization |
| AUTO-05 | No context trimming | Window overflow | 35% overhead before work |
| AUTO-06 | No workflow auto-progression | Manual step tracking | Agents lose position |

### Category 2: No Fresh Context (CTX)

Context management is documented but not enforced.

| ID | Shortcoming | Impact | Evidence |
|----|-------------|--------|----------|
| CTX-01 | No compact-resilient state | Protocol amnesia | Governance forgotten after compact |
| CTX-02 | No context budget tracking | Overflow | 35% consumed by framework |
| CTX-03 | No priority-based loading | Wrong context first | Skills loaded before requirements |
| CTX-04 | No incremental refresh | Full reloads | Every session starts from scratch |
| CTX-05 | No context fingerprinting | Stale detection fails | Agents trust outdated info |
| CTX-06 | No cross-session persistence | State lost | Each session is isolated |

### Category 3: Too Many Workflows (FLOW)

Over-engineering creates confusion instead of clarity.

| ID | Shortcoming | Impact | Evidence |
|----|-------------|--------|----------|
| FLOW-01 | 50+ workflow files | Analysis paralysis | Agents don't know which to use |
| FLOW-02 | 7-layer wrapper hierarchy | Navigation failure | Context consumed by wrappers |
| FLOW-03 | Overlapping workflows | Conflicts | story-cycle vs story-dev-cycle |
| FLOW-04 | No workflow versioning | Breaking changes | Old steps reference deleted files |
| FLOW-05 | No workflow completion tracking | Incomplete execution | Steps skipped without detection |
| FLOW-06 | Implicit dependencies | Hidden failures | Step 3 assumes Step 2 ran |

### Category 4: Not Strict Governance (GOV)

Governance is aspirational, not operational.

| ID | Shortcoming | Impact | Evidence |
|----|-------------|--------|----------|
| GOV-01 | No gate enforcement | Bypassed gates | 98.9% non-compliance |
| GOV-02 | No escalation automation | Issues buried | Failures not surfaced |
| GOV-03 | No evidence validation | False completions | "TypeScript passes" = "Done" |
| GOV-04 | No story decomposition | Scope creep | 4-hour stories take 12 hours |
| GOV-05 | No dry-reading enforcement | Assumptions | Code first, read later |
| GOV-06 | No POC detection | Production bugs | POC stubs marked complete |

### Category 5: Less Adaptive (ADAPT)

Framework doesn't learn from failures.

| ID | Shortcoming | Impact | Evidence |
|----|-------------|--------|----------|
| ADAPT-01 | No failure pattern detection | Repeated mistakes | Same traps hit multiple times |
| ADAPT-02 | No governance self-update | Stale rules | Rules don't evolve |
| ADAPT-03 | No agent performance tracking | No improvement | Unknown who performs best |
| ADAPT-04 | No skill effectiveness metrics | Skill bloat | 82 skills, 31% used |
| ADAPT-05 | No retrospective integration | Lessons lost | Retros created, not applied |

### Category 6: Brownfield Not Addressed (BROWN)

Framework assumes greenfield development.

| ID | Shortcoming | Impact | Evidence |
|----|-------------|--------|----------|
| BROWN-01 | No legacy code integration | Parallel systems | src/lib/ still has 509 files |
| BROWN-02 | No migration path | Big-bang required | Can't incrementally adopt |
| BROWN-03 | No compatibility layer | Breaking changes | Old patterns suddenly fail |
| BROWN-04 | No deprecation automation | Manual cleanup | Files archived manually |
| BROWN-05 | No impact analysis | Unintended breaks | Changes ripple unexpectedly |

---

## Missing Critical Features

### Missing Feature 1: Adversarial Review

**What It Should Do**: Actively challenge agent assumptions before implementation.

**Current State**: Agents proceed with first interpretation without validation.

**Evidence**:
- 40% of failures = "Vague Implementation Requests"
- 35% of failures = "TypeScript = Complete"
- 0% of implementations have pre-implementation challenge

**Proposed Solution**:
```yaml
adversarial_review:
  trigger: "before any implementation"
  questions:
    - "What assumptions are you making?"
    - "What could break if those assumptions are wrong?"
    - "What evidence supports your interpretation?"
    - "Have you read the actual implementation?"
  blocking: true
```

### Missing Feature 2: Party Mode

**What It Should Do**: Coordinate multiple agents working on related tasks.

**Current State**: Agents work in isolation, creating conflicts.

**Evidence**:
- 19 coordination gaps in EPIC-0.5
- Team A and Team B step on each other
- No shared state for active documents
- No write-lock mechanism

**Proposed Solution**:
```yaml
party_mode:
  coordination:
    - shared_document_state
    - write_lock_mechanism
    - event_schema_contracts
    - plugin_capability_declarations
  agents:
    - active_agents[]
    - current_work[]
    - blocked_files[]
```

### Missing Feature 3: Preventing Agent Conflicts

**What It Should Do**: Detect and prevent conflicting changes.

**Current State**: Agents can edit same file simultaneously.

**Evidence**:
- No file locking
- No change notification
- No conflict detection
- No merge strategy

**Proposed Solution**:
```yaml
conflict_prevention:
  file_locking:
    lock_on_read: false
    lock_on_edit: true
    lock_timeout: 30_minutes
  notification:
    on_conflict: "alert_both_agents"
    on_unlock: "notify_waiting_agents"
  detection:
    pre_save_check: true
    content_hash_validation: true
```

---

## Priority Ranking

### Critical (P0) - Must Fix First

| ID | Shortcoming | Why Critical |
|----|-------------|--------------|
| AUTO-01 | No pre-execution hooks | 80% of failures from bypassed governance |
| GOV-01 | No gate enforcement | 98.9% non-compliance |
| CTX-01 | No compact-resilient state | Amnesia after every compact |
| GOV-03 | No evidence validation | False completions create rework |

### High (P1) - Fix Soon

| ID | Shortcoming | Why High |
|----|-------------|----------|
| AUTO-03 | No automatic state sync | State drift causes confusion |
| FLOW-02 | 7-layer wrapper hierarchy | 35% context overhead |
| ADAPT-01 | No failure pattern detection | Same mistakes repeated |
| GOV-04 | No story decomposition | Scope creep wastes time |

### Medium (P2) - Fix Eventually

| ID | Shortcoming | Why Medium |
|----|-------------|------------|
| AUTO-04 | No skill auto-loading | 31% utilization is inefficient |
| FLOW-03 | Overlapping workflows | Confusion but not blocking |
| BROWN-01 | No legacy integration | Migration can be manual |

### Nice-to-Have (P3)

| ID | Shortcoming | Why P3 |
|----|-------------|--------|
| ADAPT-03 | No agent performance tracking | Optimization, not critical |
| CTX-06 | No cross-session persistence | Works without it |

---

## Root Cause Analysis

### Why These Shortcomings Exist

1. **Documentation Over Automation**: Team prioritized writing governance docs over enforcing them
2. **Organic Growth**: Framework evolved without architecture review
3. **Feature Accumulation**: New features added, old ones never removed
4. **Optimism Bias**: Assumed agents would follow protocols voluntarily
5. **Complexity Tolerance**: Accepted 7-layer hierarchies as "flexible"

### The Core Problem

**BMAD is a documentation framework pretending to be a governance framework.**

It describes what should happen but provides no mechanism to ensure it does happen. This creates the illusion of control while actual compliance is 1.1%.

---

## Recommendations

### Immediate Actions

1. **Implement pre-execution hooks** that actually run before every action
2. **Create enforcement scripts** that block non-compliant actions
3. **Add compact-resilient state** that survives context reset
4. **Require evidence for completion** - no more "TypeScript passes = done"

### Architectural Changes

1. **Flatten the hierarchy** from 7 layers to 2
2. **Consolidate 82 skills** to 15-20 that actually get used
3. **Remove overlapping workflows** - one path per outcome
4. **Add automation** for everything currently "documented"

### Cultural Changes

1. **Enforce before document** - governance must be automated
2. **Simplify before extend** - no new features until old ones work
3. **Measure compliance** - track actual vs expected behavior
4. **Learn from failures** - integrate retrospective findings

---

## Conclusion

BMAD Core has 35+ shortcomings across 6 categories. The fundamental problem is that it documents governance without enforcing it. Until enforcement is automated, compliance will remain at 1.1%.

**The path forward**: Stop adding documentation, start adding automation.

---

**Document Version**: 1.0.0
**Created**: 2026-01-28
**Author**: analyst-ext
**Status**: COMPLETE
