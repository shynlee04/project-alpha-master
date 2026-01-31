# CC-AR-12: Fix Single Sidebar Architecture

## Story Metadata

| Field | Value |
|--------|--------|
| **Story ID** | CC-AR-12 |
| **Epic ID** | EPIC-CC-AR02AR03 |
| **Title** | Fix Single Sidebar Architecture |
| **Team** | Team A |
| **Priority** | P1 |
| **Status** | READY |
| **Effort** | 2 hours |
| **Depends On** | CC-AR-08 |

---

## User Story

**As a** user viewing the application on desktop,
**I want to** see ONE sidebar with useful content (not two empty sidebars),
**So that** the UI is clean and navigation is intuitive.

---

## Problem Statement

The application currently has a **double sidebar issue**:
- Two sidebars rendering simultaneously
- Empty sidebar with no useful content
- Workspace provider imports (deprecated)
- Confusing UI

### Current Problem

```
__root.tsx
├── Sidebar 1 (empty/useless)
├── Sidebar 2 (ProjectSidebar - useful)
└── main (Outlet)
```

### Target Architecture

```
__root.tsx
└── ThemeProvider
    └── div.flex
        ├── ProjectSidebar (SINGLE)   # Always visible on desktop
        │   ├── Project name/switcher
        │   ├── Quick actions
        │   ├── Recent projects
        │   └── Settings icon
        └── main (Outlet)
            └── Page content
```

---

## Acceptance Criteria

- [ ] ONE sidebar visible on desktop (not two)
- [ ] Sidebar has useful content (project switcher, quick actions, recent projects)
- [ ] Mobile uses bottom navigation instead of sidebar
- [ ] No empty sidebar panels
- [ ] Workspace provider imports removed
- [ ] TypeScript compiles with 0 errors

---

## Files to Modify

```
src/routes/__root.tsx              # Remove conditional sidebar logic
src/presentation/components/sidebar/ProjectSidebar.tsx  # Ensure useful content
```

---

## Implementation Plan

### Step 1: Remove Double Sidebar Logic from __root.tsx

```typescript
// BEFORE (double sidebar):
{isDesktop && <ProjectSidebar />}
{!isDesktop && <ProjectSidebar />}
{isDesktop && <SomeOtherSidebar />}  // REMOVE THIS

// AFTER (single sidebar):
<ProjectSidebar />
```

### Step 2: Ensure ProjectSidebar has Useful Content

```typescript
// src/presentation/components/sidebar/ProjectSidebar.tsx

export function ProjectSidebar() {
  const { projects, activeProject } = useProjectStore();
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-card border-r border-border">
      {/* Project Name/Switcher */}
      <div className="p-4 border-b border-border">
        <h2 className="font-bold text-lg">Projects</h2>
        <Button onClick={() => navigate({ to: '/' })}>
          Switch Project
        </Button>
      </div>

      {/* Recent Projects */}
      <div className="p-4">
        <h3 className="text-sm font-medium mb-2">Recent</h3>
        <ul className="space-y-1">
          {projects.slice(0, 5).map(project => (
            <li key={project.id}>
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/$projectId', params: { projectId: project.id } })}
              >
                {project.name}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
        <Button onClick={() => navigate({ to: '/settings' })}>
          Settings
        </Button>
      </div>
    </aside>
  );
}
```

### Step 3: Remove Workspace Provider Imports

```typescript
// __root.tsx

// DELETE these imports:
import { WorkspaceProvider } from '@/infrastructure/context/workspace-context';
// ... other workspace-related imports

// REPLACE with:
import { ProjectContextProvider } from '@/infrastructure/context/project-context';
```

### Step 4: Mobile Bottom Navigation

```typescript
// __root.tsx

{!isDesktop && (
  <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
    <div className="flex justify-around p-2">
      <Button onClick={() => navigate({ to: '/' })}>Projects</Button>
      <Button onClick={() => navigate({ to: '/settings' })}>Settings</Button>
    </div>
  </nav>
)}
```

---

## Dependencies

**Depends On**: CC-AR-08 (Split PluginLayout.tsx - ensures clean layout structure)

**Blocks**: None (terminal story for this epic)

---

## Validation Gate

```bash
# TypeScript check
pnpm tsc --noEmit

# Manual test
# 1. Open app on desktop - verify ONE sidebar visible
# 2. Verify sidebar has useful content
# 3. Open app on mobile - verify bottom navigation (no sidebar)
```

---

## Breaking Changes

**UI Changes**:
- Double sidebar removed → Single sidebar
- Empty sidebar panels removed
- Workspace terminology removed

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Sidebars visible (desktop) | 2 (double) | 1 (single) |
| Empty sidebar panels | 1+ | 0 |
| Sidebar with useful content | 1 | 1 |
| Workspace provider imports | 3+ | 0 |
| TypeScript errors | 0 | 0 |

---

## Notes

- Mobile: No sidebar, use bottom navigation for actions
- Desktop: Single sidebar with project switcher + recent + settings
- ProjectSidebar component should be the authoritative sidebar component

---

**Created**: 2026-01-26
**Story Type**: Correct-Course (Foundation Reset)
**ADR Reference**: ADR-034 (Project-Centric Architecture)
