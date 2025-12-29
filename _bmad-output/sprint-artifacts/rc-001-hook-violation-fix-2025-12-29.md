# Story Context: RC-001 - Fix Hook Violation in Error Handling

**Story ID:** RC-001
**Priority:** CRITICAL (P0)
**Sprint:** 27A
**Created:** 2025-12-29
**Validator:** Ralph Loop

---

## Problem Statement

The `showErrorToast()` function in `src/lib/utils/error-handling.ts` calls the `useTranslation()` React hook directly. This violates React's Rules of Hooks because:

1. `showErrorToast()` is a utility function that can be called from non-React contexts (event handlers, API routes, utility modules)
2. Calling a hook outside a React component or custom hook causes undefined behavior
3. This will cause runtime errors when error handling is triggered from non-component contexts

### Current Code (Violates Rules of Hooks)

```typescript
// src/lib/utils/error-handling.ts:41-42
export function showErrorToast(error: Error | string, options?: ErrorRecoveryOptions) {
    const { t } = useTranslation()  // ❌ VIOLATION: Hook called in utility function
    // ...
}
```

### Impact

- Runtime errors when `showErrorToast()` is called from:
  - API route handlers
  - Event handlers outside React context
  - Utility functions
  - Any non-component code path

---

## Technical Analysis

### Root Cause

The `useTranslation()` hook was used directly in a utility function instead of following the pattern of passing translation keys or pre-translated strings.

### Files Affected

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/utils/error-handling.ts` | Modify | Refactor `showErrorToast()` to accept translation keys |
| `src/lib/utils/error-handling.ts` | Add | Create `getTranslatedErrorMessage()` helper |
| `src/i18n/en.json` | Add | Translation keys for error messages |
| `src/i18n/vi.json` | Add | Vietnamese translations |
| `**/*.test.ts` | Modify | Update tests for new function signature |

---

## Proposed Solution

### Pattern Change

**Before:** Utility function calls hook internally
```typescript
showErrorToast(error) // internal hook call
```

**After:** Utility function accepts translation keys or pre-translated strings
```typescript
showErrorToast(error, { messageKey: 'error.file.tooLarge' })
// OR
showErrorToast(error, { message: preTranslatedString })
```

### Implementation Strategy

1. Create a new `getTranslationKeyForError()` helper that maps error types to translation keys
2. Modify `showErrorToast()` to accept optional `messageKey` or `message` parameter
3. Use the translation hook in the calling component, pass result to utility
4. Add translation keys for all error types used in error-handling.ts

### New Function Signature

```typescript
export interface ErrorToastOptions {
    recovery?: ErrorRecoveryOptions;
    messageKey?: string;      // Translation key (e.g., 'error.file.tooLarge')
    message?: string;         // Pre-translated message (fallback)
    duration?: number;
}

export function showErrorToast(error: Error | string, options?: ErrorToastOptions): void {
    // Use provided message/key or derive from error
    const message = options?.message ?? options?.messageKey ?? getDefaultMessage(error);
    // ... rest of implementation (no hook call)
}

function getDefaultMessage(error: Error | string): string {
    if (typeof error === 'string') return error;
    // Map error types to default messages
    return error.message;
}
```

---

## Acceptance Criteria

### Functional ACs

- [ ] `showErrorToast()` can be called from non-React contexts without errors
- [ ] `showErrorToast()` accepts `messageKey` for translation
- [ ] `showErrorToast()` accepts pre-translated `message` as fallback
- [ ] Existing callers updated to pass translation keys or use new pattern

### Quality ACs

- [ ] No `useTranslation()` calls outside React components
- [ ] All error types have corresponding translation keys
- [ ] TypeScript compilation succeeds without errors
- [ ] No regression in existing toast functionality

### Test ACs

- [ ] Unit tests verify function works in non-component context
- [ ] Integration tests verify toast displays correctly
- [ ] Tests cover all error types with translation keys

---

## Implementation Plan

### Step 1: Add Translation Keys

Add to `src/i18n/en.json`:
```json
{
  "error": {
    "file": {
      "tooLarge": "File exceeds maximum size limit (10MB)",
      "notFound": "File not found",
      "accessDenied": "Permission denied to access file"
    },
    "sync": {
      "failed": "Synchronization failed",
      "rollback": "Changes rolled back due to sync error"
    },
    "network": {
      "offline": "Network connection unavailable",
      "timeout": "Request timed out"
    },
    "validation": {
      "invalidInput": "Invalid input provided"
    },
    "unknown": "An unknown error occurred"
  }
}
```

### Step 2: Create Helper Function

Create `getTranslationKeyForError()` that maps error types to keys:
```typescript
export function getTranslationKeyForError(error: Error | string): string {
    if (typeof error === 'string') return 'error.unknown';

    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('size') || errorMessage.includes('large')) {
        return 'error.file.tooLarge';
    }
    if (errorMessage.includes('not found') || errorMessage.includes('enoent')) {
        return 'error.file.notFound';
    }
    if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        return 'error.file.accessDenied';
    }
    if (errorMessage.includes('sync') || errorMessage.includes('write')) {
        return 'error.sync.failed';
    }
    if (errorMessage.includes('network') || errorMessage.includes('offline')) {
        return 'error.network.offline';
    }
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        return 'error.network.timeout';
    }
    return 'error.unknown';
}
```

### Step 3: Refactor showErrorToast()

Remove hook call, use passed parameters:
```typescript
export function showErrorToast(error: Error | string, options?: ErrorToastOptions): void {
    let displayMessage: string;

    if (options?.message) {
        displayMessage = options.message;
    } else if (options?.messageKey) {
        // Get translation - caller must provide translated string or use hook in component
        // This utility doesn't call hooks
        displayMessage = options.messageKey; // Fallback to key (component should translate)
    } else {
        displayMessage = getDefaultMessage(error);
    }

    // Rest of implementation using displayMessage
    toast.error(displayMessage, {
        duration: options?.duration ?? 5000,
        // ... other options
    });
}
```

### Step 4: Update Callers

Find all callers of `showErrorToast()` and update to either:
1. Use hook in component, pass translated string
2. Pass `messageKey` if translation is handled elsewhere

### Step 5: Create Component Wrapper

For React components that want automatic translation:
```typescript
// Create wrapper for component usage
export function useErrorToast() {
    const { t } = useTranslation();

    return useCallback((error: Error | string, options?: ErrorToastOptions) => {
        const message = options?.message ?? t(getTranslationKeyForError(error));
        showErrorToast(error, { ...options, message });
    }, [t]);
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('showErrorToast', () => {
    it('should work with string error in non-component context', () => {
        // This should not throw
        expect(() => {
            showErrorToast('Test error message');
        }).not.toThrow();
    });

    it('should work with Error object in non-component context', () => {
        expect(() => {
            showErrorToast(new Error('Test error'));
        }).not.toThrow();
    });

    it('should use provided message over error message', () => {
        const customMessage = 'Custom translated message';
        showErrorToast(new Error('Original'), { message: customMessage });
        expect(toast.error).toHaveBeenCalledWith(customMessage, expect.any(Object));
    });

    it('should use messageKey when provided', () => {
        showErrorToast(new Error('Test'), { messageKey: 'error.file.tooLarge' });
        expect(toast.error).toHaveBeenCalledWith('error.file.tooLarge', expect.any(Object));
    });
});
```

### Integration Tests

- Test toast displays in actual React component
- Test error toast in non-component context (API route simulation)
- Test translation key resolution

---

## Files Modified

| File | Change |
|------|--------|
| `src/lib/utils/error-handling.ts` | Refactor showErrorToast(), add helpers |
| `src/i18n/en.json` | Add error translation keys |
| `src/i18n/vi.json` | Add Vietnamese error translations |
| `src/lib/utils/__tests__/error-handling.test.ts` | Add/update tests |
| `src/hooks/` (new) | Add `useErrorToast()` hook wrapper |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] TypeScript compilation succeeds
- [ ] No React hook violations
- [ ] Code reviewed and approved
- [ ] Documentation updated

---

## Related Issues

- Ralph Loop Validation: CRIT-001
- Correct-Course Workflow: RC-001
- Story Dev Cycle: Iteration 1

---

**Created:** 2025-12-29
**Status:** Ready for Development
