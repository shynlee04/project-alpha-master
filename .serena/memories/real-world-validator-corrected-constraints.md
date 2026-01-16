# Real-World Validator Corrected Constraints Summary

## Date
2026-01-16

## Issue
User pointed out that real-world-validator DOES need:
1. **bash: true** - For browser automation (Playwright MCP, Selenium)
2. **bash: true** - To restart dev server IF it gets stuck during testing

My initial fix **OVERCORRECTED** by setting `bash: false`.

## Corrected Tool Permissions

### YAML Header (.opencode/agent/real-world-validator.md)
```yaml
tools:
  write: true        # ✅ Can create test reports
  edit: false        # ❌ Cannot modify code
  bash: true         # ✅ Can run browser automation + restart if stuck
permission:
  edit: deny         # ❌ Explicitly denied
  bash: allow        # ✅ Explicitly allowed
```

### Tool Permission Matrix (AGENTS.md)
```
| Agent Type | write | edit | bash | task | Notes |
|-----------|--------|-------|-------|-------|--------|
| **real-world-validator** | true | false | true (limited) | true | Tests ONLY (bash: browser automation + restart if stuck), writes reports (write), NEVER modifies code (edit: NO) |
```

## Nuanced Constraints

### Bash Usage (STRICTLY LIMITED)

**ALLOWED for bash:**
- ✅ Run browser automation (Playwright MCP, Selenium)
- ✅ Restart dev server **ONLY IF it gets stuck** during testing
- ✅ Check if dev server is running before tests
- ✅ Kill stale processes if blocking tests

**FORBIDDEN for bash:**
- ❌ Fix code issues (routing, components, logic)
- ❌ Modify configuration files
- ❌ Install/uninstall dependencies or packages
- ❌ Run npm/pnpm commands unrelated to testing
- ❌ Kill processes unless they're blocking tests
- ❌ Edit git or version control
- ❌ Modify system settings unrelated to testing

### Write Usage (STRICTLY LIMITED)

**ALLOWED for write:**
- ✅ Create test report documents in `_bmad-output/test-reports/`
- ✅ Save screenshots to `_bmad-output/screenshots/`
- ✅ Export logs as JSON/text files

**FORBIDDEN for write:**
- ❌ Modify code files
- ❌ Create/modify components
- ❌ Edit configuration files

### Edit Usage (STRICTLY FORBIDDEN)

**ALLOWED for edit:**
- NONE

**FORBIDDEN for edit:**
- ❌ ALL edits are forbidden

## Delegation Template

```markdown
## Tool Constraints

**CRITICAL**: This agent has LIMITED permissions:
- ✅ write: TRUE - Can create test reports
- ❌ edit: FALSE - CANNOT modify code files
- ✅ bash: TRUE - Can run browser automation + restart dev IF STUCK
- ✅ task: TRUE - Can delegate further if approved

**Role Boundaries**:
- TEST ONLY - Validate behavior using browser automation
- REPORT ONLY - Create detailed test reports with evidence
- SUGGEST ONLY - Recommend fixes in reports (NOT implement)
- RESTART DEV - ONLY if server stuck during testing

## What To Do

1. Test [what to test]
2. Report findings
3. Document evidence
4. Suggest fixes (in report, NOT in code)
5. Restart dev server ONLY IF it gets stuck

## What NOT To Do

1. ❌ Do NOT modify any code files (edit: NO)
2. ❌ Do NOT fix routing or configuration issues (use dev-ext for that)
3. ❌ Do NOT edit production code
4. ❌ Do NOT use bash to fix code issues
5. ❌ Do NOT install/uninstall dependencies unless required for testing

## Required Output

Create report at `_bmad-output/test-reports/` with:
1. Test results (pass/fail)
2. Evidence (screenshots, logs, metrics)
3. Issues found (description only)
4. Recommendations (what to fix, NOT how)
```

## Validation Checklist

Before submitting delegation, check:

- [ ] Tool permissions explicitly set (write: true, edit: false, bash: true)
- [ ] Bash usage clearly defined (allowed vs forbidden)
- [ ] Role boundaries clearly defined
- [ ] Output location specified
- [ ] Evidence requirements stated
- [ ] MCP server usage mentioned if needed
- [ ] Timebox specified
- [ ] Success criteria documented

## Status

✅ **COMPLETED** - Corrected tool permissions per user feedback
✅ **READY** - All future delegations will use proper nuanced constraints

---

**Created**: 2026-01-16
**Last Updated**: 2026-01-16
**Status**: ACTIVE - Apply to ALL future real-world-validator delegations
