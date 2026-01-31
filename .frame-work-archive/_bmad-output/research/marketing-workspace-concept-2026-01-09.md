---
title: "Marketing Workspace: Mì Ăn Liền Edition - Deep Research & WOW Concept"
date: 2026-01-09
status: APPROVED
author: "Antigravity (BMAD Core)"
version: 2.0
tags: [marketing, ai, deep-research, feature-concept, wow-factor]
sprint: phase-3-marketing-sprint-2026-01-09
team: Team B
---

# 🍜 Marketing Workspace: "Mì Ăn Liền Edition"
**"Nhanh như chớp, đẹp như mơ"** (Fast as lightning, beautiful as a dream)

---

## 1. Executive Summary

This document defines the **Marketing Workspace** — a dedicated environment for Vietnamese SME marketers and content creators to generate professional marketing assets using AI. 

**The Philosophy: "Instant Noodles" (Mì Ăn Liền)**
- **3-Second Hook**: Every feature must WOW in 3 seconds
- **Zero Learning Curve**: If grandma can't use it, redesign it
- **Premium Packaging**: Output looks like $10K agency work
- **Vietnamese DNA**: Built for FB/Zalo/TikTok VN first

**The Demo (The "Mì Tôm" Demo):**
> Upload 1 product photo → Get 10 lifestyle images + FB post + TikTok script + Zalo story + Vietnamese voiceover → Download as ZIP → **Under 60 seconds**

---

## 2. Market Research Findings

### 2.1 Vietnamese Social Media Landscape (2025)
| Platform | User Penetration | Primary Use Case |
|----------|------------------|------------------|
| Facebook | 89.6% | Community, Marketplace, News |
| Zalo | 86.6% | Messaging, Stories, Local business |
| TikTok | 80.9% | Entertainment, Discovery, Short-form ads |
| Instagram | 53.7% | Lifestyle, Influencers, Brand building |

**Key Insight**: Vietnamese users consume "snackable" content. Long-form is dying unless heavily stylized.

### 2.2 Target Users

#### User A: The SME Marketer (Chủ Shop)
- Runs 1-10 employee e-commerce shop (Shopee, Lazada, FB Marketplace)
- Creates 5-10 product posts per day
- Pain: Photoshop is too slow, Canva is too manual
- Budget: VND 0 - 500K/month for tools

#### User B: The Content Creator (TikToker)
- Creates 1-3 videos per day
- Needs: Hooks, scripts, trending sounds, voiceover
- Pain: Writer's block, trend tracking fatigue
- Budget: VND 0 - 1M/month

#### User C: The Marketing Executive (Trưởng Phòng Marketing)
- Manages campaigns for SME clients
- Needs: Multi-platform content from single brief
- Pain: Agency costs 10-50M VND/campaign
- Budget: Looking for alternatives

### 2.3 Competitive Landscape
| Tool | Strength | Weakness (Our Opportunity) |
|------|----------|---------------------------|
| Canva | Templates | Slow, manual, not AI-native |
| ChatGPT | Text quality | No images, no Vietnamese voice |
| Capcut | Video editing | Still manual, no AI content |
| Mintly | E-commerce ads | Expensive, English-focused |

**Our Opportunity**: All-in-one AI marketing kit, Vietnamese-first, BYOK pricing model (no subscription trap).

---

## 3. WOW Features (The "Gói Gia Vị")

### 🎯 Feature 1: One-Click Campaign ("Chiến Dịch Một Chạm")
**Demo Time: 60 seconds | WOW Factor: 10/10**

```
INPUT:  1 product photo + product name + 3 features
OUTPUT: 
  ├── /images/
  │   ├── lifestyle_1.jpg (product on coffee table)
  │   ├── lifestyle_2.jpg (product on wooden desk)
  │   ├── ... (10 total)
  │   └── lifestyle_10.jpg
  ├── /text/
  │   ├── facebook_post.txt
  │   ├── tiktok_script.txt
  │   └── zalo_story.txt
  ├── /audio/
  │   └── voiceover_vi.mp3
  └── README.txt
```

**User Journey:**
1. Upload photo of bánh mì
2. Enter: "Bánh Mì Nhà Làm - Thơm, Giòn, Ngon"
3. Click "Tạo Chiến Dịch"
4. Watch progress bars (fun animations!)
5. Download ZIP
6. Post on FB, TikTok, Zalo

---

### 🎨 Feature 2: Product Stage ("Sân Khấu Sản Phẩm")
**Demo Time: 10 seconds | WOW Factor: 9/10**

Upload product → AI removes background → Choose scene → Get lifestyle photo

**50+ Vietnamese-Relevant Scenes:**
- 🏠 **Home**: Bàn ăn gia đình, phòng khách, bếp
- ☕ **Café**: Quán cà phê Sài Gòn, rooftop bar
- 🏖️ **Outdoor**: Bãi biển Đà Nẵng, công viên, đường phố
- 🎊 **Festival**: Tết setup, Trung Thu, Valentine
- 💼 **Office**: Startup văn phòng, co-working space

**Tech Stack:**
- SAM 2 (Segment Anything) for background removal
- Flux Schnell for fast inpainting (~8 seconds)
- Local caching to avoid re-processing

---

### 🕵️ Feature 3: Idea Thief ("Ăn Cắp Ý Tưởng")
**Demo Time: 15 seconds | WOW Factor: 9/10**

Paste competitor URL → Get better copy

**How It Works:**
1. User pastes: `https://facebook.com/competitor/posts/123`
2. AI analyzes: Hook, CTA, Tone, Hashtags, Engagement
3. AI generates: 3 variations that are BETTER
4. User copies and posts

**Ethical Note:** We steal **ideas**, not **content**. All output is 100% original text.

---

### 🎤 Feature 4: AI Voice ("Giọng Đọc AI")
**Demo Time: 5 seconds | WOW Factor: 8/10**

Type script → Choose voice → Download MP3

**Vietnamese Voices:**
- 👩 **Giọng Bắc Nữ** (Northern Female) - Professional
- 👨 **Giọng Nam Nam** (Southern Male) - Friendly
- 🧑 **Giọng GenZ** (Young/Trendy) - Energetic

**Tech:** Google Cloud TTS Vietnamese with fallback to browser SpeechSynthesis.

---

### #️⃣ Feature 5: Hashtag Wizard ("Phù Thủy Hashtag")
**Demo Time: 3 seconds | WOW Factor: 7/10**

Analyzes content → Returns optimized hashtags

**Output Example:**
```
🔥 TRENDING (5):
#reviewdogonbattu #mofadoannhat #thucuongjahee #reviewdoanngon #saigonamthuc

🎯 NICHE (5):
#banhmihanoi #streetfoodvietnam #foodiehcm #ancuoituan #doanvat

💼 BRANDED (3):
#banhminhalam #banhmiyummy #tuoingonmoingay
```

---

## 4. Technical Architecture

### 4.1 Workspace Structure
```
src/
├── workspaces/
│   └── marketing/
│       ├── MarketingPage.tsx        # Main workspace
│       ├── components/
│       │   ├── CampaignDashboard/   # Campaign grid
│       │   ├── ProductStage/        # Background replacement
│       │   ├── ContentKitchen/      # Text generators
│       │   ├── VoiceStudio/         # TTS interface
│       │   └── AssetGallery/        # Asset management
│       ├── hooks/
│       │   ├── useProductStage.ts
│       │   ├── useContentGenerator.ts
│       │   └── useVoiceSynthesis.ts
│       └── services/
│           ├── image-generation-service.ts
│           ├── content-generator-service.ts
│           └── voice-synthesis-service.ts
```

### 4.2 API Integration Strategy
- **Primary**: Gemini 2.5 Flash (text, fast) + Gemini 2.5 Pro Vision (image analysis)
- **Image Gen**: Replicate/Flux (BYOK) with DALL-E 3 fallback
- **Voice**: Google Cloud TTS Vietnamese (BYOK) with browser fallback
- **Background Removal**: SAM 2 via Replicate or local ONNX model

### 4.3 BYOK Model (No Subscription Trap)
Users bring their own API keys:
- Gemini: Free tier exists, Pro is ~$0.002/request
- Replicate: Pay-per-image (~$0.02/image)
- Total cost per "Mì Tôm Demo": ~$0.10 - $0.30

---

## 5. Sprint Plan Summary

**Sprint ID**: phase-3-marketing-sprint-2026-01-09  
**Team**: Team B (Parallel to Phase 2 Team A)  
**Duration**: 6 days  
**Total Effort**: 68 hours  

| Epic | Name | Stories | Hours |
|------|------|---------|-------|
| EPIC-MKT-1 | Foundation & Theme | 5 | 14h |
| EPIC-MKT-2 | Product Stage | 5 | 16h |
| EPIC-MKT-3 | Content Kitchen | 6 | 18h |
| EPIC-MKT-4 | Voice & Video | 4 | 12h |
| EPIC-MKT-5 | One-Click Campaign | 3 | 8h |

**Demo Deadline**: 2026-01-15

---

## 6. Success Criteria

### The "Mì Tôm" Demo Must Work:
1. ✅ Upload 1 product photo
2. ✅ Get 10 lifestyle images (< 30s)
3. ✅ Get FB + TikTok + Zalo content (< 15s)
4. ✅ Get Vietnamese voiceover (< 10s)
5. ✅ Download ZIP (< 5s)
6. ✅ **Total time: Under 60 seconds**
7. ✅ Everyone says "ĐỊU!"

---

## 7. References

### Research Sources
- DataReportal Vietnam Social Media Stats 2025
- AJ Marketing Vietnam Insights
- Tavily AI Search (Vietnamese marketing trends)
- Mintly E-commerce AI Tools Analysis
- Google Cloud TTS Documentation

### Sprint Artifacts
- `_bmad-output/sprint-artifacts/phase-3-marketing-sprint-2026-01-09.yaml`
- `_bmad-output/planning-artifacts/marketing-epics-2026-01-09.md`

---

**End of Document**

*Generated: 2026-01-09T08:35:00+07:00*  
*Author: BMAD Core Brainstorming + Deep Research*  
*Next Step: Team B begins MKT-01 (Workspace Shell)*
