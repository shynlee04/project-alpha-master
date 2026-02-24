/**
 * Tool Permission Helper Utilities
 */

import type { ToolCategory } from './types';

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  read_file: 'Read File',
  write_file: 'Write File',
  create_file: 'Create File',
  delete_file: 'Delete File',
  list_files: 'List Files',
  execute_command: 'Execute Command',
  run_terminal: 'Run Terminal',
  synthesize: 'Synthesize',
  search_knowledge: 'Search Knowledge',
  index_document: 'Index Document',
  search_notes: 'Search Notes',
  create_note: 'Create Note',
  update_note: 'Update Note',
  create_flashcard: 'Create Flashcard',
  create_quiz: 'Create Quiz',
  process_url: 'Process URL',
  web_search: 'Web Search',
};

const CATEGORY_DISPLAY_NAMES: Record<ToolCategory, string> = {
  files: 'File Operations',
  terminal: 'Terminal Commands',
  knowledge: 'Knowledge',
  vision: 'Vision',
  search: 'Search',
  web: 'Web',
};

export function getToolDisplayName(toolId: string): string {
  return TOOL_DISPLAY_NAMES[toolId] ?? toolId.replace(/_/g, ' ');
}

export function getCategoryDisplayName(category: ToolCategory): string {
  return CATEGORY_DISPLAY_NAMES[category] ?? category;
}

export function requiresApproval(level: string): boolean {
  return level === 'prompt';
}

export function canExecute(level: string): boolean {
  return level !== 'block';
}

export function toggleTrustLevel(level: string): string {
  const levels: readonly string[] = ['auto', 'prompt', 'block'];
  const currentIndex = levels.indexOf(level);
  const nextIndex = (currentIndex + 1) % levels.length;
  return levels[nextIndex];
}

export function isValidTrustLevel(value: unknown): value is 'auto' | 'prompt' | 'block' {
  return value === 'auto' || value === 'prompt' || value === 'block';
}

export function isValidCategory(value: unknown): value is ToolCategory {
  if (typeof value !== 'string') return false;
  const validCategories: readonly string[] = ['files', 'terminal', 'knowledge', 'vision', 'search', 'web'];
  return validCategories.includes(value);
}

export const DEFAULT_TOOL_TRUST_LEVEL: 'prompt' = 'prompt';
export const DEFAULT_TOOL_CATEGORY: ToolCategory = 'files';
