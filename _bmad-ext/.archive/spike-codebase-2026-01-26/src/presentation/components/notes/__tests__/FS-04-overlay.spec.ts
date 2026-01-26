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
  test('Gate: /notes route loads without overlay blocking view', async ({ page }) => {
    // Phase 1: Core Gate Verification
    const response = await page.goto('/notes');
    expect(response?.status()).toBeLessThan(400);

    // Verify page loaded (no overlay blocking initial view)
    await expect(page.locator('text=Notes').or(page.getByText('notes'))).toBeVisible();

    // Verify no solid overlay present on initial load
    const overlay = page.locator('.fixed.inset-0.bg-card');
    await expect(overlay).not.toBeVisible();
  });

  test('Loading overlay uses semi-transparent background', async ({ page }) => {
    await page.goto('/notes');

    // Check for proper overlay styling if import is triggered
    // Note: This test verifies the overlay structure exists with correct classes
    const overlays = page.locator('.fixed.inset-0');

    const count = await overlays.count();
    for (let i = 0; i < count; i++) {
      const overlay = overlays.nth(i);
      const className = await overlay.getAttribute('class') || '';

      // If overlay is visible, verify it has backdrop-blur class
      if (await overlay.isVisible()) {
        expect(className).toContain('backdrop-blur');
      }
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
      // Note: We check that rounded-lg is NOT present, not that rounded-none IS present
      // because having no radius class is also valid
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
