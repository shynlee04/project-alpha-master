---
id: "26-4"
title: "Inline AI Magic"
status: "done"
created: "2025-12-30T21:40:00+07:00"
epic: 26
phase: "phase-2-extended"
priority: "P1"
story_points: 3
sprint: "2025-W01"
assigned_to: "dev"
---

# Story 26.4: Inline AI Magic

## Story Header

**As a** note taker,
**I want** to use AI commands directly in the editor,
**So that** I can generate or improve content without switching context.

---

## Acceptance Criteria

### AC-1: AI Slash Command
**Given** the user types `/` in the BlockNote editor
**When** the menu appears
**Then** an "AI Magic" (or "AI") option is visible
**And** selecting it opens a prompt input

### AC-2: Generation Flow
**Given** the AI prompt input is open
**When** the user types a request (e.g., "Summarize this", "Write a list of...") and hits Enter
**Then** the UI shows a loading state
**And** the AI generates content based on the prompt
**And** the generated content is inserted as blocks at the cursor position

### AC-3: Context Awareness (Bonus)
**Given** the user asks for context-dependent content
**When** the generation runs
**Then** the agent *should* have access to the current note's content (or at least the preceding block)
*(Minimum Viable: Just prompt-based generation first)*

### AC-4: Error Handling
**Given** the generation fails (network/error)
**When** the error occurs
**Then** a toast notification is shown "AI generation failed"
**And** no phantom blocks are left in the editor

---

## Technical Tasks

### T1: Editor Integration
- [ ] Create `AISlashCommand` configuration for BlockNote
- [ ] Implement `insertAI` slash menu item
- [ ] Implement `AIPromptDialog` (or inline input component)

### T2: AI Service
- [ ] Create `src/lib/notes/note-ai-service.ts`
- [ ] Implement `generateContent(prompt)` using `tanstack-ai` or provider
- [ ] Parse Markdown response into BlockNote blocks (BlockNote handles MD parsing usually, need to verify)

### T3: UI/UX Polish
- [ ] Add loading spinner/skeleton
- [ ] Add "Regenerate" option (optional/P2)

---

## Research Requirements

| Tool | Query | Purpose |
|------|-------|---------|
| Context7 | BlockNote custom slash command | How to insert custom item and open separate UI |
| Context7 | BlockNote markdown parsing | How to convert AI markdown to blocks |

---

## Dev Notes

### Pattern: Custom Slash Command
- See BlockNote docs for `slashMenuItems`.
- `execute` function typically modifies the editor state.
- We might need to open a React modal from the execution. Use a global store or context to trigger the modal ?
- Alternative: Inline block that becomes the prompt.

### Pattern: AI Service
- Re-use `useAgent` hook logic if possible, or direct `generateText`.
- If using `generateText`, ensure we use the user's configured provider/model.

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-30 | drafted | Story created |
