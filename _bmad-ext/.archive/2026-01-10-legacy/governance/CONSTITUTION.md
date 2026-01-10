# BMAD Governance Constitution

**Document ID**: GOV-CONSTITUTION-001
**Version**: 1.0.0
**Created**: 2026-01-06
**Status**: ACTIVE - PROJECT-WIDE ENFORCEMENT
**Authority**: Supreme over all agents, modules, workflows, and protocols

---

## ═══════════════════════════════════════════════════════════════════════════════
## PREAMBLE
## ═══════════════════════════════════════════════════════════════════════════════

This Constitution establishes the fundamental governance principles for the entire BMAD (Build, Manage, Architect, Deploy) framework. All agents, modules, workflows, sub-agents, protocols, and participants operating within this framework MUST acknowledge and abide by these rules.

**NON-NEGOTIABLE PRINCIPLES**:
1. **Single Source of Truth (SSOT)**: One canonical location for each piece of information
2. **Artifact Lifecycle Management**: All artifacts have defined creation, active, and expiration states
3. **Naming Convention Enforcement**: All artifacts follow `{prefix}-{domain}-{sequence}` pattern
4. **Stale Context Recovery**: Artifacts >24h old trigger automatic context recovery
5. **Multi-Team Coordination**: Independent teams require conflict detection protocols
6. **Template-Only Governance**: Modules are READ-ONLY templates; agents don't modify them directly

---

## ═══════════════════════════════════════════════════════════════════════════════
## ARTICLE I: FOUR-TIER ARTIFACT GOVERNANCE
## ═══════════════════════════════════════════════════════════════════════════════

### Tier 1: The Unchangeable (Standards)

**Definition**: Core standards that define technical patterns and conventions

**Location**: `agent-os/standards/global/`

**Files**:
- `coding-style.md` - Code formatting and structure
- `commenting.md` - Comment standards
- `conventions.md` - Naming and organizational conventions
- `error-handling.md` - Error handling patterns
- `mcp-research.md` - MCP tool usage protocols
- `tech-stack.md` - Technology stack definitions
- `validation.md` - Input validation standards

**Rules**:
- **READ-ONLY**: Notify human if outdated, never auto-modify
- **RETENTION**: Permanent (never archived)
- **UPDATE FREQUENCY**: Per epic (via governance module)
- **FRONTMATTER REQUIRED**: Yes, with `last_updated` and `update_frequency`

**Example Frontmatter**:
```yaml
---
document_type: "standard"
name: "coding-style"
last_updated: "2026-01-06"
update_frequency: "per_epic"
stakeholder: "team-a"
related_docs:
  - "agent-os/standards/global/validation.md"
---
```

### Tier 2: Strictly Controlled (SSOT)

**Definition**: Single source of truth documents that define project direction

**Locations**:
- `AGENTS.md` (root) - Agent registry and module routing
- `_bmad/AGENTS.md` - Module-specific agent definitions
- `agent-os/product/` - PRD, mission, roadmap
- `agent-os/standards/` - Architecture decisions

**Rules**:
- **LINE-BASED UPDATES ONLY**: Never replace entire file
- **RETENTION**: Permanent with frontmatter versioning
- **UPDATE FREQUENCY**: Immediate, per-story, per-epic, or quarterly
- **FRONTMATTER REQUIRED**: Yes, with full metadata

**Example Frontmatter**:
```yaml
---
document_type: "governance"
name: "AGENTS"
last_updated: "2026-01-06"
update_frequency: "immediate"
stakeholder: "bmad-master"
related_docs:
  - "_bmad/modules/governance/CONSTITUTION.md"
---
```

### Tier 3: Archiving (Medium-live)

**Definition**: Sprint artifacts and medium-lived documents

**Location**: `_bmad-output/sprint-artifacts/YYYY-MM/`

**Naming**: `{artifact-type}-{YYYY-MM-DD}.{ext}`

**Examples**:
- `sprint-status-2026-01-06.yaml`
- `course-correction-2026-01-03.md`
- `epic-summary-2026-01-15.md`

**Rules**:
- **RETENTION**: 90 days active, then `archive/`
- **UPDATE FREQUENCY**: Per sprint
- **FRONTMATTER REQUIRED**: Yes
- **AUTO-ARCHIVE**: Yes, after 90 days

**Example Frontmatter**:
```yaml
---
artifact_id: "SPR-STATUS-2026-01-06"
artifact_type: "sprint_status"
parent_id: "governance-foundation"
sequence_number: 1
created_at: "2026-01-06T12:00:00+07:00"
expires_at: "2026-04-06T12:00:00+07:00"
status: "ACTIVE"
team: "Team-A"
related_artifacts: []
---
```

### Tier 4: Short-live (Artifacts)

**Definition**: Handoff documents, validation reports, research artifacts

**Location**: `_bmad-output/handoffs/YYYY-MM-DD/`

**Naming**: `{story-id}-{artifact-type}-{seq}.{ext}`

**Examples**:
- `E4-handoff.md`
- `ARC-STORE-validation-002.md`
- `research-pdf-parser-001.md`

**Rules**:
- **RETENTION**: 5 days active, then `_archive/`
- **UPDATE FREQUENCY**: Per story/phase
- **FRONTMATTER REQUIRED**: Yes, mandatory
- **AUTO-ARCHIVE**: Yes, after 5 days
- **STALE THRESHOLD**: 24 hours (triggers HARD-WIRED stop condition)

**Example Frontmatter**:
```yaml
---
artifact_id: "E4-HANDOFF-001"
artifact_type: "handoff"
parent_id: "Epic-4"
sequence_number: 1
created_at: "2026-01-06T14:30:00+07:00"
expires_at: "2026-01-11T14:30:00+07:00"
status: "ACTIVE"
team: "Team-A"
related_artifacts: ["E3-completion-001"]
tags: ["handoff", "workspace-analysis"]
last_validated: "2026-01-06T14:30:00+07:00"
---
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## ARTICLE II: NAMING CONVENTION ENFORCEMENT
## ═══════════════════════════════════════════════════════════════════════════════

### Artifact ID Pattern

**Format**: `{PREFIX}-{DOMAIN}-{SEQUENCE}`

**Prefixes**:
- `ARC` - Architecture remediation
- `EPI` - Epic management
- `SPR` - Sprint management
- `STO` - Story management
- `GOV` - Governance
- `RES` - Research
- `VAL` - Validation
- `HND` - Handoff

**Domains**:
- `STORE` - State management
- `COMP` - Component
- `MOD` - Module
- `WF` - Workflow
- `AGT` - Agent
- `SYNC` - Synchronization
- `KEY` - Key orchestration

**Examples**:
- `ARC-STORE-001` - Architecture remediation, store splitting, #1
- `GOV-MOD-001` - Governance, module creation, #1
- `VAL-SYNC-002` - Validation, synchronization, #2

### File Naming Convention

**Short-live Artifacts**: `{story-id}-{type}-{seq}.{ext}`
- `E4-handoff-001.md`
- `S-22-research-001.md`

**Medium-live Artifacts**: `{type}-{YYYY-MM-DD}.{ext}`
- `sprint-status-2026-01-06.yaml`
- `cycle-2-completion-2026-01-06.md`

**Standards**: `{name}.md` (no date)
- `coding-style.md`
- `error-handling.md`

### Date Format

**Always**: `YYYY-MM-DD` (ISO 8601)

**Timestamps**: `YYYY-MM-DDTHH:mm:ss±ZZ:ZZ` (ISO 8601 with timezone)

**Examples**:
- `2026-01-06`
- `2026-01-06T14:30:00+07:00`

---

## ═══════════════════════════════════════════════════════════════════════════════
## ARTICLE III: STALE ARTIFACT PROTOCOL (HARD-WIRED)
## ═══════════════════════════════════════════════════════════════════════════════

### Stop Condition

**NON-OVERRIDEABLE**: If ANY condition is true, workflow MUST stop:

```yaml
stale_triggers:
  - "artifact.age > 24 hours"
  - "artifact.sequence_number broken"
  - "artifact.metadata disconnected"
  - "artifact.parent_id missing"
  - "artifact.frontmark incomplete"

enforcement:
  mechanism: "pre-execution hook"
  location: [".claude/hooks/pre-execution.sh", ".opencode/hooks/pre-execution.sh"]
  can_be_disabled: false
  requires_user_approval: true
```

### Context Recovery Procedure

When stale artifact detected:

1. **STOP** workflow immediately
2. **GREP SEARCH** artifact_id across `_bmad-output/`
3. **READ** last 3 related artifacts
4. **SYNTHESIZE** context summary
5. **PRESENT** recovered context to user
6. **WAIT** for explicit user approval: `continue` | `refresh` | `abort`

### User Approval Options

| Option | Action |
|--------|--------|
| `continue` | Proceed with workflow using recovered context |
| `refresh` | Re-validate artifact, update timestamp, proceed |
| `abort` | Stop workflow, notify human, preserve state |

### Validation State Tracking

All validations tracked in `.claude/ralph-loop.local.md`:

```yaml
stale_artifact_validation:
  validation_state:
    artifacts_checked: 0
    stale_detected: 0
    context_recovered: 0
    user_approval_required: false
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## ARTICLE IV: MULTI-TEAM COORDINATION PROTOCOL
## ═══════════════════════════════════════════════════════════════════════════════

### Team Structure

**Team-A**: Primary team (main branch work)
- Status file: `bmm-workflow-status.yaml`
- Scope: Production hardening, architecture remediation

**Team-B**: Secondary team (feature/experimental work)
- Status file: `_bmad-output/sprint-artifacts/team-b-sprint.yaml`
- Scope: UX experimentation, feature development

### Integration Modes

```yaml
integration_modes:
  independent:
    description: "Teams work on different epics"
    action: "no coordination required"

  coordinated:
    description: "Teams work on same epic, different stories"
    action: "story sequence coordination required"

  conflict:
    description: "Teams work on same epic/story"
    action: "STOP and ask user for resolution"
```

### Conflict Detection

**Trigger**: Same epic_id in both team status files with `status: IN_PROGRESS`

**Action**:
1. Detect via grep search across both status files
2. Present conflict summary to user
3. Request resolution: prioritize Team-A, prioritize Team-B, or merge

**Example Output**:
```
⚠️  MULTI-TEAM CONFLICT DETECTED

Epic: Epic-22 (Production Hardening)

Team A: IN_PROGRESS
  Current Story: S-22-2 (TypeScript remediation)
  Progress: 45%

Team B: IN_PROGRESS
  Current Story: S-22-5 (Component normalization)
  Progress: 30%

Both teams are actively working on Epic-22.
Options: [1] Prioritize Team-A  [2] Prioritize Team-B  [3] Merge coordinate
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## ARTICLE V: MODULE GOVERNANCE
## ═══════════════════════════════════════════════════════════════════════════════

### Active Modules (Consolidated to 4)

| Module | Purpose | Status |
|--------|---------|--------|
| `governance` | Artifact lifecycle, naming, validation | ACTIVE |
| `architecture-remediation` | God store/component elimination | ACTIVE |
| `asgl` | Orchestration (read-only templates) | ACTIVE |
| `quality` | Diagnostics, testing, validation | ACTIVE |

### Archived Modules

| Module | Reason | Archive Date |
|--------|--------|--------------|
| `cross-workspace-chat` | Migrated to epics/ | 2026-01-06 |
| `gemini-multimodal` | Empty, never used | 2026-01-06 |
| `light-theme-sprint` | Migrated to epics/ | 2026-01-06 |

### Module Rules

1. **READ-ONLY TEMPLATES**: Modules are template-only, agents don't modify them
2. **FACADE PATTERN**: For module consolidation, maintain facade exports
3. **VERSION TRACKING**: All modules have MANIFEST.yaml with version
4. **WORKFLOW BINDING**: Each module defines its workflows in MANIFEST

---

## ═══════════════════════════════════════════════════════════════════════════════
## ARTICLE VI: AGENT ACKNOWLEDGMENT REQUIREMENTS
## ═══════════════════════════════════════════════════════════════════════════════

### MANDATORY Acknowledgment

Every agent, sub-agent, and workflow MUST include:

```yaml
# Governance Acknowledgment (Required in all agents)

governance:
  constitution: "_bmad/modules/governance/CONSTITUTION.md"
  version: "1.0.0"
  acknowledged_at: "YYYY-MM-DD"
  acknowledged_by: "{agent-name}"

  compliance:
    artifact_lifecycle: true
    naming_convention: true
    stale_artifact_protocol: true
    multi_team_coordination: true
    read_only_templates: true

  validation:
    before_execution: true  # Check artifact freshness before starting
    after_completion: true  # Update Ralph Loop state after completing
    on_error: true  # Log to governance on error
```

### Agent Rules

1. **CHECK ARTIFACT EXPIRY**: Before reading any artifact, validate `created_at` timestamp
2. **RECOVER STALE CONTEXT**: If artifact >24h old, run grep recovery before proceeding
3. **FOLLOW NAMING CONVENTION**: All created artifacts follow `{prefix}-{domain}-{seq}`
4. **INCLUDE FRONTMATTER**: All artifacts have complete YAML frontmatter
5. **UPDATE RALPH LOOP**: After cycle completion, update loop state
6. **NEVER MODIFY TEMPLATES**: Modules are read-only, use governance module for updates

---

## ═══════════════════════════════════════════════════════════════════════════════
## ARTICLE VII: RALPH LOOP COORDINATION
## ═══════════════════════════════════════════════════════════════════════════════

### Loop State File

**Location**: `.claude/ralph-loop.local.md`

**Purpose**: Auto-generated state file tracking cycle progress

**Update Matrix**:

| Event | Updater | Fields Updated |
|-------|---------|----------------|
| Cycle completes | BMAD Master | `last_completed_cycle`, `current_cycle`, `next_actions` |
| Sub-cycle completes | Domain Router | `current_subcycle`, `phase` |
| Validation runs | Governance | `validation`, `gates_passed` |
| Stale artifact detected | Ralph Hook | `stale_artifact_validation.*`, `user_approval_required` |
| Team conflict detected | Multi-Team | `multi_team.conflicts_pending`, `validation.team_conflicts` |
| Error occurs | Any agent | `errors_encountered`, `rollback_points` |

### Ralph Hook Script

**Location**: `.claude/hooks/ralph-loop.sh`

**Trigger**: Stop hook (every Claude Code Stop event)

**Actions**:
1. Increment `current_iteration`
2. Load latest completion report for context
3. Run `validate_artifact_freshness()` check
4. Check for multi-team conflicts
5. Update validation state

---

## ═══════════════════════════════════════════════════════════════════════════════
## ARTICLE VIII: ENFORCEMENT & COMPLIANCE
## ═══════════════════════════════════════════════════════════════════════════════

### Compliance Checks

**Before Agent Execution**:
- [ ] Check artifact expiry (validate `created_at` < 24h)
- [ ] Verify naming convention follows pattern
- [ ] Confirm frontmatter is complete
- [ ] Check for multi-team conflicts

**After Agent Execution**:
- [ ] Update Ralph Loop state
- [ ] Create completion artifact with proper frontmatter
- [ ] Register artifact in governance module
- [ ] Archive stale artifacts if needed

### Non-Compliance Actions

| Violation | Severity | Action |
|-----------|----------|--------|
| Missing frontmatter | P0 | Block workflow, require fix |
| Naming convention violation | P0 | Block workflow, require fix |
| Stale artifact used | P0 | HARD-WIRED stop, context recovery |
| Template modification | P1 | Log warning, revert changes |
| Missing governance acknowledgment | P2 | Log warning, request update |

### Governance Module Authority

The `governance` module has SUPREME authority for:
- Artifact lifecycle management
- Naming convention enforcement
- Stale artifact validation
- Status file SSOT maintenance
- Module/workflow compliance

**No agent or workflow can override governance decisions.**

---

## ═══════════════════════════════════════════════════════════════════════════════
## ARTICLE IX: AMENDMENTS
## ═══════════════════════════════════════════════════════════════════════════════

### Amendment Process

1. **PROPOSAL**: Submit amendment to governance module
2. **REVIEW**: Governance module reviews impact
3. **APPROVAL**: Requires human approval
4. **UPDATE**: Update constitution with new version
5. **NOTIFICATION**: Notify all agents of change

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-06 | Initial constitution - 4-tier governance, naming, stale protocol, multi-team |

---

## ═══════════════════════════════════════════════════════════════════════════════
## SIGNATURES & RATIFICATION
## ═══════════════════════════════════════════════════════════════════════════════

**Ratified**: 2026-01-06

**Authority**: BMAD Framework Governance Module

**Status**: ACTIVE - PROJECT-WIDE ENFORCEMENT

**Supremacy**: This constitution supersedes all conflicting agent, module, workflow, or protocol documents.

---

**Constitution Owner**: @bmad/modules/governance
**Last Updated**: 2026-01-06
**Next Review**: 2026-02-06 (30 days)
**Status**: ACTIVE - ALL AGENTS MUST ACKNOWLEDGE
