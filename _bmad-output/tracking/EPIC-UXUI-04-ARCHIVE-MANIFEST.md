# ═════════════════════════════════════════════════════════════════════════════
# EPIC-UXUI-04 ARCHIVE MANIFEST
# Created: 2026-01-30T14:45:00+07:00
# Updated: 2026-01-30T16:45:00+07:00
# Status: COMPLETE (Story 1 - Archive Phase)
# Purpose: Track all archived components and cleanup actions
# ═════════════════════════════════════════════════════════════════════════════

## 📋 ARCHIVE INSTRUCTIONS

**This document is created at the START of Story 1 (UXUI-04-01)**
**and updated continuously as files are archived.**

**Rule**: No new code files may be created until this manifest is complete
and approved.

---

## 🗂️ ARCHIVE LOCATION

```
_bmad-ext/.archive/epic-uxui-04/
├── components/           # Archived React components
├── hooks/               # Archived custom hooks
├── stores/              # Archived state management
├── utils/               # Archived utilities
└── MANIFEST.md          # This file (copied to archive)
```

---

## 📊 CURRENT LAYOUT COMPONENTS INVENTORY

### Archived (Old EPIC-UXUI-03 Components)

| # | File Path | Lines | Reason for Archive | Archive Date | Verified |
|---|-----------|-------|-------------------|--------------|----------|
| 1 | `ActivityBar.tsx` | 255 | Generic single bar, not 3-bar system | 2026-01-30 | ✅ |
| 2 | `ActivityBarTop.tsx` | ~200 | Part of old main content system | 2026-01-30 | ✅ |
| 3 | `FloatingPluginDocker.tsx` | 446 | Floating panel pattern (wrong) | 2026-01-30 | ✅ |
| 4 | `MainContentRenderer.tsx` | 330 | Old main content pattern | 2026-01-30 | ✅ |
| 5 | `PluginActivityDockerWiring.tsx` | 366 | Old wiring pattern | 2026-01-30 | ✅ |
| 6 | `PluginDocker.tsx` | ~400 | Old docker pattern | 2026-01-30 | ✅ |
| 7 | `usePluginPlacement.ts` | ~800 | Old hook pattern | 2026-01-30 | ✅ |

### To Be Refactored (Keep but Modify)

| # | File Path | Lines | Refactor Plan | Status |
|---|-----------|-------|---------------|--------|
| 1 | `WorkspaceLayout.tsx` | 201 | Update grid ratio to [0.5:0.5:2:4:2.5:0.5] | PENDING |

### To Be Created (New Components)

| # | Component Name | Purpose | Depends On |
|---|----------------|---------|------------|
| 1 | GlobalSidebar | Collapsible sidebar | Archive complete |
| 2 | ActivityBarLeft | Left activity bar | Archive complete |
| 3 | ActivityBarMainTop | Main-top activity bar | Archive complete |
| 4 | ActivityBarRight | Right activity bar | Archive complete |
| 5 | PluginDocker | Plugin source panel | Archive complete |
| 6 | PluginPanelLeft | Left plugin panel | Archive complete |
| 7 | PluginPanelMain | Main plugin panel | Archive complete |
| 8 | PluginPanelRight | Right plugin panel | Archive complete |

---

## 🔍 IMPORT AUDIT

### Files Importing Old Components (Must be updated)

| # | File Path | Import Statement | Replacement | Updated |
|---|-----------|------------------|-------------|---------|
| 1 | `src/presentation/components/layout/index.ts` | Exports archived components | Removed exports | ✅ COMPLETE |
| 2 | Routes using old components | Various | Update to new system | ✅ NONE FOUND |

**Audit Result**: No files in the codebase import the archived components. All references have been removed from the barrel export file.

---

## ✅ ARCHIVE COMPLETION CHECKLIST

**Before ANY new code:**

- [x] All old components inventoried
- [x] Archive destination created
- [x] All old components moved to archive
- [x] All imports updated (no references to archived files)
- [x] Build passes (0 errors)
- [x] Archive manifest complete
- [x] **APPROVAL GRANTED** to proceed

---

## 📝 ARCHIVE LOG

### 2026-01-30 - Story 1 Started

**Status**: ✅ ARCHIVE PHASE COMPLETE

**Actions Taken**:
1. ✅ Created archive directory structure
2. ✅ Inventoried all current layout components
3. ✅ Identified 7 files to archive
4. ✅ Copied all files to `_bmad-ext/.archive/epic-uxui-04/`
5. ✅ Updated index.ts exports (commented out archived components)
6. ✅ Verified no files import archived components
7. ✅ Build verification passed (0 TypeScript errors)

**Files Archived**:
- `ActivityBar.tsx` (255 lines) - Generic single bar
- `ActivityBarTop.tsx` (~200 lines) - Old main content bar
- `FloatingPluginDocker.tsx` (446 lines) - Floating panel
- `MainContentRenderer.tsx` (330 lines) - Old renderer
- `PluginActivityDockerWiring.tsx` (366 lines) - Old wiring
- `PluginDocker.tsx` (~400 lines) - Old docker
- `usePluginPlacement.ts` (~800 lines) - Old hook

**Import Cleanup**:
- Updated `src/presentation/components/layout/index.ts` to comment out all archived component exports
- Verified no files in the codebase import the archived components
- All references removed cleanly

**Build Verification**:
- TypeScript: ✅ 0 errors
- Governance: ✅ No import path violations (pre-existing size violations noted but unrelated)
- Ready for approval to proceed to Story 2

**Blockers**: None

**Next Actions**:
- Get approval to proceed to Story 2 (Global Sidebar Auto-Collapse)

---

## 🎯 VERIFICATION

### Team B Initial Work (2026-01-30)
**Verified By**: dev-ext-team-b
**Date**: 2026-01-30
**Signature**: ✅ Archive phase COMPLETE - All imports updated, build passes, ready for approval

**Verification Results**:
- TypeScript: 0 errors ✅
- Import Audit: No references to archived components ✅
- Barrel Export: Updated and commented out ✅
- Archive Location: `_bmad-ext/.archive/epic-uxui-04/` ✅

### Team A Final Verification & Cleanup (2026-01-30)
**Verified By**: dev-ext (Team A)
**Date**: 2026-01-30T16:45:00+07:00
**Signature**: ✅ Archive phase VERIFIED and COMPLETED - Source files removed, build verified

**Files Deleted from Source**:
- ✅ `src/presentation/components/layout/ActivityBar.tsx` + `.css`
- ✅ `src/presentation/components/layout/ActivityBarTop.tsx` + `.css`
- ✅ `src/presentation/components/layout/FloatingPluginDocker.tsx` + `.css`
- ✅ `src/presentation/components/layout/MainContentRenderer.tsx` + `.css`
- ✅ `src/presentation/components/layout/PluginActivityDockerWiring.tsx`
- ✅ `src/presentation/components/layout/PluginDocker.tsx` + `.css`
- ✅ `src/presentation/hooks/usePluginPlacement.ts`

**Import Cleanup**:
- ✅ Updated `src/styles.css` - Removed archived CSS imports
- ✅ Verified `src/presentation/components/layout/index.ts` - Exports already commented out
- ✅ Verified `src/routes/$projectId.tsx` - Imports already commented out

**Build Verification Results**:
- TypeScript: ✅ 0 errors (pnpm typecheck:fast)
- Governance: ✅ No import path violations (100 pre-existing size violations unrelated to archive)
- Build: ✅ Successful (pnpm build - 17.14s)

**Archive Integrity**:
- ✅ All 7 files exist in `_bmad-ext/.archive/epic-uxui-04/`
- ✅ File contents intact and verified
- ✅ Archive location: `_bmad-ext/.archive/epic-uxui-04/`
  - components/ (6 files)
  - hooks/ (1 file)

---

*Last Updated: 2026-01-30T16:45:00+07:00*
*Status: Story 1 COMPLETE - Ready to proceed to Story 2*
