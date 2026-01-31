# User Journey Visual Audit - 2026-01-28

**Audit Type**: CRITICAL - Visual Regression & Token Disconnect Analysis
**Auditor**: UX Designer Agent
**Status**: COMPLETE - ACTIONABLE FINDINGS

---

## Executive Summary

**THE USER IS RIGHT. EPIC-UXUI-01 created comprehensive design tokens that NOTHING USES.**

We spent significant effort creating:
- `src/styles/design-tokens.css` (1135 lines of tokens)
- `src/styles/light-theme-tokens.css` (150 lines)
- Token-aware primitives in `src/presentation/components/ui/`

But **100+ files** in `src/presentation/components/layout/` and other areas use **HARDCODED TAILWIND COLORS** like `bg-zinc-900`, `text-zinc-400`, `border-zinc-700` that **COMPLETELY IGNORE** the design tokens.

### Critical Failure: Light Theme Does NOTHING

The light theme toggle DOES work technically (adds `.light` class to `<html>`), but **NOTHING RESPONDS TO IT** because:

1. `light-theme-tokens.css` sets tokens in `:root` (which is OVERWRITTEN by `design-tokens.css` dark theme in `:root`)
2. 100+ components use hardcoded zinc colors that don't change with theme
3. Only a few UI primitives (Button, Settings sections) use the proper `var(--*)` tokens

---

## User Journey Analysis

### Journey 1: First Visit to Hub (`/`)

**Route**: `src/routes/index.tsx` -> `HubHomePage.tsx`

| Element | Current State | Uses Tokens? | Light Theme Works? |
|---------|---------------|--------------|-------------------|
| **Page Background** | `bg-background` | YES | YES |
| **HubHero** | Uses semantic classes | Partial | Partial |
| **QuickActionCard** | `bg-zinc-900 border-zinc-700` | NO | NO |
| **Quick Actions Section** | `text-muted-foreground` | YES | YES |
| **SummaryCardsGrid** | Unknown - needs check | Partial | Unknown |
| **ChartsGrid** | Unknown - needs check | Partial | Unknown |
| **BentoGrid** | Mixed | Partial | Partial |
| **RecentProjectsSection** | Unknown | Unknown | Unknown |

**Verdict**: Hub is MIXED - some elements respond to theme, many don't.

---

### Journey 2: Project Route (`/$projectId`)

**Route**: `src/routes/$projectId.tsx` -> `PluginLayout.tsx`

| Element | Current State | Uses Tokens? | Light Theme Works? |
|---------|---------------|--------------|-------------------|
| **GlobalHeader** | `bg-zinc-900 border-zinc-700 text-zinc-400` | **NO** | **NO** |
| **ProjectAwareLayout** | `bg-canvas` (custom class) | Partial | Partial |
| **PluginLayout** | `border-zinc-700 bg-zinc-900/50` | **NO** | **NO** |
| **DraggableBentoCell** | `border-zinc-700 bg-zinc-900` | **NO** | **NO** |
| **SystemRail** | Unknown | Unknown | Unknown |

**Verdict**: Project workspace is BROKEN for light theme. Header/layout stay dark.

---

### Journey 3: Settings (`/settings`)

**Route**: `src/routes/settings.tsx`

| Element | Current State | Uses Tokens? | Light Theme Works? |
|---------|---------------|--------------|-------------------|
| **Page Wrapper** | `bg-background text-foreground` | YES | YES |
| **Section Headers** | `text-foreground` | YES | YES |
| **Section Cards** | `border-border` | YES | YES |
| **ThemeToggle Button** | Uses Button component | YES | YES |
| **All Form Inputs** | Uses token-aware Button | YES | YES |

**Verdict**: Settings page IS WORKING! It uses semantic tokens correctly.

---

### Journey 4: Global Layout Components

**Critical Failures**:

#### GlobalHeader.tsx (332 lines)
```tsx
// Line 115 - HARDCODED
'bg-zinc-900 border-b-2 border-zinc-700',
'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-950',
'border-zinc-700 bg-black text-zinc-400',
```

#### MainSidebar.tsx (404 lines)
```tsx
// Line 43 - HARDCODED
'border-r-2 border-zinc-700 bg-zinc-900',
'text-zinc-400 hover:bg-zinc-950 hover:text-zinc-50',
'text-zinc-500', 'text-zinc-50', 'bg-zinc-900',
```

#### QuickActionCard.tsx (109 lines)
```tsx
// Line 73 - HARDCODED
'bg-zinc-900 border-2 border-zinc-700',
'text-zinc-50', 'text-zinc-400',
```

---

## Light Theme CSS Architecture FAILURE

### The Bug

In `design-tokens.css`:
1. Line 21: `@import "./light-theme-tokens.css";` - imports light tokens
2. Lines 73-620: `:root { ... }` - DARK THEME in :root (OVERWRITES light tokens!)
3. Lines 675-1053: `.light { ... }` - Light theme tokens (CORRECT but UNUSED)

In `light-theme-tokens.css`:
1. Lines 8-136: `:root { ... }` - Sets light theme in :root
2. This is IMPORTED FIRST then OVERWRITTEN by dark theme in design-tokens.css!

### The Problem

The CSS cascade order is:
1. `light-theme-tokens.css` `:root` - light tokens
2. `design-tokens.css` `:root` - dark tokens (WINS!)
3. `design-tokens.css` `.light` - never applied because components use hardcoded colors

Even if `.light` tokens worked, **components don't use `var(--background)` etc.** - they use `bg-zinc-900`.

---

## Token Disconnect Map

### Components Using Hardcoded Colors (BROKEN)

| File | Hardcoded Classes | Should Use |
|------|-------------------|------------|
| `GlobalHeader.tsx` | `bg-zinc-900`, `border-zinc-700`, `text-zinc-400` | `bg-surface-1`, `border-border`, `text-muted-foreground` |
| `MainSidebar.tsx` | `bg-zinc-900`, `border-zinc-700`, `text-zinc-400/50` | Same as above |
| `QuickActionCard.tsx` | `bg-zinc-900`, `border-zinc-700`, `text-zinc-50` | `bg-card`, `border-border`, `text-foreground` |
| `Breadcrumbs.tsx` | `bg-zinc-950`, `text-zinc-400`, `text-zinc-600` | `bg-surface-0`, `text-muted-foreground` |
| `PresetSelector.tsx` | `bg-zinc-900`, `border-zinc-700`, `text-zinc-100` | Same pattern |
| `PluginToggles.tsx` | `bg-zinc-900/50`, `border-zinc-800`, `text-zinc-500` | Same pattern |
| `NavigationBreadcrumbs.tsx` | `text-zinc-600`, `text-zinc-400`, `bg-zinc-900/50` | Same pattern |
| `SidebarQuickActions.tsx` | `border-zinc-800`, `text-zinc-400` | Same pattern |
| `SidebarWidgets.tsx` | `text-zinc-400`, `border-zinc-800`, `bg-zinc-800` | Same pattern |
| `MobileBottomNav.tsx` | `bg-zinc-900`, `border-zinc-700`, `text-zinc-500` | Same pattern |
| `PluginToggleBar.tsx` | `border-zinc-800`, `bg-zinc-900/50`, `text-zinc-500` | Same pattern |
| `DraggableBentoCell.tsx` | `border-zinc-700`, `bg-zinc-900`, `text-zinc-400` | Same pattern |
| `PluginLayout.tsx` | `border-zinc-700`, `bg-zinc-900/50`, `text-zinc-500` | Same pattern |

### Components Using Tokens (WORKING)

| File | Status |
|------|--------|
| `button.tsx` | Uses `var(--primary)`, `var(--secondary)`, etc. |
| `settings.tsx` route | Uses `bg-background`, `text-foreground`, `border-border` |
| `HubHomePage.tsx` | Uses `bg-background text-foreground` at top level |
| Scrollbars in `design-tokens.css` | Uses `hsl(var(--background))` |

---

## Priority Ranking (Impact on Users)

### P0 - BLOCKER (Light theme completely broken)

1. **GlobalHeader.tsx** - Every user sees this on every page
2. **MainSidebar.tsx** - Visible on all non-project routes
3. **QuickActionCard.tsx** - Hub quick actions stuck in dark

### P1 - HIGH (Major visual elements)

4. **Breadcrumbs.tsx** - Navigation context stuck dark
5. **PresetSelector.tsx** - Layout controls stuck dark
6. **PluginLayout.tsx** + **DraggableBentoCell.tsx** - Project workspace grid stuck dark
7. **PluginToggles.tsx** - Plugin controls stuck dark

### P2 - MEDIUM (Secondary elements)

8. **NavigationBreadcrumbs.tsx**
9. **SidebarQuickActions.tsx**
10. **SidebarWidgets.tsx**
11. **MobileBottomNav.tsx**
12. **PluginToggleBar.tsx**

### P3 - LOW (Minor elements)

13. IDE components (FileTree, AgentChatPanel, etc.)
14. Notes components
15. Other nested components

---

## Exact Files That Need Fixing

### P0 Files (Must Fix for Light Theme)

```
src/presentation/components/layout/GlobalHeader.tsx
src/presentation/components/layout/MainSidebar.tsx
src/presentation/components/hub/QuickActionCard.tsx
src/presentation/layouts/PluginLayout.tsx
src/presentation/layouts/DraggableBentoCell.tsx
```

### P1 Files (High Impact)

```
src/presentation/components/layout/Breadcrumbs.tsx
src/presentation/components/layout/PresetSelector.tsx
src/presentation/components/layout/PluginToggles.tsx
src/presentation/components/layout/NavigationBreadcrumbs.tsx
src/presentation/components/layout/MobileBottomNav.tsx
src/presentation/components/layout/PluginToggleBar.tsx
```

### P2 Files (Medium Impact)

```
src/presentation/components/layout/SidebarQuickActions.tsx
src/presentation/components/layout/SidebarWidgets.tsx
src/presentation/components/layout/SystemRail.tsx
src/presentation/components/layout/IDEHeaderBar.tsx
```

---

## Recommended Fix Pattern

Replace ALL hardcoded zinc colors with token-aware equivalents:

| Hardcoded | Replace With | Notes |
|-----------|--------------|-------|
| `bg-zinc-900` | `bg-card` or `bg-surface-1` | Use surface hierarchy |
| `bg-zinc-950` | `bg-background` or `bg-surface-0` | Deepest background |
| `bg-zinc-800` | `bg-secondary` or `bg-surface-2` | Elevated surface |
| `border-zinc-700` | `border-border` | Standard border |
| `border-zinc-800` | `border-border-muted` | Subtle border |
| `text-zinc-50` | `text-foreground` | Primary text |
| `text-zinc-100` | `text-foreground` | Primary text |
| `text-zinc-400` | `text-muted-foreground` | Secondary text |
| `text-zinc-500` | `text-muted-foreground` | Muted text |
| `text-zinc-600` | `text-muted-foreground` | Very muted text |
| `hover:bg-zinc-950` | `hover:bg-accent` | Hover state |
| `hover:bg-zinc-800` | `hover:bg-accent` | Hover state |
| `hover:text-zinc-50` | `hover:text-foreground` | Hover text |

---

## CSS Architecture Fix

### Option 1: Quick Fix (Recommended)

1. Remove `light-theme-tokens.css` import
2. Keep ALL tokens in `design-tokens.css` only
3. `:root` = dark theme (default)
4. `.light` = light theme overrides (already exists)

### Option 2: Proper Semantic Tokens

1. Create utility classes in `styles.css`:
```css
.bg-surface-0 { background-color: hsl(var(--bg-0)); }
.bg-surface-1 { background-color: hsl(var(--bg-1)); }
.bg-surface-2 { background-color: hsl(var(--bg-2)); }
.bg-surface-3 { background-color: hsl(var(--bg-3)); }
```

2. Or use Tailwind's `@theme inline` to register custom colors (already done but not used!)

---

## Effort Estimate

| Task | Files | Effort |
|------|-------|--------|
| P0 Files (Light Theme Unblock) | 5 files | 2-3 hours |
| P1 Files (High Impact) | 6 files | 2-3 hours |
| P2 Files (Medium Impact) | 4 files | 1-2 hours |
| CSS Architecture Fix | 2 files | 30 min |
| **Total** | **17 files** | **6-8 hours** |

---

## Conclusion

**EPIC-UXUI-01 was INCOMPLETE.** The tokens were created, the primitives were styled, but:

1. **Nobody migrated the layout components** from zinc hardcodes to semantic tokens
2. **The CSS import order is broken** - light tokens get overwritten
3. **100+ components bypass the design system entirely**

The light theme toggle IS working (adds `.light` class). Components just ignore it.

**Recommended Next Steps**:

1. Create EPIC-UXUI-02: "Token Migration Sprint"
2. Start with P0 files (GlobalHeader, MainSidebar, QuickActionCard)
3. Test light theme after EACH component migration
4. Run visual regression tests

---

**Report Generated**: 2026-01-28
**Severity**: P0 BLOCKER for UX consistency
