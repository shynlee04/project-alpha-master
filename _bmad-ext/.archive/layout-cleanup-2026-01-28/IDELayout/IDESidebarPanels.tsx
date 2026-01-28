/**
 * IDE Sidebar Panels Component
 *
 * Renders the active sidebar panel content.
 *
 * @layer Presentation
 * @component IDESidebarPanels
 */

import { useSidebar } from '../../ide/IconSidebar';
import { IDEExplorerPanel, IDEAgentsPanel, IDESearchPanel, IDESettingsPanel } from './IDESidebarPanelComponents';

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
            return <IDEExplorerPanel selectedFilePath={selectedFilePath} onFileSelect={onFileSelect} fileTreeRefreshKey={fileTreeRefreshKey} />;
        case 'agents':
            return <IDEAgentsPanel />;
        case 'search':
            return <IDESearchPanel />;
        case 'settings':
            return <IDESettingsPanel />;
        default:
            return <IDEExplorerPanel selectedFilePath={selectedFilePath} onFileSelect={onFileSelect} fileTreeRefreshKey={fileTreeRefreshKey} />;
    }
}
