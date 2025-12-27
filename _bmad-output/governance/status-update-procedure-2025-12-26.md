# Status Update Procedure with MCP Research Validation

**Document ID:** `STATUS-UPDATE-PROCEDURE-2025-12-26`  
**Version:** 2.0  
**Classification:** P1 - Governance  
**Base Protocol:** [`.agent/rules/general-rules.md`](.agent/rules/general-rules.md)

---

## 1. Overview

This document defines the status update procedure including MCP research validation as part of story completion criteria.

**Related Documents:**
- [`mcp-research-enforcement-checklist-2025-12-26.md`](mcp-research-enforcement-checklist-2025-12-26.md)
- [`handoff-mcp-validation-2025-12-26.md`](handoff-mcp-validation-2025-12-26.md)

---

## 2. Story Completion Criteria

### 2.1 Standard Story Completion

A story is considered DONE when ALL of the following are complete:

| Criterion | Description | Validation |
|-----------|-------------|------------|
| **Code Complete** | All acceptance criteria met | PR reviewed & merged |
| **Tests Pass** | Unit/integration tests pass | CI pipeline green |
| **MCP Research** | Research completed for new patterns | See Section 3 |
| **Documentation** | Story documented | Artifacts in `_bmad-output/` |
| **E2E Verified** | Browser verification complete | Screenshot/recording captured |
| **Handoff Complete** | Next agent handoff created | Linked in completion report |

### 2.2 MCP Research Validation

Add to each story's definition of done:

```markdown
## MCP Research Protocol

- [ ] MCP research completed before implementation
- [ ] Research findings documented in _bmad-output/research/
- [ ] Pattern validated against existing codebase
- [ ] Integration approach confirmed
- [ ] Handoff includes MCP research section
```

---

## 3. Status Update Workflow

### 3.1 Step-by-Step Procedure

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. PRE-IMPLEMENTATION                                           │
│    □ Identify unfamiliar patterns requiring MCP research        │
│    □ Complete 4-step MCP research protocol                      │
│    □ Document findings in _bmad-output/research/                │
│    □ Include MCP section in handoff document                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. IMPLEMENTATION                                               │
│    □ Implement based on research findings                       │
│    □ Reference existing patterns in codebase                    │
│    □ Flag any deviations from research                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. CODE REVIEW                                                  │
│    □ Verify MCP research documented in handoff                  │
│    □ Check implementation matches documented approach           │
│    □ Validate no unresearched patterns introduced               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. E2E VERIFICATION                                             │
│    □ Browser test of complete workflow                          │
│    □ Capture screenshot/recording                               │
│    □ Verify all acceptance criteria met                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. STATUS UPDATE                                                │
│    □ Update sprint-status.yaml                                  │
│    □ Link research artifacts                                    │
│    □ Document handoff to next agent                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Status Update YAML Format

### 4.1 Story Status Entry

```yaml
stories:
  - story_id: "XX-Y"
    status: "BACKLOG" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED"
    assignee: "{mode-slug}"
    epic: "EPIC-XX"
    priority: "P0" | "P1" | "P2"
    
    # MCP Research Validation
    mcp_research:
      required: true | false
      completed: true | false
      research_artifacts:
        - "_bmad-output/research/{file}"
      handoff_validated: true | false
    
    # E2E Verification
    e2e_verification:
      completed: true | false
      evidence: "_bmad-output/e2e/{story}-verification-{YYYY-MM-DD}.md"
    
    # Timestamps
    created: "YYYY-MM-DD"
    started: "YYYY-MM-DD"
    completed: "YYYY-MM-DD"
    
    # Notes
    notes: "{any additional notes}"
```

---

## 5. Reporting Structure

### 5.1 Completion Report Template

```markdown
## Completion Report to BMAD Master

**Agent:** {mode-slug}  
**Story:** {epic}-{story}  
**Completed:** {YYYY-MM-DD}

### MCP Research Validation
| Step | Status | Artifact |
|------|--------|----------|
| Context7 | ✅/❌ | {file} |
| Deepwiki | ✅/❌ | {file} |
| Tavily/Exa | ✅/❌ | {file} |
| Repomix | ✅/❌ | {file} |

### Artifacts Created
- `_bmad-output/{path}/{file}`
- `_bmad-output/research/{mcp-research-file}`
- `_bmad-output/e2e/{verification-file}`

### Workflow Status Updates
Updated: `sprint-status.yaml` (story {id} → DONE)
Updated: `bmm-workflow-status.yaml` (epic {id} progress)

### Next Action
{handoff to next agent or next story}
```

---

## 6. Quality Gates

### 6.1 Story Progress Gates

| Gate | From | To | Requirements |
|------|------|-----|--------------|
| **G1** | BACKLOG | IN_PROGRESS | MCP research plan documented |
| **G2** | IN_PROGRESS | IN_REVIEW | Code complete, MCP research documented |
| **G3** | IN_REVIEW | DONE | Code reviewed, E2E verified, MCP validated |

### 6.2 Gate G2 Checklist (Pre-Review)

```
□ MCP research documented in handoff
□ Research artifacts linked
□ Implementation matches documented approach
□ No unresearched patterns detected
□ Code passes linting and type checking
```

### 6.3 Gate G3 Checklist (Completion)

```
□ Code review approved
□ All tests passing
□ E2E verification complete with screenshot
□ MCP research validated by reviewer
□ Next agent handoff prepared
```

---

## 7. Violation Handling

### 7.1 MCP Research Violations

| Violation | Action | Resolution |
|-----------|--------|------------|
| Research not completed | Story blocked at G1 | Complete MCP research |
| Research not documented | Story blocked at G2 | Document findings |
| Handoff missing MCP section | Story blocked at G2 | Add MCP section |
| Unresearched pattern detected | Code review fail | Complete research, revise code |

### 7.2 Remediation Process

```
1. Identify missing MCP step(s)
2. Complete missing research
3. Document findings in _bmad-output/research/
4. Update handoff with research
5. Resume review process
6. Log as course correction if pattern changed
```

---

## 8. Metrics & Reporting

### 8.1 Sprint Metrics

| Metric | Calculation | Target |
|--------|-------------|--------|
| MCP Research Completion Rate | stories_with_research / total_stories | 100% |
| Gate G1 Pass Rate | passed_g1 / started | > 95% |
| Gate G2 Pass Rate | passed_g2 / submitted | > 90% |
| Gate G3 Pass Rate | completed / submitted | > 85% |
| Violation Count | number of violations | 0 |

### 8.2 Weekly Report Template

```yaml
sprint_report:
  sprint: "{sprint-id}"
  period: "{start_date} - {end_date}"
  
  mcp_metrics:
    research_completion_rate: 100%
    violations: 0
    
  story_progress:
    started: n
    completed: n
    blocked: n
    
  gate_metrics:
    g1_pass_rate: 95%
    g2_pass_rate: 90%
    g3_pass_rate: 85%
    
  highlights:
    - {achievement 1}
    - {achievement 2}
    
  issues:
    - {issue 1 and resolution}
```

---

**Effective Date:** 2025-12-26  
**Governance Owner:** @bmad-bmm-pm  
**Review Cycle:** Weekly with sprint retrospectives
