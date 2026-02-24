---
title: "OpenCode Meta-Framework Deep Research"
status: COMPLETE
version: 2.0.0
created: 2026-01-31T12:00:00+07:00
updated: 2026-01-31T05:27:00+07:00
author: architect-ext
purpose: "Comprehensive research for meta-framework refactoring and enhancement"
scope: "Plugin events, nested folders, context-first improvements, SKILL hierarchy, subtask2 integration"
---

# OpenCode Meta-Framework Deep Research

> **Document ID**: OPENCODE-META-RESEARCH-2026-01-31-V2
> **Version**: 2.0.0
> **Status**: COMPLETE

---

## Table of Contents

1. [Nested Folder Recognition](#1-nested-folder-recognition)
2. [Plugin Event Detailed Analysis](#2-plugin-event-detailed-analysis)
3. [Custom Tools Context & Capabilities](#3-custom-tools-context--capabilities)
4. [Context-First Module Improvements](#4-context-first-module-improvements)
5. [SKILL Hierarchy Design](#5-skill-hierarchy-design)
6. [Subtask2 Integration](#6-subtask2-integration)
7. [Low-Level Artifact System Design](#7-low-level-artifact-system-design)
8. [Proposed Meta-Framework Structure](#8-proposed-meta-framework-structure)

---

## 1. Nested Folder Recognition

### 1.1 Commands - FLAT ONLY, No Nested Folders

**Location:** `.opencode/commands/` or `~/.config/opencode/commands/`

**Structure:**
```
.opencode/commands/
├── test.md           → /test
├── review.md         → /review
├── story-cycle.md    → /story-cycle
└── sprint-planning.md → /sprint-planning
```

**Discovery Pattern:** Files ONLY, command name = filename (without .md)

**❌ NESTED FOLDERS NOT SUPPORTED:**
```
.opencode/commands/
├── 1-analysis/           ❌ NOT recognized
│   └── research.md       ❌ NOT a valid command
├── 4-implementation/     ❌ NOT recognized
│   └── code-review.md    ❌ NOT a valid command
```

**🔧 WORKAROUND - Use naming convention:**
```
.opencode/commands/
├── 1-analysis-research.md                   → /1-analysis-research
├── 2-plan-prd.md                            → /2-plan-prd
├── 3-solutioning-architecture.md            → /3-solutioning-architecture
├── 4-implementation-code-review.md          → /4-implementation-code-review
├── 4-implementation-sprint-planning.md      → /4-implementation-sprint-planning
├── governance-cascade.md                    → /governance-cascade
└── context-first.md                         → /context-first
```

---

### 1.2 Skills - SINGLE DEPTH ONLY

**Location:** `.opencode/skills/<name>/SKILL.md`

**Discovery Pattern:** Walks up from cwd to git root, loads `skills/*/SKILL.md`

**Structure:**
```
.opencode/skills/
├── story/SKILL.md              ✅ Loaded as "story"
├── tdd/SKILL.md                ✅ Loaded as "tdd"
├── upstream-validator/SKILL.md ✅ Loaded as "upstream-validator"
└── context-first/SKILL.md      ✅ Loaded as "context-first"
```

**❌ NESTED SKILLS NOT SUPPORTED:**
```
.opencode/skills/
├── governance/
│   ├── cascade/SKILL.md      ❌ NOT recognized
│   └── validator/SKILL.md    ❌ NOT recognized
```

**🔧 WORKAROUND - Use kebab-case naming:**
```
.opencode/skills/
├── governance-cascade/SKILL.md        ✅ "governance-cascade"
├── governance-validator/SKILL.md      ✅ "governance-validator"
├── context-first-purified/SKILL.md    ✅ "context-first-purified"
└── context-first-longterm/SKILL.md    ✅ "context-first-longterm"
```

**Skill Name Requirements:**
- 1-64 characters
- Lowercase alphanumeric with single hyphen separators
- No consecutive hyphens (`--`)
- Must match directory name
- Regex: `^[a-z0-9]+(-[a-z0-9]+)*$`

---

### 1.3 Custom Tools - FLAT ONLY, No Nested Folders

**Location:** `.opencode/tools/` or `~/.config/opencode/tools/`

**Structure:**
```
.opencode/tools/
├── validation.ts           → tool: "validation"
├── context-loader.ts       → tool: "context-loader"
└── context-budget.ts       → tool: "context-budget"
```

**Multiple Tools per File:**
```typescript
// math.ts
export const add = tool({...})      → tool: "math_add"
export const multiply = tool({...}) → tool: "math_multiply"
```

**❌ NESTED FOLDERS NOT SUPPORTED:**
```
.opencode/tools/
├── governance/             ❌ NOT recognized
│   └── cascade.ts          ❌ NOT a valid tool
```

**🔧 WORKAROUND - Use file naming OR multiple exports:**
```
.opencode/tools/
├── governance-cascade.ts        ✅ "governance-cascade"
├── governance-validator.ts      ✅ "governance-validator"
└── governance.ts                ✅ Multiple exports:
                                     - governance_cascade
                                     - governance_validator
                                     - governance_signoff
```

---

### 1.4 Plugins - FLAT ONLY

**Location:** `.opencode/plugins/` or `~/.config/opencode/plugins/`

**❌ NESTED FOLDERS NOT SUPPORTED**

**🔧 For organization, use multiple files with clear naming:**
```
.opencode/plugins/
├── master-orchestrator.ts       ✅ Core orchestration
├── context-first.ts             ✅ Context injection
├── validation-gate.ts           ✅ Validation enforcement
└── governance-cascade.ts        ✅ Cascade management
```

---

### 1.5 Agents - FLAT ONLY

**Location:** `.opencode/agents/` or `~/.config/opencode/agents/`

**Structure:**
```
.opencode/agents/
├── supreme-coordinator.md    ✅ Agent: "supreme-coordinator"
├── dev.md                    ✅ Agent: "dev"
├── analyst.md                ✅ Agent: "analyst"
└── reviewer.md               ✅ Agent: "reviewer"
```

**❌ NESTED FOLDERS NOT SUPPORTED**

---

### 1.6 Summary Table: Folder Recognition

| Component | Location | Nested Folders | Workaround |
|-----------|----------|----------------|------------|
| **Commands** | `.opencode/commands/*.md` | ❌ NO | Use phase-prefixed names: `1-analysis-research.md` |
| **Skills** | `.opencode/skills/*/SKILL.md` | ❌ NO | Use kebab-case: `governance-cascade/SKILL.md` |
| **Tools** | `.opencode/tools/*.ts` | ❌ NO | Use prefixed names OR multiple exports |
| **Plugins** | `.opencode/plugins/*.ts` | ❌ NO | Use prefixed names |
| **Agents** | `.opencode/agents/*.md` | ❌ NO | Use prefixed names |

---

## 2. Plugin Event Detailed Analysis

### 2.1 Complete Event Inventory with Payloads

#### Command Events

| Event | Data Exposed | Meta-Framework Use |
|-------|--------------|-------------------|
| `command.executed` | `{ command: string, arguments: string[], sessionID: string }` | Track slash command usage, workflow initiation |

**Example Usage:**
```typescript
"command.executed": async ({ event }) => {
  const { command, arguments: args, sessionID } = event.properties
  // Log command usage
  // Track workflow initiation if command is a workflow trigger
  await logCommandExecution(command, args, sessionID)
}
```

---

#### File Events

| Event | Data Exposed | Meta-Framework Use |
|-------|--------------|-------------------|
| `file.edited` | `{ path: string, changes: Diff[], sessionID: string }` | Auto-update ARTIFACT_REGISTRY, detect violations |
| `file.watcher.updated` | `{ paths: string[] }` | Detect external file changes |

**Example Usage for ARTIFACT_REGISTRY:**
```typescript
"file.edited": async ({ event }) => {
  const { path, changes, sessionID } = event.properties
  
  // Check if artifact file was modified
  if (isArtifactPath(path)) {
    await updateArtifactRegistry({
      path,
      modifiedAt: new Date().toISOString(),
      modifiedBy: sessionID,
      changesSummary: summarizeChanges(changes)
    })
  }
  
  // Check for violations (deprecated paths, oversized files)
  await checkFileViolations(path)
}
```

---

#### Session Events

| Event | Data Exposed | Meta-Framework Use |
|-------|--------------|-------------------|
| `session.created` | `{ sessionID: string, parentID?: string }` | Initialize state, track delegation chains |
| `session.updated` | `{ sessionID: string, title?: string, status?: string }` | Track session evolution |
| `session.compacted` | `{ sessionID: string }` | State recovery notification (AFTER compaction) |
| `session.idle` | `{ sessionID: string }` | Save state, run background governance |
| `session.diff` | `{ sessionID: string, diffs: FileDiff[] }` | Track cumulative file changes |
| `session.error` | `{ sessionID: string, error: Error }` | Error tracking, escalation |
| `session.status` | `{ sessionID: string, status: "idle" | "busy" | "error" }` | Monitor agent activity |
| `session.deleted` | `{ sessionID: string }` | Cleanup, archive state |

**Example: Track Delegation Chains via parentID:**
```typescript
"session.created": async ({ event }) => {
  const { sessionID, parentID } = event.properties
  
  if (parentID) {
    // This is a delegated session (child of parent)
    await DelegationTracker.recordDelegation({
      parentSession: parentID,
      childSession: sessionID,
      createdAt: new Date().toISOString()
    })
  }
  
  // Initialize session state
  await StateSyncModule.initSession(sessionID)
}
```

**Example: Background Governance on Idle:**
```typescript
"session.idle": async ({ event, client, $ }) => {
  const { sessionID } = event.properties
  
  // Save current state
  await StateSyncModule.saveState(sessionID)
  
  // Run quick governance checks in background
  const result = await $`pnpm typecheck:fast 2>&1 || true`
  if (result.exitCode !== 0) {
    await client.app.log({
      service: "governance",
      level: "warn",
      message: "Type errors detected on session idle",
      extra: { sessionID, errors: result.stdout }
    })
  }
}
```

---

#### Tool Events

| Event | Data Exposed | Meta-Framework Use |
|-------|--------------|-------------------|
| `tool.execute.before` | `{ tool: string, params: any }` | Pre-validation, context injection, blocking |
| `tool.execute.after` | `{ tool: string, params: any, result: any }` | Post-validation, state sync, governance |

**Detailed Payload for `tool.execute.before`:**
```typescript
interface ToolExecuteBeforeInput {
  tool: string  // Tool name: "write_file", "task", "read", "grep", "bash", etc.
  params: {
    // For write_file/edit_file:
    path?: string
    TargetFile?: string
    content?: string
    CodeContent?: string
    
    // For task (delegation):
    description?: string
    agent?: string
    
    // For grep/search:
    Query?: string
    SearchPath?: string
    
    // For read:
    filePath?: string
    
    // For bash:
    command?: string
  }
}

interface ToolExecuteBeforeOutput {
  // Modify params before execution
  params?: Partial<ToolExecuteBeforeInput['params']>
  // Set blocked to true to prevent execution
  blocked?: boolean
  error?: string
}
```

**Example: Context Injection for Task Delegation:**
```typescript
"tool.execute.before": async (input, output) => {
  if (input.tool === "task") {
    const contextBlock = await ContextFirstModule.generateContextBlock(
      input.params.description,
      input.params.agent
    )
    
    // Inject context into task description
    output.params = {
      ...input.params,
      description: contextBlock + "\n\n" + input.params.description
    }
    
    // Track delegation start
    ValidationGateModule.recordDelegationStart(input.params.agent)
  }
}
```

**Example: Brownfield Guard - Block Deprecated Paths:**
```typescript
"tool.execute.before": async (input, output) => {
  if (input.tool === "write_file" || input.tool === "edit_file") {
    const path = input.params.path || input.params.TargetFile
    
    if (isDeprecatedPath(path)) {
      output.blocked = true
      output.error = `BLOCKED: ${path} is in deprecated path (per ADR-039). Use canonical paths under src/infrastructure/, src/domain/, src/presentation/`
    }
    
    if (await isOversizedFile(path, input.params.content)) {
      output.blocked = true
      output.error = `BLOCKED: File exceeds max lines (400 for components, 300 for stores). Split into smaller modules.`
    }
  }
}
```

---

#### Experimental Hooks (MOST POWERFUL)

| Hook | Data Exposed | Meta-Framework Use |
|------|--------------|-------------------|
| `experimental.session.compacting` | `input: { sessionID }, output: { context: [], prompt?: string }` | **CRITICAL**: Inject state that survives compaction |
| `experimental.chat.system.transform` | `input: { sessionID }, output: { system: [] }` | **CRITICAL**: Inject context-first reminders |
| `experimental.chat.messages.transform` | `input: { sessionID }, output: { messages: Message[] }` | Extract user intent, analyze conversation |

**Compaction Hook - COMPLETE CONTROL:**
```typescript
"experimental.session.compacting": async (input, output) => {
  // Option 1: Add to default compaction context
  output.context.push(`
## GOVERNANCE STATE (Auto-Injected)
- Active Workflow: ${state.currentWorkflow}
- Current Phase: ${state.currentPhase}
- Active Agent: ${state.activeAgent}
- Pending Validations: ${state.pendingValidations.join(", ")}
- Last Governance Check: ${state.lastGovernanceCheck}

## VALIDATION REMINDER
You are the SUPREME COORDINATOR. When delegated tasks return:
1. VERIFY with grep_search for expected artifacts
2. VERIFY with list_dir for file structure
3. NEVER accept "done" claims without evidence
`)

  // Option 2: Replace ENTIRE compaction prompt (overrides default)
  // output.prompt = `Custom compaction prompt...`
  
  // Note: If output.prompt is set, output.context is IGNORED
}
```

**System Transform Hook - INJECT CONTEXT-FIRST:**
```typescript
"experimental.chat.system.transform": async (input, output) => {
  // Inject context-first reminder into system prompt
  output.system.push(`
## CONTEXT-FIRST ENFORCEMENT (Auto-Injected)
Before ANY implementation:
1. Read AGENTS.md for current status
2. Check sprint-status.yaml for active stories
3. Load relevant artifacts per prompt matrix

## MANDATORY COMMANDS
After any task completion, you MUST run:
- pnpm typecheck:fast
- pnpm test:fast
`)

  // Inject pending enforcement prompts
  if (ValidationGateModule.hasPendingEnforcement()) {
    output.system.push(ValidationGateModule.getEnforcementPrompt())
  }
}
```

**Messages Transform Hook - EXTRACT USER INTENT:**
```typescript
"experimental.chat.messages.transform": async (input, output) => {
  // Find first user message for intent analysis
  const firstUserMsg = output.messages.find(m => m.role === "user")
  if (firstUserMsg) {
    const intent = analyzeUserIntent(firstUserMsg.parts[0]?.text)
    ContextFirstModule.setUserIntent(intent)
  }
  
  // Extract file paths mentioned
  const filePaths = extractFilePaths(output.messages)
  ContextFirstModule.setReferencedFiles(filePaths)
}
```

---

#### Message Events

| Event | Data Exposed | Meta-Framework Use |
|-------|--------------|-------------------|
| `message.updated` | `{ messageID, sessionID, role, status }` | Track streaming updates |
| `message.removed` | `{ messageID, sessionID }` | Track message deletion |
| `message.part.updated` | `{ messageID, partID, type, text }` | Track part-level changes |
| `message.part.removed` | `{ messageID, partID }` | Track part deletion |

---

#### Permission Events

| Event | Data Exposed | Meta-Framework Use |
|-------|--------------|-------------------|
| `permission.asked` | `{ permissionID, tool, action, details }` | Log permission requests |
| `permission.replied` | `{ permissionID, approved, remember }` | Log permission decisions, analyze patterns |

**Example: Permission Pattern Analysis:**
```typescript
"permission.asked": async ({ event }) => {
  await PermissionLog.record({
    id: event.properties.permissionID,
    tool: event.properties.tool,
    action: event.properties.action,
    timestamp: new Date().toISOString()
  })
}

"permission.replied": async ({ event }) => {
  await PermissionLog.updateDecision({
    id: event.properties.permissionID,
    approved: event.properties.approved,
    remembered: event.properties.remember
  })
  
  // Analyze patterns for auto-approval suggestions
  if (event.properties.approved && !event.properties.remember) {
    const frequency = await PermissionLog.getFrequency(event.properties.tool, event.properties.action)
    if (frequency > 5) {
      await suggestAutoApproval(event.properties.tool, event.properties.action)
    }
  }
}
```

---

#### Todo Events

| Event | Data Exposed | Meta-Framework Use |
|-------|--------------|-------------------|
| `todo.updated` | `{ todos: Todo[] }` | Track TODO changes, integrate with subtask2 |

**Example: Track TODO for Governance:**
```typescript
"todo.updated": async ({ event }) => {
  const { todos } = event.properties
  
  // Log TODO changes
  await TodoLog.update(todos)
  
  // Trigger alerts for stale TODOs
  const staleTodos = todos.filter(t => isStale(t.createdAt, 2)) // 2 hours
  if (staleTodos.length > 0) {
    await AlertModule.notify(`${staleTodos.length} stale TODOs detected`)
  }
}
```

---

#### TUI Events

| Event | Data Exposed | Meta-Framework Use |
|-------|--------------|-------------------|
| `tui.prompt.append` | `{ text: string }` | Monitor prompt additions |
| `tui.command.execute` | `{ command: string }` | Monitor TUI command execution |
| `tui.toast.show` | `{ message, variant }` | Monitor toast notifications |

---

#### LSP Events

| Event | Data Exposed | Meta-Framework Use |
|-------|--------------|-------------------|
| `lsp.client.diagnostics` | `{ diagnostics: Diagnostic[] }` | Track TypeScript errors in real-time |
| `lsp.updated` | `{ ... }` | LSP state changes |

**Example: Real-time TypeScript Error Prevention:**
```typescript
"lsp.client.diagnostics": async ({ event }) => {
  const { diagnostics } = event.properties
  
  const errors = diagnostics.filter(d => d.severity === "error")
  if (errors.length > 0) {
    await GovernanceLog.recordTypeErrors(errors)
    
    // Notify agent of type errors
    await client.tui.showToast({
      body: {
        message: `${errors.length} TypeScript errors detected`,
        variant: "warning"
      }
    })
  }
}
```

---

## 3. Custom Tools Context & Capabilities

### 3.1 Context Object Available to Tools

```typescript
interface ToolContext {
  agent: string       // Current agent name (e.g., "supreme-coordinator", "dev")
  sessionID: string   // Current session UUID
  messageID: string   // Current message UUID
  directory: string   // Project root directory (session working directory)
  worktree?: string   // Git worktree root (if different from directory)
}
```

**Usage:**
```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Get governance state for current session",
  args: {},
  async execute(args, context) {
    const { agent, sessionID, directory, worktree } = context
    
    // Use context to load session-specific state
    const state = await loadSessionState(sessionID)
    
    // Use directory for file operations
    const configPath = path.join(directory, "AGENTS.md")
    
    return `Agent: ${agent}, Session: ${sessionID}, State: ${JSON.stringify(state)}`
  }
})
```

### 3.2 What Context CANNOT Access

❌ **Cannot access:**
- Conversation history (use `experimental.chat.messages.transform` hook instead)
- Other session states (only current session)
- Parent session data directly (need to query via SDK)
- Real-time streaming content

### 3.3 Accessing Parent Session and Delegation Chain

To track parent sessions and delegation chains, use the SDK:

```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Get delegation chain for current session",
  args: {},
  async execute(args, context) {
    // Access SDK client from plugin context (via closure)
    const session = await client.session.get({ path: { id: context.sessionID } })
    
    // Get parent session if exists
    if (session.parentID) {
      const parent = await client.session.get({ path: { id: session.parentID } })
      
      // Get all siblings (other child sessions)
      const siblings = await client.session.children({ path: { id: session.parentID } })
      
      return {
        currentSession: context.sessionID,
        parentSession: session.parentID,
        siblingCount: siblings.length,
        delegationDepth: await getDelegationDepth(context.sessionID)
      }
    }
    
    return { currentSession: context.sessionID, isRoot: true }
  }
})
```

### 3.4 Session API Available to Plugins

```typescript
// Within plugin, you have access to `client` from context
const plugin = async ({ client, $, directory, worktree }) => {
  // List all sessions
  const sessions = await client.session.list()
  
  // Get specific session
  const session = await client.session.get({ path: { id: "session-uuid" } })
  
  // Get child sessions (delegated from this session)
  const children = await client.session.children({ path: { id: "session-uuid" } })
  
  // Create new session (spawn sub-agent)
  const newSession = await client.session.create({
    body: { parentID: "session-uuid", title: "Delegated Task" }
  })
  
  // Inject context without triggering AI response
  await client.session.prompt({
    path: { id: "session-uuid" },
    body: {
      noReply: true,
      parts: [{ type: "text", text: "Context to inject..." }]
    }
  })
  
  // Abort a session
  await client.session.abort({ path: { id: "session-uuid" } })
  
  // Get messages from session
  const messages = await client.session.messages({ path: { id: "session-uuid" } })
  
  // Get file diffs for session
  const diffs = await client.session.diff({ path: { id: "session-uuid" } })
  
  return {
    // ... hooks
  }
}
```

---

## 4. Context-First Module Improvements

### 4.1 Purified Workflow-Aware Context

**Problem:** Current context injection is generic. Agents receive the same context regardless of workflow phase, leading to irrelevant information bloating context.

**Solution:** `purified-workflow-aware-context` injects ONLY context relevant to current workflow and phase.

**Implementation:**

```typescript
// .opencode/plugins/context-first.ts

interface WorkflowContext {
  workflow: string
  phase: string
  requiredArtifacts: string[]
  restrictedPaths: string[]
  validationRules: string[]
}

const WORKFLOW_CONTEXTS: Record<string, Record<string, WorkflowContext>> = {
  "story-development": {
    "1-context-gathering": {
      workflow: "story-development",
      phase: "context-gathering",
      requiredArtifacts: [
        "_bmad-output/sprint-artifacts/sprint-status.yaml",
        "_bmad-output/sprint-artifacts/stories/story-{id}.md"
      ],
      restrictedPaths: [], // No restrictions in research phase
      validationRules: ["story-exists", "acceptance-criteria-defined"]
    },
    "2-implementation": {
      workflow: "story-development",
      phase: "implementation",
      requiredArtifacts: [
        "story-context.md",
        "tech-spec.md"
      ],
      restrictedPaths: ["src/lib/", "@/stores/"], // ADR-039 restrictions
      validationRules: ["tests-written", "implementation-matches-spec"]
    },
    "3-review": {
      workflow: "story-development",
      phase: "review",
      requiredArtifacts: [
        "implementation-files",
        "test-results.txt"
      ],
      restrictedPaths: [],
      validationRules: ["typecheck-passes", "tests-pass", "code-review-complete"]
    }
  },
  "code-review": {
    "1-analysis": {
      workflow: "code-review",
      phase: "analysis",
      requiredArtifacts: [
        "changed-files",
        "architecture.md"
      ],
      restrictedPaths: [],
      validationRules: ["all-changes-reviewed"]
    }
  },
  // ... more workflows
}

export const PurifiedContextModule = {
  /**
   * Generate context block specific to current workflow and phase
   */
  async generatePurifiedContext(
    workflow: string,
    phase: string,
    storyId?: string
  ): Promise<string> {
    const ctx = WORKFLOW_CONTEXTS[workflow]?.[phase]
    if (!ctx) return this.generateDefaultContext()
    
    const sections: string[] = []
    
    // Header
    sections.push(`## PURIFIED CONTEXT [${workflow}/${phase}]`)
    sections.push(`Auto-injected at: ${new Date().toISOString()}`)
    sections.push("")
    
    // Required artifacts with content
    sections.push("### Required Artifacts (Auto-Loaded)")
    for (const artifactPath of ctx.requiredArtifacts) {
      const resolvedPath = artifactPath.replace("{id}", storyId || "")
      if (fs.existsSync(resolvedPath)) {
        const content = fs.readFileSync(resolvedPath, "utf-8")
        const truncated = content.slice(0, 2000) // Limit to 2000 chars
        sections.push(`\n#### ${resolvedPath}`)
        sections.push("```yaml")
        sections.push(truncated)
        sections.push("```")
      }
    }
    
    // Restrictions
    if (ctx.restrictedPaths.length > 0) {
      sections.push("\n### RESTRICTED PATHS (DO NOT MODIFY)")
      sections.push("Per ADR-039, these paths are deprecated:")
      ctx.restrictedPaths.forEach(p => sections.push(`- ${p}`))
      sections.push("Use canonical paths: src/infrastructure/, src/domain/, src/presentation/")
    }
    
    // Validation rules
    sections.push("\n### Validation Requirements")
    sections.push("Before completing this phase, verify:")
    ctx.validationRules.forEach((rule, i) => sections.push(`${i + 1}. ${rule}`))
    
    return sections.join("\n")
  },
  
  generateDefaultContext(): string {
    return `## DEFAULT CONTEXT
No specific workflow detected. Before proceeding:
1. Check sprint-status.yaml for current focus
2. Read AGENTS.md for project status
3. Identify relevant artifacts`
  }
}
```

---

### 4.2 Long-Term Context On-Demand

**Problem:** Agents don't have access to historical context from previous sessions, leading to repeated mistakes and lost learnings.

**Solution:** `long-term-context-on-demand` loads historical context only when explicitly requested, avoiding context bloat.

**Implementation:**

```typescript
// .opencode/tools/long-term-context.ts

import { tool } from "@opencode-ai/plugin"
import * as fs from "fs"
import * as path from "path"

interface HistoricalContext {
  decisions: Decision[]
  patterns: Pattern[]
  violations: Violation[]
  completedStories: StorySummary[]
}

export default tool({
  description: `Load long-term project context on demand. Use when:
- Starting a new major task
- Encountering a pattern that might have been solved before
- Need to understand why a decision was made
- Reviewing project history for retrospective`,
  
  args: {
    type: tool.schema.enum([
      "decisions",      // ADRs, architectural decisions
      "patterns",       // Established code patterns
      "violations",     // Previous violations and resolutions
      "stories",        // Completed story summaries
      "full"            // All of the above
    ]).describe("Type of historical context to load"),
    
    filter: tool.schema.string().optional().describe("Filter criteria (e.g., 'auth', 'layout')"),
    
    limit: tool.schema.number().optional().describe("Max items to return (default: 10)")
  },
  
  async execute(args, context) {
    const { type, filter, limit = 10 } = args
    
    const results: HistoricalContext = {
      decisions: [],
      patterns: [],
      violations: [],
      completedStories: []
    }
    
    // Load decisions (ADRs)
    if (type === "decisions" || type === "full") {
      const adrDir = path.join(context.directory, "docs/adrs")
      if (fs.existsSync(adrDir)) {
        const adrs = fs.readdirSync(adrDir)
          .filter(f => f.endsWith(".md"))
          .slice(0, limit)
          .map(f => {
            const content = fs.readFileSync(path.join(adrDir, f), "utf-8")
            return extractAdrSummary(f, content)
          })
        results.decisions = filter 
          ? adrs.filter(a => a.title.toLowerCase().includes(filter.toLowerCase()))
          : adrs
      }
    }
    
    // Load patterns from codebase
    if (type === "patterns" || type === "full") {
      const patternsFile = path.join(context.directory, "_bmad-output/.brain/patterns.yaml")
      if (fs.existsSync(patternsFile)) {
        const patterns = yaml.parse(fs.readFileSync(patternsFile, "utf-8"))
        results.patterns = filter
          ? patterns.filter((p: Pattern) => p.name.toLowerCase().includes(filter.toLowerCase()))
          : patterns.slice(0, limit)
      }
    }
    
    // Load violations history
    if (type === "violations" || type === "full") {
      const violationsFile = path.join(context.directory, "_bmad-output/.brain/violations.yaml")
      if (fs.existsSync(violationsFile)) {
        const violations = yaml.parse(fs.readFileSync(violationsFile, "utf-8"))
        results.violations = violations.slice(-limit) // Most recent
      }
    }
    
    // Load completed stories
    if (type === "stories" || type === "full") {
      const storiesDir = path.join(context.directory, "_bmad-output/sprint-artifacts/stories")
      if (fs.existsSync(storiesDir)) {
        const stories = fs.readdirSync(storiesDir)
          .filter(f => f.endsWith(".md"))
          .map(f => {
            const content = fs.readFileSync(path.join(storiesDir, f), "utf-8")
            return extractStorySummary(f, content)
          })
          .filter(s => s.status === "done")
          .slice(-limit)
        
        results.completedStories = filter
          ? stories.filter(s => s.title.toLowerCase().includes(filter.toLowerCase()))
          : stories
      }
    }
    
    return formatHistoricalContext(results, type)
  }
})

function formatHistoricalContext(ctx: HistoricalContext, type: string): string {
  const sections: string[] = [`## Long-Term Context (${type})`]
  
  if (ctx.decisions.length > 0) {
    sections.push("\n### Architectural Decisions (ADRs)")
    ctx.decisions.forEach(d => {
      sections.push(`- **${d.id}: ${d.title}** - ${d.summary}`)
    })
  }
  
  if (ctx.patterns.length > 0) {
    sections.push("\n### Established Patterns")
    ctx.patterns.forEach(p => {
      sections.push(`- **${p.name}**: ${p.description}`)
      sections.push(`  Example: \`${p.example}\``)
    })
  }
  
  if (ctx.violations.length > 0) {
    sections.push("\n### Recent Violations (Learn from these)")
    ctx.violations.forEach(v => {
      sections.push(`- **${v.type}** at ${v.path} - ${v.resolution}`)
    })
  }
  
  if (ctx.completedStories.length > 0) {
    sections.push("\n### Completed Stories (Reference)")
    ctx.completedStories.forEach(s => {
      sections.push(`- **${s.id}: ${s.title}** - Completed ${s.completedAt}`)
    })
  }
  
  return sections.join("\n")
}
```

---

### 4.3 Agent Keyword Sensitivity

**Problem:** Agents don't respond strongly enough to keywords in their profile, leading to role drift.

**Implementation:**

```typescript
// In experimental.chat.system.transform hook

const AGENT_KEYWORDS: Record<string, {
  trigger: string[]      // Keywords that activate this agent's expertise
  forbidden: string[]    // Keywords that indicate wrong agent (should delegate)
  expertise: string      // Agent's core expertise
}> = {
  "supreme-coordinator": {
    trigger: ["orchestrate", "delegate", "coordinate", "validate", "verify", "govern"],
    forbidden: ["implement", "code", "fix", "write", "build"],
    expertise: "Orchestration, delegation, and validation. NEVER implements directly."
  },
  "dev": {
    trigger: ["implement", "code", "build", "fix", "create", "refactor"],
    forbidden: ["plan", "design", "architecture"],
    expertise: "Code implementation and bug fixes."
  },
  "analyst": {
    trigger: ["research", "analyze", "investigate", "requirements", "gather"],
    forbidden: ["implement", "code"],
    expertise: "Requirements analysis and research."
  },
  "architect": {
    trigger: ["design", "architecture", "structure", "pattern", "system"],
    forbidden: ["implement", "code", "fix"],
    expertise: "System design and architectural decisions."
  },
  "reviewer": {
    trigger: ["review", "critique", "assess", "audit", "check"],
    forbidden: ["implement", "code"],
    expertise: "Code review and quality assessment."
  }
}

export const KeywordSensitivityModule = {
  injectKeywordSensitivity(agent: string, systemPrompt: string[]): void {
    const config = AGENT_KEYWORDS[agent]
    if (!config) return
    
    systemPrompt.push(`
## KEYWORD SENSITIVITY (${agent})

**Your Core Expertise:** ${config.expertise}

**TRIGGER KEYWORDS (Activate your expertise):**
When you see these words, immediately apply your specialized knowledge:
${config.trigger.map(k => `- "${k}"`).join("\n")}

**FORBIDDEN KEYWORDS (Delegate to appropriate agent):**
If the task involves these, STOP and delegate:
${config.forbidden.map(k => `- "${k}" → delegate to appropriate specialist`).join("\n")}

**ENFORCEMENT:** If you detect forbidden keywords and you're not already delegating,
you MUST delegate to the appropriate agent rather than attempting the task yourself.
`)
  },
  
  detectAgentFromKeywords(userMessage: string): string | null {
    const lowerMessage = userMessage.toLowerCase()
    
    for (const [agent, config] of Object.entries(AGENT_KEYWORDS)) {
      const triggerCount = config.trigger.filter(k => lowerMessage.includes(k)).length
      if (triggerCount >= 2) {
        return agent
      }
    }
    return null
  }
}
```

---

## 5. SKILL Hierarchy Design

### 5.1 SKILL Categories for Meta-Framework

```
.opencode/skills/
├── tier-0-meta/                        # Framework meta-skills
│   ├── context-first/SKILL.md          # Load context before action
│   └── using-superpowers/SKILL.md      # Framework orientation
│
├── tier-1-orchestration/               # Coordinator skills
│   ├── upstream-validator/SKILL.md     # Multi-level validation
│   ├── delegation-protocol/SKILL.md   # Proper delegation
│   └── workflow-routing/SKILL.md       # Workflow selection
│
├── tier-2-process/                     # Process skills
│   ├── story-development/SKILL.md      # Story cycle
│   ├── code-review/SKILL.md            # Review process
│   ├── sprint-planning/SKILL.md        # Sprint management
│   └── retrospective/SKILL.md          # Retrospectives
│
├── tier-2-quality/                     # Quality skills
│   ├── tdd/SKILL.md                    # Test-driven development
│   ├── brownfield-guard/SKILL.md       # Path enforcement
│   ├── verification/SKILL.md           # Pre-completion verification
│   └── debug/SKILL.md                  # Systematic debugging
│
├── tier-2-domain/                      # Domain skills
│   ├── frontend/SKILL.md               # Frontend patterns
│   ├── backend/SKILL.md                # Backend patterns
│   └── architecture/SKILL.md           # Architecture patterns
│
├── governance/                         # Governance skills
│   ├── governance-cascade/SKILL.md     # Cascade management
│   ├── governance-signoff/SKILL.md     # Multi-agent signoff
│   └── governance-contracts/SKILL.md   # Contract generation
│
└── intelligence/                       # Intelligence skills
    ├── long-term-context/SKILL.md      # Historical context
    ├── pattern-recognition/SKILL.md   # Pattern detection
    └── expert-mode/SKILL.md            # Expert-level analysis
```

**Note:** Since nested folders aren't supported, use flat structure with prefixed names:
```
.opencode/skills/
├── context-first/SKILL.md
├── upstream-validator/SKILL.md
├── delegation-protocol/SKILL.md
├── story-development/SKILL.md
├── code-review/SKILL.md
├── tdd/SKILL.md
├── brownfield-guard/SKILL.md
├── frontend/SKILL.md
├── governance-cascade/SKILL.md
├── long-term-context/SKILL.md
├── expert-mode/SKILL.md
└── ...
```

---

### 5.2 SKILL for Supreme Coordinator

```markdown
# .opencode/skills/supreme-coordinator-init/SKILL.md

---
name: supreme-coordinator-init
description: "Initialize supreme coordinator session with proper context gathering, intent analysis, and delegation framing. MANDATORY at session start for supreme-coordinator agent."
---

## When To Use
- **ALWAYS** when session starts with supreme-coordinator
- When returning from compaction
- When user intent is unclear or multi-faceted

## Session Initialization Protocol

### Phase 1: User Intent Classification

Score the user's message against these categories:

| Category | Score 0-10 | Indicators |
|----------|------------|------------|
| **Clarity** | | Clear task? Single vs multi-part? |
| **Scope** | | Single file? Epic-level? Sprint-level? |
| **Context Sufficiency** | | Has all required info? References artifacts? |
| **Expert Mode Trigger** | | Sounds wrong? Not best practice? Needs challenge? |

**Classification Actions:**

- **Score < 5 (Confused/Unclear)**: Delegate to `@explore` for clarification gathering
- **Score 5-7 (Straightforward)**: Shallow context scan, proceed with delegation
- **Score > 7 (Expert Mode)**: Deep analysis, challenge assumptions, suggest alternatives

### Phase 2: Status Gathering

**MANDATORY: Before any delegation, load these files:**

```
ALWAYS_LOAD:
  - _bmad-output/sprint-artifacts/sprint-status.yaml [frontmatter, current_sprint, active_stories]
  - AGENTS.md [status, current_phase, active_epics]
  
CONDITIONAL_LOAD:
  - If story work: _bmad-output/sprint-artifacts/stories/story-{id}.md
  - If epic work: _bmad-output/planning-artifacts/epics/{epic-id}.md
  - If architecture: docs/architecture.md, docs/adrs/ADR-039.md
```

### Phase 3: Conversation Anchor

After context gathering, create an **IMMUTABLE ANCHOR** that persists through compaction:

```yaml
## SESSION ANCHOR (Immutable)
original_intent: "{user's first message verbatim}"
classified_as: "{category from Phase 1}"
current_status:
  workflow: "{from sprint-status.yaml}"
  phase: "{from AGENTS.md}"
  active_story: "{if applicable}"
delegation_frame:
  approach: "{orchestrate | delegate | validate}"
  target_agent: "{primary delegate}"
  validation_required: true
```

### Phase 4: Delegation Protocol

**As Supreme Coordinator, you MUST:**

1. **Frame, don't implement**: Define WHAT, not HOW
2. **Delegate with context**: Use `@agent` with clear scope
3. **Require validation**: Set explicit validation criteria
4. **Track cycles**: Log delegation start in state

**Delegation Template:**
```
@{agent}

## Delegated Task
{clear description of what to achieve}

## Context (Auto-loaded)
{purified context from Phase 2}

## Acceptance Criteria
1. {measurable criterion 1}
2. {measurable criterion 2}

## Validation Required
Return with evidence of:
- [ ] Artifacts created/modified
- [ ] Tests passing (if applicable)
- [ ] No new TypeScript errors

## Return Protocol
When complete, provide:
1. Summary of what was done
2. List of modified files
3. Any blockers or concerns
```

### Phase 5: Validation Gate

**CRITICAL: When delegated tasks return:**

```
MANDATORY_TOOLS_ON_RETURN:
  - grep_search: Verify expected artifacts exist
  - list_dir: Confirm file structure
  - view_file: Spot-check critical files

NEVER_ACCEPT:
  - "Done" claims without evidence
  - Completion without artifact verification
  - Returns without addressing acceptance criteria

IF_VALIDATION_FAILS:
  - Log violation
  - Request specific evidence
  - Re-delegate if necessary
```

## Expert Mode Triggers

Activate expert mode when user request:
- Contradicts established patterns (ADR-039, architecture)
- Skips required phases
- Requests known anti-patterns
- Shows signs of scope creep

**Expert Mode Response:**
```
Before proceeding, I need to raise some concerns:

1. **Observation**: {what seems wrong}
2. **Established Pattern**: {what we normally do}
3. **Suggested Alternative**: {better approach}
4. **Your Call**: Should we proceed as requested or adapt?
```
```

---

### 5.3 SKILL for Sprint Manager

```markdown
# .opencode/skills/sprint-manager-init/SKILL.md

---
name: sprint-manager-init
description: "Initialize sprint manager session with sprint context, story prioritization, and phase-appropriate workflows. MANDATORY at sprint-manager session start."
---

## When To Use
- When delegated to as sprint-manager
- When managing sprint-level activities
- When creating/managing stories

## Session Initialization Protocol

### Phase 1: Sprint Context Load

**MANDATORY: Load sprint state:**

```
ALWAYS_LOAD:
  - _bmad-output/sprint-artifacts/sprint-status.yaml [FULL]
  - _bmad-output/sprint-artifacts/velocity.yaml
  - AGENTS.md [current_phase, active_epics]
  
CONDITIONAL_LOAD:
  - If story work: All active story files
  - If planning: docs/epics.md, docs/roadmap.md
```

### Phase 2: Phase Detection

Determine current sprint phase:

| Phase | Indicators | Primary Activity |
|-------|------------|------------------|
| **Planning** | No active stories, sprint not started | Story creation, estimation |
| **Active** | Stories in progress | Story development, blockers |
| **Review** | Stories done, sprint ending | Retrospective, velocity |

### Phase 3: Story Prioritization

When multiple stories are active:

```
PRIORITY_ORDER:
  1. Blocked stories (resolve blockers first)
  2. In-review stories (complete validation)
  3. In-progress stories (continue implementation)
  4. Ready stories (start next highest priority)
```

### Phase 4: Workflow Selection

Based on phase and priorities:

```yaml
planning_phase:
  - /sprint-planning
  - /create-story
  
active_phase:
  - /story-cycle
  - /code-review
  - /correct-course (if blockers)
  
review_phase:
  - /retrospective
  - /velocity-update
```

### Phase 5: Reporting to Coordinator

**MANDATORY: When completing any task:**

```
REPORT_TEMPLATE:
  status: {done | blocked | in-progress}
  artifacts:
    - path: "{artifact path}"
      action: "{created | modified | deleted}"
  validation:
    typecheck: {pass | fail}
    tests: {pass | fail | skipped}
  blockers: "{if any}"
  next_action: "{recommended next step}"
```
```

---

## 6. Subtask2 Integration

### 6.1 Subtask2 Capabilities

The `subtask2` plugin provides:

| Feature | Syntax | Meta-Framework Use |
|---------|--------|-------------------|
| **Chained Returns** | `return: - /step1 - /step2` | Sequential workflow phases |
| **Conditional Loops** | `loop: {max: 10, until: "tests pass"}` | Iterative validation until success |
| **Parallel Execution** | `parallel: - /agent1 - /agent2` | Multi-agent parallel work |
| **Context Passing** | `$TURN[n]`, `$RESULT[name]` | Pass context between commands |
| **Named Results** | `{as:name}` + `$RESULT[name]` | Capture and reference outputs |

### 6.2 Integration with Governance Cascade

**Create command that leverages subtask2 for governance cascade:**

```markdown
# .opencode/commands/governance-cascade-full.md

---
description: "Run full governance cascade with validation loops"
subtask: true
parallel:
  - /typecheck-loop
  - /test-loop
return:
  - /lint-check {as:lint}
  - /architecture-check {as:arch}
  - "Synthesize $RESULT[lint] and $RESULT[arch] into final governance report"
---

Running full governance cascade:
1. TypeScript check (parallel)
2. Test suite (parallel)
3. Lint check (after parallel completes)
4. Architecture validation
5. Final synthesis
```

```markdown
# .opencode/commands/typecheck-loop.md

---
description: "Run typecheck with auto-fix loop"
subtask: true
loop:
  max: 5
  until: "no TypeScript errors remain"
---

Run `pnpm typecheck:fast` and fix any errors.
If errors exist, analyze root cause and fix.
Repeat until clean or max iterations reached.
```

### 6.3 Story Cycle with Subtask2

```markdown
# .opencode/commands/story-cycle-full.md

---
description: "Complete story development cycle with validation loops"
agent: supreme-coordinator
subtask: true
return:
  - /story-context $ARGUMENTS {as:context}
  - /story-implement || use context from $RESULT[context] {as:impl}
  - /story-validate {loop:3 && until:all acceptance criteria met} {as:validation}
  - /story-review {as:review}
  - "Complete story $ARGUMENTS with validation: $RESULT[validation] and review: $RESULT[review]"
---

Execute the full story development cycle for story: $ARGUMENTS

This will:
1. Gather story context
2. Implement the story
3. Validate against acceptance criteria (with retry loop)
4. Perform code review
5. Complete and report status
```

### 6.4 Expert-Skeptic Review Pattern

```markdown
# .opencode/commands/expert-skeptic-review.md

---
description: "Multi-perspective review with expert and skeptic agents"
subtask: true
parallel:
  - /subtask {model:anthropic/claude-sonnet-4 && as:expert} Analyze $ARGUMENTS from an expert perspective, focusing on best practices and optimal implementation
  - /subtask {model:openai/gpt-4o && as:skeptic} Critically analyze $ARGUMENTS, looking for flaws, edge cases, and potential issues
return:
  - "Synthesize $RESULT[expert] and $RESULT[skeptic] perspectives. Identify agreements and disagreements. Recommend final approach."
---

Expert-Skeptic review for: $ARGUMENTS

Running parallel analysis with:
1. Expert perspective (Claude) - Best practices focus
2. Skeptic perspective (GPT-4) - Critical analysis focus
3. Synthesis of both perspectives
```

---

## 7. Low-Level Artifact System Design

### 7.1 Brain Artifact Concept

**Location:** `_bmad-output/.brain/`

**Purpose:** Machine-parseable, highly relational artifacts that track:
- Cycle metadata
- Agent actions
- Decisions
- Impacts
- Symlinks between artifacts

### 7.2 Brain Artifact Structure

```yaml
# _bmad-output/.brain/session-{id}.yaml

session:
  id: "uuid"
  parent_id: "uuid or null"
  agent: "supreme-coordinator"
  started: "2026-01-31T05:27:00+07:00"
  ended: null
  status: "active"

delegation_chain:
  - depth: 0
    agent: "supreme-coordinator"
    purpose: "Orchestrate EPIC-UXUI-02 implementation"
    delegated_to: "sprint-manager"
    
  - depth: 1
    agent: "sprint-manager"
    purpose: "Create story 22-5"
    delegated_to: "dev"
    
  - depth: 2
    agent: "dev"
    purpose: "Implement WorkspaceLayout component"
    delegated_to: null

decisions:
  - id: "dec-001"
    timestamp: "2026-01-31T05:30:00+07:00"
    agent: "supreme-coordinator"
    type: "workflow-selection"
    decision: "Use story-development workflow"
    rationale: "User requested implementation of specific story"
    impacts:
      - sprint-status.yaml
      - stories/story-22-5.md

artifacts_created:
  - path: "src/presentation/components/layout/WorkspaceLayout.tsx"
    created_by: "dev"
    created_at: "2026-01-31T06:00:00+07:00"
    symlinks:
      - stories/story-22-5.md
      - docs/architecture.md

artifacts_modified:
  - path: "AGENTS.md"
    modified_by: "sprint-manager"
    modified_at: "2026-01-31T05:35:00+07:00"
    changes: "Updated current_phase to 'implementation'"

validations:
  - type: "typecheck"
    result: "pass"
    timestamp: "2026-01-31T06:15:00+07:00"
    
  - type: "tests"
    result: "fail"
    details: "2 tests failing in WorkspaceLayout.test.tsx"
    timestamp: "2026-01-31T06:16:00+07:00"

violations:
  - type: "deprecated-path"
    path: "src/lib/layout/old-grid.ts"
    detected_at: "2026-01-31T06:05:00+07:00"
    resolution: "Blocked write, redirected to src/presentation/"

upstream_impacts:
  - story: "story-22-5"
    epic: "EPIC-UXUI-02"
    sprint: "sprint-2026-01-31"

downstream_impacts:
  - dependents:
      - "WorkspaceLayout.tsx"
      - "ActivityBarTop.tsx"
```

### 7.3 Brain Indexer Tool

```typescript
// .opencode/tools/brain-indexer.ts

import { tool } from "@opencode-ai/plugin"

export default tool({
  description: `Query the project brain for historical context, decisions, and relationships.
Use for:
- Finding why a decision was made
- Understanding artifact relationships
- Tracking delegation chains
- Identifying patterns in violations`,
  
  args: {
    query_type: tool.schema.enum([
      "decisions",
      "violations",
      "artifacts",
      "chains",
      "impacts"
    ]),
    filter: tool.schema.object({
      agent: tool.schema.string().optional(),
      path: tool.schema.string().optional(),
      date_from: tool.schema.string().optional(),
      date_to: tool.schema.string().optional()
    }).optional()
  },
  
  async execute(args, context) {
    const brainDir = path.join(context.directory, "_bmad-output/.brain")
    
    // Load all session files
    const sessions = loadAllSessions(brainDir)
    
    switch (args.query_type) {
      case "decisions":
        return queryDecisions(sessions, args.filter)
      case "violations":
        return queryViolations(sessions, args.filter)
      case "artifacts":
        return queryArtifacts(sessions, args.filter)
      case "chains":
        return queryDelegationChains(sessions, args.filter)
      case "impacts":
        return queryImpacts(sessions, args.filter)
    }
  }
})
```

### 7.4 Auto-Archive on Events

```typescript
// In master-orchestrator.ts or separate plugin

// Archive on session end
"session.deleted": async ({ event }) => {
  const { sessionID } = event.properties
  await archiveSession(sessionID)
}

// Archive on TODO completion
"todo.updated": async ({ event }) => {
  const { todos } = event.properties
  const completed = todos.filter(t => t.completed)
  for (const todo of completed) {
    await archiveTodoCompletion(todo)
  }
}

// Archive on file changes
"file.edited": async ({ event }) => {
  const { path, changes, sessionID } = event.properties
  await recordFileChange(sessionID, path, changes)
}

// Archive delegation returns
"tool.execute.after": async (input, output) => {
  if (input.tool === "task") {
    await recordDelegationReturn(input, output)
  }
}
```

---

## 8. Proposed Meta-Framework Structure

Given the nested folder limitation, here's the final proposed structure:

```
.opencode/
├── opencode.json                       # Main configuration
├── AGENT-STATE.yaml                    # Compact-resilient state (50 lines)
│
├── agents/                             # FLAT - 8 core agents
│   ├── supreme-coordinator.md          # L0 Orchestrator
│   ├── sprint-manager.md               # Sprint management
│   ├── dev.md                          # Development
│   ├── analyst.md                      # Research & analysis
│   ├── architect.md                    # System design
│   ├── reviewer.md                     # Code review
│   ├── tester.md                       # Testing
│   └── writer.md                       # Documentation
│
├── plugins/                            # FLAT - Core plugins
│   ├── master-orchestrator.ts          # Core orchestration
│   ├── context-first.ts                # Purified context injection
│   ├── validation-gate.ts              # Validation enforcement
│   └── brain-recorder.ts               # Brain artifact recording
│
├── tools/                              # FLAT - Custom tools
│   ├── context-loader.ts               # Prompt matrix context
│   ├── long-term-context.ts            # Historical context
│   ├── brain-indexer.ts                # Brain query tool
│   ├── validation.ts                   # Artifact validation
│   ├── governance-check.ts             # Quick governance
│   └── delegation-tracker.ts           # Delegation chain
│
├── skills/                             # FLAT - Essential skills (use prefixes)
│   ├── context-first/SKILL.md
│   ├── upstream-validator/SKILL.md
│   ├── supreme-coordinator-init/SKILL.md
│   ├── sprint-manager-init/SKILL.md
│   ├── story-development/SKILL.md
│   ├── code-review/SKILL.md
│   ├── tdd/SKILL.md
│   ├── brownfield-guard/SKILL.md
│   ├── debug/SKILL.md
│   ├── governance-cascade/SKILL.md
│   └── expert-mode/SKILL.md
│
├── commands/                           # FLAT - Use phase prefixes
│   ├── 1-analysis-research.md
│   ├── 1-analysis-product-brief.md
│   ├── 2-plan-prd.md
│   ├── 2-plan-ux-design.md
│   ├── 3-solutioning-architecture.md
│   ├── 3-solutioning-check-readiness.md
│   ├── 4-impl-story-cycle.md
│   ├── 4-impl-code-review.md
│   ├── 4-impl-sprint-planning.md
│   ├── 4-impl-correct-course.md
│   ├── governance-cascade-full.md
│   ├── expert-skeptic-review.md
│   └── typecheck-loop.md
│
├── prompts/                            # Prompt templates (for skill reference)
│   ├── delegation-reminder.md
│   ├── validation-enforcement.md
│   └── context-anchor.md
│
└── governance/                         # Governance artifacts (reference docs)
    ├── active-cascades.yaml
    ├── signoff-log.yaml
    ├── contracts/
    │   └── codebase-contract.yaml
    └── research/
        └── opencode-plugin-event-research-2026-01-31.md
```

---

## 9. Summary and Next Steps

### 9.1 Key Findings

1. **Nested Folders: NOT SUPPORTED** for any OpenCode component (commands, skills, tools, plugins, agents)
   - **Workaround:** Use flat structure with prefixed naming conventions

2. **Plugin Events:** 25+ events available, with `experimental.*` hooks being most powerful for:
   - `experimental.session.compacting`: State preservation
   - `experimental.chat.system.transform`: Context injection
   - `experimental.chat.messages.transform`: User intent extraction

3. **Custom Tool Context:** Limited to `agent`, `sessionID`, `messageID`, `directory`, `worktree`
   - Access parent sessions via SDK `client.session.get()` and `client.session.children()`

4. **Subtask2 Integration:** Powerful for:
   - Chained workflows with `return`
   - Validation loops with `loop: {until: "condition"}`
   - Parallel execution with `parallel`
   - Context passing with `$RESULT[name]`

### 9.2 Immediate Implementation Priorities

1. **Split master-orchestrator.ts** into focused plugins:
   - `context-first.ts`
   - `validation-gate.ts`
   - `brain-recorder.ts`

2. **Create new tools:**
   - `long-term-context.ts`
   - `brain-indexer.ts`

3. **Create new skills:**
   - `supreme-coordinator-init/SKILL.md`
   - `sprint-manager-init/SKILL.md`

4. **Create subtask2-integrated commands:**
   - `governance-cascade-full.md`
   - `story-cycle-full.md`
   - `expert-skeptic-review.md`

5. **Implement brain artifact system:**
   - `_bmad-output/.brain/` structure
   - Auto-archiving on events

---

**Document Version**: 2.0.0
**Created**: 2026-01-31
**Updated**: 2026-01-31T05:27:00+07:00
**Author**: architect-ext
**Status**: COMPLETE
**Next Step**: Phase 1 Implementation - Split master-orchestrator.ts
