# TanStack AI Agentic Cycle - Technical Research

**Research Date:** 2025-12-10
**Research Type:** Technical - High Priority
**Purpose:** Implementation guide for agentic cycles with maxIterations and tool approval

---

## Executive Summary

TanStack AI provides sophisticated agent loop control through `AgentLoopStrategy` and built-in strategies like `maxIterations`. This enables multi-step agent workflows with controlled iteration limits, tool approval, and automatic termination conditions for via-gent's multi-agent orchestration.

**Key Findings:**
- ✅ Configurable iteration limits prevent infinite loops
- ✅ Tool approval integration with agent cycles
- ✅ Multiple termination strategies (max iterations, finish reasons)
- ✅ State tracking across iterations
- ✅ Custom strategy composition support

---

## 1. Core Agent Loop Concepts

### 1.1 Agent Loop Flow

```
User Message
    ↓
Agent Analyzes
    ↓
Tool Call (if needed)
    ↓
Tool Execution + Approval (if required)
    ↓
Agent Processes Result
    ↓
Check Loop Strategy
    ↓
Continue or Stop
```

### 1.2 AgentLoopState Interface

```typescript
interface AgentLoopState<TData extends Record<string, any> = Record<string, any>> {
  iterationCount: number;           // Current iteration (0-based)
  messages: ModelMessage[];          // Conversation history
  finishReason: string | null;       // Why loop terminated
  data?: TData;                      // Custom state data
}
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/reference/interfaces/AgentLoopState.md

### 1.3 AgentLoopStrategy Type

```typescript
type AgentLoopStrategy = (state: AgentLoopState) => boolean;
// Returns: true = continue loop, false = stop loop
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/reference/type-aliases/AgentLoopStrategy.md

---

## 2. Built-in Loop Strategies

### 2.1 maxIterations Strategy

```typescript
import { maxIterations, chat } from "@tanstack/ai";
import { openai } from "@tanstack/ai-openai";

const stream = chat({
  adapter: openai(),
  messages: [...],
  model: "gpt-4o",
  agentLoopStrategy: maxIterations(20), // Max 20 iterations
});

// Function signature
function maxIterations(max: number): AgentLoopStrategy;
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/reference/functions/maxIterations.md

### 2.2 untilFinishReason Strategy

```typescript
import { untilFinishReason } from "@tanstack/ai";

const stream = chat({
  adapter: openai(),
  model: "gpt-4o",
  messages: [...],
  agentLoopStrategy: untilFinishReason(["stop", "length"]),
});

// Function signature
function untilFinishReason(stopReasons: string[]): AgentLoopStrategy;
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/reference/functions/untilFinishReason.md

### 2.3 Combined Strategies (Python Pattern)

```python
from tanstack_ai import (
    max_iterations,
    until_finish_reason,
    combine_strategies,
)

# Combine multiple strategies
strategy = combine_strategies([
    max_iterations(10),           # Max 10 iterations
    until_finish_reason(["stop"]), # Or stop signal
])
```

---

## 3. Custom Loop Strategies

### 3.1 Custom Iteration Limit

```typescript
const customStrategy: AgentLoopStrategy = ({ iterationCount, messages }) => {
  // Continue for up to 5 iterations
  return iterationCount < 5;
};

const stream = chat({
  adapter: openai(),
  messages: [...],
  agentLoopStrategy: customStrategy,
});
```

### 3.2 Message-Based Termination

```typescript
const messageLimitStrategy: AgentLoopStrategy = ({ messages }) => {
  // Stop if more than 50 total messages
  return messages.length < 50;
};

// Or check for specific termination condition
const taskCompleteStrategy: AgentLoopStrategy = ({ messages }) => {
  const lastMessage = messages[messages.length - 1];
  // Continue if no "task_complete" marker
  return !lastMessage.content.includes("TASK_COMPLETE");
};
```

### 3.3 Tool Result Monitoring

```typescript
const successThresholdStrategy: AgentLoopStrategy = ({ messages }) => {
  const toolResults = messages
    .flatMap(m => m.parts || [])
    .filter(p => p.type === "tool_result");
  
  // Continue if less than 3 successful tool results
  return toolResults.filter(r => r.output?.success).length < 3;
};
```

---

## 4. Integration with useChat

### 4.1 Client-Side Agent Loop

```typescript
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import { createChatClientOptions } from "@tanstack/ai-client";

const chatOptions = createChatClientOptions({
  connection: fetchServerSentEvents("/api/chat"),
  tools: agentTools,
  // Agent loop configuration passed to server
  body: {
    agentLoopStrategy: {
      type: "maxIterations",
      value: 10,
    },
  },
});

const { 
  messages, 
  sendMessage, 
  addToolApprovalResponse,
  isLoading 
} = useChat(chatOptions);

// Handle tool approval during loop
const handleToolApproval = async (toolCallId: string, approved: boolean) => {
  await addToolApprovalResponse({ id: toolCallId, approved });
  
  // Loop continues automatically after approval
};
```

### 4.2 Server-Side Loop Configuration

```typescript
// src/routes/api.chat.ts
import { chat, maxIterations } from "@tanstack/ai";

export async function POST(request: Request) {
  const { messages, agentLoopStrategy } = await request.json();

  // Parse client strategy
  let strategy: AgentLoopStrategy;
  if (agentLoopStrategy?.type === "maxIterations") {
    strategy = maxIterations(agentLoopStrategy.value);
  } else {
    strategy = maxIterations(10); // Default
  }

  const stream = chat({
    adapter: openai(),
    messages,
    model: "gpt-4o",
    tools: serverTools,
    agentLoopStrategy: strategy,
  });

  return toServerSentEventsStream(stream);
}
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/guides/agentic-cycle.md

---

## 5. Tool Approval in Agent Loops

### 5.1 Requiring Approval

```typescript
import { toolDefinition } from "@tanstack/ai";

const dangerousOperationDef = toolDefinition({
  name: "delete_file",
  description: "Delete a file from the project",
  inputSchema: z.object({
    path: z.string(),
  }),
  needsApproval: true, // 🔑 This makes it require approval
});

// Tool will pause loop until approval
```

### 5.2 Approval UI Integration

```typescript
function AgentChatInterface() {
  const { messages, addToolApprovalResponse } = useChat(chatOptions);
  
  // Extract pending tool approvals
  const pendingApprovals = messages
    .flatMap(m => m.parts || [])
    .filter(p => p.type === "tool_call" && p.needsApproval)
    .map(p => ({
      id: p.id,
      name: p.toolName,
      input: p.input,
    }));

  return (
    <div>
      <MessagesList messages={messages} />
      
      {pendingApprovals.length > 0 && (
        <ToolApprovalModal>
          {pendingApprovals.map(tool => (
            <ApprovalItem
              key={tool.id}
              tool={tool}
              onApprove={() => addToolApprovalResponse({ 
                id: tool.id, 
                approved: true 
              })}
              onReject={() => addToolApprovalResponse({ 
                id: tool.id, 
                approved: false 
              })}
            />
          ))}
        </ToolApprovalModal>
      )}
      
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

### 5.3 Approval State Tracking

```typescript
interface ApprovalState {
  toolCallId: string;
  status: "pending" | "approved" | "rejected";
  approvedAt?: Date;
  approvedBy?: string;
}

// Track approvals across iterations
const approvalStore = new Map<string, ApprovalState>();

// In agent loop
messages.forEach(message => {
  message.parts?.forEach(part => {
    if (part.type === "tool_call") {
      if (part.needsApproval) {
        // Pause and wait for approval
        pendingApprovals.push(part);
      } else {
        // Execute immediately
        executeTool(part);
      }
    }
  });
});
```

---

## 6. Multi-Agent Orchestration Patterns

### 6.1 Agent Handoff Pattern

```typescript
// Orchestrator → Coder handoff
const handOffToCoderDef = toolDefinition({
  name: "handoff_to_coder",
  description: "Transfer task to Coder agent",
  inputSchema: z.object({
    taskId: z.string(),
    context: z.string(),
    priority: z.enum(["low", "medium", "high"]),
  }),
  needsApproval: true,
}).client(async ({ taskId, context, priority }) => {
  // Emit handoff event
  eventBus.emit("agent:handoff", {
    from: "orchestrator",
    to: "coder",
    taskId,
    context,
    priority,
    timestamp: new Date().toISOString(),
  });
  
  // Switch active agent
  activeAgent.set("coder");
  
  return { 
    success: true, 
    transferredAt: new Date().toISOString() 
  };
});

// Coder agent loop with different strategy
const coderStrategy = maxIterations(15); // Coder gets more iterations
```

### 6.2 Parallel Agent Execution

```typescript
// Spawn multiple agents in parallel
const orchestratorChat = useChat({
  id: "orchestrator",
  connection: fetchServerSentEvents("/api/chat"),
  body: {
    agentLoopStrategy: { type: "maxIterations", value: 5 },
  },
});

const coderChat = useChat({
  id: "coder",
  connection: fetchServerSentEvents("/api/chat"),
  body: {
    agentLoopStrategy: { type: "maxIterations", value: 15 },
  },
});

// Coordinate via shared state
useEffect(() => {
  if (orchestratorChat.messages.some(m => m.parts?.some(p => 
    p.type === "tool_call" && p.toolName === "handoff_to_coder"
  ))) {
    // Activate coder when handoff detected
    activeAgent.set("coder");
  }
}, [orchestratorChat.messages]);
```

---

## 7. Iteration State Management

### 7.1 State Persistence

```typescript
interface AgentExecutionState {
  iterationCount: number;
  startTime: Date;
  lastActivity: Date;
  approvedTools: string[];
  completedTasks: string[];
  activeAgent: string;
}

// Persist state across sessions
function persistAgentState(state: AgentExecutionState) {
  localStorage.setItem(
    `agent_state_${state.activeAgent}`,
    JSON.stringify(state)
  );
}

function loadAgentState(agentId: string): AgentExecutionState {
  const stored = localStorage.getItem(`agent_state_${agentId}`);
  return stored ? JSON.parse(stored) : {
    iterationCount: 0,
    startTime: new Date(),
    lastActivity: new Date(),
    approvedTools: [],
    completedTasks: [],
    activeAgent: agentId,
  };
}
```

### 7.2 Progress Tracking

```typescript
function AgentProgressTracker() {
  const [state, setState] = useState<AgentExecutionState>();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setState(current => ({
        ...current,
        iterationCount: current.iterationCount + 1,
        lastActivity: new Date(),
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="agent-progress">
      <ProgressBar 
        value={state.iterationCount} 
        max={10}
        label={`Iteration ${state.iterationCount}/10`}
      />
      <div className="stats">
        <span>Active: {state.activeAgent}</span>
        <span>Runtime: {formatDuration(state.startTime)}</span>
      </div>
    </div>
  );
}
```

---

## 8. Error Handling & Recovery

### 8.1 Loop Timeout Protection

```typescript
const timeoutStrategy: AgentLoopStrategy = ({ iterationCount, startTime }) => {
  const elapsed = Date.now() - startTime;
  const maxDuration = 5 * 60 * 1000; // 5 minutes
  
  // Continue if under iteration limit and time limit
  return iterationCount < 20 && elapsed < maxDuration;
};

// In chat configuration
const stream = chat({
  adapter: openai(),
  messages: [...],
  agentLoopStrategy: timeoutStrategy,
});
```

### 8.2 Tool Failure Recovery

```typescript
const resilientStrategy: AgentLoopStrategy = ({ messages }) => {
  const failedTools = messages
    .flatMap(m => m.parts || [])
    .filter(p => p.type === "tool_result" && p.output?.success === false);
  
  // Stop after 3 consecutive failures
  const consecutiveFailures = getConsecutiveFailures(messages);
  return consecutiveFailures < 3;
};
```

---

## 9. via-gent Implementation

### 9.1 Agent Loop Configuration

```typescript
// src/lib/agents/loop-config.ts
export const AGENT_LOOP_CONFIGS = {
  orchestrator: {
    strategy: maxIterations(5),
    description: "High-level task coordination",
    approvalRequired: ["handoff_to_coder", "handoff_to_validator"],
  },
  planner: {
    strategy: maxIterations(10),
    description: "Feature planning and breakdown",
    approvalRequired: ["create_task", "assign_story"],
  },
  coder: {
    strategy: maxIterations(15),
    description: "Code implementation",
    approvalRequired: ["delete_file", "run_command"],
  },
  validator: {
    strategy: maxIterations(8),
    description: "Code validation and testing",
    approvalRequired: ["merge_pr", "deploy"],
  },
  assetGen: {
    strategy: maxIterations(12),
    description: "Asset generation",
    approvalRequired: ["delete_asset"],
  },
};
```

### 9.2 Dynamic Strategy Selection

```typescript
function getAgentStrategy(agentId: string, taskType?: string): AgentLoopStrategy {
  const config = AGENT_LOOP_CONFIGS[agentId];
  
  if (taskType === "complex") {
    // Give more iterations for complex tasks
    return maxIterations(config.strategy({ iterationCount: 0 }) ? 20 : 5);
  }
  
  return config.strategy;
}
```

---

## 10. Performance Optimization

### 10.1 Iteration Batching

```typescript
// Batch multiple tool calls in one iteration
const batchStrategy: AgentLoopStrategy = ({ messages }) => {
  const recentTools = messages
    .slice(-5) // Last 5 messages
    .flatMap(m => m.parts || [])
    .filter(p => p.type === "tool_call");
  
  // Limit to 3 tool calls per iteration
  return recentTools.length < 3;
};
```

### 10.2 Early Termination

```typescript
const earlyTerminationStrategy: AgentLoopStrategy = ({ messages, finishReason }) => {
  // Stop if agent signals completion
  if (finishReason === "stop") return false;
  
  // Stop if all required tasks completed
  const completedTasks = messages
    .flatMap(m => m.parts || [])
    .filter(p => p.type === "tool_result" && p.output?.taskComplete)
    .length;
  
  return completedTasks < REQUIRED_TASKS;
};
```

---

## 11. Source References

1. **Agentic Cycle Guide**: https://github.com/tanstack/ai/blob/main/docs/guides/agentic-cycle.md
2. **maxIterations API**: https://github.com/tanstack/ai/blob/main/docs/reference/functions/maxIterations.md
3. **untilFinishReason API**: https://github.com/tanstack/ai/blob/main/docs/reference/functions/untilFinishReason.md
4. **AgentLoopState**: https://github.com/tanstack/ai/blob/main/docs/reference/interfaces/AgentLoopState.md
5. **AgentLoopStrategy**: https://github.com/tanstack/ai/blob/main/docs/reference/type-aliases/AgentLoopStrategy.md

---

## 12. Next Steps for via-gent Implementation

### Phase 1: Basic Loop Control (Week 1)
1. Implement maxIterations for each agent
2. Add tool approval UI
3. Create loop state tracking
4. Test iteration limits

### Phase 2: Multi-Agent Coordination (Week 2)
1. Implement agent handoff pattern
2. Add parallel agent execution
3. Create coordination protocols
4. Test cross-agent communication

### Phase 3: Advanced Strategies (Week 3)
1. Custom loop strategies per task type
2. State persistence across sessions
3. Performance monitoring
4. Recovery mechanisms

---

**Status:** ✅ Research Complete
**Confidence:** High
**Implementation Ready:** Yes
