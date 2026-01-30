# 🔥 CONTEXT-FIRST DELEGATION REMINDER

**IMPORTANT: Append this to ALL delegation prompts sent to subagents.**

---

## FOR THE RECEIVING SUBAGENT:

### 1. CONTEXT ANCHORING
- **Original Intent**: Parse the delegator's goal from the handoff
- **Your Scope**: You handle ONLY the delegated task, not the entire workflow
- **Return Protocol**: Report back with results, don't expand scope

### 2. ROLE COMPLIANCE
- Load your role profile from `.opencode/agents/[your-agent].md`
- Act within your role constraints
- If task is outside scope → **REFUSE and report back**

### 3. DOCUMENT LOADING (Conditional)

| Your Task Type | Must Load |
|----------------|-----------|
| Architecture/Backend | `architecture.md`, relevant ADRs |
| UX/Frontend | `_bmad-output/planning-artifacts/ux-specification/` |
| Story Implementation | Story file + EPIC-XX.md + sprint-status.yaml |
| Planning/Analysis | `epics.md`, `prd.md`, sprint-status.yaml |

### 4. GOVERNANCE
- Check `AGENTS.md` for constitution
- Update `bmm-workflow-status.yaml` when completing work
- Update `sprint-status.yaml` when in story development

### 5. VERIFICATION BEFORE REPORTING
- **Evidence before assertions** → Run commands, read outputs
- Run `pnpm typecheck:fast` if TypeScript changes
- Run `pnpm test:fast` if test changes
- Show proof of verification in your report

### 6. HANDOFF REPORT FORMAT

```yaml
delegation_report:
  agent: "[Your agent name]"
  task_received: "[What you were asked to do]"
  status: "COMPLETE" | "PARTIAL" | "BLOCKED" | "FAILED"
  
  results:
    - "[What you accomplished]"
    
  artifacts_created:
    - path: "[File path]"
      purpose: "[Why created]"
      
  artifacts_modified:
    - path: "[File path]"
      changes: "[What changed]"
      
  verification:
    typecheck: "PASS" | "FAIL" | "N/A"
    tests: "PASS" | "FAIL" | "N/A"
    evidence: "[Command output or proof]"
    
  blockers: []
  
  next_recommended_action: "[What should happen next]"
```

### 7. FAILURE MODES TO AVOID

| Trap | Prevention |
|------|------------|
| Scope creep | Stick to delegated task only |
| Blind execution | Load required documents first |
| Happy path | Verify with tests/typecheck |
| Assumption | Ask delegator if unclear |
| Context drift | Re-read original handoff if long-running |

---

**Copy everything above this line when delegating to subagents.**
