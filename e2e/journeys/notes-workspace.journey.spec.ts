/**
 * Notes Workspace - Comprehensive E2E Test Suite
 *
 * @module e2e/journeys/notes-workspace.journey.spec
 */

import { test, expect } from '@playwright/test';
import { NotesPage } from '../pages/NotesPage';

test.describe('Notes Workspace: Critical Path', () => {
    let notesPage: NotesPage;

    test.beforeEach(async ({ page }) => {
        notesPage = new NotesPage(page);
        await notesPage.goto();
    });

    /**
     * NOTES-001: Can mount folder
     */
    test('NOTES-001: Can mount folder', async () => {
        await expect(notesPage.syncButton).toBeVisible();
        await notesPage.mountFolder();

        // Verify mount flow initiated
        test.skip(true, 'Requires FSA mock for folder picker');
    });

    /**
     * NOTES-002: Files auto-import after mount
     */
    test('NOTES-002: Files auto-import after mount', async ({ page }) => {
        // 1. Mount folder with FSA mock
        // 2. Verify files appear in notes list
        // 3. Verify sync status

        await notesPage.mountFolder();
        await notesPage.waitForSyncComplete();

        const notesList = await notesPage.getNotesList();
        expect(notesList.length).toBeGreaterThan(0);

        test.skip(true, 'Requires FSA mock with test files');
    });

    /**
     * NOTES-003: Can create new note
     */
    test('NOTES-003: Can create new note', async () => {
        const noteTitle = 'Test Note ' + Date.now();
        const noteContent = 'This is a test note';

        await notesPage.createNote(noteTitle, noteContent);

        // Verify note appears in list
        await notesPage.assertNoteExists(noteTitle);

        // Verify note content
        await notesPage.openNote(noteTitle);
        const content = await notesPage.getNoteContent();
        expect(content).toContain(noteContent);
    });

    /**
     * NOTES-004: Can edit existing note
     */
    test('NOTES-004: Can edit existing note', async () => {
        const noteTitle = 'Edit Test Note';
        const originalContent = 'Original content';
        const editedContent = 'Edited content';

        // Create note
        await notesPage.createNote(noteTitle, originalContent);

        // Edit note
        await notesPage.editNoteContent(editedContent);
        await notesPage.saveNote();

        // Verify edit persisted
        await notesPage.openNote(noteTitle);
        const content = await notesPage.getNoteContent();
        expect(content).toContain(editedContent);
    });

    /**
     * NOTES-005: Can delete note
     */
    test('NOTES-005: Can delete note', async () => {
        const noteTitle = 'Delete Test Note';

        // Create note
        await notesPage.createNote(noteTitle, 'This will be deleted');
        await notesPage.assertNoteExists(noteTitle);

        // Delete note
        await notesPage.deleteNote();

        // Verify note removed
        await notesPage.assertNoteNotExists(noteTitle);
    });

    /**
     * NOTES-006: Changes persist to filesystem
     */
    test('NOTES-006: Changes persist to filesystem', async () => {
        const noteTitle = 'Persistence Test Note';
        const content = 'Test content for persistence';

        // Create and save note
        await notesPage.createNote(noteTitle, content);
        await notesPage.saveNote();

        // Use mock FSA to verify file content on disk
        // (This requires integration with mock-fsa.fixture)

        test.skip(true, 'Requires FSA mock to verify disk content');
    });
});

test.describe('Notes Workspace: AI Generation', () => {
    let notesPage: NotesPage;

    test.beforeEach(async ({ page }) => {
        notesPage = new NotesPage(page);
        await notesPage.goto();
    });

    /**
     * NOTES-AI-001: Can generate note with AI
     */
    test('NOTES-AI-001: Can generate note with AI', async () => {
        const noteTitle = 'AI Generated Note';
        const prompt = 'Generate a note about TypeScript best practices';

        // Create note first
        await notesPage.createNote(noteTitle);

        // Select agent
        await notesPage.selectAgent('Code Assistant');

        // Generate content
        await notesPage.generateWithAI(prompt);

        // Verify content generated
        const content = await notesPage.getNoteContent();
        expect(content.length).toBeGreaterThan(100);

        test.skip(true, 'Requires agent with configured API key');
    });

    /**
     * NOTES-AI-002: AI generation respects note context
     */
    test('NOTES-AI-002: AI generation respects note context', async () => {
        const noteTitle = 'Context Test';
        const existingContent = '# React Components Guide\n\nThis is a guide about React.';

        // Create note with existing content
        await notesPage.createNote(noteTitle, existingContent);

        // Generate continuation
        await notesPage.generateWithAI('Continue this guide with a section on hooks');

        // Verify generated content relates to React hooks
        const content = await notesPage.getNoteContent();
        expect(content.toLowerCase()).toMatch(/hook/);

        test.skip(true, 'Requires agent with configured API key');
    });
});

test.describe('Notes Workspace: Cross-Workspace Sync', () => {
    let notesPage: NotesPage;

    test.beforeEach(async ({ page }) => {
        notesPage = new NotesPage(page);
        await notesPage.goto();
    });

    /**
     * NOTES-Sync-001: File edited in IDE appears in Notes
     */
    test('NOTES-Sync-001: File edited in IDE appears in Notes', async ({ page }) => {
        // 1. Switch to IDE workspace
        // 2. Open and edit a file
        // 3. Save file
        // 4. Switch back to Notes
        // 5. Verify changes appear

        test.skip(true, 'Requires IDE workspace integration and FSA mock');
    });

    /**
     * NOTES-Sync-002: Note edited in Notes syncs to filesystem
     */
    test('NOTES-Sync-002: Note edited in Notes syncs to filesystem', async () => {
        // 1. Mount folder in Notes
        // 2. Edit a note
        // 3. Save note
        // 4. Verify file updated on disk via mock FSA

        test.skip(true, 'Requires FSA mock');
    });

    /**
     * NOTES-Sync-003: External file changes appear in Notes
     */
    test('NOTES-Sync-003: External file changes appear in Notes', async () => {
        // 1. Mount folder in Notes
        // 2. Modify file externally via mock FSA
        // 3. Trigger sync or wait for watcher
        // 4. Verify changes appear in Notes

        test.skip(true, 'Requires FSA mock and file watcher');
    });
});

test.describe('Notes Workspace: Mobile Responsive', () => {
    let notesPage: NotesPage;

    test.beforeEach(async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        notesPage = new NotesPage(page);
        await notesPage.goto();
    });

    /**
     * NOTES-Mobile-001: Mobile layout is responsive
     */
    test('NOTES-Mobile-001: Mobile layout is responsive', async () => {
        // Verify mobile-specific layout elements
        await expect(notesPage.notesList).toBeVisible();
        await expect(notesPage.noteEditor).toBeVisible();
    });

    /**
     * NOTES-Mobile-002: Can create note on mobile
     */
    test('NOTES-Mobile-002: Can create note on mobile', async () => {
        const noteTitle = 'Mobile Test Note';

        await notesPage.createNote(noteTitle, 'Created on mobile');
        await notesPage.assertNoteExists(noteTitle);
    });

    /**
     * NOTES-Mobile-003: Touch interactions work
     */
    test('NOTES-Mobile-003: Touch interactions work', async () => {
        // Test swipe gestures, tap targets, etc.
        const noteItem = notesPage.notesList.getByRole('listitem').first();
        await noteItem.tap();

        await expect(notesPage.noteEditor).toBeVisible();
    });
});

test.describe('Notes Workspace: Performance', () => {
    let notesPage: NotesPage;

    test.beforeEach(async ({ page }) => {
        notesPage = new NotesPage(page);
        await notesPage.goto();
    });

    /**
     * NOTES-Perf-001: Large note loads quickly
     */
    test('NOTES-Perf-001: Large note loads quickly', async () => {
        const noteTitle = 'Large Note';
        const largeContent = '# Large Note\n\n' + 'x'.repeat(100000); // 100KB

        // Create large note
        await notesPage.createNote(noteTitle, largeContent);

        // Open and measure load time
        const startTime = Date.now();
        await notesPage.openNote(noteTitle);
        const loadTime = Date.now() - startTime;

        // Should load in less than 2 seconds
        expect(loadTime).toBeLessThan(2000);
    });

    /**
     * NOTES-Perf-002: Many notes render efficiently
     */
    test('NOTES-Perf-002: Many notes render efficiently', async () => {
        // Create 100 notes
        for (let i = 0; i < 100; i++) {
            await notesPage.createNote(`Note ${i}`, `Content ${i}`);
        }

        // Measure render time
        const startTime = Date.now();
        await notesPage.goto();
        await notesPage.waitForLoad();
        const renderTime = Date.now() - startTime;

        // Should render in less than 3 seconds
        expect(renderTime).toBeLessThan(3000);
    });
});

/**
 * Phase 1.5 Correction Tests (2026-01-09)
 *
 * Tests for sprint corrections:
 * - R1: File panel visible in Notes sidebar
 * - R4: Model selection visible in Settings
 * - R7: Error toasts appear on failures
 */
test.describe('Phase 1.5 Corrections: Notes Workspace', () => {
    let notesPage: NotesPage;

    test.beforeEach(async ({ page }) => {
        notesPage = new NotesPage(page);
        await notesPage.goto();
    });

    /**
     * R1 Verification: File panel visible in Notes sidebar
     *
     * @see https://github.com/via-gentium/project-alpha/issues/phase-1.5-correction
     */
    test('PH1.5-R1: File panel is visible in Notes sidebar', async () => {
        // Verify the file panel (ProjectFilesPanel) exists in the sidebar
        const filePanel = notesPage.page.locator('[data-testid="project-files-panel"]').first();
        await expect(filePanel).toBeVisible();

        // Verify it has a file list or empty state
        const fileList = filePanel.locator('[data-testid="file-list"], [data-testid="empty-state"]');
        await expect(fileList).toBeVisible();
    });

    /**
     * R4 Verification: Model selection works in Settings
     *
     * @see https://github.com/via-gentium/project-alpha/issues/phase-1.5-correction
     */
    test('PH1.5-R4: Model selection visible in Provider settings', async ({ page }) => {
        // Navigate to settings
        await page.goto('/settings');

        // Find provider settings section
        const providerSection = page.locator('[data-testid="provider-settings"]').first();
        await expect(providerSection).toBeVisible();

        // Verify model dropdown exists for each configured provider
        const modelDropdowns = providerSection.locator('[data-testid="model-selector"]');
        const count = await modelDropdowns.count();

        // At least one provider should have model selector visible
        expect(count).toBeGreaterThan(0);
    });

    /**
     * R7 Verification: Error toasts appear on failures
     *
     * @see https://github.com/via-gentium/project-alpha/issues/phase-1.5-correction
     */
    test('PH1.5-R7: Error toasts display for failed operations', async ({ page }) => {
        // Mock a failed operation by intercepting the API
        await page.route('**/api/notes**', route => route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Test error for validation' }),
        }));

        // Try to create a note (should fail with toast)
        const createButton = page.locator('[data-testid="create-note-button"], button:has-text("New Note")').first();
        await createButton.click();

        // Verify error toast appears
        const errorToast = page.locator('[data-testid="toast-error"], .toast.error, [role="alert"]');
        await expect(errorToast).toBeVisible({ timeout: 5000 });
    });

    /**
     * IndexedDB Project Verification: Default notes project works
     *
     * @see https://github.com/via-gentium/project-alpha/issues/phase-1.5-correction
     */
    test('PH1.5-IDB: Default notes project uses IndexedDB storage', async ({ page }) => {
        // Navigate to notes workspace
        await page.goto('/notes');

        // Verify the page loads without "No Folder Selected" overlay
        const noFolderOverlay = page.locator('[data-testid="no-folder-overlay"]');
        await expect(noFolderOverlay).not.toBeVisible({ timeout: 3000 });

        // Verify notes list or empty state is shown
        const notesList = page.locator('[data-testid="notes-list"], [data-testid="empty-notes"]');
        await expect(notesList).toBeVisible();
    });
});
