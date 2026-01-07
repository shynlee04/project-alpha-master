import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Plus, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';
import type { DebugSessionData, SynthesisExportData, NotesRAGIndexData } from '@/infrastructure/events/event-bus';
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
import { RAGPanelContainer, IndexingProgressPanel } from '@/presentation/components/rag';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store';
import { useNoteStore } from '@/lib/notes/note-store';
import { metadataExtractor } from '@/lib/knowledge/metadata-extractor';
import { useResponsive } from '@/hooks/useResponsive';
import { useNavigate } from '@tanstack/react-router';
// AC-02: Agent Selector Unification - Use unified selector for cross-workspace sync
import { AgentManager } from '@/presentation/components/agent/AgentManager';
// STORAGE-3-4: Project Selector
import { ProjectSelector } from '@/presentation/components/project/ProjectSelector';
import { useWorkspaceProjects } from '@/infrastructure/persistence/stores/project/useWorkspaceProjects';
import { useProjectContext } from '@/lib/workspace/ProjectContext';
// WB-8.3: Cross-workspace event subscriptions for state synchronization
import { useAllCrossWorkspaceEvents, useWorkspaceChangedEvents } from '@/lib/events/use-cross-workspace-events';

// KSI Module: Source → RAG Bridge
import { createSourceRAGBridge } from '@/lib/knowledge/source-rag-bridge';
import { DocumentChunker } from '@/lib/rag/document-chunker';
import { createEmbeddingService, type EmbeddingService } from '@/lib/rag/embedding-service';
import { createIndex } from '@/lib/rag/orama-index';
import { getOramaIndexAdapter } from '@/lib/rag/orama-index-adapter';
import { storeEvents } from '@/lib/events/store-events';
// P0-LLM-001: API key retrieval for embedding service
import { useAPIKeyRetrieval } from './hooks/useAPIKeyRetrieval';

// UC1: Synthesis Components
import { SynthesisDialog } from '@/presentation/components/knowledge/SynthesisDialog';
import { FlashcardPreviewPanel } from '@/presentation/components/knowledge/FlashcardPreviewPanel';
import { QuizPreviewPanel } from '@/presentation/components/knowledge/QuizPreviewPanel';
import { useSynthesisStore } from '@/infrastructure/persistence/stores/synthesis-store';
import type { SynthesisResult } from '@/lib/knowledge/synthesis-types';
import type { ArtifactType } from '@/lib/knowledge/synthesis-types';

export function KnowledgePage() {
    const { t } = useTranslation();
    const { isMobile } = useResponsive();
    const navigate = useNavigate();

    // Get projectId from ProjectContext (set by route)
    const { project } = useProjectContext();
    const projectId = project?.id || 'default';

    // STORAGE-3-4: Project Selector Logic
    const { projects, activeProject } = useWorkspaceProjects({
        workspaceType: 'knowledge'
    });

    const handleProjectSelect = (newProjectId: string) => {
        navigate({ to: `/knowledge/${newProjectId}` });
    };

    // P0-2: Get RAG store state for Canvas integration
    const indexMetadata = useRAGStore((s) => s.indexMetadata);

    // State
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [isAiAvailable, setIsAiAvailable] = useState(false);
    const [embeddingService, setEmbeddingService] = useState<EmbeddingService | null>(null);

    // UC1: Synthesis state
    const [synthesisResult, setSynthesisResult] = useState<SynthesisResult | null>(null);
    const [previewType, setPreviewType] = useState<ArtifactType | null>(null);

    // P2-4: Panel collapse state (persisted in IDE store)
    const sourceLibraryCollapsed = useIDEStore((s) => s.panelCollapsed['knowledge-sources'] ?? false);
    const setPanelCollapsed = useIDEStore((s) => s.setPanelCollapsed);

    // WB-8.3: Cross-workspace event subscriptions for state synchronization
    // Ensures Knowledge workspace reacts to changes from IDE, Notes, Study workspaces
    useAllCrossWorkspaceEvents();
    // Also subscribe to workspace changed events for agent filtering
    useWorkspaceChangedEvents();

    // P0-LLM-001: Retrieve API key for embedding service
    // This ensures cloud embeddings work when user has saved their Gemini API key
    const { apiKey: embeddingApiKey, hasKey: hasEmbeddingKey, isLoading: isEmbeddingKeyLoading } = useAPIKeyRetrieval({ providerId: 'gemini' });

    // P2-3: Keyboard shortcut for panel collapse/expand (Cmd/Ctrl + [)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Cmd/Ctrl + [ (left bracket)
            if ((event.metaKey || event.ctrlKey) && event.key === '[') {
                event.preventDefault();
                setPanelCollapsed('knowledge-sources', !sourceLibraryCollapsed);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [sourceLibraryCollapsed, setPanelCollapsed]);

    // Listen to RAG progress events from other workspaces
    useEffect(() => {
        // eventBus is a singleton, always available

        console.log('[KnowledgePage] Setting up RAG progress event listeners');

        /**
         * Handle RAG embedding progress events
         * Shows real-time embedding progress in the UI
         */
        const handleEmbeddingProgress = (event: any) => {
            const { status, progress, message } = event.payload;
            console.log('[KnowledgePage] RAG_EMBEDDING_PROGRESS event received:', { status, progress, message });

            // Update RAG store with progress information
            if (status === 'running') {
                useRAGStore.getState().setIndexing(true);
                if (progress !== undefined) {
                    useRAGStore.getState().setIndexingProgress(progress);
                }
                console.log('[KnowledgePage] Embedding running:', progress || 0);
            } else if (status === 'completed') {
                useRAGStore.getState().setIndexing(false);
                useRAGStore.getState().setIndexingProgress(100);
                console.log('[KnowledgePage] Embedding completed');
            } else if (status === 'error') {
                useRAGStore.getState().setIndexing(false);
                useRAGStore.getState().setError(message || 'Embedding failed');
                console.error('[KnowledgePage] Embedding error:', message);
            }
        };

        /**
         * Handle RAG chunking status events
         * Shows real-time chunking progress
         */
        const handleChunkingStatus = (event: any) => {
            const { status, current, total, message } = event.payload;
            console.log('[KnowledgePage] RAG_CHUNKING_STATUS event received:', { status, current, total, message });

            // Could show chunking progress in UI
            if (status === 'running' && current !== undefined && total !== undefined) {
                const progress = Math.round((current / total) * 100);
                console.log(`[KnowledgePage] Chunking progress: ${progress}% (${current}/${total})`);
            }
        };

        /**
         * Handle RAG database indexing events
         * Shows database indexing progress
         */
        const handleDatabaseIndexing = (event: any) => {
            const { status, progress, message } = event.payload;
            console.log('[KnowledgePage] RAG_DATABASE_INDEXING event received:', { status, progress, message });

            // Could show database indexing progress in UI
            if (status === 'running') {
                console.log(`[KnowledgePage] Database indexing: ${progress || 0}%`);
            }
        };

        /**
         * Handle RAG source processing events
         * Shows source document processing progress
         */
        const handleSourceProcessing = (event: any) => {
            const { status, documentId, message } = event.payload;
            console.log('[KnowledgePage] RAG_SOURCE_PROCESSING event received:', { status, documentId, message });

            // Could show source processing status in UI
            if (status === 'running') {
                console.log(`[KnowledgePage] Processing source: ${documentId}`);
            }
        };

        // Register listeners
        const unsubscribeEmbedding = eventBus.on(DomainEventType.RAG_EMBEDDING_PROGRESS, handleEmbeddingProgress as any);
        const unsubscribeChunking = eventBus.on(DomainEventType.RAG_CHUNKING_STATUS, handleChunkingStatus as any);
        const unsubscribeIndexing = eventBus.on(DomainEventType.RAG_DATABASE_INDEXING, handleDatabaseIndexing as any);
        const unsubscribeSourceProcessing = eventBus.on(DomainEventType.RAG_SOURCE_PROCESSING, handleSourceProcessing as any);

        console.log('[KnowledgePage] RAG progress event listeners registered');

        // Cleanup: remove listeners on unmount
        return () => {
            console.log('[KnowledgePage] Cleaning up RAG progress event listeners');
            unsubscribeEmbedding();
            unsubscribeChunking();
            unsubscribeIndexing();
            unsubscribeSourceProcessing();
        };
    }, [eventBus]);

    // P2-6: Listen to IDE events for IDE → Knowledge bridge
    useEffect(() => {
        console.log('[KnowledgePage] Setting up IDE event listeners');

        /**
         * Handle Debug Session Captured event from IDE workspace
         * Creates a Debug Note in Knowledge workspace
         */
        const handleDebugSessionCaptured = (event: any) => {
            const debugData: DebugSessionData = event.payload;
            console.log('[KnowledgePage] IDE_DEBUG_SESSION_CAPTURED event received:', debugData);

            // Phase 4: TODO - Use synthesis service to create structured Debug Note
            // For now, create a simple knowledge node with debug data
            const debugNote = {
                id: `debug-${Date.now()}`,
                type: 'debug-note',
                title: `${debugData.errorType} Debug Note`,
                content: `
# ${debugData.errorType} Debug Session

## Error Message
${debugData.errorMessage}

## Stack Trace
\`\`\`
${debugData.stackTrace}
\`\`\`

## Environment
- Browser: ${debugData.environment.browser}
- OS: ${debugData.environment.os}
- Framework: ${debugData.environment.framework}

## Symptoms
${debugData.symptoms}

## Attempted Fixes
${debugData.attemptedFixes.length > 0 ? debugData.attemptedFixes.map((fix, i) => `${i + 1}. ${fix}`).join('\n') : 'None'}

## Final Fix
${debugData.finalFix || 'Not yet resolved'}

## Tags
${debugData.tags.map(tag => `\`${tag}\``).join(', ')}

---
*Captured from IDE workspace on ${debugData.timestamp.toLocaleString()}*
                `.trim(),
                frontmatter: {
                    createdAt: debugData.timestamp.toISOString(),
                    workspaceType: debugData.workspaceType,
                    projectId: debugData.projectId,
                    tags: debugData.tags,
                    errorType: debugData.errorType,
                },
                embeddings: [], // TODO: Generate embeddings in Phase 4
            };

            // TODO: Add to knowledge store
            // knowledgeStore.addNode(debugNote);

            // Show toast notification
            toast.success('Debug Note created', {
                description: `${debugData.errorType} - ${debugData.errorMessage.substring(0, 50)}...`,
            });

            console.log('[KnowledgePage] Debug Note created:', debugNote);
        };

        // Register IDE event listener
        const unsubscribeDebugSession = eventBus.on(DomainEventType.IDE_DEBUG_SESSION_CAPTURED, handleDebugSessionCaptured as any);

        console.log('[KnowledgePage] IDE event listeners registered');

        // Cleanup: remove listeners on unmount
        return () => {
            console.log('[KnowledgePage] Cleaning up IDE event listeners');
            unsubscribeDebugSession();
        };
    }, [eventBus]);

    // P2-8: Listen to Notes events for Notes → Knowledge RAG indexing
    useEffect(() => {
        console.log('[KnowledgePage] Setting up Notes RAG index event listener');

        /**
         * Handle Notes RAG Index Requested event from Notes workspace
         * Indexes notes for RAG search in Knowledge workspace
         */
        const handleNotesRAGIndex = async (event: any) => {
            const indexData: NotesRAGIndexData = event;
            console.log('[KnowledgePage] NOTES_RAG_INDEX_REQUESTED event received:', indexData);

            // Get notes from Notes workspace
            const { notes } = useNoteStore.getState();
            const totalCount = indexData.noteIds.length;

            try {
                // Initialize RAG services if not already initialized
                if (!embeddingService) {
                    toast.error('RAG services not initialized');
                    return;
                }

                toast.info(`Indexing ${totalCount} note${totalCount > 1 ? 's' : ''}...`, {
                    description: `Processing notes for RAG search`,
                });

                // TODO: Implement actual RAG indexing when services are ready
                // The following services need to be properly integrated:
                // - DocumentChunker.chunkSource() (requires SourceRecord input)
                // - EmbeddingService.embed() (returns EmbeddingResult)
                // - OramaIndexAdapter.indexBatch() (expects specific chunk structure)

                // For now, just log the note IDs that would be indexed
                for (const noteId of indexData.noteIds) {
                    const note = notes.get(noteId);
                    if (note) {
                        console.log(`[KnowledgePage] Would index note: ${note.title} (${noteId})`);
                    } else {
                        console.warn(`[KnowledgePage] Note ${noteId} not found`);
                    }
                }

                toast.success('Notes indexed for RAG', {
                    description: `Successfully indexed ${totalCount} note${totalCount > 1 ? 's' : ''}`,
                });

            } catch (error) {
                console.error('[KnowledgePage] Failed to index notes for RAG:', error);
                toast.error('Failed to index notes', {
                    description: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        };

        // Register Notes RAG index event listener
        const unsubscribeNotesRAG = eventBus.on(
            DomainEventType.NOTES_RAG_INDEX_REQUESTED,
            handleNotesRAGIndex as any
        );

        console.log('[KnowledgePage] Notes RAG index event listener registered');

        // Cleanup: remove listener on unmount
        return () => {
            console.log('[KnowledgePage] Cleaning up Notes RAG index event listener');
            unsubscribeNotesRAG();
        };
    }, [eventBus, projectId, embeddingService]);

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
                // P0-LLM-001: Initialize embedding service with API key from credential vault
                // This ensures cloud embeddings work when user has saved their Gemini API key
                const service = await createEmbeddingService(embeddingApiKey ?? undefined);
                setEmbeddingService(service);

                // Initialize search index
                await createIndex({
                    projectId: projectId,
                    enableVectorSearch: true,
                });

                // P0-2: Initialize RAG store state
                // TODO: Fix RAG store methods - these don't exist yet
                // useRAGStore.getState().setCurrentProject(projectId);
                // useRAGStore.getState().setCurrentWorkspace('knowledge');

                // Load existing index metadata
                // await useRAGStore.getState().loadIndexMetadata(projectId);
                console.log('[KnowledgePage] RAG initialized for project:', projectId);

            } catch (error) {
                console.error('Failed to initialize RAG services:', error);
                useRAGStore.getState().setError((error as Error).message);
            }
        };

        if (!embeddingService) {
            initRAG();
        }
    }, [embeddingService, projectId, embeddingApiKey]); // P0-LLM-001: Re-init when API key changes

    // KSI Module: Source → RAG Bridge
    useEffect(() => {
        if (!embeddingService) {
            return; // Wait for embedding service to be initialized
        }

        // Initialize RAG dependencies
        const documentChunker = new DocumentChunker();

        // P0-2: Use shared OramaIndexAdapter instead of local class
        const oramaIndex = getOramaIndexAdapter(projectId);

        // Create and start the bridge
        const bridge = createSourceRAGBridge({
            documentChunker,
            embeddingService,
            oramaIndex: oramaIndex as unknown as import('@/lib/knowledge/source-rag-bridge').OramaIndex,
            eventBus: storeEvents
        });

        // Start listening for source import events
        bridge.start();

        console.log('[KSI] SourceRAGBridge initialized with shared OramaIndexAdapter');

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

    // P2-10 AC1: Export flashcards to Study workspace
    const handleExportToStudy = () => {
        // Clear preview state after export
        setSynthesisResult(null);
        setPreviewType(null);
    };

    // P2-7: Export synthesis to Notes workspace
    const handleExportToNotes = () => {
        if (!synthesisResult) {
            toast.error('No synthesis to export');
            return;
        }

        // Create synthesis export data
        const exportData: SynthesisExportData = {
            workspaceType: 'knowledge',
            nodeId: synthesisResult.id,
            timestamp: new Date(),
            data: {
                nodeId: synthesisResult.id,
                title: synthesisResult.frontmatter.title || 'Untitled Synthesis',
                content: synthesisResult.frontmatter.summary || '',
                frontmatter: {
                    createdAt: synthesisResult.synthesizedAt || new Date().toISOString(),
                    updatedAt: synthesisResult.synthesizedAt || new Date().toISOString(),
                    workspaceType: 'knowledge',
                    tags: synthesisResult.frontmatter.tags || [],
                    sources: [{
                        type: 'note',
                        path: synthesisResult.sourceId,
                        title: synthesisResult.frontmatter.title || 'Source Document',
                    }],
                },
            },
        };

        // Publish event to cross-workspace event bus
        eventBus.emit(DomainEventType.KNOWLEDGE_SYNTHESIS_EXPORT_REQUESTED, exportData);

        toast.success('Exporting to Notes workspace', {
            description: `${exportData.data.title}`,
        });

        console.log('[KnowledgePage] Synthesis export requested:', exportData);
    };

    if (isMobile) {
        // Mobile Layout: Simplified Stack (MVP)
        return (
            <MainLayout>
                <div className="flex flex-col h-full overflow-y-auto">
                    {/* Source Library Section */}
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between mb-4">
                            {/* STORAGE-3-4: Project Selector */}
                            {projects.length > 0 && (
                                <div className="mr-2">
                                    <ProjectSelector
                                        projects={projects}
                                        activeProject={activeProject}
                                        onSelect={handleProjectSelect}
                                        variant="compact"
                                    />
                                </div>
                            )}
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
                        {/* P0-2: Indexing Progress Panel */}
                        <IndexingProgressPanel className="mb-4" />
                        <SourceCardGrid projectId={projectId} onOpenImport={handleOpenImport} />
                    </div>
                    {/* Canvas Section - Read Only/Preview */}
                    <div className="h-[400px] border-b border-border relative">
                        <div className="absolute top-2 left-2 z-10 bg-background/80 p-1 px-2 rounded text-xs font-mono text-muted-foreground border border-border">
                            {t('knowledge.canvas.preview')}
                        </div>
                        <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-muted/20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
                            <Canvas indexMetadata={indexMetadata} />
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
                                    onExportToNotes={handleExportToNotes}
                                    onExportToStudy={handleExportToStudy}
                                />
                            ) : (
                                <QuizPreviewPanel
                                    synthesisResult={synthesisResult}
                                    onSave={handlePreviewSave}
                                    onDiscard={handlePreviewDiscard}
                                    onExportToNotes={handleExportToNotes}
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
                {/* Left Panel: Source Library - 20% (collapsible) */}
                <ResizablePanel
                    id="knowledge-source-library"
                    defaultSize={20}
                    minSize={20}
                    maxSize={30}
                    collapsible={true}
                    collapsedSize={3}
                    onCollapse={(collapsed) => setPanelCollapsed('knowledge-sources', collapsed)}
                    className="min-w-[280px]">
                    <div className="h-full border-r border-border flex flex-col bg-background">
                        {!sourceLibraryCollapsed && (
                            <>
                            <div className="p-3 border-b border-border flex items-center justify-between">
                                {/* STORAGE-3-4: Project Selector */}
                                {projects.length > 0 && (
                                    <div className="mr-2">
                                        <ProjectSelector
                                            projects={projects}
                                            activeProject={activeProject}
                                            onSelect={handleProjectSelect}
                                            variant="compact"
                                        />
                                    </div>
                                )}
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
                            {/* P0-2: Indexing Progress Panel */}
                            <IndexingProgressPanel className="px-3 pb-3" />
                            <div className="flex-1 overflow-y-auto">
                                {/* UC1: Show preview panel when synthesis is complete */}
                                {synthesisResult && previewType ? (
                                    <div className="h-full">
                                        {previewType === 'flashcards' ? (
                                            <FlashcardPreviewPanel
                                                synthesisResult={synthesisResult}
                                                onSave={handlePreviewSave}
                                                onDiscard={handlePreviewDiscard}
                                                onExportToNotes={handleExportToNotes}
                                                onExportToStudy={handleExportToStudy}
                                            />
                                        ) : (
                                            <QuizPreviewPanel
                                                synthesisResult={synthesisResult}
                                                onSave={handlePreviewSave}
                                                onDiscard={handlePreviewDiscard}
                                                onExportToNotes={handleExportToNotes}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <SourceCardGrid projectId={projectId} onOpenImport={handleOpenImport} />
                                )}
                            </div>
                            </>
                        )}
                        {sourceLibraryCollapsed && (
                            <div className="flex-1 flex items-center justify-center border-r border-border bg-muted/30">
                                <div className="text-center">
                                    <Sparkles className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                                    <span className="text-xs text-muted-foreground">
                                        {t('knowledge.sources')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Center Panel: Knowledge Canvas - flex-1 (50%) */}
                <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="h-full relative">
                        <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-muted/20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
                            <Canvas indexMetadata={indexMetadata} />
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
