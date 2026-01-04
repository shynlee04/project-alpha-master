/**
 * @fileoverview Collection Selector Component
 * @module components/knowledge/CollectionSelector
 * @governance EPIC-6-3
 *
 * Dialog for adding/removing source from collections.
 * Multi-select checkboxes for multiple collection membership.
 */

import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { useKnowledgeStore } from '@/lib/state/knowledge/knowledge-store';
import type { Collection } from '@/infrastructure/persistence/dexie-db';

export interface CollectionSelectorProps {
    /** Whether dialog is open */
    isOpen: boolean;

    /** Source ID to add to collections */
    sourceId: string;

    /** Callback when dialog is closed */
    onClose: () => void;
}

/**
 * CollectionSelector Component
 *
 * Modal dialog for managing which collections a source belongs to.
 *
 * Features:
 * - Multi-select checkboxes for collections
 * - Shows current collection membership
 * - Add/remove source from collections by toggling checkboxes
 * - Empty state when no collections exist
 * - Done and Cancel buttons
 *
 * Uses Radix Dialog for accessibility and focus management.
 */
export function CollectionSelector({
    isOpen,
    sourceId,
    onClose,
}: CollectionSelectorProps) {
    const { collections, addSourceToCollection, removeSourceFromCollection } =
        useKnowledgeStore();

    // Check if source is in collection
    const isInCollection = (collection: Collection): boolean => {
        return collection.sourceIds?.includes(sourceId) || false;
    };

    // Handle checkbox toggle
    const handleToggle = async (collection: Collection, checked: boolean) => {
        if (checked) {
            await addSourceToCollection(sourceId, collection.id);
        } else {
            await removeSourceFromCollection(sourceId, collection.id);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-background/80 z-50" />
                <Dialog.Content
                    className={cn(
                        'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
                        'bg-surface-dark border border-border-dark shadow-pixel',
                        'p-6 rounded-none',
                        'max-w-md w-full max-h-[80vh] overflow-y-auto',
                        'focus:outline-none'
                    )}
                >
                    {/* Header */}
                    <Dialog.Title className="text-lg font-medium text-foreground mb-4">
                        Move to Collection
                    </Dialog.Title>

                    {/* Collection list */}
                    {collections.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No collections yet
                            <br />
                            Create a collection first to organize your sources.
                        </div>
                    ) : (
                        <div className="space-y-2 mb-6">
                            {collections.map((collection) => (
                                <label
                                    key={collection.id}
                                    className={cn(
                                        'flex items-center gap-3 p-3',
                                        'border border-border-dark',
                                        'hover:bg-surface-darker',
                                        'cursor-pointer',
                                        'rounded-none',
                                        'transition-colors'
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isInCollection(collection)}
                                        onChange={(e) =>
                                            handleToggle(collection, e.target.checked)
                                        }
                                        className={cn(
                                            'w-4 h-4',
                                            'bg-background border-border-dark',
                                            'rounded-none',
                                            'focus:outline-none focus:ring-2 focus:ring-primary',
                                            'cursor-pointer'
                                        )}
                                    />
                                    <span className="flex-1 text-sm text-foreground">
                                        {collection.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        ({collection.sourceIds?.length || 0})
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className={cn(
                                'px-4 py-2 text-sm',
                                'border border-border-dark hover:bg-surface-darker',
                                'text-foreground',
                                'rounded-none',
                                'focus:outline-none focus:ring-2 focus:ring-primary'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className={cn(
                                'px-4 py-2 text-sm',
                                'bg-primary text-background',
                                'hover:bg-primary/90',
                                'rounded-none',
                                'focus:outline-none focus:ring-2 focus:ring-primary'
                            )}
                        >
                            Done
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
