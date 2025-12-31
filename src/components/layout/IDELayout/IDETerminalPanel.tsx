/**
 * IDE Terminal Panel Component
 *
 * Renders the terminal panel with error boundary.
 *
 * @layer Presentation
 * @component IDETerminalPanel
 */

import { Suspense, lazy } from 'react';
import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WithErrorBoundary } from '@/components/common/ErrorBoundary';

const TerminalPanel = lazy(() => import('../TerminalPanel').then(m => ({ default: m.TerminalPanel })));

interface IDETerminalPanelProps {
    terminalTab: string;
    onTabChange: (tab: string) => void;
    initialSyncCompleted: boolean;
    permissionState: any;
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
 * IDE Terminal Panel Component
 */
export function IDETerminalPanel({
    terminalTab,
    onTabChange,
    initialSyncCompleted,
    permissionState
}: IDETerminalPanelProps) {
    return (
        <>
            <ResizableHandle
                withHandle
                orientation="horizontal"
                className="h-2 bg-border hover:bg-accent transition-colors cursor-row-resize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                aria-label="Resize editor and terminal panels"
                aria-orientation="horizontal"
            />
            <ResizablePanel id="ide-terminal-panel" defaultSize={30} minSize={10} maxSize={50} className="bg-background">
                <Card className="h-full rounded-none border-0 bg-background">
                    <CardHeader className="h-8 md:h-10 px-3 md:px-4 py-1.5 md:py-2 border-b flex items-center bg-card">
                        <CardTitle className="text-xs md:text-sm font-semibold text-foreground">Terminal</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-0">
                        <WithErrorBoundary
                            fallback={
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Terminal Error</p>
                                        <p className="text-xs text-muted-foreground/70 mt-1">
                                            The terminal encountered an error. Please refresh the page.
                                        </p>
                                    </div>
                                </div>
                            }
                        >
                            <Suspense fallback={<PanelLoading label="Terminal" />}>
                                <TerminalPanel
                                    activeTab={terminalTab}
                                    onTabChange={onTabChange}
                                    initialSyncCompleted={initialSyncCompleted}
                                    permissionState={permissionState}
                                    className="border-0"
                                />
                            </Suspense>
                        </WithErrorBoundary>
                    </CardContent>
                </Card>
            </ResizablePanel>
        </>
    );
}
