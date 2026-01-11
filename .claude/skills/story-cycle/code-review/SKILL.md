---
name: code-review-enhanced
description: Code review for story implementation with ACTUAL CODE analysis, HTML output validation, journey walking, and EXTREME SKEPTICISM. Use when user says "code review", "review story", or after development completes. Multi-agent review with 100% evidence requirement.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: workflow
parent: story-cycle
children: []
priority: 62
agents:
  - code-reviewer
triggers:
  - code review
  - review story
  - review code
  - /code-review
  - enhanced code review
---

# Step 07: Code Review - Enhanced with Deep Analysis

**Purpose**: Multi-agent code review with ACTUAL CODE analysis, HTML output validation, journey walking, and requirements mapping. **EVIDENCE BEFORE ASSERTION** - be extremely skeptical.

## Critical Change (v2.0)

**OLD**: Read diff summary, check checklist.

**NEW**: Read actual files, walk through code paths, extract output, verify every claim with evidence.

## When to use

- After implementation completes
- User says "code review" or "review story"
- Before marking story done
- Quality checkpoint

## Instructions

### 1. Load All Context Files

```bash
# REQUIRED
READ: {sprint_artifacts}/{story_key}.md
READ: {sprint_artifacts}/{story_key}-context.xml
READ: {sprint_artifacts}/{story_key}-journey-map.mermaid
READ: {sprint_artifacts}/{story_key}-implementation-plan.md
```

### 2. Identify Changed Files with Evidence

```bash
# Get actual changed files
bash command: "git diff --name-only HEAD~1..HEAD | grep -E '\\.(ts|tsx|js|jsx)$'"

# For EACH changed file, read the ACTUAL content
for_each_file in {files}; do
  echo "=== READING: {file} ==="
  read file="{full_path}"
done
```

### 3. Acceptance Criteria Verification - WITH EVIDENCE

For each AC, walk through actual code and verify:

```yaml
ac_verification:
  AC-1:
    description: "{AC description}"
    
    # Step 1: Find implementation
    find_implementation:
      command: "grep -r '{keyword}' {files} | grep -v test"
      found_at:
        - file: "{path}"
          line: "{N}"
          code: "{actual code snippet}"
          
    # Step 2: Verify Given condition
    verify_given:
      condition: "{precondition}"
      evidence:
        file: "{path}"
        line: "{N}"
        code: "{code that verifies precondition}"
      status: "{PASS|FAIL}"
      
    # Step 3: Verify When action
    verify_when:
      action: "{action}"
      evidence:
        file: "{path}"
        line: "{N}"
        code: "{handler or action code}"
      status: "{PASS|FAIL}"
      
    # Step 4: Verify Then outcome
    verify_then:
      outcome: "{outcome}"
      evidence:
        file: "{path}"
        line: "{N}"
        code: "{result rendering or return}"
      status: "{PASS|FAIL}"
      
    # Step 5: Find test
    find_test:
      command: "grep -r '{AC-1.*test}|{test.*AC-1}' test/"
      test_file: "{path}"
      test_line: "{N}"
      test_code: "{assertion}"
      status: "{PASS|FAIL}"
      
    overall_status: "{PASS|FAIL}"
    evidence_summary: "{file}:{line}, {test_file}:{line}"
```

### 4. Code Path Walking - ACTUAL CODE VERIFICATION

```yaml
code_path_walking:
  for_each_acceptance_criterion:
    criterion: "{AC name}"
    
    # Walk the exact code path step by step
    path_walk:
      - step: "Entry Point"
        description: "Where does this AC start?"
        file: "{path}"
        line: "{N}"
        code: |
          ```{typescript}
          {actual code - 5-10 lines}
          ```
        verified: true/false
        notes: "{observations}"
        
      - step: "Data/State Update"
        description: "How is state updated?"
        file: "{path}"
        line: "{N}"
        code: |
          ```{typescript}
          {actual code - 5-10 lines}
          ```
        verified: true/false
        notes: "{observations}"
        
      - step: "Result Rendering"
        description: "How is result displayed?"
        file: "{path}"
        line: "{N}"
        code: |
          ```{typescript}
          {actual code - 5-10 lines}
          ```
        verified: true/false
        notes: "{observations}"
        
    # Check for dead code in path
    dead_code_check:
      command: "grep -n 'return.*early\|if.*false' {file}"
      dead_code_found: true/false
      location: "{line}"
      
    path_complete: true/false
    path_blockers: [{list}]
```

### 5. HTML/UI Output Validation

```yaml
html_output_validation:
  # For UI components, extract actual rendered output
  # If running in browser, use chrome-devtools
  
  component_output:
    - component: "{ComponentName}"
      file: "{path}"
      
      # Check initial state
      initial_state:
        command: "READ {file} | grep -A20 'const.*initial'"
        html_snippet: |
          {actual JSX code}
        valid: true/false
        issues: "{list or 'None'}"
        
      # Check loading state
      loading_state:
        command: "READ {file} | grep -A10 'loading'"
        html_snippet: |
          {actual JSX code}
        valid: true/false
        issues: "{list or 'None'}"
        
      # Check error state
      error_state:
        command: "READ {file} | grep -A10 'error'"
        html_snippet: |
          {actual JSX code}
        valid: true/false
        issues: "{MISSING if not found}"
        
      # Check success state
      success_state:
        command: "READ {file} | grep -A10 'success\|result'"
        html_snippet: |
          {actual JSX code}
        valid: true/false
        issues: "{list or 'None'}"
        
  # Check for visual breaks
  visual_breaks:
    - check: "Unclosed tags"
      command: "grep -c '<' {file} | grep -c '>' {file}"
      balanced: true/false
      
    - check: "Missing classes"
      command: "grep -E 'className=\"[^\"]+\"' {file} | wc -l"
      all_defined: true/false
      
    - check: "8-bit styling"
      command: "grep 'border-radius' {file}"
      compliant: true/false
      value: "0 or 2px"
```

### 6. Journey Walking - Actual User Flow Test

```yaml
journey_walking:
  # Use the journey map from Step 1a
  journey_map: "{story}-journey-map.mermaid"
  
  # Walk through each step with actual code
  journey_steps:
    - step: "User starts at {screen}"
      route_file: "{path}/route.ts"
      route_defined:
        command: "grep '{route_path}' {file}"
        exists: true/false
      component_renders:
        command: "READ {component_file} | head -30"
        renders: true/false
        
    - step: "User performs {action}"
      handler_file: "{path}/{Component}.tsx"
      handler_exists:
        command: "grep 'onClick.*={action}\|handle{Action}' {file}"
        exists: true/false
      event_bound:
        command: "grep -n 'onClick' {file} | grep -c 'handle'"
        bound: true/false
        
    - step: "System shows {feedback}"
      state_update:
        command: "grep -n 'setState\|dispatch' {file} | head -5"
        updates_state: true/false
      ui_feedback:
        command: "grep -n 'Loading\|Spinner' {file}"
        has_feedback: true/false
        
    - step: "User sees {result}"
      result_visible:
        command: "grep -n '{result_keyword}' {file}"
        visible: true/false
      result_location:
        line: "{N}"
        
    - step: "User can {next action}"
      next_handler:
        command: "grep 'handle{NextAction}' {file}"
        exists: true/false
      context_preserved:
        command: "grep -n 'useContext\|useStore' {file} | wc -l"
        uses_context: true/false
        
  # Verify journey is coherent
  journey_coherent: true/false
  journey_blockers: [{list}]
  journey_improvements: [{list}]
```

### 7. Requirements Mapping - Trace Every Requirement

```yaml
requirements_mapping:
  # From story file
  requirements:
    - req: "{from story requirements section}"
      implemented: true/false
      code_location:
        - file: "{path}"
          line: "{N}"
          snippet: "{code}"
      test_location:
        file: "{path}"
        line: "{N}"
      verified: true/false
      
  # Check all requirements are covered
  coverage_check:
    total_requirements: {count}
    implemented: {count}
    missing: [{list}]
    extra_implementations: [{list}]
    
  # Verify no scope creep
  scope_creep_check:
    extra_code: [{list of code not in requirements}]
    rationale: "{why this code exists}"
    necessary: true/false
```

### 8. Comprehensive Code Quality Checklist - WITH EVIDENCE

```yaml
code_quality_checklist:
  correctness:
    - check: "Acceptance criteria fully met"
      evidence: "AC verification above - 5/5 passed"
      status: "PASS|FAIL"
      
    - check: "No obvious bugs"
      evidence: "Code walk found no null checks missing"
      status: "PASS|FAIL"
      bugs_found:
        - file: "{path}"
          line: "{N}"
          issue: "{description}"
          
    - check: "Edge cases handled"
      evidence: "Empty, loading, error states all present"
      status: "PASS|FAIL"
      edge_cases_handled: [{list}]
      edge_cases_missing: [{list}]
      
  quality:
    - check: "Follows coding standards"
      evidence: "Import order correct, naming consistent"
      status: "PASS|FAIL"
      violations: [{list}]
      
    - check: "Proper import patterns"
      evidence: "No relative imports > 3 levels"
      status: "PASS|FAIL"
      violations: [{list}]
      
    - check: "Error handling adequate"
      evidence: "try/catch, error boundaries present"
      status: "PASS|FAIL"
      gaps: [{list}]
      
    - check: "Naming consistent"
      evidence: "camelCase vars, PascalCase components"
      status: "PASS|FAIL"
      
  architecture:
    - check: "Clean architecture compliance"
      evidence: "No cross-layer imports found"
      status: "PASS|FAIL"
      violations: [{file}:{line}]
      
    - check: "No circular dependencies"
      evidence: "git diff shows clean import graph"
      status: "PASS|FAIL"
      
    - check: "Component size ≤300 lines"
      evidence: "wc -l {file} = {N} lines"
      status: "PASS|FAIL"
      size: "{N} lines"
      
    - check: "Store size ≤120 lines"
      evidence: "wc -l {file} = {N} lines"
      status: "PASS|FAIL"
      size: "{N} lines"
      
  testing:
    - check: "Tests comprehensive"
      evidence: "{N} tests, {percentage}% coverage"
      status: "PASS|FAIL"
      
    - check: "Edge cases tested"
      evidence: "Tests for empty, error, loading states"
      status: "PASS|FAIL"
      
    - check: "No duplicate tests"
      evidence: "Test file analysis"
      status: "PASS|FAIL}"
```

### 9. Generate Comprehensive Review Report

Add to story file:
```markdown
## Code Review Report

**Reviewed At:** {timestamp}
**Reviewer:** {agent}
**Status:** PASS/CHANGES REQUESTED/REJECTED

### Files Reviewed
| File | Type | Lines | Review Status |
|------|------|-------|---------------|
| {path} | create | {N} | ✅ PASS |
| {path} | modify | +{N}/-{M} | ✅ PASS |

### Acceptance Criteria Verification
| AC | Status | Evidence |
|----|--------|----------|
| AC-1 | ✅ PASS | {file}:{line}, {test}:{line} |
| AC-2 | ✅ PASS | {file}:{line}, {test}:{line} |
| AC-3 | ❌ FAIL | Missing implementation |

### Code Path Walking
| Path | Complete | Dead Code | Blockers |
|------|----------|-----------|----------|
| AC-1 | ✅ YES | NONE | NONE |
| AC-2 | ✅ YES | NONE | NONE |
| AC-3 | ❌ NO | INCOMPLETE | Missing handler |

### HTML/UI Output Validation
| State | Exists | Valid | Issues |
|-------|--------|-------|--------|
| Initial | ✅ | ✅ | None |
| Loading | ✅ | ✅ | None |
| Error | ❌ | ❌ | NOT IMPLEMENTED |
| Success | ✅ | ✅ | None |

### Journey Walking
- Journey Complete: ✅ YES / ❌ NO
- Journey Blockers: {list}
- Context Preserved: ✅ YES / ❌ NO

### Requirements Mapping
- Total Requirements: {N}
- Covered: {N}
- Missing: {list}
- Scope Creep: {NONE / list}

### Code Quality Scores
| Category | Score | Notes |
|----------|-------|-------|
| Correctness | 4/5 | AC-3 missing |
| Quality | 5/5 | Standards followed |
| Architecture | 5/5 | Clean |
| Testing | 4/5 | Missing edge cases |
| **OVERALL** | **4.5/5** | **APPROVED WITH NOTES** |

### Issues Found
1. **BLOCKING**: AC-3 not implemented at {file}:{line}
2. **MAJOR**: Error state missing in {Component}
3. **MINOR**: Unused import at {file}:{line}

### Required Actions (Before Approval)
1. Implement AC-3 at {file}:{line}
2. Add error state to {Component}

### Strengths
- Clean architecture compliance
- Proper component separation
- Good error handling (except error state)

---

**Review Result**: CHANGES REQUESTED
```

### 10. Handle Review Outcome

**P**: 100% critical checks pass → Approve, proceed to story-done
**R**: Blocking issues found → Request fixes, return to dev-story
**D**: Show detailed diff with inline comments

## Validation (100% Pass Required for Critical Items)

- [ ] **All files read** (not just diffs) - evidence: file:line references
- [ ] **Code paths walked** for every AC - evidence: path walk documentation
- [ ] **HTML output validated** - evidence: state validation table
- [ ] **Journey walked** - evidence: step-by-step verification
- [ ] **Requirements mapped** - evidence: coverage table
- [ ] **No critical issues** - blocking issues must be zero

## v2.0 Improvements

| Aspect | v1.0 | v2.0 Enhanced |
|--------|------|---------------|
| File Analysis | Diff summary only | Full file reads |
| Path Walking | None | Step-by-step code trace |
| HTML Validation | None | State-by-state output check |
| Journey Walking | None | Actual user flow test |
| Skepticism | Assumed correct | Verified with evidence |
| Evidence | Minimal | File:line references |

## Be Extremely Skeptical

**For every claim:**
1. "Does this code actually exist?" → Verify with grep
2. "Does this path work?" → Walk through it
3. "Is this output correct?" → Extract and validate
4. "Does this requirement map?" → Trace to code

**Evidence before assertion. Always.**

---

**Source**: `_bmad-ext/modules/implementation/workflows/story-cycle/steps/step-05-review.md`
**Version**: 2.0.0
**Last Updated**: 2026-01-12
