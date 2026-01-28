---
name: hierarchy-orchestration
description: Master orchestration system managing skill tiers, inheritance, and override patterns. Controls which skills govern others and resolves conflicts.
license: MIT
compatibility: opencode
metadata:
  type: orchestration
  priority: master
  governs: all-skills
---

# Hierarchy Orchestration System

> **Purpose**: Master control of skill relationships, inheritance, and governance

## Core Concept

Skills exist in a **governance hierarchy**. Higher-tier skills can:
- Override lower-tier decisions
- Impose constraints on lower skills
- Block actions from lower skills
- Inject requirements into lower skills

```
                    ┌─────────────────────────┐
                    │  TIER 0: META-SKILLS    │
                    │  (hierarchy-orchestration)│
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ TIER 1: CORE    │    │ TIER 1: CORE    │    │ TIER 1: CORE    │
│ skill-chains    │    │ skill-combos    │    │ automation-cycles│
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ TIER 2: PROCESS │    │ TIER 2: DOMAIN  │    │ TIER 2: QUALITY │
│ brainstorming   │    │ frontend-*      │    │ tdd-*           │
│ writing-plans   │    │ backend-*       │    │ testing-*       │
│ story-cycle     │    │ global-*        │    │ code-review     │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     TIER 3: SPECIALIST SKILLS                   │
│  component-splitter, store-refactorer, typescript-fixer, etc.  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tier Definitions

### Tier 0: Meta-Skills (Governance)

Control the skill system itself.

| Skill | Purpose |
|-------|---------|
| `hierarchy-orchestration` | Master governance (THIS SKILL) |
| `min-max-strategy` | MIN/MAX enforcement |
| `bouncing-loops` | Validation cascades |

**Authority**: Can override ANY lower skill.

---

### Tier 1: Orchestration Skills

Define execution patterns.

| Skill | Purpose |
|-------|---------|
| `skill-chains` | Sequential execution |
| `skill-combos` | Parallel execution |
| `automation-cycles` | Loop execution |
| `using-superpowers` | Skill discovery gate |

**Authority**: Can compose Tier 2-3 skills.

---

### Tier 2: Process & Domain Skills

Define HOW work is done.

| Category | Skills |
|----------|--------|
| Process | `brainstorming`, `writing-plans`, `context-first`, `story-cycle`, `executing-plans` |
| Domain | `frontend-*`, `backend-*`, `global-*` |
| Quality | `tdd-*`, `testing-*`, `*-code-review` |
| Guard | `brownfield-guard`, `verification-before-completion` |

**Authority**: Can invoke Tier 3 specialists.

---

### Tier 3: Specialist Skills

Execute specific tasks.

| Parent | Specialists |
|--------|-------------|
| `architecture-remediation` | `component-splitter`, `store-refactorer`, `typescript-fixer`, `test-writer`, `file-sync-specialist`, `workspace-architect` |
| `systematic-debugging` | `root-cause-tracing`, `defense-in-depth`, `condition-based-waiting` |
| `subagent-driven-development` | `implementer-prompt`, `spec-reviewer-prompt`, `code-quality-reviewer-prompt` |

**Authority**: Execute only within scope.

---

## Skill Inheritance

Child skills inherit from parents:

```yaml
# Example: component-splitter inherits from architecture-remediation
parent: architecture-remediation
child: component-splitter

inherited:
  - Canonical path rules
  - LOC limits
  - Test requirements
  - TypeScript constraints

overrides:
  - Specific splitting logic
  - Component extraction patterns
```

---

## Conflict Resolution

When skills conflict, higher tier wins:

```
CONFLICT DETECTED:
  - frontend-css says: "Use Tailwind"
  - global-coding-style says: "No utility classes"

RESOLUTION:
  - global-coding-style is Tier 2
  - frontend-css is Tier 2
  - Same tier → check min-max-strategy
  - MIN skill wins (global-coding-style is MIN)
```

**Resolution Priority**:
1. Higher tier always wins
2. Same tier: MIN > MAX
3. Same tier + priority: Most restrictive wins

---

## Skill Discovery Order

When loading skills, OpenCode searches in order:

```
1. .opencode/skills/<name>/SKILL.md     (project local)
2. ~/.config/opencode/skills/<name>/SKILL.md  (global config)
3. .claude/skills/<name>/SKILL.md       (claude compat)
4. ~/.claude/skills/<name>/SKILL.md     (global claude)
```

**Shadowing**: Project-local overrides global.

---

## Skill Activation Matrix

| Request Type | Tier 0 | Tier 1 | Tier 2 | Tier 3 |
|-------------|--------|--------|--------|--------|
| Any | ✓ hierarchy, min-max | ✓ using-superpowers | - | - |
| Feature | ✓ | ✓ chains, cycles | ✓ brainstorming, frontend-*, backend-* | Context-dependent |
| Bug fix | ✓ | ✓ chains | ✓ systematic-debugging | ✓ root-cause-tracing |
| Story | ✓ | ✓ chains, cycles | ✓ story-cycle steps | - |
| Refactor | ✓ | ✓ combos | ✓ architecture-remediation | ✓ component-splitter, store-refactorer |

---

## Governance Enforcement

### Pre-Execution Gates (Tier 0)
```
User request → hierarchy-orchestration
            → Check skill permissions
            → Load MIN skills
            → Block if governance violation
```

### Execution Monitoring (Tier 1)
```
Skill runs → chains/combos/cycles monitor
          → Gate validation
          → BOUNCE if violation
          → Advance if pass
```

### Post-Execution Validation (Tier 2)
```
Work complete → verification-before-completion
             → Evidence required
             → brownfield-guard path check
             → governance scripts
```

---

## Skill Permission Configuration

From `opencode.json`:

```json
{
  "permission": {
    "skill": {
      "*": "allow",
      "hierarchy-orchestration": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}
```

| Permission | Effect |
|------------|--------|
| `allow` | Skill loads immediately |
| `deny` | Skill hidden from agent |
| `ask` | User prompted for approval |

---

## Complete Skill Index

### Meta (Tier 0)
- `hierarchy-orchestration` - THIS SKILL
- `min-max-strategy`
- `bouncing-loops`

### Orchestration (Tier 1)
- `skill-chains`
- `skill-combos`
- `automation-cycles`
- `using-superpowers`

### Process (Tier 2)
- `brainstorming`
- `writing-plans`
- `context-first`
- `story-cycle`
- `executing-plans`
- `dispatching-parallel-agents`
- `subagent-driven-development`
- `using-git-worktrees`
- `finishing-a-development-branch`

### Domain (Tier 2)
- `frontend-components`
- `frontend-css`
- `frontend-responsive`
- `frontend-accessibility`
- `backend-api`
- `backend-models`
- `backend-queries`
- `backend-migrations`
- `global-coding-style`
- `global-commenting`
- `global-conventions`
- `global-error-handling`
- `global-tech-stack`
- `global-validation`
- `ui-layout-contract`

### Quality (Tier 2)
- `tdd-red`
- `test-driven-development`
- `testing-test-writing`
- `systematic-debugging`
- `requesting-code-review`
- `receiving-code-review`
- `verification-before-completion`
- `brownfield-guard`

### Specialist (Tier 3)
- `architecture-remediation/*`
- `systematic-debugging/*`
- `subagent-driven-development/*`
- `story-cycle/steps/*`
- `writing-skills/*`
