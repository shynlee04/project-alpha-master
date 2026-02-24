/**
 * @file Stub for archived knowledge module
 * @deprecated This module is archived for MVP
 */

import type { SynthesisResult, SynthesisOptions } from './synthesis-types';

export class SynthesisService {
  async synthesize(options: SynthesisOptions): Promise<SynthesisResult> {
    return {
      success: false,
      artifacts: [],
      error: 'Knowledge module archived - synthesis not available in MVP',
    };
  }
}
