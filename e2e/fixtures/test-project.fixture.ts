/**
 * Test Project Fixture
 * Provides test project setup and teardown helpers
 * 
 * @module e2e/fixtures/test-project.fixture
 */

import { test as base, expect } from '@playwright/test';

/**
 * Test project metadata
 */
export interface TestProject {
    id: string;
    name: string;
    createdAt: Date;
}

/**
 * Extended test fixture with project helpers
 */
export const test = base.extend<{
    testProject: TestProject;
    createTestProject: (name?: string) => Promise<TestProject>;
    deleteTestProject: (id: string) => Promise<void>;
}>({
    // Auto-create a test project for each test
    testProject: async ({ page }, use) => {
        // Create a unique project for this test
        const project: TestProject = {
            id: `test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: `Test Project ${new Date().toISOString()}`,
            createdAt: new Date(),
        };

        // Use the project in the test
        await use(project);

        // Cleanup: Delete the project after test
        // This would call your actual cleanup function
    },

    // Helper to create additional projects
    createTestProject: async ({ page }, use) => {
        const createFn = async (name?: string): Promise<TestProject> => {
            const project: TestProject = {
                id: `test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                name: name || `Test Project ${new Date().toISOString()}`,
                createdAt: new Date(),
            };
            return project;
        };

        await use(createFn);
    },

    // Helper to delete projects
    deleteTestProject: async ({ page }, use) => {
        const deleteFn = async (id: string): Promise<void> => {
            // This would call your actual delete function
            console.log(`[Fixture] Would delete project: ${id}`);
        };

        await use(deleteFn);
    },
});

export { expect };
