---
nextStepFile: '{installed_path}/steps/step-03a-agent-tool-spec.md'
continueFile: '{installed_path}/steps/step-02b-continue.md'
outputFile: '{output_folder}/story-cycle-{story_key}-output.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
workflowName: 'story-cycle'
---

# Step 2: Validate - Comprehensive Evidence-Based Validation

## STEP GOAL

Validate story prerequisites with EVIDENCE-BASED checklists. Every validation item must have:
- What we're checking (specific)
- How to verify (grep/glob/read command)
- Evidence captured (file:line reference)
- Pass/fail status with rationale

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Every check must have evidence (not just assumption)
- 📋 Run actual verification commands
- 🔄 Update frontmatter with evidence summary

## SEQUENCE OF INSTRUCTIONS

### 1. Story Prerequisites Validation (With Evidence)

```yaml
prerequisites_validation:
  story_assigned:
    check: "Story is assigned to current sprint"
    evidence:
      command: "READ {sprint-status.yaml} | grep -A5 '{story_key}'"
      expected: "status:.*in_progress|pending"
      actual: "{result from command}"
    status: "{PASS|FAIL}"
    
  context_available:
    check: "Story context XML exists and is fresh"
    evidence:
      command: "READ {story_key}-context.xml | head -20"
      expected: "<?xml.*<context>"
      file_exists: true/false
      modified_recently: true/false
    status: "{PASS|FAIL}"
    
  governance_approval:
    check: "Story has governance approval"
    evidence:
      command: "grep -r 'APPROVED' {story_file}"
      expected: "APPROVED:.*by.*human"
      actual: "{result}"
    status: "{PASS|FAIL}"
    
  user_story_complete:
    check: "User story has As a/I want/So that"
    evidence:
      command: "grep -E '^## User Story' {story_file} -A5"
      has_as_a: true/false
      has_i_want: true/false
      has_so_that: true/false
    status: "{PASS|FAIL}"
    
  acceptance_criteria:
    check: "At least 3 ACs with Given/When/Then"
    evidence:
      command: "grep -c '### AC-' {story_file}"
      count: "{number}"
      all_have_gwt: true/false
    status: "{PASS|FAIL}"
```

### 2. Sprint Capacity Validation (With Evidence)

```yaml
sprint_capacity_validation:
  sprint_active:
    check: "Sprint is currently active"
    evidence:
      command: "READ {sprint-status.yaml} | grep 'sprint_active'"
      expected: "true"
      actual: "{result}"
    status: "{PASS|FAIL}"
    
  capacity_available:
    check: "Sprint has capacity for this story"
    evidence:
      command: |
        READ {sprint-status.yaml} | grep 'stories_in_progress'
        Count: {number}
        Max: {limit}
      remaining_capacity: "{count}"
    status: "{PASS|FAIL|WARNING}"
    
  not_overcommitted:
    check: "Sprint is not overcommitted"
    evidence:
      command: "READ {sprint-status.yaml} | grep 'points_remaining'"
      expected: "points_remaining > 0"
      actual: "{result}"
    status: "{PASS|FAIL}"
```

### 3. Dependencies Validation (With Evidence)

```yaml
dependencies_validation:
  blocking_dependencies:
    check: "Blocking dependencies are complete"
    evidence:
      command: "grep 'blocked_by' {story_file}"
      blocking: [{list}]
      for_each_blocker:
        - blocker: "{story_id}"
          check: "READ {blocker}/status"
          expected: "done"
          actual: "{result}"
          blocks_start: true/false
    status: "{PASS|FAIL|WARNING}"
    
  downstream_stories:
    check: "Stories depending on this are accounted for"
    evidence:
      command: "grep -r '{story_key}' *_story*.md | grep -v '{story_key}'"
      dependent_stories: [{list}]
      can_proceed: true/false
    status: "{PASS|FAIL}"
```

### 4. Technical Environment Validation (With Evidence)

```yaml
technical_environment_validation:
  branch_available:
    check: "Git branch exists or can be created"
    evidence:
      command: "git branch --list | grep '{story-key}'"
      exists: true/false
      can_create: true/false
    status: "{PASS|FAIL|WARNING}"
    
  environment_ready:
    check: "Development environment is ready"
    evidence:
      command: "pnpm --version && node --version"
      pnpm_available: true/false
      node_available: true/false
    status: "{PASS|FAIL}"
    
  dependencies_installed:
    check: "Project dependencies are installed"
    evidence:
      command: "ls node_modules/.bin | head -5"
      count_files: "{number}"
      expected_min: 10
    status: "{PASS|FAIL}"
    
  clean_state:
    check: "Working directory is clean or changes are committed"
    evidence:
      command: "git status --short"
      uncommitted_changes: {count}
      staged_changes: {count}
    status: "{PASS|WARNING}"
```

### 5. Epic Context Validation (With Evidence)

```yaml
epic_context_validation:
  epic_exists:
    check: "Parent epic exists"
    evidence:
      command: "READ {epics.md} | grep -A2 'EPIC-{N}'"
      exists: true/false
      status: "{status}"
    status: "{PASS|FAIL}"
    
  epic_position:
    check: "Story position in epic is valid"
    evidence:
      command: "grep -B5 '{story_key}' {epics.md}"
      position: "{N} of {total}"
      previous_stories_done: "{list}"
    status: "{PASS|FAIL|WARNING}"
    
  epic_alignment:
    check: "Story aligns with epic goals"
    evidence:
      command: "grep -A10 'EPIC-{N}' {epics.md} | grep 'Goals' -A5"
      story_supports_goals: true/false
    status: "{PASS|FAIL}"
```

### 6. Architecture Context Validation (With Evidence)

```yaml
architecture_context_validation:
  architecture_exists:
    check: "Architecture document exists"
    evidence:
      command: "ls {architecture.md}"
      exists: true/false
    status: "{PASS|FAIL}"
    
  relevant_patterns:
    check: "Relevant architecture patterns identified"
    evidence:
      command: "grep -i '{keyword}' {architecture.md}"
      patterns_found: [{list}]
      relevant: true/false
    status: "{PASS|FAIL|WARNING}"
    
  clean_architecture_compliance:
    check: "Implementation will follow clean architecture"
    evidence:
      command: "grep 'Clean Architecture Paths' {architecture.md} -A10"
      paths_defined: true/false
    status: "{PASS|WARNING}"
```

### 7. Display Comprehensive Validation Results

```
═══════════════════════════════════════════════════════════════════
STORY VALIDATION - EVIDENCE-BASED CHECKLIST
═══════════════════════════════════════════════════════════════════

Story: {story_key}

┌─────────────────────────────────────────────────────────────────┐
│ PREREQUISITES                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ✅ Story Assigned        [Evidence: sprint-status.yaml:45]      │
│ ✅ Context Available     [Evidence: {story}-context.xml exists] │
│ ✅ Governance Approved   [Evidence: APPROVED: by human]         │
│ ✅ User Story Complete   [Evidence: As a/I want/So that present]│
│ ✅ ACs Defined           [Evidence: 5 ACs with GWT format]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SPRINT CAPACITY                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ✅ Sprint Active         [Evidence: sprint_active: true]        │
│ ✅ Capacity Available   [Evidence: 3/5 stories slots open]      │
│ ✅ Not Overcommitted    [Evidence: 15 points remaining]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DEPENDENCIES                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ✅ No Blocking         [Evidence: All deps done or N/A]         │
│ ✅ Downstream Ready    [Evidence: 2 stories can proceed after]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TECHNICAL ENVIRONMENT                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ✅ Branch Ready         [Evidence: Can create feature/{story}]  │
│ ✅ Env Ready            [Evidence: pnpm 9.x, node 20.x]         │
│ ✅ Deps Installed       [Evidence: 127 packages in node_modules]│
│ ⚠️  Uncommitted Changes [Evidence: 3 files modified - should    │
│                         commit before proceeding]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ EPIC CONTEXT                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ✅ Epic Exists          [Evidence: EPIC-{N} in epics.md]        │
│ ✅ Position Valid       [Evidence: Story 2 of 5, 1 prev done]   │
│ ✅ Alignment Confirmed  [Evidence: Supports epic goals]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ARCHITECTURE CONTEXT                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ✅ Architecture Exists   [Evidence: architecture.md present]    │
│ ✅ Patterns Identified   [Evidence: 3 relevant patterns found]  │
│ ✅ Clean Architecture    [Evidence: Paths defined in doc]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════
VALIDATION SUMMARY
═══════════════════════════════════════════════════════════════════

Total Checks: {count}
Passed: {count}
Failed: {count}
Warnings: {count}

Status: {READY → PROCEED | WARNINGS → PROCEED | BLOCKED → FIX FIRST}

Critical Items Requiring Action:
{list any failed items with evidence}

Options:
[P] Proceed to Agent Tool Spec
[R] Review blocking issues with evidence
[H] Hold story
```

### 8. Handle User Choice

**P**: All required checks pass → Step 3a (Agent Tool Spec)
**R**: Show detailed blocking issues with evidence
**H**: Update sprint-status, exit

### 9. Update Frontmatter

```yaml
---
stepsCompleted: [1, "1a", 2]
validationPassed: true
validationTimestamp: "{timestamp}"
validationEvidence:
  prerequisites:
    storyAssigned: true
    contextAvailable: true
    governanceApproved: true
    userStoryComplete: true
    acsDefined: true
  sprintCapacity:
    sprintActive: true
    capacityAvailable: true
    notOvercommitted: true
  dependencies:
    noBlocking: true
    downstreamReady: true
  technicalEnvironment:
    branchReady: true
    envReady: true
    depsInstalled: true
    cleanState: true
  epicContext:
    epicExists: true
    positionValid: true
    alignmentConfirmed: true
  architectureContext:
    architectureExists: true
    patternsIdentified: true
    cleanArchitectureCompliant: true
warnings: [{list of any warnings}]
blockingIssues: [{list of any blocking items}]
---
```

---

## SUCCESS METRICS

- ✅ All prerequisite checks have evidence
- ✅ Evidence captured as file:line references
- ✅ Technical environment verified with commands
- ✅ Dependencies verified with actual status checks
- ✅ Epic context validated
- ✅ Architecture context verified

## FAILURE METRICS

- ❌ Missing evidence for any check
- ❌ Blocking dependencies not resolved
- ❌ Technical environment not ready
- ❌ Governance approval missing

## GATE: Story Start Gate

This step implements the **Story Start Gate** with EVIDENCE-BASED validation. Every claim must have verifiable evidence.

**ONLY WHEN validation complete, load {nextStepFile}**
