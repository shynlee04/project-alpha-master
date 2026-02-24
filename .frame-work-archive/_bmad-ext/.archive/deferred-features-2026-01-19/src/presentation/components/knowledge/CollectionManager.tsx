/**
 * @fileoverview Collection Manager Component
 * @module components/knowledge/CollectionManager
 * @governance EPIC-6-3
 *
 * Sidebar component for managing collections.
 * Shows "All Sources", collection list with counts, and "New Collection" button.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@/presentation/components/ui/icons';
import { CreateCollectionDialog } from './CreateCollectionDialog';
import { useKnowledgeStore } from '@/infrastructure/persistence/stores/knowledge';
import type { Collection } from '@/infrastructure/persistence/dexie-db';
import { cn } from '@/lib/utils';

export interface CollectionManagerProps {
    /** Callback when collection is selected */
    onCollectionSelect: (collectionId: string | null) => void;

    /** Currently active collection ID (null = All Sources) */
    activeCollectionId?: string | null;
}

/**
 * CollectionManager Component
 *
 * Displays a sidebar panel with:
 * - "All Sources" button (clears filter)
 * - Collection list with count badges
 * - "New Collection" button
 *
 * Collections are shown with source counts in parentheses.
 * Active collection is highlighted with primary color.
 */
export function CollectionManager({
    onCollectionSelect,
    activeCollectionId = null,
}: CollectionManagerProps) {
    const { t } = useTranslation();
    const { collections, createCollection } = useKnowledgeStore();
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const handleCreateCollection = async (name: string) => {
        await createCollection(name);
        setShowCreateDialog(false);
    };

    const getCollectionSourceCount = (collection: Collection): number => {
        return collection.sourceIds?.length || 0;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-dark">
                <h2 className="text-sm font-medium text-foreground">{t('knowledge.collections.title')}</h2>
            </div>

            {/* All Sources button */}
            <div className="p-2">
                <button
                    type="button"
                    onClick={() => onCollectionSelect(null)}
                    className={cn(
                        'w-full px-3 py-2 text-left text-sm',
                        'hover:bg-surface-darker',
                        'transition-colors',
                        'rounded-none',
                        activeCollectionId === null && 'bg-primary/10 text-primary'
                    )}
                >
                    {t('knowledge.collections.allSources')}
                </button>
            </div>

            {/* Collection list */}
            <div className="flex-1 overflow-y-auto p-2">
                {collections.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                    {t('knowledge.collections.empty')}
                    </div>
                ) : (
                    <ul className="space-y-1">
                        {collections.map((collection) => (
                            <li key={collection.id}>
                                <button
                                    type="button"
                                    onClick={() => onCollectionSelect(collection.id)}
                                    className={cn(
                                        'w-full px-3 py-2 text-left text-sm',
                                        'hover:bg-surface-darker',
                                        'transition-colors',
                                        'rounded-none',
                                        activeCollectionId === collection.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-foreground'
                                    )}
                                >
                                    <span className="truncate">{collection.name}</span>
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        ({getCollectionSourceCount(collection)})
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* New Collection button */}
            <div className="p-2 border-t border-border-dark">
                <button
                    type="button"
                    onClick={() => setShowCreateDialog(true)}
                    className={cn(
                        'w-full px-3 py-2 text-sm',
                        'flex items-center gap-2',
                        'bg-primary text-background',
                        'hover:bg-primary/90',
                        'transition-colors',
                        'rounded-none'
                    )}
                >
                    <PlusIcon className="w-4 h-4" />
                    New Collection
                </button>
            </div>

            {/* Create collection dialog */}
            <CreateCollectionDialog
                isOpen={showCreateDialog}
                onSave={handleCreateCollection}
                onCancel={() => setShowCreateDialog(false)}
            />
        </div>
    );
}
