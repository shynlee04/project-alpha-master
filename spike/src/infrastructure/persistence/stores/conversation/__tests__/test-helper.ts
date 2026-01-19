/**
 * Test helper for creating complete conversation stores
 * Fixes TypeScript errors by providing all required CombinedConversationState properties
 */

import { create } from 'zustand';
import type { CombinedConversationState } from '../types';
import { createConversationMetadataSlice } from '../conversation-metadata-slice';
import { createThreadManagementSlice } from '../thread-management-slice';
import { createMessageCrudSlice } from '../message-crud-slice';
import { createConversationEventsSlice } from '../conversation-events-slice';
import { createConversationUtilsSlice } from '../conversation-utils-slice';
import { createConversationValidationSlice } from '../conversation-validation-slice';

/**
 * Creates a complete test store with all slices
 * Use this instead of manually assembling slices to avoid TypeScript errors
 */
export const createTestConversationStore = () =>
  create<CombinedConversationState>()((set, get, api) => ({
    // Metadata slice
    ...createConversationMetadataSlice(set, get, api),

    // Thread management slice
    ...createThreadManagementSlice(set, get, api),

    // Message CRUD slice
    ...createMessageCrudSlice(set, get, api),

    // Events slice
    ...createConversationEventsSlice(set, get, api),

    // Utils slice
    ...createConversationUtilsSlice(set, get, api),

    // Validation slice
    ...createConversationValidationSlice(set, get, api),
  }));
