/**
 * Zod Validation Schemas for Provider Credentials
 *
 * Runtime validation schemas for API keys to prevent invalid keys
 * from reaching providers. All credentials should be validated before
 * storage in the vault.
 *
 * @module providers/credentials/schemas
 * @story BYOK-02 - Add Zod Validation Schemas
 * @created 2026-01-13
 */

import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Base API key validation
 * Ensures key is not empty and meets minimum length requirements
 */
export const apiKeySchema = z.string({
  error: (issue) => issue.input === undefined
    ? 'API key is required'
    : 'API key must be a string',
})
  .trim()
  .min(20, { error: 'API key too short (minimum 20 characters)' })
  .max(200, { error: 'API key too long (maximum 200 characters)' });

/**
 * Optional API key (can be empty or null)
 */
export const optionalApiKeySchema = z.string().trim().min(20).max(200).nullable().optional();

// ============================================================================
// PROVIDER-SPECIFIC SCHEMAS
// ============================================================================

/**
 * OpenAI API Key Schema
 * Format: sk-<51 characters>
 * Example: sk-proj-abcd1234...
 */
export const openaiApiKeySchema = apiKeySchema
  .startsWith('sk-', { error: 'OpenAI API key must start with "sk-"' })
  .min(51, { error: 'Invalid OpenAI API key length (expected ~51 characters)' });

/**
 * Anthropic API Key Schema
 * Format: sk-ant-<43 characters>
 * Example: sk-ant-api03-1234567890...
 */
export const anthropicApiKeySchema = apiKeySchema
  .startsWith('sk-ant-', { error: 'Anthropic API key must start with "sk-ant-"' })
  .min(51, { error: 'Invalid Anthropic API key length (expected ~51 characters)' });

/**
 * Google Gemini API Key Schema
 * Format: AIza<35 characters>
 * Example: AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ
 */
export const geminiApiKeySchema = apiKeySchema
  .startsWith('AIza', { error: 'Gemini API key must start with "AIza"' })
  .min(39, { error: 'Invalid Gemini API key length (expected ~39 characters)' });

/**
 * OpenRouter API Key Schema
 * Format: sk-or-<48 characters>
 * Example: sk-or-v1-1234567890...
 */
export const openrouterApiKeySchema = apiKeySchema
  .startsWith('sk-or-', { error: 'OpenRouter API key must start with "sk-or-"' })
  .min(51, { error: 'Invalid OpenRouter API key length (expected ~51 characters)' });

/**
 * Groq API Key Schema
 * Format: gsk_<36 characters>
 * Example: gsk_abc123def456...
 */
export const groqApiKeySchema = apiKeySchema
  .startsWith('gsk_', { error: 'Groq API key must start with "gsk_"' })
  .min(40, { error: 'Invalid Groq API key length' });

/**
 * Mistral API Key Schema
 * Format: similar to OpenAI (sk-)
 */
export const mistralApiKeySchema = apiKeySchema
  .startsWith('sk-', { error: 'Mistral API key must start with "sk-"' })
  .min(40, { error: 'Invalid Mistral API key length' });

// ============================================================================
// VALIDATION MAP
// ============================================================================

/**
 * Provider ID to validation schema mapping
 *
 * Maps provider IDs to their corresponding Zod schemas for validation.
 * Use this to get the appropriate schema for a given provider.
 */
export const PROVIDER_KEY_SCHEMAS: Record<string, z.ZodString> = {
  'openai': openaiApiKeySchema,
  'anthropic': anthropicApiKeySchema,
  'google': geminiApiKeySchema,
  'openrouter': openrouterApiKeySchema,
  'groq': groqApiKeySchema,
  'mistral': mistralApiKeySchema,
  // Fallback to base schema for unknown providers
  'default': apiKeySchema,
} as const;

/**
 * Provider IDs that have specific validation schemas
 */
export const VALIDATED_PROVIDERS = Object.keys(PROVIDER_KEY_SCHEMAS).filter(
  (key) => key !== 'default'
);

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Get the validation schema for a provider
 *
 * @param providerId - The provider ID to get schema for
 * @returns The Zod schema for that provider
 */
export function getProviderKeySchema(providerId: string): z.ZodString {
  return PROVIDER_KEY_SCHEMAS[providerId] || PROVIDER_KEY_SCHEMAS['default'];
}

/**
 * Validate an API key for a specific provider
 *
 * @param providerId - The provider ID
 * @param apiKey - The API key to validate
 * @returns Validation result with success flag and optional error message
 */
export function validateProviderApiKey(
  providerId: string,
  apiKey: string
): { success: boolean; error?: string; data?: string } {
  try {
    const schema = getProviderKeySchema(providerId);
    const result = schema.parse(apiKey);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return {
        success: false,
        error: typeof firstIssue === 'object' && 'message' in firstIssue
          ? String(firstIssue.message)
          : 'Invalid API key format',
      };
    }
    return {
      success: false,
      error: 'Validation failed',
    };
  }
}

/**
 * Validate API key asynchronously (for future extensibility)
 *
 * @param providerId - The provider ID
 * @param apiKey - The API key to validate
 * @returns Promise that resolves with validation result
 */
export async function validateProviderApiKeyAsync(
  providerId: string,
  apiKey: string
): Promise<{ success: boolean; error?: string; data?: string }> {
  // Synchronous for now, but async for future API-based validation
  return validateProviderApiKey(providerId, apiKey);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  apiKeySchema,
  openaiApiKeySchema,
  anthropicApiKeySchema,
  geminiApiKeySchema,
  openrouterApiKeySchema,
  groqApiKeySchema,
  mistralApiKeySchema,
  PROVIDER_KEY_SCHEMAS,
  VALIDATED_PROVIDERS,
  getProviderKeySchema,
  validateProviderApiKey,
  validateProviderApiKeyAsync,
};
