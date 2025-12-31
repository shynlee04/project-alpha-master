/**
 * IDE Chat Panel Wrapper Component
 *
 * Renders the chat panel with error boundary and resizable wrapper.
 *
 * @layer Presentation
 * @component IDEChatPanel
 */

import { Suspense, lazy } from 'react';
import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WithErrorBoundary } from '@/components/common/ErrorBoundary';

const ChatPanelWrapper = lazy(() => import('../ChatPanelWrapper').then(m => ({ default: m.ChatPanelWrapper })));

interface IDEChatPanelProps {
    projectId: string | null;
    projectName: string;
    fileTools: any;
    terminalTools: any;
    eventBus: any;
    onClose: () => void;
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
 * IDE Chat Panel Component
 */
export function IDEChatPanel({
    projectId,
    projectName,
    fileTools,
    terminalTools,
    eventBus,
    onClose
}: IDEChatPanelProps) {
    return (
        <>
            <ResizableHandle
                withHandle
                className="w-2 bg-border hover:bg-accent transition-colors cursor-col-resize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                aria-label="Resize chat panel"
                aria-orientation="vertical"
            />
            <ResizablePanel id="ide-chat-panel" order={3} defaultSize={25} minSize={15} maxSize={40} className="bg-background">
                <Card id="chat-panel" className="h-full rounded-none border-0 bg-background" tabIndex={-1}>
                    <CardHeader className="h-8 md:h-10 px-3 md:px-4 py-1.5 md:py-2 border-b flex items-center bg-card">
                        <CardTitle className="text-xs md:text-sm font-semibold text-foreground">Chat</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-0">
                        <WithErrorBoundary
                            fallback={
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Chat Error</p>
                                        <p className="text-xs text-muted-foreground/70 mt-1">
                                            The chat panel encountered an error. Please refresh the page.
                                        </p>
                                    </div>
                                </div>
                            }
                        >
                            <Suspense fallback={<PanelLoading label="Chat" />}>
                                <ChatPanelWrapper
                                    projectId={projectId}
                                    projectName={projectName}
                                    onClose={onClose}
                                    fileTools={fileTools}
                                    terminalTools={terminalTools}
                                    eventBus={eventBus}
                                />
                            </Suspense>
                        </WithErrorBoundary>
                    </CardContent>
                </Card>
            </ResizablePanel>
        </>
    );
}
