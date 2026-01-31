# Architecture Contracts

**Created:** 2026-01-31
**Phase:** 01 - State Architecture Contracts

---

## Purpose

These documents define the **architectural contracts** that all development must follow. They establish:
- State boundaries between layers
- Data ownership rules
- Synchronization patterns
- Anti-patterns to avoid

**Compliance is mandatory.** Violations trigger governance alerts.

---

## Documents

| Document | Purpose | Key Content |
|----------|---------|-------------|
| [STATE-CONTRACTS.md](./STATE-CONTRACTS.md) | 4-layer state architecture rules | Layer definitions, ownership rules, anti-patterns |
| [ENTITY-LAYERS.md](./ENTITY-LAYERS.md) | Entity-to-layer mapping | Where each entity type lives, migration rules |
| [DATA-FLOW-CONTRACTS.md](./DATA-FLOW-CONTRACTS.md) | Data flow ownership | Read/write ownership, event contracts |
| [SYNC-PATTERNS.md](./SYNC-PATTERNS.md) | Synchronization patterns | Desktop vs Mobile sync, conflict resolution |

---

## Quick Reference

### The 4 Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: UI State (Zustand - NO persist)                   │
│    └── Transient: selection, hover, focus, form values      │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Session State (Zustand + Dexie Hydration)         │
│    └── Tab-scoped: active project, open tabs, layout        │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Persisted State (Dexie.js)                        │
│    └── Permanent: projects, threads, settings, credentials  │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: File State (FSA/SQLite+OPFS)                      │
│    └── Content: source code, markdown, assets               │
└─────────────────────────────────────────────────────────────┘
```

### The 4 Golden Rules

| # | Rule | Violation |
|---|------|-----------|
| 1 | **Never** use Zustand persist for Dexie-owned data | Duplicates source of truth |
| 2 | **Always** use `useShallow()` for Zustand selectors | Re-render cascades |
| 3 | **Always** use `useLiveQuery()` for Dexie reads | Missing reactivity |
| 4 | **Always** use StorageGateway for file operations | Bypasses sync engine |

### Technology Mapping

| Technology | Layer | Access Pattern |
|------------|-------|----------------|
| Zustand (NO persist) | UI | Direct subscription |
| Zustand (with hydration) | Session | Hydrate from Dexie on mount |
| Dexie.js | Persisted | `useLiveQuery()` for reads |
| FSA / SQLite+OPFS | File | `StorageGateway` only |

---

## Common Patterns

### Reading Persisted Data
```typescript
// ✅ CORRECT: Reactive reads via useLiveQuery
const projects = useLiveQuery(
  () => db.projects.orderBy('lastAccessed').reverse().toArray()
);
```

### Writing Persisted Data
```typescript
// ✅ CORRECT: Direct Dexie writes
await db.projects.update(projectId, { lastAccessed: Date.now() });
```

### File Operations
```typescript
// ✅ CORRECT: Go through gateway
const content = await projectContext.readFile(path);
await projectContext.saveFile(path, content);
```

### Zustand Selectors
```typescript
// ✅ CORRECT: useShallow prevents re-render cascades
const { activeId, setActive } = useStore(
  useShallow((s) => ({ activeId: s.activeId, setActive: s.setActive }))
);
```

---

## Common Anti-Patterns

### ❌ DO NOT: Persist Dexie data in Zustand
```typescript
// ❌ WRONG
const useProjectStore = create(persist((set) => ({
  projects: [] // Should be in Dexie!
})));
```

### ❌ DO NOT: Bypass the gateway
```typescript
// ❌ WRONG
const handle = await window.showOpenFilePicker();
```

### ❌ DO NOT: Skip useShallow
```typescript
// ❌ WRONG - causes re-render on ANY store change
const state = useStore((s) => s);
```

### ❌ DO NOT: Forget useLiveQuery
```typescript
// ❌ WRONG - not reactive
const projects = await db.projects.toArray();
```

---

## Sync Mechanism Decision

```
Is it UI-only state?
  YES → Zustand (NO persist)
  NO → Does it need to survive refresh?
         NO → Zustand + Hydration (session)
         YES → Is it file content?
                YES → StorageGateway + Event Bus
                NO → Dexie + useLiveQuery
```

---

## Related Documents

- **Codebase Analysis:** [../codebase/ARCHITECTURE.md](../codebase/ARCHITECTURE.md)
- **Project Definition:** [../PROJECT.md](../PROJECT.md)
- **Requirements:** [../REQUIREMENTS.md](../REQUIREMENTS.md)
- **Roadmap:** [../ROADMAP.md](../ROADMAP.md)

---

*Architecture Contracts Index: 2026-01-31*
*Phase: 01-state-architecture-contracts*
