# Story UX-3: Touch Target Compliance

**Epic:** EPIC-UX: System-Wide UX Remediation  
**Priority:** P0 - CRITICAL  
**Story Points:** 8  
**Estimated Effort:** 4 hours  
**Status:** Ready for Implementation  
**Component Area:** UI Components (All)

---

## User Story

**As a** mobile user of the Via-Gent application  
**I want** all interactive elements to have a minimum touch target of 44x44 pixels  
**So that** I can reliably tap buttons, icons, and other interactive elements without accidental taps

## Problem Statement

The codebase contains **34 touch target violations** where interactive elements are smaller than the WCAG 2.5.5 minimum of 44x44 pixels. This creates a poor mobile experience and fails accessibility standards.

## Background

From the UX scan at `_bmad-output/ux-scan-results.md`:
- **34 touch target violations found**
- **17 files affected**

Reference: `src/styles/design-tokens.css` (lines 259-261):
```css
--touch-target-min: 44px;
```

WCAG 2.5.5: "The size of the target for pointer inputs is at least 44 by 44 CSS pixels."

## Technical Details

### Files to Modify

| File | Line | Element | Current Size | Required |
|------|------|---------|--------------|----------|
| `src/presentation/components/ide/IconSidebar.tsx` | Header | Mobile header | `h-8` (32px) | `h-11` (44px) |
| `src/presentation/components/ide/FeatureSearch.tsx` | 1 | Icon button | `w-8 h-8` (32px) | 44x44px |
| `src/presentation/components/ide/CommandPalette.tsx` | 2 | Icon buttons | `h-8 w-8` (32px) | 44x44px |
| `src/presentation/components/ide/BentoGrid.tsx` | 1 | Grid icons | `w-6 h-6` (24px) | 44x44px |
| `src/presentation/components/ide/QuickActionsMenu.tsx` | 2 | Menu buttons | `w-8 h-8` (32px) | 44x44px |
| `src/presentation/components/ui/AgentValidationFeedback.tsx` | 5 | Buttons | `h-8 px-2` (32px) | `h-11` (44px) |
| `src/presentation/components/ui/switch.tsx` | 2 | Switch sizes | `h-6 w-11`, `h-6 w-6` (24px) | `h-8 min-w-[44px]` |
| `src/presentation/components/ui/checkbox.tsx` | 1 | Checkbox | `w-6 h-6` (24px) | `w-5 h-5 + wrapper` |
| `src/presentation/components/ui/LoadingSpinner.tsx` | 2 | Spinners | `w-6 h-6`, `w-8 h-8` | `w-11 h-11` |
| `src/presentation/components/ui/SkeletonLoader.tsx` | 3 | Skeletons | `h-6 w-48`, etc. | Review spacing |
| `src/presentation/components/ui/SkeletonScreen.tsx` | 4 | Screens | `w-10 h-10`, `w-8 h-8` | Review spacing |
| `src/presentation/components/ui/icons/icon.tsx` | 3 | Icon sizes | `h-6 w-6`, `h-8 w-8`, `h-10 w-10` | Add `2xl` variant |
| `src/presentation/components/collaboration/UserPresenceIndicator.tsx` | 1 | Avatar | `w-6 h-6` (24px) | 44x44px |
| `src/presentation/components/chat/ThreadsList.tsx` | 1 | Add button | `h-8 w-8` (32px) | 44x44px |
| `src/presentation/components/chat/ThreadFolderTree.tsx` | 1 | Icon | `w-8 h-8` (32px) | 44x44px |
| `src/presentation/components/chat/BatchApprovalBar.tsx` | 1 | Buttons | `w-8 h-8` (32px) | 44x44px |
| `src/presentation/components/chat/SequentialExpansionOptions.tsx` | 1 | Badge | `w-6 h-6` (24px) | 32x32px min |
| `src/presentation/components/chat/ChatConversation.tsx` | 2 | Avatars | `w-8 h-8` (32px) | 44x44px |

### Fix Pattern

```tsx
// BEFORE (too small)
<button className="w-8 h-8 rounded-md">
  <Icon />
</button>

// AFTER (44x44px minimum)
<button className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-none">
  <Icon />
</button>

// For icons within larger clickable areas, use wrapper approach:
<button className="h-11 w-11 flex items-center justify-center rounded-none">
  <Icon className="w-5 h-5" />
</button>
```

## Acceptance Criteria

### AC-1: IDE Components
- [ ] `src/presentation/components/ide/IconSidebar.tsx` - Fix mobile header touch target to 44px
- [ ] `src/presentation/components/ide/FeatureSearch.tsx` - Fix icon buttons to 44x44px
- [ ] `src/presentation/components/ide/CommandPalette.tsx` - Fix icon buttons to 44x44px
- [ ] `src/presentation/components/ide/BentoGrid.tsx` - Fix grid icons to 44x44px
- [ ] `src/presentation/components/ide/QuickActionsMenu.tsx` - Fix menu buttons to 44x44px

### AC-2: UI Primitives
- [ ] `src/presentation/components/ui/AgentValidationFeedback.tsx` - Fix buttons to 44px height
- [ ] `src/presentation/components/ui/switch.tsx` - Fix switch touch target
- [ ] `src/presentation/components/ui/checkbox.tsx` - Fix checkbox with wrapper approach
- [ ] `src/presentation/components/ui/LoadingSpinner.tsx` - Fix spinner container size

### AC-3: Icon Components
- [ ] `src/presentation/components/ui/icons/icon.tsx` - Add `2xl` variant for 44px icons

### AC-4: Collaboration Components
- [ ] `src/presentation/components/collaboration/UserPresenceIndicator.tsx` - Fix avatar touch target

### AC-5: Chat Components
- [ ] `src/presentation/components/chat/ThreadsList.tsx` - Fix add button to 44x44px
- [ ] `src/presentation/components/chat/ThreadFolderTree.tsx` - Fix icons to 44x44px
- [ ] `src/presentation/components/chat/BatchApprovalBar.tsx` - Fix approval buttons to 44x44px
- [ ] `src/presentation/components/chat/SequentialExpansionOptions.tsx` - Verify badge size (min 32x32px)
- [ ] `src/presentation/components/chat/ChatConversation.tsx` - Fix avatars to 44x44px

### AC-6: Skeleton Components
- [ ] `src/presentation/components/ui/SkeletonLoader.tsx` - Review and adjust if needed
- [ ] `src/presentation/components/ui/SkeletonScreen.tsx` - Review and adjust if needed

### AC-7: Mobile Testing
- [ ] Test all modified components on mobile viewport (<640px)
- [ ] Verify touch targets are at least 44x44px
- [ ] Verify no overlapping touch targets
- [ ] Verify touch gestures work correctly

### AC-8: Accessibility Testing
- [ ] Verify all interactive elements have minimum 44x44px touch target
- [ ] Verify no accidental taps due to small touch targets
- [ ] Verify keyboard navigation still works

## Tasks

### Task 1: Fix IDE Components (1 hour)
- [ ] Update `src/presentation/components/ide/IconSidebar.tsx`
- [ ] Update `src/presentation/components/ide/FeatureSearch.tsx`
- [ ] Update `src/presentation/components/ide/CommandPalette.tsx`
- [ ] Update `src/presentation/components/ide/BentoGrid.tsx`
- [ ] Update `src/presentation/components/ide/QuickActionsMenu.tsx`

### Task 2: Fix UI Primitives (1 hour)
- [ ] Update `src/presentation/components/ui/AgentValidationFeedback.tsx`
- [ ] Update `src/presentation/components/ui/switch.tsx`
- [ ] Update `src/presentation/components/ui/checkbox.tsx`
- [ ] Update `src/presentation/components/ui/LoadingSpinner.tsx`

### Task 3: Fix Icon Component (15 minutes)
- [ ] Update `src/presentation/components/ui/icons/icon.tsx` - Add 2xl variant

### Task 4: Fix Collaboration Component (15 minutes)
- [ ] Update `src/presentation/components/collaboration/UserPresenceIndicator.tsx`

### Task 5: Fix Chat Components (30 minutes)
- [ ] Update `src/presentation/components/chat/ThreadsList.tsx`
- [ ] Update `src/presentation/components/chat/ThreadFolderTree.tsx`
- [ ] Update `src/presentation/components/chat/BatchApprovalBar.tsx`
- [ ] Update `src/presentation/components/chat/SequentialExpansionOptions.tsx`
- [ ] Update `src/presentation/components/chat/ChatConversation.tsx`

### Task 6: Review Skeleton Components (15 minutes)
- [ ] Review `src/presentation/components/ui/SkeletonLoader.tsx`
- [ ] Review `src/presentation/components/ui/SkeletonScreen.tsx`

### Task 7: Mobile and Accessibility Testing (30 minutes)
- [ ] Test on mobile viewport
- [ ] Verify touch targets with Chrome DevTools
- [ ] Document any remaining issues

## Implementation Notes

### Icon Button Pattern
```tsx
// Standard 44x44px icon button
<button 
  className="min-h-[44px] min-w-[44px] h-11 w-11 flex items-center justify-center rounded-none"
  aria-label="Icon description"
>
  <Icon className="w-5 h-5" />
</button>
```

### Checkbox Pattern
```tsx
// Checkbox with proper touch target
<div className="min-h-[44px] flex items-center">
  <Checkbox id="checkbox" aria-label="Label" />
  <label htmlFor="checkbox" className="ml-2">Label</label>
</div>
```

### Switch Pattern
```tsx
// Switch with proper touch target
<div className="min-h-[44px] flex items-center">
  <Switch id="switch" aria-label="Label" />
  <label htmlFor="switch" className="ml-2">Label</label>
</div>
```

### Testing with Chrome DevTools
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Select mobile device
4. Use "Show Rulers" to measure touch targets
5. Verify all interactive elements are >=44x44px

## Dependencies

- None - can be implemented independently

## Testing Approach

### Mobile Testing
- Use Chrome DevTools device toolbar
- Test on actual mobile device if possible
- Verify touch gestures work correctly

### Accessibility Testing
- Use Chrome DevTools to measure touch targets
- Use axe DevTools to check accessibility
- Test keyboard navigation

### Manual Testing
- Tap each modified element
- Verify no accidental taps
- Verify visual appearance unchanged

## Definition of Done

- [ ] All touch targets are >=44x44px
- [ ] Mobile testing passes
- [ ] Accessibility testing passes
- [ ] No functionality broken
- [ ] Code reviewed and approved
- [ ] Handoff artifact created

## References

- **UX Scan Results:** `_bmad-output/ux-scan-results.md`
- **Design Tokens:** `src/styles/design-tokens.css`
- **UX Specification:** `_bmad-output/planning-artifacts/ux-specification.md`
- **WCAG 2.5.5:** https://www.w3.org/WAI/WCAG21/Understanding/target-size.html

---

**Created:** 2026-01-09  
**Story Key:** UX-3
