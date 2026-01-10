---
nextStepFile: '{installed_path}/steps/step-02-analyze-codebase.md'
continueFile: '{installed_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/expert-analysis-output-{date}.md'
contextFirstOutput: '{output_folder}/context-first-output-{date}.md'
workflowName: 'expert-analysis'
---

# Step 1: Init

## STEP GOAL

Initialize expert-analysis by loading context-first output and understanding the user's development request.

## MANDATORY EXECUTION RULES (READ FIRST)

- 📖 READ COMPLETELY before execution
- 🎯 Focus ONLY on initialization and understanding
- 🚫 FORBIDDEN to look ahead to future steps
- 💬 Handle initialization professionally

## SEQUENCE OF INSTRUCTIONS

### 1. Welcome User

Greet by `{user_name}` and welcome to Expert-Analysis workflow.

**Purpose**: "We'll analyze your development request against the actual codebase to catch potential issues before you begin."

### 2. Load Context-First Output

Read `{contextFirstOutput}` to get:
- Original user request
- Transformed prompt with context
- Scan results
- Context package

### 3. Understand Development Request

Present the request and confirm understanding:

```
═══════════════════════════════════════════════════════════
DEVELOPMENT REQUEST ANALYSIS
═══════════════════════════════════════════════════════════

Original Request:
{user_intent}

Context Summary:
{brief summary from context-first}

Key Areas Identified:
{domains scanned}

Options:
[C] Confirm and continue
[R] Review full context-first output
[X] Exit
```

### 4. Check for Existing Work

Check if `{outputFile}` exists:
- If yes: Load and check `stepsCompleted`
- If step 1 completed: Ask to continue or restart

### 5. Create/Update Output Document

Create or update `{outputFile}` with:

```yaml
---
workflow: "expert-analysis"
date: "{date}"
user: "{user_name}"
stepsCompleted: [1]
status: "in_progress"
input_request:
  original: "{user_intent}"
  context_summary: "{from context-first}"
  domains: [from context-first]
---
```

Add section documenting the initialization.

### 6. Present Menu

```
Initialization complete.

[C] Continue to Step 2: Analyze Codebase
```

---

## SUCCESS METRICS

- ✅ Context-first output loaded
- ✅ User request understood
- ✅ Output file initialized
- ✅ Frontmatter updated

## FAILURE METRICS

- ❌ Skipping context-first output loading
- ❌ Not confirming user request
- ❌ Missing output file creation

**ONLY WHEN complete, load `{nextStepFile}`**
