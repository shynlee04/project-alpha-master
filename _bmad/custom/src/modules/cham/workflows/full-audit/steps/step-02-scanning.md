---
nextStepFile: '{installed_path}/steps/step-03-synthesis.md'
statusFile: '{project-root}/.bmad/custom/src/modules/cham/status/audit-status.json'
phaseOutputFile: '{project-root}/.bmad/custom/src/modules/cham/status/phase-scanning.json'
issueReportsPath: '{project-root}/.bmad/custom/src/modules/cham/status/issue-reports'
---

# Step 2: Scanning Phase

## STEP GOAL

Execute 8 specialized scanning agents in parallel to detect issues across all dimensions of code health.

## EXECUTION PROTOCOLS

1. **Update Status**
   - Set `currentPhase: "scanning"` in audit-status.json
   - Set scanning phase `status: "in_progress"`

2. **Run All 8 Scanning Agents in Parallel**
   
   **Agent 1: Architecture Compliance**
   - Execute architecture-compliance agent
   - Output: issue-reports/architecture.json
   
   **Agent 2: Dependency Hygiene**
   - Execute dependency-hygiene agent
   - Output: issue-reports/dependencies.json
   
   **Agent 3: Type Safety**
   - Execute type-safety agent
   - Output: issue-reports/type-safety.json
   
   **Agent 4: State Management**
   - Execute state-management agent
   - Output: issue-reports/state.json
   
   **Agent 5: Performance**
   - Execute performance agent
   - Output: issue-reports/performance.json
   
   **Agent 6: Test Coverage**
   - Execute test-coverage agent
   - Output: issue-reports/testing.json
   
   **Agent 7: UX Consistency**
   - Execute ux-consistency agent
   - Output: issue-reports/ux.json
   
   **Agent 8: Security & Data Flow**
   - Execute security-data-flow agent
   - Output: issue-reports/security.json

3. **Wait for All Agents to Complete**
   - Monitor all agent outputs
   - Verify all 8 reports generated
   - Check for agent failures

4. **Save Phase Results**
   - Write phase-scanning.json with all agent results
   - Include references to all 8 issue reports
   - Calculate total issues found

5. **Update Status**
   - Set scanning phase `status: "completed"`
   - Record duration
   - Set `currentPhase: "synthesis"`
   - Update metrics with issue counts

6. **Proceed to Next Phase**
   - Load and execute step-03-synthesis.md

## OUTPUTS

- `issue-reports/architecture.json`
- `issue-reports/dependencies.json`
- `issue-reports/type-safety.json`
- `issue-reports/state.json`
- `issue-reports/performance.json`
- `issue-reports/testing.json`
- `issue-reports/ux.json`
- `issue-reports/security.json`
- `phase-scanning.json` - Phase results summary

## SUCCESS CRITERIA

- All 8 scanning agents completed
- All 8 issue reports generated
- Total issue count calculated
- Status file updated

## NEXT STEP

Proceed to Phase 3: Synthesis (merge reports, create roadmap)
