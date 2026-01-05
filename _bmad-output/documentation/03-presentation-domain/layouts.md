# Layout Components Documentation

## Overview

Layout components structure the application interface, managing navigation, panel arrangements, and responsive behavior. The layout system supports both desktop IDE experience and mobile-optimized views.

## Layout Architecture

### Main Layout Hierarchy

```
App Root
├── ThemeProvider
├── MainLayout
│   ├── Header (optional)
│   ├── MainSidebar (optional)
│   └── Page Content
│       ├── IDELayout (IDE workspace)
│       ├── MobileIDELayout (mobile IDE)
│       └── Other page layouts
```

## Primary Layouts

### 1. IDELayout

**Purpose:** Main IDE workspace layout with resizable panels and comprehensive feature access.

**Location:** `src/presentation/components/layout/IDELayout/`

**Structure:**
```
IDELayout/
├── IDELayoutMain.tsx          # Main orchestrator
├── IDEDiscoveryMechanisms.tsx # Command palette, feature search
├── IDEEditorPanel.tsx         # Code editor area
├── IDEEditorPreviewGroup.tsx  # Editor + preview split
├── IDEErrorBoundaryWrapper.tsx
├── IDEPreviewPanel.tsx        # Preview pane
├── IDEResizableLayout.tsx     # Resizable panel layout
├── IDESidebarPanelComponents.tsx
├── IDESidebarPanels.tsx       # Sidebar panel container
├── IDETerminalPanel.tsx       # Terminal pane
├── useIDELayoutState.ts       # Layout state hook
├── useIDELayoutWorkspaceState.ts
├── useIDELayoutFileState.ts
├── useIDELayoutPanelRefs.ts
└── types.ts
```

**Key Features:**
- Resizable panels with drag handles
- Collapsible sidebar
- Tab management for editor tabs
- Discovery mechanisms (Command Palette, Feature Search)
- Keyboard shortcuts
- State restoration on reload

**State Management:**
```typescript
// Layout state stored in useIDEStore
interface IDELayoutState {
  leftSidebarWidth: number;
  rightSidebarWidth: number;
  bottomPanelHeight: number;
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  activePanel: string;
  editorTabs: EditorTab[];
}
```

**Hooks:**
- `useIDELayoutState()` - Manages panel states
- `useIDELayoutWorkspaceState()` - Workspace binding
- `useIDELayoutFileState()` - File operations
- `useIDELayoutPanelRefs()` - Panel DOM references

### 2. MobileIDELayout

**Purpose:** Mobile-optimized layout with touch-friendly interface and reduced functionality.

**Location:** `src/presentation/components/layout/MobileIDELayout.tsx`

**Key Differences from IDELayout:**
- Touch-optimized controls (44px minimum targets)
- Dynamic viewport height (`dvh`)
- Tab bar navigation instead of sidebar
- Feature restrictions for desktop-only capabilities
- Simplified panel management

**Features:**
- Bottom navigation tab bar
- Mobile-specific error states
- Full-screen modals
- Swipe gestures for panel management

**Developer Notes:**
- IDE features disabled with mobile-specific messaging
- Uses `useResponsive` hook for breakpoint detection
- Redirects to Knowledge Hub for full features

### 3. MainLayout

**Purpose:** Global application layout wrapper providing theme, navigation, and common elements.

**Location:** `src/presentation/components/layout/MainLayout.tsx`

**Props:**
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}
```

**Features:**
- Theme provider integration
- Global navigation structure
- Skip links for accessibility
- Responsive adjustments
- Error boundary wrapper

### 4. PortfolioLayout

**Purpose:** About/portfolio page layout with section organization.

**Location:** `src/presentation/components/about/layout/PortfolioLayout.tsx`

**Features:**
- Hero section
- Content sections container
- Responsive grid for cards
- Scroll-based navigation

## Layout Hooks

### useIDEKeyboardShortcuts

**Purpose:** Manages keyboard shortcuts for IDE interactions.

**Location:** `src/presentation/components/layout/hooks/useIDEKeyboardShortcuts.ts`

**Usage:**
```typescript
const { shortcuts, registerShortcut, unregisterShortcut } = useIDEKeyboardShortcuts();

// Register custom shortcut
useEffect(() => {
  registerShortcut('Ctrl+S', saveFile, { preventDefault: true });
}, []);
```

**Default Shortcuts:**
| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + P | Open Command Palette |
| Ctrl/Cmd + B | Toggle Sidebar |
| Ctrl/Cmd + ` | Toggle Terminal |
| Ctrl/Cmd + Shift + F | Feature Search |
| F1 | Help |

### useIDEStateRestoration

**Purpose:** Persists and restores IDE state across page reloads.

**Location:** `src/presentation/components/layout/hooks/useIDEStateRestoration.ts`

**State Restored:**
- Open files and tabs
- Panel sizes and positions
- Scroll positions
- Sidebar state

**Implementation:**
```typescript
const { restoreState, saveState } = useIDEStateRestoration();

// Restore on mount
useEffect(() => {
  restoreState();
}, []);

// Save on change
useEffect(() => {
  saveState(currentState);
}, [currentState]);
```

### useWebContainerBoot

**Purpose:** Manages WebContainer initialization and boot state.

**Location:** `src/presentation/components/layout/hooks/useWebContainerBoot.ts`

**Features:**
- Boot progress tracking
- Error handling
- Retry mechanism
- State persistence

### useIDEFileHandlers

**Purpose:** Provides file operation handlers for the IDE.

**Location:** `src/presentation/components/layout/hooks/useIDEFileHandlers.ts`

**Handlers:**
- `onFileOpen(path)` - Open file in editor
- `onFileSave(path, content)` - Save file
- `onFileDelete(path)` - Delete file
- `onFileRename(oldPath, newPath)` - Rename file

## Resizable Layout Pattern

### IDEResizableLayout

**Purpose:** Manages resizable panel layouts with drag handles.

**Location:** `src/presentation/components/layout/IDELayout/IDEResizableLayout.tsx`

**Props:**
```typescript
interface IDEResizableLayoutProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel?: React.ReactNode;
  bottomPanel?: React.ReactNode;
  initialLeftWidth?: number;
  initialRightWidth?: number;
  initialBottomHeight?: number;
  minPanelSize?: number;
  onResize?: (sizes: PanelSizes) => void;
}
```

**Usage:**
```tsx
<IDEResizableLayout
  leftPanel={<FileTree />}
  centerPanel={<MonacoEditor />}
  rightPanel={<PreviewPanel />}
  bottomPanel={<XTerminal />}
  onResize={(sizes) => savePanelSizes(sizes)}
  minPanelSize={200}
/>
```

## Responsive Layout

### Breakpoint System

```typescript
// useResponsive hook returns
interface ResponsiveBreakpoints {
  isMobile: boolean;    // < 768px
  isTablet: boolean;    // 768px - 1024px
  isDesktop: boolean;   // >= 1024px
  width: number;
  height: number;
}
```

### Mobile-Specific Layouts

#### MobileTabBar

**Purpose:** Bottom navigation bar for mobile IDE.

**Location:** `src/presentation/components/layout/MobileTabBar.tsx`

**Tabs:**
- Files
- Search
- Chat
- Settings

#### MinViewportWarning

**Purpose:** Displays warning when viewport is too small.

**Location:** `src/presentation/components/layout/MinViewportWarning.tsx`

**Display Condition:**
- Viewport < 320px width
- Shows minimum width requirement

## Accessibility Features

### SkipLinks

**Location:** `src/presentation/components/ui/SkipLinks.tsx`

**Links:**
- Skip to main content
- Skip to navigation
- Skip to footer

**Usage:**
```tsx
<SkipLinks
  links={[
    { target: '#main-content', label: 'Skip to main content' },
    { target: '#sidebar', label: 'Skip to sidebar' },
  ]}
/>
```

### Focus Management

- Trap focus in modals and dialogs
- Restore focus on dialog close
- Visible focus indicators
- Keyboard navigation support

## Developer Notes

### Layout State Persistence

Layout state is persisted via Zustand stores with Dexie persistence:

```typescript
// useIDEStore handles layout state
const useIDEStore = create<IDELayoutState>()(
  persist(
    (set) => ({
      leftSidebarWidth: 280,
      isLeftSidebarOpen: true,
      // ...
    }),
    {
      name: 'ide-layout',
      partialize: (state) => ({
        leftSidebarWidth: state.leftSidebarWidth,
        isLeftSidebarOpen: state.isLeftSidebarOpen,
      }),
    }
  )
);
```

### Performance Considerations

- Memoize expensive layout calculations
- Use `ResizeObserver` for panel resizing
- Debounce state saves for resizing
- Lazy load non-critical layout sections

### Custom Layouts

For new pages, follow the layout pattern:

```tsx
// Example: NewPageLayout.tsx
export function NewPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout>
      <div className="page-container">
        <aside className="page-sidebar">
          <PageSidebar />
        </aside>
        <main className="page-content">
          {children}
        </main>
      </div>
    </MainLayout>
  );
}
```
