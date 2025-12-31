---
name: arc (Architecture Governance Module)
description: >
  BMAD module for systematic architectural refactoring, state management consolidation,
  and code hygiene enforcement. Integrates validation frameworks for gap and drift prevention.
version: 1.0.0
author: bmad-core-bmad-master
created: 2025-12-31
module_type: governance
dependencies:
  - bmm (BMAD Method Module)
  - core (BMAD Core)
---

# Architecture Governance Module (ARC)

## Overview

The ARC module provides systematic tools for architectural refactoring, state management consolidation, and code quality enforcement. It integrates with existing BMAD validation frameworks to prevent gaps, drift, and decay.

## Module Structure

```
_bmad/
└── arc/                                    # Module root
    ├── config.yaml                         # Module configuration
    ├── agents/                             # Specialized agents
    │   ├── architect-consolidator.md       # Architecture review specialist
    │   └── hygiene-enforcer.md             # Code quality enforcement
    ├── workflows/                          # Module workflows
    │   └── architectural-consolidation/    # Main consolidation workflow
    │       ├── workflow.yaml               # Workflow definition
    │       └── steps/                      # Step files
    │           ├── step-01-init.md
    │           ├── step-02-story-ac01.md
    │           ├── step-03-story-ac02.md
    │           ├── step-04-story-ac03.md
    │           └── step-05-phase0-validation.md
    ├── checklists/                         # Validation checklists
    │   ├── sweeping-validation.md          # 12-level sweeping checks
    │   └── phase-gate-checklist.md         # Phase gate validation
    └── templates/                          # Output templates
        ├── handoff-artifact.md             # Phase handoff template
        └── validation-report.md            # Validation report template
```

## Agents

### 1. Architect Consolidator

**File:** `agents/architect-consolidator.md`

**Purpose:** Reviews architectural decisions, enforces layer boundaries, and validates data flow patterns.

**Capabilities:**
- Layer boundary enforcement
- Store reorganization guidance
- Event bus pattern validation
- Cross-workspace communication review

### 2. Hygiene Enforcer

**File:** `agents/hygiene-enforcer.md`

**Purpose:** Enforces code quality standards, file size limits, and naming conventions.

**Capabilities:**
- File size limit enforcement (< 300 lines)
- Naming convention validation
- Dead code detection
- Circular dependency identification

## Workflows

### 1. Architectural Consolidation

**Invocation:** `/architectural-consolidation`

**Purpose:** Systematic refactoring workflow with validation gates.

**Phases:**
1. **Phase 0: Showcase Critical** - Provider, Agent, Chat unification
2. **Phase 1: Foundation** - Store reorganization, event bus
3. **Phase 2: Full Scope** - Code hygiene, API contracts, testing

**Integrations:**
- `/story-dev-cycle` - For each story implementation
- `sweeping-validation.md` - Post-phase validation
- `12-level-framework` - Gate progression

## Configuration

### Module Config (`config.yaml`)

```yaml
# ARC Module Configuration
module_name: arc
full_name: Architecture Governance Module
version: 1.0.0

# Validation settings
validation:
  sweeping_enabled: true
  12_level_enabled: true
  device_testing: true
  
# File size limits
code_hygiene:
  max_lines_per_file: 300
  max_lines_per_function: 50
  max_dependencies_per_file: 10
  
# Event bus settings
event_bus:
  debounce_ms: 100
  max_listeners: 20
  
# Store organization
stores:
  core:
    - provider-store
    - agent-store
    - config-store
  workspace:
    - ide-store
    - knowledge-store
    - study-store
    - notes-store
  feature:
    - chat-store
    - file-store
    - rag-store
```

## Integration Points

### With BMM Module

| BMM Component | ARC Integration |
|---------------|-----------------|
| `/story-dev-cycle` | Each ARC story follows story-dev-cycle |
| `sprint-status.yaml` | ARC updates story/phase status |
| `bmm-workflow-status.yaml` | ARC reports workflow progress |
| `/code-review` | ARC stories go through code review |

### With Validation Frameworks

| Framework | Integration |
|-----------|-------------|
| `sweeping-validation.md` | Post-phase validation checkpoints |
| `12-level-framework` | Gate progression (Gate 1-4) |
| `ralph-loop` | Continuous validation iterations |

## Usage

### Quick Start

```bash
# Invoke the workflow
/architectural-consolidation

# Or manually:
# 1. Read sprint change proposal
# 2. Execute step-01-init.md
# 3. Follow prompts
```

### Phased Execution

```bash
# Phase 0 only (for urgent showcase)
/architectural-consolidation --phase=0

# Full execution (all phases)
/architectural-consolidation --full
```

## Outputs

### Validation Reports

Generated at: `_bmad-output/validation/architectural-consolidation-{date}.md`

### Handoff Artifacts

Generated at: `_bmad-output/sprint-artifacts/{phase}-handoff-{date}.md`

### Updated Files

| Category | Location |
|----------|----------|
| Stores | `src/stores/**/*.ts` |
| Events | `src/lib/events/*.ts` |
| Components | `src/components/**/*.tsx` |
| Tests | `src/**/*.test.ts` |

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Phase 0 Completion | < 8 hours | Time tracking |
| Sweeping Validation | 12/12 levels | Checkpoint count |
| 12-Level Gates | Gate 4 | Gate progression |
| File Size Compliance | 100% < 300 lines | Automated scan |
| Test Coverage | > 80% | `pnpm test --coverage` |
| Device Testing | 3/3 devices | Manual verification |

## Maintenance

### Updating Validation Checkpoints

1. Edit `_bmad-output/validation/sweeping-validation.md`
2. Update corresponding step files
3. Test workflow execution

### Adding New Phases

1. Create new step files in `steps/`
2. Update `workflow.yaml` with new phase
3. Add validation gate step

## References

- Sprint Change Proposal: `_bmad-output/sprint-change-proposal-2025-12-31.md`
- Architecture Document: `_bmad-output/project-planning-artifacts/architecture.md`
- Sweeping Validation: `_bmad-output/validation/sweeping-validation.md`
- 12-Level Framework: `_bmad-output/validation/12-level-framework-integration-2025-12-29.md`

---

**Module Created:** 2025-12-31  
**Author:** BMad Master  
**Status:** Active
