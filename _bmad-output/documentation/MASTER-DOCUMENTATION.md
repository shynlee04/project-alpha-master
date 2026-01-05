# Project Alpha - Master Documentation Index

**Document ID:** `MASTER-DOC-2026-01-05`
**Version:** `1.0.0`
**Last Updated:** `2026-01-05`
**Status:** `STABLE`
**Languages:** `English` | `Vietnamese`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Documentation Structure](#documentation-structure)
3. [Domain Documentation](#domain-documentation)
4. [Architecture Overview](#architecture-overview)
5. [Technology Stack](#technology-stack)
6. [Development Guidelines](#development-guidelines)
7. [Quality Standards](#quality-standards)
8. [Navigation Guide](#navigation-guide)

---

## Executive Summary

This document serves as the master index for the comprehensive documentation package generated through the @_bmad/modules/deep-scan/ automated scanning process. The documentation covers all aspects of Project Alpha (Via-gent), a browser-based IDE with integrated AI agent capabilities.

### Key Metrics

| Metric | Value |
|--------|-------|
| **Total Source Files Scanned** | 1,190 |
| **Documentation Files Generated** | 82 |
| **Documentation Coverage** | 100% |
| **Languages** | English, Vietnamese |
| **Scan Date** | 2026-01-05 |

### Documentation Highlights

- **82 comprehensive documentation files** across 9 domain areas
- **Bilingual support** (English and Vietnamese) for all README files
- **Structured scan data** (JSON) for programmatic access
- **Detailed technical documentation** covering architecture, patterns, and implementations
- **Developer guides** with best practices and patterns

---

## Documentation Structure

```
_bmad-output/documentation/
├── 01-core-domain/              # Core business entities and types
│   ├── README.md               # English overview
│   ├── README-VI.md            # Vietnamese overview
│   ├── entities.md             # Entity documentation
│   ├── domain-services.md      # Service documentation
│   ├── architecture.md         # Architecture patterns
│   ├── scan-inventory.json     # Structured scan data
│   └── file-structure.txt      # Directory tree
│
├── 02-lib-domain/              # Framework libraries and utilities
│   ├── README.md
│   ├── README-VI.md
│   ├── agent-system.md         # AI agent ecosystem
│   ├── filesystem.md           # File system utilities
│   ├── webcontainer.md         # WebContainer integration
│   ├── architecture.md
│   ├── dependencies.md
│   └── scan-inventory.json
│
├── 03-presentation-domain/     # React components and UI
│   ├── README.md
│   ├── README-VI.md
│   ├── components.md           # Component documentation
│   ├── layouts.md              # Layout patterns
│   ├── pages.md                # Page documentation
│   ├── hooks.md                # Custom hooks
│   ├── i18n.md                 # Internationalization
│   ├── accessibility.md        # Accessibility patterns
│   └── scan-inventory.json
│
├── 04-infrastructure-domain/   # Persistence and infrastructure
│   ├── README.md
│   ├── README-VI.md
│   ├── persistence.md          # Database implementation
│   ├── events.md               # Event system
│   ├── storage-schemas.md      # Schema definitions
│   ├── migrations.md           # Data migrations
│   ├── security.md             # Security implementations
│   └── scan-inventory.json
│
├── 05-routes-domain/           # TanStack Router routes
│   ├── README.md
│   ├── README-VI.md
│   ├── routes.md               # Route documentation
│   ├── api-endpoints.md        # API specifications
│   ├── navigation.md           # Navigation patterns
│   ├── middleware.md           # Route guards
│   ├── error-handling.md       # Error patterns
│   └── scan-inventory.json
│
├── 06-shared-domain/           # Shared utilities and types
│   ├── README.md
│   ├── README-VI.md
│   ├── utilities.md            # Utility functions
│   ├── constants.md            # Constants
│   ├── shared-types.md         # Type definitions
│   └── scan-inventory.json
│
├── 07-tests-domain/            # Testing infrastructure
│   ├── README.md
│   ├── README-VI.md
│   ├── testing-patterns.md     # Testing patterns
│   ├── coverage.md             # Coverage analysis
│   ├── utilities.md            # Test utilities
│   ├── mocking.md              # Mocking strategies
│   └── scan-inventory.json
│
├── 08-config-domain/           # Configuration and styles
│   ├── README.md
│   ├── README-VI.md
│   ├── styling.md              # Styling system
│   ├── i18n.md                 # i18n configuration
│   ├── hooks.md                # Custom hooks
│   ├── build-config.md         # Build configuration
│   ├── environment.md          # Environment variables
│   └── scan-inventory.json
│
├── 09-public-assets/           # Static assets
│   ├── README.md
│   ├── README-VI.md
│   ├── assets.md               # Asset documentation
│   ├── manifests.md            # PWA manifests
│   ├── optimization.md         # Asset optimization
│   └── scan-inventory.json
│
├── scan-configuration.json     # Scan configuration
├── master-scan-index.json      # Master index data
└── MASTER-DOCUMENTATION.md     # This file
```

---

## Domain Documentation

### 1. Core Domain (`src/core`)

**Purpose:** Core business entities, domain services, and type definitions.

**Key Components:**
- **Entities:** Agent, LLMProvider, Conversation, Tool
- **Interfaces:** 22 interfaces defined
- **Types:** 10 type definitions

**Documentation Files:**
- `01-core-domain/README.md` - English overview
- `01-core-domain/README-VI.md` - Vietnamese overview
- `01-core-domain/entities.md` - Entity documentation
- `01-core-domain/architecture.md` - Architecture patterns

**Known Issues:**
- Duplicate `WorkspaceType` definition in Agent.ts and Tool.ts

---

### 2. Library Domain (`src/lib`)

**Purpose:** Framework libraries, agent systems, file system utilities.

**Key Components:**
- **12 major subsystems** including agent, filesystem, webcontainer, workspace
- **Architecture patterns:** Facade, Singleton, Store (Zustand), Event Emitter, Factory
- **Security:** AES-256-GCM credential encryption
- **Persistence:** Dexie IndexedDB

**Documentation Files:**
- `02-lib-domain/README.md` - English overview
- `02-lib-domain/README-VI.md` - Vietnamese overview
- `02-lib-domain/agent-system.md` - AI agent ecosystem
- `02-lib-domain/filesystem.md` - File system utilities
- `02-lib-domain/webcontainer.md` - WebContainer integration

---

### 3. Presentation Domain (`src/presentation`)

**Purpose:** React components, UI patterns, user interfaces.

**Key Components:**
- **479 TypeScript files** with 72,334 lines of code
- **43 component categories**
- **48 base UI components**
- **89 custom hooks** across 7 categories
- **i18n:** 387 components using translation

**Documentation Files:**
- `03-presentation-domain/README.md` - English overview
- `03-presentation-domain/README-VI.md` - Vietnamese overview
- `03-presentation-domain/components.md` - Component documentation
- `03-presentation-domain/hooks.md` - Custom hooks
- `03-presentation-domain/accessibility.md` - Accessibility patterns

---

### 4. Infrastructure Domain (`src/infrastructure`)

**Purpose:** Persistence, database, storage implementations.

**Key Components:**
- **248 TypeScript files** across 3 modules
- **21 database tables** with schema version 15
- **35+ event types** organized by domain
- **Security:** AES-256-GCM encryption

**Documentation Files:**
- `04-infrastructure-domain/README.md` - English overview
- `04-infrastructure-domain/README-VI.md` - Vietnamese overview
- `04-infrastructure-domain/persistence.md` - Database implementation
- `04-infrastructure-domain/storage-schemas.md` - Schema definitions
- `04-infrastructure-domain/security.md` - Security implementations

---

### 5. Routes Domain (`src/routes`)

**Purpose:** TanStack Router routes and API endpoints.

**Key Components:**
- **TanStack Router v1.144.0**
- **24 files** with ~1,650 lines
- **20 page routes** (8 lazy-loaded)
- **3 API endpoints**

**Documentation Files:**
- `05-routes-domain/README.md` - English overview
- `05-routes-domain/README-VI.md` - Vietnamese overview
- `05-routes-domain/routes.md` - Route documentation
- `05-routes-domain/api-endpoints.md` - API specifications

---

### 6. Shared Domain (`src/shared`)

**Purpose:** Shared utilities, constants, and type definitions.

**Key Components:**
- **1 active module** (types)
- **3 reserved modules** (constants, errors, utils)
- **8 exported types**

**Documentation Files:**
- `06-shared-domain/README.md` - English overview
- `06-shared-domain/README-VI.md` - Vietnamese overview
- `06-shared-domain/shared-types.md` - Type definitions

**Known Issues:**
- Shared types not imported anywhere in active codebase
- ValidationError duplicated in 4+ locations

---

### 7. Tests Domain (`src/__tests__`)

**Purpose:** Test files and testing utilities.

**Key Components:**
- **189 test files** with ~950 test cases
- **45% overall coverage**
- **Framework:** Vitest + @testing-library/react
- **Global setup:** `src/test/setup.ts` (222 lines)

**Documentation Files:**
- `07-tests-domain/README.md` - English overview
- `07-tests-domain/README-VI.md` - Vietnamese overview
- `07-tests-domain/testing-patterns.md` - Testing patterns
- `07-tests-domain/coverage.md` - Coverage analysis
- `07-tests-domain/mocking.md` - Mocking strategies

---

### 8. Configuration Domain (`src`)

**Purpose:** Configuration files, styles, and entry points.

**Key Components:**
- **1,161 translation keys**
- **17 hook files**
- **5 style files**
- **4 build targets** (Cloudflare, Netlify, Vercel, Node.js)

**Documentation Files:**
- `08-config-domain/README.md` - English overview
- `08-config-domain/README-VI.md` - Vietnamese overview
- `08-config-domain/styling.md` - Styling system
- `08-config-domain/i18n.md` - i18n configuration
- `08-config-domain/build-config.md` - Build configuration

---

### 9. Public Assets Domain (`public`)

**Purpose:** Static assets, manifests, and public resources.

**Key Components:**
- **12 assets** (320KB total)
- **Logos, icons, illustrations** in 8-bit style
- **PWA manifest** configured
- **Security headers** for WebContainer

**Documentation Files:**
- `09-public-assets/README.md` - English overview
- `09-public-assets/README-VI.md` - Vietnamese overview
- `09-public-assets/assets.md` - Asset documentation
- `09-public-assets/manifests.md` - PWA manifests

---

## Architecture Overview

### Layer Structure

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                  │
│         (src/presentation - React Components)        │
├─────────────────────────────────────────────────────┤
│                  LIBRARY LAYER                       │
│            (src/lib - Framework Libraries)           │
├─────────────────────────────────────────────────────┤
│                  CORE LAYER                          │
│           (src/core - Business Entities)             │
├─────────────────────────────────────────────────────┤
│              INFRASTRUCTURE LAYER                    │
│        (src/infrastructure - Persistence)            │
├─────────────────────────────────────────────────────┤
│                   ROUTES LAYER                       │
│            (src/routes - API & Routing)              │
└─────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| **Facade** | `src/lib/` | Abstraction over complex subsystems |
| **Singleton** | `src/lib/` | WebContainer manager, Event bus |
| **Store (Zustand)** | `src/lib/state/` | State management |
| **Event Emitter** | `src/lib/events/` | Cross-component communication |
| **Factory** | `src/lib/agent/` | Agent creation |
| **Repository** | `src/infrastructure/` | Data access layer |

---

## Technology Stack

### Core Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React | 19 | UI Library |
| **Language** | TypeScript | 5.7 | Type safety |
| **State Management** | Zustand | 5 | State containers |
| **Routing** | TanStack Router | 1.144 | File-based routing |
| **Database** | Dexie | 3 | IndexedDB wrapper |
| **Build Tool** | Vite | 7 | Development & build |
| **Testing** | Vitest | - | Unit testing |
| **Testing Library** | @testing-library/react | - | React testing |

### Key Libraries

| Library | Purpose |
|---------|---------|
| **WebContainer API** | Browser-based Node.js runtime |
| **Monaco Editor** | VS Code editor implementation |
| **i18next** | Internationalization |
| **Tailwind CSS** | Utility-first styling |
| **TanStack AI** | AI integration and streaming |
| **Orama** | Local-first vector search |

---

## Development Guidelines

### Project Structure

```
src/
├── core/           # Business entities and types
├── lib/            # Framework libraries
├── presentation/   # React components
├── infrastructure/ # Persistence layer
├── routes/         # API and routing
├── shared/         # Shared utilities
├── __tests__/      # Test files
├── styles/         # Global styles
├── hooks/          # Custom hooks
└── i18n/           # Translations
```

### Naming Conventions

| Category | Convention | Example |
|----------|------------|---------|
| **Files** | kebab-case | `agent-config-dialog.tsx` |
| **Components** | PascalCase | `AgentConfigDialog.tsx` |
| **Hooks** | camelCase | `useAgentFormState.ts` |
| **Utilities** | camelCase | `file-system-adapter.ts` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| **Types/Interfaces** | PascalCase | `AgentMetadata` |

### Code Quality Standards

1. **Component Size:** Max 300 lines per component
2. **Hook Size:** Max 150 lines per hook
3. **Function Size:** Max 50 lines per function
4. **File Size:** Max 400 lines per file
5. **Cyclomatic Complexity:** Max 10 per function
6. **Test Coverage:** Min 80% for critical paths

---

## Quality Standards

### Documentation Requirements

All documentation must meet the following standards:

#### Completeness
- [x] All public APIs documented
- [x] All exported interfaces defined
- [x] All known issues documented
- [x] All dependencies listed

#### Accuracy
- [x] Documentation reflects actual code behavior
- [x] Examples are functional
- [x] Version numbers are current

#### Consistency
- [x] Terminology is consistent
- [x] Formatting follows style guide
- [x] Naming conventions are followed

#### Accessibility
- [x] All documentation is bilingual (EN/VI)
- [x] Clear navigation structure
- [x] Searchable content

---

## Navigation Guide

### For New Developers

1. **Start with:** `MASTER-DOCUMENTATION.md` (this file)
2. **Architecture:** Read `02-lib-domain/architecture.md`
3. **Quick Start:** See project `README.md`
4. **Setup:** Follow `AGENTS.md` development guide

### For Experienced Developers

1. **API Reference:** See domain-specific `API.md` files
2. **Patterns:** Reference `*-patterns.md` files
3. **Migration:** See migration guides in each domain

### For Stakeholders

1. **Overview:** Executive Summary section
2. **Architecture:** Architecture Overview section
3. **Metrics:** See `master-scan-index.json`

### For DevOps

1. **Configuration:** See `08-config-domain/`
2. **Build:** See `08-config-domain/build-config.md`
3. **Environment:** See `08-config-domain/environment.md`

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-01-05 | Initial documentation generation | @bmad-deep-scan |

---

## Maintenance

### Update Schedule

- **Daily:** Scan results updated for changed files
- **Weekly:** Full scan with risk assessment
- **Monthly:** Documentation review and updates

### Issue Reporting

For documentation issues:
1. Check `master-scan-index.json` for domain owner
2. Open issue in project repository
3. Tag with `documentation` label

---

## Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Development workflow |
| `CLAUDE.md` | AI agent instructions |
| `README.md` | Project overview |
| `package.json` | Dependencies |

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/lib/` | Core libraries |
| `src/presentation/` | UI components |
| `src/infrastructure/` | Persistence |
| `_bmad/` | BMAD method artifacts |

---

**Document ID:** `MASTER-DOC-2026-01-05`
**Version:** `1.0.0`
**Last Updated:** `2026-01-05`
**Status:** `STABLE`

