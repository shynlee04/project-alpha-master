/**
 * @fileoverview Source Card Grid Component Tests
 * @module components/knowledge/__tests__/SourceCardGrid.test
 * @governance EPIC-6-2
 */

import { render, screen } from '@testing-library/react';
import { SourceCardGrid } from '../SourceCardGrid';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';
import type { SourceRecord } from '@/lib/state/dexie-db';

// Mock knowledge store
vi.mock('@/lib/state/knowledge-store', () => ({
    useKnowledgeStore: vi.fn(),
}));

describe('SourceCardGrid', () => {
    const mockSources: SourceRecord[] = [
        {
            id: 'source-1',
            projectId: 'test-project',
            type: 'pdf',
            title: 'Test PDF',
            content: 'PDF content',
            pageCount: 5,
            wordCount: 1000,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
        {
            id: 'source-2',
            projectId: 'test-project',
            type: 'url',
            title: 'Test URL',
            content: 'URL content',
            url: 'https://example.com',
            wordCount: 500,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load sources on mount', () => {
        const loadSources = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useKnowledgeStore).mockReturnValue({
            sources: mockSources,
            collections: [],
            loadSources,
            selectedSource: null,
            openPreview: vi.fn(),
            deleteSource: vi.fn(),
            renameSource: vi.fn(),
            extractMetadata: vi.fn(),
            extractingMetadata: new Set<string>(),
        });

        render(<SourceCardGrid projectId="test-project" />);

        expect(loadSources).toHaveBeenCalledWith('test-project');
    });

    it('should render empty state when no sources', () => {
        vi.mocked(useKnowledgeStore).mockReturnValue({
            sources: [],
            collections: [],
            loadSources: vi.fn(),
            selectedSource: null,
            openPreview: vi.fn(),
        });

        render(<SourceCardGrid projectId="test-project" />);

        expect(screen.getByText('No sources yet')).toBeInTheDocument();
        expect(screen.getByText(/Import your first PDF/)).toBeInTheDocument();
    });

    it('should render source cards', () => {
        vi.mocked(useKnowledgeStore).mockReturnValue({
            sources: mockSources,
            collections: [],
            loadSources: vi.fn(),
            selectedSource: null,
            openPreview: vi.fn(),
            deleteSource: vi.fn(),
            renameSource: vi.fn(),
            extractMetadata: vi.fn(),
            extractingMetadata: new Set<string>(),
        });

        render(<SourceCardGrid projectId="test-project" />);

        expect(screen.getByText('Test PDF')).toBeInTheDocument();
        expect(screen.getByText('Test URL')).toBeInTheDocument();
    });

    it('should use responsive grid classes', () => {
        vi.mocked(useKnowledgeStore).mockReturnValue({
            sources: mockSources,
            collections: [],
            loadSources: vi.fn(),
            selectedSource: null,
            openPreview: vi.fn(),
            deleteSource: vi.fn(),
            renameSource: vi.fn(),
            extractMetadata: vi.fn(),
            extractingMetadata: new Set<string>(),
        });

        const { container } = render(<SourceCardGrid projectId="test-project" />);
        const grid = container.querySelector('.grid');

        expect(grid).toHaveClass('grid-cols-1');
        expect(grid).toHaveClass('md:grid-cols-2');
        expect(grid).toHaveClass('lg:grid-cols-3');
    });
});
