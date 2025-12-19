---
nextStepFile: '{installed_path}/steps/step-04-remediation.md'
statusFile: '{project-root}/.bmad/custom/src/modules/cham/status/audit-status.json'
phaseOutputFile: '{project-root}/.bmad/custom/src/modules/cham/status/phase-synthesis.json'
roadmapFile: '{project-root}/.bmad/custom/src/modules/cham/status/remediation-roadmap.md'
---

# Step 3: Synthesis Phase

## STEP GOAL

Synthesize all 8 issue reports into a prioritized remediation roadmap with clustered issues and effort estimates.

## EXECUTION PROTOCOLS

1. **Update Status**
   - Set `currentPhase: "synthesis"` in audit-status.json
   - Set synthesis phase `status: "in_progress"`

2. **Run Synthesizer Agent**
   - Load all 8 issue reports from phase-scanning.json
   - Execute synthesizer agent synthesis workflow
   - De-duplicate related issues
   - Calculate impact scores
   - Cluster related issues
   - Sequence remediation
   - Estimate effort

3. **Generate Remediation Roadmap**
   - Create remediation-roadmap.md
   - Include issue clusters with priorities
   - Include effort estimates
   - Include dependencies between fixes
   - Include suggested timeline

4. **Save Phase Results**
   - Write phase-synthesis.json with synthesis results
   - Include roadmap reference
   - Include cluster summaries

5. **Update Status**
   - Set synthesis phase `status: "completed"`
   - Record duration
   - Set `currentPhase: "remediation"`
   - Update metrics with cluster counts

6. **Present Roadmap to User**
   - Display remediation-roadmap.md
   - Ask for approval to proceed
   - Wait for user confirmation

7. **Proceed to Next Phase**
   - Load and execute step-04-remediation.md

## OUTPUTS

- `remediation-roadmap.md` - Prioritized remediation plan
- `phase-synthesis.json` - Phase results summary

## SUCCESS CRITERIA

- All issues de-duplicated
- Clusters identified and prioritized
- Roadmap generated with estimates
- User approval received

## NEXT STEP

Proceed to Phase 4: Remediation (cluster-by-cluster fixing)
