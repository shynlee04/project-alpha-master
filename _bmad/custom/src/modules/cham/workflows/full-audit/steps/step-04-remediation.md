---
nextStepFile: '{installed_path}/steps/step-05-validation.md'
statusFile: '{project-root}/.bmad/custom/src/modules/cham/status/audit-status.json'
phaseOutputFile: '{project-root}/.bmad/custom/src/modules/cham/status/phase-remediation.json'
roadmapFile: '{project-root}/.bmad/custom/src/modules/cham/status/remediation-roadmap.md'
---

# Step 4: Remediation Phase

## STEP GOAL

Fix issues cluster-by-cluster with user approval, test validation after each fix, and track progress.

## EXECUTION PROTOCOLS

1. **Update Status**
   - Set `currentPhase: "remediation"` in audit-status.json
   - Set remediation phase `status: "in_progress"`

2. **Load Remediation Roadmap**
   - Read remediation-roadmap.md
   - Get list of clusters in priority order

3. **For Each Cluster (Interactive Loop)**
   
   a. **Present Cluster to User**
      - Show cluster description
      - Show files affected
      - Show effort estimate
      - Ask for approval: [A] Approve [S] Skip [P] Pause
   
   b. **If Approved:**
      - Identify appropriate fixer agent(s)
      - Execute fixer agent(s)
      - Make code changes
      - Update imports
      - Run affected tests
   
   c. **Run Test Validator**
      - Execute test-validator agent
      - Run full test suite
      - Check coverage delta
      - Report regressions
   
   d. **If Tests Fail:**
      - Fixer agent debugs
      - Iterate until green
      - Max 3 iterations
   
   e. **If Tests Pass:**
      - Commit with descriptive message
      - Tag: remediation/cluster-X-complete
      - Update roadmap (mark cluster done)
      - Generate migration notes
   
   f. **Update Status**
      - Record cluster completion
      - Update progress metrics

4. **Save Phase Results**
   - Write phase-remediation.json with all cluster results
   - Include completion status for each cluster
   - Include test results
   - Include migration notes

5. **Update Status**
   - Set remediation phase `status: "completed"`
   - Record duration
   - Set `currentPhase: "validation"`
   - Update metrics with fixes applied

6. **Proceed to Next Phase**
   - Load and execute step-05-validation.md

## OUTPUTS

- Fixed code files
- Migration notes per cluster
- `phase-remediation.json` - Phase results summary
- Updated remediation-roadmap.md (clusters marked complete)

## SUCCESS CRITERIA

- All approved clusters fixed
- All tests passing
- No regressions introduced
- Migration notes generated

## NEXT STEP

Proceed to Phase 5: Validation (re-scan and final report)
