---
title: "AI Agent System - Multi-Provider Support trong Via-gent"
date: 2025-12-24
tags: ["AI Agent", "TanStack AI", "Multi-Provider", "OpenRouter", "Anthropic", "React", "TypeScript"]
author: "Via-gent Team"
series: "Hành Trình Xây Dựng Via-gent"
series_number: 3
---

# AI Agent System - Multi-Provider Support

**English Abstract**: This article explores Via-gent's AI agent system with multi-provider support. It explains the provider adapter pattern, TanStack AI integration, tool facades for file and terminal operations, and streaming chat implementation. The article provides code examples and architectural diagrams showing how Via-gent supports multiple AI providers like OpenRouter, Anthropic, and OpenAI.

---

## Giới thiệu AI Agent System

Via-gent không chỉ là một IDE với AI assistance - nó là một **multi-agent orchestration system** cho phép AI agents tương tác với codebase của bạn một cách an toàn và hiệu quả.

### AI Agent trong Via-gent là gì?

AI Agent trong Via-gent là một entity có thể:
- Đọc và viết files trong project
- Execute commands trong terminal
- Hiểu context của project
- Tự động hóa tasks phức tạp
- Học từ previous interactions

### Tại sao cần Multi-Provider Support?

```
Single Provider (Traditional):
User → AI Provider (e.g., OpenAI) → Response

Multi-Provider (Via-gent):
User → Provider Adapter → OpenRouter/Anthropic/OpenAI → Response
                        ↓
                   Credential Vault
```

**Lợi ích của Multi-Provider:**
1. **Cost Optimization**: Chọn model rẻ hơn cho tasks đơn giản
2. **Model Flexibility**: Sử dụng model phù hợp nhất cho từng task
3. **No Lock-in**: Chuyển đổi providers dễ dàng
4. **Redundancy**: Fallback nếu một provider down
5. **Custom Models**: Support custom/private models

---

## Provider Adapter Pattern

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Agent Chat Panel                            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   useAgentChat Hook                         │
│  - Manage chat state                                        │
│  - Handle tool calls                                         │
│  - Stream responses                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Provider Adapter Factory                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │ │
│  │OpenRouter│  │Anthropic │  │  OpenAI  │  │  Google  │ │ │
│  │ Adapter  │  │ Adapter  │  │ Adapter  │  │ Adapter  │ │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    TanStack AI                               │
│  - Streaming chat                                           │
│  - Tool calling                                              │
│  - Message handling                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   AI Providers                              │
│  OpenRouter, Anthropic, OpenAI, Google, etc.                │
└─────────────────────────────────────────────────────────────┘
```

### Provider Adapter Interface

```typescript
// src/lib/agent/providers/provider-adapter.ts
export interface ProviderAdapter {
  readonly providerId: string;
  readonly providerName: string;
  
  // Chat methods
  chat(messages: Message[], options?: ChatOptions): AsyncIterable<ChatChunk>;
  
  // Tool calling
  callTool(tool: Tool, params: ToolParams): Promise<ToolResult>;
  
  // Stream handling
  streamResponse(response: Response): AsyncIterable<ChatChunk>;
  
  // Validation
  validateConfig(config: ProviderConfig): boolean;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: Tool[];
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
}

export interface ChatChunk {
  content: string;
  toolCalls?: ToolCall[];
  done: boolean;
}
```

### OpenRouter Adapter Implementation

```typescript
// src/lib/agent/providers/openrouter-adapter.ts
export class OpenRouterAdapter implements ProviderAdapter {
  readonly providerId = 'openrouter';
  readonly providerName = 'OpenRouter';
  
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async chat(
    messages: Message[], 
    options: ChatOptions = {}
  ): AsyncIterable<ChatChunk> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
      },
      body: JSON.stringify({
        model: options.model || 'anthropic/claude-3-haiku',
        messages: this.formatMessages(messages),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
        tools: options.tools ? this.formatTools(options.tools) : undefined,
        stream: true,
      }),
    });
    
    return this.streamResponse(response);
  }
  
  async *streamResponse(response: Response): AsyncIterable<ChatChunk> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }
    
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices[0]?.delta;
            
            if (delta?.content) {
              yield {
                content: delta.content,
                toolCalls: delta?.tool_calls,
                done: false,
              };
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }
  
  private formatMessages(messages: Message[]): any[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      tool_calls: msg.toolCalls,
      tool_call_id: msg.toolCallId,
    }));
  }
  
  private formatTools(tools: Tool[]): any[] {
    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }
  
  validateConfig(config: ProviderConfig): boolean {
    return !!config.apiKey;
  }
}
```

---

## Provider Adapter Factory

Factory pattern cho phép tạo adapters động dựa trên provider ID:

```typescript
// src/lib/agent/providers/provider-adapter.ts
export class ProviderAdapterFactory {
  private static adapters: Map<string, typeof ProviderAdapter> = new Map();
  
  static registerAdapter(
    providerId: string, 
    adapterClass: typeof ProviderAdapter
  ): void {
    this.adapters.set(providerId, adapterClass);
  }
  
  static createAdapter(
    providerId: string, 
    config: ProviderConfig
  ): ProviderAdapter {
    const AdapterClass = this.adapters.get(providerId);
    if (!AdapterClass) {
      throw new Error(`Unknown provider: ${providerId}`);
    }
    
    return new AdapterClass(config.apiKey);
  }
  
  static getAvailableProviders(): string[] {
    return Array.from(this.adapters.keys());
  }
}

// Register adapters
ProviderAdapterFactory.registerAdapter('openrouter', OpenRouterAdapter);
ProviderAdapterFactory.registerAdapter('anthropic', AnthropicAdapter);
ProviderAdapterFactory.registerAdapter('openai', OpenAIAdapter);
ProviderAdapterFactory.registerAdapter('google', GoogleAdapter);
```

---

## Model Registry

Model Registry quản lý danh sách các AI models có sẵn:

```typescript
// src/lib/agent/providers/model-registry.ts
export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  costPer1kTokens: number;
  capabilities: string[];
}

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  // OpenRouter Models
  'anthropic/claude-3-haiku': {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'openrouter',
    contextLength: 200000,
    costPer1kTokens: 0.00025,
    capabilities: ['chat', 'code', 'tools'],
  },
  'anthropic/claude-3-sonnet': {
    id: 'anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'openrouter',
    contextLength: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['chat', 'code', 'tools', 'analysis'],
  },
  'openai/gpt-4-turbo': {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openrouter',
    contextLength: 128000,
    costPer1kTokens: 0.01,
    capabilities: ['chat', 'code', 'tools', 'vision'],
  },
  
  // Anthropic Models
  'claude-3-haiku-20240307': {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    contextLength: 200000,
    costPer1kTokens: 0.00025,
    capabilities: ['chat', 'code', 'tools'],
  },
  
  // OpenAI Models
  'gpt-4-turbo-preview': {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    contextLength: 128000,
    costPer1kTokens: 0.01,
    capabilities: ['chat', 'code', 'tools', 'vision'],
  },
};

export function getModelsByProvider(provider: string): ModelConfig[] {
  return Object.values(MODEL_REGISTRY).filter(
    model => model.provider === provider
  );
}

export function getModelById(id: string): ModelConfig | undefined {
  return MODEL_REGISTRY[id];
}
```

---

## Credential Vault

Credential Vault lưu trữ API keys một cách an toàn trong IndexedDB:

```typescript
// src/lib/agent/providers/credential-vault.ts
import { openDB } from 'idb';

export interface Credential {
  providerId: string;
  apiKey: string;
  createdAt: number;
  lastUsed: number;
}

class CredentialVault {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'via-gent-credentials';
  private readonly STORE_NAME = 'credentials';
  
  async init(): Promise<void> {
    this.db = await openDB(this.DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(this.STORE_NAME, { keyPath: 'providerId' });
      },
    });
  }
  
  async saveCredential(credential: Credential): Promise<void> {
    if (!this.db) await this.init();
    
    await this.db!.put(this.STORE_NAME, {
      ...credential,
      lastUsed: Date.now(),
    });
  }
  
  async getCredential(providerId: string): Promise<Credential | undefined> {
    if (!this.db) await this.init();
    
    return await this.db!.get(this.STORE_NAME, providerId);
  }
  
  async getAllCredentials(): Promise<Credential[]> {
    if (!this.db) await this.init();
    
    return await this.db!.getAll(this.STORE_NAME);
  }
  
  async deleteCredential(providerId: string): Promise<void> {
    if (!this.db) await this.init();
    
    await this.db!.delete(this.STORE_NAME, providerId);
  }
  
  async hasCredential(providerId: string): Promise<boolean> {
    const credential = await this.getCredential(providerId);
    return !!credential;
  }
}

export const credentialVault = new CredentialVault();
```

---

## Agent Tool Facades

Tool Facades abstract WebContainer operations để AI agents có thể tương tác một cách an toàn:

### File Tools Facade

```typescript
// src/lib/agent/facades/file-tools.ts
export class AgentFileTools {
  private localFSAdapter: LocalFSAdapter;
  private webcontainer: WebContainer;
  private fileLock: FileLock;
  
  constructor(
    localFSAdapter: LocalFSAdapter,
    webcontainer: WebContainer
  ) {
    this.localFSAdapter = localFSAdapter;
    this.webcontainer = webcontainer;
    this.fileLock = new FileLock();
  }
  
  async readFile(path: string): Promise<string> {
    return await this.fileLock.withLock(path, async () => {
      return await this.localFSAdapter.readFile(path);
    });
  }
  
  async writeFile(path: string, content: string): Promise<void> {
    return await this.fileLock.withLock(path, async () => {
      await this.localFSAdapter.writeFile(path, content);
      await this.syncToWebContainer(path, content);
    });
  }
  
  async listFiles(path: string = ''): Promise<string[]> {
    return await this.localFSAdapter.listFiles(path);
  }
  
  async createFile(path: string, content: string = ''): Promise<void> {
    return await this.fileLock.withLock(path, async () => {
      await this.localFSAdapter.writeFile(path, content);
      await this.syncToWebContainer(path, content);
    });
  }
  
  async deleteFile(path: string): Promise<void> {
    return await this.fileLock.withLock(path, async () => {
      await this.localFSAdapter.deleteFile(path);
      await this.webcontainer.fs.rm(path, { recursive: true });
    });
  }
  
  private async syncToWebContainer(path: string, content: string): Promise<void> {
    const fileTree: FileSystemTree = {
      [path]: {
        file: { contents: content },
      },
    };
    await this.webcontainer.mount(fileTree);
  }
}
```

### Terminal Tools Facade

```typescript
// src/lib/agent/facades/terminal-tools.ts
export class AgentTerminalTools {
  private webcontainer: WebContainer;
  private projectPath: string;
  
  constructor(webcontainer: WebContainer, projectPath: string) {
    this.webcontainer = webcontainer;
    this.projectPath = projectPath;
  }
  
  async executeCommand(command: string, args: string[] = []): Promise<string> {
    const process = await this.webcontainer.spawn(command, args, {
      cwd: this.projectPath,
    });
    
    const output: string[] = [];
    process.output.pipeTo(new WritableStream({
      write(chunk) {
        output.push(chunk);
      },
    }));
    
    const exitCode = await process.exit;
    if (exitCode !== 0) {
      throw new Error(`Command failed with exit code ${exitCode}`);
    }
    
    return output.join('');
  }
  
  async runScript(scriptPath: string): Promise<string> {
    return await this.executeCommand('node', [scriptPath]);
  }
  
  async installDependencies(): Promise<string> {
    return await this.executeCommand('npm', ['install']);
  }
  
  async runTests(): Promise<string> {
    return await this.executeCommand('npm', ['test']);
  }
}
```

---

## useAgentChat Hook

Hook React quản lý AI chat với tool integration:

```typescript
// src/lib/agent/hooks/use-agent-chat-with-tools.ts
export function useAgentChatWithTools() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [providerId, setProviderId] = useState('openrouter');
  const [modelId, setModelId] = useState('anthropic/claude-3-haiku');
  
  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    
    // Add user message
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Get provider adapter
      const credential = await credentialVault.getCredential(providerId);
      if (!credential) {
        throw new Error(`No credential found for ${providerId}`);
      }
      
      const adapter = ProviderAdapterFactory.createAdapter(
        providerId,
        { apiKey: credential.apiKey }
      );
      
      // Prepare tools
      const tools = [
        {
          name: 'read_file',
          description: 'Read the contents of a file',
          parameters: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path' },
            },
            required: ['path'],
          },
        },
        {
          name: 'write_file',
          description: 'Write content to a file',
          parameters: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path' },
              content: { type: 'string', description: 'File content' },
            },
            required: ['path', 'content'],
          },
        },
        {
          name: 'execute_command',
          description: 'Execute a command in the terminal',
          parameters: {
            type: 'object',
            properties: {
              command: { type: 'string', description: 'Command to execute' },
              args: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Command arguments' 
              },
            },
            required: ['command'],
          },
        },
      ];
      
      // Stream response
      let assistantContent = '';
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: '' 
      };
      
      for await (const chunk of adapter.chat([...messages, userMessage], {
        model: modelId,
        tools,
      })) {
        if (chunk.toolCalls) {
          // Handle tool calls
          for (const toolCall of chunk.toolCalls) {
            const toolResult = await executeTool(toolCall);
            
            // Add tool result to messages
            setMessages(prev => [
              ...prev,
              assistantMessage,
              {
                role: 'tool',
                content: JSON.stringify(toolResult),
                toolCallId: toolCall.id,
              },
            ]);
          }
        } else {
          assistantContent += chunk.content;
          assistantMessage.content = assistantContent;
          
          // Update UI with streaming content
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages[newMessages.length - 1]?.role === 'assistant') {
              newMessages[newMessages.length - 1] = assistantMessage;
            } else {
              newMessages.push(assistantMessage);
            }
            return newMessages;
          });
        }
        
        if (chunk.done) {
          break;
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [providerId, modelId, messages]);
  
  const executeTool = async (toolCall: ToolCall): Promise<any> => {
    const { name, arguments: args } = toolCall;
    
    switch (name) {
      case 'read_file':
        return await agentFileTools.readFile(args.path);
      case 'write_file':
        return await agentFileTools.writeFile(args.path, args.content);
      case 'execute_command':
        return await agentTerminalTools.executeCommand(
          args.command,
          args.args || []
        );
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  };
  
  return {
    messages,
    sendMessage,
    isLoading,
    providerId,
    setProviderId,
    modelId,
    setModelId,
  };
}
```

---

## Streaming Chat Implementation

Streaming responses giúp giảm perceived latency và improve user experience:

```typescript
// Example of streaming chat UI component
function StreamingChatMessage({ message }: { message: Message }) {
  const [displayedContent, setDisplayedContent] = useState('');
  
  useEffect(() => {
    if (message.role === 'assistant') {
      // Simulate streaming effect
      let index = 0;
      const interval = setInterval(() => {
        if (index < message.content.length) {
          setDisplayedContent(message.content.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 10);
      
      return () => clearInterval(interval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message]);
  
  return (
    <div className={`message ${message.role}`}>
      <div className="message-content">
        {message.role === 'assistant' ? (
          <ReactMarkdown>{displayedContent}</ReactMarkdown>
        ) : (
          <p>{displayedContent}</p>
        )}
      </div>
    </div>
  );
}
```

---

## Challenges và Solutions

### Challenge 1: Tool Execution Safety

**Problem**: AI agents có thể execute dangerous commands.

**Solution**:
- Implement approval UI cho tool calls
- Restrict dangerous commands
- Audit log cho tất cả tool executions

```typescript
function ApprovalOverlay({ toolCall, onApprove, onReject }: Props) {
  return (
    <div className="approval-overlay">
      <h3>Tool Call Approval Required</h3>
      <p>Tool: {toolCall.name}</p>
      <pre>{JSON.stringify(toolCall.arguments, null, 2)}</pre>
      <div className="actions">
        <button onClick={onApprove}>Approve</button>
        <button onClick={onReject}>Reject</button>
      </div>
    </div>
  );
}
```

### Challenge 2: Context Window Management

**Problem**: AI models có context window limits.

**Solution**:
- Implement context compression
- Prioritize recent messages
- Use summarization cho old conversations

```typescript
function compressContext(messages: Message[], maxTokens: number): Message[] {
  // Keep system message
  const systemMessage = messages.find(m => m.role === 'system');
  
  // Keep last N messages
  const recentMessages = messages.slice(-10);
  
  return [
    ...(systemMessage ? [systemMessage] : []),
    ...recentMessages,
  ];
}
```

### Challenge 3: Cost Management

**Problem**: AI API calls có thể tốn kém.

**Solution**:
- Track token usage
- Implement cost alerts
- Use cheaper models cho simple tasks

```typescript
function calculateCost(model: ModelConfig, tokens: number): number {
  return (tokens / 1000) * model.costPer1kTokens;
}

function checkCostLimit(cost: number, limit: number): boolean {
  return cost <= limit;
}
```

---

## Key Takeaways

1. **Multi-provider AI support** cho phép flexibility và cost optimization
2. **Provider adapter pattern** abstract provider-specific implementations
3. **Tool facades** cung cấp safe interface cho AI agents
4. **Streaming responses** improve user experience
5. **Credential vault** lưu trữ API keys an toàn

---

## What's Next?

Trong bài tiếp theo, tôi sẽ đi sâu vào **Monaco Editor Integration**, cụ thể là:
- Monaco Editor setup trong React
- Tab management system
- Syntax highlighting và language support
- Performance optimization cho code editor

Hãy theo dõi series này để hiểu rõ hơn về cách Via-gent integrate Monaco Editor!

---

## Suggested Social Media Posts

### LinkedIn
```
AI Agent System trong Via-gent: Multi-Provider Support 🤖

Không bị lock-in vào một AI provider!

Via-gent hỗ trợ:
✅ OpenRouter (100+ models)
✅ Anthropic (Claude)
✅ OpenAI (GPT-4)
✅ Google (Gemini)
✅ Bring your own API keys

Provider Adapter Pattern:
- Abstract provider-specific logic
- Easy to add new providers
- Cost optimization với model selection

Đọc full article tại: [link]

#ViaGent #AIAgent #TanStackAI #MultiProvider #React #TypeScript
```

### Facebook
```
AI Agent trong Via-gent có thể đọc và viết code của bạn! 🚀

Với Multi-Provider Support:
- Chọn AI model phù hợp nhất
- Tối ưu chi phí
- Không bị lock-in

Tool Facades cho phép AI:
📁 Read/write files
💻 Execute commands
🔍 Analyze codebase

Đọc bài 3 trong series "Hành trình xây dựng Via-gent" tại: [link]

#ViaGent #AIAgent #DeveloperTools #AIAssistedDevelopment
```

### Twitter/X
```
Via-gent AI Agent System: Multi-Provider Support 🤖

Features:
- OpenRouter, Anthropic, OpenAI, Google
- Provider Adapter Pattern
- Tool Facades for safe code interaction
- Streaming chat responses

Read the deep dive: [link]

#ViaGent #AIAgent #TanStackAI #MultiProvider
```

---

## Resources

- **TanStack AI Docs**: [tanstack.com/ai](https://tanstack.com/ai)
- **OpenRouter**: [openrouter.ai](https://openrouter.ai)
- **Anthropic API**: [docs.anthropic.com](https://docs.anthropic.com)
- **GitHub**: [github.com/yourusername/via-gent](https://github.com/yourusername/via-gent)

---

*Đây là bài thứ ba trong series "Hành Trình Xây Dựng Via-gent". Hãy theo dõi để không bỏ lỡ các bài tiếp theo!*