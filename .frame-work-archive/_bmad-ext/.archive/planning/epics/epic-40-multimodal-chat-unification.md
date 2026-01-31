---
title: "EPIC-40: Multimodal Chat Unification"
type: "legacy-epic"
archived_by: "MASTERCORDINATION-SESSION-2026-01-26"
archived_date: "2026-01-26"
original_path: "/bmad-output/planning-artifacts/epics/epic-40-multimodal-chat-unification.md"
archive_path: "/bmad-ext/.archive/planning/epics/"
duplicate_of: "None"
superseded_by: "Unknown"
reason: "Legacy epic from 2026-01-10. Status unclear. Archived pending investigation into relevance to Phase 2 (Chat Cascade + Agents)."
status: "LEGACY"
---
# EPIC-40: Multimodal Chat Unification

**Document ID**: EPI-40
**Version**: 1.0.0
**Created**: 2026-01-09T23:50:00+07:00
**Status**: APPROVED - Ready for Sprint Planning
**Priority**: P0 (Critical - Blocks EPIC-FS completion)
**Estimated Effort**: ~52 hours
**Stories**: 12
**Dependencies**: EPIC-FS (28.6% complete)
**Research Source**: Team A + Team B Sprint Planning Proposals (2026-01-09)

---

## Executive Summary

This epic unifies the fragmented chat architecture and integrates full multimodal capabilities for Via-Gent. It addresses critical gaps discovered by two parallel research teams:

- **Team A** identified voice I/O gaps and note block rendering issues
- **Team B** identified dual chat system fragmentation and UX blockers

**Merged Scope**: 12 stories across 4 parallel execution tracks.

---

## Business Value

1. **Unified Chat Experience** - Single chat interface across all workspaces
2. **Voice Interaction** - Speak to agents, agents respond with voice
3. **Full Multimodality** - Text, images, audio, video, documents
4. **UX Fixes** - Z-index and flexbox issues resolved (P0 blockers)
5. **Enhanced Notes** - Code, image, and embed block rendering

---

## Success Criteria

- [ ] Single unified chat interface (no dual systems)
- [ ] Voice input/output functional in all workspaces
- [ ] Gemini 2.5 Flash/Pro integrated with full modality support
- [ ] Context window manager prevents token overflow
- [ ] All z-index/flexbox UX issues resolved
- [ ] Note blocks render code, images, and embeds
- [ ] Zero TypeScript errors
- [ ] E2E tests for critical multimodal flows

---

## Story Breakdown

### Track A: Chat Unification (Foundation)
**Dependencies**: None (can start immediately)
**Estimated Effort**: 12 hours

| ID | Title | Effort | Priority | ADR Reference |
|----|-------|--------|----------|---------------|
| **MM-01** | Create unified chat store | 4h | P0 | ADR-031 |
| **MM-02** | Merge thread management systems | 3h | P0 | ADR-031 |
| **MM-03** | Unify tool execution across chat systems | 5h | P0 | ADR-031 |

### Track B: Multimodal Integration
**Dependencies**: MM-01 (Unified Store)
**Estimated Effort**: 20 hours

| ID | Title | Effort | Priority | ADR Reference |
|----|-------|--------|----------|---------------|
| **MM-04** | Integrate Gemini 2.5 Flash/Pro APIs | 6h | P0 | ADR-030 |
| **MM-05** | Implement voice input tool (Whisper) | 4h | P0 | ADR-030 |
| **MM-06** | Implement voice output tool (TTS) | 4h | P0 | ADR-030 |
| **MM-07** | Create voice input hook | 3h | P1 | ADR-030 |
| **MM-08** | Create voice output hook | 3h | P1 | ADR-030 |

### Track C: RAG Enhancements
**Dependencies**: None (can run parallel)
**Estimated Effort**: 10 hours

| ID | Title | Effort | Priority | ADR Reference |
|----|-------|--------|----------|---------------|
| **MM-09** | Add context window manager | 4h | P0 | ADR-030 |
| **MM-10** | Implement code-aware chunking | 3h | P1 | - |
| **NC-01** | Note code block renderer (Monaco) | 3h | P1 | - |

### Track D: UX & Notes Polish
**Dependencies**: None (can run parallel)
**Estimated Effort**: 10 hours

| ID | Title | Effort | Priority | UX Spec Section |
|----|-------|--------|----------|-----------------|
| **MM-11** | Fix z-index and flexbox issues | 5h | P0 | Layout Stability |
| **MM-12** | Note embed block renderer | 3h | P2 | Note Blocks |
| **NC-02** | Note image block renderer | 2h | P1 | Note Blocks |

---

## Story Details

### MM-01: Create Unified Chat Store

**Epic**: EPIC-40 (Multimodal Chat Unification)
**Track**: A (Chat Unification)
**Priority**: P0 (Critical)
**Effort**: 4 hours
**Dependencies**: None

**Description**:
Create a new Zustand store that unifies the two existing chat systems:
- Combine `useConversationStore` (thread hierarchy) and `AgentChatPanel` state (tool execution)
- Support both hierarchical threads and flat conversations
- Include tool execution capabilities with approval flow
- Maintain IndexedDB persistence via Dexie

**Files Created**:
- `src/infrastructure/persistence/stores/chat/unified-chat-store.ts`
- `src/infrastructure/persistence/stores/chat/types.ts`

**Files Modified**:
- `src/infrastructure/persistence/stores/conversation/useConversationStore.ts` (deprecate)
- `src/presentation/components/ide/AgentChatPanel.tsx` (delegate to unified)

**Acceptance Criteria**:
- [ ] Single source of truth for chat state
- [ ] Thread hierarchy preserved from System A
- [ ] Tool execution from System B functional
- [ ] Zero data loss during migration
- [ ] IndexedDB persistence working
- [ ] TypeScript: Zero errors

---

### MM-04: Integrate Gemini 2.5 Flash/Pro APIs

**Epic**: EPIC-40 (Multimodal Chat Unification)
**Track**: B (Multimodal Integration)
**Priority**: P0 (Critical)
**Effort**: 6 hours
**Dependencies**: MM-01

**Description**:
Add Gemini 2.5 Flash/Pro model support to the AI provider system:
- Register `gemini-2.5-flash` and `gemini-2.5-pro` models in model registry
- Implement modality-specific model selection (text vs image vs audio)
- Enable 1M token context support for extended conversations
- Add thinking token cost management for `gemini-2.5-flash-thinking`

**Files Created**:
- `src/lib/agent/providers/gemini-2026-provider.ts`
- `src/lib/agent/providers/gemini-model-registry.ts`

**Files Modified**:
- `src/lib/agent/providers/ProviderAdapterFactory.ts`
- `src/infrastructure/persistence/stores/provider/provider-crud-slice.ts`

**Acceptance Criteria**:
- [ ] Gemini 2.5 models selectable in provider dropdown
- [ ] Correct model chosen for each modality (see ADR-030)
- [ ] 1M token context utilized when available
- [ ] API keys stored in CredentialVault
- [ ] Streaming responses functional
- [ ] TypeScript: Zero errors

---

### MM-11: Fix Z-Index and Flexbox Issues

**Epic**: EPIC-40 (Multimodal Chat Unification)
**Track**: D (UX & Notes)
**Priority**: P0 (Critical - UX Blocker)
**Effort**: 5 hours
**Dependencies**: None

**Description**:
Fix critical UX issues identified in screenshot analysis by Team B:
- Z-index issue: Sync Status panel covers chat input area
- Flexbox overflow: Navigation buttons clipped
- Theme inconsistency: Blue buttons in orange 8-bit theme
- Text overflow: Missing ellipsis and tooltips

**Files Modified**:
- `src/presentation/components/notes/NotesPage.tsx`
- `src/presentation/components/ide/IDEMobileLayout.tsx`
- `src/presentation/components/ide/AgentChatPanel.tsx`
- `src/styles/global.css` (add z-index documentation)

**Acceptance Criteria**:
- [ ] Chat input area fully accessible (not covered by overlays)
- [ ] Navigation buttons visible and clickable
- [ ] All buttons use 8-bit orange theme (no blue)
- [ ] Long text shows ellipsis with hover tooltips
- [ ] Resizing panels doesn't break layout
- [ ] Mobile layout tested on real devices

---

## Parallel Execution Strategy

```
Week 1 (Day 1-5)
================
┌─────────────────────────────────────────────────────────────────────┐
│ TEAM A (Platform A: Claude Code)                                    │
│ ────────────────────────────────────────────────────────────────── │
│ Track A: Chat Unification                                           │
│   Day 1-2: MM-01 (Unified Store) [4h]                              │
│   Day 2-3: MM-02 (Thread Mgmt) [3h]                                │
│   Day 3-4: MM-03 (Tool Unification) [5h]                           │
│ ────────────────────────────────────────────────────────────────── │
│ Track C: RAG (after Track A)                                        │
│   Day 4-5: MM-09 (Context Window Manager) [4h]                     │
│   Day 5: NC-01 (Code Block Renderer) [3h]                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ TEAM B (Platform B: OpenCode)                                       │
│ ────────────────────────────────────────────────────────────────── │
│ Track D: UX & Notes (Parallel with Track A)                         │
│   Day 1: MM-11 (Z-Index/Flexbox Fixes) [5h] ⚠️ P0 BLOCKER          │
│   Day 2: NC-02 (Image Block Renderer) [2h]                         │
│   Day 2-3: MM-12 (Embed Block Renderer) [3h]                       │
│ ────────────────────────────────────────────────────────────────── │
│ Track B: Multimodal (after MM-01 completes)                         │
│   Day 3: MM-04 (Gemini 2.5 Integration) [6h]                       │
│   Day 4: MM-05 (Voice Input Tool) [4h]                             │
│   Day 4-5: MM-06 (Voice Output Tool) [4h]                          │
│   Day 5: MM-07, MM-08 (Voice Hooks) [6h]                           │
└─────────────────────────────────────────────────────────────────────┘

Week 2 (Day 1-2)
================
- Integration testing
- E2E test execution
- Code review consolidation
- Documentation updates
```

---

## Dependencies

### Internal Dependencies
```
EPIC-FS (28.6% complete)
    ↓ enables
EPIC-40 (Multimodal Chat Unification) ← THIS EPIC
    ↓ enables
FS-06 (Unified CRUD) - BLOCKED until MM-01
    ↓ enables
Future epics requiring unified chat context
```

### Cross-Story Dependencies
```
MM-01 (Unified Store)
    ↓ required by
MM-02, MM-03, MM-04, MM-05, MM-06

MM-09 (Context Window Manager)
    ↓ required by
MM-04 (Gemini Integration) - for token management
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Gemini 2.5 API changes | Medium | High | Version pin adapters, fallback to 1.5 |
| Chat migration data loss | Low | Critical | Comprehensive migration tests, backup |
| Context overflow | Medium | Medium | MM-09 before MM-04 |
| Voice permission denied | Medium | Low | Graceful fallback to text |
| Mobile audio issues | Medium | Medium | Test on real devices |

---

## Governance Compliance

### BMAD v6 Acknowledgment
```yaml
governance:
  constitution: "_bmad/modules/governance/CONSTITUTION.md"
  version: "1.0.0"
  acknowledged_at: "2026-01-09"
  acknowledged_by: "@bmad-core-bmad-master"
  compliance:
    artifact_lifecycle: true
    naming_convention: true
    stale_artifact_protocol: true
    multi_team_coordination: true
    read_only_templates: true
```

### Story Cycle Requirement
All stories in this epic MUST follow `_bmad/workflows/story-cycle/`:
1. 01-create-story.md
2. 02-validate-story.md
3. 03-create-context.md
4. 04-validate-context.md
5. 05-pre-planning.md
6. 06-dev-story.md
7. 07-code-review.md
8. 08-story-done.md
9. 09-retrospective.md

---

## Related Documents

- **ADR-030**: Multimodal Integration Architecture
- **ADR-031**: Chat System Unification
- **Team A Research**: `_bmad-output/research/2026-01-09/multimodality-chat-architecture/`
- **Team B Proposal**: `_bmad-output/sprint-artifacts/sprint-change-proposal-multimodal-chat-fix-2026-01-09.md`
- **Sprint Status**: `_bmad-output/sprint-artifacts/sprint-status.yaml`

---

**Document Version**: 1.0.0
**Status**: APPROVED - Ready for Sprint Planning
**Next Step**: Route to `/bmad-bmm-workflows-sprint-planning` for story file generation
