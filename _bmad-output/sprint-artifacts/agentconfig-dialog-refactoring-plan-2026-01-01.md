# AgentConfigDialog Refactoring Plan

**Date**: 2026-01-01
**File**: `src/presentation/components/agent/AgentConfigDialog.tsx`
**Current Size**: 1,171 lines
**Target Size**: <200 lines (main component)

---

## Problem Statement

**God Class Anti-Pattern**: `AgentConfigDialog` is a monolithic component that:
- Handles provider configuration (API keys, model selection)
- Manages agent configuration (name, description, system prompt, LLM parameters)
- Configures workspace bindings (4 workspaces)
- Manages tool permissions (7 tools × 4 workspaces = 28 permissions)
- Displays agent preview
- Has complex form validation logic
- Manages connection testing
- Handles multiple tabs (basic, workspace, advanced)

**Violations**:
- ❌ 120 line component limit (1,171 lines = 9.75× over limit)
- ❌ Single responsibility principle (handles too many concerns)
- ❌ Difficult to test (monolithic)
- ❌ Difficult to maintain (large cognitive load)

---

## Refactoring Strategy

### Phase 1: Extract Custom Hooks (Foundation)

Extract all state management and business logic into focused hooks.

**Hook 1: `useAgentFormState`** (~100 lines)
```typescript
// src/presentation/components/agent/hooks/use-agent-form-state.ts
interface AgentFormState {
  formData: AgentFormData
  errors: FormErrors
  connectionStatus: ConnectionStatus
  activeTab: ConfigTab

  // Actions
  setFormData: (data: AgentFormData) => void
  setErrors: (errors: FormErrors) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setActiveTab: (tab: ConfigTab) => void
  validateForm: () => boolean
}
```

**Hook 2: `useProviderConfig`** (~80 lines)
```typescript
// src/presentation/components/agent/hooks/use-provider-config.ts
interface ProviderConfigState {
  providerId: string
  modelId: string
  apiKey: string

  // Actions
  setProviderId: (id: string) => void
  setModelId: (id: string) => void
  setApiKey: (key: string) => void
  testConnection: () => Promise<void>
}
```

**Hook 3: `useWorkspaceBindings`** (~60 lines)
```typescript
// src/presentation/components/agent/hooks/use-workspace-bindings.ts
interface WorkspaceBindingsState {
  bindings: WorkspaceBinding[]

  // Actions
  updateBinding: (workspace: WorkspaceType, isAvailable: boolean) => void
  updateUIVariant: (workspace: WorkspaceType, variant: 'full' | 'compact' | 'minimal') => void
}
```

**Hook 4: `useToolPermissions`** (~100 lines)
```typescript
// src/presentation/components/agent/hooks/use-tool-permissions.ts
interface ToolPermissionsState {
  tools: AgentToolBinding[]

  // Actions
  updateToolEnabled: (toolId: string, enabled: boolean) => void
  updateWorkspacePermission: (toolId: string, workspace: WorkspaceType, enabled: boolean) => void
}
```

---

### Phase 2: Extract Sub-Components (UI)

Break down the UI into focused, reusable components.

**Component 1: `ProviderConfigPanel`** (~150 lines)
```typescript
// src/presentation/components/agent/ProviderConfigPanel.tsx
interface ProviderConfigPanelProps {
  providerId: string
  modelId: string
  apiKey: string
  connectionStatus: ConnectionStatus
  onProviderChange: (id: string) => void
  onModelChange: (id: string) => void
  onApiKeyChange: (key: string) => void
  onTestConnection: () => void
}

// Features:
// - Provider selector (dropdown)
// - Model selector (filtered by provider)
// - API key input with toggle visibility
// - Test connection button with loading state
// - Connection status indicator (success/error)
```

**Component 2: `AgentBasicConfigPanel`** (~150 lines)
```typescript
// src/presentation/components/agent/AgentBasicConfigPanel.tsx
interface AgentBasicConfigPanelProps {
  name: string
  description: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  topP: number
  errors: FormErrors

  onNameChange: (name: string) => void
  onDescriptionChange: (desc: string) => void
  onSystemPromptChange: (prompt: string) => void
  onTemperatureChange: (temp: number) => void
  onMaxTokensChange: (tokens: number) => void
  onTopPChange: (topP: number) => void
}

// Features:
// - Agent name input
// - Description textarea
// - System prompt textarea (with character count)
// - LLM parameter sliders (temperature, max tokens, top P)
// - Validation error messages
```

**Component 3: `WorkspaceBindingPanel`** (~120 lines)
```typescript
// src/presentation/components/agent/WorkspaceBindingPanel.tsx
interface WorkspaceBindingPanelProps {
  bindings: WorkspaceBinding[]
  onBindingToggle: (workspace: WorkspaceType, available: boolean) => void
  onUIVariantChange: (workspace: WorkspaceType, variant: UIVariant) => void
}

// Features:
// - 4 workspace toggles (IDE, Knowledge, Study, Notes)
// - UI variant selector per workspace
// - Visual indicators for availability
```

**Component 4: `ToolPermissionGrid`** (~120 lines)
```typescript
// src/presentation/components/agent/ToolPermissionGrid.tsx
interface ToolPermissionGridProps {
  tools: AgentToolBinding[]
  onToolToggle: (toolId: string, enabled: boolean) => void
  onWorkspacePermissionChange: (toolId: string, workspace: WorkspaceType, enabled: boolean) => void
}

// Features:
// - Grid layout: tools as rows, workspaces as columns
// - Toggle switches for each tool-workspace combination
// - Master toggle per tool (enable/disable all)
// - Visual highlighting for enabled tools
```

**Component 5: `AgentPreviewCard`** (~100 lines)
```typescript
// src/presentation/components/agent/AgentPreviewCard.tsx
interface AgentPreviewCardProps {
  agent: Partial<Agent>
}

// Features:
// - Display agent name and description
// - Show provider + model
// - Show workspace bindings (icons)
// - Show enabled tools (count)
// - System prompt preview (truncated)
// - Visual styling matching 8-bit design system
```

---

### Phase 3: Simplify Main Component

After extracting hooks and components, the main `AgentConfigDialog` should be:

```typescript
// src/presentation/components/agent/AgentConfigDialog.tsx (target: <200 lines)
export function AgentConfigDialog({ open, onOpenChange, mode, agent }: Props) {
  // Custom hooks
  const formState = useAgentFormState()
  const providerConfig = useProviderConfig()
  const workspaceBindings = useWorkspaceBindings()
  const toolPermissions = useToolPermissions()

  // Handlers
  const handleSave = useCallback(() => {
    if (!formState.validateForm()) return

    const agent = buildAgentFromState(
      formState.formData,
      providerConfig,
      workspaceBindings.bindings,
      toolPermissions.tools
    )

    if (mode === 'create') {
      addAgent(agent)
    } else {
      updateAgent(agent.id, agent)
    }

    onOpenChange(false)
  }, [formState, providerConfig, workspaceBindings, toolPermissions, mode, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Agent' : 'Configure Agent'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={formState.activeTab} onValueChange={formState.setActiveTab}>
          <TabsList>
            <TabsTrigger value="basic">Basic Config</TabsTrigger>
            <TabsTrigger value="workspace">Workspaces</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            {/* Provider Config */}
            <ProviderConfigPanel {...providerConfig} />

            {/* Agent Basic Config */}
            <AgentBasicConfigPanel {...formState} />

            {/* Agent Preview */}
            <AgentPreviewCard agent={buildAgentPreview()} />
          </TabsContent>

          <TabsContent value="workspace">
            {/* Workspace Bindings */}
            <WorkspaceBindingPanel {...workspaceBindings} />

            {/* Tool Permissions */}
            <ToolPermissionGrid {...toolPermissions} />
          </TabsContent>

          <TabsContent value="advanced">
            {/* Advanced settings - TBD */}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === 'create' ? 'Create Agent' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Target Size**: ~150 lines (down from 1,171 lines = 87.5% reduction!)

---

## Implementation Order

### Step 1: Create Hooks Directory (Day 3 Morning)
```
src/presentation/components/agent/hooks/
├── use-agent-form-state.ts
├── use-provider-config.ts
├── use-workspace-bindings.ts
└── use-tool-permissions.ts
```

### Step 2: Extract Components (Day 3 Afternoon)
```
src/presentation/components/agent/
├── ProviderConfigPanel.tsx
├── AgentBasicConfigPanel.tsx
├── WorkspaceBindingPanel.tsx
├── ToolPermissionGrid.tsx
└── AgentPreviewCard.tsx
```

### Step 3: Refactor Main Component (Day 4 Morning)
- Replace inline state with hooks
- Replace inline JSX with components
- Test end-to-end

### Step 4: Update Tests (Day 4 Afternoon)
- Add tests for each hook
- Add tests for each component
- Update integration tests

---

## Migration Strategy

### No Breaking Changes
- Existing `AgentConfigDialog` API remains unchanged
- All props stay the same
- All behaviors stay the same
- This is purely an internal refactor

### Testing Strategy
1. **Unit Tests**: Test each hook and component in isolation
2. **Integration Tests**: Test main component with all hooks
3. **E2E Tests**: Verify dialog works in real usage (create/edit agents)
4. **Visual Regression**: Ensure UI looks identical

### Rollback Plan
If refactoring breaks functionality:
1. Git revert to previous version
2. Identify what broke
3. Fix and retry refactoring
4. Use feature flags if needed (but likely not necessary)

---

## Success Criteria

✅ **Code Quality**:
- Main component <200 lines
- Each component <150 lines
- Each hook <100 lines
- All functions <50 lines
- Max 3 nesting levels

✅ **Maintainability**:
- Single responsibility per component
- Clear separation of concerns
- Easy to test in isolation
- Easy to modify one feature without affecting others

✅ **Performance**:
- No performance regression
- Same number of re-renders (or fewer)
- No unnecessary prop drilling

✅ **User Experience**:
- UI looks identical
- Behaviors work identically
- No new bugs

---

## Estimated Effort

- **Step 1 (Hooks)**: 4 hours
- **Step 2 (Components)**: 6 hours
- **Step 3 (Refactor)**: 2 hours
- **Step 4 (Tests)**: 4 hours

**Total**: ~16 hours (2 days for 1 developer)

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|-------|------------|
| Breaking existing functionality | Medium | High | Comprehensive testing, incremental refactoring |
| Performance regression | Low | Medium | Benchmark before/after, use React DevTools Profiler |
| UI visual regression | Low | Low | Visual regression tests, manual QA |
| State management complexity | Medium | Medium | Keep hooks simple, avoid over-optimization |

---

## Next Steps

1. ✅ Create this refactoring plan
2. ⏳ Get approval from team (or proceed in autonomous mode)
3. ⏳ Create hooks directory
4. ⏳ Extract first hook (`useAgentFormState`)
5. ⏳ Continue with remaining hooks
6. ⏳ Extract components
7. ⏳ Refactor main component
8. ⏳ Test thoroughly
9. ⏳ Deploy and monitor

---

**Status**: 📋 **PLANNING COMPLETE** - Ready to proceed with implementation
