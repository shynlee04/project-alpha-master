---
nextStepFile: '{installed_path}/steps/step-04-generate-prompts.md'
planFile: '{project-root}/.bmad/custom/src/modules/cham/agents/master-orchestrator-sidecar/plans/master-plan-{timestamp}.md'
---

# Step 3: Create Master Plan

## STEP GOAL

Create a master plan with sequential agent/workflow cycles, including objectives, handoffs, and feedback loops.

## EXECUTION PROTOCOLS

1. **Design Cycle Sequence**
   - Break objective into logical cycles
   - Order cycles by dependencies
   - Identify parallel opportunities
   - Plan feedback loops

2. **Define Each Cycle**
   For each cycle:
   - **Cycle Name:** Descriptive name
   - **Agent:** Which agent executes
   - **Workflow:** Which workflow (if needed)
   - **Objective:** What this cycle accomplishes
   - **Input:** What this cycle needs
   - **Output:** What this cycle produces
   - **Success Criteria:** How to validate
   - **Handoff To:** Next cycle or completion

3. **Plan Feedback Loops**
   - When to iterate (validation failures)
   - When to proceed (success)
   - Checkpoint locations
   - Rollback scenarios

4. **Create Master Plan Document**
   - Write complete plan to master-plan.md
   - Include all cycles with details
   - Document feedback loops
   - Set completion criteria

5. **Proceed to Prompt Generation**
   - Load and execute step-04-generate-prompts.md

## OUTPUTS

- Complete master-plan.md with all cycles
- Cycle sequence with dependencies
- Feedback loop definitions
- Completion criteria

## SUCCESS CRITERIA

- All cycles defined with clear objectives
- Dependencies properly sequenced
- Feedback loops planned
- Ready for prompt generation

## NEXT STEP

Proceed to Step 4: Generate Executable Prompts
