# Epic: About Me Page Redesign - Strategic Portfolio Component

**Epic ID:** 29  
**Priority:** P1 (High Priority)  
**Status:** PLANNING  
**Created:** 2025-12-30  
**Target Role:** AI Agent Developer / Multi-Agent Systems Architect  
**Career Context:** [`_bmad-output/career/vietnam-job-market-analysis-2025-12-30.md`](_bmad-output/career/vietnam-job-market-analysis-2025-12-30.md)

---

## 1. Executive Summary

This Epic outlines the comprehensive redesign of the About Me page component (`src/components/about/AboutPage.tsx`) to transform it from a basic portfolio component into a strategic recruitment asset that:

- **Captures recruiter attention** within the critical first impression window (6-7 seconds)
- **Communicates senior technical capabilities** across the full engineering stack
- **Demonstrates innovation in agentic systems** through tangible project evidence
- **Reinforces career positioning** for AI Agent Developer roles in the Vietnam market
- **Serves as a powerful differentiator** in competitive hiring processes

The redesign will leverage the existing 8-bit gaming style design system while introducing strategic storytelling, quantified achievements, and seamless navigation integration to create a compelling professional narrative that aligns with the career positioning strategy.

---

## 2. Strategic Context

### 2.1 Career Positioning Alignment

The About Me page must reinforce the following positioning pillars from the career context document:

| Pillar | Description | Page Integration |
|--------|-------------|------------------|
| **Multi-Agent Orchestration** | Unique ability to coordinate 15+ AI agents | Technical showcase with BMAD framework visualization |
| **Enterprise Architecture** | Enterprise-grade system design capabilities | Architecture diagrams, code quality indicators |
| **Rapid Prototyping** | Built complex system in < 1 month | Timeline visualization with milestones |
| **Background Differentiation** | Education Management → AI/Tech transition | Professional journey narrative |
| **Full-Stack Mastery** | Backend, Frontend, and AI integration | Skill matrix with project evidence |

### 2.2 Target Audience

| Audience | Primary Goal | Page Experience |
|----------|-------------|-----------------|
| **Technical Recruiters** | Assess technical depth quickly | Architecture diagrams, code patterns, tech stack |
| **Hiring Managers** | Evaluate problem-solving capabilities | Project showcase, metrics, decision framework |
| **AI/ML Engineers** | Understand agentic system expertise | Tool demonstration, BMAD framework details |
| **HR/Recruiters** | Verify soft skills and communication | Professional narrative, achievements |

### 2.3 Competitive Landscape (Vietnam 2025)

Per market research from the career document:
- **AI/ML Job Growth:** +70% YoY
- **Top Competencies:** Multi-agent systems, LLM integration, workflow automation
- **Key Differentiators:** Enterprise architecture, rapid prototyping, full-stack capabilities

The About Me page must position the candidate in the top tier of these competencies through concrete evidence and quantifiable achievements.

---

## 3. Current State Assessment

### 3.1 Existing Implementation Review

**File:** [`src/components/about/AboutPage.tsx`](src/components/about/AboutPage.tsx)

**Current Structure:**
```
├── Hero Section (User icon, greeting, tagline)
├── Story Section (2 cards: Background, Transition)
├── Skills Section (3 skill items: Frontend, Backend, Framework)
├── Project Section (Via-gent highlight with 2 stats)
└── Contact Section (Email, LinkedIn, GitHub links)
```

**Identified Deficiencies:**

| Area | Current State | Gap Analysis |
|------|---------------|--------------|
| **Visual Hierarchy** | Flat card structure | Lacks scannable progression, no focal points |
| **Storytelling** | Generic narrative | Missing career arc, transformation story |
| **Technical Showcase** | Text-based skills list | No architecture visualization, code evidence |
| **Metrics** | Only 2 stats (15+, <1 month) | Underutilized quantified achievements |
| **Navigation** | Standalone page | No integration with system navigation |
| **Animation** | None | Missed engagement opportunities |
| **Responsive** | Basic mobile support | No adaptive layouts per breakpoint |
| **Accessibility** | Minimal ARIA | Below WCAG 2.1 AA standards |

### 3.2 Design System Alignment

**Current Compliance:**
- ✅ Uses design tokens from `src/styles/design-tokens.css`
- ✅ Implements 8-bit gaming style aesthetic
- ✅ Responsive via `useResponsive` hook
- ✅ Internationalized via `t()` hook

**Required Enhancements:**
- ❌ No animation system integration (missing `animations.css`)
- ❌ No micro-interactions for engagement
- ❌ No visual hierarchy for information scanning
- ❌ Missing component structure for scalability

---

## 4. Design Vision

### 4.1 Guiding Principles

| Principle | Application |
|-----------|-------------|
| **Recruiter-First** | Optimize for 6-second scanning while providing depth on demand |
| **Evidence-Based** | Every claim supported by concrete project evidence or metrics |
| **Narrative-Driven** | Progress from identity → journey → capabilities → value proposition |
| **Visual Excellence** | 8-bit aesthetic with professional polish, no kitsch |
| **Accessible** | WCAG 2.1 AA compliant, keyboard navigable, screen reader friendly |

### 4.2 User Journey Mapping

```
┌─────────────────────────────────────────────────────────────────────┐
│  ENTRY POINT (First Impression - 6 seconds)                         │
│  ├── Hero: Identity statement + visual hook                         │
│  ├── Primary CTA: "See My Work" or "View Projects"                  │
│  └── Micro-interaction: Subtle animation on load                    │
├─────────────────────────────────────────────────────────────────────┤
│  SCANNING PHASE (30 seconds)                                        │
│  ├── Stats bar: Quantified achievements (scroll-fixed)              │
│  ├── Skills matrix: Categorized technical capabilities              │
│  └── Project cards: Visual project highlights                       │
├─────────────────────────────────────────────────────────────────────┤
│  EXPLORATION PHASE (2-5 minutes)                                    │
│  ├── Story section: Career transformation narrative                 │
│  ├── Technical deep-dives: Architecture diagrams, code samples      │
│  └── Achievement timeline: Quantified accomplishments               │
├─────────────────────────────────────────────────────────────────────┤
│  CONVERSION PHASE (Action)                                          │
│  ├── Contact CTA: Clear call-to-action paths                        │
│  ├── Navigation integration: Connect to projects, IDE demo          │
│  └── Download CV/Resume: Easy access to full credentials            │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.3 Information Architecture

```
AboutPage/
├── HeroSection/
│   ├── IdentityBlock (Name, Role, Tagline)
│   ├── VisualHook (Animated 8-bit element)
│   └── PrimaryCTA (View Projects)
├── StatsBar/ (Scroll-fixed)
│   ├── AgentsOrchestrated (15+)
│   ├── DevelopmentTime (<1 month)
│   ├── TechStackCount (10+ technologies)
│   └── LinesOfCode (Enterprise codebase)
├── JourneySection/
│   ├── ProfessionalBackground (Education → Tech)
│   ├── CareerTransformation (The "Why" story)
│   └── ValueProposition (What I bring)
├── SkillsMatrix/
│   ├── AgenticSystems (BMAD, Multi-agent, Tools)
│   ├── FrontendEngineering (React, TypeScript, UI)
│   ├── BackendArchitecture (WebContainer, API, State)
│   └── ProcessMethodology (Agile, Documentation, Testing)
├── ProjectShowcase/
│   ├── Via-gentCard (Primary project highlight)
│   ├── ArchitectureDiagram (System design visualization)
│   └── CodePatterns (Quality indicators)
├── AchievementTimeline/
│   ├── QuantifiedMetrics (All achievements)
│   ├── MilestoneMarkers (Career highlights)
│   └── EvidenceLinks (Project references)
└── ContactSection/
    ├── CTACards (Email, LinkedIn, GitHub)
    ├── AvailabilityStatus (Open to opportunities)
    └── LocationTimezone (Asia/Ho_Chi_Minh, UTC+7)
```

---

## 5. UX/UI Design Specifications

### 5.1 Visual Design System

**Color Palette Application:**

| Token | Usage |
|-------|-------|
| `--primary: hsl(24.6 95% 53.1%)` | Hero accents, CTAs, highlights |
| `--background: hsl(240 6% 4%)` | Page background |
| `--card: hsl(240 4% 10%)` | Section cards |
| `--foreground: hsl(0 0% 95%)` | Primary text |
| `--muted-foreground: hsl(0 0% 60%)` | Secondary text |
| `--success: hsl(142 71% 45%)` | Metrics, achievements |
| `--info: hsl(217 91% 60%)` | Skills, capabilities |

**Typography Scale:**

| Element | Desktop | Mobile |
|---------|---------|--------|
| Hero Name | 3rem (48px) | 2rem (32px) |
| Section Title | 2rem (32px) | 1.5rem (24px) |
| Card Title | 1.25rem (20px) | 1.125rem (18px) |
| Body Text | 1rem (16px) | 0.875rem (14px) |
| Metrics Value | 2.5rem (40px) | 1.75rem (28px) |
| Metrics Label | 0.875rem (14px) | 0.75rem (12px) |

**Spacing System:**

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-xs` | 0.25rem (4px) | Inline elements |
| `--spacing-sm` | 0.5rem (8px) | Component internals |
| `--spacing-md` | 1rem (16px) | Card padding |
| `--spacing-lg` | 1.5rem (24px) | Section gaps |
| `--spacing-xl` | 3rem (48px) | Page sections |

### 5.2 Component Specifications

#### 5.2.1 Hero Section

```typescript
interface HeroSectionProps {
  name: string;
  tagline: string;
  subtitle: string;
  primaryCTA: {
    label: string;
    route: string;
  };
  socialLinks: SocialLink[];
}

interface SocialLink {
  platform: 'email' | 'linkedin' | 'github';
  url: string;
  icon: LucideIcon;
}
```

**Visual Requirements:**
- Full viewport height (100vh) on desktop, 80vh on mobile
- Gradient background using `--primary` to `--primary-foreground`
- Animated particle effect (8-bit style, not kitschy)
- Floating elements with subtle bounce animation
- Glassmorphism card for identity (optional, keep minimal)

**Animation Timeline:**
```css
@keyframes heroLoad {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

#### 5.2.2 Stats Bar

```typescript
interface StatsBarProps {
  stats: StatItem[];
  fixed?: boolean; // Scroll-fixed on desktop
}

interface StatItem {
  id: string;
  value: string | number;
  label: string;
  icon: LucideIcon;
  color?: string; // CSS color token
}
```

**Stat Metrics to Display:**
1. **15+** — AI Agents Orchestrated (BMAD framework)
2. **< 1** — Month to Production (Via-gent development)
3. **10+** — Technologies Mastered
4. **Enterprise** — Grade Architecture

**Design:**
- Horizontal scroll on mobile, fixed row on desktop
- Hover effects: Scale up, show tooltip
- Animated counter on scroll into view
- Progress bar indicator for completeness

#### 5.2.3 Skills Matrix

```typescript
interface SkillsMatrixProps {
  categories: SkillCategory[];
}

interface SkillCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  skills: Skill[];
}

interface Skill {
  name: string;
  level: 'expert' | 'advanced' | 'proficient' | 'learning';
  years?: number;
  projectEvidence?: string;
}
```

**Skill Categories:**
1. **Agentic Systems** (Primary)
   - BMAD Framework (Expert)
   - Multi-Agent Orchestration (Expert)
   - LLM Integration (Advanced)
   - TanStack AI (Advanced)
   
2. **Frontend Engineering** (Secondary)
   - React 18 (Expert)
   - TypeScript (Advanced)
   - TanStack Router (Advanced)
   - TailwindCSS + Radix UI (Proficient)
   
3. **Backend & Infrastructure** (Tertiary)
   - WebContainer API (Expert)
   - IndexedDB + Dexie (Advanced)
   - File System Access API (Advanced)
   - Vite + HMR (Proficient)

4. **Process & Methodology** (Quaternary)
   - Agile/Scrum (Expert)
   - Document-Driven Dev (Expert)
   - Testing (Advanced)
   - CI/CD (Proficient)

**Visual Design:**
- Grid layout (2 columns mobile, 4 columns desktop)
- Skill cards with progress indicator
- Color-coded level badges
- Expandable for project evidence

#### 5.2.4 Project Showcase (Via-gent)

```typescript
interface ProjectShowcaseProps {
  project: Project;
}

interface Project {
  name: string;
  tagline: string;
  description: string;
  stats: StatItem[];
  features: string[];
  techStack: string[];
  links: {
    demo?: string;
    github?: string;
    documentation?: string;
  };
  architectureImage?: string;
}
```

**Via-gent Project Card Requirements:**
- Hero image with 8-bit styled frame
- Interactive architecture diagram
- Feature highlight carousel
- Live demo link (when available)
- GitHub repository link
- Tech stack tags

**Architecture Diagram Specifications:**
- SVG-based interactive diagram
- Hover states for component details
- Click to expand documentation
- Color-coded by system layer (AI, UI, State, Infrastructure)

#### 5.2.5 Achievement Timeline

```typescript
interface AchievementTimelineProps {
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  date: string;
  title: string;
  description: string;
  metrics?: {
    label: string;
    value: string | number;
  }[];
  evidence?: string;
}
```

**Key Achievements to Highlight:**
1. **BMAD Framework Design** — Enterprise multi-agent orchestration
2. **Via-gent MVP** — Full system in < 1 month
3. **WebContainer Integration** — Browser-based IDE implementation
4. **State Architecture** — Zustand + Dexie unified system
5. **Internationalization** — EN + VI support
6. **Documentation-Driven Dev** — Comprehensive artifact system

### 5.3 Responsive Breakpoints

| Breakpoint | Width | Layout Adjustments |
|------------|-------|-------------------|
| **Mobile** | < 640px | Single column, stacked sections |
| **Tablet** | 640-767px | 2-column grid, reduced padding |
| **Desktop** | 768-1023px | Full grid, scroll-fixed stats |
| **Large Desktop** | ≥ 1024px | Max-width container, centered |

### 5.4 Animation System Integration

**Core Animations (from `animations.css`):**

| Animation | Usage | Duration |
|-----------|-------|----------|
| `fadeIn` | Section load | 300ms |
| `slideUp` | Card reveal | 400ms |
| `scaleHover` | Interactive elements | 200ms |
| `pulse` | Stats counter | 2s infinite |
| `glow` | CTAs, highlights | 1.5s infinite |

**Micro-interactions:**
- Hero particles: Continuous float animation
- Skill cards: Scale on hover, show level badge
- Project cards: Tilt effect on desktop
- Social links: Color shift on hover
- Stats counter: Animated count-up on scroll

---

## 6. Content Strategy

### 6.1 Messaging Framework

#### Hero Section

**Identity Statement:**
> "From Education Leader to AI Agent Architect"

**Tagline:**
> "Building the future of autonomous development systems"

**Subtitle:**
> "Solo developer of Via-gent | BMAD Framework Creator | Multi-Agent Systems Expert"

#### Story Section (Professional Journey)

**Opening:**
> "My journey from managing educational operations to architecting enterprise AI systems is rooted in a fundamental truth: **the best technology amplifies human capability**."

**Transition Narrative:**
> "Drawing from my background in curriculum design and team coordination, I approach AI agent development with a unique perspective—treating each agent as a team member with specialized skills, clear responsibilities, and seamless collaboration protocols."

**Value Proposition:**
> "I don't just build AI tools; I design autonomous systems that solve complex problems with reliability, transparency, and scalability."

#### Skills Matrix Descriptions

**Agentic Systems:**
> "Specialized in designing multi-agent frameworks that coordinate complex workflows. The BMAD V6 framework demonstrates my ability to create enterprise-grade orchestration systems."

**Frontend Engineering:**
> "Expert in modern React ecosystems, delivering pixel-perfect interfaces with TanStack Router, Zustand, and design system patterns."

**Backend Architecture:**
> "Deep expertise in browser-based infrastructure, particularly WebContainer API for local-first application development."

#### Project Showcase (Via-gent)

**Headline:**
> "Via-gent: A Browser-Based IDE with AI Agent Capabilities"

**Description:**
> "A complete browser-based development environment featuring local code execution, integrated AI agents, and real-time collaboration—built from scratch in under one month."

**Key Metrics:**
- **15+** Specialized AI Agent Modes
- **< 1** Month Development Timeline
- **Enterprise** Grade Architecture

### 6.2 Translation Keys Required

**English (`en.json`):**
```json
{
  "about": {
    "hero": {
      "greeting": "Hello, I'm",
      "name": "Via-gent Developer",
      "tagline": "From Education Leader to AI Agent Architect",
      "subtitle": "Building the future of autonomous development systems"
    },
    "journey": {
      "title": "My Journey",
      "opening": "My journey from managing educational operations to architecting enterprise AI systems...",
      "transition": "Drawing from my background in curriculum design and team coordination...",
      "value": "I don't just build AI tools; I design autonomous systems..."
    },
    "stats": {
      "agents": "Agents Orchestrated",
      "timeline": "Development Time",
      "techStack": "Technologies",
      "architecture": "Architecture Grade"
    },
    "skills": {
      "title": "Technical Capabilities",
      "agentic": "Agentic Systems",
      "agenticDesc": "Multi-agent orchestration, LLM integration, BMAD framework",
      "frontend": "Frontend Engineering",
      "frontendDesc": "React 18, TypeScript, TanStack ecosystem",
      "backend": "Backend Architecture",
      "backendDesc": "WebContainer, IndexedDB, API design",
      "process": "Process & Methodology",
      "processDesc": "Agile, Documentation, Testing"
    },
    "projects": {
      "title": "Featured Project",
      "name": "Via-gent",
      "tagline": "Browser-Based IDE with AI Agent Capabilities",
      "description": "A complete browser-based development environment..."
    },
    "contact": {
      "title": "Get in Touch",
      "email": "Email",
      "linkedin": "LinkedIn",
      "github": "GitHub"
    }
  }
}
```

**Vietnamese (`vi.json`):**
```json
{
  "about": {
    "hero": {
      "greeting": "Xin chào, tôi là",
      "name": "Via-gent Developer",
      "tagline": "Từ Lãnh đạo Giáo dục đến Kiến trúc sư AI Agent",
      "subtitle": "Xây dựng tương lai của các hệ thống phát triển tự trị"
    },
    "journey": {
      "title": "Hành Trình Của Tôi",
      "opening": "Hành trình của tôi từ quản lý vận hành giáo dục đến kiến tạo hệ thống AI doanh nghiệp...",
      "transition": "Dựa trên nền tảng thiết kế chương trình giảng dạy và điều phối đội ngũ...",
      "value": "Tôi không chỉ xây dựng công cụ AI; tôi thiết kế các hệ thống tự trị..."
    },
    "stats": {
      "agents": "Điều phối Agents",
      "timeline": "Thời gian Phát triển",
      "techStack": "Công nghệ",
      "architecture": "Cấp trúc Kiến trúc"
    },
    "skills": {
      "title": "Năng lực Kỹ thuật",
      "agentic": "Hệ thống Agentic",
      "agenticDesc": "Điều phối multi-agent, tích hợp LLM, framework BMAD",
      "frontend": "Kỹ thuật Frontend",
      "frontendDesc": "React 18, TypeScript, hệ sinh thái TanStack",
      "backend": "Kiến trúc Backend",
      "backendDesc": "WebContainer, IndexedDB, thiết kế API",
      "process": "Quy trình & Phương pháp",
      "processDesc": "Agile, Tài liệu, Testing"
    },
    "projects": {
      "title": "Dự án Nổi bật",
      "name": "Via-gent",
      "tagline": "IDE Trên Trình duyệt với Khả năng AI Agent",
      "description": "Môi trường phát triển hoàn chỉnh trên trình duyệt..."
    },
    "contact": {
      "title": "Liên hệ",
      "email": "Email",
      "linkedin": "LinkedIn",
      "github": "GitHub"
    }
  }
}
```

---

## 7. Technical Implementation Requirements

### 7.1 Component Architecture

**New Component Structure:**
```
src/components/about/
├── index.ts                    # Barrel export
├── AboutPage.tsx               # Main page (container)
├── AboutPage.css               # Page-level styles
├── hero/
│   ├── index.ts
│   ├── HeroSection.tsx
│   └── HeroSection.css
├── stats/
│   ├── index.ts
│   ├── StatsBar.tsx
│   ├── StatsBar.css
│   └── StatItem.tsx
├── journey/
│   ├── index.ts
│   ├── JourneySection.tsx
│   ├── JourneySection.css
│   └── JourneyCard.tsx
├── skills/
│   ├── index.ts
│   ├── SkillsMatrix.tsx
│   ├── SkillsMatrix.css
│   ├── SkillCategory.tsx
│   └── SkillCard.tsx
├── projects/
│   ├── index.ts
│   ├── ProjectShowcase.tsx
│   ├── ProjectShowcase.css
│   └── ViaGentCard.tsx
├── timeline/
│   ├── index.ts
│   ├── AchievementTimeline.tsx
│   ├── AchievementTimeline.css
│   └── TimelineItem.tsx
└── contact/
    ├── index.ts
    ├── ContactSection.tsx
    ├── ContactSection.css
    └── ContactCard.tsx
```

### 7.2 State Management

**No Global State Required:**
- All About page state is local (useState, useReducer)
- No persistence needed (static content)
- Navigation handled via TanStack Router

**Local State Requirements:**
```typescript
// Hero Section
const [isLoaded, setIsLoaded] = useState(false);

// Stats Bar
const [animatedStats, setAnimatedStats] = useState(false);

// Skills Matrix
const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

// Project Showcase
const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
```

### 7.3 Performance Requirements

| Metric | Target | Strategy |
|--------|--------|----------|
| **LCP (Largest Contentful Paint)** | < 2.5s | Optimized hero image, lazy load below-fold |
| **FID (First Input Delay)** | < 100ms | Minimal JS on main thread |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Fixed dimensions for all elements |
| **Bundle Size** | < 50KB gzipped | Tree-shaking, code splitting |

**Code Splitting:**
```typescript
// Lazy load non-critical sections
const AchievementTimeline = lazy(() => import('./timeline/AchievementTimeline'));
const SkillsMatrix = lazy(() => import('./skills/SkillsMatrix'));

// Use Suspense wrapper
<Suspense fallback={<SkeletonLoader variant="section" />}>
  <AchievementTimeline />
</Suspense>
```

### 7.4 Accessibility Requirements

**WCAG 2.1 AA Compliance:**

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard Navigation** | Tab order: Hero → Stats → Journey → Skills → Projects → Timeline → Contact |
| **Focus Indicators** | Custom focus styles using `--primary` color |
| **Screen Reader** | ARIA labels on all interactive elements, semantic heading hierarchy |
| **Color Contrast** | Minimum 4.5:1 for body text, 3:1 for large text |
| **Reduced Motion** | Respect `prefers-reduced-motion` media query |
| **Skip Links** | Skip to main content link in header |

**ARIA Attributes:**
```tsx
<main role="main" aria-label="About Me page">
  <section aria-labelledby="hero-title">
    <h1 id="hero-title">{t('about.hero.name')}</h1>
  </section>
  <nav aria-label="Page navigation">
    {/* Navigation links */}
  </nav>
  <section aria-labelledby="stats-title">
    <h2 id="stats-title" className="sr-only">Key Statistics</h2>
    {/* Stats items */}
  </section>
</main>
```

### 7.5 Testing Requirements

**Unit Tests:**
```typescript
// HeroSection.test.tsx
describe('HeroSection', () => {
  it('renders name and tagline correctly');
  it('applies animation classes on load');
  it('navigates to projects on CTA click');
  it('renders social links with correct URLs');
});

// SkillsMatrix.test.tsx
describe('SkillsMatrix', () => {
  it('renders all skill categories');
  it('expands category on click');
  it('shows skill levels correctly');
  it('navigates to project evidence on click');
});
```

**Integration Tests:**
- Full page render with i18n
- Navigation flow testing
- Animation timing verification
- Responsive breakpoint testing

**Visual Regression Tests:**
- Percy or Chromatic integration
- Screenshot comparison per breakpoint
- Dark/Light theme variants

---

## 8. Navigation Integration

### 8.1 Global Navigation Links

**Updated Navigation Menu:**
```typescript
// From layout navigation component
const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/ide', label: 'IDE', icon: CodeIcon },
  { path: '/knowledge', label: 'Knowledge', icon: BookIcon },
  { path: '/about', label: 'About', icon: UserIcon }, // Highlighted
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];
```

**About Page Highlight:**
- Active state styling using `--primary` color
- Accessibility: `aria-current="page"` on About link

### 8.2 Internal Page Navigation

**Quick Jump Links:**
```tsx
<nav aria-label="Quick navigation">
  <ul>
    <li><a href="#hero">Home</a></li>
    <li><a href="#stats">Stats</a></li>
    <li><a href="#journey">Journey</a></li>
    <li><a href="#skills">Skills</a></li>
    <li><a href="#projects">Projects</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
</nav>
```

**Smooth Scroll Behavior:**
```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

### 8.3 Call-to-Action Pathways

**Primary CTAs:**
1. **"View My Work"** → Links to IDE demo or GitHub
2. **"Download Resume"** → PDF download link
3. **"Let's Talk"** → Opens email composer

**Secondary CTAs:**
1. Project cards link to detailed project pages
2. Skills link to relevant code samples
3. Timeline items link to achievement evidence

---

## 9. Dependencies & References

### 9.1 Internal Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| [`src/styles/design-tokens.css`](src/styles/design-tokens.css) | Design tokens | ✅ Existing |
| [`src/styles/animations.css`](src/styles/animations.css) | Animation system | ✅ Existing |
| [`src/hooks/useResponsive.ts`](src/hooks/useResponsive.ts) | Responsive breakpoints | ✅ Existing |
| [`src/i18n/en.json`](src/i18n/en.json) | English translations | ✅ Existing |
| [`src/i18n/vi.json`](src/i18n/vi.json) | Vietnamese translations | ✅ Existing |
| [`src/components/ui/icons/`](src/components/ui/icons/) | Icon components | ✅ Existing |

### 9.2 External References

| Reference | URL | Usage |
|-----------|-----|-------|
| TanStack Router | https://tanstack.com/router | Navigation |
| Radix UI Primitives | https://www.radix-ui.com/primitives | Accessible components |
| TailwindCSS | https://tailwindcss.com/docs | Styling utility classes |
| Lucide React | https://lucide.dev | Icon library |
| Framer Motion (optional) | https://www.framer.com/motion/ | Advanced animations |

### 9.3 Career Context References

| Reference | Purpose |
|-----------|---------|
| [`_bmad-output/career/vietnam-job-market-analysis-2025-12-30.md`](_bmad-output/career/vietnam-job-market-analysis-2025-12-30.md) | Career positioning strategy |
| [`_bmad-output/project-planning-artifacts/architecture.md`](_bmad-output/project-planning-artifacts/architecture.md) | System architecture patterns |
| [`AGENTS.md`](AGENTS.md) | Project development standards |

---

## 10. Story Breakdown

### Epic 29 Stories

| Story ID | Title | Priority | Estimated Points |
|----------|-------|----------|------------------|
| 29-1 | Story Context & Validation | P0 | 1 |
| 29-2 | Hero Section Implementation | P0 | 3 |
| 29-3 | Stats Bar Implementation | P0 | 2 |
| 29-4 | Journey Section Implementation | P1 | 3 |
| 29-5 | Skills Matrix Implementation | P1 | 5 |
| 29-6 | Project Showcase Implementation | P0 | 5 |
| 29-7 | Achievement Timeline Implementation | P2 | 3 |
| 29-8 | Contact Section Implementation | P1 | 2 |
| 29-9 | Navigation Integration | P1 | 2 |
| 29-10 | Accessibility & Testing | P0 | 3 |
| 29-11 | Internationalization & L10n | P0 | 2 |

---

## 11. Acceptance Criteria

### General Requirements

- [ ] All components follow the design system (design tokens, animations)
- [ ] Fully responsive across all breakpoints
- [ ] WCAG 2.1 AA compliant
- [ ] All text is i18n-ready (EN + VI)
- [ ] No hardcoded values (colors via tokens, text via i18n)
- [ ] Tests coverage > 80%

### Specific Deliverables

| Component | Acceptance Criteria |
|-----------|---------------------|
| **Hero Section** | Loads in < 1.5s, animations smooth, social links functional |
| **Stats Bar** | Count-up animation on scroll, fixed position on desktop |
| **Journey Section** | Narrative flows logically, background → transition → value |
| **Skills Matrix** | All 10+ technologies listed, expandable details, level indicators |
| **Project Showcase** | Via-gent card prominent, architecture diagram interactive |
| **Timeline** | Chronological achievements, metrics visible, evidence linked |
| **Contact Section** | All contact methods working, CTA buttons prominent |
| **Navigation** | Page links functional, scroll smooth, skip link present |

---

## 12. Definition of Done

The Epic is complete when:

1. ✅ All stories are implemented and reviewed
2. ✅ All acceptance criteria are met
3. ✅ No linting errors or type errors
4. ✅ All tests pass (unit, integration, visual regression)
5. ✅ Performance metrics meet targets (LCP < 2.5s, FID < 100ms)
6. ✅ Accessibility audit passes (axe-core)
7. ✅ Internationalization verified (EN + VI)
8. ✅ Documentation updated (AGENTS.md, component docs)
9. ✅ Deployment verified (preview environment)
10. ✅ Retrospective conducted

---

## 13. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Scope creep** | Timeline delay | Medium | Strict story boundary enforcement |
| **Design token gaps** | Inconsistent styling | Low | Extend tokens if needed, document gaps |
| **Animation performance** | Poor UX on low-end devices | Medium | Respect `prefers-reduced-motion`, optimize |
| **Internationalization complexity** | Translation errors | Low | Automated extraction, validation |
| **Visual regression** | Broken layouts | Medium | Percy/Chromatic integration |

---

## 14. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Recruiter engagement time** | +50% vs current | Heatmap analysis |
| **Project link clicks** | +30% vs current | Analytics |
| **Contact form submissions** | +40% vs current | Analytics |
| **Page load time** | < 2.5s LCP | Lighthouse |
| **Accessibility score** | 100% | axe-core, Lighthouse |
| **Mobile performance** | 90+ score | Lighthouse mobile |

---

## 15. Tracking & Handoff

### Phase Gate: Design Review

**Before Story 29-2 (Hero Section):**
- [ ] Design mockups approved
- [ ] Content finalized
- [ ] Animation specifications confirmed

### Phase Gate: Implementation Review

**After Story 29-6 (Project Showcase):**
- [ ] Core components tested
- [ ] Performance baseline established
- [ ] Accessibility audit passed

### Final Gate: Launch Readiness

**After Story 29-11:**
- [ ] All tests passing
- [ ] Production build verified
- [ ] Analytics configured
- [ ] Documentation complete

---

## 16. Related Artifacts

| Artifact | Relationship |
|----------|--------------|
| [`_bmad-output/career/vietnam-job-market-analysis-2025-12-30.md`](_bmad-output/career/vietnam-job-market-analysis-2025-12-30.md) | Career positioning foundation |
| [`src/styles/design-tokens.css`](src/styles/design-tokens.css) | Design system foundation |
| [`src/styles/animations.css`](src/styles/animations.css) | Animation system foundation |
| [`src/hooks/useResponsive.ts`](src/hooks/useResponsive.ts) | Responsive utility |
| [`AGENTS.md`](AGENTS.md) | Development standards |

---

**Document Metadata:**
```
---
date: 2025-12-30
time: 14:50:00 UTC
phase: Planning
team: Team-A
agent_mode: bmad-core-bmad-master (Orchestrator)
---
```

**Created by:** BMAD Master Orchestrator  
**Reviewed by:** N/A (Initial creation)  
**Approved by:** Pending design review
