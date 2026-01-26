/**
 * @fileoverview Note Reference Display Component
 * @module presentation/components/chat/NoteReference
 * @governance EPIC-31-5
 *
 * Displays clickable note references in chat messages.
 * Supports navigation to referenced notes.
 *
 * Story E3-5: Note Reference Support
 */

import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { BookOpen, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNoteStore } from '@/lib/notes/note-store';
import { toast } from 'sonner';

// ============================================================================
// Component
// ============================================================================

/**
 * Note Reference Component
 *
 * Displays a clickable note reference with navigation support.
 * When clicked, navigates to the notes workspace and opens the referenced note.
 */
export interface NoteReferenceProps {
    /** Note ID being referenced */
    noteId: string;
    /** Note title for display */
    noteTitle: string;
    /** Optional custom CSS class */
    className?: string;
    /** Whether to show external link icon */
    showIcon?: boolean;
}

export function NoteReference({
    noteId,
    noteTitle,
    className,
    showIcon = true,
}: NoteReferenceProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const setActiveNote = useNoteStore((state) => state.setActiveNote);

    // Handle click to navigate to note
    const handleClick = useCallback(() => {
        try {
            // Check if note exists
            const note = useNoteStore.getState().notes.get(noteId);
            if (!note) {
                toast.error(t('noteReference.notFound', 'Note not found'));
                return;
            }

            // Set as active note in the store
            setActiveNote(noteId);

            // Navigate to notes workspace
            navigate({ to: '/notes' });

            toast.success(t('noteReference.opened', 'Opened note: {title}', { title: noteTitle }));
        } catch (error) {
            console.error('[NoteReference] Failed to navigate to note:', error);
            toast.error(t('noteReference.error', 'Failed to open note'));
        }
    }, [noteId, noteTitle, setActiveNote, navigate, t]);

    return (
        <button
            onClick={handleClick}
            className={className || "inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"}
            title={t('noteReference.clickToView')}
            type="button"
        >
            <BookOpen className="w-3 h-3" />
            <span className="underline decoration-dotted underline-offset-2">
                {noteTitle}
            </span>
            {showIcon && (
                <ExternalLink className="w-3 h-3 opacity-60" />
            )}
        </button>
    );
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Parse note references from text
 *
 * Looks for patterns like `📌 [Note Title]` or `/note:NoteId`
 * and returns array of parsed references.
 *
 * @param text - Text to parse for note references
 * @returns Array of parsed note references
 */
export function parseNoteReferences(text: string): Array<{ noteId: string; noteTitle: string; index: number }> {
    const references: Array<{ noteId: string; noteTitle: string; index: number }> = [];

    // Pattern 1: 📌 [Note Title] with optional ID suffix like 📌 [Note Title]#noteId
    const emojiPattern = /📌\s*\[([^\]]+)\](?:#([a-zA-Z0-9-]+))?/g;
    let match;
    while ((match = emojiPattern.exec(text)) !== null) {
        references.push({
            noteId: match[2] || match[1], // Use explicit ID or fall back to title
            noteTitle: match[1],
            index: match.index,
        });
    }

    // Pattern 2: /note:NoteId format
    const slashPattern = /\/note:([a-zA-Z0-9-]+)/g;
    while ((match = slashPattern.exec(text)) !== null) {
        // Try to find the note title from store if available
        const note = useNoteStore.getState().notes.get(match[1]);
        references.push({
            noteId: match[1],
            noteTitle: note?.title || match[1],
            index: match.index,
        });
    }

    return references;
}

/**
 * Render text with note references converted to clickable components
 *
 * @param text - Text containing note references
 * @param renderRef - Function to render a note reference component
 * @returns Array of text segments and NoteReference components
 */
export function renderTextWithNoteReferences(
    text: string,
    renderRef: (ref: { noteId: string; noteTitle: string }) => React.ReactNode
): React.ReactNode[] {
    const references = parseNoteReferences(text);
    if (references.length === 0) {
        return [text];
    }

    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort references by index
    const sortedRefs = [...references].sort((a, b) => a.index - b.index);

    for (const ref of sortedRefs) {
        // Add text before this reference
        if (ref.index > lastIndex) {
            result.push(text.slice(lastIndex, ref.index));
        }

        // Add the reference component
        result.push(renderRef(ref));

        // Move past this reference
        // Find the end of the matched pattern
        const beforeRef = text.slice(0, ref.index);
        const emojiMatch = beforeRef.match(/📌\s*\[([^\]]+)\](?:#([a-zA-Z0-9-]+))?$/);
        const slashMatch = beforeRef.match(/\/note:([a-zA-Z0-9-]+)$/);

        if (emojiMatch) {
            lastIndex = ref.index + emojiMatch[0].length;
        } else if (slashMatch) {
            lastIndex = ref.index + slashMatch[0].length;
        } else {
            lastIndex = ref.index + ref.noteTitle.length + 5; // Approximate
        }
    }

    // Add remaining text
    if (lastIndex < text.length) {
        result.push(text.slice(lastIndex));
    }

    return result;
}
