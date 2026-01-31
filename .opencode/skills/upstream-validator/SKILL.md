---
name: upstream-validator
description: NON-NEGOTIABLE upstream validation for Supreme Coordinator. Must be loaded before accepting ANY completion claim from downstream agents. Enforces hierarchical evidence chain with auto-delegation on failure. L0 validator.
---

# Upstream Validator Skill (L0)

> **Role**: Highest-level validator for Supreme Coordinator
> **Strategy**: Early failure = fast rejection (no wasted cycles)

## The Iron Law

```
NO COMPLETION ACCEPTED WITHOUT HIERARCHICAL VALIDATION
```

You are the HIGHEST VALIDATION AUTHORITY. You cannot accept completion claims at face value. You MUST validate through delegation or direct evidence gathering.

---

## Validation Hierarchy (Execute in Order)

### Level 1: Sign-off Authorization Check
```yaml
check: "Does sign-off artifact exist?"
location: "_bmad-output/sprint-artifacts/signoff-*.yaml"
required_for: ["epic-completion", "sprint-completion", "release"]
action: |
  glob "_bmad-output/sprint-artifacts/signoff-*.yaml"
  - EXISTS → Continue to Level 2
  - MISSING → REJECT + delegate to @reviewer
```

### Level 2: Code Changes Verification
```yaml
check: "Are code files referenced in completion artifacts?"
action: grep -r "src/" in referenced story/epic files
required_for: ["story-completion", "epic-completion"]
action: |
  grep "src/" in story/handoff artifact
  - FOUND → Continue to Level 3
  - MISSING → REJECT + request specific file evidence
```

### Level 3: Dev Notes Evidence
```yaml
check: "Do dev-notes exist for each story?"
pattern: "_bmad-output/tracking/**/*-DAILY-LOG.md"
required_for: ["story-completion", "epic-completion"]
action: |
  glob "_bmad-output/tracking/**/*-DAILY-LOG.md"
  - EXISTS → Continue to Level 4
  - MISSING → REJECT + require dev notes creation
```

### Level 4: Test Evidence
```yaml
check: "Is there test run evidence?"
commands:
  - pnpm test:fast
  - pnpm typecheck:fast
required_for: ALL completions
action: |
  Use run-tests or run-typecheck tool
  - EXIT 0 → ACCEPT completion
  - EXIT 1 → REJECT + run tests first
```

---

## Validation Flow

```
Claim Received
    │
    ▼
Level 1: Sign-off Check ───→ FAIL → Delegate @reviewer
    │
    ▼ PASS
Level 2: Code Refs Check ───→ FAIL → Request evidence
    │
    ▼ PASS
Level 3: Dev Notes Check ───→ FAIL → Require creation
    │
    ▼ PASS
Level 4: Test Evidence ─────→ FAIL → Run tests first
    │
    ▼ PASS
✅ ACCEPT COMPLETION
```

---

## Rejection Templates

### Level 1 Failure
```
⛔ COMPLETION REJECTED

Level: 1 - Sign-off Check
Missing: signoff-epic-{id}.yaml
Action: Delegate to @reviewer for sign-off collection
```

### Level 2 Failure
```
⛔ COMPLETION REJECTED

Level: 2 - Code References
Missing: No src/ paths found in artifacts
Action: Provide file list of changes
```

### Level 3 Failure
```
⛔ COMPLETION REJECTED

Level: 3 - Dev Notes
Missing: DAILY-LOG.md not found
Action: Create dev notes for each story
```

### Level 4 Failure
```
⛔ COMPLETION REJECTED

Level: 4 - Test Evidence
Missing: Tests not run in this session
Action: Run pnpm test:fast && pnpm typecheck:fast
```

---

## Auto-Delegation Commands

```yaml
level_1_failure:
  delegate: "@reviewer validate-signoffs --epic {epic_id}"

level_2_failure:
  action: "Request specific file evidence from claiming agent"

level_3_failure:
  delegate: "@dev-ext create-dev-notes --story {story_id}"

level_4_failure:
  delegate: "@tea-ext run-validation-suite"
```

---

## Self-Check Before Accepting ANY Completion

```markdown
[ ] Have I loaded this skill (upstream-validator)?
[ ] Did I check sign-off artifacts exist (grep/glob)?
[ ] Are code file paths referenced in artifacts?
[ ] Do dev notes exist for this work?
[ ] Is there fresh test evidence with 0 failures?

If ANY box is unchecked → CANNOT accept completion
```

---

**Version**: 1.0.0 | **Level**: L0 | **Agent**: supreme-coordinator
