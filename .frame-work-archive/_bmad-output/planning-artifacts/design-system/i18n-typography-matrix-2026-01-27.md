# i18n Typography Matrix Specification

**Task ID**: UX-DESIGN-02D
**Date**: 2026-01-27
**Agent**: ux-designer-ext
**Status**: COMPLETE

---

## Executive Summary

This specification defines the typography system for bilingual support (English and Vietnamese), ensuring proper rendering of diacritics, appropriate line heights, text expansion handling, and responsive typography across all breakpoints.

**Key Vietnamese Considerations**:
- Extensive diacritic marks (tone marks: à, á, ả, ã, ạ, etc.)
- Text expansion typically 20-40% longer than English
- Line height requirements for diacritic clearance
- Font stack must support full Vietnamese character set

---

## 1. Font Stack Validation

### Current Project Fonts

| Font | Purpose | Vietnamese Support | Diacritics Rendering | License | Recommendation |
|------|---------|-------------------|---------------------|---------|----------------|
| **VT323** | Pixel/Decorative | Full | Good | OFL | Headers, badges, decorative |
| **JetBrains Mono** | Code/Mono | Full | Excellent | OFL | Code editor, terminal |
| **Inter** | Body/Prose | Full | Excellent | OFL | Body text, UI labels |

### Font Stack Declaration

```css
/* Primary Font Stack - Inter for UI */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
             'Droid Sans', 'Helvetica Neue', sans-serif;

/* Monospace Font Stack - JetBrains Mono for Code */
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 
             'Inconsolata', 'Roboto Mono', 'Source Code Pro', 
             'Menlo', 'Consolas', monospace;

/* Pixel Font Stack - VT323 for 8-bit Aesthetic */
--font-pixel: 'VT323', 'Press Start 2P', 'Courier New', monospace;
```

### Vietnamese Character Set Test String

Use this string to validate font rendering:

```
Tiếng Việt: Àáảãạ Èéẻẽẹ Ìíỉĩị Òóỏõọ Ùúủũụ Ỳýỷỹỵ
Đặc biệt: Đ đ Ă ă Â â Ê ê Ô ô Ơ ơ Ư ư
Full: Việt Nam, Sài Gòn, Đà Nẵng, Huế, Hà Nội
```

---

## 2. Line Height Matrix

### Language-Specific Line Height Tokens

```css
:root {
  /* ===== Base Line Heights (English) ===== */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* ===== Vietnamese Line Height Adjustments ===== */
  /* Add 0.1 to each value for Vietnamese diacritic clearance */
  --leading-vi-tight: 1.35;      /* 1.25 + 0.1 */
  --leading-vi-snug: 1.475;      /* 1.375 + 0.1 */
  --leading-vi-normal: 1.6;      /* 1.5 + 0.1 */
  --leading-vi-relaxed: 1.725;   /* 1.625 + 0.1 */
}
```

### Per-Element Line Height Matrix

| Element | English (line-height) | Vietnamese (line-height) | CSS Variable | Notes |
|---------|----------------------|-------------------------|--------------|-------|
| **H1 (Display)** | 1.1 | 1.2 | `--leading-display` | Extra tight for impact |
| **H2 (Title)** | 1.2 | 1.3 | `--leading-title` | Headline readability |
| **H3-H6 (Heading)** | 1.25 | 1.35 | `--leading-heading` | Section headers |
| **Body text** | 1.5 | 1.6 | `--leading-body` | Primary content |
| **Small text** | 1.4 | 1.5 | `--leading-small` | Captions, footnotes |
| **Buttons** | 1.25 | 1.35 | `--leading-button` | Vertical centering |
| **Labels** | 1.4 | 1.5 | `--leading-label` | Form labels |
| **Menu items** | 1.375 | 1.475 | `--leading-menu` | Navigation items |
| **Tooltips** | 1.4 | 1.5 | `--leading-tooltip` | Hover information |
| **Code (mono)** | 1.5 | 1.5 | `--leading-code` | Same for both |
| **Terminal** | 1.2 | 1.2 | `--leading-terminal` | Same for both |

### Language-Aware CSS Implementation

```css
/* Default (English) */
[lang="en"] .text-body,
:not([lang="vi"]) .text-body {
  line-height: var(--leading-body, 1.5);
}

/* Vietnamese */
[lang="vi"] .text-body {
  line-height: var(--leading-vi-normal, 1.6);
}

/* Utility classes for quick switching */
.leading-i18n-body {
  line-height: 1.5;
}

[lang="vi"] .leading-i18n-body {
  line-height: 1.6;
}
```

---

## 3. Text Length Expansion Zones

### Expansion Factor Reference

| UI Element | Max EN Length | Vi Expansion | Resulting Max | Strategy |
|------------|---------------|--------------|---------------|----------|
| **Button (primary)** | 20 chars | +30% | 26 chars | Wrap or truncate |
| **Button (icon+text)** | 12 chars | +25% | 15 chars | Truncate preferred |
| **Menu item** | 25 chars | +35% | 34 chars | Truncate with tooltip |
| **Tab label** | 15 chars | +25% | 19 chars | Icon + short text |
| **Sidebar item** | 20 chars | +30% | 26 chars | Ellipsis at end |
| **Breadcrumb segment** | 20 chars | +25% | 25 chars | Middle truncation |
| **Toast message** | 50 chars | +40% | 70 chars | Multi-line allowed |
| **Tooltip** | 100 chars | +30% | 130 chars | Wrap at 200px |
| **Modal title** | 40 chars | +30% | 52 chars | Wrap allowed |
| **Form label** | 30 chars | +35% | 41 chars | Wrap preferred |
| **Error message** | 60 chars | +40% | 84 chars | Multi-line |
| **Badge/Tag** | 12 chars | +20% | 15 chars | No truncation |
| **Status text** | 15 chars | +25% | 19 chars | Truncate |

### Real-World Translation Examples

| English | Vietnamese | EN Length | VI Length | Expansion |
|---------|------------|-----------|-----------|-----------|
| Settings | Cài đặt | 8 | 7 | -12% (shorter) |
| Create new project | Tạo dự án mới | 18 | 13 | -28% (shorter) |
| File management | Quản lý tệp tin | 15 | 15 | 0% (same) |
| Save changes | Lưu thay đổi | 12 | 12 | 0% (same) |
| Configuration settings | Cài đặt cấu hình | 22 | 16 | -27% (shorter) |
| Permission denied | Quyền truy cập bị từ chối | 17 | 26 | +53% (longer) |
| Unsaved changes warning | Cảnh báo thay đổi chưa lưu | 23 | 27 | +17% |
| Desktop browser required | Yêu cầu trình duyệt máy tính | 25 | 29 | +16% |

**Insight**: Vietnamese translations can be shorter OR longer - design for flexibility, not fixed expansion.

---

## 4. Truncation Rules

### Truncation Strategy Matrix

| Component | Strategy | Indicator | Min Display | Tooltip |
|-----------|----------|-----------|-------------|---------|
| **Sidebar items** | End truncation | "..." | 10 chars | Full text |
| **Breadcrumbs** | Middle truncation | "...đặt" | First 3 + last 5 | Full path |
| **File names** | Extension preserved | "longfile...txt" | 8 + ext | Full name |
| **Tags/Badges** | No truncation | - | Full display | None |
| **Tab labels** | End truncation | "..." | 8 chars | Full text |
| **Menu items** | End truncation | "..." | 15 chars | Full text |
| **Toasts** | Multi-line | - | 2 lines max | Expand on click |
| **Button text** | Wrap then truncate | "..." | 1 line | Tooltip |

### CSS Truncation Utilities

```css
/* ===== Single-Line Truncation ===== */
.truncate-i18n {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== Multi-Line Truncation (2 lines) ===== */
.truncate-i18n-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== Multi-Line Truncation (3 lines) ===== */
.truncate-i18n-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== Middle Truncation (requires JS) ===== */
.truncate-middle {
  /* Implemented via JavaScript - see utility function below */
  display: inline-block;
}

/* ===== File Name Truncation (preserve extension) ===== */
.truncate-filename {
  display: flex;
  min-width: 0;
}

.truncate-filename-base {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.truncate-filename-ext {
  flex-shrink: 0;
}
```

### JavaScript Truncation Utility

```typescript
/**
 * Middle truncation for long strings (e.g., breadcrumbs, file paths)
 * Preserves start and end, replaces middle with ellipsis
 */
export function truncateMiddle(
  text: string,
  maxLength: number,
  startChars: number = 8,
  endChars: number = 8
): string {
  if (text.length <= maxLength) return text;
  
  const ellipsis = '...';
  const start = text.substring(0, startChars);
  const end = text.substring(text.length - endChars);
  
  return `${start}${ellipsis}${end}`;
}

/**
 * File name truncation preserving extension
 */
export function truncateFilename(
  filename: string,
  maxLength: number
): { base: string; ext: string; truncated: boolean } {
  const lastDot = filename.lastIndexOf('.');
  const ext = lastDot > 0 ? filename.substring(lastDot) : '';
  const base = lastDot > 0 ? filename.substring(0, lastDot) : filename;
  
  const maxBaseLength = maxLength - ext.length - 3; // -3 for "..."
  
  if (base.length <= maxBaseLength) {
    return { base, ext, truncated: false };
  }
  
  return {
    base: base.substring(0, maxBaseLength) + '...',
    ext,
    truncated: true
  };
}
```

---

## 5. Responsive Typography Scale

### CSS Custom Properties

```css
:root {
  /* ===== Base Typography Scale (Desktop 16px base) ===== */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  
  /* ===== Font Weights ===== */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* ===== Letter Spacing ===== */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
  
  /* ===== Vietnamese-specific letter spacing ===== */
  /* Slightly tighter for Vietnamese to compensate for diacritics */
  --tracking-vi-normal: -0.01em;
  --tracking-vi-tight: -0.03em;
}

/* ===== Mobile Adjustments (< 640px) ===== */
@media (max-width: 639px) {
  :root {
    --text-base: 0.9375rem;  /* 15px - slightly smaller base */
    --text-lg: 1.0625rem;    /* 17px */
    --text-xl: 1.1875rem;    /* 19px */
    --text-2xl: 1.375rem;    /* 22px */
    --text-3xl: 1.625rem;    /* 26px */
    --text-4xl: 2rem;        /* 32px */
    --text-5xl: 2.5rem;      /* 40px */
  }
}

/* ===== Large Desktop Adjustments (>= 1280px) ===== */
@media (min-width: 1280px) {
  :root {
    --text-base: 1.0625rem;  /* 17px - slightly larger */
    --text-lg: 1.1875rem;    /* 19px */
    --text-xl: 1.375rem;     /* 22px */
    --text-2xl: 1.625rem;    /* 26px */
    --text-3xl: 2rem;        /* 32px */
  }
}
```

### Responsive Typography Component Mappings

| Component | Mobile | Tablet | Desktop | Large Desktop |
|-----------|--------|--------|---------|---------------|
| **H1** | 1.625rem (26px) | 1.875rem (30px) | 2.25rem (36px) | 2.25rem |
| **H2** | 1.375rem (22px) | 1.5rem (24px) | 1.875rem (30px) | 2rem (32px) |
| **H3** | 1.1875rem (19px) | 1.25rem (20px) | 1.5rem (24px) | 1.625rem (26px) |
| **Body** | 0.9375rem (15px) | 1rem (16px) | 1rem (16px) | 1.0625rem (17px) |
| **Small** | 0.8125rem (13px) | 0.875rem (14px) | 0.875rem (14px) | 0.875rem |
| **Button** | 0.875rem (14px) | 0.875rem (14px) | 1rem (16px) | 1rem |
| **Code** | 0.8125rem (13px) | 0.8125rem (13px) | 0.875rem (14px) | 0.9375rem (15px) |

---

## 6. Language-Aware CSS Utilities

### Tailwind Typography Utilities (Extended)

```css
/* ===== Typography Variants for i18n ===== */

/* Body text with Vietnamese line-height adjustment */
.prose-i18n {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-body);
  letter-spacing: var(--tracking-normal);
}

[lang="vi"] .prose-i18n {
  line-height: var(--leading-vi-normal);
  letter-spacing: var(--tracking-vi-normal);
}

/* Headings with Vietnamese adjustments */
.heading-i18n {
  font-family: var(--font-sans);
  font-weight: var(--font-semibold);
  line-height: var(--leading-heading);
}

[lang="vi"] .heading-i18n {
  line-height: var(--leading-vi-tight);
}

/* Pixel font for 8-bit aesthetic (VT323) */
.font-pixel-i18n {
  font-family: var(--font-pixel);
  /* VT323 has adequate Vietnamese support */
  line-height: 1.3;
}

[lang="vi"] .font-pixel-i18n {
  line-height: 1.4;
}

/* Code/mono with consistent line-height */
.code-i18n {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: var(--leading-code);
  letter-spacing: -0.01em;
}

/* Button text normalization */
.button-text-i18n {
  font-family: var(--font-sans);
  font-weight: var(--font-medium);
  line-height: var(--leading-button);
  letter-spacing: 0.01em;
}

[lang="vi"] .button-text-i18n {
  line-height: var(--leading-vi-tight);
}
```

### React Hook for Language-Aware Typography

```typescript
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

interface TypographyConfig {
  lineHeight: string;
  letterSpacing: string;
  className: string;
}

/**
 * Hook to get language-aware typography configuration
 */
export function useI18nTypography(variant: 'body' | 'heading' | 'button' | 'small') {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === 'vi';
  
  return useMemo((): TypographyConfig => {
    const configs: Record<string, { en: TypographyConfig; vi: TypographyConfig }> = {
      body: {
        en: { lineHeight: '1.5', letterSpacing: '0', className: 'leading-normal' },
        vi: { lineHeight: '1.6', letterSpacing: '-0.01em', className: 'leading-relaxed' },
      },
      heading: {
        en: { lineHeight: '1.25', letterSpacing: '-0.025em', className: 'leading-tight tracking-tight' },
        vi: { lineHeight: '1.35', letterSpacing: '-0.03em', className: 'leading-snug tracking-tighter' },
      },
      button: {
        en: { lineHeight: '1.25', letterSpacing: '0.01em', className: 'leading-tight tracking-wide' },
        vi: { lineHeight: '1.35', letterSpacing: '0', className: 'leading-snug' },
      },
      small: {
        en: { lineHeight: '1.4', letterSpacing: '0', className: 'leading-normal' },
        vi: { lineHeight: '1.5', letterSpacing: '-0.01em', className: 'leading-relaxed' },
      },
    };
    
    return isVietnamese ? configs[variant].vi : configs[variant].en;
  }, [isVietnamese, variant]);
}
```

---

## 7. i18n Typography Testing Checklist

### Visual Inspection Checklist

- [ ] **Diacritic Clipping Test**
  - Display: "Ắ Ấ Ế Ố Ứ" in all heading sizes
  - Verify: Top marks not clipped by line above
  - Check: "ạ ọ ụ" bottom marks not clipped

- [ ] **Text Expansion Test**
  - Toggle to Vietnamese
  - Verify: Buttons don't overflow or truncate unexpectedly
  - Check: Menu items remain readable
  - Ensure: Modal titles wrap gracefully

- [ ] **Line Height Uniformity**
  - Compare: English and Vietnamese paragraphs side-by-side
  - Verify: Line spacing appears balanced in both
  - Check: No cramped appearance in Vietnamese

- [ ] **Font Fallback Test**
  - Disable VT323, Inter, JetBrains Mono
  - Verify: System fallback renders Vietnamese correctly
  - Check: No missing glyphs (empty boxes)

### Automated Testing Recommendations

```typescript
// vitest test for i18n typography
describe('i18n Typography', () => {
  it('should render Vietnamese diacritics without clipping', () => {
    render(<Heading lang="vi">Việt Nam Đẹp</Heading>);
    const element = screen.getByRole('heading');
    const { height, lineHeight } = window.getComputedStyle(element);
    // Line height should accommodate diacritics
    expect(parseFloat(lineHeight) / parseFloat(height)).toBeGreaterThanOrEqual(1.3);
  });
  
  it('should apply Vietnamese line-height when lang="vi"', () => {
    render(
      <div lang="vi">
        <p className="prose-i18n">Nội dung tiếng Việt</p>
      </div>
    );
    const element = screen.getByText(/Nội dung/);
    expect(window.getComputedStyle(element).lineHeight).toBe('1.6');
  });
  
  it('should truncate long Vietnamese text with ellipsis', () => {
    render(
      <div className="truncate-i18n" style={{ width: '100px' }}>
        Đây là một chuỗi văn bản rất dài trong tiếng Việt
      </div>
    );
    const element = screen.getByText(/Đây là/);
    expect(element).toHaveStyle({ textOverflow: 'ellipsis' });
  });
});
```

### Browser Testing Matrix

| Browser | Platform | Vietnamese Rendering | Font Support |
|---------|----------|---------------------|--------------|
| Chrome 120+ | macOS/Windows | Excellent | Full |
| Safari 17+ | macOS/iOS | Excellent | Full |
| Firefox 120+ | All | Excellent | Full |
| Edge 120+ | Windows | Excellent | Full |
| Samsung Internet | Android | Good | Full |
| Mobile Safari | iOS 17+ | Excellent | Full |

---

## 8. Common Pitfalls and Solutions

### Pitfall 1: Diacritics Clipped by Adjacent Lines

**Problem**: Vietnamese tone marks (like ` ̂`, ` ̀`) get cut off by the line above.

**Solution**: Always use increased line-height for Vietnamese:
```css
[lang="vi"] { line-height: 1.6; }
```

### Pitfall 2: Button Text Overflow

**Problem**: Buttons designed for English overflow when switched to Vietnamese.

**Solution**: Use flexible button width with min-width:
```css
.btn-i18n {
  min-width: max-content;
  padding-inline: 1rem;
  white-space: nowrap;
}

/* If truncation needed */
.btn-i18n-compact {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### Pitfall 3: Fixed-Width Containers Break Layout

**Problem**: Fixed-width containers don't accommodate text expansion.

**Solution**: Use min-width instead of width, or flex containers:
```css
/* BAD */
.label { width: 100px; }

/* GOOD */
.label { min-width: 100px; max-width: 150px; }
```

### Pitfall 4: Font Fallback Missing Vietnamese

**Problem**: Custom fonts load slowly, fallback font missing Vietnamese glyphs.

**Solution**: Include Vietnamese-capable fallback early in stack:
```css
font-family: 'Inter', 'Segoe UI', 'Roboto', system-ui, sans-serif;
/* All fallbacks support Vietnamese */
```

### Pitfall 5: Inconsistent Line Height in Mixed Content

**Problem**: English and Vietnamese mixed in same paragraph have inconsistent spacing.

**Solution**: Apply Vietnamese line-height globally when Vietnamese is active:
```css
html[lang="vi"] {
  line-height: 1.6;
}
```

---

## 9. Integration with Tailwind Typography Plugin

### Tailwind Configuration Extension

```javascript
// tailwind.config.js (excerpt)
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        pixel: ['VT323', 'monospace'],
      },
      lineHeight: {
        'vi-tight': '1.35',
        'vi-snug': '1.475',
        'vi-normal': '1.6',
        'vi-relaxed': '1.725',
      },
      letterSpacing: {
        'vi-normal': '-0.01em',
        'vi-tight': '-0.03em',
      },
    },
  },
  plugins: [
    // Language-aware typography variant
    function({ addVariant }) {
      addVariant('vi', 'html[lang="vi"] &');
      addVariant('en', 'html[lang="en"] &');
    },
  ],
};
```

### Usage with Tailwind Variants

```tsx
<p className="leading-normal vi:leading-vi-normal">
  {t('someText')}
</p>

<h2 className="leading-tight tracking-tight vi:leading-vi-tight vi:tracking-vi-tight">
  {t('heading')}
</h2>

<button className="leading-tight vi:leading-vi-snug">
  {t('actions.save')}
</button>
```

---

## 10. CSS Variables Summary (Copy-Paste Ready)

```css
/* ===== i18n Typography Tokens ===== */
/* Add to src/styles/design-tokens.css */

:root {
  /* Line Heights - English (default) */
  --leading-display: 1.1;
  --leading-title: 1.2;
  --leading-heading: 1.25;
  --leading-body: 1.5;
  --leading-small: 1.4;
  --leading-button: 1.25;
  --leading-label: 1.4;
  --leading-menu: 1.375;
  --leading-tooltip: 1.4;
  --leading-code: 1.5;
  --leading-terminal: 1.2;
  
  /* Line Heights - Vietnamese Adjustments */
  --leading-vi-display: 1.2;
  --leading-vi-title: 1.3;
  --leading-vi-heading: 1.35;
  --leading-vi-body: 1.6;
  --leading-vi-small: 1.5;
  --leading-vi-button: 1.35;
  --leading-vi-label: 1.5;
  --leading-vi-menu: 1.475;
  --leading-vi-tooltip: 1.5;
  
  /* Letter Spacing - Vietnamese */
  --tracking-vi-normal: -0.01em;
  --tracking-vi-tight: -0.03em;
  
  /* Font Stacks */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-pixel: 'VT323', monospace;
}

/* Language-specific overrides */
[lang="vi"] {
  --leading-body: var(--leading-vi-body);
  --leading-heading: var(--leading-vi-heading);
  --leading-button: var(--leading-vi-button);
  --leading-small: var(--leading-vi-small);
  --leading-label: var(--leading-vi-label);
}
```

---

## References

- **8-bit Styling Resources**: `_bmad-output/analysis/8bit-styling-resources-2026-01-27.md`
- **Design Tokens**: `src/styles/design-tokens.css`
- **i18n Config**: `src/i18n/config.ts`
- **Translation Files**: `src/i18n/en.json`, `src/i18n/vi.json`

---

**Report Generated By**: ux-designer-ext
**Timebox Compliance**: 14 minutes (within 15-minute limit)
**Confidence Level**: HIGH
**Lines**: ~450
