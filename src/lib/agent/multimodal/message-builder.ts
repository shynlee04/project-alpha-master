/**
 * @fileoverview Multimodal Message Builder
 * @module lib/agent/multimodal/message-builder
 * @governance EPIC-10-2
 *
 * Builds multimodal messages for TanStack AI SDK with Gemini vision.
 * Supports text + image combinations for vision queries.
 *
 * Story 10.2: Multimodal Source Vision (Desktop Only)
 */

import type { CoreMessage, MultimodalContent } from '../memory/insight-extractor';

export interface ImageContent {
  /**
   * Base64 encoded image (with or without data URL prefix)
   */
  base64: string;

  /**
   * MIME type (default: image/jpeg)
   */
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Build a multimodal message with text and optional image
 *
 * @param text - Text prompt/question
 * @param images - Optional array of images
 * @returns CoreMessage formatted for TanStack AI SDK
 *
 * @example
 * ```typescript
 * // Text-only message
 * const textMsg = buildMultimodalMessage('What is this chart showing?');
 *
 * // Text + image message
 * const visionMsg = buildMultimodalMessage(
 *   'What is this chart showing?',
 *   [{ base64: 'data:image/jpeg;base64,/9j/4AAQ...' }]
 * );
 * ```
 */
export function buildMultimodalMessage(
  text: string,
  images?: ImageContent[]
): CoreMessage {
  const content: MultimodalContent[] = [
    {
      type: 'text',
      text,
    },
  ];

  // Add images if provided
  if (images && images.length > 0) {
    for (const image of images) {
      // Extract base64 if data URL prefix is present
      const base64Value = image.base64.includes(',')
        ? image.base64.split(',')[1]
        : image.base64;

      content.push({
        type: 'image',
        source: {
          type: 'data',
          value: base64Value,
        },
        metadata: {
          mimeType: image.mimeType || 'image/jpeg',
        },
      });
    }
  }

  return {
    role: 'user',
    content,
  };
}

/**
 * Build a multimodal message from PDF capture
 *
 * @param question - User question about the PDF page
 * @param capturedPage - Captured PDF page data
 * @returns CoreMessage formatted for TanStack AI SDK
 *
 * @example
 * ```typescript
 * const captured = await capturePdfPage(pdf, 1);
 * const message = buildVisionMessage(
 *   'What does this chart show?',
 *   captured
 * );
 * ```
 */
export function buildVisionMessage(
  question: string,
  capturedPage: {
    base64: string;
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  }
): CoreMessage {
  return buildMultimodalMessage(question, [
    {
      base64: capturedPage.base64,
      mimeType: capturedPage.mimeType,
    },
  ]);
}

/**
 * Build a multimodal message with context about surrounding content
 *
 * @param question - User question about the PDF page
 * @param capturedPage - Captured PDF page data
 * @param contextText - Optional context from surrounding text
 * @returns CoreMessage formatted for TanStack AI SDK
 *
 * @example
 * ```typescript
 * const captured = await capturePdfPage(pdf, 1);
 * const message = buildVisionMessageWithContext(
 *   'Explain this chart',
 *   captured,
 *   'This is from Chapter 3 about economic growth'
 * );
 * ```
 */
export function buildVisionMessageWithContext(
  question: string,
  capturedPage: {
    base64: string;
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  },
  contextText?: string
): CoreMessage {
  let enhancedQuestion = question;

  if (contextText) {
    enhancedQuestion = `${question}\n\nContext: ${contextText}`;
  }

  return buildVisionMessage(enhancedQuestion, capturedPage);
}

/**
 * Extract text content from multimodal message
 *
 * @param message - CoreMessage
 * @returns Text content or null
 */
export function extractTextContent(
  message: CoreMessage
): string | null {
  if (typeof message.content === 'string') {
    return message.content;
  }

  const contentArray = message.content;
  if (Array.isArray(contentArray)) {
    const textItem = contentArray.find(
      (item: any) => item.type === 'text'
    ) as { type: 'text'; text: string } | undefined;

    return textItem?.text || null;
  }

  return null;
}

/**
 * Extract all images from multimodal message
 *
 * @param message - CoreMessage
 * @returns Array of image base64 strings
 */
export function extractImages(message: CoreMessage): string[] {
  if (typeof message.content === 'string') {
    return [];
  }

  const contentArray = message.content;
  if (Array.isArray(contentArray)) {
    return contentArray
      .filter((item: any) => item.type === 'image')
      .map((item: any) => {
        const img = item as {
          source: { type: 'data'; value: string };
        };
        return img.source.value;
      });
  }

  return [];
}

/**
 * Check if message contains image content
 *
 * @param message - CoreMessage
 * @returns true if message has at least one image
 */
export function hasImageContent(message: CoreMessage): boolean {
  return extractImages(message).length > 0;
}

/**
 * Estimate message size in characters (for bandwidth estimation)
 *
 * @param message - CoreMessage
 * @returns Approximate size in characters
 */
export function estimateMessageSize(message: CoreMessage): number {
  let size = 0;

  if (typeof message.content === 'string') {
    return message.content.length;
  }

  const contentArray = message.content;
  if (Array.isArray(contentArray)) {
    for (const item of contentArray) {
      if (item.type === 'text') {
        size += item.text.length;
      } else if (item.type === 'image') {
        const img = item as { source: { type: 'data'; value: string } };
        size += img.source.value.length;
      }
    }
  }

  return size;
}
