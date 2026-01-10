---
name: dev-story
description: Develop story with TDD implementation. Use when user says "dev story", "implement story", or after pre-planning passes. Executes Red-Green-Refactor cycle with test-driven development.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: workflow
parent: story-cycle
children: []
priority: 61
agents:
  - bmad-bmm-dev
triggers:
  - dev story
  - implement story
  - develop story
  - /dev-story
---

# Step 06: Develop Story

**Purpose**: Implement story using TDD (Red-Green-Refactor) cycle with tests first, then implementation.

## When to use

- After pre-planning gate passes
- User says "dev story" or "implement story"
- Starting development work
- Implementation phase

## Instructions

### 1. Load Context
```bash
READ: {sprint_artifacts}/{story_key}.md
READ: {sprint_artifacts}/{story_key}-context.xml
```

### 2. TDD Implementation Cycle

#### Red: Write Failing Test
```bash
# Create test file first
WRITE: test/path/to/{feature}.test.ts

# Test should FAIL initially
RUN: pnpm test {test_file}
# Expected: Failure
```

#### Green: Make Test Pass
```bash
# Write minimal implementation
WRITE: src/path/to/{feature}.ts

# Run test again
RUN: pnpm test {test_file}
# Expected: Success
```

#### Refactor: Improve Code
```bash
# Refactor while keeping tests green
RUN: pnpm test
# Ensure: All tests still pass
```

### 3. Implementation Steps

Follow the implementation plan from pre-planning:
1. Create files listed in "Files to Create"
2. Modify files listed in "Files to Modify"
3. Follow integration strategy
4. Mitigate identified risks

### 4. Update Dev Agent Record

**Add to story file:**
```markdown
## Dev Agent Record

### Agent
- Model: {model_name}
- Session: {timestamp}

### Task Progress
- [x] T1: {task} - {notes}
- [x] T2: {task} - {notes}

### Research Executed
*Document MCP research findings*

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| {file} | created/modified | {N} |

### Tests Created
- {test_file}: {count} tests

### Decisions Made
- Decision 1: {rationale}
```

### 5. TypeScript Check

**Before marking complete:**
```bash
# Check for TypeScript errors (production files only)
pnpm typecheck

# Expected: Zero new errors in production code
# Test file errors are non-blocking
```

### 6. Update Story Status

```yaml
{story_key}:
  status: "implementation-complete"
  implemented_at: {timestamp}
  files_changed: {N}
  tests_created: {N}
```

## TDD Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    TDD CYCLE                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                │
│  │   RED   │ →  │  GREEN  │ →  │ REFACTOR│                │
│  │         │    │         │    │         │                │
│  │ Write   │    │ Write   │    │ Clean  │                │
│  │ Failing │    │ Minimal │    │ Up     │                │
│  │ Test    │    │ Code    │    │ Code   │                │
│  └────┬────┘    └────┬────┘    └────┬────┘                │
│       │              │              │                       │
│       └──────────────┴──────────────┘                       │
│                      │                                      │
│                      ↓                                      │
│              ┌─────────────┐                                │
│              │ Tests Pass? │                                │
│              └─────┬───────┘                                │
│                    │                                        │
│           No ──────┴────── Yes                              │
│           ↓                 ↓                                │
│       Continue         Next Feature                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Validation

Before proceeding to code review:
- [ ] All acceptance criteria addressed
- [ ] All tests passing (unit + integration)
- [ ] TypeScript check passes (production code)
- [ ] Implementation follows pre-planning approach
- [ ] Files created/modified as planned
- [ ] Dev Agent Record updated

## Error Handling

| Error | Action |
|-------|--------|
| Test cannot be written | Trigger correct-course |
| TypeScript errors | Fix before proceeding |
| Architecture violation | Re-evaluate approach |
| Timebox exceeded | Trigger correct-course |

## Next Step

After implementation complete:
- Proceed to: [code-review](../code-review/SKILL.md)

If blocked:
- Trigger: [correct-course](../utils/correct-course/SKILL.md)

---

**Source**: `_bmad/bmb/workflows/story-cycle/steps/06-dev-story.md`
