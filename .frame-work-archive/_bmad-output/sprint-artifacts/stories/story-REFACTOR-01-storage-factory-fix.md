---
story_id: REFACTOR-01
title: Fix StorageAdapterFactory import path for IndexedDB adapter
epic: PROGRESSIVE-REFACTORING
priority: P0 (Critical Blocker)
sprint: REFACTOR-SPRINT-01
status: pending
created_at: 2026-01-19
assigned_to: dev-ext
---

## Description

Fix broken import path in StorageAdapterFactory that prevents StorageGateway from loading IndexedDB adapter correctly. Current implementation imports from non-existent or incorrect path, causing `getAdapter is not a function` errors in FileTree.

## Context

- StorageAdapterFactory uses lazy loading via require() for adapters
- FSA adapter imports from './fsa-storage-adapter' (correct)
- IndexedDB adapter imports from '@/lib/filesystem/unified-storage-adapter'
- The UnifiedStorageAdapter depends on @/infrastructure/sync/adapters/adapter-factory
- This creates a circular or broken dependency chain

## Root Cause

StorageAdapterFactory imports IndexedDB adapter from '@/lib/filesystem/unified-storage-adapter' but this file has dependencies that may not be properly resolved. The adapter should be imported directly or from a stable interface location.

## Solution

1. Verify the actual adapter file location and export structure
2. Fix import path in StorageAdapterFactory.ts to point to correct export
3. Ensure no circular dependencies in the import chain

## Investigation Findings

| Item | Value |
|------|-------|
| FSA adapter path | ./fsa-storage-adapter |
| IDB adapter path | @/lib/filesystem/unified-storage-adapter |
| unified-storage-adapter.ts exists | true |
| storage-adapters/ directory exists | false |
| DexieStorageAdapter exists | false |

## Requirements

- StorageAdapterFactory imports IndexedDB adapter from correct path
- UnifiedStorageAdapter exports are correctly imported
- TypeScript compiles without errors
- FileTree loads without getAdapter errors
- Both FSA and IDB adapters can be instantiated

## Acceptance Criteria

- StorageAdapterFactory correctly imports UnifiedStorageAdapter
- pnpm tsc --noEmit passes (0 errors)
- FileTree component loads without errors
- Console shows no getAdapter warnings
- Both 'fsa' and 'indexeddb' storage types work correctly

## Tasks

### T1: Verify current import structure in StorageAdapterFactory.ts
Action: Read StorageAdapterFactory.ts and grep for import pattern
Verification: File contains `require.*unified-storage-adapter`

### T2: Verify UnifiedStorageAdapter export structure
Action: Read unified-storage-adapter.ts
Verification: File contains `export.*class UnifiedStorageAdapter`

### T3: Check adapter-factory dependencies
Action: Read @/infrastructure/sync/adapters/adapter-factory
Verification: createStorageAdapter is exported

### T4: Fix import path if needed in StorageAdapterFactory.ts
Action: Read StorageAdapterFactory.ts and correct import path
Verification: Correct import path for UnifiedStorageAdapter

### T5: Verify TypeScript compilation
Action: Run pnpm tsc --noEmit
Verification: No TypeScript errors

### T6: Test FileTree loads correctly
Action: Open IDE workspace
Verification: No console errors

## Dependencies

None (standalone investigation and fix)

## Risks

| Risk | Likelihood | Impact | Mitigation | Alternatives |
|------|------------|--------|------------|--------------|
| Circular dependency | Medium | High | Verify import chain and restructure | Create separate adapter files in infrastructure/filesystem/storage-adapters/ |

## Timebox

30 minutes maximum

## Validation Steps

1. Run `pnpm tsc --noEmit`
2. Check console output for errors
3. Open browser dev tools
4. Navigate to IDE workspace
5. Check console for getAdapter errors

## Rollback

- Git revert StorageAdapterFactory.ts
- Re-run tsc to verify

---

## Detailed Investigation Notes

### Current StorageAdapterFactory Import Chain

The StorageAdapterFactory uses lazy loading:

```
getUnifiedStorageAdapterClass() {
  if (!UnifiedStorageAdapterClass) {
    try {
      const module = require('@/lib/filesystem/unified-storage-adapter');
      UnifiedStorageAdapterClass = module.UnifiedStorageAdapter;
    } catch {
      throw new Error('UnifiedStorageAdapter not available');
    }
  }
  return UnifiedStorageAdapterClass!;
}
```

### UnifiedStorageAdapter Dependencies

The unified-storage-adapter.ts imports from:
```
import { createStorageAdapter, type StorageType, isStorageTypeSupported } from '@/infrastructure/sync/adapters/adapter-factory';
```

### Potential Issue

The import chain creates a dependency:
1. StorageAdapterFactory -> unified-storage-adapter
2. unified-storage-adapter -> adapter-factory

This may create circular or broken dependencies when the factory is loaded.

### Recommended Fix Options

Option A: Import UnifiedStorageAdapter directly from correct export
Option B: Create separate adapter files in infrastructure/filesystem/storage-adapters/
Option C: Refactor to use interface-based imports instead of class imports

---

## Files Involved

| File | Current State | Action |
|------|---------------|--------|
| src/infrastructure/filesystem/StorageAdapterFactory.ts | Has lazy import | Verify/fix path |
| src/lib/filesystem/unified-storage-adapter.ts | Exists | Check exports |
| src/infrastructure/sync/adapters/adapter-factory.ts | Dependency | Verify export |

## Success Metrics

- TypeScript compilation: 0 errors
- Runtime: No console warnings about adapter loading
- FileTree: Loads without errors
- Storage types: Both 'fsa' and 'indexeddb' functional
