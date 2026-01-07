# Story: STORAGE-2-1 - Disable IDE Option for IndexedDB

**Epic**: Storage Remediation
**Priority**: P0
**Points**: 3
**Status**: drafted
**Created**: 2026-01-07

## User Story

As a user creating a new project,
I want the wizard to clearly show which workspaces are available for my storage choice,
So that I understand why I can't use IDE with local storage.

## Background

The Project Creation Wizard currently shows the IDE workspace checkbox regardless of storage type selection, but silently forces `ide: false` when IndexedDB is chosen. This creates a confusing user experience where users select an option that gets silently overridden.

## Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| **AC-1** | When `storageType === 'indexeddb'`, IDE checkbox is disabled | Manual: Open wizard, select IndexedDB, verify checkbox disabled |
| **AC-2** | Disabled state shows tooltip/message: "IDE workspace requires File System Access (desktop only)" | Manual: Hover over disabled checkbox, verify message |
| **AC-3** | When `storageType === 'fsa'`, IDE checkbox is enabled | Manual: Open wizard, select FSA, verify checkbox enabled |
| **AC-4** | No silent overrides - user selection is respected when valid | Manual: Select FSA + IDE, verify project has IDE binding |

## Tasks

- [ ] **T1**: Read `src/presentation/components/project/steps/WorkspaceSetupStep.tsx` current implementation
- [ ] **T2**: Add conditional `disabled` attribute to IDE checkbox based on `storageType`
- [ ] **T3**: Add explanatory message/UI for disabled state
- [ ] **T4**: Remove silent override of `workspaceBindings.ide` for IndexedDB
- [ ] **T5**: Test wizard behavior with both storage types
- [ ] **T6**: Run TypeScript check (`pnpm typecheck`)

## Implementation Details

### Files to Modify

| File | Change | Lines |
|------|--------|-------|
| `src/presentation/components/project/steps/WorkspaceSetupStep.tsx` | Add conditional disable + message | ~20 |

### Code Pattern

```typescript
// Current problematic pattern (to remove):
const finalBindings: WorkspaceBindings = {
  ...formData.workspaceBindings,
  ide: formData.storageType === 'fsa' && formData.workspaceBindings.ide === true,  // Silent override!
};

// New pattern (to implement):
// IDE checkbox disabled when storageType === 'indexeddb'
<Checkbox
  checked={formData.workspaceBindings.ide}
  disabled={storageType === 'indexeddb'}
  onCheckedChange={(checked) => updateField('workspaceBindings.ide', checked)}
/>
{storageType === 'indexeddb' && (
  <p className="text-sm text-muted-foreground">
    {t('wizard.workspace.ideRequiresFsa')}
  </p>
)}
```

### Key Files to Reference

- `src/presentation/components/project/steps/WorkspaceSetupStep.tsx`
- `src/presentation/components/project/steps/ProjectDetailsStep.tsx` (for storageType reference)
- `_bmad-output/workspace-remediation/issues-registry.yaml` (WIZ-001)

## Dev Notes

- Pattern: Use conditional rendering for disabled message
- i18n: Add translation key `wizard.workspace.ideRequiresFsa`
- Testing: Test both desktop and mobile flows

## Research Requirements

- [ ] **R1**: Query MCP tools for similar checkbox disable patterns in the codebase
- [ ] **R2**: Check i18n patterns for tooltip/message localization

## References

- Issues Registry: `WIZ-001`
- Plan: `_bmad-output/governance/storage-remediation-plan-2026-01-07.md`
- Related Story: `STORAGE-2-2` (storage type badges)

---

## Dev Agent Record

**Agent**: TBD
**Session**: TBD

#### Task Progress:
- [ ] T1: Read current implementation
- [ ] T2: Add conditional disable
- [ ] T3: Add explanatory message
- [ ] T4: Remove silent override
- [ ] T5: Test wizard behavior
- [ ] T6: Run TypeScript check

#### Research Executed:
- TBD

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| TBD | Modified | TBD |

#### Tests Created:
- TBD

#### Decisions Made:
- TBD

---

## Code Review

**Reviewer**: TBD
**Date**: TBD

#### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

#### Issues Found:
- TBD

#### Sign-off:
⏳ PENDING
