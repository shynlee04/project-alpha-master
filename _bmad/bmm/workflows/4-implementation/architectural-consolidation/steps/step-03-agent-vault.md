---
step: 3
id: step-03-agent-vault
name: Agent Configuration Enhancement (AC-02, AC-03)
workflow: architectural-consolidation
real_world_aligned: true
---

# Step 3: Agent Configuration Enhancement (Stories AC-02, AC-03)

**Objective**: Add provider/model selection UI and tool binding with workspace permissions.

**Current State** (REAL-WORLD ASSESSED):
- ✅ `AgentConfigDialog` exists in `src/components/agent/AgentConfigDialog.tsx`
- ✅ Agents have `providerId` and `modelId` fields
- ✅ `useAgentsStore` works with Zustand + Dexie
- ❌ Missing: Provider dropdown (filtered by hasApiKey)
- ❌ Missing: Model dropdown (filtered by provider)
- ❌ Missing: Tool permissions matrix
- ❌ Missing: Workspace bindings UI

**This step focuses on ADDING MISSING UI COMPONENTS to `AgentConfigDialog`.**

---

## 1. IMPLEMENTATION TASKS

### Task 1.1: Add Provider/Model Dropdowns (AC-02)

**File**: `src/components/agent/AgentConfigDialog.tsx`

**Current State**: The dialog likely has basic agent config fields but NOT proper provider/model selection.

**Required Changes**:

```typescript
// ADD THESE IMPORTS
import { useProviderModelsStore } from '@/stores/provider-models-store';
import { emitStoreEvent } from '@/lib/events/store-events';

// ADD THESE STATE VARIABLES
const providers = useProviderModelsStore(s =>
  s.providers.filter(p => p.hasApiKey)  // Only show providers with keys
);

const [selectedProviderId, setSelectedProviderId] = useState(
  agent?.providerId || providers[0]?.id || ''
);

// Filter models by selected provider
const availableModels = useProviderModelsStore(s =>
  s.models.filter(m => m.providerId === selectedProviderId)
);

const [selectedModelId, setSelectedModelId] = useState(
  agent?.modelId || availableModels[0]?.id || ''
);

// ADD PROVIDER DROPDOWN UI
<div className="form-field">
  <label>Provider</label>
  <Select
    value={selectedProviderId}
    onChange={(value) => {
      setSelectedProviderId(value);
      // Reset model when provider changes
      setSelectedModelId('');
    }}
    options={providers.map(p => ({
      value: p.id,
      label: p.name
    }))}
  />
</div>

// ADD MODEL DROPDOWN UI
<div className="form-field">
  <label>Model</label>
  <Select
    value={selectedModelId}
    onChange={setSelectedModelId}
    options={availableModels.map(m => ({
      value: m.id,
      label: m.name
    }))}
    disabled={!selectedProviderId}
  />
</div>
```

**Validation on Save**:

```typescript
const handleSave = async () => {
  // Verify model belongs to provider
  const model = availableModels.find(m => m.id === selectedModelId);
  if (!model || model.providerId !== selectedProviderId) {
    toast.error('Selected model does not belong to selected provider');
    return;
  }

  await updateAgent(agentId, {
    providerId: selectedProviderId,
    modelId: selectedModelId,
    // ... other fields
  });

  emitStoreEvent('agent:updated', {
    agentId,
    timestamp: Date.now()
  });
};
```

### Task 1.2: Add Tool Binding with Workspace Permissions (AC-03)

**File 1**: `src/stores/agents-store.ts` - Update Types

```typescript
// UPDATE AgentToolBinding TYPE
export interface AgentToolBinding {
  toolId: string;
  toolName: string;
  isEnabled: boolean;

  // ✅ ADD THIS: Workspace permissions
  workspacePermissions: {
    ide: boolean;
    knowledge: boolean;
    study: boolean;
    notes: boolean;
  };

  configuration?: Record<string, unknown>;
}

// ✅ ADD THIS: Workspace bindings
export interface WorkspaceBinding {
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  isAvailable: boolean;
  uiVariant: 'full' | 'compact' | 'minimal';
  isDefault: boolean;
}

// UPDATE Agent INTERFACE
export interface Agent {
  // ... existing fields ...
  tools: AgentToolBinding[];        // Now includes workspacePermissions
  workspaceBindings: WorkspaceBinding[];  // NEW FIELD
  // ... existing fields ...
}
```

**File 2**: `src/components/agent/AgentConfigDialog.tsx` - Add UI

```typescript
// ADD TOOL PERMISSIONS MATRIX
const availableTools = [
  { id: 'file-read', name: 'Read Files' },
  { id: 'file-write', name: 'Write Files' },
  { id: 'terminal', name: 'Terminal Commands' },
  { id: 'web-search', name: 'Web Search' },
  { id: 'rag-query', name: 'Knowledge Query' },
];

const workspaceTypes = [
  { id: 'ide', label: 'IDE' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'study', label: 'Study' },
  { id: 'notes', label: 'Notes' },
];

// Render tool permissions matrix
<div className="tool-permissions-section">
  <h3>Tool Permissions (per Workspace)</h3>
  <table className="permissions-matrix">
    <thead>
      <tr>
        <th>Tool</th>
        {workspaceTypes.map(ws => (
          <th key={ws.id}>{ws.label}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {availableTools.map(tool => {
        const binding = agent?.tools.find(t => t.toolId === tool.id);
        return (
          <tr key={tool.id}>
            <td>{tool.name}</td>
            {workspaceTypes.map(ws => (
              <td key={ws.id}>
                <Checkbox
                  checked={binding?.workspacePermissions?.[ws.id] || false}
                  onChange={(checked) =>
                    updateToolPermission(tool.id, ws.id, checked)
                  }
                />
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

// Helper function
const updateToolPermission = (toolId: string, workspace: string, enabled: boolean) => {
  setAgent(prev => {
    const tools = [...prev.tools];
    const toolIndex = tools.findIndex(t => t.toolId === toolId);

    if (toolIndex >= 0) {
      tools[toolIndex] = {
        ...tools[toolIndex],
        workspacePermissions: {
          ...tools[toolIndex].workspacePermissions,
          [workspace]: enabled
        }
      };
    } else {
      tools.push({
        toolId,
        toolName: availableTools.find(t => t.id === toolId)?.name || toolId,
        isEnabled: true,
        workspacePermissions: {
          ide: enabled,
          knowledge: enabled,
          study: enabled,
          notes: enabled,
        }
      });
    }

    return { ...prev, tools };
  });
};
```

### Task 1.3: Add Workspace Bindings Section

**File**: `src/components/agent/AgentConfigDialog.tsx`

```typescript
<div className="workspace-bindings-section">
  <h3>Workspace Availability</h3>
  {workspaceTypes.map(ws => {
    const binding = agent?.workspaceBindings?.find(b => b.workspaceType === ws.id);
    return (
      <div key={ws.id} className="workspace-binding-item">
        <Checkbox
          label={ws.label}
          checked={binding?.isAvailable || false}
          onChange={(checked) =>
            updateWorkspaceBinding(ws.id, 'isAvailable', checked)
          }
        />
        {binding?.isAvailable && (
          <Select
            value={binding?.uiVariant || 'full'}
            onChange={(value) =>
              updateWorkspaceBinding(ws.id, 'uiVariant', value)
            }
            options={[
              { value: 'full', label: 'Full' },
              { value: 'compact', label: 'Compact' },
              { value: 'minimal', label: 'Minimal' },
            ]}
          />
        )}
        <Checkbox
          label="Default for this workspace"
          checked={binding?.isDefault || false}
          onChange={(checked) =>
            updateWorkspaceBinding(ws.id, 'isDefault', checked)
          }
        />
      </div>
    );
  })}
</div>

// Helper function
const updateWorkspaceBinding = (
  workspaceType: string,
  field: string,
  value: boolean | string
) => {
  setAgent(prev => {
    const bindings = [...(prev.workspaceBindings || [])];
    const index = bindings.findIndex(b => b.workspaceType === workspaceType);

    if (index >= 0) {
      bindings[index] = { ...bindings[index], [field]: value };
    } else {
      bindings.push({
        workspaceType,
        isAvailable: field === 'isAvailable' ? value as boolean : true,
        uiVariant: 'full',
        isDefault: false,
      });
    }

    return { ...prev, workspaceBindings: bindings };
  });
};
```

---

## 2. VALIDATION CRITERIA

### Manual Testing Steps

1. **Open Agent Config Dialog** (create new agent)
2. **Verify Provider Dropdown**:
   - [ ] Only shows providers with API keys
   - [ ] Selecting provider filters model dropdown
3. **Verify Model Dropdown**:
   - [ ] Shows only models for selected provider
   - [ ] Validation prevents mismatch
4. **Verify Tool Permissions**:
   - [ ] Matrix renders with all tools × workspaces
   - [ ] Checkboxes save correctly
   - [ ] Permissions persist to store
5. **Verify Workspace Bindings**:
   - [ ] All 4 workspaces listed
   - [ ] Can enable/disable per workspace
   - [ ] UI variant selection works

### Type Checking

```bash
pnpm tsc --noEmit
```

Expected: No type errors

---

## 3. SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Provider dropdown render | < 100ms | React render time |
| Model filter update | < 50ms | Array filter execution |
| Tool permissions render | < 200ms | Matrix table render |
| Save validation | Instant | Form submission |

---

## 4. FILES CHANGED

| File | Change Type | Lines Added |
|------|-------------|-------------|
| `src/stores/agents-store.ts` | Update AgentToolBinding, add WorkspaceBinding | ~20 |
| `src/components/agent/AgentConfigDialog.tsx` | Add provider/model dropdowns, tool matrix, workspace bindings | ~150 |

---

## 5. NEXT STEP

Once AC-02/AC-03 are verified (agent config dialog has all UI components), proceed to **Step 4 (Chat Unification)** which standardizes ChatPanel across all workspaces.

**Validation Gate Checklist**:
- [ ] Provider dropdown shows only providers with keys
- [ ] Model dropdown filters by provider
- [ ] Tool permissions matrix works
- [ ] Workspace bindings UI works
- [ ] No type errors
- [ ] Build passes: `pnpm build`
