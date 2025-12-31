/**
 * @fileoverview Collection Manager Component Tests
 * @module components/knowledge/__tests__/CollectionManager.test
 * @governance EPIC-6-3
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { CollectionManager } from '../CollectionManager';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';
import type { Collection } from '@/lib/state/dexie-db';

// Mock knowledge store
vi.mock('@/lib/state/knowledge-store', () => ({
    useKnowledgeStore: vi.fn(),
}));

const mockCollections: Collection[] = [
    {
        id: 'collection-1',
        projectId: 'project-1',
        name: 'ML Research',
        sourceIds: ['source-1', 'source-2', 'source-3'],
        createdAt: Date.now(),
    },
    {
        id: 'collection-2',
        projectId: 'project-1',
        name: 'Documentation',
        sourceIds: ['source-4'],
        createdAt: Date.now(),
    },
];

describe('CollectionManager (Story 6-3, Task 5)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
    });

    it('should render New Collection button', () => {
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: [],
            createCollection: vi.fn(),
        });

        render(<CollectionManager onCollectionSelect={vi.fn()} />);

        const newButton = screen.getByRole('button', { name: /new collection/i });
        expect(newButton).toBeInTheDocument();
    });

    it('should render collection list', () => {
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: mockCollections,
            createCollection: vi.fn(),
        });

        render(<CollectionManager onCollectionSelect={vi.fn()} />);

        expect(screen.getByText('ML Research')).toBeInTheDocument();
        expect(screen.getByText('Documentation')).toBeInTheDocument();
    });

    it('should render collection count badges', () => {
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: mockCollections,
            createCollection: vi.fn(),
        });

        render(<CollectionManager onCollectionSelect={vi.fn()} />);

        // ML Research has 3 sources
        expect(screen.getByText(/\(3\)/)).toBeInTheDocument();
        // Documentation has 1 source
        expect(screen.getByText(/\(1\)/)).toBeInTheDocument();
    });

    it('should call createCollection when New Collection button is clicked', () => {
        const createCollection = vi.fn();
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: [],
            createCollection,
        });

        render(<CollectionManager onCollectionSelect={vi.fn()} />);

        const newButton = screen.getByRole('button', { name: /new collection/i });
        fireEvent.click(newButton);

        // Should show dialog with input
        const input = screen.getByRole('textbox', { name: /collection name/i });
        expect(input).toBeInTheDocument();
    });

    it('should call onCollectionSelect when collection is clicked', () => {
        const onCollectionSelect = vi.fn();
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: mockCollections,
            createCollection: vi.fn(),
        });

        render(<CollectionManager onCollectionSelect={onCollectionSelect} />);

        const mlCollection = screen.getByText('ML Research');
        fireEvent.click(mlCollection);

        expect(onCollectionSelect).toHaveBeenCalledWith('collection-1');
    });

    it('should highlight active collection', () => {
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: mockCollections,
            createCollection: vi.fn(),
        });

        render(<CollectionManager onCollectionSelect={vi.fn()} activeCollectionId="collection-1" />);

        const mlCollection = screen.getByText('ML Research').closest('button');
        expect(mlCollection).toHaveClass('bg-primary/10');
    });

    it('should show empty state when no collections', () => {
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: [],
            createCollection: vi.fn(),
        });

        render(<CollectionManager onCollectionSelect={vi.fn()} />);

        expect(screen.getByText(/no collections/i)).toBeInTheDocument();
    });

    it('should render All Sources button', () => {
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: mockCollections,
            createCollection: vi.fn(),
        });

        render(<CollectionManager onCollectionSelect={vi.fn()} />);

        const allSourcesButton = screen.getByRole('button', { name: /all sources/i });
        expect(allSourcesButton).toBeInTheDocument();
    });

    it('should call onCollectionSelect with null when All Sources is clicked', () => {
        const onCollectionSelect = vi.fn();
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: mockCollections,
            createCollection: vi.fn(),
        });

        render(<CollectionManager onCollectionSelect={onCollectionSelect} />);

        const allSourcesButton = screen.getByRole('button', { name: /all sources/i });
        fireEvent.click(allSourcesButton);

        expect(onCollectionSelect).toHaveBeenCalledWith(null);
    });

    it('should highlight All Sources when no active collection', () => {
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: mockCollections,
            createCollection: vi.fn(),
        });

        render(<CollectionManager onCollectionSelect={vi.fn()} />);

        const allSourcesButton = screen.getByRole('button', { name: /all sources/i });
        expect(allSourcesButton).toHaveClass('bg-primary/10');
    });
});
