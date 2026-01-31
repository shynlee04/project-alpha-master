# Story CC-AR-02: Wire platform-defaults.ts to Route

**Story ID:** CC-AR-02
**Epic:** EPIC-CC-AR02AR03
**Type:** Correct-Course
**Created:** 2026-01-26
**Status:** IN_PROGRESS
**Priority:** P0
**Team:** Team A
**Effort:** 2-3 hours
**Depends On:** CC-AR-01 (COMPLETE)

---

## YAML Frontmatter

```yaml
story_id: CC-AR-02
epic_id: EPIC-CC-AR02AR03
title: "Wire platform-defaults.ts to Route"
priority: P0
status: IN_PROGRESS
team: A
effort_hours: 2-3
depends_on: [CC-AR-01]
blocks: [CC-AR-04]
```

---

## Problem Statement

The file `src/infrastructure/plugins/platform-defaults.ts` EXISTS (104 lines) but is NOT wired to the route.
This means platform-specific default plugins are NOT loaded on first project open.

**Current State:**
- `getDefaultPlugins()` and `getDefaultLayoutMode()` functions exist
- But the route `$projectId.tsx` never calls them
- Result: Users see empty or incorrect plugin layouts

---

## Files to Modify

```
src/routes/$projectId.tsx
src/presentation/layouts/PluginLayoutStore.ts (add initializeDefaults action)
```

---

## Implementation

### 1. Add initializeDefaults to PluginLayoutStore

```typescript
// In PluginLayoutStore.ts

interface PluginLayoutState {
  // ...existing state
  initializeDefaults: (plugins: PluginId[], mode: LayoutMode) => void;
}

// In create():
initializeDefaults: (plugins, mode) => {
  set({ activePlugins: plugins, layoutMode: mode });
}
```

### 2. Wire in $projectId.tsx

```typescript
import { getDefaultPlugins, getDefaultLayoutMode } from '@/infrastructure/plugins/platform-defaults';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';

function ProjectRoute() {
  const { projectId } = useParams();
  const projectContext = useProjectContext();
  const { activePlugins, initializeDefaults } = usePluginLayoutStore(
    useShallow((s) => ({ activePlugins: s.activePlugins, initializeDefaults: s.initializeDefaults }))
  );
  
  // Initialize defaults on first load for this project
  useEffect(() => {
    if (activePlugins.length === 0 && projectContext.project) {
      const defaultPlugins = getDefaultPlugins(projectContext.platform, projectContext.project);
      const defaultMode = getDefaultLayoutMode(projectContext.platform);
      initializeDefaults(defaultPlugins, defaultMode);
    }
  }, [projectContext.project?.id]);
  
  return <PluginLayout />;
}
```

---

## Acceptance Criteria

- [ ] AC1: `initializeDefaults()` action added to PluginLayoutStore
- [ ] AC2: `$projectId.tsx` calls `getDefaultPlugins()` on mount when activePlugins is empty
- [ ] AC3: Platform-first defaults work (desktop FSA = filetree+monaco+chat)
- [ ] AC4: Mobile defaults work (notes only)
- [ ] AC5: TypeScript: 0 new errors

---

## Validation Gate

```bash
pnpm tsc --noEmit
# Verify imports work:
grep -r "getDefaultPlugins" src/routes/
```

---

*Created: 2026-01-26*
*Depends On: CC-AR-01 (COMPLETE)*
