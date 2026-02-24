---
nextStepFile: '{installed_path}/steps/step-04-recommend.md'
outputFile: '{output_folder}/expert-analysis-output-{date}.md'
workflowName: 'expert-analysis'
---

# Step 3: Compare Approach

## STEP GOAL

Compare the user's requested approach against the actual codebase to detect flaws, overlaps, or conflicts.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Focus ONLY on comparison and flaw detection
- 🚫 FORBIDDEN to approve without thorough analysis
- 💾 Update output with comparison results

## SEQUENCE OF INSTRUCTIONS

### 1. Report Comparison Plan

Display:
```
═══════════════════════════════════════════════════════════
APPROACH COMPARISON
═══════════════════════════════════════════════════════════

Comparing user's requested approach against:
- Existing codebase patterns
- Component relationships
- Data flow and state management
- API contracts

This will detect potential issues BEFORE development.
```

### 2. Categorize Issue Level

Analyze and categorize the request:

**Quick Patch** (if ALL apply):
- Simple bug fix or typo
- Wrong component wiring
- Isolated to one file
- No cascading impact

**Feature Fix** (if ANY apply):
- New feature or enhancement
- Affects multiple files
- Some relationship changes
- Limited architectural impact

**Architectural Conflict** (if ANY apply):
- Changes to core architecture
- Breaking changes to contracts
- Multiple subsystems affected
- Requires comprehensive remediation

### 3. Detect Flaws in Approach

Check for:
```yaml
potential_flaws:
  overlapping_work:
    - description: "Similar functionality already exists"
    severity: "low|medium|high"
    location: {file path}

  conflict_with_patterns:
    - description: "Approach conflicts with existing patterns"
    severity: "low|medium|high"
    current_pattern: {what exists}

  missing_dependencies:
    - description: "Required dependencies not accounted for"
    severity: "low|medium|high"

  state_management_issues:
    - description: "State handling may cause issues"
    severity: "low|medium|high"

  api_contract_violations:
    - description: "Would break existing API"
    severity: "high"

  overwhelming_complexity:
    - description: "Request is too broad for single change"
    severity: "medium|high"
    suggestion: "Break into smaller stories"
```

### 4. Generate Comparison Report

```yaml
comparison_report:
  issue_level: "{categorized level}"

  approach_analysis:
    user_approach: "{brief description}"
    current_state: "{what exists now}"
    compatibility: "{compatible|partial|conflicting}"

  flaws_detected:
    - type: "{flaw type}"
      severity: "{severity}"
      description: "{details}"
      recommendation: "{how to address}"

  risks:
    - "{potential risk if proceeding}"

  confidence: "{high|medium|low}"
```

### 5. Update Output Document

Append to `{outputFile}`:

```markdown
## Comparison Results

### Issue Level
{Categorized level}

### Flaws Detected
{List each flaw with severity}

### Risks Identified
{Potential risks}

### Recommendations
{Initial recommendations}
```

Update frontmatter:
```yaml
stepsCompleted: [1, 2, 3]
comparison_results:
  issue_level: "{level}"
  flaws_count: {count}
  high_severity: {count}
```

### 6. Present Comparison Summary

```
═══════════════════════════════════════════════════════════
COMPARISON COMPLETE
═══════════════════════════════════════════════════════════

Issue Level: {level}
Flaws Detected: {count}
High Severity: {count}

[C] Continue to Step 4: Final Recommendation
[R] Review detailed findings
```

---

## SUCCESS METRICS

- ✅ Issue level properly categorized
- ✅ Flaws detected and documented
- ✅ Risks identified
- ✅ Confidence level assessed
- ✅ Output updated

## FAILURE METRICS

- ❌ Skipping flaw detection
- ❌ Not categorizing issue level
- ❌ Ignoring obvious conflicts

**ONLY WHEN complete, load `{nextStepFile}`**
