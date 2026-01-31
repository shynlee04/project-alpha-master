/**
 * @fileoverview Notes Indexing Button Component
 * @module components/notes/NotesIndexingButton
 * @governance P2-8
 *
 * Button for indexing notes into Knowledge workspace RAG search.
 * Shows indexed count and handles click event with confirmation.
 *
 * Features:
 * - Display indexed count (e.g., "12/50 notes indexed")
 * - Disabled if 0 notes exist
 * - Confirmation dialog before indexing
 * - Integration with NoteIndexer
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, Loader2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { useNoteStore } from '@/lib/notes/note-store';
import { noteIndexer } from '@/lib/notes/note-indexer';
import type { NoteRecord } from '@/lib/notes/types'; // P2-8: Use correct NoteRecord type for noteIndexer
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

interface NotesIndexingButtonProps {
  /** Optional CSS class */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * NotesIndexingButton - Index notes for Knowledge workspace search
 */
export function NotesIndexingButton({ className }: NotesIndexingButtonProps) {
  const { t } = useTranslation();
  const notesArray = useNoteStore((state) => state.notesArray);
  const projectId = useNoteStore((state) => state.currentProjectId);

  const [isConfirming, setIsConfirming] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);

  // Calculate indexed count
  const indexedCount = notesArray.filter((note) => note.isIndexed).length;
  const totalCount = notesArray.length;
  const allIndexed = totalCount > 0 && indexedCount === totalCount;
  const hasNotes = totalCount > 0;

  /**
   * Handle button click - show confirmation dialog
   */
  const handleClick = useCallback(() => {
    if (!hasNotes || isIndexing) return;

    if (allIndexed) {
      // All notes already indexed - offer to re-index
      setIsConfirming(true);
    } else {
      // Some notes not indexed - show confirmation
      setIsConfirming(true);
    }
  }, [hasNotes, allIndexed, isIndexing]);

  /**
   * Confirm indexing - index all notes
   */
  const handleConfirm = useCallback(async () => {
    if (!projectId || !hasNotes) {
      setIsConfirming(false);
      return;
    }

    setIsIndexing(true);
    setIsConfirming(false);

    try {
      const notesToIndex = allIndexed
        ? notesArray // Re-index all notes
        : notesArray.filter((note) => !note.isIndexed); // Index only unindexed notes

      console.log(
        `[NotesIndexingButton] Indexing ${notesToIndex.length} notes for project ${projectId}`
      );

      // Use noteIndexer.rebuildIndex() for bulk indexing
      // Type assertion: notesArray uses dexie-db NoteRecord, cast to notes/types NoteRecord for noteIndexer
      await noteIndexer.rebuildIndex(notesToIndex as NoteRecord[], projectId);

      toast.success(
        t('notes.indexing.success', 'Successfully indexed {{count}} notes', {
          count: notesToIndex.length,
        })
      );
    } catch (error) {
      console.error('[NotesIndexingButton] Indexing failed:', error);
      toast.error(
        t('notes.indexing.error', 'Failed to index notes: {{error}}', {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      );
    } finally {
      setIsIndexing(false);
    }
  }, [projectId, notesArray, hasNotes, allIndexed, t]);

  /**
   * Cancel indexing
   */
  const handleCancel = useCallback(() => {
    setIsConfirming(false);
  }, []);

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={!hasNotes || isIndexing}
        variant={allIndexed ? 'ghost' : 'primary'}
        className={`gap-2 ${className || ''}`}
      >
        {isIndexing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {t('notes.indexing.inProgress', 'Indexing...')}
          </>
        ) : (
          <>
            <Database size={16} />
            {t('notes.indexing.button', 'Index for RAG ({{indexed}}/{{total}})', {
              indexed: indexedCount,
              total: totalCount,
            })}
          </>
        )}
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {allIndexed
                ? t('notes.indexing.reindexTitle', 'Re-Index All Notes?')
                : t('notes.indexing.confirmTitle', 'Index Notes for Search?')}
            </DialogTitle>
            <DialogDescription>
              {allIndexed
                ? t(
                    'notes.indexing.reindexDescription',
                    'This will re-index all {{count}} notes. This may take a moment.',
                    { count: totalCount }
                  )
                : t(
                    'notes.indexing.confirmDescription',
                    'This will index {{count}} notes for Knowledge workspace search. Continue?',
                    { count: totalCount - indexedCount }
                  )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {t('action.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleConfirm}>
              {allIndexed
                ? t('action.reindex', 'Re-Index')
                : t('action.index', 'Index')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
