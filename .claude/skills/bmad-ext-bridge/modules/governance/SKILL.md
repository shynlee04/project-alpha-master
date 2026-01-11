---
name: bmad-ext-governance-bridge
description: Bridge to BMAD-ext governance module v2.0. Provides access to unified governance, artifact lifecycle, context filtering, and stale detection workflows. Use when needing self-governance, artifact management, or context validation.
version: 2.0.0
category: bridge
parent: bmad-ext-bridge
children:
  - governance-context-first
  - governance-expert-analysis
  - governance-research-trigger
  - governance-correct-course
priority: 11
agents:
  - governance-enforcer
triggers:
  - governance
  - artifact lifecycle
  - context filtering
  - stale detection
  - /ext-governance
  - /governance
---

# BMAD-EXT Governance Bridge

**Purpose**: Gateway to BMAD-ext governance module with 4-tier TTL system, self-governance triggers, and artifact lifecycle management.

## Module Overview

**Location**: `_bmad-ext/modules/governance/`
**Version**: 2.0.0 (Consolidated)
**Status**: ACTIVE
**Phase**: 0 (Governance Foundation)

## 4-Tier TTL System

| Tier | Name | TTL | Action |
|------|------|-----|--------|
| 1 | Constitution | Permanent | Never archive - read-only |
| 2 | Controlled | Permanent | Update iteratively - single source |
| 3 | Archival | 90 days | Archive if stale |
| 4 | Ephemeral | 24 hours | Auto-purge if stale |

## Self-Governance Triggers

Governance is triggered automatically at these points:

1. **On Session Start** → Check all active artifacts for staleness
2. **On Artifact Creation** → Register with timestamp and TTL
3. **On Step Completion** → Validate context freshness
4. **On Story Completion** → Run full artifact scan
5. **On Epic Completion** → Run comprehensive governance check

## Three Enforcement Checks

Before any development work, the system performs:

1. **Context-First** → Gather relevant context, auto-transform prompt
2. **Expert Analysis** → Define bug/error level, compare with codebase
3. **Research Trigger** → Internet-based validation for tech choices

## Workflows

### 1. Context-First Workflow

**Purpose**: Gather relevant context and auto-transform user prompt

**Steps**:
1. Scan active artifacts
2. Load relevant context slices
3. Transform prompt with context
4. Validate context freshness

**Location**: `workflows/context-first/`

### 2. Expert Analysis Workflow

**Purpose**: Define bug/error level and compare with codebase

**Steps**:
1. Analyze issue description
2. Classify severity (P0-P3)
3. Compare with existing codebase patterns
4. Generate expert recommendation

**Location**: `workflows/expert-analysis/`

### 3. Research Trigger Workflow

**Purpose**: Internet-based validation for technology choices

**Steps**:
1. Identify research topics
2. Execute MCP research queries
3. Analyze findings
4. Generate research report

**Location**: `workflows/research-trigger/`

### 4. Correct-Course Workflow

**Purpose**: Recovery workflow when story is stuck or validation fails

**Steps**:
1. Receive report
2. Categorize issue
3. Route to resolution
4. Complete recovery

**Location**: `workflows/correct-course/`

## Integration Points

### Reads From
- `_bmad-ext/state/LOOP_STATE.yaml` - Session state
- `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` - Active artifacts
- `bmm-workflow-status.yaml` - Story progress

### Writes To
- `_bmad-ext/state/LOOP_STATE.yaml` - Governance updates
- `AGENTS.md` - Governance section updates
- `_bmad-output/.archive/` - Archived artifacts

## Governance Metrics

Track in `LOOP_STATE.governance`:

```yaml
governance:
  last_check: "2026-01-11T10:00:00Z"
  stale_detected: 0
  artifacts_scanned: 15
  contexts_validated: 8
  auto_archives: 2
  health_score: 95
```

## Quick Commands

| Command | Action |
|---------|--------|
| `/ext-governance` | Load governance bridge |
| `/context-first` | Execute context-first workflow |
| `/expert-analysis` | Execute expert analysis |
| `/research-trigger` | Execute research workflow |
| `/correct-course` | Recovery workflow |
| `/governance-scan` | Scan for stale artifacts |

## Usage Pattern

```bash
# Session start governance check
1. Load this bridge skill
2. Invoke: check-artifacts scope="current-session"
3. Return: stale_detected, artifacts_scanned, health_score

# Before development work
1. Load: context-first workflow
2. Execute: gather and validate context
3. Load: expert-analysis workflow
4. Execute: analyze and classify issue
5. Load: research-trigger workflow
6. Execute: validate tech choices
7. Proceed only if all checks pass
```

---

**Source**: `_bmad-ext/modules/governance/MODULE.md`
**Version**: 2.0.0
**Last Updated**: 2026-01-11
