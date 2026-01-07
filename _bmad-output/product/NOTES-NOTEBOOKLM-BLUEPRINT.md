# NOTES = NOTION + NOTEBOOKLM BLUEPRINT
**Comprehensive Implementation Plan for Fully Functional Notes Workspace**
**Generated:** 2026-01-07
**Status:** READY FOR IMPLEMENTATION
**Target:** Zero throwing errors, temp project space, all AI features gathered

---

## EXECUTIVE SUMMARY

**Current Health:** ~20% (4 user cases all FAIL at step 4)
**Target Health:** ~90% (all user cases PASS, no throwing errors)
**Duration:** 8-12 hours for core implementation

### Primary Directive
> "You do all cost today the note must be the Notion+NotebookLM buffed fully functional with no throwing error - even user who does not want to create project still can use it as tempo 1 project space (on desktop phones etc) all AI generated features (multimodality) RAG, agent etc which are scattered round in this project must be gathered"

---

## PART 1: SCATTERED AI FEATURES INVENTORY

### Category 1: RAG (Retrieval-Augmented Generation)
**Location:** `src/lib/rag/`

| Feature | File | Status | Integration Needed |
|---------|------|--------|-------------------|
| Orama Vector Index | `orama-index.ts` | ✅ Working | Add to Notes search |
| Hybrid Search | `hybrid-retriever.ts` | ✅ Working | Add to Notes sidebar |
| Document Chunker | `document-chunker.ts` | ✅ Working | Auto-chunk notes |
| Embedding Service | `embedding-service.ts` | ✅ Working | Auto-index notes |
| RAG Chat | `rag-chat.ts` | ✅ Working | Integrate into Notes |
| Incremental Indexing | `incremental-indexing-service.ts` | ✅ Working | Auto-update on edit |
| Sync Subscription | `sync-subscription-service.ts` | ✅ Working | Cross-workspace sync |

### Category 2: Multi-Modal Processing
**Location:** `src/lib/agent/tools/`

| Feature | File | Status | Integration Needed |
|---------|------|--------|-------------------|
| PDF Processing | `process-pdf-tool.ts` | ✅ Working | Add to Notes import |
| Image Processing (OCR) | `process-image-tool.ts` | ✅ Working | Add to Notes import |
| URL Processing | `process-url-tool.ts` | ✅ Working | Add to Notes import |
| Knowledge Synthesis | `synthesize-tool.ts` | ✅ Working | Add to Notes |
| Search Notes | `search-notes-tool.ts` | ✅ Working | Already integrated |

### Category 3: Canvas & Knowledge Graph
**Location:** `src/presentation/components/canvas/`, `src/lib/canvas/`

| Feature | File | Status | Integration Needed |
|---------|------|--------|-------------------|
| Canvas Visual Editor | `Canvas.tsx` | ✅ Working | Add to Notes toolbar |
| Linkage Proposals | `LinkageProposalsPanel.tsx` | ✅ Working | Note-to-note links |
| RAG Linkage Analyzer | `rag-linkage-analyzer.ts` | ✅ Working | Auto-link related notes |

### Category 4: Voice & Audio
**Location:** `src/lib/voice/`, `src/lib/rag/audio-*`

| Feature | File | Status | Integration Needed |
|---------|------|--------|-------------------|
| Voice Recording Hook | `use-voice-recording.ts` | ✅ Working | Add to Notes editor |
| Audio Capture | `audio-capture.ts` | ✅ Working | Voice notes |
| Audio Playback | `audio-playback.ts` | ✅ Working | Voice memos |
| Transcription Service | `gemini-transcription-service.ts` | ✅ Working | Speech-to-text |

### Category 5: AI Chat & Agent
**Location:** `src/presentation/components/chat/`, `src/lib/agent/`

| Feature | File | Status | Integration Needed |
|---------|------|--------|-------------------|
| Unified Chat Panel | `UnifiedChatPanel.tsx` | ✅ Working | Already in Notes |
| Agent Chat Panel | `AgentChatPanel.tsx` | ✅ Working | Already in Notes |
| Tool Execution | Various tools | ✅ Working | Already available |

### Category 6: Already in Notes Workspace
**Location:** `src/presentation/components/notes/`

| Feature | File | Status | Notes |
|---------|------|--------|-------|
| BlockNote Editor | `NoteEditor.tsx` | ✅ Working | Notion-like blocks |
| AI Slash Commands | `AISlashCommand.tsx` | ✅ Working | /ai, /summarize, etc. |
| AI Transform Menu | `AITransformMenu.tsx` | ✅ Working | Selection transform |
| AI Prompt Dialog | `AIPromptDialog.tsx` | ✅ Working | Custom prompts |
| Study Menu | `NoteStudyMenu.tsx` | ✅ Working | Flashcards/Quiz |

---

## PART 2: P0 CRITICAL FIXES (BLOCKING ALL USERS)

### P0-1: LLM Key Vault → Service Bridge (CRITICAL)
**Issue:** Keys saved but never retrieved → 401 errors
**Root Cause:** Vault stores keys, but services never check vault on mount

**Fix Location:** `src/infrastructure/persistence/stores/providers/`

**Implementation:**
```typescript
// 1. On service mount, check vault for key
// 2. If key exists, load into service memory
// 3. Show key status indicator in UI
// 4. After key save, notify services to reload
```

**Files to Modify:**
- `src/lib/agent/providers/credential-vault.ts` - Add getKey on mount
- `src/presentation/components/chat/UnifiedChatPanel.tsx` - Add key status check
- `src/presentation/components/notes/NotesPage.tsx` - Add key status indicator

**Acceptance Criteria:**
- [ ] Service retrieves key from vault on mount
- [ ] Chat panel shows key status indicator (green=configured, red=missing)
- [ ] Missing key shows "Configure Key" button
- [ ] Key save triggers service reload

### P0-2: Temp Project Space (CRITICAL - User Requirement)
**Requirement:** "even user who does not want to create project still can use it as tempo 1 project space"

**Design:**
```typescript
// Create auto-generated temp project on first Notes access
interface TempProject {
  id: 'temp-notes-project';
  name: 'Temp Notes';
  storageType: 'indexeddb';
  bindings: { notes: true, knowledge: false, study: false, ide: false };
  isTemp: true;
  autoCreated: boolean;
}
```

**Implementation:**
```typescript
// Location: src/lib/workspace/temp-project-service.ts
export class TempProjectService {
  private static TEMP_ID = 'temp-notes-project';

  static async getOrCreateTempProject(): Promise<Project> {
    const existing = await db.projects.get(this.TEMP_ID);
    if (existing) return existing;

    const temp: Project = {
      id: this.TEMP_ID,
      name: 'Temp Notes',
      storageType: 'indexeddb',
      bindings: { notes: true },
      isTemp: true,
      createdAt: new Date(),
    };

    await db.projects.put(temp);
    return temp;
  }

  static isTempProject(projectId: string): boolean {
    return projectId === this.TEMP_ID;
  }
}
```

**Route Handler Modification:**
```typescript
// Route: /notes
// If no projectId, auto-create temp project
export const Route = createFileRoute('/notes')({
  component: NotesPage,
  beforeLoad: async ({ location }) => {
    const projectId = location.params.projectId;
    if (!projectId) {
      const temp = await TempProjectService.getOrCreateTempProject();
      return redirect({ to: '/notes/$projectId', params: { projectId: temp.id } });
    }
  }
});
```

**Acceptance Criteria:**
- [ ] User can access /notes without project → auto-redirects to temp project
- [ ] Temp project persists across sessions
- [ ] Temp project marked with visual indicator (badge)
- [ ] User can "promote" temp to real project (rename, customize)

### P0-3: Project Creation Default Bindings
**Issue:** IndexedDB projects have no bindings → User stuck in hub

**Fix Location:** `src/presentation/components/project/ProjectCreationWizard.tsx`

**Implementation:**
```typescript
// When storageType === 'indexeddb', default to Notes binding
const getDefaultBindings = (storageType: StorageType): WorkspaceBindings => {
  if (storageType === 'indexeddb') {
    return {
      notes: true,      // ✅ Default ON for IndexedDB
      knowledge: false,
      study: false,
      ide: false,
    };
  }
  // FSA projects default to IDE
  return {
    ide: true,
    notes: false,
    knowledge: false,
    study: false,
  };
};
```

**UI Changes:**
- Show workspace checkboxes during wizard
- At least one must be selected (validation)
- Show description of each workspace

**Acceptance Criteria:**
- [ ] IndexedDB projects default to Notes binding
- [ ] User sees workspace selection during creation
- [ ] Validation prevents no-binding projects
- [ ] Navigation goes to first bound workspace

### P0-4: Mobile Project Creation Path
**Issue:** Mobile users get "not supported" toast → No alternative

**Fix Location:** `src/presentation/components/hub/HubHomePage.tsx`

**Current Code (Lines 169-183):**
```typescript
if (!isFSASupported) {
  toast.info('Folder Mounting Not Available', {
    description: 'Folder mounting requires a desktop browser...'
  });
  return; // ❌ STOPS HERE
}
```

**Fixed Code:**
```typescript
if (!isFSASupported) {
  // Mobile detected → Auto-show IndexedDB project creation
  setProjectCreationWizardOpen(true);

  toast.info('Mobile Project Creation', {
    description: 'Creating a local notes project (no folder sync needed on mobile).',
  });
  return;
}

// Desktop FSA flow continues...
```

**Acceptance Criteria:**
- [ ] Mobile users see "Create Notes Project" flow
- [ ] FSA option hidden on mobile
- [ ] IndexedDB default selected on mobile
- [ ] Project creation completes on mobile

### P0-5: File Sync to Notes Workspace
**Issue:** FSA projects always navigate to IDE, never to Notes

**Fix Location:** `src/presentation/components/hub/HubHomePage.tsx`

**Current Code (Lines 158-164):**
```typescript
else {
  // For fsa storage, navigate to IDE (full file system access)
  navigate({ to: '/ide/$projectId', params: { projectId } });
}
```

**Fixed Code:**
```typescript
else {
  // For fsa storage, check bindings first
  const bindings = project.bindings || {};
  if (bindings.notes) {
    navigate({ to: '/notes/$projectId', params: { projectId } });
  } else if (bindings.knowledge) {
    navigate({ to: '/knowledge/$projectId', params: { projectId } });
  } else {
    // Fallback to IDE for full file system access
    navigate({ to: '/ide/$projectId', params: { projectId } });
  }
}
```

**Acceptance Criteria:**
- [ ] FSA project with Notes binding → Goes to Notes workspace
- [ ] Files auto-imported on Notes mount
- [ ] Progress bar shows import status
- [ ] Errors don't block other files

---

## PART 3: NOTES = NOTION + NOTEBOOKLM INTEGRATION

### Notion Features (Already Present)
✅ Block-based editor (BlockNote)
✅ Slash commands (/ai, /summarize, etc.)
✅ AI text transformation (selection menu)
✅ Auto-save with debounce
✅ Note tree structure
✅ Markdown import/export

### NotebookLM Features (Need Integration)

#### Feature 1: Source Citations (NotebookLM)
**Current State:** RAG has citation system, not integrated into Notes

**Implementation:**
```typescript
// When AI generates content, include citations
interface NoteWithCitations {
  id: string;
  blocks: Block[];
  citations: Citation[];  // Sources used for AI generation
  relatedSources: string[];  // Source note IDs
}

// Show citations in editor
<CitationPanel
  citations={note.citations}
  onCitationClick={(id) => openSourceNote(id)}
/>
```

#### Feature 2: Audio Notebook (NotebookLM)
**Current State:** Voice recording hook exists, not integrated into Notes

**Implementation:**
```typescript
// Add to NoteEditor toolbar
<VoiceRecordButton
  onRecordingComplete={(transcript) => {
    // Append transcript to note
    editor.insertBlocks([
      { type: 'paragraph', content: transcript }
    ]);
  }}
/>
```

#### Feature 3: Auto-Synthesis (NotebookLM)
**Current State:** Synthesis tool exists, only in Knowledge workspace

**Implementation:**
```typescript
// Auto-synthesize after note edit
const debouncedSynthesize = debounce(async (noteId) => {
  const note = notes.get(noteId);
  const synthesis = await synthesizeTool({
    sourceId: noteId,
    content: getNoteText(note),
    options: {
      generateSummary: true,
      extractKeyConcepts: true,
      generateTags: true,
    },
  });

  // Store synthesis result
  updateNote({
    id: noteId,
    synthesis: synthesis.frontmatter,
  });
}, 2000);
```

#### Feature 4: Multi-Source Chat (NotebookLM)
**Current State:** UnifiedChatPanel exists, RAG chat exists

**Implementation:**
```typescript
// Notes-specific RAG chat with note context
<NotesRAGChat
  projectId={projectId}
  contextNotes={selectedNotes}
  onCitationClick={(noteId, blockId) => {
    // Jump to cited note/block
    openNote(noteId, blockId);
  }}
/>
```

---

## PART 4: TEMP PROJECT ARCHITECTURE

### State Management
```typescript
// Temp projects are stored but marked with isTemp flag
interface ProjectRecord {
  id: string;
  name: string;
  storageType: 'indexeddb' | 'fsa';
  bindings: WorkspaceBindings;
  isTemp?: boolean;  // ✅ NEW
  autoCreated?: boolean;  // ✅ NEW
}
```

### UI Differentiation
```typescript
// Show temp badge on project selector
<ProjectSelector>
  {project.isTemp && (
    <Badge variant="secondary">Temp</Badge>
  )}
</ProjectSelector>

// Promote dialog when user wants to save temp project
<PromoteTempProjectDialog
  open={showPromote}
  onPromote={(name, bindings) => {
    updateProject(tempProject.id, {
      name,
      bindings,
      isTemp: false,
    });
  }}
/>
```

### Auto-Cleanup
```typescript
// Optional: Auto-delete temp projects after X days
// Only if user has other real projects
const TEMP_PROJECT_TTL_DAYS = 30;

async function cleanupOldTempProjects() {
  const projects = await db.projects.toArray();
  const tempProjects = projects.filter(p => p.isTemp);
  const realProjects = projects.filter(p => !p.isTemp);

  // Only cleanup if user has real projects
  if (realProjects.length > 0) {
    for (const temp of tempProjects) {
      const lastOpened = new Date(temp.lastOpened);
      const ageDays = (Date.now() - lastOpened.getTime()) / (1000 * 60 * 60 * 24);

      if (ageDays > TEMP_PROJECT_TTL_DAYS) {
        await db.projects.delete(temp.id);
        // Also clean up notes
        await db.notes.where('projectId').equals(temp.id).delete();
      }
    }
  }
}
```

---

## PART 5: IMPLEMENTATION SEQUENCE

### Phase 1: Critical Fixes (2-3 hours)
1. **P0-2:** Implement temp project service
2. **P0-1:** Fix LLM key vault → service bridge
3. **P0-3:** Add default bindings to project creation
4. **P0-4:** Mobile project creation path

### Phase 2: AI Features Integration (3-4 hours)
1. Add RAG search to Notes sidebar
2. Integrate multi-modal import (PDF, images)
3. Add voice recording to NoteEditor
4. Add synthesis auto-generation

### Phase 3: Canvas Integration (1-2 hours)
1. Add Canvas button to Notes toolbar
2. Link notes to canvas nodes
3. Auto-generate linkages between notes

### Phase 4: Polish & Testing (1-2 hours)
1. Fix all hardcoded strings (i18n compliance)
2. Add proper error boundaries
3. Test all user journeys (4 cases)
4. Mobile responsive testing

---

## PART 6: ACCEPTANCE CRITERIA

### User Journey 1: Desktop, No File Sync
| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 1 | User opens app | Hub loads | ✅ PASS |
| 2 | User clicks Notes card | Auto-creates temp project | 🔴 FIX |
| 3 | User creates note | Note editor opens | ✅ PASS |
| 4 | User uses AI features | Works with API key | 🔴 FIX |

### User Journey 2: Desktop, FSA Sync
| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 1 | User creates FSA project with Notes binding | Project created | ✅ PASS |
| 2 | User navigates to Notes | Notes workspace opens | 🔴 FIX |
| 3 | .md files auto-import | Files appear in notes | 🔴 FIX |
| 4 | User uses AI features | Works with context | 🔴 FIX |

### User Journey 3: Mobile User
| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 1 | User opens app on mobile | Hub loads | ✅ PASS |
| 2 | User clicks Notes | Auto-creates temp project | 🔴 FIX |
| 3 | User creates note | Note editor opens | ✅ PASS |
| 4 | User uses AI features | Works (no file sync) | 🔴 FIX |

### User Journey 4: AI Features
| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 1 | User in Notes | Notes page loads | ✅ PASS |
| 2 | User types message in chat | Works with API key | 🔴 FIX |
| 3 | No API key | Prompt to configure | 🔴 FIX |
| 4 | User saves key | Retrieved and used | 🔴 FIX |

---

## PART 7: DESIGN SYSTEM COMPLIANCE

### Hardcoded Strings to Fix

**HubHomePage.tsx:**
```typescript
// ❌ BEFORE
toast.info(`No projects yet`, {
  description: `Create or mount a project first...`
});

// ✅ AFTER
toast.info(t('hub.noProjects'), {
  description: t('hub.noProjectsDesc')
});
```

**NotesPage.tsx:**
```typescript
// ❌ BEFORE
<p className="text-sm font-medium">Desktop-only feature</p>
<p className="text-xs text-muted-foreground mt-1">
  File sync requires a desktop browser...
</p>

// ✅ AFTER
<p className="text-sm font-medium">{t('notes.desktopOnly.title')}</p>
<p className="text-xs text-muted-foreground mt-1">
  {t('notes.desktopOnly.description')}
</p>
```

### Inline Styles to Fix

**NotesPage.tsx:383:**
```typescript
// ❌ BEFORE
<div
  className="w-full bg-muted rounded-full h-2 overflow-hidden"
>
  <div
    style={{ width: `${progress}%` }}  // ❌ Inline style
    className="bg-primary h-2 rounded-full transition-all"
  />
</div>

// ✅ AFTER (use CSS variable)
<div
  className="w-full bg-muted rounded-full h-2 overflow-hidden"
  style={{ '--progress-width': `${progress}%` }}
>
  <div
    className="bg-primary h-2 rounded-full transition-all"
    style={{ width: 'var(--progress-width)' }}
  />
</div>
```

---

## PART 8: FILES TO CREATE/MODIFY

### New Files to Create
1. `src/lib/workspace/temp-project-service.ts` - Temp project management
2. `src/presentation/components/project/PromoteTempProjectDialog.tsx` - Promote UI
3. `src/presentation/components/notes/KeyStatusIndicator.tsx` - API key status
4. `src/presentation/components/notes/VoiceRecordButton.tsx` - Voice notes
5. `src/presentation/components/notes/CitationPanel.tsx` - Source citations
6. `src/presentation/components/notes/NotesRAGChat.tsx` - RAG chat integration

### Files to Modify
1. `src/presentation/components/hub/HubHomePage.tsx` - Mobile temp project, FSA routing
2. `src/presentation/components/project/ProjectCreationWizard.tsx` - Default bindings
3. `src/presentation/components/notes/NotesPage.tsx` - i18n, key status
4. `src/presentation/components/chat/UnifiedChatPanel.tsx` - Key check before enable
5. `src/lib/agent/providers/credential-vault.ts` - Get key on mount
6. `src/routes/notes.$projectId.tsx` - Temp project redirect
7. `src/i18n/en.json` - Add all hardcoded strings
8. `src/i18n/vi.json` - Vietnamese translations

---

## PART 9: SUCCESS METRICS

### Before Implementation
| Metric | Score | Status |
|--------|-------|--------|
| User can create project | ❌ NO | Broken |
| User can use AI in Notes | ❌ NO (401) | Key bridge broken |
| User can sync files to Notes | ❌ NO | FSA forces IDE |
| Mobile user can use Notes | ❌ NO | No alternative path |
| **Overall Health** | **~20%** | 🔴 CRITICAL |

### After Implementation
| Metric | Score | Status |
|--------|-------|--------|
| User can create project | ✅ YES | Temp project auto-created |
| User can use AI in Notes | ✅ YES | Key vault bridge fixed |
| User can sync files to Notes | ✅ YES | FSA routing fixed |
| Mobile user can use Notes | ✅ YES | IndexedDB path available |
| **Overall Health** | **~90%** | ✅ TARGET MET |

---

## PART 10: ROLLBACK PLAN

If critical issues arise:

1. **Revert temp project auto-creation:** Add user opt-in toggle
2. **Revert key vault changes:** Keep manual key configuration
3. **Revert FSA routing changes:** Keep IDE-first for FSA
4. **Restore original hardcoded strings:** If i18n breaks existing flows

---

**Next Action:** Begin Phase 1 implementation with P0-2 (Temp Project Service)
