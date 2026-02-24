---
archive_id: "ARCHIVE-EPIC-UXUI-04-2026-01-30"
archive_date: "2026-01-30T22:00:00+07:00"
archived_by: "dev-ext"
epic: "EPIC-UXUI-04"
story: "UXUI-04-01"
archive_reason: "EPIC-UXUI-04 True Plugin Layout Architecture - Replaced with new 3-bar system"
status: "VERIFIED"
verification_date: "2026-01-30T22:00:00+07:00"
---

# Archive Manifest: EPIC-UXUI-04 Legacy Components

**Archive Date:** 2026-01-30  
**Epic:** EPIC-UXUI-04 - True Plugin Layout Architecture  
**Story:** UXUI-04-01 - Archive Phase  
**Status:** ✅ VERIFIED

---

## Overview

This archive contains legacy layout components from EPIC-UXUI-03 that have been replaced by the new True Plugin Layout Architecture implemented in EPIC-UXUI-04. The new architecture introduces a 6-column grid system with three Activity Bars and three Plugin Panels.

### Archive Location
```
_bmad-ext/.archive/epic-uxui-04/
├── components/          # 6 archived React components
├── hooks/              # 1 archived custom hook + tests
└── ARCHIVE-MANIFEST-2026-01-30.md  # This file
```

---

## Archived Components

### Components (6 files)

| File | Original Path | Lines | Archive Reason | Replacement |
|------|--------------|-------|----------------|-------------|
| `ActivityBar.tsx` | `src/presentation/components/layout/ActivityBar.tsx` | 255 | Replaced by 3-bar system | `ActivityBarLeft.tsx`, `ActivityBarMainTop.tsx`, `ActivityBarRight.tsx` |
| `ActivityBarTop.tsx` | `src/presentation/components/layout/ActivityBarTop.tsx` | ~200 | Consolidated into new system | `ActivityBarMainTop.tsx` |
| `FloatingPluginDocker.tsx` | `src/presentation/components/layout/FloatingPluginDocker.tsx` | ~400 | Replaced by PluginDocker | `PluginDocker.tsx` |
| `MainContentRenderer.tsx` | `src/presentation/components/layout/MainContentRenderer.tsx` | ~300 | Replaced by PluginPanel system | `PluginPanelMain.tsx` |
| `PluginActivityDockerWiring.tsx` | `src/presentation/components/layout/PluginActivityDockerWiring.tsx` | ~350 | Consolidated into coordination store | `usePluginCoordination.ts` |
| `PluginDocker.tsx` | `src/presentation/components/layout/PluginDocker.tsx` | ~350 | Replaced by new implementation | `PluginDocker.tsx` (new) |

### Hooks (2 files)

| File | Original Path | Lines | Archive Reason | Replacement |
|------|--------------|-------|----------------|-------------|
| `usePluginPlacement.ts` | `src/presentation/hooks/usePluginPlacement.ts` | 814 | Replaced by coordination system | `usePluginCoordination.ts` |
| `usePluginPlacement.test.ts` | `src/presentation/hooks/usePluginPlacement.test.ts` | ~300 | Tests for archived hook | `usePluginCoordination.test.ts` |

---

## Replacement Components

The following new components replace the archived files:

### New Activity Bar System (3 components)
1. **`ActivityBarLeft.tsx`** - Left sidebar activity bar (48px)
2. **`ActivityBarMainTop.tsx`** - Main content top activity bar (48px)
3. **`ActivityBarRight.tsx`** - Right sidebar activity bar (48px)

### New Plugin Panel System (3 components)
1. **`PluginPanelLeft.tsx`** - Left plugin panel (200-320px)
2. **`PluginPanelMain.tsx`** - Main content area (flexible)
3. **`PluginPanelRight.tsx`** - Right plugin panel (250-400px)

### New Docker System (1 component)
1. **`PluginDocker.tsx`** - Unified plugin docker with source panel

### New Coordination System (1 hook + 1 store)
1. **`usePluginCoordination.ts`** - Replaces usePluginPlacement
2. **`plugin-coordination-store.ts`** - Centralized plugin state management

---

## Import Verification

### Status: ✅ NO BROKEN IMPORTS

Verification performed on 2026-01-30:
- Searched entire `src/` directory for references to archived components
- Checked all routes, components, hooks, and stores
- Confirmed all exports commented out in `src/presentation/components/layout/index.ts`

**Result:** No remaining imports of archived files found.

---

## Export Status

All archived component exports have been commented out in the barrel file:

**File:** `src/presentation/components/layout/index.ts`

```typescript
// Activity Bar (UXUI-02-02) - ARCHIVED 2026-01-30
// export { ActivityBar, type ActivityBarProps, type ActivityBarItem } from './ActivityBar';

// Plugin Docker (UXUI-02-02b) - ARCHIVED 2026-01-30
// export { PluginDocker, type PluginDockerProps } from './PluginDocker';

// Floating Plugin Docker (UXUI-03-05) - ARCHIVED 2026-01-30
// export { FloatingPluginDocker, type FloatingPluginDockerProps } from './FloatingPluginDocker';

// Main Content Renderer (UXUI-03-04) - ARCHIVED 2026-01-30
// export { MainContentRenderer, type MainContentRendererProps } from './MainContentRenderer';

// Activity Bar Top (UXUI-03-03) - ARCHIVED 2026-01-30
// export { ActivityBarTop, type ActivityBarTopProps } from './ActivityBarTop';

// Plugin Activity Docker Wiring (UXUI-03-03) - ARCHIVED 2026-01-30
// export { usePluginActivityDockerWiring } from './PluginActivityDockerWiring';
```

---

## Build Verification

### Commands Run

| Command | Status | Output |
|---------|--------|--------|
| `pnpm typecheck:fast` | ✅ PASS | 0 errors |
| `pnpm build` | ✅ PASS | Build successful |
| `pnpm governance` | ✅ PASS | No violations |

### TypeScript
- **Errors:** 0
- **Status:** Clean build with no type issues

### Governance
- **File Size Violations:** None
- **Import Path Violations:** None
- **Status:** All checks passed

---

## Migration Notes

### For Developers

If you need to reference the old implementation:

1. **Archived files are read-only** - Do not modify archived components
2. **Use new components** - All new development should use the EPIC-UXUI-04 components
3. **Reference only** - Archived files are for historical reference only

### Key Differences

| Aspect | Old (Archived) | New (EPIC-UXUI-04) |
|--------|---------------|-------------------|
| Activity Bars | 2 bars (left, top) | 3 bars (left, mainTop, right) |
| Plugin Panels | 2 panels (left, right) | 3 panels (left, main, right) |
| State Management | usePluginPlacement hook | plugin-coordination-store |
| Persistence | localStorage per project | localStorage with Zustand persist |
| Drag-Drop | Basic implementation | Full system with keyboard support |
| Responsive | 3 breakpoints | 6 breakpoints |

---

## Rollback Procedure

**⚠️ WARNING:** Rollback is NOT recommended. The new architecture is fully functional and replaces all old functionality.

If absolutely necessary:

1. Restore files from `_bmad-ext/.archive/epic-uxui-04/` to original locations
2. Uncomment exports in `src/presentation/components/layout/index.ts`
3. Update routes to use old components
4. Remove new component imports

**Note:** This will break EPIC-UXUI-04 features and is strongly discouraged.

---

## Related Documentation

- **EPIC-UXUI-04 Specification:** `_bmad-output/planning-artifacts/epics/EPIC-UXUI-04-true-plugin-layout.md`
- **New Components:** `src/presentation/components/layout/`
- **New Hooks:** `src/presentation/hooks/`
- **New Stores:** `src/infrastructure/persistence/stores/`

---

## Archive Metadata

```yaml
archive:
  id: "ARCHIVE-EPIC-UXUI-04-2026-01-30"
  date: "2026-01-30T22:00:00+07:00"
  epic: "EPIC-UXUI-04"
  story: "UXUI-04-01"
  files_archived: 8
  components: 6
  hooks: 2
  total_lines: ~3000
  verified_by: "dev-ext"
  verification_date: "2026-01-30T22:00:00+07:00"
  status: "VERIFIED"
```

---

## Acceptance Criteria Verification

- [x] Archive manifest created with proper frontmatter
- [x] All archived files documented with original paths
- [x] Replacement components listed
- [x] No broken imports found in codebase
- [x] TypeScript check passes (0 errors)
- [x] Build passes successfully
- [x] Governance check passes
- [x] Status files updated

**Status:** ✅ ALL CRITERIA MET

---

*Archive created by dev-ext as part of EPIC-UXUI-04 Story 1*  
*Last updated: 2026-01-30*
