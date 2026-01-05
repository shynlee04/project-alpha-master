#!/bin/bash
# ============================================================
# OpenCode Pre-Execution Hook - Stale Artifact Validation
# ============================================================
# Purpose: HARD-WIRED check for stale artifacts before ANY execution
# Triggered: Before every user message is sent to OpenCode
# Blocks: Workflow execution until user approves stale context
# Version: 1.0.0
# Created: 2026-01-06
# Platform: OpenCode
# ============================================================

set -euo pipefail

# Source shared validation functions
source "$(dirname "$0")/ralph-loop.sh" || true

RALPH_FILE=".claude/ralph-loop.local.md"
LOG_FILE="_bmad-output/handoffs/opencode-pre-execution-hook-log.txt"

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
    if find _bmad-output/handoffs -name "*.md" -mtime -1 -type f 2>/dev/null | grep -q .; then
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
    local latest_handoff=$(find _bmad-output/handoffs -name "*.md" -mtime -1 -type f 2>/dev/null | head -1)
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
    echo "🔄 [OpenCode] CONTEXT RECOVERY IN PROGRESS"
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
    echo "📊 [OpenCode] CONTEXT SUMMARY"
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
⚠️  STALE ARTIFACT DETECTED - WORKFLOW STOPPED [OpenCode]
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
[${timestamp}] [OpenCode] Pre-Execution Hook triggered
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
            echo "🚨 [OpenCode] WORKFLOW BLOCKED - Awaiting user approval"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

            exit 1  # Non-zero exit blocks execution
        else
            # Stale detected but no specific artifact - general warning
            echo "⚠️  [OpenCode] Stale artifacts detected. Run 'grep search' for context recovery."
            exit 1
        fi
    fi

    # All clear - allow execution to proceed
    echo "✅ [OpenCode] Pre-execution validation passed"
    exit 0
}

# Run main function
main "$@"
