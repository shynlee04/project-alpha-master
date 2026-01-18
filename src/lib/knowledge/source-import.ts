/**
 * @file Stub for archived knowledge module
 * @deprecated This module is archived for MVP
 */

export interface SourceImportResult {
  success: boolean;
  sourceId?: string;
  error?: string;
}

export const sourceImportPipeline = {
  async execute(): Promise<SourceImportResult> {
    return {
      success: false,
      error: 'Knowledge module archived - source import not available in MVP',
    };
  },
};
