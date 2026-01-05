# Via-gent IDE Information Architecture & User Flow Redesign

**Version**: 1.0.0
**Date**: 2025-12-25
**Status**: Phase 3 - Information Architecture Design
**Author**: UX Designer Agent (@bmad-bmm-ux-designer)
**Related Artifacts**:
- [`_bmad-output/ux-ui-audit-2025-12-25.md`](_bmad-output/ux-ui-audit-2025-12-25.md) - UX/UI Audit Report
- [`_bmad-output/design-system-8bit-2025-12-25.md`](_bmad-output/design-system-8bit-2025-12-25.md) - 8-bit Design System

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Personas](#2-user-personas)
3. [User Journey Maps](#3-user-journey-maps)
4. [Navigation Structure](#4-navigation-structure)
5. [Sign-Posting Strategy](#5-sign-posting-strategy)
6. [Information Hierarchy](#6-information-hierarchy)
7. [Page/Screen Architecture](#7-pagescreen-architecture)
8. [Responsive Navigation](#8-responsive-navigation)
9. [Accessibility Navigation](#9-accessibility-navigation)
10. [i18n Navigation](#10-i18n-navigation)
11. [State-Based Navigation](#11-state-based-navigation)
12. [Implementation Roadmap](#12-implementation-roadmap)

---

## 1. Executive Summary

### 1.1 Problem Statement

Based on the UX/UI audit report, Via-gent IDE suffers from critical information architecture problems:

- **No Onboarding Experience**: First-time users see project list with no guidance
- **No Sign-Posting**: Users don't know what's next or where they are
- **Poor Information Hierarchy**: Unclear primary vs secondary actions
- **Inconsistent Navigation**: Multiple navigation patterns across contexts
- **No Discovery Mechanisms**: No way to explore features or templates

### 1.2 Design Goals

**Primary Objectives**:
1. **Clear User Journeys**: Define paths for each user type from first visit to daily workflows
2. **Intuitive Navigation**: Single, consistent navigation model across all contexts
3. **Effective Sign-Posting**: Guide users through workflows with contextual hints
4. **Scalable Architecture**: Support future features without breaking existing patterns
5. **Multi-Persona Support**: Serve solo developers, teams, educators, and Vietnamese market

**Success Metrics**:
- Time to first successful AI interaction: < 5 minutes (new users)
- Task completion rate: > 80% for core workflows
- Navigation confusion rate: < 10% (measured via user feedback)
- Feature discoverability: > 70% of users find key features without help

### 1.3 Design Philosophy

**Principles**:
- **Progressive Disclosure**: Reveal complexity gradually as users gain experience
- **Contextual Guidance**: Provide help relevant to current task/state
- **Visual Hierarchy**: Use size, color, weight to indicate importance
- **Consistent Patterns**: Same navigation model across all screens
- **8-bit Aesthetic**: Maintain retro gaming feel while ensuring usability

---

## 2. User Personas

### 2.1 Persona 1: Solo Developer/Freelancer

**Profile**:
- **Name**: Alex Nguyen
- **Age**: 28
- **Role**: Full-stack developer, freelancer
- **Experience**: 5 years, comfortable with modern tools
- **Location**: Ho Chi Minh City, Vietnam (or similar timezone)
- **Primary Goals**:
  - Fast project setup and iteration
  - AI-assisted coding for productivity
  - Local development with cloud-like convenience
  - Quick access to recent projects

**Pain Points**:
- Time wasted on boilerplate code
- Context switching between multiple tools
- Difficulty finding previous work
- Unclear how to configure AI agents

**Key Needs**:
- Quick onboarding (< 2 minutes)
- Keyboard shortcuts for efficiency
- Recent projects dashboard
- One-click agent configuration
- Fast file operations

**Preferred Workflow**:
```
Open Via-gent → Select recent project → Start coding → Ask AI for help → Review changes → Deploy
```

**Success Criteria**:
- Can start coding in < 2 minutes
- AI assistance saves > 30% time
- Seamless transition between editor, terminal, chat
- Keyboard-driven workflow possible

---

### 2.2 Persona 2: Team/Enterprise Developer

**Profile**:
- **Name**: Sarah Chen
- **Age**: 32
- **Role**: Senior software engineer at tech company
- **Experience**: 8 years, team lead
- **Location**: San Francisco, USA
- **Primary Goals**:
  - Consistent development environment across team
  - Multi-agent workflows for different tasks
  - Project templates and standards
  - Collaboration and code review integration

**Pain Points**:
- Inconsistent tool configurations across team
- Difficulty sharing agent setups
- No project templates for team standards
- Hard to onboard new team members

**Key Needs**:
- Exportable/importable configurations
- Team project templates
- Multiple agent configurations
- Clear documentation and help
- Enterprise-grade reliability

**Preferred Workflow**:
```
Open Via-gent → Load team template → Configure agents → Collaborate via chat → Review PRs → Deploy
```

**Success Criteria**:
- Team can replicate setup in < 5 minutes
- Shared agent configurations work seamlessly
- Templates enforce coding standards
- Clear audit trail of AI changes

---

### 2.3 Persona 3: Education (Bootcamp/University)

**Profile**:
- **Name**: Professor Michael Tran
- **Age**: 45
- **Role**: Computer science instructor, bootcamp lead
- **Experience**: 20 years teaching programming
- **Location**: Hanoi, Vietnam
- **Primary Goals**:
  - Zero-setup coding environment for students
  - Interactive teaching tools
  - Progress tracking and assessment
  - Step-by-step guidance for beginners

**Pain Points**:
- Students struggle with environment setup
- Hard to track student progress
- No way to provide guided exercises
- Limited collaboration features

**Key Needs**:
- Pre-configured learning templates
- Guided tutorials and exercises
- Progress indicators and checkpoints
- Student-friendly error messages
- Instructor dashboard for monitoring

**Preferred Workflow**:
```
Create lab template → Share with students → Monitor progress → Provide AI hints → Review submissions
```

**Success Criteria**:
- Students start coding in < 1 minute
- Zero environment setup issues
- Clear learning progression
- Instructor can see all student work

---

### 2.4 Persona 4: Vietnamese Market User

**Profile**:
- **Name**: Lê Văn Minh
- **Age**: 24
- **Role**: Junior developer, learning web development
- **Experience**: 1 year, self-taught
- **Location**: Da Nang, Vietnam
- **Primary Goals**:
  - Learn modern development practices
  - Build portfolio projects
  - Get AI help in Vietnamese
  - Join local developer community

**Pain Points**:
- Language barrier with English documentation
- Limited access to premium tools
- Unclear learning path
- No localized examples or templates

**Key Needs**:
- Full Vietnamese language support
- Localized tutorials and examples
- Free/affordable access to AI features
- Community-driven learning resources
- Clear visual guidance (less text-heavy)

**Preferred Workflow**:
```
Open Via-gent (Vietnamese) → Select learning template → Follow guided tutorial → Ask AI in Vietnamese → Build portfolio
```

**Success Criteria**:
- Can navigate entire app in Vietnamese
- Understand all error messages
- Complete first project in < 1 hour
- Feel supported and encouraged

---

## 3. User Journey Maps

### 3.1 Journey 1: First-Time User (Onboarding)

**Persona**: All personas (universal onboarding)
**Goal**: From first visit to successful AI interaction
**Duration Target**: < 5 minutes

#### Step 1: Landing Page Entry
**Screen**: Landing Page (`/`)
**User Action**: Navigate to via-gent.app
**Sign-Posting**:
- Hero section with clear value proposition
- "Get Started" CTA button (Primary action)
- Feature highlights (bento grid)
- Language switcher visible (EN/VI)
- "Already have an account?" link

**Pain Point**: Unclear what Via-gent does
**Solution**: Clear tagline: "AI-Powered Browser IDE - Code Locally, Think Globally"

#### Step 2: Welcome Screen
**Screen**: Welcome Modal (`/welcome`)
**User Action**: Click "Get Started"
**Sign-Posting**:
- Step indicator: "Step 1 of 3: Welcome"
- Product introduction (30-second read)
- "Skip Tour" option for experienced users
- Animated demo of key features
- Progress bar at bottom

**Pain Point**: Too much text, boring
**Solution**: Interactive demo, skip option, visual storytelling

#### Step 3: Agent Configuration
**Screen**: Agent Setup Wizard (`/setup/agents`)
**User Action**: Configure AI provider
**Sign-Posting**:
- Step indicator: "Step 2 of 3: Configure AI"
- Provider cards with logos (OpenRouter, Anthropic, etc.)
- "Use Free Tier" badge where available
- API key input with visibility toggle
- "Test Connection" button with loading state
- Success checkmark animation

**Pain Point**: Confusing API keys
**Solution**: Clear instructions, test button, visual feedback

#### Step 4: First Project Creation
**Screen**: New Project Modal (`/setup/project`)
**User Action**: Create first project
**Sign-Posting**:
- Step indicator: "Step 3 of 3: Your First Project"
- Template selection cards (Blank, React Starter, Node.js, etc.)
- "Import from GitHub" option
- Project name input with validation
- "Create & Open" primary button

**Pain Point**: Don't know what to build
**Solution**: Templates with descriptions, import option

#### Step 5: IDE Workspace Entry
**Screen**: IDE Workspace (`/workspace/{id}`)
**User Action**: Enter coding environment
**Sign-Posting**:
- Guided tour overlay (optional, dismissible)
- "Click here to open file tree" tooltip
- "Press Cmd+K for command palette" hint
- "Ask AI anything" placeholder in chat
- First-time success celebration animation

**Pain Point**: Overwhelmed by interface
**Solution**: Progressive tour, dismissible, celebrate success

#### Step 6: First AI Interaction
**Screen**: Agent Chat Panel
**User Action**: Type first question to AI
**Sign-Posting**:
- "Try asking: 'Create a Hello World component'" suggestion
- Streaming response with typing animation
- Tool execution badges (read, write files)
- Approval overlay for file changes
- Success toast: "AI created 2 files!"

**Pain Point**: Don't know what to ask
**Solution**: Suggested prompts, visible tool actions

#### Journey Metrics
| Step | Target Time | Drop-off Risk | Key Success Indicator |
|------|-------------|----------------|----------------------|
| Landing Page | 10s | Low | CTA click rate > 30% |
| Welcome Screen | 30s | Medium | Completion rate > 80% |
| Agent Config | 2m | High | Success rate > 70% |
| Project Creation | 1m | Medium | Template selection > 50% |
| IDE Entry | 30s | Low | Tour dismissal > 60% |
| First AI Chat | 1m | Low | Successful response > 90% |

---

### 3.2 Journey 2: Daily Development Workflow

**Persona**: Solo Developer/Freelancer
**Goal**: Efficient daily coding session with AI assistance
**Duration Target**: < 2 minutes to start coding

#### Step 1: Dashboard Entry
**Screen**: Dashboard (`/`)
**User Action**: Open Via-gent
**Sign-Posting**:
- "Good morning, Alex" greeting
- Recent projects grid (last 5)
- "Continue working on {last project}" prominent card
- Quick actions: "New Project", "Open Folder", "Settings"
- Keyboard shortcut hints: "Press Cmd+P to open project"

**Pain Point**: Can't find recent project
**Solution**: Prominent "Continue" card, search bar

#### Step 2: Project Selection
**Screen**: Project List or Dashboard
**User Action**: Click project card
**Sign-Posting**:
- Hover effects on project cards
- "Last edited: 2 hours ago" metadata
- Project type badge (React, Node.js, etc.)
- Sync status indicator (green checkmark)
- Keyboard navigation support (arrow keys)

**Pain Point**: Too many projects, hard to find
**Solution**: Search, filters, recent first

#### Step 3: IDE Workspace Load
**Screen**: IDE Workspace (`/workspace/{id}`)
**User Action**: Wait for workspace to load
**Sign-Posting**:
- Loading skeleton for file tree
- "Loading WebContainer..." status message
- Progress bar for file sync
- "Synced 12/15 files" counter
- Ready notification: "Workspace ready!"

**Pain Point**: Slow loading, no feedback
**Solution**: Progress indicators, ready notification

#### Step 4: File Editing
**Screen**: Monaco Editor Panel
**User Action**: Edit code file
**Sign-Posting**:
- Tab bar with file names and close buttons
- Active tab highlighted
- "Unsaved changes" indicator (dot)
- Keyboard shortcut: "Ctrl+S to save"
- Auto-save toast: "Saved 2s ago"

**Pain Point**: Lose unsaved changes
**Solution**: Auto-save, unsaved indicator, clear save feedback

#### Step 5: Terminal Commands
**Screen**: Terminal Panel
**User Action**: Run npm install or other commands
**Sign-Posting**:
- Command history (up arrow)
- "Press Ctrl+C to cancel" hint
- Success message: "✓ npm install complete"
- Error highlighting with "View logs" link
- "Copy command" button on hover

**Pain Point**: Commands fail, unclear why
**Solution**: Clear error messages, logs link, copy button

#### Step 6: AI Assistance
**Screen**: Agent Chat Panel
**User Action**: Ask AI for help
**Sign-Posting**:
- Context-aware suggestions based on current file
- "Fix this error" quick action
- Streaming response with typing indicator
- Tool execution badges visible
- "Apply changes" approval button

**Pain Point**: AI doesn't understand context
**Solution**: File context injection, suggested prompts

#### Step 7: Preview & Test
**Screen**: Preview Panel
**User Action**: Preview changes in browser
**Sign-Posting**:
- "Previewing on port 3000" status
- Auto-refresh indicator
- "Open in new tab" button
- Console errors highlighted
- Responsive mode toggle (mobile/tablet/desktop)

**Pain Point**: Preview doesn't update
**Solution**: Auto-refresh, manual refresh button, status indicator

#### Journey Optimization Opportunities
**Friction Points**:
1. Project selection takes too long → Add Cmd+P quick open
2. Terminal commands fail often → Add command suggestions
3. AI context unclear → Auto-inject file content
4. Preview not updating → Add manual refresh shortcut

**Efficiency Gains**:
- Keyboard shortcuts for all actions
- Quick project switcher (Cmd+P)
- Auto-save and auto-sync
- Context-aware AI suggestions

---

### 3.3 Journey 3: Agent Configuration

**Persona**: Team/Enterprise Developer
**Goal**: Configure multiple AI agents for different workflows
**Duration Target**: < 3 minutes per agent

#### Step 1: Access Settings
**Screen**: Any screen
**User Action**: Click settings icon or Cmd+, shortcut
**Sign-Posting**:
- Settings modal opens with animation
- Left sidebar: Categories (General, Agents, Editor, Terminal, etc.)
- Active category highlighted
- Search bar: "Search settings..."
- Keyboard navigation hints

**Pain Point**: Can't find settings
**Solution**: Cmd+ shortcut, search, clear categories

#### Step 2: Navigate to Agents
**Screen**: Settings → Agents
**User Action**: Click "Agents" in sidebar
**Sign-Posting**:
- List of configured agents
- "Add New Agent" primary button
- Agent cards with status indicators
- "Edit" and "Delete" actions on hover
- Export/Import buttons at top

**Pain Point**: Hard to manage multiple agents
**Solution**: Clear list, bulk actions, export/import

#### Step 3: Create New Agent
**Screen**: Agent Configuration Dialog
**User Action**: Click "Add New Agent"
**Sign-Posting**:
- Step 1: Name and purpose (e.g., "Code Reviewer")
- Step 2: Select provider (dropdown with logos)
- Step 3: Choose model (with descriptions)
- Step 4: Configure parameters (temperature, max tokens)
- Step 5: Test connection
- Progress indicator at top

**Pain Point**: Too many options, confusing
**Solution**: Multi-step wizard, tooltips, test button

#### Step 4: Provider Selection
**Screen**: Agent Config → Provider
**User Action**: Select AI provider
**Sign-Posting**:
- Provider cards: OpenRouter, Anthropic, OpenAI, etc.
- "Recommended" badge on best providers
- Pricing info: "Free tier available"
- Feature comparison table
- "Learn more" links

**Pain Point**: Don't know which provider to choose
**Solution**: Recommendations, pricing, comparison table

#### Step 5: API Key Configuration
**Screen**: Agent Config → API Key
**User Action**: Enter API key
**Sign-Posting**:
- Input field with visibility toggle (eye icon)
- "Where to find API key?" help link
- "Test Connection" button
- Loading spinner during test
- Success/error message with icon

**Pain Point**: API key rejected, unclear why
**Solution**: Clear error messages, test button, help link

#### Step 6: Model Selection
**Screen**: Agent Config → Model
**User Action**: Choose AI model
**Sign-Posting**:
- Model cards with capabilities badges (code, chat, reasoning)
- Performance metrics: "Speed: Fast", "Cost: Low"
- Token limits displayed
- "Recommended for coding" badges
- Preview of model behavior

**Pain Point**: Don't know which model is best
**Solution**: Capability badges, metrics, recommendations

#### Step 7: Save & Test
**Screen**: Agent Config → Review
**User Action**: Click "Save Agent"
**Sign-Posting**:
- Summary card with all configuration
- "Test Agent" button before saving
- Loading spinner during test
- Success animation: checkmark
- "Agent saved!" toast notification

**Pain Point**: Configuration fails, unclear why
**Solution**: Test before save, clear error messages

#### Journey Success Metrics
| Step | Target Time | Success Rate | Key Metric |
|------|-------------|--------------|-------------|
| Access Settings | 5s | 100% | Shortcut usage > 50% |
| Navigate to Agents | 5s | 100% | Search usage > 30% |
| Create New Agent | 30s | 90% | Completion rate |
| Provider Selection | 30s | 95% | Recommendation acceptance > 60% |
| API Key Config | 1m | 85% | Test success rate > 90% |
| Model Selection | 30s | 95% | Recommendation acceptance > 70% |
| Save & Test | 20s | 90% | Test success rate > 95% |

---

### 3.4 Journey 4: AI-Assisted Development

**Persona**: Solo Developer/Freelancer
**Goal**: Complete coding task with AI assistance
**Duration Target**: < 5 minutes for simple task

#### Step 1: Start Chat
**Screen**: Agent Chat Panel
**User Action**: Click chat input or press Cmd+K
**Sign-Posting**:
- Chat input auto-focuses
- "Ask AI to help you code" placeholder
- Context suggestions: "Explain this function", "Refactor this code", "Add tests"
- File context indicator: "Context: src/App.tsx"
- "Attach file" button

**Pain Point**: Don't know what to ask
**Solution**: Suggested prompts, context indicator

#### Step 2: Describe Task
**Screen**: Agent Chat Panel
**User Action**: Type task description
**Sign-Posting**:
- Character counter (optional)
- "Press Enter to send" hint
- "Shift+Enter for new line" hint
- Typing indicator in message preview
- "Clear" button to reset

**Pain Point**: Accidentally send incomplete message
**Solution**: Enter vs Shift+Enter hints, clear button

#### Step 3: AI Processes Request
**Screen**: Agent Chat Panel
**User Action**: Wait for AI response
**Sign-Posting**:
- "AI is thinking..." animated indicator
- Progress steps: "Reading files...", "Analyzing code...", "Generating solution..."
- Streaming response with typing animation
- Tool execution badges appear: "📄 Read file", "✏️ Write file"
- Estimated time remaining

**Pain Point**: No feedback, feels stuck
**Solution**: Progress steps, streaming, time estimate

#### Step 4: Tool Execution
**Screen**: Agent Chat Panel
**User Action**: AI executes file operations
**Sign-Posting**:
- Tool call badge: "🔧 Tool: readFile"
- File path displayed: "src/components/Button.tsx"
- Loading spinner: "Executing..."
- Success indicator: "✓ Read 245 lines"
- Error indicator: "✗ File not found" with retry button

**Pain Point**: Tool fails, unclear why
**Solution**: Clear status, file path, retry button

#### Step 5: Review Changes
**Screen**: Agent Chat Panel
**User Action**: Review AI-proposed changes
**Sign-Posting**:
- Diff preview: "Changes to src/App.tsx"
- Added lines highlighted in green
- Removed lines highlighted in red
- "View full diff" button
- "Accept all" and "Reject all" bulk actions
- Individual file accept/reject buttons

**Pain Point**: Hard to understand changes
**Solution**: Diff preview, color coding, bulk actions

#### Step 6: Approve/Reject
**Screen**: Approval Overlay
**User Action**: Approve or reject changes
**Sign-Posting**:
- Overlay modal with change summary
- "3 files will be modified" message
- "Apply Changes" primary button (green)
- "Reject Changes" secondary button (red)
- "View Details" expandable section
- Keyboard shortcuts: "Enter to accept, Esc to reject"

**Pain Point**: Accidentally apply wrong changes
**Solution**: Clear summary, confirm dialog, keyboard shortcuts

#### Step 7: Apply & Verify
**Screen**: IDE Workspace
**User Action**: Changes applied to files
**Sign-Posting**:
- Success toast: "✓ 3 files updated"
- File tree refresh animation
- Editor shows new content with highlight
- "Undo" button available for 30s
- Auto-sync indicator: "Syncing to WebContainer..."

**Pain Point**: Changes break code, no way back
**Solution**: Undo button, highlight changes, sync status

#### Journey Optimization
**Efficiency Improvements**:
- Quick prompt suggestions (one-click)
- Bulk approve/reject actions
- Keyboard shortcuts for all steps
- Undo capability with timeout
- Visual change highlighting

**Success Indicators**:
- Task completion time reduced by 50%
- Fewer approval rejections (< 10%)
- Higher task success rate (> 90%)
- User satisfaction > 4/5

---

### 3.5 Journey 5: Project Management

**Persona**: All personas
**Goal**: Manage multiple projects efficiently
**Duration Target**: < 1 minute to switch projects

#### Step 1: Dashboard View
**Screen**: Dashboard (`/`)
**User Action**: View all projects
**Sign-Posting**:
- Project grid with cards
- Search bar: "Search projects..."
- Filter dropdown: "All", "Recent", "Favorites", "Archived"
- Sort options: "Last Modified", "Name", "Created"
- "New Project" primary button

**Pain Point**: Too many projects, hard to find
**Solution**: Search, filters, sort, favorites

#### Step 2: Create Project
**Screen**: New Project Modal
**User Action**: Click "New Project"
**Sign-Posting**:
- Project name input with validation
- Template selection: Blank, React, Vue, Node.js, etc.
- "Import from GitHub" option
- "Select folder" button (File System Access API)
- "Create Project" primary button

**Pain Point**: Don't know which template to choose
**Solution**: Template descriptions, import option, blank available

#### Step 3: Import from Folder
**Screen**: Folder Picker Dialog
**User Action**: Click "Select folder"
**Sign-Posting**:
- Browser native folder picker
- Selected folder path displayed
- "Include hidden files" checkbox
- Sync exclusions preview: ".git, node_modules, .DS_Store"
- "Import" button with progress bar

**Pain Point**: Wrong folder selected, no preview
**Solution**: Path display, exclusions preview, change option

#### Step 4: Project Sync
**Screen**: IDE Workspace
**User Action**: Wait for files to sync
**Sign-Posting**:
- Progress bar: "Syncing files..."
- File counter: "Synced 45/50 files"
- "Skipped 5 files (excluded)" message
- Sync speed indicator: "2.3 MB/s"
- "Sync complete" notification with checkmark

**Pain Point**: Slow sync, no feedback
**Solution**: Progress bar, file counter, speed indicator

#### Step 5: Switch Projects
**Screen**: Command Palette (Cmd+P)
**User Action**: Open quick switcher
**Sign-Posting**:
- Search input: "Type project name..."
- Recent projects list with keyboard shortcuts
- "Press Enter to open, Esc to close" hint
- Project metadata: "Last edited 2h ago"
- Active project highlighted

**Pain Point**: Takes too long to switch
**Solution**: Cmd+P shortcut, search, keyboard nav

#### Step 6: Archive/Delete
**Screen**: Project Settings
**User Action**: Manage project
**Sign-Posting**:
- "Archive Project" button (moves to archived list)
- "Delete Project" button (red, requires confirmation)
- "Export Project" button (downloads zip)
- "Duplicate Project" button
- Confirmation dialog for destructive actions

**Pain Point**: Accidentally delete project
**Solution**: Confirmation dialog, archive option, export before delete

#### Journey Success Metrics
| Action | Target Time | Success Rate | User Satisfaction |
|---------|-------------|--------------|-------------------|
| Find Project | 10s | 95% | > 4/5 |
| Create Project | 1m | 90% | > 4/5 |
| Import Folder | 2m | 85% | > 3.5/5 |
| Sync Files | 30s | 95% | > 4/5 |
| Switch Project | 15s | 98% | > 4.5/5 |
| Archive/Delete | 10s | 100% | > 4/5 |

---

## 4. Navigation Structure

### 4.1 Primary Navigation (Left Sidebar)

**Location**: Left side of screen (desktop), drawer (mobile)
**Width**: 280px (desktop), full screen (mobile)
**Components**:

#### 4.1.1 Home/Dashboard
**Icon**: Home (Lucide icon)
**Label**: "Home" / "Trang chủ" (VI)
**Route**: `/`
**Description**: Dashboard with recent projects and quick actions
**Visibility**: Always visible
**Keyboard Shortcut**: `Cmd+H` or `Alt+H`

#### 4.1.2 Projects
**Icon**: Folder (Lucide icon)
**Label**: "Projects" / "Dự án" (VI)
**Route**: `/projects`
**Description**: Full project list with search and filters
**Visibility**: Always visible
**Keyboard Shortcut**: `Cmd+P` or `Alt+P`

#### 4.1.3 Agent Chat
**Icon**: MessageSquare (Lucide icon)
**Label**: "Agent Chat" / "Trò chuyện AI" (VI)
**Route**: `/chat`
**Description**: AI chat interface with conversation history
**Visibility**: Always visible
**Keyboard Shortcut**: `Cmd+C` or `Alt+C`
**Badge**: Unread message count (if any)

#### 4.1.4 Settings
**Icon**: Settings (Lucide icon)
**Label**: "Settings" / "Cài đặt" (VI)
**Route**: `/settings`
**Description**: Application settings and preferences
**Visibility**: Always visible
**Keyboard Shortcut**: `Cmd+,` or `Alt+,`

#### 4.1.5 Help/Documentation
**Icon**: HelpCircle (Lucide icon)
**Label**: "Help" / "Trợ giúp" (VI)
**Route**: `/help`
**Description**: Documentation, tutorials, and support
**Visibility**: Always visible
**Keyboard Shortcut**: `Cmd+?` or `Alt+?`

**Navigation Behavior**:
- Desktop: Fixed left sidebar, collapsible to icons only
- Tablet: Collapsible sidebar, tap to expand
- Mobile: Bottom navigation bar, hamburger menu for full menu
- Active state: Highlighted with primary color accent
- Hover state: Subtle background change
- Focus state: Visible focus ring (WCAG AA compliant)

---

### 4.2 Secondary Navigation (Right Sidebar)

**Location**: Right side of IDE workspace
**Width**: 280px (resizable)
**Components**:

#### 4.2.1 File Tree
**Icon**: FileTree (Lucide icon)
**Label**: "Explorer" / "Trình duyệt" (VI)
**Description**: Project file structure and navigation
**Visibility**: Toggleable (Cmd+B)
**Keyboard Shortcut**: `Cmd+B` or `Alt+B`
**Features**:
- Expand/collapse folders
- File type icons
- New file/folder buttons
- Search within files
- Filter by file type

#### 4.2.2 Terminal
**Icon**: Terminal (Lucide icon)
**Label**: "Terminal" / "Terminal" (VI)
**Description**: Integrated terminal with WebContainer
**Visibility**: Toggleable (Cmd+J)
**Keyboard Shortcut**: `Cmd+J` or `Alt+J`
**Features**:
- Multiple terminal tabs
- Command history
- Copy/paste buttons
- Clear terminal button
- Split terminal option

#### 4.2.3 Preview
**Icon**: Eye (Lucide icon)
**Label**: "Preview" / "Xem trước" (VI)
**Description**: Live preview of running application
**Visibility**: Toggleable (Cmd+Shift+P)
**Keyboard Shortcut**: `Cmd+Shift+P` or `Alt+Shift+P`
**Features**:
- Device mode toggle (mobile/tablet/desktop)
- Refresh button
- Open in new tab
- Console panel
- Network inspector

#### 4.2.4 Agent Panel
**Icon**: Bot (Lucide icon)
**Label**: "Agents" / "Tác nhân AI" (VI)
**Description**: AI agent configuration and management
**Visibility**: Toggleable (Cmd+Shift+A)
**Keyboard Shortcut**: `Cmd+Shift+A` or `Alt+Shift+A`
**Features**:
- Agent list with status
- Quick agent switcher
- Agent settings button
- Activity log
- Usage statistics

#### 4.2.5 Search
**Icon**: Search (Lucide icon)
**Label**: "Search" / "Tìm kiếm" (VI)
**Description**: Global search across files and code
**Visibility**: Toggleable (Cmd+Shift+F)
**Keyboard Shortcut**: `Cmd+Shift+F` or `Alt+Shift+F`
**Features**:
- Fuzzy search
- File content search
- Regular expression support
- Search history
- Replace functionality

**Navigation Behavior**:
- Resizable panels (drag handle)
- Collapse to icons (double-click handle)
- Pin/unpin panels
- Reorder panels via drag and drop
- Remember panel state per project

---

### 4.3 Contextual Navigation

#### 4.3.1 Breadcrumbs
**Location**: Below header bar, above editor
**Format**: `Home > Projects > Project Name > Folder > File`
**Behavior**:
- Click any crumb to navigate
- Truncate long paths with ellipsis
- Show full path on hover
- Keyboard navigation: `Cmd+Left` to go back

**Example**:
```
Home > Projects > my-app > src > components > Button.tsx
```

#### 4.3.2 Tab Management
**Location**: Above editor panel
**Features**:
- File tabs with close buttons
- Active tab highlighting
- Unsaved changes indicator (dot)
- Tab context menu (right-click):
  - Close
  - Close Others
  - Close All
  - Copy Path
  - Reveal in File Tree
- Keyboard navigation: `Cmd+1`, `Cmd+2`, etc.
- Drag to reorder tabs

#### 4.3.3 Quick Actions
**Location**: Floating action buttons (bottom-right)
**Actions**:
- "New File" button (folder icon)
- "New Folder" button (folder-plus icon)
- "Share Project" button (share icon)
- "Settings" button (gear icon)
- Collapse/expand all panels button

#### 4.3.4 Keyboard Shortcuts
**Location**: Command Palette (Cmd+K)
**Features**:
- Searchable command list
- Keyboard shortcuts displayed
- Categories: File, Edit, View, Terminal, Help
- Fuzzy search
- Recent commands
- Custom shortcuts display

**Example Commands**:
```
Cmd+K  → Command Palette
Cmd+P  → Quick Open Project
Cmd+B  → Toggle File Tree
Cmd+J  → Toggle Terminal
Cmd+S  → Save File
Cmd+/  → Toggle Comment
```

---

### 4.4 Footer Navigation

**Location**: Bottom of screen (status bar)
**Height**: 32px
**Components** (left to right):

#### 4.4.1 Status Indicators
**Segments**:
1. **WebContainer Status**: "● Ready" (green) / "● Booting" (yellow)
2. **Sync Status**: "↑ Synced" (green) / "↓ Syncing..." (yellow)
3. **Cursor Position**: "Ln 42, Col 18"
4. **File Type**: "TypeScript React"
5. **Language**: "EN" / "VI" (clickable to switch)
6. **Theme**: "🌙 Dark" / "☀️ Light" (clickable to toggle)

**Behavior**:
- Click segment to see details
- Hover for tooltip with more info
- Color-coded status (green/yellow/red)
- Compact display (icons only on small screens)

#### 4.4.2 Quick Settings
**Actions**:
- Click language to switch EN/VI
- Click theme to toggle dark/light
- Right-click for context menu:
  - View all settings
  - Keyboard shortcuts
  - About Via-gent
  - Report issue

---

## 5. Sign-Posting Strategy

### 5.1 Visual Sign-Posting

#### 5.1.1 Progress Indicators
**Types**:
1. **Step Indicators**: "Step 2 of 5: Configure Agent"
   - Location: Top of modal/wizard
   - Visual: Horizontal bar with numbered circles
   - Active step: Filled circle with primary color
   - Completed steps: Checkmark in circle
   - Remaining steps: Empty circles

2. **Progress Bars**: "Syncing files..."
   - Location: Center of panel or overlay
   - Visual: Horizontal bar with percentage
   - Animation: Smooth fill from 0% to 100%
   - Color: Primary color for active, neutral for background

3. **Loading Spinners**: "Loading..."
   - Location: Center of content area
   - Visual: 8-bit style pixel spinner
   - Animation: Rotating pixels
   - Size: 24px (small), 48px (large)

4. **Skeleton Screens**: Placeholder content while loading
   - Location: Replace actual content temporarily
   - Visual: Gray blocks with shimmer animation
   - Purpose: Reduce perceived wait time

#### 5.1.2 Tooltips and Hints
**Types**:
1. **Hover Tooltips**: Explain icons and buttons
   - Trigger: Hover over element (500ms delay)
   - Content: Short description (1-2 lines)
   - Position: Above or below element
   - Style: Dark background, light text, arrow pointer

2. **Persistent Hints**: Contextual help that stays visible
   - Location: Below input or action
   - Content: "Press Enter to send, Shift+Enter for new line"
   - Style: Subtle gray text, smaller font
   - Dismissible: Click to hide

3. **Empty State Hints**: Guidance when no content exists
   - Location: Center of empty panel
   - Content: "No files yet. Click + to create your first file."
   - Visual: Icon + text + CTA button
   - Action: "Create File" primary button

#### 5.1.3 Empty States
**Pattern**:
```
┌─────────────────────────────────┐
│         [Icon 64px]          │
│                                 │
│      No Projects Yet           │
│                                 │
│  Create your first project to   │
│  start coding with AI.         │
│                                 │
│   [Create Project] [Import]    │
└─────────────────────────────────┘
```

**Components**:
- Large icon (64px) representing state
- Clear headline (text-lg, font-semibold)
- Helpful description (text-sm, neutral color)
- Primary CTA button (prominent)
- Secondary action (optional)

**Use Cases**:
- No projects created
- No files in project
- No agents configured
- No chat history
- No search results

---

### 5.2 Content Sign-Posting

#### 5.2.1 Clear Headings and Labels
**Hierarchy**:
1. **Page Headings** (text-3xl, font-bold)
   - Example: "Projects" / "Dự án"
   - Location: Top of page
   - Purpose: Identify current context

2. **Section Headings** (text-xl, font-semibold)
   - Example: "Recent Projects" / "Dự án gần đây"
   - Location: Top of section
   - Purpose: Group related content

3. **Card Headings** (text-lg, font-semibold)
   - Example: "my-app" (project name)
   - Location: Top of card
   - Purpose: Identify item

4. **Field Labels** (text-sm, font-medium)
   - Example: "Project Name" / "Tên dự án"
   - Location: Above input field
   - Purpose: Identify input

**Style Guidelines**:
- Use consistent capitalization (Title Case for EN, Sentence case for VI)
- Add required indicator (asterisk) for mandatory fields
- Include helper text below labels when needed
- Use semantic HTML (`<h1>`, `<h2>`, `<label>`, etc.)

#### 5.2.2 Descriptive Button Text
**Principles**:
1. **Action-Oriented**: Use verbs to describe action
   - Good: "Create Project" / "Tạo dự án"
   - Bad: "Project" / "Dự án"

2. **Specific**: Be clear about what will happen
   - Good: "Delete Project (cannot be undone)" / "Xóa dự án (không thể hoàn tác)"
   - Bad: "Delete" / "Xóa"

3. **Consistent**: Use same terminology throughout
   - Example: Always use "Agent" not "AI" or "Bot"

4. **Translated**: Provide both EN and VI
   - EN: "Save Changes"
   - VI: "Lưu thay đổi"

**Button Variants**:
- **Primary**: "Create Project" / "Tạo dự án" (most important action)
- **Secondary**: "Cancel" / "Hủy" (alternative action)
- **Destructive**: "Delete" / "Xóa" (red, requires confirmation)
- **Tertiary**: "Learn More" / "Tìm hiểu thêm" (link style)

#### 5.2.3 Helpful Error Messages
**Structure**:
```
[Error Icon] Error Title

Error description explaining what went wrong and why.

[Action Button] [Secondary Action]
```

**Examples**:
1. **API Key Invalid**:
   ```
   ⚠️ Invalid API Key

   The API key you provided is not valid or has expired.
   Please check your key and try again.

   [Re-enter Key] [Contact Support]
   ```

2. **File Sync Failed**:
   ```
   ✗ Sync Failed

   Could not sync files to WebContainer.
   This might be due to network issues or file permissions.

   [Retry Sync] [View Details]
   ```

3. **Agent Not Responding**:
   ```
   ⚠️ Agent Timeout

   The AI agent did not respond within 30 seconds.
   This might be due to high server load or network issues.

   [Try Again] [Use Different Agent]
   ```

**Guidelines**:
- Clear error title (what happened)
- Helpful description (why it happened)
- Actionable next steps (what to do)
- Avoid technical jargon (use plain language)
- Provide recovery options (retry, alternative actions)

#### 5.2.4 Success Confirmations
**Pattern**:
```
✓ [Success Message]

[Action Button] (optional)
```

**Examples**:
1. **Project Created**:
   ```
   ✓ Project Created Successfully

   Your new project "my-app" is ready.
   You can start coding now.

   [Open Project]
   ```

2. **Agent Configured**:
   ```
   ✓ Agent Saved

   Your "Code Assistant" agent is now configured and ready to use.

   [Start Chat]
   ```

3. **Changes Applied**:
   ```
   ✓ 3 Files Updated

   AI changes have been applied successfully.
   Your project is synced and ready.

   [View Changes]
   ```

**Guidelines**:
- Celebrate success with checkmark
- Clear confirmation message
- Optional next action button
- Auto-dismiss after 5 seconds (toast)
- Allow manual dismissal (click to close)

---

### 5.3 Interactive Sign-Posting

#### 5.3.1 Guided Tours
**Trigger**:
- First-time user (onboarding)
- New feature release
- User requests help (Cmd+?)

**Tour Structure**:
1. **Welcome Modal**: "Welcome to Via-gent! Let's take a quick tour."
   - Options: "Start Tour" / "Skip Tour"
   - Remember user choice (don't show again)

2. **Step-by-Step Overlay**: Highlight one element at a time
   - Example: "This is your file tree. Click to expand folders."
   - Visual: Dark overlay with spotlight on element
   - Controls: "Next" / "Previous" / "Skip Tour"
   - Progress: "Step 3 of 8"

3. **Tour Completion**: Celebration screen
   - Content: "You're all set! Start coding with AI."
   - Animation: Confetti or checkmark animation
   - Action: "Create First Project" button

**Tour Topics**:
- Dashboard overview
- Project creation
- IDE workspace layout
- Agent chat basics
- File editing
- Terminal usage
- Settings and preferences
- Keyboard shortcuts

#### 5.3.2 Interactive Tutorials
**Format**:
- Step-by-step instructions
- Interactive code editor
- Real-time feedback
- Progress tracking
- Completion certificate

**Example Tutorial**: "Create Your First React Component"
```
Step 1 of 5: Create Component File

1. Click the "+" button in the file tree
2. Select "New File"
3. Name it "Button.tsx"
4. Paste this code:

[Interactive Code Editor]

[Check My Work] button
```

**Features**:
- Hints and tips for each step
- Validation before proceeding
- "Show Solution" option (after 3 failed attempts)
- Progress bar
- Completion celebration

#### 5.3.3 Progressive Disclosure
**Principle**: Show complexity gradually as users gain experience

**Levels**:
1. **Beginner**: Show only essential features
   - Dashboard: Recent projects, new project button
   - IDE: Editor, file tree, terminal
   - Chat: Simple input/output
   - Hide: Advanced settings, custom agents, debug tools

2. **Intermediate**: Reveal more features
   - Dashboard: Search, filters, favorites
   - IDE: Preview panel, search, multiple terminals
   - Chat: Tool execution badges, approval workflow
   - Settings: Agent configuration, keyboard shortcuts

3. **Advanced**: Show all features
   - Dashboard: All filters, sorting, bulk actions
   - IDE: Split panels, custom layouts, debug tools
   - Chat: Multi-agent conversations, custom prompts
   - Settings: All preferences, export/import, advanced config

**Implementation**:
- User level setting (Beginner/Intermediate/Advanced)
- "Show Advanced Options" toggle
- "Learn More" expandable sections
- Gradual feature unlocking based on usage

#### 5.3.4 Contextual Help
**Trigger**: User clicks help icon or presses Cmd+?

**Help Modal Components**:
1. **Search Bar**: "Search help articles..."
2. **Categories**:
   - Getting Started
   - Projects
   - AI Agents
   - Editor
   - Terminal
   - Settings
   - Keyboard Shortcuts
   - Troubleshooting

3. **Popular Articles**: Top 5 most viewed
4. **Recent Articles**: Based on user's current context
5. **Contact Support**: Link to email or community forum

**Contextual Suggestions**:
- If in editor: Show editor-related help
- If in chat: Show AI agent help
- If error occurred: Show troubleshooting for that error
- If first-time user: Show onboarding help

---

## 6. Information Hierarchy

### 6.1 Level 1: Primary Actions

**Definition**: Most important actions that drive user goals
**Visual Weight**: Highest (large size, primary color, prominent placement)

**Examples**:

#### 6.1.1 Dashboard Primary Actions
1. **"Continue Working on {Project}"** card
   - Size: Large card (2x2 grid)
   - Color: Primary color accent
   - Placement: Top-left, most prominent
   - Action: Opens last project

2. **"Create New Project"** button
   - Size: Large button (48px height)
   - Color: Primary color background, white text
   - Placement: Top-right, floating action
   - Action: Opens new project modal

3. **"Import from Folder"** button
   - Size: Medium button (40px height)
   - Color: Primary color outline, primary color text
   - Placement: Below "Create New Project"
   - Action: Opens folder picker

#### 6.1.2 IDE Primary Actions
1. **"Ask AI"** chat input
   - Size: Full width of chat panel
   - Color: White background, primary color send button
   - Placement: Bottom of chat panel, always visible
   - Action: Send message to AI

2. **"Save File"** button (or auto-save indicator)
   - Size: Medium button in header
   - Color: Primary color when unsaved, neutral when saved
   - Placement: Top-right of editor
   - Action: Save current file

3. **"Run Terminal"** button
   - Size: Medium button in terminal header
   - Color: Primary color
   - Placement: Top-right of terminal panel
   - Action: Execute current command

#### 6.1.3 Settings Primary Actions
1. **"Add New Agent"** button
   - Size: Large button
   - Color: Primary color
   - Placement: Top-right of agents list
   - Action: Opens agent configuration wizard

2. **"Save Changes"** button
   - Size: Large button at bottom of modal
   - Color: Primary color
   - Placement: Sticky at bottom of settings page
   - Action: Save all settings changes

**Design Principles**:
- Use primary color (`--color-primary-500`) for background
- White or high-contrast text for readability
- Large touch targets (minimum 48px height)
- Prominent placement (top or right of section)
- Clear visual hierarchy (larger than secondary actions)

---

### 6.2 Level 2: Secondary Actions

**Definition**: Supporting actions that help users complete tasks
**Visual Weight**: Medium (medium size, neutral colors, less prominent)

**Examples**:

#### 6.2.1 Dashboard Secondary Actions
1. **"View All Projects"** link
   - Size: Text link (text-base)
   - Color: Primary color
   - Placement: Below recent projects grid
   - Action: Navigate to full project list

2. **"Open Folder"** button on project card
   - Size: Small button (32px height)
   - Color: Neutral background, neutral text
   - Placement: Bottom-right of project card
   - Action: Open project in IDE

3. **"Settings"** button
   - Size: Icon button (40px)
   - Color: Neutral icon
   - Placement: Header bar, right side
   - Action: Open settings modal

#### 6.2.2 IDE Secondary Actions
1. **"New File"** button
   - Size: Small button (32px height)
   - Color: Neutral background, neutral text
   - Placement: File tree header
   - Action: Create new file in current folder

2. **"New Folder"** button
   - Size: Small button (32px height)
   - Color: Neutral background, neutral text
   - Placement: File tree header, next to "New File"
   - Action: Create new folder

3. **"Toggle Panel"** buttons
   - Size: Icon buttons (40px)
   - Color: Neutral icon
   - Placement: Activity bar (left sidebar)
   - Action: Show/hide file tree, terminal, etc.

#### 6.2.3 Settings Secondary Actions
1. **"Edit Agent"** button
   - Size: Small icon button (32px)
   - Color: Neutral icon
   - Placement: Right side of agent card
   - Action: Open agent configuration

2. **"Delete Agent"** button
   - Size: Small icon button (32px)
   - Color: Error color icon (red)
   - Placement: Right side of agent card, visible on hover
   - Action: Delete agent with confirmation

3. **"Export Settings"** button
   - Size: Medium button (40px height)
   - Color: Neutral outline, neutral text
   - Placement: Settings page header
   - Action: Download settings as JSON

**Design Principles**:
- Use neutral colors (`--color-neutral-600` for text)
- Outline style (border only) or neutral background
- Smaller touch targets (32-40px height)
- Less prominent placement (below or beside primary actions)
- Hover effects to indicate interactivity

---

### 6.3 Level 3: Tertiary Actions

**Definition**: Utility actions that provide additional functionality
**Visual Weight**: Low (small size, subtle colors, minimal placement)

**Examples**:

#### 6.3.1 Dashboard Tertiary Actions
1. **"Keyboard Shortcuts"** link
   - Size: Small text link (text-sm)
   - Color: Neutral color (`--color-neutral-500`)
   - Placement: Footer or help menu
   - Action: Open keyboard shortcuts reference

2. **"About Via-gent"** link
   - Size: Small text link (text-sm)
   - Color: Neutral color
   - Placement: Footer or help menu
   - Action: Show version and credits

3. **"Report Issue"** link
   - Size: Small text link (text-sm)
   - Color: Neutral color
   - Placement: Footer or help menu
   - Action: Open bug report form

#### 6.3.2 IDE Tertiary Actions
1. **"Copy Path"** menu item
   - Size: Text menu item (text-sm)
   - Color: Neutral text
   - Placement: Tab context menu (right-click)
   - Action: Copy file path to clipboard

2. **"Reveal in File Tree"** menu item
   - Size: Text menu item (text-sm)
   - Color: Neutral text
   - Placement: Tab context menu
   - Action: Highlight file in file tree

3. **"Split Terminal"** button
   - Size: Small icon button (24px)
   - Color: Neutral icon
   - Placement: Terminal header, right side
   - Action: Split terminal into two panes

#### 6.3.3 Settings Tertiary Actions
1. **"Reset to Defaults"** link
   - Size: Small text link (text-sm)
   - Color: Error color (red)
   - Placement: Bottom of settings page
   - Action: Reset all settings to defaults

2. **"View Documentation"** link
   - Size: Small text link (text-sm)
   - Color: Neutral color
   - Placement: Settings page header
   - Action: Open external documentation

3. **"Provide Feedback"** link
   - Size: Small text link (text-sm)
   - Color: Neutral color
   - Placement: Settings page footer
   - Action: Open feedback form

**Design Principles**:
- Use neutral or subtle colors (`--color-neutral-500`)
- Text-only or small icon-only buttons
- Minimal touch targets (24-32px height)
- Discreet placement (footer, menus, context menus)
- Hover effects to indicate discoverability

---

### 6.4 Visual Hierarchy Implementation

**Color Usage**:
- **Primary Actions**: `--color-primary-500` background, white text
- **Secondary Actions**: `--color-neutral-600` text, neutral border
- **Tertiary Actions**: `--color-neutral-500` text, no border
- **Destructive Actions**: `--color-error-500` background, white text

**Size Usage**:
- **Primary**: `text-lg` (18px), 48px height buttons
- **Secondary**: `text-base` (16px), 40px height buttons
- **Tertiary**: `text-sm` (14px), 32px height buttons

**Weight Usage**:
- **Primary**: `font-bold` (700)
- **Secondary**: `font-medium` (500)
- **Tertiary**: `font-normal` (400)

**Spacing Usage**:
- **Primary**: `--spacing-6` (24px) margins
- **Secondary**: `--spacing-4` (16px) margins
- **Tertiary**: `--spacing-2` (8px) margins

---

## 7. Page/Screen Architecture

### 7.1 Landing Page

**Route**: `/`
**Purpose**: Welcome screen and project dashboard
**Layout**:

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] Via-gent          [Search] [EN/VI] [User] │
├─────────────────────────────────────────────────────────┤
│                                                   │
│  Welcome back, Alex!                               │
│                                                   │
│  ┌─────────────────────────────────────────────┐     │
│  │ Continue Working on my-app            [▶] │     │
│  │ Last edited: 2 hours ago               │     │
│  └─────────────────────────────────────────────┘     │
│                                                   │
│  Quick Actions                                     │
│  ┌──────────────┐ ┌──────────────┐             │
│  │ [+ New Project] │ │ [📁 Import] │             │
│  └──────────────┘ └──────────────┘             │
│                                                   │
│  Recent Projects (5)                    [View All →]│
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │my-app    │ │portfolio │ │blog-api  │        │
│  │[React]   │ │[Vue]    │ │[Node.js] │        │
│  │2h ago    │ │1d ago   │ │3d ago   │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                   │
│  Getting Started                                    │
│  ┌─────────────────────────────────────────────┐     │
│  │ 📚 Learn Via-gent in 5 minutes         │     │
│  │ 🤖 Create your first AI-powered project  │     │
│  │ 🎯 Explore templates and examples       │     │
│  └─────────────────────────────────────────────┘     │
│                                                   │
└─────────────────────────────────────────────────────────┘
```

**Components**:
1. **Header Bar**: Logo, search, language switcher, user menu
2. **Hero Section**: Personalized greeting, continue working card
3. **Quick Actions**: New project, import from folder
4. **Recent Projects**: Grid of project cards (last 5)
5. **Getting Started**: Bento grid of learning resources

**Sign-Posting**:
- "Continue working" card is most prominent
- Quick actions are primary buttons
- Recent projects show metadata (type, last edited)
- Getting started provides clear next steps

---

### 7.2 Dashboard

**Route**: `/dashboard`
**Purpose**: Full project management interface
**Layout**:

```
┌─────────────────────────────────────────────────────────┐
│  [← Home] Dashboard        [Search...] [Filter▼]   │
├─────────────────────────────────────────────────────────┤
│                                                   │
│  Projects (12)                    [+ New Project]  │
│                                                   │
│  Filter: [All ▼]  Sort: [Last Modified ▼]       │
│                                                   │
│  ┌─────────────────────────────────────────────┐     │
│  │ [★] my-app                    [⚙️] [🗑️] │     │
│  │     React • 12 files • 2h ago            │     │
│  └─────────────────────────────────────────────┘     │
│  ┌─────────────────────────────────────────────┐     │
│  │     portfolio                  [⚙️] [🗑️] │     │
│  │     Vue • 8 files • 1d ago               │     │
│  └─────────────────────────────────────────────┘     │
│  ┌─────────────────────────────────────────────┐     │
│  │ [★] blog-api                  [⚙️] [🗑️] │     │
│  │     Node.js • 15 files • 3d ago         │     │
│  └─────────────────────────────────────────────┘     │
│  ...                                              │
│                                                   │
│  [Load More]                                      │
│                                                   │
└─────────────────────────────────────────────────────────┘
```

**Components**:
1. **Breadcrumbs**: "Home > Dashboard"
2. **Search Bar**: Fuzzy search across projects
3. **Filter Dropdown**: All, Recent, Favorites, Archived
4. **Sort Dropdown**: Last Modified, Name, Created, Size
5. **Project Cards**: Grid layout with metadata
6. **Bulk Actions**: Select multiple projects (checkboxes)
7. **Pagination**: Load more button

**Sign-Posting**:
- Search bar prominent for quick access
- Filters and sort visible for organization
- Project cards show clear metadata
- Star/favorite action visible
- Settings and delete on hover

---

### 7.3 IDE Workspace

**Route**: `/workspace/{projectId}`
**Purpose**: Main coding environment
**Layout**:

```
┌─────────────────────────────────────────────────────────┐
│  [←] my-app  [💾] [▶ Preview] [🤖 Agents] [⚙️] │
├──────┬────────────────────────────────────────────────┤
│      │                                           │
│      │  ┌─────────────────────────────────────┐    │
│      │  │ src/App.tsx          [×]         │    │
│      │  ├─────────────────────────────────────┤    │
│      │  │ import React from 'react';          │    │
│      │  │                                  │    │
│      │  │ export function App() {            │    │
│      │  │   return (                        │    │
│      │  │     <div>Hello World</div>        │    │
│      │  │   );                             │    │
│      │  │ }                                │    │
│      │  └─────────────────────────────────────┘    │
│      │                                           │
│      │  ┌─────────────────────────────────────┐    │
│      │  │ src/components/Button.tsx  [×]   │    │
│      │  ├─────────────────────────────────────┤    │
│      │  │ // Button component               │    │
│      │  └─────────────────────────────────────┘    │
│      │                                           │
│      │  [+ New File] [+ New Folder]            │
│      │                                           │
├──────┼────────────────────────────────────────────────┤
│      │                                           │
│ 📁   │  🤖 Agent Chat                        │
│ src   │  ┌─────────────────────────────────────┐    │
│ ├─components  │  User: Ask AI to help you code     │    │
│ │  ├─Button.tsx  │  ┌─────────────────────────────┐│    │
│ │  └─Header.tsx  │  │ AI: Sure! I'll create a    ││    │
│ ├─App.tsx      │  │ Button component for you.    ││    │
│ └─index.ts    │  │                             ││    │
│               │  │ [🔧 Read file] [✏️ Write]  ││    │
│ 📦 node_modules│  └─────────────────────────────┘│    │
│               │  [📄 Read file] [✏️ Write]     │    │
│               │  ┌─────────────────────────────┐    │
│               │  │ [Apply Changes] [Reject]   │    │
│               │  └─────────────────────────────┘    │
│               │  ┌─────────────────────────────┐    │
│               │  │ Ask AI to help you code     │    │
│               │  │ [Send]                   │    │
│               │  └─────────────────────────────┘    │
├──────┴────────────────────────────────────────────────┤
│  💻 Terminal                                  │
│  ┌─────────────────────────────────────────────┐    │
│  │ $ npm install                          │    │
│  │ added 1423 packages in 32s            │    │
│  │ $                                     │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│  ● Ready  ↑ Synced  Ln 42, Col 18  TypeScript  │
│  EN/VI  🌙 Dark  [⚙️]  [?]  [Cmd+K]      │
└─────────────────────────────────────────────────────────┘
```

**Components**:
1. **Header Bar**: Project name, save button, preview toggle, agents, settings
2. **File Tree**: Expandable folder structure, file icons, new file/folder buttons
3. **Editor Panel**: Tabbed interface, code editing, syntax highlighting
4. **Agent Chat Panel**: Chat history, input, tool execution badges, approval overlay
5. **Terminal Panel**: Command input, output, multiple tabs
6. **Status Bar**: WebContainer status, sync status, cursor position, file type

**Sign-Posting**:
- Active file tab highlighted
- Unsaved changes indicator (dot)
- Tool execution badges visible in chat
- Approval overlay for changes
- Terminal status indicators
- Keyboard shortcuts visible in footer

---

### 7.4 Agent Configuration

**Route**: `/settings/agents`
**Purpose**: Configure AI agents
**Layout**:

```
┌─────────────────────────────────────────────────────────┐
│  [← Settings] Agents              [+ Add New Agent] │
├─────────────────────────────────────────────────────────┤
│                                                   │
│  My Agents (3)                      [Export] [Import]│
│                                                   │
│  ┌─────────────────────────────────────────────┐     │
│  │ 🤖 Code Assistant                    [⚙️] [🗑️]│     │
│  │     Provider: OpenRouter               │     │
│  │     Model: GPT-4                    │     │
│  │     Status: ● Ready                  │     │
│  └─────────────────────────────────────────────┘     │
│  ┌─────────────────────────────────────────────┐     │
│  │ 🔍 Code Reviewer                     [⚙️] [🗑️]│     │
│  │     Provider: Anthropic               │     │
│  │     Model: Claude 3.5 Sonnet          │     │
│  │     Status: ● Ready                  │     │
│  └─────────────────────────────────────────────┘     │
│  ┌─────────────────────────────────────────────┐     │
│  │ 📝 Documentation Helper              [⚙️] [🗑️]│     │
│  │     Provider: OpenAI                  │     │
│  │     Model: GPT-4 Turbo               │     │
│  │     Status: ● Ready                  │     │
│  └─────────────────────────────────────────────┘     │
│                                                   │
│  [Load More]                                      │
│                                                   │
└─────────────────────────────────────────────────────────┘
```

**Components**:
1. **Breadcrumbs**: "Settings > Agents"
2. **Agent List**: Cards with agent info
3. **Add Button**: Primary action to create new agent
4. **Export/Import**: Bulk configuration management
5. **Agent Cards**: Name, provider, model, status, actions

**Sign-Posting**:
- Agent status clearly visible (ready/error)
- Provider and model information displayed
- Edit and delete actions on hover
- Export/import for backup/sharing
- Clear "Add New Agent" primary button

---

### 7.5 Onboarding Flow

**Route**: `/welcome` (wizard)
**Purpose**: First-time user setup
**Layout**:

```
┌─────────────────────────────────────────────────────────┐
│                                                   │
│              Welcome to Via-gent! 🎉              │
│                                                   │
│  Let's get you set up in 3 easy steps.           │
│                                                   │
│  ┌─────────────────────────────────────────────┐     │
│  │  Step 1 of 3: Welcome                  │     │
│  │  ●━━━━━━━━━━━━━━━━━━○○○              │     │
│  └─────────────────────────────────────────────┘     │
│                                                   │
│  Via-gent is an AI-powered browser IDE that      │
│  lets you code locally with intelligent assistance.  │
│                                                   │
│  Key Features:                                    │
│  • 🤖 AI Agents for coding help                 │
│  • 💻 Local development with cloud convenience    │
│  • 📁 File sync with WebContainers             │
│  • 🌐 Live preview and testing                  │
│                                                   │
│  ┌─────────────────────────────────────────────┐     │
│  │         [Watch 30s Demo]                │     │
│  └─────────────────────────────────────────────┘     │
│                                                   │
│  [Skip Tour]                    [Next: Configure AI →]│
│                                                   │
└─────────────────────────────────────────────────────────┘
```

**Wizard Steps**:

**Step 1: Welcome** (shown above)
- Product introduction
- Feature highlights
- Demo video
- Skip option

**Step 2: Configure AI**
```
┌─────────────────────────────────────────────────────────┐
│                                                   │
│  Step 2 of 3: Configure AI                     │
│  ●━━━━━━━━━━━━━━━━━━━━━━━○○              │
│                                                   │
│  Choose your AI provider:                           │
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │OpenRouter │ │Anthropic │ │OpenAI    │    │
│  │[Recommended]│ │          │ │          │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                                   │
│  Enter your API key:                               │
│  ┌─────────────────────────────────────────────┐     │
│  │ sk-or-...  [👁️]               [Test →]│     │
│  └─────────────────────────────────────────────┘     │
│                                                   │
│  [← Back]                    [Next: Create Project →]│
│                                                   │
└─────────────────────────────────────────────────────────┘
```

**Step 3: Create Project**
```
┌─────────────────────────────────────────────────────────┐
│                                                   │
│  Step 3 of 3: Create Your First Project         │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━○              │
│                                                   │
│  Choose a template to get started:                 │
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Blank   │ │  React   │ │  Node.js │    │
│  │  Start   │ │ Starter  │ │ Starter  │    │
│  │  fresh   │ │  App     │ │  API     │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                                   │
│  Or import from GitHub:                             │
│  ┌─────────────────────────────────────────────┐     │
│  │ https://github.com/user/repo    [Import→]│     │
│  └─────────────────────────────────────────────┘     │
│                                                   │
│  [← Back]                    [Finish & Start Coding →]│
│                                                   │
└─────────────────────────────────────────────────────────┘
```

**Sign-Posting**:
- Clear step indicator with progress bar
- Visual provider selection with recommendations
- API key input with test button
- Template selection with descriptions
- Clear next/back navigation
- Skip option available

---

## 8. Responsive Navigation

### 8.1 Breakpoints

**Breakpoint Definitions**:
- **Mobile**: < 640px (small phones)
- **Tablet**: 640px - 1024px (large phones, small tablets)
- **Desktop**: 1024px - 1440px (laptops, large tablets)
- **Large Desktop**: > 1440px (desktop monitors)

---

### 8.2 Mobile Navigation (< 640px)

**Layout Changes**:
- Left sidebar: Hidden, accessible via hamburger menu
- Right sidebar: Hidden, accessible via floating action buttons
- Bottom navigation: Fixed bar with 4-5 icons
- Panels: Full-screen overlays (one panel visible at a time)

**Bottom Navigation Bar**:
```
┌─────────────────────────────────────────────────┐
│                                           │
│         [Editor Content]                   │
│                                           │
│                                           │
├─────────────────────────────────────────────────┤
│ [🏠 Home] [📁 Projects] [💬 Chat] [⚙️] │
└─────────────────────────────────────────────────┘
```

**Navigation Behavior**:
- Tap icon to open full-screen panel
- Swipe left/right to switch between panels
- Back button to return to editor
- Pull down to refresh (in applicable panels)

**Panel Overlays**:
- File tree: Full-screen with back button
- Terminal: Full-screen with keyboard
- Agent chat: Full-screen with input at bottom
- Settings: Full-screen with close button

---

### 8.3 Tablet Navigation (640px - 1024px)

**Layout Changes**:
- Left sidebar: Collapsible (icons only), tap to expand
- Right sidebar: Collapsible, tap to expand
- Bottom navigation: Removed (use sidebars instead)
- Panels: Slide-over panels (50% width)

**Collapsible Sidebar**:
```
Collapsed (48px):          Expanded (280px):
┌───┐                    ┌─────────────┐
│ 🏠 │                    │ 🏠 Home    │
│ 📁 │                    │ 📁 Projects │
│ 💬 │                    │ 💬 Chat    │
│ ⚙️ │                    │ ⚙️ Settings │
└───┘                    └─────────────┘
```

**Navigation Behavior**:
- Tap collapsed icon to expand sidebar
- Tap outside sidebar to collapse
- Panels slide in from right (50% width)
- Multiple panels can be open simultaneously

---

### 8.4 Desktop Navigation (1024px - 1440px)

**Layout Changes**:
- Left sidebar: Fixed (280px width)
- Right sidebar: Fixed (280px width, resizable)
- Bottom navigation: Not present
- Panels: Fixed in layout, all visible

**Full Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  [Left Sidebar: 280px]  [Editor: flex]  [Right: 280px]│
├──────────────┬──────────────────────────┬─────────────────────┤
│              │                          │                     │
│  [Nav Items]│  [Editor + Terminal]   │  [Panels]          │
│              │                          │                     │
│              │                          │                     │
└──────────────┴──────────────────────────┴─────────────────────┘
```

**Navigation Behavior**:
- All panels visible simultaneously
- Resizable panels (drag handles)
- Keyboard shortcuts for panel toggles
- Drag and drop to reorder tabs

---

### 8.5 Large Desktop Navigation (> 1440px)

**Layout Changes**:
- Left sidebar: Fixed (280px width)
- Right sidebar: Fixed (320px width, resizable)
- Editor: Expanded width
- Panels: Enhanced features (more space)

**Enhanced Features**:
- Split terminal (2 panes side-by-side)
- Side-by-side file comparison
- Multiple chat conversations
- Larger preview panel with device frames

**Navigation Behavior**:
- Same as desktop but with more space
- Optional: Show/hide panel headers
- Optional: Compact mode (smaller fonts, more content)

---

## 9. Accessibility Navigation

### 9.1 Keyboard Navigation

**Global Shortcuts**:
- `Tab`: Move focus to next interactive element
- `Shift+Tab`: Move focus to previous element
- `Enter`: Activate focused element or submit form
- `Escape`: Close modal, cancel action, exit focus trap
- `Space`: Toggle checkbox or activate button
- `Arrow Keys`: Navigate within lists, grids, menus

**Navigation Shortcuts**:
- `Cmd+K` / `Ctrl+K`: Open command palette
- `Cmd+P` / `Ctrl+P`: Quick open project
- `Cmd+B` / `Ctrl+B`: Toggle file tree
- `Cmd+J` / `Ctrl+J`: Toggle terminal
- `Cmd+,` / `Ctrl+,`: Open settings
- `Cmd+?` / `Ctrl+?`: Open help

**Editor Shortcuts**:
- `Cmd+S` / `Ctrl+S`: Save file
- `Cmd+W` / `Ctrl+W`: Close file tab
- `Cmd+1-9` / `Ctrl+1-9`: Switch to tab 1-9
- `Cmd+[/]` / `Ctrl+[/]`: Toggle comment

**Focus Management**:
- Modal opens: Focus moves to first interactive element
- Modal closes: Focus returns to trigger element
- Panel toggles: Focus moves to panel content
- Search opens: Focus moves to search input

---

### 9.2 Screen Reader Support

**ARIA Labels and Roles**:
- Navigation items: `role="navigation"`, `aria-label="Main navigation"`
- Buttons: `aria-label="{action}"` (e.g., "Create new project")
- Icons: `aria-hidden="true"` (decorative icons)
- Progress bars: `role="progressbar"`, `aria-valuenow="50"`, `aria-valuemin="0"`, `aria-valuemax="100"`
- Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="{title}"`

**Live Regions**:
- Toast notifications: `role="status"`, `aria-live="polite"`
- Error messages: `role="alert"`, `aria-live="assertive"`
- Loading states: `role="status"`, `aria-live="polite"`, `aria-busy="true"`

**Screen Reader Announcements**:
- "Agent is thinking..." (when AI starts processing)
- "File saved successfully" (after save)
- "3 files updated" (after AI changes applied)
- "WebContainer ready" (when environment loads)

---

### 9.3 Focus Indicators

**Visible Focus Ring**:
- Color: Primary color (`--color-primary-500`)
- Width: 2px
- Offset: 2px (outside element)
- Style: Solid outline, no blur

**Focus States**:
- Default: 2px primary color outline
- Error: 2px error color outline (`--color-error-500`)
- Success: 2px success color outline (`--color-success-500`)
- Warning: 2px warning color outline (`--color-warning-500`)

**Focus Trap**:
- Modals: Trap focus within modal content
- Drawers: Trap focus within drawer
- Command palette: Trap focus within search results

---

### 9.4 WCAG AA Compliance

**Color Contrast**:
- All text meets minimum 4.5:1 contrast ratio
- Large text (18px+) meets minimum 3:1 contrast ratio
- Icons with text meet 3:1 contrast ratio
- Focus indicators meet 3:1 contrast ratio

**Touch Targets**:
- Minimum size: 44x44px (mobile)
- Spacing: At least 8px between touch targets
- No overlapping touch targets

**Keyboard Accessibility**:
- All functionality available via keyboard
- No keyboard traps (except intentional modals)
- Clear focus indicators
- Logical tab order

**Semantic HTML**:
- Use proper heading hierarchy (`<h1>` to `<h6>`)
- Use semantic elements (`<nav>`, `<main>`, `<aside>`, `<footer>`)
- Use form labels (`<label>`, `aria-label`)
- Use landmark roles (`role="banner"`, `role="main"`, etc.)

---

## 10. i18n Navigation

### 10.1 Language Switcher

**Placement**:
- Header bar (top-right)
- Footer status bar (left segment)
- Settings page (prominent option)

**Design**:
```
┌─────────────────────────────────────────────────┐
│  Via-gent              [EN ▼] [⚙️] [User]│
└─────────────────────────────────────────────────┘
```

**Behavior**:
- Click to open dropdown with available languages
- Current language highlighted
- Switch language immediately (no page reload)
- Persist language preference in localStorage
- Update all UI text dynamically

**Available Languages**:
- English (EN)
- Vietnamese (VI)

---

### 10.2 Translated Labels

**Navigation Labels**:

| Element | English (EN) | Vietnamese (VI) |
|---------|---------------|-----------------|
| Home | Home | Trang chủ |
| Projects | Projects | Dự án |
| Agent Chat | Agent Chat | Trò chuyện AI |
| Settings | Settings | Cài đặt |
| Help | Help | Trợ giúp |
| Explorer | Explorer | Trình duyệt |
| Terminal | Terminal | Terminal |
| Preview | Preview | Xem trước |
| Agents | Agents | Tác nhân AI |
| Search | Search | Tìm kiếm |
| New Project | New Project | Tạo dự án mới |
| Import | Import | Nhập |
| Export | Export | Xuất |
| Save | Save | Lưu |
| Cancel | Cancel | Hủy |
| Delete | Delete | Xóa |
| Edit | Edit | Chỉnh sửa |
| Create | Create | Tạo |
| Open | Open | Mở |
| Close | Close | Đóng |

**Button Labels**:

| Action | English (EN) | Vietnamese (VI) |
|--------|---------------|-----------------|
| Create Project | Create Project | Tạo dự án |
| Save Changes | Save Changes | Lưu thay đổi |
| Apply Changes | Apply Changes | Áp dụng thay đổi |
| Reject Changes | Reject Changes | Từ chối thay đổi |
| Delete Project | Delete Project | Xóa dự án |
| Configure Agent | Configure Agent | Cấu hình tác nhân |
| Test Connection | Test Connection | Kiểm tra kết nối |
| Start Coding | Start Coding | Bắt đầu viết mã |
| View All | View All | Xem tất cả |

---

### 10.3 RTL Support Preparation

**Future Consideration**:
- Use CSS logical properties (`margin-inline-start` instead of `margin-left`)
- Use `dir="rtl"` attribute for RTL languages
- Test with RTL languages (Arabic, Hebrew)
- Mirror icons and layouts for RTL

**Implementation**:
```css
/* Use logical properties */
.button {
  margin-inline-start: 8px;  /* Instead of margin-left */
  padding-inline-end: 16px; /* Instead of padding-right */
}

/* RTL-aware layout */
.sidebar {
  display: flex;
  flex-direction: column;
  writing-mode: horizontal-tb; /* Default */
}

[dir="rtl"] .sidebar {
  writing-mode: horizontal-tb;
}
```

---

### 10.4 Cultural Considerations

**Vietnamese Market**:
- Use formal/polite language (Xin chào, Cảm ơn)
- Avoid slang or overly casual language
- Use appropriate honorifics
- Consider cultural context in examples and templates

**Date/Time Format**:
- English: "December 25, 2025", "2:30 PM"
- Vietnamese: "25 tháng 12, 2025", "2:30 CH"

**Number Format**:
- English: "1,234.56"
- Vietnamese: "1.234,56" (comma for decimal, period for thousands)

---

## 11. State-Based Navigation

### 11.1 Empty States

**Definition**: No content exists (no projects, no files, no agents, etc.)

**Pattern**:
```
┌─────────────────────────────────────────────────┐
│                                           │
│         [Icon: 64px]                   │
│                                           │
│      {Headline}                           │
│                                           │
│  {Description}                              │
│                                           │
│   [Primary CTA] [Secondary Action]          │
│                                           │
└─────────────────────────────────────────────────┘
```

**Empty State Examples**:

1. **No Projects**:
   - Icon: Folder icon (64px)
   - Headline: "No Projects Yet" / "Chưa có dự án nào"
   - Description: "Create your first project to start coding with AI." / "Tạo dự án đầu tiên để bắt đầu viết mã với AI."
   - Primary CTA: "Create Project" / "Tạo dự án"
   - Secondary Action: "Import from Folder" / "Nhập từ thư mục"

2. **No Files**:
   - Icon: File icon (64px)
   - Headline: "No Files Yet" / "Chưa có tệp tin nào"
   - Description: "This project is empty. Create your first file to get started." / "Dự án này trống. Tạo tệp tin đầu tiên để bắt đầu."
   - Primary CTA: "Create File" / "Tạo tệp tin"
   - Secondary Action: "Import from GitHub" / "Nhập từ GitHub"

3. **No Agents**:
   - Icon: Bot icon (64px)
   - Headline: "No Agents Configured" / "Chưa cấu hình tác nhân nào"
   - Description: "Configure your first AI agent to start getting coding help." / "Cấu hình tác nhân AI đầu tiên để bắt đầu nhận trợ giúp viết mã."
   - Primary CTA: "Add Agent" / "Thêm tác nhân"
   - Secondary Action: "Use Default Agent" / "Sử dụng tác nhân mặc định"

4. **No Chat History**:
   - Icon: MessageSquare icon (64px)
   - Headline: "No Chat History" / "Chưa có lịch sử trò chuyện"
   - Description: "Start a conversation with AI to get coding help." / "Bắt đầu cuộc trò chuyện với AI để nhận trợ giúp viết mã."
   - Primary CTA: "Start Chat" / "Bắt đầu trò chuyện"
   - Secondary Action: "View Examples" / "Xem ví dụ"

---

### 11.2 Loading States

**Definition**: Content is being loaded or processed

**Pattern 1: Skeleton Screens**
```
┌─────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐     │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │     │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │     │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │     │
│  └─────────────────────────────────────┘     │
│  Loading projects...                       │
└─────────────────────────────────────────────────┘
```

**Pattern 2: Progress Indicators**
```
┌─────────────────────────────────────────────────┐
│                                           │
│         [Spinner: 48px]                   │
│                                           │
│      Loading WebContainer...                │
│                                           │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━○○○         │
│                                           │
│  Step 2 of 5: Booting environment        │
│                                           │
└─────────────────────────────────────────────────┘
```

**Pattern 3: Loading Bars**
```
┌─────────────────────────────────────────────────┐
│  Syncing files...                          │
│                                           │
│  ┌─────────────────────────────────────┐     │
│  │ ████████████░░░░░░░░░░░░░░░  45% │     │
│  └─────────────────────────────────────┘     │
│                                           │
│  Synced 23/50 files                        │
│                                           │
└─────────────────────────────────────────────────┘
```

**Loading State Examples**:

1. **Project Loading**:
   - Skeleton: Project card placeholders
   - Text: "Loading projects..." / "Đang tải dự án..."
   - Progress: Bar with percentage

2. **WebContainer Booting**:
   - Spinner: 8-bit pixel spinner
   - Text: "Booting WebContainer..." / "Đang khởi động WebContainer..."
   - Steps: "Initializing...", "Loading packages...", "Ready"

3. **File Syncing**:
   - Progress bar: Horizontal bar with percentage
   - Counter: "Synced 45/50 files" / "Đã đồng bộ 45/50 tệp"
   - Speed: "2.3 MB/s"

4. **AI Processing**:
   - Spinner: Typing animation (three dots)
   - Text: "AI is thinking..." / "AI đang suy nghĩ..."
   - Steps: "Reading files...", "Analyzing code...", "Generating solution..."

---

### 11.3 Error States

**Definition**: Operation failed or error occurred

**Pattern**:
```
┌─────────────────────────────────────────────────┐
│                                           │
│         [Error Icon: 48px]                │
│                                           │
│      {Error Title}                         │
│                                           │
│  {Error Description}                        │
│                                           │
│   [Primary Action] [Secondary Action]        │
│                                           │
└─────────────────────────────────────────────────┘
```

**Error State Examples**:

1. **API Key Invalid**:
   - Icon: Warning icon (yellow)
   - Title: "Invalid API Key" / "Khóa API không hợp lệ"
   - Description: "The API key you provided is not valid or has expired. Please check your key and try again." / "Khóa API bạn cung cấp không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra khóa của bạn và thử lại."
   - Primary Action: "Re-enter Key" / "Nhập lại khóa"
   - Secondary Action: "Contact Support" / "Liên hệ hỗ trợ"

2. **File Sync Failed**:
   - Icon: Error icon (red)
   - Title: "Sync Failed" / "Đồng bộ thất bại"
   - Description: "Could not sync files to WebContainer. This might be due to network issues or file permissions." / "Không thể đồng bộ tệp tin sang WebContainer. Điều này có thể do vấn đề mạng hoặc quyền tệp tin."
   - Primary Action: "Retry Sync" / "Thử đồng bộ lại"
   - Secondary Action: "View Details" / "Xem chi tiết"

3. **Agent Not Responding**:
   - Icon: Warning icon (yellow)
   - Title: "Agent Timeout" / "Tác nhân hết thời gian"
   - Description: "The AI agent did not respond within 30 seconds. This might be due to high server load or network issues." / "Tác nhân AI không phản hồi trong vòng 30 giây. Điều này có thể do tải máy chủ cao hoặc vấn đề mạng."
   - Primary Action: "Try Again" / "Thử lại"
   - Secondary Action: "Use Different Agent" / "Sử dụng tác nhân khác"

4. **Project Not Found**:
   - Icon: Error icon (red)
   - Title: "Project Not Found" / "Không tìm thấy dự án"
   - Description: "The project you're looking for doesn't exist or has been deleted." / "Dự án bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
   - Primary Action: "Go to Dashboard" / "Về bảng điều khiển"
   - Secondary Action: "Create New Project" / "Tạo dự án mới"

---

### 11.4 Success States

**Definition**: Operation completed successfully

**Pattern**:
```
┌─────────────────────────────────────────────────┐
│                                           │
│         [Success Icon: 48px]              │
│                                           │
│      {Success Message}                      │
│                                           │
│  {Description}                              │
│                                           │
│   [Primary Action] (optional)              │
│                                           │
└─────────────────────────────────────────────────┘
```

**Success State Examples**:

1. **Project Created**:
   - Icon: Checkmark (green)
   - Title: "Project Created Successfully" / "Tạo dự án thành công"
   - Description: "Your new project 'my-app' is ready. You can start coding now." / "Dự án mới 'my-app' của bạn đã sẵn sàng. Bạn có thể bắt đầu viết mã ngay bây giờ."
   - Primary Action: "Open Project" / "Mở dự án"

2. **Agent Configured**:
   - Icon: Checkmark (green)
   - Title: "Agent Saved" / "Đã lưu tác nhân"
   - Description: "Your 'Code Assistant' agent is now configured and ready to use." / "Tác nhân 'Trợ lý viết mã' của bạn đã được cấu hình và sẵn sàng để sử dụng."
   - Primary Action: "Start Chat" / "Bắt đầu trò chuyện"

3. **Changes Applied**:
   - Icon: Checkmark (green)
   - Title: "Files Updated" / "Đã cập nhật tệp tin"
   - Description: "AI changes have been applied successfully. Your project is synced and ready." / "Thay đổi AI đã được áp dụng thành công. Dự án của bạn đã đồng bộ và sẵn sàng."
   - Primary Action: "View Changes" / "Xem thay đổi"

4. **Sync Complete**:
   - Icon: Checkmark (green)
   - Title: "Sync Complete" / "Đã đồng bộ xong"
   - Description: "All files have been synced to WebContainer successfully." / "Tất cả tệp tin đã được đồng bộ sang WebContainer thành công."
   - Primary Action: None (auto-dismiss)

---

### 11.5 Offline States

**Definition**: No internet connection or service unavailable

**Pattern**:
```
┌─────────────────────────────────────────────────┐
│                                           │
│         [Offline Icon: 64px]              │
│                                           │
│      You're Offline                         │
│                                           │
│  Some features may not be available.        │
│  Please check your internet connection.        │
│                                           │
│   [Retry Connection] [Work Offline]        │
│                                           │
└─────────────────────────────────────────────────┘
```

**Offline State Examples**:

1. **No Internet**:
   - Icon: Wifi-off icon (gray)
   - Title: "You're Offline" / "Bạn đang ngoại tuyến"
   - Description: "Some features may not be available. Please check your internet connection." / "Một số tính năng có thể không khả dụng. Vui lòng kiểm tra kết nối internet của bạn."
   - Primary Action: "Retry Connection" / "Thử kết nối lại"
   - Secondary Action: "Work Offline" / "Làm việc ngoại tuyến"

2. **Service Unavailable**:
   - Icon: Cloud-off icon (gray)
   - Title: "Service Temporarily Unavailable" / "Dịch vụ tạm thời không khả dụng"
   - Description: "We're experiencing issues with our AI services. Please try again later." / "Chúng tôi đang gặp vấn đề với dịch vụ AI. Vui lòng thử lại sau."
   - Primary Action: "Retry" / "Thử lại"
   - Secondary Action: "View Status Page" / "Xem trang trạng thái"

3. **WebContainer Failed**:
   - Icon: Alert-triangle icon (yellow)
   - Title: "WebContainer Failed to Load" / "WebContainer không tải được"
   - Description: "Could not initialize WebContainer. This might be due to browser compatibility or missing headers." / "Không thể khởi tạo WebContainer. Điều này có thể do tương thích trình duyệt hoặc thiếu tiêu đề."
   - Primary Action: "Retry" / "Thử lại"
   - Secondary Action: "View Troubleshooting" / "Xem khắc phục sự cố"

---

## 12. Implementation Roadmap

### 12.1 Phase 1: Foundation (Week 1-2)

**Goal**: Implement core navigation structure and sign-posting

**Tasks**:
1. ✅ Create navigation components (left sidebar, right sidebar, bottom nav)
2. ✅ Implement responsive breakpoints (mobile, tablet, desktop, large desktop)
3. ✅ Add breadcrumbs and tab management
4. ✅ Create command palette (Cmd+K)
5. ✅ Implement empty states for all major screens
6. ✅ Add loading states (skeletons, progress bars, spinners)
7. ✅ Create error state components
8. ✅ Add success state components

**Deliverables**:
- Navigation component library
- Responsive layout system
- State component library (empty, loading, error, success)
- Command palette implementation

---

### 12.2 Phase 2: Onboarding (Week 3)

**Goal**: Create guided onboarding experience

**Tasks**:
1. ✅ Design and implement welcome screen
2. ✅ Create agent configuration wizard (3-step)
3. ✅ Build project creation flow with templates
4. ✅ Implement guided tour system
5. ✅ Add interactive tutorials
6. ✅ Create celebration animations
7. ✅ Implement skip tour functionality
8. ✅ Add progress tracking for onboarding

**Deliverables**:
- Onboarding wizard system
- Agent configuration flow
- Project creation with templates
- Guided tour framework
- Tutorial system

---

### 12.3 Phase 3: Sign-Posting (Week 4)

**Goal**: Implement comprehensive sign-posting system

**Tasks**:
1. ✅ Add tooltips to all interactive elements
2. ✅ Create progress indicators for multi-step flows
3. ✅ Implement persistent hints for key actions
4. ✅ Add contextual help system
5. ✅ Create "What's Next" suggestions
6. ✅ Implement quick action suggestions
7. ✅ Add keyboard shortcut hints
8. ✅ Create help modal with search

**Deliverables**:
- Tooltip system
- Progress indicator components
- Hint and suggestion system
- Contextual help framework
- Help center modal

---

### 12.4 Phase 4: Accessibility (Week 5)

**Goal**: Ensure WCAG AA compliance

**Tasks**:
1. ✅ Add ARIA labels to all interactive elements
2. ✅ Implement keyboard navigation for all features
3. ✅ Add focus indicators and focus management
4. ✅ Create screen reader announcements
5. ✅ Implement live regions for dynamic content
6. ✅ Test with screen readers (NVDA, JAWS, VoiceOver)
7. ✅ Validate color contrast ratios
8. ✅ Test keyboard-only navigation

**Deliverables**:
- Accessibility audit report
- ARIA implementation
- Keyboard navigation system
- Screen reader support
- WCAG AA compliance certification

---

### 12.5 Phase 5: i18n (Week 6)

**Goal**: Complete EN/VI localization

**Tasks**:
1. ✅ Translate all navigation labels to Vietnamese
2. ✅ Translate all button text to Vietnamese
3. ✅ Translate all error messages to Vietnamese
4. ✅ Translate all success messages to Vietnamese
5. ✅ Implement language switcher component
6. ✅ Add language persistence (localStorage)
7. ✅ Test RTL layout preparation
8. ✅ Validate cultural appropriateness

**Deliverables**:
- Complete Vietnamese translation
- Language switcher component
- i18n implementation
- Cultural adaptation guide

---

### 12.6 Phase 6: Polish & Testing (Week 7-8)

**Goal**: Refine user experience and validate with users

**Tasks**:
1. ✅ Conduct usability testing with all personas
2. ✅ Gather feedback on navigation and sign-posting
3. ✅ Iterate on design based on feedback
4. ✅ Performance optimization (load times, animations)
5. ✅ Cross-browser testing (Chrome, Firefox, Safari, Edge)
6. ✅ Mobile device testing (iOS, Android)
7. ✅ Accessibility testing (screen readers, keyboard)
8. ✅ Final documentation and handoff to development

**Deliverables**:
- Usability test report
- Performance benchmarks
- Cross-browser compatibility report
- Mobile compatibility report
- Accessibility compliance report
- Final design specification

---

## Appendix A: Design Tokens Reference

**Color Tokens**:
- Primary: `--color-primary-500` (#5e73ff)
- Secondary: `--color-secondary-purple-500` (#a855f7)
- Success: `--color-success-500` (#22c55e)
- Warning: `--color-warning-500` (#eab308)
- Error: `--color-error-500` (#ef4444)
- Neutral: `--color-neutral-600` (#52525b)
- Background: `--color-neutral-950` (#09090b)

**Typography Tokens**:
- Text-xs: 12px
- Text-sm: 14px
- Text-base: 16px
- Text-lg: 18px
- Text-xl: 20px
- Text-2xl: 24px
- Text-3xl: 32px

**Spacing Tokens**:
- Spacing-1: 4px
- Spacing-2: 8px
- Spacing-3: 12px
- Spacing-4: 16px
- Spacing-6: 24px
- Spacing-8: 32px

**Border Radius Tokens**:
- Radius-sm: 2px
- Radius-base: 4px
- Radius-md: 8px
- Radius-lg: 12px

**Shadow Tokens**:
- Shadow-sm: 0 1px 0 rgba(0, 0, 0, 0.1)
- Shadow-base: 0 2px 0 rgba(0, 0, 0, 0.15)
- Shadow-md: 0 4px 0 rgba(0, 0, 0, 0.2)
- Shadow-lg: 0 8px 0 rgba(0, 0, 0, 0.25)

---

## Appendix B: Component Specifications

**Navigation Components**:
- `PrimarySidebar`: Left sidebar with main navigation
- `SecondarySidebar`: Right sidebar with panels
- `BottomNavigation`: Mobile bottom navigation bar
- `Breadcrumbs`: Context navigation breadcrumbs
- `TabBar`: File tab management
- `CommandPalette`: Cmd+K command palette

**Sign-Posting Components**:
- `ProgressBar`: Linear progress indicator
- `StepIndicator`: Multi-step progress display
- `Spinner`: Loading spinner (8-bit style)
- `Skeleton`: Content placeholder
- `Tooltip`: Hover tooltip
- `Hint`: Persistent hint text
- `EmptyState`: Empty state display

**State Components**:
- `LoadingState`: Loading screen with spinner
- `ErrorState`: Error display with actions
- `SuccessState`: Success confirmation
- `OfflineState`: Offline warning
- `NotFoundState`: 404 not found

---

## Appendix C: User Research Validation

**Validation Methods**:
1. **Usability Testing**: 5 users per persona, moderated sessions
2. **A/B Testing**: Compare old vs new navigation
3. **Survey Feedback**: Collect user satisfaction scores
4. **Analytics Tracking**: Measure navigation patterns and drop-offs
5. **Accessibility Audit**: WCAG AA compliance testing

**Success Criteria**:
- Time to first AI interaction: < 5 minutes (target)
- Task completion rate: > 80% (target)
- Navigation confusion rate: < 10% (target)
- User satisfaction: > 4/5 (target)
- Accessibility score: WCAG AA compliant (target)

---

**Document End**

**Next Steps**:
1. Create wireframes for key interfaces
2. Generate component specifications
3. Create implementation stories for development
4. Execute through story-dev-cycle workflow

**Related Documents**:
- [`_bmad-output/ux-ui-audit-2025-12-25.md`](_bmad-output/ux-ui-audit-2025-12-25.md) - UX/UI Audit Report
- [`_bmad-output/design-system-8bit-2025-12-25.md`](_bmad-output/design-system-8bit-2025-12-25.md) - 8-bit Design System
- [`_bmad-output/ux-specification/`](_bmad-output/ux-specification/) - UX Specifications Directory

**Version History**:
- v1.0.0 (2025-12-25): Initial information architecture specification
