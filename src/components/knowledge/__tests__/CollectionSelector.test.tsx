/**
 * @fileoverview Collection Selector Component Tests
 * @module components/knowledge/__tests__/CollectionSelector.test
 * @governance EPIC-6-3
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CollectionSelector } from '../CollectionSelector';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';
import type { Collection } from '@/lib/state/dexie-db';

// Mock knowledge store
vi.mock('@/lib/state/knowledge-store', () => ({
    useKnowledgeStore: vi.fn(),
}));

const mockedUseKnowledgeStore = useKnowledgeStore as Mock;

const mockCollections: Collection[] = [
    {
        id: 'collection-1',
        projectId: 'project-1',
        name: 'ML Research',
        sourceIds: ['source-1'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: 'collection-2',
        projectId: 'project-1',
        name: 'Documentation',
        sourceIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
];

describe('CollectionSelector (Story 6-3, Task 5)', () => {
    const mockAddSourceToCollection = vi.fn();
    const mockRemoveSourceFromCollection = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';

        // Default mock setup
        mockedUseKnowledgeStore.mockReturnValue({
            collections: mockCollections,
            addSourceToCollection: mockAddSourceToCollection,
            removeSourceFromCollection: mockRemoveSourceFromCollection,
        });
    });

    it('should render dialog when isOpen is true', () => {
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: [],
            addSourceToCollection: mockAddSourceToCollection,
            removeSourceFromCollection: mockRemoveSourceFromCollection,
        });

        render(
            <CollectionSelector
                isOpen={true}
                sourceId="source-1"
                onClose={vi.fn()}
            />
        );

        expect(screen.getByText(/move to collection/i)).toBeInTheDocument();
    });

    it('should not render dialog when isOpen is false', () => {
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: [],
            addSourceToCollection: vi.fn(),
        });

        const { container } = render(
            <CollectionSelector
                isOpen={false}
                sourceId="source-1"
                onClose={vi.fn()}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('should render collection list', () => {
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: mockCollections,
            addSourceToCollection: vi.fn(),
        });

        render(
            <CollectionSelector
                isOpen={true}
                sourceId="source-1"
                onClose={vi.fn()}
            />
        );

        expect(screen.getByText('ML Research')).toBeInTheDocument();
        expect(screen.getByText('Documentation')).toBeInTheDocument();
    });

    it('should show checkboxes for each collection', () => {
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: mockCollections,
            addSourceToCollection: vi.fn(),
        });

        render(
            <CollectionSelector
                isOpen={true}
                sourceId="source-1"
                onClose={vi.fn()}
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(2);
    });

    it('should call addSourceToCollection when collection checkbox is checked', () => {
        const addSourceToCollection = vi.fn();
        const collectionsWithoutSource: Collection[] = [
            {
                id: 'collection-1',
                projectId: 'project-1',
                name: 'ML Research',
                sourceIds: [], // No source-1
                createdAt: Date.now(),
            },
            {
                id: 'collection-2',
                projectId: 'project-1',
                name: 'Documentation',
                sourceIds: [],
                createdAt: Date.now(),
            },
        ];

        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: collectionsWithoutSource,
            addSourceToCollection,
            removeSourceFromCollection: vi.fn(),
        });

        render(
            <CollectionSelector
                isOpen={true}
                sourceId="source-1"
                onClose={vi.fn()}
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);

        expect(mockAddSourceToCollection).toHaveBeenCalledWith('source-1', 'collection-2');
    });

    it('should call onClose when Cancel is clicked', () => {
        const onClose = vi.fn();
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: mockCollections,
            addSourceToCollection: vi.fn(),
        });

        render(
            <CollectionSelector
                isOpen={true}
                sourceId="source-1"
                onClose={onClose}
            />
        );

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(onClose).toHaveBeenCalled();
    });

    it('should show empty state when no collections exist', () => {
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: [],
            addSourceToCollection: mockAddSourceToCollection,
            removeSourceFromCollection: mockRemoveSourceFromCollection,
        });

        render(
            <CollectionSelector
                isOpen={true}
                sourceId="source-1"
                onClose={vi.fn()}
            />
        );

        expect(screen.getByText(/no collections/i)).toBeInTheDocument();
    });

    it('should highlight collections that already contain the source', () => {
        const collectionsWithSource: Collection[] = [
            {
                id: 'collection-1',
                projectId: 'project-1',
                name: 'ML Research',
                sourceIds: ['source-1'], // Already contains source
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
            {
                id: 'collection-2',
                projectId: 'project-1',
                name: 'Documentation',
                sourceIds: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ];

        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: collectionsWithSource,
            addSourceToCollection: mockAddSourceToCollection,
            removeSourceFromCollection: mockRemoveSourceFromCollection,
        });

        render(
            <CollectionSelector
                isOpen={true}
                sourceId="source-1"
                onClose={vi.fn()}
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0]).toBeChecked();
        expect(checkboxes[1]).not.toBeChecked();
    });

    it('should call onClose when Done button is clicked', () => {
        const onClose = vi.fn();
        (useKnowledgeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            collections: mockCollections,
            addSourceToCollection: vi.fn(),
        });

        render(
            <CollectionSelector
                isOpen={true}
                sourceId="source-1"
                onClose={onClose}
            />
        );

        const doneButton = screen.getByRole('button', { name: /done/i });
        fireEvent.click(doneButton);

        expect(onClose).toHaveBeenCalled();
    });
});

