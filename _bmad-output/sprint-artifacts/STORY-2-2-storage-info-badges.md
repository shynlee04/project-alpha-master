# Story: STORAGE-2-2 - Storage Type Info Badges

**Epic**: Storage Remediation - Phase 2: Wizard Clarity Fixes
**Priority**: P1 - High Priority UX Improvement
**Points**: 2
**Status**: READY FOR IMPLEMENTATION
**Created**: 2026-01-07

---

## User Story

As a user creating a new project,
I want to see clear information about what each storage type means,
So that I can make an informed decision before choosing.

---

## Problem Statement

**Current Behavior:**
- Storage type selection (Step 1) shows no context about implications
- Users don't learn about IDE limitation until Step 2
- No mobile vs desktop compatibility info shown
- "indexeddb" vs "fsa" mean nothing to most users

**User Confusion:**
- Users choose IndexedDB expecting IDE to work
- Users don't understand why some features are unavailable

---

## Acceptance Criteria

### AC-1: Storage Type Cards with Descriptions
- [ ] Replace radio buttons with info cards
- [ ] Each card shows: Name, Description, Compatibility, Features

### AC-2: Visual Badges for Compatibility
- [ ] IndexedDB card: "✅ Mobile + Desktop" badge
- [ ] FSA card: "💻 Desktop only" badge

### AC-3: Feature Availability Matrix
- [ ] IndexedDB card: Shows "Knowledge, Notes, Study" available
- [ ] FSA card: Shows "IDE, Knowledge, Notes, Study" all available

### AC-4: Recommendation Hint
- [ ] Mobile detected: Show "Recommended for your device" on IndexedDB
- [ ] Desktop detected: Show "Recommended for full IDE features" on FSA

---

## Tasks

| ID | Task | File | Est |
|----|------|------|-----|
| T1 | Create StorageTypeCard component | NEW FILE | 45m |
| T2 | Update ProjectDetailsStep to use cards | `ProjectDetailsStep.tsx` | 30m |
| T3 | Add i18n keys for storage descriptions | `src/i18n/en.json` | 15m |
| T4 | Add responsive detection for recommendations | `ProjectDetailsStep.tsx` | 20m |

---

## Dev Notes

**New Component: StorageTypeCard**

```typescript
interface StorageTypeCardProps {
  type: 'indexeddb' | 'fsa';
  selected: boolean;
  onSelect: () => void;
  isMobile: boolean;
}

// Card content:
const STORAGE_INFO = {
  indexeddb: {
    name: 'Browser Storage',
    description: 'Works on all devices. Data stored in browser database.',
    compatibility: '✅ Mobile + Desktop',
    features: ['Knowledge', 'Notes', 'Study'],
    color: 'blue'
  },
  fsa: {
    name: 'Desktop Storage',
    description: 'Full IDE features. Direct file system access.',
    compatibility: '💻 Desktop only',
    features: ['IDE', 'Knowledge', 'Notes', 'Study'],
    color: 'green'
  }
};
```

**Design Pattern:**
- 8-bit style borders (2px, rounded-[4px])
- Selected state: `border-primary bg-primary/10`
- Mobile touch targets: min-h-[100px]
- Feature icons for each workspace type

**i18n Keys to Add:**
```json
{
  "wizard.storageType.indexeddb.name": "Browser Storage",
  "wizard.storageType.indexeddb.description": "Works on all devices. Data stored in browser database. Great for mobile use.",
  "wizard.storageType.indexeddb.compatibility": "✅ Mobile + Desktop",
  "wizard.storageType.fsa.name": "Desktop Storage",
  "wizard.storageType.fsa.description": "Full IDE features with direct file system access. Requires desktop browser.",
  "wizard.storageType.fsa.compatibility": "💻 Desktop only",
  "wizard.storageType.recommended": "Recommended for your device",
  "wizard.storageType.features": "Available workspaces"
}
```

---

## Validation

```bash
# Test checklist
1. Both storage type cards render with correct info
2. Desktop user sees "Recommended" badge on FSA
3. Mobile user sees "Recommended" badge on IndexedDB
4. Features list matches actual workspace availability
5. Card selection works with keyboard (Tab, Space/Enter)
6. Selected card has clear visual distinction
```

---

## Related Issues

- Parent: `WIZ-002` (Wizard UX)
- Related: `STORAGE-2-1` (Wizard IDE Clarity)
- Enables: Better understanding for `WKS-004` (IDE project switcher)
