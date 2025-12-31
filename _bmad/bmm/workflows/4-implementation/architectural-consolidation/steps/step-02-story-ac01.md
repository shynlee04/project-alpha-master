# Step 2: Story AC-01 - Provider Store Reactivity

**Story Goal:** Implement LLM Provider store with event emission for cross-workspace reactivity.

---

## 2.1 PRE-IMPLEMENTATION RESEARCH (MANDATORY)

### Required MCP Tool Calls

Execute these research queries before writing any code:

#### Research R1: Zustand Persist Middleware Pattern
```
Tool: Context7
Query: "Zustand persist middleware cross-tab sync React"
Purpose: Validate store reactivity pattern
```

#### Research R2: EventEmitter3 Pattern
```
Tool: Context7 or web-search
Query: "EventEmitter3 TypeScript best practices"
Purpose: Event bus implementation pattern
```

#### Research R3: Dexie Storage Adapter
```
Tool: Local codebase search
Query: "createDexieStorage" in src/lib/state/
Purpose: Find existing pattern to follow
```

### Document Research Findings

Create section in context:
```xml
<research_notes story="AC-01">
  <finding source="context7" query="Zustand persist">
    <!-- Insert finding -->
  </finding>
  <finding source="codebase" query="createDexieStorage">
    <!-- Insert finding -->
  </finding>
</research_notes>
```

**CHECKPOINT: Research Complete**

Display:
```
✅ RESEARCH COMPLETE for AC-01

📚 Findings:
  - Zustand persist: [summary]
  - EventEmitter3: [summary]
  - Dexie adapter: [found at src/lib/state/dexie-storage.ts]

Proceed with implementation? [Y/N]
```

**HALT and WAIT for user confirmation.**

---

## 2.2 IMPLEMENTATION TASKS

### Task T1: Create Store Events Module

**File:** `src/lib/events/store-events.ts` (CREATE)

```typescript
/**
 * Store Events Module
 * 
 * Event bus for cross-store communication.
 * Prevents circular dependencies between Zustand stores.
 * 
 * @see architecture.md Section 4.2.2 - Event Bus Pattern
 */

import EventEmitter from 'eventemitter3';

// Create singleton event bus
export const storeEvents = new EventEmitter();

// Event type constants
export const EVENTS = {
  // Provider events
  PROVIDER_KEY_SET: 'provider:key-set',
  PROVIDER_KEY_REMOVED: 'provider:key-removed',
  PROVIDER_MODELS_LOADED: 'provider:models-loaded',
  PROVIDER_MODELS_ERROR: 'provider:models-error',
  
  // Agent events
  AGENT_SELECTED: 'agent:selected',
  AGENT_UPDATED: 'agent:updated',
  AGENT_REMOVED: 'agent:removed',
  
  // Conversation events
  CONVERSATION_CREATED: 'conversation:created',
  CONVERSATION_UPDATED: 'conversation:updated',
  MESSAGE_ADDED: 'message:added',
  
  // File events
  FILE_SYNCED: 'file:synced',
  FILE_CONFLICT: 'file:conflict',
} as const;

// Type-safe event types
export type StoreEventType = typeof EVENTS[keyof typeof EVENTS];

// Event payload interfaces
export interface ProviderKeySetPayload {
  providerId: string;
  timestamp: number;
}

export interface ProviderModelsLoadedPayload {
  providerId: string;
  modelCount: number;
}

export interface AgentSelectedPayload {
  agentId: string;
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
}

// Type-safe emit helper
export function emitStoreEvent<T>(event: StoreEventType, payload: T): void {
  storeEvents.emit(event, payload);
}

// Type-safe subscribe helper
export function onStoreEvent<T>(
  event: StoreEventType, 
  handler: (payload: T) => void
): () => void {
  storeEvents.on(event, handler);
  return () => storeEvents.off(event, handler);
}
```

**CHECKPOINT: Task T1 Complete**
- [ ] File created
- [ ] TypeScript compiles
- [ ] Exports verified

---

### Task T2: Enhance Provider Models Store

**File:** `src/stores/provider-models-store.ts` (MODIFY)

**Changes Required:**

1. **Import store events:**
```typescript
import { storeEvents, EVENTS, emitStoreEvent, ProviderKeySetPayload } from '@/lib/events/store-events';
```

2. **Add hardcoded provider base URLs:**
```typescript
const HARDCODED_PROVIDERS = {
  openrouter: { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', isHardcoded: true },
  anthropic: { id: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', isHardcoded: true },
  google: { id: 'google', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', isHardcoded: true },
  openai: { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', isHardcoded: true },
} as const;
```

3. **Modify setApiKey to emit event:**
```typescript
setApiKey: async (providerId: string, apiKey: string) => {
  set((state) => ({
    providers: {
      ...state.providers,
      [providerId]: { ...state.providers[providerId], hasApiKey: true }
    }
  }));
  
  // Emit event for cross-workspace reactivity
  emitStoreEvent<ProviderKeySetPayload>(EVENTS.PROVIDER_KEY_SET, {
    providerId,
    timestamp: Date.now()
  });
  
  // Persist encrypted key
  await credentialVault.storeCredentials(providerId, apiKey);
},
```

4. **Add event listener for auto-loading models:**
```typescript
// In store initialization or useEffect
storeEvents.on(EVENTS.PROVIDER_KEY_SET, async ({ providerId }: ProviderKeySetPayload) => {
  const loadModels = useProviderModelsStore.getState().loadModelsForProvider;
  await loadModels(providerId);
});
```

5. **Add custom provider support:**
```typescript
addCustomProvider: (name: string, baseUrl: string, headers: Record<string, string> = {}) => {
  const id = `custom-${Date.now()}`;
  set((state) => ({
    customProviders: [...(state.customProviders || []), { 
      id, 
      name, 
      baseUrl, 
      headers, 
      isHardcoded: false 
    }]
  }));
  return id;
},
```

**CHECKPOINT: Task T2 Complete**
- [ ] Store modified
- [ ] Event emission working
- [ ] Models auto-load on key set
- [ ] TypeScript compiles

---

### Task T3: Write Unit Tests

**File:** `src/stores/provider-models-store.test.ts` (MODIFY/CREATE)

Add tests for:
```typescript
describe('Provider Store Reactivity', () => {
  it('should emit PROVIDER_KEY_SET when API key is set', async () => {
    // Test event emission
  });
  
  it('should auto-load models when key is set', async () => {
    // Test reactive loading
  });
  
  it('should persist selection across navigation', () => {
    // Test persistence
  });
  
  it('should support custom OpenAI-compatible providers', () => {
    // Test custom provider
  });
});
```

**CHECKPOINT: Task T3 Complete**
- [ ] Tests written
- [ ] Tests pass (`pnpm test`)

---

## 2.3 ACCEPTANCE CRITERIA VALIDATION

| AC | Criteria | Test Method | Status |
|----|----------|-------------|--------|
| AC-01.1 | API key set → models load automatically | Set key → verify models appear | [ ] |
| AC-01.2 | Model selection persists across navigation | Select → navigate → return → verify | [ ] |
| AC-01.3 | Custom OpenAI-compatible provider support | Add custom → verify works | [ ] |
| AC-01.4 | Event emission for cross-workspace sync | Set key in Settings → verify Knowledge updates | [ ] |

---

## 2.4 SWEEPING VALIDATION (Story Complete)

Run these Level 1 (State Integrity) checks:

- [ ] **No Dual-Source State:** Zustand is ONLY source of truth
- [ ] **No localStorage fallbacks:** Search `grep -r "localStorage" src/stores/`
- [ ] **Selector Hydration:** Skeleton shown until hydrated
- [ ] **State Flow Complete:** User Action → Zustand → Dexie → IndexedDB

---

## NEXT STEP

When all acceptance criteria pass:
1. Update story status to DONE
2. Generate handoff artifact
3. Load `step-03-story-ac02.md` for next story

**HALT and WAIT for user to confirm story completion.**
