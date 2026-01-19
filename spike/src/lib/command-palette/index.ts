/**
 * Command Palette Module
 *
 * Exports all command palette utilities and components.
 */

export { CommandPalette } from '@/presentation/components/command-palette/CommandPalette';
export { useCommandPalette } from '@/hooks/useCommandPalette';
export {
  commandRegistry,
  type Command,
  type CommandCategory,
  type CommandGroup,
  type CommandContext,
  type CommandPriority,
  type CommandShortcut,
} from '@/lib/command-palette/command-registry';
export {
  fuzzySearch,
  fuzzyScore,
  findMatches,
  highlightMatches,
  highlightFuzzy,
  rankByRelevance,
  type FuzzySearchIndex,
  type MatchResult,
  type SearchResult,
} from '@/lib/command-palette/fuzzy-search';
