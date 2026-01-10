# Platform Wrapper Specification
# Claude Code Platform Wrapper for BMAD v6
# Created: 2026-01-10

---

## Overview

The platform wrapper translates between Claude Code's native mechanisms (Skills, Hooks, Sub-agents, Commands) and BMAD's framework architecture. It acts as an adapter layer, enabling BMAD to leverage Claude Code's features while maintaining framework independence.

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Claude Code Native Layer                     │
│  (Skills, Hooks, Sub-agents, Commands, MCP, Sessions)            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BMAD Platform Wrapper                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Skill       │  │   Hook       │  │  Command     │           │
│  │  Adapter     │  │   Adapter    │  │  Router      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BMAD Framework Layer                       │
│  (_bmad/core, _bmad/bmm, _bmad/modules/, _bmad-ext/)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Skill Adapter

### Purpose
Convert BMAD standards into Claude Code Skills with proper frontmatter and auto-invocation.

### File Structure

```
.claude/skills/
├── bmad-core/                    # BMAD orchestration skills
│   ├── SKILL.md                  # Main skill (orchestrator loading)
│   ├── asgl.md                   # ASGL loop skill
│   └── governance.md             # Governance enforcement
├── bmm-standards/                # BMM framework standards
│   ├── SKILL.md                  # BMM skill index
│   ├── backend-api/              # API design skill
│   │   ├── SKILL.md
│   │   ├── reference.md          # Load on demand
│   │   └── examples.md           # Load on demand
│   ├── frontend-components/      # UI components skill
│   └── testing/                  # Test writing skill
├── agent-os/                     # Agent OS standards
│   ├── SKILL.md                  # Standards index
│   └── (mapped to agent-os/standards/*)
└── SKILLS_MANIFEST.yaml          # Hierarchical skill registry
```

### Frontmatter Template

```yaml
---
# BMAD Skill Metadata
_bmad:
  type: standard
  module: bmm
  version: 6.0.0
  priority: 30

# Claude Code Skill Metadata
name: backend-api
description: |
  Design and implement RESTful API endpoints following OpenAPI 3.1 specification.

  Use this skill when:
  - Creating server functions or API routes
  - Designing HTTP handlers
  - Implementing endpoint contracts
  - User mentions: "api", "endpoint", "server", "route", "handler"

triggers:
  - api endpoint
  - rest api
  - server function
  - http handler
  - create route

# Execution Control
category: backend
priority: 30
allowed-tools:
  - Edit
  - Read
  - Bash(pnpm exec tsc:*)
user-invocable: true

# Progressive Disclosure
see_also:
  - reference.md
  - examples.md
---

# Backend API Design Standard

## Quick Start

[Essential instructions here - 50-100 lines max]

## Additional Resources

- For complete API reference, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)

## BMAD Integration

_source: _bmad/bmm/standards/backend/api.md
_updated: 2026-01-10
```

### Auto-Recognition Algorithm

```
1. User submits request
2. Claude reads all skill frontmatter (name + description only)
3. Calculate relevance score:
   - Exact trigger match: 100 points
   - Partial keyword match: 50 points
   - Semantic similarity: 25 points
4. If score > threshold → load full skill content
5. If supporting files referenced → load on-demand
```

---

## 3. Hook Adapter

### Purpose
Map BMAD events to Claude Code hooks for session lifecycle management.

### Hook Definitions

```yaml
# .claude/hooks/session-start.yaml
---
name: bmad-session-init
description: Initialize BMAD framework at session start
when: SessionStart
priority: 1
once: false
---

# BMAD Session Initialization

## Steps

1. **Load Configuration**
   ```bash
   Read: _bmad/core/config.yaml
   ```

2. **Read Loop State**
   ```bash
   Read: .claude/LOOP_STATE-child.yaml
   ```

3. **Verify Anchor**
   - Check if anchor artifact exists
   - Verify timestamp (< 4 hours old for active stories)

4. **Check Staleness**
   - If artifact > 4 hours old → prompt user
   - Offer to re-run validation workflow

5. **Set Session Context**
   - Store user_name from config
   - Store communication_language
   - Initialize session tracking

## Output

Session state loaded into context. Ready for user interaction.
```

```yaml
# .claude/hooks/user-prompt-submit.yaml
---
name: bmad-input-enrichment
description: Enrich user input with BMAD context before processing
when: UserPromptSubmit
priority: 2
once: false
---

# BMAD Input Enrichment

## Steps

1. **Check Context Threshold**
   - If context > 65% → generate continuation capsule
   - Block new requests until capsule created

2. **Extract User Intent**
   - Parse keywords from user message
   - Match against routing-rules.yaml

3. **Pre-load Standards**
   - Based on intent, load relevant skill frontmatter
   - Don't load full content until needed

4. **Check Protected Paths**
   - If edit attempt on protected path → verify permission
   - Core governance files require explicit confirmation

## Output

Enriched context with relevant standards and routing information.
```

```yaml
# .claude/hooks/pre-tool-use.yaml
---
name: bmad-tool-guard
description: Validate tool usage against BMAD rules
when: PreToolUse
priority: 3
once: false
matcher: "Edit|Write|Bash"
---

# BMAD Tool Guard

## Validation Rules

1. **Protected Paths Check**
   - CLAUDE.md: requires confirmation
   - AGENTS.md: requires governance update
   - LOOP_STATE-*.yaml: requires loop awareness

2. **Coding Standards Check**
   - If Edit on .ts/.tsx: pre-load frontend skill
   - If Edit on .sql: pre-load backend query skill

3. **Test Coverage Check**
   - If implementing feature: verify tests exist
   - If no tests: suggest TDD approach

## Output

Tool use validated or blocked with explanation.
```

```yaml
# .claude/hooks/post-tool-use.yaml
---
name: bmad-action-logger
description: Log actions for handoff detection and governance
when: PostToolUse
priority: 1
once: false
---

# BMAD Action Logger

## Logging

1. **Track File Modifications**
   - Log edited files
   - Detect pattern changes (e.g., multiple agent files)

2. **Handoff Detection**
   - If pattern indicates handoff needed → prompt user
   - Example: After implementing feature → suggest code review

3. **Governance Check**
   - After editing governance file → suggest AGENTS.md update
   - After completing story → update sprint status

## Output

Action log for session summary and handoff detection.
```

```yaml
# .claude/hooks/stop.yaml
---
name: bmad-exit-guard
description: Prevent data loss on session exit
when: Stop
priority: 1
once: false
---

# BMAD Exit Guard

## Exit Checks

1. **Unsaved Changes**
   - Check for uncommitted edits
   - Prompt for commit if needed

2. **Active Loop**
   - If Ralph Loop active → warn user
   - Offer to pause before exit

3. **Session State**
   - Save AGENT-STATE.yaml
   - Generate continuation prompt if needed

## Output

Safe session termination with state preserved.
```

### Hook Installation

```bash
# Hooks are auto-discovered from .claude/hooks/*.yaml
# No manual registration required

# Hook order determined by priority field
# Lower number = higher priority (executes first)
```

---

## 4. Command Router

### Purpose
Replace scattered `.claude/commands/` files with a single hierarchical index.

### Command Index Structure

```yaml
# .claude/commands/index.yaml
---
version: 6.0.0
description: BMAD Command Registry - Hierarchical routing for slash commands
---

# =============================================================================
# COMMAND REGISTRY
# =============================================================================

commands:
  # ═════════════════════════════════════════════════════════════════════
  # CORE COMMANDS (Highest Priority)
  # ═════════════════════════════════════════════════════════════════════
  - id: bmad-master
    name: BMAD Master
    shorthand: /bm
    path: _bmad/core/agents/bmad-master.md
    description: Load BMAD master orchestrator for autonomous development
    category: core
    priority: 1
    args:
      - name: mode
        description: "auto" or "interactive"
        required: false

  - id: asgl
    name: ASGL Loop
    shorthand: /loop
    path: _bmad/modules/asgl/workflows/main-loop.md
    description: Start Autonomous Sprint Governance Loop
    category: core
    priority: 2

  - id: workflow-builder
    name: Workflow Builder
    shorthand: /wb
    path: _bmad/bmb/agents/workflow-builder.md
    description: Create and manage BMAD workflows
    category: bmm
    priority: 10

  # ═════════════════════════════════════════════════════════════════════
  # BMM COMMANDS
  # ═════════════════════════════════════════════════════════════════════
  - id: dev-story
    name: Develop Story
    shorthand: /dev
    path: _bmad/bmm/workflows/dev-story.md
    description: Implement a user story with TDD
    category: bmm
    priority: 20
    args:
      - name: story_id
        description: Story identifier
        required: true

  - id: code-review
    name: Code Review
    shorthand: /review
    path: _bmad/bmm/workflows/code-review.md
    description: Review code changes
    category: bmm
    priority: 21

  - id: create-story
    name: Create Story
    shorthand: /story
    path: _bmad/bmm/workflows/create-story.md
    description: Generate user story from requirements
    category: bmm
    priority: 22

  # ═════════════════════════════════════════════════════════════════════
  # ADO COMMANDS
  # ═════════════════════════════════════════════════════════════════════
  - id: ado
    name: ADO Coordinator
    shorthand: /ado
    path: .claude/commands/ado.md
    description: Agentic Development Orchestrator
    category: ado
    priority: 30

  - id: ado-research
    name: ADO Research
    shorthand: /research
    path: .claude/commands/ado-research.md
    description: Execute MCP research queries
    category: ado
    priority: 31

  - id: ado-planning
    name: ADO Planning
    shorthand: /plan
    path: .claude/commands/ado-planning.md
    description: Create technical plans
    category: ado
    priority: 32

  # ═════════════════════════════════════════════════════════════════════
  # UTILITY COMMANDS
  # ═════════════════════════════════════════════════════════════════════
  - id: status
    name: Status
    shorthand: /status
    builtin: true
    description: Show current sprint and workflow status
    category: utils
    priority: 90

  - id: help
    name: Help
    shorthand: /help
    builtin: true
    description: Show available commands
    category: utils
    priority: 91

  - id: clear
    name: Clear
    shorthand: /clear
    builtin: true
    description: Reset conversation context
    category: utils
    priority: 92

# =============================================================================
# COMMAND GROUPS (for / menu display)
# =============================================================================

groups:
  core:
    name: "BMAD Core"
    commands: [bmad-master, asgl]
    icon: "🔄"

  bmm:
    name: "Development"
    commands: [dev-story, code-review, create-story]
    icon: "💻"

  ado:
    name: "ADO"
    commands: [ado, ado-research, ado-planning]
    icon: "🔬"

  utils:
    name: "Utilities"
    commands: [status, help, clear]
    icon: "🛠️"

# =============================================================================
# FUZZY MATCHING PATTERNS
# =============================================================================

aliases:
  bmad-master: [bm, master, orchestrator, bmad]
  asgl: [loop, sprint, autonomous, ralph]
  dev-story: [dev, implement, develop, code]
  code-review: [review, cr, pr-review]
  ado: [ado-coordinator, research-driven]
  status: [sitrep, state, current]
```

### Command Loading Flow

```
1. User types /
2. Load .claude/commands/index.yaml (frontmatter + structure only)
3. Display groups in priority order
4. User selects command
5. Load full command content from path
6. Execute with $ARGUMENTS substituted
```

---

## 5. Agent Unification

### Purpose
Standardize agent definitions across BMAD with consistent frontmatter.

### Agent Template

```yaml
---
# BMAD Agent Metadata
_bmad:
  type: agent
  module: bmm
  version: 6.0.0

# Claude Code Sub-agent Metadata
name: bmad-dev
description: |
  BMAD Development Agent - implements features following Clean Architecture,
  8-bit design, and TDD principles.

  Delegates to this agent when:
  - Implementing user stories
  - Writing feature code
  - Creating components or API endpoints
  - User mentions: "implement", "develop", "code", "write"

triggers:
  - implement story
  - develop feature
  - write code
  - create component

# Execution
category: implementation
priority: 50
context: fork  # Run in isolated context
agent: general-purpose

# Skills (pre-loaded at agent startup)
skills:
  - backend-api
  - frontend-components
  - global-coding-style
  - testing-test-writing
  - global-error-handling

# Tools
allowed-tools:
  - Edit
  - Read
  - Write
  - Bash(pnpm exec tsc:*)
  - Bash(pnpm exec vitest run:*)
  - Skill(testing-test-writing)

# Hooks
hooks:
  PreToolUse:
    - matcher: "Edit"
      hook: verify-coding-standards
    - matcher: "Write"
      hook: verify-not-protected
  PostToolUse:
    - matcher: "Edit|Write"
      hook: update-sprint-status

# Visibility
user-invocable: true
---

# BMAD Development Agent

> Clean code. Clean architecture. Clean delivery.

## Role

You are the BMAD Development Agent, specialized in implementing features
following strict architectural principles and quality standards.

## Activation

Delegated to when:
- User stories need implementation
- Feature development is required
- Code changes follow architectural specifications

## Standards Applied

You automatically apply these standards (loaded as skills):

1. **Clean Architecture** (backend-api, frontend-components)
   - Domain-first design
   - Infrastructure separation
   - Presentation layer independence

2. **8-bit Design** (frontend-css)
   - Sharp corners only
   - Pixel shadows
   - Solid colors, no transparency

3. **TDD** (testing-test-writing)
   - Tests first, implementation second
   - Minimal but strategic coverage
   - Core user flows validated

## Workflow

1. **Load Story Context**
   - Read story requirements from sprint status
   - Verify acceptance criteria

2. **Plan Implementation**
   - Break down into small steps
   - Identify required standards
   - Plan test coverage

3. **Write Tests** (if not exists)
   - Use testing-test-writing skill
   - Focus on core user flows
   - Avoid over-mocking

4. **Implement Feature**
   - Apply relevant standards
   - Follow Clean Architecture layers
   - Maintain 8-bit design principles

5. **Validate**
   - Run tests
   - Type check
   - Lint check

6. **Update Sprint Status**
   - Mark story complete
   - Update progress tracking

## Handoff Triggers

Request handoff to:
- **code-review**: After implementation complete
- **typescript-fixer**: If TS errors encountered
- **component-splitter**: If component exceeds 120 lines

## Constraints

- DO NOT edit CLAUDE.md or AGENTS.md without governance
- DO NOT skip tests for production code
- DO NOT use glassmorphism or rounded styling
- MUST use Shallow for multiple Zustand selectors
- MUST follow Clean Architecture import paths

---

**Version**: 6.0.0
**Module**: _bmad/bmm/agents/dev.md
**Enhanced**: _bmad-ext/agents/bmm/dev-ext.md
```

---

## 6. Token Efficiency Implementation

### Progressive Disclosure Strategy

```yaml
# File: .claude/skills/backend-api/SKILL.md

# Tier 1: Frontmatter (always loaded)
---
name: backend-api
description: Design RESTful API endpoints...
triggers: [api, endpoint, server]
see_also: [reference.md, examples.md]
---

# Tier 2: Quick Start (loaded on invocation)
## Quick Start

1. Define endpoint in `/src/routes/`
2. Implement handler in `/src/domain/`
3. Add validation in `/src/presentation/`

[50-100 lines max]

# Tier 3: References (linked, loaded on demand)
For complete specification, see [reference.md](reference.md)

# Tier 4: Examples (linked, loaded on demand)
For usage examples, see [examples.md](examples.md)
```

### Loading Rules

| Context | What Loads | Token Cost |
|---------|-----------|------------|
| Session start | All skill frontmatter | ~2k tokens |
| Intent match | Full SKILL.md content | ~5k tokens per skill |
| Deep dive | Supporting reference.md | ~10k tokens |
| Example need | Supporting examples.md | ~5k tokens |

### Cache Strategy

```
1. Load frontmatter for ALL skills at session start
2. Cache: frontmatter in session memory
3. On intent match: load full skill content
4. Cache: loaded skill content for session duration
5. On reference link click: load supporting file
6. Cache: supporting file for session duration
```

---

## 7. Consolidation Plan

### Phase 4.1: Skills (Week 1)
- [ ] Add frontmatter to all agent-os standards
- [ ] Create hierarchical skill structure
- [ ] Implement progressive disclosure
- [ ] Update SKILLS_MANIFEST.yaml

### Phase 4.2: Hooks (Week 1)
- [ ] Create `.claude/hooks/` directory
- [ ] Define hook specifications
- [ ] Implement core hooks (SessionStart, UserPromptSubmit)
- [ ] Test hook lifecycle

### Phase 4.3: Commands (Week 2)
- [ ] Create `commands/index.yaml`
- [ ] Map all existing commands
- [ ] Remove 5-line redirect files
- [ ] Implement hierarchical menu

### Phase 4.4: Agents (Week 2)
- [ ] Standardize agent frontmatter
- [ ] Consolidate scattered agents
- [ ] Link agents to skills
- [ ] Test sub-agent delegation

---

## 8. Migration Checklist

### Skills Migration
- [ ] All standards have frontmatter
- [ ] Descriptions include trigger keywords
- [ ] Progressive disclosure files created
- [ ] SKILLS_MANIFEST.yaml updated

### Hooks Migration
- [ ] SessionStart hook implemented
- [ ] UserPromptSubmit hook implemented
- [ ] PreToolUse hook implemented
- [ ] PostToolUse hook implemented
- [ ] Stop hook implemented

### Commands Migration
- [ ] index.yaml created
- [ ] All commands mapped
- [ ] Redirect files removed
- [ ] Menu tested

### Agents Migration
- [ ] All agents have standard frontmatter
- [ ] Skills field populated
- [ ] Hooks field defined
- [ ] Sub-agent delegation tested

---

## 9. Testing Strategy

### Skills Testing
```bash
# Test auto-recognition
claude "create an api endpoint"  # Should trigger backend-api skill
claude "build a component"       # Should trigger frontend-components skill
```

### Hooks Testing
```bash
# Test SessionStart
claude  # Should load config and LOOP_STATE

# Test UserPromptSubmit
echo "implement" | claude  # Should pre-load dev skill

# Test Stop
exit  # Should check for unsaved changes
```

### Commands Testing
```bash
# Test hierarchical menu
claude "/"  # Should show grouped commands

# Test shorthand
claude "/dev FS-05"  # Should execute dev-story with argument
```

---

**Version:** 1.0.0
**Created:** 2026-01-10
**Next:** Implement Phase 4.1 (Skills Standardization)
