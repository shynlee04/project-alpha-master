/**
 * Conversation Event Types
 *
 * Event types for the conversation event system.
 * Separated from conversation-events-slice to avoid circular dependencies.
 *
 * @module conversation/event-types
 */

// Event types
export type ConversationEventType =
  | 'conversation:created'
  | 'conversation:updated'
  | 'conversation:deleted'
  | 'thread:created'
  | 'thread:updated'
  | 'thread:deleted'
  | 'message:added'
  | 'message:updated'
  | 'message:deleted';

export interface ConversationEvent {
  type: ConversationEventType;
  entityId: string;
  timestamp: number;
  data?: unknown;
}

// Event listener type
export type EventListener = (event: ConversationEvent) => void;
