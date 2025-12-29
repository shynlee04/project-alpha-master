/**
 * @fileoverview Collection Selector Component Tests
 * @module components/knowledge/__tests__/CollectionSelector.test
 * @governance EPIC-6-3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CollectionSelector } from '../CollectionSelector';
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
        sourceIds: ['source-1'],
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

describe('CollectionSelector (Story 6-3, Task 5)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
    });

    it('should render dialog when isOpen is true', () => {
        const { useKnowledgeStore } = require('@/lib/state/knowledge-store');
        useKnowledgeStore.mockReturnValue({
            collections: [],
            addSourceToCollection: vi.fn(),
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
        const { useKnowledgeStore } = require('@/lib/state/knowledge-store');
        useKnowledgeStore.mockReturnValue({
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
        const { useKnowledgeStore } = require('@/lib/state/knowledge-store');
        useKnowledgeStore.mockReturnValue({
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
        const { useKnowledgeStore } = require('@/lib/state/knowledge-store');
        useKnowledgeStore.mockReturnValue({
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
        const { useKnowledgeStore } = require('@/lib/state/knowledge-store');
        useKnowledgeStore.mockReturnValue({
            collections: mockCollections,
            addSourceToCollection,
        });

        render(
            <CollectionSelector
                isOpen={true}
                sourceId="source-1"
                onClose={vi.fn()}
            />
        );

        const mlCheckbox = screen.getByRole('checkbox', { name: /ml research/i });
        fireEvent.click(mlCheckbox);

        expect(addSourceToCollection).toHaveBeenCalledWith('source-1', 'collection-1');
    });

    it('should call onClose when Cancel is clicked', () => {
        const onClose = vi.fn();
        const { useKnowledgeStore } = require('@/lib/state/knowledge-store');
        useKnowledgeStore.mockReturnValue({
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
        const { useKnowledgeStore } = require('@/lib/state/knowledge-store');
        useKnowledgeStore.mockReturnValue({
            collections: [],
            addSourceToCollection: vi.fn(),
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
            },
            {
                id: 'collection-2',
                projectId: 'project-1',
                name: 'Documentation',
                sourceIds: [],
                createdAt: Date.now(),
            },
        ];

        const { useKnowledgeStore } = require('@/lib/state/knowledge-store');
        useKnowledgeStore.mockReturnValue({
            collections: collectionsWithSource,
            addSourceToCollection: vi.fn(),
        });

        render(
            <CollectionSelector
                isOpen={true}
                sourceId="source-1"
                onClose={vi.fn()}
            />
        );

        const mlCheckbox = screen.getByRole('checkbox', { name: /ml research/i });
        expect(mlCheckbox).toBeChecked();

        const docCheckbox = screen.getByRole('checkbox', { name: /documentation/i });
        expect(docCheckbox).not.toBeChecked();
    });

    it('should call onClose when Done button is clicked', () => {
        const onClose = vi.fn();
        const { useKnowledgeStore } = require('@/lib/state/knowledge-store');
        useKnowledgeStore.mockReturnValue({
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
