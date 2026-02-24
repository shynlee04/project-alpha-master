---
# Story: EPIC-MOBILE Integration - KnowledgePage Mobile Layout Integration
# Created: 2026-01-09T21:00:00+07:00
# Workflow: story-cycle (BMAD V6)
# Status: READY_FOR_VALIDATION
# ═══════════════════════════════════════════════════════════════════════════

epic_id: "EPIC-MOBILE"
story_id: "MOBILE-INT-02"
title: "Integrate KnowledgeMobileLayout with KnowledgePage"

priority: "P0-CRITICAL"
effort_hours: 2
status: "READY_FOR_VALIDATION"

user_story: |
  As a mobile user of the Knowledge workspace
  I want to use the tab-based mobile navigation (Browse, Search, AI)
  So that I can easily browse sources and use AI features on my phone

description: |
  Replace the inline mobile view in KnowledgePage.tsx with the standalone KnowledgeMobileLayout component.
  The integration must:
  - Wire source grid as children content
  - Preserve RAG, synthesis, and canvas integration
  - Maintain same functionality for source imports
  - Support all current AI features

dependencies:
  - "MOBILE-02"

files:
  - "src/presentation/components/knowledge/KnowledgePage.tsx"
  - "src/presentation/components/knowledge/KnowledgeMobileLayout.tsx"
  - "src/presentation/components/knowledge/index.ts"

acceptance_criteria:
  - "Mobile view uses KnowledgeMobileLayout wrapper"
  - "Source grid renders as children content"
  - "Bottom navigation works (Browse, Search, AI tabs)"
  - "Content tabs work (Browse, Collections, Recent)"
  - "Add source (+) button is functional"
  - "RAG indexing progress displays"
  - "Canvas preview is visible"
  - "Synthesis dialogs still work"
  - "No console errors on mobile viewport"

tasks:
  - task_id: "MOBILE-INT-02-01"
    description: "Import KnowledgeMobileLayout in KnowledgePage.tsx"
    status: "pending"
    
  - task_id: "MOBILE-INT-02-02"
    description: "Replace inline mobile view with KnowledgeMobileLayout wrapper"
    status: "pending"
    
  - task_id: "MOBILE-INT-02-03"
    description: "Wire source grid as children content"
    status: "pending"
    
  - task_id: "MOBILE-INT-02-04"
    description: "Preserve RAG and synthesis functionality"
    status: "pending"
    
  - task_id: "MOBILE-INT-02-05"
    description: "Test mobile navigation and gestures"
    status: "pending"

validation:
  typecheck: "pnpm typecheck --filter src/presentation/components/knowledge/"
  build: "pnpm build"
  manual_test: |
    1. Open browser DevTools → Toggle device toolbar → iPhone 14 Pro (390x844)
    2. Navigate to /knowledge/{projectId}
    3. Verify bottom navigation (Browse, Search, AI) appears
    4. Tap AI tab → verify AI chat opens
    5. Tap + button → verify source import dialog opens
    6. Test content tabs (Browse, Collections, Recent)
    7. Verify source cards display correctly
    8. Test synthesis dialogs

notes: |
  This story is CRITICAL because mobile users currently have broken UX.
  Knowledge workspace needs proper mobile navigation.
