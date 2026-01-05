# ASGL - Autonomous Self-Governing Loop Orchestrator

**Module ID**: `asgl`  
**Version**: 2.0.0  
**Created**: 2026-01-05  
**Status**: `ACTIVE`  
**Purpose**: **Loop Orchestration + Governance + Team Assembly + Integration**

---

## ⚠️ IMPORTANT: What ASGL IS and IS NOT

### ASGL IS:
- ✅ A **loop orchestrator** - initiates and governs autonomous development cycles
- ✅ A **team assembler** - coordinates agents from BMAD, Claude Code, OpenCode
- ✅ A **governance enforcer** - ensures AGENTS.md/CLAUDE.md stay up-to-date
- ✅ An **integration layer** - connects to existing BMAD workflows and modules
- ✅ A **starting point** - the entry-point for autonomous multi-platform execution

### ASGL IS NOT:
- ❌ A replacement for `deep-scan` module (diagnostics)
- ❌ A replacement for `architecture-remediation` module (remediation execution)
- ❌ A duplication of existing workflows
- ❌ A standalone execution engine

---

## Module Architecture Position

```
                    ┌─────────────────────────────────┐
                    │         ASGL ORCHESTRATOR       │
                    │   (Loop + Govern + Assemble)    │
                    └─────────────┬───────────────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           ▼                      ▼                      ▼
   ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
   │   deep-scan   │      │ architecture- │      │  BMAD Core    │
   │   (Diagnose)  │      │  remediation  │      │  (Workflows)  │
   │               │      │  (Remediate)  │      │               │
   └───────────────┘      └───────────────┘      └───────────────┘
           │                      │                      │
           └──────────────────────┴──────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │    Governance Documents   │
                    │  AGENTS.md + CLAUDE.md    │
                    │  + child AGENTS.md files  │
                    └───────────────────────────┘
```

---

## Core Responsibilities

### 1. Loop Orchestration
Execute complete development cycles by:
- Loading current workflow/sprint status
- Executing stories through appropriate modules
- Managing handoffs between phases
- Tracking completion and continuation

### 2. Governance Enforcement
Maintain documentation integrity:
- **AGENTS.md / CLAUDE.md** updates after major changes
- **Child AGENTS.md** creation in subdirectories as project grows
- **Artifact lifecycle** management (create, track, archive)
- **Cross-reference validation** to prevent orphans

### 3. Team Assembly
Coordinate multi-platform agent teams:
- Select optimal agents from BMAD, Claude Code, OpenCode
- Generate platform-agnostic handoff artifacts
- Track agent execution across sessions

### 4. Integration Layer
Connect to existing modules without duplication:
- Invoke `deep-scan` for diagnostics
- Invoke `architecture-remediation` for fixes
- Invoke BMAD core workflows for standard processes

---

## Governance Hierarchy

```
Root Level (Project Governance)
├── AGENTS.md              ← Primary agent/architecture reference (ROOT)
├── CLAUDE.md              ← Claude Code guidance (ROOT)
│
├── src/                   ← Codebase (governed by root docs)
│   ├── infrastructure/
│   │   └── AGENTS.md      ← Child: Infrastructure-specific patterns
│   ├── presentation/
│   │   └── AGENTS.md      ← Child: Component/UI patterns
│   ├── lib/
│   │   └── AGENTS.md      ← Child: Library-specific patterns
│   └── domain/
│       └── AGENTS.md      ← Child: Domain-specific patterns
│
├── _bmad/                 ← BMAD Framework
│   └── modules/
│       ├── asgl/          ← This module (orchestration)
│       ├── deep-scan/     ← Diagnostics (NOT replaced by ASGL)
│       └── architecture-remediation/  ← Remediation (NOT replaced)
│
└── _bmad-output/          ← Artifacts (governed by lifecycle)
    └── AGENTS.md          ← Child: Artifact organization patterns
```

---

## Governance Update Protocol

### Update Frequency

| Document | Update Trigger | Frequency |
|----------|----------------|-----------|
| **AGENTS.md (root)** | Architectural changes, ADR updates | Every 3-5 stories |
| **CLAUDE.md (root)** | Pattern changes, new conventions | Every 5-7 stories |
| **Child AGENTS.md** | Layer-specific changes | When layer evolves |
| **artifact-registry** | Any artifact CRUD | Every story |
| **bmm-workflow-status** | Phase/story transitions | Every story |

### Governance Enforcement Triggers

```yaml
governance_triggers:
  - trigger: "file_created"
    condition: "path matches src/**"
    action: "validate_naming_convention"
    
  - trigger: "story_complete"
    condition: "stories_completed % 3 == 0"
    action: "update_root_agents_md"
    
  - trigger: "story_complete"
    condition: "stories_completed % 5 == 0"
    action: "update_root_claude_md"
    
  - trigger: "layer_change"
    condition: "files_changed_in_layer > 5"
    action: "update_or_create_child_agents_md"
    
  - trigger: "artifact_created"
    action: "register_in_artifact_registry"
    
  - trigger: "phase_complete"
    action: 
      - "archive_phase_artifacts"
      - "full_governance_audit"
```

---

## File & Artifact Governance

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| **Sprint artifact** | `{type}-{yyyy-mm-dd}.{ext}` | `sprint-status-2026-01-05.yaml` |
| **Health assessment** | `{type}-{yyyy-mm-dd}.md` | `project-health-assessment-2026-01-05.md` |
| **Epic docs** | `epic-{id}-{slug}.md` | `epic-53-state-consolidation.md` |
| **Story docs** | `story-{epic}-{story}.md` | `story-53-2-dexie-helpers.md` |
| **ADR** | `adr-{number}-{slug}-{date}.md` | `adr-024-state-consolidation-2026-01-04.md` |
| **Research** | `{topic}-research-{date}.md` | `zustand-patterns-research-2026-01-05.md` |
| **Handoff** | `handoff-{from}-{to}-{story}.md` | `handoff-analyst-dev-CC01.md` |

### Artifact Lifecycle States

```yaml
artifact_states:
  DRAFT:
    description: "Being created"
    duration_max: "24h"
    auto_transition_to: "SUSPECT"
    
  ACTIVE:
    description: "In use, referenced by other artifacts"
    auto_transition_trigger: "handoff_complete"
    
  STALE:
    description: "Not updated in 7 days"
    auto_mark_after: "7 days"
    action: "prompt for review"
    
  ARCHIVED:
    description: "Phase/epic complete, preserved for reference"
    location: "_bmad-output/archive/{yyyy}/{mm}/"
    
  DELETED:
    description: "Removed after deprecation period"
    soft_delete_period: "30 days"
```

### Cross-Reference Protocol

Every artifact MUST have:
```yaml
frontmatter:
  id: "ART-{yyyymmdd}-{seq}"
  session: "ASGL-{timestamp}"
  references:
    - path: "related-artifact-1.md"
      relationship: "depends_on"
    - path: "related-artifact-2.md"
      relationship: "produced_by"
  referenced_by: []  # Auto-populated by registry
```

---

## Design & UX Governance

### Mandatory Checks (Inherited from Design System)

| Check | Specification | Blocking |
|-------|---------------|----------|
| **No glassmorphism** | `backdrop-blur`, `bg-opacity-[0-4]` forbidden | ✅ YES |
| **8-bit shadows only** | Hard-edged, no blur | ✅ YES |
| **CSS variables only** | No hardcoded hex/rgb/hsl | ✅ YES |
| **Mobile-first** | Touch targets ≥44px, no horizontal scroll | ✅ YES |
| **i18n compliance** | All strings via `t()`, EN+VI required | ✅ YES |

Reference: `_bmad-output/design-system-8bit-2025-12-25.md`

---

## Integration with Existing Modules

### Invoking deep-scan

```yaml
# ASGL does NOT replace deep-scan, it INVOKES it
invoke_scan:
  module: "deep-scan"
  workflow: "full-scan"
  output_location: "_bmad/modules/deep-scan/artifacts/scan-results/"
  integration:
    - "Feed results to architecture-remediation for planning"
    - "Feed results to sprint-planning for prioritization"
```

### Invoking architecture-remediation

```yaml
# ASGL does NOT replace architecture-remediation, it INVOKES it
invoke_remediation:
  module: "architecture-remediation"
  entry_workflows:
    - "eliminate-god-stores"
    - "normalize-components"
    - "fix-typescript-errors"
    - "state-consolidation-cycle"
  tracking_file: "_bmad-output/sprint-artifacts/arc-sprint-status.yaml"
```

### Invoking BMAD Core Workflows

```yaml
# Standard BMAD workflows accessible via ASGL
invoke_bmad:
  workflows:
    - path: "_bmad/bmm/workflows/4-implementation/code-review/workflow.yaml"
      alias: "code-review"
    - path: "_bmad/bmm/workflows/4-implementation/correct-course/workflow.yaml"
      alias: "correct-course"
    - path: "_bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml"
      alias: "dev-story"
    - path: "_bmad/bmm/workflows/4-implementation/sprint-planning/workflow.yaml"
      alias: "sprint-planning"
```

---

## Child AGENTS.md Strategy

### When to Create Child AGENTS.md

Create a child AGENTS.md in a subdirectory when:
1. **Layer complexity** exceeds 20 files with distinct patterns
2. **Architectural patterns** diverge from root patterns
3. **Team onboarding** would benefit from localized docs
4. **Cross-cutting concerns** need domain-specific documentation

### Child AGENTS.md Template

```markdown
# {Directory} Layer Patterns

> **Parent**: See `/AGENTS.md` for project-wide patterns.
> **Scope**: This file covers patterns specific to `src/{layer}/`.
> **Last Updated**: {date}

## Layer-Specific Conventions

{layer-specific patterns}

## Key Files

| File | Purpose | Max Lines |
|------|---------|-----------|
{file table}

## Dependencies

{what this layer depends on}

## Dependents

{what depends on this layer}
```

---

## Loop Execution Protocol

### Main Loop Workflow

```yaml
main_loop:
  name: "ASGL Main Loop"
  
  initialization:
    - "Load bmm-workflow-status.yaml"
    - "Load LOOP_STATE.yaml"
    - "Verify governance docs exist"
    - "Check pending migrations/wires"
  
  for_each_story:
    - step: "Research"
      action: "Execute MCP research (3+ tools)"
      
    - step: "Select Module"
      decision_tree:
        - if: "story requires diagnostics"
          then: "invoke deep-scan"
        - if: "story requires refactoring"
          then: "invoke architecture-remediation"
        - if: "story requires implementation"
          then: "invoke bmad dev-story"
        - else: "invoke bmad generic workflow"
          
    - step: "Execute"
      action: "Run selected module/workflow"
      
    - step: "Validate"
      checks:
        - "TypeScript (production only)"
        - "Design compliance"
        - "Mobile validation"
        - "i18n compliance"
        - "Pending wires = 0"
        
    - step: "Governance Check"
      conditions:
        - if: "stories_completed % 3 == 0"
          then: "update AGENTS.md"
        - if: "stories_completed % 5 == 0"
          then: "update CLAUDE.md"
          
    - step: "Update State"
      action: "Update LOOP_STATE, artifact-registry, sprint-status"
      
    - step: "Continue"
      decision:
        - if: "stories_remaining > 0"
          then: "next story"
        - if: "all checks pass"
          then: "complete loop"
        - else: "halt with report"
```

---

## Module Structure

```
_bmad/modules/asgl/
├── README.md                    # This file (orchestrator definition)
├── MANIFEST.yaml                # Module configuration
├── LOOP_STATE.yaml              # Current loop state (mutable)
├── MASTER_PROMPT.md             # Ready-to-use initialization prompt
│
├── config/
│   ├── governance.yaml          # Governance rules and triggers
│   ├── naming-conventions.yaml  # File naming patterns
│   ├── module-integration.yaml  # How to invoke other modules
│   └── design-rules.yaml        # Design compliance rules
│
├── workflows/
│   ├── main-loop.md             # Primary loop workflow
│   ├── governance-update.md     # AGENTS.md/CLAUDE.md updates
│   ├── artifact-lifecycle.md    # Artifact management
│   └── child-agents-creation.md # Create child AGENTS.md files
│
├── scratchpad/
│   ├── pending-wires.yaml       # Migration tracking
│   ├── artifact-registry.yaml   # All artifacts with lifecycle
│   └── research-cache.yaml      # MCP research cache
│
└── templates/
    ├── handoff-artifact.md      # Agent-to-agent handoff
    ├── child-agents-md.md       # Child AGENTS.md template
    └── governance-update.md     # AGENTS.md update template
```

---

## Integration with Platforms

### Claude Code (.claude/)

ASGL syncs to Claude Code as a skill:
```
.claude/skills/asgl/
├── SKILL.md                    # ASGL skill definition
└── references/
    └── (README.md symlinked)
```

### OpenCode (.opencode/)

ASGL syncs to OpenCode as a skill:
```
.opencode/skill/asgl/
├── SKILL.md                    # ASGL skill definition
└── references/
    └── (README.md symlinked)
```

### BMAD Master

ASGL is invoked by @bmad-core-bmad-master:
```
@bmad-core-bmad-master → detects "autonomous loop" intent → loads ASGL
```

---

## Preventing Fragmentation & Context Poisoning

### Anti-Fragmentation Rules

1. **Single Source of Truth**: Each concept has ONE canonical location
2. **Facades for Migration**: Never break imports; create deprecation facades
3. **Cross-Reference Validation**: Broken refs → SUSPECT status
4. **Orphan Detection**: Artifacts without session refs → auto-flagged

### Anti-Poisoning Rules

1. **Session-Tagged Artifacts**: Every artifact has session ID
2. **TTL on Drafts**: Drafts become SUSPECT after 24h
3. **Stale Detection**: 7-day inactivity → STALE status
4. **Archival Protocol**: Completed phases → archive with date structure

### Wire Tracking (No Forgotten Migrations)

```yaml
wire_tracking:
  on_refactor:
    - "Register all consumers in pending-wires.yaml"
    - "Block story completion if pending > 0"
    
  wire_types:
    - IMPORT_UPDATE      # Import path changes
    - FACADE_CREATION    # Backwards-compat facade
    - CONSUMER_UPDATE    # Consumers need new API
    - TYPE_MIGRATION     # Type definitions moved
    
  validation:
    - "grep for old import paths = 0"
    - "TypeScript errors = 0"
    - "All facades have @deprecated JSDoc"
```

---

## Success Criteria

### Loop Completion

- [ ] All stories in phase complete
- [ ] All pending wires resolved (count: 0)
- [ ] TypeScript errors: 0
- [ ] Build status: PASSING
- [ ] AGENTS.md updated (if trigger hit)
- [ ] CLAUDE.md updated (if trigger hit)

### Governance Health

- [ ] No orphan artifacts (SUSPECT count: 0)
- [ ] No stale artifacts (STALE count < 5)
- [ ] All cross-references valid
- [ ] Child AGENTS.md files up to date

---

## Related Documents

| Document | Purpose |
|----------|---------|
| **AGENTS.md (root)** | Primary architecture reference |
| **CLAUDE.md (root)** | Claude Code guidance |
| **bmm-workflow-status.yaml** | Overall workflow state |
| **deep-scan README** | Diagnostics module |
| **architecture-remediation README** | Remediation module |
| **design-system-8bit** | Design specifications |
| **ux-specification** | UX patterns |

---

**Module Owner**: @bmad-core-bmad-master  
**Maintainers**: @bmad-bmb-agents-module-builder, @bmad-bmb-agents-workflow-builder  
**Version**: 2.0.0  
**Last Updated**: 2026-01-05T15:30:00+07:00
