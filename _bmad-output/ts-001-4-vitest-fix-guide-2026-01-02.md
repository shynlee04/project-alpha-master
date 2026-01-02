# TS-001.4: Vitest Infrastructure Fix Guide
**Iteration 469** | Priority: CRITICAL | Generated: 2026-01-02

## Executive Summary

**Problem**: 71 TypeScript errors caused by vitest import conflicts with `globals: true` configuration.

**Solution**: Remove direct vitest imports from test files and use global functions.

**Impact**: 71 errors resolved (6.3% reduction), 15-30 minutes effort, LOW risk.

---

## Root Cause Analysis

### Configuration Mismatch

**vitest.config.ts** (Line 22):
```typescript
export default defineConfig({
  test: {
    globals: true,  // ← Global test functions enabled
    // ...
  },
})
```

**tsconfig.json** (Line 8):
```json
{
  "types": ["vite/client", "vitest/globals", "vitest"],
  // ...
}
```

**Test Files** (INCORRECT pattern):
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
// ↑ These imports are NOT needed when globals: true
// ↑ TypeScript errors: TS2305 - Module '"vitest"' has no exported member 'describe'
```

**Why This Fails**:
1. Vitest provides globals at runtime (describe, it, expect, etc.)
2. TypeScript doesn't know about these globals without `vitest/globals` in types
3. Even with types, importing from vitest causes conflicts because the module doesn't export these when globals are enabled

---

## Fix Strategy

### Step 1: Verify Configuration (5 min)

**Check vitest.config.ts**:
```typescript
// File: vitest.config.ts
export default defineConfig({
  plugins: [viteTsConfigPaths({ projects: ['./tsconfig.json'] })],
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['**/*.test.tsx', 'jsdom'],
      ['src/lib/state/**/*.test.ts', 'jsdom'],
      // ... other patterns
    ],
    globals: true,  // ✅ Verify this is set
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

**Check tsconfig.json**:
```json
{
  "compilerOptions": {
    "types": ["vite/client", "vitest/globals", "vitest"],
    // ↑ vitest/globals is REQUIRED for TypeScript to recognize globals
  }
}
```

**Check package.json**:
```json
{
  "devDependencies": {
    "vitest": "^4.0.16",
    "@types/vitest": "latest",  // ← ADD THIS if missing
    // ...
  }
}
```

---

### Step 2: Add @types/vitest (5 min)

**Command**:
```bash
pnpm add -D @types/vitest
```

**Verify Installation**:
```bash
pnpm list @types/vitest
# Expected: @types/vitest x.x.x
```

---

### Step 3: Remove Vitest Imports (20 min)

#### File List (12 files, 71 errors)

**Store Tests** (6 files, 50 errors):
1. `src/infrastructure/persistence/stores/__tests__/schema-migrations.test.ts` (4 errors)
2. `src/infrastructure/persistence/stores/conversation/__tests__/conversation-migration.test.ts` (6 errors)
3. `src/infrastructure/persistence/stores/conversation/__tests__/useConversationStore.test.ts` (6 errors)
4. `src/infrastructure/persistence/stores/conversation/__tests__/conversation-events-slice.test.ts` (6 errors)
5. `src/infrastructure/persistence/stores/providers/__tests__/migrate-api-keys-to-vault.test.ts` (6 errors)
6. `src/infrastructure/persistence/stores/providers/__tests__/migration-backup.test.ts` (6 errors)

**Other Tests** (6 files, 21 errors):
7. `src/lib/agent/providers/__tests__/provider-adapter-extension.test.ts` (5 errors)
8. `src/lib/filesync/__tests__/cross-workspace-file-references.test.ts` (5 errors)
9. `src/lib/filesync/__tests__/cross-workspace-file-operations.integration.test.ts` (5 errors)
10. `src/lib/filesync/__tests__/study-file-sync-service.test.ts` (5 errors)
11. `src/presentation/components/knowledge/__tests__/CollectionSelector.test.tsx` (1 error)

---

### Step 4: Apply Fixes to Each File

#### Example Fix 1: schema-migrations.test.ts

**Before** (4 errors):
```typescript
import { describe, it, expect, beforeEach } from 'vitest';  // ❌ Line 10
import { runMigrations } from '../schema-migrations';
```

**After** (0 errors):
```typescript
// No import needed - globals are enabled
import { runMigrations } from '../schema-migrations';

describe('Schema Migrations', () => {  // ✅ Global function
  beforeEach(() => {  // ✅ Global function
    // Setup code
  });

  it('should run migrations', () => {  // ✅ Global function
    expect(true).toBe(true);  // ✅ Global function
  });
});
```

**Edit Command**:
```bash
# Line 10: Remove entire import line
sed -i '' "10d" src/infrastructure/persistence/stores/__tests__/schema-migrations.test.ts
```

---

#### Example Fix 2: conversation-migration.test.ts

**Before** (6 errors):
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';  // ❌ Line 9
import { runConversationMigration } from './conversation-migration';
import type { LegacyConversationState } from './types';
```

**After** (0 errors):
```typescript
// No import needed - globals are enabled
import { runConversationMigration } from './conversation-migration';
import type { LegacyConversationState } from './types';

describe('Conversation Migration', () => {  // ✅ Global function
  beforeEach(() => {  // ✅ Global function
    vi.clearAllMocks();  // ✅ Global function
  });

  it('should migrate conversations', () => {  // ✅ Global function
    expect(result).toEqual(expected);  // ✅ Global function
  });
});
```

**Edit Command**:
```bash
# Line 9: Remove entire import line
sed -i '' "9d" src/infrastructure/persistence/stores/conversation/__tests__/conversation-migration.test.ts
```

---

#### Example Fix 3: migrate-api-keys-to-vault.test.ts

**Before** (6 errors):
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';  // ❌ Line 11
import { migrateApiKeysToVault } from './migrate-api-keys-to-vault';
```

**After** (0 errors):
```typescript
// No import needed - globals are enabled
import { migrateApiKeysToVault } from './migrate-api-keys-to-vault';

describe('Migrate API Keys to Vault', () => {  // ✅ Global function
  beforeEach(() => {  // ✅ Global function
    // Setup code
  });

  afterEach(() => {  // ✅ Global function
    vi.clearAllMocks();  // ✅ Global function
  });

  it('should migrate keys', () => {  // ✅ Global function
    expect(result).toBeDefined();  // ✅ Global function
  });
});
```

**Edit Command**:
```bash
# Line 11: Remove entire import line
sed -i '' "11d" src/infrastructure/persistence/stores/providers/__tests__/migrate-api-keys-to-vault.test.ts
```

---

#### Example Fix 4: CollectionSelector.test.tsx

**Before** (1 error):
```typescript
import type { Mock } from 'vitest';  // ❌ Line with error (but Mock type is needed!)
```

**After** (0 errors):
```typescript
// Keep type import (not a function import)
import type { Mock } from 'vitest';  // ✅ Type imports are OK

describe('CollectionSelector', () => {
  it('should render', () => {
    const mockFn = vi.fn();  // ✅ Global function
    expect(mockFn).toBeInstanceOf(Function);  // ✅ Global function
  });
});
```

**Note**: Type imports (`import type`) from vitest are still OK because they're not runtime imports.

---

### Step 5: Verify Fix (5 min)

**Check for Remaining Vitest Import Errors**:
```bash
pnpm tsc --noEmit 2>&1 | grep "error TS2305.*vitest" | wc -l
# Expected: 0
```

**Check Total Error Count**:
```bash
pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l
# Expected: 1057 (1128 - 71 = 1057)
```

**Run Tests**:
```bash
pnpm test
# Expected: All tests pass (no runtime errors)
```

---

## Bulk Fix Script

**Automated Fix** (use with caution):
```bash
#!/bin/bash
# Fix vitest imports in all test files

# Find all test files with vitest imports
TEST_FILES=$(grep -r "import.*from 'vitest'" src --include="*.test.ts" --include="*.test.tsx" -l)

for file in $TEST_FILES; do
  echo "Fixing $file..."

  # Remove import lines (but keep type imports)
  sed -i '' "/^import {.*} from 'vitest';$/d" "$file"

  # Keep type imports (import type)
  # This regex preserves: import type { Mock } from 'vitest';
done

echo "Done! Run: pnpm tsc --noEmit to verify"
```

**Manual Review Required**:
- Some files may have multi-line imports
- Some files may have type imports that should be preserved
- Always review changes with `git diff` before committing

---

## Verification Checklist

- [ ] vitest.config.ts has `globals: true` (Line 22)
- [ ] tsconfig.json has `"vitest/globals"` in types (Line 8)
- [ ] @types/vitest installed in package.json
- [ ] All 12 test files edited to remove vitest imports
- [ ] No `import { describe, it, expect, vi } from 'vitest'` patterns remain
- [ ] Type imports preserved (`import type { Mock } from 'vitest'`)
- [ ] TypeScript check passes: `pnpm tsc --noEmit` (0 vitest errors)
- [ ] All tests pass: `pnpm test` (0 runtime errors)
- [ ] Total error count reduced from 1,128 to 1,057

---

## Common Pitfalls

### Pitfall 1: Removing Type Imports

❌ **WRONG**:
```typescript
// Removes type import needed for test types
import type { Mock } from 'vitest';  // ❌ Deleted
```

✅ **CORRECT**:
```typescript
// Keep type imports
import type { Mock } from 'vitest';  // ✅ Preserved
```

**Fix**: Use sed pattern that only removes runtime imports, not type imports.

---

### Pitfall 2: Multi-line Imports

❌ **WRONG**:
```typescript
// Removes only first line, breaks syntax
import {
  describe,
  it,
  expect
} from 'vitest';
```

✅ **CORRECT**:
```typescript
// Remove entire multi-line import block
// Or replace with single-line removal script
```

**Fix**: Use multi-line sed pattern or manual review.

---

### Pitfall 3: Mixed Imports

❌ **WRONG**:
```typescript
// Removes entire line, breaks other imports
import { describe } from 'vitest';
import { render } from '@testing-library/react';
```

✅ **CORRECT**:
```typescript
// Remove only vitest import line, keep other imports
import { render } from '@testing-library/react';  // ✅ Preserved
```

**Fix**: Line-by-line review with git diff.

---

## Next Steps

After completing TS-001.4:

1. **TS-001.5**: Fix store slicing type errors (162 errors)
2. **TS-001.6**: Fix implicit any errors (443 errors)
3. **TS-001.7**: Fix component prop type errors (288 errors)
4. **TS-001.8**: Final verification (target: <100 errors)

**Estimated Timeline**: 6-8 iterations (2 weeks)

---

## Appendix: File-by-File Fix Commands

### Store Tests

```bash
# File 1: schema-migrations.test.ts (Line 10)
sed -i '' "10d" src/infrastructure/persistence/stores/__tests__/schema-migrations.test.ts

# File 2: conversation-migration.test.ts (Line 9)
sed -i '' "9d" src/infrastructure/persistence/stores/conversation/__tests__/conversation-migration.test.ts

# File 3: useConversationStore.test.ts (Line 15)
sed -i '' "15d" src/infrastructure/persistence/stores/conversation/__tests__/useConversationStore.test.ts

# File 4: conversation-events-slice.test.ts (Line 16)
sed -i '' "16d" src/infrastructure/persistence/stores/conversation/__tests__/conversation-events-slice.test.ts

# File 5: migrate-api-keys-to-vault.test.ts (Line 11)
sed -i '' "11d" src/infrastructure/persistence/stores/providers/__tests__/migrate-api-keys-to-vault.test.ts

# File 6: migration-backup.test.ts (Line 60)
sed -i '' "60d" src/infrastructure/persistence/stores/providers/__tests__/migration-backup.test.ts
```

### Other Tests

```bash
# File 7: provider-adapter-extension.test.ts (Line 1)
sed -i '' "1d" src/lib/agent/providers/__tests__/provider-adapter-extension.test.ts

# File 8: cross-workspace-file-references.test.ts (Line 1)
sed -i '' "1d" src/lib/filesync/__tests__/cross-workspace-file-references.test.ts

# File 9: cross-workspace-file-operations.integration.test.ts (Line 1)
sed -i '' "1d" src/lib/filesync/__tests__/cross-workspace-file-operations.integration.test.ts

# File 10: study-file-sync-service.test.ts (Line 1)
sed -i '' "1d" src/lib/filesync/__tests__/study-file-sync-service.test.ts

# File 11: CollectionSelector.test.tsx (Check if type import)
# MANUAL REVIEW REQUIRED - Keep if: import type { Mock } from 'vitest';
```

---

## Document Metadata

**Generated**: 2026-01-02
**Iteration**: 469
**Task**: TS-001.4 Fix Vitest Infrastructure
**Priority**: CRITICAL
**Time Estimate**: 15-30 minutes
**Risk Level**: LOW
**Errors Resolved**: 71 (6.3% reduction)

**Related Artifacts**:
- `project-context-iteration-469-2026-01-02.md` - Overall project context
- `_bmad-output/ralph-loop-cycle-18-correct-course-workflow-2026-01-01.md` - Stabilization plan

**Next Review**: Post-fix verification (Iteration 469, same day)
