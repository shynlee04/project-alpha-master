---
name: "artifact-scanner"
type: "governance-scanner"
description: "Scan documents and artifacts with staleness detection + code validation"
version: "1.1.0"
updated: "2026-01-11"
mode: subagent
model: minimax/MiniMax-M2.1
temperature: 0.1
tools:
  write: false
  edit:  false
  bash:  true
  read:  true
  mcp: true
  glob: true
  grep: true
  list: true
  search: true
  serena mcp: true
  repomix mcp: true
---

# Artifact Scanner (Updated)

**description**: Scan all governance documents and artifacts to detect staleness, inconsistencies, and orphaned files.

**Enhanced**: Now integrates with actual code validation (TypeScript + Vitest) for story continuity.

## Scan Scope

- **Locations**:
  - `_bmad-output/` - All output artifacts
  - `_bmad-ext/` - Extension layer artifacts
  - `_bmad/modules/` - Module artifacts (if any)

- **File Types**:
  - `.md` - Markdown documents
  - `.yaml` - Configuration files
  - `.xml` - Workflow definitions

## Real Timing Standards (Based on Actual Data)

| Work Unit | Real Average | Examples |
|-----------|--------------|----------|
| **Story (simple)** | 1-2 hours | FS-05: 1.5h, MOBILE stories |
| **Story (complex)** | 2-4 hours | 40-01 Tool Registry: ~3h |
| **Epic (6-8 stories)** | 4-8 hours | EPIC-40: 12 stories/day |

### Velocity Reality
```
✅ NORMAL: 4-8 stories/day, 1-3 epics/day
✅ EXCEPTIONAL: 2-3 epics/day in flow state
```

## Staleness Detection (Based on Work, NOT Just Time)

### 1. Story Continuity Check

```yaml
story_continuity:
  check_interval: "Every story completion"
  checks:
    - type: "code_validation"
      command: "pnpm tsc --noEmit"
      blocks_if: "errors > 0"

    - type: "test_validation"
      command: "pnpm vitest run"
      blocks_if: "tests failing"

    - type: "story_status_check"
      source: "bmm-workflow-status.yaml"
      checks:
        - "Current story completed?"
        - "Next story ready?"
        - "Dependencies resolved?"

    - type: "governance_freshness"
      sources:
        - "AGENTS.md"
        - "CLAUDE.md"
        - "_bmad-ext/modules/*/MODULE.md"
      threshold: "4 hours since last update"
```

### 2. Staleness Criteria

```yaml
staleness_criteria:
  # Based on story continuity, NOT just time
  - type: "story_stale"
    rule: "Story in progress > 4 hours without progress update"
    action: "Prompt for continuation/defer"

  - type: "governance_stale"
    threshold: "4 hours"  # Reduced from 48h for active sprints
    rule: "AGENTS.md/CLAUDE.md not updated after 3 stories"
    action: "Auto-update governance"

  - type: "orphaned"
    rule: "No references in other files"
    action: "Flag for review"

  - type: "duplicate"
    rule: "Similar filename and content"
    action: "Archive duplicate"

  - type: "inconsistent"
    rule: "Frontmatter data doesn't match reality"
    action: "Update or archive"

  - type: "code_mismatch"
    rule: "Code changed but documentation stale"
    action: "Update docs or flag"
```

### 3. Actual Code Validation Commands

```yaml
code_validation:
  typescript:
    command: "pnpm tsc --noEmit"
    timeout: "60000ms"
    blocks_progress: true

  tests:
    command: "pnpm vitest run"
    timeout: "120000ms"
    blocks_progress: true

  lint:
    command: "pnpm lint"
    timeout: "60000ms"
    blocks_progress: false  # Warning only

  story_progress:
    source: "bmm-workflow-status.yaml"
    checks:
      - "current_workflow.status"
      - "active_epics[].progress"
      - "stories_completed_this_session"
```

## Scan Process

### Step 1: Discover Artifacts

```
For each directory in scope:
  Find all .md, .yaml, .xml files
  Record: path, size, modified date, frontmatter (if present)
```

### Step 2: Story Continuity Check

```yaml
continuity_check:
  order:
    1. "Run TypeScript validation (pnpm tsc --noEmit)"
    2. "Run tests (pnpm vitest run)"
    3. "Check story progress in bmm-workflow-status.yaml"
    4. "Verify governance freshness"
    5. "Report findings"

  on_failure:
    - "Block further story execution"
    - "Prompt user: Continue/Defer/Fix"
    - "Log to LOOP_STATE.errors"
```

### Step 3: Staleness Detection

Check each artifact for staleness based on:
- Time since last update
- Story completion status
- Code validation results
- Governance freshness

### Step 4: Artifact Categories

```yaml
categories:
  planning:
    - product-brief-*.md
    - module-plan-*.md
    - architecture-*.md

  execution:
    - story-*.md
    - epic-*.md
    - sprint-status-*.yaml

  governance:
    - governance-report-*.md
    - analysis-*.md
    - research-*.md
    - AGENTS.md
    - CLAUDE.md
    - _bmad-ext/modules/*/MODULE.md

  reference:
    - CLAUDE.md
    - AGENTS.md
    - README.md
```

## Integration Points

### Used By
- context-first workflow (Step 2)
- master-orchestrator (on story completion)
- sprint-planning-wrapper (before handoff)

### Output Format

```yaml
artifact_scan_results:
  scan_date: "{date}"
  scan_duration: "{seconds}s"

  code_validation:
    typescript:
      status: "passing" | "failing"
      errors: 0
    tests:
      status: "passing" | "failing"
      failures: 0

  story_continuity:
    current_story: "FS-05"
    story_status: "in_progress" | "done"
    time_in_story: "2.5h"
    progress: "60%"

  artifacts_found: [count]
  by_category:
    planning: {count}
    execution: {count}
    governance: {count}
    reference: {count}

  stale_artifacts:
    - file: "{path}"
      type: "{story_stale|governance_stale|orphaned|duplicate|inconsistent}"
      age: "{time}"
      recommendation: "{archive|update|keep|fix}"

  issues_found:
    - type: "{issue type}"
      severity: "{level}"
      blocks_progress: true | false

  next_action:
    - "Continue story execution"
    - "Fix code validation errors"
    - "Update governance docs"
    - "Archive stale artifacts"
```

## Story Continuity Enforcement

### Before Each Story

```yaml
pre_story_check:
  1. "Verify TypeScript compiles (pnpm tsc --noEmit)"
  2. "Verify tests pass (pnpm vitest run)"
  3. "Check bmm-workflow-status.yaml for current story"
  4. "Verify LOOP_STATE is updated"

  if_any_fail:
    - "BLOCK story execution"
    - "Prompt: Fix before continuing"
    - "Log to LOOP_STATE.errors"
```

### After Each Story

```yaml
post_story_check:
  1. "Update bmm-workflow-status.yaml"
  2. "Update LOOP_STATE.current_story"
  3. "Check if governance update needed (every 3 stories)"
  4. "Verify code still passes"
  5. "Prepare next story"

  if_governance_needed:
    - "Update AGENTS.md"
    - "Update CLAUDE.md"
    - "Update _bmad-ext/modules/*/MODULE.md"
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-11 | Added code validation, story continuity, timing governance |
| 1.0.0 | 2026-01-11 | Initial artifact scanner |
