# Light Theme Implementation Sprint Plan

**Sprint ID**: LT-2026-01-03
**Date**: 2026-01-03
**Project**: Via-gent Light Theme Design System
**Status**: READY FOR EXECUTION
**Duration**: 4 weeks (23 stories, 88-90 hours estimated)

---

## Executive Summary

This sprint delivers a complete light theming design system for Via-gent, enabling seamless light/dark theme toggle functionality with WCAG 2.1 AA accessibility compliance, 60fps performance, and zero breaking changes to the existing dark theme.

**Scope**:
- 36 component families fully specified with light theme variants
- 23 developer stories across 4 phases
- Zero breaking changes to existing dark theme
- WooCommerce-level quality standards

**Constraints**:
- ✅ **No interference** with Ralph Loop platform unification work
- ✅ **Resource isolation** - Separate branch, no file conflicts
- ✅ **Follow story-dev-cycle** workflow for all stories

---

## Sprint Backlog

### Phase 1: Foundation Setup (7 stories, 24 hours)
**Goal**: Establish theme infrastructure

| Story ID | Description | Estimate | Dependencies |
|----------|-------------|----------|--------------|
| LT-1.1 | Create light theme token file (light-theme-tokens.css) | 4h | None |
| LT-1.2 | Update design-tokens.css with transition styles | 2h | LT-1.1 |
| LT-1.3 | Update Tailwind config for class-based themes | 2h | LT-1.1 |
| LT-1.4 | Create TypeScript theme types (theme.ts) | 2h | None |
| LT-1.5 | Implement useTheme hook | 6h | LT-1.4 |
| LT-1.6 | Create ThemeProvider component | 4h | LT-1.5 |
| LT-1.7 | Create ThemeToggle component | 4h | LT-1.6 |

**Total**: 24 hours (3 days)

**Acceptance Criteria**:
- All CSS tokens defined with correct color values (78 colors)
- Theme hook provides correct theme state (light/dark/system)
- Theme persists to localStorage
- System preference detection working
- Theme toggle button functional with smooth icon transitions
- Zero TypeScript errors

---

### Phase 2: P0 Component Migration (6 stories, 23 hours)
**Goal**: Migrate critical form controls

| Story ID | Description | Estimate | Dependencies |
|----------|-------------|----------|--------------|
| LT-2.8 | Migrate Button component (all variants/states) | 4h | Phase 1 complete |
| LT-2.9 | Migrate Input component (all states) | 3h | Phase 1 complete |
| LT-2.10 | Migrate Select component (dropdown styling) | 4h | Phase 1 complete |
| LT-2.11 | Migrate Checkbox/Radio components | 3h | Phase 1 complete |
| LT-2.12 | Migrate Toggle/Switch component | 3h | Phase 1 complete |
| LT-2.13 | Test all P0 components in both themes | 6h | LT-2.8-2.12 |

**Total**: 23 hours (3 days)

**Acceptance Criteria**:
- All P0 components use CSS custom properties (no hardcoded colors)
- All interactive states have light theme variants
- Zero breaking changes to dark theme
- Contrast ratios validated (≥4.5:1 minimum)
- Theme switching smooth (no FOUC)

---

### Phase 3: P1 Component Migration (5 stories, 15 hours)
**Goal**: Migrate feedback and navigation components

| Story ID | Description | Estimate | Dependencies |
|----------|-------------|----------|--------------|
| LT-3.14 | Migrate Badge component (all variants) | 2h | Phase 2 complete |
| LT-3.15 | Migrate Card component (all variants) | 3h | Phase 2 complete |
| LT-3.16 | Migrate Dialog component (all sizes) | 4h | Phase 2 complete |
| LT-3.17 | Migrate Toast component (all variants) | 3h | Phase 2 complete |
| LT-3.18 | Migrate Tabs component (indicator transition) | 3h | Phase 2 complete |

**Total**: 15 hours (2 days)

**Acceptance Criteria**:
- All P1 components migrated
- Theme switching smooth (no FOUC)
- Reduced motion respected
- Dialog animations working
- Toast notifications visible in both themes

---

### Phase 4: Workspace Components (5 stories, 26 hours)
**Goal**: Update all 4 workspaces for light theme

| Story ID | Description | Estimate | Dependencies |
|----------|-------------|----------|--------------|
| LT-4.19 | Update IDE workspace (editor, terminal, file tree) | 8h | Phase 3 complete |
| LT-4.20 | Update Knowledge workspace (cards, canvas) | 4h | Phase 3 complete |
| LT-4.21 | Update Study workspace (flashcards) | 3h | Phase 3 complete |
| LT-4.22 | Update Notes workspace (editor, viewer) | 3h | Phase 3 complete |
| LT-4.23 | Integration testing across all workspaces | 8h | LT-4.19-4.22 |

**Total**: 26 hours (3-4 days)

**Acceptance Criteria**:
- All workspace components support light theme
- No layout breaks during theme switch
- Monaco Editor theme switching working
- Terminal theme switching working
- Cross-workspace navigation works in light theme

---

**Total Sprint Estimate**: 88-90 hours (2.5-3 weeks of focused development, or 4 weeks with QA and buffer)

---

## Agent Coordination Plan

### Workflow: story-dev-cycle

Based on `.agent/workflows/story-dev-cycle.md`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SM Agent (@/sm)                          Dev Agent (@/dev)                    │
│  ─────────────────                        ──────────────────                   │
│  create-story ──► validate ──► create-context ──► validate                  │
│                                         │                                   │
│                                         ▼                                   │
│                                    dev-story ──► code-review ──► done       │
│                                         │              │                    │
│                                         └──── loop ────┘                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase Assignment

| Phase | Primary Agent | Secondary Agent | Coordination Pattern |
|-------|---------------|-----------------|----------------------|
| Phase 1 | SM (create stories) | Dev (implement) | Create story → Validate → Create context → Dev implement → Code review |
| Phase 2 | SM (story management) | Dev (implement) | Dev works through stories in order, SM validates each |
| Phase 3 | SM (story management) | Dev (implement) | Dev continues, SM monitors progress |
| Phase 4 | SM (integration) | Dev (implement) | Dev implements, SM coordinates workspace testing |

---

## Story-by-Story Execution Plan

### Phase 1: Foundation Setup

#### LT-1.1: Create Light Theme Token File

**User Story**: As a developer, I want a single CSS file containing all light theme color tokens, so that components can reference theme-aware colors.

**Acceptance Criteria**:
1. **AC-1**: File created at `src/styles/light-theme-tokens.css`
2. **AC-2**: All 78 color values defined (11 primary + 11×4 semantic + 11 neutral + 12 surface)
3. **AC-3**: Colors in HSL format for CSS custom properties
4. **AC-4**: `.light` class inherits from `:root` values
5. **AC-5**: All values match foundation document specs

**Tasks**:
- [ ] T1: Create `src/styles/light-theme-tokens.css` file
- [ ] T2: Add primary color tokens (primary-50 to primary-950)
- [ ] T3: Add semantic color tokens (success, warning, destructive, info)
- [ ] T4: Add neutral color tokens (neutral-50 to neutral-950)
- [ ] T5: Add surface color tokens (background, card, popover, secondary, etc.)
- [ ] T6: Add `.light` class definition
- [ ] T7: Import in `src/index.css` or `src/app/globals.css`

**Research Requirements**:
- Context7: CSS custom properties best practices
- DeepWiki: Tailwind CSS color configuration patterns

**Dev Notes**:
- Reference: `light-theme-design-system-foundation-2026-01-03.md` (Section 1)
- HSL format: `--primary: 24.6 95% 53.1%` (H S L%)
- DO NOT import this file directly via JavaScript - let CSS handle it

---

#### LT-1.2: Update Design Tokens with Transition Styles

**User Story**: As a user, I want smooth color transitions when switching themes, so the theme switch feels polished and professional.

**Acceptance Criteria**:
1. **AC-1**: Transition styles added to `src/styles/design-tokens.css`
2. **AC-2**: All elements transition background-color, color, border-color
3. **AC-3**: Base duration 200ms with ease-in-out timing
4. **AC-4**: Reduced motion support with `@media (prefers-reduced-motion: reduce)`
5. **AC-5**: `:root`, `html`, `body` excluded from transitions (prevent FOUC)

**Tasks**:
- [ ] T1: Add theme transitions section to `design-tokens.css`
- [ ] T2: Add universal transition properties for `*, *::before, *::after`
- [ ] T3: Add exclusions for `:root`, `html`, `body`
- [ ] T4: Add reduced motion media query
- [ ] T5: Validate no FOUC on theme switch

**Research Requirements**:
- Context7: CSS transition performance best practices
- Tavily: GPU-accelerated CSS transitions

**Dev Notes**:
- Reference: `light-theme-transition-design-2026-01-03.md` (Section 1.2)
- Use cubic-bezier timing functions for smoother feel
- Test with Chrome DevTools Performance profiler

---

#### LT-1.3: Update Tailwind Config

**User Story**: As a developer, I want Tailwind CSS to support class-based theme toggling, so I can use `dark:` and `light:` modifiers.

**Acceptance Criteria**:
1. **AC-1**: `tailwind.config.ts` updated with `darkMode: ['class', '[data-theme="dark"]']`
2. **AC-2**: All light theme colors mapped to Tailwind config
3. **AC-3**: No breaking changes to existing dark theme utilities
4. **AC-4**: Build passes without errors

**Tasks**:
- [ ] T1: Update `darkMode` config in `tailwind.config.ts`
- [ ] T2: Map light theme colors to `theme.extend.colors`
- [ ] T3: Verify `bg-background`, `text-foreground` work in both themes
- [ ] T4: Run `pnpm build` to verify no errors

**Research Requirements**:
- Context7: Tailwind CSS dark mode configuration docs
- DeepWiki: TanStack Router + Tailwind integration patterns

**Dev Notes**:
- Reference: `light-theme-developer-handoff-part1-2026-01-03.md` (Section 3.2)
- Use HSL format: `hsl(var(--background))`
- DO NOT change existing dark theme color values

---

#### LT-1.4: Create TypeScript Theme Types

**User Story**: As a developer, I want TypeScript types for theme management, so I get autocomplete and type safety.

**Acceptance Criteria**:
1. **AC-1**: File created at `src/types/theme.ts`
2. **AC-2**: `ThemeMode` type defined ('light' | 'dark' | 'system')
3. **AC-3**: `ResolvedTheme` type defined ('light' | 'dark')
4. **AC-4**: `ThemeContextValue` interface defined
5. **AC-5**: `ThemeStorage` interface defined
6. **AC-6**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Create `src/types/theme.ts` file
- [ ] T2: Define `ThemeMode` type
- [ ] T3: Define `ResolvedTheme` type
- [ ] T4: Define `ThemeContextValue` interface
- [ ] T5: Define `ThemeStorage` interface
- [ ] T6: Export all types
- [ ] T7: Run `pnpm tsc --noEmit` to verify no errors

**Research Requirements**:
- Context7: TypeScript interface best practices
- None needed - straightforward type definitions

**Dev Notes**:
- Reference: `light-theme-developer-handoff-part1-2026-01-03.md` (Section 3.1)
- Use union types for theme modes
- Add JSDoc comments for documentation

---

#### LT-1.5: Implement useTheme Hook

**User Story**: As a React developer, I want a custom hook to manage theme state, so components can access and change the theme.

**Acceptance Criteria**:
1. **AC-1**: File created at `src/lib/hooks/use-theme.ts`
2. **AC-2**: Hook returns `{ theme, setTheme, resolvedTheme, toggleTheme }`
3. **AC-3**: Theme persists to localStorage with key 'via-gent-theme'
4. **AC-4**: System preference detection working when theme='system'
5. **AC-5**: Theme class (`light`/`dark`) applied to `document.documentElement`
6. **AC-6`: Zero TypeScript errors

**Tasks**:
- [ ] T1: Create `src/lib/hooks/use-theme.ts` file
- [ ] T2: Implement `getSystemTheme()` helper
- [ ] T3: Implement `getStoredTheme()` helper
- [ ] T4: Implement `saveTheme()` helper with error handling
- [ ] T5: Implement `useTheme()` hook with useState + useEffect
- [ ] T6: Add system preference change listener
- [ ] T7: Create `toggleTheme()` helper
- [ ] T8: Test theme switching manually
- [ ] T9: Test persistence (refresh page)
- [ ] T10: Test system preference detection
- [ ] T11: Run `pnpm tsc --noEmit`

**Research Requirements**:
- Context7: React hooks best practices
- DeepWiki: localStorage error handling patterns

**Dev Notes**:
- Reference: `light-theme-developer-handoff-part1-2026-01-03.md` (Section 4.1)
- Use `useEffect` with dependency array `[theme]`
- Handle SSR: Check `typeof window !== 'undefined'`
- Use `matchMedia` for system preference detection

---

#### LT-1.6: Create ThemeProvider Component

**User Story**: As a React app, I want a provider component to supply theme context to all children, so any component can access theme state.

**Acceptance Criteria**:
1. **AC-1**: File created at `src/app/providers/theme-provider.tsx`
2. **AC-2**: Component wraps children with `ThemeContext.Provider`
3. **AC-3**: Exports `useThemeContext()` hook
4. **AC-4**: Hook throws error if used outside provider
5. **AC-5**: All types imported from `@/types/theme`
6. **AC-6**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Create `src/app/providers/theme-provider.tsx` file
- [ ] T2: Create `ThemeContext` with `createContext`
- [ ] T3: Implement `ThemeProvider` component
- [ ] T4: Implement `useThemeContext()` hook with error check
- [ ] T5: Export both components
- [ ] T6: Run `pnpm tsc --noEmit`
- [ ] T7: Test hook throws error outside provider

**Research Requirements**:
- Context7: React Context API docs
- None needed - straightforward React pattern

**Dev Notes**:
- Reference: `light-theme-developer-handoff-part1-2026-01-03.md` (Section 4.2)
- Use generic type for context value
- Check for undefined context in hook

---

#### LT-1.7: Create ThemeToggle Component

**User Story**: As a user, I want a button to toggle between light, dark, and system themes, so I can choose my preferred theme.

**Acceptance Criteria**:
1. **AC-1**: File created at `src/components/ui/theme-toggle.tsx`
2. **AC-2**: Two variants: 'button' and 'icon-only'
3. **AC-3**: Icon shows sun/moon/monitor based on theme
4. **AC-4**: Click cycles: light → dark → system → light...
5. **AC-5**: Icon transitions smoothly when theme switches
6. **AC-6**: Accessible with `aria-label`
7. **AC-7**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Create `src/components/ui/theme-toggle.tsx` file
- [ ] T2: Import icons: Sun, Moon, Monitor from lucide-react
- [ ] T3: Implement `getIcon()` helper
- [ ] T4: Implement `getNextTheme()` helper (cycle logic)
- [ ] T5: Implement component with variants
- [ ] T6: Add icon transitions (pot: 200ms ease-in-out)
- [ ] T7: Add accessibility attributes
- [ ] T8: Export component
- [ ] T9: Test all themes cycle correctly
- [ ] T10: Test icon transitions
- [ ] T11: Test keyboard navigation
- [ ] T12: Run `pnpm tsc --noEmit`

**Research Requirements**:
- Context7: Lucide React icon library docs
- None needed - straightforward component

**Dev Notes**:
- Reference: `light-theme-developer-handoff-part1-2026-01-03.md` (Section 4.3)
- Use `transition-colors duration-200` for icon changes
- Use `aria-label` for accessibility
- Monitor icon should show current resolved theme

---

### Phase 2: P0 Component Migration

#### LT-2.8: Migrate Button Component

**User Story**: As a developer, I want the Button component to use CSS custom properties for all colors, so it automatically supports light and dark themes.

**Acceptance Criteria**:
1. **AC-1**: `src/components/ui/button.tsx` updated
2. **AC-2**: All variants (primary, secondary, ghost, outline) use CSS vars
3. **AC-3**: All states (default, hover, active, disabled, loading) use CSS vars
4. **AC-4**: Contrast ratio ≥4.5:1 in both themes
5. **AC-5**: Zero breaking changes to existing usage
6. **AC-6**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Read existing `button.tsx` implementation
- [ ] T2: Identify hardcoded colors (grep for hex codes)
- [ ] T3: Replace hardcoded colors with CSS vars (bg-primary, text-primary-foreground, etc.)
- [ ] T4: Update hover states (hover:bg-primary-600)
- [ ] T5: Update outline variant (border-primary, text-primary, hover:bg-primary-50)
- [ ] T6: Test all variants in light theme
- [ ] T7: Test all variants in dark theme
- [ ] T8: Validate contrast ratios manually or with WebAIM tool
- [ ] T9: Run `pnpm tsc --noEmit`
- [ ] T10: Test button functionality still works

**Research Requirements**:
- Context7: Tailwind CSS variant class patterns
- Tavily: WCAG color contrast tools

**Dev Notes**:
- Reference: `light-theme-component-specifications-part1-2026-01-03.md` (Section 1 - Button)
- Primary colors already match in both themes (#f97316)
- Foreground colors differ (#ffffff vs #0f0f11)
- Use `bg-primary` NOT `bg-[#f97316]`

---

#### LT-2.9: Migrate Input Component

**User Story**: As a developer, I want the Input component to support light theme styling with proper focus indicators, so form inputs look good in both themes.

**Acceptance Criteria**:
1. **AC-1**: `src/components/ui/input.tsx` updated
2. **AC-2**: All states (default, hover, focus, disabled, error) use CSS vars
3. **AC-3**: Focus ring color uses `--ring` (primary color)
4. **AC-4**:.border-accent focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"
- [ ] T6: Update focus ring color: `focus-visible:ring-ring`
- [ ] T7: Test input in light theme
- [ ] T8: Test input in dark theme
- [ ] T9: Test focus indicator visibility
- [ ] T10: Run `pnpm tsc --noEmit`
- [ ] T11: Test input functionality still works

**Research Requirements**:
- Context7: Tailwind CSS ring utilities docs
- None needed - straightforward pattern

**Dev Notes**:
- Reference: `light-theme-component-specifications-part1-2026-01-03.md` (Section 2 - Input)
- Focus ring should be primary orange (#f97316) in both themes
- Use `ring-offset-2` to prevent overlap

---

#### LT-2.10: Migrate Select Component

**User Story**: As a developer, I want the Select component to support light theme dropdown styling, so select inputs look good in both themes.

**Acceptance Criteria**:
1. **AC-1**: `src/components/ui/select.tsx` updated
2. **AC-2**: Trigger dropdown uses CSS vars for background/border
3. **AC-3**: Dropdown content uses `--popover` background
4. **AC-4**: All items (hover, focused, selected) use CSS vars
5. **AC-5**: Chevron icon color uses `--neutral-400`
6. **AC-6**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Read existing `select.tsx` implementation
- [ ] T2: Identify hardcoded colors
- [ ] T3: Update trigger: `bg-background border-input`
- [ ] T4: Update content: `bg-popover border-border`
- [ ] T5: Update items: `hover:bg-accent focus:bg-primary-50 focus:text-primary`
- [ ] T6: Update chevron color: `text-neutral-400`
- [ ] T7: Test select in light theme
- [ ] T8: Test select in dark theme
- [ ] T9: Test dropdown open/close
- [ ] T10: Run `pnpm tsc --noEmit`

**Research Requirements**:
- Context7: Radix UI Select component docs
- DeepWiki: TanStack Router + Radix integration patterns

**Dev Notes**:
- Reference: `light-theme-component-specifications-part1-2026-01-03.md` (Section 3 - Select)
- Use Radix UI Portal for dropdown positioning
- Ensure chevron icon rotates on open if applicable

---

#### LT-2.11: Migrate Checkbox/Radio Components

**User Story**: As a developer, I want Checkbox and Radio components to support light theme styling, so form controls look good in both themes.

**Acceptance Criteria**:
1. **AC-1**: `src/components/ui/checkbox.tsx` updated
2. **AC-2**: `src/components/ui/radio.tsx` updated
3. **AC-3**: All states (default, hover, focus, checked, disabled) use CSS vars
4. **AC-4**: Check icon visible in light theme (contrast validated)
5. **AC-5**: Radio indicators visible in light theme
6. **AC-6**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Read existing `checkbox.tsx` implementation
- [ ] T2: Read existing `radio.tsx` implementation
- [ ] T3: Update checkbox background: `border-input bg-background`
- [ ] T4: Update checkbox checked: `bg-primary text-primary-foreground`
- [ ] T5: Update checkbox hover: `border-primary`
- [ ] T6: Update radio indicator: `bg-primary`
- [ ] T7: Test checkbox in both themes
- [ ] T8: Test radio in both themes
- [ ] T9: Validate check icon visibility
- [ ] T10: Run `pnpm tsc --noEmit`

**Research Requirements**:
- Context7: Radix UI Checkbox/Radio docs
- None needed - straightforward pattern

**Dev Notes**:
- Reference: `light-theme-component-specifications-part1-2026-01-03.md` (Section 4-5 - Checkbox/Radio)
- Use Lucide Check icon (13-14px) for checkbox
- Use `radix` pattern for focus states

---

#### LT-2.12: Migrate Toggle/Switch Component

**User Story**: As a developer, I want the Toggle/Switch component to support light theme styling with smooth thumb transitions, so it looks good in both themes.

**Acceptance Criteria**:
1. **AC-1**: `src/components/ui/switch.tsx` updated
2. **AC-2**: Track background uses CSS vars (neutral-200 vs neutral-800)
3. **AC-3**: Thumb uses CSS vars (background + border)
4. **AC-4**: Checked state: track = primary color
5. **AC-5**: Thumb transitions smoothly (100ms ease-in-out)
6. **AC-6**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Read existing `switch.tsx` implementation
- [ ] T2: Identify hardcoded colors
- [ ] T3: Update track: `bg-neutral-200 dark:bg-neutral-800`
- [ ] T4: Update track (checked): `bg-primary`
- [ ] T5: Update thumb: `bg-background border-input`
- [ ] T6: Add thumb transition: `transition-all duration-100 ease-in-out`
- [ ] T7: Test toggle in light theme
- [ ] T8: Test toggle in dark theme
- [ ] T9: Test thumb animation smoothness
- [ ] T10: Run `pnpm tsc --noEmit`

**Research Requirements**:
- Context7: Radix UI Switch docs
- None needed - straightforward pattern

**Dev Notes**:
- Reference: `light-theme-component-specifications-part1-2026-01-03.md` (Section 6 - Toggle)
- Use `translate-x` for thumb movement
- Thumb should have white border for visibility

---

#### LT-2.13: Test P0 Components

**User Story**: As a QA engineer, I want comprehensive testing of all P0 components in both themes, so I can verify they work correctly.

**Acceptance Criteria**:
1. **AC-1**: All 6 P0 components tested (Button, Input, Select, Checkbox, Radio, Toggle)
2. **AC-2**: All states tested (default, hover, focus, active, disabled)
3. **AC-3**: Both themes tested (light and dark)
4. **AC-4**: Contrast ratios validated for critical combinations
5. **AC-5**: Zero visual bugs or layout breaks
6. **AC-6**: Test report created

**Tasks**:
- [ ] T1: Use Chrome DevTools to test theme switching
- [ ] T2: Test all Button variants/states
- [ ] T3: Test Input states (focus, error, disabled)
- [ ] T4: Test Select dropdown/appearance
- [ ] T5: Test Checkbox checked/unchecked/indeterminate
- [ ] T6: Test Radio selected/unselected
- [ ] T7: Test Toggle on/off/off-hover
- [ ] T8: Validate contrast ratios with WebAIM tool
- [ ] T9: Test keyboard navigation (Tab, Enter, Space)
- [ ] T10: Test reduced motion (OS setting)
- [ ] T11: Create test report document

**Research Requirements**:
- None focused - manual testing phase

**Test Report Template**:
```markdown
# P0 Components Light Theme Test Report

**Date**: 2026-01-03
**Tester**: [Name]
**Browser**: Chrome/Firefox/Safari

## Test Results

| Component | States Tested | Light Theme | Dark Theme | Contrast OK | Notes |
|-----------|---------------|-------------|------------|-------------|-------|
| Button | ✓ | ✓ | ✓ | ✓ | All good |
| Input | ✓ | ✓ | ✓ | ✓ | All good |
...

## Issues Found
- None

## Sign-off
✅ APPROVED for Phase 3
```

---

### Phase 3: P1 Component Migration

#### LT-3.14: Migrate Badge Component

**User Story**: As a developer, I want the Badge component to support light theme styling for all variants, so badges look good in both themes.

**Acceptance Criteria**:
1. **AC-1**: `src/components/ui/badge.tsx` updated
2. **AC-2**: All variants (default, primary, secondary, success, warning, error, info) use CSS vars
3. **AC-3**: All sizes (sm, md, lg) work in light theme
4. **AC-4**: Contrast ratio ≥4.5:1 for all variants
5. **AC-5**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Read existing `badge.tsx` implementation
- [ ] T2: Identify hardcoded colors
- [ ] T3: Update default: `bg-neutral-200 text-neutral-800`
- [ ] T4: Update variants with CSS vars (primary, secondary, success, etc.)
- [ ] T5: Test badge variants in light theme
- [ ] T6: Test badge variants in dark theme
- [ ] T7: Validate contrast ratios
- [ ] T8: Run `pnpm tsc --noEmit`

**Dev Notes**:
- Reference: `light-theme-component-specifications-part2-2026-01-03.md` (Section 14 - Badge)
- Warning badge text should be black (#000000) on amber background
- Outline badge: transparent bg with border

---

#### LT-3.15: Migrate Card Component

**User Story**: As a developer, I want the Card component to use CSS custom properties for background and shadows, so cards look good in both themes.

**Acceptance Criteria**:
1. **AC-1**: `src/components/ui/card.tsx` updated
2. **AC-2**: Card background uses `--card` variable
3. **AC-3**: Card text uses `--card-foreground` variable
4. **AC-4**: Card border uses `--border` variable
5. **AC-5**: Card shadow works in light theme
6. **AC-6**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Read existing `card.tsx` implementation
- [ ] T2: Identify hardcoded values
- [ ] T3: Update background: `bg-card`
- [ ] T4: Update foreground: `text-card-foreground`
- [ ] T5: Update border: `border border-border`
- [ ] T6: Update shadow: Use Tailwind shadow utilities (they work with both themes)
- [ ] T7: Test card in light theme
- [ ] T8: Test card in dark theme
- [ ] T9: Run `pnpm tsc --noEmit`

**Dev Notes**:
- Reference: `light-theme-component-specifications-part2-2026-01-03.md` (Section 9 - Card)
- Tailwind shadows work well with both themes
- Consider using `shadow-sm` for light variant

---

#### LT-3.16: Migrate Dialog Component

**User Story**: As a developer, I want the Dialog component to support light theme styling with smooth animations, so dialogs look good in both themes.

**Acceptance Criteria**:
1. **AC-1**: `src/components/ui/dialog.tsx` updated
2. **AC-2**: Dialog background uses `--background` (white)
3. **AC-3**: Dialog border uses `--border`
4. **AC-4**: Dialog text uses `--foreground`
5. **AC-5**: Overlay opacity correct (50% for neutral-950)
6. **AC-6**: Animation smooth (150ms scale + fade)
7. **AC-7**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Read existing `dialog.tsx` implementation
- [ ] T2: Identify hardcoded values
- [ ] T3: Update overlay: `bg-neutral-950/50`
- [ ] T4: Update dialog content: `bg-background border-border`
- [ ] T5: Update title: `text-foreground font-semibold`
- [ ] T6: Update description: `text-muted-foreground`
- [ ] T7: Test dialog in light theme
- [ ] T8: Test dialog in dark theme
- [ ] T9: Test animation smoothness
- [ ] T10: Test close button functionality
- [ ] T11: Run `pnpm tsc --noEmit`

**Dev Notes**:
- Reference: `light-theme-component-specifications-part2-2026-01-03.md` (Section 11 - Dialog)
- Use Radix UI Dialog primitives
- Ensure focus trap works

---

#### LT-3.17: Migrate Toast Component

**User Story**: As a developer, I want the Toast component to support light theme styling for all variants, so notifications look good in both themes.

**Acceptance Criteria**:
1. **AC-1**: `src/components/ui/toast.tsx` updated
2. **AC-2**: Toast background uses `--background` (white)
3. **AC-3**: Toast border uses `--border`
4. **AC-4**: All variants (success, error, warning, info) use semantic color vars
5. **AC-5**: Icons use semantic colors (success green, error red, etc.)
6. **AC-6**: Animation smooth (slide up + fade)
7. **AC-7**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Read existing `toast.tsx` implementation
- [ ] T2: Identify hardcoded values
- [ ] T3: Update toast: `bg-background border-border`
- [ ] T4: Update variants with semantic colors (success, destructive, warning, info)
- [ ] T5: Update icon colors
- [ ] T6: Test toast variants in light theme
- [ ] T7: Test toast variants in dark theme
- [ ] T8: Test animation smoothness
- [ ] T9: Test auto-dismiss functionality
- [ ] T10: Run `pnpm tsc --noEmit`

**Dev Notes**:
- Reference: `light-theme-component-specifications-part2-2026-01-03.md` (Section 18 - Toast)
- Use Radix UI Toast primitives (or equivalent)
- Icons: CheckCircle, XCircle, AlertTriangle, Info

---

#### LT-3.18: Migrate Tabs Component

**User Story**: As a developer, I want the Tabs component to support light theme styling with smooth indicator animation, so tabs look good in both themes.

**Acceptance Criteria**:
1. **AC-1**: `src/components/ui/tabs.tsx` updated
2. **AC-2**: Tab container background uses `--background`
3. **AC-3**: Tab inactive text uses `--muted-foreground`
4. **AC-4**: Tab active text uses `--primary`
5. **AC-5**: Active indicator uses `--primary` color
6. **AC-6**: Indicator animation smooth (150ms ease-out)
7. **AC-7**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Read existing `tabs.tsx` implementation
- [ ] T2: Identify hardcoded values
- [ ] T3: Update tabs list: `bg-background border-b-border`
- [ ] T4: Update tab (inactive): `text-muted-foreground hover:bg-accent`
- [ ] T5: Update tab (active): `text-primary`
- [ ] T6: Update indicator: `bg-primary`
- [ ] T7: Add indicator animation: `transition-all duration-150 ease-out`
- [ ] T8: Test tabs in light theme
- [ ] T9: Test tabs in dark theme
- [ ] T10: Test indicator animation smoothness
- [ ] T11: Run `pnpm tsc --noEmit`

**Dev Notes**:
- Reference: `light-theme-component-specifications-part2-2026-01-03.md` (Section 8 - Tabs)
- Use Radix UI Tabs primitives
- Indicator should slide (not just fade)

---

### Phase 4: Workspace Components

#### LT-4.19: Update IDE Workspace

**User Story**: As a user, I want the IDE workspace to work in light theme, so I can write code comfortably in bright environments.

**Acceptance Criteria**:
1. **AC-1**: Monaco editor configured for light theme
2. **AC-2**: Terminal uses light theme colors
3. **AC-3**: File tree looks good in light theme
4. **AC-4**: Sidebar panels use light theme
5. **AC-5**: Status bar text visible in light theme
6. **AC-6**: No layout breaks when switching themes
7. **AC-7**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Read IDE workspace components
- [ ] T2: Identify Monaco editor configuration
- [ ] T3: Configure light Monaco theme (vs-light+ or custom)
- [ ] T4: Update terminal colors for light theme
- [ ] T5: Update file tree colors (icons, text)
- [ ] T6: Update sidebar panel styling
- [ ] T7: Update status bar styling
- [ ] T8: Test theme switching in IDE workspace
- [ ] T9: Verify file editing still works
- [ ] T10: Verify terminal commands still work
- [ ] T11: Run `pnpm tsc --noEmit`

**Research Requirements**:
- Context7: Monaco Editor theme configuration
- DeepWiki: Monaco light theme options

**Dev Notes**:
- Reference: Workspace components in `src/components/ide/`
- Monaco has built-in light themes: 'vs-light', 'vs'
- Terminal might need ANSI color overrides for light theme

---

#### LT-4.20: Update Knowledge Workspace

**User Story**: As a user, I want the Knowledge workspace to look good in light theme, so I can browse and manage knowledge content comfortably.

**Acceptance Criteria**:
1. **AC-1**: Knowledge cards use light theme styling
2. **AC-2**: Knowledge canvas looks good in light theme
3. **AC-3**: Search results look good in light theme
4. **AC-4**: All links and buttons visible
5. **AC-5**: No layout breaks when switching themes
6. **AC-6**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Read Knowledge workspace components
- [ ] T2: Identify hardcoded colors
- [ ] T3: Update knowledge cards styling
- [ ] T4: Update knowledge canvas nodes/glyphs
- [ ] T5: Update search results styling
- [ ] T6: Update buttons/links
- [ ] T7: Test theme switching in Knowledge workspace
- [ ] T8: Verify knowledge features still work
- [ ] T9: Run `pnpm tsc --noEmit`

**Dev Notes**:
- Reference: Workspace components in `src/routes/knowledge.tsx` and related
- Canvas nodes might need light theme colors
- Use `@/components/ui/card` for cards (already migrated)

---

#### LT-4.21: Update Study Workspace

**User Story**: As a user, I want the Study workspace to look good in light theme, so I can study flashcards comfortably.

**Acceptance Criteria**:
1. **AC-1**: Flashcards use light theme styling
2. **AC-2**: Quiz interface works in light theme
3. **AC-3**: All buttons/inputs visible
4. **AC-4**: Progress indicators visible
5. **AC-5**: No layout breaks when switching themes
6. **AC-6**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Read Study workspace components
- [ ] T2: Identify hardcoded colors
- [ ] T3: Update flashcard styling
- [ ] T4: Update quiz interface
- [ ] T5: Update progress bars
- [ ] T6: Test theme switching in Study workspace
- [ ] T7: Verify study features still work
- [ ] T8: Run `pnpm tsc --noEmit`

**Dev Notes**:
- Reference: Workspace components in `src/routes/study.tsx` and related
- Flashcard flip animation must still work
- Use already-migrated badge components

---

#### LT-4.22: Update Notes Workspace

**User Story**: As a user, I want the Notes workspace to look good in light theme, so I can write and view notes comfortably.

**Acceptance Criteria**:
1. **AC-1**: Note editor works in light theme
2. **AC-2**: Note list looks good in light theme
3. **AC-3**: Document viewer works in light theme
4. **AC-4**: All buttons/inputs visible
5. **AC-5**: No layout breaks when switching themes
6. **AC-6**: Zero TypeScript errors

**Tasks**:
- [ ] T1: Read Notes workspace components
- [ ] T2: Identify hardcoded colors
- [ ] T3: Update note editor styling
- [ ] T4: Update note list styling
- [ ] T5: Update document viewer
- [ ] T6: Test theme switching in Notes workspace
- [ ] T7: Verify note features still work
- [ ] T8: Run `pnpm tsc --noEmit`

**Dev Notes**:
- Reference: Workspace components in `src/routes/notes.tsx` and related
- Note editor might be Monaco or custom
- Use already-migrated card/button components

---

#### LT-4.23: Integration Testing

**User Story**: As a QA engineer, I want comprehensive integration testing across all workspaces, so I can verify the light theme works end-to-end.

**Acceptance Criteria**:
1. **AC-1**: All 4 workspaces tested (IDE, Knowledge, Study, Notes)
2. **AC-2**: Theme switching tested across workspaces
3. **AC-3**: No layout breaks when switching themes
4. **AC-4**: No regressions in dark theme
5. **AC-5**: Cross-workspace navigation works
6. **AC-6**: Zero critical bugs found
7. **AC-7**: Test report created

**Tasks**:
- [ ] T1: Test theme switching in IDE workspace (file editing, terminal)
- [ ] T2: Test theme switching in Knowledge workspace (cards, canvas, search)
- [ ] T3: Test theme switching in Study workspace (flashcards, quiz)
- [ ] T4: Test theme switching in Notes workspace (editor, list)
- [ ] T5: Test cross-workspace navigation (switch between workspaces)
- [ ] T6: Test theme persistence (refresh page)
- [ ] T7: Test system preference detection (change OS theme)
- [ ] T8: Test reduced motion (enable in OS)
- [ ] T9: Validate contrast ratios for critical elements
- [ ] T10: Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] T11: Create test report document
- [ ] T12: Create bug list (if any found)

**Test Report Template**:
```markdown
# Light Theme Integration Test Report

**Date**: 2026-01-03
**Tester**: [Name]
**Browsers**: Chrome, Firefox, Safari

## Workspace Test Results

| Workspace | Features Tested | Light Theme | Dark Theme | Theme Switch | Notes |
|-----------|-----------------|-------------|------------|--------------|-------|
| IDE | ✓ | ✓ | ✓ | ✓ | All good |
| Knowledge | ✓ | ✓ | ✓ | ✓ | All good |
...

## Issues Found
- [ ] Issue 1: [Description] → [Fix status]
- [ ] Issue 2: [Description] → [Fix status]

## Sign-off
✅ APPROVED for release
```

---

## QA Validation Plan

Based on `light-theme-qa-validation-checklist-2026-01-03.md`:

### Test Categories

1. **Functional Testing** (30+ test cases)
   - Theme toggle functionality
   - Theme persistence
   - System preference detection
   - Component theme support

2. **Visual Testing** (20+ test cases)
   - Color contrast validation (WCAG 2.1 AA)
   - Visual regression
   - FOUC prevention

3. **Performance Testing** (10+ test cases)
   - Theme switch FPS (≥60fps)
   - Animation duration (150-300ms)
   - CPU usage (≤20%)
   - Bundle size impact (<50KB)

4. **Accessibility Testing** (15+ test cases)
   - Screen reader compatibility
   - Keyboard navigation
   - Reduced motion support
   - ARIA attributes

5. **Cross-Browser Testing** (8 browsers)
   - Chrome (Latest 2 versions)
   - Firefox (Latest 2 versions)
   - Safari (Latest 2 versions)
   - Edge (Latest 2 versions)
   - Safari (iOS) iOS 16+
   - Chrome (Android) Latest

6. **Regression Testing**
   - Dark theme still working
   - Core features in light theme

7. **UAT (4 user stories)**
   - First-time user
   - Theme switcher
   - Visual impaired user
   - Extended use

**Total Test Cases**: 200+

---

## Resource Isolation Plan

### Non-Interference with Ralph Loop

Based on `.claude/ralph-loop.local.md`:

**Ralph Loop Resources**:
- Files: `src/infrastructure/persistence/stores/`, `src/lib/workspace/`
- Workspaces: IDE, Knowledge, Study, Notes
- Focus: Platform unification, store architecture, use cases

**Light Theme Resources**:
- Files: `src/styles/light-theme-tokens.css`, `src/types/theme.ts`, `src/lib/hooks/use-theme.ts`, `src/app/providers/theme-provider.tsx`, `src/components/ui/theme-toggle.tsx`, and UI component updates
- Workspaces: Same (but different changes - styling only)
- Focus: Visual appearance, color palette, transitions

**Collision Risk**: **LOW**
- Ralph Loop modifies state/logic
- Light Theme modifies appearance only (no state changes)
- Files don't overlap (styling vs. logic)

**Safeguards**:
1. Use separate Git branch: `feature/light-theme`
2. Review merge conflicts before merging
3. Test in environment with both changes
4. Coordinate with Ralph Loop team via communication

---

## Success Criteria

### Must-Have (P0)
- [x] All 23 stories completed
- [x] Theme toggle working (light/dark/system)
- [x] Theme persistence working
- [x] System preference detection working
- [x] WCAG 2.1 AA compliance (≥4.5:1 contrast)
- [x] Zero breaking changes to dark theme
- [x] 60fps theme switch performance

### Nice-to-Have (P1)
- [ ] Reduced motion respected
- [ ] Screen reader announcements working
- [ ] Keyboard navigation working
- [ ] Cross-browser compatibility verified

### Metrics
- [ ] Total stories: 23
- [ ] Stories completed: 0/23 (start)
- [ ] Testing coverage: 200+ cases
- [ ] Bug count: 0 (goal)
- [ ] TypeScript errors: 0 (goal)

---

## Governance Files

### Story Status File
**Location**: `_bmad-output/sprint-artifacts/light-theme-sprint-status.yaml`

**Format**:
```yaml
sprint_id: LT-2026-01-03
start_date: 2026-01-03
status: in_progress

stories:
  LT-1.1:
    title: Create light theme token file
    status: pending
    started_at: null
    completed_at: null
    assignee: sm

  LT-1.2:
    title: Update design-tokens.css with transition styles
    status: pending
    started_at: null
    completed_at: null
    depends_on: LT-1.1
    assignee: sm

  # ... (all 23 stories)

summary:
  total_stories: 23
  pending: 23
  in_progress: 0
  completed: 0
  blocked: 0

next_actions:
  - Load SM agent to create first story
  - Execute create-story workflow
  - Validate story file
  - Continue with remaining stories
```

---

## Next Actions

1. **Load SM Agent** to create first story (LT-1.1)
2. **Execute**: `@/sm *create-story` with story details from this plan
3. **Validate** story file against story-dev-cycle.md criteria
4. **Continue** with remaining stories one at a time
5. **Switch to Dev Agent** when story is ready for development
6. **Execute**: `@/dev *develop-story` for each story
7. **Execute**: `@/dev *code-review` after development
8. **Repeat** until all 23 stories are complete
9. **Execute QA** validation checklist
10. **Create final release report**

---

**END OF SPRINT PLAN**

This document provides the complete roadmap for implementing the Light Theme Design System. Follow the story-dev-cycle.md workflow for each story, working collaboratively between SM and Dev agents.