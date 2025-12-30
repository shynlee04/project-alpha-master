# Story 10-2: Multimodal Source Vision (Desktop Only)

**Epic:** Epic 10 - Knowledge Chat & Synthesis
**Status:** deferred
**Points:** 5
**Priority:** P2 (Advanced Feature)
**Platform:** Desktop Only

---

## User Story

**As a** student asking about a diagram,
**I want** Gemini to "see" the PDF page I'm looking at,
**So that** it can explain charts and graphs in real-time.

---

## Acceptance Criteria

### AC-1: PDF Viewport Capture
**Given** the user is viewing a specific PDF page,
**When** they ask a question via voice (Desktop Live API),
**Then** the client captures the current viewport as a base64 JPEG (using `pdf.js`).
**And** sends it in the `clientContent` WebSocket frame alongside the audio chunk.
**And** the model references the visual content in its audio response.

### AC-2: Visual Content Explanation
**Given** multimodal vision is active,
**When** user asks "What does this chart show?",
**Then** AI describes the chart/figure in the captured viewport
**And** points out specific data trends visible in the image
**And** provides context from surrounding text

### AC-3: Automatic Viewport Update on Navigation
**Given** user scrolls to a new page,
**When** vision is still active,
**Then** the captured viewport updates automatically
**And** AI can answer questions about the new content

### AC-4: Mobile Fallback
**Given** user is not on desktop,
**When** they try to use vision,
**Then** show tooltip: "Vision requires desktop browser"
**And** text-based Q&A remains available

### AC-5: Image Quality Configuration
**Given** PDF is being captured for vision,
**When** viewport is captured,
**Then** image is optimized for model consumption (JPEG, appropriate quality)
**And** image size is manageable for WebSocket transmission (~500KB/min)

### AC-6: Error Handling for Invalid Content
**Given** PDF page cannot be captured,
**When** capture fails,
**Then** gracefully degrade to text-only mode
**And** show user message about vision unavailability

### AC-7: Vision Toggle Control
**Given** user is in voice chat mode,
**When** they toggle vision on/off,
**Then** vision state is persisted in store
**And** UI shows current vision state (active/inactive)

---

## Technical Notes

### PDF.js Integration
```typescript
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Configure worker
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Render page to canvas
const page = await pdfDoc.getPage(pageNumber);
const viewport = page.getViewport({ scale: 1.5 });
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.height = viewport.height;
canvas.width = viewport.width;

await page.render({ canvasContext: context, viewport }).promise;
```

### WebSocket Message with Image
```typescript
interface ClientContentWithImage {
  clientContent?: {
    parts: Array<{
      text?: string;
      inline_data?: {
        mime_type: string; // 'image/jpeg'
        data: string; // base64 encoded
      };
    }>;
  };
}

// Send alongside audio
const message: ClientContentWithImage = {
  clientContent: {
    parts: [
      { text: userQuery },
      {
        inline_data: {
          mime_type: 'image/jpeg',
          data: canvas.toDataURL('image/jpeg', 0.8).split(',')[1],
        },
      },
    ],
  },
};
```

### Image Quality Configuration
```typescript
const VISION_CONFIG = {
  scale: 1.5, // Higher scale for better text recognition
  quality: 0.8, // JPEG quality (0-1)
  maxWidth: 1024, // Limit width to reduce transmission size
  format: 'image/jpeg',
};
```

### Platform Detection
```typescript
const isVisionSupported = () => {
  return isDesktop() && typeof pdfjsLib !== 'undefined';
};
```

---

## Implementation Tasks

### T1: Create PDF Capture Service
**File:** `src/lib/rag/pdf-vision-capture.ts`
- Implement PDF.js integration
- Implement viewport to canvas rendering
- Implement JPEG base64 encoding
- Implement image optimization

### T2: Extend WebSocket Manager for Vision
**File:** `src/lib/rag/live-api-websocket.ts` (extend existing)
- Add sendImageWithMessage method
- Add multimodal message type handling
- Implement image + audio chunk batching

### T3: Create Vision State Management
**File:** `src/lib/state/rag-store.ts` (extend existing)
- Add vision mode state (enabled/disabled)
- Add current viewport tracking
- Add actions: toggleVision, captureViewport, setVisionPage

### T4: Create Vision Toggle Component
**File:** `src/components/rag/VisionToggle.tsx`
- Implement vision toggle button
- Show visual indicator when vision is active
- Desktop-only detection
- Mobile tooltip fallback

### T5: Implement PDF Page Change Detection
**File:** `src/lib/rag/pdf-vision-capture.ts`
- Detect when user navigates to new page
- Auto-capture viewport on page change
- Update vision state with new page info

### T6: Add i18n Translations
**Files:** `src/i18n/en.json`, `src/i18n/vi.json`
- Add translation keys for vision UI
- Add error messages for capture failures
- Add tooltips for mobile users

### T7: Error Handling and Fallback
**File:** `src/lib/rag/pdf-vision-capture.ts`
- Handle PDF.js load failures
- Handle canvas rendering failures
- Graceful degradation to text-only mode

### T8: Integration Testing
**Tests:** `src/lib/rag/__tests__/pdf-vision-capture.test.ts`
- Test PDF viewport capture
- Test image encoding
- Test multimodal message formatting
- Test error handling

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

- **Story 10-1**: Live API WebSocket Manager (for WebSocket connection)
- **pdfjs-dist**: PDF rendering library
- **Epic 6**: Source Ingestion (for PDF document handling)

---

## Demo Checkpoint

👁️ Point at chart → "This bar chart shows..." → Real-time audio explanation

---

## Platform Note

**Desktop Only** - This feature requires:
- PDF.js for viewport rendering
- WebSocket API for multimodal messages
- High bandwidth for image transmission (~500KB/min)

Mobile users will see a tooltip directing them to use desktop for vision, while text-based Q&A remains available.

---

## Out of Scope

- Video stream processing (images only)
- OCR text extraction from images (handled by model)
- Image caching/storing (capture on demand)
- Multiple viewport regions (single viewport capture)

---

## Definition of Done

- [x] Story file created and validated
- [ ] All acceptance criteria implemented
- [ ] PDF.js integration complete
- [ ] Viewport capture working
- [ ] Multimodal message formatting implemented
- [ ] Vision toggle component created
- [ ] i18n translations added (EN + VI)
- [ ] Desktop-only enforcement working
- [ ] Error handling and fallback implemented
- [ ] Integration tests written
- [ ] Code review approved
- [ ] No TypeScript errors
