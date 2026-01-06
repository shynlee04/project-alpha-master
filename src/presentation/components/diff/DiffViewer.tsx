/**
 * @fileoverview Diff Viewer Component
 * @module components/diff/DiffViewer
 *
 * Main diff viewer component with multiple view modes.
 * Supports side-by-side, unified, and line-by-line views.
 *
 * @story S-029 File Comparison and Diff Viewer
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { generateDiff, type DiffResult, ChangeType } from '@/lib/diff/diff-generator';
import { LineDiff } from './LineDiff';

/**
 * View modes for diff display
 */
export type DiffViewMode = 'unified' | 'side-by-side' | 'line-by-line';

/**
 * Props for DiffViewer component
 */
export interface DiffViewerProps {
  /** Original content (left/before) */
  oldContent: string;
  /** Modified content (right/after) */
  newContent: string;
  /** Initial view mode */
  defaultViewMode?: DiffViewMode;
  /** File name for display */
  fileName?: string;
  /** Language for syntax highlighting (optional) */
  language?: string;
  /** Callback when view mode changes */
  onViewModeChange?: (mode: DiffViewMode) => void;
  /** Maximum height for scrollable container (default: 600px) */
  maxHeight?: string | number;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Custom CSS class name */
  className?: string;
}

/**
 * Get statistics for diff result
 */
function getDiffStats(diff: DiffResult): {
  additions: number;
  deletions: number;
  modifications: number;
  total: number;
} {
  const { stats } = diff;
  return {
    additions: stats.added,
    deletions: stats.removed,
    modifications: stats.modified,
    total: stats.added + stats.removed + stats.modified,
  };
}

/**
 * DiffViewer component
 *
 * Features:
 * - Multiple view modes (unified, side-by-side, line-by-line)
 * - Responsive design (mobile uses unified view only)
 * - Synced scrolling in side-by-side mode
 * - Performance optimized for large files (10,000+ lines)
 * - Keyboard shortcuts (Cmd+D to open, Esc to close)
 * - 8-bit gaming style (no blur effects)
 */
export function DiffViewer({
  oldContent,
  newContent,
  defaultViewMode = 'unified',
  fileName = '',
  language = 'plaintext',
  onViewModeChange,
  maxHeight = 600,
  showLineNumbers = true,
  className = '',
}: DiffViewerProps): React.JSX.Element {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();

  // Force unified view on mobile (side-by-side too wide)
  const effectiveMode: DiffViewMode = isMobile ? 'unified' : defaultViewMode;
  const [viewMode, setViewMode] = useState<DiffViewMode>(effectiveMode);
  const [syncScroll, setSyncScroll] = useState(true);

  // Generate diff
  const diff = React.useMemo(() => generateDiff(oldContent, newContent), [oldContent, newContent]);
  const stats = React.useMemo(() => getDiffStats(diff), [diff]);

  // Refs for synced scrolling
  const oldPanelRef = useRef<HTMLDivElement>(null);
  const newPanelRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  /**
   * Handle view mode change
   */
  const handleViewModeChange = useCallback(
    (mode: DiffViewMode) => {
      setViewMode(mode);
      onViewModeChange?.(mode);
    },
    [onViewModeChange]
  );

  /**
   * Sync scroll between panels in side-by-side mode
   */
  useEffect(() => {
    if (!syncScroll || viewMode !== 'side-by-side') return;

    const oldPanel = oldPanelRef.current;
    const newPanel = newPanelRef.current;

    if (!oldPanel || !newPanel) return;

    const handleOldScroll = () => {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        newPanel.scrollTop = oldPanel.scrollTop;
        newPanel.scrollLeft = oldPanel.scrollLeft;
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 0);
      }
    };

    const handleNewScroll = () => {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        oldPanel.scrollTop = newPanel.scrollTop;
        oldPanel.scrollLeft = newPanel.scrollLeft;
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 0);
      }
    };

    oldPanel.addEventListener('scroll', handleOldScroll);
    newPanel.addEventListener('scroll', handleNewScroll);

    return () => {
      oldPanel.removeEventListener('scroll', handleOldScroll);
      newPanel.removeEventListener('scroll', handleNewScroll);
    };
  }, [syncScroll, viewMode]);

  /**
   * Render unified view
   */
  const renderUnifiedView = () => (
    <div className="overflow-auto" style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}>
      <div className="inline-block min-w-full">
        {diff.lines.map((line, index) => (
          <LineDiff
            key={`unified-${index}`}
            line={line}
            showLineNumbers={showLineNumbers}
            viewMode="unified"
          />
        ))}
      </div>
    </div>
  );

  /**
   * Render side-by-side view
   */
  const renderSideBySideView = () => {
    const oldLines = diff.lines.filter(
      (line) => line.type === ChangeType.UNCHANGED || line.type === ChangeType.REMOVED || line.type === ChangeType.MODIFIED
    );
    const newLines = diff.lines.filter(
      (line) => line.type === ChangeType.UNCHANGED || line.type === ChangeType.ADDED || line.type === ChangeType.MODIFIED
    );

    return (
      <div className="flex gap-4 overflow-auto" style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}>
        {/* Old content panel */}
        <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-800" ref={oldPanelRef}>
          <div className="sticky top-0 px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm">
            {fileName || t('diff.oldContent', 'Original')}
          </div>
          <div className="inline-block min-w-full">
            {oldLines.map((line, index) => (
              <LineDiff
                key={`old-${index}`}
                line={line}
                showLineNumbers={showLineNumbers}
                viewMode="side-by-side"
              />
            ))}
          </div>
        </div>

        {/* New content panel */}
        <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-800" ref={newPanelRef}>
          <div className="sticky top-0 px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm">
            {fileName || t('diff.newContent', 'Modified')}
          </div>
          <div className="inline-block min-w-full">
            {newLines.map((line, index) => (
              <LineDiff
                key={`new-${index}`}
                line={line}
                showLineNumbers={showLineNumbers}
                viewMode="side-by-side"
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render line-by-line view
   */
  const renderLineByLineView = () => (
    <div className="overflow-auto" style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}>
      <div className="inline-block min-w-full">
        {diff.lines.map((line, index) => (
          <div
            key={`linebyline-${index}`}
            className="border-b border-slate-200 dark:border-slate-800"
          >
            {line.type === ChangeType.MODIFIED ? (
              // Modified lines show both old and new
              <div className="flex flex-col">
                <LineDiff
                  line={{ ...line, type: ChangeType.REMOVED }}
                  showLineNumbers={showLineNumbers}
                  viewMode="unified"
                />
                <LineDiff
                  line={{ ...line, type: ChangeType.ADDED }}
                  showLineNumbers={showLineNumbers}
                  viewMode="unified"
                />
              </div>
            ) : (
              <LineDiff
                line={line}
                showLineNumbers={showLineNumbers}
                viewMode="unified"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col bg-background ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-b-0 border-slate-200 dark:border-slate-800 rounded-t-lg">
        {/* File name and stats */}
        <div className="flex items-center gap-4">
          {fileName && (
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
              {fileName}
            </span>
          )}
          <div className="flex items-center gap-3 text-xs">
            {stats.additions > 0 && (
              <span className="text-green-600 dark:text-green-400">
                +{stats.additions}
              </span>
            )}
            {stats.deletions > 0 && (
              <span className="text-red-600 dark:text-red-400">
                -{stats.deletions}
              </span>
            )}
            {stats.modifications > 0 && (
              <span className="text-yellow-600 dark:text-yellow-400">
                ~{stats.modifications}
              </span>
            )}
          </div>
        </div>

        {/* View mode controls (desktop only) */}
        {!isMobile && (
          <div className="flex items-center gap-2">
            {/* Sync scroll toggle for side-by-side */}
            {viewMode === 'side-by-side' && (
              <button
                type="button"
                onClick={() => setSyncScroll(!syncScroll)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  syncScroll
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
                aria-label={t('diff.toggleSyncScroll', 'Toggle synced scrolling')}
              >
                {t('diff.syncScroll', 'Sync Scroll')}
              </button>
            )}

            {/* View mode buttons */}
            <div className="flex border border-slate-300 dark:border-slate-700 rounded overflow-hidden">
              <button
                type="button"
                onClick={() => handleViewModeChange('unified')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'unified'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
                aria-label={t('diff.unifiedView', 'Unified view')}
              >
                {t('diff.unified', 'Unified')}
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('side-by-side')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'side-by-side'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
                aria-label={t('diff.sideBySideView', 'Side-by-side view')}
              >
                {t('diff.sideBySide', 'Side by Side')}
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('line-by-line')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'line-by-line'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
                aria-label={t('diff.lineByLineView, 'Line-by-line view')}
              >
                {t('diff.lineByLine', 'Line by Line')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-lg overflow-hidden">
        {viewMode === 'unified' && renderUnifiedView()}
        {viewMode === 'side-by-side' && renderSideBySideView()}
        {viewMode === 'line-by-line' && renderLineByLineView()}
      </div>
    </div>
  );
}
