/**
 * PHASE 2 STUB: Provider Service
 * Original code archived to: _phase2-archive/application/services/ProviderService.ts
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

/**
 * ProviderService stub - Phase 2 feature
 * 
 * This service provides unified access to AI providers (Gemini, OpenAI, etc.)
 * During Phase 1A, all AI features are disabled.
 */
export class ProviderService {
  private static instance: ProviderService;

  static getInstance(): ProviderService {
    if (!ProviderService.instance) {
      ProviderService.instance = new ProviderService();
    }
    return ProviderService.instance;
  }

  /**
   * Generate content using AI provider
   * PHASE 1A: Disabled - returns error
   */
  async generateContent(
    _providerId: string,
    _messages: Array<{ role: string; content: string }>,
    _options?: { model?: string; temperature?: number; maxTokens?: number }
  ): Promise<string> {
    console.log('[ProviderService STUB] Phase 2 feature - generateContent disabled');
    throw new Error('AI features are disabled during Phase 1A foundation development');
  }

  /**
   * Stream content generation from AI provider
   * PHASE 1A: Disabled - returns empty async generator
   */
  async *generateContentStream(
    _providerId: string,
    _messages: Array<{ role: string; content: string }>,
    _options?: { model?: string; temperature?: number; maxTokens?: number }
  ): AsyncGenerator<{ text: string; done: boolean; error?: string }> {
    console.log('[ProviderService STUB] Phase 2 feature - generateContentStream disabled');
    yield {
      text: '',
      done: true,
      error: 'AI features are disabled during Phase 1A foundation development'
    };
  }

  /**
   * Test provider connection
   * PHASE 1A: Disabled - returns false
   */
  async testConnection(_providerId: string): Promise<{ success: boolean; error?: string }> {
    console.log('[ProviderService STUB] Phase 2 feature - testConnection disabled');
    return { success: false, error: 'AI features are disabled during Phase 1A' };
  }
}

// Singleton instance
export const providerService = ProviderService.getInstance();

// Default export for compatibility
export default ProviderService;
