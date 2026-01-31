---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments: []
---

# UX Design Specification project-alpha-master

**Author:** Admin
**Date:** Sat Jan 17 2026

---

## Executive Summary

### Project Vision

**Via-Gent (Project Alpha v2.0)** is a browser-based, local-first AI development workspace designed to eliminate environment setup friction. It acts as a zero-server IDE where code execution happens entirely client-side using WebContainers, featuring a multi-workspace architecture (IDE, Notes, Knowledge, Study) that supports seamless transitions between coding, documentation, and learning.

### Target Users

*   **Solo Developers & Freelancers (e.g., "Alex"):** Need instant project switching and rapid shipping without infrastructure overhead.
*   **Educators & Students (e.g., "Taylor", "Jordan"):** Require zero-friction workshops and learning environments without complex CLI configurations.
*   **Distributed Teams:** Cross-functional groups needing unified, privacy-focused tooling.

### Key Design Challenges

*   **Technical Debt Remediation:** Moving from v1 to v2 to eliminate "God Components" and "God Stores" that blocked user journeys, enforcing strict Clean Architecture.
*   **Mobile/Desktop Boundary:** Designing a seamless experience where the IDE is desktop-locked for power, while Notes/Study are mobile-optimized for capture and review.
*   **Agentic Trust & Visibility:** Users must trust AI agents that execute real terminal commands and file operations; the UI must provide clear visibility into these autonomous actions.
*   **Complexity Management via Progressive Disclosure:** **CRITICAL:** The design MUST adopt a "Progressive Disclosure" pattern where advanced features are revealed only when needed, maintaining a clean, focused workspace (e.g., bottom sheets on mobile, collapsible panels on desktop) rather than simultaneous cluttered panes.

### Design Opportunities

*   **8-bit "Retro-Futurist" Aesthetic:** A strict visual governance system (zero blur, solid backgrounds, hard shadows) that provides a distinctive, performant, and clear interface for the "hacker/builder" persona.
*   **Local-First Privacy:** Leveraging File System Access (FSA) and IndexedDB to ensure 100% data privacy and offline capability.
*   **Integrated Agent OS:** A "Zero-Setup Agentic Coding" flow where users can instantly instruct agents to build, run, and commit code within seconds of landing.
*   **Progressive UI Architecture:** Implementing the "Agentic-First Flow" and "Mobile Progressive Sheet Stack" patterns, where the AI assistant and tools are layered (sheets, sidebars) and can be toggled/expanded on demand, preventing cognitive overload.

## Core User Experience

### Defining Experience

The core experience is **"Instant Agentic Creation"**.
Users act as the *Architect*, while the Agent acts as the *Builder*. The user provides the intent ("Build a React dashboard"), and Via-Gent handles the execution immediately in the browser. The experience is defined by **Zero-Setup** (WebContainers) and **Zero-Blocking** (Agent actions happen in parallel).

### Platform Strategy

*   **Primary (Desktop):** A full-featured IDE with File System Access (FSA). This is the "Power User" environment for deep coding and file manipulation.
*   **Secondary (Mobile):** A focused "Read/Write" environment for Notes and Knowledge using IndexedDB. It utilizes the **"Progressive Sheet Stack"** pattern to manage complexity on small screens, allowing users to focus on one context (Editor, Chat, or Agent) at a time.
*   **Scope Constraint:** Each device operates independently (Local-First). Cross-device sync is *not* currently supported; users work locally on the device they are using.

### Effortless Interactions

*   **The "System Rail" Pattern:** A rigid, fixed status ticker at the bottom of the viewport.
    *   *Passive:* A single line showing agent status (`> AGENT: INSTALLING...`).
    *   *Active:* Expands instantly into a terminal drawer for inspection.
    *   *Trust:* Ensures agent actions are visible but never blocking.
*   **The "One-Prompt" Start:** A user can go from "Idea" to "Running App" with a single prompt. No `npm install` wait times blocking the UI.
*   **Strict Progressive Disclosure:** On mobile/tablet, panels never clutter the view. They are stacked as "Sheets" (e.g., Chat Sheet over Editor) that can be swiped/toggled, keeping the viewport clean.

### Critical Success Moments

*   **The "It Runs!" Moment:** The first time the user sees their generated app running in the preview pane *seconds* after their prompt.
*   **Trust-Building:** Watching the "System Rail" tick through commands successfully while the user continues to work in the editor.
*   **Focus Retention:** A mobile user toggling the "Agent Sheet" to give a command and then dismissing it to return to writing notes, without losing context or feeling cramped.

### Experience Principles

*   **Progressive Disclosure via Structure:** Use rigid structures (Rails, Drawers, Sheets) to hide complexity, not transient overlays (Modals, Toasts) that clutter the view.
*   **Performance is Trust:** The UI must be snappy (8-bit, zero blur) to reinforce the "local-first" speed.
*   **Transparency:** Agent actions are never hidden. The "System Rail" always communicates the current state.
*   **Local-First Integrity:** The browser is the OS. Data lives where it is created. No magic cloud assumptions.

## Desired Emotional Response

### Primary Emotional Goals

*   **Empowerment ("Cyber-Deck Operator"):** The user feels like the pilot of a high-performance machine. The feeling is less "Video Game" and more "Sci-Fi Industrial Tool" (e.g., Alien, Blade Runner).
*   **Focus ("Flow State"):** The UI creates a "Quiet" environment by default. It uses "Brutalist Density" (shared borders, no gaps) to maximize code visibility.
*   **Professional Trust:** The aesthetic is "Retro-Futurist," not "Retro-Kitsch." It earns trust through "Terminal-Grade Typography" and instant feedback, not gamification.

### Emotional Journey Mapping

*   **Discovery:** *Intrigue & Credibility.* "This looks like a serious tool for serious work."
*   **Action:** *Precision.* Inputs feel sharp and responsive (0ms feel).
*   **Processing:** *Transparency.* The "System Rail" provides a heartbeat of activity without flashing for attention unnecessarily.
*   **Success:** *Satisfaction.* The "clunk" of a solid interaction (visually) reinforces the feeling of getting work done.

### Micro-Emotions

*   **Competence:** Using modern monospace fonts (JetBrains Mono) for text ensures the user feels they are in a professional environment, even if the container has a hard shadow.
*   **Calm:** By restricting high-contrast colors to *Active States* only, the resting state of the UI is visually quiet, preventing eye strain.

### Design Implications

*   **Typography:** Strict rule: **No Pixel Fonts for body text.** Use high-legibility monospace (JetBrains Mono). Pixel styles are for decorative headers/icons *only*.
*   **Layout:** "Zero-Gap" containers. Elements share borders. Shadows (`4px`) are reserved *only* for floating elements (modals/popovers), not static buttons, to save pixels.
*   **Color:** "Semantic Contrast." The UI is monochrome by default. Color is used *only* to signal state change (Green=Success, Orange=Processing, Red=Error).

### Emotional Design Principles

*   **"Brutalist Efficiency":** Aesthetic choices must never compromise information density. If a border wastes space, it goes.
*   **"Semantic Quietness":** The UI speaks only when spoken to. High contrast is an *alert*, not a background texture.
*   **"Industrial Trust":** The tool feels robust, not fragile. No blur, no glass, no transparency. Hard facts, hard edges.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

*   **Zed / Linear:** Masterclasses in *Density* and *Performance*. They prove that "Pro" tools don't need clutter; they need fast, predictable access to commands.
*   **Teenage Engineering (OP-1):** The gold standard for *Tactile Joy*. They show how "limiting" constraints (small screens, fixed encoders) can actually spur creativity and focus.
*   **Replit Agent:** A pioneer in *Agentic UX*, demonstrating that users want to "see the plan" before "committing the code."

### Transferable UX Patterns

*   **"The Action-Oriented Status Bar":** Move persistence to the edges. A unified footer handling Context (Branch, Env) and Agent Status (Pulse, Log) frees up the main view.
*   **"Mechanical Control Surfaces":** Use 1px borders, high-contrast active states (Black -> Orange), and "Dip Switch" toggles. Visual feedback should be "Snappy" (0-100ms), not "Smooth."
*   **"Progressive Ghost State":** Agents shouldn't just "do it." They should show a "Ghost" of the action (e.g., a greyed-out diff or plan) that becomes "Solid" upon confirmation.

### Anti-Patterns to Avoid

*   **⛔ The Floating Chat Bubble:** Agents are not support bots. They are co-workers. They deserve a dedicated Panel, not a floating overlay.
*   **⛔ Glassmorphism:** It ruins text contrast and feels "slow" (rendering cost). We stick to **Solid, Opaque Surfaces**.
*   **⛔ Blocking Modals:** Never lock the UI while the agent thinks. The user must always have read/write access to the code.

### Design Inspiration Strategy

**"High-Performance Fun"**
We blend the **Speed of Zed** with the **Soul of Teenage Engineering**.
*   **Adopt:** The "Status Bar" from Zed for high-density information.
*   **Adapt:** The "Mechanical" aesthetic of TE into a digital UI—using hard shadows and sharp borders to simulate physical switches.
*   **Avoid:** The "Softness" of modern SaaS (rounded corners, blurs) which dilutes the "Industrial Tool" feeling.

**Implementation Constraints & Strategy:**
*   **Parallel "Sidecar" Development:** This UX revamp is designed to be built in isolation. The new UI components (8-bit system) will be developed alongside the existing interface, accessible via a "Beta Toggle" in the sidebar or a dedicated "Labs" route on the Hub. This ensures the functional backend remains untouched while the new UI is perfected.
*   **Client-Side Localization (i18n):** The interface must support seamless switching between **English** and **Vietnamese**. This is purely client-side (react-i18next); no separate routes (`/en`, `/vi`) are permitted. All "Mechanical" text elements (labels, buttons) must account for variable string lengths between languages without breaking the rigid grid layout.

## Design System Foundation

### 1.1 Design System Choice

**"Via-Gent 8-bit System" (Custom Implementation)**
*   **Foundation:** Radix UI (Unified Package) + Tailwind CSS v4.
*   **Icons:** Lucide React (Standard) & Custom SVG (Mechanical).

### Rationale for Selection

*   **React 19 Verified:** Radix UI has full Server Component support and is actively maintained (verified active 2025/2026).
*   **Aesthetic Control:** Tailwind allows instant definition of our "Brutalist" tokens (`border-2`, `shadow-hard`) without fighting opinionated styles from libraries like MUI.
*   **Accessibility:** Radix handles the complex ARIA logic for Modals/Dropdowns, preventing "inaccessible toy" issues.

### Implementation Approach

*   **Package Strategy:** Install `radix-ui` (Unified) + `tailwindcss` + `lucide-react`.
*   **Token Architecture:**
    *   `radius-none`: Enforce 0px everywhere.
    *   `shadow-pixel`: `4px 4px 0px 0px #000`.
    *   `font-terminal`: JetBrains Mono.

### Customization Strategy

*   **Tailwind Config:** We will extend the theme to map semantic colors (e.g., `bg-action-primary` -> `#f97316`) to ensure the "High-Performance Fun" aesthetic is consistent.

## 2. Core User Experience

### 2.1 Defining Experience

**"The Command-to-Code Loop"**
The user types a natural language intent (e.g., "Add a dark mode toggle") into the Command Input. The Agent instantly projects a **Ghost Plan** (a dashed-border blueprint of intended changes). The user approves, and the Agent executes via the **System Rail**. The user feels like a *Director*, approving blueprints before construction.

### 2.2 User Mental Model

*   **Current Model:** "I am the builder. I type code character by character."
*   **Via-Gent Model:** "I am the Architect. I review blueprints (Ghost Plans). The Agent is the Builder who handles the implementation."
*   **Bridge:** The "Ghost Plan" acts as the contract—it proves the agent understands the scope before touching the codebase.

### 2.3 Success Criteria

*   **Speed:** The "Ghost Plan" must appear within <100ms of command submission.
*   **Visibility:** The plan must clearly distinguish between *Creating* (`+`), *Modifying* (`~`), and *Installing* (`→`) actions.
*   **Reversibility:** The plan is "Pending" by default. It only becomes real when the user clicks `[ EXECUTE ]`.

### 2.4 Novel UX Patterns

*   **The System Rail:** A rigid, persistent status footer for execution tracking.
*   **The Ghost Plan:** A dashed-border, inline panel that summarizes intent using natural language and an ASCII file tree. It visualizes "Proposed Reality."

### 2.5 Experience Mechanics

**1. Initiation:** User types "Create login form" -> `Enter`.
**2. Projection (The Ghost):**
*   A **Dashed Panel** slides down inline.
*   Header: `PROPOSED_PLAN` (pulsing).
*   Content: "I will create `LoginForm.tsx` and update routes."
*   Tree: `+ src/components/LoginForm.tsx`.
**3. Approval:**
*   User reviews the scope.
*   Clicks `[ EXECUTE ]`.
**4. Materialization:**
*   Dashed border snaps to **Solid Orange**.
*   Header changes to `EXECUTING...`.
*   System Rail ticks through the actual file operations.
**5. Completion:**
*   Panel turns Green (`DONE`).
*   Preview pane refreshes.

## Visual Design Foundation

### Color System

**Palette: "Tungsten & Fire" (Verified Accessible)**
*   **Surface:**
    *   `bg-canvas`: `#09090b` (Zinc 950) - App Background.
    *   `bg-surface`: `#18181b` (Zinc 900) - Panels.
    *   `bg-depth`: `#000000` (Black) - Inputs (Cut-out effect).
*   **Text:**
    *   `text-primary`: `#fafafa` (Zinc 50) - Body/Headers (High legibility).
    *   `text-muted`: `#a1a1aa` (Zinc 400) - Metadata.
*   **Accents:**
    *   `signal-action`: `#f97316` (Orange 500) - **Interactive Only** (Buttons, Focus, Cursors). Verified 6.32:1 contrast.
    *   `border-structural`: `#3f3f46` (Zinc 700) - Minimum contrast for grid lines.

### Typography System

**Dual-System Strategy**
*   **System (UI/Code):** **JetBrains Mono**. Used for Navigation, Sidebar, IDE, Terminal, and Metadata. Enforces the "Cyber-Deck" feel.
*   **Prose (Notes/Knowledge):** **Geist Sans**. Used *strictly* for user-generated content blocks (Markdown preview) to ensure comfortable long-form reading. It aligns geometrically with Mono but reduces eye strain.

### Spacing & Layout Foundation

**The "Mechanical Grid"**
*   **Density:** `p-3` (12px) standard.
*   **Structure:** "Zero-Gap" containers separated by `border-structural` (Zinc 700).
*   **Depth:** Inputs use `bg-depth` (#000) to appear "recessed," while Cards use `bg-surface` (#18181b) to appear "flush."
*   **Radius:** `rounded-none` (0px) everywhere.

### Accessibility Considerations

*   **Contrast:** `signal-action` (#f97316) passes WCAG AA. Text uses Zinc 50 (#fafafa) to avoid "color vibration."
*   **Reading:** The introduction of Geist Sans prevents cognitive load during deep reading tasks.
*   **Motion:** All transitions are 100ms or 0ms.

## Design Direction Decision

### Design Directions Explored

*   **Direction A ("The Monolith"):** Classic 3-pane IDE layout. Familiar but lacks unique identity.
*   **Direction B ("The Deck"):** Agent-centric layout with a bottom "System Rail" acting as the primary control surface. Panels "plug in" above it.
*   **Direction C ("The Focus"):** Minimalist, command-palette driven. Too abstract for complex workflows.

### Chosen Direction

**Direction 2: "The Deck" (Refined)**
*   **Metaphor:** A "Cyber-Deck" control surface.
*   **Layout:** A fixed "System Rail" at the bottom serves as the anchor. Panels (Editor, Preview) are "plugged in" above it.
*   **Interaction:** The Rail is the "Agent's Home." All commands start and end there.

### Design Rationale

*   **Differentiation:** It visually separates Via-Gent from VS Code (Top-heavy) and Replit (Sidebar-heavy).
*   **Agent-Centric:** The bottom-up layout prioritizes the *Conversation/Command* (Rail) as the primary input, with the Code as the output.
*   **Aesthetic:** Aligns perfectly with the "8-bit/Industrial" vibe.

### Implementation Approach

*   **Grid Layout:** Use `grid-template-rows: 1fr auto` to ensure the Rail reserves space and never obscures the Editor cursor.
*   **Rail Component:** A `<footer>` element with `border-t-2 border-zinc-700 bg-zinc-900`. It expands upward to show logs.
*   **Ghost Plan:** Rendered as a `<div>` *inside* the Editor panel (overlay), pinned to the bottom-right, distinct from the Rail.

## User Journey Flows

### Journey 1: The Creator Loop (Zero-Setup Agentic Coding)

**Flow:** Command -> Ghost Plan -> Review -> Execute -> Preview.
**Key:** The "Ghost Plan" (Step 2) creates the trust bridge.

```mermaid
graph TD
    A[User enters Command] --> B{Command Type?}
    B -->|Create/Modify| C[Show Ghost Plan]
    B -->|Question| D[Agent Chat Response]
    
    C --> E[User Reviews Ghost]
    E -->|Reject/Modify| F[Edit Command]
    F --> A
    E -->|Approve| G[System Rail: Executing]
    
    G --> H[Agent Modifies Files]
    H --> I[WebContainer Hot Reload]
    I --> J[Preview Pane Updates]
    J --> K[System Rail: Done (Green)]
```

### Journey 2: The Companion Loop (Mobile Field Deck)

**Flow:** Mobile Note -> Checkpoint -> Desktop Pull.
**Key:** Explicit "Checkpointing" replaces fragile real-time sync.

```mermaid
graph TD
    A[User opens Note on Mobile] --> B[Write Spec / Review Code]
    B --> C[Tap 'Checkpoint' (Commit)]
    C --> D[Sync to Repo]
    
    D --> E[Desktop: System Rail Flash]
    E --> F[User clicks 'Pull']
    F --> G[Desktop Workspace Updated]
```

### Journey 3: The Recovery Loop (Emergency Landscape)

The "Break Glass" procedure for data safety.

```mermaid
graph TD
    A[Database Error] --> B[Enter DEFCON 1 (Safe Mode)]
    B --> C[UI: Red Banner 'Storage Failed']
    B --> D[Disable Auto-Save to DB]
    
    C --> E{User Action}
    E -->|Save| F[Trigger 'Download Snapshot' (JSON)]
    E -->|Copy| G[Manual Copy-Paste from Memory]
    E -->|Fix| H[Clear Storage & Reload (Destructive)]
    
    F --> I[Data Saved to User OS]
    H --> J[System Reset]
```

### Flow Optimization Principles

*   **"Never Trap the User":** Always provide an "Escape Hatch" (Export/Download) if the primary path (DB Save) is blocked.
*   **"Memory is Truth":** In a local-first app, the in-memory state is the most current truth. Prioritize saving *that* to a file over retrying a broken DB connection.
*   **"Ghost Before Reality":** Always show the plan (Ghost) before making it real.

## Component Strategy

### Design System Components

*   **Foundation:** Radix Primitives + Tailwind.
*   **Dialog/Sheet:** Styled with `border-2 border-black` and `shadow-pixel`.
*   **ScrollArea:** Custom scrollbars with square thumbs (no radius).
*   **Tabs:** "Folder Tab" style (top borders) rather than "Underline" style.

### Custom Components

#### 1. The System Rail (`<SystemRail />`)
*   **Description:** A persistent, global status footer that expands into a log drawer.
*   **Props:** `status`, `message`, `logs`, `isExpanded`.
*   **Performance:** Uses "Transition Lock" to prevent `xterm.js` reflows during animation.

#### 2. The Terminal Block (`<TerminalBlock />`)
*   **Description:** High-performance `xterm.js` wrapper.
*   **Behavior:** **"Zombie Mode"**. Never unmounts when collapsed. Uses `display: none` + `contain: strict` to preserve shell history and prevent startup costs.

#### 3. The Ghost Plan (`<GhostPlan />`)
*   **Description:** Interactive blueprint of pending agent actions.
*   **Visuals:** Dashed border (`border-dashed`), monospaced list.
*   **Actions:** `[EXECUTE]`, `[MODIFY]`, `[SCRAP]`.

### Implementation Roadmap

*   **Phase 1 (The Core):** Build `<SystemRail>` with the "Zombie Mode" terminal logic. (Critical Path).
*   **Phase 2 (The Ghost):** Build `<GhostPlan>` with the ASCII tree renderer.
*   **Phase 3 (The Skin):** Reskin Radix primitives (Dialog, Toggle) to match the 8-bit tokens.

## UX Consistency Patterns

### Button Hierarchy

*   **Primary (Action):** Solid Orange (`bg-orange-500 text-black border-black`). Has a hard shadow. Used for "Execute," "Deploy," "Save."
*   **Secondary (Alternative):** Outline (`border-2 border-zinc-700 text-zinc-100`). Used for "Cancel," "Edit," "Settings."
*   **Tertiary (Ghost):** Text only (`text-zinc-400 hover:text-orange-500`). Used for "Help," "Docs."
*   **Destructive:** Solid Red (`bg-red-600 text-white`). Used for "Delete Project," "Scrap Plan."

### Feedback Patterns

*   **Success:** System Rail turns Green. Ticker: `> ACTION_COMPLETE [OK]`. No modal.
*   **Error:** System Rail turns Red. Ticker: `> ERROR: [DETAILS]`. Clicking expands the log drawer. No blocking alert.
*   **Processing:** System Rail pulses Orange. Ticker: `> PROCESSING... [||||]`.

### Navigation Patterns

*   **Global Command (`Cmd+K`):** The primary way to move. Opens a central palette.
*   **Tabs:** "Hard Tabs" (Top border). Clicking a tab is instant (0ms). No sliding underline.
*   **Breadcrumbs:** Located in the System Rail or Top Bar. Clickable for rapid traversal.

### Form Patterns

*   **Fields:** Background `bg-black` (Recessed). Border `border-zinc-800`.
*   **Focus:** Hard `ring-2 ring-orange-500`. No soft glow.
*   **Validation:** Inline error text below field in `text-red-500` (Mono).

### Empty States

*   **Visual:** A large, pixelated icon (e.g., an open box).
*   **Text:** "SYSTEM_READY. AWAITING_INPUT."
*   **Action:** A blinking cursor prompt or a primary button to "Initialize."

## Responsive Design & Accessibility

### Responsive Strategy

**The "Deck" Adaptation Model**
*   **Desktop (>1024px):** "The Full Deck." System Rail docked at bottom. Editor and Preview side-by-side (Grid `1fr 1fr`).
*   **Tablet (768px - 1023px):** "The Stacked Deck." System Rail docked. Editor takes full width. Preview is a togglable "Overlay Sheet" (Z-index 20).
*   **Mobile (<767px):** **"The Elevated Pill"**.
    *   *Safe Area:* The "System Rail" floats `env(safe-area-inset-bottom) + 16px` above the bottom to avoid the iOS Home Indicator.
    *   *Hit Box:* The 44px visible handle sits inside a **72px invisible hit area** to forgive sloppy thumb taps.

### Breakpoint Strategy

Standard Tailwind breakpoints, but used for *Layout Shifts*, not just sizing.
*   `md` (768px): Switch from Stacked Panels to Side-by-Side.
*   `lg` (1024px): Unlock "Pinning" for sidebars.

### Accessibility Strategy

**Level AA Compliance (Strict)**
*   **Focus Management:** Because we have custom "Mechanical" switches, we must manually manage focus rings. Every interactive element gets `ring-2 ring-orange-500` on focus.
*   **Screen Readers:**
    *   **System Rail:** Uses `aria-live="polite"` for the ticker. It announces "Agent starting..." without interrupting the user's typing.
    *   **Ghost Plan:** Uses `role="status"` to announce the pending plan.
*   **Safe Areas:** All mobile containers must respect `safe-area-inset-*` (Top/Bottom) to avoid notch/indicator overlap.

### Testing Strategy

*   **Automated:** `axe-core` running in CI/CD on every build.
*   **Manual:** "The Keyboard Gauntlet." A QA pass where the mouse is unplugged. Can a user create a project, run an agent, and deploy using *only* the keyboard?

### Implementation Guidelines

*   **Touch Targets:** Even on Desktop, the "System Rail" buttons must be min 44px height to support touch-screen laptops.
*   **Rem Units:** All font sizes use `rem` to respect browser zoom settings. Spacing uses `px` (4px grid) to maintain the "8-bit" rigidity.

## Part 2: Advanced Workspaces & Interactions (10x Upgrade)

### 3.1 Notes Workspace (The "Digital Garden")

The Notes workspace differs fundamentally from the IDE. It is for *consumption* and *thinking*, not just *construction*.

*   **Typography Shift:** While the IDE uses `JetBrains Mono` for everything, Notes uses **`Geist Sans`** for the editor body. This visual switch signals a "Context Mode" change to the user's brain (Code vs. Prose).
*   **Dual-Pane Interaction:**
    *   **Left Pane (Explorer):** A simplified file tree. No git status, no noise. Just folders and Markdown files.
    *   **Main Pane (Editor):** A "Zen Mode" editor.
        *   *Markdown Support:* Real-time preview (WYSIWYG-like) but with visible markdown syntax for power users.
        *   *Asset Drag-and-Drop:* Images dropped here are auto-saved to `_assets/` and linked relative.
*   **Mobile "Sheet Stack":**
    *   On mobile, opening a Note slides a "Sheet" over the Explorer.
    *   Tapping "Back" slides the sheet away.
    *   *Prototype:* `_bmad-output/design/prototypes/notes/index.html`

### 3.2 Agent Inner Interfaces (The "Cyber-Deck" Internals)

To solve the "Black Box" problem, we expose the Agent's brain via the **Ghost Plan** and **System Rail**.

#### The Ghost Plan (`<GhostPlan />`)
This is the "Contract" between User and Agent. It appears *inside* the Editor as an overlay.
*   **Anatomy:**
    *   **Header:** `PROPOSED_PLAN.yaml` (Yellow/Orange dashed border).
    *   **Intent Summary:** Natural language explanation.
    *   **Diff Tree:** ASCII-style tree showing `+` (Create), `~` (Modify), `-` (Delete).
    *   **Tool List:** Tags showing which tools will be called (e.g., `fs.write`, `npm.install`).
*   **Interaction:**
    *   **Reject:** Discards the plan.
    *   **Execute:** "Materializes" the plan (Border turns solid, opacity 100%).
    *   *Prototype:* `_bmad-output/design/prototypes/agent/index.html`

#### The System Rail (Expanded)
The footer is not just a ticker; it's a collapsible log drawer.
*   **States:**
    *   *Collapsed:* Height 32px. Shows current status + spinner.
    *   *Expanded:* Height 200px. Shows raw logs (`stdout`, `stderr`).
*   **"Zombie Mode" (Performance):** The terminal instance inside the rail never unmounts; it just hides via CSS to preserve history and avoid re-init costs.

### 3.3 Cross-Workspace Navigation (The "Global Glue")

How do we prevent "Context Fragmentation" across IDE, Notes, and Knowledge?

*   **The Global Command Palette (`Cmd+K`):**
    *   This is the *only* way to navigate quickly.
    *   **Context Aware:**
        *   In IDE: Shows `> Go to File...`, `> Run Command...`
        *   In Notes: Shows `> Create Note...`, `> Search Knowledge...`
    *   **Global Switchers:** `G I` (Go IDE), `G N` (Go Notes), `G S` (Go Study).
    *   *Prototype:* `_bmad-output/design/prototypes/nav/index.html`

### 3.4 Mobile "Elevated Pill" (The Safe Area Solution)

*   **Problem:** The iOS Home Indicator overlaps bottom UI.
*   **Solution:** The "System Rail" on mobile floats **16px + env(safe-area-inset-bottom)** from the bottom.
*   **Hit-Area Hack:** The visual pill is 44px tall, but the *invisible click target* extends 20px below it to catch clumsy thumb taps that might hit the bezel.

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Part 3: Complete Component System (Verified Against Codebase)

### 4.1 IDE Workspace Components (Desktop Only)

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Logo | Workspace Tabs | Breadcrumb | Actions        │
├────┬────────┬───────────────────────┬───────────────────────┤
│ ICON│ FILE  │                       │ AGENT PANEL           │
│ SID│ TREE  │     MONACO EDITOR      │ - Chat Input          │
│ E  │       │                       │ - Ghost Plan          │
│    │       │                       │ - Tool Approval       │
│    ├───────┤                       │                       │
│    │       │  ┌─────────────────┐  │                       │
│    │       │  │ PREVIEW PANEL   │  │                       │
│    │       │  │ (Split Bottom)  │  │                       │
│    │       │  └─────────────────┘  │                       │
├────┴───────┴───────────────────────┴───────────────────────┤
│ SYSTEM RAIL: Status | Line:Col | Problems | Agent State     │
└─────────────────────────────────────────────────────────────┘
```

**Component Inventory (Verified):**

| Component | File Path | Role |
|-----------|-----------|------|
| `IconSidebar` | `ide/IconSidebar.tsx` | 12-icon nav for Explorer, Search, Source Control, Agent, Extensions |
| `ExplorerPanel` | `ide/ExplorerPanel.tsx` | File tree with file operations (new, rename, delete) |
| `MonacoEditor` | `ide/MonacoEditor/` | Full Monaco integration with syntax highlighting |
| `PreviewPanel` | `ide/PreviewPanel/` | Live preview with hot reload iframe |
| `XTerminal` | `ide/XTerminal.tsx` | xterm.js terminal integration |
| `StatusBar` | `ide/StatusBar.tsx` | Line/Col, encoding, language, problems count |
| `CommandPalette` | `ide/CommandPalette.tsx` | `Cmd+K` global command interface |
| `AgentChatPanel` | `ide/AgentChatPanel/` | Agent chat with tool approvals |
| `SyncStatusIndicator` | `ide/SyncStatusIndicator.tsx` | FSA sync status |
| `SettingsPanel` | `ide/SettingsPanel.tsx` | IDE-specific settings |

**State Requirements:**
- Active file path (Zustand)
- Open tabs array (Zustand)
- Preview URL (Zustand + WebContainer)
- Terminal history (xterm.js instance - never unmount)

### 4.2 Notes Workspace Components (Desktop + Mobile)

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Logo | Workspace Tabs | Search | Actions            │
├────┬────────┬───────────────────────────────────────────────┤
│ NOTE│ NOTE  │  NOTE EDITOR (BlockNote)                      │
│ TREE│ LIST  │                                               │
│    │        │  - Slash Commands (/ai, /heading, /list)      │
│    │        │  - AI Popup (InBlockAIPopup)                  │
│    │        │  - Voice Record (VoiceRecordButton)           │
│    │        │  - Markdown Export/Import                     │
├────┴────────┴───────────────────────────────────────────────┤
│ CROSS-WORKSPACE: Sync with IDE files | RAG Search           │
└─────────────────────────────────────────────────────────────┘
```

**Component Inventory (Verified):**

| Component | File Path | Role |
|-----------|-----------|------|
| `NoteTree` | `notes/NoteTree.tsx` | Hierarchical note structure |
| `NoteEditor` | `notes/NoteEditor.tsx` | BlockNote editor with slash commands |
| `NoteSidebar` | `notes/NoteSidebar.tsx` | Note list and navigation |
| `SlashCommandsDialog` | `notes/SlashCommandsDialog.tsx` | `/` command menu |
| `AISlashCommand` | `notes/AISlashCommand.tsx` | AI-powered block commands |
| `AITransformMenu` | `notes/AITransformMenu.tsx` | AI text transformation |
| `VoiceRecordButton` | `notes/VoiceRecordButton.tsx` | Voice input with transcription |
| `NoteSidebarChat` | `notes/NoteSidebarChat.tsx` | AI chat contextually aware of note |
| `NotesRAGSearch` | `notes/NotesRAGSearch.tsx` | Search across notes |
| `MarkdownImportDialog` | `notes/MarkdownImportDialog.tsx` | Import markdown files |
| `MarkdownExportDialog` | `notes/MarkdownExportDialog.tsx` | Export to markdown |
| `NotesMobileLayout` | `notes/NotesMobileLayout.tsx` | Mobile-optimized layout |

**Typography Rules:**
- **Editor Body:** `Geist Sans` (for long-form reading comfort)
- **UI Elements:** `JetBrains Mono` (sidebar, buttons, metadata)
- **Code Blocks:** `JetBrains Mono` with syntax highlighting

### 4.3 Knowledge Workspace Components (Desktop + Mobile)

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Logo | Workspace Tabs | RAG Search | Import Source  │
├────┬──────────────┬─────────────────────────────────────────┤
│ COLL│ SOURCE      │  SOURCE CARDS GRID                      │
│ ECT │ LIST        │                                         │
│ ION │             │  - PDF Card                             │
│     │             │  - URL Card                             │
│     │             │  - GitHub Card                          │
│     │             │  - Markdown Card (synced from Notes)    │
├────┴──────────────┴─────────────────────────────────────────┤
│ RAG CONFIG: Chunk Size | Overlap | Index Status             │
└─────────────────────────────────────────────────────────────┘
```

**Component Inventory (Verified):**

| Component | File Path | Role |
|-----------|-----------|------|
| `KnowledgePage` | `knowledge/KnowledgePage.tsx` | Main knowledge page |
| `CollectionManager` | `knowledge/CollectionManager.tsx` | Group sources into collections |
| `SourceCardGrid` | `knowledge/SourceCardGrid.tsx` | Grid of source cards |
| `SourceCard` | `knowledge/SourceCard.tsx` | Individual source display |
| `SourceImportDialog` | `knowledge/SourceImportDialog.tsx` | Import PDF/URL/GitHub |
| `RAGConfigurationPanel` | `knowledge/RAGConfigurationPanel.tsx` | Vector index settings |
| `IndexingProgressPanel` | `knowledge/IndexingProgressPanel.tsx` | RAG indexing status |
| `SynthesisDialog` | `knowledge/SynthesisDialog.tsx` | AI synthesis of sources |
| `StudyArtifactExportDialog` | `knowledge/StudyArtifactExportDialog.tsx` | Export flashcards/quiz |
| `KnowledgeMobileLayout` | `knowledge/KnowledgeMobileLayout.tsx` | Mobile layout |

**RAG Configuration:**
- **Chunk Size:** 512 tokens (configurable)
- **Overlap:** 128 tokens (25% of chunk)
- **Index Storage:** Dexie vectors (~2.4MB typical)
- **Query Mode:** Semantic search with source citations

### 4.4 Study Workspace Components (Desktop + Mobile)

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Workspace Tabs | Progress Stats                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ FLASHC  │  │ QUIZ    │  │ REVIEW  │  │ STATS   │        │
│  │ CARDS   │  │ VIEW    │  │         │  │         │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
├─────────────────────────────────────────────────────────────┤
│  - Spaced repetition algorithm                              │
│  - Quiz generation from Knowledge sources                   │
│  - Progress tracking per collection                         │
└─────────────────────────────────────────────────────────────┘
```

**Component Inventory (Verified):**

| Component | File Path | Role |
|-----------|-----------|------|
| `StudyPage` | `study/StudyPage.tsx` | Main study dashboard |
| `QuizContainer` | `study/QuizContainer.tsx` | Quiz taking interface |
| `QuizStartScreen` | `study/QuizStartScreen.tsx` | Quiz configuration |
| `QuizQuestionView` | `study/QuizQuestionView.tsx` | Question display |
| `QuizResults` | `study/QuizResults.tsx` | Quiz completion results |
| `QuizReview` | `study/QuizReview.tsx` | Review incorrect answers |
| `flashcard` | `study/flashcard.tsx` | Flashcard component |
| `studySession` | `study/study-session.tsx` | Active study session |
| `studyStats` | `study/study-stats.tsx` | Progress statistics |

### 4.5 Hub / Landing Workspace Components

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ HERO: Logo | User | Settings | Quick Actions (4 cards)      │
│ SEARCH: ⌘K Command Palette                                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐ ┌────────────┐ │
│  │ RECENT PROJECTS (Grid)                  │ │ STATS      │ │
│  │ - IDE Project Card                      │ │ - Storage  │ │
│  │ - Notes Project Card                    │ │ - Activity │ │
│  │ - Knowledge Project Card                │ │ - Agents   │ │
│  │ - Empty State / New Project             │ │            │ │
│  └─────────────────────────────────────────┘ └────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ FOOTER: Version | Platform | Links                          │
└─────────────────────────────────────────────────────────────┘
```

**Component Inventory (Verified):**

| Component | File Path | Role |
|-----------|-----------|------|
| `HubHomePage` | `hub/HubHomePage.tsx` | Main landing page |
| `ProjectCard` | `hub/ProjectCard.tsx` | Project display card |
| `ProjectSearchBar` | `hub/ProjectSearchBar.tsx` | Project search |
| `RecentProjectsSection` | `hub/RecentProjectsSection.tsx` | Recent projects list |
| `WorkspaceBindingDialog` | `hub/WorkspaceBindingDialog.tsx` | Bind workspaces to project |
| `StorageUsageCard` | `hub/StorageUsageCard.tsx` | Storage visualization |
| `SummaryCardsGrid` | `hub/SummaryCardsGrid.tsx` | Activity metrics |
| `ActivityCard` | `hub/ActivityCard.tsx` | Activity timeline |
| `WorkspacePieChart` | `hub/WorkspacePieChart.tsx` | Workspace distribution |

### 4.6 Chat & Agent Components (Cross-Workspace)

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ CHAT PANEL (Collapsible Right Sidebar)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Chat History (Scrollable)                           │    │
│  │ - User Messages (Right-aligned)                     │    │
│  │ - AI Messages (Left-aligned)                        │    │
│  │ - System Messages (Centered/Subtle)                 │    │
│  │ - Tool Approval Overlays                            │    │
│  │ - Ghost Plan Cards (Dashed Border)                  │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  TOOL STATUS: write_file | read_file | execute_command     │
│  INPUT: Textarea | Send Button | Attachment Clip           │
└─────────────────────────────────────────────────────────────┘
```

**Component Inventory (Verified):**

| Component | File Path | Role |
|-----------|-----------|------|
| `UnifiedChatPanel` | `chat/UnifiedChatPanel.tsx` | Main chat interface |
| `ChatBubble` | `chat/ChatBubble.tsx` | Message bubble |
| `ChatInputControls` | `chat/ChatInputControls.tsx` | Input area |
| `ApprovalOverlay` | `chat/ApprovalOverlay.tsx` | Tool execution approval |
| `DiffPreview` | `chat/DiffPreview.tsx` | Show code diffs |
| `ToolProgressIndicator` | `chat/ToolProgressIndicator.tsx` | Tool execution status |
| `WorkflowBuilder` | `chat/WorkflowBuilder.tsx` | Multi-step workflows |
| `MultiAgentChatPanel` | `chat/MultiAgentChatPanel.tsx` | Multiple agents |
| `NoteReferencePicker` | `chat/NoteReferencePicker.tsx` | Reference notes |

| Component | File Path | Role |
|-----------|-----------|------|
| `AgentConfigDialog` | `agent/AgentConfigDialog.tsx` | Agent configuration (GOD COMPONENT - needs split) |
| `ProviderConfigDialog` | `agent/ProviderConfigDialog.tsx` | AI provider settings |
| `ToolPermissionsConfig` | `agent/ToolPermissionsConfig.tsx` | Per-tool permissions |
| `WorkspacePermissionEditor` | `agent/WorkspacePermissionEditor.tsx` | Workspace access |
| `VaultStatusCard` | `agent/VaultStatusCard.tsx` | Credential vault status |
| `MemorySearch` | `agent/MemorySearch.tsx` | Agent memory search |
| `DeepThinkUI` | `agent/DeepThinkUI.tsx` | Deep thinking mode |

### 4.7 Layout Components

**Component Inventory (Verified):**

| Component | File Path | Role |
|-----------|-----------|------|
| `MainLayout` | `layout/MainLayout.tsx` | Root layout wrapper |
| `MainSidebar` | `layout/MainSidebar.tsx` | Desktop sidebar navigation |
| `MobileTabBar` | `layout/MobileTabBar.tsx` | Mobile bottom navigation |
| `IDEHeaderBar` | `layout/IDEHeaderBar.tsx` | IDE-specific header |
| `IDELayoutMain` | `layout/IDELayoutMain.tsx` | IDE main layout |
| `MobileIDELayout` | `layout/MobileIDELayout.tsx` | Mobile IDE (restricted) |
| `TerminalPanel` | `layout/TerminalPanel.tsx` | Terminal container |
| `ChatPanelWrapper` | `layout/ChatPanelWrapper.tsx` | Chat panel container |
| `PermissionOverlay` | `layout/PermissionOverlay.tsx` | FSA permission request |

## Part 4: Production-Ready Prototypes

### 4.1 Prototype Coverage

| Workspace | Prototype | Features Demonstrated |
|-----------|-----------|----------------------|
| **IDE** | `design/prototypes/ide/index.html` | Icon sidebar, File tree, Monaco editor, Preview panel, Agent chat, System rail, Tabs, Workspace tabs |
| **Knowledge** | `design/prototypes/knowledge/index.html` | Collections, Source cards, RAG configuration, AI chat with source citations |
| **Hub** | `design/prototypes/hub/index.html` | Hero section, Project cards, Storage stats, Activity metrics, AI status |
| **Notes** | `design/prototypes/notes/index.html` (existing) | File tree, Editor, AI sidebar, Voice input |
| **Agent** | `design/prototypes/agent/index.html` (existing) | Ghost plan, Tool permissions, Execute flow |

### 4.2 Implementation Checklist for Dev-Ext

**Phase 1: Core Infrastructure**
- [ ] Setup Tailwind config with 8-bit tokens
- [ ] Create CSS variables for colors/fonts
- [ ] Build `<IconSidebar />` component
- [ ] Build `<StatusBar />` component

**Phase 2: IDE Workspace**
- [ ] Integrate Monaco Editor with file tree
- [ ] Build `<PreviewPanel />` with WebContainer URL
- [ ] Build `<XTerminal />` with xterm.js
- [ ] Implement `<SystemRail />` with zombie mode
- [ ] Build `<CommandPalette />` (`Cmd+K`)

**Phase 3: Agent Integration**
- [ ] Build `<UnifiedChatPanel />`
- [ ] Implement `<GhostPlan />` overlay
- [ ] Build `<ApprovalOverlay />` for tools
- [ ] Connect to TanStack AI SDK

**Phase 4: Notes Workspace**
- [ ] Integrate BlockNote editor
- [ ] Build `<NoteTree />` component
- [ ] Implement `<SlashCommandsDialog />`
- [ ] Add `<VoiceRecordButton />` integration

**Phase 5: Knowledge Workspace**
- [ ] Build `<CollectionManager />`
- [ ] Implement `<SourceCardGrid />`
- [ ] Connect RAG configuration panel
- [ ] Build flashcard/quiz generation

**Phase 6: Hub & Settings**
- [ ] Build `<HubHomePage />` with project cards
- [ ] Implement `<StorageUsageCard />`
- [ ] Build workspace binding dialog

### 4.3 Design System File Locations

```
src/
├── presentation/
│   ├── styles/
│   │   ├── tokens.css          # CSS custom properties
│   │   ├── tailwind.config.js  # Tailwind extension
│   │   └── global.css          # Global resets
│   │
│   ├── components/
│   │   ├── ui/                 # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   │
│   │   └── ide/                # IDE-specific components
│   │       ├── index.ts        # Barrel export
│   │       ├── IconSidebar.tsx
│   │       └── ...
│   │
│   └── hooks/
│       ├── useFileTree.ts
│       ├── useAgent.ts
│       └── usePlatform.ts
│
└── infrastructure/
    └── persistence/
        └── dexie-db.ts         # Dexie schema
```

### 4.4 CSS Tokens (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: '#09090b',  // App background
        surface: '#18181b', // Panels, cards
        depth: '#000000',   // Inputs, recessed areas
        primary: '#fafafa', // Primary text
        muted: '#a1a1aa',   // Secondary text
        action: '#f97316',  // Interactive, focus
        structural: '#3f3f46', // Borders, dividers
        success: '#22c55e', // Success states
        error: '#ef4444',   // Error states
        warning: '#eab308', // Warning states
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Geist', 'sans-serif'],
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px #000',
        'pixel-sm': '2px 2px 0px 0px #000',
      },
      borderWidth: {
        '2': '2px', // Standard border
      },
      borderRadius: {
        'none': '0px', // 8-bit aesthetic
      },
    },
  },
}
```

### 4.5 Mobile Responsive Breakpoints

```css
/* Desktop (default) */
@media (min-width: 1024px) {
  /* Full IDE with all panels */
}

/* Tablet */
@media (max-width: 1023px) {
  /* Collapsible sidebars */
  /* Preview becomes toggleable sheet */
}

/* Mobile */
@media (max-width: 767px) {
  /* IDE access BLOCKED - redirect to Notes */
  /* Bottom navigation (MobileTabBar) */
  /* Sheets stack for Notes/Knowledge/Study */
}
```

---

## Handoff Summary

**Prototypes Created:**
- `design/prototypes/ide/index.html` - Complete IDE workspace
- `design/prototypes/knowledge/index.html` - Knowledge workspace with RAG
- `design/prototypes/hub/index.html` - Landing page with project cards

**Ready for Dev-Ext:**
1. Review prototypes in browser
2. Start Phase 1: Core Infrastructure (Tailwind + tokens)
3. Build component library in `src/presentation/components/ui/`
4. Implement IDE workspace (most complex)
5. Iterate on Notes/Knowledge/Study workspaces

**Key Constraints:**
- Zero border radius (`rounded-none`)
- Hard shadows only (`shadow-pixel`)
- No glassmorphism (solid colors only)
- JetBrains Mono for UI, Geist Sans for prose
- Desktop IDE = Full features; Mobile = Notes/Knowledge/Study only
