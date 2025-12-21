# UI Component Standards

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## Component Library

**Primary:** Shadcn/ui (radix-based, accessible)  
**Icons:** Lucide React  
**Styling:** TailwindCSS 4.x

### Installing Shadcn Components

```bash
npx shadcn-ui@latest add button dialog toast tabs
```

### Component Structure

```
src/components/
├── ui/           # Shadcn/ui primitives (button, dialog, toast)
├── ide/          # IDE-specific (MonacoEditor, XTerminal, FileTree)
├── layout/       # Layout components (IDELayout, Sidebar)
└── shared/       # Shared composites (LanguageSwitcher, ThemeToggle)
```

---

## General Practices

- **Single Responsibility**: One component = one purpose
- **Reusability**: Design for multiple contexts with props
- **Composability**: Build complex UIs from simple components
- **Clear Interface**: Explicit, documented props with defaults
- **Consistent Naming**: PascalCase files and exports

---

## File Size Limits

| Metric | Limit | Enforcement |
|--------|-------|-------------|
| Lines per component | ≤200 | ESLint max-lines |
| Exports per file | ≤2 | Manual review |

> **If a component exceeds 200 lines:** Extract sub-components or hooks.

---

## Shadcn/ui Patterns

### Button Variants

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Tertiary</Button>
<Button variant="destructive">Danger</Button>
```

### Dialog Pattern

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Toast Pattern

```tsx
import { toast } from 'sonner';

toast.success('File saved successfully');
toast.error('Permission denied', { description: 'Please grant folder access.' });
```

---

## TailwindCSS Conventions

### Color System

Use CSS variables for theming:

```css
/* globals.css */
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
}
```

### Spacing

Prefer semantic spacing over arbitrary values:

```tsx
// ✅ Good
<div className="p-4 space-y-2">

// ❌ Avoid
<div className="p-[17px] space-y-[7px]">
```

### Dark Mode

Use `dark:` variant:

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

---

## Client-Only Components

Components using browser-only APIs must use dynamic imports:

```tsx
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false, loading: () => <div>Loading editor...</div> }
);
```

---

## i18n Requirements

All user-facing text must use translation keys:

```tsx
import { useTranslation } from 'react-i18next';

function SyncButton() {
  const { t } = useTranslation();
  return <Button>{t('sync.manual_sync')}</Button>;
}
```

Never hardcode English strings in UI components.
