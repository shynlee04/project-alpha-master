# Gemini 2026 Multimodality with TanStack AI SDK - Research Report

**Date:** 2026-01-09
**Epic:** Research Phase for Multimodal AI Integration
**Status:** Complete

---

## Executive Summary

This research document covers implementing multimodality with Google Gemini 2026 API (Gemini 2.5 series) integrated with TanStack AI SDK. Key findings include:

- **Gemini 2.5 Flash/Pro** offer native multimodal support (text, images, audio, video, documents)
- **Gemini 2.5 Flash Image** provides state-of-the-art image generation and editing
- **Gemini Live API** enables real-time bidirectional audio/video communication
- **TanStack AI SDK v0.2.0** provides unified abstraction with `@tanstack/ai-gemini` adapter
- **Existing codebase** has robust credential vault infrastructure ready for Gemini API keys

---

## 1. Gemini 2026 API Multimodal Capabilities

### 1.1 Model Overview (January 2026)

| Model | Context | Modalities | Special Features |
|-------|---------|------------|------------------|
| `gemini-2.5-pro` | 1M tokens | Text, Image, Audio, Video, Document | Thinking, Enhanced reasoning |
| `gemini-2.5-flash` | 1M tokens | Text, Image, Audio, Video, Document | Fast, cost-effective |
| `gemini-2.5-flash-lite` | 1M tokens | Text, Image, Audio, Video, Document | Lightweight |
| `gemini-2.5-flash-live-preview` | Session | Text, Audio (native output), Video | Real-time bidirectional |
| `gemini-2.5-flash-image-preview` | 1290 tokens/image | Image generation/editing | $0.039/image, multi-image fusion |

### 1.2 Image Input/Output Capabilities

**Image Input (Vision):**
- Supported formats: JPEG, PNG, GIF, WebP
- Base64 encoding for inline data
- URL-based image references
- Maximum image size: Model dependent (typically up to 4096px for Gemini 3 Pro Image)

**Image Output (Generation):**
- Model: `gemini-2.5-flash-image-preview` (aka "nano-banana")
- Pricing: $30.00 per 1M output tokens (~$0.039 per image at 1290 tokens)
- Features:
  - Multi-image fusion (blend multiple images)
  - Character consistency across generations
  - Prompt-based targeted editing
  - Native world knowledge integration
  - SynthID watermarking

### 1.3 Document Input/Output Capabilities

**Document Input:**
- PDF processing with native understanding
- Document type support: PDF (primary), others via text extraction
- Page-by-page analysis capability
- Combines vision + text extraction

### 1.4 Voice/Audio as Natural Speech

**Audio Input:**
- Formats: PCM, WAV, MP3, and others
- Sample rate: 16kHz recommended
- Speech-to-text understanding

**Audio Output (Live API):**
- Model: `gemini-2.5-flash-native-audio-preview-09-2025`
- 30 HD voices in 24 languages
- Natural-sounding voice interactions
- Real-time bidirectional audio streaming

### 1.5 Latest Model Loading per Modality

```typescript
// Modality-specific model selection
const MODELS = {
  // Text + Image/Audio/Video input (general)
  textMultimodal: 'gemini-2.5-flash',

  // Image generation/editing
  imageGeneration: 'gemini-2.5-flash-image-preview',

  // Real-time audio with native speech output
  liveAudio: 'gemini-2.5-flash-native-audio-preview-09-2025',

  // High-reasoning tasks
  reasoning: 'gemini-2.5-pro',
};
```

---

## 2. TanStack AI SDK Integration

### 2.1 Package Installation

```bash
# Core packages (already installed in project)
pnpm install @tanstack/ai @tanstack/ai-client @tanstack/ai-react

# Gemini adapter (already installed in project)
pnpm install @tanstack/ai-gemini

# Alternative: Direct Google SDK (for advanced features)
pnpm install @google/genai
```

### 2.2 Basic Adapter Configuration

```typescript
import { chat } from '@tanstack/ai';
import { gemini } from '@tanstack/ai-gemini';

// Using environment variable or API key from vault
const apiKey = await credentialVault.getCredentials('gemini');

const adapter = gemini({
  apiKey: apiKey || process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta', // Optional
});

const stream = chat({
  adapter,
  messages: [{ role: 'user', content: 'Hello!' }],
  model: 'gemini-2.5-flash',
});
```

### 2.3 Adapter Patterns

**Pattern 1: Direct Adapter (Simple)**
```typescript
import { gemini } from '@tanstack/ai-gemini';

const adapter = gemini({ apiKey: 'your-key' });
```

**Pattern 2: Dynamic API Key (Recommended for Via-gent)**
```typescript
import { gemini, type GeminiConfig } from '@tanstack/ai-gemini';

const createGeminiAdapter = async () => {
  const apiKey = await credentialVault.getCredentials('gemini');
  if (!apiKey) throw new Error('Gemini API key not found');

  return gemini({ apiKey } as GeminiConfig);
};
```

**Pattern 3: Provider Factory (Current Implementation)**
```typescript
// src/lib/agent/providers/provider-adapter.ts
export class ProviderAdapterFactory {
  static create(type: 'gemini' | 'anthropic' | 'openrouter', config: AdapterConfig) {
    switch (type) {
      case 'gemini':
        return gemini({ apiKey: config.apiKey });
      // ... other providers
    }
  }
}
```

### 2.4 Streaming Support

TanStack AI supports streaming out of the box:

```typescript
import { chat, toStreamResponse } from '@tanstack/ai';
import { gemini } from '@tanstack/ai-gemini';

// Server-side streaming
export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = chat({
    adapter: gemini({ apiKey: getApiKey() }),
    messages,
    model: 'gemini-2.5-flash',
  });

  return toStreamResponse(stream);
}

// Client-side streaming with React hook
const { messages, sendMessage, isLoading } = useChat({
  connection: fetchServerSentEvents('/api/chat', () => ({ /* config */ })),
});
```

---

## 3. End-to-End Wiring Requirements

### 3.1 API Key Management (Vault Integration)

**Existing Infrastructure:**
- File: `/Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/providers/credential-vault.ts`
- Uses AES-256-GCM encryption with Web Crypto API
- Stores in IndexedDB with localStorage key management
- SSR-safe implementation

**Gemini Integration:**
```typescript
// Store Gemini API key
await credentialVault.storeCredentials('gemini', process.env.GEMINI_API_KEY);

// Retrieve for adapter creation
const apiKey = await credentialVault.getCredentials('gemini');

// Check if exists
const hasKey = await credentialVault.hasCredentials('gemini');
```

### 3.2 Model Loading/Switching per Modality

```typescript
// src/lib/agent/providers/model-registry.ts (extension needed)
export const GEMINI_MODELS = {
  // Text + Multimodal input
  'gemini-2.5-flash': {
    modalities: ['text', 'image', 'audio', 'video', 'document'],
    streaming: true,
    thinking: true,
  },
  'gemini-2.5-pro': {
    modalities: ['text', 'image', 'audio', 'video', 'document'],
    streaming: true,
    thinking: true,
    enhancedReasoning: true,
  },

  // Image generation
  'gemini-2.5-flash-image-preview': {
    modalities: ['image-output'],
    pricing: '$0.039/image',
  },

  // Live audio
  'gemini-2.5-flash-native-audio-preview-09-2025': {
    modalities: ['text', 'audio-input', 'audio-output'],
    streaming: true,
    realTime: true,
  },
};

// Model selector based on modality requirements
function selectModelForTask(modality: string, options?: { reasoning?: boolean }) {
  if (modality === 'image-output') return 'gemini-2.5-flash-image-preview';
  if (modality === 'live-audio') return 'gemini-2.5-flash-native-audio-preview-09-2025';
  if (options?.reasoning) return 'gemini-2.5-pro';
  return 'gemini-2.5-flash';
}
```

### 3.3 Permission Handling

**Existing Infrastructure:**
- File: `/Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/tool-permission/`
- Supports tool approval workflow
- Extensible to media permissions

**Media-Specific Permissions:**
```typescript
// Extend permission system for media
export interface MediaPermission {
  type: 'camera' | 'microphone' | 'file-upload';
  mimeType?: string;
  maxSize?: number;
}

// Permission check before media capture
async function requestMediaPermission(type: MediaPermission['type']): Promise<boolean> {
  const permissions = useToolPermissionStore.getState();

  if (type === 'camera') {
    return permissions.checkPermission('media.camera');
  }
  // ... other media types
}
```

---

## 4. Bidirectional Multimodality

### 4.1 Chat Agents - Receive/Send Images, Audio, Documents

**Input Flow (User -> AI):**
```typescript
import { buildMultimodalMessage } from '../lib/agent/multimodal/message-builder';

// Already exists in codebase!
interface ImageContent {
  base64: string;
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
}

// Sending multimodal message
const sendMessageWithImage = (text: string, images: ImageContent[]) => {
  const message = buildMultimodalMessage(text, images);
  sendMessage(message);
};
```

**Output Flow (AI -> User):**

TanStack AI SDK handles streaming responses with mixed content types:

```typescript
// Response parser for multimodal output
function parseMultimodalResponse(parts: MessagePart[]) {
  const results = {
    text: '',
    images: [] as string[],
    audio: null as string | null,
  };

  for (const part of parts) {
    if (part.type === 'text') {
      results.text += part.content;
    } else if (part.type === 'image') {
      results.images.push(part.source.value);
    } else if (part.type === 'audio') {
      results.audio = part.source.value;
    }
  }

  return results;
}
```

### 4.2 AI Tools in Notes - Generate Images, Audio Content

**Image Generation Tool:**
```typescript
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

// Tool definition
const generateImageDef = toolDefinition({
  name: 'generate_image',
  description: 'Generate an image from a text description using Gemini',
  inputSchema: z.object({
    prompt: z.string().describe('Detailed description of the image to generate'),
    style: z.string().optional().describe('Style guidelines (e.g., photorealistic, cartoon)'),
    aspectRatio: z.string().optional().describe('Aspect ratio (e.g., 16:9, 1:1)'),
  }),
});

// Server implementation
const generateImage = generateImageDef.server(async ({ prompt, style, aspectRatio }) => {
  // Use direct Gemini SDK for image generation
  const { GoogleGenAI } = await import('@google/genai');
  const apiKey = await credentialVault.getCredentials('gemini');

  const ai = new GoogleGenAI({ apiKey });

  const enhancedPrompt = style
    ? `${prompt}. Style: ${style}`
    : prompt;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: enhancedPrompt,
  });

  // Extract base64 image from response
  for (const part of response.candidates[0].content.parts) {
    if (part.inline_data) {
      return {
        image: `data:image/png;base64,${part.inline_data.data}`
      };
    }
  }

  throw new Error('No image generated');
});
```

**Audio Generation Tool (Text-to-Speech):**
```typescript
const generateAudioDef = toolDefinition({
  name: 'generate_audio',
  description: 'Generate natural speech audio from text using Gemini Live API',
  inputSchema: z.object({
    text: z.string().describe('Text to convert to speech'),
    voice: z.string().optional().describe('Voice name (default: natural)'),
  }),
});

const generateAudio = generateAudioDef.server(async ({ text, voice }) => {
  // Requires Live API connection for native audio
  const response = await fetch('/api/tts', {
    method: 'POST',
    body: JSON.stringify({ text, voice, model: 'gemini-2.5-flash-native-audio-preview' }),
  });

  return { audioUrl: await response.text() };
});
```

---

## 5. Prompt Engineering Techniques

### 5.1 Inline Prompting

**Direct Prompt Structure:**
```typescript
const prompt = `
<task>
Generate a photorealistic image of a futuristic workspace setup
</task>

<constraints>
- Include dual monitors
- 8-bit aesthetic influence
- Clean, organized desk
- Natural lighting from window
</constraints>

<style>
High quality, detailed, cinematic lighting
</style>
`;
```

### 5.2 Multi-Step Transformations

**Pattern: Image Context -> Prompt Suggestion -> Generate**

```typescript
// Step 1: Analyze image for context
const analyzePrompt = buildMultimodalMessage(
  'Describe the key visual elements in this image that could be used to generate a similar style image.',
  [{ base64: capturedImage, mimeType: 'image/jpeg' }]
);

const analysis = await chat({ adapter, messages: [analyzePrompt] });

// Step 2: Generate style prompt
const stylePrompt = `
Based on this image description: "${analysis}"

Create a detailed prompt for generating a new image with:
- Similar composition
- Different subject matter: [USER SUBJECT]
- Same artistic style and color palette
`;

// Step 3: Generate new image
const finalPrompt = await chat({
  adapter,
  messages: [{ role: 'user', content: stylePrompt }]
});
```

### 5.3 Sequential Image Generation (Story Continuation)

```typescript
interface StoryFrame {
  frame: number;
  description: string;
  characters: string[];
  setting: string;
}

async function generateStoryContinuation(frames: StoryFrame[], newFrameDescription: string) {
  // Build context from previous frames
  const context = frames.map(f =>
    `Frame ${f.frame}: ${f.description} (${f.setting}, characters: ${f.characters.join(', ')})`
  ).join('\n');

  const prompt = `
<story_context>
${context}
</story_context>

<new_frame>
${newFrameDescription}
</new_frame>

<instructions>
Generate a new image that continues this visual story.
Maintain:
- Character consistency (same appearance for: ${frames[0]?.characters.join(', ')})
- Setting continuity (same environment: ${frames[0]?.setting})
- Visual style consistency across all frames
</instructions>
`;

  return generateImage({ prompt });
}
```

### 5.4 Gemini 3 Specific Prompting

For Gemini 3 models (when available), use structured prompting:

```typescript
const gemini3Prompt = `
<role>
You are a specialized multimodal AI assistant for creative content generation.
</role>

<instructions>
1. **Plan**: Analyze the request for visual elements
2. **Execute**: Generate detailed image prompt
3. **Validate**: Ensure all constraints are met
</instructions>

<constraints>
- Verbosity: Low (concise prompts work best)
- Output: Single image generation prompt only
</constraints>

<context>
User request: ${userRequest}
Previous context: ${contextData}
</context>

<task>
Create an image generation prompt for: ${userRequest}
</task>
`;
```

---

## 6. Potential Pitfalls and Solutions

### 6.1 Image Size/Format Issues

**Pitfall:** Images too large or unsupported format

**Solution:**
```typescript
async function normalizeImageForGemini(file: File): Promise<ImageContent> {
  // Validate format
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Unsupported image type: ${file.type}`);
  }

  // Resize if needed (max 4096px)
  const bitmap = await createImageBitmap(file);
  const maxDimension = 4096;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));

  if (scale < 1) {
    const canvas = new OffscreenCanvas(bitmap.width * scale, bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await canvas.convertToBlob({ type: file.type });
    return {
      base64: await blobToBase64(blob),
      mimeType: file.type as ImageContent['mimeType']
    };
  }

  return {
    base64: await fileToBase64(file),
    mimeType: file.type as ImageContent['mimeType']
    };
}
```

### 6.2 API Key Exposure in Client-Side Code

**Pitfall:** API keys in browser bundles

**Solution:** Already implemented via CredentialVault + server-side proxy

```typescript
// /api/chat route - server-side only
export async function POST(request: Request) {
  const { providerId, messages } = await request.json();

  // Get key from vault on server
  const apiKey = await credentialVault.getCredentials(providerId);

  // Never send key to client
  const stream = chat({
    adapter: gemini({ apiKey }),
    messages,
  });

  return toStreamResponse(stream);
}
```

### 6.3 Model Selection Confusion

**Pitfall:** Using wrong model for the modality

**Solution:**
```typescript
// Modality-model mapping
const MODEL_CAPABILITIES = {
  'gemini-2.5-flash': {
    input: ['text', 'image', 'audio', 'video', 'document'],
    output: ['text'],
  },
  'gemini-2.5-flash-image-preview': {
    input: ['text', 'image'],
    output: ['image'],
  },
  'gemini-2.5-flash-native-audio-preview': {
    input: ['text', 'audio'],
    output: ['text', 'audio'],
  },
};

function validateModelForModality(model: string, inputModality: string, outputModality: string) {
  const capabilities = MODEL_CAPABILITIES[model];
  if (!capabilities) throw new Error(`Unknown model: ${model}`);
  if (!capabilities.input.includes(inputModality)) {
    throw new Error(`${model} does not support ${inputModality} input`);
  }
  if (!capabilities.output.includes(outputModality)) {
    throw new Error(`${model} does not support ${outputModality} output`);
  }
  return true;
}
```

### 6.4 Streaming Multimodal Responses

**Pitfall:** Handling mixed content during streaming

**Solution:**
```typescript
function parseStreamingChunk(chunk: any): { type: string; content: any } {
  // TanStack AI SDK provides typed chunks
  for (const part of chunk.parts || []) {
    if (part.type === 'text') {
      return { type: 'text', content: part.content };
    } else if (part.type === 'image') {
      return { type: 'image', content: part.source.value };
    } else if (part.type === 'tool-call') {
      return { type: 'tool', content: part };
    }
  }
  return { type: 'unknown', content: chunk };
}
```

### 6.5 Thinking Token Costs

**Pitfall:** Unexpected token usage with thinking models

**Solution:**
```typescript
const thinkingConfig = {
  thinkingBudget: 0, // Disable thinking for simple tasks
  // OR
  thinkingBudget: -1, // Dynamic thinking (model decides)
  // OR
  thinkingBudget: 1024, // Fixed budget for complex tasks
  includeThoughts: false, // Don't return thought summaries (unless debugging)
};

// For image analysis (no thinking needed)
const analysisResponse = await chat({
  adapter: gemini({ apiKey }),
  model: 'gemini-2.5-flash',
  messages: imageMessage,
  config: { thinkingConfig: { thinkingBudget: 0 } },
});
```

---

## 7. Implementation Recommendations

### 7.1 Architecture Patterns

**Pattern 1: Unified Multimodal Service**

```typescript
// src/lib/agent/services/multimodal-service.ts
export class MultimodalService {
  constructor(
    private vault: CredentialVault,
    private modelRegistry: ModelRegistry
  ) {}

  async analyzeImage(image: ImageContent, prompt: string) {
    const apiKey = await this.vault.getCredentials('gemini');
    const adapter = gemini({ apiKey });

    const message = buildMultimodalMessage(prompt, [image]);
    return chat({ adapter, model: 'gemini-2.5-flash', messages: [message] });
  }

  async generateImage(prompt: string, options?: ImageGenerationOptions) {
    // Use direct SDK for image gen (not via TanStack yet)
    const { GoogleGenAI } = await import('@google/genai');
    const apiKey = await this.vault.getCredentials('gemini');
    const ai = new GoogleGenAI({ apiKey });

    return ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: prompt,
    });
  }

  async transcribeAudio(audioData: ArrayBuffer) {
    const apiKey = await this.vault.getCredentials('gemini');
    const adapter = gemini({ apiKey });

    const base64Audio = arrayBufferToBase64(audioData);
    const message: CoreMessage = {
      role: 'user',
      content: [
        { type: 'text', text: 'Transcribe this audio:' },
        { type: 'audio', source: { type: 'data', value: base64Audio } }
      ]
    };

    return chat({ adapter, model: 'gemini-2.5-flash', messages: [message] });
  }
}
```

**Pattern 2: Tool-Based Generation**

```typescript
// Register multimodal tools in agent factory
export function createMultimodalTools(service: MultimodalService) {
  return [
    toolDefinition({
      name: 'generate_image',
      description: 'Generate an image from text description',
      inputSchema: z.object({
        prompt: z.string(),
        style: z.string().optional(),
      }),
    }).server(async ({ prompt, style }) => {
      const result = await service.generateImage(prompt, { style });
      return { imageUrl: result.inline_data?.data };
    }),

    toolDefinition({
      name: 'analyze_image',
      description: 'Analyze image content',
      inputSchema: z.object({
        image: z.string().describe('Base64 encoded image'),
        question: z.string(),
      }),
    }).server(async ({ image, question }) => {
      const result = await service.analyzeImage(
        { base64: image, mimeType: 'image/jpeg' },
        question
      );
      return { analysis: result.text };
    }),
  ];
}
```

### 7.2 Key Integration Points

| File/Module | Integration Needed |
|-------------|-------------------|
| `src/lib/agent/providers/index.ts` | Export Gemini adapter |
| `src/lib/agent/providers/provider-adapter.ts` | Add Gemini to factory |
| `src/lib/agent/providers/model-registry.ts` | Add Gemini 2.5 models |
| `src/lib/agent/hooks/use-agent-chat-with-tools.ts` | Already supports multimodal |
| `src/lib/agent/multimodal/message-builder.ts` | Extend for audio/video |
| `src/routes/api/chat.ts` | Add Gemini provider support |
| Component: ChatInput | Add image/audio upload buttons |
| Component: MediaPreview | Add media display in chat stream |

### 7.3 Code Examples

**Example 1: Chat with Image Upload**

```typescript
// Chat component with image support
import { useAgentChatWithTools } from '@/lib/agent/hooks/use-agent-chat-with-tools';

function ChatPanel() {
  const { sendMessage, isLoading } = useAgentChatWithTools({
    providerId: 'gemini',
    modelId: 'gemini-2.5-flash',
    apiKey: userApiKey,
  });

  const [selectedImages, setSelectedImages] = useState<ImageContent[]>([]);

  const handleSend = (text: string) => {
    sendMessage(text, selectedImages);
    setSelectedImages([]);
  };

  return (
    <div>
      <ImageUploader onImagesSelected={setSelectedImages} />
      <MessageInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
```

**Example 2: Image Generation in Notes**

```typescript
// Note editor with AI image generation
function NoteEditor() {
  const [imagePrompt, setImagePrompt] = useState('');

  const handleGenerateImage = async () => {
    const response = await fetch('/api/tools/generate_image', {
      method: 'POST',
      body: JSON.stringify({ prompt: imagePrompt }),
    });

    const { imageUrl } = await response.json();
    insertImageIntoNote(imageUrl);
  };

  return (
    <NoteToolbar>
      <AIIconButton onClick={handleGenerateImage} />
    </NoteToolbar>
  );
}
```

---

## 8. References and Sources

### Official Documentation

- [TanStack AI SDK](https://tanstack.com/ai/latest)
- [TanStack AI Gemini Adapter](https://tanstack.com/ai/latest/docs/adapters/gemini)
- [TanStack AI Multimodal Content Guide](https://tanstack.com/ai/latest/docs/guides/multimodal-content)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Gemini Thinking Guide](https://ai.google.dev/gemini-api/docs/thinking)
- [Gemini Prompt Design Strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)
- [Gemini Image Generation](https://ai.google.dev/gemini-api/docs/image-generation)
- [Gemini Live API](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/live-api)
- [Gemini 2.5 Flash](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-5-flash)
- [Introducing Gemini 2.5 Flash Image](https://developers.googleblog.com/introducing-gemini-2-5-flash-image/)

### Codebase References

- `/Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/providers/` - Provider infrastructure
- `/Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/hooks/use-agent-chat-with-tools.ts` - Chat hook
- `/Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/multimodal/message-builder.ts` - Multimodal message builder
- `/Users/apple/Documents/coding-projects/project-alpha-master/package.json` - Dependencies (@tanstack/ai, @tanstack/ai-gemini)

---

*Report compiled on 2026-01-09 by BMAD Research Agent*
