# Story: STORAGE-2-1 - Wizard IDE Clarity Fix

**Epic**: Storage Remediation - Phase 2: Wizard Clarity Fixes
**Priority**: P0 - Critical User Journey Blocker
**Points**: 3
**Status**: READY FOR IMPLEMENTATION
**Created**: 2026-01-07

---

## User Story

As a user creating a new project,
I want the wizard to clearly explain why IDE workspace is unavailable for my storage choice,
So that I understand the limitation upfront without confusion.

---

## Problem Statement

**Current Behavior:**
- IDE checkbox is visually disabled when `storageType === 'indexeddb'`
- But message `t('wizard.workspaceBindings.requiresFSA')` is vague
- Silent override at creation time (ProjectCreationWizard.tsx:261-265)
- Users don't learn about IDE limitation until Step 2 (too late!)

**User Confusion:**
> "WTF is this wizard - I select options but nothing makes sense!"

---

## Acceptance Criteria

### AC-1: Clear Disabled State Message
- [ ] When `storageType === 'indexeddb'`, IDE checkbox shows specific message:
  - **Desktop**: "IDE workspace requires File System Access (select 'Desktop Storage' to enable)"
  - **Mobile**: "IDE workspace is desktop-only (requires File System Access)"

### AC-2: Info Icon with Explanation
- [ ] Add info icon next to disabled IDE checkbox
- [ ] Hover/click shows tooltip: "IDE workspace uses WebContainer which requires direct file system access. IndexedDB is browser-only storage."

### AC-3: Storage Type Visibility
- [ ] Move storage type selection to BEFORE workspace bindings
- [ ] Show current storage type choice above workspace bindings section

### AC-4: No Silent Overrides
- [ ] Remove silent override at ProjectCreationWizard.tsx:261-265
- [ ] Let workspaceBindings control IDE directly (already validated in UI)

---

## Tasks

| ID | Task | File | Est |
|----|------|------|-----|
| T1 | Add i18n keys for clearer IDE disabled messages | `src/i18n/en.json` | 15m |
| T2 | Update WorkspaceSetupStep.tsx with new messages | `WorkspaceSetupStep.tsx` | 30m |
| T3 | Add info icon/tooltip component | `WorkspaceSetupStep.tsx` | 20m |
| T4 | Remove silent override in ProjectCreationWizard | `ProjectCreationWizard.tsx` | 10m |
| T5 | Test both storage types in wizard | Manual | 15m |

---

## Dev Notes

**Current Code Locations:**
- `WorkspaceSetupStep.tsx:238` - `isDisabled` logic
- `WorkspaceSetupStep.tsx:292-296` - Disabled message display
- `ProjectCreationWizard.tsx:261-265` - Silent override to remove

**Pattern Reference:**
- See `ProjectPickerDialog.tsx` for info badge pattern
- Use `Info` icon from lucide-react

**i18n Keys to Add:**
```json
{
  "wizard.workspaceBindings.ideRequiresFSA": "IDE requires File System Access (desktop only)",
  "wizard.workspaceBindings.ideMobileUnavailable": "IDE is desktop-only (requires File System Access)",
  "wizard.workspaceBindings.fsaTooltip": "File System Access lets the IDE read/write your project files directly",
  "wizard.storageType.indexeddb.label": "Browser Storage",
  "wizard.storageType.indexeddb.desc": "Works on all devices. Data stored in browser database.",
  "wizard.storageType.fsa.label": "Desktop Storage",
  "wizard.storageType.fsa.desc": "Full IDE features. Requires desktop browser with File System Access."
}
```

---

## Validation

```bash
# Test checklist
1. Create new project with IndexedDB → IDE checkbox disabled with clear message
2. Create new project with FSA → IDE checkbox enabled
3. Check info icon tooltip appears and is readable
4. Verify no console errors about undefined ide binding
5. Test on mobile to ensure mobile-specific message shows
```

---

## Related Issues

- Parent: `WIZ-001` (Wizard Confusion)
- Related: `STORAGE-2-2` (Storage Type Info Badges)
- Blocks: `WKS-004` (IDE project switcher)
