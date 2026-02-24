---
title: "Architecture Change Governance Workflows"
version: "1.0.0"
status: "ACTIVE"
created: "2026-01-28T18:00:00+07:00"
author: "ext-master-enhanced + Investigation Team"
confidence: "95%"
related_adrs:
  - "ADR-039: Unified Architecture"
  - "ADR-040: Governance Improvements (PENDING)"
investigation_reference: "Root Cause Analysis 2026-01-28"
---

# Architecture Change Governance Workflows

> **Purpose**: Define procedures for handling architectural changes in brownfield projects while preventing the code waste patterns identified in investigation (1,479 archived files, 46-60 hours wasted, 35% governance health).

## Document Hierarchy (Authority Flow)

| Tier | Documents | Changeability | Governance |
|------|-----------|---------------|------------|
| **1 - Constitution** | new-fundamental-truths.md, ADRs, BMAD Constitution | Permanent | Read-only after approval |
| **2 - Controlled** | PRD → architecture.md → ux-spec → epics.md | Requires workflow | Full governance process |
| **3 - Execution** | sprint-status.yaml, stories, workflow-status | Ephemeral | 2-hour freshness rule |

## BMAD Loop Hierarchy

| Loop | Agent | Scope | Duration |
|------|-------|-------|----------|
| **Outer** | ext-master-enhanced | Strategic, cross-epic | Hours to days |
| **Middle** | bmad-sprint-manager | Tactical, sprint-level | 4-8 hours |
| **Inner** | dev-ext, architect-ext, etc. | Operational, story-level | 1-4 hours |

---

## Workflow 1: Architecture Evolution (Team AGREES)

### Trigger
User proposes architectural change AND team analysis supports the proposal.

### Procedure

#### Step 1: Context Gathering (MANDATORY PRE-GATE)

| Actor | Action | Output |
|-------|--------|--------|
| ext-master | Pause active sprints | Sprint status = PAUSED |
| analyst-ext | Load architecture.md, ADRs | Context bundle |
| architect-ext | Analyze proposal vs current | Gap analysis |

**Dry Reading Commands (MANDATORY)**:
```bash
grep -r "related patterns\|similar decisions" _bmad-output/planning-artifacts/adr/
grep -r "interface\|export type" src/domain/ src/infrastructure/
```

#### Step 2: Research & Impact Assessment

| Check | Tool | Output |
|-------|------|--------|
| Best practices | Internet research | Research findings |
| Code impact | grep/glob analysis | Files affected list |
| Architecture violations | deep-scan-orchestrator | Violation report |

#### Step 3: ADR Creation

```markdown
# ADR-0XX: [Decision Title]
## Status: PROPOSED → [Requires USER APPROVAL] → APPROVED
## Context: [Current state + proposal + evidence]
## Decision: [What we will do]
## Consequences: [Positive + Migration Cost]
## Migration Plan: [Epic breakdown]
```

#### Step 4: Document Cascade Update

Update in order (each references ADR ID):
1. architecture.md
2. new-fundamental-truths.md (if core principle)
3. ux-specification (if UI impact)
4. prd.md (if scope change)

#### Step 5: Epic Revision/Creation

| Scenario | Action |
|----------|--------|
| Active EPICs impacted | Add migration stories OR cancel |
| New migration needed | Create EPIC-MIGRATION-XXX |
| Cleanup required | Create EPIC-CLEANUP-XXX |

#### Step 6: Sprint Replanning

Priority rules:
1. Migration stories before new features
2. Foundation fixes before UI polish
3. Breaking changes in isolated sprints

#### Step 7: Execute with Enhanced Governance

**Pre-Story Gate**:
- [ ] ADR reference documented
- [ ] Files in canonical paths
- [ ] No workspaceId in new code
- [ ] Dry reading output attached

**Story Completion Gate**:
- [ ] E2E user journey validated (NOT just TypeScript)
- [ ] No temporary code without paired revert
- [ ] LOOP_STATE updated within 2 hours

#### Step 8: Post-Migration Validation

| Check | Success Criteria |
|-------|------------------|
| Routes | Only /hub, /$projectId |
| State patterns | 0 persist() violations |
| Directory structure | 0 files in deprecated paths |
| Architecture scan | 0 violations |

---

## Workflow 2: Counter-Proposal (Team OPPOSES)

### Trigger
User proposes architectural change AND team analysis shows risks outweigh benefits.

### Opposition Criteria (3+ must fail)

| Criterion | Question |
|-----------|----------|
| Technical Feasibility | Is it possible within constraints? |
| Cost-Benefit Ratio | Does benefit justify migration cost? |
| PRD Alignment | Does it serve product goals? |
| Risk Assessment | What could go wrong? |
| Timing | Is this the right time? |
| Alternatives | Is there a better way? |

### Counter-Proposal Template

```markdown
# Counter-Proposal: [User's Proposal Title]

## User's Proposal
[Summary]

## Team's Opposition
Based on criteria analysis:
- Criterion X: FAILED - [evidence]
- Criterion Y: FAILED - [evidence]  
- Criterion Z: FAILED - [evidence]

## Alternative Recommendation
[Better approach with benefits]

## Escalation Path
If user insists:
- Create ADR with documented risks
- POC story first (time-boxed)
- Rollback criteria defined
```

### Escalation Protocol

**If User Accepts Advice**:
- Create ADR (Status: REJECTED)
- Document rationale
- Continue current path

**If User Overrides**:
- Create ADR (Status: APPROVED with risks)
- POC story first
- Gate: User approves POC results before full implementation

---

## Governance Gates Summary

| Gate | When | Blocks If |
|------|------|-----------|
| Context Gathering | Before any architectural discussion | No dry reading done |
| ADR Approval | Before document cascade | User hasn't approved |
| Pre-Story | Before each story starts | Missing ADR reference, wrong paths |
| Story Completion | Before marking done | Only TypeScript passed, no E2E |
| Post-Migration | After epic complete | Architecture violations exist |

---

## Root Causes This Prevents

| Root Cause | Prevention Mechanism |
|------------|---------------------|
| Architecture defined after implementation | Step 1 Context Gathering |
| 3-Step Validation never practiced | Embedded in all gates |
| Premature completion claims | Post-Migration Validation |
| Temporary code not reverted | Story Completion Gate |
| File tree governance ignored | Pre-Story Gate |
| No enforcement mechanism | Blocking gates at every step |

---

## Appendix: Decision Log Template

```yaml
decision_log:
  id: DL-YYYY-MM-DD-XXX
  proposal: "[Description]"
  team_recommendation: SUPPORT | OPPOSE
  user_decision: ACCEPT_ADVICE | OVERRIDE
  outcome: PENDING | SUCCESS | FAILURE
  adr_id: ADR-0XX
  lessons_learned: []
```

---

*Generated: 2026-01-28 | Confidence: 95% | Based on investigation of 1,479 archived files and 683 governance violations*
