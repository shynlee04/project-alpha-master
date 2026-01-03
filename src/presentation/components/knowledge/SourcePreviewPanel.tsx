/**
 * @fileoverview Source Preview Panel Component
 * @module components/knowledge/SourcePreviewPanel
 * @governance EPIC-6-2, EPIC-6-4, EPIC-7-2
 *
 * Slide-in preview panel for viewing full source content.
 * Extended for Story 6.4: Metadata display and editing.
 * Extended for Story 7.2: Chunk boundary visualization.
 */

import { useEffect, useState } from 'react';
import { Edit, X, Grid3x3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';
// NOTE: useRAGStore import removed - getChunksForSource not implemented yet
// import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store';
import type { ChunkMetadata } from '@/lib/rag/types';
import { PDFIcon, URLIcon, TextIcon } from '@/presentation/components/ui/icons';
import { MetadataDisplay } from './MetadataDisplay';
import { MetadataEditor } from './MetadataEditor';
import type { SourceMetadataFields } from '@/lib/state/knowledge-store';

interface SourcePreviewPanelProps {
    projectId: string;
}

/**
 * Calculate reading time from source metadata
 */
function calculateReadingTime(source: { wordCount?: number; charCount?: number }): string {
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
 * Get icon component for source type
 */
function getSourceIcon(type: 'pdf' | 'url' | 'text') {
    switch (type) {
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
 * Format date to relative time
 */
function formatRelativeTime(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

/**
 * Chunk Boundary Badge Component
 * Displays chunk number and token count
 */
function ChunkBoundaryBadge({ index, tokenCount, type }: { index: number; tokenCount: number; type?: string }) {
    const { t } = useTranslation();

    const getTypeColor = () => {
        switch (type) {
            case 'figure':
                return 'text-purple-400 border-purple-400';
            case 'table':
                return 'text-blue-400 border-blue-400';
            case 'code':
                return 'text-green-400 border-green-400';
            default:
                return 'text-primary border-border-dark';
        }
    };

    const getTypeLabel = () => {
        switch (type) {
            case 'figure':
                return t('rag.chunking.figureDetected');
            case 'table':
                return t('rag.chunking.tableDetected');
            case 'code':
                return t('rag.chunking.codeDetected');
            default:
                return '';
        }
    };

    return (
        <div className={`flex items-center gap-2 px-2 py-1 bg-surface-darker border-l-2 ${getTypeColor()} text-xs font-mono`}>
            <span className="text-muted-foreground">
                {t('rag.chunking.chunkNumber', { index: index + 1 })}
            </span>
            <span>•</span>
            <span>{t('rag.chunking.tokenCount', { count: tokenCount })}</span>
            {type && (
                <>
                    <span>•</span>
                    <span className="font-semibold">{getTypeLabel()}</span>
                </>
            )}
        </div>
    );
}

export function SourcePreviewPanel({ projectId: _projectId }: SourcePreviewPanelProps) {
    const { t } = useTranslation();
    const { selectedSource, isPreviewOpen, closePreview, updateMetadata, extractingMetadata } =
        useKnowledgeStore();
    const [isEditingMetadata, setIsEditingMetadata] = useState(false);
    const [showChunkBoundaries, setShowChunkBoundaries] = useState(false);
    // NOTE: getChunksForSource not implemented yet - chunk boundaries feature disabled
    // Feature not available - chunks will always be empty array
    const chunks = [] as ChunkMetadata[];

    // Handle Escape key to close
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPreviewOpen) {
                if (isEditingMetadata) {
                    setIsEditingMetadata(false);
                } else {
                    closePreview();
                }
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isPreviewOpen, closePreview, isEditingMetadata]);

    // Prevent body scroll when panel is open
    useEffect(() => {
        if (isPreviewOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isPreviewOpen]);

    // Reset edit state when source changes
    useEffect(() => {
        setIsEditingMetadata(false);
    }, [selectedSource?.id]);

    if (!isPreviewOpen || !selectedSource) {
        return null;
    }

    const Icon = getSourceIcon(selectedSource.type);
    const readingTime = calculateReadingTime(selectedSource);
    const importedAt = formatRelativeTime(selectedSource.createdAt);
    const isExtracting = extractingMetadata.has(selectedSource.id);

    const handleExport = () => {
        const blob = new Blob([selectedSource.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedSource.title}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSaveMetadata = async (metadata: SourceMetadataFields) => {
        await updateMetadata(selectedSource.id, metadata);
        setIsEditingMetadata(false);
    };

    const handleCancelEdit = () => {
        setIsEditingMetadata(false);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                onClick={closePreview}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-surface-dark border-l border-border-dark shadow-lg z-50 flex flex-col transition-transform duration-300 ease-out">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border-dark">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Icon pixelSize={20} className="text-primary flex-shrink-0" />
                        <h2 className="font-medium text-foreground truncate" title={selectedSource.title}>
                            {selectedSource.title}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Story 7-2: Show chunk boundaries toggle */}
                        <button
                            className={`p-2 rounded-none ${showChunkBoundaries ? 'bg-surface-darker text-primary' : 'hover:bg-surface-darker'}`}
                            onClick={() => setShowChunkBoundaries(!showChunkBoundaries)}
                            aria-label={showChunkBoundaries ? 'Hide chunks' : 'Show chunks'}
                            aria-pressed={showChunkBoundaries}
                            title={showChunkBoundaries ? t('rag.chunking.hideBoundaries') : t('rag.chunking.showBoundaries')}
                        >
                            <Grid3x3 className="w-4 h-4" />
                        </button>
                        {/* Story 6-4: Edit metadata button */}
                        {(selectedSource.summary ||
                            selectedSource.keyConcepts?.length ||
                            selectedSource.suggestedQuestions?.length) && (
                            <button
                                className="p-2 hover:bg-surface-darker rounded-none text-primary"
                                onClick={() => setIsEditingMetadata(!isEditingMetadata)}
                                aria-label={isEditingMetadata ? 'Cancel edit' : 'Edit metadata'}
                                title={isEditingMetadata ? 'Cancel edit' : 'Edit metadata'}
                            >
                                {isEditingMetadata ? (
                                    <X className="w-4 h-4" />
                                ) : (
                                    <Edit className="w-4 h-4" />
                                )}
                            </button>
                        )}
                        <button
                            className="p-2 hover:bg-surface-darker rounded-none"
                            onClick={handleExport}
                            aria-label="Export as text file"
                            title="Export"
                        >
                            {/* Download icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        </button>
                        <button
                            className="p-2 hover:bg-surface-darker rounded-none"
                            onClick={closePreview}
                            aria-label="Close preview"
                            title="Close"
                        >
                            {/* Close icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Metadata bar */}
                <div className="flex items-center gap-4 px-4 py-2 border-b border-border-dark bg-surface-darker text-xs text-muted-foreground">
                    <span className="uppercase">{selectedSource.type}</span>
                    <span>•</span>
                    <span>{readingTime}</span>
                    <span>•</span>
                    <span>{t('knowledge.sources.imported', { date: importedAt })}</span>
                    {isExtracting && (
                        <>
                            <span>•</span>
                            <span className="text-primary animate-pulse">{t('knowledge.metadata.analyzing')}</span>
                        </>
                    )}
                </div>

                {/* Content area with metadata */}
                <div className="flex-1 overflow-y-auto">
                    {/* Source content with chunk boundaries (Story 7-2) */}
                    {showChunkBoundaries ? (
                        // Chunked view
                        chunks && chunks.length > 0 ? (
                            <div className="p-4 space-y-4">
                                {chunks.map((chunk: ChunkMetadata) => (
                                    <div key={chunk.chunkId} className="border-b border-border-dark pb-4 last:border-b-0">
                                        <ChunkBoundaryBadge
                                            index={chunk.chunkIndex}
                                            tokenCount={chunk.tokenCount}
                                            type={chunk.metadata?.type}
                                        />
                                        <pre className="mt-2 whitespace-pre-wrap text-sm text-foreground leading-relaxed font-mono">
                                            {chunk.content}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Placeholder when no chunks available
                            <div className="p-4 text-center">
                                <div className="text-muted-foreground text-sm">
                                    {t('rag.chunking.title')} - {t('rag.chunking.progress', { current: 0, total: 0 })}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">
                                    Chunks will be displayed here after chunking is complete.
                                </div>
                            </div>
                        )
                    ) : (
                        // Normal view
                        <div className="p-4">
                            <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-mono">
                                {selectedSource.content}
                            </pre>
                        </div>
                    )}

                    {/* Story 6-4: Metadata display/editor */}
                    {isEditingMetadata ? (
                        <MetadataEditor
                            source={selectedSource}
                            onSave={handleSaveMetadata}
                            onCancel={handleCancelEdit}
                        />
                    ) : (
                        <MetadataDisplay source={selectedSource} />
                    )}
                </div>
            </div>
        </>
    );
}
