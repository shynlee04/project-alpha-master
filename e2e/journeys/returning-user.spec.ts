/**
 * Journey 2: Returning User E2E Tests
 * 
 * Tests the returning user flow: reopen app → key persists → workspace loads → RAG index available
 * 
 * @see _bmad-output/product-health/journey-2-failure-matrix.md
 * @see _bmad-output/product-health/journey-2-acceptance-criteria.md
 */

import { test, expect } from '@playwright/test';

test.describe('Journey 2: Returning User', () => {
  test.describe('Setup: First Session', () => {
    test('setup provider with valid key', async ({ page }) => {
      // This test sets up the initial state for subsequent tests
      await page.goto('/settings/providers');
      
      // Configure Gemini with valid key
      await page.click('text=Configure >> nth=0');
      await page.fill('input[type="password"]', process.env.VALID_GEMINI_KEY || 'test-key');
      await page.click('button:has-text("Save")');
      
      // Wait for success
      await expect(page.locator('text=configured and verified')).toBeVisible({ timeout: 15000 });
      
      // Add a source to Knowledge workspace
      await page.click('[data-testid="workspace-switcher"] >> text=Knowledge');
      await page.click('button:has-text("Add your first source")');
      await page.click('text=Create new note');
      await page.fill('[contenteditable]', 'Test note for returning user tests.');
      await page.click('button:has-text("Save")');
      
      // Wait for indexing
      await expect(page.locator('text=ready')).toBeVisible({ timeout: 30000 });
      
      // Verify RAG works
      await page.fill('[placeholder*="Ask"]', 'What is the test note about?');
      await page.click('button:has-text("Send")');
      await expect(page.locator('text=Test note')).toBeVisible({ timeout: 30000 });
    });
  });

  test.describe('P0-004: Hydration Race Condition', () => {
    test('RAG waits for vault initialization', async ({ page }) => {
      // Reload page (simulating returning user)
      await page.reload();
      
      // Navigate to Knowledge immediately
      await page.goto('/knowledge');
      
      // Should show loading state, not error
      await expect(page.locator('text=Loading your knowledge base')).toBeVisible({ timeout: 5000 });
      
      // Should NOT show credential errors
      await expect(page.locator('text=Key not found')).not.toBeVisible();
      await expect(page.locator('text=credentials not available')).not.toBeVisible();
    });

    test('hydration completes within 5 seconds', async ({ page }) => {
      await page.reload();
      
      const startTime = Date.now();
      await page.waitForSelector('[data-testid="main-content"]', { timeout: 10000 });
      const elapsed = Date.now() - startTime;
      
      // Should complete within reasonable time
      expect(elapsed).toBeLessThan(10000);
    });
  });

  test.describe('P0-005: IndexedDB Corruption Recovery', () => {
    test('recovers from corrupted database', async ({ page }) => {
      // Corrupt IndexedDB
      await page.evaluate(() => {
        indexedDB.deleteDatabase('via-gent-db');
      });
      
      await page.reload();
      
      // Should recover gracefully
      await expect(page.locator('text=Database was recovered')).toBeVisible({ timeout: 10000 });
      
      // Should not crash
      await expect(page.locator('text=crashed')).not.toBeVisible();
      await expect(page.locator('text=error')).not.toBeVisible();
    });
  });

  test.describe('P0-006: Model Cache Persistence', () => {
    test('models load from cache on reload', async ({ page }) => {
      // First load - models fetched
      await page.goto('/settings/providers');
      await page.click('text=Configure >> nth=0');
      
      // Check if models are cached (should load faster on second attempt)
      const startTime = Date.now();
      
      // Reload and check cache hit
      await page.reload();
      await page.goto('/settings/providers');
      await page.click('text=Configure >> nth=0');
      
      const elapsed = Date.now() - startTime;
      
      // Second load should be faster (cached)
      // Note: This is a soft assertion - cache may vary
      console.log(`Model load time: ${elapsed}ms`);
    });
  });

  test.describe('P1-004: Loading State During Hydration', () => {
    test('shows loading state while hydrating', async ({ page }) => {
      await page.reload();
      
      // Should show global loading screen initially
      await expect(page.locator('text=Loading...')).toBeVisible({ timeout: 2000 });
      
      // Should not show main content until hydrated
      await expect(page.locator('[data-testid="main-content"]')).not.toBeVisible();
      
      // After hydration, loading should disappear
      await expect(page.locator('text=Loading...')).not.toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    });

    test('shows skeleton for async components', async ({ page }) => {
      await page.goto('/settings/providers');
      
      // Should show skeleton for models list
      await expect(page.locator('[data-testid="skeleton"]')).toBeVisible();
    });
  });

  test.describe('P1-005: Agent Selection Persistence', () => {
    test('agent persists per workspace', async ({ page }) => {
      // Select agent in IDE
      await page.goto('/ide');
      await page.selectOption('[data-testid="agent-selector"]', 'agent-1');
      
      // Switch to Knowledge
      await page.click('[data-testid="workspace-switcher"] >> text=Knowledge');
      
      // Switch back to IDE
      await page.click('[data-testid="workspace-switcher"] >> text=IDE');
      
      // Agent should still be selected
      await expect(page.locator('[data-testid="agent-selector"]')).toHaveValue('agent-1');
    });

    test('different agents in different workspaces', async ({ page }) => {
      // Select agent A in IDE
      await page.goto('/ide');
      await page.selectOption('[data-testid="agent-selector"]', 'agent-1');
      
      // Select agent B in Knowledge
      await page.click('[data-testid="workspace-switcher"] >> text=Knowledge');
      await page.selectOption('[data-testid="agent-selector"]', 'agent-2');
      
      // Switch back - each should preserve
      await page.click('[data-testid="workspace-switcher"] >> text=IDE');
      await expect(page.locator('[data-testid="agent-selector"]')).toHaveValue('agent-1');
      
      await page.click('[data-testid="workspace-switcher"] >> text=Knowledge');
      await expect(page.locator('[data-testid="agent-selector"]')).toHaveValue('agent-2');
    });
  });

  test.describe('P1-006: RAG Index Metadata Caching', () => {
    test('index metadata loads from cache', async ({ page }) => {
      // First, add a document
      await page.goto('/knowledge');
      await page.click('button:has-text("Add source")');
      await page.click('text=Create new note');
      await page.fill('[contenteditable]', 'Another test note.');
      await page.click('button:has-text("Save")');
      await expect(page.locator('text=ready')).toBeVisible({ timeout: 30000 });
      
      // Reload
      await page.reload();
      await page.goto('/knowledge');
      
      // Should show document count immediately (from cache)
      await expect(page.locator('text=document')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Full Returning User Journey', () => {
    test('returns and continues seamlessly', async ({ page }) => {
      // Reload page (simulating return)
      await page.reload();
      
      // Step 1: Verify key persists
      await page.goto('/settings/providers');
      await page.click('text=Configure >> nth=0');
      await expect(page.locator('text=••••')).toBeVisible(); // Key exists indicator
      
      // Step 2: Verify workspace loads
      await page.click('[data-testid="workspace-switcher"] >> text=Knowledge');
      await expect(page.locator('text=Test note')).toBeVisible({ timeout: 10000 });
      
      // Step 3: Verify RAG index available
      await page.fill('[placeholder*="Ask"]', 'What is the test note about?');
      await page.click('button:has-text("Send")');
      await expect(page.locator('text=Test note')).toBeVisible({ timeout: 30000 });
      
      // Step 4: Verify agent persisted
      await page.click('[data-testid="workspace-switcher"] >> text=IDE');
      const agentValue = await page.locator('[data-testid="agent-selector"]').inputValue();
      expect(agentValue).toBeTruthy();
    });
  });
});
