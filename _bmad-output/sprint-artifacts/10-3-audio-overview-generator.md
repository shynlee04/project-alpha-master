# Story 10-3: Audio Overview Generator

**Epic:** Epic 10 - Knowledge Chat & Synthesis
**Status:** deferred
**Points:** 8
**Priority:** P2 (Advanced Feature)

---

## User Story

**As a** student commuting,
**I want** to listen to AI-generated audio summaries of my sources,
**So that** I can learn during downtime.

---

## Acceptance Criteria

### AC-1: Audio Generation
**Given** user selects sources,
**When** they click "Generate Audio",
**Then** call the REST API with model `gemini-3.0-flash`
**And** set config: `response_modalities: ["AUDIO"]` and `speech_config.voice_name: "Aoede"`
**And** use system prompt: *"Create a lively 2-person dialogue debating key points."*
**And** audio is saved to IndexedDB for offline playback

### AC-2: Generation Progress
**Given** audio is generating,
**When** user waits,
**Then** progress shows: "Generating script..." → "Synthesizing audio..."
**And** estimated time is shown

### AC-3: Audio Playback
**Given** audio is ready,
**When** user plays,
**Then** audio player shows: progress bar, speed control, skip forward/back
**And** transcripts are available (read while listening)

### AC-4: Mobile Playback
**Given** user is on mobile,
**When** audio plays,
**Then** background playback works
**And** audio continues when app is in background

### AC-5: IndexedDB Persistence
**Given** audio is generated,
**When** user navigates away,
**Then** audio is saved in IndexedDB
**And** can be played offline

---

## Technical Notes

### Gemini REST API for Audio
```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_modalities: ["AUDIO"],
        speech_config: {
          voice_name: "Aoede",
        },
      },
      systemInstruction: {
        parts: [{ text: "Create a lively 2-person dialogue debating key points." }],
      },
    }),
  }
);
```

### Audio Storage
```typescript
interface AudioOverview {
  id: string;
  sourceIds: string[];
  audioBlob: Blob;
  transcript: string;
  duration: number;
  createdAt: number;
}
```

---

## Implementation Tasks

### T1: Create Audio Overview Service
**File:** `src/lib/rag/audio-overview-generator.ts`
- Implement Gemini REST API integration
- Implement audio blob extraction
- Implement IndexedDB storage
- Implement progress tracking

### T2: Create Audio Overview State Management
**File:** `src/lib/state/audio-overview-store.ts`
- Add audio overview state
- Add actions: generateAudio, playAudio, deleteAudio
- Add progress tracking state

### T3: Create Audio Player Component
**File:** `src/components/rag/AudioPlayer.tsx`
- Implement audio playback controls
- Implement progress bar with seeking
- Implement speed control (0.5x, 1x, 1.5x, 2x)
- Implement skip forward/back buttons

### T4: Create Transcript View Component
**File:** `src/components/rag/TranscriptView.tsx`
- Implement transcript display
- Sync transcript with audio playback
- Highlight current section

### T5: Add i18n Translations
**Files:** `src/i18n/en.json`, `src/i18n/vi.json`
- Add translation keys for audio overview
- Add generation progress messages
- Add audio player labels

### T6: Implement Background Playback
**File:** `src/lib/rag/audio-overview-generator.ts`
- Implement Media Session API
- Handle app backgrounding
- Handle audio focus

### T7: Error Handling
**File:** `src/lib/rag/audio-overview-generator.ts`
- Handle API failures
- Handle quota exceeded
- Show user-friendly error messages

### T8: Integration Testing
**Tests:** `src/lib/rag/__tests__/audio-overview-generator.test.ts`
- Test audio generation
- Test IndexedDB storage
- Test playback controls

---

## Dev Agent Record

**Developer:** Claude Sonnet 4.5
**Date:** 2025-12-30
**Status:** deferred

### Reason for Deferral

- P2 priority (advanced feature)
- Requires gemini-3.0-flash API access
- Complex audio generation and storage
- Mobile background playback requires additional platform-specific handling
- Core RAG infrastructure (Epic 7) and voice chat (Story 10-1) are complete

### Infrastructure Ready

- WebSocket manager (Story 10-1) can be extended for REST API
- RAG store has patterns for state management
- IndexedDB storage patterns established in Epic 7

---

## Code Review

**Reviewer:** N/A
**Status:** N/A (deferred)

---

## Dependencies

- **Gemini API**: gemini-3.0-flash for audio generation
- **Story 10-1**: Voice mode state management patterns
- **Epic 7**: IndexedDB storage patterns

---

## Demo Checkpoint

🎧 Generate audio from textbook → Listen during commute

---

## Platform Note

**Mobile Support** - Audio playback works on mobile with background playback capability.

---

## Out of Scope

- Real-time audio streaming (covered in Story 10-1)
- Voice cloning (uses Gemini TTS voices)
- Audio editing/cropping
- Share/export audio files

---

## Definition of Done

- [x] Story file created
- [ ] Implementation deferred - P2 priority, advanced feature
- [ ] Can be implemented when gemini-3.0-flash is more widely available
