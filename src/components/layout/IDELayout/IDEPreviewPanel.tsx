/**
 * IDE Preview Panel Component
 *
 * Renders the preview panel with error boundary.
 *
 * @layer Presentation
 * @component IDEPreviewPanel
 */

import { Suspense, lazy } from 'react';
import { ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WithErrorBoundary } from '@/components/common/ErrorBoundary';

const PreviewPanel = lazy(() => import('../../ide/PreviewPanel').then(m => ({ default: m.PreviewPanel })));

interface IDEPreviewPanelProps {
    previewUrl: string | undefined;
    previewPort: number | undefined;
}

function PanelLoading({ label }: { label: string }) {
    return (
        <div className="h-full flex items-center justify-center text-muted-foreground bg-background">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                <span className="text-sm">Loading {label}...</span>
            </div>
        </div>
    );
}

/**
 * IDE Preview Panel Component
 */
export function IDEPreviewPanel({ previewUrl, previewPort }: IDEPreviewPanelProps) {
    return (
        <>
            <ResizableHandle
                withHandle
                orientation="vertical"
                className="w-2 bg-border hover:bg-accent transition-colors cursor-col-resize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                aria-label="Resize editor and preview panels"
                aria-orientation="vertical"
            />
            <ResizablePanel id="ide-preview-panel" defaultSize={40} minSize={15} className="bg-background">
                <Card className="h-full rounded-none border-0 bg-background">
                    <CardHeader className="h-8 md:h-10 px-3 md:px-4 py-1.5 md:py-2 border-b flex items-center bg-card">
                        <CardTitle className="text-xs md:text-sm font-semibold text-foreground">Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-0">
                        <WithErrorBoundary
                            fallback={
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Preview Error</p>
                                        <p className="text-xs text-muted-foreground/70 mt-1">
                                            The preview panel encountered an error.
                                        </p>
                                    </div>
                                </div>
                            }
                        >
                            <Suspense fallback={<PanelLoading label="Preview" />}>
                                <PreviewPanel previewUrl={previewUrl} port={previewPort} />
                            </Suspense>
                        </WithErrorBoundary>
                    </CardContent>
                </Card>
            </ResizablePanel>
        </>
    );
}
