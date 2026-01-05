/**
 * Sanity Test - Verify E2E Framework Works
 * 
 * @module e2e/journeys/sanity.journey.spec
 */

import { test, expect } from '@playwright/test';

test.describe('Sanity: E2E Framework Verification', () => {

    test('sanity-001: Playwright framework is working', async ({ page }) => {
        // Just verify we can navigate to the app
        await page.goto('/');

        // Expect page to load (check for any element that should exist)
        await expect(page).toHaveTitle(/.*/);
    });

    test('sanity-002: Can navigate to Notes workspace', async ({ page }) => {
        await page.goto('/notes');

        // Expect URL to contain notes
        await expect(page).toHaveURL(/notes/);
    });

    test('sanity-003: Can navigate to IDE workspace', async ({ page }) => {
        await page.goto('/ide');

        // Expect URL to contain ide
        await expect(page).toHaveURL(/ide/);
    });

});
