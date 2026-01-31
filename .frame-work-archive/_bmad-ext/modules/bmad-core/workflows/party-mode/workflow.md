---
name: "party-mode"
description: "High-velocity rapid ideation mode - no constraints, quantity over quality, rapid capture"
version: "1.0.0"
tier: "workflow"
phase: "1"
status: "active"
category: "planning"
wrapper_for: null
updated: "2026-01-15"

integration_points:
  reads_from: []
  writes_to:
    - "_bmad-output/planning-artifacts/brainstorming/{date}/party-mode/"
  invoked_by:
    - "bmad-core"
  hands_off_to:
    - "brainstorming"

triggers:
  - "party mode"
  - "rapid ideation"
  - "quick ideas"
  - "no limits"
---

# Party-Mode Workflow

**description**: High-velocity rapid ideation - quantity over quality, no constraints, fast capture.

## Workflow Definition

```yaml
workflow:
  name: "party-mode"
  phase: 1
  version: "1.0.0"
  description: "Rapid ideation with no constraints"

  entry:
    required: "Topic or theme"
    from: "user input"

  output:
    - "party-mode-output-{date}.md"
    - "raw-ideas.json"

  steps: 3
  estimated_duration: "5-10 minutes"
```

## Principles

- 🚫 **NO constraints** - Everything is valid
- 📈 **Quantity over quality** - More is better
- ⚡ **Speed first** - Capture fast, filter later
- 🎯 **Raw output** - No editing during capture

## Steps Overview

| Step | Name | Description | Output |
|------|------|-------------|--------|
| 1 | **Topic** | Define the theme | Topic brief |
| 2 | **Capture** | Rapid idea generation | Raw ideas list |
| 3 | **Export** | Save raw output | Output files |

## Step Details

### Step 1: Topic

Quick topic definition:

```yaml
inputs:
  - "What are we ideating on?"
  - "Any loose theme? (optional)"

output:
  topic_line: "{topic}"
```

### Step 2: Capture

Rapid idea generation - 3 minutes timer:

```yaml
timer: 3 minutes
format: |
  {number}. {idea - one line description}

rules:
  - "Don't stop to evaluate"
  - "Every idea counts"
  - "Build on others' ideas"
  - "No idea is too crazy"

quantity_target: 20
```

### Step 3: Export

Save the raw output:

```yaml
output_file: "_bmad-output/planning-artifacts/brainstorming/{date}/party-mode/party-mode-output-{date}.md"
raw_file: "_bmad-output/planning-artifacts/brainstorming/{date}/party-mode/raw-ideas.json"

frontmatter:
  ---
  workflow: "party-mode"
  date: "{YYYY-MM-DD}"
  topic: "{topic}"
  ideas_captured: {count}
  mode: "raw_capture"
  ---
```

## Usage

```bash
# Start party-mode
/ext-master
[BC] BMAD Core Module
[PM] Party Mode

# Enter topic when prompted
# Generate ideas rapidly (3 min timer)
# Export raw output
```

## Output Example

```markdown
---
workflow: "party-mode"
date: "2026-01-15"
topic: "improve user onboarding"
ideas_captured: 24
mode: "raw_capture"
---

1. Gamified progress bars
2. Video tutorials
3. AI chatbot guide
4. Peer mentoring
5. Interactive walkthrough
6. Reward system for completion
... (more ideas)
```

## Next Steps

After party-mode:
- Review raw ideas in brainstorming workflow
- Cluster and prioritize promising ideas
- Develop selected ideas into product brief

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
