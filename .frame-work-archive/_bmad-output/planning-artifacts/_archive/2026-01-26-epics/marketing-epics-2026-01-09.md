# Marketing Workspace Epics (Phase 2 Expansion)

**Version**: 1.0.0
**Generated**: 2026-01-09
**Phase**: Phase 2 Expansion
**Source**: `_bmad-output/research/marketing-workspace-concept-2026-01-09.md`

## Executive Summary
These epics define the "Marketing Workspace" — a specialized environment for "Instant Noodles" content creation (fast, fancy, AI-driven) targeting the Vietnamese market. These epics are added to **Phase 2** to demonstrate the Agentic Capabilities in a real-world scenario.

---

## EPIC-40: Marketing Workspace Foundation

**Priority**: P1 - High
**Effort**: ~12 hours
**Dependencies**: EPIC-31 (AI Service Unification)

**Description**:
Create the dedicated `marketing` workspace shell, distinct "Vibrant" branding, and "Campaign Board" navigation.

**Success Criteria**:
1. New route `/marketing` accessible.
2. "Vibrant" theme (Neon/Gradient) distinct from IDE/Notes.
3. Kanban-style "Campaign Board" for managing content assets.
4. Integrated with unified `AgentExecutionService`.

### Stories
| Story ID | Title | Effort | Priority | Acceptance Criteria |
|----------|-------|--------|----------|---------------------|
| **40-01** | Create Marketing Workspace shell | 2h | P1 | - `/marketing` route added<br>- WorkspaceLayout component created<br>- Sidebar navigation (Campaigns, Assets, Studio) |
| **40-02** | Implement "Vibrant" Theme System | 3h | P1 | - Theme override for Marketing workspace<br>- Neon/Gradient color palette<br>- "Instant Noodles" fast/fun UI micro-interactions |
| **40-03** | Create Campaign Board (Kanban) | 3h | P1 | - Columns: Ideas, Generating, Polishing, Published<br>- Drag-drop cards<br>- Persisted to `project-store` or new `campaign-store` |
| **40-04** | Implement Asset Vault Integration | 2h | P1 | - `/assets/marketing/` folder sync<br>- Gallery view for images/videos<br>- Drag-drop to board |
| **40-05** | Configure Marketing Agent Persona | 2h | P1 | - `system-prompt` optimized for Vietnamese marketing trends<br>- "Trendy/Viral" tone settings<br>- Tools: `generate_image`, `search_trends` enabled |

---

## EPIC-41: The Content Kitchen (Text AI)

**Priority**: P1 - High
**Effort**: ~14 hours
**Dependencies**: EPIC-40, EPIC-31

**Description**:
Implements the "Content Kitchen" — specialized generators for Blogs and Social Media using Gemini 2.5 Flash for speed.

**Success Criteria**:
1. "Instant Blog" generator functioning (<10s generation).
2. Social Media Remix (One input -> Multi-platform output).
3. "Flavor Pack" tone selector working.

### Stories
| Story ID | Title | Effort | Priority | Acceptance Criteria |
|----------|-------|--------|----------|---------------------|
| **41-01** | Implement "Flavor Pack" Slices | 3h | P1 | - UI for selecting Tones (Professional, GenZ, Tycoon)<br>- Template prompts mapped to tones<br>- AI context injection working |
| **41-02** | Create "Instant Blog" Generator | 4h | P1 | - Input: Topic + Keywords<br>- Chain-of-Thought: Outline -> Draft -> Polish<br>- Markdown output with headers |
| **41-03** | Implement Social Media Remix | 4h | P1 | - Input: URL or Text<br>- Parallel generation: FB, TikTok Script, LinkedIn<br>- Copy-paste friendly cards |
| **41-04** | Add SEO Optimizer Tool | 3h | P1 | - Analyze generated text<br>- Suggest keywords (Vietnamese/English)<br>- Score readability (Flesch-Kincaid equivalent for VN) |

---

## EPIC-42: The Visual Studio (Image AI)

**Priority**: P2 - Medium
**Effort**: ~16 hours
**Dependencies**: EPIC-40, EPIC-P2-1 (Agent Tool Verification)

**Description**:
Implements the "Visual Studio" — AI image generation and manipulation tools using DALL-E 3 / Flux via API.

**Success Criteria**:
1. Text-to-Image generation working.
2. "Product Stage" background replacement working.
3. Images saved automatically to Asset Vault.

### Stories
| Story ID | Title | Effort | Priority | Acceptance Criteria |
|----------|-------|--------|----------|---------------------|
| **42-01** | Integrate Image Generation API | 3h | P1 | - Service layer for DALL-E/Flux<br>- Proxy handling for API keys<br>- Error handling/Rate limiting |
| **42-02** | Create "Product Stage" Tool | 4h | P2 | - Upload image area<br>- Masking UI (simple brush)<br>- In-painting prompt generation |
| **42-03** | Implement Text-Over-Image Layouts | 4h | P2 | - Canvas editor (Fabric.js or similar capability)<br>- Drag-drop text layers<br>- "Smart Contrast" for readability |
| **42-04** | Create "Instant Reel" (Slideshow) | 5h | P2 | - Select 3-5 images<br>- Transitions + Text overlay<br>- Export as .mp4 (using client-side ffmpeg or CSS animation capture) |

