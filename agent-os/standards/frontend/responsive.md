---
date: '2025-12-31'
time: '03:50:00'
phase: 'Implementation'
team: 'Team-A'
agent_mode: 'bmad-core-bmad-master'
---

# Frontend Responsive Design Standards

_Standards for creating responsive layouts that adapt across desktop, tablet, and mobile devices. This document defines breakpoint strategies, responsive patterns, mobile-first development, and the responsive design implementation for the Via-gent IDE._

---

## 1. Responsive Design Strategy Overview

### 1.1 Core Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Mobile-First** | Design for mobile first, then enhance for larger screens | CSS min-width queries |
| **Progressive Enhancement** | Core functionality works everywhere | Feature detection with graceful degradation |
| **Content-Driven** | Layout adapts to content, not fixed breakpoints | Flexible units, intrinsic design |
| **Touch-Friendly** | Mobile targets are 44x44px minimum | Finger-friendly interactive elements |
| **Viewport Stability** | Use `dvh` instead of `vh` | Prevents layout jumps on mobile browsers |
| **Input Zoom Prevention** | Mobile inputs must be `16px` (`text-base`) | Prevents iOS auto-zoom on focus |

### 1.2 Device Target Matrix

| Target | Viewport | Priority | Use Case |
|--------|----------|----------|----------|
| **Mobile** | < 768px | P1 | Primary mobile experience |
| **Tablet** | 768px - 1024px | P1 | Tablet optimization |
| **Desktop** | 1024px - 1440px | P0 | Primary desktop experience |
| **Large Desktop** | > 1440px | P2 | Wide screen optimization |

---

## 2. Breakpoint System

### 2.1 Standard Breakpoints

```css
/* src/styles/breakpoints.css */

/* === Breakpoint Tokens === */
:root {
  /* Mobile-first: base styles apply to all */
  /* Then add min-width queries for larger screens */
  
  /* Tablet */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  
  /* Desktop */
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  
  /* Large Desktop */
  --breakpoint-2xl: 1536px;
}

/* === Tailwind Breakpoint Aliases === */
/*
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1536px
*/
```

### 2.2 Breakpoint Usage Pattern

```typescript
// Mobile-first: Base styles first
.button {
  padding: 8px 16px;
  font-size: 14px;
}

// Tablet and up
@media (min-width: 768px) {
  .button {
    padding: 10px 20px;
    font-size: 16px;
  }
}

// Desktop and up
@media (min-width: 1024px) {
  .button {
    padding: 12px 24px;
    font-size: 16px;
  }
}
```

---

## 3. Responsive Hook

### 3.1 useResponsive Hook

```typescript
// src/hooks/useResponsive.ts
import { useMediaQuery } from './useMediaQuery';

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveState {
  // Breakpoint matches
  isMobile: boolean;      // < 768px
  isTablet: boolean;      // 768px - 1024px
  isDesktop: boolean;     // >= 1024px
  isLargeDesktop: boolean; // >= 1280px
  
  // Current breakpoint
  breakpoint: Breakpoint;
  
  // Window dimensions
  width: number;
  height: number;
  
  // Orientation
  orientation: 'portrait' | 'landscape';
}

export function useResponsive(): ResponsiveState {
  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isXl = useMediaQuery('(min-width: 1280px)');
  const is2Xl = useMediaQuery('(min-width: 1536px)');
  
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [height, setHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 768);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const orientation = width > height ? 'landscape' : 'portrait';

  // Determine current breakpoint
  let breakpoint: Breakpoint = 'sm';
  if (is2Xl) breakpoint = '2xl';
  else if (isXl) breakpoint = 'xl';
  else if (isLg) breakpoint = 'lg';
  else if (isMd) breakpoint = 'md';
  else if (isSm) breakpoint = 'sm';

  return {
    isMobile: !isMd,
    isTablet: isMd && !isLg,
    isDesktop: isLg,
    isLargeDesktop: isXl,
    breakpoint,
    width,
    height,
    orientation,
  };
}
```

### 3.2 useMediaQuery Hook

```typescript
// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
```

---

## 4. Responsive Component Patterns

### 4.1 Layout Component with Responsive

```typescript
// src/components/layout/IDELayout.tsx
import { useResponsive } from '@/hooks/useResponsive';
import { MobileIDELayout } from './MobileIDELayout';
import { DesktopIDELayout } from './DesktopIDELayout';

export function IDELayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return <MobileIDELayout>{children}</MobileIDELayout>;
  }

  return <DesktopIDELayout>{children}</DesktopIDELayout>;
}
```

### 4.2 Responsive Sidebar Pattern

```typescript
// src/components/ide/ExplorerPanel.tsx
import { useState } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

export function ExplorerPanel() {
  const { isDesktop, breakpoint } = useResponsive();
  const [collapsed, setCollapsed] = useState(!isDesktop);

  // Mobile: collapsible drawer
  if (!isDesktop) {
    return (
      <Drawer open={!collapsed} onClose={() => setCollapsed(true)}>
        <DrawerContent>
          <ExplorerContent />
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: resizable panel
  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayoutChange={(sizes: number[]) => {
        if (sizes[0] < 20) setCollapsed(true);
        else setCollapsed(false);
      }}
    >
      <ResizablePanel defaultSize={20} minSize={15}>
        {collapsed ? (
          <CollapsedSidebar onExpand={() => setCollapsed(false)} />
        ) : (
          <ExplorerContent />
        )}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80}>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
```

### 4.3 Responsive Typography

```css
/* src/styles/typography-responsive.css */

/* Base typography (mobile) */
.text-xs { font-size: 11px; }
.text-sm { font-size: 12px; }
.text-base { font-size: 14px; }
.text-lg { font-size: 16px; }
.text-xl { font-size: 18px; }
.text-2xl { font-size: 20px; }
.text-3xl { font-size: 24px; }

/* Tablet */
@media (min-width: 768px) {
  .text-xs { font-size: 11px; }
  .text-sm { font-size: 12px; }
  .text-base { font-size: 14px; }
  .text-lg { font-size: 18px; }
  .text-xl { font-size: 20px; }
  .text-2xl { font-size: 24px; }
  .text-3xl { font-size: 30px; }
}

/* Desktop */
@media (min-width: 1024px) {
  .text-xs { font-size: 11px; }
  .text-sm { font-size: 12px; }
  .text-base { font-size: 14px; }
  .text-lg { font-size: 16px; }
  .text-xl { font-size: 18px; }
  .text-2xl { font-size: 24px; }
  .text-3xl { font-size: 30px; }
  .text-4xl { font-size: 36px; }
}

### 4.5 Mobile Input Typography
To prevent iOS from zooming in when an input is focused, the font size must be at least 16px (`text-base`). Use `text-base md:text-sm` pattern:

```tsx
<input 
  className="text-base md:text-sm ..."
/>
```
```

### 4.4 Responsive Spacing

```css
/* src/styles/spacing-responsive.css */

/* Base spacing scale */
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.gap-6 { gap: 24px; }
.gap-8 { gap: 32px; }

.p-1 { padding: 4px; }
.p-2 { padding: 8px; }
.p-3 { padding: 12px; }
.p-4 { padding: 16px; }
.p-6 { padding: 24px; }
.p-8 { padding: 32px; }

/* Tablet and up - increase spacing */
@media (min-width: 768px) {
  .md\:gap-1 { gap: 4px; }
  .md\:gap-2 { gap: 12px; }
  .md\:gap-3 { gap: 16px; }
  .md\:gap-4 { gap: 20px; }
  .md\:gap-6 { gap: 32px; }
  .md\:gap-8 { gap: 40px; }
  
  .md\:p-1 { padding: 8px; }
  .md\:p-2 { padding: 12px; }
  .md\:p-3 { padding: 16px; }
  .md\:p-4 { padding: 20px; }
  .md\:p-6 { padding: 32px; }
  .md\:p-8 { padding: 40px; }
}
```

---

## 5. Mobile-Specific Components

### 5.1 Mobile Layout

```typescript
// src/components/layout/MobileIDELayout.tsx
import { useState } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { MobileNavBar } from '@/components/layout/MobileNavBar';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { ErrorState } from '@/components/ui/ErrorState';

export function MobileIDELayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<'editor' | 'terminal' | 'chat' | 'files'>('editor');
  const [showMobileNav, setShowMobileNav] = useState(false);

  // WebContainer features not supported on mobile
  const capabilities = detectCapabilities();
  
  if (!capabilities.webContainer) {
    return (
      <div className="mobile-layout">
        <ErrorState
          title="Desktop Required"
          message="This feature requires a desktop browser with WebContainer support."
          actions={
            <Button onClick={() => window.location.reload()}>
              Reload
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mobile-layout">
      {/* Top navigation bar */}
      <MobileNavBar
        onMenuClick={() => setShowMobileNav(true)}
        currentTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main content area */}
      <main className="mobile-content">
        {activeTab === 'editor' && children}
        {activeTab === 'terminal' && <TerminalPanel />}
        {activeTab === 'chat' && <AgentChatPanel />}
        {activeTab === 'files' && <FileExplorerPanel />}
      </main>

      {/* Bottom tab bar */}
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Slide-out navigation drawer */}
      <Drawer open={showMobileNav} onClose={() => setShowMobileNav(false)}>
        <DrawerContent position="left">
          <MobileNavMenu onClose={() => setShowMobileNav(false)} />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
```

### 5.2 Mobile Navigation Bar

```typescript
// src/components/layout/MobileNavBar.tsx
import { Button } from '@/components/ui/Button';
import { MenuIcon, SearchIcon, SettingsIcon } from '@/components/ui/icons';

interface MobileNavBarProps {
  onMenuClick: () => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileNavBar({ onMenuClick, currentTab, onTabChange }: MobileNavBarProps) {
  return (
    <header className="mobile-navbar">
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <MenuIcon />
        <span className="sr-only">Menu</span>
      </Button>

      <nav className="mobile-tab-nav" role="tablist" aria-label="Main tabs">
        <button
          role="tab"
          aria-selected={currentTab === 'editor'}
          onClick={() => onTabChange('editor')}
          className={cn('mobile-tab', { active: currentTab === 'editor' })}
        >
          Editor
        </button>
        <button
          role="tab"
          aria-selected={currentTab === 'terminal'}
          onClick={() => onTabChange('terminal')}
          className={cn('mobile-tab', { active: currentTab === 'terminal' })}
        >
          Terminal
        </button>
        <button
          role="tab"
          aria-selected={currentTab === 'chat'}
          onClick={() => onTabChange('chat')}
          className={cn('mobile-tab', { active: currentTab === 'chat' })}
        >
          Chat
        </button>
      </nav>

      <div className="mobile-actions">
        <Button variant="ghost" size="icon">
          <SearchIcon />
          <span className="sr-only">Search</span>
        </Button>
        <Button variant="ghost" size="icon">
          <SettingsIcon />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </header>
  );
}
```

---

## 6. Touch Interaction Standards

### 6.1 Touch Target Sizes

```css
/* src/styles/touch-targets.css */

/* === Minimum Touch Targets (44x44px) === */

/* Interactive elements */
button,
[role="button"],
input[type="checkbox"],
input[type="radio"],
a {
  min-height: 44px;
  min-width: 44px;
}

/* Icon buttons */
.icon-button {
  width: 44px;
  height: 44px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Smaller touch targets for dense UI */
.touch-target-sm {
  min-height: 36px;
  min-width: 36px;
}

/* Touch-friendly spacing */
.touch-friendly {
  padding: 12px 16px;
  gap: 12px;
}

/* List items */
.list-item {
  padding: 12px 16px;
  min-height: 48px;
}

/* Menu items */
.menu-item {
  padding: 12px 16px;
  min-height: 48px;
}
```

### 6.2 Touch Gesture Support

```typescript
// src/hooks/useTouchGestures.ts
import { useCallback, useRef } from 'react';

interface GestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
}

export function useTouchGestures(elementRef: React.RefObject<HTMLElement>, callbacks: GestureCallbacks) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const pinchDistanceRef = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      pinchDistanceRef.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDistanceRef.current !== null) {
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = currentDistance / pinchDistanceRef.current;
      callbacks.onPinch?.(scale);
    }
  }, [callbacks]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartRef.current && e.changedTouches.length === 1) {
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
      
      const deltaX = touchEnd.x - touchStartRef.current.x;
      const deltaY = touchEnd.y - touchStartRef.current.y;
      const minSwipeDistance = 50;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            callbacks.onSwipeRight?.();
          } else {
            callbacks.onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            callbacks.onSwipeDown?.();
          } else {
            callbacks.onSwipeUp?.();
          }
        }
      }
      
      touchStartRef.current = null;
    }
    
    if (e.touches.length === 0) {
      pinchDistanceRef.current = null;
    }
  }, [callbacks]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
```

---

## 7. Responsive Grid Layouts

### 7.1 Responsive Grid System

```css
/* src/styles/grid-responsive.css */

/* === Auto-Responsive Grid === */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Tablet: 2 columns */
@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

/* Large Desktop: 4 columns */
@media (min-width: 1280px) {
  .responsive-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
}

/* === Auto-fit Grid === */
.auto-fit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

/* === Masonry-style Grid === */
.masonry-grid {
  column-count: 1;
  column-gap: 16px;
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 16px;
}

@media (min-width: 768px) {
  .masonry-grid {
    column-count: 2;
    column-gap: 20px;
  }
}

@media (min-width: 1024px) {
  .masonry-grid {
    column-count: 3;
    column-gap: 24px;
  }
}
```

### 7.2 Panel Layout Responsive

```typescript
// src/components/ide/PanelLayout.tsx
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { useResponsive } from '@/hooks/useResponsive';

interface PanelLayoutProps {
  explorer: React.ReactNode;
  editor: React.ReactNode;
  chat: React.ReactNode;
  terminal: React.ReactNode;
}

export function PanelLayout({ explorer, editor, chat, terminal }: PanelLayoutProps) {
  const { isMobile, isTablet } = useResponsive();

  // Mobile: Stacked layout
  if (isMobile) {
    return (
      <div className="mobile-panel-layout">
        {editor}
        {terminal}
      </div>
    );
  }

  // Tablet: Side-by-side editor and chat
  if (isTablet) {
    return (
      <PanelGroup direction="horizontal">
        <Panel defaultSize={60} minSize={40}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={70} minSize={30}>
              {editor}
            </Panel>
            <PanelResizeHandle className="resize-handle-horizontal" />
            <Panel defaultSize={30} minSize={20}>
              {terminal}
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="resize-handle-vertical" />
        <Panel defaultSize={40} minSize={25}>
          {chat}
        </Panel>
      </PanelGroup>
    );
  }

  // Desktop: Full 3-column + terminal
  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={20} minSize={15} maxSize={30}>
        {explorer}
      </Panel>
      <PanelResizeHandle className="resize-handle-vertical" />
      <Panel defaultSize={45} minSize={30}>
        <PanelGroup direction="vertical">
          <Panel defaultSize={70} minSize={30}>
            {editor}
          </Panel>
          <PanelResizeHandle className="resize-handle-horizontal" />
          <Panel defaultSize={30} minSize={15}>
            {terminal}
          </Panel>
        </PanelGroup>
      </Panel>
      <PanelResizeHandle className="resize-handle-vertical" />
      <Panel defaultSize={35} minSize={20}>
        {chat}
      </Panel>
    </PanelGroup>
  );
}
```

---

## 8. Print Styles

### 8.1 Print Responsive

```css
/* src/styles/print.css */

/* === Print Styles === */
@media print {
  /* Hide interactive elements */
  .no-print,
  button,
  [role="button"],
  nav,
  .sidebar,
  .terminal-panel {
    display: none !important;
  }

  /* Reset colors for print */
  * {
    color: black !important;
    background: white !important;
  }

  /* Use readable font sizes */
  body {
    font-size: 12pt;
    line-height: 1.5;
  }

  h1 {
    font-size: 24pt;
  }

  h2 {
    font-size: 18pt;
  }

  h3 {
    font-size: 14pt;
  }

  code {
    font-family: 'Courier New', monospace;
    font-size: 10pt;
  }

  /* Expand collapsible sections */
  details,
  [aria-expanded="false"] {
    display: block !important;
  }

  /* Page breaks */
  pre,
  code,
  .code-block {
    page-break-inside: avoid;
  }

  h1,
  h2,
  h3 {
    page-break-after: avoid;
  }

  /* Adjust layout for print */
  main {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}
```

---

## 9. Accessibility in Responsive

### 9.1 Responsive Focus Management

```typescript
// src/hooks/useResponsiveFocus.ts
import { useEffect, useRef } from 'react';
import { useResponsive } from './useResponsive';

export function useResponsiveFocus(triggerRef: React.RefObject<HTMLElement>) {
  const { isMobile, isDesktop } = useResponsive();
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    // When switching from desktop to mobile
    if (isMobile && previousActiveElement.current) {
      // Focus moved to a reasonable default
      const mainContent = document.querySelector('[role="main"]');
      if (mainContent) {
        (mainContent as HTMLElement).focus();
      }
    }

    // When switching from mobile to desktop
    if (isDesktop && triggerRef.current) {
      // Restore focus to the triggering element
      (triggerRef.current as HTMLElement).focus();
    }
  }, [isMobile, isDesktop, triggerRef]);

  const saveFocus = () => {
    previousActiveElement.current = document.activeElement;
  };

  return { saveFocus };
}
```

### 9.2 Responsive ARIA Attributes

```typescript
// src/components/responsive/ResponsiveAria.tsx
import { useResponsive } from '@/hooks/useResponsive';

export function useResponsiveAria() {
  const { isMobile, breakpoint } = useResponsive();

  return {
    // Label for the current layout
    layoutLabel: isMobile ? 'mobile' : breakpoint,

    // ARIA live region for responsive changes
    liveRegion: {
      'aria-live': 'polite',
      'aria-atomic': 'true',
    },

    // Role for the current navigation pattern
    navRole: isMobile ? 'navigation' : 'banner',

    // Touch-friendly touch targets
    touchTargetSize: isMobile ? '44px' : '36px',
  };
}
```

---

## Related Documents

- [`css.md`](css.md): Styling standards
- [`components.md`](components.md): Component patterns
- [`accessibility.md`](accessibility.md): Accessibility requirements
- [`global/coding-style.md`](../global/coding-style.md): Code patterns
- [`src/hooks/useResponsive.ts`](../../src/hooks/useResponsive.ts): Responsive hook

---

*Last updated: 2025-12-31*
*Maintained by: @bmad-core-bmad-master*
*Next review: 2026-01-15*
