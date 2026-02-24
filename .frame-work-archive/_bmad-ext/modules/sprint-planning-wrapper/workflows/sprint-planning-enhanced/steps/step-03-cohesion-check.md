---
nextStepFile: '{installed_path}/steps/step-04-dependency-map.md'
continueFile: '{installed_path}/steps/step-03b-continue.md'
outputFile: '{output_folder}/sprint-planning-output-{date}.md'
sprintStatus: '{implementation_artifacts}/sprint-status.yaml'
cohesionScanner: '{installed_path}/../../scanners/cohesion-scanner.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
workflowName: 'sprint-planning-enhanced'
---

# Step 3: Cohesion Check

## STEP GOAL

Validate sprint cohesion - detect fragmented UX, "Dual Chat" type issues, and narrative incoherence.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Run cohesion scanner
- 📋 Generate 30-second demo script
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Load Cohesion Scanner

```yaml
scanner:
  location: "{cohesionScanner}"
  checks:
    - narrative_check
    - dependency_friction
    - ghost_logic
```

### 2. Narrative Check - The Movie Script Test

Generate a **30-second demo script** for the ENTIRE sprint:

```yaml
narrative_validation:
  prompt: |
    "Imagine showing a stakeholder a 30-second demo of everything
    in this sprint. Tell the story of a user using these features:

    1. User starts at: {screen}
    2. User does: {actions from stories}
    3. System responds: {results}
    4. User continues: {next actions}

    If the story is fragmented (user jumps between disconnected UIs,
    loses context, or has to relearn), the sprint fails cohesion."

  output: "demo-script.md"

  fail_if:
    - "User switches between unrelated UIs"
    - "Multiple workflows for same goal"
    - "Features with no clear entry point"
```

### 3. Dependency Friction Check

Map story completion dates vs dependencies:

```yaml
dependency_friction:
  check: |
    "For each dependency, verify:
    - Does dependent story start AFTER dependency completes?
    - If not, is there a valid parallel work reason?

    Example FAIL: Story A (finishes Day 4) blocks Story B (starts Day 1)"

  output:
    conflicts: "{list of temporal conflicts}"
    warnings: "{list of potential issues}"
```

### 4. Ghost Logic Check

Scan for missing state handling:

```yaml
ghost_logic_check:
  scan_for:
    - "Stories with no error state defined"
    - "Stories with no empty state defined"
    - "Stories with no loading state defined"

  output:
    missing_states: "{list of stories missing states}"
```

### 5. Display Cohesion Report

```
═══════════════════════════════════════════════════════════
COHESION CHECK COMPLETE
═══════════════════════════════════════════════════════════

30-Second Demo Script:
{generated demo script}

Cohesion Score: {1-5}
- Narrative Flow: {rating} - {notes}
- Dependency Alignment: {rating} - {notes}
- State Coverage: {rating} - {notes}

Issues Found:
{list of detected issues}

Anti-Patterns Detected:
{list of anti-patterns}

Overall: {PASS → PROCEED | FAIL → ADDRESS ISSUES}

Options:
[C] Continue to dependency mapping
[F] View detailed cohesion report
[A] Address issues (re-plan stories)
```

### 6. Handle User Choice

**C**: Cohesion acceptable → Step 4 (Dependency Map)
**F**: Review full cohesion report
**A**: Issues found → Return to planning

### 7. Update Frontmatter

```yaml
---
stepsCompleted: [1, 2, 3]
cohesion_score: {1-5}
cohesion_report: "{output_folder}/cohesion-report-{date}.md"
demo_script: "{output_folder}/demo-script.md"
issues_detected: {count}
---
```

---

## SUCCESS METRICS

- ✅ 30-second demo script generated
- ✅ Cohesion score >= 3
- ✅ No critical anti-patterns
- ✅ Dependency alignment verified

## FAILURE METRICS

- ❌ Cohesion score < 3
- ❌ Critical anti-patterns detected (Dual Chat, etc.)
- ❌ Dependency conflicts found

**ONLY WHEN cohesion acceptable, load {nextStepFile}**
