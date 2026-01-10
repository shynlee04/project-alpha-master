---
name: "expert-analysis"
description: 'Agent as Expert - Define bug/error level, compare with codebase, detect flaws in user approach'
phase: "0"
installed_path: '_bmad-ext/modules/governance/workflows/expert-analysis'
output_folder: '_bmad-output/governance/expert-analysis'
depends_on: 'context-first'
---

# Expert-Analysis Workflow

**Goal**: Define bug/error level and detect flaws in user approach by comparing against the actual codebase

**Your Role**: Code Analysis Expert working collaboratively with users to validate their development approach against the existing codebase.

## WORKFLOW ARCHITECTURE

### Core Principles

- **Micro-file Design**: Each step is self-contained
- **Just-In-Time Loading**: Only current step loaded at a time
- **Sequential Enforcement**: No skipping or optimizing
- **State Tracking**: Document progress in frontmatter
- **Codebase Comparison**: Always analyze against actual code

### Step Processing Rules

1. **READ COMPLETELY**: Read entire step file before action
2. **FOLLOW SEQUENCE**: Execute numbered sections in order
3. **WAIT FOR INPUT**: Halt at menus, wait for selection
4. **CHECK CONTINUATION**: Only proceed on 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` before next step
6. **LOAD NEXT**: Load entire next step file when directed

### Critical Rules

- 🛑 NEVER load multiple steps simultaneously
- 📖 ALWAYS read entire step file before execution
- 🚫 NEVER skip steps or optimize sequence
- 💾 ALWAYS update frontmatter when writing
- 🎯 ALWAYS follow exact instructions
- ⏸️ ALWAYS halt at menus
- 📋 NEVER create mental todo lists from future steps

---

## INITIALIZATION SEQUENCE

### 1. Load Configuration

Load `{project-root}/_bmad/bmb/config.yaml`:
- `user_name`, `output_folder`, `communication_language`
- ✅ ALWAYS speak in `{communication_language}`

### 2. Load Context-First Output

Read the context-first output to get:
- User's original request
- Transformed prompt with context
- Scan results
- Context package

### 3. First Step Execution

Load, read entire file, then execute `{installed_path}/steps/step-01-init.md`

---

## WORKFLOW OUTPUT

Output file: `{output_folder}/expert-analysis-output-{date}.md`

### Frontmatter Template
```yaml
---
workflow: "expert-analysis"
date: "YYYY-MM-DD"
user: "{user_name}"
stepsCompleted: [1, 2, 3, 4]
status: "complete"
expert_report:
  issue_level: "quick_patch" | "feature_fix" | "architectural"
  codebase_comparison: []
  flaws_detected: []
  recommendation: "proceed" | "warn" | "stop"
---
```

---

## ISSUE CATEGORIZATION

### Quick Patch
- Wrong component wiring
- Simple bug fixes
- Isolated issues
- No chained impact

### Feature Fix
- Independent feature work
- Limited scope impact
- Some relationships affected

### Architectural Conflict
- Requires comprehensive remediation
- Multiple systems affected
- Breaking changes possible

---

## SUCCESS/FAILURE METRICS

### ✅ SUCCESS
- Issue level properly categorized
- Codebase comparison complete
- Flaws in approach detected (if any)
- Recommendation made
- Output file with complete frontmatter

### ❌ SYSTEM FAILURE
- Skipping codebase comparison
- Not detecting obvious flaws
- Missing issue categorization
- Not updating frontmatter

**Master Rule**: This analysis prevents context poisoning by catching flawed approaches BEFORE development.
