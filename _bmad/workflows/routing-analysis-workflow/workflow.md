---
name: routing-analysis-workflow
description: Comprehensive scan and analysis workflow for client-side Agentic RAG platform routing problems
web_bundle: true
version: 1.0.0
created: 2026-01-07T10:51:00+07:00
created_by: Admin
workflow_type: analysis
target_workspaces: [notes, ide]
---

# Routing Analysis Workflow

**Goal:** Systematically scan, analyze, and map routing inconsistencies in client-side Agentic RAG platform, covering both Note workspace and IDE workspace with deep-dive code-specific analysis and multiple iterative tool calls.

**Scope:** 
- Project concept ambiguity analysis
- BYOK persistence failures identification  
- User journey mapping for all entry points
- Cross-workspace state consistency verification
- Error boundary and fallback mechanism assessment

---

## WORKFLOW ARCHITECTURE

### Core Analysis Principles

- **Depth-First Investigation**: Complete horizontal analysis before progressing to next level
- **Evidence-Based Findings**: Every issue must be backed by code evidence and logs
- **Iterative Deep-Dive**: Multiple tool calls for thorough code-specific mapping
- **Cross-Workspace Coverage**: Both Notes and IDE workspaces extensively analyzed
- **Skeptical PM Methodology**: Assume nothing works until proven otherwise

### Analysis Sequence Rules

1. **COMPLETE HORIZONTALLY**: Finish entire analysis layer before moving deeper
2. **DOCUMENT EVERYTHING**: Log all findings, evidence, and recommendations  
3. **VALIDATE ASSUMPTIONS**: Test every hypothesis with actual code inspection
4. **CROSS-REFERENCE**: Findings must be consistent across workspaces
5. **FAIL-SAFE ANALYSIS**: No analysis should break the application

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from {project-root}/_bmad/bmm/config.yaml and resolve:

- `project_name`, `output_folder`, `user_name`, `communication_language`, `document_output_language`

### 2. Workflow Metadata

- Created: 2026-01-07T10:51:00+07:00
- Creator: Admin
- Target Workspaces: notes, ide
- Analysis Type: routing-inconsistencies
- Methodology: Skeptical Product Manager Approach
- Coverage: Full user journey mapping
- Tools: Multi-iterative code inspection
- Output: Comprehensive diagnostic report

### 3. First Step Execution

Load, read the full file and then execute `./steps/step-01-init.md` to begin the workflow.

