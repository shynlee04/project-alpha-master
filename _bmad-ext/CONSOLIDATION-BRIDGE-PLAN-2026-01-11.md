# Consolidation Bridge Plan: `.claude` ↔ `_bmad-ext`

**Created**: 2026-01-11
**Purpose**: Bridge existing systems WITHOUT migration or duplication
**Mindset**: Consolidate what `.claude` offers, extend `_bmad-ext` reach

---

## What We Learned

### Claude Code 2.1.3 Offers

| Feature | Version 2.1.3 | Relevance |
|---------|--------------|-----------|
| **Skills hot-reload** | ✅ No restart needed | Perfect for governance |
| **Merged slash commands + skills** | ✅ Same feature set | Unified entry point |
| **/release-notes** | ✅ Built-in command | Self-documenting |
| **Language configuration** | ✅ One-click switching | i18n ready |
| **Token limit optimization** | ✅ Auto-continue | No errors |
| **1,096 commits shipped** | Massive update | Production-ready |

**Sources:**
- [Claude Code Changelog](https://code.claude.com/docs/en/changelog)
- [Reddit Discussion](https://www.reddit.com/r/ClaudeAI/comments/1q8okkb/anthropic_just_released_claude_code_213_full/)
- [Medium Review](https://medium.com/@joe.njenga/claude-code-2-1-is-here-i-tested-all-16-new-changes-dont-miss-this-update-ea9ca008dab7)

### `.claude` System Already Has

```
.claude/
├── agents/           # 20+ agents (BMM analysis, planning, research)
├── commands/         # Slash command definitions
├── skills/           # Hierarchical skills taxonomy (hot-reload!)
├── hooks/            # session-start, pre-tool-use, user-prompt-submit
└── settings.local.json  # Permissions, output style
```

**Existing Capabilities**:
- ✅ Skills taxonomy with parent/child relationships
- ✅ Agent compatibility matrix
- ✅ Priority-based skill loading
- ✅ session-start hook that already loads `_bmad-ext/state/LOOP_STATE.yaml`
- ✅ Permission system for tools

### `_bmad-ext` System Has

```
_bmad-ext/
├── modules/
│   ├── governance/   # 3 workflows (context-first, expert-analysis, research-trigger)
│   ├── arc-v2/       # 3 remediation agents (store-refactorer, component-splitter, workspace-architect)
│   └── (other modules)
├── state/
│   ├── LOOP_STATE.yaml
│   └── ARTIFACT_REGISTRY.yaml
└── orchestrator/
```

**Existing Capabilities**:
- ✅ YAML-based workflow definitions
- ✅ Module-based architecture
- ✅ TTL-based artifact management
- ✅ Domain-scanner (6 domains)
- ✅ Hop-reading architecture (frontmatter-only loading)

---

## The Problem: Two Islands, No Bridge

```yaml
current_state:
  claude_system:
    - "Loads agents at startup"
    - "Skills hot-reload"
    - "Hooks trigger on events"
    - "Does NOT know about _bmad-ext modules"

  bmad_ext_system:
    - "Module-based workflows"
    - "Hop-reading architecture"
    - "Domain scanners"
    - "NOT accessible from Claude Code commands"

the_gap:
  - "No .claude command can invoke _bmad-ext workflows"
  - "No skill can load _bmad-ext agents"
  - "session-start hook loads LOOP_STATE but doesn't expose workflows"
  - "Duplication: Same agents exist in both places"
```

---

## The Solution: Bridge, Don't Migrate

**Key Principle**: `.claude` remains the **interface layer**, `_bmad-ext` remains the **implementation layer**.

```yaml
consolidation_strategy:
  NOT:
    - "Move _bmad-ext to .claude"
    - "Duplicate agents"
    - "Rewrite workflows as skills"

  INSTEAD:
    - "Create lightweight .claude commands that LOAD _bmad-ext modules"
    - "Use hop-reading: frontmatter-only at .claude, full content on-demand"
    - "Bridge hooks: session-start validates, commands invoke"
    - "Skills reference _bmad-ext paths (not copy content)"
```

---

## Bridge Architecture

### Layer 1: Command Bridge (`.claude/commands/`)

Create lightweight command files that **reference** `_bmad-ext` modules:

```yaml
# .claude/commands/bmad-governance-check.yaml
name: "bmad-governance-check"
shorthand: "/gov-check"
description: "Run governance deep-scan and validation"
type: "bridge"

# Hop-reading: Load metadata only
module:
  path: "_bmad-ext/modules/governance/workflows/context-first/workflow.md"
  load_strategy: "frontmatter_first"

# When invoked, load full workflow
on_invoke:
  load: "_bmad-ext/modules/governance/workflows/context-first/workflow.md"
  execute: "Step 1 of workflow"
```

**Token Efficiency**: Command file is ~20 lines. Workflow loads only when invoked.

### Layer 2: Skill Bridge (`.claude/skills/`)

Skills that **reference** `_bmad-ext` agents:

```yaml
# .claude/skills/governance-scan/SKILL.md
id: governance-scan
name: Governance Deep Scan
category: governance
priority: 15

# Hop-reading reference
agent_reference:
  type: "bmad-ext-module"
  path: "_bmad-ext/modules/governance/scanners/deep-scan"
  load_strategy: "on_demand"

description: |
  Loads governance scanner from _bmad-ext on demand.
  Uses hop-reading: frontmatter-only load, full content when invoked.
```

### Layer 3: Hook Bridge (`.claude/hooks/`)

Extend existing hooks to **validate** against `_bmad-ext`:

```yaml
# .claude/hooks/user-prompt-submit.yaml (existing)
# ADD: Bridge to _bmad-ext governance

steps:
  - name: check_governance_freshness
    description: "Check if context is fresh before proceeding"
    module: "_bmad-ext/modules/governance/scanners/artifact-scanner.md"
    on_stale:
      action: "warn_and_prompt_refresh"
```

---

## Phase 1: Command Bridge (Immediate)

### Create `.claude/commands/bmad-*.yaml`

| Command | Shorthand | Bridges To | Purpose |
|---------|----------|------------|---------|
| `bmad-governance.yaml` | `/gov` | governance/workflows/context-first | Context-first validation |
| `bmad-expert.yaml` | `/expert` | governance/workflows/expert-analysis | Expert analysis |
| `bmad-research.yaml` | `/research` | governance/workflows/research-trigger | Internet research |
| `bmad-remediate.yaml` | `/fix` | arc-v2/agents (router) | Remediation router |
| `bmad-scan.yaml` | `/scan` | arc-v2/agents/domain-scanner | Domain scanner |

### Command Template

```yaml
# .claude/commands/bmad-{name}.yaml
name: "bmad-{name}"
shorthand: "/{shorthand}"
description: "{brief description}"
category: "bmad-bridge"
version: "1.0.0"

# Hop-reading bridge
bridge:
  type: "workflow"  # or "agent", "scanner", "module"
  source: "_bmad-ext/{path-to-target}"
  load_strategy: "on_demand"

# Command metadata
metadata:
  module: "{module_name}"
  phase: "{0-4}"
  ttl_hours: 4  # For cache validation

# When command invoked
on_invoke:
  1. "Load LOOP_STATE to check freshness"
  2. "Load target workflow/agent frontmatter"
  3. "Validate prerequisites"
  4. "Execute workflow/agent"
  5. "Update LOOP_STATE"
```

---

## Phase 2: Skill Bridge (Token-Efficient)

### Create `.claude/skills/bmad-bridge/` Skills

**Principle**: Skills are **references**, not copies.

```yaml
# .claude/skills/bmad-bridge/governance-scan/SKILL.md
---
id: governance-scan
name: Governance Deep Scan
category: governance
priority: 15
parent: null
agents: [all]
description: Run governance scanner from _bmad-ext

# Hop-reading reference
bridge:
  type: "scanner"
  source: "_bmad-ext/modules/governance/scanners/deep-scan"
  load: "on_demand"
---

# Governance Deep Scan
#
# This skill bridges to _bmad-ext/modules/governance/scanners/deep-scan
#
# Full scanner loads on demand via hop-reading.
# Frontmatter (above) is all that loads at skill activation.

## Usage

Invoke via `/gov` command or automatic trigger from hooks.

## What It Scans

- Documents vs code drift
- API contracts vs implementation
- Data schema vs reality
- File structure violations
- Feature dependencies

## Output

Generates report in `_bmad-output/governance/deep-scan-{date}.yaml`
```

---

## Phase 3: Duplication Cleanup

### Identify Duplicates

| `.claude/agents/` | `_bmad-ext/` | Action |
|-------------------|--------------|--------|
| `component-splitter.md` | `arc-v2/agents/component-splitter.md` | Keep .claude as bridge, delete after |
| `workspace-architect.md` | `arc-v2/agents/workspace-architect.md` | Keep .claude as bridge, delete after |
| `store-refactorer-loader.md` | `arc-v2/agents/store-refactorer.md` | Keep .claude as bridge, delete after |
| `file-sync-specialist.md` | (planned) | Keep .claude, bridge when ready |

### Cleanup Strategy

```yaml
phase_1_bridge:
  - "Create .claude/commands/ for each _bmad-ext workflow"
  - "Create .claude/skills/ as references"
  - "Test bridge functionality"

phase_2_validate:
  - "Verify all commands work"
  - "Verify hooks trigger correctly"
  - "Verify token efficiency (measure before/after)"

phase_3_cleanup:
  - "Archive old .claude/agents/ to .claude/.archive/"
  - "Update index.yaml"
  - "Document bridge in CLAUDE.md"
```

---

## Phase 4: Hook Integration

### Extend `session-start.yaml`

```yaml
# .claude/hooks/session-start.yaml (EXTEND existing)

# ADD these steps:

steps:
  # ... existing steps ...

  - name: validate_governance_state
    description: "Validate governance module health"
    module: "_bmad-ext/modules/governance"
    check:
      - LOOP_STATE.yaml exists and is fresh
      - ARTIFACT_REGISTRY.yaml exists
      - No stale artifacts (>48 hours)
    on_fail:
      action: "warn_only"
      message: "Governance state needs refresh"

  - name: register_bmad_commands
    description: "Ensure BMAD bridge commands are available"
    verify:
      - .claude/commands/bmad-*.yaml exist
      - Commands are registered
```

### Extend `user-prompt-submit.yaml`

```yaml
# .claude/hooks/user-prompt-submit.yaml (EXTEND existing)

# ADD governance check:

steps:
  # ... existing steps ...

  - name: governance_gate_check
    description: "Check if request requires governance validation"
    condition: "request mentions architecture, refactoring, agents, tools"
    if_true:
      - "Load _bmad-ext/modules/governance/workflows/context-first"
      - "Run context validation"
      - "Transform user prompt with context"
```

---

## Token Efficiency Calculation

### Before (Current Duplication)

```yaml
token_usage:
  claude_agents_load: "~100KB"  # All agents at startup
  bmad_ext_modules: "0"  # Not loaded by Claude Code
  total: "~100KB"
```

### After (Bridge + Hop-Reading)

```yaml
token_usage:
  claude_commands: "~5KB"    # Lightweight command files
  claude_skills: "~10KB"     # Reference-only skills
  bmad_on_demand: "~15KB"    # Loaded only when invoked
  total_session_start: "~15KB"  # 85% reduction!
  total_on_invoke: "~30KB"   # Still < 100KB even when invoked
```

---

## Implementation Plan

### Step 1: Create Command Bridge (30 min)

```bash
# Create bridge commands
.claude/commands/
├── bmad-governance.yaml      # /gov - Context-first workflow
├── bmad-expert.yaml          # /expert - Expert analysis
├── bmad-research.yaml        # /research - Research trigger
├── bmad-remediate.yaml       # /fix - Remediation router
└── bmad-scan.yaml            # /scan - Domain scanner
```

### Step 2: Create Skill Bridge (20 min)

```bash
# Create bridge skills
.claude/skills/bmad-bridge/
├── governance-scan/SKILL.md
├── expert-analysis/SKILL.md
├── research-trigger/SKILL.md
└── remediation-router/SKILL.md
```

### Step 3: Extend Hooks (20 min)

```bash
# Extend existing hooks
.claude/hooks/
├── session-start.yaml         # ADD: governance validation
├── user-prompt-submit.yaml    # ADD: governance gate
└── pre-tool-use.yaml          # ADD: tool permission check
```

### Step 4: Validate & Measure (10 min)

```bash
# Test bridge
/gov        # Should load governance workflow
/expert     # Should load expert analysis
/research   # Should load research trigger
/fix        # Should route to remediation
/scan       # Should run domain scanner

# Measure tokens
# Before vs After session-start load
```

### Step 5: Cleanup (10 min)

```bash
# Archive old agents
mkdir .claude/.archive/2026-01-11-pre-bridge
mv .claude/agents/component-splitter.md .claude/.archive/2026-01-11-pre-bridge/
mv .claude/agents/workspace-architect.md .claude/.archive/2026-01-11-pre-bridge/
mv .claude/agents/store-refactorer-loader.md .claude/.archive/2026-01-11-pre-bridge/
```

---

## Success Criteria

- [ ] All BMAD commands accessible via slash commands
- [ ] Skills bridge to `_bmad-ext` without duplication
- [ ] Token usage reduced by ≥70% at session-start
- [ ] Hooks validate and trigger `_bmad-ext` workflows
- [ ] No content duplication between systems
- [ ] Full `_bmad-ext` functionality preserved

---

## File Creation Checklist

### Commands (5 files)

- [ ] `.claude/commands/bmad-governance.yaml`
- [ ] `.claude/commands/bmad-expert.yaml`
- [ ] `.claude/commands/bmad-research.yaml`
- [ ] `.claude/commands/bmad-remediate.yaml`
- [ ] `.claude/commands/bmad-scan.yaml`

### Skills (4 directories)

- [ ] `.claude/skills/bmad-bridge/governance-scan/SKILL.md`
- [ ] `.claude/skills/bmad-bridge/expert-analysis/SKILL.md`
- [ ] `.claude/skills/bmad-bridge/research-trigger/SKILL.md`
- [ ] `.claude/skills/bmad-bridge/remediation-router/SKILL.md`

### Hook Extensions (3 files)

- [ ] `.claude/hooks/session-start.yaml` (extend)
- [ ] `.claude/hooks/user-prompt-submit.yaml` (extend)
- [ ] `.claude/hooks/pre-tool-use.yaml` (extend)

---

**Consolidation Version**: 1.0.0
**Total Estimated Time**: 90 minutes
**Token Savings Target**: 70-85% at session-start

---

`★ Insight ─────────────────────────────────────`
1. **Claude Code 2.1.3 skills hot-reload** = Perfect for governance workflows
2. **Bridge, don't migrate** = `.claude` is interface, `_bmad-ext` is implementation
3. **Hop-reading architecture** = Frontmatter-only at .claude, full content on-demand
`─────────────────────────────────────────────────`
