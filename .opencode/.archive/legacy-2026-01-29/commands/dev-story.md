---
 subtask: true
 return: ["/code-review validate output", "Run tests and fix failures"]
---

# Command: dev-story

> **Skill**: `.opencode/skill/story-cycle/steps/06-dev-story.md` | **Master**: `_bmad/bmb/workflows/story-cycle/steps/06-dev-story.md`

---

## Description

Implement story using TDD (Test-Driven Development) methodology with Red-Green-Refactor cycle. Developer agent responsibility.

---

## Usage

```bash
dev-story story=21-1-fix-auth    # Implement story 21-1
dev-story story=S-001            # Using story key format
```

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `story` | Yes | Story key (e.g., 21-1-fix-auth or S-001) |

---

## TDD Workflow

### For Each Task: Red-Green-Refactor

#### Red: Write Failing Test
```bash
# Create test file first
WRITE: src/{path/to/file}.test.ts

# Run test - should fail
pnpm test {file}.test.ts
```

#### Green: Write Minimum Code
```bash
# Write just enough to pass
WRITE: src/{path/to/file}.ts

# Run test - should pass
pnpm test {file}.test.ts
```

#### Refactor: Clean Up
```bash
# Improve code while keeping tests green
pnpm test {file}.test.ts
```

---

## Quality Gates

- [ ] Test written first (TDD)
- [ ] Test fails initially (red)
- [ ] Code passes test (green)
- [ ] Code refactored (still green)
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Follows architecture patterns
- [ ] Within size limits

---

## After All Tasks Complete

```bash
# TypeScript check (production code only)
pnpm typecheck

# Full test suite
pnpm test
```

**Both must pass before proceeding.**

---

## On Blockers

```bash
# Trigger recovery workflow
correct-course story={story_key}
```

Options:
- Split story
- Defer to next sprint
- Escalate to architect
- Reduce scope
- Continue with risk

---

## Next Step

`code-review` - Review completed implementation

---

**See Also**: `story-cycle`, `code-review`, `correct-course`, `pre-planning`
