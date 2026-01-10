# Governance Module

**Created**: 2026-01-06
**Purpose**: Artifact lifecycle management, status synchronization, template enforcement
**Status**: Active

## Module Overview

The Governance Module ensures the BMAD framework operates with clean context, synchronized status files, and proper template/guideline separation from implementation artifacts.

## Core Responsibilities

1. **Artifact Lifecycle Management**
   - Enforce 5-day active retention policy
   - Daily artifact folder structure
   - Auto-archive to monthly folders
   - Cleanup of expired artifacts

2. **Status File Synchronization**
   - Weighted consolidation approach
   - Parent-child hierarchy preservation
   - Automatic stale file removal

3. **Template Enforcement**
   - Read-only governance for module templates
   - Validation of agent compliance
   - Gatekeeping for all workflows

## Directory Structure

```
_bmad/modules/governance/
├── agents/                    # Governance agents
│   └── artifact-lifecycle-agent.md
├── workflows/                 # Governance workflows
│   ├── artifact-cleanup-cycle.md
│   ├── status-sync-validator.md
│   └── template-enforcement.md
├── config/                    # Configuration files
│   ├── retention-policy.yaml
│   └── status-weights.yaml
├── policies/                  # Policy documents
│   ├── artifact-lifecycle.md
│   └── template-governance.md
├── MODULE-CREATION-SUMMARY.md  # This file
└── README.md                  # Module documentation
```

## Integration Points

- **asgl**: Enforces read-only template usage
- **architecture-remediation**: Validates artifact compliance
- **deep-scan**: Integrates as diagnostic submodule

## Success Metrics

- <50 active artifacts at any time
- Zero conflicting status files
- 100% template read-only compliance
- All artifacts stamped with proper frontmatter

---

*Module created as part of Cycle 1: Governance Foundation*
*BMAD Master v3.0 - Root Cause Remediation*
