# ARTIFACT 1: CHAT Workspace - Main Panel Investigation
**Date:** 2026-01-13
**Workspace:** CHAT
**Focus:** Main Chat Panel (Center)
**Status:** INVESTIGATION COMPLETE

---

## ULTRA-THINK: What This Artifact Is

**This IS:**
- ✅ Evidence-based investigation of CHAT workspace main panel
- ✅ All props documented from actual component files
- ✅ Feature mapping and user flow analysis
- ✅ Component connection hierarchy

**This is NOT:**
- ❌ Assumptions without code verification
- ❌ Implementation recommendations
- ❌ Solutions without investigation

---

## COMPONENT HIERARCHY

```
UnifiedChatPanel (Entry Point)
    ├── AgentChatPanel (Tools Mode)
    │   ├── AgentChatHeader
    │   ├── AgentChatApprovals
    │   ├── AutoApproveSettings
    │   ├── ThreadManager (Sidebar)
    │   └── EnhancedChatInterface
    │       ├── ChatInputControls
    │       ├── StreamdownRenderer
    │       │   ├── CodeBlock
    │       │   ├── CollapsibleSection
    │       │   └── MermaidDiagram
    │       ├── ChatExportControls
    │       ├── MultiAgentChatPanel
    │       └── (Message Bubbles)
    └── RAGChatPanel (Simple Mode - not investigated)
```

---

## COMPONENT 1: UnifiedChatPanel

**File:** `src/presentation/components/chat/UnifiedChatPanel.tsx:114`

**Props:**
```typescript
// Base props (all modes)
projectId: string
className?: string

// Agent mode props
mode: 'agent'
projectName?: string
workspaceType?: 'ide' | 'notes' | 'knowledge' | 'study'

// Simple mode props (not investigated)
mode: 'simple'
messages: ChatMessage[]
activeCitation: Citation | null
onSendMessage: (message: string) => void
// ... more simple mode props
```

**Features Enabled:**
- Single entry point for all chat interfaces
- Mode routing (agent vs simple)
- Workspace type propagation

**Connected To:**
- Routes to: AgentChatPanel (agent mode) or RAGChatPanel (simple mode)

**User Flow:**
1. Component receives mode prop
2. Switch statement routes to appropriate panel
3. Props forwarded to child component
4. Fallback to agent mode if unknown mode

---

## COMPONENT 2: AgentChatPanel

**File:** `src/presentation/components/ide/AgentChatPanel.tsx:76`

**Props:**
```typescript
projectId: string | null
projectName?: string = 'Project'
workspaceType?: WorkspaceType = 'ide'
```

**Features Enabled:**
- AI conversation with tool execution
- Multi-modal support (text + images)
- Workspace-specific system prompts
- Tool approval/rejection workflow
- Conversation persistence across workspaces
- Thread management integration
- Auto-approve settings
- Debug session capture
- Artifact preview and save

**Connected To:**
- **Parent:** IDE workspace routes, ChatPanelWrapper
- **Children:** EnhancedChatInterface, AgentChatHeader, AgentChatApprovals, ThreadManager, AutoApproveSettings
- **Stores:** useConversationStore, useAgentSelection, useAutoApproveStore, useWorkspaceSync
- **Hooks:** useAgentChatWithTools, usePromptEnhancer, useChatEventBridge

**User Flow:**
1. User selects workspace/project → AgentChatPanel mounts
2. System prompt generated based on workspace type
3. User types message → EnhancedChatInterface captures input
4. Message sent via useAgentChatWithTools → AI processes with tools
5. Tool executions require approval → AgentChatApprovals modal appears
6. Messages persisted to conversation store
7. State broadcast to other workspaces via event system

---

## COMPONENT 3: EnhancedChatInterface

**File:** `src/presentation/components/ide/EnhancedChatInterface.tsx:98`

**Props:**
```typescript
messages: ChatMessage[]
isTyping?: boolean
onSendMessage: (content: string, images?: ImageContent[]) => void
className?: string
onPreviewArtifact?: (code: string) => void
onSaveArtifact?: (code: string, language: string) => void
onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
setScrollRef?: React.RefObject<HTMLDivElement | null>
autoScroll?: boolean
enableMultiAgent?: boolean
providerId?: string
modelId?: string
conversationId?: string
threadId?: string
belowMessagesContent?: ReactNode
```

**Features Enabled:**
- Message bubbles with user/agent distinction
- Tool execution log expansion
- Typing indicator
- Auto-scroll to bottom
- Mobile optimization (iOS Safari fixes)
- File/URL attachments
- Voice recording input
- Note reference support (/note command)
- Artifact preview modal
- Chat export functionality
- Multi-agent chat panel integration

**Connected To:**
- **Parent:** AgentChatPanel
- **Children:** ChatMessageBubble, ToolExecutionLog, ChatInputControls, NoteReferencePicker, ArtifactPreviewModal
- **Hooks:** useArtifactPreview, useChatExport, useVoiceRecording, useNoteReferencePicker

**User Flow:**
1. User sees message history or welcome screen
2. User types in ChatInputControls or uses voice input
3. On submit: onSendMessage called with optional images
4. Message displayed in ChatMessageBubble
5. If contains code: rendered via StreamdownRenderer
6. Tool executions shown in collapsible ToolExecutionLog

---

## COMPONENT 4: ChatInputControls

**File:** `src/presentation/components/chat/ChatInputControls.tsx:191`

**Props:**
```typescript
input: string
setInput: (value: string) => void
attachments: Attachment[]
onAddAttachment: (attachment: Attachment) => void
onRemoveAttachment: (id: string) => void
voiceRecording: UseVoiceRecordingState
onVoiceClick: () => void
isTyping: boolean
onSubmit: (e: React.FormEvent) => void
isMobile?: boolean
showAttachments?: boolean
showVoice?: boolean
```

**Features Enabled:**
- Organized input controls with use-case grouping:
  1. INPUT ENHANCEMENTS: File attachment, voice input (left)
  2. PRIMARY INPUT: Message textarea (center, flex-1)
  3. SEND ACTION: Send button (right, clear CTA)
- Voice recording with visual feedback
- File attachment support
- Mobile-responsive layout
- Touch targets ≥44x44px on mobile

**Connected To:**
- **Parent:** EnhancedChatInterface
- **Children:** VoiceButton (inline), FileAttachmentInput
- **Hooks:** useVoiceRecording

**User Flow:**
1. User sees organized control layout
2. Can type in textarea, attach files, or use voice input
3. Voice button shows recording indicator and volume visualization
4. On Enter (without Shift): form submits via onSubmit
5. Disabled state when assistant is typing

---

## COMPONENT 5: ThreadManager

**File:** `src/presentation/components/chat/ThreadManager.tsx:51`

**Props:**
```typescript
workspaceType: WorkspaceType
conversationId?: string
onThreadSelect?: (threadId: string) => void
```

**Features Enabled:**
- Thread CRUD operations (Create, Read, Update, Delete)
- Thread listing by workspace
- Active thread selection
- Thread renaming
- Thread archiving/unarchiving
- Archived threads viewing
- Thread creation with auto-selection
- Delete confirmation dialog

**Connected To:**
- **Parent:** AgentChatPanel (via sidebar), ChatPanelWrapper
- **Hooks:** useThreadManager (store-integrated)

**User Flow:**
1. User opens thread sidebar from AgentChatPanel
2. Sees list of active threads for current workspace
3. Can create new thread, select existing, rename, archive, or delete
4. Archived threads shown in collapsible section
5. On selection: setActiveThread called and onThreadSelect callback

---

## STATE MANAGEMENT

### Stores Used
| Store | Purpose | Access Pattern |
|-------|---------|----------------|
| useConversationStore | Message/thread persistence | useShallow selector |
| useAgentSelection | Agent management per workspace | Direct access |
| useAutoApproveStore | Tool approval preferences | Direct access |
| useWorkspaceSync | File/terminal tools | Direct access |
| useThreadManager | Thread CRUD | Hook wrapper |

### Facade Pattern
```
useConversationStore (FACADE)
    └── delegates to → useUnifiedChatStore (REAL)
```

**Evidence:** `src/infrastructure/persistence/stores/conversation/useConversationStore.ts:6-7`

---

## IDENTIFIED ISSUES

### Critical (P0)
1. **Textarea max-height too restrictive** - `max-h-[150px]` clips multi-line content
   - **Evidence:** `ChatInputControls.tsx:297`

### High (P1)
2. **Facade pattern confusion** - Components import from facade but it wraps unified store
   - **Evidence:** `useConversationStore.ts:150-394`

---

## DELIVERABLES STATUS

- ✅ AgentChatPanel investigated
- ✅ EnhancedChatInterface investigated
- ✅ ChatInputControls investigated
- ✅ ThreadManager investigated
- ✅ State management mapped
- ✅ User flows documented

---

**Last Updated:** 2026-01-13
**Version:** 1.0
**Agent ID:** af9e908
