---
title: "Context-First Enforcement Strategy v2.0 - Corrected"
version: "2.0.0"
status: "ACTIVE"
created: "2026-01-29T23:58:00+07:00"
revised: "2026-01-30T00:44:00+07:00"
revision_reason: "Corrected critical misunderstanding: custom commands APPEND, not replace tokens"
author: "bmad-master"
governance:
  phase: "META-FRAMEWORK-IMPROVEMENT"
  work_type: "meta-framework"
---

# 🎯 CONTEXT-FIRST ENFORCEMENT STRATEGY v2.0

> **CRITICAL CORRECTION**: Running a custom `/compact` command does NOT reduce tokens. It only APPENDS more content. The actual token reduction happens when OpenCode's native compact creates a NEW SESSION.

---

## THE CRITICAL MISUNDERSTANDING (Corrected)

### What I Got WRONG in v1.0

| Assumption | Reality |
|------------|---------|
| Custom `/compact` command reduces tokens | ❌ WRONG - It only appends content |
| Running `/smart-compact` compacts the session | ❌ WRONG - It adds MORE tokens |
| We can "override" the compact behavior | ❌ PARTIAL - Can override command, not the internal function |

### What Actually Happens

```
┌─────────────────────────────────────────────────────────────┐
│ Running /compact (custom command)                          │
│                                                             │
│   TOKEN USAGE: 80,000 → 82,000 (INCREASED!)                │
│   Reason: Command output is APPENDED to conversation       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Pressing Ctrl+K → "Compact Session" (OpenCode native)      │
│                                                             │
│   TOKEN USAGE: 82,000 → ~8,000 (RESET!)                    │
│   Reason: Creates NEW SESSION with summary                 │
│   Problem: Context is LOST in the new session              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## THE CORRECT STRATEGY

### Step 1: Disable Auto-Compact

**File Created:** `~/.opencode.json`

```json
{
  "autoCompact": false,
  "contextThreshold": 0.95
}
```

This prevents OpenCode from automatically compacting and losing context.

### Step 2: Two-Phase Compact Workflow

**Phase A: Run `/compact` to SAVE STATE**
```
/compact
```
- Generates state injection block
- WRITES to `.opencode/state/AGENT-STATE.yaml`
- Creates backup in `.opencode/state/backups/`
- Outputs: "State saved. Press Ctrl+K to compact."

**Phase B: Press `Ctrl+K` for ACTUAL COMPACT**
- User presses `Ctrl+K`
- Selects "Compact Session"
- OpenCode creates NEW session with reduced tokens
- Context is lost BUT state file survives

**Phase C: Run `/start` in NEW SESSION**
```
/start
```
- Reads `.opencode/state/AGENT-STATE.yaml`
- Injects preserved state into new session
- Agent is re-anchored with context

---

## FILES CREATED

### Configuration

| File | Purpose |
|------|---------|
| `~/.opencode.json` | Disable auto-compact globally |

### Commands

| File | Purpose | Tokens |
|------|---------|--------|
| `.opencode/commands/compact.md` | Save state before compact | APPENDS (temporary) |
| `.opencode/commands/start.md` | Re-anchor context in new session | APPENDS (necessary) |

### State Storage

| File | Purpose |
|------|---------|
| `.opencode/state/AGENT-STATE.yaml` | Current session state |
| `.opencode/state/backups/` | Historical session backups |

---

## HOW IT WORKS NOW

### User Workflow

```
1. Work in session until tokens are high (~80%)

2. Run /compact
   → Agent generates state injection block
   → Agent writes to AGENT-STATE.yaml
   → Agent says "State saved. Press Ctrl+K."

3. Press Ctrl+K → Select "Compact Session"
   → OpenCode creates NEW session
   → Tokens reset
   → Context lost (but state file exists)

4. In NEW session, run /start
   → Agent reads AGENT-STATE.yaml
   → Agent re-anchors with preserved context
   → Work continues seamlessly
```

### Alternative: Copy-Paste Method

If file-based method doesn't work:

```
1. Run /compact
   → Agent outputs state block in response

2. COPY the state block from output

3. Press Ctrl+K → Compact

4. PASTE the state block as first message in new session

5. Continue working
```

---

## WHAT IS PRESERVED

### Priority Matrix

| Priority | Content | How |
|----------|---------|-----|
| **P0** | Original Intent (Turn 1-2) | VERBATIM in `original_intent` |
| **P0** | Last 4 Turns | Detailed in `recent_context` |
| **P1** | Role & Hierarchy | In `role` and `delegation` |
| **P1** | Created Artifacts | Paths in `artifacts.created` |
| **P1** | Key Decisions | In `decisions` list |
| **P2** | Project Phase | In `project.phase` |
| **P2** | Skills Loaded | In `skills_loaded` |
| **EXCLUDE** | Poisoned Context | Listed in `filtered_out` |

### What Gets Filtered (Poisoned Context)

- Stale artifacts (>24h old)
- Contradicted decisions
- Failed debugging attempts
- Rejected approaches
- Off-topic discussion
- Hallucinated content

---

## KEY INSIGHT

> **The custom command SAVES state to a FILE**, not to the conversation. The FILE survives the compact and is READ in the new session.

This solves the problem because:
1. `/compact` writes to `.opencode/state/AGENT-STATE.yaml`
2. `Ctrl+K` creates new session (file is NOT deleted)
3. `/start` reads from `.opencode/state/AGENT-STATE.yaml`
4. Agent is re-anchored with preserved context

---

## TESTING THE WORKFLOW

### Test 1: State File Creation
```
1. Run /compact
2. Check: Does .opencode/state/AGENT-STATE.yaml exist?
3. Check: Does it contain the state injection block?
```

### Test 2: State Preservation Across Sessions
```
1. Run /compact → Note the state content
2. Press Ctrl+K → Compact to new session
3. Run /start → Is the same state loaded?
```

### Test 3: Context Re-Anchoring
```
1. After /start, does agent know:
   - Original user intent?
   - Current role?
   - Project phase?
   - What to do next?
```

---

## KNOWN LIMITATIONS

1. **User action required** - Must manually press Ctrl+K, no auto-trigger for custom compact
2. **Two-step process** - Run `/compact` then Ctrl+K, not one command
3. **File dependency** - If state file is deleted, context is lost
4. **New session cost** - Each compact loses conversation history (but not state)

---

## RECOMMENDATIONS

1. **Always run `/start` at beginning** of new sessions
2. **Run `/compact` before** pressing Ctrl+K
3. **Keep backups** by checking `.opencode/state/backups/`
4. **Verify state file** after `/compact` before pressing Ctrl+K
5. **Don't work after Ctrl+K** in old session - switch to new session

---

*Document revised: 2026-01-30T00:44:00+07:00*
*Author: BMAD Master*
*Work Type: Meta-Framework Improvement*
