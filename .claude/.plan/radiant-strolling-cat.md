# E1-8: Workspace-Specific Chat Settings Implementation Plan

**Date**: 2026-01-05
**Story**: E1-8 - Workspace-Specific Chat Settings (5 points)
**Status**: READY FOR IMPLEMENTATION

## Current State (Post Deep-Scan)

### ✅ Clean Architecture
- No duplicate event bus implementations
- Proper facade pattern compliance (lib/ canonical, infrastructure/ facade)
- E1-7 integration successful with no conflicts

### ⚠️ Issues Found (Non-Blocking)
| Component | Lines | Issue | Priority |
|-----------|-------|-------|----------|
| AgentChatPanel.tsx | 511 | >300 lines | P1 |
| ChatConversation.tsx | 522 | >300 lines | P1 |
| CodeBlock.tsx | 465 | >300 lines | P1 |
| DiffPreview.tsx | 432 | >300 lines | P2 |
| ApprovalOverlay.tsx | 363 | >300 lines | P2 |
| ThreadManager.tsx | 335 | >300 lines | P2 |

**Note**: God component remediation deferred to avoid blocking E1-8.

---

## E1-8 Implementation Plan

### Acceptance Criteria
1. Model selection persists per workspace
2. Temperature setting persists per workspace
3. Auto-scroll setting persists per workspace
4. Settings UI shows workspace name
5. Default settings applied for new workspaces

### Technical Approach

**1. Data Structure**
```typescript
// Extend chat settings with workspace key
interface WorkspaceChatSettings {
  [workspaceType: WorkspaceType]: {
    model: string
    temperature: number
    autoScroll: boolean
    systemPrompt?: string
  }
}
```

**2. Persistence Strategy**
- Store in Zustand with Dexie persistence
- Use `partialize` to persist workspace-specific settings
- Apply defaults on first workspace access

**3. Files to Modify**
| File | Change |
|------|--------|
| `src/lib/state/ide-store.ts` or create `src/lib/state/chat-settings-store.ts` | Add workspace-scoped settings |
| `src/presentation/components/ide/AgentChatPanel.tsx` | Read workspace-specific settings |
| `src/i18n/en/chat.json` | Add settings UI strings (CREATE NEW) |
| `src/i18n/vi/chat.json` | Add settings UI strings (CREATE NEW) |

**4. Implementation Steps**
1. Create or extend chat settings store with workspace key structure
2. Add selector: `getChatSettings(workspaceType)`
3. Add action: `setChatSettings(workspaceType, settings)`
4. Update AgentChatPanel to use workspace-specific settings
5. Create missing `chat.json` i18n namespace (P1-1 fix)

### Integration Points
- **useWorkspaceStore**: Get current workspace type
- **crossWorkspaceEventBus**: Listen for workspace changes
- **AgentConfigDialog**: Update to show workspace context in settings

---

## Testing Strategy
1. Manual: Switch between IDE/Notes/Knowledge, verify settings persist per workspace
2. Unit: Test store selector returns correct settings per workspace
3. Integration: Verify settings apply when sending messages

---

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| Settings collision | Use workspace-scoped keys, not global |
| Missing i18n | Create chat.json namespace first |
| State corruption | Validate on store load, apply defaults |

---

## Files to Modify

### New Files
- `src/i18n/en/chat.json` (CREATE)
- `src/i18n/vi/chat.json` (CREATE)

### Modified Files
- Chat settings store (TBD: extend existing or create new)
- `AgentChatPanel.tsx` (use workspace-scoped settings)

---

## Post-E1-8 Cleanup (Deferred to Epic Completion)

### Technical Debt Registry (for post-Epic remediation)
| Component | Lines | Debt Type | Created In |
|-----------|-------|-----------|------------|
| AgentChatPanel.tsx | 511 | God component | E1-5, E1-6, E1-7 integration |
| ChatConversation.tsx | 522 | God component | Prior code |
| CodeBlock.tsx | 465 | God component | Prior code |
| DiffPreview.tsx | 432 | God component | Prior code |
| ApprovalOverlay.tsx | 363 | God component | Prior code |
| ThreadManager.tsx | 335 | God component | Prior code |

**User Decision**: Document and defer all god component remediation until all epics and stories are completed.

### Remediation Plan (Future)
1. Follow established god component elimination pattern (from E1-3, E1-4 refactoring)
2. Split into <300 line focused components
3. Use barrel exports for backwards compatibility
4. Target: Post-Epic E1 completion retrospective
