---
step: 9
name: "retrospective"
phase: "epic-completion"
agent: "@bmad-bmm-sm"
timeout: "30 min"
next: "next-epic"
on_fail: "notify-and-pause"
---

# Step 09: Epic Retrospective

> **Agent:** Story Manager (SM)
> **Trigger:** All stories in epic have status "done"
> **Output:** Epic retrospective document

---

## Instructions

### 1. Verify Epic Completion

```bash
READ: _bmad-output/sprint-artifacts/sprint-status.yaml
READ: _bmad-output/epics.md
```

**Check:**
- All stories in epic have status `done`
- All tests passing (100%)
- No blockers remaining

### 2. Load All Story Files

```bash
FOR EACH story IN epic:
  READ: {sprint_artifacts}/{story}.md
END FOR
```

Extract:
- Points per story
- Tasks completed
- Dev notes
- Decisions made
- Issues encountered

### 3. Generate Retrospective

**Create:** `{sprint_artifacts}/epic-{N}-retrospective.md`

```markdown
# Epic {N} Retrospective

**Epic:** {epic_name}
**Completed:** {timestamp}
**Stories:** {count}
**Total Points:** {points}

## Summary
{brief_summary_of_what_was_accomplished}

## Stories Completed

| Story | Title | Points | Status | Tests |
|-------|-------|--------|--------|-------|
| {story_key} | {title} | {pts} | ✅ Done | {N}/{N} |
| {story_key} | {title} | {pts} | ✅ Done | {N}/{N} |

## Metrics

### Velocity
- Planned points: {planned}
- Actual points: {actual}
- Velocity variance: {variance}%

### Quality
- Total tests: {N}
- Passing: {N} (100%)
- TypeScript errors: 0
- Critical issues: 0

### Timeline
- Start date: {start_date}
- End date: {end_date}
- Duration: {days} days
- Per story average: {avg_days} days

## What Went Well

### Process
- {positive_observation_about_workflow}
- {positive_observation_about_tools}
- {positive_observation_about_coordination}

### Technical
- {technical_success}
- {pattern_that_worked_well}
- {tool_or_library_that_helped}

### Collaboration
- {effective_communication}
- {good_handoff_example}

## What Could Be Improved

### Process
- {inefficiency_identified}
- {bottleneck_encountered}
- {confusion_point}

### Technical
- {technical_challenge}
- {pattern_that_was_difficult}
- {tool_or_library_limitation}

### Collaboration
- {communication_gap}
- {missed_expectation}

## Action Items

| Item | Type | Priority | Owner |
|------|------|----------|-------|
| {action_item} | Process| {P1/P2/P3} | {who} |
| {action_item} | Technical| {P1/P2/P3} | {who} |

## Decisions Made (Architectural)

### Decision 1: {title}
- **Context:** {what_drove_decision}
- **Options Considered:**
  - Option A: {description}
  - Option B: {description}
- **Chosen:** Option {X}
- **Rationale:** {why}
- **Impact:** {consequences}

## Lessons Learned

### For Next Epic
1. {lesson_1}
2. {lesson_2}
3. {lesson_3}

### To Share with Team
- {shareable_insight_1}
- {shareable_insight_2}

## Archives

### Artifacts Produced
- Story files: {location}
- Context files: {location}
- Handoff artifacts: {location}

### Related Documents
- Epic definition: {epics.md}#epic-{N}
- Architecture: {architecture.md}#relevant-section

---
**Retrospective completed by:** SM Agent
**Date:** {timestamp}
```

### 4. Update Governance Files

```yaml
# _bmad-output/epics.md

epic-{N}:
  status: "done"
  completed_at: {timestamp}
  retrospective: "{sprint_artifacts}/epic-{N}-retrospective.md"
```

```yaml
# _bmad-output/sprint-artifacts/sprint-status.yaml

current_epic: {next_epic_or_null}
epic_{N}:
  status: "done"
  completed_at: {timestamp}
```

---

## Handoff Output

```markdown
## 📋 EPIC COMPLETE: Epic {N}

**Epic:** {epic_name}
**Status:** ✅ DONE

### Epic Summary:
- Stories completed: {N}/{N}
- Total points: {points}
- Duration: {days} days
- Tests: {N}/{N} passing

### Retrospective Created:
- ✅ {sprint_artifacts}/epic-{N}-retrospective.md

### Action Items:
- Process improvements: {N}
- Technical items: {N}
- High priority: {N}

### Next Epic:
{if_next_epic_exists}
  Next: Epic {next_epic_number} - {epic_name}
  Execute: /story-cycle for first story
{else}
  All epics complete! 🎉
  Consider: Sprint retrospective
{endif}
```
