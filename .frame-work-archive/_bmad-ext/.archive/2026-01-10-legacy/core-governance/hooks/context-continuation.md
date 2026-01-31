# BMAD Context Continuation Hook System

**Module**: core-governance
**Version**: 1.0.0
**Status**: Active
**Last Updated**: 2026-01-06

---

## Overview

The Context Continuation Hook System monitors context usage during long-running autonomous BMAD cycles and generates continuation capsules when approaching token limits. This prevents automatic Claude Code compaction which loses critical state details.

---

## Architecture

### Components

1. **context-bridge.sh** - Main hook script
   - Triggers on UserPromptSubmit
   - Checks context usage via context-check.sh
   - Generates continuation capsule at 70% threshold
   - Outputs instructions for context refresh

2. **context-check.sh** - Context estimation utility
   - Scans .claude/context/ directory
   - Estimates token usage (chars / 4)
   - Calculates percentage of 150K working context
   - Returns percentage to stdout

3. **templates/continuation-capsule.md** - Continuation prompt template
   - Session identity and metadata
   - Current agent state
   - Critical references (links, not content)
   - Next actions for resume

### Data Flow

```
User submits prompt
    ↓
context-bridge.sh triggered
    ↓
context-check.sh estimates usage
    ↓
If usage >= 70%:
    ↓
Generate continuation capsule
    ↓
Output warning and instructions
    ↓
User starts new conversation
    ↓
BMAD Master loads capsule
    ↓
Resume from saved state
```

---

## Configuration

### Hook Registration

Add to `.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(bash .claude/hooks/*)"
    ]
  },
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/context-bridge.sh"
          }
        ]
      }
    ]
  }
}
```

### Threshold Configuration

Edit context-bridge.sh:

```bash
CONTEXT_THRESHOLD=70  # Percentage trigger (default: 70%)
```

---

## Usage

### During Autonomous Cycles

The hook runs automatically before each user prompt:

```bash
# User types message
> Continue working on story S-011

# Hook executes (transparent, <100ms)
# If threshold exceeded:
⚠️  BMAD CONTEXT THRESHOLD EXCEEDED (72%)
📦 Continuation capsule generated: _bmad-output/continuation-capsules/continuation-2026-01-06T11:30:00Z.md

🚀 RECOMMENDED ACTION:
   1. Copy the continuation capsule content
   2. Start a new conversation to refresh context
   3. Paste the capsule as your first message
   4. BMAD Master will resume from S-011
```

### Manual Context Check

Check context usage anytime:

```bash
# Normal mode (percentage only)
bash .claude/hooks/context-check.sh
# Output: 72

# Verbose mode (detailed breakdown)
bash .claude/hooks/context-check.sh verbose
# Output:
# === BMAD Context Usage ===
# Files analyzed: 15
# Total characters: 4832000
# Estimated tokens: 1208000
# Largest file: conversation-history.txt (1200000 chars)
# Context usage: 72%
# Threshold: 70%
# ========================
# ⚠️  WARNING: Context threshold exceeded!
# 💡 Recommendation: Start new conversation with continuation capsule
```

---

## Continuation Capsule Structure

### Template Placeholders

| Placeholder | Description | Example |
|------------|-------------|---------|
| `{{TIMESTAMP}}` | ISO 8601 timestamp | 2026-01-06T11:30:00Z |
| `{{SESSION_ID}}` | BMAD session ID | BMAD-20260106-113000 |
| `{{CURRENT_AGENT}}` | Active agent name | bmad-master |
| `{{STORY_ID}}` | Current story | S-011 |
| `{{CONTEXT_PERCENT}}` | Context usage | 72% |

### Critical References

The capsule includes links to (not content of):

1. **Ralph Loop** - Execution state
2. **AGENT-STATE.yaml** - Session coordination
3. **sprint-status.yaml** - Progress tracking
4. **Last Artifact** - Recent output
5. **workflow-status.yaml** - Workflow state

---

## BMAD Master Integration

### Resume Protocol

When BMAD Master loads in fresh session:

1. **Check for continuation capsule**
   ```bash
   ls -lt _bmad-output/continuation-capsules/ | head -1
   ```

2. **Load capsule references in order**
   ```
   Load: .claude/ralph-loop.local.md
   Load: .claude/AGENT-STATE.yaml
   Load: _bmad-output/sprint-artifacts/sprint-status.yaml
   ```

3. **Verify state consistency**
   ```bash
   # Compare AGENT-STATE with LOOP_STATE
   cat .claude/AGENT-STATE.yaml
   cat _bmad/modules/asgl/LOOP_STATE.yaml
   ```

4. **Resume execution**
   ```
   Continuing from S-011 (Phase 2/3)
   Task: Split rag-store.ts into focused slices
   ```

### Auto-Resume Logic

BMAD Master agent should include:

```markdown
## Session Start Protocol

1. Check for continuation capsule in _bmad-output/continuation-capsules/
2. If exists:
   - Load capsule and verify timestamp (<24 hours)
   - Load all critical references
   - Resume from story_id and phase specified
   - Acknowledge continuation: "Resuming session {SESSION_ID}"
3. If not exists:
   - Start fresh autonomous cycle
   - Initialize new session in AGENT-STATE.yaml
```

---

## Performance Characteristics

### Execution Time

```bash
# Test hook overhead
time bash .claude/hooks/context-check.sh

# Expected output:
# 72
#
# real    0m0.042s  # ~42ms
# user    0m0.015s
# sys     0m0.018s
```

**Target**: <100ms overhead
**Actual**: ~40-60ms

### Resource Usage

- **CPU**: Minimal (file scanning only)
- **Memory**: Negligible (<5MB)
- **Disk**: Read-only (no writes except capsule generation)

---

## Compatibility

### Existing Hooks

The context-bridge hook is compatible with:

- **ralph-loop.sh** - Runs after, no conflicts
- **pre-execution.sh** - Independent execution
- **daily-governance-audit.sh** - Different trigger

### Hook Execution Order

```
UserPromptSubmit
    ↓
context-bridge.sh (70% check)
    ↓
ralph-loop.sh (execution loop)
    ↓
pre-execution.sh (validation)
    ↓
[Agent processes message]
```

---

## Troubleshooting

### Issue: Hook not triggering

**Check**: Hook registered in settings.local.json

```bash
grep -A 10 "UserPromptSubmit" .claude/settings.local.json
```

**Fix**: Add hook configuration (see Configuration section)

---

### Issue: False positives (triggers too early)

**Check**: Context estimation accuracy

```bash
# Run verbose check
bash .claude/hooks/context-check.sh verbose

# Compare with actual tokens
# (Use Claude Code's token counter if available)
```

**Fix**: Adjust CONTEXT_THRESHOLD in context-bridge.sh

```bash
# Increase to 80% if triggering too early
CONTEXT_THRESHOLD=80
```

---

### Issue: Continuation capsule not generated

**Check**: Template file exists

```bash
ls -la .claude/hooks/templates/continuation-capsule.md
```

**Check**: Output directory permissions

```bash
mkdir -p _bmad-output/continuation-capsules
chmod 755 _bmad-output/continuation-capsules
```

---

## Maintenance

### Cleaning Old Capsules

```bash
# Remove capsules older than 7 days
find _bmad-output/continuation-capsules -name "*.md" -mtime +7 -delete

# Archive instead of delete
mkdir -p _bmad-output/continuation-archive
find _bmad-output/continuation-capsules -name "*.md" -mtime +7 -exec mv {} _bmad-output/continuation-archive/ \;
```

### Updating Threshold

Adjust based on usage patterns:

```bash
# For very long cycles (hours)
CONTEXT_THRESHOLD=60  # Trigger earlier

# For shorter cycles
CONTEXT_THRESHOLD=80  # Trigger later
```

---

## Validation

### Test Hook Execution

```bash
# Test context check
time bash .claude/hooks/context-check.sh
# Expected: <100ms

# Test capsule generation
bash .claude/hooks/context-bridge.sh "test"
# Expected: No output if <70%, capsule if >=70%

# Verify capsule format
cat _bmad-output/continuation-capsules/*.md | head -50
```

### Integration Test

1. Start autonomous BMAD cycle
2. Monitor context usage until 70%
3. Verify capsule generated
4. Start new conversation
5. Load capsule
6. Verify BMAD Master resumes correctly

---

## References

### Related Files

- `.claude/hooks/context-bridge.sh` - Main hook
- `.claude/hooks/context-check.sh` - Utility
- `.claude/hooks/templates/continuation-capsule.md` - Template
- `.claude/AGENT-STATE.yaml` - Session state
- `_bmad/modules/asgl/LOOP_STATE.yaml` - Sprint state

### Related Documentation

- `AGENTS.md` - BMAD Master configuration
- `.claude/rules/state-management.md` - State persistence
- `.claude/rules/agent-handoff.md` - Handoff protocol

---

**Change Log**:

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-06 | Initial implementation |

---

**Maintained By**: BMAD Core Governance Module
**Status**: Production Ready
