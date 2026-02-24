/**
 * @fileoverview Terminal Plugin Main Component
 * @module plugins/terminal/TerminalMain
 *
 * **EPIC-0.6-05 & EPIC-0.6-06**: WebContainer Boot & FSA Mount
 *
 * Boots WebContainer when Terminal plugin mounts.
 * Mounts FSA files to WebContainer at /project.
 * Shows loading skeleton during boot/mount and handles errors gracefully.
 *
 * @epic EPIC-0.6
 * @story 0.6-05, 0.6-06
 * @team Team B
 * @created 2026-01-27
 */

// No React import needed - JSX transform handles it
import { Terminal as TerminalIcon, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

// Plugin system
import type { PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';

// WebContainer
import { useWebContainer } from '@/infrastructure/webcontainer/useWebContainer';
import { useFSAMount } from '@/infrastructure/webcontainer/useFSAMount';

// Terminal components (existing - facade pattern)
import { TerminalPanel } from '@/presentation/components/terminal/TerminalPanel';

// Terminal skeleton
import { TerminalSkeleton } from './TerminalSkeleton';

// ============================================================================
// Main Terminal Plugin Component
// ============================================================================

/**
 * Terminal Plugin - Main component for terminal feature
 *
 * @param props - PluginMainProps from plugin system
 * @returns Terminal JSX element
 *
 * @remarks
 * Receives ProjectContext through plugin system.
 * Wraps existing TerminalPanel component.
 * Simplified version for POC - integrates with WebContainer terminal.
 *
 * Features:
 * - Display xterm.js terminal with shell support
 * - Execute commands in WebContainer
 * - File system operations via terminal
 * - Multiple terminal tabs (handled by TerminalPanel)
 *
 * Constraints:
 * - Desktop ONLY (blocked on mobile per ADR-033)
 * - FSA storage ONLY (IndexedDB has no file system access)
 * - Requires WebContainer to be booted
 */
function TerminalMain(_props: PluginMainProps) {
  const { t } = useTranslation();

  // Get context from provider
  const projectContext = useProjectContext();
  const { project, gateway } = projectContext;

  // WebContainer hook
  const { state: wcState, boot, instance: wcInstance } = useWebContainer();

  // FSA mount hook
  const { state: mountState, mount } = useFSAMount({
    gateway,
    webContainer: wcInstance,
    eventBus: undefined, // Optional event bus
  });

  // Boot WebContainer on mount
  useEffect(() => {
    boot();
  }, [boot]);

  // Mount FSA after WebContainer is ready
  useEffect(() => {
    if (wcState.status === 'ready' && wcInstance) {
      mount();
    }
  }, [wcState.status, wcInstance, mount]);

  // ============================================================================
  // Validation: Device Type
  // ============================================================================

  /**
   * Terminal is blocked on mobile per ADR-033
   */
  if (project.deviceType !== 'desktop') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
        <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center font-semibold">{t('terminal.mobileNotSupported')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-2">
          {t('terminal.desktopOnlyFeature')}
        </p>
      </div>
    );
  }

  // ============================================================================
  // Validation: Storage Type
  // ============================================================================

  /**
   * Terminal is blocked for IndexedDB (no file system access)
   * Terminal requires FSA for real file system operations
   */
  if (project.storageType !== 'fsa') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
        <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center font-semibold">{t('terminal.fsaRequired')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-2">
          {t('terminal.fsaRequiredExplanation')}
        </p>
      </div>
    );
  }

  // ============================================================================
  // Validation: Gateway
  // ============================================================================

  /**
   * Gateway must be available for WebContainer operations
   */
  if (!gateway) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
        <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center">{t('ide.noFolderSelected')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-1">
          {t('ide.openFolderToView')}
        </p>
      </div>
    );
  }

  // ============================================================================
  // WebContainer Boot Status
  // ============================================================================

  /**
   * Show loading skeleton while WebContainer boots
   */
  if (wcState.status === 'booting') {
    return <TerminalSkeleton status="booting" />;
  }

  /**
   * Show error if WebContainer boot failed
   */
  if (wcState.status === 'error') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500 p-4">
        <AlertCircle size={32} className="mb-2" />
        <p className="text-sm font-semibold text-center">{t('terminal.bootError')}</p>
        <p className="text-xs text-center mt-2">{wcState.error}</p>
      </div>
    );
  }

  // ============================================================================
  // FSA Mount Status
  // ============================================================================

  /**
   * Show loading skeleton while FSA files mount
   */
  if (mountState.status === 'mounting') {
    return <TerminalSkeleton status="mounting" />;
  }

  /**
   * Show error if FSA mount failed
   */
  if (mountState.status === 'error') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500 p-4">
        <AlertCircle size={32} className="mb-2" />
        <p className="text-sm font-semibold text-center">{t('terminal.mountError')}</p>
        <p className="text-xs text-center mt-2">{mountState.error}</p>
      </div>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div
      className="h-full w-full flex flex-col overflow-auto"
    >
      {/* Terminal Header */}
      <div className="h-7 px-3 flex items-center justify-between border-b border-border/30 bg-card/30 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TerminalIcon size={16} className="text-muted-foreground/70" />
          <span className="font-semibold">{t('terminal.title')}</span>
        </div>
        <div className="text-xs text-muted-foreground/70">
          {project.name}
        </div>
      </div>

      {/* Terminal Panel - Facade Pattern */}
      {/* TerminalPanel wraps XTerminal with tab management */}
      <div className="flex-1 overflow-hidden">
        <TerminalPanel
          cwd={project.folderPath || '/project'}
          initialSyncCompleted={true} // Assume sync complete for POC
          permissionState="granted"
          className="h-full"
        />
      </div>
    </div>
  );
}

export default TerminalMain;
