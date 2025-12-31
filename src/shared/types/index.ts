/**
 * Shared Types - Cross-Cutting Concerns
 *
 * Centralized type definitions used across layers.
 *
 * @layer Shared
 * @module shared/types
 */

/**
 * Workspace type enum
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * Common status types
 */
export type Status = 'online' | 'offline' | 'busy' | 'error';

/**
 * Provider types enum
 */
export type ProviderType =
    | 'OpenRouter'
    | 'OpenAI'
    | 'Anthropic'
    | 'Mistral'
    | 'Google'
    | 'OpenAI Compatible';

/**
 * UI variant types for component rendering
 */
export type UIVariant = 'full' | 'compact' | 'minimal';

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        timestamp: string;
        requestId: string;
    };
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasMore: boolean;
    };
}

/**
 * Entity metadata
 */
export interface EntityMetadata {
    createdAt: string;
    updatedAt: string;
    version: number;
}

/**
 * Validation error
 */
export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

/**
 * Configuration for persistence
 */
export interface PersistenceConfig {
    key: string;
    version: number;
    encrypt: boolean;
    syncAcrossWorkspaces: boolean;
}
