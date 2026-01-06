# Implementation Roadmap - Option B Architectural Redesign
**Date**: 2026-01-06
**Epic**: EPIC-OPTION-B-2026-01-06
**Status**: READY FOR SPRINT
**Total Effort**: 80 hours (2 weeks)

---

## Epic Overview

**Epic ID**: EPIC-OPTION-B-2026-01-06
**Title**: Option B Architectural Redesign - Proper Multi-Workspace Architecture
**Priority**: P0 - CRITICAL
**Type**: Architecture Refactoring

**Objective**: Implement the "Option B" architectural redesign to achieve the multi-workspace vision with proper route parameterization, unified file system, cross-workspace reactivity, and mobile/desktop fallback strategy.

**Success Criteria**:
- ✅ All workspace routes require `$projectId` parameter
- ✅ Routes without `$projectId` redirect to picker
- ✅ Single source of truth for file operations
- ✅ Notes are files in the project (bidirectional sync)
- ✅ File changes broadcast to all workspaces
- ✅ Mobile users can use app without crashes
- ✅ Graceful degradation for unsupported features
- ✅ Zero data loss during migration

**Risk Level**: Medium
**Migration Required**: Yes
**Breaking Changes**: Yes (routes, file system API)

---

## Story Breakdown

### Phase 1: Foundation (Critical Path)

#### Story 1.1: Centralized Project Picker Route

**ID**: STORY-OPTION-B-1-1
**Title**: Create Centralized Project Picker Route
**Priority**: P0
**Effort**: 4 hours
**Type**: Implementation
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] `/picker` route created with ProjectPicker component
- [ ] Loads all projects from Dexie
- [ ] Shows workspace bindings (which workspaces are enabled)
- [ ] `from` query parameter support (default: `ide`)
- [ ] Selecting project redirects to `/ide/$projectId` or `/notes/$projectId` etc
- [ ] "Create New Project" button opens creation dialog
- [ ] Mobile-friendly layout (responsive cards)

**Files to Create**:
- `src/routes/picker.tsx`
- `src/presentation/components/projects/ProjectPicker.tsx`

**Files to Modify**:
- `src/routes/__root.tsx` (add picker route)

**Validation**:
```bash
# TypeScript check
pnpm typecheck

# Manual testing
- Visit /picker → should see all projects
- Click project → should navigate to workspace
- Mobile view → should be responsive
```

---

#### Story 1.2: Empty State Redirects

**ID**: STORY-OPTION-B-1-2
**Title**: Implement Empty State Redirects for Root Routes
**Priority**: P0
**Effort**: 2 hours
**Type**: Implementation
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] `/` route checks for current project in store
- [ ] If project exists → redirect to `/ide/$projectId`
- [ ] If no project → redirect to `/picker`
- [ ] `/ide` (no projectId) → redirect to `/picker?from=ide`
- [ ] `/notes` (no projectId) → redirect to `/picker?from=notes`
- [ ] `/knowledge` (no projectId) → redirect to `/picker?from=knowledge`

**Files to Create**:
- `src/routes/index.tsx`
- `src/routes/ide.tsx`
- `src/routes/notes.tsx`
- `src/routes/knowledge.tsx`

**Validation**:
```bash
# Manual testing
- Visit / → should redirect to /picker (no current project)
- Set current project in store → visit / → should redirect to /ide/$projectId
- Visit /ide → should redirect to /picker?from=ide
- Visit /notes → should redirect to /picker?from=notes
```

---

#### Story 1.3: Workspace Route Loaders

**ID**: STORY-OPTION-B-1-3
**Title**: Add Loaders to All Workspace Routes
**Priority**: P0
**Effort**: 3 hours
**Type**: Implementation
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] `/notes/$projectId` has loader that fetches project before render
- [ ] `/knowledge/$projectId` has loader that fetches project before render
- [ ] Loader redirects to `/picker` if project doesn't exist
- [ ] No hydration flash (project available on render)
- [ ] Error handling in loader (show error state if fetch fails)

**Files to Modify**:
- `src/routes/notes.$projectId.tsx`
- `src/routes/knowledge.$projectId.tsx`
- `src/routes/study.$projectId.tsx` (if exists)

**Validation**:
```bash
# Manual testing
- Visit /notes/valid-project-id → should show workspace immediately (no flash)
- Visit /notes/invalid-project-id → should redirect to /picker
- Refresh page → should still work (no hydration error)
```

---

#### Story 1.4: Remove Manual Store Manipulation

**ID**: STORY-OPTION-B-1-4
**Title**: Remove Manual ProjectId Setting in Routes
**Priority**: P0
**Effort**: 2 hours
**Type**: Code Cleanup
**Route To**: `architecture-remediation → eliminate-god-stores`

**Acceptance Criteria**:
- [ ] All `useEffect(() => useIDEStore.getState().setProjectId())` removed
- [ ] All `useEffect(() => useRAGStore.getState().setCurrentProjectId())` removed
- [ ] Project ID set only in ProjectProvider (centralized)
- [ ] No direct store manipulation in route components

**Files to Modify**:
- `src/routes/ide.$projectId.tsx`
- `src/routes/notes.$projectId.tsx`
- `src/routes/knowledge.$projectId.tsx`

**Validation**:
```bash
# TypeScript check
pnpm typecheck

# Grep for anti-patterns
grep -r "getState().setProjectId" src/routes/
# Should return no results
```

---

#### Story 1.5: Feature Detection Utilities

**ID**: STORY-OPTION-B-1-5
**Title**: Create Feature Detection Utilities
**Priority**: P0
**Effort**: 2 hours
**Type**: Implementation
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] `detectFeatures()` function created
- [ ] Detects FSA support (showDirectoryPicker, showOpenFilePicker, etc)
- [ ] Detects device type (mobile, desktop, tablet)
- [ ] Detects platform (iOS, Android, Windows, macOS, Linux)
- [ ] `useFeatures()` hook for React components
- [ ] Caches detection results (no re-detection on re-renders)

**Files to Create**:
- `src/lib/detection/featureDetection.ts`
- `src/lib/detection/useFeatures.ts`

**Validation**:
```bash
# Unit tests
pnpm test featureDetection.test.ts

# Manual testing (desktop Chrome)
console.log(detectFeatures());
// Should show: fsa: true, isMobile: false, platform: 'windows/mac/linux'

# Manual testing (mobile Safari)
// Should show: fsa: false, isMobile: true, platform: 'ios'
```

---

#### Story 1.6: Inline Message Component

**ID**: STORY-OPTION-B-1-6
**Title**: Create Inline Message Component
**Priority**: P0
**Effort**: 2 hours
**Type**: Implementation
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] InlineMessage component created
- [ ] Supports variants: info, warning, error, success
- [ ] Optional action button with onClick handler
- [ ] Dismissible (X button) by default
- [ ] 8-bit gaming style (no glassmorphism)
- [ ] Mobile-friendly (touch targets ≥44px)
- [ ] `showInlineMessage()` helper function

**Files to Create**:
- `src/presentation/components/common/InlineMessage.tsx`
- `src/lib/messages/showInlineMessage.ts`

**Validation**:
```bash
# Manual testing
showInlineMessage('Test message', { variant: 'info' });
showInlineMessage('Warning message', { variant: 'warning', action: { label: 'Fix', onClick: () => {} } });
showInlineMessage('Error message', { variant: 'error' });
showInlineMessage('Success message', { variant: 'success' });

# Check visual style
- No backdrop-blur or glassmorphism
- Icons for each variant
- Touch targets ≥44px on mobile
```

---

#### Story 1.7: Mobile/Desktop Fallback in HubHomePage

**ID**: STORY-OPTION-B-1-7
**Title**: Implement Mobile/Desktop Fallback Strategy in HubHomePage
**Priority**: P0
**Effort**: 3 hours
**Type**: Implementation
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] Feature detection before `showDirectoryPicker()` call
- [ ] Mobile devices → show inline message + use Alpha Storage
- [ ] Desktop → try FSA with error handling
- [ ] User denies permission → show inline message + use Alpha Storage
- [ ] Folder not found → show error message
- [ ] No unhandled promise rejections
- [ ] Helpful inline messages throughout

**Files to Modify**:
- `src/presentation/components/hub/HubHomePage.tsx`

**Validation**:
```bash
# Manual testing (desktop)
- Click "Mount Folder" → should show directory picker
- Grant permission → should navigate to /ide/$projectId
- Deny permission → should show inline message + use in-memory storage

# Manual testing (mobile)
- Click "Mount Folder" → should show inline message (not crash)
- Should offer Alpha Storage as alternative
- Should work without FSA
```

---

### Phase 2: File System Unification

#### Story 2.1: UnifiedFileSystem Interface

**ID**: STORY-OPTION-B-2-1
**Title**: Define UnifiedFileSystem Interface
**Priority**: P0
**Effort**: 1 hour
**Type**: Architecture
**Route To**: `architecture-remediation → workspace-architect`

**Acceptance Criteria**:
- [ ] `UnifiedFileSystem` interface defined
- [ ] Includes: readFile, writeFile, deleteFile, listDirectory, exists
- [ ] Includes: watch, requestPermission, hasPermission
- [ ] Includes: getProjectHandle, close
- [ ] `FileChangeEvent` type defined
- [ ] `FileWriteOptions` type defined
- [ ] Comprehensive TypeScript documentation

**Files to Create**:
- `src/lib/workspace/fs/UnifiedFileSystem.ts`

**Validation**:
```bash
# TypeScript check
pnpm typecheck

# Verify interface is exported
grep -r "export interface UnifiedFileSystem" src/lib/workspace/fs/
```

---

#### Story 2.2: FSAAdapter Implementation

**ID**: STORY-OPTION-B-2-2
**Title**: Implement FSAAdapter
**Priority**: P0
**Effort**: 4 hours
**Type**: Implementation
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] FSAAdapter class implements UnifiedFileSystem
- [ ] readFile() reads from FileSystemFileHandle
- [ ] writeFile() writes with createWritable()
- [ ] listDirectory() iterates directory entries
- [ ] deleteFile() removes file
- [ ] exists() checks if file/directory exists
- [ ] watch() broadcasts FileChangeEvents
- [ ] requestPermission() calls handle.requestPermission()
- [ ] hasPermission() calls handle.queryPermission()
- [ ] Comprehensive error handling

**Files to Create**:
- `src/lib/workspace/fs/adapters/FSAAdapter.ts`

**Validation**:
```bash
# Unit tests
pnpm test FSAAdapter.test.ts

# Manual testing
const adapter = new FSAAdapter(handle);
await adapter.writeFile('/test.txt', 'Hello');
const result = await adapter.readFile('/test.txt');
console.log(result.content);  // Should be "Hello"
```

---

#### Story 2.3: InMemoryAdapter Implementation

**ID**: STORY-OPTION-B-2-3
**Title**: Implement InMemoryAdapter
**Priority**: P0
**Effort**: 2 hours
**Type**: Implementation
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] InMemoryAdapter class implements UnifiedFileSystem
- [ ] Uses Map<string, FileData> for storage
- [ ] All methods implemented (readFile, writeFile, etc.)
- [ ] watch() broadcasts events
- [ ] requestPermission() always returns true
- [ ] hasPermission() always returns true
- [ ] No permission errors (mobile-safe)

**Files to Create**:
- `src/lib/workspace/fs/adapters/InMemoryAdapter.ts`

**Validation**:
```bash
# Unit tests
pnpm test InMemoryAdapter.test.ts

# Manual testing
const adapter = new InMemoryAdapter();
await adapter.writeFile('/test.txt', 'Hello');
const result = await adapter.readFile('/test.txt');
console.log(result.content);  // Should be "Hello"
```

---

#### Story 2.4: FileSystem Factory

**ID**: STORY-OPTION-B-2-4
**Title**: Implement createFileSystem Factory Function
**Priority**: P0
**Effort**: 2 hours
**Type**: Implementation
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] `createFileSystem(project)` function created
- [ ] Checks if project has FSA handle
- [ ] Requests permission if needed
- [ ] Falls back to InMemoryAdapter if FSA fails
- [ ] Detects mobile devices → uses InMemoryAdapter
- [ ] Shows helpful inline messages
- [ ] Updates project.fsaHandle in Dexie if mounted

**Files to Create**:
- `src/lib/workspace/fs/createFileSystem.ts`

**Validation**:
```bash
# Manual testing (desktop with FSA)
const fs = await createFileSystem(project);
// Should return FSAAdapter instance

# Manual testing (desktop without FSA or permission denied)
const fs = await createFileSystem(project);
// Should return InMemoryAdapter instance
// Should show inline message

# Manual testing (mobile)
const fs = await createFileSystem(project);
// Should return InMemoryAdapter instance
// Should show inline message
```

---

#### Story 2.5: UnifiedNoteSystem Implementation

**ID**: STORY-OPTION-B-2-5
**Title**: Implement UnifiedNoteSystem
**Priority**: P0
**Effort**: 3 hours
**Type**: Implementation
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] UnifiedNoteSystem class created
- [ ] Constructor takes (fs: UnifiedFileSystem, projectId: string)
- [ ] listNotes() lists all .md files
- [ ] readNote() reads specific note
- [ ] writeNote() writes note (BIDIRECTIONAL SYNC!)
- [ ] createNote() creates new note
- [ ] deleteNote() deletes note
- [ ] watchNotes() watches for .md file changes
- [ ] All operations use UnifiedFileSystem (single source of truth)

**Files to Create**:
- `src/lib/workspace/notes/UnifiedNoteSystem.ts`

**Validation**:
```bash
# Unit tests
pnpm test UnifiedNoteSystem.test.ts

# Manual testing
const fs = await createFileSystem(project);
const notes = new UnifiedNoteSystem(fs, project.id);

await notes.createNote('test', 'Hello World');
const note = await notes.readNote('/test.md');
console.log(note.content);  // Should be "Hello World"

// Bidirectional sync test
await notes.writeNote('/test.md', 'Updated content');
const fileContent = await fs.readFile('/test.md');
console.log(fileContent);  // Should be "Updated content" (same data!)
```

---

#### Story 2.6: Dexie Backup Before Migration

**ID**: STORY-OPTION-B-2-6
**Title**: Implement Dexie Backup Utility
**Priority**: P0
**Effort**: 2 hours
**Type**: Infrastructure
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] `backupDexie()` function created
- [ ] Exports all Dexie tables to JSON
- [ ] Downloads backup as file
- [ ] `restoreDexie()` function created
- [ ] Imports JSON backup to Dexie
- [ ] Validates backup format
- [ ] Shows progress indicator

**Files to Create**:
- `src/infrastructure/persistence/backup/backupDexie.ts`
- `src/infrastructure/persistence/backup/restoreDexie.ts`

**Validation**:
```bash
# Manual testing
await backupDexie();
// Should download dexie-backup-[timestamp].json file

// Clear Dexie
await db.delete();

// Restore from backup
await restoreDexie(backupFile);
// Should restore all data
```

---

### Phase 3: Cross-Workspace Reactivity

#### Story 3.1: WorkspaceEventBus Implementation

**ID**: STORY-OPTION-B-3-1
**Title**: Implement WorkspaceEventBus
**Priority**: P0
**Effort**: 3 hours
**Type**: Implementation
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] WorkspaceEventBus class created
- [ ] `on(eventType, listener)` method (subscribe)
- [ ] `emit(event)` method (broadcast)
- [ ] `getHistory(filter)` method (replay/debugging)
- [ ] `clearHistory()` method
- [ ] Event types: file:created, file:modified, file:deleted
- [ ] Event types: agent:started, agent:completed, etc.
- [ ] Singleton instance exported
- [ ] Event history (max 100 events)
- [ ] Console logging for debugging

**Files to Create**:
- `src/lib/events/WorkspaceEventBus.ts`

**Validation**:
```bash
# Unit tests
pnpm test WorkspaceEventBus.test.ts

# Manual testing
const callback = jest.fn();
workspaceEventBus.on('file:modified', callback);

workspaceEventBus.emit({
  type: 'file:modified',
  projectId: 'test',
  timestamp: Date.now(),
  data: { path: '/test.txt' }
});

expect(callback).toHaveBeenCalled();
```

---

#### Story 3.2: File System Event Broadcasting

**ID**: STORY-OPTION-B-3-2
**Title**: Integrate Event Broadcasting in File System Adapters
**Priority**: P0
**Effort**: 2 hours
**Type**: Integration
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] FSAAdapter broadcasts events on writeFile()
- [ ] FSAAdapter broadcasts events on deleteFile()
- [ ] InMemoryAdapter broadcasts events on writeFile()
- [ ] InMemoryAdapter broadcasts events on deleteFile()
- [ ] Events include: type, projectId, timestamp, data
- [ ] broadcastEvents option in writeFile() (default: true)
- [ ] Event deduplication (no duplicate events)

**Files to Modify**:
- `src/lib/workspace/fs/adapters/FSAAdapter.ts`
- `src/lib/workspace/fs/adapters/InMemoryAdapter.ts`

**Validation**:
```bash
# Manual testing
const fs = await createFileSystem(project);
const callback = jest.fn();

workspaceEventBus.on('file:modified', callback);
await fs.writeFile('/test.txt', 'Hello');

expect(callback).toHaveBeenCalledWith(
  expect.objectContaining({
    type: 'file:modified',
    data: { path: '/test.txt' }
  })
);
```

---

#### Story 3.3: Workspace Event Subscriptions

**ID**: STORY-OPTION-B-3-3
**Title**: Add Event Subscriptions in Workspace Components
**Priority**: P0
**Effort**: 4 hours
**Type**: Integration
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] NotesWorkspace subscribes to file:modified events
- [ ] IDEWorkspace subscribes to file:modified events
- [ ] KnowledgeWorkspace subscribes to file:modified events
- [ ] Workspaces update UI when files change
- [ ] Workspaces ignore events from other projects
- [ ] Workspaces unsubscribe on unmount
- [ ] No event loops (workspace doesn't handle its own events)

**Files to Modify**:
- `src/presentation/components/notes/NotesWorkspace.tsx`
- `src/presentation/components/ide/IDEWorkspace.tsx`
- `src/presentation/components/knowledge/KnowledgeWorkspace.tsx`

**Validation**:
```bash
# E2E testing
1. Open Notes workspace
2. Open IDE workspace in separate tab
3. Edit file in Notes workspace
4. Switch to IDE tab
5. IDE should show updated file content (refresh/reload)
```

---

### Phase 4: Project Context System

#### Story 4.1: ProjectContext Implementation

**ID**: STORY-OPTION-B-4-1
**Title**: Implement ProjectContext Provider
**Priority**: P0
**Effort**: 3 hours
**Type**: Implementation
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] ProjectContext created with createContext
- [ ] ProjectProvider component created
- [ ] Provider takes projectId as prop
- [ ] Provider loads project on mount
- [ ] Provider creates UnifiedFileSystem
- [ ] Provider creates UnifiedNoteSystem
- [ ] Provider shows loading state while loading
- [ ] Provider redirects to /picker if project not found
- [ ] useProjectContext() hook created
- [ ] Throws error if used outside provider

**Files to Create**:
- `src/lib/workspace/context/ProjectContext.tsx`

**Validation**:
```bash
# TypeScript check
pnpm typecheck

# Manual testing
const { project, fs, noteSystem } = useProjectContext();
console.log(project.id);  // Should be current project ID
```

---

#### Story 4.2: Update Workspace Routes with ProjectProvider

**ID**: STORY-OPTION-B-4-2
**Title**: Wrap Workspace Routes with ProjectProvider
**Priority**: P0
**Effort**: 2 hours
**Type**: Integration
**Route To**: `bmad-core → dev-story`

**Acceptance Criteria**:
- [ ] `/ide/$projectId` route wrapped with ProjectProvider
- [ ] `/notes/$projectId` route wrapped with ProjectProvider
- [ ] `/knowledge/$projectId` route wrapped with ProjectProvider
- [ ] Workspace components use useProjectContext()
- [ ] No direct store access in workspace components
- [ ] Project context available throughout workspace tree

**Files to Modify**:
- `src/routes/ide.$projectId.tsx`
- `src/routes/notes.$projectId.tsx`
- `src/routes/knowledge.$projectId.tsx`

**Validation**:
```bash
# Manual testing
- Visit /notes/valid-project-id
- Open browser console
- Run: window.useProjectContext()
- Should return project context object
```

---

#### Story 4.3: Update Workspace Components to Use Context

**ID**: STORY-OPTION-B-4-3
**Title**: Refactor Workspace Components to Use ProjectContext
**Priority**: P0
**Effort**: 3 hours
**Type**: Code Refactoring
**Route To**: `architecture-remediation → eliminate-god-stores`

**Acceptance Criteria**:
- [ ] NotesWorkspace uses useProjectContext()
- [ ] IDEWorkspace uses useProjectContext()
- [ ] KnowledgeWorkspace uses useProjectContext()
- [ ] No direct project fetching in components
- [ ] No direct store manipulation in components
- [ ] All project data from context

**Files to Modify**:
- `src/presentation/components/notes/NotesWorkspace.tsx`
- `src/presentation/components/ide/IDEWorkspace.tsx`
- `src/presentation/components/knowledge/KnowledgeWorkspace.tsx`

**Validation**:
```bash
# TypeScript check
pnpm typecheck

# Grep for anti-patterns
grep -r "getProject(" src/presentation/components/
# Should return no results (all using context)
```

---

### Phase 5: Testing & Validation

#### Story 5.1: Comprehensive Testing Suite

**ID**: STORY-OPTION-B-5-1
**Title**: Write Comprehensive Tests
**Priority**: P1
**Effort**: 6 hours
**Type**: Testing
**Route To**: `bmad-core → test-automation`

**Acceptance Criteria**:
- [ ] Unit tests for UnifiedFileSystem interface
- [ ] Unit tests for FSAAdapter
- [ ] Unit tests for InMemoryAdapter
- [ ] Unit tests for UnifiedNoteSystem
- [ ] Unit tests for WorkspaceEventBus
- [ ] Integration tests for cross-workspace reactivity
- [ ] E2E tests for mobile fallback
- [ ] E2E tests for route redirects
- [ ] Test coverage ≥80% for new code

**Files to Create**:
- `src/lib/workspace/fs/__tests__/FSAAdapter.test.ts`
- `src/lib/workspace/fs/__tests__/InMemoryAdapter.test.ts`
- `src/lib/workspace/notes/__tests__/UnifiedNoteSystem.test.ts`
- `src/lib/events/__tests__/WorkspaceEventBus.test.ts`
- `src/presentation/components/__tests__/ProjectPicker.test.tsx`
- `src/presentation/components/__tests__/InlineMessage.test.tsx`

**Validation**:
```bash
# Run all tests
pnpm test

# Check coverage
pnpm test:coverage

# Verify coverage ≥80%
```

---

#### Story 5.2: E2E Testing with Playwright

**ID**: STORY-OPTION-B-5-2
**Title**: Create E2E Tests for Critical User Journeys
**Priority**: P1
**Effort**: 4 hours
**Type**: Testing
**Route To**: `bmad-core → test-automation`

**Acceptance Criteria**:
- [ ] E2E test: User visits / → redirects to /picker
- [ ] E2E test: User selects project → navigates to /ide/$projectId
- [ ] E2E test: User creates file in IDE → visible in Notes
- [ ] E2E test: User edits note → file updated on disk
- [ ] E2E test: Mobile user visits hub → sees inline message
- [ ] E2E test: User denies permission → falls back to in-memory
- [ ] E2E test: Page refresh preserves state
- [ ] E2E test: Workspace switch preserves state

**Files to Create**:
- `e2e/workspace-routes.spec.ts`
- `e2e/cross-workspace-sync.spec.ts`
- `e2e/mobile-fallback.spec.ts`
- `e2e/state-preservation.spec.ts`

**Validation**:
```bash
# Run E2E tests
pnpm test:e2e

# All tests should pass
```

---

### Phase 6: Documentation & Governance

#### Story 6.1: Update AGENTS.md

**ID**: STORY-OPTION-B-6-1
**Title**: Update AGENTS.md with New Architecture
**Priority**: P1
**Effort**: 2 hours
**Type**: Documentation
**Route To**: `asgl → governance-update`

**Acceptance Criteria**:
- [ ] Route architecture section updated
- [ ] File system architecture section updated
- [ ] Cross-workspace event system documented
- [ ] Project context system documented
- [ ] Mobile/desktop fallback strategy documented
- [ ] All new file paths added
- [ ] All new interfaces documented
- [ ] Migration notes added

**Files to Modify**:
- `AGENTS.md`

**Validation**:
```bash
# Check documentation
grep -r "UnifiedFileSystem" AGENTS.md
grep -r "WorkspaceEventBus" AGENTS.md
grep -r "ProjectContext" AGENTS.md
```

---

#### Story 6.2: Create Migration Guide

**ID**: STORY-OPTION-B-6-2
**Title**: Create Migration Guide for Developers
**Priority**: P1
**Effort**: 2 hours
**Type**: Documentation
**Route To**: `asgl → documentation-generator`

**Acceptance Criteria**:
- [ ] Migration guide created in `_bmad-output/guides/`
- [ ] Breaking changes documented
- [ ] Route changes documented (old → new mappings)
- [ ] File system API changes documented
- [ ] Code migration examples provided
- [ ] Testing before migration checklist
- [ ] Rollback procedure documented

**Files to Create**:
- `_bmad-output/guides/option-b-migration-guide.md`

**Validation**:
```bash
# Verify guide exists
ls -la _bmad-output/guides/option-b-migration-guide.md

# Check completeness
grep -E "(Breaking Changes|Route Changes|Migration Steps)" _bmad-output/guides/option-b-migration-guide.md
```

---

#### Story 6.3: Update CLAUDE.md

**ID**: STORY-OPTION-B-6-3
**Title**: Update CLAUDE.md with Architecture Changes
**Priority**: P2
**Effort**: 1 hour
**Type**: Documentation
**Route To**: `asgl → documentation-generator`

**Acceptance Criteria**:
- [ ] Route architecture quick reference updated
- [ ] File system quick reference updated
- [ ] New components documented
- [ ] AGENTS.md links updated

**Files to Modify**:
- `CLAUDE.md`

**Validation**:
```bash
# Check documentation
grep -E "(UnifiedFileSystem|WorkspaceEventBus|ProjectContext)" CLAUDE.md
```

---

#### Story 6.4: Create Epic and Stories in Jira/Linear

**ID**: STORY-OPTION-B-6-4
**Title**: Create Epic and Stories in Project Management Tool
**Priority**: P1
**Effort**: 1 hour
**Type**: Project Management
**Route To**: `bmad-bmm-sm` (Scrum Master)

**Acceptance Criteria**:
- [ ] Epic "Option B Architectural Redesign" created
- [ ] All 23 stories created
- [ ] Stories assigned to correct phases
- [ ] Story points estimated
- [ ] Dependencies linked
- [ ] Acceptance criteria copied
- [ ] Ready for sprint planning

**Files to Create**:
- (Project management tool entries)

**Validation**:
```bash
# Verify epic and stories exist in project management tool
# (Manual verification in Jira/Linear/GitHub Issues)
```

---

## Sprint Plan

### Sprint 1: Foundation (Week 1, Days 1-3)

**Stories**: 1.1 - 1.7
**Effort**: 18 hours
**Focus**: Route parameterization and mobile fallback

**Daily Standup**:
- Day 1: Stories 1.1, 1.2 (Centralized picker, redirects)
- Day 2: Stories 1.3, 1.4 (Loaders, remove store manipulation)
- Day 3: Stories 1.5, 1.6, 1.7 (Feature detection, inline messages, mobile fallback)

**Success Criteria**:
- All routes require `$projectId`
- Mobile users can use app
- No folder selector loops

---

### Sprint 2: File System (Week 1, Days 4-5)

**Stories**: 2.1 - 2.6
**Effort**: 14 hours
**Focus**: Unified file system and note system

**Daily Standup**:
- Day 4: Stories 2.1, 2.2, 2.3 (Interface, FSAAdapter, InMemoryAdapter)
- Day 5: Stories 2.4, 2.5, 2.6 (Factory, note system, backup)

**Success Criteria**:
- Single source of truth for files
- Notes are files (bidirectional sync)
- Backup utility tested

---

### Sprint 3: Reactivity (Week 2, Day 1)

**Stories**: 3.1 - 3.3
**Effort**: 9 hours
**Focus**: Cross-workspace event system

**Daily Standup**:
- Day 1: Stories 3.1, 3.2, 3.3 (EventBus, broadcasting, subscriptions)

**Success Criteria**:
- File changes broadcast to workspaces
- Workspaces react in real-time
- No event loops

---

### Sprint 4: Context & Testing (Week 2, Days 2-3)

**Stories**: 4.1 - 4.3, 5.1, 5.2
**Effort**: 18 hours
**Focus**: Project context and testing

**Daily Standup**:
- Day 2: Stories 4.1, 4.2, 4.3 (ProjectContext, routes, refactoring)
- Day 3: Stories 5.1, 5.2 (Unit tests, E2E tests)

**Success Criteria**:
- Project context available everywhere
- Test coverage ≥80%
- All tests passing

---

### Sprint 5: Documentation (Week 2, Days 4-5)

**Stories**: 6.1 - 6.4
**Effort**: 6 hours
**Focus**: Documentation and governance

**Daily Standup**:
- Day 4: Stories 6.1, 6.2 (AGENTS.md, migration guide)
- Day 5: Stories 6.3, 6.4 (CLAUDE.md, project management)

**Success Criteria**:
- Documentation complete
- Migration guide available
- Epic and stories in project management tool

---

## Risk Register

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| Data loss during migration | Medium | Critical | Backup before migration, verify after | Story 2.6 |
| Breaking existing bookmarks | High | Medium | Redirect handlers for old routes | Story 1.2 |
| Performance regression | Low | High | Benchmark before/after, debouncing | Story 3.1 |
| State hydration issues | Medium | High | Proper loader serialization | Story 1.3 |
| Event loops (infinite emit) | Medium | Medium | Event deduplication, project ID check | Story 3.2 |
| Mobile compatibility issues | Low | Medium | Extensive mobile testing | Story 1.7 |

---

## Definition of Done

For each story to be considered "Done", it must meet:

1. **Code Complete**
   - [ ] All acceptance criteria met
   - [ ] Code follows project conventions
   - [ ] TypeScript compiles without errors
   - [ ] No console errors or warnings

2. **Testing**
   - [ ] Unit tests written (if applicable)
   - [ ] All tests passing
   - [ ] Manual testing completed
   - [ ] Edge cases tested

3. **Code Review**
   - [ ] Peer review completed
   - [ ] Review feedback addressed
   - [ ] No outstanding comments

4. **Documentation**
   - [ ] Code is self-documenting
   - [ ] Complex logic has comments
   - [ ] AGENTS.md updated (if architecture change)

5. **Integration**
   - [ ] No regressions in existing functionality
   - [ ] Cross-workspace flows tested
   - [ ] Mobile/desktop compatibility verified

---

## Success Metrics

**Epic Level**:
- [ ] All 23 stories completed
- [ ] Zero critical bugs
- [ ] Test coverage ≥80%
- [ ] TypeScript errors = 0
- [ ] Performance ≤1.2x baseline

**User Experience**:
- [ ] Folder selector loops eliminated
- [ ] Mobile users can use app
- [ ] Page refresh preserves state
- [ ] Workspace switch preserves state
- [ ] File changes sync across workspaces

**Technical**:
- [ ] Single source of truth for files
- [ ] No split brain (Dexie vs FSA)
- [ ] No manual store manipulation
- [ ] Project context in URL
- [ ] Graceful degradation everywhere

---

## Next Steps

1. **User Approval**: Review and approve this epic
2. **Sprint Planning**: Schedule sprints and assign developers
3. **Setup**: Create feature branch `feature/option-b-architecture`
4. **Execution**: Start with Story 1.1 (Centralized Project Picker)
5. **Daily Standups**: Track progress and blockers
6. **Retrospective**: After each sprint, review and adapt

---

**Status**: READY FOR SPRINT
**Approval**: PENDING
**Estimated Start**: 2026-01-07
**Estimated Complete**: 2026-01-20

---

**End of Implementation Roadmap**
