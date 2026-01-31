# BMAD-EXT Frontmatter Schema Specification

**Created**: 2026-01-15
**Version**: 1.0.0
**Purpose**: Standardized YAML frontmatter for all _bmad-ext components (modules, agents, workflows)

---

## Schema Principles

Based on Claude Code SKILL patterns and BMAD governance requirements:

1. **Concise descriptions** - Max 64 chars for `name`, 200 for `description`
2. **Version tracking** - Semantic versioning (major.minor.patch)
3. **Date at bottom** - Version metadata goes AFTER content, not before
4. **Hierarchy clarity** - Parent/child relationships explicit
5. **Context economy** - Frontmatter only loaded first, full content on demand
6. **TTL awareness** - Freshness thresholds built-in

---

## Universal Fields (Required for All Components)

### Core Identity

```yaml
---
name: "component-name"                    # Required, max 64 chars, lowercase + hyphens
description: "Brief description"          # Required, max 200 chars
version: "1.0.0"                         # Required, semantic versioning
tier: "orchestrator|module|agent|workflow"  # Required
phase: "0|2|4"                         # Optional, module phase
category: "foundation|execution|bridge"        # Optional, functional category
updated: "2026-01-15"                   # Required, ISO 8601
---
```

### Hierarchy Fields (Tier-Specific)

#### For Orchestrator (Tier 1)

```yaml
---
name: "master-orchestrator"
tier: "orchestrator"
entry_point: true                     # Required for orchestrator
integration_points:                     # Required
  reads_from:
    - "LOOP_STATE.yaml"
    - "ARTIFACT_REGISTRY.yaml"
  writes_to:
    - "LOOP_STATE.yaml"
    - "AGENTS.md"
  spawns:
    - "sprint-planning-wrapper"
    - "implementation"
children:                              # Required
  - type: "module"
    count: 4
    list:
      - "governance"
      - "arc-v2"
      - "sprint-planning-wrapper"
      - "implementation"
---
```

#### For Module (Tier 2)

```yaml
---
name: "governance"
tier: "module"
phase: "0"                              # Required for modules
status: "active|deprecated|archival"      # Required
entry_point: "/context-first"              # Required, command to invoke
wraps: "_bmad/bmm/workflows/governance" # Optional, if wrapper
integration_points:                     # Required
  reads_from:
    - "LOOP_STATE.yaml"
  writes_to:
    - "LOOP_STATE.yaml"
  invoked_by:
    - "master-orchestrator"
children:                              # Optional
  - type: "workflow"
    count: 4
    list:
      - "context-first"
      - "expert-analysis"
      - "research-trigger"
      - "correct-course"
---
```

#### For Agent (Tier 3)

```yaml
---
name: "dev-ext"
tier: "agent"
phase: "4"                              # Optional, primary module phase
status: "active"                         # Required
wraps: "_bmad/bmm/agents/dev.md"       # Required, core agent reference
parent_agent: "master-orchestrator"      # Optional, if sub-agent
integration_points:                     # Required
  receives_from:
    - "master-orchestrator"
  sends_to:
    - "master-orchestrator"
  registers_with:
    - "ARTIFACT_REGISTRY.yaml"
  coordinates_with:
    - "other-agents"
sub_agents:                           # Optional
  - count: 1
    list:
      - "tea-ext"
entry_points:                          # Required, list of commands
  - "/dev-ext"
  - "/dev-story"
---
```

#### For Workflow (Tier 4)

```yaml
---
name: "story-cycle"
tier: "workflow"
parent_module: "implementation"            # Required, containing module
entry_point: "/story-cycle"              # Required, command to invoke
depends_on:                            # Optional
  workflows: []
  modules: []
steps_count: 9                         # Required
integration_points:                     # Required
  reads_from:
    - "story file"
    - "sprint-status.yaml"
  writes_to:
    - "task-tracker.md"
    - "handoff.md"
context_requirements:                  # Optional
  - "fresh context XML"
  - "validated story file"
---
```

---

## Extended Fields (Component-Specific)

### For Governance Module

```yaml
---
name: "governance"
tier: "module"
phase: "0"
# ... core fields ...

governance_features:                   # Optional
  ttl_tiers:
    tier1:
      name: "constitution"
      ttl: "permanent"
      examples: ["CLAUDE.md", "AGENTS.md"]
    tier2:
      name: "controlled"
      ttl: "on-demand"
      examples: ["prd", "architecture.md"]
    tier3:
      name: "archival"
      ttl: "90 days"
      examples: ["scans", "research"]
    tier4:
      name: "ephemeral"
      ttl: "24 hours"
      examples: ["handoffs", "continuations"]

  triggers:
    - "on_session_start"
    - "on_artifact_creation"
    - "on_step_completion"
    - "on_story_completion"
    - "on_epic_completion"
---
```

### For Architecture Remediation

```yaml
---
name: "arc-v2"
tier: "module"
phase: "0"
# ... core fields ...

architecture_domains:                  # Optional, ARC-v2 specific
  domains: 6
  list:
    - "persistence"
    - "state"
    - "architecture"
    - "types"
    - "security"
    - "performance"
    - "ux"
    - "workspace"
    - "agents"
    - "rag"

  scanning_strategies:
    - "diagnostic-first"
    - "domain-isolation"
    - "evidence-based-remediation"
---
```

### For Sprint Planning

```yaml
---
name: "sprint-planning-wrapper"
tier: "module"
phase: "2"
# ... core fields ...

planning_features:                    # Optional
  validation_gates:
    - "cohesion-check"
    - "dependency-map"
    - "reality-validation"
    - "nonsense-detector"

  gate_rules:
    cohesion_score_minimum: 70
    max_dependency_depth: 5
    reality_demo_timeout: 30
    nonsense_threshold: 3
---
```

### For Implementation

```yaml
---
name: "implementation"
tier: "module"
phase: "4"
# ... core fields ...

implementation_features:              # Optional
  workflows:
    - "story-cycle"
    - "correct-course"

  quality_gates:
    - "typescript: 0 errors"
    - "tests: all passing"
    - "code-review: approved"
    - "documentation: updated"
---
```

---

## TTL and Freshness Fields

### For All Components

```yaml
---
name: "component-name"
tier: "module|agent|workflow"
# ... core fields ...

freshness:                            # Optional
  ttl_hours: 4                       # How long until stale
  auto_refresh: false                # Auto-rerun if stale?
  refresh_command: "/reload-component"  # Command to refresh

  keywords_for_auto_rerun:           # Words that trigger auto-rerun
    - "validation"
    - "check"
    - "verify"
    - "scan"
    - "diagnostic"
    - "investigation"
---
```

---

## Triggers and Entry Points

### Command-Based Triggers

```yaml
---
name: "component-name"
tier: "module"
# ... core fields ...

triggers:                             # Optional, list of natural language
  - "governance"
  - "self governance"
  - "context first"
  - "expert analysis"
  - "research trigger"

entry_points:                          # Required, commands that invoke this
  commands:
    - "/context-first"
    - "/expert-analysis"
    - "/research-trigger"
  aliases:
    - "/ctx-first"
    - "/exp-anal"
    - "/res-trig"
---
```

---

## Example: Complete Frontmatter

### Module Example (governance)

```yaml
---
name: "governance"
description: "Unified governance module - context, artifact lifecycle, TTL"
version: "2.1.0"
tier: "module"
phase: "0"
status: "active"
category: "foundation"
entry_point: "/context-first"
wraps: null
updated: "2026-01-15"

integration_points:
  reads_from:
    - "_bmad-ext/state/LOOP_STATE.yaml"
    - "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
    - "bmm-workflow-status.yaml"
  writes_to:
    - "_bmad-ext/state/LOOP_STATE.yaml"
    - "AGENTS.md"
    - "_bmad-output/.archive/"
  invoked_by:
    - "master-orchestrator"
    - ".claude/hooks/"

children:
  type: "workflow"
  count: 4
  list:
    - "context-first"
    - "expert-analysis"
    - "research-trigger"
    - "correct-course"

governance_features:
  ttl_tiers:
    tier1:
      name: "constitution"
      ttl: "permanent"
      examples: ["CLAUDE.md", "AGENTS.md"]
    tier2:
      name: "controlled"
      ttl: "on-demand"
      examples: ["prd", "architecture.md"]
    tier3:
      name: "archival"
      ttl: "90 days"
      examples: ["scans", "research"]
    tier4:
      name: "ephemeral"
      ttl: "24 hours"
      examples: ["handoffs", "continuations"]

  triggers:
    - "on_session_start"
    - "on_artifact_creation"
    - "on_step_completion"
    - "on_story_completion"
    - "on_epic_completion"

triggers:
  - "governance"
  - "self governance"
  - "context first"
  - "expert analysis"
  - "research trigger"

entry_points:
  commands:
    - "/context-first"
    - "/expert-analysis"
    - "/research-trigger"
    - "/correct-course"
  aliases:
    - "/ctx-first"
    - "/exp-anal"
    - "/res-trig"
---
```

### Agent Example (dev-ext)

```yaml
---
name: "dev-ext"
description: "Enhanced developer agent - orchestrations hooks, TDD"
version: "1.0.0"
tier: "agent"
phase: "4"
status: "active"
category: "execution"
wraps: "_bmad/bmm/agents/dev.md"
parent_agent: "master-orchestrator"
updated: "2026-01-15"

integration_points:
  receives_from:
    - "master-orchestrator"
  sends_to:
    - "master-orchestrator"
  registers_with:
    - "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
  coordinates_with:
    - "tea-ext"
    - "architect-ext"

sub_agents:
  count: 1
  list:
    - "tea-ext"

entry_points:
  commands:
    - "/dev-ext"
    - "/dev-story"
  aliases:
    - "/dev"
    - "/implement"

triggers:
  - "story development"
  - "bug fix"
  - "feature implementation"
  - "TDD"
  - "red-green-refactor"
---
```

### Workflow Example (story-cycle)

```yaml
---
name: "story-cycle"
description: "New feature development workflow with TDD and validation loops"
version: "2.0.0"
tier: "workflow"
parent_module: "implementation"
steps_count: 9
updated: "2026-01-15"

integration_points:
  reads_from:
    - "story file"
    - "sprint-status.yaml"
    - "context XML"
  writes_to:
    - "task-tracker.md"
    - "handoff.md"
    - "completion-report.md"

depends_on:
  workflows:
    - "validate-story"
    - "create-context"
  modules:
    - "governance"

context_requirements:
  - "fresh context XML"
  - "validated story file"
  - "CLAUDE.md (latest standards)"

triggers:
  - "story cycle"
  - "develop story"
  - "new feature"

entry_points:
  commands:
    - "/story-cycle"
    - "/dev-story"
  aliases:
    - "/story"
    - "/dev"
---
```

---

## Validation Rules

### Required Fields by Tier

| Tier | Component Type | Required Fields |
|-------|---------------|----------------|
| 1 | Orchestrator | name, description, version, tier, entry_point, integration_points, children, updated |
| 2 | Module | name, description, version, tier, phase, status, entry_point, integration_points, updated |
| 3 | Agent | name, description, version, tier, status, wraps, integration_points, entry_points, updated |
| 4 | Workflow | name, description, version, tier, parent_module, entry_point, steps_count, integration_points, updated |

### Field Validation

```yaml
validation_rules:
  name:
    max_length: 64
    pattern: "^[a-z0-9-]+$"
    examples:
      valid: ["story-cycle", "dev-ext", "governance"]
      invalid: ["Story_Cycle", "dev-ext-01", "Governance Module"]

  description:
    max_length: 200
    examples:
      valid: "Enhanced developer agent with TDD support"
      invalid: "This is a very very very long description that goes on forever"

  version:
    pattern: "^\d+\.\d+\.\d+$"
    examples:
      valid: ["1.0.0", "2.1.0", "0.0.1"]
      invalid: ["1", "v1.0", "1.0"]

  entry_point:
    must_start_with: "/"
    examples:
      valid: ["/story-cycle", "/context-first", "/dev-ext"]
      invalid: ["story-cycle", "run context-first"]
```

---

## Implementation Checklist

For each _bmad-ext component, ensure:

- [x] Frontmatter at TOP of file (before any content)
- [x] Date/version metadata at BOTTOM of file (after `---`)
- [x] All required fields present for tier
- [x] Entry points follow `/command` format
- [x] Integration points fully specified
- [x] Version uses semantic versioning (major.minor.patch)
- [x] Updated date in ISO 8601 format
- [x] Triggers use natural language forms
- [x] No hardcoded values in frontmatter (use references)

---

## Migration Guide

### Converting Existing Components

**Step 1**: Add standard frontmatter
```markdown
---
name: "existing-component"
description: "Update this with brief description"
version: "1.0.0"
tier: "module"  # Determine tier
phase: "0"      # If applicable
status: "active"
entry_point: "/command-name"
updated: "2026-01-15"

integration_points:
  reads_from: []
  writes_to: []

# Existing content continues below...
```

**Step 2**: Move version/date to bottom
```markdown
# [Content...]

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
```

**Step 3**: Validate against schema
- Check all required fields present
- Verify field lengths within limits
- Confirm entry points use `/command` format
- Test integration points are complete

---

## Context Economy Impact

### Before Schema (Current Issues)

- ❌ Frontmatter inconsistent across components
- ❌ Version/date mixed with content
- ❌ No clear hierarchy signals
- ❌ Entry points undefined
- ❌ Full content loaded unnecessarily (context waste)

### After Schema (Expected Benefits)

- ✅ Consistent frontmatter across all components
- ✅ Clear hierarchy and boundaries
- ✌ Frontmatter-only loading (context economy)
- ✌ Version/date at bottom (stale detection)
- ✅ Explicit entry points and triggers
- ✅ Full TTL/freshness awareness

---

## Related Documents

- Hierarchy Classification Map: `_bmad-output/planning-artifacts/bmad-ext-hierarchy-classification-2026-01-15.md`
- Reorganization Plan: `_bmad-output/planning-artifacts/bmad-ext-reorganization-plan-2026-01-15.md` (pending)
- Module Manifest: `_bmad-ext/MANIFEST.yaml`

---

**Schema Version**: 1.0.0
**Created**: 2026-01-15
**Next Review**: After implementation complete