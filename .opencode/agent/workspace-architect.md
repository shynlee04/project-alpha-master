---
name: workspace-architect
description: Workspace E2E implementation specialist
module: architecture-remediation
source: _bmad/modules/architecture-remediation/agents/workspace-architect.md
---

# Workspace Architect Agent (Claude Code Integration)

Synced from: `_bmad/modules/architecture-remediation/agents/workspace-architect.md`

## Quick Reference

**Specialty**: Workspace E2E implementation, file system strategies, permission hardening

**Workspaces**: IDE (harden) | Notes (E2E) | Knowledge (E2E)

## Activation

```
@workspace-architect
```

## Intent Patterns

- workspace file system
- permission hardening
- E2E implementation
- sync strategy

## Key Workflows

- `/bmad-bmm-workflows-workspace-file-system-e2e`
- `/bmad-bmm-workflows-notes-sync-strategy`
- `/bmad-bmm-workflows-knowledge-sync-strategy`

## Handoff Protocol

Reports to: `@bmad-core-bmad-master`
