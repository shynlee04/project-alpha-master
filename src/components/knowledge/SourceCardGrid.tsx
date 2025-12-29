/**
 * @fileoverview Source Card Grid Component
 * @module components/knowledge/SourceCardGrid
 * @governance EPIC-6-3
 *
 * Responsive grid layout for source cards with empty state and collection filtering.
 */

import { useEffect } from 'react';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';
import { SourceCard } from './SourceCard';
import type { SourceRecord } from '@/lib/state/dexie-db';

interface SourceCardGridProps {
    projectId: string;
    /** Optional collection ID to filter sources */
    collectionId?: string | null;
    /** Callback to open import dialog */
    onOpenImport?: () => void;
}

export function SourceCardGrid({ projectId, collectionId, onOpenImport }: SourceCardGridProps) {
    const { sources, collections, loadSources, selectedSource, openPreview } = useKnowledgeStore();

    useEffect(() => {
        loadSources(projectId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const handleSelectSource = (source: SourceRecord) => {
        openPreview(source);
    };

    // Filter sources by collection
    const filteredSources = collectionId
        ? sources.filter((source) => {
            const collection = collections.find((c) => c.id === collectionId);
            return collection?.sourceIds?.includes(source.id) || false;
        })
        : sources;

    // Get collection name for empty state
    const collection = collections.find((c) => c.id === collectionId);
    const isFilteredByCollection = !!collectionId;

    if (filteredSources.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                {/* Empty state illustration */}
                <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-muted-foreground mb-4"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>

                <h3 className="text-lg font-medium text-foreground mb-2">
                    {isFilteredByCollection
                        ? `No sources in "${collection?.name || 'this collection'}"`
                        : 'No sources yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    {isFilteredByCollection
                        ? 'Add sources to this collection or select a different collection.'
                        : 'Import your first PDF, URL, or text to get started with knowledge management.'}
                </p>
                {!isFilteredByCollection && (
                    <button
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-none hover:bg-primary/90 transition-colors"
                        onClick={() => {
                            // TODO: Wire to SourceDropZone in Story 6.3
                            console.log('Open SourceDropZone');
                        }}
                    >
                        Import Source
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredSources.map((source) => (
                <SourceCard
                    key={source.id}
                    source={source}
                    isActive={selectedSource?.id === source.id}
                    onSelect={handleSelectSource}
                />
            ))}
        </div>
    );
}
