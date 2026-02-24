# OpenCode Native Concepts Research Report
**Date:** 2026-01-29  
**Purpose:** Research OpenCode native concepts to replace failed BMAD-ext meta-framework  
**Sources:** Official OpenCode Documentation, Community Best Practices, Anthropic Guidelines

---

## Executive Summary

OpenCode provides a **native, minimalist architecture** that directly addresses the context overhead and complexity issues that caused BMAD-ext to fail. The key insight: **OpenCode's "less for more" principle is not about doing less work—it's about letting the platform handle orchestration while developers focus on domain expertise.**

### Key Finding: The 82-Skill Problem
BMAD-ext's approach of creating 82+ specialized skills violates OpenCode's core design principle:

> *"Also having too many active skills adds cognitive overload to your agents, try to limit that as much as possible."* — Reddit r/opencodeCLI

> *"Here's the uncomfortable truth: your Skill is fighting for space in your coding agents context window. Every token you add competes with the system prompt, the conversation history, other Skills' metadata, project specific instructions and the user's actual request."* — Rick Hightower, Mastering Agentic Skills

---

## 1. OpenCode Agents System

### 1.1 Agent Modes: The Granular Control Mechanism

OpenCode provides **three agent modes** that enable precise control over agent capabilities:

| Mode | Purpose | Use Case |
|------|---------|----------|
| `primary` | Main assistants you interact with directly | Build, Plan, custom primary agents |
| `subagent` | Specialized assistants invoked for specific tasks | General, Explore, custom subagents |
| `all` | Can function as either (default if unspecified) | Flexible agents |

**Source:** https://opencode.ai/docs/agents/

#### Built-in Agents (The Minimal Set)

OpenCode ships with only **4 built-in agents**:

1. **Build** (primary) — Default agent with all tools enabled
2. **Plan** (primary) — Restricted agent for analysis without edits
3. **General** (subagent) — Multi-step task execution with full tool access
4. **Explore** (subagent) — Fast, read-only codebase exploration

**Key Quote:**
> *"Primary agents are the main assistants you interact with directly. You can cycle through them using the Tab key... Subagents are specialized assistants that primary agents can invoke for specific tasks."*

### 1.2 How Agent Modes Enable "Beast-Mode" Coordination

The mode system enables **automatic delegation without complex orchestration**:

```yaml
# Primary agent configuration (opencode.json)
{
  "agent": {
    "orchestrator": {
      "mode": "primary",
      "description": "Coordinates complex multi-agent workflows",
      "permission": {
        "task": {
          "*": "deny",              # Block all subagents by default
          "code-reviewer": "ask",   # Allow specific subagents
          "test-writer": "allow"
        }
      }
    },
    "code-reviewer": {
      "mode": "subagent",
      "description": "Reviews code for best practices",
      "tools": {
        "write": false,
        "edit": false
      }
    }
  }
}
```

**Key Insight:** The `task` permission with glob patterns (`*`, `code-*`) provides **declarative orchestration**—no need for complex delegation logic.

---

## 2. OpenCode Skills System

### 2.1 Progressive Disclosure Architecture (PDA)

OpenCode skills use a **three-level loading system** that keeps context lean:

```
┌─────────────────────────────────────────────────────────────┐
│ Level 1: Discovery (Always Active)                          │
│ • Only metadata: name + description from YAML frontmatter   │
│ • ~50-100 tokens per skill                                  │
│ • Allows quick scanning without context bloat               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Level 2: Deep Loading (On-Demand)                           │
│ • Full SKILL.md content loaded when matched                 │
│ • Progressive file reading as needed                        │
│ • Zero tokens until Claude needs it                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Level 3: Reference Files (Navigated)                        │
│ • Supporting materials loaded on-demand                     │
│ • One-level-deep navigation only                            │
│ • Prevents deep nesting overhead                            │
└─────────────────────────────────────────────────────────────┘
```

**Source:** https://opencode.ai/docs/skills/ and Rick Hightower's "Mastering Agentic Skills"

### 2.2 Skill Discovery and Loading

Skills are placed in specific directories:

```
Project:  .opencode/skills/<name>/SKILL.md
Global:   ~/.config/opencode/skills/<name>/SKILL.md
Claude:   .claude/skills/<name>/SKILL.md (compatible)
```

**Key Quote:**
> *"Agent skills let OpenCode discover reusable instructions from your repo or home directory. Skills are loaded on-demand via the native `skill` tool—agents see available skills and can load the full content when needed."*

### 2.3 The "Less for More" Principle in Skills

**Golden Rule:**
> *"Assume your coding agent is already brilliant. Only add context your coding agent doesn't have."*

**Best Practices:**
- **SKILL.md body under 500 lines**
- **Description max 1024 characters**
- **File references one level deep** (no nested chains)
- **Use gerund form** for names: `processing-pdfs`, `testing-code`

**Anti-Pattern (BMAD-ext's mistake):**
```yaml
# ❌ BAD: 82 skills with overlapping concerns
skills:
  - story-cycle
  - story-done
  - story-validation
  - pre-planning
  - context-creation
  - context-validation
  # ... 76 more skills
```

**Correct Approach:**
```yaml
# ✅ GOOD: 5-7 focused skills
skills:
  - story-development      # Covers cycle, validation, completion
  - architecture-review    # Covers ADR, patterns, governance
  - code-quality           # Covers testing, linting, typecheck
  - documentation          # Covers docs, handoffs, specs
```

---

## 3. OpenCode Tools and Custom Tools

### 3.1 Built-in Tools (The Minimal Set)

OpenCode provides **15 built-in tools**:

| Tool | Purpose |
|------|---------|
| `bash` | Execute shell commands |
| `edit` | Modify existing files |
| `write` | Create new files |
| `read` | Read file contents |
| `grep` | Search file contents (regex) |
| `glob` | Find files by pattern |
| `list` | List directory contents |
| `lsp` | LSP server interactions |
| `patch` | Apply patches |
| `skill` | Load a skill |
| `todowrite` | Manage todo lists |
| `todoread` | Read todo lists |
| `webfetch` | Fetch web content |
| `question` | Ask user questions |
| `task` | Launch subagents |

**Source:** https://opencode.ai/docs/tools/

### 3.2 Custom Tools

Custom tools are **JavaScript/TypeScript functions** the LLM can call:

```typescript
// .opencode/plugins/custom-tools.ts
import { type Plugin, tool } from "@opencode-ai/plugin"

export const CustomToolsPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      validateStory: tool({
        description: "Validates story file completeness",
        args: {
          storyPath: tool.schema.string(),
        },
        async execute(args, context) {
          // Validation logic
          return { valid: true, errors: [] }
        },
      }),
    },
  }
}
```

**Key Quote:**
> *"Custom tools let you define your own functions that the LLM can call. These are defined in your config file and can execute arbitrary code."*

### 3.3 MCP Servers Integration

MCP (Model Context Protocol) servers extend tools with external services:

```json
{
  "mcp": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

---

## 4. OpenCode Commands

### 4.1 Command Structure

Commands are **markdown files** with YAML frontmatter:

```markdown
---
description: Run tests with coverage
agent: build
model: anthropic/claude-3-5-sonnet-20241022
subtask: true  # Force subagent invocation
---

Run the full test suite with coverage report and show any failures.
Focus on the failing tests and suggest fixes.
```

**Source:** https://opencode.ai/docs/commands/

### 4.2 Command Features

| Feature | Purpose |
|---------|---------|
| `$ARGUMENTS` | Pass arguments to commands |
| `$1`, `$2`, etc. | Positional parameters |
| `!`command`` | Inject shell output |
| `@filename` | Include file content |
| `subtask: true` | Force subagent invocation |

**Example:**
```markdown
---
description: Create a new component
---

Create a new React component named $1 in directory $2.
Include TypeScript support and basic structure.
```

Usage: `/component Button src/components`

---

## 5. OpenCode Permissions System

### 5.1 Permission Levels

| Level | Behavior |
|-------|----------|
| `allow` | Run without approval |
| `ask` | Prompt for approval |
| `deny` | Block the action |

### 5.2 Granular Permission Rules

```json
{
  "permission": {
    "*": "ask",           # Default: ask for everything
    "bash": {
      "*": "ask",
      "git *": "allow",   # Allow git commands
      "rm *": "deny"      # Block rm
    },
    "edit": {
      "*": "deny",
      "src/**/*.ts": "allow"
    },
    "task": {
      "*": "deny",
      "code-reviewer": "allow"
    }
  }
}
```

**Source:** https://opencode.ai/docs/permissions/

### 5.3 Agent-Specific Permissions

Permissions can be overridden per agent:

```json
{
  "agent": {
    "plan": {
      "permission": {
        "edit": "deny",
        "bash": "ask"
      }
    }
  }
}
```

**Key Quote:**
> *"You can override permissions per agent. Agent permissions are merged with the global config, and agent rules take precedence."*

---

## 6. OpenCode Hooks (Plugin System)

### 6.1 Plugin Architecture

Plugins are **JavaScript/TypeScript modules** that hook into 25+ events:

```typescript
// .opencode/plugins/example.js
export const MyPlugin = async ({ project, client, $, directory, worktree }) => {
  console.log("Plugin initialized!")
  return {
    // Hook implementations
  }
}
```

**Source:** https://opencode.ai/docs/plugins/

### 6.2 Available Hooks

#### Tool Execution Hooks
- `tool.execute.before` — Pre-process tool execution
- `tool.execute.after` — Post-process tool execution

#### File Events
- `file.edited` — Run when files are edited
- `file.watcher.updated` — File watcher updates

#### Session Events
- `session.created`
- `session.compacted` — Context compaction
- `session.idle` — Session completed

#### Permission Events
- `permission.asked`
- `permission.replied`

### 6.3 Hook Examples

**Auto-format after Rust edits:**
```typescript
export const MyPlugin: Plugin = async ({ $ }) => {
  return {
    "tool.execute.after": async (input) => {
      if (input.tool === "edit" && input.args.filePath.endsWith(".rs")) {
        await $`cargo fmt`.quiet()
      }
    },
  }
}
```

**.env Protection:**
```typescript
export const EnvProtection = async () => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool === "read" && output.args.filePath.includes(".env")) {
        throw new Error("Do not read .env files")
      }
    },
  }
}
```

**Custom Compaction:**
```typescript
export const CompactionPlugin: Plugin = async () => {
  return {
    "experimental.session.compacting": async (input, output) => {
      output.context.push(`## Current Sprint Status
- Active story: ${getCurrentStory()}
- Blockers: ${getBlockers()}`)
    },
  }
}
```

---

## 7. Synthesis: BMAD-ext → OpenCode Native Mapping

### 7.1 Failed BMAD Patterns vs OpenCode Equivalents

| BMAD-ext Pattern | Problem | OpenCode Native Equivalent |
|------------------|---------|---------------------------|
| 82 specialized skills | Context overload, cognitive burden | 5-7 focused skills with PDA |
| Complex agent hierarchy (ext-master, analyst-ext, dev-ext) | Manual delegation, handoff complexity | Primary/subagent modes with `task` tool |
| YAML workflow status files | Stale state, manual updates | Hooks (`session.compacted`, `file.edited`) |
| Explicit tool permissions in every delegation | Repetitive, error-prone | Global + per-agent permission config |
| Custom orchestration logic | Brittle, hard to maintain | Native `task` tool with glob patterns |
| Manual context validation | Time-consuming, inconsistent | `experimental.session.compacting` hook |
| File-based handoffs | Stale documents, 2-hour rule violations | In-memory context + compaction hooks |
| Governance scanners (external scripts) | Separate from execution flow | Plugins with `tool.execute.before/after` |

### 7.2 Why OpenCode Native Solves Context Overhead

**BMAD-ext's Approach:**
```yaml
# ❌ Loaded into EVERY conversation
skills:
  - story-cycle      # 200 lines
  - story-done       # 150 lines
  - story-validation # 180 lines
  # ... 79 more skills
# Total: ~15,000 tokens of skill descriptions
```

**OpenCode Native Approach:**
```yaml
# ✅ Only metadata loaded (~50 tokens per skill)
# Full content loaded on-demand via skill() tool
skills:
  - story-development    # 400 lines (loaded only when needed)
  - architecture-review  # 350 lines (loaded only when needed)
# Total: ~300 tokens of metadata, expandable on demand
```

### 7.3 OpenCode Features Enabling "Beast-Mode" Coordination

1. **Automatic Subagent Invocation**
   - Primary agents automatically invoke subagents via `task` tool
   - No manual delegation logic required
   - Context isolation prevents pollution

2. **Progressive Disclosure**
   - Skills load incrementally
   - Only relevant expertise enters context
   - Prevents "lost in the middle" problem

3. **Declarative Permissions**
   - Glob patterns enable flexible control
   - Per-agent overrides without code
   - Security at configuration level

4. **Event-Driven Hooks**
   - Automatic enforcement via plugins
   - No manual governance checks
   - Real-time validation

5. **Context Compaction Control**
   - `session.compacting` hook preserves critical state
   - Custom compaction prompts for multi-agent sessions
   - Automatic context management

---

## 8. Recommended .opencode/ Directory Structure

### 8.1 Minimal Viable Structure

```
.opencode/
├── opencode.json              # Main configuration
├── AGENTS.md                  # Project rules (like Cursor)
├── agents/
│   ├── architect.md           # Primary: High-level design
│   ├── implementer.md         # Primary: Code implementation
│   └── reviewer.md            # Subagent: Code review
├── skills/
│   ├── story-development/     # Story lifecycle management
│   │   └── SKILL.md
│   ├── architecture-review/   # ADR and pattern enforcement
│   │   └── SKILL.md
│   └── code-quality/          # Testing, linting, typecheck
│       └── SKILL.md
├── commands/
│   ├── story.md               # /story create|validate|complete
│   ├── review.md              # /review [files]
│   └── test.md                # /test [pattern]
└── plugins/
    ├── governance.js          # Auto-enforce file size limits
    └── compaction.js          # Preserve sprint state across compaction
```

### 8.2 Example opencode.json

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-20250514",
  "default_agent": "implementer",
  
  "permission": {
    "*": "ask",
    "bash": {
      "*": "ask",
      "git *": "allow",
      "pnpm *": "allow",
      "npm *": "allow"
    },
    "task": {
      "*": "deny",
      "reviewer": "allow",
      "tester": "allow"
    }
  },
  
  "agent": {
    "architect": {
      "mode": "primary",
      "description": "High-level design and architecture decisions",
      "model": "anthropic/claude-opus-4-20250514",
      "permission": {
        "edit": "deny",
        "bash": "ask"
      }
    },
    "implementer": {
      "mode": "primary",
      "description": "Code implementation and testing",
      "tools": {
        "write": true,
        "edit": true,
        "bash": true
      }
    },
    "reviewer": {
      "mode": "subagent",
      "description": "Code review for quality and best practices",
      "tools": {
        "write": false,
        "edit": false
      }
    }
  },
  
  "plugin": [],
  
  "instructions": [
    "AGENTS.md",
    "docs/standards/*.md"
  ]
}
```

---

## 9. Key Insights and Recommendations

### 9.1 Critical Success Factors

1. **Limit Skill Count to 5-7 Maximum**
   - Each skill competes for context window space
   - Use progressive disclosure for depth
   - Combine related concerns into focused skills

2. **Use Primary/Subagent Modes for Orchestration**
   - Let OpenCode handle delegation via `task` tool
   - Avoid custom orchestration logic
   - Trust the platform's built-in coordination

3. **Implement Governance via Hooks, Not External Scripts**
   - Use `tool.execute.before` for pre-validation
   - Use `tool.execute.after` for post-validation
   - Use `file.edited` for automatic checks

4. **Leverage Context Compaction Hooks**
   - Preserve critical state across compaction
   - Custom prompts for multi-agent sessions
   - Prevent context loss in long workflows

5. **Start with Built-in Agents**
   - Build and Plan cover 80% of use cases
   - Add custom agents only when necessary
   - Use subagents for specialized tasks

### 9.2 Migration Path from BMAD-ext

| Phase | Action | Timeline |
|-------|--------|----------|
| 1 | Audit current 82 skills, identify overlaps | Week 1 |
| 2 | Consolidate into 5-7 focused skills | Week 1-2 |
| 3 | Replace custom agents with primary/subagent modes | Week 2 |
| 4 | Migrate governance scripts to plugins | Week 3 |
| 5 | Implement compaction hooks for state preservation | Week 3 |
| 6 | Test and iterate | Week 4 |

### 9.3 Anti-Patterns to Avoid

1. ❌ **Creating a skill for every workflow step**
   ✅ Use one skill with progressive disclosure

2. ❌ **Manual delegation with complex handoffs**
   ✅ Use `task` tool with declarative permissions

3. ❌ **External governance scanners**
   ✅ Use plugins with `tool.execute.*` hooks

4. ❌ **File-based state management**
   ✅ Use compaction hooks + minimal status files

5. ❌ **Over-explaining in skills**
   ✅ Trust the agent's intelligence, be concise

---

## 10. Sources and References

### Official Documentation
1. **Agents:** https://opencode.ai/docs/agents/
2. **Skills:** https://opencode.ai/docs/skills/
3. **Tools:** https://opencode.ai/docs/tools/
4. **Custom Tools:** https://opencode.ai/docs/custom-tools/
5. **Commands:** https://opencode.ai/docs/commands/
6. **Permissions:** https://opencode.ai/docs/permissions/
7. **Plugins:** https://opencode.ai/docs/plugins/
8. **Config:** https://opencode.ai/docs/config/

### Community Resources
1. **Mastering Agentic Skills** (Rick Hightower): https://medium.com/spillwave-solutions/mastering-agentic-skills-the-complete-guide-to-building-effective-agent-skills-d3fe57a058f1
2. **Reddit r/opencodeCLI:** https://www.reddit.com/r/opencodeCLI/comments/1q5te73/skills_in_opencode/
3. **OpenCode Plugins Guide:** https://gist.github.com/johnlindquist/0adf1032b4e84942f3e1050aba3c5e4a
4. **Hooks Comparison:** https://gist.github.com/zeke/1e0ba44eaddb16afa6edc91fec778935

### Anthropic Best Practices
1. **Agent Skills Best Practices:** https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
2. **Skills Overview:** https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview

---

## Conclusion

OpenCode's native architecture provides **everything BMAD-ext tried to build**—but in a simpler, more efficient form. The key insight is that **orchestration should be declarative, not imperative**. By leveraging OpenCode's built-in agent modes, progressive disclosure skills, event-driven hooks, and granular permissions, we can achieve "beast-mode" coordination without the context overhead that doomed BMAD-ext.

**The path forward:** Consolidate 82 skills into 5-7 focused skills, replace custom orchestration with native `task` tool delegation, implement governance via plugins with hooks, and trust OpenCode's platform-level optimizations.

---

*Research completed: 2026-01-29*  
*Next step: Create migration plan and prototype minimal .opencode/ structure*
