# Story: RC-014 - AbortController Wire

**Story ID:** rc-014-abort-controller-wire
**Sprint:** 27B
**Priority:** HIGH (HIGH-011)
**Status:** ready-for-dev
**Estimated Points:** 5
**Owner:** Team B

## Issue Description

AbortController is not consistently wired through the tool execution chain, causing:
- Cancelled operations continuing to run
- Memory leaks from uncancelled subscriptions
- Race conditions when user cancels mid-operation
- No proper cleanup on component unmount

## Root Cause

Epic 4 implemented tool execution without consistent AbortController propagation. Some operations check for cancellation, others don't.

## Acceptance Criteria

1. [ ] All async tool operations accept `AbortSignal` parameter
2. [ ] Signal propagates through call chain:
   - Agent chat → Tool execution → Facade → WebContainer operations
3. [ ] Cancellation checks at key points:
   - Before expensive operations
   - After await points
   - In loop iterations
4. [ ] Cleanup on user cancellation:
   - Abort signal aborted
   - Event listeners removed
   - Subscriptions unsubscribed
5. [ ] User-facing cancel button works for all tool operations
6. [ ] Tests cover: cancellation propagation, cleanup, race conditions (15+ tests)

## Technical Approach

```typescript
// Tool execution with AbortSignal
async function executeToolWithSignal(
  tool: Tool,
  args: ToolArgs,
  signal?: AbortSignal
): Promise<ToolResult> {
  if (signal?.aborted) {
    throw new ToolCancellationError('Operation was cancelled');
  }

  try {
    const result = await tool.execute(args, { signal });

    if (signal?.aborted) {
      throw new ToolCancellationError('Operation was cancelled during execution');
    }

    return result;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ToolCancellationError('Operation was cancelled');
    }
    throw error;
  }
}

// Agent chat cancellation
function useAgentChatWithCancellation() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeTool = useCallback(async (tool: Tool, args: ToolArgs) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    return executeToolWithSignal(tool, args, abortControllerRef.current.signal);
  }, []);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { executeTool, cancel };
}
```

## Dependencies

- `src/lib/agent/tools/` - All tool implementations
- `src/lib/agent/facades/` - Facade layer
- `src/components/agent/AgentChatPanel.tsx` - Integration

## Files to Modify

- `src/lib/agent/tools/file-tools.ts` - Add signal propagation
- `src/lib/agent/tools/terminal-tools.ts` - Add signal propagation
- `src/lib/agent/facades/file-tools-facade.ts` - Add signal to facade
- `src/lib/agent/facades/terminal-tools-facade.ts` - Add signal to facade
- `src/lib/agent/__tests__/tool-execution.test.ts` - Add cancellation tests

## Files to Create

- `src/lib/utils/abort-controller.ts` - AbortController utilities

## Test Strategy

1. **Propagation Tests**: Signal reaches deepest operation
2. **Cancellation Tests**: Operations stop when cancelled
3. **Cleanup Tests**: Resources released after cancellation
4. **Race Tests**: New operation cancels previous one
5. **UI Tests**: Cancel button triggers actual cancellation

## Definition of Done

- [ ] All AC satisfied
- [ ] 15+ tests passing (100%)
- [ ] Code reviewed
- [ ] Integration validated with agent chat
- [ ] sprint-status.yaml updated

## Notes

Focus on high-impact operations first: file writes, command execution, batch operations.

---

**Created:** 2025-12-29
**Last Updated:** 2025-12-29
