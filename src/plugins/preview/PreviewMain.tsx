/**
 * @fileoverview Preview Plugin Main Component - Dev Server Preview
 * @module plugins/preview/PreviewMain
 *
 * **CC-AR-06**: Preview Plugin Implementation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Monitor, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Plugin system
import type { PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';
import { usePluginCoordinationSafe } from '@/infrastructure/context/plugin-coordination-context';

// ============================================================================
// Types
// ============================================================================

/**
 * Dev Server Ready Event Detail
 *
 * @remarks
 * Payload for 'dev-server-ready' custom event dispatched by Terminal plugin
 * when a dev server starts and becomes available.
 */
interface DevServerReadyDetail {
  url: string;
  port?: number;
}

// ============================================================================
// Main Preview Component
// ============================================================================

/**
 * Preview Plugin - Main component for dev server preview
 *
 * @param props - PluginMainProps from plugin system
 * @returns Preview JSX element
 *
 * @remarks
 * Receives ProjectContext through plugin system.
 * Displays iframe with dev server URL.
 * Simplified version for POC - listens for dev-server-ready event.
 *
 * Features:
 * - Display iframe with running dev server
 * - URL bar showing current preview URL
 * - Refresh button to reload iframe
 * - External link button to open in new tab
 * - Empty state when no dev server available
 *
 * Constraints:
 * - Desktop ONLY (blocked on mobile per ADR-033)
 * - FSA storage ONLY (IndexedDB has no file system access)
 */
function PreviewMain(_props: PluginMainProps) {
  const { t } = useTranslation();

  // Get context from provider
  const projectContext = useProjectContext();
  const { project } = projectContext;

  // EPIC-0.6-09: Plugin coordination for deferred URL consumption
  const coordination = usePluginCoordinationSafe();

  // CRITICAL FIX: Use ref to break infinite loop (coordination object changes on every render)
  const coordinationRef = useRef(coordination);
  coordinationRef.current = coordination;

  // State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ============================================================================
  // Event Listeners
  // ============================================================================

  /**
   * EPIC-0.6-09: Check for deferred URL on mount
   *
   * @remarks
   * If Preview was toggled OFF when dev server started, the URL was
   * queued in coordination store. Consume it on mount to restore preview.
   * CRITICAL FIX: Run ONCE on mount only via empty deps + ref pattern
   */
  useEffect(() => {
    const coord = coordinationRef.current;
    if (!coord) return;

    const deferredUrl = coord.consumePreviewUrl();
    if (deferredUrl) {
      console.log('[PreviewPlugin] Consuming deferred URL:', deferredUrl);
      setPreviewUrl(deferredUrl);
      setIsLoading(true); // Loading state for iframe
    }
  }, []); // CRITICAL: Empty deps = run once on mount

  /**
   * Listen for dev server ready event from Terminal plugin
   *
   * @remarks
   * Terminal plugin dispatches 'dev-server-ready' custom event when
   * it detects a dev server URL in terminal output.
   */
  useEffect(() => {
    const handleDevServerReady = (event: CustomEvent<DevServerReadyDetail>) => {
      console.log('[PreviewPlugin] Dev server ready:', event.detail.url);
      setPreviewUrl(event.detail.url);
      setIsLoading(true); // Show loading while iframe loads
    };

    window.addEventListener('dev-server-ready', handleDevServerReady as EventListener);
    return () => {
      window.removeEventListener('dev-server-ready', handleDevServerReady as EventListener);
    };
  }, []);

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Refresh the iframe by reassigning src
   */
  const handleRefresh = useCallback(() => {
    if (iframeRef.current && previewUrl) {
      setIsLoading(true);
      iframeRef.current.src = previewUrl;
    }
  }, [previewUrl]);

  /**
   * Open preview URL in new browser tab
   */
  const handleOpenExternal = useCallback(() => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  }, [previewUrl]);

  /**
   * Handle iframe load complete
   */
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // ============================================================================
  // Validation: Device Type
  // ============================================================================

  /**
   * Preview is blocked on mobile per ADR-033
   */
  if (project.deviceType !== 'desktop') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
        <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center font-semibold">{t('preview.mobileNotSupported')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-2">
          {t('preview.desktopOnlyFeature')}
        </p>
      </div>
    );
  }

  // ============================================================================
  // Validation: Storage Type
  // ============================================================================

  /**
   * Preview is blocked for IndexedDB (no file system access)
   * Preview requires FSA for real file system operations
   */
  if (project.storageType !== 'fsa') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
        <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center font-semibold">{t('preview.fsaRequired')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-2">
          {t('preview.fsaRequiredExplanation')}
        </p>
      </div>
    );
  }

  // ============================================================================
  // Empty State: No Preview Available
  // ============================================================================

  if (!previewUrl) {
    return (
      <div
        className="h-full w-full flex flex-col items-center justify-center text-muted-foreground"
      >
        <Monitor size={48} className="mb-4 opacity-50" />
        <p className="text-sm font-medium">{t('preview.noPreviewAvailable')}</p>
        <p className="text-xs opacity-70 mt-1">
          {t('preview.runDevServerHint')}
        </p>
      </div>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="h-full w-full flex flex-col">
      {/* Preview Header */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-border bg-card shrink-0">
        <span className="text-xs font-mono text-muted-foreground truncate flex-1 mr-2">
          {previewUrl}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
            title={t('preview.refresh')}
            type="button"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenExternal}
            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
            title={t('preview.openInNewTab')}
            type="button"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Preview Iframe */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <p className="text-sm text-muted-foreground">{t('preview.loading')}</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={previewUrl}
          className="w-full h-full border-none"
          title={t('preview.title')}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
}

export default PreviewMain;
