/**
 * Tool Permission Constants
 */

import type { ToolTrustLevel, ToolCategory } from './types';

export const DEFAULT_TRUST_LEVELS: Record<string, ToolTrustLevel> = {
  read_file: 'auto',
  write_file: 'prompt',
  create_file: 'prompt',
  delete_file: 'block',
  list_files: 'auto',
  execute_command: 'prompt',
  run_terminal: 'prompt',
  synthesize: 'auto',
  search_knowledge: 'auto',
  index_document: 'auto',
  search_notes: 'auto',
  create_note: 'prompt',
  update_note: 'prompt',
  create_flashcard: 'prompt',
  create_quiz: 'prompt',
  process_url: 'prompt',
  web_search: 'prompt',
  unknown: 'prompt',
};

export const TOOL_CATEGORIES: Record<string, ToolCategory> = {
  read_file: 'files',
  write_file: 'files',
  create_file: 'files',
  delete_file: 'files',
  list_files: 'files',
  read_directory: 'files',
  execute_command: 'terminal',
  run_terminal: 'terminal',
  synthesize: 'knowledge',
  search_knowledge: 'knowledge',
  index_document: 'knowledge',
  search_notes: 'files',
  create_note: 'files',
  update_note: 'files',
  create_flashcard: 'files',
  create_quiz: 'files',
  process_url: 'web',
  web_search: 'search',
};

export function getToolIds(): string[] {
  return Object.keys(DEFAULT_TRUST_LEVELS);
}

export function getToolCategory(toolId: string): ToolCategory {
  return TOOL_CATEGORIES[toolId] || 'files';
}
