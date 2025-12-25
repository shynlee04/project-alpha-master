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

**File:** `src/lib/agent/facades/file-tools-impl.ts` (line 86-91)

```diff
 async listDirectory(path: string = '', recursive = false): Promise<FileEntry[]> {
-    validatePath(path);
-    const entries = await this.localFS.listDirectory(path);
+    // Normalize '.' to '' since '.' means current directory (root)
+    // The FSA API uses empty string '' for root, not '.'
+    const normalizedPath = path === '.' ? '' : path;
+    validatePath(normalizedPath);
+    const entries = await this.localFS.listDirectory(normalizedPath);
```

---

## 3. Verification

- [x] `pnpm build` passes (32.41s)
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
