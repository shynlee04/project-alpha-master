---
name: bmad-ext-sprint-planning-bridge
description: Bridge to BMAD-ext sprint-planning wrapper module. Provides enhanced sprint planning with cohesion validation, dependency mapping, reality gates, and auto gatekeeping. Use for sprint planning that prevents "Dual Chat" failures.
version: 1.0.0
category: bridge
parent: bmad-ext-bridge
children:
  - sprint-cohesion-check
  - sprint-dependency-map
  - sprint-reality-validation
  - sprint-gatekeeping
priority: 13
agents:
  - bmm-pm
  - bmm-sm
triggers:
  - sprint planning
  - cohesion check
  - dependency mapping
  - reality validation
  - /ext-sprint
---

# BMAD-EXT Sprint-Planning Wrapper Bridge

**description**: Gateway to enhanced sprint planning with cohesion validation, dependency mapping, reality gates, and auto gatekeeping.

## Module Overview

**Location**: `_bmad-ext/modules/sprint-planning-wrapper/`
**Version**: 1.0.0
**Status**: ACTIVE
**Phase**: 2 (Sprint Planning)

## Problem Statement

The original `sprint-planning` workflow generates `sprint-status.yaml` from epics but lacks:
- ❌ Cohesion validation (detects fragmented UX across stories)
- ❌ Dependency mapping (finds hidden story dependencies)
- ❌ Narrative validation ("Movie Script Test" for entire sprint)
- ❌ Auto gatekeeping (loop back on validation failures)

## Wrapper Architecture

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

## Enhanced Workflow: 7 Steps

### Step 1: Discover Epics

**description**: Scan for epic files in planning artifacts

**Actions**:
1. Scan `_bmad-output/planning-artifacts/epics.md`
2. Identify active epics
3. Load story files for each epic
4. Generate epic inventory

### Step 2: Generate Status

**description**: Run BMAD sprint-planning workflow to generate baseline

**Actions**:
1. Invoke BMAD sprint-planning workflow
2. Generate baseline `sprint-status.yaml`
3. Extract story assignments
4. Prepare for enhanced validation

### Step 3: Cohesion Check ← NEW

**description**: Validate sprint cohesion, detect fragmentation

**Actions**:
1. Generate 30-second demo script for entire sprint
2. Check for narrative coherence
3. Detect fragmented UX patterns
4. Flag cohesion violations

**Scanner**: Cohesion Scanner
- **Narrative Check**: 30-second demo script
- **Dependency Friction**: Story completion vs dependency start
- **Ghost Logic**: Missing error/empty/loading states

### Step 4: Dependency Map ← NEW

**description**: Map cross-story dependencies, find conflicts

**Actions**:
1. Identify explicit dependencies (listed in stories)
2. Detect implicit dependencies (shared components, data flow)
3. Check for temporal conflicts (Story A needs Story B Day 4, Story B Day 1)
4. Generate dependency graph

**Scanner**: Dependency Scanner
- Explicit Dependencies: Listed in story files
- Implicit Dependencies: Shared components, data flow
- Temporal Conflicts: Story sequencing issues

### Step 5: Reality Validation ← NEW

**description**: Generate 30-second demo script for entire sprint

**Actions**:
1. Create user journey script
2. Validate user can accomplish goal in 30 seconds
3. Check for "Dual Chat" type failures
4. Flag if sprint narrative is incoherent

**Output**: `demo-script.md`

### Step 6: Gatekeeping

**description**: Auto-validation with loop-back on failures

**Actions**:
1. Check cohesion score (must meet threshold)
2. Check dependency conflicts (must be resolved)
3. Check reality test (must pass)
4. Loop back on any failure

**Gating Rules**:
- Cohesion score ≥ 80%
- No temporal dependency conflicts
- Demo script passes user journey test

### Step 7: Handoff

**description**: Prepare enhanced context for story-cycle execution

**Actions**:
1. Update `sprint-status.yaml` with enhancement flags
2. Generate cohesion report
3. Generate dependency map
4. Create handoff artifact for implementation module

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

## Quality Gates

- **Cohesion Gate**: Sprint narrative must be coherent (Step 3)
- **Dependency Gate**: No temporal conflicts (Step 4)
- **Reality Gate**: 30-second demo script passes (Step 5)
- **Auto-Gatekeeping**: Loop back on any failure (Step 6)

## Quick Commands

| Command | Action |
|---------|--------|
| `/ext-sprint` | Load sprint-planning wrapper |
| `/sprint-cohesion` | Run cohesion check |
| `/sprint-dependency` | Run dependency map |
| `/sprint-reality` | Run reality validation |
| `/sprint-gate` | Run gatekeeping |
| `/enhanced-sprint` | Full enhanced sprint planning |

## Usage Pattern

```bash
# Enhanced sprint planning
1. Load this bridge
2. Invoke: sprint-planning-enhanced workflow
3. Execute: 7-step process with auto gatekeeping
4. Return: enhanced sprint-status.yaml, cohesion report, dependency map

# Individual validations
1. Load: cohesion-scanner
2. Execute: check for fragmented UX
3. Load: dependency-scanner
4. Execute: map cross-story dependencies
5. Load: nonsense-detector
6. Execute: spot dual-chat failures
```

---

**Source**: `_bmad-ext/modules/sprint-planning-wrapper/MODULE.md`
**Version**: 1.0.0
**Last Updated**: 2026-01-11
