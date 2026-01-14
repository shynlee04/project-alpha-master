---
step: 7
name: "code-review"
phase: "review"
agent: "@bmad-bmm-dev" OR "@code-reviewer"
timeout: "15 min"
next: "08-story-done.md"
on_fail: "loop-to-06"
---

# Step 07: Code Review

> **Agent:** Code Reviewer (or Dev with fresh context)
> **description:** Multi-agent review to catch issues before story done

---

## Instructions

### 1. Load Context

```bash
READ: {sprint_artifacts}/{story_key}.md
READ: {sprint_artifacts}/{story_key}-context.xml
READ: .claude/rules/governance-rules.md
```

### 2. Review All Changed Files

**From Dev Agent Record, review each file:**

```bash
READ: src/{each_file_in_dev_record}
```

**For each file, check:**

#### Code Quality
- [ ] Follows naming conventions
- [ ] Proper error handling
- [ ] No hardcoded values (use tokens/config)
- [ ] Single responsibility principle
- [ ] Appropriate comments (not over-commented)

#### Architecture Compliance
- [ ] Matches patterns from architecture.md
- [ ] Within size limits (component ≤300, store ≤120)
- [ ] No circular dependencies
- [ ] Proper layer separation

#### TypeScript Quality
- [ ] Proper types (no `any` without reason)
- [ ] Correct use of generics
- [ ] Interface over type alias where appropriate
- [ ] Proper imports (named/default)

#### Testing
- [ ] Tests exist for new code
- [ ] Tests cover edge cases
- [ ] Tests are readable
- [ ] Mocks are appropriate

### 3. Verify Acceptance Criteria

**For EACH AC in story file:**

```markdown
### AC-{N}: {name}
- [ ] Given/{precondition} verified
- [ ] When/{action} works correctly
- [ ] Then/{outcome} achieved
- [ ] Test covers this AC
```

### 4. Run Validation Checks

```bash
# TypeScript (production code only)
pnpm typecheck

# Full test suite
pnpm test

# Lint (if configured)
pnpm lint
```

**All must pass.**

### 5. Document Review Findings

**Add to story file:**

```markdown
## Code Review

**Reviewer:** {model_name}
**Date:** {timestamp}
**Review Type:** {self/peer/automated}

### Checklist Results

#### Acceptance Criteria
| AC | Status | Notes |
|----|--------|-------|
| AC-1 | ✅/❌ | {verification} |
| AC-2 | ✅/❌ | {verification} |
| AC-3 | ✅/❌ | {verification} |

#### Code Quality
| Category | Status | Issues |
|----------|--------|--------|
| Naming | ✅/❌ | |
| Error Handling | ✅/❌ | |
| Architecture | ✅/❌ | |
| Size Limits | ✅/❌ | |
| TypeScript | ✅/❌ | |
| Testing | ✅/❌ | |

### Issues Found
*List each issue with severity*

#### {severity}: {issue_title}
- **Location:** {file}:{line}
- **Problem:** {what_is_wrong}
- **Fix:** {how_to_fix}
- **Status:** {fixed|deferred|won't_fix}

### Overall Assessment
**Status:** {APPROVED|NEEDS_FIXES|REJECTED}

**If APPROVED:**
- All ACs verified
- All tests passing
- No critical issues
- Code quality acceptable

**If NEEDS_FIXES:**
- List issues above
- Loop back to step 06
- Re-review after fixes

**If REJECTED:**
- Critical architectural violations
- Breaking changes not addressed
- Requires significant rework
```

### 6. Review Result

#### If Approved:
Proceed to next step: `08-story-done.md`

#### If Needs Fixes:
1. Document specific fixes needed
2. Loop back to: `06-dev-story.md`
3. Apply fixes
4. Re-run review

---

## Review Template

```markdown
## Code Review Summary

**Story:** {story_key}
**Reviewer:** {agent}
**Date:** {timestamp}

### Files Reviewed: {N}
{list of files}

### Issues
- Critical: {N}
- Major: {N}
- Minor: {N}
- Nitpick: {N}

### Decision: APPROVED / NEEDS_FIXES / REJECTED

### Sign-off
{if approved}
✅ Ready for story completion
{endif}
```

---

## Handoff Output (When Approved)

```markdown
## 📋 STEP COMPLETE: 07-code-review

**Story:** {story_key}
**Status:** approved

### Review Summary:
- Files reviewed: {N}
- Issues found: {N} critical, {N} major, {N} minor
- All issues: ✅ RESOLVED

### Quality Metrics:
- ACs verified: {N}/{N}
- Tests passing: {N}/{N}
- TypeScript: ✅ 0 errors
- Architecture: ✅ Compliant

### Sign-off:
✅ APPROVED for story completion

### Next Step:
- Execute: 08-story-done.md
- Input: Approved story file
```
