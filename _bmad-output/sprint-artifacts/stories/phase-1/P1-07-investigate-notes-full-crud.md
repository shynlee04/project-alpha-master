---
story_key: "P1-07-investigate-notes-full-crud"
epic: "EPIC-P1"
story: 7
status: "pending"
created_at: "2026-01-09T19:00:00+07:00"
points: 4
priority: "P1"
depends_on: ["P1-01"]
---

# P1-07: Investigate Notes Full CRUD

## User Story

**As a** User of the Notes workspace
**I want** to create, read, update, and delete notes
**So that** I can organize my thoughts and knowledge

## Context

Notes space needs full CRUD operations. Current issues identified:
- Disconnection from project-level file system
- Non-reactive note switching (no hotloading)
- Unwired or non-functional props in 3-pane layout

## Acceptance Criteria

### AC-1: Note Creation Works
**Given** A user wants to create a new note
**When** They use the notes UI
**Then** A new note is created and visible

### AC-2: Note Reading Works
**Given** A note exists
**When** The user clicks on it
**Then** The note content is displayed in the editor

### AC-3: Note Editing Works
**Given** A note is open
**When** The user makes changes
**Then** Changes are saved automatically

### AC-4: Note Deletion Works
**Given** A note exists
**When** The user deletes it
**Then** The note is removed

### AC-5: Note Switching is Reactive
**Given** Multiple notes exist
**When** The user switches between them
**Then** Content updates immediately (hotloading)

## Tasks

- [ ] T1: Test note creation via UI
- [ ] T2: Test note reading in BlockNote
- [ ] T3: Test note editing and auto-save
- [ ] T4: Test note deletion
- [ ] T5: Test note switching reactivity
- [ ] T6: Test 3-pane layout props
- [ ] T7: Document any gaps or blockers

## Dev Notes

### Investigation Checklist

| Feature | Status | Blocker |
|---------|--------|---------|
| Create note | ? | |
| Read note | ? | |
| Update note | ? | |
| Delete note | ? | |
| Note switching | ? | Non-reactive |
| 3-pane layout | ? | Unwired props |
| AI slash commands | ? | |

### Key Components

| Component | Purpose |
|-----------|---------|
| NotesPage | Main notes container |
| NoteEditor | BlockNote editor |
| NotesList | Note navigation |
| useNoteStore | Note state management |
| AISlashCommand | AI integration |

### Current Issues (From Strategy)

1. **Disconnection from project-level file system**
   - Notes not tied to project context
   - Need to investigate linking

2. **Non-reactive note switching**
   - Hotloading not working
   - May be Zustand subscription issue

3. **3-pane layout props unwired**
   - UI exists but props not connected
   - Need to trace prop flow

### Output

Create investigation report at:
`_bmad-output/diagnostics/phase-1-investigation-notes-crud-2026-01-09.md`
