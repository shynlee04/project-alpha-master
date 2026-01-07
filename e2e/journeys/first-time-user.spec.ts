/**
 * Journey 1: First-Time User E2E Tests
 * 
 * Tests the first-time user flow: open app → set Gemini key → confirm key works → start RAG
 * 
 * @see _bmad-output/product-health/journey-failure-matrix.md
 * @see _bmad-output/product-health/acceptance-criteria.md
 */

import { test, expect } from '@playwright/test';

test.describe('Journey 1: First-Time User', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all storage for fresh start
    await page.evaluate(() => {
      localStorage.clear();
      indexedDB.deleteDatabase('via-gent-db');
    });
  });

  test.describe('P0-001: SSR Vault Bypass', () => {
    test('credentials load after hydration without error', async ({ page }) => {
      await page.goto('/knowledge');
      
      // Should show loading state, not error
      await expect(page.locator('text=Loading your knowledge base')).toBeVisible({ timeout: 5000 });
      
      // Should NOT show credential errors
      await expect(page.locator('text=Vault not initialized')).not.toBeVisible();
      await expect(page.locator('text=Key not found')).not.toBeVisible();
    });
  });

  test.describe('P0-002: Connection Test Timeout', () => {
    test('connection test times out after 10 seconds', async ({ page }) => {
      await page.goto('/settings/providers');
      await page.click('text=Configure >> nth=0'); // Google/Gemini
      
      await page.fill('input[type="password"]', 'invalid-key-12345');
      await page.click('button:has-text("Save")');
      
      // Should show loading indicator
      await expect(page.locator('text=Testing connection')).toBeVisible();
      
      // Should either succeed or timeout within 15s
      await expect(page.locator('text=Connection failed')).toBeVisible({ timeout: 15000 });
      
      // Should NOT hang indefinitely
    });

    test('distinguishes 401 from timeout', async ({ page }) => {
      await page.goto('/settings/providers');
      await page.click('text=Configure >> nth=0');
      
      // Use a key that will trigger 401 specifically
      await page.fill('input[type="password"]', 'sk-test-invalid');
      await page.click('button:has-text("Save")');
      
      // Should show specific error for invalid key
      const errorText = await page.locator('[role="alert"]').textContent();
      expect(errorText).toMatch(/invalid|401|unauthorized/i);
    });
  });

  test.describe('P0-003: Key Format Validation', () => {
    test('shows warning for invalid Gemini key format', async ({ page }) => {
      await page.goto('/settings/providers');
      await page.click('text=Configure >> nth=0'); // Google/Gemini
      
      await page.fill('input[type="password"]', 'not-a-valid-gemini-key');
      await page.click('button:has-text("Save")');
      
      // Should show warning dialog
      await expect(page.locator('text=doesn\'t look like a valid')).toBeVisible();
      await expect(page.locator('text=AIza')).toBeVisible();
      
      // Should have cancel and continue options
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
      await expect(page.locator('button:has-text("Save Anyway")')).toBeVisible();
    });

    test('allows saving with warning acknowledged', async ({ page }) => {
      await page.goto('/settings/providers');
      await page.click('text=Configure >> nth=0');
      
      await page.fill('input[type="password"]', 'not-a-valid-key');
      await page.click('button:has-text("Save")');
      
      // Acknowledge warning
      await page.click('button:has-text("Save Anyway")');
      
      // Should save successfully (or fail with network error, not format error)
      await expect(page.locator('text=configured')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('P1-001: Progress Indicator During Model Fetch', () => {
    test('shows progress during model fetch', async ({ page }) => {
      await page.goto('/settings/providers');
      await page.click('text=Configure >> nth=0');
      
      // Enter valid key
      await page.fill('input[type="password"]', process.env.VALID_GEMINI_KEY || 'test-key');
      await page.click('button:has-text("Save")');
      
      // Should show loading/progress state
      await expect(page.locator('text=Fetching models')).toBeVisible({ timeout: 5000 });
      
      // Should NOT just show spinner without context
      const loadingText = await page.locator('[role="status"]').textContent();
      expect(loadingText).toMatch(/model|loading|fetch/i);
    });
  });

  test.describe('P1-002: Knowledge Empty State', () => {
    test('shows guidance to add first source', async ({ page }) => {
      await page.goto('/knowledge');
      
      // Should show empty state with CTA
      await expect(page.locator('text=Start building your knowledge base')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Add your first source')).toBeVisible();
      
      // Should have primary CTA
      await expect(page.locator('button:has-text("Add your first source")')).toBeVisible();
    });

    test('shows source picker with options', async ({ page }) => {
      await page.goto('/knowledge');
      await page.click('button:has-text("Add your first source")');
      
      // Should show source options
      await expect(page.locator('text=Upload PDF')).toBeVisible();
      await expect(page.locator('text=Import from URL')).toBeVisible();
      await expect(page.locator('text=Create new note')).toBeVisible();
    });
  });

  test.describe('P1-003: User-Friendly Vault Errors', () => {
    test('shows user-friendly error for vault issues', async ({ page }) => {
      // Simulate vault error scenario
      await page.evaluate(() => {
        // Corrupt localStorage to trigger vault error
        localStorage.setItem('vg_vp_v3', 'invalid');
      });
      
      await page.goto('/settings/providers');
      await page.click('text=Configure >> nth=0');
      
      // Try to save - should show user-friendly error
      await page.fill('input[type="password"]', 'test-key');
      await page.click('button:has-text("Save")');
      
      // Should NOT show "Vault not initialized"
      await expect(page.locator('text=Vault not initialized')).not.toBeVisible();
      
      // Should show user-friendly message
      const errorText = await page.locator('[role="alert"]').textContent();
      expect(errorText).not.toMatch(/vault|initialization|encryption/i);
    });
  });

  test.describe('Full Happy Path', () => {
    test('completes first-time user journey successfully', async ({ page }) => {
      // Step 1: Open app
      await page.goto('/');
      await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 10000 });
      
      // Step 2: Navigate to settings
      await page.click('button:has-text("Settings")');
      await expect(page.locator('text=Providers')).toBeVisible();
      
      // Step 3: Configure Gemini
      await page.click('text=Providers');
      await page.click('text=Configure >> nth=0');
      
      // Step 4: Enter valid key
      const validKey = process.env.VALID_GEMINI_KEY;
      if (validKey) {
        await page.fill('input[type="password"]', validKey);
        await page.click('button:has-text("Save")');
        
        // Step 5: Verify success
        await expect(page.locator('text=configured and verified')).toBeVisible({ timeout: 15000 });
        
        // Step 6: Navigate to Knowledge workspace
        await page.click('[data-testid="workspace-switcher"] >> text=Knowledge');
        
        // Step 7: Add first source
        await page.click('button:has-text("Add your first source")');
        await page.click('text=Create new note');
        
        // Step 8: Create a note with content
        await page.fill('[contenteditable]', 'This is a test note about AI and machine learning.');
        await page.click('button:has-text("Save")');
        
        // Step 9: Wait for indexing
        await expect(page.locator('text=Indexing')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=ready')).toBeVisible({ timeout: 30000 });
        
        // Step 10: Ask RAG question
        await page.fill('[placeholder*="Ask"]', 'What is this note about?');
        await page.click('button:has-text("Send")');
        
        // Should get response with citations
        await expect(page.locator('text=AI and machine learning')).toBeVisible({ timeout: 30000 });
      } else {
        console.log('Skipping full path test - no VALID_GEMINI_KEY set');
        test.skip();
      }
    });
  });
});
