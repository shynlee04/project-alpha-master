---
document_id: STD-FRONTEND-RESPONSIVE-2025-12-27
title: Responsive Design Standards
version: 1.0.0
last_updated: 2025-12-27T13:40:00Z
phase: Implementation
team: Team A (Antigravity)
agent_mode: bmad-bmm-tech-writer
status: ACTIVE
---

# Responsive Design Standards

## Overview

This document defines responsive design standards for the Via-gent project to ensure the application works seamlessly across all device sizes and screen resolutions.

**Project Context**: Via-gent is a browser-based IDE that requires responsive design to work on various screen sizes. The project uses Tailwind CSS's responsive prefixes and follows a mobile-first approach.

## Breakpoints

### Tailwind Default Breakpoints

Tailwind CSS provides the following default breakpoints:

```typescript
// tailwind.config.ts
screens: {
  'sm': '640px',   // Small devices (landscape phones)
  'md': '768px',   // Medium devices (tablets)
  'lg': '1024px',  // Large devices (desktops)
  'xl': '1280px',  // Extra large devices
  '2xl': '1536px', // Extra extra large devices
}
```

### Custom Breakpoints

Add custom breakpoints if needed:

```typescript
// tailwind.config.ts
screens: {
  'xs': '475px',   // Extra small devices
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
  '3xl': '1920px', // Ultra-wide monitors
}
```

## Mobile-First Approach

### Design Philosophy

Follow a mobile-first approach: design for mobile devices first, then enhance for larger screens:

```typescript
// ✅ Good - mobile-first
<div className="w-full md:w-1/2 lg:w-1/3">
  Content
</div>

// ❌ Bad - desktop-first
<div className="w-1/3 md:w-1/2 lg:w-full">
  Content
</div>
```

### Responsive Patterns

Use responsive prefixes to adapt layouts:

```typescript
// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Flex layout
<div className="flex flex-col md:flex-row gap-4">
  <div>Left</div>
  <div>Right</div>
</div>

// Padding and spacing
<div className="p-4 md:p-6 lg:p-8">
  Content
</div>
```

Reference: [`src/components/layout/IDELayout.tsx`](../../src/components/layout/IDELayout.tsx)

## Layout Patterns

### IDE Layout

The IDE layout adapts to different screen sizes:

```typescript
export const IDELayout = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header - always visible */}
      <IDEHeaderBar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar - hidden on mobile, visible on md+ */}
        <aside className="hidden md:block w-64 border-r">
          <IconSidebar />
        </aside>
        
        {/* Main area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Editor and panels */}
          <div className="flex-1 flex flex-col lg:flex-row">
            <MonacoEditor />
            <AgentChatPanel />
          </div>
          
          {/* Terminal - collapsible */}
          <TerminalPanel />
        </main>
      </div>
    </div>
  );
};
```

Reference: [`src/components/layout/IDELayout.tsx`](../../src/components/layout/IDELayout.tsx)

### Responsive Navigation

Adapt navigation for different screen sizes:

```typescript
export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between p-4">
      {/* Logo */}
      <div className="text-xl font-bold">Via-gent</div>
      
      {/* Desktop navigation */}
      <ul className="hidden md:flex gap-6">
        <li><a href="/ide">IDE</a></li>
        <li><a href="/agents">Agents</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
      
      {/* Mobile menu button */}
      <button
        className="md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <MenuIcon />
      </button>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border">
          <ul className="flex flex-col p-4 gap-4">
            <li><a href="/ide">IDE</a></li>
            <li><a href="/agents">Agents</a></li>
            <li><a href="/settings">Settings</a></li>
          </ul>
        </div>
      )}
    </nav>
  );
};
```

### Resizable Panels

Use react-resizable-panels for flexible layouts:

```typescript
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

export const ResizableLayout = () => (
  <PanelGroup direction="horizontal" className="h-full">
    <Panel defaultSize={20} minSize={15} maxSize={30}>
      <FileTree />
    </Panel>
    <PanelResizeHandle className="w-1 bg-border hover:bg-primary" />
    <Panel defaultSize={50} minSize={30}>
      <MonacoEditor />
    </Panel>
    <PanelResizeHandle className="w-1 bg-border hover:bg-primary" />
    <Panel defaultSize={30} minSize={20}>
      <AgentChatPanel />
    </Panel>
  </PanelGroup>
);
```

Reference: [`src/components/ui/resizable.tsx`](../../src/components/ui/resizable.tsx)

## Component Responsiveness

### Monaco Editor

Adapt Monaco Editor for different screen sizes:

```typescript
export const MonacoEditor = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={containerRef} className="flex-1 min-h-0">
      <Monaco
        width={dimensions.width}
        height={dimensions.height}
        options={{
          minimap: { enabled: dimensions.width > 1024 },
          fontSize: dimensions.width < 768 ? 12 : 14,
        }}
      />
    </div>
  );
};
```

Reference: [`src/components/ide/MonacoEditor/MonacoEditor.tsx`](../../src/components/ide/MonacoEditor/MonacoEditor.tsx)

### Terminal

Adapt terminal for different screen sizes:

```typescript
export const XTerminal = ({ projectPath }: XTerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      fontSize: window.innerWidth < 768 ? 12 : 14,
      fontFamily: 'monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
    });

    term.open(terminalRef.current);
    // ... terminal initialization

    return () => {
      term.dispose();
    };
  }, []);

  return (
    <div ref={terminalRef} className="flex-1 min-h-0" />
  );
};
```

Reference: [`src/components/ide/XTerminal.tsx`](../../src/components/ide/XTerminal.tsx)

### File Tree

Adapt file tree for mobile:

```typescript
export const FileTree = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={cn(
      'border-r transition-all duration-300',
      isExpanded ? 'w-64' : 'w-12'
    )}>
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-2 w-full flex justify-center"
      >
        {isExpanded ? <ChevronLeft /> : <ChevronRight />}
      </button>
      
      {/* Tree content */}
      {isExpanded && (
        <div className="p-2">
          {files.map(file => (
            <FileTreeItem key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
};
```

Reference: [`src/components/ide/FileTree/FileTree.tsx`](../../src/components/ide/FileTree/FileTree.tsx)

## Typography

### Responsive Font Sizes

Use responsive font sizes:

```typescript
// Using Tailwind's responsive prefixes
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Title
</h1>

<p className="text-sm md:text-base lg:text-lg">
  Paragraph text
</p>
```

### Line Heights

Adjust line heights for readability:

```typescript
<p className="text-sm leading-relaxed md:text-base md:leading-normal lg:text-lg lg:leading-loose">
  Content
</p>
```

## Images and Media

### Responsive Images

Use responsive image techniques:

```typescript
<img
  src="/logo.png"
  alt="Logo"
  className="w-full max-w-xs md:max-w-md lg:max-w-lg"
  loading="lazy"
/>
```

### Video Embeds

Make video embeds responsive:

```typescript
<div className="aspect-video w-full">
  <iframe
    src="https://www.youtube.com/embed/..."
    className="w-full h-full"
    allowFullScreen
  />
</div>
```

## Forms

### Responsive Form Layouts

Adapt form layouts for different screen sizes:

```typescript
export const AgentConfigForm = () => (
  <form className="space-y-4 md:space-y-6">
    {/* Single column on mobile, two columns on md+ */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" type="text" className="w-full" />
      </div>
      <div>
        <label htmlFor="provider">Provider</label>
        <select id="provider" className="w-full">
          <option>OpenRouter</option>
          <option>Anthropic</option>
        </select>
      </div>
    </div>
    
    <button type="submit" className="w-full md:w-auto">
      Save
    </button>
  </form>
);
```

Reference: [`src/components/agent/AgentConfigDialog.tsx`](../../src/components/agent/AgentConfigDialog.tsx)

## Accessibility

### Touch Targets

Ensure touch targets are at least 44x44 pixels:

```typescript
<button className="min-h-[44px] min-w-[44px] p-2">
  <Icon />
</button>
```

### Responsive Focus Styles

Maintain visible focus styles across devices:

```typescript
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Button
</button>
```

### Viewport Meta Tag

Ensure proper viewport meta tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

Reference: [`src/index.html`](../../src/index.html)

## Performance

### Lazy Loading

Use lazy loading for heavy components:

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <HeavyComponent />
  </Suspense>
);
```

### Conditional Rendering

Render components only when needed:

```typescript
export const ResponsiveComponent = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
};
```

## Testing

### Responsive Testing

Test on various screen sizes:

```typescript
describe('ResponsiveLayout', () => {
  it('should render mobile layout on small screens', () => {
    window.innerWidth = 640;
    render(<ResponsiveLayout />);
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('should render desktop layout on large screens', () => {
    window.innerWidth = 1024;
    render(<ResponsiveLayout />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });
});
```

### Browser DevTools

Use browser DevTools for responsive testing:

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select device presets or custom dimensions
4. Test all breakpoints

## Best Practices

### 1. Use Relative Units

Prefer relative units over fixed units:

```typescript
// ✅ Good - relative units
<div className="w-full max-w-4xl px-4 md:px-8">

// ❌ Bad - fixed units
<div style={{ width: '1200px', padding: '32px' }}>
```

### 2. Test Real Devices

Test on real devices, not just emulators:

- iOS devices (iPhone, iPad)
- Android devices (various screen sizes)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

### 3. Consider Touch Interactions

Design for touch interactions on mobile:

```typescript
<button
  className="min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
>
  Touchable button
</button>
```

### 4. Optimize for Performance

Optimize images and assets for mobile:

```typescript
<img
  srcSet="/image-small.jpg 640w, /image-medium.jpg 1024w, /image-large.jpg 1920w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  src="/image-medium.jpg"
  alt="Responsive image"
  loading="lazy"
/>
```

## References

### Internal Documentation

- [`project-architecture-analysis-2025-12-27.md`](../../_bmad-output/documentation/project-architecture-analysis-2025-12-27.md) - Architecture analysis
- [`development-workflow-2025-12-27.md`](../../_bmad-output/documentation/development-workflow-2025-12-27.md) - Development workflow

### External Documentation

- **Tailwind CSS**: [https://tailwindcss.com/docs/responsive-design](https://tailwindcss.com/docs/responsive-design)
- **MDN Responsive Design**: [https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- **react-resizable-panels**: [https://react-resizable-panels.vercel.app](https://react-resizable-panels.vercel.app)

### Implementation Files

- [`src/components/layout/IDELayout.tsx`](../../src/components/layout/IDELayout.tsx) - IDE layout
- [`src/components/ide/MonacoEditor/`](../../src/components/ide/MonacoEditor/) - Monaco editor
- [`src/components/ide/XTerminal.tsx`](../../src/components/ide/XTerminal.tsx) - Terminal
- [`src/components/ide/FileTree/`](../../src/components/ide/FileTree/) - File tree
- [`src/components/ui/resizable.tsx`](../../src/components/ui/resizable.tsx) - Resizable panels

---

**Document Status**: Active
**Last Updated**: 2025-12-27T13:40:00Z
**Next Review**: 2026-01-27