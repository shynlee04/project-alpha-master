# Ralph Loop Cycle 469: Phase 1 Execution Plan
**Generated**: 2026-01-02
**Phase**: Infrastructure Fixes (Priority 1)
**Estimated Time**: 2 hours
**Target**: Eliminate 40+ vitest import errors

---

## Overview

This plan details the systematic fixes for Vitest configuration and global import issues affecting 40+ test files across the codebase.

---

## Part 1: Vitest Configuration Update (1 hour)

### Current Configuration Issues

**File**: `vitest.config.ts`

```typescript
// CURRENT (PROBLEMATIC)
export default defineConfig({
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  environmentMatchGlobs: ['**/*.test.tsx'], // Only .tsx files
})
```

**Problems**:
1. Only `.test.tsx` files get `jsdom` environment
2. `.test.ts` files default to `node` environment (incorrect for React hooks)
3. No clear separation between unit and integration tests
4. Inconsistent with `globals: true` setting (test files still import vitest)

### Updated Configuration

```typescript
// UPDATED (FIXED)
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // Default to jsdom for React project
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{js,ts,tsx}', '**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],

    // Environment-specific configuration
    environmentMatchGlobs: [
      // Integration tests (Node environment)
      ['**/*.integration.test.ts', 'node'],
      ['**/lib/filesystem/**/*.test.ts', 'node'],
      ['**/lib/agent/routes/**/*.test.ts', 'node'],
      ['**/lib/rag/**/__tests__/**/*.test.ts', 'node'],

      // Component tests (jsdom environment)
      ['**/*.test.tsx', 'jsdom'],
      ['**/hooks/**/*.test.ts', 'jsdom'], // React hooks need jsdom
      ['**/components/**/*.test.ts', 'jsdom'],
      ['**/presentation/**/*.test.{ts,tsx}', 'jsdom'],
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types/**',
        '**/vitest.config.ts',
      ],
    },

    // Type checking
    typecheck: {
      tsconfig: './tsconfig.json',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Changes Explanation

1. **Default Environment**: Changed to `jsdom` (React project)
2. **Environment Matching**: Clear separation between Node and jsdom tests
3. **Test Discovery**: Explicit include/exclude patterns
4. **Coverage Config**: Proper exclusions for accurate metrics
5. **Type Checking**: Added TypeScript integration

### Test File Naming Conventions

```
// Unit Tests (jsdom environment)
ComponentName.test.tsx
useHookName.test.ts
utils.test.ts

// Integration Tests (node environment)
feature.integration.test.ts
api.test.ts

// E2E Tests (jsdom environment)
user-workflow.e2e.test.tsx
```

---

## Part 2: Remove Explicit Vitest Imports (30 minutes)

### Problem

40+ test files explicitly import from `vitest` despite `globals: true` configuration:

```typescript
// WRONG (unnecessary import)
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Test Suite', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
```

### Fix Strategy

#### Automated Removal Script

Create `scripts/fix-vitest-imports.ts`:

```typescript
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const TEST_DIRS = [
  'src/lib/agent/__tests__',
  'src/lib/agent/facades/__tests__',
  'src/lib/agent/tools/__tests__',
  'src/lib/agent/hooks/__tests__',
  'src/lib/filesystem/__tests__',
  'src/hooks/__tests__',
  'src/components/__tests__',
  'src/infrastructure/persistence/stores/__tests__',
];

function fixVitestImports(filePath: string) {
  const content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Remove vitest imports (but keep other imports)
  const fixed = content.replace(
    /import\s*{\s*([^}]+)}\s*from\s*['"]vitest['"];?\s*\n?/g,
    (match, imports) => {
      const imported = imports.split(',').map(s => s.trim());
      const vitestGlobals = [
        'describe', 'describe', 'it', 'it', 'test', 'expect',
        'beforeAll', 'afterAll', 'beforeEach', 'afterEach',
        'vi', 'vi'
      ];

      // Check if all imports are vitest globals
      const allGlobals = imported.every(imp =>
        vitestGlobals.some(glob => imp === glob || imp.startsWith(`${glob} as`))
      );

      if (allGlobals) {
        modified = true;
        return ''; // Remove the import entirely
      }

      return match; // Keep imports that aren't all globals
    }
  );

  if (modified) {
    writeFileSync(filePath, fixed, 'utf-8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }

  return false;
}

function main() {
  let fixedCount = 0;

  for (const dir of TEST_DIRS) {
    const files = readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      if (file.isFile() && (file.name.endsWith('.test.ts') || file.name.endsWith('.test.tsx'))) {
        const filePath = join(dir, file.name);
        if (fixVitestImports(filePath)) {
          fixedCount++;
        }
      }
    }
  }

  console.log(`\n🎉 Fixed ${fixedCount} files`);
}

main();
```

#### Manual Fixes (Edge Cases)

For files that mix vitest globals with other imports:

```typescript
// BEFORE
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// AFTER
import { render } from '@testing-library/react';
// describe, it, expect, vi are globals (no import needed)
```

```typescript
// BEFORE (mixed imports)
import { describe, render } from 'vitest'; // ❌ render is NOT a vitest global

// AFTER (separate concerns)
import { render } from '@testing-library/react'; // ✅ Import from correct package
// describe is global (no import needed)
```

### Files to Fix (40+ identified)

```
src/infrastructure/persistence/stores/__tests__/schema-migrations.test.ts
src/infrastructure/persistence/stores/conversation/__tests__/conversation-migration.test.ts
src/infrastructure/persistence/stores/conversation/__tests__/useConversationStore.test.ts
src/lib/agent/__tests__/factory.test.ts
src/lib/agent/hooks/__tests__/use-agent-chat-with-tools.test.ts
src/lib/agent/hooks/__tests__/use-agent-chat.test.ts
src/lib/agent/providers/__tests__/model-registry.test.ts
src/lib/agent/providers/__tests__/provider-adapter.test.ts
src/lib/agent/routes/__tests__/chat-api.test.ts
src/lib/agent/routes/__tests__/sse-streaming.test.ts
src/lib/agent/tools/__tests__/execute-command-tool.test.ts
src/lib/agent/tools/__tests__/list-files-tool.test.ts
src/lib/agent/tools/__tests__/permission-check.test.ts
src/lib/agent/tools/__tests__/read-file-tool.test.ts
src/lib/agent/tools/__tests__/search-notes-tool.test.ts
src/lib/agent/tools/__tests__/tool-error.test.ts
src/lib/agent/tools/__tests__/tool-execution-context.test.ts
src/lib/agent/tools/__tests__/tool-execution-logger.test.ts
src/lib/agent/tools/__tests__/tool-parser.test.ts
src/lib/agent/tools/__tests__/types.test.ts
src/lib/agent/tools/__tests__/write-file-tool.test.ts
src/lib/filesystem/__tests__/directory-walker.test.ts
src/lib/filesystem/__tests__/exclusion-config.test.ts
src/lib/filesystem/__tests__/fsa-handle-manager.test.ts
src/lib/filesystem/__tests__/local-fs-adapter.test.ts
src/lib/filesystem/__tests__/path-guard.test.ts
src/lib/filesystem/__tests__/sync-executor.test.ts
src/lib/filesystem/__tests__/sync-manager.test.ts
src/lib/filesystem/__tests__/sync-planner.test.ts
src/lib/filesystem/__tests__/sync-rollback.test.ts
src/lib/filesystem/__tests__/validation.test.ts
src/hooks/__tests__/useCanvasDrop.test.ts
src/hooks/__tests__/useResponsive.test.ts
src/i18n/__tests__/config.test.ts
src/components/ide/__tests__/SyncStatusIndicator.test.tsx
src/components/layout/__tests__/IDELayout.test.tsx
... (plus ~10 more files)
```

---

## Part 3: Test Setup Enhancement (30 minutes)

### Current Test Setup

**File**: `src/test/setup.ts`

```typescript
// CURRENT
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

### Enhanced Test Setup

```typescript
// ENHANCED
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Global test utilities
beforeAll(() => {
  // Suppress console errors in tests (optional)
  // vi.spyOn(console, 'error').mockImplementation(() => {});

  // Mock Web Speech API if needed
  // global.SpeechRecognition = vi.fn();
});

// Extend global Window interface for tests
declare global {
  // Add test-specific properties
  interface Window {
    // Example: test-specific flags
    __TEST__?: boolean;
  }
}

// Set test flag
if (typeof window !== 'undefined') {
  window.__TEST__ = true;
}
```

### TypeScript Configuration for Tests

**Create**: `tsconfig.test.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"],
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "src/**/__tests__/**/*",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "vitest.config.ts",
    "src/test/setup.ts"
  ],
  "exclude": ["node_modules", "dist", ".next"]
}
```

**Update**: `tsconfig.json`

```json
{
  "compilerOptions": {
    // ... existing options
    "types": ["vite/client", "vitest/globals"]
  }
}
```

---

## Execution Checklist

### Pre-Fix Validation
- [ ] Run `pnpm test` to establish baseline (expect: 40+ import errors)
- [ ] Run `pnpm tsc --noEmit` to capture all TypeScript errors
- [ ] Create backup branch: `git checkout -b backup/before-cycle-469-fixes`

### Step 1: Update Vitest Config
- [ ] Edit `vitest.config.ts` with new configuration
- [ ] Create `tsconfig.test.json` for test-specific types
- [ ] Update `tsconfig.json` with vitest types
- [ ] Run `pnpm test` to verify config loads without errors
- [ ] Run sample test: `pnpm test src/hooks/__tests__/useResponsive.test.ts`

### Step 2: Remove Vitest Imports
- [ ] Create `scripts/fix-vitest-imports.ts`
- [ ] Run script: `pnpm tsx scripts/fix-vitest-imports.ts`
- [ ] Review changed files in git: `git diff`
- [ ] Manually fix any edge cases
- [ ] Run `pnpm test` to verify no import errors
- [ ] Run `pnpm tsc --noEmit` to verify type errors resolved

### Step 3: Enhance Test Setup
- [ ] Update `src/test/setup.ts` with global utilities
- [ ] Add global interface extensions
- [ ] Run `pnpm test` to verify setup works
- [ ] Check test cleanup is working properly

### Post-Fix Validation
- [ ] Run full test suite: `pnpm test`
- [ ] Run TypeScript check: `pnpm tsc --noEmit`
- [ ] Verify error count reduced: expect ~40 errors eliminated
- [ ] Check test pass rate: expect 100%
- [ ] Document any unexpected issues

### Documentation Updates
- [ ] Update `CLAUDE.md` with new test patterns
- [ ] Document test file naming conventions
- [ ] Add vitest config explanation to team wiki
- [ ] Update `AGENTS.md` with test infrastructure changes

---

## Validation Criteria

### Success Metrics
1. ✅ Zero vitest import errors
2. ✅ All tests pass (100% pass rate)
3. ✅ TypeScript errors reduced by 40+
4. ✅ No new warnings introduced
5. ✅ Test runtime unchanged (±5%)

### Rollback Plan
If any step fails:
```bash
# 1. Stash changes
git stash save "cycle-469-phase-1-attempt-1"

# 2. Restore baseline
git checkout backup/before-cycle-469-fixes

# 3. Investigate failure
git stash show -p | less

# 4. Document issue and retry
```

---

## Risk Assessment

### Risk Level: MEDIUM

**Potential Issues**:
1. Some tests may rely on specific environment (node vs jsdom)
2. Test execution order may change with new config
3. Global type definitions may conflict with existing code

**Mitigation**:
1. Test on subset of files before full run
2. Keep detailed log of each change
3. Maintain backup branch for quick rollback
4. Run tests incrementally (not all at once)

### Rollback Strategy
```bash
# Immediate rollback (< 5 minutes)
git checkout backup/before-cycle-469-fixes
git checkout - -- vitest.config.ts tsconfig.json src/test/setup.ts

# Full rollback
git reset --hard backup/before-cycle-469-fixes
```

---

## Next Steps

After Phase 1 completion:
1. Update workflow status with error counts
2. Create analysis document for Phase 2 (Store Integration)
3. Estimate time for Phase 2 (8 hours)
4. Schedule Phase 2 execution

---

## Appendix: File Changes Summary

### Files Modified (3 files)
```
vitest.config.ts              // Environment matching, coverage config
tsconfig.json                 // Add vitest types
src/test/setup.ts            // Global utilities, type extensions
```

### Files Created (1 file)
```
tsconfig.test.json           // Test-specific TypeScript config
scripts/fix-vitest-imports.ts // Automated fix script
```

### Files Auto-Modified (40+ files)
```
**/__tests__/*.test.ts       // Remove vitest imports
**/__tests__/*.test.tsx      // Remove vitest imports
```

---

**Document ID**: ralph-loop-cycle-469-phase-1-fix-plan
**Version**: 1.0.0
**Status**: 📋 READY FOR EXECUTION
**Dependencies**: Codebase analysis (✅ COMPLETE)
**Next Phase**: Store Integration Fixes (Phase 2)
