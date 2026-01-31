---
id: UXUI-01-02
epic: EPIC-UXUI-01
title: Implement Typography Tokens
status: DONE
priority: P0
effort: 1-2h
team: B
started: 2026-01-27
completed: 2026-01-27
---

# UXUI-01-02: Implement Typography Tokens

## Description

Define a comprehensive typography system with 3 font families, responsive font size scale, line heights optimized for Vietnamese diacritics, and letter spacing tokens. Integrate with Tailwind CSS 4 via `@theme` directive.

## Font Families

| Font | Variable | Purpose |
|------|----------|---------|
| `JetBrains Mono` | `--font-mono` | UI and code (monospace) |
| `VT323` | `--font-pixel` | Pixel decorative (headings, badges) |
| `Inter` | `--font-sans` | Prose and long-form text |

## Files to Modify

- `src/styles/design-tokens.css` - Add typography tokens to `:root`
- `src/styles.css` - Update `@theme inline` with typography mappings

## Token Definitions

### Font Families
```css
--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
--font-pixel: 'VT323', 'Press Start 2P', monospace;
--font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Sizes (rem scale)
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

### Line Heights
```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;

/* Vietnamese line height adjustments (+0.1 for diacritic clearance) */
--leading-vi-tight: 1.35;
--leading-vi-snug: 1.475;
--leading-vi-normal: 1.6;
--leading-vi-relaxed: 1.725;
```

### Letter Spacing
```css
--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;

/* Vietnamese-specific letter spacing */
--tracking-vi-normal: -0.01em;
--tracking-vi-tight: -0.03em;
```

### Font Weights
```css
--font-thin: 100;
--font-extralight: 200;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;
```

## Acceptance Criteria

- [ ] Font families defined: VT323, JetBrains Mono, Inter
- [ ] Font size scale (--text-xs through --text-5xl)
- [ ] Line height adjustments for Vietnamese text (1.6 minimum)
- [ ] Letter spacing tokens (--tracking-tight through --tracking-widest)
- [ ] Font weight tokens (100-900 scale)
- [ ] Tailwind @theme references CSS variables
- [ ] TypeScript check passes

## Reference

- UX Spec: `_bmad-output/planning-artifacts/ux-specification/03-design-tokens.md` (Section 3.2)
- i18n Typography: `_bmad-output/planning-artifacts/design-system/i18n-typography-matrix-2026-01-27.md`
- Previous Story: `UXUI-01-01-color-tokens-handoff.md`

## Dependencies

- UXUI-01-01 (Color Tokens) - DONE

## Timebox

1-2 hours

---
**Created**: 2026-01-27
**Agent**: bmad-sprint-manager
