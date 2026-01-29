# 🎯 CONTEXT-FIRST QUICK PROMPT

**Copy-paste this at the start of important conversations, or just type `/start`**

---

## Option 1: Slash Command (Recommended)

```
/start
```

This loads the full context-first initialization command.

---

## Option 2: Quick Prompt (Copy-Paste)

```markdown
**CONTEXT-FIRST CHECK (Do this before responding)**:
1. ⚡ ROLE: Know your role from `.opencode/agents/` → act within-scope
2. 📍 CONTEXT: First 2 turns = original intent, Last 4 turns = recent context
3. 🔧 SKILLS: Load from `.opencode/skills/` before any work
4. 📋 PLAN: If coordinator → plan and delegate, never execute
5. 🎯 SCOPE: Know if meta-framework or project work
6. 📄 GOVERNANCE: Check AGENTS.md, update workflow-status/sprint-status
7. 🔎 QA: User may be imprecise → verify, push back if needed
```

---

## Option 3: Minimal Prompt (One-Liner)

```
/start → Then: [Your request]
```

---

## Option 4: Full Inline Prompt (When /start is not recognized)

```markdown
# BEFORE RESPONDING, COMPLETE THIS CHECKLIST:

1. **ROLE CHECK**: 
   - [ ] Identified my role from `.opencode/agents/`
   - [ ] Acting within role constraints
   - [ ] Coordinator = delegate, never execute
   
2. **CONTEXT ANCHOR**:
   - [ ] Captured original user intent (first turns)
   - [ ] Captured recent context (last 4 turns)
   - [ ] Verified project phase from `bmm-workflow-status.yaml`
   
3. **SKILL ACTIVATION**:
   - [ ] Loaded appropriate skills from `.opencode/skills/`
   - [ ] Feature → story-cycle, tdd-red
   - [ ] Bug → systematic-debugging
   - [ ] Architecture → brownfield-guard
   
4. **SCOPE IDENTIFICATION**:
   - [ ] Know if meta-framework or project work
   - [ ] Know forbidden paths for this work type
   
5. **GOVERNANCE FILES**:
   - [ ] Read AGENTS.md (constitution)
   - [ ] Checked bmm-workflow-status.yaml (if project work)
   - [ ] Prepared to update sprint-status.yaml (if story work)
   
6. **EXPERT-SKEPTIC MODE**:
   - [ ] Will not accept claims without proof
   - [ ] Will push back on risky directions
   - [ ] Will say "I don't know" when uncertain

Now proceeding with task...
```

---

## After Compact Recovery

If the conversation was compacted (auto or manual), use:

```
/start

I just compacted. Please re-anchor context from:
- `.opencode/state/AGENT-STATE.yaml`
- `bmm-workflow-status.yaml`

Then continue with: [Your request]
```

---

## For Team Coordination

When delegating between agents/sessions:

```
/start

**HANDOFF CONTEXT**:
- Previous Agent: [ext-master / ext-dev / etc.]
- Previous Action: [What was completed]
- Evidence: [Path to artifact or output]
- Next Action: [What I should do now]
- Points of Concern: [Any warnings]

Please continue from this state.
```

---

**TIP**: Keep this file bookmarked or print it as a quick reference!

*Last Updated: 2026-01-29*
