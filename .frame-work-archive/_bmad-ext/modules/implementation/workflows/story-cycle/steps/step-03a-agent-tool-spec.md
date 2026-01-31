---
nextStepFile: '{installed_path}/steps/step-03-implement.md'
continueFile: '{installed_path}/steps/step-03ab-continue.md'
outputFile: '{output_folder}/story-cycle-{story_key}-output.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
workflowName: 'story-cycle'
---

# Step 3a: Agent Tool Specification

## STEP GOAL

Define LLM tool specifications (JSON Schema, System Prompt, Permissions) to ensure the AI "Brain" knows when and how to use features. Detects missing agent triggers, unclear boundaries, and permission gaps.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Define tool specs for any AI/agent features
- 📋 Verify LLM can determine when to use each tool
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Check for Agentic Features

Determine if this story involves AI/LLM tool usage:

```yaml
agentic_feature_indicators:
  - "User can ask/natural language input"
  - "AI generates content/summarizes/analyzes"
  - "Agent performs actions on behalf of user"
  - "Tool selection by AI required"
  - "Multi-step reasoning involved"

if_none:
  skip_to: "Step 3 (Implement)"
  note: "No agentic features, tool spec not required"
```

### 2. Define Tool Specifications

For each agentic feature, create:

```yaml
tool_specification:
  tool_name: "{name}"

  # LLM Tool Definition
  json_schema:
    name: "{tool_name}"
    description: "{when to use this tool - 1 sentence}"
    parameters:
      - name: "{param}"
        type: "{string|number|boolean|array}"
        description: "{what this parameter means}"
        required: true|false

  # Agent Behavior
  system_prompt_context:
    trigger: "When user asks/hints: {condition}"
    not_trigger: "DO NOT use when: {conditions}"
    risk_assessment: "{latency|permission|safety concerns}"

  # Permission Level
  permission:
    level: "{auto_grant|user_confirm|admin_only}"
    reason: "{why this level}"

  # UI State During Execution
  ui_feedback:
    while_thinking: "{what user sees during AI processing}"
    on_success: "{result display}"
    on_error: "{error handling}"
    on_timeout: "{timeout handling}"
```

### 3. Detect Tool Spec Anti-Patterns

```yaml
anti_patterns_to_detect:
  orphan_tool:
    description: "Tool defined but no clear trigger"
    check: "When does LLM know to use this?"

  permission_gap:
    description: "Dangerous action without user confirmation"
    check: "Does tool modify data without permission?"

  silent_thinking:
    description: "No feedback while AI processes"
    check: "What does user see during execution?"

  vague_trigger:
    description: "Unclear when to invoke tool"
    check: "Can LLM distinguish this from other tools?"

  timeout_void:
    description: "No timeout/error handling"
    check: "What if tool takes too long or fails?"

  permission_overload:
    description: "Too many confirmations for low-risk actions"
    check: "Is user asked for trivial actions?"
```

### 4. Create Tool Definition Files

Generate `tool-definition.json`:

```json
{
  "tools": [
    {
      "name": "{tool_name}",
      "description": "{clear description for LLM}",
      "parameters": {
        "type": "object",
        "properties": {
          "{param}": {
            "type": "{type}",
            "description": "{description}"
          }
        },
        "required": ["{required_params}"]
      },
      "permission": "{auto_grant|user_confirm|admin_only}",
      "uiContext": {
        "whileProcessing": "{feedback during AI thinking}",
        "onResult": "{how result is displayed}",
        "onError": "{error handling}"
      }
    }
  ]
}
```

### 5. Display Tool Spec Summary

```
═══════════════════════════════════════════════════════════
AGENT TOOL SPECIFICATION - THE BRAIN CHECK
═══════════════════════════════════════════════════════════

Story: {story_key}

Agentic Features: {count}

Tool Definitions:
┌─────────────────────────────────────────────────────────┐
│ Tool: {tool_name}                                      │
│ Trigger: When user {condition}                        │
│ Permission: {auto_grant|user_confirm|admin_only}       │
│                                                          │
│ [✓] Clear trigger condition                           │
│ [✓] Appropriate permission level                       │
│ [✓] UI feedback defined                                │
│ [✓] Error handling defined                             │
└─────────────────────────────────────────────────────────┘

Anti-Patterns Detected:
{list of any detected issues}

Tool Spec Files Generated:
├─ tool-definition.json
└─ prompt-context.md

Overall: {PASS → PROCEED | FAIL → REDEFINE}

Options:
[P] Proceed to implementation
[R] Refine tool specs
[F] Flag for review (minor issues)
```

### 6. Handle User Choice

**P**: Tool specs validated → Step 3 (Implement)
**R**: Refine tool specifications → Stay in step
**F**: Minor issues flagged → Proceed with notes

### 7. Update Frontmatter

```yaml
---
stepsCompleted: [1, "1a", 2, "3a"]
tool_specs_defined: true
tools_count: {count}
tool_definition: "{output_folder}/tool-definition.json"
anti_patterns_detected: [{list}]
---
```

---

## SUCCESS METRICS

- ✅ Every tool has clear trigger condition
- ✅ Permission levels appropriate to risk
- ✅ UI feedback defined for all states
- ✅ Error/timeout handling specified
- ✅ No critical anti-patterns

## FAILURE METRICS

- ❌ Unclear tool trigger
- ❌ Missing user confirmation for risky actions
- ❌ No feedback during processing
- ❌ No error handling defined
- ❌ Permission overload (too many confirmations)

## GATE: Agent Brain Gate

This step implements the **Agent Brain Gate**. A tool specification that's unclear or missing will cause the AI to hallucinate behavior or fail silently.

**ONLY WHEN tool specs complete or not applicable, load {nextStepFile}**
