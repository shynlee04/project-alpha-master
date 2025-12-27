# Home Page Layout Architecture Redesign
## Technical Specification Document

**Document ID**: `ARCH-HOME-LAYOUT-2025-12-27`
**Created**: 2025-12-27
**Status**: Draft
**Version**: 1.0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture Analysis](#2-current-architecture-analysis)
3. [Proposed Unified Layout Architecture](#3-proposed-unified-layout-architecture)
4. [Routing Structure Specification](#4-routing-structure-specification)
5. [Component Architecture](#5-component-architecture)
6. [State Management Strategy](#6-state-management-strategy)
7. [Migration Plan](#7-migration-plan)
8. [Implementation Recommendations](#8-implementation-recommendations)

---

## 1. Executive Summary

### 1.1 Problem Statement

The home page layout architecture is fundamentally broken with duplicate navigation systems, misaligned routing, and components that are not properly wired together. This creates confusion for users and developers alike.

### 1.2 User's Vision

> "Something centering (hence the main sidebar that is collapsible with icons -> that at the home page it will be topic-based onboarding; quick actions and portal cards to other sections, centering the project managements while the other tabs bring the user to other interfaces from the IDE-workspace to the agent management center, to knowledge synthesis hub etc."

### 1.3 Key Requirements

- **Single collapsible sidebar** with icons as main navigation
- **Topic-based onboarding** at home page
- **Quick actions** (open folder, create project)
- **Portal cards** to other sections (IDE, Agents, Knowledge, Settings)
- **Project management** as primary focus
- **Unified navigation** (no duplicate systems)

---

## 2. Current Architecture Analysis

### 2.1 Navigation Components and Relationships

| Component | Location | Purpose | Issues |
|-----------|----------|---------|--------|
| [`Header.tsx`](src/components/Header.tsx:1-127) | Header | Top bar with logo, theme, language | Contains duplicate mobile menu sidebar (lines 47-124) |
| [`HubLayout.tsx`](src/components/layout/HubLayout.tsx:1-63) | Layout | Layout wrapper | Has [`HubSidebar`](src/components/hub/HubSidebar.tsx) (line 43) - conflicting system |
| [`HubSidebar.tsx`](src/components/hub/HubSidebar.tsx:1-164) | Sidebar | Collapsible sidebar with icons | Proper collapse state management via [`useHubStore`](src/lib/state/hub-store.ts) |
| [`HubHomePage.tsx`](src/components/hub/HubHomePage.tsx:1-249) | Home | Topic-based onboarding, portal cards | Portal cards navigate to routes that may not exist |

### 2.2 Duplicate/Conflicting Systems

**Problem 1: Two Separate Navigation Systems**
```
Header's Mobile Menu (lines 47-124 in Header.tsx)
├── Home
├── IDE  
├── Agents
├── Knowledge
└── Settings

HubSidebar (HubSidebar.tsx)
├── Home (/hub)
├── IDE (/workspace)
├── Agents (/agents)
├── Knowledge (/knowledge)
└── Settings (/settings)
```

**Problem 2: Layout Structure Wrong**
```
Current: Header (top) + HubSidebar (left) + main content
Expected: Single collapsible sidebar (left) + main content (no duplicate header menu)
```

**Problem 3: Routing Misalignment**
```
src/routes/index.tsx:
├── Route: /
├── Layout: HubLayout
└── Component: HubHomePage

HubSidebar.tsx navigates to:
├── /hub (but route is /)
├── /workspace (exists: workspace/$projectId.tsx)
├── /agents (exists: agents.tsx)
├── /knowledge (exists: knowledge.tsx)
└── /settings (exists: settings.tsx)
```

### 2.3 Current State Management

[`useHubStore`](src/lib/state/hub-store.ts:46-71) manages:
- `activeSection`: 'home' | 'ide' | 'agents' | 'knowledge' | 'settings'
- `sidebarCollapsed`: boolean
- `navigationHistory`: string[]

**Issue**: Header has separate `useState(false)` for mobile menu (line 19 in Header.tsx) - not coordinated with `useHubStore`.

### 2.4 Current Routing Structure

```
src/routes/
├── __root.tsx              # Root route
├── index.tsx               # Home (/) - wraps with HubLayout
├── hub.tsx                 # Hub layout route
├── ide.tsx                 # IDE route
├── agents.tsx              # Agents route
├── knowledge.tsx           # Knowledge route
├── settings.tsx            # Settings route
├── workspace/
│   └── $projectId.tsx      # Dynamic workspace route
└── api/
    └── chat.ts             # Chat API endpoint
```

---

## 3. Proposed Unified Layout Architecture

### 3.1 New Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header (simplified)                                        │
│  ┌─────────┌────────────────────────────────────────────┐   │
│  │ Logo    │ Theme Toggle | Language Switcher | User   │   │
│  └─────────┴────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────┬──────────────────────────────────────────────────┐ │
│ │     │                                                  │ │
│ │ ☰   │         MAIN CONTENT AREA                       │ │
│ │     │                                                  │ │
│ │ 📁   │  ┌──────────────────────────────────────────┐  │ │
│ │ 🤖   │  │                                          │  │ │
│ │ 🧠   │  │         HubHomePage                      │  │ │
│ │ ⚙️   │  │                                          │  │ │
│ │     │  │  • Topic-based onboarding                 │  │ │
│ │     │  │  • Quick actions (open folder)            │  │ │
│ │     │  │  • Portal cards to sections               │  │ │
│ │     │  │  • Recent projects (centering PM)         │  │ │
│ │     │  │                                          │  │ │
│ │     │  └──────────────────────────────────────────┘  │ │
│ │ ◀   │                                                  │ │
│ └─────┴──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Sidebar Navigation Items

| Icon | Label | Route | Priority |
|------|-------|-------|----------|
| 🏠 | Home | `/` | Primary |
| 📁 | Projects | `/workspace` | Primary |
| 🤖 | Agents | `/agents` | Secondary |
| 🧠 | Knowledge | `/knowledge` | Secondary |
| ⚙️ | Settings | `/settings` | Secondary |

### 3.3 Component Architecture

```
src/components/
├── layout/
│   ├── MainLayout.tsx          # NEW: Unified layout wrapper
│   ├── Header.tsx              # MODIFIED: Simplified, no mobile menu
│   ├── HubSidebar.tsx          # MODIFIED: Only sidebar, no duplicate
│   └── HubLayout.tsx           # REMOVE: Deprecated
└── hub/
    ├── HubHomePage.tsx         # MODIFIED: Topic-based onboarding
    ├── QuickActions.tsx        # NEW: Open folder, create project
    ├── PortalCards.tsx         # NEW: Cards to sections
    ├── RecentProjects.tsx      # NEW: Project list
    └── TopicOnboarding.tsx     # NEW: Onboarding content
```

### 3.4 State Management

**New/Modified Stores**:

```typescript
// src/lib/state/layout-store.ts
interface LayoutState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;  // NEW: Unified mobile state
  activeNavItem: NavItem;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setActiveNavItem: (item: NavItem) => void;
}

export const useLayoutStore = create<LayoutState>()(persist(...));
```

---

## 4. Routing Structure Specification

### 4.1 Proposed Route Hierarchy

```
src/routes/
├── __root.tsx                    # Root with MainLayout
├── index.tsx                     # Home (/)
│   └── HubHomePage               # Topic-based onboarding
├── workspace/
│   ├── index.tsx                 # Workspace list (/workspace)
│   └── $projectId.tsx            # IDE with project (/workspace/$projectId)
├── agents/
│   └── index.tsx                 # Agent center (/agents)
├── knowledge/
│   └── index.tsx                 # Knowledge hub (/knowledge)
└── settings/
    └── index.tsx                 # Settings (/settings)
```

### 4.2 Route Parameters

| Route | Parameters | Description |
|-------|------------|-------------|
| `/` | None | Home with onboarding |
| `/workspace` | None | Project list |
| `/workspace/$projectId` | `projectId` | IDE for specific project |
| `/agents` | None | Agent management |
| `/knowledge` | None | Knowledge synthesis |
| `/settings` | None | Application settings |

### 4.3 TanStack Router Layout Pattern

Using pathless layout for shared navigation:

```typescript
// src/routes/_layout.tsx
export const Route = createFileRoute('/_layout')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <div className="flex h-screen">
      <MainSidebar />
      <Outlet />
    </div>
  )
}
```

---

## 5. Component Architecture

### 5.1 New Components

#### MainLayout.tsx
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useLayoutStore();
  
  return (
    <div className="flex min-h-screen bg-background">
      <MainSidebar />
      <main className={cn(
        "flex-1 transition-all duration-200",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <Header />
        {children}
      </main>
    </div>
  );
};
```

#### MainSidebar.tsx
```typescript
interface MainSidebarProps {
  className?: string;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({ className }) => {
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'projects', icon: Folder, label: 'Projects', path: '/workspace' },
    { id: 'agents', icon: Bot, label: 'Agents', path: '/agents' },
    { id: 'knowledge', icon: Brain, label: 'Knowledge', path: '/knowledge' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
  ];
  
  return (
    <aside className={cn(sidebarVariants({ collapsed: sidebarCollapsed }), className)}>
      {/* Logo */}
      <div className="h-14 border-b border-border flex items-center">
        {!sidebarCollapsed && <span className="font-bold">Via-gent</span>}
      </div>
      
      {/* Nav Items */}
      <nav className="flex-1 py-4">
        {navItems.map(item => (
          <NavItem key={item.id} item={item} isActive={location.pathname === item.path} />
        ))}
      </nav>
      
      {/* Collapse Toggle */}
      <button onClick={toggleSidebar}>
        {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
      </button>
    </aside>
  );
};
```

### 5.2 Modified Components

#### Header.tsx (Simplified)
- Remove mobile menu sidebar (lines 47-124)
- Keep logo, theme toggle, language switcher, user menu
- Add hamburger menu trigger for mobile sidebar

#### HubHomePage.tsx (Enhanced)
- Keep topic-based onboarding
- Add QuickActions component
- Add PortalCards component
- Keep RecentProjects section

### 5.3 Removed Components

- `HubLayout.tsx` - Deprecated, replaced by MainLayout
- Duplicate mobile menu in Header.tsx

---

## 6. State Management Strategy

### 6.1 Unified Layout Store

```typescript
// src/lib/state/layout-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NavItem = 'home' | 'projects' | 'agents' | 'knowledge' | 'settings';

interface LayoutState {
  // Sidebar state
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  
  // Navigation state
  activeNavItem: NavItem;
  previousPath: string | null;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setActiveNavItem: (item: NavItem) => void;
  setPreviousPath: (path: string | null) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      activeNavItem: 'home',
      previousPath: null,
      
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMobileMenuOpen: (open) => set({ sidebarMobileOpen: open }),
      setActiveNavItem: (item) => set({ activeNavItem: item }),
      setPreviousPath: (path) => set({ previousPath: path }),
    }),
    {
      name: 'via-gent-layout-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeNavItem: state.activeNavItem,
      }),
    }
  )
);
```

### 6.2 Integration with Existing Stores

- **Keep** `useHubStore` for backward compatibility (deprecated in future)
- **New** `useLayoutStore` for unified sidebar state
- **Migrate** `Header.tsx` mobile menu state to `useLayoutStore`

---

## 7. Migration Plan

### 7.1 Phase 1: Foundation (Day 1)

1. **Create new layout store**
   - Create `src/lib/state/layout-store.ts`
   - Implement Zustand store with persistence

2. **Create MainSidebar component**
   - Create `src/components/layout/MainSidebar.tsx`
   - Implement collapsible sidebar with icons
   - Wire to `useLayoutStore`

3. **Create MainLayout component**
   - Create `src/components/layout/MainLayout.tsx`
   - Integrate Header + MainSidebar

### 7.2 Phase 2: Routing Updates (Day 2)

1. **Update __root.tsx**
   - Wrap with MainLayout

2. **Create workspace index route**
   - Create `src/routes/workspace/index.tsx`
   - Project list page

3. **Update route links in MainSidebar**
   - Ensure all navigation targets exist

### 7.3 Phase 3: Component Cleanup (Day 3)

1. **Modify Header.tsx**
   - Remove duplicate mobile menu
   - Add hamburger menu trigger
   - Wire to `useLayoutStore`

2. **Modify HubHomePage.tsx**
   - Add QuickActions component
   - Add PortalCards component

3. **Deprecate HubLayout.tsx**
   - Remove from routing
   - Mark for removal in v2.0

### 7.4 Phase 4: Cleanup (Day 4)

1. **Remove duplicate code**
   - Delete unused navigation from Header.tsx
   - Remove HubLayout.tsx
   - Clean up imports

2. **Update translations**
   - Add new i18n keys
   - Update existing keys

3. **Test all navigation paths**
   - Verify sidebar navigation works
   - Verify mobile menu works
   - Verify project opening works

---

## 8. Implementation Recommendations

### 8.1 Priority Order

1. **P0**: Create `useLayoutStore` - Foundation for all changes
2. **P0**: Create `MainSidebar.tsx` - Core navigation component
3. **P0**: Create `MainLayout.tsx` - Layout wrapper
4. **P1**: Update `__root.tsx` to use MainLayout
5. **P1**: Create `workspace/index.tsx` route
6. **P1**: Simplify `Header.tsx` - remove duplicate menu
7. **P2**: Add QuickActions and PortalCards
8. **P2**: Deprecate `HubLayout.tsx`

### 8.2 Breaking Changes

| Change | Impact | Mitigation |
|--------|--------|------------|
| Remove `HubLayout.tsx` | Routes using it need update | Update `index.tsx` to use `MainLayout` |
| Change sidebar width | CSS adjustments | Use CSS variables |
| New route `/workspace` | Existing links may break | Redirect old links |

### 8.3 Testing Strategy

1. **Unit Tests**
   - `useLayoutStore` actions
   - `MainSidebar` navigation
   - `MainLayout` rendering

2. **Integration Tests**
   - Full navigation flow
   - Mobile menu toggle
   - Sidebar collapse/expand

3. **E2E Tests**
   - User journey: Home → Projects → IDE
   - Mobile responsiveness
   - Sidebar state persistence

### 8.4 Files to Modify

```
NEW:
├── src/lib/state/layout-store.ts
├── src/components/layout/MainSidebar.tsx
├── src/components/layout/MainLayout.tsx
├── src/components/layout/QuickActions.tsx
├── src/components/layout/PortalCards.tsx
└── src/routes/workspace/index.tsx

MODIFY:
├── src/routes/__root.tsx
├── src/components/Header.tsx
├── src/components/hub/HubHomePage.tsx
└── src/i18n/en.json, vi.json

REMOVE (later):
├── src/components/layout/HubLayout.tsx
└── src/lib/state/hub-store.ts (after migration)
```

---

## Appendix A: Research References

### A.1 TanStack Router Documentation

- **Context7 Library ID**: `/tanstack/router`
- **Nested Layout Routes**: Using `route.tsx` pattern with `Outlet` component
- **Pathless Layouts**: Using `id` instead of `path` for grouping

### A.2 State Management

- **Zustand**: Current state management solution
- **Persistence**: Using `persist` middleware with localStorage

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| MainSidebar | New unified collapsible sidebar with icons |
| HubHomePage | Home page component with onboarding, portal cards |
| PortalCards | Navigation cards to other sections |
| QuickActions | Buttons for open folder, create project |
| Layout Store | New Zustand store for sidebar state |

---

**Document Ends**

*For questions or clarifications, contact the Architecture team.*
