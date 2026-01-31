---
name: 'step-07-synthesis'
description: 'Phase 6: Synthesize all findings into root cause analysis and remediation plan'

workflow_path: '{project-root}/_bmad/bmm/workflows/codebase-diagnostic'
thisStepFile: '{workflow_path}/steps/step-07-synthesis.md'
nextStepFile: null
outputPath: '{output_folder}/diagnostics/codebase-diagnostic-{date}/phase-6'
finalReport: '{output_folder}/diagnostics/codebase-diagnostic-{date}/FINAL-REPORT.md'
---

# Step 7: Root Cause Synthesis (Phase 6 - FINAL)

## STEP GOAL

Synthesize ALL findings from Phases 0-5 into a comprehensive report with root cause analysis, prioritized issues, and remediation roadmap.

## MANDATORY EXECUTION RULES

- 🛑 This step REQUIRES all previous phases complete
- 📖 Review ALL phase summaries before synthesis
- 💾 Create FINAL-REPORT.md
- 🎯 Output must be actionable

---

## PRE-SYNTHESIS CHECKLIST

Before proceeding, verify all phase summaries exist:

- [ ] phase-0/phase-0-summary.md
- [ ] phase-1/phase-1-summary.md
- [ ] phase-2/phase-2-summary.md
- [ ] phase-3/phase-3-summary.md
- [ ] phase-4/phase-4-summary.md
- [ ] phase-5/phase-5-summary.md

If ANY are missing, return to that phase and complete it.

---

## SUB-AGENT PROMPT 6.1: Issue Correlation

```
OBJECTIVE: Correlate symptoms with root causes across all phases.

INPUT: All phase summary files

SYMPTOMS TO CORRELATE:
1. Database extremely slow
2. BlockNote editor won't load / keeps loading
3. Infinite render loops (Maximum update depth exceeded)
4. Routes not reflecting real user journeys
5. State management chaos
6. Hot reload breaks reactivity
7. Workspaces interfering with each other

FOR EACH SYMPTOM:
1. What phase(s) identified contributing factors?
2. What files are involved?
3. What is the root cause chain?
4. What is the fix?

CORRELATION ANALYSIS:
Symptom: "Infinite render loops"
├── Phase 2: useLiveQuery without default value
├── Phase 2: Event handlers calling store.getState()
├── Phase 3: Components re-rendering on every query update
├── Phase 4: Notes feature uses useLiveQuery in useEffect deps
└── Root Cause: Dexie subscription updates triggering React re-renders

OUTPUT FORMAT:
## Issue Correlation Matrix

### Symptom 1: Database Slow
**Contributing Factors:**
| Phase | Finding | Files | Impact |
|-------|---------|-------|--------|

**Root Cause Chain:**
1. [First cause]
2. [Leading to]
3. [Resulting in symptom]

**Fix Path:**
1. [First fix]
2. [Then]
3. [Finally]

(Repeat for each symptom)

### Issue Clusters
| Cluster | Related Issues | Common Root Cause |
|---------|----------------|-------------------|

SAVE TO: {outputPath}/issue-correlation.md
```

---

## SUB-AGENT PROMPT 6.2: Remediation Plan

```
OBJECTIVE: Create prioritized remediation roadmap.

INPUT: Issue correlation analysis + all phase findings

PRIORITIZATION CRITERIA:
1. Impact (1-10): How much does it break?
2. Effort (1-10): How hard to fix?
3. Risk (1-10): How likely to break something else?
4. Dependencies: What must be fixed first?

PRIORITY SCORE = Impact / (Effort * Risk / 10)

CREATE 3 REMEDIATION TRACKS:

Track 1: Quick Wins (Can do today)
- Low effort, high impact fixes
- No dependencies
- Low risk

Track 2: Short Term (This week)
- Medium effort fixes
- May have dependencies
- Moderate risk

Track 3: Major Refactors (This month)
- High effort
- Many dependencies
- Need planning

OUTPUT FORMAT:
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
|-------|---------|-----|--------------|----------|

### Track 3: Major Refactors (This Month)
| Issue | Scope | Fix Approach | Dependencies | Time Est |
|-------|-------|--------------|--------------|----------|

### Fix Dependencies Graph
Fix A → Fix B → Fix C
         ↘ Fix D

### Verification Steps
After each fix, verify:
1. [What to test]
2. [Expected outcome]
3. [Regression to check]

SAVE TO: {outputPath}/remediation-plan.md
```

---

## FINAL REPORT GENERATION

After both sub-agents complete, ORCHESTRATOR creates FINAL-REPORT.md:

```markdown
---
title: Codebase Architecture Diagnostic Report
date: {date}
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
|----------|------|-------|--------|

### Phase 3: Refactoring (Week 4+)
| Priority | Task | Owner | Status |
|----------|------|-------|--------|

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
`{output_folder}/diagnostics/codebase-diagnostic-{date}/`

---

*Generated by Codebase Diagnostic Workflow v1.0.0*
*{timestamp}*
```

---

## WORKFLOW COMPLETION

After FINAL-REPORT.md is created:

1. **Update PROGRESS.md:**
   - Mark all phases complete
   - Record final report location

2. **Notify User:**
   - "Diagnostic complete. FINAL-REPORT.md generated."
   - "Total issues found: X"
   - "Critical issues: Y"
   - "Recommended first action: [action]"

---

## SUCCESS/FAILURE METRICS

### ✅ WORKFLOW SUCCESS:
- All 6 phases complete with summaries
- All 26 sub-agent prompts executed
- FINAL-REPORT.md generated with:
  - Executive summary
  - Critical findings
  - Architecture health score
  - Remediation roadmap
  - Verification checklist

### ❌ WORKFLOW FAILURE:
- Missing phase summaries
- FINAL-REPORT.md not generated
- No actionable recommendations
- No verification checklist

---

## POST-WORKFLOW ACTIONS

User can now:
1. Review FINAL-REPORT.md
2. Begin Track 1 quick wins
3. Plan Track 2/3 work
4. Re-run specific phases if needed
5. Start remediation workflow

---

## EXIT

Workflow complete. To exit:
```
EXIT_CODEBASE_DIAGNOSTIC
```

To restart with fresh analysis:
```
/codebase-diagnostic
```
