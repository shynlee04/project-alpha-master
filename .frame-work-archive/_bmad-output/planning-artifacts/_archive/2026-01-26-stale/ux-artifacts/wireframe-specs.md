# Wireframe Specifications
**Generated:** 2026-01-07
**Project:** Via-Gent (Project Alpha v2.0)
**description:** Visual layout specifications for key UI screens
**Status:** Complete

---

## Table of Contents

1. [Layout Structures](#1-layout-structures)
2. [IDE Workspace Wireframes](#2-ide-workspace-wireframes)
3. [Knowledge Workspace Wireframes](#3-knowledge-workspace-wireframes)
4. [Notes Workspace Wireframes](#4-notes-workspace-wireframes)
5. [Study Workspace Wireframes](#5-study-workspace-wireframes)
6. [Modal & Overlay Specifications](#6-modal--overlay-specifications)
7. [Mobile Adaptations](#7-mobile-adaptations)

---

## 1. Layout Structures

### Desktop Layout Grid

```
┌─────────────────────────────────────────────────────────────┐
│ Header Bar (48px)                                            │
│ ┌────┬─────────────────────┬──────────────────────────────┐ │
│ │Logo│ Breadcrumbs / Title │ Search | Settings | Profile  │ │
│ └────┴─────────────────────┴──────────────────────────────┘ │
├──────┬──────────────────────────────────────────────────────┤
│      │ Main Content Area (calc(100vh - 48px - 24px))       │
│ Icon  │ ┌──────────────────┬─────────────────────────────┐  │
│ Bar   │ │ Sidebar/Panel     │ Primary Content             │  │
│ (48px)│ │ (Variable width) │ (Remaining width)            │  │
│       │ └──────────────────┴─────────────────────────────┘  │
│       │ ┌─────────────────────────────────────────────────┐  │
│       │ │ Secondary Content / Footer                      │  │
│       │ └─────────────────────────────────────────────────┘  │
├──────┴──────────────────────────────────────────────────────┤
│ Status Bar (24px)                                            │
│ │ Branch | Git Status | Agent: Name | Language | Encoding  │ │
└─────────────────────────────────────────────────────────────┘
```

**Dimensions:**
- Header Bar: 48px height
- Icon Bar: 48px width
- Status Bar: 24px height
- Main Content: `calc(100vh - 72px)` height

**Responsive Behavior:**
- Desktop (1024px+): Full layout
- Tablet (768px-1023px): Icon bar → Bottom nav (48px)
- Mobile (<768px): Single column, bottom nav (48px)

---

## 2. IDE Workspace Wireframes

### IDE Layout (Desktop)

```
┌────┬─────────────────────────────────────────────────────────┐
│Logo│ src/project-alpha-master/src/components/Button.tsx  × │
├────┼─────────────────────────────────────────────────────────┤
│ 🏠 │ ┌────────────┬──────────────────────────────────────┐  │
│ 💻 │ │ File Tree  │ Monaco Editor                        │  │
│ 📚 │ │            │ ┌────────────────────────────────┐   │  │
│ 📝 │ │ 📁 src     │ │ import { Button } from ...      │   │  │
│ 🎓 │ │ ├─ 📁 cmps │ │                                  │   │  │
│ ⚙️ │ │ │ ├─ Btn  │ │ export const Button = ({...}) => │   │  │
│    │ │ │ └─ Crd  │ │   return (                        │   │  │
├────┤ │ └─ 📁 lib  │ │     <button                      │   │  │
│Term│ │            │ │       className={...}            │   │  │
│    │ │ 🔍 Search │ │       onClick={onClick}          │   │  │
│    │ │ └──────────┘ │       >                          │   │  │
│    │ │              │       {children}                 │   │  │
│    │ │ ┌──────────┐ │       </button>                  │   │  │
│    │ │ │ Preview  │ │   );                           │   │  │
│    │ │ └──────────┘ │ }                              │   │  │
│    │ │              │ └────────────────────────────────┘   │  │
├────┤ │              │ Line 12, Col 45                   │      │
│$   │ │              ├──────────────────────────────────────┤  │
│    │ │              │ 💬 Agent Chat                      │  │
│    │ │              │ ┌──────────┬──────────────────────┐  │  │
│    │ │              │ │ Threads  │ Chat                  │  │  │
│    │ │              │ ├──────────┤ ┌──────────────────┐ │  │  │
│    │ │              │ │ Thread 1 │ │ User: How do I...  │ │  │  │
│    │ │              │ │ Thread 2 │ │                  │ │  │  │
└────┴─┴──────────────┴──────────┤ │ 🤖: To create... │ │  │  │
                                 │ │                  │ │  │  │
                                 │ │ [Input] [Send ↑]  │ │  │  │
                                 │ └──────────────────┘ │  │  │
                                 └──────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Panel Sizes:**
- File Tree: 200px (resizable, min 150px, max 400px)
- Monaco Editor: Remaining width
- Preview Panel: 40% (resizable, min 20%, max 80%)
- Terminal: 30% height (resizable, min 100px)
- Agent Chat: 25% width (resizable, min 200px, max 400px)

### Terminal Panel

```
┌─────────────────────────────────────────────────────────────┐
│ Terminal                                          [+] [×]    │
├─────────────────────────────────────────────────────────────┤
│ $ npm install                                               │
│ ✔ react@18.3.1 installed                                   │
│ ✔ react-dom@18.3.1 installed                               │
│ ✔ 127 packages installed in 12.3s                          │
│                                                             │
│ $ npm run dev                                               │
│ ➜ Local: http://localhost:3000                            │
│ ➜ Network: http://192.168.1.100:3000                      │
│                                                             │
│ $ █                                                         │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Tab bar: Multiple terminals
- Close button: × (hover only)
- Add button: + (new terminal)
- Command history: ↑/↓ arrows
- Scroll: Auto-scroll on output

---

## 3. Knowledge Workspace Wireframes

### Knowledge Canvas Layout

```
┌────┬─────────────────────────────────────────────────────────┐
│Logo│ Knowledge Base                  [Search] [Add Source]     │
├────┼───────────────────────┬─────────────────────────────────┤
│ 🏠 │ Sources (30%)         │ Canvas (70%)                   │
│ 💻 │ ┌───────────────────┐ │ ┌─────────────────────────────┐ │
│ 📚 │ │ 📁 PDF Files       │ │ │ ┌─────────┐  ┌─────────┐    │ │
│ 📝 │ │ ├── Guide.pdf     │─┼─┼─┤│ Card 1  │──│ Card 2  │    │ │
│ 🎓 │ │ ├── Notes.pdf     │ │ │ └─────────┘  └─────────┘    │ │
│ ⚙️ │ │ └─────────────────│ │ │                             │ │
│    │ │                    │ │ │     ┌─────────────────────┐  │ │
├────┤ │ 📁 URLs            │ │ └─────┤ Connections         │  │ │
│Term│ │ ├── blog.dev       │─┼──────┤ (Auto-generated)     │  │ │
│    │ │ └──────────────────│ │      │                     │  │ │
│    │ │                    │ │      └─────────────────────┘  │ │
├────┤ └───────────────────┘ │                             │ │
│    │                       │ [Zoom In] [Zoom Out] [Fit]     │ │
│    │                       ├─────────────────────────────────┤ │
│    │                       │ 💬 RAG Chat                   │ │
│    │                       │ ┌─────────────────────────────┐ │ │
│    │                       │ │ Summarize Guide.pdf        │ │ │
│    │                       │ │ [Input] [Send ↑]           │ │ │
│    │                       │ └─────────────────────────────┘ │ │
└────┴───────────────────────┴─────────────────────────────────┘
```

**Source List:**
- Width: 30% (resizable, min 200px, max 400px)
- Tree view: Folders + files
- Icons: PDF, URL, Text badges
- Actions: Click to select, × to remove

**Canvas:**
- Width: Remaining space
- Cards: Draggable (300px × 200px)
- Connections: Bezier curves
- Zoom: Mouse wheel, pinch (mobile)
- Pan: Click + drag, two-finger drag (mobile)

---

## 4. Notes Workspace Wireframes

### Notes Editor Layout

```
┌────┬─────────────────────────────────────────────────────────┐
│Logo│ Notes                        [New Note] [Search]          │
├────┼───────────────────────────┬─────────────────────────────┐
│ 🏠 │ Note List (250px)         │ BlockNote Editor            │
│ 💻 │ ┌─────────────────────┐  │                             │
│ 📚 │ │ Meeting Notes        │  │ # Meeting Notes              │
│ 📝 │ ├─────────────────────┤  │ ─────────────────────────── │
│ 🎓 │ │ 📝 Quick Notes       │  │                             │
│ ⚙️ │ │   2 min ago          │  │ - Discussed Q1 goals        │
│    │ ├─────────────────────┤  │ - Action items:              │
│    │ │ 📝 Project Ideas     │  │   - [ ] Review metrics      │
├────┤ │   1 hour ago         │  │   - [ ] Schedule follow-up  │
│Term│ ├─────────────────────┤  │                             │
│    │ │ 📝 Research Notes    │  │ ## Action Items              │
│    │ │   Yesterday          │  │                             │
│    │ └─────────────────────┘  │ 1. Finalize Q2 roadmap       │
│    │                           │ 2. Review team capacity      │
│    │                           │ 3. Schedule stakeholder mtg │
└────┴───────────────────────────┴─────────────────────────────┘
```

**Note List:**
- Cards: Title + preview + timestamp
- Sort: Date modified, alphabetically
- Filter: Tag search, text search
- Actions: Click to open, × to delete

**BlockNote Editor:**
- Slash commands: Type `/` for menu
- Formatting: Bold, italic, code, lists
- AI actions: `/summarize`, `/expand`, `/rewrite`
- Toolbar: Formatting buttons (top)

---

## 5. Study Workspace Wireframes

### Flashcard Study Layout

```
┌────┬─────────────────────────────────────────────────────────┐
│Logo│ Study Workspace         [Decks] [Quizzes] [Analytics]    │
├────┼───────────────────────────┬─────────────────────────────┐
│ 🏠 │ Deck Selector (30%)      │ Card View (70%)             │
│ 💻 │ ┌─────────────────────┐  │                             │
│ 📚 │ │ JavaScript Deck      │  │     ┌─────────────────────┐│
│ 📝 │ ├─────────────────────┤  │     │ What is a closure?   ││
│ 🎓 │ │ ├── Basics (20)      │  │     │                     ││
│ ⚙️ │ │ ├── Functions (15)   │  │     │ [Flip to see answer] ││
│    │ │ └── Arrays (10)      │  │     └─────────────────────┘│
├────┤ │                        │  │                             │
│Term│ │ React Deck             │  │ Progress: 12/45 cards (27%) │
│    │ │ ├── Components (25)   │  │ ━━━━━━━━━━━━━━━━━━━━━━━━ │
│    │ │ └── Hooks (18)        │  │                             │
│    │ │                        │  │ [Easy] [Medium] [Hard] [Skip]│
└────┴─┴────────────────────────┴─────────────────────────────┘
```

**Card View:**
- Centered card: 600px × 400px
- Front side: Question / prompt
- Back side: Answer / explanation
- Flip button: Full card clickable
- Rating buttons: Below card (44px min-height)

### Quiz Interface

```
┌─────────────────────────────────────────────────────────────┐
│ Quiz: JavaScript Basics                     Question 5/20    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ What is the correct way to create a function in JavaScript?│
│                                                             │
│ ○ function myFunc() { }                                    │
│ ○ const myFunc = function() { }                            │
│ ○ const myFunc = () => { }                                 │
│ ○ All of the above                                         │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Previous Question]              [Submit Answer]        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                    ↓ (After submit)

┌─────────────────────────────────────────────────────────────┐
│ ✅ Correct!                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ All of the options shown are valid ways to create functions │
│ in JavaScript. Function declarations and function expressions│
│ are both valid, with arrow functions being introduced in ES6│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Next Question]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Modal & Overlay Specifications

### Dialog Modal

```
┌─────────────────────────────────────────────────────────────┐
│                                                           │
│   ┌───────────────────────────────────────────────────┐    │
│   │ Dialog Title                              [×]       │    │
│   ├───────────────────────────────────────────────────┤    │
│   │                                                   │    │
│   │ Dialog description goes here. This provides        │    │
│   │ context and information about the dialog's        │    │
│   │ description and content.                              │    │
│   │                                                   │    │
│   │ [Form content or additional information]          │    │
│   │                                                   │    │
│   ├───────────────────────────────────────────────────┤    │
│   │                       [Cancel] [Confirm]           │    │
│   └───────────────────────────────────────────────────┘    │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

**Dimensions:**
- Max-width: 500px (desktop), 100% (mobile)
- Max-height: 85vh
- Padding: 24px
- Border radius: `radius-md` (4px)
- Shadow: `shadow-pixel`
- Overlay: `bg-black/80` (80% opacity black)

### Bottom Sheet (Mobile)

```
┌─────────────────────────────────────────────────────────────┐
│                                                           │
│                        (Content above)                     │
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Sheet Title                                    [×]    │ │
│ ├───────────────────────────────────────────────────────┤ │
│ │                                                        │ │
│ │ Sheet content goes here. Slides up from bottom of     │ │
│ │ screen on mobile.                                     │ │
│ │                                                        │ │
│ │ [Action Button]                                       │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

**Mobile Specifications:**
- Width: 100%
- Max-height: 85vh
- Animation: Slide up (300ms)
- Handle: Drag bar at top (optional)
- Close: Swipe down or tap outside

### Tooltip

```
                      ┌────────────────────┐
                      │ Tooltip text       │
                      └────────▲───────────┘
                              │
    [Hovered element]────────┘
```

**Specifications:**
- Delay: 150ms (hover), 0ms (focus)
- Duration: Auto-hide after 5s
- Max-width: 200px
- Position: Top, right, bottom, left
- Arrow: Optional triangle indicator

---

## 7. Mobile Adaptations

### Bottom Navigation (Mobile)

```
┌─────────────────────────────────────────────────────────────┐
│ Header Bar (48px)                                            │
│ ┌────┬─────────────────────┬──────────────────────────────┐ │
│ │Logo│ Breadcrumbs / Title │ Search | Settings            │ │
│ └────┴─────────────────────┴──────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Main Content Area (calc(100vh - 48px - 48px - 24px))       │
│                                                             │
│ [Workspace content...                                      │
│  - Single column layout                                    │
│  - Full-width components                                   │
│  - 44px minimum touch targets]                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Bottom Navigation (48px)                                    │
│ ┌────┬────┬────┬────┬────┐                                 │
│ │ 🏠 │ 💻 │ 📚 │ 📝 │ 🎓 │                                 │
│ └────┴────┴────┴────┴────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Height: 48px (fixed)
- Icons: 24px (centered)
- Labels: Hidden (show on active only)
- Active: Orange background (`bg-primary`)
- Touch targets: 44px × 44px (each item)

### Mobile Drawer (Side Panels)

```
┌─────────────────────────────────────────────────────────────┐
│ Header Bar                                                  │
├─────────────────────────────────────────────────────────────┤
│ Main Content (dimmed)                                      │
│ ┌────────────────────┬───────────────────────────────────┐  │
│ │                    │                                   │  │
│ │ Drawer Panel       │                                   │  │
│ │ (80% width)        │                                   │  │
│ │                    │                                   │  │
│ │ [Drawer content]   │                                   │  │
│ │                    │                                   │  │
│ │                    │                                   │  │
│ └────────────────────┴───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Width: 80% (max 400px)
- Animation: Slide from left/right
- Overlay: `bg-black/50` (tap to close)
- Close: Swipe or tap outside
- Z-index: 50 (above content)

---

## Component Spacing Matrix

| Component | Padding | Margin | Gap | Notes |
|-----------|---------|--------|-----|-------|
| Button | `p-4` (16px) | `m-2` (8px) | - | Min 44px height |
| Input | `p-3` (12px) | `m-2` (8px) | - | 16px font size |
| Card | `p-4` (16px) | `m-4` (16px) | - | Responsive |
| Dialog | `p-6` (24px) | - | - | Max 500px width |
| Sheet | `p-6` (24px) | - | - | 100% width (mobile) |
| List Item | `p-4` (16px) | - | `gap-4` (16px) | Between items |
| Form Group | - | `mb-4` (16px) | - | Between fields |
| Section | `p-6` (24px) | `mb-8` (32px) | - | Major sections |
| Navbar | `px-4` (16px) | - | `gap-4` (16px) | Between items |
| Toolbar | `p-2` (8px) | - | `gap-2` (8px) | Compact spacing |

---

**END OF WIREFRAME SPECIFICATIONS**
