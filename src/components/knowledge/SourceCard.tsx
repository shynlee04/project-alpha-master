/**
 * @fileoverview Source Card Component
 * @module components/knowledge/SourceCard
 * @governance EPIC-6-3, EPIC-6-4
 *
 * Card component displaying source with icon, title, metadata, and context menu.
 * Extended for Story 6.4: AI metadata extraction trigger and badge display.
 */

import { useState, useCallback } from 'react';
import { PDFIcon, URLIcon, TextIcon } from '@/components/ui/icons';
import { SourceContextMenu } from './SourceContextMenu';
import { RenameDialog } from './RenameDialog';
import { CollectionSelector } from './CollectionSelector';
import { exportText, exportPDF } from '@/utils/export-utils';
import { toast } from 'sonner';
import type { SourceRecord } from '@/lib/state/dexie-db';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';
import { useTranslation } from 'react-i18next';

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

/**
 * Sanitize filename for download
 */
function sanitizeFilename(title: string): string {
    return title
        .replace(/[/\\?%*:|"<>]/g, '-') // Replace invalid characters
        .replace(/\s+/g, '_')           // Replace spaces with underscores
        .substring(0, 100);              // Limit length
}

/**
 * Export source as downloadable file
 */
function exportSource(source: SourceRecord): void {
    let content: string;
    let filename: string;
    let mimeType: string;

    const sanitizedTitle = sanitizeFilename(source.title);

    switch (source.type) {
        case 'pdf':
            // For PDFs, we download the raw content if available
            if (source.rawContent) {
                content = source.rawContent;
                filename = `${sanitizedTitle}.pdf`;
                mimeType = 'application/pdf';
            } else if (source.content) {
                // Fallback to text content if raw not available
                content = source.content;
                filename = `${sanitizedTitle}.txt`;
                mimeType = 'text/plain';
            } else {
                console.warn('No content available for PDF export');
                return;
            }
            break;
        case 'url':
        case 'text':
        default:
            content = source.content || '';
            filename = `${sanitizedTitle}.txt`;
            mimeType = 'text/plain';
            break;
    }

    // Create blob and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function SourceCard({ source, isActive = false, onSelect }: SourceCardProps) {
    const { t } = useTranslation();
    const { deleteSource, renameSource, extractMetadata, extractingMetadata } = useKnowledgeStore();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRenameDialog, setShowRenameDialog] = useState(false);
    const [showCollectionSelector, setShowCollectionSelector] = useState(false);

    const Icon = getSourceIcon(source);
    const readingTime = calculateReadingTime(source);
    const metadata = formatMetadata(source);
    const isExtracting = extractingMetadata.has(source.id);

    const handleDelete = useCallback(async () => {
        await deleteSource(source.id);
        setShowDeleteDialog(false);
    }, [deleteSource, source.id]);

    const handleRename = useCallback(() => {
        setShowRenameDialog(true);
    }, []);

    const handleSaveRename = useCallback(async (newTitle: string) => {
        await renameSource(source.id, newTitle);
        setShowRenameDialog(false);
    }, [renameSource, source.id]);

    const handleMoveToCollection = () => {
        setShowCollectionSelector(true);
    };

    const handleExport = () => {
        // Export based on source type (Story 6-3, Task 6)
        if (source.type === 'pdf') {
            exportPDF(source);
        } else {
            exportText(source);
        }
    };

    const handleExtractMetadata = async () => {
        try {
            await extractMetadata(source.id);
            toast.success(t('knowledge.metadata.extractedSuccessfully'));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t('knowledge.metadata.extractFailed'));
        }
    };

    return (
        <div
            className={`group relative p-4 border border-border-dark bg-surface-dark hover:bg-surface-darker transition-all duration-150 shadow-md hover:shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] rounded-none min-h-[90px] cursor-pointer ${isActive ? 'border-primary bg-primary/10' : ''
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
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground truncate text-sm" title={source.title}>
                            {source.title}
                        </h3>
                        {/* Story 6-4: AI-analyzed badge */}
                        {source.metadataExtracted && (
                            <span className="text-xs text-primary" title={t('knowledge.metadata.aiAnalyzed')}>
                                ✨
                            </span>
                        )}
                    </div>
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
                {isExtracting && (
                    <>
                        <span>•</span>
                        <span className="text-primary animate-pulse">Analyzing...</span>
                    </>
                )}
            </div>

            {/* Context menu on hover (Story 6-3) */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <SourceContextMenu
                    source={source}
                    onRename={handleRename}
                    onDelete={() => setShowDeleteDialog(true)}
                    onMoveToCollection={handleMoveToCollection}
                    onExport={handleExport}
                    // Story 6-4: Add metadata extraction trigger
                    onExtractMetadata={!source.metadataExtracted ? handleExtractMetadata : undefined}
                />
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

            {/* Rename dialog (Story 6-3, Task 4) */}
            <RenameDialog
                isOpen={showRenameDialog}
                currentTitle={source.title}
                onSave={handleSaveRename}
                onCancel={() => setShowRenameDialog(false)}
            />

            {/* Collection selector (Story 6-3, Task 5) */}
            <CollectionSelector
                isOpen={showCollectionSelector}
                sourceId={source.id}
                onClose={() => setShowCollectionSelector(false)}
            />
        </div>
    );
}

