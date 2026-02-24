# CHAT-022: Remove Threaded Mode from UnifiedChatPanel

**Epic:** EPIC-CHAT-REMAKE
**Story:** CHAT-022
**Title:** Remove "Threaded" Mode from UnifiedChatPanel
**Status:** backlog
**Created:** 2026-01-11
**Effort:** 1h
**Priority:** P2-MEDIUM
**Phase:** 2

## Context

**Correct-Course Workflow:** Architectural Cleanup

`UnifiedChatPanel.tsx` has a `mode` prop with two values:
- `"agent"`: Uses `AgentChatPanel` → `EnhancedChatInterface` ✅ **ACTIVE**
- `"threaded"`: Uses `ChatConversation.tsx` ❌ **NEVER USED**

The "threaded" mode was never integrated into any workspace route.

## User Story

**As a** developer maintaining the chat system
**I want** to remove the unused "threaded" mode from UnifiedChatPanel
**So that** the component is simpler and there's no confusion about which mode to use

## Acceptance Criteria

- [ ] Remove `mode` prop from UnifiedChatPanel
- [ ] Remove ChatConversation import
- [ ] Simplify component to always use AgentChatPanel
- [ ] TypeScript compiles without errors
- [ ] No visual regression in workspace

## Technical Implementation

### Current Code (UnifiedChatPanel.tsx)

```tsx
export function UnifiedChatPanel({ mode, ...props }: UnifiedChatPanelProps) {
    if (mode === 'threaded') {
        return <ChatConversation {...props} />  // NEVER USED
    }
    return <AgentChatPanel {...props} />  // ONLY PATH EXECUTED
}
```

### After Simplification

```tsx
export function UnifiedChatPanel(props: UnifiedChatPanelProps) {
    // Always use AgentChatPanel with EnhancedChatInterface
    return <AgentChatPanel {...props} />
}
```

### Interface Changes

```tsx
// BEFORE
interface UnifiedChatPanelProps {
    mode: 'agent' | 'threaded'  // threaded is dead code
    projectId: string
    projectName?: string
}

// AFTER
interface UnifiedChatPanelProps {
    projectId: string
    projectName?: string
}
```

## Files to Modify

| File | Lines | Change |
|------|-------|--------|
| `src/presentation/components/ide/UnifiedChatPanel.tsx` | ~194 | Remove mode prop and conditional logic |

## Verification

```bash
# Verify no workspace uses mode="threaded"
grep -r 'mode="threaded"' src/
grep -r "mode='threaded'" src/
# Expected: No results
```

## Related Stories

- **CHAT-020:** Delete ChatConversation.tsx (this story depends on that)
- **CHAT-019:** Consolidate fixes to EnhancedChatInterface

## Notes

This is a low-priority cleanup story. The dead code is harmless but adds complexity. Complete after CHAT-020 (delete ChatConversation.tsx).
