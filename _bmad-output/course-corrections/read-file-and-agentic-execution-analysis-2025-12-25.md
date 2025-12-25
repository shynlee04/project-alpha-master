# Course Correction: read_file Tool Failure and Agentic Execution Loop Analysis

**Date**: 2025-12-25  
**Severity**: P0 - Blocking Feature  
**Incident Type**: Architectural Gap  
**Related Incident**: INC-2025-12-24-001 (MVP consolidation)

---

## 1. Problem Statement

### Observed Behavior
During testing of MVP-3 (Tool Execution - File Operations), agents demonstrated inability to:
- Read files from various directory levels
- Iterate autonomously after first tool call
- Complete multi-step tasks without user re-prompting

### User Report (Agent Testing)
```
Agent 1: "Dường như tôi không thể truy cập vào thư mục gốc..."
Agent 2: "Tuyệt vời! Tôi sẽ bắt đầu test..." [then hung without completing]
```

### Root Cause Analysis
**Primary Issue**: Missing TanStack AI agentic execution loop configuration

The `useAgentChatWithTools.ts` hook (lines 232-243) uses TanStack AI's `useChat` **without** configuring `agentLoopStrategy`, resulting in:
- Single-shot execution (agent stops after first tool call)
- No iteration capability (agent cannot plan → act → observe → refine)
- No state tracking (no `AgentLoopState` to track iterations)
- No termination control (no `maxIterations()` or `untilFinishReason()`)

**Secondary Issue**: File access permission errors

The Vietnamese error message "không thể truy cập vào thư mục gốc hoặc các thư mục con" translates to "cannot access root directory or subdirectories", indicating:
1. Agent attempted to access files outside granted directory scope
2. File System Access API permissions were not properly scoped
3. No validation of file paths before tool execution

---

## 2. Technical Analysis

### 2.1 Current Implementation Analysis

#### read_file Tool Implementation ([`read-file-tool.ts`](src/lib/agent/tools/read-file-tool.ts))
```typescript
// Lines 28-32: Tool definition
export const readFileDef = toolDefinition({
    name: 'read_file',
    description: 'Read the content of a file. Use this to understand existing code or configuration.',
    inputSchema: ReadFileInputSchema,
});

// Lines 28-74: Server implementation
export function createReadFileTool(getTools: () => AgentFileTools) {
    return readFileDef.server(async (args: unknown): Promise<ToolResult<ReadFileOutput>> => {
        const { path } = args as { path: string };
        try {
            const content = await getTools().readFile(path);
            // ... returns content
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to read file' };
        }
    });
}
```

**Analysis**: The tool implementation is correct. It properly:
- Defines tool schema with Zod validation
- Calls facade's `readFile` method
- Handles errors gracefully
- Returns structured `ToolResult` with success/error states

#### FileTools Facade Implementation ([`file-tools-impl.ts`](src/lib/agent/facades/file-tools-impl.ts))
```typescript
// Lines 45-58: Read file method
async readFile(path: string): Promise<string | null> {
    validatePath(path);
    try {
        const result = await this.localFS.readFile(path);
        return result.content;
    } catch (error) {
        // File not found returns null
        if ((error as Error).message?.includes('not found') ||
            (error as Error).message?.includes('NOT_FOUND')) {
            return null;
        }
        throw error;
    }
}
```

**Analysis**: The facade correctly:
- Validates paths before reading
- Calls LocalFSAdapter's readFile
- Returns null for file not found (expected behavior)
- Throws errors for other failures

#### LocalFSAdapter Implementation ([`local-fs-adapter.ts`](src/lib/filesystem/local-fs-adapter.ts))
```typescript
// Lines 106-117: Read file method
async readFile(path: string, options?: { encoding?: 'utf-8' }): Promise<FileReadResult>;
async readFile(
    path: string,
    options: { encoding: 'utf-8' | 'binary' } = { encoding: 'utf-8' }
): Promise<FileReadResult | FileReadBinaryResult> {
    const root = this.ensureAccess();
    if (options.encoding === 'binary') {
        return fileOps.readFile(root, path, { encoding: 'binary' });
    }
    return fileOps.readFile(root, path, { encoding: 'utf-8' });
}
```

**Analysis**: The LocalFSAdapter correctly:
- Ensures directory access is granted via `ensureAccess()`
- Delegates to file operations module
- Supports both UTF-8 and binary encoding

**Root Cause of Permission Error**: The error "không thể truy cập vào thư mục gốc" suggests the agent is attempting to access files outside the directory scope granted by `window.showDirectoryPicker()`. This is a **File System Access API permission scope issue**, not a tool implementation bug.

#### useAgentChatWithTools Hook Implementation ([`use-agent-chat-with-tools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts))

**CRITICAL MISSING CONFIGURATION** (Lines 232-243):
```typescript
// CURRENT IMPLEMENTATION (BROKEN):
const chatOptions = {
    connection,
    tools: agentTools.getClientTools(),
    // MISSING: agentLoopStrategy: maxIterations(10), // ← NOT CONFIGURED!
};

// SHOULD BE (per TanStack AI docs):
import { maxIterations, untilFinishReason, chat } from "@tanstack/ai";

const chatOptions = {
    connection,
    tools: agentTools.getClientTools(),
    agentLoopStrategy: maxIterations(10), // ← ENABLE AGENTIC LOOP!
};
```

### 2.2 Missing Agentic Execution Loop Configuration

#### What TanStack AI Provides (from research document)

Per [`_bmad-output/research/20205-12-25/agentic-coding-platforms-explanation.md`](_bmad-output/research/20205-12-25/agentic-coding-platforms-explanation.md):

**1. Recursive Execution Loop** (Section 2.1)
- Plan-Act-Observe-Refine cycle
- State machine for task lifecycle
- "Boomerang Tasks" for long-running operations

**2. AgentLoopState Interface** (Section 1.3)
```typescript
interface AgentLoopState {
    iterationCount: number;
    messages: ModelMessage[];
    finishReason: string | null;
    data?: Record<string, any>;
}
```

**3. Built-in Strategies** (Section 2.1.2.2)
- `maxIterations(n)` - Limit iterations
- `untilFinishReason(['stop'])` - Stop on completion signal
- Custom strategies via function composition

#### What Via-gent Currently Has

| Feature | Status | Gap |
|---------|--------|------|
| Tool definitions | ✅ Works | read_file, write_file, execute_command defined |
| Approval workflow | ✅ Works | ApprovalOverlay, approveToolCall, rejectToolCall |
| Event emission | ✅ Works | file:modified, agent:tool:* events |
| **Agent loop config** | ❌ MISSING | No agentLoopStrategy in useChat options |
| Iteration state tracking | ❌ MISSING | No AgentLoopState tracking |
| Termination strategies | ❌ MISSING | No maxIterations or untilFinishReason |
| State machine | ❌ MISSING | No plan-act-observe-refine cycle |

---

## 3. Architecture Gap Analysis

### 3.1 The Thought-Action Cycle (from Research)

According to agentic coding platforms research, the proper Thought-Action cycle is:

```
1. Observation: Agent receives current state (e.g., "User requested refactor")
2. Reasoning (Chain of Thought): Model generates hidden reasoning steps
3. Tool Call Emission: Model outputs structured request to use a specific tool
4. Suspension and Gatekeeping: Orchestration engine pauses execution, checks against auto-approval settings
5. Execution: Upon approval, IDE executes tool and captures output
6. Feedback Injection: Output fed back to agent's context, triggering next iteration
```

**Current Implementation Gap**: Via-gent executes steps 1-6 but **stops after step 6** because:
- No `agentLoopStrategy` configured → TanStack AI treats as single-shot
- No iteration mechanism → Agent cannot continue to next turn
- No feedback loop → Tool result not fed back for next decision

### 3.2 The "Rule of Two" Security Principle

From research document (Section 6.1):

> "A prevailing architectural principle in 2025 is Agent's Rule of Two. This security heuristic states that at any given moment, an autonomous agent should only be granted **two of the following three capabilities** without explicit human authorization:
> - **Read Access**: The ability to ingest codebase and documentation
> - **Write Access**: The ability to modify files
> - **Execute Access**: The ability to run shell commands or network requests

**Current Via-gent Implementation**:
- ✅ Read Access: `read_file` tool works
- ✅ Write Access: `write_file` tool works
- ✅ Execute Access: `execute_command` tool works
- ❌ **Missing**: No enforcement of "Rule of Two" - agent has all three capabilities simultaneously

**Gap**: The approval workflow exists but doesn't enforce the Rule of Two. According to research:
- Roo Code defaults to "Ask" mode for all Execute actions
- Windsurf implements "Turbo Mode" which allows auto-execution of safe commands but gates destructive commands

### 3.3 State Tracking and Progress UI

**Missing Components**:
1. No `AgentLoopState` interface implementation
2. No iteration counter in UI
3. No "iteration N of M" progress indicator
4. No agent:activity:changed events for iteration tracking
5. No `agent:iteration:*` events for detailed progress

**Impact**: Users cannot see agent's thought process or understand multi-step plans. The agent appears "stuck" after first tool call.

---

## 4. Impact Assessment

### Severity: P0 - Feature Blocking

| Feature | Status | Impact |
|---------|--------|--------|
| Single tool call | ✅ Works | Agent can execute 1 tool per message |
| Multi-step plans | ❌ Broken | Agent cannot chain operations without user re-prompting |
| Self-correction | ❌ Broken | Agent cannot retry on failure |
| File exploration | ⚠️ Partial | Agent can read files but cannot iterate autonomously |
| Test verification | ❌ Broken | Agent cannot run tests then read results |
| Rule of Two | ❌ Broken | No enforcement of 2-capability limit |

### User Experience Impact

- **For Agent Testing**: Users must manually prompt for each step
- **Agent appears "stuck"** after first operation
- **No autonomous task completion**: Agent cannot complete multi-file tasks without intervention
- **Inferior to Cursor/Windsurf/Roo Code**: Cannot match agentic capabilities of modern IDEs
- **No visibility into agent reasoning**: Users cannot see "Thought" blocks showing agent's planning
- **Cannot recover from errors**: Agent stops on first failure instead of retrying

### Development Impact

- **MVP-3/MVP-4 cannot complete**: Without agentic loop, these stories cannot be validated
- **Epic 29 required**: Full agentic execution loop is prerequisite for autonomous agent behavior
- **Technical debt accumulation**: Implementing single-shot approach creates debt that must be paid off later

---

## 5. Root Cause Summary

### Primary Root Cause
**Missing TanStack AI `agentLoopStrategy` configuration in [`useAgentChatWithTools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts)**

The hook creates chat options at line 232-243:
```typescript
const chatOptions = {
    connection,
    tools: agentTools.getClientTools(),
    // agentLoopStrategy: maxIterations(10), // ← MISSING!
};
```

This omission causes:
1. **Single-shot execution**: TanStack AI treats chat as one-shot, stops after first tool result
2. **No iteration**: Agent cannot continue to next turn autonomously
3. **No state tracking**: No AgentLoopState to track progress
4. **No feedback loop**: Tool outputs not fed back for next decision

### Secondary Root Cause
**File System Access API permission scope issue**

The error message "không thể truy cập vào thư mục gốc hoặc các thư mục con" (Vietnamese for "cannot access root directory or subdirectories") indicates:
1. Agent attempted to access files outside the granted directory
2. The File System Access API's `window.showDirectoryPicker()` only grants access to a specific directory
3. No validation in tool implementation to check if requested path is within granted scope

**Note**: This is **not a tool bug** but rather a **permission scope validation gap** in the agent system.

---

## 6. Proposed Solution

### 6.1 Immediate Remediation (MVP Can Continue)

**For MVP-3/MVP-4 testing**: Add minimal agent loop configuration to enable basic iteration

```typescript
// In useAgentChatWithTools.ts, add import and configure:
import { maxIterations, chat } from "@tanstack/ai";

const chatOptions = useMemo(() => {
    if (agentTools) {
        return {
            connection,
            tools: agentTools.getClientTools(),
            agentLoopStrategy: maxIterations(3), // Allow 3 iterations
        };
    }
    return { connection };
}, [connection, agentTools]);
```

**Benefits**:
- Agent can retry failed operations up to 3 times
- Enables basic multi-step tasks
- Minimal code change (add import + configure strategy)
- No full state tracking required for MVP validation

**Limitations**:
- No iteration progress UI
- No "Thought" visibility
- No AgentLoopState tracking
- Still requires user re-prompting for each step

### 6.2 Long-term Fix (Epic 29: Agentic Execution Loop)

**Full agentic capability requires Epic 29 implementation with:**

#### Story 29-1: Implement AgentLoopStrategy
- Add `maxIterations(15)` to developer agent config
- Add `maxIterations(5)` to orchestrator/planner agents
- Server-side loop configuration in `/api/chat`

#### Story 29-2: State Tracking & Progress UI
- Implement `AgentLoopState` tracking
- Show iteration progress in UI
- Emit `agent:iteration:*` events

#### Story 29-3: Termination Strategies
- Implement `untilFinishReason(['stop'])`
- Add custom "task complete" detection
- Implement timeout protection

#### Story 29-4: Error Recovery
- Add consecutive failure detection
- Implement graceful degradation
- "Stuck" state human handoff

#### Story 29-5: Rule of Two Enforcement
- Add permission gating for high-risk operations
- Implement mode-based capability restrictions
- Enforce "2 of 3" capability limit per agent mode

### 6.3 File Access Permission Validation

**Add path validation to read_file tool**:

```typescript
// In read-file-tool.ts, add validation:
import { validatePath, PathValidationError } from '../facades/file-tools';

export function createReadFileTool(getTools: () => AgentFileTools) {
    return readFileDef.server(async (args: unknown): Promise<ToolResult<ReadFileOutput>> => {
        const { path } = args as { path: string };
        
        // Validate path is within granted directory scope
        validatePath(path);
        
        try {
            const content = await getTools().readFile(path);
            // ... rest of implementation
        } catch (error) {
            // Check if error is permission-related
            if (error instanceof PathValidationError) {
                return {
                    success: false,
                    error: `Permission denied: Cannot access ${path}. Ensure directory access is granted.`,
                };
            }
            // ... rest of error handling
        }
    });
}
```

**Benefits**:
- Prevents agent from accessing files outside granted scope
- Provides clear error messages
- Aligns with File System Access API security model

---

## 7. Implementation Recommendations

### 7.1 Option A: Defer to Post-MVP (Recommended)

**Rationale**:
- Tool infrastructure must be solid before adding loop complexity
- MVP-3/4 validates tools work correctly
- Epic 29 adds full autonomy with proper state management
- Reduces risk of breaking existing functionality

**Action Items**:
1. Continue MVP-3/MVP-4 with single-tool execution (add maxIterations(3))
2. Document limitation in user-facing docs
3. Create Epic 29 for full agentic loop post-MVP
4. Estimated effort: 5-8 story points
5. Timeline: ~1 week after MVP completion
6. Dependency: Complete MVP-3/MVP-4 first for tool foundation

### 7.2 Option B: Pause MVP, Implement Now

**Rationale**:
- Better immediate user experience
- Higher quality implementation from start
- Reduces technical debt accumulation

**Action Items**:
1. Block MVP progress to implement Epic 29
2. Implement full agentic loop with state tracking
3. Higher risk, longer timeline
4. Better immediate experience with iteration visibility

### 7.3 Option C: Minimal Implementation

**Rationale**:
- Quick unblock for basic multi-step
- Technical debt for later cleanup

**Action Items**:
1. Add `maxIterations(3)` without full state tracking
2. Quick unblock for basic multi-step tasks
3. Document as technical debt in code comments

---

## 8. Decision Required

### Options

**Option A: Defer to Post-MVP** (Recommended)
- Pros: Lower risk, solid foundation, proper state management
- Cons: Delays full agentic capabilities, requires Epic 29 work

**Option B: Pause MVP, Implement Now**
- Pros: Better UX now, proper implementation
- Cons: Blocks MVP progress, higher risk, delays other features

**Option C: Minimal Implementation**
- Pros: Quick unblock, minimal code change
- Cons: Technical debt, poor UX, no state tracking

### Recommendation

**Option A** - Defer to post-MVP. The tool infrastructure must be solid before adding loop complexity. MVP-3/4 validates tools work correctly. Epic 29 adds full autonomy with proper state management. This aligns with the research document's emphasis on robust orchestration layers over raw model intelligence.

---

## 9. Lessons Learned

### 9.1 Research-to-Implementation Gap
TanStack AI agentic cycle research existed but wasn't implemented. The [`useAgentChatWithTools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts) hook was created without referencing the agentic loop configuration requirements from the research document.

### 9.2 Integration Over Components
Tool implementations verified but agentic integration untested. The missing `agentLoopStrategy` configuration wasn't caught during development or testing because unit tests likely don't test multi-turn conversations.

### 9.3 E2E Testing Critical
Manual agent testing revealed gap that unit tests didn't catch. Single-tool execution works in isolation, but the agentic loop (multi-step planning) requires browser E2E verification of the full agent workflow.

### 9.4 Process Improvements
- Add "agentic loop" to Definition of Done for agent features
- Update test plans to include multi-step scenarios
- Cross-reference research docs during implementation
- Add integration tests for agent loop state management

---

## 10. Related Artifacts

1. [`_bmad-output/course-corrections/agentic-loop-missing-2025-12-25.md`](_bmad-output/course-corrections/agentic-loop-missing-2025-12-25.md) - Previous analysis identifying missing agentic loop
2. [`_bmad-output/research/20205-12-25/agentic-coding-platforms-explanation.md`](_bmad-output/research/20205-12-25/agentic-coding-platforms-explanation.md) - Agentic platforms research
3. [`_bmad-output/research/agentic-execution-loop-deep-research-2025-12-25.md`](_bmad-output/research/agentic-execution-loop-deep-research-2025-12-25.md) - TanStack AI agentic cycle research
4. [`_bmad-output/epics/epic-29-agentic-execution-loop.md`](_bmad-output/epics/epic-29-agentic-execution-loop.md) - Epic 29 definition for agentic loop
5. [`src/lib/agent/tools/read-file-tool.ts`](src/lib/agent/tools/read-file-tool.ts) - read_file tool implementation
6. [`src/lib/agent/facades/file-tools-impl.ts`](src/lib/agent/facades/file-tools-impl.ts) - FileTools facade implementation
7. [`src/lib/filesystem/local-fs-adapter.ts`](src/lib/filesystem/local-fs-adapter.ts) - LocalFSAdapter implementation
8. [`src/lib/agent/hooks/use-agent-chat-with-tools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts) - Agent chat hook with missing loop config

---

**Author**: BMAD Master (Platform A)  
**Status**: Pending User Decision  
**Next Action**: Request user approval for Epic 29 prioritization and implementation approach
