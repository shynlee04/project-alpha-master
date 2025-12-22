# Story 28.19: Chat Tool Call Badge Component

**Status:** done
**Created:** 2025-12-22T22:30:00+07:00
**Completed:** 2025-12-22T22:40:00+07:00
**Epic:** 28 - UX Brand Identity & Design System
**Phase:** 6 - AI Foundation Integration Readiness
**Tier:** 1 - Chat + Tool Visibility (Critical)
**Priority:** P0
**Points:** 5
**Platform:** Platform B

---

## Story

As a **developer reviewing AI agent responses**,
I want **to see inline badges showing which tools the agent is calling (e.g., [read_file], [write_file], [execute_command])**,
so that **I understand exactly what actions the agent is taking and can track tool execution in real-time**.

---

## Context & Business Value

This story creates the **ToolCallBadge** component which displays inline tool call indicators in chat messages. This is critical infrastructure for:

1. **Epic 25 Integration** (AI Foundation) - Badge will be used to show real-time tool calls from TanStack AI streams
2. **Epic 6/12 Integration** (AI Agent + Tool Layer) - Badge will display tool names as they execute
3. **User Trust** - Users need transparency into what the AI is doing with their codebase

### TanStack AI Tool Call Stream Pattern

Per Context7 research, TanStack AI emits `ToolCallStreamChunk` with:
```typescript
interface ToolCallStreamChunk {
  type: 'tool_call';
  toolCall: {
    id: string;
    type: 'function';
    function: {
      name: string;        // e.g., "read_file", "write_file"
      arguments: string;   // JSON string of args
    };
  };
  index: number;
}
```

The ToolCallBadge will render these as inline badges: `[📖 read_file]` `[💾 write_file]` `[⚡ execute_command]`

### Cross-Epic Integration Points

| Epic | Story | Integration |
|------|-------|-------------|
| Epic 6 | 6-X | Tool execution events trigger badge updates |
| Epic 12 | 12-X | Tool definitions provide name/description |
| Epic 25 | 25-1 | ToolCallStreamChunk parsed and rendered |
| Epic 10 | 10-7 | tool:called event subscriptions |

---

## Acceptance Criteria

### AC-1: ToolCallBadge Renders with Tool Name ✅
**Given** a tool call with name "read_file"  
**When** ToolCallBadge renders  
**Then** displays badge with icon + tool name: `[📖 read_file]`

### AC-2: Tool Category Icons ✅
**Given** different tool types  
**When** ToolCallBadge renders  
**Then** displays appropriate icon:
- `read_file` → 📖 (FileText)
- `write_file` → 💾 (Save)  
- `list_files` → 📂 (FolderOpen)
- `execute_command` → ⚡ (Terminal)
- Default → 🔧 (Wrench)

### AC-3: Status Variants ✅
**Given** tool execution status  
**When** ToolCallBadge renders  
**Then** displays appropriate variant:
- `pending` → Pulsing animation, muted color
- `running` → Spinner animation, primary color
- `success` → Static checkmark, success color
- `error` → Static X, error color

### AC-4: Expandable Arguments Preview ✅
**Given** tool call has arguments  
**When** user hovers/clicks on badge  
**Then** shows tooltip with formatted arguments JSON

### AC-5: Integration with EnhancedChatInterface
**Given** a ChatMessage with toolExecutions  
**When** message renders  
**Then** ToolCallBadges appear inline before message content

> Note: AC-5 full integration requires follow-up in Story 28-20 or later

### AC-6: i18n Localization ✅
**Given** user language is Vietnamese  
**When** ToolCallBadge renders  
**Then** tooltips and status text display in Vietnamese

---

## Tasks / Subtasks

### Task 1: Create ToolCallBadge Component (AC: 1, 2, 3) ✅
- [x] 1.1: Create `src/components/chat/ToolCallBadge.tsx`
- [x] 1.2: Define ToolCallStatus type: 'pending' | 'running' | 'success' | 'error'
- [x] 1.3: Create tool name → icon mapping function
- [x] 1.4: Implement status color variants
- [x] 1.5: Add pulse animation for pending/running
- [x] 1.6: Use 8-bit pixel aesthetic (squared corners, monospace font)

### Task 2: Create ToolCallBadge Types (AC: 1, 5) ✅
- [x] 2.1: Create `src/types/tool-call.ts`
- [x] 2.2: Export ToolCall interface matching TanStack AI ToolCallStreamChunk
- [x] 2.3: Export ToolCallBadgeProps interface
- [x] 2.4: Add JSDoc with @integrates Epic comments

### Task 3: Add Arguments Tooltip (AC: 4) ✅
- [x] 3.1: Tooltip embedded in ToolCallBadge.tsx
- [x] 3.2: Parse and format JSON arguments
- [x] 3.3: Truncate long values with ellipsis
- [x] 3.4: Created ShadcnUI Tooltip component

### Task 4: Integrate into EnhancedChatInterface (AC: 5)
- [ ] 4.1: Import ToolCallBadge into EnhancedChatInterface.tsx (deferred to next story)
- [ ] 4.2: Modify ChatMessageBubble to render badges inline
- [ ] 4.3: Add toolCalls property to ChatMessage interface
- [ ] 4.4: Show badges before message content for assistant messages

> Note: Task 4 deferred to Story 28-20 for proper integration with CodeBlock component

### Task 5: Add i18n Keys (AC: 6) ✅
- [x] 5.1: Add English keys to src/i18n/en.json under `chat.tools.*`
- [x] 5.2: Add Vietnamese keys to src/i18n/vi.json
- [x] 5.3: Verify all strings use t() function

### Task 6: Write Unit Tests ✅
- [x] 6.1: Create `src/components/chat/__tests__/ToolCallBadge.test.tsx`
- [x] 6.2: Test badge renders with correct tool name
- [x] 6.3: Test icon mapping for each tool category
- [x] 6.4: Test status variant styling
- [x] 6.5: Test i18n key rendering
- [x] 6.6: Run: `pnpm test src/components/chat/__tests__/ToolCallBadge.test.tsx` → 18/18 PASS

### Task 7: TypeScript Verification ✅
- [x] 7.1: Run `pnpm exec tsc --noEmit`
- [x] 7.2: Fix any type errors (created missing Tooltip component)
- [x] 7.3: Verify no lint warnings

---

## Dev Agent Record

### Agent Model Used
Claude 4 Opus (Antigravity Agent)

### Completion Notes List
1. Created comprehensive `ToolCallBadge` component with 8-bit pixel aesthetic
2. Implemented `ToolCallBadgeGroup` for batch rendering
3. Created `tooltip.tsx` UI component (ShadcnUI style) - new dependency
4. Installed `@radix-ui/react-tooltip` package
5. Added full EN/VI localization for `chat.tools.*` namespace
6. 18 unit tests covering all badge variants and icon mappings
7. AC-5 (EnhancedChatInterface integration) deferred to next story for proper CodeBlock coordination

### Files Created
| File | Lines | Purpose |
|------|-------|---------|
| `src/types/tool-call.ts` | 103 | Type definitions for tool calls |
| `src/components/chat/ToolCallBadge.tsx` | 255 | Main badge + group components |
| `src/components/chat/index.ts` | 11 | Barrel export |
| `src/components/ui/tooltip.tsx` | 50 | ShadcnUI Tooltip component |
| `src/components/chat/__tests__/ToolCallBadge.test.tsx` | 166 | Unit tests (18 tests) |

### Files Modified
| File | Changes |
|------|---------|
| `src/i18n/en.json` | Added `chat.tools.*` keys |
| `src/i18n/vi.json` | Added Vietnamese `chat.tools.*` keys |
| `package.json` | Added `@radix-ui/react-tooltip` |

### Decisions Made
1. Used category-based icon mapping (read/write/execute/search) rather than exact-match
2. Embedded tooltip content in ToolCallBadge rather than separate ToolArguments component
3. Deferred EnhancedChatInterface integration to coordinate with Story 28-20 CodeBlock

---

## References

- [Source: _bmad-output/analysis/epic-28-holistic-integration-analysis.md] - Phase 6 scope
- [Source: src/components/ide/EnhancedChatInterface.tsx] - Existing chat + ToolExecution
- [Source: Context7 TanStack AI] - ToolCallStreamChunk interface
- [Source: _bmad-output/epics/epic-28-ux-brand-identity-design-system.md] - Epic context

---

## Code Review

### Reviewer: Claude 4 Opus
### Date: 2025-12-22T22:40:00+07:00

#### Checklist:
- [x] All ACs verified (AC-1,2,3,4,6 complete; AC-5 deferred)
- [x] All tests passing (18/18)
- [x] Architecture patterns followed (JSDoc integration comments)
- [x] No new TypeScript errors
- [x] Code quality acceptable

#### Issues Found:
- Issue 1: Missing Tooltip component → Created `src/components/ui/tooltip.tsx`
- Issue 2: No `@radix-ui/react-tooltip` → Installed dependency

#### Sign-off:
✅ APPROVED - Story complete with AC-5 deferred note

---

## Status History

| Status | Date | Agent | Notes |
|--------|------|-------|-------|
| drafted | 2025-12-22T22:30 | BMad Master | Story file created |
| ready-for-dev | 2025-12-22T22:33 | Dev Agent | Context XML complete |
| in-progress | 2025-12-22T22:35 | Dev Agent | Implementation started |
| review | 2025-12-22T22:39 | Dev Agent | 18 tests passing |
| done | 2025-12-22T22:40 | Dev Agent | Code review passed |

