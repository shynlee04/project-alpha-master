# Course Correction: Missing Agentic Execution Loop

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

### Root Cause
The `useAgentChatWithTools.ts` hook uses TanStack AI's `useChat` **without** configuring the `agentLoopStrategy` parameter. This results in:

1. **Single-shot execution**: Agent stops after first tool call result
2. **No iteration**: Agent cannot plan → act → observe → refine
3. **No state tracking**: No `AgentLoopState` to track iterations
4. **No termination control**: No `maxIterations()` or `untilFinishReason()`

---

## 2. Technical Analysis

### Current Implementation (Line 242-243 of `use-agent-chat-with-tools.ts`)
```typescript
// Use TanStack AI chat hook with typed options
const chatResult = useChat(chatOptions);
```

### Missing Configuration
```typescript
// SHOULD have agentLoopStrategy:
const chatOptions = {
  connection,
  tools: agentTools.getClientTools(),
  agentLoopStrategy: maxIterations(10), // ← MISSING!
};
```

### Required TanStack AI Imports
From research `tanstack-ai-agentic-cycle-2025-12-10.md`:
```typescript
import { maxIterations, untilFinishReason, chat } from "@tanstack/ai";
```

---

## 3. Architecture Gap Analysis

### What TanStack AI Provides
Per the agentic coding platforms research (`agentic-coding-platforms-explanation.md`):

1. **Recursive Execution Loop** (Section 2.1)
   - Plan-Act-Observe-Refine cycle
   - State machine for task lifecycle
   - "Boomerang Tasks" for long-running operations

2. **AgentLoopState Interface** (Section 1.3)
   ```typescript
   interface AgentLoopState {
     iterationCount: number;
     messages: ModelMessage[];
     finishReason: string | null;
     data?: Record<string, any>;
   }
   ```

3. **Built-in Strategies** (Section 2.1-2.2)
   - `maxIterations(n)` - Limit iterations
   - `untilFinishReason(['stop'])` - Stop on completion signal
   - Custom strategies via function composition

### What Via-gent Currently Has
- ✅ Tool definitions (read_file, write_file, execute_command)
- ✅ Approval workflow (ApprovalOverlay)
- ✅ Event emission (file:modified, agent:tool:*)
- ❌ Agent loop configuration
- ❌ Iteration state tracking
- ❌ Termination strategies

---

## 4. Impact Assessment

### Severity: P0 - Feature Blocking

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

---

## 5. Proposed Solution

### Epic 29: Agentic Execution Loop

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

---

## 6. Immediate Remediation

### Quick Fix (MVP Can Continue)
For MVP-3/MVP-4 testing, agents can still:
- Execute single tool calls (requires user to re-prompt)
- Complete simple tasks that need one operation
- Test individual tool implementations

### Long-term Fix (Epic 29)
Full agentic capability requires Epic 29 implementation with:
- Estimated effort: 5-8 story points
- Timeline: ~1 week after MVP completion
- Dependency: Complete MVP-3/MVP-4 first for tool foundation

---

## 7. Search & References

### Codebase Evidence
```bash
# No agentLoopStrategy usage
grep -r "agentLoopStrategy" src/  # No results

# No maxIterations usage
grep -r "maxIterations" src/  # No results

# useChat without loop config
grep -A5 "useChat(" src/lib/agent/hooks/use-agent-chat-with-tools.ts
```

### Documentation References
1. `_bmad-output/research/tanstack-ai-agentic-cycle-2025-12-10.md`
2. `_bmad-output/research/20205-12-25/agentic-coding-platforms-explanation.md`
3. TanStack AI docs: https://tanstack.com/ai/latest/docs/guides/agentic-cycle

---

## 8. Decision Required

### Options

**Option A: Defer to Post-MVP (Recommended)**
- Continue MVP-3/MVP-4 with single-tool execution
- Document limitation in user-facing docs
- Create Epic 29 for full agentic loop post-MVP

**Option B: Pause MVP, Implement Now**
- Block MVP progress to implement agentic loop
- Higher risk, longer timeline
- Better immediate experience

**Option C: Minimal Implementation**
- Add `maxIterations(3)` without full state tracking
- Quick unblock for basic multi-step
- Technical debt for later cleanup

### Recommendation
**Option A** - Defer to post-MVP. The tool infrastructure must be solid before adding loop complexity. MVP-3/4 validates tools work; Epic 29 adds autonomy.

---

## 9. Lessons Learned

1. **Research-to-Implementation Gap**: TanStack AI agentic cycle research existed but wasn't implemented
2. **Integration Over Components**: Tool implementations verified but agentic integration untested
3. **E2E Testing Critical**: Manual agent testing revealed gap that unit tests didn't catch

### Process Improvements
- Add "agentic loop" to Definition of Done for agent features
- Update test plans to include multi-step scenarios
- Cross-reference research docs during implementation

---

**Author**: BMAD Master (Platform A)  
**Status**: Pending User Decision  
**Next Action**: Request user approval for Epic 29 prioritization
