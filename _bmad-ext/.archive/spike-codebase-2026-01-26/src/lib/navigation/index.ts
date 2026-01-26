/**
 * Code Navigation Module
 * @module lib/navigation
 *
 * S-043: Code Navigation
 * Provides go-to-definition, find references, and symbol outline functionality
 */

// Symbol parser
export {
  parseSymbols,
  findSymbolAtPosition,
  getLanguageFromPath,
  getSymbolIcon,
  groupSymbolsByKind,
} from './symbol-parser';
export { SymbolKind } from './symbol-parser';

// Definition provider
export {
  findDefinition,
  findDefinitionFromMonaco,
  navigateToDefinition,
  getDefinitionPreview,
  clearSymbolCache,
  getExportedSymbols,
  updateWorkspaceFiles,
} from './definition-provider';
export type { DefinitionLocation, DefinitionResult } from './definition-provider';

// References provider
export {
  findReferences,
  findReferencesFromMonaco,
  groupReferencesByFile,
  getReferenceCount,
  hasReferences,
  findFileReferences,
  getReferenceSummary,
} from './references-provider';
export type { ReferenceLocation, ReferencesResult } from './references-provider';
export { ReferenceType } from './references-provider';

// Symbol outline
export {
  generateOutline,
  getMonacoOutline,
  filterOutline,
  flattenOutline,
  countSymbolsByKind,
  getSymbolNames,
  findSymbolByLine,
  getOutlineStatistics,
} from './symbol-outline';
export type { OutlineNode, OutlineOptions } from './symbol-outline';
