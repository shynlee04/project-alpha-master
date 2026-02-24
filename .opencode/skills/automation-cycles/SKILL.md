---
name: automation-cycles
description: Self-reinforcing feedback loops that automatically trigger skills based on events. Cycles continue until exit conditions are met or manually stopped.
license: MIT
compatibility: opencode
metadata:
  type: orchestration
  priority: core
  pattern: event-driven-loop
---

# Automation Cycles System

> **Purpose**: Self-reinforcing skill loops triggered by events

## Core Concept

Cycles are **continuous automation patterns** that:
1. Monitor for trigger conditions
2. Execute skill sequences
3. Validate results
4. Loop back or exit

```
        ┌─────────────────────────────────────────┐
        │                                         │
        ▼                                         │
┌───────────────┐    ┌───────────────┐    ┌──────┴──────┐
│    DETECT     │───▶│    EXECUTE    │───▶│   VALIDATE  │
│  (trigger?)   │    │   (skills)    │    │   (pass?)   │
└───────────────┘    └───────────────┘    └──────┬──────┘
                                                 │
                              ┌──────────────────┴───────────────────┐
                              │                                      │
                              ▼                                      ▼
                        ┌───────────┐                          ┌───────────┐
                        │   PASS    │                          │   FAIL    │
                        │  (exit)   │                          │  (loop)   │
                        └───────────┘                          └─────┬─────┘
                                                                     │
                                                                     ▼
                                                               ┌───────────┐
                                                               │  BOUNCE   │
                                                               │  (retry)  │
                                                               └───────────┘
```

---

## Cycle Definitions

### Cycle 1: Continuous Integration Loop

```yaml
cycle: ci-loop
trigger-event: file_saved | git_commit | manual
max-iterations: 10
exit-condition: all_checks_pass

loop:
  1. detect: File change detected
  2. execute:
     - pnpm typecheck:fast
     - pnpm test:fast
     - pnpm governance
  3. validate:
     - typescript: 0 errors?
     - tests: 0 failures?
     - governance: 0 violations?
  4. result:
     - ALL PASS → exit with success
     - ANY FAIL → bounce with errors → retry after fix
```

**Integration with Bouncing Loops**:
```
CI Loop detects violation
   ↓
BOUNCE: "TypeScript error in {file}"
   ↓
Developer fixes
   ↓
CI Loop re-runs
   ↓
PASS → Exit
```

---

### Cycle 2: Story Development Cycle

```yaml
cycle: story-development
trigger-event: story_created | story_assigned
max-iterations: 20
exit-condition: story_status == "DONE"

loop:
  1. detect: Story requires work
  2. execute: skill({ name: "story-cycle" })
     - Load step based on current story status
     - Execute step's skill
     - Validate step completion
  3. validate: Step gate passed?
  4. result:
     - PASS → advance to next step
     - FAIL → bounce with feedback → retry step
     - STEP 9 COMPLETE → exit with DONE status
```

**State Machine**:
```
CREATED → VALIDATED → CONTEXTUALIZED → PLANNED → 
IN_PROGRESS → REVIEWING → DONE → RETROSPECTIVE
```

---

### Cycle 3: Architecture Remediation Cycle

```yaml
cycle: arch-remediation
trigger-event: god_store_detected | oversized_component | tech_debt_flag
max-iterations: 50
exit-condition: all_violations_resolved

loop:
  1. detect: Architecture violation
  2. classify:
     - god_store → skill({ name: "store-refactorer" })
     - oversized → skill({ name: "component-splitter" })
     - types → skill({ name: "typescript-fixer" })
     - sync → skill({ name: "file-sync-specialist" })
  3. execute: Run appropriate specialist skill
  4. validate:
     - Run governance scripts
     - Check LOC limits
     - Verify type safety
  5. result:
     - PASS → check for remaining violations → loop or exit
     - FAIL → bounce → retry with different approach
```

---

### Cycle 4: Code Review Cycle

```yaml
cycle: review-cycle
trigger-event: pr_created | review_requested
max-iterations: 5
exit-condition: approved_with_no_blockers

loop:
  1. detect: PR needs review
  2. execute:
     - skill({ name: "requesting-code-review" })
     - Generate review feedback
  3. validate:
     - blocking_issues == 0?
     - all_comments_resolved?
  4. result:
     - APPROVED → exit
     - CHANGES_REQUESTED → bounce to developer → await fixes → re-review
```

---

### Cycle 5: Test-Driven Development Cycle

```yaml
cycle: tdd-cycle
trigger-event: feature_requested | bug_reported
max-iterations: 100
exit-condition: all_tests_green AND code_complete

phases:
  RED:
    - skill({ name: "tdd-red" })
    - Write failing test
    - Validate: test fails?
    - PASS → advance to GREEN
    
  GREEN:
    - Implement minimal code
    - Validate: test passes?
    - PASS → advance to REFACTOR
    - FAIL → iterate
    
  REFACTOR:
    - Improve code quality
    - Validate: tests still pass?
    - PASS → check for more requirements
    - FAIL → revert → try again
```

---

### Cycle 6: Sprint Execution Cycle

```yaml
cycle: sprint-execution
trigger-event: sprint_started
max-iterations: 1000
exit-condition: sprint_complete OR sprint_aborted

loop:
  1. detect: Next story in sprint backlog
  2. execute: Embed story-development cycle
  3. validate: Story DONE?
  4. result:
     - DONE → update velocity → next story
     - BLOCKED → escalate → alternative story
     - SPRINT_END → exit with report
```

---

## Cycle Control Signals

| Signal | Effect | Example |
|--------|--------|---------|
| `CONTINUE` | Proceed to next iteration | Tests pass, check for more work |
| `BOUNCE` | Retry current step with feedback | Validation failed |
| `SKIP` | Skip to next item | Story blocked, pick another |
| `ABORT` | Exit entire cycle | Critical blocker found |
| `SUCCESS` | Exit with completion | All objectives met |

---

## Cycle Nesting

Cycles can embed other cycles:

```
Sprint Execution Cycle
  └── Story Development Cycle
        └── TDD Cycle
              └── CI Loop
```

**Depth Limit**: 4 levels maximum to prevent infinite recursion

---

## Cycle State Persistence

```yaml
cycle_state:
  cycle: sprint-execution
  iteration: 42
  current_story: "S-123"
  embedded_cycles:
    - story-development (step 6)
    - tdd-cycle (GREEN phase)
  last_bounce:
    reason: "TypeScript error"
    timestamp: "2026-01-29T04:00:00Z"
  resume_point: "tdd-cycle.GREEN.validate"
```

---

## Integration with Min-Max Strategy

**MIN Cycles** (always active):
- CI Loop (on every file change)
- Verification cycle (on every completion claim)

**MAX Cycles** (context-triggered):
- Architecture remediation (on god store detection)
- Full sprint execution (on sprint start)
