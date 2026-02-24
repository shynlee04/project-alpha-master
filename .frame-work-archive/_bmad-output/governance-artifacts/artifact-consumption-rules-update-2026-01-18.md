# GOVERNANCE RULES UPDATE - Artifact Consumption

**Date**: 2026-01-18
**Purpose**: Add artifact validation to prevent poisoned artifact consumption
**Status**: PROPOSED - Awaiting Approval
**Target**: AGENTS.md and governance workflows
**Priority**: P0 - Critical

---

## Executive Summary

**CRISIS**: 36 artifacts with hallucinated dates discovered on 2026-01-18
**IMPACT**: 100% of poisoned artifacts could have been consumed without validation
**ROOT CAUSE**: No mandatory artifact validation in governance rules
**SOLUTION**: Add artifact consumption validation section to AGENTS.md

---

## Purpose

This document proposes updates to governance rules to mandate artifact validation before consumption. The goal is to prevent future artifact poisoning crises by enforcing validation checks at all agent levels.

**Target Document**: AGENTS.md
**New Section**: "## 🚨 Artifact Validation (Pre-Consumption)"
**Enforcement**: MANDATORY for all agents
**Implementation**: Immediate approval required

---

## Proposed Updates to AGENTS.md

### New Section: Artifact Validation (Pre-Consumption)

**Insert Location**: After "## 📍 Navigation Index" section
**Priority**: P0 (First section after navigation)

---

```markdown
## 🚨 Artifact Validation (Pre-Consumption)

> **Status**: MANDATORY - All agents must validate artifacts before consumption
> **Effective**: 2026-01-18 (Crisis Response)
> **Penalty**: Execution blocked on validation failure

### Context

**CRISIS SUMMARY**:
- 36 artifacts with hallucinated dates discovered on 2026-01-18
- All poisoned artifacts had dates in the future (1-6 days ahead)
- Root cause: No mandatory artifact validation in governance rules
- Impact: 100% of poisoned artifacts could have been consumed

### Validation Checklist (Pre-Consumption)

**MUST COMPLETE ALL CHECKS BEFORE CONSUMING ANY ARTIFACT**

#### 1. Date Validation

- [ ] **Check File Date**: Filename date must not be > current date
  ```bash
  # Check filename date
  artifact_date=$(echo "$ARTIFACT" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}')
  current_date=$(date +%Y-%m-%d)
  if [[ "$artifact_date" > "$current_date" ]]; then
    echo "ERROR: Artifact date is in the future"
    exit 1
  fi
  ```
  - ❌ **FAIL**: Block artifact, report to governance
  - ✅ **PASS**: Continue validation

- [ ] **Verify Git Commit Date**: Git commit date must match filename date
  ```bash
  # Check git commit date
  git_date=$(git log -1 --format="%ad" --date=short -- "$ARTIFACT")
  if [[ "$git_date" != "$artifact_date" ]]; then
    echo "ERROR: Git date ($git_date) does not match filename date ($artifact_date)"
    exit 1
  fi
  ```
  - ❌ **FAIL**: Investigate, classify as poisoned or suspicious
  - ✅ **PASS**: Continue validation

- [ ] **Check Filesystem Timestamp**: Filesystem timestamp must be consistent
  ```bash
  # Check filesystem timestamp
  fs_timestamp=$(stat -f "%Sm" -t "%Y-%m-%d" "$ARTIFACT")
  if [[ "$fs_timestamp" != "$artifact_date" ]]; then
    echo "WARNING: Filesystem timestamp ($fs_timestamp) differs from filename"
    # Continue but flag for investigation
  fi
  ```
  - ❌ **FAIL**: Flag for investigation
  - ✅ **PASS**: Continue validation

#### 2. Content Validation

- [ ] **Verify YAML Frontmatter Dates**: All dates in frontmatter must be consistent
  ```bash
  # Extract YAML frontmatter dates
  created=$(grep "^created:" "$ARTIFACT" | cut -d: -f2 | xargs)
  updated=$(grep "^updated:" "$ARTIFACT" | cut -d: -f2 | xargs)
  
  # Check consistency
  if [[ "$created" != "$artifact_date" ]]; then
    echo "ERROR: Frontmatter date ($created) does not match filename"
    exit 1
  fi
  ```
  - ❌ **FAIL**: Block artifact
  - ✅ **PASS**: Continue validation

- [ ] **Check for References**: References to other artifacts must exist
  ```bash
  # Extract artifact references
  references=$(grep -oE '[a-z]+-[0-9]{3}' "$ARTIFACT" | sort -u)
  
  # Check if references exist
  for ref in $references; do
    if ! find _bmad-output -name "*$ref*" -quit; then
      echo "ERROR: Referenced artifact not found: $ref"
      exit 1
    fi
  done
  ```
  - ❌ **FAIL**: Block artifact (references non-existent)
  - ✅ **PASS**: Continue validation

- [ ] **Validate Content Consistency**: Content must match dates and references
  ```bash
  # Read content and verify consistency
  # (Implementation varies by artifact type)
  ```
  - ❌ **FAIL**: Flag for investigation
  - ✅ **PASS**: Artifact is valid

#### 3. Metadata Validation

- [ ] **Check Artifact ID**: Must have unique ID in frontmatter
  ```bash
  # Extract artifact ID
  artifact_id=$(grep "^artifact_id:" "$ARTIFACT" | cut -d: -f2 | xargs)
  
  if [[ -z "$artifact_id" ]]; then
    echo "ERROR: Missing artifact_id in frontmatter"
    exit 1
  fi
  ```
  - ❌ **FAIL**: Block artifact
  - ✅ **PASS**: Continue validation

- [ ] **Verify Artifact Type**: Must match expected type
  ```bash
  # Extract artifact type
  artifact_type=$(grep "^artifact_type:" "$ARTIFACT" | cut -d: -f2 | xargs)
  
  if [[ "$artifact_type" != "$EXPECTED_TYPE" ]]; then
    echo "ERROR: Artifact type ($artifact_type) does not match expected ($EXPECTED_TYPE)"
    exit 1
  fi
  ```
  - ❌ **FAIL**: Block artifact
  - ✅ **PASS**: Continue validation

- [ ] **Check Author/Source**: Must have valid author/source field
  ```bash
  # Extract author/source
  author=$(grep "^author:" "$ARTIFACT" | cut -d: -f2 | xargs)
  
  if [[ -z "$author" ]]; then
    echo "ERROR: Missing author in frontmatter"
    exit 1
  fi
  ```
  - ❌ **FAIL**: Flag for investigation
  - ✅ **PASS**: Artifact is valid

### TTL Rules

**Reference**: See `artifact-validation-protocol-2026-01-18.md` for complete TTL rules

| Tier | Name | TTL | Loading Rule |
|------|------|-----|-------------|
| 1 | Constitution | Permanent | Always load |
| 2 | Controlled | Permanent | On-demand |
| 3 | Archival | 90 days | If < 90 days |
| 4 | Ephemeral | 24 hours | If < 24h |

### Poisoned Artifact Blocking Logic

**Detection Rules**:
1. **100% Poisoned** (Block Immediately):
   - Date > current date
   - References non-existent artifacts

2. **Suspicious** (Investigate):
   - Missing metadata
   - Inconsistent dates
   - Git date != filename date

**Blocking Workflow**:
```
1. Agent detects poisoned artifact
2. Agent stops execution
3. Agent logs failure to _bmad-output/.error-log/
4. Agent reports to governance agent
5. Governance agent adds to blocklist
6. Agent awaits remediation or approval
```

### Required References

**Before consuming any artifact**:
1. Check `artifact-blocklist-2026-01-18.md` - Ensure artifact is not poisoned
2. Check `safe-artifacts-jan-17-18-2026-01-18.md` - Confirm artifact is validated
3. Check `artifact-validation-protocol-2026-01-18.md` - Follow validation checklist

**Never use artifacts**:
- Without proper metadata and references
- With dates > current date
- Without git history verification
- Referenced in blocklist

### Enforcement

**Mandatory for all agents**:
1. Complete validation checklist before consumption
2. Block execution on validation failure
3. Report validation results to governance
4. Follow remediation protocols

**Governance agent**:
1. Monitor compliance across all agents
2. Maintain blocklists and safe lists
3. Validate artifacts periodically
4. Report compliance metrics

### Reference Documents

- **Validation Protocol**: `artifact-validation-protocol-2026-01-18.md`
- **Artifact Blocklist**: `artifact-blocklist-2026-01-18.md`
- **Safe Artifacts**: `safe-artifacts-jan-17-18-2026-01-18.md`
- **BMAD Constitution**: `_bmad-ext/modules/governance/constitution.md`

---

## Pre-Execution Rules Update

**Add to "## 🚫 Non-Negotiable Rules" section**:

```markdown
### 8. Artifact Validation (Mandatory Pre-Consumption)

**Before consuming ANY artifact, complete validation checklist**:
- Check artifact age against TTL before consumption
- Never use artifacts without proper metadata and references
- Verify git commit date matches filename date
- Check for future dates (poisoned artifact indicator)
- Verify all referenced artifacts exist

**On validation failure**:
- Stop execution immediately
- Log failure to _bmad-output/.error-log/
- Report to governance agent
- Do not continue without remediation

**Reference**: `artifact-validation-protocol-2026-01-18.md`
```

---

## Governance Agent Workflow

### Artifact Authenticity Check

**Trigger**: Before any artifact consumption

**Workflow Steps**:

1. **Load Artifact Metadata**
   ```yaml
   input:
     - artifact_path: string
     - expected_type: string
   
   output:
     - is_valid: boolean
     - validation_errors: array
     - classification: "authentic" | "suspicious" | "poisoned"
   ```

2. **Run Validation Checklist**
   ```yaml
   steps:
     - check_date_not_future
     - verify_git_commit_date
     - validate_filesystem_timestamp
     - verify_yaml_frontmatter_dates
     - check_references_exist
     - validate_content_consistency
     - check_metadata_completeness
   ```

3. **Classify Artifact**
   ```yaml
   classification_rules:
     poisoned:
       - date > current_date
       - references_non_existent_artifacts
     suspicious:
       - missing_metadata
       - inconsistent_dates
       - git_date_mismatch
     authentic:
       - all_checks_pass
   ```

4. **Take Action**
   ```yaml
   if poisoned:
     - add_to_blocklist
     - move_to_archive
     - alert_governance_agent
     - block_consumption
   
   if suspicious:
     - investigate_further
     - check_git_history
     - flag_for_review
     - await_classification
   
   if authentic:
     - add_to_safe_list
     - allow_consumption
     - log_validation_success
   ```

5. **Report Results**
   ```yaml
   output:
     - validation_report: {
         artifact_path,
         validation_checks,
         classification,
         action_taken,
         timestamp
       }
     destination: _bmad-output/governance-reports/
   ```

### Borderline Case Handling

**Definition**: Artifacts that are neither clearly authentic nor clearly poisoned

**Workflow**:
1. Flag for human review
2. Document borderline characteristics
3. Provide recommendation (authentic / suspicious / poisoned)
4. Awaiting human decision
5. Execute based on human decision

### Automated Blocking Logic

**Implementation**: Governance agent script

```bash
#!/bin/bash
# Automated artifact blocking script

ARTIFACT=$1
CURRENT_DATE=$(date +%Y-%m-%d)

# Extract date from filename
ARTIFACT_DATE=$(echo $ARTIFACT | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}')

# Check if artifact date > current date
if [[ "$ARTIFACT_DATE" > "$CURRENT_DATE" ]]; then
  echo "ERROR: Artifact date $ARTIFACT_DATE is in the future"
  echo "Blocking artifact: $ARTIFACT"
  echo "$ARTIFACT" >> _bmad-output/governance-artifacts/blocklist.txt
  exit 1
fi

# Check if in blocklist
if grep -q "$ARTIFACT" _bmad-output/governance-artifacts/blocklist.txt; then
  echo "ERROR: Artifact is in blocklist"
  echo "Blocking artifact: $ARTIFACT"
  exit 1
fi

# Check git commit date
GIT_DATE=$(git log -1 --format="%ad" --date=short -- "$ARTIFACT")

if [[ "$GIT_DATE" != "$ARTIFACT_DATE" ]]; then
  echo "WARNING: Git date ($GIT_DATE) does not match filename date ($ARTIFACT_DATE)"
  echo "Flagging for investigation: $ARTIFACT"
  echo "$ARTIFACT" >> _bmad-output/governance-artifacts/suspicious.txt
fi

exit 0
```

---

## Automated Validation Script Proposal

### Pre-Commit Hook

**Location**: `.git/hooks/pre-commit`
**Purpose**: Block artifact creation if dates don't match

```bash
#!/bin/bash
# Pre-commit hook to validate artifact dates

echo "Running artifact validation..."

# Get staged markdown files
ARTIFACTS=$(git diff --cached --name-only --diff-filter=ACM | grep "\.md$")

CURRENT_DATE=$(date +%Y-%m-%d)

for ARTIFACT in $ARTIFACTS; do
  # Check if artifact is in _bmad-output
  if [[ "$ARTIFACT" != _bmad-output* ]]; then
    continue
  fi
  
  # Extract date from filename
  ARTIFACT_DATE=$(echo $ARTIFACT | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}')
  
  if [ -z "$ARTIFACT_DATE" ]; then
    continue
  fi
  
  # Check if artifact date > current date
  if [[ "$ARTIFACT_DATE" > "$CURRENT_DATE" ]]; then
    echo "ERROR: Artifact date $ARTIFACT_DATE is in the future"
    echo "Current date: $CURRENT_DATE"
    echo "Artifact: $ARTIFACT"
    echo ""
    echo "Please fix the date before committing"
    exit 1
  fi
  
  # Check git commit date (if artifact exists)
  if [ -f "$ARTIFACT" ]; then
    GIT_DATE=$(git log -1 --format="%ad" --date=short -- "$ARTIFACT" 2>/dev/null)
    
    if [ -n "$GIT_DATE" ] && [[ "$GIT_DATE" != "$ARTIFACT_DATE" ]]; then
      echo "WARNING: Git date ($GIT_DATE) does not match filename date ($ARTIFACT_DATE)"
      echo "Artifact: $ARTIFACT"
      echo ""
      echo "Consider renaming the artifact to match the git date"
      read -p "Continue anyway? (y/N): " confirm
      
      if [[ "$confirm" != "y" ]]; then
        exit 1
      fi
    fi
  fi
done

echo "Artifact validation passed"
exit 0
```

### Pre-Consumption Hook

**Location**: `_bmad-ext/hooks/pre-consumption.sh`
**Purpose**: Validate artifact before consumption by agents

```bash
#!/bin/bash
# Pre-consumption validation script

ARTIFACT=$1
CURRENT_DATE=$(date +%Y-%m-%d)

echo "Validating artifact: $ARTIFACT"

# Check if artifact exists
if [ ! -f "$ARTIFACT" ]; then
  echo "ERROR: Artifact does not exist: $ARTIFACT"
  exit 1
fi

# Extract date from filename
ARTIFACT_DATE=$(echo $ARTIFACT | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}')

if [ -z "$ARTIFACT_DATE" ]; then
  echo "WARNING: No date found in filename: $ARTIFACT"
  read -p "Continue anyway? (y/N): " confirm
  if [[ "$confirm" != "y" ]]; then
    exit 1
  fi
fi

# Check if artifact date > current date
if [[ "$ARTIFACT_DATE" > "$CURRENT_DATE" ]]; then
  echo "ERROR: Artifact date $ARTIFACT_DATE is in the future"
  echo "Current date: $CURRENT_DATE"
  echo "Artifact: $ARTIFACT"
  echo ""
  echo "Artifact is poisoned - blocking consumption"
  exit 1
fi

# Check if artifact is in blocklist
BLOCKLIST="_bmad-output/governance-artifacts/blocklist.txt"

if [ -f "$BLOCKLIST" ] && grep -q "$ARTIFACT" "$BLOCKLIST"; then
  echo "ERROR: Artifact is in blocklist: $ARTIFACT"
  echo ""
  echo "Artifact is poisoned - blocking consumption"
  exit 1
fi

# Check git commit date
GIT_DATE=$(git log -1 --format="%ad" --date=short -- "$ARTIFACT")

if [[ "$GIT_DATE" != "$ARTIFACT_DATE" ]]; then
  echo "WARNING: Git date ($GIT_DATE) does not match filename date ($ARTIFACT_DATE)"
  echo "Artifact: $ARTIFACT"
  echo ""
  echo "Artifact is suspicious - flagging for investigation"
  echo "$ARTIFACT" >> _bmad-output/governance-artifacts/suspicious.txt
  exit 1
fi

# Check for missing metadata
ARTIFACT_ID=$(grep "^artifact_id:" "$ARTIFACT" | cut -d: -f2 | xargs)
ARTIFACT_TYPE=$(grep "^artifact_type:" "$ARTIFACT" | cut -d: -f2 | xargs)
AUTHOR=$(grep "^author:" "$ARTIFACT" | cut -d: -f2 | xargs)

if [ -z "$ARTIFACT_ID" ] || [ -z "$ARTIFACT_TYPE" ] || [ -z "$AUTHOR" ]; then
  echo "WARNING: Missing metadata in artifact: $ARTIFACT"
  echo "Missing: artifact_id=$ARTIFACT_ID, artifact_type=$ARTIFACT_TYPE, author=$AUTHOR"
  echo ""
  echo "Artifact is suspicious - flagging for investigation"
  echo "$ARTIFACT" >> _bmad-output/governance-artifacts/suspicious.txt
  exit 1
fi

echo "Artifact validation passed"
echo "Artifact: $ARTIFACT"
echo "Date: $ARTIFACT_DATE"
echo "Git Date: $GIT_DATE"
echo "ID: $ARTIFACT_ID"
echo "Type: $ARTIFACT_TYPE"
echo "Author: $AUTHOR"
echo ""

exit 0
```

---

## Implementation Timeline

### Phase 1: Immediate (Day 0 - Today)

1. **Approve Governance Rules Update**
   - Review proposed changes to AGENTS.md
   - Approve new artifact validation section
   - Approve pre-execution rules update

2. **Update AGENTS.md**
   - Add artifact validation section
   - Update pre-execution rules
   - Add reference documents

3. **Create Automated Hooks**
   - Implement pre-commit hook
   - Implement pre-consumption hook
   - Test hooks with sample artifacts

### Phase 2: Short-term (Day 1-7)

1. **Train Agents**
   - Train all agents on validation protocol
   - Update agent behavior guidelines
   - Implement governance agent workflow

2. **Remediate Poisoned Artifacts**
   - Archive all 36 poisoned artifacts
   - Update references to corrected names
   - Document remediation progress

3. **Monitor Compliance**
   - Track validation success rate
   - Monitor agent compliance
   - Report metrics daily

### Phase 3: Long-term (Ongoing)

1. **Continuous Improvement**
   - Review validation protocol monthly
   - Update detection rules as needed
   - Train new agents on protocol

2. **Automated Validation**
   - Implement periodic artifact scans
   - Maintain blocklists and safe lists
   - Auto-flag suspicious artifacts

3. **Governance Enforcement**
   - Periodic compliance audits
   - Metrics tracking and reporting
   - Continuous protocol refinement

---

## Success Criteria

### Phase 1 Success
- ✅ AGENTS.md updated with artifact validation section
- ✅ Pre-commit hook implemented and tested
- ✅ Pre-consumption hook implemented and tested
- ✅ All agents aware of validation requirements

### Phase 2 Success
- ✅ 100% agent compliance with validation
- ✅ 36 poisoned artifacts remediated
- ✅ No future-date artifacts created
- ✅ Validation metrics tracking active

### Phase 3 Success
- ✅ Continuous validation in place
- ✅ Zero poisoned artifact consumption
- ✅ 100% validation success rate
- ✅ Governance enforcement effective

---

## Risk Assessment

### Implementation Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Agents ignore validation | High | Low | Enforce via governance agent |
| Hooks are not installed | Medium | Medium | Include in setup scripts |
| False positives (block safe artifacts) | Medium | Low | Add exception mechanism |
| False negatives (miss poisoned artifacts) | High | Low | Continuous improvement |

### Operational Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Slower artifact consumption | Low | High | Optimize validation speed |
| Increased agent complexity | Medium | Medium | Provide clear documentation |
| Human intervention required | Medium | Low | Automated validation |

---

## Reference Documents

- **Validation Protocol**: `artifact-validation-protocol-2026-01-18.md`
- **Artifact Blocklist**: `artifact-blocklist-2026-01-18.md`
- **Safe Artifacts**: `safe-artifacts-jan-17-18-2026-01-18.md`
- **AGENTS.md** (to be updated): Current governance rules
- **BMAD Constitution**: `_bmad-ext/modules/governance/constitution.md`

---

## Approval Required

**Required Approvals**:
- [ ] Governance Module Lead
- [ ] Technical Architect
- [ ] Product Manager
- [ ] Development Team Lead

**Approval Date**: 2026-01-18 (Required by end of day)

**Implementation Start**: 2026-01-19 (Immediately after approval)

**Status**: PENDING APPROVAL

---

**Version History**:
- v1.0.0 (2026-01-18): Initial proposal created

**Next Review**: After approval and implementation start

**Maintained By**: Governance Module (bmad-governance agent)

**Contact**: [Governance Module Contact]
