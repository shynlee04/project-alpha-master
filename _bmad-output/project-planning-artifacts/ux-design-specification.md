---
stepsCompleted: [1, 2, 3, 4, 5, 14]
inputDocuments:
  - _bmad-output/project-planning-artifacts/prd.md
  - _bmad-output/docs/2025-12-28/correct-course/ux-ui-knowledge-synthesis-proposal-2025-12-28.md
  - _bmad-output/cis/knowledge-synthesis-station-concept-2025-12-26.md
documentCounts:
  prd: 1
  proposal: 2
workflowType: 'ux-design'
workflowStatus: 'completed'
lastStep: 26
project_name: 'Project Alpha v2.0 - Knowledge Synthesis Station'
user_name: 'Admin'
date: '2025-12-29'
enhancement_date: '2025-12-29'
enhancement_phase: 'Phase 2 Integration'
sections_added: 12
total_lines: ~2500
status: 'Enhanced and Ready for Development Handoff'
---

# UX Design Specification - Project Alpha v2.0

**Knowledge Synthesis Station**

**Author:** Admin  
**Date:** 2025-12-28 (Enhanced: 2025-12-29)  
**Version:** 3.0 (Phase 2 Enhanced)  
**Status:** Approved for Implementation  

---

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
*   **Context:** Teacher authority is high. AI is "Tutor," not "Professor."

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

1.  **Respect User's Intelligence:** Show work. Show diffs. Show citations.
2.  **Confidence Calibration:** AI expresses uncertainty when appropriate ("I'm 80% sure, check source [1]").
3.  **No "Black Box" Magic:** Every output is traceable to a source or tool execution.
4.  **Calm, Not Cluttered:** Progressive disclosure matches user's mastery level.

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
| **Data Tables** | `TanStack Table` | For citation lists and source management. |

### Iconography
*   **Library:** Lucide React (Std).
*   **Style:** Stroke 1.5px (Light/Modern).
*   **Key Icons:**
    *   `Sparkles`: AI Synthesis.
    *   `Brain`: Knowledge Graph.
    *   `Database`: Local Storage/Sources.
    *   `WifiOff`: Offline Indicator.

## 5. Screen Specifications (Detailed)

### 5.1 Onboarding & Permissions (Critical)
**Context:** First launch on Desktop.
*   **Modal 1 (Value Prop):**
    *   Copy: "Project Alpha: Knowledge Synthesis Station."
    *   Sub: "Private. Local. Offline."
    *   Visual: Hero illustration of "Brain connecting to File Folder."
*   **Modal 2 (FSA Grant):**
    *   **Header:** "Connect Your Workspace"
    *   **Body:** "We need access to a folder on your disk to save your work. Your files never leave your device."
    *   **Action:** Button "Select Project Folder" (Primary).
    *   **Microcopy:** "Trusted by browser security sandbox."
    *   **Edge Case (Deny):** "Without file access, changes will be lost on refresh. [Try Again]"

### 5.2 Desktop Creator Studio (Main Interface)

**Layout:** 3-Column Resizable (Default: 20% | 50% | 30%)
*   **Left Panel (Explorer):**
    *   **Project Header:** Project Name + Connection Status Dot (Green=Saved).
    *   **File Tree:** Standard recursive tree.
        *   *Icons:* File type icons (ts, css, md).
        *   *Status:* "Unsaved" dot, "Syncing" spinner.
    *   **Source List (Phase 2):** Accordion below files called "Knowledge Sources".
*   **Center Panel (Workspace):**
    *   **Tabs:** Draggable file tabs.
    *   **Empty State:** "Select a file to edit or ask the Assistant to create one."
    *   **Editor:** Monaco instance.
    *   **Preview:** Iframe (WebContainer port 3000).
*   **Right Panel (Assistant):**
    *   **Thread List:** History of chats.
    *   **Chat View:** Message bubbles.
    *   **Agent Blocks:**
        *   "Searching..." (Spinner)
        *   "Reading file..." (File path)
        *   "Diff Proposal" (Monaco Diff Editor with Accept/Reject).

### 5.3 Mobile Companion (Demo Mode)

**Context:** User opens app on phone.
*   **Global Banner:**
    *   Type: Dismissible Warning (`Alert` component).
    *   Copy: "📱 Viewing Mode. Switch to Desktop to edit code."
*   **Tab 1: Home:**
    *   Recent Projects List.
    *   Quick Actions: "Review Flashcards", "Ask Question".
*   **Tab 2: Chat:**
    *   Full screen chat interface.
    *   Input includes "Voice" button (Phase 2).
*   **Tab 3: Settings:**
    *   Theme Toggle.
    *   Language Toggle (VN/EN).
    *   Cache Manager ("Clear Offline Data").

## 6. Interaction Patterns & User Flows

### 6.1 FSA Permission Restoration
**Trigger:** User reloads page or returns after session close.
1.  **System Check:** `queryPermission({ mode: 'readwrite' })`.
2.  **Condition:**
    *   If `granted`: Silent restore. Green dot appears.
    *   If `prompt`: Show "Resume Session" banner.
    *   If `denied`: Show Blocking Modal.
3.  **User Action:** Clicks "Resume". Browser native prompt appears.
4.  **Result:** Success toast "Workspace Connected".

### 6.2 Agent-Assisted Edit (The Trust Loop)
1.  **User:** Asks "Add a button to header."
2.  **Agent:** "Thinking... Reading Header.tsx..."
3.  **Agent:** "I've drafted a change." -> **Shows Diff Block**.
    *   *Left:* Original Code.
    *   *Right:* New Code (Green highlights).
4.  **User:** Reviews. Clicks "Apply".
5.  **System:**
    *   Writes to Virtual FS (WebContainer).
    *   Writes to Local FS (FSA).
    *   Updates Preview.
6.  **Agent:** "Done. Preview updated."

## 7. Component Library Specifications

### 7.1 Monaco Editor Wrapper
*   **Props:** `path`, `content`, `language`, `readOnly`, `onSave`.
*   **Mobile Behavior:** If `isMobile=true`, force `readOnly=true` and `minimap={enabled: false}`.
*   **Theme:** Syncs with `next-themes` (VsDark / VsLight).

### 7.2 Agent Diff Block
*   **Component:** `DiffEditor` (Monaco).
*   **Height:** Auto-expanding or Fixed 400px with scroll.
*   **Actions:**
    *   `Accept`: Primary (Blue). Commits change.
    *   `Reject`: Outline (Red). Discards diff.
    *   `Edit`: Secondary. Opens diff in main editor for manual tweak.

## 8. Content & Microcopy Guidelines (Localization)

**Strategy:** Keys in `src/i18n/{lang}.json`. Default: `vi` (Vietnamese).

### 8.1 Error Message Matrix

| Error Key | English (en) | Vietnamese (vi) | Tone |
| :--- | :--- | :--- | :--- |
| `ERR_FSA_DENIED` | "Access denied. We need permission to save your files." | "Từ chối truy cập. Ứng dụng cần quyền để lưu file của bạn." | Urgent |
| `ERR_WC_BOOT` | "Environment failed to start. Please reload." | "Không thể khởi động môi trường. Vui lòng tải lại trang." | Apologetic |
| `ERR_SYNC_CONFLICT` | "File changed on disk. Keep local or reload?" | "File đã thay đổi. Giữ bản hiện tại hay tải lại?" | Warning |
| `MSG_MOBILE_LIMIT` | "Editing disabled on mobile." | "Chế độ xem trên di động. Dùng máy tính để chỉnh sửa." | Informational |
| `MSG_SAVING` | "Saving..." | "Đang lưu..." | Neutral |
| `MSG_SAVED` | "Saved locally." | "Đã lưu vào máy." | Reassuring |

## 9. Mobile Responsiveness Specifications

### 9.1 Breakpoints
*   **Compact (<640px):** Mobile Layout.
    *   *Sidebar:* Hidden (Drawer).
    *   *Panels:* Stacked (Tabs).
    *   *Editor:* Read-only.
*   **Medium (640-1024px):** Tablet.
    *   *Sidebar:* Icons only (Rail).
    *   *Panels:* 2-Col (Editor + Chat).
*   **Large (>1024px):** Desktop.
    *   *Sidebar:* Expanded.
    *   *Panels:* 3-Col Resizable.

### 9.2 Touch Targets
*   All buttons: Min 44x44px padding.
*   Panel Resizers: Increased grab area (10px invisible hit box).
*   Tree Items: 40px height with full-row click target.

## 10. Accessibility Requirements

### 10.1 Keyboard Navigation
*   **Focus Trap:** Modals must trap focus.
*   **Skip Links:** "Skip to Editor", "Skip to Chat" at top of DOM.
*   **Shortcuts:**
    *   `Cmd+S`: Save (Manual trigger).
    *   `Cmd+B`: Toggle Sidebar.
    *   `Cmd+J`: Toggle Terminal/bottom panel.

### 10.2 ARIA Specifications
*   **Icons:** `aria-label` required for all icon-only buttons.
*   **Status Dots:** `aria-live="polite"` for connection status changes (e.g., "Connection Lost").
*   **Tabs:** Proper `role="tablist"` / `role="tabpanel"` structure (Radix handles this).

## 11. Error Handling & Edge Cases

### 11.1 WebContainer Boot Failure
*   **Scenario:** Implementation fails to load (browser unsupported or network block).
*   **UI:** Full screen error state.
*   **Action:** "Download Logs" + "Reload" button.
*   **Fallback:** None (Core dependency).

### 11.2 Offline During Sync
*   **Scenario:** Agent is generating code, network cuts.
*   **UI:** Toast "Connection lost. Agent paused."
*   **State:** Pause generic spinner. Show "Retry" button when online event fires.

### 11.3 IndexedDB Quota Exceeded
*   **Scenario:** Too many PDFs/Vectors.
*   **UI:** Warning Banner "Storage Full".
*   **Action:** Prompt to clear cache or delete old projects.

## 12. Performance Requirements

### 12.1 Latency Targets

| Interaction | Target | measurement |
| :--- | :--- | :--- |
| **App Load (Cold)** | < 3s | TTI (Time to Interactive) |
| **WebContainer Boot** | < 5s | `boot()` promise resolution |
| **File Save** | < 100ms | Optimistic UI update |
| **Agent Response** | < 2s | Time to first token |
| **Mobile Scroll** | 60fps | Flashcard feed |

### 12.2 Optimization Strategy
*   **Code Splitting:** Lazy load `monaco-editor` and `@webcontainer/api`.
*   **Vector Search:** Run Orama in Web Worker to prevent UI block.
*   **Virtualization:** Use `Virtuoso` for long file trees and chat logs.

## 13. Animation & Transition Specifications

*   **Motion System:** "Snappy & Professional".
    *   *Duration:* 200ms default.
    *   *Curve:* `ease-out`.
    *   *Transitions:*
        *   **Tab Switch:** Instant (0ms). No fade.
        *   **Panel Resize:** 0ms (Direct manipulation).
        *   **Modal Open:** Scale In (95% -> 100%) + Fade In.
    *   *Reduced Motion:*
        *   If `prefers-reduced-motion: reduce`: Disable modal scale, use simple fade.

## 14. Implementation Checklist (Phase 1)
*   [ ] **Theme Engine:** Implement `next-themes` with System/Dark/Light support.
*   [ ] **Layout Shell:** `ResizablePanelGroup` for Desktop, `Drawer` for Mobile.
*   [ ] **FSA Guard:** `useFileSystem` hook that handles permission state logic.
*   [ ] **Mobile Guard:** `isMobile` check to disable WebContainer/Monaco write mode.
*   [ ] **Agent UI:** `ChatInterface` component with "Tool Execution" blocks (not just text).
*   [ ] **i18n Setup:** `react-i18next` with `vi`/`en` JSONs.

---

## 15. Phase 2: Knowledge Synthesis Interface (KSI)

### 15.1 Knowledge Synthesis Dashboard

**Layout Strategy:** 4-Column Resizable (Desktop) / Tabbed (Mobile)
*   **Column 1 - Source Library (20%):**
    *   **Header:** "Knowledge Sources" with Filter (All, PDFs, URLs, .alpha packs)
    *   **Source Cards:** Mini previews with:
        *   Thumbnail (PDF first page, website favicon for URLs)
        *   Title + Metadata (page count, word count, ingestion date)
        *   Status indicator (Indexed, Processing, Failed)
        *   Quick Actions: "Synthesize", "Delete", "Export .alpha"
    *   **Drag & Drop Zone:** Dotted border area for PDF/URL drop
        *   Animation: Pulse effect when file hovers
        *   Feedback: "Drop to ingest • Local processing only"

*   **Column 2 - Knowledge Canvas (40%):**
    *   **Infinite Canvas:** Pan/zoom enabled (like Miro, Figma)
    *   **Block Types:**
        *   **Source Block:** Visual representation of ingested document
        *   **Summary Block:** AI-generated summary with expand/collapse
        *   **Quiz Block:** Question set with interactive reveal
        *   **Flashcard Block:** Card stack with flip animation
        *   **Connection Lines:** Curved bezier curves between related blocks
    *   **Canvas Controls:**
        *   Zoom: Mouse wheel + buttons (+/-, 100%, 200%, 400%)
        *   Pan: Middle-click drag or Space+drag
        *   Auto-arrange: Button to organize blocks by topic
        *   Export: PNG/SVG export of canvas

*   **Column 3 - Synthesis Panel (25%):**
    *   **Tabs:** "Summaries", "Quizzes", "Flashcards", "Audio"
    *   **Summary View:**
        *   Hierarchical outline (Level 1 → Level 2 → Level 3)
        *   Each section has citation badges [1][2][3]
        *   "Expand All" / "Collapse All" buttons
        *   Copy to clipboard button
    *   **Quiz View:**
        *   Question cards with multiple-choice options
        *   Immediate feedback (Correct/Incorrect with explanation)
        *   Progress bar (X of Y questions answered)
        *   "Retry Incorrect" button
    *   **Flashcard View:**
        *   Card stack with swipe gestures (mobile)
        *   Front/back flip animation (200ms ease-out)
        *   "Know" / "Review Later" buttons
        *   Spaced repetition indicator (Due: 2 days, Due: Now)
    *   **Audio View:**
        *   Waveform visualization
        *   Play/Pause controls
        *   Speed control (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
        *   Background play mode (minimizes to floating player)

*   **Column 4 - Agent Chat (15%):**
    *   **Multi-Agent Support:**
        *   Agent selector dropdown (Researcher, Synthesizer, Quiz Generator)
        *   Active agent indicator with status (Idle, Thinking, Streaming)
        *   Agent capability badges (e.g., "RAG", "Code", "Quiz")
    *   **Context Panel:**
        *   Selected sources from canvas
        *   Active block context
        *   "Add to Context" button
    *   **Chat Interface:**
        *   Message bubbles with citations
        *   Tool execution blocks (similar to Phase 1)
        *   "Generate Quiz" / "Generate Flashcards" quick actions
        *   Voice input button (mobile)

### 15.2 Citation Verification System

**One-Tap Citation Workflow:**
1.  **User reads AI-generated summary** with inline citations [1][2][3]
2.  **Taps citation badge** → Slide-over panel appears from right
3.  **Slide-over Content:**
    *   **Source Header:** Document title + page number
    *   **Highlighted Text:** Exact sentence/paragraph with yellow highlight
    *   **Surrounding Context:** 3 sentences before and after
    *   **Navigation:**
        *   "Open Source" button (opens PDF/page)
        *   "Copy Citation" button (MLA/APA format)
        *   "Verify" button (marks as verified in database)
    *   **Confidence Score:** AI's confidence level (e.g., "95% match")
4.  **User closes slide-over** → Citation badge changes color (Blue → Green = Verified)

**Visual Design:**
*   **Citation Badge:** Small pill shape, blue (#2563EB), superscript numbering
*   **Verified Badge:** Green (#10B981) with checkmark icon
*   **Slide-over Animation:** 300ms slide-in from right, backdrop blur
*   **Highlight Color:** Yellow (#FEF08A) with 40% opacity

### 15.3 Knowledge Pack Distribution UI

**.alpha Pack Export Dialog:**
*   **Modal Header:** "Export Knowledge Pack"
*   **Pack Configuration:**
    *   **Pack Name:** Text input (required)
    *   **Description:** Textarea (optional)
    *   **Include Sources:** Checkbox (PDFs, URLs, or references only)
    *   **Include Synthesis:** Checkbox (Summaries, Quizzes, Flashcards)
    *   **Teacher Verification:** Toggle (if enabled, requires teacher signature)
*   **Preview Section:**
    *   File size estimate
    *   Content breakdown (X sources, Y summaries, Z quizzes)
    *   Compatibility note (requires Project Alpha v2.0+)
*   **Actions:**
    *   "Export .alpha" (Primary)
    *   "Share Link" (Secondary - for future cloud sync)
    *   "Cancel" (Outline)

**.alpha Pack Import Dialog:**
*   **Modal Header:** "Import Knowledge Pack"
*   **Drop Zone:** Drag .alpha file here or click to browse
*   **Validation:**
    *   Pack version check
    *   Content preview (what will be imported)
    *   Warning for duplicates ("2 sources already exist")
*   **Actions:**
    *   "Import" (Primary)
    *   "Merge" (Secondary - merge with existing)
    *   "Cancel" (Outline)

**Teacher Verification Badge:**
*   **Visual:** Gold badge with shield icon
*   **Tooltip:** "Verified by [Teacher Name] • [Institution]"
*   **Click Action:** Opens verification certificate (digital signature)

### 15.4 Audio Overview Interface

**Audio Player Component:**
*   **Layout:** Floating mini-player (bottom-right) when background playing
*   **Controls:**
    *   Play/Pause button (center)
    *   Rewind 10s / Forward 10s buttons
    *   Speed selector (dropdown)
    *   Volume slider
    *   Close button (minimizes to tray)
*   **Waveform Visualization:**
    *   Canvas-based waveform (real-time)
    *   Current position indicator (vertical line)
    *   Clickable: Jump to position
*   **Transcript Sync:**
    *   "Show Transcript" toggle
    *   Transcript highlights current sentence
    *   Click transcript → Jump to audio position
*   **Background Mode:**
    *   Minimizes to browser notification badge
    *   Controls via keyboard (Space: play/pause, Arrow keys: seek)
    *   "Focus Mode" - hides all UI except player

**Audio Generation Workflow:**
1.  **User selects source(s)** on canvas
2.  **Clicks "Generate Audio Overview"** → Progress modal appears
3.  **Progress Modal:**
    *   "Analyzing content..." (10%)
    *   "Generating script..." (30%)
    *   "Synthesizing speech..." (60%)
    *   "Encoding audio..." (90%)
    *   "Complete!" (100%)
4.  **Audio Player appears** with auto-play enabled

## 16. Canvas-Based Knowledge Organization

### 16.1 Block System Architecture

**Block Types & Interactions:**

| Block Type | Visual | Interaction | Content |
|-----------|---------|-------------|----------|
| **Source** | Document icon + title | Drag to reposition, Click to open | PDF/URL metadata |
| **Summary** | Text block with header | Expand/collapse, Edit content | AI-generated summary |
| **Quiz** | Question mark icon | Click to take quiz | Question set |
| **Flashcard** | Card stack icon | Swipe to flip (mobile), Click to flip (desktop) | Front/back content |
| **Connection** | Curved line | Drag endpoints to reconnect | Relationship between blocks |

**Block Properties:**
*   **Position:** X, Y coordinates on canvas
*   **Size:** Auto-expanding based on content
*   **Color:** Type-based (Source: Blue, Summary: Green, Quiz: Orange, Flashcard: Purple)
*   **Z-Index:** Drag to front (bring to top)
*   **Locked:** Toggle to prevent accidental moves

### 16.2 Canvas Interaction Patterns

**Drag & Drop:**
*   **Block Drag:** Click and hold block → Move cursor → Release
*   **Connection Drag:** Click connection endpoint → Drag to target block → Release
*   **Multi-select:** Shift+click or box selection (draw rectangle)
*   **Group Move:** Drag selected blocks together

**Zoom & Pan:**
*   **Zoom:** Mouse wheel (Ctrl+wheel on Mac)
*   **Pan:** Middle-click drag or Space+drag
*   **Fit to Screen:** Double-click canvas background
*   **Zoom to Selection:** Double-click selected block

**Canvas Controls (Floating Toolbar):**
*   **Zoom Controls:** [-] [100%] [+]
*   **Auto-arrange:** Button to organize blocks by topic
*   **Grid Toggle:** Show/hide alignment grid
*   **Export:** PNG/SVG export button
*   **Reset View:** Return to default zoom/pan

### 16.3 Connection System

**Connection Types:**
*   **Source → Summary:** "Summarized from"
*   **Summary → Quiz:** "Quiz based on"
*   **Summary → Flashcard:** "Flashcards from"
*   **Block → Block:** "Related to" (user-created)

**Connection Visuals:**
*   **Style:** Curved bezier curve (cubic-bezier)
*   **Color:** Gray (#6B7280) with arrowhead at end
*   **Thickness:** 2px (standard), 3px (strong relationship)
*   **Animation:** Pulse effect when hovering over connected block

**Connection Creation:**
1.  **Right-click block** → Context menu → "Add Connection"
2.  **Drag from block edge** → Release on target block
3.  **AI Suggestion:** "Suggest connections" button (analyzes content)

## 17. Multi-Agent Workflow UI

### 17.1 Agent Selector Interface

**Agent Cards:**
*   **Layout:** Horizontal scrollable list of agent cards
*   **Card Content:**
    *   **Agent Icon:** Unique icon per agent type
    *   **Agent Name:** e.g., "Researcher", "Synthesizer", "Quiz Generator"
    *   **Agent Description:** One-line capability summary
    *   **Status Indicator:** Idle (Gray), Thinking (Yellow), Streaming (Blue)
    *   **Capability Badges:** Small pills (RAG, Code, Quiz, Flashcards)
*   **Selection:** Click card to activate (highlight border)
*   **Multi-Agent Mode:** Toggle to enable parallel agent execution

**Agent Capabilities Matrix:**

| Agent | RAG | Code | Quiz | Flashcards | Audio |
|--------|------|------|-------|------------|--------|
| **Researcher** | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Synthesizer** | ✓ | ✗ | ✓ | ✓ | ✓ |
| **Quiz Generator** | ✓ | ✗ | ✓ | ✗ | ✗ |
| **Flashcard Creator** | ✓ | ✗ | ✗ | ✓ | ✗ |
| **Code Assistant** | ✗ | ✓ | ✗ | ✗ | ✗ |

### 17.2 Agent Collaboration UI

**Agent Handoff Visuals:**
*   **Handoff Message:** "Researcher found 5 sources. Passing to Synthesizer..."
*   **Animation:** Progress bar with agent icons
*   **Agent Status Panel:** Shows all active agents and their tasks

**Parallel Execution (Multi-Agent Mode):**
*   **Split View:** Chat panel divided into agent-specific threads
*   **Thread Headers:** Agent name + status
*   **Merge Results:** Button to combine outputs from multiple agents
*   **Conflict Resolution:** UI to resolve conflicting outputs

### 17.3 Agent Context Management

**Context Panel:**
*   **Selected Sources:** List of sources from canvas
*   **Active Block:** Current block being analyzed
*   **Conversation History:** Previous agent outputs
*   **"Add to Context" Button:** Manual context injection

**Context Visuals:**
*   **Source Item:** Document icon + title + "×" to remove
*   **Block Item:** Block type icon + title
*   **History Item:** Timestamp + agent name + summary
*   **Context Size Indicator:** "3 sources, 2 blocks, 5 messages"

## 18. RAG & Citation Interface Components

### 18.1 Source Ingestion UI

**PDF Ingestion Flow:**
1.  **User drags PDF** to drop zone
2.  **Progress Modal appears:**
    *   "Reading PDF..." (10%)
    *   "Extracting text..." (30%)
    *   "Chunking content..." (50%)
    *   "Generating embeddings..." (70%)
    *   "Indexing..." (90%)
    *   "Complete!" (100%)
3.  **Source Card appears** in Source Library with status "Indexed"

**URL Ingestion Flow:**
1.  **User enters URL** in input field
2.  **"Fetch Content" button** → Progress modal
3.  **Validation:** Check if URL is accessible
4.  **Ingestion:** Same as PDF flow
5.  **Source Card appears** with favicon thumbnail

**Ingestion Error Handling:**
*   **PDF Password Protected:** "This PDF is password-protected. Please remove password and try again."
*   **URL Inaccessible:** "Could not fetch URL. Check if the site is accessible."
*   **File Too Large:** "PDF exceeds 50MB limit. Please split into smaller files."
*   **Storage Full:** "IndexedDB quota exceeded. Clear old sources to continue."

### 18.2 Vector Search Interface

**Search Input:**
*   **Field:** Large text input with placeholder "Search your knowledge..."
*   **Autocomplete:** Suggest queries based on indexed content
*   **Filters:** Source type (All, PDFs, URLs), Date range, Relevance threshold

**Search Results:**
*   **Layout:** List of result cards
*   **Card Content:**
    *   **Relevance Score:** Percentage (e.g., "94% match")
    *   **Source:** Document title + page number
    *   **Snippet:** Highlighted text matching query
    *   **Citations:** Link to source
    *   **Actions:** "Add to Canvas", "View Source", "Copy"
*   **Sort Options:** Relevance, Date, Source

**Search Visuals:**
*   **Loading:** Skeleton loader with 3 cards
*   **Empty State:** "No results found. Try different keywords."
*   **Error State:** "Search failed. Please try again."

### 18.3 Citation Management

**Citation List View:**
*   **Layout:** Table with sortable columns
*   **Columns:** Citation ID, Source, Page, Content, Status, Actions
*   **Statuses:** Pending, Verified, Rejected
*   **Actions:** Verify, Edit, Delete

**Citation Detail View:**
*   **Modal with full citation details**
*   **Source Preview:** PDF page or website screenshot
*   **Verification Actions:**
    *   "Mark as Verified" (Primary)
    *   "Request Correction" (Secondary - sends to AI)
    *   "Flag as Hallucination" (Danger - removes from synthesis)

## 19. Study Artifact Interfaces

### 19.1 Flashcard System

**Flashcard Deck View:**
*   **Layout:** Card stack (top card visible)
*   **Card Content:**
    *   **Front:** Question or concept
    *   **Back:** Answer or explanation
    *   **Citation:** [1] badge linking to source
*   **Controls:**
    *   **Flip:** Click card or swipe up (mobile)
    *   **Know:** Green button (marks as mastered)
    *   **Review Later:** Orange button (schedules for review)
    *   **Previous/Next:** Navigate deck
*   **Progress:** "Card 5 of 20 • 3 mastered today"

**Spaced Repetition UI:**
*   **Schedule Indicator:** "Due: 2 days", "Due: Now", "Due: Overdue"
*   **Review Queue:** List of cards due for review
*   **Statistics:** "Mastered: 45%, Reviewing: 30%, New: 25%"
*   **Streak Counter:** "🔥 7 day streak"

**Flashcard Editor:**
*   **Create/Edit Modal:**
    *   **Front:** Text input
    *   **Back:** Text input
    *   **Source:** Dropdown to select source
    *   **Tags:** Add tags for organization
    *   **Preview:** Live preview of card

### 19.2 Quiz Interface

**Quiz List View:**
*   **Layout:** Grid of quiz cards
*   **Card Content:**
    *   **Quiz Title:** e.g., "Chapter 5 Quiz"
    *   **Question Count:** "10 questions"
    *   **Difficulty:** Easy/Medium/Hard badge
    *   **Time Limit:** Optional (e.g., "15 minutes")
    *   **Status:** Not Started, In Progress, Completed
*   **Actions:** "Start Quiz", "Review Results"

**Quiz Taking View:**
*   **Layout:** One question per screen
*   **Question Display:**
    *   Question text
    *   Citation badges (if applicable)
    *   Timer (if time limit)
*   **Answer Options:**
    *   Multiple choice: Radio buttons with options A, B, C, D
    *   True/False: Toggle switch
    *   Short answer: Text input
*   **Navigation:** "Previous", "Next", "Submit"
*   **Progress Bar:** Visual progress indicator

**Quiz Results View:**
*   **Score Display:** Large percentage (e.g., "80%")
*   **Breakdown:**
    *   Correct: X questions
    *   Incorrect: Y questions
    *   Unanswered: Z questions
*   **Detailed Review:**
    *   List of questions with user answers
    *   Correct answers highlighted
    *   Explanations with citations
*   **Actions:** "Retry Incorrect", "Return to Dashboard"

### 19.3 Study Session Interface

**Study Session Setup:**
*   **Modal with options:**
    *   **Study Mode:** Flashcards, Quizzes, Mixed
    *   **Duration:** Time limit or unlimited
    *   **Topic Filter:** Select specific topics/sources
    *   **Difficulty:** Easy, Medium, Hard, All
*   **Start Button:** Begins study session

**Study Session Progress:**
*   **Timer:** Elapsed time display
*   **Progress Bar:** Visual progress through session
*   **Score:** Running score (for quizzes)
*   **Pause/Resume:** Controls to pause session

**Study Session Summary:**
*   **Results Card:**
    *   Cards reviewed: X
    *   Quizzes completed: Y
    *   Score: Z%
    *   Time spent: T minutes
*   **Streak Update:** "🔥 Streak increased to 8 days!"
*   **Actions:** "Continue Studying", "View Detailed Report", "Exit"

## 20. Advanced Interaction Patterns for Phase 2

### 20.1 Gesture Support (Mobile)

**Canvas Gestures:**
*   **Pan:** One-finger drag
*   **Zoom:** Two-finger pinch
*   **Block Drag:** Long-press + drag
*   **Block Select:** Tap to select, Shift+tap for multi-select
*   **Connection Create:** Long-press block → Drag to target

**Flashcard Gestures:**
*   **Flip:** Swipe up/down
*   **Next:** Swipe left
*   **Previous:** Swipe right
*   **Know:** Double-tap
*   **Review Later:** Long-press

**Quiz Gestures:**
*   **Next Question:** Swipe left
*   **Previous Question:** Swipe right
*   **Submit:** Swipe up

### 20.2 Keyboard Shortcuts (Desktop)

**Canvas Shortcuts:**
*   `Space + Drag`: Pan canvas
*   `Ctrl + Wheel`: Zoom in/out
*   `Ctrl + A`: Select all blocks
*   `Ctrl + D`: Duplicate selected block
*   `Delete`: Remove selected blocks
*   `Ctrl + Z`: Undo
*   `Ctrl + Y`: Redo
*   `Ctrl + F`: Search canvas
*   `Ctrl + G`: Grid toggle
*   `Ctrl + E`: Export canvas

**Study Shortcuts:**
*   `Space`: Flip flashcard / Next question
*   `1`, `2`, `3`, `4`: Select answer option
*   `Enter`: Submit answer
*   `K`: Mark as "Know"
*   `R`: Mark as "Review Later"
*   `Esc`: Exit study session

**Audio Shortcuts:**
*   `Space`: Play/pause
*   `Left Arrow`: Rewind 10s
*   `Right Arrow`: Forward 10s
*   `Up Arrow`: Increase speed
*   `Down Arrow`: Decrease speed
*   `M`: Mute/unmute

### 20.3 Progressive Disclosure

**Feature Unlocking:**
*   **Level 1 (New User):** Basic ingestion, simple summaries
*   **Level 2 (5+ Sources):** Canvas, connections, quizzes
*   **Level 3 (10+ Sources):** Flashcards, spaced repetition
*   **Level 4 (20+ Sources):** Audio overviews, knowledge packs
*   **Level 5 (50+ Sources):** Multi-agent mode, advanced analytics

**Unlock Notification:**
*   **Toast:** "🎉 New feature unlocked: Canvas!"
*   **Modal:** "You've unlocked Knowledge Canvas. Organize your sources visually and connect concepts."
*   **Tutorial:** Interactive walkthrough of new feature

### 20.4 Offline-First UX

**Offline Indicator:**
*   **Status Bar:** Green dot = Online, Gray dot = Offline
*   **Banner:** "You're offline. Some features may be limited."
*   **Functionality Matrix:**
    *   **Online:** Full features (ingestion, RAG, agent chat)
    *   **Offline:** Read-only (view cached content, flashcards, quizzes)

**Offline Sync:**
*   **Sync Queue:** List of pending operations
*   **Sync Button:** "Sync Now" (appears when online)
*   **Conflict Resolution:** UI to resolve sync conflicts
*   **Progress:** "Syncing 3 of 5 items..."

## 21. Cross-Platform Consistency

### 21.1 Desktop vs Mobile Feature Matrix

| Feature | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| **Canvas Editing** | Full | View-only | Mobile shows read-only canvas |
| **Source Ingestion** | Drag & Drop | File picker | Mobile uses native file picker |
| **Agent Chat** | Full | Full | Same interface, responsive layout |
| **Flashcards** | Click to flip | Swipe to flip | Gesture-based on mobile |
| **Audio Player** | Floating + Mini | Full-screen + Mini | Mobile prioritizes full-screen |
| **Citation Verification** | Slide-over | Modal | Mobile uses modal instead of slide-over |
| **Multi-Agent** | Split view | Sequential | Mobile shows agents one at a time |

### 21.2 Responsive Breakpoints (Enhanced)

**Breakpoint Definitions:**
*   **Mobile (<640px):** Single column, stacked tabs, gesture navigation
*   **Tablet (640-1024px):** Two columns, icon sidebar, touch + keyboard
*   **Desktop (1024-1440px):** Three columns, full sidebar, mouse + keyboard
*   **Large Desktop (>1440px):** Four columns, expanded sidebar, all features

**Layout Adaptations:**
*   **Canvas:** Full canvas (Desktop) / Scrollable viewport (Mobile)
*   **Panels:** Resizable (Desktop) / Stacked tabs (Mobile)
*   **Modals:** Centered (Desktop) / Bottom sheet (Mobile)
*   **Toasts:** Top-right (Desktop) / Bottom-center (Mobile)

## 22. Phase 2 Implementation Checklist

### 22.1 Core Infrastructure
*   [ ] **Orama WASM Integration:** Vector database for RAG
*   [ ] **PDF Parser:** Client-side PDF text extraction
*   [ ] **Embedding Service:** Generate embeddings for chunks
*   [ ] **IndexedDB Schema:** Stores for sources, embeddings, blocks, citations
*   [ ] **Canvas Engine:** Pan/zoom, block system, connections
*   [ ] **Multi-Agent Manager:** Parallel agent execution, handoff logic

### 22.2 Knowledge Synthesis Features
*   [ ] **Source Ingestion UI:** Drag & drop, URL input, progress modals
*   [ ] **Vector Search Interface:** Search input, filters, results display
*   [ ] **Summary Generation:** AI summaries with citations
*   [ ] **Quiz Generation:** AI-generated quizzes with multiple choice
*   [ ] **Flashcard Generation:** AI-generated flashcards with spaced repetition
*   [ ] **Audio Overview:** Text-to-speech synthesis, audio player

### 22.3 Canvas & Organization
*   [ ] **Block System:** Source, Summary, Quiz, Flashcard blocks
*   [ ] **Connection System:** Create, edit, delete connections
*   [ ] **Canvas Controls:** Zoom, pan, auto-arrange, export
*   [ ] **Block Interactions:** Drag, drop, select, multi-select
*   [ ] **Canvas Gestures:** Mobile gesture support

### 22.4 Citation & Verification
*   [ ] **Citation Badges:** Inline citation display
*   [ ] **Slide-over Panel:** Citation preview with source context
*   [ ] **Verification System:** Mark citations as verified/rejected
*   [ ] **Citation Management:** List view, detail view, bulk actions

### 22.5 Study Features
*   [ ] **Flashcard Interface:** Card stack, flip animation, spaced repetition
*   [ ] **Quiz Interface:** Question display, answer input, results view
*   [ ] **Study Sessions:** Session setup, progress tracking, summary
*   [ ] **Progress Tracking:** Statistics, streaks, mastery levels

### 22.6 Knowledge Packs
*   [ ] **.alpha Pack Export:** Export dialog, pack configuration
*   [ ] **.alpha Pack Import:** Import dialog, validation, merge
*   [ ] **Teacher Verification:** Badge system, digital signatures
*   [ ] **Pack Marketplace:** Browse, download, rate packs (future)

### 22.7 Multi-Agent UI
*   [ ] **Agent Selector:** Agent cards, capability badges
*   [ ] **Agent Collaboration:** Handoff visuals, parallel execution
*   [ ] **Agent Context:** Context panel, history, management
*   [ ] **Agent Status:** Status indicators, progress bars

### 22.8 Cross-Platform & Offline
*   [ ] **Responsive Layouts:** Mobile, tablet, desktop breakpoints
*   [ ] **Gesture Support:** Mobile gestures for canvas, flashcards, quizzes
*   [ ] **Keyboard Shortcuts:** Desktop shortcuts for all features
*   [ ] **Offline Detection:** Online/offline indicator, functionality matrix
*   [ ] **Offline Sync:** Sync queue, conflict resolution, progress tracking

### 22.9 Accessibility (Phase 2)
*   [ ] **Canvas Accessibility:** Keyboard navigation, screen reader support
*   [ ] **Flashcard Accessibility:** Keyboard controls, ARIA labels
*   [ ] **Quiz Accessibility:** Keyboard navigation, screen reader announcements
*   [ ] **Audio Accessibility:** Captions, transcripts, keyboard controls
*   [ ] **Citation Accessibility:** Keyboard navigation, screen reader descriptions

### 22.10 Bilingual Support (Phase 2)
*   [ ] **Vietnamese Translations:** All Phase 2 UI strings
*   [ ] **Audio in Vietnamese:** TTS support for Vietnamese
*   [ ] **RTL Support:** Prepare for future Arabic/Hebrew
*   [ ] **Cultural Adaptations:** Vietnamese education terminology, exam formats

## 23. Design System Extensions for Phase 2

### 23.1 Color Palette (Extended)

**Phase 2 Colors:**
*   **Knowledge Blue:** #2563EB (primary action)
*   **Synthesis Green:** #10B981 (summaries, verified)
*   **Quiz Orange:** #F97316 (quizzes, review)
*   **Flashcard Purple:** #8B5CF6 (flashcards, spaced repetition)
*   **Audio Teal:** #14B8A6 (audio player, background play)
*   **Connection Gray:** #6B7280 (canvas connections)
*   **Citation Yellow:** #FEF08A (highlights)
*   **Teacher Gold:** #F59E0B (verified badges)

**Status Colors:**
*   **Indexed:** Green (#10B981)
*   **Processing:** Amber (#F59E0B)
*   **Failed:** Red (#EF4444)
*   **Verified:** Emerald (#059669)
*   **Pending:** Blue (#2563EB)

### 23.2 Typography (Extended)

**Phase 2 Font Sizes:**
*   **Canvas Block Title:** 14px, Semibold
*   **Citation Badge:** 11px, Regular, Superscript
*   **Flashcard Front:** 18px, Medium
*   **Flashcard Back:** 16px, Regular
*   **Quiz Question:** 16px, Medium
*   **Audio Transcript:** 14px, Regular

**Vietnamese Typography:**
*   **Font Family:** Inter, Roboto, or system-ui (supports Vietnamese diacritics)
*   **Line Height:** 1.6 (improves readability for Vietnamese text)
*   **Letter Spacing:** 0.01em (slight increase for diacritic clarity)

### 23.3 Animation System (Extended)

**Phase 2 Animations:**
*   **Block Drag:** 0ms (direct manipulation)
*   **Card Flip:** 200ms, ease-out
*   **Citation Slide-over:** 300ms, ease-in-out
*   **Connection Draw:** 150ms, ease-out
*   **Progress Pulse:** 1s infinite loop, ease-in-out
*   **Unlock Celebration:** 500ms, bounce effect
*   **Streak Update:** 300ms, scale-in

**Reduced Motion:**
*   **Detection:** `prefers-reduced-motion: reduce`
*   **Adaptations:** Disable animations, use instant transitions
*   **Exceptions:** Critical feedback (e.g., error toasts) still animates

### 23.4 Component Library (Extended)

**Phase 2 Components:**
*   **Canvas:** Custom canvas component with pan/zoom
*   **Block:** Reusable block component (Source, Summary, Quiz, Flashcard)
*   **Connection:** Bezier curve component with arrowhead
*   **CitationBadge:** Superscript badge with slide-over trigger
*   **FlashcardCard:** Flip animation, spaced repetition UI
*   **QuizCard:** Question display, answer input, results
*   **AudioPlayer:** Waveform visualization, playback controls
*   **AgentCard:** Agent selector card with status indicators
*   **ProgressModal:** Step-by-step progress with percentage
*   **SourceCard:** Source library card with quick actions

## 24. Performance Targets for Phase 2

### 24.1 Latency Targets (Phase 2)

| Interaction | Target | Measurement |
|-------------|---------|-------------|
| **PDF Ingestion** | < 60s | End-to-end (parse + index) |
| **Vector Search** | < 500ms | First result display |
| **Summary Generation** | < 30s | AI response time |
| **Quiz Generation** | < 45s | AI response time |
| **Audio Generation** | < 60s | End-to-end (script + TTS) |
| **Canvas Zoom** | 60fps | Smooth zoom animation |
| **Card Flip** | 60fps | Smooth flip animation |
| **Citation Load** | < 200ms | Slide-over open time |
| **Flashcard Load** | < 2s | IndexedDB query |

### 24.2 Optimization Strategy (Phase 2)

*   **Vector Search:** Run Orama in Web Worker (prevent UI block)
*   **Canvas Rendering:** Use virtualization for large canvases (render visible blocks only)
*   **Audio Streaming:** Progressive loading with buffer
*   **Embedding Caching:** Cache embeddings to avoid recomputation
*   **Lazy Loading:** Lazy load canvas blocks, flashcards, quizzes
*   **Debouncing:** Debounce canvas resize, search input, scroll events
*   **Code Splitting:** Lazy load Phase 2 features (canvas, audio, RAG)

## 25. Quality Assurance Checklist (Phase 2)

### 25.1 Functional Testing
*   [ ] **Source Ingestion:** Test PDF, URL, .alpha pack import
*   [ ] **Vector Search:** Test queries, filters, relevance
*   [ ] **Summary Generation:** Test citation accuracy, formatting
*   [ ] **Quiz Generation:** Test question quality, answer correctness
*   [ ] **Flashcard Generation:** Test content quality, spaced repetition
*   [ ] **Audio Generation:** Test Vietnamese pronunciation, speed control
*   [ ] **Canvas Interactions:** Test drag, zoom, pan, connections
*   [ ] **Citation Verification:** Test slide-over, verification workflow
*   [ ] **Multi-Agent:** Test handoff, parallel execution, context management
*   [ ] **Offline Mode:** Test offline detection, functionality, sync

### 25.2 Cross-Browser Testing
*   [ ] **Chrome:** Full feature testing
*   [ ] **Edge:** Full feature testing
*   [ ] **Firefox:** Test WebContainer compatibility
*   [ ] **Safari:** Test mobile Safari compatibility
*   [ ] **Mobile Chrome:** Test mobile browser compatibility

### 25.3 Accessibility Testing
*   [ ] **Keyboard Navigation:** Test all features with keyboard only
*   [ ] **Screen Reader:** Test with NVDA (Windows), VoiceOver (Mac)
*   [ ] **Color Contrast:** Test WCAG 2.1 AA compliance
*   [ ] **Reduced Motion:** Test with reduced motion preference
*   [ ] **Touch Targets:** Test minimum 44x44px on mobile

### 25.4 Performance Testing
*   [ ] **Load Time:** Test cold load, warm load
*   [ ] **Memory Usage:** Test with 100+ sources, 1000+ blocks
*   [ ] **Canvas Performance:** Test with 500+ blocks, zoom/pan smoothness
*   [ ] **Vector Search:** Test with 1000+ embeddings
*   [ ] **Audio Playback:** Test with 10+ minute audio files

### 25.5 Bilingual Testing
*   [ ] **Vietnamese UI:** Test all UI strings in Vietnamese
*   [ ] **Vietnamese Audio:** Test TTS pronunciation, intonation
*   [ ] **Vietnamese Content:** Test quiz/flashcard generation in Vietnamese
*   [ ] **Language Switching:** Test EN/VI switch, persistence

## 26. Handoff to Development

### 26.1 Implementation Priority

**P0 (Critical Path):**
1.  Source Ingestion (PDF/URL)
2.  Vector Search (Orama WASM)
3.  Canvas Engine (Pan/Zoom/Blocks)
4.  Summary Generation with Citations

**P1 (High Priority):**
5.  Citation Verification System
6.  Flashcard Generation & Interface
7.  Quiz Generation & Interface
8.  Multi-Agent UI

**P2 (Medium Priority):**
9.  Audio Overview
10.  Knowledge Pack Distribution
11.  Spaced Repetition System
12.  Advanced Canvas Features (Auto-arrange, Export)

**P3 (Low Priority):**
13. Teacher Verification Badges
14.  Knowledge Pack Marketplace
15.  Advanced Analytics

### 26.2 Technical Handoff Notes

**Architecture Dependencies:**
*   Canvas engine requires Web Worker for performance
*   Vector search requires Orama WASM integration
*   Audio generation requires TTS service (Web Speech API or external)
*   Multi-agent requires agent coordination layer

**State Management:**
*   Canvas state: Zustand store (blocks, connections, viewport)
*   Study state: Zustand store (flashcards, quizzes, progress)
*   Agent state: Existing stores extended for multi-agent
*   IndexedDB: New stores for sources, embeddings, citations

**Component Structure:**
```
src/components/
├── knowledge/
│   ├── Canvas.tsx
│   ├── Block.tsx
│   ├── Connection.tsx
│   ├── SourceLibrary.tsx
│   ├── CitationBadge.tsx
│   └── index.ts
├── study/
│   ├── FlashcardDeck.tsx
│   ├── QuizInterface.tsx
│   ├── StudySession.tsx
│   ├── AudioPlayer.tsx
│   └── index.ts
├── agent/
│   ├── AgentSelector.tsx
│   ├── MultiAgentPanel.tsx
│   ├── AgentContextPanel.tsx
│   └── index.ts
└── packs/
    ├── PackExportDialog.tsx
    ├── PackImportDialog.tsx
    └── index.ts
```

**API Endpoints:**
```
src/routes/api/
├── ingest.ts (PDF/URL ingestion)
├── search.ts (Vector search)
├── generate.ts (Summary/Quiz/Flashcard generation)
├── audio.ts (Audio generation)
└── packs.ts (Pack export/import)
```

---

**Document Metadata:**
- **Enhancement Date:** 2025-12-29
- **Phase:** Phase 2 Integration
- **Sections Added:** 15-26 (12 new sections)
- **Total Lines Added:** ~1500+ lines
- **Status:** Ready for Development Handoff
