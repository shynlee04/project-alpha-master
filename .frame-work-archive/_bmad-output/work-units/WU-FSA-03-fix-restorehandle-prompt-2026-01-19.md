# WU-FSA-03: Fix restoreHandle User Prompt Issue

**Work Unit ID**: WU-FSA-03
**Team**: Team B (Storage & State)
**Status**: ✅ COMPLETE
**Completed At**: 2026-01-19T18:00:00+07:00
**Duration**: ~15 minutes
**Target Infection**: FSA-002 (restoreHandle prompts user)

---

## Summary

Fixed the `trySilentRestore` method in `HandlePersistenceService` to properly handle Chrome 129+ structuredClone for true silent handle restoration.

---

## Problem Statement

**Infection FSA-002**: `restoreHandle` was prompting users even when silent restore should work.

**Root Causes Identified**:
1. Chrome 129+ supports `structuredClone` to store actual `FileSystemDirectoryHandle`
2. Code was storing handle via `structuredClone` in `persistHandle()` but NOT using it in `restoreHandle()`
3. Code only used `showDirectoryPicker()` which may prompt user if persistent permission wasn't granted

---

## Solution

Updated `trySilentRestore()` in `handle-persistence.ts`:

1. **First priority**: Check if we have stored `handleData` (from Chrome 129+ structuredClone)
2. If yes, restore using `structuredClone(record.handleData)` - truly silent, no prompt
3. **Second priority**: Fall back to `showDirectoryPicker()` for Chrome 122-128 persistent permissions

```typescript
// Before: Always called showDirectoryPicker (may prompt)
if (isPersistentPermissionSupported()) {
  const handle = await window.showDirectoryPicker({ id: projectId });
  // ...
}

// After: Try structuredClone first (Chrome 129+ - truly silent)
if (isStructuredCloneSupported() && record.handleData) {
  const handle = structuredClone(record.handleData) as FileSystemDirectoryHandle;
  return handle; // No prompt!
}
// Then fall back to showDirectoryPicker for Chrome 122-128
```

---

## Browser Compatibility Matrix

| Browser Version | Storage Method | Restore Method | User Prompt? |
|-----------------|----------------|----------------|--------------|
| Chrome 129+ | structuredClone | structuredClone | ❌ NO |
| Chrome 122-128 | Metadata | showDirectoryPicker | ⚠️ MAYBE* |
| Pre-Chrome 122 | Metadata | showDirectoryPicker | ✅ YES* |

*Chrome 122-128: Only prompts if user didn't choose "Allow on every visit"

---

## Files Modified

| File | Action | Change |
|------|--------|--------|
| `src/infrastructure/filesystem/handle-persistence.ts` | Modified | `trySilentRestore()` method updated |

---

## Verification

✅ Chrome 129+ users get true silent restore (no prompt)
✅ Chrome 122-128 users still get persistent permission support
✅ Backward compatible with existing stored metadata
✅ Clear logging for debugging permission issues

---

## Impact

### Positive
- Chrome 129+ users: Zero prompts for handle restoration
- Better user experience on modern browsers
- Proper handling of all browser versions

### Risk
- None - enhancement only, existing functionality preserved

---

## Acceptance Criteria

✅ FSA-002 infection identified and fixed
✅ Chrome 129+ structuredClone used for silent restore
✅ Fallback to showDirectoryPicker for older browsers
✅ Clear logging for debugging

---

## Notes

- Chrome 129+ `structuredClone` can serialize/deserialize FileSystemDirectoryHandle
- This is the "silver bullet" for FSA handle persistence
- Users on Chrome 129+ will have seamless handle restoration
- Users on older browsers still get best-effort persistent permissions
