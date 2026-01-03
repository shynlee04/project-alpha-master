/**
 * @fileoverview Knowledge Metadata Slice
 * @module infrastructure/persistence/stores/knowledge/knowledge-metadata-slice
 * @governance EPIC-6-4
 *
 * AI metadata extraction and processing status.
 */

import { StateCreator } from 'zustand';
import type {
  KnowledgeSource,
  UpdateSourceInput,
  KnowledgeMetadataState,
} from './knowledge-types';

export const createKnowledgeMetadataSlice: StateCreator<
  KnowledgeMetadataState,
  [],
  [],
  KnowledgeMetadataState
> = (set, get) => ({
  // State initialization
  extractingMetadata: new Set<string>(),

  // Extract metadata using AI (Story 6-4)
  extractMetadata: async (sourceId: string) => {
    const { updateProcessingStatus } = get();

    try {
      updateProcessingStatus(sourceId, 'processing');

      // TODO: Integrate with metadataExtractor service
      // const result = await metadataExtractor.extract(sourceId);
      // const { updateMetadata } = get();
      // updateMetadata(sourceId, result);

      // For now, simulate extraction
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateProcessingStatus(sourceId, 'completed');

      console.log('[KnowledgeStore] Metadata extracted:', sourceId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      updateProcessingStatus(sourceId, 'failed', errorMessage);
    }
  },

  // Update metadata with user corrections
  updateMetadata: async (sourceId: string, metadata: UpdateSourceInput) => {
    // This will delegate to the sources slice's updateSource method
    // Called via cross-slice communication
    console.log('[KnowledgeStore] Metadata updated:', sourceId, metadata);
  },

  // Update processing status
  updateProcessingStatus: (
    sourceId: string,
    status: KnowledgeSource['processingStatus'],
    _error?: string
  ) => {
    set((state) => ({
      extractingMetadata: status === 'processing'
        ? new Set([...state.extractingMetadata, sourceId])
        : new Set([...state.extractingMetadata].filter((id) => id !== sourceId)),
    }));

    // Trigger source update via cross-slice call
    // (handled by unified store)
  },
});
