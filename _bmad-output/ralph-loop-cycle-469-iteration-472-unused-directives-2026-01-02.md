# Iteration 472: Remove Unused @ts-expect-error Directives (2026-01-02)

**Status**: ✅ COMPLETE
**Errors Fixed**: 11 errors (1,036 → 1,025)
**Progress**: 9.1% total reduction from baseline (1,128 → 1,025)

---

## Executive Summary

Removed 11 unused `@ts-expect-error` directives from 3 test files. These directives were suppressing TypeScript errors that no longer exist due to type system evolution.

## Problem Analysis

### What is `@ts-expect-error`?

TypeScript directive that tells the compiler to expect an error on the next line:
```typescript
// @ts-expect-error - Reason for expected error
someCodeThatWouldError();
```

### When Unused?

If the error no longer occurs (type system evolved), TypeScript reports:
```
error TS2578: Unused '@ts-expect-error' directive.
```

This indicates the directive can be safely removed.

## Discovery Process

```bash
# Find all unused directives
pnpm tsc --noEmit 2>&1 | grep "Unused '@ts-expect-error'"
```

**Results**: 11 instances across 3 files

## Files Modified

### 1. migrate-api-keys-to-vault.test.ts (3 directives removed)

**Location**: `src/infrastructure/persistence/stores/providers/__tests__/`

**Reason**: "Old field structure" - `apiKey` field is now valid in type definitions

**Changes**:
- Line 124: OpenRouter provider apiKey
- Line 139: Anthropic provider apiKey
- Line 165: Google provider apiKey (empty string)

**Before**:
```typescript
{
  id: 'openrouter',
  // @ts-expect-error - Old field structure
  apiKey: 'sk-test-openrouter-123',
  // ...
}
```

**After**:
```typescript
{
  id: 'openrouter',
  apiKey: 'sk-test-openrouter-123',
  // ...
}
```

### 2. migration-backup.test.ts (1 directive removed)

**Location**: `src/infrastructure/persistence/stores/providers/__tests__/`

**Reason**: Comment indicated "Old field structure" but no field was being marked

**Changes**:
- Line 98: hasApiKey property (directive was on wrong line)

**Before**:
```typescript
{
  // ...
  lastModelFetchAt: undefined,
  // @ts-expect-error - Old field structure
  hasApiKey: false,
}
```

**After**:
```typescript
{
  // ...
  lastModelFetchAt: undefined,
  hasApiKey: false,
}
```

### 3. project-metadata.test.ts (7 directives removed)

**Location**: `src/lib/workspace/__tests__/`

**Reason**: Two fields (`workspaceBindings`, `fileSnapshotEnabled`) added to ProjectMetadata type

**Changes**:
1. **Line 132**: workspaceBindings assignment (now valid)
2. **Line 212**: fileSnapshotEnabled assignment (now valid)
3. **Line 249**: dbInstance.verno access (now valid)
4. **Line 283**: workspaceBindings in migrated records (now valid)
5. **Line 285**: fileSnapshotEnabled in migrated records (now valid)
6. **Line 403**: workspaceBindings access (now valid)
7. **Line 443**: workspaceBindings optional check (now valid)

**Pattern Example**:

**Before**:
```typescript
// @ts-expect-error - workspaceBindings doesn't exist yet
updatedProject.workspaceBindings = {
  ide: false,
  notes: true,
};
```

**After**:
```typescript
updatedProject.workspaceBindings = {
  ide: false,
  notes: true,
};
```

## Technical Context

### Type Evolution

These test files were written when `ProjectMetadata` interface was missing:
- `workspaceBindings: WorkspaceBindings`
- `fileSnapshotEnabled: boolean`

After Epic WB-1 (Workspace Binding) implementation, these fields were added to the type, making the `@ts-expect-error` directives unnecessary.

### Migration Testing

The test files are testing **migration from old schema to new schema**:
- **Old Schema**: Projects without workspace bindings or file snapshot settings
- **New Schema**: Projects with default values for these fields
- **Migration Logic**: Dexie database upgrades populate missing fields

The tests verify:
1. Migration triggers correctly
2. Default values applied
3. Existing projects preserved
4. Type safety maintained

## Verification

### Error Count Reduction
- **Before**: 1,036 errors
- **After**: 1,025 errors
- **Fixed**: 11 errors (exactly as expected)

### Validation Checks
```bash
# Count remaining unused directives
pnpm tsc --noEmit 2>&1 | grep "Unused '@ts-expect-error" | wc -l
# Result: 0 (all removed)

# Verify total errors
pnpm tsc --noEmit 2>&1 | grep -c "error TS"
# Result: 1,025 (down from 1,036)
```

### Remaining Active Directives
22 other `@ts-expect-error` directives remain active (still suppressing errors as intended)

## Best Practices

### When to Use `@ts-expect-error`

**✅ Good Use Cases**:
1. Testing invalid type assignments
2. Intentional rule violations for test coverage
3. Documenting known type system limitations
4. Testing error handling paths

**❌ Bad Use Cases**:
1. Suppressing real errors that should be fixed
2. Hiding type mismatches from refactoring
3. Temporary workarounds that become permanent

### Maintenance

**Review Periodically**: As types evolve, directives may become unused

**Detection**:
```bash
# TypeScript reports unused automatically
pnpm tsc --noEmit 2>&1 | grep "Unused '@ts-expect-error"
```

**Cleanup**: Remove when no longer needed

## Lessons Learned

### 1. Type Evolution Creates Debt
**Problem**: Tests with `@ts-expect-error` directives become stale as types evolve

**Solution**: Periodic cleanup as part of error reduction cycle

**Prevention**: Add comments explaining WHY error is expected

### 2. Migration Testing Strategy
**Pattern**: These tests use "old field structure" pattern to verify migration

**Benefits**:
- Catches breaking changes in migration logic
- Documents evolution from old to new schema
- Ensures backward compatibility

**Maintenance**: Update when schema stabilizes

### 3. Selective Removal
**Critical**: Only remove UNUSED directives (where error no longer occurs)

**Verification**: Run TypeScript check after each batch

**Risk**: Removing active directive → new TypeScript errors

## Next Steps

### Immediate (Iteration 473)
- [ ] **TS-001.6.3**: Fix 11+ implicit any type parameters
- [ ] Expected: 1,025 → ~1,014 errors

### Short-term (Iterations 473-475)
- [ ] Complete TS-001.6 Production Code Errors
- [ ] Target: 1,025 → ~900 errors

### Medium-term
- [ ] TS-001 Overall: Target <100 errors (91% reduction needed)
- [ ] DB-001: Safe IndexedDB operations (P0 data loss risk)
- [ ] UI-001: Extract AgentConfigDialog hooks (P1 maintainability)

---

## Files Modified (3 total)

1. `src/infrastructure/persistence/stores/providers/__tests__/migrate-api-keys-to-vault.test.ts`
   - Removed 3 unused directives
   - Migration testing for API key vault

2. `src/infrastructure/persistence/stores/providers/__tests__/migration-backup.test.ts`
   - Removed 1 unused directive
   - Backup system testing

3. `src/lib/workspace/__tests__/project-metadata.test.ts`
   - Removed 7 unused directives
   - Workspace binding migration testing

## Performance Impact

- **Build Time**: No change (removed comments only)
- **Runtime**: No change (test behavior identical)
- **Type Safety**: Improved (code now type-checks without directives)

## Risk Assessment

- **Breaking Changes**: None (removed suppression, errors don't exist)
- **Test Behavior**: Unchanged (assertions identical)
- **Type Safety**: Improved (code passes type system without help)

---

**Iteration Time**: ~25 minutes
**MCP Tools Used**: Read (7 sections), Edit (11 changes), Bash (verification)
**Documentation Tools**: Write (progress report), TodoWrite (tracking)
