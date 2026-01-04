# LT-4.19 Story Handoff Document

## Story Metadata
| Field | Value |
|-------|-------|
| **Story ID** | LT-4.19 |
| **Title** | IDE Workspace Light Theme |
| **Priority** | P1 |
| **Estimated Hours** | 6 |
| **Dependencies** | LT-3.18 (complete) |
| **Status** | pending |
| **Assignee** | light-theme-dev-agent |

## Scope

### Components to Migrate
1. **XTerminal** - xterm.js terminal with hardcoded dark theme colors
2. **StatusBar** - VS Code-style footer with primary background
3. **IDEResizableLayout** - Main layout container
4. **IDEHeaderBar** - Header bar component
5. **ExplorerPanel** - File explorer panel
6. **IconSidebar** - Sidebar icons and container

### Light Theme Requirements

#### XTerminal (xterm.js)
Current state: Hardcoded dark theme colors
```typescript
theme: {
    background: '#020617', // slate-950
    foreground: '#e2e8f0', // slate-200
    cursor: '#22d3ee',     // cyan-400
    // ... more dark colors
}
```

Required approach: Theme-aware xterm.js configuration using CSS variables or conditional theming

#### StatusBar
Current state: Uses `bg-primary` class
```typescript
className={cn('bg-primary flex items-center justify-between', ...)}
```

Required approach: Should work with CSS variables but may need background color adjustment for light theme

#### IDEResizableLayout
Current state: Need to verify theme compatibility
Required approach: Ensure all layout containers use CSS variables for backgrounds

### Design Tokens Available
- `--background`: Main background (dark: #0f0f11, light: #ffffff)
- `--foreground`: Primary text (dark: #f2f2f2, light: #171717)
- `--card`: Card/panel background
- `--primary`: Brand orange (#f97316)
- `--secondary`: Secondary surfaces
- `--muted`: Muted backgrounds
- `--border`: Border colors
- `--sidebar`: Sidebar specific colors

### Implementation Strategy

#### 1. XTerminal Light Theme
```typescript
// Use CSS custom properties for xterm.js theme
const getXtermTheme = (isLight: boolean) => ({
    background: isLight ? '#ffffff' : '#020617',
    foreground: isLight ? '#171717' : '#e2e8f0',
    cursor: isLight ? '#f97316' : '#22d3ee',
    selectionBackground: isLight ? 'rgba(249, 115, 22, 0.3)' : 'rgba(34, 211, 238, 0.3)',
    // ... map other colors
});

// Or use CSS variables with xterm-addon-style
```

#### 2. StatusBar
```typescript
// Should work with CSS variables but verify
<footer className="bg-[var(--primary)]">
```

#### 3. Layout Containers
```typescript
// Ensure all layout containers use CSS variables
<div className="bg-[var(--background)] text-[var(--foreground)]">
```

### Files to Modify
| File | Changes |
|------|---------|
| `src/presentation/components/ide/XTerminal.tsx` | Add light theme support for xterm.js |
| `src/presentation/components/ide/StatusBar.tsx` | Verify CSS variable usage |
| `src/presentation/components/layout/IDELayout/IDEResizableLayout.tsx` | Verify theme compatibility |
| `src/presentation/components/layout/IDEHeaderBar.tsx` | Verify CSS variable usage |
| `src/presentation/components/ide/ExplorerPanel.tsx` | Verify CSS variable usage |
| `src/presentation/components/ide/IconSidebar.tsx` | Verify CSS variable usage |

### Testing Checklist
- [ ] XTerminal renders correctly in light theme
- [ ] XTerminal renders correctly in dark theme (no regression)
- [ ] StatusBar background color works in both themes
- [ ] All layout containers use correct background colors
- [ ] File explorer colors work in light theme
- [ ] Sidebar styling works in light theme
- [ ] Transitions work during theme toggle
- [ ] Accessibility (contrast ratios) verified

## Acceptance Criteria
1. IDE workspace components use CSS custom properties for all color values
2. Theme toggle switches IDE workspace between light and dark themes
3. XTerminal has proper light/dark theme colors for xterm.js
4. No hardcoded color values in IDE workspace components
5. All transitions work smoothly during theme switching
6. No breaking changes to existing functionality

## Handoff Notes
- XTerm.js requires special handling for theme changes
- Some components may need `useTheme` hook from next-themes
- Verify all hover/focus states work in both themes
- Test keyboard navigation accessibility in both themes

## Related Stories
- LT-1.6: ThemeProvider (complete)
- LT-1.7: ThemeToggle (complete)
- LT-3.18: Tabs Component (complete - had hardcoded theme bug)

## Execution Instructions
1. Review each component for current styling
2. Identify hardcoded colors that need CSS variables
3. Implement light theme support following established patterns
4. Test in both light and dark themes
5. Verify no regressions
