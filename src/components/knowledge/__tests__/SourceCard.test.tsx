/**
 * @fileoverview Source Card Component Tests
 * @module components/knowledge/__tests__/SourceCard.test
 * @governance EPIC-6-2
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SourceCard } from '../SourceCard';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';
import type { SourceRecord } from '@/lib/state/dexie-db';

// Mock knowledge store
vi.mock('@/lib/state/knowledge-store', () => ({
    useKnowledgeStore: vi.fn(),
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
        vi.mocked(useKnowledgeStore).mockReturnValue({
            deleteSource: vi.fn().mockResolvedValue(undefined),
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
        const { rerender } = render(<SourceCard source={mockPDFSource} isActive={false} />);
        const card = screen.getByRole('button');

        expect(card).not.toHaveClass('border-primary');

        rerender(<SourceCard source={mockPDFSource} isActive={true} />);

        expect(card).toHaveClass('border-primary');
    });

    it('should show quick actions on hover', () => {
        render(<SourceCard source={mockPDFSource} />);
        const card = screen.getByRole('button');

        // Actions should be hidden by default
        const deleteButton = screen.getByTitle('Delete');
        expect(deleteButton.parentElement).toHaveClass('opacity-0');

        // Hover should show actions
        fireEvent.mouseEnter(card);

        const openButton = screen.getByTitle('Open');
        expect(openButton.parentElement).not.toHaveClass('opacity-0');
    });

    it('should call onSelect when clicked', () => {
        const onSelect = vi.fn();
        render(<SourceCard source={mockPDFSource} onSelect={onSelect} />);

        fireEvent.click(screen.getByRole('button'));

        expect(onSelect).toHaveBeenCalledWith(mockPDFSource);
    });

    it('should show delete confirmation dialog when delete clicked', () => {
        render(<SourceCard source={mockPDFSource} />);
        const card = screen.getByRole('button');

        fireEvent.mouseEnter(card);
        fireEvent.click(screen.getByTitle('Delete'));

        expect(screen.getByText(/Delete "Test PDF Document"\?/)).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should delete source and close dialog when confirmed', async () => {
        const deleteSource = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useKnowledgeStore).mockReturnValue({
            deleteSource,
        });

        render(<SourceCard source={mockPDFSource} />);
        const card = screen.getByRole('button');

        fireEvent.mouseEnter(card);
        fireEvent.click(screen.getByTitle('Delete'));
        fireEvent.click(screen.getByText('Delete'));

        await waitFor(() => {
            expect(deleteSource).toHaveBeenCalledWith('source-1');
        });
    });

    it('should close dialog when cancel clicked', () => {
        render(<SourceCard source={mockPDFSource} />);
        const card = screen.getByRole('button');

        fireEvent.mouseEnter(card);
        fireEvent.click(screen.getByTitle('Delete'));
        fireEvent.click(screen.getByText('Cancel'));

        expect(screen.queryByText(/Delete "Test PDF Document"\?/)).not.toBeInTheDocument();
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
});
