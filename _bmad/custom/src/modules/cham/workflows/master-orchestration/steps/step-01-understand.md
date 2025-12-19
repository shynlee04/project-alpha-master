---
nextStepFile: '{installed_path}/steps/step-02-diagnose.md'
planFile: '{project-root}/.bmad/custom/src/modules/cham/agents/master-orchestrator-sidecar/plans/master-plan-{timestamp}.md'
---

# Step 1: Understand Natural Language Prompt

## STEP GOAL

Parse and understand the user's natural language prompt to extract objectives, context, and requirements.

## EXECUTION PROTOCOLS

1. **Parse Natural Language**
   - Extract key objectives from user prompt
   - Identify domain/context (codebase, documentation, architecture, etc.)
   - Determine scope (single task, multi-step, complex workflow)
   - Note constraints (time, resources, dependencies)

2. **Extract Key Information**
   - **What:** What needs to be accomplished?
   - **Why:** What's the underlying goal?
   - **How:** Any preferred approach mentioned?
   - **When:** Any timing constraints?
   - **Who:** Any specific agents/workflows mentioned?

3. **Create Understanding Summary**
   - Write parsed understanding to plan file
   - Document extracted objectives
   - Note any ambiguities that need clarification

4. **Proceed to Diagnosis**
   - Load and execute step-02-diagnose.md

## OUTPUTS

- Understanding summary in master-plan.md
- Extracted objectives
- Identified context and scope

## SUCCESS CRITERIA

- Clear understanding of user's intent
- Objectives extracted and documented
- Ready for diagnosis phase

## NEXT STEP

Proceed to Step 2: Diagnosis
