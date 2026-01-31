/**
 * @file Stub for archived knowledge module
 * @deprecated This module is archived for MVP
 */

export class FlashcardExporter {
  async exportToAnki(): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Knowledge module archived - export not available in MVP',
    };
  }

  async exportToCSV(): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Knowledge module archived - export not available in MVP',
    };
  }
}
