---
story_key: "P1-03-temp-project-auto-flow"
epic: "EPIC-P1"
story: 3
status: "pending"
created_at: "2026-01-09T19:00:00+07:00"
points: 3
priority: "P0"
depends_on: ["P1-02"]
---

# P1-03: Create Temp Project Auto-Flow

## User Story

**As a** Developer visiting IDE for the first time
**I want** a temporary project to be auto-created
**So that** I can start coding immediately without manual setup

## Context

Currently, IDE is blocked because no file systems are synchronized. This story creates an automatic temp project flow so users can start working immediately.

## Acceptance Criteria

### AC-1: Temp Project Auto-Created
**Given** A user navigates to `/ide` without a project
**When** The route loads
**Then** A temporary project is automatically created

### AC-2: Temp Project Has Default Structure
**Given** A temp project is created
**When** The user views the file tree
**Then** They see a basic project structure (e.g., index.html, style.css, main.js)

### AC-3: Temp Project Persists in Session
**Given** A temp project is created
**When** The user navigates away and returns
**Then** The temp project is still available

### AC-4: User Can Sync to Local Later
**Given** A temp project exists
**When** The user wants to save their work
**Then** They can sync to a local folder (Phase 2 feature - documented only)

## Tasks

- [ ] T1: Create temp project creation logic
- [ ] T2: Define default project structure
- [ ] T3: Integrate with project store
- [ ] T4: Update IDE route to trigger auto-creation
- [ ] T5: Test temp project persistence

## Dev Notes

### Required User Scenario

> "I am a developer; I want to build a quick NextJS prototype landing page."

### Default Structure

```
temp-project-{timestamp}/
├── index.html
├── style.css
└── main.js
```

### Integration Points

| Component | Action | Notes |
|-----------|--------|-------|
| project-store | Create temp project | Use existing createProject |
| ide.tsx | Check for project, create if none | After P1-02 bypass |
| WebContainer | May need to scaffold files | Check if needed |

## References

- Depends on: P1-02 (IDE route simplified)
- Blocks: P1-06 (IDE Full CRUD)
