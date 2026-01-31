# Debug Analysis: "Temp Project" Toast Infection

## 1. Infection Point
The string "Use Temp Project" and the associated toast notification are located in:
- **File**: `src/spike/components/common/FolderPickerDialog.tsx`
- **Lines**: 
  - Toast logic: 114-116 ("Using temp project for this session")
  - Button UI: 250 ("Use Temp Project")
- **Note**: A duplicate exists in `src/presentation/components/workspace/FolderPickerDialog.tsx`.

## 2. Bridge Analysis (Hub -> IDE)
- **Source**: `src/spike/components/hub/HubHomePage.tsx`
- **Function**: `handleOpenRecentProject`
- **Logic**: 
  1. Finds project in list.
  2. Checks `workspaceBindings` to determine target workspace.
  3. Priority: IDE > Knowledge > Notes > Study.
  4. If IDE enabled: Navigates to `/ide/$projectId`.
  5. It does **NOT** directly trigger the `FolderPickerDialog`.

## 3. Destination Inspection
- **Route**: `src/routes/ide.$projectId.tsx`
- **Initialization**:
  - `beforeLoad`: Validates platform permissions (`canAccessIDE`). Redirects mobile to Notes.
  - `loader`: Fetches project from Dexie DB.
  - **Findings**: This specific route does NOT appear to trigger the unwanted dialog/toast.

## 4. Root Cause Identification
The unwanted toast/dialog is likely triggered from the **Root IDE Route** (`src/routes/ide.tsx`) or the **Create Project** flow, not the direct "Open Recent" flow.
- `src/routes/ide.tsx` (lines 145-157) renders `FolderPickerDialog` when a user visits `/ide` without a project ID.
- The `FolderPickerDialog` component contains **hardcoded legacy logic** that:
  1. Always renders the "Use Temp Project" button (even if the callback is undefined).
  2. Always shows the "Using temp project" toast on cancellation (lines 114-116).
- This contradicts the "PHASE 1 CLEANUP" in `ide.tsx` which states "No temp projects".

## 5. Recommendation
- Remove the hardcoded toast and button from `FolderPickerDialog`.
- Make the "Use Temp Project" button conditional on the existence of the `onFallbackToTemp` prop.
