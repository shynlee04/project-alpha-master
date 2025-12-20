Based on your project documents, I can see you've completed **Epic 3: File System Access Layer**. Now you want to add **Project Fugu capabilities** (specifically File System Access API enhancements and related browser APIs) as additional work without disrupting the existing structure.

# **Project Fugu Integration Proposal for Via-Gent**
## **Epic 4.5: Enhanced Browser Capabilities (Project Fugu APIs)**

***

## **Executive Summary**

This proposal introduces **Epic 4.5** to be inserted after Epic 3 completion and before Epic 4. It leverages Project Fugu browser capabilities to enhance Via-Gent's File System Access integration with additional features like Async Clipboard, Badging, and Local Font Access APIs.

**Key Principle:** This is an **additive enhancement epic** that builds on Epic 3's FSA foundation without requiring changes to completed work.

***

## **Research Resources & Materials for AI Agent**

### **Primary Documentation Sources**

#### **1. File System Access API (Core Enhancement)**
```yaml
Official Specs:
  - https://developer.chrome.com/docs/capabilities/web-apis/file-system-access
  - https://developer.mozilla.org/en-US/docs/Web/API/File_System_API
  - https://wicg.github.io/file-system-access/

Key Patterns to Research:
  - Permission persistence strategies
  - File watchers for external changes
  - Drag-and-drop integration with FSA
  - Write-back optimization patterns

Research Queries:
  Context7:
    - "File System Access API"
    - "FileSystemDirectoryHandle"
    - "FileSystemFileHandle"
  
  DeepWiki:
    - "File System Access API permission persistence patterns"
    - "FSA performance optimization large directories"
    - "File System Access API external file change detection"
  
  Tavily:
    - "File System Access API best practices December 2025"
    - "FSA browser compatibility update 2025"
    - "File System Access API vs IndexedDB performance"
  
  Exa:
    - "File System Access API production examples GitHub"
    - "FSA file watcher implementations"
```

#### **2. Async Clipboard API**
```yaml
Official Specs:
  - https://developer.chrome.com/docs/capabilities/web-apis/async-clipboard
  - https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
  - https://w3c.github.io/clipboard-apis/

Key Patterns to Research:
  - Copy code with syntax highlighting
  - Paste images into Asset Studio
  - Copy file references from IDE
  - Clipboard event handling

Research Queries:
  Context7:
    - "Clipboard API"
    - "ClipboardItem"
  
  DeepWiki:
    - "Async Clipboard API rich text format patterns"
    - "Clipboard API image handling browser"
    - "Copy code with formatting web app"
  
  Tavily:
    - "Async Clipboard API December 2025 support"
    - "Clipboard API security best practices 2025"
  
  Exa:
    - "Clipboard API code editor implementations"
    - "Rich clipboard integration examples"
```

#### **3. Badging API**
```yaml
Official Specs:
  - https://developer.chrome.com/docs/capabilities/web-apis/badging-api
  - https://developer.mozilla.org/en-US/docs/Web/API/Badging_API
  - https://w3c.github.io/badging/

Key Patterns to Research:
  - Badge count for build errors
  - Notification badges for AI completion
  - Clear badge strategies

Research Queries:
  Context7:
    - "Badging API"
    - "navigator.setAppBadge"
  
  DeepWiki:
    - "Badging API use cases web applications"
    - "App badge notification patterns"
  
  Tavily:
    - "Badging API browser support December 2025"
    - "Web app badge best practices 2025"
```

#### **4. Local Font Access API**
```yaml
Official Specs:
  - https://developer.chrome.com/docs/capabilities/web-apis/local-fonts
  - https://wicg.github.io/local-font-access/

Key Patterns to Research:
  - Font enumeration for Monaco
  - Custom font selection UI
  - Font preview rendering

Research Queries:
  Context7:
    - "Local Font Access API"
    - "window.queryLocalFonts"
  
  DeepWiki:
    - "Local Font Access API code editor integration"
    - "Font picker implementation browser"
  
  Tavily:
    - "Local Font Access API browser support 2025"
    - "Custom font selection web IDE"
```

#### **5. Web Share API**
```yaml
Official Specs:
  - https://developer.chrome.com/docs/capabilities/web-apis/web-share
  - https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
  - https://w3c.github.io/web-share/

Key Patterns to Research:
  - Share project URLs
  - Share code snippets
  - Share previews as files

Research Queries:
  Context7:
    - "Web Share API"
    - "navigator.share"
  
  DeepWiki:
    - "Web Share API progressive web apps"
    - "Share files browser API"
  
  Tavily:
    - "Web Share API December 2025 compatibility"
    - "Share target registration PWA 2025"
```

#### **6. Project Fugu Status & Roadmap**
```yaml
Official Tracking:
  - https://fugu-tracker.web.app
  - https://developer.chrome.com/docs/capabilities/status
  - https://www.chromium.org/teams/web-capabilities-fugu/

Community Resources:
  - https://groups.google.com/a/chromium.org/g/fugu-dev
  - Slack: #fugu on chromium.slack.com

Research Queries:
  Tavily:
    - "Project Fugu capabilities December 2025 status"
    - "New Fugu APIs 2025 browser IDE"
    - "Fugu API browser compatibility matrix 2025"
  
  DeepWiki:
    - "Project Fugu adoption patterns progressive web apps"
    - "Fugu APIs production readiness 2025"
```

***

## **Epic 4.5: Enhanced Browser Capabilities**

### **Epic Goal**
Enhance Via-Gent's browser-native capabilities using Project Fugu APIs to provide richer file system integration, improved clipboard operations, user notifications, and font customization—building on Epic 3's FSA foundation.

### **Requirements Covered (New)**
- **FR-FUGU-01:** Enhanced FSA permission management with persistent grants
- **FR-FUGU-02:** File watcher for external changes detection
- **FR-FUGU-03:** Async clipboard for code and image operations
- **FR-FUGU-04:** Badging for build status and notifications
- **FR-FUGU-05:** Local font access for editor customization
- **FR-FUGU-06:** Web Share for project and snippet sharing

### **Dependencies**
- **Required:** Epic 3 completed (FSA foundation exists)
- **Optional:** Epic 4 stories can run in parallel with 4.5

***

## **Stories for Epic 4.5**

### **Story 4.5.1: Enhanced FSA Permission Management**

**As a** user,  
**I want** my folder permissions to persist across browser sessions reliably,  
**So that** I don't have to re-grant access every time I open Via-Gent.

#### **Research Requirements**
```yaml
Before Implementation:
  - Research: "File System Access API permission persistence best practices"
  - Research: "FSA queryPermission vs requestPermission timing"
  - Research: "IndexedDB handle serialization longevity"

Tools to Query:
  Context7: "FileSystemDirectoryHandle queryPermission"
  DeepWiki: "FSA permission lifecycle browser sessions"
  Tavily: "File System Access permission management 2025"
  Exa: "FSA permission handling production examples"

Expected Findings:
  - How long do serialized handles remain valid?
  - Best UX for permission re-prompts
  - Handle expiration detection patterns
```

#### **Acceptance Criteria**
```gherkin
Given a previously granted directory handle stored in IndexedDB
When I return to Via-Gent after browser restart
Then permission status is queried via queryPermission()
And if status is "granted", handle is reused without prompt
And if status is "prompt", clear UX explains re-grant is needed
And if status is "denied", fallback mode is offered

Given handle has expired (browser revoked)
When permission check occurs
Then user sees "Permission lost" message with reason
And "Re-grant Access" button appears
And clicking button triggers new showDirectoryPicker()
```

#### **Implementation Guidance**
```typescript
// Pattern to research and implement
interface PermissionManager {
  checkPermission(handle: FileSystemDirectoryHandle): Promise<'granted' | 'prompt' | 'denied'>;
  requestPermission(handle: FileSystemDirectoryHandle): Promise<boolean>;
  handleExpiredPermission(projectId: string): Promise<void>;
}

// Research question: How often to check permission?
// Options: On app load, before each file operation, periodic polling?
```

***

### **Story 4.5.2: File Watcher for External Changes**

**As a** user,  
**I want** Via-Gent to detect when files are changed by external editors,  
**So that** my IDE stays in sync with the file system.

#### **Research Requirements**
```yaml
Critical Research:
  - "Can FSA detect external file changes without polling?"
  - "File System Observer API status December 2025"
  - "Polling vs observer patterns for file watching"

Tools to Query:
  Context7: "FileSystemObserver" (if exists)
  DeepWiki: "External file change detection browser apps"
  Tavily: "File System Access API file watching 2025"
  Tavily: "File System Observer API availability 2025"
  Exa: "FSA file watcher implementations GitHub"

Fallback Strategy:
  - If no native observer, implement polling strategy
  - Research optimal polling interval (5s? 10s?)
  - Research: "File hash comparison vs timestamp checks"
```

#### **Acceptance Criteria**
```gherkin
Given a file open in Monaco editor
And the file is modified externally (e.g., VS Code)
When Via-Gent detects the change (within 10s)
Then a notification appears: "File X changed externally. Reload?"
And user can choose "Reload" or "Keep My Version"
And if "Reload" chosen, Monaco content updates
And undo history is preserved if possible

Given file is deleted externally
When Via-Gent detects deletion
Then file tree shows file as missing
And Monaco tab shows "[Deleted]" indicator
And user can choose to restore from memory or close tab
```

#### **Implementation Guidance**
```typescript
// Research implementation pattern
interface FileWatcher {
  watch(path: string, handle: FileSystemFileHandle): void;
  unwatch(path: string): void;
  onExternalChange: (path: string, action: 'modified' | 'deleted') => void;
}

// Research questions:
// 1. Use polling with getFile() + lastModified comparison?
// 2. Is File System Observer API available?
// 3. How to handle conflicts (both editors modified)?
```

***

### **Story 4.5.3: Advanced Clipboard Operations**

**As a** user,  
**I want** to copy code with formatting and paste images into my project,  
**So that** I can easily share code and integrate visual assets.

#### **Research Requirements**
```yaml
Research Topics:
  - "Clipboard API rich text with syntax highlighting"
  - "Copy code as HTML with CSS styling"
  - "Paste image directly into file system"
  - "ClipboardItem multiple MIME types"

Tools to Query:
  Context7: "Clipboard API write read"
  Context7: "ClipboardItem"
  DeepWiki: "Async Clipboard rich format web applications"
  DeepWiki: "Paste image file browser API"
  Tavily: "Clipboard API image paste December 2025"
  Exa: "Clipboard API code editor examples"

Implementation Patterns:
  - How to generate syntax-highlighted HTML?
  - Can we paste images directly to FSA?
  - What MIME types to support?
```

#### **Acceptance Criteria**
```gherkin
Scenario: Copy code with syntax highlighting
Given code selected in Monaco editor
When I press Cmd+C or right-click → Copy
Then clipboard contains:
  - Plain text version (for simple paste)
  - HTML version with syntax highlighting (for rich editors)
And pasting into Slack/Notion shows colored code

Scenario: Paste image into project
Given an image in clipboard (screenshot, copied image)
When I paste into Asset Studio or designated folder
Then system prompts for filename
And image saves to project as PNG/JPEG
And image appears in file tree
And if in FSA mode, image writes to local disk

Scenario: Copy file path
Given file selected in file tree
When I right-click → "Copy Path"
Then clipboard contains relative path
And path is ready to paste into import statements
```

#### **Implementation Guidance**
```typescript
// Pattern to research
interface ClipboardManager {
  copyCode(code: string, language: string): Promise<void>;
  pasteImage(): Promise<{ filename: string; blob: Blob } | null>;
  copyFilePath(path: string): Promise<void>;
}

// Research: Use Monaco's built-in tokenization for HTML generation?
// Research: Shiki or Highlight.js for syntax highlighting in clipboard?
```

***

### **Story 4.5.4: Build Status Badging**

**As a** user,  
**I want** the browser tab to show build errors as a badge,  
**So that** I can see project status without switching tabs.

#### **Research Requirements**
```yaml
Research Topics:
  - "Badging API use cases for web IDEs"
  - "Badge count vs boolean badge"
  - "Clear badge timing strategies"

Tools to Query:
  Context7: "Badging API navigator.setAppBadge"
  DeepWiki: "App badge notification patterns progressive web apps"
  Tavily: "Badging API browser support December 2025"

Implementation Questions:
  - Show error count or just indicator?
  - Clear badge when user focuses tab?
  - Show badge for AI activity completion?
```

#### **Acceptance Criteria**
```gherkin
Scenario: Build errors show badge
Given dev server running in WebContainers
When TypeScript errors or ESLint warnings occur
Then browser tab icon shows badge with error count
And badge color is red for errors, yellow for warnings
And clicking tab clears badge once user views terminal

Scenario: AI agent completion badge
Given AI agent running a long operation
When agent completes task successfully
Then badge shows checkmark indicator
And clicking tab clears badge

Scenario: Badge cleared on focus
Given tab has badge showing errors
When user switches to Via-Gent tab
Then badge clears after 2 seconds
```

#### **Implementation Guidance**
```typescript
// Pattern to implement
interface BadgeManager {
  setBuildErrors(count: number): void;
  setAgentComplete(): void;
  clearBadge(): void;
}

// Research: Use setAppBadge(count) or just setAppBadge()?
// Consider UX: Too many badges annoying?
```

***

### **Story 4.5.5: Custom Font Selection for Editor**

**As a** user,  
**I want** to choose my preferred coding font from my system,  
**So that** the editor uses fonts I'm comfortable with.

#### **Research Requirements**
```yaml
Research Topics:
  - "Local Font Access API enumeration"
  - "Font picker UI patterns"
  - "Monaco editor font family configuration"

Tools to Query:
  Context7: "Local Font Access API queryLocalFonts"
  DeepWiki: "Custom font selection web-based IDE"
  Tavily: "Local Font Access API December 2025 support"
  Exa: "Font picker implementations web apps"

Implementation Questions:
  - Filter to monospace fonts only?
  - Font preview before selection?
  - Store preference in IndexedDB?
```

#### **Acceptance Criteria**
```gherkin
Scenario: Font selection
Given user opens editor settings
When I click "Select Editor Font"
Then system fonts are enumerated via Local Font Access API
And only monospace fonts are shown (filtered)
And each font shows preview: "The quick brown fox..."
And clicking font applies it to Monaco editor
And preference saves to IndexedDB

Scenario: Fallback for unsupported browsers
Given browser doesn't support Local Font Access API
When user opens font settings
Then predefined font list appears (Fira Code, JetBrains Mono, etc.)
And user can select from predefined list only
```

#### **Implementation Guidance**
```typescript
// Pattern to research
interface FontManager {
  enumerateFonts(): Promise<FontData[]>;
  filterMonospace(fonts: FontData[]): FontData[];
  applyFont(fontFamily: string): void;
  previewFont(fontFamily: string): string; // HTML preview
}

// Research: How to detect if font is monospace?
// Research: queryLocalFonts permission model?
```

***

### **Story 4.5.6: Project & Snippet Sharing**

**As a** user,  
**I want** to share my project URL or code snippets via native share,  
**So that** I can quickly collaborate with others.

#### **Research Requirements**
```yaml
Research Topics:
  - "Web Share API file sharing"
  - "Share code snippet as text vs file"
  - "Web Share Target for receiving shares"

Tools to Query:
  Context7: "Web Share API navigator.share"
  DeepWiki: "Web Share API patterns progressive web apps"
  Tavily: "Web Share API December 2025 mobile desktop"
  Exa: "Web Share implementation examples GitHub"

Implementation Questions:
  - Share project as GitHub URL?
  - Share code as .txt file vs text?
  - Can we receive shared files (Web Share Target)?
```

#### **Acceptance Criteria**
```gherkin
Scenario: Share project URL
Given project is pushed to GitHub
When I click "Share Project"
Then native share dialog appears (mobile) or fallback (desktop)
And user can share via Slack, email, etc.
And shared URL is GitHub repository link

Scenario: Share code snippet
Given code selected in Monaco
When I right-click → "Share Selection"
Then share dialog offers:
  - Share as text
  - Share as .js/.ts file
And recipient receives code via chosen method

Scenario: Share preview screenshot
Given preview panel showing running app
When I click "Share Preview"
Then screenshot is captured
And share dialog offers image sharing
And user can send screenshot via native apps
```

#### **Implementation Guidance**
```typescript
// Pattern to implement
interface ShareManager {
  shareProject(githubUrl: string): Promise<void>;
  shareCode(code: string, filename: string): Promise<void>;
  shareScreenshot(dataUrl: string): Promise<void>;
}

// Research: Desktop fallback (copy to clipboard + toast)?
// Research: Can we use Web Share Target to receive shared files?
```

***

## **Non-Functional Requirements for Epic 4.5**

### **NFR-FUGU-PERF: Performance**
```yaml
Targets:
  - Permission check: < 200ms
  - File watcher polling cycle: < 100ms
  - Clipboard operation: < 500ms
  - Badge update: < 100ms
  - Font enumeration: < 2s
  - Share dialog: < 500ms

Rationale:
  - These are UI operations that must feel instant
```

### **NFR-FUGU-COMPAT: Compatibility**
```yaml
Browser Support Matrix:
  File System Access API:
    Chrome: ✅ 86+
    Edge: ✅ 86+
    Safari: ✅ 15.2+
    Firefox: ❌ (Fallback: IndexedDB)
  
  Async Clipboard:
    Chrome: ✅ 86+
    Edge: ✅ 86+
    Safari: ✅ 13.1+
    Firefox: ✅ 87+
  
  Badging API:
    Chrome: ✅ 81+
    Edge: ✅ 81+
    Safari: ⚠️ Partial 16.4+
    Firefox: ❌
  
  Local Font Access:
    Chrome: ✅ 103+
    Edge: ✅ 103+
    Safari: ❌
    Firefox: ❌
  
  Web Share:
    Chrome: ✅ 89+ (desktop), 61+ (mobile)
    Edge: ✅ 93+
    Safari: ✅ 12.1+
    Firefox: ❌ Desktop, ✅ Mobile

Fallback Strategy:
  - Always feature-detect before using
  - Provide graceful degradation
  - Document unsupported features clearly
```

### **NFR-FUGU-USE: Usability**
```yaml
Requirements:
  - Feature availability shown in UI
  - Unsupported features hidden or grayed out
  - Clear messaging: "Your browser doesn't support X"
  - Links to supported browsers
```

***

## **Testing Strategy for Epic 4.5**

### **Test Plan**
```yaml
Unit Tests:
  - Permission manager logic
  - Clipboard format conversion
  - Badge count calculations
  - Font filtering (monospace detection)

Integration Tests:
  - FSA permission flow with IndexedDB
  - File watcher + Monaco sync
  - Clipboard → FSA write
  - Badge → WebContainers error stream

E2E Tests:
  - Full permission grant → revoke → re-grant flow
  - External file change → reload workflow
  - Copy code → paste in external app → verify format
  - Share project → receive link workflow

Browser Compatibility Tests:
  - Test each feature on Chrome, Edge, Safari, Firefox
  - Verify fallbacks work correctly
  - Document browser-specific quirks
```

***

## **Implementation Guidance for AI Agent**

### **Phase 1: Research Sprint (1 week)**
```yaml
Week 1 Deliverables:
  - Research report: "Project Fugu APIs for Via-Gent"
  - Browser compatibility matrix (verified Dec 2025)
  - Proof-of-concept demos for each API
  - Decision: Which APIs to implement first

Research Workflow:
  1. Query Context7 for official API docs
  2. Query DeepWiki for integration patterns
  3. Query Tavily for latest compatibility data
  4. Query Exa for production examples
  5. Build mini-demos to validate findings
  6. Document research in docs/research/fugu-apis-research.md
```

### **Phase 2: Spec Writing (1 week)**
```yaml
Week 2 Deliverables:
  specs/:
    - 451-enhanced-fsa-permissions.md
    - 452-file-watcher.md
    - 453-clipboard-operations.md
    - 454-badging-integration.md
    - 455-font-selection.md
    - 456-share-api.md

Each Spec Must Include:
  - Research references (Context7, DeepWiki, etc.)
  - Browser compatibility notes
  - Fallback strategy
  - Implementation pattern
  - Testing approach
```

### **Phase 3: Implementation (2-3 weeks)**
```yaml
Week 3-5 Deliverables:
  src/lib/fugu/:
    - permission-manager.ts
    - file-watcher.ts
    - clipboard-manager.ts
    - badge-manager.ts
    - font-manager.ts
    - share-manager.ts
  
  tests/fugu/:
    - Unit tests for each manager
    - Integration tests
    - E2E tests

Implementation Order:
  Priority 1 (P0):
    - Enhanced FSA permissions (builds on Epic 3)
    - File watcher (critical for UX)
    - Clipboard operations (high user value)
  
  Priority 2 (P1):
    - Badging (nice-to-have notifications)
    - Font selection (customization feature)
    - Share API (collaboration feature)
```

### **Phase 4: Documentation (3 days)**
```yaml
Documentation Deliverables:
  docs/features/:
    - file-system-enhancements.md (user guide)
    - clipboard-guide.md
    - customization.md (fonts, badges)
    - sharing-projects.md
  
  docs/browser-support.md:
    - Updated compatibility matrix
    - Feature availability by browser
    - Recommended browser guidance
```

***

## **Risk Assessment**

### **Technical Risks**
```yaml
Risk: File watcher may require polling (no native observer)
  Impact: High CPU usage on large projects
  Mitigation:
    - Research optimal polling interval
    - Implement adaptive polling (slower when idle)
    - Allow user to disable if needed

Risk: Clipboard rich format may not work in all apps
  Impact: Medium (fallback to plain text acceptable)
  Mitigation:
    - Always provide plain text fallback
    - Test with common targets (Slack, Notion, Google Docs)

Risk: Badging API limited browser support
  Impact: Low (cosmetic feature)
  Mitigation:
    - Make optional, hide if unsupported
    - Document browser requirements

Risk: Local Font Access API very limited support
  Impact: Low (predefined fonts acceptable)
  Mitigation:
    - Provide curated monospace font list as fallback
    - Only enable for Chromium browsers
```

### **UX Risks**
```yaml
Risk: Permission prompts may confuse users
  Impact: Medium
  Mitigation:
    - Pre-explain before triggering prompts
    - Show visual guides (screenshots)
    - Provide "Learn More" links

Risk: Too many Fugu features overwhelming
  Impact: Low
  Mitigation:
    - Progressive disclosure (advanced settings)
    - Most features invisible until needed
    - Clear feature flags for power users
```

***

## **Success Metrics for Epic 4.5**

### **Completion Criteria**
```yaml
Definition of Done:
  ✅ All 6 stories have passing tests
  ✅ Browser compatibility validated on 4 browsers
  ✅ Documentation complete
  ✅ No regression in Epic 3 functionality
  ✅ Performance budgets met

User Validation:
  ✅ Users can grant and persist permissions reliably
  ✅ External file changes detected within 10s
  ✅ Copy/paste works with 3+ external apps
  ✅ Badge appears correctly for build errors
  ✅ Font selection works on Chrome/Edge
  ✅ Share dialog appears on mobile browsers
```

### **Optional Stretch Goals**
```yaml
If Time Permits:
  - Web Share Target (receive shared files)
  - File System Observer API (if available)
  - Custom badge images (not just count)
  - Font ligatures support in Monaco
```

***

## **Final Recommendations**

### **For the AI Agent:**

1. **Start with Research Phase**
   - Run all queries listed in each story
   - Document findings in markdown
   - Create proof-of-concept for each API

2. **Write Specs Before Code**
   - Each spec must cite research sources
   - Include browser compatibility from Tavily queries
   - Show fallback strategy for unsupported browsers

3. **Implement in Priority Order**
   - FSA enhancements first (builds on Epic 3)
   - File watcher second (most user-visible)
   - Others can be parallel or deferred

4. **Test on Real Browsers**
   - Don't rely on API documentation alone
   - Manually test each feature on Chrome, Safari, Firefox
   - Document quirks and workarounds

5. **Update Architecture Docs**
   - Add Fugu layer to architecture.md
   - Update browser requirements in README
   - Create browser compatibility guide

***

**This proposal is now ready for your AI agent to execute.** All research queries, documentation links, implementation patterns, and testing strategies are provided. The agent should start with the Research Sprint and document all findings before proceeding to implementation.
