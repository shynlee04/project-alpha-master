# BMAD Claude Code Configuration Fix Summary

**Session**: Continuation of ses_46c1
**Date**: 2026-01-06
**Purpose**: Fix Claude Code hooks, skills, and agent orchestration for BMAD framework

---

## Problem Analysis

### Issues Identified

1. **Hooks output JSON but Claude doesn't parse it**
   - `pre-execution.sh` outputs `{"permissionDecision": "allow"}`
   - `ralph-loop.sh` outputs `{"decision": "approve"}`
   - Command-type hook output is logged, NOT processed as decisions

2. **Missing SKILL.md frontmatter for auto-invocation**
   - Skills lacked proper YAML frontmatter with trigger phrases
   - Claude couldn't auto-detect when to activate BMAD skills

3. **No SubagentStop hook**
   - This hook type doesn't exist in Claude Code
   - Handoff control requires different approach

4. **Governance workflows not being executed**
   - No prompt-based hooks to enforce governance
   - Skills weren't triggering automatically

---

## Fixes Applied

### 1. Updated SKILL.md Frontmatter (CRITICAL)

**File**: `.claude/skills/bmad-orchestrator/SKILL.md`

```yaml
---
name: BMAD Orchestrator
description: This skill activates automatically when the user says "run autonomous loop", "execute sprint", "course correction", "eliminate god stores", "diagnose codebase", "implement story", "BMAD workflow", "start sprint", "run Ralph loop", "orchestrate agents", "run epic", "/bmad", "@bmad", or references to autonomous development cycles, multi-agent coordination, or BMAD framework workflows.
version: 2.0.0
---
```

**File**: `.claude/skills/asgl/SKILL.md`

```yaml
---
name: ASGL Autonomous Loop Orchestrator
description: This skill activates when user says "run autonomous loop", "execute sprint", "ASGL", "autonomous sprint", "governance loop", "self-governing loop", "loop orchestration", "run epic", "BMAD sprint", or references to autonomous development cycles with governance.
version: 2.1.0
---
```

### 2. Added Prompt-Based Hooks to settings.json

**File**: `.claude/settings.json`

Added `"type": "prompt"` hooks that Claude actually processes:

#### SessionStart Hook
- Loads AGENT-COORDINATOR.md and LOOP_STATE.yaml
- Initializes or resumes BMAD session context

#### UserPromptSubmit Hook
- Auto-activates bmad-orchestrator skill when BMAD keywords detected
- Checks for: `/bmad`, `@bmad`, `run epic`, `implement story`, etc.

#### PreToolUse Hooks
- **Write/Edit matcher**: Validates before file changes
  - No glassmorphism (backdrop-blur forbidden)
  - i18n compliance (t() for strings)
  - File size limits (components ≤300 lines, stores ≤120 lines)
  - Zustand v5 patterns with individual selectors

- **Bash matcher**: Validates before running commands
  - Build safety checks
  - Git commit message format

#### Stop Hook
- TypeScript validation before stopping
- Governance doc updates (AGENTS.md every 3 stories, CLAUDE.md every 5)
- Update AGENT-STATE.yaml with progress

---

## How It Works Now

### Skill Auto-Invocation Flow

```
User Input: "run autonomous loop"
    ↓
UserPromptSubmit Hook (prompt-type)
    ↓
Claude processes: "Check if input references BMAD workflows"
    ↓
SKILL.md frontmatter match found
    ↓
bmad-orchestrator skill activates
    ↓
Loads: AGENT-COORDINATOR.md, LOOP_STATE.yaml, sprint-status.yaml
    ↓
Routes to appropriate module (deep-scan, architecture-remediation, asgl)
```

### Governance Enforcement Flow

```
User triggers Write/Edit tool
    ↓
PreToolUse Hook (prompt-type, Write|Edit matcher)
    ↓
Claude processes: "Verify no glassmorphism, i18n compliance, size limits"
    ↓
If violations found → Ask user for confirmation
    ↓
Proceed with changes
```

---

## Key Differences: Command vs Prompt Hooks

| Type | Behavior | Use Case |
|------|----------|----------|
| `"type": "command"` | Runs shell script, output logged | Data gathering, logging |
| `"type": "prompt"` | Output processed as prompt by Claude | Governance, routing, validation |

**Critical Insight**: Command hooks outputting JSON is useless for controlling Claude's behavior. Use prompt-type hooks with instructions that Claude will follow.

---

## Testing the Fixes

### Test Auto-Invocation

Try these phrases - should activate bmad-orchestrator automatically:
- "run autonomous loop"
- "/bmad"
- "@bmad"
- "eliminate god stores"
- "diagnose codebase"
- "run epic"

### Test Governance Hooks

Try these - should trigger validation prompts:
- Edit a file over 300 lines
- Try to add backdrop-blur to CSS
- Write code without i18n

### Test Session Context

1. Start new session → Should load AGENT-COORDINATOR.md
2. Check if LOOP_STATE.yaml is read for resume
3. Stop session → Should update AGENT-STATE.yaml

---

## Next Steps

1. ✅ Skills updated with proper frontmatter
2. ✅ Prompt-based hooks added to settings.json
3. ⏳ Test complete workflow end-to-end
4. ⏳ Verify skill auto-invocation works
5. ⏳ Verify governance enforcement works

---

## Files Modified

| File | Changes |
|------|---------|
| `.claude/skills/bmad-orchestrator/SKILL.md` | Added YAML frontmatter with triggers |
| `.claude/skills/asgl/SKILL.md` | Added YAML frontmatter with triggers |
| `.claude/settings.json` | Added prompt-type hooks for governance |

---

## References

- [Claude Code Hooks Documentation](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/hook-development/SKILL.md)
- [Claude Code Skills Documentation](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/skill-development/SKILL.md)
- `_bmad/core/agents/bmad-master.md` - BMAD master agent definition
- `_bmad/modules/asgl/` - ASGL module configuration

---

**Status**: Ready for testing
**Next Action**: Test with "/bmad" or "run autonomous loop" to verify auto-invocation
