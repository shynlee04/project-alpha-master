# Research Synthesis: AI Agent Patterns for Via-gent IDE
**Date**: 2025-12-24
**Purpose**: Comprehensive synthesis of research findings from Context7, Tavily, Roo Code examples, and codebase analysis to guide systematic course correction

---

## Executive Summary

This document synthesizes research from multiple sources to establish a comprehensive understanding of AI coding agent patterns, TanStack AI SDK best practices, and implementation requirements for the Via-gent browser-based IDE. The findings reveal critical gaps in current implementation and provide a roadmap for systematic remediation.

---

## 1. TanStack AI SDK Implementation Patterns

### 1.1 Core Architecture

**Provider-Agnostic Design**:
- TanStack AI SDK is designed to be provider-agnostic with tree-shakeable adapters
- Supports multiple providers: OpenAI, Anthropic, Gemini, Ollama, custom providers
- Adapters are separate packages: `@tanstack/ai-openai`, `@tanstack/ai-anthropic`, etc.

**Streaming Agentic Text Generation**:
```typescript
import { chat } from '@tanstack/ai-react'
import { openai } from '@tanstack/ai-openai'

const result = chat({
  adapter: openai(),
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
  // Tools are automatically executed by the SDK
  tools: {
    readFile: {
      description: 'Read a file',
      parameters: z.object({
        path: z.string()
      }),
      execute: async ({ path }) => {
        // Tool implementation
      }
    }
  }
})

// Consume stream
for await (const chunk of result.stream) {
  if (chunk.type === 'content') {
    console.log(chunk.content)
  }
}
```

### 1.2 SSE Stream Protocol

**Event Types**:
- `content`: Text content from the AI
- `tool_call`: AI wants to call a tool
- `tool_result`: Result from tool execution
- `done`: Stream complete
- `error`: Error occurred

**Stream Format**:
```typescript
// Backend SSE response
for await (const chunk of result.stream) {
  const data = JSON.stringify({
    type: chunk.type,
    ...chunk
  })
  res.write(`data: ${data}\n\n`)
}
```

### 1.3 Connection Adapters

**SSE Adapter (Preferred for React)**:
```typescript
import { fetchServerSentEvents } from '@tanstack/ai-react'

const result = chat({
  adapter: openai(),
  messages: [...],
  connection: fetchServerSentEvents('/api/chat', {
    fetchOptions: {
      method: 'POST',
      body: JSON.stringify({ messages: [...] })
    }
  })
})
```

**HTTP Stream Adapter (Fallback)**:
```typescript
import { fetchHttpStream } from '@tanstack/ai-react'

const result = chat({
  adapter: openai(),
  messages: [...],
  connection: fetchHttpStream('/api/chat', {
    fetchOptions: {
      method: 'POST',
      body: JSON.stringify({ messages: [...] })
    }
  })
})
```

### 1.4 Backend Implementation

**Complete SSE Endpoint**:
```typescript
import { chat } from '@tanstack/ai-openai'
import { toStreamResponse } from '@tanstack/ai'

export async function POST(req: Request) {
  const { messages } = await req.json()
  
  const result = chat({
    adapter: openai({ apiKey: process.env.OPENAI_API_KEY }),
    messages,
    tools: {
      readFile: { /* ... */ },
      writeFile: { /* ... */ }
    }
  })
  
  return toStreamResponse(result.stream)
}
```

### 1.5 Key Implementation Requirements

1. **Automatic Tool Execution**: SDK automatically executes tools when AI requests them
2. **Streaming Support**: Must use SSE for real-time responses
3. **Error Handling**: Must handle `done`, `error`, and tool execution errors
4. **Provider Abstraction**: Use adapter pattern for multi-provider support
5. **Type Safety**: Use Zod schemas for tool parameters

---

## 2. 2025 Best Practices for AI Coding Agents

### 2.1 Top AI Coding Tools Analysis

**Cursor IDE**:
- AI-native code editor with integrated Claude
- Real-time code generation and refactoring
- Context-aware suggestions based on entire codebase
- Multi-file editing capabilities

**Claude Code**:
- Command-line AI coding assistant
- File system operations with approval workflow
- Terminal command execution
- Project-wide understanding

**Windsurf**:
- AI-powered IDE with collaborative features
- Real-time code completion
- Context-aware refactoring
- Multi-language support

**Replit AI**:
- Browser-based IDE with AI integration
- Real-time collaboration
- Code generation and debugging
- Project templates

**Bolt.new**:
- AI-powered web development platform
- Full-stack application generation
- Real-time preview
- Deployment integration

### 2.2 Enterprise AI Coding Tools

**Augment Code**:
- Multi-repository intelligence
- SOC 2 compliance
- Workflow automation beyond autocomplete
- Enterprise-grade security

**Tabnine**:
- AI code completion
- Team collaboration
- Custom models
- Enterprise features

**Sourcegraph Cody**:
- Code intelligence
- Multi-repository understanding
- Custom integrations
- Enterprise features

**GitHub Copilot**:
- AI pair programmer
- Context-aware suggestions
- Multi-language support
- Enterprise features

### 2.3 AI Agent Development Frameworks

**LangChain**:
- Comprehensive framework for building AI applications
- Tool integration
- Memory management
- Multi-agent systems

**LangGraph**:
- Stateful multi-agent workflows
- Graph-based agent orchestration
- Persistent memory
- Complex decision trees

**AutoGen**:
- Multi-agent conversation framework
- Human-in-the-loop
- Code execution
- Complex task decomposition

**CrewAI**:
- Role-based agent systems
- Collaborative workflows
- Task delegation
- Hierarchical organization

### 2.4 System Prompt Crafting Patterns

**Effective System Prompts Include**:
1. **Clear Role Definition**: Explicitly state the agent's purpose and expertise
2. **Structured Instructions**: Use numbered lists and clear formatting
3. **Explicit Tool Integration**: Describe available tools and when to use them
4. **Step-by-Step Reasoning**: Encourage the agent to think through problems
5. **Environment Awareness**: Describe the context and constraints
6. **Domain-Specific Expertise**: Include relevant technical knowledge
7. **Safety Protocols**: Define boundaries and error handling
8. **Consistent Tone**: Establish communication style

**Example System Prompt**:
```
You are an expert full-stack developer specializing in React and TypeScript.

Your role is to help users build, debug, and optimize web applications.

Available tools:
- readFile: Read file contents from the project
- writeFile: Write or modify files
- executeCommand: Run terminal commands
- listFiles: Browse project structure

When helping users:
1. First understand their goal by asking clarifying questions
2. Analyze the current codebase structure
3. Propose solutions with clear explanations
4. Implement changes incrementally
5. Test and verify each change
6. Provide summary of what was done

Always explain your reasoning before making changes.
```

### 2.5 Complete AI Agent Development Guide

**Phase 1: Conceptualization**
- Define agent purpose and scope
- Identify target users and use cases
- Determine technical requirements
- Plan integration points

**Phase 2: Design**
- Design agent architecture
- Define tool interfaces
- Plan state management
- Design UI/UX

**Phase 3: Implementation**
- Implement core agent logic
- Integrate with AI SDK
- Build tool facades
- Create UI components

**Phase 4: Testing**
- Unit tests for tools
- Integration tests for workflows
- E2E tests for user journeys
- Performance testing

**Phase 5: Deployment**
- Configure production environment
- Set up monitoring
- Implement error handling
- Create documentation

**Phase 6: Iteration**
- Gather user feedback
- Analyze usage patterns
- Improve prompts
- Add new features

### 2.6 Best Practices for Complex Enterprise Codebases

**Context Management**:
- Implement intelligent context window management
- Use RAG (Retrieval-Augmented Generation) for large codebases
- Cache frequently accessed code
- Prioritize relevant files

**Multi-Repository Support**:
- Support multiple project repositories
- Handle cross-repository dependencies
- Maintain consistent context across repos
- Enable repository switching

**Security & Compliance**:
- Implement access controls
- Audit tool usage
- Secure credential storage
- Compliance with enterprise standards

**Workflow Automation**:
- Automate repetitive tasks
- Create custom workflows
- Integrate with CI/CD
- Support team collaboration

---

## 3. Roo Code Patterns Analysis

### 3.1 Custom Instructions System

**Global Rules Directory**:
- Location: `~/.roo/rules/` (Linux/macOS) or `%USERPROFILE%\.roo\rules\` (Windows)
- Applies to all projects automatically
- Mode-specific: `~/.roo/rules-{modeSlug}/`
- Recursive loading of all files

**Workspace Rules**:
- Location: `.roo/rules/` in project root
- Project-specific rules
- Takes precedence over global rules
- Mode-specific: `.roo/rules-{modeSlug}/`

**Rule Loading Order**:
1. Global rules (from `~/.roo/`)
2. Project rules (from `.roo/`) - takes precedence when conflicting
3. Mode-specific rules (loaded before general rules)
4. Legacy files (`.roorules`, `.clinerules`) - fallback only

**AGENTS.md Support**:
- Automatically loaded from workspace root
- Provides agent-specific rules and guidelines
- Can be disabled via VSCode settings
- Loaded after mode-specific rules, before generic rules

### 3.2 Custom Modes System

**Mode Properties**:
- `slug`: Unique internal identifier (alphanumeric + hyphens)
- `name`: Display name in UI
- `description`: Short summary for mode selector
- `roleDefinition`: Detailed description placed at start of system prompt
- `groups`: Array of tool groups with optional file restrictions
- `whenToUse`: Guidance for automated decision-making
- `customInstructions`: Additional behavioral guidelines

**Tool Groups**:
- `"read"`: Read files
- `"edit"`: Edit files (can be restricted with `fileRegex`)
- `"browser"`: Web browsing
- `"command"`: Execute terminal commands
- `"mcp"`: MCP server tools

**File Restrictions**:
```yaml
groups:
  - read
  - - edit
    - fileRegex: \.(js|ts)$
      description: JS/TS files only
  - command
```

**Mode Configuration Precedence**:
1. Project-level modes (`.roomodes`)
2. Global modes (`custom_modes.yaml`)
3. Default modes

**Import/Export**:
- Export mode + rules to single YAML file
- Import to project or global scope
- Automatic slug change handling
- Cross-platform compatibility

### 3.3 Key Patterns Identified

**1. Hierarchical Rule System**:
- Global → Project → Mode-specific
- Clear precedence rules
- Recursive loading
- Symbolic link support

**2. Mode Specialization**:
- Different modes for different tasks
- Tool access control
- File type restrictions
- Custom instructions per mode

**3. Flexible Configuration**:
- YAML and JSON support
- File and directory-based rules
- Import/export for sharing
- Override default modes

**4. AGENTS.md Integration**:
- Version-controlled agent rules
- Team standardization
- Automatic loading
- Optional disable

---

## 4. Codebase Analysis Findings

### 4.1 Current Architecture

**AI Agent Infrastructure**:
```
UI Components (AgentChatPanel, AgentConfigDialog)
         ↓
useAgentChat Hook (with tools)
         ↓
AgentFactory (creates adapters)
         ↓
ProviderAdapter (OpenRouter, Anthropic, etc.)
         ↓
TanStack AI (chat streaming)
         ↓
Agent Tools (FileTools, TerminalTools)
         ↓
Facades (abstract over WebContainer/LocalFS)
```

**Key Components**:
- `src/lib/agent/providers/provider-adapter.ts`: Provider abstraction layer
- `src/lib/agent/providers/credential-vault.ts`: Secure credential storage
- `src/lib/agent/providers/model-registry.ts`: Model configuration
- `src/lib/agent/tools/`: Individual agent tools
- `src/lib/agent/facades/`: Agent tool facades
- `src/lib/agent/hooks/use-agent-chat-with-tools.ts`: Chat with tool integration
- `src/routes/api/chat.ts`: Chat API endpoint

### 4.2 Critical Gaps Identified

**1. TanStack AI SDK Implementation**:
- ❌ Not using proper streaming patterns
- ❌ Missing SSE protocol implementation
- ❌ No automatic tool execution
- ❌ Incorrect adapter usage
- ❌ Missing error handling for streams

**2. State Management**:
- ❌ Confusion between TanStack Store, Zustand, and local state
- ❌ Legacy IndexedDB mixed with Dexie
- ❌ Inconsistent persistence patterns
- ❌ No clear state ownership

**3. Agent Tool Design**:
- ❌ Tools not following facade pattern properly
- ❌ Missing file locking implementation
- ❌ No tool execution validation
- ❌ Incomplete error handling

**4. Chat UI Components**:
- ❌ Missing rich text rendering
- ❌ No tool call visualization
- ❌ Missing approval workflow
- ❌ No code block with actions
- ❌ Missing diff preview

**5. Integration**:
- ❌ Chat not integrated with file tree
- ❌ Terminal not synchronized with chat
- ❌ Monaco editor not reflecting agent changes
- ❌ No real-time state updates

### 4.3 Sprint Planning Chaos

**Issues Identified**:
- 26+ epics with overlapping/conflicting stories
- Ambiguous story statuses
- Dead code in codebase
- No coherent user journey
- Missing acceptance criteria
- No traceability between stories and implementation

**Example Conflicts**:
- Epic 25: AI Foundation (in-progress)
- Epic 26: Agent Management Dashboard (not started)
- Epic 27: State Management Migration (not started)
- Epic 28: Chat System Components (in-progress)

---

## 5. Key Patterns for Via-gent Implementation

### 5.1 Agent System Prompt Pattern

```typescript
const CODING_AGENT_SYSTEM_PROMPT = `
You are an expert full-stack developer specializing in React, TypeScript, and modern web development.

Your role is to help users build, debug, and optimize web applications in the Via-gent browser-based IDE.

## Environment
- Browser-based IDE with WebContainers for code execution
- Monaco Editor for code editing
- xterm.js-based terminal
- File system sync with local files
- TanStack Router for routing

## Available Tools
- readFile: Read file contents from the project
- writeFile: Write or modify files
- listFiles: Browse project structure
- executeCommand: Run terminal commands in WebContainer

## Workflow
1. Understand the user's goal by asking clarifying questions
2. Analyze the current codebase structure
3. Propose solutions with clear explanations
4. Implement changes incrementally
5. Test and verify each change
6. Provide summary of what was done

## Best Practices
- Always explain your reasoning before making changes
- Use TypeScript for type safety
- Follow existing code style and patterns
- Write tests for new features
- Ensure changes are compatible with WebContainers
- Consider file system sync constraints

## Constraints
- Cannot execute arbitrary system commands
- Must work within browser security model
- File changes sync to WebContainer automatically
- Terminal commands run in WebContainer sandbox
- Context window is limited, prioritize relevant files

## Error Handling
- If a tool fails, explain why and suggest alternatives
- Handle permission errors gracefully
- Provide clear error messages to users
- Suggest workarounds when possible

Always be helpful, clear, and thorough in your responses.
`;
```

### 5.2 Tool Execution Pattern

```typescript
// Tool facade pattern
export class AgentFileTools {
  private webcontainer: WebContainer;
  private fileLock: FileLock;

  constructor(webcontainer: WebContainer) {
    this.webcontainer = webcontainer;
    this.fileLock = new FileLock();
  }

  async readFile(path: string): Promise<string> {
    // Acquire lock
    await this.fileLock.acquire(path);
    
    try {
      // Read from WebContainer
      const content = await this.webcontainer.fs.readFile(path, 'utf-8');
      return content;
    } finally {
      // Release lock
      await this.fileLock.release(path);
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    // Acquire lock
    await this.fileLock.acquire(path);
    
    try {
      // Write to WebContainer
      await this.webcontainer.fs.writeFile(path, content);
      
      // Sync to local FS (handled by SyncManager)
    } finally {
      // Release lock
      await this.fileLock.release(path);
    }
  }
}
```

### 5.3 Chat Streaming Pattern

```typescript
// SSE stream consumption
async function* consumeSSEStream(response: Response) {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body');
  }

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        yield data;
      }
    }
  }
}

// Usage in React component
const { messages, sendMessage } = useAgentChat({
  tools: {
    readFile: {
      description: 'Read a file',
      parameters: z.object({ path: z.string() }),
      execute: async ({ path }) => {
        return await fileTools.readFile(path);
      }
    }
  }
});

// Stream response
for await (const chunk of consumeSSEStream(response)) {
  if (chunk.type === 'content') {
    // Update UI with content
  } else if (chunk.type === 'tool_call') {
    // Show tool call in UI
  } else if (chunk.type === 'tool_result') {
    // Show tool result in UI
  } else if (chunk.type === 'done') {
    // Mark as complete
  }
}
```

### 5.4 State Management Pattern

```typescript
// Zustand store with persistence
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AgentStore {
  agents: Agent[];
  selectedAgent: Agent | null;
  
  addAgent: (agent: Agent) => void;
  removeAgent: (id: string) => void;
  selectAgent: (id: string) => void;
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set) => ({
      agents: [],
      selectedAgent: null,
      
      addAgent: (agent) => set((state) => ({
        agents: [...state.agents, agent]
      })),
      
      removeAgent: (id) => set((state) => ({
        agents: state.agents.filter(a => a.id !== id)
      })),
      
      selectAgent: (id) => set((state) => ({
        selectedAgent: state.agents.find(a => a.id === id) || null
      }))
    }),
    {
      name: 'agent-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
```

### 5.5 E2E Testing Pattern

```typescript
// E2E test for agent workflow
describe('Agent Workflow E2E', () => {
  it('should complete a full coding task', async () => {
    // 1. Setup: Load project
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="open-project"]');
    await page.fill('[data-testid="project-path"]', '/test-project');
    await page.click('[data-testid="load-project"]');
    
    // 2. Configure agent
    await page.click('[data-testid="agent-config"]');
    await page.selectOption('[data-testid="agent-provider"]', 'openrouter');
    await page.fill('[data-testid="api-key"]', 'test-key');
    await page.click('[data-testid="save-config"]');
    
    // 3. Start conversation
    await page.click('[data-testid="chat-input"]');
    await page.fill('[data-testid="chat-input"]', 'Create a simple React component');
    await page.click('[data-testid="send-message"]');
    
    // 4. Verify tool execution
    await expect(page.locator('[data-testid="tool-call"]')).toBeVisible();
    await expect(page.locator('[data-testid="tool-result"]')).toBeVisible();
    
    // 5. Verify file changes
    await page.click('[data-testid="file-tree"]');
    await expect(page.locator('text=NewComponent.tsx')).toBeVisible();
    
    // 6. Verify code in editor
    await page.click('text=NewComponent.tsx');
    await expect(page.locator('.monaco-editor')).toContainText('export function NewComponent');
    
    // 7. Verify terminal execution
    await page.click('[data-testid="terminal"]');
    await expect(page.locator('.xterm')).toContainText('npm test');
  });
});
```

---

## 6. Remediation Priorities

### Priority 1: Fix TanStack AI SDK Implementation
- Implement proper SSE streaming
- Add automatic tool execution
- Fix adapter usage
- Add comprehensive error handling
- Implement stream consumption pattern

### Priority 2: Consolidate State Management
- Migrate to Zustand consistently
- Remove legacy TanStack Store
- Standardize persistence with Dexie
- Define clear state ownership
- Document state flow

### Priority 3: Complete Chat UI Components
- Implement rich text rendering
- Add tool call visualization
- Create approval workflow
- Add code block with actions
- Implement diff preview

### Priority 4: Integrate Components
- Connect chat to file tree
- Synchronize terminal with chat
- Reflect agent changes in Monaco
- Add real-time state updates
- Implement event bus

### Priority 5: Clean Up Sprint Planning
- Consolidate overlapping epics
- Remove dead code
- Clarify story statuses
- Define coherent user journey
- Add acceptance criteria

### Priority 6: Establish E2E Testing Foundation
- Create E2E test infrastructure
- Define test scenarios
- Implement traceability
- Add test reporting
- Establish CI/CD integration

### Priority 7: Enforce MCP Research Protocol
- Update agent instructions
- Create research guidelines
- Add validation checks
- Document research workflow
- Train agents on protocol

### Priority 8: Create Comprehensive Documentation
- Document agent architecture
- Create implementation guides
- Add troubleshooting guides
- Document API endpoints
- Create user guides

---

## 7. Success Criteria

### Technical Success Criteria
- ✅ TanStack AI SDK properly integrated with SSE streaming
- ✅ Automatic tool execution working correctly
- ✅ State management consolidated to Zustand + Dexie
- ✅ Chat UI fully functional with rich rendering
- ✅ All components integrated and synchronized
- ✅ E2E tests passing for critical workflows
- ✅ MCP research protocol enforced across all agents
- ✅ Sprint planning cleaned up and consolidated

### User Experience Success Criteria
- ✅ Users can configure agents easily
- ✅ Chat interface is intuitive and responsive
- ✅ Tool execution is visible and transparent
- ✅ File changes are reflected in real-time
- ✅ Terminal commands execute correctly
- ✅ Error messages are clear and helpful
- ✅ Overall workflow is smooth and efficient

### Development Success Criteria
- ✅ Code is maintainable and well-documented
- ✅ Tests provide good coverage
- ✅ CI/CD pipeline is functional
- ✅ Deployment process is automated
- ✅ Monitoring and logging are in place
- ✅ Team can iterate quickly

---

## 8. Next Steps

1. **Immediate Actions** (Next 24 hours):
   - Fix TanStack AI SDK implementation
   - Implement proper SSE streaming
   - Add automatic tool execution
   - Fix chat API endpoint

2. **Short-term Actions** (Next week):
   - Consolidate state management
   - Complete chat UI components
   - Integrate components
   - Create E2E test infrastructure

3. **Medium-term Actions** (Next 2 weeks):
   - Clean up sprint planning
   - Enforce MCP research protocol
   - Create comprehensive documentation
   - Establish monitoring

4. **Long-term Actions** (Next month):
   - Optimize performance
   - Add advanced features
   - Improve user experience
   - Scale infrastructure

---

## Conclusion

This research synthesis provides a comprehensive foundation for systematic course correction of the Via-gent AI agent system. The findings reveal critical gaps in current implementation and provide clear patterns and best practices for remediation.

The key insights are:
1. TanStack AI SDK requires proper SSE streaming and automatic tool execution
2. State management must be consolidated to Zustand + Dexie
3. Chat UI needs rich rendering and tool visualization
4. Components must be integrated and synchronized
5. E2E testing foundation is essential for traceability
6. MCP research protocol must be enforced
7. Sprint planning needs cleanup and consolidation

By following the patterns and priorities outlined in this document, the Via-gent team can systematically address the identified issues and build a robust, user-friendly AI coding agent system.