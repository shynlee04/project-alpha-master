/**
 * @fileoverview Note Study Menu (stub - DEFERRED)
 * @module presentation/components/notes/NoteStudyMenu
 * @status DEFERRED - Study workspace is post-MVP
 *
 * Provides study material generation UI for Notes.
 * Actual implementation will be added when Study epic begins.
 */

import React from 'react';

// ============================================================
// Props
// ============================================================

export interface NoteStudyMenuProps {
  noteId: string;
  isOpen?: boolean;
  onClose?: () => void;
}

// ============================================================
// Component (Stub)
// ============================================================

/**
 * Note Study Menu (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export function NoteStudyMenu(_props: NoteStudyMenuProps): React.ReactElement | null {
  // Stub - returns null since Study is deferred
  return null;
}

// Default export for lazy loading compatibility
export default NoteStudyMenu;
