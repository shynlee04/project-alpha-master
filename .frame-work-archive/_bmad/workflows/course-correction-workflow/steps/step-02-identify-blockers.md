---
step: 2
name: "identify-blockers"
phase: "analysis"
agent: "@bmad-bmm-analyst"
timeout: "20 min"
next: "03-prioritize-fixes.md"
on_fail: "notify-and-pause"

# Path Definitions
workflow_path: '{project-root}/_bmad/workflows/course-correction-workflow'
thisStepFile: './steps/step-02-identify-blockers.md'
nextStepFile: './steps/step-03-prioritize-fixes.md'
outputFile: '{output_folder}/correct-course/blockers-{timestamp}.md'
---

# Step 02: Identify Blockers

> **Agent:** Analyst
> **Output:** Blockers document at `{outputFile}`

---

## STEP GOAL

Deep-dive into blocking factors using "The Matrix" analysis framework. Systematically identify loops, logic issues, state conflicts, file system problems, and UI/UX blockers.

---

## MANDATORY EXECUTION RULES (READ FIRST)

### Universal Rules

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 📋 YOU ARE A FACILITATOR, not a content generator

### Step-Specific Rules

- 🎯 Focus only on blocker identification
- 🚫 FORBIDDEN to propose solutions in this step
- 💬 Approach: Use The Matrix framework systematically

---

## MANDATORY SEQUENCE

### 1. Load Assessment from Step 01

Read the assessment document created in previous step.

### 2. Apply The Matrix Analysis

For each blocked workspace, analyze:

| Category | What to Identify |
|----------|-----------------|
| **Loops & Context** | React/Zustand discrepancies, inefficient DB queries |
| **Logic & Routing** | Redirect loops, routing logic, data flow, API contracts |
| **State Management** | State/persistence conflicts, reactive pattern inefficiencies |
| **File System** | CRUD permissions, file types vs rendering, agent tooling, sync |
| **UI/UX** | Prop wiring inefficiency, UI component chains, dependent features |
| **Interface Intelligence** | Signposting next steps, user confusion points |

### 3. Deep-Scan Critical Areas

Use MCP tools to investigate:
- Context7: Official documentation patterns
- DeepWiki: Repository implementation patterns
- Repomix: Local codebase analysis

### 4. Document Blockers

Create blockers document at `{outputFile}`:

```markdown
# Blockers Identified

## Critical (P0)
1. [Blocker]: [Evidence]

## High (P1)  
1. [Blocker]: [Evidence]

## Medium (P2)
1. [Blocker]: [Evidence]
```

### 5. Present MENU OPTIONS

Display: "**Select an Option:** [A] Advanced Elicitation [C] Continue"

#### Menu Handling Logic

- IF A: Deep dive into specific blocker investigation
- IF C: Save blockers to {outputFile}, then load, read entire file, then execute {nextStepFile}
- IF Any other: help user respond then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C] is selected and blockers document saved, load `./steps/step-03-prioritize-fixes.md`.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS

- All Matrix categories analyzed
- Evidence-based blockers documented
- MCP research executed
- Blockers severity-ranked

### ❌ SYSTEM FAILURE

- Proposing solutions before completing analysis
- Missing Matrix categories
- No evidence for blockers
