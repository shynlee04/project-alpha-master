# Iteration 471: IndexedDB Schema Fix (2026-01-02)

**Status**: ✅ COMPLETE
**Errors Fixed**: 46 errors (1,082 → 1,036)
**Progress**: 8.2% total reduction from baseline (1,128 → 1,036)

---

## Executive Summary

Fixed critical IndexedDB schema issues by adding missing `fileSnapshots` and `fileContentCache` table declarations to the ViaGentDatabase class in `src/lib/state/dexie-db-class.ts`.

## Problem Discovery

### Initial Investigation
- **Symptom**: 38 TypeScript errors about missing properties on ViaGentDatabase
- **Top Errors**:
  - `Property 'fileSnapshots' does not exist on type 'ViaGentDatabase'` (24 errors)
  - `Property 'fileContentCache' does not exist on type 'ViaGentDatabase'` (14 errors)

### Root Cause Analysis

#### Discovery: Duplicate Database Files
Found **TWO** ViaGentDatabase class files:
1. `src/lib/state/dexie-db-class.ts` - Used by most code
2. `src/infrastructure/persistence/dexie-db-class.ts` - Infrastructure layer version

#### Critical Finding
- **file-snapshot-store.ts** imports from: `../state/dexie-db`
- Infrastructure version HAD declarations (lines 122-123)
- State version MISSING declarations

This is a classic migration gap - infrastructure refactored, but legacy `lib/state/` file not updated.

## Solution Implemented

### File Modified: `src/lib/state/dexie-db-class.ts`

#### Change 1: Add Type Imports (Lines 17-23)
```typescript
// BEFORE:
import type {
    ProjectsTable,
    IDEStateTable,
    ConversationsTable,
} from './dexie-db-core-types';

// AFTER:
import type {
    ProjectsTable,
    IDEStateTable,
    ConversationsTable,
    FileSnapshotsTable,
    FileContentCacheTable,
} from './dexie-db-core-types';
```

#### Change 2: Add Table Declarations (Lines 79-84)
```typescript
// ========================================================================
// Story WB-2: File Snapshot Store Tables
// ========================================================================

fileSnapshots!: FileSnapshotsTable;
fileContentCache!: FileContentCacheTable;
```

**Placement Strategy**: Added after Core Tables section, before AI Foundation Tables (logical grouping).

## Technical Context

### IndexedDB Schema Architecture
```
ViaGentDatabase (Dexie ORM)
├── Core Tables
│   ├── projects
│   ├── ideState
│   └── conversations
├── File Snapshot Store Tables ← NEW
│   ├── fileSnapshots (metadata)
│   └── fileContentCache (content)
├── AI Foundation Tables
│   ├── taskContexts
│   ├── toolExecutions
│   └── ...
└── ... (20+ more tables)
```

### Table Purpose (Story WB-2)
- **fileSnapshots**: Lightweight metadata (path, hash, size, TTL)
- **fileContentCache**: Lazy-loaded full content (large strings)
- **Use Case**: Avoid re-reading from File System Access API on workspace reload

## Verification

### Error Count Reduction
- **Before**: 1,082 errors
- **After**: 1,036 errors
- **Fixed**: 46 errors (38 schema + 8 bonus fixes)

### Validation Checks
```bash
# Check fileSnapshots errors
pnpm tsc --noEmit 2>&1 | grep fileSnapshots | wc -l
# Result: 1 (unused variable warning, not schema error)

# Check fileContentCache errors
pnpm tsc --noEmit 2>&1 | grep fileContentCache
# Result: 1 unused variable warning in IDELayoutMain.tsx
```

### Remaining Schema Issues
✅ All `fileSnapshots` property errors resolved (24 → 0)
✅ All `fileContentCache` property errors resolved (14 → 0)
⚠️ 1 unused variable warning (unrelated to schema)

## Lessons Learned

### 1. Migration Gaps in Duplicate Files
**Problem**: Infrastructure refactoring created duplicate files with inconsistent schemas.

**Detection Strategy**:
- Search for "Property X does not exist" errors
- Trace import paths in erroring files
- Compare versions of same class in different directories

**Prevention**:
- Use search tools to find all class definitions before refactoring
- Update ALL instances when schema changes
- Consider deprecation periods for legacy files

### 2. Type Import Dependencies
**Problem**: Table types must be imported before declaring properties.

**Pattern**:
```typescript
// 1. Import table types
import type { FileSnapshotsTable } from './dexie-db-core-types';

// 2. Declare table property
fileSnapshots!: FileSnapshotsTable;
```

### 3. Dexie ORM Best Practices
- Use `!` definite assignment assertion (Dexie initializes via decorators)
- Group related tables in commented sections
- Follow Story/Epic naming conventions for sections

## Next Steps

### Immediate (Iteration 472)
- [ ] **TS-001.6.2**: Remove 11 unused `@ts-expect-error` directives
- [ ] **TS-001.6.3**: Fix 11+ implicit any type parameters

### Short-term (Iterations 473-475)
- [ ] Complete TS-001.6 Production Code Errors
- [ ] Target: 1,036 → ~900 errors

### Migration Debt
- [ ] Decide: Keep both `dexie-db-class.ts` files or consolidate?
- [ ] If consolidate: Migrate all imports to `infrastructure/persistence/`
- [ ] If keep both: Add synchronization mechanism for schema changes

## Files Analyzed

### Read Only (Discovery)
- `src/lib/filesystem/file-snapshot-store.ts` (382 lines)
- `src/infrastructure/persistence/dexie-db-class.ts` (157 lines)
- `src/infrastructure/persistence/dexie-db-core-types.ts` (92 lines)
- `src/presentation/components/layout/IDELayoutMain.tsx` (251 lines)
- `src/presentation/components/layout/IDELayout/useIDELayoutFileState.ts` (88 lines)

### Modified (Fix)
- `src/lib/state/dexie-db-class.ts`
  - Added type imports: `FileSnapshotsTable`, `FileContentCacheTable`
  - Added table declarations: `fileSnapshots`, `fileContentCache`

## Performance Impact

- **Build Time**: No change (type-level fix only)
- **Runtime**: No change (declarations, not implementations)
- **Bundle Size**: No change (Dexie metadata only)

## Risk Assessment

- **Breaking Changes**: None (added missing properties)
- **Data Migration**: None (schema already existed in infrastructure version)
- **Backward Compatibility**: Full (no existing code removed)

---

## Appendix: Error Distribution

### Before Fix (1,082 total)
- IndexedDB schema: 38 errors (3.5%)
- Other categories: 1,044 errors (96.5%)

### After Fix (1,036 total)
- IndexedDB schema: 0 errors (0%)
- Other categories: 1,036 errors (100%)

### Bonus Fixes (+8 errors)
- Likely side benefits from type system improvements
- Not explicitly tracked in this iteration

---

**Iteration Time**: ~20 minutes
**MCP Tools Used**: Read (5 files), Edit (2 changes), Bash (verification)
**Documentation Tools**: Write (progress report), TodoWrite (tracking)
