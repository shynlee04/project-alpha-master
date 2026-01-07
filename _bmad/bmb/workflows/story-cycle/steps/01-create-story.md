---
step: 1
name: "create-story"
phase: "creation"
agent: "@bmad-bmm-sm"
timeout: "10 min"
next: "02-validate-story.md"
on_fail: "notify-and-pause"
---

# Step 01: Create Story File

> **Agent:** Story Manager (SM)
> **Output:** Story file at `{sprint_artifacts}/{epic}-{story}-{slug}.md`

---

## Instructions

### 1. Load Required Context

Read the following files completely before proceeding:

```bash
# Configuration and tracking
_bmad/bmb/config.yaml                    # User preferences, output paths
_bmad-output/sprint-artifacts/sprint-status.yaml  # Current sprint state

# Source material
_bmad-output/epics.md                    # Epic definitions
_bmad-output/project-planning-artifacts/architecture.md  # Patterns to follow

# Governance standards (if exists)
.claude/rules/governance-rules.md        # Constitution
```

### 2. Extract Story Details

From `epics.md`, extract:

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
  # ... at least 3 ACs required
```

### 3. Create Story File

Create file at: `{sprint_artifacts}/{epic}-{story}-{slug}.md`

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
...

### AC-3: {criteria_name}
...

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

### Architecture Patterns to Follow
- Pattern: {pattern_name} (from architecture.md)
- Rationale: {why_this_pattern}

## Dev Notes

### Dependencies
- {package}: {version} - {purpose}
- {package}: {version} - {purpose}

### Integration Points
- Touches: {files/modules}
- Breaks: (if any)
- Tests Required: {test_type}

## References

- Epic: `{epics.md}#epic-{N}`
- Architecture: `{architecture.md}#relevant-section`
- Related Stories: {story-keys}

## Dev Agent Record

*This section populated during development phase*

### Agent
- Model: {model_name}
- Session: {timestamp}

### Task Progress
- [ ] T1: {task} - {notes}
- [ ] T2: {task} - {notes}

### Research Executed
*Documentation of MCP research findings*

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| ... | ... | ... |

### Tests Created
- {test_file}: {count} tests

### Decisions Made
- Decision 1: {rationale}

## Code Review

*This section populated during review phase*

**Reviewer:** {model_name}
**Date:** {timestamp}

### Checklist
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

### Issues Found
*Issues and resolutions documented here*

### Sign-off
[ ] APPROVED for merge

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

---

## Validation (Self-Check)

Before proceeding, verify:

- [ ] Story file exists at correct path
- [ ] User story format complete (As a/I want/So that)
- [ ] At least 3 acceptance criteria with Given/When/Then
- [ ] Tasks section has at least 4 checkboxes
- [ ] Research Requirements section populated
- [ ] Dev Notes references architecture.md
- [ ] Status set to `drafted`
- [ ] Sprint status updated

**If any check fails:** Fix before proceeding to next step.

---

## Handoff Output

```markdown
## 📋 STEP COMPLETE: 01-create-story

**Story:** {story_key}
**Status:** drafted

### Artifacts Created:
- ✅ {sprint_artifacts}/{story_key}.md
- ✅ {sprint_artifacts}/sprint-status.yaml (updated)

### Next Step:
- Execute: 02-validate-story.md
- Input: Story file path
```

---

## On Error

If unable to complete:

1. Log error to story file Status History
2. Set story status to `blocked`
3. Notify user with specific blocker
4. Suggest: retry / defer / escalate
