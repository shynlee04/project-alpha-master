# Code Commenting Standards

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## Philosophy

Code should be self-documenting. Comments explain **why**, not **what**.

---

## When to Comment

### ✅ Good Reasons

```typescript
// FSA permissions don't persist across sessions - must re-prompt
const permission = await handle.queryPermission();

// WebContainer is window-bound - cannot share across tabs
// See: Epic 13 retrospective, Focus Mode solution
const container = await WebContainer.boot();
```

### ❌ Bad Reasons

```typescript
// Don't do this - obvious from code
const count = 0; // Initialize count to zero

// Don't do this - temporary/change notes
// TODO: Fix this later - John 12/20/25
```

---

## JSDoc for Public APIs

```typescript
/**
 * Syncs local filesystem to WebContainer.
 * 
 * @param handle - FSA directory handle
 * @param options - Sync configuration
 * @returns Promise resolving when sync completes
 * @throws {PermissionDeniedError} If user denies permission
 * 
 * @example
 * ```ts
 * await syncToWebContainer(handle, { exclude: ['node_modules'] });
 * ```
 */
export async function syncToWebContainer(
  handle: FileSystemDirectoryHandle,
  options?: SyncOptions
): Promise<void> {
```

---

## General Rules

- **Self-Documenting Code**: Clear names > comments
- **Explain Why**: Not what the code does
- **Evergreen Content**: No dates, names, or "fix later" notes
- **JSDoc Public APIs**: All exported functions need JSDoc
- **Link to Context**: Reference retrospectives, epics when relevant
