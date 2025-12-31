/**
 * IDE Chat Panel Wrapper Component
 *
 * Renders the chat panel with error boundary and resizable wrapper.
 *
 * @layer Presentation
 * @component IDEChatPanel
 */

import { Suspense, lazy } from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/card';
import { WithErrorBoundary } from '@/presentation/components/common/ErrorBoundary';

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
    );
}
