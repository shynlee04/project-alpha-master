---
name: story-done
description: Mark story complete and update governance. Use when user says "story done", "complete story", or after code review passes. Updates sprint status, creates handoff artifact, and triggers retrospective if epic complete.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: workflow
parent: story-cycle
children: []
priority: 63
agents:
  - bmad-bmm-sm
triggers:
  - story done
  - complete story
  - finish story
  - /story-done
---

# Step 08: Story Done

**Purpose**: Mark story complete, update sprint status, create handoff artifact, and trigger retrospective if epic complete.

## When to use

- After code review approved
- User says "story done" or "complete story"
- Marking story as complete
- Final story step

## Instructions

### 1. Load Story and Sprint Status
```bash
READ: {sprint_artifacts}/{story_key}.md
READ: _bmad-output/sprint-artifacts/sprint-status.yaml
READ: _bmad-output/epics.md
```

### 2. Final Verification

Before marking done, confirm:
- [ ] Story status is "review-approved"
- [ ] All ACs verified in review
- [ ] All tests passing
- [ ] TypeScript check passed
- [ ] Dev Agent Record complete
- [ ] Code Review section filled

### 3. Update Story Status

```yaml
# In story file
---
story_key: "{epic}-{story}-{slug}"
epic: {N}
story: {N}
status: "done"
completed_at: {timestamp}
points: {estimate}
---
```

### 4. Update Sprint Status

```yaml
# _bmad-output/sprint-artifacts/sprint-status.yaml
stories:
  {story_key}:
    status: "done"
    completed_at: {timestamp}
    epic: {N}
    points: {estimate}

# Update epic progress
epics:
  epic-{N}:
    stories_completed: {count}
    stories_total: {total}
    progress: "{percentage}%"
```

### 5. Create Handoff Artifact

**Location**: `{sprint_artifacts}/{story_key}-handoff.md`

```markdown
## 📋 HANDOFF: Story Complete

**Story:** {epic}-{story}-{slug}
**Completed At:** {timestamp}

### Summary
{brief_summary_of_what_was_accomplished}

### Artifacts Created
- ✅ {sprint_artifacts}/{story_key}.md
- ✅ {sprint_artifacts}/{story_key}-context.xml
- ✅ {sprint_artifacts}/{story_key}-handoff.md

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| {file} | {created/modified} | {N} |

### Tests Created
- {test_file}: {count} tests

### Acceptance Criteria
- [x] AC-1: {name} - VERIFIED
- [x] AC-2: {name} - VERIFIED
- [x] AC-3: {name} - VERIFIED

### Next Steps
- If epic complete: Trigger retrospective
- If epic incomplete: Proceed to next story

### Epic Status
**Epic:** {epic_number}
**Stories Complete:** {current}/{total}
**Epic Status:** {in_progress|complete}
```

### 6. Check Epic Completion

```bash
# Check if all stories in epic are done
READ: _bmad-output/epics.md
# Count stories with status="done" for this epic
```

#### If Epic Complete:
Trigger: [retrospective](../retrospective/SKILL.md) epic={epic_number}

#### If Epic Incomplete:
```yaml
# Offer to start next story
next_story:
  epic: {epic_number}
  story: {next_number}
  suggestion: "Start next story in epic {epic_number}?"
```

### 7. Update Governance

If story involved structural changes:
- [ ] Update AGENTS.md if needed
- [ ] Update CLAUDE.md if patterns changed
- [ ] Run `/governance-enforcement` if required

## Output Artifacts

Created during this step:
```
_bmad-output/sprint-artifacts/
├── {story_key}-handoff.md    # Handoff artifact
└── sprint-status.yaml          # Updated
```

## Completion Checklist

- [ ] Story status set to "done"
- [ ] Completed timestamp added
- [ ] Sprint status updated
- [ ] Epic progress recalculated
- [ ] Handoff artifact created
- [ ] Epic completion checked
- [ ] Governance updated if needed
- [ ] Next action identified

## Next Step

**If epic complete:**
- Trigger: [retrospective](../retrospective/SKILL.md) epic={epic_number}

**If epic incomplete:**
- Suggest starting next story in epic
- Or await user direction

## Handoff Template

```markdown
## 📋 STEP COMPLETE: 08-story-done

**Story:** {story_key}
**Status:** done

### Artifacts Updated:
- ✅ Story file marked complete
- ✅ Sprint status updated
- ✅ Handoff artifact created
- ✅ Epic progress updated

### Summary:
- Files changed: {N}
- Tests created: {N}
- ACs verified: {N}/{N}

### Epic Status:
- Epic {N}: {current}/{total} stories complete
- Progress: {percentage}%

### Next Step:
{retrospective or next_story}
```

---

**Source**: `_bmad/bmb/workflows/story-cycle/steps/08-story-done.md`
