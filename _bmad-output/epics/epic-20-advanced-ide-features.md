# Epic 20: Advanced IDE Features

**Goal:** Implement power-user features for productivity and extensibility.

**Priority:** P4  
**Status:** Backlog  
**Added By:** Course Correction v6 (2025-12-20) - Transformed from legacy Epic 18  
**Prerequisites:** Epic 6 (AI Agent complete), Epic 9 (Multi-root)

### Story 20-1: Implement Offline Mode with IndexedDB Fallback

As a **user without network**,  
I want **to work on my project offline**,  
So that **I can continue coding anywhere**.

**Story Points:** 5

**Acceptance Criteria:**

- **AC-20-1-1:** Files cached in IndexedDB from local FS sync
- **AC-20-1-2:** Editor works offline with cached files
- **AC-20-1-3:** Terminal unavailable offline (WebContainer requires network)
- **AC-20-1-4:** Offline indicator in header
- **AC-20-1-5:** Changes synced when back online

---

### Story 20-2: Create Extension/Plugin System Architecture

As a **developer extending the IDE**,  
I want **a plugin API**,  
So that **I can add custom features**.

**Story Points:** 8

**Acceptance Criteria:**

- **AC-20-2-1:** Plugin manifest format defined (JSON)
- **AC-20-2-2:** Plugins loaded from local or remote URLs
- **AC-20-2-3:** Sandboxed execution in iframe
- **AC-20-2-4:** API exposed via postMessage
- **AC-20-2-5:** Example plugin: custom status bar widget

---

### Story 20-3: Add Workspace Snapshots & Time Travel

As a **user who made mistakes**,  
I want **to restore previous workspace states**,  
So that **I can undo multi-file changes**.

**Story Points:** 5

**Acceptance Criteria:**

- **AC-20-3-1:** Snapshot captures all open files' content
- **AC-20-3-2:** Snapshots stored in IndexedDB (max 10)
- **AC-20-3-3:** "Create Snapshot" button in header
- **AC-20-3-4:** "Restore Snapshot" picker shows timestamps
- **AC-20-3-5:** Diff view before restore confirmation

---

### Story 20-4: Implement Multi-Cursor & Column Selection

As a **power user**,  
I want **multiple cursors in the editor**,  
So that **I can edit multiple lines at once**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-20-4-1:** Cmd+D adds selection to next match
- **AC-20-4-2:** Alt+Click adds cursor
- **AC-20-4-3:** Alt+Shift+Arrow for column selection
- **AC-20-4-4:** Monaco editor configuration exposed
- **AC-20-4-5:** Keybindings documented in shortcuts panel

---

### Story 20-5: Add Command Palette History & Favorites

As a **power user**,  
I want **to access recent and favorite commands quickly**,  
So that **my workflow is faster**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-20-5-1:** Cmd+Shift+P opens command palette
- **AC-20-5-2:** Recent commands appear at top
- **AC-20-5-3:** Star icon to add to favorites
- **AC-20-5-4:** Favorites section in palette
- **AC-20-5-5:** History persisted to IndexedDB

---
