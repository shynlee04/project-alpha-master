---
name: story-cycle
description: Complete story development cycle with validation loops, pre-planning gates, research protocols, and cross-platform support. Use this skill when user says "story cycle", "develop story", "create story", "validate story", or any story development workflow step. This is the v2.0 modular replacement for the monolithic story-dev-cycle.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: workflow
parent: bmad-orchestrator
children:
  - create-story
  - validate-story
  - create-context
  - validate-context
  - pre-planning
  - dev-story
  - code-review
  - story-done
  - retrospective
priority: 55
agents:
  - bmad-bmm-sm
  - bmad-bmm-dev
  - code-reviewer
triggers:
  - story cycle
  - develop story
  - create story
  - validate story
  - story development
  - /story-cycle
  - /create-story
  - /validate-story
  - /dev-story
---

# Story Development Cycle v2.0

**Purpose**: Complete iterative cycle for developing stories from backlog to done with strict governance, research protocols, and document handoff procedures.

## When to use this skill

- When starting a new story from epic backlog
- When continuing development on an existing story
- When validating story files or context artifacts
- When executing pre-planning research gates
- When running code review or completion workflows
- When conducting epic retrospectives

## Cycle Overview

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
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 09-retrospective  ← [if last story of epic]                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ CROSS-CUTTING: correct-course, audit-checkpoint, stale-check        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Step Skills (Sub-Skills)

This master skill loads the following step-specific sub-skills:

| Step | Skill | Purpose | Agent |
|------|-------|---------|-------|
| 01 | [create-story](./create-story/SKILL.md) | Create story from epic | SM |
| 02 | [validate-story](./validate-story/SKILL.md) | Validate story 100% | SM |
| 03 | [create-context](./create-context/SKILL.md) | Build context XML | SM |
| 04 | [validate-context](./validate-context/SKILL.md) | Validate + stale check | SM |
| 05 | [pre-planning](./pre-planning/SKILL.md) | Research gate (NEW) | Dev |
| 06 | [dev-story](./dev-story/SKILL.md) | TDD implementation | Dev |
| 07 | [code-review](./code-review/SKILL.md) | Multi-agent review | Reviewer |
| 08 | [story-done](./story-done/SKILL.md) | Complete story | SM |
| 09 | [retrospective](./retrospective/SKILL.md) | Epic retrospective | SM |

## Utility Skills

| Utility | Skill | Purpose |
|---------|-------|---------|
| Stale Check | [stale-check](./utils/stale-check/SKILL.md) | File freshness validation |
| Correct Course | [correct-course](./utils/correct-course/SKILL.md) | Recovery handler |
| Audit | [audit](./utils/audit/SKILL.md) | Quality audit checkpoint |

## Usage Patterns

### Start New Story
```bash
User: /story-cycle
Agent: → Loads create-story sub-skill
```

### Continue Existing Story
```bash
User: /story-cycle continue {story_key}
Agent: → Detects current state, loads appropriate step
```

### Jump to Specific Step
```bash
User: /story-cycle step={N} story={story_key}
Agent: → Loads specific step skill
```

### Individual Step Execution
```bash
User: /create-story epic=21
User: /dev-story story=21-2-fix-auth
User: /code-review story=21-2-fix-auth
```

## Prerequisites

Before running any step, these files must exist:

```yaml
# Required files
_bmad/bmb/config.yaml                    # User preferences
_bmad-output/sprint-artifacts/sprint-status.yaml  # Sprint tracking
_bmad-output/epics.md                    # Epic definitions
_bmad-output/project-planning-artifacts/architecture.md  # Patterns
.claude/rules/governance-rules.md        # Constitution (if exists)
```

## Validation Gates

### 100% Pass Required
- [x] Story file exists at correct path
- [x] User story format complete (As a/I want/So that)
- [x] At least 3 acceptance criteria defined
- [x] Context XML passes freshness check
- [x] Pre-planning gate passed (v2.0 requirement)
- [x] All tests passing
- [x] Code review approved

### Loop on Failure
If validation fails:
1. Return to previous step
2. Fix identified issues
3. Re-run validation
4. Only proceed when 100% pass

## Research Protocol (Pre-Planning Gate)

Every story MUST include research using MCP tools:

| Tool | Purpose | Query Pattern |
|------|---------|---------------|
| **Context7** | Official docs | `resolve-library-id` → `get-library-docs` |
| **DeepWiki** | GitHub patterns | `ask_repository` with repo-specific query |
| **Tavily/Exa** | Community solutions | Semantic search for patterns |
| **Repomix** | Local analysis | Pack and grep existing code |

## Handoff Protocol

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

## Recovery Handlers

### Correct Course Workflow
Triggered when:
- Story stuck >2x timebox
- Validation unable to pass
- External blockers identified

Options:
1. **Split Story** - Create 2-3 smaller stories
2. **Defer** - Move to next sprint
3. **Escalate** - Send to architect
4. **Reduce Scope** - Ship partial value
5. **Continue** - Acknowledge risk

## Output Artifacts

```
_bmad-output/sprint-artifacts/
├── {epic}-{story}-{slug}.md           # Story file
├── {epic}-{story}-{slug}-context.xml   # Context XML
├── {epic}-{story}-{slug}-handoff.md    # Handoff artifact
├── sprint-status.yaml                  # Updated each step
└── epic-{N}-retrospective.md           # Epic completion (if applicable)
```

## Governance Rules

1. **Post-Step Documentation**: Update sprint-status.yaml after each step
2. **Stale Context**: Always check file freshness before using artifacts
3. **Research First**: Pre-planning gate BEFORE any code (v2.0)
4. **Quality Gates**: TypeScript, tests, code review must pass
5. **Handoff Artifacts**: Create formal handoffs between phases

## Quick Commands

| Command | Action |
|---------|--------|
| `/story-cycle` | Start or continue story cycle |
| `/create-story epic=N` | Create story for epic N |
| `/validate-story story=X` | Validate story file |
| `/create-context story=X` | Create context XML |
| `/validate-context story=X` | Validate context with stale check |
| `/pre-planning story=X` | Research and planning gate |
| `/dev-story story=X` | Implement with TDD |
| `/code-review story=X` | Review implementation |
| `/story-done story=X` | Mark story complete |
| `/retrospective epic=N` | Epic retrospective |
| `/audit story=X` | Run quality audit |
| `/correct-course story=X` | Recovery handler |

## v2.0 Improvements

| Issue | v1.0 | v2.0 Solution |
|-------|------|---------------|
| **Monolithic file** | 552 lines | 10 modular files |
| **No pre-planning gate** | Implement without context | Step 05: Pre-planning |
| **Stale context** | No freshness checks | `_stale-check.md` validator |
| **No standards check** | Inconsistent quality | Constitution check |
| **Superficial validation** | Generic checklists | Project-specific validation |
| **No recovery path** | Stories get stuck | `_correct-course.md` handler |
| **Platform-specific** | `.agent/workflows/` only | Cross-platform via BMAD |

---

**Source**: `_bmad/bmb/workflows/story-cycle/README.md`
**Version**: 2.0.0
**Last Updated**: 2026-01-08
