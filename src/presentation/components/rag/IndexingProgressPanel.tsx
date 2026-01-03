/**
 * @fileoverview IndexingProgressPanel - RAG Indexing Progress UI
 * @module presentation/components/rag/IndexingProgressPanel
 *
 * Displays real-time progress of RAG indexing operations.
 * Connects to RAG store to show indexing status, progress bar,
 * and operation details (embedding, chunking, searching).
 *
 * @governance P0-2: Wire RAG Store to KnowledgePage
 * @handoff p0-2-rag-store-wiring-handoff-2026-01-03.md
 */

import { useTranslation } from 'react-i18next';
import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store';
import type { IndexStatus, IndexOperation } from '@/infrastructure/persistence/stores/rag/rag-types';

/**
 * IndexingProgressPanel props
 */
export interface IndexingProgressPanelProps {
    /** Optional CSS class name */
    className?: string;
}

/**
 * IndexingProgressPanel Component
 *
 * Shows progress bar and status for RAG indexing operations.
 * Automatically hides when index is idle or ready.
 *
 * Features:
 * - Real-time progress bar with smooth transitions
 * - Operation status display (embedding, chunking, searching)
 * - Document count progress (current/total)
 * - 8-bit themed styling matching design system
 *
 * @example
 * ```tsx
 * import { IndexingProgressPanel } from '@/presentation/components/rag/IndexingProgressPanel';
 *
 * function KnowledgePage() {
 *   return (
 *     <div>
 *       <IndexingProgressPanel />
 *       {/* Other content *\/}
 *     </div>
 *   );
 * }
 * ```
 */
export function IndexingProgressPanel({ className = '' }: IndexingProgressPanelProps) {
    const { t } = useTranslation();

    // Use individual selectors to prevent infinite loops (Zustand v5 pattern)
    const indexStatus = useRAGStore((s) => s.indexStatus);
    const documentCount = useRAGStore((s) => s.documentCount);
    const totalDocuments = useRAGStore((s) => s.totalDocuments);
    const indexingOperation = useRAGStore((s) => s.indexingOperation);

    // Hide panel when index is idle or ready
    if (indexStatus === 'idle' || indexStatus === 'ready') {
        return null;
    }

    // Calculate progress percentage
    const progress = totalDocuments > 0 ? (documentCount / totalDocuments) * 100 : 0;

    // Get operation label
    const getOperationLabel = (operation: IndexOperation): string => {
        switch (operation) {
            case 'embedding':
                return t('rag.indexing.embedding', 'Generating Embeddings');
            case 'chunking':
                return t('rag.indexing.chunking', 'Chunking Content');
            case 'search':
                return t('rag.indexing.searching', 'Searching Index');
            case 'idle':
            default:
                return t('rag.indexing.processing', 'Processing');
        }
    };

    return (
        <div className={`p-4 bg-muted rounded-lg border border-border ${className}`}>
            {/* Header: Operation label and document count */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium font-mono">
                    {getOperationLabel(indexingOperation)}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                    {documentCount} / {totalDocuments}
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                    role="progressbar"
                    aria-valuenow={documentCount}
                    aria-valuemin={0}
                    aria-valuemax={totalDocuments}
                    aria-label={getOperationLabel(indexingOperation)}
                />
            </div>

            {/* Status text */}
            <div className="mt-2 text-xs text-muted-foreground font-mono">
                {progress.toFixed(0)}% complete
            </div>
        </div>
    );
}
