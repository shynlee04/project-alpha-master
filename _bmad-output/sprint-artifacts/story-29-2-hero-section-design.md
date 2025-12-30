---
date: 2025-12-30
time: 15:10:00
phase: Story Development Cycle
team: Team-A
agent_mode: bmad-bmm-ux-designer
---

# Story 29-2: Hero Section - UX Design Specifications

## 1. Document Overview

| Property | Value |
|----------|-------|
| **Story ID** | 29-2 |
| **Epic** | Epic 29: About Me Redesign |
| **Title** | Hero Section Design Specifications |
| **Status** | DESIGN_COMPLETE |
| **Priority** | P0 (First visual impression) |
| **Story Points** | 5 |
| **Designer** | bmad-bmm-ux-designer |
| **Next Agent** | bmad-bmm-dev (Implementation) |

## 2. Design Intent & Goals

### 2.1 Primary Objectives
1. **Immediate Impact**: Capture recruiter attention within 6 seconds of page load
2. **Professional Identity**: Establish clear positioning as Senior AI/Agentic Systems Engineer
3. **Visual Differentiation**: Stand out from generic portfolio templates with 8-bit gaming aesthetic
4. **Technical Credibility**: Demonstrate design thinking and attention to detail
5. **Action Orientation**: Prompt continued exploration with clear CTAs

### 2.2 Design Principles Applied
- **8-bit Gaming Aesthetic**: Dark theme with orange (#FF6B35) accents, pixel-perfect styling
- **Progressive Disclosure**: Information hierarchy from identity → value → action
- **Performance First**: Optimized for 60fps animations and <2.5s LCP
- **Accessibility First**: WCAG 2.1 AA compliant with keyboard navigation
- **Responsive Design**: Mobile-first approach with 4 breakpoints

## 3. Visual Design Specifications

### 3.1 ASCII Wireframe - Desktop (1024px+)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ╔═════════════════════════════════════════════════════════════════════╗   │
│  ║                       PARTICLE BACKGROUND (ANIMATED)                      ║   │
│  ║                    (Orange dots floating slowly)                        ║   │
│  ╚═════════════════════════════════════════════════════════════════════╝   │
│                                                                             │
│                              ┌─────────────────┐                            │
│                              │                 │                            │
│                              │  [AVATAR]       │                            │
│                              │  (Optional)     │                            │
│                              │  120px × 120px  │                            │
│                              │                 │                            │
│                              └─────────────────┘                            │
│                                                                             │
│                        EDUCATION LEADER → AI AGENT ARCHITECT                │
│                       (H1, 48px, Bold, Centered, Orange Accent)            │
│                                                                             │
│              Building browser-based IDEs with WebContainer integration       │
│              and autonomous AI agent systems for the next generation         │
│              of development tools. (H2, 18px, Centered, Muted)            │
│                                                                             │
│   ┌─────────────────────────┐    ┌─────────────────────────┐               │
│   │   VIEW PROJECTS         │    │   CONTACT ME            │               │
│   │   (Primary CTA)         │    │   (Secondary CTA)       │               │
│   │   Orange background     │    │   Transparent border    │               │
│   │   Pixel shadow          │    │   Pixel shadow          │               │
│   └─────────────────────────┘    └─────────────────────────┘               │
│                                                                             │
│                           ↓ (Scroll Indicator)                              │
│                           ↓ (Animated bounce)                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 ASCII Wireframe - Mobile (<768px)

```
┌─────────────────────────┐
│                         │
│  ╔═════════════════════╗ │
│  ║  PARTICLE BG        ║ │
│  ║  (Reduced count)    ║ │
│  ╚═════════════════════╝ │
│                         │
│      ┌───────────┐       │
│      │  [AVATAR] │       │
│      │  80×80px  │       │
│      └───────────┘       │
│                         │
│  EDUCATION LEADER →     │
│  AI AGENT ARCHITECT     │
│  (H1, 32px, Bold)       │
│                         │
│  Building browser-based │
│  IDEs with WebContainer │
│  integration...         │
│  (H2, 16px)             │
│                         │
│  ┌─────────────────┐    │
│  │ VIEW PROJECTS   │    │
│  │ (Full width)    │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ CONTACT ME      │    │
│  │ (Full width)    │    │
│  └─────────────────┘    │
│                         │
│        ↓ (Scroll)        │
│                         │
└─────────────────────────┘
```

### 3.3 Color Palette

| Element | Color Token | Hex Value | Usage |
|---------|-------------|-----------|-------|
| **Background** | `--background` | `#0f0f11` | Hero section background |
| **Primary Accent** | `--primary` | `#f97316` | CTAs, identity text, highlights |
| **Foreground** | `--foreground` | `#f2f2f2` | Primary text |
| **Muted Foreground** | `--muted-foreground` | `#a1a1aa` | Secondary text, subtitle |
| **Card** | `--card` | `#18181b` | Avatar background (if used) |
| **Border** | `--border` | `#27272a` | Secondary CTA border |
| **Pixel Shadow** | `--shadow-pixel-primary` | `#c2410c` | Primary CTA shadow |

### 3.4 Typography Hierarchy

| Element | Font Size | Font Weight | Line Height | Color Token |
|---------|-----------|-------------|-------------|-------------|
| **H1 - Identity** | 48px (desktop) / 32px (mobile) | 700 (Bold) | 1.2 | `--primary` |
| **H2 - Subtitle** | 18px (desktop) / 16px (mobile) | 400 (Regular) | 1.5 | `--muted-foreground` |
| **CTA - Primary** | 16px | 600 (Semi-bold) | 1.0 | `--primary-foreground` |
| **CTA - Secondary** | 16px | 600 (Semi-bold) | 1.0 | `--foreground` |

### 3.5 Spacing System (Design Tokens)

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| **Hero Padding Top** | `var(--spacing-desktop) * 8` | `var(--spacing-tablet) * 6` | `var(--spacing-mobile) * 4` |
| **Hero Padding Bottom** | `var(--spacing-desktop) * 12` | `var(--spacing-tablet) * 8` | `var(--spacing-mobile) * 6` |
| **Avatar Margin Bottom** | `var(--spacing-desktop) * 3` | `var(--spacing-tablet) * 2` | `var(--spacing-mobile) * 2` |
| **H1 Margin Bottom** | `var(--spacing-desktop) * 2` | `var(--spacing-tablet) * 1.5` | `var(--spacing-mobile) * 1.5` |
| **H2 Margin Bottom** | `var(--spacing-desktop) * 4` | `var(--spacing-tablet) * 3` | `var(--spacing-mobile) * 3` |
| **CTA Gap** | `var(--spacing-desktop) * 2` | `var(--spacing-tablet) * 1.5` | `var(--spacing-mobile) * 1.5` |
| **CTA Padding** | `var(--spacing-desktop) * 2` horizontal | `var(--spacing-tablet) * 1.5` | `var(--spacing-mobile) * 1.5` |

## 4. Component Architecture

### 4.1 Component Structure

```
HeroSection (Main Component)
├── ParticleBackground (Sub-component)
│   └── CanvasElement (for performance)
├── Avatar (Optional sub-component)
│   └── ImageElement
├── IdentityText
│   ├── H1 (Identity Statement)
│   └── H2 (Subtitle)
├── CTAContainer
│   ├── PrimaryCTA (Button)
│   └── SecondaryCTA (Button)
└── ScrollIndicator
    └── AnimatedIcon
```

### 4.2 Props Interface Definition

```typescript
/**
 * Hero Section Component Props
 * Location: src/components/about/HeroSection.tsx
 */
export interface HeroSectionProps {
  /**
   * Optional avatar image URL
   * If not provided, avatar section is hidden
   */
  avatarUrl?: string;
  
  /**
   * Avatar alt text for accessibility
   * Required if avatarUrl is provided
   */
  avatarAlt?: string;
  
  /**
   * Primary CTA label
   * Defaults to "View Projects" via i18n
   */
  primaryCTALabel?: string;
  
  /**
   * Primary CTA navigation target
   * Defaults to "#projects"
   */
  primaryCTATarget?: string;
  
  /**
   * Secondary CTA label
   * Defaults to "Contact Me" via i18n
   */
  secondaryCTALabel?: string;
  
  /**
   * Secondary CTA navigation target
   * Defaults to "#contact"
   */
  secondaryCTATarget?: string;
  
  /**
   * Particle animation enabled
   * Defaults to true
   */
  enableParticles?: boolean;
  
  /**
   * Particle count (performance optimization)
   * Defaults to 50 (desktop), 25 (mobile)
   */
  particleCount?: number;
  
  /**
   * Custom className for styling overrides
   */
  className?: string;
}
```

### 4.3 Sub-Component Interfaces

#### ParticleBackground Props

```typescript
export interface ParticleBackgroundProps {
  /**
   * Number of particles to render
   * Adjusted based on screen size
   */
  particleCount: number;
  
  /**
   * Particle color
   * Defaults to primary orange
   */
  particleColor?: string;
  
  /**
   * Animation speed multiplier
   * Defaults to 1.0
   */
  speedMultiplier?: number;
  
  /**
   * Respect reduced motion preference
   * Defaults to true
   */
  respectReducedMotion?: boolean;
}
```

#### ScrollIndicator Props

```typescript
export interface ScrollIndicatorProps {
  /**
   * Scroll target element ID
   * Defaults to "stats-bar"
   */
  targetId?: string;
  
  /**
   * Animation enabled
   * Defaults to true
   */
  animate?: boolean;
}
```

## 5. CSS & Animation Specifications

### 5.1 Particle Background Animation

**Animation Type:** Canvas-based for performance (60fps target)

**Particle Behavior:**
- **Movement:** Slow floating in random directions
- **Speed:** 0.5-2 pixels per frame
- **Size:** 2-4 pixels (8-bit pixel aesthetic)
- **Color:** Primary orange (#f97316) with 30% opacity
- **Interaction:** Subtle repulsion from mouse cursor (optional enhancement)

**Implementation Approach:**
```typescript
// Pseudo-code for particle system
class Particle {
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  size: number;
  opacity: number;
  
  update(canvasWidth: number, canvasHeight: number): void {
    this.x += this.vx;
    this.y += this.vy;
    
    // Wrap around edges
    if (this.x > canvasWidth) this.x = 0;
    if (this.x < 0) this.x = canvasWidth;
    if (this.y > canvasHeight) this.y = 0;
    if (this.y < 0) this.y = canvasHeight;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = `rgba(249, 115, 22, ${this.opacity})`;
    ctx.fillRect(this.x, this.y, this.size, this.size); // Square for 8-bit look
  }
}
```

**Performance Optimizations:**
- Use `requestAnimationFrame` for smooth animation
- Pause animation when element is off-screen (Intersection Observer)
- Reduce particle count on mobile devices
- Use `will-change: transform` on canvas element

### 5.2 Scroll Indicator Animation

**Animation Type:** CSS keyframe animation

**Animation Specification:**
```css
@keyframes scroll-bounce {
  0%, 100% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(8px);
    opacity: 0.5;
  }
}

.scroll-indicator {
  animation: scroll-bounce 2s var(--animation-easing-8bit) infinite;
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .scroll-indicator {
    animation: none;
  }
}
```

**Visual Design:**
- Icon: Down arrow (ChevronDown from lucide-react)
- Color: Muted foreground with 60% opacity
- Size: 24px
- Position: Centered below CTAs

### 5.3 CTA Button Animations

**Hover State:**
```css
.cta-button {
  transition: all var(--animation-duration-medium) var(--animation-easing-8bit);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.5);
}

.cta-button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-pixel);
}
```

**Focus State:**
```css
.cta-button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### 5.4 Entry Animations

**Staggered Fade In:**
```css
.hero-content > * {
  opacity: 0;
  animation: fade-in-up var(--animation-duration-medium) 
             var(--animation-easing-8bit) forwards;
}

.hero-content > *:nth-child(1) { animation-delay: 0ms; }   /* Avatar */
.hero-content > *:nth-child(2) { animation-delay: 100ms; } /* H1 */
.hero-content > *:nth-child(3) { animation-delay: 200ms; } /* H2 */
.hero-content > *:nth-child(4) { animation-delay: 300ms; } /* CTAs */
.hero-content > *:nth-child(5) { animation-delay: 400ms; } /* Scroll indicator */
```

## 6. Responsive Breakpoint Specifications

### 6.1 Breakpoint Definitions

| Breakpoint | Min Width | Max Width | Layout Changes |
|------------|-----------|-----------|----------------|
| **Mobile** | 0px | 767px | Single column, stacked CTAs, reduced particles |
| **Tablet** | 768px | 1023px | Two-column option, side-by-side CTAs |
| **Desktop** | 1024px | 1439px | Full-width hero, centered content |
| **Large Desktop** | 1440px | ∞ | Max width 1280px, optimal line length |

### 6.2 Responsive Specifications

#### Mobile (<768px)

```css
/* Layout */
.hero-section {
  padding: var(--spacing-mobile) * 4 var(--spacing-mobile) * 2;
  min-height: 80vh;
  text-align: center;
}

/* Typography */
.hero-h1 {
  font-size: 32px;
  line-height: 1.2;
}

.hero-h2 {
  font-size: 16px;
  max-width: 100%;
}

/* Avatar */
.hero-avatar {
  width: 80px;
  height: 80px;
  margin-bottom: var(--spacing-mobile) * 2;
}

/* CTAs */
.cta-container {
  flex-direction: column;
  gap: var(--spacing-mobile) * 1.5;
}

.cta-button {
  width: 100%;
  padding: var(--spacing-mobile) * 1.5;
}

/* Particles */
.particle-canvas {
  opacity: 0.6; /* Reduced opacity on mobile */
}

/* Particle count: 25 */
```

#### Tablet (768px - 1023px)

```css
/* Layout */
.hero-section {
  padding: var(--spacing-tablet) * 6 var(--spacing-tablet) * 3;
  min-height: 70vh;
}

/* Typography */
.hero-h1 {
  font-size: 40px;
}

.hero-h2 {
  font-size: 18px;
  max-width: 90%;
}

/* Avatar */
.hero-avatar {
  width: 100px;
  height: 100px;
  margin-bottom: var(--spacing-tablet) * 2;
}

/* CTAs */
.cta-container {
  flex-direction: row;
  gap: var(--spacing-tablet) * 1.5;
  justify-content: center;
}

.cta-button {
  width: auto;
  min-width: 160px;
}

/* Particle count: 35 */
```

#### Desktop (1024px - 1439px)

```css
/* Layout */
.hero-section {
  padding: var(--spacing-desktop) * 8 var(--spacing-desktop) * 4;
  min-height: 60vh;
  max-width: 1200px;
  margin: 0 auto;
}

/* Typography */
.hero-h1 {
  font-size: 48px;
}

.hero-h2 {
  font-size: 18px;
  max-width: 800px;
}

/* Avatar */
.hero-avatar {
  width: 120px;
  height: 120px;
  margin-bottom: var(--spacing-desktop) * 3;
}

/* CTAs */
.cta-container {
  flex-direction: row;
  gap: var(--spacing-desktop) * 2;
  justify-content: center;
}

.cta-button {
  width: auto;
  min-width: 180px;
}

/* Particle count: 50 */
```

#### Large Desktop (≥1440px)

```css
/* Layout */
.hero-section {
  padding: var(--spacing-lg) * 8 var(--spacing-lg) * 4;
  max-width: 1280px;
}

/* Particle count: 60 */
```

## 7. Accessibility Specifications

### 7.1 WCAG 2.1 AA Compliance

| Requirement | Specification | Implementation |
|-------------|---------------|----------------|
| **Color Contrast** | 4.5:1 for text | Primary orange on dark background meets AA |
| **Keyboard Navigation** | Tab, Enter, Space | All interactive elements focusable |
| **Focus Indicators** | Visible 2px outline | `:focus-visible` with primary color |
| **Screen Reader** | Proper ARIA labels | `aria-label` on CTAs, `aria-hidden` on decorative elements |
| **Reduced Motion** | Respect preference | `prefers-reduced-motion` media query |
| **Semantic HTML** | Proper heading hierarchy | H1 for identity, H2 for subtitle |

### 7.2 ARIA Attributes

```html
<!-- Hero Section -->
<section 
  id="hero" 
  aria-labelledby="hero-heading"
  role="region"
>
  <!-- Avatar (if present) -->
  <img 
    src="avatar-url" 
    alt="Profile photo of [Name]" 
    aria-hidden="true" 
  />
  
  <!-- Identity -->
  <h1 id="hero-heading">
    Education Leader → AI Agent Architect
  </h1>
  
  <!-- Subtitle -->
  <p>
    Building browser-based IDEs with WebContainer integration...
  </p>
  
  <!-- CTAs -->
  <a 
    href="#projects" 
    class="cta-button primary"
    aria-label="View projects portfolio"
  >
    View Projects
  </a>
  
  <a 
    href="#contact" 
    class="cta-button secondary"
    aria-label="Contact for opportunities"
  >
    Contact Me
  </a>
  
  <!-- Scroll Indicator -->
  <div 
    aria-hidden="true"
    role="presentation"
  >
    <ChevronDown />
  </div>
</section>
```

### 7.3 Keyboard Navigation

| Key | Action | Target |
|-----|--------|--------|
| **Tab** | Move focus to next interactive element | CTAs, scroll indicator |
| **Shift + Tab** | Move focus to previous element | Navigate backwards |
| **Enter / Space** | Activate focused element | Trigger CTA navigation |
| **Home** | Jump to top of page | Scroll to hero |
| **End** | Jump to bottom of page | Scroll to contact |

### 7.4 Screen Reader Optimization

- **Skip Link:** Add skip-to-content link for keyboard users
- **Live Regions:** Not applicable (static content)
- **Descriptive Labels:** All CTAs have clear `aria-label` attributes
- **Hidden Decorative Elements:** Particle canvas marked `aria-hidden="true"`

## 8. Internationalization (i18n) Specifications

### 8.1 Translation Keys

**English (`src/i18n/en.json`):**
```json
{
  "about": {
    "hero": {
      "identity": "Education Leader → AI Agent Architect",
      "subtitle": "Building browser-based IDEs with WebContainer integration and autonomous AI agent systems for the next generation of development tools.",
      "primaryCTA": "View Projects",
      "secondaryCTA": "Contact Me",
      "avatarAlt": "Profile photo"
    }
  }
}
```

**Vietnamese (`src/i18n/vi.json`):**
```json
{
  "about": {
    "hero": {
      "identity": "Giáo dục Lãnh đạo → Kiến trúc sư AI Agent",
      "subtitle": "Xây dựng IDE dựa trên trình duyệt với tích hợp WebContainer và hệ thống AI agent tự chủ cho thế hệ công cụ phát triển tiếp theo.",
      "primaryCTA": "Xem Dự án",
      "secondaryCTA": "Liên hệ",
      "avatarAlt": "Ảnh hồ sơ"
    }
  }
}
```

### 8.2 i18n Implementation

```typescript
import { useTranslation } from 'react-i18next';

export function HeroSection({ ...props }: HeroSectionProps) {
  const { t } = useTranslation();
  
  return (
    <section className="hero-section">
      <h1>{t('about.hero.identity')}</h1>
      <p>{t('about.hero.subtitle')}</p>
      <a href="#projects" aria-label={t('about.hero.primaryCTA')}>
        {t('about.hero.primaryCTA')}
      </a>
      <a href="#contact" aria-label={t('about.hero.secondaryCTA')}>
        {t('about.hero.secondaryCTA')}
      </a>
    </section>
  );
}
```

## 9. Performance Specifications

### 9.1 Performance Targets

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **LCP (Largest Contentful Paint)** | < 2.5s | Lighthouse / Web Vitals |
| **FID (First Input Delay)** | < 100ms | Lighthouse / Web Vitals |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Lighthouse / Web Vitals |
| **Animation FPS** | 60fps | Chrome DevTools Performance |
| **First Paint** | < 1.0s | Lighthouse |
| **Time to Interactive** | < 3.5s | Lighthouse |

### 9.2 Performance Optimizations

**1. Particle System:**
- Use Canvas API instead of DOM elements
- Reduce particle count on mobile (25 vs 50 on desktop)
- Pause animation when off-screen (Intersection Observer)
- Use `requestAnimationFrame` for efficient rendering

**2. Image Optimization:**
- Avatar image: WebP format, max 20KB
- Lazy load avatar if below fold
- Use `loading="eager"` only for above-fold content

**3. CSS Optimization:**
- Use CSS custom properties (design tokens)
- Avoid layout thrashing (batch DOM reads/writes)
- Use `transform` and `opacity` for animations
- Add `will-change` hints sparingly

**4. JavaScript Optimization:**
- Code-split particle system (lazy load)
- Use React.memo for sub-components
- Debounce resize events
- Clean up event listeners on unmount

### 9.3 Bundle Size Impact

| Component | Estimated Size | Notes |
|-----------|---------------|-------|
| **HeroSection** | ~2KB (gzipped) | Main component + hooks |
| **ParticleBackground** | ~3KB (gzipped) | Canvas logic | 
| **Total** | ~5KB (gzipped) | Acceptable for hero section |

## 10. Integration Specifications

### 10.1 Integration with About Page

**Location:** `src/components/about/HeroSection.tsx`

**Usage in AboutPage:**
```typescript
import { HeroSection } from './HeroSection';

export function AboutPage() {
  return (
    <main>
      <HeroSection 
        avatarUrl="/avatar.jpg"
        avatarAlt="Profile photo"
      />
      {/* Other sections... */}
    </main>
  );
}
```

### 10.2 Navigation Integration

**Primary CTA:** Links to `#projects` section
**Secondary CTA:** Links to `#contact` section

**Smooth Scroll Implementation:**
```typescript
import { useNavigate } from '@tanstack/react-router';

export function HeroSection({ primaryCTATarget = '#projects' }: HeroSectionProps) {
  const navigate = useNavigate();
  
  const handleScroll = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <button onClick={() => handleScroll(primaryCTATarget)}>
      {t('about.hero.primaryCTA')}
    </button>
  );
}
```

### 10.3 Design Token Usage

**All styling must use design tokens from `src/styles/design-tokens.css`:**

```css
.hero-section {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  padding: var(--spacing-desktop) * 8;
}

.hero-h1 {
  color: hsl(var(--primary));
  font-size: 48px;
}

.cta-button-primary {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  box-shadow: var(--shadow-pixel-primary);
}
```

## 11. Testing Specifications

### 11.1 Unit Tests

**Location:** `src/components/about/__tests__/HeroSection.test.tsx`

**Test Cases:**
1. Renders with default props
2. Renders with custom avatar URL
3. Renders with custom CTA labels
4. Renders without avatar when avatarUrl not provided
5. Renders particle background when enabled
6. Hides particle background when disabled
7. Applies custom className
8. Handles click events on CTAs
9. Respects reduced motion preference

### 11.2 Integration Tests

**Test Cases:**
1. Hero section integrates with AboutPage
2. CTAs navigate to correct sections
3. Smooth scroll functionality works
4. i18n translations render correctly
5. Responsive layout adapts to breakpoints

### 11.3 Accessibility Tests

**Test Cases:**
1. Keyboard navigation works (Tab, Enter, Space)
2. Focus indicators are visible
3. Screen reader announces content correctly
4. Color contrast meets WCAG AA
5. Reduced motion preference is respected

### 11.4 Performance Tests

**Test Cases:**
1. Lighthouse score > 90
2. Animation maintains 60fps
3. LCP < 2.5s
4. No layout shift on load
5. Memory usage stable over time

## 12. Handoff Checklist for Development

### 12.1 Design Deliverables

- [x] Visual design specifications (ASCII wireframes)
- [x] Component architecture specification
- [x] Props interface definitions
- [x] CSS/Animation specifications
- [x] Accessibility considerations
- [x] Responsive breakpoint specifications
- [x] i18n translation keys
- [x] Performance specifications
- [x] Integration specifications
- [x] Testing specifications

### 12.2 Developer Handoff Requirements

**Files to Create:**
1. `src/components/about/HeroSection.tsx` - Main component
2. `src/components/about/ParticleBackground.tsx` - Particle system
3. `src/components/about/ScrollIndicator.tsx` - Scroll indicator
4. `src/components/about/__tests__/HeroSection.test.tsx` - Unit tests
5. `src/i18n/en.json` - Update with translation keys
6. `src/i18n/vi.json` - Update with translation keys

**Design Tokens to Reference:**
- `--primary` (#f97316) - Orange accent
- `--background` (#0f0f11) - Dark background
- `--foreground` (#f2f2f2) - Text color
- `--muted-foreground` (#a1a1aa) - Secondary text
- `--shadow-pixel-primary` (#c2410c) - Pixel shadow
- `--animation-easing-8bit` - Animation easing
- `--animation-duration-medium` - Animation duration

**External Dependencies:**
- `lucide-react` - ChevronDown icon
- `@tanstack/react-router` - Navigation hooks
- `react-i18next` - Internationalization

**No New Dependencies Required:**
- All functionality achievable with existing stack
- Particle system uses native Canvas API
- Animations use existing CSS keyframes

## 13. References

### 13.1 Design System References

- **Design Tokens:** `src/styles/design-tokens.css`
- **Animations:** `src/styles/animations.css`
- **Component Standards:** `AGENTS.md` section "Component Structure"
- **Icon Components:** `src/components/ui/icons/`

### 13.2 Technical Documentation

- **TanStack Router:** https://tanstack.com/router
- **React i18next:** https://www.i18next.com
- **Canvas API:** https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/

### 13.3 Related Artifacts

- **Story Context & Validation:** `_bmad-output/sprint-artifacts/story-29-1-about-me-context-validation.md`
- **Design Epic:** `_bmad-output/epics/epic-29-about-me-redesign.md`
- **Career Positioning:** `_bmad-output/career/vietnam-job-market-analysis-2025-12-30.md`
- **Handoff Document:** `_bmad-output/handoffs/handoff-29-2-hero-section-2025-12-30.md`

## 14. Next Steps

### 14.1 Development Phase

1. **Implement HeroSection Component** (bmad-bmm-dev)
   - Create component structure
   - Implement props interface
   - Add i18n integration
   - Write unit tests

2. **Implement ParticleBackground** (bmad-bmm-dev)
   - Create canvas-based particle system
   - Add performance optimizations
   - Implement reduced motion support
   - Write unit tests

3. **Implement ScrollIndicator** (bmad-bmm-dev)
   - Create animated scroll indicator
   - Add smooth scroll functionality
   - Implement accessibility features
   - Write unit tests

4. **Integration & Testing** (bmad-bmm-tea)
   - Integrate with AboutPage
   - Run accessibility tests
   - Run performance tests
   - Validate responsive behavior

5. **Code Review** (@code-reviewer)
   - Review code quality
   - Validate design compliance
   - Check accessibility compliance
   - Approve for merge

### 14.2 Auto-Switch to Dev Mode

After design completion, automatically switch to `@bmad-bmm-dev` for implementation phase.

---

**Design Status:** COMPLETE  
**Ready for Development:** YES  
**Next Agent:** bmad-bmm-dev  
**Handoff Document:** `_bmad-output/handoffs/handoff-29-2-hero-section-2025-12-30.md`