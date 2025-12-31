/**
 * IDE Editor Panel Component
 *
 * Renders the Monaco editor panel with error boundary.
 *
 * @layer Presentation
 * @component IDEEditorPanel
 */

import { Suspense, lazy } from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/card';
import { WithErrorBoundary } from '@/presentation/components/common/ErrorBoundary';
import type { OpenFile } from '../../ide/MonacoEditor';

const MonacoEditor = lazy(() => import('../../ide/MonacoEditor').then(m => ({ default: m.MonacoEditor })));

interface IDEEditorPanelProps {
    openFiles: OpenFile[];
    activeFilePath: string | undefined;
    onSave: () => void;
    onActiveFileChange: (path: string) => void;
    onTabClose: (path: string) => void;
    onContentChange: (path: string, content: string) => void;
    restoredIdeState: any;
    activeFileScrollTopRef: React.RefObject<number | undefined>;
    scheduleIdeStatePersistence: (ms: number) => void;
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
 * IDE Editor Panel Component
 */
export function IDEEditorPanel({
    openFiles,
    activeFilePath,
    onSave,
    onActiveFileChange,
    onTabClose,
    onContentChange,
    restoredIdeState,
    activeFileScrollTopRef,
    scheduleIdeStatePersistence
}: IDEEditorPanelProps) {
    return (
        <Card id="editor-panel" className="h-full rounded-none border-0 bg-background" tabIndex={-1}>
            <CardHeader className="h-8 md:h-10 px-3 md:px-4 py-1.5 md:py-2 border-b flex items-center bg-card">
                <CardTitle className="text-xs md:text-sm font-semibold text-foreground">Editor</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
                <WithErrorBoundary
                    fallback={
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <p className="text-sm font-medium">Editor Error</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">
                                    The code editor encountered an error. Please refresh the page.
                                </p>
                            </div>
                        </div>
                    }
                >
                    <Suspense fallback={<PanelLoading label="Editor" />}>
                        <MonacoEditor
                            openFiles={openFiles}
                            activeFilePath={activeFilePath ?? null}
                            onSave={onSave}
                            onActiveFileChange={onActiveFileChange}
                            onTabClose={onTabClose}
                            onContentChange={onContentChange}
                            initialScrollTop={activeFilePath && activeFilePath === restoredIdeState?.activeFile ? restoredIdeState.activeFileScrollTop : undefined}
                            onScrollTopChange={(_path, scrollTop) => {
                                activeFileScrollTopRef.current = scrollTop;
                                scheduleIdeStatePersistence(400);
                            }}
                        />
                    </Suspense>
                </WithErrorBoundary>
            </CardContent>
        </Card>
    );
}
