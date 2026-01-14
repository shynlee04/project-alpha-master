# Feature Group: Workspace-Specific Features - Notes

**Shard ID**: ARCH-SHARD-03-06
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Focus**: Workspace-Specific Features #2 - Notes (BlockNote Editor, AI Commands, Slash Commands)
**Status**: COMPLETE - DEEP ANALYSIS

---

## 1. Architecture → Notes Mapping

### 1.1 Architecture Groups Involved

| Architecture Group | Files | Issue Severity | Impact on Notes |
|--------------------|-------|----------------|-----------------|
| **A: State & Stores** | `note-store-refactored.ts` | ✅ GOOD | 7 slices working |
| **A: State & Stores** | `AISlashCommand.tsx` | P0 | GOD COMPONENT (1146 lines) |
| **A: State & Stores** | `NoteEditor.tsx` | P0 | GOD COMPONENT (946 lines) |
| **D: API & Data Flow** | `note-tools-impl.ts` | P0 | blocksToMarkdown incomplete |
| **F: Layers & Boundaries** | `slash-command-store.ts` | P1 | 471 lines, single file |
| **F: Layers & Boundaries** | `ai-*-service.ts` (6 files) | ⚠️ | Scattered AI services |

### 1.2 Notes Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      NOTES WORKSPACE ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     NOTE STORE LAYER                            │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │         note-store-refactored.ts (7 slices)           │   │   │
│  │  │                                                          │   │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │   │   │
│  │  │  │ CRUD    │ │ Metadata │ │  Sync   │ │   AI    │ │   │   │
│  │  │  │ slice   │ │  slice   │ │  slice  │ │  slice  │ │   │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │   │   │
│  │  │                                                          │   │   │
│  │  │  ✅ Well-structured slice pattern                       │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│                                   ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   PRESENTATION LAYER                            │   │
│  │                                                                  │   │
│  │   ┌────────────────────────────────────────────────────────┐    │   │
│  │   │         AISlashCommand.tsx (1146 lines!)             │    │   │
│  │   │         ⚠️ GOD COMPONENT - CRITICAL                │    │   │
│  │   │                                                      │    │   │
│  │   │  ┌──────────────────────────────────────────────┐     │    │   │
│  │   │  │      RESPONSIBILITIES (16+!)             │     │    │   │
│  │   │  ├──────────────────────────────────────────────┤     │    │   │
│  │   │  │ 1. Command menu UI                        │     │    │   │
│  │   │  │ 2. Command execution logic (16 commands) │     │    │   │
│  │   │  │ 3. Context extraction                   │     │    │   │
│  │   │  │ 4. Translation helper                  │     │    │   │
│  │   │  │ 5. Menu item generation               │     │    │   │
│  │   │  │ 6. State management                   │     │    │   │
│  │   │  │ ... +10 more                          │     │    │   │
│  │   │  └──────────────────────────────────────┘     │    │   │
│  │   └────────────────────────────────────────────────────────┘    │   │
│  │            │                                               │   │
│  │            ▼                                               │   │
│  │   ┌────────────────────────────────────────────────────────┐│   │
│  │   │         NoteEditor.tsx (946 lines!)                  ││   │
│  │   │         ⚠️ GOD COMPONENT - CRITICAL                ││   │
│  │   │                                                      ││   │
│  │   │  ┌──────────────────────────────────────────────┐     ││   │
│  │   │  │      RESPONSIBILITIES (12+)               │     ││   │
│  │   │  ├──────────────────────────────────────────────┤     ││   │
│  │   │  │ 1. BlockNote initialization               │     ││   │
│  │   │  │ 2. Block sanitization                    │     ││   │
│  │   │  │ 3. Error handling                      │     ││   │
│  │   │  │ 4. Scroll position management          │     ││   │
│  │   │  │ 5. AI integration                      │     ││   │
│  │   │  │ 6. Content tracking                   │     ││   │
│  │   │  │ ... +6 more                          │     ││   │
│  │   │  └──────────────────────────────────────┘     ││   │
│  │   └────────────────────────────────────────────────────────┘│   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                   │                            │
│                                   ▼                            │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                  AI SERVICES LAYER                       ││
│  │                                                           ││
│  │  ai-image-service.ts    │  ai-vision-service.ts         ││
│  │  ai-tts-service.ts      │  ai-video-service.ts          ││
│  │  ai-storyboard-service.ts│ ai-storyboard-service.ts     ││
│  │                                                           ││
│  │  ⚠️ SCATTERED - No unified AI service layer            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Issues Found (Notes Specific)

| Issue | Location | Severity | Root Cause |
|-------|----------|----------|------------|
| **AISlashCommand god component** | `AISlashCommand.tsx:1146` | P0 | 16+ responsibilities mixed |
| **NoteEditor god component** | `NoteEditor.tsx:946` | P0 | 12+ responsibilities mixed |
| **blocksToMarkdown incomplete** | `note-tools-impl.ts:58-96` | P0 | Complex blocks not handled |
| **Slash command store** | `slash-command-store.ts:471` | P1 | Single file, no slices |
| **AI services scattered** | 6 separate files | P1 | No unified service layer |

---

## 2. Feature Behavior Analysis

### 2.1 Notes Core Flows

#### Flow 1: AI Command Execution

```
User Action              System Response              Architecture Path
─────────────────────────────────────────────────────────────────────
1. Type /          →   Show slash menu           AISlashCommand
2. Select command  →   Parse command             AISlashCommand
3. Execute command →   Call AI service           AI Services
4. Generate block  →   Create block              NoteEditor
5. Render block    →   Display in editor         BlockNote

Current Issues:
- Step 1-5: All handled in single 1146-line component
- No separation of concerns
- Impossible to test individual commands
```

#### Flow 2: Note Editing with BlockNote

```
User Action              System Response              Architecture Path
─────────────────────────────────────────────────────────────────────
1. Create note     →   New note in store          NoteStore
2. Type content   →   BlockNote captures input    NoteEditor
3. Auto-save      →   Debounced sync             NoteSyncSlice
4. AI suggestion  →   Show inline option         NoteEditor
5. Apply block    →   Insert block               NoteEditor

Current Issues:
- Step 2: NoteEditor handles too much
- Step 3: Sync could be optimized
- Step 4-5: AI coupling with editor
```

---

## 3. User Stories - Notes (DETAILED)

### Story NOTES-01: BlockNote Editor with AI Integration

```
As a user
I want to create rich content with BlockNote editor and AI-powered blocks
So that I can create interactive, multimedia documents

Priority: P0
Estimation: 4 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Create notes with BlockNote editor
- [ ] AC2: Rich blocks: text, heading, list, code, quote, table
- [ ] AC3: AI-powered blocks: image, vision, chart, artifact
- [ ] AC4: Drag and reorder blocks
- [ ] AC5: Auto-save with conflict detection
- [ ] AC6: Undo/redo with deep history

Technical Requirements:
- [ ] TR1: `NoteEditorCore` component (render only)
- [ ] TR2: `useEditorInitialization` hook
- [ ] TR3: `useBlockSanitizer` hook
- [ ] TR4: `useAutoSave` hook with debounce
- [ ] TR5: `useEditorHistory` hook

NoteEditor Responsibilities (should be):
- RENDER: Display BlockNote editor
- INPUT: Capture user input
- SELECTION: Manage cursor/selection
- BLOCK RENDERING: Render blocks

NoteEditor Responsibilities (should NOT be):
- AI SERVICES: Handle AI generation (delegate)
- SYNC: Handle persistence (delegate)
- MENU: Show slash menu (delegate)
- ERROR HANDLING: Handle errors (delegate)

Edge Cases:
- [ ] EC1: Corrupted note data → Recovery or reset
- [ ] EC2: Large note (>1000 blocks) → Virtualization
- [ ] EC3: Concurrent edits → Conflict resolution
- [ ] EC4: BlockNote schema version mismatch → Migration
- [ ] EC5: AI service unavailable → Graceful fallback

Combined Uses:
- [ ] CU1: Create note, add text, add image, add code
- [ ] CU2: Use AI command to generate content
- [ ] CU3: Reorder blocks, undo/redo

Non-Functional Requirements:
- [ ] NFR1: Editor load < 500ms
- [ ] NFR2: Block render < 50ms
- [ ] NFR3: Auto-save latency < 2s
- [ ] NFR4: Memory < 50MB for note

Tests Required:
- [ ] Unit: Block sanitization
- [ ] Unit: Auto-save debounce
- [ ] Integration: Note CRUD with editor
- [ ] E2E: Full editing workflow
```

### Story NOTES-02: AI Slash Commands

```
As a user
I want to type / commands to trigger AI actions
So that I can generate content quickly without leaving the editor

Priority: P0
Estimation: 3 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Type / to show command menu
- [ ] AC2: 16+ AI commands available:
   - /ai-image: Generate image
   - /ai-vision: Analyze image
   - /ai-chart: Create chart
   - /ai-table: Create table
   - /ai-tts: Text to speech
   - /storyboard: Create storyboard
   - /code: Generate code
   - /translate: Translate text
   - /summarize: Summarize
   - /continue: Continue writing
   - /outline: Create outline
   - /expand: Expand content
   - /shorten: Shorten content
   - /improve: Improve writing
   - /artifact: Create HTML artifact
   - /gallery: Create image gallery
- [ ] AC3: Command menu navigable (arrows, enter)
- [ ] AC4: Command execution shows progress
- [ ] AC5: Results inserted as blocks
- [ ] AC6: Error handling with recovery options

Technical Requirements:
- [ ] TR1: `useSlashCommandMenu` hook
- [ ] TR2: `CommandRegistry` - 16 command definitions
- [ ] TR3: `CommandExecutor` - orchestrates execution
- [ ] TR4: `AICommandResultHandler` - converts results to blocks

Command Architecture:
```
SlashCommandMenu (UI)
     ↓
CommandRegistry (lookup)
     ↓
CommandExecutor (orchestrate)
     ↓
AI Services (generate)
     ↓
BlockConverter (result → blocks)
     ↓
Editor (insert)
```

Edge Cases:
- [ ] EC1: Command fails → Error message + retry
- [ ] EC2: AI timeout → Cancel option
- [ ] EC3: Invalid command → Menu stays open
- [ ] EC4: Multiple commands → Queue or parallel?
- [ ] EC5: No API key → Prompt user

Combined Uses:
- [ ] CU1: Type /ai-image → Generate image block
- [ ] CU2: Select text → /translate → French translation
- [ ] CU3: /summarize → Summary block added

Non-Functional Requirements:
- [ ] NFR1: Menu open < 50ms
- [ ] NFR2: Command execution < 5s
- [ ] NFR3: Menu keyboard nav < 100ms
- [ ] NFR4: No input lag while menu open

Tests Required:
- [ ] Unit: Command registry lookup
- [ ] Unit: Command execution
- [ ] Integration: Menu → command → block
- [ ] E2E: Full slash command workflow
```

### Story NOTES-03: Unified AI Service Layer

```
As a developer
I want a unified AI service layer for all note operations
So that AI features are consistent and maintainable

Priority: P1
Estimation: 2 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Single entry point for all AI operations
- [ ] AC2: Shared error handling
- [ ] AC3: Shared rate limiting
- [ ] AC4: Unified response format
- [ ] AC5: Easy to add new AI commands

Technical Requirements:
- [ ] TR1: `NoteAIService` class (facade)
- [ ] TR2: `AICommandHandler` interface
- [ ] TR3: `AIMiddleware` for logging/retry/rate-limit
- [ ] TR4: `AIResponseParser` for converting to blocks

Architecture:
```
NoteAIService (facade)
     │
     ├── AICommandHandler (interface)
     │      ├── ImageHandler
     │      ├── VisionHandler
     │      ├── ChartHandler
     │      └── ... (16 implementations)
     │
     ├── AIMiddleware
     │      ├── RateLimitMiddleware
     │      ├── RetryMiddleware
     │      ├── LoggingMiddleware
     │      └── TimeoutMiddleware
     │
     └── AIResponseParser
```

Edge Cases:
- [ ] EC1: Rate limit exceeded → Queue or reject
- [ ] EC2: Service timeout → Retry or fallback
- [ ] EC3: Invalid response → Error or partial
- [ ] EC4: Network offline → Queue for later

Combined Uses:
- [ ] CU1: All slash commands use same service
- [ ] CU2: AI settings affect all commands
- [ ] CU3: Debug all AI calls in one place

Non-Functional Requirements:
- [ ] NFR1: Service initialization < 100ms
- [ ] NFR2: All commands < 5s
- [ ] NFR3: Rate limit enforced consistently
- [ ] NFR4: Error logging comprehensive

Tests Required:
- [ ] Unit: Each command handler
- [ ] Unit: Middleware chain
- [ ] Integration: Service facade
- [ ] E2E: Multiple commands in sequence
```

### Story NOTES-04: Note CRUD with Conflict Resolution

```
As a user
I want to create, read, update, and delete notes with automatic sync
So that my notes are always safe and accessible

Priority: P0
Estimation: 1 day (verify)

Acceptance Criteria:
- [ ] AC1: Create new note with title and content
- [ ] AC2: List all notes with search/filter
- [ ] AC3: Edit note content
- [ ] AC4: Delete note (with undo)
- [ ] AC5: Version history for notes
- [ ] AC6: Offline support with sync when online

Technical Requirements:
- [ ] TR1: `NoteCrudSlice` with CRUD operations
- [ ] TR2: `NoteQuerySlice` with search/filter
- [ ] TR3: `NoteVersionSlice` for history
- [ ] TR4: `NoteSyncSlice` for offline support

Edge Cases:
- [ ] EC1: Duplicate note names → Auto-rename or error
- [ ] EC2: Delete during sync → Queue deletion
- [ ] EC3: Version history too large → Prune old versions
- [ ] EC4: Offline for long period → Merge conflicts

Combined Uses:
- [ ] CU1: Create note, edit, save, delete
- [ ] CU2: Search notes, filter by date
- [ ] CU3: Restore from version history

Non-Functional Requirements:
- [ ] NFR1: CRUD operation < 100ms
- [ ] NFR2: Search < 200ms for 1000 notes
- [ ] NFR3: Version history < 10MB
- [ ] NFR4: Sync works offline-first

Tests Required:
- [ ] Unit: CRUD operations
- [ ] Unit: Search/filter
- [ ] Integration: Sync with conflicts
- [ ] E2E: Full CRUD workflow
```

---

## 4. Notes → Architecture Conflict Matrix

| Notes Story | Architecture Issue | Conflict Severity | Fix Required |
|-------------|-------------------|-------------------|--------------|
| NOTES-01 | NoteEditor god component (946 lines) | BLOCKING | Extract 6+ hooks |
| NOTES-02 | AISlashCommand god component (1146 lines) | BLOCKING | Extract command system |
| NOTES-02 | blocksToMarkdown incomplete | BLOCKING | Enhance function |
| NOTES-03 | AI services scattered (6 files) | HIGH | Create unified service layer |
| NOTES-04 | Slash command store (471 lines) | MEDIUM | Split into slices |

---

## 5. File Change Manifest - Notes

### 5.1 Files to CREATE

| File | description | Lines | Story |
|------|---------|-------|-------|
| `presentation/components/notes/NoteEditor/hooks/use-editor-initialization.ts` | Editor init | 80 | NOTES-01 |
| `presentation/components/notes/NoteEditor/hooks/use-block-sanitizer.ts` | Block validation | 60 | NOTES-01 |
| `presentation/components/notes/NoteEditor/hooks/use-auto-save.ts` | Auto-save | 60 | NOTES-01 |
| `presentation/components/notes/NoteEditor/hooks/use-editor-history.ts` | Undo/redo | 60 | NOTES-01 |
| `presentation/components/notes/NoteEditor/NoteEditorCore.tsx` | Core component | 150 | NOTES-01 |
| `presentation/components/notes/AISlashCommand/hooks/use-slash-menu.ts` | Menu hook | 80 | NOTES-02 |
| `presentation/components/notes/AISlashCommand/services/command-registry.ts` | 16 commands | 200 | NOTES-02 |
| `presentation/components/notes/AISlashCommand/services/command-executor.ts` | Orchestrator | 100 | NOTES-02 |
| `presentation/components/notes/AISlashCommand/AISlashCommandCore.tsx` | Core component | 150 | NOTES-02 |
| `lib/notes/services/note-ai-service.ts` | Unified AI service | 150 | NOTES-03 |
| `lib/notes/services/ai-command-handler.ts` | Handler interface | 50 | NOTES-03 |
| `lib/notes/services/ai-middleware.ts` | Rate/retry/log | 80 | NOTES-03 |

### 5.2 Files to MODIFY

| File | Change | Lines | Story |
|------|--------|-------|-------|
| `NoteEditor.tsx` | Extract to core + hooks, <200 lines | -700 | NOTES-01 |
| `AISlashCommand.tsx` | Extract to core + registry, <200 lines | -900 | NOTES-02 |
| `note-tools-impl.ts` | Enhance blocksToMarkdown | +100 | NOTES-02 |
| `slash-command-store.ts` | Split into slices | -200 | NOTES-02 |

### 5.3 Files to DELETE (After Verification)

| File | Reason | Story |
|------|--------|-------|
| `ai-image-service.ts` | Merged into note-ai-service | NOTES-03 |
| `ai-vision-service.ts` | Merged into note-ai-service | NOTES-03 |
| `ai-tts-service.ts` | Merged into note-ai-service | NOTES-03 |
| `ai-video-service.ts` | Merged into note-ai-service | NOTES-03 |
| `ai-storyboard-service.ts` | Merged into note-ai-service | NOTES-03 |

---

## 6. Notes Must-Pass Checklist

### Pre-Refactor Verification

- [ ] NoteEditor responsibilities documented
- [ ] AISlashCommand responsibilities documented
- [ ] All 16 commands identified
- [ ] AI services dependencies mapped

### During Refactor

- [ ] NoteEditorCore created and tested
- [ ] use-editor-initialization hook works
- [ ] use-block-sanitizer hook works
- [ ] use-auto-save hook works
- [ ] use-editor-history hook works
- [ ] NoteEditor refactored to <200 lines
- [ ] CommandRegistry created with 16 commands
- [ ] CommandExecutor created
- [ ] AISlashCommandCore created
- [ ] AISlashCommand refactored to <200 lines
- [ ] NoteAIService created
- [ ] AI middleware chain working

### Post-Refactor Verification

- [ ] NoteEditor.tsx < 200 lines
- [ ] AISlashCommand.tsx < 200 lines
- [ ] All 16 commands work
- [ ] blocksToMarkdown handles all types
- [ ] Unified AI service works
- [ ] No console errors in notes workflow
- [ ] TypeScript compilation succeeds
- [ ] All existing tests pass

---

## 7. Dependencies & Risks

### Dependencies

| Dependency | Status | Impact |
|------------|--------|--------|
| BlockNote | ✅ Ready | Core |
| 16 AI Commands | ⚠️ Need extraction | Core |
| Dexie | ✅ Ready | Persistence |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **NoteEditor refactor breaks editing** | Medium | High | Test each hook |
| **AISlashCommand extraction complex** | High | High | Extract one command at a time |
| **AI service consolidation breaks commands** | Medium | High | Maintain interface compatibility |
| **blocksToMarkdown missing types** | Low | Medium | Add type guards |

### Deferred (Not MVP)

| Item | Reason | When |
|------|--------|------|
| Command customization | User feature | Future |
| AI prompt templates | Advanced | Future |
| Voice commands | Multimodal | Phase 3 |

---

## 8. Research Notes & Tech Context

### BlockNote Schema

```
Block Types:
- paragraph
- heading (1-6)
- bulletList
- orderedList
- checkList
- codeBlock
- blockquote
- table
- image
- chart
- audio
- video
- custom (HTML artifact)

Each block has:
- id: string
- type: string
- content: any (type-specific)
- attributes: Record<string, any>
- children: Block[]
```

### AI Command Architecture

```
Pattern: Command → Service → Provider → Response → Block

Example: /ai-image
1. Parse command (image prompt)
2. Call AI service (Gemini with image model)
3. Get image URL
4. Convert to image block
5. Insert at cursor
```

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [shard-03-07 - Workspace-Specific Features - Knowledge & Study](./shard-03-07-workspace-knowledge-study.md)*
