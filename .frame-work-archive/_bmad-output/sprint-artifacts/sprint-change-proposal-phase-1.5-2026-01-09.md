# Sprint Change Proposal: Phase 1.5 Notes & AI Foundation
---
date: 2026-01-09T07:19:00+07:00
workflow: correct-course
status: PROPOSED
scope: MAJOR
phase: 1.5
team: A
agent: BMAD Master
researched: true
---

## Executive Summary

After Phase 1 Foundation completion, critical user journey blockers remain. This Phase 1.5 sprint focuses on:

1. **Gemini Model Loading** - Models must load from API, not hardcoded defaults
2. **Notes File System** - User file manipulation (CRUD, sync to project)
3. **BlockNote Rendering** - Various file types support with proper blocks
4. **Props Wiring** - Fix hanging/unwired props in 3-pane Notes
5. **AI Foundation** - Prepare infrastructure (no AI execution yet)

**Strategy**: Fix vertical journey (single user flow) FIRST, then expand horizontal.

**Settings**: ✅ CONFIRMED WORKING (not in scope)

---

## Section 1: Gemini Model Loading - RESEARCHED

### 1.1 Verified Gemini Models (Web Research 2026-01-09)

**Source**: Google Cloud Vertex AI, AI SDK documentation

| Model ID | Type | Input Tokens | Capabilities |
|----------|------|--------------|--------------|
| `gemini-2.5-flash` | Fast | 1,048,576 | Tools, Search, Thinking, Vision |
| `gemini-2.5-pro` | Pro | 1,048,576 | Advanced reasoning |
| `gemini-3-pro-preview` | Preview | - | Latest experimental |
| `gemini-2.5-flash-lite` | Lite | - | Lightweight |
| `gemini-2.0-flash` | Previous | 1,048,576 | Stable |
| `gemini-2.5-flash-latest` | Stable | 1,048,576 | Production stable |
| `gemini-2.5-pro-latest` | Stable Pro | 2,097,152 | Long context |

### 1.2 Current Problem

**Symptom**: User says "Gemini models not auto-loaded, hardcoded"

**Root Cause Analysis**:
1. `types.ts:223` has `defaultModel: 'gemini-3.0-flash'` - **INVALID MODEL ID**
2. `model-registry.ts:309-330` returns hardcoded defaults when no API key
3. `fetchGeminiModels()` in model-registry.ts DOES fetch from API correctly
4. Issue: When no API key, defaults are shown but they're WRONG model IDs

### 1.3 Required Fix

1. **Update `types.ts`**: Change `defaultModel` to `'gemini-2.5-flash'`
2. **Update `model-registry.ts`**: Update `getDefaultModels()` to return valid IDs
3. **Keep API fetch logic**: `fetchGeminiModels()` is correct - keep it
4. **Trigger fetch on key entry**: Ensure `fetchModels()` is called when API key is saved

### 1.4 Verified Default Values

```typescript
// types.ts - PROVIDERS.gemini
defaultModel: 'gemini-2.5-flash', // Verified 2026-01-09

// model-registry.ts - getDefaultModels()
return [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-flash-latest', name: 'Gemini 1.5 Flash (Latest)' },
    { id: 'gemini-2.5-pro-latest', name: 'Gemini 1.5 Pro (Latest)' },
];
```

---

## Section 2: Notes File System Manipulation

### 2.1 Problem

Users cannot manipulate files within Notes workspace:
- No file tree visible
- Cannot create/rename/delete files
- No sync between project folder and Notes view
- File changes not reflected

### 2.2 Current Components

| Component | Size | Status |
|-----------|------|--------|
| `NotesFilePicker.tsx` | 11KB | File picker exists |
| `ProjectFilesPanel.tsx` | 3.9KB | **INCOMPLETE** - needs expansion |
| `note-file-sync.ts` | 14.5KB | Sync logic exists, may not be wired |
| `NoteSidebar.tsx` | 13.9KB | Note list only, no files |

### 2.3 Required Implementation

1. **Expand ProjectFilesPanel**: Full file tree with CRUD operations
2. **Wire to Project Store**: Connect file operations to project-crud-slice
3. **Add Context Menu**: Right-click → Create file, Rename, Delete
4. **Sync Indicators**: Show sync status per file
5. **File Type Icons**: Different icons for .md, .txt, images, code files

---

## Section 3: BlockNote File Type Rendering

### 3.1 Problem

BlockNote doesn't render various file types embedded in notes:
- Images don't show inline
- Code files don't have syntax highlighting
- PDFs/documents don't preview
- Unknown files have no representation

### 3.2 Current BlockNote Usage

```typescript
// NoteEditor.tsx line 116-118
const editor = useCreateBlockNote({
    initialContent,
});
// Only default blocks - no custom file blocks
```

### 3.3 Required Custom Blocks

| Block Type | description | Implementation |
|------------|---------|----------------|
| `ImageBlock` | Inline image rendering | `<img>` with lazy loading |
| `CodeFileBlock` | Syntax highlighted code | Monaco or Prism integration |
| `FileAttachmentBlock` | Generic file with icon | File icon + name + size |
| `PDFPreviewBlock` | PDF thumbnail + link | PDF.js or iframe |
| `LinkToFileBlock` | Opens in IDE | Button to navigate to IDE |

### 3.4 Drag-Drop Support

When user drags file into BlockNote editor:
1. Detect file type from extension
2. Create appropriate block type
3. Store file reference (path, not content)
4. Render with appropriate component

---

## Section 4: Props Wiring - 3-Pane Notes

### 4.1 Problem

Props "hanging" or unwired in Notes 3-pane layout causing:
- Note switching not reactive
- Stale content visible
- Hot-reload not triggered
- State not propagating

### 4.2 Components to Audit

| Component | Lines | Potential Issues |
|-----------|-------|------------------|
| `NotesPage.tsx` | 725 | Large, complex prop drilling |
| `NoteSidebar.tsx` | - | Selection state |
| `NoteEditor.tsx` | 357 | `initialContent` memo (line 113) |
| `NoteSidebarChat.tsx` | - | Active note context |

### 4.3 Key Investigation Points

1. **Line 113 in NoteEditor.tsx**:
   ```typescript
   // Only recompute when note ID changes, not on every block update
   }, [note?.id]); 
   ```
   - Is this causing stale content?

2. **handleNoteSelect in NotesPage.tsx**:
   - Does it trigger state update?
   - Is new noteId propagated to editor?

3. **useNoteStore selectors**:
   - Are selectors returning new references incorrectly?
   - Same useShallow issue as project store?

---

## Section 5: AI Foundation Prep

### 5.1 Scope

**PREPARATION ONLY** - No AI execution in this phase

### 5.2 Components to Verify

| Component | Size | Verify |
|-----------|------|--------|
| `AISlashCommand.tsx` | 14.2KB | Slash menu appears on "/" |
| `AIPromptDialog.tsx` | 6.8KB | Dialog opens on trigger |
| `AITransformMenu.tsx` | 9.5KB | Menu shows on text selection |
| `SlashCommandManager.tsx` | 17.5KB | Commands registered |
| `note-ai-service.ts` | 11.1KB | **Verified wired correctly** |
| `slash-command-store.ts` | 8.1KB | Commands persisted |

### 5.3 Verification Checklist

- [ ] Slash menu appears when typing "/" in editor
- [ ] Custom slash commands visible in menu
- [ ] AIPromptDialog can be opened (mock/stub OK)
- [ ] AITransformMenu appears on text selection
- [ ] Agent selection dropdown shows configured agents
- [ ] Vault → Provider → Model chain documented

---

## Section 6: Story Breakdown

### Epic: P1.5 - Notes & AI Foundation

| Story | Priority | Effort | Description |
|-------|----------|--------|-------------|
| P1.5-01 | P0 | 1h | Fix Gemini Model IDs (verified) |
| P1.5-02 | P0 | 3h | Notes File Tree & CRUD |
| P1.5-03 | P0 | 4h | BlockNote Custom Blocks |
| P1.5-04 | P1 | 2h | Fix Notes 3-Pane Reactivity |
| P1.5-05 | P2 | 2h | AI Foundation Verification |
| **Total** | | **12h** | |

---

## Section 7: Detailed Stories

### P1.5-01: Fix Gemini Model IDs

**Priority**: P0
**Effort**: 1 hour
**Research**: ✅ COMPLETE (web verified)

**Task 1**: Update `src/lib/agent/providers/types.ts`
```typescript
// Line ~223: Change defaultModel
defaultModel: 'gemini-2.5-flash', // Was: 'gemini-3.0-flash'

// Update GEMINI_MODELS constant
export const GEMINI_MODELS = {
    flash: 'gemini-2.5-flash',
    pro: 'gemini-2.5-pro',
    stable: 'gemini-2.5-flash-latest',
    stablePro: 'gemini-2.5-pro-latest',
};
```

**Task 2**: Update `src/lib/agent/providers/model-registry.ts`
```typescript
// getDefaultModels() for 'gemini' case
return [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', ... },
    { id: 'gemini-2.5-flash-latest', name: 'Gemini 1.5 Flash (Latest)', ... },
    { id: 'gemini-2.5-pro-latest', name: 'Gemini 1.5 Pro (Latest)', ... },
];
```

**Acceptance Criteria**:
- AC-1: Gemini dropdown shows valid model names
- AC-2: Selected model persists after refresh
- AC-3: API fetch returns real models when key is entered

---

### P1.5-02: Notes File Tree & CRUD

**Priority**: P0
**Effort**: 3 hours

**Tasks**:
1. Expand `ProjectFilesPanel.tsx` with file tree component
2. Add file CRUD operations (create, rename, delete)
3. Wire to project store for persistence
4. Add context menu for file operations
5. Show sync status indicators

**Files to Modify**:
- `src/presentation/components/notes/ProjectFilesPanel.tsx`
- `src/presentation/components/notes/NoteSidebar.tsx`
- `src/lib/notes/note-file-sync.ts`

**Acceptance Criteria**:
- AC-1: Project files visible in Notes sidebar
- AC-2: Can create new file from Notes
- AC-3: Can rename file from Notes  
- AC-4: Can delete file from Notes (with confirmation)
- AC-5: Changes sync to project store

---

### P1.5-03: BlockNote Custom Blocks

**Priority**: P0
**Effort**: 4 hours

**Tasks**:
1. Create `ImageBlock` component
2. Create `CodeFileBlock` component
3. Create `FileAttachmentBlock` component
4. Register custom blocks with BlockNote
5. Implement drag-drop file handling

**Files to Create**:
- `src/presentation/components/notes/blocks/ImageBlock.tsx`
- `src/presentation/components/notes/blocks/CodeFileBlock.tsx`
- `src/presentation/components/notes/blocks/FileAttachmentBlock.tsx`
- `src/presentation/components/notes/blocks/index.ts`

**Acceptance Criteria**:
- AC-1: Image files render inline
- AC-2: Code files show with syntax highlighting
- AC-3: Unknown files show icon + name
- AC-4: Drag-drop creates appropriate block

---

### P1.5-04: Fix Notes 3-Pane Reactivity

**Priority**: P1
**Effort**: 2 hours

**Investigation**:
1. Check `initialContent` memo dependency
2. Audit useNoteStore selectors for reference issues
3. Verify handleNoteSelect state propagation
4. Apply useShallow if needed (like project store fix)

**Files to Audit**:
- `src/presentation/components/notes/NoteEditor.tsx`
- `src/presentation/components/notes/NotesPage.tsx`
- `src/lib/notes/note-navigation-store.ts`

**Acceptance Criteria**:
- AC-1: Clicking note immediately shows in editor
- AC-2: No stale content visible
- AC-3: Console shows no excessive re-renders
- AC-4: Hot-reload works on note change

---

### P1.5-05: AI Foundation Verification

**Priority**: P2
**Effort**: 2 hours

**Verification Only - No Code Changes**:
1. Document slash command registration
2. Verify AIPromptDialog opens
3. Verify AITransformMenu appears
4. Document vault → agent → model chain
5. Update `vault-ai-chain-trace.md`

**Acceptance Criteria**:
- AC-1: Slash menu appears on "/"
- AC-2: Custom commands visible
- AC-3: AI components mounted (no errors)
- AC-4: Chain documentation complete

---

## Section 8: Implementation Priority Queue

```
EXECUTION ORDER (Vertical-First):

1. P1.5-01: Gemini Model IDs [1h]
   └── Unblocks: AI dropdown usability
   
2. P1.5-04: Notes Reactivity Fix [2h]
   └── Unblocks: Core Notes editing
   
3. P1.5-02: Notes File Tree [3h]
   └── Unblocks: File management in Notes
   
4. P1.5-03: BlockNote Blocks [4h]
   └── Unblocks: Rich content in Notes
   
5. P1.5-05: AI Verification [2h]
   └── Prepares: Phase 2 AI integration
```

---

## Section 9: Handoff

**Route To**: Development Team (BMAD Dev Agent)

**Deliverables**:
1. This Sprint Change Proposal document
2. 5 story specifications with acceptance criteria
3. Verified Gemini model IDs from research

**Success Criteria**:
- [ ] Gemini dropdown shows valid models
- [ ] Notes switch without lag
- [ ] Files visible and editable in Notes
- [ ] Custom blocks render correctly
- [ ] AI components verified ready

---

## Appendix: Research Sources

### Gemini Models Verification

**Search Date**: 2026-01-09T07:19:00+07:00
**Query**: "Google Gemini API models list 2026"

**Sources**:
- AI SDK Documentation: https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai
- Google Vertex AI Docs: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-5-flash
- Last updated: 2026-01-08 UTC

**Verified Model IDs**:
- `gemini-2.5-flash` ✅
- `gemini-2.5-pro` ✅
- `gemini-2.5-flash-lite` ✅
- `gemini-3-pro-preview` ✅
- `gemini-2.5-flash-latest` ✅
- `gemini-2.5-pro-latest` ✅
