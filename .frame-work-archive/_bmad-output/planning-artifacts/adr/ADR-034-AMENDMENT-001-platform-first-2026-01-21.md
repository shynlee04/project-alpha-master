# ADR-034 Amendment 001: Platform-First Plugin Selection

**Amendment ID:** ADR-034-AMEND-001
**Date:** 2026-01-21
**Status:** APPROVED - INTEGRATE IMMEDIATELY
**Applies To:** EPIC-ARCH-03 (in-progress)
**Author:** architect-ext
**Priority:** P0 - BLOCKING

---

## Problem Statement

The current implementation still has vestiges of **workspace-centric thinking**:

```typescript
// CURRENT (WRONG)
type LayoutPreset = 'ide' | 'notes' | 'custom';

// Routes redirect with "mode" concept
/ide/$projectId    → /$projectId?layout=ide
/notes/$projectId  → /$projectId?layout=notes

// Hub navigates to "workspaces"
navigate({ to: '/ide/$projectId' })
navigate({ to: '/notes/$projectId' })
```

**This violates ADR-034's core principle:**
> "Route → Project → Feature Plugins"
> NOT: "Route → Project → Workspace Mode → Features"

---

## Decision

### Replace "IDE mode" vs "Notes mode" with Platform-First Defaults

**The mental model change:**

| OLD (Workspace-Centric) | NEW (Platform-First) |
|-------------------------|---------------------|
| User chooses "IDE mode" or "Notes mode" | Platform determines available plugins |
| `/ide/$projectId` is a separate experience | Single `/$projectId` with platform-filtered plugins |
| Mobile "can't access IDE" | Mobile simply doesn't show IDE-only plugins |
| User picks a workspace, then a project | User picks a project, platform shows available tools |

### New Type Definitions

```typescript
// BEFORE (Wrong)
type LayoutPreset = 'ide' | 'notes' | 'custom';

// AFTER (Correct)
type SavedPreset = 
  | 'default'     // Platform-appropriate defaults (REQUIRED)
  | 'coding'      // FileTree + Monaco + Terminal + Chat (desktop-fsa only)
  | 'writing'     // FileTree + Notes + Chat (all platforms)
  | 'focus'       // Single plugin fullscreen
  | string;       // User-defined custom preset ID
```

### Platform-Aware Default Plugins

```typescript
// src/infrastructure/plugins/platform-defaults.ts

import type { PluginId } from '@/domain/types/plugin-types';
import type { PlatformContract } from '@/infrastructure/filesystem/platform-detection';
import type { Project } from '@/domain/entities/project';

/**
 * Get default plugins based on platform and project
 * 
 * This replaces the "ide mode" vs "notes mode" concept.
 * Platform determines what's AVAILABLE, not what "mode" you're in.
 */
export function getDefaultPlugins(
  platform: PlatformContract,
  project: Project
): PluginId[] {
  // Desktop with FSA: Full development experience
  if (platform.deviceType === 'desktop' && project.storageType === 'fsa') {
    return ['filetree', 'monaco', 'chat'];
  }
  
  // Desktop with IndexedDB: Notes-focused (no real files)
  if (platform.deviceType === 'desktop' && project.storageType === 'indexeddb') {
    return ['filetree', 'notes', 'chat'];
  }
  
  // Tablet: Notes-focused (no terminal)
  if (platform.deviceType === 'tablet') {
    return ['filetree', 'notes', 'chat'];
  }
  
  // Mobile: Minimal (single plugin at a time)
  if (platform.deviceType === 'mobile') {
    return ['notes'];  // Just notes, chat accessible via sidebar
  }
  
  // Fallback
  return ['notes', 'chat'];
}

/**
 * Get default layout mode based on platform
 */
export function getDefaultLayoutMode(
  platform: PlatformContract
): '1-column' | '2-column' | '3-column' | '2+1' {
  if (platform.deviceType === 'mobile') {
    return '1-column';  // Always single panel on mobile
  }
  
  if (platform.deviceType === 'tablet') {
    return '2-column';  // Max 2 panels on tablet
  }
  
  // Desktop: 2-column default, user can change
  return '2-column';
}
```

---

## Migration Plan

### Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `src/routes/$projectId.tsx` | Replace `LayoutPreset` with `SavedPreset`, use `getDefaultPlugins()` | P0 |
| `src/routes/ide.$projectId.tsx` | Add deprecation warning, change redirect to `/$projectId` (no layout param) | P1 |
| `src/routes/notes.$projectId.tsx` | Add deprecation warning, change redirect to `/$projectId` (no layout param) | P1 |
| `src/presentation/layouts/PluginLayout.tsx` | Remove initialPlugins/initialLayoutMode props, use store defaults | P0 |
| `src/presentation/layouts/PluginLayoutStore.ts` | Add `initializeDefaults(platform, project)` action | P0 |
| `src/presentation/components/hub/HubHomePage.tsx` | Navigate to `/$projectId` instead of `/ide/$projectId` or `/notes/$projectId` | P1 |
| `src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts` | Update navigation | P2 |

### New Files to Create

| File | Description |
|------|-------------|
| `src/infrastructure/plugins/platform-defaults.ts` | `getDefaultPlugins()`, `getDefaultLayoutMode()` |

---

## Implementation Details

### 1. Update $projectId.tsx Route

```typescript
// BEFORE
type LayoutPreset = 'ide' | 'notes' | 'custom';
const PLUGIN_PRESETS: Record<LayoutPreset, PluginId[]> = {
  ide: ['filetree', 'monaco', 'terminal', 'chat'],
  notes: ['filetree', 'notes', 'chat'],
  custom: [],
};

// AFTER
import { getDefaultPlugins, getDefaultLayoutMode } from '@/infrastructure/plugins/platform-defaults';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-detection';

// No more preset types - just load from store or use platform defaults
function UnifiedProjectRoute() {
  const { projectId } = Route.useParams();
  const { project } = Route.useLoaderData();
  const platform = getPlatformContract();
  
  // Initialize layout store with platform-appropriate defaults
  const layoutStore = usePluginLayoutStore();
  
  useEffect(() => {
    // Only set defaults if user hasn't customized
    if (layoutStore.activePlugins.length === 0) {
      const defaultPlugins = getDefaultPlugins(platform, project);
      const defaultMode = getDefaultLayoutMode(platform);
      layoutStore.initializeDefaults(defaultPlugins, defaultMode);
    }
  }, [project.id]);
  
  return (
    <ProjectContextProvider projectId={projectId}>
      <PluginLayout />  {/* No props - reads from store */}
    </ProjectContextProvider>
  );
}
```

### 2. Update Old Routes (Add Deprecation)

```typescript
// src/routes/ide.$projectId.tsx
beforeLoad: async ({ params }) => {
  const { projectId } = params;
  
  // Log deprecation warning
  console.warn(
    '[DEPRECATED] /ide/$projectId route is deprecated. ' +
    'Use /$projectId instead. Platform detection handles plugin availability.'
  );
  
  // Redirect to unified route WITHOUT layout param
  // Platform defaults will handle what plugins to show
  throw redirect({ 
    to: '/$projectId', 
    params: { projectId },
    // NO search params - let platform decide
  });
},

// Same for notes.$projectId.tsx
```

### 3. Update PluginLayout.tsx

```typescript
// BEFORE
interface PluginLayoutProps {
  initialPlugins?: PluginId[];
  initialLayoutMode?: LayoutMode;
}

// AFTER
interface PluginLayoutProps {
  // No props - reads from store
  // Store is initialized by route based on platform
}
```

### 4. Update PluginLayoutStore.ts

```typescript
// Add new action
interface PluginLayoutState {
  // ... existing
  initializeDefaults: (plugins: PluginId[], mode: LayoutMode) => void;
  hasUserCustomized: boolean;  // NEW: Track if user modified layout
}

// Implementation
initializeDefaults: (plugins, mode) => {
  set((state) => {
    // Only initialize if not already customized
    if (state.hasUserCustomized) {
      return state;
    }
    return {
      ...state,
      activePlugins: plugins,
      layoutMode: mode,
    };
  });
},
```

### 5. Update HubHomePage.tsx Navigation

```typescript
// BEFORE
if (platform.canAccessIDE && project.storageType === 'fsa') {
  navigate({ to: '/ide/$projectId', params: { projectId } });
} else {
  navigate({ to: '/notes/$projectId', params: { projectId } });
}

// AFTER
// Always navigate to unified route
// Platform detection in the route handles what plugins to show
navigate({ to: '/$projectId', params: { projectId } });
```

---

## Integration with ARCH-03-01 (In-Progress)

The team is currently implementing ProjectSidebar (ARCH-03-01). This amendment should be integrated as follows:

### What ARCH-03-01 Should Do

1. **ProjectList in sidebar** navigates to `/$projectId` (not `/ide/$projectId` or `/notes/$projectId`)
2. **No "workspace" tabs** in sidebar - just projects and chat threads
3. **Project card** shows available plugins based on platform (not workspace icons)

### Sidebar Navigation Pattern

```typescript
// In ProjectSidebar's ProjectList
const handleProjectClick = (projectId: string) => {
  // Just navigate to project - platform handles the rest
  navigate({ to: '/$projectId', params: { projectId } });
  
  // Store will initialize plugins based on platform if needed
  // User's customizations are preserved per project
};
```

---

## Affected Components Checklist

### Routes (P0 - Do First)
- [ ] `src/routes/$projectId.tsx` - Remove LayoutPreset, use platform defaults
- [ ] `src/routes/ide.$projectId.tsx` - Add deprecation, redirect without layout param
- [ ] `src/routes/notes.$projectId.tsx` - Add deprecation, redirect without layout param

### Layout System (P0 - Do Second)
- [ ] `src/presentation/layouts/PluginLayout.tsx` - Remove props
- [ ] `src/presentation/layouts/PluginLayoutStore.ts` - Add `initializeDefaults()`

### New File (P0 - Do Third)
- [ ] `src/infrastructure/plugins/platform-defaults.ts` - Create platform defaults

### Navigation (P1 - Do After Routes Work)
- [ ] `src/presentation/components/hub/HubHomePage.tsx` - 6 navigation calls to update
- [ ] `src/presentation/components/hub/WorkspaceBadge.tsx` - Update documentation
- [ ] `src/presentation/components/project/ProjectCreationWizard.tsx` - Update navigation

### ARCH-03-01 Integration (P1 - During Implementation)
- [ ] `src/presentation/components/sidebar/ProjectSidebar.tsx` - Navigate to `/$projectId`
- [ ] `src/presentation/components/sidebar/ProjectList.tsx` - No workspace logic

### Low Priority Cleanup (P2 - After ARCH-03 Complete)
- [ ] `src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts`
- [ ] Remove "workspace" concept from remaining legacy code

---

## Verification Commands

```bash
# 1. After implementing changes, verify no "layout=ide" or "layout=notes"
grep -rn "layout.*ide\|layout.*notes" src/routes/
# Expected: Only deprecation comments, no functional usage

# 2. Verify unified navigation
grep -rn "to: '/ide/\|to: '/notes/" src/
# Expected: 0 matches (all updated to use /$projectId)

# 3. Verify new platform defaults file exists
ls src/infrastructure/plugins/platform-defaults.ts
# Expected: File exists

# 4. TypeScript check
pnpm tsc --noEmit
# Expected: 0 errors (related to this change)
```

---

## Rollback Strategy

If this amendment causes issues:

1. **Revert `$projectId.tsx`** to use `LayoutPreset` and `PLUGIN_PRESETS`
2. **Restore redirect params** in `ide.$projectId.tsx` and `notes.$projectId.tsx`
3. **Keep platform-defaults.ts** but don't use it

The changes are isolated to routing and layout initialization.

---

## Timeline

| Task | Owner | When |
|------|-------|------|
| Create `platform-defaults.ts` | Team A | During ARCH-03-01 |
| Update `PluginLayoutStore.ts` | Team B | During ARCH-03-02 |
| Update `$projectId.tsx` | Team A | Before ARCH-03-03 |
| Update old routes (deprecation) | Team B | During ARCH-03-04 |
| Update HubHomePage navigation | Team A | During ARCH-03-06 |

---

## Summary

**Key Mental Model Change:**
- ~~User picks "IDE mode" or "Notes mode"~~
- ✅ User picks a project, platform determines available tools
- ✅ User can customize which available plugins to show
- ✅ Customizations are saved per project
- ✅ Platform capabilities are the source of truth

**This eliminates:**
- The concept of "workspaces" (IDE, Notes, etc.)
- The `?layout=ide` and `?layout=notes` query params
- Navigation to `/ide/$projectId` or `/notes/$projectId` (deprecated)
- The mental overhead of "which workspace am I in?"

**This establishes:**
- Single unified route `/$projectId`
- Platform-first plugin availability
- User customization on top of platform defaults
- Clean separation of concerns

---

## Approval

- [x] Architect Agent (architect-ext) - 2026-01-21
- [ ] User (Product Owner) - REQUIRED
- [ ] Dev Team Lead

**BLOCKING: Team should pause ARCH-03-01 navigation logic until this is approved.**
