# Stale Artifact Validation Workflow

**Workflow ID**: `@bmad/modules/governance/workflows/stale-artifact-validation`
**Version**: 2.0.0
**Created**: 2026-01-06
**Updated**: 2026-01-06
**Purpose**: HARD-WIRED stale artifact detection → auto context recovery → user approval gate
**Enforcement**: PRE-EXECUTION HOOK (Claude Code + OpenCode)

---

## ═══════════════════════════════════════════════════════════════════════════════
## HARD-WIRED STOP CONDITION (NON-OVERRIDEABLE)
## ═════════════════════════════════════════════════════════════════════════════════

```yaml
CRITICAL_STOP_CONDITION:
  IF: artifact.age > 24 hours
    OR artifact.sequence broken
    OR artifact.metadata disconnected
    OR artifact.parent_id missing

  THEN:
    1. STOP workflow immediately
    2. Grep search artifact_id across _bmad-output/
    3. Read last 3 related artifacts
    4. Synthesize context summary
    5. PRESENT TO USER with recovered context
    6. WAIT for user: 'continue' OR 'abort' OR 'refresh'

  ENFORCEMENT:
    - Pre-execution hook (.claude/hooks/pre-execution.sh)
    - Pre-execution hook (.opencode/hooks/pre-execution.sh)
    - Ralph Loop integration (automatic check on iteration)
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## MULTI-TEAM INTEGRATION PROTOCOL
## ═════════════════════════════════════════════════════════════════════════════════

```yaml
team_synchronization:
  teams:
    - team_a: "Team-A"  # Primary team (main branch work)
    - team_b: "Team-B"  # Secondary team (feature/experimental work)

  independent_sprints:
    allow: true
    description: "Two teams can run independent sprints on different epics"

  integration_points:
    - trigger: "shared_epic_detected"
      action: "coordinate_story_sequence"
      protocol: "both_teams_must_acknowledge"

    - trigger: "artifact_conflict"
      action: "stop_and_ask_user"
      protocol: "team_resolution_required"

    - trigger: "status_file_divergence"
      action: "merge_status_files"
      protocol: "weighted_consolidation"
```

### Multi-Team Validation Flow

```
┌─────────────────┐     ┌─────────────────┐
│   TEAM A        │     │   TEAM B        │
│   Sprint        │     │   Sprint        │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │  1. Check artifact    │
         │     freshness        │
         │                       │
         ▼                       ▼
┌─────────────────────────────────────┐
│     STALE ARTIFACT DETECTED?        │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
    YES │             │ NO
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│ GREP SEARCH  │  │ CONTINUE    │
│ + RECOVERY   │  │ WORKFLOW    │
└──────┬───────┘  └──────────────┘
       │
       ▼
┌──────────────┐
│ ASK USER     │
│ CONTINUE?    │
└──────┬───────┘
       │
    ┌──┴──┐
    │     │
   YES   NO
    │     │
    ▼     ▼
CONTINUE  ABORT
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## VALIDATION CHECKPOINTS
## ═════════════════════════════════════════════════════════════════════════════════

### Checkpoint 1: Timestamp Validation

```yaml
timestamp_check:
  field: "created_at"
  threshold: "24 hours"
  calculation: "current_time - created_at"

  if age_hours > 24:
    status: "STALE"
    severity: "CRITICAL"
    action: "STOP_AND_RECOVER"

  elif age_hours > 12:
    status: "WARNING"
    severity: "MEDIUM"
    action: "LOG_WARNING"
```

### Checkpoint 2: Metadata Integrity

```yaml
metadata_check:
  required_fields:
    - artifact_id
    - parent_id
    - sequence_number
    - created_at
    - expires_at
    - status
    - related_artifacts

  validation:
    missing_fields: []
    invalid_format: []

  if missing_fields.length > 0 OR invalid_format.length > 0:
    status: "BROKEN"
    severity: "CRITICAL"
    action: "STOP_AND_RECOVER"
```

### Checkpoint 3: Sequence Validation

```yaml
sequence_check:
  current_sequence: artifact.sequence_number
  expected_next: current_sequence + 1

  for each related_artifact:
    if artifact.sequence_number != expected_sequence:
      status: "DISCONNECTED"
      severity: "CRITICAL"
      action: "STOP_AND_RECOVER"
```

### Checkpoint 4: Multi-Team Conflict Detection

```yaml
team_conflict_check:
  check: "same_artifact_id in both_team_outputs"

  if conflict_detected:
    status: "TEAM_CONFLICT"
    severity: "CRITICAL"
    action: "STOP_AND_ASK_USER"

    message_template: |
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ⚠️  MULTI-TEAM CONFLICT DETECTED
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      Artifact: {artifact_id}

      Team A: {team_a_status}
      Team B: {team_b_status}

      Both teams have produced artifacts for the same story.
      Please coordinate which version to proceed with.
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## CONTEXT RECOVERY PROTOCOL
## ═════════════════════════════════════════════════════════════════════════════════

### Recovery Steps

```bash
# Step 1: Grep search for artifact_id
grep -r "{artifact_id}" _bmad-output/ \
  --include="*.md" \
  --include="*.yaml" \
  --exclude-dir=".archive"

# Step 2: Grep search for parent_id (trace lineage)
grep -r "{parent_id}" _bmad-output/ \
  --include="*.md" \
  --include="*.yaml"

# Step 3: Find sequential artifacts
# Pattern: {artifact_id}-{n}, {artifact_id}-{n+1}, {artifact_id}-{n+2}

# Step 4: Sort by timestamp, read last 3
ls -t _bmad-output/**/*{artifact_id}*.md | head -3

# Step 5: Extract context from each
# - Original task
# - Progress made
# - Remaining work
# - Blockers encountered
```

### Recovery Output Template

```markdown
╔══════════════════════════════════════════════════════════════════════════════
🚨 STALE ARTIFACT DETECTED - WORKFLOW STOPPED
╚══════════════════════════════════════════════════════════════════════════════

Artifact: {artifact_id}
Age: {hours} hours old (threshold: 24h)
Status: {recovered_status}
Team: {team_a | team_b | both}

────────────────────────────────────────────────────────────────────────────
CONTEXT RECOVERED (via grep search):
────────────────────────────────────────────────────────────────────────────

Original Task:
  {original_task_description}

Progress Made:
  {what_was_completed} ({completion_percentage}%)

Remaining Work:
  {remaining_items}

Blockers:
  {any_issues_found}

────────────────────────────────────────────────────────────────────────────
RELATED ARTIFACTS FOUND:
────────────────────────────────────────────────────────────────────────────
  1. {artifact-id-001} - handoff.md ({timestamp_1})
  2. {artifact-id-002} - validation.md ({timestamp_2})
  3. {artifact-id-003} - report.md ({timestamp_3})

────────────────────────────────────────────────────────────────────────────
YOUR OPTIONS:
────────────────────────────────────────────────────────────────────────────
  [1] CONTINUE - Proceed with recovered context
  [2] REFRESH - Re-validate artifact and update context
  [3] ABORT   - Stop workflow and notify human
  [4] MERGE   - Merge with conflicting team's artifact (if multi-team conflict)
╚══════════════════════════════════════════════════════════════════════════════
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## REQUIRED FRONTMATTER (ALL ARTIFACTS)
## ═════════════════════════════════════════════════════════════════════════════════

```yaml
---
artifact_id: "{prefix}-{domain}-{sequence}"
artifact_type: "handoff" | "report" | "validation" | "research"
parent_id: "{epic-id or parent-story-id}"
sequence_number: {int}
created_at: "YYYY-MM-DDTHH:mm:ssZ"
expires_at: "YYYY-MM-DDTHH:mm:ssZ"  # 24h for short-live artifacts
status: "DRAFT" | "ACTIVE" | "SUPERSEDED" | "ARCHIVED"
team: "Team-A" | "Team-B" | "both"
related_artifacts: ["prev-id", "next-id"]
tags: []
last_validated: "YYYY-MM-DDTHH:mm:ssZ"
---
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## SUCCESS CRITERIA
## ═════════════════════════════════════════════════════════════════════════════════

- [ ] Pre-execution hook validates artifact freshness (<24h)
- [ ] Grep search recovers context automatically
- [ ] User presented with recovered context BEFORE workflow continues
- [ ] Multi-team conflicts detected and flagged
- [ ] Sequence integrity validated before processing
- [ ] All artifacts have complete frontmatter
- [ ] Ralph Loop tracks validation state

---

**Workflow Owner**: @bmad/modules/governance
**Last Updated**: 2026-01-06
**Status**: ACTIVE - HARD-WIRED
**Integration**: Ralph Loop + Pre-execution hooks (Claude Code + OpenCode)
