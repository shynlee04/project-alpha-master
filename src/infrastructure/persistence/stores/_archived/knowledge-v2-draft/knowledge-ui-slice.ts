/**
 * @fileoverview Knowledge UI Slice
 * @module infrastructure/persistence/stores/knowledge/knowledge-ui-slice
 * @governance EPIC-6-3
 *
 * UI state management for knowledge workspace.
 */

import { StateCreator } from 'zustand';
import type { KnowledgeUIState } from './knowledge-types';

export const createKnowledgeUISlice: StateCreator<
  KnowledgeUIState,
  [],
  [],
  KnowledgeUIState
> = (set) => ({
  // State initialization
  isPreviewOpen: false,
  loading: false,
  error: null,
  _hasHydrated: false,

  // Preview panel actions
  openPreview: () => set({ isPreviewOpen: true }),
  closePreview: () => set({ isPreviewOpen: false }),

  // Loading state
  setLoading: (loading: boolean) => set({ loading }),

  // Error state
  setError: (error: string | null) => set({ error }),
});
