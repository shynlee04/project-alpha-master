---
# Story: EPIC-MOBILE Integration - NotesPage Mobile Layout Integration
# Created: 2026-01-09T21:00:00+07:00
# Workflow: story-cycle (BMAD V6)
# Status: READY_FOR_VALIDATION
# ═══════════════════════════════════════════════════════════════════════════

epic_id: "EPIC-MOBILE"
story_id: "MOBILE-INT-01"
title: "Integrate NotesMobileLayout with NotesPage"

priority: "P0-CRITICAL"
effort_hours: 2
status: "READY_FOR_VALIDATION"

user_story: |
  As a mobile user of the Notes workspace
  I want to use the tab-based mobile navigation (Notes, Search, AI)
  So that I can easily access notes, search, and AI features on my phone

description: |
  Replace the inline mobile view in NotesPage.tsx with the standalone NotesMobileLayout component.
  The integration must:
  - Wire note list content as children
  - Preserve all existing functionality (file sync, imports, exports)
  - Maintain same navigation behavior
  - Support all current gestures and shortcuts

dependencies:
  - "MOBILE-01"

files:
  - "src/presentation/components/notes/NotesPage.tsx"
  - "src/presentation/components/notes/NotesMobileLayout.tsx"
  - "src/presentation/components/notes/index.ts"

acceptance_criteria:
  - "Mobile view uses NotesMobileLayout wrapper"
  - "Note list renders as children content"
  - "Bottom navigation works (Notes, Search, AI tabs)"
  - "Content tabs work (All, Favorites, Tags)"
  - "Create note FAB is functional"
  - "File sync status displays correctly"
  - "Import/Export dialogs still work"
  - "No console errors on mobile viewport"

tasks:
  - task_id: "MOBILE-INT-01-01"
    description: "Import NotesMobileLayout in NotesPage.tsx"
    status: "pending"
    
  - task_id: "MOBILE-INT-01-02"
    description: "Replace inline mobile view with NotesMobileLayout wrapper"
    status: "pending"
    
  - task_id: "MOBILE-INT-01-03"
    description: "Wire note list as children content"
    status: "pending"
    
  - task_id: "MOBILE-INT-01-04"
    description: "Preserve import/export dialog functionality"
    status: "pending"
    
  - task_id: "MOBILE-INT-01-05"
    description: "Test mobile navigation and gestures"
    status: "pending"

validation:
  typecheck: "pnpm typecheck --filter src/presentation/components/notes/"
  build: "pnpm build"
  manual_test: |
    1. Open browser DevTools → Toggle device toolbar → iPhone 14 Pro (390x844)
    2. Navigate to /notes/{projectId}
    3. Verify bottom navigation (Notes, Search, AI) appears
    4. Tap AI tab → verify AI panel opens
    5. Tap + FAB → verify create note works
    6. Test content tabs (All, Favorites, Tags)
    7. Test import/export dialogs

notes: |
  This story is CRITICAL because mobile users currently have broken UX.
  The previous session created the component but did not integrate it.
