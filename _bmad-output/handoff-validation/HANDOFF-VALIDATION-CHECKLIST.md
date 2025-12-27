# Handoff Validation Checklist Template
# Generated: 2025-12-26
# Purpose: Validate handoff documents before they are created and accepted

---
## Document Metadata

**Story ID**: {STORY-ID}
**Story Name**: {STORY-NAME}
**Epic ID**: {EPIC-ID}
**Validation Date**: {YYYY-MM-DD}
**Validator**: {VALIDATOR-NAME}
**Artifact ID**: HANDOFF-VALIDATION-{STORY-ID}-{TIMESTAMP}

---

## Pre-Handoff Validation

### 1. Story Dependency Check
- [ ] **Previous story is DONE**: Verify that the previous story in the sequence is marked as "done"
  - Previous Story ID: {PREVIOUS-STORY-ID}
  - Previous Story Status: {PREVIOUS-STORY-STATUS}
  - Evidence: {Link to previous story completion}

- [ ] **Story prerequisites met**: All dependencies and prerequisites are satisfied
  - Prerequisite 1: {Description} - Status: {Met/Not Met}
  - Prerequisite 2: {Description} - Status: {Met/Not Met}

### 2. Acceptance Criteria Verification
- [ ] **All acceptance criteria implemented**: Verify that all acceptance criteria from the story specification are met
  - AC-1: {Description} - Status: {Implemented/Not Implemented}
  - AC-2: {Description} - Status: {Implemented/Not Implemented}
  - AC-3: {Description} - Status: {Implemented/Not Implemented}

- [ ] **Acceptance criteria tested**: All acceptance criteria have been tested
  - Test 1: {Description} - Status: {Passed/Failed}
  - Test 2: {Description} - Status: {Passed/Failed}
  - Test 3: {Description} - Status: {Passed/Failed}

### 3. E2E Verification Check
- [ ] **E2E verification completed**: Browser end-to-end testing has been performed
  - Verification Date: {YYYY-MM-DD}
  - Browser: {Chrome/Firefox/Safari/Edge}
  - Test Environment: {Local/Dev/Production}

- [ ] **E2E evidence captured**: Screenshot or recording of working feature is available
  - Evidence Location: `_bmad-output/e2e-verification/{STORY-ID}/`
  - Screenshot/Recording File: {Filename}
  - Evidence Type: {Screenshot/Recording}

- [ ] **E2E checklist completed**: E2E verification checklist has been filled out
  - Checklist Location: `_bmad-output/e2e-verification/{STORY-ID}/VERIFICATION-{TIMESTAMP}.md`

### 4. MCP Research Check
- [ ] **MCP research completed**: MCP research protocol has been followed for unfamiliar patterns
  - Research Document: `_bmad-output/mcp-research/MCP-RESEARCH-{STORY-ID}-{TIMESTAMP}.md`
  - Context7: {Completed/Not Applicable}
  - Deepwiki: {Completed/Not Applicable}
  - Tavily/Exa: {Completed/Not Applicable}
  - Repomix: {Completed/Not Applicable}

- [ ] **MCP research documented**: Research findings are documented in handoff
  - Research Summary Section: {Present in handoff document}

### 5. Code Quality Check
- [ ] **Code follows project conventions**: Code follows the project's coding standards and conventions
  - Import order: {Compliant/Non-compliant}
  - Naming conventions: {Compliant/Non-compliant}
  - File structure: {Compliant/Non-compliant}

- [ ] **No breaking changes**: No breaking changes to existing functionality
  - Breaking Changes: {None/Describe}

- [ ] **Tests added/updated**: Tests have been added or updated
  - Test Files Added: {List}
  - Test Files Updated: {List}
  - Test Coverage: {Percentage/Not Measured}

### 6. Documentation Check
- [ ] **Story documentation updated**: Story documentation reflects implementation status
  - Story File: {Path}
  - Status Updated: {Yes/No}

- [ ] **Code artifacts created**: Code artifacts with date-time stamps are created
  - Artifact 1: {Path}
  - Artifact 2: {Path}

- [ ] **Handoff document complete**: Handoff document contains all required sections
  - Story Details: {Present}
  - Task: {Present}
  - Context Files: {Present}
  - Implementation Summary: {Present}
  - Changes Made: {Present}
  - Acceptance Criteria Verification: {Present}
  - Test Results: {Present}
  - Code Review Checklist: {Present}
  - Next Steps: {Present}
  - Handoff Protocol: {Present}

---

## Handoff Document Validation

### 7. Handoff Document Structure
- [ ] **Story Details section**: Contains epic, story, status, priority, platform
- [ ] **Task section**: Clear description of what needs to be reviewed
- [ ] **Context Files section**: Links to all relevant context files
- [ ] **Implementation Summary section**: Summary of what was implemented
- [ ] **Changes Made section**: List of all changes made
- [ ] **Acceptance Criteria Verification section**: Checklist of acceptance criteria with status
- [ ] **Test Results section**: Summary of test results
- [ ] **Code Review Checklist section**: Checklist for code reviewer
- [ ] **Next Steps section**: Clear next steps after approval
- [ ] **Handoff Protocol section**: Instructions for handoff process

### 8. Handoff Document Content
- [ ] **Accurate status**: Story status accurately reflects current state
- [ ] **Complete changes**: All changes made are documented
- [ ] **Clear context**: Sufficient context provided for reviewer
- [ ] **Test results**: Test results are accurate and comprehensive
- [ ] **Next steps clear**: Next steps are clear and actionable

---

## Governance Document Validation

### 9. Sprint Status Validation
- [ ] **Sprint status updated**: Story status in sprint-status-consolidated.yaml is accurate
  - Story Status: {Current Status}
  - Last Updated: {Timestamp}

- [ ] **No status conflicts**: No conflicts between sprint-status-consolidated.yaml and bmm-workflow-status-consolidated.yaml
  - Status Consistency: {Consistent/Inconsistent}
  - If Inconsistent: {Describe discrepancy}

### 10. Workflow Status Validation
- [ ] **Workflow status updated**: Workflow status in bmm-workflow-status-consolidated.yaml is accurate
  - Current Story: {STORY-ID}
  - Workflow Status: {Current Status}
  - Last Updated: {Timestamp}

---

## Validation Results

### Validation Summary
**Overall Validation Status**: [ ] PASSED [ ] FAILED [ ] REVISION REQUESTED

### Validation Issues
1. **Issue**: {Description}
   - **Severity**: {Critical/High/Medium/Low}
   - **Required Action**: {What needs to be fixed}

2. **Issue**: {Description}
   - **Severity**: {Critical/High/Medium/Low}
   - **Required Action**: {What needs to be fixed}

3. **Issue**: {Description}
   - **Severity**: {Critical/High/Medium/Low}
   - **Required Action**: {What needs to be fixed}

### Validation Approval
- [ ] **All validation checks passed**: All critical and high-severity issues are resolved
- [ ] **Handoff document approved**: Handoff document is approved for review
- [ ] **Governance documents updated**: Sprint status and workflow status are updated

---

## Approval

**Validator Signature**: {VALIDATOR-NAME}
**Date**: {YYYY-MM-DD}

**Reviewer Signature**: {REVIEWER-NAME}
**Date**: {YYYY-MM-DD}

**Status**: [ ] APPROVED [ ] REVISION REQUESTED [ ] REJECTED

---

## Artifact References

- Handoff Document: `_bmad-output/handoffs/dev-to-reviewer-{STORY-ID}-{TIMESTAMP}.md`
- Validation Checklist: `_bmad-output/handoff-validation/HANDOFF-VALIDATION-{STORY-ID}-{TIMESTAMP}.md`
- E2E Verification: `_bmad-output/e2e-verification/{STORY-ID}/`
- MCP Research: `_bmad-output/mcp-research/MCP-RESEARCH-{STORY-ID}-{TIMESTAMP}.md`
- Sprint Status: `_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`
- Workflow Status: `_bmad-output/bmm-workflow-status-consolidated.yaml`

---

## Notes

### Additional Context
- {Any additional context that doesn't fit elsewhere}

### Validation Questions
- {List of questions to ask during validation}

### Decisions Made
- **Decision 1**: {Description} - Rationale: {Why}
- **Decision 2**: {Description} - Rationale: {Why}

---

**End of Handoff Validation Checklist**
