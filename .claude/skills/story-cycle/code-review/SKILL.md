---
name: code-review
description: Code review for story implementation. Use when user says "code review", "review story", or after development completes. Multi-agent review verifying all acceptance criteria, tests passing, and code quality.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: workflow
parent: story-cycle
children: []
priority: 62
agents:
  - code-reviewer
triggers:
  - code review
  - review story
  - review code
  - /code-review
---

# Step 07: Code Review

**Purpose**: Multi-agent code review verifying acceptance criteria, tests, code quality, and architecture compliance.

## When to use

- After implementation completes
- User says "code review" or "review story"
- Before marking story done
- Quality checkpoint

## Instructions

### 1. Load Story and Context
```bash
READ: {sprint_artifacts}/{story_key}.md
READ: {sprint_artifacts}/{story_key}-context.xml
```

### 2. Review Checklist (100% Pass Required)

#### Acceptance Criteria Verification
For each AC in story:
- [ ] AC-1 verified (Given/When/Then works as specified)
- [ ] AC-2 verified
- [ ] AC-3 verified
- [ ] All ACs have test coverage

#### Test Coverage
- [ ] Unit tests present for new code
- [ ] Integration tests for interactions
- [ ] All tests passing (`pnpm test`)
- [ ] Test coverage ≥80% for new code

#### Code Quality
- [ ] Code follows project standards
- [ ] No hardcoded values (use tokens/constants)
- [ ] Proper error handling
- [ ] No console.log statements left in
- [ ] Meaningful variable/function names

#### Architecture Compliance
- [ ] Follows architecture.md patterns
- [ ] No circular dependencies
- [ ] Component size ≤300 lines
- [ ] Store size ≤120 lines (if applicable)
- [ ] Proper import paths

#### TypeScript Check
- [ ] Zero new TypeScript errors in production code
- [ ] Test file errors are non-blocking
- [ ] Proper type definitions

#### Documentation
- [ ] Complex functions have comments
- [ ] New components have JSDoc if needed
- [ ] Changes documented in story

### 3. Review Process

#### Automated Checks
```bash
# TypeScript
pnpm typecheck

# Tests
pnpm test

# Build check (if applicable)
pnpm build
```

#### Manual Review
- Read changed files
- Verify implementation matches plan
- Check for edge cases
- Verify error handling

### 4. Review Result

#### If 100% Pass:
```yaml
{story_key}:
  status: "review-approved"
  review_approved_at: {timestamp}
  review_result: "pass"
```

**Add to story file:**
```markdown
## Code Review

**Reviewer:** {model_name}
**Date:** {timestamp}

### Checklist
- [x] All ACs verified
- [x] All tests passing
- [x] Architecture patterns followed
- [x] No TypeScript errors
- [x] Code quality acceptable

### Issues Found
*None - or list minor issues*

### Sign-off
[x] APPROVED for merge
```

Proceed to: [story-done](../story-done/SKILL.md)

#### If Fail:
1. Document each issue found
2. Specify fixes needed
3. Return to [dev-story](../dev-story/SKILL.md)
4. Re-run review after fixes

### 5. Loop on Failure

If review fails:
```
review → dev-story → review → dev-story → ...
```

Max 2 loops before triggering [correct-course](../utils/correct-course/SKILL.md).

## Review Categories

| Category | Checks | Weight |
|----------|--------|--------|
| Functionality | ACs verified | Critical |
| Tests | Coverage, passing | Critical |
| TypeScript | Zero new errors | Critical |
| Architecture | Patterns, size limits | Major |
| Code Quality | Standards, style | Major |
| Documentation | Comments, JSDoc | Minor |

## Review Output

**Review Report** (added to story file):
```markdown
## Code Review Report

**Reviewed At:** {timestamp}
**Reviewer:** {agent}
**Result:** PASS/FAIL

### Scores
| Category | Score | Notes |
|----------|-------|-------|
| Functionality | ✅/❌ | |
| Tests | ✅/❌ | |
| TypeScript | ✅/❌ | |
| Architecture | ✅/❌ | |
| Code Quality | ✅/❌ | |
| Documentation | ✅/❌ | |

### Issues Found
1. {issue_1} - {severity}
2. {issue_2} - {severity}

### Required Actions
{list of fixes if fail}

### Overall Assessment
{pass/fail reasoning}
```

## Next Step

After approval:
- Proceed to: [story-done](../story-done/SKILL.md)

After failure:
- Return to: [dev-story](../dev-story/SKILL.md)
- Or trigger: [correct-course](../utils/correct-course/SKILL.md)

---

**Source**: `_bmad/bmb/workflows/story-cycle/steps/07-code-review.md'
