# Architect Handoff: ADR-034-AMENDMENT-001 Impact

**Handoff ID:** `hnd_20260122_001_arch03`
**Date:** 2026-01-22
**Source Agent:** architect-ext
**Target Agent:** bmad-sprint-manager
**Status:** URGENT - REQUIRES IMMEDIATE ACTION
**Priority:** P0 - BLOCKING

---

## Executive Summary

During session 2026-01-21, I (architect-ext) created **ADR-034-AMENDMENT-001** which introduces a **breaking change** to the navigation and plugin initialization model. The team completed **ARCH-03-01 (ProjectSidebar)** BEFORE this amendment was created.

**The completed ARCH-03-01 code likely contains patterns that are now DEPRECATED.**

---

## What Changed (ADR-034-AMENDMENT-001)

### The Core Change

| Before (WRONG) | After (CORRECT) |
|----------------|-----------------|
| User picks "IDE mode" or "Notes mode" | User picks a PROJECT |
| `/ide/$projectId` and `/notes/$projectId` are separate routes | Single `/$projectId` route |
| `?layout=ide` and `?layout=notes` query params | NO layout query params |
| `LayoutPreset = 'ide' \| 'notes' \| 'custom'` | Platform determines plugins automatically |
| Navigation chooses route based on workspace | All navigation goes to `/$projectId` |

### New Mental Model

```
Platform determines what plugins are AVAILABLE.
User selects which AVAILABLE plugins are SHOWN.
There is no "IDE mode" or "Notes mode" - just a project with plugins.
```

---

## Impact on ARCH-03-01 (ProjectSidebar)

### What ARCH-03-01 Likely Has (DEPRECATED)

Based on the old architecture, ARCH-03-01 probably contains:

```typescript
// DEPRECATED PATTERNS - Check for these:

// 1. Navigation to workspace-specific routes
navigate({ to: '/ide/$projectId', params: { projectId } });
navigate({ to: '/notes/$projectId', params: { projectId } });

// 2. Conditional navigation based on platform
if (platform.canAccessIDE) {
  navigate({ to: '/ide/$projectId' });
} else {
  navigate({ to: '/notes/$projectId' });
}

// 3. Workspace selection UI/tabs
<TabButton>IDE</TabButton>
<TabButton>Notes</TabButton>

// 4. Layout query params
navigate({ to: '/$projectId', search: { layout: 'ide' } });
```

### What ARCH-03-01 Should Have (CORRECT)

```typescript
// CORRECT PATTERNS:

// 1. Single navigation target
navigate({ to: '/$projectId', params: { projectId } });

// 2. No conditional routing - just navigate
const handleProjectClick = (projectId: string) => {
  // Platform defaults will handle plugin selection in the route
  navigate({ to: '/$projectId', params: { projectId } });
};

// 3. No workspace tabs - just project list
// Platform determines what plugins are available

// 4. NO layout query params
navigate({ to: '/$projectId', params: { projectId } });
// NOT: search: { layout: 'ide' }
```

---

## Required Fix Story: ARCH-03-00

A new **BLOCKING** story must be completed BEFORE the current navigation in ARCH-03-01 can be finalized:

### Story: ARCH-03-00 - Platform-First Plugin Defaults

**Acceptance Criteria:**
1. Create `src/infrastructure/plugins/platform-defaults.ts`:
   - `getDefaultPlugins(platform, project): PluginId[]`
   - `getDefaultLayoutMode(platform): LayoutMode`

2. Update `src/routes/$projectId.tsx`:
   - Remove `LayoutPreset` type
   - Remove `PLUGIN_PRESETS` constant
   - Remove `LAYOUT_MODE_PRESETS` constant
   - Call `getDefaultPlugins()` when `activePlugins.length === 0`
   - Remove `initialPlugins` and `initialLayoutMode` props from `<PluginLayout>`

3. Update `src/routes/ide.$projectId.tsx`:
   - Change redirect from `{ to: '/$projectId', search: { layout: 'ide' } }`
   - To: `{ to: '/$projectId', params: { projectId } }` (NO search params)
   - Add console.warn deprecation message

4. Update `src/routes/notes.$projectId.tsx`:
   - Same changes as ide.$projectId.tsx

5. Update `src/presentation/layouts/PluginLayout.tsx`:
   - Remove `initialPlugins` and `initialLayoutMode` props (empty interface)

6. Update `src/presentation/layouts/PluginLayoutStore.ts`:
   - Add `initializeDefaults(plugins: PluginId[], mode: LayoutMode)` action
   - Add `hasUserCustomized: boolean` state flag

---

## Files to Review in ARCH-03-01

Check these files for deprecated navigation patterns:

| File | What to Check |
|------|---------------|
| `src/presentation/components/sidebar/ProjectSidebar.tsx` | Navigation calls |
| `src/presentation/components/sidebar/ProjectList.tsx` | Project click handlers |
| Any workspace switcher components | Tab/mode selection UI |

### Grep Commands for Sprint Manager

```bash
# Find deprecated navigation patterns
grep -rn "to: '/ide/" src/presentation/components/sidebar/
grep -rn "to: '/notes/" src/presentation/components/sidebar/
grep -rn "layout: 'ide'" src/presentation/components/sidebar/
grep -rn "layout: 'notes'" src/presentation/components/sidebar/

# Find what was created in ARCH-03-01
git log --oneline --since="2026-01-21" -- src/presentation/components/sidebar/
```

---

## Recommended Action Plan

### Option A: Sequential Fix (RECOMMENDED)

1. **PAUSE** ARCH-03-01 finalization
2. **IMPLEMENT** ARCH-03-00 first (platform-first defaults)
3. **UPDATE** ARCH-03-01 navigation to use `/$projectId` only
4. **CONTINUE** remaining ARCH-03 stories

### Option B: Parallel Fix

1. Assign ARCH-03-00 to Team A
2. Have Team B review ARCH-03-01 for deprecated patterns
3. Merge both when complete

---

## Critical Files Reference

### Created This Session
- `_bmad-output/planning-artifacts/adr/ADR-034-AMENDMENT-001-platform-first-2026-01-21.md`

### Updated This Session
- `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md` (Phase 2 complete, Amendment ref)
- `_bmad-output/planning-artifacts/epics/EPIC-ARCH-03-layout-ux-2026-01-21.md` (Added ARCH-03-00)

### Files Needing Changes (ARCH-03-00)
- `src/routes/$projectId.tsx`
- `src/routes/ide.$projectId.tsx`
- `src/routes/notes.$projectId.tsx`
- `src/presentation/layouts/PluginLayout.tsx`
- `src/presentation/layouts/PluginLayoutStore.ts`
- **NEW:** `src/infrastructure/plugins/platform-defaults.ts`

---

## Verification After ARCH-03-00

```bash
# Should return 0 matches (no layout params in routes)
grep -rn "layout.*ide\|layout.*notes" src/routes/

# Should return decreasing matches (old navigation being replaced)
grep -rn "to: '/ide/\|to: '/notes/" src/

# TypeScript should pass
pnpm tsc --noEmit
```

---

## Summary for Sprint Manager

1. **ARCH-03-01 was completed with OLD patterns** (workspace-centric navigation)
2. **ADR-034-AMENDMENT-001 changes the model** (platform-first, no workspace modes)
3. **ARCH-03-00 is a new BLOCKING story** that must be implemented
4. **ARCH-03-01 navigation needs updating** after ARCH-03-00 is done
5. **Old routes (/ide/$projectId, /notes/$projectId)** are now deprecated

**Action Required:** Review ARCH-03-01 code, implement ARCH-03-00, then update ARCH-03-01 navigation.

---

## Approval

- [x] Architect Agent (architect-ext) - 2026-01-22
- [ ] Sprint Manager - REQUIRED
- [ ] Dev Team Lead - REQUIRED

---

**END OF HANDOFF**
