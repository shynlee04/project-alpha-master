---
name: "create-architecture"
description: "Wrap BMAD create-architecture with ADR enforcement, system design, and component mapping"
version: "1.0.0"
tier: "workflow"
phase: "3"
status: "active"
category: "architecture"
wrapper_for: "_bmad/bmm/workflows/3-solutioning/create-architecture"
updated: "2026-01-15"

integration_points:
  reads_from:
    - "_bmad/bmm/workflows/3-solutioning/create-architecture/"
    - "_bmad-output/planning-artifacts/prd/{date}/"
    - "_bmad-output/planning-artifacts/architecture/"
  writes_to:
    - "_bmad-output/planning-artifacts/architecture/{date}/"
  invoked_by:
    - "bmad-core"
  hands_off_to:
    - "sprint-planning-wrapper"

triggers:
  - "architecture"
  - "create architecture"
  - "system design"
  - "component design"
  - "adr"
---

# Create Architecture Workflow

**description**: Wrap the BMAD `create-architecture` workflow with ADR enforcement, system design, and component mapping.

## Workflow Definition

```yaml
workflow:
  name: "create-architecture"
  phase: 3
  version: "1.0.0"
  description: "System design with ADR enforcement"

  entry:
    required: "PRD or requirements document"
    from: "prd"

  output:
    - "architecture-{date}.md"
    - "adr-{nn}-{title}.md" (multiple)
    - "component-diagram.{svg|png}"
    - "data-flow-diagram.{svg|png}"

  steps: 7
  estimated_duration: "2-3 hours"
```

## Wrapper Features

- **ADR Enforcement**: All major decisions as ADRs
- **Component Mapping**: Clear component boundaries
- **Data Flow**: Documented data movement
- **BMAD Integration**: Consumes original workflow

## Steps Overview

| Step | Name | Description | Output |
|------|------|-------------|--------|
| 1 | **Requirements** | Review PRD requirements | Requirements summary |
| 2 | **Architecture** | Define high-level architecture | Architecture overview |
| 3 | **Components** | Map components | Component diagram |
| 4 | **Data Flow** | Document data movement | Flow diagrams |
| 5 | **ADRs** | Create Architecture Decision Records | ADR documents |
| 6 | **Review** | Technical review | Review notes |
| 7 | **Finalize** | Complete architecture | Final document |

## Step Details

### Step 1: Requirements Review

Review PRD and extract technical requirements:

```yaml
inputs:
  - "PRD document"
  - "User journeys"
  - "Functional requirements"

output:
  technical_requirements:
    functional: [list]
    non_functional: [list]
    constraints: [list]
    integrations: [list]
```

### Step 2: Architecture Overview

Define high-level architecture:

```yaml
architecture_patterns:
  - "Microservices"
  - "Modular Monolith"
  - "Event-Driven"
  - "Layered"
  - "Hexagonal"

sections:
  - "Architecture Style"
  - "Key Principles"
  - "Technology Stack"
  - "Deployment Model"
```

### Step 3: Component Mapping

Map system components:

```yaml
component_template:
  - name: "{component name}"
    responsibility: "{what it does}"
    interfaces: [list]
    dependencies: [list]
    technology: "{tech used}"

diagram_format: "Mermaid or PlantUML"
```

### Step 4: Data Flow

Document data movement:

```yaml
flow_types:
  - "User requests"
  - "Internal services"
  - "External integrations"
  - "Data persistence"

flow_template:
  - name: "{flow name}"
    source: "{origin}"
    destination: "{target}"
    protocol: "{how}"
    data_format: "{format}"
    frequency: "{how often}"
```

### Step 5: ADRs

Create Architecture Decision Records:

```yaml
adr_template:
  ---
  # ADR-{nn}: {Decision Title}
  
  ## Status
  Proposed | Accepted | Deprecated | Superseded by ADR-{nn}
  
  ## Context
  {What is the issue or requirement driving this decision?}
  
  ## Decision
  {What is the decision?}
  
  ## Consequences
  {What is the result of this decision?}
  
  ## Alternatives Considered
  {What alternatives were considered and rejected?}
  ---

required_adr_count: 3
adr_topics:
  - "Technology selection"
  - "Architecture pattern"
  - "Data strategy"
  - "Security approach"
  - "Integration strategy"
```

### Step 6: Technical Review

Review architecture:

```yaml
review_checklist:
  - "Requirements traceable to components?"
  - "All NFRs addressed?"
  - "ADRs complete?"
  - "Data flows documented?"
  - "Security considered?"
  - "Scalability addressed?"

output:
  review_notes: "{findings}"
  risks: [list]
  recommendations: [list]
```

### Step 7: Finalize

Complete architecture document:

```yaml
output_file: "_bmad-output/planning-artifacts/architecture/{date}/architecture-{date}.md"

frontmatter:
  ---
  workflow: "create-architecture"
  date: "{YYYY-MM-DD}"
  product: "{name}"
  version: "1.0"
  architecture_style: "{pattern}"
  adrs_created: {count}
  components_count: {count}
  ---

attachments:
  - "component-diagram.mmd"
  - "data-flow-diagram.mmd"
  - "adr-*.md" (multiple)
```

## ADR Naming Convention

```
ADR-{YYYY-MM-DD}-{number}-{title}.md
Example: ADR-2026-01-15-001-database-choice.md
```

## Integration

**Consumes From**:
- `_bmad/bmm/workflows/3-solutioning/create-architecture/workflow.md`
- PRD output

**Produces**:
- `_bmad-output/planning-artifacts/architecture/{date}/architecture-{date}.md`
- `_bmad-output/planning-artifacts/architecture/{date}/adr-*.md`
- `_bmad-output/planning-artifacts/architecture/{date}/component-diagram.mmd`
- `_bmad-output/planning-artifacts/architecture/{date}/data-flow-diagram.mmd`

**Hands Off To**: sprint-planning-wrapper for story breakdown

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
