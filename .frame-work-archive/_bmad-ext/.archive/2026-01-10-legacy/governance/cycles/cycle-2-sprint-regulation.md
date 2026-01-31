---
id: CYCLE-2
title: Sprint Artifact Regulation
description: Establish 24-hour rule, max 4 sprint files, and story indexing
agent_mode: bmad-bmm-sm
team: B
duration_hours: 2-3
risk_level: MEDIUM
date: 2026-01-09
---

# CYCLE 2: Sprint Artifact Regulation

**Agent Mode:** @bmad-bmm-sm (Scrum Master)
**Team:** B
**Duration:** 2-3 hours
**Context Poisoning Risk:** MEDIUM

## OBJECTIVE

1. Create STORY-INDEX.md with all story files categorized
2. Update sprint-status.yaml to reference index (not inline stories)
3. Establish 24-hour rotation policy
4. Enforce max 4 active sprint files rule

## PRECONDITIONS

- [ ] CYCLE 1 completed (YAML Consolidation)
- [ ] Archive folder structure exists
- [ ] Current sprint files identified

## STORY INDEX CREATION

### Location
`_bmad-output/sprint-artifacts/stories/STORY-INDEX.md`

### Format
```markdown
# Story Index (Auto-Updated)

**Last Updated:** {YYYY-MM-DD HH:MM}
**Active Stories:** {count}
**Completed Stories:** {count}

## Active Stories

| ID | Title | Status | Epic | Sprint | Last Updated |
|----|-------|--------|------|--------|--------------|
| FS-05 | FileLockService | IN_PROGRESS | EPIC-FS | phase-2 | 2026-01-09 |
| FS-06 | Unified CRUD | NOT_STARTED | EPIC-FS | phase-2 | 2026-01-09 |

## In Review Stories

| ID | Title | Status | Epic | Reviewer | Last Updated |
|----|-------|--------|------|----------|--------------|

## Completed Stories (Links Only)

| ID | Title | Epic | Completed | Files |
|----|-------|------|-----------|-------|
| [38-01](story-38-01.md) | Error Boundaries | EPIC-38 | 2026-01-08 | story + context |
| [38-02](story-38-02.md) | FS Adapters | EPIC-38 | 2026-01-08 | story + context |

## Archived Stories

Located in: `_bmad-output/.archive/stories/`
```

### Story Status Extraction Script

```bash
# Extract story metadata from all story files
for file in _bmad-output/sprint-artifacts/stories/story-*.md; do
  # Extract ID from filename
  id=$(basename "$file" .md | sed 's/story-//')
  
  # Extract title from first # heading
  title=$(grep -m1 "^# " "$file" | sed 's/# //')
  
  # Extract status from frontmatter or content
  status=$(grep -m1 "status:" "$file" | awk '{print $2}')
  
  # Get last modified date
  modified=$(stat -f "%Sm" -t "%Y-%m-%d" "$file")
  
  echo "| $id | $title | $status | - | $modified |"
done
```

## SPRINT REGULATION RULES

### Maximum Files Rule

```yaml
sprint_limits:
  max_active_sprint_files: 4
  max_stories_per_sprint: 20
  max_epics_per_sprint: 4
  story_ttl_hours: 48  # Stories inactive >48h need review
  sprint_ttl_days: 7   # Sprints older than 7 days archived
```

### 24-Hour Rotation Policy

```yaml
rotation_policy:
  check_frequency: "daily"
  archive_trigger:
    - "sprint_file.age > 24h AND sprint_file.status == 'COMPLETE'"
    - "sprint_file.age > 7d AND sprint_file.stories.in_progress == 0"
    
  exception_list:
    - "sprint-status.yaml"  # Always keep (single source of truth)
    - "Current day's active sprint files"
```

### Story Lifecycle States

```yaml
story_states:
  NOT_STARTED:
    next: ["CONTEXT_CREATED"]
    requires: []
    
  CONTEXT_CREATED:
    next: ["IN_PROGRESS"]
    requires: ["story.md", "story-context.xml"]
    
  IN_PROGRESS:
    next: ["CODE_REVIEW"]
    requires: ["code changes committed"]
    
  CODE_REVIEW:
    next: ["TESTING", "IN_PROGRESS"]
    requires: ["code-review passed"]
    
  TESTING:
    next: ["DONE", "IN_PROGRESS"]
    requires: ["tsc --noEmit", "vitest run"]
    
  DONE:
    next: []
    requires: ["all validations passed"]
```

## EXECUTION STEPS

### Step 1: Inventory Current Stories

```bash
# Count all story files
find _bmad-output/sprint-artifacts/stories -name "*.md" -type f | wc -l

# List story files with status
for f in _bmad-output/sprint-artifacts/stories/story-*.md; do
  echo "$(basename $f): $(grep -m1 'status:' $f 2>/dev/null || echo 'NO_STATUS')"
done
```

### Step 2: Generate Story Index

Create `STORY-INDEX.md` using the format above.

### Step 3: Update sprint-status.yaml

Remove inline story content, replace with:

```yaml
stories:
  index_file: "_bmad-output/sprint-artifacts/stories/STORY-INDEX.md"
  active_count: 5
  completed_count: 12
  # Story details are in individual files
```

### Step 4: Enforce Sprint Limits

```bash
# Count active sprint files
active_sprints=$(find _bmad-output/sprint-artifacts -maxdepth 1 -name "*-sprint-*.yaml" | wc -l)

if [ $active_sprints -gt 4 ]; then
  echo "⚠️ Too many sprint files ($active_sprints). Archive oldest."
  # Archive logic here
fi
```

## VALIDATION CHECKLIST

- [ ] STORY-INDEX.md exists and is populated
- [ ] All stories have status field in index
- [ ] sprint-status.yaml references index (not inline stories)
- [ ] Maximum 4 active sprint files
- [ ] No sprint file older than 7 days without justification
- [ ] Story lifecycle states are documented

## OUTPUT ARTIFACTS

1. **Story Index**: `_bmad-output/sprint-artifacts/stories/STORY-INDEX.md`
2. **Regulation Doc**: `_bmad-output/governance/sprint-regulation.md`
3. **Updated sprint-status.yaml** (≤500 lines)

## HANDOFF

Report completion to @bmad-core-bmad-master with:
- Story count (active/completed/archived)
- Sprint file count (before/after)
- Any stories with missing status
- Recommendation for stale stories

## EPIC COMPLETION RULES

Add to sprint-status.yaml:

```yaml
epic_completion_gates:
  required_for_done:
    - "100% stories in DONE state"
    - "E2E test suite exists (Playwright)"
    - "E2E tests pass 100%"
    - "Human approval: 'APPROVED: EPIC-{ID}'"
    - "Retrospective completed"
    
  approval_format: "APPROVED: EPIC-{ID}"
  documented_in: "sprint-status.yaml"
```
