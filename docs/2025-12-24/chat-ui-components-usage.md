# Chat UI Components Usage Guide

**EPIC_ID**: Epic-28  
**STORY_ID**: Story 28-23  
**CREATED_AT**: 2025-12-24T13:35:00Z

## Overview

This document describes the chat UI components for the Via-gent IDE's AI agent system. These components provide a rich, interactive chat interface with support for tool execution, code blocks, diff previews, and streaming responses.

## Components

### 1. StreamingMessage

**Location**: [`src/components/ide/StreamingMessage.tsx`](src/components/ide/StreamingMessage.tsx)

Displays streaming text content with character-by-character animation and Markdown rendering.

#### Props

```typescript
interface StreamingMessageProps {
    content: string;           // The text content to display
    instant?: boolean;         // Skip animation and show immediately
    typingSpeed?: number;      // Milliseconds between characters (default: 20)
    onComplete?: () => void;   // Callback when streaming completes
}
```

#### Features

- Character-by-character streaming animation
- Simple Markdown rendering (bold, italic, inline code)
- Code block detection and rendering via [`CodeBlock`](src/components/chat/CodeBlock.tsx)
- Blinking cursor during streaming
- `onComplete` callback when animation finishes

#### Usage

```tsx
<StreamingMessage 
    content="Hello **world**! Here's some code:\n```js\nconsole.log('hi');\n```"
    onComplete={() => console.log('Done streaming')}
/>
```

---

### 2. ToolCallBadge

**Location**: [`src/components/chat/ToolCallBadge.tsx`](src/components/chat/ToolCallBadge.tsx)

Displays a tool execution badge with status indicator and expandable details.

#### Props

```typescript
interface ToolCallBadgeProps {
    toolName: string;          // Name of the tool (e.g., 'read_file')
    status: ToolCallStatus;    // 'pending' | 'running' | 'success' | 'error'
    startTime?: number;        // Unix timestamp when tool started
    endTime?: number;          // Unix timestamp when tool completed
    result?: any;              // Tool result (for success/error states)
    params?: Record<string, any>; // Tool parameters
    className?: string;        // Additional CSS classes
}
```

#### Features

- Status-based styling (yellow for pending, blue for running, green for success, red for error)
- Tooltip showing tool details
- Expandable parameter and result display
- Duration calculation for completed tool calls
- ToolCallBadgeGroup for displaying multiple badges

#### Usage

```tsx
<ToolCallBadge 
    toolName="read_file"
    status="success"
    startTime={1703424000000}
    endTime={1703424002000}
    params={{ path: "src/index.ts" }}
    result={{ content: "console.log('hello');" }}
/>
```

---

### 3. ApprovalOverlay

**Location**: [`src/components/chat/ApprovalOverlay.tsx`](src/components/chat/ApprovalOverlay.tsx)

Modal overlay for approving or rejecting tool execution requests.

#### Props

```typescript
interface ApprovalOverlayProps {
    isOpen: boolean;           // Whether overlay is visible
    toolName: string;          // Name of the tool
    description: string;       // Human-readable description
    toolArgs?: Record<string, any>; // Tool arguments
    riskLevel?: 'low' | 'medium' | 'high'; // Risk level for styling
    proposedContent?: string;  // Proposed content (for write operations)
    onApprove: () => void;     // Callback when approved
    onReject: (reason?: string) => void; // Callback when rejected
    mode?: 'fullscreen' | 'inline'; // Display mode
}
```

#### Features

- Fullscreen or inline display modes
- Risk level indicators (low=green, medium=yellow, high=red)
- Tool description and parameters display
- Proposed content preview for write operations
- Approve/Reject buttons with keyboard shortcuts
- Auto-approve for safe operations (read, list)

#### Usage

```tsx
<ApprovalOverlay
    isOpen={true}
    toolName="write_file"
    description="Write to file: src/index.ts"
    toolArgs={{ path: "src/index.ts", content: "console.log('hello');" }}
    riskLevel="medium"
    proposedContent="console.log('hello');"
    onApprove={() => handleApprove()}
    onReject={(reason) => handleReject(reason)}
/>
```

---

### 4. CodeBlock

**Location**: [`src/components/chat/CodeBlock.tsx`](src/components/chat/CodeBlock.tsx)

Displays code with syntax highlighting and action buttons.

#### Props

```typescript
interface CodeBlockProps {
    code: string;              // The code content
    language?: string;         // Programming language (e.g., 'typescript')
    onCopy?: () => void;       // Callback when copy button clicked
    onAccept?: () => void;     // Callback when accept button clicked
    onReject?: () => void;     // Callback when reject button clicked
    showActions?: boolean;     // Whether to show action buttons
    className?: string;        // Additional CSS classes
}
```

#### Features

- Simple syntax highlighting with custom tokenizer
- Language indicator badge
- Copy code to clipboard button
- Accept/Reject buttons for code changes
- Line count display
- Dark theme styling

#### Usage

```tsx
<CodeBlock
    code="console.log('hello world');"
    language="javascript"
    showActions={true}
    onCopy={() => copyToClipboard()}
    onAccept={() => applyCode()}
    onReject={() => discardCode()}
/>
```

---

### 5. DiffPreview

**Location**: [`src/components/chat/DiffPreview.tsx`](src/components/chat/DiffPreview.tsx)

Displays a line-by-line diff between two file contents.

#### Props

```typescript
interface DiffPreviewProps {
    before: string;            // Original content
    after: string;             // New content
    filename?: string;         // Optional filename for display
    onAccept?: () => void;     // Callback when accept button clicked
    onReject?: () => void;     // Callback when reject button clicked
    showActions?: boolean;     // Whether to show action buttons
    className?: string;        // Additional CSS classes
}
```

#### Features

- Line-based diff algorithm (LCS-inspired)
- Color-coded additions (green) and deletions (red)
- Collapsible unchanged sections
- Addition/deletion statistics
- Accept/Reject buttons for applying changes
- Inline diff view

#### Usage

```tsx
<DiffPreview
    before="console.log('old');"
    after="console.log('new');"
    filename="src/index.ts"
    showActions={true}
    onAccept={() => applyDiff()}
    onReject={() => discardDiff()}
/>
```

---

### 6. AgentChatPanel

**Location**: [`src/components/ide/AgentChatPanel.tsx`](src/components/ide/AgentChatPanel.tsx)

Main chat panel component integrating all chat UI components with the AI agent system.

#### Props

```typescript
interface AgentChatPanelProps {
    projectId: string;         // Project identifier
    projectName?: string;      // Optional project name for welcome message
}
```

#### Features

- Integrates with [`useAgentChatWithTools`](src/lib/agent/hooks/use-agent-chat-with-tools.ts) hook
- Displays chat messages with [`StreamingMessage`](src/components/ide/StreamingMessage.tsx)
- Shows tool execution badges with [`ToolCallBadge`](src/components/chat/ToolCallBadge.tsx)
- Handles approval workflow with [`ApprovalOverlay`](src/components/chat/ApprovalOverlay.tsx)
- Message persistence via IndexedDB
- Error handling and display
- Model ID display in header
- Clear conversation button

#### Usage

```tsx
<AgentChatPanel 
    projectId="project-123"
    projectName="My Project"
/>
```

#### Integration Notes

The component requires a [`WorkspaceProvider`](src/lib/workspace/WorkspaceContext.tsx) context to function properly. It uses the following hooks and services:

- [`useAgentChatWithTools`](src/lib/agent/hooks/use-agent-chat-with-tools.ts) - Chat with tool integration
- [`credentialVault`](src/lib/agent/providers/credential-vault.ts) - API key storage
- [`getConversation`](src/lib/workspace/conversation-store.ts) - Message persistence
- [`appendConversationMessage`](src/lib/workspace/conversation-store.ts) - Save messages

---

## Design System

All components follow the 8-bit design system with:

- **Dark theme**: Pixel-perfect styling with dark backgrounds
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible primitives (Dialog, Tooltip)
- **Lucide Icons**: Consistent iconography

### Color Scheme

- **Background**: `bg-background` (dark gray)
- **Foreground**: `text-foreground` (light gray)
- **Primary**: `text-primary` (accent color)
- **Border**: `border-border` (subtle borders)
- **Success**: Green for approved/success states
- **Warning**: Yellow for pending/medium risk
- **Error**: Red for rejected/error states

---

## Internationalization

All user-facing text uses i18n translation keys. Keys are defined in:

- [`src/i18n/en.json`](src/i18n/en.json) - English translations
- [`src/i18n/vi.json`](src/i18n/vi.json) - Vietnamese translations

### Translation Keys

```json
{
  "agent": {
    "title": "Agent",
    "welcome_message": "Welcome to {{projectName}}",
    "clear": "Clear",
    "placeholder": "Type a message...",
    "tools_ready": "TOOLS READY",
    "error_generic": "An error occurred",
    "key_missing": "Missing API key for {{provider}}. Please configure in AI Agents panel."
  },
  "approval": {
    "title": "Approve Tool Execution",
    "description": "The AI agent wants to execute the following tool:",
    "approve": "Approve",
    "reject": "Reject",
    "risk_level": "Risk Level",
    "low": "Low",
    "medium": "Medium",
    "high": "High",
    "proposed_changes": "Proposed Changes",
    "no_changes": "No changes proposed"
  },
  "code": {
    "copy": "Copy",
    "accept": "Accept",
    "reject": "Reject",
    "lines": "{{count}} lines"
  },
  "diff": {
    "additions": "{{count}} additions",
    "deletions": "{{count}} deletions",
    "no_changes": "No changes"
  },
  "tool": {
    "status": {
      "pending": "Pending",
      "running": "Running",
      "success": "Success",
      "error": "Error"
    },
    "duration": "Duration: {{duration}}ms",
    "parameters": "Parameters",
    "result": "Result"
  }
}
```

---

## Testing

All components have comprehensive unit tests located in `__tests__` directories:

- [`src/components/chat/__tests__/ApprovalOverlay.test.tsx`](src/components/chat/__tests__/ApprovalOverlay.test.tsx)
- [`src/components/chat/__tests__/CodeBlock.test.tsx`](src/components/chat/__tests__/CodeBlock.test.tsx)
- [`src/components/chat/__tests__/DiffPreview.test.tsx`](src/components/chat/__tests__/DiffPreview.test.tsx)
- [`src/components/chat/__tests__/ToolCallBadge.test.tsx`](src/components/chat/__tests__/ToolCallBadge.test.tsx)
- [`src/components/ide/__tests__/StreamingMessage.test.tsx`](src/components/ide/__tests__/StreamingMessage.test.tsx)
- [`src/components/ide/__tests__/AgentChatPanel.test.tsx`](src/components/ide/__tests__/AgentChatPanel.test.tsx)

### Running Tests

```bash
# Run all chat component tests
pnpm test -- src/components/chat/__tests__ src/components/ide/__tests__/StreamingMessage.test.tsx

# Run with coverage
pnpm test -- --coverage
```

---

## Accessibility

All components follow accessibility best practices:

- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader compatible
- Focus management for modals
- Semantic HTML structure

---

## Performance Considerations

- **Streaming**: Uses `requestAnimationFrame` for smooth character-by-character animation
- **Diff algorithm**: Efficient LCS-inspired algorithm for large files
- **Code highlighting**: Simple tokenizer to avoid heavy dependencies
- **Debouncing**: Tool execution and message updates are debounced
- **Memoization**: React.memo for expensive renders

---

## Future Enhancements

Potential improvements for future iterations:

1. **Enhanced Markdown**: Full Markdown support with react-markdown
2. **Monaco Integration**: Use Monaco Editor for code blocks
3. **Diff Improvements**: Word-level diffs, inline diff view
4. **Streaming Optimization**: Incremental parsing for large messages
5. **Tool History**: Persistent tool execution history
6. **Custom Themes**: User-selectable color themes
7. **Export Features**: Export chat history as Markdown/JSON

---

## References

- Research synthesis: [`_bmad-output/research-synthesis-ai-agent-patterns-2025-12-24.md`](_bmad-output/research-synthesis-ai-agent-patterns-2025-12-24.md)
- Roo Code examples: [`_bmad-output/proposal/roo-code-samples.md`](_bmad-output/proposal/roo-code-samples.md)
- Chat hook: [`src/lib/agent/hooks/use-agent-chat-with-tools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts)
- UI components: [`src/components/ui/`](src/components/ui/)
- Translation files: [`src/i18n/en.json`](src/i18n/en.json), [`src/i18n/vi.json`](src/i18n/vi.json)