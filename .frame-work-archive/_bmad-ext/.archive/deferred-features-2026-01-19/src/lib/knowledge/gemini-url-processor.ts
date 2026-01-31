/**
 * @file Stub for archived knowledge module
 * @deprecated This module is archived for MVP
 */

import type { GeminiURLResult } from './gemini-url-types';

export class GeminiURLProcessor {
  async processURL(): Promise<GeminiURLResult> {
    return {
      success: false,
      error: 'Knowledge module archived - URL processing not available in MVP',
    };
  }
}
