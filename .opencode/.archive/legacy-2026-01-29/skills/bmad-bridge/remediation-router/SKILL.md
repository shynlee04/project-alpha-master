---
id: remediation-router
name: Remediation Router
category: remediation
priority: 65
parent: null
children:
  - store-refactorer
  - component-splitter
  - workspace-architect
agents: [bmad-master, arc-coordinator]
description: Routes to correct remediation agent based on issue classification

# Hop-reading bridge
bridge:
  type: "agent-router"
  source: "_bmad-ext/modules/arc-v2/agents"
  load: "on_demand"
  command: "/fix"
  depends_on: "expert-analysis"
---

# Remediation Router Skill

## description

Bridge to `_bmad-ext/modules/arc-v2/agents/` for targeted remediation based on issue type.

## Routing Logic

```yaml
store_refactorer:
  triggers:
    - "store > 120 lines"
    - "Epic CC-1 activation (Conversation Consolidation)"
    - "Epic CP-1 activation (Project Consolidation)"
  agent: "_bmad-ext/modules/arc-v2/agents/store-refactorer.md"

component_splitter:
  triggers:
    - "component > 300 lines"
    - "god component detected"
  agent: "_bmad-ext/modules/arc-v2/agents/component-splitter.md"

workspace_architect:
  triggers:
    - "file in wrong architectural layer"
    - "cross-workspace code duplication"
    - "circular import dependencies"
  agent: "_bmad-ext/modules/arc-v2/agents/workspace-architect.md"
```

## Usage

Invoke via `/fix` command after `/expert` classifies issue as `architectural`.

## Output

Remediation report in `_bmad-output/refactors/{type}-{date}.yaml`

## Hop-Reading Architecture

This skill contains only metadata (frontmatter).
Agents load on-demand from `_bmad-ext/` when routed.
