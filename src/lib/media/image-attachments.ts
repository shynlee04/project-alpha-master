/**
 * @fileoverview Image attachment utilities for multimodal AI chat
 * @module lib/media/image-attachments
 *
 * E2-8: Gemini Multimodal Integration
 * - Convert File attachments to base64 for AI transmission
 * - MIME type preservation for proper decoding
 * - Support for JPEG, PNG, WebP, GIF formats
 */

import type { FileAttachment } from '@/presentation/components/chat/FileAttachmentInput';

export interface ImageAttachmentData {
  /** Raw base64 string (without data URL prefix) */
  base64: string;
  /** MIME type for proper image decoding */
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  /** Original filename for context */
  filename: string;
}

/**
 * Convert File to base64 string (without data URL prefix)
 *
 * @param file - The image file to convert
 * @returns Promise resolving to raw base64 string
 *
 * @example
 * const base64 = await fileToBase64(imageFile);
 * // Returns: "iVBORw0KGgoAAAANSUhEUgAA..." (no prefix)
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get raw base64
      // Input: "data:image/png;base64,iVBORw0KGgo..."
      // Output: "iVBORw0KGgo..."
      const commaIndex = result.indexOf(',');
      if (commaIndex === -1) {
        reject(new Error('Invalid data URL format'));
        return;
      }
      const base64 = result.slice(commaIndex + 1);
      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get MIME type from file, defaulting to JPEG for unknown types
 *
 * @param file - The file to inspect
 * @returns Standardized MIME type for AI transmission
 */
function getImageMimeType(file: File): ImageAttachmentData['mimeType'] {
  const fileType = file.type.toLowerCase();

  if (fileType === 'image/png') return 'image/png';
  if (fileType === 'image/webp') return 'image/webp';
  if (fileType === 'image/gif') return 'image/gif';
  // Default to JPEG for unknown types and image/jpeg
  return 'image/jpeg';
}

/**
 * Convert FileAttachment to ImageAttachmentData for AI transmission
 *
 * Extracts the base64 payload and MIME type needed for
 * multimodal message building with TanStack AI SDK.
 *
 * @param attachment - The file attachment to convert
 * @returns Promise resolving to image data ready for AI
 *
 * @example
 * const imageData = await attachmentToImageData(fileAttachment);
 * // Use with buildMultimodalMessage(text, [imageData])
 */
export async function attachmentToImageData(
  attachment: FileAttachment
): Promise<ImageAttachmentData> {
  if (!attachment.file) {
    throw new Error('Attachment has no file');
  }
  const base64 = await fileToBase64(attachment.file);
  const mimeType = getImageMimeType(attachment.file);

  return {
    base64,
    mimeType,
    filename: attachment.file.name,
  };
}

/**
 * Convert multiple attachments to image data (images only)
 *
 * Filters non-image attachments and converts all images
 * in parallel for efficiency.
 *
 * @param attachments - Array of mixed attachment types
 * @returns Promise resolving to array of image data
 */
export async function convertImageAttachments(
  attachments: FileAttachment[]
): Promise<ImageAttachmentData[]> {
  const imageAttachments = attachments.filter((a) => a.type === 'image');

  if (imageAttachments.length === 0) {
    return [];
  }

  return Promise.all(imageAttachments.map(attachmentToImageData));
}

/**
 * Check if base64 string has data URL prefix
 *
 * @param base64 - String to check
 * @returns true if prefix is present
 */
export function hasDataURLPrefix(base64: string): boolean {
  return base64.includes(',');
}

/**
 * Strip data URL prefix from base64 string
 *
 * @param base64 - Base64 string with or without prefix
 * @returns Base64 string without prefix
 */
export function stripDataURLPrefix(base64: string): string {
  if (!hasDataURLPrefix(base64)) {
    return base64;
  }
  const commaIndex = base64.indexOf(',');
  return base64.slice(commaIndex + 1);
}
