#!/bin/bash
# ============================================================
# Ralph Wiggum Stop Hook - Loop State Coordinator
# ============================================================
# Purpose: Load latest loop state, increment iteration,
#          and validate artifact freshness (HARD-WIRED)
# Triggered: On every Claude Code Stop hook
# Updates: .claude/ralph-loop.local.md iteration counter
# ============================================================

set -euo pipefail

RALPH_FILE=".claude/ralph-loop.local.md"
LOG_FILE="_bmad-output/handoffs/ralph-loop-hook-log.txt"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# ============================================================
# Function: Extract YAML value from Ralph Loop file
# ============================================================
extract_yaml_value() {
    local field="$1"
    grep "^${field}:" "$RALPH_FILE" 2>/dev/null | \
        sed 's/^'"${field}"'://' | \
        sed 's/^[[:space:]]*//' | \
        sed 's/[[:space:]]*#.*$//' || echo ""
}

# ============================================================
# Function: Update YAML value in Ralph Loop file
# ============================================================
update_yaml_value() {
    local field="$1"
    local new_value="$2"

    # Create backup
    cp "$RALPH_FILE" "${RALPH_FILE}.bak"

    # Update the field (sed with backup for macOS compatibility)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i.bak "s/^${field}: .*/${field}: ${new_value}/" "$RALPH_FILE"
    else
        sed -i "s/^${field}: .*/${field}: ${new_value}/" "$RALPH_FILE"
    fi
}

# ============================================================
# Function: Check if timestamp is stale (>24 hours)
# Arguments:
#   $1 - ISO timestamp (YYYY-MM-DDTHH:mm:ssZ or +HH:MM)
# Returns:
#   0 if stale (>24h), 1 if fresh
# ============================================================
is_timestamp_stale() {
    local timestamp="$1"

    # Convert to seconds since epoch (works with GNU date on Linux/macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS date command
        local artifact_epoch=$(date -jf "%Y-%m-%dT%H:%M:%S" "$timestamp" +%s 2>/dev/null || echo 0)
    else
        # GNU date command
        local artifact_epoch=$(date -d "$timestamp" +%s 2>/dev/null || echo 0)
    fi

    local current_epoch=$(date +%s)
    local age_hours=$(( (current_epoch - artifact_epoch) / 3600 ))

    if [[ $age_hours -gt 24 ]]; then
        return 0  # Stale
    else
        return 1  # Fresh
    fi
}

# ============================================================
# Function: Parse created_at from YAML frontmatter
# Arguments:
#   $1 - File path to artifact
# Returns:
#   ISO timestamp string or empty
# ============================================================
extract_created_at() {
    local file="$1"
    grep '^created_at:' "$file" 2>/dev/null | \
        sed 's/^created_at:[[:space:]]*//' | \
        sed 's/[[:space:]]*#.*$//' | \
        tr -d '"' | tr -d "'"
}

# ============================================================
# Function: Find and validate stale artifacts
# Returns:
#   0 if stale artifacts found (should STOP)
#   1 if all fresh
# ============================================================
validate_artifact_freshness() {
    local stale_found=false
    local stale_files=()

    echo "════════════════════════════════════════════════════════════"
    echo "🔍 STALE ARTIFACT VALIDATION (HARD-WIRED CHECK)"
    echo "════════════════════════════════════════════════════════════"

    # Check recent handoff artifacts
    while IFS= read -r -d '' artifact; do
        local created_at=$(extract_created_at "$artifact")

        if [[ -n "$created_at" ]]; then
            if is_timestamp_stale "$created_at"; then
                stale_found=true
                stale_files+=("$artifact")
            fi
        fi
    done < <(find _bmad-output/handoffs -name "*.md" -mtime -2 -type f -print0 2>/dev/null)

    if [[ "$stale_found" == "true" ]]; then
        echo ""
        echo "🚨 STALE ARTIFACTS DETECTED:"
        echo ""

        for stale_file in "${stale_files[@]}"; do
            local created_at=$(extract_created_at "$stale_file")
            local artifact_id=$(grep '^artifact_id:' "$stale_file" 2>/dev/null | head -1 | sed 's/^artifact_id:[[:space:]]*//' | tr -d '"')

            echo "  ┌────────────────────────────────────────────────────────┐"
            echo "  │ Artifact: ${artifact_id:-$(basename "$stale_file")}"
            echo "  │ File:     $stale_file"
            echo "  │ Created:  $created_at"
            echo "  │ Status:   STALE (>24h)"
            echo "  └────────────────────────────────────────────────────────┘"
        done

        echo ""
        echo "════════════════════════════════════════════════════════════"
        echo "⚠️  WORKFLOW STOPPED - USER APPROVAL REQUIRED"
        echo "════════════════════════════════════════════════════════════"
        echo ""
        echo "Run context recovery:"
        echo "  grep -r '{artifact_id}' _bmad-output/ --include='*.md'"
        echo ""
        echo "Options: [1] CONTINUE  [2] REFRESH  [3] ABORT"
        echo "════════════════════════════════════════════════════════════"

        # Update validation state in Ralph Loop
        update_yaml_value "user_approval_required" "true"
        update_yaml_value "stale_detected" "${#stale_files[@]}"

        return 0  # Should stop
    else
        echo "✅ All artifacts fresh (<24h)"
        echo "════════════════════════════════════════════════════════════"

        # Update validation state
        update_yaml_value "user_approval_required" "false"

        return 1  # All good
    fi
}

# ============================================================
# Function: Log hook execution
# ============================================================
log_execution() {
    local iteration="$1"
    local cycle="$2"
    local subcycle="$3"
    local timestamp

    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    cat >> "$LOG_FILE" << EOF
[${timestamp}] Ralph Loop Iteration ${iteration}
  Cycle: ${cycle}
  Sub-cycle: ${subcycle}
  Action: Hook triggered, stale check: $(if validate_artifact_freshness >/dev/null 2>&1; then "STALE"; else "FRESH"; fi)
EOF
}

# ============================================================
# Function: Check for multi-team conflicts
# ============================================================
check_multi_team_conflicts() {
    local team_a_status="bmm-workflow-status.yaml"
    local team_b_status="_bmad-output/sprint-artifacts/team-b-sprint.yaml"

    if [[ -f "$team_a_status" && -f "$team_b_status" ]]; then
        # Check for shared epic references
        local team_a_epic=$(grep '^current_epic:' "$RALPH_FILE" | head -1)
        local team_b_epic=$(grep 'current_epic:' "$RALPH_FILE" | tail -1)

        # If both teams reference same epic, flag potential conflict
        if [[ "$team_a_epic" == *"Epic-"* ]] && [[ "$team_b_epic" == *"Epic-"* ]]; then
            local epic_a=$(echo "$team_a_epic" | grep -oE 'Epic-[0-9]+' | head -1)
            local epic_b=$(echo "$team_b_epic" | grep -oE 'Epic-[0-9]+' | head -1)

            if [[ "$epic_a" == "$epic_b" ]]; then
                echo "⚠️  MULTI-TEAM NOTICE: Both teams working on $epic_a"
                echo "   Coordination protocol: INDEPENDENT_MODE"
            fi
        fi
    fi
}

# ============================================================
# MAIN EXECUTION
# ============================================================

main() {
    # Check if Ralph Loop file exists
    if [[ ! -f "$RALPH_FILE" ]]; then
        echo "⚠️  Ralph Loop state file not found: $RALPH_FILE"
        exit 1
    fi

    # Extract current values
    CURRENT_CYCLE=$(extract_yaml_value "current_cycle")
    CURRENT_SUBCYCLE=$(extract_yaml_value "current_subcycle")
    LAST_COMPLETED=$(extract_yaml_value "last_completed_cycle")
    ITERATION=$(extract_yaml_value "current_iteration")

    # Validate iteration is a number
    if [[ ! "$ITERATION" =~ ^[0-9]+$ ]]; then
        ITERATION=0
    fi

    # Increment iteration
    NEW_ITERATION=$((ITERATION + 1))
    update_yaml_value "current_iteration" "$NEW_ITERATION"

    # Output cycle context to console
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 Ralph Loop Iteration ${NEW_ITERATION}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📊 Cycle Status:"
    echo "   Current Cycle: ${CURRENT_CYCLE}"
    echo "   Sub-cycle: ${CURRENT_SUBCYCLE}"
    echo "   Last Completed: ${LAST_COMPLETED}"
    echo ""

    # Check for multi-team conflicts
    check_multi_team_conflicts
    echo ""

    # Load latest completion report for context if available
    if [[ -n "$CURRENT_CYCLE" ]] && [[ "$CURRENT_CYCLE" != "pending" ]]; then
        # Try to load artifact from current cycle
        ARTIFACT_PATTERN="_bmad-output/artifacts/*/cycle-${CURRENT_CYCLE}-"
        LATEST_ARTIFACT=$(ls -t ${ARTIFACT_PATTERN}*completion.md 2>/dev/null | head -1)

        if [[ -n "$LATEST_ARTIFACT" ]] && [[ -f "$LATEST_ARTIFACT" ]]; then
            echo "📄 Loading context from: ${LATEST_ARTIFACT}"
            echo "   ───────────────────────────────────────────────────"
            # Show first 20 lines of the artifact
            head -20 "$LATEST_ARTIFACT" | sed 's/^/   /'
            echo "   ───────────────────────────────────────────────────"
        fi
    fi

    echo ""

    # RUN HARD-WIRED STALE ARTIFACT CHECK
    # This will STOP the workflow if stale artifacts found
    if validate_artifact_freshness; then
        # Stale artifacts detected - exit with special code
        # Agents should check for this before proceeding
        export RALPH_STALE_ARTIFACT_DETECTED=true
    fi

    echo ""
    echo "✅ Loop state updated. Ready for next cycle."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Log execution
    log_execution "$NEW_ITERATION" "$CURRENT_CYCLE" "$CURRENT_SUBCYCLE"
}

# Run main function
main "$@"
