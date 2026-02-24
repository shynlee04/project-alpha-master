# Story UX-1: Remove Glassmorphism

**Epic:** EPIC-UX: System-Wide UX Remediation  
**Priority:** P0 - CRITICAL  
**Story Points:** 8  
**Estimated Effort:** 4 hours  
**Status:** Ready for Implementation  
**Component Area:** UI Components (All)

---

## User Story

**As a** user of the Via-Gent application  
**I want** all modal overlays, dialogs, and popovers to use solid backgrounds instead of semi-transparent ones  
**So that** the application maintains a consistent 8-bit aesthetic and avoids visual artifacts on different display configurations

## Problem Statement

The codebase contains **47 glassmorphism violations** where components use semi-transparent backgrounds (`bg-black/50`, `bg-black/80`, `bg-white/10`) instead of solid colors. This violates the 8-bit aesthetic standards and can cause:
- Visual artifacts on different backgrounds
- Reduced readability on complex backgrounds
- Inconsistent visual experience
- Performance overhead from alpha blending

## Background

From the UX scan at `_bmad-output/ux-scan-results.md`:
- **47 glassmorphism violations found**
- **26 files affected**
- Primary offenders: FeatureSearch, CommandPalette, dialog.tsx, sheet.tsx

Reference: `src/styles/design-tokens.css` (lines 1-16) defines solid backgrounds as mandatory.

## Technical Details

### Files to Modify

| File | Line | Issue |
|------|------|-------|
| `src/presentation/components/ide/FeatureSearch.tsx` | 142 | Modal overlay `bg-black/50` |
| `src/presentation/components/ide/CommandPalette.tsx` | 152 | Modal overlay `bg-black/50` |
| `src/presentation/components/ui/sheet.tsx` | 1 | Sheet overlay `bg-black/80` |
| `src/presentation/components/ui/ErrorState.tsx` | 89 | Code block `bg-black/20` |
| `src/presentation/components/ui/sonner.tsx` | 1 | Toast `!bg-opacity-100` |
| `src/presentation/components/ui/tooltip.tsx` | 1 | Tooltip `!bg-opacity-100` |
| `src/presentation/components/ui/keyboard-shortcuts-overlay.tsx` | 1 | Dialog overlay `bg-black/50` |
| `src/presentation/components/ui/ApprovalOverlay.tsx` | 1 | Approval overlay `bg-black/50` |
| `src/presentation/components/ui/dialog.tsx` | 1 | Dialog overlay `bg-black/80` |
| `src/presentation/components/chat/WorkflowBuilder.refactored.tsx` | 1 | Modal overlay `bg-black/50` |
| `src/presentation/components/chat/ApprovalOverlay.tsx` | 1 | Approval overlay `bg-black/50` |
| `src/presentation/components/chat/workflow/WorkflowCanvas.tsx` | 1 | Workflow item `bg-opacity-10` |
| `src/presentation/components/chat/workflow/WorkflowPalette.tsx` | 1 | Palette item `bg-opacity-10` |
| `src/presentation/components/chat/ImagePreviewDialog.tsx` | 1 | Image preview `bg-black/50` |
| `src/presentation/components/chat/WorkflowBuilder.tsx` | 1 | Modal overlay `bg-black/50` |
| `src/presentation/components/layout/MainSidebar.tsx` | 1 | Sidebar overlay `bg-black/50` |
| `src/presentation/components/workspace/FolderPickerDialog.tsx` | 1 | Folder picker `bg-black/50` |
| `src/presentation/components/agent/WorkspacePermissions/YOLOModeToggle.tsx` | 1 | YOLO mode `bg-black/80` |
| `src/presentation/components/agent/MigrationStatus.tsx` | 1 | Migration `bg-black/50` |
| `src/presentation/components/dashboard/PitchDeck.tsx` | 1 | Pitch deck `bg-black/50` |
| `src/presentation/components/knowledge/SourcePreviewPanel.tsx` | 1 | Source preview `bg-black/50` |
| `src/presentation/components/error/ErrorMessage.tsx` | 1 | Error block `bg-black/20` |
| `src/presentation/components/hub/ProjectMetadataDialog.tsx` | 1 | Dialog overlay `bg-black/50` |
| `src/presentation/components/hub/DeleteProjectDialog.tsx` | 1 | Dialog overlay `bg-black/50` |
| `src/presentation/components/offline/OfflineIndicator.tsx` | 2 | Offline indicator `bg-white/10`, `bg-white/20` |

### Design Tokens to Use

Add to `src/styles/design-tokens.css` if not exists:
```css
--overlay-solid: #1a1a1a;
--overlay-dark: #0f0f11;
--overlay-light: #27272a;
```

### Replacement Pattern

```tsx
// BEFORE (glassmorphism)
<div className="bg-black/50 backdrop-blur-sm">
  Content
</div>

// AFTER (solid, 8-bit compliant)
<div className="bg-[#1a1a1a]">
  Content
</div>
// Or use design token
<div className="bg-overlay-solid">
  Content
</div>
```

## Acceptance Criteria

### AC-1: Modal and Dialog Overlays
- [ ] `src/presentation/components/ui/dialog.tsx` - Replace `bg-black/80` with solid color
- [ ] `src/presentation/components/ide/FeatureSearch.tsx` - Replace `bg-black/50` with solid color
- [ ] `src/presentation/components/ide/CommandPalette.tsx` - Replace `bg-black/50` with solid color
- [ ] `src/presentation/components/chat/WorkflowBuilder.tsx` - Replace `bg-black/50` with solid color
- [ ] `src/presentation/components/chat/WorkflowBuilder.refactored.tsx` - Replace `bg-black/50` with solid color

### AC-2: Sheet and Sidebar Overlays
- [ ] `src/presentation/components/ui/sheet.tsx` - Replace `bg-black/80` with solid color
- [ ] `src/presentation/components/layout/MainSidebar.tsx` - Replace `bg-black/50` with solid color
- [ ] `src/presentation/components/workspace/FolderPickerDialog.tsx` - Replace `bg-black/50` with solid color

### AC-3: Approval and Error Overlays
- [ ] `src/presentation/components/ui/ApprovalOverlay.tsx` - Replace `bg-black/50` with solid color
- [ ] `src/presentation/components/chat/ApprovalOverlay.tsx` - Replace `bg-black/50` with solid color
- [ ] `src/presentation/components/ui/ErrorState.tsx` - Replace `bg-black/20` with solid color
- [ ] `src/presentation/components/error/ErrorMessage.tsx` - Replace `bg-black/20` with solid color

### AC-4: Workflow and Preview Components
- [ ] `src/presentation/components/chat/workflow/WorkflowCanvas.tsx` - Replace `bg-opacity-10` with solid color
- [ ] `src/presentation/components/chat/workflow/WorkflowPalette.tsx` - Replace `bg-opacity-10` with solid color
- [ ] `src/presentation/components/chat/ImagePreviewDialog.tsx` - Replace `bg-black/50` with solid color
- [ ] `src/presentation/components/knowledge/SourcePreviewPanel.tsx` - Replace `bg-black/50` with solid color

### AC-5: Hub and Dashboard Components
- [ ] `src/presentation/components/hub/ProjectMetadataDialog.tsx` - Replace `bg-black/50` with solid color
- [ ] `src/presentation/components/hub/DeleteProjectDialog.tsx` - Replace `bg-black/50` with solid color
- [ ] `src/presentation/components/dashboard/PitchDeck.tsx` - Replace `bg-black/50` with solid color

### AC-6: Agent and Tool Components
- [ ] `src/presentation/components/agent/WorkspacePermissions/YOLOModeToggle.tsx` - Replace `bg-black/80` with solid color
- [ ] `src/presentation/components/agent/MigrationStatus.tsx` - Replace `bg-black/50` with solid color

### AC-7: Toast, Tooltip, and Keyboard Overlays
- [ ] `src/presentation/components/ui/sonner.tsx` - Ensure `!bg-opacity-100` (already correct, verify)
- [ ] `src/presentation/components/ui/tooltip.tsx` - Ensure `!bg-opacity-100` (already correct, verify)
- [ ] `src/presentation/components/ui/keyboard-shortcuts-overlay.tsx` - Replace `bg-black/50` with solid color

### AC-8: Offline Indicator
- [ ] `src/presentation/components/offline/OfflineIndicator.tsx` - Replace `bg-white/10`, `bg-white/20` with solid colors

### AC-9: Visual Regression Testing
- [ ] Capture before screenshots for all modified components
- [ ] Capture after screenshots for all modified components
- [ ] Compare and verify no visual regressions
- [ ] Test in dark theme (default)
- [ ] Test in light theme (if applicable)

### AC-10: Component Functionality
- [ ] All dialogs open and close correctly
- [ ] All overlays allow clicking outside to close (if intended)
- [ ] All hover/focus states still work
- [ ] No z-index issues introduced

## Tasks

### Task 1: Add Design Tokens (15 minutes)
- [ ] Add `--overlay-solid`, `--overlay-dark`, `--overlay-light` to `src/styles/design-tokens.css`

### Task 2: Modify UI Layer Components (1.5 hours)
- [ ] Update `src/presentation/components/ui/dialog.tsx`
- [ ] Update `src/presentation/components/ui/sheet.tsx`
- [ ] Update `src/presentation/components/ui/ApprovalOverlay.tsx`
- [ ] Update `src/presentation/components/ui/ErrorState.tsx`
- [ ] Update `src/presentation/components/ui/keyboard-shortcuts-overlay.tsx`
- [ ] Update `src/presentation/components/ui/sonner.tsx` (verify)
- [ ] Update `src/presentation/components/ui/tooltip.tsx` (verify)

### Task 3: Modify IDE Components (1 hour)
- [ ] Update `src/presentation/components/ide/FeatureSearch.tsx`
- [ ] Update `src/presentation/components/ide/CommandPalette.tsx`

### Task 4: Modify Chat Components (45 minutes)
- [ ] Update `src/presentation/components/chat/WorkflowBuilder.tsx`
- [ ] Update `src/presentation/components/chat/WorkflowBuilder.refactored.tsx`
- [ ] Update `src/presentation/components/chat/ApprovalOverlay.tsx`
- [ ] Update `src/presentation/components/chat/ImagePreviewDialog.tsx`
- [ ] Update `src/presentation/components/chat/workflow/WorkflowCanvas.tsx`
- [ ] Update `src/presentation/components/chat/workflow/WorkflowPalette.tsx`

### Task 5: Modify Other Components (30 minutes)
- [ ] Update `src/presentation/components/layout/MainSidebar.tsx`
- [ ] Update `src/presentation/components/workspace/FolderPickerDialog.tsx`
- [ ] Update `src/presentation/components/agent/WorkspacePermissions/YOLOModeToggle.tsx`
- [ ] Update `src/presentation/components/agent/MigrationStatus.tsx`
- [ ] Update `src/presentation/components/dashboard/PitchDeck.tsx`
- [ ] Update `src/presentation/components/knowledge/SourcePreviewPanel.tsx`
- [ ] Update `src/presentation/components/error/ErrorMessage.tsx`
- [ ] Update `src/presentation/components/hub/ProjectMetadataDialog.tsx`
- [ ] Update `src/presentation/components/hub/DeleteProjectDialog.tsx`
- [ ] Update `src/presentation/components/offline/OfflineIndicator.tsx`

### Task 6: Visual Regression Testing (30 minutes)
- [ ] Run visual regression tests
- [ ] Manual verification of key components
- [ ] Document any issues found

## Implementation Notes

### Color Selection Guide
- For modal overlays on dark theme: Use `#1a1a1a` (solid equivalent of `bg-black/50`)
- For dialog overlays on dark theme: Use `#0f0f11` (solid equivalent of `bg-black/80`)
- For light elements on dark background: Use `#27272a` (solid equivalent of `bg-white/10`)

### Backdrop-Filter
- If `backdrop-filter` is also present, remove it along with the alpha background

### Testing Approach
1. Open each modified component in isolation
2. Verify background is solid (no transparency)
3. Verify content is readable
4. Verify overlay behavior (click outside, z-index)

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
- Verify functionality (opening, closing, interactions)

## Definition of Done

- [ ] All 26 files modified with solid backgrounds
- [ ] Design tokens added to `design-tokens.css`
- [ ] Visual regression tests pass
- [ ] No functionality broken
- [ ] Code reviewed and approved
- [ ] Handoff artifact created

## References

- **UX Scan Results:** `_bmad-output/ux-scan-results.md`
- **Design Tokens:** `src/styles/design-tokens.css`
- **UX Specification:** `_bmad-output/planning-artifacts/ux-specification.md`
- **8-bit Aesthetic:** `src/styles/design-tokens.css` (lines 1-16)

---

**Created:** 2026-01-09  
**Story Key:** UX-1
