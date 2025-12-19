# Master Orchestrator Guide

## Overview

The Master Orchestrator is a meta-agent that understands natural language prompts, performs diagnosis and check-ups, creates master plans with sequential agent/workflow iterations, and generates executable prompts for automatic execution.

## Key Capabilities

1. **Natural Language Understanding** - Parses conversational prompts to extract objectives
2. **Comprehensive Diagnosis** - Performs check-ups and assesses current state
3. **Sequential Planning** - Breaks complex tasks into agent/workflow cycles
4. **Prompt Generation** - Creates executable prompts that auto-fetch agents/workflows
5. **Progress Tracking** - Monitors execution across cycles with feedback loops
6. **Automatic Handoffs** - Manages context and data flow between cycles

## Usage

### Basic Usage

```
agent master-orchestrator
[DP] Diagnose & Plan

[Paste your natural language request here]
```

### Example Request

```
I need to refactor the authentication system to use JWT tokens instead of sessions.
This involves updating the backend API, frontend components, and adding proper
error handling. I also need to add tests and update documentation.
```

### What Happens

1. **Understanding Phase**
   - Parses your request
   - Extracts objectives (JWT refactor, API updates, frontend changes, tests, docs)
   - Identifies scope and dependencies

2. **Diagnosis Phase**
   - Checks current authentication implementation
   - Identifies files that need changes
   - Lists required agents (Architecture Fixer, Type Safety Fixer, Test Writer, Documenter)
   - Evaluates dependencies (API changes before frontend)

3. **Planning Phase**
   - Creates master plan with cycles:
     - Cycle 1: Architecture Fixer - Update API structure
     - Cycle 2: Type Safety Fixer - Add JWT types
     - Cycle 3: Architecture Fixer - Update frontend components
     - Cycle 4: Test Writer - Add JWT tests
     - Cycle 5: Documenter - Update docs

4. **Prompt Generation**
   - Generates executable prompts for each cycle
   - Includes context from previous cycles
   - Sets up automatic handoffs

5. **Execution**
   - You paste Cycle 1 prompt into chat
   - Agent auto-fetches and executes
   - Outputs captured
   - Feedback prepared for Cycle 2
   - Repeat for all cycles

## Generated Prompts Format

Each cycle prompt includes:

```markdown
@bmad/cham/agents/[agent-name]

**Context:**
[Previous cycle outputs]

**Task:**
[Specific instructions]

**Expected Output:**
- Format: [format]
- Location: [path]
- Files: [names]

**Success Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

**Handoff:**
When complete, provide feedback:
- Status: complete/failed/needs-iteration
- Outputs: [list]
- Next Cycle Input: [data]
- Notes: [notes]

Proceed to Cycle 2 when ready.
```

## Platform Support

The Master Orchestrator generates platform-specific prompts:

- **Cursor:** `@bmad/cham/agents/[name]`
- **Windsurf:** `cham-[name]` or file references
- **Claude Code:** `/cham-[command]` or file references
- **KiloCode:** Workflow file references
- **Gemini Studio:** TOML config references
- **Agent:** `cham-[name]` or file references

## Feedback Loops

The orchestrator supports:

- **Iteration:** Loop back to previous cycle if validation fails
- **Validation Checkpoints:** Verify outputs before proceeding
- **Rollback:** Revert to previous cycle if needed
- **Adjustment:** Modify plan based on execution feedback

## Progress Tracking

All execution is tracked in:
- `master-plan-{timestamp}.md` - Complete plan with results
- `cycle-prompts-{timestamp}.md` - All executable prompts
- `execution-status-{timestamp}.json` - Real-time progress

## Advanced Features

### Parallel Cycles

The orchestrator can identify cycles that can run in parallel and generate concurrent prompts.

### Dynamic Adjustment

Based on execution feedback, the orchestrator can:
- Add new cycles if needed
- Skip cycles if outputs change
- Adjust sequence based on dependencies
- Modify prompts based on learnings

### Context Preservation

All context is preserved across cycles:
- Previous cycle outputs
- Decisions made
- Files created/modified
- Feedback collected

## Best Practices

1. **Be Specific** - Clear objectives lead to better plans
2. **Include Context** - Mention relevant files, constraints, preferences
3. **Review Plans** - Check the master plan before executing
4. **Provide Feedback** - Report issues promptly for plan adjustment
5. **Track Progress** - Monitor execution-status.json for overall progress

## Example Workflow

```
User: "I need to add dark mode support to the app"

Master Orchestrator:
1. Understands: Add dark mode (theme switching, persistence, components)
2. Diagnoses: Current theme system, components needing updates
3. Plans: 
   - Cycle 1: State Refactor - Add theme state management
   - Cycle 2: UX Consistency - Update components for dark mode
   - Cycle 3: Test Writer - Add dark mode tests
4. Generates prompts for each cycle
5. User executes cycles sequentially
6. Orchestrator tracks progress and handles handoffs
```

## Integration

The Master Orchestrator integrates with:
- All CHAM agents (for execution)
- All CHAM workflows (for complex processes)
- Platform-specific command systems
- Status tracking system

## Output Files

All orchestration files are saved to:
`.bmad/custom/src/modules/cham/agents/master-orchestrator-sidecar/plans/`

- `master-plan-{timestamp}.md` - Complete plan
- `cycle-prompts-{timestamp}.md` - Executable prompts
- `execution-status-{timestamp}.json` - Progress tracking
