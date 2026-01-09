---
title: Governance Cycles Index
description: Master orchestration for 6-cycle governance overhaul
version: "1.0.0"
created: 2026-01-09T20:40:00+07:00
---

# Governance Cycles - Master Index

## Purpose

Reduce context poisoning through structured artifact management and workflow enforcement.

## Cycles Overview

| Cycle | Title | Agent | Duration | Status | Impact |
|-------|-------|-------|----------|--------|--------|
| 1 | [YAML Consolidation](cycle-1-yaml-consolidation.md) | SM | 1-2h | ✅ COMPLETE | HIGH |
| 2 | [Sprint Regulation](cycle-2-sprint-regulation.md) | SM | 2-3h | ⏳ PENDING | MEDIUM |
| 3 | [Standards Update](cycle-3-standards-update.md) | Tech Writer | 2-3h | ⏳ PENDING | LOW |
| 4 | [Workflow Status Schema](cycle-4-workflow-status-schema.md) | Workflow Builder | 2-3h | ⏳ PENDING | HIGH |
| 5 | [Governance Integration](cycle-5-governance-integration.md) | Workflow Builder | 2-3h | ⏳ PENDING | MEDIUM |
| 6 | [AGENTS Compression](cycle-6-agents-compression.md) | Tech Writer | 3-4h | ⏳ PENDING | HIGH |

## Execution Order

```
CYCLE 1 → CYCLE 2 → (CYCLE 3 ‖ CYCLE 4) → CYCLE 5 → CYCLE 6
         Sequential    Can run in parallel    Sequential
```

## Progress Tracking

### CYCLE 1 Results (2026-01-09T20:40)

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| YAML files in _bmad-output | 44 | 21 | -52% |
| Sprint artifact files | 6+ | 4 | -33% |
| Diagnostic folders | 4+ | 2 | -50% |
| Handoff files | 10+ | 2 | -80% |

**Archived:**
- `phase-1-sprint-status-2026-01-08.yaml`
- `course-correction-execution-status-2026-01-07.yaml`
- `course-correction-execution-status-2026-01-08.yaml`
- `codebase-diagnostic-2026-01-08/`
- `routing-deep-scan-2026-01-08/`
- Handoffs from 2026-01-08

## Token Impact Estimate

| File | Before (lines) | Target (lines) | Token Savings |
|------|----------------|----------------|---------------|
| bmm-workflow-status.yaml | 3,060 | <200 | ~15K tokens |
| AGENTS.md | 3,954 | <800 | ~20K tokens |
| CLAUDE.md | 4,133 | <600 | ~22K tokens |
| sprint-status.yaml | 1,254 | <500 | ~5K tokens |
| **Total** | **12,401** | **<2,100** | **~62K tokens** |

## Quick Commands

```bash
# Check YAML file count
find _bmad-output -name "*.yaml" -not -path "*/.archive/*" | wc -l

# Check active sprint files
ls -la _bmad-output/sprint-artifacts/*.yaml

# Check line counts
wc -l AGENTS.md CLAUDE.md bmm-workflow-status.yaml

# Run CYCLE 1 archive
mv _bmad-output/sprint-artifacts/*-2026-01-08*.yaml _bmad-output/.archive/$(date +%Y-%m-%d)/sprint-artifacts/
```

## Delegation Prompts

Each cycle file contains a complete delegation prompt ready for sub-agent use. To delegate:

1. Read the cycle file (e.g., `cycle-2-sprint-regulation.md`)
2. Execute steps in order
3. Validate using the checklist
4. Report back with handoff summary

## Automation Hooks

Future automation can integrate with:
- `.claude/hooks/` for Claude Code
- `.opencode/hooks/` for OpenCode
- CI/CD pipelines for automated checks
