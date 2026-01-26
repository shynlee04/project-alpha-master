# Architecture: Correct Route Structure

**Document ID:** ARCH-ROUTE-STRUCTURE-2026-01-26
**Author:** architect-ext
**Version:** 1.0.0

---

## Current State (WRONG - 20 Routes)

```
src/routes/
├── __root.tsx                     # ROOT - Keep (but fix double sidebar)
├── index.tsx                      # REDIRECT - Keep (redirects to /hub)
├── hub.tsx                        # CORRECT - Hub route
├── $projectId.tsx                 # CORRECT - Project route (but incomplete)
├── about.tsx                      # ACCEPTABLE - Standalone info page
├── about.lazy.tsx                 # ACCEPTABLE - Lazy load for about
│
├── ide.$projectId.tsx             # ❌ LEGACY - Archive
├── ide.tsx                        # ❌ LEGACY - Archive
├── notes.$projectId.tsx           # ❌ LEGACY - Archive
├── notes.lazy.tsx                 # ❌ LEGACY - Archive
├── workspace/                     # ❌ LEGACY - Archive entire directory
│   ├── $projectId.tsx
│   └── index.tsx
├── agents.tsx                     # ❌ LEGACY - Archive (move to /$projectId)
├── settings.tsx                   # ❌ LEGACY - Archive (move to /$projectId modal)
├── projects.tsx                   # ❌ LEGACY - Archive (move to /hub)
├── debug.tsx                      # DEV ONLY - Keep
├── test-*.tsx                     # DEV ONLY - Keep
├── webcontainer.$.tsx             # DEV ONLY - Keep
└── $__debug__.provider-playground.tsx  # DEV ONLY - Keep
```

---

## Target State (CORRECT - 2 Routes + Utilities)

```
src/routes/
├── __root.tsx                     # ROOT - Single sidebar, theme, providers
├── index.tsx                      # REDIRECT - Always redirects to /hub
├── hub.tsx                        # HUB - Project management, no project loaded
├── $projectId.tsx                 # PROJECT - Project loaded with plugins
├── about.tsx                      # INFO - Standalone about page
├── about.lazy.tsx                 # INFO - Lazy loaded
│
└── api/                           # API - Server functions (keep)
    ├── chat.ts
    ├── providers.ts
    └── ...
```

**Total: 6 user-facing routes (vs current 20)**

---

## Route Responsibilities

### /__root.tsx

**Purpose:** Application shell with providers and single sidebar

```tsx
export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <I18nProvider>
        <div className="flex h-screen">
          {/* SINGLE sidebar - not conditional, not duplicated */}
          <ProjectSidebar />
          
          {/* Main content area */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </I18nProvider>
    </ThemeProvider>
  ),
});
```

**Key Changes:**
- Remove `UnifiedWorkspaceProvider` import
- Remove conditional sidebar logic
- Single `ProjectSidebar` component
- No double sidebar rendering

### /hub.tsx

**Purpose:** Project management when no project is loaded

```tsx
export const Route = createFileRoute('/hub')({
  component: HubPage,
});

function HubPage() {
  return (
    <div className="p-6">
      <h1>Projects</h1>
      <ProjectList />
      <CreateProjectButton />
    </div>
  );
}
```

**Key Changes:**
- Remove "workspace" terminology
- Remove WorkspacePieChart
- Remove workspace tabs (WORKSPACE, AGENTS, KNOWLEDGE)
- Focus on project list and creation

### /$projectId.tsx

**Purpose:** Project loaded with plugin layout

```tsx
export const Route = createFileRoute('/$projectId')({
  component: ProjectPage,
  loader: async ({ params }) => {
    // Load project from store
    return loadProject(params.projectId);
  },
});

function ProjectPage() {
  const { projectId } = useParams();
  
  return (
    <ProjectContextProvider projectId={projectId}>
      <PluginLayout />
    </ProjectContextProvider>
  );
}
```

**Key Changes:**
- Complete implementation of ProjectContextProvider
- Platform-aware plugin selection
- Single plugin layout (not double)
- Settings via modal/drawer (not separate route)

---

## Navigation Flow

```mermaid
graph TD
    START[User Opens App] --> ROOT[/__root.tsx]
    ROOT --> INDEX[/index.tsx]
    INDEX -->|redirect| HUB[/hub]
    
    HUB --> |"No project"| PROJECT_LIST[Show Project List]
    HUB --> |"Create project"| CREATE[Create Project Flow]
    CREATE -->|"Success"| PROJECT[/$projectId]
    
    PROJECT_LIST --> |"Select project"| PROJECT
    
    PROJECT --> CONTEXT[ProjectContextProvider]
    CONTEXT --> LAYOUT[PluginLayout]
    
    LAYOUT --> FILETREE[FileTree Plugin]
    LAYOUT --> CHAT[Chat Plugin]
    LAYOUT --> OPTIONAL[Optional Plugins]
    
    OPTIONAL --> MONACO[Monaco]
    OPTIONAL --> TERMINAL[Terminal]
    OPTIONAL --> NOTES[Notes]
    OPTIONAL --> PREVIEW[Preview]
```

---

## Component Hierarchy

```
App
└── __root.tsx (ThemeProvider, I18nProvider)
    └── ProjectSidebar (SINGLE sidebar)
    └── Outlet
        ├── /hub → HubPage
        │   ├── ProjectList
        │   └── CreateProjectButton
        │
        └── /$projectId → ProjectPage
            └── ProjectContextProvider
                └── PluginLayout
                    ├── PluginToolbar (toggle buttons)
                    └── PluginGrid
                        ├── FileTree (always)
                        ├── Chat (always)
                        ├── Monaco (optional)
                        ├── Terminal (optional)
                        ├── Notes (optional)
                        └── Preview (optional)
```

---

## Files to Archive

### Priority 1 (Block Other Work)

| File | Reason | Archive Path |
|------|--------|--------------|
| `src/routes/ide.$projectId.tsx` | Legacy workspace route | `_bmad-ext/.archive/legacy-routes-2026-01-26/` |
| `src/routes/notes.$projectId.tsx` | Legacy workspace route | `_bmad-ext/.archive/legacy-routes-2026-01-26/` |
| `src/routes/workspace/$projectId.tsx` | Legacy workspace route | `_bmad-ext/.archive/legacy-routes-2026-01-26/` |
| `src/routes/workspace/index.tsx` | Legacy workspace route | `_bmad-ext/.archive/legacy-routes-2026-01-26/` |

### Priority 2 (After Routes Fixed)

| File | Reason | Archive Path |
|------|--------|--------------|
| `src/routes/ide.tsx` | No longer needed | `_bmad-ext/.archive/legacy-routes-2026-01-26/` |
| `src/routes/notes.lazy.tsx` | No longer needed | `_bmad-ext/.archive/legacy-routes-2026-01-26/` |
| `src/routes/agents.tsx` | Move to /$projectId | `_bmad-ext/.archive/legacy-routes-2026-01-26/` |
| `src/routes/settings.tsx` | Move to /$projectId modal | `_bmad-ext/.archive/legacy-routes-2026-01-26/` |
| `src/routes/projects.tsx` | Merge into /hub | `_bmad-ext/.archive/legacy-routes-2026-01-26/` |

---

## Import Cleanup

After archiving routes, update imports in:

1. `src/routeTree.gen.ts` - Regenerate with `pnpm build`
2. `src/routes/__root.tsx` - Remove workspace imports
3. `src/presentation/components/layout/MainSidebar.tsx` - Remove workspace navigation
4. `src/presentation/components/hub/HubHomePage.tsx` - Remove workspace references

---

## Validation Commands

```bash
# Count routes (should be ~6 user-facing)
ls src/routes/*.tsx | wc -l

# Check for workspace imports in routes
grep -r "workspace" src/routes/ --include="*.tsx"

# TypeScript validation
pnpm tsc --noEmit

# Generate route tree
pnpm build
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| User-facing routes | 20 | 6 |
| Workspace references in routes | 15+ | 0 |
| Double sidebar instances | 2 | 0 |
| TypeScript errors | 0 | 0 |
