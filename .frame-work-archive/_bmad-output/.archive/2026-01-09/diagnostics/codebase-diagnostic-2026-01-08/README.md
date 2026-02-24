---
title: Codebase Diagnostic - Agent Delegation Guide
date: 2026-01-08
workflow: codebase-diagnostic
version: 1.0.0
---

# Codebase Diagnostic - Agent Delegation Guide

**Workflow:** `codebase-diagnostic`
**Date:** 2026-01-08
**Location:** `_bmad-output/diagnostics/codebase-diagnostic-2026-01-08/`

---

## Quick Start

This folder contains all handoff documents for delegating the codebase diagnostic workflow to sub-agents.

### To Execute the Workflow:

1. **Start with Phase 0** (Structure Mapping)
   - Read: `handoff-phase-0-structure.md`
   - Delegate Sub-Agent 0.1 to: `@bmad-bmm-dev` or `@feature-dev:code-explorer`
   - Delegate Sub-Agent 0.2 to: `@bmad-bmm-architect`

2. **Continue to Phase 1-5** after Phase 0 completes
   - Each phase has its own handoff document
   - Follow the delegation instructions

3. **Generate FINAL-REPORT** in Phase 6
   - Synthesizes all findings
   - Creates actionable remediation plan

---

## Folder Structure

```
codebase-diagnostic-2026-01-08/
├── README.md                           # This file
├── PROGRESS.md                          # Progress tracker
├── handoff-phase-0-structure.md         # Phase 0 delegation
├── handoff-phase-1-journeys.md          # Phase 1 delegation
├── handoff-phase-2-dataflow.md          # Phase 2 delegation
├── handoff-phase-3-performance.md       # Phase 3 delegation
├── handoff-phase-4-features.md          # Phase 4 delegation
├── handoff-phase-5-integration.md       # Phase 5 delegation
├── handoff-phase-6-synthesis.md         # Phase 6 delegation (FINAL)
├── phase-0/                             # Phase 0 outputs
├── phase-1/                             # Phase 1 outputs
├── phase-2/                             # Phase 2 outputs
├── phase-3/                             # Phase 3 outputs
├── phase-4/                             # Phase 4 outputs
├── phase-5/                             # Phase 5 outputs
├── phase-6/                             # Phase 6 outputs
└── FINAL-REPORT.md                      # Generated after Phase 6
```

---

## Delegation Summary

| Phase | Name | Sub-Agents | Agent Modes |
|-------|------|------------|-------------|
| 0 | Structure Mapping | 2 | dev, architect |
| 1 | User Journeys | 7 | dev (all) |
| 2 | Data Flow | 5 | architect, dev |
| 3 | Performance | 3 | performance, architect, dev |
| 4 | Features | 6 | dev (all) |
| 5 | Integration | 2 | architect (both) |
| 6 | Synthesis | 2 | pm, master |

**Total: 27 sub-agent delegations**

---

## Agent Mode Reference

### For Development Tasks:
- `@bmad-bmm-dev` - General feature implementation
- `@feature-dev:code-explorer` - Codebase exploration and analysis

### For Architecture Tasks:
- `@bmad-bmm-architect` - System design and architecture

### For Performance Tasks:
- `@experienced-engineer:performance-engineer` - Performance analysis

### For Coordination:
- `@bmad-core-bmad-master` - Orchestrator (you)
- `@bmad-bmm-pm` - Product management and planning
- `@bmad-bmm-sm` - Story management

---

## Execution Commands

### To start a phase:
```
Read: handoff-phase-N-[name].md
Delegate sub-agents as instructed
Wait for completion
Synthesize results
Update PROGRESS.md
```

### To check progress:
```
Read: PROGRESS.md
```

### To force synthesis:
```
Read all phase-N outputs
Create phase-N-summary.md
Update PROGRESS.md
```

---

## Output Files Expected

### Phase 0 (Structure)
- `phase-0/file-inventory.md`
- `phase-0/dependency-graph.md`
- `phase-0/phase-0-summary.md`

### Phase 1 (Journeys)
- `phase-1/journey-first-time-user.md`
- `phase-1/journey-hub-to-notes.md`
- `phase-1/journey-hub-to-ide.md`
- `phase-1/journey-hub-to-knowledge.md`
- `phase-1/journey-hub-to-study.md`
- `phase-1/journey-project-creation.md`
- `phase-1/journey-cross-workspace.md`
- `phase-1/phase-1-summary.md`

### Phase 2 (Data Flow)
- `phase-2/zustand-inventory.md`
- `phase-2/dexie-analysis.md`
- `phase-2/uselivequery-audit.md`
- `phase-2/event-bus-analysis.md`
- `phase-2/context-analysis.md`
- `phase-2/phase-2-summary.md`

### Phase 3 (Performance)
- `phase-3/load-time-analysis.md`
- `phase-3/db-operations-analysis.md`
- `phase-3/rerender-analysis.md`
- `phase-3/phase-3-summary.md`

### Phase 4 (Features)
- `phase-4/feature-notes.md`
- `phase-4/feature-ide.md`
- `phase-4/feature-knowledge.md`
- `phase-4/feature-study.md`
- `phase-4/feature-hub.md`
- `phase-4/feature-agents.md`
- `phase-4/phase-4-summary.md`

### Phase 5 (Integration)
- `phase-5/cross-feature-deps.md`
- `phase-5/shared-infra.md`
- `phase-5/phase-5-summary.md`

### Phase 6 (Synthesis)
- `phase-6/issue-correlation.md`
- `phase-6/remediation-plan.md`
- `FINAL-REPORT.md`

---

## Validation Checklist

Before marking workflow complete:

- [ ] All 7 handoff documents reviewed
- [ ] All 26 sub-agent prompts executed
- [ ] All phase summaries created
- [ ] FINAL-REPORT.md generated
- [ ] PROGRESS.md shows 100% complete
- [ ] Architecture health score calculated
- [ ] Remediation roadmap created
- [ ] Verification checklist documented

---

## Troubleshooting

### If a sub-agent fails:
1. Check the handoff document for clear instructions
2. Verify the agent mode is appropriate
3. Re-run with more specific constraints
4. Document failure in PROGRESS.md

### If synthesis fails:
1. Verify all sub-agent outputs exist
2. Check for missing or incomplete outputs
3. Re-run failed sub-agent prompts
4. Manually synthesize if needed

### If workflow must pause:
1. Update PROGRESS.md with current state
2. Document what was completed
3. Note what remains
4. Save session state

---

**Generated by:** bmad-master orchestrator
**Date:** 2026-01-08
**Status:** Ready for execution
