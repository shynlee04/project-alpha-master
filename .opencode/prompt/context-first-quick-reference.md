---
name: context-first-quick-reference
description: Quick reference for context-first prompts and system components
enabled: true
updated: 2026-01-30
---

# 🔥 CONTEXT-FIRST QUICK REFERENCE

## System Components

| Component | Path | Purpose |
|-----------|------|---------|
| **🔌 Starter Plugin** | `.opencode/plugins/context-first-starter.ts` | Auto-injects reminders every turn |
| **📦 Compaction Plugin** | `.opencode/plugins/context-first-compaction.ts` | Custom YAML on compact |
| **📜 /start Command** | `.opencode/commands/start.md` | Manual initialization |
| **📋 /context-first** | `.opencode/commands/context-first.md` | Show status & debug |
| **📝 Delegation Reminder** | `.opencode/prompt/delegation-reminder.md` | Append to all delegations |
| **📄 This File** | `.opencode/prompt/context-first-quick-reference.md` | Copy-paste reference |

---

## Quick Prompts (Copy-Paste)

### After Starting New Conversation

```
🔥 CONTEXT-FIRST INITIALIZATION

BEFORE ANY ACTION:
1. I am [role] working on [task type]
2. Load: AGENTS.md, sprint-status.yaml
3. Check my current delegation in LOOP_STATE.yaml
4. Read before write, verify with typecheck/tests

MY CURRENT CONTEXT:
- Purpose: [brief goal]
- Relevant files: [list key files]
- Work type: meta-framework | project implementation

CONFIRM UNDERSTANDING before proceeding.
```

### After Compaction (Post-Compact)

```
⚠️ POST-COMPACT STATE

I see this is a compacted session. BEFORE CONTINUING:

1. IDENTIFY the compact_chain section:
   - What turn is this? (turn_1, turn_2, turn_3, turn_4+)
   - What was the original intent from Turn 1?
   
2. LOAD anchored context:
   - artifact_registry links (hop-read these)
   - phase_tracking information
   - agent_hierarchy (am I delegated?)
   
3. VERIFY current status:
   - Check sprint-status.yaml
   - Check LOOP_STATE.yaml
   
CONFIRM you have restored context before acting.
```

### When Delegating to Subagent

```
Append the contents of `.opencode/prompt/delegation-reminder.md`
```

Or use this minimal version:

```
🔥 DELEGATION REMINDER:
- Load your agent file first
- Only do the delegated task (no scope creep)
- Run typecheck/tests before reporting
- Use structured handoff report format
- Evidence before assertions
```

---

## Plugin Debug Mode

```bash
# Enable verbose logging
export OPENCODE_CONTEXT_DEBUG=true
opencode
```

Expected output:
```
[context-first-starter] Plugin initialized
[context-first-starter] Session xxx: N messages, workType=project
[context-first-starter] Injecting context-first reminder into system prompt
```

---

## Verifying Plugin Works

Ask the agent:
> "What context-first reminders are you seeing in your system prompt?"

If working, it should mention:
- 🔥 BEAST-MODE CONTEXT-FIRST REMINDER
- Role Awareness section
- Work Type Detection section  
- Governance Reminder

If NOT working:
1. Check OpenCode version supports experimental hooks
2. Restart OpenCode to reload plugins
3. Use manual `/start` command as fallback

---

## Key Files for Governance

| File | Purpose |
|------|---------|
| `AGENTS.md` | Project constitution |
| `sprint-status.yaml` | Current sprint tracking |
| `bmm-workflow-status.yaml` | Workflow phase tracking |
| `.opencode/state/LOOP_STATE.yaml` | Active delegation state |
| `.opencode/state/ARTIFACT_REGISTRY.yaml` | Artifact tracking |

---

## 🔥 The 7 Context-First Rules

1. **Role Awareness** - Know your agent role before acting
2. **Context Before Action** - Read relevant files first
3. **Anchor to Turn 1** - Never lose sight of original intent
4. **Evidence Before Assertion** - Run commands, verify outputs
5. **No Scope Creep** - Do delegated task only
6. **Structured Handoff** - Use proper report format
7. **Governance Updates** - Keep status files current

---

## Updated Agents with Delegation Reminder

The following agents have the mandatory delegation reminder:

- ✅ `ext-master.md`  
- ✅ `bmad-sprint-manager.md`
- ✅ `bmad-governance.md`
- ✅ `dev-ext.md`
- ✅ `architect-ext.md`
- ✅ `analyst-ext.md`

All other agents should reference `.opencode/prompt/delegation-reminder.md` when delegating.

---

*Last Updated: 2026-01-30*
