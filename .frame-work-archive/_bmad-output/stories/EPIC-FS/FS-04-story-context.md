# Story FS-04: Fix UI Overlay Issues

**Epic**: EPIC-FS (File System & Workspace Foundation)
**Story ID**: FS-04
**Status**: PENDING (Governance Validation Required)
**Priority**: P1
**Estimated Effort**: 2 hours
**Created**: 2026-01-09T18:00:00+07:00
**Assigned To**: @bmad-bmm-dev

---

## Problem Statement

**Issue**: Status overlay blocking view and interaction in Notes workspace. The import progress overlay uses solid `bg-card` background with borders, making it difficult to see the content beneath and blocking user interaction.

**Root Cause**: 8-bit design violation - solid opaque backgrounds instead of semi-transparent overlays with backdrop blur.

**Impact**: Poor UX, users cannot see progress or interact with the app during imports.

---

## Acceptance Criteria

1. **[P1]** Overlay uses semi-transparent background (`bg-background/80`)
2. **[P1]** Backdrop blur applied (`backdrop-blur-sm`)
3. **[P1]** 8-bit design compliance (no `rounded-lg`, use `rounded-none`)
4. **[P1]** No meaningless borders (removed `border-b border-border`)
5. **[P1]** Both mobile and desktop locations fixed
6. **[P1]** TypeScript compiles without errors
7. **[P1]** Visual regression tests pass

---

## Implementation Details

### Files Modified
- `src/presentation/components/notes/NotesPage.tsx` (2 locations)

### Code Changes

**BEFORE (solid background - blocks view)**:
```typescript
<div className="fixed inset-0 z-50 flex items-center justify-center bg-card border-b border-border">
```

**AFTER (semi-transparent with blur - proper overlay)**:
```typescript
<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-none">
```

### Changes Summary
| Attribute | Before | After | Reason |
|-----------|--------|-------|--------|
| Background | `bg-card` | `bg-background/80` | Semi-transparent |
| Blur | None | `backdrop-blur-sm` | Visual separation |
| Border | `border-b border-border` | Removed | Meaningless on fixed overlay |
| Radius | `rounded-lg` | `rounded-none` | 8-bit design compliance |

### Locations Modified
1. **Mobile view**: Line ~482
2. **Desktop view**: Line ~595

---

## Validation Gates

### L1: State Integrity
- [ ] Overlay renders correctly
- [ ] Loading state displays properly
- [ ] Progress indicators visible

### L2: Code Hygiene
- [ ] No TypeScript errors
- [ ] Consistent styling
- [ ] No duplicate classes

### L3: Naming
- [ ] Class names follow design tokens
- [ ] Semantic class usage

### L4: Dependencies
- [ ] No new dependencies
- [ ] Uses existing Tailwind classes

### L5: Integration
- [ ] Overlay appears during imports
- [ ] Overlay disappears when complete
- [ ] Underlying content visible through overlay

### L6: Architecture
- [ ] Presentation layer only
- [ ] Follows 8-bit design system
- [ ] No glassmorphism (solid colors, opacity only)

### L7: Mobile
- [ ] Touch targets ≥44px (dismissive buttons)
- [ ] Mobile viewport tested

### L8: i18n
- [ ] Loading text uses t() hook
- [ ] No hardcoded English

### L9: Performance
- [ ] Backdrop blur doesn't cause lag
- [ ] Animation smooth (60fps)

### L10: Security
- [ ] No overlay hijacking vulnerabilities
- [ ] User can dismiss if needed

### L11: Documentation
- [ ] 8-bit design compliance documented
- [ ] CLAUDE.md updated with overlay pattern

### L12: Test Coverage
- [ ] Visual regression test passes
- [ ] E2E test validates overlay appearance

---

## E2E Test Requirements

### Test File: `src/presentation/components/notes/__tests__/FS-04-overlay.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('FS-04: UI Overlay Backdrop Fix', () => {
  test('Gate: /notes route loads without overlay blocking view', async ({ page }) => {
    // Phase 1: Core Gate Verification
    const response = await page.goto('/notes');
    expect(response?.status()).toBeLessThan(400);

    // Verify page loaded (no overlay blocking initial view)
    await expect(page.locator('text=Notes')).toBeVisible();

    // Verify no solid overlay present on initial load
    const overlay = page.locator('.fixed.inset-0.bg-card');
    await expect(overlay).not.toBeVisible();
  });

  test('Loading overlay uses semi-transparent background', async ({ page }) => {
    await page.goto('/notes');

    // Trigger loading state (if possible via button click)
    const createButton = page.locator('button:has-text("Create")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Check for overlay with proper styling
      const overlay = page.locator('.fixed.inset-0').first();

      // Verify semi-transparent (can't directly test opacity, but verify class)
      const className = await overlay.getAttribute('class') || '';
      expect(className).toContain('backdrop-blur');
    }
  });

  test('8-bit design compliance: no rounded corners on overlay', async ({ page }) => {
    await page.goto('/notes');

    // Look for any overlay elements
    const overlays = page.locator('.fixed.inset-0.z-50');

    const count = await overlays.count();
    for (let i = 0; i < count; i++) {
      const overlay = overlays.nth(i);
      const className = await overlay.getAttribute('class') || '';

      // Verify NO rounded corners (should use rounded-none or no radius class)
      expect(className).not.toContain('rounded-lg');
      expect(className).not.toContain('rounded-xl');
      expect(className).not.toContain('rounded-full');
    }
  });

  test('Mobile: Overlay fits on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/notes');

    // Verify no overflow
    const hasOverflow = await page.evaluate(() => {
      const body = document.body;
      return body.scrollHeight > body.clientHeight;
    });

    expect(hasOverflow).toBe(false);
  });

  test('Visual regression: overlay appearance', async ({ page }) => {
    await page.goto('/notes');

    // Take baseline screenshot
    await expect(page).toHaveScreenshot('notes-page-initial-load.png', {
      maxDiffPixels: 100,
      threshold: 0.2
    });
  });
});
```

### Visual Regression Test Commands

```bash
# Run E2E tests for FS-04
pnpm exec playwright test src/presentation/components/notes/__tests__/FS-04-overlay.spec.ts

# Run with screenshots
pnpm exec playwright test src/presentation/components/notes/__tests__/FS-04-overlay.spec.ts --screenshot=only-on-failure

# Run visual regression
pnpm exec playwright test src/presentation/components/notes/__tests__/FS-04-overlay.spec.ts --update-snapshots
```

---

## Code Review Checklist

### Before Approval, Reviewer Must Verify:

- [ ] Overlay uses `bg-background/80` (semi-transparent)
- [ ] `backdrop-blur-sm` applied
- [ ] `rounded-none` for 8-bit compliance
- [ ] No meaningless borders on fixed overlay
- [ ] Both mobile and desktop locations fixed
- [ ] TypeScript compiles without errors
- [ ] Visual regression test passes

### Approval Signature

**Reviewer**: ___________________
**Date**: ___________________
**Status**: [ ] APPROVED [ ] REJECTED
**Comments**: _____________________________

---

## Dependencies

- **FS-01**: NotesPage must load without nested lazy errors

## Blocks

- None (independent UI fix)

---

## Handoff to @integration-testing

### Test Evidence Required
1. Screenshot of overlay with semi-transparent background
2. Screenshot showing backdrop blur effect
3. Screenshot of mobile viewport
4. Visual regression comparison (baseline vs actual)
5. Test execution report (pass/fail)

### Real API Testing
- N/A for this story (no LLM/agent calls)

---

## Completion Status

**Phase**: GOVERNANCE PENDING
**Next Step**: Run E2E tests, obtain code review approval
**Phase 1 Complete When**: FS-01 through FS-04 all approved

---

**Story File**: `_bmad-output/stories/EPIC-FS/FS-04-story-context.md`
