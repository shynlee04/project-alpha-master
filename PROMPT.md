**Correct-Course is now officially activated!** Both teams can begin parallel work on the sprint

## This reminder below is for both team - as you must register yourself as team A or team B


1. **For this works better take good notes of this "**IMPORTANT** in this series of fixing, debugging *course-correction (correct-course) → we will follow this mindset that I address what observed → you will expand and elaborate on both width and depth (by reasoning using SKILLS, workflows, spawning sub-agents to investigate and research (online-based, latest 2026, official guides etc for absolute correction) → as you will always plan first with your width of detectable issues and clear critical solution (measured with only 95% and above confidence) and that all evidences, context are artifacts and included in your plan) → the after-match of the plan will be addressing the depth as you will plan ahead of the framework on which suspicions, or known collateral damages across slices, domains, of higher hierarchy of routing and across workspaces → as for the following cycles I will grasp these and start with the next set of problems.
- Notice 1: all intention to edit. modify, create or removal must be registered - all actions and notes must be traceable to its epics, stories and having these modified and/or added with notes and linkable references —
- Notice 2: As you make new files or remove legacy ones all must be look into the codebase (as it is extremely large codebase, lessen the code scattered for more reusability → using tools of grep, glob, search for symbols, context etc → all to not making overlapping and conflicting piece
- Notice 3: as for debugging you must always have an iterative trackpad/scratchpad for trials errors and deduction of hypothesis → these log what files touched, what changes and your reasoning among the three top possible solutions "

# Role: Master Software Architect & AI Systems Engineer (REMEMBER TO REGISTER WORK IN sprint-status and workflow-status) —> THE BELOW ARE FOR THE WHOLE SCOPE OF THIS EPICS - also all of their natures must be fully obligned and known of so that the drift, gaps and unmanagement of components can get through

## Objective

Conduct a comprehensive architectural refactoring initiative. You must inspect the existing codebase for flaws, map remediation plans to specific core features, detect conflicts, and formulate a validated execution strategy for a clean, high-performance architecture.

---

## Phase 1: Architectural Inspection & Remediation Planning

Perform a deep scan of the codebase to evaluate the following domains:

- **State & Stores:** Consistency, synchronization, and isolation.
- **Context & Persistence:** Lifecycle management and data integrity.
- **API & Data Flow:** Wiring, mappings, schema validation, and business contracts.
- **Boundaries & Layers:** Separation of concerns, modularization, and interface definitions.

**Assessment Criteria:**
Identify architectural gaps, technical debt, drift, code smells (e.g., God objects, spaghetti code, dead code), and deviations from Clean Architecture principles.

**Output:**
Propose an **Architectural Remediation Plan** that groups identified flaws into mutual relationships and dependency clusters.

---

## Phase 2: Feature Mapping & Assessment

Map the remediation plan to the product features, categorizing them into **Core/Centralized**, **Cross-Workspace**, and **Environmental** groups.

### 1. Core & Centralized Features

These features manage and direct the primary user flows and journeys.

### A. BYOK (Bring Your Own Key)

- **Scope:** Centralized vault for API keys.
- **Requirements:** Secure persistence and conditional usage across different provider endpoints and use cases.

### B. Project Space & Data Abstraction

- **Objective:** Establish clear boundaries for routing, naming IDs, flow, and redirection. Address current architectural instability caused by unsynchronized states/stores and messy routing.
- **Storage Strategy:**
    - **File System (Desktop):** Handle cross-workspace ID management.
    - **Browser Database (Default):** Determine if the database instance should be global or per-workspace for optimal cleanliness.
- **Unified Data Management (Desktop vs. Mobile):**
    - Create a seamless abstraction layer where the storage mechanism (File System vs. Browser DB) is transparent to the editing experience.
    - **Desktop Workflow:** Load project folder via File System $\rightarrow$ Render content as interactive blocks (rich media) $\rightarrow$ If entering "browser space" (default route), register as `default_note` unique to the workspace.
    - **Mobile Workflow:** Browser DB is the sole source of truth (no FS access). Project creation leads directly to `default_note`.
- **Permissions:** Define strict CRUD permissions for both Humans and AI Agents to ensure state stability during synchronization.

### C. Agents vs. LLMs

- **Management:** Centralized management with workspace-specific activation behaviors.
- **System Instructions (Two-Layer):**
    1. **Orchestrator Layer:** Conversational interface for detecting user intent.
    2. **Workspace-Specific Layer:** Auto-switching to specific `mode` based on context. The mode focuses on executing tools within specific target groups (5-6 key targets) while retaining access to others if explicitly requested.
- **Tools Ecosystem:**
    - Analyze intricate relationships between tools and architectural components.
    - Define logic for tool permissions (CRUD) and capabilities.
    - Ensure support for agentic, multi-step execution with error handling (e.g., facilitating one-shot app building).
- **RAG Infrastructure:**
    - Address infrastructure for Browser Vector DB vs. Local Embedding/Chunking models vs. External LLMs (Gemini, Gemma).
- **Multimodality:**
    - Manage input (consumption by features/agents) and output (rendering across workspaces) for various media types.

### D. Cascade & Thread Managed Chat Flow

- **Role:** Versatile gateway to Agents.
- **Requirements:** Thread management, conversation history, and readiness for RAG integration.

### 2. Cross-Workspace Features

- Assess current mapping, entry points, and routing.
- Ensure features perpetuate user use cases across different workspace boundaries.

### 3. Environmental Features

- Treat remaining features as environments for the Core features to manage, render, or sort data for end-user presentation.

---

## Phase 3: Conflict Detection

Detect conflicts in hybrid feature implementations.

- Identify superficial features that do not align with the architectural core.
- Flag features that consume excessive architectural effort relative to their value.
- Propose removal or consolidation of conflicting elements.

---

## Phase 4: Epic Formulation

Cross-reference the **Architectural Remediation Groups** (Phase 1) with the **Feature Map** (Phase 2).

- Identify slices where refactoring groups intersect with feature requirements.
- Combine these slices into **Correct-Course Epics** designed to fix both architectural debt and feature functionality simultaneously.

---

## Phase 5: Pre-Proposal Investigation (Sub-Agent Tasks) **IMPORTANT** Many of the below are the quality for forming story and checking them valid too -> validation will be launch with skeptism agents

Before finalizing the proposal, initiate a sub-agent investigation to iterate on the following sectors and return artifacts for validation:

### 1. Requirements Engineering

- Extend shallow epics into articulate User Stories.
- Depict real-life use cases, including edge cases, combined uses, advanced scenarios, and cross-domain interactions.
- Define clear **Functional Requirements**, **Non-Functional Requirements**, and **Acceptance Criteria**.

### 2. Analysis & Risk Management

- **Dependencies:** Map internal and external dependencies.
- **Risk Management:** Identify potential blockers and mitigation strategies.
- **Scope Definition:** Distinguish MVP items from non-MVP (deferred) items.
- **Artifacts:** Produce research notes, technical context, and architectural notes that link back to controlled core artifacts.

### 3. Structural Planning & Impact Analysis

- **File Operations:** Detail the structure of files to be Created, Modified, Removed, or Refactored.
- **Mapping:** Provide a clear map reasoning for *why* specific changes are necessary.
- **Authorization:** Log and isolate the number of files affected. Plan naming conventions and directory structures.
- **Migration Checklist:** Create a checklist of criteria that "must pass" to successfully migrate and complete the end-to-end refactor.

---

## Phase 6: Validation & Gatekeeping

- Present the investigation findings and the proposed Correct-Course Epics for review.
- **Do not proceed to implementation.** Await explicit authorization from the user.

---

## Phase 7: Implementation Execution

- Upon authorization, execute the story-cycles to implement the refactoring.
- Ensure the process is progressive, safe, and results in a clean, performant architecture end-to-end.