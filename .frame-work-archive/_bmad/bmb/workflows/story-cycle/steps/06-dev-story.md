---
step: 6
name: "dev-story"
phase: "implementation"
agent: "@bmad-bmm-dev"
timeout: "60 min"
next: "07-code-review.md"
on_fail: "loop-with-fixes"
---

# Step 06: Develop Story

> **Agent:** Developer (Dev)
> **description:** TDD implementation with validation at each task

---

## Instructions

### 1. Load All Context

```bash
READ: {sprint_artifacts}/{story_key}.md
READ: {sprint_artifacts}/{story_key}-context.xml
```

**Verify:**
- Pre-planning step is complete
- All research findings are available
- Implementation plan exists

### 2. Initialize Dev Agent Record

```markdown
### Dev Agent Record

**Agent:** {model_name}
**Session:** {timestamp}
**Started At:** {timestamp}

#### Task Progress:
*Tasks updated as completed*
```

### 3. For Each Task: TDD Cycle

**Follow Red-Green-Refactor for EVERY task:**

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
# Extract, rename, simplify
pnpm test {file}.test.ts
```

#### Mark Complete
```bash
# Update story file
- [x] T{N}: {task_name} - {notes}
```

### 4. Run Full Test Suite

After all tasks complete:

```bash
# TypeScript check (production code only)
pnpm typecheck

# Full test suite
pnpm test
```

**Both must pass before proceeding.**

### 5. Update Dev Agent Record

```markdown
#### Task Progress:
- [x] T1: {task} - {notes}
- [x] T2: {task} - {notes}
- [x] T3: {task} - {notes}

#### Research Executed:
- Context7: {query} → {finding}
- DeepWiki: {repo} → {pattern}

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/lib/x.ts | Created | 45 |
| src/lib/y.ts | Modified | +12/-3 |

#### Tests Created:
- x.test.ts: 5 tests, all passing
- y.test.ts: 3 tests, all passing

#### Decisions Made:
- Decision 1: {rationale}
- Decision 2: {rationale}

#### TypeScript Check:
✅ PASS - 0 errors in production code

#### Test Results:
✅ PASS - {N}/{N} tests passing
```

### 6. Update Sprint Status

```yaml
# _bmad-output/sprint-artifacts/sprint-status.yaml

{story_key}:
  status: "review"
  implementation_complete_at: {timestamp}
  tests_count: {N}
  tests_passing: {N}
```

---

## Quality Gates

**Before marking tasks complete:**

- [ ] Test written first (TDD)
- [ ] Test fails initially (red)
- [ ] Code passes test (green)
- [ ] Code refactored (still green)
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Follows architecture patterns
- [ ] Within size limits

---

## On Error

### TypeScript Errors
1. Count errors: `pnpm typecheck 2>&1 | grep -v '.test.' | wc -l`
2. Fix each error
3. Re-run until 0 errors

### Test Failures
1. Identify failing test
2. Debug failure reason
3. Fix implementation or test
4. Re-run until all pass

### Blocked
1. Document blocker in story file
2. Update status to `blocked`
3. Notify with specific issue
4. Suggest: defer / split / escalate

---

## Handoff Output

```markdown
## 📋 STEP COMPLETE: 06-dev-story

**Story:** {story_key}
**Status:** review

### Implementation Summary:
- Tasks complete: {N}/{N}
- Files created: {N}
- Files modified: {N}
- Total lines: +{added}/-{removed}

### Test Results:
- Tests created: {N}
- Tests passing: {N}/{N} (100%)
- TypeScript: ✅ 0 errors

### Dev Agent Record:
- ✅ Updated in story file
- ✅ All decisions documented
- ✅ All files changed tracked

### Next Step:
- Execute: 07-code-review.md
- Input: Story file with complete Dev Agent Record
```
