# Sprint-Planning Wrapper Module

**Version**: 1.0.0
**Last Updated**: 2026-01-11
**Status**: Active

## Purpose

Wraps the existing BMAD `sprint-planning` workflow with auto gatekeeping, looping, automation, and handoff work. Adds **Cohesion & Reality validation** to prevent "Dual Chat" type failures.

## Problem Statement

The original `sprint-planning` workflow generates `sprint-status.yaml` from epics but lacks:
- ❌ Cohesion validation (detects fragmented UX across stories)
- ❌ Dependency mapping (finds hidden story dependencies)
- ❌ Narrative validation ("Movie Script Test" for entire sprint)
- ❌ Auto gatekeeping (loop back on validation failures)

## Solution: Wrapper Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  SPRINT-PLANNING WRAPPER                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Input: Epic files from _bmad/planning-artifacts/            │
│         (Consumed from BMAD sprint-planning)                 │
│                         ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Step 1: Discover Epics (scan epic files)               │ │
│  │ Step 2: Generate Status (run BMAD generator)           │ │
│  │ Step 3: Cohesion Check ← NEW (validate sprint flow)    │ │
│  │ Step 4: Dependency Map ← NEW (find hidden deps)        │ │
│  │ Step 5: Reality Validation ← NEW (Movie Script Test)   │ │
│  │ Step 6: Gatekeeping (auto-validation & loop)            │ │
│  │ Step 7: Handoff (prepare for story execution)           │ │
│  └────────────────────────────────────────────────────────┘ │
│                         ↓                                   │
│  Output: Enhanced sprint-status.yaml                        │
│          + Cohesion report                                  │
│          + Dependency map                                    │
│          + Demo script (30-second narrative)                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Workflow: Sprint-Planning Enhanced

**Location**: `_bmad-ext/modules/sprint-planning-wrapper/workflows/sprint-planning-enhanced/`

**Steps**:
1. **Discover Epics**: Scan for epic files in planning artifacts
2. **Generate Status**: Run BMAD sprint-planning workflow to generate baseline
3. **Cohesion Check**: Validate sprint cohesion, detect fragmentation
4. **Dependency Map**: Map cross-story dependencies, find conflicts
5. **Reality Validation**: Generate 30-second demo script for entire sprint
6. **Gatekeeping**: Auto-validation with loop-back on failures
7. **Handoff**: Prepare enhanced context for story-cycle execution

## Scanners

### Cohesion Scanner
Detects fragmented UX across stories:
- **Narrative Check**: 30-second demo script for entire sprint
- **Dependency Friction**: Story completion vs dependency start conflicts
- **Ghost Logic**: Missing error/empty/loading states

### Dependency Scanner
Finds hidden cross-story dependencies:
- **Explicit Dependencies**: Listed in story files
- **Implicit Dependencies**: Shared components, data flow
- **Temporal Conflicts**: Story A finishes Day 4, Story B needs it Day 1

### Nonsense Detector
Spot "Dual Chat" type issues:
- **Duplicate Workflows**: Multiple ways to do same thing
- **Contradictory Requirements**: Stories that conflict
- **Orphan Features**: Features with no entry point

## Config Files

### gating-rules.yaml
Auto-validation rules:
- Coverage thresholds
- Cohesion score requirements
- Dependency conflict rules
- Loop-back triggers

### cohesion-patterns.yaml
Known anti-patterns to detect:
- Fragmented UX patterns
- State inconsistencies
- Context switching violations

## Integration Points

### Consumes From (Read-Only)
- `_bmad/bmm/workflows/4-implementation/sprint-planning/workflow.yaml`
- `_bmad/bmm/workflows/4-implementation/sprint-planning/instructions.md`
- `_bmad/bmm/workflows/4-implementation/sprint-planning/checklist.md`
- `_bmad/bmm/workflows/4-implementation/sprint-planning/sprint-status-template.yaml`

### Produces
- `sprint-status.yaml` - Enhanced with cohesion flags
- `cohesion-report-{date}.md` - Sprint cohesion analysis
- `dependency-map.yaml` - Cross-story dependency graph
- `demo-script.md` - 30-second sprint narrative

### Hands Off To
- `_bmad-ext/modules/implementation/workflows/story-cycle/` - Story execution

## File Structure

```
_bmad-ext/modules/sprint-planning-wrapper/
├── MODULE.md                              # This file
├── workflows/
│   └── sprint-planning-enhanced/
│       ├── workflow.md                    # Workflow definition
│       └── steps/
│           ├── step-01-discover-epics.md
│           ├── step-02-generate-status.md
│           ├── step-03-cohesion-check.md
│           ├── step-04-dependency-map.md
│           ├── step-05-reality-validation.md
│           ├── step-06-gatekeeping.md
│           └── step-07-handoff.md
├── scanners/
│   ├── cohesion-scanner.md
│   ├── dependency-scanner.md
│   └── nonsense-detector.md
└── config/
    ├── gating-rules.yaml
    └── cohesion-patterns.yaml
```

## Entry Point

### Via EXCALIBUR (Recommended)
```bash
# Activate via ext-master agent
/ext-master
# Then select: [SP] Sprint-Planning Wrapper
```

### Direct Entry
```bash
# Load workflow directly
cat _bmad-ext/modules/sprint-planning-wrapper/workflows/sprint-planning-enhanced/workflow.md
```

```bash
# From project root
cd _bmad-ext/modules/sprint-planning-wrapper

# Load workflow
cat workflows/sprint-planning-enhanced/workflow.md

# Execute step by step
# Each step loads the next via frontmatter
```

## Quality Gates

- **Cohesion Gate**: Sprint narrative must be coherent (Step 3)
- **Dependency Gate**: No temporal conflicts (Step 4)
- **Reality Gate**: 30-second demo script passes (Step 5)
- **Auto-Gatekeeping**: Loop back on any failure (Step 6)

## Success Metrics

- ✅ All stories form coherent narrative
- ✅ No dependency conflicts
- ✅ All anti-patterns detected and flagged
- ✅ Handoff context complete
- ✅ sprint-status.yaml enhanced

## Failure Modes

- ❌ Incoherent sprint narrative → Reorder stories
- ❌ Dependency conflicts → Adjust story sequencing
- ❌ Critical anti-patterns → Flag for review before sprint start
