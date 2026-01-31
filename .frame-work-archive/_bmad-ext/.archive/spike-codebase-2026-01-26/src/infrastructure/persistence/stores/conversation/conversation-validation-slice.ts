import { StateCreator } from 'zustand';
import type { CombinedConversationState } from './types';

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Slice methods
type ConversationValidationSliceMethods = {
  // ID validation
  validateConversationId: (id: string) => ValidationResult;
  validateThreadId: (id: string) => ValidationResult;
  validateMessageId: (id: string) => ValidationResult;

  // State transition validation
  validateConversationStatus: (id: string, newStatus: 'active' | 'archived' | 'deleted') => ValidationResult;
  validateThreadStatus: (id: string, newStatus: 'active' | 'archived' | 'deleted') => ValidationResult;

  // Hierarchy integrity validation
  validateThreadHierarchy: (threadId: string) => ValidationResult;
  validateMessageThreadAssociation: (messageId: string) => ValidationResult;

  // Bulk validation
  validateConversationIntegrity: (conversationId: string) => ValidationResult;
};

const createValidationResult = (isValid: boolean, errors: string[] = []): ValidationResult => ({
  isValid,
  errors: isValid ? [] : errors,
});

export const createConversationValidationSlice: StateCreator<
  CombinedConversationState,
  [],
  [],
  ConversationValidationSliceMethods
> = (_set, get) => ({
  validateConversationId: (id) => {
    const conversation = get().conversations[id];
    if (!conversation) {
      return createValidationResult(false, [`Conversation ${id} does not exist`]);
    }
    if (conversation.status === 'deleted') {
      return createValidationResult(false, [`Conversation ${id} is deleted`]);
    }
    return createValidationResult(true);
  },

  validateThreadId: (id) => {
    const thread = get().threads[id];
    if (!thread) {
      return createValidationResult(false, [`Thread ${id} does not exist`]);
    }
    if (thread.status === 'deleted') {
      return createValidationResult(false, [`Thread ${id} is deleted`]);
    }
    return createValidationResult(true);
  },

  validateMessageId: (id) => {
    const message = get().messages[id];
    if (!message) {
      return createValidationResult(false, [`Message ${id} does not exist`]);
    }
    return createValidationResult(true);
  },

  validateConversationStatus: (id, newStatus) => {
    const conversation = get().conversations[id];
    if (!conversation) {
      return createValidationResult(false, [`Conversation ${id} does not exist`]);
    }
    const validTransitions: Record<string, string[]> = {
      active: ['archived', 'deleted'],
      archived: ['active', 'deleted'],
      deleted: [], // Cannot transition from deleted
    };
    const allowed = validTransitions[conversation.status] || [];
    if (!allowed.includes(newStatus)) {
      return createValidationResult(false, [
        `Cannot transition from ${conversation.status} to ${newStatus}`,
      ]);
    }
    return createValidationResult(true);
  },

  validateThreadStatus: (id, newStatus) => {
    const thread = get().threads[id];
    if (!thread) {
      return createValidationResult(false, [`Thread ${id} does not exist`]);
    }
    const validTransitions: Record<string, string[]> = {
      active: ['archived', 'deleted'],
      archived: ['active', 'deleted'],
      deleted: [],
    };
    const allowed = validTransitions[thread.status] || [];
    if (!allowed.includes(newStatus)) {
      return createValidationResult(false, [`Cannot transition from ${thread.status} to ${newStatus}`]);
    }
    return createValidationResult(true);
  },

  validateThreadHierarchy: (threadId) => {
    const thread = get().threads[threadId];
    if (!thread) {
      return createValidationResult(false, [`Thread ${threadId} does not exist`]);
    }
    const errors: string[] = [];
    if (thread.parentThreadId) {
      const parent = get().threads[thread.parentThreadId];
      if (!parent) {
        errors.push(`Parent thread ${thread.parentThreadId} does not exist`);
      } else if (parent.status === 'deleted') {
        errors.push(`Parent thread ${thread.parentThreadId} is deleted`);
      } else if (!parent.childThreadIds?.includes(threadId)) {
        errors.push(`Parent thread ${thread.parentThreadId} does not reference ${threadId} as child`);
      }
    }
    if (thread.childThreadIds) {
      thread.childThreadIds.forEach((childId) => {
        const child = get().threads[childId];
        if (!child) {
          errors.push(`Child thread ${childId} does not exist`);
        } else if (child.status === 'deleted') {
          errors.push(`Child thread ${childId} is deleted`);
        } else if (child.parentThreadId !== threadId) {
          errors.push(`Child thread ${childId} does not reference ${threadId} as parent`);
        }
      });
    }
    return createValidationResult(errors.length === 0, errors);
  },

  validateMessageThreadAssociation: (messageId) => {
    const message = get().messages[messageId];
    if (!message) {
      return createValidationResult(false, [`Message ${messageId} does not exist`]);
    }
    const thread = get().threads[message.threadId];
    if (!thread) {
      return createValidationResult(false, [`Thread ${message.threadId} does not exist`]);
    }
    if (thread.status === 'deleted') {
      return createValidationResult(false, [`Thread ${message.threadId} is deleted`]);
    }
    return createValidationResult(true);
  },

  validateConversationIntegrity: (conversationId) => {
    const errors: string[] = [];
    const conversation = get().conversations[conversationId];
    if (!conversation) {
      return createValidationResult(false, [`Conversation ${conversationId} does not exist`]);
    }
    const allThreads = Object.values(get().threads).filter((t) => t.conversationId === conversationId);
    const activeThreads = allThreads.filter((t) => t.status !== 'deleted');
    activeThreads.forEach((thread) => {
      const threadValidation = get().validateThreadHierarchy(thread.id);
      if (!threadValidation.isValid) {
        errors.push(...threadValidation.errors);
      }
    });
    const messages = Object.values(get().messages);
    allThreads.forEach((thread) => {
      const threadMessages = messages.filter((m) => m.threadId === thread.id);
      threadMessages.forEach((msg) => {
        const msgValidation = get().validateMessageThreadAssociation(msg.id);
        if (!msgValidation.isValid) {
          errors.push(...msgValidation.errors);
        }
      });
    });
    return createValidationResult(errors.length === 0, errors);
  },
});
