# Archive Manifest: EPIC-CC-AR02AR03

**Archive Date**: 2026-01-26
**Epic**: EPIC-CC-AR02AR03 (Plugin System Complete Rework)
**Stories**: CC-AR-04, CC-AR-07

---

## Archived Files

| Original Path | Archive Name | Lines | Reason |
|--------------|--------------|-------|--------|
| `src/presentation/layouts/plugin-dnd.css` | `plugin-dnd.css.archived` | 101 | Replaced by toggle-based layout (CC-AR-04) |
| `src/hooks/useResponsiveBreakpoint.ts` | `useResponsiveBreakpoint.ts.archived` | 73 | Duplicate of `useBreakpoint.ts` (less granular, 3 vs 5 breakpoints) |
| `src/presentation/components/common/MobileDetection.tsx` | `MobileDetection.tsx.archived` | 160 | Used archived hook, not imported anywhere |

**Total Lines Archived**: 334

---

## Canonical Replacements

| Archived | Replaced By | Notes |
|----------|-------------|-------|
| `useResponsiveBreakpoint.ts` | `src/presentation/layouts/useBreakpoint.ts` | More granular (5 breakpoints), integrates with platform-contract |
| `MobileDetection.tsx` | N/A - Not used | Components should use `useBreakpoint` directly |
| `plugin-dnd.css` | `PluginToolbar.tsx` | Toggle-based plugin selection replaces drag-drop |

---

## Validation

- **TypeScript Check**: 0 errors
- **Broken Imports**: None
- **CI Status**: Passing

---

## Rollback Instructions

If rollback is needed:

```bash
# Restore files from archive
cp _bmad-ext/.archive/epic-cc-ar02ar03-2026-01-26/plugin-dnd.css.archived src/presentation/layouts/plugin-dnd.css
cp _bmad-ext/.archive/epic-cc-ar02ar03-2026-01-26/useResponsiveBreakpoint.ts.archived src/hooks/useResponsiveBreakpoint.ts
cp _bmad-ext/.archive/epic-cc-ar02ar03-2026-01-26/MobileDetection.tsx.archived src/presentation/components/common/MobileDetection.tsx
```

---

**Archived By**: bmad-sprint-manager
**Verification**: pnpm tsc --noEmit (0 errors)
