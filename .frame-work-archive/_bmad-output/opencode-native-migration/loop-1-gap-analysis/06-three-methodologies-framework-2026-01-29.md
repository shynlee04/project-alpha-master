---
id: "fw_20260129_103000_3methods"
title: "The 3 Methodologies Framework - OpenCode Native Migration"
version: "1.0.0"
status: "SINGLE_SOURCE_OF_TRUTH"
date: "2026-01-29T10:30:00+07:00"
author: "tech-writer-ext"
category: "framework"
tier: 1

purpose: |
  This document is the DEFINITIVE REFERENCE for all OpenCode Native migration work.
  All synthesis documents (01-less-for-more, 02-accurately-specific, 03-auto-governance)
  MUST align with definitions in this framework.

supersedes:
  - "All previous methodology definitions"
  - "Scattered OpenCode primitive references"

related_documents:
  - "01-less-for-more-synthesis-2026-01-29.md"
  - "02-accurately-specific-synthesis-2026-01-29.md"
  - "03-auto-governance-synthesis-2026-01-29.md"
  - "AGENTS.md"
  - "new-fundamental-truths.md"
---

# The 3 Methodologies Framework: OpenCode Native Migration

**Document ID**: fw_20260129_103000_3methods
**Version**: 1.0.0
**Status**: SINGLE SOURCE OF TRUTH
**Date**: 2026-01-29
**Author**: tech-writer-ext

---

## Executive Summary

This framework defines the **3 Methodologies** for migrating _bmad-ext to OpenCode Native primitives. Each methodology addresses a specific dimension of the migration while using complementary OpenCode features.

| # | Methodology | Phase | Core Principle | Key Primitives |
|---|-------------|-------|----------------|----------------|
| **1** | Less for More | 2.1 | Load only what's needed, when needed | Skills, Agents, Permissions |
| **2** | Accurately Specific with Concision | 2.2 | Type-safe, metadata-driven precision | Custom Tools, Commands, Frontmatter |
| **3** | Auto Governance | 2.3 | Event-driven enforcement, not documentation | Plugins (before/after hooks) |

**The Transformation**: From BMAD documenting governance (1.1% compliance) to OpenCode enforcing it (100% compliance via tool interception).

---

## Section 1: Methodology Overview Matrix

### 1.1 Complete Comparison Table

| Dimension | Methodology 1: Less for More | Methodology 2: Accurately Specific | Methodology 3: Auto Governance |
|-----------|------------------------------|-----------------------------------|-------------------------------|
| **Core Principle** | Consume only what's needed and valid | Use metadata/frontmatter for precise control | Before/after hooks for automated enforcement |
| **Phase** | 2.1 | 2.2 | 2.3 |
| **Primary Problem Solved** | 82 skills preloaded (35% context waste) | 67% artifact content is wasted prose | 1.1% governance compliance |
| **Token Impact** | -87% framework overhead | -97.5% per artifact load | 0% additional (hooks are free) |
| **Accuracy Impact** | 100% via on-demand loading | 100% via schema validation | 100% via tool interception |
| **Automation Level** | Semi-auto (intent detection) | Semi-auto (validation on load/save) | Full-auto (hooks run on every tool call) |
| **OpenCode Primitives** | agents, skills, permissions, tools | custom-tools, commands, @file refs | plugins (before/after hooks) |
| **Danger Level** | Low | Medium (schema complexity) | High (overkill risk) |

### 1.2 Token Budget Impact Analysis

```
CURRENT STATE (_bmad-ext):
+--------------------------------------------+
| Framework: 35% (140,000 tokens)            |
| Available for work: 65% (260,000 tokens)   |
+--------------------------------------------+

AFTER METHODOLOGY 1 (Less for More):
+--------------------------------------------+
| Framework: 5% (20,000 tokens)              |
| Available for work: 95% (380,000 tokens)   |
+--------------------------------------------+
Savings: 120,000 tokens per session

AFTER METHODOLOGY 2 (Accurately Specific):
Per-artifact improvement:
- Before: 1,200 lines per artifact load
- After: 30 lines via @file[section]
- Savings: 97.5% per artifact

AFTER METHODOLOGY 3 (Auto Governance):
- Hook overhead: ~0 tokens (system-level)
- State persistence: ~500 tokens (AGENT-STATE.yaml)
- Net: Neutral token cost, 100% compliance gain
```

---

## Section 2: Methodology 1 - "Less for More"

### 2.1 Core Principle

**"Consume only what's needed and valid. Agents automatically know by drilling down to assigned hierarchy. 'Loaded-on-demand' improves accuracy. Granular controls give more matches without compromising context windows."**

### 2.2 OpenCode Primitives (from https://opencode.ai/docs/)

#### 2.2.1 Native Tools (14+ Built-in)

OpenCode provides 14+ built-in tools that replace BMAD bridge wrappers:

| Tool | Purpose | Replaces (BMAD) |
|------|---------|-----------------|
| `read` | Read file contents | bmad-ext-governance-bridge file reads |
| `write` | Create/overwrite files | Manual file creation patterns |
| `edit` | Precise string replacement | Manual edit tracking |
| `bash` | Execute shell commands | bmad-ext-implementation-bridge |
| `grep` | Regex content search | Custom search wrappers |
| `glob` | File pattern matching | Custom file discovery |
| `list` | List directories | Manual directory scanning |
| `skill` | Load SKILL.md on-demand | 82 preloaded skills |
| `task` | Spawn subagents | ext-master cascade |
| `todowrite` / `todoread` | Task management | Manual tracking |
| `webfetch` | Fetch web content | External research |
| `question` | Ask user questions | Implicit user interaction |
| `patch` | Apply diffs | Manual patch application |
| `lsp` (experimental) | Code intelligence | Manual symbol lookup |

**Permission Control** (from https://opencode.ai/docs/permissions/):
```json
{
  "permission": {
    "*": "ask",           // Default: prompt for approval
    "read": "allow",      // Always allow reads
    "edit": "deny",       // Block edits (for review agents)
    "bash": {
      "*": "ask",
      "git status *": "allow",
      "pnpm test *": "allow"
    }
  }
}
```

#### 2.2.2 Agents (Primary, Subagent, Hidden)

From https://opencode.ai/docs/agents/:

**Agent Modes**:
| Mode | Description | Use Case |
|------|-------------|----------|
| `primary` | Main conversation agent | Tab-switching between Build/Plan |
| `subagent` | Invoked by primary agents | Specialized tasks via Task tool |
| `all` | Can be either | Flexible agents |
| `hidden: true` | Not shown in @ menu | Internal-only subagents |

**Agent Definition Format** (.opencode/agents/*.md):
```yaml
---
description: "Developer agent for implementation tasks"
mode: subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.3
tools:
  write: true
  edit: true
  bash: true
permission:
  edit: "allow"
  bash:
    "*": "ask"
    "pnpm *": "allow"
---

You are a senior developer. Focus on:
- Clean architecture compliance
- Type safety
- Test coverage
```

#### 2.2.3 Skills - THE TRUMP CARD

From https://opencode.ai/docs/skills/:

**Key Insight**: Skills are loaded on-demand via the `skill` tool. The agent sees a list of available skills in the tool description, but the content is NOT loaded until explicitly invoked.

**Skill Discovery** (what agent sees):
```xml
<available_skills>
  <skill>
    <name>story-cycle</name>
    <description>Complete story development with TDD...</description>
  </skill>
  <skill>
    <name>code-review-enhanced</name>
    <description>Adversarial code review...</description>
  </skill>
</available_skills>
```

**Skill File Structure** (.opencode/skills/{name}/SKILL.md):
```yaml
---
name: story-cycle
description: Complete story development with TDD, validation, and review
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: implementation
---

## What I Do
- Guide story implementation from init to done
- Enforce TDD (RED-GREEN-REFACTOR)
- Validate acceptance criteria
...
```

**Why This Is The Trump Card**:
- Current: 82 skills preloaded = ~60,000 tokens consumed
- After: 0 skills preloaded, ~16 on-demand = 0 baseline tokens
- Savings: 100% of skill overhead eliminated until needed

#### 2.2.4 Permissions (Granular Control with Wildcards)

From https://opencode.ai/docs/permissions/:

**Permission Actions**:
| Action | Behavior |
|--------|----------|
| `"allow"` | Run without approval |
| `"ask"` | Prompt for approval |
| `"deny"` | Block the operation |

**Per-Agent Permissions**:
```json
{
  "agent": {
    "dev-ext": {
      "permission": {
        "edit": "allow",
        "bash": {
          "*": "ask",
          "pnpm test *": "allow"
        }
      }
    },
    "analyst-ext": {
      "permission": {
        "edit": "deny",
        "bash": "deny"
      }
    }
  }
}
```

**Task Permissions** (control subagent access):
```json
{
  "agent": {
    "build": {
      "permission": {
        "task": {
          "*": "deny",
          "dev-ext": "allow",
          "tea-ext": "allow"
        }
      }
    }
  }
}
```

### 2.3 Mapping to _bmad-ext Current State

| BMAD-ext Component | Lines | OpenCode Replacement | Token Savings |
|--------------------|-------|---------------------|---------------|
| Bridge files (5) | 650 | Native tools | -16,250 tokens |
| MODULE.md files (5) | 2,500 | Agent frontmatter | -62,500 tokens |
| Skills (82 preloaded) | 24,600 | 16 on-demand skills | -53,500 tokens |
| Workflows (50+ steps) | 5,000 | Commands (10 essential) | -30,750 tokens |
| LOOP_STATE.yaml | 1,200 | AGENT-STATE.yaml (200) | -25,000 tokens |
| **Total** | **33,950** | **~3,000** | **~188,000 tokens** |

### 2.4 Token Reduction: 50%+ Achievement Path

1. **Eliminate bridge indirection**: 0 → native tools
2. **On-demand skill loading**: 82 → 16 (loaded only when needed)
3. **Command-based workflows**: 550 lines per workflow → 30 lines per command
4. **Agent frontmatter**: Capabilities inline, no MODULE.md chain

---

## Section 3: Methodology 2 - "Accurately Specific with Concision"

### 3.1 Core Principle

**"Use metadata, frontmatter, combo of tool executions in order with context observation. Pair with dev scripts for auto-run validation. Control with less tokens but specifically accurate."**

### 3.2 OpenCode Primitives

#### 3.2.1 Custom Tools (TypeScript + Zod)

From https://opencode.ai/docs/custom-tools/:

**Tool Definition** (.opencode/tools/{name}.ts):
```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Validate artifact before loading",
  args: {
    artifact_path: tool.schema.string().describe("Path to artifact"),
    expected_type: tool.schema.enum(['story', 'context', 'sprint']),
  },
  async execute(args, context) {
    // 1. Check registry
    const registryEntry = await loadRegistry(args.artifact_path)
    
    // 2. Validate TTL
    const ttlStatus = checkTTL(registryEntry)
    
    // 3. Validate checksum
    const checksumValid = await verifyChecksum(args.artifact_path)
    
    return {
      valid: ttlStatus !== 'expired' && checksumValid,
      artifact_id: registryEntry.id,
      ttl_status: ttlStatus,
    }
  },
})
```

**Context Object** (available in execute):
```typescript
interface ToolContext {
  agent: string       // Current agent name
  sessionID: string   // Session identifier
  messageID: string   // Message identifier
  directory: string   // Working directory
  worktree: string    // Git worktree root
}
```

**Multiple Tools Per File**:
```typescript
// .opencode/tools/bmad-governance.ts

export const validateArtifact = tool({
  description: "Validate artifact against registry",
  // ...
})

export const trackContextBudget = tool({
  description: "Track and enforce context budget",
  // ...
})

export const enforceGate = tool({
  description: "Enforce governance gate",
  // ...
})

// Creates tools: bmad-governance_validateArtifact, bmad-governance_trackContextBudget, etc.
```

#### 3.2.2 Commands (Slash Commands with References)

From https://opencode.ai/docs/commands/:

**Command Definition** (.opencode/commands/{name}.md):
```yaml
---
description: "Execute story development cycle"
agent: dev-ext
subtask: true
model: anthropic/claude-sonnet-4-20250514
---

Execute story cycle for story: $1

## Context Files (auto-loaded)
@file:$1[frontmatter,acceptance_criteria]
@file:_bmad-output/sprint-artifacts/sprint-status.yaml

## Shell Status
!`git status --short`
!`pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l`

## Instructions
1. Load story-cycle skill
2. Execute TDD workflow
3. Update sprint status on completion
```

**Reference Types**:
| Syntax | Purpose | Example |
|--------|---------|---------|
| `$ARGUMENTS` | All arguments | `/story-cycle UXUI-03-01.md` |
| `$1`, `$2`, `$N` | Positional arguments | `$1` = first arg |
| `@file:path` | Include file content | `@file:story.md` |
| `@file:path[section]` | Include file section | `@file:story.md[acceptance_criteria]` |
| `` !`command` `` | Include shell output | `` !`git status` `` |

**Key Insight**: Commands replace entire workflow chains:
```
BMAD Workflow:
workflow.md (200 lines) → step-01.md (50 lines) → step-02.md (50 lines) → ...
Total: 550+ lines

OpenCode Command:
command.md (30 lines) + skill-on-demand
Total: 30 lines + skill-on-need
```

#### 3.2.3 @file Section References (Precision Loading)

**Pattern Comparison**:
```markdown
# ANTI-PATTERN: Full document dump (4,800 tokens)
@file:stories/UXUI-03-01.md

# PATTERN: Section-specific (120 tokens)
@file:stories/UXUI-03-01.md[frontmatter]
@file:stories/UXUI-03-01.md[acceptance_criteria]
@file:stories/UXUI-03-01.md[affected_files]

# Savings: 97.5% token reduction per artifact
```

#### 3.2.4 Compact Command Manipulation

**Frontmatter Controls**:
```yaml
---
description: "Code review command"
agent: plan           # Use plan agent (read-only by default)
subtask: true         # Run as subagent (isolated context)
model: claude-haiku   # Use faster model for reviews
---
```

The `subtask: true` option:
- Runs in isolated context (doesn't pollute primary session)
- Forces subagent mode even if agent is defined as primary
- Enables parallel execution without context collision

### 3.3 Type Safety Matrix

| Data Contract | Zod Schema | Validation Point | Beast Mode Req |
|--------------|------------|------------------|----------------|
| Artifact Registry | `ArtifactRegistrySchema` | Load/Save | AUTO-02 |
| Story Frontmatter | `StoryFrontmatterSchema` | Load/Save | REQ-ART-02 |
| Context Budget | `ContextBudgetSchema` | Every operation | CTX-02 |
| Delegation Handoff | `HandoffSchema` | Create/Load | COORD-01 |
| Gate Status | `GateStatusSchema` | Pre/Post execution | ENF-01 |

### 3.4 How This Achieves 100% Accuracy

1. **Schema validation blocks invalid artifacts** - No more silent failures
2. **TTL checks reject stale content** - No context poisoning
3. **@file sections load only value-dense content** - No prose waste
4. **Shell output provides current state** - No stale assumptions

---

## Section 4: Methodology 3 - "Auto Governance"

### 4.1 Core Principle

**"Before/after hooks, observed events trigger actions. Tracking with time AND event confirmation. Double-headed sword if packed too much."**

### 4.2 OpenCode Plugins

From https://opencode.ai/docs/plugins/:

#### 4.2.1 Plugin Structure

**Basic Plugin** (.opencode/plugins/{name}.ts):
```typescript
import type { Plugin } from "@opencode-ai/plugin"

export const GovernancePlugin: Plugin = async (ctx) => {
  // ctx provides: project, client, $, directory, worktree
  
  return {
    // Hook implementations
    "tool.execute.before": async (input, output) => {
      // BLOCK or MODIFY before tool runs
    },
    
    "tool.execute.after": async (input, output) => {
      // LOG or AUDIT after tool completes
    },
    
    "experimental.session.compacting": async (input, output) => {
      // INJECT state into continuation prompt
    },
    
    event: async ({ event }) => {
      // React to session events
    },
  }
}
```

#### 4.2.2 Hook Types

**Pre-Execution (`tool.execute.before`)**:
- Runs BEFORE every tool invocation
- Can BLOCK by throwing error
- Can MODIFY output.args to change parameters
- Use for: validation, permission enforcement, dry-reading checks

**Post-Execution (`tool.execute.after`)**:
- Runs AFTER every tool completes
- Can LOG results and decisions
- Can UPDATE state files
- Use for: artifact registration, time-boxing, decision logging

**Session Compacting (`experimental.session.compacting`)**:
- Runs when context is about to be compacted
- Can INJECT context into continuation prompt
- Critical for state persistence across compaction
- Use for: workflow position, critical rules, session artifacts

**Events**:
- `session.created` - Initialize state
- `session.idle` - Cleanup ephemeral artifacts
- `session.error` - Create error handoffs
- `file.edited` - Track modifications

#### 4.2.3 Governance Implementations

**Stale Artifact Guard**:
```typescript
export const StaleArtifactGuard: Plugin = async (ctx) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "read") return
      
      const filePath = output.args.filePath as string
      if (!filePath.includes("_bmad-output/sprint-artifacts/stories/")) return
      
      const stats = fs.statSync(filePath)
      const ageMs = Date.now() - stats.mtimeMs
      const STALE_THRESHOLD = 2 * 60 * 60 * 1000 // 2 hours
      
      if (ageMs > STALE_THRESHOLD) {
        throw new Error(
          `GOVERNANCE BLOCK: Artifact stale (${Math.round(ageMs / 3600000)}h old). ` +
          `Validate and refresh before use.`
        )
      }
    },
  }
}
```

**Compaction State Injector**:
```typescript
export const CompactionStateInjector: Plugin = async (ctx) => {
  return {
    "experimental.session.compacting": async (input, output) => {
      const state = await loadAgentState()
      
      output.context.push(`
## GOVERNANCE STATE (Auto-Injected)

### Current Position
- Workflow: ${state.workflow_id}
- Step: ${state.current_step}
- Story: ${state.story_id}

### MANDATORY After Compaction
1. Re-read AGENTS.md governance section
2. Verify AGENT-STATE.yaml is current
3. Do NOT trust in-context artifacts >2h old
`)
    },
  }
}
```

### 4.3 Governance Rules to Hook Mapping

| AGENTS.md Rule | Hook Type | Plugin | Action |
|----------------|-----------|--------|--------|
| No stale artifacts >2h | `tool.execute.before` | StaleArtifactGuard | BLOCK read |
| No artifacts >5000 lines | `tool.execute.before` | GodArtifactGuard | BLOCK read |
| Tier 1 document protection | `tool.execute.before` | Tier1ProtectionGuard | BLOCK write/edit |
| Clean Architecture paths | `tool.execute.before` | CleanArchitectureGuard | BLOCK/WARN |
| Schema validation first | `tool.execute.before` | SchemaValidationGuard | BLOCK write |
| useShallow for Zustand | `tool.execute.before` | SchemaValidationGuard | BLOCK write |
| Dry reading required | `tool.execute.before` | DryReadingGuard | BLOCK write |
| Time-boxing compliance | `tool.execute.after` | TimeBoxingEnforcer | LOG/WARN |
| Artifact registration | `tool.execute.after` | ArtifactRegistrar | LOG |
| State sync | `tool.execute.after` | StateSyncPlugin | UPDATE |
| Decision logging | `tool.execute.after` | DecisionLogger | LOG |
| Compaction state | `session.compacting` | CompactionStateInjector | INJECT |
| Session init | `session.created` | SessionInitPlugin | INIT |
| Ephemeral cleanup | `session.idle` | EphemeralArchiver | ARCHIVE |
| Error handoff | `session.error` | ErrorHandoffCreator | CREATE |

### 4.4 The "Overkill" Trap

**WARNING**: Plugins are powerful but dangerous if overloaded.

**Signs of Overkill**:
- Hooks that take >100ms to execute
- More than 3 pre-execution checks per tool
- State files updated on every single tool call
- Complex conditional logic in hooks

**Safe Patterns**:
- One governance plugin with unified structure
- Batch state updates (every 5 tool calls, not every 1)
- Fast path-based filtering (return early if not relevant)
- Async logging (don't block on log writes)

**Plugin File Structure**:
```
.opencode/plugins/
├── index.ts                    # Unified export
├── pre-execution/              # tool.execute.before
│   ├── stale-artifact-guard.ts
│   ├── tier1-protection-guard.ts
│   └── dry-reading-guard.ts
├── post-execution/             # tool.execute.after
│   ├── timebox-enforcer.ts
│   ├── artifact-registrar.ts
│   └── state-sync-plugin.ts
└── session-lifecycle/          # Event hooks
    ├── compaction-state-injector.ts
    └── error-handoff-creator.ts
```

---

## Section 5: Round Structure

### 5.1 Round 1: Foundation (Get _bmad-ext to 100% Health)

**Applies to: All 3 Methodologies (2.1, 2.2, 2.3)**

| Task | Methodology | Deliverable | Effort |
|------|-------------|-------------|--------|
| Create AGENT-STATE.yaml schema | 2.1 | State file spec | 2h |
| Define 16 consolidated agents | 2.1 | .opencode/agents/*.md | 8h |
| Create 10 essential commands | 2.2 | .opencode/commands/*.md | 4h |
| Implement validation tools | 2.2 | .opencode/tools/validation.ts | 6h |
| Create core governance plugins | 2.3 | .opencode/plugins/governance/ | 8h |
| Consolidate 82 → 16 skills | 2.1 | .opencode/skills/ | 16h |
| Archive deprecated _bmad-ext files | All | _bmad-ext/.archive/ | 4h |

**Success Criteria (Round 1)**:
- [ ] 16 agents with proper frontmatter
- [ ] 10 essential commands operational
- [ ] Core validation tools passing
- [ ] Governance hooks blocking violations
- [ ] 16 consolidated skills with on-demand loading

### 5.2 Round 2: Advanced (Types, Contracts, Cross-Deps)

**Applies to: Methodology 2.1 + 2.2**

| Task | Methodology | Deliverable | Effort |
|------|-------------|-------------|--------|
| Define Zod schemas for all artifacts | 2.2 | .opencode/schemas/*.ts | 8h |
| Create artifact registry tool | 2.2 | .opencode/tools/artifact-registry.ts | 4h |
| Implement context budget tracking | 2.2 | .opencode/tools/context-budget.ts | 4h |
| Create @file section parsers | 2.2 | .opencode/tools/section-loader.ts | 4h |
| Define handoff schemas | 2.1 + 2.2 | .opencode/schemas/handoff.ts | 2h |
| Implement delegation protocol | 2.1 | Task tool usage patterns | 4h |

**Success Criteria (Round 2)**:
- [ ] All artifacts have Zod schemas
- [ ] Artifact registry auto-populates
- [ ] Context budget tracked in real-time
- [ ] @file sections load correctly
- [ ] Handoffs validate against schema

### 5.3 Round 2+: Magic Wand (Auto-Correct Types, Clean Code)

**Applies to: All 3 Methodologies**

| Task | Methodology | Deliverable | Effort |
|------|-------------|-------------|--------|
| Auto-fix TypeScript errors on save | 2.3 | Post-execution hook | 4h |
| Auto-format on write | 2.3 | Pre-execution hook | 2h |
| Auto-register artifacts | 2.3 | Post-execution hook | 2h |
| Auto-update sprint status | 2.3 | Post-execution hook | 2h |
| Auto-archive stale ephemeral files | 2.3 | Session idle hook | 2h |
| Auto-inject governance on compact | 2.3 | Compaction hook | 2h |

**Success Criteria (Round 2+)**:
- [ ] TypeScript errors auto-fixed where possible
- [ ] Code auto-formatted on save
- [ ] Artifacts auto-registered
- [ ] Sprint status auto-updated
- [ ] Stale files auto-archived
- [ ] State survives compaction automatically

---

## Section 6: Coherence Requirements

### 6.1 Unified Terminology

All synthesis documents MUST use these exact terms:

| Concept | Correct Term | Incorrect Alternatives |
|---------|--------------|------------------------|
| OpenCode primitive for specialized behavior | **skill** | capability, module, addon |
| OpenCode primitive for slash-invoked prompts | **command** | workflow, process, action |
| OpenCode primitive for AI assistants | **agent** | persona, role, assistant |
| OpenCode primitive for function calls | **tool** | function, capability, action |
| OpenCode primitive for hook-based automation | **plugin** | extension, addon, hook file |
| OpenCode primitive for access control | **permission** | constraint, limit, rule |

### 6.2 Consistent OpenCode Primitive Naming

**Agent Modes** (use exactly):
- `primary` - Main conversation agents
- `subagent` - Task-invoked agents
- `all` - Flexible mode
- `hidden` - Not shown in @ menu

**Permission Actions** (use exactly):
- `"allow"` - Run without approval
- `"ask"` - Prompt for approval
- `"deny"` - Block the operation

**Hook Types** (use exactly):
- `tool.execute.before` - Pre-execution
- `tool.execute.after` - Post-execution
- `experimental.session.compacting` - Compaction

### 6.3 Clear Boundaries Between Methodologies

| Boundary | Methodology 1 | Methodology 2 | Methodology 3 |
|----------|---------------|---------------|---------------|
| **When to Apply** | Reducing what loads | How things load | When things are enforced |
| **Primary File Types** | agents/, skills/ | commands/, tools/ | plugins/ |
| **Execution Model** | Pull (on-demand) | Push (with validation) | Intercept (automatic) |
| **Token Impact** | Reduces baseline | Reduces per-operation | Neutral |
| **Compliance Model** | Structural | Contract-based | Enforcement-based |

### 6.4 Integration Points Defined

**Methodology 1 → Methodology 2**:
- Skills define WHAT can be loaded
- Commands define HOW to load it
- Tools validate BEFORE loading

**Methodology 2 → Methodology 3**:
- Tools define validation logic
- Plugins ENFORCE validation on every tool call
- Schemas shared between tools and plugins

**Methodology 3 → Methodology 1**:
- Plugins inject state for skill loading decisions
- Compaction hooks preserve skill selection context
- Session events trigger skill cache cleanup

---

## Section 7: Success Criteria

### 7.1 Quantitative Targets

| Metric | Current | Target | Validation Method |
|--------|---------|--------|-------------------|
| **Context overhead** | 35.2% | <5% | Token counting on session start |
| **Skill count** | 82 (31% used) | 16 (80%+ used) | File count + usage analytics |
| **Governance compliance** | 1.1% | 95%+ | Gate pass rate |
| **Wrapper layers** | 7 | 1 | Navigation audit |
| **Post-compact restoration** | 0% | 95%+ | Recovery test |
| **Artifact validation rate** | 0% | 100% | Schema validation logs |
| **Token reduction per artifact** | 0% | 97.5% | @file section vs full load comparison |

### 7.2 Qualitative Targets

- [ ] Agents navigate from request to implementation in 1 hop (no ext-master cascade)
- [ ] Skills load only when needed (0 baseline, max 5 concurrent)
- [ ] Permissions are enforced at tool level, not documented
- [ ] State survives session compaction automatically
- [ ] Governance gates cannot be bypassed (hooks intercept at system level)
- [ ] Artifacts validate against schema before consumption
- [ ] Context budget tracked and alerts at 80% threshold
- [ ] Stale artifacts blocked from loading (2h TTL enforcement)

### 7.3 Evidence Requirements

For each success criterion, the following evidence is REQUIRED:

| Criterion | Evidence Type | Collection Method |
|-----------|---------------|-------------------|
| Context overhead | Token count log | Pre-session measurement |
| Skill utilization | Usage analytics | skill tool invocation logs |
| Governance compliance | Gate pass/fail log | plugin audit logs |
| Artifact validation | Schema validation log | tool validation results |
| Post-compact restoration | Recovery test report | manual testing |

---

## Section 8: Quick Reference Tables

### 8.1 OpenCode Primitive → BMAD Replacement

| OpenCode Primitive | BMAD Component Replaced | Token Savings |
|--------------------|------------------------|---------------|
| `skill` tool (on-demand) | 82 preloaded skills | ~53,500 tokens |
| `agent` frontmatter | MODULE.md hierarchy | ~62,500 tokens |
| `command` definitions | workflow.md + steps/ | ~30,750 tokens |
| Native tools (14) | Bridge files (5) | ~16,250 tokens |
| `permission` config | Tool constraint docs | 0 (but 100% compliance) |
| `plugin` hooks | Shell scripts (never run) | 0 (but 100% enforcement) |

### 8.2 File Location Reference

| Purpose | OpenCode Location | BMAD Location (Archive) |
|---------|-------------------|-------------------------|
| Agent definitions | `.opencode/agents/` | `_bmad-ext/agents/` |
| Skill definitions | `.opencode/skills/{name}/SKILL.md` | `_bmad/agents/skills/` |
| Command definitions | `.opencode/commands/` | `_bmad-ext/modules/*/workflows/` |
| Custom tools | `.opencode/tools/` | (no equivalent) |
| Plugins | `.opencode/plugins/` | `.claude/hooks/` (non-functional) |
| Permissions | `opencode.json` | AGENTS.md (documented only) |
| State | `AGENT-STATE.yaml` | `_bmad-ext/state/LOOP_STATE.yaml` |

### 8.3 Documentation Reference URLs

| Concept | Official Documentation |
|---------|------------------------|
| Native Tools | https://opencode.ai/docs/tools/ |
| Agents | https://opencode.ai/docs/agents/ |
| Commands | https://opencode.ai/docs/commands/ |
| Permissions | https://opencode.ai/docs/permissions/ |
| Skills | https://opencode.ai/docs/skills/ |
| Custom Tools | https://opencode.ai/docs/custom-tools/ |
| Plugins | https://opencode.ai/docs/plugins/ |

---

## Appendix A: Token Budget Visualization

```
BMAD-ext Session Start:
+----------------------------------------------------+
| ████████████████████████████████████░░░░░░░░░░░░░░░ |
| |---------- 35% ----------|---- 65% available ----|  |
+----------------------------------------------------+

OpenCode Native Session Start:
+----------------------------------------------------+
| ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ |
| 5% |-------------- 95% available -----------------|  |
+----------------------------------------------------+

Tokens freed: ~120,000 per session
Sessions before compact: ~2x increase
Work capacity: +47% per session
```

---

## Appendix B: Decision Tree for Methodology Selection

```
START: What problem are you solving?
    │
    ├─ "Too much loaded by default"
    │   └─ Methodology 1: Less for More
    │       └─ Focus: Skills, Agents, Permissions
    │
    ├─ "Loading the wrong/stale content"
    │   └─ Methodology 2: Accurately Specific
    │       └─ Focus: Custom Tools, Commands, @file refs
    │
    └─ "Rules exist but aren't enforced"
        └─ Methodology 3: Auto Governance
            └─ Focus: Plugins (before/after hooks)
```

---

**Document End**

**Version**: 1.0.0
**Created**: 2026-01-29T10:30:00+07:00
**Author**: tech-writer-ext
**Status**: SINGLE SOURCE OF TRUTH
**Lines**: ~900

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-29 | tech-writer-ext | Initial framework creation |
