---
title: Cross-Workspace Gemini Multimodal & Floating Chat UI Research
date: 2026-01-05
status: APPROVED
author: Deep Research Agent
tags: [gemini, multimodal, ui-ux, floating-chat, architecture]
---

# Research Report: Gemini Multimodal & Floating Chat Architecture

## 1. Executive Summary
This report analyzes the technical requirements for integrating Google's Gemini 1.5 Multimodal SDK into the Via-gent platform and designing a "Floating Chat" UI for the Notes workspace. The goal is to enable seamless, context-aware AI interactions that traverse workspace boundaries (IDE ↔ Notes).

## 2. Gemini Multimodal SDK (`@google/generative-ai`)

### 2.1 Technical Specifications
*   **Package**: `@google/generative-ai`
*   **Models**: `gemini-1.5-flash` (low latency, high throughput) and `gemini-1.5-pro` (complex reasoning).
*   **Input Types**:
    *   **Text**: Standard prompts.
    *   **Images**: Base64 encoded or URI referenced.
    *   **Audio/Video**: Supported via File API (upload to Google AI Studio for caching) or inline data (limited size). For real-time, `InlineData` with `mimeType` is standard.
*   **Grounding**: Supported via "Grounding with Google Search" tool in the API config.

### 2.2 Integration Pattern (Provider Adapter)
The existing `ProviderAdapter` interface in `src/lib/agent/providers/provider-adapter.ts` needs to be extended to support `InlineData` parts.

**Proposed Schema Mapping:**
```typescript
// Agent System Part -> Gemini Part
{
  type: 'image',
  content: 'base64...' 
} 
// Transforms to:
{
  inlineData: {
    data: 'base64...',
    mimeType: 'image/png'
  }
}
```

## 3. Floating Chat UI Patterns (UX/UI)

### 3.1 Benchmark Analysis
*   **Perplexity**: Clean, centered input bar that floats above content. Results appear in a structured stream with "Sources" prominently displayed.
*   **Notion**: "Ask AI" is a non-modal overlay that slides up or appears as a bubble. It is context-aware (reads current page).
*   **Requirement**: "Bottom 1/5 layer block" floating chat.

### 3.2 Component Architecture
*   **Container**: `Fixed` position container at `bottom-0`, `z-index: 50`.
*   **State**: Needs `isExpanded`, `isMinimized` states.
*   **Context Injection**: The chat component must subscribe to `useActiveNote()` (Notes Workspace) or `useActiveFile()` (IDE) to inject context silently into the system prompt.

## 4. Cross-Workspace State Architecture

### 4.1 State Sync
*   **Current**: `useConversationStore` handles chat state.
*   **Gap**: Chat state is often bound to a specific "Project".
*   **Solution**: `CrossWorkspaceEventBus` should emit `CONTEXT_SWITCH` events. When moving from IDE -> Notes, the chat should optionally *persist* or *reset* based on user preference ("Continue conversation" vs "New Note Context").

## 5. Recommendations

### 5.1 Critical
1.  **Implement `GeminiProviderAdapter`**: Missing link for multimodal capabilities.
2.  **Create `FloatingChatWidget`**: Dedicated component for Notes workspace.
3.  **Update `AgentConfig`**: Add "YOLO Mode" toggle (bypass tool permissions).

### 5.2 High Priority
1.  **HTML/PDF Export**: Add `html2pdf.js` integration for "Artifacts".
2.  **Context-Aware Prompts**: Dynamic system prompt injection based on active workspace.

### 5.3 Low Priority
1.  **Audio Generation**: Text-to-Speech integration (can be deferred to Phase 2).

## 6. Action Items
1.  Scaffold `gemini-multimodal` module.
2.  Create Sprint Plan for integration.
3.  Implement Adapter.
