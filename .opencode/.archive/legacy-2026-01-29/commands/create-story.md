# Command: create-story

> **Skill**: `.opencode/skill/story-cycle/steps/01-create-story.md` | **Master**: `_bmad/bmb/workflows/story-cycle/steps/01-create-story.md`

---

## Description

Create a new story file from epic backlog. Story Manager (SM) agent responsibility.

---

## Usage

```bash
create-story epic=21 story=1     # Create story 1 for epic 21
create-story epic=21             # Auto-increment story number
```

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `epic` | Yes | Epic number (e.g., 21) |
| `story` | No | Story number (auto-increments if omitted) |

---

## What It Does

1. Loads epic definition from `epics.md`
2. Creates story file at `{sprint_artifacts}/{epic}-{story}-{slug}.md`
3. Initializes with template structure (user story, ACs, tasks)
4. Updates `sprint-status.yaml` → `backlog` → `ready`

---

## Story Template

```markdown
---
epic: {N}
story: {N}
title: "{title}"
status: "backlog"
agent: "{agent}"
hours: {estimated_hours}
---

## User Story

**As a** [user persona]
**I want** [action/feature]
**So that** [benefit/value]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Tasks

- [ ] T1: Task description
- [ ] T2: Task description
```

---

## Next Step

`validate-story` - Validate the created story file

---

**See Also**: `story-cycle`, `validate-story`, `create-context`
