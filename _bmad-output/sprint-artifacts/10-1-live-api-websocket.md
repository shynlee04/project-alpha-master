# Story 10-1: Live API WebSocket Manager (Desktop Only)

**Epic:** Epic 10 - Knowledge Chat & Synthesis
**Status:** ready-for-dev
**Points:** 8
**Priority:** P1 (Social Media Appeal Feature)
**Platform:** Desktop Only

---

## User Story

**As a** user wanting voice interaction,
**I want** a WebSocket connection to Gemini Live API,
**So that** I can speak naturally and get audio responses in real-time.

---

## Acceptance Criteria

### AC-1: WebSocket Connection Establishment
**Given** user clicks microphone button on desktop,
**When** voice mode activates,
**Then** establish WebSocket connection to `gemini-2.5-flash-native-audio-preview-12-2025`
**And** audio input captures from microphone at 16kHz
**And** audio output streams to speakers in real-time

### AC-2: Real-Time Audio Streaming
**Given** WebSocket is connected,
**When** user speaks,
**Then** audio chunks are sent with `clientContent` messages
**And** server responds with audio chunks via `serverContent`
**And** latency is <500ms for perceived real-time

### AC-3: Connection Error Handling
**Given** connection fails,
**When** WebSocket errors,
**Then** show retry dialog with "Connection lost. Reconnecting..."
**And** after 3 failures, show manual entry fallback

### AC-4: Mobile Detection and Fallback
**Given** user is on mobile,
**When** they tap voice,
**Then** show tooltip: "Voice chat available on desktop"
**And** text input remains available

### AC-5: Desktop-Only Platform Enforcement
**Given** user is not on desktop,
**When** voice mode is requested,
**Then** feature is gracefully disabled with appropriate message
**And** no WebSocket connection is attempted

### AC-6: Audio Quality Configuration
**Given** WebSocket connection is established,
**When** audio is being captured,
**Then** sample rate is 16kHz for optimal voice recognition
**And** audio chunks are properly buffered for smooth streaming
**And** audio playback handles jitter and network variability

### AC-7: State Management for Voice Mode
**Given** voice mode is active,
**When** user toggles microphone on/off,
**Then** voice mode state is persisted in store
**And** UI reflects current state (listening, processing, speaking)
**And** state is recoverable after page refresh

---

## Technical Notes

### Gemini Live API WebSocket URL
```typescript
const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
```

### Gemini Models Configuration
```typescript
const GEMINI_MODELS = {
  flash: 'gemini-3.0-flash',
  pro: 'gemini-3.0-pro',
  live: 'gemini-2.5-flash-native-audio-preview-12-2025',
  embedding: 'gemini-embedding-001'
};
```

### WebSocket Message Format
```typescript
interface ClientContent {
  clientContent?: {
    parts: Array<{
      text?: string;
      inline_data?: {
        mime_type: string;
        data: string; // base64
      };
    }>;
  };
}

interface ServerContent {
  serverContent?: {
    parts: Array<{
      text?: string;
      inline_data?: {
        mime_type: string;
        data: string;
      };
    }>;
    role: 'model';
  };
}
```

### Audio Configuration
```typescript
const AUDIO_CONFIG = {
  sampleRate: 16000, // 16kHz for voice
  chunkSize: 1024, // bytes per chunk
  channels: 1, // mono
  format: 'float32' // for Web Audio API
};
```

### Platform Detection
```typescript
const isDesktop = () => {
  return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
```

---

## Implementation Tasks

### T1: Create WebSocket Manager Types
**File:** `src/lib/rag/live-api-types.ts`
- Define WebSocket message types (ClientContent, ServerContent)
- Define audio configuration types
- Define voice mode state types
- Define error types for WebSocket failures

### T2: Create WebSocket Manager Service
**File:** `src/lib/rag/live-api-websocket.ts`
- Implement WebSocket connection management
- Implement audio chunk sending (clientContent)
- Implement audio chunk receiving (serverContent)
- Implement connection retry logic
- Implement error handling

### T3: Create Audio Capture Handler
**File:** `src/lib/rag/audio-capture.ts`
- Implement Web Audio API integration
- Implement microphone capture at 16kHz
- Implement audio chunking and buffering
- Implement audio streaming to WebSocket

### T4: Create Audio Playback Handler
**File:** `src/lib/rag/audio-playback.ts`
- Implement Web Audio API for playback
- Implement audio chunk buffering for smooth playback
- Implement jitter handling
- Implement playback state management

### T5: Create Voice Mode State Management
**File:** `src/lib/state/voice-store.ts`
- Extend RAG store with voice mode state
- Add actions: startVoiceMode, stopVoiceMode, toggleMicrophone
- Add error state handling
- Add platform detection state

### T6: Create Microphone Button Component
**File:** `src/components/rag/VoiceChatButton.tsx`
- Implement microphone button with animated states
- Implement desktop-only detection
- Implement mobile tooltip fallback
- Integrate with voice store

### T7: Implement Connection Error UI
**File:** `src/components/rag/VoiceConnectionError.tsx`
- Implement retry dialog
- Implement manual entry fallback
- Implement connection status indicator
- Integrate with voice store

### T8: Add i18n Translations
**Files:** `src/i18n/en.json`, `src/i18n/vi.json`
- Add translation keys for voice chat UI
- Add error messages for connection failures
- Add tooltips for mobile users

### T9: Integration Testing
**Tests:** `src/lib/rag/__tests__/live-api-websocket.test.ts`
- Test WebSocket connection establishment
- Test audio chunk sending/receiving
- Test error handling and retry logic
- Test platform detection

---

## Dev Agent Record

**Developer:** Claude Sonnet 4.5
**Start Date:** 2025-12-30
**Status:** ready-for-dev

---

## Code Review

**Reviewer:** TBD
**Date:** TBD
**Status:** pending

---

## Dependencies

- **Epic 7**: RAG Infrastructure (for embedding service)
- **Epic 5**: Robust State Hydration (for state management patterns)
- **Web Audio API**: Browser native API for audio capture/playback
- **WebSocket API**: Browser native API for real-time communication

---

## Demo Checkpoint

🎙️ Voice chat with real-time audio streaming (desktop only)

---

## Platform Note

**Desktop Only** - This feature requires:
- WebSocket API support (limited on mobile)
- High bandwidth for audio streaming (~500KB/min)
- Web Audio API for low-latency audio capture/playback

Mobile users will see a tooltip directing them to use desktop for voice chat, while text-based Q&A remains available.

---

## Out of Scope

- Video streaming (audio only for this story)
- Voice activity detection (assumes manual microphone toggle)
- Noise cancellation (handled by browser default)
- Audio recording/saving (covered in Story 10-3)

---

## Definition of Done

- [x] Story file created and validated
- [ ] All acceptance criteria implemented
- [ ] TypeScript types defined
- [ ] WebSocket manager service implemented
- [ ] Audio capture/playback handlers implemented
- [ ] Voice mode state management integrated
- [ ] UI components created (microphone button, error dialog)
- [ ] i18n translations added (EN + VI)
- [ ] Desktop-only platform detection working
- [ ] Integration tests written
- [ ] Code review approved
- [ ] No TypeScript errors
