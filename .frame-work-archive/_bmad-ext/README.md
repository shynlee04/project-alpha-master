# BMAD Extension Layer

> **Version**: 1.0.0 | **Status**: Phase 0 Complete | **Date**: 2026-01-10

## Overview

This extension layer **wraps** BMAD core without modifying it. When BMAD is updated, this layer remains untouched.

## Quick Start

```bash
# Via Augment
/bmad-ext orchestrator

# Via Cursor
@bmad-ext-orchestrator

# Direct invocation
# Load: _bmad-ext/orchestrator/master-orchestrator.md
```

## Structure

```
_bmad-ext/
├── MANIFEST.yaml           # Registry & phase tracking
├── README.md               # This file
│
├── orchestrator/           # Central orchestrator (Phase 3)
│   ├── master-orchestrator.md
│   ├── delegation-protocol.md
│   └── routing-rules.yaml
│
├── agents/                 # Enhanced agents (Phase 2)
│   ├── dev-ext.md         # Wraps _bmad/bmm/agents/dev.md
│   ├── architect-ext.md   # Wraps _bmad/bmm/agents/architect.md
│   └── ...                # 9 total
│
├── workflows/              # Extension workflows (Phase 2)
│   ├── story-cycle/
│   ├── remediation-cycle/
│   └── governance-cycle/
│
├── state/                  # Unified state (Phase 1)
│   ├── LOOP_STATE.yaml    # Replaces 3-level hierarchy
│   └── ARTIFACT_REGISTRY.yaml
│
├── schemas/                # Validation schemas
│   └── handoff-artifact.schema.yaml
│
└── hooks/                  # Execution hooks
    ├── pre-execution.md
    └── post-execution.md
```

## Key Concepts

### 1. Enhanced Agents

Each enhanced agent (`*-ext.md`) wraps a core BMM agent and adds:
- **Pre-execution hooks**: Load parent context, verify anchor
- **Post-execution hooks**: Create handoff artifact, update state
- **Escalation paths**: Report to orchestrator on failure
- **Loop awareness**: Check/update LOOP_STATE

### 2. Unified Loop State

Single `LOOP_STATE.yaml` replaces the 3-level hierarchy:
- Session tracking
- **Anti-hallucination anchor** (human intent timestamp)
- Current work context
- Delegation tracking
- Continuation state

### 3. Handoff Protocol

Every agent-to-agent transition creates a handoff artifact with:
- Parent/child linking
- Context summary
- Acceptance criteria
- Validation commands
- Escalation path

### 4. Master Orchestrator

Single entry point that:
- Reads `bmm-workflow-status.yaml`
- Routes to appropriate enhanced agent
- Tracks active delegations
- Receives completion callbacks
- Updates governance docs automatically

## Implementation Phases

| Phase | Name | Status |
|-------|------|--------|
| 0 | Foundation | ✅ COMPLETE |
| 1 | State Layer | ⏳ PENDING |
| 2 | Enhanced Agents | ⏳ PENDING |
| 3 | Orchestrator | ⏳ PENDING |
| 4 | Platform Wrappers | ⏳ PENDING |
| 5 | Integration Test | ⏳ PENDING |

## What Was Archived

- `LOOP_STATE-grandparent.yaml` → Causes hallucination chains
- `LOOP_STATE-parent.yaml` → Replaced by unified state
- `LOOP_STATE-child.yaml` → Replaced by unified state
- `architecture-refactoring/` → Duplicate of architecture-remediation

Archive location: `_bmad-output/.archive/2026-01-10/phase-0-triage/`

## Compatibility

- **BMAD Core**: 6.0.0+
- **bmad-master**: 3.2.0
- **Platforms**: Augment, Cursor, Claude Code, OpenCode

## Next Steps

To continue implementation:
1. Run Phase 1 to create state layer
2. Run Phase 2 to create enhanced agents
3. Run Phase 3 to create orchestrator
4. Run Phase 4 to create platform wrappers
5. Run Phase 5 to test integration
