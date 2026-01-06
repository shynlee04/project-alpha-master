#!/bin/bash
# ============================================================
# Claude Code Pre-Execution Hook - Comprehensive Governance Validation
# ============================================================
# Purpose: HARD-WIRED governance enforcement before ANY execution
# Triggered: Before every user message is sent to Claude
# Blocks: Workflow execution until governance violations resolved
# Version: 2.0.0
# Updated: 2026-01-06 (BMAD Framework Transformation)
# ============================================================

set -euo pipefail

# Source shared validation functions
source "$(dirname "$0")/ralph-loop.sh" || true

RALPH_FILE=".claude/ralph-loop.local.md"
LOG_FILE="_bmad-output/handoffs/claude-pre-execution-hook-log.txt"

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
# Function: Validate artifact sizes (detect god artifacts)
# ============================================================
validate_artifact_sizes() {
    echo "📏 Checking artifact sizes..."

    local god_artifacts=0
    local large_artifacts=0

    # Check for god artifacts (>5000 lines)
    while IFS= read -r -d '' file; do
        local lines=$(wc -l < "$file")
        if [[ $lines -gt 5000 ]]; then
            echo "❌ GOD ARTIFACT DETECTED: $file ($lines lines)"
            ((god_artifacts++))
        elif [[ $lines -gt 1000 ]]; then
            echo "⚠️  Large artifact: $file ($lines lines) - Consider splitting"
            ((large_artifacts++))
        fi
    done < <(find _bmad-output -name "*.md" -type f -print0 2>/dev/null)

    if [[ $god_artifacts -gt 0 ]]; then
        echo ""
        echo "════════════════════════════════════════════════════════════"
        echo "🚨 GOVERNANCE VIOLATION - GOD ARTIFACTS DETECTED"
        echo "════════════════════════════════════════════════════════════"
        echo "God artifacts: $god_artifacts (exceeds 5000 lines)"
        echo "Large artifacts: $large_artifacts (exceeds 1000 lines)"
        echo ""
        echo "ACTION REQUIRED: Split god artifacts before proceeding"
        echo "Use component-splitter agent to remediate"
        echo "════════════════════════════════════════════════════════════"
        return 1
    fi

    return 0
}

# ============================================================
# Function: Validate Tier 1 protection (constitution read-only)
# ============================================================
validate_tier_1_protection() {
    echo "🔒 Validating Tier 1 (Constitution) protection..."

    local tier_1_artifacts=(
        "_bmad/modules/governance/CONSTITUTION.md"
        "agent-os/standards/global/*.md"
    )

    local violations=0

    # Check for modification attempts on Tier 1 artifacts
    for pattern in "${tier_1_artifacts[@]}"; do
        if git status --porcelain 2>/dev/null | grep -q "$pattern"; then
            echo "❌ TIER 1 VIOLATION: Modification detected on $pattern"
            ((violations++))
        fi
    done

    if [[ $violations -gt 0 ]]; then
        echo ""
        echo "════════════════════════════════════════════════════════════"
        echo "🚨 GOVERNANCE VIOLATION - CONSTITUTION MODIFICATION BLOCKED"
        echo "════════════════════════════════════════════════════════════"
        echo "Tier 1 artifacts are READ-ONLY by design"
        echo "Violations: $violations"
        echo ""
        echo "ACTION REQUIRED: Revert changes to constitution documents"
        echo "════════════════════════════════════════════════════════════"
        return 1
    fi

    return 0
}

# ============================================================
# Function: Validate time-boxing compliance
# ============================================================
validate_time_boxing() {
    echo "⏱️  Validating time-boxing compliance..."

    # Load current state
    if [[ -f ".claude/AGENT-STATE.yaml" ]]; then
        local current_story=$(grep "^current:" -A 10 .claude/AGENT-STATE.yaml | grep "story:" | head -1 | cut -d: -f2 | tr -d ' "')
        local story_start=$(grep "^current:" -A 10 .claude/AGENT-STATE.yaml | grep "started_at:" | head -1 | cut -d: -f2- | tr -d ' "')

        if [[ -n "$current_story" && -n "$story_start" ]]; then
            local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
            local start_sec=$(date -d "$story_start" +%s 2>/dev/null || echo "0")
            local now_sec=$(date -d "$now" +%s 2>/dev/null || echo "0")
            local elapsed=$((now_sec - start_sec))
            local elapsed_min=$((elapsed / 60))

            echo "Story: $current_story"
            echo "Elapsed time: ${elapsed_min} minutes"

            # Check if exceeded 2x time-box (60 minutes for stories)
            if [[ $elapsed_min -gt 60 ]]; then
                echo ""
                echo "════════════════════════════════════════════════════════════"
                echo "⚠️  TIME-BOX VIOLATION - Story exceeded 60 minutes"
                echo "════════════════════════════════════════════════════════════"
                echo "Story: $current_story"
                echo "Elapsed: ${elapsed_min} minutes (exceeds 2x time-box)"
                echo ""
                echo "RECOMMENDED ACTIONS:"
                echo "  1. Split story into smaller sub-stories"
                echo "  2. Add dedicated research phase"
                echo "  3. Trigger deep-investigation workflow"
                echo "════════════════════════════════════════════════════════════"
                # Don't block, just warn
                return 0
            fi
        fi
    fi

    return 0
}

# ============================================================
# Function: Validate context poisoning (duplicate detection)
# ============================================================
validate_context_poisoning() {
    echo "🔍 Validating context integrity (duplicate detection)..."

    # Check for duplicate artifact IDs
    local duplicate_count=0

    # Extract artifact IDs from all markdown files
    local artifacts=$(find _bmad-output -name "*.md" -type f -exec grep -H "^artifact_id:" {} \; 2>/dev/null | cut -d: -f2 | tr -d ' "' | sort)

    # Count occurrences
    local duplicates=$(echo "$artifacts" | uniq -d)

    if [[ -n "$duplicates" ]]; then
        echo "⚠️  Duplicate artifact IDs detected:"
        echo "$duplicates" | while read -r id; do
            echo "  - $id"
            ((duplicate_count++))
        done

        if [[ $duplicate_count -gt 0 ]]; then
            echo ""
            echo "════════════════════════════════════════════════════════════"
            echo "⚠️  CONTEXT POISONING RISK - Duplicate Artifacts"
            echo "════════════════════════════════════════════════════════════"
            echo "Duplicate artifact IDs: $duplicate_count"
            echo ""
            echo "ACTION REQUIRED: Consolidate or archive duplicate artifacts"
            echo "════════════════════════════════════════════════════════════"
            return 1
        fi
    fi

    return 0
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
[${timestamp}] Pre-Execution Hook triggered (v2.0.0)
  Input: ${user_input:0:100}...
  Running: Full governance validation suite
EOF

    echo "════════════════════════════════════════════════════════════"
    echo "🛡️  COMPREHENSIVE GOVERNANCE VALIDATION (v2.0.0)"
    echo "════════════════════════════════════════════════════════════"
    echo ""

    # Validation 1: Stale artifact detection (existing)
    echo "▶️  [1/5] Stale Artifact Detection"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
    echo "✅ Stale artifact check passed"
    echo ""

    # Validation 2: Artifact size validation (new)
    echo "▶️  [2/5] Artifact Size Validation"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if ! validate_artifact_sizes; then
        echo ""
        echo "🚨 WORKFLOW BLOCKED - God artifacts detected"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        exit 1
    fi
    echo "✅ Artifact size check passed"
    echo ""

    # Validation 3: Tier 1 protection (new)
    echo "▶️  [3/5] Tier 1 (Constitution) Protection"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if ! validate_tier_1_protection; then
        echo ""
        echo "🚨 WORKFLOW BLOCKED - Constitution modification detected"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        exit 1
    fi
    echo "✅ Tier 1 protection check passed"
    echo ""

    # Validation 4: Time-boxing compliance (new)
    echo "▶️  [4/5] Time-Boxing Compliance"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if ! validate_time_boxing; then
        echo ""
        echo "⚠️  Warning: Time-boxing check completed with warnings"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        # Don't block on time-boxing warnings, just log
    fi
    echo "✅ Time-boxing check completed"
    echo ""

    # Validation 5: Context poisoning prevention (new)
    echo "▶️  [5/5] Context Poisoning Prevention"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if ! validate_context_poisoning; then
        echo ""
        echo "🚨 WORKFLOW BLOCKED - Duplicate artifacts detected"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        exit 1
    fi
    echo "✅ Context integrity check passed"
    echo ""

    # All validations passed - allow execution to proceed
    echo "════════════════════════════════════════════════════════════"
    echo "✅ ALL GOVERNANCE VALIDATIONS PASSED"
    echo "════════════════════════════════════════════════════════════"
    echo "Execution authorized: Proceeding with workflow"
    echo ""

    exit 0
}

# Run main function
main "$@"
