<think>
We are going to enhance the prompt by:
 1. Structuring it more clearly with a hierarchical numbering system for better readability.
 2. Removing redundant phrases and fixing grammatical errors.
 3. Clarifying ambiguous points and ensuring each requirement is distinct.
 4. Grouping related concepts and removing repetitions.
 5. Ensuring that the checklist items are clearly separated and actionable.

 However, note that the original prompt is very detailed and complex. We will try to preserve all the key points while making it more organized.

 Steps:
 - We'll break down the core groups and sub-points.
 - We'll use a consistent numbering and indentation for hierarchy.
 - We'll rephrase for clarity without changing the intended meaning.

 Important: The enhanced prompt must be self-contained and only the enhanced prompt.

 Let's start by organizing the main sections:

 I. Core and Centralized Groups (Managing and directing user flows and journeys)
    A. BYOK (Vault of Keys)
    B. Project Space (with clear boundaries, routing, naming, ID, flow, redirecting, and infrastructure considerations)
        - Entry points and conditions (homepage matrix: device type, user status)
        - Workspace entry rules (project required, device restrictions for IDE)
        - Project selection and workspace entry must be direct when conditions met
        - Project selection within workspace must be hotloaded and reactive
        - Device compromises: non-desktop devices cannot enter IDE (with clear notification)
    C. Agents vs LLMs (centralized management, activated under specific factors and workspaces)
        - System instruction prompts (orchestrator layer and workspace-specific modes)
        - Tools (intricate relationships, permissions, agentic multi-step execution with error handling)
        - RAG (infrastructure and use cases: browser vector DB, local embedding/chunking models, Gemini/Gemma)
        - Multimodality (input and output across workspaces and features)
    D. Cascade and thread-managed chat flow (gate to agents, used across workspaces, versatile with threads for RAG)

 II. Cross-Workspace Considerations
    - Current mapping, entry points, routing, and perpetuation of user use cases.

 III. Workspace-Specific Features
    - Environments for managing or rendering data (presentable to end-users).

 IV. Keywords Checklist (Project's Fundamental Truths)
    1. Client-side 100% (server calls only for LLMs and external APIs via browser).
    2. BYOK using Tanstack AI SDK and Tanstack Start; keys saved in vault and passed to agents reactively.
    3. Project ID and multiple projects across workspaces (IDE, notes; knowledge and study disabled for MVP).
    4. Desktop = FSA (File System Access); other devices = IndexedDB (Dexie). No IDE for non-desktop devices.
    5. Thread management (chat cascade): threads and conversations tied to project and space for RAG references.
    6. Consistent user experiences (states, hotload, persistence) across environments:
        a. FSA: Minimal compromise (no state loss, permissions persist, handling of file types beyond .md?).
        b. Other devices: Avoid conflicts in RAG, agentic, and tool usage.
        c. CRUD permissions for agents: Avoid conflicts (especially when human edits occur).
        d. RAG: Avoid conflicts across environments.
        e. Multimodality: Avoid input/output access conflicts.
    7. Agent permissions via tools (CRUD toggle on files).
    8. Rendering in workspaces and chat cascade for various file types and AI-generated content.
    9. Clear boundaries between state management (Zustand vs. Dexie); currently stores lack clear boundaries and connections.
    10. Hooks, hydration, rerouting with ID, and reactive persistence.
    11. Research: Determine if DexieDB should assist FSA for persistence or reactivity; refactor and reorganize stores if needed.
    12. Address edge cases (e.g., agent CRUD during human file edits).
    13. Identify any gaps.

 Now, we write the enhanced prompt accordingly.
</think>
**Enhanced Prompt:**

Define the architecture and implementation plan for a client-side application with the following core components and constraints:

1.  **Core Centralized Groups (User Flow Management):**
    1.  **BYOK (Bring Your Own Key) Vault:**
        *   Securely persist and conditionally distribute keys to various provider endpoints and use cases.
       2.  **Project Space (Critical Path):**
            *   Establish strict boundaries: routing, unique naming/ID, flow logic, redirects, state management (vs. other stores), infrastructure handling (FSA vs. IndexedDB/Dexie).
            *   Resolve foundational issues here to unblock dependent features.
            *   Entry Point Matrix (Homepage):
                *   Device: Desktop vs. Non-Desktop vs. New User vs. Returning User (with projects).
                *   Mandatory: No workspace (Note/IDE) entry without a project. Enforce via conditional toasts:
                    *   Returning Desktop User: Choose existing project or create new.
                    *   New/Non-Desktop User: Force project creation wizard.
                *   IDE Restriction: Accessible *only* on Desktop (show clear desktop-required toast).
                *   Project List: Display created projects for selection.
                *   Direct Landing: When project ID and workspace type are valid, land user directly in the target workspace (no intermediate steps).
                *   Reactive Project Selection: Hot-load and react to project changes within any workspace.
                *   Device Compromise: Strictly prohibit IDE access on non-desktop devices.
            *   CRUD Permissions: Apply consistently to humans and AI agents.
            *   Filesystem Sync: Handle unstable sync states to prevent cascading failures in downstream features.
        3.  **Agents & LLMs (Central Orchestration):**
            *   System Prompts: Two-layer (Orchestrator for intent/conversation + Workspace-specific "mode" for focused tool execution).
            *   Tools: Manage complex relationships, permissions (CRUD), and enable multi-step agentic execution with error handling logic.
            *   RAG: Design infrastructure for browser-based vector DB, local embedding/chunking models (various resources), and integration with models (e.g., Gemini, Gemma).
            *   Multimodality: Support input/output across workspaces and features (e.g., notebook commands, agent consumption/generation).
        4.  **Chat Cascade & Thread Management:**
            *   Central gateway to agents, used cross-workspace.
            *   Manage threads for conversation history and RAG context.
            *   Reference threads by Project ID and Workspace.
    2.  **Cross-Workspace Integration:**
        *   Map current features, define entry points, routing, and ensure seamless user journey transitions.
    3.  **Workspace-Specific Features:**
        *   Function as environments for core group management, data rendering, and user presentation.

**Keywords Checklist (Fundamental Truths & Constraints):**

1.  **Client-Side Only:** Server interaction limited to LLM/API calls via browser.
2.  **BYOK Implementation:** Use Tanstack AI SDK & Tanstack Start. Keys persisted in vault, reactively passed to agents.
3.  **Project-Centric:** Multiple projects across workspaces (IDE, Notes - Knowledge/Study disabled for MVP). Unique Project IDs.
4.  **Device Parity:** Desktop = FSA. Non-Desktop = IndexedDB (Dexie). **NO IDE on Non-Desktop.**
5.  **Thread Management:** Chat cascade threads tied to Project ID and Workspace for RAG context.
6.  **Consistent UX (State/Persistence):**
    1.  FSA: Minimize compromise (persistent permissions, no reload/state loss). Handle non-MD file rendering in block notes.
    2.  Non-Desktop: Prevent conflicts in RAG, agentic actions, and tool usage.
    3.  CRUD Permissions: Prevent conflicts between agents and humans (esp. concurrent edits).
    4.  RAG: Ensure conflict-free operation across environments.
    5.  Multimodality: Prevent input/output access conflicts.
7.  **Agent Permissions:** Control CRUD on files via tools.
8.  **Rendering:** Support diverse file types and AI-generated content across workspaces and chat.
9.  **State Management Boundaries:** Clearly define and connect Zustand (client state) and Dexie (persisted data) usage.
10. **Technical Hygiene:** Implement robust hooks, hydration, ID-based routing, and reactive persistence.
11. **Research:** Evaluate if DexieDB should augment FSA for persistence/reactivity. Refactor stores if needed.
12. **Edge Cases:** Address scenarios like agent CRUD operations during human file edits.
13. **Gap Analysis:** Identify and resolve any architectural or functional gaps.