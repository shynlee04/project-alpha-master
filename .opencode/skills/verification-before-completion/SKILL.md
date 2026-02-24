---
name: verification-before-completion
description: Evidence before claims. No completion without fresh verification output. Non-negotiable gate for done status.
---

# Verification Before Completion

> **MIN Strategy**: Always before any "done" claim

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

## Gate Function

```
BEFORE claiming status:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh)
3. READ: Full output, check exit code
4. VERIFY: Does output confirm claim?
   - NO: State actual status with evidence
   - YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying
```

## Evidence Requirements

| Claim | Requires | NOT Sufficient |
|-------|----------|----------------|
| Tests pass | Test command: 0 failures | Previous run |
| Build succeeds | Build command: exit 0 | "Should work" |
| Bug fixed | Test symptom: passes | Code changed |
| Complete | All acceptance criteria verified | Some tests pass |

## Red Flags (STOP if you think)

- Using "should", "probably", "seems to"
- Satisfaction before verification
- About to commit without checks
- "Just this once"

## Required Commands

```bash
pnpm typecheck:fast    # TypeScript
pnpm test:fast         # Unit tests
pnpm test:e2e          # E2E journey
pnpm governance        # Size + imports
```

## On Violation

```
⛔ VERIFICATION BOUNCE

Claimed: {what was claimed}
Evidence: NONE FOUND

Required: Run verification commands, show output, then claim.
```

## Key Principle

**Evidence before claims, always.** Run command → Read output → THEN claim.
