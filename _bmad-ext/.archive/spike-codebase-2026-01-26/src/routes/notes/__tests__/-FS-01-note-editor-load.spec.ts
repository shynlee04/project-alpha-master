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
  test('Gate: /notes route loads without errors', async ({ page }) => {
    // Phase 1: Core Gate Verification
    const response = await page.goto('/notes');
    expect(response?.status()).toBeLessThan(400);

    // Verify no "Failed to fetch dynamically imported" error
    await expect(page.locator('text=Failed to fetch dynamically imported')).not.toBeVisible();
    await expect(page.locator('text=NoteEditor')).not.toBeVisible(); // Error message not shown

    // Verify page actually loaded
    await expect(page.locator('text=Notes').or(page.getByText('notes'))).toBeVisible({ timeout: 5000 });
  });

  test('NoteEditor component renders', async ({ page }) => {
    await page.goto('/notes');

    // Wait for component to load
    await page.waitForTimeout(1000);

    // Verify editor is present (BlockNote editor with contenteditable)
    const editor = page.locator('[contenteditable="true"]').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
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
    await expect(page.locator('text=Notes').or(page.getByText('notes'))).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[contenteditable="true"]').first()).toBeVisible({ timeout: 5000 });
  });
});
