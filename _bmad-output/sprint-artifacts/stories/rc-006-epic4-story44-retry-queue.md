# Story: RC-006 - Epic 4 Story 44 Retry Queue Completion

**Story ID:** rc-006-epic4-story44-retry-queue
**Sprint:** 27B
**Priority:** HIGH (HIGH-002)
**Status:** ready-for-dev
**Estimated Points:** 3
**Owner:** Team B

## Issue Description

Epic 4 Story 44 (retry queue implementation for tool execution) was partially implemented but not completed. The retry queue infrastructure exists but lacks:
- Proper error classification for retryable vs non-retryable errors
- Exponential backoff calculation
- Max retry limit enforcement
- Queue persistence across sessions

## Root Cause

The retry queue was scaffolded during Epic 4 but validation found that error classification was incomplete. Errors like permission denied were being retried when they should fail immediately.

## Acceptance Criteria

1. [ ] Error classification system classifies errors as:
   - `RETRYABLE`: network timeouts, transient failures
   - `NON_RETRYABLE`: permission denied, invalid input, authentication failures
   - `FATAL`: data corruption, schema violations
2. [ ] Exponential backoff calculation: `delay = min(baseDelay * 2^attempt, maxDelay) + jitter`
3. [ ] Max retry limits per error type:
   - `RETRYABLE`: 3 attempts
   - `NON_RETRYABLE`: 1 attempt (fail immediately)
   - `FATAL`: 0 attempts (fail immediately)
4. [ ] Queue state persists to Dexie for session recovery
5. [ ] Event bus emits lifecycle events: `retry-queued`, `retry-attempt`, `retry-success`, `retry-exhausted`
6. [ ] Tests cover: error classification, backoff calculation, limits, persistence (12+ tests)

## Technical Approach

```typescript
// Error Classification Pattern
type RetryClassification = 'RETRYABLE' | 'NON_RETRYABLE' | 'FATAL';

class RetryClassifier {
  classify(error: ToolError): RetryClassification {
    if (error.code === 'PERMISSION_DENIED' ||
        error.code === 'INVALID_INPUT' ||
        error.code === 'AUTH_FAILED') {
      return 'NON_RETRYABLE';
    }
    if (error.code === 'DATA_CORRUPTION' ||
        error.code === 'SCHEMA_VIOLATION') {
      return 'FATAL';
    }
    return 'RETRYABLE';
  }
}

// Backoff Calculation
function calculateBackoff(attempt: number, baseDelay = 1000): number {
  const maxDelay = 30000; // 30 seconds
  const jitter = Math.random() * 0.3 * baseDelay; // 30% jitter
  const exponential = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  return Math.floor(exponential + jitter);
}
```

## Dependencies

- `src/lib/agent/tools/tool-error.ts` - Error types
- RC-015 (retry classification) - Related classification system
- `src/lib/state/sync-status-store.ts` - For queue persistence

## Files to Modify

- `src/lib/agent/tools/retry-queue.ts` - Complete retry queue implementation
- `src/lib/agent/tools/__tests__/retry-queue.test.ts` - Add comprehensive tests

## Files to Create

- None

## Test Strategy

1. **Classification Tests**: Each error code maps to correct classification
2. **Backoff Tests**: Verify formula produces expected delays
3. **Limit Tests**: Verify max attempts enforced per type
4. **Persistence Tests**: Queue survives page refresh
5. **Integration Tests**: Works with tool execution flow

## Definition of Done

- [ ] All AC satisfied
- [ ] 12+ tests passing (100%)
- [ ] Code reviewed
- [ ] Integration validated with tool execution
- [ ] sprint-status.yaml updated

## Notes

This story completes the Epic 4 Story 44 retry queue that was flagged as incomplete during Phase 1 validation.

---

**Created:** 2025-12-29
**Last Updated:** 2025-12-29
