# Agent Infrastructure Gap Analysis

**Cycle**: 1.2
**Agent**: deep-scan
**Date**: 2026-01-10

---

## Permission System

### Current State
- Tool Trust Levels: 'auto', 'prompt', 'block' options
- Tool Categories: files, terminal, knowledge, vision, search, web
- Permission Constants: 25 tools configured
- Permission Checks: Workspace-level validation integrated

### Coverage Analysis
✅ **Covered Tools**: File ops, terminal, knowledge synthesis, notes ops, media processing, web operations

❌ **Missing Tools**:
- No dedicated search tool beyond `search_notes`
- No research/knowledge retrieval tool
- No conversation memory search tool

📋 **Issues**:
- `search_notes` categorized as 'files' instead of 'knowledge' or 'search'
- `process_url` categorized as 'web' instead of 'knowledge'

---

## System Instructions

### Current State
The prompt composer implements:
- **Layer 1**: Tool Constitution (hidden system role)
- **Layer 2**: Agent Mode (solo-dev persona)
- **Layer 3**: Context Injection (open files + project summary)
- **Missing**: Layers 4-5 (User Preferences, Session Context)

### What's Missing for EPIC-40

❌ **No Notes/Research Context in Layer 3**:
- Current Layer 3 only shows open files and project summary
- No mention of available notes, research materials, or conversation memory
- Agent unaware of RAG capabilities

❌ **No Tool Guidance**:
- No mention of `search_notes` tool availability
- No guidance on when to use research/knowledge tools

### Needed State
```typescript
interface EnhancedLayerContext {
  availableNotes: number;
  recentNotes: Array<{title: string; id: string}>;
  conversationMemory: {
    totalConversations: number;
    recentInsights: string[];
    canSearchMemory: boolean;
  };
  researchCapabilities: {
    canSearchNotes: boolean;
    canSearchConversations: boolean;
    canSynthesizeKnowledge: boolean;
  };
}
```

---

## Event System

### What Exists
Comprehensive event system with:
- File System Events: create, modify, delete, read with lock tracking
- Sync Events: Complete lifecycle with rollback support
- Terminal Events: Process lifecycle, I/O, security
- Permission Events: Request/grant/deny/expire
- Project Events: Open/close/switch
- Agent Activity Events: Tool execution lifecycle
- Retry Queue Events: Retry attempt tracking
- Import Events: PDF/URL/text import progress

### Missing Events for EPIC-40

❌ **Note/RAG Events**:
- `notes:searched` - When note search is performed
- `memory:indexed` - When conversation is added to memory index
- `memory:searched` - When conversation memory is searched
- `rag:result` - When RAG operation completes
- `research:started` - When research/knowledge tool is invoked

---

## Tool Factory

### Current Implementation
- Separate creators: `createClientFileTools`, `createClientTerminalTools`, `createClientKnowledgeTools`
- Type safety: Uses TanStack AI toolDefinition pattern
- Permission integration: Workspace permission checks
- Event emission: Proper event bus integration

❌ **Missing Tool Categories**:
- Search Tools: No dedicated search tool creation
- Memory Tools: No conversation memory search
- Research Tools: No unified RAG tool

---

## Critical Gaps (Block EPIC-40)

### High Priority

1. **Missing search_notes Integration in Factory**
   - Tool exists but not connected to the agent
   - Agent cannot perform note-based RAG without this

2. **No Notes Context in System Prompt**
   - Agent unaware of available notes and research capabilities

3. **Missing Memory Search Events**
   - No way to track conversation memory searches

4. **Tool Category Misalignment**
   - `search_notes` should be 'knowledge' not 'files'
   - `process_url` should be 'knowledge' not 'web'

---

## Recommendations

### Immediate Actions (Before EPIC-40)
1. Integrate search_notes tool in factory
2. Add notes context to Layer 3 of system prompt
3. Create missing search tool
4. Fix tool categories
