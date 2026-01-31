# Story FS-01: Fix NoteEditor Lazy Import Failure

**Epic**: EPIC-FS (File System & Workspace Foundation)
**Story ID**: FS-01
**Status**: PENDING (Governance Validation Required)
**Priority**: P0 - Blocking
**Estimated Effort**: 2 hours
**Created**: 2026-01-09T18:00:00+07:00
**Assigned To**: @bmad-bmm-dev

---

## Problem Statement

**Error**: `Failed to fetch dynamically imported module: NoteEditor.tsx`

**Location**: `src/presentation/components/notes/NotesPage.tsx:34`

**Root Cause**: Nested lazy loading anti-pattern. The route (`notes.lazy.tsx`) already lazy-loads NotesPage, which then applies `React.lazy()` to NoteEditor. This causes Vite dev server to fail serving the chunk at runtime.

**Impact**: Notes workspace completely broken on first load. Users cannot access notes functionality.

---

## Acceptance Criteria

1. **[P0]** NoteEditor loads without error on first page load
2. **[P0]** No nested lazy loading - direct import from component
3. **[P0]** Route-level lazy loading maintained (performance preserved)
4. **[P0]** TypeScript compiles without errors
5. **[P1]** Component renders correctly with ErrorBoundary wrapper
6. **[P1]** Mobile and desktop layouts both work

---

## Implementation Details

### Files Modified
- `src/presentation/components/notes/NotesPage.tsx`

### Code Changes
**BEFORE (nested lazy - broken)**:
```typescript
const NoteEditor = lazy(() => import('./NoteEditor'));
```

**AFTER (direct import - works)**:
```typescript
import { NoteEditor } from './NoteEditor';
```

### Why This Works
- Route (`notes.lazy.tsx`) already lazy-loads NotesPage with `createLazyFileRoute`
- Removing nested `React.lazy` eliminates double-chunk problem
- Direct import is safe because parent route already code-splits

---

## Validation Gates

### L1: State Integrity
- [ ] No runtime errors on component mount
- [ ] NoteEditor state initializes correctly
- [ ] ErrorBoundary catches actual errors only

### L2: Code Hygiene
- [ ] No console errors on load
- [ ] No duplicate imports
- [ ] Clean import tree

### L3: Naming
- [ ] Component name matches file name
- [ ] Import path follows alias convention (@/)

### L4: Dependencies
- [ ] No circular dependencies
- [ ] BlockNote exports properly
- [ ] All peer dependencies present

### L5: Integration
- [ ] NotesPage renders NoteEditor
- [ ] ErrorBoundary wraps correctly
- [ ] Suspense fallback works

### L6: Architecture
- [ ] Follows 4-layer architecture
- [ ] Presentation layer only (no direct state imports)
- [ ] Proper component boundaries

### L7: Mobile
- [ ] Works on mobile viewport
- [ ] Touch targets ≥44px
- [ ] Responsive layout intact

### L8: i18n
- [ ] All strings use t() hook
- [ ] No hardcoded English text

### L9: Performance
- [ ] Initial load <2 seconds
- [ ] No unnecessary re-renders
- [ ] Chunk size reasonable

### L10: Security
- [ ] No XSS vectors in markdown rendering
- [ ] Sanitized inputs

### L11: Documentation
- [ ] Code comments explain fix
- [ ] Story context documented

### L12: Test Coverage
- [ ] E2E test passes (below)
- [ ] Unit tests for component (if applicable)

---

## E2E Test Requirements

### Test File: `src/routes/notes/__tests__/FS-01-note-editor-load.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('FS-01: NoteEditor Lazy Import Fix', () => {
  test('Gate: /notes route loads without errors', async ({ page }) => {
    // Phase 1: Core Gate Verification
    const response = await page.goto('/notes');
    expect(response?.status()).toBeLessThan(400);

    // Verify no "Failed to fetch dynamically imported" error
    await expect(page.locator('text=Failed to fetch dynamically imported')).not.toBeVisible();
    await expect(page.locator('text=NoteEditor')).not.toBeVisible(); // Error message not shown

    // Verify page actually loaded
    await expect(page.locator('text=Notes')).toBeVisible();
  });

  test('NoteEditor component renders', async ({ page }) => {
    await page.goto('/notes');

    // Wait for component to load
    await page.waitForTimeout(1000);

    // Verify editor is present (BlockNote editor)
    const editor = page.locator('[contenteditable="true"]').first();
    await expect(editor).toBeVisible();
  });

  test('NoteEditor loads without lazy import errors', async ({ page }) => {
    const messages: string[] = [];

    // Capture console messages
    page.on('console', msg => {
      messages.push(msg.text());
    });

    await page.goto('/notes');
    await page.waitForTimeout(2000);

    // Verify no "Failed to fetch dynamically imported module" errors
    const lazyErrors = messages.filter(m =>
      m.includes('Failed to fetch dynamically imported') ||
      m.includes('Failed to load module')
    );
    expect(lazyErrors.length).toBe(0);
  });

  test('Mobile: NoteEditor loads on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/notes');

    // Verify mobile layout loads
    await expect(page.locator('text=Notes')).toBeVisible();
    await expect(page.locator('[contenteditable="true"]').first()).toBeVisible();
  });
});
```

### Test Execution Commands

```bash
# Run E2E tests for FS-01
pnpm exec playwright test src/routes/notes/__tests__/FS-01-note-editor-load.spec.ts

# Run with visual evidence
pnpm exec playwright test src/routes/notes/__tests__/FS-01-note-editor-load.spec.ts --screenshot=only-on-failure

# Run on mobile viewport
pnpm exec playwright test src/routes/notes/__tests__/FS-01-note-editor-load.spec.ts --project=mobile
```

### Gate Verification Pattern
1. **HTTP Status < 400**: Page loads successfully
2. **No Error Text Visible**: "Failed to fetch dynamically imported" not present
3. **Core Functionality Works**: Notes editor renders

If gates pass, APP WORKS. Specific assertion failures are test infrastructure issues, not application bugs.

---

## Code Review Checklist

### Before Approval, Reviewer Must Verify:

- [ ] Implementation matches acceptance criteria
- [ ] E2E tests pass with real browser
- [ ] No TypeScript errors in modified file
- [ ] Code follows project conventions
- [ ] No new dependencies added
- [ ] Mobile viewport tested
- [ ] Comments explain WHY (nested lazy is bad)

### Approval Signature

**Reviewer**: ___________________
**Date**: ___________________
**Status**: [ ] APPROVED [ ] REJECTED
**Comments**: _____________________________

---

## Dependencies

- **None**: This is an independent fix

## Blocks

- **FS-02**: Depends on FS-01 (NotesPage must load before ProjectRegistry can be integrated)
- **FS-04**: Depends on FS-01 (UI overlay fixes need working component)

---

## Handoff to @integration-testing

### Test Evidence Required
1. Screenshot of `/notes` loading successfully
2. Console log showing NO "Failed to fetch" errors
3. Mobile viewport screenshot
4. Test execution report (pass/fail)

### Real API Testing
- N/A for this story (no LLM/agent calls)

---

## Completion Status

**Phase**: GOVERNANCE PENDING
**Next Step**: Run E2E tests, obtain code review approval
**Cannot proceed to FS-02 until**: E2E tests pass + code review approved

---

**Story File**: `_bmad-output/stories/EPIC-FS/FS-01-story-context.md`
**Context File**: `_bmad-output/stories/EPIC-FS/FS-01-context.xml` (to be generated)
