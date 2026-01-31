# Requirements: Project Alpha

**Defined:** 2026-02-01
**Core Value:** Users can interact with AI that reads, writes, and understands their project files — all client-side with zero data sent to our servers.

## v1 Requirements

Requirements for architectural remediation and feature completion. Each maps to roadmap phases.

### Preparation

- [ ] **PREP-01**: Project backup exists in separate git branch and can be restored
- [ ] **PREP-02**: Database migration strategy documented with rollback procedure

### Foundation Cleanup

- [ ] **CLEAN-01**: Zero `workspaceBindings` / `WorkspaceBindings` references in codebase
- [ ] **CLEAN-02**: Zero `workspaceId` / `WorkspaceId` references in codebase
- [ ] **CLEAN-03**: Zero `@/lib/*` imports in codebase
- [ ] **CLEAN-04**: All types consolidated to `@/domain/schemas/` (no `@/domain/entities/`)
- [ ] **CLEAN-05**: ESLint rules prevent regression of banned terms and imports

### Platform Operators — FileTree

- [ ] **PLAT-01**: User can create, read, update, delete projects via FileTree
- [ ] **PLAT-02**: User can create, read, update, delete files within a project
- [ ] **PLAT-03**: Files sync to file system on desktop via FSA
- [ ] **PLAT-04**: Files persist to IndexedDB on mobile/tablet
- [ ] **PLAT-05**: User can switch between projects (hot-load) without page refresh

### Platform Operators — Chat & Layout

- [ ] **PLAT-06**: User can create chat threads scoped to a project
- [ ] **PLAT-07**: User can send messages to AI in threads and receive responses
- [ ] **PLAT-08**: Chat cascade renders message parts (text, code, artifacts, tool calls)
- [ ] **PLAT-09**: Layout panels work without overlap or disappearing (drag-drop fix)
- [ ] **PLAT-10**: Module toggle in activity bar shows/hides modules correctly

### AI Integration

- [ ] **AI-01**: Tool registry defines available AI tools with permission levels
- [ ] **AI-02**: Tools requiring approval prompt user before execution
- [ ] **AI-03**: Tool side effects (file changes) are tracked in ToolResult
- [ ] **AI-04**: AI calls work with Gemini provider via TanStack AI SDK
- [ ] **AI-05**: AI calls work with OpenRouter provider
- [ ] **AI-06**: BYOK vault stores and retrieves API keys securely
- [ ] **AI-07**: Streaming responses render progressively in chat

### Feature Modules

- [ ] **MOD-01**: Module system loads platform-appropriate modules based on capabilities
- [ ] **MOD-02**: Monaco editor opens files from FileTree
- [ ] **MOD-03**: Monaco editor saves files via FileService
- [ ] **MOD-04**: Notes module creates and edits rich text notes (BlockNote)
- [ ] **MOD-05**: Notes module supports AI text completion
- [ ] **MOD-06**: Notes module supports AI summarization

### RAG System

- [ ] **RAG-01**: Per-project Orama index created and persisted
- [ ] **RAG-02**: Files can be indexed for RAG search
- [ ] **RAG-03**: Threads can be indexed for RAG search
- [ ] **RAG-04**: `search_rag` tool returns relevant results
- [ ] **RAG-05**: RAG context is included in AI calls when enabled

### Terminal, Preview & Polish

- [ ] **TERM-01**: Terminal module runs commands via WebContainer (desktop only)
- [ ] **TERM-02**: Preview module shows dev server output in iframe
- [ ] **TERM-03**: Error boundaries prevent full app crashes
- [ ] **TERM-04**: Test coverage >80% on new code
- [ ] **TERM-05**: Loading states on all async operations
- [ ] **TERM-06**: Keyboard navigation works throughout app

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Collaboration

- **COLLAB-01**: Real-time multi-user editing
- **COLLAB-02**: Shared project access with permissions

### Mobile Enhancements

- **MOBILE-01**: PWA with offline support
- **MOBILE-02**: Touch-optimized interactions

### Advanced AI

- **ADV-01**: Local model support (WebGPU/WASM)
- **ADV-02**: Model fine-tuning interface

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time collaboration | High complexity, not core to solo IDE value |
| Native mobile app | Web-first, PWA sufficient for mobile |
| Self-hosted AI models | BYOK to external providers keeps complexity low |
| Video/audio in chat | Text, code, and images cover core use cases |
| Server-side storage | Violates privacy-first architecture |
| OAuth login | No accounts needed — everything is local |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PREP-01 | Phase -1 | Pending |
| PREP-02 | Phase -1 | Pending |
| CLEAN-01 | Phase 0 | Pending |
| CLEAN-02 | Phase 0 | Pending |
| CLEAN-03 | Phase 0 | Pending |
| CLEAN-04 | Phase 0 | Pending |
| CLEAN-05 | Phase 0 | Pending |
| PLAT-01 | Phase 1 | Complete |
| PLAT-02 | Phase 1 | Complete |
| PLAT-03 | Phase 1 | Complete |
| PLAT-04 | Phase 1 | Complete |
| PLAT-05 | Phase 1 | Complete |
| PLAT-06 | Phase 1 | Complete |
| PLAT-07 | Phase 1 | Complete |
| PLAT-08 | Phase 1 | Complete |
| PLAT-09 | Phase 1 | Complete |
| PLAT-10 | Phase 1 | Complete |
| AI-01 | Phase 2 | Pending |
| AI-02 | Phase 2 | Pending |
| AI-03 | Phase 2 | Pending |
| AI-04 | Phase 2 | Pending |
| AI-05 | Phase 2 | Pending |
| AI-06 | Phase 2 | Pending |
| AI-07 | Phase 2 | Pending |
| MOD-01 | Phase 3 | Pending |
| MOD-02 | Phase 3 | Pending |
| MOD-03 | Phase 3 | Pending |
| MOD-04 | Phase 3 | Pending |
| MOD-05 | Phase 3 | Pending |
| MOD-06 | Phase 3 | Pending |
| RAG-01 | Phase 4 | Pending |
| RAG-02 | Phase 4 | Pending |
| RAG-03 | Phase 4 | Pending |
| RAG-04 | Phase 4 | Pending |
| RAG-05 | Phase 4 | Pending |
| TERM-01 | Phase 5 | Pending |
| TERM-02 | Phase 5 | Pending |
| TERM-03 | Phase 5 | Pending |
| TERM-04 | Phase 5 | Pending |
| TERM-05 | Phase 5 | Pending |
| TERM-06 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-01*
*Last updated: 2026-02-01 after GSD initialization*
