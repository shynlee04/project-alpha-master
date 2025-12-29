/**
 * @fileoverview Source Card Component
 * @module components/knowledge/SourceCard
 * @governance EPIC-6-2
 *
 * Card component displaying source with icon, title, metadata, and quick actions.
 */

import { useState } from 'react';
import { PDFIcon, URLIcon, TextIcon } from '@/components/ui/icons';
import type { SourceRecord } from '@/lib/state/dexie-db';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';

interface SourceCardProps {
    source: SourceRecord;
    isActive?: boolean;
    onSelect?: (source: SourceRecord) => void;
}

/**
 * Calculate reading time from source metadata
 */
function calculateReadingTime(source: SourceRecord): string {
    const wordsPerMinute = 200;
    const charsPerMinute = 1000;

    if (source.wordCount) {
        const minutes = Math.ceil(source.wordCount / wordsPerMinute);
        return `${minutes} min read`;
    } else if (source.charCount) {
        const minutes = Math.ceil(source.charCount / charsPerMinute);
        return `${minutes} min read`;
    }
    return 'Unknown';
}

/**
 * Format metadata for display
 */
function formatMetadata(source: SourceRecord): string {
    if (source.wordCount) {
        return `${source.wordCount.toLocaleString()} words`;
    } else if (source.charCount) {
        return `${source.charCount.toLocaleString()} chars`;
    } else if (source.pageCount) {
        return `${source.pageCount} pages`;
    }
    return '';
}

/**
 * Get icon component for source type
 */
function getSourceIcon(source: SourceRecord) {
    switch (source.type) {
        case 'pdf':
            return PDFIcon;
        case 'url':
            return URLIcon;
        case 'text':
            return TextIcon;
        default:
            return TextIcon;
    }
}

export function SourceCard({ source, isActive = false, onSelect }: SourceCardProps) {
    const { deleteSource } = useKnowledgeStore();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const Icon = getSourceIcon(source);
    const readingTime = calculateReadingTime(source);
    const metadata = formatMetadata(source);

    const handleDelete = async () => {
        await deleteSource(source.id);
        setShowDeleteDialog(false);
    };

    return (
        <div
            className={`group relative p-4 border border-border-dark bg-surface-dark hover:bg-surface-darker transition-all duration-150 shadow-md hover:shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] rounded-none min-h-[90px] cursor-pointer ${
                isActive ? 'border-primary bg-primary/10' : ''
            }`}
            onClick={() => onSelect?.(source)}
            role="button"
            tabIndex={0}
            aria-pressed={isActive}
        >
            {/* Header with icon and title */}
            <div className="flex items-start gap-3 mb-2">
                <Icon size={24} className="text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate text-sm" title={source.title}>
                        {source.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {source.type.toUpperCase()}
                    </p>
                </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {metadata && <span>{metadata}</span>}
                <span>•</span>
                <span>{readingTime}</span>
            </div>

            {/* Quick actions on hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                    className="p-1 hover:bg-surface-darker rounded-none"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect?.(source);
                    }}
                    aria-label="Open source"
                    title="Open"
                >
                    {/* Eye icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                        <path d="M11 8a3 3 0 0 0-6 0" />
                    </svg>
                </button>
                <button
                    className="p-1 hover:bg-destructive/20 text-destructive rounded-none"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteDialog(true);
                    }}
                    aria-label="Delete source"
                    title="Delete"
                >
                    {/* Trash icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>

            {/* Delete confirmation dialog */}
            {showDeleteDialog && (
                <div className="absolute inset-0 bg-background/95 flex items-center justify-center p-4 z-10">
                    <div className="bg-surface-dark border border-border-dark p-4 max-w-sm">
                        <p className="text-sm mb-4">
                            Delete "{source.title}"?
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                className="px-3 py-1 text-sm border border-border-dark hover:bg-surface-darker"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteDialog(false);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-3 py-1 text-sm bg-destructive text-background hover:bg-destructive/90"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete();
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
