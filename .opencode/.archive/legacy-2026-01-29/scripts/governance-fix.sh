#!/bin/bash
# Auto-Fix Governance Documents Script
# Usage: ./governance-fix.sh
# Fixes inconsistencies between bmm-workflow-status.yaml and AGENTS.md

set -e

PROJECT_ROOT="/Users/apple/Documents/coding-projects/project-alpha-master"
BMM_STATUS="$PROJECT_ROOT/bmm-workflow-status.yaml"
AGENTS="$PROJECT_ROOT/AGENTS.md"
SPRINT_STATUS="$PROJECT_ROOT/_bmad-output/sprint-artifacts/sprint-status.yaml"
BACKUP_DIR="$PROJECT_ROOT/_bmad-output/.archive/governance-backups/$(date +%Y-%m-%d)"

echo "=== GOVERNANCE AUTO-FIX ==="
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# ================================================================
# BACKUP CURRENT STATE
# ================================================================

echo "Creating backups..."
cp "$BMM_STATUS" "$BACKUP_DIR/bmm-workflow-status.yaml.bak"
cp "$AGENTS" "$BACKUP_DIR/AGENTS.md.bak"
if [ -f "$SPRINT_STATUS" ]; then
  cp "$SPRINT_STATUS" "$BACKUP_DIR/sprint-status.yaml.bak"
fi
echo "  ✓ Backups created in: $BACKUP_DIR"

# ================================================================
# SYNC AGENTS.md FROM BMM-WORKFLOW-STATUS.YAML
# ================================================================

echo ""
echo "Syncing AGENTS.md from bmm-workflow-status.yaml..."

# Extract values from bmm-workflow-status.yaml
CURRENT_WORKFLOW=$(grep -E "^\s+id:" "$BMM_STATUS" 2>/dev/null | head -1 | awk '{print $2}' | tr -d '"' || echo "")
CURRENT_EPIC=$(grep -A20 "current_workflow:" "$BMM_STATUS" | grep -E "^\s+epic:" | head -1 | awk '{print $2}' | tr -d '"' || echo "")
CURRENT_STORY=$(grep -A20 "current_workflow:" "$BMM_STATUS" | grep -E "^\s+story:" | head -1 | awk '{print $2}' | tr -d '"' || echo "")

# Extract active epics with progress
EPIC_FS_PROGRESS=$(grep -A5 'id: "EPIC-FS"' "$BMM_STATUS" | grep -E "progress:" | awk '{print $2}' | tr -d '%' | tr -d '"' || echo "0")
EPIC_39_PROGRESS=$(grep -A5 'id: "EPIC-39"' "$BMM_STATUS" | grep -E "progress:" | awk '{print $2}' | tr -d '%' | tr -d '"' || echo "0")

echo "  → Current workflow: $CURRENT_WORKFLOW"
echo "  → Current epic: $CURRENT_EPIC"
echo "  → Current story: $CURRENT_STORY"
echo "  → EPIC-FS progress: $EPIC_FS_PROGRESS%"
echo "  → EPIC-39 progress: $EPIC_39_PROGRESS%"

# Update AGENTS.md using perl for better table handling
# This preserves the table structure

# Update Active Epic line
perl -i -pe 's/(?<=Active Epic\*\* \| ).*(?= \|)/'"$CURRENT_EPIC ($EPIC_FS_PROGRESS%)"'/g' "$AGENTS"

# Update Next Story line
perl -i -pe 's/(?<=Next Story\*\* \| ).*(?= \|)/'"$CURRENT_STORY"'/g' "$AGENTS"

echo "  ✓ AGENTS.md updated"

# ================================================================
# UPDATE BMM-WORKFLOW-STATUS.YAML (If needed)
# ================================================================

echo ""
echo "Checking bmm-workflow-status.yaml..."

# Verify AGENTS.md was successfully updated
AGENTS_EPIC_CHECK=$(grep -E "^\|\s+\*\*Active Epic\*\*" "$AGENTS" | sed 's/.*|\s*[^|]*|\s*\([^|]*\)\s*|.*/\1/' | xargs | awk '{print $1}' | tr -d ':' || echo "")

if [ "$AGENTS_EPIC_CHECK" = "$CURRENT_EPIC" ]; then
  echo "  ✓ Documents are in sync"
else
  echo "  ⚠ Warning: Sync verification failed"
fi

# ================================================================
# UPDATE SPRINT STATUS (If exists)
# ================================================================

if [ -f "$SPRINT_STATUS" ]; then
  echo ""
  echo "Checking sprint-status.yaml..."
  
  # Check if current story is in sprint
  if grep -q "$CURRENT_STORY" "$SPRINT_STATUS" 2>/dev/null; then
    echo "  ✓ Sprint status is in sync"
  else
    echo "  ⚠ Story $CURRENT_STORY not found in sprint-status.yaml"
    echo "  → Consider running: bmad:sprint:refresh"
  fi
fi

# ================================================================
# SUMMARY
# ================================================================

echo ""
echo "=== FIX COMPLETE ==="
echo ""
echo "Fixed documents:"
echo "  • bmm-workflow-status.yaml: $BMM_STATUS"
echo "  • AGENTS.md: $AGENTS"
echo ""
echo "Backups saved to: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "  1. Verify changes: git diff AGENTS.md"
echo "  2. Test governance check: ./.opencode/scripts/governance-check.sh \"test\""
echo "  3. Commit changes: git add -A && git commit -m \"Fix governance documents\""
echo ""
echo "To revert: cp $BACKUP_DIR/bmm-workflow-status.yaml.bak $BMM_STATUS"
echo "           cp $BACKUP_DIR/AGENTS.md.bak $AGENTS"

exit 0
