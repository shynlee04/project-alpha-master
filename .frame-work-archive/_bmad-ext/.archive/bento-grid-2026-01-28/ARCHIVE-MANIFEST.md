# Bento Grid System Archive Manifest

**Archive Date:** 2026-01-28  
**Story:** UXUI-02-08  
**Epic:** EPIC-UXUI-02  
**Status:** COMPLETED

---

## Overview

This archive contains the deprecated Bento Grid layout system that was replaced by the simplified PluginLayoutStore-based system as part of EPIC-UXUI-02.

## Archived Files

### Core Bento Grid Files
| File | Lines | Description |
|------|-------|-------------|
| `presentation/layouts/DraggableBentoCell.tsx` | 198 | Drag-and-drop cell wrapper for bento grid |
| `presentation/layouts/__tests__/DraggableBentoCell.test.tsx` | 111 | Tests for DraggableBentoCell |
| `presentation/layouts/BentoGridStore.ts` | 310 | Zustand store for bento grid state |
| `presentation/layouts/bento-layouts.ts` | 270 | Bento layout definitions and helpers |

### IDE Bento Components
| File | Lines | Description |
|------|-------|-------------|
| `presentation/components/ide/BentoGrid.tsx` | 263 | Bento grid discovery interface |
| `presentation/components/ide/BentoCardPreview.tsx` | 103 | Card preview component for bento cards |

**Total Lines Archived:** 1,255

---

## Migration Notes

### Files Updated to Remove Bento Dependencies

1. **src/presentation/layouts/PluginLayout.tsx**
   - Removed imports: `useBentoGridStore`, `getBentoLayout`, `DraggableBentoCell`
   - Refactored to use `usePluginLayoutStore` directly
   - Simplified grid rendering without bento layouts

2. **src/presentation/components/layout/PluginToggles.tsx**
   - Removed imports: `useBentoGridStore`, `MAX_PLUGINS`, `MIN_PLUGINS`, `ALWAYS_LOADED_PLUGINS`
   - Now uses `usePluginLayoutStore` with `togglePlugin` action
   - Constants defined locally in component

3. **src/presentation/layouts/index.ts**
   - Removed all Bento Grid exports
   - Added archival notice comment

4. **src/presentation/components/ide/index.ts**
   - Removed exports for `BentoGrid` and `BentoCardPreview`
   - Removed type exports for bento components

5. **src/presentation/components/hub/HubHomePage.tsx**
   - Removed `BentoGrid` and `BentoCardProps` imports
   - Removed `bentoCards` configuration
   - Removed BentoGrid usage from render

6. **src/presentation/layouts/PluginLayoutStore.ts**
   - Added `togglePlugin` action for plugin toggling
   - Added `selectIsPluginActive` selector helper

---

## Reason for Archival

The Bento Grid system was deprecated in favor of a simpler, more maintainable plugin layout system:

1. **Complexity Reduction:** The bento grid had complex CSS Grid templates and drag-and-drop logic that was difficult to maintain
2. **Performance:** The simplified PluginLayoutStore provides better performance with less re-rendering
3. **Consistency:** Single source of truth for plugin state instead of multiple stores
4. **Mobile-First:** The new system better supports mobile layouts with a cleaner navigation model

---

## Restoration (If Needed)

To restore the Bento Grid system:

1. Move files from this archive back to their original locations
2. Restore the imports in the updated files
3. Revert PluginLayout.tsx to use the bento grid components
4. Update PluginToggles.tsx to use `useBentoGridStore`

---

## Related Stories

- **UXUI-02-08:** Archive Bento Grid System (this story)
- **CC-AR-04:** Replace Drag-Drop with Toggle-Based Layout (replaced bento drag-drop)
- **ARCH-02-09:** PluginLayout Container (new simplified layout system)

---

## Validation

- [x] All Bento Grid files moved to archive
- [x] All imports updated in dependent files
- [x] TypeScript compilation passes (no Bento-related errors)
- [x] PluginLayoutStore enhanced with toggle functionality
- [x] No runtime references to archived files remain

---

**Archived By:** dev-ext agent  
**Archive Location:** `_bmad-ext/.archive/bento-grid-2026-01-28/`
