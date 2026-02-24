# Sprint Planning Proposal: Multimodality & Chat Foundation

**Date:** 2026-01-09
**Sprint Name:** Multimodality Foundation Sprint
**Duration:** 2 weeks
**Stories:** MM-01 through MM-08

---

## Sprint Overview

This sprint addresses critical gaps in the multimodal and chat architecture identified during deep research. The focus is on implementing voice I/O capabilities, note block renderers, and Gemini 2026 integration.

### Sprint Goals

1. **Enable voice interaction** with AI agents (input + output)
2. **Render rich content** in note blocks (code, images, embeds)
3. **Integrate Gemini 2026** multimodal capabilities
4. **Fix UX/UI inconsistencies** in panel layouts

---

## Story Breakdown

### Phase 1: Voice I/O (Days 1-5)

#### Story MM-01: Voice Input Tool (Speech-to-Text)
**ID:** MM-01
**Priority:** P0 (Critical)
**Effort:** Medium (3 days)
**Owner:** TBD

**Description:**
Implement a TanStack AI tool for transcribing audio to text using OpenAI's Whisper model. This enables users to speak to agents instead of typing.

**Technical Requirements:**
```typescript
// Tool definition
export const transcribeAudioDef = toolDefinition({
  name: 'transcribe_audio',
  description: 'Transcribe audio to text using Whisper ASR',
  inputSchema: z.object({
    audio: z.union([z.instanceof(File), z.string()]),
    language: z.string().optional(),
    modelOptions: z.object({
      response_format: z.enum(['json', 'verbose_json', 'srt', 'vtt']).optional(),
      temperature: z.number().optional(),
      prompt: z.string().optional(),
    }).optional(),
  }).strict(),
  needsApproval: false,
});

// Implementation
export function createTranscribeAudioClientTool(getCredentials: () => Credentials) {
  return transcribeAudioDef.client(async (input): Promise<ToolResult<TranscriptionResult>> => {
    const credentials = getCredentials();
    const result = await generateTranscription({
      adapter: openaiTranscription('whisper-1', credentials.apiKey),
      audio: input.audio,
      language: input.language,
      modelOptions: input.modelOptions,
    });
    return { success: true, data: result };
  });
}
```

**Acceptance Criteria:**
- [ ] Tool definition matches TanStack AI pattern
- [ ] Accepts File or base64 string input
- [ ] Returns transcribed text with optional timestamps
- [ ] Works with existing tool permission system
- [ ] Unit tests with mock audio data
- [ ] Integration test with real audio

**Files to Create/Modify:**
- `src/lib/agent/tools/speech-to-text-tool.ts` (new)
- `src/lib/agent/facades/knowledge-tools.ts` (update)
- `src/lib/agent/hooks/__tests__/use-agent-chat-with-tools.test.ts` (update)

---

#### Story MM-02: Voice Output Tool (Text-to-Speech)
**ID:** MM-02
**Priority:** P0 (Critical)
**Effort:** Medium (3 days)
**Owner:** TBD

**Description:**
Implement a TanStack AI tool for generating speech from text using OpenAI's TTS-1 model. This enables agents to respond with voice.

**Technical Requirements:**
```typescript
// Tool definition
export const generateSpeechDef = toolDefinition({
  name: 'generate_speech',
  description: 'Generate speech from text using TTS',
  inputSchema: z.object({
    text: z.string().min(1).max(4096),
    voice: z.enum([
      'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer',
      'ash', 'ballad', 'coral', 'sage', 'verse'
    ]).default('alloy'),
    format: z.enum(['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm']).default('mp3'),
    speed: z.number().min(0.25).max(4.0).default(1.0),
  }).strict(),
  needsApproval: false,
});

// Implementation
export function createGenerateSpeechClientTool(getCredentials: () => Credentials) {
  return generateSpeechDef.client(async (input): Promise<ToolResult<TTSResult>> => {
    const credentials = getCredentials();
    const result = await generateSpeech({
      adapter: openaiTTS('tts-1', credentials.apiKey),
      text: input.text,
      voice: input.voice,
      format: input.format,
      modelOptions: { speed: input.speed },
    });
    return { success: true, data: result };
  });
}
```

**Acceptance Criteria:**
- [ ] Tool definition matches TanStack AI pattern
- [ ] Supports all 11 OpenAI voices
- [ ] Supports multiple audio formats
- [ ] Returns base64-encoded audio
- [ ] Browser playback utility function
- [ ] Unit tests with mock responses

**Files to Create/Modify:**
- `src/lib/agent/tools/text-to-speech-tool.ts` (new)
- `src/lib/agent/facades/knowledge-tools.ts` (update)
- `src/lib/agent/hooks/__tests__/use-agent-chat-with-tools.test.ts` (update)

---

#### Story MM-03: Note Code Block Renderer
**ID:** MM-03
**Priority:** P0 (Critical)
**Effort:** Medium (4 days)
**Owner:** TBD

**Description:**
Create a BlockNote custom block type for rendering code with Monaco editor integration and syntax highlighting.

**Technical Requirements:**
```typescript
// Code block type for BlockNote
interface CodeBlock {
  type: 'code';
  props: {
    language: string;
    code: string;
  };
  content: [];
  children: [];
}

// Monaco editor integration
import { MonacoBinding } from '@monaco-editor/react';

// Component
export function CodeBlockRenderer({ block }: { block: CodeBlock }) {
  const [code, setCode] = useState(block.props.code);
  const [language, setLanguage] = useState(block.props.language);

  return (
    <div className="code-block-container border border-border rounded-none">
      <div className="code-block-header flex items-center justify-between p-2 bg-muted">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-background border border-border px-2 py-1 text-xs"
        >
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="rust">Rust</option>
          {/* ... more languages */}
        </select>
        <button
          onClick={() => copyToClipboard(code)}
          className="text-xs hover:text-primary"
        >
          Copy
        </button>
      </div>
      <MonacoEditor
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
        }}
      />
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] BlockNote custom block type registration
- [ ] Monaco editor with syntax highlighting
- [ ] Language selector dropdown
- [ ] Copy to clipboard button
- [ ] Editable in place
- [ ] Persists to markdown on save
- [ ] Keyboard shortcuts (Ctrl+Enter to save, Escape to cancel)

**Files to Create/Modify:**
- `src/presentation/components/notes/code-block-renderer.tsx` (new)
- `src/infrastructure/sync/workspace-services/notes/note-markdown-parser.ts` (update)
- `src/infrastructure/sync/workspace-services/notes/note-markdown-writer.ts` (update)
- `src/presentation/components/notes/NotesPage.tsx` (update)

---

#### Story MM-04: Note Image Block Renderer
**ID:** MM-04
**Priority:** P1 (High)
**Effort:** Small (2 days)
**Owner:** TBD

**Description:**
Create a BlockNote custom block type for rendering images with drag-and-drop upload and metadata display.

**Technical Requirements:**
```typescript
// Image block type
interface ImageBlock {
  type: 'image';
  props: {
    src: string; // base64 or URL
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
  };
  content: [];
  children: [];
}

// Component
export function ImageBlockRenderer({ block }: { block: ImageBlock }) {
  const [showCaption, setShowCaption] = useState(false);

  return (
    <div className="image-block-container">
      <div className="relative group">
        <img
          src={block.props.src}
          alt={block.props.alt}
          className="max-w-full h-auto"
          style={{ maxHeight: '400px' }}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => setShowCaption(!showCaption)}
            className="text-white px-4 py-2"
          >
            {showCaption ? 'Hide Caption' : 'Add Caption'}
          </button>
        </div>
      </div>
      {block.props.caption && showCaption && (
        <div className="caption mt-2 text-sm text-muted-foreground italic">
          {block.props.caption}
        </div>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] BlockNote custom block type registration
- [ ] Drag-and-drop image upload
- [ ] Base64 rendering (no external dependencies)
- [ ] Alt text input
- [ ] Optional caption support
- [ ] Metadata display (dimensions, size)
- [ ] Delete button

**Files to Create/Modify:**
- `src/presentation/components/notes/image-block-renderer.tsx` (new)
- `src/infrastructure/sync/workspace-services/notes/note-markdown-parser.ts` (update)
- `src/infrastructure/sync/workspace-services/notes/note-markdown-writer.ts` (update)

---

### Phase 2: Integration (Days 6-10)

#### Story MM-05: Gemini 2026 Multimodal Provider
**ID:** MM-05
**Priority:** P0 (Critical)
**Effort:** Medium (3 days)
**Owner:** TBD

**Description:**
Create a TanStack AI provider adapter for Gemini 2026 with full multimodal support (text, image, audio, video, document).

**Technical Requirements:**
```typescript
// Gemini 2026 provider
import { createGeminiChat } from '@tanstack/ai-gemini';
import { generateSpeech, generateTranscription } from '@tanstack/ai';

export function createGemini2026Provider(apiKey: string) {
  // Text + multimodal chat
  const chatAdapter = createGeminiChat('gemini-2.0-flash', apiKey, {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
  });

  // Text-to-speech (experimental)
  const ttsAdapter = createGeminiSpeech('gemini-2.5-flash-preview-tts', apiKey);

  return {
    chat: chatAdapter,
    tts: ttsAdapter,
    supports: {
      text: true,
      image: true,
      audio: true,
      video: true,
      document: true,
      tts: true,
      transcription: false, // Use Whisper for this
    },
  };
}

// Usage in chat API
const provider = createGemini2026Provider(apiKey);
const stream = chat({
  adapter: provider.chat,
  messages: multimodalMessages,
});
```

**Acceptance Criteria:**
- [ ] TanStack AI adapter for Gemini 2026
- [ ] Support for text, image, audio, video, document modalities
- [ ] Streaming response handling
- [ ] Provider-specific metadata (mimeType, detail)
- [ ] Fallback to Gemini 1.5 if 2.0 unavailable
- [ ] Tests with mock responses

**Files to Create/Modify:**
- `src/lib/agent/providers/gemini-2026-provider.ts` (new)
- `src/routes/api/chat.ts` (update)
- `src/lib/agent/hooks/use-agent-chat-with-tools.ts` (update)

---

#### Story MM-06: Voice Input Hook
**ID:** MM-06
**Priority:** P1 (High)
**Effort:** Small (2 days)
**Owner:** TBD

**Description:**
Create a React hook for voice input that integrates with the microphone API and produces audio data for the transcription tool.

**Technical Requirements:**
```typescript
interface UseVoiceInputOptions {
  onTranscription?: (text: string) => void;
  language?: string;
  continuous?: boolean;
}

interface UseVoiceInputReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  audioBlob: Blob | null;
  transcript: string;
  permissionGranted: boolean;
  error: Error | null;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const checkPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      setPermissionGranted(result.state === 'granted');
    } catch {
      setPermissionGranted(false);
    }
  };

  const startRecording = async () => {
    try {
      await checkPermission();
      if (!permissionGranted) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionGranted(true);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start recording'));
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    transcript,
    permissionGranted,
    error,
  };
}
```

**Acceptance Criteria:**
- [ ] Hook API follows React patterns
- [ ] Microphone permission handling
- [ ] Audio recording with visual feedback (waveform)
- [ ] Integration with `useAgentChatWithTools`
- [ ] Cleanup on unmount
- [ ] Error handling

**Files to Create/Modify:**
- `src/lib/agent/hooks/use-voice-input.ts` (new)
- `src/presentation/components/chat/voice-input-button.tsx` (new)

---

#### Story MM-07: Voice Output Hook
**ID:** MM-07
**Priority:** P1 (High)
**Effort:** Small (2 days)
**Owner:** TBD

**Description:**
Create a React hook for voice output that plays TTS audio and provides playback controls.

**Technical Requirements:**
```typescript
interface UseVoiceOutputOptions {
  autoPlay?: boolean;
  voice?: string;
  speed?: number;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

interface UseVoiceOutputReturn {
  isPlaying: boolean;
  play: (text: string) => Promise<void>;
  stop: () => void;
  isLoading: boolean;
  voices: VoiceOption[];
  currentVoice: VoiceOption | null;
  setVoice: (voice: VoiceOption) => void;
}

interface VoiceOption {
  id: string;
  name: string;
  language: string;
}

export function useVoiceOutput(options: UseVoiceOutputOptions = {}): UseVoiceOutputReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<VoiceOption | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load available voices
  useEffect(() => {
    // Load voices from TTS service
    loadVoices().then(setVoices);
  }, []);

  const play = async (text: string) => {
    if (isPlaying) return;
    setIsLoading(true);

    try {
      // Call TTS API
      const result = await generateSpeech({
        adapter: openaiTTS('tts-1'),
        text,
        voice: currentVoice?.id || 'alloy',
        format: 'mp3',
      });

      // Create audio element
      const audioData = atob(result.audio);
      const bytes = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        bytes[i] = audioData.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: result.contentType });
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.src);
      }

      audioRef.current = new Audio(url);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        options.onEnd?.();
      };
      audioRef.current.onerror = (e) => {
        setIsPlaying(false);
        options.onError?.(new Error('Audio playback failed'));
      };

      audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      options.onError?.(err instanceof Error ? err : new Error('TTS failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
  };

  return {
    isPlaying,
    play,
    stop,
    isLoading,
    voices,
    currentVoice,
    setVoice: setCurrentVoice,
  };
}
```

**Acceptance Criteria:**
- [ ] Hook API follows React patterns
- [ ] Audio playback with controls (play, stop)
- [ ] Voice selection dropdown
- [ ] Loading state with spinner
- [ ] Integration with chat message display
- [ ] Cleanup on unmount

**Files to Create/Modify:**
- `src/lib/agent/hooks/use-voice-output.ts` (new)
- `src/presentation/components/chat/voice-output-toggle.tsx` (new)

---

#### Story MM-08: Note Embed Block Renderer
**ID:** MM-08
**Priority:** P2 (Medium)
**Effort:** Small (2 days)
**Owner:** TBD

**Description:**
Create a BlockNote custom block type for embedding URLs with oEmbed support for common services.

**Technical Requirements:**
```typescript
// Embed block type
interface EmbedBlock {
  type: 'embed';
  props: {
    url: string;
    title?: string;
    provider?: string;
    html?: string;
    thumbnail?: string;
  };
  content: [];
  children: [];
}

// oEmbed response type
interface OEmbedResponse {
  type: 'link' | 'photo' | 'video' | 'rich';
  title?: string;
  author_name?: string;
  provider_name?: string;
  thumbnail_url?: string;
  html?: string;
}

// Component
export function EmbedBlockRenderer({ block }: { block: EmbedBlock }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const provider = detectProvider(block.props.url);
  const embedUrl = getEmbedUrl(provider, block.props.url);

  return (
    <div className="embed-block-container border border-border rounded-none p-4">
      {error ? (
        <a href={block.props.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          {block.props.url}
        </a>
      ) : (
        <iframe
          src={embedUrl}
          className="w-full h-64"
          frameBorder="0"
          allowFullScreen
        />
      )}
      <div className="embed-caption mt-2 text-sm text-muted-foreground">
        <a href={block.props.url} target="_blank" rel="noopener noreferrer">
          {block.props.title || block.props.url}
        </a>
      </div>
    </div>
  );
}

// Provider detection
function detectProvider(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('github.com')) return 'github';
  if (url.includes('spotify.com')) return 'spotify';
  return 'generic';
}
```

**Acceptance Criteria:**
- [ ] BlockNote custom block type registration
- [ ] URL input and validation
- [ ] oEmbed integration for YouTube, Vimeo, Twitter, GitHub, Spotify
- [ ] Fallback to link for unsupported URLs
- [ ] Loading state
- [ ] Error handling
- [ ] Delete button

**Files to Create/Modify:**
- `src/presentation/components/notes/embed-block-renderer.tsx` (new)
- `src/infrastructure/sync/workspace-services/notes/note-markdown-parser.ts` (update)
- `src/infrastructure/sync/workspace-services/notes/note-markdown-writer.ts` (update)

---

## Dependencies

```
MM-01 (Voice Input Tool)
    ↓
MM-06 (Voice Input Hook) ← MM-02 (Voice Output Tool)
    ↓                      ↓
MM-07 (Voice Output Hook)
    ↓
MM-03 (Code Block) ──┬── MM-04 (Image Block)
    ↓                 ↓
MM-08 (Embed Block)
    ↑
MM-05 (Gemini Provider) ← All others depend on provider
```

---

## Testing Strategy

### Unit Tests
- Tool definitions with Zod schemas
- Hook logic with React Testing Library
- Component rendering with Jest

### Integration Tests
- Chat API with real audio transcription
- Note rendering with markdown sync
- Voice I/O with actual TTS/STT services

### E2E Tests
- Complete voice conversation workflow
- Note creation with all block types
- Cross-workspace chat with voice

---

## Definition of Done

1. All acceptance criteria met
2. Code review passed
3. Unit tests ≥80% coverage
4. Integration tests passing
5. Build passes (`pnpm tsc --noEmit`)
6. No new lint errors
7. Documentation updated

---

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Gemini 2026 API not available | High | Medium | Fallback to Gemini 1.5 |
| Microphone permission issues | High | Low | Graceful fallback to text input |
| Audio file size limits | Medium | Medium | Implement chunking for long audio |
| Monaco editor performance | Low | Low | Lazy loading |

---

*Generated: 2026-01-09 | BMAD Core Master Agent*
*Status: Ready for Approval*
