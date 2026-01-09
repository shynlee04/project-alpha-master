# MM-09: Context Window Manager

**Epic**: EPIC-40 - Multimodal Chat Unification
**Story**: MM-09
**Title**: Context Window Manager
**Effort**: 4 hours
**Priority**: P0
**Status**: IN_PROGRESS
**Track**: C
**Created**: 2026-01-10T02:15:00+07:00

## Overview

Implement context window management to prevent token overflow in long conversations. The system must track token usage, estimate message costs, and apply compression strategies when context limits are approached.

## Dependencies

- MM-01: Unified Chat Store (DONE - provides `ContextWindowConfig` entity)
- MM-02: Thread Management (DONE - provides thread structure)
- MM-03: Tool Execution (DONE - provides message tracking)

## Acceptance Criteria

1. **Token Estimation**
   - Estimate token count for messages (~4 chars per token for text)
   - Account for tool calls and structured data
   - Track cumulative tokens per thread

2. **Context Window Tracking**
   - Update `ChatThread.contextWindow` on each message
   - Persist token counts to IndexedDB via unified store
   - Provide `getContextUsage()` selector

3. **Compression Strategy Application**
   - `drop_oldest`: Remove oldest non-system messages
   - `summarize`: (Placeholder) Future integration with summarization
   - `truncate`: Cut oldest messages partially

4. **RAG Integration**
   - Provide context window info to RAG system
   - Allow RAG to query remaining capacity
   - Prevent context overflow during retrieval

## Implementation Tasks

1. Create `context-window-slice.ts` in unified chat store
2. Add `estimateTokens()` utility function
3. Update `addMessage()` to track context usage
4. Implement `compressContext()` method
5. Add `getContextUsage()` selector
6. Update `ChatThread` type to include contextWindow (already in domain entity)

## Files to Create

- `src/infrastructure/persistence/stores/chat/slices/context-window-slice.ts`
- `src/lib/agent/utils/token-estimator.ts`

## Files to Modify

- `src/infrastructure/persistence/stores/chat/unified-chat-store.ts` - Add context window slice
- `src/infrastructure/persistence/stores/chat/unified-chat-types.ts` - Extend with context types

## Quality Gates

- TypeScript: Zero new errors
- Slice size: ≤120 lines
- Token estimation accuracy: ±20%
- No message loss during compression (except intentional drop)

## Notes

- Context window limits are model-dependent (typically 128k-4M tokens)
- Compression is async for summarize strategy
- System messages are never dropped
- User messages are preserved over assistant messages when dropping
