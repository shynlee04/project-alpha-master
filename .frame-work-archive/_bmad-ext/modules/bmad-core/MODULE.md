---
name: "bmad-core"
description: "Core BMAD workflow wrappers - brainstorming, party-mode, product-brief, PRD, architecture"
version: "1.0.0"
tier: "module"
phase: "1"
status: "active"
category: "planning"
entry_point: "/bmad-core"
updated: "2026-01-15"

integration_points:
  reads_from:
    - "_bmad/bmm/workflows/1-analysis/create-product-brief/"
    - "_bmad/bmm/workflows/2-plan-workflows/prd/"
    - "_bmad/bmm/workflows/3-solutioning/create-architecture/"
    - "_bmad-output/planning-artifacts/"
  writes_to:
    - "_bmad-output/planning-artifacts/product-brief/"
    - "_bmad-output/planning-artifacts/prd/"
    - "_bmad-output/planning-artifacts/architecture/"
  invoked_by:
    - "master-orchestrator"
    - "analyst-ext"
    - "architect-ext"
  hands_off_to:
    - "sprint-planning-wrapper"

children:
  type: "workflow"
  count: 5
  list:
    - "brainstorming"
    - "party-mode"
    - "create-product-brief"
    - "prd"
    - "create-architecture"

workflows:
  brainstorming:
    description: "Creative brainstorming with multi-perspective analysis"
    phase: "1"
    wrapper_for: null
  party-mode:
    description: "Rapid ideation mode for high-velocity exploration"
    phase: "1"
    wrapper_for: null
  create-product-brief:
    description: "Wrap BMAD create-product-brief with validation gates"
    phase: "1"
    wrapper_for: "_bmad/bmm/workflows/1-analysis/create-product-brief"
  prd:
    description: "Wrap BMAD PRD workflow with structured templates"
    phase: "2"
    wrapper_for: "_bmad/bmm/workflows/2-plan-workflows/prd"
  create-architecture:
    description: "Wrap BMAD create-architecture with ADR enforcement"
    phase: "3"
    wrapper_for: "_bmad/bmm/workflows/3-solutioning/create-architecture"

triggers:
  - "brainstorming"
  - "brain storm"
  - "party mode"
  - "rapid ideation"
  - "product brief"
  - "create product brief"
  - "prd"
  - "product requirements"
  - "architecture"
  - "create architecture"
  - "system design"

entry_points:
  commands:
    - "/bmad-core"
    - "/brainstorming"
    - "/party-mode"
    - "/product-brief"
    - "/prd"
    - "/architecture"
  aliases:
    - "/core"
    - "/brainstorm"
    - "/party"
    - "/brief"
    - "/design"
---

# BMAD Core Module

## Description

Wraps 5 essential BMAD core workflows with extension layer integration:
- **brainstorming**: Creative exploration with multiple perspectives
- **party-mode**: High-velocity rapid ideation
- **create-product-brief**: Product definition with validation
- **prd**: Product Requirements Document with structured templates
- **create-architecture**: System design with ADR enforcement

## Timing Standards

| Workflow | Duration | Notes |
|----------|----------|-------|
| **brainstorming** | 15-30 min | Per session |
| **party-mode** | 5-10 min | Rapid ideation |
| **create-product-brief** | 1-2 hours | Depends on complexity |
| **prd** | 2-4 hours | Full PRD creation |
| **create-architecture** | 2-3 hours | System design |

## Workflows

### 1. Brainstorming

**Location**: `_bmad-ext/modules/bmad-core/workflows/brainstorming/`

Creative exploration with multiple perspectives:
- Multiple stakeholder viewpoints
- Divergent/convergent thinking
- Idea clustering and prioritization
- Output: Brainstorm session notes

### 2. Party-Mode

**Location**: `_bmad-ext/modules/bmad-core/workflows/party-mode/`

High-velocity rapid ideation:
- No constraints initially
- Quantity over quality first
- Rapid capture of all ideas
- Output: Raw idea list

### 3. Create Product Brief

**Location**: `_bmad-ext/modules/bmad-core/workflows/create-product-brief/`

Wraps `_bmad/bmm/workflows/1-analysis/create-product-brief/`:
- User persona definition
- Problem statement
- Goals and success metrics
- Output: Product brief document

### 4. PRD

**Location**: `_bmad-ext/modules/bmad-core/workflows/prd/`

Wraps `_bmad/bmm/workflows/2-plan-workflows/prd/`:
- Functional requirements
- Non-functional requirements
- User journeys
- Output: PRD document

### 5. Create Architecture

**Location**: `_bmad-ext/modules/bmad-core/workflows/create-architecture/`

Wraps `_bmad/bmm/workflows/3-solutioning/create-architecture/`:
- System design
- Component architecture
- ADR creation
- Output: Architecture document + ADRs

## File Structure

```
_bmad-ext/modules/bmad-core/
├── MODULE.md                              # This file
├── workflows/
│   ├── brainstorming/
│   │   └── workflow.md
│   ├── party-mode/
│   │   └── workflow.md
│   ├── create-product-brief/
│   │   └── workflow.md
│   ├── prd/
│   │   └── workflow.md
│   └── create-architecture/
│       └── workflow.md
└── templates/
    ├── brainstorming-template.md
    ├── party-mode-template.md
    ├── product-brief-template.md
    ├── prd-template.md
    └── architecture-template.md
```

## Integration Points

### Consumes From (Read-Only)
- `_bmad/bmm/workflows/1-analysis/create-product-brief/workflow.md`
- `_bmad/bmm/workflows/2-plan-workflows/prd/workflow.md`
- `_bmad/bmm/workflows/3-solutioning/create-architecture/workflow.md`
- `_bmad/bmm/workflows/2-plan-workflows/prd/prd-template.md`

### Produces
- `_bmad-output/planning-artifacts/brainstorming/{date}/`
- `_bmad-output/planning-artifacts/product-brief/{date}/`
- `_bmad-output/planning-artifacts/prd/{date}/`
- `_bmad-output/planning-artifacts/architecture/{date}/`

### Hands Off To
- `_bmad-ext/modules/sprint-planning-wrapper/` - After product definition
- `_bmad-ext/modules/governance/` - For validation if needed

## Entry Point

### Via EXCALIBUR (Recommended)
```bash
/ext-master
# Then select: [BC] BMAD Core Module
```

### Direct Entry
```bash
# Load module directly
cat _bmad-ext/modules/bmad-core/MODULE.md

# Select workflow
cat _bmad-ext/modules/bmad-core/workflows/{workflow}/workflow.md
```

## Usage Examples

```bash
# Start brainstorming session
/ext-master
[BC] BMAD Core Module
[BR] Brainstorming

# Create product brief
/ext-master
[BC] BMAD Core Module
[PB] Create Product Brief

# Write PRD
/ext-master
[BC] BMAD Core Module
[PR] PRD

# Design architecture
/ext-master
[BC] BMAD Core Module
[AR] Create Architecture
```

## Quality Gates

- **Idea Quality Gate**: Brainstorming generates minimum 10 ideas
- **Brief Validation**: Product brief has all required sections
- **PRD Completeness**: All user journeys mapped
- **ADR Enforcement**: Architecture decisions documented as ADRs

## Success Metrics

- ✅ All workflows produce valid output
- ✅ Templates followed correctly
- ✅ Integration with planning artifacts
- ✅ Handoff to next phase successful

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
