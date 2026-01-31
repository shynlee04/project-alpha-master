---
name: "create-product-brief"
description: "Wrap BMAD create-product-brief with validation gates, user personas, and success metrics"
version: "1.0.0"
tier: "workflow"
phase: "1"
status: "active"
category: "planning"
wrapper_for: "_bmad/bmm/workflows/1-analysis/create-product-brief"
updated: "2026-01-15"

integration_points:
  reads_from:
    - "_bmad/bmm/workflows/1-analysis/create-product-brief/workflow.md"
    - "_bmad-output/planning-artifacts/brainstorming/{date}/"
  writes_to:
    - "_bmad-output/planning-artifacts/product-brief/{date}/"
  invoked_by:
    - "bmad-core"
  hands_off_to:
    - "prd"

triggers:
  - "product brief"
  - "create product brief"
  - "product definition"
  - "product document"
---

# Create Product Brief Workflow

**description**: Wrap the BMAD `create-product-brief` workflow with validation gates, user personas, and success metrics.

## Workflow Definition

```yaml
workflow:
  name: "create-product-brief"
  phase: 1
  version: "1.0.0"
  description: "Product definition with validation"

  entry:
    required: "Product concept or ideation output"
    from: "brainstorming or direct input"

  output:
    - "product-brief-{date}.md"
    - "user-personas.json"
    - "success-metrics.yaml"

  steps: 6
  estimated_duration: "1-2 hours"
```

## Wrapper Features

- **Validation Gates**: Ensure all required sections
- **User Personas**: Structured persona definition
- **Success Metrics**: Measurable KPIs
- **BMAD Integration**: Consumes original workflow

## Steps Overview

| Step | Name | Description | Output |
|------|------|-------------|--------|
| 1 | **Concept** | Define product concept | Concept brief |
| 2 | **Users** | Create user personas | Persona documents |
| 3 | **Problem** | Articulate problem statement | Problem definition |
| 4 | **Goals** | Set success metrics | KPIs |
| 5 | **Scope** | Define MVP scope | Scope document |
| 6 | **Validate** | Run validation gates | Pass/Fail |

## Step Details

### Step 1: Concept

Define the product concept:

```yaml
inputs:
  - "Product name"
  - "One-line description"
  - "Target market"
  - "Existing solutions"

output:
  concept:
    name: "{product}"
    tagline: "{description}"
    market: "{target}"
    competitors: {list}
```

### Step 2: User Personas

Create structured user personas:

```yaml
persona_template:
  - name: "{persona name}"
    role: "{job title}"
    goals: [list of goals]
    pain_points: [list of frustrations]
    behaviors: [observed behaviors]
    quotes: [direct quotes]
```

required_personas: 2
optional_personas: 1
```

### Step 3: Problem Statement

Articulate the problem:

```yaml
problem_structure:
  - "Problem statement (1-2 sentences)"
  - "Who is affected"
  - "Current workaround"
  - "Impact of solving"

template: |
  ## Problem
  {statement}
  
  ## Affected Users
  {who}
  
  ## Current State
  {workaround}
```

### Step 4: Success Metrics

Define measurable KPIs:

```yaml
metrics_categories:
  - "Acquisition metrics"
  - "Engagement metrics"
  - "Retention metrics"
  - "Revenue metrics"

format:
  metric_name:
    description: "{what it measures}"
    target: "{number}"
    timeline: "{when}"
```

### Step 5: MVP Scope

Define what's in/out:

```yaml
scope_sections:
  - "In Scope (MVP)"
  - "Out of Scope (v1)"
  - "Future Considerations"
  - "Dependencies"

priority_levels:
  - "Must have"
  - "Should have"
  - "Nice to have"
```

### Step 6: Validation Gates

Run validation before completion:

```yaml
gates:
  - gate: "Concept defined"
    required: true
    
  - gate: "At least 2 personas"
    required: true
    
  - gate: "Problem statement clear"
    required: true
    
  - gate: "At least 3 success metrics"
    required: true
    
  - gate: "MVP scope defined"
    required: true

on_fail:
  - "Fill missing sections"
  - "Re-run validation"
```

## Integration

**Consumes From**:
- `_bmad/bmm/workflows/1-analysis/create-product-brief/workflow.md`
- Brainstorming output (if available)

**Produces**:
- `_bmad-output/planning-artifacts/product-brief/{date}/product-brief-{date}.md`
- `_bmad-output/planning-artifacts/product-brief/{date}/user-personas.json`
- `_bmad-output/planning-artifacts/product-brief/{date}/success-metrics.yaml`

**Hands Off To**: prd workflow

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
