# STORY-004: Create TypeScript Theme Types

**Story ID**: LT-1.4  
**Story Number**: 4  
**Priority**: P0  
**Estimated Hours**: 2  
**Status**: PENDING

## Summary
Create TypeScript type definitions for the theme system at `src/types/theme.ts`.

## Requirements

### Types to Define

```typescript
// Theme mode types
export type ThemeMode = 'light' | 'dark' | 'system';

// Resolved theme (after system preference check)
export type ResolvedTheme = 'light' | 'dark';

// Theme context value
export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  themes: ThemeMode[];
  systemTheme: ResolvedTheme | null;
}

// Theme configuration
export interface ThemeConfig {
  defaultTheme: ThemeMode;
  enableSystem: boolean;
  disableTransitionOnChange: boolean;
  storageKey: string;
}

// Color token types
export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
}

// Semantic colors
export interface SemanticColors extends ThemeColors {
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
}

// CSS custom property names
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
  // ... additional properties
}

// Color scale type
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

// Theme tokens interface
export interface ThemeTokens {
  colors: SemanticColors;
  colorScales: {
    primary: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    destructive: ColorScale;
    info: ColorScale;
    neutral: ColorScale;
  };
  radius: {
    default: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  shadows: {
    pixel: string;
    pixelPrimary: string;
    pixelSm: string;
  };
}
```

## Implementation

### File to Create
- `src/types/theme.ts`

### Export
```typescript
// Re-export next-themes types for convenience
export type { ThemeProviderProps } from "next-themes";

// Export our custom types
export type { ThemeMode, ResolvedTheme, ThemeContextValue, ThemeConfig, ThemeColors, SemanticColors, ThemeCSSProperties, ColorScale, ThemeTokens };
export type { ThemeContextValue as ThemeContextType };
```

## Dry-Check Requirements

### Before Implementation
- [ ] Verify no existing theme types in `src/types/`
- [ ] Check next-themes exports for compatible types
- [ ] Review existing ThemeProvider props

### After Implementation
- [ ] TypeScript syntax valid
- [ ] All types properly exported
- [ ] Compatible with existing ThemeProvider props
- [ ] No circular dependencies

## Acceptance Criteria
- [ ] `src/types/theme.ts` created
- [ ] ThemeMode, ResolvedTheme types defined
- [ ] ThemeContextValue interface defined
- [ ] All color token types defined
- [ ] ColorScale type for all semantic colors
- [ ] Types compatible with next-themes
- [ ] Story execution documented

## Integration Points
- **ThemeProvider**: Uses ThemeConfig and ThemeContextValue
- **useTheme hook**: Returns ThemeContextValue
- **ThemeToggle**: Uses ThemeMode type

## Resource Notes
- **Build Required**: After all Week 1 stories complete
- **Type Check**: Run tsc on `src/types/theme.ts` only
- **Background Tasks**: None
