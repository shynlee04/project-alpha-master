# Sprint Change Proposal: UX Design System Violations

**Version**: 1.0.0
**Date**: 2026-01-09T17:15:11+07:00
**Author**: Sally (UX Designer Agent)
**Workflow**: `/bmad-bmm-workflows-correct-course`
**Status**: PENDING_APPROVAL
**Scope Classification**: MODERATE

---

## 1. Issue Summary

### 1.1 Problem Statement

During a comprehensive design audit of the codebase, **critical 8-bit design system violations** were discovered that contradict the explicit design principles documented in `design-tokens.css` and `ux-specification.md`.

The violations fall into four categories:

1. **Glassmorphism/Transparency in Menus & Selectors** - Agent selectors, dropdowns, and configuration dialogs use semi-transparent backgrounds (`slate-800/60`, `slate-900/50`, etc.) that layer over underlying text, creating unreadable UIs
2. **Rounded Corners** - 180+ instances of `rounded-lg`, `rounded-md`, `rounded-xl` vs the mandated `--radius: 0rem` for 8-bit aesthetic  
3. **Blur Effects** - Despite explicit "no blur" comments in component headers, `blur-[100px]` used in HeroSection and Onboarding
4. **Multi-pane Mobile Layouts** - `ResizablePanelGroup` creates unusable 3-column layouts on smartphones (75px, 187px, 112px columns on 375px screen)

### 1.2 Discovery Context

- **Triggered By**: User escalation during UX audit session (2026-01-09)
- **User Feedback**: "Those agent or any configuration with dropdown menu search for all CSS Tailwind of any design utilities these menu dropdown are transparent and layer on top of another text complexity or layer and layout complexity it is just horrible. The contrast violations are various."
- **Workspaces Affected**: All 4 workspaces (IDE, Knowledge, Notes, Study)

### 1.3 Evidence

#### A. Transparency/Opacity Violations

**File: `UnifiedAgentSelector.tsx` (Lines 330-367)**
```tsx
// VIOLATION: 60% opacity background on selector trigger
'bg-slate-800/60 hover:bg-slate-700/80',

// VIOLATION: Semi-transparent content
'bg-slate-800 dark:bg-slate-900',
```

**File: `ChatConversation.tsx` (15 occurrences)**
```tsx
'bg-slate-800/80 border-slate-600 text-slate-100'
'bg-slate-900/50' // 50% opacity background
'bg-slate-900/80 border-2 border-slate-600'
```

**File: `ChatHistory.tsx` (Line 424)**
```tsx
'bg-slate-800/40 border-slate-600 text-slate-400 hover:bg-slate-700/40'
```

**File: `MessageSearch.tsx` (Lines 136, 176, 322, 351)**
```tsx
'bg-slate-900/95 border-l-2 border-slate-700'  // 95% opacity
'bg-slate-800/40 border-slate-600 text-slate-400' // 40% opacity
```

**File: `StreamdownRenderer.tsx` (Lines 104, 116, 164)**
```tsx
'bg-slate-800/50' // 50% opacity on code blocks
'prose-blockquote:bg-slate-800/50 prose-blockquote:px-4'
```

#### B. Rounded Corners Violations

**Pattern**: `rounded-lg`, `rounded-md`, `rounded-xl` (180+ occurrences)

**Design Token Mandate:**
```css
/* From design-tokens.css */
--radius: 0rem;  /* Default: Squared corners */
```

**Violating Files (partial list):**
- `ide.tsx` - 10+ instances
- `CommandPalette.tsx` - 4 instances
- `Header.tsx` - 10+ instances
- `SkillCategory.tsx` - 5 instances
- `WorkspaceBindingDialog.tsx` - 3 instances
- `ErrorFallback.tsx` - 2 instances
- `dropdown-menu.tsx` - `rounded-md` on content container

#### C. Blur Effects Violations

**Design Token Mandate:**
```css
/* From design-tokens.css & ux-specification.md */
/* 8-Bit Aesthetic Rules:
 * - NO Glassmorphism: No backdrop-filter, no blur effects
 * - Solid Backgrounds Only
 */
```

**Violating Files:**
```tsx
// HeroSection.tsx (Lines 13-14)
<div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-[100px]" />

// Onboarding.tsx (Line 40)
<div className="... blur-[100px] -translate-y-1/2 translate-x-1/2 ..." />
```

#### D. Multi-pane Mobile Violations

**File: `NotesPage.tsx` (Lines 567-685)**
- 3-column layout: Sidebar (20%) + Editor (50%) + Chat (30%)
- On 375px screen: Each column gets ~75px, 187px, 112px
- **Impact**: Text unreadable, buttons untouchable

**File: `KnowledgePage.tsx` (Lines 593-704)**
- Similar 3-column resizable layout
- Identical mobile usability issues

**File: `IDEResizableLayout.tsx` (Lines 72-147)**
- Nested `ResizablePanelGroup` with horizontal + vertical splits
- IDE becomes completely unusable on mobile

---

## 2. Impact Analysis

### 2.1 Epic Impact

#### Current Epic Status Review

| Epic ID | Title | Impact Level | Changes Required |
|---------|-------|--------------|------------------|
| **EPIC-36** | Responsive UX | HIGH | Stories 36-01 through 36-04 must be EXPANDED to include transparency fixes |
| **EPIC-32** | Notes Workspace | MEDIUM | NotesPage.tsx mobile layout requires redesign (Story 32-12) |
| **EPIC-33** | IDE Workspace | MEDIUM | IDE mobile layout requires redesign (Story 33-10) |
| **EPIC-38** | Clean Architecture | LOW | No direct impact, but design tokens should be enforced |

#### Required Epic-Level Changes

1. **CREATE NEW EPIC: EPIC-39 "8-Bit Design Compliance"**
   - P0 Priority (Critical visual regression)
   - 6-8 stories (~12-16 hours)
   - Address all transparency, rounding, and blur violations
   - Add ESLint plugin to prevent future violations

2. **MODIFY EPIC-36 Story Scope**
   - Expand stories 36-01 through 36-04 to include tab-based mobile navigation
   - Current 12 hours → Revised 18 hours (+6 hours)

### 2.2 Artifact Conflict Analysis

#### A. UX Specification Conflicts

**File**: `_bmad-output/planning-artifacts/ux-specification.md`

| Section | Specification | Current State | Conflict |
|---------|--------------|---------------|----------|
| 1.4 Borders & Shadows | `--radius: 0rem` (squared corners) | 180+ `rounded-*` classes | YES - CRITICAL |
| 1.4 Borders & Shadows | "NO backdrop-blur or backdrop-filter" | `blur-[100px]` in 2 files | YES - MEDIUM |
| 1.4 Borders & Shadows | "Solid Backgrounds Only" | 50+ opacity backgrounds | YES - CRITICAL |
| 3.3 Notes Workspace | "Note list drawer on mobile" | 3-column ResizablePanel | YES - CRITICAL |

**Resolution**: Update components to comply with existing specification (no spec changes needed)

#### B. Architecture Conflicts

**File**: `_bmad-output/planning-artifacts/architecture.md`

**No direct conflicts identified.** Architecture defines technical patterns, not visual design. However:
- ADR should be created for "8-Bit Design Enforcement" to document the linting approach

#### C. Design Tokens Conflicts

**File**: `src/styles/design-tokens.css`

The design tokens are **correctly defined** but **not being enforced**:

```css
/* CORRECT IN DESIGN TOKENS */
--radius: 0rem;     /* Squared corners by default */
--color-overlay: #1a1a1a;  /* Solid color replaces glassmorphism */
--shadow-pixel: 2px 2px 0px 0px rgba(0, 0, 0, 0.5);  /* Hard pixel shadows */
```

**Resolution**: Components must use CSS variables, not Tailwind utility overrides

### 2.3 Story Impact

#### Directly Affected Stories

| Story ID | Title | Current Status | Required Change |
|----------|-------|----------------|-----------------|
| 36-01 | Mobile-responsive IDE layout | READY | Add tab-based navigation pattern |
| 36-02 | Mobile-responsive Notes layout | READY | Add tab-based navigation pattern |
| 36-03 | Mobile-responsive Knowledge layout | READY | Add tab-based navigation pattern |
| 32-12 | Mobile-responsive notes UI | P2 | Elevate to P1, add transparency fixes |
| 33-10 | Mobile-responsive IDE UI | P2 | Elevate to P1, add transparency fixes |

#### New Stories Required

| Story ID | Title | Epic | Effort | Priority |
|----------|-------|------|--------|----------|
| **39-01** | Remove transparency from agent selectors | EPIC-39 | 2h | P0 |
| **39-02** | Remove transparency from chat components | EPIC-39 | 3h | P0 |
| **39-03** | Replace rounded corners with squared | EPIC-39 | 3h | P0 |
| **39-04** | Remove blur effects from HeroSection/Onboarding | EPIC-39 | 1h | P0 |
| **39-05** | Create ESLint plugin for design enforcement | EPIC-39 | 2h | P1 |
| **39-06** | Add visual regression tests for 8-bit compliance | EPIC-39 | 2h | P1 |

---

## 3. Recommended Approach

### 3.1 Option Analysis

#### Option A: Direct Adjustment (RECOMMENDED ✅)

**Description**: Create new EPIC-39 to address violations directly. Modify existing stories in EPIC-36 to include expanded mobile patterns.

**Pros**:
- Minimal disruption to existing sprint
- Clear separation of concerns (new epic for new scope)
- Parallelizable with other epics

**Cons**:
- Adds ~12-16 hours to total effort

**Effort Estimate**: Medium (12-16 hours)
**Risk Level**: Low

#### Option B: Rollback

**Not viable.** The violations are endemic across the codebase - no rollback target exists.

#### Option C: MVP Review

**Not recommended.** The UX violations are critical for production quality and user perception. Deferring would damage product credibility.

### 3.2 Selected Approach: Option A - Direct Adjustment

**Rationale**:
1. **Clear Scope**: New EPIC-39 addresses design violations specifically
2. **Parallel Execution**: Can run alongside other Phase 2 epics
3. **Low Risk**: Changes are additive CSS/class modifications
4. **High Impact**: Immediately improves UX quality across all workspaces

---

## 4. Detailed Change Proposals

### 4.1 New Epic: EPIC-39 "8-Bit Design Compliance"

```markdown
## EPIC-39: 8-Bit Design Compliance

**Priority**: P0 - Critical (Visual Quality)
**Status**: NEW (Proposed 2026-01-09)
**Stories**: 6
**Effort**: ~13 hours
**Dependencies**: None (can run in parallel with other epics)

**Business Value**:
- Current design compliance: ~40% (vs 100% target)
- 180+ rounded corner violations
- 50+ transparency violations
- 2 blur effect violations
- User feedback: "just horrible" usability on mobile

**Success Criteria**:
1. Zero transparency/opacity on interactive components
2. Zero non-8-bit rounded corners on UI elements
3. Zero blur effects on any component
4. ESLint rule blocks future violations
```

### 4.2 Story-Level Change Proposals

#### NEW STORY: 39-01

```markdown
## Story 39-01: Remove Transparency from Agent Selectors

**Epic**: EPIC-39 8-Bit Design Compliance
**Priority**: P0
**Effort**: 2 hours

### OLD (Current State):
```tsx
// UnifiedAgentSelector.tsx line 331
'bg-slate-800/60 hover:bg-slate-700/80',
```

### NEW (Target State):
```tsx
// UnifiedAgentSelector.tsx line 331 - FIXED
'bg-card hover:bg-card/90',
// Or use CSS variable:
'bg-[var(--card)] hover:bg-[var(--secondary)]',
```

### Acceptance Criteria:
- [ ] All agent selector backgrounds use solid colors (100% opacity)
- [ ] Dropdown menus use `bg-card` or CSS variables
- [ ] No `/60`, `/80`, `/50`, `/40` opacity modifiers on interactive elements
- [ ] Visual test: Selector overlays don't show underlying text bleeding through

### Files to Modify:
1. `src/presentation/components/agent/UnifiedAgentSelector.tsx`
2. `src/presentation/components/agent/AgentConfigDialog.tsx`
3. `src/presentation/components/agent/ProviderConfigDialog.tsx`
```

#### NEW STORY: 39-02

```markdown
## Story 39-02: Remove Transparency from Chat Components

**Epic**: EPIC-39 8-Bit Design Compliance
**Priority**: P0
**Effort**: 3 hours

### OLD (Current State):
```tsx
// ChatConversation.tsx - multiple lines
'bg-slate-800/80 border-slate-600'
'bg-slate-900/50'
'bg-slate-900/80'

// MessageSearch.tsx
'bg-slate-900/95'
'bg-slate-800/40'

// StreamdownRenderer.tsx
'bg-slate-800/50'
```

### NEW (Target State):
```tsx
// All chat components
'bg-card border-border'
'bg-background'
'bg-secondary'

// Use CSS variables throughout
'bg-[var(--card)]'
'bg-[var(--secondary)]'
```

### Acceptance Criteria:
- [ ] ChatConversation.tsx uses solid backgrounds only
- [ ] ChatHistory.tsx uses solid backgrounds only
- [ ] MessageSearch.tsx uses solid backgrounds only
- [ ] StreamdownRenderer.tsx code blocks use solid backgrounds
- [ ] ThreadsList.tsx uses solid backgrounds only
- [ ] ConversationCard.tsx uses solid backgrounds only

### Files to Modify:
1. `src/presentation/components/chat/ChatConversation.tsx`
2. `src/presentation/components/chat/ChatHistory.tsx`
3. `src/presentation/components/chat/MessageSearch.tsx`
4. `src/presentation/components/chat/StreamdownRenderer.tsx`
5. `src/presentation/components/chat/ThreadsList.tsx`
6. `src/presentation/components/chat/ConversationCard.tsx`
```

#### NEW STORY: 39-03

```markdown
## Story 39-03: Replace Rounded Corners with Squared (8-bit)

**Epic**: EPIC-39 8-Bit Design Compliance
**Priority**: P0
**Effort**: 3 hours

### OLD (Current State):
```tsx
// Multiple files - 180+ instances
className="rounded-lg ..."
className="rounded-md ..."
className="rounded-xl ..."
className="sm:rounded-lg"
```

### NEW (Target State):
```tsx
// Replace with squared or minimal rounding
className="rounded-[4px] ..."  // Max allowed for 8-bit
className="rounded-none ..."    // Preferred for cards/panels
```

### Acceptance Criteria:
- [ ] Zero `rounded-lg` classes on UI components
- [ ] Zero `rounded-md` classes on UI components (except dropdown-menu.tsx which uses it correctly per shadcn)
- [ ] Zero `rounded-xl` classes anywhere
- [ ] Cards and panels use `rounded-none` or `rounded-[4px]`
- [ ] Buttons may use `rounded-[4px]` maximum

### Files to Modify (Priority Order):
1. `src/presentation/components/ui/dropdown-menu.tsx` - line 43
2. `src/routes/ide.tsx`
3. `src/presentation/components/command-palette/CommandPalette.tsx`
4. `src/presentation/components/about/Header.tsx`
5. All hub components using `rounded-lg`
6. All error boundary components
```

#### NEW STORY: 39-04

```markdown
## Story 39-04: Remove Blur Effects from Hero/Onboarding

**Epic**: EPIC-39 8-Bit Design Compliance
**Priority**: P0
**Effort**: 1 hour

### OLD (Current State):
```tsx
// HeroSection.tsx line 13-14
<div className="... blur-[100px]" />

// Onboarding.tsx line 40
<div className="... blur-[100px] ..." />
```

### NEW (Target State):
```tsx
// Replace with solid gradient or remove entirely
// Option 1: Solid gradient
<div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-primary/30 to-transparent" />

// Option 2: Pixelated glow effect (8-bit style)
<div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 shadow-[0_0_40px_20px_rgba(249,115,22,0.3)]" />
```

### Acceptance Criteria:
- [ ] Zero `blur-[*]` classes anywhere in codebase
- [ ] Zero `backdrop-blur` classes anywhere in codebase
- [ ] HeroSection uses 8-bit compatible glow effect
- [ ] Onboarding uses 8-bit compatible glow effect

### Files to Modify:
1. `src/presentation/components/about/sections/HeroSection.tsx`
2. `src/presentation/components/dashboard/Onboarding.tsx`
```

### 4.3 Modified Stories in EPIC-36

#### MODIFIED STORY: 36-01

```markdown
## Story 36-01: Mobile-responsive IDE layout (REVISED)

**Epic**: EPIC-36 Responsive UX
**Priority**: P1 → P1 (unchanged)
**Effort**: 2h → 4h (+2h for tab navigation)

### ADDITIONAL Acceptance Criteria:
- [ ] Mobile layout uses tab-based navigation (Files | Editor | Terminal | Chat)
- [ ] Each tab shows only ONE panel at full width
- [ ] Tab bar is fixed at bottom (thumb zone)
- [ ] Swipe gestures for tab switching (optional)
- [ ] ResizablePanelGroup is NOT rendered on mobile

### Implementation Pattern:
```tsx
if (isMobile) {
  return (
    <Tabs defaultValue="editor" className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <TabsContent value="files" className="h-full">
          <FileTree />
        </TabsContent>
        <TabsContent value="editor" className="h-full">
          <MonacoEditor />
        </TabsContent>
        <TabsContent value="terminal" className="h-full">
          <Terminal />
        </TabsContent>
        <TabsContent value="chat" className="h-full">
          <ChatPanel />
        </TabsContent>
      </div>
      <TabsList className="border-t bg-background p-1">
        <TabsTrigger value="files" className="min-h-[44px]">
          <FileCode className="h-5 w-5" />
        </TabsTrigger>
        {/* ... other tabs */}
      </TabsList>
    </Tabs>
  );
}
```
```

#### MODIFIED STORY: 36-02

```markdown
## Story 36-02: Mobile-responsive Notes layout (REVISED)

**Epic**: EPIC-36 Responsive UX
**Priority**: P1 → P1 (unchanged)
**Effort**: 1.5h → 3h (+1.5h for tab navigation)

### ADDITIONAL Acceptance Criteria:
- [ ] Mobile layout uses tab-based navigation (Notes | Editor | Chat)
- [ ] Notes list is full-width on "Notes" tab
- [ ] Editor is full-width on "Editor" tab
- [ ] Chat is full-width on "Chat" tab
- [ ] Current note selection persists across tab switches
```

---

## 5. Implementation Handoff

### 5.1 Scope Classification

**MODERATE** - Backlog reorganization needed

**Rationale**:
- Creates new EPIC-39 (6 stories, ~13 hours)
- Modifies 2 stories in EPIC-36 (+3.5 hours)
- Total impact: ~16.5 additional hours
- No fundamental replan required

### 5.2 Handoff Recipients

| Role | Responsibility | Deliverables |
|------|---------------|--------------|
| **Product Owner** | Approve new EPIC-39, prioritize in backlog | Updated backlog, sprint allocation |
| **Scrum Master** | Update sprint-status.yaml, schedule stories | Sprint tracking updates |
| **Dev Team (Frontend)** | Implement Stories 39-01 through 39-06 | Fixed components, passing tests |
| **Dev Team (UX)** | Verify 8-bit compliance visually | Design QA signoff |

### 5.3 Success Criteria for Implementation

1. **Zero Transparency Violations**
   - Automated test: grep for opacity modifiers on interactive elements
   - Manual test: No text bleed-through on any dropdown/menu

2. **Zero Rounded Corner Violations**
   - Automated test: ESLint rule blocks `rounded-lg`, `rounded-xl`
   - Manual test: Visual inspection of all UI components

3. **Zero Blur Violations**
   - Automated test: grep for `blur-` class usage
   - Manual test: No blur effects visible

4. **Mobile Usability Pass**
   - Manual test: All 4 workspaces usable on 375px screen
   - Tab-based navigation functional on mobile

---

## 6. Verification Checklist

### Change Navigation Checklist Status

| Section | Item | Status |
|---------|------|--------|
| 1.1 | Triggering story identified | ✅ Done (User escalation) |
| 1.2 | Core problem defined | ✅ Done (4 violation categories) |
| 1.3 | Evidence gathered | ✅ Done (Code snippets provided) |
| 2.1 | Current epic evaluated | ✅ Done (EPIC-36 impact assessed) |
| 2.2 | Required epic changes documented | ✅ Done (New EPIC-39 proposed) |
| 2.3 | Future epics reviewed | ✅ Done (No epic invalidation) |
| 3.1 | PRD conflicts checked | ✅ N/A (No PRD changes needed) |
| 3.2 | Architecture conflicts checked | ✅ Done (No conflicts) |
| 3.3 | UI/UX conflicts checked | ✅ Done (Implementation violates spec) |
| 4.1 | Option 1 evaluated | ✅ Done (Direct Adjustment - SELECTED) |
| 4.2 | Option 2 evaluated | ✅ Done (Rollback - Not viable) |
| 4.3 | Option 3 evaluated | ✅ Done (MVP Review - Not recommended) |
| 5.1 | Issue summary created | ✅ Done |
| 5.2 | Epic/artifact impact documented | ✅ Done |
| 5.3 | Recommended path presented | ✅ Done |
| 5.4 | PRD MVP impact defined | ✅ N/A (No MVP change) |
| 5.5 | Agent handoff plan established | ✅ Done |

---

## 7. Approval Request

**Sprint Change Proposal Summary:**

| Item | Value |
|------|-------|
| **New Epic Created** | EPIC-39: 8-Bit Design Compliance |
| **New Stories** | 6 stories (39-01 through 39-06) |
| **Modified Stories** | 2 stories (36-01, 36-02) |
| **Additional Effort** | ~16.5 hours |
| **Risk Level** | Low (CSS changes, no logic) |
| **Scope Classification** | MODERATE |

---

**REQUEST FOR APPROVAL:**

Admin, please review this Sprint Change Proposal and indicate:

- **[APPROVE]** - Proceed with creating EPIC-39 and modifying EPIC-36
- **[REVISE]** - Request modifications to the proposal
- **[REJECT]** - Decline the proposed changes

---

## Document Control

| Field | Value |
|-------|-------|
| **Phase** | Implementation (Correct-Course) |
| **Team** | Team A |
| **Agent Mode** | UX Designer (Sally) |
| **Date/Time** | 2026-01-09T17:15:11+07:00 |
| **Workflow** | /bmad-bmm-workflows-correct-course |
| **Output Location** | `_bmad-output/planning-artifacts/sprint-change-proposal-ux-violations-2026-01-09.md` |
