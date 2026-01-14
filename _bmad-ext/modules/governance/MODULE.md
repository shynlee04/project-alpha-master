# BMAD Extension Layer - Unified Governance Module v2.1

**Version**: 2.1.0
**Status**: ACTIVE
**Created**: 2026-01-11
**Updated**: 2026-01-11

## description

Unified governance module that consolidates all self-governance, artifact management, context filtering, and stale document detection. This is the **single source of truth** for all extension layer governance.

## Timing Governance (Based on Actual Data)

> **Source**: `bmm-workflow-status.yaml` timing analysis

### Real Timing Standards

| Work Unit | Actual Average | Examples |
|-----------|----------------|----------|
| **Story (simple)** | 1-2 hours | FS-05: 1.5h, MOBILE stories |
| **Story (complex)** | 2-4 hours | 40-01 Tool Registry: ~3h |
| **Epic (6-8 stories)** | 4-8 hours | EPIC-40: 12 stories/day |
| **Epic (mini 3-4)** | 2-4 hours | EPIC-39: 4 stories/day |

### Velocity Reality

```
NORMAL: 4-8 stories/day, 1-3 epics/day
EXCEPTIONAL: 2-3 epics/day in flow state
```

### Time-Boxing Rules

| Level | Duration | On Timeout |
|-------|----------|------------|
| Step | 15 min | Escalate to story |
| Story | 4 hours max | Split or continue |
| Deep Investigation | 30 min | Split story |
| Epic | 8 hours | Adjust scope |

## Why v2.0

This version consolidates the duplicate structures from:
- `_bmad-ext/modules/governance/` (Phase 0 complex structure)
- `_bmad-ext/modules/governance-core/` (Similar but separate)

The duplication caused:
- Confusion about which module to use
- Overlapping functionality
- Neither fully integrated into the command system

## Core Concepts

### 1. The 4-Tier TTL System

| Tier | Name | TTL | Action |
|------|------|-----|--------|
| 1 | Constitution | Permanent | Never archive - read-only |
| 2 | Controlled | Permanent | Update iteratively - single source |
| 3 | Archival | 90 days | Archive if stale |
| 4 | Ephemeral | 24 hours | Auto-purge if stale |

### 2. Self-Governance Triggers

Governance is triggered automatically at these points:

1. **On Session Start** → Check all active artifacts for staleness
2. **On Artifact Creation** → Register with timestamp and TTL
3. **On Step Completion** → Validate context freshness
4. **On Story Completion** → Run full artifact scan
5. **On Epic Completion** → Run comprehensive governance check

### 3. The Three Enforcement Checks

Before any development work, the system performs:

1. **Context-First** → Gather relevant context, auto-transform prompt
2. **Expert Analysis** → Define bug/error level, compare with codebase
3. **Research Trigger** → Internet-based validation for tech choices

## Module Structure

```
governance/
├── MODULE.md                          # This file
├── config/
│   ├── module.yaml                    # Module configuration
│   ├── domains.yaml                   # Domain classifications (13 domains)
│   └── retention-policy.yaml          # TTL and archiving rules
├── policies/
│   ├── artifact-lifecycle.md          # Artifact creation → archive → purge
│   ├── context-strategy.md            # Context filtering and TTL rules
│   └── gating-policy.md               # Gatekeeping before work
├── scanners/
│   ├── artifact-scanner.md            # Detect stale artifacts
│   └── context-scanner.md             # Detect stale context
├── workflows/
│   ├── self-governance-cycle.md       # Main governance loop
│   └── stale-detection.md             # Stale document detection
└── utils/
    ├── timestamp-validator.ts         # Date/time validation helpers
    └── artifact-registry.ts           # Artifact tracking operations
```

## Quick Start

### For Claude Code

```bash
# Load governance module
/correct-course

# This triggers the self-governance cycle before any work
```

### For Open Code

```bash
# Via ext-master agent
/ext-master
# Select: Governance Module
```

### Direct Integration

```yaml
# In any workflow or agent
action: "invoke-governance"
module: "_bmad-ext/modules/governance"
task: "check-artifacts"
params:
  scope: "current-session"
```

## Integration Points

### Reads From
- `_bmad-ext/state/LOOP_STATE.yaml` - Session state
- `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` - Active artifacts
- `bmm-workflow-status.yaml` - Story progress

### Writes To
- `_bmad-ext/state/LOOP_STATE.yaml` - Governance updates
- `AGENTS.md` - Governance section updates
- `_bmad-output/.archive/` - Archived artifacts

### Invoked By
- `_bmad-ext/orchestrator/master-orchestrator.md` - On step completion
- `.claude/hooks/` - Session start/user prompt hooks
- Any enhanced agent - On artifact creation

## Governance Metrics

Track these in `LOOP_STATE.governance`:

```yaml
governance:
  last_check: "2026-01-11T10:00:00Z"
  stale_detected: 0
  artifacts_scanned: 15
  contexts_validated: 8
  auto_archives: 2
  health_score: 95
```

## Migration from v1.0

If you have artifacts in the old modules:

1. **governance/** → Use this module instead
2. **governance-core/** → Use this module instead (hooks moved to `.claude/hooks/`)

The old modules are now deprecated and will be archived in the next update.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1.0 | 2026-01-11 | Added realistic timing governance |
| 2.0.0 | 2026-01-11 | Consolidated from governance/ + governance-core/ |
| 1.0.0 | 2026-01-10 | Initial governance module (now deprecated) |
