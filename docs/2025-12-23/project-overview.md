# Via-gent Project Overview

**Document ID:** `docs/2025-12-23/project-overview.md`  
**Version:** 1.0  
**Date:** 2025-12-23  
**Classification:** Internal  
**Target Audience:** Executives, Technical Leadership, Stakeholders

---

## Executive Summary

**Via-gent** is a browser-based Integrated Development Environment (IDE) that enables developers to write, run, and debug code entirely within the browser using WebContainers technology. The platform provides a local-first development experience with bidirectional file synchronization between the user's local file system and an in-browser sandbox environment.

### Key Value Propositions

| Value Proposition | Description |
|------------------|-------------|
| **Zero Setup** | No local environment installation required - runs entirely in browser |
| **Local-First** | Code lives on user's machine via File System Access API |
| **Privacy** | All code execution happens locally in browser sandbox |
| **Portability** | Works on any device with modern browser (Chrome/Edge) |
| **Multi-Language** | Supports English and Vietnamese out of the box |

### Technology Highlights

- **WebContainers**: StackBlitz technology for running Node.js applications in browser
- **React 19**: Latest React framework for UI
- **TypeScript**: Type-safe development
- **TanStack Router**: Modern file-based routing
- **IndexedDB**: Client-side persistence for project metadata

### Current Status

| Metric | Value |
|--------|-------|
| **Development Phase** | Implementation |
| **Active Epics** | 4 (13 DONE, 21 IN_PROGRESS, 22 IN_PROGRESS, 23 IN_PROGRESS) |
| **Core Features** | File editing, terminal, file sync, project persistence |
| **Languages Supported** | English, Vietnamese |
| **Browser Support** | Chrome, Edge (File System Access API required) |

---

## Product Vision

Via-gent aims to democratize software development by providing a fully-featured IDE that runs entirely in the browser. By leveraging modern web APIs and WebContainer technology, Via-gent eliminates the need for local environment setup while maintaining the performance and familiarity of traditional desktop IDEs.

### Target Users

1. **Students/Learners**: Quick access to coding environment without setup
2. **Remote Developers**: Work from any device with browser access
3. **Educators**: Provide consistent coding environments for students
4. **Prototypers**: Quickly test ideas without local environment configuration

### Differentiators

| Feature | Via-gent | Traditional IDEs | Cloud IDEs |
|---------|----------|------------------|------------|
| **Setup Time** | 0 seconds | Minutes to hours | Seconds |
| **Local Code** | Yes (FSA API) | Yes | No |
| **Privacy** | Local execution | Local execution | Server execution |
| **Offline Capable** | Partial | Yes | No |
| **Resource Usage** | Browser sandbox | Local machine | Shared server |

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Environment                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   Monaco    │  │   xterm.js  │  │  File Tree  │  │  Chat   │ │
│  │   Editor    │  │  Terminal   │  │   Panel     │  │  Panel  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│         │                │                │              │      │
│         └────────────────┴────────────────┴──────────────┘      │
│                            │                                    │
│                    ┌───────▼────────┐                           │
│                    │  React 19 UI   │                           │
│                    │  TanStack Router│                          │
│                    └───────┬────────┘                           │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                 │
│         │                  │                  │                 │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌────▼────────┐        │
│  │  Workspace  │  │   File System   │  │ WebContainer│        │
│  │   Context   │  │     Sync        │  │   Manager   │        │
│  └──────┬──────┘  └────────┬────────┘  └────┬────────┘        │
│         │                  │                  │                  │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌────▼────────┐        │
│  │  IndexedDB  │  │  File System    │  │ WebContainer│        │
│  │  (Dexie.js) │  │  Access API     │  │   Sandbox   │        │
│  └─────────────┘  └─────────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale | Impact |
|----------|-----------|--------|
| **Local FS as Source of Truth** | User owns their code | Privacy, portability |
| **WebContainer Mirror** | Enables code execution | No reverse sync limitation |
| **Client-Side Only** | No server required | Zero infrastructure cost |
| **File System Access API** | Direct file access | Browser compatibility constraint |
| **IndexedDB Persistence** | Project metadata storage | Browser storage limits |

---

## Technical Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.3 | UI Framework |
| **TypeScript** | 5.x | Type Safety |
| **Vite** | 5.x | Build Tool |
| **TanStack Router** | 1.141.8 | Routing |
| **WebContainer API** | 1.6.1 | Code Execution |
| **Monaco Editor** | Latest | Code Editing |
| **xterm.js** | Latest | Terminal Emulation |
| **Dexie.js** | 4.2.1 | IndexedDB Wrapper |

### UI Libraries

| Library | Purpose |
|---------|---------|
| **Radix UI** | Accessible Components |
| **Tailwind CSS** | Styling |
| **Lucide React** | Icons |
| **Sonner** | Toast Notifications |
| **React Resizable Panels** | Layout Management |

### State Management

| Library | Purpose | Status |
|---------|---------|--------|
| **TanStack Store** | Reactive State | Current |
| **React Context** | State Propagation | Current |
| **Zustand** | State Management | Planned (Epic 27) |

### Persistence

| Library | Purpose | Status |
|---------|---------|--------|
| **Dexie.js** | IndexedDB Wrapper | Current (Migrating) |
| **idb** | IndexedDB Promise Wrapper | Legacy (Removing) |

### Internationalization

| Library | Purpose |
|---------|---------|
| **i18next** | Translation Framework |
| **react-i18next** | React Integration |
| **i18next-browser-languagedetector** | Language Detection |

### Observability

| Library | Purpose |
|---------|---------|
| **Sentry** | Error Tracking |
| **EventEmitter3** | Event System |

---

## Current Capabilities

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Code Editing** | Monaco Editor with syntax highlighting | ✅ Complete |
| **Terminal** | xterm.js-based terminal with WebContainer integration | ✅ Complete |
| **File Tree** | Interactive file browser | ✅ Complete |
| **File Sync** | Bidirectional sync between local FS and WebContainer | ✅ Complete |
| **Project Persistence** | Save/load projects via IndexedDB | ✅ Complete |
| **Multi-Language** | English and Vietnamese UI | ✅ Complete |
| **AI Chat Interface** | Basic chat panel for AI interactions | 🚧 In Progress (Epic 25) |

### File System Operations

| Operation | Description |
|-----------|-------------|
| **Read File** | Read file content from local FS |
| **Write File** | Write to local FS and WebContainer (dual-write) |
| **Create Directory** | Create directories in both systems |
| **Delete File/Directory** | Delete from both systems |
| **List Directory** | Browse file tree |
| **Search Files** | Find files by name pattern |

### WebContainer Operations

| Operation | Description |
|-----------|-------------|
| **Boot** | Initialize WebContainer instance (singleton) |
| **Mount Files** | Mount file system tree to WebContainer |
| **Spawn Process** | Run commands (npm, node, jsh) |
| **Get File System** | Access WebContainer file system API |
| **Server Ready Events** | Subscribe to server start events |

---

## Development Status

### Active Epics

| Epic | Name | Status | Priority |
|------|------|--------|----------|
| 13 | Terminal Sync Stability | DONE | P1 |
| 21 | Internationalization | IN_PROGRESS | P1 |
| 22 | Production Hardening | IN_PROGRESS | P0 |
| 23 | UX/UI Modernization | IN_PROGRESS | P1 |
| 25 | AI Foundation Sprint | PLANNED | P2 |
| 27 | State Architecture Stabilization | PLANNED | P1 |
| 28 | UX Brand Identity & Design System | PLANNED | P2 |

### Completed Epics

| Epic | Name | Completion Date |
|------|------|-----------------|
| 1 | Project Foundation - IDE Shell | 2025-12-XX |
| 6 | AI Agent Integration | 2025-12-XX |
| 10 | Sync Architecture Refactor | 2025-12-XX |
| 11 | Code Splitting Module Refactor | 2025-12-XX |
| 12 | Agent Tool Interface Layer | 2025-12-XX |

### Upcoming Features

| Feature | Epic | Estimated Completion |
|---------|------|---------------------|
| **CI/CD Pipeline** | 22 | Q1 2025 |
| **Integration Tests** | 22 | Q1 2025 |
| **Error Monitoring** | 22 | Q1 2025 |
| **Tailwind CSS 4** | 23 | Q1 2025 |
| **Shadcn UI Components** | 23 | Q1 2025 |
| **Theme Toggle** | 23 | Q1 2025 |
| **Zustand Migration** | 27 | Q1 2025 |
| **AI Agent Orchestration** | 25 | Q2 2025 |

---

## Quality Metrics

### Code Coverage

| Metric | Current | Target |
|--------|---------|--------|
| **Unit Test Coverage** | ~30% | 70% |
| **Integration Test Coverage** | 0% | 50% |
| **E2E Test Coverage** | 0% | 30% |

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **WebContainer Boot Time** | < 3s | ~3-5s |
| **File Sync (100 files)** | < 3s | ~2-3s |
| **Initial Page Load** | < 2s | ~1-2s |
| **Time to Interactive** | < 5s | ~4-5s |

### Reliability

| Metric | Target | Current |
|--------|--------|---------|
| **Uptime** | 99.9% | N/A (client-side) |
| **Error Rate** | < 0.1% | Monitoring |
| **Crash-Free Sessions** | > 99% | Monitoring |

---

## Deployment Strategy

### Current Deployment

- **Platform**: Netlify (static hosting)
- **Build Process**: Vite build + Netlify edge functions
- **CDN**: Netlify global CDN
- **Domain**: TBD

### Deployment Pipeline

```
Git Push → CI/CD (GitHub Actions) → Build → Test → Deploy to Netlify
```

### Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| **Cross-Origin-Opener-Policy** | same-origin | WebContainer COOP |
| **Cross-Origin-Embedder-Policy** | require-corp | WebContainer COEP |
| **Cross-Origin-Resource-Policy** | cross-origin | Resource access |

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **WebContainer API Changes** | Medium | High | Version pinning, migration plan |
| **Browser Compatibility** | Low | Medium | Progressive enhancement, fallback UI |
| **IndexedDB Quota Exceeded** | Medium | Medium | Quota monitoring, cleanup strategy |
| **File System Access API Deprecation** | Low | High | Monitor standards, alternative APIs |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Performance Degradation** | Medium | Medium | Performance monitoring, optimization |
| **Data Loss** | Low | High | Backup strategy, export/import |
| **Security Vulnerabilities** | Low | High | Security audits, dependency updates |

---

## Success Metrics

### User Engagement

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Active Users** | 1,000/month | Analytics |
| **Session Duration** | > 30 min | Analytics |
| **Return Rate** | > 40% | Analytics |
| **Feature Usage** | > 60% | Analytics |

### Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Page Load Time** | < 2s | RUM |
| **Error Rate** | < 0.1% | Sentry |
| **WebContainer Success Rate** | > 99% | Monitoring |
| **File Sync Success Rate** | > 99% | Monitoring |

---

## Future Roadmap

### Q1 2025 (Current Focus)

1. **Production Hardening** (Epic 22)
   - CI/CD pipeline
   - Integration tests
   - Error monitoring
   - Performance benchmarks

2. **UX/UI Modernization** (Epic 23)
   - Tailwind CSS 4
   - Shadcn UI components
   - Theme toggle
   - Design system

3. **State Architecture Stabilization** (Epic 27)
   - Zustand migration
   - Event bus standardization
   - Persistence consolidation

### Q2 2025

1. **AI Foundation** (Epic 25)
   - Agent orchestration
   - Tool execution tracking
   - Task context management

2. **Testing Infrastructure**
   - E2E tests
   - Performance benchmarks
   - Test data fixtures

3. **Observability Enhancement**
   - Structured logging
   - Metrics collection
   - Performance monitoring

### Q3-Q4 2025

1. **Advanced Features**
   - Multi-project support
   - Collaboration features
   - Plugin system

2. **Platform Expansion**
   - Additional language support
   - Mobile optimization
   - Desktop app (Tauri)

---

## Conclusion

Via-gent represents a modern approach to browser-based development environments, leveraging cutting-edge web technologies to provide a zero-setup, local-first coding experience. The project is currently in active development with a focus on production hardening, UX modernization, and AI capabilities.

The architecture prioritizes user privacy and data ownership by keeping code on the user's local machine while enabling powerful browser-based execution through WebContainers. With a clear roadmap and active development, Via-gent is positioned to become a compelling alternative to traditional IDEs and cloud-based development environments.

---

## Document References

| Document | Location | Purpose |
|----------|----------|---------|
| **Architecture** | [`architecture.md`](./architecture.md) | Detailed system architecture |
| **Data & Contracts** | [`data-and-contracts.md`](./data-and-contracts.md) | Data models and API contracts |
| **Tech Context** | [`tech-context.md`](./tech-context.md) | Technology stack details |
| **Tech Debt** | [`tech-debt.md`](./tech-debt.md) | Prioritized debt register |
| **Improvement Opportunities** | [`improvement-opportunities.md`](./improvement-opportunities.md) | Drift, smells, gaps analysis |
| **Roadmap** | [`roadmap-and-planning.md`](./roadmap-and-planning.md) | Remediation and innovation plan |

---

**Document Owners:** Architecture Team  
**Review Cycle:** Quarterly  
**Next Review:** 2025-03-23