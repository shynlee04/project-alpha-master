# Sprint Plan: Cross-Workspace Agent Intelligence

**Sprint Goal**: Enable Gemini Multimodal capabilities and deploy the Floating Chat UI in the Notes workspace.

## Epic 1: Gemini Multimodal Core
**Description**: Integrate Google's Gemini 1.5 models with full multimodal support (Image/Audio/Video).

### Story 1.1: Gemini Adapter Implementation
*   **As a**: Developer
*   **I want to**: Use `gemini-1.5-flash` in the agent chat
*   **So that**: I can send images and audio to the AI.
*   **Tasks**:
    *   Install `@google/generative-ai`.
    *   Create `src/lib/agent/providers/gemini-adapter.ts`.
    *   Implement `streamChat` with `Content` and `Part` mapping.
    *   Register in `provider-factory`.

### Story 1.2: Multimodal Input Handling
*   **As a**: User
*   **I want to**: Upload images/audio in the chat input
*   **So that**: The agent can analyze them.
*   **Tasks**:
    *   Update `ChatInput` to accept non-text files.
    *   Implement `FileConverter` to base64 encoding.
    *   Pass `attachments` array to `useAgentChat`.

## Epic 2: Notes Workspace Floating Chat
**Description**: A persistent, context-aware chat interface for the Notes workspace.

### Story 2.1: Floating Chat Widget
*   **As a**: User
*   **I want to**: Have a chat bar at the bottom of my notes
*   **So that**: I can ask questions without leaving my writing flow.
*   **Tasks**:
    *   Create `src/presentation/components/notes/FloatingChatWidget.tsx`.
    *   Implement "Bottom 1/5" layout with slide-up expansion.
    *   Integrate `UnifiedChatPanel`.

### Story 2.2: Context Injection
*   **As a**: User
*   **I want to**: The AI to know what note I'm writing
*   **So that**: I don't have to copy-paste context.
*   **Tasks**:
    *   Create `useActiveNoteContext` hook.
    *   Inject note content into `systemPrompt` dynamically.

## Epic 3: Advanced Capabilities
**Description**: Permissions and Export.

### Story 3.1: YOLO Mode (Auto-Approve)
*   **As a**: Power User
*   **I want to**: Disable permission prompts for tools
*   **So that**: The agent can work autonomously.
*   **Tasks**:
    *   Add `yoloMode` boolean to `AgentConfig`.
    *   Bypass `checkPermission` if `yoloMode` is true.
    *   Add visual hazard indicator (Red Border/Icon).

### Story 3.2: Rich Export
*   **As a**: User
*   **I want to**: Save the chat as a PDF or HTML
*   **So that**: I can share it.
*   **Tasks**:
    *   Create `ExportMenu` component.
    *   Implement `html` and `pdf` export strategies.
