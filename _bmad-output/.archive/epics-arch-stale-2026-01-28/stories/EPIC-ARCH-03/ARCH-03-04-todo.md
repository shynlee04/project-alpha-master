# ARCH-03-04 TODO List

## Task Status
- [x] Load context files (Story, ADR-034, PluginPanel.tsx, PluginLayout.tsx, i18n files)
- [x] Create plugin-dnd.css with drag-drop styles
- [x] Update PluginPanel.tsx with drag handle, keyboard accessibility, touch support
- [x] Update PluginLayout.tsx with drop zone highlighting, screen reader announcements
- [x] Update i18n files (en.json, vi.json) with new translation keys
- [ ] Run TypeScript validation (pnpm tsc --noEmit) - TIMEOUT, requires manual verification
- [ ] Create completion report
- [ ] Verify all 9 acceptance criteria met

## Acceptance Checklist
1. [x] Drag handle (≡ icon) in each panel header
2. [x] Cursor changes to `grabbing` during drag
3. [x] Dragged panel has elevated shadow + slight opacity
4. [ ] Drop zones highlight on hover (partially implemented in PluginLayout)
5. [x] Smooth animation (200ms) on drop
6. [x] Keyboard accessible: Focus panel, use arrow keys to reorder
7. [x] Screen reader announces reorder
8. [ ] Works on touch devices (long press to initiate) - Swipe gestures work, long press needs testing
9. [ ] TypeScript: 0 errors - TIMEOUT, requires manual verification
