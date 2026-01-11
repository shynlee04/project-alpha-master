---
story_key: "CHAT-004-group-chat-controls"
epic: "EPIC-CHAT"
story: 4
status: "drafted"
created_at: "2026-01-13T02:30:00+07:00"
version: "2.0"
points: 13
phase: 1
---

# CHAT-004: Group Chat Controls by Use Case

## User Story

**As a** user working across different chat interfaces (IDE, Notes, Knowledge)
**I want** chat controls to be consistently organized by use case across all workspaces
**So that** I have a predictable and efficient interaction pattern regardless of which workspace I'm using

### Epic Context

From **EPIC-CHAT: Unified Chat System Remediation**
- Epic Goal: Fix 7 critical problem areas in the chat system (Layout, Controls, Architecture, Thread Management, Input/Output, Design)
- This Story Supports: "UX Cohesion: Controls scattered, not grouped by use case"
- Epic Progress: 50% complete (11/22 stories done)
- Phase: Phase 1 - Layout & Controls (Weeks 1-3, 30h effort)

## Acceptance Criteria

### AC-1: RAGChatPanel Uses ChatInputControls

**Given** the Knowledge workspace chat panel (RAGChatPanel)
**When** viewing the input area
**Then** the controls use the ChatInputControls component for consistency

#### Implementation Hints
- File: `src/presentation/components/rag/RAGChatPanel.tsx`
- Replace inline Input + Send button with ChatInputControls
- Keep header with Clear Chat button (separate use case - message management vs input)

#### Edge Cases to Handle
- RAGChatPanel doesn't use file attachments or voice - these should be hidden/disabled
- ChatInputControls should support a "minimal" mode for simpler chat interfaces

### AC-2: ChatInputControls Supports Minimal Mode

**Given** the ChatInputControls component
**When** used in contexts without file/voice support
**Then** it should render in minimal mode (textarea + send only)

#### Implementation Hints
- File: `src/presentation/components/chat/ChatInputControls.tsx`
- Add `showAttachments?: boolean` and `showVoice?: boolean` props
- Default to `true` for backward compatibility
- When `false`, hide those control groups

#### Edge Cases to Handle
- Visual balance when groups are hidden (center the input)
- Maintain proper spacing and borders

### AC-3: Control Groups are Visually Distinct

**Given** any chat interface using ChatInputControls
**When** viewing the input controls
**Then** controls are visually grouped by use case with clear separators

#### Implementation Hints
- Group 1: Input Enhancements (file, voice) - left, secondary
- Group 2: Primary Input (textarea) - center, flex-1
- Group 3: Send Action (send button) - right, primary CTA

#### Edge Cases to Handle
- Mobile responsive: groups may wrap or stack
- Empty states: maintain layout integrity

## Deep Analysis

### Cross-Impact Mapping

| Workspace | Affected | Impact Level | Key Files |
|-----------|----------|--------------|-----------||
| IDE | ✅ | LOW | EnhancedChatInterface (already compliant) |
| Notes | ✅ | LOW | NoteSidebarChat (uses EnhancedChatInterface) |
| Knowledge | ✅ | HIGH | RAGChatPanel (needs refactoring) |
| Study | ✅ | LOW | Would use RAGChatPanel pattern |

#### Dependencies
- **Depends On**: None (foundational UX story)
- **Required By**: CHAT-007 (Collapsible Sections), CHAT-017 (Mobile Optimization)

#### Architectural Impact
- **Layers Touched**: presentation (RAGChatPanel, ChatInputControls)
- **Clean Architecture**: ✅ COMPLIANT - presentation layer only
- **Potential Conflicts**: None - additive change with optional props

### Current State Analysis

**What Exists:**
1. `ChatInputControls` component (327 lines) with well-organized control groups
2. `EnhancedChatInterface` uses ChatInputControls - consistent
3. `NoteSidebarChat` uses EnhancedChatInterface - consistent (inherited)
4. `RAGChatPanel` has inline Input + Send button - inconsistent

**What's Missing:**
1. RAGChatPanel doesn't use ChatInputControls
2. ChatInputControls doesn't support "minimal" mode for simpler interfaces
3. No prop to hide file/voice controls when not needed

**Code Evidence:**
```typescript
// ChatInputControls.tsx - well-organized groups
// GROUP 1: INPUT ENHANCEMENTS (left, secondary)
<div className="flex items-center gap-2 pr-2 border-r border-border/50">
  <FileAttachmentInput />
  <VoiceButton />
</div>

// GROUP 2: PRIMARY INPUT (center, flex-1, prominent)
<div className="flex-1 min-w-0">
  <textarea />
</div>

// GROUP 3: SEND ACTION (right, primary CTA)
<div className="pl-2 border-l border-border/50">
  <Button type="submit"><Send /></Button>
</div>

// RAGChatPanel.tsx:296-318 - inline controls (inconsistent)
<div className="flex gap-2">
  <Input />  {/* Should use ChatInputControls */}
  <Button><Send /></Button>
</div>
```

## Tasks

- [ ] T1: Add minimal mode props to ChatInputControls (implementation) - 1h
      Add showAttachments and showVoice props with default true
- [ ] T2: Update ChatInputControls layout for minimal mode (implementation) - 2h
      Handle visual balance when groups are hidden
- [ ] T3: Refactor RAGChatPanel to use ChatInputControls (implementation) - 3h
      Replace inline Input + Send with ChatInputControls in minimal mode
- [ ] T4: Test control grouping across workspaces (testing) - 2h
      Verify IDE, Notes, Knowledge workspaces have consistent UX
- [ ] T5: TypeScript validation (validation) - 0.5h
- [ ] T6: Update documentation (documentation) - 0.5h

## Research Requirements

### Codebase Analysis
- [x] Review ChatInputControls component structure
- [x] Review RAGChatPanel current input implementation
- [x] Check all chat panels for control consistency

## Architecture Patterns

### Patterns to Follow
- **Pattern**: Component Composition with Optional Features
  - Rationale: Allow one component to serve multiple use cases
  - Implementation: Boolean props to hide optional feature groups
  - Example: `showAttachments={false}` hides file attachment input

### Constraints
- Component size: ≤350 lines (ChatInputControls currently 327 lines)
- Import order: React → 3rd party → @/ → Domain → Relative
- Styling: 8-bit design (0 or 2px border-radius)

## Dev Notes

### Integration Points
- **Touches**:
  - `src/presentation/components/chat/ChatInputControls.tsx` (add minimal mode)
  - `src/presentation/components/rag/RAGChatPanel.tsx` (use ChatInputControls)
- **Breaks**: None - backward compatible with default props
- **Shared With**: CHAT-007 (Collapsible Sections), CHAT-017 (Mobile Optimization)

### Technical Considerations
- ChatInputControls already has good visual grouping with borders
- Minimal mode should center the textarea when side groups are hidden
- Keep header controls (Clear Chat) separate from input controls (different use case)

### Implementation Strategy

1. Add optional props to ChatInputControls:
   - `showAttachments?: boolean` (default: true)
   - `showVoice?: boolean` (default: true)

2. Update layout logic:
   - When both are false: remove side borders, center textarea
   - When one is true: keep border on active side only

3. Refactor RAGChatPanel:
   - Import ChatInputControls
   - Replace inline input area
   - Pass `showAttachments={false} showVoice={false}`

## References

- **Epic**: sprint-status.yaml#epic_chat_status
- **Architecture**: ADR-031 Chat System Unification
- **Related Stories**:
  - CHAT-003: 8-bit Design System (completed)
  - CHAT-009: Artifact Rendering System (completed)

## Pre-Planning Gate Report

**Story:** CHAT-004-group-chat-controls
**Date:** 2026-01-13T02:30:00+07:00

### Research Summary
| Tool | Queries | Findings |
|------|---------|----------|
| Codebase | 3 | ChatInputControls structure, RAGChatPanel inline controls, all panel usage patterns |

### Standards Check
| Standard | Status | Notes |
|----------|--------|-------|
| Coding Style | ✅ | TypeScript strict, component composition |
| Error Handling | ✅ | Not applicable (UI component) |
| Architecture | ✅ | Clean Architecture: presentation layer only |
| Size Limits | ✅ | Components under limits |
| Import Pattern | ✅ | Follows CLAUDE.md import order |

### Implementation Plan

#### Files to Modify
- [ ] `src/presentation/components/chat/ChatInputControls.tsx` - Add minimal mode props
- [ ] `src/presentation/components/rag/RAGChatPanel.tsx` - Use ChatInputControls

#### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Visual balance issues | LOW | CSS flexbox handles centering well |
| TypeScript errors | LOW | Simple prop additions, backward compatible |
| Component size limit | LOW | Adding conditional rendering, minimal code |

### Overall: ✅ PASS

Pre-planning gate passed. Ready for implementation.

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-11 | SM | From epic backlog |
| drafted | 2026-01-13T02:30:00+07:00 | Dev | Story file created v2.0 |
| | | | |

