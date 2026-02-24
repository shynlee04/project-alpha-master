/**
 * Page Object Model: Notes Workspace
 *
 * @module e2e/pages/NotesPage
 */

import { Page, Locator, expect } from '@playwright/test';

export class NotesPage {
    readonly page: Page;
    readonly url: string = '/notes';

    // Locators
    readonly notesList: Locator;
    readonly noteEditor: Locator;
    readonly noteTitle: Locator;
    readonly noteContent: Locator;
    readonly syncButton: Locator;
    readonly newNoteButton: Locator;
    readonly saveNoteButton: Locator;
    readonly deleteNoteButton: Locator;
    readonly agentSelector: Locator;
    readonly aiGenerateButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators
        this.notesList = page.locator('[data-testid="notes-list"]');
        this.noteEditor = page.locator('[data-testid="note-editor"]');
        this.noteTitle = page.locator('[data-testid="note-title"]');
        this.noteContent = page.locator('[data-testid="note-content"]');
        this.syncButton = page.getByRole('button', { name: /sync|mount folder/i });
        this.newNoteButton = page.getByRole('button', { name: /new note|create note/i });
        this.saveNoteButton = page.getByRole('button', { name: /save/i });
        this.deleteNoteButton = page.getByRole('button', { name: /delete/i });
        this.agentSelector = page.locator('[data-testid="agent-selector"]');
        this.aiGenerateButton = page.getByRole('button', { name: /generate|ai|✨/i });
    }

    /**
     * Navigate to Notes workspace
     */
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.waitForLoad();
    }

    /**
     * Wait for Notes workspace to fully load
     */
    async waitForLoad(): Promise<void> {
        await expect(this.notesList).toBeVisible({ timeout: 10000 });
    }

    /**
     * Mount/sync a folder
     */
    async mountFolder(): Promise<void> {
        await this.syncButton.click();

        // Handle folder picker (requires FSA mock in real test)
        // Placeholder for actual mount flow
    }

    /**
     * Create a new note
     */
    async createNote(title: string, content: string = ''): Promise<void> {
        await this.newNoteButton.click();

        // Wait for editor to appear
        await expect(this.noteEditor).toBeVisible();

        // Set title
        await this.noteTitle.fill(title);

        // Set content if provided
        if (content) {
            await this.noteContent.fill(content);
        }

        // Save note
        await this.saveNoteButton.click();
    }

    /**
     * Open an existing note
     */
    async openNote(noteTitle: string): Promise<void> {
        const noteItem = this.notesList.getByRole('listitem', { name: noteTitle });
        await noteItem.click();

        // Wait for editor to load
        await expect(this.noteEditor).toBeVisible();
    }

    /**
     * Get current note title
     */
    async getNoteTitle(): Promise<string> {
        const title = await this.noteTitle.inputValue();
        return title;
    }

    /**
     * Get current note content
     */
    async getNoteContent(): Promise<string> {
        const content = await this.noteContent.inputValue();
        return content;
    }

    /**
     * Edit note content
     */
    async editNoteContent(content: string): Promise<void> {
        await this.noteContent.fill(content);
    }

    /**
     * Append content to note
     */
    async appendToNote(content: string): Promise<void> {
        await this.noteContent.press('End');
        await this.noteContent.type(content);
    }

    /**
     * Save current note
     */
    async saveNote(): Promise<void> {
        await this.saveNoteButton.click();
        await this.page.waitForTimeout(500);
    }

    /**
     * Delete current note
     */
    async deleteNote(): Promise<void> {
        await this.deleteNoteButton.click();

        // Confirm deletion if dialog appears
        const confirmButton = this.page.getByRole('button', { name: /delete|confirm/i });
        if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
        }
    }

    /**
     * Get list of all notes
     */
    async getNotesList(): Promise<string[]> {
        const noteElements = await this.notesList.allTextContents();
        return noteElements;
    }

    /**
     * Verify note exists in list
     */
    async assertNoteExists(noteTitle: string): Promise<void> {
        const noteItem = this.notesList.getByRole('listitem', { name: noteTitle });
        await expect(noteItem).toBeVisible();
    }

    /**
     * Verify note does not exist in list
     */
    async assertNoteNotExists(noteTitle: string): Promise<void> {
        const noteItem = this.notesList.getByRole('listitem', { name: noteTitle });
        await expect(noteItem).not.toBeVisible();
    }

    /**
     * Select agent for AI generation
     */
    async selectAgent(agentName: string): Promise<void> {
        await this.agentSelector.click();
        const agentOption = this.page.getByRole('option', { name: agentName });
        await agentOption.click();
    }

    /**
     * Generate content using AI
     */
    async generateWithAI(prompt: string): Promise<void> {
        await this.aiGenerateButton.click();

        // Wait for AI prompt dialog
        const promptInput = this.page.getByRole('textbox', { name: /prompt|describe/i });
        await expect(promptInput).toBeVisible();

        // Enter prompt
        await promptInput.fill(prompt);

        // Submit
        await this.page.getByRole('button', { name: /generate|create/i }).click();

        // Wait for generation to complete (check for toast or status)
        await this.page.waitForSelector('[data-sonner-toast]', { timeout: 30000 });
    }

    /**
     * Wait for sync to complete
     */
    async waitForSyncComplete(timeout: number = 30000): Promise<void> {
        const syncIndicator = this.page.locator('[data-testid="sync-status"]');
        await expect(syncIndicator).toContainText(/synced|complete/i, { timeout });
    }

    /**
     * Get sync status
     */
    async getSyncStatus(): Promise<string> {
        const syncStatus = this.page.locator('[data-testid="sync-status"]');
        const statusText = await syncStatus.innerText();
        return statusText;
    }
}
