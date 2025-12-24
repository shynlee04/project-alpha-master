# Coding Agent Knowledge Synthesis v2.0

**Date:** 2025-12-24T19:45:00+07:00  
**Type:** Research Artifact  
**Status:** IN PROGRESS  
**Referenced By:** sprint-status.yaml, bmm-workflow-status.yaml

---

## 1. Executive Summary: Critical Gaps Identified

### What's Missing (Root Causes of E2E Failure)

| Gap | Impact | Research Source |
|-----|--------|-----------------|
| **No System Prompt** | Agent has no identity/workflow | Roo Code analysis |
| **No Context Management** | 100K+ tokens unmanaged | Web research 2025 |
| **No Multi-Turn Persistence** | Conversations lost on refresh | TanStack AI docs |
| **State Confusion** | TanStack Store vs Zustand vs IndexedDB | Codebase analysis |
| **Tool Facades Unwired** | Tools exist but not connected | Story 25-R1 Task T2 |

---

## 2. TanStack AI SDK Patterns (December 2025)

### 2.1 Tool Execution Architecture

**Tool States (from official docs):**
```
approval-requested → executing → output-available
                                     ↓
                              output-error (on failure)
                                     ↓
                              cancelled (user denied)
```

**Client Tools Pattern:**
```typescript
import { clientTools, createChatClientOptions } from "@tanstack/ai-client";
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";

// Define tools with client implementations
const updateUI = updateUIDef.client((input) => {
  setNotification(input.message);
  return { success: true };
});

const tools = clientTools(updateUI, saveToStorage);

const chatOptions = createChatClientOptions({
  connection: fetchServerSentEvents("/api/chat"),
  tools,  // ✅ Automatic execution, full type safety
});

const { 
  messages, 
  sendMessage, 
  isLoading, 
  addToolApprovalResponse 
} = useChat(chatOptions);
```

### 2.2 Approval Flow

**Server-Side (needsApproval: true):**
- Execution paused until explicit approval
- State: `approval-requested`

**Client-Side:**
```typescript
addToolApprovalResponse({
  id: toolCallId,
  approved: true  // or false to cancel
});
```

---

## 3. AI Coding Agent Identity Design (2025 Best Practices)

### 3.1 System Prompt Architecture (from Claude Code / Roo Code research)

**Modern agents use MODULAR prompts, not monolithic:**

```
┌─────────────────────────────────────────┐
│           SYSTEM PROMPT                 │
├─────────────────────────────────────────┤
│ 1. Role Definition (identity)          │
│ 2. Tool Definitions (capabilities)     │
│ 3. Mode-Specific Rules (restrictions)  │
│ 4. User Instructions (preferences)     │
│ 5. Tool Outputs (context from prev)    │
└─────────────────────────────────────────┘
```

**Key Insight (web research [8]):**
> Claude Code utilizes a modular and context-aware prompt architecture, 
> dynamically assembling multiple prompt fragments based on the mode, 
> tools being used, sub-agents spawned, and environmental variables.

### 3.2 Roo Code Mode Architecture

**Mode = Named Configuration with:**
- `slug`: unique identifier
- `roleDefinition`: core identity/expertise
- `customInstructions`: behavioral guidelines
- `whenToUse`: guidance for mode selection/orchestration
- `groups`: allowed toolsets and file permissions

**Rules Hierarchy:**
1. Global Rules (`~/.roo/rules/`)
2. Workspace Rules (`.roo/rules/`)
3. Mode-Specific Rules (`.roo/rules-{modeSlug}/`)

### 3.3 Recommended MVP System Prompt Structure

```typescript
export const CODING_AGENT_SYSTEM_PROMPT = `
# Identity
You are a senior software engineer in Via-Gent, a browser-based IDE.

# Capabilities
Available tools:
- read_file(path): Read file from workspace
- write_file(path, content): Create/modify file (requires approval)
- list_files(path): List directory contents
- execute_command(cmd): Run in WebContainer terminal (requires approval)

# Workflow
1. UNDERSTAND: Read relevant files before making changes
2. PLAN: State approach before writing code
3. EXECUTE: Make small, testable changes
4. VERIFY: Run type checks after modifications

# Rules
- ALWAYS read before modifying
- EXPLAIN tool calls before executing
- Use relative paths from project root
- Check sync status before file operations

# Context Awareness
- React/TypeScript project
- Monaco editor for code viewing
- Files sync between LocalFS ↔ WebContainer
- User approval required for write/execute tools
`;
```

---

## 4. Context Window Management (2025)

### 4.1 Current State of LLMs

- **100K+ tokens** now routine (Gemini 2.0: 1M, Claude: 200K)
- **Cost scales** with context size
- **Attention degrades** on very long contexts

### 4.2 Recommended Strategy: Context Engineering

```
Context Window (100% capacity)
├── System Prompt: ~10%
├── Tool Definitions: ~5%
├── Conversation History: ~60%
├── Current Task Context: ~20%
└── Buffer: ~5%
```

**Key Patterns:**
1. **Offload**: Persist conversation to IndexedDB
2. **Reduce**: Summarize older turns when > 80% threshold
3. **Isolate**: New conversation per major task

### 4.3 MVP Implementation

```typescript
interface ContextManager {
  // Track token usage
  getTokenCount(): number;
  getUsagePercent(): number;
  
  // Threshold actions
  shouldCondense(): boolean; // > 80%
  condenseHistory(): Promise<ConversationSummary>;
  
  // Persistence
  saveToIndexedDB(threadId: string): Promise<void>;
  loadFromIndexedDB(threadId: string): Promise<Message[]>;
}
```

---

## 5. Multi-Turn Conversation Design

### 5.1 Key Challenges

| Challenge | Solution |
|-----------|----------|
| Context retention | Thread-based persistence |
| Goal tracking | System prompt with task extraction |
| Recovery from errors | User feedback loop + retry logic |
| Topic shifts | Explicit "new task" detection |

### 5.2 Thread Interface

```typescript
interface ConversationThread {
  id: string;
  projectId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  summary?: string;  // For context condensing
  tokenCount: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}
```

### 5.3 MVP Scope Decisions

| Question | MVP Answer |
|----------|------------|
| How many modes? | 1 (Code mode only) |
| User-configurable system prompt? | No (hardcoded) |
| Auto context condensing? | No (warn only) |
| Thread management UI? | Yes (new/list/delete) |
| Per-project threads? | Yes |

---

## 6. State Management Cleanup Required

### 6.1 Current Confusion (Root Cause)

```
LEGACY (remove/consolidate):
├── TanStack Store (some places)
├── IndexedDB direct access (obsolete)
└── React useState for persistent data

CURRENT (use these):
├── Zustand + persist middleware → localStorage/IndexedDB
├── Dexie → structured IndexedDB tables
└── WorkspaceContext → shared refs/state
```

### 6.2 Target Architecture

```
┌─────────────────────────────────────────────────┐
│                 State Layer                      │
├─────────────────────────────────────────────────┤
│  Zustand Stores (with persist):                 │
│  - agents-store.ts (agent configs)             │
│  - threads-store.ts (conversation threads)     │
│  - settings-store.ts (user preferences)        │
├─────────────────────────────────────────────────┤
│  Dexie (structured data):                       │
│  - projects (metadata, handles)                 │
│  - conversations (archive)                      │
├─────────────────────────────────────────────────┤
│  WorkspaceContext (runtime refs):               │
│  - localAdapterRef                              │
│  - syncManagerRef                               │
│  - eventBus                                     │
└─────────────────────────────────────────────────┘
```

---

## 7. Sprint Cleanup: Epic/Story Reconciliation

### 7.1 Overlapping Epics Identified

| Epic | Scope | Status | Overlap |
|------|-------|--------|---------|
| Epic 12 | Tool facades | PARTIAL | With Epic 25 tool wiring |
| Epic 25 | AI Foundation | IN_PROGRESS | With Epic 12, 28 |
| Epic 28 | UX Design System | IN_PROGRESS | Chat UI with Epic 25 |
| Epic 27 | State Architecture | IN_PROGRESS | State cleanup |

### 7.2 Recommended Consolidation

**Create: Epic "AI Agent Vertical Slice"**
- Combines: Epic 12 (remaining) + Epic 25 (remaining) + chat UI from Epic 28
- Focus: ONE working E2E flow before expanding
- Stories numbered: MVP-1, MVP-2, etc.

---

## 8. Research Sources

### MCP Tools Used
- **Context7**: TanStack AI docs (`/tanstack/ai`, `/websites/tanstack_ai`)
- **Web Search**: Claude Code, Cursor, Windsurf patterns 2025

### Project Documents Analyzed
- `_bmad-output/proposal/roo-code-custom-instruction.md` (295 lines)
- `_bmad-output/proposal/roo-code-modes-agents.md` (628 lines)
- `_bmad-output/sprint-artifacts/epic-25-11-06-research-analysis-request.md` (650 lines)
- `_bmad-output/epics/epic-25-ai-foundation-sprint-new-2025-12-21.md` (123 lines)
- `_bmad-output/epics/epic-12-agent-tool-interface-layer.md` (86 lines)

### Key Web Sources
- [medium.com] Claude Code modular prompt architecture
- [augmentcode.com] AI agent prompt components
- [siliconflow.com] 100K+ token context windows 2025

---

## 9. Action Items for Sprint Planning

### Immediate (correct-course v9)
1. [ ] Create consolidated MVP epic from Epic 12 + 25 + 28 overlap
2. [ ] Update sprint-status.yaml with proper story connections
3. [ ] Remove dead/orphan stories
4. [ ] Create state management cleanup story

### Short-Term (Phase 3-4)
1. [ ] Complete Story 25-R1 Task T2 (facade wiring) - DONE
2. [ ] Create threads-store.ts with Zustand persist
3. [ ] Wire thread persistence to AgentChatPanel
4. [ ] Implement context token tracking

### Reference Stories Affected
- 25-R1: Task T2 now complete (facade wiring)
- NEW: System prompt (architectural decision, not in existing stories)
- NEW: Thread persistence (not in existing stories)
- NEW: Context management (not in existing stories)

---

**Document Status:** IN PROGRESS - Awaiting user review for sprint planning
