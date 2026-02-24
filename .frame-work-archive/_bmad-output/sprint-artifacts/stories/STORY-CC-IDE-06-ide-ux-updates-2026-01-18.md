# Story: CC-IDE-06
# IDE UX Updates

**Title**: IDE UX Updates
**Epic**: CC-IDE-FSA
**Points**: 6
**Status**: ready-for-dev
**Team**: TEAM_B

---

## Acceptance Criteria

1. [ ] **Storage indicator (FSA/BrowserDB) visible in IDE header**
   - Badge shows storage type (FSA icon or database icon)
   - Tooltip explains current storage
   - Updates when platform changes

2. [ ] **Platform guard prevents mobile IDE access**
   - Route guard checks `platform.canAccessIDE`
   - Mobile/tablet users redirected to Notes
   - Toast message: "IDE not available on mobile"

3. [ ] **File operation feedback (toast notifications)**
   - Save success: "File saved: {path}"
   - Save error: "Failed to save: {error}"
   - Loading state: "Saving file..."

4. [ ] **8-bit design compliance**
   - Border-radius ≤ 2px on all components
   - No backdrop-filter or transparency
   - Crisp borders and shadows

5. [ ] **Accessibility verified (WCAG 2.1)**
   - Keyboard navigation works
   - Screen reader announcements
   - Focus indicators visible
   - Color contrast ≥ 4.5:1

---

## Tasks/Subtasks

### Development Tasks

- [ ] **Task 1**: Add storage indicator component
  - [ ] Subtask 1.1: Create StorageBadge component
  - [ ] Subtask 1.2: Integrate into IDE header

- [ ] **Task 2**: Implement platform guard for IDE routes
  - [ ] Subtask 2.1: Add beforeLoad guard to ide.$projectId.tsx
  - [ ] Subtask 2.2: Redirect to Notes if mobile

- [ ] **Task 3**: Add toast notifications for file operations
  - [ ] Subtask 3.1: Success toasts
  - [ ] Subtask 3.2: Error toasts with retry
  - [ ] Subtask 3.3: Loading states

- [ ] **Task 4**: Apply 8-bit design
  - [ ] Subtask 4.1: Update border-radius values
  - [ ] Subtask 4.2: Remove transparency effects

- [ ] **Task 5**: Accessibility audit
  - [ ] Subtask 5.1: Keyboard navigation
  - [ ] Subtask 5.2: Screen reader support
  - [ ] Subtask 5.3: Color contrast check

---

## Dependencies
- None (can run in parallel with CC-IDE-01)

---

## File List
- Created: src/presentation/components/ide/StorageBadge.tsx
- Modified: src/routes/ide.$projectId.tsx
- Modified: src/presentation/components/ide/Header.tsx
- Created: src/presentation/components/ide/__tests__/StorageBadge.test.tsx

---

## Status
ready-for-dev

---

**Created**: 2026-01-18T14:00:00+07:00
