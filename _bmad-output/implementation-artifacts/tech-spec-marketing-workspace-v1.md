---
title: 'Marketing Workspace: Content Kitchen & Visual Studio'
slug: 'marketing-workspace-v1'
created: '2026-01-09T08:55:00+07:00'
updated: '2026-01-09T09:05:00+07:00'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - "@tanstack/ai: 0.2.0"
  - "@tanstack/ai-react: 0.2.0"
  - "@tanstack/ai-gemini: 0.2.0"
  - "@google/genai: 1.34.0"
  - "@google-cloud/text-to-speech: NEW"
  - "jszip: NEW"
files_to_modify:
  - "src/lib/agent/providers/provider-adapter.ts"
  - "src/lib/agent/providers/types.ts"
  - "src/i18n/en.json"
  - "src/i18n/vi.json"
files_to_create:
  - "src/routes/marketing.lazy.tsx"
  - "src/presentation/components/marketing/MarketingPage.tsx"
  - "src/presentation/components/marketing/CampaignDashboard.tsx"
  - "src/presentation/components/marketing/ContentKitchen/*"
  - "src/presentation/components/marketing/ProductStage/*"
  - "src/presentation/components/marketing/VoiceStudio/*"
  - "src/presentation/components/marketing/MarketInsights/*"
  - "src/lib/marketing/*"
  - "src/routes/api/marketing/*"
code_patterns:
  - "TanStack AI useChat hook with SSE streaming"
  - "@google/genai generateContent for images"
  - "3-panel ResizablePanelGroup layout"
  - "Zustand stores with Dexie persistence"
  - "Lazy loading with Suspense"
test_patterns:
  - "E2E with real Gemini API (NO MOCKS)"
  - "Integration testing module API keys"
  - "Playwright browser automation"
sprint_reference: "phase-3-marketing-sprint-2026-01-09.yaml"
epic_ids: ["EPIC-MKT-1", "EPIC-MKT-2", "EPIC-MKT-3", "EPIC-MKT-4", "EPIC-MKT-5"]
total_effort_hours: 68
---

# Tech-Spec: Marketing Workspace - Content Kitchen & Visual Studio

**Created:** 2026-01-09T08:55:00+07:00  
**Updated:** 2026-01-09T09:00:00+07:00  
**Sprint:** Phase 3 - Marketing Workspace (Team B)  
**Philosophy:** "Mì Ăn Liền" (Instant Noodles) - Fast, Fancy, Easy

---

## Overview

### Problem Statement

Vietnamese SME marketers (Chủ Shop, TikTokers, Marketing Executives) need a fast, AI-powered tool to create multi-platform content (Facebook, TikTok, Zalo) without agency costs.

**Current Pain Points:**
- Canva: Too slow, manual, not AI-native
- ChatGPT: No image generation, no Vietnamese voice
- Capcut: Still manual video editing
- Mintly: Expensive, English-focused

**Market Opportunity:**
- Vietnam: 89.6% Facebook, 86.6% Zalo, 80.9% TikTok penetration
- SMEs create 5-10 product posts per day
- Agency costs: 10-50M VND per campaign

### Solution

Build a dedicated `/marketing` workspace leveraging **existing TanStack AI + @google/genai infrastructure**:

1. **Content Kitchen**: AI text generation for FB, TikTok, Zalo using Gemini 2.5 Flash
2. **Product Stage**: AI background replacement using Gemini 2.5 Flash Image
3. **Voice Studio**: Vietnamese TTS using Google Cloud TTS API
4. **Market Insights**: Analyze public posts → Generate improved variations
5. **One-Click Campaign**: 1 photo → full marketing kit ZIP in 60 seconds

### Scope

**In Scope:**
1. `/marketing` route with "Vibrant" theme (Coral #FF6B6B, Teal #4ECDC4, Yellow #FFE66D)
2. Content Kitchen: Text generation for FB post, TikTok script, Zalo story
3. Product Stage: AI background replacement with 50+ Vietnamese scenes
4. Voice Studio: Vietnamese TTS (vi-VN voices: Bắc/Nam/GenZ)
5. One-Click Campaign: Full marketing kit ZIP export
6. Market Insights: Analyze public posts → Generate improved hooks/CTAs

**Out of Scope:**
1. Video editing/generation (defer to future phase)
2. Social media auto-posting APIs
3. Custom voice cloning

---

## Context for Development

### Codebase Patterns

#### Pattern 1: Route Definition (Lazy Loading)
**Source:** `/src/routes/notes.lazy.tsx`
```typescript
import { createLazyFileRoute } from '@tanstack/react-router';
import { ErrorBoundary } from '@/presentation/components/error';

export const Route = createLazyFileRoute('/marketing')({
  component: () => (
    <ErrorBoundary>
      <MarketingWorkspace />
    </ErrorBoundary>
  ),
});
```

#### Pattern 2: 3-Panel Resizable Layout
**Source:** `/src/routes/notes.lazy.tsx`
```typescript
<ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
  <ResizablePanel id="sidebar" defaultSize={20} collapsible collapsedSize={3}>
  <ResizableHandle withHandle />
  <ResizablePanel id="main" defaultSize={50} minSize={30}>
  <ResizableHandle withHandle />
  <ResizablePanel id="chat" defaultSize={30} collapsible collapsedSize={3}>
</ResizablePanelGroup>
```

#### Pattern 3: @google/genai Image Generation
**Source:** Research + Gemini API Docs
```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey });
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-image',
  contents: [
    { inlineData: { mimeType: 'image/png', data: base64Image } },
    { text: 'Place this product on a coffee table in a modern living room' }
  ]
});

// Extract generated image
for (const part of response.candidates[0].content.parts) {
  if (part.inlineData) {
    return Buffer.from(part.inlineData.data, 'base64');
  }
}
```

#### Pattern 4: Zustand Store with Dexie
**Source:** `/src/lib/notes/note-store.ts`
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMarketingStore = create<MarketingState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      activeCampaignId: null,
      // ... actions
    }),
    { name: 'marketing-store' }
  )
);
```

### Files to Reference

| File | Purpose | Pattern to Follow |
|------|---------|-------------------|
| `/src/routes/notes.lazy.tsx` | Route definition | Lazy loading with ErrorBoundary |
| `/src/presentation/components/notes/NotesPage.tsx` | Complex workspace | 3-panel layout, stores, events |
| `/src/lib/knowledge/flashcard-generator.ts` | Gemini API usage | @google/genai pattern |
| `/src/lib/agent/providers/provider-adapter.ts` | Provider factory | Adapter pattern |
| `/src/presentation/components/ui/resizable.tsx` | Panel layout | ResizablePanelGroup |
| `/src/presentation/components/chat/UnifiedChatPanel.tsx` | Chat integration | AI chat panel |

### Technical Decisions

1. **Gemini Adapter**: Wire `@tanstack/ai-gemini` into provider-adapter.ts for text generation
2. **Direct @google/genai**: Use for image generation (Gemini Image API)
3. **Separate API Routes**: `/api/marketing/*` for isolation and feature-specific handling
4. **BYOK Model**: All API keys from existing credential vault
5. **Browser TTS Fallback**: Use Web Speech API when Google TTS key not available
6. **JSZip for Export**: Client-side ZIP generation for One-Click Campaign

---

## Implementation Plan

### Phase 1: Foundation (Epic MKT-1) - 14h

#### Task 1.1: Create Marketing Route
- [ ] **File:** `src/routes/marketing.lazy.tsx`
- [ ] **Action:** Create new lazy route with ErrorBoundary wrapper
- [ ] **Pattern:** Follow `notes.lazy.tsx` structure
- [ ] **Code:**
```typescript
import { createLazyFileRoute } from '@tanstack/react-router';
import { ErrorBoundary } from '@/presentation/components/error';
import { MarketingPage } from '@/presentation/components/marketing/MarketingPage';

export const Route = createLazyFileRoute('/marketing')({
  component: () => (
    <ErrorBoundary>
      <MarketingPage />
    </ErrorBoundary>
  ),
});
```

#### Task 1.2: Create MarketingPage Component
- [ ] **File:** `src/presentation/components/marketing/MarketingPage.tsx`
- [ ] **Action:** Create 3-panel workspace layout
- [ ] **Panels:**
  - Left (20%): Campaign Sidebar
  - Center (50%): Active Tool (Content Kitchen / Product Stage / etc.)
  - Right (30%): AI Chat Panel
- [ ] **Notes:** Collapsible sidebar and chat, keyboard shortcuts Cmd+[ / Cmd+]

#### Task 1.3: Create Vibrant Theme CSS
- [ ] **File:** `src/presentation/components/marketing/marketing-theme.css`
- [ ] **Action:** Define CSS custom properties for Vibrant theme
- [ ] **Code:**
```css
[data-workspace="marketing"] {
  --primary: 0 78% 70%;        /* Coral #FF6B6B */
  --secondary: 169 59% 56%;    /* Teal #4ECDC4 */
  --accent: 45 100% 71%;       /* Yellow #FFE66D */
  --background: 240 17% 14%;   /* Dark gradient base */
}
```

#### Task 1.4: Create Marketing Sidebar
- [ ] **File:** `src/presentation/components/marketing/MarketingSidebar.tsx`
- [ ] **Action:** Navigation sidebar with tool icons
- [ ] **Items:**
  - 📊 Campaigns (dashboard)
  - ✍️ Content Kitchen (text gen)
  - 🎨 Product Stage (image gen)
  - 🎤 Voice Studio (TTS)
  - 🕵️ Market Insights (analysis)

#### Task 1.5: Create Marketing Store
- [ ] **File:** `src/lib/marketing/marketing-store.ts`
- [ ] **Action:** Zustand store for campaigns, assets, active tool state
- [ ] **State:**
```typescript
interface MarketingState {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  activeTool: 'campaigns' | 'content' | 'product' | 'voice' | 'insights';
  // ... actions
}
```

#### Task 1.6: Add i18n Strings
- [ ] **File:** `src/i18n/en.json`
- [ ] **Action:** Add marketing namespace
- [ ] **File:** `src/i18n/vi.json`
- [ ] **Action:** Add Vietnamese translations

### Phase 2: Product Stage (Epic MKT-2) - 16h

#### Task 2.1: Create Image Generator Service
- [ ] **File:** `src/lib/marketing/image-generator.ts`
- [ ] **Action:** Implement Gemini 2.5 Flash Image integration
- [ ] **Methods:**
  - `generateProductScene(image: string, scene: string, apiKey: string): Promise<string>`
  - `generateBatchScenes(image: string, scenes: string[], apiKey: string): Promise<string[]>`

#### Task 2.2: Create Product Stage UI
- [ ] **File:** `src/presentation/components/marketing/ProductStage/ProductStage.tsx`
- [ ] **Action:** Main product image manipulation interface
- [ ] **Components:**
  - Upload zone with drag-drop
  - Scene selector grid
  - Preview with zoom
  - Batch generation button

#### Task 2.3: Create Scene Selector
- [ ] **File:** `src/presentation/components/marketing/ProductStage/SceneSelector.tsx`
- [ ] **Action:** 50+ Vietnamese scene templates
- [ ] **Categories:** Home, Café, Outdoor, Festival, Office

#### Task 2.4: Create Image Generation API Route
- [ ] **File:** `src/routes/api/marketing/generate-image.ts`
- [ ] **Action:** Server route for image generation
- [ ] **Endpoint:** `POST /api/marketing/generate-image`
- [ ] **Body:** `{ productImage: string, scene: string, apiKey: string }`

### Phase 3: Content Kitchen (Epic MKT-3) - 18h

#### Task 3.1: Wire Gemini Adapter to Provider Factory
- [ ] **File:** `src/lib/agent/providers/provider-adapter.ts`
- [ ] **Action:** Add Gemini provider support
- [ ] **Code:**
```typescript
import { geminiText } from '@tanstack/ai-gemini';

// In createAdapter method:
if (providerId === 'gemini') {
  return geminiText(config.model || 'gemini-2.5-flash');
}
```

#### Task 3.2: Add Gemini Provider Config
- [ ] **File:** `src/lib/agent/providers/types.ts`
- [ ] **Action:** Add Gemini to PROVIDERS constant
- [ ] **Code:**
```typescript
gemini: {
  id: 'gemini',
  name: 'Google Gemini',
  type: 'gemini',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  enabled: true,
  defaultModel: 'gemini-2.5-flash',
  models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash']
}
```

#### Task 3.3: Create Content Generator Service
- [ ] **File:** `src/lib/marketing/content-generator.ts`
- [ ] **Action:** Text generation for multi-platform content
- [ ] **Methods:**
  - `generateFacebookPost(product: ProductInput, tone: Tone): Promise<FacebookContent>`
  - `generateTikTokScript(product: ProductInput, tone: Tone): Promise<TikTokContent>`
  - `generateZaloStory(product: ProductInput, tone: Tone): Promise<ZaloContent>`

#### Task 3.4: Create Content Kitchen UI
- [ ] **File:** `src/presentation/components/marketing/ContentKitchen/ContentKitchen.tsx`
- [ ] **Action:** Text generation interface
- [ ] **Features:**
  - Product input form (name, features, audience)
  - Tone selector (Professional, Casual, GenZ, Luxury)
  - Platform toggles (FB, TikTok, Zalo)
  - Streaming output display
  - Copy buttons per platform

#### Task 3.5: Create Tone Selector
- [ ] **File:** `src/presentation/components/marketing/ContentKitchen/ToneSelector.tsx`
- [ ] **Action:** Vietnamese-localized tone options
- [ ] **Tones:**
  - 👔 Chuyên nghiệp (Professional)
  - 😊 Thân thiện (Casual)
  - 🔥 Gen Z (Trendy)
  - ✨ Sang trọng (Luxury)

#### Task 3.6: Create Hashtag Generator
- [ ] **File:** `src/lib/marketing/hashtag-generator.ts`
- [ ] **Action:** Generate optimized hashtags
- [ ] **Categories:** Trending, Niche, Branded

### Phase 4: Voice Studio & Market Insights (Epic MKT-4) - 12h

#### Task 4.1: Install Google Cloud TTS
- [ ] **Action:** Run `npm install @google-cloud/text-to-speech`
- [ ] **Notes:** Add to package.json dependencies

#### Task 4.2: Create Voice Synthesizer Service
- [ ] **File:** `src/lib/marketing/voice-synthesizer.ts`
- [ ] **Action:** Vietnamese TTS with browser fallback
- [ ] **Voices:**
  - vi-VN-Wavenet-A (Female Northern)
  - vi-VN-Wavenet-D (Male Southern)
  - Custom GenZ preset (higher pitch, faster)
- [ ] **Fallback:** Browser SpeechSynthesis API

#### Task 4.3: Create Voice Studio UI
- [ ] **File:** `src/presentation/components/marketing/VoiceStudio/VoiceStudio.tsx`
- [ ] **Action:** TTS interface
- [ ] **Features:**
  - Script textarea
  - Voice selector
  - Speed slider (0.75x - 1.5x)
  - Preview playback
  - MP3 download

#### Task 4.4: Create Market Insights UI
- [ ] **File:** `src/presentation/components/marketing/MarketInsights/MarketInsights.tsx`
- [ ] **Action:** Competitor analysis interface
- [ ] **Features:**
  - URL input field
  - Analyze button
  - Insights display (hooks, CTAs, tone)
  - "Generate Better" button

#### Task 4.5: Create Content Analyzer Service
- [ ] **File:** `src/lib/marketing/content-analyzer.ts`
- [ ] **Action:** Analyze public content using Gemini
- [ ] **Output:** Structured insights (hook, CTA, tone, hashtags)

### Phase 5: One-Click Campaign (Epic MKT-5) - 8h

#### Task 5.1: Install JSZip
- [ ] **Action:** Verify `jszip` is installed, add if missing
- [ ] **Command:** `npm install jszip`

#### Task 5.2: Create Campaign Pipeline
- [ ] **File:** `src/lib/marketing/campaign-pipeline.ts`
- [ ] **Action:** Parallel generation orchestrator
- [ ] **Flow:**
  1. Receive product photo + info
  2. Parallel execute: Images, Content, Voice
  3. Aggregate results
  4. Create ZIP
  5. Return download URL

#### Task 5.3: Create Campaign Wizard UI
- [ ] **File:** `src/presentation/components/marketing/CampaignWizard/CampaignWizard.tsx`
- [ ] **Action:** Step-by-step wizard
- [ ] **Steps:**
  1. Upload product photo
  2. Enter product details
  3. Select platforms
  4. Generate (with progress)
  5. Review & Download

#### Task 5.4: Create ZIP Exporter
- [ ] **File:** `src/lib/marketing/zip-exporter.ts`
- [ ] **Action:** Client-side ZIP generation
- [ ] **Structure:**
```
campaign-{timestamp}.zip
├── images/
│   ├── lifestyle_1.png
│   ├── lifestyle_2.png
│   └── ...
├── text/
│   ├── facebook_post.txt
│   ├── tiktok_script.txt
│   └── zalo_caption.txt
├── audio/
│   └── voiceover_vi.mp3
└── README.txt
```

---

## Acceptance Criteria

### AC-1: Marketing Route Accessible
- [ ] **Given** the app is running
- [ ] **When** I navigate to `/marketing`
- [ ] **Then** the Marketing workspace loads with Vibrant theme
- [ ] **And** I see the 3-panel layout (Sidebar, Main, Chat)
- [ ] **And** the navigation shows 5 tools

### AC-2: Content Kitchen Generates Multi-Platform Content
- [ ] **Given** I am in Content Kitchen
- [ ] **When** I enter product name "Bánh Mì Nhà Làm" and features "Thơm, Giòn, Ngon"
- [ ] **And** I select tone "Gen Z" and platforms "Facebook, TikTok"
- [ ] **And** I click "Generate"
- [ ] **Then** I see streaming AI response for each platform
- [ ] **And** Facebook post includes hooks, emojis, hashtags
- [ ] **And** TikTok script has 15s/30s format options
- [ ] **And** I can copy each output with one click

### AC-3: Product Stage Generates Lifestyle Images
- [ ] **Given** I am in Product Stage
- [ ] **When** I upload a product photo (PNG/JPEG < 10MB)
- [ ] **And** I select scene "Quán cà phê Sài Gòn"
- [ ] **And** I click "Generate"
- [ ] **Then** I see progress indicator
- [ ] **And** the generated image appears within 20 seconds
- [ ] **And** I can download the result as PNG
- [ ] **And** I can generate batch (3-5 scenes at once)

### AC-4: Voice Studio Synthesizes Vietnamese Audio
- [ ] **Given** I am in Voice Studio
- [ ] **When** I enter script "Xin chào, đây là sản phẩm mới"
- [ ] **And** I select voice "Giọng Bắc Nữ"
- [ ] **And** I click "Preview"
- [ ] **Then** I hear Vietnamese audio playback
- [ ] **And** I can adjust speed (0.75x - 1.5x)
- [ ] **And** I can download as MP3
- [ ] **And** if no API key, browser TTS fallback works

### AC-5: Market Insights Analyzes Public Content
- [ ] **Given** I am in Market Insights
- [ ] **When** I paste a public Facebook post URL
- [ ] **And** I click "Analyze"
- [ ] **Then** I see structured insights: Hook, CTA, Tone, Hashtags
- [ ] **And** I can click "Generate Better Version"
- [ ] **And** I see 3 improved variations

### AC-6: One-Click Campaign Creates Full Kit
- [ ] **Given** I am in Campaign Wizard
- [ ] **When** I upload 1 product photo
- [ ] **And** I enter product name and 3 features
- [ ] **And** I click "Create Campaign"
- [ ] **Then** I see progress for: Images (3), Content (3), Voiceover
- [ ] **And** total generation completes in < 60 seconds
- [ ] **And** I can download ZIP with all assets
- [ ] **And** ZIP contains: /images, /text, /audio, README.txt

### AC-7: Vibrant Theme Applied
- [ ] **Given** I am in Marketing workspace
- [ ] **Then** primary color is Coral (#FF6B6B)
- [ ] **And** secondary color is Teal (#4ECDC4)
- [ ] **And** accent color is Yellow (#FFE66D)
- [ ] **And** buttons have hover animations
- [ ] **And** theme is distinct from Notes/IDE workspaces

### AC-8: BYOK API Keys Work
- [ ] **Given** I have a Gemini API key in Settings
- [ ] **When** I use Content Kitchen or Product Stage
- [ ] **Then** the request uses my stored API key
- [ ] **And** I see estimated cost per action
- [ ] **And** I can track API usage

---

## Additional Context

### Dependencies

**Existing (No install needed):**
| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/ai` | 0.2.0 | Core AI SDK |
| `@tanstack/ai-react` | 0.2.0 | useChat hook |
| `@tanstack/ai-gemini` | 0.2.0 | Gemini adapter (wire up needed) |
| `@google/genai` | 1.34.0 | Direct Gemini API |
| `react-resizable-panels` | - | Panel layout |
| `zustand` | - | State management |

**New (Install required):**
| Package | Purpose | Install |
|---------|---------|---------|
| `@google-cloud/text-to-speech` | Vietnamese TTS | `npm i @google-cloud/text-to-speech` |
| `jszip` | ZIP generation | `npm i jszip` (check if exists) |

### Testing Strategy

**E2E Testing (Integration Module):**
- Use real Gemini API keys from `_bmad/modules/integration-testing/config/api-keys-prod.yaml`
- NO MOCKS for AI functionality
- Browser matrix: Chromium + Firefox

**Unit Tests:**
```typescript
// src/lib/marketing/__tests__/content-generator.test.ts
describe('ContentGenerator', () => {
  it('generates Facebook post with hooks and hashtags', async () => {
    const result = await generateFacebookPost(product, 'genz');
    expect(result.post).toContain('#');
    expect(result.hooks.length).toBeGreaterThan(0);
  });
});
```

**E2E Tests:**
```typescript
// src/e2e/marketing.spec.ts
test('One-Click Campaign generates ZIP in under 60s', async ({ page }) => {
  await page.goto('/marketing');
  // Upload product photo
  // Fill details
  // Click generate
  // Wait for ZIP download (max 60s)
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/campaign-.*\.zip/);
});
```

### Notes

**High-Risk Items:**
1. **Gemini Image Generation Latency**: May exceed 20s target during peak load
   - Mitigation: Show engaging progress animation, optimize prompts
2. **Vietnamese TTS Quality**: WaveNet voices vary in quality
   - Mitigation: Provide voice preview, allow re-generation
3. **Browser TTS Fallback**: Limited Vietnamese voice quality
   - Mitigation: Clearly indicate when using fallback

**Performance Targets:**
| Feature | Target | Fallback |
|---------|--------|----------|
| Text generation | < 5s | 10s max |
| Image generation | < 20s | 30s max |
| Voice synthesis | < 5s | 10s max |
| Full campaign | < 60s | 90s max |

**BYOK Cost Estimate:**
| Feature | Cost | Notes |
|---------|------|-------|
| Text (Gemini Flash) | ~$0.001/request | Very low |
| Image (Gemini Image) | ~$0.02/image | 3 images = $0.06 |
| Voice (Cloud TTS) | ~$0.004/100 chars | WaveNet pricing |
| **Total per campaign** | **~$0.07** | Extremely affordable |

**Future Considerations (Out of Scope):**
1. Video generation/editing (Phase 4+)
2. Social media auto-posting integration
3. Custom voice cloning
4. Team collaboration features
5. Analytics dashboard

---

## Handoff Information

**Prepared for:** `/bmad-bmm-workflows-dev-story` or direct implementation
**Sprint:** Phase 3 Marketing Sprint (Team B)
**Parallel to:** Phase 2 Agentic Verification (Team A)
**Demo Deadline:** 2026-01-15

**Key Success Metric:**
> The "Mì Tôm" Demo: Upload 1 photo → Get 10 lifestyle images + FB post + TikTok script + Zalo story + Vietnamese voiceover → Download ZIP → **Under 60 seconds**

---

*Generated: 2026-01-09T09:00:00+07:00*
*Workflow: BMAD V6 Create Tech-Spec*
*Status: REVIEW (Pending Step 4 approval)*
