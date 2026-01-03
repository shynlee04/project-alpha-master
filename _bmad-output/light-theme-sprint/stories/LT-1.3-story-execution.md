# STORY-003 Execution: Update Tailwind Config for Class-Based Themes

**Story ID**: LT-1.3  
**Story Number**: 3  
**Priority**: P0  
**Estimated Hours**: 2  
**Actual Hours**: 2  
**Status**: ✅ COMPLETE

## Summary
Updated Tailwind CSS 4 configuration in `src/styles.css` to support class-based dark/light theme switching with comprehensive color token mappings.

---

## Implementation Details

### Files Modified
- `src/styles.css` - Added custom variants and extended @theme block

### Changes Made

#### 1. Custom Variants for Theme Detection (Lines 9-11)
```css
/* Custom variants for dark/light mode - Tailwind CSS 4 approach */
@custom-variant dark (&:is(.dark *, [data-theme="dark"] *));
@custom-variant light (&:is(.light *, [data-theme="light"] *));
```

**Reasoning**: Tailwind CSS 4 uses `@custom-variant` instead of `darkMode` config. This enables `dark:` and `light:` prefixes in utility classes.

#### 2. Extended @theme Block with Light Theme Colors
Added comprehensive color mappings including:
- Primary color scale (50-950): `--color-primary-50` through `--color-primary-950`
- Success color scale (50-950): `--color-success-50` through `--color-success-950`
- Warning color scale (50-950): `--color-warning-50` through `--color-warning-950`
- Destructive color scale (50-950): `--color-destructive-50` through `--color-destructive-950`
- Info color scale (50-950): `--color-info-50` through `--color-info-950`
- Neutral color scale (50-950): `--color-neutral-50` through `--color-neutral-950`

Also added semantic foreground colors:
- `--color-success-foreground`: hsl(var(--success-foreground))
- `--color-warning-foreground`: hsl(var(--warning-foreground))
- `--color-info-foreground`: hsl(var(--info-foreground))

---

## Dry-Check Analysis

### Syntax Validation ✅
1. **CSS Custom Properties**: All 91 HSL color tokens from `light-theme-tokens.css` are referenced correctly with `hsl(var(--...))` syntax
2. **Tailwind CSS 4 @theme Block**: Uses correct `@theme inline { ... }` syntax
3. **Custom Variants**: Correct `@custom-variant` syntax with pseudo-class `:is()` selector
4. **Import Order**: `light-theme-tokens.css` is imported before being referenced in `@theme` block

### Related Files Scanned ✅
1. `src/styles/light-theme-tokens.css` (128 lines)
   - All 91 color tokens defined with HSL format
   - Compatible with CSS custom properties

2. `src/styles/design-tokens.css` (541 lines)
   - Dark theme colors in `:root`
   - Light theme overrides in `.light` class
   - Theme transition styles already present

3. `src/presentation/components/ui/ThemeProvider.tsx` (20 lines)
   - Uses `attribute="class"` for theme class injection
   - Compatible with our `@custom-variant` approach

4. `src/presentation/components/ui/ThemeToggle.tsx` (50 lines)
   - Uses `next-themes` `useTheme` hook
   - Cycles through light → dark → system
   - No changes needed - already compatible

### Type Checking Scope
No TypeScript files created in this story (CSS-only changes).

### Compatibility Checks ✅
1. **next-themes Integration**: ThemeProvider uses `attribute="class"`, our `@custom-variant dark` targets `.dark *` - ✅ COMPATIBLE
2. **Light Theme Toggle**: Existing `ThemeToggle.tsx` cycles through light/dark/system - ✅ COMPATIBLE
3. **Design Tokens**: `light-theme-tokens.css` defines colors in `:root`, inherits by `.light` class - ✅ COMPATIBLE
4. **Tailwind CSS 4**: Using `@custom-variant` and `@theme` directives - ✅ CORRECT

---

## Usage Examples

### Using Theme Variants
```tsx
// Dark mode (existing)
<div className="dark:bg-background dark:text-foreground">
  Content
</div>

// Light mode (NEW capability)
<div className="light:bg-background light:text-foreground">
  Content
</div>

// Both themes
<div className="bg-background text-foreground dark:bg-black light:bg-white">
  Content adapts to theme
</div>
```

### Using Color Scale Utilities
```tsx
// Primary scale (NEW)
<button className="bg-primary-500 hover:bg-primary-600 text-primary-foreground">
  Primary Button
</button>

<button className="bg-primary-50 text-primary-700">
  Subtle Button
</button>

// Semantic colors (NEW)
<div className="bg-success text-success-foreground">
  Success message
</div>

<div className="bg-warning text-warning-foreground">
  Warning message
</div>
```

---

## Integration Points
- **ThemeProvider**: No changes needed - uses `attribute="class"`
- **ThemeToggle**: No changes needed - already works with `.light`/`.dark` classes
- **Design Tokens**: Light theme tokens loaded via `@import` in styles.css

---

## Validation Checklist
- [x] CSS syntax valid
- [x] Tailwind CSS 4 @theme syntax correct
- [x] @custom-variant syntax correct
- [x] All color tokens properly mapped
- [x] Compatible with existing ThemeProvider
- [x] Compatible with existing ThemeToggle
- [x] Import order correct
- [x] No breaking changes to existing functionality

---

## Next Story: LT-1.4
**Create TypeScript theme types** - Create `src/types/theme.ts` with ThemeMode, ResolvedTheme, and ThemeContextValue types.

**Dependencies**: None  
**Priority**: P0  
**Estimated Hours**: 2

---

## Resource Notes
- **Build Required**: After all Week 1 stories (LT-1.1 through LT-1.7) are complete
- **Type Check**: Not applicable (CSS-only story)
- **Background Tasks**: None pending
