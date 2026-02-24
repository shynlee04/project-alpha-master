---
name: "CONTEXT-ECONOMY"
description: "BMAD-EXT Context Economy - Hop-reading patterns, TTL caching, stale detection"
version: "1.0.0"
tier: "foundation"
phase: "0"
status: "active"
category: "governance"
entry_point: "/context-economy"
updated: "2026-01-15"

integration_points:
  reads_from:
    - "_bmad-ext/state/LOOP_STATE.yaml"
    - "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
  writes_to:
    - "_bmad-ext/.cache/frontmatter"
    - "_bmad-output/governance/context-slices/"
  invoked_by:
    - "master-orchestrator"
    - "governance-workflows"
  hands_off_to: []

triggers:
  - "context economy"
  - "hop reading"
  - "ttl enforcement"
  - "stale detection"
---

# BMAD-EXT Context Economy

## Overview

Context economy refers to the strategies and patterns used to minimize unnecessary context loading while ensuring agents have the information they need when they need it.

## Core Principles

### 1. Hop-Reading Pattern

The hop-reading pattern ensures agents only load what they need:

```
Step 1: Load frontmatter only (minimal context, ~20 lines)
        ↓
Step 2: Extract key metadata (name, phase, status, integration_points)
        ↓
Step 3: On-demand, load full content for specific task
```

**Benefits**:
- Reduces context from ~2000 lines to ~20 lines initially
- Faster agent initialization
- Less context poisoning

**Example**:

```yaml
# Step 1: Load frontmatter only
Load: "_bmad-ext/modules/governance/MODULE.md"
Extract:
  - name
  - phase
  - status
  - integration_points
  - children

# Step 2: If need detailed info, load specific section
If: "need_detailed_workflow_info"
Load: "_bmad-ext/modules/governance/workflows/context-first/workflow.md"
Extract:
  - steps
  - quality_gates
```

### 2. 4-Tier TTL System

| Tier | Name | TTL | Action | Examples |
|------|------|-----|--------|----------|
| 1 | Constitution | Permanent | Never archive | CLAUDE.md, AGENTS.md, MODULE-HIERARCHY.md |
| 2 | Controlled | On-demand | Update iteratively | MODULE.md, workflow.md, agents |
| 3 | Archival | 90 days | Archive if stale | Scans, research, old plans |
| 4 | Ephemeral | 24 hours | Auto-purge | Handoffs, continuations, temp files |

### 3. Context Slices

Context slices are task-specific subsets of context:

```
Full Context (~5000 lines)
    ↓
Context Slice for "planning" (~500 lines)
    ↓
Context Slice for "implementation" (~300 lines)
```

**Slice Types**:

| Slice | Contains | Use Case |
|-------|----------|----------|
| `planning` | bmad-core, sprint-planning | Feature planning |
| `implementation` | implementation, story-cycle | Story execution |
| `architecture` | arc-v2, bmad-core (architecture) | System design |
| `governance` | governance workflows | Context validation |
| `remediation` | arc-v2, implementation | Bug fixes, refactoring |

## Scripts

### TTL Enforcer

```bash
# Scan and report
node _bmad-ext/modules/governance/scripts/ttl-enforcer.js --scan

# Archive stale tier-3 artifacts
node _bmad-ext/modules/governance/scripts/ttl-enforcer.js --archive

# Purge stale tier-4 artifacts
node _bmad-ext/modules/governance/scripts/ttl-enforcer.js --purge
```

### Stale Detector

```bash
# Check for stale context
node _bmad-ext/modules/governance/scripts/stale-detector.js

# Verbose output
node _bmad-ext/modules/governance/scripts/stale-detector.js --verbose

# Report only (no file output)
node _bmad-ext/modules/governance/scripts/stale-detector.js --report
```

### Context Optimizer

```bash
# Scan and cache frontmatter
node _bmad-ext/modules/governance/scripts/context-optimizer.js --scan

# Generate context slice for task
node _bmad-ext/modules/governance/scripts/context-optimizer.js --slice=planning

# Generate context slice for implementation
node _bmad-ext/modules/governance/scripts/context-optimizer.js --slice=implementation
```

## File Structure

```
governance/
├── scripts/
│   ├── ttl-enforcer.js        # TTL enforcement
│   ├── stale-detector.js      # Stale detection
│   └── context-optimizer.js   # Context slicing
├── .cache/
│   └── frontmatter/           # Frontmatter cache
└── CONTEXT-ECONOMY.md         # This file

_bmad-ext/
├── .cache/
│   └── frontmatter/           # Auto-generated cache
└── .logs/
    └── stale-detection-report.yaml
```

## Workflow Integration

### Context-First Workflow Integration

The context-first workflow automatically uses context economy:

```yaml
context-first workflow:
  Step 1: Load frontmatter (minimal)
  Step 2: Check staleness (TTL)
  Step 3: Generate context slice (if needed)
  Step 4: Transform prompt with context
```

### Master Orchestrator Integration

The master orchestrator checks context before delegation:

```yaml
before_delegation:
  1. Check LOOP_STATE.anchor freshness
  2. Load minimal context from target module
  3. Generate context slice for task
  4. Handoff to agent with minimal context
```

## Best Practices

### Do

- ✅ Always load frontmatter first
- ✅ Generate context slices for specific tasks
- ✅ Use TTL enforcer regularly
- ✅ Archive stale tier-3 artifacts

### Don't

- ❌ Load full content without checking frontmatter first
- ❌ Keep stale context in memory
- ❌ Use stale artifacts for decisions
- ❌ Load entire module when only need one workflow

## Metrics

Track context economy effectiveness:

| Metric | Target | Current |
|--------|--------|---------|
| Avg context size (initial load) | < 100 lines | ~20 lines (frontmatter) |
| Full content loads (per session) | < 5 | On-demand |
| Stale artifacts detected | 0 | Running check |
| Context slice cache hits | > 80% | TBD |

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
