# _bmad-ext/orchestrator/governance-auto-update.md

# Governance Auto-Update Protocol

> Defines when and how to automatically update governance documents (AGENTS.md, CLAUDE.md, sprint-status.yaml).

---

## description

Governance documents must stay synchronized with actual project state. This protocol defines:

1. **When** to trigger updates (triggers)
2. **What** to update (scope)
3. **How** to update (procedure)
4. **Validation** (quality checks)

---

## Update Triggers

```yaml
triggers:
  story_count_trigger:
    name: "Story Completion Threshold"
    condition: "progress.stories_completed_this_session % 3 == 0"
    action: "update_agents_md"
    description: "Update AGENTS.md every 3 stories"

  epic_completion_trigger:
    name: "Epic Complete"
    condition: "all_stories_in_epic == DONE"
    action: "full_governance_update"
    description: "Comprehensive update on epic completion"

  architecture_change_trigger:
    name: "Critical Architecture Change"
    condition: |
      story_type in ['god_store_split', 'component_split'] AND
      status == 'SUCCESS'
    action: "update_agents_md_and_claude_md"
    description: "Update both governance docs for arch changes"

  sprint_rotation_trigger:
    name: "Sprint Rotation"
    condition: "sprint_ended == true"
    action: "update_sprint_status_and_agents_md"
    description: "Update sprint artifacts and governance"

  manual_trigger:
    name: "Manual Request"
    condition: "user invokes [GU] Governance Update"
    action: "full_governance_update"
    description: "User-initiated update"
```

---

## Update Scope by Trigger

```yaml
update_scopes:
  minimal:
    triggers: ["story_count_trigger"]
    files:
      - "AGENTS.md" (append section only)
    sections:
      - Recent artifacts
      - Last 3 stories completed

  standard:
    triggers: ["sprint_rotation_trigger"]
    files:
      - "AGENTS.md"
      - "bmm-workflow-status.yaml"
      - "_bmad-output/sprint-artifacts/sprint-status.yaml"
    sections:
      - Sprint summary
      - All stories in sprint
      - Velocity metrics
      - Artifact index

  comprehensive:
    triggers: ["epic_completion_trigger", "manual_trigger", "architecture_change_trigger"]
    files:
      - "AGENTS.md"
      - "CLAUDE.md" (if architecture changed)
      - "bmm-workflow-status.yaml"
      - "_bmad-output/sprint-artifacts/sprint-status.yaml"
      - "_bmad-output/planning-artifacts/roadmap.md"
    sections:
      - Full project state
      - Architecture updates
      - Completed epics
      - Upcoming work
      - Technical debt inventory
      - Health metrics
```

---

## AGENTS.md Update Procedure

```yaml
agents_md_update:
  file: "AGENTS.md"

  steps:
    1. Read Current AGENTS.md:
       action: "load_file"
       preserve: "all existing content"

    2. Gather New Information:
       from:
         - "_bmad-ext/state/LOOP_STATE.yaml"
         - "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
         - "bmm-workflow-status.yaml"
         - "_bmad-output/.archive/sessions/"

       extract:
         - stories_completed_since_last_update
         - artifacts_created
         - session_summary
         - health_metrics

    3. Create Update Section:
       template: |
         ## Update: {date} - Session {session.id}

         ### Stories Completed ({count})
         {list of stories with IDs and titles}

         ### Artifacts Created
         {categorized list of artifacts}

         ### Health Metrics
         - TypeScript Errors: {count}
         - Test Coverage: {percentage}
         - Known Issues: {count}

         ### Next Up
         - Current Epic: {epic_id}
         - Next Story: {story_id}

    4. Insert Update:
       location: "after 'Recent Updates' section"
       method: "prepend_to_list"
       limit: "keep last 10 updates, archive older"

    5. Update Project Status Section:
       location: "near top of AGENTS.md"
       updates:
         - Current epic
         - Current sprint
         - Stories in progress
         - Health score

    6. Validate:
       - Markdown syntax valid
       - All links resolve
       - No broken references

    7. Commit:
       action: "save_file"
       backup: "create .backup before modifying"
```

---

## CLAUDE.md Update Procedure

```yaml
claude_md_update:
  file: "CLAUDE.md"

  triggers:
    - "Architecture changes that affect patterns"
    - "New import paths required"
    - "Design system updates"
    - "New testing standards"

  steps:
    1. Detect Change Category:
       if: "story_type == 'god_store_split'"
       update_section: "Import Pattern Reference"

       if: "story affects design tokens"
       update_section: "8-bit Design Tokens"

       if: "new testing approach"
       update_section: "Testing Standards"

    2. Create Proposed Update:
       template: |
         <!-- UPDATE {date} -->
         {change_description}

         Before:
         ```typescript
         {old_code}
         ```

         After:
         ```typescript
         {new_code}
         ```

         Rationale: {reason}

    3. Review Mode:
       action: "display_proposed_update"
       prompt: |
         ⚠️ CLAUDE.md update proposed

         This change affects: {section}

         Review the proposed update above.
         Approve to apply, reject to cancel.

    4. Apply on Approval:
       if: "user approves"
       action: "update_section"
       create_backup: true

    5. Log Update:
       file: "_bmad-output/governance/claude-md-updates.log"
       append: "{date}, {section}, {change_summary}"
```

---

## Sprint Status Update Procedure

```yaml
sprint_status_update:
  file: "_bmad-output/sprint-artifacts/sprint-status.yaml"

  steps:
    1. Load Current Sprint Status:
       preserve: "sprint metadata (start_date, team, goals)"

    2. Update Story States:
       for: "each story in sprint"
       check: "story.status in bmm-workflow-status.yaml"
       update: "story.status = new_status"

    3. Calculate Metrics:
       - stories_completed
       - stories_remaining
       - story_points_completed
       - velocity
       - blockers_count

    4. Update Sprint Summary:
       section: "sprint_summary"
       fields:
         - progress_percentage
         - days_remaining
         - on_track: "true/false"

    5. Update Blockers:
       section: "blockers"
       add: "new blockers identified"
       remove: "resolved blockers"

    6. Save:
       action: "save_file"
       create_backup: true
```

---

## Validation Rules

```yaml
validation:
  pre_update:
    - [ ] File exists and is readable
    - [ ] Backup created
    - [ ] Sufficient permissions to write
    - [ ] No merge conflicts (if using version control)

  post_update:
    - [ ] File syntax valid (YAML/Markdown)
    - [ ] No broken internal links
    - [ ] All references resolve
    - [ ] File size reasonable (<500KB for AGENTS.md)

  quality_checks:
    - [ ] Update date is current
    - [ ] Session ID included
    - [ ] Story count accurate
    - [ ] Metrics calculated correctly
    - [ ] No duplicate sections
```

---

## Archive Strategy

```yaml
archiving:
  agents_md:
    location: "_bmad-output/.archive/governance/agents-md/"
    pattern: "AGENTS-md-{YYYY-MM-DD}.md"
    trigger: "when updates section exceeds 10 entries"
    action: "move older updates to archive, keep last 10 in main"

  claude_md:
    location: "_bmad-output/.archive/governance/claude-md/"
    pattern: "CLAUDE-md-{YYYY-MM-DD}.md"
    trigger: "when file exceeds 1000 lines"
    action: "archive old version, reference in main file"

  sprint_status:
    location: "_bmad-output/.archive/sprints/"
    pattern: "sprint-{sprint_id}-{YYYY-MM-DD}.yaml"
    trigger: "sprint completion"
    action: "copy to archive at sprint end"
```

---

## Update Frequency Limits

```yaml
rate_limiting:
  max_updates_per_hour: 10
  max_updates_per_session: 50
  cooldown_between_updates: "30 seconds"

  on_limit_reached:
    action: "queue_update"
    message: "Update rate limit reached, will process on cooldown"
```

---

## Rollback Procedure

```yaml
rollback:
  triggers:
    - "Validation fails after update"
    - "User requests rollback"
    - "File corruption detected"

  steps:
    1. Detect Issue:
       from: "validation OR user_report"

    2. Restore Backup:
       file: "{original_file}.backup"
       action: "restore_from_backup"

    3. Log Rollback:
       file: "_bmad-output/governance/update-log.yaml"
       entry:
         - timestamp: NOW()
           action: "rollback"
           file: "{file}"
           reason: "{why}"
           backup_used: "{backup_path}"

    4. Notify:
       message: |
         ⚠️ Update rolled back for {file}

         Reason: {reason}
         Backup restored from: {backup_path}

         Please review and retry if needed.
```

---

## Update Template

```yaml
update_template:
  agents_md_section: |
     <!-- Update: {date} -->
     ### Session {session.id} - {duration}

     **Stories Completed**: {count}
     {story_list}

     **Artifacts Created**: {artifact_count}
     {artifact_categories}

     **Health**:
     - TypeScript: ✅ {error_count} errors
     - Tests: ✅ {test_pass_rate}% pass rate
     - Coverage: {coverage_percentage}%

     **Issues**: {issue_count} blocker(s)
     {issue_list}

  sprint_status_section: |
     # Sprint {sprint_id} Status
     Updated: {date}

     Progress: {progress_percentage}%
     Stories: {completed}/{total}
     Velocity: {velocity} points/sprint

     Blockers:
     {blockers_list}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-10 | Initial governance auto-update protocol for Phase 3 |
