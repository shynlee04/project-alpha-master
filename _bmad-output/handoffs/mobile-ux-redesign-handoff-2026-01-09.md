# Mobile UX Redesign - UX Designer to Developer Handoff

**Document Version**: 1.0.0  
**Date**: January 9, 2026  
**Status**: Ready for Implementation  
**Research Document**: `_bmad-output/research-artifacts/mobile-ux-redesign-research-2026-01-09.md`

---

## Executive Summary

This handoff document provides implementation specifications for mobile UX redesign of three critical components:

| Component | File | Priority | Effort |
|-----------|------|----------|--------|
| NotesPage Mobile Navigation | `src/presentation/components/notes/NotesPage.tsx` | P0-CRITICAL | 4h |
| KnowledgePage Mobile Navigation | `src/presentation/components/knowledge/KnowledgePage.tsx` | P0-CRITICAL | 4h |
| Responsive IDE Layout | `src/presentation/components/ide/IDEResizableLayout.tsx` | P0-CRITICAL | 8h |

---

## 1. NotesPage Mobile Implementation

### Current State Analysis
**File**: `src/presentation/components/notes/NotesPage.tsx`

**Issues Identified**:
- Desktop-only 3-pane layout (sidebar, file list, editor)
- No mobile-specific navigation
- Overflowing content on small screens

### Design Specification

#### Tab Structure
```
┌─────────────────────────────────┐
│  Notes          Search      +   │  ← Header with FAB
├─────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────┐ │
│  │  All    │ │ Favorites│ │Tags │ │  ← Tab Bar (3 tabs)
│  ├─────────┼ ├─────────┼ ├─────┤ │
│  │         │ │         │ │     │ │
│  │ Note    │ │ Note    │ │     │ │  ← Scrollable List
│  │ Cards   │ │ Cards   │ │     │ │
│  │         │ │         │ │     │ │
│  └─────────┘ └─────────┘ └─────┘ │
├─────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐  │  ← Bottom Tab Bar (3 items)
│  │ Files │ │Search │ │  AI   │  │
│  └───────┘ └───────┘ └───────┘  │
└─────────────────────────────────┘
```

#### Component Structure

```tsx
// src/presentation/components/notes/NotesMobileLayout.tsx

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, Search, Sparkles, FileText, Star, Tag } from 'lucide-react'

interface NotesMobileLayoutProps {
  children: React.ReactNode
}

// Tab configuration
const NOTES_TABS = [
  { id: 'all', label: 'All', icon: <FileText className="w-5 h-5" /> },
  { id: 'favorites', label: 'Favorites', icon: <Star className="w-5 h-5" /> },
  { id: 'tags', label: 'Tags', icon: <Tag className="w-5 h-5" /> },
] as const

// Bottom navigation tabs (separate from content tabs)
const BOTTOM_NAV_TABS = [
  { id: 'notes', label: 'Notes', icon: <Folder className="w-5 h-5" /> },
  { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
  { id: 'ai', label: 'AI', icon: <Sparkles className="w-5 h-5" /> },
] as const

export function NotesMobileLayout({ children }: NotesMobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [activeNav, setActiveNav] = useState<string>('notes')

  return (
    <div className="h-dvh flex flex-col bg-background">
      {/* Header - Fixed */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-border bg-card">
        <h1 className="text-lg font-bold">Notes</h1>
        <button className="p-2 rounded-none bg-primary text-primary-foreground">
          <FileText className="w-5 h-5" />
        </button>
      </header>

      {/* Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        {/* Content Tabs */}
        <div className="flex border-b border-border bg-muted/30">
          {NOTES_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="flex-shrink-0 h-16 border-t border-border bg-card">
        <div className="flex h-full max-w-md mx-auto">
          {BOTTOM_NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveNav(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                activeNav === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={`Navigate to ${tab.label}`}
            >
              <div className="relative">
                {tab.icon}
                {/* Active indicator */}
                {activeNav === tab.id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </div>
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
```

### Implementation Checklist

- [ ] Create `NotesMobileLayout.tsx` component
- [ ] Implement bottom navigation with 3 tabs (notes, search, AI)
- [ ] Implement content tabs (all, favorites, tags)
- [ ] Add Framer Motion transitions (200ms)
- [ ] Ensure 44px minimum touch targets
- [ ] Add badge indicators for notifications
- [ ] Integrate with existing NotesPage state
- [ ] Test responsive behavior (320px - 430px width)

---

## 2. KnowledgePage Mobile Implementation

### Current State Analysis
**File**: `src/presentation/components/knowledge/KnowledgePage.tsx`

**Issues Identified**:
- Desktop-first 2-pane layout (sidebar + content)
- Knowledge sources panel unusable on mobile
- Missing mobile navigation patterns

### Design Specification

#### Tab Structure
```
┌─────────────────────────────────┐
│  Knowledge          Sources +  │  ← Header
├─────────────────────────────────┤
│  ┌───────────┐ ┌─────────────┐  │
│  │  Browse   │ │  Collections│  │  ← Content Tabs
│  ├───────────┼ ├─────────────┤  │
│  │           │ │             │  │
│  │  Sources  │ │  Collections│  │  ← Scrollable Content
│  │  Grid     │ │    Grid     │  │
│  │           │ │             │  │
│  └───────────┘ └─────────────┘  │
├─────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐  │  ← Bottom Nav
│  │Browse │ │Search │ │  AI   │  │
│  └───────┘ └───────┘ └───────┘  │
└─────────────────────────────────┘
```

#### Component Implementation

```tsx
// src/presentation/components/knowledge/KnowledgeMobileLayout.tsx

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Library, Search, Sparkles, Grid, FolderOpen, FileText } from 'lucide-react'

interface KnowledgeMobileLayoutProps {
  children: React.ReactNode
}

// Content tabs specific to Knowledge
const KNOWLEDGE_CONTENT_TABS = [
  { id: 'browse', label: 'Browse', icon: <Grid className="w-5 h-5" /> },
  { id: 'collections', label: 'Collections', icon: <FolderOpen className="w-5 h-5" /> },
  { id: 'recent', label: 'Recent', icon: <FileText className="w-5 h-5" /> },
] as const

// Bottom navigation
const KNOWLEDGE_NAV_TABS = [
  { id: 'browse', label: 'Browse', icon: <Library className="w-5 h-5" /> },
  { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
  { id: 'ai', label: 'AI Chat', icon: <Sparkles className="w-5 h-5" /> },
] as const

export function KnowledgeMobileLayout({ children }: KnowledgeMobileLayoutProps) {
  const [activeContentTab, setActiveContentTab] = useState<string>('browse')
  const [activeNav, setActiveNav] = useState<string>('browse')

  return (
    <div className="h-dvh flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-border bg-card">
        <h1 className="text-lg font-bold">Knowledge</h1>
        <button className="p-2 rounded-none bg-primary text-primary-foreground">
          <Library className="w-5 h-5" />
        </button>
      </header>

      {/* Content Tabs */}
      <div className="flex border-b border-border bg-muted/30 overflow-x-auto">
        {KNOWLEDGE_CONTENT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveContentTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeContentTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <motion.div
          key={activeContentTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 h-16 border-t border-border bg-card">
        <div className="flex h-full max-w-md mx-auto">
          {KNOWLEDGE_NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveNav(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 ${
                activeNav === tab.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
```

### Implementation Checklist

- [ ] Create `KnowledgeMobileLayout.tsx` component
- [ ] Implement content tabs (browse, collections, recent)
- [ ] Implement bottom navigation (browse, search, AI)
- [ ] Add grid layout for sources display
- [ ] Integrate with existing KnowledgePage state
- [ ] Add collection management UI
- [ ] Test on various screen sizes

---

## 3. IDEResizableLayout Mobile Implementation

### Current State Analysis
**File**: `src/presentation/components/ide/IDEResizableLayout.tsx`

**Issues Identified**:
- Desktop-first resizable panels
- No mobile-responsive behavior
- Terminal and file tree unusable on mobile

### Design Specification

#### Mobile IDE Layout
```
┌─────────────────────────────────┐
│  IDE              [Menu]  [Run] │  ← Header with actions
├─────────────────────────────────┤
│  ┌─────────────────────────────────┐
│  │          Code Editor            │  ← Main content (70%)
│  │                                 │
│  │        (syntax highlighted)     │
│  │                                 │
│  └─────────────────────────────────┘
├─────────────────────────────────┤
│  [☰] Files    [>_] Terminal    │  ← Panel tabs
├─────────────────────────────────┤
│  ┌─────────────────────────────────┐
│  │                                 │  ← Collapsible Panel (30%)
│  │     File Tree / Terminal        │  (Bottom Sheet style)
│  │                                 │
│  │  📁 src/                        │
│  │    📁 components/               │
│  │      App.tsx                   │
│  │      Header.tsx                │
│  │                                 │
│  └─────────────────────────────────┘
└─────────────────────────────────┘
```

#### Component Implementation

```tsx
// src/presentation/components/ide/IDEMobileLayout.tsx

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, FileCode, Terminal, Menu, Play } from 'lucide-react'

interface IDEMobileLayoutProps {
  codeEditor: React.ReactNode
  fileTree: React.ReactNode
  terminal: React.ReactNode
}

type MobilePanel = 'files' | 'terminal' | null

export function IDEMobileLayout({ codeEditor, fileTree, terminal }: IDEMobileLayoutProps) {
  const [activePanel, setActivePanel] = useState<MobilePanel>('files')
  const [isPanelExpanded, setIsPanelExpanded] = useState(false)

  const PANEL_HEIGHT = {
    collapsed: 'h-12',      // 48px - tabs only
    partial: 'h-48',        // 192px - 30%
    expanded: 'h-[60%]',    // 60% of remaining space
  }

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      {/* IDE Header */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-none hover:bg-muted"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-mono text-sm font-bold">via-gent</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-none bg-green-600 text-white"
            aria-label="Run code"
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Run</span>
          </button>
        </div>
      </header>

      {/* Main Content - Code Editor */}
      <main className="flex-1 overflow-hidden relative">
        {codeEditor}
      </main>

      {/* Panel Container */}
      <div
        className={`flex-shrink-0 border-t border-border bg-card transition-all duration-300 ease-out ${
          isPanelExpanded ? PANEL_HEIGHT.expanded : activePanel ? PANEL_HEIGHT.partial : PANEL_HEIGHT.collapsed
        }`}
      >
        {/* Panel Handle / Drag Indicator */}
        <button
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
          className="w-full h-12 flex items-center justify-between px-4 touch-manipulation"
          aria-label={isPanelExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          {/* Panel Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setActivePanel('files')
                setIsPanelExpanded(true)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-medium transition-colors ${
                activePanel === 'files'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Files
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setActivePanel('terminal')
                setIsPanelExpanded(true)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-medium transition-colors ${
                activePanel === 'terminal'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Terminal
            </button>
          </div>

          {/* Expand/Collapse Icon */}
          <motion.div
            animate={{ rotate: isPanelExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </button>

        {/* Panel Content */}
        <AnimatePresence mode="wait">
          {activePanel && (
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="h-[calc(100%-48px)] overflow-hidden"
            >
              {activePanel === 'files' ? fileTree : terminal}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

### Panel Gestures

```tsx
// src/presentation/components/ide/hooks/usePanelGestures.ts

import { useState, useCallback, useRef } from 'react'

export function usePanelGestures(minHeight = 48, maxHeight = 400) {
  const [height, setHeight] = useState(192) // Default partial height
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef<number>(0)
  const startHeight = useRef<number>(0)

  const onDragStart = useCallback((y: number) => {
    setIsDragging(true)
    startY.current = y
    startHeight.current = height
  }, [height])

  const onDragMove = useCallback((y: number) => {
    if (!isDragging) return
    const delta = startY.current - y
    const newHeight = Math.min(maxHeight, Math.max(minHeight, startHeight.current + delta))
    setHeight(newHeight)
  }, [isDragging, maxHeight, minHeight])

  const onDragEnd = useCallback(() => {
    setIsDragging(false)
    // Snap to nearest snap point
    if (height < 150) {
      setHeight(minHeight)
    } else if (height > 300) {
      setHeight(maxHeight)
    }
  }, [height, minHeight, maxHeight])

  return {
    height,
    setHeight,
    isDragging,
    onDragStart,
    onDragMove,
    onDragEnd,
  }
}
```

### Implementation Checklist

- [ ] Create `IDEMobileLayout.tsx` component
- [ ] Implement collapsible bottom panel
- [ ] Add panel tabs (files, terminal)
- [ ] Implement drag gestures for panel resize
- [ ] Add snap points (collapsed, partial, expanded)
- [ ] Integrate with existing IDEResizableLayout
- [ ] Add virtual keyboard awareness
- [ ] Test file tree interaction on mobile
- [ ] Test terminal on mobile

---

## 4. Shared Components

### useResponsiveBreakpoint Hook

```tsx
// src/hooks/useResponsiveBreakpoint.ts

import { useState, useEffect } from 'react'

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export function useResponsiveBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth
      if (width < 768) {
        setBreakpoint('mobile')
      } else if (width < 1024) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }

    checkBreakpoint()
    window.addEventListener('resize', checkBreakpoint)
    return () => window.removeEventListener('resize', checkBreakpoint)
  }, [])

  return breakpoint
}
```

### MobileDetection Wrapper

```tsx
// src/presentation/components/common/MobileDetection.tsx

import { ReactNode } from 'react'
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint'

interface MobileDetectionProps {
  mobileOnly?: ReactNode
  desktopOnly?: ReactNode
  children: ReactNode
}

export function MobileDetection({ mobileOnly, desktopOnly, children }: MobileDetectionProps) {
  const breakpoint = useResponsiveBreakpoint()

  if (breakpoint === 'mobile' && mobileOnly) {
    return <>{mobileOnly}</>
  }

  if (breakpoint !== 'mobile' && desktopOnly) {
    return <>{desktopOnly}</>
  }

  return <>{children}</>
}
```

---

## 5. Implementation Timeline

| Phase | Tasks | Effort | Dependencies |
|-------|-------|--------|--------------|
| **Phase 1** | Shared hooks + detection components | 4h | None |
| **Phase 2** | NotesMobileLayout implementation | 8h | Phase 1 |
| **Phase 3** | KnowledgeMobileLayout implementation | 8h | Phase 1 |
| **Phase 4** | IDEMobileLayout implementation | 12h | Phase 1 |
| **Phase 5** | Integration + testing | 8h | Phases 2-4 |
| **Total** | | **40h (1 sprint)** | |

---

## 6. Testing Requirements

### Unit Tests
- `useResponsiveBreakpoint` hook tests
- `usePanelGestures` hook tests
- Tab state management tests

### Integration Tests
- Tab switching animations
- Panel drag gestures
- Responsive breakpoint detection
- State persistence across rotations

### Manual Testing
- [ ] iPhone SE (375px width)
- [ ] iPhone 14/15 (390-393px width)
- [ ] iPhone Pro Max (430px width)
- [ ] Portrait and landscape orientation
- [ ] Virtual keyboard appearance
- [ ] Touch gesture responsiveness
- [ ] Accessibility (VoiceOver/TalkBack)

---

## 7. Accessibility Requirements

### WCAG 2.1 AA Compliance
- [ ] All touch targets ≥44×44px
- [ ] Color contrast ratio ≥4.5:1
- [ ] Focus indicators visible
- [ ] Screen reader labels on all interactive elements
- [ ] Keyboard navigation support
- [ ] Reduced motion preference respected

### Platform Guidelines
- [ ] iOS VoiceOver compatible
- [ ] Android TalkBack compatible
- [ ] Material Design accessibility followed

---

## 8. Performance Requirements

- [ ] Initial render <100ms
- [ ] Tab switch animation <200ms
- [ ] Panel drag 60fps smooth
- [ ] Memory efficient (no memory leaks)
- [ ] Bundle size impact <50KB gzipped

---

## 9. Design Tokens

### Mobile-Specific Tokens

```css
/* src/styles/mobile-tokens.css */
@layer utilities {
  /* Touch target sizing */
  .touch-target-min {
    min-width: 44px;
    min-height: 44px;
  }

  /* Mobile-safe viewport height */
  .mobile-h-screen {
    height: 100dvh;
  }

  /* Mobile-safe padding */
  .mobile-p-safe {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }

  /* Bottom nav safe area */
  .mobile-pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

---

## 10. Dependencies Required

| Package | Version | description |
|---------|---------|---------|
| `framer-motion` | ^11.0.0 | Animations |
| `lucide-react` | ^0.300.0 | Icons |
| `@radix-ui/react-tabs` | ^1.0.0 | Accessible tabs |
| `@radix-ui/react-dialog` | ^1.0.0 | Bottom sheets |
| `react-use-gesture` | ^10.0.0 | Drag gestures |

---

## 11. File Changes Summary

### New Files to Create
```
src/presentation/components/notes/
├── NotesMobileLayout.tsx
└── index.ts (export)

src/presentation/components/knowledge/
├── KnowledgeMobileLayout.tsx
└── index.ts (export)

src/presentation/components/ide/
├── IDEMobileLayout.tsx
├── hooks/
│   ├── usePanelGestures.ts
│   └── useResponsiveBreakpoint.ts
└── index.ts (export)

src/presentation/components/common/
├── MobileDetection.tsx
└── index.ts (export)

src/hooks/
├── useResponsiveBreakpoint.ts
└── usePanelGestures.ts

src/styles/
└── mobile-tokens.css
```

### Files to Modify
```
src/presentation/components/notes/NotesPage.tsx
src/presentation/components/knowledge/KnowledgePage.tsx
src/presentation/components/ide/IDEResizableLayout.tsx
src/presentation/layout/IDELayout.tsx
src/i18n/en.json (new mobile keys)
src/i18n/vi.json (new mobile keys)
```

---

## 12. Sign-off Checklist

- [ ] UX Designer approval
- [ ] Product Manager approval
- [ ] Accessibility review passed
- [ ] Performance benchmarks met
- [ ] Cross-device testing complete
- [ ] Bundle size analysis complete

---

**Document Prepared By**: BMAD UX Designer Agent  
**Research Document**: `_bmad-output/research-artifacts/mobile-ux-redesign-research-2026-01-09.md`  
**Implementation Start**: Upon approval
