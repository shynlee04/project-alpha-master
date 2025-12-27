# Sprint Change Proposal: Mobile Responsive Transformation

**Date**: 2025-12-28T00:42:53+07:00  
**Sprint ID**: SCP-2025-12-28-MRT  
**Severity**: P1 - High  
**Scope**: MODERATE - Requires UX/UI overhaul without backend changes  
**Author**: BMAD Master Orchestrator + UX Designer  

---

## 1. Issue Summary

### Problem Statement

The BMad Knowledge Synthesis Station (via-gent IDE) is currently **desktop-only**, with a hard-coded minimum viewport requirement of 1024px. This architectural decision:

1. **Limits audience reach** - Excludes all mobile and small tablet users
2. **Blocks usage scenarios** - Users cannot check projects on commute, review code on tablets, or demo to stakeholders on mobile devices
3. **Shows warning overlay** instead of adapting - The `MinViewportWarning` component blocks all access below 1024px

### Evidence

```tsx
// src/components/layout/MinViewportWarning.tsx (Lines 16-30)
<div className="fixed inset-0 bg-background/95 z-50 hidden min-[1024px]:hidden items-center justify-center p-8 text-center max-[1023px]:flex">
  <div>
    <h2>Screen Too Small</h2>
    <p>via-gent IDE requires a minimum viewport width of 1024px.</p>
  </div>
</div>
```

### Core Challenge

The IDE has a **complex multipane layout** with 5+ simultaneous panels (FileTree, Editor, Preview, Terminal, Chat) that cannot simply "reflow" - they require **strategic UX transformation** for mobile.

---

## 2. Current Architecture Audit

### Interface Inventory

| Component | File | Desktop Behavior | Mobile Challenge | Priority |
|-----------|------|------------------|------------------|----------|
| **IDELayout** | `src/components/layout/IDELayout.tsx` | 5-panel resizable layout | Cannot fit on mobile | P0 |
| **MainSidebar** | `src/components/layout/MainSidebar.tsx` | Collapsible desktop sidebar | ✅ Has mobile drawer pattern | P2 |
| **FileTree** | `src/components/ide/FileTree/FileTree.tsx` | Nested tree with small targets | Touch targets too small | P1 |
| **MonacoEditor** | `src/components/ide/MonacoEditor/MonacoEditor.tsx` | Desktop-optimized editor | Keyboard handling issues | P1 |
| **TerminalPanel** | `src/components/layout/TerminalPanel.tsx` | Fixed panel | Virtual keyboard overlap | P1 |
| **ChatPanelWrapper** | `src/components/layout/ChatPanelWrapper.tsx` | Right-side panel | Full-screen modal needed | P1 |
| **PreviewPanel** | `src/components/ide/PreviewPanel/PreviewPanel.tsx` | Iframe preview | Device frame options | P2 |
| **MinViewportWarning** | `src/components/layout/MinViewportWarning.tsx` | Blocks mobile access | Must remove/replace | P0 |
| **Header** | `src/components/Header.tsx` | Desktop header | Hamburger menu needed | P1 |

### Route Inventory

| Route | File | Current Viewport Support |
|-------|------|--------------------------|
| `/` | `src/routes/index.tsx` | Desktop-focused dashboard |
| `/workspace/$projectId` | `src/routes/workspace/$projectId.tsx` | IDELayout, desktop only |
| `/settings` | `src/routes/settings.tsx` | Needs mobile layout |
| `/agents` | `src/routes/agents.tsx` | Needs mobile layout |
| `/hub` | `src/routes/hub.tsx` | Needs mobile layout |
| `/knowledge` | `src/routes/knowledge.tsx` | Needs mobile layout |

### Existing Responsive Patterns (Partial)

The codebase already has some responsive patterns that can be extended:

1. **MainSidebar** has mobile drawer implementation with backdrop
2. **IDELayout** uses `md:flex-row` pattern (line 264)
3. **SidebarContent** uses `hidden md:flex` for tablet+ visibility
4. Design tokens exist for spacing and colors

---

## 3. Impact Analysis

### Epic Impact

| Epic | Status | Mobile Impact |
|------|--------|---------------|
| MVP | IN_PROGRESS | Requires mobile consideration for validation success |
| Epic 23 (UX Modernization) | IN_PROGRESS | Natural fit - responsive is part of modernization |
| Epic 28 (IconSidebar) | COMPLETED | Already has responsive patterns |

### PRD Impact

> **IMPORTANT**: The PRD (Section 3.1) specifies **NFR-USE-04: Keyboard accessibility** but does NOT mention mobile. This proposal suggests adding:
> - **NFR-USE-05: Mobile accessibility** - Full functionality on viewport ≥375px
> - **NFR-COMPAT-05: Mobile Safari/Chrome** - iOS and Android browser support

### Architecture Impact

> **NOTE**: **ZERO backend changes required.**  
> All transformations are frontend-only, using:
> - TailwindCSS responsive utilities
> - React component composition
> - CSS variables for design tokens
> - Existing shadcn/ui components

### UX Design Impact

The `ux-design.md` currently states:

```markdown
**Primary Platform:** Desktop browsers (Chrome 86+, Edge 86+, Safari 15.2+)
**Not Supported:** Mobile browsers (IDE requires desktop viewport)
```

**Proposed Change:**

```markdown
**Primary Platform:** Desktop browsers (Chrome 86+, Edge 86+, Safari 15.2+)
**Secondary Platform:** Mobile browsers (iOS Safari 15+, Chrome Mobile 86+)
  - Tablet (≥768px): Full IDE with adapted layout
  - Phone (≥375px): Focused single-panel mode with navigation
```

---

## 4. Recommended Approach

### Path: **Direct Adjustment with Phased Implementation**

**Rationale**: The existing codebase supports incremental responsive enhancement without requiring rollback or MVP redefinition.

### Transformation Strategy

#### Strategy 1: Tab-Based Panel Navigation (Mobile)

Convert horizontal multipane layout to a **mobile tab bar** with single-panel focus:

```
┌────────────────────────────────────────────┐
│  Header (48px)                             │
├────────────────────────────────────────────┤
│                                            │
│         Single Active Panel                │
│         (Full Height)                      │
│                                            │
│                                            │
├────────────────────────────────────────────┤
│  📁  📝  🖥️  💻  💬                         │ ← Mobile Tab Bar
│  Files Edit Preview Term Chat              │
└────────────────────────────────────────────┘
```

**Implementation Pattern**:
```tsx
// Mobile panel switcher
<div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-sidebar border-t flex justify-around">
  <TabButton icon={Folder} label="Files" active={panel === 'files'} />
  <TabButton icon={Code} label="Edit" active={panel === 'editor'} />
  <TabButton icon={Monitor} label="Preview" active={panel === 'preview'} />
  <TabButton icon={Terminal} label="Term" active={panel === 'terminal'} />
  <TabButton icon={MessageSquare} label="Chat" active={panel === 'chat'} />
</div>
```

#### Strategy 2: Bottom Sheet Pattern (Chat/Terminal)

On mobile, Chat and Terminal should use a **bottom sheet drawer** pattern:

```tsx
// Bottom sheet implementation for mobile terminal
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" className="md:hidden">
      <Terminal className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="h-[60vh]">
    <TerminalPanel />
  </SheetContent>
</Sheet>
```

#### Strategy 3: Full-Screen Panel Mode

For complex panels like Monaco Editor, provide full-screen mode on mobile:

```tsx
<Button 
  variant="ghost" 
  className="md:hidden"
  onClick={() => setFullscreen(!fullscreen)}
>
  <Maximize2 className="h-4 w-4" />
</Button>
```

---

## 5. Proposed Changes

### Component-Level Specifications

---

### [MODIFY] MinViewportWarning.tsx

**Current**: Blocks all access below 1024px  
**Proposed**: Remove or convert to informational toast for <375px only

```diff
- <div className="fixed inset-0 bg-background/95 z-50 hidden min-[1024px]:hidden ...">
-   <h2>Screen Too Small</h2>
-   <p>via-gent IDE requires a minimum viewport width of 1024px.</p>
- </div>
+ // Remove component or convert to 375px minimum warning
+ // Mobile experience now fully supported
```

---

### [NEW] MobileTabBar.tsx

New component for mobile panel navigation with touch-friendly targets.

---

### [NEW] MobileIDELayout.tsx

New layout variant for mobile with single-panel display mode.

---

### [MODIFY] IDELayout.tsx

Add responsive branching to use mobile layout on smaller viewports.

---

### [NEW] useMediaQuery.ts

New hook for responsive detection.

---

### [MODIFY] styles.css

Add mobile design tokens including touch targets and safe area insets.

---

## 6. Implementation Roadmap

### Epic: Mobile Responsive Transformation

| Story ID | Title | Priority | Effort |
|----------|-------|----------|--------|
| MRT-1 | Remove Viewport Block | P0 | 0.5 day |
| MRT-2 | Create Mobile Tab Bar | P0 | 1 day |
| MRT-3 | Implement Mobile IDE Layout | P0 | 1.5 days |
| MRT-4 | Mobile FileTree Adaptation | P1 | 1 day |
| MRT-5 | Mobile Editor Optimization | P1 | 1 day |
| MRT-6 | Bottom Sheet Panels | P1 | 1 day |
| MRT-7 | Tablet Layout Optimization | P2 | 1 day |
| MRT-8 | Testing & Verification | P2 | 1 day |

**Total Effort**: 8 days

---

## 7. Implementation Handoff

### Scope Classification: **MODERATE**

### Route to: UX Designer + Dev Team

### Handoff Recipients:
1. **BMAD UX Designer Agent**: Create mobile wireframes and component specs
2. **BMAD Dev Agent**: Implement responsive components
3. **BMAD TEA Agent**: Create mobile-specific test cases

### Success Criteria:
1. Application fully functional on 375px+ viewports
2. Touch targets meet WCAG 2.5.5 (≥44px)
3. No mobile warning/block overlays
4. All existing tests pass (desktop regression)
5. Core journeys work on mobile:
   - Open project → View files → Edit code → Preview
   - Chat with AI agent
   - Run terminal commands

---

## Approval Status

**Status**: PENDING USER REVIEW  
**Requested Action**: Review and approve this Sprint Change Proposal

---

*Generated via BMAD correct-course workflow - 2025-12-28*
