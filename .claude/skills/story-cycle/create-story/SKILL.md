---
name: create-story
description: Create a new story file from epic backlog. Use when user says "create story", "new story", "add story", or specifies epic/story numbers. This step generates the story file with user story format, acceptance criteria, tasks, and research requirements.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: workflow
parent: story-cycle
children: []
priority: 56
agents:
  - bmad-bmm-sm
triggers:
  - create story
  - new story
  - add story
  - /create-story
  - story from epic
---

# Step 01: Create Story

**Purpose**: Create story file from epic backlog with proper format, acceptance criteria, tasks, and research requirements.

## When to use

- User says "create story" or "new story"
- User specifies epic number to create story from
- User provides epic=N story=N parameters
- Starting a new story from backlog

## Instructions

### 1. Load Required Context
```bash
READ: _bmad/bmb/config.yaml
READ: _bmad-output/sprint-artifacts/sprint-status.yaml
READ: _bmad-output/epics.md
READ: _bmad-output/project-planning-artifacts/architecture.md
READ: .claude/rules/governance-rules.md
```

### 2. Extract Story Details from Epic
```yaml
epic:
  number: {N}
  name: {epic_name}

story:
  number: {N}
  title: {story_title}
  type: {feature|bug|tech-debt|refactor}
  points: {estimate}

user_story:
  as_a: {role}
  i_want: {action}
  so_that: {benefit}

acceptance_criteria:
  - name: "AC-1"
    given: {precondition}
    when: {action}
    then: {outcome}
```

### 3. Create Story File

**Location**: `{sprint_artifacts}/{epic}-{story}-{slug}.md`

**Template**:
```markdown
---
story_key: "{epic}-{story}-{slug}"
epic: {N}
story: {N}
status: "drafted"
created_at: {timestamp}
points: {estimate}
---

# {story_title}

## User Story

**As a** {role}
**I want** {action}
**So that** {benefit}

## Acceptance Criteria

### AC-1: {criteria_name}
**Given** {precondition}
**When** {action}
**Then** {outcome}

### AC-2: {criteria_name}
### AC-3: {criteria_name}

## Tasks

- [ ] T1: {task_description}
- [ ] T2: {task_description}
- [ ] T3: {research_task_description}
- [ ] T4: {test_task_description}

## Research Requirements

### Required MCP Research
- [ ] Context7: {dependency/pattern} documentation
- [ ] DeepWiki: {github-repo} implementation patterns
- [ ] Tavily/Exa: Community solutions for {topic}

## Architecture Patterns to Follow
- Pattern: {pattern_name} (from architecture.md)
- Rationale: {why_this_pattern}

## Dev Notes

### Dependencies
- {package}: {version} - {purpose}

### Integration Points
- Touches: {files/modules}
- Breaks: (if any)

## References

- Epic: `{epics.md}#epic-{N}`
- Architecture: `{architecture.md}#relevant-section`

## Dev Agent Record
*Populated during development phase*

## Code Review
*Populated during review phase*

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | {timestamp} | SM | Created from epic |
| drafted | {timestamp} | SM | Story file created |
```

### 4. Update Sprint Status

```yaml
# _bmad-output/sprint-artifacts/sprint-status.yaml
stories:
  {story_key}:
    status: "drafted"
    created_at: {timestamp}
    epic: {N}
    points: {estimate}
```

## Validation (Self-Check)

Before proceeding:
- [ ] Story file exists at correct path
- [ ] User story format complete (As a/I want/So that)
- [ ] At least 3 acceptance criteria with Given/When/Then
- [ ] Tasks section has at least 4 checkboxes
- [ ] Research Requirements section populated
- [ ] Dev Notes references architecture.md
- [ ] Status set to `drafted`
- [ ] Sprint status updated

## Next Step

Proceed to: [validate-story](../validate-story/SKILL.md)

---

**Source**: `_bmad/bmb/workflows/story-cycle/steps/01-create-story.md`
