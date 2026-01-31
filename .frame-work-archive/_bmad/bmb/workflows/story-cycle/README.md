---
name: "story-cycle"
description: "Modular story development cycle with validation loops, pre-planning gates, and cross-platform support"
version: "2.0.0"
auto_execution_mode: 3
cross_platform:
  - ".claude"
  - ".opencode"
---

# Story Development Cycle v2.0

> **Cross-Platform Modular Workflow** - Works with Claude Code and Open Code via Skills/Commands

## Overview

A complete iterative cycle for developing stories from backlog to done with **strict governance**, **research protocols**, and **document handoff procedures**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STORY DEVELOPMENT CYCLE v2.0 — Modular Architecture                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ 01-create-  │ →  │ 02-validate-│ →  │ 03-create-  │ →  │ 04-validate-│  │
│  │   story     │    │   story     │    │   context   │    │   context   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│        ↓ fail              ↺ loop             ↓                 ↺ loop     │
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ 05-pre-     │ →  │ 06-dev-     │ →  │ 07-code-    │ →  │ 08-story-   │  │
│  │   planning  │    │   story     │    │   review    │    │   done      │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│        ↓ fail              ↺ loop             ↺ loop             ↓         │
│                                                                             │
│  ┌─────────────┐                                                            │
│  │ 09-retro-   │  ← [if last story of epic]                                │
│  │   spective  │                                                            │
│  └─────────────┘                                                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ CROSS-CUTTING: correct-course, audit-checkpoint, stale-check        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## v2.0 Improvements Over v1.0

| Issue | v1.0 | v2.0 Solution |
|-------|------|---------------|
| **Monolithic file** | 552 lines, >15KB | 10 modular files, each <5KB |
| **No pre-planning gate** | Agents implement without context | Step 05: Pre-planning enforcement |
| **Stale context** | No freshness checks | `_stale-check.md` validator |
| **No standards check** | Inconsistent code quality | Constitution check in pre-planning |
| **Superficial validation** | Generic checklists | Project-specific validation |
| **No recovery path** | Stories get stuck | `_correct-course.md` handler |
| **No audit trail** | Context lost between agents | Formal handoff artifacts |
| **Platform-specific** | `.agent/workflows/` only | Cross-platform via BMAD |

## File Structure

```
_bmad/bmb/workflows/story-cycle/
├── README.md                   # This file - entry point
├── workflow.md                 # Legacy single-file reference
├── skills/
│   ├── story-cycle.md          # Main skill definition
│   ├── create-story.md         # Individual step skills
│   ├── validate-story.md
│   ├── create-context.md
│   ├── validate-context.md
│   ├── pre-planning.md         # NEW
│   ├── dev-story.md
│   ├── code-review.md
│   ├── story-done.md
│   └── retrospective.md
├── steps/
│   ├── 01-create-story.md      # SM creates story from epics
│   ├── 02-validate-story.md    # Validate story file 100%
│   ├── 03-create-context.md    # Build story context XML
│   ├── 04-validate-context.md  # Validate context + stale check
│   ├── 05-pre-planning.md      # Pre-dev research gate (NEW!)
│   ├── 06-dev-story.md         # TDD implementation
│   ├── 07-code-review.md       # Multi-agent review
│   ├── 08-story-done.md        # Complete, update governance
│   └── 09-retrospective.md     # Epic-level retrospective
└── utils/
    ├── _audit-checkpoint.md    # Cross-cutting audit protocol
    ├── _correct-course.md      # Recovery handler
    ├── _stale-check.md         # Freshness validator
    └── _handoff-template.md    # Handoff artifact template
```

## Cross-Platform Usage

### Claude Code (`.claude/`)
```bash
# Via skill command
/story-cycle

# Via individual step
/create-story
/validate-story
/dev-story
```

### Open Code (`.opencode/`)
```bash
# Via skill command
story-cycle

# Via individual step
create-story
validate-story
dev-story
```

### Skills Configuration

Both platforms register skills from `_bmad/bmb/workflows/story-cycle/skills/`:

```yaml
# .claude/skills/story-cycle/skill.yaml or .opencode/skill/story-cycle/
name: story-cycle
description: Complete story development cycle workflow
triggers:
  - "/story-cycle"
  - "story cycle"
  - "develop story"
```

## Prerequisites

Before running any step:

1. **Sprint status file**: `{sprint_artifacts}/sprint-status.yaml`
2. **Epics document**: `{output_folder}/epics.md`
3. **Architecture document**: `{output_folder}/architecture.md`
4. **Constitution**: `.claude/rules/governance-rules.md` or equivalent
5. **Story in backlog**: Story exists with status `backlog`

## Quick Start

### For New Stories
```bash
# Start from beginning
/story-cycle

# Or jump to specific phase
/create-story
```

### For Existing Stories
```bash
# Continue from current state
/story-cycle continue

# Jump to specific step
/pre-planning story=S-021
/dev-story story=S-021
```

## Governance Rules

### Mandatory Research (Before Implementation)

Every story **MUST** include research using MCP tools:

| Tool | description | Query Pattern |
|------|---------|---------------|
| **Context7** | Official docs | `resolve-library-id` → `get-library-docs` |
| **DeepWiki** | GitHub patterns | `ask_question` with repo-specific query |
| **Tavily/Exa** | Community solutions | Semantic search for patterns |
| **Repomix** | Local analysis | Pack and grep existing code |

### Handoff Protocol

Each phase produces a handoff artifact:

```markdown
## 📋 PHASE COMPLETE: {phase_name}

**Story:** {epic}-{story}-{slug}
**Status:** {new_status}

### Artifacts Updated:
- ✅ {file_path_1}
- ✅ {file_path_2}

### Next Phase Requirements:
- Load: {next_agent}
- Execute: {next_workflow}
- Input: {artifact_paths}
```

## Validation Gates

### 100% Pass Required

- [x] Story file exists at correct path
- [x] User story format complete (As a/I want/So that)
- [x] At least 3 acceptance criteria defined
- [x] Context XML passes freshness check
- [x] Pre-planning gate passed
- [x] All tests passing
- [x] Code review approved

### Loop on Failure

If any validation fails:
1. Return to previous step
2. Fix identified issues
3. Re-run validation
4. Only proceed when 100% pass

## Recovery Handlers

### Correct Course Workflow

Triggered when:
- Story stuck >2x timebox
- Validation unable to pass
- External blockers identified

Actions:
1. Pause current workflow
2. Assess situation
3. Propose options:
   - Split story
   - Defer to next sprint
   - Escalate to architect
4. Document decision
5. Resume or terminate

### Stale Check

Triggered:
- At context creation
- Before development
- After significant delays

Checks:
- File modification timestamps
- Git status for uncommitted changes
- Sprint status currency

## Artifacts Produced

| Artifact | Location | description |
|----------|----------|---------|
| Story File | `{sprint_artifacts}/{story}.md` | Requirements, tracking |
| Context XML | `{sprint_artifacts}/{story}-context.xml` | Developer context |
| Handoff | `{sprint_artifacts}/{story}-handoff.md` | Agent transition |
| Sprint Status | `{sprint_artifacts}/sprint-status.yaml` | Sprint tracking |
| Retrospective | `{sprint_artifacts}/epic-{N}-retro.md` | Epic review |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-08 | Modular architecture, pre-planning gate, cross-platform |
| 1.0.0 | 2025-12-20 | Original monolithic workflow |

---

**Entry Point**: Run `/story-cycle` or select individual step skills to begin.
