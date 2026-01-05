# Via-gent IDE Component Library Specifications

**Version**: 1.0.0  
**Date**: 2025-12-25  
**Status**: Production-Ready  
**Author**: UX Designer Agent (@bmad-bmm-ux-designer)

---

## Table of Contents

1. [Component Library Overview](#1-component-library-overview)
2. [Component Categories](#2-component-categories)
   - [Layout Components](#layout-components)
   - [Navigation Components](#navigation-components)
   - [Form Components](#form-components)
   - [Feedback Components](#feedback-components)
   - [Data Display Components](#data-display-components)
   - [IDE Components](#ide-components)
   - [Agent Components](#agent-components)
3. [Component Composition Patterns](#3-component-composition-patterns)
4. [Anti-Pattern Prevention](#4-anti-pattern-prevention)
5. [Component Testing Strategy](#5-component-testing-strategy)
6. [Component Documentation Strategy](#6-component-documentation-strategy)
7. [Component Migration Strategy](#7-component-migration-strategy)
8. [Implementation Roadmap](#8-implementation-roadmap)

---

## 1. Component Library Overview

### 1.1 Philosophy

**Principles:**
- **No Hard-Coding**: All values use design tokens from [`design-system-8bit-2025-12-25.md`](design-system-8bit-2025-12-25.md)
- **Extensibility**: CVA variants for flexible styling
- **Accessibility**: WCAG AA compliance by default
- **i18n First**: EN/VI support built-in
- **Composable**: Slot patterns for customization
- **8-bit Aesthetic**: Dark theme, pixel-perfect, retro-gaming style

### 1.2 Component Categories

| Category | Purpose | Components |
|----------|-----------|------------|
| Layout | Structure & layout | Container, Grid, Panel, ResizablePanel, SplitView, BentoGrid |
| Navigation | Navigation & routing | Sidebar, Breadcrumb, TabBar, CommandPalette |
| Form | Input & validation | Input, Textarea, Select, Checkbox, Switch, Slider |
| Feedback | User feedback | Button, Badge, Progress, Spinner, EmptyState |
| Data Display | Information display | Card, List, Table, Avatar, Tooltip |
| IDE | IDE-specific | Editor, FileTree, Terminal, StatusBar |
| Agent | AI agent UI | AgentChatPanel, AgentMessage, ApprovalOverlay |

### 1.3 Naming Conventions

**File Structure:**
```
src/components/
├── layout/          # Layout components
├── navigation/       # Navigation components  
├── form/            # Form components
├── feedback/         # Feedback components
├── data-display/     # Data display components
├── ide/             # IDE-specific components
├── agent/           # AI agent components
└── ui/              # Shared UI primitives
```

**Component Naming:**
- PascalCase for component names: `Button`, `InputField`, `AgentChatPanel`
- Descriptive but concise: `FileTreeItem`, `StatusBarSegment`
- Category prefixes for clarity: `NavSidebar`, `FormSelect`

### 1.4 File Structure

Each component directory contains:
```
ComponentName/
├── index.ts              # Barrel export
├── ComponentName.tsx     # Main component
├── ComponentName.test.tsx # Tests
├── types.ts             # Types (if complex)
└── __tests__/           # Test utilities
```

---

## 2. Component Categories

### Layout Components

#### 2.1 Container

**Purpose**: Wrapper for content with consistent spacing and max-width

**Props Interface:**
```typescript
interface ContainerProps {
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  variant?: 'default' | 'centered' | 'padded'
  className?: string
}
```

**CVA Variants:**
```typescript
const containerVariants = cva({
  variants: {
    size: {
      xs: 'max-w-screen-xs',
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      full: 'max-w-full',
    },
    variant: {
      default: '',
      centered: 'mx-auto text-center',
      padded: 'p-4 md:p-8',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})
```

**Design Tokens:**
- Spacing: `spacing-4`, `spacing-8`
- Max-width: `max-width-screen-*`

**Accessibility:**
- `role="region"` for landmark
- `aria-label` for semantic meaning

---

#### 2.2 Grid

**Purpose**: CSS Grid layout with responsive breakpoints

**Props Interface:**
```typescript
interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: number
  className?: string
}
```

**CVA Variants:**
```typescript
const gridVariants = cva({
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    },
  },
  defaultVariants: {
    cols: 3,
  },
})
```

**Responsive Behavior:**
- Mobile: `grid-cols-1` or `grid-cols-2`
- Tablet: `grid-cols-3` or `grid-cols-4`
- Desktop: `grid-cols-6` or `grid-cols-12`

---

#### 2.3 Panel

**Purpose**: Reusable panel container with header and body

**Props Interface:**
```typescript
interface PanelProps {
  title?: string
  children: React.ReactNode
  variant?: 'default' | 'bordered' | 'elevated'
  collapsible?: boolean
  defaultCollapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
  className?: string
}
```

**CVA Variants:**
```typescript
const panelVariants = cva({
  variants: {
    variant: {
      default: 'bg-surface-100',
      bordered: 'border border-border-100',
      elevated: 'shadow-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
```

**Design Tokens:**
- Colors: `surface-100`, `border-100`
- Shadows: `shadow-lg`

---

#### 2.4 ResizablePanel

**Purpose**: Panel with resize handle using `react-resizable-panels`

**Props Interface:**
```typescript
interface ResizablePanelProps {
  children: React.ReactNode
  minSize?: number
  defaultSize?: number
  direction?: 'horizontal' | 'vertical'
  collapsible?: boolean
  className?: string
}
```

**Dependencies:**
- `react-resizable-panels` (already in dependencies)

**Design Tokens:**
- Min-size: `spacing-64` (256px)
- Default-size: `spacing-96` (384px)

---

#### 2.5 SplitView

**Purpose**: Split pane layout with draggable divider

**Props Interface:**
```typescript
interface SplitViewProps {
  left: React.ReactNode
  right: React.ReactNode
  direction?: 'horizontal' | 'vertical'
  defaultSize?: number
  minSize?: number
}
```

**Dependencies:**
- `react-resizable-panels`

---

#### 2.6 BentoGrid

**Purpose**: Bento-style grid layout (like Apple dashboard)

**Props Interface:**
```typescript
interface BentoGridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  gap?: number
  className?: string
}
```

**CVA Variants:**
```typescript
const bentoGridVariants = cva({
  base: 'grid gap-4 p-4',
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    },
  },
  defaultVariants: {
    cols: 3,
  },
})
```

---

#### 2.7 BentoCard

**Purpose**: Card for Bento grid with 8-bit styling

**Props Interface:**
```typescript
interface BentoCardProps {
  title?: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large' | 'full'
  color?: 'default' | 'accent' | 'success' | 'warning' | 'error'
  onClick?: () => void
  className?: string
}
```

**CVA Variants:**
```typescript
const bentoCardVariants = cva({
  base: 'rounded-lg overflow-hidden',
  variants: {
    size: {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-1 row-span-2',
      large: 'col-span-2 row-span-2',
      full: 'col-span-full row-span-full',
    },
    color: {
      default: 'bg-surface-100 border border-border-100',
      accent: 'bg-accent-500/10 border-accent-500',
      success: 'bg-success-500/10 border-success-500',
      warning: 'bg-warning-500/10 border-warning-500',
      error: 'bg-error-500/10 border-error-500',
    },
  },
  defaultVariants: {
    size: 'medium',
    color: 'default',
  },
})
```

---

### Navigation Components

#### 2.8 Sidebar

**Purpose**: Main navigation sidebar with collapsible sections

**Props Interface:**
```typescript
interface SidebarProps {
  children: React.ReactNode
  position?: 'left' | 'right'
  width?: number
  collapsible?: boolean
  defaultCollapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
  className?: string
}
```

**CVA Variants:**
```typescript
const sidebarVariants = cva({
  base: 'flex flex-col h-full bg-surface-200 border-r border-border-100',
  variants: {
    position: {
      left: 'border-r',
      right: 'border-l',
    },
  },
  defaultVariants: {
    position: 'left',
  },
})
```

**Design Tokens:**
- Colors: `surface-200`, `border-100`
- Width: `spacing-80` (320px default)

**i18n Keys:**
- `sidebar.toggle` - "Toggle sidebar"
- `sidebar.collapse` - "Collapse sidebar"

---

#### 2.9 SidebarItem

**Purpose:** Navigation item with icon, label, and badge

**Props Interface:**
```typescript
interface SidebarItemProps {
  icon?: React.ReactNode
  label: string
  badge?: number | string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  children?: React.ReactNode
  className?: string
}
```

**CVA Variants:**
```typescript
const sidebarItemVariants = cva({
  base: 'flex items-center gap-3 px-4 py-3 rounded cursor-pointer',
  variants: {
    active: {
      true: 'bg-accent-500/20 text-accent-100',
      false: 'hover:bg-surface-300 text-text-100',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: '',
    },
  },
  defaultVariants: {
    active: false,
    disabled: false,
  },
})
```

**Accessibility:**
- `role="menuitem"`
- `aria-current="page"` when active
- `aria-disabled` when disabled

---

#### 2.10 Breadcrumb

**Purpose:** Breadcrumb navigation trail

**Props Interface:**
```typescript
interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: string
  className?: string
}

interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}
```

**Design Tokens:**
- Separator color: `text-300`
- Active link: `text-accent-400`

**i18n Keys:**
- `breadcrumb.home` - "Home"
- `breadcrumb.back` - "Back to..."

---

#### 2.11 TabBar

**Purpose:** Horizontal tab navigation

**Props Interface:**
```typescript
interface TabBarProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
  className?: string
}

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: number
  disabled?: boolean
}
```

**CVA Variants:**
```typescript
const tabBarVariants = cva({
  base: 'flex gap-2 border-b border-border-100',
  variants: {
    variant: {
      default: 'bg-surface-100',
      pills: 'bg-surface-200',
      underline: 'bg-transparent border-b-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
```

---

#### 2.12 CommandPalette

**Purpose:** Keyboard-driven command palette (Cmd+K style)

**Props Interface:**
```typescript
interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  commands: Command[]
  placeholder?: string
}

interface Command {
  id: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
  action: () => void
  category?: string
}
```

**Accessibility:**
- `role="dialog"`
- `aria-modal="true"`
- Keyboard navigation: Arrow keys, Enter, Escape

**i18n Keys:**
- `commandPalette.placeholder` - "Type a command..."
- `commandPalette.noResults` - "No results found"

---

### Form Components

#### 2.13 Input

**Purpose:** Text input with validation states

**Props Interface:**
```typescript
interface InputProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number'
  error?: string
  disabled?: boolean
  required?: boolean
  icon?: React.ReactNode
  className?: string
}
```

**CVA Variants:**
```typescript
const inputVariants = cva({
  base: 'flex flex-col gap-2',
  variants: {
    state: {
      default: 'border border-border-300 focus:border-accent-500',
      error: 'border-error-500 focus:border-error-500',
      disabled: 'border-border-200 opacity-50',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})
```

**Design Tokens:**
- Colors: `border-300`, `accent-500`, `error-500`
- Spacing: `spacing-2`

**Accessibility:**
- `aria-invalid="true"` when error
- `aria-describedby` for error message

---

#### 2.14 Textarea

**Purpose:** Multi-line text input

**Props Interface:**
```typescript
interface TextareaProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  rows?: number
  error?: string
  disabled?: boolean
  resize?: 'none' | 'vertical' | 'horizontal'
  maxLength?: number
  className?: string
}
```

**CVA Variants:**
```typescript
const textareaVariants = cva({
  base: 'flex flex-col gap-2',
  variants: {
    state: {
      default: 'border border-border-300 focus:border-accent-500',
      error: 'border-error-500 focus:border-error-500',
      disabled: 'border-border-200 opacity-50',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})
```

---

#### 2.15 Select

**Purpose:** Dropdown select using Radix UI

**Props Interface:**
```typescript
interface SelectProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}
```

**Dependencies:**
- `@radix-ui/react-select` (already in dependencies)

**Design Tokens:**
- Colors: `surface-100`, `text-100`, `accent-500`

---

#### 2.16 Checkbox

**Purpose:** Checkbox input with 8-bit styling

**Props Interface:**
```typescript
interface CheckboxProps {
  label?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  indeterminate?: boolean
  className?: string
}
```

**CVA Variants:**
```typescript
const checkboxVariants = cva({
  base: 'flex items-center gap-3',
  variants: {
    checked: {
      true: 'text-accent-400',
      false: 'text-text-300',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: '',
    },
  },
  defaultVariants: {
    checked: false,
    disabled: false,
  },
})
```

**Dependencies:**
- `@radix-ui/react-checkbox` (already in dependencies)

---

#### 2.17 Switch

**Purpose:** Toggle switch component

**Props Interface:**
```typescript
interface SwitchProps {
  label?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

**CVA Variants:**
```typescript
const switchVariants = cva({
  base: 'flex items-center gap-3',
  variants: {
    size: {
      sm: 'h-5 w-9',
      md: 'h-6 w-11',
      lg: 'h-7 w-13',
    },
    checked: {
      true: 'bg-accent-500',
      false: 'bg-surface-300',
    },
  },
  defaultVariants: {
    size: 'md',
    checked: false,
  },
})
```

**Dependencies:**
- `@radix-ui/react-switch` (already in dependencies)

---

### Feedback Components

#### 2.18 Button

**Purpose:** Primary action button with variants

**Props Interface:**
```typescript
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}
```

**CVA Variants:**
```typescript
const buttonVariants = cva({
  base: 'inline-flex items-center justify-center gap-2 rounded font-medium transition-all',
  variants: {
    variant: {
      primary: 'bg-accent-500 text-white hover:bg-accent-600',
      secondary: 'bg-surface-300 text-text-100 hover:bg-surface-400',
      ghost: 'bg-transparent text-text-100 hover:bg-surface-200',
      danger: 'bg-error-500 text-white hover:bg-error-600',
      success: 'bg-success-500 text-white hover:bg-success-600',
    },
    size: {
      xs: 'px-3 py-1.5 text-sm',
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-2.5 text-base',
      lg: 'px-8 py-3 text-lg',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: '',
    },
    loading: {
      true: 'cursor-wait',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
})
```

**Design Tokens:**
- Colors: `accent-500`, `surface-300`, `error-500`, `success-500`
- Spacing: `spacing-2` to `spacing-3`

**Accessibility:**
- `aria-disabled` when disabled
- `aria-busy` when loading
- Minimum touch target: 48px

---

#### 2.19 Badge

**Purpose:** Small status indicator badge

**Props Interface:**
```typescript
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
  className?: string
}
```

**CVA Variants:**
```typescript
const badgeVariants = cva({
  base: 'inline-flex items-center justify-center rounded-full font-medium',
  variants: {
    variant: {
      default: 'bg-surface-300 text-text-100',
      primary: 'bg-accent-500 text-white',
      success: 'bg-success-500 text-white',
      warning: 'bg-warning-500 text-white',
      error: 'bg-error-500 text-white',
    },
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'sm',
  },
})
```

---

#### 2.20 Progress

**Purpose:** Progress indicator (linear or circular)

**Props Interface:**
```typescript
interface ProgressProps {
  value: number
  max?: number
  variant?: 'linear' | 'circular'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  color?: 'default' | 'accent' | 'success' | 'warning' | 'error'
  className?: string
}
```

**CVA Variants:**
```typescript
const progressVariants = cva({
  variants: {
    variant: {
      linear: 'h-2 bg-surface-200 rounded-full overflow-hidden',
      circular: 'relative',
    },
    size: {
      sm: 'h-1 w-24',
      md: 'h-2 w-32',
      lg: 'h-3 w-48',
    },
    color: {
      default: 'bg-accent-500',
      accent: 'bg-accent-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
    },
  },
  defaultVariants: {
    variant: 'linear',
    size: 'md',
    color: 'default',
  },
})
```

**Accessibility:**
- `role="progressbar"`
- `aria-valuenow={value}`
- `aria-valuemax={max}`

---

#### 2.21 Spinner

**Purpose:** Loading spinner animation

**Props Interface:**
```typescript
interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: 'default' | 'accent'
  className?: string
}
```

**CVA Variants:**
```typescript
const spinnerVariants = cva({
  base: 'animate-spin rounded-full border-4 border-t-transparent',
  variants: {
    size: {
      xs: 'h-3 w-3 border-2',
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-3',
      lg: 'h-8 w-8 border-4',
    },
    color: {
      default: 'border-accent-500 border-t-accent-500',
      accent: 'border-accent-400 border-t-accent-400',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'default',
  },
})
```

**Animation:**
- `animate-spin` (custom keyframes)

---

#### 2.22 EmptyState

**Purpose:** Empty state illustration with message

**Props Interface:**
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}
```

**CVA Variants:**
```typescript
const emptyStateVariants = cva({
  base: 'flex flex-col items-center justify-center text-center p-12',
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
```

**i18n Keys:**
- `emptyState.title` - "No items found"
- `emptyState.description` - "Get started by..."
- `emptyState.action` - "Create new..."

---

#### 2.23 ErrorState

**Purpose:** Error state with recovery action

**Props Interface:**
```typescript
interface ErrorStateProps {
  title?: string
  message?: string
  error?: Error
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}
```

**CVA Variants:**
```typescript
const errorStateVariants = cva({
  base: 'flex flex-col items-center justify-center text-center p-12',
  variants: {
    variant: {
      default: 'bg-error-500/10 border-error-500',
      recoverable: 'bg-error-500/5 border-error-500',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
```

---

#### 2.24 LoadingState

**Purpose:** Loading state with spinner

**Props Interface:**
```typescript
interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

**CVA Variants:**
```typescript
const loadingStateVariants = cva({
  base: 'flex flex-col items-center justify-center p-12',
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
```

---

### Data Display Components

#### 2.25 Card

**Purpose:** Content card with header, body, footer

**Props Interface:**
```typescript
interface CardProps {
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  variant?: 'default' | 'bordered' | 'elevated'
  className?: string
}
```

**CVA Variants:**
```typescript
const cardVariants = cva({
  base: 'rounded-lg overflow-hidden',
  variants: {
    variant: {
      default: 'bg-surface-100',
      bordered: 'bg-surface-100 border border-border-100',
      elevated: 'bg-surface-100 shadow-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
```

---

#### 2.26 List & ListItem

**Purpose:** Accessible list component

**List Props Interface:**
```typescript
interface ListProps {
  children: React.ReactNode
  variant?: 'default' | 'bordered' | 'spaced'
  className?: string
}
```

**ListItem Props Interface:**
```typescript
interface ListItemProps {
  children: React.ReactNode
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}
```

**CVA Variants:**
```typescript
const listVariants = cva({
  base: 'divide-y divide-border-100',
  variants: {
    variant: {
      default: '',
      bordered: 'border border-border-100 rounded-lg',
      spaced: 'space-y-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
```

**Accessibility:**
- `role="list"`
- `role="listitem"`

---

#### 2.27 Table

**Purpose:** Data table with sorting and pagination

**Props Interface:**
```typescript
interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  className?: string
}

interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
}
```

**CVA Variants:**
```typescript
const tableVariants = cva({
  base: 'w-full border-collapse',
  variants: {
    striped: {
      true: 'even:bg-surface-50',
      false: '',
    },
  },
  defaultVariants: {
    striped: false,
  },
})
```

**Design Tokens:**
- Colors: `surface-50`, `border-100`, `text-100`

**Accessibility:**
- `role="table"`
- `aria-sort` attributes on sortable headers

---

#### 2.28 Avatar

**Purpose:** User avatar with fallback

**Props Interface:**
```typescript
interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'circle' | 'square'
  className?: string
}
```

**CVA Variants:**
```typescript
const avatarVariants = cva({
  base: 'flex items-center justify-center bg-surface-300 text-text-100 font-medium',
  variants: {
    size: {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
    },
    variant: {
      circle: 'rounded-full',
      square: 'rounded-md',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'circle',
  },
})
```

---

#### 2.29 Tooltip

**Purpose:** Tooltip using Radix UI

**Props Interface:**
```typescript
interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delay?: number
  className?: string
}
```

**Dependencies:**
- `@radix-ui/react-tooltip` (already in dependencies)

**Design Tokens:**
- Colors: `surface-900`, `text-100`
- Spacing: `spacing-2`

**Accessibility:**
- `role="tooltip"`
- Proper ARIA attributes from Radix UI

---

#### 2.30 Popover

**Purpose:** Popover menu using Radix UI

**Props Interface:**
```typescript
interface PopoverProps {
  trigger: React.ReactNode
  content: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
}
```

**Dependencies:**
- `@radix-ui/react-popover` (already in dependencies)

---

#### 2.31 DropdownMenu

**Purpose:** Dropdown menu using Radix UI

**Props Interface:**
```typescript
interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DropdownMenuItem[]
  align?: 'start' | 'center' | 'end'
  className?: string
}

interface DropdownMenuItem {
  label: string
  icon?: React.ReactNode
  shortcut?: string
  disabled?: boolean
  onClick?: () => void
  divider?: boolean
}
```

**Dependencies:**
- `@radix-ui/react-dropdown-menu` (already in dependencies)

---

### IDE Components

#### 2.32 Editor

**Purpose:** Monaco Editor wrapper

**Props Interface:**
```typescript
interface EditorProps {
  value: string
  onChange?: (value: string) => void
  language?: string
  theme?: 'vs-dark' | 'vs-light'
  readOnly?: boolean
  height?: string | number
  className?: string
}
```

**Dependencies:**
- `@monaco-editor/react` (already in dependencies)
- `monaco-editor` (already in dependencies)

**Design Tokens:**
- Theme: Custom 8-bit theme
- Colors: Defined in design system

---

#### 2.33 FileTree & FileTreeItem

**Purpose:** File tree with icons and expand/collapse

**FileTree Props Interface:**
```typescript
interface FileTreeProps {
  files: FileNode[]
  selectedFile?: string
  onFileSelect?: (file: string) => void
  onFileExpand?: (file: string) => void
  className?: string
}

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  path: string
}
```

**CVA Variants:**
```typescript
const fileTreeItemVariants = cva({
  base: 'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer',
  variants: {
    selected: {
      true: 'bg-accent-500/20 text-accent-100',
      false: 'hover:bg-surface-300',
    },
    expanded: {
      true: 'bg-surface-200',
      false: '',
    },
  },
  defaultVariants: {
    selected: false,
    expanded: false,
  },
})
```

**Design Tokens:**
- Colors: `surface-200`, `accent-500`
- Icons: File type icons from `lucide-react`

**Accessibility:**
- `role="tree"`
- `aria-expanded` on folders
- `aria-selected` on selected item

---

#### 2.34 Terminal

**Purpose:** xterm.js terminal wrapper

**Props Interface:**
```typescript
interface TerminalProps {
  projectPath?: string
  onCommand?: (command: string) => void
  className?: string
}
```

**Dependencies:**
- `@xterm/xterm` (already in dependencies)
- `@xterm/addon-fit` (already in dependencies)

**Design Tokens:**
- Colors: Custom terminal colors (8-bit palette)
- Font: Monospace font family

---

#### 2.35 Preview

**Purpose:** Preview panel for web content

**Props Interface:**
```typescript
interface PreviewProps {
  url?: string
  html?: string
  title?: string
  onRefresh?: () => void
  className?: string
}
```

**Design Tokens:**
- Colors: `surface-100`, `border-100`

---

#### 2.36 StatusBar & StatusBarSegment

**Purpose:** Status bar with segmented indicators

**StatusBar Props Interface:**
```typescript
interface StatusBarProps {
  segments: StatusBarSegment[]
  className?: string
}

interface StatusBarSegment {
  icon?: React.ReactNode
  label?: string
  value?: string
  tooltip?: string
  onClick?: () => void
}
```

**CVA Variants:**
```typescript
const statusBarVariants = cva({
  base: 'flex items-center gap-4 px-4 py-2 bg-surface-900 border-t border-border-100',
  variants: {
    variant: {
      default: '',
      elevated: 'shadow-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
```

**Design Tokens:**
- Colors: `surface-900`, `border-100`, `text-300`

**i18n Keys:**
- `statusBar.sync` - "Sync status"
- `statusBar.webcontainer` - "WebContainer status"
- `statusBar.cursor` - "Line {line}, Column {col}"

---

### Agent Components

#### 2.37 AgentChatPanel

**Purpose:** Main agent chat interface

**Props Interface:**
```typescript
interface AgentChatPanelProps {
  agentId: string
  messages: AgentMessage[]
  onSendMessage: (message: string) => void
  onToolApproval: (toolCall: ToolCall) => void
  streaming?: boolean
  className?: string
}

interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCall[]
  timestamp: Date
}

interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
  status: 'pending' | 'approved' | 'rejected' | 'executing'
}
```

**CVA Variants:**
```typescript
const agentChatPanelVariants = cva({
  base: 'flex flex-col h-full bg-surface-100',
  variants: {
    state: {
      default: 'border-r border-border-100',
      collapsed: '',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})
```

**Design Tokens:**
- Colors: `surface-100`, `border-100`, `accent-500`

**i18n Keys:**
- `agentChat.placeholder` - "Type your message..."
- `agentChat.send` - "Send"
- `agentChat.approve` - "Approve"
- `agentChat.reject` - "Reject"

---

#### 2.38 AgentMessage

**Purpose:** Individual message in chat

**Props Interface:**
```typescript
interface AgentMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
  toolCalls?: ToolCall[]
  className?: string
}
```

**CVA Variants:**
```typescript
const agentMessageVariants = cva({
  base: 'max-w-3xl p-4 rounded-lg',
  variants: {
    role: {
      user: 'bg-accent-500/10 ml-auto',
      assistant: 'bg-surface-200',
    },
  },
  defaultVariants: {
    role: 'assistant',
  },
})
```

---

#### 2.39 AgentInput

**Purpose:** Chat input with send button

**Props Interface:**
```typescript
interface AgentInputProps {
  value: string
  onChange?: (value: string) => void
  onSend?: () => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  className?: string
}
```

**CVA Variants:**
```typescript
const agentInputVariants = cva({
  base: 'flex gap-2',
  variants: {
    state: {
      default: 'border border-border-300 focus:border-accent-500',
      disabled: 'border-border-200 opacity-50',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})
```

**i18n Keys:**
- `agentInput.placeholder` - "Ask the agent..."
- `agentInput.send` - "Send message"

---

#### 2.40 AgentConfigDialog

**Purpose:** Agent configuration dialog

**Props Interface:**
```typescript
interface AgentConfigDialogProps {
  open: boolean
  onClose: () => void
  onSave?: (config: AgentConfig) => void
  className?: string
}

interface AgentConfig {
  provider: string
  model: string
  apiKey?: string
  temperature?: number
  maxTokens?: number
}
```

**Dependencies:**
- `@radix-ui/react-dialog` (already in dependencies)

**Design Tokens:**
- Colors: `surface-100`, `border-100`

**i18n Keys:**
- `agentConfig.title` - "Configure Agent"
- `agentConfig.provider` - "Provider"
- `agentConfig.model` - "Model"
- `agentConfig.apiKey` - "API Key"

---

#### 2.41 AgentSelector

**Purpose:** Agent selection dropdown

**Props Interface:**
```typescript
interface AgentSelectorProps {
  agents: AgentInfo[]
  selectedAgent?: string
  onAgentChange?: (agentId: string) => void
  className?: string
}

interface AgentInfo {
  id: string
  name: string
  provider: string
  model: string
}
```

**CVA Variants:**
```typescript
const agentSelectorVariants = cva({
  base: 'flex items-center gap-2 px-4 py-2 bg-surface-200 rounded',
  variants: {
    selected: {
      true: 'border-2 border-accent-500',
      false: 'border border-border-300',
    },
  },
  defaultVariants: {
    selected: false,
  },
})
```

---

#### 2.42 ToolCallBadge

**Purpose:** Badge showing tool call status

**Props Interface:**
```typescript
interface ToolCallBadgeProps {
  toolName: string
  status: 'pending' | 'approved' | 'rejected' | 'executing'
  onClick?: () => void
  className?: string
}
```

**CVA Variants:**
```typescript
const toolCallBadgeVariants = cva({
  base: 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm',
  variants: {
    status: {
      pending: 'bg-warning-500/20 text-warning-100',
      approved: 'bg-success-500/20 text-success-100',
      rejected: 'bg-error-500/20 text-error-100',
      executing: 'bg-accent-500/20 text-accent-100 animate-pulse',
    },
  },
  defaultVariants: {
    status: 'pending',
  },
})
```

---

#### 2.43 ApprovalOverlay

**Purpose:** Overlay for tool approval

**Props Interface:**
```typescript
interface ApprovalOverlayProps {
  toolCall: ToolCall
  onApprove: () => void
  onReject: () => void
  className?: string
}
```

**CVA Variants:**
```typescript
const approvalOverlayVariants = cva({
  base: 'fixed inset-0 bg-surface-900/80 backdrop-blur-sm flex items-center justify-center p-6',
  variants: {
    state: {
      default: '',
      approving: 'bg-success-500/10',
      rejecting: 'bg-error-500/10',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})
```

**Dependencies:**
- `@radix-ui/react-dialog` (already in dependencies)

---

#### 2.44 DiffPreview

**Purpose:** Preview of file changes

**Props Interface:**
```typescript
interface DiffPreviewProps {
  original: string
  modified: string
  onApprove?: () => void
  onReject?: () => void
  className?: string
}
```

**CVA Variants:**
```typescript
const diffPreviewVariants = cva({
  base: 'flex flex-col gap-4 p-4 bg-surface-100 rounded-lg',
  variants: {
    state: {
      default: '',
      approved: 'border-2 border-success-500',
      rejected: 'border-2 border-error-500',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})
```

---

#### 2.45 StreamingMessage

**Purpose:** Streaming message with typing indicator

**Props Interface:**
```typescript
interface StreamingMessageProps {
  content?: string
  isTyping?: boolean
  onComplete?: () => void
  className?: string
}
```

**CVA Variants:**
```typescript
const streamingMessageVariants = cva({
  base: 'flex items-start gap-2 p-4 rounded-lg',
  variants: {
    state: {
      typing: 'animate-pulse',
      complete: '',
    },
  },
  defaultVariants: {
    state: 'complete',
  },
})
```

**Animation:**
- `animate-pulse` for typing indicator

---

## 3. Component Composition Patterns

### 3.1 Slot Pattern

**Purpose:** Allow component customization via slots

**Example:**
```typescript
interface ButtonProps {
  children?: React.ReactNode
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

<Button>
  <Button.LeftIcon><Icon /></Button.LeftIcon>
  {children}
  <Button.RightIcon><Arrow /></Button.RightIcon>
</Button>
```

**Implementation:**
```typescript
const Button = ({ children, leftIcon, rightIcon, ...props }: ButtonProps) => {
  return (
    <button {...props}>
      {leftIcon && <span className="slot-left">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="slot-right">{rightIcon}</span>}
    </button>
  )
}
```

---

### 3.2 Compound Components

**Purpose:** Related components that share state

**Example:**
```typescript
<Dialog>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>Title</Dialog.Header>
    <Dialog.Body>Content</Dialog.Body>
    <Dialog.Footer>
      <Dialog.Close>Cancel</Dialog.Close>
      <Dialog.Action>Confirm</Dialog.Action>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>
```

**Implementation:**
- Use React Context to share state
- Export sub-components as named exports

---

### 3.3 Context Providers

**Purpose:** Share state across component tree

**Example:**
```typescript
const ThemeContext = createContext<ThemeContextType>({})

export const ThemeProvider = ({ children, theme }: ThemeProviderProps) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

---

### 3.4 Render Props

**Purpose:** Allow component to render custom content

**Example:**
```typescript
interface ListProps {
  children: React.ReactNode | ((props: ListItemProps) => React.ReactNode)
  renderItem?: (item: any, index: number) => React.ReactNode
}

<List items={data}>
  {(item) => <ListItem>{item.name}</ListItem>}
</List>
```

---

## 4. Anti-Pattern Prevention

### 4.1 Hard-Coded Values

**Prevention:** Use design tokens from [`design-system-8bit-2025-12-25.md`](design-system-8bit-2025-12-25.md)

**Bad Pattern:**
```typescript
// ❌ BAD: Hard-coded values
<div style={{ padding: '16px', color: '#1a1a2a' }}>

// ✅ GOOD: Design tokens
<div className="p-4 bg-surface-100">
```

**Enforcement:**
- ESLint rule: `no-hardcoded-values`
- Use `tailwind.config.js` for custom values

---

### 4.2 Magic Numbers

**Prevention:** Use spacing scale

**Bad Pattern:**
```typescript
// ❌ BAD: Magic numbers
<div style={{ marginTop: '23px', marginBottom: '47px' }}>

// ✅ GOOD: Spacing scale
<div className="mt-6 mb-12">
```

**Spacing Scale:**
```typescript
const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  // ... continue in multiples of 4
}
```

---

### 4.3 Inline Styles

**Prevention:** Use Tailwind classes

**Bad Pattern:**
```typescript
// ❌ BAD: Inline styles
<div style={{ display: 'flex', justifyContent: 'center' }}>

// ✅ GOOD: Tailwind classes
<div className="flex justify-center">
```

**Enforcement:**
- ESLint rule: `no-inline-styles`
- Use `cva` for variant styling

---

### 4.4 Duplicate Code

**Prevention:** Extract shared logic

**Bad Pattern:**
```typescript
// ❌ BAD: Duplicate validation logic
function validateEmail1(email: string) { /* ... */ }
function validateEmail2(email: string) { /* ... */ }

// ✅ GOOD: Shared validation
import { validateEmail } from '@/lib/validation'
```

**Enforcement:**
- Use `@/lib/validation` for shared utilities
- Extract common patterns to hooks

---

### 4.5 Missing Accessibility

**Prevention:** WCAG AA compliance by default

**Bad Pattern:**
```typescript
// ❌ BAD: Missing ARIA
<button onClick={handleClick}>Click</button>

// ✅ GOOD: Full ARIA
<button 
  onClick={handleClick}
  aria-label="Submit form"
  role="button"
>
  Click
</button>
```

**Enforcement:**
- ESLint rule: `jsx-a11y`
- Test with `@testing-library/react`

---

### 4.6 Missing i18n

**Prevention:** All user-facing text translated

**Bad Pattern:**
```typescript
// ❌ BAD: Hard-coded text
<h1>Welcome</h1>

// ✅ GOOD: Translated text
<h1>{t('welcome.title')}</h1>
```

**Enforcement:**
- Use `t()` hook for all user-facing text
- Run `pnpm i18n:extract` to update keys

---

## 5. Component Testing Strategy

### 5.1 Unit Tests

**Framework:** Vitest with `@testing-library/react`

**Test Structure:**
```typescript
// ComponentName.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<ComponentName onClick={handleClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

**Coverage Target:** 80%+

---

### 5.2 Integration Tests

**Purpose:** Test component interactions

**Example:**
```typescript
describe('Form Integration', () => {
  it('submits form with valid data', async () => {
    render(<Form onSubmit={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'submit' }))
    expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' })
  })
})
```

---

### 5.3 Accessibility Tests

**Framework:** `@testing-library/jest-dom`

**Test Requirements:**
```typescript
describe('Accessibility', () => {
  it('has proper ARIA attributes', () => {
    render(<Button />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label')
  })

  it('is keyboard navigable', async () => {
    render(<Button />)
    await userEvent.tab()
    expect(screen.getByRole('button')).toHaveFocus()
  })

  it('has sufficient color contrast', () => {
    // Test with axe-core
  })
})
```

**WCAG Compliance:**
- Level AA minimum
- Color contrast ratio: 4.5:1
- Keyboard navigation: Tab, Enter, Escape

---

### 5.4 Visual Regression Tests

**Framework:** Storybook + Chromatic

**Test Coverage:**
- All component variants
- All interactive states
- All responsive breakpoints

**Story Example:**
```typescript
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ComponentName } from './ComponentName'

const meta: Meta<typeof ComponentName> = {
  title: 'ComponentName',
  component: ComponentName,
}

export default meta

type Story = StoryObj<typeof ComponentName>

export const Default: Story = {
  args: {
    variant: 'primary',
    size: 'md',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <ComponentName variant="primary" size="sm" />
      <ComponentName variant="secondary" size="sm" />
      <ComponentName variant="ghost" size="sm" />
    </div>
  ),
}
```

---

## 6. Component Documentation Strategy

### 6.1 Documentation Structure

**Location:** `docs/components/{ComponentName}/`

**Files:**
```
docs/components/Button/
├── README.md           # Overview and usage
├── examples.md         # Code examples
├── api.md             # Props API
├── accessibility.md     # A11y notes
└── design.md          # Design decisions
```

---

### 6.2 README.md Template

```markdown
# Button

Primary action button with variants for different use cases.

## Installation

```bash
pnpm add @/components/button
```

## Usage

```tsx
import { Button } from '@/components/ui/button'

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

## Examples

See [examples.md](examples.md) for more examples.

## API

See [api.md](api.md) for complete props API.

## Accessibility

See [accessibility.md](accessibility.md) for A11y notes.

## Design

See [design.md](design.md) for design decisions.
```

---

### 6.3 Examples.md Template

```markdown
# Button Examples

## Basic Usage

```tsx
<Button onClick={handleClick}>Click me</Button>
```

## With Icons

```tsx
<Button icon={<Icon />}>With Icon</Button>
```

## All Variants

```tsx
<div style={{ display: 'flex', gap: '8px' }}>
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="danger">Danger</Button>
</div>
```

## All Sizes

```tsx
<div style={{ display: 'flex', gap: '8px' }}>
  <Button size="xs">Extra Small</Button>
  <Button size="sm">Small</Button>
  <Button size="md">Medium</Button>
  <Button size="lg">Large</Button>
</div>
```

## Loading State

```tsx
<Button loading>Loading...</Button>
```

## Disabled State

```tsx
<Button disabled>Disabled</Button>
```
```

---

### 6.4 API.md Template

```markdown
# Button API

## Props

| Prop | Type | Default | Description |
|-------|--------|----------|-------------|
| children | `React.ReactNode` | - | Button content |
| variant | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'success'` | `'primary'` | Visual variant |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| disabled | `boolean` | `false` | Disable button |
| loading | `boolean` | `false` | Show loading spinner |
| onClick | `() => void` | - | Click handler |
| icon | `React.ReactNode` | - | Left or right icon |
| iconPosition | `'left' \| 'right'` | `'left'` | Icon position |
| className | `string` | - | Additional classes |
| type | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |

## Variants

### Variant

- `primary`: Main action button
- `secondary`: Secondary action
- `ghost`: Ghost button (no background)
- `danger`: Destructive action
- `success`: Success action

### Size

- `xs`: Extra small (32px height)
- `sm`: Small (40px height)
- `md`: Medium (48px height)
- `lg`: Large (56px height)

## Examples

See [examples.md](examples.md) for usage examples.
```

---

### 6.5 Accessibility.md Template

```markdown
# Button Accessibility

## Keyboard Navigation

- Tab: Focus button
- Enter/Space: Activate button
- Escape: Close modal/dialog

## Screen Reader Support

- `aria-label`: Descriptive label for icon-only buttons
- `aria-disabled`: When button is disabled
- `aria-busy`: When button is loading

## Color Contrast

All variants meet WCAG AA (4.5:1 contrast ratio):
- Primary: `accent-500` on `surface-100` (7.2:1)
- Secondary: `text-100` on `surface-300` (8.5:1)
- Ghost: `text-100` on `surface-200` (9.8:1)
- Danger: `white` on `error-500` (7.2:1)
- Success: `white` on `success-500` (7.2:1)

## Focus Management

Button has visible focus state:
- `ring-2 ring-accent-500` when focused
- `ring-2 ring-offset-2` when keyboard focused

## Testing

Tested with:
- `@testing-library/react` for user interactions
- `axe-core` for automated A11y testing
- Manual keyboard navigation testing
```

---

## 7. Component Migration Strategy

### 7.1 Migration Phases

**Phase 1: Foundation (Week 1-2)**
- Create base components (Button, Input, Card)
- Set up CVA infrastructure
- Establish design tokens
- Create Storybook setup

**Phase 2: Layout (Week 3-4)**
- Migrate layout components (Container, Grid, Panel)
- Replace existing layout code
- Update responsive behavior

**Phase 3: Navigation (Week 5-6)**
- Migrate navigation components (Sidebar, Breadcrumb, TabBar)
- Integrate with TanStack Router
- Update i18n support

**Phase 4: Forms (Week 7-8)**
- Migrate form components (Select, Checkbox, Switch)
- Add validation patterns
- Create form field components

**Phase 5: Feedback (Week 9-10)**
- Migrate feedback components (Badge, Progress, Spinner)
- Add animation system
- Create state components

**Phase 6: IDE (Week 11-12)**
- Migrate IDE components (Editor, FileTree, Terminal)
- Integrate with WebContainer
- Update status bar

**Phase 7: Agent (Week 13-14)**
- Migrate agent components (AgentChatPanel, ToolCallBadge)
- Integrate with TanStack AI
- Add approval workflow

---

### 7.2 Migration Checklist

**Per Component:**
- [ ] Create component with CVA variants
- [ ] Add TypeScript interfaces
- [ ] Write unit tests (80%+ coverage)
- [ ] Create Storybook stories
- [ ] Write documentation (README, API, examples, A11y)
- [ ] Add i18n translation keys
- [ ] Test accessibility (axe-core)
- [ ] Test keyboard navigation
- [ ] Test responsive behavior
- [ ] Update existing usage

---

### 7.3 Backward Compatibility

**Strategy:** Gradual migration with deprecation warnings

**Example:**
```typescript
// Old component with deprecation warning
import { Button as NewButton } from '@/components/ui/button-v2'

export const Button = (props: OldButtonProps) => {
  console.warn('Button is deprecated. Use @/components/ui/button-v2')
  return <NewButton {...props} />
}
```

**Timeline:**
- Week 1-2: Old and new coexist
- Week 3-4: Deprecation warnings
- Week 5-6: Old components removed
- Week 7-8: Cleanup complete

---

## 8. Implementation Roadmap

### 8.1 Priority Order

**P0 - Critical (Week 1-2)**
1. Button - Core interaction component
2. Input - Core form component
3. Container - Foundation layout
4. Card - Foundation display

**P1 - High (Week 3-4)**
5. Select - Form component
6. Checkbox - Form component
7. Badge - Feedback component
8. Progress - Feedback component
9. Sidebar - Navigation component
10. Breadcrumb - Navigation component

**P2 - Medium (Week 5-6)**
11. Switch - Form component
12. Spinner - Feedback component
13. EmptyState - State component
14. ErrorState - State component
15. TabBar - Navigation component

**P3 - Low (Week 7-8)**
16. Grid - Layout component
17. Panel - Layout component
18. Tooltip - Data display
19. Table - Data display
20. Avatar - Data display

**P4 - IDE Specific (Week 9-10)**
21. Editor - IDE component
22. FileTree - IDE component
23. Terminal - IDE component
24. StatusBar - IDE component

**P5 - Agent Specific (Week 11-12)**
25. AgentChatPanel - Agent component
26. AgentMessage - Agent component
27. ToolCallBadge - Agent component
28. ApprovalOverlay - Agent component
29. DiffPreview - Agent component
30. StreamingMessage - Agent component

---

### 8.2 Dependencies

**Component Dependencies:**
- `class-variance-authority` (CVA)
- `clsx` (Conditional classes)
- `tailwind-merge` (Merge Tailwind classes)
- `lucide-react` (Icons)
- `@radix-ui/*` (Accessible primitives)
- `@monaco-editor/react` (Editor)
- `@xterm/xterm` (Terminal)
- `react-resizable-panels` (Resizable panels)
- `sonner` (Toast notifications)

**Development Dependencies:**
- `vitest` (Testing)
- `@testing-library/react` (Component testing)
- `axe-core` (Accessibility testing)
- `storybook` (Documentation)
- `typescript` (Type safety)

---

### 8.3 Milestones

| Milestone | Target | Date | Status |
|-----------|--------|------|--------|
| Foundation Complete | Button, Input, Container, Card | Week 2 | ⬜ Pending |
| Layout Complete | Grid, Panel, ResizablePanel | Week 4 | ⬜ Pending |
| Navigation Complete | Sidebar, Breadcrumb, TabBar | Week 6 | ⬜ Pending |
| Forms Complete | Select, Checkbox, Switch | Week 8 | ⬜ Pending |
| Feedback Complete | Badge, Progress, Spinner | Week 8 | ⬜ Pending |
| Data Display Complete | Tooltip, Table, Avatar | Week 10 | ⬜ Pending |
| IDE Components Complete | Editor, FileTree, Terminal, StatusBar | Week 12 | ⬜ Pending |
| Agent Components Complete | All agent components | Week 14 | ⬜ Pending |
| Documentation Complete | All components documented | Week 14 | ⬜ Pending |
| Testing Complete | 80%+ test coverage | Week 14 | ⬜ Pending |

---

### 8.4 Success Criteria

**Component is Complete When:**
- [ ] CVA variants defined and tested
- [ ] TypeScript interfaces complete
- [ ] Unit tests with 80%+ coverage
- [ ] Accessibility tests passing (axe-core)
- [ ] Storybook stories created
- [ ] Documentation complete (README, API, examples, A11y)
- [ ] i18n keys added and extracted
- [ ] No hard-coded values (uses design tokens)
- [ ] No magic numbers (uses spacing scale)
- [ ] Responsive behavior tested
- [ ] Keyboard navigation tested
- [ ] Integration with existing code verified

---

## Related Documents

- [Design System](design-system-8bit-2025-12-25.md) - Design tokens and 8-bit aesthetic
- [UX Audit](ux-ui-audit-2025-12-25.md) - Issues and recommendations
- [Information Architecture](information-architecture-2025-12-25.md) - Navigation and user flows
- [UX Specifications](ux-specification/index.md) - Component UX specs

---

## Appendix: Quick Reference

### A.1 Design Token Quick Reference

**Colors:**
- `surface-100`, `surface-200`, `surface-300`, `surface-900`
- `border-100`, `border-200`, `border-300`
- `text-100`, `text-200`, `text-300`
- `accent-400`, `accent-500`, `accent-600`
- `success-500`, `warning-500`, `error-500`

**Spacing:**
- `spacing-1` (4px), `spacing-2` (8px), `spacing-3` (12px)
- `spacing-4` (16px), `spacing-6` (24px), `spacing-8` (32px)

**Typography:**
- `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`
- `font-mono`, `font-sans`

**Shadows:**
- `shadow-sm`, `shadow-md`, `shadow-lg`

**Border Radius:**
- `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`

---

### A.2 i18n Key Reference

**Navigation:**
- `nav.home`, `nav.back`, `nav.toggle`, `nav.search`

**Forms:**
- `form.submit`, `form.cancel`, `form.required`, `form.error`

**Feedback:**
- `feedback.loading`, `feedback.success`, `feedback.error`, `feedback.empty`

**Agent:**
- `agent.send`, `agent.approve`, `agent.reject`, `agent.typing`

**IDE:**
- `ide.save`, `ide.open`, `ide.close`, `ide.sync`

---

### A.3 Component File Locations

**Source:**
```
src/components/
├── layout/
│   ├── Container.tsx
│   ├── Grid.tsx
│   ├── Panel.tsx
│   ├── ResizablePanel.tsx
│   ├── SplitView.tsx
│   ├── BentoGrid.tsx
│   └── BentoCard.tsx
├── navigation/
│   ├── Sidebar.tsx
│   ├── SidebarItem.tsx
│   ├── Breadcrumb.tsx
│   ├── TabBar.tsx
│   └── CommandPalette.tsx
├── form/
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   └── Switch.tsx
├── feedback/
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── Progress.tsx
│   ├── Spinner.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   └── LoadingState.tsx
├── data-display/
│   ├── Card.tsx
│   ├── List.tsx
│   ├── ListItem.tsx
│   ├── Table.tsx
│   ├── Avatar.tsx
│   ├── Tooltip.tsx
│   ├── Popover.tsx
│   └── DropdownMenu.tsx
├── ide/
│   ├── Editor.tsx
│   ├── FileTree.tsx
│   ├── FileTreeItem.tsx
│   ├── Terminal.tsx
│   ├── Preview.tsx
│   └── StatusBar.tsx
└── agent/
    ├── AgentChatPanel.tsx
    ├── AgentMessage.tsx
    ├── AgentInput.tsx
    ├── AgentConfigDialog.tsx
    ├── AgentSelector.tsx
    ├── ToolCallBadge.tsx
    ├── ApprovalOverlay.tsx
    ├── DiffPreview.tsx
    └── StreamingMessage.tsx
```

**Tests:**
```
src/components/**/__tests__/
└── *.test.tsx
```

**Documentation:**
```
docs/components/{ComponentName}/
├── README.md
├── examples.md
├── api.md
├── accessibility.md
└── design.md
```

---

**End of Component Library Specifications**
