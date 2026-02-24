/**
 * @file Stub for archived knowledge module
 * @deprecated This module is archived for MVP
 */

export interface MetadataExtractor {
  extract: (content: string) => Record<string, unknown>;
}

export const metadataExtractor: MetadataExtractor = {
  extract: () => ({}),
};
