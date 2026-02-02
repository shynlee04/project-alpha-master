---
phase: B-ai-gateway
plan: 04
type: execute
wave: 3
depends_on: ["B-02", "B-03"]
files_modified:
  - src/infrastructure/ai/gateway/ai-gateway.ts
autonomous: true

must_haves:
  truths:
    - "chat() method streams responses from OpenRouter or Gemini"
    - "generate() method returns text from specified provider"
    - "Both methods work with vault credentials (client) and request credentials (server)"
  artifacts:
    - path: "src/infrastructure/ai/gateway/ai-gateway.ts"
      provides: "Fully implemented chat() and generate() methods"
      min_lines: 150
  key_links:
    - from: "AIGateway.chat()"
      to: "TanStack AI chat()"
      via: "adapter from createAdapter()"
      pattern: "chat\\(\\{\\s*adapter"
    - from: "AIGateway.generate()"
      to: "createAdapter()"
      via: "text generation adapter"
      pattern: "this\\.createAdapter"
---

<objective>
Implement the chat() and generate() methods in AIGateway to enable streaming chat and text generation.

Purpose: These are the core methods that all AI consumers (Chat-Cascade, Notes, etc.) will use. The gateway provides unified access with automatic credential handling.

Output: Fully functional chat() and generate() methods with proper streaming support.
</objective>

<execution_context>
@./.opencode/get-shit-done/workflows/execute-plan.md
@./.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PRIORITY-0-AI-GATEWAY-ARCHITECTURE-2026-02-02.md
@.planning/phases/B-ai-gateway/B-02-SUMMARY.md
@.planning/phases/B-ai-gateway/B-03-SUMMARY.md

# TanStack AI chat patterns from PRIORITY-0 Part 5.3
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implement chat() Method</name>
  <files>src/infrastructure/ai/gateway/ai-gateway.ts</files>
  <action>
Replace the skeleton chat() method with full implementation:

```typescript
import { chat as tanstackChat, toolDefinition } from '@tanstack/ai';

// ... existing code ...

  /**
   * Streaming chat completion
   * 
   * Supports all providers via their respective adapters.
   * Handles tool calling if tools are provided and model supports them.
   * 
   * @param options - Chat options including messages, model, and optional tools
   * @yields ChatChunk - Streaming chunks (content, tool_call, tool_result, done, error)
   * 
   * @example
   * ```typescript
   * // Client-side (uses vault)
   * for await (const chunk of aiGateway.chat({
   *   provider: 'openrouter',
   *   model: 'anthropic/claude-3.5-sonnet',
   *   messages: [{ role: 'user', content: 'Hello!' }],
   * })) {
   *   if (chunk.type === 'content') console.log(chunk.delta);
   * }
   * 
   * // Server-side (uses request credentials)
   * const gateway = createServerGateway(apiKey, 'openrouter');
   * for await (const chunk of gateway.chat({ ... })) { ... }
   * ```
   */
  async *chat(options: ChatOptions): AsyncIterable<ChatChunk> {
    const { provider, model, messages, tools, credentials } = options;
    
    try {
      // Get API key from appropriate source
      const apiKey = await this.getApiKey(provider, credentials);
      
      // Create provider-specific adapter
      const adapter = this.createAdapter(provider, model, apiKey);
      
      // Check tool support
      const supportedTools = tools && this.modelSupportsTools(model) ? tools : undefined;
      
      if (tools && !supportedTools) {
        console.warn(`Model ${model} does not support tools, ignoring tools parameter`);
      }
      
      // Start streaming chat
      const stream = tanstackChat({
        adapter,
        messages: messages.map(m => ({
          role: m.role as 'system' | 'user' | 'assistant',
          content: typeof m.content === 'string' 
            ? m.content 
            : JSON.stringify(m.content),
        })),
        tools: supportedTools,
      });
      
      // Transform TanStack AI stream to our ChatChunk format
      for await (const event of stream) {
        if (typeof event === 'string') {
          // Text content
          yield { type: 'content', delta: event };
        } else if (event && typeof event === 'object') {
          // Handle different event types from TanStack AI
          if ('type' in event) {
            switch (event.type) {
              case 'text':
                yield { type: 'content', delta: event.text };
                break;
              case 'tool_call':
                yield {
                  type: 'tool_call',
                  name: event.name,
                  args: event.args,
                };
                break;
              case 'tool_result':
                yield {
                  type: 'tool_result',
                  name: event.name,
                  output: event.output,
                };
                break;
              case 'done':
                yield { type: 'done' };
                break;
              default:
                // Unknown event type, skip
                break;
            }
          }
        }
      }
      
      yield { type: 'done' };
    } catch (error) {
      yield {
        type: 'error',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
```

IMPORTANT:
- Wrap everything in try/catch for graceful error handling
- Transform TanStack AI events to our ChatChunk type
- Check tool support before passing tools
- Support both string and ContentPart[] message content
  </action>
  <verify>
    pnpm typecheck:fast | grep -E "(ai-gateway|error)" || echo "No errors"
  </verify>
  <done>
    - chat() method fully implemented
    - Streams content chunks
    - Handles tool calls if supported
    - Error handling yields error chunks
    - TypeScript compiles
  </done>
</task>

<task type="auto">
  <name>Task 2: Implement generate() Method</name>
  <files>src/infrastructure/ai/gateway/ai-gateway.ts</files>
  <action>
Replace the skeleton generate() method with implementation:

```typescript
  /**
   * Generate content (text, image, audio, video, storyboard)
   * 
   * Routes to appropriate provider and generation method based on type.
   * Currently implements text generation; media generation is Phase C.
   * 
   * @param options - Generation options including type, provider, and prompt
   * @returns Generated content based on type
   */
  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const { type, provider, model, prompt, credentials } = options;
    
    const apiKey = await this.getApiKey(provider, credentials);
    
    switch (type) {
      case 'text':
        return this.generateText(apiKey, options);
      
      case 'image':
        // Placeholder for Phase C (Notes AI Migration)
        throw new Error('Image generation not yet implemented - Phase C');
      
      case 'audio':
        // Placeholder for Phase C
        throw new Error('Audio generation not yet implemented - Phase C');
      
      case 'video':
        // Placeholder for Phase C
        throw new Error('Video generation not yet implemented - Phase C');
      
      case 'storyboard':
        // Placeholder for Phase C
        throw new Error('Storyboard generation not yet implemented - Phase C');
      
      default:
        throw new Error(`Unknown generation type: ${type}`);
    }
  }

  /**
   * Generate text content
   * 
   * Collects streaming response into a single result.
   */
  private async generateText(
    apiKey: string,
    options: GenerateOptions
  ): Promise<GenerateResult> {
    const { provider, model, prompt, input } = options;
    
    // Build messages for chat call
    const messages: Message[] = [];
    
    // Add image context if provided
    if (input?.images?.length) {
      // For vision models, include images in the user message
      const imageContent = input.images.map(img => ({
        type: 'image' as const,
        image_url: {
          url: img.url ?? (img.base64 ? `data:image/png;base64,${img.base64}` : ''),
        },
      }));
      
      messages.push({
        role: 'user',
        content: [
          ...imageContent,
          { type: 'text', text: prompt },
        ],
      });
    } else {
      messages.push({
        role: 'user',
        content: prompt,
      });
    }
    
    // Collect streamed response
    let text = '';
    
    for await (const chunk of this.chat({
      provider,
      model: model ?? 'gemini-2.0-flash',
      messages,
      credentials: { type: 'request', apiKey },
    })) {
      if (chunk.type === 'content' && chunk.delta) {
        text += chunk.delta;
      }
      if (chunk.type === 'error') {
        throw new Error(chunk.error);
      }
    }
    
    return { text };
  }
```

IMPORTANT:
- Text generation collects streaming response
- Image/audio/video throw "not implemented" for Phase C
- Vision input builds multimodal message content
- Uses internal chat() method for consistency
  </action>
  <verify>
    pnpm typecheck:fast | grep -E "(ai-gateway|error)" || echo "No errors"
  </verify>
  <done>
    - generate() method implemented
    - Text generation works via chat()
    - Vision input supported for text generation
    - Media types throw Phase C placeholders
    - TypeScript compiles
  </done>
</task>

<task type="auto">
  <name>Task 3: Add Message Type Import and Fix Types</name>
  <files>src/infrastructure/ai/gateway/ai-gateway.ts</files>
  <action>
Ensure all imports are correct and types are properly used:

1. Update imports at top of file:
```typescript
import { chat as tanstackChat } from '@tanstack/ai';
import { credentialVault } from '../credential-vault';
import { createOpenRouterAdapter, createGeminiAdapter, generateEmbeddings } from '../adapters';
import type {
  AIProvider,
  AIGatewayConfig,
  CredentialSource,
  ChatOptions,
  GenerateOptions,
  EmbedOptions,
  TranscribeOptions,
  ChatChunk,
  GenerateResult,
  Message,
} from './types';
```

2. Verify the file compiles and runs basic type checking:
```bash
pnpm typecheck:fast
```

3. If there are any type issues with TanStack AI, add type assertions:
```typescript
// If needed for TanStack AI compatibility
const stream = tanstackChat({
  adapter,
  messages: messages as any[], // TanStack AI has flexible message types
  tools: supportedTools,
});
```

Only add `as any` if TypeScript errors occur - prefer proper typing.
  </action>
  <verify>
    pnpm typecheck:fast | grep -E "(ai-gateway|error)" || echo "No errors"
  </verify>
  <done>
    - All imports correctly specified
    - No TypeScript errors in gateway
    - chat() and generate() both functional
    - File ready for integration testing
  </done>
</task>

</tasks>

<verification>
Run after all tasks complete:

```bash
# TypeScript compilation
pnpm typecheck:fast

# Governance checks
pnpm governance

# File size check (should be ~150-200 lines)
wc -l src/infrastructure/ai/gateway/ai-gateway.ts
```
</verification>

<success_criteria>
- [ ] `chat()` method fully implemented with streaming
- [ ] `generate()` method implemented for text
- [ ] Tool calling supported when model supports it
- [ ] Error handling yields error chunks
- [ ] Vision input supported in generate()
- [ ] Media types throw Phase C placeholders
- [ ] `pnpm typecheck:fast` passes with 0 new errors
- [ ] `pnpm governance` passes
- [ ] File is 150-200 lines (reasonable size)
</success_criteria>

<output>
After completion, create `.planning/phases/B-ai-gateway/B-04-SUMMARY.md`
</output>
