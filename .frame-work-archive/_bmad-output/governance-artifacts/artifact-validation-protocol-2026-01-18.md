# ARTIFACT VALIDATION PROTOCOL - Governance Rules

**Date**: 2026-01-18
**Purpose**: Prevent consumption of hallucinated artifacts
**Version**: 1.0.0
**Enforcement**: MANDATORY for all agents

---

## Executive Summary

**CRISIS CONTEXT**: 36 artifacts with hallucinated dates discovered on 2026-01-18
**ROOT CAUSE**: Missing date validation in artifact creation workflows
**SOLUTION**: Mandatory validation protocol for all artifact consumption
**GOAL**: 0% future-date artifact consumption going forward

---

## Purpose

This protocol establishes mandatory validation rules for consuming any artifact in the BMAD framework. All agents MUST complete validation checks before consuming any artifact.

**Scope**: All artifact consumption operations
**Enforcement**: Pre-consumption validation checklist
**Penalty**: Blocked execution on validation failure

---

## Validation Checklist (Pre-Consumption)

**MUST COMPLETE ALL CHECKS BEFORE CONSUMPTION**

### 1. Date Validation

- [ ] **Check File Date**: Filename date must not be > current date
  - ❌ **FAIL**: Artifact date > current date = POISONED
  - ✅ **PASS**: Artifact date ≤ current date

- [ ] **Verify Git Commit Date**: Git commit date must match filename date
  - ❌ **FAIL**: Git date != filename date = INVESTIGATE
  - ✅ **PASS**: Git date == filename date

- [ ] **Check Filesystem Timestamp**: Filesystem timestamp must be consistent
  - ❌ **FAIL**: Timestamp inconsistent = SUSPICIOUS
  - ✅ **PASS**: Timestamp consistent with filename date

### 2. Content Validation

- [ ] **Verify YAML Frontmatter Dates**: All dates in frontmatter must be consistent
  - ❌ **FAIL**: Inconsistent dates = POISONED
  - ✅ **PASS**: All dates consistent

- [ ] **Check for References**: References to other artifacts must exist
  - ❌ **FAIL**: References non-existent artifacts = POISONED
  - ✅ **PASS**: All references exist

- [ ] **Validate Content Consistency**: Content must match dates and references
  - ❌ **FAIL**: Inconsistent content = SUSPICIOUS
  - ✅ **PASS**: Content consistent

### 3. Metadata Validation

- [ ] **Check Artifact ID**: Must have unique ID in frontmatter
  - ❌ **FAIL**: Missing or duplicate ID = INVALID
  - ✅ **PASS**: Valid unique ID

- [ ] **Verify Artifact Type**: Must match expected type (story, epic, handoff, etc.)
  - ❌ **FAIL**: Type mismatch = INVALID
  - ✅ **PASS**: Type matches expectation

- [ ] **Check Author/Source**: Must have valid author/source field
  - ❌ **FAIL**: Missing author/source = SUSPICIOUS
  - ✅ **PASS**: Valid author/source

---

## TTL (Time-To-Live) Rules

### Tier Classification

| Tier | Name | TTL | Loading Rule | Validation |
|------|------|-----|-------------|------------|
| **1** | Unchangeable (Constitution) | Permanent | Always load | Read-only check |
| **2** | Controlled & Iterative | Permanent | On-demand | Full validation required |
| **3** | Archival | 90 days | If < 90 days old | Archive if stale |
| **4** | Ephemeral | 24 hours | If < 24h & validated | Ignore if stale |

### TTL Enforcement

**Tier 1 (Constitution)**:
- Never expires
- Read-only validation only
- Must preserve original content

**Tier 2 (Controlled)**:
- Never expires
- Full validation on every consumption
- Must update if modified

**Tier 3 (Archival)**:
- Expires after 90 days
- Validate if age < 90 days
- Archive to `_bmad-ext/.archive/` if stale

**Tier 4 (Ephemeral)**:
- Expires after 24 hours
- Validate if age < 24h AND previously validated
- Ignore if stale (> 24h)

---

## Poisoned Artifact Detection

### Detection Rules

**CRITICAL SIGNALS (100% Poisoned)**:
1. ❌ Date > current date
   - Example: Today is 2026-01-18, artifact dated 2026-01-20
   - Action: Block immediately

2. ❌ References non-existent artifacts
   - Example: Artifact references story-999 which doesn't exist
   - Action: Block immediately

3. ❌ Git commit date != filename date (≥ 1 day difference)
   - Example: Filename 2026-01-20, git commit 2026-01-17
   - Action: Investigate (likely poisoned)

**SUSPICIOUS SIGNALS (Investigate)**:
1. ⚠️ Missing metadata (ID, type, author)
   - Action: Check git history for validation

2. ⚠️ Inconsistent dates in frontmatter
   - Example: `created: 2026-01-17`, `updated: 2026-01-20`
   - Action: Verify via git log

3. ⚠️ Filesystem timestamp != filename date (≥ 1 day difference)
   - Action: Check git commit date

### Detection Methods

**Method 1: Automated Script**
```bash
# Check for future-date artifacts
find _bmad-output -name "*.md" -newermt $(date +%Y-%m-%d)

# Check git date vs filename
git log --name-only --pretty=format:"%h %ad" --date=short _bmad-output/path/to/artifact.md
```

**Method 2: Manual Validation**
```bash
# Check filesystem timestamp
ls -la _bmad-output/path/to/artifact.md

# Check git history
git log --all --full-history -- _bmad-output/path/to/artifact.md
```

**Method 3: Content Analysis**
```yaml
# Read YAML frontmatter
---
date: 2026-01-20  # Check this date
artifact_id: abc123
created: 2026-01-17  # Check consistency
updated: 2026-01-20  # Check consistency
---
```

---

## Action Required on Detection

### For Poisoned Artifacts (100% Confirmed)

1. **Blocklist Immediately**
   - Add to artifact blocklist
   - Prevent consumption by all agents

2. **Archive**
   - Move to `_bmad-ext/.archive/hallucinated/`
   - Add correction note in frontmatter

3. **Delete After Warning**
   - Wait 30-day warning period
   - Delete if no remediation action taken

### For Suspicious Artifacts (Investigate)

1. **Investigate**
   - Check git history
   - Verify filesystem timestamps
   - Analyze content consistency

2. **Classify**
   - If confirmed poisoned → Block + Archive
   - If confirmed authentic → Add to safe list
   - If still unclear → Flag for human review

3. **Update References**
   - Fix all references to corrected artifact names
   - Update blocklists and safe lists

---

## Enforcement Mechanisms

### Agent-Level Enforcement

**Before Artifact Consumption**:
1. Agent MUST run validation checklist
2. Agent MUST reject artifact on validation failure
3. Agent MUST report validation results

**On Validation Failure**:
1. Stop execution immediately
2. Log validation failure to error logs
3. Alert governance agent
4. Request human intervention if needed

### Governance Enforcement

**Governance Agent Checks**:
1. Periodic artifact validation scans
2. Agent compliance monitoring
3. Validation failure reporting
4. Remediation tracking

### Automated Enforcement

**Pre-Commit Hook** (Recommended):
```bash
#!/bin/bash
# pre-commit hook to validate artifact dates

ARTIFACT=$1
CURRENT_DATE=$(date +%Y-%m-%d)

# Extract date from filename
ARTIFACT_DATE=$(echo $ARTIFACT | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}')

# Check if artifact date > current date
if [[ "$ARTIFACT_DATE" > "$CURRENT_DATE" ]]; then
  echo "ERROR: Artifact date $ARTIFACT_DATE is in the future"
  echo "Current date: $CURRENT_DATE"
  exit 1
fi

# Check git commit date
GIT_DATE=$(git log -1 --format="%ad" --date=short -- "$ARTIFACT")

if [[ "$GIT_DATE" != "$ARTIFACT_DATE" ]]; then
  echo "WARNING: Git date ($GIT_DATE) does not match filename date ($ARTIFACT_DATE)"
  # Can still commit but warns
fi

exit 0
```

**Pre-Consumption Hook** (Mandatory):
```bash
#!/bin/bash
# Pre-consumption validation script

ARTIFACT=$1

# Run validation checklist
./validate-artifact.sh "$ARTIFACT"

if [ $? -ne 0 ]; then
  echo "ERROR: Artifact validation failed"
  echo "Do not consume artifact: $ARTIFACT"
  exit 1
fi

exit 0
```

---

## Compliance Tracking

### Metrics to Track

1. **Validation Success Rate**
   - Target: 100% validated before consumption
   - Current: 0% (crisis discovery)

2. **Poisoned Artifact Detection Rate**
   - Target: 100% detection before consumption
   - Current: 100% detected (after crisis)

3. **Agent Compliance Rate**
   - Target: 100% agent compliance
   - Current: 0% (pre-implementation)

### Reporting

**Daily Report**:
- Total artifacts consumed
- Validation failures
- Poisoned artifacts blocked
- Agent compliance status

**Weekly Report**:
- Compliance trends
- Validation accuracy
- Remediation progress
- System health

---

## Training and Awareness

### Agent Training Requirements

**All agents MUST**:
1. Complete artifact validation training
2. Understand detection rules
3. Follow enforcement mechanisms
4. Report validation results

### Human User Awareness

**Users MUST**:
1. Understand artifact poisoning risks
2. Check blocklists before consumption
3. Report suspicious artifacts
4. Follow remediation protocols

---

## Continuous Improvement

### Review Cycle

- **Daily**: Automated validation scans
- **Weekly**: Compliance review
- **Monthly**: Protocol update
- **Quarterly**: Full governance audit

### Update Process

1. Collect feedback from agents
2. Analyze validation failures
3. Update detection rules
4. Train agents on changes
5. Monitor compliance

---

## Reference Documents

- **Artifact Blocklist**: `artifact-blocklist-2026-01-18.md`
- **Safe Artifacts List**: `safe-artifacts-jan-17-18-2026-01-18.md`
- **Governance Rules Update**: `artifact-consumption-rules-update-2026-01-18.md`
- **BMAD Constitution**: `_bmad-ext/modules/governance/constitution.md`

---

**Version History**:
- v1.0.0 (2026-01-18): Initial protocol created in response to artifact poisoning crisis

**Next Review**: 2026-02-18

**Maintained By**: Governance Module (bmad-governance agent)

**Contact**: [Governance Module Contact]
