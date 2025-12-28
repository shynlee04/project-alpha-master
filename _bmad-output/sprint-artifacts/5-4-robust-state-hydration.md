---
title: "5-4 Robust State Hydration & Restoration"
epic: "Epic 5: Production-Ready Polish"
story: "5-4-robust-state-hydration"
status: "drafted"
priority: "P1"
points: 5
created: "2025-12-29"
sprint: "SPRINT-5"
team: "Team A"
dependencies:
  - "2-1-zustand-dexie-state-migration"
---

# Story: 5-4 Robust State Hydration & Restoration

**As a** returning user,
**I want** my application state to be exactly as I left it,
**So that** I can resume work immediately without reconfiguration.

---

## Story Context

### From Epic 5

Epic 5 delivers "Production-Ready Polish". Story 5-4 delivers robust state hydration that properly restores Zustand stores from Dexie, meeting FR-STATE-02 and FR-ERROR-04 requirements.

### User Journey

1. User reloads the page
2. Zustand stores wait for Dexie hydration
3. Splash screen prevents flash of empty state
4. State restored exactly as left
5. If state is corrupt, graceful recovery

### Technical Context

**Hydration Flow:**
1. App initializes
2. Show splash/loading state
3. Load data from Dexie in parallel
4. Hydrate Zustand stores
5. Render app with hydrated state

**Error Handling:**
- Zod schema validation
- Slice-by-slice recovery
- User notification on reset

---

## Acceptance Criteria

### AC-1: Hydration Loading State

**Given** the application is loading
**When** initializing state
**Then** Zustand stores wait for Dexie hydration before rendering sensitive UI
**And** a splash screen prevents "flash of unstyled content" or empty state

---

### AC-2: Complete State Restoration

**Given** stored state exists and is valid
**When** the app loads
**Then** all stores are hydrated:
- `useIDEStore`: Open files, active file, panels
- `useAgentsStore`: Agent configurations
- `useConversationStore`: Chat history
- `useNavigationStore`: Current route, sidebar state

---

### AC-3: Schema Mismatch Recovery

**Given** stored state is corrupt (schema mismatch)
**When** hydration fails processing via Zod
**Then** the specific slice resets to default
**And** a toast informs the user: "Settings reset due to update"
**And** app doesn't crash or show white screen

---

### AC-4: Partial Hydration

**Given** one store fails to hydrate
**When** hydration occurs
**Then** other stores hydrate successfully
**And** failed store uses defaults
**And** error is logged with details

---

### AC-5: Fresh Data Detection

**Given** external file changes occurred while app was closed
**When** the app reloads
**Then** file timestamps are checked
**And** UI updates to reflect current disk state
**And** "Disk > Cache" truth is enforced

---

## Implementation Tasks

### Task 1: Create HydrationManager

**File:** `src/lib/state/hydration-manager.ts`

**Interface:**
```typescript
export interface HydrationStatus {
  state: 'idle' | 'hydrating' | 'complete' | 'error';
  progress: number;
  errors: HydrationError[];
}

export interface HydrationError {
  store: string;
  error: string;
  recovered: boolean;
}

export class HydrationManager {
  // Hydrate all stores
  async hydrate(): Promise<HydrationStatus>;

  // Check if hydration is needed
  async needsHydration(): Promise<boolean>;

  // Get hydration status
  getStatus(): HydrationStatus;

  // Reset corrupted state
  async resetStore(storeName: string): Promise<void>;
}
```

---

### Task 2: Create SplashScreen component

**File:** `src/components/common/SplashScreen.tsx`

**Features:**
- Minimal loading UI
- Progress indicator
- Error state with retry

---

### Task 3: Update Zustand stores with hydration

**File:** `src/lib/state/*.ts` (multiple stores)

Add hydration middleware:
```typescript
export const useIDEStore = createWithMiddleware(
  ideSlice,
  persist(
    (set) => ({
      // ... state
    }),
    {
      name: 'ide-store',
      onRehydrateStorage: () => (state) => {
        hydrationManager.markHydrated('ideStore');
      },
    }
  )
);
```

---

### Task 4: Add unit tests

**File:** `src/lib/state/__tests__/hydration-manager.test.ts`

**Test cases:**
- Complete hydration flow
- Partial hydration with errors
- Schema mismatch recovery
- Fresh data detection

---

## Technical Notes

### Hydration Order

1. **Critical first**: Theme, user preferences
2. **Session data**: Open files, panels
3. **Non-critical**: Recent history, cached data

### Performance

- Parallel hydration of independent stores
- Timeout for hanging hydration (5s max)
- Lazy loading of non-critical stores

---

## Dependencies

| Dependency | Status | Purpose |
|------------|--------|---------|
| Story 2-1 | Done | Zustand + Dexie migration |
| Dexie | Installed | IndexedDB wrapper |
| Zod | Installed | Schema validation |

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] Splash screen prevents flash of empty state
- [ ] Schema mismatch handled gracefully
- [ ] Unit tests written and passing
- [ ] Hydration time <2s
- [ ] Story file updated with Dev Agent Record
- [ ] `sprint-status.yaml` updated: `5-4-robust-state-hydration: done`

---

## Dev Agent Record

**Agent:** TBD
**Session:** TBD

#### Task Progress:
- [ ] T1: Create HydrationManager
- [ ] T2: Create SplashScreen component
- [ ] T3: Update Zustand stores with hydration
- [ ] T4: Add unit tests

#### Research Executed:
- [ ] Context7: Zustand persist middleware
- [ ] DeepWiki: State hydration patterns

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/lib/state/hydration-manager.ts | Created | - |
| src/components/common/SplashScreen.tsx | Created | - |
| src/lib/state/ide-store.ts | Modified | - |
| src/lib/state/agents-store.ts | Modified | - |
| src/lib/state/__tests__/hydration-manager.test.ts | Created | - |

#### Decisions Made:
- TBD

---
