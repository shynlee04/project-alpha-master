/**
 * PHASE 2 STUB: Agent Providers
 * Original code archived to: _phase2-archive/lib/agent/providers/
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

export type ProviderType = 'openai' | 'anthropic' | 'google' | 'local';

export interface ProviderConfig {
  id: string;
  type: ProviderType;
  name: string;
  apiKey?: string;
  baseUrl?: string;
}

export const providers: ProviderConfig[] = [];

export function getProvider(_id: string): ProviderConfig | null {
  console.log('[Phase 2] Provider access disabled during Phase 1A');
  return null;
}

export function getDefaultProvider(): ProviderConfig | null {
  console.log('[Phase 2] Provider access disabled during Phase 1A');
  return null;
}
