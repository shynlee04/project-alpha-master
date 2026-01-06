/**
 * @fileoverview Source Preview Panel Component Tests
 * @module components/knowledge/__tests__/SourcePreviewPanel.test
 * @governance EPIC-6-2, EPIC-6-4
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SourcePreviewPanel } from '../SourcePreviewPanel';
import { useKnowledgeStore } from '@/infrastructure/persistence/stores/knowledge';
import type { SourceRecord } from '@/infrastructure/persistence/dexie-db';

// Mock knowledge store
vi.mock('@/lib/state/knowledge-store', () => ({
    useKnowledgeStore: vi.fn(),
}));

// Mock MetadataDisplay and MetadataEditor
vi.mock('../MetadataDisplay', () => ({
    MetadataDisplay: ({ source }: { source: SourceRecord }) => (
        <div data-testid="metadata-display">Metadata for {source.id}</div>
    ),
}));

vi.mock('../MetadataEditor', () => ({
    MetadataEditor: ({ source, onSave, onCancel }: { source: SourceRecord; onSave: () => void; onCancel: () => void }) => (
        <div data-testid="metadata-editor">
            <button onClick={onSave}>Save</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    ),
}));

describe('SourcePreviewPanel', () => {
    const mockSource: SourceRecord = {
        id: 'source-1',
        projectId: 'test-project',
        type: 'pdf',
        title: 'Test Document',
        content: 'Line 1\nLine 2\nLine 3',
        pageCount: 3,
        wordCount: 6,
        createdAt: Date.now() - 3600000, // 1 hour ago
        updatedAt: Date.now(),
    };

    const mockSourceWithMetadata: SourceRecord = {
        ...mockSource,
        summary: 'Test summary',
        keyConcepts: ['concept1', 'concept2'],
        suggestedQuestions: ['question1?'],
        metadataExtracted: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset body style completely
        document.body.style.overflow = '';
        // Clear any DOM elements left by previous tests
        document.body.innerHTML = '';
        vi.mocked(useKnowledgeStore).mockReturnValue({
            selectedSource: null,
            isPreviewOpen: false,
            closePreview: vi.fn(),
            updateMetadata: vi.fn().mockResolvedValue(undefined),
            extractingMetadata: new Set<string>(),
        });
    });

    it('should not render when preview is closed', () => {
        vi.mocked(useKnowledgeStore).mockReturnValue({
            selectedSource: null,
            isPreviewOpen: false,
            closePreview: vi.fn(),
            updateMetadata: vi.fn().mockResolvedValue(undefined),
            extractingMetadata: new Set<string>(),
        });

        const { container } = render(<SourcePreviewPanel projectId="test-project" />);

        expect(container.querySelector('.fixed')).toBeNull();
    });

    it('should render when preview is open', () => {
        vi.mocked(useKnowledgeStore).mockReturnValue({
            selectedSource: mockSource,
            isPreviewOpen: true,
            closePreview: vi.fn(),
            updateMetadata: vi.fn().mockResolvedValue(undefined),
            extractingMetadata: new Set<string>(),
        });

        const { container } = render(<SourcePreviewPanel projectId="test-project" />);

        expect(screen.getByText('Test Document')).toBeInTheDocument();
        // Check for pre element with content
        const preElement = container.querySelector('pre');
        expect(preElement).toBeInTheDocument();
        expect(preElement?.textContent).toContain('Line 1');
        expect(preElement?.textContent).toContain('Line 2');
        expect(preElement?.textContent).toContain('Line 3');
    });

    it('should display metadata bar', () => {
        vi.mocked(useKnowledgeStore).mockReturnValue({
            selectedSource: mockSource,
            isPreviewOpen: true,
            closePreview: vi.fn(),
            updateMetadata: vi.fn().mockResolvedValue(undefined),
            extractingMetadata: new Set<string>(),
        });

        const { container } = render(<SourcePreviewPanel projectId="test-project" />);

        // Check for metadata bar content (using container since CSS text-transform isn't applied in jsdom)
        const metadataBar = container.querySelector('.border-b.border-border-dark.bg-surface-darker');
        expect(metadataBar).toBeInTheDocument();
        expect(metadataBar?.textContent).toContain('pdf'); // lowercase source type
        expect(metadataBar?.textContent).toContain('min read');
        expect(metadataBar?.textContent).toContain('Imported');
    });

    it('should close on close button click', () => {
        const closePreview = vi.fn();
        vi.mocked(useKnowledgeStore).mockReturnValue({
            selectedSource: mockSource,
            isPreviewOpen: true,
            closePreview,
            updateMetadata: vi.fn().mockResolvedValue(undefined),
            extractingMetadata: new Set<string>(),
        });

        render(<SourcePreviewPanel projectId="test-project" />);

        const closeButton = screen.getByTitle('Close');
        fireEvent.click(closeButton);

        expect(closePreview).toHaveBeenCalled();
    });

    it('should close on Escape key press', () => {
        const closePreview = vi.fn();
        vi.mocked(useKnowledgeStore).mockReturnValue({
            selectedSource: mockSource,
            isPreviewOpen: true,
            closePreview,
            updateMetadata: vi.fn().mockResolvedValue(undefined),
            extractingMetadata: new Set<string>(),
        });

        render(<SourcePreviewPanel projectId="test-project" />);

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(closePreview).toHaveBeenCalled();
    });

    // Story 6-4 tests
    it('should render MetadataDisplay when source has metadata', () => {
        vi.mocked(useKnowledgeStore).mockReturnValue({
            selectedSource: mockSourceWithMetadata,
            isPreviewOpen: true,
            closePreview: vi.fn(),
            updateMetadata: vi.fn().mockResolvedValue(undefined),
            extractingMetadata: new Set<string>(),
        });

        render(<SourcePreviewPanel projectId="test-project" />);

        expect(screen.getByTestId('metadata-display')).toBeInTheDocument();
    });

    it('should show edit button when source has metadata', () => {
        vi.mocked(useKnowledgeStore).mockReturnValue({
            selectedSource: mockSourceWithMetadata,
            isPreviewOpen: true,
            closePreview: vi.fn(),
            updateMetadata: vi.fn().mockResolvedValue(undefined),
            extractingMetadata: new Set<string>(),
        });

        render(<SourcePreviewPanel projectId="test-project" />);

        const editButton = screen.getByTitle('Edit metadata');
        expect(editButton).toBeInTheDocument();
    });

    it('should show "Analyzing..." status when extracting metadata', () => {
        vi.mocked(useKnowledgeStore).mockReturnValue({
            selectedSource: mockSource,
            isPreviewOpen: true,
            closePreview: vi.fn(),
            updateMetadata: vi.fn().mockResolvedValue(undefined),
            extractingMetadata: new Set(['source-1']),
        });

        render(<SourcePreviewPanel projectId="test-project" />);

        expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });

    it('should toggle edit mode when edit button is clicked', () => {
        vi.mocked(useKnowledgeStore).mockReturnValue({
            selectedSource: mockSourceWithMetadata,
            isPreviewOpen: true,
            closePreview: vi.fn(),
            updateMetadata: vi.fn().mockResolvedValue(undefined),
            extractingMetadata: new Set<string>(),
        });

        render(<SourcePreviewPanel projectId="test-project" />);

        // Click edit button
        const editButton = screen.getByTitle('Edit metadata');
        fireEvent.click(editButton);

        // Should show editor
        expect(screen.getByTestId('metadata-editor')).toBeInTheDocument();

        // Click cancel button (X icon)
        const cancelButton = screen.getByTitle('Cancel edit');
        fireEvent.click(cancelButton);

        // Should show display again
        expect(screen.getByTestId('metadata-display')).toBeInTheDocument();
    });

    it('should close editor on Escape key press', () => {
        vi.mocked(useKnowledgeStore).mockReturnValue({
            selectedSource: mockSourceWithMetadata,
            isPreviewOpen: true,
            closePreview: vi.fn(),
            updateMetadata: vi.fn().mockResolvedValue(undefined),
            extractingMetadata: new Set<string>(),
        });

        render(<SourcePreviewPanel projectId="test-project" />);

        // Click edit button
        const editButton = screen.getByTitle('Edit metadata');
        fireEvent.click(editButton);

        // Should show editor
        expect(screen.getByTestId('metadata-editor')).toBeInTheDocument();

        // Press Escape
        fireEvent.keyDown(document, { key: 'Escape' });

        // Should close editor (not panel)
        expect(screen.getByTestId('metadata-display')).toBeInTheDocument();
        expect(screen.queryByTestId('metadata-editor')).not.toBeInTheDocument();
    });
});
