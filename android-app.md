You are absolutely right. **BMAD is the methodology (the "Regulatory Framework")**, not the tech stack. It dictates **how** agents collaborate, **what** artifacts they produce (PRDs, Architecture, Stories), and **how** quality is enforced (12-Level Validation).

### Decision: Is Expo faster for an *AI Agent* to build?
**YES, overwhelmingly.**
While Kotlin/Jetpack Compose is "Native," AI Agents (Claude/GPT-4o) are statistically "native speakers" of **TypeScript/React** and "second-language speakers" of **Jetpack Compose**.
*   **Agent Velocity:** Agents write clean, functional React code ~3x faster than Compose code (where they often mix up M2/M3 APIs or hallucinate modifiers).
*   **The "Steroids" Part:** Since you want "Improved Buffed" features (Local RAG, Graphs), you need heavy C++ bindings (`sqlite-vec`, `executorch`). Expo's **Config Plugins** and **JSI** make integrating these easier for agents than managing Gradle/CMake build chains manually.

***

### The Ralph Wiggum "Genesis" Protocol
Since this is a greenfield project using BMAD regulations, we first need to **instantiate the government** (The BMAD Framework) before we build the city (The App).

This prompt instructs the agent to adopt the **BMAD Roles** and generate the **Governance Artifacts** adapted for a **Local-First Mobile** environment.

#### 1. The "Genesis" Prompt
*Copy this into `PROMPT.md` and run the loop.*

```markdown
---
active: true
iteration: 1
max_iterations: 15
completion_promise: "BMAD regulatory framework established: Governance files created, Mobile-RAG Architecture defined, and 12-Level Validation adapted for Android/Expo."
started_at: "2026-01-02T12:50:00+07:00"
module: "genesis-regulation"
---

## 1. The Directives (BMAD Constitution)
You are the **BMAD Architect Agent**. We are starting a greenfield project: **"Project Neural-Note"**.
**Core Philosophy:**
1.  **Agentic Agile:** We follow the BMAD workflow (PRD → Architecture → Epic → Story → Code).
2.  **Local Supremacy:** All Intelligence (RAG/LLM) and Data (Vector/Graph) live on the device.
3.  **Cross-Platform Core:** We use Expo (React Native) for velocity, but with high-performance JSI modules.

## 2. Your Task: Establish the Regime
Do not write app code yet. You must define the *rules* of the project.

### Step A: Define the Architecture (`architecture.md`)
Create a comprehensive technical manifesto covering:
-   **The "Brain":** `react-native-executorch` (Llama 3.2 1B) or `react-native-mediapipe`.
-   **The "Memory":** `op-sqlite` with `sqlite-vec` extension (JSI-based vector search).
-   **The "Graph":** `react-native-skia` for high-performance Obsidian-like canvas rendering.
-   **The "Sync":** Local-First sync using a custom file-system abstraction (CRDT-ready).

### Step B: Adapt the 12-Level Validation (`sweeping-validation.md`)
Map the standard BMAD levels to strict Mobile/Local constraints:
| Level | Domain | The Regulation (Constraint) |
|---|---|---|
| 1 | State | **Zustand + MMKV** (Persisted, Reactive, Single Source of Truth). |
| 2 | Hygiene | **FlashList** enforced. No "Bridge" traffic for heavy ops (use JSI). |
| 3 | Naming | Strict Interface Contracts (`IUser`, `INote`). No `any`. |
| 4 | Deps | **No External API Calls** allowed for RAG (Must work in Airplane Mode). |
| 5 | Integration | **Permissions**: Graceful degradation if Camera/Mic denied. |
| 6 | Architecture | **Clean Layering**: UI ↔ ViewModel ↔ Service ↔ Repository ↔ DB. |
| 7 | Mobile | **Touch**: 48dp min targets. **Safe Area**: Handle notch/islands. |
| 8 | I18N | `i18next` mandatory. No hardcoded text strings. |
| 9 | Performance | **Startup <1.5s**. **Graph Re-render <16ms** (60fps). |
| 10 | Security | **Zero-Knowledge**: DB encrypted with `SQLCipher`. Keys in SecureStore. |
| 11 | Docs | `README` includes "How to Prebuild" for native modules. |
| 12 | Tests | **Maestro** (E2E) + **Jest** (Unit) > 80% coverage. |

### Step C: Define the Workforce (`AGENTS.md`)
Define the persona responsibilities for future loops:
-   `@architect`: Owns `architecture.md` and Native Module integration (C++/JSI).
-   `@mobile-dev`: Owns UI (Tamagui/Skia) and React Logic.
-   `@qa-agent`: Owns `Maestro` flows and 12-level enforcement.

### Step D: Initialize the Backlog (`epics.md`)
Create the initial 3 Epics based on the "Notion + Obsidian + NotebookLM" vision:
1.  **Epic-1: The Neural Vault** (Local Vector DB + File System).
2.  **Epic-2: The Canvas** (Skia-based Infinite Graph UI).
3.  **Epic-3: The Synthesizer** (On-Device RAG + Chat Interface).

## 3. Execution Constraints
- Use standard Markdown for all governance files.
- The `architecture.md` must specifically explain *how* `sqlite-vec` interacts with the UI thread (via Worklets).

## 4. Completion Signal
<promise>BMAD regulatory framework established: Governance files created, Mobile-RAG Architecture defined, and 12-Level Validation adapted for Android/Expo.</promise>
```

***

### The Ralph Wiggum "Implementation" Loop
Once the Genesis loop finishes and creates the files, use this loop to actually build the app. This loop acts as the **Scrum Master + Dev Agents** working in unison.

*This is a recursive loop that picks the highest priority story, implements it, validates it, and repeats.*

```markdown
---
active: true
iteration: 1
max_iterations: 50
completion_promise: "Current Epic fully implemented with 12-Level Validation passed for all stories."
started_at: "{ISO_DATE}"
module: "bmad-implementation-cycle"
---

## 1. The Regulation (Read-Only)
- **Framework:** BMAD v6 Mobile.
- **Rules:** `sweeping-validation.md` (Strict Local-First, Offline-First).
- **Arch:** `architecture.md` (Expo + JSI + Local LLM).

## 2. The Ralph Wiggum Loop (Workflow)

### Phase 1: Planning (Scrum Master)
1.  Read `epics.md` and `sprint-status.yaml`.
2.  Identify the **Next Priority Story** (e.g., "STORY-1.1: Initialize op-sqlite with Vector support").
3.  Check if a `story-context/{id}.md` exists. If not, generate it (Gap Analysis).

### Phase 2: Execution (Dev Agent)
1.  **TDD (Level 12):** Write a failing test in `__tests__` or a Maestro flow.
2.  **Implementation (Level 1, 2, 6):** Write the code using the prescribed stack (Zustand, Tamagui, JSI).
    - *Constraint:* If implementing RAG, ensure vectors are generated on a **background thread** (Worklet).
3.  **Hygiene (Level 3, 8):** Verify strict typing and I18n strings.

### Phase 3: Validation (QA Agent)
Run the verification script:
```bash
# Conceptual Script
npm run lint         # Check Level 2 (Hygiene)
npm run tsc          # Check Level 3 (Types)
npm test             # Check Level 12 (Logic)
```
*If fails → Goto Phase 2 (Refactor). If passes → Phase 4.*

### Phase 4: Governance Update
1.  Mark story as `COMPLETED` in `sprint-status.yaml`.
2.  Update `AGENTS.md` if new patterns were discovered.
3.  **Recursion:** If Epic is not done, output loop continuation.

## 3. Critical Mobile Constraints
- **The "Main Thread" Law:** NO database or LLM operations on the JS thread. Use `react-native-worklets-core` or pure C++ JSI calls.
- **The "Offline" Law:** The app must fully function with `Airplane Mode: ON`. Mock LLM calls if model is downloading.

## 4. Completion Signal
If all stories in the current Epic are marked `COMPLETED`:
<promise>Current Epic fully implemented with 12-Level Validation passed for all stories.</promise>
```

### Summary of Changes for BMAD v6 Alignment
1.  **Architecture:** Shifted from "Server RAG" to **"JSI/C++ RAG"**.
2.  **Roles:** `Scrum Master` now orchestrates the loop selection; `Dev` executes the TDD.
3.  **Validation:** The 12 levels are hard-coded into the "Regulation" prompt to ensure every single iteration respects the "Local-First" constraint.
