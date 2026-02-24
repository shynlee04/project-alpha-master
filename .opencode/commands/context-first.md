---
name: context-first
description: Shows all context-first components and verifies they are working
aliases: [cf, ctx-check]
enabled: true
---

# 🔥 CONTEXT-FIRST SYSTEM STATUS

## Components Overview

| Component | Path | Purpose |
|-----------|------|---------|
| **Plugin (Auto)** | `.opencode/plugins/context-first-starter.ts` | Injects reminders on every turn via experimental hooks |
| **Compaction** | `.opencode/plugins/context-first-compaction.ts` | Custom YAML summary on session compact |
| **Command** | `.opencode/commands/start.md` | Manual initialization `/start` |
| **Quick Ref** | `.opencode/prompt/context-first-quick-reference.md` | Copy-paste reference |
| **Delegation** | `.opencode/prompt/delegation-reminder.md` | Appended to all agent delegations |

---

## How Context-First Works

### 1. AUTOMATIC (Every Turn)

Via `context-first-starter.ts` plugin:
```
User Message → [experimental.chat.messages.transform] → [experimental.chat.system.transform] → LLM
                      Extract context                      Inject reminder
```

**What gets injected:**
- Role awareness reminder
- Original intent (Turn 1) anchor
- Work type detection (meta-framework vs project)
- File paths in context
- Post-compact detection
- Governance reminder
- Verification requirement

### 2. MANUAL (Slash Command)

Use `/start` to explicitly trigger context-first initialization:
- Post-compact state restoration
- Document loading requirements
- Confirmation of understanding

### 3. ON COMPACT (Session Compaction)

Via `context-first-compaction.ts` plugin:
- Replaces default compaction with 9-section YAML
- Includes poisoned context filter
- Stores artifact LINKS (not content) for hop-reading
- Tracks multi-compact chain (turn 1, 2, 3, 4+)

---

## Debugging: Why Plugin May Not Be Running

### Check 1: Plugin File Location
The plugin must be at `.opencode/plugins/context-first-starter.ts`

### Check 2: Dependencies
Check `.opencode/package.json` includes:
```json
{
  "dependencies": {
    "@opencode-ai/plugin": "^1.1.30"
  }
}
```

### Check 3: OpenCode Version
Experimental hooks require OpenCode 1.x+. Check with:
```bash
opencode --version
```

### Check 4: Debug Mode
Enable debug to see plugin activity:
```bash
export OPENCODE_CONTEXT_DEBUG=true
opencode
```

You should see:
```
[context-first-starter] Plugin initialized
[context-first-starter] Session abc123: 5 messages, workType=project
[context-first-starter] Injecting context-first reminder into system prompt
```

### Check 5: Restart OpenCode
Plugins only load at startup. Kill and restart:
```bash
# Kill running instance
pkill -f opencode

# Restart
opencode
```

---

## Verify Plugin is Working

Ask the agent: "What context-first reminders are you seeing?"

If working, it should mention:
- 🔥 BEAST-MODE CONTEXT-FIRST REMINDER
- Role Awareness section
- Work Type Detection section
- Governance Reminder section

---

## Fallback: Manual Context-First

If plugin hooks don't work in your OpenCode version, use:

```
/start

[Your request here]
```

Or copy-paste the quick prompt from `.opencode/prompt/context-first-quick-reference.md`

---

## For Delegation

When delegating to subagents, always append the delegation reminder from:
`.opencode/prompt/delegation-reminder.md`

This ensures subagents receive context-first reminders even in isolated contexts.

---

*Last Updated: 2026-01-30*
