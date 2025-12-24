/bmad-master coordinate /sm and /pm for /correct-course 

I have clearly asked you this 
```
validate if the current stage is valid for complete end-2-end testing (Openrouter API key, testing on front-end as user full journey to tools, agents  _bmad-output\sprint-artifacts\epic-25-11-06-research-analysis-request.md:53-466
```

### **Phase 3A Objective: Single-Agent MVP with TanStack AI**

**Goal**: Wire a **Coder Agent** using **TanStack AI** with 3 file operation tools (read_file, write_file, execute_command) that integrate seamlessly with existing IDE components, state management, and persistence layer.

**Timeline**: 1 week (not 4) because 90% of primitives already exist.

***

### **Critical Implementation Requirements**

#### **1. Tool: read_file**

**Complexity Considerations**:
- Must respect **WorkspaceContext** permissions (check FSA handle validity)
- Read from **both** LocalFS and WebContainer (prefer LocalFS if synced, fallback to WebContainer)
- Handle symlinks, binary files, and permission errors gracefully
- Integrate with **SyncManager** to ensure fresh content
- Return structured output with metadata (path, size, encoding, lastModified)

**Integration Points**:
```typescript
// Pseudo-implementation
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import { WebContainerManager } from '@/lib/webcontainer/manager';

async function readFile(path: string): Promise<ToolResult> {
  const { directoryHandle, webContainer, syncStatus } = useWorkspace();
  
  // 1. Validate workspace is ready
  if (!directoryHandle) throw new Error('No project open');
  
  // 2. Check sync status (wait if syncing)
  if (syncStatus === 'syncing') {
    await waitForSync(); // Event bus listener
  }
  
  // 3. Read from LocalFS (source of truth)
  try {
    const content = await LocalFSAdapter.read(directoryHandle, path);
    return { content, source: 'local', path, encoding: 'utf-8' };
  } catch (e) {
    // 4. Fallback to WebContainer (for generated files)
    const content = await webContainer.fs.readFile(path, 'utf-8');
    return { content, source: 'webcontainer', path };
  }
}
```

**Edge Cases to Handle**:
- User creates file while agent is reading → **lock** or use optimistic locking
- Permission denied on FSA handle → emit error + fallback flow
- Binary files → detect MIME type, return base64
- Symlinks → resolve or error (WebContainer doesn't support symlinks)

***

#### **2. Tool: write_file**

**Complexity Considerations** (THIS IS THE HARDEST PART):

**a) Multiple Write Scenarios**:
1. **Create New File**: 
   - Update FileTree state (expand parent folder, select new file)
   - Emit file:created event via EventEmitter3
   - Trigger SyncManager to sync both LocalFS + WebContainer
   - Open in Monaco if user is focused on IDE

2. **Edit Existing File (Monaco is open)**:
   - Must update Monaco editor model **without losing cursor position**
   - Check if file has unsaved changes in Monaco → show "AI wants to write, you have unsaved changes" dialog
   - Update editor content via monaco.editor.setModelContent() 
   - Trigger auto-save flow (already exists in src/lib/editor/)

3. **Edit Existing File (Monaco is closed)**:
   - Write directly to LocalFS + WebContainer
   - Update FileTree metadata (size, lastModified)
   - Do NOT open editor (agent is background operation)

**b) State Synchronization Chain**:
```
Agent write_file() 
  → SyncManager.writeFile()
  → LocalFSAdapter.write() + WebContainer.fs.writeFile()
  → Event: 'file:changed' emitted
  → FileTree updates via EventEmitter listener
  → Monaco updates IF file is open (check EditorTabStore)
  → IndexedDB updates project metadata
```

**c) Concurrency Control**:
- User edits file at same time as agent → **CRITICAL RACE CONDITION**
- Solution: Use **operational transformation** (OT) or **Last Write Wins** with timestamp
- OR: Lock file while agent is writing (show "Agent is modifying this file..." indicator)

**d) Integration with Existing Editor State**:
```typescript
import { useEditorStore } from '@/lib/state/editor-store';
import { eventBus } from '@/lib/events';

async function writeFile(path: string, content: string) {
  const editorStore = useEditorStore.getState();
  const openTab = editorStore.tabs.find(t => t.path === path);
  
  if (openTab?.isDirty) {
    // User has unsaved changes
    const choice = await showDialog({
      title: 'AI wants to modify file',
      message: 'You have unsaved changes. Allow AI to overwrite?',
      actions: ['Allow', 'Cancel', 'Merge']
    });
    
    if (choice === 'Cancel') return { status: 'aborted' };
    if (choice === 'Merge') {
      // Three-way merge (complex!)
      content = await mergeChanges(openTab.content, content);
    }
  }
  
  // Write to both filesystems
  await syncManager.writeFile(path, content);
  
  // Update Monaco if open
  if (openTab) {
    const model = monaco.editor.getModel(openTab.uri);
    if (model) {
      const position = editor.getPosition(); // Save cursor
      model.setValue(content);
      editor.setPosition(position); // Restore cursor
    }
  }
  
  // Emit event for FileTree refresh
  eventBus.emit('file:changed', { path, size: content.length });
}
```

**e) Persistence Layer Integration**:
- Update ProjectStore lastModified timestamp
- Invalidate any cached file metadata in IndexedDB
- Ensure next session loads updated content

***

#### **3. Tool: execute_command**

**Complexity Considerations**:
- Must run in **WebContainer terminal** (NOT browser console)
- Set correct CWD (current working directory) from WorkspaceContext
- Stream output back to agent in real-time (not just final result)
- Handle long-running commands (e.g., npm install) with progress
- Detect command success/failure via exit codes

**Integration with XTerminal Component**:
```typescript
import { TerminalAdapter } from '@/lib/webcontainer/terminal-adapter';

async function executeCommand(command: string): Promise<ToolResult> {
  const { webContainer, projectPath } = useWorkspace();
  
  // 1. Spawn process with correct CWD
  const process = await webContainer.spawn(command, {
    cwd: projectPath,
    env: { ...process.env, CI: 'true' } // Non-interactive
  });
  
  // 2. Stream output to agent (+ optionally to XTerminal)
  let stdout = '';
  let stderr = '';
  
  process.output.pipeTo(new WritableStream({
    write(data) {
      stdout += data;
      // Optional: show in XTerminal for user visibility
      terminalAdapter.write(data);
    }
  }));
  
  // 3. Wait for completion with timeout
  const exitCode = await Promise.race([
    process.exit,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 120_000)
    )
  ]);
  
  return {
    exitCode,
    stdout,
    stderr,
    command,
    duration: Date.now() - startTime
  };
}
```

**Edge Cases**:
- Interactive commands (e.g., git commit without -m) → force non-interactive mode
- Commands that modify files (e.g., npm install) → trigger sync after completion
- Commands that fail (exit code ≠ 0) → return error but don't crash agent loop

***

### **4. TanStack AI Integration**

**Wiring Tools to TanStack AI**:

```typescript
// src/lib/agent/coder-agent.ts
import { useChat } from '@tanstack/ai-react';
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

export function createCoderAgent() {
  const tools = {
    read_file: toolDefinition.client({
      description: 'Read file content from workspace',
      parameters: z.object({
        path: z.string().describe('File path relative to project root')
      }),
      execute: async ({ path }) => {
        return await agentToolFacade.readFile(path);
      }
    }),
    
    write_file: toolDefinition.client({
      description: 'Create or update file with content',
      parameters: z.object({
        path: z.string(),
        content: z.string()
      }),
      execute: async ({ path, content }) => {
        return await agentToolFacade.writeFile(path, content);
      }
    }),
    
    execute_command: toolDefinition.client({
      description: 'Run terminal command in WebContainer',
      parameters: z.object({
        command: z.string()
      }),
      execute: async ({ command }) => {
        return await agentToolFacade.executeCommand(command);
      }
    })
  };
  
  return useChat({
    model: 'gemini-3.0-flash', // Use @tanstack/ai-gemini
    tools,
    maxToolRoundtrips: 10,
    onToolCall: (toolCall) => {
      // Show in Chat Panel: "Agent is reading package.json..."
      chatStore.addMessage({
        role: 'tool',
        content: Executing: ${toolCall.toolName},
        toolCallId: toolCall.id
      });
    },
    onFinish: (result) => {
      // Final response after tool execution
      chatStore.addMessage({
        role: 'assistant',
        content: result.text
      });
    }
  });
}
```

**DevTools Integration**:
```typescript
// Enable TanStack AI DevTools (already in package.json)
import { DevTools } from '@tanstack/ai-devtools';

<DevTools 
  position="bottom-right" 
  initialIsOpen={process.env.NODE_ENV === 'development'}
/>
```

***

### **5. Agentic Loop & Context Management**

**Task Context** (passed to agent with each message):
```typescript
interface TaskContext {
  projectId: string;
  projectPath: string;
  openFiles: { path: string; isDirty: boolean }[];
  recentFiles: string[]; // Last 10 files accessed
  terminalHistory: string[]; // Last 5 commands
  syncStatus: 'idle' | 'syncing' | 'error';
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    canExecute: boolean;
  };
}
```

**Agentic Loop Flow**:
```
User: "Add a README.md with installation instructions"
  ↓
Agent: [PLAN] I need to:
  1. Check if README.md exists (read_file)
  2. Create/update README.md (write_file)
  3. Verify it's in git (execute_command: git status)
  ↓
Tool Call 1: read_file("README.md")
  → Result: { error: "File not found" }
  ↓
Tool Call 2: write_file("README.md", "# Project Alpha\n\n## Installation...")
  → Result: { status: "created", path: "README.md" }
  ↓
Tool Call 3: execute_command("git status")
  → Result: { stdout: "Untracked files:\n  README.md" }
  ↓
Agent: [RESPONSE] "I've created README.md with installation instructions. 
       The file is untracked in git—would you like me to commit it?"
```

**Memory Between Turns**:
- Use **TanStack Store** to persist conversation history
- Store tool call results in IndexedDB for debugging
- Pass recent context in system prompt

***

### **6. UI/UX Integration**

**Chat Panel Wire-up**:
```typescript
// src/components/ide/ChatPanel/index.tsx
import { createCoderAgent } from '@/lib/agent/coder-agent';

export function ChatPanel() {
  const { messages, input, handleSubmit, isLoading } = createCoderAgent();
  
  return (
    <div className="chat-panel">
      <MessageList messages={messages} />
      
      {/* Show tool execution status */}
      {isLoading && (
        <div className="tool-status">
          <Spinner /> Agent is working...
        </div>
      )}
      
      <ChatInput 
        value={input}
        onSubmit={handleSubmit}
        placeholder="Ask me to code..."
      />
    </div>
  );
}
```

**Approval Flow** (for safety):
- Before executing write_file or execute_command, show approval dialog
- User can enable "Auto-approve safe commands" in settings
- Dangerous commands (e.g., rm -rf) require explicit approval

***

### **7. Testing Strategy**

**Unit Tests** (Vitest + Testing Library):
```typescript
// src/lib/agent/__tests__/coder-agent.test.ts
describe('Coder Agent Tools', () => {
  it('should read file from LocalFS', async () => {
    const result = await agentToolFacade.readFile('package.json');
    expect(result.content).toContain('"name": "project-alpha"');
  });
  
  it('should create new file and update FileTree', async () => {
    const spy = vi.spyOn(eventBus, 'emit');
    await agentToolFacade.writeFile('new.txt', 'Hello');
    expect(spy).toHaveBeenCalledWith('file:created', { path: 'new.txt' });
  });
  
  it('should execute command and capture output', async () => {
    const result = await agentToolFacade.executeCommand('echo "test"');
    expect(result.stdout).toBe('test\n');
    expect(result.exitCode).toBe(0);
  });
});
```

**Integration Tests** (with fake-indexeddb + mock WebContainer):
```typescript
it('should complete full agent workflow', async () => {
  const { handleSubmit } = createCoderAgent();
  
  await handleSubmit('Create a new file hello.ts with console.log');
  
  // Assert tool calls were made
  expect(mockToolCall).toHaveBeenCalledWith('write_file', {
    path: 'hello.ts',
    content: expect.stringContaining('console.log')
  });
  
  // Assert file exists in both filesystems
  const localContent = await localFS.read('hello.ts');
  const wcContent = await webContainer.fs.readFile('hello.ts');
  expect(localContent).toBe(wcContent);
});
```
```

 _bmad-output\sprint-artifacts\epic-25-12-06-openaicompatible-support.md:2-1042
```

## Battle-Tested AI Integration Architecture

Based on my research and your requirements, here's the **production-grade implementation strategy**:

### ✅ **TanStack AI + OpenRouter Compatibility**

**GOOD NEWS**: TanStack AI's OpenAI adapter **fully supports OpenRouter** via the baseURL configuration:[1]

```typescript
import { createOpenaiChat, type OpenAIChatConfig } from "@tanstack/ai-openai";

const config: Omit<OpenAIChatConfig, 'apiKey'> = {
  baseURL: "https://openrouter.ai/api/v1", // ✅ OpenRouter endpoint
  // Optional: Add custom headers for OpenRouter
};

const adapter = createOpenaiChat(apiKey, config);
```

This is **100% compatible** since OpenRouter uses OpenAI-compatible endpoints.[2][3]

***

## 🎯 **Complete AI Provider Configuration System**

### **Architecture Requirements**

1. **Client-Side API Key Management** (Encrypted & Persistent)
2. **Dynamic Model Loading** from Providers
3. **Multi-Provider Support** (OpenRouter, Gemini, Anthropic, etc.)
4. **Agent Configuration Persistence**
5. **Testability & Scaffolding Layers**

***

## 📋 **Implementation Specification**

### **1. Secure Credential Storage Service**

```typescript
// lib/core/security/credential-vault.ts

import { encryptData, decryptData } from './crypto-utils';

interface ProviderCredentials {
  providerId: string;
  apiKey: string;
  baseURL?: string;
  organization?: string;
  encryptedAt: string;
}

interface VaultConfig {
  persistenceEnabled: boolean;
  encryptionEnabled: boolean;
  autoLock: boolean;
  lockTimeout?: number; // minutes
}

class CredentialVault {
  private db: IDBDatabase | null = null;
  private masterKey: CryptoKey | null = null;
  private config: VaultConfig;
  
  constructor(config: VaultConfig) {
    this.config = config;
  }

  /**
   * Initialize IndexedDB with Web Crypto API encryption
   * Uses AES-GCM 256-bit encryption with non-extractable keys
   */
  async initialize(userPassword?: string): Promise<void> {
    // Open IndexedDB
    const request = indexedDB.open('ai-agent-vault', 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Credentials store
      if (!db.objectStoreNames.contains('credentials')) {
        db.createObjectStore('credentials', { keyPath: 'providerId' });
      }
      
      // Encryption keys store (non-extractable)
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys', { keyPath: 'id' });
      }
      
      // Agent configurations
      if (!db.objectStoreNames.contains('agent-configs')) {
        db.createObjectStore('agent-configs', { keyPath: 'agentId' });
      }
    };
    
    this.db = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Generate or retrieve master encryption key
    if (this.config.encryptionEnabled) {
      await this.initializeMasterKey(userPassword);
    }
  }

  /**
   * Generate master key from user password using PBKDF2
   * Key is non-extractable and stored in IndexedDB
   */
  private async initializeMasterKey(password?: string): Promise<void> {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password || 'default-master-key'), // In production, require user password
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Generate salt (stored separately)
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    
    this.masterKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false, // ✅ Non-extractable
      ['encrypt', 'decrypt']
    );
    
    // Store salt for future key derivation
    await this.storeInDB('keys', { id: 'master-salt', salt: Array.from(salt) });
  }

  /**
   * Store API credentials with optional encryption
   */
  async storeCredentials(providerId: string, apiKey: string, options?: Partial<ProviderCredentials>): Promise<void> {
    if (!this.config.persistenceEnabled) {
      console.warn('Persistence disabled - credentials stored in memory only');
      return;
    }
    
    let storedKey = apiKey;
    
    if (this.config.encryptionEnabled && this.masterKey) {
      storedKey = await this.encrypt(apiKey);
    }
    
    const credentials: ProviderCredentials = {
      providerId,
      apiKey: storedKey,
      baseURL: options?.baseURL,
      organization: options?.organization,
      encryptedAt: new Date().toISOString()
    };
    
    await this.storeInDB('credentials', credentials);
  }

  /**
   * Retrieve and decrypt credentials
   */
  async getCredentials(providerId: string): Promise<string | null> {
    const credentials = await this.getFromDB<ProviderCredentials>('credentials', providerId);
    
    if (!credentials) return null;
    
    if (this.config.encryptionEnabled && this.masterKey) {
      return await this.decrypt(credentials.apiKey);
    }
    
    return credentials.apiKey;
  }

  /**
   * Encrypt data using AES-GCM
   */
  private async encrypt(data: string): Promise<string> {
    if (!this.masterKey) throw new Error('Master key not initialized');
    
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.masterKey,
      encoder.encode(data)
    );
    
    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt data using AES-GCM
   */
  private async decrypt(encryptedData: string): Promise<string> {
    if (!this.masterKey) throw new Error('Master key not initialized');
    
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.masterKey,
      data
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Clear all credentials (user logout)
   */
  async clearCredentials(): Promise<void> {
    const tx = this.db!.transaction('credentials', 'readwrite');
    const store = tx.objectStore('credentials');
    await store.clear();
    this.masterKey = null;
  }

  /**
   * Helper: Store data in IndexedDB
   */
  private async storeInDB(storeName: string, data: any): Promise<void> {
    const tx = this.db!.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.put(data);
  }

  /**
   * Helper: Get data from IndexedDB
   */
  private async getFromDB<T>(storeName: string, key: string): Promise<T | null> {
    const tx = this.db!.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }
}

export const credentialVault = new CredentialVault({
  persistenceEnabled: true,
  encryptionEnabled: true,
  autoLock: true,
  lockTimeout: 30
});
```

***

### **2. Dynamic Model Discovery Service**

```typescript
// lib/core/ai/model-registry.ts

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  costPer1kTokens: number;
  capabilities: string[];
  isFree: boolean;
}

interface ProviderConfig {
  id: string;
  name: string;
  baseURL: string;
  modelsEndpoint: string;
  sdkCompatibility: 'openai' | 'anthropic' | 'custom';
}

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    modelsEndpoint: 'https://openrouter.ai/api/v1/models',
    sdkCompatibility: 'openai'
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    modelsEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    sdkCompatibility: 'custom'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    modelsEndpoint: 'https://api.openai.com/v1/models',
    sdkCompatibility: 'openai'
  }
};

class ModelRegistry {
  private models: Map<string, ModelInfo[]> = new Map();
  private loading: Map<string, Promise<ModelInfo[]>> = new Map();

  /**
   * Fetch available models from provider API
   * Auto-refreshes when API key is added/changed
   */
  async fetchModels(providerId: string, apiKey: string): Promise<ModelInfo[]> {
    // Check cache
    if (this.models.has(providerId)) {
      return this.models.get(providerId)!;
    }

    // Prevent duplicate requests
    if (this.loading.has(providerId)) {
      return this.loading.get(providerId)!;
    }

    const config = PROVIDER_CONFIGS[providerId];
    if (!config) {
      throw new Error(Unknown provider: ${providerId});
    }

    const promise = this.fetchModelsFromAPI(config, apiKey);
    this.loading.set(providerId, promise);

    try {
      const models = await promise;
      this.models.set(providerId, models);
      return models;
    } finally {
      this.loading.delete(providerId);
    }
  }

  /**
   * Fetch models from provider API
   */
  private async fetchModelsFromAPI(config: ProviderConfig, apiKey: string): Promise<ModelInfo[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (config.sdkCompatibility === 'openai') {
      headers['Authorization'] = Bearer ${apiKey};
    } else {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(config.modelsEndpoint, { headers });
    
    if (!response.ok) {
      throw new Error(Failed to fetch models from ${config.name}: ${response.statusText});
    }

    const data = await response.json();
    
    // Transform to unified format
    return this.transformModels(config, data);
  }

  /**
   * Transform provider-specific model format to unified format
   */
  private transformModels(config: ProviderConfig, data: any): ModelInfo[] {
    if (config.id === 'openrouter') {
      return data.data.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        provider: config.id,
        contextWindow: model.context_length || 4096,
        costPer1kTokens: model.pricing?.prompt || 0,
        capabilities: this.inferCapabilities(model),
        isFree: model.pricing?.prompt === 0 || model.id.includes('free')
      }));
    }
    
    if (config.id === 'gemini') {
      return data.models.map((model: any) => ({
        id: model.name.replace('models/', ''),
        name: model.displayName,
        provider: config.id,
        contextWindow: model.inputTokenLimit || 8192,
        costPer1kTokens: 0, // Gemini Flash is free
        capabilities: ['text', 'vision'],
        isFree: true
      }));
    }
    
    // Default OpenAI format
    return data.data.map((model: any) => ({
      id: model.id,
      name: model.id,
      provider: config.id,
      contextWindow: 4096,
      costPer1kTokens: 0,
      capabilities: ['text'],
      isFree: false
    }));
  }

  /**
   * Infer model capabilities from metadata
   */
  private inferCapabilities(model: any): string[] {
    const caps: string[] = ['text'];
    
    if (model.architecture?.modality?.includes('vision')) caps.push('vision');
    if (model.id.includes('whisper')) caps.push('audio');
    if (model.id.includes('dall-e') || model.id.includes('imagen')) caps.push('image');
    if (model.top_provider?.is_moderated) caps.push('moderation');
    
    return caps;
  }

  /**
   * Get free models only
   */
  async getFreeModels(providerId: string, apiKey: string): Promise<ModelInfo[]> {
    const models = await this.fetchModels(providerId, apiKey);
    return models.filter(m => m.isFree);
  }

  /**
   * Clear cache (on API key change)
   */
  clearCache(providerId?: string): void {
    if (providerId) {
      this.models.delete(providerId);
    } else {
      this.models.clear();
    }
  }
}

export const modelRegistry = new ModelRegistry();
```

***

### **3. AI Provider Adapter Factory**

```typescript
// lib/core/ai/provider-adapter.ts

import { createOpenaiChat } from '@tanstack/ai-openai';
import type { ChatAdapter } from '@tanstack/ai';

interface AdapterConfig {
  providerId: string;
  apiKey: string;
  baseURL?: string;
  organization?: string;
  defaultModel?: string;
}

class ProviderAdapterFactory {
  /**
   * Create TanStack AI adapter for any OpenAI-compatible provider
   */
  createAdapter(config: AdapterConfig): (model: string) => ChatAdapter {
    const providerConfig = PROVIDER_CONFIGS[config.providerId];
    
    if (!providerConfig) {
      throw new Error(Unknown provider: ${config.providerId});
    }

    // OpenRouter, OpenAI, and other OpenAI-compatible providers
    if (providerConfig.sdkCompatibility === 'openai') {
      const adapter = createOpenaiChat(config.apiKey, {
        baseURL: config.baseURL || providerConfig.baseURL,
        organization: config.organization
      });
      
      return adapter;
    }

    // Custom adapters for non-OpenAI providers
    if (providerConfig.id === 'gemini') {
      return this.createGeminiAdapter(config);
    }

    throw new Error(Unsupported provider SDK: ${providerConfig.sdkCompatibility});
  }

  /**
   * Create custom Gemini adapter (TanStack AI doesn't have official support yet)
   */
  private createGeminiAdapter(config: AdapterConfig): (model: string) => ChatAdapter {
    // Custom implementation for Gemini API
    // This would need to implement TanStack AI's ChatAdapter interface
    throw new Error('Gemini adapter not yet implemented - use OpenRouter with Gemini models instead');
  }

  /**
   * Test adapter connection
   */
  async testConnection(config: AdapterConfig): Promise<{ success: boolean; error?: string }> {
    try {
      const adapter = this.createAdapter(config);
      
      // Simple test chat
      const { chat } = await import('@tanstack/ai');
      
      const stream = chat({
        adapter: adapter(config.defaultModel || 'gpt-3.5-turbo'),
        messages: [{ role: 'user', content: 'Hello' }]
      });

      // Consume first chunk
      for await (const chunk of stream) {
        if (chunk.text) {
          return { success: true };
        }
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const providerAdapter = new ProviderAdapterFactory();
```

***

### **4. Agent Configuration Manager**

```typescript
// lib/core/agents/agent-config.ts

interface AgentConfig {
  agentId: string;
  name: string;
  role: 'architect' | 'coding' | 'testing' | 'reviewer';
  providerId: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

class AgentConfigManager {
  private configs: Map<string, AgentConfig> = new Map();
  
  async initialize(): Promise<void> {
    // Load from IndexedDB
    const tx = credentialVault['db']!.transaction('agent-configs', 'readonly');
    const store = tx.objectStore('agent-configs');
    const request = store.getAll();
    
    request.onsuccess = () => {
      request.result.forEach((config: AgentConfig) => {
        this.configs.set(config.agentId, config);
      });
    };
  }

  async saveConfig(config: AgentConfig): Promise<void> {
    config.updatedAt = new Date().toISOString();
    
    this.configs.set(config.agentId, config);
    
    // Persist to IndexedDB
    const tx = credentialVault['db']!.transaction('agent-configs', 'readwrite');
    const store = tx.objectStore('agent-configs');
    await store.put(config);
  }

  getConfig(agentId: string): AgentConfig | undefined {
    return this.configs.get(agentId);
  }

  getAllConfigs(): AgentConfig[] {
    return Array.from(this.configs.values());
  }

  async deleteConfig(agentId: string): Promise<void> {
    this.configs.delete(agentId);
    
    const tx = credentialVault['db']!.transaction('agent-configs', 'readwrite');
    const store = tx.objectStore('agent-configs');
    await store.delete(agentId);
  }
}

export const agentConfigManager = new AgentConfigManager();
```

***

### **5. Testing & Scaffolding System**

```typescript
// lib/core/testing/agent-test-runner.ts

interface TestScenario {
  id: string;
  name: string;
  description: string;
  agentId: string;
  input: any;
  expectedOutput?: any;
  validationFn?: (output: any) => boolean;
}

interface TestResult {
  scenarioId: string;
  success: boolean;
  output: any;
  error?: string;
  duration: number;
  timestamp: string;
}

class AgentTestRunner {
  /**
   * Run test scenario for agent
   */
  async runTest(scenario: TestScenario): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      const config = agentConfigManager.getConfig(scenario.agentId);
      if (!config) {
        throw new Error(Agent config not found: ${scenario.agentId});
      }

      const apiKey = await credentialVault.getCredentials(config.providerId);
      if (!apiKey) {
        throw new Error(No API key for provider: ${config.providerId});
      }

      const adapter = providerAdapter.createAdapter({
        providerId: config.providerId,
        apiKey,
        defaultModel: config.modelId
      });

      // Execute agent with test input
      const { chat } = await import('@tanstack/ai');
      
      const stream = chat({
        adapter: adapter(config.modelId),
        messages: [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: JSON.stringify(scenario.input) }
        ],
        modelOptions: {
          temperature: config.temperature,
          max_tokens: config.maxTokens
        }
      });

      let output = '';
      for await (const chunk of stream) {
        if (chunk.text) output += chunk.text;
      }

      const duration = performance.now() - startTime;

      // Validate output
      let success = true;
      if (scenario.validationFn) {
        success = scenario.validationFn(output);
      }

      return {
        scenarioId: scenario.id,
        success,
        output,
        duration,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        scenarioId: scenario.id,
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: performance.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Run all tests for an agent
   */
  async runAgentTests(agentId: string, scenarios: TestScenario[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const scenario of scenarios) {
      console.log(Running test: ${scenario.name});
      const result = await this.runTest(scenario);
      results.push(result);
      
      // Log result for visibility
      console.log(✓ ${scenario.name}: ${result.success ? 'PASS' : 'FAIL'} (${result.duration.toFixed(0)}ms));
    }
    
    return results;
  }
}

export const agentTestRunner = new AgentTestRunner();
```

***

### **6. Browser Automation Test Integration**

```typescript
// lib/core/testing/browser-automation.ts

interface BrowserTest {
  testId: string;
  url: string;
  actions: BrowserAction[];
  assertions: BrowserAssertion[];
}

interface BrowserAction {
  type: 'click' | 'type' | 'wait' | 'navigate';
  selector?: string;
  value?: string;
  timeout?: number;
}

interface BrowserAssertion {
  type: 'elementExists' | 'textContains' | 'urlMatches';
  selector?: string;
  expected?: string;
}

class BrowserAutomationTester {
  /**
   * Run browser test using Chrome DevTools Protocol (CDP)
   * Note: This requires chrome.debugger API permission
   */
  async runBrowserTest(test: BrowserTest): Promise<{ success: boolean; logs: string[] }> {
    const logs: string[] = [];
    
    try {
      // Create new tab
      logs.push(Opening URL: ${test.url});
      const tab = await chrome.tabs.create({ url: test.url, active: false });
      
      // Attach debugger
      await chrome.debugger.attach({ tabId: tab.id! }, '1.3');
      
      // Enable DOM and Runtime
      await this.sendCommand(tab.id!, 'DOM.enable');
      await this.sendCommand(tab.id!, 'Runtime.enable');
      
      // Execute actions
      for (const action of test.actions) {
        logs.push(Executing: ${action.type} ${action.selector || ''});
        await this.executeAction(tab.id!, action);
      }
      
      // Run assertions
      for (const assertion of test.assertions) {
        logs.push(Asserting: ${assertion.type});
        const result = await this.runAssertion(tab.id!, assertion);
        if (!result) {
          throw new Error(Assertion failed: ${assertion.type});
        }
      }
      
      // Cleanup
      await chrome.debugger.detach({ tabId: tab.id! });
      await chrome.tabs.remove(tab.id!);
      
      return { success: true, logs };
    } catch (error) {
      logs.push(ERROR: ${error instanceof Error ? error.message : 'Unknown error'});
      return { success: false, logs };
    }
  }

  private async sendCommand(tabId: number, method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.debugger.sendCommand({ tabId }, method, params, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  }

  private async executeAction(tabId: number, action: BrowserAction): Promise<void> {
    switch (action.type) {
      case 'click':
        await this.sendCommand(tabId, 'Runtime.evaluate', {
          expression: document.querySelector('${action.selector}').click() 
        });
        break;
      
      case 'type':
        await this.sendCommand(tabId, 'Runtime.evaluate', {
          expression: document.querySelector('${action.selector}').value = '${action.value}' 
        });
        break;
      
      case 'wait':
        await new Promise(resolve => setTimeout(resolve, action.timeout || 1000));
        break;
    }
  }

  private async runAssertion(tabId: number, assertion: BrowserAssertion): Promise<boolean> {
    const result = await this.sendCommand(tabId, 'Runtime.evaluate', {
      expression: document.querySelector('${assertion.selector}') !== null,
      returnByValue: true
    });
    
    return result.result.value;
  }
}

export const browserTester = new BrowserAutomationTester();
```

***

## 🎨 **UI Components for Configuration**

### **Provider & Model Selection UI**

```tsx
// components/ai-config/provider-setup.tsx

'use client';

import { useState, useEffect } from 'react';
import { credentialVault } from '@/lib/core/security/credential-vault';
import { modelRegistry } from '@/lib/core/ai/model-registry';
import { providerAdapter } from '@/lib/core/ai/provider-adapter';

export function ProviderSetup() {
  const [providerId, setProviderId] = useState('openrouter');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  // Load models when API key is entered
  const handleFetchModels = async () => {
    if (!apiKey) return;
    
    try {
      const availableModels = await modelRegistry.fetchModels(providerId, apiKey);
      setModels(availableModels);
      
      // Auto-select first free model
      const freeModel = availableModels.find(m => m.isFree);
      if (freeModel) setSelectedModel(freeModel.id);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  // Test connection
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await providerAdapter.testConnection({
        providerId,
        apiKey,
        defaultModel: selectedModel
      });
      
      setTestResult(result);
      
      if (result.success) {
        // Save credentials
        await credentialVault.storeCredentials(providerId, apiKey, {
          baseURL: PROVIDER_CONFIGS[providerId].baseURL
        });
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold">AI Provider Setup</h2>
      
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Provider</label>
        <select
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="openrouter">OpenRouter (Free Models Available)</option>
          <option value="gemini">Google Gemini</option>
          <option value="openai">OpenAI</option>
        </select>
      </div>

      {/* API Key Input */}
      <div>
        <label className="block text-sm font-medium mb-2">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-or-v1-..."
          className="w-full border rounded px-3 py-2 font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          ✓ Encrypted with AES-256-GCM • Stored locally in IndexedDB • Never sent to our servers
        </p>
      </div>

      {/* Fetch Models */}
      <button
        onClick={handleFetchModels}
        disabled={!apiKey}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Load Available Models
      </button>

      {/* Model Selection */}
      {models.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Model ({models.filter(m => m.isFree).length} free models available)
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <optgroup label="Free Models">
              {models.filter(m => m.isFree).map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.contextWindow.toLocaleString()} tokens
                </option>
              ))}
            </optgroup>
            <optgroup label="Paid Models">
              {models.filter(m => !m.isFree).map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} - ${model.costPer1kTokens}/1K tokens
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      )}

      {/* Test Connection */}
      {selectedModel && (
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      )}

      {/* Test Result */}
      {testResult && (
        <div className={p-4 rounded ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}}>
          <p className="font-medium">{testResult.success ? '✓ Connection successful!' : '✗ Connection failed'}</p>
          {testResult.error && <p className="text-sm text-red-600 mt-1">{testResult.error}</p>}
        </div>
      )}
    </div>
  );
}
```

***

## 📊 **Key Benefits of This Architecture**

1. **✅ Battle-Tested Security**
   - AES-256-GCM encryption[4][5]
   - Non-extractable CryptoKeys[6]
   - PBKDF2 key derivation with 100,000 iterations[7]

2. **✅ Dynamic Model Loading**
   - No hardcoded models
   - Auto-refreshes when API key changes
   - Free model filtering[8][9]

3. **✅ OpenRouter Compatibility**
   - TanStack AI's baseURL parameter works perfectly[1]
   - Access to 500+ models[10]
   - Free tier includes Gemini Flash 2.0, Llama 3.1, Claude Haiku[3]

4. **✅ Scaffolding & Testability**
   - Agent test runner for isolated testing
   - Browser automation via Chrome DevTools Protocol
   - Mediocre-friendly error messages

5. **✅ User Control**
   - Optional persistence toggle
   - Encryption on/off
   - Clear credentials anytime
   - No server-side dependencies[11][12]

***
```

---
And of course if all front-end and back-end have been mapped and wired to get to this stage
```

And  you have answered this "_bmad-output\validation\e2e-testing-readiness-validation-2025-12-24.md"


Nothing has worked on the frontend

* 1. Chat interface on the IDE is the mocked one (it is not wired to anything real) - And even if it is wired the UX UI sure does not suffice what needed for a reallife coding agent having a conversation with multiple block types, let alone tools executions that result in CRUD permissions or operate local files etc

* 2.3.4: the rest like terminal, filetree, editor is not testable because the chat platform does not show anything

* 5: configuration of agent (of sidebar on the right)  is almost useless: lack configuration of parameters 
-- not persistent at all
-- of course is not wired or connected to anything nor does it make any senses

---
A total disastrous that I'm sure not expected and extremely pissed