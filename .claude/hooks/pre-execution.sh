#!/bin/bash
# Pre-Execution Governance Validation
# Part of BMAD Governance Framework

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../../.."  # Navigate to project root

echo "Running governance validation..."

# 1. Check stale artifacts (TTL check with context recovery)
echo "Checking stale artifacts..."
node "$SCRIPT_DIR/scripts/check-artifact-freshness.cjs"

# 2. Validate artifact size (god artifact detection >5000 lines)
echo "Validating artifact sizes..."
node "$SCRIPT_DIR/scripts/check-artifact-sizes.cjs"

# 3. Tier 1 protection (constitution read-only check)
echo "Verifying Tier 1 document protection..."
node "$SCRIPT_DIR/scripts/check-tier1-protection.cjs"

# 4. Time-boxing compliance (story duration monitoring)
echo "Checking time-boxing compliance..."
node "$SCRIPT_DIR/scripts/check-time-boxing.cjs"

# 5. Context poisoning prevention (duplicate artifact detection)
echo "Preventing context poisoning..."
node "$SCRIPT_DIR/scripts/check-duplicate-artifacts.cjs"

echo ""
echo "✅ Governance validation complete."
