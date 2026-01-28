---
id: governance-scan
name: Governance Deep Scan
category: governance
priority: 15
parent: null
children: []
agents: [all]
description: Run governance scanner from _bmad-ext via hop-reading bridge

# Hop-reading bridge
bridge:
  type: "scanner"
  source: "_bmad-ext/modules/governance/scanners"
  load: "on_demand"
  command: "/gov"
---

# Governance Deep Scan Skill

## description

Bridge to `_bmad-ext/modules/governance/scanners/` for comprehensive governance validation.

## What It Scans

- **Documents vs Code Drift**: PRD features vs actual implementation
- **API Contracts**: OpenAPI specs vs actual endpoints
- **Data Schema**: TypeScript types vs runtime usage
- **File Structures**: Layer violations, circular imports
- **Feature Dependencies**: Cross-feature coupling analysis

## Usage

Invoke via `/gov` command or automatic trigger from hooks.

## Output

Report generated in `_bmad-output/governance/deep-scan-{date}.yaml`

## Hop-Reading Architecture

This skill contains only metadata (frontmatter).
Full scanner content loads on-demand from `_bmad-ext/` when invoked.
This minimizes token usage at session-start.
