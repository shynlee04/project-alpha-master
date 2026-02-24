/**
 * Cross-Workspace Integration - Comprehensive E2E Test Suite
 *
 * @module e2e/journeys/cross-workspace-integration.journey.spec
 */

import { test, expect } from '@playwright/test';
import { IDEPage } from '../pages/IDEPage';
import { NotesPage } from '../pages/NotesPage';
import { KnowledgePage } from '../pages/KnowledgePage';
import { StudyPage } from '../pages/StudyPage';

test.describe('Cross-Workspace: File Sync Integration', () => {
    /**
     * XWS-File-001: File created in IDE appears in Notes
     */
    test('XWS-File-001: File created in IDE appears in Notes', async ({ page }) => {
        const idePage = new IDEPage(page);
        const notesPage = new NotesPage(page);

        // Start in IDE
        await idePage.goto();

        // Create a new file
        const fileName = 'test-cross-ws.md';
        await idePage.createNewFile(fileName);
        await idePage.setEditorContent('# Test Note\n\nCreated in IDE');
        await idePage.saveFile();

        // Switch to Notes workspace
        await idePage.switchWorkspace('notes');
        await notesPage.waitForLoad();

        // Verify file appears in Notes
        await notesPage.assertNoteExists(fileName);

        test.skip(true, 'Requires mounted project and FSA mock');
    });

    /**
     * XWS-File-002: File edited in IDE updates in Notes
     */
    test('XWS-File-002: File edited in IDE updates in Notes', async ({ page }) => {
        const idePage = new IDEPage(page);
        const notesPage = new NotesPage(page);

        // Start in IDE
        await idePage.goto();

        // Create and edit file
        const fileName = 'edit-sync-test.md';
        await idePage.createNewFile(fileName);
        await idePage.setEditorContent('# Original Content');
        await idePage.saveFile();

        // Switch to Notes and verify content
        await idePage.switchWorkspace('notes');
        await notesPage.openNote(fileName);
        const originalContent = await notesPage.getNoteContent();
        expect(originalContent).toContain('Original Content');

        // Switch back to IDE and edit
        await notesPage.page.goto('/ide');
        await idePage.openFile(fileName);
        await idePage.setEditorContent('# Edited Content');
        await idePage.saveFile();

        // Switch to Notes and verify update
        await idePage.switchWorkspace('notes');
        await notesPage.openNote(fileName);
        const editedContent = await notesPage.getNoteContent();
        expect(editedContent).toContain('Edited Content');

        test.skip(true, 'Requires mounted project and FSA mock');
    });

    /**
     * XWS-File-003: File deleted in IDE removed from Notes
     */
    test('XWS-File-003: File deleted in IDE removed from Notes', async ({ page }) => {
        const idePage = new IDEPage(page);
        const notesPage = new NotesPage(page);

        // Start in IDE
        await idePage.goto();

        // Create file
        const fileName = 'delete-test.md';
        await idePage.createNewFile(fileName);
        await idePage.saveFile();

        // Switch to Notes and verify exists
        await idePage.switchWorkspace('notes');
        await notesPage.assertNoteExists(fileName);

        // Switch back to IDE and delete
        await notesPage.page.goto('/ide');
        await idePage.deleteFile(fileName);

        // Switch to Notes and verify removed
        await idePage.switchWorkspace('notes');
        await notesPage.assertNoteNotExists(fileName);

        test.skip(true, 'Requires mounted project and FSA mock');
    });
});

test.describe('Cross-Workspace: Knowledge Sync', () => {
    /**
     * XWS-Know-001: Files in IDE indexed in Knowledge
     */
    test('XWS-Know-001: Files in IDE indexed in Knowledge', async ({ page }) => {
        const idePage = new IDEPage(page);
        const knowledgePage = new KnowledgePage(page);

        // Start in IDE
        await idePage.goto();

        // Create files with content
        await idePage.createNewFile('react-guide.md');
        await idePage.setEditorContent('# React Guide\n\nReact is a JavaScript library for building UIs.');
        await idePage.saveFile();

        // Switch to Knowledge
        await idePage.switchWorkspace('knowledge');
        await knowledgePage.waitForLoad();

        // Trigger indexing
        await knowledgePage.startIndexing();
        await knowledgePage.waitForIndexingComplete();

        // Search for content
        await knowledgePage.search('React library');

        // Verify search results
        const results = await knowledgePage.getSearchResults();
        expect(results.length).toBeGreaterThan(0);

        test.skip(true, 'Requires mounted project and indexing');
    });

    /**
     * XWS-Know-002: Knowledge search finds IDE edits
     */
    test('XWS-Know-002: Knowledge search finds IDE edits', async ({ page }) => {
        const idePage = new IDEPage(page);
        const knowledgePage = new KnowledgePage(page);

        // Start in IDE
        await idePage.goto();

        // Create and edit file
        await idePage.createNewFile('typescript-tips.md');
        await idePage.setEditorContent('# TypeScript Tips\n\nUse strict mode');
        await idePage.saveFile();

        // Switch to Knowledge and index
        await idePage.switchWorkspace('knowledge');
        await knowledgePage.startIndexing();
        await knowledgePage.waitForIndexingComplete();

        // Search for original content
        await knowledgePage.search('strict mode');
        const results1 = await knowledgePage.getSearchResults();
        expect(results1.length).toBeGreaterThan(0);

        // Edit file in IDE
        await knowledgePage.page.goto('/ide');
        await idePage.openFile('typescript-tips.md');
        await idePage.appendToEditor('\n\nEnable noImplicitAny');
        await idePage.saveFile();

        // Re-index in Knowledge
        await idePage.switchWorkspace('knowledge');
        await knowledgePage.startIndexing();
        await knowledgePage.waitForIndexingComplete();

        // Search for new content
        await knowledgePage.search('noImplicitAny');
        const results2 = await knowledgePage.getSearchResults();
        expect(results2.length).toBeGreaterThan(0);

        test.skip(true, 'Requires mounted project and re-indexing');
    });
});

test.describe('Cross-Workspace: Agent Context Sharing', () => {
    /**
     * XWS-Agent-001: Agent selection persists across workspaces
     */
    test('XWS-Agent-001: Agent selection persists across workspaces', async ({ page }) => {
        const idePage = new IDEPage(page);
        const notesPage = new NotesPage(page);
        const knowledgePage = new KnowledgePage(page);

        // Start in IDE
        await idePage.goto();

        // Select agent
        const agentSelector = page.locator('[data-testid="agent-selector"]');
        await agentSelector.click();
        await page.getByRole('option', { name: 'Code Assistant' }).click();

        // Switch to Notes
        await idePage.switchWorkspace('notes');
        await notesPage.waitForLoad();

        // Verify same agent selected
        const selectedAgent = await notesPage.agentSelector.innerText();
        expect(selectedAgent).toContain('Code Assistant');

        // Switch to Knowledge
        await notesPage.page.goto('/knowledge');
        await knowledgePage.waitForLoad();

        // Verify same agent still selected
        const selectedAgent2 = await knowledgePage.agentSelector.innerText();
        expect(selectedAgent2).toContain('Code Assistant');

        test.skip(true, 'Requires agent configuration and cross-workspace state');
    });

    /**
     * XWS-Agent-002: Agent can access context from other workspaces
     */
    test('XWS-Agent-002: Agent can access context from other workspaces', async ({ page }) => {
        const idePage = new IDEPage(page);
        const notesPage = new NotesPage(page);

        // Create content in IDE
        await idePage.goto();
        await idePage.createNewFile('project-plan.md');
        await idePage.setEditorContent('# Project Plan\n\nBuild a web app with React');
        await idePage.saveFile();

        // Switch to Notes
        await idePage.switchWorkspace('notes');

        // Ask agent about IDE content
        const chatInput = notesPage.chatPanel.getByRole('textbox', { name: /message|ask/i });
        await chatInput.fill('What is the project about? Refer to the file in IDE');
        await chatInput.press('Enter');

        // Wait for response
        await page.waitForTimeout(5000);

        // Verify agent response includes IDE context
        const messages = await notesPage.page.locator('[data-testid="chat-message"]').allTextContents();
        const lastMessage = messages[messages.length - 1];
        expect(lastMessage.toLowerCase()).toMatch(/react|web app/);

        test.skip(true, 'Requires agent with cross-workspace context awareness');
    });
});

test.describe('Cross-Workspace: Study Integration', () => {
    /**
     * XWS-Study-001: Can generate quiz from Knowledge content
     */
    test('XWS-Study-001: Can generate quiz from Knowledge content', async ({ page }) => {
        const knowledgePage = new KnowledgePage(page);
        const studyPage = new StudyPage(page);

        // Add content to Knowledge
        await knowledgePage.goto();
        await knowledgePage.addSource('text', 'JavaScript is a programming language. It was created by Brendan Eich in 1995.');
        await knowledgePage.startIndexing();
        await knowledgePage.waitForIndexingComplete();

        // Switch to Study
        await knowledgePage.page.goto('/study');

        // Generate quiz from Knowledge content
        await studyPage.generateQuiz('JavaScript history', 3);

        // Verify quiz questions relate to content
        const question = await studyPage.getCurrentQuestion();
        expect(question.toLowerCase()).toMatch(/javascript|brendan|eich|1995/);

        test.skip(true, 'Requires Knowledge integration and agent');
    });

    /**
     * XWS-Study-002: Quiz results link to Knowledge sources
     */
    test('XWS-Study-002: Quiz results link to Knowledge sources', async ({ page }) => {
        const studyPage = new StudyPage(page);
        const knowledgePage = new KnowledgePage(page);

        // Complete quiz
        await studyPage.goto();
        await studyPage.generateQuiz('React Basics', 3);

        // Answer all questions
        for (let i = 0; i < 3; i++) {
            await studyPage.answerQuizQuestion(`Answer ${i}`);
            await studyPage.nextQuestion();
        }

        // View results
        const resultsScreen = studyPage.page.locator('[data-testid="quiz-results"]');
        await expect(resultsScreen).toBeVisible();

        // Click on question to view source
        await studyPage.page.getByText('View Source').first().click();

        // Verify navigated to Knowledge workspace
        await expect(page).toHaveURL(/\/knowledge/);

        // Verify related document is open
        await expect(knowledgePage.documentViewer).toBeVisible();

        test.skip(true, 'Requires source linking feature');
    });
});

test.describe('Cross-Workspace: UI Consistency', () => {
    /**
     * XWS-UI-001: Workspace switching preserves scroll position
     */
    test('XWS-UI-001: Workspace switching preserves scroll position', async ({ page }) => {
        const notesPage = new NotesPage(page);

        // Start in Notes with many notes
        await notesPage.goto();

        // Scroll down
        await page.evaluate(() => window.scrollTo(0, 500));

        // Switch to IDE
        await notesPage.page.goto('/ide');
        await page.waitForTimeout(1000);

        // Switch back to Notes
        await page.goto('/notes');

        // Verify scroll position preserved
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(0);

        test.skip(true, 'Requires scroll position persistence');
    });

    /**
     * XWS-UI-002: Theme is consistent across workspaces
     */
    test('XWS-UI-002: Theme is consistent across workspaces', async ({ page }) => {
        // Start in IDE
        await page.goto('/ide');

        // Get theme
        const theme1 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));

        // Switch to Notes
        await page.goto('/notes');

        // Get theme
        const theme2 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));

        // Verify theme matches
        expect(theme1).toBe(theme2);
    });

    /**
     * XWS-UI-003: Language preference persists
     */
    test('XWS-UI-003: Language preference persists', async ({ page }) => {
        // Start in IDE
        await page.goto('/ide');

        // Check current language (from i18n)
        const lang1 = await page.evaluate(() => {
            return (window as any).i18n?.language || 'en';
        });

        // Switch to Knowledge
        await page.goto('/knowledge');

        // Verify language unchanged
        const lang2 = await page.evaluate(() => {
            return (window as any).i18n?.language || 'en';
        });

        expect(lang1).toBe(lang2);
    });
});

test.describe('Cross-Workspace: Performance', () => {
    /**
     * XWS-Perf-001: Workspace switching is fast
     */
    test('XWS-Perf-001: Workspace switching is fast', async ({ page }) => {
        // Start in IDE
        await page.goto('/ide');
        await page.waitForLoadState('networkidle');

        // Time switch to Notes
        const startTime = Date.now();
        await page.goto('/notes');
        await page.waitForLoadState('networkidle');
        const switchTime = Date.now() - startTime;

        // Should switch in less than 2 seconds
        expect(switchTime).toBeLessThan(2000);
    });

    /**
     * XWS-Perf-002: Multiple rapid workspace switches
     */
    test('XWS-Perf-002: Multiple rapid workspace switches', async ({ page }) => {
        const switches = [
            '/ide',
            '/notes',
            '/knowledge',
            '/study',
            '/ide',
            '/knowledge',
            '/notes',
        ];

        const startTime = Date.now();

        for (const route of switches) {
            await page.goto(route);
            await page.waitForLoadState('networkidle');
        }

        const totalTime = Date.now() - startTime;

        // Average switch time should be under 2 seconds
        const avgTime = totalTime / switches.length;
        expect(avgTime).toBeLessThan(2000);
    });
});

test.describe('Cross-Workspace: State Persistence', () => {
    /**
     * XWS-State-001: Open files persist across workspace switches
     */
    test('XWS-State-001: Open files persist across workspace switches', async ({ page }) => {
        const idePage = new IDEPage(page);

        // Start in IDE
        await idePage.goto();

        // Open file (assuming project mounted)
        // await idePage.openFile('test1.ts');

        // Switch to Notes
        await idePage.switchWorkspace('notes');

        // Switch back to IDE
        await page.goto('/ide');

        // Verify file still open
        // const openFiles = await idePage.getOpenFiles();
        // expect(openFiles).toContain('test1.ts');

        test.skip(true, 'Requires mounted project');
    });

    /**
     * XWS-State-002: Chat history persists across workspaces
     */
    test('XWS-State-002: Chat history persists across workspaces', async ({ page }) => {
        const notesPage = new NotesPage(page);

        // Start in Notes
        await notesPage.goto();

        // Send chat message (assuming agent configured)
        // await notesPage.sendChatMessage('Test message');

        // Switch to IDE
        await page.goto('/ide');

        // Switch back to Notes
        await page.goto('/notes');

        // Verify chat history still visible
        // const messages = await notesPage.getChatMessages();
        // expect(messages.length).toBeGreaterThan(0);

        test.skip(true, 'Requires agent with API key');
    });
});
