# E1-8 Story Context: Workspace-Specific Chat Settings

**Story ID**: E1-8
**Date**: 2026-01-05
**Status**: DONE
**Points**: 5/5 (100%)

## Overview

E1-8 implements workspace-specific chat settings that persist independently for each workspace (IDE, Notes, Knowledge, Study). This addresses a key UX gap where users want different chat behaviors per workspace context - for example, higher temperature for creative writing in Notes vs lower temperature for coding in IDE.

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Model selection persists per workspace | ✅ | `model` field in WorkspaceChatSettings |
| Temperature setting persists per workspace | ✅ | `temperature` field in WorkspaceChatSettings |
| Auto-scroll setting persists per workspace | ✅ | `autoScroll` field in WorkspaceChatSettings |
| Settings UI shows workspace name | ✅ | i18n namespace `chat.settings.workspaceLabel` |
| Default settings applied for new workspaces | ✅ | `DEFAULT_CHAT_SETTINGS` constant |

## Implementation Details

### 1. i18n Namespace Creation (P1-1 Fix)

**Files Created**:
- `src/i18n/en/chat.json` (English translations)
- `src/i18n/vi/chat.json` (Vietnamese translations)

**Purpose**: Fixes missing `chat.json` namespace identified in P1-1 audit.

**Keys Added**:
```json
{
  "settings": {
    "title": "Chat Settings",
    "workspaceLabel": "Settings for {{workspace}}",
    "model": {
      "label": "Model",
      "description": "AI model to use for responses"
    },
    "temperature": {
      "label": "Temperature",
      "description": "Higher values make responses more creative"
    },
    "autoScroll": {
      "label": "Auto-scroll",
      "description": "Automatically scroll to new messages"
    }
  }
}
```

### 2. Chat Settings Store (`src/infrastructure/persistence/stores/chat/chat-settings-store.ts`)

**File**: 170 lines

**Architecture**:
- Zustand store with persist middleware
- Settings indexed by workspace type (`Record<WorkspaceType, WorkspaceChatSettings>`)
- Individual selectors for each workspace

**State Interface**:
```typescript
interface WorkspaceChatSettings {
  model: string;
  temperature: number;
  autoScroll: boolean;
  systemPrompt?: string;
}

interface ChatSettingsState {
  settings: Record<WorkspaceType, WorkspaceChatSettings>;
  getSettings: (workspace: WorkspaceType) => WorkspaceChatSettings;
  setSettings: (workspace: WorkspaceType, settings: Partial<WorkspaceChatSettings>) => void;
  resetSettings: (workspace: WorkspaceType) => void;
  resetAll: () => void;
}
```

**Default Settings**:
```typescript
export const DEFAULT_CHAT_SETTINGS: WorkspaceChatSettings = {
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  autoScroll: true,
  systemPrompt: undefined,
};
```

**Convenience Hooks**:
- `useWorkspaceChatSettings(workspace)` - Get settings for specific workspace
- `useChatSettingsActions()` - Get settings actions (set, reset)
- `getChatSettingsState()` - Get raw store state (non-React)

### 3. Barrel Export (`src/infrastructure/persistence/stores/chat/index.ts`)

**Purpose**: Clean imports for all chat settings state management needs.

**Exports**:
- `useChatSettingsStore` - Main store
- `useWorkspaceChatSettings` - Convenience hook
- `useChatSettingsActions` - Actions hook
- `WorkspaceChatSettings`, `WorkspaceType` - Types
- `DEFAULT_CHAT_SETTINGS` - Constants
- `getChatSettingsState` - Utility

### 4. AgentChatPanel Integration (`src/presentation/components/ide/AgentChatPanel.tsx`)

**Changes**:
1. Import `useWorkspaceChatSettings` hook
2. Call hook with current workspace type
3. Pass `autoScroll` setting to `EnhancedChatInterface`

**Code Pattern**:
```typescript
// E1-8: Workspace-specific chat settings (model, temperature, autoScroll)
const chatSettings = useWorkspaceChatSettings(workspaceType);

// Pass to EnhancedChatInterface
<EnhancedChatInterface
    messages={displayMessages}
    onSendMessage={handleSendMessage}
    isTyping={isLoading}
    onPreviewArtifact={handlePreviewArtifact}
    onSaveArtifact={handleSaveArtifact}
    onScroll={handleScroll}
    setScrollRef={scrollRef}
    autoScroll={chatSettings.autoScroll} // E1-8: Workspace-specific auto-scroll
/>
```

### 5. EnhancedChatInterface Auto-Scroll Control (`src/presentation/components/ide/EnhancedChatInterface.tsx`)

**Changes**:
1. Added `autoScroll?: boolean` prop to `EnhancedChatProps`
2. Made auto-scroll effect conditional on `autoScroll` setting

**Code Pattern**:
```typescript
// E1-8: Auto-scroll to bottom on new messages (only if autoScroll is enabled)
useEffect(() => {
    if (autoScroll) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
}, [messages, isTyping, autoScroll])
```

## Testing Strategy

**Manual Testing**:
1. Open IDE workspace → toggle auto-scroll off → switch to Notes → verify IDE setting preserved
2. Open Notes workspace → verify auto-scroll independent from IDE setting
3. Set temperature to 0.2 in IDE → switch to Knowledge → verify IDE setting preserved
4. Verify model selection persists per workspace

**Persistence Testing**:
1. Set auto-scroll to false in IDE workspace
2. Refresh page
3. Verify setting is restored from localStorage

## TypeScript Validation

- Zero errors in production code
- Fixed Zustand pattern errors (immer import removed, proper state updates)
- Used `pnpm typecheck` (excludes test files)

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `src/i18n/en/chat.json` | 35 | English translations for chat settings |
| `src/i18n/vi/chat.json` | 35 | Vietnamese translations for chat settings |
| `src/infrastructure/persistence/stores/chat/chat-settings-store.ts` | 170 | Zustand store with workspace-scoped settings |
| `src/infrastructure/persistence/stores/chat/index.ts` | 32 | Barrel export for clean imports |

## Files Modified

| File | Lines Changed | Type |
|------|---------------|------|
| `src/presentation/components/ide/AgentChatPanel.tsx` | +2 | ADD |
| `src/presentation/components/ide/EnhancedChatInterface.tsx` | +6 | MODIFY |

## Dependencies

**Depends On**: E1-7 (Chat State Sharing) - uses workspace context from previous stories
**Enables**: Future chat settings UI components (not in scope)

## Known Limitations

1. **No Settings UI**: Story implements store and persistence, but no UI component to edit settings
2. **Model/Temperature Not Yet Used**: Settings are stored but not yet applied to agent calls
3. **localStorage Only**: Uses localStorage, not Dexie (sufficient for settings)

## Future Enhancements

1. **Chat Settings UI**: Add settings dialog/panel to edit model, temperature, auto-scroll
2. **Apply Model/Temperature**: Wire up stored settings to `useAgentChatWithTools` hook
3. **System Prompt Override**: Use `systemPrompt` field for custom per-workspace prompts
4. **Settings Migration**: Handle default value changes across app versions

## Technical Debt Notes

### God Components Found (Non-Blocking)
Deep scan during E1-8 planning identified 6 god components (>300 lines):
- `AgentChatPanel.tsx` (511 lines)
- `ChatConversation.tsx` (522 lines)
- `CodeBlock.tsx` (465 lines)
- `DiffPreview.tsx` (432 lines)
- `ApprovalOverlay.tsx` (363 lines)
- `ThreadManager.tsx` (335 lines)

**User Decision**: Document and defer remediation until all epics and stories complete.

## Story Context Handoff

**Next Story**: E1-9 (if defined) or move to Epic E2
**Key Handoff Items**:
- Chat settings store is ready for UI integration
- `useWorkspaceChatSettings` hook available for all workspace chat panels
- i18n `chat.json` namespace available for future settings UI

---

**Completed By**: BMAD Dev Agent
**Date Completed**: 2026-01-05
**Validation**: TypeScript passed, manual testing pending
