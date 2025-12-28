# Story 1.4: Accessibility Foundation (Keyboard & ARIA)

---
phase: implementation
team: A
status: drafted
created: 2025-12-28T22:50:00+07:00
epic: 1
sprint: 1
priority: P0
---

## Part 1: Story Overview

**Epic:** Epic 1 - Mobile-First Visual Foundation
**Sprint:** Sprint 1
**Dependencies:** Stories 1.1, 1.2, 1.3 complete

### User Story

**As a** keyboard-only user,
**I want** to navigate the entire application without a mouse,
**So that** I can use the IDE efficiently with my preferred input method.

### FR Coverage

- **FR-UI-04**: System shall support full keyboard navigation (focus traps, tab order) and ARIA labels.
- **NFR-USE-04**: Keyboard accessibility (Full)

---

## Part 2: Acceptance Criteria

### AC-1: Logical Focus Order

**Given** a user pressing Tab on any page
**When** focus moves through interactive elements
**Then** the focus order is logical (top-to-bottom, left-to-right)
**And** focus indicators are visible (2px outline, 3:1 contrast)
**And** no focus traps except in modals

### AC-2: Skip Links

**Given** a user pressing Tab at page start
**When** focus lands on skip links
**Then** 'Skip to Editor' and 'Skip to Chat' links are available
**And** links are hidden until focused (visually-hidden by default)

### AC-3: ARIA Labels for Screen Readers

**Given** a screen reader user
**When** they navigate the IDE
**Then** all interactive elements have ARIA labels
**And** icons have `aria-hidden="true"` with adjacent text labels
**And** status bar changes announce via `aria-live="polite"`

### AC-4: Modal Focus Management

**Given** a user pressing Escape in a modal
**When** the key is pressed
**Then** the modal closes
**And** focus returns to the trigger element

---

## Part 3: Research Requirements

### Required MCP Research

| Tool | Query | Purpose |
|------|-------|---------|
| Context7 | Radix UI Dialog focus management | Verify Radix handles focus return |
| Context7 | React aria-live patterns | Live region best practices |
| DeepWiki | TanStack Router focus management | Route change focus handling |
| Codebase | Existing ARIA implementations | Audit current state |

---

## Part 4: Implementation Tasks

- [ ] **Task 1: Audit Current Focus Order**
    - Manually test tab order across IDE layout
    - Document any focus traps or illogical order
    - Fix `tabindex` issues if found

- [ ] **Task 2: Implement Skip Links Component**
    - Create `SkipLinks.tsx` component
    - Add "Skip to main content", "Skip to editor", "Skip to chat" links
    - Style as visually-hidden until focused
    - Add to IDELayout before header

- [ ] **Task 3: Add ARIA Labels to Interactive Elements**
    - Audit buttons, links, and controls for missing labels
    - Add `aria-label` or `aria-labelledby` where missing
    - Ensure icons have `aria-hidden="true"` when decorative

- [ ] **Task 4: Implement aria-live Regions**
    - Create `StatusAnnouncer` component for screen reader announcements
    - Wrap status bar with `aria-live="polite"`
    - Announce sync status, errors, WebContainer state changes

- [ ] **Task 5: Verify Modal Focus Management**
    - Test all Radix Dialog components for focus return
    - Ensure Escape closes modals and returns focus
    - Add focus trap tests if not covered by Radix

- [ ] **Task 6: Add Focus Visible Styles**
    - Ensure `:focus-visible` styles are applied globally
    - 2px outline with 3:1 contrast ratio
    - Add to Tailwind config if needed

---

## Part 5: Dev Agent Record

*To be populated during development...*

---

## Part 6: Dev Notes

### Architecture References

- **Arch 5.2**: Hook-based capability/state detection
- **Radix Primitives**: Already handle accessibility for Dialog, Tabs, etc.
- **i18n**: All ARIA labels should use translation keys

### Existing Components to Audit

- `IDEHeaderBar.tsx` - Header controls
- `MobileTabBar.tsx` - Mobile navigation
- `StatusBar.tsx` - Status announcements
- `ChatPanel.tsx` - Chat controls
- `MonacoEditor.tsx` - Editor accessibility (Monaco has built-in)
- `FileTree.tsx` - File tree navigation
- `CommandPalette.tsx` - Search/command palette

### Skip Links Pattern

```tsx
// Example implementation
<SkipLinks
  links={[
    { id: 'main-content', label: 'Skip to main content' },
    { id: 'editor', label: 'Skip to editor' },
    { id: 'chat', label: 'Skip to chat' },
  ]}
/>
```

### aria-live Pattern

```tsx
// Status announcer context
<StatusAnnouncerProvider>
  {/* App content */}
</StatusAnnouncerProvider>

// Usage
const { announce } = useStatusAnnouncer();
announce('File saved successfully');
```

---

## Part 7: Status History

| Date | Status | Agent | Notes |
|------|--------|-------|-------|
| 2025-12-28 | drafted | @bmad-bmm-sm | Story created from epics.md |
