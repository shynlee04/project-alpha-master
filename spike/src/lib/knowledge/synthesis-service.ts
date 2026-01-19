/**
 * @fileoverview Synthesis service (stub - DEFERRED)
 * @module lib/knowledge/synthesis-service
 * @status DEFERRED - Synthesis is post-MVP
 *
 * Provides AI synthesis capabilities for generating study materials.
 * Actual implementation will be added when Knowledge/Study epic begins.
 */

import type { SourceDocument, SynthesisResult, SynthesisOptions } from './synthesis-types';

/**
 * Synthesis service class (stub)
 * @deprecated Synthesis is deferred to post-MVP
 */
export class SynthesisService {
  private provider: string;

  private constructor(provider: string) {
    this.provider = provider;
  }

  /**
   * Create a synthesis service instance
   * @param provider - AI provider name (e.g., 'gemini', 'openai')
   * @returns Synthesis service instance
   */
  static async create(provider: string): Promise<SynthesisService> {
    return new SynthesisService(provider);
  }

  /**
   * Synthesize study materials from a source document
   * @param source - Source document to synthesize
   * @param options - Synthesis options
   * @returns Synthesis result
   */
  async synthesize(
    source: SourceDocument,
    options?: SynthesisOptions
  ): Promise<SynthesisResult> {
    // Stub implementation - returns empty result
    console.warn('[SynthesisService] Synthesis is deferred to post-MVP');

    // Call progress callback if provided
    if (options?.onProgress) {
      options.onProgress({
        status: 'completed',
        progress: 100,
        stage: 'Stub - no synthesis performed',
      });
    }

    return {
      id: crypto.randomUUID(),
      type: options?.artifactType || 'flashcards',
      sourceId: source.id,
      createdAt: Date.now(),
      flashcards: [],
      quizQuestions: [],
    };
  }

  /**
   * Get provider name
   */
  getProvider(): string {
    return this.provider;
  }
}

/**
 * Create a synthesis service (factory function)
 * @param provider - AI provider name
 * @returns Synthesis service instance
 */
export async function createSynthesisService(
  provider: string
): Promise<SynthesisService> {
  return SynthesisService.create(provider);
}
