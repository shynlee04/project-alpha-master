# Master Orchestrator Constraints for Sub-Agent Delegation

## CRITICAL RULE: Always Set Tool Constraints When Delegating

**NEVER delegate without explicitly setting tool permissions!**

### Why This Matters

When sub-agents have unrestricted access (write, edit, bash), they can:
- Modify code files they shouldn't touch
- Fix issues outside their scope
- Overstep their role boundaries
- Cause cascading failures

### Required Delegation Pattern

**WRONG** (oversteps boundaries):
```
task({
  subagent_type: "real-world-validator",
  prompt: "Test the spike and fix any issues"
})
```

**CORRECT** (strictly scoped):
```
task({
  subagent_type: "real-world-validator",
  prompt: "Test the spike and REPORT findings ONLY. DO NOT modify code.",
  tools: {
    write: false,
    edit: false,
    bash: false,
    task: true
  }
})
```

### Tool Permission Matrix by Agent Type

| Agent Type | write | edit | bash | task | Notes |
|-----------|--------|-------|-------|-------|--------|
| **real-world-validator** | false | false | false | true | Tests ONLY, writes reports |
| **dev-ext** | true | true | true (limited) | true | Implementation, but NEVER without context |
| **architect-ext** | false | true (design only) | false | true | Architecture docs, not code |
| **analyst-ext** | false | false | false | true | Research and analysis only |
| **tea-ext** | false | false | false | true | Test specifications, not implementation |

### Mandatory Delegation Template

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

### MCP Server Usage

Agents MUST use MCP servers for official documentation:

| Tool | When To Use | Examples |
|-------|-------------|-----------|
| **TanStack MCP** | All TanStack documentation queries | "Search TanStack Router docs" |
| **websearch-prime** | Best practices, patterns | "React state management best practices 2026" |
| **fetch** | Official docs, API references | "Fetch React Router docs" |

**Required**: Before any research, use MCP servers - NOT search engines.

### Validation Checklist

Before submitting delegation, check:

- [ ] Tool permissions explicitly set
- [ ] Role boundaries clearly defined
- [ ] Output location specified
- [ ] Evidence requirements stated
- [ ] MCP server usage mentioned if needed
- [ ] Timebox specified
- [ ] Success criteria documented

### Failure Consequences

If sub-agent oversteps:
1. Stop the delegation immediately
2. Document the violation
3. Update agent definition to prevent recurrence
4. Report to user for oversight

### Last Updated

- Created: 2026-01-16
- Triggered by: real-world-validator calling 97 tools, modifying routing, fixing code
- Status: ACTIVE - Apply to ALL future delegations
