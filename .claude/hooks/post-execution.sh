#!/bin/bash
# Post-Execution Governance Update
# Part of BMAD Governance Framework

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../../.."  # Navigate to project root

echo "Running post-execution updates..."

# Archive TTL-expired artifacts
echo "Archiving expired artifacts..."
node "$SCRIPT_DIR/scripts/archive-expired-artifacts.cjs"

echo ""
echo "✅ Post-execution updates complete."
