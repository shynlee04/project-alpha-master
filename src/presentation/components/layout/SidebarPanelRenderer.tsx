/**
 * SidebarPanelRenderer Component
 * Renders the correct panel based on active sidebar icon
 * Max 120 lines
 */

import { ExplorerPanel } from '../ide/ExplorerPanel';
import { AgentsPanel } from '../ide/AgentsPanel';
import { SearchPanel } from '../ide/SearchPanel';
import { SettingsPanel } from '../ide/SettingsPanel';
import { useSidebar } from '../ide/IconSidebar';

interface SidebarPanelRendererProps {
  selectedFilePath?: string;
  onFileSelect?: (path: string) => void;
  fileTreeRefreshKey?: number;
}

export function SidebarPanelRenderer({
  selectedFilePath,
  onFileSelect,
  fileTreeRefreshKey
}: SidebarPanelRendererProps) {
  const { activePanel } = useSidebar();

  switch (activePanel) {
    case 'explorer':
      return (
        <ExplorerPanel
          key={fileTreeRefreshKey}
          selectedFilePath={selectedFilePath}
          onFileSelect={onFileSelect}
        />
      );

    case 'agents':
      return <AgentsPanel />;

    case 'search':
      return <SearchPanel />;

    case 'settings':
      return <SettingsPanel />;

    default:
      return (
        <ExplorerPanel
          key={fileTreeRefreshKey}
          selectedFilePath={selectedFilePath}
          onFileSelect={onFileSelect}
        />
      );
  }
}
