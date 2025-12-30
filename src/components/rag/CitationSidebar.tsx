/**
 * @fileoverview Citation Sidebar Component
 * @module components/rag/CitationSidebar
 * @governance EPIC-7-WIRE
 *
 * Displays full citation passage with highlighting and source attribution.
 */

import { useTranslation } from 'react-i18next';
import { X, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Citation } from '@/lib/rag/types';

interface CitationSidebarProps {
  /** Citation to display */
  citation: Citation;
  /** Source title */
  sourceTitle?: string;
  /** Called when sidebar should close */
  onClose: () => void;
  /** Called when source should be opened */
  onOpenSource?: (sourceId: string) => void;
}

/**
 * CitationSidebar - Displays citation details in a slide-over panel
 */
export function CitationSidebar({
  citation,
  sourceTitle,
  onClose,
  onOpenSource,
}: CitationSidebarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-surface border-l-2 border-border rounded-none">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-primary" />
          <h3 className="font-mono font-bold text-sm">
            {t('rag.citation.title', 'Citation')}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 border-2 border-transparent hover:border-border rounded-none"
        >
          <X size={14} className="text-muted-foreground" />
        </Button>
      </div>

      {/* Citation Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Source Attribution */}
        <div className="mb-4 pb-3 border-b border-border">
          <p className="text-xs text-muted-foreground mb-1">
            {t('rag.citation.source', 'Source')}
          </p>
          <p className="font-medium text-sm">
            {citation.title || sourceTitle || t('rag.citation.unknown', 'Unknown Source')}
          </p>
          {citation.sourceId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenSource?.(citation.sourceId)}
              className="h-auto p-0 text-xs text-primary hover:text-primary/80 rounded-none"
            >
              <ExternalLink size={12} className="mr-1" />
              {t('rag.citation.viewSource', 'View Source')}
            </Button>
          )}
        </div>

        {/* Relevance Score */}
        {citation.score !== undefined && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-1">
              {t('rag.citation.relevance', 'Relevance Score')}
            </p>
            <div className="w-full bg-muted h-2 rounded-none overflow-hidden">
              <div
                className="bg-primary h-full"
                style={{ width: `${citation.score * 100}%` }}
              />
            </div>
            <p className="text-xs text-right mt-1">
              {Math.round(citation.score * 100)}%
            </p>
          </div>
        )}

        {/* Passage */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            {t('rag.citation.passage', 'Relevant Passage')}
          </p>
          <blockquote className="pl-3 border-l-2 border-primary/50 text-sm italic text-foreground bg-background p-3 rounded-none">
            {citation.passage}
          </blockquote>
        </div>

        {/* Position */}
        {citation.position !== undefined && (
          <p className="text-xs text-muted-foreground mt-4">
            {t('rag.citation.position', 'Position in document: {{position}}', {
              position: citation.position,
            })}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-border">
        <Button
          onClick={onClose}
          className="w-full border-2 bg-background hover:bg-surface text-foreground rounded-none"
        >
          {t('action.close', 'Close')}
        </Button>
      </div>
    </div>
  );
}

export default CitationSidebar;
