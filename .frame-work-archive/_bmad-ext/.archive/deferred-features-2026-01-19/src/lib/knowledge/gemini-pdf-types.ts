/**
 * @file Stub for archived knowledge module
 * @deprecated This module is archived for MVP
 */

export interface GeminiPDFResult {
  success: boolean;
  text?: string;
  error?: string;
}

export interface GeminiPDFOptions {
  apiKey?: string;
  maxPages?: number;
}
