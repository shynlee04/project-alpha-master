# EPIC-CTX-CLEAN: Context & Governance Document Remediation

**Created**: 2026-01-25
**Priority**: P1 (Critical for agent coordination)
**Estimated Effort**: 4-6 hours
**Status**: READY_FOR_PLANNING
**ADR Reference**: ADR-034-project-centric-architecture-2026-01-20.md

---

## Executive Summary

The BMAD framework governance documents have become **context poisoned** with:
1. Superseded ADRs still referenced as authoritative
2. YAML files with syntax errors
3. Outdated epic/story tracking
4. Conflicting architectural decisions

This epic cleans up all context documents to establish **single source of truth**.

---

## Problem Statement

### Current State

| Document | Issue | Impact |
|----------|-------|--------|
| `sprint-status.yaml` | 1300+ lines, YAML syntax errors, duplicate keys | Agents cannot parse |
| `bmm-workflow-status.yaml` | YAML syntax errors, outdated phases | Workflow routing fails |
| `LOOP_STATE.yaml` | Last updated 2026-01-21, references old epics | Stale context |
| `architecture.md` | References ADR-033, ADR-035 (superseded) | Conflicting guidance |
| `prd.md` | References old architecture | Outdated requirements |
| ADR-033, ADR-035 | Still active, should be SUPERSEDED | Agents follow wrong patterns |
| ADR-036 | Two versions exist | Ambiguous authority |

### Authoritative Documents (KEEP)

| Document | Status | Authority |
|----------|--------|-----------|
| `ADR-034-project-centric-architecture-2026-01-20.md` | APPROVED | PRIMARY |
| `ADR-034-AMENDMENT-001-platform-first-2026-01-21.md` | APPROVED | PRIMARY |
| `new-fundamental-truths.md` | USER CREATED | STRATEGIC VISION |
| `EPIC-ARCH-01-foundation-cleanup-2026-01-20.md` | ACTIVE | Epic tracking |
| `EPIC-ARCH-02-feature-plugins-2026-01-20.md` | ACTIVE | Epic tracking |
| `EPIC-ARCH-03-layout-ux-2026-01-21.md` | ACTIVE | Epic tracking |

---

## Proposed Stories

### CTX-01: Archive Superseded ADRs (P0)
**Effort**: 1 hour
**Description**: Mark ADR-033, ADR-035 as SUPERSEDED, consolidate ADR-036 versions
**Deliverables**:
- Add SUPERSEDED header to ADR-033, ADR-035
- Consolidate ADR-036 to single version
- Update ADR index

### CTX-02: Fix YAML Syntax Errors (P0)
**Effort**: 2 hours
**Description**: Fix all YAML files with parse errors
**Files**:
- `sprint-status.yaml` - Fix duplicate keys, indentation
- `bmm-workflow-status.yaml` - Fix column alignment
**Approach**: May need to regenerate from scratch with only current data

### CTX-03: Update architecture.md (P1)
**Effort**: 1 hour
**Description**: Update architecture.md to reference only ADR-034
**Deliverables**:
- Remove all ADR-033, ADR-035 references
- Update architecture diagrams to project-centric model
- Align with `new-fundamental-truths.md`

### CTX-04: Update prd.md (P1)
**Effort**: 1 hour
**Description**: Update PRD with current architecture
**Deliverables**:
- Remove workspace-centric references
- Update to project-centric with plugins model
- Align feature list with current scope

### CTX-05: Reset LOOP_STATE.yaml (P0)
**Effort**: 30 minutes
**Description**: Reset LOOP_STATE to current reality
**Deliverables**:
- Update session_id
- Set current epic to EPIC-ARCH-03
- Clear completed old sprints
- Update anchor timestamp

### CTX-06: Clean sprint-status.yaml (P2)
**Effort**: 1 hour
**Description**: Reduce sprint-status.yaml to manageable size
**Approach**:
- Archive completed epics older than 7 days
- Keep only active: EPIC-ARCH-01, EPIC-ARCH-02, EPIC-ARCH-03
- Target: <300 lines

### CTX-07: Update AGENTS.md and CLAUDE.md (P1)
**Effort**: 1 hour
**Description**: Align governance docs with current state
**Deliverables**:
- Update current epic tracking
- Remove ARC-A01 through ARC-B04 references (old naming)
- Add EPIC-ARCH-03 status

---

## Success Criteria

| Metric | Target |
|--------|--------|
| YAML parse errors | 0 |
| ADR conflicts | 0 (single authority: ADR-034) |
| LOOP_STATE freshness | < 24 hours |
| sprint-status.yaml size | < 300 lines |
| Agent confusion | 0 (clear single source of truth) |

---

## Execution Strategy

1. **Fix YAML first** - Agents cannot work with broken YAML
2. **Archive ADRs** - Remove conflicting guidance
3. **Update core docs** - architecture.md, prd.md
4. **Reset state** - LOOP_STATE.yaml fresh start
5. **Validate** - All agents can parse all files

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking agent workflows | Medium | High | Test parsing after each change |
| Losing historical context | Low | Medium | Archive, don't delete |
| Incomplete updates | Medium | Medium | Use checklist validation |

---

## Notes

This is **governance hygiene**, not feature development. It enables future work by ensuring all agents have consistent, accurate context.

Priority: Complete BEFORE starting any new feature epics.
