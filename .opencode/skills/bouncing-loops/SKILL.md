---
name: bouncing-loops
description: Event-driven cascading system that bounces violations back for correction. Core governance mechanism.
---

# Bouncing Loops System

> **Architecture**: Event → Validate → Pass OR Bounce Back

## Core Concept

When a violation is detected, the system BOUNCES back to the agent with:
1. What went wrong
2. Which skill to load
3. How to fix it

The agent never proceeds with errors - it loops back until correct.

## The Three Loops

### Loop 1: Pre-Execution Gate
**Trigger**: `tool.execute.before`  
**Check**: Path validity, scope size, forbidden patterns

```
TOOL CALLED → Check validity → PASS → Execute
                             → FAIL → BOUNCE with:
                                      - Blocked reason
                                      - Correct path
                                      - Skill to load
```

### Loop 2: Post-Execution Cascade
**Trigger**: `tool.execute.after`  
**Check**: Governance scripts, file sizes, state boundaries

```
TOOL EXECUTED → Run governance → PASS → Continue
                               → FAIL → BOUNCE with:
                                        - Violations found
                                        - Fix instructions
                                        - Run these commands
```

### Loop 3: Completion Verification
**Trigger**: `session.idle` event  
**Check**: Evidence of completion

```
"DONE" CLAIMED → Verify evidence → PASS → Accept complete
                                 → FAIL → BOUNCE with:
                                          - Missing evidence
                                          - Required checks
                                          - Block completion
```

## Bounce Message Format

```
⛔ BOUNCE: {TRAP} DEFENSE

Violation: {what went wrong}
Detected: {where/when}
Reason: {why this is blocked}

Required Action:
1. Load skill: {skill-name}
2. Run command: {command}
3. Fix and retry

DO NOT PROCEED until fixed.
```

## Integration with Min-Max

- **MIN**: Bouncing for critical violations (path, state)
- **MAX**: Bouncing for governance scripts (size, imports)
