/**
 * @fileoverview Feature Modules - Public API
 * @description Entry point for the feature module system.
 * 
 * Modules represent standalone, pluggable features that extend platform capabilities.
 * Each module is self-contained with its own:
 * - UI components
 * - Local state management
 * - Integration hooks with platform operators
 *
 * Available modules:
 * - monaco: Code editor integration
 * - notes: Note-taking functionality
 * - terminal: Terminal emulation
 * - preview: Content preview rendering
 *
 * @module modules
 * @layer modules
 */

// Types
export type { ModuleType, ModuleProps, IFeatureModule } from './types';

// Loader
export { moduleLoader } from './loader';

// Components
export { ModulePanel } from './ModulePanel';

// Note: Individual modules will be added as they are implemented
// export { default as MonacoModule } from './monaco';
// export { default as NotesModule } from './notes';
// export { default as TerminalModule } from './terminal';
// export { default as PreviewModule } from './preview';
