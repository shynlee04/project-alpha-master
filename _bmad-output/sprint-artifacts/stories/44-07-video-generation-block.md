# Story 44-07: Video Generation Block (Experimental)

**Epic:** EPIC-44 - Multimodal Rich Content  
**Sprint:** Notes AI Sprint (Team B)  
**Created:** 2026-01-14  
**Status:** IN_PROGRESS  
**Priority:** P2 (Experimental)

---

## User Story

**As a** notes user  
**I want to** generate short videos from text prompts directly in my notes  
**So that** I can create rich multimedia content without leaving the app

---

## Acceptance Criteria

- [ ] **AC-01:** VideoGenerationBlock component created with 8-bit design
- [ ] **AC-02:** Text prompt input field with character limit guidance
- [ ] **AC-03:** Video preview player with standard controls (play/pause, mute, fullscreen)
- [ ] **AC-04:** Progress indicator showing generation status (queued → generating → complete)
- [ ] **AC-05:** Error handling with user-friendly messages
- [ ] **AC-06:** Download button to save generated video locally
- [ ] **AC-07:** Slash command `/video-gen` registered in AISlashCommand.tsx
- [ ] **AC-08:** Block registered in NoteEditor.tsx schema

---

## Technical Requirements

### API Integration (Veo 3.1)

```typescript
// Using @google/genai package (NOT @tanstack/ai-gemini)
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// Start video generation
const operation = await ai.models.generateVideos({
    model: "veo-3.1-generate-preview",
    prompt: userPrompt,
});

// Poll for completion
while (!operation.done) {
    await sleep(10000); // 10 second intervals
    operation = await ai.operations.getVideosOperation({ operation });
}

// Download video
const videoBlob = await ai.files.download({
    file: operation.response.generatedVideos[0].video,
});
```

### Block Props

```typescript
interface VideoGenerationBlockProps {
  prompt: string;           // User's text prompt
  videoData: string;        // Base64 video data or blob URL
  status: 'idle' | 'queued' | 'generating' | 'done' | 'error';
  progress: number;         // 0-100 percentage (estimated)
  errorMessage: string;     // Error description if failed
  duration: number;         // Video duration in seconds
}
```

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@google/genai` | latest | Google GenAI SDK for Veo API |

**Note:** May need to add `@google/genai` to package.json if not present.

---

## UI/UX Design

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 🎬 Video Generation                              [8-bit box]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Prompt:                                                    │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Describe your video scene...                           ││
│  │                                                        ││
│  └────────────────────────────────────────────────────────┘│
│                                                    [~8 sec] │
│                                                             │
│  Style: [ Cinematic ▼ ]   Duration: [ 8 sec ▼ ]            │
│                                                             │
│                      [ 🎬 Generate Video ]                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Preview Area - Video Player or Placeholder]               │
│                                                             │
│       ┌────────────────────────────────────────┐           │
│       │                                        │           │
│       │           🎬 No video yet              │           │
│       │                                        │           │
│       └────────────────────────────────────────┘           │
│                                                             │
│  Status: Ready to generate                                  │
│                                                             │
│  [ ⬇ Download ]  [ 🔄 Regenerate ]  [ ❌ Delete ]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8-bit Design Tokens

```css
.video-generation-block {
  border-radius: 2px;
  border: 2px solid var(--border);
  box-shadow: 4px 4px 0 0 var(--border);
}

.video-generation-block__button:hover {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 0 var(--primary);
}
```

---

## Implementation Steps

1. **Check @google/genai package** - Verify if installed, add if missing
2. **Create VideoGenerationBlock.tsx** - Main block component
3. **Create VideoGenerationBlock.css** - 8-bit styling
4. **Create video-generation-service.ts** - API integration service
5. **Register block in NoteEditor.tsx** - Add to schema
6. **Add slash command** - `/video-gen` in AISlashCommand.tsx
7. **Test with real API** - Verify generation flow

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| API costs (Veo is paid) | Show cost estimate before generation |
| Long generation time (~60-120s) | Polling with progress feedback |
| Large video files | Limit to 8-second videos, compress if needed |
| API key requirements | Require Gemini API key with Veo access |
| Rate limiting | Implement request queue |

---

## Dependencies

- **Requires:** Story 44-04 (Video Understanding) for video player component patterns
- **Requires:** Gemini API key with Veo access (paid tier)

---

## Out of Scope

- Video editing within the block
- Video effects/filters
- Video-to-video generation
- Video extension (multiple clips)
- Audio dubbing

---

## Research Sources

1. **Gemini API Docs (Veo):** https://ai.google.dev/gemini-api/docs/video
2. **Veo 3.1 Model:** `veo-3.1-generate-preview`
3. **@google/genai SDK:** npm package for video generation

---

## Definition of Done

- [ ] Block renders correctly in NoteEditor
- [ ] Slash command `/video-gen` works
- [ ] Video generation API call succeeds (with valid API key)
- [ ] Progress indicator updates during generation
- [ ] Generated video plays in preview
- [ ] Download button saves video locally
- [ ] Error states display correctly
- [ ] 8-bit design compliance verified
- [ ] TypeScript compiles without errors
- [ ] No console errors in browser
