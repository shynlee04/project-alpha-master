# WB-PR-1: Hot-Reload Validation Bug Report

**Metadata:**
- **Story ID:** WB-PR-1
- **Title:** Verify Agent Configuration Hot-Reload
- **Date:** 2026-01-01
- **Status:** ❌ FAILED - Bugs Found
- **Test Suite:** `src/stores/__tests__/hotReload-validation.test.ts`

---

## Executive Summary

**BF-01 and BF-02 hot-reload fixes were claimed but NOT independently verified.** Validation testing reveals **critical violations** that prevent hot-reload functionality from working correctly.

---

## BF-01: Hot-Reload Bug - CONFIRMED VIOLATION ❌

### Bug Description
**AgentConfigDialog uses `useState` instead of Zustand store**, making configuration changes invisible to other components until form submission.

### Evidence

**File:** `src/presentation/components/agent/AgentConfigDialog.tsx`

**Violating Lines:** 23 useState hooks found (lines 159-192)

```typescript
// Lines 159-192 - VIOLATES BF-01 fix requirement
const [activeTab, setActiveTab] = useState<ConfigTab>('basic')
const [name, setName] = useState('')
const [description, setDescription] = useState('')
const [providerId, setProviderId] = useState<string>('openrouter')
const [modelId, setModelId] = useState('')
const [apiKey, setApiKey] = useState('')

// Advanced settings
const [customBaseURL, setCustomBaseURL] = useState('')
const [customModelId, setCustomModelId] = useState('')
const [customHeaders, setCustomHeaders] = useState<Array<{ key: string; value: string }>>([])
const [enableNativeTools, setEnableNativeTools] = useState(true)
const [isLoadingCustomModels, setIsLoadingCustomModels] = useState(false)

// LLM Parameters
const [temperature, setTemperature] = useState(0.7)
const [maxTokens, setMaxTokens] = useState(4096)
const [topP, setTopP] = useState(0.95)
const [topK, setTopK] = useState<number | undefined>(undefined)
const [systemPrompt, setSystemPrompt] = useState('')

// Loading states
const [isSubmitting, setIsSubmitting] = useState(false)
const [isCheckingKey, setIsCheckingKey] = useState(false)
const [isSavingKey, setIsSavingKey] = useState(false)
const [isTestingConnection, setIsTestingConnection] = useState(false)
const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')

// Validation errors
const [errors, setErrors] = useState<FormErrors>({})
```

### Impact

**User Impact:**
1. User opens AgentConfigDialog
2. Changes agent name from "Via-Gent Coder" to "Custom Agent"
3. **Changes stay in local state only**
4. Other components (AgentSelector, AgentsPanel) show OLD name
5. Changes only propagate after clicking "Save" button
6. **Not true hot-reload**

**Technical Impact:**
- Violates single source of truth principle
- Breaks reactivity between components
- Inconsistent UX (some changes instant, others delayed)
- Cannot see real-time preview of changes

### Root Cause

**Architecture Decision (Epic 2, Story 2.1):**
```typescript
// ❌ WRONG: Local state in dialog
const [name, setName] = useState('')

// ✅ CORRECT: Read from Zustand store
const name = useAgentsStore(s => s.agents.find(a => a.id === activeAgentId)?.name)
```

The dialog was migrated to Zustand store for **persistence**, but NOT for **reactivity**.

---

## BF-02: Optimistic UI - PARTIAL IMPLEMENTATION ⚠️

### Bug Description
**No optimistic UI updates** - users see changes only after form submission, not immediately during typing.

### Evidence

**Current Behavior:**
1. User types in AgentConfigDialog
2. Changes captured in `useState`
3. **No immediate feedback** in other components
4. Changes only visible after form submit

**Expected Behavior (BF-02 fix):**
1. User types in AgentConfigDialog
2. Changes update Zustand store immediately
3. **All components see changes instantly**
4. Real-time preview across UI

### Status

**Store-level atomic updates:** ✅ Working
**Optimistic UI:** ❌ Not implemented

---

## Test Results

**Test Suite:** `src/stores/__tests__/hotReload-validation.test.ts`

**Results:**
```
✓ should detect useState in AgentConfigDialog component (3ms)
✓ should detect missing optimistic UI in AgentConfigDialog (1ms)
✗ should propagate agent config changes immediately across components
✗ should handle concurrent updates without race conditions
✗ should emit events for all config changes
```

**Detection Tests Pass:** Proves violations exist

---

## Required Fixes

### Fix 1: Migrate AgentConfigDialog to Zustand (BF-01)

**Current Pattern (WRONG):**
```typescript
function AgentConfigDialog({ agent }: Props) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (agent) setName(agent.name)
  }, [agent])

  return <Input value={name} onChange={e => setName(e.target.value)} />
}
```

**Required Pattern (CORRECT):**
```typescript
function AgentConfigDialog({ agentId }: Props) {
  const agent = useAgentsStore(s => s.agents.find(a => a.id === agentId))
  const { updateAgent } = useAgentsStore()

  // Two-way binding with Zustand
  return <Input
    value={agent?.name || ''}
    onChange={e => updateAgent(agentId, { name: e.target.value })}
  />
}
```

### Fix 2: Implement Optimistic UI (BF-02)

Add debounced store updates during typing:

```typescript
import { useDebouncedCallback } from 'use-debounce'

function AgentConfigDialog({ agentId }: Props) {
  const { updateAgent } = useAgentsStore()

  // Debounced update (300ms)
  const debouncedUpdate = useDebouncedCallback(
    (updates) => updateAgent(agentId, updates),
    [agentId, updateAgent],
    300
  )

  return <Input
    value={agent?.name || ''}
    onChange={e => debouncedUpdate({ name: e.target.value })}
  />
}
```

---

## Implementation Plan

### Step 1: Refactor Form State (2 hours)
- Remove all `useState` for form fields
- Read agent data from `useAgentsStore` selector
- Update agent via store actions immediately

### Step 2: Add Two-Way Binding (1 hour)
- Bind form inputs to store values
- Call `updateAgent` on change events
- Ensure reactivity across all components

### Step 3: Add Optimistic UI (1 hour)
- Implement debounced updates during typing
- Show loading state during updates
- Handle concurrent updates safely

**Total Effort:** 4 hours

---

## Validation Checklist

After fix is complete:

- [ ] All `useState` removed from form fields (BF-01)
- [ ] Changes visible immediately in AgentSelector (BF-01)
- [ ] Changes visible immediately in AgentsPanel (BF-01)
- [ ] No form submission required for visibility (BF-01)
- [ ] Optimistic UI updates during typing (BF-02)
- [ ] No race conditions in concurrent updates (BF-02)
- [ ] All validation tests pass (5/5)

---

## Conclusion

**BF-01 and BF-02 are NOT FIXED** despite claims in `agents-store.ts`. Critical refactoring required to achieve true hot-reload functionality.

**Next Action:** Begin immediate refactoring of AgentConfigDialog to use Zustand store for all form state.

---

**Generated:** 2026-01-01
**Author:** WB-PR-1 Validation Test Suite
**Status:** ❌ FAILED - bugs confirmed, fix required
