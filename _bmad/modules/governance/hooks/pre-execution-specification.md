# Pre-Execution Hook Specification

**Workflow ID**: `@bmad/modules/governance/hooks/pre-execution`
**Version**: 1.0.0
**Created**: 2026-01-06
**Purpose**: HARD-WIRED artifact freshness validation BEFORE any workflow execution
**Enforcement**: PRE-EXECUTION HOOK (Claude Code + OpenCode)

---

## ═══════════════════════════════════════════════════════════════════════════════
## CRITICAL: NON-OVERRIDEABLE STOP CONDITION
## ═══════════════════════════════════════════════════════════════════════════════

```yaml
HARD_WIRED_STOP_CONDITION:
  trigger: "pre-execution hook - before ANY agent workflow"

  validate:
    - "artifact.age > 24 hours"
    - "artifact.sequence_number broken"
    - "artifact.metadata disconnected"
    - "artifact.parent_id missing"
    - "artifact.team conflict (both teams on same epic)"

  if_any_condition_true:
    action: "IMMEDIATE_WORKFLOW_STOP"
    steps:
      1. "Block workflow execution"
      2. "Grep search artifact_id across _bmad-output/"
      3. "Read last 3 related artifacts"
      4. "Synthesize context summary"
      5. "PRESENT RECOVERED CONTEXT to user"
      6. "WAIT for explicit user approval: 'continue' | 'refresh' | 'abort'"

  on_user_approval:
    if_continue: "Proceed with workflow using recovered context"
    if_refresh: "Re-validate artifact and update context"
    if_abort: "Stop workflow and notify human"

  enforcement:
    - "Pre-execution hook (.claude/hooks/pre-execution.sh)"
    - "Pre-execution hook (.opencode/hooks/pre-execution.sh)"
    - "Ralph Loop integration (automatic check on iteration)"
    - "Cannot be disabled or bypassed by agents"
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## HOOK LOCATIONS & INVOCATION
## ═══════════════════════════════════════════════════════════════════════════════

### Claude Code Pre-Execution Hook

```bash
# File: .claude/hooks/pre-execution.sh
# Trigger: Before ANY user message is processed by Claude Code
# Permission: Must be executable (chmod +x)

#!/bin/bash
# ============================================================
# Claude Code Pre-Execution Hook - Stale Artifact Validation
# ============================================================
# Purpose: HARD-WIRED check for stale artifacts before ANY execution
# Triggered: Before every user message is sent to Claude
# Blocks: Workflow execution until user approves stale context
# ============================================================

set -euo pipefail

# Source shared validation functions
source "$(dirname "$0")/ralph-loop.sh" || true

RALPH_FILE=".claude/ralph-loop.local.md"
LOG_FILE="_bmad-output/handoffs/pre-execution-hook-log.txt"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# ============================================================
# Function: Check if current session involves artifact handoff
# ============================================================
is_handoff_session() {
    local user_input="$1"

    # Check for handoff-related keywords
    if [[ "$user_input" =~ @(handoff|artifact|context|resume|continue) ]]; then
        return 0  # Is handoff
    fi

    # Check if any recent handoff files exist
    if find _bmad-output/handoffs -name "*.md" -mtime -1 -type f | grep -q .; then
        return 0  # Has recent handoffs
    fi

    return 1  # Not a handoff session
}

# ============================================================
# Function: Detect artifact_id from user input or context
# ============================================================
detect_artifact_context() {
    local user_input="$1"

    # Extract artifact_id pattern (e.g., ARC-STORE-001, E4-handoff, etc.)
    if [[ "$user_input" =~ ([A-Z]+-[A-Z]+-[0-9]+|[A-Z][0-9]+-handoff) ]]; then
        echo "${BASH_REMATCH[1]}"
        return 0
    fi

    # Check most recent handoff file
    local latest_handoff=$(find _bmad-output/handoffs -name "*.md" -mtime -1 -type f | head -1)
    if [[ -n "$latest_handoff" ]]; then
        grep '^artifact_id:' "$latest_handoff" 2>/dev/null | sed 's/artifact_id: //' | tr -d '"'
        return 0
    fi

    echo ""
    return 1
}

# ============================================================
# Function: Perform full context recovery
# ============================================================
perform_context_recovery() {
    local artifact_id="$1"

    echo "════════════════════════════════════════════════════════════"
    echo "🔄 CONTEXT RECOVERY IN PROGRESS"
    echo "════════════════════════════════════════════════════════════"
    echo ""

    # Step 1: Grep search for artifact_id
    echo "📂 Step 1: Searching for ${artifact_id} across _bmad-output/..."
    local related_files=$(grep -r "$artifact_id" _bmad-output/ \
        --include="*.md" \
        --include="*.yaml" \
        --exclude-dir=".archive" 2>/dev/null | cut -d: -f1 | sort -u)

    echo "   Found ${related_files}"
    echo ""

    # Step 2: Grep search for parent_id to trace lineage
    echo "📂 Step 2: Tracing artifact lineage..."
    local parent_id=$(grep -r "parent_id:.*${artifact_id}" _bmad-output/ \
        --include="*.md" 2>/dev/null | head -1 | sed 's/.*parent_id: //' | tr -d '"')

    if [[ -n "$parent_id" ]]; then
        echo "   Parent: ${parent_id}"
        local parent_files=$(grep -r "$parent_id" _bmad-output/ \
            --include="*.md" 2>/dev/null | cut -d: -f1 | sort -u)
        echo "   Parent files: ${parent_files}"
    fi
    echo ""

    # Step 3: Read last 3 related artifacts
    echo "📄 Step 3: Reading last 3 related artifacts..."
    local count=0
    for file in $(echo "$related_files" | tail -3); do
        if [[ -f "$file" ]]; then
            echo "   ┌────────────────────────────────────────────────────────┐"
            echo "   │ File: $file"
            echo "   └────────────────────────────────────────────────────────┘"
            head -30 "$file" | sed 's/^/   /'
            echo ""
            ((count++))
        fi
    done

    # Step 4: Synthesize context summary
    echo "════════════════════════════════════════════════════════════"
    echo "📊 CONTEXT SUMMARY"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "Artifact ID: ${artifact_id}"
    echo "Related Files Found: $(echo "$related_files" | wc -l)"
    echo "Artifacts Read: ${count}"
    echo "Parent ID: ${parent_id:-none}"
    echo ""

    # Return the context for user presentation
    cat << EOF

════════════════════════════════════════════════════════════
⚠️  STALE ARTIFACT DETECTED - WORKFLOW STOPPED
════════════════════════════════════════════════════════════

Artifact: ${artifact_id}
Age: >24 hours (threshold exceeded)
Status: Context recovered from ${count} related artifacts

────────────────────────────────────────────────────────────────────
RECOVERED CONTEXT (via grep search):
────────────────────────────────────────────────────────────────────

${related_files}

════════════════════════════════════════════════════════════
YOUR OPTIONS:
════════════════════════════════════════════════════════════
  [1] CONTINUE - Proceed with recovered context
  [2] REFRESH - Re-validate artifact and update context
  [3] ABORT   - Stop workflow and notify human
════════════════════════════════════════════════════════════

Please respond with: continue, refresh, or abort
EOF

    # Update Ralph Loop state
    update_yaml_value "stale_detected" "${count}"
    update_yaml_value "context_recovered" "${count}"
    update_yaml_value "user_approval_required" "true"
}

# ============================================================
# MAIN EXECUTION
# ============================================================

main() {
    local user_input="$1"
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Log execution
    cat >> "$LOG_FILE" << EOF
[${timestamp}] Pre-Execution Hook triggered
  Input: ${user_input:0:100}...
  Checking: Stale artifacts
EOF

    # Run the stale artifact validation
    if validate_artifact_freshness; then
        # Stale artifacts detected - perform context recovery
        artifact_id=$(detect_artifact_context "$user_input")

        if [[ -n "$artifact_id" ]]; then
            perform_context_recovery "$artifact_id"

            # Exit with special code to signal BLOCK
            echo ""
            echo "🚨 WORKFLOW BLOCKED - Awaiting user approval"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

            exit 1  # Non-zero exit blocks execution
        else
            # Stale detected but no specific artifact - general warning
            echo "⚠️  Stale artifacts detected. Run 'grep search' for context recovery."
            exit 1
        fi
    fi

    # All clear - allow execution to proceed
    echo "✅ Pre-execution validation passed"
    exit 0
}

# Run main function
main "$@"
```

### OpenCode Pre-Execution Hook

```bash
# File: .opencode/hooks/pre-execution.sh
# Trigger: Before ANY user message is processed by OpenCode
# Structure: Identical to Claude Code hook, different logging path

#!/bin/bash
# ============================================================
# OpenCode Pre-Execution Hook - Stale Artifact Validation
# ============================================================
# Purpose: HARD-WIRED check for stale artifacts before ANY execution
# Triggered: Before every user message is sent to OpenCode
# Blocks: Workflow execution until user approves stale context
# ============================================================

# Same implementation as Claude Code hook
# Differences:
#  1. Log file: _bmad-output/handoffs/opencode-hook-log.txt
#  2. Platform identifier in output messages
#  3. Everything else is identical

# Copy the Claude Code implementation here
# Change LOG_FILE path only
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## HOOK INTEGRATION FLOW
## ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INPUT                                    │
│  "Continue with the handoff from E4"                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              PRE-EXECUTION HOOK TRIGGERED                         │
│  .claude/hooks/pre-execution.sh OR .opencode/hooks/pre-execution.sh│
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              VALIDATE ARTIFACT FRESHNESS                          │
│  - Parse artifact_id from input or detect from recent handoffs   │
│  - Check _bmad-output/handoffs/ for artifacts >24h old          │
│  - Validate metadata integrity (frontmatter)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         FRESH │                     │ STALE
              │                     │
              ▼                     ▼
     ┌──────────────┐      ┌──────────────────┐
     │ ALLOW EXEC   │      │ CONTEXT RECOVERY  │
     │ exit 0       │      │ - Grep search     │
     └──────────────┘      │ - Read artifacts  │
                            │ - Present summary │
                            │ - WAIT for input │
                            └────────┬─────────┘
                                     │
                         ┌───────────┴──────────┐
                         │                      │
                    CONTINUE              ABORT/REFRESH
                         │                      │
                         ▼                      ▼
                ┌──────────────┐      ┌──────────────┐
                │ PROCEED      │      │ STOP/UPDATE  │
                └──────────────┘      └──────────────┘
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## USER RESPONSE HANDLING
## ═══════════════════════════════════════════════════════════════════════════════

### Response: "continue"

**Action**: Allow workflow to proceed with recovered context

**Implementation**:
```bash
# After user types "continue"
# Update Ralph Loop state
update_yaml_value "user_approval_required" "false"
update_yaml_value "context_recovered" "$((context_recovered + 1))"

# Allow execution to proceed
exit 0
```

### Response: "refresh"

**Action**: Re-validate artifact, update metadata timestamp, allow proceed

**Implementation**:
```bash
# Update artifact frontmatter with new timestamp
sed -i.bak "s/^last_validated: .*/last_validated: $(date -u +%Y-%m-%dT%H:%M:%SZ)/" "$ARTIFACT_FILE"

# Update status if expired
sed -i.bak 's/^status: "EXPIRED"/status: "ACTIVE"/' "$ARTIFACT_FILE"

# Allow execution to proceed
exit 0
```

### Response: "abort"

**Action**: Stop workflow, notify human, preserve state

**Implementation**:
```bash
# Log abort reason
cat >> "$LOG_FILE" << EOF
[${timestamp}] Workflow aborted by user due to stale artifact
  Artifact: ${artifact_id}
  Reason: User chose to abort
EOF

# Exit with special code
exit 2  # Signals user-initiated abort
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## MULTI-TEAM CONFLICT DETECTION
## ═══════════════════════════════════════════════════════════════════════════════

```yaml
team_conflict_detection:
  check: "same_epic in both Team-A and Team-B status files"

  trigger_condition:
    - "grep epic_id in bmm-workflow-status.yaml"
    - "grep same epic_id in _bmad-output/sprint-artifacts/team-b-sprint.yaml"
    - "both show status: IN_PROGRESS"

  if_conflict_detected:
    action: "STOP_AND_ASK_USER"
    message_template: |
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ⚠️  MULTI-TEAM CONFLICT DETECTED
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      Epic: {epic_id}

      Team A: {team_a_status}
        Current Story: {team_a_current_story}
        Progress: {team_a_progress}%

      Team B: {team_b_status}
        Current Story: {team_b_current_story}
        Progress: {team_b_progress}%

      Both teams are actively working on the same epic.
      Coordination required to avoid conflicts.

      Options:
        [1] CONTINUE_TEAM_A - Prioritize Team-A work
        [2] CONTINUE_TEAM_B - Prioritize Team-B work
        [3] MERGE_COORDINATE - Merge and coordinate both teams
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## INSTALLATION & PERMISSIONS
## ═══════════════════════════════════════════════════════════════════════════════

### Installation Steps

```bash
# 1. Create hooks directory if not exists
mkdir -p .claude/hooks
mkdir -p .opencode/hooks

# 2. Copy ralph-loop.sh (shared functions)
cp _bmad/modules/governance/hooks/ralph-loop.sh .claude/hooks/
cp _bmad/modules/governance/hooks/ralph-loop.sh .opencode/hooks/

# 3. Create pre-execution hooks
cp _bmad/modules/governance/hooks/pre-execution.sh .claude/hooks/
cp _bmad/modules/governance/hooks/opencode-pre-execution.sh .opencode/hooks/pre-execution.sh

# 4. Make executable
chmod +x .claude/hooks/ralph-loop.sh
chmod +x .claude/hooks/pre-execution.sh
chmod +x .opencode/hooks/ralph-loop.sh
chmod +x .opencode/hooks/pre-execution.sh

# 5. Verify installation
ls -la .claude/hooks/
ls -la .opencode/hooks/
```

### Verification

```bash
# Test pre-execution hook
echo "test handoff input" | .claude/hooks/pre-execution.sh

# Expected output:
# - ✅ Pre-execution validation passed (if no stale artifacts)
# - OR 🚨 WORKFLOW BLOCKED (if stale artifacts detected)
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## SUCCESS CRITERIA
## ═══════════════════════════════════════════════════════════════════════════════

- [ ] Pre-execution hook validates artifact freshness before ANY workflow
- [ ] Grep search recovers context automatically for stale artifacts
- [ ] User presented with recovered context BEFORE workflow continues
- [ ] Multi-team conflicts detected and flagged
- [ ] Sequence integrity validated before processing
- [ ] Ralph Loop tracks all validation state
- [ ] Hooks are executable (+x permission) in both .claude and .opencode
- [ ] Cannot be disabled or bypassed by agents
- [ ] User MUST explicitly approve before proceeding with stale context

---

## ═══════════════════════════════════════════════════════════════════════════════
## INTEGRATION CHECKLIST
## ═══════════════════════════════════════════════════════════════════════════════

**Before Deployment**:
- [ ] Copy `ralph-loop.sh` to both `.claude/hooks/` and `.opencode/hooks/`
- [ ] Create `pre-execution.sh` in `.claude/hooks/`
- [ ] Create `pre-execution.sh` in `.opencode/hooks/`
- [ ] Set executable permissions on all hook files
- [ ] Test with sample stale artifact
- [ ] Test with sample fresh artifact
- [ ] Test multi-team conflict detection
- [ ] Verify Ralph Loop state updates correctly

**After Deployment**:
- [ ] Monitor hook logs in `_bmad-output/handoffs/`
- [ ] Verify no workflow proceeds without validation
- [ ] Confirm user approval is required for stale artifacts
- [ ] Check Ralph Loop validation state is accurate

---

**Hook Owner**: @bmad/modules/governance
**Last Updated**: 2026-01-06
**Status**: READY FOR DEPLOYMENT - Design Complete
**Integration**: Claude Code + OpenCode pre-execution hooks
**HARD-WIRED**: Cannot be disabled by agents or workflows
