---
date: 2025-12-30
time: 14:56:00
phase: Story Development Cycle
team: Team-A
agent_mode: bmad-bmm-analyst
---

# Story 29-1: About Me Redesign - Story Context & Validation

## 1. Story Overview

| Property | Value |
|----------|-------|
| **Story ID** | 29-1 |
| **Epic** | Epic 29: About Me Redesign |
| **Title** | Story Context & Validation Document |
| **Status** | PLANNING |
| **Priority** | P0 (Foundation) |
| **Story Points** | 3 |
| **Dependencies** | None (Foundation Story) |
| **Owner** | BMAD Master Orchestrator |

## 2. Executive Summary

This is the foundational story for Epic 29 that establishes the complete context, validation criteria, and implementation roadmap for the About Me page redesign. The redesign aims to transform the existing basic About page into a strategic recruitment asset that demonstrates engineering capabilities to technical recruiters, particularly in the Vietnam job market.

**Primary Objective:** Create a compelling professional narrative that positions the candidate as a Senior AI/Agentic Systems Engineer with expertise across the full technology stack.

**Target Audience:** Technical recruiters and hiring managers at:
- AI-first companies (Notion AI, LangChain, OpenAI, Anthropic)
- Enterprise technology companies seeking AI integration
- Vietnamese tech companies with AI ambitions
- International companies hiring remote Vietnamese talent

## 3. Strategic Context

### 3.1 Career Positioning Strategy

The About page must align with the career positioning outlined in `_bmad-output/career/vietnam-job-market-analysis-2025-12-30.md`:

**Target Role:** Senior AI Engineer / Agentic Systems Architect

**Key Differentiators:**
- Fullstack engineering with AI/agentic specialization
- Browser-based IDE with WebContainer integration (unique technical differentiation)
- Local-first architecture with privacy-preserving design
- Vietnamese market understanding with international experience
- Educational technology background with AI transformation

**Competitive Landscape Analysis:**
- Position against off-the-shelf portfolio templates
- Demonstrate engineering depth through code quality indicators
- Showcase innovation in agentic system development
- Highlight unique combination of frontend + backend + AI capabilities

### 3.2 User Journey Mapping

The About page serves multiple user journeys with different time investments and goals:

| Journey Stage | Time Investment | User Goal | Content Strategy |
|---------------|-----------------|-----------|------------------|
| **6-Second Scan** | 6 seconds | Quick impression assessment | Hero identity, visual hook, key metrics |
| **30-Second Scan** | 30 seconds | Evaluate fit for role | Stats bar, journey summary, skills overview |
| **2-5 Minute Exploration** | 2-5 minutes | Deep evaluation | Full journey narrative, project showcase, timeline |
| **Action Phase** | Variable | Take next step | Contact CTAs, project links, availability |

**User Personas:**
1. **Technical Recruiter** - Scans for keywords, checks GitHub, evaluates technical depth
2. **Hiring Manager** - Assesses cultural fit, leadership potential, technical breadth
3. **Engineering Lead** - Evaluates architecture capabilities, code quality, system design
4. **Peer Engineer** - Looks for interesting problems solved, technical challenges overcome

## 4. Current State Assessment

### 4.1 Existing Implementation Analysis

**Location:** `src/components/about/AboutPage.tsx` + `src/routes/about.tsx`

**Current State (as of 2025-12-30):**
- Basic single-page component (~140 lines)
- Flat structure with minimal visual hierarchy
- Generic professional narrative without career transformation story
- Only 2 quantified metrics (years experience, projects completed)
- No animations or micro-interactions
- Basic responsive design only
- Standalone page with no navigation integration
- No career positioning alignment

**Current Gaps Identified:**

| Gap Category | Current State | Desired State | Impact |
|-------------|---------------|---------------|--------|
| **Visual Hierarchy** | Flat structure | Progressive information disclosure | Low engagement |
| **Professional Narrative** | Generic summary | Transformation story (Education → AI) | Poor differentiation |
| **Quantified Metrics** | 2 metrics | 4+ animated metrics | Weak credibility |
| **Navigation Integration** | Standalone | Quick links, CTAs, route connections | Poor user flow |
| **Animation/Interaction** | Static | Particle effects, scroll animations | Low memorability |
| **Responsive Design** | Basic | Full responsive with breakpoints | Poor mobile experience |
| **Career Alignment** | Generic | Vietnam market positioning | Poor targeting |

### 4.2 Technical Debt Assessment

**Dependencies to Leverage:**
- Design tokens system (`src/styles/design-tokens.css`)
- Animation system (`src/styles/animations.css`)
- i18n infrastructure (i18next)
- React + TanStack Router for routing
- Tailwind CSS for styling
- Lucide React for icons

**New Components Required:**
- `HeroSection` - Identity statement with animations
- `StatsBar` - Scroll-fixed metrics with count-up animations
- `JourneySection` - Career transformation narrative
- `SkillsMatrix` - Categorized skills showcase
- `ProjectShowcase` - Via-gent architecture diagram
- `AchievementTimeline` - Key accomplishments
- `ContactSection` - CTAs and availability

## 5. Design Specifications

### 5.1 Visual Design System

**Design Philosophy:** 8-bit Gaming Style with MistralAI-inspired orange accents

**Color Palette (from design tokens):**
- Primary: `#FF6B35` (MistralAI orange for accents)
- Background: Dark theme with `#1A1A2E`, `#16213E`, `#0F0E17`
- Text: `#E8E8E8` (primary), `#A0A0A0` (secondary)
- Success: `#4CAF50`
- Warning: `#FF9800`
- Error: `#F44336`

**Typography System:**
- Headings: Pixel-style or retro gaming font for 8-bit aesthetic
- Body: Clean sans-serif (Inter or system font)
- Code snippets: Monospace font

**Responsive Breakpoints:**
- Mobile: < 768px (single column, stacked sections)
- Tablet: 768px - 1024px (two columns where appropriate)
- Desktop: 1024px - 1440px (full layout with sidebar stats)
- Large Desktop: > 1440px (enhanced spacing, max-width constraints)

### 5.2 Information Architecture

The About page is structured into 7 major sections with clear visual hierarchy:

```
About Page Structure
├── Hero Section (100vh)
│   ├── Identity Statement
│   ├── Animated Background
│   └── Scroll Indicator
├── Stats Bar (sticky, 4 metrics)
│   ├── 15+ Agents Built
│   ├── <1 Month MVP
│   ├── 10+ Technologies
│   └── Enterprise Architecture
├── Journey Section (60vh+)
│   ├── Career Transformation Narrative
│   ├── Key Role Transitions
│   └── Skills Acquired Timeline
├── Skills Matrix (variable height)
│   ├── Agentic Systems
│   ├── Frontend Engineering
│   ├── Backend & Infrastructure
│   └── Process & Leadership
├── Project Showcase (40vh+)
│   ├── Via-gent Architecture Diagram
│   ├── Key Features List
│   └── Link to Live Demo
├── Achievement Timeline (variable)
│   ├── 6 Key Accomplishments
│   └── Quantified Impact Metrics
└── Contact Section (30vh)
    ├── Primary CTA (Email)
    ├── Secondary CTA (LinkedIn/GitHub)
    ├── Availability Status
    └── Timezone (ICT/UTC+7)
```

### 5.3 Content Strategy Framework

**Hero Section Content:**
- **Identity Statement:** "Building the Future of AI-Powered Development"
- **Subtitle:** "Senior AI Engineer | Agentic Systems Architect | Fullstack Developer"
- **Visual Hook:** Animated particle background with orange accent glow

**Stats Bar Metrics:**
1. **15+ Agents Built** - Demonstrates agentic systems expertise
2. **<1 Month MVP** - Shows rapid prototyping capability
3. **10+ Technologies** - Proves technical breadth
4. **Enterprise Architecture** - Indicates scalable system design

**Journey Section Narrative:**
- **Opening Hook:** "From education technology to AI agent architecture"
- **Transformation Story:** Education Leader → AI Engineer transition
- **Key Accomplishments:** Quantified achievements at each career stage
- **Future Vision:** Building the Knowledge Synthesis Station

**Skills Matrix Categories:**

| Category | Skills to Showcase | Evidence/Projects |
|----------|-------------------|-------------------|
| **Agentic Systems** | AI Agents, Tool Use, Multi-agent Orchestration | Via-gent agent system, agent tools framework |
| **Frontend Engineering** | React, TypeScript, Tailwind, Radix UI | IDE components, design system |
| **Backend & Infrastructure** | Node.js, WebContainers, File System Access API | WebContainer integration, sync architecture |
| **Process & Leadership** | Code Review, Architecture Design, Mentorship | Engineering practices, documentation |

**Project Showcase Content:**
- **Via-gent Overview:** Browser-based IDE with AI agent capabilities
- **Architecture Diagram:** Interactive visual showing system components
- **Key Metrics:** Performance benchmarks, user engagement data
- **Tech Stack:** Full list of technologies used

**Achievement Timeline Events:**
1. Career transition decision (Education → AI)
2. First AI agent implementation
3. WebContainer integration breakthrough
4. Multi-agent orchestration system
5. Knowledge Synthesis Station vision
6. Current position and future goals

**Contact Section Content:**
- **Primary CTA:** "Ready to discuss opportunities"
- **Secondary CTAs:** GitHub, LinkedIn, email
- **Availability:** "Actively seeking new opportunities"
- **Timezone:** "ICT (UTC+7) - Available for calls 9AM-6PM"

## 6. Technical Requirements

### 6.1 Component Architecture

**Component Hierarchy:**
```
AboutPage (Route Component)
├── HeroSection
│   ├── AnimatedBackground
│   ├── IdentityText
│   └── ScrollIndicator
├── StatsBar
│   └── StatCard × 4
├── JourneySection
│   ├── CareerTimeline
│   └── TransformationNarrative
├── SkillsMatrix
│   ├── SkillCategory × 4
│   └── SkillCard × N
├── ProjectShowcase
│   ├── ArchitectureDiagram
│   └── FeatureList
├── AchievementTimeline
│   └── AchievementCard × 6
└── ContactSection
    ├── AvailabilityBadge
    ├── PrimaryCTA
    └── SocialLinks
```

**Component Files Structure:**
```
src/components/about/
├── index.ts (barrel export)
├── HeroSection.tsx
├── StatsBar.tsx
├── JourneySection.tsx
├── SkillsMatrix.tsx
├── ProjectShowcase.tsx
├── AchievementTimeline.tsx
├── ContactSection.tsx
└── __tests__/
    ├── HeroSection.test.tsx
    ├── StatsBar.test.tsx
    └── ... (other component tests)
```

### 6.2 State Management

**Local State Requirements:**
- Scroll position tracking (for StatsBar visibility)
- Animation trigger states (Intersection Observer)
- Mobile menu state (if applicable)

**Global State Dependencies:**
- None required for About page (isolated feature)
- May integrate with navigation store for route transitions

### 6.3 Performance Requirements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **LCP (Largest Contentful Paint)** | < 2.5s | Lighthouse audit |
| **FID (First Input Delay)** | < 100ms | Lighthouse audit |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Lighthouse audit |
| **First Paint** | < 1.0s | Performance monitoring |
| **Time to Interactive** | < 3.0s | Lighthouse audit |

**Optimization Strategies:**
- Code splitting with `React.lazy` and `Suspense`
- Lazy load sections below the fold
- Optimize animated background (web workers or canvas)
- Preload critical assets
- Use CSS animations over JavaScript where possible

### 6.4 Accessibility Requirements

**WCAG 2.1 AA Compliance:**

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard Navigation** | All interactive elements accessible via Tab |
| **Focus Indicators** | Visible focus rings (orange accent) |
| **Screen Reader Support** | ARIA labels, semantic HTML, alt text |
| **Color Contrast** | Minimum 4.5:1 for text, 3:1 for large text |
| **Reduced Motion** | Respect `prefers-reduced-motion` media query |
| **Skip Links** | Skip to main content link |
| **Semantic HTML** | Proper heading hierarchy (h1 → h2 → h3) |

**ARIA Attributes Required:**
- `aria-label` for icon-only buttons
- `aria-expanded` for mobile menu
- `aria-current="page"` for navigation
- `role="region"` for each section with accessible name

### 6.5 Internationalization (i18n)

**Translation Keys Required:**

```typescript
// English (en.json)
{
  "about": {
    "hero": {
      "identity": "Building the Future of AI-Powered Development",
      "subtitle": "Senior AI Engineer | Agentic Systems Architect | Fullstack Developer"
    },
    "stats": {
      "agentsBuilt": "15+ Agents Built",
      "mvpTime": "<1 Month MVP",
      "technologies": "10+ Technologies",
      "architecture": "Enterprise Architecture"
    },
    "journey": {
      "title": "My Journey",
      "transformation": "From education technology to AI agent architecture"
    },
    "contact": {
      "available": "Actively seeking new opportunities",
      "timezone": "ICT (UTC+7)",
      "email": "Get in Touch",
      "github": "View GitHub",
      "linkedin": "Connect on LinkedIn"
    }
  }
}

// Vietnamese (vi.json)
{
  "about": {
    "hero": {
      "identity": "Xây dựng tương lai của phát triển với AI",
      "subtitle": "Kỹ sư AI Cao cấp | Kiến trúc sư Hệ thống Agent | Phát triển Fullstack"
    },
    "stats": {
      "agentsBuilt": "15+ Agent đã xây dựng",
      "mvpTime": "MVP dưới 1 tháng",
      "technologies": "10+ Công nghệ",
      "architecture": "Kiến trúc Doanh nghiệp"
    },
    // ... other translations
  }
}
```

**i18n Extraction Command:**
```bash
pnpm i18n:extract
```

## 7. Acceptance Criteria

### 7.1 Functional Requirements

- [ ] **AC-1:** Page loads with Hero section visible above fold (100vh)
- [ ] **AC-2:** Stats bar becomes sticky on scroll and animates count-up when visible
- [ ] **AC-3:** All 7 sections are scrollable with smooth navigation
- [ ] **AC-4:** Contact CTAs link to correct destinations (email, GitHub, LinkedIn)
- [ ] **AC-5:** Navigation links work correctly to other sections of the site
- [ ] **AC-6:** Mobile layout stacks sections correctly (single column)
- [ ] **AC-7:** Tablet layout optimizes two-column sections where appropriate

### 7.2 Visual Requirements

- [ ] **AC-8:** 8-bit gaming aesthetic applied consistently throughout
- [ ] **AC-9:** MistralAI orange (#FF6B35) used for accents and highlights
- [ ] **AC-10:** Dark theme background with proper contrast ratios
- [ ] **AC-11:** Particle animation in Hero section with orange accent glow
- [ ] **AC-12:** Scroll animations trigger at appropriate Intersection Observer thresholds
- [ ] **AC-13:** Typography hierarchy follows design tokens specifications
- [ ] **AC-14:** Responsive breakpoints function correctly (mobile/tablet/desktop)

### 7.3 Performance Requirements

- [ ] **AC-15:** LCP < 2.5 seconds
- [ ] **AC-16:** FID < 100 milliseconds
- [ ] **AC-17:** CLS < 0.1
- [ ] **AC-18:** Code splitting implemented with lazy-loaded sections
- [ ] **AC-19:** Reduced motion preference respected

### 7.4 Accessibility Requirements

- [ ] **AC-20:** Keyboard navigation works for all interactive elements
- [ ] **AC-21:** Focus indicators visible and styled with orange accent
- [ ] **AC-22:** Screen reader can navigate all sections with proper labels
- [ ] **AC-23:** Color contrast meets WCAG 2.1 AA standards
- [ ] **AC-24:** Skip link provided for keyboard users
- [ ] **AC-25:** Semantic HTML structure with proper heading hierarchy

### 7.5 Internationalization Requirements

- [ ] **AC-26:** All text content uses `t()` hook from i18next
- [ ] **AC-27:** English (en) translations complete
- [ ] **AC-28:** Vietnamese (vi) translations complete
- [ ] **AC-29:** Language switcher works correctly
- [ ] **AC-30:** Translation extraction command succeeds without errors

### 7.6 Testing Requirements

- [ ] **AC-31:** Unit tests for each component (HeroSection, StatsBar, etc.)
- [ ] **AC-32:** Integration test for About page route
- [ ] **AC-33:** Accessibility tests with jest-axe or similar
- [ ] **AC-34:** Visual regression tests (Chromatic or Percy)
- [ ] **AC-35:** Performance audit passes (Lighthouse score > 90)

## 8. Dependencies and Constraints

### 8.1 External Dependencies

| Dependency | Version | Purpose | Status |
|------------|---------|---------|--------|
| React | ^18.3.1 | UI framework | Available |
| TanStack Router | ^1.0+ | Routing | Available |
| Tailwind CSS | ^3.4+ | Styling | Available |
| Lucide React | ^0.460+ | Icons | Available |
| i18next | ^23.0+ | Internationalization | Available |
| framer-motion | ^11.0+ | Animations | To be added |
| clsx | ^2.1+ | ClassName utility | Available |
| tailwind-merge | ^2.3+ | Tailwind utility merge | Available |

### 8.2 Internal Dependencies

| Component | Purpose | Status |
|-----------|---------|--------|
| Design Tokens (`src/styles/design-tokens.css`) | Visual design system | Available |
| Animation System (`src/styles/animations.css`) | CSS animations | Available |
| Error Boundary (`src/components/common/ErrorBoundary.tsx`) | Error handling | Available |
| useResponsive Hook (`src/hooks/useResponsive.ts`) | Breakpoint detection | Available |

### 8.3 Constraints

| Constraint | Description | Mitigation |
|------------|-------------|------------|
| **No New Dependencies** | Avoid adding new npm packages beyond framer-motion | Use existing CSS/JS for animations if possible |
| **Code Splitting** | Large page requires lazy loading | React.lazy + Suspense for sections |
| **Browser Compatibility** | Must work in Chrome/Edge/Firefox/Safari | Test cross-browser, use polyfills as needed |
| **Performance Budget** | LCP < 2.5s, bundle size limits | Optimize images, lazy load, code split |
| **Accessibility Compliance** | WCAG 2.1 AA required | Manual testing + automated axe tests |

## 9. Implementation Roadmap

### 9.1 Story Sequence

| Story | Title | Points | Description |
|-------|-------|--------|-------------|
| **29-1** | Story Context & Validation | 3 | This document - foundation for all stories |
| **29-2** | Hero Section | 5 | Identity statement, animated background |
| **29-3** | Stats Bar | 3 | Scroll-fixed metrics with count-up |
| **29-4** | Journey Section | 5 | Career transformation narrative |
| **29-5** | Skills Matrix | 5 | Categorized skills showcase |
| **29-6** | Project Showcase | 5 | Via-gent architecture diagram |
| **29-7** | Achievement Timeline | 3 | Key accomplishments timeline |
| **29-8** | Contact Section | 2 | CTAs and availability |
| **29-9** | Navigation Integration | 3 | Quick links, route connections |
| **29-10** | Accessibility & Testing | 5 | WCAG compliance, test coverage |
| **29-11** | Internationalization & L10n | 3 | EN + VI translations |
| **Total** | | **42** | |

### 9.2 Parallel Development Strategy

**Team Assignment:**

| Team | Stories | Rationale |
|------|---------|-----------|
| **Team A** | 29-2, 29-3, 29-7, 29-8 | UI components, visual sections |
| **Team B** | 29-4, 29-5, 29-6 | Content-heavy sections requiring narrative |
| **Both** | 29-9, 29-10, 29-11 | Integration, accessibility, i18n |

**Integration Points:**
- Story 29-2 (Hero) → Story 29-3 (Stats) → Story 29-4 (Journey)
- Story 29-5 (Skills) can parallel Story 29-6 (Projects)
- Story 29-9 (Navigation) depends on all sections complete
- Story 29-10 (Accessibility) depends on all sections complete
- Story 29-11 (i18n) depends on all text content complete

### 9.3 Milestone Schedule

| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| **M1: Foundation Complete** | Day 1 | Story 29-1 (this document) |
| **M2: Core Sections Complete** | Day 3 | Stories 29-2 through 29-8 |
| **M3: Integration Complete** | Day 5 | Stories 29-9, 29-10, 29-11 |
| **M4: Final Polish** | Day 7 | Retrospective, documentation |

## 10. Validation Checklist

### 10.1 Design Validation

- [ ] **DV-1:** Hero section captures attention within 6 seconds
- [ ] **DV-2:** Stats bar provides quick credibility indicators
- [ ] **DV-3:** Journey narrative tells compelling transformation story
- [ ] **DV-4:** Skills matrix showcases breadth and depth
- [ ] **DV-5:** Project showcase demonstrates technical capability
- [ ] **DV-6:** Timeline highlights key achievements
- [ ] **DV-7:** Contact section has clear CTAs

### 10.2 Technical Validation

- [ ] **TV-1:** All components use TypeScript interfaces (not type aliases)
- [ ] **TV-2:** All styles use design tokens (no hardcoded values)
- [ ] **TV-3:** All text uses i18n t() hook
- [ ] **TV-4:** Components follow import order convention
- [ ] **TV-5:** Error boundaries wrap all sections
- [ ] **TV-6:** Accessibility attributes properly applied

### 10.3 Quality Validation

- [ ] **QV-1:** Lighthouse accessibility score > 90
- [ ] **QV-2:** Lighthouse performance score > 90
- [ ] **QV-3:** Lighthouse SEO score > 90
- [ ] **QV-4:** Unit test coverage > 80%
- [ ] **QV-5:** No console errors or warnings
- [ ] **QV-6:** Cross-browser compatibility verified

## 11. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Animation Performance** | Medium | High | Use CSS animations, test on low-end devices |
| **Content Complexity** | Low | Medium | Modular component design, lazy loading |
| **i18n Completeness** | Medium | Low | Automated extraction, bilingual review |
| **Accessibility Compliance** | Medium | High | Automated testing + manual audit |
| **Cross-browser Issues** | Low | Medium | Test in all target browsers |

## 12. References and Resources

### 12.1 Internal References

| Document | Path | Purpose |
|----------|------|---------|
| Design Tokens | `src/styles/design-tokens.css` | Visual design system |
| Animation Styles | `src/styles/animations.css` | CSS animations |
| Career Context | `_bmad-output/career/vietnam-job-market-analysis-2025-12-30.md` | Career positioning |
| Design Tokens TypeScript | `src/styles/design-tokens.ts` | TypeScript constants |
| Error Boundary | `src/components/common/ErrorBoundary.tsx` | Error handling |
| useResponsive Hook | `src/hooks/useResponsive.ts` | Breakpoint detection |

### 12.2 External Resources

| Resource | URL | Purpose |
|----------|-----|---------|
| WCAG 2.1 Guidelines | https://www.w3.org/WAI/WCAG21/quickref/ | Accessibility standards |
| TanStack Router | https://tanstack.com/router | Routing documentation |
| i18next Documentation | https://www.i18next.com/ | Internationalization |
| Tailwind CSS | https://tailwindcss.com/docs/ | Styling framework |
| Framer Motion | https://www.framer.com/motion/ | Animation library |

## 13. Sign-off Criteria

### 13.1 Design Review Sign-off

- [ ] Visual design matches specifications
- [ ] 8-bit gaming aesthetic applied consistently
- [ ] Responsive breakpoints function correctly
- [ ] Animations enhance user experience without performance impact
- [ ] All content aligns with career positioning strategy

### 13.2 Technical Review Sign-off

- [ ] Code review completed with no blocking issues
- [ ] TypeScript compilation succeeds
- [ ] Unit tests pass with > 80% coverage
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] Performance audit passes (Lighthouse > 90)

### 13.3 Product Review Sign-off

- [ ] All acceptance criteria met
- [ ] User journey flows correctly
- [ ] Content effectively communicates value proposition
- [ ] Internationalization complete for EN and VI
- [ ] No critical bugs or issues

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Version** | 1.0.0 |
| **Status** | DRAFT |
| **Last Updated** | 2025-12-30 14:56:00 UTC |
| **Author** | BMAD Master Orchestrator |
| **Epic Owner** | BMAD Master Orchestrator |
| **Reviewers** | TBD |

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-30 | BMAD Master | Initial creation |

---

*This document serves as the single source of truth for Epic 29. All subsequent stories must align with the specifications outlined here. Changes to this document require review and approval from the Epic Owner.*
