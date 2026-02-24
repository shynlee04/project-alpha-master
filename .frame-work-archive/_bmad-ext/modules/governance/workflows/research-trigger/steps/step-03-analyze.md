---
nextStepFile: '{installed_path}/steps/step-04-complete.md'
outputFile: '{output_folder}/research-trigger-output-{date}.md'
workflowName: 'research-trigger'
---

# Step 3: Analyze

## STEP GOAL

Analyze research findings to answer the original questions and form recommendations.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Focus ONLY on analysis and synthesis
- 🚫 FORBIDDEN to ignore research findings
- 💾 Update output with analysis

## SEQUENCE OF INSTRUCTIONS

### 1. Report Analysis Plan

Display:
```
═══════════════════════════════════════════════════════════
ANALYZING RESEARCH FINDINGS
═══════════════════════════════════════════════════════════

Research Complete: {from step 2}
Analyzing findings to answer questions...

This will synthesize research into actionable recommendations.
```

### 2. Answer Research Questions

For each question from step 1, provide answer based on research:

```yaml
questions_answered:
  - question: "{from step 1}"
    answer: "{evidence-based answer}"
    confidence: "high|medium|low"
    sources: [supporting sources]
    caveats: [any limitations or concerns]
```

### 3. Form Recommendations

For each research topic, create recommendation:

**Tech Choice**:
```yaml
recommendation:
  topic: "{tech choice}"
  selected: "{option}"
  rationale: "{why this option based on research}"
  trade_offs_accepted: [what we're trading off]
  implementation_notes: [guidance]
```

**Trade-Off**:
```yaml
recommendation:
  topic: "{trade-off}"
  balance: "{how to balance}"
  rationale: "{why this balance}"
  monitoring: [what to watch}
```

**Best Practice**:
```yaml
recommendation:
  practice: "{best practice to follow}"
  alignment: "follow|adapt|deviate"
  rationale: "{why}"
  deviation_justification: [if deviating, why]
```

### 4. Identify Concerns

Document any remaining concerns:
```yaml
concerns:
  - severity: "low|medium|high"
    type: "{concern type}"
    description: "{what}"
    mitigation: "{how to address}"
```

### 5. Update Output Document

Append to `{outputFile}`:

```markdown
## Analysis & Recommendations

### Questions Answered
{Each question with answer}

### Recommendations
{For each topic}

### Remaining Concerns
{Any concerns to address}
```

Update frontmatter:
```yaml
stepsCompleted: [1, 2, 3]
analysis_complete: true
recommendations_made: [count]
concerns_identified: [count]
```

### 6. Present Analysis Summary

```
═══════════════════════════════════════════════════════════
ANALYSIS COMPLETE
═══════════════════════════════════════════════════════════

Questions Answered: {count}
Recommendations Made: {count}
Concerns: {count}

[C] Continue to Step 4: Finalize Report
[R] Review detailed analysis
```

---

## SUCCESS METRICS

- ✅ All questions answered
- ✅ Recommendations evidence-based
- ✅ Trade-offs acknowledged
- ✅ Concerns documented
- ✅ Output updated

## FAILURE METRICS

- ❌ Recommendations not based on research
- ❌ Ignoring trade-offs
- ❌ Missing concerns

**ONLY WHEN complete, load `{nextStepFile}`**
