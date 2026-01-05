# Custom Hooks Documentation

## Overview

The presentation layer uses 89 custom hooks organized by feature domain. Hooks encapsulate reusable logic, state management, and side effects following React best practices.

## Hook Categories

| Category | Count | Location |
|----------|-------|----------|
| Agent | 5 | `src/presentation/components/agent/hooks/` |
| IDE | 8 | `src/presentation/components/ide/hooks/` |
| Layout | 5 | `src/presentation/components/layout/hooks/` |
| FileTree | 6 | `src/presentation/components/ide/FileTree/hooks/` |
| Monaco | 2 | `src/presentation/components/ide/MonacoEditor/hooks/` |
| Terminal | 1 | `src/presentation/components/ide/XTerminal/hooks/` |

## Agent Hooks

### useAgentFormState

**Purpose:** Manages agent form state with local↔store synchronization.

**Location:** `src/presentation/components/agent/hooks/useAgentFormState.ts`

**Signature:**
```typescript
function useAgentFormState(agentId: string | null): {
  // Form fields
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  providerId: string;
  setProviderId: Dispatch<SetStateAction<string>>;
  modelId: string;
  setModelId: Dispatch<SetStateAction<string>>;
  temperature: number;
  setTemperature: Dispatch<SetStateAction<number>>;
  maxTokens: number;
  setMaxTokens: Dispatch<SetStateAction<number>>;
  topP: number;
  setTopP: Dispatch<SetStateAction<number>>;
  topK: number | undefined;
  setTopK: Dispatch<SetStateAction<number | undefined>>;
  systemPrompt: string;
  setSystemPrompt: Dispatch<SetStateAction<string>>;
  customBaseURL: string;
  setCustomBaseURL: Dispatch<SetStateAction<string>>;
  customModelId: string;
  setCustomModelId: Dispatch<SetStateAction<string>>;
  customHeaders: { key: string; value: string; }[];
  setCustomHeaders: Dispatch<SetStateAction<{ key: string; value: string; }[]>>;
  enableNativeTools: boolean;
  setEnableNativeTools: Dispatch<SetStateAction<boolean>>;
  workspaceBindings: WorkspaceBinding[];
  setWorkspaceBindings: Dispatch<SetStateAction<WorkspaceBinding[]>>;
  tools: AgentToolBinding[];
  setTools: Dispatch<SetStateAction<AgentToolBinding[]>>;
  activeTab: 'basic' | 'workspace' | 'advanced';
  setActiveTab: Dispatch<SetStateAction<'basic' | 'workspace' | 'advanced'>>;
  isSubmitting: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;

  // Store data
  agent: Agent | undefined;
  providers: ProviderConfig[];
  models: ModelInfo[];
  isLoadingModels: boolean;
  fetchModels: (providerId: string) => Promise<void>;

  // Actions
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => Agent;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
}
```

**Usage:**
```typescript
const {
  name, setName,
  providerId, setProviderId,
  models, isLoadingModels,
  fetchModels,
} = useAgentFormState(agentId);
```

### useAgentFormSubmission

**Purpose:** Handles agent form submission with validation and toast notifications.

**Location:** `src/presentation/components/agent/hooks/useAgentFormSubmission.ts`

**Signature:**
```typescript
interface UseAgentFormSubmissionProps {
  agentId: string | null;
  onSuccess?: (agentId: string) => void;
  onOpenChange: (open: boolean) => void;
  validate: () => boolean;
  formData: AgentFormData;
}

function useAgentFormSubmission(props: UseAgentFormSubmissionProps): {
  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
}
```

**Features:**
- Validates form before submission
- Creates or updates agent
- Shows success/error toasts
- Closes dialog on success
- Manages loading state

### useAgentFormValidation

**Purpose:** Provides validation logic for agent configuration forms.

**Location:** `src/presentation/components/agent/hooks/useAgentFormValidation.ts`

**Signature:**
```typescript
function useAgentFormValidation(props: UseAgentFormValidationProps): ValidationState & {
  validate: () => boolean;
  validateField: <K extends keyof AgentFormData>(fieldName: K, value: AgentFormData[K]) => string | undefined;
}
```

**Validation Rules:**
- Name: Required, 2-100 characters
- Provider: Required
- Model: Required
- Custom URL: Valid URL format if provided
- Custom Headers: Valid JSON if provided

### useAgentFormActions

**Purpose:** Manages agent form actions (delete, import, export).

**Location:** `src/presentation/components/agent/hooks/useAgentFormActions.ts`

**Signature:**
```typescript
function useAgentFormActions({
  agentId,
  onOpenChange,
  onImportSuccess,
  onExportSuccess,
}: UseAgentFormActionsProps): {
  handleDelete: () => Promise<void>;
  handleImportSuccess: (count: number) => void;
  handleExportSuccess: () => void;
}
```

### useAgentFieldUpdate

**Purpose:** Updates agent form fields with change handlers.

**Location:** `src/presentation/components/agent/hooks/useAgentFieldUpdate.ts`

**Signature:**
```typescript
function useAgentFieldUpdate(setters: FieldUpdateOptions): (field: string, value: any) => void
```

## IDE Hooks

### useAgentChatMessages

**Purpose:** Manages chat message state and operations.

**Location:** `src/presentation/components/ide/hooks/useAgentChatMessages.ts`

**Signature:**
```typescript
function useAgentChatMessages(threadId: string): {
  messages: ThreadMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: ThreadMessage) => void;
  updateMessage: (id: string, updates: Partial<ThreadMessage>) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
}
```

### useAgentChatArtifacts

**Purpose:** Manages AI-generated artifacts (code, explanations, etc.).

**Location:** `src/presentation/components/ide/hooks/useAgentChatArtifacts.ts`

### useAgentChatApproval

**Purpose:** Handles tool execution approval workflow.

**Location:** `src/presentation/components/ide/hooks/useAgentChatApproval.ts`

**Signature:**
```typescript
function useAgentChatApproval(agentId: string): {
  pendingApprovals: ToolApproval[];
  approvedTools: string[];
  isAutoApproveEnabled: boolean;
  approveTool: (toolId: string) => void;
  denyTool: (toolId: string) => void;
  setAutoApprove: (enabled: boolean) => void;
}
```

### useAgentChatApiKeys

**Purpose:** Manages API key availability for agents.

**Location:** `src/presentation/components/ide/hooks/useAgentChatApiKeys.ts`

### useLazyFileContent

**Purpose:** Lazily loads file content on demand.

**Location:** `src/presentation/components/ide/hooks/useLazyFileContent.ts`

**Signature:**
```typescript
function useLazyFileContent(filePath: string): {
  content: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

## FileTree Hooks

### useFileTreeState

**Purpose:** Manages file tree state (expanded nodes, selection).

**Location:** `src/presentation/components/ide/FileTree/hooks/useFileTreeState.ts`

### useFileTreeActions

**Purpose:** File operations (create, delete, rename).

**Location:** `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts`

### useContextMenuActions

**Purpose:** Context menu actions for file tree items.

**Location:** `src/presentation/components/ide/FileTree/hooks/useContextMenuActions.ts`

### useKeyboardNavigation

**Purpose:** Keyboard navigation within file tree.

**Location:** `src/presentation/components/ide/FileTree/hooks/useKeyboardNavigation.ts`

**Key Bindings:**
| Key | Action |
|-----|--------|
| Arrow Up/Down | Navigate items |
| Arrow Left/Right | Expand/collapse folders |
| Enter | Open selected file |
| Backspace | Go to parent folder |
| F2 | Rename selected |
| Delete | Delete selected |

### useFileTreeEventSubscriptions

**Purpose:** Subscribes to file system events.

**Location:** `src/presentation/components/ide/FileTree/hooks/useFileTreeEventSubscriptions.ts`

## Layout Hooks

### useIDEKeyboardShortcuts

**Purpose:** Manages IDE keyboard shortcuts.

**Location:** `src/presentation/components/layout/hooks/useIDEKeyboardShortcuts.ts`

**Signature:**
```typescript
function useIDEKeyboardShortcuts(): {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (key: string, action: () => void, options?: ShortcutOptions) => void;
  unregisterShortcut: (key: string) => void;
  triggerShortcut: (key: string) => void;
}
```

### useIDEStateRestoration

**Purpose:** Persists and restores IDE state.

**Location:** `src/presentation/components/layout/hooks/useIDEStateRestoration.ts`

**State Restored:**
- Open tabs and their order
- Panel sizes and positions
- Selected file
- Scroll positions

### useWebContainerBoot

**Purpose:** Manages WebContainer initialization.

**Location:** `src/presentation/components/layout/hooks/useWebContainerBoot.ts`

**Signature:**
```typescript
function useWebContainerBoot(): {
  isBooting: boolean;
  isReady: boolean;
  error: Error | null;
  boot: () => Promise<void>;
  retry: () => Promise<void>;
}
```

### useIDEFileHandlers

**Purpose:** File operation handlers for IDE.

**Location:** `src/presentation/components/layout/hooks/useIDEFileHandlers.ts`

**Handlers:**
- `onFileOpen(path)`
- `onFileSave(path, content)`
- `onFileCreate(path, content)`
- `onFileDelete(path)`
- `onFileRename(oldPath, newPath)`

## Monaco Hooks

### useMonacoEventSubscriptions

**Purpose:** Monaco editor event subscriptions.

**Location:** `src/presentation/components/ide/MonacoEditor/hooks/useMonacoEventSubscriptions.ts`

### useMonacoEditorEventSubscriptions

**Purpose:** Monaco editor lifecycle events.

**Location:** `src/presentation/components/ide/MonacoEditor/hooks/useMonacoEditorEventSubscriptions.ts`

## Terminal Hooks

### useTerminalEventSubscriptions

**Purpose:** Terminal output event subscriptions.

**Location:** `src/presentation/components/ide/XTerminal/hooks/useTerminalEventSubscriptions.ts`

## Common Hooks

### useUnsavedChangesWarning

**Purpose:** Warns users before navigating away with unsaved changes.

**Location:** `src/presentation/components/common/hooks/useUnsavedChangesWarning.ts`

**Signature:**
```typescript
function useUnsavedChangesWarning(config: UnsavedChangesConfig): {
  confirmNavigation: () => boolean;
  dismissWarning: () => void;
}
```

**Usage:**
```typescript
const { confirmNavigation } = useUnsavedChangesWarning({
  hasUnsavedChanges: isDirty,
  message: 'You have unsaved changes. Are you sure you want to leave?',
});

const handleNavigate = () => {
  if (confirmNavigation()) {
    navigate('/other-page');
  }
};
```

## Hook Development Guidelines

### Creating New Hooks

1. Place in appropriate subdirectory
2. Export function with `use` prefix
3. Include JSDoc documentation
4. Define TypeScript interfaces
5. Return typed object or tuple

**Template:**
```typescript
/**
 * Hook description
 * 
 * @description Detailed description of what the hook does
 * @param params - Hook parameters
 * @returns Hook return values
 */
export function useHookName(params: Params): ReturnType {
  // Implementation
  return {
    // return values
  };
}
```

### Hook Composition

Compose hooks for complex functionality:

```typescript
export function useComplexFeature(config) {
  const state = useFeatureState(config);
  const actions = useFeatureActions(config);
  const validation = useFeatureValidation(config);
  
  return {
    ...state,
    ...actions,
    ...validation,
  };
}
```

### Performance

- Memoize expensive calculations
- Use useMemo/useCallback appropriately
- Unsubscribe from events on cleanup
- Avoid unnecessary re-renders
