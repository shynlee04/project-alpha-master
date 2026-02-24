---
name: "module-builder-ext"
description: "Enhanced Module Builder - Integrated with BMAD Extension Layer"
source: "_bmad-ext/agents/module-builder-ext.md"
version: "2.0.0"
model: "claude-opus-4-5"
agent: "ext-master"
context: "fork"
---

# @module-builder-ext

> Enhanced Module Builder with LOOP_STATE integration, ARTIFACT_REGISTRY registration, anchor verification, and orchestrator delegation.
>
> **Full Agent Definition**: `_bmad-ext/agents/module-builder-ext.md`
> **Enhanced From**: `_bmad/bmb/agents/module-builder.md`
> **Version**: 2.0.0
> **Platform**: Cross-platform (Claude Code + OpenCode)

## Quick Start

```bash
# Claude Code: Load agent
@module-builder-ext

# Or via ext-master menu
@ext-master → select Module Builder
```

## Agent Metadata

| Field | Value |
|-------|-------|
| **Name** | module-builder-ext |
| **Source** | `_bmad-ext/agents/module-builder-ext.md` |
| **Core** | `_bmad/bmb/agents/module-builder.md` |
| **Version** | 2.0.0 |
| **Status** | ACTIVE |
| **Entry Point** | true |

## Key Enhancements (v2.0)

1. **LOOP_STATE Integration** - Loads and updates global state
2. **ARTIFACT_REGISTRY** - Registers all created artifacts
3. **Anchor Verification** - Anti-hallucination guard
4. **Orchestrator Integration** - Can delegate to sub-agents
5. **Governance Updates** - Updates AGENTS.md on completion
6. **Handoff Protocol** - Creates traceable handoff artifacts

## Integration Points

| Reads From | Path |
|------------|------|
| **LOOP_STATE** | `_bmad-ext/state/LOOP_STATE.yaml` |
| **ARTIFACT_REGISTRY** | `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` |
| **MANIFEST** | `_bmad-ext/MANIFEST.yaml` |
| **Config** | `_bmad/bmb/config.yaml` |
| **Workflow Status** | `bmm-workflow-status.yaml` |

## Menu Items

| Code | description |
|------|-------------|
| BM | Brainstorm new BMAD modules |
| PB | Create product brief for module |
| CM | Create complete module with agents/workflows |
| EM | Edit existing module |
| VM | Validate module compliance |
| EX | Extension workflows (context-first, correct-course) |
| CH | Chat with the agent |
| DA | Dismiss Agent |

## Delegates To

- `dev-ext` (for implementation)
- `architect-ext` (for architecture)
- `analyst-ext` (for analysis)

## Full Documentation

For complete activation protocol, menu handlers, and progress tracking, see:

**`_bmad-ext/agents/module-builder-ext.md`**

---

**Token Savings**: ~10,400 tokens per load (96% reduction)
**Last Updated**: 2026-01-14
