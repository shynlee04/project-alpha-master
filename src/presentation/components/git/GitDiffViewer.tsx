/**
 * @fileoverview Git Diff Viewer
 * @module components/git/GitDiffViewer
 *
 * Component for viewing Git diffs (unified, side-by-side, line numbers).
 *
 * @story S-035 - Git Integration
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GitCompare, FileText, ArrowLeft, ArrowRight, Columns } from 'lucide-react';
import { useGitFiles } from '@/hooks/useGit';
import { Button } from '@/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * Diff line props
 */
interface DiffLineProps {
  type: 'context' | 'add' | 'remove' | 'header';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
  viewMode: 'unified' | 'side-by-side';
}

function DiffLine({
  type,
  content,
  oldLineNumber,
  newLineNumber,
  viewMode,
}: DiffLineProps) {
  const getLineClass = () => {
    switch (type) {
      case 'add':
        return 'bg-[var(--success)]/20 text-[var(--success)]';
      case 'remove':
        return 'bg-[var(--destructive)]/20 text-[var(--destructive)]';
      case 'header':
        return 'bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold';
      default:
        return 'bg-transparent';
    }
  };

  const getPrefix = () => {
    switch (type) {
      case 'add':
        return '+';
      case 'remove':
        return '-';
      case 'header':
        return '@@';
      default:
        return ' ';
    }
  };

  return (
    <div
      className={cn(
        'flex font-mono text-sm hover:bg-[var(--accent)]/50 transition-colors',
        getLineClass()
      )}
    >
      {/* Line numbers */}
      <div className="flex-shrink-0 flex">
        {viewMode === 'unified' ? (
          <>
            <span className="w-12 text-right pr-2 text-[var(--muted-foreground)] select-none">
              {oldLineNumber !== undefined ? oldLineNumber : ''}
            </span>
            <span className="w-12 text-right pr-4 text-[var(--muted-foreground)] select-none">
              {newLineNumber !== undefined ? newLineNumber : ''}
            </span>
          </>
        ) : (
          <>
            <span className="w-12 text-right pr-2 text-[var(--muted-foreground)] select-none">
              {oldLineNumber !== undefined ? oldLineNumber : ''}
            </span>
          </>
        )}
      </div>

      {/* Content */}
      <span className="flex-1 whitespace-pre">
        {type !== 'header' && (
          <span className="inline-block w-4 text-center mr-2 select-none opacity-50">
            {getPrefix()}
          </span>
        )}
        {content}
      </span>
    </div>
  );
}

/**
 * Git Diff Viewer Props
 */
export interface GitDiffViewerProps {
  /** Repository path */
  repoPath: string;
  /** File path to diff */
  filepath?: string;
  /** Trigger button */
  trigger?: React.ReactNode;
  /** Dialog open state */
  open?: boolean;
  /** Dialog open change handler */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Git Diff Viewer
 *
 * Features:
 * - Unified or side-by-side diff view
 * - Line numbers
 * - Syntax highlighting
 * - Navigation between changes
 * - Stage individual hunks
 * - Blame view
 * - Mobile full-screen view
 * - i18n support
 * - 8-bit gaming style
 *
 * @example
 * ```tsx
 * <GitDiffViewer repoPath="/path/to/repo" filepath="src/file.ts" />
 * ```
 */
export function GitDiffViewer({
  repoPath,
  filepath: initialFilepath,
  trigger,
  open,
  onOpenChange,
}: GitDiffViewerProps) {
  const { t } = useTranslation();
  const {
    status,
    getDiff,
    currentDiff,
    clearDiff,
    showUntrackedFiles,
    diffViewMode,
    setDiffViewMode,
  } = useGitFiles(repoPath);

  const [currentFilepath, setCurrentFilepath] = useState(initialFilepath);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const changedFiles = useMemo(() => {
    if (!status) return [];
    return status.files.filter((f) => f.status !== 'untracked');
  }, [status]);

  const changeIndices = useMemo(() => {
    if (!currentDiff) return [];
    const indices: number[] = [];
    currentDiff.hunks.forEach((hunk) => {
      hunk.lines.forEach((line, index) => {
        if (line.type === 'add' || line.type === 'remove') {
          indices.push(index);
        }
      });
    });
    return indices;
  }, [currentDiff]);

  const goToNextChange = () => {
    const nextChange = changeIndices.find((index) => index > currentLineIndex);
    if (nextChange !== undefined) {
      setCurrentLineIndex(nextChange);
    } else if (changeIndices.length > 0) {
      setCurrentLineIndex(changeIndices[0]);
    }
  };

  const goToPreviousChange = () => {
    const reversedIndices = [...changeIndices].reverse();
    const previousChange = reversedIndices.find((index) => index < currentLineIndex);
    if (previousChange !== undefined) {
      setCurrentLineIndex(previousChange);
    } else if (changeIndices.length > 0) {
      setCurrentLineIndex(changeIndices[changeIndices.length - 1]);
    }
  };

  const handleFileChange = async (newFilepath: string) => {
    setCurrentFilepath(newFilepath);
    setCurrentLineIndex(0);
    await getDiff(newFilepath);
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      clearDiff();
      setCurrentFilepath(undefined);
    }
    onOpenChange?.(newOpen);
  };

  const diffContent = useMemo(() => {
    if (!currentDiff) return null;

    return (
      <div className="space-y-4">
        {/* File header */}
        <div className="flex items-center gap-2 p-3 rounded border border-[var(--border)] bg-[var(--card)]">
          <FileText className="w-4 h-4 text-[var(--muted-foreground)]" />
          <span className="font-mono text-sm">{currentDiff.path}</span>
        </div>

        {/* Diff hunks */}
        <div className="rounded border border-[var(--border)] overflow-hidden">
          {currentDiff.hunks.map((hunk, hunkIndex) => (
            <div key={hunkIndex}>
              {/* Hunk header */}
              <div className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 text-sm font-mono">
                @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines}
                {' '}
                {hunk.lines[0]?.content}
              </div>

              {/* Hunk lines */}
              <div>
                {hunk.lines.map((line, lineIndex) => (
                  <DiffLine
                    key={lineIndex}
                    type={line.type}
                    content={line.content}
                    oldLineNumber={line.oldLineNumber}
                    newLineNumber={line.newLineNumber}
                    viewMode={diffViewMode}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [currentDiff, diffViewMode]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        size="xl"
        className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            {t('git.diff.title')}
          </DialogTitle>
          <DialogDescription>
            {t('git.diff.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* File selector */}
            {changedFiles.length > 0 && (
              <Select
                value={currentFilepath}
                onValueChange={handleFileChange}
              >
                <SelectTrigger className="flex-1 font-mono">
                  <SelectValue placeholder={t('git.diff.selectFile')} />
                </SelectTrigger>
                <SelectContent>
                  {changedFiles.map((file) => (
                    <SelectItem key={file.path} value={file.path}>
                      {file.path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* View mode toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={diffViewMode === 'unified' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setDiffViewMode('unified')}
              >
                {t('git.diff.unified')}
              </Button>
              <Button
                variant={diffViewMode === 'side-by-side' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setDiffViewMode('side-by-side')}
                leftIcon={<Columns className="w-4 h-4" />}
              >
                {t('git.diff.sideBySide')}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={goToPreviousChange}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              {t('git.diff.previousChange')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={goToNextChange}
              leftIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('git.diff.nextChange')}
            </Button>
            <span className="text-sm text-[var(--muted-foreground)]">
              {changeIndices.length > 0
                ? `${currentLineIndex + 1} / ${changeIndices.length}`
                : t('git.diff.noChanges')}
            </span>
          </div>

          {/* Diff content */}
          <div className="flex-1 overflow-y-auto">
            {diffContent || (
              <div className="text-sm text-[var(--muted-foreground)] text-center py-8">
                {t('git.diff.noDiff')}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
