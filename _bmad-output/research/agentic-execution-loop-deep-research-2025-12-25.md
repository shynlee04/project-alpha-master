# Research Artifact: Agentic Execution Loop for Via-gent

**Date:** 2025-12-25  
**Author:** BMAD Master (Deep Research Mode)  
**Related Epic:** Epic 29 - Agentic Execution Loop  
**Severity:** P0 - Blocking Feature

---

## 1. Research Objective

Conduct comprehensive research on implementing autonomous agentic execution in Via-gent IDE using TanStack AI SDK, specifically:
- Understanding the `agentLoopStrategy` architecture
- Tool execution and result handling patterns
- Multi-step reasoning with chain-of-thought
- Error handling, fallbacks, and recovery strategies
- Industry-standard agentic patterns (ReAct, Reflexion, etc.)

---

## 2. MCP Tools Consulted

| Tool | Query | Result Summary |
|------|-------|----------------|
| **Context7** | `tool calling agentic loop iteration` | Documented `maxIterations()`, tool states, `ThinkingPart` |
| **Context7** | `thinking reasoning chain of thought` | `ThinkingPart` interface, streaming chunks |
| **Context7** | `ChatClient useChat addToolApprovalResponse` | SSE connection, callbacks, approval flow |
| **Context7** | `error handling fallback retry tool execution` | `ToolResultState` states, error patterns |
| **Context7** | `agent loop strategy custom function` | `combineStrategies()`, `untilFinishReason()`, `AgentLoopState` |
| **Context7** | `needsApproval addToolApprovalResponse` | Full approval flow with UI example |
| **Deepwiki** | TanStack AI tool system architecture | Tool execution flow, `ToolCallPart`, `ToolResultPart`, `StreamProcessor` |
| **Deepwiki** | Data flow and message types | `UIMessage.parts`, chunk accumulation, parallel tool support |
| **Brave Search** | `agentic AI coding IDE 2025 patterns` | ReAct, Reflexion, Tree-of-Thought, Planner-Executor patterns |
| **Codebase Grep** | `useChat`, `toolDefinition` | Via-gent uses `useChat` at line 243, 4 tools with `toolDefinition()` |

---

## 3. Detailed Findings

### 3.1 TanStack AI Agent Loop Architecture

#### Core Types and Interfaces

```typescript
// Agent Loop Strategy - returns true to continue, false to stop
type AgentLoopStrategy = (state: AgentLoopState) => boolean;

// State tracked during agent loop
interface AgentLoopState {
  iterationCount: number;         // Current iteration (0-indexed)
  messages: ModelMessage[];       // Full conversation history
  finishReason: string | null;    // Model's finish reason
}

// Built-in strategies
import { maxIterations, untilFinishReason, combineStrategies } from '@tanstack/ai';

// Examples
agentLoopStrategy: maxIterations(20),                        // Stop after 20 iterations
agentLoopStrategy: untilFinishReason(['stop', 'length']),    // Stop on specific reasons
agentLoopStrategy: combineStrategies([                       // Combine multiple
  maxIterations(10),
  ({ messages }) => messages.length < 100,
]),
```

#### Custom Strategy Pattern
```typescript
// Custom strategy with timeout
const createTimeoutStrategy = (maxMs: number): AgentLoopStrategy => 
  ({ iterationCount }) => {
    const elapsed = Date.now() - startTime;
    return elapsed < maxMs && iterationCount < 50;
  };

// Stuck detection - stop after consecutive failures
const stuckDetection: AgentLoopStrategy = ({ messages }) => {
  const recentResults = messages.slice(-6).filter(m => m.role === 'tool');
  const failures = recentResults.filter(r => r.content.includes('error'));
  return failures.length < 3;
};
```

### 3.2 Message Parts System

```typescript
// All possible message parts in UIMessage.parts[]
interface TextPart {
  type: "text";
  content: string;
}

interface ThinkingPart {
  type: "thinking";
  content: string;  // Chain-of-thought reasoning (UI-only, not sent to model)
}

interface ToolCallPart {
  type: "tool-call";
  id: string;
  name: string;
  arguments: string;       // JSON string
  input?: unknown;         // Parsed arguments
  state: ToolCallState;    // "awaiting-input" | "input-streaming" | "input-complete" | "approval-requested" | "executing" | "output-available"
  approval?: ApprovalRequest;
  output?: unknown;
}

interface ToolResultPart {
  type: "tool-result";
  id: string;
  toolCallId: string;
  tool: string;
  output: unknown;
  state: ToolResultState;  // "pending" | "executing" | "output-available" | "output-error"
  errorText?: string;
}
```

### 3.3 Tool Approval Flow (Human-in-the-Loop)

```typescript
// 1. Define tool with approval requirement
const writeFileDef = toolDefinition({
  name: "write_file",
  description: "Write content to file",
  inputSchema: z.object({
    path: z.string(),
    content: z.string(),
  }),
  needsApproval: true,  // ← Key parameter
});

// 2. Client tool implementation
const writeFile = writeFileDef.client(async ({ path, content }) => {
  await fileSystem.write(path, content);
  return { success: true };
});

// 3. Handle approval in component
const { addToolApprovalResponse } = useChat({ ... });

// When part.state === "approval-requested"
addToolApprovalResponse({
  id: part.approval.id,
  approved: true,  // or false to deny
});
```

### 3.4 Streaming and Error Handling

```typescript
// Stream chunk types
type StreamChunk =
  | { type: "content"; delta: string; content: string }
  | { type: "thinking"; delta: string; content: string }
  | { type: "tool_call"; toolCall: { id: string; name: string; arguments: string } }
  | { type: "tool-input-available"; ... }
  | { type: "approval-requested"; ... }
  | { type: "tool_result"; ... }
  | { type: "done"; finishReason: string }
  | { type: "error"; error: { message: string; code?: string } };

// Error handling in tool definition
const getDataDef = toolDefinition({
  name: "get_data",
  inputSchema: z.object({ id: z.string() }),
  outputSchema: z.object({
    data: z.any().optional(),
    error: z.string().optional(),  // ← Include error in output schema
  }),
});

const getData = getDataDef.client(async ({ id }) => {
  try {
    const result = await fetchData(id);
    return { data: result };
  } catch (error) {
    return { error: `Failed: ${error.message}` };  // ← Return error, don't throw
  }
});
```

### 3.5 Industry Agentic Patterns (2025 Best Practices)

| Pattern | Description | When to Use | TanStack AI Implementation |
|---------|-------------|-------------|---------------------------|
| **ReAct** | Interleave reasoning with tool calls | Multi-step tasks needing external info | `agentLoopStrategy: maxIterations(N)` + tools |
| **Reflexion** | Self-critique and revision | Quality-sensitive outputs | Custom strategy checking content quality |
| **Tree-of-Thought** | Branch and evaluate paths | Complex planning | Multiple parallel chat instances |
| **Planner-Executor** | Separate planning from doing | Complex workflows | Different agent personas |
| **Guardrails** | Policy enforcement layer | Regulated domains | Pre/post tool execution validation |
| **Skill Router** | Route to best tool/model | Mixed workloads | Tool selection in system prompt |

### 3.6 Via-gent Current Architecture Analysis

**Existing Tools (via codebase grep):**
```
src/lib/agent/tools/read-file-tool.ts      → readFileDef (needsApproval: true)
src/lib/agent/tools/write-file-tool.ts     → writeFileDef (needsApproval: true)
src/lib/agent/tools/list-files-tool.ts     → listFilesDef (needsApproval: false)
src/lib/agent/tools/execute-command-tool.ts → executeCommandDef (needsApproval: true)
```

**Current Hook Configuration (use-agent-chat-with-tools.ts:232-243):**
```typescript
const chatOptions = useMemo(() => {
  if (agentTools) {
    return {
      connection,
      tools: agentTools.getClientTools(),
      // ❌ MISSING: agentLoopStrategy
    };
  }
  return { connection };
}, [connection, agentTools]);
```

**Gap Identified:** No `agentLoopStrategy` = agent stops after first tool result.

---

## 4. Sources

| Source | Authority Level | Last Verified |
|--------|-----------------|---------------|
| [TanStack AI GitHub Docs](https://github.com/tanstack/ai/blob/main/docs) | Official Docs | 2025-12-25 |
| [Deepwiki TanStack/ai](https://deepwiki.com/TanStack/ai) | High (Repo Analysis) | 2025-12-25 |
| [ReAct Paper (Yao et al., 2023)](https://arxiv.org/abs/2210.03629) | Academic | 2025-12-25 |
| [Skywork AI Agentic Patterns 2025](https://skywork.ai/blog/agentic-ai-examples-workflow-patterns-2025/) | Industry Analysis | 2025-12-25 |
| [Chip Huyen's 2025 Agents Overview](https://huyenchip.com/2025/01/07/agents.html) | Expert Blog | 2025-12-25 |
| Via-gent Codebase (`src/lib/agent/`) | Internal | 2025-12-25 |

---

## 5. Validation Status

### Research Validation Checklist

#### API Signatures (Context7)
- [x] `AgentLoopStrategy` type documented
- [x] `maxIterations()` function signature confirmed
- [x] `untilFinishReason()` function signature confirmed
- [x] `combineStrategies()` function signature confirmed
- [x] `AgentLoopState` interface verified
- [x] `ToolCallPart` and `ToolResultPart` states documented

#### Architecture Understanding (Deepwiki)
- [x] StreamProcessor chunk accumulation understood
- [x] Tool result → model feedback loop documented
- [x] Parallel tool execution architecture confirmed
- [x] Message parts type system mapped

#### Best Practices (Brave/Web)
- [x] ReAct pattern documented with source
- [x] Reflexion pattern documented with source
- [x] Guardrails pattern documented
- [x] 2025-dated sources verified

#### Codebase Analysis (Grep)
- [x] `useChat` usage locations identified
- [x] `toolDefinition` usage confirmed in 4 tools
- [x] Missing `agentLoopStrategy` confirmed

#### Cross-Validation
- [x] Context7 API signatures match Deepwiki architecture
- [x] TanStack AI patterns align with industry ReAct standard
- [x] Codebase gap aligns with observed symptoms

---

## 6. Implementation Decision

### Selected Approach: Phased `AgentLoopStrategy` Integration

**Phase 1: Basic Loop (Story 29-1)**
- Add `maxIterations(10)` to `chatOptions` in `use-agent-chat-with-tools.ts`
- Expose `maxIterations` as configurable option

**Phase 2: State Tracking (Story 29-2)**
- Emit `agent:iteration:*` events via WorkspaceEvents
- Track iteration count in component state

**Phase 3: Smart Termination (Story 29-3)**
- Implement `combineStrategies()` with:
  - `maxIterations(15)`
  - `untilFinishReason(['stop'])`
  - Custom stuck detection

**Phase 4: Error Recovery (Story 29-4)**
- Handle `output-error` state gracefully
- Implement retry logic for transient failures
- Human handoff after 3 consecutive failures

### Justification
- TanStack AI's built-in strategies reduce implementation risk
- Phased approach allows incremental testing
- Matches industry ReAct pattern
- Preserves existing approval flow (`needsApproval` works within loop)

### Alternatives Considered
1. **Custom loop outside useChat** - Rejected: Duplicates SDK functionality
2. **Server-side only loop** - Rejected: Loses client tool capability
3. **Third-party orchestrator** - Rejected: Adds dependency, doesn't leverage TanStack AI

---

## 7. Risks and Uncertainties

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Infinite loop causing resource exhaustion | Medium | High | `maxIterations(15)` hard limit |
| User confusion during multi-step execution | Medium | Medium | UI progress indicator per iteration |
| Tool failures cascading | Low | High | Error-in-output pattern + stuck detection |
| Approval timeout blocking loop | Medium | Medium | Document expected UX flow |
| Performance degradation with many iterations | Low | Medium | Monitor and optimize |

### Unresolved Questions
1. **Should iterations persist across browser refresh?** (Probably no - start fresh)
2. **What's the ideal default maxIterations?** (Research suggests 10-20)
3. **Should stuck detection be agent-persona specific?** (Possibly)

---

## 8. Approval

- [x] Self-validated via checklist
- [ ] Peer reviewed (pending user approval)
- [ ] Approved to proceed

---

## 9. Incident Trigger & Impact Analysis

> [!CAUTION]
> This section documents the original incident that triggered this research.

**Incident ID:** INC-2025-12-25-001  
**Related Incident:** INC-2025-12-24-001 (MVP consolidation)

### Observed Behavior

During testing of MVP-3 (Tool Execution - File Operations), agents demonstrated inability to:
- Read files from various directory levels
- Iterate autonomously after first tool call
- Complete multi-step tasks without user re-prompting

### User Reports (Agent Testing)
```
Agent 1: "Dường như tôi không thể truy cập vào thư mục gốc..."
Agent 2: "Tuyệt vời! Tôi sẽ bắt đầu test..." [then hung without completing]
```

### Impact Assessment

| Feature | Status | Impact |
|---------|--------|--------|
| Single tool call | ✅ Works | Agent can execute 1 tool per message |
| Multi-step plans | ❌ Broken | Agent cannot chain operations |
| Self-correction | ❌ Broken | Agent cannot retry on failure |
| File exploration | ❌ Broken | Agent cannot browse directory tree |
| Test verification | ❌ Broken | Agent cannot run tests then read results |

### User Experience Impact
- Users must manually prompt for each step
- Agent appears "stuck" after first operation
- No autonomous task completion
- Inferior to Cursor/Windsurf/Roo Code

### Lessons Learned

1. **Research-to-Implementation Gap**: TanStack AI agentic cycle research existed but wasn't implemented
2. **Integration Over Components**: Tool implementations verified but agentic integration untested
3. **E2E Testing Critical**: Manual agent testing revealed gap that unit tests didn't catch

### Process Improvements

- Add "agentic loop" to Definition of Done for agent features
- Update test plans to include multi-step scenarios
- Cross-reference research docs during implementation

---

## Appendix: Key Code Snippets

### A. Required Change to use-agent-chat-with-tools.ts

```typescript
// Add import
import { maxIterations, combineStrategies, untilFinishReason } from '@tanstack/ai';

// Update options interface
export interface UseAgentChatWithToolsOptions {
  // ... existing options
  maxIterations?: number;  // Default: 10
  loopStrategy?: 'default' | 'developer' | 'planner';
}

// Update chatOptions
const chatOptions = useMemo(() => {
  if (agentTools) {
    const strategy = options.loopStrategy === 'developer' 
      ? maxIterations(15)
      : options.loopStrategy === 'planner'
        ? maxIterations(5)
        : maxIterations(options.maxIterations ?? 10);
    
    return {
      connection,
      tools: agentTools.getClientTools(),
      agentLoopStrategy: strategy,  // ← KEY ADDITION
    };
  }
  return { connection };
}, [connection, agentTools, options.maxIterations, options.loopStrategy]);
```

### B. Thinking/Reasoning Display Component

```typescript
// Handle ThinkingPart in message rendering
{message.parts.map((part) => {
  if (part.type === 'thinking') {
    return (
      <details key={part.id} className="thinking-section">
        <summary>💭 Agent reasoning</summary>
        <pre>{part.content}</pre>
      </details>
    );
  }
  // ... other parts
})}
```
