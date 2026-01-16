Project Space Architecture Remediation Plan
Date: 2026-01-16
Epic: EPIC-CC-ARC - Architectural Remediation
Story: Eliminate Temporary Projects & Establish Clean Project Space Boundaries

Executive Summary
This plan eliminates all "temporary/default project" concepts and establishes clear project space boundaries for routing, storage, and workspace access.

Core Problem: Three overlapping temp project systems create routing chaos:

workspace-access-helper.tsx: temp-{workspace} IDs
temp-project.ts: alpha-temp-{timestamp}-{random} IDs
browser-mode.ts: proj_browser-default pseudo-project
Solution: Complete elimination + clean platform-based routing

User Requirements (Confirmed)
Requirement	Implementation
Eliminate temp projects	Delete all temp project code; trace and remove dependencies
Desktop = FSA only	Desktop users create FSA projects; never create IndexedDB
Mobile = IndexedDB only	Mobile users create IndexedDB projects; no FSA option
Same project, multiple workspaces	Desktop project with workspaceBindings: { ide: true, notes: true }
Mobile blocked from IDE	Toast error when mobile taps IDE-only project
Direct landing	Route /{workspace}/$projectId loads project immediately
Hotload switching	Project switcher is reactive, no page reload
Architecture Contract
1. Project Record (Clean Schema)

interface ProjectRecord {
  // Identity (ALWAYS required)
  id: string;           // UUID v4 ONLY - never "temp-*" or "browser-default"
  name: string;
  folderPath: string;   // Real FSA path or virtual IndexedDB path

  // Storage (determined ONCE at creation by platform contract)
  storageType: 'fsa' | 'indexeddb';

  // Workspace Access (which UIs can use this project)
  workspaceBindings: {
    ide?: boolean;      // Desktop with FSA + Terminal only
    notes?: boolean;    // All platforms
    knowledge?: boolean; // All platforms (future)
    study?: boolean;    // All platforms (future)
  };

  // Timestamps
  createdAt: Date;
  lastOpened: Date;

  // REMOVED fields:
  // - isTemp: DELETE
  // - isBrowserMode: DELETE
  // - autoCreated: DELETE
  // - workspaceId: DELETE (use workspaceBindings instead)
}
2. Platform Contract

// src/infrastructure/filesystem/platform-contract.ts (ALREADY IMPLEMENTED)
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';  // Auto-detected from device
  canAccessFSA: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;  // Desktop with FSA + Terminal only
}

// CRITICAL: Desktop ALWAYS has storageType='fsa', Mobile ALWAYS has storageType='indexeddb'
// There is NO cross-device project access - they are completely separate
3. Routing Matrix
Platform	Storage	Default Bindings	Entry Route	Blocked From
Desktop	FSA	{ ide: true, notes: true }	/ide/$projectId	None
Mobile	IndexedDB	{ notes: true }	/notes/$projectId	/ide/*
4. URL Structure

/hub                          # Project dashboard (all devices)
/ide/$projectId              # IDE workspace (desktop only, guarded)
/notes/$projectId            # Notes workspace (all devices)
/knowledge/$projectId        # Knowledge workspace (future, all devices)
/study/$projectId            # Study workspace (future, all devices)
Entry/Exit Flows
Desktop User - No Projects

1. User visits app
2. getPlatformContract() → { deviceType: 'desktop', storageType: 'fsa', canAccessIDE: true }
3. Show Hub with "Create Project" CTA
4. User clicks "Create Project"
5. Open FSA directory picker (showDirectoryPicker)
6. Create project with:
   - storageType: 'fsa'
   - workspaceBindings: { ide: true, notes: true }
7. Navigate to: /ide/$projectId
Desktop User - Existing Projects

1. User visits app
2. Show Hub with project list (FSA projects only)
3. User clicks a project
4. Navigate to: /ide/$projectId (default for desktop)
5. Workspace switcher shows available workspaces from bindings
Mobile User - No Projects

1. User visits app
2. getPlatformContract() → { deviceType: 'mobile', storageType: 'indexeddb', canAccessIDE: false }
3. Show Hub with "Create Project" CTA (no FSA picker)
4. User clicks "Create Project"
5. Create project with:
   - storageType: 'indexeddb'
   - workspaceBindings: { notes: true }  // NO ide
6. Navigate to: /notes/$projectId
Mobile User - Existing Projects

1. User visits app
2. Show Hub with project list (IndexedDB projects only)
3. User clicks a project
4. Navigate to: /notes/$projectId
Mobile User Taps IDE-Only Project

1. User clicks project with workspaceBindings.ide = true
2. Route guard detects platform.canAccessIDE = false
3. Show toast: "IDE requires desktop with File System Access"
4. Do not navigate - stay on Hub
Hotload Project Switching (Within Workspace)

// Workspace header has project switcher dropdown
const switchProject = async (newProjectId: string) => {
  const project = await db.projects.get(newProjectId);
  if (!project) return;

  // Verify workspace binding
  if (!project.workspaceBindings[currentWorkspace]) {
    toast.error(`${currentWorkspace} is not enabled for this project`);
    return;
  }

  // Navigate directly (reactive, no reload)
  navigate({
    to: `/${currentWorkspace}/$projectId`,
    params: { projectId: newProjectId }
  });
};
Files to Modify
DELETE (4 files)
File	Reason
src/lib/workspace/temp-project.ts	Entire file is temp project creation
src/lib/workspace/workspace-access-helper.tsx	Entire file is temp project creation
src/presentation/components/workspace/TempProjectBanner.tsx	No longer needed
src/presentation/components/workspace/TempProjectBannerCompact.tsx	No longer needed
HEAVILY REFACTOR (5 files)
File	Changes
src/routes/ide.tsx	Remove getOrCreateTempProject(), redirect to hub when no projects
src/routes/notes.lazy.tsx	Remove useBrowserModeProject(), redirect to hub when no projects
src/routes/ide.$projectId.tsx	Ensure platform guard is strict
src/routes/notes.$projectId.lazy.tsx	Ensure works without temp projects
src/presentation/components/hub/HubHomePage.tsx	Update project creation to use platform.storageType
LIGHTLY TOUCH (5 files)
File	Changes
src/domain/entities/project.ts	Remove isTemp, autoCreated, isBrowserMode fields
src/infrastructure/persistence/dexie-db-core-types.ts	Remove temp fields from ProjectRecord
src/infrastructure/persistence/stores/project/project-types.ts	Update CreateProjectInput
src/presentation/components/project/ProjectSelector.tsx	Remove temp project rendering
src/presentation/components/project/ProjectsPage.tsx	Remove isTemp prop handling
REPLACE (1 file)
File	Changes
src/lib/workspace/browser-mode.ts	REFACTOR: Remove pseudo-project, re-implement "view all notes" as cross-project query feature
Additional Requirements (User Confirmed)
1. Migration: Auto-Convert Temp Projects
Existing temp projects will be automatically converted to real projects:

Generate new UUID v4 ID
Rename to "Temporary Project {YYYY-MM-DD}"
Set storageType based on current platform
Remove isTemp, isBrowserMode, autoCreated flags
Silently upgrade - no user dialog needed
2. Browser Mode: Re-Implement "View All Notes"
The "view all notes across projects" feature will be re-implemented:

NOT as a pseudo-project
As a cross-project query/view mode in the Notes workspace
Filter/aggregation logic that queries notes from all user projects
Toggle switch: "All Projects" vs. "Current Project"
3. First Run: Prompt User with i18n
First-time users will see a styled prompt dialog:

i18n required: All strings in Vietnamese AND English
UX/UI: 8-bit design, no transparency, sharp corners
Two options: "Create your first project" or "Skip for now"
Skip leads to empty state with persistent CTA
Implementation Phases
Phase 1: Stop Creating Temp Projects (1 story)
Goal: No new temp projects are created

Tasks:

Add deprecation warning to createTempProject() and getOrCreateTempProject()
Update HubHomePage.tsx project creation to use platform.storageType
Update /notes route to redirect to hub instead of creating browser-mode project
Update /ide route to redirect to hub instead of creating temp project
Verification:

Creating a new project on desktop uses FSA storage
Creating a new project on mobile uses IndexedDB storage
No temp-* or browser-default IDs in DexieDB after creation
Phase 2: Update Type Definitions (1 story)
Goal: Remove temp-related fields from types

Tasks:

Remove isTemp, autoCreated, isBrowserMode from domain/entities/project.ts
Remove from dexie-db-core-types.ts (mark as deprecated first, don't drop yet)
Update all Project-related interfaces
Fix TypeScript errors
Verification:

pnpm tsc --noEmit passes with no errors
No references to isTemp in production code (tests can have for migration)
Phase 3: Clean Up Routing (2 stories)
Goal: All routes handle "no project" state cleanly

Story 3a: IDE Routes

Remove temp project imports from ide.tsx and ide.$projectId.tsx
Add proper "no projects" empty state with CTA to hub
Ensure platform guard is strict with clear error toast
Story 3b: Notes Routes

Remove useBrowserModeProject() from notes.lazy.tsx
Add proper "no projects" empty state with CTA to hub
Ensure works without any special projects
Verification:

Desktop user with no projects → hub with "Create Project" CTA
Mobile user with no projects → hub with "Create Project" CTA
Mobile user trying to access /ide → redirect to notes with toast
Phase 4: Delete Temp Project Files (1 story)
Goal: Remove all temp project code

Tasks:

Delete temp-project.ts
Delete workspace-access-helper.tsx
Delete TempProjectBanner.tsx
Delete TempProjectBannerCompact.tsx
Delete or refactor browser-mode.ts
Verification:

pnpm tsc --noEmit passes
No imports of deleted files
All tests pass
Phase 5: Data Migration + First Run Prompt (1 story)
Goal: Auto-convert temp projects and prompt first-time users

Tasks:

5a: Auto-Convert Temp Projects

Create migration script that:
Finds all projects with isTemp: true
Generates new UUID v4 for each
Renames to "Temporary Project {YYYY-MM-DD}" (i18n: "Dự án tạm thời {DD/MM/YYYY}")
Sets storageType based on getPlatformContract()
Removes temp flags
Run migration silently on app load (one-time)
Clean up DexieDB deprecated fields
5b: First Run Prompt (i18n)

Create FirstRunPromptDialog component:
8-bit styling (sharp corners, no transparency)
i18n strings: Vietnamese AND English
Two buttons: "Create Project" / "Skip for now"
Show when user has 0 projects
Skip leads to empty state with persistent CTA
i18n Strings Required:

English	Vietnamese	Key
Welcome to ViaGent	Chào mừng đến với ViaGent	welcome.title
Create your first project to get started	Tạo dự án đầu tiên của bạn để bắt đầu	welcome.message
Create Project	Tạo Dự Án	welcome.create
Skip for now	Bỏ qua ngay lúc này	welcome.skip
Create a project to use this workspace	Tạo dự án để sử dụng không gian làm việc	empty.createProject
Verification:

Existing temp projects auto-convert to real projects
New users see styled first-run prompt
i18n works for EN and VI
Skip leads to empty state with CTA
Success Criteria
After implementation:

 No isTemp, autoCreated, or isBrowserMode fields in any type
 All projects have valid UUID v4 IDs
 /ide route redirects mobile users to /notes with toast
 /notes route redirects users without projects to hub
 Desktop users can only create FSA projects
 Mobile users can only create IndexedDB projects
 Mobile users see toast when tapping IDE-only project
 Workspace switcher is reactive (no page reload)
 All workspace routes have consistent platform guards
Verification Steps
Desktop Fresh User:

Open app on desktop
See hub with "Create Project"
Create project → FSA picker appears
Land in /ide/{projectId}
Workspace switcher shows IDE and Notes
Desktop Returning User:

Open app on desktop
See project list
Click project → land in /ide/{projectId}
Switch to Notes → land in /notes/{projectId} (same project)
Mobile Fresh User:

Open app on mobile
See hub with "Create Project"
Create project → no FSA picker
Land in /notes/{projectId}
Workspace switcher shows Notes only
Mobile IDE Blocking:

On mobile, try to navigate to /ide/{projectId}
See toast: "IDE requires desktop"
Redirected to /notes/{projectId}
Project Switching:

Within workspace, open project switcher
Select different project
Content updates immediately (no page reload)
Sources
Architect Agent Analysis: fancy-inventing-swing-agent-abdc8f7.md
Analyst Agent Research: fancy-inventing-swing-agent-ad3c578.md
ADR-033: PlatformContract, StorageGateway decisions
Current codebase: src/ directory analysis
Stayed in plan mode
Claude’s Plan
Project Space Architecture Remediation Plan
Date: 2026-01-16
Epic: EPIC-CC-ARC - Architectural Remediation
Story: Eliminate Temporary Projects & Establish Clean Project Space Boundaries

Executive Summary
This plan eliminates all "temporary/default project" concepts and establishes clear project space boundaries for routing, storage, and workspace access.

Core Problem: Three overlapping temp project systems create routing chaos:

workspace-access-helper.tsx: temp-{workspace} IDs
temp-project.ts: alpha-temp-{timestamp}-{random} IDs
browser-mode.ts: proj_browser-default pseudo-project
Solution: Complete elimination + clean platform-based routing

User Requirements (Confirmed)
Requirement	Implementation
Eliminate temp projects	Delete all temp project code; trace and remove dependencies
Desktop = FSA only	Desktop users create FSA projects; never create IndexedDB
Mobile = IndexedDB only	Mobile users create IndexedDB projects; no FSA option
Same project, multiple workspaces	Desktop project with workspaceBindings: { ide: true, notes: true }
Mobile blocked from IDE	Toast error when mobile taps IDE-only project
Direct landing	Route /{workspace}/$projectId loads project immediately
Hotload switching	Project switcher is reactive, no page reload
Architecture Contract
1. Project Record (Clean Schema)

interface ProjectRecord {
  // Identity (ALWAYS required)
  id: string;           // UUID v4 ONLY - never "temp-*" or "browser-default"
  name: string;
  folderPath: string;   // Real FSA path or virtual IndexedDB path

  // Storage (determined ONCE at creation by platform contract)
  storageType: 'fsa' | 'indexeddb';

  // Workspace Access (which UIs can use this project)
  workspaceBindings: {
    ide?: boolean;      // Desktop with FSA + Terminal only
    notes?: boolean;    // All platforms
    knowledge?: boolean; // All platforms (future)
    study?: boolean;    // All platforms (future)
  };

  // Timestamps
  createdAt: Date;
  lastOpened: Date;

  // REMOVED fields:
  // - isTemp: DELETE
  // - isBrowserMode: DELETE
  // - autoCreated: DELETE
  // - workspaceId: DELETE (use workspaceBindings instead)
}
2. Platform Contract

// src/infrastructure/filesystem/platform-contract.ts (ALREADY IMPLEMENTED)
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';  // Auto-detected from device
  canAccessFSA: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;  // Desktop with FSA + Terminal only
}

// CRITICAL: Desktop ALWAYS has storageType='fsa', Mobile ALWAYS has storageType='indexeddb'
// There is NO cross-device project access - they are completely separate
3. Routing Matrix
Platform	Storage	Default Bindings	Entry Route	Blocked From
Desktop	FSA	{ ide: true, notes: true }	/ide/$projectId	None
Mobile	IndexedDB	{ notes: true }	/notes/$projectId	/ide/*
4. URL Structure

/hub                          # Project dashboard (all devices)
/ide/$projectId              # IDE workspace (desktop only, guarded)
/notes/$projectId            # Notes workspace (all devices)
/knowledge/$projectId        # Knowledge workspace (future, all devices)
/study/$projectId            # Study workspace (future, all devices)
Entry/Exit Flows
Desktop User - No Projects

1. User visits app
2. getPlatformContract() → { deviceType: 'desktop', storageType: 'fsa', canAccessIDE: true }
3. Show Hub with "Create Project" CTA
4. User clicks "Create Project"
5. Open FSA directory picker (showDirectoryPicker)
6. Create project with:
   - storageType: 'fsa'
   - workspaceBindings: { ide: true, notes: true }
7. Navigate to: /ide/$projectId
Desktop User - Existing Projects

1. User visits app
2. Show Hub with project list (FSA projects only)
3. User clicks a project
4. Navigate to: /ide/$projectId (default for desktop)
5. Workspace switcher shows available workspaces from bindings
Mobile User - No Projects

1. User visits app
2. getPlatformContract() → { deviceType: 'mobile', storageType: 'indexeddb', canAccessIDE: false }
3. Show Hub with "Create Project" CTA (no FSA picker)
4. User clicks "Create Project"
5. Create project with:
   - storageType: 'indexeddb'
   - workspaceBindings: { notes: true }  // NO ide
6. Navigate to: /notes/$projectId
Mobile User - Existing Projects

1. User visits app
2. Show Hub with project list (IndexedDB projects only)
3. User clicks a project
4. Navigate to: /notes/$projectId
Mobile User Taps IDE-Only Project

1. User clicks project with workspaceBindings.ide = true
2. Route guard detects platform.canAccessIDE = false
3. Show toast: "IDE requires desktop with File System Access"
4. Do not navigate - stay on Hub
Hotload Project Switching (Within Workspace)

// Workspace header has project switcher dropdown
const switchProject = async (newProjectId: string) => {
  const project = await db.projects.get(newProjectId);
  if (!project) return;

  // Verify workspace binding
  if (!project.workspaceBindings[currentWorkspace]) {
    toast.error(`${currentWorkspace} is not enabled for this project`);
    return;
  }

  // Navigate directly (reactive, no reload)
  navigate({
    to: `/${currentWorkspace}/$projectId`,
    params: { projectId: newProjectId }
  });
};
Files to Modify
DELETE (4 files)
File	Reason
src/lib/workspace/temp-project.ts	Entire file is temp project creation
src/lib/workspace/workspace-access-helper.tsx	Entire file is temp project creation
src/presentation/components/workspace/TempProjectBanner.tsx	No longer needed
src/presentation/components/workspace/TempProjectBannerCompact.tsx	No longer needed
HEAVILY REFACTOR (5 files)
File	Changes
src/routes/ide.tsx	Remove getOrCreateTempProject(), redirect to hub when no projects
src/routes/notes.lazy.tsx	Remove useBrowserModeProject(), redirect to hub when no projects
src/routes/ide.$projectId.tsx	Ensure platform guard is strict
src/routes/notes.$projectId.lazy.tsx	Ensure works without temp projects
src/presentation/components/hub/HubHomePage.tsx	Update project creation to use platform.storageType
LIGHTLY TOUCH (5 files)
File	Changes
src/domain/entities/project.ts	Remove isTemp, autoCreated, isBrowserMode fields
src/infrastructure/persistence/dexie-db-core-types.ts	Remove temp fields from ProjectRecord
src/infrastructure/persistence/stores/project/project-types.ts	Update CreateProjectInput
src/presentation/components/project/ProjectSelector.tsx	Remove temp project rendering
src/presentation/components/project/ProjectsPage.tsx	Remove isTemp prop handling
REPLACE (1 file)
File	Changes
src/lib/workspace/browser-mode.ts	REFACTOR: Remove pseudo-project, re-implement "view all notes" as cross-project query feature
Additional Requirements (User Confirmed)
1. Migration: Auto-Convert Temp Projects
Existing temp projects will be automatically converted to real projects:

Generate new UUID v4 ID
Rename to "Temporary Project {YYYY-MM-DD}"
Set storageType based on current platform
Remove isTemp, isBrowserMode, autoCreated flags
Silently upgrade - no user dialog needed
2. Browser Mode: Re-Implement "View All Notes"
The "view all notes across projects" feature will be re-implemented:

NOT as a pseudo-project
As a cross-project query/view mode in the Notes workspace
Filter/aggregation logic that queries notes from all user projects
Toggle switch: "All Projects" vs. "Current Project"
3. First Run: Prompt User with i18n
First-time users will see a styled prompt dialog:

i18n required: All strings in Vietnamese AND English
UX/UI: 8-bit design, no transparency, sharp corners
Two options: "Create your first project" or "Skip for now"
Skip leads to empty state with persistent CTA
Implementation Phases
Phase 1: Stop Creating Temp Projects (1 story)
Goal: No new temp projects are created

Tasks:

Add deprecation warning to createTempProject() and getOrCreateTempProject()
Update HubHomePage.tsx project creation to use platform.storageType
Update /notes route to redirect to hub instead of creating browser-mode project
Update /ide route to redirect to hub instead of creating temp project
Verification:

Creating a new project on desktop uses FSA storage
Creating a new project on mobile uses IndexedDB storage
No temp-* or browser-default IDs in DexieDB after creation
Phase 2: Update Type Definitions (1 story)
Goal: Remove temp-related fields from types

Tasks:

Remove isTemp, autoCreated, isBrowserMode from domain/entities/project.ts
Remove from dexie-db-core-types.ts (mark as deprecated first, don't drop yet)
Update all Project-related interfaces
Fix TypeScript errors
Verification:

pnpm tsc --noEmit passes with no errors
No references to isTemp in production code (tests can have for migration)
Phase 3: Clean Up Routing (2 stories)
Goal: All routes handle "no project" state cleanly

Story 3a: IDE Routes

Remove temp project imports from ide.tsx and ide.$projectId.tsx
Add proper "no projects" empty state with CTA to hub
Ensure platform guard is strict with clear error toast
Story 3b: Notes Routes

Remove useBrowserModeProject() from notes.lazy.tsx
Add proper "no projects" empty state with CTA to hub
Ensure works without any special projects
Verification:

Desktop user with no projects → hub with "Create Project" CTA
Mobile user with no projects → hub with "Create Project" CTA
Mobile user trying to access /ide → redirect to notes with toast
Phase 4: Delete Temp Project Files (1 story)
Goal: Remove all temp project code

Tasks:

Delete temp-project.ts
Delete workspace-access-helper.tsx
Delete TempProjectBanner.tsx
Delete TempProjectBannerCompact.tsx
Delete or refactor browser-mode.ts
Verification:

pnpm tsc --noEmit passes
No imports of deleted files
All tests pass
Phase 5: Data Migration + First Run Prompt (1 story)
Goal: Auto-convert temp projects and prompt first-time users

Tasks:

5a: Auto-Convert Temp Projects

Create migration script that:
Finds all projects with isTemp: true
Generates new UUID v4 for each
Renames to "Temporary Project {YYYY-MM-DD}" (i18n: "Dự án tạm thời {DD/MM/YYYY}")
Sets storageType based on getPlatformContract()
Removes temp flags
Run migration silently on app load (one-time)
Clean up DexieDB deprecated fields
5b: First Run Prompt (i18n)

Create FirstRunPromptDialog component:
8-bit styling (sharp corners, no transparency)
i18n strings: Vietnamese AND English
Two buttons: "Create Project" / "Skip for now"
Show when user has 0 projects
Skip leads to empty state with persistent CTA
i18n Strings Required:

English	Vietnamese	Key
Welcome to ViaGent	Chào mừng đến với ViaGent	welcome.title
Create your first project to get started	Tạo dự án đầu tiên của bạn để bắt đầu	welcome.message
Create Project	Tạo Dự Án	welcome.create
Skip for now	Bỏ qua ngay lúc này	welcome.skip
Create a project to use this workspace	Tạo dự án để sử dụng không gian làm việc	empty.createProject
Verification:

Existing temp projects auto-convert to real projects
New users see styled first-run prompt
i18n works for EN and VI
Skip leads to empty state with CTA
Success Criteria
After implementation:

 No isTemp, autoCreated, or isBrowserMode fields in any type
 All projects have valid UUID v4 IDs
 /ide route redirects mobile users to /notes with toast
 /notes route redirects users without projects to hub
 Desktop users can only create FSA projects
 Mobile users can only create IndexedDB projects
 Mobile users see toast when tapping IDE-only project
 Workspace switcher is reactive (no page reload)
 All workspace routes have consistent platform guards
Verification Steps
Desktop Fresh User:

Open app on desktop
See hub with "Create Project"
Create project → FSA picker appears
Land in /ide/{projectId}
Workspace switcher shows IDE and Notes
Desktop Returning User:

Open app on desktop
See project list
Click project → land in /ide/{projectId}
Switch to Notes → land in /notes/{projectId} (same project)
Mobile Fresh User:

Open app on mobile
See hub with "Create Project"
Create project → no FSA picker
Land in /notes/{projectId}
Workspace switcher shows Notes only
Mobile IDE Blocking:

On mobile, try to navigate to /ide/{projectId}
See toast: "IDE requires desktop"
Redirected to /notes/{projectId}
Project Switching:

Within workspace, open project switcher
Select different project
Content updates immediately (no page reload)
Sources
Architect Agent Analysis: fancy-inventing-swing-agent-abdc8f7.md
Analyst Agent Research: fancy-inventing-swing-agent-ad3c578.md
ADR-033: PlatformContract, StorageGateway decisions
Current codebase: src/ directory analysis
Stayed in plan mode
Claude’s Plan
Project Space Architecture Remediation Plan
Date: 2026-01-16
Epic: EPIC-CC-ARC - Architectural Remediation
Story: Eliminate Temporary Projects & Establish Clean Project Space Boundaries

Executive Summary
This plan eliminates all "temporary/default project" concepts and establishes clear project space boundaries for routing, storage, and workspace access.

Core Problem: Three overlapping temp project systems create routing chaos:

workspace-access-helper.tsx: temp-{workspace} IDs
temp-project.ts: alpha-temp-{timestamp}-{random} IDs
browser-mode.ts: proj_browser-default pseudo-project
Solution: Complete elimination + clean platform-based routing

User Requirements (Confirmed)
Requirement	Implementation
Eliminate temp projects	Delete all temp project code; trace and remove dependencies
Desktop = FSA only	Desktop users create FSA projects; never create IndexedDB
Mobile = IndexedDB only	Mobile users create IndexedDB projects; no FSA option
Same project, multiple workspaces	Desktop project with workspaceBindings: { ide: true, notes: true }
Mobile blocked from IDE	Toast error when mobile taps IDE-only project
Direct landing	Route /{workspace}/$projectId loads project immediately
Hotload switching	Project switcher is reactive, no page reload
Architecture Contract
1. Project Record (Clean Schema)

interface ProjectRecord {
  // Identity (ALWAYS required)
  id: string;           // UUID v4 ONLY - never "temp-*" or "browser-default"
  name: string;
  folderPath: string;   // Real FSA path or virtual IndexedDB path

  // Storage (determined ONCE at creation by platform contract)
  storageType: 'fsa' | 'indexeddb';

  // Workspace Access (which UIs can use this project)
  workspaceBindings: {
    ide?: boolean;      // Desktop with FSA + Terminal only
    notes?: boolean;    // All platforms
    knowledge?: boolean; // All platforms (future)
    study?: boolean;    // All platforms (future)
  };

  // Timestamps
  createdAt: Date;
  lastOpened: Date;

  // REMOVED fields:
  // - isTemp: DELETE
  // - isBrowserMode: DELETE
  // - autoCreated: DELETE
  // - workspaceId: DELETE (use workspaceBindings instead)
}
2. Platform Contract

// src/infrastructure/filesystem/platform-contract.ts (ALREADY IMPLEMENTED)
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';  // Auto-detected from device
  canAccessFSA: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;  // Desktop with FSA + Terminal only
}

// CRITICAL: Desktop ALWAYS has storageType='fsa', Mobile ALWAYS has storageType='indexeddb'
// There is NO cross-device project access - they are completely separate
3. Routing Matrix
Platform	Storage	Default Bindings	Entry Route	Blocked From
Desktop	FSA	{ ide: true, notes: true }	/ide/$projectId	None
Mobile	IndexedDB	{ notes: true }	/notes/$projectId	/ide/*
4. URL Structure

/hub                          # Project dashboard (all devices)
/ide/$projectId              # IDE workspace (desktop only, guarded)
/notes/$projectId            # Notes workspace (all devices)
/knowledge/$projectId        # Knowledge workspace (future, all devices)
/study/$projectId            # Study workspace (future, all devices)
Entry/Exit Flows
Desktop User - No Projects

1. User visits app
2. getPlatformContract() → { deviceType: 'desktop', storageType: 'fsa', canAccessIDE: true }
3. Show Hub with "Create Project" CTA
4. User clicks "Create Project"
5. Open FSA directory picker (showDirectoryPicker)
6. Create project with:
   - storageType: 'fsa'
   - workspaceBindings: { ide: true, notes: true }
7. Navigate to: /ide/$projectId
Desktop User - Existing Projects

1. User visits app
2. Show Hub with project list (FSA projects only)
3. User clicks a project
4. Navigate to: /ide/$projectId (default for desktop)
5. Workspace switcher shows available workspaces from bindings
Mobile User - No Projects

1. User visits app
2. getPlatformContract() → { deviceType: 'mobile', storageType: 'indexeddb', canAccessIDE: false }
3. Show Hub with "Create Project" CTA (no FSA picker)
4. User clicks "Create Project"
5. Create project with:
   - storageType: 'indexeddb'
   - workspaceBindings: { notes: true }  // NO ide
6. Navigate to: /notes/$projectId
Mobile User - Existing Projects

1. User visits app
2. Show Hub with project list (IndexedDB projects only)
3. User clicks a project
4. Navigate to: /notes/$projectId
Mobile User Taps IDE-Only Project

1. User clicks project with workspaceBindings.ide = true
2. Route guard detects platform.canAccessIDE = false
3. Show toast: "IDE requires desktop with File System Access"
4. Do not navigate - stay on Hub
Hotload Project Switching (Within Workspace)

// Workspace header has project switcher dropdown
const switchProject = async (newProjectId: string) => {
  const project = await db.projects.get(newProjectId);
  if (!project) return;

  // Verify workspace binding
  if (!project.workspaceBindings[currentWorkspace]) {
    toast.error(`${currentWorkspace} is not enabled for this project`);
    return;
  }

  // Navigate directly (reactive, no reload)
  navigate({
    to: `/${currentWorkspace}/$projectId`,
    params: { projectId: newProjectId }
  });
};
Files to Modify
DELETE (4 files)
File	Reason
src/lib/workspace/temp-project.ts	Entire file is temp project creation
src/lib/workspace/workspace-access-helper.tsx	Entire file is temp project creation
src/presentation/components/workspace/TempProjectBanner.tsx	No longer needed
src/presentation/components/workspace/TempProjectBannerCompact.tsx	No longer needed
HEAVILY REFACTOR (5 files)
File	Changes
src/routes/ide.tsx	Remove getOrCreateTempProject(), redirect to hub when no projects
src/routes/notes.lazy.tsx	Remove useBrowserModeProject(), redirect to hub when no projects
src/routes/ide.$projectId.tsx	Ensure platform guard is strict
src/routes/notes.$projectId.lazy.tsx	Ensure works without temp projects
src/presentation/components/hub/HubHomePage.tsx	Update project creation to use platform.storageType
LIGHTLY TOUCH (5 files)
File	Changes
src/domain/entities/project.ts	Remove isTemp, autoCreated, isBrowserMode fields
src/infrastructure/persistence/dexie-db-core-types.ts	Remove temp fields from ProjectRecord
src/infrastructure/persistence/stores/project/project-types.ts	Update CreateProjectInput
src/presentation/components/project/ProjectSelector.tsx	Remove temp project rendering
src/presentation/components/project/ProjectsPage.tsx	Remove isTemp prop handling
REPLACE (1 file)
File	Changes
src/lib/workspace/browser-mode.ts	REFACTOR: Remove pseudo-project, re-implement "view all notes" as cross-project query feature
Additional Requirements (User Confirmed)
1. Migration: Auto-Convert Temp Projects
Existing temp projects will be automatically converted to real projects:

Generate new UUID v4 ID
Rename to "Temporary Project {YYYY-MM-DD}"
Set storageType based on current platform
Remove isTemp, isBrowserMode, autoCreated flags
Silently upgrade - no user dialog needed
2. Browser Mode: Re-Implement "View All Notes"
The "view all notes across projects" feature will be re-implemented:

NOT as a pseudo-project
As a cross-project query/view mode in the Notes workspace
Filter/aggregation logic that queries notes from all user projects
Toggle switch: "All Projects" vs. "Current Project"
3. First Run: Prompt User with i18n
First-time users will see a styled prompt dialog:

i18n required: All strings in Vietnamese AND English
UX/UI: 8-bit design, no transparency, sharp corners
Two options: "Create your first project" or "Skip for now"
Skip leads to empty state with persistent CTA
Implementation Phases
Phase 1: Stop Creating Temp Projects (1 story)
Goal: No new temp projects are created

Tasks:

Add deprecation warning to createTempProject() and getOrCreateTempProject()
Update HubHomePage.tsx project creation to use platform.storageType
Update /notes route to redirect to hub instead of creating browser-mode project
Update /ide route to redirect to hub instead of creating temp project
Verification:

Creating a new project on desktop uses FSA storage
Creating a new project on mobile uses IndexedDB storage
No temp-* or browser-default IDs in DexieDB after creation
Phase 2: Update Type Definitions (1 story)
Goal: Remove temp-related fields from types

Tasks:

Remove isTemp, autoCreated, isBrowserMode from domain/entities/project.ts
Remove from dexie-db-core-types.ts (mark as deprecated first, don't drop yet)
Update all Project-related interfaces
Fix TypeScript errors
Verification:

pnpm tsc --noEmit passes with no errors
No references to isTemp in production code (tests can have for migration)
Phase 3: Clean Up Routing (2 stories)
Goal: All routes handle "no project" state cleanly

Story 3a: IDE Routes

Remove temp project imports from ide.tsx and ide.$projectId.tsx
Add proper "no projects" empty state with CTA to hub
Ensure platform guard is strict with clear error toast
Story 3b: Notes Routes

Remove useBrowserModeProject() from notes.lazy.tsx
Add proper "no projects" empty state with CTA to hub
Ensure works without any special projects
Verification:

Desktop user with no projects → hub with "Create Project" CTA
Mobile user with no projects → hub with "Create Project" CTA
Mobile user trying to access /ide → redirect to notes with toast
Phase 4: Delete Temp Project Files (1 story)
Goal: Remove all temp project code

Tasks:

Delete temp-project.ts
Delete workspace-access-helper.tsx
Delete TempProjectBanner.tsx
Delete TempProjectBannerCompact.tsx
Delete or refactor browser-mode.ts
Verification:

pnpm tsc --noEmit passes
No imports of deleted files
All tests pass
Phase 5: Data Migration + First Run Prompt (1 story)
Goal: Auto-convert temp projects and prompt first-time users

Tasks:

5a: Auto-Convert Temp Projects

Create migration script that:
Finds all projects with isTemp: true
Generates new UUID v4 for each
Renames to "Temporary Project {YYYY-MM-DD}" (i18n: "Dự án tạm thời {DD/MM/YYYY}")
Sets storageType based on getPlatformContract()
Removes temp flags
Run migration silently on app load (one-time)
Clean up DexieDB deprecated fields
5b: First Run Prompt (i18n)

Create FirstRunPromptDialog component:
8-bit styling (sharp corners, no transparency)
i18n strings: Vietnamese AND English
Two buttons: "Create Project" / "Skip for now"
Show when user has 0 projects
Skip leads to empty state with persistent CTA
i18n Strings Required:

English	Vietnamese	Key
Welcome to ViaGent	Chào mừng đến với ViaGent	welcome.title
Create your first project to get started	Tạo dự án đầu tiên của bạn để bắt đầu	welcome.message
Create Project	Tạo Dự Án	welcome.create
Skip for now	Bỏ qua ngay lúc này	welcome.skip
Create a project to use this workspace	Tạo dự án để sử dụng không gian làm việc	empty.createProject
Verification:

Existing temp projects auto-convert to real projects
New users see styled first-run prompt
i18n works for EN and VI
Skip leads to empty state with CTA
Success Criteria
After implementation:

 No isTemp, autoCreated, or isBrowserMode fields in any type
 All projects have valid UUID v4 IDs
 /ide route redirects mobile users to /notes with toast
 /notes route redirects users without projects to hub
 Desktop users can only create FSA projects
 Mobile users can only create IndexedDB projects
 Mobile users see toast when tapping IDE-only project
 Workspace switcher is reactive (no page reload)
 All workspace routes have consistent platform guards
Verification Steps
Desktop Fresh User:

Open app on desktop
See hub with "Create Project"
Create project → FSA picker appears
Land in /ide/{projectId}
Workspace switcher shows IDE and Notes
Desktop Returning User:

Open app on desktop
See project list
Click project → land in /ide/{projectId}
Switch to Notes → land in /notes/{projectId} (same project)
Mobile Fresh User:

Open app on mobile
See hub with "Create Project"
Create project → no FSA picker
Land in /notes/{projectId}
Workspace switcher shows Notes only
Mobile IDE Blocking:

On mobile, try to navigate to /ide/{projectId}
See toast: "IDE requires desktop"
Redirected to /notes/{projectId}
Project Switching:

Within workspace, open project switcher
Select different project
Content updates immediately (no page reload)
Sources
Architect Agent Analysis: fancy-inventing-swing-agent-abdc8f7.md
Analyst Agent Research: fancy-inventing-swing-agent-ad3c578.md
ADR-033: PlatformContract, StorageGateway decisions
Current codebase: src/ directory analysis
