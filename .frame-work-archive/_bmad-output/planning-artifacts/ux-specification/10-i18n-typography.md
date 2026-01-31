# i18n & Typography

<- [Plugin Interfaces](./09-plugin-interfaces.md) | [Index](./index.md) | [Accessibility](./11-accessibility.md) ->

---

## 10.1 Supported Languages

| Language | Code | Status | Notes |
|----------|------|--------|-------|
| **English** | `en` | Primary | Default language |
| **Vietnamese** | `vi` | Secondary | Full support with diacritics |
| RTL Languages | - | **Deferred** | Not in MVP scope |

---

## 10.2 Font Stack

| Purpose | Font Family | Fallback | CSS Variable |
|---------|-------------|----------|--------------|
| **Display/Pixel** | VT323 | monospace | `--font-pixel` |
| **Code/Mono** | JetBrains Mono | Consolas, monospace | `--font-mono` |
| **Body/Sans** | Inter | system-ui, sans-serif | `--font-sans` |

### CSS Font Stack Declarations

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
               'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco',
               'Inconsolata', 'Consolas', monospace;
  
  --font-pixel: 'VT323', 'Press Start 2P', 'Courier New', monospace;
}
```

### Vietnamese Character Support Test String

```
Tieng Viet: Aaao Eeeee Iiiii Ooooo Uuuuu Yyyyy
Dac biet: D d A a A a E e O o O o U u
Full: Viet Nam, Sai Gon, Da Nang, Hue, Ha Noi
```

---

## 10.3 Vietnamese Typography Considerations

Vietnamese text requires special handling for diacritics and text expansion.

### Line Height Adjustments

| Element | English | Vietnamese | Adjustment |
|---------|---------|------------|------------|
| **Headings (H1-H3)** | 1.25 | 1.35 | +0.10 |
| **Body text** | 1.5 | 1.6 | +0.10 |
| **Buttons** | 1.25 | 1.35 | +0.10 |
| **Labels** | 1.4 | 1.5 | +0.10 |
| **Code** | 1.5 | 1.5 | No change |

### CSS Implementation

```css
/* Language-aware line heights */
:root {
  --leading-body: 1.5;
  --leading-heading: 1.25;
  --leading-button: 1.25;
}

[lang="vi"] {
  --leading-body: 1.6;
  --leading-heading: 1.35;
  --leading-button: 1.35;
}

/* Apply via utility classes */
.text-body {
  line-height: var(--leading-body);
}

.text-heading {
  line-height: var(--leading-heading);
}
```

---

## 10.4 Text Expansion Matrix

Vietnamese translations can be shorter OR longer than English. Design for flexibility.

| Component | EN Max Chars | VI Expansion | Resulting Max | Strategy |
|-----------|--------------|--------------|---------------|----------|
| **Button (primary)** | 20 | +30% | 26 chars | Wrap or truncate |
| **Button (icon+text)** | 12 | +25% | 15 chars | Truncate |
| **Menu item** | 25 | +35% | 34 chars | Truncate + tooltip |
| **Tab label** | 15 | +25% | 19 chars | Icon only if overflow |
| **Sidebar item** | 20 | +30% | 26 chars | Ellipsis at end |
| **Breadcrumb segment** | 20 | +25% | 25 chars | Middle truncation |
| **Toast message** | 50 | +40% | 70 chars | Multi-line allowed |
| **Tooltip** | 100 | +30% | 130 chars | Wrap at 200px |
| **Modal title** | 40 | +30% | 52 chars | Wrap allowed |
| **Form label** | 30 | +35% | 41 chars | Wrap preferred |
| **Error message** | 60 | +40% | 84 chars | Multi-line |
| **Badge/Tag** | 12 | +20% | 15 chars | No truncation |
| **Status text** | 15 | +25% | 19 chars | Truncate |

### Real-World Translation Examples

| English | Vietnamese | Change |
|---------|------------|--------|
| Settings | Cai dat | -12% (shorter) |
| Create new project | Tao du an moi | -28% (shorter) |
| File management | Quan ly tep tin | 0% (same) |
| Permission denied | Quyen truy cap bi tu choi | +53% (longer) |

---

## 10.5 Truncation Strategies

| Component | Strategy | Indicator | Tooltip |
|-----------|----------|-----------|---------|
| **Sidebar items** | End truncation | `...` | Full text |
| **Breadcrumbs** | Middle truncation | `pro...ject` | Full path |
| **File names** | Extension preserved | `longfile...txt` | Full name |
| **Tags/Badges** | No truncation | - | None |
| **Tab labels** | End truncation | `...` | Full text |
| **Toasts** | Multi-line (max 2) | - | Expand on click |

### Truncation CSS

```css
/* Single-line truncation */
.truncate-i18n {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Multi-line truncation (2 lines) */
.truncate-i18n-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* File name truncation (preserve extension) */
.truncate-filename {
  display: flex;
  min-width: 0;
}

.truncate-filename__base {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.truncate-filename__ext {
  flex-shrink: 0;
}
```

---

## 10.6 i18n Implementation

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | react-i18next | Translation management |
| **Namespace** | Per feature/plugin | Lazy loading |
| **Fallback** | English | Missing translation fallback |
| **Storage** | localStorage | Locale preference persistence |

### Namespace Structure

```
src/i18n/
|-- en/
|   |-- common.json           # Shared strings
|   |-- navigation.json       # Nav, sidebar, breadcrumbs
|   |-- plugins/
|   |   |-- filetree.json
|   |   |-- notes.json
|   |   |-- chat.json
|   |   +-- monaco.json
|   +-- settings.json
+-- vi/
    |-- common.json
    |-- navigation.json
    |-- plugins/
    |   |-- filetree.json
    |   |-- notes.json
    |   |-- chat.json
    |   +-- monaco.json
    +-- settings.json
```

### Usage Pattern

```typescript
// Component usage
import { useTranslation } from 'react-i18next';

function PluginHeader() {
  const { t } = useTranslation('plugins/filetree');
  
  return (
    <header className="plugin-panel__header">
      <h2>{t('title')}</h2>
      <button aria-label={t('actions.refresh')}>
        <RefreshIcon />
      </button>
    </header>
  );
}
```

---

## 10.7 Typography Scale

### Responsive Font Sizes

| Element | Mobile | Tablet | Desktop | Large Desktop |
|---------|--------|--------|---------|---------------|
| **H1** | 26px | 30px | 36px | 36px |
| **H2** | 22px | 24px | 30px | 32px |
| **H3** | 19px | 20px | 24px | 26px |
| **Body** | 15px | 16px | 16px | 17px |
| **Small** | 13px | 14px | 14px | 14px |
| **Button** | 14px | 14px | 16px | 16px |
| **Code** | 13px | 13px | 14px | 15px |

### CSS Custom Properties

```css
:root {
  /* Base scale (desktop 16px base) */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
}

/* Mobile adjustments */
@media (max-width: 639px) {
  :root {
    --text-base: 0.9375rem;  /* 15px */
    --text-lg: 1.0625rem;    /* 17px */
    --text-2xl: 1.375rem;    /* 22px */
    --text-3xl: 1.625rem;    /* 26px */
  }
}

/* Large desktop adjustments */
@media (min-width: 1280px) {
  :root {
    --text-base: 1.0625rem;  /* 17px */
    --text-lg: 1.1875rem;    /* 19px */
  }
}
```

---

## 10.8 Tailwind Language Variants

```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    function({ addVariant }) {
      addVariant('vi', 'html[lang="vi"] &');
      addVariant('en', 'html[lang="en"] &');
    },
  ],
  theme: {
    extend: {
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
};
```

### Usage

```tsx
<p className="leading-normal vi:leading-vi-normal">
  {t('description')}
</p>

<h2 className="leading-tight tracking-tight vi:leading-vi-tight vi:tracking-vi-tight">
  {t('title')}
</h2>
```

---

## 10.9 Plugin Icons Reference

| Plugin | Lucide Icon | Tooltip (EN) | Tooltip (VI) |
|--------|-------------|--------------|--------------|
| FileTree | `Folder` | Files | Tep tin |
| Monaco | `Code2` | Editor | Trinh soan |
| Notes | `NotebookPen` | Notes | Ghi chu |
| Terminal | `Terminal` | Terminal | Terminal |
| Preview | `Eye` | Preview | Xem truoc |
| Chat | `MessageSquare` | AI Chat | Chat AI |
| Add | `Plus` | Add Plugin | Them plugin |
| Settings | `Settings` | Settings | Cai dat |

---

<- [Plugin Interfaces](./09-plugin-interfaces.md) | [Index](./index.md) | [Accessibility](./11-accessibility.md) ->
