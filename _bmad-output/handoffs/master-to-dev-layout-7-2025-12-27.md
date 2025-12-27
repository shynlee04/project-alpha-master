# Handoff: LAYOUT-7 - Deprecate Old Layout Components

**Date:** 2025-12-27T11:25:00+07:00
**From:** @bmad-core-bmad-master
**To:** @bmad-bmm-dev
**Epic:** HOMEPAGE-LAYOUT (Home Page Layout Redesign)
**Story:** LAYOUT-7

---

## Context Summary

The Home Page Layout Redesign epic is creating a unified navigation system with a single collapsible sidebar. The new MainLayout component has been successfully implemented and integrated into all routes (home, projects, agents, knowledge, settings).

**Completed Stories:**
- LAYOUT-1: Created unified layout store (Zustand)
- LAYOUT-2: Created MainSidebar component
- LAYOUT-3: Created MainLayout component
- LAYOUT-4: Updated home route to use MainLayout
- LAYOUT-5: Updated projects route to use MainLayout
- LAYOUT-6: Updated agents, knowledge, settings routes to use MainLayout

**Current Status:** 6/10 stories DONE

---

## Task Specification

### Story: LAYOUT-7 - Deprecate Old Layout Components

**Priority:** P1
**Estimated Effort:** 30 minutes

### Acceptance Criteria

1. Add deprecation comments to `src/components/layout/IDELayout.tsx`
2. Add deprecation comments to `src/components/layout/HubLayout.tsx`
3. Add deprecation comments to `src/components/layout/HubSidebar.tsx`
4. Update `src/components/layout/index.ts` to mark these exports as deprecated
5. Verify build passes with `pnpm build`
6. No functional changes - only deprecation markers

### Constraints

**DO NOT:**
- Delete or modify the implementation of old layout components
- Remove any imports or exports
- Change any route files
- Modify MainLayout, MainSidebar, or layout-store.ts

**DO:**
- Add JSDoc `@deprecated` comments to component exports
- Add inline comments explaining the deprecation
- Reference the new MainLayout component in deprecation messages
- Keep all existing functionality intact

### Technical Details

**Files to Modify:**
1. `src/components/layout/IDELayout.tsx` - Add deprecation comment
2. `src/components/layout/HubLayout.tsx` - Add deprecation comment
3. `src/components/layout/HubSidebar.tsx` - Add deprecation comment
4. `src/components/layout/index.ts` - Mark exports as deprecated

**Deprecation Message Template:**
```typescript
/**
 * @deprecated Use MainLayout instead. This component is being phased out as part of the Home Page Layout Redesign epic.
 * See: src/components/layout/MainLayout.tsx
 */
```

---

## Current Workflow Status

**Epic Progress:** 6/10 stories DONE (60%)
**Next Story:** LAYOUT-7 (current)
**Remaining Stories:** LAYOUT-8, LAYOUT-9, LAYOUT-10

**Active Workflows:**
- MVP Epic: AI Coding Agent Vertical Slice (1/7 DONE)
- Home Page Layout Redesign (6/10 DONE)

---

## References

**Related Stories:**
- LAYOUT-3: Created MainLayout component
- LAYOUT-4: Updated home route to use MainLayout
- LAYOUT-5: Updated projects route to use MainLayout
- LAYOUT-6: Updated other routes to use MainLayout

**Architecture Document:**
- `_bmad-output/architecture/homepage-layout-redesign-2025-12-27.md`

**New Components:**
- `src/components/layout/MainLayout.tsx` - Replacement for old layouts
- `src/components/layout/MainSidebar.tsx` - Unified sidebar
- `src/lib/state/layout-store.ts` - Unified layout state

---

## Testing Checklist

- [ ] Run `pnpm build` - must pass with no errors
- [ ] Verify deprecation comments are present in all three old components
- [ ] Verify `src/components/layout/index.ts` marks exports as deprecated
- [ ] Verify no functional changes (components still work if imported)
- [ ] Check TypeScript compilation succeeds

---

## Completion Report

When complete, report back with:

1. **Modified Files:** List of files with deprecation comments added
2. **Build Verification:** Confirm `pnpm build` passed
3. **Deprecation Status:** Confirm all three components marked as deprecated
4. **Next Action:** Suggest LAYOUT-8 (Update Navigation Links) as next step

---

## Notes

This is a low-risk task that only adds documentation. The old components will remain functional until LAYOUT-9 (Remove Deprecated Components) in a future iteration. This gradual deprecation approach ensures no breaking changes during the migration.