/**
 * @fileoverview Cross-Workspace Events Hook
 * @module hooks/use-cross-workspace-events
 * @iteration 15 - Created for RAG progress event subscription
 *
 * React hook for subscribing to cross-workspace events.
 * Provides automatic cleanup on unmount.
 */

import { useEffect, useState, useCallback } from 'react';
import { eventBus, type RAGProgressPayload } from '@/infrastructure/events/event-bus';
import { DomainEventType } from '@/infrastructure/events/event-bus';

/**
 * RAG Event State
 *
 * State for RAG operation progress tracking.
 * Matches ActivityState interface from activity indicators.
 */
export interface RAGEventState {
  status: 'idle' | 'running' | 'completed' | 'error';
  progress?: number;
  current?: number;
  total?: number;
  message?: string;
  error?: string;
}

/**
 * Hook for subscribing to RAG embedding progress events
 *
 * Automatically subscribes to RAG_EMBEDDING_PROGRESS events
 * and cleans up on unmount.
 *
 * @returns Current RAG event state
 *
 * @example
 * ```tsx
 * const embeddingState = useRAGEmbeddingProgress();
 *
 * {embeddingState.status !== 'idle' && (
 *   <EmbeddingProgressIndicator state={embeddingState} />
 * )}
 * ```
 */
export function useRAGEmbeddingProgress(): RAGEventState {
  const [state, setState] = useState<RAGEventState>({ status: 'idle' });

  useEffect(() => {
    const handler = (event: { payload: RAGProgressPayload }) => {
      setState({
        status: event.payload.status,
        progress: event.payload.progress,
        current: event.payload.current,
        total: event.payload.total,
        message: event.payload.message,
        error: event.payload.error
      });
    };

    const unsubscribe = eventBus.on(
      DomainEventType.RAG_EMBEDDING_PROGRESS,
      handler
    );

    return unsubscribe;
  }, []);

  return state;
}

/**
 * Hook for subscribing to RAG chunking status events
 *
 * Automatically subscribes to RAG_CHUNKING_STATUS events
 * and cleans up on unmount.
 *
 * @returns Current RAG event state
 */
export function useRAGChunkingStatus(): RAGEventState {
  const [state, setState] = useState<RAGEventState>({ status: 'idle' });

  useEffect(() => {
    const handler = (event: { payload: RAGProgressPayload }) => {
      setState({
        status: event.payload.status,
        progress: event.payload.progress,
        current: event.payload.current,
        total: event.payload.total,
        message: event.payload.message,
        error: event.payload.error
      });
    };

    const unsubscribe = eventBus.on(
      DomainEventType.RAG_CHUNKING_STATUS,
      handler
    );

    return unsubscribe;
  }, []);

  return state;
}

/**
 * Hook for subscribing to RAG database indexing events
 *
 * Automatically subscribes to RAG_DATABASE_INDEXING events
 * and cleans up on unmount.
 *
 * @returns Current RAG event state
 */
export function useRAGDatabaseIndexing(): RAGEventState {
  const [state, setState] = useState<RAGEventState>({ status: 'idle' });

  useEffect(() => {
    const handler = (event: { payload: RAGProgressPayload }) => {
      setState({
        status: event.payload.status,
        progress: event.payload.progress,
        current: event.payload.current,
        total: event.payload.total,
        message: event.payload.message,
        error: event.payload.error
      });
    };

    const unsubscribe = eventBus.on(
      DomainEventType.RAG_DATABASE_INDEXING,
      handler
    );

    return unsubscribe;
  }, []);

  return state;
}

/**
 * Hook for subscribing to RAG source processing events
 *
 * Automatically subscribes to RAG_SOURCE_PROCESSING events
 * and cleans up on unmount.
 *
 * @returns Current RAG event state
 */
export function useRAGSourceProcessing(): RAGEventState {
  const [state, setState] = useState<RAGEventState>({ status: 'idle' });

  useEffect(() => {
    const handler = (event: { payload: RAGProgressPayload }) => {
      setState({
        status: event.payload.status,
        progress: event.payload.progress,
        current: event.payload.current,
        total: event.payload.total,
        message: event.payload.message,
        error: event.payload.error
      });
    };

    const unsubscribe = eventBus.on(
      DomainEventType.RAG_SOURCE_PROCESSING,
      handler
    );

    return unsubscribe;
  }, []);

  return state;
}

/**
 * Generic hook for subscribing to any cross-workspace event
 *
 * @param eventType - Domain event type to subscribe to
 * @param initialState - Initial state value
 * @returns Current state and updater function
 *
 * @example
 * ```tsx
 * const [workspaceState, setWorkspaceState] = useCrossWorkspaceEvent(
 *   DomainEventType.WORKSPACE_CHANGED,
 *   { workspaceType: 'ide' }
 * );
 * ```
 */
export function useCrossWorkspaceEvent<T = unknown>(
  eventType: DomainEventType,
  initialState: T
): [T, (state: T) => void] {
  const [state, setState] = useState<T>(initialState);

  useEffect(() => {
    const handler = (event: { payload: T }) => {
      setState(event.payload);
    };

    const unsubscribe = eventBus.on(eventType, handler);

    return unsubscribe;
  }, [eventType]);

  return [state, setState];
}
