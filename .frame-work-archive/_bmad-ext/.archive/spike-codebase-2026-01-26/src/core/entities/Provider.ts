/**
 * Re-export of Provider types from shared layer
 * Provides backwards compatibility for @/core/entities/Provider imports
 */
export type { ProviderType } from '../../shared/types/index';
export type { ModelInfo as ProviderModel } from '../../infrastructure/persistence/stores/providers/types';
export type { ProviderConfig } from '../../infrastructure/persistence/stores/providers/types';
