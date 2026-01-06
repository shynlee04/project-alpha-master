# BMAD Claude Code Configuration Fix - ACTUAL SOLUTION

**Date**: 2026-01-06
**Status**: READY FOR TESTING
**Problem**: Hooks don't work, skills don't auto-invoke, agents don't switch automatically

---

## Root Cause Analysis

### Why Hooks Weren't Working

1. **"command" hooks just log output** - Claude doesn't process JSON output from shell scripts as decisions
2. **Scripts output JSON like `{"permissionDecision": "allow"}`** - This is just logged, NOT executed
3. **No actual instructions for Claude to follow** - The hooks weren't telling Claude what to DO

### Why Skills Weren't Auto-Invoking

1. Skills rely on **description field matching** in SKILL.md frontmatter
2. Claude matches user input against the `description` field
3. The trigger phrases WERE correct, but hooks were interfering with normal skill activation

### Why Agents Weren't Switching

1. Hooks weren't properly triggering agent handoffs
2. No clear instruction flow from UserPromptSubmit → Skill activation → Agent loading

---

## Solution Implemented

### 1. Fixed settings.json Hooks

Changed ALL hooks from `"type": "command"` to `"type": "prompt"` with explicit instructions:

#### SessionStart Hook
```json
{
  "type": "prompt",
  "prompt": "You are starting a BMAD V6 autonomous development session. IMMEDIATELY read these files in order:..."
}
```
**What it does**: Tells Claude to read governance files FIRST on session start

#### UserPromptSubmit Hook #1 - BMAD Trigger Detection
```json
{
  "type": "prompt",
  "prompt": "BEFORE processing the user's request, check for these BMAD trigger patterns:..."
}
```
**What it does**: Tells Claude to check for BMAD keywords BEFORE processing

#### UserPromptSubmit Hook #2 - Context Threshold
```json
{
  "type": "prompt",
  "prompt": "CONTEXT USAGE CHECK - Estimate current context usage. If ~70%:..."
}
```
**What it does**: Tells Claude to create continuation capsule at 70% context

#### PreToolUse Hook - Governance
```json
{
  "type": "prompt",
  "prompt": "GOVERNANCE CHECK - Before writing or editing files:..."
}
```
**What it does**: Tells Claude to check rules BEFORE file changes

#### Stop Hook - Validation
```json
{
  "type": "prompt",
  "prompt": "SESSION STOP - Before stopping, complete these steps:..."
}
```
**What it does**: Tells Claude to validate and save state BEFORE stopping

---

## How It Works Now

### Flow 1: User Says "run autonomous loop"

```
User Input: "run autonomous loop"
    ↓
UserPromptSubmit Hook (prompt-type) triggers
    ↓
Claude reads: "check for BMAD trigger patterns"
    ↓
Claude detects: "run autonomous loop" matches BMAD patterns
    ↓
Claude activates: bmad-orchestrator skill (via SKILL.md description match)
    ↓
bmad-orchestrator loads: AGENT-COORDINATOR.md, intent-matrix.yaml, AGENT-STATE.yaml
    ↓
Routes to: _bmad/modules/asgl/workflows/main-loop.md
```

### Flow 2: User Says "eliminate god stores"

```
User Input: "eliminate god stores"
    ↓
UserPromptSubmit Hook triggers
    ↓
Claude detects BMAD pattern
    ↓
Activates bmad-orchestrator skill
    ↓
Loads intent-matrix.yaml
    ↓
Routes to: _bmad/modules/architecture-remediation/agents/store-refactorer.md
```

### Flow 3: User Edits a File

```
User: Edits file
    ↓
PreToolUse Hook triggers
    ↓
Claude reads: "GOVERNANCE CHECK"
    ↓
Claude checks: No glassmorphism? i18n compliance? Size limits?
    ↓
If violations: Asks user for confirmation
    ↓
If OK: Proceeds with Edit
```

### Flow 4: Context at 70%

```
Claude detects: Conversation is long (~70%)
    ↓
UserPromptSubmit Hook #2 triggers
    ↓
Claude reads: "CONTEXT USAGE CHECK"
    ↓
Claude creates: _bmad-output/continuation-capsules/continuation-{timestamp}.md
    ↓
Claude outputs: "⚠️ CONTEXT THRESHOLD EXCEEDED"
    ↓
User starts: NEW conversation
    ↓
User pastes: Continuation capsule
    ↓
Session resumes: With full context preserved
```

---

## Key Changes from Previous Configuration

| Before | After |
|--------|-------|
| `"type": "command"` hooks | `"type": "prompt"` hooks |
| Scripts output JSON | Prompts output INSTRUCTIONS |
| Output just logged | Claude FOLLOWS instructions |
| No 70% context handling | 70% creates continuation capsule |
| Skills manual invoke | Skills auto-invoke via description match |

---

## Testing the Fix

### Test 1: BMAD Auto-Invocation

Try these phrases - should activate bmad-orchestrator:
- "run autonomous loop"
- "/bmad"
- "@bmad"
- "eliminate god stores"
- "diagnose codebase"

**Expected behavior**:
- Skill activates automatically
- AGENT-COORDINATOR.md is read
- Routes to appropriate _bmad/modules/

### Test 2: Governance Enforcement

Try these - should trigger validation:
- Edit a file with `backdrop-blur` in CSS
- Write code without i18n
- Create a file >300 lines

**Expected behavior**:
- Claude asks for confirmation
- Explains which rule was violated

### Test 3: Context Continuation

1. Have a long conversation (~70%)
2. Try to continue working

**Expected behavior**:
- Claude creates continuation capsule
- Tells you to start new conversation
- Provides capsule path

### Test 4: Session Resume

1. Start new session
2. Say "resume"

**Expected behavior**:
- SessionStart hook triggers
- Reads AGENT-STATE.yaml
- Reads continuation.resume_prompt
- Continues from where you left off

---

## File Changes Summary

### Modified Files

1. **`.claude/settings.json`** - Complete hook rewrite
   - All hooks changed to `"type": "prompt"`
   - Added explicit instructions Claude will follow
   - Added 70% context handling

2. **`.claude/skills/bmad-orchestrator/SKILL.md`** - Already had correct frontmatter
   - No changes needed

3. **`.claude/skills/asgl/SKILL.md`** - Already had correct frontmatter
   - No changes needed

### What Was NOT Changed

- `.claude/hooks/*.sh` - Shell scripts still exist but are NOT used by settings.json
- `.claude/agents/*.md` - Agent loader files are still valid
- `_bmad/modules/**` - All modules still valid
- State files (AGENT-STATE.yaml, LOOP_STATE.yaml, intent-matrix.yaml)

---

## Verification Commands

After testing, verify the configuration:

```bash
# Check settings.json syntax
cat .claude/settings.json | jq .

# Check skill frontmatter
head -5 .claude/skills/bmad-orchestrator/SKILL.md
head -5 .claude/skills/asgl/SKILL.md

# Check state files exist
ls -la .claude/AGENT-STATE.yaml
ls -la .claude/intent-matrix.yaml
ls -la _bmad/modules/asgl/LOOP_STATE.yaml
```

---

## Troubleshooting

### If Skills Don't Auto-Invoke

1. Check SKILL.md has proper YAML frontmatter:
   ```bash
   head -10 .claude/skills/*/SKILL.md
   ```

2. Check `description` field contains trigger phrases

3. Restart Claude Code

### If Hooks Don't Trigger

1. Check settings.json syntax:
   ```bash
   cat .claude/settings.json | jq .
   ```

2. Check hooks are at project level, not global:
   - Should be in `.claude/settings.json`
   - NOT in `~/.claude/settings.json`

3. Check hook events are supported:
   - SessionStart ✅
   - UserPromptSubmit ✅
   - PreToolUse ✅
   - Stop ✅

### If State Files Not Loading

1. Check files exist:
   ```bash
   ls -la .claude/AGENT-STATE.yaml
   ls -la .claude/intent-matrix.yaml
   ls -la _bmad/modules/asgl/LOOP_STATE.yaml
   ```

2. Check file permissions

3. Check YAML syntax

---

## Next Steps

1. ✅ Updated settings.json with prompt-type hooks
2. ⏳ Test auto-invocation with "/bmad" or "run autonomous loop"
3. ⏳ Test governance enforcement
4. ⏳ Test context continuation at 70%
5. ⏳ Verify agent routing works correctly

---

**Status**: Configuration updated. Ready for user testing.
