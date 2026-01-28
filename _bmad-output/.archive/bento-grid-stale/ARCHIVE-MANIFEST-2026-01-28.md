# Archive Manifest: Bento Grid Specifications

**Archived:** 2026-01-28 09:08:09
**Archived By:** dev-ext (cleanup task)
**Archive Reason:** STALE - Superseded by EPIC-UXUI-02 and EPIC-UXUI-03

---

## Contents

### 1. BENTO-GRID-LAYOUT-SPEC-2026-01-27.md

| Field | Value |
|-------|-------|
| **Original Location** | `_bmad-output/analysis/BENTO-GRID-LAYOUT-SPEC-2026-01-27.md` |
| **Lines** | 751 |
| **Status at Archive** | SPECIFICATION COMPLETE |
| **Created By** | ux-designer-ext |
| **Created** | 2026-01-27 |

---

## Why Archived

The Bento Grid layout system was **superseded** by the UX Specification v3.0.0 which introduced:

1. **6-column CSS Grid Layout** (WorkspaceLayout) instead of bento cells
2. **Activity Bar system** (left, right, top) instead of drag-to-swap
3. **Plugin Docker floating palette** instead of fixed grid positions
4. **Responsive breakpoint system** instead of fixed plugin counts (2-5)

The bento grid concept (asymmetric, Japanese-bento-box-inspired cells) was replaced with a more traditional IDE-style layout that better matches the UX specification.

---

## Superseding Documents

| New Document | Location | Status |
|--------------|----------|--------|
| EPIC-UXUI-02 | `_bmad-output/planning-artifacts/epics/EPIC-UXUI-02-main-layout-overhaul-2026-01-28.md` | COMPLETE (100%) |
| EPIC-UXUI-03 | `_bmad-output/planning-artifacts/epics/EPIC-UXUI-03-PLUGIN-LAYOUT-2026-01-28.md` | READY_FOR_EXECUTION |
| WorkspaceLayout | `src/presentation/layouts/WorkspaceLayout.tsx` | IMPLEMENTED |
| ActivityBar | `src/presentation/components/layout/ActivityBar.tsx` | IMPLEMENTED |

---

## Related Archives

The bento grid code was already archived in EPIC-UXUI-02 (Story UXUI-02-08):
- `_bmad-ext/.archive/bento-grid-2026-01-28/` - Contains 7 archived source files (1,255 lines)

---

## Safe to Delete After

This archive can be permanently deleted after: **2026-04-28** (90 days TTL per Tier 3 governance)

---

**End of Manifest**
