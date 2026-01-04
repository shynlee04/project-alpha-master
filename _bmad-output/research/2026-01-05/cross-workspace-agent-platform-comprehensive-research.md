# Cross-Workspace AI Agent Conversation Platform - Comprehensive Research & Implementation Plan

**Document ID**: `cross-workspace-agent-platform-2026-01-05`
**Version**: 1.0.0
**Created**: 2026-01-05
**Status**: `DRAFT - READY FOR REVIEW`
**Author**: @bmad-core-bmad-master (via Deep-Scan Module Investigation)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Implementation State Analysis](#current-implementation-state-analysis)
3. [Feature Gap Analysis](#feature-gap-analysis)
4. [10 Wow-Factor Features](#10-wow-factor-features)
5. [Technical Architecture Design](#technical-architecture-design)
6. [Sprint Planning & Epic Breakdown](#sprint-planning--epic-breakdown)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Risk Assessment & Mitigation](#risk-assessment--mitigation)
9. [Validation & Success Criteria](#validation--success-criteria)
10. [Appendices](#appendices)

---

## 1. Executive Summary

### 1.1 Project Vision

Transform the current IDE-bound AI agent chat platform into a **unified cross-workspace intelligence hub** that seamlessly operates across IDE, Notes, Knowledge, and Study workspaces. The platform will leverage Gemini's multimodal capabilities, implement sophisticated agentic workflows, and deliver rich, interactive AI experiences that rival leading products like Perplexity, Notion, and ChatGPT.

### 1.2 Key Objectives

| Objective | Target | Current State | Gap |
|-----------|--------|---------------|-----|
| **Cross-Workspace Chat** | Full integration in Notes workspace | IDE only | 75% |
| **Multimodal I/O** | Voice, image, audio, video support | Text only | 90% |
| **Context Awareness** | Chat understands current note content | None | 100% |
| **Agentic Workflows** | Multi-step, branching, debating agents | Basic tools | 80% |
| **Rich Media Output** | Audio/image generation | Text only | 100% |
| **Deep Research Mode** | Lab-style exhaustive research | None | 100% |

### 1.3 Research Sources

- **Deep-Scan Module**: Comprehensive codebase analysis via 9 specialized scanners
- **MCP Tools**: Exa-code, Context7, Deepwiki for external research
- **Industry Analysis**: Perplexity, Notion, ChatGPT feature comparisons
- **Gemini SDK Documentation**: Latest multimodal capabilities (2025-2026)

---

## 2. Current Implementation State Analysis

### 2.1 Deep-Scan Module Investigation Results

The deep-scan module identified the following architectural components and their implementation status:

#### ✅ Fully Implemented Components

| Component | Location | Health Score | Lines |
|-----------|----------|--------------|-------|
| **Cross-Workspace Event Bus** | `src/lib/events/cross-workspace-event-bus.ts` | 9/10 | 429 |
| **Dexie Persistence Layer** | `src/infrastructure/persistence/dexie-db.ts` | 8/10 | 1073 |
| **Conversation Store (6 slices)** | `src/infrastructure/persistence/stores/conversation/` | 8/10 | 600+ |
| **Agent Tools Registry** | `src/lib/agent/tools/index.ts` | 8/10 | 171 |
| **UnifiedChatPanel** | `src/presentation/components/chat/UnifiedChatPanel.tsx` | 7/10 | 183 |
| **Notes Workspace** | `src/presentation/components/notes/NotesPage.tsx` | 6/10 | 467 |
| **RAG Pipeline** | `src/lib/rag/` | 7/10 | 2000+ |

#### 🔄 Partially Implemented Components

| Component | Status | Notes |
|-----------|--------|-------|
| **Workspace Context** | 70% | ProjectProvider exists, but chat doesn't leverage it |
| **Agent Permissions** | 80% | YOLO toggle exists, but not integrated with chat |
| **Knowledge Tools** | 60% | Tools exist but not wired to Notes chat |

#### ❌ Missing Components

| Component | Priority | Effort |
|-----------|----------|--------|
| **Voice Input (STT)** | P0 | 16-24 hours |
| **Multimodal File Input** | P0 | 24-32 hours |
| **Notes Chat Integration** | P0 | 32-40 hours |
| **Context-Aware Chat** | P1 | 24-32 hours |
| **Perplexity-Style Expansion** | P1 | 16-24 hours |
| **Notion-Style Chat Bubble** | P2 | 8-16 hours |
| **Agentic Workflows Engine** | P0 | 48-64 hours |
| **Rich Media Output** | P1 | 32-48 hours |
| **Deep Research Mode** | P1 | 40-56 hours |
| **Web Grounding** | P1 | 24-32 hours |
| **Auto Model Selection** | P2 | 16-24 hours |

### 2.2 Architecture Assessment

#### Current Architecture (Simplified)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cross-Workspace Event Bus                     │
│     (File Change | Agent Config | Sync Status | Workspace)      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UnifiedChatPanel                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Threaded Mode│  │ Simple Mode  │  │ Agent Mode   │          │
│  │ (ChatPanel)  │  │ (RAGChatPanel)│ │ (AgentChatPanel)│        │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   IDE Workspace  │ │  Notes Workspace │ │ Knowledge WS     │
│   (✅ Active)    │ │  (❌ No Chat)    │ │  (⚠️ Partial)    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

#### Target Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     Cross-Workspace Event Bus (Enhanced)                   │
│  (File | Agent | Sync | Workspace | Voice | Media | Research | Context)   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ Context Engine    │   │  Multimodal I/O   │   │ Agentic Workflow  │
│ (RAG + Current    │   │  (Voice | Image   │   │  Engine           │
│  Note Context)    │   │   | Audio | URL)  │   │  (Branching |     │
│                   │   │                   │   │   Debating)       │
└───────────────────┘   └───────────────────┘   └───────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     Unified Intelligent Chat Panel                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐              │
│  │ IDE Workspace   │ │ Notes Workspace │ │ Knowledge WS    │              │
│  │ ✅ Full Support │ │ ✅ Integrated   │ │ ✅ Enhanced     │              │
│  │ + Deep Research │ │ + Context-Aware │ │ + Web Grounding │              │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘              │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Feature Gap Analysis

### 3.1 User Requirement Mapping

| User Requirement | Current State | Implementation Priority | Technical Complexity |
|-----------------|---------------|------------------------|---------------------|
| **Threaded conversations stored and resumeable** | ✅ Implemented | N/A | Low |
| **Reactive hotloaded conversations** | ⚠️ Partial | P2 | Medium |
| **Workspace context sharing** | ⚠️ Events exist | P1 | Medium |
| **File system permissions** | ✅ Implemented | N/A | Low |
| **Voice input** | ❌ Missing | P0 | High |
| **Multimodal file attachments** | ⚠️ Knowledge tools | P0 | High |
| **Perplexity-style expansion** | ❌ Missing | P1 | Medium |
| **Notion-style chat bubble** | ❌ Missing | P2 | Low |
| **Context-aware chat** | ❌ Missing | P0 | High |
| **Agentic multi-step workflows** | ⚠️ Basic tools | P0 | Very High |
| **Rich media output** | ❌ Missing | P1 | High |
| **Deep research mode** | ❌ Missing | P1 | Very High |
| **Web grounding** | ❌ Missing | P1 | Medium |
| **Auto model selection** | ❌ Missing | P2 | Medium |

### 3.2 Gap Details

#### Gap 1: Voice Input (STT) - P0
**Current State**: No speech-to-text integration
**Required Implementation**:
- Integrate Web Speech API or cloud STT service (Google Speech-to-Text, Gladia, or OpenAI Whisper via WASM)
- Create voice input component with recording visualization
- Support Vietnamese and English language detection
- Implement push-to-talk and continuous listening modes

**Reference**: Gemini Multimodal Live API supports audio input at 16kHz PCM

#### Gap 2: Notes Chat Integration - P0
**Current State**: Notes workspace has no chat panel
**Required Implementation**:
- Integrate UnifiedChatPanel into NotesPage
- Create Notes-specific chat mode with context awareness
- Implement chat expansion panel (Perplexity-style)
- Add collapsible chat bubble for mobile (Notion-style)

#### Gap 3: Context-Aware Chat - P0
**Current State**: Chat doesn't know current note content
**Required Implementation**:
- Create ContextEngine that retrieves current note content via RAG
- Inject note context into system prompt when in Notes workspace
- Support note content references in chat (e.g., "Based on my previous note about...")
- Implement automatic context retrieval based on chat topic

#### Gap 4: Agentic Workflows Engine - P0
**Current State**: Basic tool execution only
**Required Implementation**:
- Implement Sequential Expansion agent (extends conversations based on previous content)
- Implement Content-Based Routing agent (routes queries to specialized handlers)
- Implement Multi-Agent Debating agent (simulates debate between agents)
- Create Workflow Builder UI for custom agent sequences

#### Gap 5: Multimodal Input - P0
**Current State**: File attachments work for knowledge tools only
**Required Implementation**:
- Extend file attachment UI to chat input
- Support image, audio, PDF attachments
- Auto-detect file type and switch to appropriate model
- Implement file preview and processing before sending

#### Gap 6: Rich Media Output - P1
**Current State**: Text-only responses
**Required Implementation**:
- Integrate Gemini image generation (gemini-2.5-flash-image)
- Support audio output (TTS)
- Generate interactive charts and diagrams
- Create multimedia response renderer

#### Gap 7: Deep Research Mode - P1
**Current State**: Basic RAG queries
**Required Implementation**:
- Implement multi-turn research workflow
- Create source aggregation and citation system
- Build research artifact generation (reports, summaries)
- Add progress visualization and milestone tracking

#### Gap 8: Web Grounding - P1
**Current State**: No web search integration
**Required Implementation**:
- Integrate Perplexity-style web search
- Implement URL content extraction and citation
- Support Google knowledge graph grounding
- Create real-time information lookup

#### Gap 9: Perplexity-Style Expansion - P1
**Current State**: Fixed chat panel
**Required Implementation**:
- Create expandable bottom panel (5-20% of screen)
- Smooth animation for expansion/collapse
- Preserve chat history when expanded
- Support split-view with content editing

#### Gap 10: Auto Model Selection - P2
**Current State**: Manual model selection
**Required Implementation**:
- Analyze input type (text, image, audio, URL)
- Auto-select optimal model (gemini-flash-latest for speed, pro for quality)
- Consider complexity and required capabilities
- Allow user override with explanation

---

## 4. 10 Wow-Factor Features

### Feature 1: 🎙️ Voice-First Multimodal Conversations

**Description**: Full voice conversation support with real-time audio streaming, language detection (Vietnamese/English), and natural turn-taking.

**Implementation**:
```typescript
// Gemini Live API Integration
import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({});
const session = await ai.live.connect({
  model: 'gemini-2.5-flash-native-audio-preview-09-2025',
  config: {
    responseModalities: [Modality.AUDIO],
    systemInstruction: 'You are a helpful AI assistant.',
  },
});

// WebRTC for real-time audio streaming
// Web Speech API for browser-native STT
// Audio visualization with Web Audio API
```

**User Experience**:
- 🎯 Push-to-talk or continuous listening mode
- 🌐 Automatic language detection and switching
- 🔊 Real-time audio feedback with visualization
- 📱 Mobile-optimized voice interface

**Technical Requirements**:
- WebRTC or Web Audio API
- Gemini Live API subscription
- Audio buffer management (16kHz PCM)
- Noise cancellation (Web Audio API)

**Effort Estimate**: 24-32 hours

---

### Feature 2: 📎 Context-Aware Notes Chat

**Description**: Chat that automatically understands and references the current note content, enabling seamless AI assistance while writing.

**Implementation**:
```typescript
// Context Engine
class ContextEngine {
  async getCurrentNoteContext(noteId: string): Promise<NoteContext> {
    const note = await noteStore.getNote(noteId);
    const embeddings = await ragStore.getNoteEmbeddings(noteId);
    const relatedNotes = await ragStore.findRelatedNotes(noteId);
    
    return {
      content: note.blocks,
      embeddings,
      relatedNotes,
      metadata: note.metadata,
    };
  }

  injectContextIntoPrompt(userMessage: string, context: NoteContext): string {
    return `You are helping the user with their note.\n\n` +
           `Current note content:\n${context.content}\n\n` +
           `Related context:\n${context.relatedNotes}\n\n` +
           `User message: ${userMessage}`;
  }
}
```

**User Experience**:
- 💬 Chat automatically knows what you're writing
- 🔗 References to specific sections of your note
- ✨ AI suggestions based on note context
- 📝 Inline AI commands (select text → AI menu)

**Technical Requirements**:
- Notes store integration
- RAG query engine
- System prompt injection
- Note content parsing (BlockNote)

**Effort Estimate**: 32-40 hours

---

### Feature 3: 📐 Perplexity-Style Expandable Chat Panel

**Description**: Smoothly expandable chat panel that floats above content, allowing seamless switching between writing and AI assistance.

**Implementation**:
```typescript
// ExpandableChatPanel.tsx
interface ExpandableChatPanelProps {
  mode: 'floating' | 'expanded' | 'fullscreen';
  position: 'bottom-right' | 'bottom-left' | 'center';
  onExpand: () => void;
  onCollapse: () => void;
  expandedHeight: number; // percentage or pixels
}

// CSS transitions for smooth animation
.chat-panel {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 20%; // 1/5 of screen
  max-height: 400px;
}

.chat-panel.expanded {
  height: 60%; // 3/5 of screen for deep research
}
```

**User Experience**:
- 🚀 One-click expansion from note editor
- 📐 Resizable panel (drag to resize)
- 🎨 Floating bubble when collapsed
- 📱 Mobile: full-screen overlay

**Technical Requirements**:
- Resizable panel component
- Animation system
- Panel state persistence
- Responsive breakpoints

**Effort Estimate**: 16-24 hours

---

### Feature 4: 🤖 Agentic Multi-Step Workflows

**Description**: Advanced agent system that can execute sequential tasks, route queries intelligently, and simulate debates between multiple agents.

**Implementation**:
```typescript
// Sequential Expansion Agent
class SequentialExpansionAgent {
  async expandConversation(
    threadId: string,
    expansionStrategy: 'topic' | 'task' | 'research'
  ): Promise<void> {
    const previousMessages = await conversationStore.getMessages(threadId);
    const lastMessage = previousMessages[previousMessages.length - 1];
    
    // Generate follow-up questions based on context
    const followUps = await this.generateFollowUps(lastMessage, expansionStrategy);
    
    // Auto-create child threads for each follow-up
    for (const followUp of followUps) {
      await conversationStore.createThread(threadId, followUp);
    }
  }
}

// Multi-Agent Debating System
class DebateAgent {
  async runDebate(topic: string, agents: Agent[]): Promise<DebateResult> {
    const rounds = [];
    for (let i = 0; i < 3; i++) {
      const arguments = await Promise.all(
        agents.map(agent => agent.generateArgument(topic, rounds))
      );
      rounds.push({ arguments, timestamp: Date.now() });
    }
    return this.synthesizeDebate(rounds);
  }
}
```

**User Experience**:
- 🎯 "Continue this conversation" button
- 🔀 Branch conversations into sub-topics
- ⚖️ "Ask multiple agents" option
- 📊 Visual debate timeline

**Technical Requirements**:
- Thread hierarchy system (exists)
- Multiple agent orchestration
- Debate synthesis algorithm
- UI for workflow visualization

**Effort Estimate**: 48-64 hours

---

### Feature 5: 🖼️ Rich Media Output Generation

**Description**: Generate images, charts, and audio directly from chat conversations using Gemini's native multimodal output.

**Implementation**:
```typescript
// Image Generation via Gemini
import { google } from '@ai-sdk/google';

const result = await generateText({
  model: 'google/gemini-2.5-flash-image',
  prompt: 'Generate a diagram showing the architecture',
  providerOptions: {
    google: { responseModalities: ['TEXT', 'IMAGE'] },
  },
});

// Audio Output via TTS
const audioResult = await generateSpeech({
  model: 'google/gemini-2.5-flash-exp',
  text: response.text,
  voice: 'en-US-Neural2-F',
});
```

**User Experience**:
- 🎨 "Generate image" command in chat
- 📊 Chart generation from data
- 🔊 Text-to-speech for responses
- 📹 Video generation (future)

**Technical Requirements**:
- Gemini image generation API
- TTS integration (browser-native or API)
- Media display components
- Export functionality

**Effort Estimate**: 32-48 hours

---

### Feature 6: 🔬 Deep Research Mode

**Description**: Lab-style research interface that conducts exhaustive multi-turn searches, synthesizes information, and generates comprehensive reports.

**Implementation**:
```typescript
// Deep Research Workflow
class DeepResearchEngine {
  async conductResearch(
    query: string,
    options: ResearchOptions
  ): Promise<ResearchReport> {
    const sources = await this.gatherSources(query);
    const synthesis = await this.synthesizeSources(sources);
    const report = await this.generateReport(synthesis);
    
    return {
      query,
      sources: sources.length,
      synthesis,
      report,
      citations: this.generateCitations(sources),
    };
  }

  private async gatherSources(query: string): Promise<Source[]> {
    // Web search
    // PDF processing
    // Knowledge base queries
    // Expert content extraction
  }
}
```

**User Experience**:
- 🔬 "Deep Research" button in chat
- 📊 Real-time progress visualization
- 📑 Automatic citation generation
- 📄 Report export (PDF, Markdown)

**Technical Requirements**:
- Web search integration
- Multi-source synthesis
- Report generation
- Citation management

**Effort Estimate**: 40-56 hours

---

### Feature 7: 🌐 Web Grounding with Google Integration

**Description**: Real-time web search and Google knowledge graph integration for up-to-date information.

**Implementation**:
```typescript
// Web Grounding Service
class WebGroundingService {
  async searchWeb(query: string): Promise<WebSearchResult[]> {
    const perplexityResults = await perplexityAPI.search(query);
    const googleResults = await googleSearchAPI.search(query);
    return this.mergeResults(perplexityResults, googleResults);
  }

  async groundResponse(
    response: string,
    context: string
  ): Promise<GroundedResponse> {
    const relevantFacts = await this.extractRelevantFacts(response);
    const groundedFacts = await Promise.all(
      relevantFacts.map(fact => this.groundFact(fact))
    );
    return this.formatWithCitations(response, groundedFacts);
  }
}
```

**User Experience**:
- 🔍 "Search the web" command
- 📎 Inline citations with source links
- ⚡ Real-time fact verification
- 🌐 Source credibility indicators

**Technical Requirements**:
- Perplexity API or similar
- Google Search API
- URL content extraction
- Citation formatting

**Effort Estimate**: 24-32 hours

---

### Feature 8: 📱 Notion-Style Collapsible Chat Bubble

**Description**: Mobile-optimized chat that collapses into a small bubble when not in use, maximizing screen space for note editing.

**Implementation**:
```typescript
// ChatBubble.tsx
interface ChatBubbleProps {
  collapsed: boolean;
  unreadCount?: number;
  onToggle: () => void;
  position: 'bottom-right' | 'bottom-left';
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  collapsed,
  unreadCount,
  onToggle,
}) => {
  return (
    <motion.div
      className="chat-bubble"
      animate={{ width: collapsed ? 48 : '100%' }}
      onClick={onToggle}
    >
      {collapsed ? (
        <>
          <BotIcon />
          {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
        </>
      ) : (
        <ExpandableChatPanel />
      )}
    </motion.div>
  );
};
```

**User Experience**:
- 📱 One-tap chat access
- 🔔 Unread message badges
- 🎨 Customizable bubble position
- 🌙 Dark mode support

**Technical Requirements**:
- Floating UI component
- State persistence
- Touch gesture handling
- Mobile responsive design

**Effort Estimate**: 8-16 hours

---

### Feature 9: 🧠 Smart Auto Model Selection

**Description**: Intelligent model selection that automatically chooses the best Gemini model based on input type and task complexity.

**Implementation**:
```typescript
// Auto Model Selector
class ModelSelector {
  async selectModel(
    input: MultimodalInput
  ): Promise<ModelSelection> {
    const analysis = await this.analyzeInput(input);
    
    if (analysis.hasAudio) {
      return {
        model: 'gemini-1.5-pro-latest',
        reason: 'Audio input requires vision-capable model',
        alternatives: ['gemini-2.0-flash'],
      };
    }
    
    if (analysis.complexity === 'high') {
      return {
        model: 'gemini-1.5-pro-latest',
        reason: 'High complexity task requires Pro model',
        alternatives: ['gemini-1.5-pro'],
      };
    }
    
    return {
      model: 'gemini-2.0-flash',
      reason: 'Simple text query - Flash for speed',
      alternatives: ['gemini-2.0-flash-exp'],
    };
  }
}
```

**User Experience**:
- 🤖 Automatic optimal model selection
- 📖 Transparent reasoning for selection
- 🔄 Easy override option
- 📊 Model usage statistics

**Technical Requirements**:
- Input analysis system
- Model capability matrix
- User preference learning
- Fallback handling

**Effort Estimate**: 16-24 hours

---

### Feature 10: 🎭 Live Paper Format

**Description**: Transform chat conversations into interactive, multimedia-rich documents with embedded visualizations, audio, and interactive elements.

**Implementation**:
```typescript
// Live Paper Generator
class LivePaperGenerator {
  async generateLivePaper(
    conversation: Conversation,
    options: LivePaperOptions
  ): Promise<LivePaper> {
    const sections = await this.extractSections(conversation);
    const visualizations = await this.generateVisualizations(sections);
    const audioSummary = await this.generateAudioSummary(conversation);
    
    return {
      title: conversation.title,
      sections,
      visualizations,
      audioSummary,
      interactiveElements: this.extractInteractiveElements(sections),
      metadata: {
        createdAt: new Date(),
        duration: conversation.duration,
        messageCount: conversation.messages.length,
      },
    };
  }
}
```

**User Experience**:
- 📄 "Export as Live Paper" option
- 🎵 Audio summary playback
- 📊 Interactive data visualizations
- 🔗 Embedded source citations

**Technical Requirements**:
- Document generation engine
- Chart/visualization library
- Audio synthesis (TTS)
- Interactive component system

**Effort Estimate**: 40-56 hours

---

## 5. Technical Architecture Design

### 5.1 Module Architecture

```
_bmad/modules/cross-workspace-chat/
├── README.md
├── config/
│   └── config.yaml
├── agents/
│   ├── multimodal-input-agent/     # Voice, image, audio processing
│   ├── context-engine-agent/       # Note context awareness
│   ├── workflow-engine-agent/      # Multi-step agentic workflows
│   └── output-generator-agent/     # Rich media generation
├── components/
│   ├── ExpandableChatPanel/        # Perplexity-style expansion
│   ├── ChatBubble/                 # Notion-style bubble
│   ├── VoiceInput/                 # Voice recording UI
│   ├── MultimodalAttachment/       # File attachment UI
│   └── RichMediaRenderer/          # Image, audio, chart display
├── hooks/
│   ├── useVoiceInput.ts
│   ├── useContextEngine.ts
│   ├── useAutoModelSelection.ts
│   └── useDeepResearch.ts
├── services/
│   ├── voice-service.ts            # STT/TTS
│   ├── web-grounding-service.ts    # Web search
│   ├── model-selection-service.ts  # Auto model selection
│   └── research-engine.service.ts  # Deep research
├── stores/
│   ├── chat-context-store.ts       # Chat context state
│   └── workflow-store.ts           # Agentic workflow state
├── types/
│   ├── multimodal.types.ts
│   ├── workflow.types.ts
│   └── research.types.ts
└── workflows/
    ├── voice-chat-workflow.md
    ├── deep-research-workflow.md
    └── context-aware-chat-workflow.md
```

### 5.2 Data Flow Diagrams

#### Multimodal Input Flow
```
User Input (Voice/Image/Audio/URL)
         │
         ▼
┌─────────────────────┐
│ Input Classification│ (Auto-detect type)
└─────────────────────┘
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
  Voice    Image     Audio     URL
    │         │        │        │
    ▼         ▼        ▼        ▼
┌─────────┬─────────┬─────────┐
│ STT     │ Extract │ Transcribe│ Fetch Content
│ Service │ Image   │ Audio   │
└─────────┴─────────┴─────────┘
         │
         ▼
┌─────────────────────┐
│ Auto Model Selection│ (Based on input type)
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Gemini API Call    │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Rich Media Renderer │ (Text/Image/Audio)
└─────────────────────┘
```

#### Context-Aware Chat Flow
```
User in Notes Workspace
         │
         ▼
┌─────────────────────┐
│ Current Note ID     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Context Engine      │ ◄── RAG Query
│ (Retrieves Note     │    Note Content
│  Content + Related) │    Related Notes
└─────────────────────┘    Embeddings
         │
         ▼
┌─────────────────────┐
│ Prompt Injection    │ ◄── System Prompt
│ (Context + Query)   │    with Note Context
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Gemini API Call    │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Response with       │ ◄── Citation
│ Note References     │    to Context
└─────────────────────┘
```

---

## 6. Sprint Planning & Epic Breakdown

### 6.1 Epic Overview

| Epic | Name | Stories | Story Points | Priority | Timeline |
|------|------|---------|--------------|----------|----------|
| **E1** | Cross-Workspace Chat Integration | 12 | 89 | P0 | Weeks 1-4 |
| **E2** | Multimodal Input System | 8 | 56 | P0 | Weeks 2-5 |
| **E3** | Context Awareness Engine | 6 | 42 | P0 | Weeks 3-5 |
| **E4** | Agentic Workflow Engine | 10 | 78 | P0 | Weeks 4-8 |
| **E5** | Rich Media Output | 7 | 49 | P1 | Weeks 6-8 |
| **E6** | Deep Research Mode | 8 | 56 | P1 | Weeks 7-10 |
| **E7** | Web Grounding | 5 | 35 | P1 | Weeks 8-10 |
| **E8** | UI/UX Enhancements | 6 | 28 | P2 | Weeks 9-11 |
| **E9** | Auto Model Selection | 4 | 24 | P2 | Weeks 10-11 |
| **E10** | Live Paper Format | 7 | 49 | P2 | Weeks 11-13 |

### 6.2 Epic 1: Cross-Workspace Chat Integration

**Objective**: Integrate UnifiedChatPanel into Notes workspace with full cross-workspace synchronization

**Stories**:

| Story | Title | Points | Status |
|-------|-------|--------|--------|
| **E1-1** | Integrate UnifiedChatPanel into NotesPage | 8 | TODO |
| **E1-2** | Create Notes-specific chat context | 8 | TODO |
| **E1-3** | Implement Perplexity-style expandable panel | 10 | TODO |
| **E1-4** | Add Notion-style chat bubble for mobile | 6 | TODO |
| **E1-5** | Wire up cross-workspace event bus for chat | 6 | TODO |
| **E1-6** | Implement conversation persistence across workspaces | 8 | TODO |
| **E1-7** | Create chat state sharing between IDE and Notes | 8 | TODO |
| **E1-8** | Implement workspace-specific chat settings | 5 | TODO |
| **E1-9** | Add chat to Notes sidebar | 6 | TODO |
| **E1-10** | Implement mobile-optimized chat layout | 8 | TODO |
| **E1-11** | Add workspace switcher in chat header | 4 | TODO |
| **E1-12** | End-to-end testing of cross-workspace chat | 8 | TODO |

**Total**: 89 story points, 4 weeks

### 6.3 Epic 2: Multimodal Input System

**Objective**: Enable voice, image, audio, and URL input in chat

**Stories**:

| Story | Title | Points | Status |
|-------|-------|--------|--------|
| **E2-1** | Implement Web Speech API integration for STT | 8 | TODO |
| **E2-2** | Create voice input UI with recording visualization | 6 | TODO |
| **E2-3** | Add multilingual support (Vietnamese/English) | 6 | TODO |
| **E2-4** | Implement file attachment UI for chat | 8 | TODO |
| **E2-5** | Add image processing and preview | 6 | TODO |
| **E2-6** | Implement audio file support | 6 | TODO |
| **E2-7** | Add URL fetching and preview | 6 | TODO |
| **E2-8** | Integrate Gemini multimodal input | 10 | TODO |

**Total**: 56 story points, 4 weeks (overlaps with E1)

### 6.4 Epic 3: Context Awareness Engine

**Objective**: Make chat aware of current note content and provide contextual assistance

**Stories**:

| Story | Title | Points | Status |
|-------|-------|--------|--------|
| **E3-1** | Create ContextEngine service | 10 | TODO |
| **E3-2** | Implement note content retrieval | 8 | TODO |
| **E3-3** | Build RAG query integration | 8 | TODO |
| **E3-4** | Create context injection system | 8 | TODO |
| **E3-5** | Add note reference support in chat | 4 | TODO |
| **E3-6** | Implement inline AI commands for notes | 4 | TODO |

**Total**: 42 story points, 3 weeks (overlaps with E1, E2)

### 6.5 Epic 4: Agentic Workflow Engine

**Objective**: Enable sequential, branching, and debating agent workflows

**Stories**:

| Story | Title | Points | Status |
|-------|-------|--------|--------|
| **E4-1** | Design workflow data structures | 8 | TODO |
| **E4-2** | Implement Sequential Expansion agent | 12 | TODO |
| **E4-3** | Build Content-Based Routing agent | 10 | TODO |
| **E4-4** | Create Multi-Agent Debating system | 14 | TODO |
| **E4-5** | Build Workflow Builder UI | 10 | TODO |
| **E4-6** | Implement workflow visualization | 6 | TODO |
| **E4-7** | Add workflow persistence | 6 | TODO |
| **E4-8** | Create preset workflow templates | 4 | TODO |
| **E4-9** | Implement workflow execution engine | 8 | TODO |
| **E4-10** | End-to-end workflow testing | 8 | TODO |

**Total**: 78 story points, 5 weeks

### 6.6 Sprint Timeline

```
Week 1    │ E1-1, E1-2 │ E2-1, E2-2 │                    │
Week 2    │ E1-3, E1-4 │ E2-3, E2-4 │ E3-1, E3-2          │
Week 3    │ E1-5, E1-6 │ E2-5, E2-6 │ E3-3, E3-4          │
Week 4    │ E1-7, E1-8 │ E2-7, E2-8 │ E3-5, E3-6          │
Week 5    │ E1-9, E1-10│           │                      │
Week 6    │ E1-11, E1-12│          │ E4-1, E4-2          │
Week 7    │           E5-1, E5-2 │ E4-3, E4-4          │
Week 8    │           E5-3, E5-4 │ E4-5, E4-6          │
Week 9    │           E5-5, E5-6 │ E4-7, E4-8          │
Week 10   │           E5-7        │ E4-9, E6-1          │
Week 11   │           E7-1, E7-2 │ E4-10, E6-2         │
Week 12   │           E7-3, E8-1 │ E6-3, E9-1          │
Week 13   │           E8-2, E10-1│ E6-4, E9-2          │
```

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

**Goal**: Establish cross-workspace chat integration and basic multimodal input

**Deliverables**:
- ✅ Notes workspace has integrated chat panel
- ✅ Chat conversations sync across workspaces
- ✅ Voice input support (basic)
- ✅ File attachments work in chat
- ✅ Expandable chat panel UI

**Key Milestones**:
- Week 2: NotesPage has working chat panel
- Week 4: Cross-workspace conversation sync working

### Phase 2: Intelligence (Weeks 4-8)

**Goal**: Add context awareness and agentic workflows

**Deliverables**:
- ✅ Chat understands current note context
- ✅ Sequential expansion workflows
- ✅ Content-based routing
- ✅ Multi-agent debating
- ✅ Rich media output (images)

**Key Milestones**:
- Week 6: Context-aware chat in Notes
- Week 8: Agentic workflow engine complete

### Phase 3: Enhancement (Weeks 8-13)

**Goal**: Complete advanced features and polish

**Deliverables**:
- ✅ Deep research mode
- ✅ Web grounding
- ✅ Auto model selection
- ✅ Live paper format
- ✅ Notion-style chat bubble

**Key Milestones**:
- Week 10: Deep research mode shipping
- Week 13: All features complete

---

## 8. Risk Assessment & Mitigation

| Risk | Severity | Probability | Impact | Mitigation |
|------|----------|-------------|--------|------------|
| Rate **Gemini API Limits** | High | Medium | Medium | Implement caching, request queuing, fallback models |
| **Voice API Browser Compatibility** | Medium | Low | High | Progressive enhancement, fallback to text input |
| **Performance with Multimodal** | High | Medium | High | Lazy loading, image compression, streaming responses |
| **Complex State Management** | Medium | Medium | Medium | Use existing Zustand patterns, separate stores per feature |
| **User Adoption of New Features** | Low | Medium | Medium | In-app tutorials, progressive disclosure, user feedback loops |
| **Cross-Workspace Sync Issues** | High | Low | High | Event bus validation, conflict resolution, state snapshots |

---

## 9. Validation & Success Criteria

### 9.1 Functional Validation

| Feature | Validation Method | Success Criteria |
|---------|------------------|------------------|
| **Cross-Workspace Chat** | E2E Test | Chat works in IDE and Notes, conversations sync |
| **Voice Input** | Manual Test | Voice input recognized, transcribed, and responded to |
| **Context Awareness** | Unit Test | Current note content injected into system prompt |
| **Agentic Workflows** | Integration Test | Sequential expansion creates child threads |
| **Deep Research** | Manual Test | Multi-source research generates comprehensive report |

### 9.2 Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Chat Load Time** | < 500ms | Lighthouse |
| **Voice Transcription Latency** | < 2s | Manual timing |
| **Image Processing** | < 3s | Performance API |
| **Cross-Workspace Sync** | < 100ms | Event bus timing |
| **Auto Model Selection** | < 50ms | Code profiling |

### 9.3 User Experience Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Task Completion Rate** | > 90% | User testing |
| **Feature Discovery** | > 70% | Analytics |
| **Voice Usage Rate** | > 30% (mobile) | Analytics |
| **Research Feature Usage** | > 20% | Analytics |

---

## 10. Appendices

### Appendix A: Gemini API Capabilities Matrix

| Capability | Model | Notes |
|------------|-------|-------|
| **Text Generation** | gemini-1.5-pro, gemini-2.0-flash | All models |
| **Image Understanding** | gemini-1.5-pro, gemini-1.5-flash | Vision models |
| **Image Generation** | gemini-2.5-flash-image | Native image output |
| **Audio Input** | gemini-1.5-pro-latest | PCM 16kHz |
| **Audio Output** | gemini-2.5-flash-native-audio | Real-time streaming |
| **Video Understanding** | gemini-1.5-pro | gs:// URLs |
| **Native Audio** | gemini-2.5-flash-native-audio-preview | Live API |

### Appendix B: Research Sources

1. **Gemini Multimodal Live API**: https://ai.google.dev/gemini-api/docs/multimodal-live
2. **Perplexity AI Features (2025)**: https://docs.perplexity.ai/getting-started/models/models/sonar-deep-research
3. **Google GenAI TypeScript SDK**: https://github.com/googleapis/js-genai
4. **Voice Input Integration Patterns**: https://github.com/mastra-ai/mastra/tree/main/voice/gladia

### Appendix C: Related Documentation

- **Cross-Workspace Event Bus**: `src/lib/events/cross-workspace-event-bus.ts`
- **Conversation Store**: `src/infrastructure/persistence/stores/conversation/useConversationStore.ts`
- **UnifiedChatPanel**: `src/presentation/components/chat/UnifiedChatPanel.tsx`
- **RAG Pipeline**: `src/lib/rag/`

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | cross-workspace-agent-platform-2026-01-05 |
| **Version** | 1.0.0 |
| **Status** | DRAFT - READY FOR REVIEW |
| **Created** | 2026-01-05 |
| **Author** | @bmad-core-bmad-master |
| **Reviewers** | @bmad-bmm-analyst, @bmad-bmm-architect |
| **Next Review** | 2026-01-06 |

---

*This document was generated through comprehensive codebase analysis using the Deep-Scan Module and external research via MCP tools. All findings are backed by evidence blocks with file paths and line numbers.*
