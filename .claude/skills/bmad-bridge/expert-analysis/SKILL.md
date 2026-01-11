---
id: expert-analysis
name: Expert Analysis
category: governance
priority: 16
parent: null
children: []
agents: [all]
description: Agent as Expert - classify issues, detect flaws, compare with codebase

# Hop-reading bridge
bridge:
  type: "workflow"
  source: "_bmad-ext/modules/governance/workflows/expert-analysis"
  load: "on_demand"
  command: "/expert"
  depends_on: "governance-scan"
---

# Expert Analysis Skill

## Purpose

Bridge to `_bmad-ext/modules/governance/workflows/expert-analysis/` for issue classification and flaw detection.

## Issue Classification

| Level | Description | Remediation Path |
|-------|-------------|------------------|
| `quick_patch` | Wrong wiring, simple bug | Direct fix, 5-30 min |
| `feature_fix` | Independent feature work | Targeted scanner + fix, 1-3 hours |
| `architectural` | Cross-domain impact | Full diagnostic workflow, 3-15 hours |

## What It Does

1. Compares user approach against actual codebase
2. Detects flaws in user's proposed solution
3. Identifies overlapping or conflicting work
4. Recommends: proceed/warn/stop

## Usage

Invoke via `/expert` command after `/gov` completes.

## Output

Report in `_bmad-output/governance/expert-analysis-output-{date}.md`

## Hop-Reading Architecture

This skill contains only metadata (frontmatter).
Full workflow loads on-demand from `_bmad-ext/` when invoked.
