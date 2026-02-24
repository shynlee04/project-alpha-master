# ═════════════════════════════════════════════════════════════════════════════
# EPIC-UXUI-04 TEAM ASSIGNMENTS & VALIDATION COORDINATION
# Created: 2026-01-30T22:00:00+07:00
# Status: ACTIVE
# ═════════════════════════════════════════════════════════════════════════════

## 🎯 TEAM STRUCTURE

### Primary Teams

```yaml
team_a_implementation:
  name: "Team A - Implementation Squad"
  agent: "dev-ext"
  lead: "Senior Developer"
  focus: "Code implementation and initial testing"
  
  responsibilities:
    - Implement story requirements
    - Write unit tests
    - Create documentation
    - Self-verify implementation
    - Fix validation failures
    
  permissions:
    write: true
    edit: true
    bash: true
    task: true
    
  scope:
    can:
      - "Implement stories 1-10"
      - "Write and run tests"
      - "Update documentation"
      - "Fix code issues"
    cannot:
      - "Skip validation steps"
      - "Claim completion without evidence"
      - "Bypass approval gates"
      - "Modify validation requirements"

team_b_testing:
  name: "Team B - Testing & Validation Squad"
  agent: "tea-ext"
  lead: "Test Engineer"
  focus: "Browser testing and functional validation"
  
  responsibilities:
    - Browser-based testing
    - Acceptance criteria verification
    - Functional validation
    - Evidence collection
    - Bug reporting
    
  permissions:
    write: true
    edit: false
    bash: true
    task: true
    
  scope:
    can:
      - "Test in browser"
      - "Validate acceptance criteria"
      - "Collect evidence"
      - "Report issues"
      - "Update validation logs"
    cannot:
      - "Modify implementation code"
      - "Skip test steps"
      - "Approve without evidence"
      - "Override quality gates"

governance_team:
  name: "Governance & Quality Team"
  agent: "bmad-governance"
  lead: "Quality Engineer"
  focus: "Code quality and standards compliance"
  
  responsibilities:
    - Run code quality checks
    - Validate governance rules
    - Check file size limits
    - Verify import paths
    - Enforce standards
    
  permissions:
    write: false
    edit: false
    bash: true
    task: true
    
  scope:
    can:
      - "Run quality checks"
      - "Report violations"
      - "Block non-compliant code"
      - "Enforce standards"
    cannot:
      - "Modify code"
      - "Bypass validation"
      - "Change requirements"
```

---

## 🔄 VALIDATION WORKFLOW ASSIGNMENTS

### Per-Story Team Rotation

```yaml
story_validation_workflow:
  phase_1_requirements:
    assigned_to: "bmad-sprint-manager"
    action: "Read and document requirements"
    output: "Validation criteria document"
    
  phase_2_implementation:
    assigned_to: "dev-ext (Team A)"
    action: "Implement with TDD"
    output: "Working code + tests"
    timebox: "Per story estimate"
    
  phase_3_code_quality:
    assigned_to: "bmad-governance"
    action: "Run quality checks"
    checks:
      - "pnpm typecheck:fast"
      - "pnpm governance"
      - "pnpm build"
    output: "Quality report"
    
  phase_4_functional_validation:
    assigned_to: "tea-ext (Team B)"
    action: "Browser testing"
    checks:
      - "Open application in browser"
      - "Verify all acceptance criteria"
      - "Check console for errors"
      - "Test all interactions"
    output: "Validation report with evidence"
    
  phase_5_documentation:
    assigned_to: "dev-ext (Team A)"
    action: "Update all tracking files"
    files:
      - "EPIC-UXUI-04-DAILY-LOG.md"
      - "EPIC-UXUI-04-COMPONENT-REGISTRY.md"
      - "bmm-workflow-status.yaml"
      - "EPIC-UXUI-04-VALIDATION-LOG.md"
    
  phase_6_approval:
    assigned_to: "bmad-sprint-manager"
    action: "Review all evidence"
    decision: "APPROVE or RETURN"
    criteria: "100% validation required"
```

---

## 📋 STORY-BY-STORY ASSIGNMENTS

### Stories 1-8: Validation Phase

| Story | Implementation | Code Quality | Testing | Documentation | Approval |
|-------|---------------|--------------|---------|---------------|----------|
| UXUI-04-01 | dev-ext | bmad-governance | tea-ext | dev-ext | bmad-sprint-manager |
| UXUI-04-02 | dev-ext | bmad-governance | tea-ext | dev-ext | bmad-sprint-manager |
| UXUI-04-03 | dev-ext | bmad-governance | tea-ext | dev-ext | bmad-sprint-manager |
| UXUI-04-04 | dev-ext | bmad-governance | tea-ext | dev-ext | bmad-sprint-manager |
| UXUI-04-05 | dev-ext | bmad-governance | tea-ext | dev-ext | bmad-sprint-manager |
| UXUI-04-06 | dev-ext | bmad-governance | tea-ext | dev-ext | bmad-sprint-manager |
| UXUI-04-07 | dev-ext | bmad-governance | tea-ext | dev-ext | bmad-sprint-manager |
| UXUI-04-08 | dev-ext | bmad-governance | tea-ext | dev-ext | bmad-sprint-manager |

### Stories 9-10: Implementation + Validation Phase

| Story | Implementation | Code Quality | Testing | Documentation | Approval |
|-------|---------------|--------------|---------|---------------|----------|
| UXUI-04-09 | dev-ext | bmad-governance | tea-ext | dev-ext | bmad-sprint-manager |
| UXUI-04-10 | dev-ext | bmad-governance | tea-ext | dev-ext | bmad-sprint-manager |

---

## 🚨 ESCALATION PATH

### When to Escalate

```yaml
escalation_triggers:
  level_1_implementation_issues:
    trigger: "Implementation blocked >2 hours"
    action: "Notify bmad-sprint-manager"
    resolution: "Re-assign or split story"
    
  level_2_validation_failures:
    trigger: "Validation fails 3+ times"
    action: "Escalate to architect-ext"
    resolution: "Architecture review"
    
  level_3_scope_creep:
    trigger: "Story exceeds 2x timebox"
    action: "Correct-course workflow"
    resolution: "Split, defer, or reduce scope"
    
  level_4_critical_blockers:
    trigger: "External dependency blocking"
    action: "Escalate to ext-master"
    resolution: "Cross-team coordination"
```

### Escalation Contacts

| Level | Contact | Response Time | Authority |
|-------|---------|---------------|-----------|
| 1 | bmad-sprint-manager | 30 minutes | Reassignment |
| 2 | architect-ext | 1 hour | Architecture decisions |
| 3 | correct-course agent | 2 hours | Scope adjustment |
| 4 | ext-master | 4 hours | Epic-level decisions |

---

## 📊 COMMUNICATION PROTOCOL

### Daily Standup Format

```markdown
## Daily Standup: {DATE}

### Team A (Implementation)
**Yesterday:**
- Completed: {items}
- Blockers: {issues}

**Today:**
- Focus: {story}
- Goals: {objectives}

**Blockers:**
- {list}

### Team B (Testing)
**Yesterday:**
- Validated: {stories}
- Issues found: {count}

**Today:**
- Testing: {stories}
- Focus: {areas}

### Governance
**Quality Metrics:**
- TypeScript errors: {count}
- Governance violations: {count}
- Files >300 lines: {count}
```

### Handoff Protocol

```yaml
handoff_requirements:
  from_implementation_to_testing:
    required_artifacts:
      - "Implementation complete"
      - "Unit tests passing"
      - "Self-verification done"
      - "Documentation updated"
    handoff_document:
      - "What was implemented"
      - "How to test"
      - "Known issues"
      - "Test scenarios"
      
  from_testing_to_approval:
    required_artifacts:
      - "Browser test results"
      - "Acceptance criteria checklist"
      - "Screenshots/evidence"
      - "Issue report (if any)"
    handoff_document:
      - "Validation results"
      - "Evidence location"
      - "Recommendations"
      - "Approval request"
```

---

## 🎯 SUCCESS METRICS

### Team Performance KPIs

```yaml
kpis:
  implementation_team:
    - metric: "Stories completed per sprint"
      target: "8-10 stories"
      
    - metric: "Code quality at handoff"
      target: "0 TypeScript errors"
      
    - metric: "Self-verification pass rate"
      target: ">90%"
      
  testing_team:
    - metric: "Validation coverage"
      target: "100% of acceptance criteria"
      
    - metric: "Bug detection rate"
      target: ">95% before approval"
      
    - metric: "Evidence completeness"
      target: "100% with screenshots"
      
  governance_team:
    - metric: "Standards compliance"
      target: "100%"
      
    - metric: "File size violations"
      target: "0"
      
    - metric: "Import path violations"
      target: "0"
```

---

## 📅 TIMELINE

### Validation Phase (Stories 1-8)

```yaml
week_1:
  day_1:
    - "Setup validation workflow"
    - "Validate Story 1"
    - "Validate Story 2"
  day_2:
    - "Validate Story 3"
    - "Validate Story 4"
  day_3:
    - "Validate Story 5"
    - "Validate Story 6"
  day_4:
    - "Validate Story 7"
    - "Validate Story 8"
  day_5:
    - "Fix validation failures"
    - "Re-validate as needed"
```

### Implementation Phase (Stories 9-10)

```yaml
week_2:
  day_1_2:
    - "Story 9: Persistence & State Management"
    - "Full validation cycle"
  day_3_4:
    - "Story 10: Final Verification"
    - "Full validation cycle"
  day_5:
    - "Epic-level validation"
    - "Final approval"
    - "Completion report"
```

---

## 🔗 QUICK REFERENCE

### Team Contacts

| Team | Agent | Primary Role | Contact Method |
|------|-------|--------------|----------------|
| Implementation | dev-ext | Code development | Task delegation |
| Testing | tea-ext | Browser validation | Task delegation |
| Governance | bmad-governance | Quality checks | Task delegation |
| Coordination | bmad-sprint-manager | Sprint management | Direct |

### Essential Commands

```bash
# Code Quality
pnpm typecheck:fast
pnpm governance
pnpm build

# Testing
pnpm test:fast
pnpm test:e2e

# Validation
pnpm validate:story {story_id}
```

---

*Team assignments are MANDATORY and NON-NEGOTIABLE.*
*Last Updated: 2026-01-30T22:00:00+07:00*
