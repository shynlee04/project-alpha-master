---
nextStepFile: '{installed_path}/steps/step-04-complete.md'
continueFile: '{installed_path}/steps/step-03b-continue.md'
outputFile: '{output_folder}/correct-course-output-{date}.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
workflowName: 'correct-course'
---

# Step 3: Route

## STEP GOAL

Delegate to selected sub-workflow and execute remediation.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Load selected sub-workflow
- 📋 Execute remediation steps
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Load Sub-Workflow

Based on selected category:

```yaml
sub_workflows:
  quick_patch:
    description: "Execute simple fix"
    steps:
      1. "Identify exact change needed"
      2. "Make targeted fix"
      3. "Verify fix works"
      4. "Run tests"

    estimated_duration: "minutes to hours"

  feature_fix:
    description: "Execute independent feature fix"
    steps:
      1. "Plan feature changes"
      2. "Implement feature"
      3. "Add tests"
      4. "Verify integration"

    estimated_duration: "hours to days"

  architectural:
    description: "Execute comprehensive remediation"
    delegates_to: "specialized agents"
    steps:
      1. "Detailed architecture analysis"
      2. "Create remediation plan"
      3. "Execute with specialized agent"
      4. "Verify no regressions"

    estimated_duration: "days to weeks"
    agents:
      - store-refactorer
      - component-splitter
      - typescript-fixer
```

### 2. Execute Sub-Workflow

```
═══════════════════════════════════════════════════════════
EXECUTING SUB-WORKFLOW
═══════════════════════════════════════════════════════════

Sub-Workflow: {selected_sub_workflow}
Category: {selected_category}

Context from Governance:
{affected domains, files, recommendations}

Executing Steps:
{execute sub-workflow steps}

Progress:
[Step 1 of N] → [Step 2 of N] → ...

Options:
[M] View more details
[P] Pause and save progress
[C] Cancel (with rollback)
```

### 3. Quick-Patch Execution

```yaml
quick_patch_execution:
  identify_change:
    - "Pinpoint exact issue"
    - "Determine minimal fix"

  make_fix:
    - "Apply targeted change"
    - "Verify no side effects"

  verify:
    - "Run affected tests"
    - "Manual verification"

  complete:
    - "Document fix"
    - "Create resolution"
```

### 4. Feature-Fix Execution

```yaml
feature_fix_execution:
  plan:
    - "Define feature scope"
    - "Identify affected files"
    - "Plan implementation order"

  implement:
    - "Make feature changes"
    - "Update related components"
    - "Add feature tests"

  verify:
    - "Run full test suite"
    - "Verify integration"
    - "Check performance"

  complete:
    - "Update documentation"
    - "Create resolution"
```

### 5. Architectural Execution

```yaml
architectural_execution:
  analysis:
    - "Deep architecture review"
    - "Identify all affected components"
    - "Create detailed plan"

  delegate:
    agent: "based on issue type"
    options:
      god_store: "store-refactorer agent"
      component_god: "component-splitter agent"
      typescript_issues: "typescript-fixer agent"

  execute_with_agent:
    - "Agent executes remediation"
    - "Progress monitoring"
    - "Verification checks"

  complete:
    - "Verify no regressions"
    - "Update architecture docs"
    - "Create resolution"
```

### 6. Update Frontmatter

```yaml
---
stepsCompleted: [1, 2, 3]
subWorkflowExecuted: "{sub_workflow_name}"
executionComplete: true
completedAt: "{timestamp}"
---
```

---

## SUCCESS METRICS

- ✅ Sub-workflow executed
- ✅ Remediation complete
- ✅ Tests passing
- ✅ No regressions

## FAILURE METRICS

- ❌ Sub-workflow failed
- ❌ Tests failing
- ❌ Regressions introduced
- ❌ Incomplete remediation

**ONLY WHEN sub-workflow complete, load {nextStepFile}**
