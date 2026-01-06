/**
 * IDE Workspace - Comprehensive E2E Test Suite
 *
 * @module e2e/journeys/ide-workspace.journey.spec
 */

import { test, expect } from '@playwright/test';
import { IDEPage } from '../pages/IDEPage';

test.describe('IDE Workspace: Critical Path', () => {
    let idePage: IDEPage;

    test.beforeEach(async ({ page }) => {
        idePage = new IDEPage(page);
        await idePage.goto();
    });

    /**
     * IDE-001: Can mount project directory
     */
    test('IDE-001: Can mount project directory', async ({ page }) => {
        // Note: Real mount requires FSA mock
        // This test verifies mount button exists and is clickable
        await expect(idePage.mountProjectButton).toBeVisible();
        await idePage.mountProjectButton.click();

        // Expect mount flow to initiate (dialog or prompt)
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible({ timeout: 5000 });
    });

    /**
     * IDE-002: Can open file from file tree
     */
    test('IDE-002: Can open file from file tree', async ({ page }) => {
        // Assuming test project is already mounted or using mock
        // For now, verify file tree exists
        await expect(idePage.fileTree).toBeVisible();

        // TODO: After mounting project, test opening actual file
        test.skip(true, 'Requires mounted project with files');
    });

    /**
     * IDE-003: Can edit file in editor
     */
    test('IDE-003: Can edit file in editor', async ({ page }) => {
        // Open a file first (IDE-002)
        // TODO: For now, verify editor exists
        await expect(idePage.editor).toBeVisible();

        // Test editing capabilities
        await idePage.setEditorContent('console.log("Hello, World!");');
        const content = await idePage.getEditorContent();
        expect(content).toContain('Hello, World!');

        test.skip(true, 'Requires file to be opened first');
    });

    /**
     * IDE-004: Changes sync to local filesystem
     */
    test('IDE-004: Changes sync to local filesystem', async ({ page }) => {
        // 1. Open file
        // 2. Make edit
        // 3. Save file
        // 4. Verify sync status shows "synced"
        // 5. Use mock FSA to verify content on disk

        await idePage.saveFile();
        await idePage.waitForSyncComplete();

        const status = await idePage.getStatusText();
        expect(status.toLowerCase()).toContain('sync');

        test.skip(true, 'Requires FSA mock to verify disk content');
    });

    /**
     * IDE-005: Can create new file
     */
    test('IDE-005: Can create new file', async ({ page }) => {
        const testFileName = 'test-new-file.ts';

        await idePage.createNewFile(testFileName);

        // Verify file appears in file tree
        await idePage.assertFileExists(testFileName);

        test.skip(true, 'Requires mounted project');
    });

    /**
     * IDE-006: Can delete file
     */
    test('IDE-006: Can delete file', async ({ page }) => {
        const testFileName = 'test-delete-me.ts';

        // Create file first
        await idePage.createNewFile(testFileName);
        await idePage.assertFileExists(testFileName);

        // Delete file
        await idePage.deleteFile(testFileName);

        // Verify file is gone
        await idePage.assertFileNotExists(testFileName);

        test.skip(true, 'Requires mounted project');
    });
});

test.describe('IDE Workspace: Terminal', () => {
    let idePage: IDEPage;

    test.beforeEach(async ({ page }) => {
        idePage = new IDEPage(page);
        await idePage.goto();
    });

    /**
     * IDE-Terminal-001: Terminal panel is visible
     */
    test('IDE-Terminal-001: Terminal panel is visible', async () => {
        await expect(idePage.terminal).toBeVisible();
    });

    /**
     * IDE-Terminal-002: Can execute command in terminal
     */
    test('IDE-Terminal-002: Can execute command in terminal', async () => {
        // Execute simple command
        await idePage.executeCommand('echo "Hello from terminal"');

        // Get output
        const output = await idePage.getTerminalOutput();
        expect(output).toContain('Hello from terminal');

        test.skip(true, 'Requires WebContainer to be booted');
    });

    /**
     * IDE-Terminal-003: Terminal shows command output
     */
    test('IDE-Terminal-003: Terminal shows command output', async () => {
        await idePage.executeCommand('ls -la');

        const output = await idePage.getTerminalOutput();
        expect(output.length).toBeGreaterThan(0);

        test.skip(true, 'Requires WebContainer to be booted');
    });
});

test.describe('IDE Workspace: Agent Integration', () => {
    let idePage: IDEPage;

    test.beforeEach(async ({ page }) => {
        idePage = new IDEPage(page);
        await idePage.goto();
    });

    /**
     * IDE-Agent-001: Agent panel is accessible
     */
    test('IDE-Agent-001: Agent panel is accessible', async () => {
        await expect(idePage.agentPanel).toBeVisible();
    });

    /**
     * IDE-Agent-002: Can select agent
     */
    test('IDE-Agent-002: Can select agent', async () => {
        const agentSelector = idePage.page.locator('[data-testid="agent-selector"]');
        await expect(agentSelector).toBeVisible();

        // Click to open dropdown
        await agentSelector.click();

        // Verify agents are listed
        const agentOptions = idePage.page.locator('[data-testid="agent-option"]');
        await expect(agentOptions.first()).toBeVisible();

        test.skip(true, 'Requires agents to be configured');
    });

    /**
     * IDE-Agent-003: Can execute agent tool
     */
    test('IDE-Agent-003: Can execute agent tool', async ({ page }) => {
        // 1. Select agent
        // 2. Send message to agent
        // 3. Agent executes tool (e.g., read_file)
        // 4. Verify tool result

        const chatInput = idePage.chatPanel.getByRole('textbox', { name: /message|ask/i });
        await chatInput.fill('Read the package.json file');
        await chatInput.press('Enter');

        // Wait for agent response
        await page.waitForTimeout(5000);

        // Verify tool execution indicator or result
        const toolResult = page.locator('[data-testid="tool-result"]');
        await expect(toolResult).toBeVisible({ timeout: 10000 });

        test.skip(true, 'Requires agent with configured tools and API key');
    });
});

test.describe('IDE Workspace: File Operations', () => {
    let idePage: IDEPage;

    test.beforeEach(async ({ page }) => {
        idePage = new IDEPage(page);
        await idePage.goto();
    });

    /**
     * IDE-File-001: Can open multiple files
     */
    test('IDE-File-001: Can open multiple files', async () => {
        // Open file 1
        await idePage.openFile('file1.ts');

        // Open file 2
        await idePage.openFile('file2.ts');

        // Verify both files in open files list
        const openFiles = await idePage.getOpenFiles();
        expect(openFiles.length).toBeGreaterThanOrEqual(2);

        test.skip(true, 'Requires mounted project with multiple files');
    });

    /**
     * IDE-File-002: Can switch between open files
     */
    test('IDE-File-002: Can switch between open files', async () => {
        // Open file1.ts
        await idePage.openFile('file1.ts');
        await idePage.setEditorContent('Content 1');

        // Open file2.ts
        await idePage.openFile('file2.ts');
        await idePage.setEditorContent('Content 2');

        // Switch back to file1.ts
        await idePage.openFile('file1.ts');

        // Verify editor shows file1 content
        const content = await idePage.getEditorContent();
        expect(content).toContain('Content 1');

        test.skip(true, 'Requires mounted project with multiple files');
    });

    /**
     * IDE-File-003: Unsaved changes indicator
     */
    test('IDE-File-003: Unsaved changes indicator', async ({ page }) => {
        // Open file
        await idePage.openFile('test.ts');

        // Make edit without saving
        await idePage.appendToEditor('// Unsaved change');

        // Verify unsaved indicator (dot, asterisk, etc.)
        const unsavedIndicator = page.locator('[data-unsaved="true"]');
        await expect(unsavedIndicator).toBeVisible();

        test.skip(true, 'Requires mounted project and unsaved indicator UI');
    });
});

test.describe('IDE Workspace: Workspace Switching', () => {
    let idePage: IDEPage;

    test.beforeEach(async ({ page }) => {
        idePage = new IDEPage(page);
        await idePage.goto();
    });

    /**
     * IDE-Switch-001: Can switch to Notes workspace
     */
    test('IDE-Switch-001: Can switch to Notes workspace', async () => {
        await idePage.switchWorkspace('notes');

        await expect(idePage.page).toHaveURL(/\/notes/);
    });

    /**
     * IDE-Switch-002: Can switch to Knowledge workspace
     */
    test('IDE-Switch-002: Can switch to Knowledge workspace', async () => {
        await idePage.switchWorkspace('knowledge');

        await expect(idePage.page).toHaveURL(/\/knowledge/);
    });

    /**
     * IDE-Switch-003: Can switch to Study workspace
     */
    test('IDE-Switch-003: Can switch to Study workspace', async () => {
        await idePage.switchWorkspace('study');

        await expect(idePage.page).toHaveURL(/\/study/);
    });

    /**
     * IDE-Switch-004: Can return to IDE workspace
     */
    test('IDE-Switch-004: Can return to IDE workspace', async () => {
        // Switch to Notes
        await idePage.switchWorkspace('notes');

        // Switch back to IDE
        await idePage.switchWorkspace('ide');

        await expect(idePage.page).toHaveURL(/\/ide/);
    });
});
