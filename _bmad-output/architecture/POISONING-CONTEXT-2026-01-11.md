# Poisoning Context Report
**Date:** 2026-01-11
**Purpose:** Identify and document false/poisoning context for removal
**Status:** ACTIVE - Remediation Required

---

## Executive Summary

This document identifies poisoning context across the codebase—conflicting, outdated, or duplicate information that can lead to incorrect decisions.

**Total Poisoning Sources Identified:** 15
- **Critical:** 5 (must remove immediately)
- **High:** 6 (remove in next phase)
- **Medium:** 4 (document as deprecated)

---

## Critical Poisoning Sources (Remove Immediately)

### P1. Dual Governance Systems

**Locations:**
- `_bmad-ext/modules/governance/` (ACTIVE v2.0)
- `_bmad-ext/modules/governance-core/` (DEPRECATED)
- `_bmad-ext/.archive/2026-01-10-legacy/governance/` (Legacy)

**Poisoning Type:** Duplicate/conflicting systems

**Impact:**
- Unclear which governance system to use
- Conflicting workflow definitions
- Wasted maintenance effort

**Remediation:**
```bash
# IMMEDIATE ACTION
rm -rf _bmad-ext/modules/governance-core/
# All references updated to governance/ only
```

---

### P2. LOOP_STATE Not Initialized

**Location:** `_bmad-ext/state/LOOP_STATE.yaml`

**Poisoning Type:** Null state values

**Current State:**
```yaml
session:
  id: null           # SHOULD BE: generated UUID
  anchorTimestamp: null  # SHOULD BE: current timestamp
```

**Impact:**
- Governance and state tracking broken
- Artifact expiration doesn't work
- Session management fails

**Remediation:**
```yaml
session:
  id: "session-2026-01-11-001"
  anchorTimestamp: 1736601600000
  phase: "active"
```

---

### P3. Path Mismatches in Commands

**Location:** `.claude/commands/bmad/*.yaml`

**Poisoning Type:** Commands pointing to deprecated paths

**Issue:**
```yaml
# WRONG (deprecated)
_ref: _bmad/bmm/agents/dev.md

# SHOULD BE
_ref: _bmad-ext/agents/dev-ext.md
```

**Impact:**
- Extension layer never invoked
- Old agents used instead of enhanced versions
- Features don't work as expected

**Remediation:**
```bash
# Update all command files to use _bmad-ext/ paths
find .claude/commands/bmad/ -type f -exec sed -i '' 's/_bmad\//_bmad-ext\//g' {} \;
```

---

### P4. Conflicting ADR Locations

**Locations:**
- `_bmad-output/planning-artifacts/architecture.md` (Old ADRs)
- `_bmad-output/architecture/BMAD-ARCHITECTURE-SSOT-2026-01-11.md` (New SSOT)

**Poisoning Type:** Multiple ADR sources

**Impact:**
- Unclear which ADRs are authoritative
- Decision documentation scattered
- Conflicting architecture decisions

**Remediation:**
- SSOT document is now ONLY authoritative source
- All other ADRs deprecated
- Add deprecation notice to old files

---

### P5. Duplicate Module Definitions

**Locations:**
- `_bmad-ext/MODULE.md` (Extension modules)
- `_bmad-ext/modules/*/MODULE.md` (Individual modules)

**Poisoning Type:** Overlapping module definitions

**Impact:**
- Unclear module boundaries
- Duplicate responsibility
- Confusion about which module to use

**Remediation:**
- Consolidate to single module registry
- Remove individual MODULE.md files
- Use central MODULE.md only

---

## High Priority Poisoning Sources

### H1. Archive Sprawl

**Locations:**
- `_bmad-output/.archive/` (Multiple dated archives)
- `_bmad-ext/.archive/2026-01-10-legacy/`
- Various other archive locations

**Poisoning Type:** Scattered archives

**Impact:**
- Difficult to find historical artifacts
- Duplicate archive content
- Wasted storage

**Remediation:**
- Consolidate to single archive location
- Implement 90-day retention policy
- Remove duplicates

---

### H2. Stale Workflow Definitions

**Locations:**
- `_bmad-ext/modules/governance/workflows/*.md` (Active)
- Original `_bmad/core/workflows/*.md` (Legacy)

**Poisoning Type:** Duplicate workflows

**Impact:**
- Unclear which workflow to execute
- Conflicting workflow steps
- Maintenance burden

**Remediation:**
- Migrate to `_bmad-ext/` only
- Deprecate original workflows

---

### H3. Duplicate Sprint Status Files

**Locations:**
- `_bmad-output/sprint-artifacts/sprint-status.yaml`
- `_bmad-output/bmm-workflow-status.yaml`
- `_bmad-output/sprint-artifacts/phase-*-sprint-status-*.yaml`

**Poisoning Type:** Multiple status sources

**Impact:**
- Unclear current sprint status
- Conflicting sprint information
- Story status confusion

**Remediation:**
- `sprint-status.yaml` is ONLY source
- Consolidate all status to single file
- Remove duplicates

---

### H4. RAG Vector DB Discrepancy

**Location:** Architecture documentation

**Poisoning Type:** Documentation describes vector DB that doesn't exist

**Documented:**
```
"RAG uses embeddings and vector database for retrieval"
```

**Actual:**
```
"RAG uses Gemini multimodal API - no vector DB"
```

**Impact:**
- Architectural decisions based on false premises
- Feature requests for non-existent capabilities
- Confusion about RAG implementation

**Remediation:**
- Update all RAG documentation
- Remove vector DB references
- Document Gemini-based approach

---

### H5. Epic Index Inconsistency

**Locations:**
- `_bmad-output/epics/` (Epic files)
- `_bmad-output/sprint-artifacts/stories/STORY-INDEX.md` (Story index)

**Poisoning Type:** Epic list may differ from index

**Impact:**
- Unclear which epics are active
- Story-to-epic mapping errors
- Sprint planning confusion

**Remediation:**
- STORY-INDEX.md is single source
- Reconcile epic files with index
- Remove epic files not in index

---

### H6. State File Duplication

**Locations:**
- `_bmad-ext/state/LOOP_STATE.yaml`
- `_bmad-output/bmm-workflow-status.yaml`

**Poisoning Type:** Overlapping state tracking

**Impact:**
- State may be inconsistent
- Unclear which to update
- Potential for lost updates

**Remediation:**
- LOOP_STATE.yaml for session state
- sprint-status.yaml for sprint state
- Clear separation of concerns

---

## Medium Priority Poisoning Sources

### M1. Agent Mode Documentation

**Issue:** Documentation suggests automatic mode switching

**Actual:** Manual mode selection only

**Remediation:** Update documentation to reflect reality

---

### M2. Client Architecture Description

**Issue:** Documentation describes separate client implementations

**Actual:** Workspace-based architecture with responsive UI

**Remediation:** Update to workspace-based description

---

### M3. Tool Category Gaps

**Issue:** 10 categories documented, some tools uncategorized

**Remediation:** Complete categorization or document exceptions

---

### M4. Deprecated Core Directory

**Location:** `src/core/` (Legacy compatibility layer)

**Issue:** Re-exports domain entities, causes confusion

**Remediation:** Plan migration to direct domain imports

---

## Remediation Priority Matrix

| Priority | Count | Effort | Timeline |
|----------|-------|--------|----------|
| Critical (P*) | 5 | High | Immediate |
| High (H*) | 6 | Medium | Phase 1 |
| Medium (M*) | 4 | Low | Phase 2 |

---

## Remediation Checklist

### Immediate (Today)
- [ ] Remove `_bmad-ext/modules/governance-core/`
- [ ] Initialize LOOP_STATE.yaml with proper values
- [ ] Update command paths to `_bmad-ext/`
- [ ] Mark old ADRs as deprecated

### Phase 1 (This Week)
- [ ] Consolidate archive locations
- [ ] Migrate workflows to `_bmad-ext/` only
- [ ] Consolidate sprint status files
- [ ] Update RAG documentation

### Phase 2 (Next Week)
- [ ] Reconcile epic index with files
- [ ] Clarify state file responsibilities
- [ ] Update agent mode documentation
- [ ] Update client architecture docs

---

## Verification Commands

After remediation, verify:

```bash
# Check for remaining governance duplicates
find _bmad-ext -name "*governance*" -type f

# Check LOOP_STATE is initialized
grep -c "id: null" _bmad-ext/state/LOOP_STATE.yaml  # Should be 0

# Check command paths
grep -r "_bmad/bmm" .claude/commands/  # Should be empty

# Check for orphaned archives
find _bmad-output -name ".archive" -type d
```

---

## Related Documents

- [BMAD Architecture SSOT](_bmad-output/architecture/BMAD-ARCHITECTURE-SSOT-2026-01-11.md)
- [True Use Cases Mapping](_bmad-output/architecture/TRUE-USE-CASES-2026-01-11.md)
- [Epic/Story Remediation Plan](_bmad-output/architecture/EPIC-STORY-REMEDIATION-2026-01-11.md)

---

*Poisoning Context Analysis: 2026-01-11*
*Remediation Status: PENDING*
