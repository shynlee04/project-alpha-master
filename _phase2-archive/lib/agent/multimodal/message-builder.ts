/**
 * @fileoverview Multimodal Message Builder
 * @module lib/agent/multimodal/message-builder
 * @governance EPIC-10-2
 *
 * Builds multimodal messages for TanStack AI SDK with Gemini vision.
 * Supports text + image + video + audio + document combinations for multi-modal queries.
 *
 * Story 10.2: Multimodal Source Vision (Desktop Only)
 * Updated 2026-01-14: Added video, audio, and document support for Gemini 3.0
 */

import type { CoreMessage, MultimodalContent } from '../memory/insight-extractor';

export interface ImageContent {
  /**
   * Base64 encoded image (with or without data URL prefix)
   */
  base64: string;

  /**
   * MIME type (default: image/jpeg)
   * E2-8: Added GIF support for animated images
   */
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
}

export interface VideoContent {
  /**
   * Base64 encoded video (with or without data URL prefix)
   */
  base64: string;

  /**
   * MIME type (default: video/mp4)
   */
  mimeType?: 'video/mp4' | 'video/webm' | 'video/quicktime';
}

export interface AudioContent {
  /**
   * Base64 encoded audio (with or without data URL prefix)
   */
  base64: string;

  /**
   * MIME type (default: audio/webm)
   */
  mimeType?: 'audio/mp3' | 'audio/wav' | 'audio/webm' | 'audio/ogg' | 'audio/mpeg';
}

export interface DocumentContent {
  /**
   * Base64 encoded document (with or without data URL prefix)
   */
  base64: string;

  /**
   * MIME type (default: application/pdf)
   */
  mimeType?: 'application/pdf';
}

/**
 * Media content union type
 */
export type MediaContent = ImageContent | VideoContent | AudioContent | DocumentContent;

/**
 * Build a multimodal message with text and optional media
 *
 * @param text - Text prompt/question
 * @param media - Optional array of media (images, videos, audio, documents)
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
 *   [{ base64: 'data:image/jpeg;base64,/9j/4AAQ...', type: 'image' }]
 * );
 *
 * // Text + video message (Gemini 3.0)
 * const videoMsg = buildMultimodalMessage(
 *   'Describe what happens in this video',
 *   [{ base64: 'data:video/mp4;base64,...', type: 'video' }]
 * );
 * ```
 */
export function buildMultimodalMessage(
  text: string,
  media?: Array<ImageContent | VideoContent | AudioContent | DocumentContent>
): CoreMessage {
  const content: MultimodalContent[] = [
    {
      type: 'text',
      text,
    },
  ];

  // Add media if provided
  if (media && media.length > 0) {
    for (const item of media) {
      // Extract base64 if data URL prefix is present
      const base64Value = item.base64.includes(',')
        ? item.base64.split(',')[1]
        : item.base64;

      // Determine media type and add appropriate content
      if ('type' in item) {
        // Explicit type specified (newer API)
        switch (item.type) {
          case 'image':
            content.push({
              type: 'image',
              source: {
                type: 'data',
                value: base64Value,
              },
              metadata: {
                mimeType: (item as ImageContent).mimeType || 'image/jpeg',
              },
            });
            break;
          case 'video':
            content.push({
              type: 'video',
              source: {
                type: 'data',
                value: base64Value,
              },
              metadata: {
                mimeType: (item as VideoContent).mimeType || 'video/mp4',
              },
            });
            break;
          case 'audio':
            content.push({
              type: 'audio',
              source: {
                type: 'data',
                value: base64Value,
              },
              metadata: {
                mimeType: (item as AudioContent).mimeType || 'audio/webm',
              },
            });
            break;
          case 'document':
            content.push({
              type: 'document',
              source: {
                type: 'data',
                value: base64Value,
              },
              metadata: {
                mimeType: (item as DocumentContent).mimeType || 'application/pdf',
              },
            });
            break;
        }
      } else {
        // Legacy: detect type from mimeType (image only for backward compatibility)
        const mimeType = (item as ImageContent).mimeType || 'image/jpeg';
        if (mimeType.startsWith('image/')) {
          content.push({
            type: 'image',
            source: {
              type: 'data',
              value: base64Value,
            },
            metadata: {
              mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
            },
          });
        }
      }
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
 * Extract all videos from multimodal message
 *
 * @param message - CoreMessage
 * @returns Array of video base64 strings
 */
export function extractVideos(message: CoreMessage): string[] {
  if (typeof message.content === 'string') {
    return [];
  }

  const contentArray = message.content;
  if (Array.isArray(contentArray)) {
    return contentArray
      .filter((item: any) => item.type === 'video')
      .map((item: any) => {
        const vid = item as {
          source: { type: 'data'; value: string };
        };
        return vid.source.value;
      });
  }

  return [];
}

/**
 * Check if message contains video content
 *
 * @param message - CoreMessage
 * @returns true if message has at least one video
 */
export function hasVideoContent(message: CoreMessage): boolean {
  return extractVideos(message).length > 0;
}

/**
 * Extract all audio from multimodal message
 *
 * @param message - CoreMessage
 * @returns Array of audio base64 strings
 */
export function extractAudio(message: CoreMessage): string[] {
  if (typeof message.content === 'string') {
    return [];
  }

  const contentArray = message.content;
  if (Array.isArray(contentArray)) {
    return contentArray
      .filter((item: any) => item.type === 'audio')
      .map((item: any) => {
        const aud = item as {
          source: { type: 'data'; value: string };
        };
        return aud.source.value;
      });
  }

  return [];
}

/**
 * Check if message contains audio content
 *
 * @param message - CoreMessage
 * @returns true if message has at least one audio
 */
export function hasAudioContent(message: CoreMessage): boolean {
  return extractAudio(message).length > 0;
}

/**
 * Check if message contains any media content
 *
 * @param message - CoreMessage
 * @returns true if message has at least one media item (image, video, audio, document)
 */
export function hasMediaContent(message: CoreMessage): boolean {
  return hasImageContent(message) || hasVideoContent(message) || hasAudioContent(message);
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
      } else if (item.type === 'image' || item.type === 'video' || item.type === 'audio' || item.type === 'document') {
        const media = item as { source: { type: 'data'; value: string } };
        size += media.source.value.length;
      }
    }
  }

  return size;
}
