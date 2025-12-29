/**
 * @fileoverview Source Preview Panel Component
 * @module components/knowledge/SourcePreviewPanel
 * @governance EPIC-6-2
 *
 * Slide-in preview panel for viewing full source content.
 */

import { useEffect } from 'react';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';
import { PDFIcon, URLIcon, TextIcon } from '@/components/ui/icons';

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

export function SourcePreviewPanel({ projectId }: SourcePreviewPanelProps) {
    const { selectedSource, isPreviewOpen, closePreview } = useKnowledgeStore();

    // Handle Escape key to close
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPreviewOpen) {
                closePreview();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isPreviewOpen, closePreview]);

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

    if (!isPreviewOpen || !selectedSource) {
        return null;
    }

    const Icon = getSourceIcon(selectedSource.type);
    const readingTime = calculateReadingTime(selectedSource);
    const importedAt = formatRelativeTime(selectedSource.createdAt);

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
                        <Icon size={20} className="text-primary flex-shrink-0" />
                        <h2 className="font-medium text-foreground truncate" title={selectedSource.title}>
                            {selectedSource.title}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
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
                    <span>Imported {importedAt}</span>
                </div>

                {/* Content area */}
                <div className="flex-1 overflow-y-auto p-4">
                    <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-mono">
                        {selectedSource.content}
                    </pre>
                </div>
            </div>
        </>
    );
}
