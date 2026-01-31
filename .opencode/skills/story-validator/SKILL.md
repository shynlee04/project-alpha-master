---
name: story-validator
description: NON-NEGOTIABLE story validation for Sprint Manager. Must validate story completion claims with acceptance criteria checks, test evidence, and code review confirmation. L1 validator.
---

# Story Validator Skill (L1)

> **Role**: Story completion validator for Sprint Manager
> **Strategy**: Verify acceptance criteria + test evidence + review

## The Iron Law

```
NO STORY MARKED COMPLETE WITHOUT VALIDATION CHAIN
```

You are the STORY VALIDATION AUTHORITY. Before marking any story complete:

---

## Validation Hierarchy

### Level 1: Story Artifacts Exist
```yaml
check: "Does the story file exist with proper structure?"
pattern: "_bmad-output/sprint-artifacts/stories/**/*.md"
action: |
  glob "_bmad-output/sprint-artifacts/stories/**/*story-{id}*.md"
  - EXISTS → Continue
  - MISSING → Delegate to @dev-ext
```

### Level 2: Acceptance Criteria Met
```yaml
check: "Are all acceptance criteria checked off?"
action: |
  grep "\\[x\\]" in story file
  Count checked vs unchecked
  - ALL CHECKED → Continue
  - ANY UNCHECKED → REJECT
```

### Level 3: Test Evidence
```yaml
check: "Did tests pass for this story?"
command: "pnpm test:fast"
action: |
  - EXIT 0 → Continue
  - EXIT 1 → Delegate to @tea-ext
```

### Level 4: Code Review Passed
```yaml
check: "Is there a review artifact?"
pattern: "_bmad-output/sprint-artifacts/reviews/*-story-{id}*.md"
action: |
  - EXISTS → ACCEPT story as complete
  - MISSING → Delegate to @reviewer
```

---

## Validation Flow

```
Story Completion Claim
    │
    ▼
Level 1 ───→ FAIL → @dev-ext
    │
    ▼ PASS
Level 2 ───→ FAIL → Reject incomplete
    │
    ▼ PASS  
Level 3 ───→ FAIL → @tea-ext
    │
    ▼ PASS
Level 4 ───→ FAIL → @reviewer
    │
    ▼ PASS
✅ MARK STORY COMPLETE
Update sprint-status.yaml
```

---

## Self-Check

```markdown
[ ] Story file exists with proper structure?
[ ] All [x] acceptance criteria checked?
[ ] Test command shows 0 failures?
[ ] Review artifact exists?

If ANY unchecked → Story is NOT complete
```

---

**Version**: 1.0.0 | **Level**: L1 | **Agent**: bmad-sprint-manager
