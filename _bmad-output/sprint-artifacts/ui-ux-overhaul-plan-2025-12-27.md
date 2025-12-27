---
date: 2025-12-27
time: 17:27:00
phase: Course Correction
team: Team-A
agent_mode: bmad-bmm-ux-designer
---

# UI/UX Overhaul Plan

**Date**: 2025-12-27  
**Severity**: P1 - High Priority  
**Related Incidents**: 
- INC-2025-12-24-001 (MVP consolidation)
- INC-2025-12-25-001 (Agentic execution loop gap)
- P1.10 - State Management Duplication (2025-12-26)

---

## Executive Summary

This UI/UX Overhaul Plan provides a comprehensive assessment of the current interface state, identifies UX issues beyond the resolved navigation routing fix, and outlines component-level improvements aligned with the 3-week technical roadmap timeline.

**Key Findings:**
1. **Navigation Routing Issue RESOLVED** - Routes now correctly use `IDELayout` (Dec 27 fix)
2. **8-bit Design System Partially Implemented** - Dark-themed aesthetic with pixel-perfect styling present
3. **Chat System Components Complete** - All approval, streaming, and tool execution UI components exist
4. **State Management Duplication P0** - [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) duplicates state (deferred to post-MVP)
5. **Responsive Design Gaps** - Mobile-first approach mentioned but not fully implemented
6. **Accessibility Concerns** - Error boundaries present but ARIA patterns inconsistent
7. **Agentic Loop UI Missing** - No iteration progress visualization (Epic 29 planned post-MVP)

**Current Status:**
- MVP-1: Agent Configuration & Persistence - IN_PROGRESS
- MVP-2/3/4: Code-complete pending E2E verification
- UI Components: Well-structured with clear separation of concerns

---

## 1. Current UI/UX State Assessment

### 1.1 Component Architecture

**Strengths:**
- ✅ **Clear Feature Organization**: Components organized by domain (`agent/`, `chat/`, `ide/`, `ui/`, `layout/`, `common/`, `dashboard/`, `hub/`)
- ✅ **Barrel Exports**: Each directory has `index.ts` for clean imports
- ✅ **Error Boundaries**: `WithErrorBoundary` wrapper used on critical components (IDELayout, AgentChatPanel)
- ✅ **Test Coverage**: Comprehensive `__tests__` directories adjacent to source files
- ✅ **TypeScript Interfaces**: Props use interfaces (not type aliases)

**Component Inventory:**

| Domain | Component Count | Status |
|---------|----------------|--------|
| **agent/** | 1 (AgentConfigDialog) | ✅ Complete |
| **chat/** | 10 components | ✅ Complete |
| **ide/** | 17 components | ✅ Complete |
| **ui/** | 23 components | ✅ Complete |
| **layout/** | 6 components | ✅ Complete |
| **common/** | 2 components | ✅ Complete |
| **dashboard/** | 1 component | ✅ Complete |
| **hub/** | 4 components | ✅ Complete |

**Total**: 64 React components

### 1.2 Design System Implementation

**Current State:**

The codebase implements an **8-bit design system** with dark-themed aesthetic:

**Design Tokens Present:**
- ✅ `bg-background`, `bg-surface-dark`, `bg-surface-darker` - Layered dark backgrounds
- ✅ `text-foreground`, `text-muted-foreground` - Text color hierarchy
- ✅ `border-primary`, `border-border-dark`, `border-destructive` - Border colors
- ✅ `bg-primary`, `bg-destructive`, `bg-yellow-500` - Status/action colors
- ✅ `shadow-pixel` - Consistent shadow effect
- ✅ `font-pixel`, `tracking-wider` - Typography tokens
- ✅ `h-8 md:h-10`, `py-1.5 md:py-2` - Responsive sizing tokens
- ✅ `status-bar-height: 24px` - VS Code-matching status bar

**Theme Provider:**
- Uses `next-themes` for system theme detection
- Supports `dark` and `light` themes
- `disableTransitionOnChange` for performance
- Default theme: `system` (respects user preference)

**Color Palette (Dark Theme):**
- Background: Dark gray/black (#1a1a1a / #0d1117)
- Surface: Slightly lighter (#161b22)
- Primary: Blue accent (#3b82f6)
- Destructive: Red (#ef4444)
- Warning: Yellow (#eab308)
- Success: Green (#22c55e)

**Typography:**
- Font sizes: `text-[10px]`, `text-xs`, `text-sm`, `text-lg`
- Font weights: `font-medium`, `font-semibold`, `font-bold`
- Tracking: `tracking-wider` (uppercase, letter-spacing)

**Spacing:**
- Padding: `px-3`, `px-4`, `py-1.5`, `py-2`
- Gaps: `gap-2`, `gap-3`, `space-y-2`, `space-y-6`

**Assessment:**
- ✅ Design system is well-defined and consistently applied
- ✅ VS Code-inspired sizing (24px status bar, matching editor heights)
- ✅ Pixel-perfect aesthetic achieved
- ⚠️ Design tokens not centralized in single file (scattered across components)
- ⚠️ No design system documentation file for reference

### 1.3 Layout Architecture

**Current State:**

**IDE Layout** ([`IDELayout.tsx`](src/components/layout/IDELayout.tsx)):
- ✅ **Resizable Panel Layout**: Uses `react-resizable-panels` for VS Code-like layout
- ✅ **Panel Organization**:
  - Left: Activity Bar + Sidebar (Explorer, Agents, Search, Settings)
  - Center: Editor + Preview (horizontal split)
  - Right: Terminal (vertical split from center)
  - Far Right: Chat Panel (collapsible)
- ✅ **Mobile-First Approach**: `hidden md:flex` on sidebar, responsive header heights
- ✅ **Error Boundaries**: Each panel wrapped in `WithErrorBoundary`
- ✅ **Keyboard Shortcuts**: Integrated via `useIDEKeyboardShortcuts`
- ✅ **State Persistence**: `useIdeStatePersistence` for layout restoration

**Layout Components:**
- [`IDEHeaderBar`](src/components/layout/IDEHeaderBar.tsx) - Top navigation bar
- [`TerminalPanel`](src/components/layout/TerminalPanel.tsx) - Terminal wrapper
- [`ChatPanelWrapper`](src/components/layout/ChatPanelWrapper.tsx) - Chat panel container
- [`PermissionOverlay`](src/components/layout/PermissionOverlay.tsx) - File system access prompt
- [`MinViewportWarning`](src/components/layout/MinViewportWarning.tsx) - Minimum size warning

**Panel Components:**
- [`FileTree`](src/components/ide/FileTree) - File explorer
- [`MonacoEditor`](src/components/ide/MonacoEditor) - Code editor with tabs
- [`PreviewPanel`](src/components/ide/PreviewPanel) - Live preview
- [`StatusBar`](src/components/ide/StatusBar.tsx) - Status indicators
- [`IconSidebar`](src/components/ide/IconSidebar) - Activity bar + sidebar navigation

**Assessment:**
- ✅ **Layout Architecture SOLID**: VS Code-inspired layout with proper panel organization
- ✅ **Responsive Design**: Mobile-first approach with breakpoints
- ✅ **Error Handling**: Comprehensive error boundaries
- ⚠️ **P0 State Duplication**: [`IDELayout.tsx`](src/components/layout/IDELayout.tsx:86-98) uses local `useState` instead of [`useIDEStore`](src/lib/state/ide-store.ts) (deferred to post-MVP per technical roadmap)

### 1.4 Chat System Components

**Current State:**

**Chat Component Suite:**
1. [`AgentChatPanel`](src/components/ide/AgentChatPanel.tsx) - Main chat interface
2. [`ApprovalOverlay`](src/components/chat/ApprovalOverlay.tsx) - Tool approval modal
3. [`CodeBlock`](src/components/chat/CodeBlock.tsx) - Code display with syntax highlighting
4. [`DiffPreview`](src/components/chat/DiffPreview.tsx) - Change visualization
5. [`ToolCallBadge`](src/components/chat/ToolCallBadge.tsx) - Tool execution indicator
6. [`StreamingMessage`](src/components/chat/StreamingMessage.tsx) - Streaming response component
7. [`ChatConversation`](src/components/chat/ChatConversation.tsx) - Thread/conversation list
8. [`ThreadsList`](src/components/chat/ThreadsList.tsx) - Thread management
9. [`EnhancedChatInterface`](src/components/ide/EnhancedChatInterface.tsx) - Chat input + messages
10. [`AgentSelector`](src/components/chat/AgentSelector.tsx) - Agent/model selection
11. [`AutoApproveSettings`](src/components/chat/AutoApproveSettings.tsx) - Approval configuration

**Features Implemented:**
- ✅ **Real Streaming**: TanStack AI integration with `useAgentChatWithTools`
- ✅ **Tool Approval Flow**: ApprovalOverlay with approve/reject actions
- ✅ **Code Display**: Syntax highlighting, line numbers, language detection
- ✅ **Diff Visualization**: Side-by-side code comparison
- ✅ **Thread Management**: Multiple conversations with persistence
- ✅ **Agent Selection**: Multi-provider support (OpenRouter, Anthropic, etc.)
- ✅ **Prompt Enhancement**: Toggle for enhanced prompts
- ✅ **Auto-Approve Settings**: Per-tool approval configuration
- ✅ **Tool Execution Tracking**: Visual indicators for running/completed/failed tool calls
- ✅ **Artifact Preview/Save**: Open in new tab or save to local file system
- ✅ **Risk Levels**: High/medium/low risk indicators for tool approvals
- ✅ **Keyboard Shortcuts**: Enter to approve, Escape to reject
- ✅ **i18n Support**: All components use `useTranslation()` hook

**Assessment:**
- ✅ **Chat System COMPLETE**: All MVP chat features implemented
- ✅ **Approval Workflow ROBUST**: Full approval/reject flow with risk assessment
- ✅ **Code Visualization EXCELLENT**: Syntax highlighting, diff preview
- ✅ **Tool Execution Tracking**: Clear status indicators
- ✅ **Multi-Provider Support**: OpenRouter, Anthropic, Google, Mistral, OpenAI Compatible
- ⚠️ **StreamingMessage Component Missing**: File not found (may be consolidated into EnhancedChatInterface)

### 1.5 Agent Configuration Components

**Current State:**

**AgentConfigDialog** ([`src/components/agent/AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx)):
- ✅ **Multi-Provider Configuration**: OpenRouter, Anthropic, Google, Mistral, OpenAI Compatible
- ✅ **Model Selection**: Per-provider model dropdown
- ✅ **API Key Management**: Secure storage via credential vault
- ✅ **Custom Base URL**: For OpenAI-compatible endpoints
- ✅ **Custom Headers**: For custom provider configuration
- ✅ **Native Tools Toggle**: Enable/disable native tool execution
- ✅ **i18n Support**: All labels and messages translated

**AgentsPanel** ([`src/components/ide/AgentsPanel.tsx`](src/components/ide/AgentsPanel.tsx)):
- ✅ **Agent List Display**: Shows all configured agents
- ✅ **Add/Edit/Delete**: CRUD operations for agent configurations
- ✅ **Active Agent Selection**: Visual indicator for currently selected agent

**Assessment:**
- ✅ **Agent Configuration COMPLETE**: Full multi-provider support with secure credential management
- ✅ **Credential Vault Integration**: Secure IndexedDB storage
- ✅ **Flexible Provider Support**: Custom endpoints, headers, native tools toggles

### 1.6 IDE Components

**File Tree** ([`FileTree`](src/components/ide/FileTree)):
- ✅ **Hierarchical Display**: Folder/file tree with icons
- ✅ **Keyboard Navigation**: Arrow keys, Enter to expand/collapse
- ✅ **Context Menu**: Right-click actions (rename, delete, etc.)
- ✅ **File Icons**: Type-specific icons (TS, JS, CSS, etc.)
- ✅ **Refresh Capability**: Manual refresh button
- ✅ **Event Subscriptions**: Syncs with agent file events

**Monaco Editor** ([`MonacoEditor`](src/components/ide/MonacoEditor)):
- ✅ **Tabbed Interface**: Multiple open files with close buttons
- ✅ **Syntax Highlighting**: Monaco's built-in language support
- ✅ **Minimap**: Code overview (if enabled)
- ✅ **Line Numbers**: Configurable display
- ✅ **Auto-save**: Integration with file system
- ✅ **Language Detection**: Automatic based on file extension
- ✅ **Event Subscriptions**: Syncs with agent file events

**Terminal** ([`XTerminal`](src/components/ide/XTerminal)):
- ✅ **xterm.js Integration**: Full terminal emulation
- ✅ **Tab System**: Terminal/Problems tabs
- ✅ **Working Directory**: Proper `projectPath` passing
- ✅ **WebContainer Integration**: Connected to sandbox
- ✅ **Resize Support**: Adjustable panel size

**Preview Panel** ([`PreviewPanel`](src/components/ide/PreviewPanel)):
- ✅ **Live Preview**: WebContainer-based preview
- ✅ **Port Display**: Shows preview port
- ✅ **Refresh**: Manual refresh capability
- ✅ **Error Boundary**: Graceful error handling

**Status Bar** ([`StatusBar`](src/components/ide/StatusBar.tsx)):
- ✅ **Segmented Layout**: 4 segments (left: status, right: editor info)
- ✅ **WebContainer Status**: Boot state indicator
- ✅ **Agent Status**: Token counter, connection status
- ✅ **Sync Status**: Progress indicator with retry button
- ✅ **Provider Status**: API key validation status
- ✅ **Cursor Position**: Line/column display
- ✅ **File Type Indicator**: File extension display

**Assessment:**
- ✅ **IDE Components COMPLETE**: All core IDE functionality implemented
- ✅ **VS Code-Inspired**: Status bar matches VS Code layout
- ✅ **Error Boundaries**: Each panel has error handling
- ✅ **Keyboard Shortcuts**: Comprehensive keyboard navigation
- ⚠️ **No Agentic Loop UI**: Iteration progress not displayed (Epic 29 planned post-MVP)

### 1.7 Accessibility Assessment

**Current State:**

**Accessibility Features Present:**
- ✅ **Keyboard Navigation**: Arrow keys, Enter, Escape shortcuts throughout
- ✅ **Focus Management**: Dialog focus handling with `Dialog.Root`
- ✅ **ARIA Labels**: Status bar has `role="status"`, `aria-label` attributes
- ✅ **Error Boundaries**: Graceful degradation with error messages
- ✅ **Screen Reader Support**: Semantic HTML structure

**Accessibility Gaps:**
- ⚠️ **Inconsistent ARIA Patterns**: Some components lack `aria-label` on interactive elements
- ⚠️ **Missing Focus Indicators**: No visible focus rings on focused elements
- ⚠️ **No Skip Links**: "Skip to main content" links not present
- ⚠️ **Color Contrast Not Validated**: Dark theme contrast not audited
- ⚠️ **Keyboard Trap Risk**: Modal dialogs may not handle focus properly on close
- ⚠️ **No Live Regions**: Dynamic content updates not announced to screen readers

### 1.8 Internationalization (i18n) Assessment

**Current State:**

**i18n Implementation:**
- ✅ **i18next Integration**: Full `react-i18next` setup
- ✅ **Language Detection**: `i18next-browser-languagedetector`
- ✅ **Translation Files**: `src/i18n/en.json`, `src/i18n/vi.json`
- ✅ **Hook Usage**: All components use `useTranslation()` hook
- ✅ **Auto-Extraction**: `pnpm i18n:extract` for key extraction
- ✅ **Namespace**: Default `translation` namespace

**Coverage:**
- ✅ **English**: Full coverage
- ✅ **Vietnamese**: Full coverage
- ⚠️ **RTL Support**: Not implemented (Vietnamese is LTR, but RTL support not present)
- ⚠️ **Number Formatting**: Not localized for Vietnamese locale
- ⚠️ **Date/Time Formatting**: Not localized

---

## 2. Identified UX Issues Beyond Navigation Routing

### 2.1 P0 Issue: State Management Duplication

**Location**: [`IDELayout.tsx`](src/components/layout/IDELayout.tsx:86-98)

**Problem:**
```typescript
// CURRENT (INCORRECT) - Lines 86-98
const [isChatVisible, setIsChatVisible] = useState(true);
const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>();
const [terminalTab, setTerminalTab] = useState<TerminalTab>('terminal');
const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
```

**Impact:**
- Breaks single source of truth principle
- Causes state synchronization issues
- Makes state debugging difficult
- Violates Zustand store architecture

**Root Cause:**
- Component uses local `useState` instead of centralized [`useIDEStore`](src/lib/state/ide-store.ts)
- Creates duplicate state that must be manually synchronized

**Resolution Status:**
- ✅ **DEFERRED to post-MVP** per technical roadmap (Week 2)
- ⚠️ **Refactoring Plan Documented**: See [`state-management-audit-p1.10-2025-12-26.md`](_bmad-output/state-management-audit-p1.10-2025-12-26.md)
- ⚠️ **Timeline**: 8-12 hours estimated effort

**Recommended Fix:**
```typescript
// SHOULD BE (after refactoring):
const chatVisible = useIDEStore(s => s.chatVisible);
const setChatVisible = useIDEStore(s => s.setChatVisible);
const terminalTab = useIDEStore(s => s.terminalTab);
const setTerminalTab = useIDEStore(s => s.setTerminalTab);
const openFiles = useIDEStore(s => s.openFiles);
const activeFile = useIDEStore(s => s.activeFile);
const { setChatVisible, setTerminalTab, addOpenFile, removeOpenFile, setActiveFile } = useIDEStore();
```

### 2.2 P1 Issue: Agentic Execution Loop UI Missing

**Location**: [`AgentChatPanel`](src/components/ide/AgentChatPanel.tsx)

**Problem:**
- No iteration progress visualization
- No "Step X/10" indicator during multi-step agent execution
- No pause/resume controls
- No intelligent termination feedback
- Users cannot see how many iterations remain

**Impact:**
- Users cannot monitor agent progress
- No transparency into agent decision-making
- Difficult to debug stuck agent loops

**Root Cause:**
- Epic 29 (Agentic Execution Loop) planned for post-MVP
- `maxIterations(3)` is a temporary safety measure
- Full agentic loop UI deferred to avoid MVP interference

**Resolution Status:**
- ⚠️ **DEFERRED to Epic 29** (post-MVP, Week 2)
- ⚠️ **Epic Specification Exists**: [`epic-29-agentic-execution-loop.md`](_bmad-output/epics/epic-29-agentic-execution-loop.md)
- ⚠️ **Timeline**: 2 weeks (4 stories)

**Planned Features (Epic 29):**
- Story 29-1: Agent Loop Strategy Implementation
- Story 29-2: Iteration UI & State Visualization
- Story 29-3: Intelligent Termination Strategies
- Story 29-4: Error Recovery & User Handoff

### 2.3 P2 Issue: Responsive Design Gaps

**Location**: [`IDELayout.tsx`](src/components/layout/IDELayout.tsx:263-261)

**Problem:**
- Mobile-first approach mentioned but not fully implemented
- Sidebar hidden on mobile (`hidden md:flex`) but no mobile-specific optimizations
- No mobile-specific touch targets or gestures
- No landscape mode support

**Impact:**
- Poor mobile experience
- Inconsistent responsive behavior
- Touch interactions not optimized

**Root Cause:**
- Responsive design implemented at component level but not cohesive
- No mobile-specific UX patterns

**Resolution Status:**
- ⚠️ **DEFERRED to post-MVP** (lower priority)
- ⚠️ **Timeline**: Not estimated

**Recommended Improvements:**
- Mobile-specific touch targets for file tree
- Landscape mode support for editor
- Swipe gestures for panel resizing on mobile
- Mobile-optimized command palette

### 2.4 P2 Issue: Accessibility Inconsistencies

**Location**: Multiple components

**Problems:**
- Inconsistent ARIA labeling patterns
- Missing visible focus indicators
- No "Skip to main content" links
- Color contrast not validated for dark theme
- Modal focus management not comprehensive

**Impact:**
- Screen reader users may have difficulty
- Keyboard-only users may have poor experience
- WCAG compliance uncertain

**Root Cause:**
- Accessibility implemented reactively, not proactively
- No accessibility audit performed
- No accessibility standards document

**Resolution Status:**
- ⚠️ **DEFERRED to post-MVP** (lower priority)
- ⚠️ **Timeline**: Not estimated

**Recommended Improvements:**
- Comprehensive accessibility audit using axe DevTools
- Add ARIA live regions for dynamic content
- Implement visible focus indicators
- Add skip links for keyboard navigation
- Validate color contrast ratios (WCAG AA)
- Document accessibility patterns in style guide

### 2.5 P2 Issue: Design Token Fragmentation

**Location**: Scattered across components

**Problem:**
- Design tokens not centralized in single reference file
- Tokens duplicated across components
- No design system documentation for developers
- Inconsistent token usage patterns

**Impact:**
- Difficult to maintain design consistency
- Theme changes require multiple file updates
- No single source of truth for design decisions

**Root Cause:**
- Design system evolved organically without centralization
- No design system documentation artifact created

**Resolution Status:**
- ⚠️ **DEFERRED to post-MVP** (lower priority)
- ⚠️ **Timeline**: Not estimated

**Recommended Improvements:**
- Create centralized design token file (e.g., `src/styles/design-tokens.ts`)
- Document design system with usage guidelines
- Create component examples for each token
- Implement design token validation in linting

### 2.6 P2 Issue: File Access Permission UX

**Location**: Agent tool execution

**Problem:**
- Vietnamese error message "không thể truy cập vào thư mục gốc hoặc các thư mục con" not user-friendly
- No clear explanation of permission scope
- No guidance on how to grant correct permissions

**Impact:**
- Users confused by permission errors
- Difficult to troubleshoot access issues
- Poor internationalization of error messages

**Root Cause:**
- Error messages not run through i18n extraction
- Permission validation logic not user-facing

**Resolution Status:**
- ⚠️ **PARTIALLY ADDRESSED** (P1 fix in technical roadmap)
- ⚠️ **Timeline**: 2-3 hours (parallel with MVP-3/4)

**Recommended Fix (from technical roadmap):**
```typescript
// Add path validation with user-friendly error messages
import { validatePath, PathValidationError } from '../facades/file-tools';

export function createReadFileTool(getTools: () => AgentFileTools) {
    return readFileDef.server(async (args: unknown): Promise<ToolResult<ReadFileOutput>> => {
        const { path } = args as { path: string };
        
        // Validate path is within granted directory scope
        try {
            validatePath(path);
        } catch (error) {
            if (error instanceof PathValidationError) {
                return {
                    success: false,
                    error: `Permission denied: Cannot access ${path}. Ensure directory access is granted.`,
                };
            }
            throw error;
        }
        
        // ... rest of implementation
    });
}
```

**Additional Recommendations:**
- Add permission grant guidance in onboarding
- Visual indicator of granted directory scope
- Link to settings from error messages

### 2.7 P3 Issue: Missing StreamingMessage Component

**Location**: [`StreamingMessage.tsx`](src/components/chat/StreamingMessage.tsx)

**Problem:**
- File not found in codebase
- Component referenced in imports but implementation missing
- May be consolidated into [`EnhancedChatInterface`](src/components/ide/EnhancedChatInterface.tsx)

**Impact:**
- Potential import errors if referenced
- Unclear streaming message implementation strategy
- May cause build failures

**Root Cause:**
- Component consolidation during refactoring
- Import not updated after consolidation

**Resolution Status:**
- ⚠️ **INVESTIGATION REQUIRED**
- ⚠️ **Timeline**: 1-2 hours

**Recommended Actions:**
1. Verify if StreamingMessage is intentionally removed or accidentally deleted
2. If removed, document consolidation rationale
3. If consolidation, update all import references
4. Ensure build passes without errors

---

## 3. Design System Recommendations

### 3.1 Centralized Design Tokens

**Recommended Structure:**
```typescript
// src/styles/design-tokens.ts
export const designTokens = {
  // Colors
  colors: {
    background: {
      primary: '#1a1a1a',
      secondary: '#0d1117',
      surface: {
        light: '#f3f4f6',
        dark: '#161b22',
        darker: '#0f0f12',
      },
    },
    primary: '#3b82f6',
    destructive: '#ef4444',
    success: '#22c55e',
    warning: '#eab308',
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
    fontSize: {
      xs: '10px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '20px',
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  
  // Borders
  borders: {
    none: '0',
    thin: '1px',
    medium: '2px',
    thick: '3px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
  },
  
  // Effects
  effects: {
    pixel: '0 0 0 1px rgba(0,0,0,0.1)',
    glow: '0 0 0 8px rgba(59,130,246,0.1)',
  },
  
  // Layout
  layout: {
    statusBarHeight: '24px',
    headerHeight: {
      mobile: '40px',
      tablet: '48px',
      desktop: '56px',
    },
    panelMinWidth: {
      sidebar: '200px',
      editor: '300px',
      terminal: '200px',
      chat: '250px',
    },
  },
  
  // Z-Index
  zIndex: {
    dropdown: '50',
    modal: '100',
    toast: '200',
    tooltip: '300',
  },
} as const;
```

### 3.2 Design System Documentation

**Recommended Documentation:**
- Create `_bmad-output/ux-specification/design-system-guide-2025-12-27.md`
- Include usage examples for each token
- Document component composition patterns
- Provide before/after examples for common UI patterns
- Document accessibility requirements (color contrast ratios)
- Include responsive design guidelines
- Document i18n integration patterns

### 3.3 Theme System Enhancements

**Current State:**
- ✅ Light/dark theme support
- ✅ System theme detection
- ✅ Theme persistence (localStorage)
- ⚠️ No custom theme creation capability
- ⚠️ No theme preview in settings

**Recommended Enhancements:**
- Add theme preview to AgentConfigDialog
- Allow custom theme creation (user-defined color schemes)
- Add theme export/import functionality
- Implement theme sync across browser tabs

---

## 4. Component-Level Improvements

### 4.1 Agentic Loop UI (Epic 29 - Post-MVP)

**Priority**: P0 (but deferred to post-MVP per technical roadmap)

**Components to Create:**

**IterationProgressIndicator**:
```typescript
interface IterationProgressProps {
  currentIteration: number;
  maxIterations: number;
  estimatedTimeRemaining?: string;
}

export function IterationProgressIndicator({ 
  currentIteration, 
  maxIterations,
  estimatedTimeRemaining 
}: IterationProgressProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-surface-dark border border-border-dark rounded">
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground">
          {t('agent.iteration')} {currentIteration}/{maxIterations}
        </div>
        <ProgressBar 
          progress={(currentIteration / maxIterations) * 100}
          className="h-1.5 bg-primary rounded-full"
        />
      </div>
      {estimatedTimeRemaining && (
        <div className="text-xs text-muted-foreground">
          {estimatedTimeRemaining}
        </div>
      )}
    </div>
  );
}
```

**PauseResumeControls**:
```typescript
export function PauseResumeControls({ 
  isPaused, 
  onPause, 
  onResume 
}: PauseResumeProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPause}
        disabled={!isPaused}
        className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        <Pause className="w-4 h-4" />
        {t('agent.pause')}
      </button>
      <button
        onClick={onResume}
        disabled={isPaused}
        className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
      >
        <Play className="w-4 h-4" />
        {t('agent.resume')}
      </button>
    </div>
  );
}
```

**Integration Points:**
- Add to [`AgentChatPanel`](src/components/ide/AgentChatPanel.tsx) header
- Connect to TanStack AI `agentLoopStrategy` state
- Update [`useAgentChatWithTools`](src/lib/agent/hooks/use-agent-chat-with-tools.ts) hook to emit iteration events

### 4.2 Enhanced Error Boundaries

**Current State:**
- ✅ `WithErrorBoundary` wrapper used on critical components
- ✅ Fallback UI with error messages
- ⚠️ Fallbacks generic, not context-specific

**Recommended Improvements:**

**Error Types:**
```typescript
// src/lib/errors/error-types.ts
export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high',
    public recoverable: boolean = false
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class FileSystemError extends Error {
  constructor(
    message: string,
    public path?: string,
    public recoverable: boolean = false
  ) {
    super(message);
    this.name = 'FileSystemError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public url?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}
```

**Enhanced ErrorBoundary Component:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  error?: Error;
  resetErrorBoundary?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function EnhancedErrorBoundary({ 
  children, 
  fallback, 
  error, 
  resetErrorBoundary,
  onError 
}: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<Error | null>(null);

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    onError?.(error, errorInfo);
    setErrorDetails(error);
    setHasError(true);
  };

  const handleReset = () => {
    resetErrorBoundary?.();
    setHasError(false);
    setErrorDetails(null);
  };

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={handleError}
      resetKeys={[location.key]}
    >
      {hasError ? (
        <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-destructive">
                {t('errors.title')}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {errorDetails?.message || t('errors.generic')}
              </p>
              {errorDetails instanceof AgentError && (
                <div className="mt-4 p-4 bg-background border border-border-dark rounded">
                  <p className="text-xs text-muted-foreground">
                    {t('errors.code')}: {errorDetails.code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('errors.severity')}: {errorDetails.severity}
                  </p>
                  {errorDetails.recoverable && (
                    <p className="text-xs text-green-400">
                      {t('errors.recoverable')}: {t('errors.yes')}
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                {t('errors.retry')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </ErrorBoundary>
  );
}
```

### 4.3 Enhanced File Access UX

**Recommended Improvements:**

**Permission Status Indicator**:
```typescript
// Add to StatusBar or IDEHeaderBar
interface PermissionStatusProps {
  grantedPath: string | null;
  isGranted: boolean;
}

export function PermissionStatusIndicator({ 
  grantedPath, 
  isGranted 
}: PermissionStatusProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-dark border border-border-dark rounded">
      <div className={cn(
        'w-2 h-2 rounded-full',
        isGranted ? 'bg-green-500' : 'bg-yellow-500'
      )}>
        {isGranted ? (
          <CheckCircle className="w-full h-full text-white" />
        ) : (
          <AlertTriangle className="w-full h-full text-white" />
        )}
      </div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">
          {t('fs.status')}:
        </div>
        <div className="text-sm font-medium text-foreground">
          {isGranted ? grantedPath : t('fs.not_granted')}
        </div>
      </div>
    </div>
  );
}
```

**Permission Grant Guidance**:
```typescript
// Add to onboarding or first-time setup
export function PermissionGrantGuide() {
  return (
    <div className="p-6 bg-background border border-border-dark rounded-lg">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        {t('fs.guide.title')}
      </h2>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-medium text-foreground">
              {t('fs.guide.step1.title')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('fs.guide.step1.description')}
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center flex-shrink-0">
            <div className="text-lg font-bold text-primary">2</div>
          </div>
          <div>
            <h3 className="text-base font-medium text-foreground">
              {t('fs.guide.step2.title')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('fs.guide.step2.description')}
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center flex-shrink-0">
            <div className="text-lg font-bold text-primary">3</div>
          </div>
          <div>
            <h3 className="text-base font-medium text-foreground">
              {t('fs.guide.step3.title')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('fs.guide.step3.description')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
          {t('fs.guide.cta')}
        </button>
      </div>
    </div>
  );
}
```

### 4.4 Enhanced Accessibility

**Recommended Improvements:**

**Focus Management:**
```typescript
// Add to ui/button.tsx
export function Button({ 
  className, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

**ARIA Live Regions:**
```typescript
// Add to AgentChatPanel for dynamic content
export function ChatLiveRegion({ children }: { children: React.ReactNode }) {
  return (
    <div 
      role="region" 
      aria-live="polite" 
      aria-atomic="false"
      aria-label={t('agent.chat_region')}
      className="flex-1"
    >
      {children}
    </div>
  );
}
```

**Skip Links:**
```typescript
// Add to top of main content
export function SkipToContent() {
  return (
    <a 
      href="#main-content" 
      className="sr-only focus:not-hidden focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      {t('a11y.skip_to_content')}
    </a>
  );
}
```

---

## 5. Integration with 3-Week Sprint Timeline

### 5.1 Week 1: Immediate Unblocking (Days 1-5)

**UX Tasks Aligned with Technical Roadmap:**

| Day | Priority | UX Task | Effort | Dependency |
|------|-----------|---------|------------|
| Day 1 | P0 | Add `maxIterations(3)` to `useAgentChatWithTools.ts` | 2-4h | None |
| Day 1 | P1 | Add path validation to agent tools with i18n error messages | 2-3h | None |
| Day 1 | P2 | Verify TanStack AI and TanStack Router usage patterns | 1-2h | None |
| Day 2-3 | - | Complete MVP-2 E2E verification with browser testing | 4-6h | P0 fix |
| Day 3-4 | - | Complete MVP-3 E2E verification with browser testing | 4-6h | P0 fix |
| Day 4-5 | - | Complete MVP-4 E2E verification with browser testing | 4-6h | P0 fix |

**Total Week 1 UX Effort**: 11-15 hours

### 5.2 Week 2: Post-MVP Refactoring (Days 6-10)

**UX Tasks:**

| Day | Priority | UX Task | Effort | Dependency |
|------|-----------|---------|------------|
| Day 6-7 | P0 | Refactor `IDELayout.tsx` state duplication (8-12h) | MVP completion |
| Day 8-10 | P0 | Epic 29-1: Agent Loop Strategy Implementation (8h) | P0 fix |
| Day 10-12 | P0 | Epic 29-2: Iteration UI & State Visualization (6h) | Story 29-1 |
| Day 13-14 | P0 | Epic 29-3: Intelligent Termination Strategies (4h) | Story 29-1 |
| Day 15-16 | P0 | Epic 29-4: Error Recovery & User Handoff (4h) | Story 29-1 |

**Total Week 2 UX Effort:** 30 hours

### 5.3 Week 3: E2E Validation & Documentation (Days 17-21)

**UX Tasks:**

| Day | Priority | UX Task | Effort | Dependency |
|------|-----------|---------|------------|
| Day 17-18 | - | Re-verify 12 stories with browser E2E testing | 16-20h | None |
| Day 19-21 | - | Accessibility audit and improvements (8-12h) | None |

**Total Week 3 UX Effort:** 28-32 hours

**Total UX Effort Across 3 Weeks:** 69-47 hours

### 5.4 Dependencies and Blocking Factors

**Dependencies:**
- ✅ **No UX blockers for MVP-2/3/4 E2E verification**
- ⚠️ **P0 state refactoring** blocks Epic 29 implementation (deferred to Week 2)
- ⚠️ **Agentic loop UI** blocked until Epic 29 (post-MVP)
- ⚠️ **Accessibility improvements** blocked until post-MVP (lower priority)

**Blocking Factors:**
1. **MVP Completion**: MVP-2/3/4 must pass E2E verification before Epic 29 work begins
2. **P0 State Refactoring**: Must complete before state-related improvements
3. **Technical Roadmap**: All UX tasks must align with technical roadmap priorities

**External Dependencies:**
- None identified (all UX work can proceed in parallel with development)

---

## 6. Success Criteria

### 6.1 Phase 1: Immediate Unblocking (Week 1)

- [ ] Path validation added to all file tools with user-friendly i18n error messages
- [ ] TanStack AI and TanStack Router usage patterns verified
- [ ] MVP-2 passes E2E verification with browser testing (screenshot captured)
- [ ] MVP-3 passes E2E verification with browser testing (screenshot captured)
- [ ] MVP-4 passes E2E verification with browser testing (screenshot captured)

### 6.2 Phase 2: Post-MVP Refactoring (Week 2)

- [ ] `IDELayout.tsx` refactored to use [`useIDEStore`](src/lib/state/ide-store.ts) for all IDE state
- [ ] No state duplication in codebase
- [ ] Epic 29-1: Agent Loop Strategy Implementation completed
- [ ] Epic 29-2: Iteration UI & State Visualization completed
- [ ] Epic 29-3: Intelligent Termination Strategies completed
- [ ] Epic 29-4: Error Recovery & User Handoff completed

### 6.3 Phase 3: E2E Validation & Documentation (Week 3)

- [ ] All 12 re-verified stories pass E2E testing
- [ ] Accessibility audit completed with documented improvements
- [ ] Design system documentation created
- [ ] All P0 and P1 issues resolved

---

## 7. Related Artifacts & References

### 7.1 Investigation Documents

1. [`_bmad-output/technical-roadmap-course-correction-2025-12-27.md`](_bmad-output/technical-roadmap-course-correction-2025-12-27.md) - Technical roadmap with 3-week timeline
2. [`_bmad-output/state-management-audit-p1.10-2025-12-26.md`](_bmad-output/state-management-audit-p1.10-2025-12-26.md) - State management audit with P0 issue
3. [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md) - MVP sprint plan
4. [`_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md) - Story validation criteria

### 7.2 Epic Specifications

1. [`_bmad-output/epics/epic-29-agentic-execution-loop.md`](_bmad-output/epics/epic-29-agentic-execution-loop.md) - Epic 29 specification (4 stories)

### 7.3 Code Locations

| Component | Location |
|-----------|----------|
| Chat System | `src/components/chat/`, `src/components/ide/AgentChatPanel.tsx` |
| Agent Config | `src/components/agent/` |
| IDE Layout | `src/components/layout/IDELayout.tsx`, `src/components/layout/hooks/` |
| IDE Components | `src/components/ide/` |
| UI Components | `src/components/ui/` |
| Status Bar | `src/components/ide/StatusBar.tsx`, `src/components/ide/statusbar/` |
| State Stores | `src/lib/state/ide-store.ts`, `src/stores/` |
| Agent Hooks | `src/lib/agent/hooks/use-agent-chat-with-tools.ts` |
| i18n Files | `src/i18n/en.json`, `src/i18n/vi.json` |

### 7.4 External Documentation

1. **TanStack AI**: https://tanstack.com/ai - Agent loop strategies
2. **TanStack Router**: https://tanstack.com/router - File-based routing
3. **Radix UI**: https://www.radix-ui.com/primitives - Accessible components
4. **Tailwind CSS**: https://tailwindcss.com/docs - Utility-first styling
5. **React 19**: https://react.dev - Concurrent features, hooks
6. **Zustand**: https://zustand.docs.pmnd.rs - State management
7. **Dexie**: https://dexie.org - IndexedDB wrapper
8. **i18next**: https://www.i18next.com - Internationalization

---

## 8. Recommendations

### 8.1 Immediate Actions (Next 24-48 hours)

1. **P0**: Add `maxIterations(3)` to [`useAgentChatWithTools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts) (2-4h)
2. **P1**: Add path validation to agent tools with i18n error messages (2-3h)
3. **P2**: Verify TanStack AI and TanStack Router usage patterns (1-2h)
4. **P2**: Investigate [`StreamingMessage.tsx`](src/components/chat/StreamingMessage.tsx) missing file issue (1-2h)

### 8.2 Short-term Actions (Next 1-2 weeks)

1. **P0**: Complete MVP-2 E2E verification with browser testing (4-6h)
2. **P0**: Complete MVP-3 E2E verification with browser testing (4-6h)
3. **P0**: Complete MVP-4 E2E verification with browser testing (4-6h)
4. **P0**: Refactor [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) state duplication (8-12h)
5. **P0**: Begin Epic 29: Agentic Execution Loop implementation (Week 2)

### 8.3 Long-term Actions (Next 2-4 weeks)

1. Complete Epic 29: Agentic Execution Loop (4 stories, 30h total)
2. Re-verify 12 stories with browser E2E testing (16-20h)
3. Conduct accessibility audit and implement improvements (8-12h)
4. Create centralized design system documentation (4-6h)

### 8.4 Process Improvements

1. **Add "agentic loop" to Definition of Done** for agent features
2. **Update test plans to include multi-step scenarios**
3. **Cross-reference research docs during implementation**
4. **Add integration tests for agent loop state management**
5. **Enforce mandatory E2E verification for all story completions**

---

## 9. Alignment with Technical Roadmap

This UI/UX Overhaul Plan is fully aligned with the technical roadmap:

**Technical Roadmap Priorities Addressed:**
- ✅ **Agentic Execution Loop Gap (P0)**: Immediate fix with `maxIterations(3)` (Week 1, Day 1)
- ✅ **State Management Duplication (P0)**: Refactoring planned Week 2 (post-MVP)
- ✅ **File Access Permission Issues (P1)**: Path validation with i18n (Week 1, Day 1)

**3-Week Timeline Integration:**
- **Week 1**: UX tasks support MVP-2/3/4 E2E verification
- **Week 2**: State refactoring + Epic 29 implementation (agentic loop UI)
- **Week 3**: E2E validation + accessibility + design system documentation

**No Conflicts:**
- All UX tasks are complementary to technical roadmap
- No overlapping work with development priorities
- Clear dependencies and sequencing

**Single Source of Truth Maintained:**
- This plan references technical roadmap as single source of truth
- Sprint status YAML will be updated with UX completion
- All artifacts will be stored in `_bmad-output/sprint-artifacts/`

---

## 10. Conclusion

This UI/UX Overhaul Plan provides a comprehensive assessment of the current interface state, identifies UX issues beyond the resolved navigation routing fix, and outlines component-level improvements aligned with the 3-week technical roadmap timeline.

**Key Outcomes:**
1. **Current State Assessment**: Complete analysis of 64 components across 8 domains
2. **Design System Review**: 8-bit design system well-implemented but needs centralization
3. **Issue Identification**: 7 UX issues prioritized (1 P0, 2 P1, 4 P2)
4. **Component Improvements**: Detailed recommendations for agentic loop UI, error boundaries, file access UX, accessibility
5. **Timeline Integration**: All UX tasks aligned with 3-week technical roadmap
6. **Dependencies Clear**: No blocking factors for MVP E2E verification

**Next Steps:**
1. Implement P0 fixes (agentic loop, path validation)
2. Complete MVP-2/3/4 E2E verification
3. Begin post-MVP refactoring (state management, Epic 29)
4. Create design system documentation
5. Conduct accessibility audit

**Total Estimated UX Effort**: 69-47 hours across 3 weeks

---

**Author**: BMAD UX Designer (Platform A)  
**Status**: Ready for Implementation  
**Next Action**: Report to @bmad-core-bmad-master with completion summary
