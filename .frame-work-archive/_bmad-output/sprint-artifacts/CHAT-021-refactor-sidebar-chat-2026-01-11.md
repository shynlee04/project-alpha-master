# CHAT-021: Refactor NoteSidebarChat to Use EnhancedChatInterface

**Epic:** EPIC-CHAT-REMAKE
**Story:** CHAT-021
**Title:** Refactor NoteSidebarChat to Use EnhancedChatInterface
**Status:** backlog
**Created:** 2026-01-11
**Effort:** 4h
**Priority:** P1-HIGH
**Phase:** 2

## Context

**Correct-Course Workflow:** Architectural Remediation

The investigation revealed that `NoteSidebarChat.tsx` is a **THIRD chat implementation** with its own:
- 241 lines of duplicate chat logic
- Custom message rendering
- Custom textarea styling
- Does NOT use `EnhancedChatInterface.tsx`

This creates a maintenance burden and potential UX inconsistency.

## User Story

**As a** developer maintaining the chat system
**I want** NoteSidebarChat to use the same EnhancedChatInterface component
**So that** there's a single source of truth for chat UI and consistent UX across workspaces

## Current Problem

```tsx
// NoteSidebarChat.tsx - Standalone implementation (241 lines)
export function NoteSidebarChat() {
    // Custom hooks
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')

    // Custom message rendering
    messages.map(message => (
        <div className="...custom styles...">
            {message.content}
        </div>
    ))

    // Custom textarea
    <textarea className="...different styles..." />
}

// EnhancedChatInterface.tsx - Production implementation (592 lines)
export function EnhancedChatInterface() {
    // Same functionality, but with:
    // - Voice input support
    // - File attachments
    // - Note references
    // - Tool execution display
    // - Streaming indicator
}
```

## Acceptance Criteria

- [ ] NoteSidebarChat refactored to use EnhancedChatInterface
- [ ] Preserve sidebar-specific compact layout
- [ ] All existing functionality maintained
- [ ] Tests updated
- [ ] No visual regression

## Technical Implementation

### Approach

Wrap `EnhancedChatInterface` in a container that provides sidebar-specific props and styling:

```tsx
// NoteSidebarChat.tsx (refactored)
import { EnhancedChatInterface } from '@/presentation/components/ide/EnhancedChatInterface'

export function NoteSidebarChat({ projectId, projectName, className }: NoteSidebarChatProps) {
    const { messages, sendMessage, isLoading } = useAgentChatWithTools({ /* ... */ })

    // Convert to EnhancedChatInterface format
    const enhancedMessages: ChatMessage[] = messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp),
        toolExecutions: m.toolExecutions
    }))

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Sidebar header */}
            <div className="p-3 border-b">
                <h3 className="font-mono text-sm font-bold">Chat</h3>
            </div>

            {/* Use shared chat interface */}
            <EnhancedChatInterface
                messages={enhancedMessages}
                onSendMessage={sendMessage}
                isTyping={isLoading}
                className="flex-1"
                // Sidebar-specific overrides
                compact={true}
                hideAttachments={true}
                hideVoice={true}
            />
        </div>
    )
}
```

### EnhancedChatInterface Changes Needed

Add props for sidebar mode:

```tsx
interface EnhancedChatProps {
    // ... existing props
    compact?: boolean  // Smaller headers, compact spacing
    hideAttachments?: boolean  // Hide file attachment button
    hideVoice?: boolean  // Hide voice input button
}
```

## Files to Modify

| File | Change |
|------|--------|
| `NoteSidebarChat.tsx` | Refactor to use EnhancedChatInterface |
| `EnhancedChatInterface.tsx` | Add compact mode props |
| `NoteSidebarChat.test.tsx` | Update tests for new implementation |

## Benefits

| Before | After |
|--------|-------|
| 3 chat implementations | 1 shared implementation |
| 241 lines of duplicate code | ~50 lines of wrapper |
| Inconsistent UX | Consistent UX |
| Fixes applied in 3 places | Fixes applied once |

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Visual regression | Medium | Medium | Manual testing before/after |
| Missing features | Low | High | Feature parity checklist |
| Performance impact | Low | Low | Same component, less code |

## Related Stories

- **CHAT-019:** Consolidate fixes to EnhancedChatInterface
- **CHAT-020:** Delete unused ChatConversation.tsx
- **CHAT-022:** Remove threaded mode from UnifiedChatPanel

## Notes

This story can be deferred if resources are limited. The current NoteSidebarChat works correctly; this is about reducing technical debt, not fixing a user-facing bug.

**Defer criteria:** If more critical stories (CHAT-005, CHAT-006) are pending, complete those first.
