# WU-FSA-02: Fix Null Handle in Project CRUD Slice

**Work Unit ID**: WU-FSA-02
**Team**: Team B (Storage & State)
**Status**: ✅ COMPLETE
**Completed At**: 2026-01-17T11:15:00+07:00
**Duration**: ~10 minutes
**Target Infection**: FSA-011 (project-crud persists null handle)

---

## Summary

Fixed critical bug where `project-crud-slice.ts` was passing `null` as the FSA handle to `handlePersistenceService.persistHandle()`, causing potential runtime errors.

---

## Problem Statement

**Infection FSA-011**: In `project-crud-slice.ts` line 153, the code was:
```typescript
handlePersistenceService.persistHandle(projectId, null as any, workspaceType)
```

This was:
1. Passing `null` as the `FileSystemDirectoryHandle` parameter
2. A `as any` cast hiding the type error
3. Would cause runtime errors when `serializeHandle()` tried to access `handle.kind` and `handle.name`

---

## Root Cause Analysis

The `createProject` function in `project-crud-slice.ts` receives `input.storageMetadata` (which contains handle metadata) but not the actual `FileSystemDirectoryHandle`. The code was incorrectly trying to use `handlePersistenceService.persistHandle()` which requires an actual handle.

However, `handlePersistenceService.persistHandle()` only stores metadata (directoryPath, permissionStatus, etc.) - NOT the actual handle. So we can use the `storeFSAHandle` helper directly with the metadata we already have.

---

## Solution

Updated `project-crud-slice.ts`:

1. **Added import** for `storeFSAHandle` helper:
   ```typescript
   import { storeFSAHandle } from '@/infrastructure/persistence/dexie-db-helpers/fsa-handle-helpers';
   ```

2. **Replaced broken call** with correct metadata storage:
   ```typescript
   // Before (broken):
   handlePersistenceService.persistHandle(projectId, null as any, workspaceType)

   // After (fixed):
   storeFSAHandle({
     projectId,
     workspaceId: workspaceType,
     handleData: { kind: 'directory' as const, name: input.storageMetadata.directoryName },
     directoryPath: input.storageMetadata.directoryName,
     permissionStatus: 'granted',
     grantedAt: Date.now(),
     lastAccessedAt: Date.now(),
   })
   ```

3. **Removed unused import** for `handlePersistenceService` from this file

---

## Files Modified

| File | Action | Lines Changed |
|------|--------|---------------|
| `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | Updated imports + fixed bug | ~15 lines |

---

## Verification

✅ TypeScript compilation: No errors in modified file
✅ Correct metadata storage pattern (no actual handle stored)
✅ Consistent with canonical `HandlePersistenceService` implementation
✅ Matches pattern used in `permission-lifecycle.ts`

---

## Impact

### Positive
- Eliminates potential runtime crash when creating FSA projects
- Correctly stores handle metadata for restoration
- Consistent with ADR-033 metadata-only storage pattern

### Risk
- None - this was a bug fix, not a behavioral change

---

## Acceptance Criteria

✅ FSA-011 infection identified and fixed
✅ No `null` handles passed to persistence layer
✅ Metadata correctly stored for handle restoration
✅ TypeScript: 0 errors

---

## Notes

- The `db.fsaHandles` table stores metadata for handle restoration
- The `projects.storageMetadata` field also stores metadata (duplicate but intentional for separation of concerns)
- Both patterns store metadata only, never the actual handle (prevents DataCloneError)
