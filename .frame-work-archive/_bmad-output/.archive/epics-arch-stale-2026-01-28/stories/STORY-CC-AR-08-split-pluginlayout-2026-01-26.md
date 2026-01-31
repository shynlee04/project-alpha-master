# Story: CC-AR-08 - Split PluginLayout.tsx (1034 Lines)

**Story ID:** CC-AR-08
**Epic:** EPIC-CC-AR02AR03
**Priority:** P2
**Team:** Team B
**Effort:** 2-3 hours
**Status:** BLOCKED
**Created:** 2026-01-26
**Depends On:** CC-AR-04 (Team A), CC-AR-05 (Team B)
**Unblocks:** None (final cleanup)

---

## Problem Statement

`PluginLayout.tsx` is 1034 lines - a "god component" that violates BMAD governance threshold of 500 lines max. Contains:

- Layout rendering (1-col, 2-col, 3-col, 2+1)
- Empty state rendering
- Plugin add dialog
- Mobile navigation
- Screen reader announcements
- Drag-drop logic (being removed by CC-AR-04)

---

## Solution

Split into focused components:

```
src/presentation/layouts/
  PluginLayout.tsx             (~300 lines - main orchestrator)
  EmptyPluginState.tsx         (~80 lines - empty state)
  layout-renderers/
    OneColumnLayout.tsx        (~80 lines)
    TwoColumnLayout.tsx        (~120 lines)
    ThreeColumnLayout.tsx      (~150 lines)
    TwoPlus1Layout.tsx         (~150 lines)
    index.ts                   (barrel export)
```

---

## Files to Create

| File | Lines | Description |
|------|-------|-------------|
| `src/presentation/layouts/EmptyPluginState.tsx` | ~80 | Empty state component |
| `src/presentation/layouts/layout-renderers/index.ts` | ~10 | Barrel export |
| `src/presentation/layouts/layout-renderers/OneColumnLayout.tsx` | ~80 | 1-column layout |
| `src/presentation/layouts/layout-renderers/TwoColumnLayout.tsx` | ~120 | 2-column layout |
| `src/presentation/layouts/layout-renderers/ThreeColumnLayout.tsx` | ~150 | 3-column layout |
| `src/presentation/layouts/layout-renderers/TwoPlus1Layout.tsx` | ~150 | 2+1 layout |

## Files to Modify

| File | Changes |
|------|---------|
| `src/presentation/layouts/PluginLayout.tsx` | Extract components, reduce to ~300 lines |

---

## Acceptance Criteria

- [ ] **AC1**: PluginLayout.tsx reduced to <400 lines
- [ ] **AC2**: EmptyPluginState.tsx created (<100 lines)
- [ ] **AC3**: Layout renderers extracted to separate files (<200 lines each)
- [ ] **AC4**: All components under BMAD 500-line threshold
- [ ] **AC5**: No functionality changes (pure refactor)
- [ ] **AC6**: TypeScript: 0 new errors (`pnpm tsc --noEmit`)
- [ ] **AC7**: All imports updated correctly

---

## Implementation Guide

### Step 1: Create EmptyPluginState.tsx

```typescript
/**
 * @fileoverview Empty Plugin State - No plugins loaded state
 * @module presentation/layouts/EmptyPluginState
 * 
 * Displays when no plugins are active in the layout.
 * 
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-08
 * @team Team B
 * @created 2026-01-26
 */

import { LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyPluginStateProps {
  onAddPlugin: () => void;
}

export function EmptyPluginState({ onAddPlugin }: EmptyPluginStateProps) {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
      <LayoutGrid size={48} className="mb-4 opacity-50" />
      <h2 className="text-lg font-medium mb-2">
        {t('plugin.noPluginsTitle', 'No plugins loaded')}
      </h2>
      <p className="text-sm opacity-70 mb-4 text-center">
        {t('plugin.noPluginsDescription', 'Add plugins to start working')}
      </p>
      <button
        onClick={onAddPlugin}
        className="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700"
      >
        {t('plugin.addPlugin', 'Add Plugin')}
      </button>
    </div>
  );
}
```

### Step 2: Create Layout Renderer Files

Each layout renderer follows this pattern:

```typescript
// layout-renderers/TwoColumnLayout.tsx
import type { PluginId } from '@/domain/types/plugin-types';
import { PluginPanel } from '../PluginPanel';

interface TwoColumnLayoutProps {
  plugins: PluginId[];
  panelSizes: Record<string, number>;
  onRemovePlugin: (pluginId: PluginId) => void;
  onResize: (pluginId: PluginId, size: number) => void;
}

export function TwoColumnLayout({ 
  plugins, 
  panelSizes, 
  onRemovePlugin,
  onResize 
}: TwoColumnLayoutProps) {
  const [first, second] = plugins;
  
  return (
    <div className="flex h-full">
      <PluginPanel
        pluginId={first}
        size={panelSizes[first] ?? 30}
        onClose={() => onRemovePlugin(first)}
        onResize={(size) => onResize(first, size)}
      />
      {second && (
        <PluginPanel
          pluginId={second}
          size={panelSizes[second] ?? 70}
          onClose={() => onRemovePlugin(second)}
          onResize={(size) => onResize(second, size)}
        />
      )}
    </div>
  );
}
```

### Step 3: Create Barrel Export

```typescript
// layout-renderers/index.ts
export { OneColumnLayout } from './OneColumnLayout';
export { TwoColumnLayout } from './TwoColumnLayout';
export { ThreeColumnLayout } from './ThreeColumnLayout';
export { TwoPlus1Layout } from './TwoPlus1Layout';
```

### Step 4: Update PluginLayout.tsx

```typescript
// Import extracted components
import { EmptyPluginState } from './EmptyPluginState';
import { 
  OneColumnLayout, 
  TwoColumnLayout, 
  ThreeColumnLayout, 
  TwoPlus1Layout 
} from './layout-renderers';

// Remove inline implementations
// Keep only orchestration logic
```

---

## Validation Commands

```bash
# Check line counts
wc -l src/presentation/layouts/PluginLayout.tsx
# Should be <400

wc -l src/presentation/layouts/EmptyPluginState.tsx
# Should be <100

wc -l src/presentation/layouts/layout-renderers/*.tsx
# Each should be <200

# TypeScript check
pnpm tsc --noEmit
```

---

## Testing (Manual - Validation Deferred per User Directive)

1. Verify all layout modes still work (1-col, 2-col, 3-col, 2+1)
2. Verify empty state displays correctly
3. Verify plugin add/remove works
4. Verify no visual regressions

---

## Evidence Required

- [ ] wc -l output showing PluginLayout.tsx <400 lines
- [ ] wc -l output showing all extracted files <200 lines each
- [ ] TypeScript output saved to file (0 errors)

---

## Notes

- This is BLOCKED by CC-AR-04 (Team A) - wait for drag-drop removal first
- Pure refactor - no functionality changes
- Improves maintainability and code organization

---

*Created: 2026-01-26*
*Team: Team B*
*Sprint Manager: bmad-sprint-manager*
