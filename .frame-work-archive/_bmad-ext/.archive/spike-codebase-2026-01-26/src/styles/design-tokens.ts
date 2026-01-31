/**
 * Design Tokens TypeScript Type Definitions
 * 
 * @fileoverview Design System Token Types
 * @module styles/design-tokens
 * @created 2025-12-25
 * @updated 2025-12-25
 * 
 * Type-safe access to design system tokens.
 * 
 * @section Color Tokens
 * - Primary: Brand accent colors (cyan, magenta, yellow, green)
 * - Secondary: Supporting colors (blue, orange, purple, red)
 * - Neutral: Grayscale palette for backgrounds and text
 * - Semantic: Status colors (success, warning, error, info)
 * - 8-bit Retro: Classic 16-color palette
 * - 8-bit Pixel: Black, white, gray
 * 
 * @section Typography Tokens
 * - Font families: sans, mono, pixel
 * - Font sizes: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl
 * - Font weights: regular, medium, semibold, bold
 * - Line heights: tight, normal, relaxed
 * - Letter spacing: tighter, tight, normal, wide, wider
 * 
 * @section Spacing Tokens
 * - Base scale: spacing-0 through spacing-24
 * - Component spacing: padding, margin, gap
 * 
 * @section Layout Tokens
 * - Panel sizes: Editor, preview, terminal, chat
 * - Sidebar: Activity bar, content panel
 * - Status bar: Height
 * 
 * @section Border Radius Tokens
 * - Scale: radius-none through radius-full
 * 
 * @section Shadow Tokens
 * - Base: shadow-none through shadow-2xl
 * - Colored: shadow-primary, shadow-success, shadow-warning, shadow-error
 * 
 * @section Transition Tokens
 * - Durations: duration-fast, duration-normal, duration-slow
 * - Easing: ease-in-out, ease-out-in, ease-in-out, bounce
 * 
 * @section Z-Index Tokens
 * - Dropdown, modal, tooltip, toast
 */

// ============================================================================
// Color Token Types
// ============================================================================

export type PrimaryColorToken =
  | 'primary-50'
  | 'primary-100'
  | 'primary-200'
  | 'primary-300'
  | 'primary-400'
  | 'primary-500'
  | 'primary-600'
  | 'primary-700'
  | 'primary-800'
  | 'primary-900'
  | 'primary-950';

export type SecondaryColorToken =
  | 'secondary-50'
  | 'secondary-100'
  | 'secondary-200'
  | 'secondary-300'
  | 'secondary-400'
  | 'secondary-500'
  | 'secondary-600'
  | 'secondary-700'
  | 'secondary-800'
  | 'secondary-900'
  | 'secondary-950';

export type NeutralColorToken =
  | 'neutral-50'
  | 'neutral-100'
  | 'neutral-200'
  | 'neutral-300'
  | 'neutral-400'
  | 'neutral-500'
  | 'neutral-600'
  | 'neutral-700'
  | 'neutral-800'
  | 'neutral-900'
  | 'neutral-950';

export type SemanticColorToken =
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type RetroColorToken =
  | 'retro-red'
  | 'retro-orange'
  | 'retro-yellow'
  | 'retro-green'
  | 'retro-cyan'
  | 'retro-blue'
  | 'retro-magenta'
  | 'retro-pink'
  | 'retro-gray'
  | 'retro-light-gray'
  | 'retro-white'
  | 'retro-black'
  | 'retro-purple'
  | 'retro-brown'
  | 'retro-beige';

export type ColorToken =
  | PrimaryColorToken
  | SecondaryColorToken
  | NeutralColorToken
  | SemanticColorToken
  | RetroColorToken;

// ============================================================================
// Typography Token Types
// ============================================================================

export type FontFamilyToken =
  | 'font-sans'
  | 'font-mono'
  | 'font-pixel';

export type FontSizeToken =
  | 'text-xs'
  | 'text-sm'
  | 'text-base'
  | 'text-lg'
  | 'text-xl'
  | 'text-2xl'
  | 'text-3xl'
  | 'text-4xl'
  | 'text-5xl';

export type FontWeightToken =
  | 'font-normal'
  | 'font-medium'
  | 'font-semibold'
  | 'font-bold';

export type LineHeightToken =
  | 'leading-tight'
  | 'leading-normal'
  | 'leading-relaxed';

export type LetterSpacingToken =
  | 'tracking-tighter'
  | 'tracking-tight'
  | 'tracking-normal'
  | 'tracking-wide'
  | 'tracking-wider';

export type TypographyToken =
  | FontFamilyToken
  | FontSizeToken
  | FontWeightToken
  | LineHeightToken
  | LetterSpacingToken;

// ============================================================================
// Spacing Token Types
// ============================================================================

export type SpacingToken =
  | 'spacing-0'
  | 'spacing-1'
  | 'spacing-2'
  | 'spacing-3'
  | 'spacing-4'
  | 'spacing-5'
  | 'spacing-6'
  | 'spacing-7'
  | 'spacing-8'
  | 'spacing-9'
  | 'spacing-10'
  | 'spacing-11'
  | 'spacing-12'
  | 'spacing-13'
  | 'spacing-14'
  | 'spacing-15'
  | 'spacing-16'
  | 'spacing-17'
  | 'spacing-18'
  | 'spacing-19'
  | 'spacing-20'
  | 'spacing-21'
  | 'spacing-22'
  | 'spacing-23'
  | 'spacing-24';

// ============================================================================
// Layout Token Types
// ============================================================================

export type PanelSizeToken =
  | 'panel-editor'
  | 'panel-editor-monaco'
  | 'panel-preview'
  | 'panel-terminal'
  | 'panel-chat';

export type SidebarToken =
  | 'sidebar-activity-bar'
  | 'sidebar-content-panel';

export type StatusBarToken =
  | 'status-bar-height';

export type LayoutToken =
  | PanelSizeToken
  | SidebarToken
  | StatusBarToken;

// ============================================================================
// Border Radius Token Types
// ============================================================================

export type BorderRadiusToken =
  | 'radius-none'
  | 'radius-sm'
  | 'radius-base'
  | 'radius-md'
  | 'radius-lg'
  | 'radius-xl'
  | 'radius-2xl'
  | 'radius-full';

// ============================================================================
// Shadow Token Types
// ============================================================================

export type ShadowToken =
  | 'shadow-none'
  | 'shadow-sm'
  | 'shadow-md'
  | 'shadow-lg'
  | 'shadow-xl'
  | 'shadow-2xl'
  | 'shadow-pixel'
  | 'shadow-pixel-primary'
  | 'shadow-pixel-sm'
  | 'shadow-pixel-inset';

// ============================================================================
// Transition Token Types
// ============================================================================

export type DurationToken =
  | 'duration-fast'
  | 'duration-normal'
  | 'duration-slow';

export type EasingToken =
  | 'ease-in-out'
  | 'ease-out-in'
  | 'ease-in-out'
  | 'bounce';

export type TransitionToken =
  | DurationToken
  | EasingToken;

// ============================================================================
// Z-Index Token Types
// ============================================================================

export type ZIndexToken =
  | 'z-dropdown'
  | 'z-modal'
  | 'z-tooltip'
  | 'z-toast';

// ============================================================================
// Combined Token Type
// ============================================================================

export type DesignToken =
  | ColorToken
  | TypographyToken
  | SpacingToken
  | LayoutToken
  | BorderRadiusToken
  | ShadowToken
  | TransitionToken
  | ZIndexToken;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get CSS variable reference for a design token
 * 
 * @param token - Design token name
 * @returns CSS variable reference (e.g., 'var(--token-name)')
 * 
 * @example
 * ```ts
 * import { getToken } from '@/styles/design-tokens';
 * 
 * const spacing = getToken('spacing-4'); // 'var(--spacing-4)'
 * ```
 */
export function getToken(token: DesignToken): string {
  return `var(--${token})`;
}

/**
 * Get color token reference
 * 
 * @param token - Color token name
 * @returns CSS variable reference for color
 * 
 * @example
 * ```ts
 * import { getColor } from '@/styles/design-tokens';
 * 
 * const primaryColor = getColor('primary-500'); // 'var(--color-primary-500)'
 * ```
 */
export function getColor(token: ColorToken): string {
  return `var(--color-${token})`;
}

/**
 * Get spacing token reference
 * 
 * @param token - Spacing token name
 * @returns CSS variable reference for spacing
 * 
 * @example
 * ```ts
 * import { getSpacing } from '@/styles/design-tokens';
 * 
 * const gap = getSpacing('spacing-4'); // 'var(--spacing-4)'
 * ```
 */
export function getSpacing(token: SpacingToken): string {
  return `var(--${token})`;
}

/**
 * Get layout token reference
 * 
 * @param token - Layout token name
 * @returns CSS variable reference for layout value
 * 
 * @example
 * ```ts
 * import { getLayout } from '@/styles/design-tokens';
 * 
 * const panelSize = getLayout('panel-editor'); // 'var(--panel-editor)'
 * ```
 */
export function getLayout(token: LayoutToken): string {
  return `var(--${token})`;
}

/**
 * Get typography token reference
 * 
 * @param token - Typography token name
 * @returns CSS variable reference for typography
 * 
 * @example
 * ```ts
 * import { getTypography } from '@/styles/design-tokens';
 * 
 * const fontSize = getTypography('text-base'); // 'var(--text-base)'
 * ```
 */
export function getTypography(token: TypographyToken): string {
  return `var(--${token})`;
}

/**
 * Get border radius token reference
 * 
 * @param token - Border radius token name
 * @returns CSS variable reference for border radius
 * 
 * @example
 * ```ts
 * import { getBorderRadius } from '@/styles/design-tokens';
 * 
 * const radius = getBorderRadius('radius-md'); // 'var(--radius-md)'
 * ```
 */
export function getBorderRadius(token: BorderRadiusToken): string {
  return `var(--${token})`;
}

/**
 * Get shadow token reference
 * 
 * @param token - Shadow token name
 * @returns CSS variable reference for shadow
 * 
 * @example
 * ```ts
 * import { getShadow } from '@/styles/design-tokens';
 * 
 * const shadow = getShadow('shadow-md'); // 'var(--shadow-md)'
 * ```
 */
export function getShadow(token: ShadowToken): string {
  return `var(--${token})`;
}

/**
 * Get transition token reference
 * 
 * @param token - Transition token name
 * @returns CSS variable reference for transition
 * 
 * @example
 * ```ts
 * import { getTransition } from '@/styles/design-tokens';
 * 
 * const transition = getTransition('duration-fast'); // 'var(--duration-fast)'
 * ```
 */
export function getTransition(token: TransitionToken): string {
  return `var(--${token})`;
}

/**
 * Get z-index token reference
 * 
 * @param token - Z-index token name
 * @returns CSS variable reference for z-index
 * 
 * @example
 * ```ts
 * import { getZIndex } from '@/styles/design-tokens';
 * 
 * const zIndex = getZIndex('z-modal'); // 'var(--z-modal)'
 * ```
 */
export function getZIndex(token: ZIndexToken): string {
  return `var(--${token})`;
}
