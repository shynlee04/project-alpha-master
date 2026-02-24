---
name: skill-combos
description: Parallel skill combinations for complex tasks requiring multiple perspectives simultaneously. Unlike chains, combos execute skills in parallel and merge outputs.
license: MIT
compatibility: opencode
metadata:
  type: orchestration
  priority: core
  pattern: parallel-merge
---

# Skill Combos System

> **Purpose**: Parallel skill execution for multi-perspective analysis

## Core Concept

Combos are **parallel skill activations** that execute simultaneously and merge their outputs. Unlike chains (sequential), combos gather multiple perspectives at once.

```
              ┌───────────┐
              │  Skill A  │──────┐
              └───────────┘      │
                                 ▼
┌───────────┐                 ┌───────────┐    ┌───────────┐
│  Trigger  │────────────────▶│  MERGER   │───▶│  Output   │
└───────────┘                 └───────────┘    └───────────┘
                                 ▲
              ┌───────────┐      │
              │  Skill B  │──────┘
              └───────────┘
```

---

## Combo Definitions

### Combo 1: Frontend Implementation

**Trigger**: "component", "UI", "interface", "page"

```yaml
combo: frontend-implementation
parallel-skills:
  - frontend-components    # Component architecture
  - frontend-css           # Styling approach
  - frontend-responsive    # Responsive requirements
  - frontend-accessibility # A11y requirements
  - ui-layout-contract     # Layout constraints

merge-strategy: intersection
output: Combined implementation requirements
```

**Execution**:
```typescript
// Load all frontend skills in parallel
Promise.all([
  skill({ name: "frontend-components" }),
  skill({ name: "frontend-css" }),
  skill({ name: "frontend-responsive" }),
  skill({ name: "frontend-accessibility" }),
  skill({ name: "ui-layout-contract" })
])
→ Merge all requirements into unified spec
→ Implement component meeting ALL constraints
```

---

### Combo 2: Backend Implementation

**Trigger**: "API", "endpoint", "database", "model"

```yaml
combo: backend-implementation
parallel-skills:
  - backend-api           # Endpoint design
  - backend-models        # Data modeling
  - backend-queries       # Query optimization
  - backend-migrations    # Schema changes
  - global-error-handling # Error patterns

merge-strategy: layered
output: API implementation with all layers
```

---

### Combo 3: Quality Assurance

**Trigger**: "quality", "review", "audit"

```yaml
combo: quality-assurance
parallel-skills:
  - global-coding-style    # Style compliance
  - global-commenting      # Documentation quality
  - global-conventions     # Convention adherence
  - global-validation      # Input validation
  - global-tech-stack      # Stack alignment

merge-strategy: checklist
output: Quality score + violations list
```

---

### Combo 4: Deep Debugging

**Trigger**: "complex bug", "intermittent", "race condition"

```yaml
combo: deep-debugging
parallel-skills:
  - systematic-debugging           # Main methodology
  - systematic-debugging/root-cause-tracing     # RCA
  - systematic-debugging/defense-in-depth       # Prevention
  - systematic-debugging/condition-based-waiting # Async bugs

supporting-resources:
  - systematic-debugging/find-polluter.sh       # Script
  - systematic-debugging/test-pressure-*.md     # Pressure tests

merge-strategy: hypothesis-ranking
output: Ranked hypotheses with investigation plan
```

---

### Combo 5: Subagent Delegation

**Trigger**: "delegate", "parallel work", "sub-agent"

```yaml
combo: subagent-delegation
parallel-skills:
  - dispatching-parallel-agents    # Dispatch methodology
  - subagent-driven-development    # SDD patterns
  - executing-plans                # Plan execution

sub-prompts:
  - subagent-driven-development/implementer-prompt.md
  - subagent-driven-development/spec-reviewer-prompt.md
  - subagent-driven-development/code-quality-reviewer-prompt.md

merge-strategy: consensus
output: Delegated task assignments
```

---

### Combo 6: Test Strategy

**Trigger**: "test", "coverage", "TDD"

```yaml
combo: test-strategy
parallel-skills:
  - tdd-red                        # RED phase
  - test-driven-development        # Full TDD
  - testing-test-writing           # Test patterns

supporting-resources:
  - test-driven-development/testing-anti-patterns.md

merge-strategy: coverage-matrix
output: Test plan with coverage targets
```

---

## Merge Strategies

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| `intersection` | Only requirements met by ALL skills | Frontend (must satisfy all constraints) |
| `layered` | Stack outputs in dependency order | Backend (models → queries → API) |
| `checklist` | Aggregate all items into checklist | Quality (comprehensive audit) |
| `hypothesis-ranking` | Rank by likelihood/evidence | Debugging (prioritize investigation) |
| `consensus` | Find agreement across perspectives | Delegation (avoid conflicts) |
| `coverage-matrix` | Map requirements to tests | Testing (ensure completeness) |

---

## Combo Execution API

```typescript
// Load combo orchestrator
skill({ name: "skill-combos" })

// Execute specific combo
combo: "frontend-implementation"
strategy: "intersection"

// Parallel skill loading
skills_loaded: [
  "frontend-components",
  "frontend-css",
  "frontend-responsive",
  "frontend-accessibility",
  "ui-layout-contract"
]

// Merge outputs
merged_requirements:
  - Component: Accessible, responsive, styled
  - Layout: Contract-compliant
  - CSS: Tailwind utilities
```

---

## Combo + Chain Integration

Combos can be embedded within chains:

```
Chain Step 1 (single skill)
    ↓
Chain Step 2 (COMBO - parallel skills)
    ↓
Chain Step 3 (single skill)
```

Example: Feature Development chain with Frontend Combo:
```yaml
chain: feature-development-ui
steps:
  1. brainstorming
  2. context-first
  3. writing-plans
  4. tdd-red
  5. COMBO:frontend-implementation  # ← Parallel combo
  6. test-driven-development
  7. requesting-code-review
  8. verification-before-completion
```
