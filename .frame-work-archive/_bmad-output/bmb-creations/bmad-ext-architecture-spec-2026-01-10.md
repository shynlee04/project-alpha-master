# BMAD Extension Layer Architecture Specification

**Version**: 1.0.0  
**Date**: 2026-01-10  
**Status**: DRAFT - AWAITING HUMAN APPROVAL  
**Codename**: `_bmad-ext`

---

## Executive Summary

This specification defines an **extension layer** that wraps BMAD core without modifying it. The extension layer provides:

1. **Enhanced Agents** - Wrap BMM agents with orchestration hooks
2. **Extension Workflows** - Full lifecycle with handoff protocol
3. **Dynamic Orchestrator** - Runtime delegation to sub-agents
4. **Unified Loop State** - Anti-hallucination with human intent anchoring
5. **Artifact Linking** - Parent/child relationships with central registry

**Key Principle**: BMAD core (`_bmad/`) remains untouched and can be updated. All customizations live in `_bmad-ext/`.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ENTRY POINT                                     │
│                   .augment/commands/bmad-ext/                           │
│                   .cursor/commands/bmad-ext/                            │
│                   (Platform-specific command loaders)                   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    _bmad-ext/orchestrator/                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  master-orchestrator.md                                          │   │
│  │  - SINGLE ENTRY POINT for all autonomous work                   │   │
│  │  - Reads bmm-workflow-status.yaml                               │   │
│  │  - Determines story type → agent mapping                        │   │
│  │  - Spawns enhanced agent as SUB-AGENT                           │   │
│  │  - Receives completion callback                                  │   │
│  │  - Updates governance docs automatically                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                │                                        │
│                                │ DELEGATION                             │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  delegation-protocol.md                                          │   │
│  │  - Pre-delegation: Verify anchor, load parent context           │   │
│  │  - Delegation: Spawn sub-agent with handoff artifact            │   │
│  │  - Post-delegation: Receive callback, update state              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    _bmad-ext/agents/                                    │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │ dev-ext.md    │  │ architect-ext │  │ analyst-ext   │  ...          │
│  │               │  │               │  │               │               │
│  │ WRAPS:        │  │ WRAPS:        │  │ WRAPS:        │               │
│  │ bmm/dev.md    │  │ bmm/architect │  │ bmm/analyst   │               │
│  │               │  │               │  │               │               │
│  │ ADDS:         │  │ ADDS:         │  │ ADDS:         │               │
│  │ - Pre-hooks   │  │ - Pre-hooks   │  │ - Pre-hooks   │               │
│  │ - Post-hooks  │  │ - Post-hooks  │  │ - Post-hooks  │               │
│  │ - Escalation  │  │ - Escalation  │  │ - Escalation  │               │
│  │ - Loop aware  │  │ - Loop aware  │  │ - Loop aware  │               │
│  └───────────────┘  └───────────────┘  └───────────────┘               │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    _bmad-ext/workflows/                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  story-cycle/workflow.md                                         │   │
│  │  - Step 1: Verify anchor (human intent timestamp)               │   │
│  │  - Step 2: Load parent handoff if exists                        │   │
│  │  - Step 3: Execute core workflow via delegation                 │   │
│  │  - Step 4: Create child handoff artifact                        │   │
│  │  - Step 5: Update loop state                                    │   │
│  │  - Step 6: Report completion to orchestrator                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  remediation-cycle/workflow.md                                   │   │
│  │  (Same pattern for architecture remediation)                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    _bmad-ext/state/                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  LOOP_STATE.yaml (Unified - replaces 3-level hierarchy)         │   │
│  │  - session: id, status, started_at                              │   │
│  │  - anchor: human_intent_timestamp, staleness_threshold          │   │
│  │  - current: story, module, workflow, agent, step                │   │
│  │  - delegations: active[], completed[], failed[]                 │   │
│  │  - continuation: next_action, blockers                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ARTIFACT_REGISTRY.yaml                                          │   │
│  │  - All artifacts with parent_id, children_ids[]                 │   │
│  │  - Status: ACTIVE, STALE, ARCHIVED                              │   │
│  │  - Created_at, updated_at timestamps                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
_bmad-ext/
├── MANIFEST.yaml                    # Extension registry & version
├── README.md                        # Quick start guide
│
├── orchestrator/
│   ├── master-orchestrator.md       # SINGLE entry point
│   ├── delegation-protocol.md       # How to delegate to sub-agents
│   ├── routing-rules.yaml           # Dynamic story→agent mapping
│   ├── escalation-protocol.md       # What to do on failure
│   └── governance-auto-update.md    # When/how to update AGENTS.md
│
├── agents/
│   ├── _template-enhanced-agent.md  # Template for creating enhanced agents
│   ├── dev-ext.md                   # Enhanced developer agent
│   ├── architect-ext.md             # Enhanced architect agent
│   ├── analyst-ext.md               # Enhanced analyst agent
│   ├── pm-ext.md                    # Enhanced PM agent
│   ├── sm-ext.md                    # Enhanced SM agent
│   ├── tea-ext.md                   # Enhanced TEA agent
│   ├── tech-writer-ext.md           # Enhanced tech writer agent
│   ├── ux-designer-ext.md           # Enhanced UX designer agent
│   └── quality-scanner-ext.md       # Enhanced quality scanner
│
├── workflows/
│   ├── story-cycle/
│   │   ├── workflow.md              # Full story development cycle
│   │   └── steps/
│   │       ├── step-01-anchor.md    # Verify human intent
│   │       ├── step-02-context.md   # Load parent handoff
│   │       ├── step-03-delegate.md  # Execute core workflow
│   │       ├── step-04-handoff.md   # Create child handoff
│   │       ├── step-05-state.md     # Update loop state
│   │       └── step-06-report.md    # Report to orchestrator
│   │
│   ├── remediation-cycle/
│   │   ├── workflow.md              # Architecture remediation cycle
│   │   └── steps/
│   │       └── ...
│   │
│   └── governance-cycle/
│       ├── workflow.md              # Governance update cycle
│       └── steps/
│           └── ...
│
├── state/
│   ├── LOOP_STATE.yaml              # Unified loop state
│   ├── ARTIFACT_REGISTRY.yaml       # Central artifact registry
│   └── DELEGATION_LOG.yaml          # Active/completed delegations
│
├── schemas/
│   ├── handoff-artifact.schema.yaml # Required fields for handoffs
│   ├── loop-state.schema.yaml       # LOOP_STATE validation
│   └── delegation.schema.yaml       # Delegation contract schema
│
└── hooks/
    ├── pre-execution.md             # Run before any workflow
    ├── post-execution.md            # Run after any workflow
    ├── on-error.md                  # Error handling protocol
    └── on-stale.md                  # Stale artifact handling
```

---

## Phase 0: Foundation (Execute First)

### 0.1 Create Directory Structure

```bash
mkdir -p _bmad-ext/{orchestrator,agents,workflows/story-cycle/steps,workflows/remediation-cycle/steps,workflows/governance-cycle/steps,state,schemas,hooks}
```

### 0.2 Create MANIFEST.yaml

```yaml
# _bmad-ext/MANIFEST.yaml
# Extension Layer Registry - DO NOT DELETE

schema_version: "1.0.0"
created: "2026-01-10"
updated: "2026-01-10"
status: "ACTIVE"

description: |
  Extension layer that wraps BMAD core without modifying it.
  BMAD core (_bmad/) can be updated independently.
  All customizations live here and are preserved.

compatibility:
  bmad_core_version: ">=6.0.0"
  tested_with: "6.0.0"

entry_points:
  primary: "orchestrator/master-orchestrator.md"
  fallback: "agents/dev-ext.md"

modules:
  orchestrator:
    path: "orchestrator/"
    status: "ACTIVE"
    
  agents:
    path: "agents/"
    count: 9
    status: "ACTIVE"
    
  workflows:
    path: "workflows/"
    count: 3
    status: "ACTIVE"
    
  state:
    path: "state/"
    status: "ACTIVE"

integration_points:
  bmm_workflow_status: "../bmm-workflow-status.yaml"
  agents_md: "../AGENTS.md"
  sprint_status: "../_bmad-output/sprint-artifacts/sprint-status.yaml"

governance:
  update_agents_md_every: 3  # stories
  stale_threshold_hours: 4
  max_delegation_depth: 3
```

### 0.3 Archive Old LOOP_STATE Files

```bash
# Create archive directory
mkdir -p _bmad-output/.archive/2026-01-10/loop-state-migration/

# Move old files
mv _bmad/modules/asgl/LOOP_STATE-grandparent.yaml _bmad-output/.archive/2026-01-10/loop-state-migration/
mv _bmad/modules/asgl/LOOP_STATE-parent.yaml _bmad-output/.archive/2026-01-10/loop-state-migration/
mv _bmad/modules/asgl/LOOP_STATE-child.yaml _bmad-output/.archive/2026-01-10/loop-state-migration/

# Archive redundant module
mv _bmad/modules/architecture-refactoring/ _bmad-output/.archive/2026-01-10/loop-state-migration/
```

---

## Phase 1: Unified State Layer

### 1.1 LOOP_STATE.yaml

```yaml
# _bmad-ext/state/LOOP_STATE.yaml
# Unified Loop State with Anti-Hallucination Anchoring

schema_version: "2.0.0"
created: "2026-01-10"
last_updated: null  # Set on first use

# ═══════════════════════════════════════════════════════════════════════════
# SESSION TRACKING
# ═══════════════════════════════════════════════════════════════════════════

session:
  id: null                    # UUID assigned on start
  status: "NOT_STARTED"       # NOT_STARTED | RUNNING | PAUSED | COMPLETED | FAILED
  started_at: null
  paused_at: null
  completed_at: null
  iteration: 0
  max_iterations: 100

# ═══════════════════════════════════════════════════════════════════════════
# ANTI-HALLUCINATION ANCHOR (CRITICAL)
# ═══════════════════════════════════════════════════════════════════════════

anchor:
  # When human last provided explicit direction
  human_intent_timestamp: null
  
  # What human asked for (max 200 chars) - the GROUND TRUTH
  human_intent_summary: null
  
  # Conversation ID where intent was captured
  conversation_id: null
  
  # Staleness threshold - if older than this, REQUIRE re-confirmation
  staleness_threshold_hours: 4
  
  # If true, auto-invalidate stale state (move to archive)
  auto_invalidate: true
  
  # VALIDATION RULE: Before resuming ANY loop:
  # 1. Check if (now - human_intent_timestamp) > staleness_threshold_hours
  # 2. If stale, HALT and ask: "Your last direction was X hours ago. Confirm to continue?"
  # 3. If confirmed, update human_intent_timestamp to NOW
  # 4. If not confirmed, reset loop state

# ═══════════════════════════════════════════════════════════════════════════
# CURRENT WORK
# ═══════════════════════════════════════════════════════════════════════════

current:
  story_id: null              # e.g., "FS-05"
  story_title: null
  epic_id: null               # e.g., "EPIC-FS"
  module: null                # MOD-A | MOD-B | MOD-C | MOD-D (from registry)
  workflow: null              # e.g., "story-cycle"
  agent: null                 # e.g., "dev-ext"
  step: null                  # Current step in workflow (1-6)
  step_started_at: null
  
# ═══════════════════════════════════════════════════════════════════════════
# DELEGATION TRACKING
# ═══════════════════════════════════════════════════════════════════════════

delegations:
  # Currently active delegation (max 1)
  active:
    delegation_id: null
    parent_agent: null        # Who delegated
    child_agent: null         # Who is executing
    handoff_artifact: null    # Path to handoff artifact
    started_at: null
    timeout_minutes: 30
    
  # Completed delegations (keep last 10)
  completed: []
  
  # Failed delegations (keep last 5)
  failed: []

# ═══════════════════════════════════════════════════════════════════════════
# PROGRESS
# ═══════════════════════════════════════════════════════════════════════════

progress:
  stories_completed_this_session: 0
  stories_remaining: 0
  artifacts_created: []
  governance_updates_pending: false
  last_governance_update: null

# ═══════════════════════════════════════════════════════════════════════════
# CONTINUATION (For Resume)
# ═══════════════════════════════════════════════════════════════════════════

continuation:
  next_action: null           # What to do next
  blockers: []                # List of blocking issues
  pending_handoffs: []        # Handoffs awaiting processing
  
# ═══════════════════════════════════════════════════════════════════════════
# ERROR STATE
# ═══════════════════════════════════════════════════════════════════════════

errors:
  count: 0
  last_error: null
  last_error_at: null
  recovery_attempts: 0
  max_recovery_attempts: 3
```

### 1.2 ARTIFACT_REGISTRY.yaml

```yaml
# _bmad-ext/state/ARTIFACT_REGISTRY.yaml
# Central Artifact Registry with Parent/Child Linking

schema_version: "1.0.0"
created: "2026-01-10"
last_updated: null

# ═══════════════════════════════════════════════════════════════════════════
# REGISTRY ENTRIES
# ═══════════════════════════════════════════════════════════════════════════

artifacts: []
# Each entry has:
# - id: UUID
# - path: relative path from project root
# - type: handoff | story | sprint | diagnostic | governance
# - parent_id: UUID of parent artifact (null if root)
# - children_ids: [UUID, UUID, ...]
# - status: ACTIVE | STALE | ARCHIVED
# - created_at: ISO timestamp
# - updated_at: ISO timestamp
# - created_by: agent ID
# - story_id: associated story (if applicable)
# - ttl_hours: time-to-live (null = permanent)

# ═══════════════════════════════════════════════════════════════════════════
# INDEXES (For Fast Lookup)
# ═══════════════════════════════════════════════════════════════════════════

indexes:
  by_story: {}    # story_id → [artifact_ids]
  by_parent: {}   # parent_id → [child_ids]
  by_status: 
    ACTIVE: []
    STALE: []
    ARCHIVED: []

# ═══════════════════════════════════════════════════════════════════════════
# VALIDATION RULES
# ═══════════════════════════════════════════════════════════════════════════

validation:
  # Run daily
  orphan_detection:
    enabled: true
    archive_after_hours: 48
    
  # Run before workflow
  stale_detection:
    enabled: true
    thresholds:
      handoff: 4        # hours
      diagnostic: 1     # hours
      story: 168        # hours (7 days)
      governance: null  # never stale
```

### 1.3 Handoff Artifact Schema

```yaml
# _bmad-ext/schemas/handoff-artifact.schema.yaml
# Required fields for all handoff artifacts

schema_version: "1.0.0"

required_frontmatter:
  - artifact_id         # UUID
  - artifact_type       # "handoff"
  - parent_id           # UUID of parent (null if root)
  - story_id            # Associated story
  - source_agent        # Who created this
  - target_agent        # Who should consume this
  - created_at          # ISO timestamp
  - status              # PENDING | CONSUMED | EXPIRED

required_sections:
  - context_summary     # What was done (max 500 chars)
  - handoff_data        # Structured data for target agent
  - acceptance_criteria # What target agent must achieve
  - validation_commands # How to verify completion
  - escalation_path     # What to do on failure

example: |
  ---
  artifact_id: "abc123-def456"
  artifact_type: "handoff"
  parent_id: null
  story_id: "FS-05"
  source_agent: "master-orchestrator"
  target_agent: "dev-ext"
  created_at: "2026-01-10T10:00:00+07:00"
  status: "PENDING"
  ---
  
  ## Context Summary
  Implementing FileLockService for EPIC-FS story FS-05.
  
  ## Handoff Data
  - story_file: "_bmad-output/sprint-artifacts/stories/FS-05.md"
  - acceptance_criteria: 5 items
  - estimated_hours: 4
  
  ## Acceptance Criteria
  1. FileLockService interface defined
  2. Unit tests passing
  3. Integration with existing FileService
  
  ## Validation Commands
  ```bash
  pnpm tsc --noEmit
  pnpm vitest run src/domain/services/FileLockService.test.ts
  ```
  
  ## Escalation Path
  On failure → Report to master-orchestrator with error details
```

---

## Phase 2: Enhanced Agents

### 2.1 Enhanced Agent Template

```markdown
# _bmad-ext/agents/_template-enhanced-agent.md

---
name: "{agent-name}-ext"
description: "Enhanced {Agent Name} with orchestration hooks"
wraps: "_bmad/bmm/agents/{agent-name}.md"
version: "1.0.0"
---

# Enhanced {Agent Name}

> Wraps the core BMM {agent-name} agent with orchestration capabilities.

## Activation Protocol

### Pre-Execution Hooks (MANDATORY)

Before executing any work:

1. **Load Loop State**
   ```yaml
   file: "_bmad-ext/state/LOOP_STATE.yaml"
   check:
     - session.status == "RUNNING"
     - anchor.human_intent_timestamp not stale
     - delegations.active matches this agent
   on_failure: HALT and report to orchestrator
   ```

2. **Load Parent Handoff**
   ```yaml
   check: delegations.active.handoff_artifact exists
   action: Load and parse handoff artifact
   extract:
     - context_summary
     - acceptance_criteria
     - validation_commands
   ```

3. **Verify Anchor**
   ```yaml
   check: (now - anchor.human_intent_timestamp) < staleness_threshold_hours
   on_stale: 
     - HALT execution
     - Ask: "Last human direction was {X} hours ago. Continue?"
     - If NO: Reset loop state
     - If YES: Update anchor.human_intent_timestamp = now
   ```

### Core Execution

After pre-hooks pass:

1. **Load Core Agent**
   ```yaml
   file: "_bmad/bmm/agents/{agent-name}.md"
   inherit:
     - persona
     - communication_style
     - principles
   override:
     - menu (use enhanced menu below)
   ```

2. **Execute Workflow**
   - Follow story file tasks in order
   - Run validation after each task
   - Update LOOP_STATE.current.step on each step
   - Log progress to DELEGATION_LOG.yaml

### Post-Execution Hooks (MANDATORY)

After completing work:

1. **Create Child Handoff**
   ```yaml
   template: "_bmad-ext/schemas/handoff-artifact.schema.yaml"
   output: "_bmad-output/handoffs/{date}/{story_id}-{agent}-handoff.md"
   register_in: "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
   ```

2. **Update Loop State**
   ```yaml
   updates:
     - current.step = "COMPLETED"
     - delegations.active → move to delegations.completed
     - progress.stories_completed_this_session += 1 (if story complete)
   ```

3. **Report to Orchestrator**
   ```yaml
   callback:
     status: "SUCCESS" | "PARTIAL" | "FAILED"
     artifacts_created: [list]
     validation_results:
       typescript_errors: 0
       tests_passed: true
     next_recommendation: "..."
   ```

### Escalation Protocol

On error or failure:

1. Log error to LOOP_STATE.errors
2. Increment errors.count
3. If errors.recovery_attempts < max_recovery_attempts:
   - Attempt recovery
   - Increment recovery_attempts
4. Else:
   - Set session.status = "FAILED"
   - Create failure handoff artifact
   - Report to orchestrator with escalation flag

## Enhanced Menu

When loaded, show:

```
[MH] Menu Help
[CH] Chat
[EX] Execute Delegated Work (from handoff artifact)
[ST] Show Current Story Status
[LO] Show Loop State
[ES] Escalate to Orchestrator
[DA] Dismiss Agent
```

## Compatibility

- Inherits all capabilities from core BMM agent
- Adds orchestration hooks without breaking core functionality
- Can be invoked directly OR via orchestrator delegation
```

### 2.2 dev-ext.md (Example Implementation)

```markdown
# _bmad-ext/agents/dev-ext.md

---
name: "dev-ext"
description: "Enhanced Developer Agent with orchestration hooks"
wraps: "_bmad/bmm/agents/dev.md"
version: "1.0.0"
---

# Enhanced Developer Agent

> Wraps the core BMM dev agent with orchestration capabilities.

## Activation Protocol

### Step 1: Pre-Execution Hooks

```yaml
action: "pre-execution"
tasks:
  - name: "Load Loop State"
    file: "_bmad-ext/state/LOOP_STATE.yaml"
    validate:
      - session.status == "RUNNING"
      - current.agent == "dev-ext" OR delegations.active.child_agent == "dev-ext"
    on_failure: 
      action: "halt"
      message: "Dev-ext invoked but not delegated. Check LOOP_STATE."
      
  - name: "Verify Anchor"
    check: |
      const ageHours = (Date.now() - Date.parse(anchor.human_intent_timestamp)) / 3600000;
      return ageHours < anchor.staleness_threshold_hours;
    on_stale:
      action: "prompt"
      message: "Last human direction was {ageHours} hours ago. Continue? [Y/N]"
      
  - name: "Load Handoff"
    file: "{delegations.active.handoff_artifact}"
    extract:
      - context_summary → session_context
      - acceptance_criteria → ac_list
      - validation_commands → validation_cmds
```

### Step 2: Load Core Agent

```yaml
action: "load-core"
file: "_bmad/bmm/agents/dev.md"
inherit:
  - persona.role: "Senior Software Engineer"
  - persona.identity
  - persona.communication_style
  - persona.principles
merge_rules:
  - activation.steps → prepend pre-execution hooks
  - menu → replace with enhanced menu
```

### Step 3: Execute Story

```yaml
action: "execute-story"
source: "handoff_data.story_file"
protocol:
  - Read entire story file before implementation
  - Execute tasks/subtasks IN ORDER
  - For each task: red-green-refactor cycle
  - Mark task [x] only when tests pass
  - Run full test suite after each task
  - Update LOOP_STATE.current.step after each task
  - NEVER proceed with failing tests
```

### Step 4: Post-Execution Hooks

```yaml
action: "post-execution"
tasks:
  - name: "Run Validation"
    commands:
      - "pnpm tsc --noEmit"
      - "pnpm vitest run"
    capture_results: true
    
  - name: "Create Handoff"
    template: "_bmad-ext/schemas/handoff-artifact.schema.yaml"
    output: "_bmad-output/handoffs/{date}/{story_id}-dev-handoff.md"
    contents:
      context_summary: "Completed {task_count} tasks for {story_id}"
      validation_results: "{captured_results}"
      next_recommendation: "Ready for code review"
      
  - name: "Update Registry"
    file: "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
    action: "add_artifact"
    
  - name: "Update Loop State"
    file: "_bmad-ext/state/LOOP_STATE.yaml"
    updates:
      - delegations.active → delegations.completed
      - current.step = "COMPLETED"
      
  - name: "Report Completion"
    to: "master-orchestrator"
    payload:
      status: "SUCCESS"
      story_id: "{story_id}"
      artifacts: ["{handoff_path}"]
      next: "code-review"
```

## Enhanced Menu

```
╔══════════════════════════════════════════════════════════════╗
║  DEV-EXT: Enhanced Developer Agent                           ║
╠══════════════════════════════════════════════════════════════╣
║  [MH] Menu Help                                              ║
║  [CH] Chat with Agent                                        ║
║  ────────────────────────────────────────────────────────────║
║  [EX] Execute Delegated Work (from handoff)                  ║
║  [DS] Dev Story (direct - bypass orchestrator)               ║
║  [CR] Code Review (direct)                                   ║
║  ────────────────────────────────────────────────────────────║
║  [ST] Show Current Story Status                              ║
║  [LO] Show Loop State                                        ║
║  [HA] Show Active Handoff                                    ║
║  ────────────────────────────────────────────────────────────║
║  [ES] Escalate to Orchestrator                               ║
║  [DA] Dismiss Agent                                          ║
╚══════════════════════════════════════════════════════════════╝
```

## Direct Invocation vs Orchestrated

| Mode | Entry | Handoff Required | Loop State Updated |
|------|-------|------------------|-------------------|
| **Orchestrated** | Via master-orchestrator | YES | YES |
| **Direct** | Via [DS] Dev Story | NO | Optional |

When invoked directly (not via orchestrator):
- Skip handoff loading
- Execute normally
- Optionally update loop state
- No callback to orchestrator
```

---

## Phase 3: Master Orchestrator

### 3.1 master-orchestrator.md

```markdown
# _bmad-ext/orchestrator/master-orchestrator.md

---
name: "master-orchestrator"
description: "Central orchestrator for all autonomous development"
version: "1.0.0"
entry_point: true
---

# Master Orchestrator

> **SINGLE ENTRY POINT** for all autonomous BMAD development.
> Delegates to enhanced agents, receives callbacks, updates governance.

## Activation Protocol

### Step 1: Initialize Session

```yaml
action: "initialize"
tasks:
  - name: "Load Configuration"
    files:
      - "_bmad/core/config.yaml"
      - "_bmad-ext/MANIFEST.yaml"
      
  - name: "Load or Create Loop State"
    file: "_bmad-ext/state/LOOP_STATE.yaml"
    if_not_exists: "create_from_template"
    
  - name: "Assign Session ID"
    action: "generate_uuid"
    store_in: "session.id"
    
  - name: "Set Session Status"
    update: "session.status = 'RUNNING'"
    update: "session.started_at = NOW()"
```

### Step 2: Verify Human Intent Anchor

```yaml
action: "verify-anchor"
critical: true
tasks:
  - name: "Check Anchor Freshness"
    condition: |
      anchor.human_intent_timestamp != null AND
      (NOW() - anchor.human_intent_timestamp) > staleness_threshold_hours
    on_true:
      action: "prompt"
      message: |
        ⚠️ STALE LOOP STATE DETECTED
        
        Your last direction was {hours_ago} hours ago:
        "{anchor.human_intent_summary}"
        
        Options:
        [C] Continue with this direction
        [N] Provide new direction
        [R] Reset loop state
      wait_for_input: true
      
  - name: "Update Anchor"
    condition: "user_chose_continue OR new_direction_provided"
    action: |
      anchor.human_intent_timestamp = NOW()
      anchor.human_intent_summary = "{user_input OR previous_summary}"
      anchor.conversation_id = "{current_conversation_id}"
```

### Step 3: Load Current Story

```yaml
action: "load-story"
source: "bmm-workflow-status.yaml"
extract:
  - current_workflow.story → story_id
  - current_workflow.epic → epic_id
  
then:
  file: "_bmad-output/sprint-artifacts/stories/{story_id}.md"
  extract:
    - title → story_title
    - type → story_type
    - acceptance_criteria → ac_list
    - estimated_hours
```

### Step 4: Route to Agent

```yaml
action: "route"
source: "_bmad-ext/orchestrator/routing-rules.yaml"
decision_tree:
  - if: "story_type == 'feature_development'"
    agent: "dev-ext"
    workflow: "story-cycle"
    
  - if: "story_type == 'architecture_scan'"
    agent: "quality-scanner-ext"
    workflow: "diagnostic-cycle"
    
  - if: "story_type == 'god_store_split'"
    agent: "store-refactorer-ext"
    workflow: "remediation-cycle"
    
  - if: "story_type == 'code_review'"
    agent: "dev-ext"
    workflow: "review-cycle"
    
  - else:
    agent: "dev-ext"
    workflow: "story-cycle"
```

### Step 5: Create Handoff Artifact

```yaml
action: "create-handoff"
template: "_bmad-ext/schemas/handoff-artifact.schema.yaml"
output: "_bmad-output/handoffs/{date}/{story_id}-orchestrator-handoff.md"
contents:
  artifact_id: "{generate_uuid}"
  parent_id: null
  story_id: "{story_id}"
  source_agent: "master-orchestrator"
  target_agent: "{selected_agent}"
  context_summary: "Delegating {story_id}: {story_title}"
  handoff_data:
    story_file: "_bmad-output/sprint-artifacts/stories/{story_id}.md"
    acceptance_criteria: "{ac_list}"
    estimated_hours: "{estimated_hours}"
  validation_commands:
    - "pnpm tsc --noEmit"
    - "pnpm vitest run"
  escalation_path: "Report back to master-orchestrator"
  
register:
  file: "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
  as: "handoff"
```

### Step 6: Delegate to Agent

```yaml
action: "delegate"
protocol: "_bmad-ext/orchestrator/delegation-protocol.md"
tasks:
  - name: "Update Loop State"
    updates:
      current.story_id: "{story_id}"
      current.agent: "{selected_agent}"
      current.workflow: "{selected_workflow}"
      current.step: 1
      delegations.active:
        delegation_id: "{generate_uuid}"
        parent_agent: "master-orchestrator"
        child_agent: "{selected_agent}"
        handoff_artifact: "{handoff_path}"
        started_at: "NOW()"
        timeout_minutes: 60
        
  - name: "Invoke Sub-Agent"
    method: "spawn"
    agent: "_bmad-ext/agents/{selected_agent}.md"
    context:
      - handoff_artifact: "{handoff_path}"
      - loop_state: "_bmad-ext/state/LOOP_STATE.yaml"
    await_callback: true
```

### Step 7: Receive Callback

```yaml
action: "receive-callback"
from: "{selected_agent}"
expected_payload:
  status: "SUCCESS | PARTIAL | FAILED"
  story_id: "{story_id}"
  artifacts_created: []
  validation_results:
    typescript_errors: 0
    tests_passed: true
  next_recommendation: "..."
  
on_success:
  - Update story status to DONE in sprint-status.yaml
  - Move delegation to completed
  - Check if governance update needed
  
on_partial:
  - Log partial completion
  - Create continuation handoff
  - Decide: retry OR escalate
  
on_failed:
  - Log failure
  - Move delegation to failed
  - Execute escalation protocol
```

### Step 8: Governance Update Check

```yaml
action: "governance-check"
conditions:
  - if: "progress.stories_completed_this_session % 3 == 0"
    action: "update_agents_md"
    
  - if: "epic_completed"
    action: "update_agents_md AND create_retrospective"
    
  - if: "critical_architecture_change"
    action: "update_agents_md AND update_claude_md"
```

### Step 9: Continuation Decision

```yaml
action: "continue-or-stop"
conditions:
  continue_if:
    - "more_stories_remaining"
    - "no_critical_errors"
    - "session.iteration < session.max_iterations"
    - "anchor not stale"
    
  stop_if:
    - "all_stories_complete"
    - "critical_error"
    - "max_iterations_reached"
    - "user_interrupt"
    
on_continue:
  - Increment session.iteration
  - Go to Step 3 (Load Current Story)
  
on_stop:
  - Set session.status = "COMPLETED" or "PAUSED"
  - Generate completion report
  - Archive session artifacts
```

## Menu (Interactive Mode)

```
╔══════════════════════════════════════════════════════════════╗
║  MASTER ORCHESTRATOR v1.0                                    ║
╠══════════════════════════════════════════════════════════════╣
║  Session: {session.id}                                       ║
║  Status: {session.status}                                    ║
║  Stories Completed: {progress.stories_completed_this_session}║
╠══════════════════════════════════════════════════════════════╣
║  [RS] Resume Sprint - Continue autonomous execution          ║
║  [NS] Next Story - Execute next story only                   ║
║  [SS] Show Status - Display current state                    ║
║  ────────────────────────────────────────────────────────────║
║  [LA] List Agents - Show available enhanced agents           ║
║  [LW] List Workflows - Show available workflows              ║
║  [IA] Invoke Agent - Directly invoke an agent                ║
║  ────────────────────────────────────────────────────────────║
║  [GU] Governance Update - Force AGENTS.md update             ║
║  [AR] Archive Stale - Archive stale artifacts                ║
║  ────────────────────────────────────────────────────────────║
║  [CH] Chat                                                   ║
║  [DA] Dismiss                                                ║
╚══════════════════════════════════════════════════════════════╝
```
```

---

## Phase 4: Platform Command Wrappers

### 4.1 Augment Command Wrapper

```markdown
# .augment/commands/bmad-ext/orchestrator.md

---
name: 'bmad-ext-orchestrator'
description: 'BMAD Extension Layer - Master Orchestrator'
---

You must fully embody this agent's persona and follow all activation instructions exactly as specified.

<agent-activation CRITICAL="TRUE">
1. LOAD the FULL orchestrator file from @_bmad-ext/orchestrator/master-orchestrator.md
2. READ its entire contents - this contains the complete orchestration protocol
3. Execute ALL activation steps exactly as written
4. Stay in character throughout the session
</agent-activation>
```

### 4.2 Cursor Command Wrapper

```markdown
# .cursor/commands/bmad-ext/orchestrator.md

---
name: 'bmad-ext-orchestrator'
description: 'BMAD Extension Layer - Master Orchestrator'
---

You must fully embody this agent's persona and follow all activation instructions exactly as specified.

<agent-activation CRITICAL="TRUE">
1. LOAD the FULL orchestrator file from @_bmad-ext/orchestrator/master-orchestrator.md
2. READ its entire contents - this contains the complete orchestration protocol
3. Execute ALL activation steps exactly as written
4. Stay in character throughout the session
</agent-activation>
```

---

## Implementation Checklist

### Phase 0: Foundation
- [ ] Create `_bmad-ext/` directory structure
- [ ] Create `_bmad-ext/MANIFEST.yaml`
- [ ] Archive old LOOP_STATE files (grandparent, parent, child)
- [ ] Archive `architecture-refactoring` module
- [ ] HUMAN APPROVAL CHECKPOINT

### Phase 1: State Layer
- [ ] Create `_bmad-ext/state/LOOP_STATE.yaml`
- [ ] Create `_bmad-ext/state/ARTIFACT_REGISTRY.yaml`
- [ ] Create `_bmad-ext/schemas/handoff-artifact.schema.yaml`
- [ ] Validate YAML syntax
- [ ] HUMAN APPROVAL CHECKPOINT

### Phase 2: Enhanced Agents
- [ ] Create `_bmad-ext/agents/_template-enhanced-agent.md`
- [ ] Create `_bmad-ext/agents/dev-ext.md`
- [ ] Create remaining 8 enhanced agents
- [ ] Validate all agents can load core agents
- [ ] HUMAN APPROVAL CHECKPOINT

### Phase 3: Orchestrator
- [ ] Create `_bmad-ext/orchestrator/master-orchestrator.md`
- [ ] Create `_bmad-ext/orchestrator/delegation-protocol.md`
- [ ] Create `_bmad-ext/orchestrator/routing-rules.yaml`
- [ ] Test delegation flow
- [ ] HUMAN APPROVAL CHECKPOINT

### Phase 4: Platform Wrappers
- [ ] Create `.augment/commands/bmad-ext/orchestrator.md`
- [ ] Create `.cursor/commands/bmad-ext/orchestrator.md`
- [ ] Create agent wrappers for all 9 enhanced agents
- [ ] Test invocation from each platform
- [ ] HUMAN APPROVAL CHECKPOINT

### Phase 5: Integration Test
- [ ] Execute one complete story cycle via orchestrator
- [ ] Verify handoff artifacts created correctly
- [ ] Verify loop state updated correctly
- [ ] Verify governance update triggered
- [ ] FINAL APPROVAL

---

## Rollback Procedure

If issues occur at any phase:

```bash
# Remove extension layer
rm -rf _bmad-ext/

# Restore archived files
mv _bmad-output/.archive/2026-01-10/loop-state-migration/* _bmad/modules/

# Remove platform wrappers
rm -rf .augment/commands/bmad-ext/
rm -rf .cursor/commands/bmad-ext/
```

---

## Approval Request

**To proceed with Phase 0 execution, please confirm:**

1. Extension layer approach is correct
2. Directory structure meets needs
3. LOOP_STATE unified schema is acceptable
4. Handoff artifact schema is sufficient
5. Enhanced agent pattern is workable

Reply with: `APPROVED: Phase 0` to begin implementation.

---

## Appendix A: Complete BMAD Inventory

This appendix documents ALL existing BMAD components to ensure the extension layer properly acknowledges and integrates with them.

### A.1 BMM Agents (9 Core Implementation Agents)

These are the standard BMAD v6 agents that will be **wrapped** (not modified) by the extension layer:

| # | Agent | Path | description | Workflows Attached |
|---|-------|------|---------|-------------------|
| 1 | **analyst** | `_bmad/bmm/agents/analyst.md` | Requirements analysis, story breakdown | analyze-requirements, competitive-research |
| 2 | **architect** | `_bmad/bmm/agents/architect.md` | System design, ADRs, tech specs | create-architecture, create-tech-spec |
| 3 | **dev** | `_bmad/bmm/agents/dev.md` | Feature implementation, coding | dev-story, code-review |
| 4 | **pm** | `_bmad/bmm/agents/pm.md` | Backlog management, sprint planning | sprint-planning |
| 5 | **quick-flow-solo-dev** | `_bmad/bmm/agents/quick-flow-solo-dev.md` | Fast-track bug fixes | quick-fix |
| 6 | **sm** | `_bmad/bmm/agents/sm.md` | Story creation, sprint tracking | create-story |
| 7 | **tea** | `_bmad/bmm/agents/tea.md` | Test strategy, automation, QA | test-design, test-review |
| 8 | **tech-writer** | `_bmad/bmm/agents/tech-writer.md` | Documentation, API refs, guides | create-api-docs, create-user-guide |
| 9 | **ux-designer** | `_bmad/bmm/agents/ux-designer.md` | UI/UX design, wireframes | create-ux-design |

**Current Limitations** (to be addressed by extension layer):
- No handoff protocol between agents
- No parent/child hierarchy
- No loop awareness
- No escalation paths
- Static workflow attachment via menu
- Will be overwritten by BMAD updates

### A.2 Core Orchestrator

| Component | Path | Version | Status |
|-----------|------|---------|--------|
| **bmad-master** | `_bmad/core/agents/bmad-master.md` | v3.2.0 | ACTIVE |

**Current Capabilities**:
- Loads LOOP_STATE hierarchy (grandparent → parent → child)
- Timestamp validation on artifacts
- Auto-rerun stale workflows
- Autonomous/Interactive modes
- Story routing via MODULE-ROUTING.yaml

**Current Limitations**:
- 3-level LOOP_STATE causes hallucination chains
- No dynamic sub-agent delegation (just documentation)
- No callback/completion protocol
- Will be overwritten by BMAD updates

### A.3 Modules (8 Active + 1 Config)

| # | Module | Path | Status | Contains |
|---|--------|------|--------|----------|
| 1 | **architecture-refactoring** | `_bmad/modules/architecture-refactoring/` | TO ARCHIVE | Duplicate of remediation |
| 2 | **architecture-remediation** | `_bmad/modules/architecture-remediation/` | ACTIVE | 6 agents, 7 workflows |
| 3 | **asgl** | `_bmad/modules/asgl/` | ACTIVE | main-loop, LOOP_STATE files |
| 4 | **core-governance** | `_bmad/modules/core-governance/` | ACTIVE | platform-router, bmad-core-master |
| 5 | **governance** | `_bmad/modules/governance/` | ACTIVE | 3 agents, 7 workflows, 5 checklists |
| 6 | **integration-testing** | `_bmad/modules/integration-testing/` | ACTIVE | real-world-validator, e2e workflows |
| 7 | **quality** | `_bmad/modules/quality/` | ACTIVE | 10 scanners, thresholds |
| 8 | **sprint-execution** | `_bmad/modules/sprint-execution/` | ACTIVE | Sprint planning workflows |
| - | **config.yaml** | `_bmad/modules/config.yaml` | CONFIG | Module configuration |
| - | **MODULE-ROUTING.yaml** | `_bmad/modules/MODULE-ROUTING.yaml` | CONFIG | 316 lines, static routing |

#### A.3.1 Module: architecture-remediation (Detail)

```
_bmad/modules/architecture-remediation/
├── agents/
│   ├── component-splitter.md
│   ├── file-sync-specialist.md
│   ├── store-refactorer.md
│   ├── test-writer.md
│   ├── typescript-fixer.md
│   └── workspace-architect.md
├── workflows/
│   ├── eliminate-god-stores.md
│   ├── knowledge-sync-strategy.md
│   ├── normalize-components.md
│   ├── notes-sync-strategy.md
│   ├── stabilization-sprint.md
│   ├── state-consolidation-cycle.md
│   └── workspace-file-system-e2e.md
├── config/
│   ├── master-plan-foundation-stabilization.yaml
│   ├── priorities.yaml
│   └── thresholds.yaml
└── artifacts/
    ├── epic-tracking.md
    └── validation-gates.md
```

#### A.3.2 Module: governance (Detail)

```
_bmad/modules/governance/
├── agents/
│   ├── governance-agent.md
│   ├── status-sync-agent.md
│   └── validation-agent.md
├── workflows/
│   ├── archive-cycle.md
│   ├── artifact-cleanup-cycle.md
│   ├── artifact-lifecycle.md
│   ├── naming-enforcement.md
│   ├── ralph-loop-coordination.md
│   ├── stale-artifact-validation.md
│   ├── status-synchronization.md
│   └── template-enforcement.md
├── checklists/
│   ├── artifact-freshness-gate.yaml
│   ├── epic-done-gate.yaml
│   ├── sprint-rotation-gate.yaml
│   ├── story-done-gate.yaml
│   └── story-start-gate.yaml
├── cycles/
│   ├── cycle-1-yaml-consolidation.md
│   ├── cycle-2-sprint-regulation.md
│   ├── cycle-3-standards-update.md
│   ├── cycle-4-workflow-status-schema.md
│   ├── cycle-5-governance-integration.md
│   └── cycle-6-agents-compression.md
├── CONSTITUTION.md
└── MANIFEST.yaml
```

#### A.3.3 Module: quality (Detail)

```
_bmad/modules/quality/
├── scanners/
│   ├── agent-rag-scanner.md
│   ├── architecture-scanner.md
│   ├── evidence-synthesizer.md
│   ├── performance-scanner.md
│   ├── persistence-scanner.md
│   ├── security-scanner.md
│   ├── state-scanner.md
│   ├── types-scanner.md
│   ├── ux-scanner.md
│   └── workspace-scanner.md
├── domains.yaml
├── MANIFEST.yaml
├── priorities.yaml
└── thresholds.yaml
```

### A.4 Customized Workflows (Messy - Need Consolidation)

These are project-specific workflows that overlap with core but lack proper format:

| # | Workflow | Path | Status | Issues |
|---|----------|------|--------|--------|
| 1 | **course-correction-workflow** | `_bmad/workflows/course-correction-workflow/` | MESSY | Overlaps with governance/correct-course |
| 2 | **deep-scan-targeted** | `_bmad/workflows/deep-scan-targeted/` | MESSY | Has steps/ but incomplete |
| 3 | **routing-analysis-workflow** | `_bmad/workflows/routing-analysis-workflow/` | EMPTY | Placeholder only |
| 4 | **sprint-planning-course-correction** | `_bmad/workflows/sprint-planning-course-correction/` | MESSY | Has sprint-plan.md only |
| 5 | **story-cycle** | `_bmad/workflows/story-cycle/` | PARTIAL | Has skills/, steps/, utils/, README |
| 6 | **implement-gemini-multimodal.md** | `_bmad/workflows/` | STANDALONE | Single file, not folder structure |
| 7 | **systematic-refactoring-execution.md** | `_bmad/workflows/` | STANDALONE | Single file, not folder structure |

#### A.4.1 story-cycle (Most Complete Customized Workflow)

```
_bmad/workflows/story-cycle/
├── skills/           # Skill definitions
├── steps/            # Step-by-step execution
├── utils/            # Utility functions
├── dev-cycle-prompt.md
└── README.md
```

**Analysis**: This is the most complete customized workflow but still lacks:
- Handoff protocol
- Parent/child linking
- Integration with orchestrator
- Loop state awareness

### A.5 Files to Archive (Phase 0)

| File | Reason | Archive Path |
|------|--------|--------------|
| `_bmad/modules/architecture-refactoring/` | Duplicate of architecture-remediation | `.archive/2026-01-10/` |
| `_bmad/modules/asgl/LOOP_STATE-grandparent.yaml` | Causes 3-level hierarchy hallucination | `.archive/2026-01-10/` |
| `_bmad/modules/asgl/LOOP_STATE-parent.yaml` | Replace with unified LOOP_STATE | `.archive/2026-01-10/` |
| `_bmad/modules/asgl/LOOP_STATE-child.yaml` | Replace with unified LOOP_STATE | `.archive/2026-01-10/` |

### A.6 Files to Freeze (Do Not Modify)

| File | Reason | Until |
|------|--------|-------|
| `_bmad/modules/MODULE-ROUTING.yaml` | 316 lines, needs complete redesign | Phase 2 |
| `_bmad/modules/asgl/workflows/main-loop.md` | References archived files | Phase 1 complete |
| All `_bmad/bmm/agents/*.md` | Will be wrapped, not modified | Never (use extension) |
| `_bmad/core/agents/bmad-master.md` | Will be wrapped, not modified | Never (use extension) |

### A.7 Future Consolidation Roadmap

After Phase 0-5 of extension layer, address these:

| Priority | Target | Action | Phase |
|----------|--------|--------|-------|
| P0 | `_bmad/workflows/story-cycle/` | Migrate to `_bmad-ext/workflows/story-cycle/` | 6 |
| P1 | `_bmad/workflows/course-correction-workflow/` | Merge with governance/correct-course | 6 |
| P2 | `_bmad/workflows/deep-scan-targeted/` | Complete or archive | 7 |
| P2 | `_bmad/workflows/sprint-planning-course-correction/` | Merge with sprint-execution | 7 |
| P3 | Standalone .md workflows | Convert to folder structure or archive | 8 |
| P3 | `MODULE-ROUTING.yaml` | Replace with dynamic routing in extension | 8 |

---

## Appendix B: Extension Layer ↔ BMAD Core Mapping

This shows how extension components wrap core components:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTENSION LAYER                                    │
│                           (_bmad-ext/)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  master-orchestrator.md ─────────────────┐                                   │
│        │                                 │                                   │
│        │ WRAPS                           │ DELEGATES TO                      │
│        ▼                                 ▼                                   │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐                    │
│  │ dev-ext.md   │    │architect-ext │   │ analyst-ext  │  ... (9 total)    │
│  │              │    │              │   │              │                    │
│  │ WRAPS:       │    │ WRAPS:       │   │ WRAPS:       │                    │
│  └──────┬───────┘    └──────┬───────┘   └──────┬───────┘                    │
│         │                   │                  │                            │
└─────────┼───────────────────┼──────────────────┼────────────────────────────┘
          │                   │                  │
          ▼                   ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BMAD CORE                                          │
│                           (_bmad/)                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  bmad-master.md ◄────────────────────────────────────────────────────────── │
│  (_bmad/core/agents/)         │                                              │
│        │                      │                                              │
│        │ ROUTES TO            │ REFERENCED BY                                │
│        ▼                      │                                              │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐                    │
│  │ dev.md       │    │ architect.md │   │ analyst.md   │  ... (9 total)    │
│  │              │    │              │   │              │                    │
│  │ (_bmad/bmm/  │    │ (_bmad/bmm/  │   │ (_bmad/bmm/  │                    │
│  │  agents/)    │    │  agents/)    │   │  agents/)    │                    │
│  └──────────────┘    └──────────────┘   └──────────────┘                    │
│                                                                              │
│  MODULE-ROUTING.yaml ◄─── Static routing (to be replaced by dynamic)        │
│  (_bmad/modules/)                                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix C: What Gets Modified vs What Stays Untouched

### NEVER MODIFY (BMAD Core - Will Be Overwritten)

```
_bmad/core/agents/bmad-master.md          # Wrap via extension
_bmad/bmm/agents/*.md                     # Wrap via extension
_bmad/bmm/workflows/**/*                  # Reference from extension
_bmad/core/workflows/**/*                 # Reference from extension
_bmad/cis/**/*                            # Reference from extension
```

### ARCHIVE (Redundant/Problematic)

```
_bmad/modules/architecture-refactoring/   # Duplicate
_bmad/modules/asgl/LOOP_STATE-*.yaml      # Replace with unified
```

### CONSOLIDATE LATER (Customized Workflows)

```
_bmad/workflows/story-cycle/              # Migrate to extension
_bmad/workflows/course-correction-workflow/
_bmad/workflows/deep-scan-targeted/
_bmad/workflows/sprint-planning-course-correction/
_bmad/workflows/*.md                      # Standalone files
```

### KEEP AS-IS (Working Modules)

```
_bmad/modules/governance/checklists/      # 5 working gates
_bmad/modules/quality/scanners/           # 10 working scanners
_bmad/modules/architecture-remediation/   # 6 agents, 7 workflows
```

---

**End of Appendices**
