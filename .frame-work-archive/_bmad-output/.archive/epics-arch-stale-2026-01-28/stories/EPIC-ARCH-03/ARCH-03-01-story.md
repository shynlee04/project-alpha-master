---
Story ID: ARCH-03-01
Title: Create ProjectSidebar Component
Points: 8
Priority: P0
Status: pending
Team: Team A
Dependencies: None
Estimated Effort: 4 hours
Time Box: 4 hours
Created: 2026-01-22
ADR Reference: ADR-034 Phase 3
Epic Reference: EPIC-ARCH-03

---

## Description

As a developer working on the project-centric architecture, I want to create a ProjectSidebar component that provides project switching and chat thread access, so that users can navigate between projects and quickly access chat functionality from within the unified project layout.

This is the first story in EPIC-ARCH-03 (Layout System & UX) and creates a critical navigation component that will be integrated into the root layout in ARCH-03-06.

---

## Context

### Authority Documents

**ADR-034: Project-Centric Architecture**
- Path: `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md`
- Phase Status: Phase 3 (Layout System & UX) - IN PROGRESS
- Critical Sections:
  - Lines 80-103: Feature Plugin Architecture
  - Lines 105-120: Unified Layout System
  - Lines 202-220: Phase 3: Layout System & UX

**EPIC-ARCH-03: Layout System & UX**
- Path: `_bmad-output/planning-artifacts/epics/EPIC-ARCH-03-layout-ux-2026-01-21.md`
- Status: APPROVED - READY TO START
- Story Specification: Lines 200-275

**AGENTS.md: Project Alpha Governance**
- Path: `AGENTS.md`
- Version: 2.2.0
- Critical Rules:
  - 8-bit design system (no rounded corners, pixel shadows)
  - Zustand v5 with useShallow pattern
  - No hardcoded language strings
  - TypeScript: 0 errors required

### Pattern References from ARCH-02

Must reference these completed patterns when implementing:

- **ARCH-02-01:** FeaturePlugin interface definition
- **ARCH-02-02:** Plugin Registry pattern (module-level singleton)
- **ARCH-02-03:** ProjectContext Provider pattern (use `useProjectContext()`)
- **ARCH-02-04:** FileTree plugin component structure
- **ARCH-02-09:** PluginLayout container pattern

### Critical Dependencies

1. **ProjectContext** - Must use `useProjectContext()` from `@/infrastructure/context/project-context`
   - NOT `@/lib/workspace/ProjectContext` (deprecated)

2. **TanStack Router** - Must use `navigate()` from `@tanstack/react-router`
   - NEVER use `window.location.href` (ADR-034 violation)

3. **Zustand v5** - Must use `useShallow` for multiple selectors

4. **localStorage** - Persist sidebar state to localStorage

---

## Acceptance Criteria

1. [ ] **Collapsible sidebar with toggle button** - Sidebar can be collapsed/expanded with a toggle button
2. [ ] **Project list with current project highlighted** - Display all projects, highlight current project with active state
3. [ ] **Search/filter projects by name** - Text input to filter projects by name (real-time filtering)
4. [ ] **Click project navigates to `/$projectId`** - Use TanStack Router's `navigate()` function
5. [ ] **Chat threads section showing threads for current project** - List chat threads associated with the current project
6. [ ] **Click thread opens in Chat plugin** - Thread selection triggers Chat plugin activation
7. [ ] **Agent tools section (collapsed by default)** - Section for agent tools, collapsed by default
8. [ ] **Width resizable (drag edge)** - Drag sidebar edge to resize width (min 200px, max 400px)
9. [ ] **State persisted to localStorage** - Sidebar open/closed state, width, active section saved to localStorage
10. [ ] **8-bit design: sharp corners, pixel shadows, solid colors** - Follow 8-bit design rules from AGENTS.md
11. [ ] **TypeScript: 0 errors** - All TypeScript files compile without errors

---

## Files to Create

1. `src/presentation/components/sidebar/ProjectSidebar.tsx` - Main sidebar component
2. `src/presentation/components/sidebar/ProjectList.tsx` - Project list with search/filter
3. `src/presentation/components/sidebar/ChatThreadList.tsx` - Chat threads list for current project
4. `src/presentation/components/sidebar/AgentToolsPanel.tsx` - Collapsed agent tools section
5. `src/presentation/components/sidebar/SidebarSection.tsx` - Collapsible section component
6. `src/presentation/components/sidebar/index.ts` - Export all sidebar components
7. `src/infrastructure/persistence/stores/sidebar-store.ts` - Sidebar state management

Total: 7 files

---

## Design Specification (8-Bit)

### CSS Rules (NON-NEGOTIABLE)

```css
/* 8-bit Sidebar Design */
.sidebar {
  width: 280px;
  min-width: 200px;
  max-width: 400px;
  border-right: 2px solid #000;
  background: #f0f0f0;
  /* NO border-radius: 0 */
  /* NO transparency/glassmorphism */
}

.sidebar-section-header {
  padding: 8px 12px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 1px;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
  /* NO border-radius */
}

.sidebar-item {
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  /* NO border-radius */
}

.sidebar-item:hover {
  background: #e0e0e0;
  /* NO transparency */
}

.sidebar-item.active {
  background: #333;
  color: #fff;
  /* Solid colors only */
}

/* Pixel shadows only */
.sidebar-button {
  box-shadow: 4px 4px 0 0;
  /* NO blur/opacity */
}
```

### FORBIDDEN Design Elements

❌ `border-radius: 0.5rem` (too rounded)
❌ `border-radius: 9999px` (pill shape)
❌ `backdrop-filter: blur()` (glassmorphism)
❌ `opacity: 0.8` (avoid transparency)
❌ `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` (modern shadows)

### REQUIRED Design Elements

✅ `border-radius: 0` (sharp corners)
✅ `border-radius: 2px` (minimal rounding only)
✅ `box-shadow: 4px 4px 0 0` (pixel shadows)
✅ Solid background colors only
✅ High contrast text

---

## Component API

### ProjectSidebar Props

```typescript
interface ProjectSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentProjectId?: string;
}
```

### Internal Components

**ProjectList Props**
```typescript
interface ProjectListProps {
  projects: Project[];
  currentProjectId?: string;
  onSelectProject: (projectId: string) => void;
}

// Features:
// - Search input for filtering
// - List of projects with active state
// - Click to navigate to /$projectId
```

**ChatThreadList Props**
```typescript
interface ChatThreadListProps {
  threads: ChatThread[];
  currentProjectId: string;
  onSelectThread: (threadId: string) => void;
}

// Features:
// - List threads for current project only
// - Click to open in Chat plugin
```

**SidebarSection Props**
```typescript
interface SidebarSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

// Features:
// - Collapsible section with header
// - Icon + title + chevron
```

**AgentToolsPanel Props**
```typescript
interface AgentToolsPanelProps {
  isExpanded: boolean;
  onToggle: () => void;
  agents: Agent[];
}

// Features:
// - Collapsed by default
// - Shows available agents
// - Placeholder for full agent implementation
```

---

## Sidebar Store API

### Interface

```typescript
// src/infrastructure/persistence/stores/sidebar-store.ts
interface SidebarState {
  // State
  isOpen: boolean;
  activeSection: 'projects' | 'chat' | 'agents';
  width: number;
  searchQuery: string;

  // Actions
  toggle: () => void;
  setActiveSection: (section: 'projects' | 'chat' | 'agents') => void;
  setWidth: (width: number) => void;
  setSearchQuery: (query: string) => void;
}

// Storage: localStorage (key: 'viagent-sidebar-state')
// Persistence: On every state change
```

### Zustand Store Pattern (REQUIRED)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

interface SidebarState {
  isOpen: boolean;
  activeSection: 'projects' | 'chat' | 'agents';
  width: number;
  searchQuery: string;

  toggle: () => void;
  setActiveSection: (section: 'projects' | 'chat' | 'agents') => void;
  setWidth: (width: number) => void;
  setSearchQuery: (query: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      activeSection: 'projects',
      width: 280,
      searchQuery: '',

      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setActiveSection: (section) => set({ activeSection: section }),
      setWidth: (width) => set({ width }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'viagent-sidebar-state',
    }
  )
);

// ✅ ALWAYS use useShallow for multiple selectors
export const useSidebarShallow = () =>
  useSidebarStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      activeSection: state.activeSection,
      width: state.width,
      searchQuery: state.searchQuery,
    }))
  );
```

---

## Implementation Guidelines

### Import Order (MANDATORY)

```typescript
// 1. React/Framework
import React from 'react';
import { useNavigate } from '@tanstack/react-router';

// 2. Third-party
import { useShallow } from 'zustand/react/shallow';
import { Search, ChevronDown, Folder, MessageSquare } from 'lucide-react';

// 3. Infrastructure
import { useProjectContext } from '@/infrastructure/context/project-context';
import { useSidebarStore } from '@/infrastructure/persistence/stores/sidebar-store';

// 4. Domain
import type { Project } from '@/domain/types/project';
import type { ChatThread } from '@/domain/types/chat';

// 5. Presentation
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';

// 6. Relative
import { localHelper } from './utils';
```

### Navigation Pattern (MANDATORY)

```typescript
// ✅ CORRECT
import { useNavigate } from '@tanstack/react-router';

const navigate = useNavigate();

const handleProjectClick = (projectId: string) => {
  navigate({ to: '/$projectId', params: { projectId } });
};

// ❌ FORBIDDEN
const handleProjectClick = (projectId: string) => {
  window.location.href = `/${projectId}`;
};
```

### Project Context Pattern (MANDATORY)

```typescript
// ✅ CORRECT
import { useProjectContext } from '@/infrastructure/context/project-context';

const { currentProject, projects } = useProjectContext();

// ❌ FORBIDDEN
import { useProjectContext } from '@/lib/workspace/ProjectContext';
```

### Zustand Selector Pattern (MANDATORY)

```typescript
// ✅ CORRECT
const { isOpen, activeSection, toggle, setActiveSection } = useSidebarStore(
  useShallow((state) => ({
    isOpen: state.isOpen,
    activeSection: state.activeSection,
    toggle: state.toggle,
    setActiveSection: state.setActiveSection,
  }))
);

// ❌ FORBIDDEN
const isOpen = useSidebarStore((s) => s.isOpen);
const activeSection = useSidebarStore((s) => s.activeSection);
```

---

## Handoff Artifacts

### Pre-Implementation (Required)

- [ ] Story file validated 100% complete (this file)
- [ ] Context file created with all references
- [ ] Context file validated 100% complete

### Post-Implementation (Required)

- [ ] ARCH-03-01-completion.md - Completion report with:
  - Files created (7 files with line counts)
  - Acceptance criteria checklist (11/11 met)
  - TypeScript validation (0 errors)
  - Build validation (success)
  - 8-bit design compliance (100%)
  - Test results (if any)

---

## Validation Checklist

### Before Implementation

- [ ] All authority documents loaded (ADR-034, EPIC-ARCH-03, AGENTS.md)
- [ ] Story file created with all required sections
- [ ] Story file validated 100% complete
- [ ] Context file created
- [ ] Context file validated 100% complete
- [ ] Tool permissions defined for dev-ext delegation

### During Implementation

- [ ] All files created in canonical directories
- [ ] Import order followed correctly
- [ ] Zustand v5 pattern with useShallow
- [ ] TanStack Router navigate() used (no window.location.href)
- [ ] ProjectContext from infrastructure (not deprecated @/lib/workspace)
- [ ] 8-bit design rules followed (sharp corners, pixel shadows)

### After Implementation

- [ ] TypeScript compiles with 0 errors
- [ ] Application builds successfully
- [ ] No console errors in browser
- [ ] Sidebar renders on project routes
- [ ] All 11 acceptance criteria met
- [ ] Completion report created

---

## Escalation Path

### Stop Conditions (NON-NEGOTIABLE)

STOP and report to Sprint-Manager if:
1. TypeScript errors > 5 in sidebar files
2. Breaking changes introduced (old routes break)
3. ADR-034 violations detected
4. > 2x estimated time (8 hours) without progress
5. dev-ext blocked > 30 minutes without resolution

### Escalation Levels

| Level | Condition | Action |
|-------|-----------|--------|
| Minor | TypeScript errors < 3, resolvable | dev-ext fixes, report in completion |
| Major | TypeScript errors 3-5, or design violation | Sprint-Manager reviews, dev-ext fixes |
| Critical | Breaking changes, ADR-034 violations, or >5 errors | Escalate to Orchestrator |

---

## Success Metrics

| Metric | Target | Before | After |
|--------|---------|---------|--------|
| ProjectSidebar exists | Yes | No | Yes |
| Files created | 7 | 0 | 7 |
| Acceptance criteria | 11/11 | 0/11 | 11/11 |
| TypeScript errors | 0 | - | 0 |
| 8-bit compliance | 100% | - | 100% |
| Component renders | Yes | No | Yes |

---

## Story Status Tracking

| Step | Status | Timestamp | Notes |
|------|--------|-----------|-------|
| 1. Create story file | ✅ COMPLETE | 2026-01-22 | All sections included |
| 2. Validate story file | ⏳ PENDING | - | Waiting for validation |
| 3. Create context file | ⏳ PENDING | - | -
| 4. Validate context file | ⏳ PENDING | - | -
| 5. Delegate to dev-ext | ⏳ PENDING | - | -
| 6. Monitor dev-ext progress | ⏳ PENDING | - | -
| 7. Code review | ⏳ PENDING | - | -
| 8. Validation checklist | ⏳ PENDING | - | -
| 9. Report completion | ⏳ PENDING | - | -

---

## References

### Authority Documents

- **ADR-034**: `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md`
- **EPIC-ARCH-03**: `_bmad-output/planning-artifacts/epics/EPIC-ARCH-03-layout-ux-2026-01-21.md`
- **AGENTS.md**: `AGENTS.md`

### Pattern References (ARCH-02)

- **ARCH-02-01**: FeaturePlugin interface
- **ARCH-02-02**: Plugin Registry
- **ARCH-02-03**: ProjectContext Provider
- **ARCH-02-04**: FileTree plugin
- **ARCH-02-09**: PluginLayout

### Architecture Standards

- **ADR-033**: Correct Course Architectural Remediation
- **8-bit Design**: `agent-os/standards/frontend/css.md`
- **Zustand v5**: https://zustand.docs.pmnd.rs
- **TanStack Router**: https://tanstack.com/router

---

**END OF STORY ARCH-03-01**
