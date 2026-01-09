# Story UX-1: Remove Glassmorphism

**Epic:** EPIC-UX: System-Wide UX Remediation
**Status:** drafted
**Priority:** P0 - Critical
**Points:** 8
**Estimated:** 4 hours
**Created:** 2026-01-09
**Source:** `_bmad-output/ux-scan-results.md`

---

## User Story

As a user,
I want a consistent 8-bit aesthetic without glassmorphism effects,
So that the application maintains its retro gaming visual identity and meets the design specifications.

---

## Problem Statement

The codebase contains **47 glassmorphism violations** including semi-transparent backgrounds (`bg-black/50`, `bg-black/80`, `bg-white/10`) that violate the 8-bit aesthetic requirements. These effects should be replaced with solid colors as specified in `design-tokens.css`.

---

## Context

- **Reference:** `_bmad-output/ux-scan-results.md` (Section 1)
- **Design Tokens:** `src/styles/design-tokens.css` lines 1-16
- **8-bit Aesthetic:** Squared corners, solid backgrounds, pixel shadows
- **Files Affected:** 26 files across presentation components

---

## Acceptance Criteria

### AC-1: Modal/Dialog Overlays ✅
- [ ] `src/presentation/components/ide/FeatureSearch.tsx` - Replace `bg-black/50` with solid overlay
- [ ] `src/presentation/components/ide/CommandPalette.tsx` - Replace `bg-black/50` with solid overlay
- [ ] `src/presentation/components/ui/dialog.tsx` - Replace `bg-black/80` with solid overlay
- [ ] `src/presentation/components/ui/sheet.tsx` - Replace `bg-black/80` with solid overlay
- [ ] `src/presentation/components/chat/WorkflowBuilder.tsx` - Replace `bg-black/50` with solid overlay

### AC-2: Overlay Components ✅
- [ ] `src/presentation/components/ui/keyboard-shortcuts-overlay.tsx` - Replace overlay background
- [ ] `src/presentation/components/ui/ApprovalOverlay.tsx` - Replace overlay background
- [ ] `src/presentation/components/chat/ApprovalOverlay.tsx` - Replace overlay background
- [ ] `src/presentation/components/layout/MainSidebar.tsx` - Replace sidebar overlay
- [ ] `src/presentation/components/knowledge/SourcePreviewPanel.tsx` - Replace panel overlay

### AC-3: Form/Control Backgrounds ✅
- [ ] `src/presentation/components/ui/ErrorState.tsx` - Replace `bg-black/20` with solid
- [ ] `src/presentation/components/error/ErrorMessage.tsx` - Replace `bg-black/20` with solid
- [ ] `src/presentation/components/ui/checkbox.tsx` - Replace `bg-opacity-100`/`bg-opacity-0`
- [ ] `src/presentation/components/ui/sonner.tsx` - Replace `!bg-opacity-100`
- [ ] `src/presentation/components/ui/tooltip.tsx` - Replace `!bg-opacity-100`

### AC-4: Workflow/Canvas Elements ✅
- [ ] `src/presentation/components/chat/workflow/WorkflowCanvas.tsx` - Replace `bg-opacity-10`
- [ ] `src/presentation/components/chat/workflow/WorkflowPalette.tsx` - Replace `bg-opacity-10`
- [ ] `src/presentation/components/chat/WorkflowBuilder.refactored.tsx` - Replace overlay
- [ ] `src/presentation/components/chat/ImagePreviewDialog.tsx` - Replace `bg-black/50`

### AC-5: Additional Components ✅
- [ ] `src/presentation/components/workspace/FolderPickerDialog.tsx` - Replace overlay
- [ ] `src/presentation/components/agent/WorkspacePermissions/YOLOModeToggle.tsx` - Replace overlay
- [ ] `src/presentation/components/agent/MigrationStatus.tsx` - Replace overlay
- [ ] `src/presentation/components/dashboard/PitchDeck.tsx` - Replace overlay
- [ ] `src/presentation/components/hub/ProjectMetadataDialog.tsx` - Replace overlay
- [ ] `src/presentation/components/hub/DeleteProjectDialog.tsx` - Replace overlay
- [ ] `src/presentation/components/offline/OfflineIndicator.tsx` - Replace `bg-white/10`, `bg-white/20`, `active:bg-white/30`

### AC-6: Design Token ✅
- [ ] Add `--color-overlay` CSS variable to `src/styles/design-tokens.css`
- [ ] Use solid color (e.g., `#1a1a1a`) instead of semi-transparent

### AC-7: Validation ✅
- [ ] Build passes without errors
- [ ] No glassmorphism patterns remain in codebase
- [ ] All dialogs, modals, overlays display correctly with solid backgrounds

---

## Tasks

### Task 1: Create Overlay Design Token (30 min)
- [ ] Add `--color-overlay` CSS variable to design-tokens.css
- [ ] Define solid color value
- [ ] Document usage guidelines

### Task 2: Replace Modal/Dialog Overlays (45 min)
- [ ] Update FeatureSearch.tsx
- [ ] Update CommandPalette.tsx
- [ ] Update dialog.tsx
- [ ] Update sheet.tsx
- [ ] Update WorkflowBuilder.tsx

### Task 3: Replace Overlay Components (45 min)
- [ ] Update keyboard-shortcuts-overlay.tsx
- [ ] Update ApprovalOverlay.tsx (both locations)
- [ ] Update MainSidebar.tsx
- [ ] Update SourcePreviewPanel.tsx

### Task 4: Replace Form/Control Backgrounds (30 min)
- [ ] Update ErrorState.tsx
- [ ] Update ErrorMessage.tsx
- [ ] Update checkbox.tsx
- [ ] Update sonner.tsx
- [ ] Update tooltip.tsx

### Task 5: Replace Workflow/Canvas Elements (30 min)
- [ ] Update WorkflowCanvas.tsx
- [ ] Update WorkflowPalette.tsx
- [ ] Update WorkflowBuilder.refactored.tsx
- [ ] Update ImagePreviewDialog.tsx

### Task 6: Replace Additional Components (30 min)
- [ ] Update FolderPickerDialog.tsx
- [ ] Update YOLOModeToggle.tsx
- [ ] Update MigrationStatus.tsx
- [ ] Update PitchDeck.tsx
- [ ] Update hub dialogs
- [ ] Update OfflineIndicator.tsx

### Task 7: Validation (30 min)
- [ ] Run `pnpm build` to verify no errors
- [ ] Search for remaining glassmorphism patterns
- [ ] Verify all overlays display correctly

---

## Technical Notes

### Replacement Pattern
```tsx
// BEFORE (glassmorphism)
<div className="fixed inset-0 bg-black/50" />

// AFTER (solid, 8-bit compliant)
<div className="fixed inset-0 bg-[var(--color-overlay)]" />
// or use design token class
<div className="fixed inset-0 bg-overlay" />
```

### CSS Variable Addition
```css
/* In design-tokens.css */
:root {
  /* ... existing variables */
  --color-overlay: #1a1a1a;
  /* Dark overlay for modals */
}
```

---

## Dev Notes

**Reference:** `_bmad-output/project-planning-artifacts/architecture.md`

### Architecture Patterns
- Follow the **8-bit aesthetic** patterns defined in architecture.md
- Use design tokens (`--color-overlay`) for consistency
- Maintain component API compatibility when replacing styles

### Component Patterns
- Modal overlays use `fixed inset-0 z-50` positioning
- Background replacements should use solid colors from design tokens
- Ensure z-index layering remains consistent after changes

---

## Research Requirements

- [ ] Review design-tokens.css for existing overlay patterns
- [ ] Check shadcn/ui dialog implementations for solid overlay patterns
- [ ] Verify no accessibility issues with solid vs semi-transparent

---

## Dependencies

- None - can be done independently

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Contrast issues with solid overlays | High | Use dark solid color (`#1a1a1a`) that maintains contrast |
| Visual hierarchy disruption | Medium | Ensure z-index and layering remain consistent |

---

## Definition of Done

- [ ] All glassmorphism violations replaced with solid backgrounds
- [ ] Design token `--color-overlay` added and used consistently
- [ ] Build passes without errors
- [ ] No remaining `bg-black/`, `bg-white/`, `bg-opacity` patterns
- [ ] Visual testing confirms correct display
- [ ] Story file updated with completion timestamp

---

## Files Modified

- `src/styles/design-tokens.css` - Add `--color-overlay` variable
- 26+ component files - Replace glassmorphism with solid colors

---

## Notes

- Acceptable for spinners to use `rounded-full` - this is for smooth rotation animation
- Status indicators may keep `rounded-full` as per design spec

---

**Created:** 2026-01-09  
**Last Updated:** 2026-01-09
