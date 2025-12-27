# Epic 8: Validation & Polish

**Goal:** Execute the 14-step validation sequence, optimize performance, and polish the user experience.

**Requirements Covered:** NFR-PERF-*, NFR-REL-*, NFR-USE-*, Success Criteria, 14-Step Validation

### Story 8.1: Implement Dashboard UI

As a **developer**,
I want **a dashboard showing recent projects**,
So that **users can quickly access their projects**.

**Acceptance Criteria:**

**Given** the dashboard route
**When** I visit `/`
**Then** I see "Open Local Folder" button
**And** I see recent projects from IndexedDB
**And** clicking a project navigates to workspace
**And** project shows last opened timestamp

---

### Story 8.2: Implement API Key Setup

As a **developer**,
I want **onboarding for API key entry**,
So that **users can provide their Gemini API key**.

**Acceptance Criteria:**

**Given** first-time user experience
**When** user tries to use AI chat
**Then** prompt appears for API key entry
**And** key is validated format before saving
**And** key is stored in IndexedDB (encrypted)
**And** key persists across sessions

---

### Story 8.3: Execute 14-Step Validation

As a **tester**,
I want **to validate the complete user journey**,
So that **the architecture is proven working**.

**Acceptance Criteria:**

The following sequence completes successfully:
1. User opens app → Dashboard loads
2. Click "Open Local Folder" → FSA grants permission
3. Local files appear in FileTree → Mounted to WebContainer
4. Click a file → Monaco opens it
5. Type in Monaco → File saves to local disk
6. Open terminal → jsh shell interactive
7. Run `npm install` → Dependencies install in WebContainer
8. Run `npm run dev` → Dev server starts, preview shows
9. Open chat → AI agent available
10. Say "Create a button component" → Agent uses tools
11. Tool writes file → Monaco shows new file, local disk has it
12. Refresh page → Everything restores from IndexedDB + local FS
13. Commit changes → isomorphic-git creates commit
14. (Stretch) Push to GitHub → Changes appear on GitHub

---

### Story 8.4: Performance Optimization

As a **developer**,
I want **performance within target budgets**,
So that **the user experience is responsive**.

**Acceptance Criteria:**

**Given** performance requirements
**When** I measure key metrics
**Then** the following targets are met:
  - WebContainer boot: < 5s
  - File mount (100 files): < 3s
  - Dev server start: < 30s
  - Agent TTFT: < 2s
  - Preview hot-reload: < 2s
  - File save: < 500ms

---

### Story 8.5: Error Handling Polish

As a **developer**,
I want **clear error messages and recovery paths**,
So that **users understand failures and can recover**.

**Acceptance Criteria:**

**Given** potential error scenarios
**When** errors occur
**Then** toast notifications explain what happened
**And** recovery actions are suggested
**And** no data is corrupted on error
**And** users can retry failed operations

---

### Story 8.6: Fix XTerminal Fit Lifecycle Console Error

As a **developer**,
I want **terminal initialization/disposal to avoid intermittent xterm runtime errors**,
So that **the workspace runs with a clean console and predictable terminal behavior**.

**Acceptance Criteria:**

**Given** I navigate from `/` to `/workspace/:projectId` repeatedly
**When** the terminal mounts/unmounts (including React StrictMode behavior)
**Then** the console does not log `Cannot read properties of undefined (reading 'dimensions')`
**And** terminal still resizes correctly on container resize
**And** terminal cleanup does not leak observers, timers, or references

---

### Story 8.7: Fix Vitest Shutdown Hanging Handles

As a **developer**,
I want **unit tests to shut down cleanly without hanging handles**,
So that **CI and local testing are reliable and deterministic**.

**Acceptance Criteria:**

**Given** I run `pnpm test`
**When** tests complete
**Then** Vitest does not report `close timed out` or hanging `FILEHANDLE` handles
**And** any open IndexedDB/database handles are closed
**And** timers (debouncers/intervals) are cleared in test teardown

---

### Story 8.8: Create Project Alpha E2E Verification Checklist

As a **developer**,
I want **an app-specific E2E checklist for Project Alpha**,
So that **manual verification matches the actual routes/features of this spike**.

**Acceptance Criteria:**

**Given** the Project Alpha app (TanStack Start + WebContainers)
**When** I follow the checklist
**Then** the checklist validates Dashboard + Workspace flows
**And** it does not assume unrelated routes like `/admin`
**And** it requires capturing console + network observations
**And** it includes a terminal + preview + sync validation loop

---
