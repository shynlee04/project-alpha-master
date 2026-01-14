# Comprehensive E2E Test Specification for AI Agents

**Project:** Project Alpha - ViaGent
**Version:** 2.0.0
**Date:** 2026-01-14
**Target Agents:** browser-use, computer-use with vision capabilities

---

## Table of Contents

1. [Notes Workspace Tests](#1-notes-workspace-tests)
2. [IDE Workspace Tests](#2-ide-workspace-tests)
3. [Cross-Workspace Tests](#3-cross-workspace-tests)
4. [Multi-Device Tests](#4-multi-device-tests)
5. [AI Feature Tests](#5-ai-feature-tests)
6. [Quality Assessment Matrix](#6-quality-assessment-matrix)

---

## 1. Notes Workspace Tests

### 1.1 Basic Navigation

#### TEST-NOTES-001: Navigate to Notes Workspace
```yaml
name: Navigate to Notes
priority: P0
preconditions:
  - Application running at localhost:3000
  - User logged in or guest mode active
  
steps:
  - action: "Navigate to /notes"
  - wait: "Notes workspace fully loaded"
  - verify: "Note list sidebar visible on left (desktop) or bottom nav shows Notes tab (mobile)"
  - verify: "No error boundary displayed"
  - verify: "Console has no JavaScript errors"
  
expected_result: Notes workspace loads with note list visible
screenshot: required
```

#### TEST-NOTES-002: Create New Note
```yaml
name: Create New Note
priority: P0
preconditions:
  - Notes workspace loaded
  
steps:
  - action: "Click '+' or 'New Note' button"
  - wait: "New note editor opens"
  - verify: "Editor is editable"
  - action: "Type 'Test Note Title' as title"
  - action: "Press Enter to move to body"
  - action: "Type 'This is test content'"
  - wait: "2 seconds for auto-save"
  - verify: "Note appears in note list"
  
expected_result: New note created and visible in list
screenshot: required
```

### 1.2 Block Editor Tests

#### TEST-NOTES-010: Insert Standard Blocks
```yaml
name: Insert Standard Blocks via Slash Command
priority: P0
preconditions:
  - Empty note open in editor

steps:
  - action: "Type '/' to open slash menu"
  - verify: "Slash command menu visible"
  - action: "Type 'heading' and press Enter"
  - verify: "Heading block inserted"
  - action: "Type 'Test Heading' and press Enter"
  - action: "Type '/' again"
  - action: "Select 'Bullet List'"
  - verify: "Bullet list block inserted"
  - action: "Type 'List item 1'"
  - action: "Press Enter"
  - action: "Type 'List item 2'"
  
expected_result: Multiple block types inserted correctly
screenshot: required
```

#### TEST-NOTES-011: Insert Column Block (P0-CRITICAL)
```yaml
name: Insert and Edit Column Block
priority: P0-CRITICAL
preconditions:
  - Empty note open
  
steps:
  - action: "Type '/' to open slash menu"
  - action: "Type 'column' and press Enter"
  - verify: "ColumnBlock inserted with default 2 columns"
  - action: "Click inside column content area"
  - verify: "Can type inside column"
  - action: "Type 'Column content here'"
  - verify: "Text appears in column"
  - action: "Hover over column to reveal controls"
  - verify: "Add/Remove column buttons visible"
  - action: "Click 'Add Column'"
  - verify: "Column count increases to 3"
  - wait: "2 seconds for auto-save"

expected_result: ColumnBlock fully functional
screenshot: required
bug_regression: "Cannot find node position" error
```

#### TEST-NOTES-012: Insert Synced Block (P0-CRITICAL)
```yaml
name: Insert and Manage Synced Block
priority: P0-CRITICAL
preconditions:
  - Note with existing content
  
steps:
  - action: "Type '/' to open slash menu"
  - action: "Type 'sync' and press Enter"
  - verify: "SyncedBlock inserted with sync indicator"
  - action: "Type content inside synced block"
  - verify: "Sync indicator shows 'Synced'"
  - action: "Hover over sync header"
  - verify: "Unsync button visible"
  - wait: "2 seconds for auto-save"

expected_result: SyncedBlock functional with indicator
screenshot: required
bug_regression: "Cannot find node position" error
```

#### TEST-NOTES-013: Insert Reference Block
```yaml
name: Insert Block Reference
priority: P1
preconditions:
  - Note with at least one existing block with known ID
  
steps:
  - action: "Type '/' to open slash menu"
  - action: "Type 'reference' and press Enter"
  - verify: "ReferenceBlock inserted in edit mode"
  - action: "Enter a block ID in the input field"
  - action: "Click 'Link' button"
  - verify: "Block shows reference preview or 'not found' state"
  
expected_result: ReferenceBlock links or shows error state
screenshot: required
```

### 1.3 Note Switching Tests (Bug Regression)

#### TEST-NOTES-020: Switch Between Notes with Custom Blocks
```yaml
name: Note Switching with Custom Blocks
priority: P0-CRITICAL
preconditions:
  - Note A with ColumnBlock exists
  - Note B with SyncedBlock exists
  - Note C with ReferenceBlock exists
  
steps:
  - action: "Click on Note A in list"
  - verify: "Note A content loads with ColumnBlock visible"
  - action: "Click on Note B in list"
  - verify: "Note B content loads with SyncedBlock visible"
  - action: "Click on Note C in list"
  - verify: "Note C content loads with ReferenceBlock visible"
  - action: "Click back to Note A"
  - verify: "Note A loads correctly"
  - console_check: "No 'Cannot find node position' error"
  
expected_result: All notes switch without errors
screenshot: after_each_switch
bug_regression: true
```

#### TEST-NOTES-021: Rapid Note Switching
```yaml
name: Rapid Note Switching Stress Test
priority: P1
preconditions:
  - At least 5 notes with various block types
  
steps:
  - action: "Click between 5 notes rapidly (1 click per 500ms)"
  - wait: "Complete 10 switches"
  - verify: "No crash or white screen"
  - verify: "Final note displays correctly"
  - console_check: "No JavaScript errors"
  
expected_result: Application handles rapid switching
screenshot: final_state
```

---

## 2. IDE Workspace Tests

### 2.1 Project Loading

#### TEST-IDE-001: Open IDE with FSA Project
```yaml
name: Load IDE with File System Access Project
priority: P0
preconditions:
  - Desktop browser with FSA support
  - Existing FSA project in project list
  
steps:
  - action: "Navigate to /ide/{projectId}"
  - verify: "Route guard checks platform and storage type"
  - wait: "FSA handle restoration prompt (if needed)"
  - action: "Grant folder access (if prompted)"
  - verify: "File tree loads in left panel"
  - verify: "Monaco editor displays welcome message or last opened file"
  
expected_result: IDE loads with file tree and editor
screenshot: required
platform: desktop_only
```

#### TEST-IDE-002: Mobile Redirect from IDE
```yaml
name: IDE Mobile Redirect
priority: P0
preconditions:
  - Mobile browser (or mobile viewport simulation)
  
steps:
  - action: "Navigate to /ide/{projectId}"
  - verify: "Route guard detects mobile platform"
  - verify: "Automatic redirect to /notes/{projectId}"
  - verify: "Toast or message explains IDE not available on mobile"
  
expected_result: Mobile users gracefully redirected
screenshot: required
platform: mobile_only
```

### 2.2 File Operations

#### TEST-IDE-010: Create New File
```yaml
name: Create New File in IDE
priority: P0
preconditions:
  - IDE loaded with project
  
steps:
  - action: "Right-click on folder in file tree"
  - action: "Select 'New File'"
  - action: "Enter file name 'test-file.ts'"
  - verify: "File appears in tree"
  - verify: "File opens in editor"
  - action: "Type 'const hello = \"world\";'"
  - action: "Save file (Ctrl+S or Cmd+S)"
  - verify: "File saved (no unsaved indicator)"
  
expected_result: File created and saved
screenshot: required
```

#### TEST-IDE-011: Edit Existing File
```yaml
name: Edit Existing File
priority: P0
preconditions:
  - IDE loaded with project containing files
  
steps:
  - action: "Double-click on any .ts or .tsx file"
  - verify: "File content loads in Monaco editor"
  - verify: "Syntax highlighting active"
  - action: "Make a change to the file"
  - verify: "Unsaved indicator appears"
  - action: "Save file"
  - verify: "Unsaved indicator clears"
  
expected_result: File editing works
screenshot: required
```

### 2.3 Terminal

#### TEST-IDE-020: Open Terminal
```yaml
name: Open and Use Terminal
priority: P1
preconditions:
  - IDE loaded (desktop only)
  
steps:
  - action: "Click terminal toggle or use keyboard shortcut"
  - verify: "Terminal panel opens"
  - action: "Type 'echo hello'"
  - action: "Press Enter"
  - verify: "Terminal outputs 'hello'"
  
expected_result: Terminal functional
screenshot: required
platform: desktop_only
```

### 2.4 AI Chat Integration

#### TEST-IDE-030: Open AI Chat Panel
```yaml
name: AI Chat in IDE
priority: P1
preconditions:
  - IDE loaded
  - API key configured for at least one provider
  
steps:
  - action: "Click AI chat icon or panel toggle"
  - verify: "AI chat panel opens"
  - action: "Type 'What files are in this project?'"
  - action: "Send message"
  - wait: "AI response received"
  - verify: "Response displays in chat"
  
expected_result: AI chat functional in IDE
screenshot: required
```

---

## 3. Cross-Workspace Tests

### 3.1 Notes to IDE Navigation

#### TEST-CROSS-001: Navigate from Notes to IDE
```yaml
name: Navigate Notes to IDE
priority: P0
preconditions:
  - Notes workspace with FSA project loaded
  - Desktop browser
  
steps:
  - action: "Open Notes workspace (/notes/{projectId})"
  - verify: "Notes workspace loads"
  - action: "Click 'Open in IDE' button or navigate to /ide/{projectId}"
  - verify: "IDE workspace loads with same project"
  - verify: "Project context maintained (same files visible)"
  
expected_result: Seamless transition between workspaces
screenshot: both_workspaces
```

#### TEST-CROSS-002: IDE to Notes Navigation
```yaml
name: Navigate IDE to Notes
priority: P0
preconditions:
  - IDE workspace loaded with project
  
steps:
  - action: "Click workspace switcher or navigate to /notes/{projectId}"
  - verify: "Notes workspace loads"
  - verify: "Project context maintained"
  - verify: "Can navigate back to IDE"
  
expected_result: Seamless transition
screenshot: both_workspaces
```

### 3.2 Cross-Workspace State Persistence

#### TEST-CROSS-010: Project State Across Workspaces
```yaml
name: Project State Persistence
priority: P0
preconditions:
  - Project with files and notes
  
steps:
  - action: "Make changes in IDE (create file)"
  - action: "Switch to Notes workspace"
  - action: "Create a new note"
  - action: "Switch back to IDE"
  - verify: "New file still exists"
  - action: "Switch to Notes"
  - verify: "New note still exists"
  
expected_result: Changes persist across workspace switches
screenshot: after_each_change
```

### 3.3 Event Bus Synchronization

#### TEST-CROSS-020: File Change Event Propagation
```yaml
name: File Change Events Across Workspaces
priority: P1
preconditions:
  - FSA project loaded
  - Notes workspace open
  
steps:
  - action: "Modify a file externally (using OS file manager)"
  - wait: "File watcher detects change"
  - verify: "Change event propagated to current workspace"
  - action: "Switch to IDE workspace"
  - verify: "IDE shows updated file content"
  
expected_result: File changes detected and propagated
screenshot: required
```

---

## 4. Multi-Device Tests

### 4.1 Desktop Viewport Tests

#### TEST-DEVICE-001: Desktop Full Layout
```yaml
name: Desktop Full Layout (1920x1080)
priority: P0
viewport: "1920x1080"
platform: desktop

tests:
  notes_workspace:
    - verify: "Three-panel layout (sidebar, list, editor)"
    - verify: "All panels resizable"
    - verify: "No horizontal scroll"
  
  ide_workspace:
    - verify: "Four-panel layout (file tree, editor, terminal, chat)"
    - verify: "Panels collapsible"
    - verify: "No horizontal scroll"

screenshot: each_workspace
```

#### TEST-DEVICE-002: Desktop Medium (1366x768)
```yaml
name: Desktop Medium Layout
priority: P1
viewport: "1366x768"
platform: desktop

tests:
  notes_workspace:
    - verify: "Panels adapt to smaller width"
    - verify: "Editor still usable"
  
  ide_workspace:
    - verify: "Panels still accessible"
    - verify: "May need to collapse some panels"

screenshot: each_workspace
```

### 4.2 Tablet Viewport Tests

#### TEST-DEVICE-010: iPad Landscape (1194x834)
```yaml
name: iPad Landscape
priority: P1
viewport: "1194x834"
platform: tablet

tests:
  notes_workspace:
    - verify: "Two-panel layout or collapsible sidebar"
    - verify: "Touch targets >= 44x44px"
  
  ide_workspace:
    - verify: "May redirect to Notes or show limited IDE"
    - verify: "Clear UX for limitations"

screenshot: each_workspace
```

#### TEST-DEVICE-011: iPad Portrait (834x1194)
```yaml
name: iPad Portrait
priority: P1
viewport: "834x1194"
platform: tablet

tests:
  notes_workspace:
    - verify: "Single panel with navigation"
    - verify: "Bottom navigation visible"
    - verify: "Editor fills viewport"

screenshot: required
```

### 4.3 Mobile Viewport Tests

#### TEST-DEVICE-020: iPhone Pro (393x852)
```yaml
name: iPhone Pro
priority: P0
viewport: "393x852"
platform: mobile

tests:
  notes_workspace:
    - verify: "Bottom navigation: Notes | Search | AI"
    - verify: "Single panel view"
    - verify: "Swipe gestures for navigation"
    - verify: "Touch targets >= 44x44px"
    - verify: "No horizontal scroll"
  
  ide_workspace:
    - verify: "Redirects to Notes with explanation"
    - verify: "IDE not accessible"

screenshot: each_test
```

#### TEST-DEVICE-021: Small Mobile (320x568)
```yaml
name: Small Mobile (iPhone SE)
priority: P1
viewport: "320x568"
platform: mobile

tests:
  notes_workspace:
    - verify: "Content still visible"
    - verify: "No text truncation hiding critical info"
    - verify: "Touch targets still accessible"
    
screenshot: required
```

### 4.4 Cross-Device State Sync (Future)

#### TEST-DEVICE-030: Desktop to Mobile Handoff
```yaml
name: Desktop to Mobile Session Handoff
priority: P2
preconditions:
  - Same user account on both devices
  - Cloud sync enabled (future feature)
  
steps:
  - desktop_action: "Create note with ColumnBlock"
  - desktop_action: "Save and close browser"
  - mobile_action: "Open Notes workspace"
  - verify: "Note visible in list"
  - mobile_action: "Open note"
  - verify: "ColumnBlock renders (stacked on mobile)"
  
expected_result: Content syncs across devices
status: FUTURE_FEATURE
```

---

## 5. AI Feature Tests

### 5.1 AI Image Generation

#### TEST-AI-001: Generate AI Image
```yaml
name: AI Image Generation Block
priority: P1
preconditions:
  - Gemini API key configured
  - Notes workspace open
  
steps:
  - action: "Type '/' and select 'AI Image'"
  - verify: "AIImageBlock inserted"
  - action: "Enter prompt: 'A serene mountain landscape at sunset'"
  - action: "Click 'Generate'"
  - wait: "Generation completes (may take 10-30 seconds)"
  - verify: "Image displays in block"
  - verify: "Download/Copy options available"
  
expected_result: Image generated and displayed
screenshot: required
```

### 5.2 Voice Input

#### TEST-AI-010: Voice Input Transcription
```yaml
name: Voice Input
priority: P1
preconditions:
  - Microphone access granted
  - Notes editor open
  
steps:
  - action: "Click voice input button"
  - verify: "Recording indicator active"
  - action: "Speak: 'Hello, this is a test'"
  - action: "Stop recording"
  - wait: "Transcription completes"
  - verify: "Transcribed text appears in editor"
  
expected_result: Voice transcribed to text
screenshot: required
```

### 5.3 RAG Search

#### TEST-AI-020: RAG Semantic Search
```yaml
name: RAG Semantic Search
priority: P1
preconditions:
  - Project with indexed files
  - Knowledge workspace or RAG panel open
  
steps:
  - action: "Open search panel"
  - action: "Type: 'How does authentication work?'"
  - action: "Submit search"
  - wait: "Search results return"
  - verify: "Relevant file chunks displayed"
  - verify: "Citations show source file:line"
  
expected_result: Semantic search returns relevant results
screenshot: required
```

---

## 6. Quality Assessment Matrix

### Test Coverage Summary

| Category | Total Tests | P0 | P1 | P2 |
|----------|-------------|----|----|----| 
| Notes Workspace | 13 | 6 | 5 | 2 |
| IDE Workspace | 12 | 4 | 6 | 2 |
| Cross-Workspace | 6 | 3 | 2 | 1 |
| Multi-Device | 8 | 2 | 4 | 2 |
| AI Features | 6 | 0 | 4 | 2 |
| **TOTAL** | **45** | **15** | **21** | **9** |

### Pass Rate Thresholds

| Score | Rating | Action |
|-------|--------|--------|
| ≥95% | EXCELLENT | Ready for release |
| 85-94% | GOOD | Fix P0/P1 before release |
| 70-84% | FAIR | Significant fixes needed |
| <70% | POOR | Block release |

### Bug Severity Definitions

| Severity | Description | Example |
|----------|-------------|---------|
| P0-CRITICAL | Blocks core user journey, data loss risk | Note switching crash |
| P1-HIGH | Major feature broken, workaround exists | Terminal not working |
| P2-MEDIUM | Minor feature issue, cosmetic | Tooltip missing |
| P3-LOW | Enhancement, not a bug | Nicer animation |

---

## Appendix A: Agent Execution Guidelines

### For browser-use Agents

```yaml
configuration:
  browser: chromium
  viewport: responsive
  timeout_per_step: 30000
  screenshot_on_failure: true
  
capabilities:
  - click
  - type
  - navigate
  - screenshot
  - wait_for_selector
  - console_check
```

### For computer-use Agents

```yaml
configuration:
  os: macos # or windows/linux
  display: 1920x1080
  
capabilities:
  - click
  - type
  - keyboard_shortcut
  - screenshot
  - ocr_verify
  - mouse_drag
```

### Screenshot Naming Convention

```
{test_id}_{step_number}_{timestamp}.png

Examples:
TEST-NOTES-011_step3_20260114_143022.png
TEST-IDE-001_final_20260114_143055.png
```

---

**Document ID:** E2E-TEST-SPEC-COMPREHENSIVE-2026-01-14
**Generated by:** EXCALIBUR Event-Driven Orchestrator
**For use with:** browser-use, computer-use AI agents with vision
