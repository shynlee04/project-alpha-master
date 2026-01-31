---
nextStepFile: '{installed_path}/steps/step-06-gatekeeping.md'
outputFile: '{output_folder}/sprint-planning-output-{date}.md'
nonsenseDetector: '{installed_path}/../../scanners/nonsense-detector.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
workflowName: 'sprint-planning-enhanced'
---

# Step 5: Reality Validation

## STEP GOAL

Final Product Reality validation - "The Movie Script Test" for entire sprint combined with nonsense detection.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Run nonsense detector
- 📋 Validate complete sprint narrative
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Load Nonsense Detector

```yaml
scanner:
  location: "{nonsenseDetector}"

  detection_patterns:
    - duplicate_workflows: "Multiple ways to do same thing"
    - contradictory_requirements: "Conflicting stories"
    - orphan_features: "Features with no entry point"
```

### 2. Validate Complete Sprint Narrative

The 30-second demo script from Step 3 should now be enhanced with dependency context:

```yaml
sprint_narrative:
  story: |
    "In this sprint, we're delivering:

    [Start at entry point]
    User can now [feature from Story A]
    Which enables [feature from Story B]
    And completes with [feature from Story C]

    Here's what it looks like..."

  validation:
    - "Is the narrative coherent?"
    - "Do stories build on each other?"
    - "Is there a clear user journey?"
    - "Would a stakeholder understand this demo?"
```

### 3. Detect Nonsense Patterns

```yaml
nonsense_patterns:
  duplicate_workflows:
    description: "Multiple ways to achieve same goal"
    example: "Dual chat systems - different UI for same function"
    detection: "Compare story goals and UI paths"

  contradictory_requirements:
    description: "Stories that conflict with each other"
    example: "Story A says 'X', Story B says 'not X'"
    detection: "Cross-reference acceptance criteria"

  orphan_features:
    description: "Features with no discoverable entry point"
    example: "Great feature buried 5 levels deep"
    detection: "Check entry points for each story"

  zombie_features:
    description: "Features that will be immediately replaced"
    example: "Building component that will be deleted next sprint"
    detection: "Check epic roadmap"
```

### 4. Generate Final Validation Report

Create `sprint-validation-report.md`:
```markdown
# Sprint Validation Report: {sprint_id}
**Date**: {timestamp}

## Narrative Validation
{30-second demo script}

## Cohesion Score: {score}/5

## Dependency Summary
- Total: {count}
- Conflicts: {count}
- Critical Path: {ordered list}

## Nonsense Detected
{list of any nonsense patterns}

## Recommendations
{actionable recommendations}

**Overall**: {PASS | FAIL}
```

### 5. Display Validation Summary

```
═══════════════════════════════════════════════════════════
SPRINT REALITY VALIDATION COMPLETE
═══════════════════════════════════════════════════════════

30-Second Demo Script:
{final demo script}

Validation Score: {1-5}
- Narrative Coherence: {rating}
- Story Flow: {rating}
- Entry Points: {rating}
- No Conflicts: {rating}

Nonsense Detected:
{list of patterns}

Recommendations:
{list of actionable items}

Overall: {PASS → PROCEED | FAIL → ADDRESS ISSUES}

Options:
[C] Continue to gatekeeping
[V] View full validation report
[A] Address issues (loop back)
```

### 6. Handle User Choice

**C**: Validation passed → Step 6 (Gatekeeping)
**V**: Review full validation report
**A**: Issues found → Loop back to planning

### 7. Update Frontmatter

```yaml
---
stepsCompleted: [1, 2, 3, 4, 5]
validation_complete: true
validation_score: {1-5}
nonsense_detected: {count}
recommendations: [{list}]
---
```

---

## SUCCESS METRICS

- ✅ Complete sprint narrative generated
- ✅ No nonsense patterns detected
- ✅ Validation score >= 4
- ✅ Recommendations actionable

## FAILURE METRICS

- ❌ Incoherent narrative
- ❌ Critical nonsense detected
- ❌ Validation score < 4

**ONLY WHEN validation passed, load {nextStepFile}**
