# Story UX-3: Touch Target Compliance

**Epic:** EPIC-UX: System-Wide UX Remediation
**Status:** drafted
**Priority:** P0 - Critical
**Points:** 8
**Estimated:** 4 hours
**Created:** 2026-01-09
**Source:** `_bmad-output/ux-scan-results.md`

---

## User Story

As a mobile user,
I want all interactive elements to have a minimum touch target of 44x44 pixels,
So that I can reliably tap buttons and icons without mis-taps, meeting WCAG 2.5.5 accessibility requirements.

---

## Problem Statement

The codebase contains **34 touch target violations** with interactive elements under 44x44 pixels. Common issues include:
- 32x32px buttons (`w-8 h-8`)
- 24x24px icons (`w-6 h-6`)
- Small form controls (checkboxes, switches)

This violates WCAG 2.5.5 (Target Size) and creates poor mobile UX.

---

## Context

- **Reference:** `_bmad-output/ux-scan-results.md` (Section 3)
- **Requirement:** Minimum 44x44px touch targets (WCAG 2.5.5)
- **Files Affected:** 17 files across presentation components

---

## Acceptance Criteria

### AC-1: Icon Sidebar ✅
- [ ] `src/presentation/components/ide/IconSidebar.tsx` - Mobile header from `h-8` (32px) to `h-11` (44px)

### AC-2: Search & Command Components ✅
- [ ] `src/presentation/components/ide/FeatureSearch.tsx` - Icon button from `w-8 h-8` (32px) to `44x44px`
- [ ] `src/presentation/components/ide/CommandPalette.tsx` - Icon buttons from `h-8 w-8` (32px) to `44x44px`
- [ ] `src/presentation/components/ide/BentoGrid.tsx` - Grid icons from `w-6 h-6` (24px) to `44x44px`

### AC-3: Quick Actions & Menus ✅
- [ ] `src/presentation/components/ide/QuickActionsMenu.tsx` - Menu buttons from `w-8 h-8` (32px) to `44x44px`

### AC-4: Form Controls ✅
- [ ] `src/presentation/components/ui/AgentValidationFeedback.tsx` - Buttons from `h-8` (32px) to `h-11` (44px)
- [ ] `src/presentation/components/ui/switch.tsx` - Switch from `h-6 w-11` to `h-8 min-w-[44px]`
- [ ] `src/presentation/components/ui/checkbox.tsx` - Checkbox with wrapper from `w-6 h-6` (24px) to compliant size

### AC-5: Loading & Skeleton Components ✅
- [ ] `src/presentation/components/ui/LoadingSpinner.tsx` - Spinners from `w-6 h-6`, `w-8 h-8` to `w-11 h-11`
- [ ] `src/presentation/components/ui/SkeletonLoader.tsx` - Review and adjust spacing
- [ ] `src/presentation/components/ui/SkeletonScreen.tsx` - Review and adjust spacing

### AC-6: Icon Components ✅
- [ ] `src/presentation/components/ui/icons/icon.tsx` - Add `2xl` variant (h-10 w-10) for larger icons

### AC-7: Chat Components ✅
- [ ] `src/presentation/components/chat/ThreadsList.tsx` - Add button from `h-8 w-8` (32px) to `44x44px`
- [ ] `src/presentation/components/chat/ThreadFolderTree.tsx` - Icon from `w-8 h-8` (32px) to `44x44px`
- [ ] `src/presentation/components/chat/BatchApprovalBar.tsx` - Buttons from `w-8 h-8` (32px) to `44x44px`
- [ ] `src/presentation/components/chat/ChatConversation.tsx` - Avatars from `w-8 h-8` (32px) to `44x44px`

### AC-8: Other Components ✅
- [ ] `src/presentation/components/collaboration/UserPresenceIndicator.tsx` - Avatar from `w-6 h-6` (24px) to `44x44px`
- [ ] `src/presentation/components/chat/SequentialExpansionOptions.tsx` - Badge from `w-6 h-6` (24px) to `32x32px` min

### AC-9: iOS Input Fix ✅
- [ ] All text inputs use `text-base` (16px) to prevent iOS auto-zoom

### AC-10: Validation ✅
- [ ] Build passes without errors
- [ ] All interactive elements are minimum 44x44px
- [ ] Chrome DevTools confirms compliance
- [ ] Mobile viewport testing confirms usability

---

## Tasks

### Task 1: Icon Sidebar (15 min)
- [ ] Update IconSidebar.tsx mobile header height

### Task 2: Search & Command Components (30 min)
- [ ] Update FeatureSearch.tsx icon button
- [ ] Update CommandPalette.tsx icon buttons
- [ ] Update BentoGrid.tsx grid icons

### Task 3: Quick Actions (15 min)
- [ ] Update QuickActionsMenu.tsx menu buttons

### Task 4: Form Controls (45 min)
- [ ] Update AgentValidationFeedback.tsx buttons
- [ ] Update switch.tsx dimensions
- [ ] Update checkbox.tsx with wrapper

### Task 5: Loading Components (30 min)
- [ ] Update LoadingSpinner.tsx sizes
- [ ] Review and adjust SkeletonLoader.tsx
- [ ] Review and adjust SkeletonScreen.tsx

### Task 6: Icon Components (15 min)
- [ ] Add `2xl` variant to icon.tsx

### Task 7: Chat Components (45 min)
- [ ] Update ThreadsList.tsx add button
- [ ] Update ThreadFolderTree.tsx icon
- [ ] Update BatchApprovalBar.tsx buttons
- [ ] Update ChatConversation.tsx avatars

### Task 8: Other Components (30 min)
- [ ] Update UserPresenceIndicator.tsx avatar
- [ ] Update SequentialExpansionOptions.tsx badge

### Task 9: Input Validation (15 min)
- [ ] Audit all text inputs for `text-base` (16px)
- [ ] Fix any `text-sm` inputs that cause iOS zoom

### Task 10: Final Validation (15 min)
- [ ] Run `pnpm build`
- [ ] Verify all touch targets in Chrome DevTools
- [ ] Test mobile viewport

---

## Technical Notes

### Touch Target Pattern
```tsx
// BEFORE (too small)
<button className="w-8 h-8 rounded-md">
  <Icon className="w-4 h-4" />
</button>

// AFTER (44x44px minimum)
<button className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-none flex items-center justify-center">
  <Icon className="w-5 h-5" />
</button>
```

### Icon Wrapper Pattern
```tsx
// For icons that need to be 44x44px but display smaller
<button className="h-11 w-11 flex items-center justify-center rounded-none">
  <Icon className="w-5 h-5" />
</button>
```

### Input Pattern (iOS Auto-Zoom Fix)
```tsx
// BEFORE (causes iOS zoom on focus)
<input className="text-sm ..." />

// AFTER (prevents iOS zoom)
<input className="text-base ..." />
```

---

## Dev Notes

**Reference:** `_bmad-output/project-planning-artifacts/architecture.md`

### Architecture Patterns
- Follow **WCAG 2.5.5** touch target requirements (minimum 44x44px)
- Use `h-11 w-11` (44px) as standard button size
- Maintain `min-h-[44px] min-w-[44px]` for absolute minimum

### Component Patterns
- Icons within buttons should use `flex items-center justify-center` wrapper
- Input fields must use `text-base` (16px) to prevent iOS auto-zoom
- Ensure consistent sizing across all interactive elements

---

## Research Requirements

- [ ] Review WCAG 2.5.5 target size guidelines
- Check iOS Safari input zoom behavior and text-base requirement

---

## Dependencies

- None - can be done independently

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Layout breakage | Medium | Adjust padding/margins to compensate |
| Visual inconsistency | Low | Use consistent 44x44px for all buttons |

---

## Definition of Done

- [ ] All interactive elements minimum 44x44px
- [ ] All text inputs use `text-base` (16px)
- [ ] Build passes without errors
- [ ] Chrome DevTools confirms WCAG 2.5.5 compliance
- [ ] Mobile viewport testing confirms usability
- [ ] Story file updated with completion timestamp

---

## Files Modified

- 17 component files - Fix touch target sizes
- 1 icon component - Add 2xl variant

---

## Notes

- Some components may need layout adjustments (padding/margins) to maintain visual balance
- Always use `min-h-[44px] min-w-[44px]` for absolute minimum
- Use `h-11 w-11` (44px) as standard button size

---

**Created:** 2026-01-09  
**Last Updated:** 2026-01-09
