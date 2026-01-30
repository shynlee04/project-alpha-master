/**
 * @fileoverview BottomNavigation - Mobile/Tablet bottom navigation component
 * @module presentation/components/layout/BottomNavigation
 *
 * EPIC-UXUI-04: Responsive Layout Implementation
 * - Fixed bottom navigation bar
 * - Height: 64px
 * - Shows active plugin icons
 * - Tap to switch panels
 * - 8-bit design compliance
 *
 * @story UXUI-04-07
 * @created 2026-01-30
 */

import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  FolderOpen,
  FileText,
  MessageSquare,
  Terminal,
  Bot,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import type { PluginId } from '@/domain/types/plugin-types';
import type {
  BottomNavigationProps,
  BottomNavItemProps,
} from './responsive-types';
import { BOTTOM_NAV_HEIGHT, TOUCH_TARGET_SIZE } from './responsive-types';
import './BottomNavigation.css';

// ============================================================================
// Plugin Configuration
// ============================================================================

/**
 * Plugin configuration for bottom navigation icons
 */
interface PluginConfig {
  id: PluginId;
  name: string;
  icon: LucideIcon;
  shortcut?: string;
}

const PLUGIN_CONFIGS: Record<PluginId, PluginConfig> = {
  filetree: {
    id: 'filetree',
    name: 'Files',
    icon: FolderOpen,
    shortcut: 'Ctrl+Shift+E',
  },
  monaco: {
    id: 'monaco',
    name: 'Editor',
    icon: FileText,
    shortcut: 'Ctrl+1',
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    icon: FileText,
    shortcut: 'Ctrl+2',
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    icon: Terminal,
    shortcut: 'Ctrl+`',
  },
  chat: {
    id: 'chat',
    name: 'Chat',
    icon: MessageSquare,
    shortcut: 'Ctrl+Shift+C',
  },
  agents: {
    id: 'agents',
    name: 'Agents',
    icon: Bot,
    shortcut: 'Ctrl+Shift+A',
  },
  preview: {
    id: 'preview',
    name: 'Preview',
    icon: Eye,
    shortcut: 'Ctrl+Shift+V',
  },
};

// ============================================================================
// BottomNavItem Component
// ============================================================================

/**
 * BottomNavItem Component
 *
 * Individual navigation item in the bottom navigation bar.
 * Displays plugin icon with active state indicator.
 *
 * @param props - BottomNavItemProps
 * @returns React component
 */
const BottomNavItem: React.FC<BottomNavItemProps> = ({
  pluginId,
  isActive,
  onClick,
}) => {
  const { t } = useTranslation();
  const config = PLUGIN_CONFIGS[pluginId];

  if (!config) {
    console.warn(`[BottomNavItem] Unknown plugin ID: ${pluginId}`);
    return null;
  }

  const Icon = config.icon;

  return (
    <button
      type="button"
      className={cn(
        'bottom-nav__item',
        isActive && 'bottom-nav__item--active'
      )}
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={config.name}
      title={`${config.name}${config.shortcut ? ` (${config.shortcut})` : ''}`}
      style={{
        minWidth: TOUCH_TARGET_SIZE,
        minHeight: TOUCH_TARGET_SIZE,
      }}
    >
      <Icon
        size={24}
        className="bottom-nav__icon"
        aria-hidden="true"
      />
      <span className="bottom-nav__label">
        {t(`plugin.${pluginId}.shortName`, config.name)}
      </span>
      {isActive && (
        <span className="bottom-nav__indicator" aria-hidden="true" />
      )}
    </button>
  );
};

// ============================================================================
// Main BottomNavigation Component
// ============================================================================

/**
 * BottomNavigation Component
 *
 * Fixed bottom navigation bar for mobile and tablet portrait layouts.
 * Displays plugin icons and handles plugin switching.
 *
 * @param props - BottomNavigationProps
 * @returns React component
 *
 * @example
 * ```tsx
 * function MobileLayout() {
 *   const plugins = ['notes', 'chat', 'filetree'];
 *   const [activePlugin, setActivePlugin] = useState('notes');
 *
 *   return (
 *     <BottomNavigation
 *       plugins={plugins}
 *       activePluginId={activePlugin}
 *       onPluginSelect={setActivePlugin}
 *       isVisible={true}
 *     />
 *   );
 * }
 * ```
 */
export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  className,
  activePluginId,
  plugins,
  onPluginSelect,
  isVisible,
}) => {
  const { t } = useTranslation();

  // Get plugin switching function from store
  const { switchPlugin } = usePluginLayoutStore(
    useShallow((state) => ({
      switchPlugin: state.switchPlugin,
    }))
  );

  /**
   * Handle plugin selection
   */
  const handlePluginSelect = useCallback(
    (pluginId: PluginId) => {
      // Switch plugin in store
      switchPlugin(pluginId);
      // Notify parent
      onPluginSelect(pluginId);
    },
    [switchPlugin, onPluginSelect]
  );

  // Filter to only show configured plugins
  const visiblePlugins = useMemo(() => {
    return plugins.filter((id) => PLUGIN_CONFIGS[id]);
  }, [plugins]);

  // Don't render if not visible or no plugins
  if (!isVisible || visiblePlugins.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn('bottom-nav', className)}
      style={{ height: BOTTOM_NAV_HEIGHT }}
      role="navigation"
      aria-label={t('layout.bottomNav.label', 'Bottom navigation')}
    >
      <div className="bottom-nav__container">
        {visiblePlugins.map((pluginId) => (
          <BottomNavItem
            key={pluginId}
            pluginId={pluginId}
            isActive={activePluginId === pluginId}
            onClick={() => handlePluginSelect(pluginId)}
          />
        ))}
      </div>

      {/* Safe area spacer for notched devices */}
      <div className="bottom-nav__safe-area" aria-hidden="true" />
    </nav>
  );
};

/**
 * BottomNavigation Component (default export)
 */
export default BottomNavigation;
