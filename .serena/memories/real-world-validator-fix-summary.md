# Real-World Validator Constraints Fix Summary

## Problem Found

**Agent**: real-world-validator
**Date**: 2026-01-16
**Issue**: Agent overstepping role boundaries by:
- Calling 97 tools in one session (excessive)
- Modifying code files (router.tsx, routes)
- Fixing routing issues instead of just testing
- Attempting to restart dev servers
- Trying to connect to servers without checking state
- Not using MCP servers for official documentation

## Root Cause

Agent definition had **WRONG tool permissions**:

```yaml
# BEFORE (WRONG):
tools:
  write: true    # ❌ Allowed to write any file
  edit: true     # ❌ Allowed to modify code
  bash: true     # ❌ Allowed to run commands
permission:
  edit: allow    # ❌ Explicitly allowed
  bash: allow    # ❌ Explicitly allowed
```

## Fix Applied

### 1. Updated real-world-validator.md Agent Definition

**Location**: `.opencode/agent/real-world-validator.md`

**Changes Made**:
- ❌ write: false (was true)
- ❌ edit: false (was true)
- ❌ bash: false (was true)
- Added "TEST-ONLY AGENT" role description
- Added "CRITICAL CONSTRAINTS" section
- Added "What This Agent DOES NOT DO" list:
  - Do NOT modify any code files
  - Do NOT restart services
  - Do NOT install/uninstall dependencies
  - Do NOT fix routing or configuration
  - Do NOT edit production code
  - Do NOT run npm/pnpm commands
  - Do NOT kill processes or change system state

### 2. Created ext-master-constraints Memory

**Location**: `ext-master-constraints` (memory file)

**Contents**:
- Required delegation pattern (CORRECT vs WRONG examples)
- Tool permission matrix by agent type
- Mandatory delegation template
- MCP server usage requirements
- Validation checklist
- Failure consequences

### 3. Updated AGENTS.md Governance Document

**Location**: `AGENTS.md`

**Added Section**: "🚨 CRITICAL: ALWAYS Set Tool Constraints When Delegating"

**Contents**:
- Required pattern for EVERY delegation
- Tool permission matrix (memorize this!)
- MCP server usage requirements
- Validation checklist
- Consequences of NOT setting constraints

## Tool Permission Matrix (Now Documented)

| Agent Type | write | edit | bash | task | Notes |
|-----------|--------|-------|-------|-------|--------|
| **real-world-validator** | false | false | false | true | Tests ONLY, writes reports, NEVER modifies code |
| **dev-ext** | true | true | true (limited) | true | Implementation, but NEVER without context |
| **architect-ext** | false | true (design only) | false | true | Architecture docs, NOT code |
| **analyst-ext** | false | false | false | true | Research and analysis ONLY |
| **tea-ext** | false | false | false | true | Test specs, NOT implementation |
| **ux-designer-ext** | false | false | false | true | UI/UX design, NOT coding |

## MCP Server Usage (Required for Research)

**Agents MUST use MCP servers for official documentation:**

| Tool | When To Use | Examples |
|-------|-------------|-----------|
| **TanStack MCP** | All TanStack documentation queries | "Search TanStack Router docs" |
| **websearch-prime** | Best practices, 2026 patterns | "React state management best practices" |
| **fetch_fetch** | Official docs, API references | "Fetch GitHub READMEs" |

## Required Delegation Template

**Copy and adapt this for EVERY delegation:**

```markdown
## Tool Constraints

**CRITICAL**: This agent has LIMITED permissions:
- ❌ write: FALSE - Can only create report documents
- ❌ edit: FALSE - CANNOT modify code files
- ❌ bash: FALSE - CANNOT run commands
- ✅ task: TRUE - Can delegate further if approved

**Role Boundaries**:
- TEST ONLY - Validate behavior, don't fix
- REPORT ONLY - Document findings, don't implement solutions
- SUGGEST ONLY - Provide recommendations, don't write code

## What To Do

1. Test [what to test]
2. Report findings
3. Document evidence
4. Suggest fixes (in report, NOT in code)

## What NOT To Do

1. ❌ Do NOT modify any code files
2. ❌ Do NOT restart services
3. ❌ Do NOT install/uninstall dependencies
4. ❌ Do NOT fix routing or configuration
5. ❌ Do NOT edit production code

## Required Output

Create report at [path] with:
1. Test results (pass/fail)
2. Evidence (screenshots, logs, metrics)
3. Issues found (description only)
4. Recommendations (what to fix, NOT how)
```

## Validation Checklist

Before submitting delegation, check:

- [ ] Tool permissions explicitly set
- [ ] Role boundaries clearly defined
- [ ] Output location specified
- [ ] Evidence requirements stated
- [ ] MCP server usage mentioned if needed
- [ ] Timebox specified
- [ ] Success criteria documented

## Impact

**Before Fix**:
- real-world-validator could modify any code file
- Could restart servers, kill processes
- Could break routing by attempting fixes
- No MCP server usage for documentation
- Unbounded tool calls (97 in one session)

**After Fix**:
- real-world-validator can ONLY create test reports
- CANNOT modify code (edit: false)
- CANNOT run commands (bash: false)
- CANNOT restart servers
- Must use MCP servers for documentation
- Clear role boundaries documented
- Validation checklist required before delegation

## Future Prevention

**For all future delegations, ext-master-enhanced MUST:**

1. Check tool permissions for agent type
2. Set constraints in delegation prompt
3. Follow mandatory template
4. Validate with checklist
5. Document in delegation prompt

**Memory Reference**: See `ext-master-constraints` memory for complete templates and examples.

## Status

✅ **COMPLETED** - real-world-validator constraints fixed
✅ **COMPLETED** - ext-master-constraints memory created
✅ **COMPLETED** - AGENTS.md governance updated
✅ **READY** - All future delegations will use proper constraints

**Next Step**: Test spike routes with properly constrained real-world-validator agent

---

**Created**: 2026-01-16
**Last Updated**: 2026-01-16
**Status**: ACTIVE - Apply to ALL future delegations
