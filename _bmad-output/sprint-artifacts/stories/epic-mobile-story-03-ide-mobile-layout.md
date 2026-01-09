# Story: MOBILE-03 - IDE Mobile Layout with Bottom Sheet Panels

**Epic:** EPIC-MOBILE (Mobile UX Integration)
**Story ID:** MOBILE-03
**Priority:** P1
**Effort:** 4h
**Points:** 8
**Status:** drafted
**Created:** 2026-01-09

---

## User Story

**As a** mobile user accessing the IDE workspace  
**I want** a touch-optimized mobile layout with bottom sheet panels for file explorer, terminal, and chat  
**So that** I can efficiently develop code on my phone without the desktop-oriented interface cluttering my view

---

## Background

### Context from Research

1. **Existing Mobile Components:**
   - `MobileIDELayout.tsx` exists at `src/presentation/components/layout/` (331 lines)
   - Uses tab-based panel switching (Files, Editor, Preview, Terminal, Chat)
   - `MobileTabBar` component provides bottom navigation

2. **Mobile Layout Patterns (Already Established):**
   - `NotesMobileLayout.tsx` (258 lines) - Bottom nav + content tabs
   - `KnowledgeMobileLayout.tsx` (335 lines) - Bottom nav + content tabs
   - Both use Framer Motion for transitions (200ms)
   - 44px minimum touch targets (WCAG 2.5.5)
   - `h-dvh` viewport sizing for mobile

3. **Current MobileIDELayout Features:**
   - Tab-based panel switching
   - Single-panel focus mode
   - State persistence via `useMobilePanel` hook
   - Lazy-loaded panels (FileTree, MonacoEditor, PreviewPanel, TerminalPanel, ChatPanelWrapper)
   - Error boundaries per panel
   - Loading skeletons

### Story Alignment

This story creates a dedicated `IDEMobileLayout` component following the established mobile layout pattern, ensuring consistency across all workspaces and proper barrel export for the IDE component namespace.

---

## Acceptance Criteria

### AC-01: IDEMobileLayout Component Created
- [ ] Create `src/presentation/components/ide/IDEMobileLayout.tsx`
- [ ] Component follows pattern established by `NotesMobileLayout` and `KnowledgeMobileLayout`
- [ ] Uses `h-dvh` for mobile viewport sizing
- [ ] Implements 44px minimum touch targets (WCAG 2.5.5)
- [ ] No glassmorphism - solid 8-bit design system

### AC-02: Bottom Sheet Panel Navigation
- [ ] Implement bottom sheet-style panel switching instead of tab bar
- [ ] Panels: Files, Editor, Terminal, Chat (4 core panels)
- [ ] Preview accessible via editor overflow menu
- [ ] Smooth slide transitions (200ms, Framer Motion)
- [ ] Panel state persists across navigation

### AC-03: Bottom Navigation Bar
- [ ] Create `MobileIDE_bottomNav.tsx` component
- [ ] 4 nav items: Files | Terminal | Chat | Settings
- [ ] Active state indicator (primary color)
- [ ] Badge support for notification counts
- [ ] Touch targets ≥44px

### AC-04: Panel Content Areas
- [ ] Files panel: File tree with swipe-to-navigate
- [ ] Editor panel: Monaco Editor with mobile optimizations
- [ ] Terminal panel: Terminal with touch-optimized input
- [ ] Chat panel: AI chat interface

### AC-05: Integration with IDELayout
- [ ] Add barrel export in `src/presentation/components/ide/index.ts`
- [ ] Mobile detection uses existing `useResponsive` hook
- [ ] `IDELayoutMain.tsx` conditionally renders `IDEMobileLayout` for mobile

### AC-06: TypeScript Verification
- [ ] Zero new TypeScript errors
- [ ] All interfaces properly typed
- [ ] Props documented with TSDoc

### AC-07: Code Review
- [ ] Follows 8-bit design system
- [ ] No hardcoded strings (i18n audit passed)
- [ ] Accessibility: ARIA labels, keyboard navigation
- [ ] Component ≤300 lines (slice pattern)

---

## Tasks

- [ ] **T1: Create IDEMobileLayout.tsx component structure**
  - Import React, hooks, icons
  - Define interface IDEMobileLayoutProps
  - Create base layout with h-dvh
- [ ] **T2: Implement bottom sheet panel state**
  - Create useIDEMobilePanel hook
  - State for active panel (files, editor, terminal, chat)
  - Persist to localStorage
- [ ] **T3: Create MobileIDE_bottomNav component**
  - 4 nav items with icons
  - Active state styling
  - Touch target ≥44px
- [ ] **T4: Implement panel content areas**
  - Files panel wrapper
  - Editor panel wrapper
  - Terminal panel wrapper
  - Chat panel wrapper
- [ ] **T5: Add Framer Motion transitions**
  - Panel slide animations (200ms)
  - Enter/exit transitions
  - LayoutId for shared element transitions
- [ ] **T6: Update IDE barrel exports**
  - Add IDEMobileLayout to ide/index.ts
  - Update IDE component documentation
- [ ] **T7: Integrate with IDELayoutMain**
  - Conditional rendering for mobile
  - Test responsive breakpoints
- [ ] **T8: TypeScript verification**
  - Run `pnpm typecheck`
  - Fix any new errors
- [ ] **T9: Code review pass**
  - Self-review against acceptance criteria
  - Request formal review

---

## Research Requirements

### R1: Radix UI Bottom Sheet
- [ ] Query Context7 for Radix UI Dialog/Sheet patterns
- [ ] Determine if Radix Sheet is appropriate or custom solution
- [ ] Document pattern for panel transitions

### R2: Mobile IDE UX Patterns
- [ ] Search DeepWiki for mobile IDE examples
- [ ] Look at VS Code Mobile, GitHub Codespaces Mobile
- [ ] Document recommended interactions

### R3: Framer Motion Panel Transitions
- [ ] Query Context7 for Framer Motion layout animations
- [ ] Document slide transition pattern
- [ ] Verify performance on mobile devices

---

## Dev Notes

### Architecture Patterns

**Component Structure:**
```
src/presentation/components/ide/
├── IDEMobileLayout.tsx       # Main mobile IDE layout (NEW)
├── IDEMobilePanels.tsx       # Panel content wrappers (NEW)
├── MobileIDE_bottomNav.tsx   # Bottom navigation (NEW)
└── index.ts                  # Updated barrel exports

src/presentation/components/layout/
└── MobileIDELayout.tsx       # EXISTING - Reference for patterns
```

**Props Interface:**
```typescript
interface IDEMobileLayoutProps {
  /** Project ID for state management */
  projectId: string
  /** Active panel (controlled) */
  activePanel?: MobileIDEPanel
  /** Panel change callback */
  onPanelChange?: (panel: MobileIDEPanel) => void
  /** Show/hide header */
  showHeader?: boolean
  /** Custom header content */
  headerContent?: React.ReactNode
}

type MobileIDEPanel = 'files' | 'editor' | 'terminal' | 'chat'
```

**State Management:**
```typescript
// useIDEMobilePanel hook pattern (from MobileIDELayout.tsx)
function useIDEMobilePanel(defaultPanel: MobileIDEPanel) {
  const [panel, setPanel] = useState<MobileIDEPanel>(
    () => (typeof window !== 'undefined'
      ? (localStorage.getItem('mobile-ide-panel') as MobileIDEPanel) || defaultPanel
      : defaultPanel)
  )

  useEffect(() => {
    localStorage.setItem('mobile-ide-panel', panel)
  }, [panel])

  return [panel, setPanel] as const
}
```

**Bottom Navigation Pattern:**
```typescript
// MobileIDE_bottomNav.tsx
const BOTTOM_NAV_TABS = [
  { id: 'files', label: 'Files', icon: <Folder className="w-5 h-5" /> },
  { id: 'terminal', label: 'Terminal', icon: <Terminal className="w-5 h-5" /> },
  { id: 'chat', label: 'AI Chat', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
] as const
```

### Design System Compliance

- **8-bit aesthetic**: No glassmorphism, solid backgrounds only
- **Touch targets**: Minimum 44px (WCAG 2.5.5)
- **Viewport**: `h-dvh` for mobile browsers with dynamic viewport
- **Colors**: `bg-background`, `bg-card`, `text-primary`, `border-border`
- **Animations**: 200ms Framer Motion transitions
- **Icons**: Lucide React icons (consistent with existing components)

### Dependencies

- `framer-motion` - Already in use by NotesMobileLayout/KnowledgeMobileLayout
- `lucide-react` - Already in use
- `@radix-ui/react-dialog` - Optional for sheet patterns
- `zustand` - Already in use for IDE state

---

## Research Notes

<research_notes>
  <!-- To be populated during development -->
</research_notes>

---

## References

### Files

| File | Purpose |
|------|---------|
| `src/presentation/components/layout/MobileIDELayout.tsx` | Reference implementation |
| `src/presentation/components/notes/NotesMobileLayout.tsx` | Pattern reference |
| `src/presentation/components/knowledge/KnowledgeMobileLayout.tsx` | Pattern reference |
| `src/presentation/components/layout/MobileTabBar.tsx` | Existing bottom nav |
| `src/presentation/components/ide/index.ts` | IDE barrel exports |

### Documentation

- UX Specification Section 6 (Mobile Responsiveness)
- CLAUDE.md - Component size limits (≤300 lines)
- `_bmad-output/handoffs/mobile-integration-complete-2026-01-09.md`

---

## Dev Agent Record

**Agent:** 
**Session:** 

#### Task Progress:
- [ ] T1: 
- [ ] T2: 
- [ ] T3: 
- [ ] T4: 
- [ ] T5: 
- [ ] T6: 
- [ ] T7: 
- [ ] T8: 
- [ ] T9: 

#### Research Executed:
- Context7: 
- DeepWiki: 

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| | | |

#### Tests Created:
- 

#### Decisions Made:
- 

---

## Code Review

**Reviewer:** 
**Date:** 

#### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

#### Issues Found:
- 

#### Sign-off:
✅ APPROVED / ❌ CHANGES REQUESTED

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2026-01-09 | drafted | Story created |
|  |  |  |
|  |  |  |

---

*Generated 2026-01-09 by BMAD Story Development Cycle*
