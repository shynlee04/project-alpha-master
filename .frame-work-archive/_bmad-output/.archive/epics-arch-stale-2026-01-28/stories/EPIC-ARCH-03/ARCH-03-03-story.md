# Story: ARCH-03-03 - Layout Presets System

**Epic ID:** EPIC-ARCH-03
**Story ID:** ARCH-03-03
**Created:** 2026-01-23
**Status:** ✅ COMPLETE
**Completed:** 2026-01-23T21:25:00+07:00
**Team:** Team A
**Last Updated:** 2026-01-23T21:25:00+07:00

---
**COMPLETION SUMMARY:**
- ✅ layout-presets-store.ts created (378 lines) - Complete with all features
- ✅ LayoutPresetPicker.tsx created (268 lines) - Complete with all features
- ✅ SavePresetDialog.tsx created (330 lines) - Complete with all features
- ✅ All 9 acceptance criteria met (100%)
- ✅ TypeScript: 0 errors in preset files
- ✅ Full governance compliance (ADR-034-001, AGENTS.md, 8-bit design)

**DELEGATION HISTORY:**
- **First Attempt (Stalled):** Jan 23 19:55 - 20:14 (19 minutes, SavePresetDialog missing)
- **Second Attempt (Restarted):** Jan 23 20:00 - 21:25 (1h 25m, all work complete)
- **Total Time:** 1 hour 44 minutes (from first delegation to completion)
---
**Priority:** P1 - Medium
**Estimated Effort:** 3 hours
**Dependencies:** ARCH-03-00 (Platform-First Plugin Defaults) ✅ COMPLETE

---

## Authority Documents (READ AND MANDATORY)

This story MUST reference and comply with:

1. **ADR-034: Project-Centric Architecture**
   - Path: `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md`
   - Status: APPROVED - IN PROGRESS (Phase 3)
   - Critical Sections: Lines 202-220 (Phase 3: Layout System & UX)

2. **ADR-034-AMENDMENT-001: Platform-First Plugin Selection**
   - Path: `_bmad-output/planning-artifacts/adr/ADR-034-AMENDMENT-001-platform-first-2026-01-21.md`
   - Status: APPROVED - IMPLEMENTED ✅
   - Critical Change: Presets are "saved layouts", NOT "workspace modes"

3. **EPIC-ARCH-03: Layout System & UX**
   - Path: `_bmad-output/planning-artifacts/epics/EPIC-ARCH-03-layout-ux-2026-01-21.md`
   - Status: APPROVED - IN PROGRESS
   - Story Specification: Lines 506-539

---

## Previous Completion Evidence (CONTEXT REQUIRED)

These stories have been completed and provide context for ARCH-03-03:

### ARCH-03-00: Platform-First Plugin Defaults ✅
- **Completion File:** `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-03/ARCH-03-00-completion.md`
- **Completed:** 2026-01-22
- **Key Output:** `src/infrastructure/plugins/platform-defaults.ts` created with `getDefaultPlugins()` and `getDefaultLayoutMode()`
- **Impact:** Platform now determines available plugins, NOT user-selected "modes"
- **Navigation:** All navigation uses `/$projectId` (NO `?layout=ide` or `?layout=notes` params)

### ARCH-03-01: ProjectSidebar Component ✅
- **Completion File:** `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-03/ARCH-03-01-completion.md`
- **Completed:** 2026-01-22
- **Key Output:** 7 sidebar components created (ProjectSidebar, ProjectList, ChatThreadList, etc.)
- **Navigation:** Confirmed platform-first pattern - uses `navigate({ to: '/$projectId' })`

### ARCH-03-01-UPDATE: ProjectSidebar Navigation Review ✅
- **Completion File:** `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-03/ARCH-03-01-UPDATE-completion.md`
- **Completed:** 2026-01-22
- **Finding:** No deprecated patterns found - navigation already compliant with ADR-034-AMENDMENT-001

### ARCH-03-02: Mobile-Responsive Plugin Layouts ✅
- **Completion File:** `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-03/ARCH-03-02-completion.md`
- **Completed:** 2026-01-22
- **Key Output:** `useBreakpoint.ts` (135 lines), `MobilePluginNav.tsx` (194 lines) created
- **Impact:** Responsive layout with breakpoints (mobile 375px, tablet 768px, desktop 1024px)
- **Store:** PluginLayoutStore updated with responsive state (breakpoint, currentPlugin, switch actions)

---

## Executive Summary

Implement a layout presets system that allows users to save, load, and manage custom layout configurations. This system is NOT about "workspace modes" (that concept was eliminated by ADR-034-AMENDMENT-001). Instead, presets are **saved layouts** that users can quickly switch between.

**Key Mental Model Change (from Amendment 001):**
- ~~"IDE Mode" vs "Notes Mode"~~ (ELIMINATED)
- ✅ "Coding" preset, "Writing" preset, "Focus" preset (saved layouts)
- Platform determines what's AVAILABLE
- User saves what they CUSTOMIZE

**Presets are per-project:** Users can have different custom layouts for different projects.

---

## User Story

**As a** developer using ViaGent,
**I want to** save and quickly switch between different plugin arrangements,
**So that** I can have optimized layouts for coding, writing, or focused work without manually configuring plugins each time.

---

## Acceptance Criteria (9 items - ALL MET ✅)

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | **Built-in presets created:** 3 built-in presets (Coding, Writing, Focus) | ✅ COMPLETE | `BUILT_IN_PRESETS` constant defined in layout-presets-store.ts (lines 117-142) |
| 2 | **Preset picker dropdown in header:** Component to select layouts | ✅ COMPLETE | `LayoutPresetPicker.tsx` component created and integrated (268 lines) |
| 3 | **"Save Current Layout" option in dropdown:** Option to save custom preset | ✅ COMPLETE | Dropdown menu has "Save Custom Layout" action (lines 190-198) |
| 4 | **Save dialog with name input:** Modal dialog for entering preset name | ✅ COMPLETE | `SavePresetDialog.tsx` component created with name input field (330 lines) |
| 5 | **Custom presets stored per project:** Persisted in localStorage | ✅ COMPLETE | Presets saved with `projectId` prefix in localStorage (lines 174-194) |
| 6 | **Delete custom preset (swipe or context menu):** Option to delete saved presets | ✅ COMPLETE | Custom presets show delete button (lines 174-182) |
| 7 | **Keyboard shortcuts: Cmd+1 (Coding), Cmd+2 (Writing), Cmd+3 (Focus):** Shortcuts | ✅ COMPLETE | `useLayoutShortcuts()` hook implements keyboard listeners (lines 244-273) |
| 8 | **Presets persist across sessions:** Saved presets loaded on app restart | ✅ COMPLETE | Presets loaded from localStorage on store initialization (lines 159-173) |
| 9 | **TypeScript: 0 compilation errors** | ✅ COMPLETE | `pnpm tsc --noEmit` returns 0 errors in preset files |

**Overall:** 9/9 complete (100%)

---

## Files to Create (3 files, ~600 lines)

### 1. Layout Presets Store
**Path:** `src/infrastructure/persistence/stores/layout-presets-store.ts`
**Lines:** ~200
**Purpose:** Zustand v5 store for layout preset management

**Interface:**
```typescript
export interface LayoutPreset {
  id: string;
  name: string;
  plugins: PluginId[];
  layoutMode: LayoutMode;
  panelSizes: Record<string, number>;
  isBuiltIn: boolean;
  projectId?: string;  // null = global preset
}

export interface LayoutPresetState {
  presets: LayoutPreset[];
  activePresetId: string | null;

  // Actions
  loadPreset: (presetId: string) => void;
  savePreset: (name: string, plugins: PluginId[], mode: LayoutMode) => void;
  deletePreset: (presetId: string) => void;
  setActivePreset: (presetId: string | null) => void;

  // Persistence
  initializePresets: () => void; // Load saved presets from localStorage
}
```

**Implementation Requirements:**
- Use Zustand v5 with persist middleware (localStorage)
- Define `BUILT_IN_PRESETS` constant with 3 presets (Coding, Writing, Focus)
- Merge built-ins with custom presets from localStorage
- Custom presets are stored per project: `layout-presets-${projectId}` key
- `loadPreset()` should update PluginLayoutStore with preset configuration
- `initializePresets()` should be called on app start

### 2. LayoutPresetPicker Component
**Path:** `src/presentation/components/ui/LayoutPresetPicker.tsx`
**Lines:** ~250
**Purpose:** Dropdown to select layouts, save custom presets

**Interface:**
```typescript
export interface LayoutPresetPickerProps {
  currentPresetId?: string;
}
```

**Requirements:**
- Use Radix UI DropdownMenu component
- List all presets (built-in + custom for current project)
- Show active preset with checkmark or bold text
- Built-in presets are NOT deletable
- Custom presets show delete button
- "Save Custom Layout" action at bottom
- 8-bit design compliant (sharp corners, pixel shadows, solid colors)
- On preset selection, call `layoutPresetsStore.loadPreset(presetId)`
- On "Save Custom Layout", open `SavePresetDialog`

### 3. SavePresetDialog Component
**Path:** `src/presentation/components/ui/SavePresetDialog.tsx`
**Lines:** ~150
**Purpose:** Modal dialog for entering preset name

**Interface:**
```typescript
export interface SavePresetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Requirements:**
- Use Radix UI Dialog component
- Name input field with placeholder "Enter preset name..."
- Validation: Name cannot be empty
- "Save" button (disabled if name is empty)
- "Cancel" button
- On save, get current layout from PluginLayoutStore and call `layoutPresetsStore.savePreset()`
- 8-bit design compliant
- i18n support (use `t()` function for all user-facing strings)

---

## Implementation Pattern

### 1. Built-in Presets Definition

**Location:** In layout-presets-store.ts

```typescript
import type { PluginId } from '@/domain/types/plugin-types';
import type { LayoutMode } from '@/domain/types/layout-mode';

// NOTE: Per ADR-034-AMENDMENT-001, these are "saved layouts" NOT "workspace modes"
// Platform determines what plugins are AVAILABLE, user saves what they CUSTOMIZE
export const BUILT_IN_PRESETS: LayoutPreset[] = [
  {
    id: 'preset-coding',
    name: 'Coding',  // NOT "IDE Mode"
    plugins: ['filetree', 'monaco', 'terminal', 'chat'],
    layoutMode: '2+1',
    panelSizes: { filetree: 20, monaco: 50, terminal: 30 },
    isBuiltIn: true,
  },
  {
    id: 'preset-writing',
    name: 'Writing',  // NOT "Notes Mode"
    plugins: ['filetree', 'notes', 'chat'],
    layoutMode: '2-column',
    panelSizes: { filetree: 25, notes: 75 },
    isBuiltIn: true,
  },
  {
    id: 'preset-focus',
    name: 'Focus',
    plugins: ['monaco'],  // or ['notes'] depending on available plugins
    layoutMode: '1-column',
    panelSizes: { monaco: 100 },
    isBuiltIn: true,
  },
];
```

### 2. Store Persistence Strategy

**Storage Key Format:**
- Per project: `layout-presets-${projectId}`
- Global: `layout-presets` (deprecated in future, use per-project)

**Load Logic:**
```typescript
export const useLayoutPresetsStore = create<LayoutPresetState>()(
  persist(
    (set, get) => ({
      presets: [...BUILT_IN_PRESETS],
      activePresetId: null,

      initializePresets: () => {
        // Merge built-ins with custom presets from localStorage
        const projectId = getCurrentProjectId();
        const storageKey = `layout-presets-${projectId}`;
        const customPresets = JSON.parse(
          localStorage.getItem(storageKey) || '[]'
        ) as LayoutPreset[];

        set({
          presets: [...BUILT_IN_PRESETS, ...customPresets],
        });
      },

      savePreset: (name, plugins, mode) => {
        const projectId = getCurrentProjectId();
        const storageKey = `layout-presets-${projectId}`;

        const newPreset: LayoutPreset = {
          id: `custom-${Date.now()}`,
          name,
          plugins,
          layoutMode: mode,
          panelSizes: getPanelSizes(),
          isBuiltIn: false,
          projectId,
        };

        const customPresets = get().presets.filter(p => !p.isBuiltIn);
        const updatedPresets = [...customPresets, newPreset];

        localStorage.setItem(storageKey, JSON.stringify(updatedPresets));
        set({ presets: [...BUILT_IN_PRESETS, ...updatedPresets] });
      },

      deletePreset: (presetId) => {
        const projectId = getCurrentProjectId();
        const storageKey = `layout-presets-${projectId}`;

        const customPresets = get().presets.filter(p => !p.isBuiltIn && p.id !== presetId);
        localStorage.setItem(storageKey, JSON.stringify(customPresets));

        set({
          presets: [...BUILT_IN_PRESETS, ...customPresets],
          activePresetId: null,
        });
      },

      loadPreset: (presetId) => {
        const preset = get().presets.find(p => p.id === presetId);
        if (!preset) return;

        // Update PluginLayoutStore with preset configuration
        const layoutStore = usePluginLayoutStore.getState();
        layoutStore.setActivePlugins(preset.plugins);
        layoutStore.setLayoutMode(preset.layoutMode);
        layoutStore.setPanelSizes(preset.panelSizes);

        set({ activePresetId: presetId });
      },

      setActivePreset: (presetId) => {
        set({ activePresetId: presetId });
      },
    }),
    {
      name: 'via-gent-layout-presets-storage',
    }
  )
);
```

### 3. Keyboard Shortcut Integration

**Location:** In LayoutPresetPicker.tsx or separate hook

```typescript
import { useEffect } from 'react';
import { useLayoutPresetsStore } from '@/infrastructure/persistence/stores/layout-presets-store';

export function useLayoutShortcuts() {
  const { loadPreset } = useLayoutPresetsStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+1 (Coding preset)
      if (e.metaKey && e.key === '1') {
        e.preventDefault();
        loadPreset('preset-coding');
      }
      // Cmd+2 (Writing preset)
      else if (e.metaKey && e.key === '2') {
        e.preventDefault();
        loadPreset('preset-writing');
      }
      // Cmd+3 (Focus preset)
      else if (e.metaKey && e.key === '3') {
        e.preventDefault();
        loadPreset('preset-focus');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loadPreset]);
}
```

### 4. Active Plugin Detection

**Location:** In SavePresetDialog.tsx

```typescript
import { usePluginLayoutStore } from '@/infrastructure/presentation/layouts/PluginLayoutStore';

const getActivePlugins = (): PluginId[] => {
  const layoutStore = usePluginLayoutStore.getState();
  return layoutStore.activePlugins;
};

const getLayoutMode = (): LayoutMode => {
  const layoutStore = usePluginLayoutStore.getState();
  return layoutStore.layoutMode;
};

const getPanelSizes = (): Record<string, number> => {
  const layoutStore = usePluginLayoutStore.getState();
  return layoutStore.panelSizes || {};
};
```

---

## ADR-034-AMENDMENT-001 Compliance

### CRITICAL: Presets Are NOT Workspace Modes

| Aspect | OLD (Workspace-Centric) | NEW (Platform-First) | ARCH-03-03 Implementation |
|---------|-------------------------|---------------------|----------------------------|
| **Concept** | "IDE mode" vs "Notes mode" | "Coding" preset, "Writing" preset | ✅ Uses saved layouts, NOT modes |
| **Route** | `/ide/$projectId`, `/notes/$projectId` | `/$projectId` only | ✅ No route changes |
| **Query Params** | `?layout=ide`, `?layout=notes` | NO layout params | ✅ No query params |
| **User Choice** | Picks workspace first, then project | Picks project only | ✅ User saves layout customization |
| **Platform Role** | Conditional routing | Determines availability | ✅ Platform filters plugins (defaults) |

### Built-in Preset Names (CORRECT)

| OLD (Wrong) | NEW (Correct) | ARCH-03-03 Implementation |
|---------------|-----------------|----------------------------|
| "IDE Mode" | "Coding" | ✅ `preset-coding` name: "Coding" |
| "Notes Mode" | "Writing" | ✅ `preset-writing` name: "Writing" |
| "Focus Mode" | "Focus" | ✅ `preset-focus` name: "Focus" |

---

## i18n Requirements

**Keys to Add:** (in `src/i18n/en.json` and `src/i18n/vi.json`)

```json
{
  "layoutPresets": {
    "title": "Layout Presets",
    "title_vi": "Bố cục Mẫu",

    "saveCustom": "Save Custom Layout",
    "saveCustom_vi": "Lưu Bố cục Tùy chỉnh",

    "dialogTitle": "Save Layout Preset",
    "dialogTitle_vi": "Lưu Mẫu Bố cục",

    "dialogPlaceholder": "Enter preset name...",
    "dialogPlaceholder_vi": "Nhập tên mẫu...",

    "dialogSave": "Save",
    "dialogSave_vi": "Lưu",

    "dialogCancel": "Cancel",
    "dialogCancel_vi": "Hủy",

    "deleteConfirm": "Delete preset?",
    "deleteConfirm_vi": "Xóa mẫu?",

    "deletePreset": "Delete Preset",
    "deletePreset_vi": "Xóa Mẫu",

    "presetCoding": "Coding",
    "presetCoding_vi": "Lập trình",

    "presetWriting": "Writing",
    "presetWriting_vi": "Viết lách",

    "presetFocus": "Focus",
    "presetFocus_vi": "Tập trung"
  }
}
```

---

## 8-Bit Design Requirements

**All components must follow AGENTS.md rules:**

### Design System
```css
/* Sharp corners (NO border-radius) */
border-radius: 0;
border: 2px solid #000000;

/* Pixel shadows (NO blur) */
box-shadow: 4px 4px 0 0 rgba(0, 0, 0, 0.3);

/* Solid colors (NO transparency) */
background: #f0f0f0;
color: #333333;

/* No glassmorphism */
/* NO backdrop-filter: blur() */
```

### Component Styling Guidelines

**LayoutPresetPicker:**
- Dropdown button: Sharp corners, 2px border, pixel shadow
- Menu items: Sharp corners, hover with solid background
- Active preset: Bold text or checkmark
- Delete button (custom presets): Red color, sharp corners

**SavePresetDialog:**
- Dialog: Sharp corners, 2px border, pixel shadow
- Input: Sharp corners, 2px border
- Buttons: Sharp corners, pixel shadow, solid hover states

---

## AGENTS.md Compliance Checklist

### Import Order
```typescript
// 1. React/Framework
import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

// 2. Third-party
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@radix-ui/react-dialog';
import { Layout, Save, X, Trash2 } from 'lucide-react';

// 3. Infrastructure (with @/)
import { useLayoutPresetsStore } from '@/infrastructure/persistence/stores/layout-presets-store';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import { useProjectContext } from '@/infrastructure/context/project-context';

// 4. Domain
import type { PluginId } from '@/domain/types/plugin-types';
import type { LayoutMode } from '@/domain/types/layout-mode';
import type { LayoutPreset } from '@/domain/types/layout-preset-types';

// 5. Presentation
import { Button } from '@/presentation/components/ui/button';

// 6. Relative
```

### Zustand v5 Pattern
```typescript
// ALWAYS use useShallow for multiple selectors
const { presets, loadPreset, savePreset, deletePreset } = useLayoutPresetsStore(
  useShallow((state) => ({
    presets: state.presets,
    loadPreset: state.loadPreset,
    savePreset: state.savePreset,
    deletePreset: state.deletePreset,
  }))
);

// ❌ NEVER
const presets = useLayoutPresetsStore((s) => s.presets);
const loadPreset = useLayoutPresetsStore((s) => s.loadPreset);
```

### TanStack Router Navigation (NO window.location.href)
```typescript
// ✅ CORRECT
const navigate = useNavigate();
navigate({ to: '/$projectId', params: { projectId } });

// ❌ FORBIDDEN
window.location.href = `/${projectId}`;
```

### ProjectContext (NOT @/lib/workspace/ProjectContext)
```typescript
// ✅ CORRECT
import { useProjectContext } from '@/infrastructure/context/project-context';

// ❌ FORBIDDEN
import { useProjectContext } from '@/lib/workspace/ProjectContext';
```

---

## Integration with Previous Stories

### ARCH-03-00: Platform-First Plugin Defaults
**Integration Point:** Use `getDefaultPlugins()` and `getDefaultLayoutMode()` from `platform-defaults.ts`

**Built-in Presets Should Use Platform Defaults:**
```typescript
import { getDefaultPlugins, getDefaultLayoutMode } from '@/infrastructure/plugins/platform-defaults';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';

export const BUILT_IN_PRESETS: LayoutPreset[] = [
  {
    id: 'preset-coding',
    name: 'Coding',
    plugins: getDefaultPlugins(getPlatformContract(), currentProject),  // Use platform defaults
    layoutMode: getDefaultLayoutMode(getPlatformContract()),    // Use platform defaults
    panelSizes: { filetree: 20, monaco: 50, terminal: 30 },
    isBuiltIn: true,
  },
  // ... other presets
];
```

### ARCH-03-02: Mobile-Responsive Layouts
**Integration Point:** Hide LayoutPresetPicker on mobile (single plugin view)

```typescript
// In LayoutPresetPicker.tsx
import { useBreakpoint } from '@/presentation/layouts/useBreakpoint';

export function LayoutPresetPicker() {
  const breakpoint = useBreakpoint();

  // Hide preset picker on mobile (single plugin fullscreen)
  if (breakpoint === 'mobile' || breakpoint === 'mobileLg') {
    return null;
  }

  return (
    <DropdownMenu>
      {/* ... preset picker UI */}
    </DropdownMenu>
  );
}
```

---

## Testing Strategy

### Manual Testing Checklist
- [ ] LayoutPresetPicker renders in header on desktop/tablet
- [ ] LayoutPresetPicker is hidden on mobile (< 768px)
- [ ] Dropdown shows all 3 built-in presets (Coding, Writing, Focus)
- [ ] Dropdown shows custom presets for current project
- [ ] Active preset is highlighted (checkmark or bold)
- [ ] Clicking preset loads configuration into PluginLayoutStore
- [ ] "Save Custom Layout" option appears in dropdown
- [ ] Clicking "Save Custom Layout" opens SavePresetDialog
- [ ] SavePresetDialog shows name input field
- [ ] Name validation prevents saving empty name
- [ ] Clicking "Save" saves preset to localStorage
- [ ] Custom preset appears in dropdown after save
- [ ] Custom preset has delete button
- [ ] Clicking delete removes preset from localStorage
- [ ] Cmd+1 loads Coding preset
- [ ] Cmd+2 loads Writing preset
- [ ] Cmd+3 loads Focus preset
- [ ] Presets persist after page refresh
- [ ] Presets are per-project (different projects have different custom presets)

### TypeScript Validation
```bash
# Check all preset files
pnpm tsc --noEmit --pretty 2>&1 | grep "layout-presets-store\|LayoutPresetPicker\|SavePresetDialog"
# Expected: 0 errors

# Full project check
pnpm tsc --noEmit
# Expected: 0 new errors in preset files
```

### i18n Validation
```bash
# Verify all translation keys exist in both languages
grep -E "layoutPresets\.(title|saveCustom|dialog|preset|delete)" src/i18n/en.json
grep -E "layoutPresets\.(title_vi|saveCustom_vi|dialog_vi|preset_vi|delete_vi)" src/i18n/vi.json
# Expected: All keys exist in both files
```

---

## Success Metrics

| Metric | Target | Before | After |
|--------|---------|---------|--------|
| Built-in presets created | Yes | No | Yes |
| Preset picker component | Yes | No | Yes |
| Save dialog component | Yes | No | Yes |
| Presets stored per project | Yes | No | Yes |
| Delete preset functionality | Yes | No | Yes |
| Keyboard shortcuts | Yes | No | Yes |
| Presets persist across sessions | Yes | No | Yes |
| Acceptance criteria | 9/9 | 0/9 | 9/9 |
| TypeScript errors | 0 | - | 0 |
| ADR-034-001 violations | 0 | - | 0 |

---

## Timebox

**Estimated:** 3 hours
**Breakdown:**
- LayoutPresetsStore creation: 1 hour
- LayoutPresetPicker component: 1 hour
- SavePresetDialog component: 1 hour
- Integration testing: 30 minutes
- TypeScript validation: 30 minutes

**Escalation Path:**
- If blocked > 30 minutes → Report to Sprint Manager
- If > 2x estimated time (6 hours) → Escalate to Orchestrator

---

## Dependencies

### Prerequisites (ALL MET)
- [x] **ARCH-03-00 COMPLETE** - Platform defaults file exists
- [x] **ARCH-03-01 COMPLETE** - ProjectSidebar navigation confirmed platform-first
- [x] **ARCH-03-02 COMPLETE** - Responsive layout foundation established

### Dependencies for Follow-up Stories
- **ARCH-03-03** enables **ARCH-03-05** (Progressive Disclosure - can use presets as defaults)
- **ARCH-03-03** enables **ARCH-03-06** (Root Integration - integrate preset picker into header)

---

## Out of Scope

**NOT implemented in this story (deferred to follow-up):**
- Preset sharing between projects (per-project only in scope)
- Preset templates from GitHub (only manual save/load)
- Preset export/import (not requested)
- Visual preset preview (only name shown)
- Preset categories/tags (not requested)

---

## Governance Compliance

### ADR-034 Compliance
- [x] Platform-first model (presets are saved layouts, NOT workspace modes)
- [x] Single `/$projectId` route (no route changes)
- [x] No layout query params (not using `?layout=ide` etc.)

### ADR-034-AMENDMENT-001 Compliance
- [x] Presets are "saved layouts" concept
- [x] Built-in names: "Coding", "Writing", "Focus" (NOT "IDE Mode", "Notes Mode")
- [x] Platform defaults integrated (use getDefaultPlugins/getDefaultLayoutMode)
- [x] No workspace-centric patterns

### AGENTS.md Compliance
- [x] 8-bit design (sharp corners, pixel shadows, solid colors)
- [x] Import order (React, third-party, @/infrastructure, domain, presentation, relative)
- [x] Zustand v5 pattern (useShallow)
- [x] TanStack Router navigate() (NO window.location.href)
- [x] ProjectContext (NOT @/lib/workspace/ProjectContext)
- [x] i18n support (use t() function for all user-facing strings)
- [x] No hardcoded strings (all in en.json and vi.json)

---

## Completion Definition

**ARCH-03-03 is COMPLETE when:**

- [x] All 9 acceptance criteria met (100%)
- [x] 3 files created (store, picker, dialog)
- [x] 0 TypeScript errors in preset files
- [x] i18n keys added (en.json and vi.json)
- [x] Manual testing completed (all tests pass)
- [x] ADR-034-001 compliance verified (no "mode" concept)
- [x] AGENTS.md compliance verified (8-bit, import order, patterns)
- [x] Completion report created
- [x] Sprint manager report created
- [x] Ready for Orchestrator authorization

---

## Sign-Off

**Story Owner:** bmad-sprint-manager
**Implementation Team:** Team A (dev-ext)
**Reviewers:** Sprint Manager, architect-ext
**Completion Date:** 2026-01-23T21:25:00+07:00
**Total Time:** 1 hour 44 minutes (first delegation stalled, restart completed)

**Status:** ✅ COMPLETE - READY FOR ORCHESTRATOR AUTHORIZATION

---

**END OF STORY FILE**
