---
name: codebase-diagnostic
description: Multi-phase deep diagnostic workflow for analyzing codebase architecture, routing, state management, and data flow. Designed for orchestrator coordination with sub-agent delegation.
web_bundle: true
version: 1.0.0
created: 2026-01-08
---

# Codebase Architecture Diagnostic Workflow

**Goal:** Systematically diagnose a large codebase (~1600+ files) for architectural issues including routing conflicts, state management chaos, database performance, and data flow problems through iterative sub-agent delegation.

**Your Role:** You are the **Orchestrator/Coordinator** managing multiple sub-agents to execute deep scans across the codebase. You delegate work, collect results, synthesize findings, and prioritize remediation.

---

## WORKFLOW ARCHITECTURE

This workflow uses **step-file architecture** with **sub-agent delegation patterns**:

### Core Principles

- **Phase-Based Execution**: 6 phases, each with dedicated focus
- **Sub-Agent Delegation**: Each step can spawn multiple sub-agents
- **Iterative Cycles**: Each phase completes before next begins
- **Evidence-Based**: All findings must include file paths, line numbers, code snippets
- **Synthesis Required**: Each phase ends with synthesis before proceeding

### Platform Compatibility

This workflow supports:
- **Claude Code** (via @agent delegation)
- **Gemini/Antigravity** (via sub-agent prompts)
- **OpenCode** (via mode switching)
- **Multi-instance** (parallel agents on same codebase)

### Delegation Patterns

```
ORCHESTRATOR (you)
    ├── Sub-Agent A: Route scanning
    ├── Sub-Agent B: Store scanning
    ├── Sub-Agent C: Database scanning
    └── Sub-Agent D: Component scanning
```

### Output Structure

All outputs saved to:
```
{output_folder}/diagnostics/codebase-diagnostic-{date}/
├── phase-0/  (Structure Mapping)
├── phase-1/  (User Journeys)
├── phase-2/  (Data Flow)
├── phase-3/  (Performance)
├── phase-4/  (Features)
├── phase-5/  (Integration)
├── phase-6/  (Synthesis)
└── FINAL-REPORT.md
```

---

## MANDATORY EXECUTION RULES

### Universal Rules:

- 🛑 **NEVER** skip phases or steps
- 📖 **ALWAYS** read entire step file before execution
- 🚫 **NEVER** synthesize without sub-agent results
- 💾 **ALWAYS** save outputs to designated locations
- 🎯 **ALWAYS** delegate to sub-agents for deep scans
- ⏸️ **ALWAYS** wait for sub-agent completion before synthesis
- 📋 **ALWAYS** track progress in frontmatter

### Delegation Rules:

- Each sub-agent gets ONE focused task
- Sub-agent prompts must include:
  - Scope (specific files/directories)
  - Objective (what to find)
  - Output format (structured table/list)
  - Exit criteria (when done)
- Collect all sub-agent results before proceeding

### Platform-Specific Commands:

**Claude Code:**
```
Delegate to sub-agent: "Execute [PROMPT] and save to [OUTPUT]"
```

**Gemini/Antigravity:**
```
[Sub-Agent Task]
OBJECTIVE: ...
SCOPE: ...
OUTPUT: ...
```

**OpenCode:**
```
@agent-mode Execute: ...
```

---

## INITIALIZATION SEQUENCE

### 1. Environment Setup

Confirm with user:
- Project root path
- Output folder for diagnostics
- Available sub-agent platforms (Claude, Gemini, OpenCode, etc.)
- Parallel execution capacity (how many sub-agents?)

### 2. Create Output Structure

```bash
mkdir -p {output_folder}/diagnostics/codebase-diagnostic-{date}/{phase-0,phase-1,phase-2,phase-3,phase-4,phase-5,phase-6}
```

### 3. Initialize Progress Tracker

Create `{output_folder}/diagnostics/codebase-diagnostic-{date}/PROGRESS.md`:

```markdown
---
workflow: codebase-diagnostic
started: {timestamp}
currentPhase: 0
subAgentsActive: 0
subAgentsCompleted: 0
---

# Diagnostic Progress

## Phase Status
- [ ] Phase 0: Structure Mapping
- [ ] Phase 1: User Journeys
- [ ] Phase 2: Data Flow
- [ ] Phase 3: Performance
- [ ] Phase 4: Features
- [ ] Phase 5: Integration
- [ ] Phase 6: Synthesis

## Sub-Agent Assignments
| ID | Phase | Prompt | Status | Output |
|----|-------|--------|--------|--------|
```

### 4. First Step Execution

Load, read full file, and execute `{workflow_path}/steps/step-01-structure.md` to begin.

---

## PHASES OVERVIEW

| Phase | Name | Sub-Agents | Focus |
|-------|------|------------|-------|
| 0 | Structure Mapping | 2 | File inventory, dependency graph |
| 1 | User Journeys | 7 | Real user flows through code |
| 2 | Data Flow | 5 | Stores, DB, events, contexts |
| 3 | Performance | 3 | Load time, DB ops, re-renders |
| 4 | Features | 6 | Notes, IDE, Knowledge, Study, Hub, Agents |
| 5 | Integration | 2 | Cross-feature deps, shared infra |
| 6 | Synthesis | 1 | Root cause, remediation plan |

**Total: 26 sub-agent prompts across 6 phases**

---

## SUCCESS/FAILURE METRICS

### ✅ WORKFLOW SUCCESS:

1. All 6 phases completed with documented outputs
2. All sub-agent results collected and synthesized
3. FINAL-REPORT.md generated with:
   - Executive summary
   - Prioritized issue list
   - Root cause analysis
   - Remediation roadmap
4. Actionable next steps defined

### ❌ WORKFLOW FAILURE:

- Skipping phases or steps
- Synthesizing without sub-agent results
- Not saving outputs to designated locations
- Not tracking progress in PROGRESS.md
- Proceeding to next phase without completion

---

## COORDINATION COMMANDS

During workflow execution, user can:

- `STATUS` - Show current progress
- `PAUSE` - Pause and save state
- `RESUME` - Resume from saved state
- `SKIP [phase]` - Skip to specific phase (requires justification)
- `RERUN [prompt]` - Re-execute specific sub-agent prompt
- `SYNTHESIZE` - Force synthesis of current phase
- `ABORT` - Cancel workflow with partial results
