/**
 * Light Theme TypeScript Type Definitions
 * =========================================
 * Comprehensive type definitions for the VIA-GENT light theme design system.
 * 
 * These types provide type safety for:
 * - Theme mode selection (light/dark/system)
 * - Theme context values
 * - Color token definitions
 * - Component theme interfaces
 * 
 * Usage:
 * ```typescript
 * import { ThemeMode, ThemeContextValue, useTheme } from '@/types/theme';
 * ```
 */

// =============================================================================
// Theme Mode Types
// =============================================================================

/**
 * Available theme modes
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Resolved theme after system preference check
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * Array of all available theme modes
 */
export const THEMES: ThemeMode[] = ['light', 'dark', 'system'] as const;

// =============================================================================
// Theme Context Types
// =============================================================================

/**
 * Theme context value provided by ThemeProvider
 */
export interface ThemeContextValue {
  /** Current theme mode (light, dark, or system) */
  theme: ThemeMode;
  
  /** Resolved theme after system preference check */
  resolvedTheme: ResolvedTheme;
  
  /** Set the theme mode */
  setTheme: (theme: ThemeMode) => void;
  
  /** Toggle between light and dark themes */
  toggleTheme: () => void;
  
  /** List of available theme modes */
  themes: ThemeMode[];
  
  /** System theme preference (if system mode is active) */
  systemTheme: ResolvedTheme | null;
}

/**
 * Theme configuration options
 */
export interface ThemeConfig {
  /** Default theme on first load */
  defaultTheme: ThemeMode;
  
  /** Whether to respect system preference */
  enableSystem: boolean;
  
  /** Whether to disable transitions on theme change */
  disableTransitionOnChange: boolean;
  
  /** LocalStorage key for persisting theme preference */
  storageKey: string;
}

// =============================================================================
// Color Token Types
// =============================================================================

/**
 * Base theme colors used across components
 */
export interface ThemeColors {
  /** Main background color */
  background: string;
  
  /** Primary text color */
  foreground: string;
  
  /** Primary brand color */
  primary: string;
  
  /** Text on primary color */
  primaryForeground: string;
  
  /** Secondary background */
  secondary: string;
  
  /** Text on secondary */
  secondaryForeground: string;
  
  /** Muted background */
  muted: string;
  
  /** Text on muted background */
  mutedForeground: string;
  
  /** Accent background */
  accent: string;
  
  /** Text on accent */
  accentForeground: string;
  
  /** Error/destructive color */
  destructive: string;
  
  /** Text on destructive */
  destructiveForeground: string;
  
  /** Border color */
  border: string;
  
  /** Input border color */
  input: string;
  
  /** Focus ring color */
  ring: string;
  
  /** Sidebar background */
  sidebar: string;
  
  /** Sidebar text color */
  sidebarForeground: string;
  
  /** Sidebar primary color */
  sidebarPrimary: string;
  
  /** Text on sidebar primary */
  sidebarPrimaryForeground: string;
  
  /** Sidebar accent background */
  sidebarAccent: string;
  
  /** Text on sidebar accent */
  sidebarAccentForeground: string;
  
  /** Sidebar border color */
  sidebarBorder: string;
}

/**
 * Semantic colors extending base theme colors
 */
export interface SemanticColors extends ThemeColors {
  /** Success/positive state color */
  success: string;
  
  /** Text on success */
  successForeground: string;
  
  /** Warning/caution state color */
  warning: string;
  
  /** Text on warning */
  warningForeground: string;
  
  /** Info/informational state color */
  info: string;
  
  /** Text on info */
  infoForeground: string;
}

/**
 * Color scale with 50-950 values (standard design system scale)
 */
export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

/**
 * Color scales for all semantic color families
 */
export interface ColorScales {
  primary: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  destructive: ColorScale;
  info: ColorScale;
  neutral: ColorScale;
}

// =============================================================================
// CSS Custom Property Types
// =============================================================================

/**
 * CSS custom property names for theme colors
 * Used for TypeScript-safe access to CSS variables
 */
export interface ThemeCSSProperties {
  '--background': string;
  '--foreground': string;
  '--primary': string;
  '--primary-foreground': string;
  '--secondary': string;
  '--secondary-foreground': string;
  '--muted': string;
  '--muted-foreground': string;
  '--accent': string;
  '--accent-foreground': string;
  '--destructive': string;
  '--destructive-foreground': string;
  '--border': string;
  '--input': string;
  '--ring': string;
  '--sidebar': string;
  '--sidebar-foreground': string;
  '--sidebar-primary': string;
  '--sidebar-primary-foreground': string;
  '--sidebar-accent': string;
  '--sidebar-accent-foreground': string;
  '--sidebar-border': string;
  '--success': string;
  '--success-foreground': string;
  '--warning': string;
  '--warning-foreground': string;
  '--info': string;
  '--info-foreground': string;
}

// =============================================================================
// Radius & Shadow Types
// =============================================================================

/**
 * Border radius tokens
 */
export interface RadiusTokens {
  default: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

/**
 * Shadow tokens (8-bit pixel aesthetic)
 */
export interface ShadowTokens {
  /** Standard pixel shadow */
  pixel: string;
  
  /** Primary color pixel shadow */
  pixelPrimary: string;
  
  /** Small pixel shadow */
  pixelSm: string;
}

// =============================================================================
// Theme Tokens Interface
// =============================================================================

/**
 * Complete theme tokens interface
 */
export interface ThemeTokens {
  /** All color tokens */
  colors: SemanticColors;
  
  /** Color scales (50-950) for all semantic colors */
  colorScales: ColorScales;
  
  /** Border radius tokens */
  radius: RadiusTokens;
  
  /** Shadow tokens */
  shadows: ShadowTokens;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Extract theme mode from a string
 */
export type ExtractThemeMode<T extends string> = 
  T extends 'light' ? 'light' :
  T extends 'dark' ? 'dark' :
  T extends 'system' ? 'system' : never;

/**
 * Theme mode preference with localStorage
 */
export interface ThemePreference {
  /** The saved theme mode */
  value: ThemeMode;
  
  /** Timestamp of last change */
  updatedAt: number;
}

/**
 * System theme detection result
 */
export interface SystemThemeResult {
  /** Detected system theme */
  theme: ResolvedTheme;
  
  /** Whether the match was successful */
  matches: boolean;
}

// =============================================================================
// Component Theme Types
// =============================================================================

/**
 * Button component theme props
 */
export interface ButtonThemeProps {
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Input component theme props
 */
export interface InputThemeProps {
  error: boolean;
  disabled: boolean;
}

/**
 * Card component theme props
 */
export interface CardThemeProps {
  variant: 'default' | 'muted';
}

// =============================================================================
// Export Types for Convenience
// =============================================================================

/**
 * Re-export next-themes types for convenience
 * These are used by the ThemeProvider component
 */
export type { ThemeProviderProps } from "next-themes";

// Re-export for convenience
export type ThemeContextType = ThemeContextValue;
export type ThemeColorsType = ThemeColors;
export type SemanticColorsType = SemanticColors;
export type ColorScaleType = ColorScale;
export type ThemeTokensType = ThemeTokens;
