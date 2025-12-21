# Epic 24: Smart Dependency Sync (NEW - 2025-12-21)

**Goal:** Persist node_modules to local filesystem for instant session restoration and faster reloads.

**Priority:** 🟠 P1 | **Stories:** 5 | **Points:** 21 | **Duration:** 1 week  
**Source:** node-module-sync-2025-12-21.md analysis

### Rationale

Unlike cloud IDEs that lose dependencies on session end, Via-Gent can persist `node_modules` to the user's local filesystem. Next session loads instantly—no `pnpm install` required.

### Stories

| Story | Title | Points |
|-------|-------|--------|
| 24-1 | Create Sync Configuration Layer | 3 |
| 24-2 | Implement Dependency Analysis Engine | 5 |
| 24-3 | Batched Sync with Progress UI | 5 |
| 24-4 | User Permission Dialog Flow | 3 |
| 24-5 | Terminal Integration (detect pnpm install) | 5 |

### Story 24-1: Create Sync Configuration Layer

As a **developer**,
I want **a configuration system for sync behavior**,
So that **users can control what gets synced to disk**.

**Acceptance Criteria:**
- Sync layers: `source` (auto), `dependencies` (ask), `build` (never)
- Config persisted in ProjectStore per project
- UI settings panel for sync preferences

---

### Story 24-2: Implement Dependency Analysis Engine

As a **developer**,
I want **intelligent analysis of which node_modules to sync**,
So that **large dependencies don't overwhelm local storage**.

**Acceptance Criteria:**
- Detect production vs dev dependencies
- Estimate size before sync
- Exclude known large/transient packages
- Show breakdown in UI

---

### Story 24-3: Batched Sync with Progress UI

As a **user**,
I want **to see progress when syncing dependencies**,
So that **I know the operation is working and how long it will take**.

**Acceptance Criteria:**
- Batch files in groups of 100
- Show progress: "Syncing dependencies (1500/3200 files)"
- Cancel button stops sync safely
- Resume support for interrupted syncs

---

### Story 24-4: User Permission Dialog Flow

As a **user**,
I want **to approve before large syncs happen**,
So that **I'm not surprised by disk usage**.

**Acceptance Criteria:**
- Dialog shows estimated size: "Would you like to persist 1.2GB of dependencies?"
- Options: "Persist", "Skip", "Always persist for this project"
- Preference saved in ProjectStore

---

### Story 24-5: Terminal Integration

As a **developer**,
I want **automatic sync after npm/pnpm install**,
So that **new dependencies are saved without manual action**.

**Acceptance Criteria:**
- Detect `pnpm install`, `npm install`, `yarn install` commands
- Emit event on install completion
- Trigger dependency sync automatically (if enabled)

---
