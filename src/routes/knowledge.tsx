/**
 * Knowledge Route - Knowledge Synthesis Hub
 *
 * Routes to the Knowledge Synthesis Station (Phase 2 MVP).
 * Integrated Source Library, Knowledge Canvas, and Synthesis Panel.
 *
 * @epic Epic-6 Source Ingestion & Management
 * @epic Epic-8 Knowledge Canvas
 * @story 6-2 Source Card UI
 * @story 8-1 React Flow Canvas Setup
 * 
 * @file knowledge.tsx
 * @created 2025-12-27T01:10:00Z
 * @updated 2025-12-30T03:30:00Z
 */

import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '@/components/layout/MainLayout';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import { SourceCardGrid } from '@/components/knowledge/SourceCardGrid';
import { Canvas } from '@/components/canvas/Canvas';
import { useIDEStore } from '@/lib/state/ide-store';
import { useResponsive } from '@/hooks/useResponsive';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/knowledge')({
    component: KnowledgePage,
});

function KnowledgePage() {
    const { t } = useTranslation();
    // Get current project ID, default to 'default' if not set
    const projectId = useIDEStore((state) => state.projectId) || 'default';
    const { isMobile } = useResponsive();

    if (isMobile) {
        // Mobile Layout: Simplified Stack (MVP)
        return (
            <MainLayout>
                <div className="flex flex-col h-full overflow-y-auto">
                    {/* Source Library Section */}
                    <div className="p-4 border-b border-border">
                        <h2 className="font-mono font-bold mb-4 flex items-center gap-2">
                            <Sparkles size={16} className="text-primary" /> {t('knowledge.sources')}
                        </h2>
                        <SourceCardGrid projectId={projectId} />
                    </div>
                    {/* Canvas Section - Read Only/Preview */}
                    <div className="h-[400px] border-b border-border relative">
                        <div className="absolute top-2 left-2 z-10 bg-background/80 p-1 px-2 rounded text-xs font-mono text-muted-foreground border border-border">
                            {t('knowledge.canvas.preview')}
                        </div>
                        <Canvas />
                    </div>
                </div>
            </MainLayout>
        );
    }

    // Desktop Layout: 3-Column Resizable
    return (
        <MainLayout>
            <ResizablePanelGroup direction="horizontal" className="h-full w-full">
                {/* Left Panel: Source Library */}
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                    <div className="h-full flex flex-col border-r border-border bg-background">
                        <div className="p-3 border-b border-border flex items-center justify-between">
                            <span className="font-mono font-bold text-sm">{t('knowledge.sources')}</span>
                            <span className="text-xs text-muted-foreground bg-accent px-1.5 py-0.5 rounded">
                                {projectId === 'default' ? t('knowledge.scope.global') : t('knowledge.scope.project')}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <SourceCardGrid projectId={projectId} />
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* Center Panel: Knowledge Canvas */}
                <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="h-full w-full relative">
                        <Canvas />
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* Right Panel: Synthesis & Chat (Placeholder) */}
                <ResizablePanel defaultSize={30} minSize={20}>
                    <div className="h-full flex flex-col bg-sidebar/30 border-l border-border">
                        <div className="p-3 border-b border-border font-mono font-bold text-sm flex items-center gap-2">
                            <Sparkles size={14} className="text-secondary" />
                            {t('knowledge.synthesis.title')}
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm p-6 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-accent/50 flex items-center justify-center mb-2 animate-pulse">
                                <Sparkles size={32} className="text-primary/50" />
                            </div>
                            <p>{t('knowledge.synthesis.placeholder.text')}</p>
                            <div className="text-xs border border-dashed border-border p-2 rounded max-w-xs">
                                {t('knowledge.synthesis.placeholder.feature')}
                            </div>
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </MainLayout>
    );
}

export default KnowledgePage;
