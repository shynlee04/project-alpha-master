---
nextStepFile: '{installed_path}/steps/step-05-execute.md'
planFile: '{project-root}/.bmad/custom/src/modules/cham/agents/master-orchestrator-sidecar/plans/master-plan-{timestamp}.md'
promptsFile: '{project-root}/.bmad/custom/src/modules/cham/agents/master-orchestrator-sidecar/plans/cycle-prompts-{timestamp}.md'
---

# Step 4: Generate Executable Prompts

## STEP GOAL

Generate executable prompts for each cycle that can be pasted directly into platform chat sessions to auto-fetch and execute agents/workflows.

## EXECUTION PROTOCOLS

1. **For Each Cycle in Master Plan**

   Generate a prompt that includes:

   a. **Agent/Workflow Auto-Fetch**
      - Platform-specific syntax (@bmad/cham/agents/name)
      - Workflow reference if needed
      - Proper formatting for platform

   b. **Context Section**
      - Previous cycle outputs (if any)
      - Relevant background information
      - Current state context

   c. **Task Section**
      - Specific instructions for this cycle
      - Clear objectives
      - Expected approach

   d. **Output Section**
      - Expected output format
      - Where to save outputs
      - File naming conventions

   e. **Success Criteria**
      - How to validate completion
      - What indicates success
      - What indicates failure

   f. **Handoff Section**
      - Next cycle reference
      - Feedback format
      - How to signal completion
      - Where to save handoff data

2. **Format Prompts for Platform**
   - Use platform-specific syntax
   - Ensure auto-fetch works
   - Include all necessary context
   - Make instructions clear and executable

3. **Create Prompts Document**
   - Write all cycle prompts to cycle-prompts-{timestamp}.md
   - Organize by cycle number
   - Include usage instructions
   - Add platform-specific notes

4. **Proceed to Execution**
   - Load and execute step-05-execute.md

## OUTPUTS

- cycle-prompts-{timestamp}.md with all executable prompts
- Platform-specific formatting
- Usage instructions

## SUCCESS CRITERIA

- All cycles have executable prompts
- Prompts auto-fetch agents/workflows
- Clear handoff instructions
- Ready for execution

## NEXT STEP

Proceed to Step 5: Execute & Track
