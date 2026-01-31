/**
 * Store Events Module
 * 
 * Event bus for cross-store communication.
 * Prevents circular dependencies between Zustand stores.
 * 
 * @see architecture.md Section 4.2.2 - Event Bus Pattern
 * @epic Sprint Change Proposal - Architectural Consolidation
 * @story AC-01 - Provider Store Reactivity
 * @created 2025-12-31
 */

import EventEmitter from 'eventemitter3';
import { useEffect } from 'react';

// Create singleton event bus for store communication
// This is separate from workspace-events.ts which handles UI/file events
export const storeEvents = new EventEmitter();

// =============================================================================
// Event Type Constants
// =============================================================================

export const STORE_EVENTS = {
    // Provider events - for cross-workspace reactivity
    PROVIDER_KEY_SET: 'provider:key-set',
    PROVIDER_KEY_REMOVED: 'provider:key-removed',
    PROVIDER_MODELS_LOADED: 'provider:models-loaded',
    PROVIDER_MODELS_ERROR: 'provider:models-error',
    PROVIDER_SELECTED: 'provider:selected',

    // Model events
    MODEL_SELECTED: 'model:selected',

    // Agent events - for workspace synchronization
    AGENT_SELECTED: 'agent:selected',
    AGENT_UPDATED: 'agent:updated',
    AGENT_REMOVED: 'agent:removed',
    AGENT_CONFIG_CHANGED: 'agent:config-changed',

    // Conversation events - for context management
    CONVERSATION_CREATED: 'conversation:created',
    CONVERSATION_UPDATED: 'conversation:updated',
    CONVERSATION_DELETED: 'conversation:deleted',
    MESSAGE_ADDED: 'message:added',

    // File events - for sync coordination
    FILE_SYNCED: 'file:synced',
    FILE_CONFLICT: 'file:conflict',
    FILE_SAVED: 'file:saved',

    // Source events - for Knowledge workspace
    SOURCE_IMPORTED: 'source:imported',
    SOURCE_SYNTHESIZED: 'source:synthesized',
    SOURCE_INDEXED: 'source:indexed',
    SOURCE_INDEX_FAILED: 'source:index-failed',
} as const;

// Type-safe event types
export type StoreEventType = typeof STORE_EVENTS[keyof typeof STORE_EVENTS];

// =============================================================================
// Event Payload Interfaces
// =============================================================================

export interface ProviderKeySetPayload {
    providerId: string;
    timestamp: number;
}

export interface ProviderKeyRemovedPayload {
    providerId: string;
    timestamp: number;
}

export interface ProviderModelsLoadedPayload {
    providerId: string;
    modelCount: number;
    timestamp: number;
}

export interface ProviderModelsErrorPayload {
    providerId: string;
    error: string;
    timestamp: number;
}

export interface ProviderSelectedPayload {
    providerId: string;
    previousProviderId: string | null;
    timestamp: number;
}

export interface ModelSelectedPayload {
    modelId: string;
    providerId: string;
    previousModelId: string | null;
    timestamp: number;
}

export interface AgentSelectedPayload {
    agentId: string;
    workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
    timestamp: number;
}

export interface AgentUpdatedPayload {
    agentId: string;
    changes: string[];
    timestamp: number;
}

export interface AgentConfigChangedPayload {
    agentId: string;
    workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
    configType: 'default' | 'selection' | 'permissions';
    timestamp: number;
}

export interface SourceImportedPayload {
    sourceId: string;
    sourceType: string;
    collectionId: string;
    timestamp: number;
}

export interface SourceSynthesizedPayload {
    sourceId: string;
    synthesisId: string;
    timestamp: number;
}

export interface SourceIndexedPayload {
    sourceId: string;
    chunksCreated: number;
    embeddingsGenerated: number;
    indexedAt: number;
}

export interface SourceIndexFailedPayload {
    sourceId: string;
    error: string;
    indexedAt: number;
}

export interface FileSavedPayload {
    filePath: string;
    workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
    projectId: string;
    timestamp: number;
}

// =============================================================================
// Type-Safe Event Helpers
// =============================================================================

/**
 * Emit a store event with type-safe payload
 */
export function emitStoreEvent<T>(event: StoreEventType, payload: T): void {
    console.debug(`[StoreEvents] Emitting ${event}`, payload);
    storeEvents.emit(event, payload);
}

/**
 * Subscribe to a store event with type-safe handler
 * @returns Unsubscribe function
 */
export function onStoreEvent<T>(
    event: StoreEventType,
    handler: (payload: T) => void
): () => void {
    storeEvents.on(event, handler);
    return () => storeEvents.off(event, handler);
}

/**
 * Subscribe to a store event once
 * @returns Unsubscribe function
 */
export function onceStoreEvent<T>(
    event: StoreEventType,
    handler: (payload: T) => void
): () => void {
    storeEvents.once(event, handler);
    return () => storeEvents.off(event, handler);
}

/**
 * Remove all listeners for an event
 */
export function offStoreEvent(event: StoreEventType): void {
    storeEvents.removeAllListeners(event);
}

/**
 * Alias for onStoreEvent for compatibility
 * @deprecated Use onStoreEvent instead
 */
export function subscribeStoreEvent<T>(
    event: StoreEventType,
    handler: (payload: T) => void
): () => void {
    return onStoreEvent<T>(event, handler);
}

// =============================================================================
// React Hooks for Event Subscriptions
// =============================================================================

/**
 * React hook to subscribe to store events
 * Automatically handles cleanup on unmount
 *
 * @example
 * ```tsx
 * useStoreEvent<ProviderModelsLoadedPayload>(
 *   STORE_EVENTS.PROVIDER_MODELS_LOADED,
 *   ({ providerId, modelCount }) => {
 *     console.log(`Loaded ${modelCount} models for ${providerId}`);
 *   }
 * );
 * ```
 */
export function useStoreEvent<T>(
    event: StoreEventType,
    handler: (payload: T) => void,
    deps: React.DependencyList = []
): void {
    useEffect(() => {
        const unsubscribe = onStoreEvent<T>(event, handler);
        return unsubscribe;
    }, [event, handler, ...deps]);
}

/**
 * React hook to subscribe to store events once
 * Automatically handles cleanup and only fires on first occurrence
 *
 * @example
 * ```tsx
 * useStoreEventOnce<ProviderKeySetPayload>(
 *   STORE_EVENTS.PROVIDER_KEY_SET,
 *   ({ providerId }) => {
 *     console.log(`Provider ${providerId} key set (first time)`);
 *   }
 * );
 * ```
 */
export function useStoreEventOnce<T>(
    event: StoreEventType,
    handler: (payload: T) => void,
    deps: React.DependencyList = []
): void {
    useEffect(() => {
        const unsubscribe = onceStoreEvent<T>(event, handler);
        return unsubscribe;
    }, [event, handler, ...deps]);
}
