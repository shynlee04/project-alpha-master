# WB-PR-1: Architectural Fix for BF-01 Hot-Reload

**Current Architecture (BROKEN):**
```
AgentConfigDialog
    ↓ (uses useState)
Local Form State (isolated)
    ↓ (only on submit)
Zustand Store
    ↓ (delayed propagation)
Other Components
```

**Target Architecture (FIXED):**
```
AgentConfigDialog
    ↓ (reads from store)
Zustand Store (single source of truth)
    ↓ (immediate propagation)
All Components (instant updates)
```

---

## Refactor Strategy

### Phase 1: Props Change (Step 1)
**Before:** `agent?: Agent`
**After:** `agentId: string | null`

**Why:** Avoid stale closures, ensure store is single source of truth

### Phase 2: Remove Form State (Step 2)
**Remove:** 23 useState hooks (lines 159-192)
**Replace:** Zustand store selectors

### Phase 3: Two-Way Binding (Step 3)
**Add:** Immediate store updates on change
**Benefit:** Optimistic UI, real-time preview

---

## Implementation Steps

### Step 1: Change Props Interface

```typescript
// BEFORE
interface AgentConfigDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: (agent: Agent) => void
    agent?: Agent  // ← PROBLEM: Stale closure
}

// AFTER
interface AgentConfigDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    agentId: string | null  // ← FIX: Always read fresh from store
}
```

### Step 2: Replace Form State with Selectors

```typescript
// BEFORE (lines 159-179)
const [name, setName] = useState('')
const [description, setDescription] = useState('')
const [providerId, setProviderId] = useState<string>('openrouter')
const [modelId, setModelId] = useState('')
// ... 19 more useState hooks

// AFTER
const agent = useAgentsStore(s => s.agents.find(a => a.id === agentId))

// Form values come DIRECTLY from store
const name = agent?.name || ''
const description = agent?.description || ''
const providerId = agent?.providerId || 'openrouter'
const modelId = agent?.modelId || ''
```

### Step 3: Two-Way Binding with Immediate Updates

```typescript
// BEFORE
<Input
  value={name}
  onChange={e => setName(e.target.value)}  // Local state only
/>

// AFTER
const { updateAgent } = useAgentsStore()

<Input
  value={name}
  onChange={e => updateAgent(agentId!, { name: e.target.value })}  // Immediate store update
/>
```

### Step 4: Debounced Updates for Performance

Add debouncing to avoid excessive store updates:

```typescript
import { useDebouncedCallback } from 'use-debounce'

function AgentConfigDialog({ agentId }: Props) {
  const { updateAgent } = useAgentsStore()

  // Debounce store updates (300ms)
  const debouncedUpdate = useDebouncedCallback(
    (updates: Partial<Agent>) => {
      if (agentId) {
        updateAgent(agentId, updates)
      }
    },
    [agentId, updateAgent],
    300
  )

  // Usage
  <Input
    value={name}
    onChange={e => debouncedUpdate({ name: e.target.value })}
  />
}
```

---

## Handling Complex Cases

### Case 1: Loading States

**Before:** `const [isLoading, setIsLoading] = useState(false)`
**After:** Read from store

```typescript
const isSaving = useAgentsStore(s => s.agents
  .find(a => a.id === agentId)
  ?.lastActive
  ? new Date(agent.lastActive) > Date.now() - 1000
  : false
)
```

### Case 2: Validation Errors

**Before:** `const [errors, setErrors] = useState<FormErrors>({})`
**After:** Keep in local state (not form data)

```typescript
// Validation errors CAN stay in useState (not form data)
const [errors, setErrors] = useState<FormErrors>({})

// Only form data migrates to store
```

### Case 3: Connection Status

**Before:** `const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')`
**After:** Keep in local state (transient UI state only)

```typescript
// Transient UI state stays in useState
const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
```

---

## Migration Checklist

### Remove (23 useState hooks):
- [x] `activeTab` → Keep (UI state only)
- [x] `name` → Remove
- [x] `description` → Remove
- [x] `providerId` → Remove
- [x] `modelId` → Remove
- [x] `apiKey` → Remove
- [x] `customBaseURL` → Remove
- [x] `customModelId` → Remove
- [x] `customHeaders` → Remove
- [x] `enableNativeTools` → Remove
- [x] `isLoadingCustomModels` → Remove
- [x] `temperature` → Remove
- [x] `maxTokens` → Remove
- [x] `topP` → Remove
- [x] `topK` → Remove
- [x] `systemPrompt` → Remove
- [x] `isSubmitting` → Remove (or derive from store)
- [x] `isCheckingKey` → Keep (transient)
- [x] `isSavingKey` → Keep (transient)
- [x] `isTestingConnection` → Keep (transient)
- [x] `connectionStatus` → Keep (transient)
- [x] `errors` → Keep (validation only, not form data)

### Keep (transient UI state):
- `activeTab` (UI navigation)
- `isCheckingKey` (transient loading)
- `isSavingKey` (transient loading)
- `isTestingConnection` (transient loading)
- `connectionStatus` (transient UI feedback)
- `errors` (validation state, not form data)

### Replace with store selectors:
- `name` → `agent?.name`
- `description` → `agent?.description`
- `providerId` → `agent?.providerId`
- `modelId` → `agent?.modelId`
- `temperature` → `agent?.temperature`
- `maxTokens` → `agent?.maxTokens`
- `topP` → `agent?.topP`
- `topK` → `agent?.topK`
- `systemPrompt` → `agent?.systemPrompt`

---

## Testing Strategy

After fix, verify:

1. **Hot-Reload Test:**
   - Open AgentConfigDialog
   - Change agent name
   - Switch to another tab
   - Verify: New name visible immediately (no save required)

2. **Reactivity Test:**
   - Open AgentConfigDialog in multiple places
   - Change name in one dialog
   - Verify: All other instances update instantly

3. **Validation Test:**
   - Run `hotReload-validation.test.ts`
   - Verify: All 5 tests pass (currently 2/5)

---

**Next:** Implement Step 1 (Props Change)

**Generated:** 2026-01-01
**Author:** WB-PR-1 Fix Implementation
