---
step: 8
name: "story-done"
phase: "completion"
agent: "@bmad-bmm-sm"
timeout: "10 min"
next: "09-retrospective.md OR next-story"
on_fail: "notify-and-pause"
---

# Step 08: Story Done

> **Agent:** Story Manager (SM)
> **description:** Finalize story, update governance, determine next action

---

## Instructions

### 1. Load Story File

```bash
READ: {sprint_artifacts}/{story_key}.md
```

**Verify:**
- Code review approved
- All tasks marked complete
- Dev Agent Record populated
- No blockers

### 2. Final Validation

**Check ALL before marking done:**

- [ ] Story status is `review`
- [ ] Code review sign-off says "APPROVED"
- [ ] All ACs verified in review
- [ ] All tests passing
- [ ] TypeScript check passes
- [ ] Dev Agent Record complete

**If any fail:** Notify with specific issue, do not mark done.

### 3. Update Story Status

```yaml
# In story file frontmatter
status: "done"
completed_at: {timestamp}
completed_by: "{agent_name}"
```

```markdown
# In story file Status History table
| done | {timestamp} | SM | Story completed, all ACs passing |
```

### 4. Update Sprint Status

```yaml
# _bmad-output/sprint-artifacts/sprint-status.yaml

stories:
  {story_key}:
    status: "done"
    completed_at: {timestamp}
    tests_count: {N}
    tests_passing: {N}
    points: {estimate}

# Update epic progress
epics:
  epic-{N}:
    stories_done: {current_count}
    stories_total: {total_count}
    progress: "{percentage}%"
```

### 5. Update BMM Workflow Status (if exists)

```yaml
# _bmad-output/bmm-workflow-status.yaml or equivalent

sprint:
  completed_stories:
    - story: {story_key}
      completed_at: {timestamp}
      tests: {N}
      points: {estimate}
  last_updated: {timestamp}
```

### 6. Determine Next Action

**Check if epic is complete:**

```yaml
IF (stories_done == stories_total) AND (all_tests_passing):
  # Epic complete - run retrospective
  NEXT_ACTION: Execute 09-retrospective.md
ELSE:
  # More stories in epic - continue
  NEXT_ACTION: Begin next story in epic
ENDIF
```

### 7. Create Handoff Artifact

**Create:** `{sprint_artifacts}/{story_key}-handoff.md`

```markdown
# Story Handoff: {story_key}

**Completed:** {timestamp}
**Agent:** SM Agent

## Summary
Story {story_key} completed successfully.
- ACs: {N}/{N} verified
- Tests: {N}/{N} passing
- Files: {N} created, {N} modified

## Artifacts Produced
- Story file: {sprint_artifacts}/{story_key}.md
- Context XML: {sprint_artifacts}/{story_key}-context.xml
- Handoff: {sprint_artifacts}/{story_key}-handoff.md

## Files Changed
{From Dev Agent Record}

## Tests Created
{From Dev Agent Record}

## Next Action
{IF epic complete}
  Execute: 09-retrospective.md
  Input: Epic {N}
{ELSE}
  Next story: {next_story_key}
  Execute: story-dev-cycle from step 01
{ENDIF}
```

---

## Handoff Output

```markdown
## 📋 STEP COMPLETE: 08-story-done

**Story:** {story_key}
**Status:** ✅ DONE

### Completion Summary:
- ACs verified: {N}/{N}
- Tests passing: {N}/{N}
- Duration: {hours}h
- Points: {estimate}

### Artifacts Updated:
- ✅ {sprint_artifacts}/{story_key}.md (status: done)
- ✅ {sprint_artifacts}/sprint-status.yaml
- ✅ {bmm_status_file}

### Epic Progress:
- Epic {N}: {done}/{total} stories complete
- Progress: {percentage}%

### Next Action:
{IF epic complete}
  🎉 Epic complete!
  Execute: 09-retrospective.md
{ELSE}
  Next story: {next_story_key}
  Execute: /create-story for next story
{ENDIF}
```
