import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Plus, Bot } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SourceCardGrid } from '@/components/knowledge/SourceCardGrid';
const Canvas = lazy(() => {
    if (import.meta.env.SSR) {
        return Promise.resolve({ default: () => <></> });
    }
    return import('@/components/canvas/Canvas');
});
import { SourceImportDialog } from '@/components/knowledge/SourceImportDialog';
import { RAGPanelContainer } from '@/components/rag';
import { useIDEStore } from '@/lib/state/ide-store';
import { metadataExtractor } from '@/lib/knowledge/metadata-extractor';
import { useResponsive } from '@/hooks/useResponsive';

export function KnowledgePage() {
    const { t } = useTranslation();
    // Get current project ID, default to 'default' if not set
    const projectId = useIDEStore((state) => state.projectId) || 'default';
    const { isMobile } = useResponsive();

    // State
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [isAiAvailable, setIsAiAvailable] = useState(false);

    // Check Gemini API availability
    useEffect(() => {
        const checkAiStatus = async () => {
            const available = await metadataExtractor.isAvailable();
            setIsAiAvailable(available);
        };
        checkAiStatus();
    }, []);

    const handleOpenImport = () => setImportDialogOpen(true);

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
                                {isAiAvailable && (
                                    <Sparkles size={14} className="text-primary animate-pulse" />
                                )}
                                <Button size="sm" onClick={handleOpenImport}>
                                    <Plus size={16} />
                                </Button>
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
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                    <div className="h-full border-r border-border flex flex-col bg-background">
                        <div className="p-3 border-b border-border flex items-center justify-between">
                            <span className="font-mono font-bold text-sm">{t('knowledge.sources')}</span>
                            <div className="flex items-center gap-2">
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
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <SourceCardGrid projectId={projectId} onOpenImport={handleOpenImport} />
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
