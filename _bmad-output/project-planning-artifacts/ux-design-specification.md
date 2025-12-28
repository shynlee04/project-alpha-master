---
stepsCompleted: [1, 2, 3, 4, 14]
inputDocuments:
  - _bmad-output/project-planning-artifacts/prd.md
  - _bmad-output/docs/2025-12-28/correct-course/ux-ui-knowledge-synthesis-proposal-2025-12-28.md
  - _bmad-output/cis/knowledge-synthesis-station-concept-2025-12-26.md
documentCounts:
  prd: 1
  proposal: 2
workflowType: 'ux-design'
workflowStatus: 'completed'
lastStep: 14
project_name: 'Project Alpha v2.0 - Knowledge Synthesis Station'
user_name: 'Admin'
date: '2025-12-28'
---

# UX Design Specification - Project Alpha v2.0

**Knowledge Synthesis Station**

**Author:** Admin  
**Date:** 2025-12-28  
**Version:** 2.0  
**Status:** Approved for Implementation  

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## 1. Project Understanding

### Executive Summary

#### Project Vision

**Project Alpha v2.0 - Knowledge Synthesis Station** reimagines how students, teachers, and knowledge workers transform raw information into actionable understanding. Built on a **local-first, privacy-respecting architecture**, it merges the structured creativity of Notion with the AI synthesis power of NotebookLM — all running entirely in the browser.

The platform operates on a "Two-Engine" model:
- **Desktop (Creator Studio):** Full-featured workspace with WebContainer, Canvas editing, and AI synthesis
- **Mobile (Learner Companion):** Consumption-focused with Card Feed, RAG Chat, and Audio Overviews

#### Vietnamese Market Context

**EdTech Market:**
- **Historical Growth:** 25% CAGR (2022-2024) driven by COVID-19 digital acceleration
- **Projected Growth:** 12-13% CAGR through 2032 (conservative stabilization)
- **Government Support:** 15.5% state budget allocated to education
- **Mobile Penetration:** 126% (127M connections for 100M population)

**Mobile Behavior Insights:**
- **Daily Usage:** 7.3 hours/day on mobile (highest in Southeast Asia)
- **Usage Pattern:** 66% use mobile primarily for entertainment/social media
- **Study Behavior:** Serious knowledge work still primarily happens on desktop/laptop
- **Insight:** Mobile dominates *consumption*, desktop dominates *creation*

### Target Users

**Primary Personas:**

| Persona | Archetype | Context | Primary Need | Surface |
|---------|-----------|---------|--------------|---------|
| **Minh** | High School Student | Mobile-first, exam prep | Connect concepts across textbooks quickly | Mobile |
| **Thảo** | University Student | Research-heavy, thesis work | Synthesize 50+ papers into coherent thesis | Desktop |
| **Cô Lan** | High School Teacher | Content creator, curriculum | Turn lesson plans into engaging quizzes | Desktop |
| **Dev** | Developer | Power user, code analysis | Understand codebases through AI synthesis | Desktop |

**User Segments by Surface:**
- **Desktop (Creator Studio):** Teachers, researchers, developers synthesizing knowledge (power users)
- **Mobile (Learner Companion):** Students consuming flashcards, quizzes, audio summaries (mass market)
- **Progressive Degradation:** Mobile users see "Demo Mode" for WebContainer-dependent features

### Key Design Challenges

1. **Two-Engine Mental Model Gap**
   - Users must understand Desktop/Mobile capability split without feeling "limited"
   - Risk: Frustration when Canvas editing disabled on mobile
   - Solution: Clear mode switching with educational messaging ("Heavy lifting on desktop, knowledge in your pocket")

2. **Progressive Disclosure of Complexity**
   - The system is powerful (AI synthesis, vector search, graph visualization)
   - Risk: Overwhelming new users with options
   - Solution: "Magic trick" onboarding, feature unlocking over time

3. **Citation Trust & Grounding**
   - Vietnamese students need to trust AI-generated study materials
   - Cultural context: Teacher authority is high; AI content needs validation pathway
   - Solution: Always-visible [1][2] footnotes with instant preview + "Teacher Verified" badges

4. **Mobile Consumption vs Desktop Creation**
   - Vietnamese students use mobile 7.3 hrs/day, but WebContainer requires desktop
   - 66% use mobile for entertainment, not learning — behavior change required
   - Solution: Position "Demo Mode" as native, not limited; Audio Overview as hero feature for mobile engagement

### Design Opportunities

1. **Audio Overview as Viral Hook**
   - 30-second AI-generated summaries in Vietnamese
   - Aligns with NotebookLM viral success
   - Background listening mode for commute/multitasking
   - Strong mobile engagement driver

2. **Structured Review Sessions**
   - Vertical card feed for learning content (not pure gamification)
   - Spaced repetition with "Know" / "Review Later" actions
   - Progress tracking with study streaks
   - Positioned as *learning tool* not *entertainment competitor*

3. **Teacher-to-Student Knowledge Packs**
   - `.alpha` pack distribution enables content marketplace
   - Vietnamese exam prep culture strongly supports this model
   - Teachers create, verify, and distribute; students consume
   - Potential revenue path: Premium verified content

4. **Offline-First for Rural Vietnam**
   - Urban areas have 100% mobile broadband; rural areas lag significantly
   - IndexedDB/OPFS storage enables full offline capability
   - Strong differentiator: "Learn anywhere, even without internet"
   - Critical for exam prep in areas with unreliable connectivity

### Cultural Context Considerations

**Vietnamese Education System:**
- High-stakes examination culture (high school graduation, university entrance)
- Teacher authority is respected; AI content should support, not replace
- Strong parental involvement in education
- Group study sessions are common

**Language Considerations:**
- Primary market: Vietnamese-language educational content
- English proficiency varies widely by urban/rural, age
- Interface and AI responses should default to Vietnamese
- Code/technical content may use English terms (acceptable)

**Trust Factors:**
- Students may initially trust teacher-vetted materials over AI-generated
- Citation visibility is critical for building trust
- "Verified by Teacher" badges can bridge AI trust gap

## 2. Core User Experience

### Phase 1: Developer Workflow (Stabilization Focus)

**Core Loop:** Open Project → Restore State → Edit → Agent Assist
- **Open:** FSA grants access to local project folder (User ownership)
- **Edit:** Monaco editor with WebContainer preview (IDE parity)
- **Agent Assist:** Tool-augmented LLM reads/writes code with approval
- **Save:** Atomic writes to Local FS (<500ms latency)

**Critical Success Moments (Phase 1):**
1. **WebContainer Boot:** Desktop loads project environment in < 5 seconds.
2. **FSA Permission Grant:** User successfully re-grants permission on session restore (>90% success).
3. **State Restoration:** User returns after 3 days to find exact tab, scroll position, and history restored.
4. **Agent Execution:** User approves agent code change → File updates instantly → Preview reflects change.

**Experience Principles (Phase 1):**
1. **Trust Through Transparency:** User specifically approves every file mutation.
2. **Local-First Control:** Files live on user's disk; we just borrow them.
3. **Zero Data Loss:** Atomic writes and continuous state persistence.

### Phase 2: Knowledge Synthesis (Future Vision)

**Core Loop:** Ground → Synthesize → Review
- **Ground:** Ingest PDF/URL → Orama vector index (Local)
- **Synthesize:** Generate Blocks (Summaries, Quizzes) with citations
- **Review:** Consume via Flashcard Feed or Audio Overview

**Critical Success Moments (Phase 2):**
1. **First Drop:** PDF ingestion to Summary with citations in < 60 seconds.
2. **Citation Verification:** Tap `[1]` → Source highlights exact sentence (Trust moment).
3. **Mobile Exam Prep:** Flashcard feed loads from IndexedDB in < 2 seconds.

**Experience Principles (Phase 2):**
1. **Source is Sacred:** Never modify original documents; synthesis layers on top.
2. **Blocks, Not Blobs:** AI produces persistent, structured artifacts (JSON), not ephemeral text.
3. **Grounding Always Visible:** 100% of AI assertions must have deep-linked citations.

### Platform Strategy & Architecture

**The Two-Engine Architecture:**

| Feature | Desktop (Creator Studio) | Mobile (Learner Companion) |
| :--- | :--- | :--- |
| **Role** | Creation, Synthesis, Coding | Consumption, Review, Query |
| **Input** | Mouse/Keyboard, Drag-and-Drop | Touch, Swipe, Voice |
| **Constraint** | WebContainer + Full FSA Access | **No WebContainer, No FSA Access** |
| **Storage** | Local FS (Real OS disk) + IndexedDB | IndexedDB Only + Service Worker Cache |
| **Sync** | **Local-First Single Device** | **Local-First Single Device** (Manual Export/Import) |

**FSA Permission Lifecycle (Desktop):**
1. **First Visit:** Explainer Modal → Native Folder Picker → Grant.
2. **Return Visit:** Dashboard "Resume" → One-click "Restore Access" → Ready.

**Progressive Degradation (Mobile):**
- **Detection:** Mobile Viewport + No `SharedArrayBuffer` support.
- **UX:** "Demo Mode" banner explains capabilities. Editor/Terminal disabled; Chat/Feed enabled.
- **Goal:** Users understand limitation without feeling blocked.

### Effortless Interactions

1.  **State Restoration:** Desktop reopens to exact tab, scroll, and chat history.
2.  **Optimistic UI:** File edits appear instantly in UI before disk confirmation.
3.  **Background Sync:** WebContainer ↔ Local FS sync happens invisibly in <500ms.
4.  **Drop-to-Knowledge (Phase 2):** PDF drag-and-drop triggers immediate ingestion pipeline.
5.  **One-Tap Citation (Phase 2):** Instant slide-over of source context when verifying AI claims.

## 3. Desired Emotional Response

### Primary Emotional Goals

**"Clear-Headed Mastery"**
The product should evoke the feeling of turning chaos (50 PDFs, scattered code) into order.
- **Core Feeling:** "I finally understand how this connects."
- **Context:** High-stakes exam prep or complex refactoring creates "Fog of War." We provide the map.

**Secondary Emotions:**
*   **Safe/Secure:** (Local-First) "My work is safe on my device. No one is peeking."
*   **Empowered (Constrained):** (Mobile) "I can review and learn on mobile, knowing I'll create heavily on desktop."
*   **Validated:** (Citations) "I can verify this answer. It's not hallucinating."

### Emotional Journey Mapping

| Stage | User Context | Desired Feeling | Design Tactic |
| :--- | :--- | :--- | :--- |
| **Permission Grant** | Browser asks for Disk Access | **Control & Safety** | Explainer modal emphasizes "Your Data, Your Disk." No "Cloud Sync" buzzwords. |
| **Wait Time (Ph 1)** | WebContainer Booting | **Informed Patience** | "Starting Node.js runtime..." (>5s target). Never a generic spinner. |
| **Wait Time (Ph 2)** | Parsing large PDF | **Productive Anticipation** | "Reading page 5... Extracting concepts..." |
| **Discovery (Mobile)** | Opening "Demo Mode" | **Pleasant Reality Check** | "📱 Learner Mode Active • 💻 Creator Mode on Desktop." Reframing limitation as "Review Mode." |
| **Verification** | Checking an AI claim | **Vindication** | One-tap citation slide-over. The "I Knew It" trust moment. |

### Micro-Emotions

**For Developers (Phase 1):**
*   **Avoid:** "Magic Anxiety" (Did the agent break my config?).
*   **Target:** "Surgical Precision" (Show the diff, ask for approval).
*   **Context:** Vietnam developers are pragmatic; "Show me code" > "Trust me".

**For Students (Phase 2):**
*   **Avoid:** "Imposter Syndrome" (This is too hard).
*   **Target:** "Supported Autonomy" (The AI assists, but I am learning).
*   **Context:** Teacher authority is high. AI is the "Tutor," not the "Professor."

### Cultural Design Implications (Vietnam)

**1. Trust & Authority:**
- **Context:** High respect for teachers; skepticism of unverified content.
- **Design:** "Verified by Teacher" badges on .alpha packs.
- **Tone:** Respectful but encouraging.

**2. Localized Warmth:**
- **Tone System:**
    - *Student Mode:* Friendly ("Bạn", "Chúng mình").
    - *Teacher Mode:* Respectful ("Thầy/Cô", "Em").
    - *Dev Mode:* Technical, concise.
- **Idioms:** "Học mọi lúc, làm khi cần" (Learn anytime, create when needed) for mobile banner.

**3. Privacy Realism:**
- **Context:** Government surveillance concerns + Decree 13 compliance.
- **Design:** "Offline/Local" indicator is prominent.
- **Color Coding:** Green (Local/Offline), Yellow (Syncing AI), Blue (Demo Mode).

### Emotional Design Principles

1.  **Respect the User's Intelligence:** Show the work. Show the diffs. Show the citations.
2.  **Confidence Calibration:** AI expresses uncertainty when appropriate ("I'm 80% sure, check source [1]").
3.  **No "Black Box" Magic:** Every output is traceable to a source or tool execution.
4.  **Calm, Not Cluttered:** Progressive disclosure matches the user's mastery level.

## 4. Visual & Interaction Design System

### Design Personality
*   **Aesthetic:** "Clean Focus" (Notion-Lite). Minimalist, whitespace-heavy to support deep reading.
*   **Primary Action Color:** Electric Blue (#2563EB) for "Focus/Creation".
*   **Secondary Action Color:** Warm Orange (#F97316) for "Learning/Flashcards".
*   **Status Colors:**
    *   **Verified:** Emerald Green (#10B981) - Used for citations and saved files.
    *   **Local/Offline:** Slate Gray to Green - "Safe" status.
    *   **Processing:** Amber Pulse - "Working on it".

### Component Strategy (ShadCN UI)
We are building on **Radix Primitives** via **ShadCN UI** to ensure accessibility and robustness.

| UI Element | Component | Customization |
| :--- | :--- | :--- |
| **Panels** | `ResizablePanel` | 3-pane layout with persistent width state in localStorage. |
| **Modals** | `Dialog` | Used for FSA permission and detailed settings. |
| **Cards** | `Card` | Base for Source Cards, Flashcards, and Agent Blocks. |
| **Menus** | `DropdownMenu` | Context actions on right-click (Synthesize, Delete). |
| **Toasts** | `Sonner` | Non-blocking feedback ("File Saved", "Indexing Complete"). |
| **Data Tables** | `TanStack Table` | for citation lists and source management. |

### Iconography
*   **Library:** Lucide React (Std).
*   **Style:** Stroke 1.5px (Light/Modern).
*   **Key Icons:**
    *   `Sparkles`: AI Synthesis.
    *   `Brain`: Knowledge Graph.
    *   `Database`: Local Storage/Sources.
    *   `WifiOff`: Offline Indicator.

## 5. Screen Specifications (Phase 1)

### Desktop: The Creator Studio
**Layout:** 3-Column Resizable
1.  **Sidebar (Left):** File Explorer / Source List.
    *   *Features:* Drag-drop upload, status indicators, "Open Folder" CTA.
2.  **Main Stage (Center):** Monaco Editor / Preview / Canvas.
    *   *Features:* Tabbed interface, Split view (Code | Preview).
3.  **Assistant (Right):** Cascade Chat.
    *   *Features:* Chat bubbles, "Apply Diff" blocks, "Thinking" logs.

**Key Interaction:**
*   **Agent Diff View:** When agent proposes code, show `DiffEditor` (Monaco) in a modal or inline block. User clicks "Accept" to write to disk.

### Mobile: The Companion (Demo Mode)
**Layout:** Bottom Tab Bar Navigation
1.  **Home:** Recent Projects / Read-Only File Tree.
2.  **Chat:** Full-screen chat interface with history.
3.  **Settings:** Theme, Cache Management.

**Key Interaction:**
*   **Read-Only Editor:** Tap a file -> Opens `MonacoEditor` in `readOnly={true}` mode.
*   **Banner:** "Editing disabled on mobile. Switch to desktop to code." (Dismissible).

## 6. Accessibility & Responsiveness

### Accessibility Standards (WCAG 2.1 AA)
*   **Contrast:** All text must meet 4.5:1 ratio against background.
*   **Focus States:** Visible ring (2px blue) on all interactive elements for keyboard nav.
*   **Screen Readers:** All icon buttons must have `aria-label`.
*   **Motion:** Respect `prefers-reduced-motion` (disable confetti/smooth scroll).

### Responsive Breakpoints
*   **Mobile (<768px):** Sidebar hidden (Hamburger menu). Chat is overlay or full screen.
*   **Tablet (768px-1024px):** Sidebar collapsible. 2-column view (Editor + Chat).
*   **Desktop (>1024px):** Full 3-column layout.

## 7. Implementation Checklist (Phase 1)

*   [ ] **Theme Engine:** Implement `next-themes` with System/Dark/Light support.
*   [ ] **Layout Shell:** `ResizablePanelGroup` for Desktop, `Drawer` for Mobile.
*   [ ] **FSA Guard:** `useFileSystem` hook that handles permission state logic.
*   [ ] **Mobile Guard:** `isMobile` check to disable WebContainer/Monaco write mode.
*   [ ] **Agent UI:** `ChatInterface` component with "Tool Execution" blocks (not just text).


## 1. Project Understanding

### Executive Summary

#### Project Vision

**Project Alpha v2.0 - Knowledge Synthesis Station** reimagines how students, teachers, and knowledge workers transform raw information into actionable understanding. Built on a **local-first, privacy-respecting architecture**, it merges the structured creativity of Notion with the AI synthesis power of NotebookLM — all running entirely in the browser.

The platform operates on a "Two-Engine" model:
- **Desktop (Creator Studio):** Full-featured workspace with WebContainer, Canvas editing, and AI synthesis
- **Mobile (Learner Companion):** Consumption-focused with Card Feed, RAG Chat, and Audio Overviews

#### Vietnamese Market Context

**EdTech Market:**
- **Historical Growth:** 25% CAGR (2022-2024) driven by COVID-19 digital acceleration
- **Projected Growth:** 12-13% CAGR through 2032 (conservative stabilization)
- **Government Support:** 15.5% state budget allocated to education
- **Mobile Penetration:** 126% (127M connections for 100M population)

**Mobile Behavior Insights:**
- **Daily Usage:** 7.3 hours/day on mobile (highest in Southeast Asia)
- **Usage Pattern:** 66% use mobile primarily for entertainment/social media
- **Study Behavior:** Serious knowledge work still primarily happens on desktop/laptop
- **Insight:** Mobile dominates *consumption*, desktop dominates *creation*

### Target Users

**Primary Personas:**

| Persona | Archetype | Context | Primary Need | Surface |
|---------|-----------|---------|--------------|---------|
| **Minh** | High School Student | Mobile-first, exam prep | Connect concepts across textbooks quickly | Mobile |
| **Thảo** | University Student | Research-heavy, thesis work | Synthesize 50+ papers into coherent thesis | Desktop |
| **Cô Lan** | High School Teacher | Content creator, curriculum | Turn lesson plans into engaging quizzes | Desktop |
| **Dev** | Developer | Power user, code analysis | Understand codebases through AI synthesis | Desktop |

**User Segments by Surface:**
- **Desktop (Creator Studio):** Teachers, researchers, developers synthesizing knowledge (power users)
- **Mobile (Learner Companion):** Students consuming flashcards, quizzes, audio summaries (mass market)
- **Progressive Degradation:** Mobile users see "Demo Mode" for WebContainer-dependent features

### Key Design Challenges

1. **Two-Engine Mental Model Gap**
   - Users must understand Desktop/Mobile capability split without feeling "limited"
   - Risk: Frustration when Canvas editing disabled on mobile
   - Solution: Clear mode switching with educational messaging ("Heavy lifting on desktop, knowledge in your pocket")

2. **Progressive Disclosure of Complexity**
   - The system is powerful (AI synthesis, vector search, graph visualization)
   - Risk: Overwhelming new users with options
   - Solution: "Magic trick" onboarding, feature unlocking over time

3. **Citation Trust & Grounding**
   - Vietnamese students need to trust AI-generated study materials
   - Cultural context: Teacher authority is high; AI content needs validation pathway
   - Solution: Always-visible [1][2] footnotes with instant preview + "Teacher Verified" badges

4. **Mobile Consumption vs Desktop Creation**
   - Vietnamese students use mobile 7.3 hrs/day, but WebContainer requires desktop
   - 66% use mobile for entertainment, not learning — behavior change required
   - Solution: Position "Demo Mode" as native, not limited; Audio Overview as hero feature for mobile engagement

### Design Opportunities

1. **Audio Overview as Viral Hook**
   - 30-second AI-generated summaries in Vietnamese
   - Aligns with NotebookLM viral success
   - Background listening mode for commute/multitasking
   - Strong mobile engagement driver

2. **Structured Review Sessions**
   - Vertical card feed for learning content (not pure gamification)
   - Spaced repetition with "Know" / "Review Later" actions
   - Progress tracking with study streaks
   - Positioned as *learning tool* not *entertainment competitor*

3. **Teacher-to-Student Knowledge Packs**
   - `.alpha` pack distribution enables content marketplace
   - Vietnamese exam prep culture strongly supports this model
   - Teachers create, verify, and distribute; students consume
   - Potential revenue path: Premium verified content

4. **Offline-First for Rural Vietnam**
   - Urban areas have 100% mobile broadband; rural areas lag significantly
   - IndexedDB/OPFS storage enables full offline capability
   - Strong differentiator: "Learn anywhere, even without internet"
   - Critical for exam prep in areas with unreliable connectivity

### Cultural Context Considerations

**Vietnamese Education System:**
- High-stakes examination culture (high school graduation, university entrance)
- Teacher authority is respected; AI content should support, not replace
- Strong parental involvement in education
- Group study sessions are common

**Language Considerations:**
- Primary market: Vietnamese-language educational content
- English proficiency varies widely by urban/rural, age
- Interface and AI responses should default to Vietnamese
- Code/technical content may use English terms (acceptable)

**Trust Factors:**
- Students may initially trust teacher-vetted materials over AI-generated
- Citation visibility is critical for building trust
- "Verified by Teacher" badges can bridge AI trust gap

## 2. Core User Experience

### Phase 1: Developer Workflow (Stabilization Focus)

**Core Loop:** Open Project → Restore State → Edit → Agent Assist
- **Open:** FSA grants access to local project folder (User ownership)
- **Edit:** Monaco editor with WebContainer preview (IDE parity)
- **Agent Assist:** Tool-augmented LLM reads/writes code with approval
- **Save:** Atomic writes to Local FS (<500ms latency)

**Critical Success Moments (Phase 1):**
1. **WebContainer Boot:** Desktop loads project environment in < 5 seconds.
2. **FSA Permission Grant:** User successfully re-grants permission on session restore (>90% success).
3. **State Restoration:** User returns after 3 days to find exact tab, scroll position, and history restored.
4. **Agent Execution:** User approves agent code change → File updates instantly → Preview reflects change.

**Experience Principles (Phase 1):**
1. **Trust Through Transparency:** User specifically approves every file mutation.
2. **Local-First Control:** Files live on user's disk; we just borrow them.
3. **Zero Data Loss:** Atomic writes and continuous state persistence.

### Phase 2: Knowledge Synthesis (Future Vision)

**Core Loop:** Ground → Synthesize → Review
- **Ground:** Ingest PDF/URL → Orama vector index (Local)
- **Synthesize:** Generate Blocks (Summaries, Quizzes) with citations
- **Review:** Consume via Flashcard Feed or Audio Overview

**Critical Success Moments (Phase 2):**
1. **First Drop:** PDF ingestion to Summary with citations in < 60 seconds.
2. **Citation Verification:** Tap `[1]` → Source highlights exact sentence (Trust moment).
3. **Mobile Exam Prep:** Flashcard feed loads from IndexedDB in < 2 seconds.

**Experience Principles (Phase 2):**
1. **Source is Sacred:** Never modify original documents; synthesis layers on top.
2. **Blocks, Not Blobs:** AI produces persistent, structured artifacts (JSON), not ephemeral text.
3. **Grounding Always Visible:** 100% of AI assertions must have deep-linked citations.

### Platform Strategy & Architecture

**The Two-Engine Architecture:**

| Feature | Desktop (Creator Studio) | Mobile (Learner Companion) |
| :--- | :--- | :--- |
| **Role** | Creation, Synthesis, Coding | Consumption, Review, Query |
| **Input** | Mouse/Keyboard, Drag-and-Drop | Touch, Swipe, Voice |
| **Constraint** | WebContainer + Full FSA Access | **No WebContainer, No FSA Access** |
| **Storage** | Local FS (Real OS disk) + IndexedDB | IndexedDB Only + Service Worker Cache |
| **Sync** | **Local-First Single Device** | **Local-First Single Device** (Manual Export/Import) |

**FSA Permission Lifecycle (Desktop):**
1. **First Visit:** Explainer Modal → Native Folder Picker → Grant.
2. **Return Visit:** Dashboard "Resume" → One-click "Restore Access" → Ready.

**Progressive Degradation (Mobile):**
- **Detection:** Mobile Viewport + No `SharedArrayBuffer` support.
- **UX:** "Demo Mode" banner explains capabilities. Editor/Terminal disabled; Chat/Feed enabled.
- **Goal:** Users understand limitation without feeling blocked.

### Effortless Interactions

1.  **State Restoration:** Desktop reopens to exact tab, scroll, and chat history.
2.  **Optimistic UI:** File edits appear instantly in UI before disk confirmation.
3.  **Background Sync:** WebContainer ↔ Local FS sync happens invisibly in <500ms.
4.  **Drop-to-Knowledge (Phase 2):** PDF drag-and-drop triggers immediate ingestion pipeline.
5.  **One-Tap Citation (Phase 2):** Instant slide-over of source context when verifying AI claims.

## 3. Desired Emotional Response

### Primary Emotional Goals

**"Clear-Headed Mastery"**
The product should evoke the feeling of turning chaos (50 PDFs, scattered code) into order.
- **Core Feeling:** "I finally understand how this connects."
- **Context:** High-stakes exam prep or complex refactoring creates "Fog of War." We provide the map.

**Secondary Emotions:**
*   **Safe/Secure:** (Local-First) "My work is safe on my device. No one is peeking."
*   **Empowered (Constrained):** (Mobile) "I can review and learn on mobile, knowing I'll create heavily on desktop."
*   **Validated:** (Citations) "I can verify this answer. It's not hallucinating."

### Emotional Journey Mapping

| Stage | User Context | Desired Feeling | Design Tactic |
| :--- | :--- | :--- | :--- |
| **Permission Grant** | Browser asks for Disk Access | **Control & Safety** | Explainer modal emphasizes "Your Data, Your Disk." No "Cloud Sync" buzzwords. |
| **Wait Time (Ph 1)** | WebContainer Booting | **Informed Patience** | "Starting Node.js runtime..." (>5s target). Never a generic spinner. |
| **Wait Time (Ph 2)** | Parsing large PDF | **Productive Anticipation** | "Reading page 5... Extracting concepts..." |
| **Discovery (Mobile)** | Opening "Demo Mode" | **Pleasant Reality Check** | "📱 Learner Mode Active • 💻 Creator Mode on Desktop." Reframing limitation as "Review Mode." |
| **Verification** | Checking an AI claim | **Vindication** | One-tap citation slide-over. The "I Knew It" trust moment. |

### Micro-Emotions

**For Developers (Phase 1):**
*   **Avoid:** "Magic Anxiety" (Did the agent break my config?).
*   **Target:** "Surgical Precision" (Show the diff, ask for approval).
*   **Context:** Vietnam developers are pragmatic; "Show me code" > "Trust me".

**For Students (Phase 2):**
*   **Avoid:** "Imposter Syndrome" (This is too hard).
*   **Target:** "Supported Autonomy" (The AI assists, but I am learning).
*   **Context:** Teacher authority is high. AI is the "Tutor," not the "Professor."

### Cultural Design Implications (Vietnam)

**1. Trust & Authority:**
- **Context:** High respect for teachers; skepticism of unverified content.
- **Design:** "Verified by Teacher" badges on .alpha packs.
- **Tone:** Respectful but encouraging.

**2. Localized Warmth:**
- **Tone System:**
    - *Student Mode:* Friendly ("Bạn", "Chúng mình").
    - *Teacher Mode:* Respectful ("Thầy/Cô", "Em").
    - *Dev Mode:* Technical, concise.
- **Idioms:** "Học mọi lúc, làm khi cần" (Learn anytime, create when needed) for mobile banner.

**3. Privacy Realism:**
- **Context:** Government surveillance concerns + Decree 13 compliance.
- **Design:** "Offline/Local" indicator is prominent.
- **Color Coding:** Green (Local/Offline), Yellow (Syncing AI), Blue (Demo Mode).

### Emotional Design Principles

1.  **Respect the User's Intelligence:** Show the work. Show the diffs. Show the citations.
2.  **Confidence Calibration:** AI expresses uncertainty when appropriate ("I'm 80% sure, check source [1]").
3.  **No "Black Box" Magic:** Every output is traceable to a source or tool execution.
4.  **Calm, Not Cluttered:** Progressive disclosure matches the user's mastery level.


## 1. Project Understanding

### Executive Summary

#### Project Vision

**Project Alpha v2.0 - Knowledge Synthesis Station** reimagines how students, teachers, and knowledge workers transform raw information into actionable understanding. Built on a **local-first, privacy-respecting architecture**, it merges the structured creativity of Notion with the AI synthesis power of NotebookLM — all running entirely in the browser.

The platform operates on a "Two-Engine" model:
- **Desktop (Creator Studio):** Full-featured workspace with WebContainer, Canvas editing, and AI synthesis
- **Mobile (Learner Companion):** Consumption-focused with Card Feed, RAG Chat, and Audio Overviews

#### Vietnamese Market Context

**EdTech Market:**
- **Historical Growth:** 25% CAGR (2022-2024) driven by COVID-19 digital acceleration
- **Projected Growth:** 12-13% CAGR through 2032 (conservative stabilization)
- **Government Support:** 15.5% state budget allocated to education
- **Mobile Penetration:** 126% (127M connections for 100M population)

**Mobile Behavior Insights:**
- **Daily Usage:** 7.3 hours/day on mobile (highest in Southeast Asia)
- **Usage Pattern:** 66% use mobile primarily for entertainment/social media
- **Study Behavior:** Serious knowledge work still primarily happens on desktop/laptop
- **Insight:** Mobile dominates *consumption*, desktop dominates *creation*

### Target Users

**Primary Personas:**

| Persona | Archetype | Context | Primary Need | Surface |
|---------|-----------|---------|--------------|---------|
| **Minh** | High School Student | Mobile-first, exam prep | Connect concepts across textbooks quickly | Mobile |
| **Thảo** | University Student | Research-heavy, thesis work | Synthesize 50+ papers into coherent thesis | Desktop |
| **Cô Lan** | High School Teacher | Content creator, curriculum | Turn lesson plans into engaging quizzes | Desktop |
| **Dev** | Developer | Power user, code analysis | Understand codebases through AI synthesis | Desktop |

**User Segments by Surface:**
- **Desktop (Creator Studio):** Teachers, researchers, developers synthesizing knowledge (power users)
- **Mobile (Learner Companion):** Students consuming flashcards, quizzes, audio summaries (mass market)
- **Progressive Degradation:** Mobile users see "Demo Mode" for WebContainer-dependent features

### Key Design Challenges

1. **Two-Engine Mental Model Gap**
   - Users must understand Desktop/Mobile capability split without feeling "limited"
   - Risk: Frustration when Canvas editing disabled on mobile
   - Solution: Clear mode switching with educational messaging ("Heavy lifting on desktop, knowledge in your pocket")

2. **Progressive Disclosure of Complexity**
   - The system is powerful (AI synthesis, vector search, graph visualization)
   - Risk: Overwhelming new users with options
   - Solution: "Magic trick" onboarding, feature unlocking over time

3. **Citation Trust & Grounding**
   - Vietnamese students need to trust AI-generated study materials
   - Cultural context: Teacher authority is high; AI content needs validation pathway
   - Solution: Always-visible [1][2] footnotes with instant preview + "Teacher Verified" badges

4. **Mobile Consumption vs Desktop Creation**
   - Vietnamese students use mobile 7.3 hrs/day, but WebContainer requires desktop
   - 66% use mobile for entertainment, not learning — behavior change required
   - Solution: Position "Demo Mode" as native, not limited; Audio Overview as hero feature for mobile engagement

### Design Opportunities

1. **Audio Overview as Viral Hook**
   - 30-second AI-generated summaries in Vietnamese
   - Aligns with NotebookLM viral success
   - Background listening mode for commute/multitasking
   - Strong mobile engagement driver

2. **Structured Review Sessions**
   - Vertical card feed for learning content (not pure gamification)
   - Spaced repetition with "Know" / "Review Later" actions
   - Progress tracking with study streaks
   - Positioned as *learning tool* not *entertainment competitor*

3. **Teacher-to-Student Knowledge Packs**
   - `.alpha` pack distribution enables content marketplace
   - Vietnamese exam prep culture strongly supports this model
   - Teachers create, verify, and distribute; students consume
   - Potential revenue path: Premium verified content

4. **Offline-First for Rural Vietnam**
   - Urban areas have 100% mobile broadband; rural areas lag significantly
   - IndexedDB/OPFS storage enables full offline capability
   - Strong differentiator: "Learn anywhere, even without internet"
   - Critical for exam prep in areas with unreliable connectivity

### Cultural Context Considerations

**Vietnamese Education System:**
- High-stakes examination culture (high school graduation, university entrance)
- Teacher authority is respected; AI content should support, not replace
- Strong parental involvement in education
- Group study sessions are common

**Language Considerations:**
- Primary market: Vietnamese-language educational content
- English proficiency varies widely by urban/rural, age
- Interface and AI responses should default to Vietnamese
- Code/technical content may use English terms (acceptable)

**Trust Factors:**
- Students may initially trust teacher-vetted materials over AI-generated
- Citation visibility is critical for building trust
- "Verified by Teacher" badges can bridge AI trust gap

## 2. Core User Experience

### Phase 1: Developer Workflow (Stabilization Focus)

**Core Loop:** Open Project → Restore State → Edit → Agent Assist
- **Open:** FSA grants access to local project folder (User ownership)
- **Edit:** Monaco editor with WebContainer preview (IDE parity)
- **Agent Assist:** Tool-augmented LLM reads/writes code with approval
- **Save:** Atomic writes to Local FS (<500ms latency)

**Critical Success Moments (Phase 1):**
1. **WebContainer Boot:** Desktop loads project environment in < 5 seconds.
2. **FSA Permission Grant:** User successfully re-grants permission on session restore (>90% success).
3. **State Restoration:** User returns after 3 days to find exact tab, scroll position, and history restored.
4. **Agent Execution:** User approves agent code change → File updates instantly → Preview reflects change.

**Experience Principles (Phase 1):**
1. **Trust Through Transparency:** User specifically approves every file mutation.
2. **Local-First Control:** Files live on user's disk; we just borrow them.
3. **Zero Data Loss:** Atomic writes and continuous state persistence.

### Phase 2: Knowledge Synthesis (Future Vision)

**Core Loop:** Ground → Synthesize → Review
- **Ground:** Ingest PDF/URL → Orama vector index (Local)
- **Synthesize:** Generate Blocks (Summaries, Quizzes) with citations
- **Review:** Consume via Flashcard Feed or Audio Overview

**Critical Success Moments (Phase 2):**
1. **First Drop:** PDF ingestion to Summary with citations in < 60 seconds.
2. **Citation Verification:** Tap `[1]` → Source highlights exact sentence (Trust moment).
3. **Mobile Exam Prep:** Flashcard feed loads from IndexedDB in < 2 seconds.

**Experience Principles (Phase 2):**
1. **Source is Sacred:** Never modify original documents; synthesis layers on top.
2. **Blocks, Not Blobs:** AI produces persistent, structured artifacts (JSON), not ephemeral text.
3. **Grounding Always Visible:** 100% of AI assertions must have deep-linked citations.

### Platform Strategy & Architecture

**The Two-Engine Architecture:**

| Feature | Desktop (Creator Studio) | Mobile (Learner Companion) |
| :--- | :--- | :--- |
| **Role** | Creation, Synthesis, Coding | Consumption, Review, Query |
| **Input** | Mouse/Keyboard, Drag-and-Drop | Touch, Swipe, Voice |
| **Constraint** | WebContainer + Full FSA Access | **No WebContainer, No FSA Access** |
| **Storage** | Local FS (Real OS disk) + IndexedDB | IndexedDB Only + Service Worker Cache |
| **Sync** | **Local-First Single Device** | **Local-First Single Device** (Manual Export/Import) |

**FSA Permission Lifecycle (Desktop):**
1. **First Visit:** Explainer Modal → Native Folder Picker → Grant.
2. **Return Visit:** Dashboard "Resume" → One-click "Restore Access" → Ready.

**Progressive Degradation (Mobile):**
- **Detection:** Mobile Viewport + No `SharedArrayBuffer` support.
- **UX:** "Demo Mode" banner explains capabilities. Editor/Terminal disabled; Chat/Feed enabled.
- **Goal:** Users understand limitation without feeling blocked.

### Effortless Interactions

1.  **State Restoration:** Desktop reopens to exact tab, scroll, and chat history.
2.  **Optimistic UI:** File edits appear instantly in UI before disk confirmation.
3.  **Background Sync:** WebContainer ↔ Local FS sync happens invisibly in <500ms.
4.  **Drop-to-Knowledge (Phase 2):** PDF drag-and-drop triggers immediate ingestion pipeline.
5.  **One-Tap Citation (Phase 2):** Instant slide-over of source context when verifying AI claims.
