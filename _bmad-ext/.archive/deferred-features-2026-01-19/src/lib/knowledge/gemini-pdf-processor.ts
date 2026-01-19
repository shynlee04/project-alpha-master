/**
 * @file Stub for archived knowledge module
 * @deprecated This module is archived for MVP
 */

import type { GeminiPDFResult, GeminiPDFOptions } from './gemini-pdf-types';

export class GeminiPDFProcessor {
  async processPDF(): Promise<GeminiPDFResult> {
    return {
      success: false,
      error: 'Knowledge module archived - PDF processing not available in MVP',
    };
  }
}
