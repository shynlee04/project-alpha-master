/**
 * API Key Management E2E Validation Suite
 * Tests for V-003: Validates S-001, S-002, S-003
 * 
 * @module e2e/journeys/api-key-management.journey.spec
 */

import { test, expect } from '@playwright/test';
import {
    assertToast,
    assertModelAvailable,
    assertApiKeyConfigured,
} from '../utils/test-assertions';

test.describe('API Key Management', () => {

    /**
     * KEY-001: User can configure API key in settings
     */
    test('KEY-001: User can configure API key in settings', async ({ page }) => {
        // Navigate to settings
        await page.goto('/settings');

        // Look for API keys section - targeting the heading specifically to avoid ambiguity
        const apiKeysSection = page.getByRole('heading', { name: 'Providers', exact: true });
        await expect(apiKeysSection).toBeVisible({ timeout: 10000 });

        // Find the "Google Gemini" provider row and click the edit button
        // We use a more specific locator strategy to find the exact row
        // 1. Find the text "Google Gemini"
        // 2. Find the closest container that also has an "Edit provider" button
        const providerRow = page.locator('div.border > div').filter({ hasText: 'Google Gemini' });
        await expect(providerRow).toBeVisible();
        
        const editButton = providerRow.getByLabel('Edit provider');
        await editButton.click();

        // Wait for dialog to open
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('heading', { name: 'Configure API Key' })).toBeVisible();

        // Enter a mock API key
        const apiKeyInput = dialog.getByLabel('API Key');
        await apiKeyInput.fill('sk-test-mock-key-12345');

        // Click Save
        const saveButton = dialog.getByRole('button', { name: 'Save Key' });
        await saveButton.click();

        // Verify success toast for SAVING the key
        // Note: We expect the key save to succeed, but the model fetch might fail (which is the bug we are investigating)
        // or succeed if it's mocked. Since we are using a fake key against a real API (if not mocked), 
        // we expect a warning about model loading failure.
        
        // Wait for ANY toast first
        const toast = page.locator('[role="status"]'); // Sonner toast
        await expect(toast).toBeVisible();
        
        // We expect the "saved" message
        await expect(page.getByText(/API key saved/i)).toBeVisible();

        // Investigation: Check if we see the "models couldn't load" warning
        // This confirms the P0-LLM-001 issue where fetch fails but key is saved
        // If the code is working "perfectly" it might show a warning for invalid key.
        // If it's broken (silent fail), we might NOT see the warning? 
        // Actually, the current code catches and toasts warning. 
        // The issue P0-LLM-001 says "Models NOT loading".
        
        // Let's print the toast content to debug trace
        const toastText = await toast.textContent();
        console.log('Toast content:', toastText);
    });

    /**
     * KEY-002: Configured key persists after refresh
     */
    test('KEY-002: Configured key persists after refresh', async ({ page }) => {
        // Prerequisites: KEY-001 passed
        // 1. Configure key
        // 2. Refresh page
        // 3. Go to settings
        // 4. Verify key still shows as configured

        test.skip(true, 'Depends on KEY-001');
    });

    /**
     * KEY-003: Models load after key configuration
     */
    test('KEY-003: Models load after key configuration', async ({ page }) => {
        // Prerequisites: KEY-001 passed
        // 1. After key configured, navigate to chat
        // 2. Open model selector
        // 3. Verify models list populated

        await page.goto('/ide');

        // Look for model selector
        const modelSelector = page.locator('[data-testid="model-selector"], [aria-label*="model"], button:has-text("Select model")');

        // Note: This requires key to be configured first
        test.skip(true, 'Depends on KEY-001');
    });

    /**
     * KEY-004: Key works across workspaces
     */
    test('KEY-004: Key works across workspaces', async ({ page }) => {
        // 1. Configure key in IDE workspace
        await page.goto('/ide');
        // (configure key...)

        // 2. Navigate to Notes workspace
        await page.goto('/notes');

        // 3. Open chat panel
        // 4. Open model selector
        // 5. Verify same models available

        test.skip(true, 'Depends on KEY-001');
    });

    /**
     * KEY-005: Chat works with configured key
     */
    test('KEY-005: Chat works with configured key', async ({ page }) => {
        // Prerequisites: KEY-003 passed
        // 1. Select model
        // 2. Send message "Hello"
        // 3. Verify response received

        await page.goto('/ide');

        // Note: May need mock API for CI
        test.skip(true, 'Requires API mock for CI');
    });

    /**
     * KEY-006: Invalid key shows clear error
     */
    test('KEY-006: Invalid key shows clear error', async ({ page }) => {
        await page.goto('/settings');

        // 1. Enter invalid key
        // 2. Try to use (e.g., fetch models)
        // 3. Verify clear error message
        // 4. Verify reconfigure option

        test.skip(true, 'Settings page selectors needed');
    });

    /**
     * KEY-007: SSR does not break key persistence
     */
    test('KEY-007: SSR compatibility', async ({ page }) => {
        // 1. Configure key
        // 2. Navigate to trigger SSR (e.g., hard navigation)
        // 3. Return to chat
        // 4. Verify key still works

        test.skip(true, 'Depends on KEY-001');
    });

});

test.describe('API Key UI Indicators', () => {

    test('Provider status badge shows configured state', async ({ page }) => {
        await page.goto('/settings');

        // After configuring key, provider should show "Configured" badge
        // Look for status indicator

        test.skip(true, 'Settings page selectors needed');
    });

    test('Unconfigured provider shows setup prompt', async ({ page }) => {
        await page.goto('/ide');

        // If no key configured, model selector should prompt to configure
        const modelSelector = page.locator('[data-testid="model-selector"]');

        // May show "Configure API key" instead of models
        test.skip(true, 'Initial state testing needed');
    });

});
