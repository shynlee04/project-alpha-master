/**
 * @fileoverview Agent Config Dialog Utils
 * @module presentation/components/agent
 *
 * Helper utilities for AgentConfigDialog component.
 */

/**
 * Map provider display name (from Agent interface) to store ID
 * Fixes: Agent edits not reflecting existing values
 */
export const mapProviderNameToId = (providerName: string): string => {
    const nameToIdMap: Record<string, string> = {
        'OpenRouter': 'openrouter',
        'OpenAI': 'openai',
        'Anthropic': 'anthropic',
        'Mistral': 'mistral',
        'Google': 'google',
        'OpenAI Compatible': 'openai-compatible',
    };
    return nameToIdMap[providerName] || 'openrouter';
};
