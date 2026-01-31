---
name: "brainstorming"
description: "Creative brainstorming with multi-perspective analysis, idea clustering, and prioritization"
version: "1.0.0"
tier: "workflow"
phase: "1"
status: "active"
category: "planning"
wrapper_for: null
updated: "2026-01-15"

integration_points:
  reads_from:
    - "_bmad-ext/modules/bmad-core/templates/"
  writes_to:
    - "_bmad-output/planning-artifacts/brainstorming/{date}/"
  invoked_by:
    - "bmad-core"
  hands_off_to:
    - "create-product-brief"

triggers:
  - "brainstorming"
  - "brain storm"
  - "ideation"
  - "creative session"
---

# Brainstorming Workflow

**description**: Creative exploration with multiple stakeholder perspectives, idea clustering, and prioritization.

## Workflow Definition

```yaml
workflow:
  name: "brainstorming"
  phase: 1
  version: "1.0.0"
  description: "Creative brainstorming with multi-perspective analysis"

  entry:
    required: "Topic or problem statement"
    from: "user input or bmad-core"

  output:
    - "brainstorming-output-{date}.md"
    - "idea-clustering.json"
    - "prioritized-ideas.md"

  steps: 5
  estimated_duration: "15-30 minutes"
```

## Steps Overview

| Step | Name | Description | Output |
|------|------|-------------|--------|
| 1 | **Setup** | Define topic and constraints | Topic brief |
| 2 | **Generate** | Generate ideas from multiple perspectives | Raw ideas list |
| 3 | **Cluster** | Group related ideas | Idea clusters |
| 4 | **Prioritize** | Rank by impact/feasibility | Prioritized list |
| 5 | **Document** | Create output document | Final output |

## Step Details

### Step 1: Setup

Define the brainstorming topic and any constraints:

```yaml
inputs:
  - "Topic or problem statement"
  - "Target users/stakeholders (optional)"
  - "Constraints (optional)"

output:
  topic_brief: |
    ## Topic
    {topic}
    
    ## Stakeholders
    {stakeholders}
    
    ## Constraints
    {constraints}
```

### Step 2: Generate

Generate ideas from multiple perspectives:

```yaml
perspectives:
  - "User viewpoint"
  - "Business viewpoint"
  - "Technical viewpoint"
  - "Creative viewpoint"

quantity_target: 10
idea_format: |
  ## Idea {n}
  - **Title**: {title}
  - **Perspective**: {viewpoint}
  - **Description**: {description}
  - **Pros**: {benefits}
  - **Cons**: {challenges}
```

### Step 3: Cluster

Group related ideas:

```yaml
clustering_rules:
  - "Group by theme or problem solved"
  - "Identify complementary ideas"
  - "Flag conflicting ideas"
  - "Note standalone ideas"

output:
  clusters:
    - name: "{cluster name}"
      ideas: [list of idea numbers]
      theme: "{common theme}"
```

### Step 4: Prioritize

Rank ideas by impact and feasibility:

```yaml
criteria:
  - "Impact (1-5)"
  - "Feasibility (1-5)"
  - "Innovation (1-5)"
  - "User value (1-5)"

scoring: "impact + feasibility + innovation + user_value"
```

### Step 5: Document

Create the final output document:

```yaml
output_file: "_bmad-output/planning-artifacts/brainstorming/{date}/brainstorming-output-{date}.md"
frontmatter:
  ---
  workflow: "brainstorming"
  date: "{YYYY-MM-DD}"
  topic: "{topic}"
  ideas_generated: {count}
  clusters: {count}
  ---
```

## Integration

**Entry**: From bmad-core module or direct user input

**Exit**: To create-product-brief workflow for idea development

**Updates**: None

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
