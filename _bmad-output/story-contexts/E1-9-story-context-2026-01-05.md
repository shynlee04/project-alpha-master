# E1-9 Story Context: Add Chat to Notes Sidebar

**Story ID**: E1-9
**Epic**: E1 - Cross-Workspace Chat Integration
**Points**: 6
**Status**: DONE
**Date Completed**: 2026-01-05
**Governance**: E1-9

## Acceptance Criteria

| Criterion | Status | Notes |
|-----------|--------|-------|
| Chat panel renders in NoteSidebar | ✅ | View toggle between notes and chat |
| Chat panel has proper dimensions for sidebar | ✅ | Full height of sidebar |
| Chat is functional (send/receive messages) | ✅ | Uses useAgentChatWithTools hook |
| Notes-specific system prompt applied | ✅ | getNotesAgentSystemPrompt |
| File read tools only (no terminal) | ✅ | workspaceType: 'notes' filter |
| TypeScript compiles without errors | ✅ | pnpm typecheck passes |
| i18n strings externalized | ✅ | Uses t() hook for all UI strings |

## Technical Implementation

### Files Created

| File | Lines | Description |
|------|-------|-------------|
| `src/presentation/components/notes/NoteSidebarChat.tsx` | 230 | Compact chat panel component for sidebar |

### Files Modified

| File | Lines Changed | Description |
|------|---------------|-------------|
| `src/presentation/components/notes/NoteSidebar.tsx` | +60, -20 | Added view toggle, chat integration |
| `src/presentation/components/notes/NotesPage.tsx` | +4 | Pass projectId/projectName props |

## Architecture Decisions

### 1. View Toggle Pattern
**Decision**: Added inline view toggle buttons in sidebar header

**Rationale**:
- Simple state-based toggle (`notes` | `chat`)
- Buttons show active state with different background colors
- Consistent with existing sidebar patterns

```typescript
type SidebarView = 'notes' | 'chat';

const [sidebarView, setSidebarView] = useState<SidebarView>('notes');
```

### 2. Chat Component Isolation
**Decision**: Created separate `NoteSidebarChat` component

**Rationale**:
- Separation of concerns (sidebar layout vs chat functionality)
- Reusable component pattern
- Easier to test and maintain

### 3. Tool Filtering
**Decision**: Notes workspace gets file read tools only

**Rationale**:
- Notes workspace should not have terminal execution
- System prompt enforces "read-only" behavior
- Follows E1-2 workspace-specific tool filtering pattern

```typescript
const { fileTools } = useAgentChatToolFacades({
    localAdapterRef,
    syncManagerRef,
    eventBus,
    initialSyncCompleted,
    workspaceType: 'notes' // Filters to read-only file tools
});
```

### 4. API Key Management
**Decision**: Let credential-vault handle API key lookup

**Rationale**:
- `useAgentChatWithTools` hook handles API key lookup internally
- No need to pass `apiKeyId` from Agent entity
- Consistent with AgentChatPanel pattern

## Integration Points

### NoteSidebar → NotesPage
- Added `projectId` and `projectName` props to NoteSidebar
- Both mobile and desktop layouts updated

### NoteSidebarChat → Workspace
- Uses `useWorkspaceSync()` for tool facades
- Uses `useAgentSelection()` for active agent
- Uses `useAgents()` for agent list

## Dependencies

| Dependency | Type | Used For |
|------------|------|----------|
| `useAgentChatWithTools` | Hook | TanStack AI streaming with tools |
| `useAgentChatToolFacades` | Hook | File/terminal tool facades |
| `getNotesAgentSystemPrompt` | Function | Notes-specific system prompt |
| `useWorkspaceSync` | Hook | Workspace context |
| `useAgentSelection` | Store | Active agent state |
| `useAgents` | Hook | Agent list |

## Testing Strategy

### Manual Testing
1. Open Notes workspace
2. Click "Chat" button in sidebar header
3. Verify chat panel renders
4. Send a message and verify response
5. Switch back to "Notes" view
6. Verify note list still works

### Expected Behavior
- Chat panel takes full height of sidebar content area
- Messages display in compact format (smaller text)
- Auto-scroll to bottom on new messages
- Loading indicator shows during AI response
- Tool execution displays (for file read operations)

## Known Limitations

1. **No API Key Validation in Sidebar**: The sidebar chat relies on credential-vault for API key lookup. If no API key is configured, the chat will fail silently. Future enhancement: Show API key configuration prompt.

2. **Compact UI Trade-offs**: The sidebar chat has smaller text and tighter spacing than the full UnifiedChatPanel. This is intentional for sidebar constraints but may reduce readability.

3. **No Thread Management**: Sidebar chat shows a single conversation thread. Thread switching is available only in the full UnifiedChatPanel (right panel).

## Future Enhancements

1. **E1-10**: Mobile-optimized chat layout
2. **E1-11**: Workspace switcher in chat header
3. **Persistent View State**: Remember user's last view (notes vs chat) across sessions
4. **Quick Actions**: Add quick note-related actions (summarize, outline) as chat shortcuts

## Code Review Notes

### Changes from Draft
- Removed `apiKeyId` reference (Agent entity doesn't have this property)
- Fixed import path for `useAgentChatToolFacades` (uses index.ts barrel)
- Changed `sendMessage().catch()` to try/catch (hook doesn't return promise)
- Prefixed `projectId` with underscore to indicate intentionally unused

### TypeScript Validation
- All files pass `pnpm typecheck`
- No implicit any types
- All imports properly resolved

## References

- **E1-2 Story Context**: Workspace-specific tool filtering
- **E1-8 Story Context**: Workspace-specific chat settings
- **AgentChatPanel**: Main chat panel implementation
- **getNotesAgentSystemPrompt**: Notes system prompt factory

## Sign-off

- **Implementation**: @bmad-bmm-dev
- **Validation**: TypeScript compilation passes
- **Integration**: NotesPage mobile and desktop layouts updated
- **Status**: READY FOR CODE REVIEW
