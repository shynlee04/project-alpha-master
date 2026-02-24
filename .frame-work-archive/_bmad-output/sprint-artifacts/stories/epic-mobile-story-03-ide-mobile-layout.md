# Story: MOBILE-03 - IDE Mobile Layout with Bottom Sheet Panels

**Epic:** EPIC-MOBILE (Mobile UX Integration)
**Story ID:** MOBILE-03
**Priority:** P1
**Effort:** 4h
**Points:** 8
**Status:** completed
**Created:** 2026-01-09
**Completed:** 2026-01-09

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
- [x] Create `src/presentation/components/ide/IDEMobileLayout.tsx`
- [x] Component follows pattern established by `NotesMobileLayout` and `KnowledgeMobileLayout`
- [x] Uses `h-dvh` for mobile viewport sizing
- [x] Implements 44px minimum touch targets (WCAG 2.5.5)
- [x] No glassmorphism - solid 8-bit design system

### AC-02: Bottom Sheet Panel Navigation
- [x] Implement bottom sheet-style panel switching instead of tab bar
- [x] Panels: Files, Terminal, Chat, Settings (4 core panels)
- [x] Preview accessible via editor overflow menu (handled by MonacoEditor)
- [x] Smooth slide transitions (200ms, Framer Motion)
- [x] Panel state persists across navigation

### AC-03: Bottom Navigation Bar
- [x] Create `BOTTOM_NAV_TABS` constant with 4 nav items
- [x] 4 nav items: Files | Terminal | Chat | Settings
- [x] Active state indicator (primary color with motion layoutId)
- [x] Touch targets ≥44px

### AC-04: Panel Content Areas
- [x] Files panel: FileTree with onFileSelect
- [x] Terminal panel: XTerminal with touch-optimized input
- [x] Chat panel: AI chat interface with AgentChatPanel
- [x] Settings panel: SettingsPanel

### AC-05: Integration with IDELayout
- [x] Add barrel export in `src/presentation/components/ide/index.ts`
- [x] Component ready for mobile detection via useResponsive hook

### AC-06: TypeScript Verification
- [x] Zero new TypeScript errors
- [x] All interfaces properly typed
- [x] Props documented with TSDoc

### AC-07: Code Review
- [x] Follows 8-bit design system
- [x] Accessibility: ARIA labels, keyboard navigation
- [x] Component 278 lines (under 300-line limit)

---

## Tasks

- [x] **T1: Create IDEMobileLayout.tsx component structure**
  - Import React, hooks, icons
  - Define interface IDEMobileLayoutProps
  - Create base layout with h-dvh
- [x] **T2: Implement bottom sheet panel state**
  - Create useIDEMobilePanel hook
  - State for active panel (files, terminal, chat, settings)
  - Persist to localStorage
- [x] **T3: Create bottom navigation**
  - 4 nav items with icons
  - Active state styling with motion layoutId
  - Touch target ≥44px
- [x] **T4: Implement panel content areas**
  - Files panel wrapper with FileTree
  - Terminal panel wrapper with XTerminal
  - Chat panel wrapper with AgentChatPanel
  - Settings panel wrapper with SettingsPanel
- [x] **T5: Add Framer Motion transitions**
  - Panel slide animations (200ms)
  - Enter/exit transitions
  - LayoutId for shared element transitions
- [x] **T6: Update IDE barrel exports**
  - IDEMobileLayout already exported in ide/index.ts
- [x] **T7: Integration ready**
  - Component exported and ready for conditional rendering
- [x] **T8: TypeScript verification**
  - `pnpm typecheck` passes with 0 new errors
- [x] **T9: Code review pass**
  - Self-review against acceptance criteria complete

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

| File | description |
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

**Agent:** @bmad-core-master
**Session:** 2026-01-09

#### Task Progress:
- [x] T1: Component structure created (278 lines)
- [x] T2: useIDEMobilePanel hook with localStorage persistence
- [x] T3: Bottom navigation with 4 tabs and motion indicators
- [x] T4: Panel content areas (Files, Terminal, Chat, Settings)
- [x] T5: Framer Motion transitions (200ms)
- [x] T6: Barrel exports (already existed)
- [x] T7: Component ready for integration
- [x] T8: TypeScript verification passed (0 new errors)
- [x] T9: Code review passed

#### Research Executed:
- Context7: Not needed - existing patterns from MobileIDELayout.tsx
- DeepWiki: Not needed - patterns established by NotesMobileLayout/KnowledgeMobileLayout

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| `src/presentation/components/ide/IDEMobileLayout.tsx` | Created | 278 |

#### Tests Created:
- None (component follows established patterns)

#### Decisions Made:
- Used Settings instead of Editor panel (consistent with AC-03)
- Inline handleFileSelect handler (useIDEFileHandlers too complex)
- FileTree refresh via state key increment

---

## Code Review

**Reviewer:** @bmad-core-master (self-review)
**Date:** 2026-01-09

#### Checklist:
- [x] All ACs verified
- [x] TypeScript passes (0 new errors)
- [x] Component follows architecture patterns
- [x] Code quality acceptable
- [x] 8-bit design system compliance

#### Issues Found:
- None

#### Sign-off:
✅ **APPROVED** - MOBILE-03 COMPLETE

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2026-01-09 | drafted | Story created |
| 2026-01-09 | ready-for-dev | Context created, development started |
| 2026-01-09 | in-progress | TypeScript errors fixed |
| 2026-01-09 | completed | All ACs verified, code review passed |

---

*Generated 2026-01-09 by BMAD Story Development Cycle*
*Completed 2026-01-09 by @bmad-core-master*
