# Claude Code Concept Mapping
# Mapping 2026 Claude Code concepts to BMAD architecture
# Created: 2026-01-10

---

## description

This document maps Claude Code 2026 native concepts to BMAD framework architecture, enabling the platform wrapper to translate between the two systems efficiently.

---

## 1. Skills ↔ BMAD Standards

| Claude Code Skill | BMAD Equivalent | Location | Notes |
|-------------------|-----------------|----------|-------|
| Skill frontmatter (`name`, `description`) | Standard metadata | `agent-os/standards/*/metadata.md` | Needs standardization |
| `allowed-tools` field | Tool permissions | `.claude/settings.local.json` | Already exists |
| `context: fork` | Sub-agent delegation | `.claude/agents/` | Isolated context |
| `triggers` in description | Intent patterns | `_bmad-ext/orchestrator/routing-rules.yaml` | Auto-recognition |
| Progressive disclosure files | Supporting standards | `agent-os/standards/*/reference.md` | Load-on-demand |
| `user-invocable: false` | Internal-only standards | `_bmad/internal/` | Model-only access |

### Key Insight
**Skills = Standards with auto-invocation**
- Skills are just markdown files with YAML frontmatter
- The `description` field is CRITICAL - it's how Claude decides when to use the skill
- BMAD standards can become Skills by adding proper frontmatter

### Migration Path
```yaml
# Current BMAD standard (agent-os/standards/backend/api.md)
# No frontmatter, just content

# Target: Convert to Skill format
---
name: backend-api
description: Design RESTful API endpoints following OpenAPI 3.1 specification. Use when creating server functions, API routes, or HTTP handlers.
triggers:
  - "api endpoint"
  - "rest api"
  - "server function"
  - "http handler"
allowed-tools:
  - Edit
  - Read
  - Bash(pnpm exec tsc:*)
---

# Original content follows...
```

---

## 2. Hooks ↔ BMAD Events

| Claude Code Hook | BMAD Event Equivalent | description | Current Status |
|------------------|----------------------|---------|----------------|
| `SessionStart` | Loop initialization | Load config, verify state | ✅ Implemented |
| `SessionEnd` | Loop termination | Cleanup, state save | ❌ Missing |
| `UserPromptSubmit` | Input validation | Enrich context, validate | ❌ Missing |
| `PreToolUse` | Pre-execution check | Permission, safety | ❌ Missing |
| `PostToolUse` | Post-execution audit | Logging, handoff trigger | ❌ Missing |
| `Stop` | Exit guard | Prevent data loss | ⚠️ Partial |
| `PermissionRequest` | Gatekeeper | Authorize destructive actions | ❌ Missing |

### Hook Architecture for BMAD

```yaml
# .claude/hooks/session-start.yaml
name: session-start
description: Initialize BMAD context at session start
triggers:
  - on: SessionStart
    priority: 1
steps:
  1. Load _bmad/core/config.yaml
  2. Read LOOP_STATE-child.yaml
  3. Verify anchor artifact exists
  4. Check staleness (4h threshold)
  5. If stale → prompt user before proceeding
```

```yaml
# .claude/hooks/user-prompt-submit.yaml
name: user-prompt-submit
description: Validate and enrich user input before processing
triggers:
  - on: UserPromptSubmit
    priority: 2
steps:
  1. Check context threshold (65%)
  2. If approaching limit → generate continuation capsule
  3. Extract user intent keywords
  4. Match against routing-rules.yaml
  5. Pre-load relevant standards
```

### Implementation Strategy
1. Create `.claude/hooks/` directory
2. Define hook YAML specifications
3. Use existing `settings.local.json` permissions as gatekeeper
4. Hook output integrates with AGENT-COORDINATOR routing

---

## 3. Sub-agents ↔ BMAD Enhanced Agents

| Claude Code Sub-agent | BMAD Enhanced Agent | Mapping |
|----------------------|---------------------|---------|
| YAML frontmatter | Agent metadata | Standardize format |
| `skills` field | Standard injection | Already defined in SKILLS_MANIFEST |
| Separate context | Isolated execution | Core principle |
| Tool restrictions | Agent capabilities | Define per agent |

### Sub-agent Frontmatter Template

```yaml
# .claude/agents/bmad-dev.md
---
name: bmad-dev
description: BMAD Development Agent - implements features following Clean Architecture and 8-bit design
category: implementation
priority: 50
skills:
  - backend-api
  - frontend-components
  - global-coding-style
  - testing-test-writing
context: fork  # Runs in isolated context
agent: general-description  # Default sub-agent type
allowed-tools:
  - Edit
  - Read
  - Bash(pnpm exec tsc:*)
  - Bash(pnpm exec vitest run:*)
hooks:
  PreToolUse:
    - matcher: "Edit"
      hook: verify-protected-path
  PostToolUse:
    - matcher: "*"
      hook: log-action
---
```

### Key Enhancement
**Skills field injects full skill content at sub-agent startup**
- This is different from Skills being auto-invoked
- Sub-agents get their skills pre-loaded in context
- Enables "specialist" agents with baked-in knowledge

---

## 4. Commands (Slash) ↔ BMAD Workflows

| Claude Code Command | BMAD Workflow | Location Pattern |
|---------------------|---------------|------------------|
| `/command-name` | `workflow.md` | `.claude/commands/{name}.md` |
| `$ARGUMENTS` keyword | Workflow parameters | Pass through |
| Explicit invocation | Direct load | User types `/` |

### Current Problems
1. **Too many small files** - 100+ 5-line redirect files
2. **Inconsistent paths** - `bmad/core/workflows/` vs `_bmad/workflows/`
3. **Duplicate content** - Some commands inline full workflows
4. **No hierarchy** - Flat structure, hard to navigate

### Solution: Command Consolidation

```yaml
# .claude/commands/index.yaml
# Single registry instead of 100+ files

commands:
  # BMAD Core Commands (high priority)
  - id: bmad-master
    path: _bmad/core/agents/bmad-master.md
    shorthand: /bm
    description: Load BMAD master orchestrator

  - id: asgl
    path: _bmad/modules/asgl/workflows/main-loop.md
    shorthand: /loop
    description: Start autonomous sprint loop

  # BMM Commands (medium priority)
  - id: dev-story
    path: _bmad/bmm/workflows/dev-story.md
    shorthand: /dev
    description: Implement a user story

  # ADO Commands (low priority)
  - id: ado
    path: .claude/commands/ado.md
    shorthand: /ado
    description: ADO coordinator

# Hierarchical grouping for / menu
groups:
  core: [bmad-master, asgl]
  bmm: [dev-story, code-review, create-story]
  ado: [ado, ado-research, ado-planning]
  utils: [status, help, clear]
```

---

## 5. Token Efficiency Strategies

### Progressive Disclosure Pattern

```
SKILL.md (frontmatter only)
    ↓
When invoked → Load SKILL.md content
    ↓
When needed → Load supporting files
```

### BMAD File Size Targets

| File Type | Current | Target | Strategy |
|-----------|---------|--------|----------|
| Agent files | 50-237 lines | <150 lines | Split behaviors, use references |
| Commands | 5-548 lines | <100 lines | Reference workflows, don't inline |
| Skills | N/A | <200 lines | Progressive disclosure |
| Workflows | N/A | <300 lines | Modular steps |

### Context Loading Priority

1. **Always load first** (Tier 1):
   - `CLAUDE.md` (project instructions)
   - `AGENT-COORDINATOR.md` (routing logic)
   - `_bmad/core/config.yaml` (BMAD config)

2. **Load on match** (Tier 2):
   - Skill frontmatter (all skills)
   - LOOP_STATE files
   - Sprint status

3. **Load on invocation** (Tier 3):
   - Full skill content
   - Workflow steps
   - Agent personas

4. **Load explicitly** (Tier 4):
   - Reference documentation
   - Examples and patterns
   - Historical artifacts

---

## 6. Frontmatter Path Routing

### Concept
Claude Code uses frontmatter metadata to determine:
1. **When to invoke** (description matching)
2. **How to invoke** (context: fork, agent type)
3. **What tools allowed** (allowed-tools)
4. **What hooks fire** (hooks field)

### BMAD Routing Enhancement

```yaml
# Standard frontmatter for all BMAD files
---
_bmad:
  version: 6.0.0
  type: [agent|workflow|skill|standard]
  module: [core|bmm|cis|asgl|architecture-remediation]

# Claude Code native fields
name: {identifier}
description: {trigger-rich description}
category: {category}
priority: {1-100}
triggers: [keyword list]

# Execution control
context: [fork|current]
agent: [general-description|Explore|Plan|custom]
skills: [skill list]
allowed-tools: [tool list]

# Lifecycle hooks
hooks:
  PreToolUse: [hook definitions]
  PostToolUse: [hook definitions]
  Stop: [hook definitions]

# Visibility
user-invocable: [true|false]
disable-model-invocation: [true|false]
---
```

---

## 7. Consolidation Targets

### Current → Target Mapping

| Current State | Line Count | Target State | Reduction |
|---------------|------------|--------------|-----------|
| `.claude/commands/` (100+ files) | ~4,500 | `.claude/commands/index.yaml` | 90% |
| `.claude/agents/` (scattered) | ~2,000 | `.claude/agents/` (consolidated) | 50% |
| `.claude/skills/` (flat) | ~1,500 | Hierarchical with manifest | 30% |
| `_bmad/workflows/` (custom) | ~3,000 | Standardized format | 40% |

---

## 8. Implementation Phases

### Phase 4.1: Skills Standardization
- Add frontmatter to all agent-os standards
- Create hierarchical skill index
- Implement progressive disclosure

### Phase 4.2: Hooks Implementation
- Define hook YAML specifications
- Create `.claude/hooks/` directory
- Integrate with session lifecycle

### Phase 4.3: Commands Consolidation
- Create `commands/index.yaml`
- Remove 5-line redirect files
- Implement hierarchical menu

### Phase 4.4: Agents Unification
- Standardize agent frontmatter
- Consolidate scattered agents
- Link agents to skills via manifest

---

## 9. Auto-Recognition Patterns

### Description Writing Guidelines

**Bad:**
```yaml
description: "Helps with development tasks"
```

**Good:**
```yaml
description: "Implement user stories following TDD, Clean Architecture, and 8-bit design principles. Use when user says: implement, develop, code, write feature, build story."
```

### Trigger Keywords Database

```yaml
triggers:
  implementation:
    - implement
    - develop
    - code
    - write
    - build
    - create feature

  analysis:
    - analyze
    - review
    - audit
    - assess
    - diagnose

  planning:
    - plan
    - design
    - architect
    - spec
    - estimate

  testing:
    - test
    - validate
    - verify
    - check
    - assert
```

---

## Summary

| Concept | Claude Code | BMAD Current | BMAD Target |
|---------|-------------|--------------|-------------|
| Skills | Auto-invoked knowledge | Standards (passive) | Active Skills with frontmatter |
| Hooks | Event-driven actions | SessionStart only | Full hook lifecycle |
| Sub-agents | Isolated contexts | Agents (no isolation) | Forked execution |
| Commands | Explicit workflows | 100+ scattered files | Single index |
| Token efficiency | Progressive disclosure | Inline everything | Load-on-demand |

**Key Principle:** BMAD should leverage Claude Code's native mechanisms rather than building parallel systems.

---

**Version:** 1.0.0
**Created:** 2026-01-10
**Next:** [platform-wrapper-spec.md](platform-wrapper-spec.md)
