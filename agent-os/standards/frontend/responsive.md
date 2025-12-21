# Responsive Design Standards

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## IDE Layout Considerations

Via-Gent is a **desktop-first IDE**. Mobile support is informational only.

| Breakpoint | Width | Layout |
|------------|-------|--------|
| `sm` | 640px | Not supported - show "Desktop Required" message |
| `md` | 768px | Minimal IDE (collapsed sidebar) |
| `lg` | 1024px | Standard IDE layout |
| `xl` | 1280px | Full IDE with all panels |
| `2xl` | 1536px | Extended preview panel width |

---

## Desktop-First Approach

```tsx
// ✅ Desktop-first for IDE components
<div className="hidden lg:flex">
  <Sidebar />
  <MainContent />
</div>

// Mobile fallback
<div className="flex lg:hidden items-center justify-center h-screen">
  <p>{t('common.desktop_required')}</p>
</div>
```

---

## Panel Resizing

Use `react-resizable-panels` for IDE layout:

```tsx
<PanelGroup direction="horizontal">
  <Panel defaultSize={20} minSize={15} maxSize={40}>
    <FileTree />
  </Panel>
  <PanelResizeHandle />
  <Panel defaultSize={50}>
    <MonacoEditor />
  </Panel>
  <PanelResizeHandle />
  <Panel defaultSize={30} minSize={20}>
    <PreviewPanel />
  </Panel>
</PanelGroup>
```

---

## General Practices

- **Desktop-First**: IDE requires ≥1024px width
- **Standard Breakpoints**: Use Tailwind defaults (`sm`, `md`, `lg`, `xl`, `2xl`)
- **Fluid Layouts**: Panels use percentage-based widths
- **Minimum Sizes**: Enforce minSize on resizable panels
- **Persistence**: Store layout state in IndexedDB per project
