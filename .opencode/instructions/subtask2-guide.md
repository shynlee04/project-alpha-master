# subtask2 Plugin Configuration Guide

## Overview

The **subtask2 plugin** (`spoons-and-mirrors/subtask2`) enables advanced TODO task management and parallel execution for OpenCode agents.

## Quick Configuration

To enable subtask2 for an agent, add `"subtask": true` to the agent's configuration in `opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "your-agent-name": {
      "description": "Agent description",
      "mode": "primary" | "subagent" | "all",
      "prompt": "{file:agent/your-agent-name.md}",
      "temperature": 0.2,
      "subtask": true,  // ← ADD THIS TO ENABLE SUBTASK2
      "maxSteps": 30,
      "tools": {
        "write": true,
        "edit": true,
        "bash": true,
        "glob": true,
        "grep": true,
        "read": true
      },
      "permission": {
        "edit": "allow",
        "bash": "allow",
        "task": {
          "*": "allow"
        }
      }
    }
  }
}
```

## How subtask2 Works

### 1. **Parallel Execution**

Agents can run multiple subtasks in parallel:

```jsonc
{
  "agent": {
    "my-agent": {
      "subtask": true,
      "parallel": [
        {
          "agent": "agent-1",
          "task": "Task description",
          "context": "Task-specific context"
        },
        {
          "agent": "agent-2",
          "task": "Another task description",
          "context": "Task-specific context"
        }
      ]
    }
  }
}
```

### 2. **Return Synthesized Results**

Use `return` directive to send results back to caller:

```jsonc
{
  "agent": {
    "my-agent": {
      "subtask": true,
      "return": {
        "template": "Summary of all parallel tasks",
        "variable": "results"
      }
    }
  }
}
```

### 3. **Example Command File**

`.opencode/command/research-codebase.md`:
```jsonc
{
  "description": "Research codebase structure",
  "agent": "dev-ext",
  "subtask": true,
  "parallel": [
    {
      "agent": "domain-scanner",
      "task": "Analyze domain boundaries in src/presentation/",
      "context": "Focus on identifying cross-domain coupling"
    },
    {
      "agent": "deep-scan-architecture-scanner",
      "task": "Check for layer violations and god components",
      "context": "Target src/ directory for 300+ line components"
    }
  ],
  "return": {
    "template": "Codebase Research Summary: {{results}}",
    "variable": "findings"
  }
}
```

## Configuration for Different Agent Types

### Primary Agents (Orchestrators)
**Purpose:** Use subtask2 to coordinate other agents, NOT to work as subagents themselves.

**Example:**
```jsonc
{
  "agent": {
    "ext-master": {
      "description": "BMAD Master Orchestrator - Entry point for all _bmad-ext modules",
      "mode": "primary",
      "subtask": true,  // ← Required for coordination
      "tools": {
        "write": true,
        "edit": true,
        "bash": true,
        "glob": true,
        "grep": true,
        "read": true,
        "task": true  // ← Required for delegation
      }
    }
  }
}
```

### Extension Agents (mode: "all")
**Purpose:** Can be used as primary OR subagent, depending on context.

**Example as Primary:**
```jsonc
{
  "agent": {
    "dev-ext": {
      "description": "Senior Software Engineer - executes delegated development tasks",
      "mode": "all",
      "subtask": true,
      "tools": {
        "write": true,
        "edit": true,
        "bash": true,
        "glob": true,
        "grep": true,
        "read": true,
        "task": {
          "*": "deny",
          "tea-ext": "allow"
        }
      }
    }
  }
}
```

**Example as Subagent (when delegated):**
```yaml
# The subtask2 plugin automatically handles delegation context
# When called via @mention or task delegation, subtask2 features activate
```

### Specialized Subagents (mode: "subagent")
**Purpose:** Specialized tasks, always used via delegation.

**Example:**
```jsonc
{
  "agent": {
    "deep-scan-orchestrator": {
      "description": "Deep Scan Orchestrator - Coordinates diagnostic scanners",
      "mode": "subagent",
      "subtask": true,
      "tools": {
        "write": true,
        "edit": true,
        "bash": true,
        "glob": true,
        "grep": true,
        "read": true
      },
      "permission": {
        "edit": "ask",
        "bash": "ask",
        "task": {
          "*": "deny"
        }
      }
    }
  }
}
```

## Key Best Practices

1. **Always use `subtask` for coordination**
   - Primary agents orchestrating multiple subagents should use subtask2
   - This enables parallel execution and result synthesis

2. **Use `parallel` for multi-agent workflows**
   - When multiple agents need to run, define them in `parallel` array
   - Each parallel task gets independent context

3. **Use `return` for result aggregation**
   - Template-based result synthesis
   - Variables capture agent outputs

4. **Include `task` permission for agents**
   - Agents that delegate to others need `"task": { "*": "allow" }`
   - Subagents typically have `"task": { "*": "deny" }`

5. **Context management**
   - Provide task-specific context in parallel array
   - Each context should be brief but complete

## File Structure

```
.opencode/
├── instructions/
│   └── subtask2-guide.md          # This file
├── command/
│   ├── research-codebase.md
│   ├── validate-architecture.md
│   └── create-tests.md
└── agent/
    ├── bmad-master.md
    ├── dev-ext.md
    └── [all other agents]
```

## Troubleshooting

### Agent not using subtask2:
```bash
# Check if subtask is enabled
grep -A 10 '"subtask"' .opencode/opencode.jsonc
```

### Invalid configuration:
- Missing `"subtask": true` on agents that should coordinate
- Syntax errors in JSONC (unmatched brackets, missing commas)
- Invalid mode values

### Agent not receiving subtask2 context:
- Verify agent configuration has `"subtask": true`
- Check that caller is using `parallel` or `return` directives
- Review command file structure

## Integration with BMAD Framework

When using subtask2 with BMAD agents:

1. **Workflow coordination:**
   ```jsonc
   "parallel": [
     {
       "agent": "deep-scan-orchestrator",
       "task": "Execute architecture scan",
       "context": "Focus on src/domain/ and src/infrastructure/"
     },
     {
       "agent": "deep-scan-state-scanner",
       "task": "Execute state scan",
       "context": "Focus on god stores and circular dependencies"
     }
   ]
   ```

2. **Result synthesis:**
   ```jsonc
   "return": {
     "template": "Deep Scan Summary: {{architecture-findings}}\n\n{{state-findings}}",
     "variable": "scan-results"
   }
   ```

3. **Loop status updates:**
   - Update LOOP_STATE.yaml with progress
   - Create handoff artifacts for each phase
   - Track completion of parallel tasks

## Next Steps

1. Review all agents in opencode.jsonc
2. Add `"subtask": true` to all agents
3. Create example command files demonstrating parallel execution
4. Test configuration with OpenCode
5. Update orchestrator-coordinator-rules.md if needed

---

**Created:** 2026-01-11
**For:** OpenCode subtask2 plugin integration with BMAD framework
