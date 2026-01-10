---
name: retrospective
description: Epic retrospective after all stories complete. Use when user says "retrospective", "retro", or after epic completes. Creates epic retrospective document with lessons learned and improvements.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: workflow
parent: story-cycle
children: []
priority: 64
agents:
  - bmad-bmm-sm
triggers:
  - retrospective
  - retro
  - epic retro
  - /retrospective
---

# Step 09: Epic Retrospective

**Purpose**: Create epic retrospective document after all stories in epic are complete. Captures lessons learned, improvements, and action items.

## When to use

- All stories in epic are marked "done"
- User says "retrospective" or "retro"
- Epic completion checkpoint
- End of epic cycle

## Instructions

### 1. Load Epic Data
```bash
READ: _bmad-output/epics.md
READ: _bmad-output/sprint-artifacts/sprint-status.yaml
READ: _bmad-output/project-planning-artifacts/architecture.md
```

### 2. Verify Epic Completion

Confirm all stories in epic are "done":
```bash
# For epic {N}, count:
stories_total = {total_stories_in_epic}
stories_done = count(stories with status="done" and epic={N})

# If stories_done == stories_total: PROCEED
# Else: Notify user epic is not complete
```

### 3. Gather Story Data

For each story in epic:
```bash
READ: {sprint_artifacts}/{story_key}.md
```

Extract:
- Story title and points
- Completion date
- Files changed
- Tests created
- Dev Agent Record notes
- Code Review issues

### 4. Create Retrospective Document

**Location**: `{sprint_artifacts}/epic-{N}-retrospective.md`

```markdown
# Epic {N} Retrospective

**Epic:** {epic_name}
**Completed At:** {timestamp}
**Stories:** {total} stories

## Executive Summary

{brief_overview_of_epic_accomplishments}

## Epic Details

| Story | Points | Status | Completed | Files | Tests |
|-------|--------|--------|-----------|-------|-------|
| {story-1} | {pts} | ✅ | {date} | {N} | {N} |
| {story-2} | {pts} | ✅ | {date} | {N} | {N} |

### Metrics
- **Total Points:** {sum}
- **Duration:** {start_date} to {end_date}
- **Files Changed:** {total}
- **Tests Created:** {total}
- **Velocity:** {points_per_sprint}

## What Went Well

### Process
- {positive_1}
- {positive_2}

### Technical
- {positive_1}
- {positive_2}

### Collaboration
- {positive_1}
- {positive_2}

## What Could Be Improved

### Process
- {improvement_1}
- {improvement_2}

### Technical
- {improvement_1}
- {improvement_2}

### blockers
- {blocker_1} - {how_resolved}

## Action Items

| Item | Priority | Owner | Due Date |
|------|----------|-------|----------|
| {action_1} | {P1/P2/P3} | {who} | {when} |
| {action_2} | {P1/P2/P3} | {who} | {when} |

## Lessons Learned

### For Next Epic
1. {lesson_1}
2. {lesson_2}

### Process Improvements
1. {improvement_1}
2. {improvement_2}

## Technical Debt Created

| Item | Impact | Plan |
|------|--------|------|
| {debt_1} | {level} | {plan} |

## Governance Updates

If structural changes were made:
- [ ] AGENTS.md updated
- [ ] CLAUDE.md updated
- [ ] Architecture.md updated

## Sign-off

**Epic Status:** COMPLETE ✅
**Retrospective Created By:** {agent}
**Date:** {timestamp}

---

**Next Epic:** {next_epic_number_or_tbd}
```

### 5. Update Sprint Status

```yaml
# _bmad-output/sprint-artifacts/sprint-status.yaml
epics:
  epic-{N}:
    status: "complete"
    completed_at: {timestamp}
    retrospective_created: true
    stories_completed: {total}
    total_points: {sum}
```

### 6. Update Epics Document

Mark epic as complete:
```markdown
# _bmad-output/epics.md

## Epic {N}: {epic_name} ✅ COMPLETE

**Status:** Complete
**Completed:** {timestamp}
**Retrospective:** [epic-{N}-retrospective.md](sprint-artifacts/epic-{N}-retrospective.md)
```

## Retrospective Categories

### What Went Well
- Process improvements that worked
- Technical successes
- Collaboration wins
- Tools or techniques that helped

### What Could Be Improved
- Process bottlenecks
- Technical challenges
- Communication issues
- Resource constraints

### Action Items
- Process changes for next epic
- Technical debt to address
- Tools to evaluate
- Skills to develop

## Completion Checklist

- [ ] All epic stories verified "done"
- [ ] Retrospective document created
- [ ] Metrics calculated
- [ ] Lessons documented
- [ ] Action items defined
- [ ] Sprint status updated
- [ ] Epics document marked complete

## Next Steps

After retrospective:
- Begin next epic in backlog
- Address action items
- Apply lessons learned to future work

---

**Source**: `_bmad/bmb/workflows/story-cycle/steps/09-retrospective.md`
