/**
 * Core Entities - Re-exports from domain layer
 *
 * This directory provides backwards compatibility for imports using @/core/entities/*
 * The actual entity definitions are in src/domain/entities/
 */

// Agent entity
export * from '../../domain/entities/agent';

// Conversation types (from infrastructure layer)
export type { ConversationMetadata, ConversationState, ConversationStoreState } from '../../infrastructure/persistence/stores/conversation/conversation-types';

// Provider types
export type { ProviderType } from '../../shared/types/index';

// Project entity
export * from '../../domain/entities/project';

// Workspace entity
export * from '../../domain/entities/workspace';

// RAG entity
export * from '../../domain/entities/rag';

// Knowledge entity
export * from '../../domain/entities/knowledge';

// Study entity
export * from '../../domain/entities/study';

// Value objects
export type { WorkspaceBinding } from '../../domain/value-objects/workspace-binding';
export type { AgentToolBinding } from '../../domain/value-objects/tool-permission';
export type { WorkspaceType } from '../../domain/value-objects/workspace-type';
