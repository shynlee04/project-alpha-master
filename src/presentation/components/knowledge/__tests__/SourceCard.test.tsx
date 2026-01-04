/**
 * @fileoverview Source Card Component Tests
 * @module components/knowledge/__tests__/SourceCard.test
 * @governance EPIC-6-2, EPIC-6-4
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SourceCard } from '../SourceCard';
import { useKnowledgeStore } from '@/lib/state/knowledge/knowledge-store';
import type { SourceRecord } from '@/lib/state/dexie-db';

// Mock knowledge store
vi.mock('@/lib/state/knowledge-store', () => ({
    useKnowledgeStore: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('SourceCard', () => {
    const mockPDFSource: SourceRecord = {
        id: 'source-1',
        projectId: 'project-1',
        type: 'pdf',
        title: 'Test PDF Document',
        content: 'Test content',
        pageCount: 10,
        wordCount: 2000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    const mockURLSource: SourceRecord = {
        id: 'source-2',
        projectId: 'project-1',
        type: 'url',
        title: 'Test URL Article',
        content: 'Article content',
        url: 'https://example.com',
        wordCount: 1500,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    const mockTextSource: SourceRecord = {
        id: 'source-3',
        projectId: 'project-1',
        type: 'text',
        title: 'Test Text Note',
        content: 'Note content',
        charCount: 500,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Clear any DOM elements left by previous tests
        document.body.innerHTML = '';
        vi.mocked(useKnowledgeStore).mockReturnValue({
            deleteSource: vi.fn().mockResolvedValue(undefined),
            renameSource: vi.fn().mockResolvedValue(undefined),
            extractMetadata: vi.fn().mockResolvedValue(undefined),
            extractingMetadata: new Set<string>(),
        });
    });

    it('should render PDF card with correct icon and metadata', () => {
        render(<SourceCard source={mockPDFSource} />);

        expect(screen.getByText('Test PDF Document')).toBeInTheDocument();
        expect(screen.getByText('PDF')).toBeInTheDocument();
        expect(screen.getByText(/2,000 words/)).toBeInTheDocument();
        expect(screen.getByText(/10 min read/)).toBeInTheDocument();
    });

    it('should render URL card with correct metadata', () => {
        render(<SourceCard source={mockURLSource} />);

        expect(screen.getByText('Test URL Article')).toBeInTheDocument();
        expect(screen.getByText('URL')).toBeInTheDocument();
        expect(screen.getByText(/1,500 words/)).toBeInTheDocument();
    });

    it('should render text card with char count', () => {
        render(<SourceCard source={mockTextSource} />);

        expect(screen.getByText('Test Text Note')).toBeInTheDocument();
        expect(screen.getByText('TEXT')).toBeInTheDocument();
        expect(screen.getByText(/500 chars/)).toBeInTheDocument();
    });

    it('should highlight when active', () => {
        const { rerender, container } = render(<SourceCard source={mockPDFSource} isActive={false} />);
        // Get the card by querying for role="button"
        const card = container.querySelector('[role="button"]');

        expect(card).not.toHaveClass('border-primary');

        rerender(<SourceCard source={mockPDFSource} isActive={true} />);

        expect(card).toHaveClass('border-primary');
    });

    it('should show context menu on hover', () => {
        const { container } = render(<SourceCard source={mockPDFSource} />);
        // Get the card by querying for role="button"
        const card = container.querySelector('[role="button"]');

        // Context menu container should exist with opacity-0 class (hidden by default)
        const contextMenuContainer = container.querySelector('.group-hover\\:opacity-100');
        expect(contextMenuContainer).toBeInTheDocument();
        expect(contextMenuContainer).toHaveClass('opacity-0');

        // Verify context menu trigger is present
        expect(screen.getByRole('button', { name: /more options/i })).toBeInTheDocument();
    });

    it('should call onSelect when clicked', () => {
        const onSelect = vi.fn();
        const { container } = render(<SourceCard source={mockPDFSource} onSelect={onSelect} />);

        // Get the card by querying for role="button"
        const card = container.querySelector('[role="button"]');
        fireEvent.click(card!);

        expect(onSelect).toHaveBeenCalledWith(mockPDFSource);
    });

    it('should truncate long titles', () => {
        const longTitleSource: SourceRecord = {
            ...mockPDFSource,
            title: 'A'.repeat(100),
        };

        const { container } = render(<SourceCard source={longTitleSource} />);

        // Check that truncate class is applied (CSS handles visual truncation)
        const title = screen.getByText(/A+/);
        expect(title).toHaveClass('truncate');
        // Text content is not modified by CSS truncate, so it's still 100 chars
        expect(title.textContent?.length).toBe(100);
    });

    // Story 6-4 tests
    it('should show AI-analyzed badge when metadata is extracted', () => {
        const sourceWithMetadata: SourceRecord = {
            ...mockPDFSource,
            metadataExtracted: true,
        };

        render(<SourceCard source={sourceWithMetadata} />);

        expect(screen.getByTitle('AI-analyzed')).toBeInTheDocument();
    });

    it('should not show AI-analyzed badge when metadata is not extracted', () => {
        render(<SourceCard source={mockPDFSource} />);

        expect(screen.queryByTitle('AI-analyzed')).not.toBeInTheDocument();
    });

    it('should show "Analyzing..." status when extracting metadata', () => {
        vi.mocked(useKnowledgeStore).mockReturnValue({
            deleteSource: vi.fn().mockResolvedValue(undefined),
            renameSource: vi.fn().mockResolvedValue(undefined),
            extractMetadata: vi.fn().mockResolvedValue(undefined),
            extractingMetadata: new Set(['source-1']),
        });

        render(<SourceCard source={mockPDFSource} />);

        expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });
});
