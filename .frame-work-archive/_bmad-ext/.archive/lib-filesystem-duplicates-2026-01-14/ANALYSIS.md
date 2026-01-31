# ARC-E03: lib/filesystem/ Duplicate Analysis

**Date**: 2026-01-14
**Story**: ARC-E03
**Team**: Team A

## Summary

Analysis of `src/lib/filesystem/` vs `src/infrastructure/filesystem/` to identify duplicates for archival.

## Findings

### Category 1: Identical Duplicates (Archived)

| File | Lines | Action |
|------|-------|--------|
| path-guard.ts | 58 | ARCHIVED - Identical copy, deleted from lib/ |

### Category 2: Different Files (Cannot Archive)

| File | lib/ lines | infra/ lines | Difference |
|------|------------|--------------|------------|
| dir-ops.ts | 185 | 185 | Line endings or minor changes |
| file-ops.ts | 347 | 347 | Line endings or minor changes |
| fs-errors.ts | 82 | 82 | Different content |
| fs-handle-utils.ts | 42 | 42 | Different content |
| fs-types.ts | 87 | 87 | Different content |
| handle-utils.ts | 70 | 70 | Different content |
| local-fs-adapter.ts | 30 | 179 | lib/ is STUB, infra/ is FULL implementation |
| path-utils.ts | 78 | 78 | Different content |

### Category 3: Files Only in lib/filesystem/ (Cannot Archive)

These files have NO equivalent in infrastructure/ and are actively imported:

- constants.ts
- directory-walker.ts (imported by note-folder-bridge.ts)
- exclusion-config.ts
- file-snapshot-store.ts
- file-snapshot-store/ (directory)
- fsa-handle-manager.ts
- hash-utils.ts
- permission-lifecycle.ts (imported by infrastructure/filesystem/index.ts!)
- project-context-provider.ts
- sync-executor.ts
- sync-manager.ts
- sync-manager/ (directory)
- sync-operations.ts
- sync-planner.ts
- sync-transaction/ (directory)
- sync-transaction-log.ts
- sync-utils.ts
- unified-storage-adapter.ts (imported by 4+ infrastructure files!)
- validation.ts

## Critical Dependencies

The following infrastructure files **import from lib/filesystem/**:

1. `infrastructure/filesystem/index.ts` → imports permission-lifecycle
2. `infrastructure/filesystem/StorageAdapterFactory.ts` → imports unified-storage-adapter
3. `infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts` → imports unified-storage-adapter, permission-lifecycle
4. `infrastructure/persistence/stores/workspace/slices/use-file-loader-slice.ts` → imports unified-storage-adapter
5. `infrastructure/persistence/stores/workspace/slices/use-storage-adapter-slice.ts` → imports unified-storage-adapter
6. `infrastructure/sync/bridges/note-folder-bridge.ts` → imports directory-walker

## Recommendation

**DO NOT DELETE lib/filesystem/** - It is still actively used and contains unique implementations.

### Future Work (Deferred to ARC-E04 or future epic):

1. Move `permission-lifecycle.ts` to infrastructure/filesystem/
2. Move `unified-storage-adapter.ts` to infrastructure/filesystem/
3. Move `directory-walker.ts` to infrastructure/filesystem/
4. Update all imports to use infrastructure paths
5. Then archive remaining lib/filesystem/ files

## Acceptance Criteria

- [x] Identical duplicate (path-guard.ts) archived
- [x] Analysis documented
- [x] Dependencies identified
- [x] TypeScript: 0 errors

## Files Archived

- `src/lib/filesystem/path-guard.ts` → `_bmad-ext/.archive/lib-filesystem-duplicates-2026-01-14/`

## Import Fixes

- `src/lib/filesystem/path-utils.ts` - Updated import from `./path-guard` to `@/infrastructure/filesystem/path-guard`
