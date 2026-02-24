#!/bin/bash
# Governance Compliance Audit Script
# Runs daily to check compliance across the BMAD framework
# Part of GOV-ENFORCE-001 Protocol

set -euo pipefail

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
OUTPUT_DIR="${PROJECT_ROOT}/_bmad-output/governance/audits"
LOG_FILE="${OUTPUT_DIR}/audit-$(date +%Y-%m-%d).log"
REPORT_FILE="${OUTPUT_DIR}/report-$(date +%Y-%m-%d).md"

# Ensure output directory exists
mkdir -p "${OUTPUT_DIR}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ISSUES_P0=0
ISSUES_P1=0
ISSUES_P2=0

echo "════════════════════════════════════════════════════════════" | tee -a "${LOG_FILE}"
echo "🔍 GOVERNANCE COMPLIANCE AUDIT" | tee -a "${LOG_FILE}"
echo "════════════════════════════════════════════════════════════" | tee -a "${LOG_FILE}"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)" | tee -a "${LOG_FILE}"
echo "Audit ID: GOV-AUDIT-$(date +%Y%m%d-%H%M%S)" | tee -a "${LOG_FILE}"
echo "" | tee -a "${LOG_FILE}"

# Start report
cat > "${REPORT_FILE}" << EOF
# Governance Compliance Audit Report

**Date**: $(date +%Y-%m-%d)
**Audit ID**: GOV-AUDIT-$(date +%Y%m%d-%H%M%S)
**Auditor**: Governance Module

## Summary

| Category | Status | Issues Found |
|----------|--------|--------------|
EOF

# 1. Check for missing frontmatter in handoffs
echo "1. Checking for missing frontmatter in handoffs..." | tee -a "${LOG_FILE}"
cd "${PROJECT_ROOT}"
HANDOFF_FILES=$(find _bmad-output/handoffs -name "*.md" -type f 2>/dev/null || true)
MISSING_FRONTMATTER=""

if [[ -n "$HANDOFF_FILES" ]]; then
    while IFS= read -r file; do
        if ! head -1 "$file" | grep -q "^---$"; then
            MISSING_FRONTMATTER="${MISSING_FRONTMATTER}${file}"$'\n'
            ((ISSUES_P0++))
        fi
    done <<< "$HANDOFF_FILES"
fi

if [[ -n "$MISSING_FRONTMATTER" ]]; then
    echo -e "   ${RED}❌ Files missing frontmatter:${NC}" | tee -a "${LOG_FILE}"
    echo "$MISSING_FRONTMATTER" | sed 's/^/      /' | tee -a "${LOG_FILE}"
    FRONTMATTER_STATUS="❌ ${ISSUES_P0} issues"
else
    echo -e "   ${GREEN}✅ All artifacts have frontmatter${NC}" | tee -a "${LOG_FILE}"
    FRONTMATTER_STATUS="✅ Pass"
fi
echo "" | tee -a "${LOG_FILE}"

# 2. Check naming convention
echo "2. Checking naming convention..." | tee -a "${LOG_FILE}"
# Valid patterns: PREFIX-DOMAIN-SEQ (like WF-BMM-001) or ID- prefix (like GOV-AUDIT-001)
INVALID_NAMES=$(find _bmad-output/handoffs -name "*.md" -type f 2>/dev/null | \
    grep -vE "(HANDOFF-[0-9]+-[0-9]+|[A-Z]+-[A-Z]+-[0-9]+|[A-Z][0-9]+-)" | head -10 || true)

if [[ -n "$INVALID_NAMES" ]]; then
    echo -e "   ${YELLOW}⚠️  Files not following naming convention:${NC}" | tee -a "${LOG_FILE}"
    echo "$INVALID_NAMES" | sed 's/^/      /' | tee -a "${LOG_FILE}"
    ((ISSUES_P1 += $(echo "$INVALID_NAMES" | wc -l)))
    NAMING_STATUS="⚠️ ${ISSUES_P1} issues"
else
    echo -e "   ${GREEN}✅ All artifacts follow naming convention${NC}" | tee -a "${LOG_FILE}"
    NAMING_STATUS="✅ Pass"
fi
echo "" | tee -a "${LOG_FILE}"

# 3. Check for stale artifacts (>24h)
echo "3. Checking for stale artifacts (>24h)..." | tee -a "${LOG_FILE}"
STALE_ARTIFACTS=$(find _bmad-output/handoffs -name "*.md" -type f -mtime +1 2>/dev/null || true)
STALE_COUNT=$(echo "$STALE_ARTIFACTS" | grep -c . || true)

if [[ $STALE_COUNT -gt 0 ]]; then
    echo -e "   ${YELLOW}⚠️  Stale artifacts found: ${STALE_COUNT}${NC}" | tee -a "${LOG_FILE}"
    echo "$STALE_ARTIFACTS" | head -5 | sed 's/^/      /' | tee -a "${LOG_FILE}"
    if [[ $STALE_COUNT -gt 5 ]]; then
        echo "      ... and $((STALE_COUNT - 5)) more" | tee -a "${LOG_FILE}"
    fi
    echo "   → Should trigger context recovery on next access" | tee -a "${LOG_FILE}"
    STALE_STATUS="⚠️ ${STALE_COUNT} stale"
    ((ISSUES_P2 += STALE_COUNT))
else
    echo -e "   ${GREEN}✅ No stale artifacts${NC}" | tee -a "${LOG_FILE}"
    STALE_STATUS="✅ Pass"
fi
echo "" | tee -a "${LOG_FILE}"

# 4. Check agent compliance
echo "4. Checking agent governance acknowledgment..." | tee -a "${LOG_FILE}"
AGENTS_WITHOUT=$(find _bmad -path "*/agents/*.md" -type f -exec grep -L "governance:" {} \; 2>/dev/null | head -10 || true)
AGENT_COUNT=$(echo "$AGENTS_WITHOUT" | grep -c . || true)

if [[ $AGENT_COUNT -gt 0 ]]; then
    echo -e "   ${YELLOW}⚠️  Agents missing governance acknowledgment: ${AGENT_COUNT}${NC}" | tee -a "${LOG_FILE}"
    echo "$AGENTS_WITHOUT" | sed 's|^|      |' | tee -a "${LOG_FILE}"
    AGENT_STATUS="⚠️ ${AGENT_COUNT} missing"
    ((ISSUES_P1 += AGENT_COUNT))
else
    echo -e "   ${GREEN}✅ All agents have governance acknowledgment${NC}" | tee -a "${LOG_FILE}"
    AGENT_STATUS="✅ Pass"
fi
echo "" | tee -a "${LOG_FILE}"

# 5. Check workflow frontmatter
echo "5. Checking workflow frontmatter..." | tee -a "${LOG_FILE}"
WORKFLOWS_WITHOUT=$(find _bmad -name "workflow.md" -type f ! -path "*/docs/*" ! -path "*/reference/*" ! -path "*/data/*" -exec grep -L "workflow_id:" {} \; 2>/dev/null || true)
WORKFLOW_COUNT=$(echo "$WORKFLOWS_WITHOUT" | grep -c . || true)

if [[ $WORKFLOW_COUNT -gt 0 ]]; then
    echo -e "   ${YELLOW}⚠️  Workflows missing governance frontmatter: ${WORKFLOW_COUNT}${NC}" | tee -a "${LOG_FILE}"
    echo "$WORKFLOWS_WITHOUT" | sed 's|^|      |' | tee -a "${LOG_FILE}"
    WORKFLOW_STATUS="⚠️ ${WORKFLOW_COUNT} missing"
    ((ISSUES_P1 += WORKFLOW_COUNT))
else
    echo -e "   ${GREEN}✅ All workflows have governance frontmatter${NC}" | tee -a "${LOG_FILE}"
    WORKFLOW_STATUS="✅ Pass"
fi
echo "" | tee -a "${LOG_FILE}"

# 6. Check for unorganized artifacts
echo "6. Checking for unorganized artifacts..." | tee -a "${LOG_FILE}"
UNORGANIZED=$(find _bmad-output/artifacts -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l)

if [[ $UNORGANIZED -gt 0 ]]; then
    echo -e "   ${YELLOW}⚠️  Found ${UNORGANIZED} artifacts in root (should be in daily folders)${NC}" | tee -a "${LOG_FILE}"
    ORGANIZED_STATUS="⚠️ ${UNORGANIZED} unorganized"
    ((ISSUES_P2 += UNORGANIZED))
else
    echo -e "   ${GREEN}✅ All artifacts properly organized${NC}" | tee -a "${LOG_FILE}"
    ORGANIZED_STATUS="✅ Pass"
fi
echo "" | tee -a "${LOG_FILE}"

# Final summary
echo "════════════════════════════════════════════════════════════" | tee -a "${LOG_FILE}"
echo "AUDIT SUMMARY" | tee -a "${LOG_FILE}"
echo "════════════════════════════════════════════════════════════" | tee -a "${LOG_FILE}"
echo "P0 (Critical):    ${ISSUES_P0}" | tee -a "${LOG_FILE}"
echo "P1 (Warning):     ${ISSUES_P1}" | tee -a "${LOG_FILE}"
echo "P2 (Advisory):    ${ISSUES_P2}" | tee -a "${LOG_FILE}"
echo "Total Issues:     $((ISSUES_P0 + ISSUES_P1 + ISSUES_P2))" | tee -a "${LOG_FILE}"
echo "" | tee -a "${LOG_FILE}"

# Complete the report
cat >> "${REPORT_FILE}" << EOF
| Frontmatter Compliance | ${FRONTMATTER_STATUS} | ${ISSUES_P0} |
| Naming Convention | ${NAMING_STATUS} | ${ISSUES_P1} |
| Stale Artifacts | ${STALE_STATUS} | ${ISSUES_P2} |
| Agent Acknowledgment | ${AGENT_STATUS} | ${ISSUES_P1} |
| Workflow Frontmatter | ${WORKFLOW_STATUS} | ${ISSUES_P1} |
| Artifact Organization | ${ORGANIZED_STATUS} | ${ISSUES_P2} |

## Issues Requiring Attention

EOF

if [[ $ISSUES_P0 -gt 0 ]]; then
    echo "### P0 - Critical" >> "${REPORT_FILE}"
    if [[ -n "$MISSING_FRONTMATTER" ]]; then
        echo "1. Artifacts missing frontmatter" >> "${REPORT_FILE}"
        echo "   - Action Required: Add frontmatter to all listed artifacts" >> "${REPORT_FILE}"
        echo "" >> "${REPORT_FILE}"
    fi
fi

if [[ $ISSUES_P1 -gt 0 ]]; then
    echo "### P1 - Warning" >> "${REPORT_FILE}"
    [[ -n "$INVALID_NAMES" ]] && echo "1. Files not following naming convention" >> "${REPORT_FILE}"
    [[ $AGENT_COUNT -gt 0 ]] && echo "1. Agents missing governance acknowledgment" >> "${REPORT_FILE}"
    [[ $WORKFLOW_COUNT -gt 0 ]] && echo "1. Workflows missing governance frontmatter" >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"
fi

if [[ $ISSUES_P2 -gt 0 ]]; then
    echo "### P2 - Advisory" >> "${REPORT_FILE}"
    echo "1. Stale artifacts detected (should trigger context recovery)" >> "${REPORT_FILE}"
    [[ $UNORGANIZED -gt 0 ]] && echo "1. Unorganized artifacts in root folder" >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"
fi

cat >> "${REPORT_FILE}" << EOF
## Recommendations

1. Review P0 issues immediately as they block execution
2. Address P1 warnings within 24 hours
3. P2 advisories should be cleaned up during next maintenance window

---
**Report Generated**: $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Next Audit**: $(date -v+1d +%Y-%m-%d) 00:00
EOF

echo "Report saved to: ${REPORT_FILE}" | tee -a "${LOG_FILE}"
echo "Log saved to: ${LOG_FILE}" | tee -a "${LOG_FILE}"
echo "" | tee -a "${LOG_FILE}"
echo "════════════════════════════════════════════════════════════" | tee -a "${LOG_FILE}"
echo "Audit complete." | tee -a "${LOG_FILE}"
echo "════════════════════════════════════════════════════════════" | tee -a "${LOG_FILE}"

# Exit with appropriate code
if [[ $ISSUES_P0 -gt 0 ]]; then
    exit 1
elif [[ $ISSUES_P1 -gt 0 ]]; then
    exit 2
else
    exit 0
fi
