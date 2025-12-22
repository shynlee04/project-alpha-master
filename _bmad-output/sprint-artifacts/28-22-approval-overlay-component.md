# Story 28-22: Approval Overlay Component

**Epic:** 28 - UX Brand Identity & Design System  
**Story:** 22  
**Title:** Approval Overlay Component  
**Points:** 5  
**Priority:** P0  
**Platform:** Platform B  
**Status:** drafted  
**Created:** 2025-12-22T17:20:00+07:00  
**Updated:** 2025-12-22T17:20:00+07:00

---

## User Story

**As a** developer using Via-Gent's AI agent capabilities  
**I want** to see an approval overlay when the AI attempts to write or modify files  
**So that** I can review changes before they are applied to my project, preventing unwanted modifications

---

## Acceptance Criteria

### AC-1: Overlay Display on Tool Execution
**Given** the AI agent executes a tool that requires approval (e.g., `write_file` with `needsApproval: true`)  
**When** the tool result is streamed back to the chat interface  
**Then** an ApprovalOverlay component should appear over the chat area  
**And** it should display:
- The tool name and description
- A DiffPreview showing the proposed changes
- Accept and Reject buttons with clear labels

### AC-2: Accept Action
**Given** the ApprovalOverlay is visible showing proposed changes  
**When** I click the "Accept" button  
**Then** the tool should execute and modify the file  
**And** the overlay should close  
**And** the chat should show a confirmation message with the tool result

### AC-3: Reject Action
**Given** the ApprovalOverlay is visible showing proposed changes  
**When** I click the "Reject" button  
**Then** the tool should NOT execute  
**And** the overlay should close  
**And** the chat should show a message indicating the change was rejected

### AC-4: Pixel Aesthetic Integration
**Given** the ApprovalOverlay component  
**When** rendered in the UI  
**Then** it should follow the Epic 28 design system:
- Use VIA-GENT orange primary color (`#f97316`)
- Apply pixel shadows (`shadow-pixel`)
- Use squared corners (`rounded-none`)
- Support dark theme by default
- Include pixel font styling for headings

### AC-5: i18n Support
**Given** the application is running  
**When** I switch between English and Vietnamese languages  
**Then** all ApprovalOverlay text should translate correctly:
- "Approve Changes" / "Phê Duyệt Thay Đổi"
- "Accept" / "Chấp Nhận"
- "Reject" / "Từ Chối"
- "Tool requires your approval" / "Công cụ cần sự phê duyệt của bạn"

---

## Task Breakdown

- [ ] **Task 1:** Research TanStack AI tool approval patterns
- [ ] **Task 2:** Create ApprovalOverlay component structure
- [ ] **Task 3:** Integrate with DiffPreview component (Story 28-21)
- [ ] **Task 4:** Add Accept/Reject button actions with event handling
- [ ] **Task 5:** Apply pixel aesthetic styling (TailwindCSS + design tokens)
- [ ] **Task 6:** Add EN/VI i18n keys and translations
- [ ] **Task 7:** Create unit tests for component rendering and interactions
- [ ] **Task 8:** Integration test with mock tool execution flow
- [ ] **Task 9:** Update component index exports
- [ ] **Task 10:** Run TypeScript check and full test suite

---

## Dev Notes

### Architecture Pattern
This component integrates with the TanStack AI tool execution flow. When a tool with `needsApproval: true` is executed, the result should be intercepted and the ApprovalOverlay displayed before final execution.

### Integration Points
- **Epic 25-5:** AI Agent Integration - Tool Approval Flow
- **Story 28-21:** DiffPreview Component (displays file changes)
- **Story 28-19:** ToolCallBadge (shows tool execution status)
- **Epic 10:** Event Bus - listens for `tool:approval_required` events

### JSDoc Pattern
```tsx
/**
 * ApprovalOverlay - Modal overlay for tool execution approval
 * 
 * @epic Epic-28 Story 28-22
 * @integrates Epic-25 Story 25-5 - Tool approval flow
 * @integrates Epic-28 Story 28-21 - DiffPreview for change visualization
 * 
 * @listens tool:approval_required - When tool needs user approval
 * @emits tool:approved - When user accepts changes
 * @emits tool:rejected - When user rejects changes
 * 
 * @roadmap Future: Add "Approve All" for batch operations (Epic 26)
 */
```

### UI Design
From the holistic integration analysis, the overlay should:
- Appear centered over the chat interface
- Use a semi-transparent backdrop (`bg-black/50`)
- Show tool metadata (name, description, risk level)
- Display the DiffPreview component
- Have prominent Accept (primary) and Reject (secondary) buttons
- Support keyboard shortcuts (Enter to accept, Escape to reject)

### Research Requirements
Before implementation, research:
1. TanStack AI tool definition patterns with `needsApproval` flag
2. Radix UI Dialog component for accessible modal behavior
3. Event bus patterns for tool approval workflow

---

## References

- **Holistic Integration Analysis:** `_bmad-output/analysis/epic-28-holistic-integration-analysis.md`
- **Epic 28 Specification:** `_bmad-output/epics/epic-28-ux-brand-identity-design-system.md`
- **Story 28-21:** `_bmad-output/sprint-artifacts/28-21-diff-preview-component.md`
- **TanStack AI Tools:** Context7 documentation for tool patterns
- **Radix UI Dialog:** For accessible modal implementation

---

## Dev Agent Record

*To be filled by Dev Agent during implementation*

**Agent:**  
**Session:**  

#### Task Progress:
- [ ] T1:  
- [ ] T2:  
- [ ] T3:  

#### Research Executed:
- Context7:  
- DeepWiki:  

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
|      |        |       |

#### Tests Created:
-  

#### Decisions Made:
-  

---

## Code Review

*To be filled during code review phase*

**Reviewer:**  
**Date:**  

#### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

#### Issues Found:
-  

#### Sign-off:
- [ ] APPROVED for merge

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-22T17:20:00+07:00 | drafted | Story file created by BMAD Master |
| | ready-for-dev | |
| | in-progress | |
| | review | |
| | done | |