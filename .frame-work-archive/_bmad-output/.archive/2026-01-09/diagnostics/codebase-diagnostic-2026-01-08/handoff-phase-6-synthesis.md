---
handoff_id: "HANDOFF-PHASE-6-2026-01-08"
session: "CODEBASE-DIAGNOSTIC-2026-01-08"
created_at: "2026-01-08T17:35:00+07:00"
status: "PENDING"
depends_on: "phase-5-complete"
---

# Handoff: Phase 6 - Root Cause Synthesis (FINAL)

**From:** bmad-master (Orchestrator)
**To:** Sub-Agents (Sequential Execution)
**Phase:** 6 - Synthesis
**Output Folder:** `_bmad-output/diagnostics/codebase-diagnostic-2026-01-08/phase-6/`

---

## Overview

Synthesize ALL findings from Phases 0-5 into a comprehensive report with root cause analysis, prioritized issues, and remediation roadmap.

**Sub-Agents Required:** 2 (sequential - 6.1 must complete before 6.2)

**Prerequisite:** ALL previous phases (0-5) must be complete

---

## Pre-Synthesis Checklist

Before proceeding, verify:
- [ ] phase-0/phase-0-summary.md exists
- [ ] phase-1/phase-1-summary.md exists
- [ ] phase-2/phase-2-summary.md exists
- [ ] phase-3/phase-3-summary.md exists
- [ ] phase-4/phase-4-summary.md exists
- [ ] phase-5/phase-5-summary.md exists

**If ANY are missing, return to that phase and complete it.**

---

## Sub-Agent Assignment 6.1: Issue Correlation

### Agent Mode: `@bmad-bmm-pm` or `@bmad-core-bmad-master`

### Objective
Correlate symptoms with root causes across all phases.

### Symptoms to Correlate
1. Database extremely slow
2. BlockNote editor won't load / keeps loading
3. Infinite render loops (Maximum update depth exceeded)
4. Routes not reflecting real user journeys
5. State management chaos
6. Hot reload breaks reactivity
7. Workspaces interfering with each other

### Tasks
For EACH symptom:
1. What phase(s) identified contributing factors?
2. What files are involved?
3. What is the root cause chain?
4. What is the fix?

### Output Format
Save to: `phase-6/issue-correlation.md`

```markdown
## Issue Correlation Matrix

### Symptom 1: Database Slow
**Contributing Factors:**
| Phase | Finding | Files | Impact |

**Root Cause Chain:**
1. [First cause]
2. [Leading to]
3. [Resulting in symptom]

**Fix Path:**
1. [First fix]
2. [Then]
3. [Finally]

### Issue Clusters
| Cluster | Related Issues | Common Root Cause |
|---------|----------------|-------------------|
```

---

## Sub-Agent Assignment 6.2: Remediation Plan

### Agent Mode: `@bmad-bmm-pm` or `@bmad-bmm-sm`

### Objective
Create prioritized remediation roadmap.

### Prioritization Criteria
1. **Impact** (1-10): How much does it break?
2. **Effort** (1-10): How hard to fix?
3. **Risk** (1-10): How likely to break something else?
4. **Dependencies**: What must be fixed first?

**Priority Score = Impact / (Effort * Risk / 10)**

### Tasks
Create 3 remediation tracks:
- **Track 1**: Quick Wins (Can do today)
- **Track 2**: Short Term (This week)
- **Track 3**: Major Refactors (This month)

### Output Format
Save to: `phase-6/remediation-plan.md`

```markdown
## Remediation Roadmap

### Priority Score Calculation
| Issue | Impact | Effort | Risk | Score | Track |
|-------|--------|--------|------|-------|-------|

### Track 1: Quick Wins (Do Today)
| Issue | File(s) | Fix | Time Est |
|-------|---------|-----|----------|
| Add default to useLiveQuery | workspace-access-helper.tsx | Add [] default | 15min |

### Track 2: Short Term (This Week)
| Issue | File(s) | Fix | Dependencies | Time Est |

### Track 3: Major Refactors (This Month)
| Issue | Scope | Fix Approach | Dependencies | Time Est |

### Fix Dependencies Graph
Fix A → Fix B → Fix C
         ↘ Fix D
```

---

## FINAL REPORT GENERATION

After both sub-agents complete, ORCHESTRATOR creates:

### File: FINAL-REPORT.md
Location: `_bmad-output/diagnostics/codebase-diagnostic-2026-01-08/FINAL-REPORT.md`

```markdown
---
title: Codebase Architecture Diagnostic Report
date: 2026-01-08
status: Complete
phases_completed: 6
sub_agents_executed: 26
---

# Codebase Architecture Diagnostic Report

## Executive Summary

This diagnostic analyzed {X} files across {Y} directories to identify
architectural issues causing:
- [Symptom 1]
- [Symptom 2]
- [Symptom 3]

**Root Cause:** [One sentence summary]

**Recommendation:** [One sentence action]

---

## Diagnostic Scope

| Metric | Value |
|--------|-------|
| Total Files Analyzed | X |
| Routes Traced | X |
| Stores Inventoried | X |
| Database Tables | X |
| Events Mapped | X |
| Sub-Agents Executed | 26 |

---

## Critical Findings

### 1. [Most Critical Issue]
**Impact:** [What breaks]
**Root Cause:** [Why it happens]
**Fix:** [How to fix]
**Files:** [List of files]

### 2. [Second Critical Issue]
(Same format)

### 3. [Third Critical Issue]
(Same format)

---

## Architecture Health Score

| Area | Score | Status |
|------|-------|--------|
| Routing | X/10 | 🔴/🟡/🟢 |
| State Management | X/10 | |
| Database | X/10 | |
| Performance | X/10 | |
| Cross-Feature | X/10 | |
| **Overall** | **X/10** | |

---

## Remediation Roadmap

### Phase 1: Stabilization (Week 1)
| Priority | Task | Owner | Status |
|----------|------|-------|--------|
| P0 | [Task] | | ⏳ |

### Phase 2: Optimization (Week 2-3)
| Priority | Task | Owner | Status |

### Phase 3: Refactoring (Week 4+)
| Priority | Task | Owner | Status |

---

## Verification Checklist

After remediation, verify:
- [ ] Notes workspace loads without infinite loop
- [ ] IDE workspace loads without blocking
- [ ] BlockNote editor initializes correctly
- [ ] Database queries complete in <100ms
- [ ] Cross-workspace navigation maintains state
- [ ] No console errors on any route

---

## Appendix: Phase Summaries

### Phase 0: Codebase Structure
(Summary from phase-0-summary.md)

### Phase 1: User Journeys
(Summary from phase-1-summary.md)

### Phase 2: Data Flow
(Summary from phase-2-summary.md)

### Phase 3: Performance
(Summary from phase-3-summary.md)

### Phase 4: Features
(Summary from phase-4-summary.md)

### Phase 5: Integration
(Summary from phase-5-summary.md)

---

## Detailed Reports

All detailed analysis files are in:
`_bmad-output/diagnostics/codebase-diagnostic-2026-01-08/`

---

*Generated by Codebase Diagnostic Workflow v1.0.0*
*2026-01-08*
```

---

## Workflow Completion

After FINAL-REPORT.md is created:

1. Update PROGRESS.md:
   - Mark all phases complete
   - Record final report location

2. Notify User:
   - "Diagnostic complete. FINAL-REPORT.md generated."
   - "Total issues found: X"
   - "Critical issues: Y"
   - "Recommended first action: [action]"

---

## Success/Failure Metrics

### ✅ WORKFLOW SUCCESS
- All 6 phases complete with summaries
- All 26 sub-agent prompts executed
- FINAL-REPORT.md generated with:
  - Executive summary
  - Critical findings
  - Architecture health score
  - Remediation roadmap
  - Verification checklist

### ❌ WORKFLOW FAILURE
- Missing phase summaries
- FINAL-REPORT.md not generated
- No actionable recommendations
- No verification checklist

---

## Exit

**Workflow complete.** To exit:
```
EXIT_CODEBASE_DIAGNOSTIC
```

To restart with fresh analysis:
```
/codebase-diagnostic
```

---

**Generated by:** bmad-master orchestrator
**Final Phase:** 6 - Synthesis
