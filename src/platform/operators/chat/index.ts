/**
 * Chat Platform Operator
 *
 * This operator is ALWAYS visible when a project is open.
 * It is hardcoded in PlatformLayout (not store-driven).
 *
 * Re-exports from existing plugin via Strangler Fig pattern.
 *
 * @module @/platform/operators/chat
 * @created 2026-02-02
 */

// Re-export operator class and singleton from existing plugin
export { ChatOperator, chatOperator } from '@/plugins/chat/ChatOperator';

// Re-export plugin definition
export { chatPlugin } from '@/plugins/chat';

// Export the adapted component for PlatformLayout
// This uses usePlatform() context for projectId
export { ChatOperatorView, default } from './chat-operator-view';
