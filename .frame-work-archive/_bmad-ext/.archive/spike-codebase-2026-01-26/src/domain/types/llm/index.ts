/**
 * @fileoverview LLM & Provider Types - Barrel Export
 * @module domain/types/llm
 *
 * Single entry point for all LLM/provider-related types.
 * Re-exports all canonical type definitions.
 *
 * @ epic EPIC-GU
 * @ epic EPIC-PRV
 * @ story GU-A-01 - Unify Provider Type Definitions
 * @ story PRV-01 - Universal Provider Types
 * @created 2026-01-09
 * @updated 2026-01-11
 */

// ============================================================================
// PROVIDER TYPES
// ============================================================================

export type {
  ProviderType,
  ProviderConfig,
  OpenAICompatibleConfig,
  ConnectionTestResult,
  ProviderKeyMetadata,
  KeyValidationResult,
} from './provider-types.js';

// ============================================================================
// UNIVERSAL PROVIDER TYPES (EPIC-PRV)
// ============================================================================

export type {
  ModalityType,
  UniversalProviderConfig,
  UniversalModelConfig,
  ProviderRequestContext,
  ProviderResponse,
  ProviderRegistryEntry,
} from './provider-types.js';

// ============================================================================
// MODEL TYPES
// ============================================================================

export type {
  ModelInfo,
  ModelSettings,
  ModelStateEntry,
} from './model-types.js';

// ============================================================================
// CREDENTIAL TYPES
// ============================================================================

export type {
  StoredCredential,
  ApiKeyConfig,
  CredentialStorage,
} from './credential-types.js';

// ============================================================================
// ADAPTER TYPES
// ============================================================================

export type {
  AdapterConfig,
  ProviderAdapter,
  ChatMessage,
  ChatOptions,
  ChatChunk,
  ToolDefinition,
  ToolCall,
  AdapterResponse,
} from './adapter-types.js';

// ============================================================================
// CONSTANTS
// ============================================================================

// Note: PROVIDERS, GEMINI_MODELS, FREE_MODELS constants remain in
// src/lib/agent/providers/types.ts to avoid circular dependency.
// Import them directly from that location if needed.
