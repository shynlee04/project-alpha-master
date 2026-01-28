#!/bin/bash
# Stale Document Detection Script
# Usage: ./governance-freshness.sh
# Checks if governance documents are within freshness threshold (≤4 hours)

set -e

PROJECT_ROOT="/Users/apple/Documents/coding-projects/project-alpha-master"
BMM_STATUS="$PROJECT_ROOT/bmm-workflow-status.yaml"
AGENTS="$PROJECT_ROOT/AGENTS.md"
SPRINT_STATUS="$PROJECT_ROOT/_bmad-output/sprint-artifacts/sprint-status.yaml"

# Freshness threshold in hours
FRESHNESS_THRESHOLD=4

echo "=== GOVERNANCE DOCUMENT FRESHNESS CHECK ==="
echo "Threshold: ≤$FRESHNESS_THRESHOLD hours old"
echo ""

# Function to check file freshness
check_freshness() {
  local file="$1"
  local name="$2"
  
  if [ ! -f "$file" ]; then
    echo "  ○ $name: FILE NOT FOUND"
    return 1
  fi
  
  # Get file modification time in seconds since epoch
  local file_time=$(stat -f "%m" "$file" 2>/dev/null || stat -c "%Y" "$file" 2>/dev/null || echo "0")
  
  # Get current time in seconds since epoch
  local current_time=$(date +%s)
  
  # Calculate age in hours
  local age_seconds=$((current_time - file_time))
  local age_hours=$(awk "BEGIN {printf \"%.1f\", $age_seconds/3600}")
  
  # Check if within threshold
  local is_fresh=$(awk "BEGIN {print ($age_hours <= $FRESHNESS_THRESHOLD ? 1 : 0)}")
  
  if [ "$is_fresh" -eq 1 ]; then
    echo "  ✓ $name: $age_hours hours old (FRESH)"
    return 0
  else
    echo "  ⚠ $name: $age_hours hours old (STALE - exceeds $FRESHNESS_THRESHOLD hour threshold)"
    return 1
  fi
}

# Track overall freshness
STALE_COUNT=0

echo "Checking document freshness..."
echo ""

# Check each document
check_freshness "$BMM_STATUS" "bmm-workflow-status.yaml" || STALE_COUNT=$((STALE_COUNT + 1))
check_freshness "$AGENTS" "AGENTS.md" || STALE_COUNT=$((STALE_COUNT + 1))

if [ -f "$SPRINT_STATUS" ]; then
  check_freshness "$SPRINT_STATUS" "sprint-status.yaml" || STALE_COUNT=$((STALE_COUNT + 1))
else
  echo "  ○ sprint-status.yaml: NOT FOUND (optional)"
fi

echo ""
echo "=== FRESHNESS SUMMARY ==="

if [ $STALE_COUNT -gt 0 ]; then
  echo "⚠ $STALE_COUNT document(s) are STALE"
  echo ""
  echo "To refresh documents:"
  echo "  1. Run: ./.opencode/scripts/governance-fix.sh"
  echo "  2. Or manually update the affected files"
  exit 1
else
  echo "✅ All governance documents are FRESH"
  exit 0
fi
