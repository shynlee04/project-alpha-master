# Claude Code Configuration Guide: Global vs Workspace (Project) Settings

**Session**: Continuation of ses_46c1
**Date**: 2026-01-06
**Purpose**: Document Claude Code's scope system and how BMAD framework uses it

---

## Scope Hierarchy (Precedence Order)

```
Enterprise (highest precedence)
    ↓
Command Line (--config flag)
    ↓
Local (.claude/settings.local.json)
    ↓
Project (.claude/settings.json)
    ↓
User/Global (~/.claude/settings.json) [lowest precedence]
```

### Key Principle
**Higher precedence overrides lower precedence.** Project settings override user settings.

---

## Configuration Locations

| Scope | Location | Git Status | Use Case |
|-------|----------|------------|----------|
| **Global/User** | `~/.claude/settings.json` | Not in repo | Personal defaults across all projects |
| **Project** | `.claude/settings.json` | Tracked | Project-specific configuration |
| **Local** | `.claude/settings.local.json` | Gitignored | Sensitive/per-user overrides |
| **Enterprise** | `/etc/claude/managed-settings.json` | N/A | Org-managed defaults |

---

## BMAD Framework Configuration Strategy

### Current Setup (CORRECT)

```
project-alpha-master/
├── .claude/
│   ├── settings.json          ← Project-level hooks & BMAD config
│   ├── skills/
│   │   ├── bmad-orchestrator/SKILL.md
│   │   └── asgl/SKILL.md
│   ├── AGENT-COORDINATOR.md
│   ├── AGENT-STATE.yaml
│   ├── intent-matrix.yaml
│   └── rules/
│       ├── governance-rules.md
│       ├── agent-handoff.md
│       └── state-management.md
```

**Why Project-Level?**
- BMAD is **project-specific** - each repo has its own governance, sprint status, and agents
- Hooks reference project-relative paths (e.g., `_bmad/modules/asgl/LOOP_STATE.yaml`)
- Skills reference project artifacts (e.g., `AGENT-COORDINATOR.md`)

---

## Hook Type Comparison

### `"type": "command"` Hooks
- **Behavior**: Runs shell script, output is logged only
- **Use Case**: Data gathering, logging, status checks
- **Output**: NOT processed as instructions by Claude

```json
{
  "type": "command",
  "command": ".claude/hooks/daily-governance-audit.sh"
}
```

### `"type": "prompt"` Hooks
- **Behavior**: Output is processed as a prompt by Claude
- **Use Case**: Governance, routing, validation, instructions
- **Output**: Claude follows the instructions

```json
{
  "type": "prompt",
  "prompt": "Before writing files, verify: (1) No glassmorphism, (2) i18n compliance..."
}
```

---

## BMAD Hooks Configuration (Current)

### SessionStart Hook
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/daily-governance-audit.sh"
          },
          {
            "type": "prompt",
            "prompt": "You are starting a BMAD V6 autonomous development session. Read .claude/AGENT-COORDINATOR.md and _bmad/modules/asgl/LOOP_STATE.yaml..."
          }
        ]
      }
    ]
  }
}
```

**Purpose**:
- Command hook: Runs audit script (logging)
- Prompt hook: Loads BMAD context for Claude to follow

### UserPromptSubmit Hook
```json
{
  "UserPromptSubmit": [
    {
      "matcher": "",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Before proceeding, check if the user input references BMAD workflows..."
        }
      ]
    }
  ]
}
```

**Purpose**: Auto-activate bmad-orchestrator skill when BMAD keywords detected

### PreToolUse Hook
```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Before writing or editing files, verify: (1) No glassmorphism..."
        }
      ]
    }
  ]
}
```

**Purpose**: Governance enforcement before file changes

### Stop Hook
```json
{
  "Stop": [
    {
      "matcher": "",
      "hooks": [
        {
          "type": "command",
          "command": ".claude/hooks/ralph-loop.sh"
        },
        {
          "type": "prompt",
          "prompt": "Before stopping, verify: (1) TypeScript passes..."
        }
      ]
    }
  ]
}
```

**Purpose**: Validation and state save before session end

---

## Skills Auto-Invocation

### How It Works
Claude Code reads the YAML frontmatter of SKILL.md files:
```yaml
---
name: BMAD Orchestrator
description: This skill activates automatically when the user says "run autonomous loop", "execute sprint", "course correction", "eliminate god stores", "diagnose codebase", "implement story", "BMAD workflow", "start sprint", "run Ralph loop", "orchestrate agents", "run epic", "/bmad", "@bmad", or references to autonomous development cycles, multi-agent coordination, or BMAD framework workflows.
version: 2.0.0
---
```

**Key Field**: `description` contains trigger phrases that Claude matches against user input

### Skill Location
```
.claude/skills/
├── bmad-orchestrator/
│   └── SKILL.md
└── asgl/
    └── SKILL.md
```

Skills are **project-scoped** because they reference project-specific workflows and agents.

---

## Global vs Project: What Goes Where?

### Global Settings (~/.claude/settings.json)
Use for:
- Personal preferences (editor defaults, UI themes)
- API keys (if not in env vars)
- Default model selection
- Cross-project tools

### Project Settings (.claude/settings.json)
Use for:
- **BMAD framework hooks** (project-specific workflows)
- **BMAD skills** (referencing project agents)
- Project-specific rules and governance
- Test configurations
- Build scripts

---

## Verification Checklist

### Current BMAD Configuration: ✅ CORRECT

- [x] Hooks in `.claude/settings.json` (project-level)
- [x] Skills with proper YAML frontmatter
- [x] Prompt-type hooks for governance (Claude processes instructions)
- [x] Command-type hooks for logging (output logged only)
- [x] No global BMAD configuration (correct - BMAD is project-specific)

---

## Common Pitfalls

### ❌ WRONG: Using Command Hooks for Governance
```json
{
  "type": "command",
  "command": "echo '{\"permission\": \"allow\"}'"
}
```
Output is logged, NOT processed as decision.

### ✅ CORRECT: Using Prompt Hooks for Governance
```json
{
  "type": "prompt",
  "prompt": "Verify no glassmorphism before allowing file changes."
}
```
Claude processes and follows the instruction.

---

## Testing the Configuration

### Test Auto-Invocation
Try these phrases - should activate bmad-orchestrator:
- "run autonomous loop"
- "/bmad"
- "@bmad"
- "eliminate god stores"
- "diagnose codebase"

### Test Governance Hooks
Try these - should trigger validation:
- Edit a file over 300 lines
- Try to add backdrop-blur to CSS
- Write code without i18n

---

## References

- [Claude Code Hooks Documentation](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/hook-development/SKILL.md)
- [Claude Code Skills Documentation](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/skill-development/SKILL.md)
- `_bmad/modules/asgl/` - ASGL module configuration
- `.claude/AGENT-COORDINATOR.md` - Agent coordination patterns

---

**Status**: BMAD configuration is correctly set up at project level
**Recommendation**: No changes needed - configuration follows Claude Code best practices
