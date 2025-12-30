# Epic 30: Personal Portfolio Transformation ("The Architect of Intelligence")

## 1. Executive Summary
**Objective**: Transform the `AboutPage` from a generic "About Me" into a high-octane **Interactive Portfolio & Career Pitch Deck**.
**Target Audience**: Technical Recruiters, Engineering Managers, and CTOs in the Vietnam Tech Market (2025).
**Core Message**: "Transforming Systems with Agentic Intelligence: From Educational Usage to Multi-Agent Orchestration."

## 2. Strategic Narrative & Content Framework

### Phase 1: The Hook ("The Identity")
*   **Headline**: "Building the Future of Digital Intelligence"
*   **Sub-headline**: "Senior AI Agent Developer | Multi-Agent Systems Architect | BMAD Framework Expert"
*   **Visual**: 3D/Animated representation of a "Neural Network" or "Agent Constellation" connecting nodes (Education, Language, Code, Architecture).

### Phase 2: The Journey ("The Transformation")
*   **Concept**: "From Architecting Minds to Architecting Intelligence"
*   **Story Arc**:
    *   **Origin**: Education Management (System Design, Human Logic, Feedback Loops).
    *   **Bridge**: Linguistics & Logic (The foundation of Prompt Engineering).
    *   **Destination**: AI Engineering (Via-gent, BMAD Framework, Multi-Agent Orchestration).
*   **Key Metric**: "Transferred 5 years of complex system management into managing 15+ AI Agents."

### Phase 3: The Proof ("The Showcase")
*   **Highlight Project**: **Via-gent** (The very IDE they are looking at).
    *   *Interactive Element*: "View Under the Hood" toggle that overlay's technical specs on the UI components.
    *   **Metrics**: < 1 month dev time, 15+ Agents, Browser-based Execution.

### Phase 4: The Expertise ("The Skills Matrix")
*   **Format**: Interactive Grid/Graph.
*   **Categories**:
    1.  **Agentic Systems**: BMAD V6, Orchestration, LLM Integration.
    2.  **Engineering**: React 18, TypeScript, Architecture.
    3.  **Backend/Infra**: WebContainer, IndexedDB, Offline-First.
    4.  **Meta-Skills**: Agile, Doc-Driven Dev, System Thinking.

## 3. Component Architecture Specification

### Directory Structure
```
src/components/about/
├── layout/
│   ├── PortfolioLayout.tsx    // Main scroller wrapper with navigation integration
│   ├── SectionContainer.tsx   // Consistent padding/margins/reveal effects
│   └── NavigationRail.tsx     // Floating table of contents
├── sections/
│   ├── HeroSection.tsx        // The "Hook" with WebGL/Canvas background
│   ├── JourneySection.tsx     // Timeline/Transformation visualizer
│   ├── ShowcaseSection.tsx    // Via-gent deep dive (Code + Demo)
│   ├── SkillsUniverse.tsx     // 3D/Interactive force-directed graph of skills
│   └── ContactSection.tsx     // Terminal-style contact form
├── ui/
│   ├── TechBadge.tsx          // Specialized badge for tech stack items
│   ├── StatCounter.tsx        // Animated number counters
│   └── GlitchText.tsx         // Cyberpunk/Tech aesthetic text effect
└── hooks/
    ├── useScrollProgress.ts   // For scroll-driven animations
    └── usePortfolioReveal.ts  // Intersection observer logic
```

### Integration Points
1.  **IDE Sidebar**: Add a "Portfolio" icon/tab that links directly to this route.
2.  **Command Palette**: Add "Go to Portfolio", "View Resume" commands.
3.  **Context Sharing**: The Portfolio page should read from `ProjectState` to show "Real-time" stats (e.g., "Currently coding in...", "Total LoC in this project").

## 4. Visual Design Specifications

### Aesthetic: "Premium Technical Minimalist" (Cyberpunk/8-Bit accents optional but polished)
*   **Colors**: Deep Void (Background), Neon Cyan (Agentic), Electric Purple (Strategy), Warm Amber (Human/Education).
*   **Typography**: `Inter` (Body) + `JetBrains Mono` (Code/Technical headers).
*   **Motion**:
    *   Scroll-triggered reveals (framer-motion).
    *   Parallax effects on background elements.
    *   Smooth scanning transitions between sections.

### Responsive Breakpoints
*   **Mobile (<768px)**: Linear vertical scroll, card-based layout, minimized visuals.
*   **Tablet (768-1024px)**: 2-column grids for skills, reduced motion.
*   **Desktop (>1024px)**: Full interactive diagrams, WebGL backgrounds, split-screen layouts.

## 5. Implementation Roadmap

### Phase 1: Foundation (Day 1)
*   [ ] Set up `PortfolioLayout` and route structure.
*   [ ] Implement `HeroSection` with basic responsive design.
*   [ ] Integrate basic Navigation Rail.

### Phase 2: Core Content (Day 2)
*   [ ] Build `JourneySection` connecting Education to AI.
*   [ ] Develop `SkillsUniverse`.
*   [ ] Implement `ShowcaseSection` featuring Via-gent metrics.

### Phase 3: Polish (Day 3)
*   [ ] Animations, Mobile Responsiveness, SEO.
