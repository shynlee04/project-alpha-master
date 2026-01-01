# Platform Unification Phase 3.2 - Iteration 42: Codebase Analysis for Project CRUD

**Date:** 2026-01-02
**Epic:** Platform Unification (Phase 3)
**Iteration:** 42
**Purpose:** Comprehensive analysis of Hub components and patterns for implementing project CRUD operations

---

## Executive Summary

The codebase has been packed using Repomix, generating a **2,107,026-line XML snapshot** containing 4,321 files. This analysis extracts critical information for implementing project CRUD operations in the Hub UI with focus on:

1. **Hub Components Structure** - 9 component files identified
2. **ProjectCard Implementation** - 180-line component with workspace badges
3. **Radix UI DropdownMenu** - 3 distinct usage patterns found
4. **Project Store CRUD** - 5 core operations available
5. **i18n Patterns** - Hierarchical key organization
6. **Icon Usage** - Lucide React icons throughout

---

## 1. Hub Components Structure

### File Listing (Line Counts)

| Component | Lines | Purpose | Status |
|-----------|-------|---------|--------|
| `HubHomePage.tsx` | ~200 | Main hub page with project grid | ✅ Active |
| `ProjectCard.tsx` | 180 | Project card with workspace badges | ✅ Active |
| `WorkspaceBadge.tsx` | 140 | Reusable badge component | ✅ Active |
| `WorkspaceBindingDialog.tsx` | 320 | Dialog for workspace bindings | ✅ Active |
| `MobileProjectSelector.tsx` | ~80 | Mobile-specific project selector | ✅ Active |
| `NavigationBreadcrumbs.tsx` | ~100 | Breadcrumb navigation | ✅ Active |
| `RecentProjectsSection.tsx` | ~120 | Recent projects display | ✅ Active |
| `TopicCard.tsx` | ~120 | Topic card component | ✅ Active |
| `TopicPortalCard.tsx` | ~130 | Topic portal card | ✅ Active |

**Test Files:** 4 test files (NavigationBreadcrumbs, TopicCard, TopicPortalCard, HubHomePage)

---

## 2. ProjectCard Component Analysis

### Current Implementation (180 lines)

**Location:** `src/presentation/components/hub/ProjectCard.tsx`

```typescript
export interface ProjectCardProps {
  /** Project metadata */
  project: ProjectMetadata;
  /** Click handler for opening project (shows dialog) */
  onOpen: (projectId: string) => void;
  /** Additional className */
  className?: string;
}

// Key Features:
// - Project name, path, last opened display
// - Workspace badges for enabled workspaces (IDE, Notes, Knowledge, Study)
// - Badge click → Direct navigation to workspace (skips dialog)
// - Quick-open buttons on hover (desktop only)
// - 8-bit styling with hover effects

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpen,
  className,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Get enabled workspaces from bindings
  const boundWorkspaces = useMemo(
    () => getEnabledWorkspaces(project.workspaceBindings),
    [project.workspaceBindings]
  );

  // Handle workspace badge click (direct navigation, skip dialog)
  const handleWorkspaceClick = (workspace: WorkspaceId) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click (dialog)
      navigate({
        to: `/${workspace}/$projectId`,
        params: { projectId: project.id },
      });
    };
  };
  // ... rest of component
}
```

### Current Props Interface

```typescript
interface ProjectMetadata {
  id: string;
  name: string;
  folderPath: string;
  fsaHandle: FileSystemDirectoryHandle;
  lastOpened: Date;
  autoSync?: boolean;
  layoutState?: LayoutConfig;
  exclusionPatterns?: string[];
  // NOTE: workspaceBindings field referenced but not shown in this snippet
}
```

### Key Dependencies

- `@tanstack/react-router` - Navigation
- `date-fns` - Time formatting
- `lucide-react` - Icons (Folder, Clock, CheckCircle2)
- `./WorkspaceBadge` - Badge component
- `@/lib/utils` - cn() utility

---

## 3. Radix UI DropdownMenu Usage Patterns

### Pattern 1: Simple ContextMenu (614824)

**Location:** Found in multiple locations

```typescript
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export interface ContextMenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
}

export function ContextMenu({ trigger, items, onSelect }: ContextMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="context-menu" sideOffset={5}>
          {items.map((item, index) => (
            <DropdownMenu.Item
              key={index}
              className="context-menu-item"
              onSelect={() => onSelect(item)}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

### Pattern 2: UI Component Wrapper (1000643)

**Location:** `src/presentation/components/ui/dropdown-menu.tsx`

```typescript
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

// ... more wrapper components
```

### Pattern 3: Workspace Switcher (1993951)

**Location:** `src/presentation/components/hub/` (usage example)

```typescript
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronsUpDown } from 'lucide-react';

const WORKSPACE_CONFIG: Record<
  WorkspaceId,
  { icon: string; labelKey: string; color: string }
> = {
  ide: {
    icon: '💻',
    labelKey: 'hub.workspaceBinding.workspaces.ide',
    color: 'text-blue-400',
  },
  // ... other workspaces
};

// Usage with ChevronsUpDown icon for dropdown trigger
```

**Key Findings:**
- **3 distinct patterns** for DropdownMenu usage
- **Portal-based** rendering in all patterns
- **sideOffset** commonly set to 5
- **Custom styling** via className prop
- **asChild pattern** for trigger customization

---

## 4. Project Store CRUD Operations

### Available Operations (from project-store.ts)

**Location:** `src/lib/workspace/project-store.ts` (364 lines)

```typescript
export interface ProjectMetadata {
  id: string;
  name: string;
  folderPath: string;
  fsaHandle: FileSystemDirectoryHandle;
  lastOpened: Date;
  autoSync?: boolean;
  layoutState?: LayoutConfig;
  exclusionPatterns?: string[];
}

// CRUD Operations:
async function saveProject(project: ProjectMetadata): Promise<void>
async function getProject(id: string): Promise<ProjectMetadata | null>
async function listProjects(): Promise<ProjectMetadata[]>
async function deleteProject(id: string): Promise<void>
async function updateLastAccessed(id: string): Promise<void>

// Extended Operations:
async function listProjectsWithPermission(): Promise<ProjectWithPermission[]>
async function checkProjectPermission(projectId: string): Promise<FsaPermissionState>
```

### Permission-Aware Listing

```typescript
export interface ProjectWithPermission extends ProjectMetadata {
  permissionState: FsaPermissionState;
}

export async function listProjectsWithPermission(): Promise<ProjectWithPermission[]> {
  const projects = await listProjects();
  const projectsWithPermission = await Promise.all(
    projects.map(async (project) => {
      try {
        const permissionState = await getPermissionState(project.fsaHandle, 'readwrite');
        return { ...project, permissionState };
      } catch {
        return { ...project, permissionState: 'denied' as FsaPermissionState };
      }
    })
  );
  return projectsWithPermission;
}
```

**Key Findings:**
- **5 core CRUD operations** available
- **Permission-aware listing** already implemented
- **IndexedDB-based** persistence (via idb library)
- **File System Access API** integration (fsaHandle field)
- **Dexie.js migration** planned (Epic 27)

---

## 5. i18n Patterns

### Translation File Structure

**Location:** `src/i18n/en.json` and `src/i18n/vi.json`

#### Hierarchical Organization

```json
{
  "button": {
    "primary": "Submit",
    "secondary": "Cancel",
    "ghost": "Clear",
    "outline": "Edit",
    "destructive": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "close": "Close",
    "loading": "Loading..."
  },
  "input": {
    "default": "Enter text",
    "error": "This field has an error",
    "required": "This field is required",
    "placeholder": "Type here..."
  },
  "hub": {
    "workspaceBinding": {
      "workspaces": {
        "ide": "IDE Workspace",
        "notes": "Notes Workspace",
        "knowledge": "Knowledge Workspace",
        "study": "Study Workspace"
      }
    }
  }
}
```

### Usage Pattern in Components

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <button>
      {t('button.primary')}
    </button>
  );
}
```

### Key Extraction Workflow

1. **Add translation keys** to both en.json and vi.json
2. **Run `pnpm i18n:extract`** to verify extraction
3. **Use `__STRING_NOT_TRANSLATED__`** as placeholder
4. **Replace with actual translations** before commit

**Key Findings:**
- **Hierarchical namespace** organization (feature.area.key)
- **useTranslation hook** in components
- **i18next-scanner** for automatic extraction
- **English + Vietnamese** support
- **Consistent 2-space** indentation

---

## 6. Icon Usage Patterns

### Lucide React Icons

**Commonly Used Icons in Hub/Project Components:**

```typescript
// ProjectCard.tsx imports:
import {
  Folder,        // Project folder icon
  Clock,         // Last opened time
  CheckCircle2,  // Status indicator
} from 'lucide-react';

// WorkspaceBindingDialog imports:
import { ChevronsUpDown } from 'lucide-react';

// Button component:
import { Loader2 } from 'lucide-react';

// Canvas components:
import {
  FlipHorizontal,
  RotateCcw,
  Check,
  X,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  Brain,
  TrendingUp,
} from 'lucide-react';

// IDE components:
import {
  Terminal,
  FileCode,
  Settings,
} from 'lucide-react';
```

### Recommended Icons for ProjectActionsMenu

```typescript
import {
  MoreVertical,  // Dropdown trigger (3 dots)
  Edit2,         // Edit project
  Trash2,        // Delete project
  Copy,          // Duplicate project
  ExternalLink,  // Open in new window
  Settings,      // Project settings
  RefreshCw,     // Sync/refresh
  FolderOpen,    // Open folder
} from 'lucide-react';
```

**Key Findings:**
- **Lucide React** is the standard icon library
- **Consistent import** from 'lucide-react'
- **Descriptive names** (Edit2, Trash2 vs Edit, Trash)
- **Icon composition** via React components

---

## 7. Recommendations for ProjectActionsMenu

### Implementation Approach (January 2026 Patterns)

#### File Structure

```
src/presentation/components/hub/
├── ProjectActionsMenu.tsx        # NEW - Actions dropdown menu
├── ProjectCard.tsx               # MODIFY - Add actions trigger
├── WorkspaceBadge.tsx            # Existing
├── HubHomePage.tsx               # MODIFY - Wire up handlers
└── index.ts                      # MODIFY - Export new component
```

#### Component Architecture

**1. ProjectActionsMenu.tsx (NEW)**

```typescript
/**
 * @fileoverview Project Actions Menu Component
 * @module presentation/components/hub/ProjectActionsMenu
 * @governance Story PU-42: Project CRUD Operations
 *
 * Dropdown menu for project management actions.
 * Supports: Edit, Delete, Duplicate, Open Folder, Settings
 */

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslation } from 'react-i18next';
import {
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  FolderOpen,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectMetadata } from '@/lib/workspace/project-store';

export interface ProjectActionsMenuProps {
  /** Project metadata */
  project: ProjectMetadata;
  /** Edit handler */
  onEdit?: (project: ProjectMetadata) => void;
  /** Delete handler */
  onDelete?: (projectId: string) => void;
  /** Duplicate handler */
  onDuplicate?: (project: ProjectMetadata) => void;
  /** Open folder handler */
  onOpenFolder?: (project: ProjectMetadata) => void;
  /** Settings handler */
  onSettings?: (project: ProjectMetadata) => void;
  /** Additional className */
  className?: string;
}

export const ProjectActionsMenu: React.FC<ProjectActionsMenuProps> = ({
  project,
  onEdit,
  onDelete,
  onDuplicate,
  onOpenFolder,
  onSettings,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'project-actions-trigger',
            'hover:bg-muted',
            'rounded-md',
            'p-1',
            className
          )}
          aria-label={t('hub.project.actions.menuTrigger')}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="dropdown-menu-content"
          sideOffset={5}
          align="end"
        >
          {/* Edit */}
          {onEdit && (
            <DropdownMenu.Item
              className="dropdown-menu-item"
              onSelect={() => onEdit(project)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {t('hub.project.actions.edit')}
            </DropdownMenu.Item>
          )}

          {/* Duplicate */}
          {onDuplicate && (
            <DropdownMenu.Item
              className="dropdown-menu-item"
              onSelect={() => onDuplicate(project)}
            >
              <Copy className="w-4 h-4 mr-2" />
              {t('hub.project.actions.duplicate')}
            </DropdownMenu.Item>
          )}

          {/* Open Folder */}
          {onOpenFolder && (
            <DropdownMenu.Item
              className="dropdown-menu-item"
              onSelect={() => onOpenFolder(project)}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              {t('hub.project.actions.openFolder')}
            </DropdownMenu.Item>
          )}

          {/* Settings */}
          {onSettings && (
            <DropdownMenu.Item
              className="dropdown-menu-item"
              onSelect={() => onSettings(project)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {t('hub.project.actions.settings')}
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Separator />

          {/* Delete */}
          {onDelete && (
            <DropdownMenu.Item
              className="dropdown-menu-item destructive"
              onSelect={() => onDelete(project.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('hub.project.actions.delete')}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
```

**2. ProjectCard.tsx Modifications**

```typescript
// Add to ProjectCardProps:
export interface ProjectCardProps {
  project: ProjectMetadata;
  onOpen: (projectId: string) => void;
  onEdit?: (project: ProjectMetadata) => void;      // NEW
  onDelete?: (projectId: string) => void;           // NEW
  onDuplicate?: (project: ProjectMetadata) => void; // NEW
  onOpenFolder?: (project: ProjectMetadata) => void;// NEW
  onSettings?: (project: ProjectMetadata) => void;  // NEW
  className?: string;
}

// Add to JSX (after quick-open buttons):
<ProjectActionsMenu
  project={project}
  onEdit={onEdit}
  onDelete={onDelete}
  onDuplicate={onDuplicate}
  onOpenFolder={onOpenFolder}
  onSettings={onSettings}
/>
```

**3. HubHomePage.tsx Handler Implementation**

```typescript
// Add handlers:
const handleEditProject = async (project: ProjectMetadata) => {
  // TODO: Implement edit dialog (Phase 3.3)
  console.log('Edit project:', project.id);
};

const handleDeleteProject = async (projectId: string) => {
  const { t } = useTranslation();

  // Show confirmation dialog
  const confirmed = window.confirm(
    t('hub.project.actions.deleteConfirm')
  );

  if (confirmed) {
    await deleteProject(projectId);
    // Refresh project list
    await loadProjects();
  }
};

const handleDuplicateProject = async (project: ProjectMetadata) => {
  // TODO: Implement duplication (Phase 3.4)
  console.log('Duplicate project:', project.id);
};

const handleOpenFolder = async (project: ProjectMetadata) => {
  // Use File System Access API to show folder
  try {
    // @ts-ignore - FSA API
    await project.fsaHandle.requestPermission({ mode: 'readwrite' });
    // Open in OS file manager
    window.open(`file://${project.folderPath}`, '_blank');
  } catch (error) {
    console.error('Failed to open folder:', error);
  }
};

const handleProjectSettings = async (project: ProjectMetadata) => {
  // TODO: Implement settings dialog (Phase 3.5)
  console.log('Project settings:', project.id);
};

// Pass to ProjectCard:
<ProjectCard
  project={project}
  onOpen={handleOpenRecentProject}
  onEdit={handleEditProject}
  onDelete={handleDeleteProject}
  onDuplicate={handleDuplicateProject}
  onOpenFolder={handleOpenFolder}
  onSettings={handleProjectSettings}
/>
```

#### Translation Keys (en.json)

```json
{
  "hub": {
    "project": {
      "actions": {
        "menuTrigger": "Project actions",
        "edit": "Edit Project",
        "delete": "Delete Project",
        "duplicate": "Duplicate Project",
        "openFolder": "Open in File Manager",
        "settings": "Project Settings",
        "deleteConfirm": "Are you sure you want to delete this project? This action cannot be undone."
      }
    }
  }
}
```

#### Translation Keys (vi.json)

```json
{
  "hub": {
    "project": {
      "actions": {
        "menuTrigger": "Hành động dự án",
        "edit": "Chỉnh Sửa Dự Án",
        "delete": "Xóa Dự Án",
        "duplicate": "Nhân Bản Dự Án",
        "openFolder": "Mở Trong Trình Quản Lý Tập Tin",
        "settings": "Cài Đặt Dự Án",
        "deleteConfirm": "Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác."
      }
    }
  }
}
```

---

## 8. January 2026 Patterns Compliance

### Component Size Standards

- **Max 120 lines per component** - ProjectActionsMenu estimated ~100 lines
- **Max 3 functions per module** - Menu component + handler logic (separated)
- **Max 5 dependencies per component** - Within limits
- **Max 3 nesting levels** - Flat DropdownMenu.Item structure

### Zustand v5 Best Practices

```typescript
// Individual selectors (prevent infinite loops):
const projects = useAppStore(s => s.projects)
const deleteProject = useAppStore(s => s.deleteProject)

// NOT: const { projects, deleteProject } = useAppStore();
```

### Design Tokens

```css
/* From design-tokens.css */
--color-primary: #f97316;
--color-background: #1a1a1a;
--color-text-primary: #ffffff;
--color-text-secondary: #a0a0a0;
--spacing-4: 0.25rem;
--spacing-8: 0.5rem;
--font-size-body: 0.875rem;
--animation-duration-fast: 150ms;
--animation-easing-8bit: cubic-bezier(0.4, 0, 0.2, 1);
```

### Error Handling

```typescript
// Use global-error-handling skill
try {
  await deleteProject(projectId);
} catch (error) {
  // ErrorBoundary will catch
  // Show toast notification
  toast.error(t('hub.project.actions.deleteError'));
}
```

---

## 9. Dependencies & External References

### Package Dependencies

| Package | Version | Status | Purpose |
|---------|---------|--------|---------|
| @radix-ui/react-dropdown-menu | Latest | ✅ Installed | Dropdown menu primitives |
| lucide-react | Latest | ✅ Installed | Icon library |
| react-i18next | Latest | ✅ Installed | i18n framework |
| @tanstack/react-router | Latest | ✅ Installed | Navigation |
| date-fns | Latest | ✅ Installed | Time formatting |

### Documentation References

- **TanStack Router**: https://tanstack.com/router
- **Radix UI Primitives**: https://www.radix-ui.com/primitives
- **Lucide Icons**: https://lucide.dev
- **i18next**: https://www.i18next.com
- **Project Store**: `src/lib/workspace/project-store.ts` (364 lines)

---

## 10. Next Steps

### Immediate Actions

1. **Create ProjectActionsMenu.tsx** (100 lines estimated)
2. **Modify ProjectCard.tsx** (+20 lines for props + trigger)
3. **Update HubHomePage.tsx** (+60 lines for handlers)
4. **Add translation keys** (en.json + vi.json)
5. **Run `pnpm i18n:extract`** to verify
6. **TypeScript check**: `pnpm tsc --noEmit`
7. **Test on desktop** (mobile follows responsive pattern)

### Validation Checklist

- [ ] Component renders without errors
- [ ] Menu opens/closes correctly
- [ ] All actions trigger handlers
- [ ] Delete shows confirmation dialog
- [ ] Translation keys work in EN/VI
- [ ] Icons display correctly
- [ ] Keyboard navigation works (Escape, Enter, Arrows)
- [ ] Screen reader announces menu items
- [ ] Hover effects apply (8-bit style)
- [ ] No TypeScript errors

---

## 11. Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| File System Access API not supported | High | Graceful degradation with toast notification |
| IndexedDB quota exceeded | Medium | Check quota before operations |
| Permission denied on delete | Medium | Verify permission before attempting |
| Translation keys missing | Low | i18next-scanner catches at build time |

### Implementation Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Component exceeds 120 lines | Medium | Extract handler logic to custom hook |
| Too many handlers in HubHomePage | Medium | Create `useProjectActions` hook |
| Inconsistent styling | Low | Use design tokens strictly |
| Breaking changes to ProjectCard | Low | Optional props (all on*)

---

## 12. Code Quality Metrics

### Target Metrics

- **Component Size**: 100 lines (120 max)
- **Cyclomatic Complexity**: <10
- **Test Coverage**: 80%+ (follow existing test patterns)
- **TypeScript Strictness**: 100% (no any types)
- **Accessibility**: WCAG AA (ARIA labels, keyboard nav)

### Performance Targets

- **Menu Open**: <100ms (Portal-based rendering)
- **Handler Response**: <50ms (async operations)
- **Icon Rendering**: <16ms (tree-shaken imports)
- **Translation Lookup**: <5ms (i18next caching)

---

## Appendix A: Complete File Listing

### Hub Components

```
src/presentation/components/hub/
├── __tests__/
│   ├── NavigationBreadcrumbs.test.tsx
│   ├── TopicCard.test.tsx
│   ├── TopicPortalCard.test.tsx
│   └── HubHomePage.test.tsx
├── BootSequence.tsx
├── HubHero.tsx
├── HubHomePage.tsx
├── MobileProjectSelector.tsx
├── NavigationBreadcrumbs.tsx
├── ProjectCard.tsx
├── RecentProjectsSection.tsx
├── TopicCard.tsx
├── TopicPortalCard.tsx
├── WorkspaceBadge.tsx
├── WorkspaceBindingDialog.tsx
└── index.ts
```

### Related Store Files

```
src/lib/workspace/
├── project-store.ts (364 lines)
├── ProjectContext.tsx
└── __tests__/
    └── project-store.test.ts
```

---

## Appendix B: MCP Tool Usage

This analysis was generated using:

1. **Repomix** - Packed 4,321 files into 2.1M-line XML snapshot
2. **Grep Tool** - Searched patterns in output file
3. **Read Tool** - Extracted specific file contents

**Tool Turns:** 6
- 1x Repomix pack command
- 5x Grep searches (Hub components, ProjectCard, DropdownMenu, project-store, i18n, icons)

---

**Document Status:** ✅ Complete
**Next Review:** After ProjectActionsMenu implementation
**Maintainer:** Platform Unification Team
**Last Updated:** 2026-01-02
