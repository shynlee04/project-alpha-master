/**
 * @fileoverview Knowledge Tools Facade Implementation
 * @module lib/agent/facades/knowledge-tools-impl
 *
 * Implementation of AgentKnowledgeTools facade using existing KSI services.
 * Wraps SynthesisService, GeminiPDFProcessor, GeminiImageProcessor, GeminiURLProcessor.
 *
 * @governance EPIC-38, PHASE-7
 * @story KSI Agent Integration
 */

import type {
  AgentKnowledgeTools,
  SynthesisInput,
  PDFProcessingOptions,
  ImageProcessingOptions,
  URLProcessingOptions,
} from './knowledge-tools';
import type { SourceDocument } from '@/lib/knowledge/synthesis-types';
import { SynthesisService } from '@/lib/knowledge/synthesis-service';
import { GeminiPDFProcessor } from '@/lib/knowledge/gemini-pdf-processor';
import { GeminiImageProcessor } from '@/lib/knowledge/gemini-image-processor';
import { GeminiURLProcessor } from '@/lib/knowledge/gemini-url-processor';
import type { SynthesisProgress, GeminiPDFOptions, GeminiImageOptions, GeminiURLOptions } from '@/lib/knowledge/synthesis-types';

/**
 * KnowledgeToolsFacade - Implementation of AgentKnowledgeTools
 *
 * Wraps existing KSI services with providerId-based configuration.
 * Services are created using the static factory methods that fetch
 * API keys from the credential vault and use the agent's configured provider.
 *
 * The model parameter allows the facade to use the agent's configured model
 * instead of hard-coded model names in services.
 */
export class KnowledgeToolsFacade implements AgentKnowledgeTools {
  private providerId: string;
  private model?: string;
  private synthesisService: SynthesisService | null = null;
  private pdfProcessor: GeminiPDFProcessor | null = null;
  private imageProcessor: GeminiImageProcessor | null = null;
  private urlProcessor: GeminiURLProcessor | null = null;

  constructor(providerId: string = 'gemini', model?: string) {
    this.providerId = providerId;
    this.model = model;
  }

  /**
   * Initialize services lazily (created on first use)
   */
  private async ensureServices() {
    if (!this.synthesisService) {
      this.synthesisService = await SynthesisService.create(this.providerId, this.model);
    }
    if (!this.pdfProcessor) {
      this.pdfProcessor = await GeminiPDFProcessor.create(this.providerId, this.model);
    }
    if (!this.imageProcessor) {
      this.imageProcessor = await GeminiImageProcessor.create(this.providerId, this.model);
    }
    if (!this.urlProcessor) {
      this.urlProcessor = await GeminiURLProcessor.create(this.providerId, this.model);
    }
  }

  /**
   * Synthesize knowledge from source document
   */
  async synthesize(input: SynthesisInput): Promise<SourceDocument & { frontmatter: any }> {
    await this.ensureServices();

    if (!this.synthesisService) {
      throw new Error('Synthesis service not initialized');
    }

    // Convert input to SourceDocument format
    const source: SourceDocument = {
      id: input.sourceId,
      type: input.sourceType,
      title: input.title,
      content: input.content,
      mimeType: input.mimeType,
      createdAt: new Date().toISOString(),
    };

    // Convert options
    const options: SynthesisProgress = {
      onProgress: (progress: SynthesisProgress) => {
        console.log(`[KnowledgeTools] Synthesis progress: ${progress.stage} ${progress.progress}%`);
      },
    };

    // Call synthesis service
    const result = await this.synthesisService.synthesize(source, options);

    return result;
  }

  /**
   * Process PDF document
   */
  async processPDF(
    file: File,
    base64Content: string,
    options?: PDFProcessingOptions
  ) {
    await this.ensureServices();

    if (!this.pdfProcessor) {
      throw new Error('PDF processor not initialized');
    }

    // Convert options
    const pdfOptions: GeminiPDFOptions = {
      onProgress: (progress: SynthesisProgress) => {
        console.log(`[KnowledgeTools] PDF progress: ${progress.stage} ${progress.progress}%`);
      },
      extractHeadings: options?.extractHeadings ?? true,
      extractTables: options?.extractTables ?? true,
      extractFigures: options?.extractFigures ?? true,
      extractCitations: options?.extractCitations ?? true,
    };

    // Call PDF processor
    const result = await this.pdfProcessor.processPDF(file, base64Content, pdfOptions);

    return result;
  }

  /**
   * Process image
   */
  async processImage(
    file: File,
    base64Content: string,
    options?: ImageProcessingOptions
  ) {
    await this.ensureServices();

    if (!this.imageProcessor) {
      throw new Error('Image processor not initialized');
    }

    // Convert options
    const imageOptions: GeminiImageOptions = {
      onProgress: (progress: SynthesisProgress) => {
        console.log(`[KnowledgeTools] Image progress: ${progress.stage} ${progress.progress}%`);
      },
      extractText: options?.extractText ?? true,
      generateDescription: options?.generateDescription ?? true,
      detectObjects: options?.detectObjects ?? true,
      detectHandwriting: options?.detectHandwriting ?? true,
    };

    // Call image processor
    const result = await this.imageProcessor.processImage(file, base64Content, imageOptions);

    return result;
  }

  /**
   * Process URL
   */
  async processURL(
    url: string,
    htmlContent: string,
    options?: URLProcessingOptions
  ) {
    await this.ensureServices();

    if (!this.urlProcessor) {
      throw new Error('URL processor not initialized');
    }

    // Convert options
    const urlOptions: GeminiURLOptions = {
      onProgress: (progress: SynthesisProgress) => {
        console.log(`[KnowledgeTools] URL progress: ${progress.stage} ${progress.progress}%`);
      },
      generateSummary: options?.generateSummary ?? true,
      inferMetadata: options?.inferMetadata ?? true,
      detectLinks: options?.detectLinks ?? true,
    };

    // Call URL processor
    const result = await this.urlProcessor.processURL(url, htmlContent, urlOptions);

    return result;
  }
}

/**
 * Factory function to create knowledge tools facade
 *
 * @param providerId - Provider ID (default: 'gemini')
 * @param model - Model identifier (optional, uses agent's configured model)
 * @returns Knowledge tools facade instance
 */
export function createKnowledgeToolsFacade(providerId: string = 'gemini', model?: string): AgentKnowledgeTools {
  return new KnowledgeToolsFacade(providerId, model);
}
