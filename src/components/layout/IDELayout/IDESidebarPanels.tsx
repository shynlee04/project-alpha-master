/**
 * IDE Sidebar Panels Component
 *
 * Renders the active sidebar panel content.
 *
 * @layer Presentation
 * @component IDESidebarPanels
 */

import { useSidebar } from '../../ide/IconSidebar';
import { WithErrorBoundary } from '@/components/common/ErrorBoundary';
import { FileTree } from '../../ide/FileTree';
import { ExplorerPanel } from '../../ide/ExplorerPanel';
import { AgentsPanel } from '../../ide/AgentsPanel';
import { SearchPanel } from '../../ide/SearchPanel';
import { SettingsPanel } from '../../ide/SettingsPanel';

interface IDESidebarPanelsProps {
    selectedFilePath?: string;
    onFileSelect: (path: string, handle: FileSystemFileHandle) => void;
    fileTreeRefreshKey: number;
}

/**
 * IDE Sidebar Panels Component
 */
export function IDESidebarPanels({
    selectedFilePath,
    onFileSelect,
    fileTreeRefreshKey
}: IDESidebarPanelsProps) {
    const { activePanel } = useSidebar();

    switch (activePanel) {
        case 'explorer':
            return (
                <WithErrorBoundary
                    fallback={
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <p className="text-sm font-medium">Explorer Error</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">
                                    The file explorer encountered an error. Please refresh the page.
                                </p>
                            </div>
                        </div>
                    }
                >
                    <ExplorerPanel>
                        <FileTree
                            selectedPath={selectedFilePath}
                            onFileSelect={onFileSelect}
                            refreshKey={fileTreeRefreshKey}
                        />
                    </ExplorerPanel>
                </WithErrorBoundary>
            );
        case 'agents':
            return (
                <WithErrorBoundary
                    fallback={
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <p className="text-sm font-medium">Agents Error</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">
                                    The agents panel encountered an error. Please refresh the page.
                                </p>
                            </div>
                        </div>
                    }
                >
                    <AgentsPanel />
                </WithErrorBoundary>
            );
        case 'search':
            return (
                <WithErrorBoundary
                    fallback={
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <p className="text-sm font-medium">Search Error</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">
                                    The search panel encountered an error. Please refresh the page.
                                </p>
                            </div>
                        </div>
                    }
                >
                    <SearchPanel />
                </WithErrorBoundary>
            );
        case 'settings':
            return (
                <WithErrorBoundary
                    fallback={
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <p className="text-sm font-medium">Settings Error</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">
                                    The settings panel encountered an error. Please refresh the page.
                                </p>
                            </div>
                        </div>
                    }
                >
                    <SettingsPanel />
                </WithErrorBoundary>
            );
        default:
            return (
                <WithErrorBoundary
                    fallback={
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <p className="text-sm font-medium">Explorer Error</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">
                                    The file explorer encountered an error. Please refresh the page.
                                </p>
                            </div>
                        </div>
                    }
                >
                    <ExplorerPanel>
                        <FileTree
                            selectedPath={selectedFilePath}
                            onFileSelect={onFileSelect}
                            refreshKey={fileTreeRefreshKey}
                        />
                    </ExplorerPanel>
                </WithErrorBoundary>
            );
    }
}
