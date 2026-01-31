---
artifact_id: "phase1.1-bmad-core-shortcomings-2026-01-29"
artifact_type: "analysis"
version: "1.0.0"
status: "ACTIVE"
date: "2026-01-29"
created_by: "ext-master"
phase: "1.1"
---

# Phase 1.1: BMAD Core Shortcomings

## Executive Summary

**Reality Score: 35-40%**

The BMAD framework achieves only 31% skill utilization and 1.1% governance compliance. Root cause: **frameworks designed for humans don't work for LLMs.**

## Core Problems

### 1. Documentation ≠ Enforcement

**Problem**: 35+ shortcomings documented, but no automated gates.

**Evidence**:
- 82 skills available, only 31% utilized
- 12 workflows defined, 98.9% skip validation
- 4 gates exist, but rely on memory

**Impact**: Agents don't follow rules because they're not enforced.

### 2. No Automation

**Problem**: Everything requires manual intervention.

**Evidence**:
- No auto-staleness rejection
- No auto-type checking
- No auto-governance enforcement
- No auto-context validation

**Impact**: 35.4% context overhead from manual checks.

### 3. Too Many Workflows

**Problem**: 35+ workflows, agents can't navigate.

**Evidence**:
- Missing helpful workflows (adversarial-review, party-mode)
- Not applying preventing-agent-conflicts
- Not adaptive to granular workflows

**Impact**: Agents get lost in workflow complexity.

### 4. Not Strict Governance

**Problem**: Honor system doesn't work for LLMs.

**Evidence**:
- 1.1% governance compliance
- 98.9% of stories skip validation
- No hard-blocking gates

**Impact**: Rules are ignored.

### 5. Brownfield Not Addressed

**Problem**: Generic brownfield guidance doesn't fit Project Alpha.

**Evidence**:
- src/lib/ deprecated paths not enforced
- God stores (>300 LOC) not blocked
- 503 files in wrong location
- 100+ workspaceId violations

**Impact**: Technical debt accumulates.

## Key Statistics

| Metric | Value | Impact |
|--------|-------|--------|
| Context Overhead | 35.4% | 1/3 of context consumed by framework |
| Skill Utilization | 31% | 57 of 82 skills never used |
| Governance Compliance | 1.1% | 98.9% skip validation |
| Wrapper Depth | 7 layers | 8 indirections before work |
| _bmad-ext Lines | 450,189 | Impossible to navigate |

## What OpenCode Native Fixes

| Aspect | BMAD Framework | OpenCode Native |
|--------|----------------|-----------------|
| Context Load | ~1,500 lines | ~200 lines |
| Authority Sources | 5 (conflicts) | 1 (no conflicts) |
| Enforcement | Honor system | Hook-based (automatic) |
| Skill Discovery | 82 to search | 10 directly available |
| Wrapper Depth | 7 layers | 2 layers max |
| After Compact | Lost protocols | Injected state |

## Next Steps

1. ✅ Shortcomings identified
2. ⏭️ Phase 1.2: _bmad-ext wrapper problems
3. ⏭️ Phase 1.3: LLM context failures
4. ⏭️ Phase 2: OpenCode Native design

---

**Status**: COMPLETE
**Next**: Phase 1.2