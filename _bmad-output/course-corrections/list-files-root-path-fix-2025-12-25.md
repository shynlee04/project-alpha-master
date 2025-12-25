# Course Correction: list_files Tool Fails on Root Path `.`

**Date:** 2025-12-25  
**Severity:** P0 - Blocking MVP-3 Testing  
**Incident Type:** Tool Execution Bug  
**Related Story:** MVP-3 (Tool Execution - File Operations)

---

## 1. Problem Statement

### Observed Behavior
Agent testing revealed the `list_files` tool fails when the LLM requests to list the root directory using path `.`:

```
Agent: "Hệ thống không thể truy cập vào đường dẫn gốc (.) để liệt kê các tệp và thư mục..."
Translation: "The system cannot access the root path (.) to list files and directories..."
```

### Root Cause
The File System Access API (FSA) expects empty string `''` for root directory, NOT `.`:

```
listDirectory('')  → ✅ Lists root directory
listDirectory('.') → ❌ Tries to find subdirectory named '.'
```

**Execution chain:**
1. LLM calls `list_files({ path: '.' })`
2. `factory.ts:122` → `tools.listDirectory('.')`
3. `file-tools-impl.ts:88` → `localFS.listDirectory('.')`
4. `dir-ops.ts:24-26`:
   ```typescript
   const dirHandle = path
       ? await getDirectoryHandleFromPath(root, path)  // path='.' → FAILS!
       : root;
   ```
5. FSA tries to find subdirectory named `.` which doesn't exist → Error

---

## 2. Fix Applied

### Part 1: Centralized `normalizePath()` Helper

**File:** `src/lib/agent/facades/file-tools.ts` (lines 114-143)

```typescript
/**
 * Normalize a path for FSA API compatibility
 * LLMs often use Unix conventions (., ./) that FSA doesn't understand
 */
export function normalizePath(path: string): string {
    if (path === '.') return '';           // Current directory = root
    if (path.startsWith('./')) return path.slice(2);  // Remove ./ prefix
    if (path.startsWith('.\\')) return path.slice(2); // Windows variant
    return path;
}
```

### Part 2: Applied to All File Tool Methods

**File:** `src/lib/agent/facades/file-tools-impl.ts`

| Method | Line | Change |
|--------|------|--------|
| `readFile` | 45-47 | Added `normalizePath(path)` |
| `writeFile` | 65-68 | Added `normalizePath(path)` |
| `listDirectory` | 86-88 | Replaced inline fix with `normalizePath()` |
| `createFile` | 113-116 | Added `normalizePath(path)` |
| `deleteFile` | 134-137 | Added `normalizePath(path)` |
| `searchFiles` | 153-155 | Added `normalizePath(basePath)` |

### Part 3: `execute_command` Analysis

**Result:** No changes needed. The `cwd` parameter is passed to WebContainer which handles `.` correctly.

---

## 3. Verification

- [x] `pnpm build` passes (28.95s)
- [ ] Manual E2E test: Agent can list root directory with `.` path
- [ ] Integration test: Verify recursive listing works from root

---

## 4. Lessons Learned

1. **FSA API semantics differ from Unix**: Empty string = root, not `.`
2. **LLM tends to use `.` for current directory**: Common Unix convention
3. **Normalization layer needed**: Agent inputs should be normalized before FSA calls

---

**Author:** BMAD Dev (Debugging Session)  
**Status:** Fix Applied, Pending E2E Verification
