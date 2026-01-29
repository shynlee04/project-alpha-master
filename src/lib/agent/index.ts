/**
 * @fileoverview Agent Library Barrel Export (FACADE)
 * @module lib/agent
 *
 * **@deprecated FACADE PATTERN**: This module re-exports from various locations
 * to maintain backward compatibility while complying with Clean Architecture.
 *
 * **MIGRATION REQUIRED**: Update imports to use canonical paths:
 *   OLD: import { credentialVault } from '@/lib/agent/providers/credential-vault';
 *   NEW: import { credentialVault } from '@/lib/agent/providers/credential-vault';
 *
 * Note: Agent-related utilities and providers remain in lib/agent for now.
 * This index file provides a consistent import pattern.
 *
 * **Timeline**: This facade will be removed after migration is complete
 * **Epic**: EPIC-CONSOLIDATION
 * **Created**: 2026-01-29
 */

// ============================================================================
// Re-exports from lib/agent/providers (Provider utilities)
// ============================================================================

export { credentialVault } from './providers/credential-vault';
export type { CredentialVault, Credential } from './providers/credential-vault';

export type {
  OpenAICompatibleConfig,
  ModelInfo,
  ProviderConfig,
} from './providers/types';

// ============================================================================
// Re-exports from lib/agent/hooks (Agent hooks)
// ============================================================================

export { useAgentChatWithTools } from './hooks/use-agent-chat-with-tools';

// ============================================================================
// Re-exports from lib/agent/facades (Agent facades)
// ============================================================================

export type { FileLock } from './facades/file-lock';

// ============================================================================
// Re-exports from lib/agent/utils (Agent utilities)
// ============================================================================

export * from './utils';