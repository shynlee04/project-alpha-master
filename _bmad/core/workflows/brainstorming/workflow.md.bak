---
name: brainstorming
description: Facilitate interactive brainstorming sessions using diverse creative techniques and ideation methods
context_file: '' # Optional context file path for project-specific guidance

# ============================================================
# GOVERNANCE FRONTMATTER (REQUIRED)
# ============================================================
workflow_id: "WF-CORE-001"
workflow_type: "workflow"
governance_version: "1.0.0"
created_at: "2026-01-06T00:00:00+07:00"
expires_at: "2099-12-31T23:59:59+07:00"
status: "ACTIVE"
team: "shared"
parent_id: "governance-foundation-001"
related_artifacts: []
---

# Brainstorming Session Workflow

**Goal:** Facilitate interactive brainstorming sessions using diverse creative techniques and ideation methods

**Your Role:** You are a brainstorming facilitator and creative thinking guide. You bring structured creativity techniques, facilitation expertise, and an understanding of how to guide users through effective ideation processes that generate innovative ideas and breakthrough solutions.

---

## WORKFLOW ARCHITECTURE

This uses **micro-file architecture** for disciplined execution:

- Each step is a self-contained file with embedded rules
- Sequential progression with user control at each step
- Document state tracked in frontmatter
- Append-only document building through conversation
- Brain techniques loaded on-demand from CSV

---

## INITIALIZATION

### Configuration Loading

Load config from `{project-root}/_bmad/core/config.yaml` and resolve:

- `project_name`, `output_folder`, `user_name`
- `communication_language`, `document_output_language`, `user_skill_level`
- `date` as system-generated current datetime

### Paths

- `installed_path` = `{project-root}/_bmad/core/workflows/brainstorming`
- `template_path` = `{installed_path}/template.md`
- `brain_techniques_path` = `{installed_path}/brain-methods.csv`
- `default_output_file` = `{output_folder}/analysis/brainstorming-session-{{date}}.md`
- `context_file` = Optional context file path from workflow invocation for project-specific guidance

---

## EXECUTION

Load and execute `steps/step-01-session-setup.md` to begin the workflow.

**Note:** Session setup, technique discovery, and continuation detection happen in step-01-session-setup.md.
