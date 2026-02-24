/**
 * Page Object Model: IDE Workspace
 *
 * @module e2e/pages/IDEPage
 */

import { Page, Locator, expect } from '@playwright/test';

export class IDEPage {
    readonly page: Page;
    readonly url: string = '/ide';

    // Locators
    readonly fileTree: Locator;
    readonly editor: Locator;
    readonly terminal: Locator;
    readonly agentPanel: Locator;
    readonly chatPanel: Locator;
    readonly mountProjectButton: Locator;
    readonly saveButton: Locator;
    readonly openFilesList: Locator;
    readonly statusBar: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators
        this.fileTree = page.locator('[data-testid="file-tree"]');
        this.editor = page.locator('[data-testid="monaco-editor"]');
        this.terminal = page.locator('[data-testid="terminal-panel"]');
        this.agentPanel = page.locator('[data-testid="agent-panel"]');
        this.chatPanel = page.locator('[data-testid="chat-panel"]');
        this.mountProjectButton = page.getByRole('button', { name: /mount project|open project/i });
        this.saveButton = page.getByRole('button', { name: /save/i });
        this.openFilesList = page.locator('[data-testid="open-files-list"]');
        this.statusBar = page.locator('[data-testid="status-bar"]');
    }

    /**
     * Navigate to IDE workspace
     */
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.waitForLoad();
    }

    /**
     * Wait for IDE to fully load
     */
    async waitForLoad(): Promise<void> {
        await expect(this.fileTree).toBeVisible({ timeout: 10000 });
    }

    /**
     * Mount a project directory
     */
    async mountProject(projectName: string = 'test-project'): Promise<void> {
        await this.mountProjectButton.click();

        // Handle file picker dialog (requires FSA mock in real test)
        // This is a placeholder for the actual mount flow
        await expect(this.page.getByText(projectName)).toBeVisible({ timeout: 5000 });
    }

    /**
     * Open a file from the file tree
     */
    async openFile(fileName: string): Promise<void> {
        const fileItem = this.fileTree.getByRole('treeitem', { name: fileName });
        await fileItem.click();

        // Wait for editor to load file
        await expect(this.editor).toBeVisible();
    }

    /**
     * Get the current editor content
     */
    async getEditorContent(): Promise<string> {
        const editorContent = await this.editor.inputValue();
        return editorContent;
    }

    /**
     * Set editor content
     */
    async setEditorContent(content: string): Promise<void> {
        await this.editor.fill(content);
    }

    /**
     * Append content to editor
     */
    async appendToEditor(content: string): Promise<void> {
        await this.editor.press('End');
        await this.page.keyboard.type(content);
    }

    /**
     * Save the current file
     */
    async saveFile(): Promise<void> {
        await this.saveButton.click();
        // Wait for save to complete (check for status update or toast)
        await this.page.waitForTimeout(500);
    }

    /**
     * Execute command in terminal
     */
    async executeCommand(command: string): Promise<void> {
        await expect(this.terminal).toBeVisible();

        // Focus terminal
        await this.terminal.click();

        // Type command
        await this.page.keyboard.type(command);

        // Press Enter
        await this.page.keyboard.press('Enter');

        // Wait for command to execute
        await this.page.waitForTimeout(1000);
    }

    /**
     * Get terminal output
     */
    async getTerminalOutput(): Promise<string> {
        const terminalOutput = await this.terminal.innerText();
        return terminalOutput;
    }

    /**
     * Switch to a different workspace tab
     */
    async switchWorkspace(workspace: 'ide' | 'notes' | 'knowledge' | 'study' | 'hub'): Promise<void> {
        const workspaceTab = this.page.getByRole('tab', { name: new RegExp(workspace, 'i') });
        await workspaceTab.click();
    }

    /**
     * Create a new file
     */
    async createNewFile(fileName: string): Promise<void> {
        const newFileButton = this.page.getByRole('button', { name: /new file|create file/i });
        await newFileButton.click();

        // Enter filename in prompt
        await this.page.getByRole('textbox', { name: /filename|name/i }).fill(fileName);

        // Confirm
        await this.page.getByRole('button', { name: /create|ok/i }).click();
    }

    /**
     * Delete a file from file tree
     */
    async deleteFile(fileName: string): Promise<void> {
        const fileItem = this.fileTree.getByRole('treeitem', { name: fileName });

        // Right-click to show context menu
        await fileItem.click({ button: 'right' });

        // Click delete option
        await this.page.getByRole('menuitem', { name: /delete/i }).click();

        // Confirm deletion if dialog appears
        const confirmButton = this.page.getByRole('button', { name: /delete|confirm/i });
        if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
        }
    }

    /**
     * Get list of open files
     */
    async getOpenFiles(): Promise<string[]> {
        const fileElements = await this.openFilesList.allTextContents();
        return fileElements;
    }

    /**
     * Verify file exists in file tree
     */
    async assertFileExists(fileName: string): Promise<void> {
        const fileItem = this.fileTree.getByRole('treeitem', { name: fileName });
        await expect(fileItem).toBeVisible();
    }

    /**
     * Verify file does not exist in file tree
     */
    async assertFileNotExists(fileName: string): Promise<void> {
        const fileItem = this.fileTree.getByRole('treeitem', { name: fileName });
        await expect(fileItem).not.toBeVisible();
    }

    /**
     * Get current status from status bar
     */
    async getStatusText(): Promise<string> {
        const statusText = await this.statusBar.innerText();
        return statusText;
    }

    /**
     * Wait for file sync to complete
     */
    async waitForSyncComplete(timeout: number = 30000): Promise<void> {
        const syncIndicator = this.page.locator('[data-testid="sync-status"]');
        await expect(syncIndicator).toContainText(/synced|complete/i, { timeout });
    }
}
