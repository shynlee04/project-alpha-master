---
stepsCompleted: [1, 2]
inputDocuments:
  - _bmad-output/docs/2025-12-28/correct-course/knowledge-synthesis-proposal-2025-12-28.md
  - _bmad-output/docs/2025-12-28/correct-course/ux-ui-knowledge-synthesis-proposal-2025-12-28.md
  - docs/2025-12-26/concept-for-knowledge-synthesis-station-2025-12-26.md
  - _bmad-output/cis/knowledge-synthesis-station-concept-2025-12-26.md
  - _bmad-output/docs/2025-12-28/version-2/implementation-roadmap.md
  - _bmad-output/docs/2025-12-28/version-2/technical-architecture-document.md
  - _bmad-output/docs/2025-12-28/version-2/remediation-epics.md
  - _bmad-output/docs/index.md
  - _bmad-output/docs/project-overview-2025-12-28.md
  - _bmad-output/docs/architecture-analysis-2025-12-28.md
documentCounts:
  briefs: 0
  research: 7
  brainstorming: 1
  projectDocs: 10
workflowType: 'prd'
lastStep: 2
project_name: 'Project Alpha v2.0 - Knowledge Synthesis Station'
user_name: 'Admin'
date: '2025-12-28'
---

# Product Requirements Document - Project Alpha v2.0

**Knowledge Synthesis Station**

**Author:** Admin  
**Date:** 2025-12-28  
**Version:** 2.0  
**Status:** Draft  

---

## Executive Summary

### Product Vision

**Project Alpha v2.0 - Knowledge Synthesis Station** transforms the existing Via-gent browser-based IDE into a **Universal Knowledge Platform** that serves both developers and learners. It merges the structured creativity of **Notion** with the AI synthesis power of **NotebookLM**, powered by a privacy-first, local-first architecture that works entirely in the browser.

### The Strategic Pivot

| FROM (Via-gent v1.0) | TO (Project Alpha v2.0) |
|----------------------|-------------------------|
| "Run Node.js in the browser" | "Synthesize Knowledge in the browser" |
| WebContainer-centric IDE | RAG-centric Knowledge Platform |
| Developer-only target | Developers + Students + Teachers |
| Desktop-only experience | Unified Desktop + Mobile experience |

### Core Problem Statement

Modern knowledge workers face a **synthesis tax**: gathering information from multiple sources and transforming it into actionable knowledge requires hours of manual effort. Existing solutions either:
- Require cloud lock-in and always-online connectivity (NotebookLM, ChatGPT)
- Offer beautiful structure but passive, manual knowledge management (Notion)
- Provide AI chat but ephemeral, ungrounded responses without persistence
- Are English-first with poor Vietnamese language support

**Project Alpha solves this with a radical approach:** a browser-based, offline-capable AI agent that understands your sources through RAG, synthesizes knowledge into persistent blocks, and works across both desktop and mobile with full Vietnamese language support.

### What Makes This Special

1. **Unified Multi-Surface Experience** — Desktop Creator Studio and Mobile Knowledge Reader share the same agent conversation cascade, coexisting seamlessly with the IDE workspace
2. **AI Agent That Actually Understands** — RAG-powered retrieval with grounded citations, proactive suggestions, and persistent outputs (not ephemeral chat)
3. **Notion-Like Notes with LLM Intelligence** — Block-based editing meets AI synthesis in a local-first architecture
4. **Local-First Privacy** — 100% browser-based, offline-capable, no cloud dependency for core features
5. **Vietnamese-First, Global-Ready** — Built for the Vietnamese EdTech market (25% CAGR) with full i18n architecture

### Target Users

| User | Profile | Key Pain Point | Success Metric |
|------|---------|----------------|----------------|
| **Minh** | Grade 11 student, 16-18 | Can't connect concepts across 5+ textbooks | Time to insight < 60 seconds |
| **Thảo** | University student, 20-24 | Drowning in research papers | Synthesis table from 10 sources |
| **Cô Lan** | High school teacher, 30-45 | Manual work to create engaging materials | Lesson → Quiz in < 5 minutes |
| **Dev** | Developer, 25-40 | Project planning and research across codebases | Codebase → Architecture understanding |

### Phased Approach

**Phase 1: Core Stabilization (This PRD Focus)**
- Stabilize agent system and conversation cascade
- Unify state management (Zustand + Dexie)
- Implement mobile-first responsive layout
- Fix API management and provider configuration
- Establish foundation for extensibility

**Phase 2: Knowledge Synthesis MVP (Future PRD)**
- Source ingestion pipeline (PDF, URL, YouTube, audio)
- Orama WASM vector store integration
- RAG-powered chat with grounded citations
- Knowledge canvas with React Flow
- Study artifact generation (flashcards, quizzes, audio)

---

## Project Classification

**Technical Type:** Web Application (PWA/SPA) + Developer Tool (Hybrid)  
**Domain:** EdTech (Education Technology)  
**Complexity:** Medium  
**Project Context:** Brownfield - extending existing Via-gent codebase with incremental refactoring  

### Classification Rationale

This project sits at the intersection of **EdTech** and **Developer Tools**, requiring:
- **EdTech Concerns:** Student privacy considerations, accessibility standards, content quality
- **Developer Tool Concerns:** API design, extensibility architecture, tooling ecosystem
- **Hybrid Concerns:** Unified experience across learning and development workflows

### Technology Strategy

**Retain & Extend (Brownfield Approach):**
- React 19 + TypeScript + TanStack ecosystem
- Zustand + Dexie.js (unified state management)
- Monaco Editor + xterm.js (IDE features)
- TanStack AI + existing agent infrastructure
- WebContainer API (desktop only)
- Tailwind CSS + Radix UI

**Incremental Additions (Phase 2):**
- Orama (WASM Vector Store - mobile compatible)
- pdf.js + mammoth.js (client-side document parsing)
- React Flow (knowledge graph visualization)
- JSZip (.alpha pack creation)

