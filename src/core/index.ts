/**
 * Core Entities - Domain Layer
 *
 * Pure business entities without framework dependencies
 * Single source of truth for domain types
 *
 * NOTE: These are re-exports from src/domain/entities/
 * The actual entity files are located in src/domain/entities/
 */

// Agent entity
export * from '../domain/entities/agent';

// Provider types (from existing shared types)
export type { ProviderType } from '../shared/types/index';

// Workspace entity
export * from '../domain/entities/workspace';

// Project entity
export * from '../domain/entities/project';

// RAG entity
export * from '../domain/entities/rag';

// Knowledge entity
export * from '../domain/entities/knowledge';

// Study entity
export * from '../domain/entities/study';

// Re-export commonly used types for backward compatibility
export type { WorkspaceBinding } from '../domain/value-objects/workspace-binding';
export type { AgentToolBinding } from '../domain/value-objects/tool-permission';
export type { WorkspaceType } from '../domain/value-objects/workspace-type';
