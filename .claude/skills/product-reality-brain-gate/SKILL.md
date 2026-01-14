# Product Reality: Brain Gate

> **Version**: 1.0.0 | **Step**: 03a - Agent Tool Specification

---

## description

Define LLM tools properly - ensure the AI knows **when** to use a tool, **how** to invoke it, and **what** permissions are required.

---

## When to Use

Invoke this skill when:
- Story involves AI/LLM tool invocation
- Story adds new agent capabilities
- Validating agent tool definitions
- Sprint planning (agent integration validation)

---

## Tool Specification Template

Every LLM tool must define:

```json
{
  "tool_name": "{name}",
  "description": "{what the tool does, when to use it}",
  "json_schema": {
    "type": "object",
    "properties": { ... },
    "required": []
  },
  "system_prompt": "{Instructions for LLM on when/how to use}",
  "trigger": {
    "condition": "{When user asks X}",
    "NOT_trigger": "{Don't invoke for Y}"
  },
  "permission_level": "auto_grant | user_confirm | admin_only",
  "risk_assessment": {
    "latency": "low | medium | high",
    "side_effects": "none | state_change | data_modification",
    "cost_per_call": "estimate"
  },
  "ui_state": {
    "while_thinking": "spinner | progress | skeleton",
    "on_complete": "inline_update | modal | navigation"
  }
}
```

---

## Anti-Patterns Detected

| Pattern | Severity | Description |
|---------|----------|-------------|
| `orphan_tool` | high | Tool with no clear trigger condition |
| `permission_gap` | critical | Security hole - tool lacks permission check |
| `silent_thinking` | medium | User doesn't know AI is working (no feedback) |
| `vague_trigger` | medium | Unclear when to invoke tool |
| `timeout_void` | low | No timeout handling for long operations |

---

## Permission Levels

| Level | Description | Examples |
|-------|-------------|----------|
| `auto_grant` | No user confirmation needed | Read-only queries, calculations |
| `user_confirm` | Must ask user first | Data modification, API calls |
| `admin_only` | Restricted to admins | System configuration, user management |

---

## Risk Assessment

**Latency Categories**:
- `low`: < 1 second (lookup, calculation)
- `medium`: 1-5 seconds (API call, data fetch)
- `high`: > 5 seconds (complex generation, file processing)

**Side Effects**:
- `none`: Read-only, no state change
- `state_change`: Modifies application state
- `data_modification`: Creates/updates/deletes data

---

## Output Artifacts

```
_bmad-output/artifacts/{story_id}/
├── tool-definition.json         # Tool spec
├── prompt-context.md             # System prompt
└── brain-validation-report.md    # Anti-patterns detected
```

---

## Example

**PASS** - Well-defined tool:
```json
{
  "tool_name": "summarize_note",
  "description": "Summarize the currently open note",
  "trigger": {
    "condition": "User asks to summarize current note",
    "NOT_trigger": "User asks to summarize multiple notes"
  },
  "permission_level": "auto_grant",
  "risk_assessment": {
    "latency": "medium",
    "side_effects": "none"
  },
  "ui_state": {
    "while_thinking": "skeleton",
    "on_complete": "inline_update"
  }
}
```

**FAIL** - Orphan tool:
```json
{
  "tool_name": "process_data",
  "description": "Process some data",  // Vague
  "trigger": { "condition": "???" },   // Missing!
  "permission_level": "auto_grant"      // Should be user_confirm!
}
```

---

**Integration**: Called by `story-cycle` Step 03a
