# Archive Manifest - Duplicate Components
**Archive Date**: 2026-01-28
**Epic**: EPIC-CC-UXSPEC-COMPLIANCE
**Story**: CC-UX-04
**Archived By**: dev-ext-team-b

## Files Archived

| # | Original Path | Archive Path | Reason | Lines |
|---|---------------|--------------|--------|-------|
| 1 | `src/presentation/components/ide/StatusBar.tsx` | `presentation/components/ide/StatusBar.tsx` | Duplicate of layout/StatusBar.tsx | ~180 |
| 2 | `src/presentation/layouts/PluginToggleBar.tsx` | `presentation/components/layout/PluginToggleBar.tsx` | Unused (PluginToggles is active) | ~200 |

## Import Updates Made

### IDELayoutMain.tsx
- **Before**: `import { StatusBar } from '../ide/StatusBar'`
- **After**: `import { StatusBar } from './StatusBar'`

### ide/index.ts
- **Before**: Exported StatusBar from components/ide/
- **After**: Removed export (now exported from layout/)

## Verification

- [x] Files moved to archive (NOT deleted)
- [x] No broken imports remaining
- [x] TypeScript compiles
- [x] Net file reduction: 2 files

## Notes

Per AGENTS.md governance rules, duplicate files are archived rather than deleted
to maintain traceability and allow recovery if needed.

The layout/StatusBar.tsx is the canonical version used throughout the application.
PluginToggleBar was superseded by PluginToggles component.
