/**
 * PHASE 2 STUB: Conversation Event Types
 * Original code archived to: _phase2-archive/infrastructure/persistence/stores/conversation/
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

export type ConversationEventType = 
  | 'message_added'
  | 'message_updated'
  | 'conversation_created'
  | 'conversation_deleted';

export interface ConversationEvent {
  type: ConversationEventType;
  conversationId: string;
  timestamp: string;
  data?: unknown;
}
