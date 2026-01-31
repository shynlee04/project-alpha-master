# Sprint Change Proposal: Multimodal Chat & Architecture Unification
**Generated:** 2026-01-09T21:45:00+07:00
**Trigger:** Critical gaps identified in chat architecture, multimodality, and UI consistency
**Severity:** HIGH
**Status:** DRAFT - PENDING APPROVAL

---

## Executive Summary

This Sprint Change Proposal addresses critical architectural gaps discovered through comprehensive research across six major areas:

1. **Dual Chat Systems Fragmentation** - Two separate chat implementations create UX confusion and technical debt
2. **Multimodality Integration** - Gemini 2026 API + TanStack AI integration for images, audio, video, documents
3. **Page Context Understanding** - Enhanced prompt injection and multi-step transformations
4. **RAG Implementation Gaps** - Missing code-aware chunking, image indexing, and context window management
5. **UX/UI Consistency Issues** - Z-index stacking, flexbox failures, theme inconsistencies
6. **Note Block Rendering Gaps** - Missing URL embeds, Monaco integration, rich previews

**Recommended Approach:** Create a new epic (EPIC-40: Multimodal Chat Unification) with 12 stories spanning ~52 hours of effort.

---

## Section 1: Issue Summary

### 1.1 Discovery Method

Research conducted via:
- **ado-research** workflow for chat systems architecture
- **deep-research** workflow for multimodality integration
- **comprehensive codebase exploration** for RAG, page context, note blocks
- **UX/UI visual analysis** of provided screenshot

### 1.2 Core Issues Identified

| Category | Issue | Impact | Severity |
|----------|-------|--------|----------|
| **Chat** | Two separate chat systems with no shared state | User confusion, technical debt | P0 |
| **Chat** | Thread management disconnect between systems | Inconsistent experience | P0 |
| **Chat** | Tool execution silos (one has tools, one doesn't) | Feature fragmentation | P0 |
| **Multimodal** | No Gemini 2026 integration for images/audio/video | Missing AI capabilities | P0 |
| **Multimodal** | No bidirectional multimodality (input + output) | Limited AI interactions | P1 |
| **Context** | No story continuation infrastructure | Creative AI limitations | P1 |
| **Context** | Incomplete selection tracking | Targeted operations fail | P1 |
| **RAG** | No context window management | Potential overflow | P0 |
| **RAG** | No code-aware chunking | Poor code search | P1 |
| **RAG** | Images not indexed | Visual content inaccessible | P1 |
| **UX** | Z-index issue blocks chat input area | Interaction blocker | P0 |
| **UX** | Flexbox overflow clips navigation buttons | Broken layout | P1 |
| **UX** | Inconsistent theme (blue vs orange) | Design violations | P2 |
| **Notes** | No URL embedding in notes | Missing core feature | P1 |
| **Notes** | No Monaco editor integration | Subpar code editing | P1 |

### 1.3 Evidence

**Chat Systems Fragmentation:**
- System 1: `src/infrastructure/persistence/stores/conversation/` - Thread-based, no tools
- System 2: `src/presentation/components/ide/AgentChatPanel.tsx` - Agent-centric, full tools
- Different thread management, different UI patterns, no shared state

**Multimodality Gaps:**
- `@tanstack/ai` and `@tanstack/ai-gemini` packages installed but not fully utilized
- Existing `buildMultimodalMessage()` function only handles text+images
- No audio/video input or output handling
- No sequential image prompting workflow

**UX/UI Issues (from screenshot analysis):**
- Bottom right: "Sync Status" panel covers chat input area (z-index issue)
- Middle column top: "AI Search" button clipped by flexbox overflow
- Inconsistent blue buttons ("Capture", "Clear") in orange theme

---

## Section 2: Impact Analysis

### 2.1 Epic Impact

| Epic | Impact Type | Description |
|------|-------------|-------------|
| **EPIC-FS** | BLOCKED | FS-06 (Unified CRUD) cannot proceed without unified chat architecture |
| **EPIC-39** | SCOPE EXPANSION | 8-bit design fixes must include z-index and flexbox corrections |
| **EPIC-40** | NEW EPIC | New epic required for multimodal chat unification |

### 2.2 Story Impact

**Affected Current Stories:**
- **FS-06** (Unified CRUD Operations) - DEPENDS ON chat unification
- **39-01** (8-bit Design Audit) - MUST include z-index/flexbox fixes
- **39-02** (Mobile-Friendly Redesign) - MUST address responsive failures

**New Stories Required:**
- 12 stories across multimodal integration, chat unification, and RAG enhancements

### 2.3 Artifact Conflicts

| Artifact | Conflict | Resolution Required |
|----------|----------|---------------------|
| `architecture.md` | No multimodal architecture documented | Add multimodal section |
| `epics.md` | EPIC-40 not defined | Create EPIC-40 definition |
| `ux-specification.md` | Z-index/flexbox patterns missing | Add layout stability section |
| `sprint-status.yaml` | New epic not tracked | Add EPIC-40 to active epics |

### 2.4 Technical Impact

**Code Changes Required:**
- **7 new files** for multimodal integration (image/audio/video handlers)
- **5 files modified** for chat system unification
- **4 files modified** for UX consistency fixes
- **3 new files** for enhanced note blocks (URL, Monaco, embeds)
- **Estimated:** ~2,500 lines of new/modified code

**Infrastructure Changes:**
- Extend `CredentialVault` for Gemini 2026 API keys
- Add model registry for modality-specific models
- Implement context window manager for RAG
- Create unified chat store combining both systems

---

## Section 3: Recommended Approach

### 3.1 Chosen Path: **New Epic with Parallel Execution**

**Rationale:**
1. Scope is too large for "direct adjustment" - requires new architecture
2. No rollback needed - adding new capabilities, not fixing broken ones
3. MVP scope should be expanded to include multimodal chat as differentiator

**Effort Estimate:**
- **Total:** ~52 hours across 12 stories
- **Risk:** MEDIUM (new API integrations, architectural unification)
- **Timeline Impact:** +2 weeks to current sprint

### 3.2 Execution Strategy

**Track A: Chat Unification (Foundation)**
```
MM-01: Unify chat stores → MM-02: Merge thread management → MM-03: Tool execution unification
Estimated: 12 hours (3 stories)
Dependencies: None (can run parallel with Track B)
```

**Track B: Multimodal Integration (New Capabilities)**
```
MM-04: Gemini 2026 integration → MM-05: Image input/output → MM-06: Audio/video support → MM-07: Document processing
Estimated: 20 hours (4 stories)
Dependencies: MM-01 (unified store)
```

**Track C: RAG Enhancements (Context)**
```
MM-08: Context window manager → MM-09: Code-aware chunking → MM-10: Image indexing
Estimated: 10 hours (3 stories)
Dependencies: None (can run parallel)
```

**Track D: UX & Notes (Polish)**
```
MM-11: Fix z-index/flexbox issues → MM-12: Enhanced note blocks
Estimated: 10 hours (2 stories)
Dependencies: None (can run parallel)
```

---

## Section 4: Detailed Change Proposals

### 4.1 New Epic: EPIC-40 (Multimodal Chat Unification)

**OLD:** (EPIC-40 does not exist)

**NEW:**
```markdown
# EPIC-40: Multimodal Chat Unification

## Overview
Unify dual chat systems and integrate Gemini 2026 multimodal capabilities for images, audio, video, and documents.

## Stories
- MM-01: Create unified chat store (4h)
- MM-02: Merge thread management systems (3h)
- MM-03: Unify tool execution across chat systems (5h)
- MM-04: Integrate Gemini 2026 Flash/Pro APIs (6h)
- MM-05: Implement image input/output (5h)
- MM-06: Implement audio/video I/O (5h)
- MM-07: Implement document processing (4h)
- MM-08: Add context window manager (3h)
- MM-09: Implement code-aware chunking (4h)
- MM-10: Implement image indexing for RAG (3h)
- MM-11: Fix z-index and flexbox issues (5h)
- MM-12: Add enhanced note blocks (5h)

## Dependencies
- Requires: EPIC-FS completion (for workspace foundations)
- Blocks: None (enables future epics)

## Success Criteria
- Single unified chat interface
- Full multimodal support (text, images, audio, video, documents)
- Context window never overflows
- All UX bugs resolved
```

**Rationale:** Dual chat systems are causing user confusion and technical debt. Unification is required before FS-06 can proceed. Multimodal capabilities are competitive differentiator.

---

### 4.2 Story Changes

#### MM-01: Create Unified Chat Store

**OLD:** (does not exist)

**NEW:**
```yaml
id: MM-01
title: Create unified chat store
effort: 4h
priority: P0
description: |
  Create a new Zustand store that unifies the two existing chat systems:
  - Combine useConversationStore and AgentChatPanel state
  - Support both hierarchical threads and flat conversations
  - Include tool execution capabilities
  - Maintain IndexedDB persistence

files_created:
  - src/infrastructure/persistence/stores/chat/unified-chat-store.ts

files_modified:
  - src/infrastructure/persistence/stores/conversation/useConversationStore.ts
  - src/presentation/components/ide/AgentChatPanel.tsx

acceptance_criteria:
  - Single source of truth for chat state
  - Thread hierarchy preserved from System 1
  - Tool execution from System 2 functional
  - Zero data loss during migration
```

**Rationale:** Foundation for all other chat improvements. Without unified store, other changes create more fragmentation.

---

#### MM-04: Integrate Gemini 2026 APIs

**OLD:** (does not exist)

**NEW:**
```yaml
id: MM-04
title: Integrate Gemini 2026 Flash/Pro APIs
effort: 6h
priority: P0
description: |
  Add Gemini 2.5 Flash/Pro model support to the AI provider system:
  - Register gemini-2.5-flash and gemini-2.5-pro models
  - Add modality-specific model selection
  - Implement 1M token context support
  - Add thinking token cost management

files_created:
  - src/lib/agent/providers/gemini-2-provider.ts
  - src/lib/agent/providers/gemini-model-registry.ts

files_modified:
  - src/lib/agent/providers/ProviderAdapterFactory.ts
  - src/infrastructure/persistence/stores/provider/provider-crud-slice.ts

acceptance_criteria:
  - Gemini 2.5 models selectable in provider dropdown
  - Correct model chosen for each modality
  - 1M token context utilized when available
  - API keys stored in CredentialVault
```

**Rationale:** Gemini 2.5 Flash is the most cost-effective multimodal model. Required for all subsequent multimodal features.

---

#### MM-11: Fix Z-Index and Flexbox Issues

**OLD:** (does not exist)

**NEW:**
```yaml
id: MM-11
title: Fix z-index and flexbox issues
effort: 5h
priority: P0
description: |
  Fix critical UX issues identified in screenshot analysis:
  - Fix z-index: Sync Status panel covers chat input
  - Fix flexbox overflow: Navigation buttons clipped
  - Fix theme inconsistency: Replace blue with orange
  - Add proper text overflow handling with ellipsis

files_modified:
  - src/presentation/components/notes/NotesPage.tsx
  - src/presentation/components/ide/IDEMobileLayout.tsx
  - src/presentation/components/ide/AgentChatPanel.tsx

acceptance_criteria:
  - Chat input area fully accessible (not covered)
  - Navigation buttons visible and clickable
  - All buttons use 8-bit orange theme (no blue)
  - Long text shows ellipsis with tooltips
  - Resizing panels doesn't break layout
```

**Rationale:** These are P0 UX bugs that actively block user interaction. The sync panel covering the chat input makes the app unusable.

---

### 4.3 PRD Modifications

**Section to Add:** `## Multimodal Capabilities`

**OLD:** (section does not exist)

**NEW:**
```markdown
## Multimodal Capabilities

### Input Modalities
Users can interact with AI agents using:
- **Text:** Traditional chat input (existing)
- **Images:** Paste, drag-drop, or capture for analysis/generation
- **Audio:** Voice input via microphone (speech-to-text)
- **Video:** Video file upload for analysis
- **Documents:** PDF, DOCX, and other document types for RAG

### Output Modalities
AI agents can generate:
- **Text:** Standard responses (existing)
- **Images:** Generate, edit, or transform images
- **Audio:** Text-to-speech responses in multiple voices
- **Code:** Syntax-highlighted code blocks with language detection

### Use Cases
1. **Visual Storytelling:** User uploads image → AI suggests continuation → AI generates next scene
2. **Code Explanation:** User pastes code → AI explains with syntax highlighting
3. **Voice Chat:** User speaks → AI responds with voice
4. **Document Q&A:** User uploads PDF → AI answers questions about content
```

**Rationale:** PRD currently silent on multimodal capabilities. This section defines the vision for implementation.

---

### 4.4 Architecture Changes

**Section to Add:** `## Multimodal Architecture`

**NEW:**
```markdown
## Multimodal Architecture

### Modality Pipeline
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  Input      │ -> │  Detector    │ -> │  Processor  │
│  (Mixed)    │    │  (Type)      │    │  (Specific) │
└─────────────┘    └──────────────┘    └─────────────┘
                                                │
                                                v
┌─────────────────────────────────────────────────────┐
│                Embedding / Analysis                  │
│  Text -> 384-dim | Image -> Vision | Audio -> Whisper │
└────────────┬────────────────────────────────────────┘
             │
             v
┌─────────────────────────────────────────────────────┐
│                    Unified Chat Store               │
│  - Thread management  - Tool execution  - Context    │
└────────────┬────────────────────────────────────────┘
             │
             v
┌─────────────────────────────────────────────────────┐
│                      AI Provider                     │
│  Gemini 2.5 Flash | Gemini 2.5 Pro | Other models    │
└────────────┬────────────────────────────────────────┘
             │
             v
┌─────────────────────────────────────────────────────┐
│                   Response Builder                   │
│  Text output | Image generation | Audio synthesis    │
└─────────────────────────────────────────────────────┘
```

### Model Selection
| Modality | Primary Model | Fallback |
|----------|---------------|----------|
| Text-only | gemini-2.5-flash | gpt-4o-mini |
| Image input | gemini-2.5-flash-vision | gpt-4o |
| Image output | gemini-2.5-flash-image | dall-e-3 |
| Audio input | whisper-1 | None |
| Audio output | gemini-2.5-flash-live | elevenlabs |
| Document | gemini-2.5-flash | None |
```

**Rationale:** Architecture documentation needs multimodal pipeline definition for implementation guidance.

---

### 4.5 UI/UX Specification Updates

**Section to Add:** `## Layout Stability Guidelines`

**NEW:**
```markdown
## Layout Stability Guidelines

### Z-Index Rules
All floating/overlay elements MUST declare explicit z-index values:

| Layer | Z-Index | Examples |
|-------|---------|----------|
| Base | 0 | Background, static content |
| Content | 10 | Panels, lists, cards |
| Overlays | 100 | Dropdowns, tooltips |
| Modals | 1000 | Dialogs, sheets |
| Toast | 2000 | Notifications |

**Rule:** Never use `z-index: auto` on positioned elements that may overlap.

### Flexbox Overflow Handling
All navigation bars with dynamic content MUST implement ONE of:
1. `overflow-x: auto` with scroll indicators
2. `flex-wrap: wrap` with min-width constraints
3. Icon-only mode below breakpoint

**Rule:** Never let flex children overflow their container.

### Text Overflow
All text that may exceed container MUST use:
```css
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```
With tooltip on hover showing full text.

**Rule:** Truncate, never clip text.
```

**Rationale:** Current UX spec lacks layout stability rules. These additions prevent the z-index and flexbox issues found in the screenshot.

---

## Section 5: Implementation Handoff

### 5.1 Change Scope Classification: **MODERATE**

**Rationale:**
- Requires backlog reorganization (new epic, 12 stories)
- Requires PO/SM coordination for sprint planning
- NOT a fundamental replan (architecture stable, adding capabilities)

### 5.2 Handoff Recipients

| Role | Responsibility |
|------|----------------|
| **Product Owner** | Approve EPIC-40, prioritize stories within sprint |
| **Scrum Master** | Create sprint plan with 4 parallel tracks |
| **Solution Architect** | Review multimodal architecture, approve unification approach |
| **Development Team** | Implement stories following defined tracks |
| **QA** | Test multimodal flows across input/output combinations |

### 5.3 Success Criteria

**EPIC-40 Success Criteria:**
1. [ ] Single unified chat interface (no more dual systems)
2. [ ] All 5 input modalities working (text, image, audio, video, document)
3. [ ] All 4 output modalities working (text, image, audio, code)
4. [ ] Context window manager prevents overflow
5. [ ] All z-index/flexbox issues resolved
6. [ ] Enhanced note blocks (URL, Monaco, embeds) functional
7. [ ] Zero TypeScript errors
8. [ ] E2E tests for critical multimodal flows

---

## Section 6: Dependencies and Risks

### 6.1 Cross-Epic Dependencies

```
EPIC-FS (File System Foundation) - 28.6% complete
  ↓ enables
EPIC-40 (Multimodal Chat Unification) - NEW
  ↓ enables
FS-06 (Unified CRUD) - BLOCKED until EPIC-40 MM-01
  ↓ enables
Future epics requiring unified chat context
```

### 6.2 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Gemini 2026 API changes | Medium | High | Version pin adapters, fallback to older models |
| Chat migration data loss | Low | Critical | Comprehensive migration tests, backup strategy |
| Context window overflow | Medium | Medium | Implement manager before multimodal (MM-08 before MM-04) |
| Performance degradation | Medium | Medium | Load test with 10K+ document indexes |

---

## Section 7: Artifacts Created

During this correct-course workflow, the following artifacts were created:

| Artifact | Location | Description |
|----------|----------|-------------|
| Chat Systems Research | `_bmad-output/research/chat-systems-research-2026-01-09.md` | Analysis of dual chat systems |
| Multimodal Research | `_bmad-output/research/gemini-2026-multimodal-research-2026-01-09.md` | Gemini 2026 integration guide |
| RAG Research | `_bmad-output/research/rag-implementation-research-2026-01-09.md` | RAG gaps and recommendations |
| Page Context Research | `_bmad-output/research/page-context-research-2026-01-09.md` | Context understanding analysis |
| Note Blocks Research | `_bmad-output/research/note-blocks-research-2026-01-09.md` | Note rendering analysis |
| UX Analysis | Embedded in proposal | Screenshot analysis findings |

---

## Section 8: Next Steps

### 8.1 Immediate Actions

1. **Review this proposal** - User approval required
2. **Create EPIC-40 definition** - Add to `_bmad-output/planning-artifacts/epics.md`
3. **Generate individual story files** - For MM-01 through MM-12
4. **Update sprint-status.yaml** - Add EPIC-40 to active epics

### 8.2 Sprint Planning Handoff

After approval, route to: `/bmad:bmm:workflows:sprint-planning`

With context:
- New epic EPIC-40 with 12 stories
- 4 parallel execution tracks
- ~52 hours total effort
- 2-week timeline recommendation

---

## Appendix A: Research Findings Summary

### A.1 Chat Systems Architecture

**System 1: Cross-Workspace Threaded Chat**
- Location: `src/infrastructure/persistence/stores/conversation/`
- Features: Hierarchical threads, cross-workspace sharing, IndexedDB persistence
- Limitation: No tool execution

**System 2: Agent-Centric Chat**
- Location: `src/presentation/components/ide/AgentChatPanel.tsx`
- Features: Tool execution with approval, workspace-specific capabilities
- Limitation: Flat conversations, no thread hierarchy

**Unification Strategy:** Combine thread management from System 1 with tool execution from System 2 into a unified store.

### A.2 Multimodality Integration

**Gemini 2.5 Capabilities:**
- 1M token context window
- Image generation at $0.039/image
- Live API for real-time audio/video
- Multi-image fusion for character consistency

**TanStack AI Integration:**
- Packages already installed (`@tanstack/ai`, `@tanstack/ai-gemini`)
- Clean adapter pattern with `gemini({ apiKey })`
- Streaming support via `toStreamResponse()`

**Implementation Gaps:**
- No audio/video input handling
- No sequential image prompting
- No story continuation infrastructure

### A.3 RAG Implementation

**Current State:**
- Hybrid embedding (local Xenova + cloud Gemini)
- Orama vector store with IndexedDB
- Multiple chunking strategies

**Gaps:**
- No context window management (potential overflow)
- No code-aware chunking
- Images not indexed for search
- Inconsistent chunk units (characters vs tokens)

### A.4 Page Context Understanding

**Strengths:**
- 5-layer prompt composer
- Active note tracking with RAG
- Token-aware context injection

**Gaps:**
- Story continuation infrastructure missing
- Selection tracking incomplete
- LLM summarization not implemented

### A.5 UX/UI Issues

**Critical (P0):**
- Z-index: Sync Status panel covers chat input
- Interaction blocked in bottom-right corner

**High (P1):**
- Flexbox: Navigation buttons clipped
- Theme: Blue buttons in orange theme

**Medium (P2):**
- Tab hierarchy confusion
- Inconsistent spacing

### A.6 Note Block Rendering

**Existing:**
- Code blocks with syntax highlighting
- Image blocks (URL-based)
- File attachment blocks

**Missing:**
- URL embedding in notes
- Monaco editor integration
- Rich URL previews
- Image gallery view

---

**Document Version:** 1.0
**Generated by:** BMAD Correct-Course Workflow
**Workflow ID:** correct-course-2026-01-09
**Status:** PENDING USER APPROVAL
