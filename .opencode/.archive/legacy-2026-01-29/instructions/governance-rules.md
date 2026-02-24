# BMAD Governance Rules

## Pre-Execution Hook

Run `.claude/hooks/pre-execution.sh` before every user message:

```bash
#!/bin/bash
# Pre-Execution Governance Validation

echo "Running governance validation..."

# 1. Check stale artifacts (TTL check with context recovery)
echo "Checking stale artifacts..."
node .claude/hooks/scripts/check-artifact-freshness.js

# 2. Validate artifact size (god artifact detection >5000 lines)
echo "Validating artifact sizes..."
node .claude/hooks/scripts/check-artifact-sizes.js

# 3. Tier 1 protection (constitution read-only check)
echo "Verifying Tier 1 document protection..."
node .claude/hooks/scripts/check-tier1-protection.js

# 4. Time-boxing compliance (story duration monitoring)
echo "Checking time-boxing compliance..."
node .claude/hooks/scripts/check-time-boxing.js

# 5. Context poisoning prevention (duplicate artifact detection)
echo "Preventing context poisoning..."
node .claude/hooks/scripts/check-duplicate-artifacts.js

echo "Governance validation complete."
```

## Post-Execution Hook

Run `.claude/hooks/post-execution.sh` after task completion:

```bash
#!/bin/bash
# Post-Execution Governance Update

echo "Running post-execution updates..."

# Update AGENT-STATE.yaml
echo "Updating AGENT-STATE.yaml..."
node .claude/hooks/scripts/update-agent-state.js

# Archive TTL-expired artifacts
echo "Archiving expired artifacts..."
node .claude/hooks/scripts/archive-expired-artifacts.js

# Update governance documents if needed
echo "Checking governance document updates..."
node .claude/hooks/scripts/check-governance-updates.js

echo "Post-execution updates complete."
```

## Artifact Lifecycle

### Creation
- Assign unique ID (UUID)
- Set TTL based on tier
- Register in artifact-registry.yaml
- Tag with module and workflow

### Validation
- Freshness check before loading
- Size validation (<5000 lines)
- Tier protection verification
- Duplicate detection

### Archival
- Move to `.claude/.archive/` after TTL
- Compress large artifacts
- Update registry
- Generate summary

## Violation Handling

### Tier 1 Violations (Critical)
- Block execution immediately
- Log to error.logs/
- Notify human for resolution

### Tier 2 Violations (High)
- Log violation
- Suggest remediation
- Continue with warning

### Tier 3 Violations (Medium)
- Log violation
- Continue execution
- Add to remediation backlog

## Reporting

Generate daily governance report:
- Violations by type
- Time-boxing compliance rate
- Artifact statistics
- Recommendations
