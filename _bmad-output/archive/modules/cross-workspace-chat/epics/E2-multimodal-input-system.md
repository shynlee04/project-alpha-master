# Epic E2: Multimodal Input System

**Document ID**: `cwac-epic-e2-2026-01-05`
**Epic**: E2
**Status**: `IN_PROGRESS`
**Created**: 2026-01-05
**Points**: 56
**Stories**: 8
**Timeline**: Weeks 2-5

---

## Executive Summary

Epic E2 implements **Voice-First Multimodal Conversations** as the #1 Wow-Factor feature for the Cross-Workspace AI Agent Platform. This epic enables natural voice interactions and file attachment capabilities across all workspaces.

### Key Features
- **Native Voice Input/Output**: Gemini 2.5 Flash Live API integration
- **File Attachments**: Image, PDF, and document upload in chat
- **Image Understanding**: Gemini 2.5 Pro multimodal vision
- **Mobile-First Voice**: Touch-optimized voice recording UI

---

## Business Value

| Metric | Target |
|--------|--------|
| **User Engagement** | +40% (voice interactions increase usage) |
| **Accessibility** | WCAG 2.1 AA compliance for voice UI |
| **Vietnamese Market** | Native Vietnamese voice support |
| **Mobile Usage** | +60% mobile sessions with voice |

---

## User Stories

### Story Breakdown

| ID | Title | Points | Priority | Dependencies |
|----|-------|--------|----------|--------------|
| E2-1 | Voice Input Foundation | 8 | P0 | None |
| E2-2 | Gemini Live API Integration | 10 | P0 | E2-1 |
| E2-3 | Vietnamese Voice Recognition | 8 | P0 | E2-2 |
| E2-4 | Voice Recording UI | 6 | P1 | E2-1 |
| E2-5 | Audio Output Playback | 6 | P1 | E2-2 |
| E2-6 | File Attachment UI | 8 | P1 | None |
| E2-7 | Image Understanding | 6 | P1 | E2-6 |
| E2-8 | Multimodal E2E Testing | 4 | P1 | All above |

**Total**: 8 stories, 56 points

---

## Technical Stack

### Voice Input
```typescript
// Gemini 2.5 Flash Live API
import { GoogleGenerativeAI } from '@google/generative-ai';

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-live',
  generationConfig: {
    responseModalities: ['AUDIO', 'TEXT'],
    speechConfig: {
      languageCode: 'vi-VN', // Vietnamese support
    },
  },
});
```

### File Attachments
```typescript
// Base64 encoding for image upload
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
```

---

## Acceptance Criteria (Epic Level)

### Voice Input
- [ ] Voice recording button visible in all chat panels
- [ ] Real-time audio streaming to Gemini Live API
- [ ] Vietnamese language recognition working
- [ ] Audio transcription displays in real-time
- [ ] Voice input toggles on/off cleanly

### File Attachments
- [ ] Attachment button in chat input toolbar
- [ ] File picker supports images, PDFs, documents
- [ ] File preview renders before sending
- [ ] File size limits enforced (10MB max)
- [ ] Progress indicator for uploads

### Image Understanding
- [ ] Images sent to Gemini 2.5 Pro vision
- [ ] Image analysis results in chat response
- [ ] Multiple images supported in single message
- [ ] Image thumbnails render in chat history

### Mobile Optimization
- [ ] Touch targets ≥44x44px (WCAG)
- [ ] Voice button prominent on mobile
- [ ] No keyboard overlap during voice recording
- [ ] Smooth animations for recording states

---

## API Integration

### Gemini Live API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `streamGenerateContent` | POST | Real-time audio streaming |
| `files.upload` | POST | Upload image/PDF files |
| `files.get` | GET | Retrieve uploaded file |

### Authentication
```typescript
// Environment variable for API key
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```

---

## i18n Requirements

### New Namespaces

```json
// src/i18n/en/voice.json
{
  "voice": {
    "record": "Tap to speak",
    "recording": "Listening...",
    "processing": "Processing...",
    "error": "Voice input unavailable"
  }
}

// src/i18n/vi/voice.json
{
  "voice": {
    "record": "Chạm để nói",
    "recording": "Đang nghe...",
    "processing": "Đang xử lý...",
    "error": "Giọng nói không khả dụng"
  }
}

// src/i18n/en/attachments.json
{
  "attachments": {
    "upload": "Attach file",
    "uploading": "Uploading...",
    "size_limit": "File too large (max 10MB)",
    "unsupported": "File type not supported"
  }
}

// src/i18n/vi/attachments.json
{
  "attachments": {
    "upload": "Đính kèm tệp",
    "uploading": "Đang tải lên...",
    "size_limit": "Tệp quá lớn (tối đa 10MB)",
    "unsupported": "Loại tệp không được hỗ trợ"
  }
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTIMODAL INPUT SYSTEM                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Voice UI    │    │  File UI     │    │  Image UI    │      │
│  │  Component   │    │  Component   │    │  Component   │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                   │                │
│         └───────────────────┼───────────────────┘                │
│                             │                                    │
│                             ▼                                    │
│              ┌───────────────────────────┐                       │
│              │   Multimodal Orchestrator │                       │
│              │   (useMultimodalInput)     │                       │
│              └───────────────┬───────────┘                       │
│                             │                                    │
│         ┌───────────────────┼───────────────────┐                │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ Gemini Live │    │  File Store  │    │ Gemini Vision│      │
│  │   API       │    │  (IndexedDB) │    │    API       │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Gemini Live API downtime | Low | High | Fallback to text input |
| Vietnamese recognition poor | Medium | High | Fine-tune with custom models |
| Mobile browser incompatibility | Low | Medium | Progressive enhancement |
| File quota exceeded | Low | Medium | IndexedDB cleanup on init |

---

## Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Voice interactions/1000 chats | 0 | 150+ |
| File attachments/1000 chats | 0 | 80+ |
| Mobile voice usage | 0% | 40%+ |
| Vietnamese voice accuracy | N/A | 85%+ |
| Avg response time (voice) | N/A | <2s |

---

## Dependencies

### External APIs
- **Google Gemini API**: Requires API key setup
- **Gemini Live API**: Beta access (GA Dec 2025)

### Internal Components
- `AgentChatPanel` - For UI integration
- `EnhancedChatInterface` - For input toolbar
- `useAgentChatWithTools` - For message handling

---

## Out of Scope

The following are intentionally deferred to future epics:
- Video input (Epic E6: Deep Research)
- Screen sharing (Epic E7: Web Grounding)
- Live paper format (Epic E10)
- Advanced workflow orchestration (Epic E4)

---

**Version**: 1.0.0
**Last Updated**: 2026-01-05
**Next Review**: After E2-4 completion
