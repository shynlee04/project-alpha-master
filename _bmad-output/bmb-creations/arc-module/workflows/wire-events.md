---
name: wire-events
description: Add event bus integration to store actions for cross-store reactivity
version: 1.0.0
module: arc-module
validation_ref: sweeping-validation L4-L6
---

# Wire Events Workflow

## Purpose

This workflow guides the systematic addition of event emissions and subscriptions to Zustand stores, enabling cross-store reactivity without tight coupling.

## Prerequisites

- Event bus exists at `src/lib/events/store-events.ts`
- Target store identified
- Understanding of cross-store dependencies

---

## Step 1: Audit Current Store

### 1.1 Identify State-Mutating Actions

List all actions that change state:

| Action | State Changed | Should Emit Event? |
|--------|---------------|-------------------|
| `setApiKey(providerId, key)` | `providers[id].hasApiKey` | ✅ Yes |
| `fetchModels(providerId)` | `models[providerId]` | ✅ Yes |
| `addProvider(provider)` | `providers[]` | ✅ Yes |
| `getProvider(id)` | None (read-only) | ❌ No |

### 1.2 Identify Cross-Store Dependencies

Map which stores need to react to this store's changes:

```
provider-store.ts:
  setApiKey → triggers → models-store.fetchModels
  addProvider → triggers → ui notifications

agents-store.ts:
  setActiveAgent → triggers → AgentSelector sync (all workspaces)
  updateAgent → triggers → chat re-initialization
```

---

## Step 2: Define Event Types

### 2.1 Check Existing Events

```typescript
// src/lib/events/store-events.ts
export const STORE_EVENTS = {
  // Check if events already defined
  PROVIDER_KEY_SET: 'provider:key-set',
  PROVIDER_MODELS_LOADED: 'provider:models-loaded',
  // ...
} as const;
```

### 2.2 Add Missing Event Types

```typescript
// Add to STORE_EVENTS if missing
PROVIDER_ADDED: 'provider:added',
PROVIDER_REMOVED: 'provider:removed',
AGENT_SELECTED: 'agent:selected',
```

### 2.3 Define Event Payloads

```typescript
// Add typed payload interfaces
export interface ProviderKeySetPayload {
  providerId: string;
  timestamp: number;
}

export interface AgentSelectedPayload {
  agentId: string;
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  timestamp: number;
}
```

---

## Step 3: Add Event Emissions

### 3.1 Import Event Functions

```typescript
// In target store file
import { emitStoreEvent, STORE_EVENTS } from '@/lib/events/store-events';
```

### 3.2 Add Emissions to Actions

```typescript
// BEFORE
setApiKey: (providerId: string, apiKey: string) => {
  set((state) => ({
    providers: state.providers.map((p) =>
      p.id === providerId ? { ...p, hasApiKey: true } : p
    ),
  }));
  // No event emission
},

// AFTER
setApiKey: (providerId: string, apiKey: string) => {
  set((state) => ({
    providers: state.providers.map((p) =>
      p.id === providerId ? { ...p, hasApiKey: true } : p
    ),
  }));
  
  // Emit event for cross-store reactivity
  emitStoreEvent(STORE_EVENTS.PROVIDER_KEY_SET, {
    providerId,
    timestamp: Date.now(),
  });
},
```

### 3.3 Checklist for Each Action

For each state-mutating action:
- [ ] Import `emitStoreEvent` and `STORE_EVENTS`
- [ ] Call `emitStoreEvent()` AFTER `set()` completes
- [ ] Include relevant payload (IDs, timestamps)
- [ ] Use `STORE_EVENTS.*` constants (not raw strings)

---

## Step 4: Add Event Subscriptions

### 4.1 Identify Subscription Needs

Which store should react to which events?

| Subscriber Store | Listens To | Action Triggered |
|------------------|------------|------------------|
| models-store | `provider:key-set` | `fetchModels(providerId)` |
| chat-store | `agent:selected` | `initializeChatClient()` |
| ui-store | `provider:added` | `showToast()` |

### 4.2 Add Subscription at Store Level

```typescript
// src/stores/models-store.ts
import { subscribeStoreEvent, STORE_EVENTS } from '@/lib/events/store-events';

// Subscribe to provider key set event
subscribeStoreEvent(STORE_EVENTS.PROVIDER_KEY_SET, ({ providerId }) => {
  // Auto-fetch models when API key is set
  useModelsStore.getState().fetchModels(providerId);
});
```

### 4.3 Add Subscription in Components (if needed)

```typescript
// src/components/chat/AgentSelector.tsx
import { useEffect } from 'react';
import { subscribeStoreEvent, STORE_EVENTS } from '@/lib/events/store-events';

function AgentSelector() {
  useEffect(() => {
    const unsubscribe = subscribeStoreEvent(
      STORE_EVENTS.AGENT_SELECTED,
      ({ agentId }) => {
        // Sync selection from other workspaces
        setLocalSelectedAgent(agentId);
      }
    );
    
    return () => unsubscribe(); // Cleanup on unmount
  }, []);
  
  // ...
}
```

---

## Step 5: Validate Event Wiring

### 5.1 Verify Event Flow

Create a test scenario:

```
1. Enter API key in ProviderConfigDialog
2. Check: 'provider:key-set' event emitted
3. Check: models-store receives event
4. Check: fetchModels() called automatically
5. Check: 'provider:models-loaded' emitted
6. Check: UI updates to show models
```

### 5.2 Check Console for Events

Add debug logging temporarily:

```typescript
// In store-events.ts
export function emitStoreEvent(eventType: string, payload?: any) {
  console.log(`[EVENT] ${eventType}`, payload); // Debug
  eventEmitter.emit(eventType, payload);
}
```

### 5.3 Sweeping Validation L4 (Dependency Sanity)

- [ ] No circular imports between stores
- [ ] Events used for loose coupling (not direct imports)
- [ ] Store cross-import prevention

### 5.4 Sweeping Validation L5 (Integration Reality)

- [ ] Event subscriptions properly cleaned up
- [ ] No memory leaks from orphaned listeners
- [ ] Events fire in correct order

### 5.5 Sweeping Validation L6 (Architecture Compliance)

- [ ] Layer boundaries maintained (stores don't import components)
- [ ] Event bus used for cross-layer communication
- [ ] No direct store-to-store imports for reactivity

---

## Step 6: Document Event Flows

### 6.1 Update Data Flow Diagram

```
┌─────────────────┐    provider:key-set    ┌─────────────────┐
│ provider-store  │ ────────────────────▶ │  models-store   │
│   setApiKey()   │                       │  fetchModels()  │
└─────────────────┘                       └─────────────────┘
         │                                         │
         │                                         │
         ▼                                         ▼
  provider:added                          provider:models-loaded
         │                                         │
         ▼                                         ▼
┌─────────────────┐                       ┌─────────────────┐
│   UI Toast      │                       │  AgentSelector  │
│   Notification  │                       │  Model Dropdown │
└─────────────────┘                       └─────────────────┘
```

### 6.2 Update store-events.ts Documentation

Add comments for each event:

```typescript
export const STORE_EVENTS = {
  /**
   * Fired when an API key is set for a provider.
   * Triggers: models-store.fetchModels()
   */
  PROVIDER_KEY_SET: 'provider:key-set',
  
  /**
   * Fired when models are loaded for a provider.
   * Triggers: UI update in AgentSelector, AgentConfigDialog
   */
  PROVIDER_MODELS_LOADED: 'provider:models-loaded',
  // ...
} as const;
```

---

## Checklist Summary

| Step | Action | ✓ |
|------|--------|---|
| 1 | Audit store for state-mutating actions | [ ] |
| 2 | Define event types and payloads | [ ] |
| 3 | Add event emissions to actions | [ ] |
| 4 | Add event subscriptions in dependent stores | [ ] |
| 5 | Validate event flow works end-to-end | [ ] |
| 6 | Document event flows in diagrams/comments | [ ] |
| 7 | Run Sweeping Validation L4-L6 | [ ] |

---

**Workflow Created:** 2025-12-31T16:33:00+07:00
**Module:** arc-module v2.1
**Validation:** Sweeping Validation L4-L6
