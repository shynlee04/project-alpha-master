# Epic 28 Holistic Integration Analysis

**Created:** 2025-12-22T21:30:00+07:00
**Author:** BMad Master (Platform B)
**Status:** DRAFT - Pending User Review

---

## Critical Feedback Summary

The current Epic 28 scope is **too narrow and isolated**. Story 28-16 created an `AgentConfigDialog` but without understanding:
1. How agents will actually execute tools (read_file, write_file, execute_command)
2. How tool execution streams and events will update UI components
3. How the chat interface will display tool calls, diffs, and approval flows
4. How FileTree, Monaco Editor, and Terminal receive real-time updates

---

## The Full Agent Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  USER REQUEST → CHAT INTERFACE                                                  │
│    "Add a login component to the project"                                       │
└────────────────────────────┬────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  AGENT ORCHESTRATION (Epic 25-1, 26-4)                                          │
│    - Planner Agent determines steps                                             │
│    - Coder Agent executes tools                                                 │
│    - Validator Agent checks results                                             │
└────────────────────────────┬────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  TOOL EXECUTION (Epic 6, 12, 25-2/3/4)                                          │
│                                                                                  │
│  1. read_file("src/App.tsx")                                                    │
│     → Returns content                                                            │
│     → Shown as collapsible block in chat                                        │
│                                                                                  │
│  2. write_file("src/components/Login.tsx", "...")                               │
│     → NEEDS APPROVAL (diff preview shown in chat)                               │
│     → User clicks "Accept" or "Reject"                                          │
│     → On accept: file created, events emitted                                   │
│                                                                                  │
│  3. execute_command("npm", ["install", "react-hook-form"])                      │
│     → Output streams to terminal                                                 │
│     → Chat shows "Running: npm install..."                                      │
│     → Exit code shown on completion                                             │
└────────────────────────────┬────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  EVENT BUS (Epic 10)                                                            │
│    file:created  → FileTree updates + opens in editor                           │
│    file:modified → Monaco refreshes content                                     │
│    process:output → Terminal appends text                                       │
│    sync:started  → StatusBar shows sync indicator                               │
└────────────────────────────┬────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  UI UPDATES (Epic 28 MUST prepare containers for)                               │
│                                                                                  │
│  CHAT INTERFACE:                                                                │
│    - Streaming text (token by token)                                            │
│    - Tool call badges [read_file] [write_file] [execute_command]                │
│    - Collapsible code blocks with syntax highlighting                           │
│    - Diff preview with accept/reject buttons                                    │
│    - Approval overlay for dangerous operations                                  │
│                                                                                  │
│  FILE TREE:                                                                     │
│    - New files appear with animation                                            │
│    - Modified files show indicator                                              │
│    - Folder expansion on file creation                                          │
│                                                                                  │
│  MONACO EDITOR:                                                                 │
│    - Auto-open created files in new tab                                         │
│    - Content refresh on file:modified event                                     │
│    - Decorations for AI-generated code                                          │
│                                                                                  │
│  TERMINAL:                                                                      │
│    - Real-time output streaming                                                 │
│    - Command history tracking                                                   │
│    - Exit code indicators                                                       │
│                                                                                  │
│  STATUS BAR:                                                                    │
│    - Agent status (idle/thinking/executing)                                     │
│    - Tool being used                                                            │
│    - Token usage counter                                                        │
│    - Provider connection status                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚨 CRITICAL: Multi-Agent Orchestration (LangGraph.js)

The IDE is NOT the only interface. Via-Gent will have **multi-agent orchestration** using LangGraph.js with state machines for agent workflows.

### Agent Roles (from mission.md)

| Agent | Role | Tools | UI Representation |
|-------|------|-------|-------------------|
| **Orchestrator** | Coordinates workflow, routes tasks | all tools (read-only) | Workflow status panel |
| **Planner** | Designs architecture, breaks down tasks | read_file, list_files | Planning view, task breakdown |
| **Coder** | Implements code changes | read_file, write_file, execute_command | Code generation, diff preview |
| **Validator** | Tests and validates | execute_command, read_file | Test results, validation report |

### LangGraph Workflow Pattern
```typescript
import { StateGraph } from "@langchain/langgraph";

const workflow = new StateGraph({
  channels: {
    messages: [],
    currentTask: null,
    approvalRequired: false,
    currentAgent: 'orchestrator',
  }
});

workflow.addNode("orchestrator", orchestratorAgent);
workflow.addNode("planner", plannerAgent);
workflow.addNode("coder", coderAgent);
workflow.addNode("validator", validatorAgent);
workflow.addNode("human_approval", humanApprovalNode);

workflow.addConditionalEdges(
  "orchestrator",
  (state) => {
    if (state.needsPlanning) return "planner";
    if (state.needsCoding) return "coder";
    return "validator";
  }
);

workflow.addConditionalEdges(
  "coder",
  (state) => state.approvalRequired ? "human_approval" : "validator"
);

const app = workflow.compile();
```

### UI Needs for Multi-Agent

| Component | Purpose | Epic 28 Story |
|-----------|---------|---------------|
| **AgentStatusIndicator** | Shows which agent is active | 28-18 |
| **WorkflowProgress** | Visual progress through agent chain | 28-XX |
| **HandoffTransition** | Animation when task passes between agents | 28-XX |
| **AgentConversationThread** | Messages grouped by agent | 28-XX |

---

## 🚨 CRITICAL: The IDE is NOT the Only Interface

From `mission.md` and `roadmap.md`, Via-Gent is a **multi-interface platform**:

### Beyond IDE: Other Product Surfaces

| Interface | Purpose | Phase | UI Location |
|-----------|---------|-------|-------------|
| **IDE Workspace** | Code, terminal, preview | Phase 1 ✅ | `/project/$id` |
| **Agent Dashboard** | Configure agents, tools, workflows | Phase 5 | `/agents` |
| **Workflow Visual Editor** | Drag-and-drop agent pipelines | Phase 5 | `/workflows` |
| **Asset Studio** | AI image generation | Phase 7 | `/assets` |
| **Project Templates** | Gallery of starters | Phase 7 | `/templates` |
| **Settings Panel** | LLM providers, preferences | Phase 4 | `/settings` |

### Role-Based Tool Access

From mission.md, different team roles have different tools:

| Role | Available Tools | UI Customization |
|------|-----------------|------------------|
| **Product Manager** | Specification, planning, documentation | Simpler sidebar, focus on planning |
| **Designer** | Asset generation, UI mockups, color tools | Asset panel, visual tools |
| **Developer** | Full IDE: terminal, code, preview | Full workspace |
| **QA Engineer** | Validation, testing, reporting | Test results focus |

### Epic 28 Implications

| Missing Container | Purpose | Integration |
|-------------------|---------|-------------|
| **RoleSelector** | Switch between PM/Designer/Dev/QA modes | Affects visible panels |
| **AssetPanel** (skeleton) | Container for future asset studio | Epic 36 |
| **WorkflowCanvas** (skeleton) | Container for visual editor | Epic 26-4 |
| **SettingsLayout** (skeleton) | Container for LLM provider config | Epic 26-5 |
| **TemplateGallery** (skeleton) | Container for project templates | Epic 34 |

---

---

## Recommended Story Additions to Epic 28 (REVISED)

Based on holistic analysis including multi-agent orchestration and multi-interface architecture:

### Tier 1: Critical Chat + Tool Visibility (Required for AI Foundation)

| Story | Title | Points | Integration | Priority |
|-------|-------|--------|-------------|----------|
| 28-18 | StatusBar with Connection Indicators | 3 | Epic 10, 25, 26 | P0 |
| 28-19 | Chat Tool Call Badge Component | 5 | Epic 6, 12 | P0 |
| 28-20 | Chat Code Block with Actions (Accept/Reject) | 5 | Epic 6, 25-5 | P0 |
| 28-21 | Diff Preview Component | 5 | Epic 6, 25-5 | P0 |
| 28-22 | Approval Overlay Component | 5 | Epic 25-5 | P0 |
| 28-23 | Streaming Message Container | 3 | Epic 6, 25-1 | P0 |

**Subtotal:** 26 points

### Tier 2: Event Bus Subscriptions (Required for Tool→UI sync)

| Story | Title | Points | Integration | Priority |
|-------|-------|--------|-------------|----------|
| 28-24 | FileTree Event Subscriptions | 3 | Epic 10, 6 | P1 |
| 28-25 | Monaco Event Subscriptions | 3 | Epic 10, 6 | P1 |
| 28-26 | Terminal Event Subscriptions | 3 | Epic 10, 6 | P1 |

**Subtotal:** 9 points

### Tier 3: Multi-Agent UX (Required for LangGraph orchestration)

| Story | Title | Points | Integration | Priority |
|-------|-------|--------|-------------|----------|
| 28-28 | AgentStatusIndicator Component | 3 | Epic 25-1, 26-4 | P1 |
| 28-29 | WorkflowProgress Indicator | 3 | Epic 26-4 | P1 |
| 28-30 | AgentConversationThread (grouped by agent) | 5 | Epic 26-4 | P1 |

**Subtotal:** 11 points

### Tier 4: Multi-Interface Skeleton Containers

| Story | Title | Points | Integration | Priority |
|-------|-------|--------|-------------|----------|
| 28-31 | RoleSelector (PM/Designer/Dev/QA) | 3 | Epic 26 | P2 |
| 28-32 | WorkflowCanvas Skeleton | 3 | Epic 26-4 | P2 |
| 28-33 | SettingsLayout Skeleton | 3 | Epic 26-5 | P2 |
| 28-34 | ProviderStatusPanel | 3 | Epic 25, 26-5 | P2 |
| 28-35 | AssetPanel Skeleton | 3 | Epic 36 | P2 |

**Subtotal:** 15 points

### Grand Total

| Tier | Focus | Points |
|------|-------|--------|
| Tier 1 | Chat + Tool Visibility | 26 |
| Tier 2 | Event Bus Subscriptions | 9 |
| Tier 3 | Multi-Agent UX | 11 |
| Tier 4 | Multi-Interface Skeletons | 15 |
| **Total** | **Scope Expansion** | **61 points** |

---

## JSDoc Pattern for Cross-Epic Integration

Every component in Epic 28 should follow:

```tsx
/**
 * [ComponentName] - [Brief Description]
 * 
 * @epic Epic-28 Story 28-XX
 * @integrates [Epic-X Story X-Y] - [Why this integration]
 * @integrates [Epic-X Story X-Y] - [Why this integration]
 * 
 * @listens [event:name] - [What happens on this event]
 * @emits [event:name] - [When this event is emitted]
 * 
 * @roadmap [Future work in other epics]
 * 
 * @example
 * ```tsx
 * <ComponentName prop={value} />
 * ```
 */
```

---

## TanStack AI Tool Patterns (Researched)

From Context7 research, TanStack AI tools work as follows:

### Tool Definition Pattern
```typescript
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

const writeFileDef = toolDefinition({
  name: "write_file",
  description: "Write content to a file in the project",
  inputSchema: z.object({
    path: z.string(),
    content: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    path: z.string(),
  }),
  needsApproval: true, // IMPORTANT: User must approve before execution
});

// Client-side implementation (runs in browser)
const writeFileClient = writeFileDef.client(async (input) => {
  // This executes ONLY after user approval
  await localFSAdapter.writeFile(input.path, input.content);
  eventBus.emit('file:modified', { path: input.path });
  return { success: true, path: input.path };
});
```

### Streaming Tool Results
```typescript
interface ToolResultStreamChunk extends BaseStreamChunk {
  type: 'tool_result';
  toolCallId: string;  // ID of the tool call that was executed
  content: string;     // Result of the tool execution (JSON stringified)
}
```

### UI Integration Points
When a tool call happens:
1. `ToolCallBadge` shows in chat with tool name
2. If `needsApproval: true`, `ApprovalOverlay` appears with diff preview
3. User clicks "Accept" or "Reject"
4. On accept: tool executes, result streams back
5. Event bus emits appropriate event (file:created, file:modified, process:output)
6. UI components subscribed to events update automatically

---

## Immediate Actions

1. **Review this analysis** - Confirm scope expansion is appropriate
2. **Update Epic 28 Specification** - Add new stories 28-18 through 28-27
3. **Update existing Story 28-16 JSDoc** - Done ✅
4. **Create Event Bus Subscription Hooks** - Prepare for Epic 10 wiring
5. **Create Skeleton Components** - Empty containers for future agent UI
6. **Document All Integration Points** - In each component's JSDoc
