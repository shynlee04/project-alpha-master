/**
 * IDE Sidebar Panel Components
 *
 * Individual sidebar panel components with error boundaries.
 *
 * @layer Presentation
 * @component IDESidebarPanelComponents
 */

import { FileTree } from '../../ide/FileTree';
import { ExplorerPanel } from '../../ide/ExplorerPanel';
import { AgentsPanel } from '../../ide/AgentsPanel';
import { SearchPanel } from '../../ide/SearchPanel';
import { SettingsPanel } from '../../ide/SettingsPanel';
import { IDEErrorBoundaryWrapper } from './IDEErrorBoundaryWrapper';

interface BasePanelProps {
    selectedFilePath?: string;
    onFileSelect: (path: string, handle: FileSystemFileHandle) => void;
    fileTreeRefreshKey: number;
}

/**
 * Explorer panel with FileTree
 */
export function IDEExplorerPanel({ selectedFilePath, onFileSelect, fileTreeRefreshKey }: BasePanelProps) {
    return (
        <IDEErrorBoundaryWrapper panelName="Explorer">
            <ExplorerPanel>
                <FileTree
                    selectedPath={selectedFilePath}
                    onFileSelect={onFileSelect}
                    refreshKey={fileTreeRefreshKey}
                />
            </ExplorerPanel>
        </IDEErrorBoundaryWrapper>
    );
}

/**
 * Agents panel
 */
export function IDEAgentsPanel() {
    return (
        <IDEErrorBoundaryWrapper panelName="Agents">
            <AgentsPanel />
        </IDEErrorBoundaryWrapper>
    );
}

/**
 * Search panel
 */
export function IDESearchPanel() {
    return (
        <IDEErrorBoundaryWrapper panelName="Search">
            <SearchPanel />
        </IDEErrorBoundaryWrapper>
    );
}

/**
 * Settings panel
 */
export function IDESettingsPanel() {
    return (
        <IDEErrorBoundaryWrapper panelName="Settings">
            <SettingsPanel />
        </IDEErrorBoundaryWrapper>
    );
}
