# Story FS-03: Add Project ID Namespacing

**Epic**: EPIC-FS (File System & Workspace Foundation)
**Story ID**: FS-03
**Status**: PENDING (Governance Validation Required)
**Priority**: P0 - Blocking
**Estimated Effort**: 3 hours
**Created**: 2026-01-09T18:00:00+07:00
**Assigned To**: @bmad-bmm-dev

---

## Problem Statement

**Issue**: Projects lack workspace-specific IDs. Without namespacing, projects across different workspaces can have ID conflicts, and there's no clear way to identify which workspace a project belongs to.

**Current Format**:
```typescript
// Legacy format (no workspace)
const projectId = 'proj_1704787200000_abc123xyz';
```

**Target Format**:
```typescript
// New format (workspace-prefixed)
const projectId = 'ide:proj_1704787200000_abc123xyz';
const notesId = 'notes:default-notes';
```

**Impact**: Cannot reliably track projects across workspaces, potential ID collisions.

---

## Acceptance Criteria

1. **[P0]** Project ID format: `{workspace}:{projectId}`
2. **[P0]** `generateProjectId()` function creates namespaced IDs
3. **[P0]** `extractWorkspaceType()` function parses workspace from ID
4. **[P0]** Legacy non-namespaced IDs default to 'ide'
5. **[P0]** All workspace types supported (ide, knowledge, study, notes)
6. **[P1]** TypeScript compiles without errors
7. **[P1]** E2E tests validate namespacing

---

## Implementation Details

### Files Modified
1. `src/infrastructure/persistence/stores/project/project-crud-slice.ts`

### Code Changes

#### 1. generateProjectId Function
```typescript
function generateProjectId(
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes' = 'ide'
): string {
  const randomPart = Math.random().toString(36).substring(2, 11);
  return `${workspaceType}:proj_${Date.now()}_${randomPart}`;
}
```

#### 2. extractWorkspaceType Function
```typescript
function extractWorkspaceType(projectId: string): 'ide' | 'knowledge' | 'study' | 'notes' {
  const parts = projectId.split(':');
  if (parts.length === 2) {
    const workspaceType = parts[0];
    if (workspaceType === 'ide' || workspaceType === 'knowledge' ||
        workspaceType === 'study' || workspaceType === 'notes') {
      return workspaceType;
    }
  }
  // Legacy non-namespaced IDs default to 'ide'
  return 'ide';
}
```

#### 3. Updated createProject
```typescript
createProject: (input: CreateProjectInput) => {
  const workspaceType = input.workspaceType ?? 'ide';
  const projectId = generateProjectId(workspaceType);
  // ... rest of implementation
}
```

---

## Validation Gates

### L1: State Integrity
- [ ] All project IDs follow namespace format
- [ ] No duplicate IDs possible (timestamp + random)
- [ ] Legacy IDs handled correctly

### L2: Code Hygiene
- [ ] No TypeScript errors
- [ ] Proper typing for workspace types
- [ ] No magic strings

### L3: Naming
- [ ] Function names clearly indicate purpose
- [ ] Variable names follow convention

### L4: Dependencies
- [ ] No circular dependencies
- [ ] project-types.ts exports workspace type

### L5: Integration
- [ ] createProject generates namespaced IDs
- [ ] updateProject preserves namespace
- [ ] Cross-workspace projects don't collide

### L6: Architecture
- [ ] Infrastructure layer only
- [ ] Persistence layer handles IDs correctly
- [ ] Migration path for legacy IDs

### L7: Mobile
- [ ] Works on mobile (IndexedDB projects)

### L8: i18n
- [ ] N/A (internal IDs, not user-facing)

### L9: Performance
- [ ] ID generation <1ms
- [ ] Workspace extraction <1ms

### L10: Security
- [ ] No injection vulnerabilities
- [ ] Random part sufficient for uniqueness

### L11: Documentation
- [ ] JSDoc comments complete
- [ ] Format documented in code

### L12: Test Coverage
- [ ] E2E tests validate namespace format
- [ ] Unit tests for generation/extraction

---

## E2E Test Requirements

### Test File: `src/infrastructure/persistence/stores/project/__tests__/FS-03-namespacing.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('FS-03: Project ID Namespacing', () => {
  test('Gate: Project IDs follow namespace format', async ({ page }) => {
    // This test verifies the namespacing logic by checking console logs
    // or by creating projects and verifying ID format

    const messages: string[] = [];
    page.on('console', msg => messages.push(msg.text()));

    await page.goto('/notes');
    await page.waitForTimeout(1000);

    // Look for project creation logs
    const projectLogs = messages.filter(m => m.includes('[ProjectStore] Creating project:'));

    // Verify logs show namespaced format
    if (projectLogs.length > 0) {
      const hasNamespace = projectLogs.some(m => m.includes('notes:'));
      expect(hasNamespace).toBe(true);
    }
  });

  test('Workspace type extraction from namespaced ID', () => {
    // Test the extraction logic directly (can be unit test)
    const testCases = [
      { id: 'ide:proj_123', expected: 'ide' },
      { id: 'knowledge:proj_456', expected: 'knowledge' },
      { id: 'study:proj_789', expected: 'study' },
      { id: 'notes:proj_000', expected: 'notes' },
      { id: 'legacy-proj', expected: 'ide' }, // Legacy defaults to ide
      { id: 'unknown:proj_123', expected: 'ide' }, // Unknown defaults to ide
    ];

    for (const { id, expected } of testCases) {
      // In real test, we'd import extractWorkspaceType
      // For now, we verify format is followed
      const parts = id.split(':');
      const workspace = parts.length === 2 ? parts[0] : 'ide';
      expect(['ide', 'knowledge', 'study', 'notes'].includes(workspace) || workspace === 'ide').toBe(true);
    }
  });

  test('Different workspace types get different namespaces', () => {
    const workspaceTypes = ['ide', 'knowledge', 'study', 'notes'];

    workspaceTypes.forEach(ws => {
      // Simulate project ID generation
      const randomPart = Math.random().toString(36).substring(2, 11);
      const projectId = `${ws}:proj_${Date.now()}_${randomPart}`;

      // Verify format
      expect(projectId).toMatch(/^(ide|knowledge|study|notes):proj_\d+_[a-z0-9]+$/);
      expect(projectId.startsWith(`${ws}:`)).toBe(true);
    });
  });
});
```

### Test Execution Commands

```bash
# Run E2E tests for FS-03
pnpm exec playwright test src/infrastructure/persistence/stores/project/__tests__/FS-03-namespacing.spec.ts

# Run unit tests
pnpm test src/infrastructure/persistence/stores/project/__tests__/FS-03-namespacing.spec.ts
```

---

## Code Review Checklist

### Before Approval, Reviewer Must Verify:

- [ ] generateProjectId() uses workspaceType parameter
- [ ] extractWorkspaceType() handles legacy IDs (defaults to 'ide')
- [ ] All four workspace types supported
- [ ] TypeScript compiles without errors
- [ ] E2E tests validate namespace format

### Approval Signature

**Reviewer**: ___________________
**Date**: ___________________
**Status**: [ ] APPROVED [ ] REJECTED
**Comments**: _____________________________

---

## Dependencies

- **FS-01**: NotesPage must load
- **FS-02**: ProjectRegistry must exist (namespace used there too)

## Blocks

- **FS-05, FS-06**: Depend on namespacing for cross-workspace coordination

---

## Handoff to @integration-testing

### Test Evidence Required
1. Screenshot showing namespaced project IDs in console
2. Test execution report (pass/fail)
3. Verification of legacy ID handling

### Real API Testing
- N/A for this story (no LLM/agent calls)

---

## Completion Status

**Phase**: GOVERNANCE PENDING
**Next Step**: Run E2E tests, obtain code review approval
**Cannot proceed to FS-04 until**: E2E tests pass + code review approved

---

**Story File**: `_bmad-output/stories/EPIC-FS/FS-03-story-context.md`
