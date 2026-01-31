# ═══════════════════════════════════════════════════════════════════════════════
# EPIC-UX-01: BLOCK EDITOR & PANEL OVERHAUL
# Sprint Planning Artifact
# ═══════════════════════════════════════════════════════════════════════════════

**Epic ID**: EPIC-UX-01
**Created**: 2026-01-15
**Status**: DRAFT - Awaiting Sprint Planning Validation
**Team**: TBD (To be assigned)
**Priority**: P0 (Critical User Experience)

---

## 📊 EPIC OVERVIEW

### Summary

Comprehensive overhaul of the block editor and panel systems to fix critical UX issues and achieve hybrid parity with Notion and Obsidian. Focuses on making features actually work with usable UI/UX.

### Business Value

- **Fix broken AI features**: Users can't use AI generation on new notes
- **Mobile usability**: Chat completely broken on mobile
- **Competitive parity**: Missing basic features (toggle blocks, block references)
- **Panel control**: Users can't customize their workspace

### Success Criteria

- [ ] All 67 audit issues addressed
- [ ] Mobile chat accessible and usable
- [ ] Multi-block selection working
- [ ] Panel flex control implemented
- [ ] Block references (`^blockId`) working
- [ ] Z-index wars resolved

---

## 🎯 STORIES BREAKDOWN

### Phase 1: Foundation (P0 - Critical)

**UX-01: Unified Z-Index Scale**
- Description: Define and implement token-based z-index system
- Effort: 2h
- Files: `src/presentation/components/ui/resizable.tsx`, all layout files
- Acceptance:
  - Single source of truth for z-index values
  - No arbitrary z-index values in code
  - All overlays use token scale

**UX-02: OverlayRoot for All Modals**
- Description: Create portal root for all modals/popups
- Effort: 4h
- Files: New `src/presentation/components/ui/OverlayRoot.tsx`
- Acceptance:
  - All modals render through OverlayRoot
  - No clipping issues
  - Z-index conflicts eliminated

**UX-03: Multi-Block Selection**
- Description: Enable selection of multiple blocks in editor
- Effort: 1d
- Files: `src/presentation/components/notes/NoteEditor.tsx`
- Acceptance:
  - Shift+click to select multiple blocks
  - Selection persists across focus changes
  - Batch operations enabled

**UX-04: Block Drag-and-Drop**
- Description: Add drag handles to blocks for reordering
- Effort: 1d
- Files: `src/presentation/components/notes/NoteEditor.tsx`, blocks
- Acceptance:
  - Drag handle appears on hover
  - Blocks can be reordered
  - Works on touch devices

**UX-05: Panel Flex Control**
- Description: Allow users to resize panels
- Effort: 4h
- Files: `src/presentation/components/layout/IDELayout/IDEResizableLayout.tsx`
- Acceptance:
  - Users can drag to resize panels
  - Widths persisted across sessions
  - Min/max width constraints enforced

**UX-06: Mobile Chat Accessibility**
- Description: Fix sync status covering chat on mobile
- Effort: 4h
- Files: `src/presentation/components/ide/SyncStatusPanel.tsx`, `MobileIDELayout.tsx`
- Acceptance:
  - Chat accessible on mobile
  - Sync status doesn't block UI
  - Chat tab prominent in navigation

### Phase 2: Block Editor (P0-P1)

**UX-07: In-Block AI Generation UI**
- Description: Create container-aware popup for AI generation options
- Effort: 1d
- Files: `src/presentation/components/notes/AISlashCommand.tsx`, new component
- Acceptance:
  - Popup appears for empty blocks
  - Context scope selection (above/below/all)
  - Doesn't cover/distort surrounding UI

**UX-08: Context Scope Selection**
- Description: Allow choosing generation context scope
- Effort: 4h
- Files: `src/presentation/components/notes/AIInsertionDialog.tsx`
- Acceptance:
  - User can choose: above cursor, below cursor, all content, selection only
  - Visual preview of selected context
  - Token count warning for large contexts

**UX-09: Toggle and Callout Blocks**
- Description: Add toggle and callout block types
- Effort: 1d
- Files: `src/presentation/components/notes/blocks/`
- Acceptance:
  - Toggle block: collapsible sections
  - Callout block: highlighted boxes with icons
  - Keyboard shortcuts for creation

**UX-10: Block References (`^blockId`)**
- Description: Implement Obsidian-style block references
- Effort: 2d
- Files: Editor core, block rendering
- Acceptance:
  - `^blockId` syntax for linking
  - Auto-generated IDs for blocks
  - Backlinks panel for references
  - Transclusion support

**UX-11: Column Layouts**
- Description: Add multi-column container blocks
- Effort: 1d
- Files: `src/presentation/components/notes/blocks/`
- Acceptance:
  - Drag beside block to create column
  - Width ratio control
  - Responsive collapse on mobile

**UX-12: Synced Blocks**
- Description: Implement content mirroring across notes
- Effort: 2d
- Files: New block type, sync service
- Acceptance:
  - Create synced block from any block
  - Changes propagate to all instances
  - "Unsync all" option available

### Phase 3: AI Features (P1)

**UX-13: Unified Command System**
- Description: Consolidate all AI commands into single system
- Effort: 1d
- Files: `AISlashCommand.tsx`, `AITransformMenu.tsx`, `AIPromptDialog.tsx`
- Acceptance:
  - User can define custom commands
  - Commands available in "+" menu and selection bar
  - Command history and favorites

**UX-14: Streaming Animations**
- Description: Visual feedback during AI generation
- Effort: 4h
- Files: `src/lib/notes/use-streaming-ai.ts`, AI components
- Acceptance:
  - Typing indicator during generation
  - Progressive content rendering
  - Token count display

**UX-15: Replacement Modal with Preview**
- Description: Show preview before accepting AI changes
- Effort: 4h
- Files: `src/presentation/components/notes/AITransformMenu.tsx`
- Acceptance:
  - Preview modal shows before/after
  - Options: replace, append, create new
  - Diff view for changes

**UX-16: AI Follow-up Suggestions**
- Description: Suggest next actions based on context
- Effort: 1d
- Files: AI service components
- Acceptance:
  - Context-aware suggestions
  - One-click to apply suggestion
  - Learning from user patterns

### Phase 4: Panel Overhaul (P1)

**UX-17: Bubble Chat Option**
- Description: Add Notion-style bubble chat interface
- Effort: 1d
- Files: `src/presentation/components/ide/EnhancedChatInterface.tsx`
- Acceptance:
  - Toggle between stacked and bubble view
  - Long content handled gracefully
  - Works on all screen sizes

**UX-18: Focus Mode**
- Description: Collapse all panels for full-width editor
- Effort: 4h
- Files: `src/presentation/components/layout/IDELayoutMain.tsx`
- Acceptance:
  - Keyboard shortcut to toggle focus mode
  - Visual indicator when in focus mode
  - State persisted

**UX-19: Panel Width Persistence**
- Description: Save and restore panel widths
- Effort: 2h
- Files: `src/infrastructure/persistence/stores/ide/ide-layout-slice.ts`
- Acceptance:
  - Widths saved on change
  - Restored on app load
  - Reset to default option

**UX-20: Left Panel Reorganization**
- Description: Simplify and organize left sidebar
- Effort: 1d
- Files: `src/presentation/components/layout/MainSidebar.tsx`
- Acceptance:
  - Clear visual hierarchy
  - Collapsible sections
  - Search functionality

### Phase 5: Canvas & Advanced (P2)

**UX-21: JSON Canvas Support**
- Description: Implement Obsidian-compatible canvas
- Effort: 3d
- Files: New canvas system
- Acceptance:
  - Create/open `.canvas` files
  - Text/file/link cards
  - Export to image

**UX-22: Database Blocks**
- Description: Add Notion-style database views
- Effort: 3d
- Files: New database system
- Acceptance:
  - Table/board/gallery views
  - Properties and filtering
  - Inline database creation

**UX-23: Graph View**
- Description: Visualize note connections
- Effort: 2d
- Files: New graph component
- Acceptance:
  - Force-directed layout
  - Filter by tags/folders
  - Interactive navigation

---

## 📊 ESTIMATED EFFORT

| Phase | Stories | Effort | Duration |
|-------|---------|--------|----------|
| Phase 1: Foundation | 6 | ~2 days | 2-3 days |
| Phase 2: Block Editor | 6 | ~8 days | 1.5-2 weeks |
| Phase 3: AI Features | 4 | ~4 days | 1 week |
| Phase 4: Panel Overhaul | 4 | ~4 days | 1 week |
| Phase 5: Canvas & Advanced | 3 | ~8 days | 2 weeks |
| **TOTAL** | **23** | **~26 days** | **4-6 weeks** |

---

## 🔗 DEPENDENCIES

### External Dependencies
- TanStack AI SDK (already in use)
- BlockNote editor (already in use)
- JSON Canvas spec (open standard)

### Internal Dependencies
- `EPIC-CC-01` (Project Space Foundation) - Should be mostly complete
- `EPIC-CC-03` (Chat Flow Stabilization) - Some overlap in chat features

### Risks
- BlockNote extensibility limitations
- Performance impact of multi-block selection
- Mobile canvas implementation complexity

---

## 📝 TRACEABILITY

Every story in this epic must:
1. Reference the audit issue it addresses
2. Have clear acceptance criteria
3. List all files modified
4. Link to git commits
5. Update governance documents

---

## 🚨 GOVERNANCE STATUS

- ⏳ Awaiting sprint-planning-wrapper validation
- ⏳ Awaiting cohesion check
- ⏳ Awaiting dependency mapping
- ⏳ Awaiting reality validation

---

**End of Sprint Planning**

**Document ID**: EPIC-UX-01-PLAN-2026-01-15
**Status**: DRAFT - Awaiting Validation
**Next**: Run sprint-planning-wrapper for governance checks
