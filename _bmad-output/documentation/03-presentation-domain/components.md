# Presentation Components Documentation

## Overview

The `src/presentation` directory contains 479 TypeScript files totaling 72,334 lines of code. Components are organized into 20 categories by feature domain.

## Component Categories

### 1. Agent Components (`src/presentation/components/agent/`)

#### AgentConfigDialog

**Purpose:** Main dialog for configuring AI agents with tabbed interface.

**Location:** `src/presentation/components/agent/AgentConfigDialog.tsx`

**Props:**
```typescript
interface AgentConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (agentId: string) => void;
  agentId: string | null;
}
```

**Features:**
- Three tabs: Basic, Workspace, Advanced
- Provider and model selection
- Workspace binding configuration
- Tool permissions management
- Import/export functionality
- Unsaved changes warning

**Dependencies:**
- `useAgentFormState` hook
- `useAgentFormValidation` hook
- `useUnsavedChangesWarning` hook
- `AgentConfigDialogHeader`
- `AgentConfigDialogFooter`

**Developer Notes:**
- Refactored in Ralph Loop Cycle 17 to use extracted components
- Uses Zustand store for state management
- Supports both new agent creation and existing agent editing

#### AgentManager

**Purpose:** Comprehensive agent management UI with quick access to configuration.

**Location:** `src/presentation/components/agent/AgentManager.tsx`

**Props:**
```typescript
interface AgentManagerProps {
  variant?: 'compact' | 'full';
  workspaceType?: 'ide' | 'knowledge' | 'study' | 'notes';
  disabled?: boolean;
  onSelectAgent?: (agent: Agent) => void;
}
```

**Features:**
- Agent list display with status indicators
- Quick config button
- Capability badges (Tools, DeepThink, Memory)
- Workspace binding toggle
- Status display

#### UnifiedAgentSelector

**Purpose:** Workspace-aware agent selector with proper per-workspace store integration.

**Location:** `src/presentation/components/agent/UnifiedAgentSelector.tsx`

**Props:**
```typescript
interface UnifiedAgentSelectorProps {
  variant?: 'compact' | 'full';
  workspaceType?: WorkspaceType;
  disabled?: boolean;
  onSelectAgent?: (agent: Agent) => void;
}
```

**Developer Notes:**
- Fixes store fragmentation bug (Cycle 18)
- Uses `useAgentSelectionStore` for per-workspace state
- Auto-detects workspace if not provided

#### ToolTrustLevelManager

**Purpose:** Global tool trust level configuration with localStorage persistence.

**Location:** `src/presentation/components/agent/ToolTrustLevelManager.tsx`

**Features:**
- Trust level selectors per tool (auto, prompt, block)
- localStorage persistence
- Toast notifications for save/confirm
- Graceful degradation on storage errors

### 2. Chat Components (`src/presentation/components/chat/`)

#### ChatPanel

**Purpose:** Main entry point for the AI chat platform, orchestrates between threads list and active conversation.

**Location:** `src/presentation/components/chat/ChatPanel.tsx`

**Props:**
```typescript
interface ChatPanelProps {
  projectId: string;
  className?: string;
}
```

**Features:**
- ThreadsList view when no thread active
- ChatConversation view when thread selected
- Agent selection integration
- Mobile-responsive design

#### ChatConversation

**Purpose:** Displays active conversation with message streaming.

**Location:** `src/presentation/components/chat/ChatConversation.tsx`

**Props:**
```typescript
interface ChatConversationProps {
  thread: Thread;
  onSelectAgent: (agent: Agent) => void;
  onSendMessage: (message: string) => void;
  onBack: () => void;
  isStreaming?: boolean;
  streamingContent?: string;
  error?: string | null;
  className?: string;
}
```

**Features:**
- Virtual scrolling for long conversations
- Message bubbles with role differentiation
- Tool call badges and execution indicators
- Streaming content rendering
- Error state handling

#### ThreadsList

**Purpose:** Paginated grid view of conversation threads.

**Location:** `src/presentation/components/chat/ThreadsList.tsx`

**Props:**
```typescript
interface ThreadsListProps {
  threads: Thread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onNewThread: () => void;
  className?: string;
  pageSize?: number;
}
```

**Features:**
- Paginated card grid layout
- Thread preview with messages count
- Delete confirmation
- New thread creation

### 3. IDE Components (`src/presentation/components/ide/`)

#### MonacoEditor

**Purpose:** Code editor with Monaco Editor integration.

**Location:** `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx`

**Props:**
```typescript
interface MonacoEditorProps {
  filePath: string;
  content: string;
  language?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  theme?: 'vs-dark' | 'light';
}
```

**Features:**
- Syntax highlighting
- Auto-completion
- Minimap
- Keyboard shortcuts
- Tab management via EditorTabBar

#### FileTree

**Purpose:** File system navigation with context menu and keyboard navigation.

**Location:** `src/presentation/components/ide/FileTree/FileTree.tsx`

**Props:**
```typescript
interface FileTreeProps {
  rootPath: string;
  onSelectFile: (path: string) => void;
  onContextMenu?: (path: string, event: MouseEvent) => void;
  className?: string;
}
```

**Features:**
- Recursive directory rendering
- Context menu with actions
- Keyboard navigation (Arrow keys, Enter, Backspace)
- File type icons
- Expanded state persistence

#### XTerminal

**Purpose:** Terminal emulator with WebContainer integration.

**Location:** `src/presentation/components/ide/XTerminal.tsx`

**Props:**
```typescript
interface XTerminalProps {
  projectPath: string;
  onCommandComplete?: (command: string) => void;
  className?: string;
}
```

**Features:**
- Shell command execution
- Output streaming
- Command history
- Auto-scroll to bottom

#### AgentChatPanel

**Purpose:** AI agent chat interface within IDE workspace.

**Location:** `src/presentation/components/ide/AgentChatPanel.tsx`

**Props:**
```typescript
interface AgentChatPanelProps {
  projectId: string;
  className?: string;
}
```

**Features:**
- Agent selection and configuration
- Tool approval workflow
- Message streaming
- API key management
- Status indicators

#### CommandPalette

**Purpose:** Quick command access via Ctrl+P/Cmd+P.

**Location:** `src/presentation/components/ide/CommandPalette.tsx`

**Props:**
```typescript
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Features:**
- Command search
- Keyboard navigation
- Recent commands
- Category filtering

### 4. Knowledge Components (`src/presentation/components/knowledge/`)

#### KnowledgePage

**Purpose:** Main knowledge management workspace.

**Location:** `src/presentation/components/knowledge/KnowledgePage.tsx`

**Features:**
- Source collection management
- RAG configuration
- Indexing progress display
- Study artifact generation

#### SourceCard

**Purpose:** Displays knowledge source with metadata.

**Location:** `src/presentation/components/knowledge/SourceCard.tsx`

**Props:**
```typescript
interface SourceCardProps {
  source: Source;
  onSelect?: (source: Source) => void;
  onDelete?: (sourceId: string) => void;
  className?: string;
}
```

**Features:**
- Source type icon
- Metadata display (title, size, date)
- Context menu
- Selection state

#### SourceImportDialog

**Purpose:** Dialog for importing new knowledge sources.

**Location:** `src/presentation/components/knowledge/SourceImportDialog.tsx`

**Props:**
```typescript
interface SourceImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (files: File[]) => void;
}
```

**Features:**
- Drag and drop
- URL input
- Progress tracking

### 5. Study Components (`src/presentation/components/study/`)

#### StudyPage

**Purpose:** Study and quiz workspace.

**Location:** `src/presentation/components/study/StudyPage.tsx`

**Features:**
- Flashcard review
- Quiz generation and taking
- Progress tracking
- Study statistics

#### QuizContainer

**Purpose:** Main quiz taking interface.

**Location:** `src/presentation/components/study/QuizContainer.tsx`

**Features:**
- Question display with multiple choice
- Progress indicator
- Timer
- Results calculation

### 6. UI Base Components (`src/presentation/components/ui/`)

#### Button

**Purpose:** Multi-variant button component with 8-bit design.

**Location:** `src/presentation/components/ui/button.tsx`

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}
```

**Features:**
- CSS custom properties for theming
- Loading spinner
- Icon support
- Disabled state
- Focus visible ring

#### Dialog

**Purpose:** Modal dialog with Radix UI integration.

**Location:** `src/presentation/components/ui/dialog.tsx`

**Features:**
- Focus trap
- Keyboard escape to close
- ARIA attributes
- Animated transitions

#### Card

**Purpose:** Content container with variant support.

**Location:** `src/presentation/components/ui/card.tsx`

**Props:**
```typescript
interface CardProps extends React.ComponentProps<"div"> {
  variant?: 'default' | 'bordered' | 'elevated';
}
```

#### Tabs

**Purpose:** Tab navigation component.

**Location:** `src/presentation/components/ui/tabs.tsx`

**Props:**
```typescript
interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface TabsListProps extends React.ComponentProps<typeof TabsPrimitive.List> {}

interface TabsTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {}

interface TabsContentProps extends React.ComponentProps<typeof TabsPrimitive.Content> {}
```

### 7. Canvas Components (`src/presentation/components/canvas/`)

#### Canvas

**Purpose:** Knowledge visualization with React Flow integration.

**Location:** `src/presentation/components/canvas/Canvas.tsx`

**Props:**
```typescript
interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: (changes: NodeChange[]) => void;
  onEdgesChange?: (changes: EdgeChange[]) => void;
  onConnect?: (connection: Connection) => void;
}
```

**Features:**
- Node dragging and connecting
- Zoom and pan
- Custom node types (ConceptNode, SourceNode)
- Edge types (RelationshipEdge)

### 8. Common Components (`src/presentation/components/common/`)

#### ErrorBoundary

**Purpose:** Catches and displays React component errors.

**Location:** `src/presentation/components/common/ErrorBoundary.tsx`

**Features:**
- Error state UI
- Retry button
- Error logging
- Fallback component support

#### UnsavedChangesDialog

**Purpose:** Warns users before navigating away with unsaved changes.

**Location:** `src/presentation/components/common/UnsavedChangesDialog.tsx`

**Features:**
- Browser native beforeunload event
- Accessible modal with focus trap
- Customizable messages
- Programmatic navigation check

## Component Patterns

### Props Interface Pattern

All components define explicit interfaces for props:

```typescript
interface ComponentNameProps {
  // Required props
  requiredProp: Type;
  // Optional props with defaults
  optionalProp?: Type;
  // Callback props
  onAction?: (data: Data) => void;
  // Style props
  className?: string;
}
```

### Hook Pattern

Complex components extract logic into custom hooks:

```typescript
// Hook for form state management
function useAgentFormState(agentId: string | null) {
  const agent = useAgentsStore(s => s.agents.find(a => a.id === agentId));
  const [state, setState] = useState(initialState);
  
  return {
    ...state,
    setState,
    // Derived state
    isValid: validate(state),
  };
}
```

### Accessibility Pattern

Components include ARIA attributes:

```tsx
<button
  aria-label={t('actions.delete')}
  aria-describedby="delete-help"
  role="button"
>
  <TrashIcon />
</button>
```

## Developer Notes

### File Organization

- Components are grouped by feature domain
- Sub-components live in subdirectories
- Barrel exports (`index.ts`) for clean imports
- Tests co-located with `__tests__/` directories

### Import Convention

```typescript
// Preferred: Barrel exports
import { Button, Card, Dialog } from '@/presentation/components/ui';

// Specific imports for large components
import { AgentConfigDialog } from '@/presentation/components/agent';
```

### Component Size Guidelines

- Target: < 120 lines per component
- Extract complex logic into hooks
- Use composition for reusable UI patterns
