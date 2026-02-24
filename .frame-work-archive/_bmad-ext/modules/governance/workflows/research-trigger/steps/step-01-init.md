---
nextStepFile: '{installed_path}/steps/step-02-research.md'
continueFile: '{installed_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/research-trigger-output-{date}.md'
expertAnalysisOutput: '{output_folder}/expert-analysis-output-{date}.md'
workflowName: 'research-trigger'
---

# Step 1: Init

## STEP GOAL

Initialize research-trigger by understanding what research is needed and why.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Focus ONLY on understanding research needs
- 🚫 FORBIDDEN to skip to conclusions

## SEQUENCE OF INSTRUCTIONS

### 1. Welcome User

Greet by `{user_name}` and welcome to Research-Trigger workflow.

**description**: "We'll conduct research to validate your approach and ensure you're making informed decisions."

### 2. Load Expert-Analysis Output

Read `{expertAnalysisOutput}` to understand:
- Why research was triggered
- What flaws or concerns were identified
- What questions need answers

### 3. Identify Research Needs

Present research trigger and confirm:

```
═══════════════════════════════════════════════════════════
RESEARCH TRIGGER IDENTIFIED
═══════════════════════════════════════════════════════════

Trigger Reason: {why research was needed}

Concerns:
{List from expert-analysis}

Questions to Answer:
{What needs research}

Options:
[C] Confirm and continue
[R] Review full expert-analysis
[A] Add additional research topics
[X] Exit
```

### 4. Define Research Topics

For each research need, define:
```yaml
research_topics:
  - topic: "{what to research}"
    type: "tech_choice|trade_off|best_practice|architectural"
    priority: "high|medium|low"
    questions:
      - "{specific question to answer}"
```

### 5. Create/Update Output Document

Create `{outputFile}` with:
```yaml
---
workflow: "research-trigger"
date: "{date}"
user: "{user_name}"
stepsCompleted: [1]
status: "in_progress"
research_plan:
  trigger: "{why research}"
  topics: [from above]
---
```

### 6. Present Research Plan

```
Research Plan Ready:

Topics: {count}
High Priority: {count}

[C] Continue to Step 2: Conduct Research
```

---

## SUCCESS METRICS

- ✅ Research trigger understood
- ✅ Research topics defined
- ✅ Priority levels assigned
- ✅ Output initialized

## FAILURE METRICS

- ❌ Skipping trigger analysis
- ❌ Not defining research topics
- ❌ Missing priorities

**ONLY WHEN ready, load `{nextStepFile}`**
