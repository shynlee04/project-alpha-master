import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for E2E Validation Suite
 * Course Correction Phase 0 - Verification Infrastructure
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    // Test directory
    testDir: './e2e/journeys',

    // Timeout for each test
    timeout: 30 * 1000,

    // Timeout for assertions
    expect: {
        timeout: 5 * 1000,
    },

    // Run tests in parallel
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Number of workers
    workers: process.env.CI ? 1 : undefined,

    // Reporter
    reporter: [
        ['html', { outputFolder: 'e2e/results/html-report' }],
        ['json', { outputFile: 'e2e/results/results.json' }],
        ['list'],
    ],

    // Global setup
    globalSetup: undefined, // Add later if needed

    // Output directory for test artifacts
    outputDir: 'e2e/results/test-artifacts',

    // Shared settings for all projects
    use: {
        // Base URL for the app
        baseURL: 'http://localhost:3000',

        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Video on failure
        video: 'on-first-retry',

        // Action timeout
        actionTimeout: 10 * 1000,
    },

    // Configure projects for different browsers/viewports
    projects: [
        // Desktop Chrome
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        // Desktop Firefox
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },

        // Desktop Safari
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },

        // Mobile Chrome (for responsive testing)
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },

        // Mobile Safari (for responsive testing)
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 12'] },
        },

        // Tablet
        {
            name: 'tablet',
            use: { ...devices['iPad (gen 7)'] },
        },
    ],

    // Web server to run before tests
    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
