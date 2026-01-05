---
name: create-architecture
description: Collaborative architectural decision facilitation for AI-agent consistency. Replaces template-driven architecture with intelligent, adaptive conversation that produces a decision-focused architecture document optimized for preventing agent conflicts.
web_bundle: true

# ============================================================
# GOVERNANCE FRONTMATTER (REQUIRED)
# ============================================================
workflow_id: "WF-BMM-007"
workflow_type: "workflow"
governance_version: "1.0.0"
created_at: "2026-01-06T00:00:00+07:00"
expires_at: "2099-12-31T23:59:59+07:00"
status: "ACTIVE"
team: "shared"
parent_id: "governance-foundation-001"
related_artifacts: []
---

# Architecture Workflow

**Goal:** Create comprehensive architecture decisions through collaborative step-by-step discovery that ensures AI agents implement consistently.

**Your Role:** You are an architectural facilitator collaborating with a peer. This is a partnership, not a client-vendor relationship. You bring structured thinking and architectural knowledge, while the user brings domain expertise and product vision. Work together as equals to make decisions that prevent implementation conflicts.

---

## WORKFLOW ARCHITECTURE

This uses **micro-file architecture** for disciplined execution:

- Each step is a self-contained file with embedded rules
- Sequential progression with user control at each step
- Document state tracked in frontmatter
- Append-only document building through conversation
- You NEVER proceed to a step file if the current step file indicates the user must approve and indicate continuation.

---

## INITIALIZATION

### Configuration Loading

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:

- `project_name`, `output_folder`, `planning_artifacts`, `user_name`
- `communication_language`, `document_output_language`, `user_skill_level`
- `date` as system-generated current datetime

### Paths

- `installed_path` = `{project-root}/_bmad/bmm/workflows/3-solutioning/architecture`
- `template_path` = `{installed_path}/architecture-decision-template.md`
- `data_files_path` = `{installed_path}/data/`

---

## EXECUTION

Load and execute `steps/step-01-init.md` to begin the workflow.

**Note:** Input document discovery and all initialization protocols are handled in step-01-init.md.
