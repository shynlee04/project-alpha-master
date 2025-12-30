# Component Inventory

Complete inventory of React components organized by feature area.

## Layout Components

### IDELayout
**Location**: `src/components/layout/IDELayout.tsx`

Main desktop IDE layout with resizable panels.

**Props**:
```typescript
interface IDELayoutProps {
    children: React.ReactNode;
}
```

**Sub-components**:
- `IDEHeaderBar` - Top navigation bar
- `IconSidebar` - Left sidebar with icons
- `PanelShell` - Resizable panel containers

### MobileIDELayout
**Location**: `src/components/layout/MobileIDELayout.tsx`

Mobile-specific layout with bottom navigation.

### TerminalPanel
**Location**: `src/components/layout/TerminalPanel.tsx`

Terminal wrapper with XTerminal integration.

---

## IDE Components

### AgentChatPanel
**Location**: `src/components/ide/AgentChatPanel.tsx`

AI chat panel with tool execution display and approval workflow.

**Features**:
- Streaming message display
- Tool call badges
- Approval overlays
- Diff previews

### FileTree
**Location**: `src/components/ide/FileTree/FileTree.tsx`

File tree component with context menu support.

**Sub-components**:
- `FileTreeItem` - Individual file/folder item
- `ContextMenu` - Right-click context menu

**Hooks**:
- `useFileTreeState` - Tree state management
- `useFileTreeActions` - File operations
- `useKeyboardNavigation` - Keyboard navigation

### MonacoEditor
**Location**: `src/components/ide/MonacoEditor/MonacoEditor.tsx`

Monaco editor wrapper with tabs.

**Features**:
- Multi-tab support
- Syntax highlighting
- Auto-completion
- Editor state persistence

**Sub-components**:
- `EditorTabBar` - Tab bar for open files

### XTerminal
**Location**: `src/components/ide/XTerminal.tsx`

xterm.js terminal integration.

**Features**:
- WebContainer shell connection
- Command history
- Resize handling

### StatusBar
**Location**: `src/components/ide/StatusBar.tsx`

Status bar with multiple segments.

**Segments**:
- `AgentStatusSegment` - Current agent status
- `ProviderStatus` - LLM provider status
- `SyncStatusSegment` - File sync status
- `WebContainerStatus` - WebContainer connection status
- `CursorPosition` - Editor cursor position
- `FileTypeIndicator` - Current file type

### CommandPalette
**Location**: `src/components/ide/CommandPalette.tsx`

Ctrl+P/Cmd+P command palette for quick actions.

### PreviewPanel
**Location**: `src/components/ide/PreviewPanel/PreviewPanel.tsx`

Preview iframe for web projects.

### SearchPanel
**Location**: `src/components/ide/SearchPanel.tsx`

File search and content search panel.

---

## Agent Components

### AgentConfigDialog
**Location**: `src/components/agent/AgentConfigDialog.tsx`

Agent configuration modal dialog.

**Features**:
- Agent name editing
- Provider selection
- Model selection
- System prompt configuration

### ProviderConfigDialog
**Location**: `src/components/agent/ProviderConfigDialog.tsx`

LLM provider configuration modal.

**Features**:
- API key input
- Base URL configuration
- Model selection

### ToolPermissionsConfig
**Location**: `src/components/agent/ToolPermissionsConfig.tsx`

Tool permission settings for agents.

---

## Chat Components

### ChatPanel
**Location**: `src/components/chat/ChatPanel.tsx`

Main chat interface container.

### ChatConversation
**Location**: `src/components/chat/ChatConversation.tsx`

Conversation message display.

### CodeBlock
**Location**: `src/components/chat/CodeBlock.tsx`

Code block renderer with syntax highlighting.

### DiffPreview
**Location**: `src/components/chat/DiffPreview.tsx`

Git-style diff preview for file changes.

### ApprovalOverlay
**Location**: `src/components/chat/ApprovalOverlay.tsx`

Tool execution approval dialog.

### BatchApprovalBar
**Location**: `src/components/chat/BatchApprovalBar.tsx`

Batch approval for multiple tool calls.

### ThreadsList
**Location**: `src/components/chat/ThreadsList.tsx`

Sidebar list of conversation threads.

---

## UI Components

### Button
**Location**: `src/components/ui/Button/Button.tsx`

CVA-styled button component.

### Dialog
**Location**: `src/components/ui/Dialog/Dialog.tsx`

Radix Dialog wrapper.

### Input
**Location**: `src/components/ui/Input/Input.tsx`

Text input with label support.

### Toast
**Location**: `src/components/ui/Toast/Toast.tsx`

Toast notification system.

### EmptyState
**Location**: `src/components/ui/EmptyState.tsx`

Empty state placeholder.

### ErrorState
**Location**: `src/components/ui/ErrorState.tsx`

Error state display with recovery options.

### LoadingState
**Location**: `src/components/ui/LoadingState.tsx`

Loading spinner with message.

### SkeletonLoader
**Location**: `src/components/ui/SkeletonLoader.tsx`

Skeleton loading placeholder.

### ThemeToggle
**Location**: `src/components/ui/ThemeToggle.tsx`

Dark/light mode toggle.

---

## Common Components

### ErrorBoundary
**Location**: `src/components/common/ErrorBoundary.tsx`

React error boundary wrapper.

### AppInitializer
**Location**: `src/components/common/AppInitializer.tsx`

App initialization with permission requests.

---

## Hub Components

### TopicCard
**Location**: `src/components/hub/TopicCard.tsx`

Card for displaying topics in hub view.

### TopicPortalCard
**Location**: `src/components/hub/TopicPortalCard.tsx`

Portal card for topic navigation.

---

## Design System

### Styling
- **Framework**: TailwindCSS 4
- **Color Palette**: 8-bit dark theme
- **Design Tokens**: `src/styles/design-tokens.css`

### Icons
- **Library**: lucide-react
- **Usage**: Consistent 8-bit styled icons

### Animations
- **Source**: `src/styles/animations.css`
- **Theme**: 8-bit gaming style animations

---

## Component Count Summary

| Category | Count |
|----------|-------|
| Layout | 6 |
| IDE Core | 15+ |
| Agent | 4 |
| Chat | 10+ |
| UI Primitives | 15+ |
| Common | 2 |
| Hub | 4 |
| **Total** | **100+** |

---

*Generated: 2025-12-31*
