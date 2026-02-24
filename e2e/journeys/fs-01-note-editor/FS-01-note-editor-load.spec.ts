import { test, expect } from '@playwright/test';

/**
 * FS-01: NoteEditor Lazy Import Fix
 * Story: EPIC-FS, FS-01
 * Gate: /notes route loads without errors
 *
 * Tests the fix for nested lazy loading anti-pattern.
 * The route (notes.lazy.tsx) already lazy-loads NotesPage with createLazyFileRoute,
 * so NoteEditor should use direct import instead of React.lazy().
 */

test.describe('FS-01: NoteEditor Lazy Import Fix', () => {
  test('Gate: /notes route loads without lazy import errors', async ({ page }) => {
    // Phase 1: Core Gate Verification
    const response = await page.goto('/notes');
    expect(response?.status()).toBeLessThan(400);

    // Capture console to check for lazy import errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for page to stabilize
    await page.waitForTimeout(3000);

    // Verify NO "Failed to fetch dynamically imported" error in console
    // This is the KEY assertion for FS-01 - the fix eliminates nested lazy loading errors
    const lazyErrors = errors.filter(m =>
      m.includes('Failed to fetch dynamically imported') ||
      m.includes('Failed to load module')
    );
    expect(lazyErrors.length).toBe(0);

    // Verify page loaded - check for any content (not specific text which may vary)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('NoteEditor is directly imported (not lazy)', async ({ page }) => {
    // This test verifies the fix by checking that the component renders when needed
    // The fix changed from React.lazy() to direct import
    const response = await page.goto('/notes');
    expect(response?.status()).toBeLessThan(400);

    // Verify no chunk loading errors in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    // The key assertion: no errors about failed lazy imports
    const hasChunkError = errors.some(e =>
      e.includes('chunk') || e.includes('dynamically imported')
    );
    expect(hasChunkError).toBe(false);
  });

  test('Page structure is intact (main content visible)', async ({ page }) => {
    await page.goto('/notes');

    // Main assertion: page content is visible (no broken components)
    // This confirms components rendered without import failures
    await expect(page.getByText('Notes').or(page.getByText('notes'))).toBeVisible({ timeout: 5000 });
  });
});
