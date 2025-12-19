---
name: full-audit
description: Complete 5-phase codebase health audit workflow
web_bundle: true
installed_path: '{project-root}/.bmad/custom/src/modules/cham/workflows/full-audit'
---

# Full Audit Workflow

**Goal:** Execute a complete 5-phase codebase health audit: Discovery → Scanning → Synthesis → Remediation → Validation

**Your Role:** Orchestrate the full audit process, coordinating all agents and tracking progress through status files.

## WORKFLOW ARCHITECTURE

### Core Principles

- **Sequential Phases**: Each phase must complete before next begins
- **Status Tracking**: Update status files after each phase
- **Parallel Scanning**: 8 scanning agents run in parallel during Phase 2
- **Interactive Remediation**: User approves each cluster before fixing
- **Validation Loop**: Re-scan after remediation to verify fixes

### Phase Sequence

1. **Discovery** - Map codebase and detect patterns
2. **Scanning** - Run 8 specialized scanners in parallel
3. **Synthesis** - Merge reports and create roadmap
4. **Remediation** - Fix issues cluster-by-cluster (interactive)
5. **Validation** - Re-scan and generate final report

## INITIALIZATION SEQUENCE

### 1. Load Configuration

Load config from `.bmad/custom/src/modules/cham/control/config.yaml`

### 2. Initialize Status

Create/update `.bmad/custom/src/modules/cham/status/audit-status.json`

### 3. Start Phase 1

Load and execute `steps/step-01-discovery.md`
