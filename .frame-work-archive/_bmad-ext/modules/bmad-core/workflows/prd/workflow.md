---
name: "prd"
description: "Wrap BMAD PRD workflow with structured templates, user journeys, and functional requirements"
version: "1.0.0"
tier: "workflow"
phase: "2"
status: "active"
category: "planning"
wrapper_for: "_bmad/bmm/workflows/2-plan-workflows/prd"
updated: "2026-01-15"

integration_points:
  reads_from:
    - "_bmad/bmm/workflows/2-plan-workflows/prd/workflow.md"
    - "_bmad/bmm/workflows/2-plan-workflows/prd/prd-template.md"
    - "_bmad-output/planning-artifacts/product-brief/{date}/"
  writes_to:
    - "_bmad-output/planning-artifacts/prd/{date}/"
  invoked_by:
    - "bmad-core"
  hands_off_to:
    - "create-architecture"

triggers:
  - "prd"
  - "product requirements"
  - "requirements document"
  - "functional spec"
---

# PRD Workflow

**description**: Wrap the BMAD PRD workflow with structured templates, user journeys, and functional requirements.

## Workflow Definition

```yaml
workflow:
  name: "prd"
  phase: 2
  version: "1.0.0"
  description: "Product Requirements Document creation"

  entry:
    required: "Product brief or concept"
    from: "create-product-brief"

  output:
    - "prd-{date}.md"
    - "user-journeys.yaml"
    - "requirements-matrix.yaml"

  steps: 8
  estimated_duration: "2-4 hours"
```

## Wrapper Features

- **Template Enforcement**: Use BMAD PRD template
- **Journey Mapping**: Structured user journey documentation
- **Requirements Matrix**: Traceable requirements
- **Validation Gates**: Completeness checks

## Steps Overview

| Step | Name | Description | Output |
|------|------|-------------|--------|
| 1 | **Discovery** | Review product brief | Context brief |
| 2 | **Journeys** | Map user journeys | Journey documents |
| 3 | **Functional** | Define functional reqs | Requirements list |
| 4 | **Non-Functional** | Define NFRs | NFR document |
| 5 | **Scoping** | Define boundaries | Scope document |
| 6 | **Assumptions** | Document assumptions | Assumption list |
| 7 | **Review** | Internal review | Review notes |
| 8 | **Finalize** | Complete PRD | Final document |

## Step Details

### Step 1: Discovery

Review product brief and gather context:

```yaml
inputs:
  - "Product brief"
  - "User personas"
  - "Success metrics"

output:
  context:
    product: "{name}"
    version: "1.0"
    author: "{author}"
    date: "{date}"
    based_on: "{product brief path}"
```

### Step 2: User Journeys

Map core user journeys:

```yaml
journey_template:
  - id: "J{nn}"
    name: "{journey name}"
    actors: [list]
    preconditions: [list]
    steps:
      - step: 1
        description: "{action}"
        actor: "{who}"
        system_response: "{what happens}"
    postconditions: [list]
    variations: [list]
    related_requirements: [list]

required_journeys: 3
```

### Step 3: Functional Requirements

Define functional requirements:

```yaml
requirement_template:
  - id: "FR-{nn}"
    title: "{requirement title}"
    priority: "Must | Should | Could"
    description: "{detailed description}"
    acceptance_criteria: [list]
    dependencies: [list]
    source_journey: "{journey ID}"

format: "ID: Title | Priority | AC Count"
```

### Step 4: Non-Functional Requirements

Define NFRs:

```yaml
nfr_categories:
  - "Performance"
  - "Security"
  - "Scalability"
  - "Usability"
  - "Availability"
  - "Compliance"

nfr_template:
  - id: "NFR-{nn}"
    category: "{category}"
    requirement: "{description}"
    metric: "{how to measure}"
    target: "{threshold}"
```

### Step 5: Scoping

Define what's in/out of scope:

```yaml
scope_sections:
  - "In Scope (v1.0)"
  - "Out of Scope (v1.0)"
  - "Future Considerations"
  - "Dependencies"
  - "Risks and Mitigations"
```

### Step 6: Assumptions

Document assumptions:

```yaml
assumption_template:
  - id: "A{nn}"
    statement: "{assumption}"
    impact: "{what depends on this}"
    validation: "{how to verify}"
```

### Step 7: Review

Internal review checklist:

```yaml
review_checklist:
  - "All user journeys documented?"
  - "Requirements traceable to journeys?"
  - "NFRs defined for all categories?"
  - "Scope clearly defined?"
  - "Assumptions documented?"
  - "No missing sections?"

output:
  review_notes: "{findings}"
  issues_found: [list]
  blockers: [list]
```

### Step 8: Finalize

Complete the PRD:

```yaml
output_file: "_bmad-output/planning-artifacts/prd/{date}/prd-{date}.md"

frontmatter:
  ---
  workflow: "prd"
  date: "{YYYY-MM-DD}"
  product: "{name}"
  version: "1.0"
  status: "draft" | "review" | "approved"
  requirements_count: {FR + NFR}
  journeys_count: {count}
  ---
```

## Integration

**Consumes From**:
- `_bmad/bmm/workflows/2-plan-workflows/prd/workflow.md`
- `_bmad/bmm/workflows/2-plan-workflows/prd/prd-template.md`
- Product brief output

**Produces**:
- `_bmad-output/planning-artifacts/prd/{date}/prd-{date}.md`
- `_bmad-output/planning-artifacts/prd/{date}/user-journeys.yaml`
- `_bmad-output/planning-artifacts/prd/{date}/requirements-matrix.yaml`

**Hands Off To**: create-architecture workflow

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
