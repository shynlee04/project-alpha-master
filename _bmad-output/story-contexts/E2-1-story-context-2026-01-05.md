# Story E2-1: Voice Input Foundation

**Document ID**: `cwac-story-e2-1-2026-01-05`
**Epic**: E2 - Multimodal Input System
**Story**: E2-1
**Points**: 8
**Priority**: P0
**Status**: `IN_PROGRESS`
**Created**: 2026-01-05

---

## Overview

Implement the foundational voice input functionality for cross-workspace chat. This story creates the voice recording infrastructure that will be extended in E2-2 (Gemini Live API Integration) and E2-3 (Vietnamese Voice Recognition).

### Scope
- Create voice i18n namespace (VI + EN)
- Create `useVoiceRecording` hook for voice state management
- Integrate existing `AudioCaptureHandler` with chat panels
- Replace voice button placeholder with recording functionality
- Add visual feedback for recording state

### Out of Scope
- Actual speech-to-text (E2-2)
- Vietnamese language support (E2-3)
- Audio output playback (E2-5)

---

## Acceptance Criteria

### AC1: Voice i18n Namespace Created
- [ ] `src/i18n/en/voice.json` created with 8+ keys
- [ ] `src/i18n/vi/voice.json` created with Vietnamese translations
- [ ] All keys follow existing i18n patterns
- [ ] No hardcoded voice strings in components

### AC2: Voice Recording Hook Created
- [ ] `src/lib/voice/use-voice-recording.ts` created (≤150 lines)
- [ ] Hook integrates existing `AudioCaptureHandler`
- [ ] Manages recording state (idle, recording, processing, error)
- [ ] Exports `startRecording()`, `stopRecording()`, `toggleRecording()`
- [ ] Exports recording state and volume level

### AC3: Voice Button Functional
- [ ] Clicking Mic button starts voice recording
- [ ] Clicking again stops recording
- [ ] Visual indicator shows recording state (pulse animation)
- [ ] Button disabled when recording not supported
- [ ] Permission prompt shown on first use

### AC4: Visual Feedback
- [ ] Volume level indicator visible when recording
- [ ] Recording state indicator (pulsing red)
- [ ] Toast message on recording complete
- [ ] Error state handled with user-friendly message

### AC5: TypeScript Compilation
- [ ] Zero TypeScript errors (`pnpm typecheck`)
- [ ] No `any` types in new code
- [ ] Proper interfaces exported

### AC6: Integration
- [ ] Voice button works in all chat panels (IDE, Notes, Knowledge, Study)
- [ ] State persists across workspace switches
- [ ] No memory leaks (proper cleanup on unmount)

---

## Technical Notes

### Existing Infrastructure to Leverage
```typescript
// AudioCaptureHandler (already exists)
import { getAudioCapture } from '@/lib/rag/audio-capture';

// Live API types (already exists)
import type { AudioChunk, VoiceModeState } from '@/lib/rag/live-api-types';

// Voice slice (RAG-specific, create chat-specific version)
import type { VoiceModeStoreState } from '@/lib/rag/live-api-types';
```

### New Files to Create

#### 1. Voice i18n Namespace
```json
// src/i18n/en/voice.json
{
  "voice": {
    "record": "Tap to speak",
    "recording": "Listening...",
    "processing": "Processing...",
    "error": "Voice input unavailable",
    "permissionDenied": "Microphone permission denied",
    "notSupported": "Voice input not supported in this browser",
    "cancel": "Cancel",
    "send": "Send"
  }
}
```

#### 2. Voice Recording Hook
```typescript
// src/lib/voice/use-voice-recording.ts
interface UseVoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  volumeLevel: number;
  error: string | null;
  isSupported: boolean;
}

interface UseVoiceRecordingActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  toggleRecording: () => Promise<void>;
  clearError: () => void;
}
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/presentation/components/ide/EnhancedChatInterface.tsx` | Replace placeholder voice click handler |
| `src/i18n/en/chat.json` | Add voice-related keys if missing |
| `src/i18n/vi/chat.json` | Add Vietnamese voice translations |

---

## Component Integration

### Before (Current Placeholder)
```typescript
// EnhancedChatInterface.tsx:147-152
const handleVoiceClick = useCallback(() => {
    // TODO: E2-1 Web Speech API Integration
    toast.info('Voice input coming soon in Epic E2', {
        description: 'Speech-to-text will be available soon.'
    })
}, [])
```

### After (Story E2-1 Implementation)
```typescript
const {
  isRecording,
  volumeLevel,
  startRecording,
  stopRecording,
  toggleRecording,
  isSupported
} = useVoiceRecording()

const handleVoiceClick = useCallback(async () => {
  if (isRecording) {
    stopRecording()
  } else {
    await startRecording()
  }
}, [isRecording, startRecording, stopRecording])
```

---

## Test Strategy

### Unit Tests
```typescript
// src/lib/voice/__tests__/use-voice-recording.test.ts
describe('useVoiceRecording', () => {
  it('should initialize with correct default state')
  it('should start recording when startRecording called')
  it('should stop recording when stopRecording called')
  it('should update volume level during recording')
  it('should handle microphone permission denial')
  it('should detect browser support correctly')
})
```

### Manual Tests
- [ ] Click Mic button - recording starts
- [ ] Speak - volume indicator animates
- [ ] Click Mic button again - recording stops
- [ ] Test in Chrome/Edge (supported browsers)
- [ ] Test in Safari (may have different permissions)
- [ ] Test on mobile (iOS/Android)

---

## MCP Research Required

### Gemini Live API Verification
```bash
# Verify Gemini 2.5 Flash Live API endpoints
@exa:Google Gemini 2.5 Flash Live API audio streaming 2025

# Check for Vietnamese language support
@MiniMax_web_search:Gemini 2.5 Vietnamese speech recognition API 2025
```

### Web Speech API Research
```bash
# Check browser support for SpeechRecognition
@context7:Get documentation for Web Speech API SpeechRecognition

# Check for Vietnamese language codes
@exa:Web Speech API Vietnamese language code BCP 47
```

---

## Dependencies

### Internal
- E2-2: Gemini Live API Integration (requires E2-1 voice state)
- E2-3: Vietnamese Voice Recognition (requires E2-1 hook)
- E2-4: Voice Recording UI (extends E2-1)

### External
- Google Gemini API key (environment variable)
- Web Audio API (browser support)
- MediaDevices API (browser support)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Browser doesn't support Web Audio API | Show friendly message, disable button |
| Microphone permission denied | Clear instructions for user to enable |
| Audio capture fails silently | Comprehensive error handling + toast |
| Memory leaks from audio context | Proper cleanup in useEffect return |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests passing (≥80% coverage)
- [ ] TypeScript compiles with 0 errors
- [ ] i18n complete (VI + EN)
- [ ] Manual tests passed
- [ ] No console errors or warnings
- [ ] Code review approved

---

**Version**: 1.0.0
**Last Updated**: 2026-01-05
**Next Story**: E2-2 (Gemini Live API Integration)
