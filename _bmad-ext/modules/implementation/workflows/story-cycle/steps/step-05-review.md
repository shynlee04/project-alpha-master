---
nextStepFile: '{installed_path}/steps/step-06-done.md'
continueFile: '{installed_path}/steps/step-05b-continue.md'
outputFile: '{output_folder}/story-cycle-{story_key}-output.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
workflowName: 'story-cycle'
---

# Step 5: Review

## STEP GOAL

Code review and quality verification before marking story done.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Review all changes
- 📋 Verify quality standards
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Code Review Checklist

```yaml
code_review_checklist:
  correctness:
    - acceptance_criteria_met: true
    - no_obvious_bugs: true
    - edge_cases_handled: true

  quality:
    - follows_coding_standards: true
    - proper_import_patterns: true
    - error_handling_adequate: true
    - naming_consistent: true

  testing:
    - tests_comprehensive: true
    - edge_cases_tested: true
    - no_duplicate_tests: true

  documentation:
    - complex_code_commented: true
    - public_api_documented: true
```

### 2. Display Changes Summary

```
═══════════════════════════════════════════════════════════
CODE REVIEW
═══════════════════════════════════════════════════════════

Story: {story_key}

Files Changed: {count}
{list of files with change summary}

Lines Added: {count}
Lines Removed: {count}
Tests Added: {count}

Review Checklist:
[✅/❌] Acceptance criteria met
[✅/❌] No obvious bugs
[✅/❌] Edge cases handled
[✅/❌] Follows coding standards
[✅/❌] Proper import patterns
[✅/❌] Error handling adequate
[✅/❌] Tests comprehensive
[✅/❌] Complex code documented

Overall: {PASS → PROCEED | ISSUES FOUND}

Options:
[P] Proceed to done
[I] View issues found
[D] Detailed diff view
[R] Request fixes
```

### 3. Handle Issues

If issues found:
```yaml
issue_resolution:
  - issue: "{description}"
    severity: "{blocking|minor}"
    file: "{path}"
    action: "{fix|document|accept}"

  blocking_issues: "must fix before proceeding"
  minor_issues: "can accept with warning"
```

### 4. Handle User Choice

**P**: Review complete, no blocking issues → Step 6 (Done)
**I**: Show detailed issue list
**D**: Show full diff of changes
**R**: Request fixes before proceeding

### 5. Update Frontmatter

```yaml
---
stepsCompleted: [1, 2, 3, 4, 5]
review_complete: true
review_timestamp: "{timestamp}"
issues_found: {count}
blocking_issues: {count}
---
```

---

## SUCCESS METRICS

- ✅ All review items passed
- ✅ No blocking issues
- ✅ Changes verified
- ✅ Quality standards met

## FAILURE METRICS

- ❌ Blocking issues found
- ❌ Standards violations
- ❌ Missing acceptance criteria
- ❌ Inadequate tests

**ONLY WHEN review complete, load {nextStepFile}**
