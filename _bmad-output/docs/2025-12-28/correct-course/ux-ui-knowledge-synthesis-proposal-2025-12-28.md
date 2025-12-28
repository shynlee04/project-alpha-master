Here is the comprehensive **UX Specification for the Knowledge Synthesis System (Project Alpha v2.0)**. This spec is designed to guide your development team (or yourself) in building the "Brownfield" evolution of Via-gent.

***

# 📘 UX Specification: Knowledge Synthesis Station (v2.0)
**Version:** 2.0 (Brownfield Adaptation)
**Target Audience:** Vietnamese Students (Mobile Consumers) & Teachers/Knowledge Workers (Desktop Creators).
**Core Philosophy:** "Local-First Intelligence" — Privacy of a local file, power of a cloud AI.

***

## 1. Information Architecture (The Mental Model)
The system is built around three core objects that persist across both Desktop and Mobile views.

| Object | Definition | Technical Representation |
| :--- | :--- | :--- |
| **Notebook** | A project container. Holds sources, the graph, and the canvas. | `Dexie.js` record (ID, Metadata) + OPFS Folder |
| **Source** | Raw input data (PDF, URL, YouTube). The "Truth" layer. | File in OPFS + Orama Vector Index |
| **Block** | A unit of knowledge (Note, Summary, Quiz, Flashcard). | JSON object (Notion-like schema) |
| **Canvas** | The visual arrangement of Blocks and Sources (Nodes & Edges). | `React Flow` graph state |

***

## 2. Desktop Experience ("The Creator Studio")
**Primary Goal:** Ingestion, Synthesis, and Publishing.

### 2.1 The Workbench Layout (3-Pane)
The interface resembles an IDE but optimized for text and knowledge graphs.

*   **Left Pane: Source Explorer (20% Width)**
    *   **Drag-and-Drop Zone:** "Drop PDFs, Audio, or Paste URLs here."
    *   **Source List:** Cards showing status (Indexing..., Ready).
    *   **Action:** Hovering a source reveals "Eye" (Preview) and "Graph" (Show connections) icons.
*   **Center Pane: The Knowledge Canvas (50% Width)**
    *   **Hybrid View:** A scrolling "Document" view that allows "Canvas" elements (mind maps) to be embedded between paragraphs.
    *   **Slash Commands:** Typing `/` triggers the Block Menu:
        *   Basic: H1, Text, Image, Code.
        *   **AI Synthesis:** `/summary`, `/quiz`, `/flashcards`, `/compare-sources`.
    *   **Direct Manipulation:** Dragging a PDF text selection from the Preview (Right Pane) onto the Canvas creates a linked "Quote Block."
*   **Right Pane: Inspector & Preview (30% Width)**
    *   **Tab 1: Source Viewer:** PDF Reader / YouTube Player. Highlighting text here anchors it to the Canvas.
    *   **Tab 2: Agent Chat:** The "Cascade Chat" (from Via-gent).
        *   *Context Aware:* Chat knows what block is currently focused.
    *   **Tab 3: Graph Settings:** Toggle "Auto-Connect" (AI suggests links).

### 2.2 Key Flows (Desktop)
1.  **Ingestion Flow:**
    *   User drops `Physics_Chap1.pdf`.
    *   **UI Feedback:** Progress bar on Source Card ("Parsing 30%... Indexing 80%...").
    *   **Completion:** "Source Ready. Generate Summary?" toast appears.
2.  **Synthesis Flow (The "Wow" Moment):**
    *   User selects 3 sources in Left Pane.
    *   Right-clicks -> "Synthesize".
    *   Agent Modal appears: "What do you want to create?" (Options: Study Guide, Comparison Table, Quiz).
    *   **Result:** Agent generates blocks directly onto the Canvas.
3.  **Publishing Flow:**
    *   Top-Right "Share" button.
    *   Option: "Export as .alpha Pack".
    *   Modal: "Add Cover Image", "Set Price/License", "Add Watermark".
    *   Action: Downloads `course_name.alpha` file.

***

## 3. Mobile Experience ("The Learner Companion")
**Primary Goal:** Consumption, Review, and Quick Query.
**Constraint:** No "Canvas" editing. Read-only + Append Mode.

### 3.1 The Navigation Structure (Bottom Tab Bar)
1.  **Home (Feed):** The core consumption stream.
2.  **Library:** Access to all `.alpha` packs.
3.  **Chat (Fab):** Floating Action Button for immediate RAG.

### 3.2 Screen Specifications
1.  **The "Knowledge Feed" (Home Tab)**
    *   **Layout:** Vertical scroll of "Cards" (TikTok/Instagram style but for text).
    *   **Card Types:**
        *   *Summary Card:* 3-bullet point summary of a topic.
        *   *Flashcard:* Tap to flip. Swipe Right (Know), Left (Review).
        *   *Quiz Card:* Multiple choice interaction.
        *   *Audio Card:* Mini player for the "Audio Overview."
    *   **Interaction:** Tapping a card opens the "Detail View" (Original source text highlighted).
2.  **The "RAG Chat" (Overlay)**
    *   **Trigger:** User taps the floating "Sparkle" icon.
    *   **Interface:** Chat bubbles.
    *   **Grounding:** Every AI response has footnotes `[1]`, `[2]`.
    *   **Interaction:** Tapping `[1]` slides up a "Source Sheet" (half-height modal) showing the exact paragraph in the PDF.
3.  **The "Library" (Files)**
    *   **Grid View:** Cover images of `.alpha` packs.
    *   **Import:** "Open .alpha" button (triggers native File Picker).
    *   **Sync:** "Scan QR" button to receive a pack from Desktop via WebRTC (Peer-to-Peer).

***

## 4. Visual Language & Feedback System
Since this is for education, the UI must be **encouraging** and **transparent**.

*   **Color Palette:**
    *   **Brand:** Electric Blue (Focus) & Warm Orange (Creativity).
    *   **Semantics:** Green (Verified/Indexed), Amber (Processing), Red (Error/Offline).
*   **Typography:**
    *   **Headings:** *Space Grotesk* (Modern, tech-forward).
    *   **Body:** *Inter* or *Roboto* (High readability on mobile).
*   **Micro-Interactions (The "Juice"):**
    *   **Indexing:** Don't just show a spinner. Show "Reading page 5..." -> "Extracting Concepts..." -> "Connecting Nodes...".
    *   **Quiz Success:** Confetti burst (CSS particle effect) when scoring 100%.
    *   **Connection:** When hovering a citation, draw a visible line (SVG) connecting the chat bubble to the source text.

***

## 5. Mobile-Specific Constraints & Workarounds
| Feature | Desktop UX | Mobile Workaround |
| :--- | :--- | :--- |
| **Canvas Editing** | Drag-and-drop nodes, infinite pan/zoom. | **Disabled.** View is flattened into a linear "Outline" or "Feed". |
| **PDF Reading** | Full-width PDF viewer. | **Reflow Mode.** Extract text and show as readable article. Show original PDF only on demand (pinch-zoom). |
| **File System** | "Open Folder" dialog. | **Import/Export only.** "Add to Library" copies file to internal OPFS storage. |
| **Code Execution** | WebContainer Terminal. | **Read-Only.** Code blocks are syntax-highlighted but non-interactive (or sent to cloud runner if needed). |

***

## 6. Onboarding Flow (The "First Run")
1.  **Splash Screen:** "Your Personal Knowledge Engine. Private. Offline."
2.  **Mode Selection:** "Are you a Creator (Teacher/Pro) or Learner (Student)?"
    *   *Creator:* Enables Studio UI features.
    *   *Learner:* Simplifies UI to Feed/Library.
3.  **The "Magic Trick":**
    *   "Drop a PDF here to start."
    *   (User uploads 1 file).
    *   System instantly generates a "30-second Audio Summary" (using TTS) and 3 "Flashcards."
    *   *Psychology:* Immediate value demonstration before asking for signup/payment.
A solid UX spec for this hybrid Notion + NotebookLM “knowledge synthesis station” should standardize on a **block/canvas** data model (Notion-like) while keeping a “sources → grounded answers → generated study artifacts” loop (NotebookLM-like), with your existing cascade chat becoming the universal action surface across every block and source.[1][2][3]

## Core UX principles (spec)
- **Everything is a block**: sources, summaries, extracted concepts, quizzes, flashcards, mind-map nodes, and even “agent runs” are first-class blocks with IDs, timestamps, and provenance.[3][1]
- **Grounding is always visible**: any AI output must display citations that deep-link to the exact source chunk (NotebookLM’s citation behavior is a strong baseline expectation).[2][1]
- **Local-first, fast feedback**: the UI reads from local state (IndexedDB/FS/OPFS depending on platform) and shows optimistic updates + progress indicators for long-running synth jobs.[4][5][1]

## Information architecture (what users “see”)
### Primary objects
- **Notebook**: a container for sources + blocks + graph connections (this maps directly to your “Knowledge tab / notebook view” idea).[1]
- **Source**: PDF/URL/YouTube/audio/text, represented as a Source Card with status (“processing”, “ready”, “needs review”).[1]
- **Synthesis artifacts** (blocks): “Summary”, “Key topics”, “Suggested questions”, “Study guide”, “Timeline”, “Flashcards”, “Quiz”, “Audio overview”.[6][2][1]

### Primary screens (desktop spec)
- **Knowledge Home (Notebooks list + Create)**: quick entry + templates (Exam Prep, Thesis, Lesson Plan).[1]
- **Notebook Workspace (3-pane default)**:  
  - Left: Sources list + filters (type, chapter, tags).[2][1]
  - Center: Page/Canvas (blocks + optional graph overlay).[1]
  - Right: “Studio” panel for generate actions (audio overview, study guide, quiz, flashcards) similar to NotebookLM’s “guide/studio” concept.[6][2]

## Seamless workflow spec (end-to-end)
### 1) The first 5 minutes (must feel “magical”)
1. User opens Knowledge tab → sees an empty state with a single “Drop your first source” zone (PDF/URL/paste text).[1]
2. After upload, a Source Card appears with a clear processing indicator and staged results: summary first, then key concepts/tags, then suggested questions.[1]
3. Clicking a suggested question opens your **cascade chat**, but the answer renders as a persistent “Answer block” with citations and a “Save as Card / Turn into Flashcards / Add to Quiz” action row.[2][1]

### 2) Continuous synthesis loop (the “NotebookLM × Notion” fusion)
- **Source-first**: selecting a source shows “Summary + Key Topics” above the source viewer, and each key topic is a one-click “start a new inquiry” trigger.[2]
- **Block-first**: any block can be highlighted and sent into the cascade chat as context (“Explain this”, “Generate 5 quiz questions”, “Connect this to other sources”), producing new blocks anchored to the original.[1]
- **Graph emerges automatically**: extracted concepts become nodes; citations create edges from “Answer blocks” to “Source chunks”; user edits edges to correct pedagogy (teacher mode).[1]

### 3) Study/Teaching modes (personas become UI modes)
Implement explicit workspace “modes” that re-skin the same notebook data:
- **Study mode**: emphasizes flashcards, quizzes, streaks, and “next best topic” recommendations.[1]
- **Research mode**: emphasizes synthesis tables, citation exports, and “what sources disagree?” prompts.[1]
- **Teacher mode**: emphasizes reusable lesson assets and packaging/export.[1]

(Under the hood, these can map to your 5-layer agent system by swapping the “Agent Mode” and “System Directives” layers per mode.)[4]

## Reuse from your IDE (what to keep vs. refactor)
### Keep (direct reuse)
- **Cascade chat as universal action surface**: keep your existing chat flow, but change the default output target from “terminal/ephemeral chat” to “persistent blocks” in the notebook.[1]
- **Zustand state + atomic/optimistic updates**: your roadmap’s atomic updates + rollback are exactly what a Notion-like editor needs to feel instant and safe.[5][4]
- **Dynamic UI feedback system**: treat every ingest/synth run as a job with progress, partial results, retry, and graceful error recovery (your roadmap already plans this).[4]

### Refactor (to fit knowledge UX)
- Replace “IDE-first navigation” with “Notebook-first navigation”: notebooks, sources, blocks, then optional IDE panels for power users.[1]
- Treat “agent runs” as objects: every run produces artifacts (blocks) and logs (for power users) instead of forcing users to watch a developer-like flow.[1]

## Mobile-first UX specification (critical for Vietnam)
- **Default layout becomes 2 surfaces**:  
  - A vertical **Card Feed** (blocks) for consumption and quick actions.[1]
  - A bottom-sheet “Ask / Generate” panel for cascade chat, so chat never steals the full screen.[1]
- **Storage UX**: on mobile, assume no File System Access; design around in-browser storage plus explicit Export/Import for notebooks/packs (so “data ownership” remains clear).[5][1]
- **Audio overview as mobile hero feature**: background listening + “jump to cited quote” is a highly engaging workflow and matches NotebookLM’s audio direction.[7][6]

If one constraint could be chosen for the UX spec (and enforced ruthlessly), it should be: “Every AI output must become a block with citations and next actions,” because that’s what differentiates you from generic chat and makes the workstation feel cumulative rather than disposable.[2][1]

[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/156529758/1342c9c9-6375-489a-b4bd-92b078d9b4bb/concept-for-knowledge-synthesis-station-2025-12-26.md)
[2](https://www.techrepublic.com/article/google-notebooklm-expands-sources-citations/)
[3](https://www.systemdesignhandbook.com/guides/notion-system-design-interview/)
[4](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/156529758/0000d6c9-92ae-42c9-93ec-e7fff114f960/implementation-roadmap.md)
[5](https://squads.com/blog/building-better-apps-with-local-first-principles)
[6](https://blog.google/technology/ai/notebooklm-audio-overviews/)
[7](https://www.engadget.com/ai/google-notebooklm-adds-improved-audio-overviews-and-background-listening-feature-174804128.html)
[8](https://support.google.com/notebooklm/answer/16212820?hl=en)
[9](https://blog.google/technology/ai/notebooklm-update-october-2024/)
[10](https://www.latent.space/p/ai-interfaces-and-notion)
[11](https://dev.to/lacey_glenn_e95da24922778/building-offline-first-mobile-apps-with-local-storage-3m8n)
[12](https://support.google.com/notebooklm/answer/16212820?hl=en-GB)
[13](https://www.youtube.com/watch?v=FOs4RDTC52Q)
[14](https://kipwise.com/blog/notion-ai-features-capabilities)
[15](https://www.reddit.com/r/fossdroid/comments/1bt00c4/material_notes_simple_local_material_design_notes/)
[16](https://www.reddit.com/r/singularity/comments/1hdeynr/notebooklm_gets_new_interface_interactive_audio/)
[17](https://matthiasfrank.de/en/notion-updates/)
[18](https://blackthorn-vision.com/blog/mobile-app-ux-design/)
[19](https://www.youtube.com/watch?v=nQYcPWhwIQo)
[20](https://www.notion.com/help/guides/get-answers-about-content-faster-with-q-and-a)
[21](https://expo.dev/blog/local-first-application-development-with-livestore)
[22](https://www.youtube.com/watch?v=fDzsth9WL8Y)