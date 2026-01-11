---
nextStepFile: '{installed_path}/steps/step-06-done.md'
continueFile: '{installed_path}/steps/step-05b-continue.md'
outputFile: '{output_folder}/story-cycle-{story_key}-output.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
workflowName: 'story-cycle'
---

# Step 5: Code Review - Deep Real-Code Analysis

## STEP GOAL

Code review with ACTUAL CODE analysis, not just assumptions:
- Walk through actual code paths and verify they work
- Extract and validate HTML output
- Map requirements to actual implementation
- Be EXTREMELY SKEPTICAL - verify everything with evidence
- 100% pass required - evidence before assertion

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Read actual changed files (not just diff summaries)
- 📋 Walk through actual code paths
- 🔄 Extract and validate output (HTML/JSON)
- 🔍 BE SKEPTICAL - verify everything with evidence

## SEQUENCE OF INSTRUCTIONS

### 1. Load All Context Files

```bash
READ: {story_file}
READ: {story_context_xml}
READ: {journey_map_mermaid}
READ: {implementation_plan_from_preplanning}
```

### 2. Identify Changed Files with Evidence

```yaml
changed_files_analysis:
  command: "git diff --name-only HEAD~1..HEAD | grep -E '\\.(ts|tsx|js|jsx)$'"
  files:
    - path: "{file}"
      type: "create|modify|delete"
      lines_added: {count}
      lines_removed: {count}
      
  # For each file, read the actual content
  for_each_file:
    - READ: {full_path}
    - Extract: Key functions/components
    - Verify: Implementation matches plan
```

### 3. Acceptance Criteria Verification - WITH EVIDENCE

For each AC, walk through actual code:

```yaml
ac_verification:
  AC-1:
    description: "{AC description}"
    evidence_required:
      - "File where implemented: {file}:{line}"
      - "Test that verifies: {test_file}:{line}"
      - "User journey step: {from journey-map}"
      
    verification_steps:
      1. "READ: {file} | grep -A10 'function.*{implementation}'"
      2. "Trace: Given → When → Then"
         - Given: {condition} verified at {file}:{line}
         - When: {action} at {file}:{line}
         - Then: {result} at {file}:{line}
      3. "READ: {test_file} | grep -A5 '{test_name}'"
         - Test exists: true/false
         - Test passes: true/false (run it)
         
    status: "{PASS|FAIL|BLOCKING}"
    evidence: "{file}:{line}, {test_file}:{line}"
```

### 4. Code Path Walking - ACTUAL CODE VERIFICATION

```yaml
code_path_walking:
  for_each_acceptance_criterion:
    criterion: "{AC name}"
    
    # Walk the exact code path
    path_walk:
      - step: "Entry point"
        file: "{file}"
        line: "{N}"
        code: "{actual code snippet}"
        verified: true/false
        
      - step: "Data/State update"
        file: "{file}"
        line: "{N}"
        code: "{actual code snippet}"
        verified: true/false
        
      - step: "UI/Result rendering"
        file: "{file}"
        line: "{N}"
        code: "{actual code snippet}"
        verified: true/false
        
    # Verify path is complete
    path_complete: true/false
    dead_code_in_path: [{list}]
```

### 5. HTML/UI Output Validation

```yaml
html_output_validation:
  # For UI components, extract actual rendered output
  component_output:
    - component: "{ComponentName}"
      file: "{path}"
      rendered_states:
        - state: "initial"
          html_output: |
            <div class="...">
              <!-- actual HTML -->
            </div>
          valid: true/false
          
        - state: "loading"
          html_output: |
            <div class="...">
              <!-- loading state HTML -->
            </div>
          valid: true/false
          
        - state: "error"
          html_output: |
            <div class="...">
              <!-- error state HTML -->
            </div>
          valid: true/false
          
        - state: "success"
          html_output: |
            <div class="...">
              <!-- success state HTML -->
            </div>
          valid: true/false
          
  # Check for visual breaks
  visual_breaks:
    - description: "Unclosed tags"
      check: "HTML is well-formed"
      valid: true/false
      
    - description: "Missing classes"
      check: "All CSS classes defined"
      valid: true/false
      
    - description: "8-bit styling compliance"
      check: "border-radius: 0 or 2px"
      valid: true/false
```

### 6. Journey Walking - Actual User Flow Test

```yaml
journey_walking:
  # Walk through the user journey with actual code
  journey_steps:
    - step: "User starts at {screen}"
      route_file: "{path}/route.ts"
      route_defined: true/false
      component_file: "{path}/{Component}.tsx"
      component_renders: true/false
      
    - step: "User performs {action}"
      handler_file: "{path}/{Component}.tsx"
      handler_line: "{N}"
      handler_exists: true/false
      event_bound: true/false
      
    - step: "System shows {feedback}"
      state_file: "{path}/{Store}.ts"
      state_update: true/false
      ui_feedback: true/false
      
    - step: "User sees {result}"
      result_file: "{path}/{Component}.tsx"
      result_line: "{N}"
      result_visible: true/false
      
    - step: "User can {next action}"
      next_handler_file: "{path}"
      next_handler_exists: true/false
      context_preserved: true/false
      
  # Verify journey is complete
  journey_complete: true/false
  journey_blockers: [{list}]
```

### 7. Requirements Mapping - Trace Every Requirement

```yaml
requirements_mapping:
  # Map each story requirement to actual code
  requirements:
    - req: "{story requirement}"
      implemented: true/false
      code_location: "{file}:{line}"
      test_location: "{test_file}:{line}"
      verified: true/false
      
  # Verify no requirements are missing
  all_requirements_covered: true/false
  missing_requirements: [{list}]
  extra_implementations: [{list}]
```

### 8. Comprehensive Code Quality Checklist - WITH EVIDENCE

```yaml
code_quality_checklist:
  correctness:
    - check: "Acceptance criteria fully met"
      evidence: "AC verification above"
      status: "{PASS|FAIL}"
      
    - check: "No obvious bugs"
      evidence: "Code walk with grep for common bugs"
      status: "{PASS|FAIL}"
      
    - check: "Edge cases handled"
      evidence: "List edge cases and verify handling"
      status: "{PASS|FAIL}"
      
  quality:
    - check: "Follows coding standards"
      evidence: "Import order, naming, formatting"
      status: "{PASS|FAIL}"
      
    - check: "Proper import patterns"
      evidence: "No relative imports > 3 levels"
      status: "{PASS|FAIL}"
      
    - check: "Error handling adequate"
      evidence: "try/catch, error boundaries"
      status: "{PASS|FAIL}"
      
    - check: "Naming consistent"
      evidence: "camelCase vars, PascalCase components"
      status: "{PASS|FAIL}"
      
  architecture:
    - check: "Clean architecture compliance"
      evidence: "No cross-layer imports"
      status: "{PASS|FAIL}"
      
    - check: "No circular dependencies"
      evidence: "git diff shows clean imports"
      status: "{PASS|FAIL}"
      
    - check: "Component size ≤300 lines"
      evidence: "wc -l {file} | awk '{print $1}'"
      status: "{PASS|FAIL}"
      
    - check: "Store size ≤120 lines"
      evidence: "wc -l {store} | awk '{print $1}'"
      status: "{PASS|FAIL}"
      
  testing:
    - check: "Tests comprehensive"
      evidence: "Test count, coverage report"
      status: "{PASS|FAIL}"
      
    - check: "Edge cases tested"
      evidence: "List edge case tests"
      status: "{PASS|FAIL}"
      
    - check: "No duplicate tests"
      evidence: "Test file analysis"
      status: "{PASS|FAIL}"
```

### 9. Display Comprehensive Code Review

```
═══════════════════════════════════════════════════════════════════
CODE REVIEW - DEEP REAL-CODE ANALYSIS
═══════════════════════════════════════════════════════════════════

Story: {story_key}
Reviewer: {agent}
Date: {timestamp}

┌─────────────────────────────────────────────────────────────────┐
│ FILES CHANGED                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Created: {count}                                                │
│   - {path} ({lines} lines)                                      │
│ Modified: {count}                                               │
│   - {path} (+{add}/-{remove} lines)                             │
│ Deleted: {count}                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ACCEPTANCE CRITERIA VERIFICATION                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ AC-1: {AC description}                                          │
│   Implemented: ✅                                                │
│   Evidence: {file}:{line}                                       │
│   Test: {test_file}:{line} ✅                                   │
│   Status: PASS                                                  │
│                                                                 │
│ AC-2: {AC description}                                          │
│   Implemented: ✅                                                │
│   Evidence: {file}:{line}                                       │
│   Test: {test_file}:{line} ✅                                   │
│   Status: PASS                                                  │
│                                                                 │
│ AC-3: {AC description}                                          │
│   Implemented: ❌                                                │
│   Evidence: MISSING at {file}                                   │
│   Test: NOT FOUND                                               │
│   Status: FAIL - MUST FIX                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CODE PATH WALKING                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Path Walk for AC-1:                                            │
│   [1] Entry: {file}:{line} ✅ VERIFIED                          │
│   [2] Update: {file}:{line} ✅ VERIFIED                         │
│   [3] Render: {file}:{line} ✅ VERIFIED                         │
│                                                                 │
│ Path is COMPLETE, no dead code in path.                         │
│                                                                 │
│ Path Walk for AC-2:                                            │
│   [1] Entry: {file}:{line} ✅ VERIFIED                          │
│   [2] Update: {file}:{line} ✅ VERIFIED                         │
│   [3] Render: {file}:{line} ✅ VERIFIED                         │
│                                                                 │
│ Path is COMPLETE, no dead code in path.                         │
│                                                                 │
│ Path Walk for AC-3:                                            │
│   [1] Entry: {file}:{line} ⚠️ EXISTS                            │
│   [2] Update: {file}:{line} ❌ MISSING                          │
│   [3] Render: NOT IMPLEMENTED                                   │
│                                                                 │
│ Path is INCOMPLETE - BLOCKER                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ HTML/UI OUTPUT VALIDATION                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Component: {ComponentName}                                      │
│                                                                 │
│ State: initial                                                  │
│   HTML: <div class="...">...</div>                              │
│   Valid: ✅                                                     │
│                                                                 │
│ State: loading                                                  │
│   HTML: <div class="...">...</div>                              │
│   Valid: ✅                                                     │
│                                                                 │
│ State: error                                                    │
│   HTML: NOT IMPLEMENTED                                         │
│   Valid: ❌ MISSING                                             │
│                                                                 │
│ State: success                                                  │
│   HTML: <div class="...">...</div>                              │
│   Valid: ✅                                                     │
│                                                                 │
│ Visual Breaks: NONE                                             │
│ 8-bit Styling: ✅ COMPLIANT                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ JOURNEY WALKING                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Step 1: User starts at {screen}                                 │
│   Route defined: ✅ {file}:{line}                               │
│   Component renders: ✅ {file}:{line}                           │
│                                                                 │
│ Step 2: User performs {action}                                  │
│   Handler exists: ✅ {file}:{line}                              │
│   Event bound: ✅                                                │
│                                                                 │
│ Step 3: System shows {feedback}                                 │
│   State update: ✅ {file}:{line}                                │
│   UI feedback: ✅                                               │
│                                                                 │
│ Step 4: User sees {result}                                      │
│   Result visible: ✅ {file}:{line}                              │
│                                                                 │
│ Step 5: User can {next action}                                  │
│   Next handler: ✅ {file}:{line}                                │
│   Context preserved: ✅                                         │
│                                                                 │
│ Journey is COMPLETE and COHERENT.                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ REQUIREMENTS MAPPING                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Requirement: {from story}                                       │
│   ✅ Implemented at {file}:{line}                               │
│   ✅ Verified at {test_file}:{line}                             │
│                                                                 │
│ Requirement: {from story}                                       │
│   ❌ NOT IMPLEMENTED                                            │
│   ⚠️ Must add implementation                                    │
│                                                                 │
│ All requirements: {N} covered, {M} missing                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CODE QUALITY CHECKLIST                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Correctness                                                     │
│   ✅ Acceptance criteria met                                    │
│   ✅ No obvious bugs                                            │
│   ⚠️  Edge cases partially handled                              │
│                                                                 │
│ Quality                                                         │
│   ✅ Follows coding standards                                   │
│   ✅ Proper import patterns                                     │
│   ✅ Error handling adequate                                    │
│   ✅ Naming consistent                                           │
│                                                                 │
│ Architecture                                                    │
│   ✅ Clean architecture compliance                              │
│   ✅ No circular dependencies                                   │
│   ✅ Component size OK (247 lines)                              │
│   ✅ Store size OK (89 lines)                                   │
│                                                                 │
│ Testing                                                         │
│   ✅ Tests comprehensive                                        │
│   ⚠️  Edge cases missing tests                                  │
│   ✅ No duplicate tests                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════
REVIEW SUMMARY
═══════════════════════════════════════════════════════════════════

Files Changed: {count}
Tests Passing: {count}/{count}
Coverage: {percentage}%

Status: {APPROVED | CHANGES REQUESTED | REJECTED}

Blocking Issues:
1. AC-3 not implemented - {file}:{line}
2. Error state missing in {Component}

Issues to Fix:
1. Add test for error state

Strengths:
- Clean architecture compliance
- Proper component separation
- Good error handling

Options:
[P] Approve - all critical checks pass
[R] Request fixes - blocking issues found
[D] Detailed diff view
```

### 10. Handle Review Outcome

**P**: Review complete, no blocking issues → Step 6 (Done)
**R**: Request fixes before proceeding
**I**: Detailed issue report
**D**: Show full diff

### 11. Update Frontmatter

```yaml
---
stepsCompleted: [1, "1a", 2, "3a", 3, 4, 5]
reviewComplete: true
reviewTimestamp: "{timestamp}"
reviewResult: "PASS|PARTIAL|FAIL"

# Verification Summary
verification:
  acceptanceCriteria:
    total: {count}
    passed: {count}
    failed: {list}
  codePaths:
    total: {count}
    complete: {count}
    incomplete: {list}
  htmlOutput:
    statesValidated: {count}
    statesMissing: {list}
  journeyWalking:
    complete: true/false
    blockers: {list}
  requirementsMapping:
    total: {count}
    covered: {count}
    missing: {list}

# Issues Found
issuesFound: {count}
blockingIssues: {count}
minorIssues: {list}

# Quality Scores
qualityScores:
  correctness: {1-5}
  quality: {1-5}
  architecture: {1-5}
  testing: {1-5}
  overall: {1-5}
---
```

---

## SUCCESS METRICS

- ✅ All files read and analyzed (not just diffs)
- ✅ Code path walking for every AC
- ✅ HTML/UI output validated
- ✅ Journey walking complete
- ✅ Requirements mapped to code
- ✅ 100% of critical checks pass
- ✅ Evidence captured for every claim

## FAILURE METRICS

- ❌ Files not read (only diff summary used)
- ❌ Code paths not walked
- ❌ Critical issues not detected
- ❌ Blocking issues remain

## REVIEW STANDARD

**BE EXTREMELY SKEPTICAL**:
- Verify every claim with actual code
- Walk through every path
- Extract actual output
- Question assumptions
- Evidence before assertion

**ONLY WHEN review complete and 100% passing, load {nextStepFile}**
