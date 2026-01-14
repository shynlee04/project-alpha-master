# Phase 3 Platform Integration Research Report

**Date**: 2026-01-14
**Status**: RESEARCH COMPLETE
**Purpose**: Comprehensive analysis of Claude Code vs OpenCode integration patterns for token optimization, hop-reading, and auto-governance

---

## Executive Summary

This research analyzed the current state of `.claude/`, `.opencode/`, and `_bmad-ext/` directories to identify:

1. **Duplicate content** - Same files exist in multiple locations with identical content
2. **Full content dumps** - Large files (500-800 lines) that should be hop-references
3. **Platform-specific patterns** - Different agent/command/hook handling between platforms
4. **Missing integration points** - Gaps in the hop-reading hierarchy

**Key Finding**: The current architecture violates the single-source-of-truth principle. `_bmad-ext/` should be the source, with `.claude/` and `.opencode/` containing lightweight hop-references only.

---

## 1. Platform Comparison: Claude Code vs OpenCode

| Aspect | Claude Code | OpenCode | Integration Strategy |
|--------|-------------|----------|---------------------|
| **Entry Point** | Empty session, use `@agent` command | Agent-based session | Different init patterns |
| **Agent Handoff** | Direct Task delegation (same-level) | Sticky agents → Skills → Profile load | CC: direct / OC: via skill |
| **Skills Loading** | Skill tool invocation | Skill loads new agent profile | Both use frontmatter-first |
| **Commands** | `/command` in prompts | Script-based execution | Overlapping/bridging |
| **Hooks** | Event-watch steering | Event-watch steering | Similar YAML patterns |
| **State Sharing** | `_bmad-ext/state/LOOP_STATE.yaml` | `_bmad-ext/state/LOOP_STATE.yaml` | **SHARED** - this is correct |

### Critical Insight

> **The platforms share `_bmad-ext/` as their single source of truth**. Both Claude Code and OpenCode should hop-read from `_bmad-ext/`, not contain duplicate content.

---

## 2. Current Architecture Problems

### Problem 1: Duplicate Agents (CRITICAL)

The following agents exist in BOTH locations with IDENTICAL content:

| Agent | .claude/agents/ | _bmad-ext/agents/ | Lines | Status |
|-------|----------------|-------------------|-------|--------|
| ext-master-enhanced | ✅ 739 lines | ✅ 739 lines | IDENTICAL | **DUPLICATE** |
| dev-ext | ✅ 527 lines | ✅ 527 lines | IDENTICAL | **DUPLICATE** |
| product-management-ext | ✅ 487 lines | ✅ 487 lines | IDENTICAL | **DUPLICATE** |
| module-builder-ext | ✅ 261 lines | ✅ 261 lines | IDENTICAL | **DUPLICATE** |
| architect-ext | ✅ 134 lines | ✅ 134 lines | IDENTICAL | **DUPLICATE** |
| ux-designer-ext | ✅ 126 lines | ✅ 126 lines | IDENTICAL | **DUPLICATE** |
| tech-writer-ext | ✅ 120 lines | ✅ 120 lines | IDENTICAL | **DUPLICATE** |
| analyst-ext | ✅ 101 lines | ✅ 101 lines | IDENTICAL | **DUPLICATE** |
| tea-ext | ✅ 112 lines | ✅ 112 lines | IDENTICAL | **DUPLICATE** |
| ext-master | ✅ 83 lines | ✅ 83 lines | IDENTICAL | **DUPLICATE** |
| _template-enhanced-agent | ✅ 347 lines | ✅ 347 lines | IDENTICAL | **DUPLICATE** |

**Impact**: ~3,000 lines of duplicate code. When one changes, the other doesn't.

### Problem 2: Full Content Dumps Instead of Hop-References

| File | Lines | Should Be | Pattern |
|------|-------|-----------|---------|
| ext-master-enhanced.md | 739 | ~50 | Full agent spec embedded |
| dev-ext.md | 527 | ~30 | Full activation protocol |
| product-management-ext.md | 487 | ~30 | Full menu and persona |
| _template-enhanced-agent.md | 347 | ~50 | Template is content-heavy |

**Example of GOOD hop-reference pattern** (from `deep-scan-targeted.md`, 19 lines):

```yaml
---
description: Run a targeted deep scan on a specific domain or directory
usage: /deep-scan-targeted [domain] [target]
---

# /deep-scan-targeted

Executes the `@bmad/modules/deep-scan/workflows/targeted-scan` workflow.

## Arguments
- `domain`: The architectural domain to scan.
- `target`: (Optional) Specific directory or file path.
```

### Problem 3: Governance Module Overlap

| Module | Status | Issue |
|--------|--------|-------|
| `governance/` | ACTIVE v2.0 | Should be sole source |
| `governance-core/` | DEPRECATED | Duplicate structure, should archive |

**From MODULE-HIERARCHY.md**:
> "DEPRECATED - Merge into governance/"
> "The duplication caused confusion about which module to use"

---

## 3. Hop-Reading Architecture (The Solution)

### 3.1 Core Principle

```
┌─────────────────────────────────────────────────────────────────┐
│                    SINGLE SOURCE OF TRUTH                       │
│                     _bmad-ext/                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │   agents/   │  │  modules/   │  │   orchestrator/      │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │ hop-read (frontmatter-first)
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────────────────┐               ┌───────────────────┐
│    .claude/       │               │   .opencode/      │
│  (hop-refs only)  │               │  (hop-refs only)  │
│  ┌─────────────┐  │               │  ┌─────────────┐  │
│  │  agents/    │  │               │  │instructions │  │
│  │  commands/  │  │               │  │  agents/    │  │
│  │  hooks/     │  │               │  │  workflows/ │  │
│  │  skills/    │  │               │  └─────────────┘  │
│  └─────────────┘  │               └───────────────────┘
└───────────────────┘
```

### 3.2 Hop-Reading Protocol

**Level 1: Frontmatter Extraction (FAST - ~50 tokens)**

```yaml
# Load frontmatter only - DO NOT read full content
action: "extract_frontmatter"
source: "_bmad-ext/agents/ext-master.md"
extract:
  - name
  - description
  - version
  - menu_items
```

**Level 2: On-Demand Full Load**

```yaml
# Only load full content when executing
action: "execute_workflow"
source: "_bmad-ext/modules/governance/workflows/context-first/workflow.md"
condition: "user_selected_workflow == 'context-first'"
```

### 3.3 Token Optimization Math

| Approach | Tokens per Agent | 10 Agents | 50 Agents |
|----------|-----------------|-----------|-----------|
| Full Content Dump | ~5,000 | 50,000 | 250,000 |
| Hop-Reference (frontmatter only) | ~200 | 2,000 | 10,000 |
| **Savings** | **96%** | **48,000** | **240,000** |

---

## 4. Integration Architecture by Component

### 4.1 Skills

**Current State** (GOOD):
- `.claude/skills/{skill-name}/SKILL.md` pattern
- Frontmatter-based metadata
- Each skill self-contained

**Location**:
```
.claude/skills/
├── bmad-bridge/              # Bridge to _bmad-ext
│   ├── governance-scan/
│   ├── expert-analysis/
│   ├── research-trigger/
│   └── remediation-router/
├── global-coding-style/      # Platform-agnostic
├── backend-api/              # Platform-agnostic
└── [other skills]
```

**Pattern** (GOOD):
```markdown
---
name: "governance-scan"
description: "Context-first governance workflow"
version: "1.0.0"
source: "_bmad-ext/modules/governance/workflows/context-first"
---

# Governance Scan Skill

> Loads and executes the context-first workflow from _bmad-ext
```

### 4.2 Commands

**Current State** (MIXED):
- Some commands are hop-references (GOOD)
- Some contain embedded workflows (BAD)

**Claude Code Commands**:
```
.claude/commands/
├── deep-scan-targeted.md    # ✅ 19 lines - hop-reference
├── codebase-diagnostic.md    # ❓ Need to check
├── bmad/
│   ├── governance.yaml       # Bridge command
│   ├── expert.yaml           # Bridge command
│   └── remediate.yaml        # Bridge command
```

**OpenCode Workflows**:
```
.opencode/workflows/          # If exists
└── [should contain hop-refs to _bmad-ext]
```

### 4.3 Hooks

**Current State** (GOOD pattern):
```yaml
# .claude/hooks/session-start.yaml
steps:
  - name: load_bmad_config
    files:
      - _bmad/core/config.yaml
      - _bmad-ext/MANIFEST.yaml
    extract:
      - user_name
      - communication_language
```

**Hooks are event-watch steering factors** - they should remain lightweight and reference _bmad-ext for governance checks.

### 4.4 Agents

**Current State** (NEEDS FIX):
```
❌ WRONG: .claude/agents/dev-ext.md (527 lines - full content)
❌ WRONG: .claude/agents/ext-master-enhanced.md (739 lines - full content)

✅ CORRECT: .claude/agents/ext-master.md (83 lines - hop-reference)
```

**Target Pattern**:
```markdown
---
name: "dev-ext"
description: "Enhanced Developer Agent"
source: "_bmad-ext/agents/dev-ext.md"
version: "1.0.0"
---

# @dev-ext

> Enhanced development agent with orchestration hooks.
> Full agent definition at: `_bmad-ext/agents/dev-ext.md`
```

---

## 5. Loops of Cycles Within Cycles

### 5.1 The LOOP_STATE Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       MASTER ORCHESTRATOR                        │
│  (_bmad-ext/orchestrator/master-orchestrator.md)                │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    LOOP_STATE.yaml                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐ │ │
│  │  │  session    │  │   anchor    │  │   delegations      │ │ │
│  │  │  - id       │  │  - intent   │  │  - active          │ │ │
│  │  │  - platform │  │  - timestamp│  │  - completed       │ │ │
│  │  │  - iter     │  │  - verified │  │  - failed          │ │ │
│  │  └─────────────┘  └─────────────┘  └────────────────────┘ │ │
│  │                                                              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐ │ │
│  │  │ governance  │  │  workflow   │  │   events           │ │ │
│  │  │  - checks   │  │  - chain    │  │  - queue           │ │ │
│  │  └─────────────┘  └─────────────┘  └────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ▲                                    │
│                              │ Updates after each step          │
│                              └──────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Event-Based Routing

```
User Request
     │
     ▼
┌─────────────────┐
│  Load LOOP_STATE │
│  - Check anchor  │
│  - Verify session│
└────────┬────────┘
         │
    ┌────┴────┐
    │ Stale?  │────YES──► Prompt User
    └────┬────┘
         │ NO
         ▼
┌─────────────────┐
│ Routing Decision│
│ - Request type  │
│ - Governance    │
│ - Phase         │
└────────┬────────┘
         │
    ┌────┴─────┐──────────┐──────────┐
    ▼          ▼          ▼          ▼
[GOV]      [SPRINT]   [IMPLEMENT]  [ARC]
    │          │          │          │
    ▼          ▼          ▼          ▼
Event─────►Event──────►Event───────►Event
Trigger    Trigger     Trigger      Trigger
```

---

## 6. Auto-Validation and Guardrails

### 6.1 Pre-Execution Validation

```yaml
# From governance/module.md
validation_chain:
  1. anchor_freshness:
     check: "NOW() - anchor.timestamp < staleness_threshold"
     on_fail: "PROMPT_USER"

  2. artifact_ttl:
     check: "all_artifacts_ttl_valid()"
     on_fail: "ARCHIVE_STALE"

  3. context_size:
     check: "no_artifact_exceeds_5000_lines()"
     on_fail: "SPLIT_ARTIFACT"

  4. tier_protection:
     check: "constitution_files_read_only()"
     on_fail: "BLOCK_EXECUTION"
```

### 6.2 Governance Triggers

| Trigger | Condition | Action |
|---------|-----------|--------|
| Session Start | Always | Run artifact scanner |
| User Prompt | Every request | Check anchor freshness |
| Step Complete | After each step | Update LOOP_STATE |
| Story Complete | After story | Full governance scan |
| Epic Complete | After epic | Comprehensive validation |

---

## 7. Categorization: Integration Status

### 7.1 Already Integrated (Hop-References)

| File | Location | Pattern |
|------|----------|---------|
| deep-scan-targeted.md | .claude/commands/ | ✅ Hop-reference |
| ext-master.md | .claude/agents/ & _bmad-ext/agents/ | ✅ But duplicated |
| architect-ext.md | .claude/agents/ & _bmad-ext/agents/ | ✅ But duplicated |
| governance-scan/ | .claude/skills/bmad-bridge/ | ✅ Good pattern |
| session-start.yaml | .claude/hooks/ | ✅ References _bmad-ext |

### 7.2 On List (Need Integration)

| Component | Action Required |
|-----------|-----------------|
| `.claude/agents/*.md` (duplicates) | Remove, replace with hop-refs to `_bmad-ext/agents/` |
| `.claude/commands/*` (large files) | Convert to hop-refs |
| `.opencode/instructions/*` | Ensure hop-refs to `_bmad-ext/modules/` |
| `governance-core/` | Archive (deprecated) |

### 7.3 Create Anew (Missing)

| Component | Location | Purpose |
|-----------|----------|---------|
| domains.yaml | `_bmad-ext/modules/governance/config/` | Domain classifications |
| context-strategy.md | `_bmad-ext/modules/governance/policies/` | Context filtering rules |
| gating-policy.md | `_bmad-ext/modules/governance/policies/` | Gatekeeping rules |
| context-scanner.md | `_bmad-ext/modules/governance/scanners/` | Stale context detection |
| step-05-review.md | `_bmad-ext/modules/implementation/workflows/story-cycle/steps/` | Code review step |
| step-06a-reality-check.md | `_bmad-ext/modules/implementation/workflows/story-cycle/steps/` | Reality validation |
| step-06-done.md | `_bmad-ext/modules/implementation/workflows/story-cycle/steps/` | Story completion |

### 7.4 Untouched (Not BMAD Framework)

| Component | Reason |
|-----------|--------|
| Core application code (`src/`) | Not part of BMAD |
| Package configs (`package.json`, etc.) | Standard Node.js |
| Build configs (`vite.config.ts`, etc.) | Standard build tools |
| Test files (`*.test.ts`) | Standard testing |
| `.opencode/.archive/` | Historical backups |

---

## 8. Phase 3 Implementation Plan

### Step 1: Clean Up Duplicates (Priority: CRITICAL)

```bash
# Remove duplicate agents from .claude/agents/
# Keep only lightweight hop-references

# For each agent in _bmad-ext/agents/:
# 1. Create minimal .claude/agents/{name}.md with hop-reference
# 2. Delete full content from .claude/agents/

# Example target structure:
.claude/agents/
├── ext-master.md (20 lines - hop to _bmad-ext/agents/ext-master.md)
├── dev-ext.md (20 lines - hop to _bmad-ext/agents/dev-ext.md)
└── [other agents as hop-refs]
```

### Step 2: Create Hop-Reference Template

```markdown
---
name: "{agent-name}"
description: "{short description}"
source: "_bmad-ext/agents/{agent-name}.md"
version: "{version}"
wraps: "_bmad/bmm/agents/{core-agent}.md"
---

# @{agent-name}

> {Brief description}
>
> **Source**: `_bmad-ext/agents/{agent-name}.md`
> **Core**: `_bmad/bmm/agents/{core-agent}.md`

## Quick Start

```bash
# Load agent
@{agent-name}

# Or via command
/{command-trigger}
```

## Integration Points

| Reads From | Path |
|------------|------|
| LOOP_STATE | `_bmad-ext/state/LOOP_STATE.yaml` |
| Handoff | `_bmad-ext/.handoffs/` |

## Full Documentation

See: `_bmad-ext/agents/{agent-name}.md`
```

### Step 3: Wire Up Bridge Commands

Ensure `.claude/commands/bmad/` contains bridge commands that:

1. Load appropriate `_bmad-ext/modules/` workflows
2. Pass context to agents
3. Update LOOP_STATE

### Step 4: Create Missing Files

Implement the 7 missing files identified in Section 7.3.

---

## 9. Token Budget Analysis

### Current State

| Component | Lines | Est. Tokens | Count | Total |
|-----------|-------|-------------|-------|-------|
| Duplicate agents | ~3000 | ~12,000 | 11 sets | 132,000 |
| Full-content commands | ~500 | ~2,000 | 10 | 20,000 |
| Hooks (lightweight) | ~100 | ~400 | 5 | 2,000 |
| Skills (lightweight) | ~50 | ~200 | 20 | 4,000 |
| **CURRENT TOTAL** | | | | **~158,000** |

### Target State (After Optimization)

| Component | Lines | Est. Tokens | Count | Total |
|-----------|-------|-------------|-------|-------|
| Hop-ref agents | ~20 | ~80 | 11 | 880 |
| Hop-ref commands | ~20 | ~80 | 10 | 800 |
| Hooks (same) | ~100 | ~400 | 5 | 2,000 |
| Skills (same) | ~50 | ~200 | 20 | 4,000 |
| **TARGET TOTAL** | | | | **~7,680** |

### Savings: **~150,000 tokens (~95% reduction)**

---

## 10. Next Actions

1. **[CRITICAL]** Remove duplicate agents from `.claude/agents/`
2. **[CRITICAL]** Replace with hop-references to `_bmad-ext/agents/`
3. **[HIGH]** Create missing governance files
4. **[HIGH]** Archive `governance-core/` module
5. **[MEDIUM]** Audit and convert commands to hop-refs
6. **[MEDIUM]** Verify OpenCode integration patterns
7. **[LOW]** Create comprehensive symlink strategy

---

## Appendix A: Platform-Specific Behaviors

### Claude Code

- **Agent Loading**: Use `@agent-name` in prompt
- **Handoff**: Direct Task delegation
- **Context**: Conversation maintained across agent switches
- **Best For**: Code generation, debugging, file operations

### OpenCode

- **Agent Loading**: Session starts with agent
- **Handoff**: Via Skill invocation
- **Context**: Each agent session isolated
- **Best For**: Documentation, analysis, workflows

### Shared Infrastructure

Both platforms use:
- `_bmad-ext/state/LOOP_STATE.yaml` for session state
- `_bmad-ext/modules/` for workflows
- `.claude/hooks/` for event steering

---

**Version**: 1.0.0
**Created**: 2026-01-14
**Status**: Ready for implementation
**Next Review**: After duplicate cleanup
