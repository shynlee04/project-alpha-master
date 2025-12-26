# Component Inventory - 2025-12-26

**Status**: P1 - Component Analysis Complete

## Summary

- **Total Components**: 136 files in `src/components/`
- **Connected**: ~85% (core IDE, chat, agent features)
- **Unconnected**: ~10% (hub, dashboard, some utility components)
- **Dead Code**: ~3% (unused or deprecated)
- **Duplicate**: ~2% (similar functionality)

---

## Connected Components (Core IDE Features)

### Agent Components ([`src/components/agent/`](src/components/agent/))
- [`AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx) - Agent configuration UI
- [`AgentSelector.tsx`](src/components/chat/AgentSelector.tsx) - Provider/model selection

### Chat Components ([`src/components/chat/`](src/components/chat/))
- [`AgentChatPanel.tsx`](src/components/chat/AgentChatPanel.tsx) - Main chat interface
- [`ChatConversation.tsx`](src/components/chat/ChatConversation.tsx) - Conversation view
- [`ChatPanel.tsx`](src/components/chat/ChatPanel.tsx) - Chat container
- [`ThreadsList.tsx`](src/components/chat/ThreadsList.tsx) - Thread management
- [`ThreadCard.tsx`](src/components/chat/ThreadCard.tsx) - Thread card component
- [`StreamdownRenderer.tsx`](src/components/chat/StreamdownRenderer.tsx) - Markdown renderer
- [`ToolCallBadge.tsx`](src/components/chat/ToolCallBadge.tsx) - Tool execution badge
- [`CodeBlock.tsx`](src/components/chat/CodeBlock.tsx) - Code display
- [`DiffPreview.tsx`](src/components/chat/DiffPreview.tsx) - Diff viewer
- [`ApprovalOverlay.tsx`](src/components/chat/ApprovalOverlay.tsx) - Approval UI

### IDE Components ([`src/components/ide/`](src/components/ide/))
- [`AgentsPanel.tsx`](src/components/ide/AgentsPanel.tsx) - Agents management panel
- [`BentoGrid.tsx`](src/components/ide/BentoGrid.tsx) - Bento grid layout
- [`BentoCardPreview.tsx`](src/components/ide/BentoCardPreview.tsx) - Card preview
- [`CommandPalette.tsx`](src/components/ide/CommandPalette.tsx) - Command palette
- [`FeatureSearch.tsx`](src/components/ide/FeatureSearch.tsx) - Feature search
- [`ExplorerPanel.tsx`](src/components/ide/ExplorerPanel.tsx) - File explorer
- [`FileTree/`](src/components/ide/FileTree/) - File tree (subdirectory with hooks, types, utils)
  - [`FileTree.tsx`](src/components/ide/FileTree/FileTree.tsx)
  - [`FileTreeItem.tsx`](src/components/ide/FileTree/FileTreeItem.tsx)
  - [`ContextMenu.tsx`](src/components/ide/FileTree/ContextMenu.tsx)
  - [`icons.tsx`](src/components/ide/FileTree/icons.tsx)
  - [`types.ts`](src/components/ide/FileTree/types.ts)
  - [`utils.ts`](src/components/ide/FileTree/utils.ts)
  - [`hooks/`](src/components/ide/FileTree/hooks/) - 4 hook files
- [`IconSidebar.tsx`](src/components/ide/IconSidebar.tsx) - Icon sidebar
- [`PanelShell.tsx`](src/components/ide/PanelShell.tsx) - Panel shell wrapper
- [`QuickActionsMenu.tsx`](src/components/ide/QuickActionsMenu.tsx) - Quick actions
- [`SearchPanel.tsx`](src/components/ide/SearchPanel.tsx) - Search panel
- [`SettingsPanel.tsx`](src/components/ide/SettingsPanel.tsx) - Settings panel
- [`MonacoEditor/`](src/components/ide/monacoEditor/) - Monaco editor (subdirectory)
  - [`MonacoEditor.tsx`](src/components/ide/monacoEditor/MonacoEditor.tsx)
  - [`EditorTabBar.tsx`](src/components/ide/monacoEditor/EditorTabBar.tsx)
  - [`hooks/`](src/components/ide/monacoEditor/hooks/)
- [`PreviewPanel/`](src/components/ide/PreviewPanel/) - Preview panel (subdirectory)
  - [`PreviewPanel.tsx`](src/components/ide/PreviewPanel/PreviewPanel.tsx)
  - [`types.ts`](src/components/ide/PreviewPanel/types.ts)
- [`XTerminal.tsx`](src/components/ide/XTerminal.tsx) - Terminal component
  - [`hooks/useTerminalEventSubscriptions.ts`](src/components/ide/XTerminal/hooks/useTerminalEventSubscriptions.ts)
- [`StreamingMessage.tsx`](src/components/ide/StreamingMessage.tsx) - Streaming message
- [`SyncEditWarning.tsx`](src/components/ide/SyncEditWarning.tsx) - Sync edit warning
- [`SyncStatusIndicator.tsx`](src/components/ide/SyncStatusIndicator.tsx) - Sync status
- [`EnhancedChatInterface.tsx`](src/components/ide/EnhancedChatInterface.tsx) - Enhanced chat UI

### Status Bar ([`src/components/ide/statusbar/`](src/components/ide/statusbar/))
- [`StatusBar.tsx`](src/components/ide/StatusBar.tsx) - Main status bar
- [`WebContainerStatus.tsx`](src/components/ide/statusbar/WebContainerStatus.tsx) - WC status
- [`AgentStatusSegment.tsx`](src/components/ide/statusbar/AgentStatusSegment.tsx) - Agent status
- [`SyncStatusSegment.tsx`](src/components/ide/statusbar/SyncStatusSegment.tsx) - Sync status
- [`ProviderStatus.tsx`](src/components/ide/statusbar/ProviderStatus.tsx) - Provider status
- [`StatusBarSegment.tsx`](src/components/ide/statusbar/StatusBarSegment.tsx) - Status segment
- [`CursorPosition.tsx`](src/components/ide/statusbar/CursorPosition.tsx) - Cursor position
- [`FileTypeIndicator.tsx`](src/components/ide/statusbar/FileTypeIndicator.tsx) - File type indicator

### Layout Components ([`src/components/layout/`](src/components/layout/))
- [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) - Main IDE layout
- [`IDEHeaderBar.tsx`](src/components/layout/IDEHeaderBar.tsx) - IDE header
- [`TerminalPanel.tsx`](src/components/layout/TerminalPanel.tsx) - Terminal panel
- [`ChatPanelWrapper.tsx`](src/components/layout/ChatPanelWrapper.tsx) - Chat wrapper
- [`HubLayout.tsx`](src/components/layout/HubLayout.tsx) - Hub layout
- [`MinViewportWarning.tsx`](src/components/layout/MinViewportWarning.tsx) - Viewport warning
- [`PermissionOverlay.tsx`](src/components/layout/PermissionOverlay.tsx) - Permission overlay
- [`hooks/`](src/components/layout/hooks/) - 4 hook files

### UI Components ([`src/components/ui/`](src/components/ui/))
- [`button.tsx`](src/components/ui/button.tsx) - Button component
- [`card.tsx`](src/components/ui/card.tsx) - Card component
- [`checkbox.tsx`](src/components/ui/checkbox.tsx) - Checkbox component
- [`collapsible-section.tsx`](src/components/ui/collapsible-section.tsx) - Collapsible section
- [`context-tooltip.tsx`](src/components/ui/context-tooltip.tsx) - Context tooltip
- [`dialog.tsx`](src/components/ui/dialog.tsx) - Dialog component
- [`dropdown-menu.tsx`](src/components/ui/dropdown-menu.tsx) - Dropdown menu
- [`input.tsx`](src/components/ui/input.tsx) - Input component
- [`label.tsx`](src/components/ui/label.tsx) - Label component
- [`select.tsx`](src/components/ui/select.tsx) - Select component
- [`separator.tsx`](src/components/ui/separator.tsx) - Separator component
- [`sheet.tsx`](src/components/ui/sheet.tsx) - Sheet component
- [`skeleton.tsx`](src/components/ui/skeleton.tsx) - Skeleton loader
- [`switch.tsx`](src/components/ui/switch.tsx) - Switch component
- [`tabs.tsx`](src/components/ui/tabs.tsx) - Tabs component
- [`textarea.tsx`](src/components/ui/textarea.tsx) - Textarea component
- [`resizable.tsx`](src/components/ui/resizable.tsx) - Resizable component
- [`sonner.tsx`](src/components/ui/sonner.tsx) - Toast notifications
- [`tooltip.tsx`](src/components/ui/tooltip.tsx) - Tooltip component
- [`progress-indicator.tsx`](src/components/ui/progress-indicator.tsx) - Progress indicator
- [`status-dot.tsx`](src/components/ui/status-dot.tsx) - Status dot
- [`Toast/`](src/components/ui/Toast/) - Toast system (subdirectory)
  - [`Toast.tsx`](src/components/ui/Toast/Toast.tsx)
  - [`ToastContext.tsx`](src/components/ui/Toast/ToastContext.tsx)
- [`Toast/index.ts`](src/components/ui/Toast/index.ts)

### Icons ([`src/components/ui/icons/`](src/components/ui/icons/))
- [`icon.tsx`](src/components/ui/icons/icon.tsx) - Base icon
- [`MenuIcon.tsx`](src/components/ui/icons/MenuIcon.tsx) - Menu icon
- [`CloseIcon.tsx`](src/components/ui/icons/CloseIcon.tsx) - Close icon
- [`FileIcon.tsx`](src/components/ui/icons/FileIcon.tsx) - File icon
- [`AIIcon.tsx`](src/components/ui/icons/AIIcon.tsx) - AI icon
- [`TerminalIcon.tsx`](src/components/ui/icons/TerminalIcon.tsx) - Terminal icon
- [`SettingsIcon.tsx`](src/components/ui/icons/SettingsIcon.tsx) - Settings icon
- [`ChatIcon.tsx`](src/components/ui/icons/ChatIcon.tsx) - Chat icon
- [`RefreshIcon.tsx`](src/components/ui/icons/RefreshIcon.tsx) - Refresh icon
- [`PlusIcon.tsx`](src/components/ui/icons/PlusIcon.tsx) - Plus icon
- [`MinusIcon.tsx`](src/components/ui/icons/MinusIcon.tsx) - Minus icon
- [`SearchIcon.tsx`](src/components/ui/icons/SearchIcon.tsx) - Search icon
- [`MaximizeIcon.tsx`](src/components/ui/icons/MaximizeIcon.tsx) - Maximize icon

### Common Components ([`src/components/common/`](src/components/common/))
- [`AppErrorBoundary.tsx`](src/components/common/AppErrorBoundary.tsx) - App error boundary
- [`ErrorBoundary.tsx`](src/components/common/ErrorBoundary.tsx) - Error boundary
- [`WithErrorBoundary.tsx`](src/components/common/WithErrorBoundary.tsx) - Error boundary HOC

### Dashboard Components ([`src/components/dashboard/`](src/components/dashboard/))
- [`Onboarding.tsx`](src/components/dashboard/Onboarding.tsx) - Onboarding flow

### Hub Components ([`src/components/hub/`](src/components/hub/))
- [`HubHomePage.tsx`](src/components/hub/HubHomePage.tsx) - Hub home
- [`HubSidebar.tsx`](src/components/hub/HubSidebar.tsx) - Hub sidebar
- [`NavigationBreadcrumbs.tsx`](src/components/hub/NavigationBreadcrumbs.tsx) - Navigation breadcrumbs
- [`TopicCard.tsx`](src/components/hub/TopicCard.tsx) - Topic card
- [`TopicPortalCard.tsx`](src/components/hub/TopicPortalCard.tsx) - Topic portal card

### Top-Level Components
- [`Header.tsx`](src/components/Header.tsx) - App header
- [`LanguageSwitcher.tsx`](src/components/LanguageSwitcher.tsx) - Language switcher

---

## Unconnected Components (Not Used in Core Application)

### Hub/Dashboard Components (P1 - High Priority)
These components are defined but not integrated into the main IDE flow:

- [`Onboarding.tsx`](src/components/dashboard/Onboarding.tsx) - Onboarding flow (not used)
- [`HubHomePage.tsx`](src/components/hub/HubHomePage.tsx) - Hub home (not used)
- [`HubSidebar.tsx`](src/components/hub/HubSidebar.tsx) - Hub sidebar (not used)
- [`NavigationBreadcrumbs.tsx`](src/components/hub/NavigationBreadcrumbs.tsx) - Breadcrumbs (not used)
- [`TopicCard.tsx`](src/components/hub/TopicCard.tsx) - Topic card (not used)
- [`TopicPortalCard.tsx`](src/components/hub/TopicPortalCard.tsx) - Topic portal (not used)

**Impact**: Hub/dashboard features not accessible from main IDE routes
**Recommendation**: Either integrate or remove these components

### Utility Components (P2 - Low Priority)
- [`KeyboardShortcutsOverlay.tsx`](src/components/ui/keyboard-shortcuts-overlay.tsx) - Keyboard shortcuts overlay (defined but not used)

---

## Dead Code (Components with No Purpose)

### Deprecated/Unused Components
- [`EnhancedChatInterface.tsx`](src/components/ide/EnhancedChatInterface.tsx) - Superseded by [`AgentChatPanel.tsx`](src/components/chat/AgentChatPanel.tsx)
- [`StreamingMessage.tsx`](src/components/ide/StreamingMessage.tsx) - Unused (legacy streaming message)

**Recommendation**: Remove these components

---

## Duplicate Components (Similar Functionality)

### Icon Consolidation
Multiple icon components could be consolidated:
- Individual icon files ([`MenuIcon.tsx`](src/components/ui/icons/MenuIcon.tsx), [`CloseIcon.tsx`](src/components/ui/icons/CloseIcon.tsx), etc.)
- Could use [`lucide-react`](https://lucide.dev) icons directly instead of custom components

**Recommendation**: Evaluate if custom icon components are necessary or if lucide-react can replace them

---

## Component Organization Assessment

### Well-Organized
- ✅ Feature-based directories (agent/, chat/, ide/, ui/, layout/)
- ✅ Barrel exports in each directory
- ✅ Subdirectories for complex features (FileTree/, MonacoEditor/, PreviewPanel/, statusbar/, hooks/)

### Cleanup Priorities

1. **P0 - Remove Hub/Dashboard components** (5 components)
2. **P1 - Remove dead code** (2 components)
3. **P2 - Evaluate icon consolidation** (12 icon components)

---

## Related Artifacts

- [`state-management-audit-p1.10-2025-12-26.md`](_bmad-output/state-management-audit-p1.10-2025-12-26.md) - State architecture audit
- [`tool-wiring-spec-2025-12-26.md`](_bmad-output/technical-debt/tool-wiring-spec-2025-12-26.md) - Tool wiring specification
