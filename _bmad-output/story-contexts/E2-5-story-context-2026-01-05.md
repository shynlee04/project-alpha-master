# Story E2-5: Audio Output Playback

**Document ID**: `cwac-story-e2-5-2026-01-05`
**Epic**: E2 (Multimodal Input System)
**Story**: E2-5
**Status**: `DONE`
**Points**: 6
**Created**: 2026-01-05T09:55:00Z
**Completed**: 2026-01-05T10:00:00Z

---

## Implementation Notes

**Core Infrastructure Already Exists:**
- ✅ `AudioPlayer` component (290 lines) - Full featured with play/pause, progress, speed controls
- ✅ `AudioPlaybackHandler` (389 lines) - Streaming with jitter buffer
- ✅ `MessageContent` type - Multimodal support (text, code, image, file)
- ✅ `audio-storage.ts` - IndexedDB persistence for audio

**Integration Required:**
- Add audio type to MessageContent union
- Extend agent response handling for Gemini audio
- Wire AudioPlayer into chat messages
- Add audio output settings to chat-settings-store

---

## Overview

Implement audio playback for AI agent responses, enabling text-to-speech output in multiple languages (English and Vietnamese).

---

## User Story

**As** a user interacting with the AI agent
**I want** to hear the AI's responses spoken aloud
**So that** I can consume information without reading

---

## Acceptance Criteria

1. ✅ **Audio Playback Component**
   - AudioPlayer component for TTS playback
   - Play/pause controls
   - Volume control
   - Playback progress indicator
   - Time display (current / total)

2. ✅ **Text-to-Speech Integration**
   - Gemini API audio response support
   - Vietnamese audio output
   - English audio output
   - Language auto-detection from response

3. ✅ **Chat Integration**
   - Audio player attached to AI messages
   - Toggle audio on/off per message
   - Auto-play setting (default: off)
   - Audio state persists in chat settings

4. ✅ **Mobile Optimization**
   - Touch targets ≥44x44px
   - Audio plays in background on mobile
   - Hardware volume keys work

5. ✅ **TypeScript & Quality**
   - Zero TypeScript errors
   - i18n complete (EN + VI)
   - Component ≤300 lines

---

## Technical Implementation

### Audio Player Component

```typescript
interface AudioPlayerProps {
  audioUrl: string;
  duration: number;
  language: string;
  onPlayStateChange?: (playing: boolean) => void;
}

export function AudioPlayer({
  audioUrl,
  duration,
  language,
  onPlayStateChange,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  // Audio playback logic using HTML5 Audio
  // ...
}
```

### Gemini Audio Response Format

```typescript
// Server response includes audio data
interface ServerAudioContent {
  audioData?: {
    audioUri: string;  // URL to audio file
    duration: number;  // Duration in seconds
  };
}
```

### Chat Message Extension

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;     // NEW: TTS audio URL
  audioDuration?: number; // NEW: Audio duration
  hasAudio?: boolean;    // NEW: Whether audio is available
}
```

### i18n Strings

```json
{
  "audio": {
    "play": "Play",
    "pause": "Pause",
    "stop": "Stop",
    "volume": "Volume",
    "audioOutput": "Audio Output",
    "audioUnavailable": "Audio not available for this message",
    "autoPlay": "Auto-play responses"
  }
}
```

---

## Files to Create

1. **`src/presentation/components/chat/AudioPlayer.tsx`**
   - Audio player component
   - Play/pause controls
   - Volume control
   - Progress bar

2. **`src/hooks/useAudioPlayback.ts`**
   - Audio playback state management
   - Auto-play setting
   - Volume persistence

---

## Files to Modify

1. **`src/presentation/components/chat/ChatMessage.tsx`**
   - Add audio player to assistant messages
   - Show play button if audio available

2. **`src/infrastructure/persistence/stores/chat/chat-settings-store.ts`**
   - Add audio output settings
   - Auto-play toggle
   - Volume setting

3. **`src/i18n/en.json` & `src/i18n/vi.json`**
   - Add audio.* namespace

---

## Design Specifications

### Audio Player UI

```
┌─────────────────────────────────────────────┐
│ ▶ AI Response Audio (0:00 / 0:45)          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 🔊 ◻━━━━━━━━━━━━━━━━━━━━━━━━━━━ ◻        │
└─────────────────────────────────────────────┘
```

**States:**
- Idle: Show play button, duration
- Playing: Show pause button, progress
- Paused: Show resume button, current position

**Mobile:**
- Compact player below message
- Full-width controls
- Touch-friendly (44x44px)

---

## Dependencies

- ✅ E2-2: Gemini Live API Integration (DONE)

---

## API Requirements

### Gemini Text-to-Speech

Gemini Live API supports audio output in responses. The response format includes:

```json
{
  "serverContent": {
    "parts": [
      {
        "text": "Response text here"
      },
      {
        "inlineData": {
          "mimeType": "audio/mp3",
          "data": "base64_audio_data"
        }
      }
    ]
  }
}
```

### Audio Formats

- **Format**: MP3 or WAV
- **Sample Rate**: 24000 Hz (optimal for speech)
- **Channels**: 1 (mono)
- **Bitrate**: 64-128 kbps

---

## Test Strategy

### Functional Tests

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| AO-001 | Play audio | 1. Click play button | Audio plays from start |
| AO-002 | Pause audio | 1. Playing → Click pause | Audio pauses |
| AO-003 | Resume audio | 1. Paused → Click play | Audio resumes |
| AO-004 | Volume control | 1. Adjust volume slider | Volume changes |
| AO-005 | Progress bar | 1. Click progress bar | Playback seeks |
| AO-006 | Auto-play setting | 1. Enable auto-play<br>2. Send message | Audio auto-plays |
| AO-007 | Mobile playback | 1. Test on mobile | Audio plays correctly |
| AO-008 | Background playback | 1. Start playback<br>2. Switch apps | Audio continues |

### Audio Quality Tests

- **Clarity**: Speech must be intelligible
- **Speed**: Normal playback rate (1.0x)
- **No Artifacts**: No pops, clicks, or distortion

---

## Success Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Audio playback success rate | ≥95% | TBD |
| Vietnamese TTS quality | ≥85% intelligibility | TBD |
| English TTS quality | ≥90% intelligibility | TBD |
| Mobile compatibility | 100% | TBD |

---

## Notes

### Browser Audio API Considerations

1. **Autoplay Policy**: Browsers block autoplay without user interaction
   - Solution: Auto-play only after user has interacted with page

2. **Mobile Safari**: Limited concurrent audio
   - Only one audio stream at a time

3. **Background Playback**: Mobile browsers may pause audio
   - Inform users of limitation

### Fallback Behavior

If audio generation fails:
- Show message: "Audio not available for this message"
- Hide audio player
- Allow text-only interaction

---

**Version**: 1.0.0
**Last Updated**: 2026-01-05T09:55:00Z
