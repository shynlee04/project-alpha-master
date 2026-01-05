# Story E2-2: Gemini Live API Transcription

**Document ID**: `cwac-story-e2-2-2026-01-05`
**Epic**: E2 (Multimodal Input System)
**Story**: E2-2
**Status**: `IN_PROGRESS`
**Points**: 10
**Created**: 2026-01-05T22:30:00Z

---

## Overview

Integrate Gemini Live API for real-time speech-to-text transcription in the chat interface. This story connects the voice recording foundation (E2-1) to the Gemini API to return actual text transcripts.

---

## User Story

**As** a user interacting with the AI agent
**I want** to tap the microphone button, speak my message, and see it transcribed to text
**So that** I can input messages naturally without typing

---

## Acceptance Criteria

1. ✅ **Gemini Live API Integration**
   - WebSocket connects on recording start
   - Audio chunks stream to Gemini Live API
   - Text response received and parsed
   - WebSocket disconnects after transcription

2. ✅ **Transcription Return**
   - `stopRecording()` returns transcript string (not null)
   - Empty string if no speech detected
   - Transcript appended to chat input field
   - Loading state during processing

3. ✅ **Language Support**
   - Detects current i18n language (en/vi)
   - Sends language code to Gemini API
   - Vietnamese: `vi-VN` language code
   - English: `en-US` language code

4. ✅ **Error Handling**
   - API key missing → user-friendly error
   - Network error → retry logic (max 3 attempts)
   - Transcription failed → fallback to text input
   - Toast notifications for all errors

5. ✅ **Mobile Optimization**
   - Touch targets ≥44x44px maintained
   - No keyboard overlap during recording
   - Visual feedback during processing

6. ✅ **TypeScript & Quality**
   - Zero TypeScript errors
   - i18n complete (EN + VI)
   - Files ≤300 lines (useVoiceRecording can exceed for now)
   - Integration tests passing

---

## Technical Implementation

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Voice Recording Flow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User taps mic                                               │
│       │                                                      │
│       ▼                                                      │
│  useVoiceRecording.startRecording()                          │
│       │                                                      │
│       ├───► AudioCaptureHandler.start()                      │
│       │        └──► Get mic permission                       │
│       │                                                      │
│       ├───► GeminiTranscriptionService.connect()            │
│       │        └──► WebSocket to Live API                   │
│       │                                                      │
│  Recording...                                                │
│       │                                                      │
│       ├───► onChunk → Send to WebSocket                     │
│       │                                                      │
│  User taps stop                                              │
│       │                                                      │
│       ▼                                                      │
│  useVoiceRecording.stopRecording()                           │
│       │                                                      │
│       ├───► Send final audio chunk                          │
│       ├───► Wait for text response                         │
│       └───► Return transcript string                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Files to Create

1. **`src/lib/voice/gemini-transcription-service.ts`** (~200 lines)
   - Orchestrates audio capture + WebSocket
   - Handles session lifecycle
   - Returns text transcript

### Files to Modify

1. **`src/lib/voice/use-voice-recording.ts`**
   - Import `GeminiTranscriptionService`
   - Return actual transcript instead of null
   - Add isProcessing state

2. **`src/i18n/en.json` & `src/i18n/vi.json`**
   - Add error messages for API failures
   - Add processing status message

---

## API Configuration

### Environment Variable

```bash
# .env
VITE_GEMINI_API_KEY=your_api_key_here
```

### WebSocket Session Setup

```typescript
// Initial message to configure session
{
  setup: {
    generationConfig: {
      responseModalities: ['AUDIO', 'TEXT'],
      speechConfig: {
        languageCode: 'vi-VN', // or 'en-US' based on i18n
      },
    },
  },
}
```

---

## Dependencies

- ✅ E2-1: Voice Input Foundation (COMPLETE)
- `@google/generative-ai` SDK (for types)
- `src/lib/rag/audio-capture.ts` (AudioCaptureHandler)
- `src/lib/rag/live-api-websocket.ts` (LiveApiWebSocketManager)
- `src/lib/rag/live-api-types.ts` (Type definitions)

---

## Test Strategy

1. **Unit Tests**
   - GeminiTranscriptionService session lifecycle
   - Language code detection from i18n
   - Error handling paths

2. **Integration Tests**
   - Record → Transcribe → Return text flow
   - Vietnamese language transcription
   - English language transcription

3. **Manual Tests**
   - Tap mic, speak, verify text appears
   - Test with Vietnamese language
   - Test with English language
   - Test error states (no API key, network error)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Transcription accuracy (English) | ≥90% |
| Transcription accuracy (Vietnamese) | ≥85% |
| End-to-end latency | <3s |
| Error rate | <5% |

---

**Version**: 1.0.0
**Last Updated**: 2026-01-05T22:30:00Z
