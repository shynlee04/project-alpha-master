# Feature Group: Workspace-Specific Features - IDE

**Shard ID**: ARCH-SHARD-03-05
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Focus**: Workspace-Specific Features #1 - IDE (Monaco Editor, File Tree, Terminal, WebContainer)
**Status**: COMPLETE - DEEP ANALYSIS

---

## 1. Architecture → IDE Mapping

### 1.1 Architecture Groups Involved

| Architecture Group | Files | Issue Severity | Impact on IDE |
|--------------------|-------|----------------|----------------|
| **A: State & Stores** | `ide-store.ts`, `useIDEStore.ts` | ✅ GOOD | Slice pattern working |
| **A: State & Stores** | `ide-editor-slice.ts`, `ide-explorer-slice.ts` | ✅ GOOD | Well-structured |
| **A: State & Stores** | `MonacoEditor.tsx` | P1 | GOD COMPONENT (772 lines) |
| **F: Layers & Boundaries** | `MonacoEditor.tsx` | P1 | Business logic in UI |
| **D: API & Data Flow** | `file-tools-impl.ts`, `terminal-tools-impl.ts` | ⚠️ | Working but could be cleaner |
| **C: Persistence** | `ide-state-storage.ts` | ✅ GOOD | Well-designed |

### 1.2 IDE Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         IDE WORKSPACE ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     IDE STORE LAYER                              │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │              useIDEStore (slice pattern)                 │   │   │
│  │  │                                                          │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │   │   │
│  │  │  │ ide-editor  │  │ide-explorer│  │  ide-terminal   │   │   │   │
│  │  │  │   slice     │  │   slice     │  │     slice       │   │   │   │
│  │  │  │             │  │             │  │                 │   │   │   │
│  │  │  │ ✅ Clean    │  │ ✅ Clean    │  │ ✅ Clean        │   │   │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────────┘   │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│                                   ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   PRESENTATION LAYER                            │   │
│  │                                                                  │   │
│  │   ┌────────────────────────────────────────────────────────┐    │   │
│  │   │         MonacoEditor.tsx (772 lines!)                 │    │   │
│  │   │         ⚠️ GOD COMPONENT - NEEDS REFACTORING         │    │   │
│  │   │                                                      │    │   │
│  │   │  ┌──────────────────────────────────────────────┐     │    │   │
│  │   │  │              RESPONSIBILITIES               │     │    │   │
│  │   │  ├──────────────────────────────────────────────┤     │    │   │
│  │   │  │ 1. Monaco instance management              │     │    │   │
│  │   │  │ 2. Code formatting & linting              │     │    │   │
│  │   │  │ 3. Syntax highlighting                    │   │
│  │   │ │     │     │ 4. IntelliSense integration              │     │    │   │
│  │   │  │ 5. File content sync                    │     │    │   │
│  │   │  │ 6. Diff viewer                          │     │    │   │
│  │   │  │ 7. Tab management                       │     │    │   │
│  │   │  │ 8. Code actions (format, minimize)      │     │    │   │
│  │   │  │ 9. Error markers & decorations          │     │    │   │
│  │   │  │ 10. Theme management                   │     │    │   │
│  │   │  └──────────────────────────────────────┘     │    │   │
│  │   └────────────────────────────────────────────────────────┘    │   │
│  │            │                    │                    │           │   │
│  │            ▼                    ▼                    ▼           │   │
│  │   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐    │   │
│  │   │ File Tree   │      │  Terminal   │      │  Preview    │    │   │
│  │   │ Components  │      │  Panel      │      │  Panel      │    │   │
│  │   └─────────────┘      └─────────────┘      └─────────────┘    │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   INFRASTRUCTURE LAYER                          │   │
│  │                                                                  │   │
│  │   ┌────────────────────────────────────────────────────────┐    │   │
│  │   │         WebContainer Manager                          │    │   │
│  │   │         (browser-based dev environment)               │    │   │
│  │   │                                                          │    │   │
│  │   │  ┌──────────────────────────────────────────────────┐  │    │   │
│  │   │  │  - Terminal emulation (xterm.js)                │  │    │   │
│  │   │  │  - Process management                           │  │    │   │
│  │   │  │  - File system mounting                         │  │    │   │
│  │   │  │  - NPM package installation                    │  │    │   │
│  │   │  │  - Build/run/dev server                        │  │    │   │
│  │   │  └──────────────────────────────────────────────────┘  │    │   │
│  │   └────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Issues Found (IDE Specific)

| Issue | Location | Severity | Root Cause |
|-------|----------|----------|------------|
| **MonacoEditor god component** | `MonacoEditor.tsx:772` | P1 | 10 responsibilities mixed |
| **Tab management** | Inline in Monaco | P2 | Could be separate hook |
| **Code formatting** | Inline in Monaco | P2 | Could be separate service |
| **File sync coupling** | Monaco ↔ FileStore | P1 | Tight coupling |

---

## 2. Feature Behavior Analysis

### 2.1 IDE Core Flows

#### Flow 1: Open File in Editor

```
User Action              System Response              Architecture Path
─────────────────────────────────────────────────────────────────────
1. Click file       →   FileTree emits event        Presentation
2. Get file path   →   IDEStore updates activeTab   State
3. Load content    →   FileTools.readFile()         Infrastructure
4. Render editor   →   MonacoEditor renders        Presentation
5. Sync content   →   Store subscription           State
```

**Current Issues**:
- Step 2-4: MonacoEditor handles all of this directly (coupling)
- Step 5: No debouncing - every keystroke syncs

#### Flow 2: Terminal Command Execution

```
User Action              System Response              Architecture Path
─────────────────────────────────────────────────────────────────────
1. Type command     →   xterm.js captures input    Presentation
2. Submit command  →   TerminalTools.execute()     Infrastructure
3. WebContainer    →   Process execution           WebContainer
4. Get output      →   Stream to terminal         Presentation
5. Update history  →   TerminalStore appends       State
```

**Current Issues**:
- Step 3: WebContainer errors not handled gracefully
- Step 5: History could grow infinitely

---

## 3. User Stories - IDE (DETAILED)

### Story IDE-01: Code Editing with Monaco

```
As a developer
I want to edit code with syntax highlighting, IntelliSense, and code actions
So that I can write code efficiently with IDE-like features

Priority: P0
Estimation: 3 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Open files in Monaco editor with syntax highlighting
- [ ] AC2: IntelliSense provides autocompletion
- [ ] AC3: Code formatting (Prettier) available
- [ ] AC4: Lint errors shown as decorations
- [ ] AC5: Multiple tabs with proper switching
- [ ] AC6: Unsaved changes indicator per tab

Technical Requirements:
- [ ] TR1: `useMonacoEditor` hook manages editor instance
- [ ] TR2: `useCodeIntelligence` hook for IntelliSense
- [ ] TR3: `useCodeActions` hook for format/minify
- [ ] TR4: `useTabManager` hook for tab state
- [ ] TR5: `EditorContentSync` service for file sync

Monaco Responsibilities (should be):
- RENDER: Display editor with syntax highlighting
- INPUT: Capture user input
- CURSOR: Manage cursor position

Monaco Responsibilities (should NOT be):
- FILE SYNC: Handle file read/write (delegate to service)
- TAB MANAGEMENT: Manage tabs (delegate to hook)
- FORMATTING: Format code (delegate to service)
- LINTING: Show errors (delegate to service)

Edge Cases:
- [ ] EC1: Large file (>1MB) → Performance degradation?
- [ ] EC2: Multiple editors open → Memory management
- [ ] EC3: Syntax error in file → Editor handles gracefully
- [ ] EC4: Remote connection lost → Clear error
- [ ] EC5: Unsupported file type → Fallback to plain text

Combined Uses:
- [ ] CU1: Open project, edit multiple files, switch tabs
- [ ] CU2: Make changes, undo/redo, save
- [ ] CU3: Format document, see lint errors

Non-Functional Requirements:
- [ ] NFR1: Editor load < 500ms
- [ ] NFR2: Typing latency < 16ms (60fps)
- [ ] NFR3: Memory < 100MB per editor instance
- [ ] NFR4: Syntax highlight准确率 > 95%

Tests Required:
- [ ] Unit: Monaco instance creation
- [ ] Unit: Hook interactions
- [ ] Integration: File sync with debouncing
- [ ] E2E: Full editing workflow
```

### Story IDE-02: File Tree Navigation

```
As a developer
I want to navigate project files in a tree structure
So that I can find and open files quickly

Priority: P0
Estimation: 1 day (verify + fixes)

Acceptance Criteria:
- [ ] AC1: Directory structure displayed as tree
- [ ] AC2: Expand/collapse directories
- [ ] AC3: File icons based on type
- [ ] AC4: Context menu for file actions
- [ ] AC5: Search/filter files
- [ ] AC6: Drag and drop files

Technical Requirements:
- [ ] TR1: `FileTree` component with recursion
- [ ] TR2: `FileIcon` component based on extension
- [ ] TR3: `FileContextMenu` component
- [ ] TR4: `FileDragDrop` handler

Edge Cases:
- [ ] EC1: Circular symlinks → Prevent infinite loop
- [ ] EC2: Hidden files (.gitignore) → Filter appropriately
- [ ] EC3: Large directory (>1000 files) → Virtualization
- [ ] EC4: Permission denied → Show lock icon

Combined Uses:
- [ ] CU1: Browse project, open file, see in editor
- [ ] CU2: Right-click context menu, create new file
- [ ] CU3: Drag file to editor to open

Non-Functional Requirements:
- [ ] NFR1: Tree render < 100ms for 100 files
- [ ] NFR2: Expand/collapse < 50ms
- [ ] NFR3: Search results < 200ms

Tests Required:
- [ ] Unit: Tree recursion
- [ ] Integration: File selection → Editor open
- [ ] E2E: Full navigation flow
```

### Story IDE-03: Terminal with WebContainer

```
As a developer
I want a terminal that runs in the browser via WebContainer
So that I can execute commands without local setup

Priority: P0
Estimation: 2 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Terminal renders with xterm.js
- [ ] AC2: Execute shell commands
- [ ] AC3: npm install and run work
- [ ] AC4: Process output streams in real-time
- [ ] AC5: Multiple terminals supported
- [ ] AC6: Kill running process

Technical Requirements:
- [ ] TR1: `TerminalPanel` component
- [ ] TR2: `WebContainerService` manages instance
- [ ] TR3: `ProcessManager` handles processes
- [ ] TR4: `TerminalHistory` stores commands

WebContainer Capabilities:
- WC1: Mount file system
- WC2: Run Node.js processes
- WC3: NPM package installation
- WC4: Hot module reloading

Edge Cases:
- [ ] EC1: WebContainer not supported → Fallback or error
- [ ] EC2: Infinite loop command → Timeout and kill
- [ ] EC3: Process crashes → Error display
- [ ] EC4: Terminal history too large → Pagination
- [ ] EC5: Permission denied → Clear error

Combined Uses:
- [ ] CU1: npm install, npm run dev → See output
- [ ] CU2: Multiple terminals for server + tests
- [ ] CU3: Kill stuck process, restart

Non-Functional Requirements:
- [ ] NFR1: Terminal input latency < 50ms
- [ ] NFR2: Output streaming < 100ms
- [ ] NFR3: Memory < 50MB for terminal
- [ ] NFR4: Process startup < 2s

Tests Required:
- [ ] Unit: WebContainer service
- [ ] Unit: Process management
- [ ] Integration: Command execution
- [ ] E2E: Full terminal workflow
```

### Story IDE-04: Preview Panel

```
As a developer
I want to see live preview of my application
So that I can verify changes without switching apps

Priority: P1
Estimation: 1 day

Acceptance Criteria:
- [ ] AC1: Preview iframe with application
- [ ] AC2: Hot reload on file changes
- [ ] AC3: Toggle between editor and preview
- [ ] AC4: Mobile viewport simulation
- [ ] AC5: Error overlay for runtime errors

Technical Requirements:
- [ ] TR1: `PreviewPanel` component
- [ ] TR2: `HotReload` service watches file changes
- [ ] TR3: `ViewportSimulator` component
- [ ] TR4: `ErrorOverlay` component

Edge Cases:
- [ ] EC1: CORS errors → Clear message
- [ ] EC2: HMR fails → Fallback to reload
- [ ] EC3: Preview URL not available → Wait indicator
- [ ] EC4: Large app slow → Debounce reload

Combined Uses:
- [ ] CU1: Edit code → See preview update
- [ ] CU2: Toggle mobile view → Verify responsiveness
- [ ] CU3: See error → Click to locate in code

Non-Functional Requirements:
- [ ] NFR1: Hot reload < 500ms
- [ ] NFR2: Preview load < 2s
- [ ] NFR3: Memory < 20MB for preview

Tests Required:
- [ ] Unit: Hot reload logic
- [ ] Integration: File change → Preview reload
- [ ] E2E: Full preview workflow
```

---

## 4. IDE → Architecture Conflict Matrix

| IDE Story | Architecture Issue | Conflict Severity | Fix Required |
|-----------|-------------------|-------------------|--------------|
| IDE-01 | MonacoEditor god component (772 lines) | HIGH | Extract 5+ hooks |
| IDE-01 | File sync coupling | MEDIUM | Create EditorContentSync service |
| IDE-02 | File tree virtualization missing | LOW | Add react-window |
| IDE-03 | WebContainer errors not handled | MEDIUM | Add error boundaries |
| IDE-04 | Hot reload race conditions | LOW | Debounce updates |

---

## 5. File Change Manifest - IDE

### 5.1 Files to CREATE

| File | description | Lines | Story |
|------|---------|-------|-------|
| `presentation/components/ide/MonacoEditor/hooks/use-monaco-editor.ts` | Editor instance management | 100 | IDE-01 |
| `presentation/components/ide/MonacoEditor/hooks/use-code-intelligence.ts` | IntelliSense | 80 | IDE-01 |
| `presentation/components/ide/MonacoEditor/hooks/use-code-actions.ts` | Format/minify | 60 | IDE-01 |
| `presentation/components/ide/MonacoEditor/hooks/use-tab-manager.ts` | Tab state | 80 | IDE-01 |
| `presentation/components/ide/MonacoEditor/services/editor-content-sync.ts` | File sync service | 80 | IDE-01 |
| `presentation/components/ide/FileTree/components/FileTreeItem.tsx` | Tree item component | 60 | IDE-02 |
| `presentation/components/ide/FileTree/components/FileContextMenu.tsx` | Context menu | 80 | IDE-02 |
| `presentation/components/ide/Terminal/services/webcontainer-manager.ts` | WebContainer service | 120 | IDE-03 |
| `presentation/components/ide/Terminal/services/process-manager.ts` | Process management | 80 | IDE-03 |
| `presentation/components/ide/Preview/services/hot-reload.ts` | Hot reload service | 60 | IDE-04 |

### 5.2 Files to MODIFY

| File | Change | Lines | Story |
|------|--------|-------|-------|
| `MonacoEditor.tsx` | Extract to sub-components, keep orchestrator | -500 | IDE-01 |
| `FileTree.tsx` | Extract item component | -50 | IDE-02 |
| `XTerminal.tsx` | Use webcontainer service | -50 | IDE-03 |
| `PreviewPanel.tsx` | Add hot reload | +30 | IDE-04 |

### 5.3 Files to DELETE (After Verification)

| File | Reason | Story |
|------|--------|-------|
| `src/presentation/components/ide/MonacoEditor/EditorTabBar.legacy.tsx` | Legacy, replaced | IDE-01 |

---

## 6. IDE Must-Pass Checklist

### Pre-Refactor Verification

- [ ] MonacoEditor responsibilities documented
- [ ] All hooks identified
- [ ] WebContainer capabilities verified
- [ ] File tree virtualization needed

### During Refactor

- [ ] use-monaco-editor hook created and tested
- [ ] use-code-intelligence hook created and tested
- [ ] use-code-actions hook created and tested
- [ ] use-tab-manager hook created and tested
- [ ] EditorContentSync service created and tested
- [ ] MonacoEditor refactored to <300 lines

### Post-Refactor Verification

- [ ] MonacoEditor.tsx < 300 lines
- [ ] File tree renders efficiently
- [ ] WebContainer terminal works
- [ ] Hot reload works reliably
- [ ] No console errors in IDE workflow
- [ ] TypeScript compilation succeeds
- [ ] All existing tests pass

---

## 7. Dependencies & Risks

### Dependencies

| Dependency | Status | Impact |
|------------|--------|--------|
| Monaco Editor | ✅ Ready | Core |
| xterm.js | ✅ Ready | Core |
| WebContainer API | ✅ Ready | Core |
| react-window | ⚠️ Need to add | File tree virtualization |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Monaco refactor breaks editor** | Medium | High | Test each hook in isolation |
| **WebContainer API changes** | Low | High | Version pinning |
| **Memory leak in hooks** | Medium | Medium | Proper cleanup in useEffect |

### Deferred (Not MVP)

| Item | Reason | When |
|------|--------|------|
| Multiple cursors | Advanced feature | Future |
| VS Code extensions | Complex integration | Future |
| Remote debugging | Advanced feature | Future |

---

## 8. Research Notes & Tech Context

### Monaco Editor Best Practices

```
Performance Optimizations:
1. Only render visible line range (virtualization)
2. Debounce content changes
3. Use web workers for heavy operations
4. Dispose editor on unmount

Memory Management:
1. Dispose all models on unmount
2. Clean up decorators
3. Remove event listeners
```

### WebContainer API

```
Browser Support: Chrome 86+, Edge 86+ (requires headers)
CORS: Requires Cross-Origin-Embedder-Policy header

Capabilities:
- Node.js 18+
- npm 9+
- Supports most Node.js packages

Limitations:
- No native modules
- No child_process.spawn with shell
- 2GB memory limit
```

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [shard-03-06 - Workspace-Specific Features - Notes](./shard-03-06-workspace-notes.md)*
