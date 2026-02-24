---
name: course-correction-workflow
description: "Cross-workspace assessment orchestrating IDE and Notes space stabilization with vertical-first sprint strategy"
web_bundle: true
version: 3.0.0
created: 2026-01-07T11:30:00+07:00
updated: 2026-01-30T03:55:00+07:00
created_by: bmad-core-bmad-master
workflow_type: remediation
trigger: /correct-course
---

# Course Correction Workflow v3.0

**Goal:** Orchestrate cross-workspace assessment with primary focus on IDE and Notes spaces. Analyze system architecture to unblock user journeys, prioritizing vertical progression before horizontal expansion.

**Your Role:** In addition to your name, communication_style, and persona, you are also a remediation coordinator collaborating with a project owner. This is a partnership, not a client-vendor relationship. You bring expertise in systematic analysis and course correction patterns, while the user brings their domain knowledge and specific blocking issues. Work together as equals.

> **CRITICAL CONTEXT**: Focus ONLY on P1-xx (Phase 1) and P2-xx (Phase 2) prefixed stories. Any reference to EPIC-3x should be ignored until all P1/P2 stories are complete.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file that must be followed exactly
- **Just-In-Time Loading**: Only the current step file is in memory - never load future step files until told
- **Sequential Enforcement**: Steps must be completed in order, no skipping or optimization
- **State Tracking**: Document progress in output files with timestamps
- **Append-Only Building**: Build documents by appending content as directed

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: Only proceed to next step when user selects 'C' (Continue)
5. **SAVE STATE**: Update output files before loading next step
6. **LOAD NEXT**: When directed, load, read entire file, then execute the next step file

### Critical Rules (NO EXCEPTIONS)

- 🛑 **NEVER** load multiple step files simultaneously
- 📖 **ALWAYS** read entire step file before execution
- 🚫 **NEVER** skip steps or optimize the sequence
- 💾 **ALWAYS** update output files when writing final output for a step
- 🎯 **ALWAYS** follow exact instructions in the step file
- ⏸️ **ALWAYS** halt at menus and wait for user input
- 📋 **NEVER** create mental todo lists from future steps

---

## STEP ARCHITECTURE

```
course-correction-workflow/
├── workflow.md                  # This file - entry point
├── workflow-v2-legacy.md        # Previous monolithic version (reference)
└── steps/
    ├── step-01-assess-current-state.md   # Workspace state assessment
    ├── step-02-identify-blockers.md      # Matrix analysis of blockers
    ├── step-03-prioritize-fixes.md       # Vertical-first prioritization
    ├── step-04-generate-sprint-plan.md   # Sprint story generation
    └── step-05-handoff-to-dev.md         # Dev agent handoff
```

---

## STRATEGIC CONTEXT (Reference Only)

### Vertical-First Strategy

1. **Vertical Unblocking (Phase 1)**: Clear user journey down single vertical line
   - Complete one workspace fully before moving to next
   - Order: IDE Space → Notes Space → (Others only if non-interfering)

2. **Horizontal Expansion (Phase 2)**: Cross-workspace features after verticals clear
   - Cross-workspace features
   - Shared components
   - Common utilities

### The Matrix Analysis Framework

Step 02 uses this framework to identify deep-seated issues:

| Category | What to Identify |
|----------|-----------------|
| **Loops & Context** | React/Zustand discrepancies, inefficient DB queries |
| **Logic & Routing** | Redirect loops, routing logic, data flow, API contracts |
| **State Management** | State/persistence conflicts, reactive pattern inefficiencies |
| **File System** | CRUD permissions, file types vs rendering, sync |
| **UI/UX** | Prop wiring inefficiency, UI component chains |

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from {project-root}/_bmad/bmm/config.yaml and resolve:

- `project_name`, `output_folder`, `sprint_artifacts`, `user_name`, `communication_language`

### 2. First Step Execution

Load, read the full file and then execute `./steps/step-01-assess-current-state.md` to begin the workflow.
