---
name: auto-rerun-stale
description: Auto-rerun stale validation/check/diagnostic workflows (>1 hour old)
version: 1.0.0
updated: 2026-01-08
---

# Auto-Rerun Stale Artifacts Skill

**Purpose**: Automatically detect and rerun stale validation, check, scan, and diagnostic artifacts.

## Activation Triggers

This skill activates automatically when:
1. User runs any `/bmad-*` command
2. User invokes `/bmad-orchestrator`
3. User explicitly requests stale artifact cleanup
4. User mentions "rerun", "refresh", "update scan", etc.

## Timestamp Rules

| Artifact Type | Keywords | Threshold | Action |
|---------------|----------|-----------|--------|
| **Validation** | `validation`, `check`, `verify` | 1 hour | Auto-rerun if stale |
| **Diagnostics** | `scan`, `diagnostic`, `investigation` | 1 hour | Auto-rerun if stale |
| **Architecture** | `architecture`, `analysis`, `codebase` | 24 hours | Prompt user |
| **Planning** | `prd`, `epic`, `story`, `sprint` | 7 days | Prompt user |

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│           AUTO-RERUN STALE ARTIFACTS WORKFLOW                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Scan _bmad-output for stale artifacts                   │
│     • Check file modification times                         │
│     • Match against keyword thresholds                      │
│     • Compile list of stale artifacts                       │
│                                                              │
│  2. Categorize stale artifacts                              │
│     • AUTO-RERUN: validation, scan, diagnostic (>1 hour)   │
│     • PROMPT: architecture, planning (>24 hours)           │
│     • IGNORE: constitution, recent files                    │
│                                                              │
│  3. Execute auto-rerun for validation artifacts            │
│     • Archive old version to .archive/                      │
│     • Re-run the original workflow/agent                    │
│     • Update artifact with new timestamp                    │
│                                                              │
│  4. Report summary                                          │
│     • Artifacts rerun: N                                    │
│     • Artifacts fresh: M                                    │
│     • Time spent: X minutes                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

```bash
# Check for stale artifacts before running any workflow
find _bmad-output -type f -name "*.md" -mtime +1/24 | grep -E "(validation|check|scan|diagnostic)"

# Archive old version
mv _bmad-output/scans/comprehensive-diagnostic-report.md \
   _bmad-output/.archive/comprehensive-diagnostic-report-$(date +%Y%m%d-%H%M).md

# Rerun the workflow
/bmad:modules:quality:agents:state-scanner
```

## Commands

| Command | Action |
|---------|--------|
| `/auto-rerun-check` | Scan for stale artifacts without rerunning |
| `/auto-rerun-execute` | Rerun all stale validation/diagnostic artifacts |
| `/auto-rerun-dry-run` | Show what would be reruned |
| `/auto-rerun-clean` | Archive all stale continuation capsules |

## Configuration

Edit `.claude/config/auto-rerun.yaml`:

```yaml
enabled: true
auto_execute: false  # Set to true for automatic rerun without prompt
thresholds:
  validation: 1  # hours
  scan: 1        # hours
  architecture: 24  # hours
  planning: 168  # hours (7 days)
archive_path: "_bmad-output/.archive/"
```

## Output Format

```
🔄 Auto-Rerun Stale Artifacts

Scanned: 45 artifacts
Stale: 3 artifacts
Fresh: 42 artifacts

────────────────────────────────────────
Stale Artifacts (Auto-Rerun):
────────────────────────────────────────

1. _bmad-output/scans/comprehensive-diagnostic-report.md
   Age: 26.5 hours
   Threshold: 1 hour
   Action: Rerun state-scanner

2. _bmad-output/scans/state-layer-scan-report.md
   Age: 28.2 hours
   Threshold: 1 hour
   Action: Rerun state-scanner

3. _bmad-output/architecture-validation-report.md
   Age: 2.5 hours
   Threshold: 1 hour
   Action: Rerun validation

────────────────────────────────────────
Summary:
────────────────────────────────────────

✅ Rerun complete: 3 artifacts
⏱️  Time elapsed: 5 minutes
📦 Archived: _bmad-output/.archive/2026-01-08/
```

## Hook Integration

Add to `.claude/hooks/UserPromptSubmit.sh`:

```bash
#!/bin/bash

# Auto-check for stale artifacts on every user message
STALE_ARTIFACTS=$(find _bmad-output -type f -mtime +1/24 | grep -E "(validation|check|scan|diagnostic)" | wc -l)

if [ $STALE_ARTIFACTS -gt 0 ]; then
  echo "⚠️  Found $STALE_ARTIFACTS stale artifacts (>1 hour old)"
  echo "Run /auto-rerun-execute to refresh"
fi
```

---

**Version**: 1.0.0
**Updated**: 2026-01-08
**Module**: `.claude/skills/auto-rerun-stale/SKILL.md`
