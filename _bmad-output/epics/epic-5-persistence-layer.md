# Epic 5: Persistence Layer

**Goal:** Implement IndexedDB-based persistence for projects, conversations, and IDE state.

**Requirements Covered:** FR-PERSIST-01 to FR-PERSIST-05, NFR-REL-02

### Story 5.1: Set Up IndexedDB Schema

As a **developer**,
I want **an IndexedDB database with proper schema**,
So that **application state can be persisted**.

**Acceptance Criteria:**

**Given** the `src/lib/persistence/` directory
**When** I implement the db module using `idb`
**Then** the database opens with stores for:
  - `projects` (metadata, FSA handle)
  - `conversations` (messages, tool results)
  - `ideState` (layout, open files)
**And** schema version is tracked for migrations
**And** errors surface clearly if storage fails

---

### Story 5.2: Implement Project Store

As a **developer**,
I want **project metadata persistence**,
So that **recent projects appear on the dashboard**.

**Acceptance Criteria:**

**Given** a project opened in the IDE
**When** project metadata is saved
**Then** project appears in recent projects list
**And** last opened timestamp is recorded
**And** FSA handle reference is stored
**And** deleting a project removes it from the list

---

### Story 5.3: Implement Conversation Store

As a **developer**,
I want **conversation history persistence per project**,
So that **chat history survives page reload**.

**Acceptance Criteria:**

**Given** a chat conversation in a project
**When** page reloads
**Then** conversation history is restored
**And** tool execution results are preserved
**And** new messages append correctly
**And** conversation can be cleared

---

### Story 5.4: Implement IDE State Store

As a **developer**,
I want **IDE layout state persistence**,
So that **panel sizes and open files restore on reload**.

**Acceptance Criteria:**

**Given** IDE layout customizations
**When** page reloads
**Then** panel sizes restore to previous values
**And** open file tabs restore
**And** active file/scroll position restores
**And** terminal tab state restores

---
