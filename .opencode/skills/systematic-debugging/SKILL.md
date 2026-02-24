---
name: systematic-debugging
description: Structured debugging process with hypotheses, isolation, and evidence. Never guess - investigate systematically.
---

# Systematic Debugging

> **MAX Strategy**: Triggered on any error or unexpected behavior

## Core Principle

**Never guess. Investigate systematically.**

## 5-Step Process

### Step 1: Reproduce
- Confirm the issue exists
- Document exact steps to reproduce
- Note: environment, inputs, expected vs actual

### Step 2: Hypothesize
List 3-5 possible causes, ranked by likelihood:
1. Most likely: {hypothesis}
2. Second: {hypothesis}
3. Third: {hypothesis}

### Step 3: Isolate
Test each hypothesis:
- Create minimal reproduction
- Change ONE variable at a time
- Document what you tried and results

### Step 4: Fix
- Address root cause, not symptoms
- Verify fix doesn't break other things
- Add regression test

### Step 5: Verify
- Original issue resolved
- No new issues introduced
- Tests pass

## Anti-Patterns

| Don't | Instead |
|-------|---------|
| Guess and patch | Investigate systematically |
| Change multiple things | One change at a time |
| Skip reproduction | Always confirm first |
| Fix symptoms | Find root cause |

## Evidence Logging

```
DEBUGGING: {issue}
REPRODUCTION: {steps}
HYPOTHESIS 1: {theory} → {result}
HYPOTHESIS 2: {theory} → {result}
ROOT CAUSE: {identified cause}
FIX: {what was changed}
VERIFICATION: {commands run, output}
```
