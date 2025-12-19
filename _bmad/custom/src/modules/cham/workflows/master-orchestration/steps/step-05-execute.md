---
planFile: '{project-root}/.bmad/custom/src/modules/cham/agents/master-orchestrator-sidecar/plans/master-plan-{timestamp}.md'
promptsFile: '{project-root}/.bmad/custom/src/modules/cham/agents/master-orchestrator-sidecar/plans/cycle-prompts-{timestamp}.md'
statusFile: '{project-root}/.bmad/custom/src/modules/cham/agents/master-orchestrator-sidecar/plans/execution-status-{timestamp}.json'
---

# Step 5: Execute & Track Progress

## STEP GOAL

Guide user through executing cycles, track progress, handle feedback, and manage handoffs between cycles.

## EXECUTION PROTOCOLS

1. **Initialize Execution Tracking**
   - Create execution-status-{timestamp}.json
   - Set all cycles to "pending"
   - Initialize progress metrics

2. **For Each Cycle (Interactive Loop)**

   a. **Present Cycle Prompt**
      - Display the prompt for current cycle
      - Show what needs to be accomplished
      - Provide copy-paste ready prompt

   b. **Wait for User Execution**
      - User pastes prompt into platform chat
      - Agent/workflow auto-fetches and executes
      - User reports completion or issues

   c. **Capture Outputs**
      - Record cycle outputs
      - Save files created/modified
      - Document decisions made
      - Note any issues

   d. **Validate Completion**
      - Check success criteria
      - Verify outputs match expectations
      - Identify any blockers

   e. **Update Status**
      - Mark cycle as complete/failed
      - Record outputs
      - Update progress

   f. **Handle Feedback**
      - Collect feedback from cycle
      - Prepare handoff data for next cycle
      - Update next cycle prompt if needed

   g. **Decision Point**
      - If success: Proceed to next cycle
      - If failure: Retry or adjust plan
      - If iteration needed: Loop back

3. **Track Overall Progress**
   - Update execution-status.json
   - Show progress percentage
   - Display completed cycles
   - Show remaining cycles

4. **Handle Completion**
   - When all cycles complete
   - Validate final outputs
   - Generate completion summary
   - Provide next steps

## OUTPUTS

- execution-status-{timestamp}.json with progress
- Updated master-plan.md with results
- Cycle outputs captured
- Completion summary

## SUCCESS CRITERIA

- All cycles executed successfully
- Outputs captured and validated
- Feedback properly handed off
- Plan completed or adjusted as needed

## WORKFLOW COMPLETE

Master orchestration complete. Review execution status and final outputs.
