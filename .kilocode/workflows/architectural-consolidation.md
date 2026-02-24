---
description: Execute systematic architectural refactoring with Phase 0 (Showcase), Phase 1 (Foundation), and Phase 2 (Full Scope) - integrates story-dev-cycle, sweeping-validation, and 12-level framework
---

# Architectural Consolidation Workflow

// turbo-all

Execute this workflow to systematically refactor the BMAD platform architecture from fragmented to cohesive.

## Prerequisites

Before starting this workflow, ensure:
- [ ] Sprint Change Proposal exists at `_bmad-output/sprint-change-proposal-*.md`
- [ ] Build passes: `pnpm build`
- [ ] Dev server running: `pnpm dev`

## Workflow Execution

### Step 1: Load Workflow Definition

Load and read the full workflow file:
```
@_bmad/bmm/workflows/4-implementation/architectural-consolidation/workflow.yaml
```

### Step 2: Initialize Workflow

Load and execute:
```
@_bmad/bmm/workflows/4-implementation/architectural-consolidation/steps/step-01-init.md
```

### Step 3: Follow Step-by-Step Execution

The workflow will guide you through:

**Phase 0 (Today - Showcase Critical):**
- Story AC-01: Provider Store Reactivity
- Story AC-02: Agent Selector Unification  
- Story AC-03: Chat Panel Standardization
- Phase 0 Validation Gate

**Phase 1 (Jan 1-3 - Foundation):**
- Story AC-04: Store Reorganization
- Story AC-05: Event Bus Implementation
- Story AC-06: Data Flow Contracts
- Phase 1 Validation Gate

**Phase 2 (Jan 4-10 - Full Scope):**
- Story AC-07: Code Hygiene Sweep
- Story AC-08: API Contract Enforcement
- Story AC-09: Test Coverage Completion
- Phase 2 Validation Gate (Final)

## Validation Integration

This workflow integrates:
- `/story-dev-cycle` for each story implementation
- `sweeping-validation.md` checkpoints after each phase
- `12-level-framework-integration` gates for quality assurance
- 3-device rule for Phase 0 and Phase 2

## Agent Coordination

| Agent | Invocation | Responsibility |
|-------|------------|----------------|
| `@bmad-core-bmad-master` | Orchestration | Status tracking, handoffs |
| `@bmad-bmm-architect` | Architecture review | ADR updates, pattern validation |
| `@bmad-bmm-dev` | Implementation | Code changes, tests |
| `@bmad-bmm-tea` | Testing | Coverage, E2E |
| `@code-reviewer` | Quality | Code review gates |

## Quick Start

To begin immediately with Phase 0:

```
1. Read the Sprint Change Proposal
2. Execute step-01-init.md
3. Follow the menu prompts
4. Complete stories in sequence
5. Pass validation gate
6. Proceed to next phase
```

## Reference Documents

- Sprint Change Proposal: `_bmad-output/sprint-change-proposal-2025-12-31.md`
- Architecture: `_bmad-output/project-planning-artifacts/architecture.md`
- Sweeping Validation: `_bmad-output/validation/sweeping-validation.md`
- 12-Level Framework: `_bmad-output/validation/12-level-framework-integration-2025-12-29.md`
