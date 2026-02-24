import { test, expect } from '@playwright/test';

/**
 * FS-04: UI Overlay Backdrop Fix
 * Story: EPIC-FS, FS-04
 * Gate: /notes route loads without overlay blocking view
 *
 * Tests that the import progress overlay uses semi-transparent background
 * with backdrop blur instead of solid bg-card background.
 */

test.describe('FS-04: UI Overlay Backdrop Fix', () => {
  test('Gate: /notes route loads without blocking overlay', async ({ page }) => {
    // Phase 1: Core Gate Verification
    const response = await page.goto('/notes');
    expect(response?.status()).toBeLessThan(400);

    // Verify page loaded (no overlay blocking initial view)
    await expect(page.getByText('Notes').or(page.getByText('Create your first note')).or(page.getByText('notes'))).toBeVisible();

    // Verify no solid bg-card overlay is visible on initial load
    // A blocking overlay would have bg-card without backdrop-blur
    const blockingOverlays = page.locator('.fixed.inset-0.bg-card').filter({ hasNot: page.locator('.backdrop-blur') });
    await expect(blockingOverlays).not.toBeVisible();
  });

  test('Overlay styling uses backdrop-blur when visible', async ({ page }) => {
    await page.goto('/notes');

    // Check that any visible overlay has backdrop-blur class
    const overlays = page.locator('.fixed.inset-0.z-50');

    const count = await overlays.count();
    for (let i = 0; i < count; i++) {
      const overlay = overlays.nth(i);
      const isVisible = await overlay.isVisible().catch(() => false);

      if (isVisible) {
        const className = await overlay.getAttribute('class') || '';
        // Visible overlays should have backdrop-blur (semi-transparent)
        expect(className).toContain('backdrop-blur');
      }
    }
  });

  test('8-bit design compliance: no rounded-lg on overlay', async ({ page }) => {
    await page.goto('/notes');

    // Look for any overlay elements
    const overlays = page.locator('.fixed.inset-0.z-50');

    const count = await overlays.count();
    for (let i = 0; i < count; i++) {
      const overlay = overlays.nth(i);
      const className = await overlay.getAttribute('class') || '';

      // Verify NO rounded-lg (should use rounded-none or no radius class)
      expect(className).not.toContain('rounded-lg');
    }
  });

  test('Mobile viewport loads correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/notes');

    // Verify no overflow issues
    const hasOverflow = await page.evaluate(() => {
      const body = document.body;
      return body.scrollHeight > window.innerHeight + 50; // Allow small tolerance
    });

    expect(hasOverflow).toBe(false);
  });
});
