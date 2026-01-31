/**
 * @fileoverview Bento Grid Layout Definitions
 * @module presentation/layouts/bento-layouts
 *
 * **BENTO GRID LAYOUT SYSTEM**
 *
 * Defines asymmetric CSS Grid layouts inspired by Japanese bento boxes.
 * Each plugin count (2-5) has ONE optimal bento arrangement with:
 * - Mixed cell sizes (small, medium, large)
 * - Predefined grid templates (no user resizing)
 * - Toggle-based plugin management
 *
 * Key Principles:
 * - Asymmetric by Design: No equal columns
 * - Predefined Arrangements: One optimal layout per plugin count
 * - Swap-Not-Resize: Users can swap positions, not resize cells
 *
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-04
 * @team Team A
 * @created 2026-01-27
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Plugin count options (2-5 plugins max)
 *
 * @remarks
 * - 2: Core layout (Chat + FileTree always loaded)
 * - 3: L-Shape (Core + 1 toggleable)
 * - 4: 2x2 Asymmetric (Core + 2 toggleable)
 * - 5: Full Bento (Core + 3 toggleable)
 */
export type PluginCount = 2 | 3 | 4 | 5;

/**
 * Cell size variants for responsive plugin rendering
 *
 * @remarks
 * Each plugin should render appropriately based on size:
 * - small: Minimal UI, read-only or condensed
 * - medium: Standard UI with basic interactions
 * - large: Full UI with all features
 */
export type CellSizeVariant = 'small' | 'medium' | 'large';

/**
 * Individual cell configuration in a bento layout
 */
export interface BentoCell {
  /** Unique cell identifier (maps to plugin slot) */
  id: string;
  /** CSS grid-area name for positioning */
  gridArea: string;
  /** Size variant for responsive plugin rendering */
  sizeVariant: CellSizeVariant;
}

/**
 * Complete bento layout configuration
 */
export interface BentoLayout {
  /** Number of active plugins */
  count: PluginCount;
  /** Human-readable layout name */
  name: string;
  /** CSS Grid template configuration */
  gridTemplate: {
    /** grid-template-columns value */
    columns: string;
    /** grid-template-rows value */
    rows: string;
    /** grid-template-areas value (named areas) */
    areas: string;
  };
  /** Cell configurations for each slot */
  cells: BentoCell[];
}

// ============================================================================
// Bento Layout Definitions
// ============================================================================

/**
 * Predefined bento layouts for 2-5 plugins
 *
 * @remarks
 * Each layout is carefully designed for optimal space utilization:
 *
 * **2 Plugins (Core)**
 * ```
 * +---------------------------+---------------------------+
 * |          CHAT             |         FILETREE          |
 * |         (60%)             |          (40%)            |
 * +---------------------------+---------------------------+
 * ```
 *
 * **3 Plugins (L-Shape)**
 * ```
 * +-------------------+---------------+
 * |       CHAT        |   FILETREE    |
 * +-------------------+---------------+
 * |        MAIN CONTENT               |
 * +-----------------------------------+
 * ```
 *
 * **4 Plugins (2x2 Asymmetric)**
 * ```
 * +----------+---------------+
 * |   CHAT   |    MONACO     |
 * +----------+---------------+
 * | FILETREE |  PREVIEW/TERM |
 * +----------+---------------+
 * ```
 *
 * **5 Plugins (Full Bento)**
 * ```
 * +----------------+----------+
 * |     CHAT       | FILETREE |
 * +----------------+----------+
 * |       MONACO (100%)       |
 * +----------------+----------+
 * |  TERMINAL(40%) | PREVIEW  |
 * +----------------+----------+
 * ```
 */
export const BENTO_LAYOUTS: Record<PluginCount, BentoLayout> = {
  // ========================================================================
  // 2 Plugins: Core Layout
  // ========================================================================
  2: {
    count: 2,
    name: 'Core',
    gridTemplate: {
      columns: '6fr 4fr',
      rows: '1fr',
      areas: '"chat filetree"',
    },
    cells: [
      { id: 'chat', gridArea: 'chat', sizeVariant: 'large' },
      { id: 'filetree', gridArea: 'filetree', sizeVariant: 'medium' },
    ],
  },

  // ========================================================================
  // 3 Plugins: L-Shape Layout
  // ========================================================================
  3: {
    count: 3,
    name: 'L-Shape',
    gridTemplate: {
      columns: '2fr 1fr',
      rows: '3fr 2fr',
      areas: '"chat filetree" "main main"',
    },
    cells: [
      { id: 'chat', gridArea: 'chat', sizeVariant: 'medium' },
      { id: 'filetree', gridArea: 'filetree', sizeVariant: 'small' },
      { id: 'main', gridArea: 'main', sizeVariant: 'large' },
    ],
  },

  // ========================================================================
  // 4 Plugins: 2x2 Asymmetric Layout
  // ========================================================================
  4: {
    count: 4,
    name: 'Quad',
    gridTemplate: {
      columns: '3fr 5fr',
      rows: '1fr 1fr',
      areas: '"chat monaco" "filetree preview"',
    },
    cells: [
      { id: 'chat', gridArea: 'chat', sizeVariant: 'medium' },
      { id: 'monaco', gridArea: 'monaco', sizeVariant: 'large' },
      { id: 'filetree', gridArea: 'filetree', sizeVariant: 'medium' },
      { id: 'preview', gridArea: 'preview', sizeVariant: 'medium' },
    ],
  },

  // ========================================================================
  // 5 Plugins: Full Bento Layout
  // ========================================================================
  5: {
    count: 5,
    name: 'Full Bento',
    gridTemplate: {
      columns: '65fr 35fr',
      rows: '35fr 30fr 35fr',
      areas: '"chat filetree" "monaco monaco" "terminal preview"',
    },
    cells: [
      { id: 'chat', gridArea: 'chat', sizeVariant: 'large' },
      { id: 'filetree', gridArea: 'filetree', sizeVariant: 'small' },
      { id: 'monaco', gridArea: 'monaco', sizeVariant: 'large' },
      { id: 'terminal', gridArea: 'terminal', sizeVariant: 'medium' },
      { id: 'preview', gridArea: 'preview', sizeVariant: 'medium' },
    ],
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get bento layout for a specific plugin count
 *
 * @param activeCount - Number of active plugins (2-5)
 * @returns BentoLayout configuration
 *
 * @remarks
 * - Returns layout for given count
 * - Falls back to 2-plugin layout if invalid count
 *
 * @example
 * ```ts
 * const layout = getBentoLayout(3);
 * console.log(layout.name); // "L-Shape"
 * ```
 */
export function getBentoLayout(activeCount: PluginCount): BentoLayout {
  return BENTO_LAYOUTS[activeCount] || BENTO_LAYOUTS[2];
}

/**
 * Get cell configuration by index
 *
 * @param layout - Bento layout
 * @param index - Cell index (0-based)
 * @returns BentoCell or undefined if out of bounds
 */
export function getCellByIndex(layout: BentoLayout, index: number): BentoCell | undefined {
  return layout.cells[index];
}

/**
 * Validate plugin count is in valid range
 *
 * @param count - Number of plugins
 * @returns Clamped count between 2 and 5
 */
export function clampPluginCount(count: number): PluginCount {
  return Math.min(Math.max(count, 2), 5) as PluginCount;
}

// ============================================================================
// Constants
// ============================================================================

/** Always-loaded plugins (cannot be toggled off) */
export const ALWAYS_LOADED_PLUGINS = ['chat', 'filetree'] as const;

/** Toggleable plugins (can be added/removed) */
export const TOGGLEABLE_PLUGINS = ['notes', 'monaco', 'terminal', 'preview'] as const;

/** Minimum number of plugins */
export const MIN_PLUGINS = 2;

/** Maximum number of plugins */
export const MAX_PLUGINS = 5;

// ============================================================================
// No additional exports
// ============================================================================
