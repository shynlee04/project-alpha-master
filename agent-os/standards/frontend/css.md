# CSS Standards

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## Framework

**Primary:** TailwindCSS 4.x  
**Preprocessor:** None (utility-first)  
**Integration:** Shadcn/ui theming

---

## CSS Methodology

### Utility-First Approach

```tsx
// ✅ Good - Use Tailwind utilities
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">

// ❌ Avoid - Custom CSS for standard patterns
<button className="custom-button">
```

### When to Use Custom CSS

Only for:
- Complex animations
- Unique layout requirements not covered by utilities
- Third-party library overrides (Monaco, xterm)

---

## Design Tokens

Use CSS variables defined in `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --muted: 210 40% 96.1%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  /* ... */
}
```

---

## Dark Mode

Always implement dark mode support:

```tsx
// ✅ Correct - Both light and dark variants
<div className="bg-background text-foreground dark:bg-background dark:text-foreground">

// ✅ Also correct - Using CSS variable colors
<div className="bg-card text-card-foreground">
```

---

## Spacing & Layout

### Semantic Spacing

```tsx
// ✅ Use Tailwind scale
<div className="p-4 space-y-2 gap-4">

// ❌ Avoid arbitrary values
<div className="p-[17px] space-y-[7px]">
```

### Responsive Design

Mobile-first approach:

```tsx
<div className="flex flex-col md:flex-row lg:grid lg:grid-cols-3">
```

---

## IDE-Specific Styles

### Monaco Editor Container

```css
.monaco-editor-container {
  height: 100%;
  width: 100%;
}

/* Dark theme overrides */
.dark .monaco-editor {
  --vscode-editor-background: hsl(var(--background));
}
```

### xterm Terminal

```css
.xterm {
  height: 100%;
  padding: 8px;
}

.xterm-viewport {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}
```

---

## Performance

- **PurgeCSS**: Automatic via TailwindCSS (removes unused utilities)
- **Critical CSS**: First paint styles inlined
- **Font Loading**: Use `font-display: swap`

---

## General Practices

- **Consistent Methodology**: Use Tailwind utilities, not mixed approaches
- **Avoid Overriding Framework Styles**: Work with Shadcn patterns
- **Maintain Design System**: All colors via CSS variables
- **Minimize Custom CSS**: Custom only for complex cases
