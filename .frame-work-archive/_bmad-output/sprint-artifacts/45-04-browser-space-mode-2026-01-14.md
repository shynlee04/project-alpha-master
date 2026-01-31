# 45-04: Browser Space vs Project Space Mode

**Epic:** EPIC-45 - Chat State & Project Foundation
**Story:** 45-04
**Status:** COMPLETED
**Created:** 2026-01-14
**Completed:** 2026-01-14
**Priority:** P1-HIGH
**Team:** Team A
**Iteration:** 3

---

## User Story

**As a** user who wants to quickly capture thoughts or explore ideas
**I want** to use the Notes workspace without being forced to create or select a project
**So that** I can use Notes as a scratchpad/browser mode without the overhead of project management

---

## Epic Analysis

### Epic Basics
- **Number:** 45
- **Name:** Chat State & Project Foundation
- **Status:** IN_PROGRESS
- **Progress:** 60% (3/5 stories complete)

### Epic Goals
- **Primary Goal:** Establish single source of truth for project state across all workspaces
- **Secondary Goals:**
  - Fix state drift between workspace tabs (Files/Notes/AI)
  - Enable workspace-specific project selection persistence
  - Foundation for space-aware agent orchestration (EPIC-46)

### Epic Scope
- **Stories Total:** 5
- **Stories Completed:** 3 (45-01, 45-02, 45-03)
- **Current Story:** 45-04 (mode switch implementation)
- **Remaining:** 45-05 (scroll position)

---

## Current Problem

### Forced Project Requirement

Currently, the Notes workspace **requires** a project to be selected:

1. **No Project = No Notes**: Users cannot create notes without first creating/selecting a project
2. **High Friction**: Quick note-taking requires project setup overhead
3. **Lost Users**: Some users abandon the app due to forced project creation

### User Feedback (from NOTES-NOTEBOOKLM-BLUEPRINT.md)

> "even user who does not want to create project still can use it as tempo 1 project space (on desktop phones etc) all AI generated features (multimodality) RAG, agent etc which are scattered round in this project must be gathered"

### Root Cause

```typescript
// Current behavior in NotesPage.tsx:
const projectId = project?.id || 'default';

// If no project selected, notes cannot be created
// The note store requires a projectId for all operations
```

---

## Acceptance Criteria

### AC1: Browser Mode Available
- [x] Notes workspace accessible without project selection
- [x] Default "browser mode" project auto-created on first visit
- [x] User sees all notes across all projects in browser mode

### AC2: Project Mode Switching
- [x] User can switch between browser mode and project mode
- [x] Project selector shows "Browser Mode" option
- [x] Selecting a project switches to project mode
- [x] Selecting "Browser Mode" shows all notes

### AC3: Visual Distinction
- [x] Browser mode clearly indicated in UI
- [x] Project-scoped notes show project badge/indicator
- [ ] Filter by project available in browser mode (DEFERRED - can be added later)

### AC4: Data Integrity
- [x] Notes created in browser mode not lost when switching to project mode
- [x] Project-specific notes remain scoped to their project
- [x] No data migration required

---

## Technical Implementation

### Approach: "Browser Mode" as Default Project

Instead of implementing a complex mode system, we'll use a **default browser project**:

1. **Auto-create default project**: `notes:browser-mode` created on first app load
2. **Default to browser mode**: When no project selected, use browser project
3. **Virtual all-projects view**: In browser mode, show notes from all projects

### File: `src/lib/workspace/browser-mode.ts` (NEW)

```typescript
/**
 * Browser Mode Utilities
 * @module lib/workspace/browser-mode
 * @governance 45-04
 *
 * Provides "browser mode" functionality for Notes workspace.
 * Browser mode allows viewing/editing notes across all projects.
 */

import { getProject, createProject } from '@/lib/workspace/project-store';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';

/** Default browser mode project ID */
export const BROWSER_MODE_PROJECT_ID = 'notes:browser-mode';

/**
 * Get or create the default browser mode project
 * @returns Browser mode project
 */
export async function getOrCreateBrowserModeProject(): Promise<Project> {
  const existing = await getProject(BROWSER_MODE_PROJECT_ID);
  if (existing) {
    return existing as Project;
  }

  // Create browser mode project if it doesn't exist
  return await createProject({
    id: BROWSER_MODE_PROJECT_ID,
    name: 'Browser Mode',
    folderPath: 'Notes', // Uses IndexedDB storage
    storageType: 'indexeddb',
    autoSync: false,
    bindings: { notes: true, knowledge: true },
    isBrowserMode: true, // Special flag
    autoCreated: true,
  } as Project);
}

/**
 * Check if a project is browser mode
 */
export function isBrowserModeProject(project: Project | null): boolean {
  return project?.id === BROWSER_MODE_PROJECT_ID || project?.isBrowserMode === true;
}
```

### Files to Modify

1. **`src/routes/notes.lazy.tsx`**
   - Auto-create browser mode project on mount
   - Use browser project as default

2. **`src/presentation/components/notes/NotesPage.tsx`**
   - Add "Browser Mode" option to project selector
   - Show all notes when in browser mode
   - Add project badge to notes in list

3. **`src/presentation/components/notes/NoteSidebar.tsx`**
   - Update note list to show all notes in browser mode
   - Add project filter chips
   - Add project badges to note items

4. **`src/presentation/components/project/ProjectSelector.tsx`**
   - Add "Browser Mode" as first option
   - Visual distinction for browser mode

5. **`src/infrastructure/persistence/stores/note/note-store.ts`**
   - Add `getAllNotes()` method for browser mode
   - Note: Each note already has `projectId` field

---

## Cross-Impact Analysis

### Workspace Impact

| Workspace | Affected | Changes |
|-----------|----------|---------|
| **Notes** | YES | Browser mode as default, all-notes view |
| **Knowledge** | MAYBE | Could benefit from browser mode for sources |
| **Study** | MAYBE | Could benefit from browser mode for flashcards |

### Database Impact
- **No schema changes**: Notes already have `projectId` field
- **New project**: Browser mode project added to project registry
- **Query impact**: Browser mode queries across all projects (performance consideration)

---

## Implementation Tasks

| Task | Type | Effort | Depends On |
|------|------|--------|------------|
| Create browser-mode utilities | Implementation | 30m | - |
| Update notes route to use browser mode | Implementation | 30m | Utilities |
| Add Browser Mode to ProjectSelector | UI | 30m | - |
| Show all notes in browser mode | Implementation | 1h | Store update |
| Add project badges to note items | UI | 30m | - |
| Add project filter in browser mode | UI | 30m | All-notes view |
| Test cross-project note visibility | Testing | 30m | All above |

**Total Estimated Effort:** 4 hours

---

## Design Notes

### Visual Design for Browser Mode

```
┌─────────────────────────────────────────────────────────┐
│ Notes                             [Browser Mode ▼]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Filter: [All] [My Project] [Work Project] [+ New]     │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 📝 Meeting Notes              [My Project]       │  │
│ │ Created 2 hours ago                             │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 💡 App Ideas                  [Work Project]     │  │
│ │ Created yesterday                                │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 📝 Grocery List               [No Project]       │  │
│ │ Created 3 days ago                                │  │
│ └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Project Selector in Browser Mode

```
Current Project: [Browser Mode ▼]
                  ├─ Browser Mode (all notes)
                  ├─ ────────────────────
                  ├─ My Project
                  ├─ Work Project
                  └─ + New Project
```

---

## Handoff

**Story Status:** COMPLETED
**Next Phase:** Story 45-05 (Preserve scroll position per note)

### Artifacts Created
- [x] Story artifact (this file)
- [x] Browser mode utilities (`src/lib/workspace/browser-mode.ts`)
- [x] Updated notes route (`src/routes/notes.lazy.tsx`)
- [x] All-notes view implementation (`loadAllNotes()` in note-crud-slice.ts)
- [x] Project badges in NoteTree (`NoteTree.tsx`, `NoteTreeItem.tsx`)

### Files Modified
1. `src/lib/workspace/browser-mode.ts` (NEW)
2. `src/lib/notes/slices/note-crud-slice.ts` (added loadAllNotes)
3. `src/lib/notes/types-slice.ts` (added loadAllNotes to interface)
4. `src/routes/notes.lazy.tsx` (use browser mode project)
5. `src/presentation/components/notes/NotesPage.tsx` (call loadAllNotes in browser mode)
6. `src/presentation/components/notes/NoteSidebar.tsx` (isBrowserMode prop)
7. `src/presentation/components/notes/NoteTree.tsx` (isBrowserMode prop)
8. `src/presentation/components/notes/NoteTreeItem.tsx` (project badges)
9. `src/domain/entities/project.ts` (isBrowserMode flag)

---

## Notes

**Why Browser Mode Matters:**

From the product blueprint:
> "even user who does not want to create project still can use it as tempo 1 project space (on desktop phones etc)"

This reduces friction for:
- **Quick note-takers**: Don't want project management overhead
- **Exploratory users**: Want to try the app before committing
- **Mobile users**: Need fast capture, not organization features

**Alternative Considered and Rejected:**
- **Separate browser workspace**: Rejected because it doubles component complexity
- **No-project state**: Rejected because note store requires projectId
- **In-memory notes**: Rejected because notes would be lost on refresh

**Decision:** Use a special "browser mode" project that acts as a default, with an "all-notes" view that aggregates across projects.
