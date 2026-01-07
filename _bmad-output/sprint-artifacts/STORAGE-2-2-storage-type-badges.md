# Story: STORAGE-2-2 - Add Storage Type Info Badges in Wizard

**Epic**: Storage Remediation
**Priority**: P0
**Points**: 2
**Status**: drafted
**Created**: 2026-01-07

## User Story

As a user creating a new project,
I want to see clear information about storage type compatibility before choosing,
So that I can make an informed decision about which storage type to use.

## Background

The Project Details step allows users to select between IndexedDB and FSA storage types, but provides no information about the implications of each choice. Users need to know which devices/browsers support each option.

## Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| **AC-1** | IndexedDB option shows: "✅ Mobile + Desktop" badge | Manual: Open wizard, verify badge text |
| **AC-2** | FSA option shows: "💻 Desktop only" badge | Manual: Open wizard, verify badge text |
| **AC-3** | Badges are visible next to each storage type option | Manual: Visual verification of layout |
| **AC-4** | Badges are color-coded for quick scanning | Manual: Visual verification of colors |

## Tasks

- [ ] **T1**: Read `src/presentation/components/project/steps/ProjectDetailsStep.tsx` current implementation
- [ ] **T2**: Add info badge component for IndexedDB with compatibility info
- [ ] **T3**: Add info badge component for FSA with compatibility info
- [ ] **T4**: Style badges with appropriate colors (green for mobile+desktop, amber for desktop-only)
- [ ] **T5**: Test wizard behavior with both storage types
- [ ] **T6**: Run TypeScript check (`pnpm typecheck`)

## Implementation Details

### Files to Modify

| File | Change | Lines |
|------|--------|-------|
| `src/presentation/components/project/steps/ProjectDetailsStep.tsx` | Add info badges | ~30 |

### Code Pattern

```typescript
// New pattern to implement:
<div className="space-y-4">
  <Label>{t('wizard.storage.type')}</Label>

  <div className="grid grid-cols-2 gap-4">
    {/* IndexedDB Option */}
    <div
      className={cn(
        "cursor-pointer rounded-lg border p-4 transition-colors",
        storageType === 'indexeddb' ? "border-primary bg-primary/5" : "border-border"
      )}
      onClick={() => setStorageType('indexeddb')}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">IndexedDB</span>
        <Badge variant="success">✅ Mobile + Desktop</Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {t('wizard.storage.indexeddb.description')}
      </p>
    </div>

    {/* FSA Option */}
    <div
      className={cn(
        "cursor-pointer rounded-lg border p-4 transition-colors",
        storageType === 'fsa' ? "border-primary bg-primary/5" : "border-border"
      )}
      onClick={() => setStorageType('fsa')}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">File System Access</span>
        <Badge variant="warning">💻 Desktop only</Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {t('wizard.storage.fsa.description')}
      </p>
    </div>
  </div>
</div>
```

### i18n Keys to Add

```json
{
  "wizard": {
    "storage": {
      "indexeddb": {
        "description": "Stores files in browser IndexedDB. Works on all devices including mobile.",
        "badge": "Mobile + Desktop"
      },
      "fsa": {
        "description": "Uses File System Access API for direct file editing. Requires desktop browser.",
        "badge": "Desktop only"
      }
    }
  }
}
```

## Dev Notes

- Pattern: Follow existing Badge component patterns
- i18n: Add translations for both English and Vietnamese
- Accessibility: Ensure badges have proper ARIA labels
- Testing: Verify badges render correctly on mobile and desktop

## Research Requirements

- [ ] **R1**: Check existing Badge component implementation
- [ ] **R2**: Verify color scheme matches design tokens

## References

- Issues Registry: `WIZ-002`
- Plan: `_bmad-output/governance/storage-remediation-plan-2026-01-07.md`
- Related Story: `STORAGE-2-1` (IDE disable)

---

## Dev Agent Record

**Agent**: TBD
**Session**: TBD

#### Task Progress:
- [ ] T1: Read current implementation
- [ ] T2: Add IndexedDB badge
- [ ] T3: Add FSA badge
- [ ] T4: Style badges
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
