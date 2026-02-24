/**
 * Page Object Model: Knowledge Workspace
 *
 * @module e2e/pages/KnowledgePage
 */

import { Page, Locator, expect } from '@playwright/test';

export class KnowledgePage {
    readonly page: Page;
    readonly url: string = '/knowledge';

    // Locators
    readonly knowledgeBase: Locator;
    readonly searchInput: Locator;
    readonly searchResults: Locator;
    readonly documentList: Locator;
    readonly documentViewer: Locator;
    readonly indexButton: Locator;
    readonly agentSelector: Locator;
    readonly chatPanel: Locator;
    readonly canvas: Locator;
    readonly addSourceButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators
        this.knowledgeBase = page.locator('[data-testid="knowledge-base"]');
        this.searchInput = page.locator('[data-testid="knowledge-search-input"]');
        this.searchResults = page.locator('[data-testid="search-results"]');
        this.documentList = page.locator('[data-testid="document-list"]');
        this.documentViewer = page.locator('[data-testid="document-viewer"]');
        this.indexButton = page.getByRole('button', { name: /index|sync/i });
        this.agentSelector = page.locator('[data-testid="agent-selector"]');
        this.chatPanel = page.locator('[data-testid="chat-panel"]');
        this.canvas = page.locator('[data-testid="knowledge-canvas"]');
        this.addSourceButton = page.getByRole('button', { name: /add source|upload/i });
    }

    /**
     * Navigate to Knowledge workspace
     */
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.waitForLoad();
    }

    /**
     * Wait for Knowledge workspace to fully load
     */
    async waitForLoad(): Promise<void> {
        await expect(this.knowledgeBase).toBeVisible({ timeout: 10000 });
    }

    /**
     * Search knowledge base
     */
    async search(query: string): Promise<void> {
        await this.searchInput.fill(query);
        await this.page.keyboard.press('Enter');

        // Wait for search results
        await expect(this.searchResults).toBeVisible({ timeout: 5000 });
    }

    /**
     * Get search results
     */
    async getSearchResults(): Promise<string[]> {
        const results = await this.searchResults.allTextContents();
        return results;
    }

    /**
     * Open a document from the list
     */
    async openDocument(documentName: string): Promise<void> {
        const docItem = this.documentList.getByRole('listitem', { name: documentName });
        await docItem.click();

        // Wait for document viewer to load
        await expect(this.documentViewer).toBeVisible();
    }

    /**
     * Get current document content
     */
    async getDocumentContent(): Promise<string> {
        const content = await this.documentViewer.innerText();
        return content;
    }

    /**
     * Add a source document (PDF, URL, etc.)
     */
    async addSource(sourceType: 'pdf' | 'url' | 'text', source: string): Promise<void> {
        await this.addSourceButton.click();

        // Select source type
        await this.page.getByRole('menuitem', { name: new RegExp(sourceType, 'i') }).click();

        // Input source based on type
        if (sourceType === 'url') {
            const urlInput = this.page.getByRole('textbox', { name: /url|link/i });
            await urlInput.fill(source);
        } else if (sourceType === 'text') {
            const textInput = this.page.getByRole('textbox', { name: /content|text/i });
            await textInput.fill(source);
        }

        // For PDF, file picker would open (requires FSA mock)

        // Submit
        await this.page.getByRole('button', { name: /add|upload|index/i }).click();

        // Wait for processing
        await this.page.waitForTimeout(2000);
    }

    /**
     * Trigger indexing of knowledge base
     */
    async startIndexing(): Promise<void> {
        await this.indexButton.click();

        // Wait for indexing to start
        const progressIndicator = this.page.locator('[data-testid="index-progress"]');
        await expect(progressIndicator).toBeVisible();
    }

    /**
     * Wait for indexing to complete
     */
    async waitForIndexingComplete(timeout: number = 60000): Promise<void> {
        const progressIndicator = this.page.locator('[data-testid="index-progress"]');
        await expect(progressIndicator).toContainText(/complete|done|finished/i, { timeout });
    }

    /**
     * Select agent for knowledge chat
     */
    async selectAgent(agentName: string): Promise<void> {
        await this.agentSelector.click();
        const agentOption = this.page.getByRole('option', { name: agentName });
        await agentOption.click();
    }

    /**
     * Send message to knowledge chat
     */
    async sendChatMessage(message: string): Promise<void> {
        const chatInput = this.chatPanel.getByRole('textbox', { name: /message|ask|query/i });
        await chatInput.fill(message);
        await chatInput.press('Enter');

        // Wait for response
        await this.page.waitForTimeout(2000);
    }

    /**
     * Get chat messages
     */
    async getChatMessages(): Promise<string[]> {
        const messages = await this.chatPanel.locator('[data-testid="chat-message"]').allTextContents();
        return messages;
    }

    /**
     * Get list of indexed documents
     */
    async getDocumentList(): Promise<string[]> {
        const docs = await this.documentList.allTextContents();
        return docs;
    }

    /**
     * Assert document exists in knowledge base
     */
    async assertDocumentExists(documentName: string): Promise<void> {
        const docItem = this.documentList.getByRole('listitem', { name: documentName });
        await expect(docItem).toBeVisible();
    }

    /**
     * Assert search result contains text
     */
    async assertSearchResultContains(text: string): Promise<void> {
        await expect(this.searchResults).toContainText(text);
    }

    /**
     * Get indexing progress percentage
     */
    async getIndexingProgress(): Promise<number> {
        const progressText = await this.page.locator('[data-testid="index-progress"]').innerText();
        const match = progressText.match(/(\d+)%/);
        return match ? parseInt(match[1]) : 0;
    }
}
