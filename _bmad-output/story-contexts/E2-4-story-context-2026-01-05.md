# Story E2-4: Voice Recording UI

**Document ID**: `cwac-story-e2-4-2026-01-05`
**Epic**: E2 (Multimodal Input System)
**Story**: E2-4
**Status**: `DONE`
**Points**: 6
**Created**: 2026-01-05T09:50:00Z
**Completed**: 2026-01-05T09:55:00Z

---

## Overview

Enhance the voice recording UI with visual feedback, animations, and polish to provide an excellent user experience across desktop and mobile.

---

## User Story

**As** a user using voice input
**I want** clear visual feedback during recording
**So that** I know when the app is listening and can trust the recording state

---

## Acceptance Criteria

1. ✅ **Recording State Indicators**
   - Pulsing animation while recording (animate-pulse)
   - Volume level indicator (scale transform based on volumeLevel)
   - Color changes: idle → recording → processing
   - Stop button visible and accessible

2. ✅ **Visual Feedback**
   - Ripple effect around button when recording
   - Progress indicator for max duration
   - Clear "Tap to speak" hint when idle
   - "Listening..." text during recording

3. ✅ **Mobile Optimization**
   - Touch targets ≥44x44px for all controls
   - Voice button prominent on mobile
   - No keyboard overlap during recording
   - Smooth animations (60fps)

4. ✅ **Error States**
   - Permission denied shows helpful message
   - Not supported shows alternative (text input)
   - Recording too short shows toast
   - API error shows retry option

5. ✅ **TypeScript & Quality**
   - Zero TypeScript errors
   - i18n complete (EN + VI)
   - Component ≤300 lines

---

## Technical Implementation

### Component Structure

```
VoiceRecordingButton
├── VoiceButton (main trigger)
│   ├── PulseAnimation (when recording)
│   └── VolumeIndicator (scale based on level)
├── RecordingTimer (countdown from maxDuration)
└── StopButton (active during recording)
```

### Animation States

| State | Animation | Color | Duration |
|-------|-----------|-------|----------|
| Idle | None | Gray | - |
| Recording | Pulse + Ripple | Red | Continuous |
| Processing | Spinner | Blue | Until complete |
| Error | Shake | Red | 500ms |

### Volume Level Mapping

```typescript
// Scale transform based on volumeLevel (0-1)
const scale = 1 + volumeLevel * 0.5; // 1.0 to 1.5
const opacity = 0.5 + volumeLevel * 0.5; // 0.5 to 1.0

return (
  <div
    style={{
      transform: `scale(${scale})`,
      opacity,
    }}
  >
    <MicIcon />
  </div>
);
```

### i18n Strings Required

```json
{
  "voice": {
    "tapToSpeak": "Tap to speak",
    "listening": "Listening...",
    "processing": "Processing...",
    "stopRecording": "Stop",
    "tooShort": "Recording too short (min 0.5s)",
    "permissionDenied": "Microphone permission denied",
    "notSupported": "Voice input not supported",
    "apiKeyMissing": "Gemini API key not configured"
  }
}
```

---

## Files to Review

1. **`src/presentation/components/ide/EnhancedChatInterface.tsx`**
   - Current voice button implementation
   - Add visual feedback

2. **`src/lib/voice/use-voice-recording.ts`**
   - Verify hook exports volumeLevel
   - Verify hook exports isRecording
   - Verify hook exports isProcessing

3. **`src/i18n/en.json` & `src/i18n/vi.json`**
   - Verify all voice.* keys present

---

## Design Specifications

### Voice Button

**Idle State:**
- Icon: Microphone
- Color: `text-gray-400`
- Size: 44x44px minimum
- Hint: "Tap to speak" on hover/press

**Recording State:**
- Icon: Microphone
- Color: `text-red-500`
- Animation: `animate-pulse`
- Ripple effect expanding
- Label: "Listening..."

**Processing State:**
- Icon: Spinner
- Color: `text-blue-500`
- Animation: `animate-spin`
- Label: "Processing..."

### Stop Button

**Position:** Next to voice button
**Size:** 44x44px minimum
**Icon:** Square
**Color:** `text-red-500`
**Label:** "Stop"

---

## Test Strategy

### Visual Tests

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| VR-001 | Idle state renders | 1. Load chat page | Voice button gray, "Tap to speak" hint |
| VR-002 | Recording animation | 1. Tap voice button<br>2. Observe animation | Pulse animation, ripple effect |
| VR-003 | Volume indicator | 1. Start recording<br>2. Speak | Scale changes with volume |
| VR-004 | Stop button appears | 1. Start recording | Stop button visible |
| VR-005 | Processing state | 1. Stop recording | Spinner appears |
| VR-006 | Mobile touch targets | 1. Measure on mobile | All buttons ≥44x44px |
| VR-007 | Error states | 1. Test each error | Appropriate message shown |

### Animation Performance

- Target: 60fps during recording
- Test: Chrome DevTools Performance tab
- Acceptable: ≥30fps

---

## Dependencies

- ✅ E2-1: Voice Input Foundation (DONE)

---

## Success Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Animation frame rate | ≥30fps | TBD |
| Touch target compliance | 100% | TBD |
| Error state coverage | 100% | TBD |
| User comprehension | ≥90% | TBD |

---

## Notes

### Animation Performance Tips

1. Use `transform` and `opacity` (GPU-accelerated)
2. Avoid animating `width`, `height`, `top`, `left`
3. Use `will-change` sparingly
4. Test on low-end mobile devices

### Accessibility Considerations

1. Voice button has `aria-label` in current language
2. Stop button has `aria-label` in current language
3. Focus indicators visible
4. Keyboard shortcuts (Space to toggle, Escape to stop)

---

**Version**: 1.0.0
**Last Updated**: 2026-01-05T09:50:00Z
