---
id: research-trigger
name: Research Trigger
category: governance
priority: 17
parent: null
children: []
agents: [all]
description: Internet-based research for tech validation and trade-off analysis

# Hop-reading bridge
bridge:
  type: "workflow"
  source: "_bmad-ext/modules/governance/workflows/research-trigger"
  load: "on_demand"
  command: "/research"
  depends_on: "expert-analysis"
---

# Research Trigger Skill

## description

Bridge to `_bmad-ext/modules/governance/workflows/research-trigger/` for internet-based tech validation.

## When Research Is Triggered

1. **Tech Choice Needed** - New library/framework selection
2. **Trade-off Analysis** - Performance vs maintainability decisions
3. **Best Practice Validation** - Avoiding anti-patterns
4. **Architectural Concerns** - Breaking changes, migration complexity

## What It Does

- Conducts internet research via web search
- Validates assumptions against current documentation
- Analyzes trade-offs between approaches
- Provides evidence-based recommendations

## Usage

Invoke via `/research` command after `/expert` detects tech choice needs.

## Output

Report in `_bmad-output/governance/research-trigger-output-{date}.md`

## Hop-Reading Architecture

This skill contains only metadata (frontmatter).
Full workflow loads on-demand from `_bmad-ext/` when invoked.
