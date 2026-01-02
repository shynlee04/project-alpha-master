import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Plus, Bot } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layout/MainLayout';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/presentation/components/ui/resizable';
import { Button } from '@/presentation/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/presentation/components/ui/tooltip';
import { SourceCardGrid } from '@/presentation/components/knowledge/SourceCardGrid';
const Canvas = lazy(() => {
    if (import.meta.env.SSR) {
        return Promise.resolve({ default: () => <></> });
    }
    return import('@/presentation/components/canvas/Canvas');
});
import { SourceImportDialog } from '@/presentation/components/knowledge/SourceImportDialog';
import { RAGPanelContainer } from '@/presentation/components/rag';
import { useIDEStore } from '@/lib/state/ide-store';
import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store';
import { metadataExtractor } from '@/lib/knowledge/metadata-extractor';
import { useResponsive } from '@/hooks/useResponsive';
// AC-02: Agent Selector Unification - Use unified selector for cross-workspace sync
import { AgentManager } from '@/presentation/components/agent/AgentManager';

// KSI Module: Source → RAG Bridge
import { createSourceRAGBridge } from '@/lib/knowledge/source-rag-bridge';
import { DocumentChunker } from '@/lib/rag/document-chunker';
import { createEmbeddingService, type EmbeddingService } from '@/lib/rag/embedding-service';
import { indexSource, searchIndex, createIndex } from '@/lib/rag/orama-index';
import { storeEvents } from '@/lib/events/store-events';

// UC1: Synthesis Components
import { SynthesisDialog } from '@/presentation/components/knowledge/SynthesisDialog';
import { FlashcardPreviewPanel } from '@/presentation/components/knowledge/FlashcardPreviewPanel';
import { QuizPreviewPanel } from '@/presentation/components/knowledge/QuizPreviewPanel';
import { useSynthesisStore } from '@/infrastructure/persistence/stores/synthesis-store';
import type { SynthesisResult } from '@/lib/knowledge/synthesis-types';
import type { ArtifactType } from '@/lib/knowledge/synthesis-types';

export function KnowledgePage() {
    const { t } = useTranslation();
    // Get current project ID, default to 'default' if not set
    const projectId = useIDEStore((state) => state.projectId) || 'default';
    const { isMobile } = useResponsive();

    // State
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [isAiAvailable, setIsAiAvailable] = useState(false);
    const [embeddingService, setEmbeddingService] = useState<EmbeddingService | null>(null);

    // UC1: Synthesis state
    const [synthesisResult, setSynthesisResult] = useState<SynthesisResult | null>(null);
    const [previewType, setPreviewType] = useState<ArtifactType | null>(null);

    // Check Gemini API availability
    useEffect(() => {
        const checkAiStatus = async () => {
            const available = await metadataExtractor.isAvailable();
            setIsAiAvailable(available);
        };
        checkAiStatus();
    }, []);

    // Initialize RAG services
    useEffect(() => {
        const initRAG = async () => {
            try {
                // Initialize embedding service
                const service = await createEmbeddingService();
                setEmbeddingService(service);

                // Initialize search index
                await createIndex({
                    projectId: projectId,
                    enableVectorSearch: true,
                });

                // Load server-side stats into store
                useRAGStore.getState().loadIndexMetadata(projectId);

            } catch (error) {
                console.error('Failed to initialize RAG services:', error);
                useRAGStore.getState().setError((error as Error).message);
            }
        };

        if (!embeddingService) {
            initRAG();
        }
    }, [embeddingService, projectId]);

    // KSI Module: Source → RAG Bridge
    useEffect(() => {
        if (!embeddingService) {
            return; // Wait for embedding service to be initialized
        }

        // Initialize RAG dependencies
        const documentChunker = new DocumentChunker();

        // Create OramaIndex adapter class
        class OramaIndexAdapter {
            constructor(private projectId: string) { }

            async indexBatch(chunks: any[]): Promise<void> {
                // Group chunks by source and index
                for (const chunk of chunks) {
                    // Adapter for mismatched types in SourceRAGBridge
                    await indexSource(this.projectId, chunk.sourceId || 'unknown', chunk.content, {
                        title: chunk.title,
                        embedding: chunk.embedding
                    });
                }
                // Update global store with new stats
                useRAGStore.getState().loadIndexMetadata(this.projectId);
            }

            async search(query: string, limit?: number): Promise<any[]> {
                const results = await searchIndex(this.projectId, query, {
                    limit: limit || 10
                });
                return results;
            }
        }

        const oramaIndex = new OramaIndexAdapter(projectId);

        // Create and start the bridge
        const bridge = createSourceRAGBridge({
            documentChunker,
            embeddingService,
            oramaIndex,
            eventBus: storeEvents
        });

        // Start listening for source import events
        bridge.start();

        console.log('[KSI] SourceRAGBridge initialized and started');

        // Cleanup on unmount
        return () => {
            bridge.dispose();
            console.log('[KSI] SourceRAGBridge disposed');
        };
    }, [projectId, embeddingService]); // Added embeddingService dependency

    const handleOpenImport = () => setImportDialogOpen(true);

    // UC1: Synthesis handlers
    const handleSynthesisComplete = (synthesisId: string) => {
        // Get synthesis result from store
        const { syntheses } = useSynthesisStore.getState();

        const synthesis = syntheses.find(s => s.id === synthesisId);
        if (synthesis?.result) {
            setSynthesisResult(synthesis.result);
            setPreviewType(synthesis.artifactType);
        }
    };

    const handlePreviewSave = () => {
        // Clear preview state after saving
        setSynthesisResult(null);
        setPreviewType(null);
    };

    const handlePreviewDiscard = () => {
        // Clear preview state without saving
        setSynthesisResult(null);
        setPreviewType(null);
    };

    if (isMobile) {
        // Mobile Layout: Simplified Stack (MVP)
        return (
            <MainLayout>
                <div className="flex flex-col h-full overflow-y-auto">
                    {/* Source Library Section */}
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-mono font-bold flex items-center gap-2">
                                <Sparkles size={16} className="text-primary" /> {t('knowledge.sources')}
                            </h2>
                            <div className="flex items-center gap-2">
                                {/* AC-02: Agent Manager - comprehensive agent management UI */}
                                <AgentManager
                                    variant="compact"
                                    workspaceType="knowledge"
                                />
                                {isAiAvailable && (
                                    <Sparkles size={14} className="text-primary animate-pulse" />
                                )}
                                <Button size="sm" onClick={handleOpenImport}>
                                    <Plus size={16} />
                                </Button>
                                <SynthesisDialog
                                    sourceIds={[]}
                                    onComplete={handleSynthesisComplete}
                                />
                            </div>
                        </div>
                        <SourceCardGrid projectId={projectId} onOpenImport={handleOpenImport} />
                    </div>
                    {/* Canvas Section - Read Only/Preview */}
                    <div className="h-[400px] border-b border-border relative">
                        <div className="absolute top-2 left-2 z-10 bg-background/80 p-1 px-2 rounded text-xs font-mono text-muted-foreground border border-border">
                            {t('knowledge.canvas.preview')}
                        </div>
                        <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-muted/20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
                            <Canvas />
                        </Suspense>
                    </div>
                    {/* UC1: Synthesis Preview Panel */}
                    {synthesisResult && previewType && (
                        <div className="flex-1 border-b border-border">
                            {previewType === 'flashcards' ? (
                                <FlashcardPreviewPanel
                                    synthesisResult={synthesisResult}
                                    onSave={handlePreviewSave}
                                    onDiscard={handlePreviewDiscard}
                                />
                            ) : (
                                <QuizPreviewPanel
                                    synthesisResult={synthesisResult}
                                    onSave={handlePreviewSave}
                                    onDiscard={handlePreviewDiscard}
                                />
                            )}
                        </div>
                    )}
                </div>
                <SourceImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} projectId={projectId} />
            </MainLayout>
        );
    }

    // Desktop Layout: 3-Column Resizable
    return (
        <MainLayout>
            <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
                {/* Left Panel: Source Library - 20% */}
                <ResizablePanel defaultSize={20} minSize={20} maxSize={30} className="min-w-[280px]">
                    <div className="h-full border-r border-border flex flex-col bg-background">
                        <div className="p-3 border-b border-border flex items-center justify-between">
                            <span className="font-mono font-bold text-sm">{t('knowledge.sources')}</span>
                            <div className="flex items-center gap-2">
                                {/* AC-02: Agent Manager - comprehensive agent management UI */}
                                <AgentManager
                                    variant="compact"
                                    workspaceType="knowledge"
                                />
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className={`p-1.5 rounded-full ${isAiAvailable ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                <Bot size={14} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{isAiAvailable ? t('knowledge.ai.active') : t('knowledge.ai.disabled')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <Button variant="ghost" size="sm" className="h-6 w-6" onClick={handleOpenImport}>
                                    <Plus className="h-3 w-3" />
                                </Button>
                                <SynthesisDialog
                                    sourceIds={[]}
                                    onComplete={handleSynthesisComplete}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {/* UC1: Show preview panel when synthesis is complete */}
                            {synthesisResult && previewType ? (
                                <div className="h-full">
                                    {previewType === 'flashcards' ? (
                                        <FlashcardPreviewPanel
                                            synthesisResult={synthesisResult}
                                            onSave={handlePreviewSave}
                                            onDiscard={handlePreviewDiscard}
                                        />
                                    ) : (
                                        <QuizPreviewPanel
                                            synthesisResult={synthesisResult}
                                            onSave={handlePreviewSave}
                                            onDiscard={handlePreviewDiscard}
                                        />
                                    )}
                                </div>
                            ) : (
                                <SourceCardGrid projectId={projectId} onOpenImport={handleOpenImport} />
                            )}
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Center Panel: Knowledge Canvas - flex-1 (50%) */}
                <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="h-full relative">
                        <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-muted/20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
                            <Canvas />
                        </Suspense>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Right Panel: RAG Search & Chat - 30% */}
                <ResizablePanel defaultSize={30} minSize={20} maxSize={45}>
                    <div className="h-full border-l border-border">
                        <RAGPanelContainer projectId={projectId} />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>

            <SourceImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} projectId={projectId} />
        </MainLayout>
    );
}
