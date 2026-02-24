/**
 * @file Stub for archived knowledge module
 * @deprecated This module is archived for MVP
 */

import type { GeminiImageResult, GeminiImageOptions } from './gemini-image-types';

export class GeminiImageProcessor {
  async processImage(): Promise<GeminiImageResult> {
    return {
      success: false,
      error: 'Knowledge module archived - image processing not available in MVP',
    };
  }
}
