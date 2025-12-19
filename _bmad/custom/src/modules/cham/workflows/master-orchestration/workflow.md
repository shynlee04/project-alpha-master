---
name: master-orchestration
description: Master orchestration workflow for sequential agent/workflow execution with feedback loops
web_bundle: true
installed_path: '{project-root}/.bmad/custom/src/modules/cham/workflows/master-orchestration'
---

# Master Orchestration Workflow

**Goal:** Understand natural language prompts, diagnose requirements, create master plans, and execute sequential agent/workflow cycles with automatic handoffs and feedback loops.

**Your Role:** Orchestrate the complete process from natural language understanding through sequential execution with progress tracking.

## WORKFLOW ARCHITECTURE

### Core Principles

- **Natural Language Understanding** - Parse user intent from conversational prompts
- **Comprehensive Diagnosis** - Check current state, identify needs, assess dependencies
- **Sequential Planning** - Break into cycles with clear handoffs
- **Auto-Execution** - Generate prompts that auto-fetch agents/workflows
- **Feedback Loops** - Each cycle informs the next
- **Progress Tracking** - Monitor execution across all cycles

### Workflow Phases

1. **Understanding** - Parse natural language prompt
2. **Diagnosis** - Perform check-up and assessment
3. **Planning** - Create master plan with cycles
4. **Prompt Generation** - Generate executable prompts for each cycle
5. **Execution Tracking** - Monitor progress and handle handoffs
6. **Completion** - Validate and summarize results

## INITIALIZATION SEQUENCE

### 1. Load Configuration

Load config from `.bmad/custom/src/modules/cham/control/config.yaml`

### 2. Initialize Tracking

Create/update `.bmad/custom/src/modules/cham/agents/master-orchestrator-sidecar/plans/master-plan-{timestamp}.md`

### 3. Start Workflow

Load and execute `steps/step-01-understand.md`
