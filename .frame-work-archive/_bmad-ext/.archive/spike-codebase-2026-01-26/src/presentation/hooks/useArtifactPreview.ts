/**
 * @fileoverview Artifact Preview Hook
 * @module presentation/hooks/useArtifactPreview
 * @governance CHAT-009
 *
 * Custom hook for managing artifact preview state.
 * Extracted from EnhancedChatInterface for DRY reuse.
 *
 * @example
 * ```tsx
 * const artifactPreview = useArtifactPreview();
 * // artifactPreview.open, artifactPreview.code, artifactPreview.language
 * // artifactPreview.openArtifact(code, language), artifactPreview.close()
 * ```
 */

import { useState, useCallback } from 'react';

export interface ArtifactPreviewState {
  /** Whether the modal is open */
  open: boolean;
  /** Code/content to display */
  code: string;
  /** Language/type of the artifact */
  language: string;
  /** Optional file name suggestion */
  fileName?: string;
}

export interface UseArtifactPreviewReturn {
  /** Current artifact preview state */
  artifactPreview: ArtifactPreviewState;
  /** Open the artifact preview modal */
  openArtifact: (code: string, language: string, fileName?: string) => void;
  /** Close the artifact preview modal */
  closeArtifact: () => void;
}

/**
 * Hook for managing artifact preview state
 *
 * Provides state and handlers for the ArtifactPreviewModal.
 * Used by EnhancedChatInterface, RAGChatPanel, and other chat components.
 *
 * CHAT-009: Extracted from EnhancedChatInterface for reuse
 */
export function useArtifactPreview(): UseArtifactPreviewReturn {
  const [artifactPreview, setArtifactPreview] = useState<ArtifactPreviewState>({
    open: false,
    code: '',
    language: 'text',
  });

  /**
   * Open artifact preview modal with code
   */
  const openArtifact = useCallback((code: string, language: string, fileName?: string) => {
    setArtifactPreview({
      open: true,
      code,
      language,
      fileName,
    });
  }, []);

  /**
   * Close artifact preview modal
   */
  const closeArtifact = useCallback(() => {
    setArtifactPreview((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    artifactPreview,
    openArtifact,
    closeArtifact,
  };
}

export default useArtifactPreview;
