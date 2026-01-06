/**
 * @fileoverview Merge Conflict Resolver Component
 * @module components/diff/MergeConflictResolver
 *
 * Three-way merge conflict resolution UI.
 * Allows users to choose between base, incoming, and current changes.
 *
 * @story S-029 File Comparison and Diff Viewer
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { generateDiff } from '@/lib/diff/diff-generator';
import { LineDiff } from './LineDiff';

/**
 * Merge conflict hunk
 */
export interface MergeConflictHunk {
  /** Start line number */
  startLine: number;
  /** Base content (common ancestor) */
  baseContent: string;
  /** Incoming content (changes being merged in) */
  incomingContent: string;
  /** Current content (current working copy) */
  currentContent: string;
}

/**
 * Merge resolution choice
 */
export type MergeChoice = 'base' | 'incoming' | 'current' | 'manual';

/**
 * Props for MergeConflictResolver component
 */
export interface MergeConflictResolverProps {
  /** Array of conflict hunks to resolve */
  conflicts: MergeConflictHunk[];
  /** Callback when conflicts are resolved */
  onResolve: (resolutions: Array<{ hunk: number; choice: MergeChoice; content: string }>) => void;
  /** Callback to cancel resolution */
  onCancel?: () => void;
  /** Custom CSS class name */
  className?: string;
}

/**
 * MergeConflictResolver component
 *
 * Features:
 * - Three-way merge display (base, incoming, current)
 * - Per-conflict resolution choice
 * - Navigation between conflicts (previous/next)
 * - Manual editing support
 * - Keyboard shortcuts (n/p for next/previous conflict)
 * - Mobile responsive (stacked layout)
 * - 8-bit gaming style (no blur)
 */
export function MergeConflictResolver({
  conflicts,
  onResolve,
  onCancel,
  className = '',
}: MergeConflictResolverProps): React.JSX.Element {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();

  // Track current conflict index
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track resolution choice per conflict
  const [resolutions, setResolutions] = useState<Map<number, MergeChoice>>(new Map());
  // Track manual edits per conflict
  const [manualEdits, setManualEdits] = useState<Map<number, string>>(new Map());

  const currentConflict = conflicts[currentIndex];
  const currentChoice = resolutions.get(currentIndex) ?? 'current';
  const manualEdit = manualEdits.get(currentIndex) ?? currentConflict?.currentContent ?? '';

  // Refs for keyboard navigation
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Handle choice change for current conflict
   */
  const handleChoiceChange = useCallback((choice: MergeChoice) => {
    setResolutions(prev => new Map(prev).set(currentIndex, choice));
  }, [currentIndex]);

  /**
   * Handle manual edit change
   */
  const handleManualEditChange = useCallback((content: string) => {
    setManualEdits(prev => new Map(prev).set(currentIndex, content));
    setResolutions(prev => new Map(prev).set(currentIndex, 'manual'));
  }, [currentIndex]);

  /**
   * Navigate to previous conflict
   */
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  /**
   * Navigate to next conflict
   */
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(conflicts.length - 1, prev + 1));
  }, [conflicts.length]);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in manual edit mode
      if (document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        goToPrevious();
      }
    };

    const container = containerRef.current;
    container?.addEventListener('keydown', handleKeyDown);

    return () => {
      container?.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrevious]);

  /**
   * Resolve all conflicts and submit
   */
  const handleResolve = useCallback(() => {
    const results = conflicts.map((conflict, index) => {
      const choice = resolutions.get(index) ?? 'current';
      let content = '';

      switch (choice) {
        case 'base':
          content = conflict.baseContent;
          break;
        case 'incoming':
          content = conflict.incomingContent;
          break;
        case 'current':
          content = conflict.currentContent;
          break;
        case 'manual':
          content = manualEdits.get(index) ?? conflict.currentContent;
          break;
      }

      return { hunk: index, choice, content };
    });

    onResolve(results);
  }, [conflicts, resolutions, manualEdits, onResolve]);

  if (!currentConflict) {
    return (
      <div className="p-8 text-center text-slate-500">
        {t('diff.noConflicts', 'No conflicts to resolve')}
      </div>
    );
  }

  // Generate diffs for visual comparison
  const baseVsCurrent = generateDiff(currentConflict.baseContent, currentConflict.currentContent);
  const baseVsIncoming = generateDiff(currentConflict.baseContent, currentConflict.incomingContent);

  const stackLayout = isMobile;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-background ${className}`}
      role="dialog"
      aria-label={t('diff.mergeConflictDialog', 'Merge Conflict Resolution')}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
            {t('diff.resolveConflicts', 'Resolve Conflicts')}
          </h2>
          <span className="text-xs text-slate-500">
            {currentIndex + 1} / {conflicts.length}
          </span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="px-3 py-1 text-xs font-medium rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            aria-label={t('diff.previousConflict', 'Previous conflict')}
          >
            {t('diff.previous', 'Previous')}
          </button>
          <button
            type="button"
            onClick={goToNext}
            disabled={currentIndex === conflicts.length - 1}
            className="px-3 py-1 text-xs font-medium rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            aria-label={t('diff.nextConflict', 'Next conflict')}
          >
            {t('diff.next', 'Next')}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className={`flex gap-4 p-4 ${stackLayout ? 'flex-col' : ''}`}>
        {/* Current changes */}
        <div className={`border border-slate-200 dark:border-slate-800 rounded ${stackLayout ? 'w-full' : 'flex-1'}`}>
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm text-slate-700 dark:text-slate-300">
            {t('diff.currentChanges', 'Current Changes')}
          </div>
          <div className="p-4 max-h-96 overflow-auto">
            {baseVsCurrent.lines.slice(0, 20).map((line, index) => (
              <LineDiff
                key={`current-${index}`}
                line={line}
                showLineNumbers
                viewMode="unified"
              />
            ))}
          </div>
        </div>

        {/* Incoming changes */}
        <div className={`border border-slate-200 dark:border-slate-800 rounded ${stackLayout ? 'w-full' : 'flex-1'}`}>
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm text-slate-700 dark:text-slate-300">
            {t('diff.incomingChanges', 'Incoming Changes')}
          </div>
          <div className="p-4 max-h-96 overflow-auto">
            {baseVsIncoming.lines.slice(0, 20).map((line, index) => (
              <LineDiff
                key={`incoming-${index}`}
                line={line}
                showLineNumbers
                viewMode="unified"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Resolution controls */}
      <div className="px-4 py-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          {/* Choice buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleChoiceChange('current')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                currentChoice === 'current'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {t('diff.keepCurrent', 'Keep Current')}
            </button>
            <button
              type="button"
              onClick={() => handleChoiceChange('incoming')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                currentChoice === 'incoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {t('diff.acceptIncoming', 'Accept Incoming')}
            </button>
            <button
              type="button"
              onClick={() => handleChoiceChange('base')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                currentChoice === 'base'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {t('diff.useBase', 'Use Base')}
            </button>
            <button
              type="button"
              onClick={() => handleChoiceChange('manual')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                currentChoice === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {t('diff.manualEdit', 'Manual Edit')}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            )}
            <button
              type="button"
              onClick={handleResolve}
              disabled={resolutions.size < conflicts.length}
              className="px-4 py-2 text-sm font-medium rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('diff.resolveAll', 'Resolve All')}
            </button>
          </div>
        </div>

        {/* Manual edit textarea */}
        {currentChoice === 'manual' && (
          <textarea
            value={manualEdit}
            onChange={(e) => handleManualEditChange(e.target.value)}
            className="mt-3 w-full h-32 px-3 py-2 font-mono text-sm border border-slate-300 dark:border-slate-700 rounded bg-background text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('diff.manualEditPlaceholder', 'Enter resolved content...')}
            aria-label={t('diff.manualEditLabel', 'Manual edit content')}
          />
        )}
      </div>
    </div>
  );
}
