# Archive Manifest: Workspace Terminology Removal

**Date**: 2026-01-26
**Story**: CC-AR-10, CC-AR-11 - Remove Workspace Terminology Across Codebase
**Reason**: Components archived/replaced as per ADR-034, replaced by Hub project picker flow
**Updated**: 2026-01-26T09:30:00+07:00

## Archived Components

### 1. WorkspaceBindingDialog.tsx
- **Original Path**: `src/presentation/components/hub/WorkspaceBindingDialog.tsx`
- **Reason**: Replaced by Hub project picker flow
- **Usage Locations**: Commented out in:
  - `src/presentation/components/hub/HubHomePage.tsx`
  - `src/presentation/components/project/ProjectsPage.tsx`

### 2. WorkspaceBindingToggle.tsx
- **Original Path**: `src/presentation/components/hub/WorkspaceBindingToggle.tsx`
- **Reason**: Replaced by Hub project picker flow
- **Usage Locations**: None (archived proactively)

### 3. WorkspaceSwitcher.tsx
- **Original Path**: `src/presentation/components/common/WorkspaceSwitcher.tsx`
- **Reason**: Replaced by Hub project picker flow
- **Usage Locations**: Commented out in:
  - `src/presentation/components/layout/IDEHeaderBar.tsx`
  - Export commented out in `src/presentation/components/common/index.ts`

### 4. workspace/ Folder
- **Original Path**: `src/presentation/components/workspace/`
- **Contents**:
  - `WorkspaceEnhancedSwitcher.tsx`
  - `WorkspaceSettings.tsx`
  - `sync/` (subfolder with workspace sync components)
  - `FolderPickerDialog.tsx`
  - `TempProjectBanner.tsx`
  - `index.ts`
- **Reason**: Replaced by Hub project picker flow
- **Usage Locations**: None (archived proactively)

### 5. WorkspaceBindingFooter.tsx (NEW - CC-AR-10)
- **Original Path**: `src/presentation/components/hub/WorkspaceBindingFooter.tsx`
- **Archived**: 2026-01-26T09:30:00+07:00
- **Reason**: Subcomponent of archived WorkspaceBindingDialog
- **Usage Locations**: None (verified via grep)

### 6. WorkspaceBindingHeader.tsx (NEW - CC-AR-10)
- **Original Path**: `src/presentation/components/hub/WorkspaceBindingHeader.tsx`
- **Archived**: 2026-01-26T09:30:00+07:00
- **Reason**: Subcomponent of archived WorkspaceBindingDialog
- **Usage Locations**: None (verified via grep)

### 7. WorkspaceCheckboxItem.tsx (NEW - CC-AR-10)
- **Original Path**: `src/presentation/components/hub/WorkspaceCheckboxItem.tsx`
- **Archived**: 2026-01-26T09:30:00+07:00
- **Reason**: Subcomponent of archived WorkspaceBindingDialog
- **Usage Locations**: None (verified via grep)

### 8. WorkspaceCheckboxList.tsx (NEW - CC-AR-10)
- **Original Path**: `src/presentation/components/hub/WorkspaceCheckboxList.tsx`
- **Archived**: 2026-01-26T09:30:00+07:00
- **Reason**: Subcomponent of archived WorkspaceBindingDialog
- **Usage Locations**: None (verified via grep)

### 9. InitialWorkspaceSelector.tsx (NEW - CC-AR-10)
- **Original Path**: `src/presentation/components/hub/InitialWorkspaceSelector.tsx`
- **Archived**: 2026-01-26T09:30:00+07:00
- **Reason**: Replaced by ProjectCreationWizard
- **Usage Locations**: None (verified via grep)

### 10. useWorkspaceBindingState.ts (NEW - CC-AR-10)
- **Original Path**: `src/presentation/components/hub/useWorkspaceBindingState.ts`
- **Archived**: 2026-01-26T09:30:00+07:00
- **Reason**: State hook for archived WorkspaceBindingDialog
- **Usage Locations**: None (verified via grep)

## Renamed Components

### 1. WorkspaceFilter.tsx → ProjectFilter.tsx
- **New Path**: `src/presentation/components/hub/ProjectFilter.tsx`
- **Changes**:
  - File renamed
  - Component name: `WorkspaceFilter` → `ProjectFilter`
  - Interface: `WorkspaceFilterProps` → `ProjectFilterProps`
  - i18n keys: `hub.workspaceFilter.*` → `hub.projectFilter.*`

### 2. WorkspaceBadge.tsx → ProjectBadge.tsx
- **New Path**: `src/presentation/components/hub/ProjectBadge.tsx`
- **Changes**:
  - File renamed
  - Component name: `WorkspaceBadge` → `ProjectBadge`
  - Interface: `WorkspaceBadgeProps` → `ProjectBadgeProps`
  - ARIA label: "workspace" → "project"

## Import Updates

### Files Updated
- `src/presentation/components/hub/index.ts`:
  - Exported `ProjectBadge` instead of `WorkspaceBadge`
  - Exported `ProjectFilter` instead of `WorkspaceFilter`
  - Removed exports for archived components
  - Updated type exports

- `src/presentation/components/hub/ProjectCard.tsx`:
  - Import: `WorkspaceBadge` → `ProjectBadge`
  - Usage: `<WorkspaceBadge />` → `<ProjectBadge />`

## i18n Updates

### en.json
- Added new keys:
  - `hub.projectFilter.none`: "None"
  - `hub.projectFilter.all`: "All"
  - `hub.projectFilter.selected`: "selected"
  - `hub.projectFilter.filter`: "Filter"
  - `hub.projectFilter.selectAll`: "Select All"
  - `hub.projectFilter.deselectAll`: "Deselect All"
  - `hub.projectFilter.clearAll`: "Clear All"

### vi.json
- Added new keys:
  - `hub.projectFilter.none`: "Không"
  - `hub.projectFilter.all`: "Tất cả"
  - `hub.projectFilter.selected`: "đã chọn"
  - `hub.projectFilter.filter`: "Bộ lọc"
  - `hub.projectFilter.selectAll`: "Chọn tất cả"
  - `hub.projectFilter.deselectAll`: "Bỏ chọn tất cả"
  - `hub.projectFilter.clearAll`: "Xóa tất cả"

## Validation

- [x] All "workspace" components archived or renamed to "project"
- [x] 0 UI-visible "workspace" references in renamed components
- [x] Renamed components use "Project" prefix
- [x] Deprecated components archived with date stamp
- [x] 6 additional components archived (CC-AR-10) with grep verification
- [x] TypeScript: 0 errors (verified 2026-01-26T09:46:00+07:00)

## Legacy Route Fixes (CC-AR-10)

The following files were updated to use unified `/$projectId` route per ADR-034:

| File | Original Route | New Route |
|------|----------------|-----------|
| `route-guards.ts` | `/notes/$projectId` | `/$projectId` |
| `use-file-ops-slice.ts` | `/ide/$projectId`, `/workspace/$projectId` | `/$projectId` |
| `useWorkspaceActions.ts` | `/workspace/$projectId` | `/$projectId` |
| `NoteReference.tsx` | `/notes` | `/hub` |
| `MobileProjectSelector.tsx` | `/ide` | `/hub` |
| `RecentProjectsSection.tsx` | `/workspace` | `/hub` |
| `ProjectsPage.tsx` | `/ide/$projectId`, `/notes/$projectId` | `/$projectId` |

### Deprecated Components Archived

| File | Reason |
|------|--------|
| `Header.tsx` | Deprecated with legacy `/ide`, `/agents`, `/settings` routes |

## Notes

- Some internal "workspace" references remain in type names, comments, and the workspace concept itself (IDE, Notes, Knowledge, Study workspaces)
- These are intentional and not UI-visible terminology
- The workspace concept (IDE, Notes, Knowledge, Study) remains in the architecture per ADR-033
