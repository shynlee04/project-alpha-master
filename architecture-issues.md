Act as a Senior Software Architect and Systems Engineer specializing in hybrid web/desktop applications and AI integration. Analyze the current architectural chaos of our project and provide a comprehensive remediation plan.

### Context and Current State
The application is currently in an unstable state due to unregulated boundaries between the File System (Desktop) and Browser Database (IndexedDB). This has caused a collapse in state management, routing logic, and data persistence. The codebase suffers from scattered store management, unclear naming conventions (specifically between "Project" and "Workspace"), and a lack of unified abstraction layers. Consequently, core features like the IDE and Note-taking are non-functional (no autosave, inability to select projects, IndexedDB failures).

### Critical Issues to Address

**1. Data Persistence & Storage Strategy (File System vs. IndexedDB)**
*   **Core Conflict:** Resolve the ambiguity between storing data on the File System (Desktop exclusive) versus IndexedDB (Browser/Mobile default).
*   **Cross-Workspace Consistency:** Define how project data persists across different workspaces. If a project is selected from an entry point or workspace, it must remain persistent until explicitly changed.
*   **User Segmentation:**
    *   **Desktop Users:** Must have access to the IDE via File System. Define if they can also access the Browser DB interface to avoid "double interface" confusion.
    *   **Non-Desktop Users:** Restricted to Browser DB. Determine if these users can manage multiple IndexedDB projects or if they are restricted to a single workspace context to prevent overlap.
*   **Technical Requirements:** Address CRUD operations, RAG (Retrieval-Augmented Generation), concurrent CRUD, permissions, file synchronization, and indexing.

**2. State Management, Routing, and Architecture**
*   **Store Management:** Audit the current state stores (context, persistence, mapping). Identify and resolve responsibility conflicts, overlapping logic, and scattered file structures.
*   **Naming & ID Conventions:** Standardize the distinction between "Project" and "Workspace." Ensure IDs and user-generated names are distinct to prevent system confusion.
*   **Routing & Error Handling:** Fix unclear routing logic, error throwing, and toast notifications. Ensure all routes, branches, and entry points are traceable for debugging.
*   **Reactive Runtime:** Resolve race conditions, loop crashes, and hot-reloading errors caused by unmanaged states.

**3. Core Feature Architecture**
*   **BYOK (Bring Your Own Key):** Ensure the secure persistence of API keys and their conditional usage across different endpoints and providers.
*   **Project Space Boundaries:** Establish clear boundaries for the "Project Space" regarding routing, naming, and state flow, distinct from other components.
*   **Unified Abstraction:** Create a seamless layer where the storage mechanism (FS vs. Browser DB) is transparent to the user, ensuring identical markdown rendering and interactive support across platforms.

**4. AI Agents & LLM Integration**
*   **System Instructions:** Implement a two-layer prompt architecture:
    1.  **Orchestrator Layer:** Conversational, detects user intent, and switches modes.
    2.  **Workspace-Specific Layer:** Executes tools based on the active mode.
*   **Tools & Permissions:** Define the logic for tool usage, including CRUD permissions and agentic multi-step execution with error handling.
*   **RAG Infrastructure:** Plan the infrastructure for Browser Vector DB versus local embedding/chunking models (e.g., Gemini Gemma).
*   **Multimodality:** Manage inputs and outputs across different workspaces and features (e.g., notebook commands vs. agent interactions).
*   **Chat Flow:** Design a cascade and thread-managed chat flow that serves as the gateway for agents and RAG.

### Diagnostic Command
Use the following command to visualize the file structure and identify the scope of scattered files:
```bash
ree -a -f \
  -I 'node_modules|cache|.cache|test|tests|__tests__|.*|_*|-*' \
  -J \
  . > tree.md
```

### Immediate Objective
**Do not write code or implement fixes yet.** Provide a strategic plan detailing how you will:
1.  Re-architect the data flow to unify File System and Browser DB interactions.
2.  Refactor state management to eliminate race conditions and routing errors.
3.  Standardize naming conventions and ID generation.
4.  Integrate AI agents and RAG within the stabilized architecture.
5.  Restore functionality to the IDE and Note-taking features (autosave, project selection).

Explain your approach step-by-step, prioritizing the stabilization of core data persistence and state management.