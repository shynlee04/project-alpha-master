# BMAD-EXT Hierarchy Classification Map

**Created**: 2026-01-15
**Version**: 1.0.0
**Purpose**: Complete classification of all _bmad-ext agents, workflows, and modules with clear hierarchy and boundaries

---

## Executive Summary

This document provides a complete classification of all _bmad-ext components organized into a clear hierarchy with:
- **4 Tiers** of organization (Orchestrator → Modules → Agents → Workflows)
- **Clear boundaries** between components
- **Entry points** for each level
- **Missing wrappers** identified from BMAD core
- **Context economy** rules for loading

---

## Tier 1: Master Orchestrator (Single Entry Point)

### Component: `master-orchestrator`

**Location**: `_bmad-ext/orchestrator/master-orchestrator.md`

**Role**: Central brain that coordinates all autonomous development

**Entry Point**: `/bmad-master` or `/asgl`

**Responsibilities**:
- Load LOOP_STATE and verify anchor freshness
- Route to Sprint-Planning Wrapper first (cohesion/reality validation)
- Delegate to enhanced agents via handoff artifacts
- Receive callbacks and update governance
- Decide continue/stop

**Direct Children**:
- `sprint-planning-wrapper` (Phase 2)
- Enhanced agents (via delegation)

**Context Loading**:
- Frontmatter only (lightweight)
- Full content on demand (hop-reading)

---

## Tier 2: Modules (Phase-Based Organization)

### Module 1: Governance (Phase 0 - Foundation)

**Location**: `_bmad-ext/modules/governance/`

**Status**: ✅ ACTIVE v2.1

**Entry Point**: `/ext-governance` or `/correct-course`

**Purpose**: Self-governance, artifact lifecycle, context filtering

**Components**:
```
governance/
├── MODULE.md                          # Module definition
├── config/
│   ├── domains.yaml                   # 13 domain classifications
│   ├── retention-policy.yaml          # TTL rules
│   └── gating-rules.yaml              # Gatekeeping rules
├── policies/
│   ├── artifact-lifecycle.md          # Creation → archive → purge
│   ├── context-strategy.md            # Context filtering
│   └── gating-policy.md               # Pre-work validation
├── scanners/
│   ├── artifact-scanner.md            # Stale detection
│   └── context-scanner.md             # Context freshness
└── workflows/
    ├── context-first/                 # Context gathering workflow
    ├── expert-analysis/               # Expert code analysis
    ├── research-trigger/              # Internet-based research
    └── correct-course/                # Recovery workflow
```

**Integration Points**:
- Reads: LOOP_STATE, ARTIFACT_REGISTRY, bmm-workflow-status
- Writes: LOOP_STATE, AGENTS.md, _bmad-output/.archive/
- Invoked by: master-orchestrator, hooks, enhanced agents

**Missing Wrappers**: None (complete)

---

### Module 2: Architecture Remediation v2 (Phase 0 - Special)

**Location**: `_bmad-ext/modules/arc-v2/`

**Status**: ✅ ACTIVE v2.0

**Entry Point**: `/ext-arc` or `/diagnostic-first`

**Purpose**: Diagnostic-first architecture remediation

**Components**:
```
arc-v2/
├── MODULE.md                          # Module definition
├── agents/
│   ├── context-validator.md           # Session validation
│   ├── domain-scanner.md              # 6-domain scanning
│   ├── store-refactorer.md            # Zustand store splitting
│   ├── component-splitter.md          # React component splitting
│   └── typescript-fixer.md            # TypeScript error fixing
├── scanners/
│   ├── persistence-scan.md            # Persistence layer
│   ├── state-scan.md                  # State management
│   ├── architecture-scan.md           # Architecture violations
│   ├── types-scan.md                  # TypeScript issues
│   └── ux-scan.md                     # UX violations
└── workflows/
    └── diagnostic-first.md            # 7-step diagnostic workflow
```

**Integration Points**:
- Reads: LOOP_STATE, ARTIFACT_REGISTRY, routing-rules
- Writes: Scan results, remediation plans, LOOP_STATE
- Invoked by: master-orchestrator (architectural conflicts)

**Missing Wrappers**: None (complete)

---

### Module 3: Sprint-Planning Wrapper (Phase 2)

**Location**: `_bmad-ext/modules/sprint-planning-wrapper/`

**Status**: ✅ ACTIVE v1.0

**Entry Point**: `/ext-sprint` or `/sprint-planning`

**Purpose**: Enhanced sprint planning with cohesion & reality validation

**Components**:
```
sprint-planning-wrapper/
├── MODULE.md                          # Module definition
├── config/
│   ├── cohesion-patterns.yaml         # Cohesion detection
│   └── gating-rules.yaml              # Sprint gatekeeping
├── scanners/
│   ├── cohesion-scanner.md            # UX cohesion validation
│   ├── dependency-scanner.md          # Cross-story dependencies
│   └── nonsense-detector.md           # 30-second demo test
└── workflows/
    └── sprint-planning-enhanced/      # 7-step enhanced workflow
```

**Integration Points**:
- Reads: BMAD sprint-planning, epics, story files
- Writes: Sprint status, cohesion report, dependency map
- Hands off to: implementation/story-cycle

**Missing Wrappers**: None (complete)

---

### Module 4: Implementation (Phase 4)

**Location**: `_bmad-ext/modules/implementation/`

**Status**: ✅ ACTIVE v1.0

**Entry Point**: `/ext-implementation` or `/story-cycle`

**Purpose**: Story execution and bug fix workflows

**Components**:
```
implementation/
├── MODULE.md                          # Module definition
├── config/
│   ├── agent-tool-spec-template.yaml  # Tool specification
│   └── journey-validation-rules.yaml  # UX validation
├── templates/
│   ├── enhanced-story-context.xml     # Context template
│   └── enhanced-story.md              # Story template
└── workflows/
    ├── story-cycle/                   # New feature development
    │   ├── steps/                     # 9 steps
    │   └── workflow.md
    └── correct-course/                # Bug fixes
        ├── steps/                     # 4 steps
        └── workflow.md
```

**Integration Points**:
- Reads: Sprint status, governance report, story files
- Writes: Sprint status, story completion
- Receives from: sprint-planning-wrapper, governance

**Missing Wrappers**: None (complete)

---

### Module 5: BMAD Core Workflows (NEW - Missing Wrappers)

**Location**: `_bmad-ext/modules/bmad-core/` (TO BE CREATED)

**Status**: ❌ MISSING - Needs creation

**Purpose**: Wrappers for BMAD core workflows that lack extension layer integration

**Missing Wrappers** (from `_bmad/bmm/workflows/`):

| BMAD Core Workflow | Wrapper Status | Priority |
|-------------------|----------------|----------|
| `brainstorming` | ❌ MISSING | HIGH |
| `party-mode` | ❌ MISSING | MEDIUM |
| `create-product-brief` | ❌ MISSING | HIGH |
| `prd` | ❌ MISSING | HIGH |
| `create-architecture` | ❌ MISSING | HIGH |
| `create-epics-and-stories` | ❌ MISSING | HIGH |
| `code-review` | ✅ EXISTS (in implementation) | - |
| `retrospective` | ✅ EXISTS (in story-cycle) | - |
| `correct-course` | ✅ EXISTS (in governance) | - |

**Proposed Structure**:
```
bmad-core/
├── MODULE.md                          # Module definition
├── workflows/
│   ├── brainstorming/                 # Creative brainstorming
│   │   ├── workflow.md
│   │   └── steps/
│   ├── party-mode/                    # Multi-agent discussion
│   │   ├── workflow.md
│   │   └── steps/
│   ├── create-product-brief/          # Product brief creation
│   │   ├── workflow.md
│   │   └── steps/
│   ├── prd/                           # PRD creation
│   │   ├── workflow.md
│   │   └── steps/
│   ├── create-architecture/           # Architecture design
│   │   ├── workflow.md
│   │   └── steps/
│   └── create-epics-and-stories/      # Epic/story creation
│       ├── workflow.md
│       └── steps/
```

**Entry Points**:
- `/ext-brainstorm` → brainstorming
- `/ext-party` → party-mode
- `/ext-brief` → create-product-brief
- `/ext-prd` → prd
- `/ext-arch` → create-architecture
- `/ext-epics` → create-epics-and-stories

---

## Tier 3: Enhanced Agents (Main Agents)

### Agent Hierarchy (7 Main Agents + 1 Shared Service)

| ID | Agent | Wrapped From | Sub-Agents | Status |
|----|-------|--------------|------------|--------|
| MA-01 | dev-ext | `_bmad/bmm/agents/dev.md` | tea-ext | ✅ ACTIVE |
| MA-02 | architect-ext | `_bmad/bmm/agents/architect.md` | - | ✅ ACTIVE |
| MA-03 | analyst-ext | `_bmad/bmm/agents/analyst.md` | - | ✅ ACTIVE |
| MA-04 | product-management-ext | pm-ext + sm-ext | pm, sm | ✅ ACTIVE |
| MA-05 | ux-designer-ext | `_bmad/bmm/agents/ux-designer.md` | - | ✅ ACTIVE |
| MA-06 | tech-writer-ext | `_bmad/bmm/agents/tech-writer.md` | - | ✅ ACTIVE |
| MA-07 | remediation-ext | `_bmad/modules/quality/` | store-refactorer, component-splitter, typescript-fixer | ✅ ACTIVE |
| SS-01 | quality-scanner | Shared service | - | ✅ ACTIVE |

**Agent Locations**:
- Main agents: `_bmad-ext/agents/{agent-name}.md`
- Sub-agents: `_bmad-ext/agents/{parent-name}/{sub-agent-name}.md`
- Shared services: `_bmad-ext/shared-services/{service-name}.md`

**Entry Points**:
- Direct invocation: `/dev-ext`, `/architect-ext`, etc.
- Via orchestrator: automatic delegation

---

## Tier 4: Workflows (Execution Units)

### Workflow Classification

All workflows follow this structure:

```
{module}/workflows/{workflow-name}/
├── workflow.md                        # Main workflow definition
├── steps/                             # Individual steps
│   ├── step-01-{name}.md
│   ├── step-02-{name}.md
│   └── ...
└── config/                            # Workflow-specific config
    └── {workflow}-config.yaml
```

### Workflow Entry Points

| Module | Workflow | Entry Point | Trigger |
|--------|----------|-------------|---------|
| governance | context-first | `/context-first` | "context first", "gather context" |
| governance | expert-analysis | `/expert-analysis` | "expert analysis", "analyze code" |
| governance | research-trigger | `/research-trigger` | "research", "validate tech" |
| governance | correct-course | `/correct-course` | "correct course", "recovery" |
| arc-v2 | diagnostic-first | `/diagnostic-first` | "diagnostic", "scan architecture" |
| sprint-planning-wrapper | sprint-planning-enhanced | `/sprint-planning` | "sprint planning" |
| implementation | story-cycle | `/story-cycle` | "story cycle", "develop story" |
| implementation | correct-course | `/correct-course` | "bug fix", "remediation" |
| bmad-core | brainstorming | `/brainstorm` | "brainstorm", "ideas" |
| bmad-core | party-mode | `/party-mode` | "party mode", "multi-agent" |
| bmad-core | create-product-brief | `/product-brief` | "product brief" |
| bmad-core | prd | `/prd` | "prd", "requirements" |
| bmad-core | create-architecture | `/architecture` | "architecture", "design system" |
| bmad-core | create-epics-and-stories | `/epics` | "epics", "stories" |

---

## Context Economy Rules

### Loading Strategy

**Rule 1: Frontmatter-First Loading**
```yaml
# Always load frontmatter first (lightweight)
Load: "{component}/MODULE.md" or "{component}.md"
Extract:
  - name
  - description
  - version
  - phase
  - entry_point
  - integration_points

# Only load full content if needed
If: "need_detailed_info"
  Load: "{component}/full-content.md"
```

**Rule 2: Hop-Reading for Workflows**
```yaml
# Load workflow frontmatter
Load: "{module}/workflows/{workflow}/workflow.md"
Extract:
  - steps[]
  - dependencies[]
  - integration_points

# Load steps on-demand (one at a time)
For: step in steps
  Load: "{module}/workflows/{workflow}/steps/{step}"
  Execute: step instructions
  Update: LOOP_STATE
  Continue: next step
```

**Rule 3: TTL-Based Caching**
```yaml
# Cache frontmatter for 24 hours
frontmatter_ttl: 24h

# Cache workflow definitions for 4 hours
workflow_ttl: 4h

# Never cache step content (always fresh)
step_ttl: 0h
```

### Stale Context Prevention

**Rule 1: Date/Version at Bottom**
```markdown
# Component Name

[Content...]

---
**Version**: 1.0.0
**Last Updated**: 2026-01-15
```

**Rule 2: Frontmatter for Metadata**
```yaml
---
name: "component-name"
description: "Brief description (max 64 chars)"
version: "1.0.0"
phase: "0|2|4"
tier: "orchestrator|module|agent|workflow"
entry_point: "/command-name"
updated: "2026-01-15"
---
```

**Rule 3: TTL Enforcement**
```yaml
# Check freshness before loading
If: (NOW() - file_mtime) > ttl_hours
  Action: "prompt_user"
  Message: "Artifact is {age} hours old. Refresh?"
  On_Continue: "reload_from_source"
  On_Skip: "use_cached_version"
```

---

## Missing Components Summary

### High Priority (Create Immediately)

1. **`_bmad-ext/modules/bmad-core/`** - Wrappers for core workflows
   - brainstorming
   - create-product-brief
   - prd
   - create-architecture
   - create-epics-and-stories

### Medium Priority (Create Soon)

2. **`_bmad-ext/modules/bmad-core/workflows/party-mode/`** - Multi-agent discussion

### Low Priority (Optional)

3. **Additional sub-agents** for main agents as needed

---

## Integration Matrix

### Module → Module Dependencies

| Module | Depends On | Required By |
|--------|------------|-------------|
| governance | None | All modules |
| arc-v2 | governance | implementation (architectural) |
| sprint-planning-wrapper | governance | implementation |
| implementation | governance + sprint-planning | None (final) |
| bmad-core | governance | orchestrator (direct invocation) |

### Agent → Module Mapping

| Agent | Primary Module | Secondary Modules |
|-------|----------------|-------------------|
| dev-ext | implementation | governance (correct-course) |
| architect-ext | bmad-core | arc-v2 (remediation) |
| analyst-ext | bmad-core | governance (research-trigger) |
| product-management-ext | sprint-planning-wrapper | bmad-core (epics) |
| ux-designer-ext | bmad-core | governance (context-first) |
| tech-writer-ext | bmad-core | implementation (docs) |
| remediation-ext | arc-v2 | governance (correct-course) |

---

## Next Steps

1. ✅ Create hierarchy classification map (this document)
2. ⏳ Design YAML frontmatter schema
3. ⏳ Create reorganization plan
4. ⏳ Generate refactoring artifacts
5. ⏳ Implement missing wrappers (bmad-core module)
6. ⏳ Update all components with new frontmatter
7. ⏳ Test context economy rules

---

**Document Version**: 1.0.0
**Created**: 2026-01-15
**Next Review**: After implementation of missing wrappers