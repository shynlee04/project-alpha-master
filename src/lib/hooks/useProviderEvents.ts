/**
 * @fileoverview Cross-Workspace Provider Event Subscriptions
 * @module lib/hooks/useProviderEvents
 * @governance Ralph Loop Cycle 4, Phase 4
 *
 * React hooks for subscribing to provider configuration and model updates
 * across all workspaces. Enables UI components to reactively update when
 * LLM provider settings change in any workspace.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { models, isLoadingModels } = useProviderModels('openrouter');
 *   // Automatically updates when models are fetched in any workspace
 * }
 * ```
 */

import { useEffect, useState, useCallback } from 'react';
import { useProviderStore } from '@/infrastructure/persistence/stores/use-app-store';
import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';
import type { ProviderConfigChangeEvent, ModelsUpdatedEvent } from '@/lib/events/cross-workspace-event-bus';
import type { AppState } from '@/infrastructure/persistence/stores/types';
import type { ProviderConfig } from '@/infrastructure/persistence/stores/providers/types';

/**
 * Subscribe to provider configuration changes across all workspaces
 *
 * Useful for components that need to react when:
 * - API keys are saved/updated
 * - Providers are added/removed
 * - Provider configuration changes
 *
 * @param callback - Function to call when provider config changes
 * @returns Cleanup function for useEffect
 */
export function useProviderConfigChange(
  callback: (event: ProviderConfigChangeEvent) => void
): void {
  useEffect(() => {
    const handler = (event: ProviderConfigChangeEvent) => {
      console.log('[useProviderConfigChange] Provider config changed:', event);
      callback(event);
    };

    crossWorkspaceEventBus.onProviderConfigChange(handler);

    return () => {
      crossWorkspaceEventBus.offProviderConfigChange(handler);
    };
  }, [callback]);
}

/**
 * Subscribe to model updates for a specific provider across all workspaces
 *
 * Useful for components that display model lists or need to react when
 * new models are fetched after API key configuration.
 *
 * @param providerId - Provider ID to watch for model updates
 * @returns Object containing models, loading state, and refetch function
 */
export function useProviderModels(providerId: string) {
  const [models, setModels] = useState<any[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const storeModels = useProviderStore((state: AppState) => state.availableModels[providerId] || []);
  const storeIsLoading = useProviderStore((state: AppState) => state.isLoadingModels[providerId] || false);
  const fetchModels = useProviderStore((state: AppState) => state.fetchModels);

  // Initialize from store
  useEffect(() => {
    setModels(storeModels);
    setIsLoadingModels(storeIsLoading);
  }, [storeModels, storeIsLoading]);

  // Subscribe to cross-workspace model updates
  useEffect(() => {
    const handler = (event: ModelsUpdatedEvent) => {
      if (event.providerId === providerId) {
        console.log('[useProviderModels] Models updated for provider:', providerId, event);
        setModels(event.models);
        setLastUpdated(event.timestamp);
      }
    };

    crossWorkspaceEventBus.onModelsUpdated(handler);

    return () => {
      crossWorkspaceEventBus.offModelsUpdated(handler);
    };
  }, [providerId]);

  // Refetch models manually
  const refetch = useCallback(async () => {
    setIsLoadingModels(true);
    try {
      await fetchModels(providerId);
    } finally {
      setIsLoadingModels(false);
    }
  }, [providerId, fetchModels]);

  return {
    models,
    isLoadingModels,
    lastUpdated,
    refetch,
  };
}

/**
 * Subscribe to all provider events for comprehensive UI updates
 *
 * Combines both provider config and model updates into a single hook.
 * Useful for complex components that need to react to all provider changes.
 *
 * @param providerId - Provider ID to watch
 * @returns Comprehensive provider state and event handlers
 */
export function useProviderEvents(providerId: string) {
  const [configChange, setConfigChange] = useState<ProviderConfigChangeEvent | null>(null);
  const [modelsUpdate] = useState<ModelsUpdatedEvent | null>(null);

  const { models, isLoadingModels, lastUpdated, refetch } = useProviderModels(providerId);
  const provider = useProviderStore((state: AppState) =>
    state.providers.find((p: ProviderConfig) => p.id === providerId)
  );

  // Subscribe to config changes
  useEffect(() => {
    const handler = (event: ProviderConfigChangeEvent) => {
      if (event.providerId === providerId) {
        console.log('[useProviderEvents] Config changed:', event);
        setConfigChange(event);
      }
    };

    crossWorkspaceEventBus.onProviderConfigChange(handler);

    return () => {
      crossWorkspaceEventBus.offProviderConfigChange(handler);
    };
  }, [providerId]);

  // Subscribe to model updates (already handled by useProviderModels)

  return {
    provider,
    models,
    isLoadingModels,
    lastUpdated,
    configChange,
    modelsUpdate,
    refetch,
  };
}

/**
 * Hook to get all providers with cross-workspace reactivity
 *
 * Automatically updates provider list when:
 * - New providers are added in any workspace
 * - Providers are removed
 * - Provider configuration changes
 *
 * @returns All providers and utility functions
 */
export function useAllProviders() {
  const providers = useProviderStore((state: AppState) => state.providers);
  const [lastConfigChange, setLastConfigChange] = useState<ProviderConfigChangeEvent | null>(null);

  useEffect(() => {
    const handler = (event: ProviderConfigChangeEvent) => {
      console.log('[useAllProviders] Config changed:', event);
      setLastConfigChange(event);
    };

    crossWorkspaceEventBus.onProviderConfigChange(handler);

    return () => {
      crossWorkspaceEventBus.offProviderConfigChange(handler);
    };
  }, []);

  return {
    providers,
    lastConfigChange,
  };
}
