# Story 28-1: Override Design Tokens with VIA-GENT Brand

## Story Header
- **Epic:** 28 (UX Brand Identity & Design System)
- **Story:** 28-1
- **Title:** Override Design Tokens with VIA-GENT Brand
- **Priority:** 🔴 P0
- **Points:** 5
- **Status:** ready-for-dev
- **Created:** 2025-12-22
- **Platform:** Platform B

## User Story
As a **developer and user**,
I want **the IDE to use VIA-GENT brand colors and design tokens**,
So that **the interface looks unique, premium, and matches the MistralAI-inspired 8-bit aesthetic**.

## Current State (Epic 23 Implementation)
```css
/* Current generic ShadcnUI tokens - TO BE REPLACED */
:root {
  --primary: oklch(0.55 0.18 250);  /* Blue - WRONG */
  --background: oklch(0.985 0 0);   /* Light - OK */
}
.dark {
  --background: oklch(0.13 0.005 250);  /* Blue-tinted - REPLACE */
  --primary: oklch(0.65 0.18 250);      /* Blue - REPLACE with orange */
}
```

## Target State (VIA-GENT Brand)
```css
/* VIA-GENT Brand Tokens - TO BE IMPLEMENTED */
:root {
  --primary: 24.6 95% 53.1%;           /* #f97316 - Orange */
  --primary-foreground: 0 0% 100%;     /* White */
  --background: 0 0% 3.9%;             /* #0f0f11 - Deep black */
  --surface: 240 3.7% 10%;             /* #18181b - Panel */
  --surface-darker: 240 5.9% 7.5%;     /* #121214 - Sidebar */
  --editor-bg: 240 6% 3.5%;            /* #09090b - Editor */
  --border: 240 3.7% 15.9%;            /* #27272a - Borders */
  
  /* Pixel aesthetic tokens */
  --shadow-pixel: 2px 2px 0px 0px rgba(0,0,0,0.5);
  --shadow-pixel-primary: 2px 2px 0px 0px #c2410c;
  --radius: 0px;                        /* Squared by default */
  --radius-sm: 0.125rem;               /* Subtle optional rounding */
}
```

## Acceptance Criteria

### AC-28-1-1: Color Token Override
**Given** the current ShadcnUI blue color tokens
**When** I apply the VIA-GENT brand tokens
**Then** the primary color is orange (#f97316) and backgrounds are deep black

### AC-28-1-2: Dark Mode Default
**Given** the IDE loads for the first time
**When** no theme preference is set
**Then** dark mode is applied automatically

### AC-28-1-3: Pixel Shadow Tokens
**Given** the design system needs 8-bit aesthetic
**When** I add pixel shadow CSS variables
**Then** `--shadow-pixel` and `--shadow-pixel-primary` are available in Tailwind

### AC-28-1-4: Squared Corners Default
**Given** the 8-bit aesthetic requires hard edges
**When** I set `--radius: 0px` as default
**Then** all ShadcnUI components render with squared corners unless explicitly overridden

### AC-28-1-5: No Visual Regressions
**Given** existing components use the design tokens
**When** I swap the color values
**Then** all components continue to render correctly with new colors

## Tasks

### T1: Create Design Token Override File
**File:** `src/styles/design-tokens.css`
```css
/* VIA-GENT Brand Design Tokens
 * Overrides ShadcnUI defaults with MistralAI-inspired 8-bit aesthetic
 */

:root {
  /* ===== Core Brand Colors ===== */
  --primary: 24.6 95% 53.1%;           /* #f97316 - Orange accent */
  --primary-foreground: 0 0% 100%;     /* White */
  
  /* ===== Surface Colors (Dark Theme Default) ===== */
  --background: 240 6% 4%;             /* #0f0f11 - Deep black */
  --foreground: 0 0% 95%;              /* Near white text */
  
  --card: 240 4% 10%;                  /* #18181b - Card background */
  --card-foreground: 0 0% 95%;
  
  --popover: 240 4% 10%;
  --popover-foreground: 0 0% 95%;
  
  --secondary: 240 4% 16%;             /* #27272a */
  --secondary-foreground: 0 0% 90%;
  
  --muted: 240 4% 16%;
  --muted-foreground: 0 0% 65%;
  
  --accent: 240 4% 16%;
  --accent-foreground: 0 0% 95%;
  
  --destructive: 0 72% 51%;            /* Red for errors */
  
  --border: 240 4% 16%;                /* #27272a */
  --input: 240 4% 16%;
  --ring: 24.6 95% 53.1%;              /* Orange ring */
  
  /* ===== Sidebar Specific ===== */
  --sidebar: 240 6% 6%;                /* #0f1012 */
  --sidebar-foreground: 0 0% 95%;
  --sidebar-primary: 24.6 95% 53.1%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 240 4% 14%;
  --sidebar-accent-foreground: 0 0% 95%;
  --sidebar-border: 240 4% 16%;
  --sidebar-ring: 24.6 95% 53.1%;
  
  /* ===== Semantic Colors ===== */
  --success: 142 76% 36%;              /* #22c55e - Green */
  --warning: 45 93% 47%;               /* #eab308 - Yellow */
  --info: 217 91% 60%;                 /* #3b82f6 - Blue */
  
  /* ===== 8-Bit Aesthetic ===== */
  --radius: 0px;                       /* Squared corners */
  --radius-sm: 0.125rem;               /* 2px - subtle rounding */
  --radius-md: 0.25rem;                /* 4px */
  
  --shadow-pixel: 2px 2px 0px 0px rgba(0,0,0,0.5);
  --shadow-pixel-primary: 2px 2px 0px 0px #c2410c;
  --shadow-pixel-inset: inset 1px 1px 0px 0px rgba(255,255,255,0.05), 
                        inset -1px -1px 0px 0px rgba(0,0,0,0.5);
  
  /* ===== Editor Specific ===== */
  --editor-bg: 240 6% 3.5%;            /* #09090b - Deep code background */
  --editor-gutter: 240 4% 8%;
  --editor-selection: 24.6 95% 53.1% / 20%;
  
  /* ===== Chart Colors ===== */
  --chart-1: 24.6 95% 53.1%;           /* Primary orange */
  --chart-2: 217 91% 60%;              /* Blue */
  --chart-3: 142 76% 36%;              /* Green */
  --chart-4: 280 65% 60%;              /* Purple */
  --chart-5: 45 93% 47%;               /* Yellow */
}

/* Light mode override (minimal usage, dark is default) */
.light {
  --background: 0 0% 98%;
  --foreground: 240 6% 10%;
  --card: 0 0% 100%;
  --card-foreground: 240 6% 10%;
  --primary: 24.6 95% 45%;             /* Slightly darker orange for light mode */
  --primary-foreground: 0 0% 100%;
  --secondary: 240 4% 95%;
  --secondary-foreground: 240 6% 10%;
  --muted: 240 4% 95%;
  --muted-foreground: 240 4% 40%;
  --accent: 240 4% 95%;
  --accent-foreground: 240 6% 10%;
  --border: 240 4% 90%;
  --input: 240 4% 90%;
  --ring: 24.6 95% 45%;
}
```

### T2: Update Main Styles File
**File:** `src/styles.css`
- Import design tokens before other styles
- Remove duplicate `:root` and `.dark` blocks
- Ensure proper cascade

### T3: Add Tailwind Theme Extensions
**File:** `src/styles.css` (within `@theme inline`)
```css
@theme inline {
  /* Existing... */
  
  /* VIA-GENT Extensions */
  --shadow-pixel: var(--shadow-pixel);
  --shadow-pixel-primary: var(--shadow-pixel-primary);
  
  --color-surface: var(--card);
  --color-surface-foreground: var(--card-foreground);
  --color-editor-bg: hsl(var(--editor-bg));
  
  --color-success: hsl(var(--success));
  --color-warning: hsl(var(--warning));
  --color-info: hsl(var(--info));
}
```

### T4: Verify Component Rendering
- [ ] Button renders with orange primary
- [ ] Card has dark surface background
- [ ] Dialog/Sheet have correct overlay
- [ ] Tabs show orange active indicator
- [ ] Inputs have correct border colors

### T5: Test Dark Mode Default
- [ ] Verify `<html class="dark">` on initial load
- [ ] Theme toggle still works
- [ ] No flash of light mode

## Dev Notes

### Import Order
```css
/* src/styles.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "./design-tokens.css";  /* NEW - Import after tailwindcss */

@custom-variant dark (&:is(.dark *));

/* Rest of file... */
```

### HSL Format
ShadcnUI expects HSL values without the `hsl()` wrapper:
```css
/* Correct */
--primary: 24.6 95% 53.1%;

/* Incorrect */
--primary: hsl(24.6, 95%, 53.1%);
```

### Color Reference
| Color | Hex | HSL | Usage |
|-------|-----|-----|-------|
| Primary Orange | #f97316 | 24.6 95% 53.1% | Buttons, accents, brand |
| Background | #0f0f11 | 240 6% 4% | Page background |
| Surface | #18181b | 240 4% 10% | Cards, panels |
| Border | #27272a | 240 4% 16% | Borders, dividers |
| Editor | #09090b | 240 6% 3.5% | Monaco, terminal |

## References
- **Epic 28:** `_bmad-output/epics/epic-28-ux-brand-identity-design-system.md`
- **Mockups:** `_bmad-output/unified_ide_workspace_ux_ui/`
- **Current Styles:** `src/styles.css`
- **ShadcnUI Theming:** [ui.shadcn.com/docs/theming](https://ui.shadcn.com/docs/theming)

## Dev Agent Record

**Agent:** (to be filled)
**Session:** (to be filled)

### Task Progress:
- [ ] T1: Create design-tokens.css
- [ ] T2: Update main styles file
- [ ] T3: Add Tailwind theme extensions
- [ ] T4: Verify component rendering
- [ ] T5: Test dark mode default

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/styles/design-tokens.css | Created | ~100 |
| src/styles.css | Modified | ~50 |

### Tests:
- Visual verification of color changes
- Theme toggle functionality
- No console warnings

## Status History
| Date | Status | Notes |
|------|--------|-------|
| 2025-12-22 | ready-for-dev | Story created |
