# Utility: Handoff Template

> **description:** Standard format for agent-to-agent handoff artifacts
> **Usage:** Generated at end of each phase

---

## Handoff Structure

Every handoff artifact follows this structure:

```markdown
# Handoff: {phase_name}

**Story:** {epic}-{story}-{slug}
**Phase:** {phase_name}
**Timestamp:** {ISO_timestamp}
**From Agent:** {agent_role}
**To Agent:** {agent_role}

---

## Summary

{brief_description_of_what_was_accomplished}

---

## Artifacts Created

| File | Location | description |
|------|----------|---------|
| {artifact_1} | {path} | {description} |
| {artifact_2} | {path} | {description} |

---

## Status Updates

| Item | Before | After |
|------|--------|-------|
| Story status | {old_status} | {new_status} |
| Sprint status | {old} | {new} |
| Tests | {N}/{N} | {N}/{N} |

---

## Validation Results

{if_validation_occurred}
- Format: ✅ PASS / ❌ FAIL
- Content: ✅ PASS / ❌ FAIL
- Quality: ✅ PASS / ❌ FAIL
{endif}

---

## Known Issues

{if_any}
- {issue_1}: {description}
- {issue_2}: {description}
{endif}

---

## Decisions Made

{if_any}
- Decision 1: {description} - {rationale}
- Decision 2: {description} - {rationale}
{endif}

---

## Next Phase Requirements

### What to Load
- {file_1}
- {file_2}
- {file_3}

### What to Execute
- Workflow: {workflow_name}
- Step: {step_number}
- Estimated: {duration}

### Inputs Required
- {input_1}: {description}
- {input_2}: {description}

### Constraints
- {constraint_1}
- {constraint_2}

---

## Variables for Continuation

```yaml
story_key: {story_key}
epic: {N}
story: {N}
status: {current_status}
tests_passing: {N}/{N}
tasks_completed: {X}/{Y}
last_phase: {phase_name}
next_phase: {next_phase_name}
```

---

**Handoff ID:** HANDOFF-{timestamp}
**Status:** READY_FOR_NEXT_PHASE
```

---

## Handoff Types

### Phase Completion Handoffs

#### Create Story → Validate Story
```markdown
## 📋 PHASE COMPLETE: create-story

**Story:** {story_key}
**Status:** drafted

### Artifacts Created:
- ✅ {sprint_artifacts}/{story}.md
- ✅ {sprint_artifacts}/sprint-status.yaml

### Next Phase:
- Load: @bmad-bmm-sm
- Execute: 02-validate-story.md
- Input: Story file path
```

#### Validate Story → Create Context
```markdown
## 📋 PHASE COMPLETE: validate-story

**Story:** {story_key}
**Status:** validated

### Validation Summary:
- Format: ✅ PASS
- User Story: ✅ PASS
- ACs: ✅ PASS (N criteria)
- Tasks: ✅ PASS (N tasks)

### Next Phase:
- Load: @bmad-bmm-sm
- Execute: 03-create-context.md
- Input: Story file path
```

#### Dev Story → Code Review
```markdown
## 📋 PHASE COMPLETE: dev-story

**Story:** {story_key}
**Status:** review

### Implementation Summary:
- Tasks complete: {N}/{N}
- Files created: {N}
- Files modified: {N}
- Total lines: +{added}/-{removed}

### Test Results:
- Tests created: {N}
- Tests passing: {N}/{N} (100%)
- TypeScript: ✅ 0 errors

### Dev Agent Record:
- ✅ Updated in story file
- ✅ All decisions documented
- ✅ All files changed tracked

### Next Phase:
- Load: @bmad-bmm-dev (fresh context)
- Execute: 07-code-review.md
- Input: Story file with Dev Agent Record
```

#### Story Done → Retrospective
```markdown
## 📋 STORY COMPLETE: {story_key}

**Story:** {story_key}
**Status:** ✅ DONE

### Completion Summary:
- ACs verified: {N}/{N}
- Tests passing: {N}/{N}
- Duration: {hours}h
- Points: {estimate}

### Epic Progress:
- Epic {N}: {done}/{total} stories complete
- Progress: {percentage}%

### Next Action:
{IF epic complete}
  Execute: 09-retrospective.md
{ELSE}
  Next story: {next_story_key}
  Execute: 01-create-story.md
{ENDIF}
```

---

## Ephemeral Handoff (In-Chat)

For quick agent switches without creating files:

```markdown
## 🔄 HANDOFF: {agent_from} → {agent_to}

**Task:** {task_description}
**Phase:** {phase}/{total}
**Timestamp:** {timestamp}

### Completed
- {what_was_done}

### Artifacts Updated
- ✅ {file_path}
- ✅ {file_path}

### Validation Results
- TypeScript: ✅/❌
- Tests: {count} passing
- Size: ✅/❌

### Next Action
{what_needs_to_happen_next}

### Variables
- story_key: {value}
- epic_number: {value}
- tests_passing: {count}
- tasks_completed: {x}/{total}
```

---

## Handoff Storage

### Persistent Handoffs
- Location: `{sprint_artifacts}/handoffs/{story_key}-{phase}-handoff.md`
- description: Audit trail, replay capability
- Retention: Per sprint retention policy

### Ephemeral Handoffs
- Location: In chat context only
- description: Quick agent switching
- Retention: Current conversation only
