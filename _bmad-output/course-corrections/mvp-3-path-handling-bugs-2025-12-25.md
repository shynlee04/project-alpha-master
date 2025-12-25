# Course Correction: MVP-3 Path Handling Bugs

**ID:** CC-2025-12-25-001  
**Created:** 2025-12-25T18:15:00+07:00  
**Severity:** P0 (Blocking MVP-3 E2E Validation)  
**Status:** IN_PROGRESS

---

## Incident Summary

During E2E testing of MVP-3 (Tool Execution - File Operations), the `read_file` tool fails with error:
> "không thể thực thi lệnh getDirectoryHandle trên FileSystemDirectoryHandle vì tên không được phép"

This translates to: "Cannot execute getDirectoryHandle on FileSystemDirectoryHandle because the name is not allowed"

---

## Root Cause Analysis

### Bug 1: list_files Tool Creates Malformed Paths

**Location:** `src/lib/agent/tools/list-files-tool.ts` lines 38 and 82

**Problem:**
```typescript
// Line 38 (server) and 82 (client)
path: `${path}/${entry.name}`.replace(/\/+/g, '/')
```

When `path=""` (root directory), this produces paths like `/filename` with a leading slash.

**Impact:** Agent receives file paths like `/src/App.tsx` instead of `src/App.tsx`.

---

### Bug 2: read_file Tool Doesn't Normalize Paths

**Location:** `src/lib/agent/tools/read-file-tool.ts` line 30

**Problem:** The tool passes user-provided paths directly to facade without normalization.

When agent uses paths from list_files (e.g., `/src/App.tsx`), the path validation in `path-guard.ts` line 38 rejects it:
```typescript
if (normalized.startsWith('/')) {
    throw new FileSystemError(
        `Invalid path for ${operation}. Use relative paths, not absolute paths.`,
        'ABSOLUTE_PATH'
    );
}
```

---

### Bug 3: Cryptic Error Message

**Location:** Browser File System Access API

**Problem:** When the FileSystemError isn't caught properly, the browser's native error surfaces with a non-descriptive message in the user's language.

---

## Fixes Required

### Fix 1: Normalize Paths in list_files Tool

```diff
// list-files-tool.ts line 38 (server) and 82 (client)
- path: `${path}/${entry.name}`.replace(/\/+/g, '/'),
+ path: path ? `${path}/${entry.name}` : entry.name,
```

### Fix 2: Add Path Normalization Helper

Create utility function and use in all tools:
```typescript
// path normalization utility
function normalizePath(path: string): string {
    return path
        .replace(/\\/g, '/')           // Windows backslashes
        .replace(/^\/+/, '')           // Leading slashes
        .replace(/\/+/g, '/')          // Multiple slashes
        .replace(/^\.\//, '');         // Leading ./
}
```

### Fix 3: Apply Normalization in Tools

Apply normalization in read_file, write_file, list_files client tools before passing to facade.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/agent/tools/list-files-tool.ts` | Fix path concatenation logic |
| `src/lib/agent/tools/read-file-tool.ts` | Add path normalization |
| `src/lib/agent/tools/write-file-tool.ts` | Add path normalization |
| `src/lib/agent/tools/types.ts` | Add normalizePath utility (optional) |

---

## Verification Steps

After fixes, run these test scenarios:

1. **List Root Directory:** Agent calls `list_files({ path: "" })` → paths should NOT have leading slashes
2. **Read File from List:** Agent lists files, then reads one → should succeed
3. **Read File Direct:** Agent reads `src/App.tsx` directly → should succeed
4. **Read Nested File:** Agent reads `src/components/Hello.tsx` → should succeed

---

## Lessons Learned

1. **Path handling is error-prone** - always normalize at the boundary
2. **Test with empty/root paths** - common edge case
3. **Use descriptive error messages** - wrap browser errors
