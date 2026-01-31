# Revert Plan: CC-FSA/CC-IDE Changes

**Created**: 2026-01-19
**Status**: Ready for Execution
**Goal**: Revert to working `LocalFSAdapter` state (commit `ddf01d28`)

---

## Executive Summary

The CC-FSA/CC-IDE stories introduced a `StorageGateway` abstraction layer that migrated FileTree components from `LocalFSAdapter` to `StorageGateway`. However, the migration is incomplete/broken:

1. **Hooks migrated to use `getGateway()`** but the `createIdeFileGateway()` factory has issues
2. **IDE components expect `getAdapter()`** but hooks now return `getGateway()`
3. **Type mismatches** between old and new patterns

**Solution**: Revert FileTree hooks to use `getAdapter()` + `LocalFSAdapter` pattern, keeping the `StorageGateway` infrastructure for future proper integration.

---

## Working Baseline

| Property | Value |
|----------|-------|
| **Working Commit** | `ddf01d28` (before StorageGateway) |
| **Working Date** | ~2026-01-14 09:16 |
| **Pattern** | `LocalFSAdapter` with `getAdapter()` |

### What Worked Before

```typescript
// Before: Working pattern
import { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';

const adapterRef = useRef<LocalFSAdapter | null>(null);
const getAdapter = useCallback(() => {
    if (!adapterRef.current) {
        adapterRef.current = new LocalFSAdapter();
    }
    if (directoryHandle) {
        adapterRef.current.setDirectoryHandle(directoryHandle);
    }
    return adapterRef.current;
}, [directoryHandle]);
```

---

## Problematic Commits

### Commit 1: `404dab82` - StorageGateway Introduction

| Property | Value |
|----------|-------|
| **Date** | 2026-01-14 08:16 |
| **Author** | shynlee04 |
| **Files Changed** | 43 files |

**Key Changes**:
- Created `StorageGateway` interface
- Created `FSAGateway` (FSA adapter)
- Created `IDBGateway` (IndexedDB adapter)
- Created `StorageGatewayFactory` for adapter selection
- Created `createIdeFileGateway()` helper

### Commit 2: `8aa38d0f` - FSA Support Integration

| Property | Value |
|----------|-------|
| **Date** | 2026-01-19 00:13 |
| **Author** | shynlee04 |
| **Files Changed** | 76 files |

**Key Changes**:
- Extended `StorageGateway` with `rename()` and `createDirectory()` methods
- Migrated `useFileTreeState` from `getAdapter()` to `getGateway()`
- Migrated `useFileTreeActions` from `getAdapter()` to `getGateway()`
- Migrated `useContextMenuActions` from `getAdapter()` to `getGateway()`
- Added `useIdeFileGateway` hook for MonacoEditor
- Added E2E tests for IDE FSA

---

## Files to Revert

### Category 1: useFileTreeState Migration

| File | Status | Change Needed |
|------|--------|---------------|
| `src/presentation/components/ide/FileTree/hooks/useFileTreeState.ts` | **MUST REVERT** | `getGateway` → `getAdapter`, `StorageGateway` → `LocalFSAdapter` |
| `src/presentation/components/ide/FileTree/hooks/useFileTreeState.ts.bak` | Created by CC-IDE | Delete or restore from `ddf01d28` |

### Category 2: useFileTreeActions Migration

| File | Status | Change Needed |
|------|--------|---------------|
| `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts` | **MUST REVERT** | `getGateway` → `getAdapter`, `StorageGateway` → `LocalFSAdapter` |

### Category 3: useContextMenuActions Migration

| File | Status | Change Needed |
|------|--------|---------------|
| `src/presentation/components/ide/FileTree/hooks/useContextMenuActions.ts` | **MUST REVERT** | `getGateway` → `getAdapter`, `StorageGateway` → `LocalFSAdapter` |

### Category 4: FileTree Component

| File | Status | Change Needed |
|------|--------|---------------|
| `src/presentation/components/ide/FileTree/FileTree.tsx` | **MUST REVERT** | Pass `getAdapter` instead of `getGateway` to hooks |

### Category 5: MonacoEditor Integration (CC-IDE-05b)

| File | Status | Change Needed |
|------|--------|---------------|
| `src/presentation/components/ide/MonacoEditor/hooks/useMonacoEditorEventSubscriptions.ts` | **MUST REVERT** | Remove `fsaAdapterRef` parameter and HMR effects |
| `src/presentation/components/ide/MonacoEditor/hooks/useIdeFileGateway.ts` | **DELETE** | Created by CC-IDE-05b, unused |
| `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` | Check | May need to remove `fsaAdapterRef` prop |

### Category 6: Test Files

| File | Status | Change Needed |
|------|--------|---------------|
| `src/presentation/components/ide/FileTree/__tests__/FileTree-fsa-integration.test.ts` | **DELETE or ARCHIVE** | Tests StorageGateway, not needed for revert |

### Category 7: Layout Integration

| File | Status | Change Needed |
|------|--------|---------------|
| `src/presentation/components/layout/IDELayoutMain.tsx` | Check | May use new FSA integration code |

### Category 8: Storage Infrastructure (KEEP - for future)

| File | Status | Change Needed |
|------|--------|---------------|
| `src/domain/interfaces/storage-gateway.interface.ts` | **KEEP** | Infrastructure for future, not breaking |
| `src/infrastructure/filesystem/fsa-gateway.ts` | **KEEP** | Infrastructure for future, not breaking |
| `src/infrastructure/filesystem/idb-gateway.ts` | **KEEP** | Infrastructure for future, not breaking |
| `src/infrastructure/filesystem/storage-gateway-factory.ts` | **KEEP** | Infrastructure for future, not breaking |
| `src/infrastructure/filesystem/ide-file-gateway.ts` | **KEEP** | Infrastructure for future, not breaking |
| `src/infrastructure/filesystem/index.ts` | **KEEP** | Infrastructure for future, not breaking |

---

## Revert Commands

### Step 1: Reset FileTree Hooks

```bash
# Reset useFileTreeState.ts
git checkout ddf01d28 -- src/presentation/components/ide/FileTree/hooks/useFileTreeState.ts

# Reset useFileTreeActions.ts
git checkout ddf01d28 -- src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts

# Reset useContextMenuActions.ts
git checkout ddf01d28 -- src/presentation/components/ide/FileTree/hooks/useContextMenuActions.ts
```

### Step 2: Reset FileTree.tsx

```bash
# Reset FileTree.tsx to remove getGateway usage
git checkout ddf01d28 -- src/presentation/components/ide/FileTree/FileTree.tsx
```

### Step 3: Reset MonacoEditor Integration

```bash
# Reset Monaco event subscriptions
git checkout ddf01d28 -- src/presentation/components/ide/MonacoEditor/hooks/useMonacoEditorEventSubscriptions.ts

# Delete the CC-IDE-05b hook (was created new)
rm -f src/presentation/components/ide/MonacoEditor/hooks/useIdeFileGateway.ts
```

### Step 4: Handle Tests

```bash
# Option A: Delete the integration test
rm -f src/presentation/components/ide/FileTree/__tests__/FileTree-fsa-integration.test.ts

# Option B: Keep but comment out
# mv src/presentation/components/ide/FileTree/__tests__/FileTree-fsa-integration.test.ts \
#    _bmad-ext/.archive/fsa-integration-test-2026-01-19.ts
```

### Step 5: Handle IDELayoutMain.tsx

```bash
# Check if changes exist
git diff ddf01d28..HEAD -- src/presentation/components/layout/IDELayoutMain.tsx

# Reset if needed
git checkout ddf01d28 -- src/presentation/components/layout/IDELayoutMain.tsx
```

---

## What Gets Restored

### Working State After Revert

1. **FileTree Uses LocalFSAdapter**
   - `getAdapter()` returns `LocalFSAdapter`
   - All file operations work: `readFile`, `writeFile`, `listDirectory`
   - PC users store files in local file system via FSA

2. **MonacoEditor Works Without FSA Integration**
   - No HMR events from FSA adapter
   - Standard file reading/writing via `LocalFSAdapter`

3. **No Type Mismatches**
   - All hooks expect `LocalFSAdapter`
   - FileTree passes `getAdapter()`
   - Consistent interface throughout

---

## What to Fix AFTER Revert

### Issue 1: Remove browserDB for PC users

**Current Problem**: Both FSA and IndexedDB options available for PC users

**Fix**: Detect device type and only allow FSA on desktop

### Issue 2: Project switching persistence

**Current Problem**: When switching projects, state may be lost

**Fix**: Ensure project ID is passed correctly to store hooks

### Issue 3: State errors with browserDB fallback

**Current Problem**: Errors when IndexedDB fallback is used

**Fix**: Remove browserDB fallback for PC users (see Issue 1)

---

## Rollback Plan (If Revert Fails)

If the revert causes issues:

```bash
# Restore current state
git checkout 8aa38d0f -- .

# Or reset to a specific file
git checkout 8aa38d0f -- src/presentation/components/ide/FileTree/hooks/useFileTreeState.ts
```

---

## Verification Steps

After revert, verify:

```bash
# 1. Check TypeScript compiles
pnpm tsc --noEmit

# 2. Run tests
pnpm vitest run

# 3. Check IDE loads
# - Navigate to /ide/$projectId
# - Verify FileTree displays files
# - Verify file operations work
# - Verify MonacoEditor loads files
```

---

## Files to Check After Revert

| File | What to Verify |
|------|----------------|
| `src/presentation/components/ide/FileTree/hooks/useFileTreeState.ts` | Uses `getAdapter()` and `LocalFSAdapter` |
| `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts` | Uses `getAdapter()` |
| `src/presentation/components/ide/FileTree/hooks/useContextMenuActions.ts` | Uses `getAdapter()` |
| `src/presentation/components/ide/FileTree/FileTree.tsx` | Passes `getAdapter` to hooks |
| `src/presentation/components/ide/MonacoEditor/hooks/useMonacoEditorEventSubscriptions.ts` | No `fsaAdapterRef` parameter |

---

## Archive Plan

After successful revert, archive the CC-IDE files:

```bash
# Create archive directory
mkdir -p _bmad-ext/.archive/cc-ide-revert-2026-01-19

# Archive CC-IDE test
mv src/presentation/components/ide/FileTree/__tests__/FileTree-fsa-integration.test.ts \
   _bmad-ext/.archive/cc-ide-revert-2026-01-19/

# Archive CC-IDE-05b hook
mv src/presentation/components/ide/MonacoEditor/hooks/useIdeFileGateway.ts \
   _bmad-ext/.archive/cc-ide-revert-2026-01-19/
```

---

## Success Criteria

✅ All FileTree hooks use `getAdapter()` pattern
✅ TypeScript compiles with 0 errors
✅ IDE loads and displays files
✅ File operations work (create, read, write, delete)
✅ MonacoEditor loads files correctly
✅ No browserDB fallback errors on PC

---

## Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 1: Revert | 15 min | Reset files to `ddf01d28` |
| Phase 2: Verify | 10 min | Run TypeScript, tests |
| Phase 3: Test | 15 min | Manual IDE testing |
| Phase 4: Archive | 5 min | Move old files to archive |

**Total Estimated Time**: ~45 minutes

---

## References

- **Working Commit**: `ddf01d284bd4ffee15e043c1e3b6c7fc1687734f`
- **StorageGateway Commit**: `404dab82b29d251381b902bbe4166ca10186f14b`
- **FSA Integration Commit**: `8aa38d0fc5d94d6b753f5f04a55bc7bb1f80a12f`
- **ADR-033**: `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md`

---

**Next Action**: Execute revert commands in sequence, verify TypeScript, then test IDE functionality.
