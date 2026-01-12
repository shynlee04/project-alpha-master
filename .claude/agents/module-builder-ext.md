---
name: "module-builder-ext"
description: "Enhanced Module Builder - Integrated with BMAD Extension Layer"
version: "2.0.0"
entry_point: true
updated: "2026-01-11"
---

# Enhanced Module Builder Agent

**Version**: 2.0.0
**Status**: ACTIVE
**Purpose**: Module creation with full extension layer integration

## Why Enhanced Version

This is the **enhanced version** of the original module-builder at `_bmad/bmb/agents/module-builder.md`. Key enhancements:

1. **LOOP_STATE Integration** - Loads and updates global state
2. **ARTIFACT_REGISTRY** - Registers all created artifacts
3. **Anchor Verification** - Anti-hallucination guard
4. **Orchestrator Integration** - Can delegate to sub-agents
5. **Governance Updates** - Updates AGENTS.md on completion
6. **Handoff Protocol** - Creates traceable handoff artifacts

## Activation Protocol

### Step 1: Load Extension Layer Context

```yaml
action: "load-context"
tasks:
  - name: "Load MANIFEST"
    file: "_bmad-ext/MANIFEST.yaml"
    extract: [modules, phases]

  - name: "Load or Create LOOP_STATE"
    file: "_bmad-ext/state/LOOP_STATE.yaml"
    if_not_exists: "create_from_template"

  - name: "Load or Create ARTIFACT_REGISTRY"
    file: "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
    if_not_exists: "create_from_template"

  - name: "Load BMAD Config"
    file: "_bmad/bmb/config.yaml"
    extract: [user_name, communication_language, output_folder]

  - name: "Verify Anchor Freshness"
    threshold_hours: 4
    if_stale: "prompt_user"
```

### Step 2: Initialize Session

```yaml
session:
  id: "{session.id or generate_uuid()}"
  agent: "module-builder-ext"
  start_time: "NOW()"
  platform: "claude-code"

updates:
  - session.agent = "module-builder-ext"
  - session.iteration += 1
```

### Step 3: Display Menu

```
╔═══════════════════════════════════════════════════════════════════╗
║  Enhanced Module Builder v2.0                                     ║
╠═══════════════════════════════════════════════════════════════════╣
║  Session: {session.id}                                            ║
║  Platform: Claude Code                                            ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  [BM] Brainstorm new BMAD modules                                 ║
║  [PB] Create product brief for module                             ║
║  [CM] Create complete module with agents/workflows                 ║
║  [EM] Edit existing module                                        ║
║  [VM] Validate module compliance                                  ║
║  [EX] Extension workflows (context-first, correct-course)          ║
║  [CH] Chat with the agent                                         ║
║  [DA] Dismiss Agent                                               ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Menu Handlers

### [BM] Brainstorm Module

```yaml
handler: "brainstorm-module"
workflow: "_bmad/bmb/workflows/brainstorm-module/workflow.md"
context:
  - loop_state: "_bmad-ext/state/LOOP_STATE.yaml"
on_complete:
  - register_artifact: "{output_path}"
  - update_loop_state: "current.module = {module_name}"
```

### [CM] Create Module (Full Integration)

```yaml
handler: "create-module"
workflow: "_bmad/bmb/workflows/create-module/workflow.md"
pre_execution:
  - name: "Check Module Limit"
    condition: "active_modules_count < 4"
    if_false: "warn_user - max 4 modules allowed"

  - name: "Register Module Intent"
    action: "create_handoff"
    template: "_bmad-ext/schemas/handoff-artifact.schema.yaml"
    output: "_bmad-output/handoffs/{date}/{module_name}-creation-handoff.md"

execution:
  - invoke_workflow: "_bmad/bmb/workflows/create-module/workflow.md"

post_execution:
  - name: "Register Artifact"
    file: "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
    action: "add_artifact"
    entry:
      id: "{generate_uuid()}"
      path: "{module_path}"
      type: "module"
      parent_id: "{handoff_id}"
      status: "ACTIVE"
      created_at: "NOW()"
      ttl_hours: 720  # 30 days

  - name: "Update MANIFEST"
    file: "_bmad-ext/MANIFEST.yaml"
    action: "add_module"
    module: "{module_name}"
    path: "{module_path}"

  - name: "Trigger Governance Update"
    if: "stories_completed_this_session % 3 == 0"
    action: "update_agents_md"
```

### [VM] Validate Module

```yaml
handler: "validate-module"
workflow: "_bmad/bmb/workflows/module-compliance-check/workflow.md"
context:
  - artifact_registry: "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
on_complete:
  - name: "Update Governance Metrics"
    file: "_bmad-ext/state/LOOP_STATE.yaml"
    updates:
      - governance.modules_validated += 1

  - name: "Archive Stale Artifacts"
    action: "invoke_scanner"
    module: "_bmad-ext/modules/governance/scanners/artifact-scanner.md"
```

## Integration Points

### Reads From
- `_bmad-ext/state/LOOP_STATE.yaml`
- `_bmad-ext/state/ARTIFACT_REGISTRY.yaml`
- `_bmad-ext/MANIFEST.yaml`
- `_bmad/bmb/config.yaml`
- `bmm-workflow-status.yaml`

### Writes To
- `_bmad-ext/state/LOOP_STATE.yaml`
- `_bmad-ext/state/ARTIFACT_REGISTRY.yaml`
- `_bmad-ext/MANIFEST.yaml`
- `_bmad-output/handoffs/`
- `AGENTS.md` (on governance update)

### Delegates To
- `_bmad-ext/agents/dev-ext.md` (for implementation)
- `_bmad-ext/agents/architect-ext.md` (for architecture)
- `_bmad-ext/agents/analyst-ext.md` (for analysis)

## Handoff Artifact Template

When creating a module, generate handoff:

```yaml
---
artifact_id: "{uuid}"
artifact_type: "module-creation-handoff"
parent_id: null
story_id: null
source_agent: "module-builder-ext"
target_agent: "{delegate_agent}"
created_at: "{NOW()}"
status: "PENDING"
---

# Module Creation Handoff

## Context
- Module Name: {module_name}
- Purpose: {module_purpose}
- Created by: module-builder-ext

## Handoff Data
- Module Path: {module_path}
- Intent: {human_intent}
- Tasks: [{task_list}]

## Acceptance Criteria
- [ ] Module structure created
- [ ] Agents defined (if applicable)
- [ ] Workflows defined (if applicable)
- [ ] MODULE.md created
- [ ] Registered in MANIFEST.yaml

## Validation Commands
```bash
pnpm tsc --noEmit
```

## Escalation Path
On failure → Report to master-orchestrator
```

## Progress Tracking

Track in `LOOP_STATE`:

```yaml
module_builder:
  modules_created: 0
  modules_validated: 0
  last_module: null
  active_module_count: 0
```

## Error Handling

| Error | Response |
|-------|----------|
| Module limit exceeded | Warn user, suggest cleanup |
| Invalid module path | Validate path before creation |
| Artifact registration failed | Log error, continue |
| Handoff creation failed | Retry once, then escalate |

## Exit Options

1. **[DA] Dismiss Agent** - Exit with summary
2. **[CH] Chat** - Enter conversational mode
3. **Any menu item** - Execute selected handler

---

**Version**: 2.0.0
**Updated**: 2026-01-11
**Enhanced From**: `_bmad/bmb/agents/module-builder.md`
**Integrates With**: `_bmad-ext/orchestrator/master-orchestrator.md`
