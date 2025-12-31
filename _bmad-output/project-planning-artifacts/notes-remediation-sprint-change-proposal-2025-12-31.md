# Sprint Change Proposal: Notes Workspace Remediation

---
## Document Control

| Field | Value |
|-------|-------|
| **Document ID** | SCP-NOTES-2025-12-31 |
| **Version** | 1.0 |
| **Status** | AWAITING APPROVAL |
| **Created** | 2025-12-31T22:31:00+07:00 |
| **Author** | BMAD Master (Team A) |
| **Scope** | MAJOR |
| **Priority** | P0 - Critical Showcase Blocker |

---

## 1. Executive Summary

### 1.1 Issue Statement

The **Notes Workspace** contains **6 critical defects** that render core functionality non-operational. The AI-powered features that are visible in the UI are completely **disconnected from the actual AI agent system**, producing fake placeholder content. Users experience the following failures:

1. **AI Magic** features return hardcoded mock responses
2. **Agent Selector** has no effect on AI operations
3. **Hot-reload reactivity** fails when switching between notes
4. **No file system synchronization** with the project ecosystem
5. **Header AI features** are non-functional decorative elements
6. **Text transformation** via selection/drag is not implemented

### 1.2 Business Impact

| Impact Area | Severity | Description |
|-------------|----------|-------------|
| User Experience | CRITICAL | Core promised features don't work |
| Demo Readiness | CRITICAL | Cannot showcase AI note-taking capabilities |
| Data Portability | HIGH | Notes trapped in IndexedDB silo |
| Workspace Integration | HIGH | Notes not accessible from other workspaces |
| Trust/Credibility | CRITICAL | Fake AI responses erode user trust |

### 1.3 Recommended Action

Execute a **3-Phase remediation sprint** with automated workflow coordination, targeting **100% coverage** of identified defects. Estimated total effort: **29 hours** across 8 stories.

---

## 2. Technical Analysis

### 2.1 Architecture Context

The Via-gent platform follows a **client-side, AI-powered, agentic RAG multi-workspaces** architecture with:

- **State Management**: Zustand stores with Dexie IndexedDB persistence
- **Event Bus**: EventEmitter3-based cross-store communication (`src/lib/events/store-events.ts`)
- **AI Agent System**: Provider adapters (OpenRouter, OpenAI, Anthropic) via AgentFactory
- **Workspace Ecosystem**: IDE, Knowledge, Study, Notes - designed for cross-workspace integration

### 2.2 Notes Workspace Current State

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Notes Workspace Architecture (CURRENT STATE)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐   │
│  │   NotesPage.tsx  │────►│   NoteEditor.tsx │────►│ BlockNoteView    │   │
│  │                  │     │                  │     │                  │   │
│  │  AgentSelector   │     │  AISlashCommand  │     │  (renders OK)    │   │
│  │  (DECORATIVE!)   │     │  (triggers fake) │     │                  │   │
│  └──────────────────┘     └────────┬─────────┘     └──────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌──────────────────┐     ┌──────────────────┐                             │
│  │  AIPromptDialog  │────►│ note-ai-service  │◄──── FAKE! Returns mock    │
│  │  (UI works)      │     │ (PLACEHOLDER!)   │       content after 1.5s   │
│  └──────────────────┘     └──────────────────┘                             │
│                                    ╳                                       │
│                                    ╳  NOT CONNECTED                        │
│                                    ╳                                       │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐   │
│  │  AgentsStore     │     │ ProviderStore    │     │  AgentFactory    │   │
│  │                  │     │                  │     │                  │   │
│  │  (HAS agents)    │     │ (HAS providers)  │     │ (NEVER called)   │   │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘   │
│                                                                             │
│  ════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  ┌──────────────────┐                              ┌──────────────────┐   │
│  │   note-store.ts  │◄─────── ISOLATED ──────────►│    Dexie DB      │   │
│  │  (CRUD works!)   │                              │  (IndexedDB)     │   │
│  └──────────────────┘                              └──────────────────┘   │
│           ╳                                                                │
│           ╳  NOT CONNECTED                                                 │
│           ╳                                                                │
│  ┌──────────────────┐     ┌──────────────────┐                             │
│  │  FileSyncService │     │  LocalFSAdapter  │                             │
│  │  (interface)     │     │  (IDE only)      │                             │
│  └──────────────────┘     └──────────────────┘                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Defect Deep Dive

#### DEFECT 1: Fake AI Service (P0 - CRITICAL)

**File:** `src/lib/notes/note-ai-service.ts`

**Current Implementation (Lines 20-34):**
```typescript
export async function generateNoteContent(prompt: string): Promise<string> {
    // PLACEHOLDER - NO REAL AI CONNECTION
    console.log('[NoteAIService] Generating content for:', prompt);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`**Generated Content for:** "${prompt}"\n\nHere is a list...\n\n*Generated by AI Magic*`);
        }, 1500);
    });
}
```

**Required Fix:**
```typescript
// AFTER: Wire to actual AI agent system
export async function generateNoteContent(
    prompt: string, 
    agentId?: string
): Promise<string> {
    // 1. Get active agent from store
    const agent = useAgentsStore.getState().getAgent(
        agentId || useAgentsStore.getState().activeAgentId
    );
    
    if (!agent) throw new Error('No agent configured');
    
    // 2. Create adapter via AgentFactory
    const adapter = await createProviderAdapter(agent.providerId, agent.modelId);
    
    // 3. Call AI with system prompt
    const response = await adapter.generateText({
        systemPrompt: agent.systemPrompt,
        userPrompt: `Generate content for the following request:\n\n${prompt}`,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
    });
    
    return response.text;
}
```

**Impact:** Converts fake AI to real AI generation via selected agent.

---

#### DEFECT 2: Agent Selector Disconnection (P0 - CRITICAL)

**File:** `src/presentation/components/notes/NotesPage.tsx`

**Current State:**
- AgentSelector component is rendered (lines 99-103, 168-173)
- It emits `STORE_EVENTS.AGENT_SELECTED` correctly
- **BUT:** `note-ai-service.ts` never reads from the agents store

**Required Fix:**
1. Modify `AIPromptDialog.tsx` to read active agent:
```typescript
const activeAgentId = useAgentsStore(state => state.activeAgentId);
// Pass activeAgentId to generateNoteContent()
```

2. Subscribe to agent selection events in notes context

---

#### DEFECT 3: Editor Hot-Reload Reactivity (P1 - HIGH)

**File:** `src/presentation/components/notes/NoteEditor.tsx`

**Current Issue (Lines 100-110):**
```typescript
const initialContent = useMemo(() => {
    if (!note?.blocks || note.blocks.length === 0) {
        return undefined;
    }
    return note.blocks as Block[];
}, [note?.id]); // Only on ID change

const editor = useCreateBlockNote({
    initialContent,
});
```

**Problem:** The `useCreateBlockNote` hook creates the editor instance once. When `noteId` changes, the hook receives new `initialContent` BUT BlockNote doesn't reinitialize.

**Required Fix:**
```typescript
// Add key prop to force remount when note changes
return (
    <div key={noteId} className={cn('note-editor', className)}>
        <BlockNoteView ... />
    </div>
);

// OR use BlockNote's replaceBlocks method:
useEffect(() => {
    if (note?.blocks && editor) {
        editor.replaceBlocks(editor.document, note.blocks as Block[]);
    }
}, [noteId, editor]);
```

---

#### DEFECT 4: No FileSyncService Integration (P2 - MEDIUM)

**Current State:**
- `FileSyncService` interface exists at `src/lib/filesync/file-sync-service.ts`
- Notes are stored in IndexedDB via Dexie only
- No mechanism to:
  - Export notes as `.md` files to local filesystem
  - Import markdown files as notes
  - Sync notes to project directory

**Required Fix:**
1. Create `NoteFileSyncAdapter` implementing `FileSyncService`
2. Add `syncToFile()` method in `note-store.ts`
3. Add `importFromMarkdown()` method
4. Wire workspace events for cross-workspace access

---

#### DEFECT 5: Text Selection AI Transform (P1 - HIGH)

**Current State:** NOT IMPLEMENTED

**User Expectation:** 
- Select text → Right-click or drag → AI transformation menu
- Options: Summarize, Expand, Explain, Translate, Improve

**Required Implementation:**
1. Add selection event listener in NoteEditor
2. Create `AITransformMenu` component
3. Wire to AI service with context (selected text + surrounding blocks)

---

#### DEFECT 6: Header AI Features (P1 - HIGH)

**Current State:**
- Header shows: emoji, title, save status, NoteStudyMenu
- No AI-powered header actions

**Required Fix:**
- Add AI action buttons: "Summarize Note", "Generate Outline", "Improve All"
- Wire to AI service with full note content as context

---

## 3. Impact Analysis

### 3.1 Epic Impact

| Epic | Impact Level | Description |
|------|--------------|-------------|
| EPIC-26 (Intelligent Knowledge Base) | CRITICAL | Core note AI features non-functional |
| EPIC-31 (Agent Intelligence) | HIGH | Agent selection has no effect |
| EPIC-32 (RAG Infrastructure) | MEDIUM | Notes not indexed for cross-workspace RAG |
| Architectural Consolidation | HIGH | Notes workspace is isolated silo |

### 3.2 Story Impact

**Current Stories Affected:**
- Story 26-4 (Inline AI Magic) - **BROKEN** - Uses fake service
- Story AC-02 (Agent Selector Unification) - **INCOMPLETE** - Not wired to notes AI
- Story CW-01 (Abstract File Sync Service) - **NOT EXTENDED** to notes

### 3.3 Artifact Conflicts

| Artifact | Section | Conflict |
|----------|---------|----------|
| `architecture.md` | State Management | Notes store not integrated with event bus |
| `architecture.md` | File Sync | Notes excluded from sync architecture |
| PRD (P2-KBS) | Knowledge synthesis | Notes cannot contribute to RAG |

---

## 4. Detailed Change Proposals

### 4.1 Phase 0: Immediate Fixes (Day 1)

#### Story NR-01: Wire AI Service to Agent System

| Field | Value |
|-------|-------|
| Priority | P0 |
| Effort | 4 hours |
| Dependencies | None |
| Owner | @bmad-bmm-dev |

**OLD → NEW:**

`src/lib/notes/note-ai-service.ts`:
```typescript
// OLD (Lines 20-34):
export async function generateNoteContent(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`**Generated Content...*`);
        }, 1500);
    });
}

// NEW:
import { useAgentsStore } from '@/stores/agents-store';
import { useProviderStore } from '@/lib/state/provider-store';
import { createProviderAdapter } from '@/lib/agent/factory';

export async function generateNoteContent(
    prompt: string,
    options?: {
        agentId?: string;
        contextBlocks?: Block[];
        systemPromptOverride?: string;
    }
): Promise<string> {
    const { activeAgentId, getAgent } = useAgentsStore.getState();
    const agentId = options?.agentId || activeAgentId;
    
    if (!agentId) {
        throw new Error('No active agent. Please select an agent first.');
    }
    
    const agent = getAgent(agentId);
    if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
    }
    
    // Get provider and credentials
    const { getProviderConfig } = useProviderStore.getState();
    const providerConfig = getProviderConfig(agent.providerId);
    
    if (!providerConfig?.apiKey) {
        throw new Error(`No API key configured for provider ${agent.providerId}`);
    }
    
    // Create adapter
    const adapter = await createProviderAdapter(
        agent.providerId,
        agent.modelId,
        providerConfig.apiKey
    );
    
    // Build context if provided
    let contextStr = '';
    if (options?.contextBlocks?.length) {
        contextStr = `\n\nContext from current note:\n${options.contextBlocks.map(b => b.content?.map(c => c.text).join('')).join('\n')}`;
    }
    
    // Generate via AI
    const response = await adapter.generateText({
        systemPrompt: options?.systemPromptOverride || agent.systemPrompt,
        userPrompt: `${prompt}${contextStr}`,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
    });
    
    return response.text;
}
```

**Acceptance Criteria:**
- [ ] AI Magic slash command produces real AI content
- [ ] Selected agent's model is used for generation
- [ ] API key from provider store is used
- [ ] Error messages shown if no agent/key configured
- [ ] Console logs show actual AI call, not mock

---

#### Story NR-02: Fix Editor Hot-Reload Reactivity

| Field | Value |
|-------|-------|
| Priority | P0 |
| Effort | 2 hours |
| Dependencies | None |
| Owner | @bmad-bmm-dev |

**OLD → NEW:**

`src/presentation/components/notes/NoteEditor.tsx`:
```typescript
// OLD (Lines 182-218):
return (
    <div className={cn('note-editor', className)}>
        ...
    </div>
);

// NEW - Add key prop to force remount:
return (
    <div key={`editor-${noteId}`} className={cn('note-editor', className)}>
        ...
    </div>
);
```

**Alternative Fix (if key causes issues):**
```typescript
// Add effect to replace blocks on note change
useEffect(() => {
    if (note?.blocks && editor && !readOnly) {
        const blocks = note.blocks as Block[];
        if (blocks.length > 0) {
            editor.replaceBlocks(editor.document, blocks);
        }
    }
}, [noteId]); // Only trigger on noteId change
```

**Acceptance Criteria:**
- [ ] Clicking different note in sidebar immediately shows that note's content
- [ ] No page refresh required
- [ ] Previous note's content doesn't flash before new content
- [ ] Unsaved changes warning if switching with pending debounce

---

### 4.2 Phase 1: AI Integration (Days 2-3)

#### Story NR-03: Connect AgentSelector to AI Service

| Field | Value |
|-------|-------|
| Priority | P1 |
| Effort | 3 hours |
| Dependencies | NR-01 |
| Owner | @bmad-bmm-dev |

**Implementation Details:**

1. Subscribe to agent selection events in AIPromptDialog:
```typescript
// AIPromptDialog.tsx - Add hook
const activeAgentId = useAgentsStore(state => state.activeAgentId);
const agent = useAgentsStore(state => 
    state.agents.find(a => a.id === state.activeAgentId)
);

// Show agent in dialog header
<DialogTitle className="flex items-center gap-2">
    <Sparkles className="w-5 h-5 text-primary" />
    AI Magic via {agent?.name || 'Default Agent'}
</DialogTitle>
```

2. Pass agent context to generation:
```typescript
const generatedContent = await generateNoteContent(prompt, { agentId: activeAgentId });
```

**Acceptance Criteria:**
- [ ] AI dialog shows which agent will be used
- [ ] Changing agent selector changes AI responses
- [ ] Agent's system prompt affects generation style

---

#### Story NR-04: Add Text Selection AI Transform

| Field | Value |
|-------|-------|
| Priority | P1 |
| Effort | 4 hours |
| Dependencies | NR-01, NR-03 |
| Owner | @bmad-bmm-dev |

**New Files:**
- `src/presentation/components/notes/AITransformMenu.tsx`

**Implementation:**
```typescript
// AITransformMenu.tsx
interface AITransformMenuProps {
    selectedText: string;
    onTransform: (action: TransformAction, result: string) => void;
    onClose: () => void;
}

type TransformAction = 'summarize' | 'expand' | 'explain' | 'improve' | 'translate';

const TRANSFORM_PROMPTS: Record<TransformAction, string> = {
    summarize: 'Summarize the following text concisely:',
    expand: 'Expand on the following text with more detail:',
    explain: 'Explain the following text in simple terms:',
    improve: 'Improve the writing quality of the following text:',
    translate: 'Translate the following text to English (or from English to Vietnamese):',
};

export function AITransformMenu({ selectedText, onTransform, onClose }: AITransformMenuProps) {
    const handleAction = async (action: TransformAction) => {
        const result = await generateNoteContent(
            `${TRANSFORM_PROMPTS[action]}\n\n"${selectedText}"`
        );
        onTransform(action, result);
    };
    
    return (
        <DropdownMenu>
            <DropdownMenuItem onClick={() => handleAction('summarize')}>
                ✨ Summarize
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('expand')}>
                📝 Expand
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('explain')}>
                💡 Explain
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('improve')}>
                ✏️ Improve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('translate')}>
                🌐 Translate
            </DropdownMenuItem>
        </DropdownMenu>
    );
}
```

**Integration in NoteEditor:**
- Add selection change listener
- Show floating menu on text selection
- Replace selected text with transformed result

**Acceptance Criteria:**
- [ ] Selecting text shows floating AI menu
- [ ] Each action calls AI with appropriate prompt
- [ ] Result replaces selected text
- [ ] Loading state shown during generation
- [ ] Cancel option available

---

#### Story NR-05: Implement Command Palette AI Actions

| Field | Value |
|-------|-------|
| Priority | P1 |
| Effort | 3 hours |
| Dependencies | NR-01 |
| Owner | @bmad-bmm-dev |

**Implementation:**
Add note-specific AI commands to the command palette:
- `/summarize-note` - Summarize entire note
- `/generate-outline` - Create outline from note content
- `/improve-note` - Improve writing quality
- `/translate-note` - Translate entire note

**Acceptance Criteria:**
- [ ] Commands appear in slash menu under "AI" group
- [ ] Each command operates on full note content
- [ ] Results inserted at cursor position
- [ ] Progress indicator for long operations

---

### 4.3 Phase 2: Ecosystem Integration (Days 4-6)

#### Story NR-06: Implement Notes → FileSync Binding

| Field | Value |
|-------|-------|
| Priority | P2 |
| Effort | 6 hours |
| Dependencies | CW-01 (Abstract File Sync Service) |
| Owner | @bmad-bmm-dev |

**New Files:**
- `src/lib/notes/note-file-sync-adapter.ts`

**Implementation:**
```typescript
// note-file-sync-adapter.ts
import type { FileSyncService, FileMetadata, SyncResult } from '../filesync/file-sync-service';
import { useNoteStore } from './note-store';
import type { NoteRecord } from './types';

export class NoteFileSyncAdapter implements Partial<FileSyncService> {
    private projectId: string;
    
    constructor(projectId: string) {
        this.projectId = projectId;
    }
    
    /**
     * Export a note to a markdown file
     */
    async exportToMarkdown(noteId: string, targetPath: string): Promise<void> {
        const note = useNoteStore.getState().notes.get(noteId);
        if (!note) throw new Error(`Note ${noteId} not found`);
        
        const markdown = this.noteToMarkdown(note);
        // Write via LocalFSAdapter
        await localFSAdapter.writeFile(targetPath, markdown);
    }
    
    /**
     * Import a markdown file as a note
     */
    async importFromMarkdown(sourcePath: string): Promise<string> {
        const content = await localFSAdapter.readFile(sourcePath);
        const blocks = await this.markdownToBlocks(content);
        
        const noteId = await useNoteStore.getState().createNote({
            title: this.extractTitle(sourcePath),
            blocks,
        });
        
        return noteId;
    }
    
    /**
     * Sync all notes to a directory
     */
    async syncToDirectory(targetDir: string): Promise<SyncResult> {
        const { notesArray } = useNoteStore.getState();
        let filesProcessed = 0;
        const errors = [];
        
        for (const note of notesArray) {
            try {
                const filePath = `${targetDir}/${note.title.replace(/[^a-zA-Z0-9]/g, '-')}.md`;
                await this.exportToMarkdown(note.id, filePath);
                filesProcessed++;
            } catch (error) {
                errors.push({ path: note.id, error: error.message });
            }
        }
        
        return { success: errors.length === 0, filesProcessed, errors, duration: 0 };
    }
    
    private noteToMarkdown(note: NoteRecord): string {
        // Convert BlockNote blocks to markdown
        // Use BlockNote's markdown serializer
        return `# ${note.title}\n\n${blocksToMarkdown(note.blocks)}`;
    }
    
    private async markdownToBlocks(markdown: string): Promise<Block[]> {
        // Use BlockNote's markdown parser
        return await editor.tryParseMarkdownToBlocks(markdown);
    }
}
```

**Acceptance Criteria:**
- [ ] "Export to File" option in note menu
- [ ] "Import from Markdown" option in notes sidebar
- [ ] Batch sync to directory working
- [ ] File watchers for auto-import changes

---

#### Story NR-07: Cross-Workspace Note Access

| Field | Value |
|-------|-------|
| Priority | P2 |
| Effort | 4 hours |
| Dependencies | NR-06 |
| Owner | @bmad-bmm-dev |

**Implementation:**
1. Add note events to event bus:
```typescript
// store-events.ts additions
NOTE_CREATED: 'note:created',
NOTE_UPDATED: 'note:updated',
NOTE_DELETED: 'note:deleted',
NOTE_INDEXED: 'note:indexed',
```

2. Emit events from note-store.ts:
```typescript
// In createNote():
emitStoreEvent(STORE_EVENTS.NOTE_CREATED, {
    noteId,
    projectId,
    title: newNote.title,
    timestamp: Date.now(),
});
```

3. Subscribe from Knowledge workspace to include notes in RAG:
```typescript
// In knowledge-store or synthesis-service
useStoreEvent<NoteCreatedPayload>(STORE_EVENTS.NOTE_CREATED, (payload) => {
    // Index note for RAG retrieval
    indexNoteForRAG(payload.noteId);
});
```

**Acceptance Criteria:**
- [ ] Note changes emit events
- [ ] Knowledge workspace can list notes
- [ ] RAG can search across notes
- [ ] IDE workspace can reference notes

---

#### Story NR-08: Markdown Import/Export UI

| Field | Value |
|-------|-------|
| Priority | P2 |
| Effort | 3 hours |
| Dependencies | NR-06 |
| Owner | @bmad-bmm-dev |

**New Components:**
- Import dialog with file picker
- Export options (single note, all notes, selected notes)
- Sync settings panel

**Acceptance Criteria:**
- [ ] Import button in sidebar header
- [ ] Export option in note context menu
- [ ] Batch export to markdown files
- [ ] Format preservation (headings, lists, code blocks)

---

## 5. Implementation Handoff

### 5.1 Handoff Classifications

| Story | Scope | Handoff To | Deliverables |
|-------|-------|------------|--------------|
| NR-01 | Minor | @bmad-bmm-dev | Code changes to note-ai-service.ts |
| NR-02 | Minor | @bmad-bmm-dev | Code changes to NoteEditor.tsx |
| NR-03 | Minor | @bmad-bmm-dev | Code changes to AIPromptDialog.tsx |
| NR-04 | Moderate | @bmad-bmm-dev | New AITransformMenu component |
| NR-05 | Moderate | @bmad-bmm-dev | Command palette extensions |
| NR-06 | Major | @bmad-bmm-dev + @bmad-bmm-architect | New adapter + integration |
| NR-07 | Major | @bmad-bmm-dev + @bmad-bmm-architect | Event bus wiring |
| NR-08 | Minor | @bmad-bmm-dev | UI components |

### 5.2 Success Criteria

**Phase 0 Complete When:**
- [ ] AI Magic returns real AI content (not mock)
- [ ] Switching notes shows correct content immediately

**Phase 1 Complete When:**
- [ ] Agent selector affects AI output
- [ ] Text selection shows AI transform menu
- [ ] Command palette includes AI actions

**Phase 2 Complete When:**
- [ ] Notes can be exported to markdown files
- [ ] Markdown files can be imported as notes
- [ ] Other workspaces can access notes via events

### 5.3 Validation Gates

After each phase, run:
```bash
# Build validation
pnpm exec tsc --noEmit && pnpm build

# Test suite
pnpm test

# Manual validation
- Visit /notes route
- Test each acceptance criterion
```

---

## 6. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| BlockNote API incompatibility | Medium | High | Research BlockNote docs, test on branch |
| AgentFactory changes needed | Low | Medium | AgentFactory is stable, interface documented |
| Event bus subscription leaks | Medium | Medium | Use cleanup in useEffect |
| FileSyncService not ready | High | High | NR-06 depends on CW-01, prioritize CW-01 |

---

## 7. Appendix

### A. File Changes Summary

| File | Action | Lines Added | Lines Removed |
|------|--------|-------------|---------------|
| `src/lib/notes/note-ai-service.ts` | Rewrite | ~60 | ~15 |
| `src/presentation/components/notes/NoteEditor.tsx` | Modify | ~10 | ~2 |
| `src/presentation/components/notes/AIPromptDialog.tsx` | Modify | ~15 | ~5 |
| `src/presentation/components/notes/AITransformMenu.tsx` | Create | ~100 | 0 |
| `src/lib/notes/note-file-sync-adapter.ts` | Create | ~150 | 0 |
| `src/lib/events/store-events.ts` | Modify | ~20 | 0 |

### B. Dependencies Required

No new external packages needed. All functionality uses existing dependencies:
- `@blocknote/core` - Already installed
- `@blocknote/react` - Already installed
- `eventemitter3` - Already installed
- `zustand` - Already installed

### C. Related Documents

- Architecture: `docs/architecture.md`
- Sprint Status: `_bmad-output/sprint-artifacts/sprint-status.yaml`
- Workflow Status: `bmm-workflow-status.yaml`
- Agent Factory: `src/lib/agent/factory.ts`
- Provider Store: `src/lib/state/provider-store.ts`

---

## 8. Approval

| Role | Name | Decision | Date |
|------|------|----------|------|
| BMAD Master | Team A | PROPOSED | 2025-12-31 |
| User | | ☐ APPROVE / ☐ REJECT | |

---

*Generated by BMAD Master Agent | Sprint Change Proposal SCP-NOTES-2025-12-31*
