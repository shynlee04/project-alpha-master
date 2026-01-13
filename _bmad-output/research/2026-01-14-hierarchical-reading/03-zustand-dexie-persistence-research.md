# Zustand + Dexie IndexedDB Persistence

**Source**: https://zustand.docs.pmnd.rs/integrations/persisting-store-data.html
**Context7 Research**: /pmndrs/zustand
**Date**: 2026-01-14

---

## Executive Summary

Zustand's `persist` middleware enables:
- **Automatic state persistence** to localStorage, sessionStorage, or **custom storage**
- **IndexedDB integration** via custom `StateStorage` implementations
- **Async storage support** with hydration lifecycle management
- **Versioning & migrations** for state schema evolution

---

## Core Persist Middleware

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useFishStore = create(
  persist(
    (set, get) => ({
      fishes: 0,
      addAFish: () => set({ fishes: get().fishes + 1 }),
    }),
    {
      name: 'food-storage', // unique storage key
      storage: createJSONStorage(() => sessionStorage), // default: localStorage
      partialize: (state) => ({ fishes: state.fishes }), // selective persistence
      version: 1, // state schema version
      migrate: (persistedState, version) => {
        if (version === 0) {
          return { fishes: persistedState.fishes * 2 }
        }
        return persistedState
      },
    }
  )
)
```

---

## Custom IndexedDB Storage

Using `idb-keyval` (wrapper around IndexedDB):

```typescript
import { get, set, del } from 'idb-keyval'
import { createJSONStorage, StateStorage } from 'zustand/middleware'

// Custom storage object
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    console.log(name, 'has been retrieved')
    return (await get(name)) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    console.log(name, 'with value', value, 'has been saved')
    await set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    console.log(name, 'has been deleted')
    await del(name)
  },
}

export const useBoundStore = create(
  persist(
    (set, get) => ({
      bears: 0,
      addABear: () => set({ bears: get().bears + 1 }),
    }),
    {
      name: 'food-storage',
      storage: createJSONStorage(() => storage),
    },
  ),
)
```

---

## Hydration Lifecycle Management

```typescript
// Manual rehydration
useFishStore.persist.rehydrate()

// Check hydration status
const hasHydrated = useFishStore.persist.hasHydrated()

// Listen for hydration completion
const unsub = useFishStore.persist.onFinishHydration((state) => {
  console.log('Hydration complete with state:', state)
})

// On rehydrate storage callback
onRehydrateStorage: (state) => {
  console.log('Hydration starts')
  return (state, error) => {
    if (error) console.error('Hydration failed', error)
    else console.log('Hydration finished', state)
  }
}
```

---

## Integration with Dexie

**Key finding**: The research shows using `idb-keyval`, but our stack uses **Dexie** directly.

### Dexie as Custom Storage

```typescript
import { db } from '@/infrastructure/persistence/dexie-db'

const dexieStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const record = await db.stateStorage.where('key').equals(name).first()
    return record?.value || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await db.stateStorage.put({ key: name, value, timestamp: Date.now() })
  },
  removeItem: async (name: string): Promise<void> => {
    await db.stateStorage.where('key').equals(name).delete()
  },
}
```

---

## Key Issues Identified

### 1. Rehydration Reference Breaking

From StackOverflow discussion:
> "The problem occurs because when state is rehydrated from IndexedDB, new object references are created for the AST nodes, breaking existing references."

**Implication**: Our Monaco/AST caching must handle reference equality carefully.

### 2. Async Storage Timing

From GitHub discussion #2876:
> "I've started integrating my zustand stores with IndexedDB (through Dexie) and noticed one rather annoying aspect..."

**Implication**: Must handle async hydration gaps - show loading states, prevent state access before hydration completes.

---

## Takeaways for HARS

| Concern | Solution |
|----------|----------|
| **Large state in IndexedDB** | Use Dexie with proper indexing |
| **Hydration race conditions** | Implement proper loading states |
| **Reference breaking** | Use immutable patterns or ref comparison |
| **Token budget** | Persist-first, then Zustand (D3 contract) |

---

## Sources

- Zustand Persist Docs: https://zustand.docs.pmnd.rs/integrations/persisting-store-data
- GitHub Discussion #1721: Zustand persist with IndexedDB
- GitHub Discussion #2876: Accessing previous value in persist setItem
- Context7 Research: /pmndrs/zustand
