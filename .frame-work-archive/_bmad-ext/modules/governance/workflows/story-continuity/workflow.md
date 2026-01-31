---
name: "story-continuity"
description: "Validate story continuity with actual code checks before/after each story"
phase: "0"
installed_path: '_bmad-ext/modules/governance/workflows/story-continuity'
output_folder: '_bmad-output/governance/continuity'
version: "1.0.0"
created: "2026-01-11"
---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
---

# Story Continuity Checker

**description**: Validate story continuity with actual code checks before/after each story execution

**Key Principle**: Stories take 1-4 hours average. 2-3 epics per day is normal.

## Real Timing Standards (Based on Actual Data)

| Work Unit | Real Average | Examples |
|-----------|--------------|----------|
| **Story (simple)** | 1-2 hours | FS-05: 1.5h, MOBILE stories |
| **Story (complex)** | 2-4 hours | 40-01 Tool Registry: ~3h |
| **Epic (6-8 stories)** | 4-8 hours | EPIC-40: 12 stories/day |
| **Epic (mini 3-4)** | 2-4 hours | EPIC-39: 4 stories/day |

### Velocity Reality
```
✅ NORMAL: 4-8 stories/day, 1-3 epics/day
✅ EXCEPTIONAL: 2-3 epics/day in flow state
```

### Time-Boxing Rules

| Level | Duration | On Timeout |
|-------|----------|------------|
| Step | 15 min | Escalate to story |
| Story | 4 hours max | Split or continue |
| Deep Investigation | 30 min | Split story |
| Epic | 8 hours | Adjust scope |

---

## WORKFLOW ARCHITECTURE

### Three Checks Per Story

```
┌─────────────────────────────────────────────────────────────┐
│                    STORY CONTINUITY                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────┐ │
│  │ PRE-STORY CHECK │ →  │ STORY EXECUTION │ →  │ POST    │ │
│  │ (Code Valid)    │    │ (1-4 hours)     │    │ CHECK   │ │
│  └─────────────────┘    └─────────────────┘    └─────────┘ │
│         │                      │                   │        │
│         ▼                      ▼                   ▼        │
│  • TypeScript           • Work on story      • Update      │
│  • Tests                • Progress updates   • Validate    │
│  • Story status        OP_STATE         • LO • Governance  │
│  • Dependencies         • Handoffs           • Next story  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## PRE-STORY CHECK

### 1. Code Validation

```bash
# TypeScript check (BLOCKING)
pnpm tsc --noEmit
# Must pass: 0 errors

# Test check (BLOCKING)
pnpm vitest run
# Must pass: 0 failures

# Lint check (WARNING)
pnpm lint
# Non-blocking: warnings ok
```

### 2. Story Status Check

```yaml
source: "bmm-workflow-status.yaml"
checks:
  - "Current story exists?"
  - "Story status is READY or IN_PROGRESS?"
  - "Dependencies resolved?"
  - "Previous story DONE?"

if_story_not_ready:
  - "BLOCK execution"
  - "Prompt: Wait for dependencies"
```

### 3. LOOP_STATE Check

```yaml
source: "_bmad-ext/state/LOOP_STATE.yaml"
checks:
  - "session.active == true"
  - "current.story_id matches bmm-workflow-status.yaml"
  - "anchor.human_intent_timestamp < 4 hours ago"

if_stale_anchor:
  - "PROMPT: Continue/New/Reset/View"
```

### PRE-STORY OUTPUT

```yaml
pre_story_result:
  code_validation:
    typescript: "passing" | "failing"
    tests: "passing" | "failing"
    lint: "passing" | "warnings"

  story_status:
    current_story: "FS-05"
    status: "ready" | "in_progress"
    dependencies_resolved: true | false

  can_proceed: true | false

  if_blocked:
    - reason: "{why blocked}"
    - action: "{what to do}"
```

---

## STORY EXECUTION

### Progress Tracking

```yaml
during_story:
  updates:
    - "Every 15 min: Update LOOP_STATE.current.step"
    - "Every 30 min: Log progress to _bmad-output/sessions/"
    - "On any state change: Update LOOP_STATE"

  checkpoints:
    - "15 min: Implementation started?"
    - "1 hour: 25% complete?"
    - "2 hours: 50% complete?"
    - "3 hours: 75% complete?"
    - "4 hours: Story done OR split needed"

  timeout_handling:
    - "If 4 hours and < 80% complete:"
      - "PROMPT: Continue/Split/Defer"
    - "If 6 hours:"
      - "SPLIT story mandatory"
```

---

## POST-STORY CHECK

### 1. Code Validation (Again)

```bash
pnpm tsc --noEmit
pnpm vitest run
```

### 2. Story Completion

```yaml
update_bmm_workflow_status:
  - "current_workflow.story.status = DONE"
  - "current_workflow.story.completed_at = NOW()"
  - "Increment progress counter"

update_LOOP_STATE:
  - "progress.stories_completed_this_session += 1"
  - "current.story_id = null"
  - "current.step = COMPLETED"
```

### 3. Governance Update Check

```yaml
governance_check:
  trigger: "stories_completed_this_session % 3 == 0"

  if_triggered:
    - "Update AGENTS.md"
    - "Update CLAUDE.md"
    - "Update _bmad-ext/modules/*/MODULE.md"
    - "Archive old governance docs"
```

### 4. Next Story Preparation

```yaml
next_story:
  - "Load bmm-workflow-status.yaml"
  - "Identify next story"
  - "Verify dependencies"
  - "Prepare PRE-STORY check for next iteration"

  if_no_more_stories:
    - "Check if epic complete"
    - "If epic complete: Run epic retrospective"
    - "If epic incomplete: Flag for review"
```

### POST-STORY OUTPUT

```yaml
post_story_result:
  story_id: "FS-05"
  completed_at: "2026-01-11T19:30:00+07:00"
  duration: "1h 30m"

  code_validation:
    typescript: "passing"
    tests: "passing"

  stories_completed_this_session: 1
  stories_remaining: 4

  governance_updated: true | false

  next_story:
    id: "FS-06"
    ready: true | false

  epic_progress: "35.7%"
```

---

## CONTINUATION DECISION

After each story, check if should continue:

```yaml
continue_if:
  - "More stories pending in bmm-workflow-status.yaml"
  - "Code validation passes"
  - "No errors in LOOP_STATE.errors.count"
  - "Anchor fresh (< 4 hours)"
  - "No user interrupt"

stop_if:
  - "All stories complete"
  - "Critical error (LOOP_STATE.errors.count > 0)"
  - "Anchor stale (await confirmation)"
  - "User interrupt"
```

---

## INTEGRATION POINTS

### With Master Orchestrator

```
Entry: After story handoff from orchestrator
Exit: After POST-STORY check, return to orchestrator
```

### With bmm-workflow-status.yaml

```
Read: current_workflow.story, current_workflow.epic
Write: story status, completed_at, progress
```

### With LOOP_STATE.yaml

```
Read: session.id, current.story_id, anchor.human_intent_timestamp
Write: current.step, progress.stories_completed_this_session, errors
```

### With Governance Docs

```
Trigger: Every 3 stories
Update: AGENTS.md, CLAUDE.md, _bmad-ext/modules/*/MODULE.md
```

---

## METRICS TRACKING

| Metric | Source | Target |
|--------|--------|--------|
| Stories/day | LOOP_STATE | 4-8 |
| Epics/day | bmm-workflow-status.yaml | 1-3 |
| Story duration | Post-story output | 1-4 hours |
| Code validation pass rate | Pre/Post checks | 100% |
| Governance update rate | Every 3 stories | 100% |

---

## EXAMPLE OUTPUT

```yaml
---
workflow: "story-continuity"
version: "1.0.0"
date: "2026-01-11"
session_id: "ses-4693-2026-01-11"

pre_story:
  timestamp: "2026-01-11T18:15:00+07:00"
  story_id: "FS-05"
  code_validation:
    typescript: "passing"
    tests: "passing"
  story_status: "in_progress"
  can_proceed: true

story_execution:
  started: "2026-01-11T18:15:00+07:00"
  completed: "2026-01-11T19:45:00+07:00"
  duration: "1h 30m"
  progress_updates:
    - "18:30 - Implementation started"
    - "19:00 - 50% complete"
    - "19:30 - 80% complete"

post_story:
  timestamp: "2026-01-11T19:45:00+07:00"
  code_validation:
    typescript: "passing"
    tests: "passing"
  story_completed: true
  stories_completed_session: 1

continuation:
  decision: "continue"
  next_story: "FS-06"
  stories_remaining: 4
---

version: "1.0.0"
created: "2026-01-11"
