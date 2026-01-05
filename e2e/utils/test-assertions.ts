/**
 * Test Assertions Utility
 * Custom assertions for E2E tests
 * 
 * @module e2e/utils/test-assertions
 */

import { expect, Locator, Page } from '@playwright/test';

/**
 * Assert that an element becomes visible within timeout
 */
export async function assertVisible(
    locator: Locator,
    message?: string,
    timeout: number = 5000
): Promise<void> {
    await expect(locator, message).toBeVisible({ timeout });
}

/**
 * Assert that an element becomes hidden within timeout
 */
export async function assertHidden(
    locator: Locator,
    message?: string,
    timeout: number = 5000
): Promise<void> {
    await expect(locator, message).toBeHidden({ timeout });
}

/**
 * Assert that a toast notification appears with specific content
 */
export async function assertToast(
    page: Page,
    expectedText: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success'
): Promise<void> {
    // Adjust selector based on your toast component (e.g., sonner)
    const toastSelector = `[data-sonner-toast][data-type="${type}"]`;
    const toast = page.locator(toastSelector).filter({ hasText: expectedText });

    await expect(toast, `Expected ${type} toast with text: ${expectedText}`).toBeVisible({ timeout: 5000 });
}

/**
 * Assert that no error toast appears
 */
export async function assertNoErrorToast(page: Page, waitMs: number = 2000): Promise<void> {
    await page.waitForTimeout(waitMs);
    const errorToasts = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(errorToasts, 'No error toasts should be visible').toHaveCount(0);
}

/**
 * Assert that a file appears in the sidebar
 */
export async function assertFileInSidebar(
    page: Page,
    fileName: string,
    timeout: number = 5000
): Promise<void> {
    // Adjust selector based on your sidebar component
    const fileItem = page.locator('[data-testid="file-tree-item"]').filter({ hasText: fileName });
    await expect(fileItem, `File "${fileName}" should appear in sidebar`).toBeVisible({ timeout });
}

/**
 * Assert that a file does NOT appear in the sidebar
 */
export async function assertFileNotInSidebar(
    page: Page,
    fileName: string,
    timeout: number = 2000
): Promise<void> {
    await page.waitForTimeout(timeout);
    const fileItem = page.locator('[data-testid="file-tree-item"]').filter({ hasText: fileName });
    await expect(fileItem, `File "${fileName}" should NOT appear in sidebar`).toHaveCount(0);
}

/**
 * Assert that an agent is selected
 */
export async function assertAgentSelected(
    page: Page,
    agentName: string
): Promise<void> {
    const agentSelector = page.locator('[data-testid="agent-selector"]');
    await expect(agentSelector).toContainText(agentName);
}

/**
 * Assert that a model is available in the model selector
 */
export async function assertModelAvailable(
    page: Page,
    modelName: string
): Promise<void> {
    // Click to open model selector
    const modelSelector = page.locator('[data-testid="model-selector"]');
    await modelSelector.click();

    // Check for model in dropdown
    const modelOption = page.locator('[data-testid="model-option"]').filter({ hasText: modelName });
    await expect(modelOption, `Model "${modelName}" should be available`).toBeVisible();

    // Close dropdown by pressing Escape
    await page.keyboard.press('Escape');
}

/**
 * Assert progress indicator is visible with expected state
 */
export async function assertProgressVisible(
    page: Page,
    expectedState?: {
        minProgress?: number;
        maxProgress?: number;
        currentItem?: string;
    }
): Promise<void> {
    const progressBar = page.locator('[data-testid="progress-indicator"]');
    await expect(progressBar, 'Progress indicator should be visible').toBeVisible();

    if (expectedState?.currentItem) {
        await expect(progressBar).toContainText(expectedState.currentItem);
    }
}

/**
 * Assert that sync is complete
 */
export async function assertSyncComplete(
    page: Page,
    timeout: number = 30000
): Promise<void> {
    // Look for sync complete indicator
    const syncStatus = page.locator('[data-testid="sync-status"]');
    await expect(syncStatus, 'Sync should complete').toContainText(/synced|complete/i, { timeout });
}

/**
 * Assert that the page is in a specific workspace
 */
export async function assertWorkspace(
    page: Page,
    workspace: 'ide' | 'notes' | 'knowledge' | 'study' | 'hub'
): Promise<void> {
    // Check URL or workspace indicator
    await expect(page).toHaveURL(new RegExp(`/${workspace}`, 'i'));
}

/**
 * Assert API key is configured for provider
 */
export async function assertApiKeyConfigured(
    page: Page,
    provider: string
): Promise<void> {
    // Navigate to settings or check provider badge
    const providerBadge = page.locator(`[data-testid="provider-${provider.toLowerCase()}-status"]`);
    await expect(providerBadge).toContainText(/configured|active/i);
}
