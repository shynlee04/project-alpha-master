---
story_key: "CHAT-009-artifact-rendering-system"
epic: "EPIC-CHAT"
story: 9
status: "done"
created_at: "2026-01-13T01:00:00+07:00"
version: "2.0"
points: 20
phase: 3
---

# CHAT-009: Implement Artifact Rendering System

## User Story

**As a** developer using AI-generated code in the chat
**I want** code artifacts to be properly rendered with preview and save capabilities across all chat interfaces
**So that** I can quickly review, test, and save AI-generated code regardless of which workspace I'm working in

### Epic Context

From **EPIC-CHAT: Unified Chat System Remediation**
- Epic Goal: Fix 7 critical problem areas in the chat system (Layout, Controls, Architecture, Thread Management, Input/Output, Design)
- This Story Supports: "Input/Output: Multi-line issues, no collapsible sections, poor artifact handling"
- Epic Progress: 41% complete (9/22 stories done)
- Phase: Phase 3 - Project Integration & Artifacts (Weeks 7-9, 50h effort)

## Acceptance Criteria

### AC-1: Integrate StreamdownRenderer into RAGChatPanel

**Given** the Knowledge workspace chat panel (RAGChatPanel)
**When** an AI response contains markdown or code blocks
**Then** the content is rendered with proper formatting using StreamdownRenderer

#### Implementation Hints
- File: `src/presentation/components/rag/RAGChatPanel.tsx`
- Replace simple text rendering with StreamdownRenderer
- Import: `import { StreamdownRenderer } from '@/presentation/components/chat/StreamdownRenderer'`
- Preserve citation marker functionality (split content, render citations)

#### Edge Cases to Handle
- Citation markers inside code blocks should not be parsed as citations
- Markdown tables should render correctly alongside citation markers
- Streaming responses should render incrementally

### AC-2: Add Artifact Preview Modal to RAGChatPanel

**Given** the Knowledge workspace chat panel
**When** a user clicks the preview button on a code block
**Then** the ArtifactPreviewModal opens showing syntax-highlighted code with live preview (for HTML/SVG)

#### Implementation Hints
- File: `src/presentation/components/rag/RAGChatPanel.tsx`
- Add state: `artifactPreview: { open, code, language, fileName }`
- Add preview handler that opens modal instead of new tab
- Import: `import { ArtifactPreviewModal } from '@/presentation/components/chat/ArtifactPreviewModal'`

#### Edge Cases to Handle
- Modal should close when user navigates away
- Large code blocks (>1000 lines) should not freeze rendering
- Mobile devices should show appropriate message for save feature

### AC-3: Add Artifact Save Handler to RAGChatPanel

**Given** the Knowledge workspace chat panel
**When** a user clicks the save button on a code block
**Then** the code is saved using the local file system adapter (with fallback to browser download)

#### Implementation Hints
- File: `src/presentation/components/rag/RAGChatPanel.tsx`
- Add onSaveArtifact handler that:
  1. Checks for localAdapterRef availability
  2. Prompts for file path (desktop) or downloads directly (mobile)
  3. Shows success/error toast

#### Edge Cases to Handle
- Mobile browsers should trigger download instead of file system prompt
- Save without permission should show user-friendly error message
- Large files (>100KB) should handle gracefully

## Deep Analysis

### Cross-Impact Mapping

| Workspace | Affected | Impact Level | Key Files |
|-----------|----------|--------------|-----------|
| IDE | ✅ | LOW | EnhancedChatInterface (already integrated) |
| Notes | ✅ | LOW | NoteSidebarChat (uses EnhancedChatInterface) |
| Knowledge | ✅ | HIGH | RAGChatPanel (needs full integration) |
| Study | ✅ | LOW | Would use same patterns as Knowledge |

#### Dependencies
- **Depends On**: CHAT-003 (8-bit design - completed)
- **Required By**: CHAT-010 (Save Chat to Project), CHAT-011 (Export Artifacts)

#### Architectural Impact
- **Layers Touched**: presentation (RAGChatPanel, maybe new shared component)
- **Clean Architecture**: ✅ COMPLIANT - presentation layer only
- **Potential Conflicts**: Citation marker parsing vs markdown code blocks

### Dead Code & Overlap Detection

#### Files to Check
- `src/presentation/components/rag/RAGChatPanel.tsx:118-143` - Simple text rendering to replace
- `src/presentation/components/ide/EnhancedChatInterface.tsx:100-106, 377-385` - Pattern to follow for artifact state
- `src/presentation/components/chat/StreamdownRenderer.tsx` - Already has artifact callbacks

#### Recommendations
- Extract artifact state management pattern to a custom hook (useArtifactPreview)
- Reuse ArtifactPreviewModal component (already exists)
- Follow EnhancedChatInterface pattern for consistency

### Current State Analysis

**What Exists:**
1. `ArtifactPreviewModal` component (456 lines) with full preview functionality
2. `StreamdownRenderer` component with code block rendering
3. `EnhancedChatInterface` has artifact preview integrated
4. `AgentChatPanel` uses EnhancedChatInterface (artifacts work in IDE)
5. `NoteSidebarChat` uses EnhancedChatInterface (artifacts work in Notes sidebar)

**What's Missing:**
1. `RAGChatPanel` uses simple text rendering - no markdown/code rendering
2. `RAGChatPanel` has no artifact preview modal integration
3. No shared hook for artifact state management (duplicated in EnhancedChatInterface)

**Code Evidence:**
```typescript
// RAGChatPanel.tsx:118-143 - Simple text rendering only
const renderMessageContent = (message: ChatMessage) => {
  const parts = message.content.split(/(\[\d+\])/g);
  // ... renders plain text with citation markers
}

// EnhancedChatInterface.tsx:100-106 - Artifact state pattern
const [artifactPreview, setArtifactPreview] = useState<{
  open: boolean
  code: string
  language: string
  fileName?: string
}>({ open: false, code: '', language: 'text' })
```

## Tasks

- [ ] T1: Create useArtifactPreview custom hook (refactor) - 2h
      Extracts artifact state management pattern for reuse across components
- [ ] T2: Add StreamdownRenderer to RAGChatPanel (implementation) - 3h
      Replace simple text rendering with markdown renderer
- [ ] T3: Add citation-aware markdown parsing (implementation) - 4h
      Parse citations outside code blocks, render markdown inside
- [ ] T4: Integrate ArtifactPreviewModal into RAGChatPanel (implementation) - 2h
      Add modal state, handlers, and component
- [ ] T5: Add save artifact handler to RAGChatPanel (implementation) - 2h
      Wire up save functionality with local adapter
- [ ] T6: Update EnhancedChatInterface to use useArtifactPreview hook (refactor) - 1h
      Refactor to use extracted hook
- [ ] T7: Add artifact preview to AgentChatPanel simple messages (implementation) - 2h
      Ensure all code blocks in agent chat have preview
- [ ] T8: Write unit tests for useArtifactPreview hook (testing) - 2h
- [ ] T9: Integration test RAGChatPanel artifact rendering (testing) - 2h
- [ ] T10: Run TypeScript validation and fix errors (validation) - 0.5h

## Research Requirements

### Required MCP Research
- [ ] **Context7**: React markdown parsing with citation markers
  - Query: "How to parse markdown with custom citation markers [1] outside code blocks"
  - Expected: Patterns for mixed markdown/citation parsing

### Codebase Analysis
- [ ] Review EnhancedChatInterface artifact state pattern
- [ ] Check StreamdownRenderer citation handling
- [ ] Verify RAGChatPanel citation marker format

## Architecture Patterns

### Patterns to Follow
- **Pattern**: Component State to Hook Extraction
  - Source: `CLAUDE.md` (custom hooks section)
  - Rationale: DRY - avoid duplicating artifact state in multiple components
  - Example: Extract `useState<{open, code, language}>` pattern to `useArtifactPreview()`

- **Pattern**: Citation-Aware Markdown Rendering
  - Source: RAGChatPanel existing citation parsing
  - Rationale: Preserve citation functionality while adding markdown
  - Implementation: Pre-process message to protect code blocks, then parse citations

### Constraints
- Component size: ≤300 lines (RAGChatPanel currently ~250 lines)
- Import order: React → 3rd party → @/ → Domain → Relative
- Styling: 8-bit design (0 or 2px border-radius)

## Dev Notes

### Integration Points
- **Touches**:
  - `src/presentation/components/rag/RAGChatPanel.tsx`
  - `src/presentation/hooks/useArtifactPreview.ts` (NEW)
  - `src/presentation/components/ide/EnhancedChatInterface.tsx` (refactor)
- **Breaks**: None - additive and refactoring
- **Shared With**: CHAT-010 (Save Chat), CHAT-011 (Export Artifacts)

### Technical Considerations
- Citation parsing conflict: Need to parse citations outside code blocks only
- StreamdownRenderer already supports onPreviewArtifact and onSaveArtifact callbacks
- ArtifactPreviewModal is 8-bit compliant, just needs integration
- Mobile save: Use browser download as fallback

### Implementation Strategy

#### Option A: Direct Integration (Simpler)
1. Add StreamdownRenderer to RAGChatPanel directly
2. Add artifact state inline (like EnhancedChatInterface)
3. Handle citations via pre-processing

#### Option B: Hook Extraction (Cleaner)
1. Create `useArtifactPreview` hook
2. Refactor EnhancedChatInterface to use hook
3. Add hook to RAGChatPanel

**Recommendation**: Option B for better maintainability and DRY

## References

- **Epic**: sprint-status.yaml#epic_chat_status
- **Architecture**: ADR-031 Chat System Unification
- **Related Stories**:
  - CHAT-003: 8-bit Design System (completed - artifact modal is 8-bit compliant)
  - CHAT-018: Workspace Component Fixes (completed)
  - CHAT-021: NoteSidebarChat Refactor (completed - shows EnhancedChatInterface pattern)

## Pre-Planning Gate Report

**Story:** CHAT-009-artifact-rendering-system
**Date:** 2026-01-13T01:00:00+07:00

### Research Summary
| Tool | Queries | Findings |
|------|---------|----------|
| Codebase | 4 | RAGChatPanel structure, EnhancedChatInterface pattern, StreamdownRenderer callbacks, ArtifactPreviewModal features |

### Standards Check
| Standard | Status | Notes |
|----------|--------|-------|
| Coding Style | ✅ | TypeScript strict, custom hooks pattern |
| Error Handling | ✅ | Try-catch for file ops, toast for errors |
| Architecture | ✅ | Clean Architecture: presentation layer only |
| Size Limits | ✅ | Components under limits, hook extraction planned |
| Import Pattern | ✅ | Follows CLAUDE.md import order |

### Implementation Plan

#### Files to Create
- [ ] `src/presentation/hooks/useArtifactPreview.ts` - Custom hook for artifact state

#### Files to Modify
- [ ] `src/presentation/components/rag/RAGChatPanel.tsx` - Add StreamdownRenderer + artifact modal
- [ ] `src/presentation/components/ide/EnhancedChatInterface.tsx` - Refactor to use hook
- [ ] `src/presentation/hooks/index.ts` - Export useArtifactPreview

#### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Citation parsing conflicts | MEDIUM | Pre-process to protect code blocks |
| Component size limits | LOW | Hook extraction reduces component size |
| TypeScript errors | LOW | Following existing patterns |

### Overall: ✅ PASS

Pre-planning gate passed. Ready for implementation.

## Dev Agent Record
*Populated during development phase*

## Code Review
*Populated during review phase*

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-11 | SM | From epic backlog |
| drafted | 2026-01-13T01:00:00+07:00 | SM | Story file created v2.0 |
| | | | |
| | | | |
