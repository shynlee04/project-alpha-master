---
date: 2025-12-27
time: 18:15:00
phase: Implementation
team: Team-B
agent_mode: bmad-bmm-architect
---

# Epic 29 Specifications: Agentic Execution Loop

**Document ID**: E29-SPEC-2025-12-27-001
**Epic**: Epic 29 - Agentic Execution Loop
**Status**: REQUIREMENTS DEFINED
**Priority**: P0
**Execution**: CONSECUTIVE with Team A (post-MVP completion)

---

## Executive Summary

This document provides comprehensive technical specifications for Epic 29 (Agentic Execution Loop), expanding on the existing Epic 29 definition with detailed requirements for state tracking, iteration UI, intelligent termination, and E2E validation.

**Context**: Epic 29 is currently in BACKLOG with P0 priority, deferred to avoid MVP-3/MVP-4 interference. The temporary `maxIterations(3)` safety measure is in place during MVP validation. Full implementation is planned for post-MVP completion.

**Key Objectives**:
1. Implement complete agentic loop with configurable iteration limits (not hardcoded to 3)
2. Add state tracking for agent execution iterations and history
3. Create iteration UI components for visualization and navigation
4. Implement intelligent termination strategies with success/failure detection
5. Enable user intervention and error recovery mechanisms
6. Execute E2E validation with multi-step agent tasks

**Reference Documents**:
- Epic 29 Definition: [`_bmad-output/epics/epic-29-agentic-execution-loop.md`](_bmad-output/epics/epic-29-agentic-execution-loop.md)
- Course Correction Analysis: [`_bmad-output/course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md`](_bmad-output/course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md)
- State Management Requirements: [`_bmad-output/team-b/state-management-requirements-2025-12-27.md`](_bmad-output/team-b/state-management-requirements-2025-12-27.md)
- MVP Sprint Plan: [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)

---

## 1. Agentic State Tracking Requirements

### 1.1 State Persistence Architecture

**Goal**: Track agent execution state across iterations with persistence to IndexedDB for recovery and history navigation.

#### 1.1.1 Agent Loop State Interface

```typescript
// In src/lib/agent/state/agent-loop-state.ts
export interface AgentLoopState {
  /** Unique identifier for this execution session */
  sessionId: string;

  /** Current iteration count (1-indexed) */
  currentIteration: number;

  /** Maximum allowed iterations (configurable, not hardcoded) */
  maxIterations: number;

  /** Agent finish reason from TanStack AI */
  finishReason: string | null;

  /** Timestamp when loop started */
  startedAt: number;

  /** Timestamp when loop completed/terminated */
  completedAt: number | null;

  /** Total duration in milliseconds */
  duration: number | null;

  /** Iteration history (chronological order) */
  iterations: AgentIteration[];

  /** Current status of the loop */
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error' | 'terminated';
}
```

#### 1.1.2 Agent Iteration Interface

```typescript
export interface AgentIteration {
  /** Iteration number (1-indexed) */
  iterationNumber: number;

  /** Timestamp when iteration started */
  startedAt: number;

  /** Timestamp when iteration completed */
  completedAt: number | null;

  /** Duration in milliseconds */
  duration: number | null;

  /** Tool calls made in this iteration */
  toolCalls: ToolCallRecord[];

  /** Messages exchanged in this iteration */
  messages: MessageRecord[];

  /** Error if iteration failed */
  error: string | null;

  /** Success/failure status */
  status: 'in_progress' | 'completed' | 'failed';
}
```

#### 1.1.3 Tool Call Record Interface

```typescript
export interface ToolCallRecord {
  /** Unique identifier for this tool call */
  id: string;

  /** Tool name (e.g., 'read_file', 'write_file', 'execute_command') */
  toolName: string;

  /** Tool input parameters */
  input: Record<string, unknown>;

  /** Tool output/result */
  output: ToolOutput | null;

  /** Timestamp when tool was called */
  timestamp: number;

  /** Duration in milliseconds */
  duration: number;

  /** Success/failure status */
  status: 'pending' | 'success' | 'error';

  /** Error message if failed */
  error: string | null;
}
```

#### 1.1.4 Message Record Interface

```typescript
export interface MessageRecord {
  /** Message ID from TanStack AI */
  id: string;

  /** Message role (user, assistant, system, tool) */
  role: 'user' | 'assistant' | 'system' | 'tool';

  /** Message content */
  content: string;

  /** Timestamp */
  timestamp: number;

  /** Associated tool call if role is 'tool' */
  toolCallId: string | null;
}
```

### 1.2 State Persistence Strategy

**Storage**: IndexedDB via Dexie.js
**Database**: `via-gent-agent-state`
**Store**: `agentSessions`

#### 1.2.1 IndexedDB Schema

```typescript
// In src/lib/agent/state/agent-state-db.ts
import Dexie, { Table } from 'dexie';

export class AgentStateDB extends Dexie {
  agentSessions!: Table<AgentLoopState, string>;

  constructor() {
    super('via-gent-agent-state');
    this.version(1).stores({
      agentSessions: 'sessionId, startedAt, status',
    });
  }
}

export const agentStateDB = new AgentStateDB();
```

#### 1.2.2 Persistence Requirements

| State Property | Persistence Strategy | Rationale |
|---------------|---------------------|-----------|
| `sessionId` | IndexedDB (primary key) | Unique identifier for session |
| `currentIteration` | IndexedDB + in-memory | Track progress, persist for recovery |
| `maxIterations` | IndexedDB | Configurable limit, persisted per session |
| `finishReason` | IndexedDB | Completion reason for debugging |
| `startedAt`, `completedAt` | IndexedDB | Timing analysis |
| `iterations` | IndexedDB | Full history for navigation |
| `status` | IndexedDB + in-memory | Real-time updates, persisted |

### 1.3 State Management Integration

**Zustand Store**: New `useAgentLoopStore` for agent loop state
**Location**: `src/lib/state/agent-loop-store.ts`

#### 1.3.1 Agent Loop Store Interface

```typescript
export interface AgentLoopState {
  // =========================================================================
  // State
  // =========================================================================

  /** Current active session (null if no active session) */
  activeSession: AgentLoopState | null;

  /** All historical sessions */
  sessionHistory: AgentLoopState[];

  /** Currently selected iteration for viewing (null if viewing latest) */
  selectedIteration: number | null;

  /** Whether iteration details panel is expanded */
  iterationDetailsExpanded: boolean;

  // =========================================================================
  // Actions
  // =========================================================================

  /** Start a new agent session */
  startSession: (options: { maxIterations: number; initialPrompt: string }) => void;

  /** Update current iteration count */
  updateIteration: (iteration: number) => void;

  /** Add tool call to current iteration */
  addToolCall: (toolCall: ToolCallRecord) => void;

  /** Add message to current iteration */
  addMessage: (message: MessageRecord) => void;

  /** Complete current iteration */
  completeIteration: (iteration: AgentIteration) => void;

  /** Set session status */
  setSessionStatus: (status: AgentLoopState['status']) => void;

  /** Set finish reason */
  setFinishReason: (reason: string | null) => void;

  /** Select specific iteration for viewing */
  selectIteration: (iterationNumber: number | null) => void;

  /** Toggle iteration details panel */
  toggleIterationDetails: () => void;

  /** Pause current session */
  pauseSession: () => void;

  /** Resume paused session */
  resumeSession: () => void;

  /** Terminate current session */
  terminateSession: (reason?: string) => void;

  /** Load session from history */
  loadSession: (sessionId: string) => void;

  /** Clear all sessions (for testing/debugging) */
  clearAllSessions: () => void;
}
```

#### 1.3.2 Store Persistence Configuration

```typescript
// Persisted to IndexedDB
const persistConfig: PersistOptions<AgentLoopState> = {
  name: 'via-gent-agent-loop-store',
  partialize: (state) => ({
    activeSession: state.activeSession,
    sessionHistory: state.sessionHistory,
  }),
};

// Not persisted (ephemeral, in-memory)
// - selectedIteration
// - iterationDetailsExpanded
```

---

## 2. Iteration UI Component Specifications

### 2.1 Component Architecture

**Goal**: Provide visualization of agent iteration state with navigation, history, and details.

#### 2.1.1 Component Hierarchy

```
AgentChatPanel
├── IterationProgress (NEW)
│   ├── IterationCounter
│   ├── ProgressBar
│   └── StatusIndicator
├── ChatMessages
└── IterationDetailsPanel (NEW)
    ├── IterationList (expandable)
    │   └── IterationItem (clickable)
    ├── ToolCallList
    │   └── ToolCallItem
    └── MessageHistory
        └── MessageItem
```

### 2.2 Iteration Progress Component

**File**: `src/components/agent/IterationProgress.tsx`

#### 2.2.1 Component Interface

```typescript
interface IterationProgressProps {
  /** Current iteration number */
  currentIteration: number;

  /** Maximum allowed iterations */
  maxIterations: number;

  /** Current status of the loop */
  status: AgentLoopState['status'];

  /** Finish reason if completed */
  finishReason: string | null;

  /** Duration in milliseconds */
  duration: number | null;

  /** Callback to pause session */
  onPause: () => void;

  /** Callback to resume session */
  onResume: () => void;

  /** Callback to terminate session */
  onTerminate: () => void;
}
```

#### 2.2.2 Visual Specifications

**Layout**:
- Horizontal bar at top of chat panel
- Left: Iteration counter (e.g., "Step 3/10")
- Center: Progress bar (width = currentIteration / maxIterations)
- Right: Status indicator + control buttons

**Progress Bar**:
- Background: Dark gray (8-bit design system)
- Fill: Cyan accent color for in-progress, Green for completed, Red for error
- Height: 4px
- Rounded corners
- Smooth transition animation (300ms)

**Status Indicator**:
- Icons: `Loader2` (spinning) for running, `Pause` for paused, `CheckCircle` for completed, `XCircle` for error, `AlertTriangle` for terminated
- Color: Cyan (running), Yellow (paused), Green (completed), Red (error/terminated)

**Control Buttons**:
- Pause button: Only visible when status is 'running'
- Resume button: Only visible when status is 'paused'
- Terminate button: Always visible when status is 'running' or 'paused'
- Button style: 8-bit pixel border, dark background, hover effect

#### 2.2.3 Wireframe (ASCII)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Step 3/10  [██████████░░░░░░░░░]  ● Running  [⏸] [✕] │
└─────────────────────────────────────────────────────────────────────┘
   Counter    Progress Bar               Status    Pause  Stop
```

### 2.3 Iteration Details Panel

**File**: `src/components/agent/IterationDetailsPanel.tsx`

#### 2.3.1 Component Interface

```typescript
interface IterationDetailsPanelProps {
  /** Current active session */
  session: AgentLoopState | null;

  /** Selected iteration for viewing (null = latest) */
  selectedIteration: number | null;

  /** Whether panel is expanded */
  expanded: boolean;

  /** Callback to toggle expansion */
  onToggle: () => void;

  /** Callback to select iteration */
  onSelectIteration: (iterationNumber: number | null) => void;
}
```

#### 2.3.2 Visual Specifications

**Layout**:
- Collapsible panel below chat messages
- Default: Collapsed
- Expand button: Icon on right side of progress bar
- When expanded: Full width, scrollable

**Iteration List**:
- Vertical list of iterations (1, 2, 3, ...)
- Each iteration is clickable to view details
- Active iteration highlighted with cyan border
- Completed iterations: Green checkmark icon
- Failed iterations: Red X icon
- In-progress iteration: Spinning loader icon

**Iteration Item Details** (when clicked):
- Header: Iteration number + duration
- Tool Calls: List of tools called in this iteration
  - Tool name
  - Input (truncated if long)
  - Output (truncated if long)
  - Duration
  - Status (success/error)
- Messages: Chronological list of messages exchanged
- Error: If iteration failed, show error message

#### 2.3.3 Wireframe (ASCII)

```
Collapsed:
┌─────────────────────────────────────────────────────────────────────┐
│ Step 3/10  [██████████░░░░░░░░░]  ● Running  [⏸] [✕] [▼]│
└─────────────────────────────────────────────────────────────────────┘
                                                              ↑
                                                         Toggle button

Expanded:
┌─────────────────────────────────────────────────────────────────────┐
│ Step 3/10  [██████████░░░░░░░░░]  ● Running  [⏸] [✕] [▲]│
├─────────────────────────────────────────────────────────────────────┤
│ Iteration History                                              │
├─────────────────────────────────────────────────────────────────────┤
│ [1] ✓ read_file (src/app.tsx) - 125ms                    │
│     Agent: "I'll read the app file..."                         │
│     Tool: { path: "src/app.tsx" }                            │
│     Result: { content: "import React..." }                      │
├─────────────────────────────────────────────────────────────────────┤
│ [2] ✓ write_file (src/app.tsx) - 89ms                     │
│     Agent: "Now I'll update the file..."                        │
│     Tool: { path: "src/app.tsx", content: "..." }              │
│     Result: { success: true }                                  │
├─────────────────────────────────────────────────────────────────────┤
│ [3] ● in_progress                                            │
│     Agent: "Let me verify the changes..."                        │
│     Tool: execute_command({ command: "npm test" })               │
│     Result: Pending...                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.4 Integration with Chat Interface

**Integration Points**:

1. **AgentChatPanel** (`src/components/agent/AgentChatPanel.tsx`):
   - Add `IterationProgress` component above chat messages
   - Add `IterationDetailsPanel` component below chat messages
   - Subscribe to `useAgentLoopStore` for state updates
   - Emit iteration events via event bus

2. **StreamingMessage** (`src/components/chat/StreamingMessage.tsx`):
   - Display iteration number in message header
   - Link to iteration details in panel
   - Show tool call badges with iteration context

3. **ApprovalOverlay** (`src/components/chat/ApprovalOverlay.tsx`):
   - Add iteration progress bar
   - Show current iteration number
   - Display iteration count in approval prompt

#### 2.4.1 Event Bus Integration

```typescript
// In src/lib/events/workspace-events.ts
export interface AgentIterationEvents {
  /** Emitted when iteration starts */
  'agent:iteration:start': { iteration: number; timestamp: number };

  /** Emitted when iteration completes */
  'agent:iteration:complete': { iteration: number; duration: number };

  /** Emitted when tool is called */
  'agent:tool:called': { toolName: string; iteration: number };

  /** Emitted when tool completes */
  'agent:tool:complete': { toolName: string; iteration: number; duration: number };

  /** Emitted when session starts */
  'agent:session:start': { sessionId: string; maxIterations: number };

  /** Emitted when session completes */
  'agent:session:complete': { sessionId: string; finishReason: string; duration: number };

  /** Emitted when session is paused */
  'agent:session:pause': { sessionId: string };

  /** Emitted when session is resumed */
  'agent:session:resume': { sessionId: string };

  /** Emitted when session is terminated */
  'agent:session:terminate': { sessionId: string; reason: string };
}
```

---

## 3. Intelligent Termination Logic

### 3.1 Termination Strategies

**Goal**: Implement multiple termination strategies to prevent infinite loops and detect completion.

#### 3.1.1 TanStack AI Strategy Composition

```typescript
// In src/lib/agent/hooks/use-agent-chat-with-tools.ts
import {
  maxIterations,
  untilFinishReason,
  combineStrategies,
  timeoutStrategy,
  stuckDetectionStrategy,
} from '@tanstack/ai';

// Combined termination strategies
const agentLoopStrategy = combineStrategies([
  maxIterations(config.maxIterations ?? 15), // Configurable, not hardcoded to 3
  untilFinishReason(['stop', 'end_turn', 'tool_calls']), // Natural completion
  timeoutStrategy(60000), // 60s timeout per loop
  stuckDetectionStrategy(3), // Detect 3+ consecutive failures
]);
```

#### 3.1.2 Strategy Specifications

**1. maxIterations(n)**
- **Purpose**: Hard limit on total iterations
- **Default**: 15 (configurable per agent type)
- **Developer Agent**: 15 iterations
- **Orchestrator/Planner Agent**: 10 iterations
- **Code Reviewer Agent**: 5 iterations
- **Configuration**: Stored in agent config, persisted to IndexedDB

**2. untilFinishReason(['stop', 'end_turn', 'tool_calls'])**
- **Purpose**: Detect natural completion signals from AI model
- **Triggers**:
  - Model emits 'stop' finish reason
  - Model emits 'end_turn' finish reason
  - Model emits 'tool_calls' finish reason (no more tools needed)
- **Behavior**: Immediate termination when signal detected

**3. timeoutStrategy(60000)**
- **Purpose**: Prevent indefinite hanging on unresponsive operations
- **Timeout**: 60 seconds per iteration loop
- **Behavior**: Terminate with error message "Iteration timeout after 60s"
- **User Notification**: Toast notification with "Agent timed out, please check your connection"

**4. stuckDetectionStrategy(3)**
- **Purpose**: Detect when agent is stuck in failure loop
- **Threshold**: 3 consecutive failed iterations
- **Failure Criteria**:
  - Tool call returns error
  - Exception thrown during execution
  - Timeout occurs
- **Behavior**: Pause session and prompt user for intervention
- **User Notification**: "Agent appears stuck after 3 consecutive failures. Continue or terminate?"

### 3.2 Success Criteria Definitions

**Goal**: Define what constitutes successful task completion.

#### 3.2.1 Completion Detection Heuristics

```typescript
// In src/lib/agent/termination/completion-detector.ts
export interface CompletionCriteria {
  /** User explicitly confirmed completion */
  userConfirmed: boolean;

  /** All requested files modified */
  allFilesModified: boolean;

  /** All requested tests passing */
  allTestsPassing: boolean;

  /** Agent emitted completion signal */
  agentSignaledCompletion: boolean;

  /** No more tool calls needed */
  noMoreToolCallsNeeded: boolean;
}

export function detectCompletion(
  state: AgentLoopState,
  userIntent: string
): CompletionCriteria {
  // Analyze agent's final message
  const lastMessage = state.iterations[state.iterations.length - 1]?.messages.at(-1);
  const agentSignaledCompletion = lastMessage?.content.toLowerCase().includes('done') ||
    lastMessage?.content.toLowerCase().includes('complete') ||
    lastMessage?.content.toLowerCase().includes('finished');

  // Check if all requested operations completed
  const allFilesModified = checkFileModifications(state, userIntent);
  const allTestsPassing = checkTestResults(state, userIntent);

  return {
    userConfirmed: false, // Requires explicit user confirmation
    allFilesModified,
    allTestsPassing,
    agentSignaledCompletion,
    noMoreToolCallsNeeded: state.finishReason === 'stop',
  };
}
```

#### 3.2.2 Success Indicators

| Indicator | Detection Method | Weight |
|------------|------------------|---------|
| **User Confirmation** | User clicks "Mark Complete" button | 100% (overrides all) |
| **Agent Signal** | "done", "complete", "finished" in final message | 80% |
| **No More Tools** | `finishReason === 'stop'` | 70% |
| **All Files Modified** | File system scan shows all requested files changed | 60% |
| **All Tests Passing** | Test execution results show 0 failures | 60% |

**Completion Threshold**: 2+ indicators must be true (excluding user confirmation)

### 3.3 Failure Detection Mechanisms

**Goal**: Detect when agent cannot complete the task.

#### 3.3.1 Failure Criteria

```typescript
export interface FailureCriteria {
  /** Consecutive tool call failures */
  consecutiveFailures: number;

  /** Same tool called repeatedly with same inputs */
  repetitiveToolCalls: boolean;

  /** Agent admits inability to complete task */
  agentAdmitsFailure: boolean;

  /** Timeout occurred */
  timeoutOccurred: boolean;

  /** Permission denied errors */
  permissionDenied: boolean;
}

export function detectFailure(state: AgentLoopState): FailureCriteria {
  // Count consecutive failures
  const consecutiveFailures = countConsecutiveFailures(state.iterations);

  // Detect repetitive tool calls
  const repetitiveToolCalls = detectRepetitiveToolCalls(state.iterations);

  // Check if agent admits failure
  const lastMessage = state.iterations[state.iterations.length - 1]?.messages.at(-1);
  const agentAdmitsFailure = lastMessage?.content.toLowerCase().includes('unable') ||
    lastMessage?.content.toLowerCase().includes('cannot') ||
    lastMessage?.content.toLowerCase().includes('failed');

  // Check for timeout
  const timeoutOccurred = state.iterations.some(iter => iter.error?.includes('timeout'));

  // Check for permission errors
  const permissionDenied = state.iterations.some(iter =>
    iter.toolCalls.some(call =>
      call.error?.toLowerCase().includes('permission denied') ||
      call.error?.toLowerCase().includes('access denied')
    )
  );

  return {
    consecutiveFailures,
    repetitiveToolCalls,
    agentAdmitsFailure,
    timeoutOccurred,
    permissionDenied,
  };
}
```

#### 3.3.2 Failure Indicators

| Indicator | Threshold | Action |
|------------|-----------|--------|
| **Consecutive Failures** | 3+ failures | Pause session, prompt user |
| **Repetitive Tool Calls** | Same tool 3+ times with same inputs | Pause session, prompt user |
| **Agent Admits Failure** | Keywords in message | Pause session, prompt user |
| **Timeout** | Single timeout | Retry once, then pause |
| **Permission Denied** | Any permission error | Stop immediately, show error |

### 3.4 User-Initiated Termination

**Goal**: Allow user to stop agent at any time.

#### 3.4.1 Termination UI

**Buttons in IterationProgress**:
1. **Pause**: Suspend execution, allow resume
2. **Resume**: Continue from paused state
3. **Terminate**: Stop execution immediately (cannot resume)

**Termination Dialog** (when user clicks terminate):
```typescript
interface TerminationDialogProps {
  /** Reason for termination */
  reason: string;

  /** Callback to confirm termination */
  onConfirm: () => void;

  /** Callback to cancel termination */
  onCancel: () => void;
}
```

**Dialog Options**:
- "Task completed successfully" → Mark as completed
- "Task failed, I'll fix it manually" → Mark as failed
- "I want to try a different approach" → Mark as terminated
- "Agent is stuck/hanging" → Mark as error

---

## 4. Dependencies on MVP Progress

### 4.1 MVP Story Dependencies

**Epic 29 cannot start until ALL MVP stories are complete**:

| MVP Story | Status | Dependency for Epic 29 |
|-----------|---------|----------------------|
| **MVP-1**: Agent Configuration & Persistence | IN_PROGRESS | ✅ Required - Agent config system |
| **MVP-2**: Chat Interface with Streaming | Ready for E2E | ✅ Required - Chat streaming foundation |
| **MVP-3**: Tool Execution - File Operations | Code-complete pending E2E | ✅ Required - File tool infrastructure |
| **MVP-4**: Tool Execution - Terminal Commands | Code-complete pending E2E | ✅ Required - Terminal tool infrastructure |
| **MVP-5**: Approval Workflow | Ready for E2E | ✅ Required - Approval UI foundation |
| **MVP-6**: Real-time UI Updates | Ready for E2E | ✅ Required - Event system foundation |
| **MVP-7**: E2E Integration Testing | Not started | ✅ Required - Testing infrastructure |

### 4.2 State Management Refactoring Dependencies

**Team B Phase 2** (State Refactoring) must complete before Epic 29:

| Refactoring Task | Status | Dependency for Epic 29 |
|-----------------|---------|----------------------|
| IDELayout state consolidation | BLOCKED (awaiting Team A MRT-3) | ⚠️ Recommended - Clean state foundation |
| MobileIDELayout state consolidation | BLOCKED (awaiting Team A MRT-3) | ⚠️ Recommended - Consistent patterns |
| useIDEFileHandlers updates | BLOCKED (awaiting Team A MRT-3) | ⚠️ Recommended - Handler integration |

**Rationale**: While state refactoring is not strictly required for Epic 29, completing it first ensures:
- Clean state architecture foundation
- Consistent patterns across desktop/mobile
- No state duplication conflicts
- Easier integration with new `useAgentLoopStore`

### 4.3 Technical Stack Dependencies

| Component | Current Status | Required for Epic 29 |
|-----------|----------------|----------------------|
| **TanStack AI** | ✅ Installed | ✅ Required - Core agent loop |
| **Zustand** | ✅ Installed | ✅ Required - State management |
| **Dexie** | ✅ Installed | ✅ Required - IndexedDB persistence |
| **Event Bus** | ✅ Implemented | ✅ Required - Iteration events |
| **Tool Facades** | ✅ Implemented | ✅ Required - Tool tracking |
| **Provider Adapters** | ✅ Implemented | ✅ Required - Agent integration |

---

## 5. Story Breakdown for Epic 29

### Story 29-1: Agentic State Tracking

**Points**: 5
**Priority**: P0
**Traceability**: MVP-3, MVP-4, MVP-6

#### Description
Implement state tracking infrastructure for agent execution loops with persistence to IndexedDB.

#### Acceptance Criteria
- [ ] Create `AgentLoopState`, `AgentIteration`, `ToolCallRecord`, `MessageRecord` interfaces
- [ ] Create `AgentStateDB` Dexie database with `agentSessions` table
- [ ] Create `useAgentLoopStore` Zustand store with full state/actions
- [ ] Configure store persistence to IndexedDB via Dexie
- [ ] Implement `startSession`, `updateIteration`, `addToolCall`, `addMessage` actions
- [ ] Implement `completeIteration`, `setSessionStatus`, `setFinishReason` actions
- [ ] Implement `pauseSession`, `resumeSession`, `terminateSession` actions
- [ ] Implement `selectIteration`, `toggleIterationDetails` actions
- [ ] Implement `loadSession`, `clearAllSessions` actions
- [ ] Write unit tests for all store actions
- [ ] Write integration tests for IndexedDB persistence
- [ ] Verify state persistence across page reloads

#### Technical Notes
```typescript
// File structure
src/lib/agent/state/
├── agent-loop-state.ts      # Interfaces
├── agent-state-db.ts        # Dexie database
├── agent-loop-store.ts      # Zustand store
└── __tests__/
    ├── agent-loop-store.test.ts
    └── agent-state-db.test.ts
```

#### Dependencies
- ✅ Zustand installed
- ✅ Dexie installed
- ✅ TanStack AI interfaces defined

---

### Story 29-2: Iteration UI Component

**Points**: 5
**Priority**: P1
**Traceability**: MVP-2, MVP-5, MVP-6

#### Description
Create UI components for visualizing agent iteration progress, history, and details.

#### Acceptance Criteria
- [ ] Create `IterationProgress` component with counter, progress bar, status indicator
- [ ] Create `IterationDetailsPanel` component with expandable iteration list
- [ ] Create `IterationItem` component for individual iteration display
- [ ] Create `ToolCallItem` component for tool call visualization
- [ ] Create `MessageItem` component for message history display
- [ ] Integrate `IterationProgress` into `AgentChatPanel`
- [ ] Integrate `IterationDetailsPanel` into `AgentChatPanel`
- [ ] Subscribe to `useAgentLoopStore` for state updates
- [ ] Emit `agent:iteration:*` events via event bus
- [ ] Implement pause/resume/terminate buttons with callbacks
- [ ] Implement iteration selection for history navigation
- [ ] Apply 8-bit design system styling
- [ ] Write unit tests for all components
- [ ] Write integration tests with mock store
- [ ] Verify UI displays correctly with mock data

#### Technical Notes
```typescript
// File structure
src/components/agent/
├── IterationProgress.tsx
├── IterationDetailsPanel.tsx
├── IterationItem.tsx
├── ToolCallItem.tsx
├── MessageItem.tsx
└── __tests__/
    ├── IterationProgress.test.tsx
    ├── IterationDetailsPanel.test.tsx
    └── ...
```

#### Dependencies
- ✅ Story 29-1 complete (state tracking)
- ✅ Radix UI components available
- ✅ Lucide React icons available

---

### Story 29-3: Intelligent Termination Logic

**Points**: 4
**Priority**: P1
**Traceability**: MVP-3, MVP-4, MVP-7

#### Description
Implement intelligent termination strategies with success/failure detection and user intervention.

#### Acceptance Criteria
- [ ] Implement `maxIterations(15)` strategy (configurable, not hardcoded to 3)
- [ ] Implement `untilFinishReason(['stop', 'end_turn', 'tool_calls'])` strategy
- [ ] Implement `timeoutStrategy(60000)` for 60s timeout per loop
- [ ] Implement `stuckDetectionStrategy(3)` for consecutive failure detection
- [ ] Create `combineStrategies` function to compose multiple strategies
- [ ] Implement `detectCompletion` function with success criteria heuristics
- [ ] Implement `detectFailure` function with failure criteria detection
- [ ] Create `TerminationDialog` component for user-initiated termination
- [ ] Integrate termination strategies into `useAgentChatWithTools` hook
- [ ] Add toast notifications for termination events
- [ ] Write unit tests for all termination strategies
- [ ] Write integration tests with mock agent execution
- [ ] Verify termination works correctly in browser E2E

#### Technical Notes
```typescript
// File structure
src/lib/agent/termination/
├── strategies.ts              # TanStack AI strategy implementations
├── completion-detector.ts     # Success criteria detection
├── failure-detector.ts        # Failure criteria detection
└── __tests__/
    ├── strategies.test.ts
    ├── completion-detector.test.ts
    └── failure-detector.test.ts

src/components/agent/
├── TerminationDialog.tsx
└── __tests__/
    └── TerminationDialog.test.tsx
```

#### Dependencies
- ✅ Story 29-1 complete (state tracking)
- ✅ Story 29-2 complete (UI components)
- ✅ TanStack AI termination strategies available

---

### Story 29-4: Agentic Loop E2E Validation

**Points**: 3
**Priority**: P1
**Traceability**: MVP-7 (E2E testing)

#### Description
Validate complete agentic loop with multi-step agent tasks in browser.

#### Acceptance Criteria
- [ ] Test multi-step file refactoring task (read → modify → write → verify)
- [ ] Test multi-step test execution task (run tests → read results → fix failures → re-run)
- [ ] Verify iteration counter increments correctly
- [ ] Verify progress bar updates in real-time
- [ ] Verify iteration details panel shows correct history
- [ ] Verify pause/resume functionality works
- [ ] Verify terminate functionality works
- [ ] Verify maxIterations limit enforced correctly
- [ ] Verify timeout protection works (simulate long-running operation)
- [ ] Verify stuck detection works (simulate consecutive failures)
- [ ] Verify success criteria detection works
- [ ] Verify failure criteria detection works
- [ ] Verify state persistence across page reloads
- [ ] Verify event bus emits correct events
- [ ] Verify toast notifications display correctly
- [ ] Capture screenshots of working feature
- [ ] Update AGENTS.md with Epic 29 implementation notes
- [ ] Document E2E test scenarios

#### Technical Notes
```typescript
// E2E Test Scenarios
1. File Refactoring Task:
   - User: "Refactor src/app.tsx to use functional components"
   - Agent: Reads file → Identifies class components → Rewrites as functional → Saves → Verifies
   - Expected: 3-5 iterations, success completion

2. Test Execution Task:
   - User: "Run tests and fix any failures"
   - Agent: Runs tests → Reads results → Identifies failures → Fixes → Re-runs → Verifies
   - Expected: 4-6 iterations, success completion

3. Timeout Scenario:
   - User: "Execute long-running command"
   - Agent: Runs command → Times out after 60s
   - Expected: Timeout notification, session terminated

4. Stuck Detection Scenario:
   - User: "Modify file with permission errors"
   - Agent: Tries to write → Fails → Retries → Fails → Retries → Stuck
   - Expected: Pause after 3 failures, user prompt

5. Pause/Resume Scenario:
   - User: "Start task, then pause and resume"
   - Agent: Starts execution → User pauses → User resumes → Continues
   - Expected: Execution pauses, resumes from same state
```

#### Dependencies
- ✅ Story 29-1 complete (state tracking)
- ✅ Story 29-2 complete (UI components)
- ✅ Story 29-3 complete (termination logic)
- ✅ All MVP stories complete
- ✅ State management refactoring complete (recommended)

---

## 6. Technical Stack Requirements

### 6.1 State Management Stack

| Technology | Purpose | Configuration |
|------------|---------|---------------|
| **Zustand** | Agent loop state management | `useAgentLoopStore` with Dexie persistence |
| **Dexie** | IndexedDB persistence | `AgentStateDB` with `agentSessions` table |
| **React Context** | Component state (ephemeral) | Local `useState` for UI-only state |

### 6.2 UI Component Stack

| Technology | Purpose | Components |
|------------|---------|------------|
| **React 19** | Component framework | All iteration UI components |
| **Radix UI** | Dialog, Tabs, Separator | `TerminationDialog` |
| **Lucide React** | Icons | All iteration UI icons |
| **Tailwind CSS** | Styling | 8-bit design system |
| **CVA** | Component variants | Iteration item variants |

### 6.3 Agent Integration Stack

| Technology | Purpose | Integration Points |
|------------|---------|-------------------|
| **TanStack AI** | Agent loop execution | `useAgentChatWithTools` hook |
| **Provider Adapters** | AI model integration | Agent loop strategies |
| **Tool Facades** | Tool execution tracking | Tool call records |
| **Event Bus** | Iteration events | `agent:iteration:*` events |

### 6.4 Testing Stack

| Technology | Purpose | Test Types |
|------------|---------|------------|
| **Vitest** | Unit tests | Store actions, termination strategies |
| **@testing-library/react** | Component tests | UI components |
| **fake-indexeddb** | IndexedDB mocking | Persistence tests |
| **vi.mock** | Dependency mocking | TanStack AI, provider adapters |

---

## 7. Integration Points with Existing System

### 7.1 useAgentChatWithTools Hook Integration

**File**: `src/lib/agent/hooks/use-agent-chat-with-tools.ts`

#### 7.1.1 Current Implementation (Lines 232-243)

```typescript
// CURRENT (BROKEN - missing agentLoopStrategy):
const chatOptions = {
    connection,
    tools: agentTools.getClientTools(),
    // MISSING: agentLoopStrategy configuration
};
```

#### 7.1.2 Target Implementation (After Epic 29)

```typescript
// TARGET (with Epic 29):
import { maxIterations, untilFinishReason, combineStrategies, timeoutStrategy, stuckDetectionStrategy } from '@tanstack/ai';

const chatOptions = useMemo(() => {
    if (agentTools) {
        return {
            connection,
            tools: agentTools.getClientTools(),
            agentLoopStrategy: combineStrategies([
                maxIterations(config.maxIterations ?? 15), // Configurable
                untilFinishReason(['stop', 'end_turn', 'tool_calls']),
                timeoutStrategy(60000),
                stuckDetectionStrategy(3),
            ]),
        };
    }
    return { connection };
}, [connection, agentTools, config.maxIterations]);
```

### 7.2 AgentChatPanel Integration

**File**: `src/components/agent/AgentChatPanel.tsx`

#### 7.2.1 Required Changes

```typescript
// Add imports
import { useAgentLoopStore } from '@/lib/state/agent-loop-store';
import { IterationProgress } from './IterationProgress';
import { IterationDetailsPanel } from './IterationDetailsPanel';

// Subscribe to agent loop store
const activeSession = useAgentLoopStore(s => s.activeSession);
const selectedIteration = useAgentLoopStore(s => s.selectedIteration);
const iterationDetailsExpanded = useAgentLoopStore(s => s.iterationDetailsExpanded);
const toggleIterationDetails = useAgentLoopStore(s => s.toggleIterationDetails);
const pauseSession = useAgentLoopStore(s => s.pauseSession);
const resumeSession = useAgentLoopStore(s => s.resumeSession);
const terminateSession = useAgentLoopStore(s => s.terminateSession);

// Add components to JSX
return (
    <div className="flex flex-col h-full">
        {activeSession && (
            <IterationProgress
                currentIteration={activeSession.currentIteration}
                maxIterations={activeSession.maxIterations}
                status={activeSession.status}
                finishReason={activeSession.finishReason}
                duration={activeSession.duration}
                onPause={pauseSession}
                onResume={resumeSession}
                onTerminate={terminateSession}
            />
        )}
        {/* Existing chat messages */}
        {activeSession && iterationDetailsExpanded && (
            <IterationDetailsPanel
                session={activeSession}
                selectedIteration={selectedIteration}
                expanded={iterationDetailsExpanded}
                onToggle={toggleIterationDetails}
                onSelectIteration={useAgentLoopStore(s => s.selectIteration)}
            />
        )}
    </div>
);
```

### 7.3 Event Bus Integration

**File**: `src/lib/events/workspace-events.ts`

#### 7.3.1 Required Changes

```typescript
// Add agent iteration events to existing WorkspaceEventBus interface
export interface WorkspaceEventBus {
  // Existing events...
  'file:modified': FileModifiedEvent;
  'webcontainer:status': WebContainerStatusEvent;
  // ... other events

  // NEW: Agent iteration events
  'agent:iteration:start': AgentIterationStartEvent;
  'agent:iteration:complete': AgentIterationCompleteEvent;
  'agent:tool:called': AgentToolCalledEvent;
  'agent:tool:complete': AgentToolCompleteEvent;
  'agent:session:start': AgentSessionStartEvent;
  'agent:session:complete': AgentSessionCompleteEvent;
  'agent:session:pause': AgentSessionPauseEvent;
  'agent:session:resume': AgentSessionResumeEvent;
  'agent:session:terminate': AgentSessionTerminateEvent;
}

// Define event types
export interface AgentIterationStartEvent {
  iteration: number;
  timestamp: number;
}

export interface AgentIterationCompleteEvent {
  iteration: number;
  duration: number;
}

export interface AgentToolCalledEvent {
  toolName: string;
  iteration: number;
}

export interface AgentToolCompleteEvent {
  toolName: string;
  iteration: number;
  duration: number;
}

export interface AgentSessionStartEvent {
  sessionId: string;
  maxIterations: number;
}

export interface AgentSessionCompleteEvent {
  sessionId: string;
  finishReason: string;
  duration: number;
}

export interface AgentSessionPauseEvent {
  sessionId: string;
}

export interface AgentSessionResumeEvent {
  sessionId: string;
}

export interface AgentSessionTerminateEvent {
  sessionId: string;
  reason: string;
}
```

---

## 8. Testing Requirements

### 8.1 Unit Tests

**Coverage**: 80%+ for all new code

#### 8.1.1 Store Tests (`agent-loop-store.test.ts`)

```typescript
describe('useAgentLoopStore', () => {
  it('should start new session with correct initial state', () => {
    const { result } = renderHook(() => useAgentLoopStore());
    act(() => {
      result.current.startSession({ maxIterations: 10, initialPrompt: 'test' });
    });
    expect(result.current.activeSession).toBeDefined();
    expect(result.current.activeSession?.currentIteration).toBe(1);
    expect(result.current.activeSession?.maxIterations).toBe(10);
  });

  it('should update iteration count', () => {
    const { result } = renderHook(() => useAgentLoopStore());
    act(() => {
      result.current.startSession({ maxIterations: 10, initialPrompt: 'test' });
      result.current.updateIteration(2);
    });
    expect(result.current.activeSession?.currentIteration).toBe(2);
  });

  it('should add tool call to current iteration', () => {
    const { result } = renderHook(() => useAgentLoopStore());
    const toolCall: ToolCallRecord = {
      id: '1',
      toolName: 'read_file',
      input: { path: 'test.ts' },
      output: null,
      timestamp: Date.now(),
      duration: 0,
      status: 'pending',
      error: null,
    };
    act(() => {
      result.current.startSession({ maxIterations: 10, initialPrompt: 'test' });
      result.current.addToolCall(toolCall);
    });
    expect(result.current.activeSession?.iterations[0].toolCalls).toHaveLength(1);
  });

  // ... more tests for all actions
});
```

#### 8.1.2 Termination Strategy Tests (`strategies.test.ts`)

```typescript
describe('Termination Strategies', () => {
  it('should enforce maxIterations limit', () => {
    const strategy = maxIterations(5);
    const state: AgentLoopState = {
      currentIteration: 5,
      maxIterations: 5,
      // ... other fields
    };
    const shouldTerminate = strategy.shouldTerminate(state);
    expect(shouldTerminate).toBe(true);
  });

  it('should detect finish reason completion', () => {
    const strategy = untilFinishReason(['stop']);
    const state: AgentLoopState = {
      finishReason: 'stop',
      // ... other fields
    };
    const shouldTerminate = strategy.shouldTerminate(state);
    expect(shouldTerminate).toBe(true);
  });

  it('should detect timeout', () => {
    const strategy = timeoutStrategy(60000);
    const state: AgentLoopState = {
      duration: 65000,
      // ... other fields
    };
    const shouldTerminate = strategy.shouldTerminate(state);
    expect(shouldTerminate).toBe(true);
  });

  it('should detect stuck state', () => {
    const strategy = stuckDetectionStrategy(3);
    const iterations = [
      { status: 'failed', error: 'error' },
      { status: 'failed', error: 'error' },
      { status: 'failed', error: 'error' },
    ];
    const isStuck = strategy.isStuck(iterations);
    expect(isStuck).toBe(true);
  });
});
```

### 8.2 Integration Tests

**Coverage**: 60%+ for integration scenarios

#### 8.2.1 Agent Loop Integration Test

```typescript
describe('Agent Loop Integration', () => {
  it('should execute multi-step task with iteration tracking', async () => {
    const { result } = renderHook(() => useAgentChatWithTools({ ... }));
    await act(async () => {
      await result.current.sendMessage('Refactor file');
    });
    // Verify:
    // - Session started
    // - Iterations tracked
    // - Tool calls recorded
    // - Session completed
  });

  it('should pause and resume session', async () => {
    const { result } = renderHook(() => useAgentChatWithTools({ ... }));
    await act(async () => {
      await result.current.sendMessage('Task');
      result.current.pause();
      result.current.resume();
    });
    // Verify session paused and resumed correctly
  });
});
```

### 8.3 Browser E2E Tests

**Coverage**: 100% for user workflows

#### 8.3.1 Manual E2E Test Scenarios

1. **Multi-step File Refactoring**
   - Open project in browser
   - Open agent chat panel
   - Send prompt: "Refactor src/app.tsx to use functional components"
   - Observe iteration counter increment
   - Observe progress bar update
   - Verify iteration details panel shows history
   - Verify task completes successfully
   - **Screenshot**: Capture working feature

2. **Test Execution and Fix**
   - Open project with failing tests
   - Send prompt: "Run tests and fix failures"
   - Observe agent run tests, read results, fix, re-run
   - Verify iteration tracking
   - Verify success completion
   - **Screenshot**: Capture working feature

3. **Pause and Resume**
   - Start multi-step task
   - Click pause button
   - Verify session paused
   - Click resume button
   - Verify session resumes
   - **Screenshot**: Capture working feature

4. **Termination**
   - Start task
   - Click terminate button
   - Select termination reason
   - Verify session terminated
   - **Screenshot**: Capture working feature

---

## 9. Acceptance Criteria

### 9.1 Functional Requirements

- [ ] All 4 stories (29-1, 29-2, 29-3, 29-4) completed
- [ ] Agent loop state tracked with full history
- [ ] Iteration UI displays correctly with counter, progress bar, status
- [ ] Iteration details panel shows expandable history
- [ ] Termination strategies work correctly (maxIterations, timeout, stuck detection)
- [ ] Success/failure detection works correctly
- [ ] Pause/resume/terminate functionality works
- [ ] State persists to IndexedDB and restores on reload
- [ ] Event bus emits correct iteration events
- [ ] Toast notifications display for termination events
- [ ] All unit tests pass (80%+ coverage)
- [ ] All integration tests pass (60%+ coverage)
- [ ] Browser E2E tests pass with screenshots

### 9.2 Non-Functional Requirements

- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] No performance regressions (iteration tracking < 10ms overhead)
- [ ] IndexedDB operations complete < 100ms
- [ ] UI updates are smooth (60fps)
- [ ] Memory usage does not leak (session cleanup works)
- [ ] Event bus does not cause memory leaks (listeners unsubscribed)

### 9.3 Documentation Requirements

- [ ] AGENTS.md updated with Epic 29 implementation notes
- [ ] Code comments added for complex logic
- [ ] This specifications document referenced in commit messages
- [ ] E2E test scenarios documented
- [ ] Screenshots captured for all E2E tests

---

## 10. Timeline and Execution Plan

### 10.1 Epic 29 Timeline

| Week | Stories | Milestone |
|-------|----------|-----------|
| **Post-MVP Week 1** | 29-1, 29-2 | State tracking + UI components |
| **Post-MVP Week 2** | 29-3, 29-4 | Termination logic + E2E validation |

### 10.2 Execution Prerequisites

**Must Complete Before Epic 29 Start**:
- [ ] MVP-1: Agent Configuration & Persistence → DONE
- [ ] MVP-2: Chat Interface with Streaming → DONE
- [ ] MVP-3: Tool Execution - File Operations → DONE
- [ ] MVP-4: Tool Execution - Terminal Commands → DONE
- [ ] MVP-5: Approval Workflow → DONE
- [ ] MVP-6: Real-time UI Updates → DONE
- [ ] MVP-7: E2E Integration Testing → DONE
- [ ] Team B Phase 2: State Management Refactoring → DONE (recommended)

### 10.3 Risk Mitigation

**Risk**: Epic 29 complexity may cause delays

**Mitigation**:
1. **Sequential Story Execution**: Complete each story before starting next
2. **Incremental Testing**: Test each story thoroughly before proceeding
3. **Code Review**: Get code review after each story
4. **Rollback Plan**: Keep git history clean for easy rollback

---

## 11. Glossary

| Term | Definition |
|-------|------------|
| **Agent Loop** | The Plan → Act → Observe → Refine cycle where agents execute multiple iterations to complete a task |
| **Iteration** | One complete cycle of agent reasoning, tool execution, and observation |
| **Termination Strategy** | A rule or condition that determines when to stop the agent loop |
| **State Tracking** | Recording and persisting the state of agent execution across iterations |
| **Intelligent Termination** | Using multiple heuristics (success criteria, failure detection, timeouts) to determine when to stop |
| **Stuck Detection** | Detecting when agent is in a failure loop (e.g., 3+ consecutive failures) |
| **Rule of Two** | Security principle limiting agents to 2 of 3 capabilities (read, write, execute) without explicit authorization |

---

## 12. References

### 12.1 Related Documents

- **Epic 29 Definition**: [`_bmad-output/epics/epic-29-agentic-execution-loop.md`](_bmad-output/epics/epic-29-agentic-execution-loop.md)
- **Course Correction Analysis**: [`_bmad-output/course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md`](_bmad-output/course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md)
- **State Management Requirements**: [`_bmad-output/team-b/state-management-requirements-2025-12-27.md`](_bmad-output/team-b/state-management-requirements-2025-12-27.md)
- **MVP Sprint Plan**: [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)
- **Agentic Execution Loop Research**: [`_bmad-output/research/agentic-execution-loop-deep-research-2025-12-25.md`](_bmad-output/research/agentic-execution-loop-deep-research-2025-12-25.md)
- **Agentic Coding Platforms Explanation**: [`_bmad-output/research/20205-12-25/agentic-coding-platforms-explanation.md`](_bmad-output/research/20205-12-25/agentic-coding-platforms-explanation.md)

### 12.2 Code References

- **useAgentChatWithTools Hook**: [`src/lib/agent/hooks/use-agent-chat-with-tools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts)
- **AgentChatPanel**: [`src/components/agent/AgentChatPanel.tsx`](src/components/agent/AgentChatPanel.tsx)
- **Zustand Stores**: [`src/lib/state/`](src/lib/state/)
- **Dexie Storage**: [`src/lib/state/dexie-storage.ts`](src/lib/state/dexie-storage.ts)
- **Event Bus**: [`src/lib/events/workspace-events.ts`](src/lib/events/workspace-events.ts)

### 12.3 External References

- **TanStack AI Documentation**: https://tanstack.com/ai
- **Zustand Documentation**: https://zustand.docs.pmnd.rs
- **Dexie Documentation**: https://dexie.org
- **React Testing Library**: https://testing-library.com/react

---

## 13. Appendices

### Appendix A: State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    useAgentLoopStore (Zustand)             │
│  - Persisted to IndexedDB via Dexie                   │
│  - Single source of truth for agent loop state           │
└─────────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│IterationProgress│  │IterationDetails│  │Termination   │
│   Component   │  │   Panel      │  │   Dialog     │
└──────────────┘  └──────────────┘  └──────────────┘
         │                 │                 │
         └─────────────────┴─────────────────┘
                           │
                           ▼
                   ┌──────────────────┐
                   │ TanStack AI     │
                   │ Agent Loop      │
                   └──────────────────┘
```

### Appendix B: Implementation Checklist

**Pre-Implementation**:
- [ ] Review all MVP stories are complete
- [ ] Review state management refactoring is complete
- [ ] Understand TanStack AI termination strategies
- [ ] Review existing agent chat hook implementation
- [ ] Review event bus integration

**Story 29-1: State Tracking**:
- [ ] Create interfaces (AgentLoopState, AgentIteration, etc.)
- [ ] Create Dexie database (AgentStateDB)
- [ ] Create Zustand store (useAgentLoopStore)
- [ ] Implement all store actions
- [ ] Configure persistence to IndexedDB
- [ ] Write unit tests
- [ ] Write integration tests

**Story 29-2: Iteration UI**:
- [ ] Create IterationProgress component
- [ ] Create IterationDetailsPanel component
- [ ] Create iteration/item sub-components
- [ ] Integrate into AgentChatPanel
- [ ] Subscribe to useAgentLoopStore
- [ ] Emit iteration events
- [ ] Write unit tests
- [ ] Write integration tests

**Story 29-3: Termination Logic**:
- [ ] Implement termination strategies (maxIterations, timeout, stuck detection)
- [ ] Implement completion detection
- [ ] Implement failure detection
- [ ] Create TerminationDialog component
- [ ] Integrate strategies into useAgentChatWithTools
- [ ] Add toast notifications
- [ ] Write unit tests
- [ ] Write integration tests

**Story 29-4: E2E Validation**:
- [ ] Test multi-step file refactoring
- [ ] Test test execution and fix
- [ ] Test pause/resume
- [ ] Test termination
- [ ] Test timeout protection
- [ ] Test stuck detection
- [ ] Test state persistence
- [ ] Capture screenshots
- [ ] Update AGENTS.md

**Post-Implementation**:
- [ ] Run all unit tests
- [ ] Run all integration tests
- [ ] Perform browser E2E testing
- [ ] Update AGENTS.md
- [ ] Create handoff document for next phase
- [ ] Update sprint-status.yaml

---

**Document End**

*Prepared by*: Team B Architect Mode (bmad-bmm-architect)
*Date*: 2025-12-27
*Next Action*: Await MVP completion, then execute Epic 29 stories in Dev mode
*Estimated Duration*: 2 weeks post-MVP
