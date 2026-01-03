/**
 * @fileoverview RAG Index Slice - Index Lifecycle & Metadata
 * @module infrastructure/persistence/stores/rag/rag-index-slice
 * @governance EPIC-7-1
 *
 * Manages Orama index lifecycle, status tracking, and metadata.
 * Workspace-aware: tracks current workspace and project for indexing.
 */

import { StateCreator } from 'zustand';
import { getIndexMetadata } from '@/lib/rag/orama-index';
import type { RAGIndexState, IndexStatus, IndexOperation, WorkspaceType } from './rag-types';

/**
 * Index slice - manages index lifecycle and metadata
 */
export const createRAGIndexSlice: StateCreator<RAGIndexState> = (set, _get) => ({
  // Initial state
  currentWorkspaceType: 'ide',
  currentProjectId: null,
  indexStatus: 'idle' as IndexStatus,
  indexingOperation: 'idle' as IndexOperation,
  documentCount: 0,
  totalDocuments: 0,
  indexSize: 0,
  indexMetadata: null,
  _hasHydrated: false,

  // Actions

  setHasHydrated: (state: boolean) => {
    set({ _hasHydrated: state } as Partial<RAGIndexState>);
  },

  setCurrentWorkspace: (workspaceType: WorkspaceType) => {
    console.log('[RAGIndexSlice] Setting workspace:', workspaceType);
    set({ currentWorkspaceType: workspaceType } as Partial<RAGIndexState>);
  },

  setCurrentProject: (projectId: string | null) => {
    console.log('[RAGIndexSlice] Setting project:', projectId);
    set({
      currentProjectId: projectId,
      indexStatus: projectId ? 'idle' as IndexStatus : 'idle' as IndexStatus,
      documentCount: 0,
      totalDocuments: 0,
      indexSize: 0,
      indexMetadata: null,
    } as Partial<RAGIndexState>);
  },

  loadIndexMetadata: async (projectId: string) => {
    set({ loading: true, error: null, currentProjectId: projectId } as Partial<RAGIndexState>);
    try {
      const metadata = await getIndexMetadata(projectId);

      if (metadata) {
        set({
          indexMetadata: metadata,
          documentCount: metadata.documentCount,
          indexSize: metadata.size,
          indexStatus: 'ready' as IndexStatus,
          loading: false,
        } as Partial<RAGIndexState>);
      } else {
        set({
          indexMetadata: null,
          documentCount: 0,
          indexSize: 0,
          indexStatus: 'idle' as IndexStatus,
          loading: false,
        } as Partial<RAGIndexState>);
      }
    } catch (error) {
      set({
        error: (error as Error).message,
        indexStatus: 'error' as IndexStatus,
        loading: false,
      } as Partial<RAGIndexState>);
    }
  },

  setIndexStatus: (status: IndexStatus, operation: IndexOperation = 'idle' as IndexOperation) => {
    set({
      indexStatus: status,
      indexingOperation: operation,
    } as Partial<RAGIndexState>);
  },

  updateIndexingProgress: (documentCount: number, totalDocuments: number) => {
    set({ documentCount, totalDocuments } as Partial<RAGIndexState>);
  },

  // Convenience wrappers for KnowledgePage event handlers
  setIndexing: (isIndexing: boolean) => {
    set({
      indexStatus: isIndexing ? 'indexing' : 'ready',
    } as Partial<RAGIndexState>);
  },

  setIndexingProgress: (progress: number) => {
    // Progress is 0-100, map to documentCount/totalDocuments if available
    const currentState = _get() as RAGIndexState;
    if (currentState.totalDocuments > 0) {
      const documentCount = Math.round((progress / 100) * currentState.totalDocuments);
      set({ documentCount } as Partial<RAGIndexState>);
    }
    // Store raw progress percentage for UI display
    set({ indexSize: progress } as Partial<RAGIndexState>);
  },

  setError: (message: string) => {
    set({
      error: message,
      indexStatus: 'error',
    } as Partial<RAGIndexState>);
  },
});
