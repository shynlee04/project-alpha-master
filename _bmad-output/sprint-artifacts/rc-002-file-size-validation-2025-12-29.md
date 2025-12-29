# Story Context: RC-002 - Add File Size Validation (>10MB Warning)

**Story ID:** RC-002
**Priority:** CRITICAL (P0)
**Sprint:** 27A
**Created:** 2025-12-29
**Validator:** Ralph Loop

---

## Problem Statement

The file system operations lack file size validation. According to the acceptance criteria from Epic 4, Story 4.2, files exceeding 10MB should show a warning to the user. Currently, there is no validation or warning when attempting to read or write files larger than this limit.

### Current Behavior

- No validation before file read/write operations
- No warning when file exceeds 10MB limit
- Large files may cause performance issues or memory exhaustion

### Expected Behavior

- File size checked before read/write operations
- Warning toast displayed when file exceeds 10MB
- User can choose to proceed or cancel operation
- Large file handling is clearly communicated

---

## Technical Analysis

### Files Affected

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/filesystem/sync-manager.ts` | Modify | Add size check in writeFile() |
| `src/lib/filesystem/local-fs-adapter.ts` | Modify | Add size check in readFile() |
| `src/lib/agent/tools/read-file-tool.ts` | Modify | Add size check in tool execution |
| `src/lib/agent/tools/write-file-tool.ts` | Modify | Add size check in tool execution |
| `src/lib/agent/tools/list-files-tool.ts` | Modify | Add max depth validation |
| `src/lib/utils/error-handling.ts` | Modify | Use new showErrorToast with messageKey |
| `src/i18n/en.json` | Modify | Add file size warning translations |
| `src/i18n/vi.json` | Modify | Add Vietnamese translations |

### Constants to Define

```typescript
// File: src/lib/filesystem/constants.ts (new or existing)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const MAX_RECURSION_DEPTH = 3;
export const LARGE_FILE_WARNING_THRESHOLD = 5 * 1024 * 1024; // 5MB for warning
```

---

## Proposed Solution

### Implementation Strategy

1. **Create file size validation utility** in `src/lib/filesystem/validation.ts`
2. **Add size checks** to all file operation entry points
3. **Integrate with error handling** using the new `showErrorToast()` with `messageKey`
4. **Add unit tests** for size validation

### Validation Utility

```typescript
// src/lib/filesystem/validation.ts
import { MAX_FILE_SIZE, MAX_RECURSION_DEPTH } from './constants';

export interface ValidationResult {
    valid: boolean;
    errorKey?: string;
    errorParams?: Record<string, unknown>;
}

export function validateFileSize(size: number): ValidationResult {
    if (size > MAX_FILE_SIZE) {
        return {
            valid: false,
            errorKey: 'error.file.tooLarge',
            errorParams: { maxSize: formatFileSize(MAX_FILE_SIZE) }
        };
    }
    return { valid: true };
}

export function validateFilePath(path: string): ValidationResult {
    // Check for null bytes, path traversal attempts
    if (path.includes('\0')) {
        return { valid: false, errorKey: 'error.file.invalidPath' };
    }
    if (path.includes('..') && !path.match(/^\.\.(\/.*)?$/)) {
        return { valid: false, errorKey: 'error.file.pathTraversal' };
    }
    return { valid: true };
}

export function validateRecursionDepth(
    currentDepth: number,
    maxDepth: number = MAX_RECURSION_DEPTH
): ValidationResult {
    if (currentDepth >= maxDepth) {
        return {
            valid: false,
            errorKey: 'error.file.maxDepthExceeded',
            errorParams: { maxDepth }
        };
    }
    return { valid: true };
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

### Integration with SyncManager

```typescript
// In sync-manager.ts writeFile method:
import { validateFileSize } from './validation';
import { showErrorToast } from '../utils/error-handling';

async function writeFile(path: string, content: Uint8Array): Promise<void> {
    // Validate file size before writing
    if (content.length > 0) {
        const sizeValidation = validateFileSize(content.length);
        if (!sizeValidation.valid) {
            showErrorToast(new Error('File too large'), {
                messageKey: sizeValidation.errorKey!,
                action: 'dismiss'
            });
            throw new Error('File exceeds maximum size limit');
        }
    }
    // ... rest of write logic
}
```

---

## Acceptance Criteria

### Functional ACs

- [ ] Files >10MB trigger warning before read/write
- [ ] Warning shows via toast notification
- [ ] Warning message includes file size and limit
- [ ] Operation can be cancelled after warning
- [ ] Recursive directory listing limited to 3 levels

### Quality ACs

- [ ] MAX_FILE_SIZE constant defined (10MB)
- [ ] MAX_RECURSION_DEPTH constant defined (3)
- [ ] Validation functions in dedicated utility module
- [ ] TypeScript compilation succeeds
- [ ] Integration with i18n for translations

### Test ACs

- [ ] Test files < 10MB pass validation
- [ ] Test files == 10MB pass validation
- [ ] Test files > 10MB fail validation
- [ ] Test files >> 10MB (e.g., 100MB) fail with appropriate error
- [ ] Test depth limit for directory listing
- [ ] Test edge cases (0 bytes, exactly at limit)

---

## Implementation Plan

### Step 1: Create Validation Constants

```typescript
// src/lib/filesystem/constants.ts
export const FILE_CONSTANTS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024,  // 10MB
    MAX_RECURSION_DEPTH: 3,
    WARNING_THRESHOLD: 5 * 1024 * 1024,  // 5MB for early warning
    CHUNK_SIZE: 64 * 1024,  // 64KB chunks for large files
} as const;
```

### Step 2: Create Validation Utility

```typescript
// src/lib/filesystem/validation.ts
// Implement validateFileSize, validateFilePath, validateRecursionDepth
```

### Step 3: Update SyncManager

- Import validation utility
- Add size check in `writeFile()`
- Add size check in `readFile()` if applicable

### Step 4: Update Agent Tools

- Update `read-file-tool.ts` with validation
- Update `write-file-tool.ts` with validation
- Update `list-files-tool.ts` with depth validation

### Step 5: Add Translations

Add to `src/i18n/en.json`:
```json
{
  "error": {
    "file": {
      "tooLarge": "File exceeds maximum size limit ({{maxSize}}). Large files may cause performance issues.",
      "maxDepthExceeded": "Directory listing depth exceeded maximum of {{maxDepth}} levels.",
      "sizeWarning": "Warning: File is {{size}}. Consider using smaller files for optimal performance."
    }
  }
}
```

### Step 6: Write Tests

```typescript
// src/lib/filesystem/__tests__/validation.test.ts
describe('File Validation', () => {
    describe('validateFileSize', () => {
        it('should pass for files under 10MB', () => {
            const result = validateFileSize(5 * 1024 * 1024); // 5MB
            expect(result.valid).toBe(true);
        });

        it('should pass for files exactly at 10MB', () => {
            const result = validateFileSize(10 * 1024 * 1024);
            expect(result.valid).toBe(true);
        });

        it('should fail for files over 10MB', () => {
            const result = validateFileSize(11 * 1024 * 1024);
            expect(result.valid).toBe(false);
            expect(result.errorKey).toBe('error.file.tooLarge');
        });
    });
});
```

---

## Testing Strategy

### Unit Tests

| Scenario | Expected Result |
|----------|-----------------|
| File size = 5MB | Valid |
| File size = 10MB | Valid (at limit) |
| File size = 10.1MB | Invalid with error |
| File size = 100MB | Invalid with error |
| Recursion depth = 2 | Valid |
| Recursion depth = 3 | Valid (at limit) |
| Recursion depth = 4 | Invalid with error |

### Integration Tests

- Test sync-manager with large files
- Test agent tools with large files
- Test toast notification appears

---

## Files Modified

| File | Change |
|------|--------|
| `src/lib/filesystem/constants.ts` | Create with FILE_CONSTANTS |
| `src/lib/filesystem/validation.ts` | Create with validation functions |
| `src/lib/filesystem/sync-manager.ts` | Add validation in writeFile |
| `src/lib/filesystem/local-fs-adapter.ts` | Add validation in readFile |
| `src/lib/agent/tools/read-file-tool.ts` | Add validation before read |
| `src/lib/agent/tools/write-file-tool.ts` | Add validation before write |
| `src/lib/agent/tools/list-files-tool.ts` | Add depth validation |
| `src/lib/filesystem/__tests__/validation.test.ts` | Create validation tests |
| `src/i18n/en.json` | Add file size translations |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] TypeScript compilation succeeds
- [ ] Code reviewed and approved
- [ ] Documentation updated

---

## Related Issues

- Ralph Loop Validation: CRIT-002
- Correct-Course Workflow: RC-002
- Epic 4, Story 4.2 AC: "files >10MB show warning"

---

**Created:** 2025-12-29
**Status:** Ready for Development
