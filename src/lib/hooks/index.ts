/**
 * @fileoverview React Hooks - Cross-Cutting Utilities
 * @module lib/hooks
 *
 * Custom React hooks for state management, event subscriptions,
 * and cross-workspace reactivity.
 */

// Cross-workspace provider event subscriptions
export {
  useProviderConfigChange,
  useProviderModels,
  useProviderEvents,
  useAllProviders,
} from './useProviderEvents';
