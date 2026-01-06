# HANDOFF: bmad-master → module-builder

**Session**: BMAD-CONTEXT-BRIDGE-20260106
**Story**: INFRA-001 - Context Continuation Hook
**Date**: 2026-01-06T11:30:00+07:00
**artifact_id**: CTX-BRIDGE-001

---

## From
- **Agent**: bmad-core-bmad-master (BMAD Master v3.1)
- **Module**: bmad-core
- **Specialty**: Autonomous orchestration

## To
- **Agent**: module-builder (BMB Agent Builder)
- **Module**: bmb
- **Path**: _bmad/bmb/agents/module-builder.md

---

## Task

Create a **Context Continuation Hook System** for BMAD autonomous orchestration that:
1. Monitors context usage during autonomous cycles
2. Triggers at 70% context threshold
3. Gathers concise BMAD state with artifact references
4. Generates continuation prompt for fresh session
5. Avoids Claude Code's innate `compact` command

---

## Context

### Problem Statement

During long-running autonomous BMAD cycles (hours of orchestration), Claude Code's context fills up and triggers automatic `compact`. This compaction:
- **Loses critical details** from earlier artifacts
- **Slows down response** time significantly
- **Reduces accuracy** of state-aware decisions

### Solution Architecture

Create a **UserPromptSubmit hook** that:
1. Checks approximate context usage (token estimation)
2. At ~70% threshold, generates "continuation capsule"
3. Outputs instruction to start new conversation with capsule
4. BMAD Master can then resume in fresh context

---

## Requirements

### 1. Context Usage Estimation

Create a bash function to estimate context usage:

```bash
# .claude/hooks/context-bridge.sh

estimate_context_usage() {
    # Count tokens in recent conversation
    # Approximate: 1 token ≈ 4 characters for English text
    # Claude Opus has 200K token context window

    local context_dir=".claude/context"
    local total_chars=0

    # Count visible files in context
    for file in $(find "$context_dir" -name "*.txt" -type f); do
        chars=$(wc -c < "$file" 2>/dev/null || echo 0)
        total_chars=$((total_chars + chars))
    done

    # Estimate tokens (rough approximation)
    local estimated_tokens=$((total_chars / 4))
    local context_percent=$((estimated_tokens * 100 / 150000))  # 150K working context

    echo "$context_percent"
}
```

### 2. Continuation Capsule Generation

At 70% threshold, generate minimal continuation prompt:

```markdown
# BMAD Continuation Capsule - Session {timestamp}

## Current State
- **Agent**: bmad-master
- **Active Cycle**: {cycle_name}
- **Current Story**: {story_id}
- **Phase**: {phase_number}/{total}

## Progress
- Stories Completed: {count}
- Stories Remaining: {count}
- Last Handoff: {artifact_link}

## Critical References
1. Ralph Loop: .claude/ralph-loop.local.md
2. Sprint Status: _bmad-output/sprint-artifacts/sprint-status.yaml
3. Last Artifact: {path}

## Next Action
{continuation_instruction}

---
Load /bmad:core:agents:bmad-master and continue from {story_id}
```

### 3. Hook Configuration

Add to `.claude/settings.json` or `.claude/settings.local.json`:

```json
{
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
```

### 4. BMAD Master Integration

Update BMAD Master agent to:
- Check for continuation capsule on SessionStart
- Auto-load references from capsule
- Resume from exact story/phase

---

## Files to Create

| File | Purpose |
|------|---------|
| `.claude/hooks/context-bridge.sh` | Main hook script |
| `.claude/hooks/templates/continuation-capsule.md` | Continuation prompt template |
| `.claude/hooks/context-check.sh` | Context estimation utility |
| `_bmad/modules/core-governance/hooks/context-continuation.md` | Documentation |

---

## Constraints

- **Zero Breaking Changes**: Must not interfere with existing hooks (ralph-loop.sh, pre-execution.sh)
- **Minimal Overhead**: Context check should complete in <100ms
- **Reference-Based**: Capsule should contain links, not full content
- **Idempotent**: Multiple runs should not cause issues

---

## Acceptance Criteria

- [ ] Hook triggers on UserPromptSubmit
- [ ] Context usage estimated within ±10% accuracy
- [ ] At 70% threshold, continuation capsule generated
- [ ] Capsule contains all critical BMAD references
- [ ] BMAD Master can resume from capsule
- [ ] No interference with existing hooks
- [ ] Hook execution <100ms overhead

---

## Validation Commands

```bash
# Test hook execution time
time bash .claude/hooks/context-bridge.sh "test input"

# Verify capsule generation
ls -la _bmad-output/continuation-capsules/

# Test resume from capsule
# (manual) Load continuation prompt and verify BMAD Master loads correctly
```

---

## Next Action

Load module-builder agent and execute workflow to create:
1. context-bridge.sh hook
2. Continuation capsule template
3. Integration documentation

---

**Return Protocol**: Report completion to BMAD Master with:
- All created files
- Hook configuration applied
- Validation results
- Example continuation capsule
