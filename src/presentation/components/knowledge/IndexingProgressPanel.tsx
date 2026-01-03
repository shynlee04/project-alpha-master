/**
 * RAG Indexing Progress Panel - Document Processing Visualization
 *
 * Displays real-time progress of RAG indexing operations including:
 * - File chunking (splitting documents into chunks)
 * - Embedding generation (vectorizing chunks)
 * - Index building (creating vector search index)
 *
 * User Journey:
 * 1. User uploads PDF → Shows "Processing file.pdf (0%)"
 * 2. Chunking starts → "Chunking: 15/100 chunks created"
 * 3. Embedding starts → "Generating embeddings: 450/1000 vectors"
 * 4. Index building → "Building search index: 75% complete"
 * 5. Complete → "✅ Ready for search (15,432 vectors)"
 *
 * @module presentation/components/knowledge/IndexingProgressPanel
 * @priority P0 - Event Activity Indicator (User Requirement)
 * @story Knowledge Workspace - RAG Indexing Progress
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import {
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  Database,
  Pause,
  Clock,
} from 'lucide-react';
import { Progress } from '@/presentation/components/ui/progress';
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';
import type { RAGProgressPayload, RAGIndexingCancelData, RAGIndexingRetryData } from '@/infrastructure/events/event-bus';
import { useIDEStore } from '@/lib/state/ide-store';

/**
 * Indexing stage
 */
type IndexingStage = 'idle' | 'chunking' | 'embedding' | 'indexing' | 'completed' | 'failed' | 'cancelled';

/**
 * Document indexing progress
 */
interface DocumentProgress {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'txt' | 'md' | 'docx';
  stage: IndexingStage;
  chunkingProgress: {
    current: number;
    total: number;
  };
  embeddingProgress: {
    current: number;
    total: number;
  };
  indexingProgress: number; // 0-100
  error?: string;
  estimatedTimeRemaining?: number; // seconds
  vectorsCount: number;
}

/**
 * Overall indexing state
 */
interface IndexingState {
  documents: DocumentProgress[];
  totalDocuments: number;
  completedDocuments: number;
  failedDocuments: number;
  totalVectors: number;
  currentIndexingStage: IndexingStage;
  startTime: number | null;
  endTime: number | null;
}

/**
 * Format duration in human-readable format
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.ceil(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.ceil(seconds % 60);

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Indexing Progress Panel Component
 */
export function IndexingProgressPanel() {
  const { t } = useTranslation();
  const projectId = useIDEStore((state) => state.projectId) || 'default';
  const [indexingState, setIndexingState] = useState<IndexingState>({
    documents: [],
    totalDocuments: 0,
    completedDocuments: 0,
    failedDocuments: 0,
    totalVectors: 0,
    currentIndexingStage: 'idle',
    startTime: null,
    endTime: null,
  });

  // Subscribe to indexing events from RAG module
  useEffect(() => {
    console.log('[IndexingProgressPanel] Setting up RAG indexing event listeners');

    // Map RAG event payload to DocumentProgress
    const updateDocumentProgress = (payload: RAGProgressPayload) => {
      const documentId = payload.documentId || payload.sourceId || 'unknown';

      setIndexingState((prevState) => {
        const existingDoc = prevState.documents.find((d) => d.id === documentId);

        if (existingDoc) {
          // Update existing document
          return {
            ...prevState,
            documents: prevState.documents.map((doc) =>
              doc.id === documentId
                ? {
                    ...doc,
                    stage: mapStatusToStage(payload.status),
                    chunkingProgress: {
                      current: payload.current || doc.chunkingProgress.current,
                      total: payload.total || doc.chunkingProgress.total,
                    },
                    embeddingProgress: {
                      current: payload.current || doc.embeddingProgress.current,
                      total: payload.total || doc.embeddingProgress.total,
                    },
                    indexingProgress: payload.progress || doc.indexingProgress,
                    vectorsCount: payload.current || doc.vectorsCount,
                    error: payload.error,
                  }
                : doc
            ),
          };
        } else {
          // Add new document
          const newDoc: DocumentProgress = {
            id: documentId,
            fileName: payload.message || `Document ${documentId}`,
            fileType: 'pdf', // Default type
            stage: mapStatusToStage(payload.status),
            chunkingProgress: {
              current: payload.current || 0,
              total: payload.total || 0,
            },
            embeddingProgress: {
              current: payload.current || 0,
              total: payload.total || 0,
            },
            indexingProgress: payload.progress || 0,
            vectorsCount: payload.current || 0,
            error: payload.error,
          };

          return {
            ...prevState,
            documents: [...prevState.documents, newDoc],
            totalDocuments: prevState.totalDocuments + 1,
          };
        }
      });
    };

    // Subscribe to chunking status events
    const unsubscribeChunking = eventBus.on(
      DomainEventType.RAG_CHUNKING_STATUS,
      (event: any) => {
        console.log('[IndexingProgressPanel] RAG_CHUNKING_STATUS:', event);
        updateDocumentProgress(event);
      }
    );

    // Subscribe to embedding progress events
    const unsubscribeEmbedding = eventBus.on(
      DomainEventType.RAG_EMBEDDING_PROGRESS,
      (event: any) => {
        console.log('[IndexingProgressPanel] RAG_EMBEDDING_PROGRESS:', event);
        updateDocumentProgress(event);
      }
    );

    // Subscribe to database indexing events
    const unsubscribeIndexing = eventBus.on(
      DomainEventType.RAG_DATABASE_INDEXING,
      (event: any) => {
        console.log('[IndexingProgressPanel] RAG_DATABASE_INDEXING:', event);
        updateDocumentProgress(event);
      }
    );

    // Subscribe to source processing events
    const unsubscribeSource = eventBus.on(
      DomainEventType.RAG_SOURCE_PROCESSING,
      (event: any) => {
        console.log('[IndexingProgressPanel] RAG_SOURCE_PROCESSING:', event);
        updateDocumentProgress(event);
      }
    );

    console.log('[IndexingProgressPanel] RAG indexing event listeners registered');

    // Cleanup: remove all listeners on unmount
    return () => {
      console.log('[IndexingProgressPanel] Cleaning up RAG indexing event listeners');
      unsubscribeChunking();
      unsubscribeEmbedding();
      unsubscribeIndexing();
      unsubscribeSource();
    };
  }, []);

  /**
   * Map RAG status to indexing stage
   */
  const mapStatusToStage = (status: RAGProgressPayload['status']): IndexingStage => {
    switch (status) {
      case 'idle':
        return 'idle';
      case 'running':
        return 'embedding';
      case 'completed':
        return 'completed';
      case 'error':
        return 'failed';
      default:
        return 'idle';
    }
  };

  /**
   * Cancel indexing operation
   */
  const handleCancel = (documentId: string) => {
    console.log('[IndexingProgressPanel] Cancelling indexing:', documentId);

    const cancelData: RAGIndexingCancelData = {
      documentId,
      projectId,
      timestamp: new Date(),
    };

    eventBus.emit(DomainEventType.RAG_INDEXING_CANCEL_REQUESTED, cancelData);

    // Update local state
    setIndexingState((prevState) => ({
      ...prevState,
      documents: prevState.documents.map((doc) =>
        doc.id === documentId
          ? { ...doc, stage: 'cancelled' as IndexingStage }
          : doc
      ),
    }));
  };

  /**
   * Retry failed indexing
   */
  const handleRetry = (documentId: string) => {
    console.log('[IndexingProgressPanel] Retrying indexing:', documentId);

    const retryData: RAGIndexingRetryData = {
      documentId,
      projectId,
      timestamp: new Date(),
    };

    eventBus.emit(DomainEventType.RAG_INDEXING_RETRY_REQUESTED, retryData);

    // Update local state to reset document to idle
    setIndexingState((prevState) => ({
      ...prevState,
      documents: prevState.documents.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              stage: 'idle' as IndexingStage,
              error: undefined,
            }
          : doc
      ),
    }));
  };

  /**
   * Get stage icon
   */
  const getStageIcon = (stage: IndexingStage) => {
    switch (stage) {
      case 'idle':
        return <FileText className="h-4 w-4 text-gray-400" />;
      case 'chunking':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'embedding':
        return <Zap className="h-4 w-4 text-purple-500" />;
      case 'indexing':
        return <Database className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  /**
   * Get overall status badge
   */
  const getOverallStatusBadge = () => {
    if (indexingState.failedDocuments > 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          {t('indexing.status.failed', { count: indexingState.failedDocuments })}
        </Badge>
      );
    }

    if (indexingState.currentIndexingStage === 'embedding') {
      return (
        <Badge variant="outline" className="gap-1 border-purple-500 text-purple-500">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t('indexing.status.embedding')}
        </Badge>
      );
    }

    if (indexingState.currentIndexingStage === 'chunking') {
      return (
        <Badge variant="outline" className="gap-1 border-blue-500 text-blue-500">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t('indexing.status.chunking')}
        </Badge>
      );
    }

    if (indexingState.currentIndexingStage === 'indexing') {
      return (
        <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
          <Database className="h-3 w-3 animate-pulse" />
          {t('indexing.status.indexing')}
        </Badge>
      );
    }

    if (indexingState.completedDocuments === indexingState.totalDocuments && indexingState.totalDocuments > 0) {
      return (
        <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
          <CheckCircle2 className="h-3 w-3" />
          {t('indexing.status.completed')}
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="gap-1">
        <FileText className="h-3 w-3" />
        {t('indexing.status.idle')}
      </Badge>
    );
  };

  /**
   * Calculate overall progress percentage
   */
  const calculateOverallProgress = () => {
    if (indexingState.totalDocuments === 0) return 0;

    const totalProgress = indexingState.documents.reduce((sum, doc) => {
      return sum + doc.indexingProgress;
    }, 0);

    return Math.floor(totalProgress / indexingState.totalDocuments);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="indexing-progress-panel p-4 bg-background border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{t('indexing.title')}</h3>
        {getOverallStatusBadge()}
      </div>

      {/* Overall progress bar */}
      {indexingState.currentIndexingStage !== 'idle' && indexingState.currentIndexingStage !== 'completed' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>{t('indexing.overallProgress')}</span>
            <span>{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      )}

      {/* Vectors summary */}
      {indexingState.totalVectors > 0 && (
        <div className="mb-4 p-2 bg-muted/50 rounded text-xs">
          <span className="font-medium">{t('indexing.vectorsCount')}: </span>
          <span className="text-muted-foreground">
            {new Intl.NumberFormat().format(indexingState.totalVectors)} {t('indexing.vectors')}
          </span>
        </div>
      )}

      {/* Document indexing list */}
      <div className="space-y-3">
        {indexingState.documents.map((doc) => (
          <div
            key={doc.id}
            className="p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            {/* Document header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getStageIcon(doc.stage)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`indexing.stage.${doc.stage}`)}
                  </p>
                </div>
              </div>

              {/* Cancel button */}
              {(doc.stage === 'chunking' || doc.stage === 'embedding' || doc.stage === 'indexing') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(doc.id)}
                  className="h-7 w-7 p-0"
                >
                  <Pause className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Chunking progress */}
            {doc.stage === 'chunking' && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{t('indexing.chunking')}</span>
                  <span>
                    {doc.chunkingProgress.current} / {doc.chunkingProgress.total}
                  </span>
                </div>
                <Progress
                  value={(doc.chunkingProgress.current / doc.chunkingProgress.total) * 100}
                  className="h-1.5"
                />
              </div>
            )}

            {/* Embedding progress */}
            {doc.stage === 'embedding' && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{t('indexing.embedding')}</span>
                  <span>
                    {doc.embeddingProgress.current} / {doc.embeddingProgress.total}
                  </span>
                </div>
                <Progress
                  value={(doc.embeddingProgress.current / doc.embeddingProgress.total) * 100}
                  className="h-1.5"
                />
              </div>
            )}

            {/* Index building progress */}
            {doc.stage === 'indexing' && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{t('indexing.indexing')}</span>
                  <span>{doc.indexingProgress}%</span>
                </div>
                <Progress value={doc.indexingProgress} className="h-1.5" />
              </div>
            )}

            {/* Error state */}
            {doc.stage === 'failed' && doc.error && (
              <div className="mb-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs">
                <p className="text-red-500 font-medium mb-1">{t('indexing.error')}</p>
                <p className="text-red-400">{doc.error}</p>
              </div>
            )}

            {/* Estimated time remaining */}
            {doc.estimatedTimeRemaining && doc.stage !== 'completed' && doc.stage !== 'failed' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{t('indexing.eta')}: {formatDuration(doc.estimatedTimeRemaining)}</span>
              </div>
            )}

            {/* Retry button for failed documents */}
            {doc.stage === 'failed' && (
              <div className="flex justify-end mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetry(doc.id)}
                  className="h-7 px-3 text-xs"
                >
                  {t('indexing.retry')}
                </Button>
              </div>
            )}

            {/* Vectors created */}
            {doc.stage === 'completed' && doc.vectorsCount > 0 && (
              <div className="text-xs text-muted-foreground">
                {t('indexing.vectorsCreated')}: {new Intl.NumberFormat().format(doc.vectorsCount)}
              </div>
            )}
          </div>
        ))}

        {/* Empty state */}
        {indexingState.documents.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>{t('indexing.empty')}</p>
          </div>
        )}
      </div>

      {/* Summary stats */}
      {indexingState.totalDocuments > 0 && (
        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          {t('indexing.summary', {
            total: indexingState.totalDocuments,
            completed: indexingState.completedDocuments,
            processing: indexingState.totalDocuments - indexingState.completedDocuments - indexingState.failedDocuments,
            failed: indexingState.failedDocuments,
            vectors: new Intl.NumberFormat().format(indexingState.totalVectors),
          })}
        </div>
      )}
    </div>
  );
}

/**
 * i18n Translation Keys (add to en.json and vi.json)
 *
 * {
 *   "indexing": {
 *     "title": "Document Indexing",
 *     "status": {
 *       "idle": "Idle",
 *       "chunking": "Chunking",
 *       "embedding": "Generating Embeddings",
 *       "indexing": "Building Index",
 *       "completed": "Completed",
 *       "failed": "{{count}} Failed"
 *     },
 *     "overallProgress": "Overall Progress",
 *     "vectorsCount": "Total Vectors",
 *     "vectors": "vectors",
 *     "vectorsCreated": "vectors created",
 *     "chunking": "Creating chunks",
 *     "embedding": "Generating embeddings",
 *     "indexing": "Building search index",
 *     "error": "Indexing Failed",
 *     "eta": "ETA",
 *     "retry": "Retry",
 *     "empty": "No documents being indexed",
 *     "summary": "{{total}} documents: {{completed}} completed, {{processing}} processing, {{failed}} failed, {{vectors}} vectors"
 *   }
 * }
 */
