# Story UX-2: Fix Rounded Corners

**Epic:** EPIC-UX: System-Wide UX Remediation  
**Priority:** P1 - HIGH  
**Story Points:** 6  
**Estimated Effort:** 3 hours  
**Status:** Ready for Implementation  
**Component Area:** UI Components (All)

---

## User Story

**As a** user of the Via-Gent application  
**I want** all UI elements to follow the 8-bit aesthetic with squared corners  
**So that** the application maintains a consistent retro gaming visual style

## Problem Statement

The codebase contains **52 rounded corners violations** where components use `rounded-lg`, `rounded-md`, and similar classes instead of the required squared corners (`rounded-none`). This violates the 8-bit aesthetic standards.

## Background

From the UX scan at `_bmad-output/ux-scan-results.md`:
- **52 rounded corners violations found**
- **18 files affected**

Reference: `src/styles/design-tokens.css` (lines 139-147):
```css
--radius: 0rem;       /* Squared corners by default */
--radius-sm: 0.125rem; /* 2px - subtle rounding */
--radius-md: 0.25rem;  /* 4px */
--radius-lg: 0.375rem; /* 6px */
```

## Technical Details

### Files to Modify

| File | Line | Issue | Current Code | Acceptable? |
|------|------|-------|--------------|-------------|
| `src/components/rag/CitationCountBadge.tsx` | 1 | Badge | `rounded-full` | Yes (spinner/status) |
| `src/components/rag/CitationSidebar.tsx` | 4 | Cards, inputs | `rounded-lg`, `rounded-full`, `rounded` | No |
| `src/lib/workspace/workspace-access-helper.tsx` | 6 | Spinners | `rounded-full` | Yes (spinner/status) |
| `src/presentation/components/ide/MonacoEditor/EditorTabBar.tsx` | 1 | Tab indicator | `rounded-full` | No |
| `src/presentation/components/ide/AgentChatPanel/AgentChatEnhancingUI.tsx` | 1 | Card | `rounded-lg` | No |
| `src/presentation/components/ide/FeatureSearch.tsx` | 3 | Search, items | `rounded-lg`, `rounded-md` | No |
| `src/presentation/components/ide/CommandPalette.tsx` | 3 | Command, input | `rounded-lg`, `rounded-md` | No |
| `src/presentation/components/ide/PreviewPanel/PreviewPanel.tsx` | 1 | Preview | `rounded-lg` | No |
| `src/presentation/components/ide/SyncEditWarning.tsx` | 2 | Warning | `rounded-lg` | No |
| `src/presentation/components/ide/QuickActionsMenu.tsx` | 3 | Menu, items | `rounded-md`, `rounded-sm` | No |
| `src/presentation/components/ide/SyncStatusPanel.tsx` | 2 | Panel, progress | `rounded-lg`, `rounded-full` | No |
| `src/presentation/components/ide/EnhancedChatInterface.tsx` | 3 | Chat elements | `rounded-full`, `rounded-sm` | No |
| `src/presentation/components/snippets/SnippetManager.tsx` | 7 | Snippets | `rounded-md`, `rounded-sm` | No |
| `src/presentation/components/ui/tabs.tsx` | 1 | Tabs | `rounded-[4px]` | Yes (4px acceptable) |
| `src/presentation/components/ui/card.tsx` | 1 | Card | `rounded-[4px]` | Yes (4px acceptable) |
| `src/presentation/components/ui/slider.tsx` | 1 | Slider | `rounded-lg` | No |

### Note on Acceptable Rounded Elements

The following are **ACCEPTABLE** and should NOT be changed:
- `rounded-[4px]` - Acceptable compromise (4px is near-squared)
- `rounded-sm` - Small radius for compact elements
- `rounded-full` for **status indicators/spinners only** - Animated elements benefit from smooth rotation

**NOT ACCEPTABLE:**
- `rounded-lg` - Too round
- `rounded-md` - Too round
- `rounded-xl` - Too round
- `rounded-2xl` - Too round
- `rounded` (default, ~4px) - Borderline, prefer `rounded-none`

### Replacement Pattern

```tsx
// BEFORE (too round)
<div className="rounded-lg">
  Content
</div>

// AFTER (squared, 8-bit compliant)
<div className="rounded-none">
  Content
</div>

// Or use design token
<div className="rounded-[var(--radius)]">
  Content
</div>
```

## Acceptance Criteria

### AC-1: Citation Components
- [ ] `src/components/rag/CitationSidebar.tsx` - Replace `rounded-lg` with `rounded-none` (keep `rounded-full` for spinners)

### AC-2: IDE Components
- [ ] `src/presentation/components/ide/MonacoEditor/EditorTabBar.tsx` - Replace `rounded-full` with `rounded-none`
- [ ] `src/presentation/components/ide/AgentChatPanel/AgentChatEnhancingUI.tsx` - Replace `rounded-lg` with `rounded-none`
- [ ] `src/presentation/components/ide/FeatureSearch.tsx` - Replace `rounded-lg`, `rounded-md` with `rounded-none`
- [ ] `src/presentation/components/ide/CommandPalette.tsx` - Replace `rounded-lg`, `rounded-md` with `rounded-none`
- [ ] `src/presentation/components/ide/PreviewPanel/PreviewPanel.tsx` - Replace `rounded-lg` with `rounded-none`
- [ ] `src/presentation/components/ide/SyncEditWarning.tsx` - Replace `rounded-lg` with `rounded-none`
- [ ] `src/presentation/components/ide/QuickActionsMenu.tsx` - Replace `rounded-md`, `rounded-sm` with `rounded-none`
- [ ] `src/presentation/components/ide/SyncStatusPanel.tsx` - Replace `rounded-lg` with `rounded-none` (keep `rounded-full` for progress if status indicator)
- [ ] `src/presentation/components/ide/EnhancedChatInterface.tsx` - Replace `rounded-full` with `rounded-none`, verify `rounded-sm` usage

### AC-3: Snippet Components
- [ ] `src/presentation/components/snippets/SnippetManager.tsx` - Replace `rounded-md`, `rounded-sm` with `rounded-none`

### AC-4: UI Primitives
- [ ] `src/presentation/components/ui/slider.tsx` - Replace `rounded-lg` with `rounded-none` or appropriate variant

### AC-5: Visual Regression Testing
- [ ] Capture before screenshots for all modified components
- [ ] Capture after screenshots for all modified components
- [ ] Compare and verify no visual regressions
- [ ] Verify 8-bit aesthetic is consistent

### AC-6: Component Functionality
- [ ] All modified components still render correctly
- [ ] No layout issues introduced
- [ ] Hover/focus states still work correctly

## Tasks

### Task 1: Modify RAG Components (15 minutes)
- [ ] Update `src/components/rag/CitationSidebar.tsx`

### Task 2: Modify IDE Components (1.5 hours)
- [ ] Update `src/presentation/components/ide/MonacoEditor/EditorTabBar.tsx`
- [ ] Update `src/presentation/components/ide/AgentChatPanel/AgentChatEnhancingUI.tsx`
- [ ] Update `src/presentation/components/ide/FeatureSearch.tsx`
- [ ] Update `src/presentation/components/ide/CommandPalette.tsx`
- [ ] Update `src/presentation/components/ide/PreviewPanel/PreviewPanel.tsx`
- [ ] Update `src/presentation/components/ide/SyncEditWarning.tsx`
- [ ] Update `src/presentation/components/ide/QuickActionsMenu.tsx`
- [ ] Update `src/presentation/components/ide/SyncStatusPanel.tsx`
- [ ] Update `src/presentation/components/ide/EnhancedChatInterface.tsx`

### Task 3: Modify Snippet Components (15 minutes)
- [ ] Update `src/presentation/components/snippets/SnippetManager.tsx`

### Task 4: Modify UI Primitives (15 minutes)
- [ ] Update `src/presentation/components/ui/slider.tsx`

### Task 5: Visual Regression Testing (15 minutes)
- [ ] Run visual regression tests
- [ ] Manual verification of key components

## Implementation Notes

### When to Keep Rounded Corners
- **Spinners/Loading indicators**: `rounded-full` for smooth rotation
- **Status badges**: May use small radius for visual distinction
- **Avatar/Profile images**: May use `rounded-full` for circular shape

### When to Use Squared Corners
- **Cards and containers**: Always `rounded-none`
- **Buttons**: Always `rounded-none`
- **Inputs**: Always `rounded-none`
- **Dialogs and modals**: Always `rounded-none`
- **Menus and dropdowns**: Always `rounded-none`

### Testing Approach
1. Open each modified component
2. Verify corners are squared (not rounded)
3. Verify no visual regression
4. Verify functionality unchanged

## Dependencies

- None - can be implemented independently

## Testing Approach

### Unit Testing
- No specific unit tests needed for CSS changes
- Verify components still render correctly

### Visual Regression
- Use Playwright or similar to capture screenshots
- Compare before/after for each component

### Manual Testing
- Open each modified component
- Verify visual appearance
- Verify no functionality broken

## Definition of Done

- [ ] All non-compliant rounded classes replaced
- [ ] Visual regression tests pass
- [ ] No functionality broken
- [ ] Code reviewed and approved
- [ ] Handoff artifact created

## References

- **UX Scan Results:** `_bmad-output/ux-scan-results.md`
- **Design Tokens:** `src/styles/design-tokens.css`
- **UX Specification:** `_bmad-output/planning-artifacts/ux-specification.md`
- **8-bit Aesthetic:** `src/styles/design-tokens.css` (lines 139-147)

---

**Created:** 2026-01-09  
**Story Key:** UX-2
