/**
 * Re-export of Conversation types from infrastructure layer
 * Provides backwards compatibility for @/core/entities/Conversation imports
 */
export type { ConversationMetadata, ConversationState, ConversationStoreState } from '../../infrastructure/persistence/stores/conversation/conversation-types';
export type { ConversationMetadataExtended, ConversationThread, ThreadMessage } from '../../infrastructure/persistence/stores/conversation/types';
export type { WorkspaceType } from '../../domain/value-objects/workspace-type';
