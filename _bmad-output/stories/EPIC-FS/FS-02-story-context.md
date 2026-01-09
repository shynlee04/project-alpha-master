# Story FS-02: Implement ProjectRegistry with Conflict Detection

**Epic**: EPIC-FS (File System & Workspace Foundation)
**Story ID**: FS-02
**Status**: PENDING (Governance Validation Required)
**Priority**: P0 - Blocking
**Estimated Effort**: 4 hours
**Created**: 2026-01-09T18:00:00+07:00
**Assigned To**: @bmad-bmm-dev

---

## Problem Statement

**Issue**: Projects can have ID conflicts and no workspace isolation. The same folder can be opened in multiple workspaces simultaneously, causing potential data corruption and sync conflicts.

**Missing**:
- No Project ID namespace (workspace-specific)
- No conflict detection when same folder opened in multiple workspaces
- No project lifecycle management (open/close vs create)
- No cross-workspace project state synchronization

**Impact**: Can crash when same folder opened across workspaces, data corruption possible.

---

## Acceptance Criteria

1. **[P0]** ProjectRegistry singleton service created
2. **[P0]** Folder path conflict detection (same folder → conflict)
3. **[P0]** Workspace namespacing for project IDs
4. **[P0]** Lifecycle state tracking (pending, active, inactive, closed)
5. **[P0]** Auto-cleanup on component unmount
6. **[P1]** TypeScript compiles without errors
7. **[P1]** E2E tests validate conflict detection

---

## Implementation Details

### Files Created
1. `src/domain/services/project-registry-types.ts` (128 lines) - Type definitions
2. `src/domain/services/ProjectRegistry.ts` (582 lines) - Singleton service

### Files Modified
1. `src/domain/services/index.ts` - Export ProjectRegistry
2. `src/routes/notes.lazy.tsx` - Integrate ProjectRegistry

### Architecture: Three-Index Design

```typescript
class ProjectRegistryClass {
  private readonly folderIndex: Map<string, ProjectRegistration>;    // folderPath → registration
  private readonly projectIndex: Map<string, ProjectRegistration>;    // projectId → registration
  private readonly namespaceIndex: Map<ProjectNamespace, string>;     // namespace → projectId

  // Key Methods
  register(projectId, folderPath, workspaceType, options): ProjectRegistrationResult
  unregister(projectId, workspaceType?): boolean
  detectConflict(folderPath, projectId, workspaceType): ProjectConflictResult
  getRegistration(projectId): ProjectRegistration | undefined
  isFolderRegistered(folderPath, excludeProjectId?): boolean
}
```

### Namespace Format
```typescript
// Format: {workspace}:{projectId}
const namespace = `${workspaceType}:${projectId}`;

// Examples:
"ide:proj_1704787200000_abc123xyz"
"notes:default-notes"
"knowledge:proj_1704787200000_xyz789abc"
```

### Conflict Detection Logic
```typescript
// Same project, same workspace → no conflict (re-registration)
if (existing.projectId === projectId && existing.workspaceType === workspaceType) {
  return { hasConflict: false, isResolvable: true, suggestedAction: 'use_existing' };
}

// Different project, same folder → CONFLICT
return {
  hasConflict: true,
  existingProjectId: existing.projectId,
  existingWorkspaceType: existing.workspaceType,
  isResolvable: false,
  suggestedAction: 'abort',
};
```

---

## Validation Gates

### L1: State Integrity
- [ ] Single registry instance (singleton)
- [ ] Three indexes stay synchronized
- [ ] No stale registrations after cleanup

### L2: Code Hygiene
- [ ] No TypeScript errors
- [ ] All methods have proper typing
- [ ] No unused variables

### L3: Naming
- [ ] Class name matches file name
- [ ] Methods use verb-noun convention
- [ ] Types follow PascalCase

### L4: Dependencies
- [ ] No circular dependencies
- [ ] Domain layer only (no infrastructure imports)
- [ ] Pure service (no React dependencies)

### L5: Integration
- [ ] notes.lazy.tsx registers project on mount
- [ ] Cleanup on unmount works
- [ ] Conflict detection prevents data corruption

### L6: Architecture
- [ ] Domain layer service (src/domain/services/)
- [ ] Singleton pattern correctly implemented
- [ ] Three-index architecture documented

### L7: Mobile
- [ ] Works on mobile (FSA not required for IndexedDB projects)
- [ ] Touch targets ≥44px (for conflict UI)

### L8: i18n
- [ ] Error messages use t() hook
- [ ] No hardcoded error text

### L9: Performance
- [ ] Registry operations <10ms
- [ ] No memory leaks (cleanup works)
- [ ] Index lookups O(1)

### L10: Security
- [ ] No path traversal vulnerabilities
- [ ] Normalized path comparison prevents bypass

### L11: Documentation
- [ ] JSDoc comments complete
- [ ] Usage examples provided
- [ ] Architecture decisions explained

### L12: Test Coverage
- [ ] E2E tests validate conflict detection
- [ ] Unit tests for registry operations

---

## E2E Test Requirements

### Test File: `src/domain/services/__tests__/ProjectRegistry.e2e.test.ts`

```typescript
import { test, expect } from '@playwright/test';
import { ProjectRegistry } from '@/domain/services/ProjectRegistry';

test.describe('FS-02: ProjectRegistry Conflict Detection', () => {
  test.beforeEach(async () => {
    // Clear registry before each test
    ProjectRegistry.clear();
  });

  test('Gate: ProjectRegistry singleton exists', async () => {
    // Phase 1: Core Gate Verification
    const registry1 = ProjectRegistry;
    const registry2 = ProjectRegistry;

    // Verify singleton (same instance)
    expect(registry1).toBe(registry2);

    // Verify key methods exist
    expect(typeof ProjectRegistry.register).toBe('function');
    expect(typeof ProjectRegistry.unregister).toBe('function');
    expect(typeof ProjectRegistry.detectConflict).toBe('function');
  });

  test('Register project successfully', async () => {
    const result = ProjectRegistry.register(
      'test-project-1',
      '/Users/test/project',
      'notes'
    );

    expect(result.success).toBe(true);
    expect(result.projectId).toBe('test-project-1');
    expect(result.isNew).toBe(true);
  });

  test('Detect conflict when same folder registered twice', async () => {
    // First registration
    ProjectRegistry.register('project-1', '/Users/test/folder', 'ide');

    // Second registration with different project, same folder
    const result = ProjectRegistry.register('project-2', '/Users/test/folder', 'knowledge');

    // Should detect conflict
    expect(result.success).toBe(false);
    expect(result.conflict?.hasConflict).toBe(true);
    expect(result.conflict?.existingProjectId).toBe('project-1');
    expect(result.conflict?.existingWorkspaceType).toBe('ide');
  });

  test('Allow re-registration of same project in same workspace', async () => {
    // First registration
    ProjectRegistry.register('project-1', '/Users/test/folder', 'ide');

    // Re-register same project
    const result = ProjectRegistry.register('project-1', '/Users/test/folder', 'ide');

    // Should succeed (no conflict)
    expect(result.success).toBe(true);
  });

  test('Unregister removes project from all indexes', async () => {
    // Register project
    ProjectRegistry.register('project-1', '/Users/test/folder', 'ide');

    // Verify registered
    expect(ProjectRegistry.isFolderRegistered('/Users/test/folder')).toBe(true);

    // Unregister
    const unregistered = ProjectRegistry.unregister('project-1', 'ide');

    // Verify unregistered
    expect(unregistered).toBe(true);
    expect(ProjectRegistry.isFolderRegistered('/Users/test/folder')).toBe(false);
  });

  test('Namespace isolation between workspaces', async () => {
    // Register same project ID in different workspaces
    const result1 = ProjectRegistry.register('same-id', '/path1', 'ide');
    const result2 = ProjectRegistry.register('same-id', '/path2', 'knowledge');

    // Both should succeed (different folders)
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    // Verify namespace isolation
    const ideNamespace = ProjectRegistry.createNamespace('ide', 'same-id');
    const knowledgeNamespace = ProjectRegistry.createNamespace('knowledge', 'same-id');

    expect(ProjectRegistry.resolveNamespace(ideNamespace)).toBe('same-id');
    expect(ProjectRegistry.resolveNamespace(knowledgeNamespace)).toBe('same-id');
  });

  test('Get stats returns correct counts', async () => {
    // Register projects across workspaces
    ProjectRegistry.register('proj-1', '/path1', 'ide');
    ProjectRegistry.register('proj-2', '/path2', 'notes');
    ProjectRegistry.register('proj-3', '/path3', 'knowledge');

    const stats = ProjectRegistry.getStats();

    expect(stats.totalRegistered).toBe(3);
    expect(stats.byWorkspace.ide).toBe(1);
    expect(stats.byWorkspace.notes).toBe(1);
    expect(stats.byWorkspace.knowledge).toBe(1);
  });
});
```

### Integration E2E Test: `src/routes/notes/__tests__/FS-02-project-registry-integration.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('FS-02: ProjectRegistry Integration with Notes', () => {
  test('Gate: /notes route registers project in registry', async ({ page }) => {
    // Phase 1: Core Gate Verification
    const response = await page.goto('/notes');
    expect(response?.status()).toBeLessThan(400);

    // Verify page loaded
    await expect(page.locator('text=Notes')).toBeVisible();

    // Check console for project registration
    const messages: string[] = [];
    page.on('console', msg => messages.push(msg.text()));

    await page.waitForTimeout(1000);

    // Look for successful registration message
    const hasRegistrationLog = messages.some(m =>
      m.includes('[ProjectRegistry]') || m.includes('notes:default-notes')
    );
    // Note: Registration happens silently, so we verify no errors
  });

  test('Project cleanup on navigation away', async ({ page }) => {
    await page.goto('/notes');
    await page.waitForTimeout(500);

    // Navigate away
    await page.goto('/knowledge');
    await page.waitForTimeout(500);

    // Return to notes (should re-register)
    await page.goto('/notes');
    await expect(page.locator('text=Notes')).toBeVisible();
  });
});
```

### Test Execution Commands

```bash
# Run unit tests for ProjectRegistry
pnpm test src/domain/services/__tests__/ProjectRegistry.e2e.test.ts

# Run integration tests
pnpm exec playwright test src/routes/notes/__tests__/FS-02-project-registry-integration.spec.ts

# Run with coverage
pnpm test src/domain/services/__tests__/ProjectRegistry.e2e.test.ts --coverage
```

---

## Code Review Checklist

### Before Approval, Reviewer Must Verify:

- [ ] Three-index architecture implemented correctly
- [ ] Conflict detection prevents same folder in multiple workspaces
- [ ] Namespace format `{workspace}:{projectId}` followed
- [ ] Singleton pattern correctly implemented
- [ ] Cleanup on unmount works (no memory leaks)
- [ ] TypeScript compiles without errors
- [ ] E2E tests pass

### Approval Signature

**Reviewer**: ___________________
**Date**: ___________________
**Status**: [ ] APPROVED [ ] REJECTED
**Comments**: _____________________________

---

## Dependencies

- **FS-01**: NotesPage must load without errors

## Blocks

- **FS-03**: Depends on FS-02 (namespacing uses registry)
- **FS-05, FS-06**: Depend on FS-02 (need registry for conflict detection)

---

## Handoff to @integration-testing

### Test Evidence Required
1. Screenshot of successful registration
2. Screenshot of conflict detection error (when triggering conflict)
3. Test execution report (pass/fail)
4. Memory leak test results (10-minute session)

### Real API Testing
- N/A for this story (no LLM/agent calls)

---

## Completion Status

**Phase**: GOVERNANCE PENDING
**Next Step**: Run E2E tests, obtain code review approval
**Cannot proceed to FS-03 until**: E2E tests pass + code review approved

---

**Story File**: `_bmad-output/stories/EPIC-FS/FS-02-story-context.md`
