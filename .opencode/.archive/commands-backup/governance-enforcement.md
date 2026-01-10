---
description: Run governance enforcement after structural changes
---

# Governance Enforcement

Execute after any workflow that modifies file structure.

## Trigger After

- God store splitting
- Component normalization
- Workspace E2E implementation
- Store migrations

## Steps

1. Update AGENTS.md with new paths
2. Run `/bmad-bmm-document-project`
3. Run `/bmad-bmm-generate-project-context`
4. Update sprint-status.yaml
5. Delete repomix output files

## Repomix Exclusions

Always exclude: `*.md, node_modules, .git, dist, cache, *.txt, *.xml, *.log`
