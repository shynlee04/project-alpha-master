# P0 UI Components Implementation Plan

**Date**: 2026-01-01
**Source**: Ralph Loop Cycle 13 UI Component Gaps Analysis
**Priority**: P0 (Critical - Blocks Functionality)
**Total Components**: 8 UI components
**Estimated Time**: 16 hours (2 hours per component average)

---

## Executive Summary

This plan addresses **8 P0 critical UI gaps** that block core functionality. These gaps prevent users from:

1. Safely managing providers (dependency warnings)
2. Recovering from model fetch failures
3. Seeing agent validation errors
4. Getting confirmation of agent creation
5. Configuring workspace bindings
6. Selecting models after provider changes
7. Configuring advanced LLM settings
8. Confirming permission changes

**Implementation Strategy**: Create 8 focused UI components using existing design system (Radix UI + Tailwind CSS) with proper event activity indicators.

---

## P0 Component 1: Provider Dependency Warning UI

**Gap ID**: P0-1
**Story**: Story P0-1.1
**Priority**: P0 (Critical)
**Estimated Time**: 2 hours

### Problem
Deleting a provider checks for dependent agents but shows no UI feedback. Users can accidentally break agents by deleting their provider.

### Location
- File: `src/presentation/components/agent/ProviderSettings.tsx`
- Lines: 40-52

### Current Behavior
```typescript
removeProvider(provider.id, agents) // Silently checks but no UI
```

### Required UI

**Component Name**: `ProviderDeletionWarningDialog`

**Features**:
1. Show confirmation dialog before deletion
2. List all dependent agents with their names
3. Explain impact: "Deleting 'OpenRouter' will break these agents: Agent A, Agent B"
4. Two buttons:
   - "Cancel" (default)
   - "Delete Provider Anyway" (destructive action)
5. Use existing `Dialog` component from `src/presentation/components/ui/dialog.tsx`
6. Use existing `Badge` component for agent count

### Implementation Strategy

**File**: `src/presentation/components/agent/ProviderDeletionWarningDialog.tsx`

```typescript
interface ProviderDeletionWarningDialogProps {
  providerId: string;
  providerName: string;
  dependentAgents: Agent[];
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  open: boolean;
}

export function ProviderDeletionWarningDialog({
  providerId,
  providerName,
  dependentAgents,
  onConfirm,
  onCancel,
  open,
}: ProviderDeletionWarningDialogProps) {
  // Implementation using AlertDialog from @radix-ui/react-alert-dialog
  // Show list of dependent agents
  // Explain impact clearly
  // Provide clear action buttons
}
```

**Integration**:
```typescript
// In ProviderSettings.tsx
const [pendingDeletion, setPendingDeletion] = useState<string | null>(null);

const handleRemoveProvider = async (providerId: string) => {
  try {
    await removeProvider(providerId, agents);
    // Success - close dialog
  } catch (error) {
    // Show dependency warning dialog
    const dependentAgents = /* extract from error message */;
    setPendingDeletion(providerId);
  }
};

<ProviderDeletionWarningDialog
  providerId={pendingDeletion}
  providerName={providers.find(p => p.id === pendingDeletion)?.name}
  dependentAgents={dependentAgents}
  onConfirm={async () => {
    await forceRemoveProvider(pendingDeletion);
    setPendingDeletion(null);
  }}
  onCancel={() => setPendingDeletion(null)}
  open={pendingDeletion !== null}
/>
```

### Acceptance Criteria
- [ ] Dialog shows when deleting provider with dependent agents
- [ ] Lists all dependent agent names
- [ ] Explains impact clearly
- [ ] "Cancel" button closes dialog
- [ ] "Delete Provider Anyway" button proceeds with deletion
- [ ] Uses existing design system components
- [ ] Accessible (keyboard navigation, screen reader support)
- [ ] i18n support (use `t()` hook)

---

## P0 Component 2: Model Fetch Failure Recovery UI

**Gap ID**: P0-2
**Story**: Story P0-1.2
**Priority**: P0 (Critical)
**Estimated Time**: 2 hours

### Problem
When `fetchModels()` fails, error is shown but no clear recovery path. Users get stuck with incomplete provider configuration.

### Location
- File: `src/presentation/components/agent/ProviderConfigDialog.tsx`
- Lines: 106-116

### Current Behavior
```typescript
setFetchError(errorMessage)
toast.error(`Failed to load models: ${errorMessage}`)
throw error // Prevents dialog close - dead end
```

### Required UI

**Component Name**: `ModelFetchErrorRecovery`

**Features**:
1. Show error message in dialog (not just toast)
2. Explain why fetch failed (API key missing, network error, etc.)
3. Provide recovery actions:
   - "Retry Fetch" button
   - "Configure API Key" button (opens credential vault)
   - "Skip" button (proceed without models)
4. Show loading state during retry
5. Clear error when retry succeeds

### Implementation Strategy

**File**: `src/presentation/components/agent/ModelFetchErrorRecovery.tsx`

```typescript
interface ModelFetchErrorRecoveryProps {
  error: Error | null;
  providerId: string;
  onRetry: () => Promise<void>;
  onConfigureKey: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function ModelFetchErrorRecovery({
  error,
  providerId,
  onRetry,
  onConfigureKey,
  onSkip,
  isLoading,
}: ModelFetchErrorRecoveryProps) {
  // Implementation using Alert from @radix-ui/react-alert-dialog
  // Show error message
  // Provide 3 action buttons
  // Show loading spinner during retry
}
```

### Acceptance Criteria
- [ ] Shows error message when fetch fails
- [ ] "Retry Fetch" button retries fetchModels()
- [ ] "Configure API Key" button opens credential vault
- [ ] "Skip" button allows proceeding without models
- [ ] Loading state shown during retry
- [ ] Error cleared when retry succeeds
- [ ] Accessible and i18n support

---

## P0 Component 3: Agent Validation Error Display

**Gap ID**: P0-3
**Story**: Story P0-2.1
**Priority**: P0 (Critical)
**Estimated Time**: 2 hours

### Problem
Form validation exists but errors are not displayed inline. Users click "Save" button but nothing happens without feedback.

### Location
- File: `src/presentation/components/agent/AgentConfigDialog.tsx`
- Lines: 201-258

### Current Behavior
```typescript
const { errors, isValid, validate } = useAgentFormValidation({...})
// Button disabled={!isValid} but no visible error messages
```

### Required UI

**Component Name**: `AgentValidationErrorMessages`

**Features**:
1. Show inline error messages below each field
2. Highlight fields with errors (red border, icon)
3. Show error summary at top of form
4. Clear errors when user fixes field
5. Use existing validation schema from `useAgentFormValidation`

### Implementation Strategy

**File**: `src/presentation/components/agent/AgentValidationErrorMessages.tsx`

```typescript
interface AgentValidationErrorMessagesProps {
  errors: Record<string, string>;
  onFieldFocus: (field: string) => void;
}

export function AgentValidationErrorMessages({
  errors,
  onFieldFocus,
}: AgentValidationErrorMessagesProps) {
  // Map errors to field-level error messages
  // Show error summary with count
  // Provide "Jump to Error" links
}
```

**Integration**:
```typescript
// In AgentConfigDialog.tsx
// Wrap each form field with error display
<div className="space-y-1">
  <Label htmlFor="agent-name">Agent Name</Label>
  <Input
    id="agent-name"
    value={agentData.name}
    onChange={(e) => setAgentData({...agentData, name: e.target.value})}
    className={errors.name ? 'border-destructive' : ''}
  />
  {errors.name && (
    <p className="text-sm text-destructive">{errors.name}</p>
  )}
</div>
```

### Acceptance Criteria
- [ ] Inline error messages show below each field
- [ ] Fields with errors highlighted (red border)
- [ ] Error summary at top with field count
- [ ] Errors clear when field is fixed
- [ ] "Save" button enables when all errors resolved
- [ ] Accessible and i18n support

---

## P0 Component 4: Agent Creation Success Feedback

**Gap ID**: P0-4
**Story**: Story P0-2.2
**Priority**: P0 (Critical)
**Estimated Time**: 1.5 hours

### Problem
Agent is created via hot-reload but no clear confirmation. Users don't know if agent was created successfully.

### Location
- File: `src/presentation/components/agent/AgentConfigDialog.tsx`
- Lines: 240-242

### Current Behavior
```typescript
addAgent(agentData) // Returns agent but UI doesn't show it clearly
toast.success("Agent created successfully") // Small notification
```

### Required UI

**Component Name**: `AgentCreationSuccessDialog`

**Features**:
1. Show success dialog after agent creation
2. Display agent name and provider
3. Show "What's Next?" suggestions:
   - "Test this agent" (opens chat panel)
   - "Configure workspace bindings"
   - "Create another agent"
4. Auto-close after 5 seconds or manual close
5. Use celebratory animation (confetti or checkmark)

### Implementation Strategy

**File**: `src/presentation/components/agent/AgentCreationSuccessDialog.tsx`

```typescript
interface AgentCreationSuccessDialogProps {
  agent: Agent;
  onTestAgent: () => void;
  onConfigureBindings: () => void;
  onCreateAnother: () => void;
  onClose: () => void;
}

export function AgentCreationSuccessDialog({
  agent,
  onTestAgent,
  onConfigureBindings,
  onCreateAnother,
  onClose,
}: AgentCreationSuccessDialogProps) {
  // Success dialog with next actions
  // Auto-close after 5 seconds
}
```

### Acceptance Criteria
- [ ] Success dialog shows after agent creation
- [ ] Displays agent name and provider
- [ ] 3 action buttons for next steps
- [ ] Auto-close after 5 seconds
- [ ] Celebratory animation
- [ ] Accessible and i18n support

---

## P0 Component 5: Workspace Binding Configuration UI

**Gap ID**: P0-5
**Story**: Story P0-2.3
**Priority**: P0 (Critical)
**Estimated Time**: 2.5 hours

### Problem
Workspace bindings hardcoded in state, not editable in UI. Can't configure which workspaces an agent appears in.

### Location
- File: `src/presentation/components/agent/AgentConfigDialog.tsx`
- Lines: 107-113

### Current Behavior
```typescript
const [workspaceBindings, setWorkspaceBindings] = useState<Agent['workspaceBindings']>([
  { workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true },
  // Hardcoded - no UI to edit these!
```

### Required UI

**Component Name**: `WorkspaceBindingEditor`

**Features**:
1. Table showing all workspace types (IDE, Knowledge, Study, Notes)
2. Toggle for "Available in Workspace" (checkbox)
3. Select for "UI Variant" (full, compact, minimal)
4. Radio button for "Default Agent" in workspace
5. Preview of how agent will appear in each workspace
6. Save button that updates `agent.workspaceBindings`

### Implementation Strategy

**File**: `src/presentation/components/agent/WorkspaceBindingEditor.tsx`

```typescript
interface WorkspaceBindingEditorProps {
  bindings: Agent['workspaceBindings'];
  onChange: (bindings: Agent['workspaceBindings']) => void;
}

export function WorkspaceBindingEditor({
  bindings,
  onChange,
}: WorkspaceBindingEditorProps) {
  // Table with 4 workspace types
  // Each row has:
  // - Workspace name
  // - Available toggle (checkbox)
  // - UI Variant select (full/compact/minimal)
  // - Default agent radio
}
```

### Acceptance Criteria
- [ ] Table shows all 4 workspace types
- [ ] Toggle for "Available in Workspace"
- [ ] Select for "UI Variant"
- [ ] Radio button for "Default Agent"
- [ ] Preview panel shows agent appearance
- [ ] Save updates agent.workspaceBindings
- [ ] Accessible and i18n support

---

## P0 Component 6: Provider Change Model Sync UI

**Gap ID**: P0-6
**Story**: Story P0-2.4
**Priority**: P0 (Critical)
**Estimated Time**: 1.5 hours

### Problem
Changing provider doesn't update available models. Users can select incompatible model/provider combinations.

### Location
- File: `src/presentation/components/agent/AgentBasicConfig.tsx`
- Referenced in AgentConfigDialog

### Required UI

**Features**:
1. Auto-select first model when provider changes
2. Disable model field until models are loaded
3. Show loading spinner during model fetch
4. Clear validation error if selected model doesn't exist for new provider
5. Show model count badge ("24 models available")

### Implementation Strategy

**File**: Update `AgentBasicConfig.tsx` (no new component)

```typescript
const handleProviderChange = async (newProviderId: string) => {
  // Disable model field
  setModelFieldDisabled(true);
  setShowModelLoading(true);

  try {
    // Fetch models for new provider
    await fetchModels(newProviderId);

    // Auto-select first model
    const models = getAvailableModels(newProviderId);
    if (models.length > 0) {
      setAgentData({...agentData, modelId: models[0].id});
    }

    // Clear validation error
    clearFieldError('modelId');

  } catch (error) {
    // Show error state
    setModelFetchError(error.message);
  } finally {
    setModelFieldDisabled(false);
    setShowModelLoading(false);
  }
};
```

### Acceptance Criteria
- [ ] Model field disabled during provider change
- [ ] Loading spinner shown while fetching models
- [ ] First model auto-selected when fetch completes
- [ ] Model count badge shown ("24 models available")
- [ ] Validation error cleared if model doesn't exist
- [ ] Error state shown if fetch fails

---

## P0 Component 7: Advanced Settings Configuration UI

**Gap ID**: P0-7
**Story**: Story P0-2.5
**Priority**: P0 (Critical)
**Estimated Time**: 2 hours

### Problem
Advanced settings tab has placeholder text only. Can't configure LLM parameters (temperature, topP, topK, etc.).

### Location
- File: `src/presentation/components/agent/AgentConfigDialog.tsx`
- Lines: 390-395

### Current Behavior
```typescript
<div className="space-y-4">
  <Label>Advanced Settings</Label>
  <p className="text-sm text-muted-foreground">
  // Placeholder text - no actual controls!
```

### Required UI

**Component Name**: `AgentAdvancedSettings`

**Features**:
1. Temperature slider (0.0 - 2.0, default 0.7)
2. Max Tokens input (default 4096)
3. Top P slider (0.0 - 1.0, default 1.0)
4. Top K slider (1 - 100, default 40)
5. Frequency Penalty slider (-2.0 - 2.0, default 0.0)
6. Presence Penalty slider (-2.0 - 2.0, default 0.0)
7. Reset to Defaults button
8. Save button that updates `agent.modelSettings`

### Implementation Strategy

**File**: `src/presentation/components/agent/AgentAdvancedSettings.tsx`

```typescript
interface AgentAdvancedSettingsProps {
  settings: ModelSettings;
  onChange: (settings: ModelSettings) => void;
  onReset: () => void;
}

export function AgentAdvancedSettings({
  settings,
  onChange,
  onReset,
}: AgentAdvancedSettingsProps) {
  // Slider components for each parameter
  // Use Slider from @radix-ui/react-slider
  // Show current value next to each slider
  // Reset button restores defaults
}
```

### Acceptance Criteria
- [ ] All 6 LLM parameters shown with sliders
- [ ] Current value displayed next to each slider
- [ ] Tooltips explain each parameter
- [ ] Reset button restores defaults
- [ ] Save updates agent.modelSettings
- [ ] Accessible and i18n support

---

## P0 Component 8: Permission Change Confirmation Dialog

**Gap ID**: P0-8
**Story**: Story P0-3.1
**Priority**: P0 (Critical)
**Estimated Time**: 1.5 hours

### Problem
Changing tool permissions happens immediately without confirmation. Can accidentally block critical tools or enable dangerous ones.

### Location
- File: `src/presentation/components/agent/WorkspacePermissionEditor.tsx`
- Lines: 186-189

### Current Behavior
```typescript
const handleLevelChange = (toolId: string, newLevel: ToolTrustLevel) => {
  setTrustLevel(toolId, newLevel) // Immediate change - no confirmation
  onChange?.(activeWorkspace, toolId, newLevel)
```

### Required UI

**Component Name**: `PermissionChangeConfirmDialog`

**Features**:
1. Show confirmation dialog before changing permission level
2. Display tool name and icon
3. Show old level → new level (e.g., "Trusted" → "Blocked")
4. Explain impact of change (warn for dangerous tools)
5. Two buttons:
   - "Cancel" (default)
   - "Confirm Change"
6. Remember choice for session (optional: "Don't ask again" checkbox)

### Implementation Strategy

**File**: `src/presentation/components/agent/PermissionChangeConfirmDialog.tsx`

```typescript
interface PermissionChangeConfirmDialogProps {
  toolId: string;
  toolName: string;
  oldLevel: ToolTrustLevel;
  newLevel: ToolTrustLevel;
  onConfirm: () => void;
  onCancel: () => void;
  open: boolean;
}

export function PermissionChangeConfirmDialog({
  toolId,
  toolName,
  oldLevel,
  newLevel,
  onConfirm,
  onCancel,
  open,
}: PermissionChangeConfirmDialogProps) {
  // Confirmation dialog using AlertDialog
  // Show change impact
  // Provide confirm/cancel buttons
}
```

### Acceptance Criteria
- [ ] Dialog shows before permission change
- [ ] Displays tool name and icon
- [ ] Shows old level → new level
- [ ] Warns for dangerous tools (fileSystem, execute, etc.)
- [ ] Confirm/cancel buttons work correctly
- [ ] Optional "Don't ask again" checkbox
- [ ] Accessible and i18n support

---

## Implementation Timeline

### Sprint 1 (Week 1) - Core Provider Management

| Day | Component | Time | Status |
|-----|-----------|------|--------|
| Day 1 | P0-1: Provider Deletion Warning | 2 hours | ⏳ Pending |
| Day 2 | P0-2: Model Fetch Recovery | 2 hours | ⏳ Pending |
| Day 3 | P0-3: Validation Error Display | 2 hours | ⏳ Pending |
| Day 4 | P0-4: Agent Creation Success | 1.5 hours | ⏳ Pending |
| Day 5 | Buffer for testing/fixes | - | ⏳ Pending |

### Sprint 2 (Week 2) - Advanced Configuration

| Day | Component | Time | Status |
|-----|-----------|------|--------|
| Day 6 | P0-5: Workspace Binding Editor | 2.5 hours | ⏳ Pending |
| Day 7 | P0-6: Provider Change Model Sync | 1.5 hours | ⏳ Pending |
| Day 8 | P0-7: Advanced Settings UI | 2 hours | ⏳ Pending |
| Day 9 | P0-8: Permission Change Confirm | 1.5 hours | ⏳ Pending |
| Day 10 | Integration testing & polish | - | ⏳ Pending |

**Total Estimated Time**: 16 hours across 10 business days

---

## Existing Components to Reuse

From `src/presentation/components/ui/`:

1. **Dialog** - `dialog.tsx` (@radix-ui/react-dialog)
2. **AlertDialog** - `alert-dialog.tsx` (@radix-ui/react-alert-dialog)
3. **Button** - `button.tsx` (with variants)
4. **Input** - `input.tsx` (with error states)
5. **Label** - `label.tsx` (@radix-ui/react-label)
6. **Slider** - `slider.tsx` (@radix-ui/react-slider)
7. **Badge** - `badge.tsx` (for model counts, agent counts)
8. **Switch** - `switch.tsx` (@radix-ui/react-switch)
9. **Select** - `select.tsx` (@radix-ui/react-select)
10. **Toast** - `toast.tsx` (sonner)

**Note**: All existing components already support i18n and accessibility.

---

## Design Artifacts Needed

1. **Wireframes** - Figma sketches for each component (optional, can code directly)
2. **Error States** - Design system for error messages
3. **Success States** - Design system for success feedback
4. **Loading States** - Consistent spinner/skeleton patterns

---

## Developer Documentation

1. **Component Storybook** - Stories for each component in Storybook
2. **Usage Examples** - README in each component directory
3. **Props Documentation** - JSDoc comments for all props
4. **Integration Guide** - How to integrate with existing dialogs

---

## Testing Requirements

### Unit Tests (Vitest)
- [ ] Component renders correctly
- [ ] Props trigger correct callbacks
- [ ] Error states display properly
- [ ] Loading states work

### Integration Tests
- [ ] Provider deletion flow with dependent agents
- [ ] Model fetch failure recovery
- [ ] Agent validation error display
- [ ] Permission change confirmation

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Focus management correct
- [ ] ARIA labels present

### i18n Tests
- [ ] All strings use `t()` hook
- [ ] Translations exist in en.json and vi.json
- [ ] No hardcoded strings

---

## Completion Criteria

All 8 P0 components complete when:

- [ ] All components created and integrated
- [ ] TypeScript compilation passes (zero errors)
- [ ] Unit tests pass (80% coverage minimum)
- [ ] Integration tests pass (5 critical flows)
- [ ] Accessibility audit passes (WAVE + keyboard nav)
- [ ] i18n complete (en + vi translations)
- [ ] Documentation complete (stories + usage guides)
- [ ] Manual testing complete (5 scenarios per component)

---

## Tracking Metrics

### Development Velocity
- Components completed: 0/8 (0%)
- Hours spent: 0/16 (0%)
- On track: Yes (Sprint 1 starting)

### Quality Metrics
- TypeScript errors: 0
- Test coverage: 0% (target: 80%)
- Accessibility issues: 0 (target: 0)
- i18n coverage: 0% (target: 100%)

### Integration Status
- Components integrated: 0/8
- Dialogs updated: 0 (need updates to 3 dialogs)
- Breaking changes: 0 (maintain backward compatibility)

---

**Generated by**: BMAD Master Orchestrator
**Source**: Ralph Loop Cycle 13 UI Component Gaps Analysis
**Date**: 2026-01-01
**Status**: Ready for implementation
**Next Action**: Begin P0-1 (Provider Deletion Warning UI)
