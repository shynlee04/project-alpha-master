/**
 * Provider Fallback Module
 *
 * Provides fallback logic when an agent's configured provider lacks an API key.
 * Uses the existing ProviderService infrastructure for health tracking and
 * priority ordering. Supports workspace-scoped provider preferences.
 *
 * @story PRV-03 - Provider Fallback Mechanism
 * @story PRV-04 - Workspace-scoped Provider Preferences
 * @epic EPIC-PRV-UI - Provider Frontend Integration
 */

import { credentialVault } from './providers/credential-vault';
import type { WorkspaceType } from '@/infrastructure/persistence/stores/workspace/workspace-types';

/**
 * Provider priority fallback order
 *
 * Providers are tried in this order when the agent's configured provider
 * lacks an API key. This order prioritizes:
 * 1. Free/tier providers first (most accessible)
 * 2. Major providers by reliability
 * 3. Aggregators as last resort
 *
 * @story PRV-03 - AC3: Fallback order configurable
 */
export const PROVIDER_FALLBACK_PRIORITY: readonly string[] = [
  'groq',        // Fast, generous free tier
  'openrouter',  // Aggregator with free models
  'google',      // Gemini with free tier
  'openai',      // Industry standard
  'anthropic',   // Claude (usually paid)
  'mistral',     // Mistral AI
  'chutes',      // Chutes.ai
] as const;

/**
 * Fallback provider names for display
 * Maps provider IDs to human-readable names
 */
const PROVIDER_NAMES: Record<string, string> = {
  'groq': 'Groq',
  'openrouter': 'OpenRouter',
  'google': 'Google Gemini',
  'openai': 'OpenAI',
  'anthropic': 'Anthropic Claude',
  'mistral': 'Mistral AI',
  'chutes': 'Chutes.ai',
};

/**
 * Result from provider fallback resolution
 */
export interface ProviderFallbackResult {
  /** The provider ID that has a valid API key */
  providerId: string;
  /** The API key for the provider */
  apiKey: string;
  /** The original provider ID that was requested (may differ from providerId if fallback occurred) */
  originalProviderId: string;
  /** Whether a fallback occurred (true if returned provider differs from requested) */
  isFallback: boolean;
}

/**
 * Error thrown when no provider in the fallback chain has an API key
 */
export class NoProviderKeyAvailableError extends Error {
  constructor(
    public readonly attemptedProviders: string[]
  ) {
    super(
      `No API key available for any provider. Attempted: ${attemptedProviders.join(', ')}`
    );
    this.name = 'NoProviderKeyAvailableError';
  }
}

/**
 * Get a provider with a valid API key, falling back through the priority list.
 *
 * This function:
 * 1. First tries the requested provider
 * 2. If no key found, tries each provider in PRIORITY_ORDER
 * 3. Returns the first provider with a valid API key
 * 4. Tracks whether a fallback occurred
 *
 * @param requestedProviderId - The provider ID the agent is configured with
 * @param fallbackPriority - Optional custom fallback priority (defaults to PROVIDER_FALLBACK_PRIORITY)
 * @returns ProviderFallbackResult with provider ID, API key, and fallback status
 * @throws NoProviderKeyAvailableError if no provider has a valid key
 *
 * @example
 * ```typescript
 * try {
 *   const result = await getProviderWithKey('openai');
 *   if (result.isFallback) {
 *     console.log(`Using ${result.providerId} instead of ${result.originalProviderId}`);
 *   }
 * } catch (error) {
 *   if (error instanceof NoProviderKeyAvailableError) {
 *     console.log('No provider has an API key configured');
 *   }
 * }
 * ```
 */
export async function getProviderWithKey(
  requestedProviderId: string,
  fallbackPriority: readonly string[] = PROVIDER_FALLBACK_PRIORITY
): Promise<ProviderFallbackResult> {
  // Ensure vault is initialized
  await credentialVault.initialize();

  // Build the list of providers to try (requested first, then fallbacks)
  const providersToTry = [
    requestedProviderId,
    ...fallbackPriority.filter(p => p !== requestedProviderId)
  ];

  // Track the original provider for result reporting
  const originalProviderId = requestedProviderId;

  // Try each provider in order
  for (const providerId of providersToTry) {
    const hasKey = await credentialVault.hasCredentials(providerId);
    if (hasKey) {
      const apiKey = await credentialVault.getCredentials(providerId);
      if (apiKey) {
        // Found a provider with a valid key
        return {
          providerId,
          apiKey,
          originalProviderId,
          isFallback: providerId !== originalProviderId,
        };
      }
    }
  }

  // No provider has a valid key
  throw new NoProviderKeyAvailableError(providersToTry);
}

/**
 * Workspace provider preference interface
 *
 * @story PRV-04 - Workspace-scoped Provider Preferences
 */
export interface WorkspaceProviderPreference {
  /** Preferred provider ID for this workspace (null = use global default) */
  preferredProviderId: string | null;
  /** Custom fallback chain (null = use global default) */
  fallbackProviders: string[] | null;
  /** Whether to use strict mode (don't fallback if preferred lacks key) */
  strictMode: boolean;
}

/**
 * Get a provider with a valid API key for a specific workspace.
 *
 * This function respects workspace-scoped provider preferences:
 * 1. Checks if workspace has a preferred provider configured
 * 2. If yes, uses workspace preference (unless strict mode and no key)
 * 3. Falls back through workspace's custom fallback chain or global default
 * 4. Tracks whether workspace preference was used
 *
 * @param requestedProviderId - The provider ID the agent is configured with
 * @param workspace - The workspace type (ide, knowledge, study, notes)
 * @param workspacePreference - Optional workspace provider preference
 * @returns ProviderFallbackResult with provider ID, API key, and fallback status
 * @throws NoProviderKeyAvailableError if no provider has a valid key
 *
 * @story PRV-04 - AC2: Workspace provider inherits from global if not set
 *
 * @example
 * ```typescript
 * const result = await getProviderWithKeyForWorkspace(
 *   'openai',
 *   'ide',
 *   { preferredProviderId: 'groq', fallbackProviders: null, strictMode: false }
 * );
 * // Returns Groq if available, otherwise falls back to default chain
 * ```
 */
export async function getProviderWithKeyForWorkspace(
  requestedProviderId: string,
  _workspace: WorkspaceType,
  workspacePreference?: WorkspaceProviderPreference
): Promise<ProviderFallbackResult> {
  // Determine effective provider ID (workspace preference takes precedence)
  const effectiveProviderId = workspacePreference?.preferredProviderId
    ? workspacePreference.preferredProviderId
    : requestedProviderId;

  // Determine fallback priority (workspace custom chain or global default)
  const fallbackPriority = workspacePreference?.fallbackProviders
    ? workspacePreference.fallbackProviders
    : PROVIDER_FALLBACK_PRIORITY;

  // In strict mode, only try the preferred provider (no fallback)
  if (workspacePreference?.strictMode && workspacePreference.preferredProviderId) {
    await credentialVault.initialize();
    const hasKey = await credentialVault.hasCredentials(workspacePreference.preferredProviderId);

    if (hasKey) {
      const apiKey = await credentialVault.getCredentials(workspacePreference.preferredProviderId);
      if (apiKey) {
        return {
          providerId: workspacePreference.preferredProviderId,
          apiKey,
          originalProviderId: requestedProviderId,
          isFallback: workspacePreference.preferredProviderId !== requestedProviderId,
        };
      }
    }

    // Strict mode: no fallback, throw error immediately
    throw new NoProviderKeyAvailableError([workspacePreference.preferredProviderId]);
  }

  // Standard mode: use fallback chain
  return getProviderWithKey(effectiveProviderId, fallbackPriority);
}

/**
 * Get the display name for a provider ID
 */
export function getProviderDisplayName(providerId: string): string {
  return PROVIDER_NAMES[providerId] || providerId;
}

/**
 * Check if a specific provider has a valid API key
 *
 * @param providerId - The provider ID to check
 * @returns true if the provider has a stored API key
 */
export async function providerHasKey(providerId: string): Promise<boolean> {
  await credentialVault.initialize();
  const hasKey = await credentialVault.hasCredentials(providerId);
  if (!hasKey) return false;

  const apiKey = await credentialVault.getCredentials(providerId);
  return apiKey !== null && apiKey.length > 0;
}

/**
 * Get all providers that currently have API keys configured
 *
 * @returns Array of provider IDs with valid API keys
 */
export async function getProvidersWithKeys(): Promise<string[]> {
  await credentialVault.initialize();
  const providersToCheck = [...PROVIDER_FALLBACK_PRIORITY];

  const providersWithKeys: string[] = [];
  for (const providerId of providersToCheck) {
    if (await providerHasKey(providerId)) {
      providersWithKeys.push(providerId);
    }
  }

  return providersWithKeys;
}
