# Story: RC-015 - Retry Classification

**Story ID:** rc-015-retry-classification
**Sprint:** 27B
**Priority:** HIGH (HIGH-012)
**Status:** ready-for-dev
**Estimated Points:** 5
**Owner:** Team B

## Issue Description

The error handling system in `src/lib/utils/error-handling.ts` does not classify errors for retry eligibility. This causes:
- Non-retryable errors (like PERMISSION_DENIED) being retried
- Exponential backoff wasted on fatal errors
- User confusion from repeated failures
- Poor user experience

## Root Cause

Epic 4 Story 4 implemented error handling but did not include retry classification. The retry queue (RC-006) needs this classification to work correctly.

## Acceptance Criteria

1. [ ] Error classification system classifies errors as:
   - `RETRYABLE`: NetworkTimeout, ServiceUnavailable, RateLimit
   - `NON_RETRYABLE`: PermissionDenied, InvalidInput, NotFound
   - `FATAL`: DataCorruption, SchemaViolation, SecurityViolation
2. [ ] Classification based on error code and message patterns
3. [ ] Classification can be extended via registry pattern
4. [ ] Default classification for unknown errors (conservative: NON_RETRYABLE)
5. [ ] Tests cover: each error type maps to correct classification, registry extension (12+ tests)

## Technical Approach

```typescript
// Error classification types
export type RetryClass = 'RETRYABLE' | 'NON_RETRYABLE' | 'FATAL';

export interface ErrorClassifier {
  classify(error: Error): RetryClass;
}

export interface ErrorClassificationRule {
  matches(error: Error): boolean;
  classification: RetryClass;
}

// Registry pattern
class ErrorClassificationRegistry {
  private rules: ErrorClassificationRule[] = [];

  register(rule: ErrorClassificationRule): void {
    this.rules.unshift(rule); // More specific rules first
  }

  classify(error: Error): RetryClass {
    for (const rule of this.rules) {
      if (rule.matches(error)) {
        return rule.classification;
      }
    }
    return 'NON_RETRYABLE'; // Conservative default
  }
}

// Built-in rules
const builtInRules: ErrorClassificationRule[] = [
  // FATAL
  { matches: e => e.name === 'DataCorruptionError', classification: 'FATAL' },
  { matches: e => e.message.includes('schema violation'), classification: 'FATAL' },

  // NON_RETRYABLE
  { matches: e => e.message.includes('permission denied'), classification: 'NON_RETRYABLE' },
  { matches: e => e.message.includes('not found'), classification: 'NON_RETRYABLE' },
  { matches: e => e.name === 'ValidationError', classification: 'NON_RETRYABLE' },

  // RETRYABLE
  { matches: e => e.name === 'TimeoutError', classification: 'RETRYABLE' },
  { matches: e => e.message.includes('network error'), classification: 'RETRYABLE' },
  { matches: e => e.message.includes('service unavailable'), classification: 'RETRYABLE' },
];

// Usage
const classifier = new ErrorClassificationRegistry();
builtInRules.forEach(rule => classifier.register(rule));

function classifyForRetry(error: Error): RetryClass {
  return classifier.classify(error);
}
```

## Dependencies

- `src/lib/utils/error-handling.ts` - Existing error utilities
- RC-006 (retry queue) - Consumer of classification
- `src/lib/agent/tools/tool-error.ts` - Tool error types

## Files to Modify

- `src/lib/utils/error-handling.ts` - Add classification system
- `src/lib/utils/__tests__/error-classification.test.ts` - Add classification tests

## Files to Create

- `src/lib/utils/error-classification.ts` - Classification utilities

## Test Strategy

1. **Classification Tests**: Each error code maps to correct class
2. **Rule Order Tests**: More specific rules take precedence
3. **Default Tests**: Unknown errors get NON_RETRYABLE
4. **Registry Tests**: Custom rules registered and used
5. **Integration Tests**: Works with retry queue

## Definition of Done

- [ ] All AC satisfied
- [ ] 12+ tests passing (100%)
- [ ] Code reviewed
- [ ] Integration validated with retry queue
- [ ] sprint-status.yaml updated

## Notes

This story provides the foundation for RC-006. Classification should be conservative to avoid infinite retry loops.

---

**Created:** 2025-12-29
**Last Updated:** 2025-12-29
