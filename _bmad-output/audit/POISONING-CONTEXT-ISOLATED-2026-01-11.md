# Poisoning Context Isolation Report
**Date:** 2026-01-11
**description:** Quarantine all poisoning context sources to prevent contamination
**Status:** ACTIVE - Use only approved sources

---

## Executive Summary

This report isolates all 15 identified poisoning context sources to prevent their use in decision-making. **Use only the approved single sources of truth listed below.**

**Total Poisoning Sources:** 15
- **Critical:** 5 (must NOT use)
- **High:** 6 (avoid, use approved alternatives)
- **Medium:** 4 (deprecated for reference only)

---

## Critical Poisoning Sources (DO NOT USE)

### P1. Dual Governance Systems

**QUARANTINED PATHS:**
- `_bmad-ext/modules/governance-core/` → **DELETE IMMEDIATELY**
- `_bmad-ext/.archive/2026-01-10-legacy/governance/` → Reference only

**APPROVED ALTERNATIVE:**
- `_bmad-ext/modules/governance/` (v2.0 - ACTIVE)

**Poisoning Type:** Duplicate/conflicting systems
**Severity:** Critical
**Action:** Remove `governance-core/` entirely

---

### P2. LOOP_STATE Not Initialized

**QUARANTINED FILE:**
- `_bmad-ext/state/LOOP_STATE.yaml` → Contains null values

**Current Poisoned State:**
```yaml
session:
  id: null           # BROKEN - causes governance failure
  anchorTimestamp: null  # BROKEN - breaks artifact TTL
```

**Required State:**
```yaml
session:
  id: "session-2026-01-11-001"
  anchorTimestamp: 1736601600000
  phase: "active"
```

**Severity:** Critical
**Action:** Initialize with proper session values

---

### P3. Path Mismatches in Commands

**QUARANTINED PATTERN:**
```yaml
_ref: _bmad/bmm/agents/  # WRONG - deprecated
```

**APPROVED PATTERN:**
```yaml
_ref: _bmad-ext/agents/  # CORRECT - active implementation
```

**Affected Files:**
- `.claude/commands/bmad/*.yaml`

**Severity:** Critical
**Action:** Update all command paths to `_bmad-ext/`

---

### P4. Conflicting ADR Locations

**QUARANTINED LOCATIONS:**
- `_bmad-output/planning-artifacts/architecture.md` → Old ADRs
- Any ADR files outside `_bmad-output/architecture/`

**APPROVED SOURCE:**
- `_bmad-output/architecture/BMAD-ARCHITECTURE-SSOT-2026-01-11.md` (ONLY authoritative source)

**Severity:** Critical
**Action:** Use SSOT only, deprecate all other ADR locations

---

### P5. Duplicate Module Definitions

**QUARANTINED:**
- `_bmad-ext/modules/*/MODULE.md` (Individual module files)

**APPROVED:**
- `_bmad-ext/MODULE.md` (Central registry only)

**Severity:** Critical
**Action:** Use central module registry, remove individual files

---

## High Priority Poisoning Sources (Use Approved Alternatives)

### H1. Archive Sprawl

**QUARANTINED:**
- `_bmad-output/.archive/` (Multiple dated archives)
- Various scattered archive locations

**APPROVED:**
- Single archive at `_bmad-output/.archive/YYYY-MM-DD/`
- 90-day retention policy

**Severity:** High
**Action:** Consolidate to single archive location

---

### H2. Stale Workflow Definitions

**QUARANTINED:**
- `_bmad/core/workflows/*.md` (Legacy)

**APPROVED:**
- `_bmad-ext/modules/governance/workflows/*.md` (Active)

**Severity:** High
**Action:** Use `_bmad-ext/` workflows only

---

### H3. Duplicate Sprint Status Files

**QUARANTINED:**
- `_bmad-output/bmm-workflow-status.yaml`
- `_bmad-output/sprint-artifacts/phase-*-sprint-status-*.yaml`

**APPROVED:**
- `_bmad-output/sprint-artifacts/sprint-status.yaml` (ONLY source)

**Severity:** High
**Action:** Consolidate all status to single file

---

### H4. RAG Vector DB Discrepancy

**QUARANTINED STATEMENT:**
> "RAG uses embeddings and vector database for retrieval"

**APPROVED TRUTH:**
> "RAG uses Google Gemini multimodal API - no vector database"

**Location:** Various architecture documents
**Severity:** High
**Action:** Correct all RAG documentation

---

### H5. Epic Index Inconsistency

**QUARANTINED:**
- `_bmad-output/epics/` (Individual epic files)

**APPROVED:**
- `_bmad-output/sprint-artifacts/stories/STORY-INDEX.md` (Single source)

**Severity:** High
**Action:** Use STORY-INDEX.md only

---

### H6. State File Duplication

**QUARANTINED:**
- `_bmad-output/bmm-workflow-status.yaml` (Overlaps with LOOP_STATE)

**APPROVED:**
- `LOOP_STATE.yaml` for session state
- `sprint-status.yaml` for sprint state

**Severity:** High
**Action:** Clear separation of concerns

---

## Medium Priority Poisoning Sources (Deprecated)

### M1. Agent Mode Documentation

**QUARANTINED CLAIM:**
> "Automatic mode switching based on context"

**APPROVED TRUTH:**
> "Manual mode selection only"

**Action:** Update documentation to reflect reality

---

### M2. Client Architecture Description

**QUARANTINED CLAIM:**
> "Separate client implementations (phone, desktop)"

**APPROVED TRUTH:**
> "Workspace-based architecture with responsive UI"

**Action:** Update to workspace-based description

---

### M3. Tool Category Gaps

**ISSUE:** 10 categories documented, some tools uncategorized

**Action:** Complete categorization or document exceptions

---

### M4. Deprecated Core Directory

**LOCATION:** `src/core/`

**ISSUE:** Re-exports domain entities, causes confusion

**ACTION:** Plan migration to direct domain imports

---

## Approved Single Sources of Truth

### Architecture

| Document | Location | description |
|----------|----------|---------|
| BMAD Architecture SSOT | `_bmad-output/architecture/BMAD-ARCHITECTURE-SSOT-2026-01-11.md` | ONLY authoritative ADR source |
| True Use Cases | `_bmad-output/architecture/TRUE-USE-CASES-2026-01-11.md` | Ground truth implementation |
| Remediated Architecture | `_bmad-output/architecture/architecture-REMEDIATED-2026-01-11.md` | Updated architecture.md |

### Epics and Stories

| Document | Location | description |
|----------|----------|---------|
| Remediated Epics | `_bmad-output/architecture/EPICS-REMEDIATED-2026-01-11.md` | ONLY epic/story source |
| Story Index | `_bmad-output/sprint-artifacts/stories/STORY-INDEX.md` | Story tracking |

### Sprint Planning

| Document | Location | description |
|----------|----------|---------|
| Sprint Status | `_bmad-output/sprint-artifacts/sprint-status.yaml` | ONLY sprint status |
| Remediated Sprint Plan | `_bmad-output/sprint-artifacts/sprint-plan-REMEDIATED-2026-01-11.md` | Chronological sprints |

### Remediation

| Document | Location | description |
|----------|----------|---------|
| Poisoning Context | `_bmad-output/architecture/POISONING-CONTEXT-2026-01-11.md` | Detailed poisoning analysis |
| Epic/Story Remediation | `_bmad-output/architecture/EPIC-STORY-REMEDIATION-2026-01-11.md` | Remediation phases |
| Architecture Index | `_bmad-output/architecture/ARCHITECTURE-INDEX-2026-01-11.md` | Master index |

---

## Quarantine List (DO NOT USE)

### Commands - Wrong Paths
```bash
# DO NOT USE THESE PATTERNS:
_ref: _bmad/bmm/
_ref: _bmad/core/

# USE INSTEAD:
_ref: _bmad-ext/
```

### Governance - Duplicate Systems
```bash
# DO NOT USE:
_bmad-ext/modules/governance-core/
_bmad-ext/.archive/2026-01-10-legacy/governance/

# USE INSTEAD:
_bmad-ext/modules/governance/
```

### ADRs - Multiple Locations
```bash
# DO NOT USE:
_bmad-output/planning-artifacts/architecture.md (for ADRs)
Any ADRs outside _bmad-output/architecture/

# USE INSTEAD:
_bmad-output/architecture/BMAD-ARCHITECTURE-SSOT-2026-01-11.md
```

### Sprint Files - Duplicates
```bash
# DO NOT USE:
_bmad-output/bmm-workflow-status.yaml
_bmad-output/sprint-artifacts/phase-*-sprint-status-*.yaml

# USE INSTEAD:
_bmad-output/sprint-artifacts/sprint-status.yaml
```

---

## Remediation Status

| Priority | Count | Status |
|----------|-------|--------|
| Critical | 5 | Remediation Pending |
| High | 6 | Remediation Pending |
| Medium | 4 | Documented as Deprecated |

---

## Immediate Actions Required

```bash
# 1. Remove deprecated governance
rm -rf _bmad-ext/modules/governance-core/

# 2. Initialize LOOP_STATE
# Edit _bmad-ext/state/LOOP_STATE.yaml with proper values

# 3. Update command paths
find .claude/commands/bmad/ -type f -exec sed -i '' 's/_bmad\//_bmad-ext\//g' {} \;

# 4. Verify no null values
grep -c "id: null" _bmad-ext/state/LOOP_STATE.yaml  # Should be 0
```

---

## Verification After Remediation

```bash
# Check for remaining governance duplicates
find _bmad-ext -name "*governance*" -type d

# Verify LOOP_STATE initialized
grep -E "id: null|anchorTimestamp: null" _bmad-ext/state/LOOP_STATE.yaml

# Check command paths updated
grep -r "_bmad/bmm" .claude/commands/

# Verify single ADR source
ls -la _bmad-output/architecture/BMAD-ARCHITECTURE-SSOT-*.md
```

---

## Related Documents

- [BMAD Architecture SSOT](_bmad-output/architecture/BMAD-ARCHITECTURE-SSOT-2026-01-11.md)
- [True Use Cases Mapping](_bmad-output/architecture/TRUE-USE-CASES-2026-01-11.md)
- [Epic/Story Remediation Plan](_bmad-output/architecture/EPIC-STORY-REMEDIATION-2026-01-11.md)
- [Sprint Status](_bmad-output/sprint-artifacts/sprint-status.yaml)

---

*Poisoning Context Isolation: 2026-01-11*
*Status: Active - Use approved sources only*
