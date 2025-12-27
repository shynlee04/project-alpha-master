# Handoff: LAYOUT-6 - Update Other Routes

**From:** @bmad-core-bmad-master  
**To:** @bmad-bmm-dev  
**Date:** 2025-12-27T11:13:00+07:00  
**Epic:** Home Page Layout Redesign  
**Story:** LAYOUT-6

---

## Context Summary

**Epic:** Home Page Layout Redesign - Create unified navigation system with single collapsible sidebar

**Previous Stories Completed:**
- ✅ LAYOUT-1: Created layout-store.ts (Zustand store)
- ✅ LAYOUT-2: Created MainSidebar.tsx (collapsible sidebar)
- ✅ LAYOUT-3: Created MainLayout.tsx (responsive layout wrapper)
- ✅ LAYOUT-4: Updated Home Route (index.tsx) to use MainLayout
- ✅ LAYOUT-5: Updated Projects Route (workspace/$projectId.tsx) to use MainLayout

**Current Story:** LAYOUT-6 - Update Other Routes

---

## Task Specification

### Objective
Update agents, knowledge, and settings routes to use MainLayout instead of custom layout wrappers, ensuring consistent navigation across the application.

### Files to Modify
1. [`src/routes/agents.tsx`](src/routes/agents.tsx)
2. [`src/routes/knowledge.tsx`](src/routes/knowledge.tsx)
3. [`src/routes/settings.tsx`](src/routes/settings.tsx)

### Acceptance Criteria

**For each route (agents, knowledge, settings):**
1. ✅ Replace custom `min-h-screen bg-background text-foreground` wrapper with MainLayout
2. ✅ Remove custom max-width containers (MainLayout handles this)
3. ✅ Keep existing page content (AgentsPanel, placeholder content, settings UI)
4. ✅ Verify route renders correctly with MainLayout
5. ✅ Verify MainSidebar navigation works
6. ✅ Verify sidebar collapse/expand functionality
7. ✅ Verify mobile menu overlay works

**Build Verification:**
8. ✅ Run `pnpm build` - no errors (pre-existing warnings acceptable)

### Constraints

**DO NOT:**
- ❌ Modify MainLayout.tsx (already complete)
- ❌ Modify MainSidebar.tsx (already complete)
- ❌ Modify layout-store.ts (already complete)
- ❌ Modify IDELayout.tsx (will be deprecated in LAYOUT-7)
- ❌ Modify HubLayout.tsx (will be deprecated in LAYOUT-7)
- ❌ Add new features or functionality

**ONLY:**
- ✅ Modify src/routes/agents.tsx
- ✅ Modify src/routes/knowledge.tsx
- ✅ Modify src/routes/settings.tsx

### Technical Details

**Pattern to Follow (from LAYOUT-4):**

**Before (current pattern in agents.tsx, knowledge.tsx, settings.tsx):**
```typescript
function AgentsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-6xl mx-auto p-6">
                {/* Page content */}
            </div>
        </div>
    );
}
```

**After (target pattern):**
```typescript
import { MainLayout } from '@/components/layout/MainLayout';

function AgentsPage() {
    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto p-6">
                {/* Page content */}
            </div>
        </MainLayout>
    );
}
```

**Key Changes:**
1. Add import: `import { MainLayout } from '@/components/layout/MainLayout';`
2. Remove outer `min-h-screen bg-background text-foreground` wrapper
3. Wrap content with `<MainLayout>` component
4. Keep inner content containers (max-w-6xl, p-6, etc.)

### Testing Checklist

**Manual Testing:**
- [ ] Navigate to /agents - verify MainLayout renders
- [ ] Navigate to /knowledge - verify MainLayout renders
- [ ] Navigate to /settings - verify MainLayout renders
- [ ] Click sidebar navigation items - verify routing works
- [ ] Toggle sidebar collapse/expand - verify state persists
- [ ] Test mobile menu overlay - verify it opens/closes correctly
- [ ] Verify page content displays correctly in all routes

**Build Verification:**
- [ ] Run `pnpm build` - confirm no errors

---

## Current Workflow Status

**Epic Progress:** 5/10 stories DONE (50%)

**Completed Stories:**
- LAYOUT-1: ✅ DONE (2025-12-27T10:30:00+07:00)
- LAYOUT-2: ✅ DONE (2025-12-27T10:45:00+07:00)
- LAYOUT-3: ✅ DONE (2025-12-27T11:00:00+07:00)
- LAYOUT-4: ✅ DONE (2025-12-27T11:05:00+07:00)
- LAYOUT-5: ✅ DONE (2025-12-27T11:12:00+07:00)

**Current Story:**
- LAYOUT-6: 🔄 IN_PROGRESS (2025-12-27T11:13:00+07:00)

**Next Actions:**
- LAYOUT-7: Deprecate old layout components
- LAYOUT-8: Update navigation links
- LAYOUT-9: Test responsive behavior
- LAYOUT-10: Update documentation

---

## References

**Related Stories:**
- LAYOUT-4: Update Home Route - [`_bmad-output/handoffs/master-to-dev-layout-4-2025-12-27.md`](_bmad-output/handoffs/master-to-dev-layout-4-2025-12-27.md)
- LAYOUT-5: Update Projects Route - [`_bmad-output/handoffs/master-to-dev-layout-5-2025-12-27.md`](_bmad-output/handoffs/master-to-dev-layout-5-2025-12-27.md)

**Architecture Documentation:**
- [`_bmad-output/architecture/homepage-layout-redesign-2025-12-27.md`](_bmad-output/architecture/homepage-layout-redesign-2025-12-27.md)

**Component Files:**
- [`src/components/layout/MainLayout.tsx`](src/components/layout/MainLayout.tsx)
- [`src/components/layout/MainSidebar.tsx`](src/components/layout/MainSidebar.tsx)
- [`src/lib/state/layout-store.ts`](src/lib/state/layout-store.ts)

**Route Files:**
- [`src/routes/index.tsx`](src/routes/index.tsx) (reference - already updated)
- [`src/routes/workspace/$projectId.tsx`](src/routes/workspace/$projectId.tsx) (reference - already updated)
- [`src/routes/agents.tsx`](src/routes/agents.tsx) (to update)
- [`src/routes/knowledge.tsx`](src/routes/knowledge.tsx) (to update)
- [`src/routes/settings.tsx`](src/routes/settings.tsx) (to update)

---

## Next Agent Assignment

**Mode:** @bmad-bmm-dev  
**Task:** Implement LAYOUT-6 - Update Other Routes

**Expected Output:**
1. Modified [`src/routes/agents.tsx`](src/routes/agents.tsx) using MainLayout
2. Modified [`src/routes/knowledge.tsx`](src/routes/knowledge.tsx) using MainLayout
3. Modified [`src/routes/settings.tsx`](src/routes/settings.tsx) using MainLayout
4. Build verification results (pnpm build)
5. Completion summary with attempt_completion

**Return To:** @bmad-core-bmad-master with completion report

---

## Notes

- All three routes follow the same pattern as the home route
- MainLayout provides the `min-h-screen bg-background text-foreground` wrapper
- Keep inner content containers for proper spacing and layout
- No WebContainer compatibility concerns for these routes (unlike workspace route)
- Build verification is critical - must pass before marking DONE