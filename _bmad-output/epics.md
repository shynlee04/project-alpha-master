# Epics Index

## Completed Epics

| Epic ID | Name | Status | Period |
|---------|------|--------|--------|
| SPRINT-0 | Infrastructure & Pre-Work | DONE | 2025-12-28 to 2025-12-31 |
| EPIC-1 | Mobile-First Visual Foundation | DONE | 2025-12-28 to 2025-12-31 |
| EPIC-2 | AI Chat That Just Works | DONE | 2025-12-28 to 2025-12-31 |
| EPIC-3 | Agent Tool Execution & Approval | DONE | 2025-12-28 to 2025-12-31 |
| EPIC-4 | Smart Agent Tools | DONE | 2025-12-28 to 2025-12-31 |
| EPIC-5 | IDE Layout & Navigation | DONE | 2025-12-28 to 2025-12-31 |
| EPIC-6 | Source Ingestion & Management | DONE | 2025-12-30 |
| EPIC-7 | RAG Infrastructure | DONE | 2025-12-30 |
| EPIC-8 | Knowledge Canvas | DONE | 2025-12-30 |
| EPIC-9 | Study Artifacts Generation | DONE | 2025-12-30 |
| EPIC-13 | Code Quality & Type Safety | DONE | 2025-12-29 |
| EPIC-21 | Component Architecture Audit | IN_PROGRESS | 2025-12-29 |
| EPIC-22 | Production Hardening | IN_PROGRESS | 2025-12-29 |
| EPIC-23 | UX/UI Modernization | IN_PROGRESS | 2025-12-29 |

## Active Epics

| Epic ID | Name | Status | Priority | Period |
|---------|------|--------|----------|--------|
| EPIC-24 | Performance & UX Optimization | IN_PROGRESS | P0 | 2025-12-29 |
| EPIC-26 | Intelligent Knowledge Base (The "Brain") | IN_PROGRESS | P1 | 2025-12-30 |
| **EPIC-29** | **About Me Page Redesign** | **PLANNING** | **P1** | **2025-12-30** |

## Epic 29: About Me Page Redesign

**Status:** PLANNING  
**Created:** 2025-12-30  
**Target Role:** AI Agent Developer / Multi-Agent Systems Architect  
**Career Context:** [`_bmad-output/career/vietnam-job-market-analysis-2025-12-30.md`](_bmad-output/career/vietnam-job-market-analysis-2025-12-30.md)  
**Design Document:** [`_bmad-output/epics/epic-29-about-me-redesign.md`](_bmad-output/epics/epic-29-about-me-redesign.md)

### Objective
Transform the existing About Me page component (`src/components/about/AboutPage.tsx`) from a basic portfolio component into a strategic recruitment asset that:
- Captures recruiter attention within the critical first impression window (6-7 seconds)
- Communicates senior technical capabilities across the full engineering stack
- Demonstrates innovation in agentic systems through tangible project evidence
- Reinforces career positioning for AI Agent Developer roles in the Vietnam market
- Serves as a powerful differentiator in competitive hiring processes

### Key Highlights

| Aspect | Description |
|--------|-------------|
| **Career Positioning** | Aligned with multi-agent orchestration, enterprise architecture, rapid prototyping |
| **Visual Style** | 8-bit gaming aesthetic with professional polish |
| **Components** | Hero, Stats Bar, Journey, Skills Matrix, Project Showcase, Timeline, Contact |
| **Stories** | 11 stories (29-1 through 29-11) |
| **Internationalization** | Full EN + VI translation support |
| **Accessibility** | WCAG 2.1 AA compliant |

### Story Breakdown

| Story ID | Title | Priority | Points |
|----------|-------|----------|--------|
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

## Upcoming Epics

| Epic ID | Name | Status | Dependencies |
|---------|------|--------|--------------|

| EPIC-28 | Design System Completion | BACKLOG | Epic 23 |

## Epic Dependencies Graph

```
SPRINT-0 → EPIC-1 → EPIC-2 → EPIC-3 → EPIC-4 → EPIC-5
   ↓                                              ↓
   └──→ EPIC-6 ←→ EPIC-7 ←→ EPIC-8 ←→ EPIC-9
                       ↓
                  EPIC-24 (correct-course)
                       ↓
                  EPIC-26 (RAG enhancement)
                       ↓
                  EPIC-29 (NEW - About Page Redesign)
```

---

**Last Updated:** 2025-12-30  
**Maintained By:** BMAD Master Orchestrator
