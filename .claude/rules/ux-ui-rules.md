
### UI Layout Guardrails (Project Alpha)

You MUST NOT redesign the app as nested multi-pane flex/split layouts.
Follow the layout contract exactly and keep feature parity (zero feature loss).

#### 1) Breakpoint layout contract (hard rules)
- Desktop (>= 1024px): exactly 3 columns (Explorer / Workspace / Assistant) with fixed proportions (20 / flex-1 / 30) and min-widths. Do NOT add a 4th persistent pane. 
- Tablet (640–1024px): max 2 columns. Explorer collapses to icon rail/drawer. Workspace + Assistant only.
- Mobile (< 640px): exactly 1 primary surface visible at a time via bottom tabs or stacked tabs; secondary UI must be drawers/sheets/modals.

#### 2) Forbidden patterns (do not do these)
- No split-inside-split. No nested resizable panels. No “flex pane inside another flex pane” to simulate sub-panes.
- No arbitrary z-index wars (z-50/z-999). No per-component stacking hacks.
- No fixed-position bars that overlap content without reserving layout space (bottom bars must not cover chat input/editor).

#### 3) Overlay + z-index contract (must do these)
- All overlays (dialogs, drawers, popovers, tooltips) MUST render in a single OverlayRoot portal.
- Use a single z-index scale token set (e.g., base/surface/overlay/modal/toast) and never deviate.
- Avoid creating stacking contexts on pane containers (no transform/filter/opacity on high-level layout wrappers unless necessary).

#### 4) State + props contract
- Layout state (active pane/tab, sidebar open, focus mode) must be in a single Zustand layout/UI store, accessed via selectors (no prop drilling across panes).
- Only the top-level layout shell is allowed to decide structure. Feature components render into slots only.

#### 5) Deliverables required
- List all files changed.
- Provide before/after screenshots at 3 widths: 375px, 768px, 1280px.
- Provide a “Feature Parity Matrix” mapping each desktop feature to its mobile/tablet affordance (tab/drawer/modal/route).

#### 6) Validation
- Run: pnpm tsc --noEmit && pnpm test && pnpm build
- Ensure touch targets meet 44x44px minimum and breakpoints match spec.
This aligns with your existing UX spec expectations (3-column desktop, stacked tabs/drawer on mobile, explicit breakpoints, and 44px touch targets).
​

Pane + layout invariants
Enforce these as non-negotiable invariants so agents stop “jamming everything into one interface.”
​

Pane cap by breakpoint: desktop 3, tablet 2, mobile 1 primary view at a time (everything else becomes tabs/drawers/modals).
​

No resizable-panels reintroduction: your repo already documents that react-resizable-panels conflicted with the current flex height model and caused “tiny/cramped panels,” so the safe default is fixed-proportion flex with min-widths.
​

One layout owner: only IDELayout / MobileIDELayout-style shells decide columns/rows; inner components must not create their own pane grids.
​

Z-index & overlay contract
Your screenshots show UI elements visually fighting at pane boundaries (especially near the bottom bars), which is typically a stacking-context and “fixed bar doesn’t reserve space” problem.
​

Single OverlayRoot: all dialogs/drawers/popovers/tooltips must portal to one root so panes can’t accidentally clip/overlay each other.
​

Tokenized z-index scale: define a small fixed ladder (e.g., surface < overlay < modal < toast) and ban ad-hoc z-index values.
​

No “layout wrapper stacking contexts”: avoid transform, filter, opacity < 1, and overflow: hidden on high-level pane wrappers unless you really need them, because they create stacking contexts that break overlays and make “z-index fixes” look random.
​

Agent self-check checklist (fast)
Require the agent to include this checklist in its final response and mark each item PASS/FAIL with a one-line justification.
​

Layout matches breakpoint contract (desktop 3 / tablet 2 / mobile 1 primary).
​

No nested pane layouts or split-inside-split.
​

No resizable-panels attempt unless the parent has explicit height constraints (generally avoid, per known limitation).
​

Bottom bars reserve space (no overlap covering chat input/editor/controls).
​

Overlays render via one portal root and z-index uses only the defined token scale.
​

Touch targets meet 44x44px minimum on mobile/tablet.
​

Feature parity matrix provided (desktop → tablet/mobile affordance) with zero feature loss.
​

State changes: layout state centralized (no prop drilling for layout toggles).
​



**Guardrail & Checklist** you can paste at the top of every UI-related prompt. It forces the agent to stop "inventing" complex layouts and strictly follow a **Flat Hierarchy**.

### 1. The "Anti-Nesting" Guardrail (Copy & Paste this)

Paste this block into your prompt whenever asking for UI work:

```markdown
<system-instruction>
# UI/UX STRICT GUARDRAILS (NO NESTED LAYOUTS)

## 1. The "No-Nesting" Layout Contract
You are prohibited from creating nested split-panes. The workspace has a HARD LIMIT of 3 parallel columns.
- **CORRECT**: [ Sidebar (20%) ] -- [ Main Content (Flex-1) ] -- [ Assistant (30%) ]
- **FORBIDDEN**: A layout where "Main Content" itself contains another <ResizablePanelGroup> or split-pane.
- If a sub-feature needs space (e.g., a Terminal or secondary file), it must be a **Tab** (in the same pane) or a **Drawer/Modal** (z-index overlay), never a nested split.

## 2. Z-Index Stratification Scale
Do not use arbitrary `z-[100]`, `z-[9999]`. You must strictly adhere to this scale:
- `z-0`: Base canvas (Editor, text).
- `z-10`: Sticky headers/footers.
- `z-20`: Sidebars/Panels (when distinct from base).
- `z-30`: Floating Action Buttons (FABs) / Badges.
- `z-40`: Overlays/Backdrops.
- `z-50`: Modals, Command Palettes, Dialogs.
- `z-[100]`: Toast Notifications (only).

## 3. Mobile "One-Pane" Rule
- **Desktop**: Max 3 visible columns.
- **Tablet**: Max 2 visible columns (Sidebar collapses to Icon Rail).
- **Mobile**: EXACTLY 1 visible column.
  - DO NOT try to squeeze 2 panels on mobile.
  - Use a Bottom Tab Bar to switch view contexts (Editor <-> Chat <-> Files).

## 4. State Management
- **STOP passing layout props** (e.g., `isChatOpen={true}`, `leftPanelWidth={200}`) down 4 levels of components.
- Use the global store: `const { isChatOpen } = useIDEStore()` inside the component that needs to know.
</system-instruction>
```

***

### 2. The "Layout Integrity" Checklist

Before you accept any code from an agent, ask it to run this mental checklist. If it fails any point, the code is rejected.

| Check | Rule | Why? |
| :--- | :--- | :--- |
| **1. The "Resize" Check** | Did you use `react-resizable-panels`? | **FAIL.** We abandoned this in `CC-RESIZABLE-001` due to flex bugs. Use standard `flex` with fixed `%` or `rem` widths. |
| **2. The "Prop Drill" Check** | Are you passing `width` or `isOpen` as a prop? | **FAIL.** Layout state belongs in `useIDEStore`. Components should self-manage visibility via store subscription. |
| **3. The "Overlay" Check** | Does a dropdown/menu sit *inside* a container with `overflow-hidden`? | **FAIL.** This clips the UI. Portals or fixed positioning (z-50) must be used for popovers. |
| **4. The "Mobile" Check** | Are you hiding the sidebar with `display: none`? | **FAIL.** On mobile, the sidebar should not render at all (or be a Drawer). `display: none` leaves heavy DOM elements in memory. |

***

### 3. A Better Arrangement: "Focus Modes"

The "jammed" feeling comes from trying to see **Files + Editor + Notes + Chat + Terminal** all at once. A better arrangement for your workflow is **Context Switching** rather than **Spatial Squeezing**.

Ask the agent to refactor `IDELayout.tsx` to support **3 Explicit Modes**:

1.  **Creator Mode (Default)**
    *   **Left**: File Tree (Collapsed to icons by default)
    *   **Center**: Code Editor (Wide)
    *   **Right**: Chat (Collapsed, toggles over editor)
    *   *Best for: Deep coding.*

2.  **Review/Study Mode** (Your screenshots show this need)
    *   **Left**: Notes List (Wide, 25%)
    *   **Center**: Read-Only Preview / PDF / Note Content
    *   **Right**: AI Assistant (Always open, 30%)
    *   *Best for: Reading RAG outputs and taking notes.*

3.  **Zen Mode**
    *   **Center**: Editor/Notes (100% width)
    *   **Everything else**: Hidden (accessible via `Cmd+B` sidebar toggle or `Cmd+J` terminal toggle).

**How to prompt this:**
> "Refactor `IDELayout` to support a 'LayoutMode' state in Zustand. Instead of manually toggling individual panels, I want to select a preset ('Creator', 'Study', 'Zen') which automatically sets the widths and visibility of the 3 columns. Do not use nested flex containers."
