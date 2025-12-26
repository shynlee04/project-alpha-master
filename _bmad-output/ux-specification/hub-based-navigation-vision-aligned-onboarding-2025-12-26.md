# Hub-Based Navigation & Vision-Aligned Onboarding UX Specification

**Document ID**: UX-SPEC-HUB-001
**Created**: 2025-12-26T12:00:00Z
**Status**: Design Complete
**Author**: UX Designer Agent (@bmad-bmm-ux-designer)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Design Goals](#design-goals)
4. [Navigation Architecture](#navigation-architecture)
5. [Component Specifications](#component-specifications)
6. [Visual Design](#visual-design)
7. [Accessibility Requirements](#accessibility-requirements)
8. [Internationalization](#internationalization)
9. [Implementation Notes](#implementation-notes)

---

## Executive Summary

This specification defines a hub-based navigation system with vision-aligned onboarding for Via-gent. The redesign addresses critical issues with the current generic onboarding approach and provides a cohesive navigation experience that communicates Via-gent's true value proposition as a powerhouse of agentic workstations for multiple professions.

**Key Changes**:
- Replace generic "Welcome to Via-gent" slides with topic-based value proposition cards
- Create collapsible main sidebar with icon-only navigation
- Center project management as primary workspace
- Provide seamless navigation between workspaces (IDE, Agents, Knowledge Synthesis, Settings)
- Apply 8-bit design system throughout with warm gradients for topic cards

---

## Problem Statement

### Current Issues

1. **Generic Onboarding Fails to Communicate Vision**
   - Current onboarding teaches users nothing about Via-gent's true vision
   - Super inferior designs that are not interactive or engaging
   - No clear intentions communicated to different audiences

2. **No Clear Value Propositions**
   - Doesn't communicate pitch to investors
   - Doesn't capture community via open-source and client-side project
   - Doesn't show wide-reaching appeal to other professions (not just tech)
   - Doesn't showcase powerhouse of agentic workstations with personalized workspaces
   - Doesn't center everything into a hub

3. **Navigation Inconsistencies**
   - No unified navigation patterns across sections
   - Disruptive workflows when switching between workspaces
   - Missing breadcrumbs and navigation history

---

## Design Goals

### Primary Goals

1. **Vision-Aligned Onboarding**
   - Topic-based cards that communicate clear value propositions
   - Each audience segment sees relevant content
   - Interactive and engaging design

2. **Hub-Based Navigation**
   - Collapsible main sidebar with icon-only navigation
   - Persistent state (remember collapsed/expanded)
   - Smooth collapse/expand animations

3. **Centered Project Management**
   - Home page centers on project management as primary workspace
   - Clear visual hierarchy: Project management > Other workspaces
   - Easy access to recent projects
   - Project templates (starter kits)

4. **Ease of Mind Navigation**
   - Clear visual signposting for each section
   - Consistent navigation patterns across all tabs
   - Quick access to related features (no disruptive workflows)
   - Breadcrumbs showing current location
   - Back/forward navigation history

5. **8-bit Design System**
   - Apply all design tokens from design system
   - No hard-coded values (all use CSS variables)
   - CVA patterns for component variants
   - Warm gradients (orange, coral, teal) for topic cards to differentiate from IDE aesthetic

6. **Accessibility & i18n**
   - WCAG AA compliance for all components
   - Keyboard navigation (Tab, Enter, Arrow keys)
   - ARIA labels and roles
   - English + Vietnamese support for all user-facing text

---

## Navigation Architecture

### Navigation Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  Via-gent Hub                                           │
├─────────────────────────────────────────────────────────────┤
│  [Sidebar Collapsed]              [Main Content Area]     │
│  ┌──────────┐               ┌─────────────────────┐    │
│  │ Home     │               │  Topic Cards       │    │
│  │ IDE       │               │  Recent Projects   │    │
│  │ Agents    │               │  Quick Actions    │    │
│  │ Knowledge │               │  Portal Cards     │    │
│  │ Settings  │               └─────────────────────┘    │
│  └──────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

### Navigation States

1. **Home Hub** (Default)
   - Topic-based onboarding cards
   - Recent projects section
   - Quick actions
   - Portal cards to other workspaces

2. **IDE Workspace**
   - Full IDE interface (editor, terminal, file tree, preview)
   - Project management centered
   - File operations and agent tools

3. **Agent Management Center**
   - Configure agents
   - Manage credentials
   - Orchestrate workflows
   - Agent chat panels

4. **Knowledge Synthesis Hub** (Future)
   - Visual knowledge canvas
   - Source cards
   - AI synthesis features

5. **Settings Tab**
   - Preferences
   - Language selection
   - Theme settings
   - Keyboard shortcuts

---

## Component Specifications

### 1. HubSidebar (Main Collapsible Sidebar)

**Purpose**: Collapsible main sidebar navigation with icon-only buttons

**Props Interface**:
```typescript
interface HubSidebarProps {
  /** Currently active navigation section */
  activeSection: 'home' | 'ide' | 'agents' | 'knowledge' | 'settings';
  /** Callback when section changes */
  onSectionChange: (section: HubSidebarProps['activeSection']) => void;
  /** Optional CSS classes */
  className?: string;
}
```

**Features**:
- Collapsible sidebar (icon-only when collapsed)
- Persistent state via localStorage
- Smooth collapse/expand animations (200ms ease-in-out)
- Keyboard accessible (Tab to focus, Enter to toggle)
- ARIA labels for all navigation items
- Visual active state indicator
- Tooltip on hover for collapsed state

**Variants** (CVA):
```typescript
const sidebarVariants = cva(
  'flex flex-col border-r transition-all duration-200 ease-in-out',
  {
    variants: {
      state: {
        expanded: 'w-64',
        collapsed: 'w-16',
      },
      theme: {
        dark: 'bg-neutral-900 border-neutral-800',
        light: 'bg-neutral-100 border-neutral-200',
      },
    },
  }
);
```

**ASCII Mockup**:
```
┌─────────────────────────────────────┐
│  [Home]   ← Active indicator   │
│  [IDE]                        │
│  [Agents]                     │
│  [Knowledge]                   │
│  [Settings]                    │
│                                │
│  [⟵] ← Collapse toggle        │
└─────────────────────────────────────┘
     ↑ Expanded (64px)   ↑ Collapsed (64px)
```

---

### 2. TopicCard (Topic-Based Onboarding Card)

**Purpose**: Card component displaying value proposition for specific audience segment

**Props Interface**:
```typescript
interface TopicCardProps {
  /** Unique identifier for topic */
  id: string;
  /** Topic title */
  title: string;
  /** Topic description */
  description: string;
  /** Topic icon */
  icon: React.ReactNode;
  /** Gradient colors for card background */
  gradientFrom: string;
  gradientTo: string;
  /** Quick action button text */
  actionLabel: string;
  /** Callback when action button clicked */
  onActionClick: () => void;
  /** Optional badge count */
  badge?: number;
  /** Optional CSS classes */
  className?: string;
}
```

**Features**:
- Warm gradient background (orange, coral, teal)
- Filled, colorful icon for higher visibility
- Modern sans-serif typography
- Larger sizes for readability
- Hover lift animation (scale-105, shadow-lg)
- Smooth purposeful transitions

**Variants** (CVA):
```typescript
const topicCardVariants = cva(
  'relative overflow-hidden rounded-lg border-2 transition-all duration-300 ease-out',
  {
    variants: {
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      gradient: {
        orange: 'from-orange-500 to-amber-600 border-orange-400',
        coral: 'from-rose-500 to-pink-600 border-rose-400',
        teal: 'from-teal-500 to-cyan-600 border-teal-400',
        purple: 'from-purple-500 to-violet-600 border-purple-400',
      },
    },
  }
);
```

**ASCII Mockup**:
```
┌───────────────────────────────────────────┐
│  ╱▔╲  AI-Powered Development       │
│  ║  ║                                │
│  │  │  Code anywhere, anytime with AI  │
│  │  │  assistance. No installation     │
│  │  │  required.                     │
│  │  │                                │
│  │  │  [Start Coding →]              │
│  ╚═╝                                │
│    ↑ Gradient background (orange)         │
└───────────────────────────────────────────┘
```

---

### 3. TopicPortalCard (Portal Card for Workspaces)

**Purpose**: Portal card for navigating between workspaces

**Props Interface**:
```typescript
interface TopicPortalCardProps {
  /** Unique identifier for portal */
  id: string;
  /** Portal title */
  title: string;
  /** Portal description */
  description: string;
  /** Portal icon */
  icon: React.ReactNode;
  /** Target workspace path */
  to: string;
  /** Optional badge count */
  badge?: number;
  /** Optional CSS classes */
  className?: string;
}
```

**Features**:
- Clean, minimal design
- Hover lift animation
- Arrow indicator for navigation
- Badge for notifications (optional)
- Keyboard accessible

**Variants** (CVA):
```typescript
const portalCardVariants = cva(
  'relative p-6 rounded-lg border-2 bg-card transition-all duration-300 ease-out hover:shadow-lg hover:scale-105',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
  }
);
```

**ASCII Mockup**:
```
┌───────────────────────────────────────────┐
│  [📁]  IDE Workspace               → │
│                                   │
│  Full IDE interface with editor,      │
│  terminal, file tree, and preview.   │
│                                   │
│  3 open projects                   │
└───────────────────────────────────────────┘
```

---

### 4. HubHomePage (Home Page with Topic-Based Onboarding)

**Purpose**: Home page with topic-based onboarding and project management centering

**Props Interface**:
```typescript
interface HubHomePageProps {
  /** Optional CSS classes */
  className?: string;
}
```

**Features**:
- Topic-based onboarding cards (5 topics)
- Recent projects section (centered)
- Quick actions (New Project, Open Folder, Configure Agents)
- Portal cards to other workspaces
- Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
- Clear visual hierarchy

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│  Via-gent Hub - Welcome Back                           │
├─────────────────────────────────────────────────────────────┤
│  Topic Cards (Value Propositions)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ AI-Powered │  │ Privacy-  │  │ Classroom │  │
│  │ Development│  │ First     │  │ Ready     │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐                      │
│  │ Knowledge │  │ Agent     │                      │
│  │ Synthesis │  │ Orchestration│                   │
│  └──────────┘  └──────────┘                      │
├─────────────────────────────────────────────────────────────┤
│  Recent Projects (Centered)                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │  📁 my-app (Last edited: 2h ago)       │  │
│  │  📁 blog-platform (Last edited: 1d ago)     │  │
│  │  📁 portfolio (Last edited: 3d ago)        │  │
│  │  [+ New Project]                             │  │
│  └────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Portal Cards (Navigate to Workspaces)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ IDE       │  │ Agents    │  │ Settings  │  │
│  │ Workspace │  │ Center     │  │           │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. NavigationBreadcrumbs (Breadcrumbs for Navigation)

**Purpose**: Display current location with navigation history

**Props Interface**:
```typescript
interface NavigationBreadcrumbsProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Callback when breadcrumb clicked */
  onItemClick?: (item: BreadcrumbItem) => void;
  /** Optional CSS classes */
  className?: string;
}

interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Optional link path */
  href?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Optional icon */
  icon?: React.ReactNode;
}
```

**Features**:
- Visual signposting of current location
- Clickable breadcrumbs for navigation
- Separator between items
- Truncate long labels
- Keyboard accessible

**Variants** (CVA):
```typescript
const breadcrumbsVariants = cva(
  'flex items-center text-sm',
  {
    variants: {
      theme: {
        dark: 'text-neutral-400',
        light: 'text-neutral-600',
      },
    },
  }
);
```

**ASCII Mockup**:
```
Home  >  Projects  >  my-app  >  src  >  components
```

---

## Visual Design

### Color Palette

**Topic Card Gradients** (Warm, inviting colors):
- **Orange**: `from-orange-500 to-amber-600` (AI-Powered Development)
- **Coral**: `from-rose-500 to-pink-600` (Privacy-First Workspace)
- **Teal**: `from-teal-500 to-cyan-600` (Classroom-Ready IDE)
- **Purple**: `from-purple-500 to-violet-600` (Knowledge Synthesis Hub)
- **Blue**: `from-blue-500 to-indigo-600` (Agent Orchestration Center)

**8-bit IDE Colors** (from design system):
- Primary: `--color-primary-500` (#5e73ff)
- Neutral backgrounds: `--color-neutral-950` (#09090b)
- Borders: `--color-neutral-800` (#27272a)

### Typography

**Topic Cards**:
- Title: `text-2xl font-bold` (24px)
- Description: `text-base font-medium` (16px)
- Action button: `text-sm font-semibold` (14px)

**Navigation**:
- Sidebar labels: `text-xs font-medium` (12px)
- Breadcrumbs: `text-sm font-medium` (14px)

### Spacing

**Topic Cards**:
- Padding: `p-6` (24px)
- Gap between cards: `gap-6` (24px)

**Navigation**:
- Sidebar item height: `h-12` (48px)
- Breadcrumb gap: `gap-2` (8px)

### Animations

**Transitions**:
- Sidebar collapse/expand: `transition-all duration-200 ease-in-out`
- Topic card hover: `transition-all duration-300 ease-out`
- Portal card hover: `transition-all duration-300 ease-out`

**Hover Effects**:
- Topic cards: `hover:scale-105 hover:shadow-lg`
- Portal cards: `hover:scale-105 hover:shadow-lg`
- Sidebar items: `hover:bg-accent hover:text-foreground`

---

## Accessibility Requirements

### WCAG AA Compliance

**Color Contrast**:
- Topic card text on gradients: Minimum 4.5:1 contrast ratio
- Navigation text on backgrounds: Minimum 4.5:1 contrast ratio
- Active state indicators: Minimum 3:1 contrast ratio

**Keyboard Navigation**:
- Tab to focus navigation items
- Enter/Space to activate
- Arrow keys for navigation within lists
- Escape to close/exit

**Focus Management**:
- Visible focus indicators (2px ring)
- Focus trap within navigation
- ARIA current page indicators

**ARIA Labels**:
- All navigation items have `aria-label`
- Active items have `aria-current="page"`
- Collapsible sidebar has `aria-expanded`

**Screen Reader Support**:
- Meaningful labels for all interactive elements
- Status announcements for state changes
- Hidden decorative elements (`aria-hidden="true"`)

---

## Internationalization

### Translation Keys

**English (en.json)**:
```json
{
  "hub": {
    "home": "Home",
    "ide": "IDE Workspace",
    "agents": "Agent Management",
    "knowledge": "Knowledge Synthesis",
    "settings": "Settings",
    "sidebar": {
      "expand": "Expand sidebar",
      "collapse": "Collapse sidebar"
    }
  },
  "topic": {
    "aiPoweredDev": {
      "title": "AI-Powered Development",
      "description": "Code anywhere, anytime with AI assistance. No installation required.",
      "action": "Start Coding"
    },
    "privacyFirst": {
      "title": "Privacy-First Workspace",
      "description": "100% client-side, zero-server IDE. Your code never leaves the browser.",
      "action": "Explore Privacy"
    },
    "classroomReady": {
      "title": "Classroom-Ready IDE",
      "description": "Teach coding 3x more effectively. Zero setup for bootcamps.",
      "action": "Start Teaching"
    },
    "knowledgeSynthesis": {
      "title": "Knowledge Synthesis Hub",
      "description": "Transform scattered knowledge into living, interactive wisdom.",
      "action": "Explore Knowledge"
    },
    "agentOrchestration": {
      "title": "Agent Orchestration Center",
      "description": "Teams of fully-aware agents managing your projects and workflows.",
      "action": "Configure Agents"
    }
  },
  "projects": {
    "recent": "Recent Projects",
    "new": "New Project",
    "openFolder": "Open Folder",
    "lastEdited": "Last edited"
  },
  "portal": {
    "ideWorkspace": "IDE Workspace",
    "agentCenter": "Agent Management Center",
    "knowledgeHub": "Knowledge Synthesis Hub",
    "settings": "Settings"
  },
  "breadcrumbs": {
    "home": "Home",
    "projects": "Projects",
    "workspace": "Workspace"
  }
}
```

**Vietnamese (vi.json)**:
```json
{
  "hub": {
    "home": "Trang chủ",
    "ide": "Không gian làm việc IDE",
    "agents": "Quản lý tác nhân AI",
    "knowledge": "Tổng hợp kiến thức",
    "settings": "Cài đặt",
    "sidebar": {
      "expand": "Mở rộng thanh bên",
      "collapse": "Thu gọn thanh bên"
    }
  },
  "topic": {
    "aiPoweredDev": {
      "title": "Phát triển có hỗ trợ AI",
      "description": "Lập trình mọi lúc mọi nơi với sự hỗ trợ của AI. Không cần cài đặt.",
      "action": "Bắt đầu lập trình"
    },
    "privacyFirst": {
      "title": "Không gian làm việc ưu tiên quyền riêng tư",
      "description": "IDE 100% phía client, không máy chủ. Mã của bạn không bao giờ rời khỏi trình duyệt.",
      "action": "Khám phá quyền riêng tư"
    },
    "classroomReady": {
      "title": "IDE Sẵn sàng cho Lớp học",
      "description": "Dạy lập trình hiệu quả hơn 3 lần. Không cần cài đặt cho các khóa học.",
      "action": "Bắt đầu dạy học"
    },
    "knowledgeSynthesis": {
      "title": "Trung tâm Tổng hợp Kiến thức",
      "description": "Biến kiến thức rải rác thành trí tuệp sống động, tương tác.",
      "action": "Khám phá kiến thức"
    },
    "agentOrchestration": {
      "title": "Trung tâm Điều phối Tác nhân AI",
      "description": "Các đội tác nhân AI hoàn toàn nhận thức quản lý dự án và quy trình làm việc của bạn.",
      "action": "Cấu hình tác nhân AI"
    }
  },
  "projects": {
    "recent": "Dự án gần đây",
    "new": "Dự án mới",
    "openFolder": "Mở thư mục",
    "lastEdited": "Chỉnh sửa lần cuối"
  },
  "portal": {
    "ideWorkspace": "Không gian làm việc IDE",
    "agentCenter": "Trung tâm Quản lý Tác nhân AI",
    "knowledgeHub": "Trung tâm Tổng hợp Kiến thức",
    "settings": "Cài đặt"
  },
  "breadcrumbs": {
    "home": "Trang chủ",
    "projects": "Dự án",
    "workspace": "Không gian làm việc"
  }
}
```

---

## Implementation Notes

### Component Size Constraints

All components must be under 400 lines:
- `HubSidebar.tsx`: ~250 lines
- `TopicCard.tsx`: ~200 lines
- `TopicPortalCard.tsx`: ~150 lines
- `HubHomePage.tsx`: ~300 lines
- `NavigationBreadcrumbs.tsx`: ~150 lines

### File Structure

```
src/
├── components/
│   ├── hub/
│   │   ├── HubSidebar.tsx
│   │   ├── TopicCard.tsx
│   │   ├── TopicPortalCard.tsx
│   │   ├── HubHomePage.tsx
│   │   ├── NavigationBreadcrumbs.tsx
│   │   └── index.ts
│   └── layout/
│       └── HubLayout.tsx
├── lib/
│   └── state/
│       └── hub-store.ts (NEW)
└── i18n/
    ├── en.json (UPDATE)
    └── vi.json (UPDATE)
```

### Design Token Usage

**CSS Variables to Use**:
- `--color-primary-*`: Primary brand colors
- `--color-secondary-*`: Secondary accent colors
- `--color-neutral-*`: Neutral grayscale colors
- `--spacing-*`: Spacing scale
- `--radius-*`: Border radius scale
- `--shadow-*`: Shadow scale
- `--transition-*`: Transition durations
- `--font-*`: Typography scale

**No Hard-coding**:
- All spacing: `var(--spacing-4)`, `var(--spacing-6)`, etc.
- All colors: `var(--color-primary-500)`, `var(--color-neutral-950)`, etc.
- All sizes: `var(--text-xl)`, `var(--radius-md)`, etc.

### CVA Pattern Usage

All components must use `class-variance-authority`:
```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const componentVariants = cva(
  // Base styles
  ['base-class-1', 'base-class-2'],
  {
    variants: {
      variantName: {
        variantValue1: 'variant-class-1',
        variantValue2: 'variant-class-2',
      },
    },
    defaultVariants: {
      variantName: 'defaultValue',
    },
  }
);
```

### TypeScript Interfaces

All props must use `interface` (not `type` aliases):
```typescript
// ✅ CORRECT
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

// ❌ INCORRECT
type ComponentProps = {
  prop1: string;
  prop2?: number;
}
```

### State Management

Create new Zustand store for hub navigation:
```typescript
// src/lib/state/hub-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HubState {
  activeSection: 'home' | 'ide' | 'agents' | 'knowledge' | 'settings';
  sidebarCollapsed: boolean;
  navigationHistory: string[];
  setActiveSection: (section: HubState['activeSection']) => void;
  toggleSidebar: () => void;
  addToHistory: (path: string) => void;
  navigateBack: () => void;
  navigateForward: () => void;
}

export const useHubStore = create<HubState>()(
  persist(
    (set) => ({
      activeSection: 'home',
      sidebarCollapsed: false,
      navigationHistory: [],
      setActiveSection: (section) => set({ activeSection: section }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      addToHistory: (path) => set((state) => ({ navigationHistory: [...state.navigationHistory, path] })),
      navigateBack: () => set((state) => {
        const newHistory = [...state.navigationHistory];
        newHistory.pop();
        return { navigationHistory: newHistory };
      }),
      navigateForward: () => set((state) => {
        const newHistory = [...state.navigationHistory];
        newHistory.push(state.navigationHistory[state.navigationHistory.length - 1]);
        return { navigationHistory: newHistory };
      }),
    }),
    { name: 'via-gent-hub-storage' }
  )
);
```

### Testing Requirements

1. **Unit Tests**:
   - Test component variants (CVA)
   - Test keyboard navigation
   - Test state persistence
   - Test i18n translations

2. **Integration Tests**:
   - Test navigation between sections
   - Test sidebar collapse/expand
   - Test breadcrumbs navigation

3. **E2E Verification**:
   - Manual browser testing of complete user journey
   - Screenshot or recording required
   - Test all navigation paths
   - Verify accessibility with screen reader

---

## Acceptance Criteria

- [ ] Main sidebar is collapsible with icon-only navigation
- [ ] Home page shows topic-based onboarding (NOT generic slides)
- [ ] Topic cards communicate clear value propositions for each audience
- [ ] Quick actions and portal cards to other sections
- [ ] Project management is centered on home page
- [ ] Other tabs provide seamless transitions between workspaces
- [ ] Navigation is intuitive and non-disruptive
- [ ] All components use 8-bit design system tokens
- [ ] All user-facing text has i18n support (EN + VI)
- [ ] All components are accessible (WCAG AA, keyboard navigation)
- [ ] No hard-coded values (all use CSS variables)
- [ ] All components under 400 lines
- [ ] TypeScript interfaces used for props (not type aliases)
- [ ] CVA patterns used for component variants
- [ ] Tests pass (unit, integration, E2E)

---

## Next Steps

1. **Design Phase** (Complete)
   - ✅ Create UX specification document
   - ✅ Define component interfaces
   - ✅ Create ASCII mockups
   - ✅ Define visual design system

2. **Implementation Phase** (Next)
   - Create HubSidebar component
   - Create TopicCard component
   - Create TopicPortalCard component
   - Create HubHomePage component
   - Create NavigationBreadcrumbs component
   - Create HubLayout wrapper
   - Update translation files (en.json, vi.json)
   - Create hub-store for state management
   - Write tests for all components

3. **Testing Phase** (After Implementation)
   - Run unit tests
   - Run integration tests
   - Perform manual E2E verification
   - Capture screenshots/recording
   - Verify accessibility compliance

4. **Handoff to Dev** (After Testing)
   - Provide implementation guide
   - Provide visual specifications
   - Provide testing checklist
   - Switch to Dev mode for implementation

---

**End of Specification**
