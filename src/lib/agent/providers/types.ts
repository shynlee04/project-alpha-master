/**
 * PHASE 2 ARCHIVED
 * Original: _phase2-archive/lib/agent/providers/types.ts
 * 
 * This module is disabled during Phase 1A. Provider types functionality
 * will be restored in Phase 2 when agent features are re-enabled.
 */

console.log('[Phase 2] Provider types disabled during Phase 1A');

// Minimal stub types to prevent import errors
export interface ProviderConfig {
  id: string;
  name: string;
  type: string;
  baseURL: string;
  defaultModel: string;
  enabled: boolean;
  supportsNativeTools: boolean;
  hasApiKey: boolean;
  models: unknown[];
  lastModelFetchAt?: number;
  isCustom?: boolean;
}

export interface ModelInfo {
  id: string;
  name: string;
  isFree?: boolean;
  contextLength?: number;
  providerId: string;
}

// Stub PROVIDERS constant
export const PROVIDERS: Record<string, ProviderConfig> = {};

// Stub GEMINI_MODELS constant
export const GEMINI_MODELS = {
  flash: 'gemini-3-flash',
  pro: 'gemini-3-pro',
  flash25: 'gemini-2.5-flash',
  pro25: 'gemini-2.5-pro',
  stable: 'gemini-2.5-flash-latest',
  stablePro: 'gemini-2.5-pro-latest',
  imagePro: 'gemini-3-pro-image-preview',
  imageFlash: 'gemini-2.5-flash-image',
  lite: 'gemini-2.5-flash-lite',
  embedding: 'gemini-embedding-001',
} as const;

// Stub FREE_MODELS constant
export const FREE_MODELS: ModelInfo[] = [];

// Re-export types for compatibility
export type ProviderType = string;
export type ConnectionTestResult = { valid: boolean; error?: string; latencyMs?: number };
export type ProviderKeyMetadata = unknown;
export type KeyValidationResult = { valid: boolean; error?: string };
export type ModelSettings = unknown;
export type StoredCredential = unknown;
export type AdapterConfig = unknown;
export type ModalityType = string;
export type OpenAICompatibleConfig = ProviderConfig;
