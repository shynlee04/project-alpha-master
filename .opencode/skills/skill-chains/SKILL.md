---
name: skill-chains
description: Define sequential skill execution patterns where output feeds into next skill. Chain skills for multi-step workflows with dependency ordering.
license: MIT
compatibility: opencode
metadata:
  type: orchestration
  priority: core
  min-skills: using-superpowers,context-first,verification-before-completion
---

# Skill Chains System

> **Purpose**: Sequential skill execution where each skill's output feeds the next

## Core Concept

Chains are **ordered sequences** of skills that must execute in order. Each step's completion is the gate for the next step.

```
┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│  Skill A  │───▶│  Skill B  │───▶│  Skill C  │───▶│  Skill D  │
│  (input)  │    │ (process) │    │ (process) │    │ (output)  │
└───────────┘    └───────────┘    └───────────┘    └───────────┘
     ▲                                                   │
     └───────────────── feedback loop ───────────────────┘
```

---

## Chain Definitions

### Chain 1: Feature Development (8 skills)

```yaml
chain: feature-development
trigger: "implement", "add feature", "create"
gate: Each step must complete before next

steps:
  1. brainstorming        # Explore idea → produce design
  2. context-first        # Load context → validate understanding
  3. writing-plans        # Create plan → produce task list
  4. tdd-red              # Write failing test → confirm RED
  5. executing-plans      # Implement → produce code
  6. test-driven-development  # GREEN → tests pass
  7. requesting-code-review   # Review → approval
  8. verification-before-completion  # Evidence → DONE
```

**Execution Protocol**:
```
skill({ name: "brainstorming" })
→ Wait for design approval
→ skill({ name: "context-first" })
→ Wait for context confirmation
→ skill({ name: "writing-plans" })
→ Wait for plan approval
→ skill({ name: "tdd-red" })
→ Wait for RED confirmation
→ skill({ name: "executing-plans" })
→ Continue until complete
```

---

### Chain 2: Story Development Cycle (9 skills)

```yaml
chain: story-cycle
trigger: "story", "sprint", "epic"
source: .agent/skills/story-cycle/steps/

steps:
  1. 01-create-story      # From epic → story file
  2. 02-validate-story    # Acceptance criteria → validated
  3. 03-create-context    # Story → context file
  4. 04-validate-context  # Dependencies → confirmed
  5. 05-pre-planning      # Context → technical plan
  6. 06-dev-story         # Plan → implementation
  7. 07-code-review       # Code → reviewed
  8. 08-story-done        # Review → done status
  9. 09-retrospective     # Done → lessons learned
```

**Gate Conditions**:
| Step | Gate | Evidence Required |
|------|------|-------------------|
| 1→2 | Story file exists | `stories/S{id}.md` |
| 2→3 | AC marked complete | All checkboxes ✓ |
| 3→4 | Context file exists | `stories/S{id}-context.md` |
| 4→5 | Dependencies confirmed | No blockers |
| 5→6 | Plan approved | Tasks defined |
| 6→7 | Tests pass | `pnpm test:fast` |
| 7→8 | Review approved | No blockers |
| 8→9 | Story marked DONE | Status updated |

---

### Chain 3: Architecture Remediation (11 skills)

```yaml
chain: architecture-remediation
trigger: "god store", "refactor", "split", "tech debt"
source: .agent/skills/architecture-remediation/

specialist-skills:
  - component-splitter     # Split large components
  - file-sync-specialist   # Handle sync logic
  - store-refactorer       # Split Zustand stores
  - test-writer            # Generate tests
  - typescript-fixer       # Fix type errors
  - workspace-architect    # Design workspace boundaries

workflow-skills:
  - eliminate-god-stores   # Full god store workflow
  - knowledge-sync-strategy # Knowledge workspace sync
  - normalize-components   # Component normalization
  - notes-sync-strategy    # Notes workspace sync
  - workspace-file-system-e2e # E2E file system tests
```

**Execution Strategy**:
```
# Detect problem type
if god_store:
  skill({ name: "architecture-remediation" })
  → skill({ name: "store-refactorer" })
  → skill({ name: "test-writer" })
  → skill({ name: "typescript-fixer" })
  
if oversized_component:
  skill({ name: "architecture-remediation" })
  → skill({ name: "component-splitter" })
  → skill({ name: "test-writer" })
```

---

### Chain 4: Bug Fix Workflow (5 skills)

```yaml
chain: bug-fix
trigger: "bug", "error", "failing", "broken"

steps:
  1. systematic-debugging  # Reproduce → hypotheses
  2. tdd-red               # Write failing test for bug
  3. executing-plans       # Minimal fix
  4. test-driven-development # Verify fix
  5. verification-before-completion  # Evidence
```

**Supporting Resources** (from systematic-debugging/):
- `root-cause-tracing.md` - RCA methodology
- `defense-in-depth.md` - Prevention patterns
- `find-polluter.sh` - Test isolation script
- `condition-based-waiting.md` - Async bug patterns

---

### Chain 5: Code Review Cycle (4 skills)

```yaml
chain: code-review
trigger: "review", "PR", "pull request"

steps:
  1. requesting-code-review  # Request → reviewer assigned
  2. code-reviewer.md        # Review → feedback generated
  3. receiving-code-review   # Feedback → changes made
  4. verification-before-completion  # Evidence → approved
```

---

## Chain Execution API

When invoking a chain, use the orchestration pattern:

```typescript
// Load chain orchestrator
skill({ name: "skill-chains" })

// Execute specific chain
chain: "feature-development"
current_step: 1
gate_status: "waiting"

// After each step completion, advance
skill({ name: "brainstorming" })  // Step 1
// → Agent produces design
// → Gate: design approved?
//   YES → advance to step 2
//   NO  → iterate step 1
```

---

## Chain Interruption Protocol

If a chain is interrupted:

1. **Save state**: Record current step and outputs
2. **Resume token**: Generate resume point
3. **On resume**: Load state → continue from saved step

```yaml
chain_state:
  chain: feature-development
  current_step: 4
  completed: [brainstorming, context-first, writing-plans]
  pending: tdd-red
  blocked_on: "test file creation"
  resume_command: skill({ name: "tdd-red" })
```

---

## Integration with Bouncing Loops

Chains integrate with the bouncing loop system:

```
Chain Step → Execute → Validation
                          │
                          ├── PASS → Next Step
                          │
                          └── FAIL → BOUNCE back to current step
                                     with correction instructions
```

See also: `skill({ name: "bouncing-loops" })`
