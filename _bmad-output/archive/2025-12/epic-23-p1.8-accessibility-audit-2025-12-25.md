# P1.8: Poor Accessibility - Audit Report

**EPIC_ID**: Epic-23
**STORY_ID**: P1.8
**CREATED_AT**: 2025-12-25T22:45:00Z
**AUDITOR**: Dev Agent (@bmad-bmm-dev)

---

## Executive Summary

Comprehensive accessibility audit of Via-gent IDE components revealed multiple WCAG 2.1 AA compliance issues:

- **Missing ARIA Attributes**: Icon-only buttons, interactive elements lack proper labels
- **Missing Keyboard Navigation**: No keyboard handlers for many interactive components
- **Poor Focus Management**: No focus rings, no focus traps, no focus restoration
- **No Screen Reader Support**: Missing aria-live regions, no announcements for dynamic content
- **Color Contrast Issues**: Some muted text colors may not meet WCAG AA standards

---

## 1. Components Missing ARIA Attributes

### 1.1 IconSidebar.tsx
**File**: [`src/components/ide/IconSidebar.tsx`](src/components/ide/IconSidebar.tsx)

**Issues**:
- Line 189-209: `ActivityBarItem` buttons have `title` but no `aria-label`
- Icon-only buttons need explicit ARIA labels for screen readers
- No `aria-current` for active panel indicator
- No `aria-expanded` for collapsible sidebar

**Current Code**:
```tsx
<button
    onClick={onClick}
    title={label}  // Only title, no aria-label
    className={...}
>
    <Icon className="w-5 h-5" />
</button>
```

**Required Fixes**:
- Add `aria-label` to all icon-only buttons
- Add `aria-current="page"` for active panel
- Add `aria-expanded` to sidebar collapse toggle

### 1.2 FileTreeItem.tsx
**File**: [`src/components/ide/FileTree/FileTreeItem.tsx`](src/components/ide/FileTree/FileTreeItem.tsx)

**Issues**:
- Has `role="treeitem"`, `aria-selected`, `aria-expanded` (lines 59-61)
- Missing `aria-label` for file/folder names
- Error status buttons (line 118-129) lack proper ARIA
- Sync status indicators need `aria-label`

**Required Fixes**:
- Add `aria-label` for file/folder names
- Add `aria-label` to sync status buttons
- Add `aria-describedby` for error details

### 1.3 ResizableHandle Components
**File**: [`src/components/ui/resizable.tsx`](src/components/ui/resizable.tsx)

**Issues**:
- Resize handles lack ARIA labels
- No `aria-orientation` for horizontal/vertical handles
- No `aria-valuenow` or `aria-valuemin/max` for panel sizes

**Required Fixes**:
- Add `aria-label` to resize handles
- Add `aria-orientation` (horizontal/vertical)
- Add `aria-valuenow` for current panel size

---

## 2. Components Missing Keyboard Navigation

### 2.1 IconSidebar.tsx
**Issues**:
- Buttons not keyboard navigable (no Enter/Space handlers)
- Arrow key navigation not implemented for activity bar
- No Escape key handler for closing overlays

**Required Fixes**:
- Add `onKeyDown` handlers for Enter/Space activation
- Implement Arrow key navigation for activity bar items
- Add Escape key handler for modals/dialogs

### 2.2 FileTreeItem.tsx
**Issues**:
- Has `tabIndex` management but no keyboard handlers
- Arrow keys not implemented for tree navigation
- Home/End keys not implemented
- Enter/Space for tree expansion/collapse

**Required Fixes**:
- Add keyboard event handlers for Arrow keys
- Implement Home/End key support
- Add Enter/Space for expand/collapse

### 2.3 Dialog/Modal Components
**Issues**:
- No focus trap in modals
- No Escape key to close
- Tab navigation not managed

**Required Fixes**:
- Implement focus trap in all dialogs
- Add Escape key handler
- Manage Tab order within dialogs

### 2.4 Dropdown Menus
**Issues**:
- No Arrow key navigation
- No Escape to close
- No Enter to select

**Required Fixes**:
- Implement Arrow key navigation
- Add Escape key handler
- Add Enter key for selection

---

## 3. Focus Management Issues

### 3.1 Missing Focus Rings
**Issues**:
- No visible focus indicators for keyboard users
- Focus outline only on FileTreeItem (line 73)
- Other interactive elements lack focus styles

**Design Token Analysis**:
- `--ring: 24.6 95% 53.1%` exists (line 50)
- Focus ring not applied consistently

**Required Fixes**:
- Add `:focus-visible` styling to all interactive elements
- Use design token `--ring` for focus rings
- Ensure focus rings are visible on all backgrounds

### 3.2 No Focus Restoration
**Issues**:
- Closing modals doesn't restore focus to trigger element
- No focus management in CommandPalette
- No focus restoration after panel toggle

**Required Fixes**:
- Save focus element before opening modal
- Restore focus after closing modal
- Manage focus in all overlay components

### 3.3 No Focus Trap
**Issues**:
- Dialogs don't trap focus within modal
- Users can tab out of modals

**Required Fixes**:
- Implement focus trap in all dialog components
- Use `useFocusTrap` hook or similar

---

## 4. Screen Reader Support Issues

### 4.1 Missing aria-live Regions
**Issues**:
- Chat messages not announced (no aria-live)
- Sync status updates not announced
- Error messages not announced

**Required Fixes**:
- Add `aria-live="polite"` to chat message container
- Add `aria-live="polite"` to sync status updates
- Add `aria-live="assertive"` to error messages

### 4.2 Missing aria-atomic
**Issues**:
- Dynamic content updates not atomic
- Partial updates may confuse screen readers

**Required Fixes**:
- Add `aria-atomic="true"` to critical updates
- Use `aria-atomic="false"` for non-critical updates

### 4.3 Missing aria-busy
**Issues**:
- Loading states not indicated to screen readers
- No `aria-busy` during file sync

**Required Fixes**:
- Add `aria-busy="true"` during loading operations
- Add `aria-busy="false"` when complete

### 4.4 No Action Announcements
**Issues**:
- Button clicks not announced
- Panel toggles not announced
- File operations not announced

**Required Fixes**:
- Add screen reader announcements for key actions
- Use `aria-live` regions for announcements

---

## 5. Color Contrast Issues

### 5.1 Design Token Analysis
**File**: [`src/styles/design-tokens.css`](src/styles/design-tokens.css)

**Potential Issues**:
- Line 40: `--muted-foreground: 0 0% 60%`
  - Very low lightness (60%) on dark background
  - May not meet WCAG AA (4.5:1)
- Line 66: `--warning-foreground: 0 0% 0%`
  - Black text on amber background
  - May have poor contrast
- Line 201: Light theme `--muted-foreground: 240 4% 40%`
  - Low contrast on light backgrounds

**WCAG 2.1 AA Requirements**:
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- Large UI components: 3:1 contrast ratio

**Required Fixes**:
- Verify all color combinations meet WCAG AA
- Update `--muted-foreground` to higher contrast
- Update `--warning-foreground` to meet 4.5:1 ratio
- Test with contrast checker tools

---

## 6. Priority Fixes

### High Priority (P0 - Critical)
1. Add `aria-label` to all icon-only buttons
2. Add keyboard navigation to IconSidebar
3. Implement focus rings using design tokens
4. Add `aria-live` regions for chat messages
5. Fix color contrast for muted text

### Medium Priority (P1 - Major)
1. Add keyboard navigation to FileTree
2. Implement focus trap in dialogs
3. Add `aria-busy` for loading states
4. Add `aria-expanded` for collapsible elements
5. Implement focus restoration after modal close

### Low Priority (P2 - Minor)
1. Add `aria-orientation` to resize handles
2. Add `aria-current` for active items
3. Add `aria-describedby` for help text
4. Implement Home/End key navigation
5. Add screen reader announcements for all actions

---

## 7. Implementation Plan

### Phase 1: ARIA Attributes (AC 1-2)
- Update IconSidebar with aria-labels
- Update FileTreeItem with aria-labels
- Update ResizableHandle with ARIA
- Add aria-expanded to collapsible elements

### Phase 2: Keyboard Navigation (AC 3-6)
- Add keyboard handlers to IconSidebar
- Add keyboard navigation to FileTree
- Implement focus trap in dialogs
- Add Escape key handlers

### Phase 3: Focus Management (AC 7)
- Add focus rings using design tokens
- Implement focus restoration
- Add :focus-visible styling
- Manage focus in overlays

### Phase 4: Screen Reader Support (AC 8)
- Add aria-live regions
- Add aria-atomic for updates
- Add aria-busy for loading
- Add action announcements

### Phase 5: Color Contrast (AC 9)
- Update design tokens for WCAG AA
- Verify all color combinations
- Test with contrast checker

### Phase 6: Testing (AC 10-12)
- Test with screen reader (NVDA/VoiceOver)
- Run keyboard-only navigation
- Run pnpm test
- Run pnpm tsc --noEmit

---

## 8. References

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- Design Tokens: [`src/styles/design-tokens.css`](src/styles/design-tokens.css)
- UX Audit: [`_bmad-output/ux-ui-audit-2025-12-25.md`](_bmad-output/ux-ui-audit-2025-12-25.md)
